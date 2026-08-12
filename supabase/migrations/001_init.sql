-- RC Consulting — schema Supabase (Auth + Database + RLS + RPC)
-- Exécuter dans le SQL Editor du projet Supabase (dans l'ordre).

create extension if not exists "pgcrypto";

-- ---------------------------------------------------------------------------
-- Enums
-- ---------------------------------------------------------------------------
do $$ begin
  create type public.app_role as enum ('admin', 'client');
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.appointment_type as enum ('cabinet', 'phone', 'video');
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.appointment_status as enum (
    'pending', 'confirmed', 'refused', 'cancelled', 'completed'
  );
exception when duplicate_object then null; end $$;

-- ---------------------------------------------------------------------------
-- Profiles (lié à auth.users)
-- ---------------------------------------------------------------------------
create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  email text not null,
  role public.app_role not null default 'client',
  first_name text,
  last_name text,
  phone text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists profiles_role_idx on public.profiles (role);

-- ---------------------------------------------------------------------------
-- Clients (réservations publiques, sans compte)
-- ---------------------------------------------------------------------------
create table if not exists public.clients (
  id uuid primary key default gen_random_uuid(),
  first_name text not null,
  last_name text not null,
  email text not null,
  phone text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists clients_email_idx on public.clients (email);

-- ---------------------------------------------------------------------------
-- Appointments
-- ---------------------------------------------------------------------------
create table if not exists public.appointments (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references public.clients (id) on delete cascade,
  type public.appointment_type not null default 'cabinet',
  duration int not null check (duration > 0),
  starts_at timestamptz not null,
  ends_at timestamptz not null,
  subject text not null,
  description text not null default '',
  status public.appointment_status not null default 'pending',
  manage_token uuid not null unique default gen_random_uuid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (ends_at > starts_at)
);

create index if not exists appointments_starts_at_idx on public.appointments (starts_at);
create index if not exists appointments_status_idx on public.appointments (status);
create index if not exists appointments_client_id_idx on public.appointments (client_id);

-- ---------------------------------------------------------------------------
-- Availability windows (horaires de travail récurrents)
-- ---------------------------------------------------------------------------
create table if not exists public.availability_windows (
  id uuid primary key default gen_random_uuid(),
  day_of_week smallint not null check (day_of_week between 0 and 6),
  start_time time not null,
  end_time time not null,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (end_time > start_time),
  unique (day_of_week, start_time, end_time)
);

-- ---------------------------------------------------------------------------
-- Blocked slots
-- ---------------------------------------------------------------------------
create table if not exists public.blocked_slots (
  id uuid primary key default gen_random_uuid(),
  date date not null,
  start_time time,
  end_time time,
  reason text,
  created_at timestamptz not null default now(),
  check (
    (start_time is null and end_time is null)
    or (start_time is not null and end_time is not null and end_time > start_time)
  )
);

create index if not exists blocked_slots_date_idx on public.blocked_slots (date);

-- ---------------------------------------------------------------------------
-- Settings (singleton)
-- ---------------------------------------------------------------------------
create table if not exists public.settings (
  id int primary key default 1 check (id = 1),
  allowed_durations int[] not null default '{30,60,90}',
  timezone text not null default 'Europe/Brussels',
  updated_at timestamptz not null default now()
);

insert into public.settings (id) values (1)
on conflict (id) do nothing;

-- ---------------------------------------------------------------------------
-- Contenu vitrine
-- ---------------------------------------------------------------------------
create table if not exists public.categories (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.articles (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text not null unique,
  excerpt text not null default '',
  content text not null default '',
  cover_image text,
  published boolean not null default false,
  published_at timestamptz,
  seo_title text,
  seo_description text,
  category_id uuid references public.categories (id) on delete set null,
  author_id uuid references public.profiles (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists articles_published_idx on public.articles (published, published_at);

create table if not exists public.faqs (
  id uuid primary key default gen_random_uuid(),
  question text not null,
  answer text not null,
  question_en text,
  answer_en text,
  category text,
  sort_order int not null default 0,
  published boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.messages (
  id uuid primary key default gen_random_uuid(),
  first_name text not null,
  last_name text not null,
  email text not null,
  phone text,
  subject text not null,
  message text not null,
  read boolean not null default false,
  created_at timestamptz not null default now()
);

create index if not exists messages_read_created_idx on public.messages (read, created_at);

-- ---------------------------------------------------------------------------
-- Helpers
-- ---------------------------------------------------------------------------
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists profiles_updated_at on public.profiles;
create trigger profiles_updated_at
before update on public.profiles
for each row execute function public.set_updated_at();

drop trigger if exists clients_updated_at on public.clients;
create trigger clients_updated_at
before update on public.clients
for each row execute function public.set_updated_at();

drop trigger if exists appointments_updated_at on public.appointments;
create trigger appointments_updated_at
before update on public.appointments
for each row execute function public.set_updated_at();

drop trigger if exists availability_windows_updated_at on public.availability_windows;
create trigger availability_windows_updated_at
before update on public.availability_windows
for each row execute function public.set_updated_at();

drop trigger if exists settings_updated_at on public.settings;
create trigger settings_updated_at
before update on public.settings
for each row execute function public.set_updated_at();

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles p
    where p.id = auth.uid() and p.role = 'admin'
  );
$$;

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, role)
  values (new.id, new.email, 'client')
  on conflict (id) do update set email = excluded.email;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();

-- ---------------------------------------------------------------------------
-- Seed horaires Lun–Ven 08:30–18:00
-- ---------------------------------------------------------------------------
insert into public.availability_windows (day_of_week, start_time, end_time, is_active)
select d, time '08:30', time '18:00', true
from generate_series(1, 5) as d
on conflict (day_of_week, start_time, end_time) do nothing;

-- ---------------------------------------------------------------------------
-- RPC: créneaux disponibles
-- ---------------------------------------------------------------------------
create or replace function public.get_available_slots(p_date date, p_duration int)
returns table (slot_time text)
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  v_dow int;
  win record;
  cursor_min int;
  end_min int;
  dur int := p_duration;
  slot_start time;
  slot_end time;
  v_slot_start timestamptz;
  v_slot_end timestamptz;
  day_blocked boolean;
begin
  if dur is null or dur <= 0 then
    return;
  end if;

  -- Interdire si durée non autorisée
  if not exists (
    select 1 from public.settings s where dur = any (s.allowed_durations)
  ) then
    return;
  end if;

  v_dow := extract(dow from p_date)::int; -- 0=dim … 6=sam

  select exists (
    select 1 from public.blocked_slots b
    where b.date = p_date and b.start_time is null and b.end_time is null
  ) into day_blocked;

  if day_blocked then
    return;
  end if;

  for win in
    select aw.start_time, aw.end_time
    from public.availability_windows aw
    where aw.day_of_week = v_dow and aw.is_active = true
    order by aw.start_time
  loop
    cursor_min := extract(hour from win.start_time)::int * 60
      + extract(minute from win.start_time)::int;
    end_min := extract(hour from win.end_time)::int * 60
      + extract(minute from win.end_time)::int;

    while cursor_min + dur <= end_min loop
      slot_start := make_time(cursor_min / 60, cursor_min % 60, 0);
      slot_end := make_time((cursor_min + dur) / 60, (cursor_min + dur) % 60, 0);
      v_slot_start := (p_date + slot_start) at time zone 'Europe/Brussels';
      v_slot_end := (p_date + slot_end) at time zone 'Europe/Brussels';

      if v_slot_start > now()
        and not exists (
          select 1 from public.appointments a
          where a.status in ('pending', 'confirmed')
            and a.starts_at < v_slot_end
            and a.ends_at > v_slot_start
        )
        and not exists (
          select 1 from public.blocked_slots b
          where b.date = p_date
            and b.start_time is not null
            and b.end_time is not null
            and slot_start < b.end_time
            and slot_end > b.start_time
        )
      then
        slot_time := to_char(slot_start, 'HH24:MI');
        return next;
      end if;

      cursor_min := cursor_min + 30;
    end loop;
  end loop;
end;
$$;

-- ---------------------------------------------------------------------------
-- RPC: créer un RDV public (upsert client + insert)
-- ---------------------------------------------------------------------------
create or replace function public.create_public_appointment(
  p_first_name text,
  p_last_name text,
  p_email text,
  p_phone text,
  p_subject text,
  p_description text,
  p_duration int,
  p_starts_at timestamptz,
  p_type public.appointment_type default 'cabinet'
)
returns public.appointments
language plpgsql
security definer
set search_path = public
as $$
declare
  v_client public.clients;
  v_ends timestamptz;
  v_date date;
  v_time text;
  v_appt public.appointments;
  v_slots text[];
begin
  if p_email is null or length(trim(p_email)) < 3 then
    raise exception 'Email invalide';
  end if;

  v_ends := p_starts_at + make_interval(mins => p_duration);
  v_date := (p_starts_at at time zone 'Europe/Brussels')::date;
  v_time := to_char((p_starts_at at time zone 'Europe/Brussels')::time, 'HH24:MI');

  select array_agg(s.slot_time) into v_slots
  from public.get_available_slots(v_date, p_duration) s;

  if v_slots is null or not (v_time = any (v_slots)) then
    raise exception 'Créneau indisponible';
  end if;

  select * into v_client
  from public.clients
  where lower(email) = lower(trim(p_email))
  order by created_at desc
  limit 1;

  if not found then
    insert into public.clients (first_name, last_name, email, phone)
    values (trim(p_first_name), trim(p_last_name), lower(trim(p_email)), nullif(trim(p_phone), ''))
    returning * into v_client;
  else
    update public.clients
    set
      first_name = trim(p_first_name),
      last_name = trim(p_last_name),
      phone = coalesce(nullif(trim(p_phone), ''), phone),
      updated_at = now()
    where id = v_client.id
    returning * into v_client;
  end if;

  insert into public.appointments (
    client_id, type, duration, starts_at, ends_at, subject, description, status
  ) values (
    v_client.id,
    coalesce(p_type, 'cabinet'),
    p_duration,
    p_starts_at,
    v_ends,
    trim(p_subject),
    coalesce(trim(p_description), ''),
    'pending'
  )
  returning * into v_appt;

  return v_appt;
end;
$$;

-- ---------------------------------------------------------------------------
-- RPC: gérer un RDV via token (sans auth)
-- ---------------------------------------------------------------------------
create or replace function public.get_appointment_by_token(p_token uuid)
returns jsonb
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  result jsonb;
begin
  select jsonb_build_object(
    'id', a.id,
    'duration', a.duration,
    'starts_at', a.starts_at,
    'ends_at', a.ends_at,
    'subject', a.subject,
    'description', a.description,
    'status', a.status,
    'type', a.type,
    'manage_token', a.manage_token,
    'client', jsonb_build_object(
      'first_name', c.first_name,
      'last_name', c.last_name,
      'email', c.email,
      'phone', c.phone
    )
  )
  into result
  from public.appointments a
  join public.clients c on c.id = a.client_id
  where a.manage_token = p_token;

  return result;
end;
$$;

create or replace function public.manage_appointment_by_token(
  p_token uuid,
  p_action text,
  p_starts_at timestamptz default null,
  p_duration int default null
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_appt public.appointments;
  v_duration int;
  v_starts timestamptz;
  v_ends timestamptz;
  v_date date;
  v_time text;
  v_slots text[];
begin
  select * into v_appt
  from public.appointments
  where manage_token = p_token
  for update;

  if v_appt.id is null then
    raise exception 'Rendez-vous introuvable';
  end if;

  if v_appt.status in ('cancelled', 'refused', 'completed') then
    raise exception 'Rendez-vous non modifiable';
  end if;

  if p_action = 'cancel' then
    update public.appointments
    set status = 'cancelled'
    where id = v_appt.id
    returning * into v_appt;
    return public.get_appointment_by_token(p_token);
  end if;

  if p_action = 'reschedule' then
    if p_starts_at is null then
      raise exception 'Nouvelle date requise';
    end if;
    v_duration := coalesce(p_duration, v_appt.duration);
    v_starts := p_starts_at;
    v_ends := v_starts + make_interval(mins => v_duration);
    v_date := (v_starts at time zone 'Europe/Brussels')::date;
    v_time := to_char((v_starts at time zone 'Europe/Brussels')::time, 'HH24:MI');

    -- Exclure le RDV courant du conflit : temporairement cancelled pour le check
    update public.appointments set status = 'cancelled' where id = v_appt.id;

    select array_agg(s.slot_time) into v_slots
    from public.get_available_slots(v_date, v_duration) s;

    if v_slots is null or not (v_time = any (v_slots)) then
      update public.appointments set status = v_appt.status where id = v_appt.id;
      raise exception 'Créneau indisponible';
    end if;

    update public.appointments
    set
      starts_at = v_starts,
      ends_at = v_ends,
      duration = v_duration,
      status = 'pending'
    where id = v_appt.id;

    return public.get_appointment_by_token(p_token);
  end if;

  raise exception 'Action invalide';
end;
$$;

-- ---------------------------------------------------------------------------
-- RLS
-- ---------------------------------------------------------------------------
alter table public.profiles enable row level security;
alter table public.clients enable row level security;
alter table public.appointments enable row level security;
alter table public.availability_windows enable row level security;
alter table public.blocked_slots enable row level security;
alter table public.settings enable row level security;
alter table public.categories enable row level security;
alter table public.articles enable row level security;
alter table public.faqs enable row level security;
alter table public.messages enable row level security;

-- Profiles
drop policy if exists "profiles_select_own_or_admin" on public.profiles;
create policy "profiles_select_own_or_admin" on public.profiles
for select using (auth.uid() = id or public.is_admin());

drop policy if exists "profiles_update_admin" on public.profiles;
create policy "profiles_update_admin" on public.profiles
for update using (public.is_admin());

-- Clients
drop policy if exists "clients_admin_all" on public.clients;
create policy "clients_admin_all" on public.clients
for all using (public.is_admin()) with check (public.is_admin());

-- Appointments
drop policy if exists "appointments_admin_all" on public.appointments;
create policy "appointments_admin_all" on public.appointments
for all using (public.is_admin()) with check (public.is_admin());

-- Availability
drop policy if exists "availability_public_read" on public.availability_windows;
create policy "availability_public_read" on public.availability_windows
for select using (true);

drop policy if exists "availability_admin_write" on public.availability_windows;
create policy "availability_admin_write" on public.availability_windows
for all using (public.is_admin()) with check (public.is_admin());

-- Blocked
drop policy if exists "blocked_admin_all" on public.blocked_slots;
create policy "blocked_admin_all" on public.blocked_slots
for all using (public.is_admin()) with check (public.is_admin());

drop policy if exists "blocked_public_read" on public.blocked_slots;
create policy "blocked_public_read" on public.blocked_slots
for select using (true);

-- Settings
drop policy if exists "settings_public_read" on public.settings;
create policy "settings_public_read" on public.settings
for select using (true);

drop policy if exists "settings_admin_update" on public.settings;
create policy "settings_admin_update" on public.settings
for update using (public.is_admin()) with check (public.is_admin());

-- Categories / articles / faqs
drop policy if exists "categories_public_read" on public.categories;
create policy "categories_public_read" on public.categories for select using (true);
drop policy if exists "categories_admin_all" on public.categories;
create policy "categories_admin_all" on public.categories
for all using (public.is_admin()) with check (public.is_admin());

drop policy if exists "articles_public_read" on public.articles;
create policy "articles_public_read" on public.articles
for select using (published = true or public.is_admin());
drop policy if exists "articles_admin_all" on public.articles;
create policy "articles_admin_all" on public.articles
for all using (public.is_admin()) with check (public.is_admin());

drop policy if exists "faqs_public_read" on public.faqs;
create policy "faqs_public_read" on public.faqs
for select using (published = true or public.is_admin());
drop policy if exists "faqs_admin_all" on public.faqs;
create policy "faqs_admin_all" on public.faqs
for all using (public.is_admin()) with check (public.is_admin());

-- Messages
drop policy if exists "messages_public_insert" on public.messages;
create policy "messages_public_insert" on public.messages
for insert with check (true);
drop policy if exists "messages_admin_all" on public.messages;
create policy "messages_admin_all" on public.messages
for all using (public.is_admin()) with check (public.is_admin());

-- Grants RPC
grant execute on function public.get_available_slots(date, int) to anon, authenticated;
grant execute on function public.create_public_appointment(text, text, text, text, text, text, int, timestamptz, public.appointment_type) to anon, authenticated;
grant execute on function public.get_appointment_by_token(uuid) to anon, authenticated;
grant execute on function public.manage_appointment_by_token(uuid, text, timestamptz, int) to anon, authenticated;
grant execute on function public.is_admin() to authenticated;
