import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { getMemberBySlug, reportsOfMember } from '#lib/db';

export const load: PageServerLoad = ({ params }) => {
	const slug = params.slug ?? '';
	const member = getMemberBySlug(slug);
	if (!member) error(404, { message: 'Élu(e) introuvable.' });
	return {
		member: {
			id: member.id,
			slug: member.slug,
			full_name: member.full_name,
			email: member.email
		},
		reports: reportsOfMember(member.id)
	};
};
