import type { PageServerLoad } from './$types';
import { getFutureMonths, getVisibleMonths, monthSummaries } from '#lib/db';

export const load: PageServerLoad = () => {
	return { summary: monthSummaries(getVisibleMonths(3), getFutureMonths(1)) };
};
