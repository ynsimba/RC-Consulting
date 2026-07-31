import { motion } from "framer-motion";

type Props = {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  align?: "left" | "center";
  light?: boolean;
};

export function SectionHeading({
  eyebrow,
  title,
  subtitle,
  align = "center",
  light = false,
}: Props) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.6 }}
      className={`mb-12 md:mb-16 ${align === "center" ? "text-center" : "text-left"}`}
    >
      {eyebrow && (
        <p
          className={`mb-3 font-serif text-sm tracking-[0.2em] uppercase ${
            light ? "text-gold-light" : "text-gold"
          }`}
        >
          {eyebrow}
        </p>
      )}
      <h2
        className={`font-sans text-3xl font-bold tracking-wide uppercase md:text-4xl ${
          light ? "text-white" : "text-ink"
        }`}
      >
        {title}
      </h2>
      {subtitle && (
        <p
          className={`mx-auto mt-4 max-w-2xl text-base leading-relaxed ${
            light ? "text-white/80" : "text-muted"
          } ${align === "center" ? "" : "mx-0"}`}
        >
          {subtitle}
        </p>
      )}
      <div
        className={`mt-5 h-px w-16 bg-gold ${align === "center" ? "mx-auto" : ""}`}
      />
    </motion.div>
  );
}
