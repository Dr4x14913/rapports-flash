// Seed initial : crée les comptes des élu(e)s depuis seed.json.
// (L’accès à la page d’administration se fait par mot de passe, défini au premier accès à /admin.)
// Usage : node scripts/seed.mjs   (ou SEED_FILE=... SEED_PATH=/data/app.db node scripts/seed.mjs)
import { existsSync, mkdirSync, readFileSync } from 'node:fs';
import path from 'node:path';
import Database from 'better-sqlite3';
import { hash as argon2Hash } from '@node-rs/argon2';

// Argon2id (valeur de l’enum Algorithm de @node-rs/argon2)
const ARGON2ID = 2;

const dbPath = process.env.DATABASE_PATH ?? path.join('data', 'app.db');
mkdirSync(path.dirname(dbPath), { recursive: true });
const db = new Database(dbPath);
db.pragma('foreign_keys = ON');
db.exec(readFileSync(path.resolve(process.cwd(), 'scripts', 'schema.sql'), 'utf8'));

const seedFile = process.env.SEED_FILE ?? 'seed.json';
if (!existsSync(seedFile)) {
	console.error(`Fichier de seed introuvable : ${seedFile}`);
	process.exit(1);
}
const seed = JSON.parse(readFileSync(seedFile, 'utf8'));

function slugify(name) {
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

async function ensureAccount(account) {
	if (!account || !account.email || !account.password) {
		console.warn(`Compte invalide ignoré : ${JSON.stringify(account)}`);
		return;
	}
	const email = account.email.toLowerCase();
	const existing = db.prepare('SELECT * FROM members WHERE email = ?').get(email);
	if (existing) {
		console.log(`= ${email} existe déjà (slug : ${existing.slug})`);
		return;
	}
	const passwordHash = await argon2Hash(account.password, { algorithm: ARGON2ID });
	const slug = slugify(account.full_name ?? email);
	db.prepare('INSERT INTO members (slug, full_name, email, password_hash) VALUES (?, ?, ?, ?)').run(
		slug,
		account.full_name ?? email,
		email,
		passwordHash
	);
	console.log(`+ créé : ${account.full_name} <${email}> (slug : ${slug})`);
}

for (const member of seed.members ?? []) await ensureAccount(member);

db.close();
console.log('Seed terminé.');
