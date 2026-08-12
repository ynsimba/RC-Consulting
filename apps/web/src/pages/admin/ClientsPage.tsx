import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { fetchClients } from "@/lib/admin";
import { downloadClientsExcel } from "@/lib/exportClientsExcel";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/Button";

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

  function onDelete(id: string) {
    if (confirm("Supprimer ce client et ses RDV ?")) del.mutate(id);
  }

  return (
    <div className="mx-auto max-w-5xl">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-xl font-bold tracking-wide uppercase sm:text-2xl">
            Clients
          </h1>
          <p className="mt-0.5 text-xs text-muted sm:text-sm">
            Coordonnées issues des prises de rendez-vous.
          </p>
        </div>
        <Button
          type="button"
          variant="outline"
          className="w-full sm:w-auto"
          disabled={isLoading || data.length === 0}
          onClick={() => downloadClientsExcel(data)}
        >
          Télécharger Excel
        </Button>
      </div>

      {isLoading && <p className="mt-3 text-sm text-muted">Chargement…</p>}

      {/* Mobile : cartes */}
      <ul className="mt-4 space-y-2 md:hidden">
        {data.map((c) => (
          <li key={c.id} className="border border-line bg-white p-3">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <p className="text-sm font-semibold">
                  {c.first_name} {c.last_name}
                </p>
                <a
                  className="mt-1 block truncate text-xs text-muted hover:text-gold"
                  href={`mailto:${c.email}`}
                >
                  {c.email}
                </a>
                {c.phone ? (
                  <a
                    className="mt-0.5 block text-xs text-muted hover:text-gold"
                    href={`tel:${c.phone}`}
                  >
                    {c.phone}
                  </a>
                ) : (
                  <p className="mt-0.5 text-xs text-muted">Pas de téléphone</p>
                )}
              </div>
              <button
                type="button"
                className="shrink-0 text-[10px] font-semibold tracking-wide text-red-600 uppercase"
                onClick={() => onDelete(c.id)}
              >
                Suppr.
              </button>
            </div>
          </li>
        ))}
        {data.length === 0 && !isLoading && (
          <li className="border border-line bg-white px-3 py-6 text-center text-sm text-muted">
            Aucun client pour le moment.
          </li>
        )}
      </ul>

      {/* Desktop : table */}
      <div className="mt-4 hidden overflow-hidden border border-line bg-white md:block">
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="border-b border-line bg-soft text-xs uppercase">
              <tr>
                <th className="px-3 py-2.5 text-left">Nom</th>
                <th className="px-3 py-2.5 text-left">Email</th>
                <th className="px-3 py-2.5 text-left">Téléphone</th>
                <th className="px-3 py-2.5" />
              </tr>
            </thead>
            <tbody>
              {data.map((c) => (
                <tr key={c.id} className="border-b border-line">
                  <td className="px-3 py-2.5 font-medium">
                    {c.first_name} {c.last_name}
                  </td>
                  <td className="px-3 py-2.5">
                    <a className="hover:text-gold" href={`mailto:${c.email}`}>
                      {c.email}
                    </a>
                  </td>
                  <td className="px-3 py-2.5">
                    {c.phone ? (
                      <a className="hover:text-gold" href={`tel:${c.phone}`}>
                        {c.phone}
                      </a>
                    ) : (
                      "—"
                    )}
                  </td>
                  <td className="px-3 py-2.5 text-right">
                    <button
                      type="button"
                      className="text-xs text-red-600 uppercase"
                      onClick={() => onDelete(c.id)}
                    >
                      Supprimer
                    </button>
                  </td>
                </tr>
              ))}
              {data.length === 0 && !isLoading && (
                <tr>
                  <td
                    colSpan={4}
                    className="px-3 py-8 text-center text-muted"
                  >
                    Aucun client pour le moment.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
