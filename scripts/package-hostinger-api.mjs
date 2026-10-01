/**
 * Assemble hostinger-dist/laravel for Hostinger shared hosting.
 * Called from npm run build:hostinger after the SPA copy.
 * The database password is read from HOSTINGER_DB_PASSWORD and written only
 * into the gitignored package .env.
 */
import { spawnSync } from "node:child_process";
import { cpSync, mkdirSync, rmSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const source = join(root, "backend");
const target = join(root, "hostinger-dist/laravel");
const password = process.env.HOSTINGER_DB_PASSWORD ?? "";

if (!password) {
  console.error("HOSTINGER_DB_PASSWORD est requis pour écrire le .env du paquet.");
  process.exit(1);
}

function envQuoted(value) {
  return `"${value.replace(/\\/g, "\\\\").replace(/"/g, '\\"')}"`;
}

rmSync(target, { recursive: true, force: true });
mkdirSync(target, { recursive: true });

const exclude = new Set([
  "vendor",
  "node_modules",
  "tests",
  ".phpunit.cache",
  "phpunit.xml",
]);

cpSync(source, target, {
  recursive: true,
  filter: (src) => {
    const rel = src.slice(source.length + 1);
    if (!rel) return true;
    const top = rel.split("/")[0];
    if (exclude.has(top) || rel.startsWith(".env")) return false;
    return true;
  },
});

for (const dir of [
  "storage/logs",
  "storage/framework/cache/data",
  "storage/framework/sessions",
  "storage/framework/views",
  "bootstrap/cache",
]) {
  mkdirSync(join(target, dir), { recursive: true });
}

const install = spawnSync(
  "composer",
  ["install", "--no-dev", "--optimize-autoloader", "--no-interaction", "--prefer-dist"],
  { cwd: target, stdio: "inherit" },
);
if (install.status !== 0) process.exit(install.status ?? 1);

const env = `APP_NAME="RC Consulting"
APP_ENV=production
APP_KEY=
APP_DEBUG=false
APP_URL=https://api.rc-consulting-legal.com
APP_LOCALE=fr
APP_FALLBACK_LOCALE=fr

LOG_CHANNEL=stack
LOG_LEVEL=error

DB_CONNECTION=mysql
DB_HOST=localhost
DB_PORT=3306
DB_DATABASE=u987922939_rc_consulting
DB_USERNAME=u987922939_rc_admin
DB_PASSWORD=${envQuoted(password)}

SESSION_DRIVER=database
SESSION_LIFETIME=120
SESSION_ENCRYPT=false
SESSION_SECURE_COOKIE=true

BROADCAST_CONNECTION=log
FILESYSTEM_DISK=local
QUEUE_CONNECTION=database
CACHE_STORE=database

MAIL_MAILER=log
MAIL_FROM_ADDRESS="contact@rc-consulting-legal.com"
MAIL_FROM_NAME="RC Consulting"

SANCTUM_STATEFUL_DOMAINS=rc-consulting-legal.com,www.rc-consulting-legal.com
SANCTUM_EXPIRATION=480
CORS_ALLOWED_ORIGINS=https://rc-consulting-legal.com,https://www.rc-consulting-legal.com
`;

writeFileSync(join(target, ".env"), env);

const key = spawnSync("php", ["artisan", "key:generate", "--force", "--no-interaction"], {
  cwd: target,
  stdio: "inherit",
});
if (key.status !== 0) process.exit(key.status ?? 1);

writeFileSync(
  join(root, "hostinger-dist/LISEZMOI.txt"),
  `RC Consulting — dépôt Hostinger (hébergement mutualisé, pas un VPS)
Domaine : rc-consulting-legal.com
API : https://api.rc-consulting-legal.com

1. hPanel → PHP : choisir 8.3 ou 8.4 pour le domaine et pour le sous-domaine api.
2. hPanel → SSL : activer le certificat pour rc-consulting-legal.com, www et api.
3. Créer le sous-domaine api.rc-consulting-legal.com.
4. Envoyer le CONTENU de public_html/ dans le public_html du domaine
   (index.html doit être à la racine du site, pas dans un sous-dossier).
5. Envoyer le dossier laravel/ dans le répertoire personnel, à côté de public_html
   (exemple : /home/u987922939/laravel). Ne pas le mettre dans public_html.
6. Racine du document du sous-domaine api : laravel/public
   (le fichier visible doit être public/index.php, pas le .env).
7. Droits d'écriture : laravel/storage et laravel/bootstrap/cache.
8. La base u987922939_rc_consulting contient déjà les tables. Ne pas lancer migrate:fresh.
9. Vérifier https://api.rc-consulting-legal.com/up puis https://rc-consulting-legal.com
   et https://rc-consulting-legal.com/admin

Le fichier laravel/.env est déjà rempli pour cette base. Ne pas le committer.
`,
);

console.log("OK → hostinger-dist/laravel/ et hostinger-dist/LISEZMOI.txt");
