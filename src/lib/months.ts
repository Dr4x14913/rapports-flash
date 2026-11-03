const MONTH_RE = /^\d{4}-(0[1-9]|1[0-2])$/;

export function isValidMonth(month: string): boolean {
	return MONTH_RE.test(month);
}

export function currentMonth(): string {
	const now = new Date();
	return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
}

/** Décale un mois 'YYYY-MM' de `delta` mois (négatif = passé). */
export function shiftMonth(month: string, delta: number): string {
	const [year, mo] = month.split('-').map(Number);
	const d = new Date(year, mo - 1 + delta, 1);
	return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
}

/** Les `count` derniers mois (du plus récent au plus ancien, mois courant inclus). */
export function recentMonths(count: number): string[] {
	const months: string[] = [];
	for (let i = 0; i < count; i++) months.push(shiftMonth(currentMonth(), -i));
	return months;
}

/** Choix du formulaire : mois courant + 12 mois précédents (13 au total). */
export function formMonths(): string[] {
	return recentMonths(13);
}

/** Vrai si `month` ('YYYY-MM') est antérieur de plus de 3 mois au mois courant. */
export function isTooOldToEdit(month: string): boolean {
	return month < shiftMonth(currentMonth(), -3);
}

/** Les 12 noms de mois en français, index 0 = janvier. */
export function monthNames(): string[] {
	const formatter = new Intl.DateTimeFormat('fr-FR', { month: 'long', timeZone: 'UTC' });
	return Array.from({ length: 12 }, (_, index) => {
		const label = formatter.format(Date.UTC(2000, index, 1));
		return label.charAt(0).toUpperCase() + label.slice(1);
	});
}

/** Libellé lisible : « octobre 2026 ». */
export function monthLabel(month: string): string {
	const [year, mo] = month.split('-').map(Number);
	const label = new Intl.DateTimeFormat('fr-FR', {
		month: 'long',
		year: 'numeric',
		timeZone: 'UTC'
	}).format(new Date(Date.UTC(year, mo - 1, 1)));
	return label.charAt(0).toUpperCase() + label.slice(1);
}

/** Date « jj/mm/aaaa hh:mm » à partir d'une date SQLite 'YYYY-MM-DD HH:MM:SS'. */
export function formatDate(sqliteDate: string): string {
	const [date, time] = sqliteDate.split(' ');
	const parts = date.split('-');
	const dayMonth = parts.length === 3 ? `${parts[2]}/${parts[1]}/${parts[0]}` : date;
	return time ? `${dayMonth} ${time.slice(0, 5)}` : dayMonth;
}
