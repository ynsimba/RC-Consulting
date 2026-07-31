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
    <section className="relative flex min-h-[88vh] items-center justify-center overflow-hidden">
      <motion.img
        src={HERO_IMG}
        alt="RC Consulting"
        className="absolute inset-0 h-full w-full object-cover grayscale will-change-transform motion-reduce:transform-none"
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

      <div className="container-rc relative z-10 flex w-full flex-col items-center px-4 py-24 text-center md:py-28">
        <div className="flex w-full max-w-4xl flex-col items-center">
          <div className="relative flex w-full min-h-[14.5rem] items-center justify-center sm:min-h-[16rem] md:min-h-[18rem]">
            <AnimatePresence mode="wait">
              <motion.div
                key={`${index}-${slide.eyebrow}`}
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -14 }}
                transition={{ duration: 0.5, ease: "easeOut" }}
                className="flex w-full flex-col items-center"
              >
                <p className="min-h-[1.75rem] font-roboto text-sm font-medium tracking-[0.28em] text-gold uppercase sm:text-base md:min-h-[2rem] md:text-lg">
                  {slide.eyebrow}
                </p>

                <h1 className="mt-5 flex min-h-[5.5rem] flex-col justify-center font-sans text-4xl font-extrabold tracking-[0.08em] text-white uppercase sm:min-h-[6.5rem] sm:text-5xl md:min-h-[7.5rem] md:text-6xl lg:text-7xl">
                  <span>{slide.title1}</span>
                  <span>{slide.title2}</span>
                </h1>

                <p className="mx-auto mt-6 min-h-[4.5rem] max-w-2xl text-base leading-relaxed text-white/90 sm:min-h-[5rem] md:text-lg">
                  {slide.subtitle}
                </p>
              </motion.div>
            </AnimatePresence>
          </div>

          <div className="mt-8 flex w-full flex-col items-center gap-3 sm:mt-10 sm:flex-row sm:justify-center sm:gap-4">
            <Link
              to="/rendez-vous"
              className="group inline-flex h-12 w-full max-w-xs items-center justify-center gap-2 rounded-md bg-gradient-to-b from-gold-light via-gold to-gold-dark px-8 text-xs font-semibold tracking-[0.18em] text-brown-deep uppercase shadow-[0_12px_32px_rgba(42,31,24,0.45)] transition duration-300 hover:-translate-y-0.5 hover:brightness-110 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold sm:w-auto sm:min-w-[220px]"
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
              className="inline-flex h-12 w-full max-w-xs items-center justify-center rounded-md border border-gold/70 bg-brown-deep/25 px-8 text-xs font-semibold tracking-[0.18em] text-gold-light uppercase backdrop-blur-sm transition duration-300 hover:border-gold hover:bg-gold hover:text-brown-deep focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold sm:w-auto sm:min-w-[220px]"
            >
              {t.hero.ctaSecondary}
            </Link>
          </div>

          <div
            className="mt-8 flex h-4 items-center justify-center gap-2.5"
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
