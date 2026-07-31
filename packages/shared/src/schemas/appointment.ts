import { z } from "zod";

export const appointmentTypeSchema = z.enum(["CABINET", "PHONE", "VIDEO"]);
export const appointmentDurationSchema = z.union([
  z.literal(30),
  z.literal(60),
  z.literal(90),
]);
export const appointmentStatusSchema = z.enum([
  "PENDING",
  "CONFIRMED",
  "CANCELLED",
  "COMPLETED",
]);

export const createAppointmentSchema = z.object({
  type: appointmentTypeSchema,
  duration: appointmentDurationSchema,
  startsAt: z
    .string()
    .regex(
      /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(:\d{2})?/,
      "Date/heure invalide",
    ),
  firstName: z.string().min(2, "Prénom requis").max(80),
  lastName: z.string().min(2, "Nom requis").max(80),
  email: z.string().email("Email invalide"),
  phone: z
    .string()
    .min(10, "Numéro de téléphone incomplet")
    .max(30)
    .regex(/^\+?[+\d\s().-]{8,}$/, "Téléphone invalide"),
  subject: z.string().min(3, "Sujet requis").max(200),
  description: z
    .string()
    .min(5, "Description trop courte (5 caractères min.)")
    .max(5000),
});

export const updateAppointmentSchema = z.object({
  type: appointmentTypeSchema.optional(),
  duration: appointmentDurationSchema.optional(),
  startsAt: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(:\d{2})?/)
    .optional(),
  subject: z.string().min(3).max(200).optional(),
  description: z.string().min(10).max(5000).optional(),
  status: appointmentStatusSchema.optional(),
  token: z.string().optional(),
});

export const availabilityQuerySchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Date invalide (YYYY-MM-DD)"),
  duration: z.coerce
    .number()
    .refine((v) => [30, 60, 90].includes(v), "Durée invalide"),
  type: appointmentTypeSchema.optional(),
});

export type CreateAppointmentInput = z.infer<typeof createAppointmentSchema>;
export type UpdateAppointmentInput = z.infer<typeof updateAppointmentSchema>;
export type AppointmentType = z.infer<typeof appointmentTypeSchema>;
export type AppointmentDuration = z.infer<typeof appointmentDurationSchema>;
export type AppointmentStatus = z.infer<typeof appointmentStatusSchema>;
