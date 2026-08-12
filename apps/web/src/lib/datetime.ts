/** Fuseau métier du cabinet (créneaux SQL + emails). */
export const BUSINESS_TZ = "Europe/Brussels";

export function toLocalYmd(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export function startOfLocalDay(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

export function addLocalDays(base: Date, n: number): Date {
  const d = new Date(base);
  d.setDate(d.getDate() + n);
  return d;
}

/** Prochain jour ouvré (lun–ven), au moins `minDaysAhead` jours après `base`. */
export function nextWeekday(base: Date, minDaysAhead = 1): Date {
  let d = startOfLocalDay(addLocalDays(base, minDaysAhead));
  while (d.getDay() === 0 || d.getDay() === 6) {
    d = addLocalDays(d, 1);
  }
  return d;
}

export function formatYmdInTimeZone(date: Date, timeZone: string): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);
}

export function brusselsYmdFromIso(iso: string): string {
  return formatYmdInTimeZone(new Date(iso), BUSINESS_TZ);
}

export function addCalendarDaysYmd(ymd: string, days: number): string {
  const [y, m, d] = ymd.split("-").map(Number);
  const dt = new Date(Date.UTC(y, m - 1, d + days));
  const yy = dt.getUTCFullYear();
  const mm = String(dt.getUTCMonth() + 1).padStart(2, "0");
  const dd = String(dt.getUTCDate()).padStart(2, "0");
  return `${yy}-${mm}-${dd}`;
}

function getZonedParts(date: Date, timeZone: string) {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  }).formatToParts(date);
  const map: Record<string, string> = {};
  for (const p of parts) {
    if (p.type !== "literal") map[p.type] = p.value;
  }
  const hour = map.hour === "24" ? 0 : Number(map.hour);
  return {
    year: Number(map.year),
    month: Number(map.month),
    day: Number(map.day),
    hour,
    minute: Number(map.minute),
    second: Number(map.second),
  };
}

/**
 * Interprète `YYYY-MM-DD` + `HH:MM` (ou `HH:MM:SS`) comme heure murale
 * Europe/Brussels et renvoie l’ISO UTC.
 */
export function brusselsWallToIso(dateYmd: string, time: string): string {
  const [y, mo, d] = dateYmd.split("-").map(Number);
  const [hh, mm, ss = 0] = time.split(":").map(Number);
  const desiredAsUtcMs = Date.UTC(y, mo - 1, d, hh, mm, ss);

  let utcMs = desiredAsUtcMs;
  for (let i = 0; i < 3; i += 1) {
    const parts = getZonedParts(new Date(utcMs), BUSINESS_TZ);
    const asUtcMs = Date.UTC(
      parts.year,
      parts.month - 1,
      parts.day,
      parts.hour,
      parts.minute,
      parts.second,
    );
    utcMs += desiredAsUtcMs - asUtcMs;
  }
  return new Date(utcMs).toISOString();
}

/** Bornes inclusives du jour civil Bruxelles pour une date ISO ou « maintenant ». */
export function brusselsDayBoundsIso(ref: Date | string = new Date()): {
  from: string;
  to: string;
} {
  const ymd =
    typeof ref === "string" && /^\d{4}-\d{2}-\d{2}$/.test(ref)
      ? ref
      : formatYmdInTimeZone(
          typeof ref === "string" ? new Date(ref) : ref,
          BUSINESS_TZ,
        );
  const from = brusselsWallToIso(ymd, "00:00:00");
  const next = addCalendarDaysYmd(ymd, 1);
  const toExclusive = brusselsWallToIso(next, "00:00:00");
  return {
    from,
    to: new Date(new Date(toExclusive).getTime() - 1).toISOString(),
  };
}
