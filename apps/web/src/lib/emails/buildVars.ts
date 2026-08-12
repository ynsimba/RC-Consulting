import type { Appointment, AppointmentType } from "@/types/database";
import type { AppointmentEmailVars } from "./types";

const STAFF_NAME = "Me Charlotte Richard";
const CABINET_ADDRESS = "Clos des Rosacées, 4 – 1080 Bruxelles";
const PHONE_LOCATION = "+32 476 95 06 55";
const VIDEO_LOCATION = "Lien de visioconférence communiqué séparément";

const MODALITY: Record<AppointmentType, string> = {
  cabinet: "présentiel",
  phone: "téléphone",
  video: "visioconférence",
};

function locationFor(type: AppointmentType) {
  if (type === "phone") return PHONE_LOCATION;
  if (type === "video") return VIDEO_LOCATION;
  return CABINET_ADDRESS;
}

export function formatAppointmentDate(iso: string) {
  return new Date(iso).toLocaleDateString("fr-FR", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "Europe/Brussels",
  });
}

export function formatAppointmentTime(iso: string) {
  return new Date(iso).toLocaleTimeString("fr-FR", {
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Europe/Brussels",
  });
}

export function buildAppointmentEmailVars(
  appointment: Appointment,
  extras?: {
    oldStartsAt?: string;
    reason?: string;
    staffName?: string;
    location?: string;
  },
): AppointmentEmailVars {
  const client = appointment.client;
  const visitorName = [client?.first_name, client?.last_name]
    .filter(Boolean)
    .join(" ")
    .trim();

  return {
    visitorName: visitorName || "Madame, Monsieur",
    visitorEmail: client?.email ?? "",
    appointmentDate: formatAppointmentDate(appointment.starts_at),
    appointmentTime: formatAppointmentTime(appointment.starts_at),
    modality: MODALITY[appointment.type] ?? appointment.type,
    location: extras?.location ?? locationFor(appointment.type),
    subject: appointment.subject,
    staffName: extras?.staffName ?? STAFF_NAME,
    oldDate: extras?.oldStartsAt
      ? formatAppointmentDate(extras.oldStartsAt)
      : undefined,
    oldTime: extras?.oldStartsAt
      ? formatAppointmentTime(extras.oldStartsAt)
      : undefined,
    reason: extras?.reason?.trim() || undefined,
  };
}
