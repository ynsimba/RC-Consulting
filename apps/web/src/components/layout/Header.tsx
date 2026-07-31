import { useState } from "react";
import { NavLink } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { PRACTICE_AREAS } from "@rc/shared";
import { Logo } from "./Logo";
import { LanguageSwitcher } from "./LanguageSwitcher";
import { useLanguage } from "@/i18n/LanguageContext";

export function Header() {
  const { t } = useLanguage();
  const [open, setOpen] = useState(false);
  const [dropdown, setDropdown] = useState(false);

  const links = [
    { to: "/", label: t.nav.home, end: true },
    { to: "/a-propos", label: t.nav.about },
    {
      to: "/nos-expertises",
      label: t.nav.expertise,
      children: PRACTICE_AREAS.map((p) => ({
        to: `/nos-expertises/${p.slug}`,
        label: t.areas[p.slug].title,
      })),
    },
    { to: "/faq", label: t.nav.faq },
    { to: "/contact", label: t.nav.contact },
  ];

  return (
    <header className="sticky top-0 z-50 border-b border-line/80 bg-[#faf7f1]/95 shadow-[0_4px_20px_rgba(61,43,31,0.06)] backdrop-blur">
      <div className="container-rc grid grid-cols-[1fr_auto] items-center gap-4 py-2 xl:grid-cols-[1fr_auto_1fr] xl:py-2.5">
        <div className="justify-self-start">
          <Logo size="nav" />
        </div>

        <nav
          aria-label="Navigation principale"
          className="hidden items-center justify-center gap-1 xl:flex"
        >
          {links.map((link) =>
            link.children ? (
              <div
                key={link.to}
                className="relative"
                onMouseEnter={() => setDropdown(true)}
                onMouseLeave={() => setDropdown(false)}
              >
                <NavLink
                  to={link.to}
                  className={({ isActive }) =>
                    `px-3.5 py-1.5 text-[13px] font-semibold tracking-[0.14em] uppercase ${
                      isActive ? "text-gold" : "text-ink hover:text-gold"
                    }`
                  }
                >
                  {link.label}
                </NavLink>
                <AnimatePresence>
                  {dropdown && (
                    <motion.div
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 8 }}
                      className="absolute left-1/2 top-full min-w-[260px] -translate-x-1/2 border border-line bg-[#faf7f1] py-2 shadow-lg"
                    >
                      {link.children.map((child) => (
                        <NavLink
                          key={child.to}
                          to={child.to}
                          className="block px-4 py-2.5 text-center text-sm tracking-wide text-ink hover:bg-soft hover:text-gold"
                        >
                          {child.label}
                        </NavLink>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <NavLink
                key={link.to}
                to={link.to}
                end={link.end}
                className={({ isActive }) =>
                  `px-3.5 py-1.5 text-[13px] font-semibold tracking-[0.14em] uppercase ${
                    isActive ? "text-gold" : "text-ink hover:text-gold"
                  }`
                }
              >
                {link.label}
              </NavLink>
            ),
          )}
        </nav>

        <div className="hidden items-center justify-self-end gap-3 xl:flex">
          <LanguageSwitcher />
          <NavLink
            to="/rendez-vous"
            className="btn-gold !px-5 !py-2 text-[13px] tracking-[0.14em]"
          >
            {t.nav.booking}
          </NavLink>
        </div>

        <div className="flex items-center justify-self-end gap-2 xl:hidden">
          <LanguageSwitcher />
          <NavLink
            to="/rendez-vous"
            className="btn-gold !px-4 !py-2 text-[10px] tracking-[0.14em]"
          >
            {t.nav.bookingShort}
          </NavLink>
          <button
            type="button"
            className="grid h-10 w-10 place-items-center border border-line"
            aria-expanded={open}
            aria-controls="mobile-menu"
            aria-label={open ? t.nav.closeMenu : t.nav.openMenu}
            onClick={() => setOpen((v) => !v)}
          >
            <span className="sr-only">Menu</span>
            <div className="space-y-1.5">
              <span
                className={`block h-0.5 w-5 bg-ink transition ${open ? "translate-y-2 rotate-45" : ""}`}
              />
              <span
                className={`block h-0.5 w-5 bg-ink transition ${open ? "opacity-0" : ""}`}
              />
              <span
                className={`block h-0.5 w-5 bg-ink transition ${open ? "-translate-y-2 -rotate-45" : ""}`}
              />
            </div>
          </button>
        </div>
      </div>

      <AnimatePresence>
        {open && (
          <motion.nav
            id="mobile-menu"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden border-t border-line bg-[#faf7f1] xl:hidden"
            aria-label="Navigation mobile"
          >
            <div className="container-rc flex flex-col items-center py-4 text-center">
              {links.map((link) => (
                <div key={link.to} className="w-full">
                  <NavLink
                    to={link.to}
                    end={link.end}
                    onClick={() => setOpen(false)}
                    className="block py-3 text-sm font-semibold tracking-[0.14em] text-ink uppercase hover:text-gold"
                  >
                    {link.label}
                  </NavLink>
                  {link.children?.map((child) => (
                    <NavLink
                      key={child.to}
                      to={child.to}
                      onClick={() => setOpen(false)}
                      className="block py-2 text-sm text-muted hover:text-gold"
                    >
                      {child.label}
                    </NavLink>
                  ))}
                </div>
              ))}
              <NavLink
                to="/rendez-vous"
                onClick={() => setOpen(false)}
                className="btn-gold mt-4 w-full max-w-xs text-center"
              >
                {t.nav.bookingLong}
              </NavLink>
            </div>
          </motion.nav>
        )}
      </AnimatePresence>
    </header>
  );
}
