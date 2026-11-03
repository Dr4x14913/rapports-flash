import { error, redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { isValidMonth } from '#lib/months';
import { reportsOfMember } from '#lib/db';

export const load: PageServerLoad = ({ url, locals }) => {
	const user = locals.user;
	if (!user) error(401, { message: 'Connexion requise.' });

	// Un mois choisi sur cette page : bascule directement vers le formulaire
	// (qui affiche l'édition si un rapport existe déjà pour ce mois).
	const monthNum = url.searchParams.get('mois');
	const yearParam = url.searchParams.get('annee');
	if (monthNum || yearParam) {
		const month = `${Number(yearParam) ?? 0}-${String(Number(monthNum) ?? 0).padStart(2, '0')}`;
		if (!isValidMonth(month)) error(404, { message: 'Mois invalide.' });
		redirect(303, `/rapport/${month}`);
	}

	const year = new Date().getFullYear();
	return {
		user,
		myReports: reportsOfMember(user.id),
		minYear: 2000,
		maxYear: year + 1
	};
};
