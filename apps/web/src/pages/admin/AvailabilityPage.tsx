import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/Button";

const days = ["Dim", "Lun", "Mar", "Mer", "Jeu", "Ven", "Sam"];

type Window = {
  id: string;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  isActive: boolean;
};

type Blocked = {
  id: string;
  date: string;
  startTime?: string | null;
  endTime?: string | null;
  reason?: string | null;
};

export default function AvailabilityPage() {
  const qc = useQueryClient();
  const { data } = useQuery({
    queryKey: ["admin-availability"],
    queryFn: () =>
      api<{ windows: Window[]; blocked: Blocked[] }>("/api/admin/availability"),
  });

  const [windowForm, setWindowForm] = useState({
    dayOfWeek: 1,
    startTime: "09:00",
    endTime: "12:30",
    isActive: true,
  });
  const [blockDate, setBlockDate] = useState("");

  const createWindow = useMutation({
    mutationFn: () =>
      api("/api/admin/availability/windows", {
        method: "POST",
        body: JSON.stringify(windowForm),
      }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin-availability"] }),
  });

  const deleteWindow = useMutation({
    mutationFn: (id: string) =>
      api(`/api/admin/availability/windows/${id}`, { method: "DELETE" }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin-availability"] }),
  });

  const createBlocked = useMutation({
    mutationFn: () =>
      api("/api/admin/availability/blocked", {
        method: "POST",
        body: JSON.stringify({ date: blockDate, reason: "Indisponible" }),
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-availability"] });
      setBlockDate("");
    },
  });

  const deleteBlocked = useMutation({
    mutationFn: (id: string) =>
      api(`/api/admin/availability/blocked/${id}`, { method: "DELETE" }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin-availability"] }),
  });

  return (
    <div className="space-y-10">
      <h1 className="text-2xl font-bold uppercase tracking-wide">
        Disponibilités
      </h1>

      <section className="border border-line bg-white p-6">
        <h2 className="font-semibold uppercase tracking-wide">Créneaux hebdo</h2>
        <form
          className="mt-4 flex flex-wrap gap-3"
          onSubmit={(e) => {
            e.preventDefault();
            createWindow.mutate();
          }}
        >
          <select
            className="border border-line px-3 py-2"
            value={windowForm.dayOfWeek}
            onChange={(e) =>
              setWindowForm((f) => ({ ...f, dayOfWeek: Number(e.target.value) }))
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
            value={windowForm.startTime}
            onChange={(e) =>
              setWindowForm((f) => ({ ...f, startTime: e.target.value }))
            }
          />
          <input
            type="time"
            className="border border-line px-3 py-2"
            value={windowForm.endTime}
            onChange={(e) =>
              setWindowForm((f) => ({ ...f, endTime: e.target.value }))
            }
          />
          <Button type="submit">Ajouter</Button>
        </form>
        <ul className="mt-4 space-y-2">
          {data?.windows.map((w) => (
            <li
              key={w.id}
              className="flex items-center justify-between border border-line px-3 py-2 text-sm"
            >
              <span>
                {days[w.dayOfWeek]} {w.startTime} – {w.endTime}
              </span>
              <button
                type="button"
                className="text-xs text-red-600 uppercase"
                onClick={() => deleteWindow.mutate(w.id)}
              >
                Supprimer
              </button>
            </li>
          ))}
        </ul>
      </section>

      <section className="border border-line bg-white p-6">
        <h2 className="font-semibold uppercase tracking-wide">Jours bloqués</h2>
        <form
          className="mt-4 flex flex-wrap gap-3"
          onSubmit={(e) => {
            e.preventDefault();
            createBlocked.mutate();
          }}
        >
          <input
            type="date"
            className="border border-line px-3 py-2"
            value={blockDate}
            onChange={(e) => setBlockDate(e.target.value)}
            required
          />
          <Button type="submit">Bloquer</Button>
        </form>
        <ul className="mt-4 space-y-2">
          {data?.blocked.map((b) => (
            <li
              key={b.id}
              className="flex items-center justify-between border border-line px-3 py-2 text-sm"
            >
              <span>
                {new Date(b.date).toLocaleDateString("fr-FR")}{" "}
                {b.reason ? `— ${b.reason}` : ""}
              </span>
              <button
                type="button"
                className="text-xs text-red-600 uppercase"
                onClick={() => deleteBlocked.mutate(b.id)}
              >
                Supprimer
              </button>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
