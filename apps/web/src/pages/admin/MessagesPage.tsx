import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import {
  Avatar,
  EmptyState,
  Icon,
  Modal,
  PageHeader,
  SkeletonRows,
} from "@/components/admin/ui";

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

function relativeDate(iso: string) {
  const d = new Date(iso);
  const now = new Date();
  if (d.toDateString() === now.toDateString()) {
    return d.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });
  }
  const sameYear = d.getFullYear() === now.getFullYear();
  return d.toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "short",
    ...(sameYear ? {} : { year: "numeric" }),
  });
}

function MessageReader({
  message,
  onDelete,
}: {
  message: Message;
  onDelete: () => void;
}) {
  return (
    <div className="flex h-full flex-col">
      <div className="flex items-start gap-3">
        <Avatar first={message.first_name} last={message.last_name} size="lg" />
        <div className="min-w-0 flex-1">
          <p className="font-medium text-ink">
            {message.first_name} {message.last_name}
          </p>
          <p className="flex flex-wrap items-center gap-x-3 gap-y-0.5 text-[13px] text-muted">
            <a href={`mailto:${message.email}`} className="hover:text-gold-dark">
              {message.email}
            </a>
            {message.phone && (
              <a href={`tel:${message.phone}`} className="hover:text-gold-dark">
                {message.phone}
              </a>
            )}
          </p>
        </div>
        <p className="hidden shrink-0 text-[13px] text-muted sm:block">
          {new Date(message.created_at).toLocaleString("fr-FR", {
            dateStyle: "medium",
            timeStyle: "short",
          })}
        </p>
      </div>
      <div className="mt-5 flex-1 rounded-xl bg-[#fbf8f3] p-4 text-[15px] leading-relaxed whitespace-pre-wrap text-ink/85 ring-1 ring-line/60 sm:p-5">
        {message.message}
      </div>
      <div className="mt-5 flex flex-wrap items-center gap-2 safe-pb">
        <a
          href={`mailto:${message.email}?subject=${encodeURIComponent(`Re: ${message.subject}`)}`}
          className="adm-btn-primary"
        >
          <Icon name="reply" />
          Répondre
        </a>
        <button type="button" className="adm-btn-danger" onClick={onDelete}>
          <Icon name="trash" />
          Supprimer
        </button>
      </div>
    </div>
  );
}

