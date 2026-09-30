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
import {
  EmptyState,
  Icon,
  PageHeader,
  SkeletonRows,
  StatusBadge,
  formatTime,
  type IconName,
} from "@/components/admin/ui";

type Metric = {
  label: string;
  value: number;
  to: string;
  hint: string;
  icon: IconName;
  tone?: "default" | "alert";
};

function MetricCard({ label, value, to, hint, icon, tone = "default" }: Metric) {
  const isAlert = tone === "alert" && value > 0;

  return (
    <Link
      to={to}
      className="adm-card group relative flex flex-col gap-2.5 overflow-hidden p-4 transition sm:gap-4 sm:p-5 duration-200 hover:-translate-y-0.5 hover:border-gold/50"
    >
      {isAlert && (
        <span className="absolute inset-x-0 top-0 h-[3px] bg-gradient-to-r from-gold-light via-gold to-gold-dark" />
      )}
      <div className="flex items-center justify-between gap-3">
        <p className="text-[14px] font-medium text-muted">{label}</p>
        <span
          className={`grid h-9 w-9 place-items-center rounded-lg ring-1 ring-inset transition ${
            isAlert
              ? "bg-gold/12 text-gold-dark ring-gold/25"
              : "bg-soft text-brown ring-line group-hover:text-gold-dark"
          }`}
        >
          <Icon name={icon} className="h-[18px] w-[18px]" />
        </span>
      </div>
      <div className="flex items-end justify-between gap-2">
        <p className="font-serif text-3xl leading-none text-ink tabular-nums sm:text-4xl">
          {value}
        </p>
        {isAlert && (
          <span className="rounded-full bg-gold/12 px-2 py-0.5 text-[12px] font-medium text-gold-dark">
            Action requise
          </span>
        )}
      </div>
      <p className="-mt-1 flex items-center gap-1 text-[13px] text-muted">
        {hint}
        <Icon
          name="arrowRight"
          className="h-3.5 w-3.5 -translate-x-1 opacity-0 transition group-hover:translate-x-0 group-hover:opacity-100"
        />
      </p>
    </Link>
  );
}

