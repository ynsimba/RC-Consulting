import { motion } from "framer-motion";

type Props = {
  title: string;
  subtitle?: string;
  image?: string;
  compact?: boolean;
  /** Affiche « RC Consulting » au-dessus du titre (défaut: true). */
  showBrand?: boolean;
};

const DEFAULT = "/bc.png";

export function PageHero({
  title,
  subtitle,
  image = DEFAULT,
  compact = false,
  showBrand = true,
}: Props) {
  return (
    <section
      className={`relative flex items-center justify-center overflow-hidden ${
        compact
          ? "min-h-[12vh] sm:min-h-[14vh] md:min-h-[16vh]"
          : "min-h-[42vh] md:min-h-[48vh]"
      }`}
    >
      <motion.img
        src={image}
        alt=""
        loading="eager"
        className="absolute inset-0 h-full w-full object-cover object-[center_35%] grayscale will-change-transform motion-reduce:transform-none sm:object-center"
        initial={{ scale: 1.08 }}
        animate={{
          scale: [1.08, 1.14, 1.08],
          x: ["0%", "-1.5%", "0%"],
        }}
        transition={{
          duration: 22,
          ease: "easeInOut",
          repeat: Infinity,
          repeatType: "mirror",
        }}
      />
      <div className="hero-overlay absolute inset-0" />
      <div
        className={`container-rc relative z-10 text-center ${
          compact ? "py-5 md:py-6" : "py-20"
        }`}
      >
        {!compact && showBrand && (
          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-3 font-serif text-sm tracking-[0.25em] text-gold uppercase"
          >
            RC Consulting
          </motion.p>
        )}
        <motion.h1
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className={`font-sans font-bold tracking-[0.12em] text-white uppercase ${
            compact
              ? "text-xl sm:text-2xl md:text-3xl"
              : "text-3xl sm:text-4xl md:text-5xl"
          }`}
        >
          {title}
        </motion.h1>
        {subtitle && !compact && (
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mx-auto mt-4 max-w-2xl whitespace-pre-line text-white/85"
          >
            {subtitle}
          </motion.p>
        )}
        {subtitle && compact && (
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.12 }}
            className="mx-auto mt-1.5 max-w-xl text-sm text-white/80"
          >
            {subtitle}
          </motion.p>
        )}
      </div>
    </section>
  );
}
