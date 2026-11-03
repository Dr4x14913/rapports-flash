# Rapports Flash

## Présentation

Rapports Flash est une application web permettant aux membres d'un conseil
(élus) de rédiger et consulter des rapports mensuels d'activité ("rapports
flash"). Chaque membre peut créer, modifier et consulter ses propres
rapports, parcourir les rapports par mois, consulter la liste des élus et des
projets associés, et exporter les données au format CSV depuis un espace
d'administration.

Fonctionnalités principales :
- Connexion / déconnexion sécurisée des membres.
- Rédaction et édition d'un rapport par mois (avec une fenêtre d'édition
  limitée aux 3 derniers mois).
- Consultation des rapports classés par mois.
- Gestion des élus et des projets.
- Gestion du compte personnel.
- Export CSV des rapports depuis l'espace admin.

## Technique

### Stack

- [SvelteKit](https://kit.svelte.dev/) (Svelte 5, TypeScript)
- [Tailwind CSS](https://tailwindcss.com/) pour le style
- [better-sqlite3](https://github.com/WiseLibs/better-sqlite3) comme base de
  données
- [@node-rs/argon2](https://github.com/napi-rs/node-rs) pour le hachage des
  mots de passe
- [Zod](https://zod.dev/) pour la validation des données
- [Vite](https://vitejs.dev/) comme outil de build

### Structure du projet

```
src/
  lib/                # Code partagé (composants, accès base de données, utilitaires)
  routes/
    connexion/         # Page de connexion
    deconnexion/        # Déconnexion
    mon-compte/        # Gestion du compte
    rapport/           # Création/édition d'un rapport du mois en cours
    rapport/[annee-mois]/ # Édition d'un rapport d'un mois donné
    mois/[annee-mois]/  # Consultation des rapports d'un mois
    elus/              # Liste des élus
    elus/[slug]/        # Détail d'un élu
    projets/           # Liste des projets
    admin/             # Espace d'administration
    admin/export.csv/   # Export CSV des rapports
scripts/
  schema.sql           # Schéma de la base de données SQLite
  seed.mjs             # Script d'initialisation des données (à partir de seed.json)
  backup.mjs           # Script de sauvegarde de la base de données
```

### Configuration

L'application est configurée via des variables d'environnement :

| Variable              | Description                                      |
| --------------------- | ------------------------------------------------- |
| `DATABASE_PATH`       | Chemin du fichier SQLite                           |
| `SESSION_SECRET_FILE` | Chemin du fichier contenant le secret de session   |
| `BACKUP_DIR`          | Répertoire de stockage des sauvegardes             |
| `ORIGIN`              | Origine publique de l'application (build time)     |

Le fichier `seed.json` permet de définir les membres initiaux (nom, email,
mot de passe) chargés via `npm run seed`.

### Développement local

```sh
npm install
npm run seed      # initialise la base de données à partir de seed.json
npm run dev        # lance le serveur de développement
```

### Build et déploiement

L'application est packagée via Docker (`Dockerfile` et
`docker-compose.yml`), avec l'adapter Node de SvelteKit :

```sh
npm run build
npm run preview
```

En production, les données (base SQLite, sauvegardes, secret de session)
sont persistées dans un volume monté sur `/data`.

### Scripts utiles

- `npm run check` : vérification des types TypeScript / Svelte
- `npm run seed` : (ré)initialise la base de données
- `npm run backup` : effectue une sauvegarde de la base de données
