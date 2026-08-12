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
    <div className="mx-auto max-w-4xl">
      <h1 className="text-xl font-bold tracking-wide uppercase sm:text-2xl">
        Messages
      </h1>
      <ul className="mt-3 space-y-2 sm:mt-4 sm:space-y-3">
        {data.map((m) => (
          <li
            key={m.id}
            className={`border bg-white p-3 sm:p-4 ${m.read ? "border-line" : "border-gold"}`}
          >
            <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between sm:gap-3">
              <div className="min-w-0">
                <p className="text-sm font-semibold leading-snug sm:text-base">
                  {m.first_name} {m.last_name}
                  <span className="text-muted"> — {m.subject}</span>
                </p>
                <p className="mt-0.5 text-[11px] text-muted sm:text-xs">
                  <a href={`mailto:${m.email}`} className="hover:text-gold">
                    {m.email}
                  </a>
                  {" · "}
                  {new Date(m.created_at).toLocaleString("fr-FR", {
                    dateStyle: "short",
                    timeStyle: "short",
                  })}
                </p>
                <p className="mt-2 text-xs leading-relaxed text-muted sm:text-sm">
                  {m.message}
                </p>
              </div>
              <div className="flex shrink-0 gap-3 border-t border-line/60 pt-2 text-[10px] font-semibold tracking-wide uppercase sm:border-0 sm:pt-0 sm:text-xs">
                {!m.read && (
                  <button
                    type="button"
                    className="text-gold"
                    onClick={() => markRead.mutate(m.id)}
                  >
                    Lu
                  </button>
                )}
                <button
                  type="button"
                  className="text-red-600"
                  onClick={() => del.mutate(m.id)}
                >
                  Suppr.
                </button>
              </div>
            </div>
          </li>
        ))}
        {data.length === 0 && (
          <li className="border border-line bg-white px-3 py-6 text-center text-sm text-muted">
            Aucun message.
          </li>
        )}
      </ul>
    </div>
  );
}
