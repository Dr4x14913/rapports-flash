import { existsSync, mkdirSync, readFileSync } from 'node:fs';
import path from 'node:path';
import Database from 'better-sqlite3';
import type { MemberReport, MemberRow, PublicUser, Report } from './types';

const dbPath = process.env.DATABASE_PATH ?? path.join('data', 'app.db');
mkdirSync(path.dirname(dbPath), { recursive: true });

export const db = new Database(dbPath);
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');
db.exec(readFileSync(path.resolve(process.cwd(), 'scripts', 'schema.sql'), 'utf8'));

// Migration : ajout de la colonne is_deleted (bascule de suppression en "tombstone"
// pour conserver les rapports des membres supprimés).
const memberColumns = db.prepare('PRAGMA table_info(members)').all() as { name: string }[];
if (!memberColumns.some((column) => column.name === 'is_deleted')) {
	db.exec('ALTER TABLE members ADD COLUMN is_deleted INTEGER NOT NULL DEFAULT 0');
}

function nowSql(): string {
	return new Date().toISOString().slice(0, 19).replace('T', ' ');
}

// ---------- Membres ----------

export function getMemberByEmail(email: string): MemberRow | undefined {
	return db.prepare('SELECT * FROM members WHERE email = ? AND is_deleted = 0').get(email.toLowerCase()) as
		| MemberRow
		| undefined;
}

export function getMemberBySlug(slug: string): MemberRow | undefined {
	return db.prepare('SELECT * FROM members WHERE slug = ?').get(slug) as MemberRow | undefined;
}

export function activeMembers(): PublicUser[] {
	return db
		.prepare('SELECT id, slug, full_name, email FROM members WHERE is_active = 1 ORDER BY full_name')
		.all() as PublicUser[];
}

export function allMembers(): MemberRow[] {
	return db.prepare('SELECT * FROM members WHERE is_deleted = 0 ORDER BY full_name').all() as MemberRow[];
}

export function memberSummary(): (PublicUser & { last_month: string | null; last_updated: string | null })[] {
	const rows = db
		.prepare(
			`SELECT m.id, m.slug, m.full_name, m.email,
			        (SELECT r.month FROM reports r WHERE r.member_id = m.id ORDER BY r.month DESC LIMIT 1) AS last_month,
			        (SELECT r.updated_at FROM reports r WHERE r.member_id = m.id ORDER BY r.month DESC LIMIT 1) AS last_updated
			 FROM members m
			 WHERE m.is_active = 1
			 ORDER BY m.full_name`
		)
		.all() as (PublicUser & { last_month: string | null; last_updated: string | null })[];
	return rows;
}

function slugify(name: string): string {
	const base =
		name
			.toLowerCase()
			.normalize('NFD')
			.replace(/[\u0300-\u036f]/g, '')
			.replace(/[^a-z0-9]+/g, '-')
			.replace(/^-+|-+$/g, '') || 'elu';
	let slug = base;
	let counter = 2;
	while (db.prepare('SELECT 1 FROM members WHERE slug = ?').get(slug)) slug = `${base}-${counter++}`;
	return slug;
}

export function createMember(input: { full_name: string; email: string; passwordHash: string }): number {
	const slug = slugify(input.full_name);
	const result = db
		.prepare('INSERT INTO members (slug, full_name, email, password_hash) VALUES (?, ?, ?, ?)')
		.run(slug, input.full_name, input.email.toLowerCase(), input.passwordHash);
	return Number(result.lastInsertRowid);
}

export function resetPassword(memberId: number, passwordHash: string): void {
	db.prepare('UPDATE members SET password_hash = ? WHERE id = ?').run(passwordHash, memberId);
}

export function setActive(memberId: number, active: boolean): void {
	db.prepare('UPDATE members SET is_active = ? WHERE id = ?').run(active ? 1 : 0, memberId);
	if (active) return;
	db.prepare('DELETE FROM sessions WHERE member_id = ?').run(memberId);
}

export function updateMember(memberId: number, fields: { full_name: string; email: string }): void {
	db.prepare('UPDATE members SET full_name = ?, email = ? WHERE id = ? AND is_deleted = 0').run(
		fields.full_name,
		fields.email.toLowerCase(),
		memberId
	);
}

// Suppression "tombstone" : la ligne membre est conservée (ses rapports restent
// liés et exportables), mais elle disparaît de tous les listings et son
// e-mail/slug sont libérés pour réutilisation.
export function deleteMember(memberId: number): void {
	const stamp = Date.now();
	db
		.prepare(
			'UPDATE members SET is_deleted = 1, is_active = 0, email = ?, slug = ? WHERE id = ? AND is_deleted = 0'
		)
		.run(`supprime-${memberId}-${stamp}@local.invalid`, `supprime-${memberId}-${stamp}`, memberId);
	db.prepare('DELETE FROM sessions WHERE member_id = ?').run(memberId);
}

