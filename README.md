# RC Consulting — Conseil juridique Belgique & RDC

Cabinet de conseil juridique en droit belge et OHADA. Monorepo Vite + React + Express + Prisma/PostgreSQL.

## Démarrage

```bash
cp .env.example apps/api/.env
cp .env.example apps/web/.env
npm install
npm run docker:up
npm run db:push
npm run db:seed
npm run dev
```

- Site : http://localhost:5173
- API : http://localhost:4000
- Admin : http://localhost:5173/admin (admin@rcconsulting.be / Admin123!)
