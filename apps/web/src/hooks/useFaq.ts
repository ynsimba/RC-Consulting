import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { STATIC_FAQ } from "@/data/staticFaq";
import { asFaqList, type FaqRecord } from "@/lib/localizeFaq";

export function useFaq() {
  return useQuery({
    queryKey: ["faq"],
    queryFn: async () => {
      try {
        const { data, error } = await supabase
          .from("faqs")
          .select("*")
          .eq("published", true)
          .order("sort_order", { ascending: true });
        if (error) throw error;
        const mapped: FaqRecord[] = (data ?? []).map((f) => ({
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
