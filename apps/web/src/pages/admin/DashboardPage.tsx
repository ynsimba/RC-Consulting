import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { fetchAdminStats } from "@/lib/admin";
import { useAuth } from "@/hooks/useAuth";

type Metric = {
  label: string;
  value: number | string;
  to: string;
  hint: string;
  tone?: "default" | "alert" | "focus";
};

function MetricCard({ label, value, to, hint, tone = "default" }: Metric) {
  const isAlert = tone === "alert" && typeof value === "number" && value > 0;
  const isFocus = tone === "focus";

  return (
    <Link
      to={to}
      className={`group relative flex flex-col justify-between border bg-white p-5 transition duration-200 md:p-6 ${
        isAlert
          ? "border-gold/60 shadow-[inset_3px_0_0_0_var(--color-gold)]"
          : isFocus
            ? "border-line shadow-[inset_3px_0_0_0_var(--color-gold)]"
            : "border-line hover:border-gold/70"
      } hover:-translate-y-0.5 hover:border-gold`}
    >
      <div className="flex items-start justify-between gap-3">
        <p className="text-[10px] font-semibold tracking-[0.18em] text-muted uppercase">
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
        className={`mt-4 font-serif text-4xl leading-none md:text-[2.75rem] ${
          isAlert ? "text-gold" : "text-ink"
        }`}
      >
        {value}
      </p>
      <p className="mt-3 text-xs text-muted transition group-hover:text-ink">
        {hint}
      </p>
    </Link>
  );
}

function SkeletonCard() {
  return (
    <div className="animate-pulse border border-line bg-white p-5 md:p-6">
      <div className="h-2.5 w-24 bg-line/80" />
      <div className="mt-5 h-9 w-16 bg-line/60" />
      <div className="mt-4 h-2.5 w-32 bg-line/50" />
    </div>
  );
}

