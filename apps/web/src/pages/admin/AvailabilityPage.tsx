import { useState } from "react";
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
import { Button } from "@/components/ui/Button";

const days = ["Dim", "Lun", "Mar", "Mer", "Jeu", "Ven", "Sam"];

const emptyWindowForm = {
  day_of_week: 1,
  start_time: "08:30",
  end_time: "18:00",
};

function toTimeInput(value: string) {
  return String(value).slice(0, 5);
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
        (settingsQuery.data?.allowed_durations ?? [30, 60, 90]).join(",");
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

  return (
    <div className="mx-auto max-w-4xl space-y-5 sm:space-y-8">
      <div>
        <h1 className="text-xl font-bold tracking-wide uppercase sm:text-2xl">
          Disponibilités
        </h1>
        <p className="mt-0.5 text-xs text-muted sm:text-sm">
          Horaires, créneaux bloqués et durées.
        </p>
      </div>

      <section className="border border-line bg-white p-3 sm:p-5">
        <h2 className="text-xs font-semibold tracking-wide uppercase sm:text-sm">
          Durées des consultations
        </h2>
        <p className="mt-1 text-xs text-muted">
          Actuelles :{" "}
          {(settingsQuery.data?.allowed_durations ?? [30, 60, 90]).join(" / ")}{" "}
          min
        </p>
        <form
          className="mt-3 flex flex-wrap gap-2"
          onSubmit={(e) => {
            e.preventDefault();
            saveDurations.mutate();
          }}
        >
          <input
            className="min-w-[14rem] flex-1 border border-line px-3 py-2 text-sm"
            placeholder="Ex. 30, 45, 60, 90"
            value={durationsText}
            onChange={(e) => setDurationsText(e.target.value)}
          />
          <Button type="submit" disabled={saveDurations.isPending}>
            Enregistrer
          </Button>
        </form>
      </section>

      <section className="border border-line bg-white p-3 sm:p-5">
        <h2 className="text-xs font-semibold tracking-wide uppercase sm:text-sm">
          Horaires de travail
        </h2>
        <form
          className="mt-3 grid grid-cols-2 gap-2 sm:mt-4 sm:flex sm:flex-wrap sm:gap-3"
          onSubmit={(e) => {
            e.preventDefault();
            saveWindow.mutate();
          }}
        >
          <select
            className="col-span-2 border border-line px-3 py-2 sm:col-span-1"
            value={windowForm.day_of_week}
            onChange={(e) =>
              setWindowForm((f) => ({
                ...f,
                day_of_week: Number(e.target.value),
              }))
            }
          >
            {days.map((d, i) => (
              <option key={d} value={i}>
                {d}
              </option>
            ))}
          </select>
          <input
            type="time"
            className="border border-line px-3 py-2"
            value={windowForm.start_time}
            onChange={(e) =>
              setWindowForm((f) => ({ ...f, start_time: e.target.value }))
            }
            required
          />
          <input
            type="time"
            className="border border-line px-3 py-2"
            value={windowForm.end_time}
            onChange={(e) =>
              setWindowForm((f) => ({ ...f, end_time: e.target.value }))
            }
            required
          />
          <div className="col-span-2 flex flex-wrap gap-2 sm:col-span-1">
            <Button type="submit" disabled={saveWindow.isPending}>
              {editingId
                ? saveWindow.isPending
                  ? "Enregistrement…"
                  : "Enregistrer"
                : "Ajouter"}
            </Button>
            {editingId && (
              <Button type="button" variant="outline" onClick={resetWindowForm}>
                Annuler
              </Button>
            )}
          </div>
        </form>
        {saveWindow.isError && (
          <p className="mt-2 text-xs text-red-700" role="alert">
            {saveWindow.error instanceof Error
              ? saveWindow.error.message
              : "Impossible d'enregistrer ce créneau"}
          </p>
        )}
        <ul className="mt-3 space-y-1.5 sm:mt-4 sm:space-y-2">
          {(windowsQuery.data ?? []).map((w) => {
            const selected = editingId === w.id;
            return (
              <li
                key={w.id}
                className={`flex items-center justify-between gap-2 border px-2.5 py-2 text-xs sm:px-3 sm:text-sm ${
                  selected ? "border-gold bg-gold/5" : "border-line"
                }`}
              >
                <span className="min-w-0 truncate">
                  {days[w.day_of_week]} {toTimeInput(w.start_time)} –{" "}
                  {toTimeInput(w.end_time)}
                  {!w.is_active ? " (inactif)" : ""}
                </span>
                <div className="flex shrink-0 items-center gap-2 sm:gap-3">
                  <button
                    type="button"
                    className="text-[10px] font-semibold tracking-wide text-gold uppercase sm:text-xs"
                    onClick={() => startEdit(w)}
                  >
                    Modifier
                  </button>
                  <button
                    type="button"
                    className="text-[10px] font-semibold tracking-wide text-red-600 uppercase sm:text-xs"
                    onClick={() => {
                      if (confirm("Supprimer ce créneau ?")) {
                        deleteWindow.mutate(w.id);
                      }
                    }}
                  >
                    Suppr.
                  </button>
                </div>
              </li>
            );
          })}
        </ul>
      </section>

      <section className="border border-line bg-white p-3 sm:p-5">
        <h2 className="text-xs font-semibold tracking-wide uppercase sm:text-sm">
          Bloquer des créneaux
        </h2>
        <form
          className="mt-4 space-y-3"
          onSubmit={(e) => {
            e.preventDefault();
            createBlocked.mutate();
          }}
        >
          <div className="flex flex-wrap gap-3">
            <input
              type="date"
              className="border border-line px-3 py-2"
              value={blockForm.date}
              onChange={(e) =>
                setBlockForm((f) => ({ ...f, date: e.target.value }))
              }
              required
            />
            <label className="inline-flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={blockForm.allDay}
                onChange={(e) =>
                  setBlockForm((f) => ({ ...f, allDay: e.target.checked }))
                }
              />
              Journée entière
            </label>
          </div>
          {!blockForm.allDay && (
            <div className="flex flex-wrap gap-3">
              <input
                type="time"
                className="border border-line px-3 py-2"
                value={blockForm.start_time}
                onChange={(e) =>
                  setBlockForm((f) => ({ ...f, start_time: e.target.value }))
                }
                required
              />
              <input
                type="time"
                className="border border-line px-3 py-2"
                value={blockForm.end_time}
                onChange={(e) =>
                  setBlockForm((f) => ({ ...f, end_time: e.target.value }))
                }
                required
              />
            </div>
          )}
          <input
            className="w-full border border-line px-3 py-2 text-sm"
            placeholder="Motif (optionnel)"
            value={blockForm.reason}
            onChange={(e) =>
              setBlockForm((f) => ({ ...f, reason: e.target.value }))
            }
          />
          <Button type="submit">Bloquer</Button>
        </form>
        <ul className="mt-3 space-y-1.5 sm:mt-4 sm:space-y-2">
          {(blockedQuery.data ?? []).map((b) => (
            <li
              key={b.id}
              className="flex items-center justify-between gap-2 border border-line px-2.5 py-2 text-xs sm:px-3 sm:text-sm"
            >
              <span className="min-w-0 truncate">
                {new Date(b.date + "T12:00:00").toLocaleDateString("fr-FR")}
                {b.start_time && b.end_time
                  ? ` · ${String(b.start_time).slice(0, 5)}–${String(b.end_time).slice(0, 5)}`
                  : " · journée"}
                {b.reason ? ` — ${b.reason}` : ""}
              </span>
              <button
                type="button"
                className="shrink-0 text-[10px] font-semibold tracking-wide text-red-600 uppercase sm:text-xs"
                onClick={() => deleteBlocked.mutate(b.id)}
              >
                Suppr.
              </button>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