// ---------- Rapports ----------

export function getReport(memberId: number, month: string): Report | undefined {
	return db.prepare('SELECT * FROM reports WHERE member_id = ? AND month = ?').get(memberId, month) as
		| Report
		| undefined;
}

export function upsertReport(
	memberId: number,
	month: string,
	fields: Pick<Report, 'actions_done' | 'actions_planned' | 'cooperation' | 'projects'>
): void {
	const now = nowSql();
	db.prepare(
		`INSERT INTO reports (member_id, month, actions_done, actions_planned, cooperation, projects, created_at, updated_at)
		 VALUES (?, ?, ?, ?, ?, ?, ?, ?)
		 ON CONFLICT (member_id, month) DO UPDATE SET
		   actions_done = excluded.actions_done,
		   actions_planned = excluded.actions_planned,
		   cooperation = excluded.cooperation,
		   projects = excluded.projects,
		   updated_at = excluded.updated_at`
	).run(memberId, month, fields.actions_done, fields.actions_planned, fields.cooperation, fields.projects, now, now);
}

export function reportsByMonth(month: string): MemberReport[] {
	return db
		.prepare(
			`SELECT r.*, m.full_name, m.slug
			 FROM reports r JOIN members m ON m.id = r.member_id
			 WHERE r.month = ?
			 ORDER BY m.full_name`
		)
		.all(month) as MemberReport[];
}

export function reportsOfMember(memberId: number): Report[] {
	return db.prepare('SELECT * FROM reports WHERE member_id = ? ORDER BY month DESC').all(memberId) as Report[];
}

export function projectsByMonth(month: string): MemberReport[] {
	return db
		.prepare(
			`SELECT r.*, m.full_name, m.slug
			 FROM reports r JOIN members m ON m.id = r.member_id
			 WHERE r.month = ? AND r.projects <> ''
			 ORDER BY m.full_name`
		)
		.all(month) as MemberReport[];
}

export function countReportsByMonth(month: string): number {
	const row = db.prepare('SELECT COUNT(*) AS n FROM reports WHERE month = ?').get(month) as { n: number };
	return row.n;
}

export function monthSummaries(count = 12, futureCount = 0): { month: string; expected: number; submitted: number }[] {
	const expected = activeMembers().length;
	const months: string[] = [];
	const first = new Date();
	for (let i = count - 1; i >= -futureCount; i--) {
		const d = new Date(first.getFullYear(), first.getMonth() - i, 1);
		months.push(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`);
	}
	return months.map((month) => ({ month, expected, submitted: countReportsByMonth(month) }));
}

// ---------- Export CSV ----------

export function csvRows(month?: string): MemberReport[] {
	const rows = month
		? db
				.prepare(
					`SELECT r.*, m.full_name, m.slug
					 FROM reports r JOIN members m ON m.id = r.member_id
					 WHERE r.month = ? ORDER BY m.full_name`
				)
				.all(month)
		: db
				.prepare(
					`SELECT r.*, m.full_name, m.slug
					 FROM reports r JOIN members m ON m.id = r.member_id
					 ORDER BY r.month, m.full_name`
				)
				.all();
	return rows as MemberReport[];
}

// ---------- Paramètres globaux (mot de passe admin) ----------

export function getSetting(key: string): string | undefined {
	const row = db.prepare('SELECT value FROM settings WHERE key = ?').get(key) as
		| { value: string }
		| undefined;
	return row?.value;
}

export function setSetting(key: string, value: string): void {
	db
		.prepare('INSERT INTO settings (key, value) VALUES (?, ?) ON CONFLICT (key) DO UPDATE SET value = excluded.value')
		.run(key, value);
}

/** Nombre de mois affichés sur la page d'accueil (défaut : 3, borné entre 1 et 24). */
export function getVisibleMonths(defaultValue = 3): number {
	const raw = Number(getSetting('visible_months'));
	return Number.isInteger(raw) && raw >= 1 && raw <= 24 ? raw : defaultValue;
}

export function setVisibleMonths(count: number): void {
	setSetting('visible_months', String(count));
}

/** Nombre de mois futurs affichés sur la page d'accueil (défaut : 1, borné entre 0 et 12). */
export function getFutureMonths(defaultValue = 1): number {
	const raw = Number(getSetting('future_months'));
	return Number.isInteger(raw) && raw >= 0 && raw <= 12 ? raw : defaultValue;
}

export function setFutureMonths(count: number): void {
	setSetting('future_months', String(count));
}

export function hasData(): boolean {
	const row = db.prepare('SELECT 1 FROM members LIMIT 1').get();
	return existsSync(dbPath) && Boolean(row);
}
