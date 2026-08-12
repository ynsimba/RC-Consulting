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
import type { Appointment, AppointmentStatus } from "@/types/database";

function ymd(d: Date) {
  return d.toISOString().slice(0, 10);
}

function monthCells(year: number, month: number) {
  const first = new Date(year, month, 1);
  const offset = (first.getDay() + 6) % 7;
  const days = new Date(year, month + 1, 0).getDate();
  const cells: (Date | null)[] = Array.from({ length: offset }, () => null);
  for (let d = 1; d <= days; d += 1) cells.push(new Date(year, month, d));
  while (cells.length % 7 !== 0) cells.push(null);
  return cells;
}

const STATUS_LABEL: Record<AppointmentStatus, string> = {
  pending: "En attente",
  confirmed: "Confirmé",
  refused: "Refusé",
  cancelled: "Annulé",
  completed: "Terminé",
};

export default function AgendaPage() {
  const qc = useQueryClient();
  const today = useMemo(() => new Date(), []);
  const [viewYear, setViewYear] = useState(today.getFullYear());
  const [viewMonth, setViewMonth] = useState(today.getMonth());
  const [selectedDay, setSelectedDay] = useState(ymd(today));

  const todayQuery = useQuery({
    queryKey: ["admin-today"],
    queryFn: fetchTodayAppointments,
  });

  const monthStart = new Date(viewYear, viewMonth, 1);
  const monthEnd = new Date(viewYear, viewMonth + 1, 0, 23, 59, 59);
  const monthQuery = useQuery({
    queryKey: ["admin-month", viewYear, viewMonth],
    queryFn: () =>
      fetchAppointments({
        from: monthStart.toISOString(),
        to: monthEnd.toISOString(),
      }),
  });

  const dayList = useMemo(() => {
    return (monthQuery.data ?? []).filter(
      (a) => a.starts_at.slice(0, 10) === selectedDay,
    );
  }, [monthQuery.data, selectedDay]);

  const countsByDay = useMemo(() => {
    const map = new Map<string, number>();
    for (const a of monthQuery.data ?? []) {
      const key = a.starts_at.slice(0, 10);
      map.set(key, (map.get(key) ?? 0) + 1);
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

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <header className="flex flex-col gap-3 border-b border-line pb-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-[10px] font-semibold tracking-[0.18em] text-gold uppercase">
            Cabinet
          </p>
          <h1 className="text-2xl font-bold tracking-wide uppercase">Agenda</h1>
          <p className="mt-1 text-sm text-muted">
            Rendez-vous du jour et calendrier mensuel.
          </p>
        </div>
        <Link
          to="/admin/rendez-vous"
          className="text-xs font-semibold tracking-wide text-gold uppercase hover:underline"
        >
          Tous les RDV →
        </Link>
      </header>

      <section className="border border-line bg-white">
        <div className="border-b border-line px-4 py-3">
          <h2 className="text-[11px] font-semibold tracking-[0.16em] text-muted uppercase">
            Aujourd’hui —{" "}
            {today.toLocaleDateString("fr-FR", {
              weekday: "long",
              day: "numeric",
              month: "long",
            })}
          </h2>
        </div>
        <ul className="divide-y divide-line">
          {(todayQuery.data ?? []).map((a) => (
            <AgendaRow
              key={a.id}
              appointment={a}
              onStatus={(status) => mutation.mutate({ appointment: a, status })}
              onDelete={() => confirmDelete(a.id)}
            />
          ))}
          {(todayQuery.data ?? []).length === 0 && (
            <li className="px-4 py-6 text-sm text-muted">
              Aucun rendez-vous aujourd’hui.
            </li>
          )}
        </ul>
      </section>

      <div className="grid gap-4 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
        <section className="border border-line bg-white p-4">
          <div className="mb-3 flex items-center justify-between">
            <button
              type="button"
              className="h-8 w-8 border border-line"
              onClick={() => shiftMonth(-1)}
              aria-label="Mois précédent"
            >
              ‹
            </button>
            <p className="text-sm font-bold tracking-wide uppercase">
              {new Date(viewYear, viewMonth, 1).toLocaleDateString("fr-FR", {
                month: "long",
                year: "numeric",
              })}
            </p>
            <button
              type="button"
              className="h-8 w-8 border border-line"
              onClick={() => shiftMonth(1)}
              aria-label="Mois suivant"
            >
              ›
            </button>
          </div>
          <div className="grid grid-cols-7 gap-1 text-center text-[10px] text-muted uppercase">
            {["L", "M", "M", "J", "V", "S", "D"].map((d, i) => (
              <div key={`${d}-${i}`} className="py-1">
                {d}
              </div>
            ))}
            {monthCells(viewYear, viewMonth).map((d, i) => {
              if (!d) return <div key={`e-${i}`} className="h-9" />;
              const key = ymd(d);
              const count = countsByDay.get(key) ?? 0;
              const selected = key === selectedDay;
              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => setSelectedDay(key)}
                  className={`relative h-9 text-sm font-semibold ${
                    selected ? "bg-gold text-white" : "hover:bg-gold/15"
                  }`}
                >
                  {d.getDate()}
                  {count > 0 && !selected && (
                    <span className="absolute bottom-0.5 left-1/2 h-1 w-1 -translate-x-1/2 rounded-full bg-gold" />
                  )}
                </button>
              );
            })}
          </div>
        </section>

        <section className="border border-line bg-white">
          <div className="border-b border-line px-4 py-3">
            <h2 className="text-[11px] font-semibold tracking-[0.16em] text-muted uppercase">
              {new Date(selectedDay + "T12:00:00").toLocaleDateString("fr-FR", {
                weekday: "long",
                day: "numeric",
                month: "long",
              })}
            </h2>
          </div>
          <ul className="divide-y divide-line">
            {dayList.map((a) => (
              <AgendaRow
                key={a.id}
                appointment={a}
                onStatus={(status) => mutation.mutate({ appointment: a, status })}
                onDelete={() => confirmDelete(a.id)}
              />
            ))}
            {dayList.length === 0 && (
              <li className="px-4 py-6 text-sm text-muted">
                Aucun rendez-vous ce jour.
              </li>
            )}
          </ul>
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
    <li className="flex flex-col gap-3 px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <p className="text-xs tracking-wide text-gold uppercase">
          {STATUS_LABEL[a.status] ?? a.status}
        </p>
        <p className="mt-0.5 font-semibold">
          {new Date(a.starts_at).toLocaleTimeString("fr-FR", {
            hour: "2-digit",
            minute: "2-digit",
          })}{" "}
          — {a.subject}
        </p>
        <p className="text-sm text-muted">
          {a.client?.first_name} {a.client?.last_name}
          {a.client?.phone ? ` · ${a.client.phone}` : ""}
        </p>
        <p className="text-xs text-muted">{a.client?.email}</p>
      </div>
      <div className="flex flex-wrap gap-1.5">
        {a.status === "pending" && (
          <>
            <button
              type="button"
              className="border border-gold bg-gold px-2.5 py-1.5 text-[11px] font-semibold text-white uppercase"
              onClick={() => onStatus("confirmed")}
            >
              Confirmer
            </button>
            <button
              type="button"
              className="border border-line px-2.5 py-1.5 text-[11px] font-semibold uppercase"
              onClick={() => onStatus("refused")}
            >
              Refuser
            </button>
          </>
        )}
        <Link
          to="/admin/rendez-vous"
          className="border border-line px-2.5 py-1.5 text-[11px] font-semibold uppercase hover:border-gold"
        >
          Modifier
        </Link>
        <button
          type="button"
          className="border border-line px-2.5 py-1.5 text-[11px] font-semibold text-red-700 uppercase"
          onClick={onDelete}
        >
          Supprimer
        </button>
      </div>
    </li>
  );
}
