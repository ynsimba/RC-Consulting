import { Link } from "react-router-dom";

type LogoProps = {
  light?: boolean;
  size?: "nav" | "default" | "admin" | "adminBar";
  to?: string;
  className?: string;
};

const SIZE: Record<NonNullable<LogoProps["size"]>, string> = {
  nav: "h-12 w-auto max-w-[42vw] sm:h-20 sm:max-w-none md:h-24 lg:h-28",
  default: "h-20 w-auto sm:h-28 md:h-32 lg:h-36",
  admin: "h-9 w-auto max-h-9 max-w-[9.5rem]",
  adminBar: "h-8 w-auto max-h-8 max-w-[7.5rem]",
};

export function Logo({
  light = false,
  size = "default",
  to = "/",
  className = "",
}: LogoProps) {
  return (
    <Link
      to={to}
      className={`group inline-flex shrink-0 items-center ${className}`}
      aria-label="RC Consulting — Accueil"
    >
      <img
        src="/logo.png"
        alt="RC Consulting — Bring you to success"
        width={320}
        height={128}
        className={`${SIZE[size]} object-contain object-left transition duration-300 ${
          light ? "brightness-110" : ""
        } group-hover:opacity-90`}
      />
    </Link>
  );
}
