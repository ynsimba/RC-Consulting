/**
 * Helpers admin : mise à jour RDV + email non bloquant.
 */
import { updateAppointment } from "@/lib/admin";
import {
  notifyAdminIfEmailFailed,
  sendAppointmentEmail,
} from "@/lib/emails/sendAppointmentEmail";
import type { Appointment, AppointmentStatus } from "@/types/database";

export async function confirmAppointmentWithEmail(appointment: Appointment) {
  const updated = await updateAppointment(appointment.id, {
    status: "confirmed",
  });
  const email = await sendAppointmentEmail("confirm", {
    ...updated,
    client: updated.client ?? appointment.client,
  });
  notifyAdminIfEmailFailed(email, "confirmé");
  return updated;
}

export async function refuseAppointmentWithEmail(
  appointment: Appointment,
  reason?: string,
) {
  const updated = await updateAppointment(appointment.id, {
    status: "refused",
  });
  const email = await sendAppointmentEmail(
    "refuse",
    { ...updated, client: updated.client ?? appointment.client },
    { reason },
  );
  notifyAdminIfEmailFailed(email, "refusé");
  return updated;
}

export async function modifyAppointmentWithEmail(
  appointment: Appointment,
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
  const oldStartsAt = appointment.starts_at;
  const updated = await updateAppointment(appointment.id, patch);
  const email = await sendAppointmentEmail(
    "modify",
    { ...updated, client: updated.client ?? appointment.client },
    { oldStartsAt },
  );
  notifyAdminIfEmailFailed(email, "modifié");
  return updated;
}
