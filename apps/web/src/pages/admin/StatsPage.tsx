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
    <div className="mx-auto max-w-5xl">
      <h1 className="text-xl font-bold tracking-wide uppercase sm:text-2xl">
        Statistiques
      </h1>
      <div className="mt-3 grid grid-cols-2 gap-2 sm:mt-5 sm:grid-cols-3 sm:gap-3">
        {[
          ["Total RDV", data?.appointmentsTotal],
          ["RDV ce mois", data?.appointmentsMonth],
          ["À venir", data?.upcoming],
          ["Clients", data?.clientsTotal],
          ["Messages", data?.messagesUnread],
          ["Articles", data?.articlesPublished],
        ].map(([label, value]) => (
          <div
            key={String(label)}
            className="border border-line bg-white px-3 py-2.5 sm:p-4"
          >
            <p className="text-[9px] tracking-[0.14em] text-muted uppercase sm:text-[10px]">
              {label}
            </p>
            <p className="mt-1 font-serif text-2xl text-gold sm:mt-1.5 sm:text-3xl">
              {value ?? "—"}
            </p>
          </div>
        ))}
      </div>
      <div className="mt-3 border border-line bg-white p-3 sm:mt-5 sm:p-5">
        <h2 className="text-xs font-semibold tracking-wide uppercase sm:text-sm">
          Par statut
        </h2>
        <ul className="mt-2 space-y-0 sm:mt-3">
          {Object.entries(byStatus).map(([status, count]) => (
            <li
              key={status}
              className="flex justify-between border-b border-line py-2 text-xs sm:text-sm"
            >
              <span>{status}</span>
              <span className="font-semibold text-gold">{count}</span>
            </li>
          ))}
          {Object.keys(byStatus).length === 0 && (
            <li className="py-2 text-sm text-muted">Aucune donnée.</li>
          )}
        </ul>
      </div>
    </div>
  );
}