export default function DashboardPage() {
  const { user } = useAuth();
  const { data, isLoading, isError, refetch, isFetching } = useQuery({
    queryKey: ["admin-stats"],
    queryFn: fetchAdminStats,
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

  const metrics: Metric[] = [
    {
      label: "RDV à venir",
      value: data?.upcoming ?? "—",
      to: "/admin/agenda",
      hint: "Ouvrir l’agenda",
      tone: "focus",
    },
    {
      label: "Messages non lus",
      value: data?.messagesUnread ?? "—",
      to: "/admin/messages",
      hint: "Traiter la boîte de réception",
      tone: "alert",
    },
    {
      label: "RDV ce mois",
      value: data?.appointmentsMonth ?? "—",
      to: "/admin/rendez-vous",
      hint: "Liste des rendez-vous",
    },
    {
      label: "Clients",
      value: data?.clientsTotal ?? "—",
      to: "/admin/clients",
      hint: "Annuaire clients",
    },
    {
      label: "Articles publiés",
      value: data?.articlesPublished ?? "—",
      to: "/admin/blog",
      hint: "Gérer le blog",
    },
    {
      label: "RDV total",
      value: data?.appointmentsTotal ?? "—",
      to: "/admin/statistiques",
      hint: "Voir les statistiques",
    },
  ];

  const unread = data?.messagesUnread ?? 0;
  const upcoming = data?.upcoming ?? 0;

  const quickActions = [
    { to: "/admin/agenda", label: "Agenda" },
    { to: "/admin/rendez-vous", label: "Nouveau suivi RDV" },
    { to: "/admin/messages", label: "Messages" },
    { to: "/admin/disponibilites", label: "Disponibilités" },
    { to: "/admin/blog", label: "Blog" },
  ] as const;

  return (
    <div className="mx-auto max-w-6xl">
      <header className="flex flex-col gap-4 border-b border-line pb-5 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-[10px] font-semibold tracking-[0.2em] text-gold uppercase">
            Administration
          </p>
          <h1 className="mt-1 font-sans text-2xl font-bold tracking-wide text-ink uppercase md:text-[1.75rem]">
            Dashboard
          </h1>
          <p className="mt-1.5 text-sm text-muted">
            Bonjour,{" "}
            <span className="font-medium text-ink capitalize">{firstName}</span>
            <span className="mx-1.5 text-line">·</span>
            <span className="capitalize">{todayLabel}</span>
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Link
            to="/admin/agenda"
            className="btn-gold !px-4 !py-2 text-[11px] tracking-[0.14em]"
          >
            Voir l’agenda
          </Link>
          <button
            type="button"
            onClick={() => refetch()}
            disabled={isFetching}
            className="border border-line bg-white px-3 py-2 text-[11px] font-semibold tracking-[0.14em] text-ink uppercase transition hover:border-gold disabled:opacity-50"
          >
            {isFetching ? "Actualisation…" : "Actualiser"}
          </button>
        </div>
      </header>

      {(unread > 0 || upcoming > 0) && !isLoading && (
        <div className="mt-5 grid gap-2 sm:grid-cols-2">
          {upcoming > 0 && (
            <Link
              to="/admin/agenda"
              className="flex items-center justify-between gap-3 border border-line bg-white px-4 py-3 transition hover:border-gold"
            >
              <div>
                <p className="text-[10px] font-semibold tracking-[0.16em] text-muted uppercase">
                  Priorité
                </p>
                <p className="mt-0.5 text-sm text-ink">
                  {upcoming} rendez-vous à venir
                </p>
              </div>
              <span className="text-xs font-semibold text-gold">Agenda →</span>
            </Link>
          )}
          {unread > 0 && (
            <Link
              to="/admin/messages"
              className="flex items-center justify-between gap-3 border border-gold/50 bg-gold/5 px-4 py-3 transition hover:border-gold"
            >
              <div>
                <p className="text-[10px] font-semibold tracking-[0.16em] text-gold uppercase">
                  À traiter
                </p>
                <p className="mt-0.5 text-sm text-ink">
                  {unread} message{unread > 1 ? "s" : ""} non lu
                  {unread > 1 ? "s" : ""}
                </p>
              </div>
              <span className="text-xs font-semibold text-gold">Ouvrir →</span>
            </Link>
          )}
        </div>
      )}

      {isError && (
        <div
          className="mt-5 border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800"
          role="alert"
        >
          Impossible de charger les statistiques.{" "}
          <button
            type="button"
            onClick={() => refetch()}
            className="font-semibold underline underline-offset-2"
          >
            Réessayer
          </button>
        </div>
      )}

      <section className="mt-6" aria-label="Indicateurs clés">
        <div className="mb-3 flex items-baseline justify-between gap-3">
          <h2 className="text-[11px] font-semibold tracking-[0.18em] text-muted uppercase">
            Vue d’ensemble
          </h2>
          <p className="text-[11px] text-muted">Cliquez une carte pour ouvrir</p>
        </div>

        {isLoading ? (
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {metrics.map((m) => (
              <MetricCard key={m.label} {...m} />
            ))}
          </div>
        )}
      </section>

      <section className="mt-8 border border-line bg-white" aria-label="Actions rapides">
        <div className="flex flex-col gap-3 border-b border-line px-4 py-3 sm:flex-row sm:items-center sm:justify-between md:px-5">
          <div>
            <p className="text-[10px] font-semibold tracking-[0.18em] text-muted uppercase">
              Accès rapide
            </p>
            <p className="mt-0.5 text-sm text-ink">Raccourcis de gestion du cabinet</p>
          </div>
          <Link
            to="/admin/statistiques"
            className="text-xs font-semibold tracking-wide text-gold uppercase hover:underline"
          >
            Statistiques détaillées →
          </Link>
        </div>
        <div className="grid grid-cols-2 gap-px bg-line sm:grid-cols-3 lg:grid-cols-5">
          {quickActions.map((action) => (
            <Link
              key={action.to}
              to={action.to}
              className="bg-white px-4 py-4 text-center text-xs font-semibold tracking-[0.14em] text-ink uppercase transition hover:bg-soft hover:text-gold"
            >
              {action.label}
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
