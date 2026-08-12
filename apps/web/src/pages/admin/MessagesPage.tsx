import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";

type Message = {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  subject: string;
  message: string;
  read: boolean;
  created_at: string;
};

export default function MessagesPage() {
  const qc = useQueryClient();
  const { data = [] } = useQuery({
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
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin-messages"] }),
  });

  const del = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("messages").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin-messages"] }),
  });

  return (
    <div>
      <h1 className="text-2xl font-bold tracking-wide uppercase">Messages</h1>
      <ul className="mt-6 space-y-3">
        {data.map((m) => (
          <li
            key={m.id}
            className={`border bg-white p-5 ${m.read ? "border-line" : "border-gold"}`}
          >
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="font-semibold">
                  {m.first_name} {m.last_name} — {m.subject}
                </p>
                <p className="text-xs text-muted">
                  {m.email} · {new Date(m.created_at).toLocaleString("fr-FR")}
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
        {data.length === 0 && (
          <li className="text-sm text-muted">Aucun message.</li>
        )}
      </ul>
    </div>
  );
}
