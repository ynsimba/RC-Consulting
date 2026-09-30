import type { Appointment } from "@/types/database";
import { buildAppointmentEmailVars } from "./buildVars";
import type {
  AppointmentEmailType,
  SendAppointmentEmailResult,
} from "./types";

/**
 * Envoie un email transactionnel au visiteur (via Edge Function Resend).
 * Ne lève pas d'exception : l'appelant peut ignorer l'échec sans bloquer la BDD.
 */
export async function sendAppointmentEmail(
  type: AppointmentEmailType,
  appointment: Appointment,
  extras?: {
    oldStartsAt?: string;
    reason?: string;
  },
): Promise<SendAppointmentEmailResult> {
  try {
    const vars = buildAppointmentEmailVars(appointment, extras);
    if (!vars.visitorEmail) {
      const error = "Email du client manquant";
      console.error("[email]", type, error);
      return { ok: false, error };
    }

    void vars;
    return {
      ok: false,
      error: "Notification email non configurée sur le backend Laravel.",
    };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Erreur d'envoi email";
    console.error("[email] unexpected", type, err);
    return { ok: false, error: message };
  }
}

export function notifyAdminIfEmailFailed(
  result: SendAppointmentEmailResult,
  actionLabel: string,
) {
  if (result.ok) return;
  window.alert(
    `Le rendez-vous a bien été ${actionLabel}, mais l'email au visiteur n'a pas pu être envoyé.\n\n${result.error ?? "Erreur inconnue"}`,
  );
}
