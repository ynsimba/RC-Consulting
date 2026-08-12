import { supabase } from "@/lib/supabase";
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

    const { data, error } = await supabase.functions.invoke(
      "send-appointment-email",
      {
        body: { type, vars },
      },
    );

    if (error) {
      console.error("[email] invoke failed", type, error);
      return { ok: false, error: error.message };
    }

    if (data && typeof data === "object" && "error" in data && data.error) {
      const msg = String((data as { error: unknown }).error);
      console.error("[email] provider error", type, msg);
      return { ok: false, error: msg };
    }

    const id =
      data && typeof data === "object" && "id" in data
        ? String((data as { id: unknown }).id)
        : undefined;

    return { ok: true, id };
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
