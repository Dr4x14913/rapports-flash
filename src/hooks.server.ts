import { error, redirect } from '@sveltejs/kit';
import type { RequestEvent } from '@sveltejs/kit';
import { ADMIN_SESSION_COOKIE, getSessionUser, hasAdminSession, SESSION_COOKIE } from '#lib/auth';

/** Les statiques (favicon, images) ne nécessitent pas de session. */
function isStaticAsset(pathname: string): boolean {
	if (pathname === '/favicon.svg' || pathname === '/robots.txt') return true;
	const last = pathname.split('/').pop() ?? '';
	return /\.[a-z0-9]+$/i.test(last) && pathname !== '/admin/export.csv';
}

export const handle = async ({
	event,
	resolve
}: {
	event: RequestEvent;
	resolve: (event: RequestEvent) => Promise<Response>;
}) => {
	const user = getSessionUser(event.cookies.get(SESSION_COOKIE));
	const isAdmin = hasAdminSession(event.cookies.get(ADMIN_SESSION_COOKIE));
	event.locals.user = user;
	event.locals.isAdmin = isAdmin;
	const pathname = event.url.pathname;
	const isAdminRoute = pathname === '/admin' || pathname.startsWith('/admin/');

	if (isAdminRoute) {
		// L’export exige une session admin valide ; la page /admin affiche
		// elle-même le formulaire de mot de passe (ou d’initialisation).
		if (pathname !== '/admin' && !isAdmin) error(403, { message: 'Réservé à l’administrateur.' });
	} else if (!user) {
		if (pathname !== '/connexion' && !isStaticAsset(pathname)) {
			redirect(303, '/connexion');
		}
	} else if (pathname === '/connexion') {
		redirect(303, '/');
	}

	return resolve(event);
};
