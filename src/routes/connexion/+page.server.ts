import { redirect } from '@sveltejs/kit';
import type { Actions } from './$types';
import { cookieOptions, createSession, SESSION_COOKIE } from '#lib/auth';
import { checkPassword } from '#lib/auth';
import { getMemberByEmail } from '#lib/db';

export const actions: Actions = {
	default: async ({ request, cookies, locals }) => {
		if (locals.user) redirect(303, '/');
		const data = await request.formData();
		const email = (data.get('email') ?? '').toString().trim().toLowerCase();
		const password = (data.get('password') ?? '').toString();

		if (!email || !password) {
			return { error: 'Indiquez votre e-mail et votre mot de passe.' };
		}

		const member = getMemberByEmail(email);
		const ok =
			member !== undefined &&
			member.is_active === 1 &&
			(await checkPassword(member.password_hash, password));
		if (!ok || !member) {
			return { error: 'Identifiants incorrects.' };
		}

		cookies.set(SESSION_COOKIE, createSession(member.id), cookieOptions);
		redirect(303, '/');
	}
};
