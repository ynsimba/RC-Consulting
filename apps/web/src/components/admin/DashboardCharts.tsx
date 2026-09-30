import { useMemo } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { Appointment, AppointmentStatus } from "@/types/database";

const STATUS_LABEL: Record<AppointmentStatus, string> = {
  pending: "En attente",
  confirmed: "Confirmé",
  refused: "Refusé",
  cancelled: "Annulé",
  completed: "Terminé",
};

const STATUS_COLOR: Record<AppointmentStatus, string> = {
  pending: "#c4a35a",
  confirmed: "#3d2b1f",
  refused: "#a34a3a",
  cancelled: "#9a9086",
  completed: "#6b8f71",
};

const STATUS_ORDER: AppointmentStatus[] = [
  "pending",
  "confirmed",
  "refused",
  "cancelled",
  "completed",
];

const TOOLTIP_STYLE = {
  border: "1px solid #e2d6c6",
  borderRadius: 10,
  boxShadow: "0 8px 24px -8px rgba(61,43,31,0.25)",
  fontSize: 13,
  padding: "8px 12px",
};

type Props = {
  appointments: Appointment[];
  isLoading?: boolean;
};

function EmptyChart({ label }: { label: string }) {
  return (
    <div className="grid h-full place-items-center text-[15px] text-muted">{label}</div>
  );
}

export function DashboardCharts({ appointments, isLoading }: Props) {
  const byStatus = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const a of appointments) {
      counts[a.status] = (counts[a.status] ?? 0) + 1;
    }
    return STATUS_ORDER.filter((s) => (counts[s] ?? 0) > 0).map((status) => ({
      key: status,
      name: STATUS_LABEL[status],
      value: counts[status] ?? 0,
      color: STATUS_COLOR[status],
    }));
  }, [appointments]);

  const byMonth = useMemo(() => {
    const now = new Date();
    const months: { key: string; label: string; total: number; confirmed: number; pending: number }[] =
      [];

    for (let i = 5; i >= 0; i -= 1) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      months.push({
        key,
        label: d.toLocaleDateString("fr-FR", { month: "short" }),
        total: 0,
        confirmed: 0,
        pending: 0,
      });
    }

    const index = new Map(months.map((m, i) => [m.key, i]));
    for (const a of appointments) {
      const d = new Date(a.starts_at);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      const i = index.get(key);
      if (i == null) continue;
      months[i].total += 1;
      if (a.status === "confirmed" || a.status === "completed") {
        months[i].confirmed += 1;
      }
      if (a.status === "pending") months[i].pending += 1;
    }

    return months;
  }, [appointments]);

  const total = byStatus.reduce((sum, s) => sum + s.value, 0);

  if (isLoading) {
    return (
      <div className="grid gap-4 lg:grid-cols-2 lg:gap-5">
        <div className="adm-card h-80 animate-pulse" />
        <div className="adm-card h-80 animate-pulse" />
      </div>
    );
  }

  return (
    <div className="grid gap-4 lg:grid-cols-2 lg:gap-5">
      <section
        className="adm-card overflow-hidden"
        aria-label="Répartition par statut"
      >
        <div className="adm-card-head">
          <div>
            <h2 className="adm-card-title">Répartition par statut</h2>
            <p className="mt-0.5 text-[13px] text-muted">
              {total} rendez-vous au total
            </p>
          </div>
        </div>
        <div className="h-72 px-2 py-3 sm:px-3">
          {byStatus.length === 0 ? (
            <EmptyChart label="Aucune donnée à afficher." />
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={byStatus}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="48%"
                  innerRadius={60}
                  outerRadius={88}
                  paddingAngle={2}
                  stroke="#fff"
                  strokeWidth={2}
                >
                  {byStatus.map((entry) => (
                    <Cell key={entry.key} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value) => [`${value ?? 0}`, "RDV"]}
                  contentStyle={TOOLTIP_STYLE}
                />
                <Legend
                  verticalAlign="bottom"
                  height={36}
                  iconType="circle"
                  wrapperStyle={{ fontSize: 12 }}
                />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>
      </section>

      <section
        className="adm-card overflow-hidden"
        aria-label="Volume mensuel"
      >
        <div className="adm-card-head">
          <div>
            <h2 className="adm-card-title">Volume sur 6 mois</h2>
            <p className="mt-0.5 text-[13px] text-muted">
              Total, confirmés et en attente
            </p>
          </div>
        </div>
        <div className="h-72 px-2 py-3 sm:px-3">
          {byMonth.every((m) => m.total === 0) ? (
            <EmptyChart label="Aucun rendez-vous sur la période." />
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={byMonth}
                margin={{ top: 8, right: 8, left: -12, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#efe7db" />
                <XAxis
                  dataKey="label"
                  tick={{ fill: "#7a6554", fontSize: 12 }}
                  axisLine={{ stroke: "#efe7db" }}
                  tickLine={false}
                />
                <YAxis
                  allowDecimals={false}
                  tick={{ fill: "#7a6554", fontSize: 12 }}
                  axisLine={false}
                  tickLine={false}
                  width={32}
                />
                <Tooltip
                  cursor={{ fill: "rgba(196,163,90,0.08)" }}
                  contentStyle={TOOLTIP_STYLE}
                />
                <Legend
                  verticalAlign="top"
                  height={28}
                  iconType="circle"
                  wrapperStyle={{ fontSize: 12 }}
                />
                <Bar
                  dataKey="total"
                  name="Total"
                  fill="#c4a35a"
                  maxBarSize={22}
                  radius={[4, 4, 0, 0]}
                />
                <Bar
                  dataKey="confirmed"
                  name="Confirmés"
                  fill="#3d2b1f"
                  maxBarSize={22}
                  radius={[4, 4, 0, 0]}
                />
                <Bar
                  dataKey="pending"
                  name="En attente"
                  fill="#d8bc7a"
                  maxBarSize={22}
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </section>
    </div>
  );
}
