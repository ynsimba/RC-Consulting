import { useMemo, useState, type ReactNode } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createAvailabilityWindow,
  createBlockedSlot,
  deleteAvailabilityWindow,
  deleteBlockedSlot,
  fetchAvailabilityWindows,
  fetchBlockedSlots,
  updateAllowedDurations,
  updateAvailabilityWindow,
} from "@/lib/admin";
import { fetchSettings } from "@/lib/bookings";
import type { AvailabilityWindow } from "@/types/database";
import { EmptyState, Icon, PageHeader } from "@/components/admin/ui";

const days = ["Dimanche", "Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi"];
/** Semaine affichée du lundi au dimanche. */
const WEEK_ORDER = [1, 2, 3, 4, 5, 6, 0];

const emptyWindowForm = {
  day_of_week: 1,
  start_time: "09:30",
  end_time: "18:30",
};

function toTimeInput(value: string) {
  return String(value).slice(0, 5);
}

function SectionCard({
  icon,
  title,
  description,
  children,
}: {
  icon: "clock" | "calendar" | "ban";
  title: string;
  description: string;
  children: ReactNode;
}) {
  return (
    <section className="adm-card overflow-hidden">
      <div className="flex items-start gap-3 border-b border-line/70 px-4 py-4 sm:px-5">
        <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-soft text-gold-dark ring-1 ring-line">
          <Icon name={icon} className="h-[18px] w-[18px]" />
        </span>
        <div>
          <h2 className="adm-card-title">{title}</h2>
          <p className="mt-0.5 text-[13px] text-muted">{description}</p>
        </div>
      </div>
      <div className="px-4 py-4 sm:px-5 sm:py-5">{children}</div>
    </section>
  );
}

