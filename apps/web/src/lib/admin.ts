import { supabase } from "@/lib/supabase";
import { brusselsDayBoundsIso } from "@/lib/datetime";
import type {
  Appointment,
  AppointmentStatus,
  AvailabilityWindow,
  BlockedSlot,
  Client,
} from "@/types/database";

export async function fetchAdminStats() {
  const now = new Date();
  const monthYmd = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-01`;
  const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
  const monthEndYmd = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(lastDay).padStart(2, "0")}`;
  const { from: monthStart } = brusselsDayBoundsIso(monthYmd);
  const { to: monthEnd } = brusselsDayBoundsIso(monthEndYmd);

  const [upcoming, pending, month, clients, unread, total] = await Promise.all([
    supabase
      .from("appointments")
      .select("id", { count: "exact", head: true })
      .in("status", ["pending", "confirmed"])
      .gte("starts_at", now.toISOString()),
    supabase
      .from("appointments")
      .select("id", { count: "exact", head: true })
      .eq("status", "pending"),
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
    supabase.from("appointments").select("id", { count: "exact", head: true }),
  ]);

  const results = [upcoming, pending, month, clients, unread, total];
  const firstError = results.find((r) => r.error)?.error;
  if (firstError) throw firstError;

  return {
    upcoming: upcoming.count ?? 0,
    pending: pending.count ?? 0,
    appointmentsMonth: month.count ?? 0,
    clientsTotal: clients.count ?? 0,
    messagesUnread: unread.count ?? 0,
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
  const { from, to } = brusselsDayBoundsIso();
  return fetchAppointments({
    from,
    to,
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

export async function deleteAppointment(id: string) {
  const { error } = await supabase.from("appointments").delete().eq("id", id);
  if (error) throw error;
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

export async function updateAvailabilityWindow(
  id: string,
  input: {
    day_of_week: number;
    start_time: string;
    end_time: string;
    is_active?: boolean;
  },
) {
  const { data, error } = await supabase
    .from("availability_windows")
    .update({
      day_of_week: input.day_of_week,
      start_time: input.start_time,
      end_time: input.end_time,
      ...(input.is_active !== undefined ? { is_active: input.is_active } : {}),
    })
    .eq("id", id)
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
