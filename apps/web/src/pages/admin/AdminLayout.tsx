import { useEffect, useState } from "react";
import { NavLink, Navigate, Outlet, useLocation } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { fetchAdminStats } from "@/lib/admin";
import { Icon, type IconName } from "@/components/admin/ui";

type NavItem = {
  to: string;
  label: string;
  icon: IconName;
  badge?: "pending" | "messages";
};

const sections: { title: string; items: NavItem[] }[] = [
  {
    title: "Pilotage",
    items: [
      { to: "", label: "Tableau de bord", icon: "dashboard" },
      { to: "agenda", label: "Agenda", icon: "calendar" },
    ],
  },
  {
    title: "Gestion",
    items: [
      { to: "rendez-vous", label: "Rendez-vous", icon: "list", badge: "pending" },
      { to: "clients", label: "Clients", icon: "users" },
      { to: "messages", label: "Messages", icon: "mail", badge: "messages" },
    ],
  },
  {
    title: "Paramètres",
    items: [{ to: "disponibilites", label: "Disponibilités", icon: "clock" }],
  },
];

function Brand() {
  return (
    <div className="flex items-center gap-3">
      <span className="grid h-9 w-9 place-items-center rounded-lg bg-gradient-to-br from-gold-light to-gold-dark font-serif text-[15px] font-semibold text-white shadow-[0_4px_12px_-4px_rgba(196,163,90,0.7)]">
        RC
      </span>
      <div className="leading-tight">
        <p className="text-[14px] font-semibold tracking-wide text-white">
          RC Consulting
        </p>
        <p className="text-[11px] font-medium tracking-[0.18em] text-gold uppercase">
          Back-office
        </p>
      </div>
    </div>
  );
}

