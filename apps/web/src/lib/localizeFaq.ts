import type { Lang } from "@/i18n/LanguageContext";

export type FaqRecord = {
  id: string;
  question: string;
  answer: string;
  questionEn?: string | null;
  answerEn?: string | null;
};

export function asFaqList(value: unknown): FaqRecord[] {
  return Array.isArray(value) ? (value as FaqRecord[]) : [];
}

export function localizeFaq(items: unknown, lang: Lang) {
  return asFaqList(items).map((item) => ({
    id: item.id,
    question:
      lang === "en" && item.questionEn?.trim()
        ? item.questionEn
        : item.question,
    answer:
      lang === "en" && item.answerEn?.trim() ? item.answerEn : item.answer,
  }));
}
