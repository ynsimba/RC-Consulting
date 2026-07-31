import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { api } from "@/lib/api";

type Stats = {
  appointmentsTotal: number;
  appointmentsMonth: number;
  clientsTotal: number;
  messagesUnread: number;
  articlesPublished: number;
  upcoming: number;
};

export default function DashboardPage() {
  const { data } = useQuery({
    queryKey: ["admin-stats"],
    queryFn: () => api<Stats>("/api/admin/stats"),
  });

  const cards = [
    ["RDV à venir", data?.upcoming ?? "—", "/admin/agenda"],
    ["RDV ce mois", data?.appointmentsMonth ?? "—", "/admin/rendez-vous"],
    ["Clients", data?.clientsTotal ?? "—", "/admin/clients"],
    ["Messages non lus", data?.messagesUnread ?? "—", "/admin/messages"],
    ["Articles publiés", data?.articlesPublished ?? "—", "/admin/blog"],
    ["RDV total", data?.appointmentsTotal ?? "—", "/admin/statistiques"],
  ] as const;

  return (
    <div>
      <h1 className="text-2xl font-bold uppercase tracking-wide">Dashboard</h1>
      <p className="mt-2 text-muted">Vue d&apos;ensemble du cabinet.</p>
      <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {cards.map(([label, value, to]) => (
          <Link
            key={label}
            to={to}
            className="border border-line bg-white p-6 transition hover:border-gold"
          >
            <p className="text-xs tracking-[0.16em] text-muted uppercase">{label}</p>
            <p className="mt-3 font-serif text-4xl text-gold">{value}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
