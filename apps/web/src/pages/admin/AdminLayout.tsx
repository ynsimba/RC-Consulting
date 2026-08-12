import { useState } from "react";
import { NavLink, Navigate, Outlet } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";

const links = [
  ["", "Dashboard"],
  ["agenda", "Agenda"],
  ["rendez-vous", "Rendez-vous"],
  ["clients", "Clients"],
  ["disponibilites", "Disponibilités"],
  ["messages", "Messages"],
  ["blog", "Blog"],
  ["faq", "FAQ"],
  ["statistiques", "Statistiques"],
];

export default function AdminLayout() {
  const { user, isLoading, isAdmin, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);

  if (isLoading) {
    return (
      <div className="grid min-h-screen place-items-start justify-center bg-soft pt-24 text-sm tracking-wide text-muted uppercase">
        Chargement…
      </div>
    );
  }

  if (!user) return <Navigate to="/admin/login" replace />;
  if (!isAdmin) return <Navigate to="/" replace />;

  return (
    <div className="min-h-screen bg-[#faf7f1] lg:grid lg:grid-cols-[220px_1fr]">
      {/* Barre mobile */}
      <div className="sticky top-0 z-40 flex items-center justify-between gap-2 border-b border-white/10 bg-brown-deep px-3 py-2.5 text-white sm:px-4 lg:hidden">
        <p className="text-[10px] font-semibold tracking-[0.16em] text-gold uppercase">
          Admin
        </p>
        <button
          type="button"
          className="shrink-0 border border-white/20 px-2.5 py-1.5 text-[10px] font-semibold tracking-wide uppercase sm:px-3 sm:py-2 sm:text-[11px]"
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen((v) => !v)}
        >
          {menuOpen ? "Fermer" : "Menu"}
        </button>
      </div>

      {menuOpen && (
        <nav
          className="border-b border-line bg-brown-deep px-2 py-2 lg:hidden"
          aria-label="Admin mobile"
        >
          <div className="flex gap-1 overflow-x-auto pb-1">
            {links.map(([to, label]) => (
              <NavLink
                key={to}
                to={`/admin/${to}`}
                end={to === ""}
                onClick={() => setMenuOpen(false)}
                className={({ isActive }) =>
                  `shrink-0 whitespace-nowrap px-3 py-2 text-xs tracking-wide ${
                    isActive
                      ? "bg-gold text-white"
                      : "text-white/75 hover:bg-white/5 hover:text-white"
                  }`
                }
              >
                {label}
              </NavLink>
            ))}
          </div>
          <button
            type="button"
            onClick={() => logout()}
            className="mt-2 px-3 py-2 text-[11px] font-semibold tracking-[0.14em] text-white/55 uppercase hover:text-gold"
          >
            Déconnexion
          </button>
        </nav>
      )}

      <aside className="hidden flex-col border-r border-line bg-brown-deep text-white lg:sticky lg:top-0 lg:flex lg:h-screen lg:overflow-y-auto">
        <div className="border-b border-white/10 px-5 py-4">
          <p className="text-[10px] font-semibold tracking-[0.22em] text-gold uppercase">
            Administration
          </p>
        </div>
        <nav className="flex flex-1 flex-col gap-0.5 p-2.5" aria-label="Admin">
          {links.map(([to, label]) => (
            <NavLink
              key={to}
              to={`/admin/${to}`}
              end={to === ""}
              className={({ isActive }) =>
                `px-3.5 py-2 text-[13px] tracking-wide transition ${
                  isActive
                    ? "bg-gold text-white"
                    : "text-white/70 hover:bg-white/5 hover:text-white"
                }`
              }
            >
              {label}
            </NavLink>
          ))}
        </nav>
        <div className="border-t border-white/10 p-4">
          {user?.email && (
            <p className="mb-2 truncate text-[11px] text-white/45">{user.email}</p>
          )}
          <button
            type="button"
            onClick={() => logout()}
            className="text-[11px] font-semibold tracking-[0.16em] text-white/55 uppercase transition hover:text-gold"
          >
            Déconnexion
          </button>
        </div>
      </aside>

      <main className="min-w-0 overflow-x-hidden p-3 sm:p-4 md:p-7 lg:p-8">
        <Outlet />
      </main>
    </div>
  );
}
