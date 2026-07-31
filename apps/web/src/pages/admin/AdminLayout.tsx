import { NavLink, Navigate, Outlet } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";

const links = [
  ["", "Dashboard"],
  ["agenda", "Agenda"],
  ["clients", "Clients"],
  ["rendez-vous", "Rendez-vous"],
  ["blog", "Blog"],
  ["faq", "FAQ"],
  ["messages", "Messages"],
  ["disponibilites", "Disponibilités"],
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
    <div className="min-h-screen bg-soft lg:grid lg:grid-cols-[260px_1fr]">
      <aside className="border-r border-line bg-brown-deep text-white">
        <div className="border-b border-white/10 px-6 py-5">
          <p className="font-serif text-lg tracking-wide">RC Consulting</p>
          <p className="text-xs text-gold uppercase tracking-[0.2em]">Administration</p>
        </div>
        <nav className="flex flex-col p-3" aria-label="Admin">
          {links.map(([to, label]) => (
            <NavLink
              key={to}
              to={`/admin/${to}`}
              end={to === ""}
              className={({ isActive }) =>
                `px-4 py-2.5 text-sm tracking-wide ${
                  isActive ? "bg-gold text-white" : "text-white/75 hover:bg-white/5 hover:text-white"
                }`
              }
            >
              {label}
            </NavLink>
          ))}
        </nav>
        <div className="p-4">
          <button
            type="button"
            onClick={() => logout()}
            className="text-xs tracking-wide text-white/60 uppercase hover:text-gold"
          >
            Déconnexion
          </button>
        </div>
      </aside>
      <main className="p-6 md:p-10">
        <Outlet />
      </main>
    </div>
  );
}
