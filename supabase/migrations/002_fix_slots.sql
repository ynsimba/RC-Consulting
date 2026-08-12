-- Fix: ambiguïté starts_at / ends_at dans get_available_slots
-- À exécuter dans le SQL Editor Supabase

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

  if not exists (
    select 1 from public.settings s where dur = any (s.allowed_durations)
  ) then
    return;
  end if;

  v_dow := extract(dow from p_date)::int;

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

grant execute on function public.get_available_slots(date, int) to anon, authenticated;
