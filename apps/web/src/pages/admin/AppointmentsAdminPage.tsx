import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";

type Appointment = {
  id: string;
  subject: string;
  startsAt: string;
  status: string;
  type: string;
  duration: number;
  client: { firstName: string; lastName: string; email: string; phone?: string | null };
};

export default function AppointmentsAdminPage() {
  const qc = useQueryClient();
  const { data = [], isLoading } = useQuery({
    queryKey: ["admin-appointments"],
    queryFn: () => api<Appointment[]>("/api/appointments"),
  });

  const updateStatus = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      api(`/api/appointments/${id}`, {
        method: "PATCH",
        body: JSON.stringify({ status }),
      }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin-appointments"] }),
  });

  return (
    <div>
      <h1 className="text-2xl font-bold uppercase tracking-wide">Rendez-vous</h1>
      {isLoading && <p className="mt-4 text-muted">Chargement…</p>}
      <div className="mt-6 overflow-x-auto border border-line bg-white">
        <table className="min-w-full text-left text-sm">
          <thead className="border-b border-line bg-soft text-xs uppercase tracking-wide">
            <tr>
              <th className="px-4 py-3">Date</th>
              <th className="px-4 py-3">Client</th>
              <th className="px-4 py-3">Sujet</th>
              <th className="px-4 py-3">Type</th>
              <th className="px-4 py-3">Statut</th>
              <th className="px-4 py-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {data.map((a) => (
              <tr key={a.id} className="border-b border-line">
                <td className="px-4 py-3 whitespace-nowrap">
                  {new Date(a.startsAt).toLocaleString("fr-FR")}
                  <div className="text-xs text-muted">{a.duration} min</div>
                </td>
                <td className="px-4 py-3">
                  {a.client.firstName} {a.client.lastName}
                  <div className="text-xs text-muted">{a.client.email}</div>
                </td>
                <td className="px-4 py-3">{a.subject}</td>
                <td className="px-4 py-3">{a.type}</td>
                <td className="px-4 py-3">{a.status}</td>
                <td className="px-4 py-3">
                  <select
                    className="border border-line px-2 py-1"
                    value={a.status}
                    onChange={(e) =>
                      updateStatus.mutate({ id: a.id, status: e.target.value })
                    }
                  >
                    {["PENDING", "CONFIRMED", "CANCELLED", "COMPLETED"].map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
