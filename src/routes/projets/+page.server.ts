import type { PageServerLoad } from './$types';
import { currentMonth, formMonths, isValidMonth } from '#lib/months';
import { projectsByMonth } from '#lib/db';

export const load: PageServerLoad = ({ url }) => {
	const requested = url.searchParams.get('mois');
	const month = requested && isValidMonth(requested) ? requested : currentMonth();
	return { month, months: formMonths(), projects: projectsByMonth(month) };
};
