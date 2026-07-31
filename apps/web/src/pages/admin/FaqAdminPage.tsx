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
    <div className="space-y-8">
      <h1 className="text-2xl font-bold uppercase tracking-wide">FAQ</h1>
      <form
        className="space-y-3 border border-line bg-white p-6"
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
          rows={4}
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
          rows={4}
          value={answerEn}
          onChange={(e) => setAnswerEn(e.target.value)}
        />
        <Button type="submit">Ajouter</Button>
      </form>
      <ul className="space-y-3">
        {data.map((f) => (
          <li key={f.id} className="border border-line bg-white p-4">
            <div className="flex justify-between gap-4">
              <div>
                <p className="font-semibold">{f.question}</p>
                <p className="mt-2 text-sm text-muted">{f.answer}</p>
                {f.questionEn && (
                  <p className="mt-3 text-sm font-semibold text-ink/80">
                    EN — {f.questionEn}
                  </p>
                )}
                {f.answerEn && (
                  <p className="mt-1 text-sm text-muted">{f.answerEn}</p>
                )}
              </div>
              <button
                type="button"
                className="text-xs text-red-600 uppercase"
                onClick={() => del.mutate(f.id)}
              >
                Supprimer
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
