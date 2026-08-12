import { supabase } from "@/lib/supabase";
import type {
  Appointment,
  AppointmentStatus,
  AvailabilityWindow,
  BlockedSlot,
  Client,
} from "@/types/database";

function startOfDayIso(d = new Date()) {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x.toISOString();
}

function endOfDayIso(d = new Date()) {
  const x = new Date(d);
  x.setHours(23, 59, 59, 999);
  return x.toISOString();
}

export async function fetchAdminStats() {
  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
  const monthEnd = new Date(
    now.getFullYear(),
    now.getMonth() + 1,
    0,
    23,
    59,
    59,
  ).toISOString();

  const [
    upcoming,
    month,
    clients,
    unread,
    articles,
    total,
  ] = await Promise.all([
    supabase
      .from("appointments")
      .select("id", { count: "exact", head: true })
      .in("status", ["pending", "confirmed"])
      .gte("starts_at", now.toISOString()),
    supabase
      .from("appointments")
      .select("id", { count: "exact", head: true })
      .gte("starts_at", monthStart)
      .lte("starts_at", monthEnd),
    supabase.from("clients").select("id", { count: "exact", head: true }),
    supabase
      .from("messages")
      .select("id", { count: "exact", head: true })
      .eq("read", false),
    supabase
      .from("articles")
      .select("id", { count: "exact", head: true })
      .eq("published", true),
    supabase.from("appointments").select("id", { count: "exact", head: true }),
  ]);

  return {
    upcoming: upcoming.count ?? 0,
    appointmentsMonth: month.count ?? 0,
    clientsTotal: clients.count ?? 0,
    messagesUnread: unread.count ?? 0,
    articlesPublished: articles.count ?? 0,
    appointmentsTotal: total.count ?? 0,
  };
}

export async function fetchAppointments(opts?: {
  from?: string;
  to?: string;
  status?: AppointmentStatus[];
}) {
  let q = supabase
    .from("appointments")
    .select("*, client:clients(*)")
    .order("starts_at", { ascending: true });

  if (opts?.from) q = q.gte("starts_at", opts.from);
  if (opts?.to) q = q.lte("starts_at", opts.to);
  if (opts?.status?.length) q = q.in("status", opts.status);

  const { data, error } = await q;
  if (error) throw error;
  return (data ?? []) as Appointment[];
}

export async function fetchTodayAppointments() {
  return fetchAppointments({
    from: startOfDayIso(),
    to: endOfDayIso(),
    status: ["pending", "confirmed"],
  });
}

export async function updateAppointment(
  id: string,
  patch: Partial<{
    status: AppointmentStatus;
    starts_at: string;
    ends_at: string;
    duration: number;
    subject: string;
    description: string;
    type: Appointment["type"];
  }>,
) {
  const { data, error } = await supabase
    .from("appointments")
    .update(patch)
    .eq("id", id)
    .select("*, client:clients(*)")
    .single();
  if (error) throw error;
  return data as Appointment;
}

export async function fetchClients() {
  const { data, error } = await supabase
    .from("clients")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []) as Client[];
}

export async function fetchAvailabilityWindows() {
  const { data, error } = await supabase
    .from("availability_windows")
    .select("*")
    .order("day_of_week")
    .order("start_time");
  if (error) throw error;
  return (data ?? []) as AvailabilityWindow[];
}

export async function createAvailabilityWindow(input: {
  day_of_week: number;
  start_time: string;
  end_time: string;
}) {
  const { data, error } = await supabase
    .from("availability_windows")
    .insert({ ...input, is_active: true })
    .select()
    .single();
  if (error) throw error;
  return data as AvailabilityWindow;
}

export async function deleteAvailabilityWindow(id: string) {
  const { error } = await supabase
    .from("availability_windows")
    .delete()
    .eq("id", id);
  if (error) throw error;
}

export async function fetchBlockedSlots(from?: string, to?: string) {
  let q = supabase.from("blocked_slots").select("*").order("date");
  if (from) q = q.gte("date", from);
  if (to) q = q.lte("date", to);
  const { data, error } = await q;
  if (error) throw error;
  return (data ?? []) as BlockedSlot[];
}

export async function createBlockedSlot(input: {
  date: string;
  start_time?: string | null;
  end_time?: string | null;
  reason?: string | null;
}) {
  const { data, error } = await supabase
    .from("blocked_slots")
    .insert({
      date: input.date,
      start_time: input.start_time ?? null,
      end_time: input.end_time ?? null,
      reason: input.reason ?? null,
    })
    .select()
    .single();
  if (error) throw error;
  return data as BlockedSlot;
}

export async function deleteBlockedSlot(id: string) {
  const { error } = await supabase.from("blocked_slots").delete().eq("id", id);
  if (error) throw error;
}

export async function updateAllowedDurations(durations: number[]) {
  const { data, error } = await supabase
    .from("settings")
    .update({ allowed_durations: durations })
    .eq("id", 1)
    .select()
    .single();
  if (error) throw error;
  return data;
}
