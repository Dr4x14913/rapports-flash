import { error, fail, redirect } from '@sveltejs/kit';
import { z } from 'zod';
import type { Actions, PageServerLoad } from './$types';
import { isTooOldToEdit, isValidMonth } from '#lib/months';
import { htmlToText, sanitizeHtml } from '#lib/sanitize';
import { getReport, upsertReport } from '#lib/db';

const MAX = 5000;

// Champ texte riche : on nettoie le HTML puis on valide sur le texte visible
// (les balises de mise en forme ne comptent pas dans la limite).
function reportField(label: string, required: boolean) {
	return z
		.string()
		.transform(sanitizeHtml)
		.refine(
			(value) => !required || htmlToText(value).trim().length > 0,
			`${label} est un champ obligatoire.`
		)
		.refine(
			(value) => htmlToText(value).length <= MAX,
			`5 000 caractères maximum par champ.`
		);
}

const reportSchema = z.object({
	mois: z.string().regex(/^\d{4}-(0[1-9]|1[0-2])$/, 'Mois invalide.'),
	actions_menes: reportField('« Mes principales actions menées »', true),
	actions_prevues: reportField('« Mes principales actions et réunions prévues »', true),
	cooperations: reportField('« Les élus, citoyens-partenaires et citoyens avec lesquels je travaille »', false),
	projets: reportField('« Les projets que je souhaite débattre en Conseil informel »', false)
});

export const load: PageServerLoad = ({ params, url, locals }) => {
	const month = params['annee-mois'] ?? '';
	if (!isValidMonth(month)) error(404, { message: 'Mois invalide.' });
	const user = locals.user;
	if (!user) error(401, { message: 'Connexion requise.' });
	return {
		user,
		month,
		tooOld: isTooOldToEdit(month),
		existing: getReport(user.id, month),
		sent: url.searchParams.get('envoye') === '1'
	};
};

export const actions: Actions = {
	default: async ({ request, locals }) => {
		const user = locals.user;
		if (!user) error(401, { message: 'Connexion requise.' });

		const data = Object.fromEntries(await request.formData());
		const parsed = reportSchema.safeParse(data);
		if (!parsed.success) {
			return fail(400, {
				error: parsed.error.issues.map((issue) => issue.message).join(' '),
				values: {
					mois: (data.mois as string) ?? '',
					actions_menes: sanitizeHtml((data.actions_menes as string) ?? ''),
					actions_prevues: sanitizeHtml((data.actions_prevues as string) ?? ''),
					cooperations: sanitizeHtml((data.cooperations as string) ?? ''),
					projets: sanitizeHtml((data.projets as string) ?? '')
				}
			});
		}

		const { mois, actions_menes, actions_prevues, cooperations, projets } = parsed.data;
		if (isTooOldToEdit(mois)) {
			return fail(400, {
				error: 'Ce rapport est trop ancien (plus de 3 mois) : il ne peut plus \u00eatre cr\u00e9\u00e9 ou modifi\u00e9.',
				values: data as Record<string, string>
			});
		}
		upsertReport(user.id, mois, {
			actions_done: actions_menes,
			actions_planned: actions_prevues,
			cooperation: cooperations,
			projects: projets
		});

		redirect(303, `/rapport/${mois}?envoye=1`);
	}
};
