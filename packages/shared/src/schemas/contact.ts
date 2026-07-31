import { z } from "zod";

export const contactMessageSchema = z.object({
  firstName: z.string().min(2).max(80),
  lastName: z.string().min(2).max(80),
  email: z.string().email(),
  phone: z.string().max(30).optional(),
  subject: z.string().min(3).max(200),
  message: z.string().min(10).max(5000),
});

export type ContactMessageInput = z.infer<typeof contactMessageSchema>;
