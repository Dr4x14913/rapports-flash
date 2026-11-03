// Sauvegarde de la base SQLite (retention 14 jours).
// Usage (hôte, quotidien via cron) :
//   docker compose exec app node scripts/backup.mjs
import { mkdirSync, readdirSync, statSync, unlinkSync } from 'node:fs';
import path from 'node:path';
import Database from 'better-sqlite3';

const dbPath = process.env.DATABASE_PATH ?? path.join('data', 'app.db');
const backupDir = process.env.BACKUP_DIR ?? path.join('data', 'backups');
const retentionDays = Number(process.env.BACKUP_RETENTION_DAYS ?? 14);

mkdirSync(backupDir, { recursive: true });

const source = new Database(dbPath, { readonly: true });
const stamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
const destination = path.join(backupDir, `app-${stamp}.sqlite`);
await source.backup(destination);
source.close();
console.log(`Sauvegarde : ${destination}`);

for (const file of readdirSync(backupDir)) {
	if (!file.startsWith('app-')) continue;
	const full = path.join(backupDir, file);
	const ageMs = Date.now() - statSync(full).mtimeMs;
	if (ageMs > retentionDays * 86_400_000) {
		unlinkSync(full);
		console.log(`Purge (plus de ${retentionDays} jours) : ${file}`);
	}
}
