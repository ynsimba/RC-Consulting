import { useEffect, useId, useMemo, useRef, useState } from "react";
import {
  COUNTRY_DIAL_CODES,
  DEFAULT_DIAL_ISO,
  composePhone,
  flagEmoji,
  findCountryByIso,
  splitPhone,
  type CountryDial,
} from "@/data/countryDialCodes";
import { useLanguage } from "@/i18n/LanguageContext";

type Props = {
  label: string;
  name?: string;
  value?: string;
  error?: string;
  className?: string;
  inputClassName?: string;
  compact?: boolean;
  onChange?: (value: string) => void;
  onBlur?: () => void;
};

const PRIORITY_ISO = ["CD", "BE", "FR"];

export function PhoneInput({
  label,
  name = "phone",
  value = "",
  error,
  className = "",
  inputClassName,
  compact = false,
  onChange,
  onBlur,
}: Props) {
  const resolvedInputClass =
    inputClassName ??
    (compact
      ? "min-h-11 w-full border-0 bg-transparent px-3 py-2.5 text-base focus:outline-none sm:min-h-0 sm:px-2.5 sm:py-1.5 sm:text-sm"
      : "w-full border-0 bg-transparent px-3 py-2.5 text-base focus:outline-none sm:text-sm");
  const { lang, t } = useLanguage();
  const listId = useId();
  const rootRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);

  const initial = splitPhone(value);
  const [iso2, setIso2] = useState(initial.iso2 || DEFAULT_DIAL_ISO);
  const [national, setNational] = useState(initial.national);
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");

  const country = findCountryByIso(iso2) ?? findCountryByIso(DEFAULT_DIAL_ISO)!;

  useEffect(() => {
    // Ne pas écraser l'indicatif choisi tant que le numéro est vide.
    if (!value?.trim()) return;
    const next = splitPhone(value);
    setIso2(next.iso2);
    setNational(next.national);
  }, [value]);

  useEffect(() => {
    if (!open) return;
    searchRef.current?.focus();
    const onPointer = (event: MouseEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false);
        setQuery("");
      }
    };
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
        setQuery("");
      }
    };
    document.addEventListener("mousedown", onPointer);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onPointer);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const countries = useMemo(() => {
    const q = query.trim().toLowerCase();
    const filtered = COUNTRY_DIAL_CODES.filter((c) => {
      if (!q) return true;
      const name = lang === "en" ? c.nameEn : c.nameFr;
      return (
        name.toLowerCase().includes(q) ||
        c.dial.includes(q.replace(/^\+/, "")) ||
        c.iso2.toLowerCase().includes(q)
      );
    });

    const priority = PRIORITY_ISO.map((code) =>
      filtered.find((c) => c.iso2 === code),
    ).filter(Boolean) as CountryDial[];

    const rest = filtered
      .filter((c) => !PRIORITY_ISO.includes(c.iso2))
      .sort((a, b) => {
        const na = lang === "en" ? a.nameEn : a.nameFr;
        const nb = lang === "en" ? b.nameEn : b.nameFr;
        return na.localeCompare(nb, lang === "en" ? "en" : "fr");
      });

    return [...priority, ...rest];
  }, [query, lang]);

  function emit(nextIso: string, nextNational: string) {
    const selected = findCountryByIso(nextIso) ?? country;
    onChange?.(composePhone(selected.dial, nextNational));
  }

  function selectCountry(next: CountryDial) {
    setIso2(next.iso2);
    setOpen(false);
    setQuery("");
    emit(next.iso2, national);
  }

  return (
    <label className={`block text-sm ${className}`}>
      <span
        className={
          compact
            ? "mb-0.5 block text-[10px] font-semibold tracking-wide text-muted uppercase"
            : "mb-1 block text-xs font-semibold uppercase tracking-wide"
        }
      >
        {label}
      </span>
      <div
        ref={rootRef}
        className="relative flex min-h-11 border border-line focus-within:border-gold sm:min-h-0"
      >
        <button
          type="button"
          aria-haspopup="listbox"
          aria-expanded={open}
          aria-controls={listId}
          onClick={() => setOpen((v) => !v)}
          className={`inline-flex shrink-0 items-center gap-1.5 border-r border-line text-sm hover:bg-soft ${
            compact
              ? "min-h-11 px-2.5 py-2 sm:min-h-0 sm:px-2 sm:py-1.5"
              : "px-2.5 py-2.5"
          }`}
        >
          <span aria-hidden className="text-base leading-none">
            {flagEmoji(country.iso2)}
          </span>
          <span className="font-semibold text-ink">+{country.dial}</span>
          <span aria-hidden className="text-xs text-muted">
            ▾
          </span>
        </button>

        <input
          type="tel"
          name={name}
          inputMode="tel"
          autoComplete="tel-national"
          placeholder={t.common.phonePlaceholder}
          value={national}
          onChange={(e) => {
            const next = e.target.value.replace(/[^\d\s().-]/g, "");
            setNational(next);
            emit(iso2, next);
          }}
          onBlur={onBlur}
          className={resolvedInputClass}
        />

        {open && (
          <div
            id={listId}
            role="listbox"
            className="absolute top-full left-0 z-30 mt-1 max-h-[min(18rem,50vh)] w-full min-w-[16rem] overflow-hidden border border-line bg-white shadow-lg sm:w-[min(100%,22rem)]"
          >
            <div className="border-b border-line p-2">
              <input
                ref={searchRef}
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={t.common.searchCountry}
                className="w-full border border-line px-2.5 py-2.5 text-base focus:border-gold focus:outline-none sm:py-2 sm:text-sm"
              />
            </div>
            <ul className="max-h-56 overflow-y-auto overscroll-contain">
              {countries.map((c) => {
                const name = lang === "en" ? c.nameEn : c.nameFr;
                const selected = c.iso2 === iso2;
                return (
                  <li key={`${c.iso2}-${c.dial}`}>
                    <button
                      type="button"
                      role="option"
                      aria-selected={selected}
                      onClick={() => selectCountry(c)}
                      className={`flex min-h-11 w-full items-center gap-2 px-3 py-2.5 text-left text-sm hover:bg-soft sm:min-h-0 sm:py-2 ${
                        selected ? "bg-gold/10" : ""
                      }`}
                    >
                      <span aria-hidden className="text-base">
                        {flagEmoji(c.iso2)}
                      </span>
                      <span className="flex-1 truncate text-ink">{name}</span>
                      <span className="shrink-0 text-muted">+{c.dial}</span>
                    </button>
                  </li>
                );
              })}
              {countries.length === 0 && (
                <li className="px-3 py-4 text-sm text-muted">
                  {t.common.noCountry}
                </li>
              )}
            </ul>
          </div>
        )}
      </div>
      {error && (
        <span
          className={`block text-red-600 ${compact ? "mt-0.5 text-[11px]" : "mt-1 text-xs"}`}
        >
          {error}
        </span>
      )}
    </label>
  );
}