export default function AvailabilityPage() {
  const qc = useQueryClient();
  const windowsQuery = useQuery({
    queryKey: ["admin-windows"],
    queryFn: fetchAvailabilityWindows,
  });
  const blockedQuery = useQuery({
    queryKey: ["admin-blocked"],
    queryFn: () => fetchBlockedSlots(),
  });
  const settingsQuery = useQuery({
    queryKey: ["admin-settings"],
    queryFn: fetchSettings,
  });

  const [windowForm, setWindowForm] = useState(emptyWindowForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [blockForm, setBlockForm] = useState({
    date: "",
    start_time: "",
    end_time: "",
    reason: "",
    allDay: true,
  });
  const [durationsText, setDurationsText] = useState("");

  function resetWindowForm() {
    setEditingId(null);
    setWindowForm(emptyWindowForm);
  }

  function startEdit(w: AvailabilityWindow) {
    setEditingId(w.id);
    setWindowForm({
      day_of_week: w.day_of_week,
      start_time: toTimeInput(w.start_time),
      end_time: toTimeInput(w.end_time),
    });
  }

  const saveWindow = useMutation({
    mutationFn: async () => {
      if (windowForm.start_time >= windowForm.end_time) {
        throw new Error("L'heure de fin doit être après l'heure de début");
      }
      if (editingId) {
        return updateAvailabilityWindow(editingId, windowForm);
      }
      return createAvailabilityWindow(windowForm);
    },
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ["admin-windows"] });
      resetWindowForm();
    },
  });

  const deleteWindow = useMutation({
    mutationFn: (id: string) => deleteAvailabilityWindow(id),
    onSuccess: (_data, id) => {
      void qc.invalidateQueries({ queryKey: ["admin-windows"] });
      if (editingId === id) resetWindowForm();
    },
  });

  const createBlocked = useMutation({
    mutationFn: () =>
      createBlockedSlot({
        date: blockForm.date,
        start_time: blockForm.allDay ? null : blockForm.start_time || null,
        end_time: blockForm.allDay ? null : blockForm.end_time || null,
        reason: blockForm.reason || "Indisponible",
      }),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ["admin-blocked"] });
      setBlockForm({
        date: "",
        start_time: "",
        end_time: "",
        reason: "",
        allDay: true,
      });
    },
  });

  const deleteBlocked = useMutation({
    mutationFn: (id: string) => deleteBlockedSlot(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin-blocked"] }),
  });

  const saveDurations = useMutation({
    mutationFn: () => {
      const source =
        durationsText ||
        (settingsQuery.data?.allowed_durations ?? [30, 60]).join(",");
      const list = source
        .split(/[,\s]+/)
        .map((x: string) => Number(x.trim()))
        .filter((n: number) => Number.isFinite(n) && n > 0);
      if (!list.length) throw new Error("Indiquez au moins une durée");
      return updateAllowedDurations(list);
    },
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ["admin-settings"] });
      void qc.invalidateQueries({ queryKey: ["booking-settings"] });
      setDurationsText("");
    },
  });

  const windowsByDay = useMemo(() => {
    const map = new Map<number, AvailabilityWindow[]>();
    for (const w of windowsQuery.data ?? []) {
      const list = map.get(w.day_of_week) ?? [];
      list.push(w);
      map.set(w.day_of_week, list);
    }
    for (const list of map.values()) {
      list.sort((a, b) =>
        String(a.start_time).localeCompare(String(b.start_time)),
      );
    }
    return map;
  }, [windowsQuery.data]);

  const currentDurations: number[] =
    settingsQuery.data?.allowed_durations ?? [30, 60];

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <PageHeader
        eyebrow="Paramètres"
        title="Disponibilités"
        description="Horaires d’ouverture, durées de consultation et indisponibilités ponctuelles."
      />

      <SectionCard
        icon="clock"
        title="Horaires de travail"
        description="Plages hebdomadaires pendant lesquelles les clients peuvent réserver."
      >
        <form
          className={`grid grid-cols-2 gap-3 rounded-xl p-3 ring-1 transition sm:grid-cols-[1.3fr_1fr_1fr_auto] sm:items-end sm:p-4 ${
            editingId ? "bg-gold/[0.06] ring-gold/40" : "bg-[#fbf8f3] ring-line/70"
          }`}
          onSubmit={(e) => {
            e.preventDefault();
            saveWindow.mutate();
          }}
        >
          <label className="col-span-2 block sm:col-span-1">
            <span className="adm-label">Jour</span>
            <select
              className="adm-input"
              value={windowForm.day_of_week}
              onChange={(e) =>
                setWindowForm((f) => ({
                  ...f,
                  day_of_week: Number(e.target.value),
                }))
              }
            >
              {WEEK_ORDER.map((i) => (
                <option key={i} value={i}>
                  {days[i]}
                </option>
              ))}
            </select>
          </label>
          <label className="block">
            <span className="adm-label">Début</span>
            <input
              type="time"
              className="adm-input"
              value={windowForm.start_time}
              onChange={(e) =>
                setWindowForm((f) => ({ ...f, start_time: e.target.value }))
              }
              required
            />
          </label>
          <label className="block">
            <span className="adm-label">Fin</span>
            <input
              type="time"
              className="adm-input"
              value={windowForm.end_time}
              onChange={(e) =>
                setWindowForm((f) => ({ ...f, end_time: e.target.value }))
              }
              required
            />
          </label>
          <div className="col-span-2 flex gap-2 sm:col-span-1">
            {editingId && (
              <button type="button" className="adm-btn" onClick={resetWindowForm}>
                Annuler
              </button>
            )}
            <button
              type="submit"
              className="adm-btn-primary flex-1 sm:flex-none"
              disabled={saveWindow.isPending}
            >
              <Icon name={editingId ? "check" : "plus"} />
              {editingId
                ? saveWindow.isPending
                  ? "Enregistrement…"
                  : "Enregistrer"
                : "Ajouter"}
            </button>
          </div>
        </form>
        {saveWindow.isError && (
          <p className="mt-2 text-[13px] text-red-700" role="alert">
            {saveWindow.error instanceof Error
              ? saveWindow.error.message
              : "Impossible d'enregistrer ce créneau"}
          </p>
        )}

        <ul className="mt-4 divide-y divide-line/50 overflow-hidden rounded-xl ring-1 ring-line/70">
          {WEEK_ORDER.map((dayIdx) => {
            const list = windowsByDay.get(dayIdx) ?? [];
            return (
              <li
                key={dayIdx}
                className="flex flex-col gap-2 px-3 py-3 sm:flex-row sm:items-center sm:gap-4 sm:px-4"
              >
                <p
                  className={`w-28 shrink-0 text-[15px] font-medium ${
                    list.length ? "text-ink" : "text-muted/70"
                  }`}
                >
                  {days[dayIdx]}
                </p>
                {list.length === 0 ? (
                  <p className="text-[13px] text-muted/70 italic">Fermé</p>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {list.map((w) => {
                      const selected = editingId === w.id;
                      return (
                        <span
                          key={w.id}
                          className={`inline-flex items-center gap-1 rounded-lg py-1 pr-1 pl-2.5 text-[14px] tabular-nums ring-1 transition ${
                            selected
                              ? "bg-gold/12 text-gold-dark ring-gold/40"
                              : w.is_active
                                ? "bg-white text-ink ring-line"
                                : "bg-stone-50 text-muted ring-line/60"
                          }`}
                        >
                          {toTimeInput(w.start_time)} – {toTimeInput(w.end_time)}
                          {!w.is_active && (
                            <span className="ml-1 text-[11px]">(inactif)</span>
                          )}
                          <button
                            type="button"
                            className="ml-1 grid h-6 w-6 place-items-center rounded-md text-muted hover:bg-soft hover:text-gold-dark"
                            onClick={() => startEdit(w)}
                            aria-label={`Modifier ${days[dayIdx]} ${toTimeInput(w.start_time)}`}
                          >
                            <Icon name="edit" className="h-3.5 w-3.5" />
                          </button>
                          <button
                            type="button"
                            className="grid h-6 w-6 place-items-center rounded-md text-muted hover:bg-red-50 hover:text-red-700"
                            onClick={() => {
                              if (confirm("Supprimer ce créneau ?")) {
                                deleteWindow.mutate(w.id);
                              }
                            }}
                            aria-label={`Supprimer ${days[dayIdx]} ${toTimeInput(w.start_time)}`}
                          >
                            <Icon name="x" className="h-3.5 w-3.5" />
                          </button>
                        </span>
                      );
                    })}
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      </SectionCard>

      <div className="grid gap-6 lg:grid-cols-2">
        <SectionCard
          icon="calendar"
          title="Durées des consultations"
          description="Durées proposées aux clients lors de la réservation."
        >
          <div className="flex flex-wrap gap-2">
            {currentDurations.map((d) => (
              <span
                key={d}
                className="inline-flex items-center rounded-full bg-brown-deep px-3 py-1 text-[14px] font-medium text-white tabular-nums"
              >
                {d} min
              </span>
            ))}
          </div>
          <form
            className="mt-4 flex gap-2"
            onSubmit={(e) => {
              e.preventDefault();
              saveDurations.mutate();
            }}
          >
            <label className="min-w-0 flex-1">
              <span className="sr-only">Nouvelles durées</span>
              <input
                className="adm-input"
                placeholder="Ex. 30, 60"
                value={durationsText}
                onChange={(e) => setDurationsText(e.target.value)}
              />
            </label>
            <button
              type="submit"
              className="adm-btn-primary"
              disabled={saveDurations.isPending}
            >
              Enregistrer
            </button>
          </form>
          <p className="mt-2 text-[12px] text-muted">
            Séparez les valeurs par une virgule, en minutes.
          </p>
          {saveDurations.isError && (
            <p className="mt-2 text-[13px] text-red-700" role="alert">
              {(saveDurations.error as Error).message}
            </p>
          )}
        </SectionCard>

        <SectionCard
          icon="ban"
          title="Bloquer des créneaux"
          description="Congés, audiences ou indisponibilités ponctuelles."
        >
          <form
            className="space-y-3"
            onSubmit={(e) => {
              e.preventDefault();
              createBlocked.mutate();
            }}
          >
            <div className="grid grid-cols-[1fr_auto] items-end gap-3">
              <label className="block">
                <span className="adm-label">Date</span>
                <input
                  type="date"
                  className="adm-input"
                  value={blockForm.date}
                  onChange={(e) =>
                    setBlockForm((f) => ({ ...f, date: e.target.value }))
                  }
                  required
                />
              </label>
              <label className="inline-flex cursor-pointer items-center gap-2 pb-2 text-[15px] text-ink select-none">
                <input
                  type="checkbox"
                  className="h-4 w-4 rounded accent-gold"
                  checked={blockForm.allDay}
                  onChange={(e) =>
                    setBlockForm((f) => ({ ...f, allDay: e.target.checked }))
                  }
                />
                Journée entière
              </label>
            </div>
            {!blockForm.allDay && (
              <div className="grid grid-cols-2 gap-3">
                <label className="block">
                  <span className="adm-label">De</span>
                  <input
                    type="time"
                    className="adm-input"
                    value={blockForm.start_time}
                    onChange={(e) =>
                      setBlockForm((f) => ({ ...f, start_time: e.target.value }))
                    }
                    required
                  />
                </label>
                <label className="block">
                  <span className="adm-label">À</span>
                  <input
                    type="time"
                    className="adm-input"
                    value={blockForm.end_time}
                    onChange={(e) =>
                      setBlockForm((f) => ({ ...f, end_time: e.target.value }))
                    }
                    required
                  />
                </label>
              </div>
            )}
            <label className="block">
              <span className="adm-label">Motif (optionnel)</span>
              <input
                className="adm-input"
                placeholder="Ex. Audience au tribunal"
                value={blockForm.reason}
                onChange={(e) =>
                  setBlockForm((f) => ({ ...f, reason: e.target.value }))
                }
              />
            </label>
            <button
              type="submit"
              className="adm-btn-primary w-full sm:w-auto"
              disabled={createBlocked.isPending}
            >
              <Icon name="ban" />
              Bloquer
            </button>
          </form>

          <div className="mt-5 border-t border-line/60 pt-4">
            <p className="mb-2 text-[13px] font-medium text-muted">
              Indisponibilités programmées
            </p>
            {(blockedQuery.data ?? []).length === 0 ? (
              <EmptyState icon="calendar" title="Aucun créneau bloqué" />
            ) : (
              <ul className="space-y-2">
                {(blockedQuery.data ?? []).map((b) => {
                  const d = new Date(b.date + "T12:00:00");
                  return (
                    <li
                      key={b.id}
                      className="flex items-center gap-3 rounded-lg bg-[#fbf8f3] px-3 py-2 ring-1 ring-line/60"
                    >
                      <div className="w-11 shrink-0 text-center leading-tight">
                        <p className="text-[11px] font-medium text-muted uppercase">
                          {d.toLocaleDateString("fr-FR", { month: "short" })}
                        </p>
                        <p className="font-serif text-lg text-ink">{d.getDate()}</p>
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-[15px] text-ink">
                          {b.reason || "Indisponible"}
                        </p>
                        <p className="text-[13px] text-muted tabular-nums">
                          {b.start_time && b.end_time
                            ? `${String(b.start_time).slice(0, 5)} – ${String(b.end_time).slice(0, 5)}`
                            : "Journée entière"}
                        </p>
                      </div>
                      <button
                        type="button"
                        className="adm-icon-btn hover:!bg-red-50 hover:!text-red-700"
                        onClick={() => deleteBlocked.mutate(b.id)}
                        aria-label="Supprimer ce blocage"
                      >
                        <Icon name="trash" />
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </SectionCard>
      </div>
    </div>
  );
}
