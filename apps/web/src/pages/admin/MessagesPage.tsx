import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";

type Message = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  subject: string;
  message: string;
  read: boolean;
  createdAt: string;
};

export default function MessagesPage() {
  const qc = useQueryClient();
  const { data = [] } = useQuery({
    queryKey: ["admin-messages"],
    queryFn: () => api<Message[]>("/api/messages"),
  });

  const markRead = useMutation({
    mutationFn: (id: string) =>
      api(`/api/messages/${id}/read`, { method: "PATCH" }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin-messages"] }),
  });

  const del = useMutation({
    mutationFn: (id: string) =>
      api(`/api/messages/${id}`, { method: "DELETE" }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin-messages"] }),
  });

  return (
    <div>
      <h1 className="text-2xl font-bold uppercase tracking-wide">Messages</h1>
      <ul className="mt-6 space-y-3">
        {data.map((m) => (
          <li
            key={m.id}
            className={`border bg-white p-5 ${m.read ? "border-line" : "border-gold"}`}
          >
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="font-semibold">
                  {m.firstName} {m.lastName} — {m.subject}
                </p>
                <p className="text-xs text-muted">
                  {m.email} · {new Date(m.createdAt).toLocaleString("fr-FR")}
                </p>
                <p className="mt-3 text-sm text-muted">{m.message}</p>
              </div>
              <div className="flex gap-3 text-xs uppercase">
                {!m.read && (
                  <button
                    type="button"
                    className="text-gold"
                    onClick={() => markRead.mutate(m.id)}
                  >
                    Marquer lu
                  </button>
                )}
                <button
                  type="button"
                  className="text-red-600"
                  onClick={() => del.mutate(m.id)}
                >
                  Supprimer
                </button>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