export default function MessagesPage() {
  const qc = useQueryClient();
  const [selected, setSelected] = useState<Message | null>(null);

  const { data = [], isLoading } = useQuery({
    queryKey: ["admin-messages"],
    queryFn: async () => {
      return api<Message[]>("/api/admin/messages");
    },
  });

  const markRead = useMutation({
    mutationFn: async (id: string) => {
      await api(`/api/admin/messages/${id}`, {
        method: "PATCH",
        body: JSON.stringify({ read: true }),
      });
    },
    onSuccess: (_data, id) => {
      void qc.invalidateQueries({ queryKey: ["admin-messages"] });
      void qc.invalidateQueries({ queryKey: ["admin-stats"] });
      setSelected((current) =>
        current?.id === id ? { ...current, read: true } : current,
      );
    },
  });

  const del = useMutation({
    mutationFn: async (id: string) => {
      await api(`/api/admin/messages/${id}`, { method: "DELETE" });
    },
    onSuccess: (_data, id) => {
      void qc.invalidateQueries({ queryKey: ["admin-messages"] });
      void qc.invalidateQueries({ queryKey: ["admin-stats"] });
      setSelected((current) => (current?.id === id ? null : current));
    },
  });

  function openMessage(m: Message) {
    setSelected(m);
    if (!m.read) markRead.mutate(m.id);
  }

  function confirmDelete(id: string) {
    if (confirm("Supprimer ce message ?")) del.mutate(id);
  }

  const unread = data.filter((m) => !m.read).length;

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <PageHeader
        eyebrow="Gestion"
        title="Messages"
        description={
          unread > 0
            ? `${unread} message${unread > 1 ? "s" : ""} non lu${unread > 1 ? "s" : ""}.`
            : "Messages reçus via le formulaire de contact."
        }
      />

      <div className="adm-card overflow-hidden md:grid md:h-[calc(100vh-15rem)] md:min-h-[28rem] md:grid-cols-[minmax(0,22rem)_1fr]">
        {/* Liste */}
        <div className="flex min-h-0 flex-col md:border-r md:border-line/70">
          <div className="flex items-center justify-between border-b border-line/70 px-4 py-3 sm:px-5">
            <p className="text-[15px] font-semibold text-ink">Boîte de réception</p>
            <span className="rounded-full bg-soft px-2 py-0.5 text-[12px] text-muted tabular-nums">
              {data.length}
            </span>
          </div>
          <div className="min-h-0 flex-1 overflow-y-auto">
            {isLoading ? (
              <SkeletonRows rows={5} />
            ) : data.length === 0 ? (
              <EmptyState
                icon="inbox"
                title="Aucun message"
                hint="Les messages du formulaire de contact apparaîtront ici."
              />
            ) : (
              <ul className="divide-y divide-line/50">
                {data.map((m) => {
                  const active = selected?.id === m.id;
                  return (
                    <li key={m.id}>
                      <button
                        type="button"
                        onClick={() => openMessage(m)}
                        aria-current={active ? "true" : undefined}
                        className={`relative flex w-full items-start gap-3 px-4 py-3.5 text-left transition sm:px-5 ${
                          active ? "bg-gold/[0.08]" : "hover:bg-[#fcfaf6]"
                        }`}
                      >
                        {active && (
                          <span className="absolute inset-y-0 left-0 w-[3px] bg-gold" />
                        )}
                        <Avatar first={m.first_name} last={m.last_name} size="sm" />
                        <div className="min-w-0 flex-1">
                          <div className="flex items-baseline justify-between gap-2">
                            <p
                              className={`truncate text-[15px] ${
                                m.read ? "text-ink/80" : "font-semibold text-ink"
                              }`}
                            >
                              {m.first_name} {m.last_name}
                            </p>
                            <span className="shrink-0 text-[12px] text-muted tabular-nums">
                              {relativeDate(m.created_at)}
                            </span>
                          </div>
                          <p
                            className={`mt-0.5 flex items-center gap-1.5 text-[14px] ${
                              m.read ? "text-muted" : "font-medium text-ink"
                            }`}
                          >
                            {!m.read && (
                              <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-gold" />
                            )}
                            <span className="truncate">{m.subject}</span>
                          </p>
                          <p className="mt-0.5 truncate text-[13px] text-muted/80">
                            {m.message}
                          </p>
                        </div>
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </div>

        {/* Lecteur desktop */}
        <div className="hidden min-h-0 flex-col md:flex">
          {selected ? (
            <>
              <div className="border-b border-line/70 px-6 py-4">
                <p className="adm-eyebrow">Message</p>
                <h2 className="mt-0.5 truncate text-lg font-semibold text-ink">
                  {selected.subject}
                </h2>
              </div>
              <div className="min-h-0 flex-1 overflow-y-auto px-6 py-5">
                <MessageReader
                  message={selected}
                  onDelete={() => confirmDelete(selected.id)}
                />
              </div>
            </>
          ) : (
            <div className="grid flex-1 place-items-center">
              <EmptyState
                icon="mail"
                title="Aucun message sélectionné"
                hint="Choisissez un message dans la liste pour le lire."
              />
            </div>
          )}
        </div>
      </div>

      {/* Lecteur mobile */}
      {selected && (
        <div className="md:hidden">
          <Modal
            eyebrow="Message"
            title={selected.subject}
            labelledBy="message-modal-title"
            onClose={() => setSelected(null)}
          >
            <MessageReader
              message={selected}
              onDelete={() => confirmDelete(selected.id)}
            />
          </Modal>
        </div>
      )}
    </div>
  );
}
