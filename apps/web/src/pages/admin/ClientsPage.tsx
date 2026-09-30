import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { deleteClient, fetchClients } from "@/lib/admin";
import { downloadClientsExcel } from "@/lib/exportClientsExcel";
import {
  Avatar,
  EmptyState,
  Icon,
  PageHeader,
  SkeletonRows,
} from "@/components/admin/ui";

export default function ClientsPage() {
  const qc = useQueryClient();
  const [search, setSearch] = useState("");
  const { data = [], isLoading } = useQuery({
    queryKey: ["admin-clients"],
    queryFn: fetchClients,
  });

  const del = useMutation({
    mutationFn: async (id: string) => {
      await deleteClient(id);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin-clients"] }),
  });

  function onDelete(id: string) {
    if (confirm("Supprimer ce client et ses RDV ?")) del.mutate(id);
  }

  const visible = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return data;
    return data.filter((c) =>
      [c.first_name, c.last_name, c.email, c.phone]
        .filter(Boolean)
        .some((v) => String(v).toLowerCase().includes(q)),
    );
  }, [data, search]);

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <PageHeader
        eyebrow="Gestion"
        title="Clients"
        description="Coordonnées issues des prises de rendez-vous."
        actions={
          <button
            type="button"
            className="adm-btn"
            disabled={isLoading || data.length === 0}
            onClick={() => downloadClientsExcel(data)}
          >
            <Icon name="download" />
            Exporter en Excel
          </button>
        }
      />

      <div className="adm-card overflow-hidden">
        <div className="flex flex-col gap-3 border-b border-line/70 px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-5">
          <p className="text-[15px] text-muted">
            <span className="font-semibold text-ink tabular-nums">{data.length}</span>{" "}
            client{data.length > 1 ? "s" : ""}
          </p>
          <label className="relative block sm:w-72">
            <span className="sr-only">Rechercher</span>
            <Icon
              name="search"
              className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted"
            />
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Nom, email, téléphone…"
              className="adm-input pl-9"
            />
          </label>
        </div>

        {isLoading ? (
          <SkeletonRows rows={5} />
        ) : visible.length === 0 ? (
          <EmptyState
            icon="users"
            title={data.length === 0 ? "Aucun client pour le moment" : "Aucun résultat"}
            hint={
              data.length === 0
                ? "Les clients sont créés automatiquement lors d’une prise de rendez-vous."
                : "Essayez une autre recherche."
            }
          />
        ) : (
          <>
            {/* Mobile : cartes */}
            <ul className="divide-y divide-line/50 md:hidden">
              {visible.map((c) => (
                <li key={c.id} className="flex items-center gap-3 px-4 py-3.5">
                  <Avatar first={c.first_name} last={c.last_name} />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[15px] font-medium text-ink">
                      {c.first_name} {c.last_name}
                    </p>
                    <a
                      className="block truncate text-[13px] text-muted hover:text-gold-dark"
                      href={`mailto:${c.email}`}
                    >
                      {c.email}
                    </a>
                    {c.phone && (
                      <a
                        className="block text-[13px] text-muted hover:text-gold-dark"
                        href={`tel:${c.phone}`}
                      >
                        {c.phone}
                      </a>
                    )}
                  </div>
                  <button
                    type="button"
                    className="adm-icon-btn hover:!bg-red-50 hover:!text-red-700"
                    onClick={() => onDelete(c.id)}
                    aria-label={`Supprimer ${c.first_name} ${c.last_name}`}
                  >
                    <Icon name="trash" />
                  </button>
                </li>
              ))}
            </ul>

            {/* Desktop : table */}
            <div className="hidden overflow-x-auto md:block">
              <table className="adm-table">
                <thead>
                  <tr>
                    <th>Nom</th>
                    <th>Email</th>
                    <th>Téléphone</th>
                    <th className="w-12" />
                  </tr>
                </thead>
                <tbody>
                  {visible.map((c) => (
                    <tr key={c.id} className="group">
                      <td>
                        <div className="flex items-center gap-3">
                          <Avatar first={c.first_name} last={c.last_name} size="sm" />
                          <span className="font-medium text-ink">
                            {c.first_name} {c.last_name}
                          </span>
                        </div>
                      </td>
                      <td>
                        <a
                          className="text-muted hover:text-gold-dark"
                          href={`mailto:${c.email}`}
                        >
                          {c.email}
                        </a>
                      </td>
                      <td className="tabular-nums">
                        {c.phone ? (
                          <a
                            className="text-muted hover:text-gold-dark"
                            href={`tel:${c.phone}`}
                          >
                            {c.phone}
                          </a>
                        ) : (
                          <span className="text-line">—</span>
                        )}
                      </td>
                      <td className="text-right">
                        <button
                          type="button"
                          className="adm-icon-btn opacity-60 group-hover:opacity-100 hover:!bg-red-50 hover:!text-red-700"
                          onClick={() => onDelete(c.id)}
                          aria-label={`Supprimer ${c.first_name} ${c.last_name}`}
                          title="Supprimer"
                        >
                          <Icon name="trash" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
