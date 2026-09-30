import { api } from "@/lib/api";
import { notifyAdminNewAppointment } from "@/lib/emails/notifyAdmin";
import type { Appointment, AppointmentStatus } from "@/types/database";

type Settings = {
  id: number;
  allowed_durations: number[];
  timezone: string;
};

export async function fetchAvailableSlots(date: string, duration: number) {
  const data = await api<{ slots: string[] }>(
    `/api/slots?date=${encodeURIComponent(date)}&duration=${duration}`,
  );
  return data.slots;
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
  const appointment = await api<Appointment>("/api/appointments", {
    method: "POST",
    body: JSON.stringify({
      first_name: input.firstName,
      last_name: input.lastName,
      email: input.email,
      phone: input.phone,
      subject: input.subject,
      description: input.description,
      duration: input.duration,
      starts_at: input.startsAt,
      type: "cabinet",
    }),
  });

  void notifyAdminNewAppointment(appointment.id).then((result) => {
    if (!result.ok) {
      console.error("[booking] notification admin non envoyée:", result.error);
    }
  });

  return appointment;
}

export async function getAppointmentByToken(token: string) {
  return api<{
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
  } | null>(`/api/appointments/manage/${token}`);
}

export async function manageAppointmentByToken(
  token: string,
  action: "cancel" | "reschedule",
  startsAt?: string,
  duration?: number,
) {
  return api(`/api/appointments/manage/${token}`, {
    method: "POST",
    body: JSON.stringify({
      action,
      starts_at: startsAt ?? null,
      duration: duration ?? null,
    }),
  });
}

export async function fetchSettings() {
  return api<Settings>("/api/settings");
}
