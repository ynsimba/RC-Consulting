import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/Button";

type Faq = {
  id: string;
  question: string;
  answer: string;
  questionEn?: string | null;
  answerEn?: string | null;
  order: number;
  published: boolean;
};

export default function FaqAdminPage() {
  const qc = useQueryClient();
  const { data = [] } = useQuery({
    queryKey: ["admin-faq"],
    queryFn: () => api<Faq[]>("/api/faq/admin"),
  });
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [questionEn, setQuestionEn] = useState("");
  const [answerEn, setAnswerEn] = useState("");

  const create = useMutation({
    mutationFn: () =>
      api("/api/faq/admin", {
        method: "POST",
        body: JSON.stringify({
          question,
          answer,
          questionEn: questionEn.trim() || null,
          answerEn: answerEn.trim() || null,
          order: data.length + 1,
          published: true,
        }),
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-faq"] });
      qc.invalidateQueries({ queryKey: ["faq"] });
      setQuestion("");
      setAnswer("");
      setQuestionEn("");
      setAnswerEn("");
    },
  });

  const del = useMutation({
    mutationFn: (id: string) =>
      api(`/api/faq/admin/${id}`, { method: "DELETE" }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-faq"] });
      qc.invalidateQueries({ queryKey: ["faq"] });
    },
  });

  return (
    <div className="mx-auto max-w-3xl space-y-5 sm:space-y-8">
      <h1 className="text-xl font-bold tracking-wide uppercase sm:text-2xl">
        FAQ
      </h1>
      <form
        className="space-y-2.5 border border-line bg-white p-3 sm:space-y-3 sm:p-5"
        onSubmit={(e) => {
          e.preventDefault();
          create.mutate();
        }}
      >
        <input
          className="w-full border border-line px-3 py-2"
          placeholder="Question (FR)"
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          required
        />
        <textarea
          className="w-full border border-line px-3 py-2"
          placeholder="Réponse (FR)"
          rows={3}
          value={answer}
          onChange={(e) => setAnswer(e.target.value)}
          required
        />
        <input
          className="w-full border border-line px-3 py-2"
          placeholder="Question (EN)"
          value={questionEn}
          onChange={(e) => setQuestionEn(e.target.value)}
        />
        <textarea
          className="w-full border border-line px-3 py-2"
          placeholder="Answer (EN)"
          rows={3}
          value={answerEn}
          onChange={(e) => setAnswerEn(e.target.value)}
        />
        <Button type="submit">Ajouter</Button>
      </form>
      <ul className="space-y-2">
        {data.map((f) => (
          <li key={f.id} className="border border-line bg-white p-3 sm:p-4">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <p className="text-sm font-semibold leading-snug">{f.question}</p>
                <p className="mt-1.5 text-xs text-muted sm:text-sm">{f.answer}</p>
                {f.questionEn && (
                  <p className="mt-2 text-xs font-semibold text-ink/80">
                    EN — {f.questionEn}
                  </p>
                )}
                {f.answerEn && (
                  <p className="mt-0.5 text-xs text-muted">{f.answerEn}</p>
                )}
              </div>
              <button
                type="button"
                className="shrink-0 text-[10px] font-semibold tracking-wide text-red-600 uppercase sm:text-xs"
                onClick={() => del.mutate(f.id)}
              >
                Suppr.
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
