import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Link } from "react-router-dom";
import { useLanguage } from "@/i18n/LanguageContext";

const HERO_IMG = "/bc.png";

const SLIDE_MS = 5000;

export function HeroSection() {
  const { t } = useLanguage();
  const slides = t.hero.slides;
  const [index, setIndex] = useState(0);

  useEffect(() => {
    setIndex(0);
  }, [slides]);

  useEffect(() => {
    const id = window.setInterval(() => {
      setIndex((current) => (current + 1) % slides.length);
    }, SLIDE_MS);
    return () => window.clearInterval(id);
  }, [slides.length]);

  const slide = slides[index];

  return (
    <section className="relative flex min-h-[78svh] items-center justify-center overflow-hidden sm:min-h-[88vh]">
      <motion.img
        src={HERO_IMG}
        alt="RC Consulting"
        className="absolute inset-0 h-full w-full object-cover object-[center_30%] will-change-transform motion-reduce:transform-none sm:object-center"
        initial={{ scale: 1.12, x: "0%", y: "0%" }}
        animate={{
          scale: [1.12, 1.2, 1.12],
          x: ["0%", "-2%", "0%"],
          y: ["0%", "1.5%", "0%"],
        }}
        transition={{
          duration: 28,
          ease: "easeInOut",
          repeat: Infinity,
          repeatType: "mirror",
        }}
      />
      <div className="hero-overlay absolute inset-0" />

      <div className="container-rc relative z-10 flex w-full flex-col items-center px-4 py-16 text-center sm:py-24 md:py-28">
        <div className="flex w-full max-w-4xl flex-col items-center">
          <div className="relative flex w-full items-center justify-center">
            <AnimatePresence mode="wait">
              <motion.div
                key={`${index}-${slide.eyebrow}`}
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -14 }}
                transition={{ duration: 0.5, ease: "easeOut" }}
                className="flex w-full flex-col items-center"
              >
                <p className="font-roboto text-[11px] font-medium tracking-[0.22em] text-gold uppercase sm:text-sm sm:tracking-[0.28em] md:text-lg">
                  {slide.eyebrow}
                </p>

                <h1 className="mt-4 flex flex-col justify-center font-sans text-[1.65rem] font-extrabold leading-tight tracking-[0.06em] text-white uppercase sm:mt-5 sm:text-5xl sm:tracking-[0.08em] md:text-6xl lg:text-7xl">
                  <span>{slide.title1}</span>
                  <span>{slide.title2}</span>
                </h1>

                <p className="mx-auto mt-4 max-w-2xl text-sm leading-relaxed text-white/90 sm:mt-6 sm:text-base md:text-lg">
                  {slide.subtitle}
                </p>
              </motion.div>
            </AnimatePresence>
          </div>

          <div className="mt-7 flex w-full flex-col items-center gap-2.5 sm:mt-10 sm:flex-row sm:justify-center sm:gap-4">
            <Link
              to="/rendez-vous"
              className="group inline-flex h-11 w-full max-w-xs items-center justify-center gap-2 rounded-md bg-gradient-to-b from-gold-light via-gold to-gold-dark px-6 text-[11px] font-semibold tracking-[0.16em] text-brown-deep uppercase shadow-[0_12px_32px_rgba(42,31,24,0.45)] transition duration-300 hover:-translate-y-0.5 hover:brightness-110 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold sm:h-12 sm:min-w-[220px] sm:px-8 sm:text-xs sm:tracking-[0.18em] sm:w-auto"
            >
              {t.hero.ctaPrimary}
              <span
                aria-hidden
                className="transition-transform duration-300 group-hover:translate-x-0.5"
              >
                →
              </span>
            </Link>

            <Link
              to="/nos-expertises"
              className="inline-flex h-11 w-full max-w-xs items-center justify-center rounded-md border border-gold/70 bg-brown-deep/25 px-6 text-[11px] font-semibold tracking-[0.16em] text-gold-light uppercase backdrop-blur-sm transition duration-300 hover:border-gold hover:bg-gold hover:text-brown-deep focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold sm:h-12 sm:min-w-[220px] sm:px-8 sm:text-xs sm:tracking-[0.18em] sm:w-auto"
            >
              {t.hero.ctaSecondary}
            </Link>
          </div>

          <div
            className="mt-6 flex h-4 items-center justify-center gap-2.5 sm:mt-8"
            role="tablist"
            aria-label="Hero slides"
          >
            {slides.map((_, i) => (
              <button
                key={i}
                type="button"
                role="tab"
                aria-selected={i === index}
                aria-label={`Slide ${i + 1}`}
                onClick={() => setIndex(i)}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  i === index
                    ? "w-8 bg-gold"
                    : "w-2.5 bg-white/40 hover:bg-white/70"
                }`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
