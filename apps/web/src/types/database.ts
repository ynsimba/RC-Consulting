export type AppRole = "admin" | "client";
export type AppointmentType = "cabinet" | "phone" | "video";
export type AppointmentStatus =
  | "pending"
  | "confirmed"
  | "refused"
  | "cancelled"
  | "completed";

export type Profile = {
  id: string;
  email: string;
  role: AppRole;
  first_name: string | null;
  last_name: string | null;
  phone: string | null;
};

export type Client = {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string | null;
  created_at: string;
};

export type Appointment = {
  id: string;
  client_id: string;
  type: AppointmentType;
  duration: number;
  starts_at: string;
  ends_at: string;
  subject: string;
  description: string;
  status: AppointmentStatus;
  manage_token: string;
  created_at: string;
  client?: Client;
};

export type AvailabilityWindow = {
  id: string;
  day_of_week: number;
  start_time: string;
  end_time: string;
  is_active: boolean;
};

export type BlockedSlot = {
  id: string;
  date: string;
  start_time: string | null;
  end_time: string | null;
  reason: string | null;
};

export type Settings = {
  id: number;
  allowed_durations: number[];
  timezone: string;
};

export type Database = {
  public: {
    Tables: {
      profiles: { Row: Profile; Insert: Partial<Profile>; Update: Partial<Profile> };
      clients: { Row: Client; Insert: Partial<Client>; Update: Partial<Client> };
      appointments: {
        Row: Appointment;
        Insert: Partial<Appointment>;
        Update: Partial<Appointment>;
      };
      availability_windows: {
        Row: AvailabilityWindow;
        Insert: Partial<AvailabilityWindow>;
        Update: Partial<AvailabilityWindow>;
      };
      blocked_slots: {
        Row: BlockedSlot;
        Insert: Partial<BlockedSlot>;
        Update: Partial<BlockedSlot>;
      };
      settings: { Row: Settings; Insert: Partial<Settings>; Update: Partial<Settings> };
    };
    Functions: {
      get_available_slots: {
        Args: { p_date: string; p_duration: number };
        Returns: { slot_time: string }[];
      };
      create_public_appointment: {
        Args: {
          p_first_name: string;
          p_last_name: string;
          p_email: string;
          p_phone: string;
          p_subject: string;
          p_description: string;
          p_duration: number;
          p_starts_at: string;
          p_type?: AppointmentType;
        };
        Returns: Appointment;
      };
      get_appointment_by_token: {
        Args: { p_token: string };
        Returns: Record<string, unknown>;
      };
      manage_appointment_by_token: {
        Args: {
          p_token: string;
          p_action: string;
          p_starts_at?: string | null;
          p_duration?: number | null;
        };
        Returns: Record<string, unknown>;
      };
    };
  };
};
