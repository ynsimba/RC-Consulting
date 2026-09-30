import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { fetchAppointments, deleteAppointment } from "@/lib/admin";
import {
  confirmAppointmentWithEmail,
  modifyAppointmentWithEmail,
  refuseAppointmentWithEmail,
} from "@/lib/emails/adminActions";
import type { Appointment, AppointmentStatus } from "@/types/database";
import {
  Avatar,
  EmptyState,
  Icon,
  Modal,
  PageHeader,
  STATUS_LABEL,
  SkeletonRows,
  StatusBadge,
} from "@/components/admin/ui";

const STATUSES: AppointmentStatus[] = [
  "pending",
  "confirmed",
  "refused",
  "cancelled",
  "completed",
];

type Filter = "all" | AppointmentStatus;

function toLocalInput(iso: string) {
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("fr-FR", {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
  });
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
    <div className="flex flex-wrap items-center gap-1.5 md:justify-end">
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
      <button
        type="button"
        className="adm-icon-btn"
        onClick={onEdit}
        aria-label="Modifier"
        title="Modifier"
      >
        <Icon name="edit" />
      </button>
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
  );
}

export default function AppointmentsAdminPage() {
  const qc = useQueryClient();
  const { data = [], isLoading } = useQuery({
    queryKey: ["admin-appointments"],
    queryFn: () => fetchAppointments(),
  });
  const [editing, setEditing] = useState<Appointment | null>(null);
  const [filter, setFilter] = useState<Filter>("all");
  const [search, setSearch] = useState("");

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

  const counts = useMemo(() => {
    const map: Record<string, number> = { all: data.length };
    for (const a of data) map[a.status] = (map[a.status] ?? 0) + 1;
    return map;
  }, [data]);

  const visible = useMemo(() => {
    const q = search.trim().toLowerCase();
    return sorted.filter((a) => {
      if (filter !== "all" && a.status !== filter) return false;
      if (!q) return true;
      return [
        a.subject,
        a.client?.first_name,
        a.client?.last_name,
        a.client?.email,
        a.client?.phone,
      ]
        .filter(Boolean)
        .some((v) => String(v).toLowerCase().includes(q));
    });
  }, [sorted, filter, search]);

  const tabs: { key: Filter; label: string }[] = [
    { key: "all", label: "Tous" },
    ...STATUSES.map((s) => ({ key: s, label: STATUS_LABEL[s] })),
  ];

  const actionsFor = (a: Appointment) => (
    <RowActions
      a={a}
      onEdit={() => setEditing(a)}
      onStatus={(status) => quickStatus.mutate({ appointment: a, status })}
      onDelete={() => confirmDelete(a.id)}
    />
  );

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <PageHeader
        eyebrow="Gestion"
        title="Rendez-vous"
        description="Confirmez, refusez ou modifiez les demandes. Le client est notifié par email."
      />

      <div className="adm-card overflow-hidden">
        {/* Barre d’outils */}
        <div className="flex flex-col gap-3 border-b border-line/70 px-4 py-3 sm:px-5 lg:flex-row lg:items-center lg:justify-between">
          <div
            className="-mx-1 flex gap-1 overflow-x-auto px-1 pb-0.5"
            role="tablist"
            aria-label="Filtrer par statut"
          >
            {tabs.map((t) => {
              const active = filter === t.key;
              return (
                <button
                  key={t.key}
                  type="button"
                  role="tab"
                  aria-selected={active}
                  onClick={() => setFilter(t.key)}
                  className={`inline-flex shrink-0 items-center gap-1.5 rounded-lg px-3 py-1.5 text-[14px] font-medium transition ${
                    active
                      ? "bg-brown-deep text-white"
                      : "text-muted hover:bg-soft hover:text-ink"
                  }`}
                >
                  {t.label}
                  <span
                    className={`rounded-full px-1.5 text-[12px] tabular-nums ${
                      active
                        ? "bg-white/15 text-white"
                        : t.key === "pending" && (counts.pending ?? 0) > 0
                          ? "bg-gold/15 text-gold-dark"
                          : "bg-soft text-muted"
                    }`}
                  >
                    {counts[t.key] ?? 0}
                  </span>
                </button>
              );
            })}
          </div>
          <label className="relative block lg:w-72">
            <span className="sr-only">Rechercher</span>
            <Icon
              name="search"
              className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted"
            />
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Client, email, sujet…"
              className="adm-input pl-9"
            />
          </label>
        </div>

        {isLoading ? (
          <SkeletonRows rows={5} />
        ) : visible.length === 0 ? (
          <EmptyState
            icon="calendar"
            title={data.length === 0 ? "Aucun rendez-vous" : "Aucun résultat"}
            hint={
              data.length === 0
                ? "Les demandes de rendez-vous apparaîtront ici."
                : "Essayez un autre filtre ou une autre recherche."
            }
          />
        ) : (
          <>
            {/* Mobile : cartes */}
            <ul className="divide-y divide-line/50 md:hidden">
              {visible.map((a) => (
                <li key={a.id} className="space-y-3 px-4 py-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex min-w-0 items-center gap-3">
                      <Avatar first={a.client?.first_name} last={a.client?.last_name} />
                      <div className="min-w-0">
                        <p className="truncate text-[15px] font-medium text-ink">
                          {a.client?.first_name} {a.client?.last_name}
                        </p>
                        <p className="truncate text-[13px] text-muted">{a.client?.email}</p>
                      </div>
                    </div>
                    <StatusBadge status={a.status} />
                  </div>
                  <div className="rounded-lg bg-[#fbf8f3] px-3 py-2.5">
                    <p className="text-[15px] font-medium text-ink">{a.subject}</p>
                    <p className="mt-0.5 flex items-center gap-1.5 text-[13px] text-muted">
                      <Icon name="calendar" className="h-3.5 w-3.5" />
                      {new Date(a.starts_at).toLocaleString("fr-FR", {
                        dateStyle: "medium",
                        timeStyle: "short",
                      })}{" "}
                      · {a.duration} min
                    </p>
                  </div>
                  {actionsFor(a)}
                </li>
              ))}
            </ul>

            {/* Desktop : table */}
            <div className="hidden overflow-x-auto md:block">
              <table className="adm-table">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Client</th>
                    <th>Sujet</th>
                    <th>Statut</th>
                    <th className="text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {visible.map((a) => (
                    <tr key={a.id}>
                      <td className="whitespace-nowrap">
                        <p className="font-medium text-ink capitalize">
                          {formatDate(a.starts_at)}
                        </p>
                        <p className="text-[13px] text-muted tabular-nums">
                          {new Date(a.starts_at).toLocaleTimeString("fr-FR", {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}{" "}
                          · {a.duration} min
                        </p>
                      </td>
                      <td>
                        <div className="flex items-center gap-3">
                          <Avatar
                            first={a.client?.first_name}
                            last={a.client?.last_name}
                            size="sm"
                          />
                          <div className="min-w-0">
                            <p className="font-medium text-ink">
                              {a.client?.first_name} {a.client?.last_name}
                            </p>
                            <p className="text-[13px] text-muted">
                              {a.client?.email}
                              {a.client?.phone ? ` · ${a.client.phone}` : ""}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="max-w-[16rem]">
                        <p className="truncate text-ink" title={a.subject}>
                          {a.subject}
                        </p>
                      </td>
                      <td>
                        <StatusBadge status={a.status} />
                      </td>
                      <td>{actionsFor(a)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>

      {editing && (
        <Modal
          eyebrow="Modifier le rendez-vous"
          title={`${editing.client?.first_name ?? ""} ${editing.client?.last_name ?? ""}`}
          onClose={() => setEditing(null)}
          footer={
            <>
              <button
                type="button"
                className="adm-btn"
                onClick={() => setEditing(null)}
              >
                Annuler
              </button>
              <button
                type="submit"
                form="edit-appointment"
                className="adm-btn-primary"
                disabled={save.isPending}
              >
                {save.isPending ? "Enregistrement…" : "Enregistrer"}
              </button>
            </>
          }
        >
          <form
            id="edit-appointment"
            className="space-y-4"
            onSubmit={(e) => {
              e.preventDefault();
              save.mutate();
            }}
          >
            <p className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[13px] text-muted">
              <span className="inline-flex items-center gap-1.5">
                <Icon name="mail" className="h-3.5 w-3.5" />
                {editing.client?.email}
              </span>
              {editing.client?.phone && (
                <span className="inline-flex items-center gap-1.5">
                  <Icon name="phone" className="h-3.5 w-3.5" />
                  {editing.client.phone}
                </span>
              )}
            </p>
            <div className="grid gap-4 sm:grid-cols-[1fr_8rem]">
              <label className="block">
                <span className="adm-label">Date et heure</span>
                <input
                  id="edit-starts"
                  type="datetime-local"
                  defaultValue={toLocalInput(editing.starts_at)}
                  className="adm-input"
                  required
                />
              </label>
              <label className="block">
                <span className="adm-label">Durée (min)</span>
                <input
                  id="edit-duration"
                  type="number"
                  min={15}
                  step={15}
                  defaultValue={editing.duration}
                  className="adm-input"
                  required
                />
              </label>
            </div>
            <label className="block">
              <span className="adm-label">Statut</span>
              <select
                id="edit-status"
                defaultValue={editing.status}
                className="adm-input"
              >
                {STATUSES.map((s) => (
                  <option key={s} value={s}>
                    {STATUS_LABEL[s]}
                  </option>
                ))}
              </select>
            </label>
            <label className="block">
              <span className="adm-label">Sujet</span>
              <input
                id="edit-subject"
                defaultValue={editing.subject}
                className="adm-input"
                required
              />
            </label>
            <label className="block">
              <span className="adm-label">Description</span>
              <textarea
                id="edit-description"
                rows={4}
                defaultValue={editing.description}
                className="adm-input resize-y"
              />
            </label>
            {save.isError && (
              <p className="rounded-lg bg-red-50 px-3 py-2 text-[15px] text-red-700">
                {(save.error as Error).message}
              </p>
            )}
          </form>
        </Modal>
      )}
    </div>
  );
}
