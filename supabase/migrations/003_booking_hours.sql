-- Durées 30 et 60 min, plage Lun–Ven 09:30–18:30
-- À exécuter dans le SQL Editor Supabase

update public.settings
set allowed_durations = '{30,60}',
    updated_at = now()
where id = 1;

alter table public.settings
  alter column allowed_durations set default '{30,60}';

update public.availability_windows
set start_time = time '09:30',
    end_time = time '18:30'
where day_of_week between 1 and 5
  and start_time = time '08:30'
  and end_time = time '18:00';

insert into public.availability_windows (day_of_week, start_time, end_time, is_active)
select d, time '09:30', time '18:30', true
from generate_series(1, 5) as d
where not exists (
  select 1
  from public.availability_windows aw
  where aw.day_of_week = d
    and aw.is_active = true
)
on conflict (day_of_week, start_time, end_time) do nothing;
