# RC Consulting — Conseil juridique Belgique & RDC

Cabinet de conseil juridique en droit belge et OHADA.  
Front : **Vite + React** · Backend : **Laravel** · Base : **MySQL** (`rc-consulting`).

## Démarrage

```bash
npm install
npm run dev
```

Dans un second terminal :

```bash
cd backend
php artisan serve
```

- Site local : http://localhost:5173
- API : http://127.0.0.1:8000
- Admin : http://localhost:5173/admin
- Base : phpMyAdmin, base `rc-consulting` (MAMP, port 8889)

## Déploiement Hostinger (hébergement mutualisé)

Domaine : `rc-consulting-legal.com`. L’API est sur `api.rc-consulting-legal.com`.

```bash
HOSTINGER_DB_PASSWORD='…' npm run build:hostinger
```

Sortie dans `hostinger-dist/` :

- `public_html/` → contenu du domaine principal
- `laravel/` → application, hors du web ; la racine du sous-domaine `api` doit pointer vers `laravel/public`
- `LISEZMOI.txt` → étapes hPanel (PHP 8.3 ou 8.4, SSL, base déjà créée)
