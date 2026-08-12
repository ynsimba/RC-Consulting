import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { fetchAppointments, deleteAppointment } from "@/lib/admin";
import {
  confirmAppointmentWithEmail,
  modifyAppointmentWithEmail,
  refuseAppointmentWithEmail,
} from "@/lib/emails/adminActions";
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

function RowActions({
  a,
  onEdit,
  onStatus,
  onDelete,
}: {
  a: Appointment;
  onEdit: () => void;
  onStatus: (status: AppointmentStatus) => void;
  onDelete: () => void;
}) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {a.status === "pending" && (
        <>
          <button
            type="button"
            className="border border-gold bg-gold px-2 py-1.5 text-[10px] font-semibold text-white uppercase"
            onClick={() => onStatus("confirmed")}
          >
            Confirmer
          </button>
          <button
            type="button"
            className="border border-line px-2 py-1.5 text-[10px] font-semibold uppercase"
            onClick={() => onStatus("refused")}
          >
            Refuser
          </button>
        </>
      )}
      <button
        type="button"
        className="border border-line px-2 py-1.5 text-[10px] font-semibold uppercase hover:border-gold"
        onClick={onEdit}
      >
        Modifier
      </button>
      <button
        type="button"
        className="border border-line px-2 py-1.5 text-[10px] font-semibold text-red-700 uppercase"
        onClick={onDelete}
      >
        Supprimer
      </button>
    </div>
  );
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

      return modifyAppointmentWithEmail(editing, {
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
      void qc.invalidateQueries({ queryKey: ["admin-appointments"] });
      void qc.invalidateQueries({ queryKey: ["admin-today"] });
      void qc.invalidateQueries({ queryKey: ["admin-month"] });
      void qc.invalidateQueries({ queryKey: ["admin-stats"] });
    },
  });

  const remove = useMutation({
    mutationFn: (id: string) => deleteAppointment(id),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ["admin-appointments"] });
      void qc.invalidateQueries({ queryKey: ["admin-today"] });
      void qc.invalidateQueries({ queryKey: ["admin-month"] });
      void qc.invalidateQueries({ queryKey: ["admin-stats"] });
      void qc.invalidateQueries({ queryKey: ["admin-appointments-all"] });
    },
  });

  function confirmDelete(id: string) {
    if (confirm("Supprimer définitivement ce rendez-vous ?")) {
      remove.mutate(id);
    }
  }

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
      <h1 className="text-xl font-bold tracking-wide uppercase sm:text-2xl">
        Rendez-vous
      </h1>
      <p className="mt-0.5 text-xs text-muted sm:text-sm">
        Confirmer, refuser ou modifier. Un email est envoyé au visiteur.
      </p>

      {isLoading && <p className="mt-3 text-sm text-muted">Chargement…</p>}

      {/* Mobile : cartes */}
      <ul className="mt-4 space-y-2 md:hidden">
        {sorted.map((a) => (
          <li key={a.id} className="border border-line bg-white p-3">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <p className="text-[10px] font-semibold tracking-wide text-gold uppercase">
                  {STATUS_LABEL[a.status] ?? a.status}
                </p>
                <p className="mt-0.5 text-sm font-semibold leading-snug">
                  {a.subject}
                </p>
                <p className="mt-1 text-xs text-muted">
                  {new Date(a.starts_at).toLocaleString("fr-FR", {
                    dateStyle: "short",
                    timeStyle: "short",
                  })}{" "}
                  · {a.duration} min
                </p>
                <p className="mt-1 text-xs text-ink">
                  {a.client?.first_name} {a.client?.last_name}
                </p>
                <p className="truncate text-[11px] text-muted">
                  {a.client?.email}
                  {a.client?.phone ? ` · ${a.client.phone}` : ""}
                </p>
              </div>
            </div>
            <div className="mt-2.5 border-t border-line pt-2.5">
              <RowActions
                a={a}
                onEdit={() => setEditing(a)}
                onStatus={(status) =>
                  quickStatus.mutate({ appointment: a, status })
                }
                onDelete={() => confirmDelete(a.id)}
              />
            </div>
          </li>
        ))}
        {!isLoading && sorted.length === 0 && (
          <li className="border border-line bg-white px-3 py-6 text-center text-sm text-muted">
            Aucun rendez-vous.
          </li>
        )}
      </ul>

      {/* Desktop : table */}
      <div className="mt-4 hidden overflow-hidden border border-line bg-white md:block">
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="border-b border-line bg-soft text-xs tracking-wide uppercase">
              <tr>
                <th className="px-3 py-2.5">Date</th>
                <th className="px-3 py-2.5">Client</th>
                <th className="px-3 py-2.5">Sujet</th>
                <th className="px-3 py-2.5">Statut</th>
                <th className="px-3 py-2.5">Actions</th>
              </tr>
            </thead>
            <tbody>
              {sorted.map((a) => (
                <tr key={a.id} className="border-b border-line align-top">
                  <td className="px-3 py-2.5 whitespace-nowrap">
                    {new Date(a.starts_at).toLocaleString("fr-FR")}
                    <div className="text-xs text-muted">{a.duration} min</div>
                  </td>
                  <td className="px-3 py-2.5">
                    <div className="font-medium">
                      {a.client?.first_name} {a.client?.last_name}
                    </div>
                    <div className="text-xs text-muted">{a.client?.email}</div>
                    <div className="text-xs text-muted">
                      {a.client?.phone ?? "—"}
                    </div>
                  </td>
                  <td className="px-3 py-2.5">{a.subject}</td>
                  <td className="px-3 py-2.5">
                    {STATUS_LABEL[a.status] ?? a.status}
                  </td>
                  <td className="px-3 py-2.5">
                    <RowActions
                      a={a}
                      onEdit={() => setEditing(a)}
                      onStatus={(status) =>
                        quickStatus.mutate({ appointment: a, status })
                      }
                      onDelete={() => confirmDelete(a.id)}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {editing && (
        <div className="fixed inset-0 z-40 grid place-items-end bg-ink/40 p-0 sm:place-items-center sm:p-4">
          <form
            className="max-h-[92vh] w-full max-w-lg space-y-3 overflow-y-auto border border-line bg-white p-4 sm:p-5"
            onSubmit={(e) => {
              e.preventDefault();
              save.mutate();
            }}
          >
            <h2 className="text-base font-bold tracking-wide uppercase sm:text-lg">
              Modifier le rendez-vous
            </h2>
            <p className="text-xs text-muted sm:text-sm">
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
            <div className="flex gap-2 pt-1 safe-pb">
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
