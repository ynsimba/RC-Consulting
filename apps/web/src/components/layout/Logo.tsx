import { Link } from "react-router-dom";

type LogoProps = {
  light?: boolean;
  size?: "nav" | "default";
};

export function Logo({ light = false, size = "default" }: LogoProps) {
  const sizeClass =
    size === "nav"
      ? "h-20 w-auto sm:h-24 md:h-28"
      : "h-28 w-auto sm:h-32 md:h-36";

  return (
    <Link
      to="/"
      className="group inline-flex shrink-0 items-center"
      aria-label="RC Consulting — Accueil"
    >
      <img
        src="/logo.png"
        alt="RC Consulting — Bring you to success"
        width={320}
        height={128}
        className={`${sizeClass} object-contain transition duration-300 ${
          light ? "brightness-110" : ""
        } group-hover:opacity-90`}
      />
    </Link>
  );
}
