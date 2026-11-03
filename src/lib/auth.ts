import { createHmac, randomBytes } from 'node:crypto';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { hash as argon2Hash, verify as argon2Verify } from '@node-rs/argon2';

/** Argon2id (valeur de l’enum Algorithm de @node-rs/argon2). */
const ARGON2ID = 2 as const;
import { getSetting, setSetting, db } from './db';
import type { PublicUser } from './types';

export const SESSION_COOKIE = 'session';
export const SESSION_TTL_DAYS = 30;
export const ADMIN_SESSION_COOKIE = 'admin_session';
export const ADMIN_SESSION_TTL_HOURS = 12;

// ---------- Mot de passe (argon2id) ----------

export function hashPassword(password: string): Promise<string> {
	return argon2Hash(password, { algorithm: ARGON2ID });
}

export async function checkPassword(hash: string, password: string): Promise<boolean> {
	try {
		return await argon2Verify(hash, password);
	} catch {
		return false;
	}
}

// ---------- Mot de passe d’administration (indépendant des comptes) ----------

const ADMIN_PASSWORD_KEY = 'admin_password_hash';

export function hasAdminPassword(): boolean {
	return getSetting(ADMIN_PASSWORD_KEY) !== undefined;
}

export async function setAdminPassword(password: string): Promise<void> {
	setSetting(ADMIN_PASSWORD_KEY, await hashPassword(password));
}

export function checkAdminPassword(password: string): Promise<boolean> {
	const hash = getSetting(ADMIN_PASSWORD_KEY);
	if (!hash) return Promise.resolve(false);
	return checkPassword(hash, password);
}

// ---------- Secret de signature ----------

function loadSecret(): string {
	const file = process.env.SESSION_SECRET_FILE ?? path.join('data', 'session-secret');
	if (existsSync(file)) return readFileSync(file, 'utf8').trim();
	const secret = process.env.SESSION_SECRET ?? randomBytes(32).toString('hex');
	mkdirSync(path.dirname(file), { recursive: true });
	writeFileSync(file, secret, { mode: 0o600 });
	return secret;
}

const secret = loadSecret();

// ---------- Sessions ----------

function nowSql(): string {
	return new Date().toISOString().slice(0, 19).replace('T', ' ');
}

/** Crée une session en base et renvoie la valeur du cookie (token signé). */
export function createSession(memberId: number): string {
	const token = randomBytes(32).toString('hex');
	const expiresAt = new Date(Date.now() + SESSION_TTL_DAYS * 86_400_000)
		.toISOString()
		.slice(0, 19)
		.replace('T', ' ');
	db.prepare('INSERT INTO sessions (token, member_id, expires_at) VALUES (?, ?, ?)').run(token, memberId, expiresAt);
	return signToken(token);
}

function signToken(token: string): string {
	const signature = createHmac('sha256', secret).update(token).digest('hex');
	return `${token}.${signature}`;
}

export function verifyToken(cookieValue: string | undefined): string | null {
	if (!cookieValue) return null;
	const dot = cookieValue.indexOf('.');
	if (dot <= 0) return null;
	const token = cookieValue.slice(0, dot);
	if (signToken(token) !== cookieValue) return null;
	return token;
}

export function getSessionUser(cookieValue: string | undefined): PublicUser | null {
	const token = verifyToken(cookieValue);
	if (!token) return null;
	const row = db
		.prepare(
			`SELECT m.id, m.slug, m.full_name, m.email, s.expires_at
			 FROM sessions s JOIN members m ON m.id = s.member_id
			 WHERE s.token = ?`
		)
		.get(token) as
		| { id: number; slug: string; full_name: string; email: string; expires_at: string }
		| undefined;
	if (!row) return null;
	if (row.expires_at < nowSql()) {
		db.prepare('DELETE FROM sessions WHERE token = ?').run(token);
		return null;
	}
	return { id: row.id, slug: row.slug, full_name: row.full_name, email: row.email };
}

// ---------- Session d’administration (token signé, sans compte associé) ----------

function adminSignature(payload: string): string {
	return createHmac('sha256', `${secret}:admin`).update(payload).digest('hex');
}

/** Renvoie la valeur du cookie de session admin (expire au bout de 12 h). */
export function createAdminSession(): string {
	const expiresAt = Date.now() + ADMIN_SESSION_TTL_HOURS * 3_600_000;
	const payload = String(expiresAt);
	return `${payload}.${adminSignature(payload)}`;
}

export function hasAdminSession(cookieValue: string | undefined): boolean {
	if (!cookieValue) return false;
	const dot = cookieValue.lastIndexOf('.');
	if (dot <= 0) return false;
	const payload = cookieValue.slice(0, dot);
	if (!/^[0-9]+$/.test(payload) || adminSignature(payload) !== cookieValue.slice(dot + 1)) return false;
	return Number(payload) >= Date.now();
}

export function destroySession(cookieValue: string | undefined): void {
	const token = verifyToken(cookieValue);
	if (!token) return;
	db.prepare('DELETE FROM sessions WHERE token = ?').run(token);
}

export const adminCookieOptions = {
	path: '/',
	httpOnly: true,
	sameSite: 'lax' as const,
	maxAge: ADMIN_SESSION_TTL_HOURS * 3_600,
	secure: process.env.COOKIE_SECURE === '1'
};

export const cookieOptions = {
	path: '/',
	httpOnly: true,
	sameSite: 'lax' as const,
	maxAge: SESSION_TTL_DAYS * 86_400,
	secure: process.env.COOKIE_SECURE === '1'
};
