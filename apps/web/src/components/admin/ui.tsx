import type { ReactNode, SVGProps } from "react";
import type { AppointmentStatus } from "@/types/database";

/* ---------- Icônes (trait 1.75, 24px) ---------- */

const ICONS = {
  dashboard: (
    <>
      <rect x="3" y="3" width="7" height="9" rx="1.5" />
      <rect x="14" y="3" width="7" height="5" rx="1.5" />
      <rect x="14" y="12" width="7" height="9" rx="1.5" />
      <rect x="3" y="16" width="7" height="5" rx="1.5" />
    </>
  ),
  calendar: (
    <>
      <rect x="3" y="4.5" width="18" height="16.5" rx="2" />
      <path d="M16 2.5v4M8 2.5v4M3 10h18" />
    </>
  ),
  list: (
    <>
      <path d="M9 6h11M9 12h11M9 18h11" />
      <circle cx="4.5" cy="6" r="1" />
      <circle cx="4.5" cy="12" r="1" />
      <circle cx="4.5" cy="18" r="1" />
    </>
  ),
  users: (
    <>
      <circle cx="9" cy="8" r="3.5" />
      <path d="M2.5 20a6.5 6.5 0 0 1 13 0" />
      <path d="M16 4.6a3.5 3.5 0 0 1 0 6.8M18 14.2a6.5 6.5 0 0 1 3.5 5.8" />
    </>
  ),
  clock: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3 2" />
    </>
  ),
  mail: (
    <>
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <path d="m3.5 6.5 8.5 6 8.5-6" />
    </>
  ),
  logout: (
    <>
      <path d="M15 4h3a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2h-3" />
      <path d="M10 17l-5-5 5-5M5 12h11" />
    </>
  ),
  refresh: (
    <>
      <path d="M20 11a8 8 0 0 0-14.7-4.4L4 8" />
      <path d="M4 4v4h4" />
      <path d="M4 13a8 8 0 0 0 14.7 4.4L20 16" />
      <path d="M20 20v-4h-4" />
    </>
  ),
  arrowRight: <path d="M5 12h14M13 6l6 6-6 6" />,
  chevronLeft: <path d="m15 6-6 6 6 6" />,
  chevronRight: <path d="m9 6 6 6-6 6" />,
  menu: <path d="M4 7h16M4 12h16M4 17h16" />,
  close: <path d="M6 6l12 12M18 6 6 18" />,
  check: <path d="m5 12.5 4.5 4.5L19 7.5" />,
  x: <path d="M7 7l10 10M17 7 7 17" />,
  edit: (
    <>
      <path d="M4 20h4L19 9a2.8 2.8 0 0 0-4-4L4 16v4Z" />
      <path d="m13.5 6.5 4 4" />
    </>
  ),
  trash: (
    <>
      <path d="M4 7h16M10 11v6M14 11v6" />
      <path d="M6 7l1 12a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2l1-12M9 7V4h6v3" />
    </>
  ),
  download: (
    <>
      <path d="M12 4v11M7 10l5 5 5-5" />
      <path d="M4 20h16" />
    </>
  ),
  phone: (
    <path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2Z" />
  ),
  plus: <path d="M12 5v14M5 12h14" />,
  ban: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M5.6 5.6l12.8 12.8" />
    </>
  ),
  reply: (
    <>
      <path d="M9 14 4 9l5-5" />
      <path d="M4 9h10a6 6 0 0 1 6 6v4" />
    </>
  ),
  external: (
    <>
      <path d="M14 4h6v6M20 4l-9 9" />
      <path d="M18 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h5" />
    </>
  ),
  inbox: (
    <>
      <path d="M3 13h5l1.5 3h5L16 13h5" />
      <path d="M5.5 5h13L21 13v6a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1v-6L5.5 5Z" />
    </>
  ),
  search: (
    <>
      <circle cx="11" cy="11" r="7" />
      <path d="m20 20-3.5-3.5" />
    </>
  ),
} as const;

export type IconName = keyof typeof ICONS;

export function Icon({
  name,
  className = "h-4 w-4",
  ...props
}: { name: IconName } & SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.75}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
      className={`shrink-0 ${className}`}
      {...props}
    >
      {ICONS[name]}
    </svg>
  );
}

/* ---------- En-tête de page ---------- */

export function PageHeader({
  eyebrow,
  title,
  description,
  actions,
}: {
  eyebrow?: string;
  title: ReactNode;
  description?: ReactNode;
  actions?: ReactNode;
}) {
  return (
    <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div className="min-w-0">
        {eyebrow && <p className="adm-eyebrow">{eyebrow}</p>}
        <h1 className="mt-1 font-serif text-[1.65rem] leading-tight text-ink sm:text-3xl">
          {title}
        </h1>
        {description && (
          <p className="mt-1.5 text-[15px] text-muted">{description}</p>
        )}
      </div>
      {actions && (
        <div className="flex shrink-0 flex-wrap items-center gap-2">
          {actions}
        </div>
      )}
    </header>
  );
}

