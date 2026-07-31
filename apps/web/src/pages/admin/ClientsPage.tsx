import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";

type Client = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string | null;
  _count: { appointments: number };
};

export default function ClientsPage() {
  const qc = useQueryClient();
  const { data = [] } = useQuery({
    queryKey: ["admin-clients"],
    queryFn: () => api<Client[]>("/api/admin/clients"),
  });

  const del = useMutation({
    mutationFn: (id: string) =>
      api(`/api/admin/clients/${id}`, { method: "DELETE" }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin-clients"] }),
  });

  return (
    <div>
      <h1 className="text-2xl font-bold uppercase tracking-wide">Clients</h1>
      <div className="mt-6 overflow-x-auto border border-line bg-white">
        <table className="min-w-full text-sm">
          <thead className="border-b border-line bg-soft text-xs uppercase">
            <tr>
              <th className="px-4 py-3 text-left">Nom</th>
              <th className="px-4 py-3 text-left">Email</th>
              <th className="px-4 py-3 text-left">Téléphone</th>
              <th className="px-4 py-3 text-left">RDV</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody>
            {data.map((c) => (
              <tr key={c.id} className="border-b border-line">
                <td className="px-4 py-3">
                  {c.firstName} {c.lastName}
                </td>
                <td className="px-4 py-3">{c.email}</td>
                <td className="px-4 py-3">{c.phone ?? "—"}</td>
                <td className="px-4 py-3">{c._count.appointments}</td>
                <td className="px-4 py-3 text-right">
                  <button
                    type="button"
                    className="text-xs text-red-600 uppercase"
                    onClick={() => {
                      if (confirm("Supprimer ce client ?")) del.mutate(c.id);
                    }}
                  >
                    Supprimer
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
