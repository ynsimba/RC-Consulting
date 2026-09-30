import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { STATIC_FAQ } from "@/data/staticFaq";
import { asFaqList, type FaqRecord } from "@/lib/localizeFaq";

type FaqRow = {
  id: string;
  question: string;
  answer: string;
  question_en?: string | null;
  answer_en?: string | null;
  category?: string | null;
  sort_order: number;
  published: boolean;
};

export function useFaq() {
  return useQuery({
    queryKey: ["faq"],
    queryFn: async () => {
      try {
        const data = await api<FaqRow[]>("/api/faqs");
        const mapped: FaqRecord[] = data.map((f) => ({
          id: f.id,
          question: f.question,
          answer: f.answer,
          questionEn: f.question_en,
          answerEn: f.answer_en,
          category: f.category,
          order: f.sort_order,
          published: f.published,
        }));
        const list = asFaqList(mapped);
        return list.length > 0 ? list : STATIC_FAQ;
      } catch {
        return STATIC_FAQ;
      }
    },
    staleTime: 60_000,
  });
}
