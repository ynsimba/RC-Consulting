import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { useLanguage } from "@/i18n/LanguageContext";

export function CtaBanner() {
  const { t } = useLanguage();

  return (
    <section className="relative overflow-hidden py-20">
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(135deg, #6b4f3a 0%, #8a6a3a 42%, #c4a35a 100%)",
        }}
      />
      <div
        className="pointer-events-none absolute inset-0 opacity-30"
        style={{
          background:
            "radial-gradient(ellipse at 20% 0%, rgba(255,255,255,0.22), transparent 50%), radial-gradient(ellipse at 90% 100%, rgba(61,43,31,0.35), transparent 45%)",
        }}
      />
      <div className="container-rc relative z-10 text-center">
        <motion.p
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="font-serif tracking-[0.25em] text-white/90 uppercase"
        >
          {t.home.ctaEyebrow}
        </motion.p>
        <motion.h2
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-3 font-sans text-3xl font-bold tracking-[0.12em] text-white uppercase md:text-4xl"
        >
          {t.home.ctaTitle}
        </motion.h2>
        <motion.p
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mx-auto mt-4 max-w-xl text-white/90"
        >
          {t.home.ctaText}
        </motion.p>
        <div className="mt-8">
          <Link
            to="/rendez-vous"
            className="inline-flex items-center justify-center rounded-md bg-[#faf7f1] px-7 py-3.5 text-xs font-semibold tracking-[0.18em] text-brown-deep uppercase shadow-lg transition duration-300 hover:-translate-y-0.5 hover:bg-white"
          >
            {t.home.ctaButton}
          </Link>
        </div>
      </div>
    </section>
  );
}
