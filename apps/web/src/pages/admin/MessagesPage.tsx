import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/Button";

type Message = {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone?: string | null;
  subject: string;
  message: string;
  read: boolean;
  created_at: string;
};

export default function MessagesPage() {
  const qc = useQueryClient();
  const [selected, setSelected] = useState<Message | null>(null);

  const { data = [], isLoading } = useQuery({
    queryKey: ["admin-messages"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("messages")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as Message[];
    },
  });

  const markRead = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("messages")
        .update({ read: true })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: (_data, id) => {
      void qc.invalidateQueries({ queryKey: ["admin-messages"] });
      setSelected((current) =>
        current?.id === id ? { ...current, read: true } : current,
      );
    },
  });

  const del = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("messages").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: (_data, id) => {
      void qc.invalidateQueries({ queryKey: ["admin-messages"] });
      setSelected((current) => (current?.id === id ? null : current));
    },
  });

  function openMessage(m: Message) {
    setSelected(m);
    if (!m.read) markRead.mutate(m.id);
  }

  return (
    <div className="mx-auto max-w-5xl">
      <h1 className="text-xl font-bold tracking-wide uppercase sm:text-2xl">
        Messages
      </h1>
      <p className="mt-0.5 text-xs text-muted sm:text-sm">
        Cliquez sur une ligne pour lire le message.
      </p>

      {isLoading && (
        <p className="mt-4 text-sm text-muted">Chargement…</p>
      )}

      {/* Mobile : cartes compactes */}
      <ul className="mt-4 space-y-2 md:hidden">
        {data.map((m) => (
          <li key={m.id}>
            <button
              type="button"
              onClick={() => openMessage(m)}
              className={`w-full border bg-white p-3 text-left ${
                m.read ? "border-line" : "border-gold"
              }`}
            >
              <p className="text-sm font-semibold">
                {m.first_name} {m.last_name}
              </p>
              <p className="mt-0.5 truncate text-xs text-muted">{m.subject}</p>
              <p className="mt-1 text-[11px] text-muted">
                {new Date(m.created_at).toLocaleString("fr-FR", {
                  dateStyle: "short",
                  timeStyle: "short",
                })}
              </p>
            </button>
          </li>
        ))}
        {!isLoading && data.length === 0 && (
          <li className="border border-line bg-white px-3 py-6 text-center text-sm text-muted">
            Aucun message.
          </li>
        )}
      </ul>

      {/* Desktop : tableau */}
      <div className="mt-4 hidden overflow-hidden border border-line bg-white md:block">
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="border-b border-line bg-soft text-xs tracking-wide uppercase">
              <tr>
                <th className="px-3 py-2.5">Expéditeur</th>
                <th className="px-3 py-2.5">Sujet</th>
                <th className="px-3 py-2.5">Date</th>
                <th className="px-3 py-2.5">Heure</th>
              </tr>
            </thead>
            <tbody>
              {data.map((m) => {
                const d = new Date(m.created_at);
                return (
                  <tr
                    key={m.id}
                    tabIndex={0}
                    role="button"
                    aria-label={`Ouvrir le message de ${m.first_name} ${m.last_name}`}
                    className={`cursor-pointer border-b border-line transition hover:bg-gold/5 ${
                      m.read ? "" : "bg-gold/5 font-medium"
                    } ${selected?.id === m.id ? "bg-gold/10" : ""}`}
                    onClick={() => openMessage(m)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        openMessage(m);
                      }
                    }}
                  >
                    <td className="px-3 py-2.5">
                      <div className="font-medium">
                        {m.first_name} {m.last_name}
                      </div>
                      <div className="text-xs font-normal text-muted">
                        {m.email}
                      </div>
                    </td>
                    <td className="max-w-[18rem] truncate px-3 py-2.5">
                      {!m.read && (
                        <span className="mr-2 inline-block h-1.5 w-1.5 rounded-full bg-gold align-middle" />
                      )}
                      {m.subject}
                    </td>
                    <td className="whitespace-nowrap px-3 py-2.5">
                      {d.toLocaleDateString("fr-FR")}
                    </td>
                    <td className="whitespace-nowrap px-3 py-2.5">
                      {d.toLocaleTimeString("fr-FR", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </td>
                  </tr>
                );
              })}
              {!isLoading && data.length === 0 && (
                <tr>
                  <td
                    colSpan={4}
                    className="px-3 py-8 text-center text-sm text-muted"
                  >
                    Aucun message.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {selected && (
        <div
          className="fixed inset-0 z-50 grid place-items-end bg-ink/40 p-0 sm:place-items-center sm:p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="message-modal-title"
          onClick={() => setSelected(null)}
        >
          <div
            className="max-h-[92vh] w-full max-w-lg overflow-y-auto border border-line bg-white p-4 sm:p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <p className="text-[10px] font-semibold tracking-[0.18em] text-gold uppercase">
              Message
            </p>
            <h2
              id="message-modal-title"
              className="mt-1 text-base font-bold tracking-wide uppercase sm:text-lg"
            >
              {selected.subject}
            </h2>
            <p className="mt-2 text-sm text-ink">
              {selected.first_name} {selected.last_name}
            </p>
            <p className="mt-0.5 text-xs text-muted">
              <a
                href={`mailto:${selected.email}`}
                className="hover:text-gold"
              >
                {selected.email}
              </a>
              {selected.phone ? ` · ${selected.phone}` : ""}
              {" · "}
              {new Date(selected.created_at).toLocaleString("fr-FR", {
                dateStyle: "long",
                timeStyle: "short",
              })}
            </p>
            <div className="mt-4 border-t border-line pt-4 text-sm leading-relaxed whitespace-pre-wrap text-muted">
              {selected.message}
            </div>
            <div className="mt-5 flex flex-wrap gap-2 safe-pb">
              <a
                href={`mailto:${selected.email}?subject=${encodeURIComponent(`Re: ${selected.subject}`)}`}
                className="btn-gold inline-flex items-center px-4 py-2 text-xs font-semibold tracking-wide uppercase"
              >
                Répondre
              </a>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  if (confirm("Supprimer ce message ?")) {
                    del.mutate(selected.id);
                  }
                }}
              >
                Supprimer
              </Button>
              <button
                type="button"
                className="border border-line px-4 py-2 text-xs font-semibold uppercase"
                onClick={() => setSelected(null)}
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
