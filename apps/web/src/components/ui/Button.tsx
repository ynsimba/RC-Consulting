import type { ButtonHTMLAttributes, ReactNode } from "react";
import { Link } from "react-router-dom";

type Props = {
  children: ReactNode;
  variant?: "gold" | "outline" | "ghost";
  to?: string;
  href?: string;
  className?: string;
} & ButtonHTMLAttributes<HTMLButtonElement>;

const variants = {
  gold: "btn-gold",
  outline: "btn-outline",
  ghost:
    "inline-flex items-center justify-center px-4 py-2 text-xs font-semibold tracking-[0.18em] uppercase text-ink hover:text-gold",
};

export function Button({
  children,
  variant = "gold",
  to,
  href,
  className = "",
  ...props
}: Props) {
  const cls = `${variants[variant]} ${className}`;

  if (to) {
    return (
      <Link to={to} className={cls}>
        {children}
      </Link>
    );
  }

  if (href) {
    return (
      <a href={href} className={cls}>
        {children}
      </a>
    );
  }

  return (
    <button className={cls} {...props}>
      {children}
    </button>
  );
}
