import { redirect } from '@sveltejs/kit';
import type { Actions } from './$types';
import { destroySession, SESSION_COOKIE } from '#lib/auth';

export const actions: Actions = {
	default: ({ cookies }) => {
		destroySession(cookies.get(SESSION_COOKIE));
		cookies.delete(SESSION_COOKIE, { path: '/' });
		redirect(303, '/connexion');
	}
};
