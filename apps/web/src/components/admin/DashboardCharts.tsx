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
  confirmed: "#2a1f18",
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

type Props = {
  appointments: Appointment[];
  isLoading?: boolean;
};

function EmptyChart({ label }: { label: string }) {
  return (
    <div className="grid h-48 place-items-center text-sm text-muted">{label}</div>
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
      <div className="grid gap-4 lg:grid-cols-2">
        <div className="h-64 animate-pulse border border-line bg-white" />
        <div className="h-64 animate-pulse border border-line bg-white" />
      </div>
    );
  }

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <section
        className="border border-line bg-white"
        aria-label="Répartition par statut"
      >
        <div className="border-b border-line px-3 py-2.5 sm:px-4">
          <p className="text-[10px] font-semibold tracking-[0.16em] text-muted uppercase">
            Répartition des RDV
          </p>
          <p className="mt-0.5 text-xs text-muted">
            {total} rendez-vous au total
          </p>
        </div>
        <div className="h-64 px-1 py-2 sm:px-2">
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
                  innerRadius={52}
                  outerRadius={78}
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
                  contentStyle={{
                    border: "1px solid #e6e0d6",
                    borderRadius: 0,
                    fontSize: 12,
                  }}
                />
                <Legend
                  verticalAlign="bottom"
                  height={36}
                  iconType="circle"
                  wrapperStyle={{ fontSize: 11 }}
                />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>
      </section>

      <section
        className="border border-line bg-white"
        aria-label="Volume mensuel"
      >
        <div className="border-b border-line px-3 py-2.5 sm:px-4">
          <p className="text-[10px] font-semibold tracking-[0.16em] text-muted uppercase">
            Volume sur 6 mois
          </p>
          <p className="mt-0.5 text-xs text-muted">
            Total, confirmés et en attente
          </p>
        </div>
        <div className="h-64 px-1 py-2 sm:px-2">
          {byMonth.every((m) => m.total === 0) ? (
            <EmptyChart label="Aucun rendez-vous sur la période." />
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={byMonth}
                margin={{ top: 8, right: 8, left: -12, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#e6e0d6" />
                <XAxis
                  dataKey="label"
                  tick={{ fill: "#7a7168", fontSize: 11 }}
                  axisLine={{ stroke: "#e6e0d6" }}
                  tickLine={false}
                />
                <YAxis
                  allowDecimals={false}
                  tick={{ fill: "#7a7168", fontSize: 11 }}
                  axisLine={false}
                  tickLine={false}
                  width={32}
                />
                <Tooltip
                  contentStyle={{
                    border: "1px solid #e6e0d6",
                    borderRadius: 0,
                    fontSize: 12,
                  }}
                />
                <Legend
                  verticalAlign="top"
                  height={28}
                  iconType="circle"
                  wrapperStyle={{ fontSize: 11 }}
                />
                <Bar
                  dataKey="total"
                  name="Total"
                  fill="#c4a35a"
                  maxBarSize={28}
                />
                <Bar
                  dataKey="confirmed"
                  name="Confirmés"
                  fill="#2a1f18"
                  maxBarSize={28}
                />
                <Bar
                  dataKey="pending"
                  name="En attente"
                  fill="#d8bc7a"
                  maxBarSize={28}
                />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </section>
    </div>
  );
}
