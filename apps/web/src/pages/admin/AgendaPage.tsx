import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  fetchAppointments,
  fetchTodayAppointments,
  deleteAppointment,
} from "@/lib/admin";
import {
  confirmAppointmentWithEmail,
  refuseAppointmentWithEmail,
} from "@/lib/emails/adminActions";
import {
  brusselsDayBoundsIso,
  brusselsWallToIso,
  brusselsYmdFromIso,
  toLocalYmd,
} from "@/lib/datetime";
import type { Appointment, AppointmentStatus } from "@/types/database";
import {
  Avatar,
  EmptyState,
  Icon,
  PageHeader,
  SkeletonRows,
  StatusBadge,
  formatTime,
} from "@/components/admin/ui";

function monthCells(year: number, month: number) {
  const first = new Date(year, month, 1);
  const offset = (first.getDay() + 6) % 7;
  const days = new Date(year, month + 1, 0).getDate();
  const cells: (Date | null)[] = Array.from({ length: offset }, () => null);
  for (let d = 1; d <= days; d += 1) cells.push(new Date(year, month, d));
  while (cells.length % 7 !== 0) cells.push(null);
  return cells;
}

export default function AgendaPage() {
  const qc = useQueryClient();
  const today = useMemo(() => new Date(), []);
  const todayYmd = toLocalYmd(today);
  const [viewYear, setViewYear] = useState(today.getFullYear());
  const [viewMonth, setViewMonth] = useState(today.getMonth());
  const [selectedDay, setSelectedDay] = useState(todayYmd);

  const todayQuery = useQuery({
    queryKey: ["admin-today"],
    queryFn: fetchTodayAppointments,
  });

  const monthStartYmd = `${viewYear}-${String(viewMonth + 1).padStart(2, "0")}-01`;
  const lastDay = new Date(viewYear, viewMonth + 1, 0).getDate();
  const monthEndYmd = `${viewYear}-${String(viewMonth + 1).padStart(2, "0")}-${String(lastDay).padStart(2, "0")}`;
  const monthBounds = useMemo(
    () => ({
      from: brusselsWallToIso(monthStartYmd, "00:00:00"),
      to: brusselsDayBoundsIso(monthEndYmd).to,
    }),
    [monthStartYmd, monthEndYmd],
  );
  const monthQuery = useQuery({
    queryKey: ["admin-month", viewYear, viewMonth],
    queryFn: () =>
      fetchAppointments({
        from: monthBounds.from,
        to: monthBounds.to,
      }),
  });

  const dayList = useMemo(() => {
    return (monthQuery.data ?? [])
      .filter((a) => brusselsYmdFromIso(a.starts_at) === selectedDay)
      .sort(
        (a, b) =>
          new Date(a.starts_at).getTime() - new Date(b.starts_at).getTime(),
      );
  }, [monthQuery.data, selectedDay]);

  const countsByDay = useMemo(() => {
    const map = new Map<string, { total: number; pending: number }>();
    for (const a of monthQuery.data ?? []) {
      const key = brusselsYmdFromIso(a.starts_at);
      const entry = map.get(key) ?? { total: 0, pending: 0 };
      entry.total += 1;
      if (a.status === "pending") entry.pending += 1;
      map.set(key, entry);
    }
    return map;
  }, [monthQuery.data]);

  const mutation = useMutation({
    mutationFn: async ({
      appointment,
      status,
    }: {
      appointment: Appointment;
      status: AppointmentStatus;
    }) => {
      if (status === "confirmed") {
        return confirmAppointmentWithEmail(appointment);
      }
      if (status === "refused") {
        const reason =
          window.prompt("Motif du refus (optionnel) :") ?? undefined;
        return refuseAppointmentWithEmail(appointment, reason || undefined);
      }
      throw new Error("Action non supportée");
    },
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ["admin-today"] });
      void qc.invalidateQueries({ queryKey: ["admin-month"] });
      void qc.invalidateQueries({ queryKey: ["admin-appointments"] });
      void qc.invalidateQueries({ queryKey: ["admin-stats"] });
    },
  });

  const remove = useMutation({
    mutationFn: (id: string) => deleteAppointment(id),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ["admin-today"] });
      void qc.invalidateQueries({ queryKey: ["admin-month"] });
      void qc.invalidateQueries({ queryKey: ["admin-appointments"] });
      void qc.invalidateQueries({ queryKey: ["admin-stats"] });
    },
  });

  function confirmDelete(id: string) {
    if (confirm("Supprimer définitivement ce rendez-vous ?")) {
      remove.mutate(id);
    }
  }

  function shiftMonth(delta: number) {
    const d = new Date(viewYear, viewMonth + delta, 1);
    setViewYear(d.getFullYear());
    setViewMonth(d.getMonth());
  }

  function goToday() {
    setViewYear(today.getFullYear());
    setViewMonth(today.getMonth());
    setSelectedDay(todayYmd);
  }

  const todayList = todayQuery.data ?? [];
  const monthTotal = monthQuery.data?.length ?? 0;

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <PageHeader
        eyebrow="Pilotage"
        title="Agenda"
        description="Rendez-vous du jour et vue mensuelle du cabinet."
        actions={
          <Link to="/admin/rendez-vous" className="adm-btn">
            <Icon name="list" />
            Tous les rendez-vous
          </Link>
        }
      />

      {/* Aujourd’hui */}
      <section className="adm-card overflow-hidden">
        <div className="adm-card-head">
          <div>
            <h2 className="adm-card-title">Aujourd’hui</h2>
            <p className="mt-0.5 text-[13px] text-muted capitalize">
              {today.toLocaleDateString("fr-FR", {
                weekday: "long",
                day: "numeric",
                month: "long",
              })}
            </p>
          </div>
          <span className="rounded-full bg-soft px-2.5 py-1 text-[13px] font-medium text-muted tabular-nums">
            {todayList.length} RDV
          </span>
        </div>
        {todayQuery.isLoading ? (
          <SkeletonRows rows={2} />
        ) : todayList.length === 0 ? (
          <EmptyState icon="calendar" title="Aucun rendez-vous aujourd’hui" />
        ) : (
          <ul className="divide-y divide-line/50">
            {todayList.map((a) => (
              <AgendaRow
                key={a.id}
                appointment={a}
                onStatus={(status) => mutation.mutate({ appointment: a, status })}
                onDelete={() => confirmDelete(a.id)}
              />
            ))}
          </ul>
        )}
      </section>

      <div className="grid gap-4 lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)] lg:gap-5">
        {/* Calendrier */}
        <section className="adm-card p-4 sm:p-5">
          <div className="mb-4 flex items-center justify-between gap-2">
            <div>
              <p className="text-base font-semibold text-ink capitalize">
                {new Date(viewYear, viewMonth, 1).toLocaleDateString("fr-FR", {
                  month: "long",
                  year: "numeric",
                })}
              </p>
              <p className="text-[13px] text-muted">
                {monthTotal} rendez-vous ce mois
              </p>
            </div>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={goToday}
                className="adm-btn adm-btn-sm mr-1"
              >
                Aujourd’hui
              </button>
              <button
                type="button"
                className="adm-icon-btn border border-line"
                onClick={() => shiftMonth(-1)}
                aria-label="Mois précédent"
              >
                <Icon name="chevronLeft" />
              </button>
              <button
                type="button"
                className="adm-icon-btn border border-line"
                onClick={() => shiftMonth(1)}
                aria-label="Mois suivant"
              >
                <Icon name="chevronRight" />
              </button>
            </div>
          </div>
          <div className="grid grid-cols-7 gap-1 text-center">
            {["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"].map((d) => (
              <div
                key={d}
                className="pb-2 text-[12px] font-medium tracking-wide text-muted uppercase"
              >
                {d}
              </div>
            ))}
            {monthCells(viewYear, viewMonth).map((d, i) => {
              if (!d) return <div key={`e-${i}`} className="aspect-square" />;
              const key = toLocalYmd(d);
              const info = countsByDay.get(key);
              const selected = key === selectedDay;
              const isToday = key === todayYmd;
              const weekend = d.getDay() === 0 || d.getDay() === 6;
              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => setSelectedDay(key)}
                  aria-pressed={selected}
                  aria-label={`${d.toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long" })}${info ? `, ${info.total} rendez-vous` : ""}`}
                  className={`relative flex aspect-square flex-col items-center justify-center rounded-lg text-[15px] transition ${
                    selected
                      ? "bg-brown-deep font-semibold text-white shadow-md"
                      : isToday
                        ? "font-semibold text-gold-dark ring-1 ring-gold ring-inset hover:bg-gold/10"
                        : weekend
                          ? "text-muted/70 hover:bg-soft"
                          : "text-ink hover:bg-soft"
                  }`}
                >
                  {d.getDate()}
                  {info && (
                    <span className="absolute bottom-1.5 flex gap-0.5">
                      {Array.from({ length: Math.min(info.total, 3) }).map(
                        (_, j) => (
                          <span
                            key={j}
                            className={`h-1 w-1 rounded-full ${
                              selected
                                ? "bg-gold-light"
                                : j < info.pending
                                  ? "bg-gold"
                                  : "bg-brown/60"
                            }`}
                          />
                        ),
                      )}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
          <div className="mt-4 flex items-center gap-4 border-t border-line/60 pt-3 text-[12px] text-muted">
            <span className="inline-flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-gold" /> En attente
            </span>
            <span className="inline-flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-brown/60" /> Autres
            </span>
          </div>
        </section>

        {/* Jour sélectionné */}
        <section className="adm-card overflow-hidden">
          <div className="adm-card-head">
            <div>
              <h2 className="adm-card-title capitalize">
                {new Date(selectedDay + "T12:00:00").toLocaleDateString("fr-FR", {
                  weekday: "long",
                  day: "numeric",
                  month: "long",
                })}
              </h2>
              <p className="mt-0.5 text-[13px] text-muted">
                {dayList.length} rendez-vous
              </p>
            </div>
          </div>
          {monthQuery.isLoading ? (
            <SkeletonRows rows={3} />
          ) : dayList.length === 0 ? (
            <EmptyState
              icon="calendar"
              title="Aucun rendez-vous ce jour"
              hint="Sélectionnez une autre date dans le calendrier."
            />
          ) : (
            <ul className="divide-y divide-line/50">
              {dayList.map((a) => (
                <AgendaRow
                  key={a.id}
                  appointment={a}
                  onStatus={(status) => mutation.mutate({ appointment: a, status })}
                  onDelete={() => confirmDelete(a.id)}
                />
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}

function AgendaRow({
  appointment: a,
  onStatus,
  onDelete,
}: {
  appointment: Appointment;
  onStatus: (s: AppointmentStatus) => void;
  onDelete: () => void;
}) {
  return (
    <li className="flex flex-col gap-3 px-4 py-4 sm:flex-row sm:items-center sm:gap-4 sm:px-5">
      <div className="flex min-w-0 flex-1 items-center gap-4">
        <div className="w-14 shrink-0 rounded-lg bg-soft py-1.5 text-center ring-1 ring-line/70">
          <p className="text-[15px] font-semibold text-ink tabular-nums">
            {formatTime(a.starts_at)}
          </p>
          <p className="text-[11px] text-muted">{a.duration} min</p>
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <p className="truncate text-[15px] font-medium text-ink">{a.subject}</p>
            <StatusBadge status={a.status} />
          </div>
          <div className="mt-1 flex items-center gap-2">
            <Avatar first={a.client?.first_name} last={a.client?.last_name} size="sm" />
            <p className="min-w-0 truncate text-[13px] text-muted">
              <span className="text-ink/80">
                {a.client?.first_name} {a.client?.last_name}
              </span>
              {a.client?.phone ? ` · ${a.client.phone}` : ""}
              {a.client?.email ? ` · ${a.client.email}` : ""}
            </p>
          </div>
        </div>
      </div>
      <div className="flex shrink-0 flex-wrap items-center gap-1.5">
        {a.status === "pending" && (
          <>
            <button
              type="button"
              className="adm-btn-primary adm-btn-sm"
              onClick={() => onStatus("confirmed")}
            >
              <Icon name="check" className="h-3.5 w-3.5" />
              Confirmer
            </button>
            <button
              type="button"
              className="adm-btn adm-btn-sm"
              onClick={() => onStatus("refused")}
            >
              <Icon name="x" className="h-3.5 w-3.5" />
              Refuser
            </button>
          </>
        )}
        <Link
          to="/admin/rendez-vous"
          className="adm-icon-btn"
          aria-label="Modifier"
          title="Modifier"
        >
          <Icon name="edit" />
        </Link>
        <button
          type="button"
          className="adm-icon-btn hover:!bg-red-50 hover:!text-red-700"
          onClick={onDelete}
          aria-label="Supprimer"
          title="Supprimer"
        >
          <Icon name="trash" />
        </button>
      </div>
    </li>
  );
}
