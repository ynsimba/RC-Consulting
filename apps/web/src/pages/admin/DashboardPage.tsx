import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import {
  fetchAdminStats,
  fetchAppointments,
  fetchTodayAppointments,
} from "@/lib/admin";
import { useAuth } from "@/hooks/useAuth";
import { DashboardCharts } from "@/components/admin/DashboardCharts";

type Metric = {
  label: string;
  value: number;
  to: string;
  hint: string;
  tone?: "default" | "alert" | "focus";
};

function MetricWidget({ label, value, to, hint, tone = "default" }: Metric) {
  const isAlert = tone === "alert" && value > 0;
  const isFocus = tone === "focus";

  return (
    <Link
      to={to}
      className={`group flex min-h-[6.5rem] flex-col justify-between border bg-white p-3.5 transition hover:border-gold sm:min-h-[7rem] sm:p-4 ${
        isAlert
          ? "border-gold shadow-[inset_3px_0_0_0_var(--color-gold)]"
          : isFocus
            ? "border-line shadow-[inset_3px_0_0_0_var(--color-gold)]"
            : "border-line"
      }`}
    >
      <div className="flex items-start justify-between gap-2">
        <p className="text-[10px] font-semibold tracking-[0.14em] text-muted uppercase">
          {label}
        </p>
        <span
          aria-hidden
          className="text-xs text-muted transition group-hover:text-gold"
        >
          →
        </span>
      </div>
      <p
        className={`mt-3 font-serif text-3xl leading-none tabular-nums sm:text-[2.15rem] ${
          isAlert ? "text-gold" : "text-ink"
        }`}
      >
        {value}
      </p>
      <p className="mt-2 text-[10px] leading-snug text-muted">{hint}</p>
    </Link>
  );
}

function CompactMetric({
  label,
  value,
  to,
}: {
  label: string;
  value: number;
  to: string;
}) {
  return (
    <Link
      to={to}
      className="group flex items-center justify-between gap-2 border border-line bg-white px-3 py-2.5 transition hover:border-gold sm:px-3.5 sm:py-3"
    >
      <div className="min-w-0">
        <p className="truncate text-[10px] font-semibold tracking-[0.12em] text-muted uppercase">
          {label}
        </p>
      </div>
      <div className="flex shrink-0 items-baseline gap-1.5">
        <p className="font-serif text-xl leading-none tabular-nums text-ink sm:text-2xl">
          {value}
        </p>
        <span
          aria-hidden
          className="text-[10px] text-muted transition group-hover:text-gold"
        >
          →
        </span>
      </div>
    </Link>
  );
}

function SkeletonWidget({ compact = false }: { compact?: boolean }) {
  if (compact) {
    return (
      <div className="animate-pulse border border-line bg-white px-3 py-2.5 sm:px-3.5 sm:py-3">
        <div className="flex items-center justify-between gap-2">
          <div className="h-2.5 w-16 bg-line/80" />
          <div className="h-5 w-8 bg-line/60" />
        </div>
      </div>
    );
  }
  return (
    <div className="min-h-[6.5rem] animate-pulse border border-line bg-white p-3.5 sm:min-h-[7rem] sm:p-4">
      <div className="h-2.5 w-20 bg-line/80" />
      <div className="mt-5 h-8 w-14 bg-line/60" />
      <div className="mt-3 h-2 w-28 bg-line/50" />
    </div>
  );
}

