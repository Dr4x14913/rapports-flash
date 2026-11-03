import { error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { hasAdminSession, ADMIN_SESSION_COOKIE } from '#lib/auth';
import { csvRows } from '#lib/db';
import { htmlToPlainText } from '#lib/sanitize';
import { isValidMonth } from '#lib/months';

function escapeCsv(value: string): string {
	const cleaned = (value ?? '').replace(/\r\n/g, '\n');
	return /[";\n]/.test(cleaned) ? `"${cleaned.replace(/"/g, '""')}"` : cleaned;
}

export const GET: RequestHandler = ({ url, cookies }) => {
	if (!hasAdminSession(cookies.get(ADMIN_SESSION_COOKIE)))
		error(403, { message: 'Réservé à l’administrateur.' });

	const monthParam = url.searchParams.get('mois');
	const month = monthParam ? (isValidMonth(monthParam) ? monthParam : error(400, { message: 'Mois invalide.' })) : undefined;

	const rows = csvRows(month);
	const header = ['elu', 'mois', 'actions_menes', 'actions_prevues', 'cooperations', 'projets'].join(';');
	const lines = rows.map((row) =>
		[
			row.full_name,
			row.month,
			htmlToPlainText(row.actions_done),
			htmlToPlainText(row.actions_planned),
			htmlToPlainText(row.cooperation),
			htmlToPlainText(row.projects)
		]
			.map(escapeCsv)
			.join(';')
	);
	const body = '\uFEFF' + [header, ...lines].join('\r\n') + '\r\n';
	const filename = month ? `rapports-flash-${month}.csv` : 'rapports-flash.csv';

	return new Response(body, {
		headers: {
			'content-type': 'text/csv; charset=utf-8',
			'content-disposition': `attachment; filename="${filename}"`
		}
	});
};
