import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { isValidMonth } from '#lib/months';
import { activeMembers, reportsByMonth } from '#lib/db';

export const load: PageServerLoad = ({ params }) => {
	const month = params['annee-mois'] ?? '';
	if (!isValidMonth(month)) error(404, { message: 'Mois invalide.' });
	const reports = reportsByMonth(month);
	const members = activeMembers();
	const submittedSlugs = new Set(reports.map((report) => report.slug));
	const missing = members.filter((member) => !submittedSlugs.has(member.slug));
	return { month, reports, missing };
};
