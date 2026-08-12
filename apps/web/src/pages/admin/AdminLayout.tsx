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

  if (isLoading) {
    return <div className="grid min-h-screen place-items-center">Chargement…</div>;
  }

  if (!user) return <Navigate to="/admin/login" replace />;
  if (!isAdmin) return <Navigate to="/" replace />;

  return (
    <div className="min-h-screen bg-[#faf7f1] lg:grid lg:grid-cols-[240px_1fr]">
      <aside className="flex flex-col border-r border-line bg-brown-deep text-white lg:sticky lg:top-0 lg:h-screen lg:overflow-y-auto">
        <div className="border-b border-white/10 px-5 py-5">
          <p className="font-serif text-lg tracking-wide">RC Consulting</p>
          <p className="mt-0.5 text-[10px] font-semibold tracking-[0.22em] text-gold uppercase">
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
      <main className="min-w-0 p-4 md:p-7 lg:p-8">
        <Outlet />
      </main>
    </div>
  );
}
