# Brancher RC Consulting sur Supabase

## 1. Appliquer le schéma

Dans le dashboard Supabase → **SQL Editor** → New query :

1. Coller le contenu de [`supabase/migrations/001_init.sql`](../supabase/migrations/001_init.sql)
2. Run

Cela crée tables, RLS, RPC (`get_available_slots`, `create_public_appointment`, `manage_appointment_by_token`) et les horaires Lun–Ven 08:30–18:00.

## 2. Créer l’admin

1. **Authentication → Users → Add user** (email + mot de passe)
2. Dans SQL Editor :

```sql
update public.profiles
set role = 'admin'
where email = 'VOTRE_EMAIL_ADMIN';
```

## 3. Variables d’environnement

Dans `apps/web/.env` :

```env
VITE_SUPABASE_URL=https://XXXX.supabase.co
VITE_SUPABASE_ANON_KEY=sb_publishable_…   # ou ancienne anon key
```

L’URL se trouve dans **Project Settings → API**.

## 4. Lancer le front

```bash
npm run dev -w @rc/web
```

- Site public : prise de RDV `/rendez-vous`
- Admin : `/admin/login`

## Notes

- L’API Express (`apps/api`) n’est plus nécessaire pour le booking / admin.
- Les emails transactionnels (Resend) ne sont pas inclus dans ce MVP ; à brancher ensuite via Edge Function si besoin.
