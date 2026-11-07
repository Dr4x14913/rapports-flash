import type { LayoutServerLoad } from './$types';
import { getSessionUser, SESSION_COOKIE } from '#lib/auth';
import { getLogo, getLogoHue } from '#lib/db';

export const load: LayoutServerLoad = ({ cookies }) => {
	return {
		user: getSessionUser(cookies.get(SESSION_COOKIE)),
		// Data URI du logo personnalisé (admin) ; null = logo par défaut /logo.svg.
		logo: getLogo() ?? null,
		// Teinte dominante du logo : pilote le thème de couleurs (var --brand-*).
		logoHue: getLogoHue()
	};
};
