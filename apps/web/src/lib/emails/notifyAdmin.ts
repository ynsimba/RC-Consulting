import { supabase } from "@/lib/supabase";
import {
  formatAppointmentDate,
  formatAppointmentTime,
} from "./buildVars";
import type { AppointmentEmailVars, SendAppointmentEmailResult } from "./types";

async function invokeEmail(
  type: "new_request",
  vars: AppointmentEmailVars,
): Promise<SendAppointmentEmailResult> {
  try {
    const { data, error } = await supabase.functions.invoke(
      "send-appointment-email",
      { body: { type, vars } },
    );

    if (error) {
      console.error("[email] admin notify failed", error);
      return { ok: false, error: error.message };
    }
    if (data && typeof data === "object" && "error" in data && data.error) {
      const msg = String((data as { error: unknown }).error);
      console.error("[email] admin notify provider error", msg);
      return { ok: false, error: msg };
    }
    const id =
      data && typeof data === "object" && "id" in data
        ? String((data as { id: unknown }).id)
        : undefined;
    return { ok: true, id };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Erreur d'envoi email";
    console.error("[email] admin notify unexpected", err);
    return { ok: false, error: message };
  }
}

/** Notifie l'admin (yvesnsimba01@gmail.com via secret) d'une nouvelle demande. */
export async function notifyAdminNewAppointment(input: {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  subject: string;
  description?: string;
  duration: number;
  startsAt: string;
}): Promise<SendAppointmentEmailResult> {
  const visitorName = `${input.firstName} ${input.lastName}`.trim();
  const vars: AppointmentEmailVars = {
    visitorName: visitorName || "Madame, Monsieur",
    visitorEmail: input.email,
    visitorPhone: input.phone,
    appointmentDate: formatAppointmentDate(input.startsAt),
    appointmentTime: formatAppointmentTime(input.startsAt),
    modality: "présentiel",
    location: "Clos des Rosacées, 4 – 1080 Bruxelles",
    subject: input.subject,
    staffName: "Me Charlotte Richard",
    description: input.description,
    duration: `${input.duration} min`,
  };
  return invokeEmail("new_request", vars);
}
