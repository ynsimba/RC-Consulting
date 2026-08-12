import { supabase } from "@/lib/supabase";
import type { SendAppointmentEmailResult } from "./types";

async function invokeEmail(
  appointmentId: string,
): Promise<SendAppointmentEmailResult> {
  try {
    const { data, error } = await supabase.functions.invoke(
      "send-appointment-email",
      { body: { type: "new_request", appointmentId } },
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

/** Notifie les admins d'une nouvelle demande de RDV (via Edge Function). */
export async function notifyAdminNewAppointment(
  appointmentId: string,
): Promise<SendAppointmentEmailResult> {
  return invokeEmail(appointmentId);
}
