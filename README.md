# RC Consulting — Conseil juridique Belgique & RDC

Cabinet de conseil juridique en droit belge et OHADA.  
Front : **Vite + React** · Données : **Supabase** · Déploiement : **Hostinger** (statique).

## Démarrage (sans Docker)

```bash
cp apps/web/.env.example apps/web/.env
# Renseigner VITE_SUPABASE_URL et VITE_SUPABASE_ANON_KEY (voir SUPABASE.md)

npm install
npm run dev
```

- Site local : http://localhost:5173
- Admin : http://localhost:5173/admin
- Production : https://rc-consulting-legal.com

Schéma SQL, auth admin et emails : voir [`SUPABASE.md`](SUPABASE.md).

## Build Hostinger

```bash
VITE_SITE_URL="https://www.votredomaine.com" npm run build:hostinger
# Sortie : hostinger-dist/ (+ zip optionnel)
```

## API Express (optionnelle)

L’ancien backend `apps/api` (Prisma) n’est **pas** requis pour le site / admin Supabase.  
Si besoin ponctuel : `npm run dev:api` avec un `DATABASE_URL` Supabase (connection string du dashboard), **sans** Docker.
