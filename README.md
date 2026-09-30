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

## Build Hostinger

```bash
VITE_SITE_URL="https://www.votredomaine.com" npm run build:hostinger
# Sortie : hostinger-dist/ (+ zip optionnel)
```
