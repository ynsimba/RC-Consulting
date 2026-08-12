import { supabase } from "@/lib/supabase";
import type { Appointment, AppointmentStatus } from "@/types/database";

export async function fetchAvailableSlots(date: string, duration: number) {
  const { data, error } = await supabase.rpc("get_available_slots", {
    p_date: date,
    p_duration: duration,
  });
  if (error) throw error;
  return ((data ?? []) as { slot_time: string }[]).map(
    (row: { slot_time: string }) => row.slot_time,
  );
}

export async function createPublicAppointment(input: {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  subject: string;
  description: string;
  duration: number;
  startsAt: string;
}) {
  const { data, error } = await supabase.rpc("create_public_appointment", {
    p_first_name: input.firstName,
    p_last_name: input.lastName,
    p_email: input.email,
    p_phone: input.phone,
    p_subject: input.subject,
    p_description: input.description,
    p_duration: input.duration,
    p_starts_at: input.startsAt,
    p_type: "cabinet",
  });
  if (error) throw error;
  return data as Appointment;
}

export async function getAppointmentByToken(token: string) {
  const { data, error } = await supabase.rpc("get_appointment_by_token", {
    p_token: token,
  });
  if (error) throw error;
  return data as {
    id: string;
    duration: number;
    starts_at: string;
    ends_at: string;
    subject: string;
    description: string;
    status: AppointmentStatus;
    type: string;
    manage_token: string;
    client: {
      first_name: string;
      last_name: string;
      email: string;
      phone: string | null;
    };
  } | null;
}

export async function manageAppointmentByToken(
  token: string,
  action: "cancel" | "reschedule",
  startsAt?: string,
  duration?: number,
) {
  const { data, error } = await supabase.rpc("manage_appointment_by_token", {
    p_token: token,
    p_action: action,
    p_starts_at: startsAt ?? null,
    p_duration: duration ?? null,
  });
  if (error) throw error;
  return data;
}

export async function fetchSettings() {
  const { data, error } = await supabase
    .from("settings")
    .select("*")
    .eq("id", 1)
    .maybeSingle();
  if (error) throw error;
  return data;
}
