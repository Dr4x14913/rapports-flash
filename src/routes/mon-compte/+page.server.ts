import { error, fail } from '@sveltejs/kit';
import { z } from 'zod';
import type { Actions, PageServerLoad } from './$types';
import { checkPassword, hashPassword } from '#lib/auth';
import { getMemberBySlug, resetPassword } from '#lib/db';

const passwordSchema = z
	.object({
		current_password: z.string().min(1, 'Indiquez votre mot de passe actuel.'),
		new_password: z.string().min(8, 'Nouveau mot de passe : 8 caractères minimum.'),
		confirm_password: z.string().min(1, 'Confirmez le nouveau mot de passe.')
	})
	.refine((data) => data.new_password === data.confirm_password, {
		message: 'La confirmation ne correspond pas au nouveau mot de passe.',
		path: ['confirm_password']
	});

export const load: PageServerLoad = ({ locals }) => {
	const user = locals.user;
	if (!user) error(401, { message: 'Connexion requise.' });
	return { user };
};

export const actions: Actions = {
	default: async ({ request, locals }) => {
		const user = locals.user;
		if (!user) error(401, { message: 'Connexion requise.' });

		const data = Object.fromEntries(await request.formData());
		const parsed = passwordSchema.safeParse(data);
		if (!parsed.success) {
			return fail(400, { error: parsed.error.issues.map((issue) => issue.message).join(' ') });
		}

		const member = getMemberBySlug(user.slug);
		if (!member) error(401, { message: 'Connexion requise.' });

		const ok = await checkPassword(member.password_hash, parsed.data.current_password);
		if (!ok) return fail(400, { error: 'Mot de passe actuel incorrect.' });

		resetPassword(member.id, await hashPassword(parsed.data.new_password));
		return { success: true };
	}
};
