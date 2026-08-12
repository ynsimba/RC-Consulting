export type AppointmentEmailType =
  | "confirm"
  | "refuse"
  | "modify"
  | "new_request";

export type AppointmentEmailVars = {
  visitorName: string;
  visitorEmail: string;
  visitorPhone?: string;
  appointmentDate: string;
  appointmentTime: string;
  modality: string;
  location: string;
  subject: string;
  staffName: string;
  description?: string;
  duration?: string;
  oldDate?: string;
  oldTime?: string;
  reason?: string;
};

export type SendAppointmentEmailResult = {
  ok: boolean;
  error?: string;
  id?: string;
};
