import { useState } from "react";
import { Navigate } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { ApiError } from "@/lib/api";
import {
  deleteStaffUser,
  fetchStaffUsers,
  saveStaffUser,
  type StaffUser,
} from "@/lib/admin";
import { Icon, PageHeader, SkeletonRows } from "@/components/admin/ui";

const empty = {
  name: "",
  email: "",
  phone: "",
  role: "admin" as StaffUser["role"],
  password: "",
};

export default function UsersPage() {
  const { isSuperAdmin, isLoading, user } = useAuth();
  const qc = useQueryClient();
  const [form, setForm] = useState(empty);
  const [editing, setEditing] = useState<number | null>(null);
  const [error, setError] = useState("");

  const { data = [], isLoading: loadingUsers } = useQuery({
    queryKey: ["staff-users"],
    queryFn: fetchStaffUsers,
    enabled: isSuperAdmin,
  });

  const save = useMutation({
    mutationFn: () =>
      saveStaffUser(
        {
          name: form.name.trim(),
          email: form.email.trim(),
          phone: form.phone.trim() || null,
          role: form.role,
          ...(form.password ? { password: form.password } : {}),
        },
        editing ?? undefined,
      ),
    onSuccess: () => {
      setForm(empty);
      setEditing(null);
      setError("");
      void qc.invalidateQueries({ queryKey: ["staff-users"] });
    },
    onError: (err) =>
      setError(err instanceof ApiError ? err.message : "Enregistrement impossible"),
  });

  const del = useMutation({
    mutationFn: deleteStaffUser,
    onSuccess: () => void qc.invalidateQueries({ queryKey: ["staff-users"] }),
    onError: (err) =>
      setError(err instanceof ApiError ? err.message : "Suppression impossible"),
  });

  if (isLoading) return null;
  if (!isSuperAdmin) return <Navigate to="/admin" replace />;

  function edit(row: StaffUser) {
    setEditing(row.id);
    setForm({
      name: row.name,
      email: row.email,
      phone: row.phone ?? "",
      role: row.role,
      password: "",
    });
    setError("");
  }

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <PageHeader
        eyebrow="Super admin"
        title="Utilisateurs"
        description="Créez les comptes qui accèdent au back-office."
      />

      <form
        className="adm-card space-y-4 p-5"
        onSubmit={(e) => {
          e.preventDefault();
          setError("");
          save.mutate();
        }}
      >
        <div className="grid gap-3 sm:grid-cols-2">
          <input
            required
            className="adm-input"
            placeholder="Nom"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          />
          <input
            required
            type="email"
            className="adm-input"
            placeholder="Email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
          />
          <input
            className="adm-input"
            placeholder="Téléphone"
            value={form.phone}
            onChange={(e) => setForm({ ...form, phone: e.target.value })}
          />
          <select
            className="adm-input"
            value={form.role}
            onChange={(e) =>
              setForm({ ...form, role: e.target.value as StaffUser["role"] })
            }
          >
            <option value="admin">Admin</option>
            <option value="super_admin">Super admin</option>
          </select>
          <input
            type="password"
            className="adm-input sm:col-span-2"
            placeholder={
              editing
                ? "Nouveau mot de passe (optionnel)"
                : "Mot de passe (10 caractères min.)"
            }
            value={form.password}
            required={!editing}
            minLength={form.password ? 10 : undefined}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
          />
        </div>
        {error && <p className="text-sm text-red-700">{error}</p>}
        <div className="flex gap-2">
          <button type="submit" className="adm-btn-primary" disabled={save.isPending}>
            {editing ? "Mettre à jour" : "Créer l'utilisateur"}
          </button>
          {editing && (
            <button
              type="button"
              className="adm-btn"
              onClick={() => {
                setEditing(null);
                setForm(empty);
                setError("");
              }}
            >
              Annuler
            </button>
          )}
        </div>
      </form>

      <div className="adm-card overflow-hidden">
        {loadingUsers ? (
          <SkeletonRows />
        ) : (
          <ul className="divide-y divide-line/70">
            {data.map((row) => (
              <li
                key={row.id}
                className="flex flex-col gap-3 px-5 py-4 sm:flex-row sm:items-center"
              >
                <div className="min-w-0 flex-1">
                  <p className="font-medium text-ink">{row.name}</p>
                  <p className="truncate text-sm text-muted">{row.email}</p>
                </div>
                <span className="text-xs font-semibold tracking-wide text-gold-dark uppercase">
                  {row.role === "super_admin" ? "Super admin" : "Admin"}
                </span>
                <div className="flex gap-2">
                  <button type="button" className="adm-btn-sm" onClick={() => edit(row)}>
                    <Icon name="edit" />
                    Modifier
                  </button>
                  <button
                    type="button"
                    className="adm-btn-sm adm-btn-danger"
                    disabled={String(user?.id) === String(row.id)}
                    onClick={() => {
                      if (confirm(`Supprimer ${row.email} ?`)) del.mutate(row.id);
                    }}
                  >
                    <Icon name="trash" />
                    Supprimer
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
