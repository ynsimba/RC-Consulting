import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { fetchAdminStats } from "@/lib/admin";
import { useAuth } from "@/hooks/useAuth";

type Metric = {
  label: string;
  value: number | string;
  to: string;
  tone?: "default" | "alert" | "focus";
};

function MetricWidget({ label, value, to, tone = "default" }: Metric) {
  const isAlert = tone === "alert" && typeof value === "number" && value > 0;
  const isFocus = tone === "focus";

  return (
    <Link
      to={to}
      className={`group flex min-h-[4.5rem] flex-col justify-between border bg-white px-3 py-2.5 transition hover:border-gold sm:min-h-0 sm:px-3.5 sm:py-3 ${
        isAlert
          ? "border-gold/60 shadow-[inset_2px_0_0_0_var(--color-gold)]"
          : isFocus
            ? "border-line shadow-[inset_2px_0_0_0_var(--color-gold)]"
            : "border-line"
      }`}
    >
      <div className="flex items-start justify-between gap-2">
        <p className="text-[9px] font-semibold leading-tight tracking-[0.14em] text-muted uppercase sm:text-[10px]">
          {label}
        </p>
        <span
          aria-hidden
          className="text-[10px] text-muted transition group-hover:text-gold"
        >
          →
        </span>
      </div>
      <p
        className={`mt-1.5 font-serif text-2xl leading-none sm:text-[1.75rem] ${
          isAlert ? "text-gold" : "text-ink"
        }`}
      >
        {value}
      </p>
    </Link>
  );
}

function SkeletonWidget() {
  return (
    <div className="min-h-[4.5rem] animate-pulse border border-line bg-white px-3 py-2.5">
      <div className="h-2 w-16 bg-line/80" />
      <div className="mt-3 h-6 w-10 bg-line/60" />
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
        weekday: "short",
        day: "numeric",
        month: "short",
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
      tone: "focus",
    },
    {
      label: "Messages",
      value: data?.messagesUnread ?? "—",
      to: "/admin/messages",
      tone: "alert",
    },
    {
      label: "RDV ce mois",
      value: data?.appointmentsMonth ?? "—",
      to: "/admin/rendez-vous",
    },
    {
      label: "Clients",
      value: data?.clientsTotal ?? "—",
      to: "/admin/clients",
    },
    {
      label: "Articles",
      value: data?.articlesPublished ?? "—",
      to: "/admin/blog",
    },
    {
      label: "RDV total",
      value: data?.appointmentsTotal ?? "—",
      to: "/admin/statistiques",
    },
  ];

  const quickActions = [
    { to: "/admin/agenda", label: "Agenda" },
    { to: "/admin/rendez-vous", label: "RDV" },
    { to: "/admin/messages", label: "Messages" },
    { to: "/admin/disponibilites", label: "Dispos" },
    { to: "/admin/clients", label: "Clients" },
  ] as const;

  return (
    <div className="mx-auto max-w-5xl">
      <header className="flex flex-wrap items-center justify-between gap-2 border-b border-line pb-3">
        <div className="min-w-0">
          <h1 className="font-sans text-lg font-bold tracking-wide text-ink uppercase sm:text-xl">
            Dashboard
          </h1>
          <p className="mt-0.5 truncate text-xs text-muted">
            <span className="capitalize text-ink">{firstName}</span>
            <span className="mx-1 text-line">·</span>
            <span className="capitalize">{todayLabel}</span>
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-1.5">
          <Link
            to="/admin/agenda"
            className="btn-gold !px-3 !py-1.5 text-[10px] tracking-[0.12em]"
          >
            Agenda
          </Link>
          <button
            type="button"
            onClick={() => refetch()}
            disabled={isFetching}
            className="border border-line bg-white px-2.5 py-1.5 text-[10px] font-semibold tracking-[0.12em] text-ink uppercase transition hover:border-gold disabled:opacity-50"
          >
            {isFetching ? "…" : "Refresh"}
          </button>
        </div>
      </header>

      {isError && (
        <div
          className="mt-3 border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-800"
          role="alert"
        >
          Stats indisponibles.{" "}
          <button
            type="button"
            onClick={() => refetch()}
            className="font-semibold underline underline-offset-2"
          >
            Réessayer
          </button>
        </div>
      )}

      <section className="mt-3" aria-label="Indicateurs clés">
        {isLoading ? (
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <SkeletonWidget key={i} />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-6">
            {metrics.map((m) => (
              <MetricWidget key={m.label} {...m} />
            ))}
          </div>
        )}
      </section>

      <section
        className="mt-3 border border-line bg-white"
        aria-label="Actions rapides"
      >
        <div className="flex items-center justify-between gap-2 border-b border-line px-3 py-2">
          <p className="text-[9px] font-semibold tracking-[0.16em] text-muted uppercase">
            Accès rapide
          </p>
          <Link
            to="/admin/statistiques"
            className="text-[10px] font-semibold tracking-wide text-gold uppercase hover:underline"
          >
            Stats →
          </Link>
        </div>
        <div className="grid grid-cols-3 gap-px bg-line sm:grid-cols-5">
          {quickActions.map((action) => (
            <Link
              key={action.to}
              to={action.to}
              className="bg-white px-2 py-2.5 text-center text-[10px] font-semibold tracking-[0.12em] text-ink uppercase transition hover:bg-soft hover:text-gold sm:py-3 sm:text-[11px]"
            >
              {action.label}
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