export default function DashboardPage() {
  const { user } = useAuth();
  const statsQuery = useQuery({
    queryKey: ["admin-stats"],
    queryFn: fetchAdminStats,
  });
  const todayQuery = useQuery({
    queryKey: ["admin-today"],
    queryFn: fetchTodayAppointments,
  });
  const appointmentsQuery = useQuery({
    queryKey: ["admin-appointments-all"],
    queryFn: () => fetchAppointments(),
  });

  const todayLabel = useMemo(
    () =>
      new Date().toLocaleDateString("fr-FR", {
        weekday: "long",
        day: "numeric",
        month: "long",
      }),
    [],
  );

  const firstName = useMemo(() => {
    if (user?.name?.trim()) return user.name.trim().split(/\s+/)[0];
    const local = user?.email?.split("@")[0] ?? "Admin";
    return local.split(/[._-]/)[0] || local;
  }, [user?.email, user?.name]);

  const data = statsQuery.data;
  const todayList = todayQuery.data ?? [];

  const primaryMetrics: Metric[] = [
    {
      label: "À venir",
      value: data?.upcoming ?? 0,
      to: "/admin/agenda",
      tone: "focus",
      hint: "Confirmés & en attente",
    },
    {
      label: "En attente",
      value: data?.pending ?? 0,
      to: "/admin/rendez-vous",
      tone: "alert",
      hint: "À confirmer ou refuser",
    },
    {
      label: "Messages",
      value: data?.messagesUnread ?? 0,
      to: "/admin/messages",
      tone: "alert",
      hint: "Non lus",
    },
  ];

  const secondaryMetrics = [
    {
      label: "Ce mois",
      value: data?.appointmentsMonth ?? 0,
      to: "/admin/rendez-vous",
    },
    {
      label: "Clients",
      value: data?.clientsTotal ?? 0,
      to: "/admin/clients",
    },
    {
      label: "Total RDV",
      value: data?.appointmentsTotal ?? 0,
      to: "/admin/rendez-vous",
    },
  ];

  const quickActions = [
    { to: "/admin/agenda", label: "Agenda" },
    { to: "/admin/rendez-vous", label: "Rendez-vous" },
    { to: "/admin/messages", label: "Messages" },
    { to: "/admin/disponibilites", label: "Disponibilités" },
    { to: "/admin/clients", label: "Clients" },
  ] as const;

  const loading = statsQuery.isLoading;

  return (
    <div className="mx-auto max-w-5xl space-y-4">
      <header className="flex flex-col gap-3 border-b border-line pb-3 sm:flex-row sm:items-end sm:justify-between">
        <div className="min-w-0">
          <p className="text-[10px] font-semibold tracking-[0.18em] text-gold uppercase">
            Administration
          </p>
          <h1 className="mt-0.5 font-sans text-xl font-bold tracking-wide text-ink uppercase sm:text-2xl">
            Bonjour, {firstName}
          </h1>
          <p className="mt-0.5 text-xs capitalize text-muted">{todayLabel}</p>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <Link
            to="/admin/agenda"
            className="btn-gold !px-3.5 !py-2 text-[10px] tracking-[0.12em]"
          >
            Ouvrir l’agenda
          </Link>
          <button
            type="button"
            onClick={() => {
              void statsQuery.refetch();
              void todayQuery.refetch();
              void appointmentsQuery.refetch();
            }}
            disabled={
              statsQuery.isFetching ||
              todayQuery.isFetching ||
              appointmentsQuery.isFetching
            }
            className="border border-line bg-white px-3 py-2 text-[10px] font-semibold tracking-[0.12em] text-ink uppercase transition hover:border-gold disabled:opacity-50"
          >
            {statsQuery.isFetching ||
            todayQuery.isFetching ||
            appointmentsQuery.isFetching
              ? "…"
              : "Actualiser"}
          </button>
        </div>
      </header>

      {(statsQuery.isError ||
        todayQuery.isError ||
        appointmentsQuery.isError) && (
        <div
          className="border border-red-200 bg-red-50 px-3 py-2.5 text-xs text-red-800"
          role="alert"
        >
          Impossible de charger le tableau de bord.{" "}
          <button
            type="button"
            onClick={() => {
              void statsQuery.refetch();
              void todayQuery.refetch();
              void appointmentsQuery.refetch();
            }}
            className="font-semibold underline underline-offset-2"
          >
            Réessayer
          </button>
        </div>
      )}

      <section aria-label="Indicateurs clés" className="space-y-2">
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
          {loading
            ? Array.from({ length: 3 }).map((_, i) => (
                <SkeletonWidget key={`p-${i}`} />
              ))
            : primaryMetrics.map((m) => (
                <MetricWidget key={m.label} {...m} />
              ))}
        </div>
        <div className="grid grid-cols-3 gap-2">
          {loading
            ? Array.from({ length: 3 }).map((_, i) => (
                <SkeletonWidget key={`s-${i}`} compact />
              ))
            : secondaryMetrics.map((m) => (
                <CompactMetric key={m.label} {...m} />
              ))}
        </div>
      </section>

      <DashboardCharts
        appointments={appointmentsQuery.data ?? []}
        isLoading={appointmentsQuery.isLoading}
      />

      <div className="grid gap-4 lg:grid-cols-[1.4fr_1fr]">
        <section
          className="border border-line bg-white"
          aria-label="Agenda du jour"
        >
          <div className="flex items-center justify-between gap-2 border-b border-line px-3 py-2.5 sm:px-4">
            <p className="text-[10px] font-semibold tracking-[0.16em] text-muted uppercase">
              Aujourd’hui
            </p>
            <Link
              to="/admin/agenda"
              className="text-[10px] font-semibold tracking-wide text-gold uppercase hover:underline"
            >
              Voir tout →
            </Link>
          </div>
          <ul className="divide-y divide-line">
            {todayQuery.isLoading && (
              <li className="px-3 py-5 text-sm text-muted sm:px-4">
                Chargement…
              </li>
            )}
            {!todayQuery.isLoading && todayList.length === 0 && (
              <li className="px-3 py-5 text-sm text-muted sm:px-4">
                Aucun rendez-vous prévu aujourd’hui.
              </li>
            )}
            {todayList.slice(0, 5).map((a) => (
              <li
                key={a.id}
                className="flex items-start justify-between gap-3 px-3 py-3 sm:px-4"
              >
                <div className="min-w-0">
                  <p className="text-[10px] font-semibold tracking-wide text-gold uppercase">
                    {new Date(a.starts_at).toLocaleTimeString("fr-FR", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}{" "}
                    · {a.duration} min
                  </p>
                  <p className="mt-0.5 truncate text-sm font-semibold">
                    {a.subject}
                  </p>
                  <p className="truncate text-xs text-muted">
                    {a.client?.first_name} {a.client?.last_name}
                  </p>
                </div>
                <span className="shrink-0 text-[10px] tracking-wide text-muted uppercase">
                  {a.status === "pending"
                    ? "Attente"
                    : a.status === "confirmed"
                      ? "Confirmé"
                      : a.status}
                </span>
              </li>
            ))}
          </ul>
        </section>

        <section
          className="border border-line bg-white"
          aria-label="Actions rapides"
        >
          <div className="border-b border-line px-3 py-2.5 sm:px-4">
            <p className="text-[10px] font-semibold tracking-[0.16em] text-muted uppercase">
              Accès rapide
            </p>
          </div>
          <div className="grid grid-cols-2 gap-px bg-line">
            {quickActions.map((action) => (
              <Link
                key={action.to}
                to={action.to}
                className="bg-white px-3 py-3.5 text-[11px] font-semibold tracking-[0.12em] text-ink uppercase transition hover:bg-soft hover:text-gold"
              >
                {action.label}
              </Link>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
