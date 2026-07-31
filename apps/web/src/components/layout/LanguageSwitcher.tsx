import { useLanguage, type Lang } from "@/i18n/LanguageContext";

export function LanguageSwitcher({
  variant = "light",
}: {
  variant?: "light" | "dark";
}) {
  const { lang, setLang, t } = useLanguage();

  const base =
    variant === "dark"
      ? "border-white/20 text-white/70 hover:text-gold"
      : "border-line text-muted hover:text-gold";

  const active =
    variant === "dark"
      ? "border-gold bg-gold/20 text-gold"
      : "border-gold bg-gold/10 text-gold";

  return (
    <div
      className="inline-flex items-center overflow-hidden rounded-md border"
      role="group"
      aria-label={t.lang.label}
    >
      {(["fr", "en"] as Lang[]).map((code) => (
        <button
          key={code}
          type="button"
          onClick={() => setLang(code)}
          aria-pressed={lang === code}
          className={`px-2.5 py-1.5 text-[11px] font-semibold tracking-[0.14em] uppercase transition ${
            lang === code ? active : base
          } ${code === "fr" ? "border-r border-inherit" : ""}`}
        >
          {t.lang[code]}
        </button>
      ))}
    </div>
  );
}