function MetricSkeleton() {
  return (
    <div className="adm-card animate-pulse p-5">
      <div className="flex items-center justify-between">
        <div className="h-3 w-20 rounded bg-line/70" />
        <div className="h-9 w-9 rounded-lg bg-line/50" />
      </div>
      <div className="mt-4 h-9 w-14 rounded bg-line/60" />
      <div className="mt-3 h-2.5 w-28 rounded bg-line/50" />
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
        year: "numeric",
      }),
    [],
  );

  const greeting = useMemo(
    () => (new Date().getHours() < 18 ? "Bonjour" : "Bonsoir"),
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
      label: "Rendez-vous à venir",
      value: data?.upcoming ?? 0,
      to: "/admin/agenda",
      icon: "calendar",
      hint: "Confirmés et en attente",
    },
    {
      label: "En attente de réponse",
      value: data?.pending ?? 0,
      to: "/admin/rendez-vous",
      icon: "clock",
      tone: "alert",
      hint: "À confirmer ou refuser",
    },
    {
      label: "Messages non lus",
      value: data?.messagesUnread ?? 0,
      to: "/admin/messages",
      icon: "mail",
      tone: "alert",
      hint: "Formulaire de contact",
    },
  ];

  const secondaryMetrics = [
    { label: "Ce mois-ci", value: data?.appointmentsMonth ?? 0, to: "/admin/rendez-vous" },
    { label: "Clients", value: data?.clientsTotal ?? 0, to: "/admin/clients" },
    { label: "Total rendez-vous", value: data?.appointmentsTotal ?? 0, to: "/admin/rendez-vous" },
  ];

  const quickActions: { to: string; label: string; hint: string; icon: IconName }[] = [
    { to: "/admin/rendez-vous", label: "Gérer les rendez-vous", hint: "Confirmer, modifier, refuser", icon: "list" },
    { to: "/admin/disponibilites", label: "Disponibilités", hint: "Horaires et créneaux bloqués", icon: "clock" },
    { to: "/admin/messages", label: "Boîte de réception", hint: "Messages du site", icon: "mail" },
    { to: "/admin/clients", label: "Fichier clients", hint: "Coordonnées et export Excel", icon: "users" },
  ];

  const loading = statsQuery.isLoading;
  const fetching =
    statsQuery.isFetching || todayQuery.isFetching || appointmentsQuery.isFetching;
  const refetchAll = () => {
    void statsQuery.refetch();
    void todayQuery.refetch();
    void appointmentsQuery.refetch();
  };

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <PageHeader
        eyebrow={todayLabel}
        title={
          <>
            {greeting}, <span className="capitalize">{firstName}</span>
          </>
        }
        description="Voici l’activité du cabinet en un coup d’œil."
        actions={
          <>
            <button
              type="button"
              onClick={refetchAll}
              disabled={fetching}
              className="adm-btn"
            >
              <Icon name="refresh" className={`h-4 w-4 ${fetching ? "animate-spin" : ""}`} />
              Actualiser
            </button>
            <Link to="/admin/agenda" className="adm-btn-primary">
              <Icon name="calendar" />
              Ouvrir l’agenda
            </Link>
          </>
        }
      />

      {(statsQuery.isError || todayQuery.isError || appointmentsQuery.isError) && (
        <div
          className="flex items-center justify-between gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-[15px] text-red-800"
          role="alert"
        >
          <span>Impossible de charger le tableau de bord.</span>
          <button
            type="button"
            onClick={refetchAll}
            className="font-semibold underline underline-offset-2"
          >
            Réessayer
          </button>
        </div>
      )}

      <section aria-label="Indicateurs clés" className="space-y-3">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3 sm:gap-4">
          {loading
            ? Array.from({ length: 3 }).map((_, i) => <MetricSkeleton key={i} />)
            : primaryMetrics.map((m) => <MetricCard key={m.label} {...m} />)}
        </div>

        <div className="adm-card grid grid-cols-3 divide-x divide-line/70 overflow-hidden">
          {secondaryMetrics.map((m) => (
            <Link
              key={m.label}
              to={m.to}
              className="flex flex-col gap-1.5 px-4 py-3.5 transition hover:bg-[#fcfaf6] sm:flex-row sm:items-center sm:justify-between sm:px-5"
            >
              <p className="truncate text-[13px] text-muted">{m.label}</p>
              {loading ? (
                <span className="inline-block h-6 w-8 animate-pulse rounded bg-line/60" />
              ) : (
                <p className="font-serif text-2xl leading-none text-ink tabular-nums">
                  {m.value}
                </p>
              )}
            </Link>
          ))}
        </div>
      </section>

      <div className="grid gap-4 lg:grid-cols-[1.35fr_1fr] lg:gap-5">
        <section className="adm-card overflow-hidden" aria-label="Agenda du jour">
          <div className="adm-card-head">
            <div>
              <h2 className="adm-card-title">Aujourd’hui</h2>
              <p className="mt-0.5 text-[13px] text-muted">
                {todayQuery.isLoading
                  ? "Chargement…"
                  : `${todayList.length} rendez-vous prévu${todayList.length > 1 ? "s" : ""}`}
              </p>
            </div>
            <Link
              to="/admin/agenda"
              className="inline-flex items-center gap-1 text-[13px] font-medium text-gold-dark hover:text-gold"
            >
              Agenda complet
              <Icon name="arrowRight" className="h-3.5 w-3.5" />
            </Link>
          </div>

          {todayQuery.isLoading ? (
            <SkeletonRows rows={3} />
          ) : todayList.length === 0 ? (
            <EmptyState
              icon="calendar"
              title="Journée libre"
              hint="Aucun rendez-vous n’est prévu aujourd’hui."
            />
          ) : (
            <ul className="divide-y divide-line/50">
              {todayList.slice(0, 6).map((a) => (
                <li key={a.id} className="flex items-center gap-4 px-4 py-3.5 sm:px-5">
                  <div className="w-14 shrink-0 text-center">
                    <p className="text-[15px] font-semibold text-ink tabular-nums">
                      {formatTime(a.starts_at)}
                    </p>
                    <p className="text-[12px] text-muted">{a.duration} min</p>
                  </div>
                  <span className="h-10 w-px shrink-0 bg-gradient-to-b from-gold/0 via-gold/60 to-gold/0" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[15px] font-medium text-ink">{a.subject}</p>
                    <p className="truncate text-[13px] text-muted">
                      {a.client?.first_name} {a.client?.last_name}
                    </p>
                  </div>
                  <StatusBadge status={a.status} />
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="adm-card overflow-hidden" aria-label="Accès rapide">
          <div className="adm-card-head">
            <h2 className="adm-card-title">Accès rapide</h2>
          </div>
          <ul className="divide-y divide-line/50">
            {quickActions.map((action) => (
              <li key={action.to}>
                <Link
                  to={action.to}
                  className="group flex items-center gap-3.5 px-4 py-3 transition hover:bg-[#fcfaf6] sm:px-5"
                >
                  <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-soft text-brown ring-1 ring-line transition group-hover:bg-gold/12 group-hover:text-gold-dark group-hover:ring-gold/25">
                    <Icon name={action.icon} className="h-[18px] w-[18px]" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-[15px] font-medium text-ink">{action.label}</p>
                    <p className="truncate text-[13px] text-muted">{action.hint}</p>
                  </div>
                  <Icon
                    name="chevronRight"
                    className="h-4 w-4 text-line transition group-hover:translate-x-0.5 group-hover:text-gold"
                  />
                </Link>
              </li>
            ))}
          </ul>
        </section>
      </div>

      <DashboardCharts
        appointments={appointmentsQuery.data ?? []}
        isLoading={appointmentsQuery.isLoading}
      />
    </div>
  );
}
