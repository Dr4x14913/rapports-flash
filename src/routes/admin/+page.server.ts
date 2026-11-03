import { fail, redirect } from '@sveltejs/kit';
import { z } from 'zod';
import type { Actions, PageServerLoad } from './$types';
import {
	ADMIN_SESSION_COOKIE,
	adminCookieOptions,
	checkAdminPassword,
	createAdminSession,
	hashPassword,
	hasAdminPassword,
	setAdminPassword
} from '#lib/auth';
import {
	allMembers,
	createMember,
	deleteMember,
	getFutureMonths,
	getMemberByEmail,
	getVisibleMonths,
	resetPassword,
	setActive,
	setFutureMonths,
	setVisibleMonths,
	updateMember
} from '#lib/db';

const createSchema = z.object({
	full_name: z.string().trim().min(2, 'Nom trop court.'),
	email: z
		.string()
		.trim()
		.toLowerCase()
		.regex(/^\S+@\S+\.\S+$/, 'E-mail invalide.'),
	password: z.string().min(8, 'Mot de passe : 8 caractères minimum.')
});

export const load: PageServerLoad = ({ locals }) => {
	return {
		members: allMembers(),
		passwordSet: hasAdminPassword(),
		admin: locals.isAdmin,
		visibleMonths: getVisibleMonths(3),
		futureMonths: getFutureMonths(1)
	};
};

export const actions: Actions = {
	// Premier accès : aucun mot de passe admin défini.
	setup: async ({ request, cookies, locals }) => {
		if (locals.isAdmin) return;
		if (hasAdminPassword()) return fail(400, { error: 'Un mot de passe d’administration existe déjà.' });
		const data = await request.formData();
		const password = (data.get('password') ?? '').toString();
		const confirm = (data.get('confirm') ?? '').toString();
		if (password.length < 8) return fail(400, { error: 'Mot de passe : 8 caractères minimum.' });
		if (password !== confirm) return fail(400, { error: 'La confirmation ne correspond pas au mot de passe.' });
		await setAdminPassword(password);
		cookies.set(ADMIN_SESSION_COOKIE, createAdminSession(), adminCookieOptions);
		locals.isAdmin = true;
		return { flash: 'Mot de passe d’administration défini.' };
	},

	login: async ({ request, cookies, locals }) => {
		if (locals.isAdmin) return;
		const data = await request.formData();
		const password = (data.get('password') ?? '').toString();
		if (!password) return fail(400, { error: 'Indiquez le mot de passe d’administration.' });
		if (!(await checkAdminPassword(password))) {
			return fail(401, { error: 'Mot de passe incorrect.' });
		}
		cookies.set(ADMIN_SESSION_COOKIE, createAdminSession(), adminCookieOptions);
		locals.isAdmin = true;
	},

	logout: async ({ cookies }) => {
		cookies.delete(ADMIN_SESSION_COOKIE, { path: '/' });
		redirect(303, '/');
	},

	create: async ({ request, locals }) => {
		if (!locals.isAdmin) return fail(403, { error: 'Réservé à l’administrateur.' });
		const data = await request.formData();
		const parsed = createSchema.safeParse({
			full_name: data.get('full_name'),
			email: data.get('email'),
			password: data.get('password')
		});
		if (!parsed.success) {
			return fail(400, {
				error: parsed.error.issues.map((issue) => issue.message).join(' ')
			});
		}
		const { full_name, email, password } = parsed.data;
		if (getMemberByEmail(email)) {
			return fail(400, { error: 'Un compte existe déjà avec cet e-mail.', values: { full_name, email } });
		}
		const passwordHash = await hashPassword(password);
		createMember({ full_name, email, passwordHash });
		return { flash: `Compte créé pour ${full_name} — transmettez-lui l’adresse du site et le mot de passe initial.` };
	},

	'reset-password': async ({ request, locals }) => {
		if (!locals.isAdmin) return fail(403, { error: 'Réservé à l’administrateur.' });
		const data = await request.formData();
		const memberId = Number(data.get('member_id'));
		const newPassword = (data.get('new_password') ?? '').toString();
		if (!memberId || newPassword.length < 8) {
			return fail(400, { error: 'Mot de passe : 8 caractères minimum.' });
		}
		resetPassword(memberId, await hashPassword(newPassword));
		return { flash: 'Mot de passe réinitialisé.' };
	},

	'toggle-active': async ({ request, locals }) => {
		if (!locals.isAdmin) return fail(403, { error: 'Réservé à l’administrateur.' });
		const data = await request.formData();
		const memberId = Number(data.get('member_id'));
		const active = data.get('action') === 'activate';
		setActive(memberId, active);
		return { flash: active ? 'Compte réactivé.' : 'Compte désactivé (ses rapports restent consultables).' };
	},

	update: async ({ request, locals }) => {
		if (!locals.isAdmin) return fail(403, { error: 'Réservé à l’administrateur.' });
		const data = await request.formData();
		const memberId = Number(data.get('member_id'));
		const fullName = (data.get('full_name') ?? '').toString().trim();
		const email = (data.get('email') ?? '').toString().trim().toLowerCase();
		if (fullName.length < 2) return fail(400, { error: 'Nom trop court.' });
		if (!/^\S+@\S+\.\S+$/.test(email)) return fail(400, { error: 'E-mail invalide.' });
		const existing = getMemberByEmail(email);
		if (existing && existing.id !== memberId) {
			return fail(400, { error: 'Un autre compte existe déjà avec cet e-mail.' });
		}
		updateMember(memberId, { full_name: fullName, email });
		return { flash: `Compte modifié : ${fullName}.` };
	},

	'set-months': async ({ request, locals }) => {
		if (!locals.isAdmin) return fail(403, { error: 'Réservé à l’administrateur.' });
		const data = await request.formData();
		const count = Number(data.get('months_count'));
		const futureCount = Number(data.get('future_months_count'));
		if (!Number.isInteger(count) || count < 1 || count > 24) {
			return fail(400, {
				error: 'Nombre de mois passés : un entier entre 1 et 24.',
				values: { months_count: String(count), future_months_count: String(futureCount) }
			});
		}
		if (!Number.isInteger(futureCount) || futureCount < 0 || futureCount > 12) {
			return fail(400, {
				error: 'Nombre de mois futurs : un entier entre 0 et 12.',
				values: { months_count: String(count), future_months_count: String(futureCount) }
			});
		}
		setVisibleMonths(count);
		setFutureMonths(futureCount);
		return { flash: `La page d’accueil affiche désormais ${count} mois passé${count > 1 ? 's' : ''} et ${futureCount} mois futur${futureCount > 1 ? 's' : ''}.` };
	},

	delete: async ({ request, locals }) => {
		if (!locals.isAdmin) return fail(403, { error: 'Réservé à l’administrateur.' });
		const data = await request.formData();
		const memberId = Number(data.get('member_id'));
		const member = allMembers().find((row) => row.id === memberId);
		if (!member) return fail(404, { error: 'Membre introuvable.' });
		if (member.is_active === 1) {
			return fail(400, { error: 'Désactivez d’abord le compte avant de pouvoir le supprimer.' });
		}
		deleteMember(memberId);
		return { flash: `Compte de ${member.full_name} supprimé — ses rapports restent conservés.` };
	}
};
