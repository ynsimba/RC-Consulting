import { prisma } from "../lib/prisma.js";

function parseTime(time: string): number {
  const [h, m] = time.split(":").map(Number);
  return h * 60 + m;
}

function formatTime(minutes: number): string {
  const h = Math.floor(minutes / 60)
    .toString()
    .padStart(2, "0");
  const m = (minutes % 60).toString().padStart(2, "0");
  return `${h}:${m}`;
}

function toDateOnly(dateStr: string): Date {
  return new Date(`${dateStr}T00:00:00.000Z`);
}

export async function getAvailableSlots(date: string, duration: number) {
  const day = toDateOnly(date);
  const dayOfWeek = new Date(`${date}T12:00:00`).getDay();

  const windows = await prisma.availability.findMany({
    where: { dayOfWeek, isActive: true },
    orderBy: { startTime: "asc" },
  });

  if (!windows.length) return [];

  const blocked = await prisma.blockedSlot.findMany({
    where: { date: day },
  });

  if (blocked.some((b) => !b.startTime && !b.endTime)) {
    return [];
  }

  const startOfDay = new Date(`${date}T00:00:00`);
  const endOfDay = new Date(`${date}T23:59:59.999`);

  const appointments = await prisma.appointment.findMany({
    where: {
      startsAt: { gte: startOfDay, lte: endOfDay },
      status: { in: ["PENDING", "CONFIRMED"] },
    },
  });

  const slots: string[] = [];
  const now = new Date();

  for (const window of windows) {
    let cursor = parseTime(window.startTime);
    const end = parseTime(window.endTime);

    while (cursor + duration <= end) {
      const slotStart = formatTime(cursor);
      const slotEnd = formatTime(cursor + duration);
      const startsAt = new Date(`${date}T${slotStart}:00`);
      const endsAt = new Date(`${date}T${slotEnd}:00`);

      const isPast = startsAt <= now;
      const overlapsAppointment = appointments.some(
        (a) => startsAt < a.endsAt && endsAt > a.startsAt,
      );
      const overlapsBlocked = blocked.some((b) => {
        if (!b.startTime || !b.endTime) return true;
        const bStart = parseTime(b.startTime);
        const bEnd = parseTime(b.endTime);
        return cursor < bEnd && cursor + duration > bStart;
      });

      if (!isPast && !overlapsAppointment && !overlapsBlocked) {
        slots.push(slotStart);
      }

      cursor += 30;
    }
  }

  return slots;
}

function pad(n: number) {
  return n.toString().padStart(2, "0");
}

export function formatLocalDate(d: Date) {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

export function formatLocalTime(d: Date) {
  return `${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export async function assertSlotAvailable(
  startsAt: Date,
  duration: number,
  excludeId?: string,
) {
  const date = formatLocalDate(startsAt);
  const time = formatLocalTime(startsAt);
  const slots = await getAvailableSlots(date, duration);

  if (!slots.includes(time)) {
    throw new Error("Créneau indisponible");
  }

  const endsAt = new Date(startsAt.getTime() + duration * 60_000);
  const conflict = await prisma.appointment.findFirst({
    where: {
      id: excludeId ? { not: excludeId } : undefined,
      status: { in: ["PENDING", "CONFIRMED"] },
      startsAt: { lt: endsAt },
      endsAt: { gt: startsAt },
    },
  });
  if (conflict) {
    throw new Error("Créneau indisponible");
  }
}
