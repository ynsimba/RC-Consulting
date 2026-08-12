# Brancher RC Consulting sur Supabase

## 1. Appliquer le schéma

Dans le dashboard Supabase → **SQL Editor** → New query :

1. Coller le contenu de [`supabase/migrations/001_init.sql`](supabase/migrations/001_init.sql)
2. Run
3. (Optionnel) Coller [`supabase/migrations/002_fix_slots.sql`](supabase/migrations/002_fix_slots.sql) si les créneaux plantent

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

## 4. Emails admin (confirm / refuse / modify)

Le front appelle l’Edge Function `send-appointment-email` (Resend) après chaque action admin.  
La mise à jour en base **n’est pas annulée** si l’email échoue ; l’admin reçoit une alerte.

### Déployer la fonction

```bash
# CLI Supabase liée au projet
supabase functions deploy send-appointment-email

supabase secrets set \
  RESEND_API_KEY=re_xxxxxxxx \
  EMAIL_FROM="RC Consulting <noreply@votredomaine.com>" \
  EMAIL_REPLY_TO=rc.consulting.pro@gmail.com \
  ADMIN_NOTIFY_EMAIL=contact@rc-consulting-legal.com,charlotte.richard@rc-consulting-legal.com
```

- `EMAIL_FROM` : adresse **noreply** vérifiée chez Resend (domaine ou `onboarding@resend.dev` en test).
- `EMAIL_REPLY_TO` : boîte réelle du cabinet (utile pour l’email de modification).
- `ADMIN_NOTIFY_EMAIL` : une ou plusieurs adresses (séparées par des virgules) notifiées à **chaque nouvelle demande** de RDV.
  Défaut : `contact@rc-consulting-legal.com` et `charlotte.richard@rc-consulting-legal.com`.

À chaque prise de RDV publique, ces boîtes reçoivent : client, email, téléphone, créneau, objet, message.  
Reply-To = email du client (réponse directe possible).

### Test manuel des templates

```bash
# Prévisualise HTML dans tmp/email-previews/
node scripts/send-test-appointment-emails.mjs

# Envoi réel des 3 types (nécessite RESEND_API_KEY + TEST_TO)
RESEND_API_KEY=re_xxx TEST_TO=vous@email.com node scripts/send-test-appointment-emails.mjs --send
```

## 5. Lancer le front

```bash
npm run dev -w @rc/web
```

- Site public : prise de RDV `/rendez-vous`
- Admin : `/admin/login`

## Notes

- L’API Express (`apps/api`) n’est plus nécessaire pour le booking / admin.
- Les emails transactionnels passent par Resend + Edge Function (pas de clé API dans le bundle Hostinger).
