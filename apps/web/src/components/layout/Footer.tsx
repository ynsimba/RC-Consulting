import { Link } from "react-router-dom";
import { PRACTICE_AREAS } from "@rc/shared";
import { Logo } from "./Logo";
import {
  IconClock,
  IconMail,
  IconMapPin,
  IconPhone,
} from "@/components/ui/ContactIcons";
import { useLanguage } from "@/i18n/LanguageContext";

export function Footer() {
  const { t } = useLanguage();

  return (
    <footer className="bg-brown-deep text-white">
      <div className="container-rc py-10 md:py-14 lg:py-16">
        {/* Brand */}
        <div className="mx-auto max-w-xl text-center md:mx-0 md:max-w-none md:text-left">
          <Logo light size="nav" />
          <p className="mt-4 text-sm leading-relaxed text-white/70 md:mt-5 md:max-w-sm">
            {t.footer.blurb}
          </p>
        </div>

        {/* Links + contact */}
        <div className="mt-8 grid grid-cols-2 gap-x-6 gap-y-8 sm:gap-x-8 md:mt-10 md:grid-cols-3 lg:grid-cols-3">
          <div>
            <h3 className="mb-3 text-[11px] font-semibold tracking-[0.2em] text-gold uppercase sm:mb-4 sm:text-xs">
              {t.footer.navigation}
            </h3>
            <ul className="space-y-2 text-sm text-white/75">
              {[
                ["/", t.nav.home],
                ["/a-propos", t.nav.about],
                ["/nos-expertises", t.nav.expertise],
                ["/rendez-vous", t.nav.booking],
                ["/contact", t.nav.contact],
              ].map(([to, label]) => (
                <li key={to}>
                  <Link to={to} className="inline-block py-0.5 hover:text-gold">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="mb-3 text-[11px] font-semibold tracking-[0.2em] text-gold uppercase sm:mb-4 sm:text-xs">
              {t.footer.expertise}
            </h3>
            <ul className="space-y-2 text-sm text-white/75">
              {PRACTICE_AREAS.slice(0, 6).map((p) => (
                <li key={p.slug}>
                  <Link
                    to={`/nos-expertises/${p.slug}`}
                    className="inline-block py-0.5 hover:text-gold"
                  >
                    {t.areas[p.slug].title}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="col-span-2 md:col-span-1">
            <h3 className="mb-3 text-[11px] font-semibold tracking-[0.2em] text-gold uppercase sm:mb-4 sm:text-xs">
              {t.footer.contact}
            </h3>
            <ul className="space-y-3 text-sm text-white/75">
              <li className="flex items-start gap-3">
                <IconMapPin className="mt-0.5 h-4 w-4 shrink-0 text-gold" />
                <span>
                  {t.footer.belgium}
                  <br />
                  {t.footer.drc}
                </span>
              </li>
              <li className="flex items-start gap-3">
                <IconPhone className="mt-0.5 h-4 w-4 shrink-0 text-gold" />
                <a href="tel:+32476950655" className="hover:text-gold">
                  +32 476 95 06 55
                </a>
              </li>
              <li className="flex items-start gap-3">
                <IconMail className="mt-0.5 h-4 w-4 shrink-0 text-gold" />
                <a
                  href="mailto:rc.consulting.pro@gmail.com"
                  className="break-words hover:text-gold"
                >
                  rc.consulting.pro@gmail.com
                </a>
              </li>
              <li className="flex items-start gap-3">
                <IconClock className="mt-0.5 h-4 w-4 shrink-0 text-gold" />
                <span>{t.footer.hours}</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="container-rc flex flex-col items-center gap-3 py-4 text-center text-[11px] leading-relaxed text-white/50 sm:text-xs md:flex-row md:justify-between md:py-5 md:text-left">
          <p>
            © {new Date().getFullYear()} RC Consulting. {t.footer.rights}
          </p>
          <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2">
            <Link to="/mentions-legales" className="hover:text-gold">
              {t.footer.legal}
            </Link>
            <Link
              to="/politique-de-confidentialite"
              className="hover:text-gold"
            >
              {t.footer.privacy}
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