function SidebarContent({
  email,
  name,
  counts,
  onNavigate,
  onLogout,
}: {
  email?: string;
  name?: string | null;
  counts: { pending: number; messages: number };
  onNavigate?: () => void;
  onLogout: () => void;
}) {
  const display = name?.trim() || email?.split("@")[0] || "Admin";
  return (
    <>
      <nav className="flex-1 space-y-6 px-3 py-5" aria-label="Administration">
        {sections.map((section) => (
          <div key={section.title}>
            <p className="px-3 pb-2 text-[11px] font-semibold tracking-[0.18em] text-white/35 uppercase">
              {section.title}
            </p>
            <ul className="space-y-0.5">
              {section.items.map((item) => {
                const count = item.badge ? counts[item.badge] : 0;
                return (
                  <li key={item.to}>
                    <NavLink
                      to={`/admin/${item.to}`}
                      end={item.to === ""}
                      onClick={onNavigate}
                      className={({ isActive }) =>
                        `group relative flex items-center gap-3 rounded-lg px-3 py-2 text-[14px] font-medium transition ${
                          isActive
                            ? "bg-white/[0.08] text-white"
                            : "text-white/60 hover:bg-white/[0.04] hover:text-white"
                        }`
                      }
                    >
                      {({ isActive }) => (
                        <>
                          {isActive && (
                            <span className="absolute inset-y-1.5 -left-3 w-[3px] rounded-r-full bg-gold" />
                          )}
                          <Icon
                            name={item.icon}
                            className={`h-[18px] w-[18px] ${
                              isActive
                                ? "text-gold"
                                : "text-white/45 group-hover:text-white/80"
                            }`}
                          />
                          <span className="flex-1">{item.label}</span>
                          {count > 0 && (
                            <span className="min-w-5 rounded-full bg-gold px-1.5 py-px text-center text-[11px] font-semibold text-brown-deep tabular-nums">
                              {count > 99 ? "99+" : count}
                            </span>
                          )}
                        </>
                      )}
                    </NavLink>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>

      <div className="space-y-2 border-t border-white/[0.07] p-3">
        <a
          href="/"
          target="_blank"
          rel="noreferrer"
          className="flex items-center gap-3 rounded-lg px-3 py-2 text-[14px] text-white/55 transition hover:bg-white/[0.04] hover:text-white"
        >
          <Icon name="external" className="h-[18px] w-[18px]" />
          Voir le site
        </a>
        <div className="flex items-center gap-3 rounded-lg bg-white/[0.04] p-2.5">
          <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-gold/20 text-[13px] font-semibold text-gold uppercase">
            {display.slice(0, 1)}
          </span>
          <div className="min-w-0 flex-1">
            <p className="truncate text-[14px] font-medium text-white capitalize">
              {display}
            </p>
            {email && (
              <p className="truncate text-[12px] text-white/40">{email}</p>
            )}
          </div>
          <button
            type="button"
            onClick={onLogout}
            className="grid h-8 w-8 shrink-0 place-items-center rounded-md text-white/45 transition hover:bg-white/[0.06] hover:text-gold"
            aria-label="Déconnexion"
            title="Déconnexion"
          >
            <Icon name="logout" className="h-[18px] w-[18px]" />
          </button>
        </div>
      </div>
    </>
  );
}

export default function AdminLayout() {
  const { user, isLoading, isAdmin, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();

  const statsQuery = useQuery({
    queryKey: ["admin-stats"],
    queryFn: fetchAdminStats,
    enabled: !!user && isAdmin,
  });
  const counts = {
    pending: statsQuery.data?.pending ?? 0,
    messages: statsQuery.data?.messagesUnread ?? 0,
  };

  useEffect(() => {
    setMenuOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    if (!menuOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMenuOpen(false);
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  if (isLoading) {
    return (
      <div className="grid min-h-screen place-items-center bg-[#f7f3ec]">
        <div className="flex items-center gap-3 text-[15px] text-muted">
          <span className="h-4 w-4 animate-spin rounded-full border-2 border-gold/30 border-t-gold" />
          Chargement…
        </div>
      </div>
    );
  }

  if (!user) return <Navigate to="/admin/login" replace />;
  if (!isAdmin) return <Navigate to="/" replace />;

  const sidebarProps = {
    email: user.email,
    name: user.name,
    counts,
    onLogout: () => logout(),
  };

  return (
    <div className="min-h-screen bg-[#f7f3ec] lg:grid lg:grid-cols-[252px_1fr]">
      {/* Barre mobile */}
      <div className="sticky top-0 z-40 flex items-center justify-between gap-2 border-b border-white/10 bg-brown-deep px-4 py-3 lg:hidden">
        <Brand />
        <button
          type="button"
          className="relative grid h-9 w-9 place-items-center rounded-lg text-white/80 transition hover:bg-white/10"
          aria-expanded={menuOpen}
          aria-controls="admin-drawer"
          aria-label="Ouvrir le menu"
          onClick={() => setMenuOpen(true)}
        >
          <Icon name="menu" className="h-5 w-5" />
          {counts.pending + counts.messages > 0 && (
            <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-gold ring-2 ring-brown-deep" />
          )}
        </button>
      </div>

      {/* Tiroir mobile */}
      {menuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="absolute inset-0 bg-ink/50 backdrop-blur-[2px]"
            onClick={() => setMenuOpen(false)}
            aria-hidden
          />
          <aside
            id="admin-drawer"
            className="absolute inset-y-0 left-0 flex w-[80vw] max-w-[288px] flex-col overflow-y-auto bg-brown-deep shadow-2xl"
          >
            <div className="flex items-center justify-between border-b border-white/[0.07] px-4 py-3.5">
              <Brand />
              <button
                type="button"
                className="grid h-8 w-8 place-items-center rounded-md text-white/60 hover:bg-white/10 hover:text-white"
                onClick={() => setMenuOpen(false)}
                aria-label="Fermer le menu"
              >
                <Icon name="close" />
              </button>
            </div>
            <SidebarContent
              {...sidebarProps}
              onNavigate={() => setMenuOpen(false)}
            />
          </aside>
        </div>
      )}

      {/* Sidebar desktop */}
      <aside className="hidden flex-col bg-brown-deep bg-[radial-gradient(120%_60%_at_0%_0%,rgba(196,163,90,0.10),transparent_60%)] lg:sticky lg:top-0 lg:flex lg:h-screen lg:overflow-y-auto">
        <div className="border-b border-white/[0.07] px-5 py-5">
          <Brand />
        </div>
        <SidebarContent {...sidebarProps} />
      </aside>

      <main className="min-w-0 overflow-x-hidden px-4 py-6 sm:px-6 md:py-8 lg:px-10 lg:py-10">
        <Outlet />
      </main>
    </div>
  );
}
