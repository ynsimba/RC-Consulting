import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { fetchAppointments, updateAppointment } from "@/lib/admin";
import type { Appointment, AppointmentStatus } from "@/types/database";
import { Button } from "@/components/ui/Button";

const STATUSES: AppointmentStatus[] = [
  "pending",
  "confirmed",
  "refused",
  "cancelled",
  "completed",
];

const STATUS_LABEL: Record<AppointmentStatus, string> = {
  pending: "En attente",
  confirmed: "Confirmé",
  refused: "Refusé",
  cancelled: "Annulé",
  completed: "Terminé",
};

function toLocalInput(iso: string) {
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export default function AppointmentsAdminPage() {
  const qc = useQueryClient();
  const { data = [], isLoading } = useQuery({
    queryKey: ["admin-appointments"],
    queryFn: () => fetchAppointments(),
  });
  const [editing, setEditing] = useState<Appointment | null>(null);

  const save = useMutation({
    mutationFn: async () => {
      if (!editing) return;
      const startsAt = new Date(
        (document.getElementById("edit-starts") as HTMLInputElement).value,
      );
      const duration = Number(
        (document.getElementById("edit-duration") as HTMLInputElement).value,
      );
      const subject = (
        document.getElementById("edit-subject") as HTMLInputElement
      ).value;
      const description = (
        document.getElementById("edit-description") as HTMLTextAreaElement
      ).value;
      const status = (
        document.getElementById("edit-status") as HTMLSelectElement
      ).value as AppointmentStatus;

      return updateAppointment(editing.id, {
        starts_at: startsAt.toISOString(),
        ends_at: new Date(startsAt.getTime() + duration * 60_000).toISOString(),
        duration,
        subject,
        description,
        status,
      });
    },
    onSuccess: () => {
      setEditing(null);
      void qc.invalidateQueries({ queryKey: ["admin-appointments"] });
      void qc.invalidateQueries({ queryKey: ["admin-today"] });
      void qc.invalidateQueries({ queryKey: ["admin-month"] });
    },
  });

  const quickStatus = useMutation({
    mutationFn: ({ id, status }: { id: string; status: AppointmentStatus }) =>
      updateAppointment(id, { status }),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ["admin-appointments"] });
    },
  });

  const sorted = useMemo(
    () =>
      [...data].sort(
        (a, b) =>
          new Date(b.starts_at).getTime() - new Date(a.starts_at).getTime(),
      ),
    [data],
  );

  return (
    <div className="mx-auto max-w-6xl">
      <h1 className="text-2xl font-bold tracking-wide uppercase">Rendez-vous</h1>
      <p className="mt-1 text-sm text-muted">
        Confirmer, refuser, annuler ou modifier un rendez-vous.
      </p>

      {isLoading && <p className="mt-4 text-muted">Chargement…</p>}

      <div className="mt-6 overflow-x-auto border border-line bg-white">
        <table className="min-w-full text-left text-sm">
          <thead className="border-b border-line bg-soft text-xs tracking-wide uppercase">
            <tr>
              <th className="px-4 py-3">Date</th>
              <th className="px-4 py-3">Client</th>
              <th className="px-4 py-3">Sujet</th>
              <th className="px-4 py-3">Statut</th>
              <th className="px-4 py-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {sorted.map((a) => (
              <tr key={a.id} className="border-b border-line align-top">
                <td className="px-4 py-3 whitespace-nowrap">
                  {new Date(a.starts_at).toLocaleString("fr-FR")}
                  <div className="text-xs text-muted">{a.duration} min</div>
                </td>
                <td className="px-4 py-3">
                  <div className="font-medium">
                    {a.client?.first_name} {a.client?.last_name}
                  </div>
                  <div className="text-xs text-muted">{a.client?.email}</div>
                  <div className="text-xs text-muted">{a.client?.phone ?? "—"}</div>
                </td>
                <td className="px-4 py-3">{a.subject}</td>
                <td className="px-4 py-3">
                  {STATUS_LABEL[a.status] ?? a.status}
                </td>
                <td className="px-4 py-3">
                  <div className="flex flex-wrap gap-1.5">
                    {a.status === "pending" && (
                      <>
                        <button
                          type="button"
                          className="border border-gold bg-gold px-2 py-1 text-[10px] font-semibold text-white uppercase"
                          onClick={() =>
                            quickStatus.mutate({ id: a.id, status: "confirmed" })
                          }
                        >
                          Confirmer
                        </button>
                        <button
                          type="button"
                          className="border border-line px-2 py-1 text-[10px] font-semibold uppercase"
                          onClick={() =>
                            quickStatus.mutate({ id: a.id, status: "refused" })
                          }
                        >
                          Refuser
                        </button>
                      </>
                    )}
                    <button
                      type="button"
                      className="border border-line px-2 py-1 text-[10px] font-semibold uppercase hover:border-gold"
                      onClick={() => setEditing(a)}
                    >
                      Modifier
                    </button>
                    {["pending", "confirmed"].includes(a.status) && (
                      <button
                        type="button"
                        className="border border-line px-2 py-1 text-[10px] font-semibold text-red-700 uppercase"
                        onClick={() =>
                          quickStatus.mutate({ id: a.id, status: "cancelled" })
                        }
                      >
                        Annuler
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {editing && (
        <div className="fixed inset-0 z-40 grid place-items-center bg-ink/40 p-4">
          <form
            className="w-full max-w-lg space-y-3 border border-line bg-white p-5"
            onSubmit={(e) => {
              e.preventDefault();
              save.mutate();
            }}
          >
            <h2 className="text-lg font-bold tracking-wide uppercase">
              Modifier le rendez-vous
            </h2>
            <p className="text-sm text-muted">
              {editing.client?.first_name} {editing.client?.last_name} ·{" "}
              {editing.client?.email}
              {editing.client?.phone ? ` · ${editing.client.phone}` : ""}
            </p>
            <label className="block text-sm">
              <span className="text-xs font-semibold uppercase">Date & heure</span>
              <input
                id="edit-starts"
                type="datetime-local"
                defaultValue={toLocalInput(editing.starts_at)}
                className="mt-1 w-full border border-line px-3 py-2"
                required
              />
            </label>
            <label className="block text-sm">
              <span className="text-xs font-semibold uppercase">Durée (min)</span>
              <input
                id="edit-duration"
                type="number"
                min={15}
                step={15}
                defaultValue={editing.duration}
                className="mt-1 w-full border border-line px-3 py-2"
                required
              />
            </label>
            <label className="block text-sm">
              <span className="text-xs font-semibold uppercase">Statut</span>
              <select
                id="edit-status"
                defaultValue={editing.status}
                className="mt-1 w-full border border-line px-3 py-2"
              >
                {STATUSES.map((s) => (
                  <option key={s} value={s}>
                    {STATUS_LABEL[s]}
                  </option>
                ))}
              </select>
            </label>
            <label className="block text-sm">
              <span className="text-xs font-semibold uppercase">Sujet</span>
              <input
                id="edit-subject"
                defaultValue={editing.subject}
                className="mt-1 w-full border border-line px-3 py-2"
                required
              />
            </label>
            <label className="block text-sm">
              <span className="text-xs font-semibold uppercase">Description</span>
              <textarea
                id="edit-description"
                rows={3}
                defaultValue={editing.description}
                className="mt-1 w-full border border-line px-3 py-2"
              />
            </label>
            {save.isError && (
              <p className="text-sm text-red-700">
                {(save.error as Error).message}
              </p>
            )}
            <div className="flex gap-2 pt-1">
              <Button type="submit" disabled={save.isPending}>
                Enregistrer
              </Button>
              <button
                type="button"
                className="border border-line px-4 py-2 text-xs font-semibold uppercase"
                onClick={() => setEditing(null)}
              >
                Fermer
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
