import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { fetchClients } from "@/lib/admin";
import { supabase } from "@/lib/supabase";

export default function ClientsPage() {
  const qc = useQueryClient();
  const { data = [], isLoading } = useQuery({
    queryKey: ["admin-clients"],
    queryFn: fetchClients,
  });

  const del = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("clients").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin-clients"] }),
  });

  return (
    <div className="mx-auto max-w-5xl">
      <h1 className="text-2xl font-bold tracking-wide uppercase">Clients</h1>
      <p className="mt-1 text-sm text-muted">
        Coordonnées collectées via les prises de rendez-vous.
      </p>

      {isLoading && <p className="mt-4 text-muted">Chargement…</p>}

      <div className="mt-6 overflow-x-auto border border-line bg-white">
        <table className="min-w-full text-sm">
          <thead className="border-b border-line bg-soft text-xs uppercase">
            <tr>
              <th className="px-4 py-3 text-left">Nom</th>
              <th className="px-4 py-3 text-left">Email</th>
              <th className="px-4 py-3 text-left">Téléphone</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody>
            {data.map((c) => (
              <tr key={c.id} className="border-b border-line">
                <td className="px-4 py-3 font-medium">
                  {c.first_name} {c.last_name}
                </td>
                <td className="px-4 py-3">
                  <a className="hover:text-gold" href={`mailto:${c.email}`}>
                    {c.email}
                  </a>
                </td>
                <td className="px-4 py-3">
                  {c.phone ? (
                    <a className="hover:text-gold" href={`tel:${c.phone}`}>
                      {c.phone}
                    </a>
                  ) : (
                    "—"
                  )}
                </td>
                <td className="px-4 py-3 text-right">
                  <button
                    type="button"
                    className="text-xs text-red-600 uppercase"
                    onClick={() => {
                      if (confirm("Supprimer ce client et ses RDV ?")) {
                        del.mutate(c.id);
                      }
                    }}
                  >
                    Supprimer
                  </button>
                </td>
              </tr>
            ))}
            {data.length === 0 && !isLoading && (
              <tr>
                <td colSpan={4} className="px-4 py-8 text-center text-muted">
                  Aucun client pour le moment.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
