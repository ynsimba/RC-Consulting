import type { SendAppointmentEmailResult } from "./types";

async function invokeEmail(
  _appointmentId: string,
): Promise<SendAppointmentEmailResult> {
  return {
    ok: false,
    error: "Notification email non configurée sur le backend Laravel.",
  };
}

/** Notifie les admins d'une nouvelle demande de RDV (via Edge Function). */
export async function notifyAdminNewAppointment(
  appointmentId: string,
): Promise<SendAppointmentEmailResult> {
  return invokeEmail(appointmentId);
}
