import type { PageServerLoad } from './$types';
import { memberSummary } from '#lib/db';

export const load: PageServerLoad = () => {
	return { members: memberSummary() };
};
