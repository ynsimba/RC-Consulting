import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { STATIC_FAQ } from "@/data/staticFaq";
import { asFaqList, type FaqRecord } from "@/lib/localizeFaq";

export function useFaq() {
  return useQuery({
    queryKey: ["faq"],
    queryFn: async () => {
      try {
        const data = await api<FaqRecord[]>("/api/faq");
        const list = asFaqList(data);
        return list.length > 0 ? list : STATIC_FAQ;
      } catch {
        return STATIC_FAQ;
      }
    },
    staleTime: 60_000,
  });
}
