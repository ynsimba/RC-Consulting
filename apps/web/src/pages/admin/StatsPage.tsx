import { useQuery } from "@tanstack/react-query";
import { fetchAdminStats, fetchAppointments } from "@/lib/admin";

export default function StatsPage() {
  const { data } = useQuery({
    queryKey: ["admin-stats"],
    queryFn: fetchAdminStats,
  });

  const byStatusQuery = useQuery({
    queryKey: ["admin-appointments-all"],
    queryFn: () => fetchAppointments(),
  });

  const byStatus: Record<string, number> = {};
  for (const a of byStatusQuery.data ?? []) {
    byStatus[a.status] = (byStatus[a.status] ?? 0) + 1;
  }

  return (
    <div>
      <h1 className="text-2xl font-bold tracking-wide uppercase">Statistiques</h1>
      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {[
          ["Total RDV", data?.appointmentsTotal],
          ["RDV ce mois", data?.appointmentsMonth],
          ["À venir", data?.upcoming],
          ["Clients", data?.clientsTotal],
          ["Messages non lus", data?.messagesUnread],
          ["Articles", data?.articlesPublished],
        ].map(([label, value]) => (
          <div key={String(label)} className="border border-line bg-white p-6">
            <p className="text-xs tracking-wide text-muted uppercase">{label}</p>
            <p className="mt-2 font-serif text-4xl text-gold">{value ?? "—"}</p>
          </div>
        ))}
      </div>
      <div className="mt-8 border border-line bg-white p-6">
        <h2 className="font-semibold tracking-wide uppercase">Par statut</h2>
        <ul className="mt-4 space-y-2 text-sm">
          {Object.entries(byStatus).map(([status, count]) => (
            <li
              key={status}
              className="flex justify-between border-b border-line py-2"
            >
              <span>{status}</span>
              <span className="font-semibold text-gold">{count}</span>
            </li>
          ))}
          {Object.keys(byStatus).length === 0 && (
            <li className="text-muted">Aucune donnée.</li>
          )}
        </ul>
      </div>
    </div>
  );
}