/* ---------- Statuts ---------- */

export const STATUS_LABEL: Record<AppointmentStatus, string> = {
  pending: "En attente",
  confirmed: "Confirmé",
  refused: "Refusé",
  cancelled: "Annulé",
  completed: "Terminé",
};

const STATUS_STYLE: Record<AppointmentStatus, string> = {
  pending: "bg-gold/12 text-gold-dark ring-gold/30",
  confirmed: "bg-brown-deep/[0.07] text-brown-deep ring-brown-deep/20",
  refused: "bg-red-50 text-red-700 ring-red-200",
  cancelled: "bg-stone-100 text-stone-500 ring-stone-200",
  completed: "bg-emerald-50 text-emerald-700 ring-emerald-200",
};

const STATUS_DOT: Record<AppointmentStatus, string> = {
  pending: "bg-gold",
  confirmed: "bg-brown-deep",
  refused: "bg-red-500",
  cancelled: "bg-stone-400",
  completed: "bg-emerald-500",
};

export function StatusBadge({ status }: { status: AppointmentStatus }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[12px] font-medium whitespace-nowrap ring-1 ring-inset ${
        STATUS_STYLE[status] ?? STATUS_STYLE.cancelled
      }`}
    >
      <span
        className={`h-1.5 w-1.5 rounded-full ${STATUS_DOT[status] ?? "bg-stone-400"}`}
      />
      {STATUS_LABEL[status] ?? status}
    </span>
  );
}

/* ---------- Divers ---------- */

export function Avatar({
  first,
  last,
  size = "md",
}: {
  first?: string | null;
  last?: string | null;
  size?: "sm" | "md" | "lg";
}) {
  const initials =
    `${first?.trim()?.[0] ?? ""}${last?.trim()?.[0] ?? ""}`.toUpperCase() ||
    "?";
  const dims =
    size === "sm"
      ? "h-7 w-7 text-[11px]"
      : size === "lg"
        ? "h-11 w-11 text-[15px]"
        : "h-9 w-9 text-[13px]";
  return (
    <span
      aria-hidden
      className={`inline-grid shrink-0 place-items-center rounded-full bg-gradient-to-br from-soft to-line/70 font-semibold text-brown ring-1 ring-line ${dims}`}
    >
      {initials}
    </span>
  );
}

export function EmptyState({
  icon = "inbox",
  title,
  hint,
  action,
}: {
  icon?: IconName;
  title: string;
  hint?: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center px-6 py-12 text-center">
      <span className="grid h-11 w-11 place-items-center rounded-full bg-soft text-gold-dark ring-1 ring-line">
        <Icon name={icon} className="h-5 w-5" />
      </span>
      <p className="mt-3 text-[15px] font-medium text-ink">{title}</p>
      {hint && <p className="mt-1 max-w-xs text-[13px] text-muted">{hint}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}

export function SkeletonRows({ rows = 4 }: { rows?: number }) {
  return (
    <div className="divide-y divide-line/50">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex animate-pulse items-center gap-3 px-4 py-3.5 sm:px-5">
          <div className="h-9 w-9 rounded-full bg-line/60" />
          <div className="flex-1 space-y-2">
            <div className="h-2.5 w-1/3 rounded bg-line/70" />
            <div className="h-2 w-1/2 rounded bg-line/50" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function Modal({
  title,
  eyebrow,
  onClose,
  children,
  footer,
  labelledBy = "adm-modal-title",
}: {
  title: ReactNode;
  eyebrow?: string;
  onClose: () => void;
  children: ReactNode;
  footer?: ReactNode;
  labelledBy?: string;
}) {
  return (
    <div
      className="fixed inset-0 z-50 grid place-items-end bg-ink/45 backdrop-blur-[2px] sm:place-items-center sm:p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby={labelledBy}
      onClick={onClose}
      onKeyDown={(e) => {
        if (e.key === "Escape") onClose();
      }}
    >
      <div
        className="flex max-h-[92vh] w-full max-w-lg flex-col overflow-hidden rounded-t-2xl bg-white shadow-2xl sm:rounded-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-3 border-b border-line/70 px-5 py-4">
          <div className="min-w-0">
            {eyebrow && <p className="adm-eyebrow">{eyebrow}</p>}
            <h2
              id={labelledBy}
              className="mt-0.5 text-lg font-semibold leading-snug text-ink"
            >
              {title}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="adm-icon-btn -mr-1.5"
            aria-label="Fermer"
          >
            <Icon name="close" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto px-5 py-4">{children}</div>
        {footer && (
          <div className="flex flex-wrap items-center justify-end gap-2 border-t border-line/70 bg-[#fbf8f3] px-5 py-3.5 safe-pb">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}

export function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString("fr-FR", {
    hour: "2-digit",
    minute: "2-digit",
  });
}
