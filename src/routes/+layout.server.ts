import type { LayoutServerLoad } from './$types';
import { getSessionUser, SESSION_COOKIE } from '#lib/auth';

export const load: LayoutServerLoad = ({ cookies }) => {
	return { user: getSessionUser(cookies.get(SESSION_COOKIE)) };
};
