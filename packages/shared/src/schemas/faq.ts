import { z } from "zod";

export const faqSchema = z.object({
  question: z.string().min(5).max(300),
  answer: z.string().min(5).max(5000),
  questionEn: z.string().min(5).max(300).optional().nullable(),
  answerEn: z.string().min(5).max(5000).optional().nullable(),
  category: z.string().max(80).optional().nullable(),
  order: z.number().int().default(0),
  published: z.boolean().default(true),
});

export type FaqInput = z.infer<typeof faqSchema>;
