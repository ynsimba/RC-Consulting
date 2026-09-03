import { Seo, legalServiceJsonLd } from "@/lib/seo";
import { HeroSection } from "@/components/home/HeroSection";
import { AboutPreview } from "@/components/home/AboutPreview";
import { WhyUs } from "@/components/home/WhyUs";
import { Values } from "@/components/home/Values";
import { PracticeAreas } from "@/components/home/PracticeAreas";
import { Method } from "@/components/home/Method";
import { FaqPreview } from "@/components/home/FaqPreview";
import { CtaBanner } from "@/components/home/CtaBanner";
import { useLanguage } from "@/i18n/LanguageContext";

export default function HomePage() {
  const { lang, t } = useLanguage();

  return (
    <>
      <Seo
        title={
          lang === "en"
            ? "RC Consulting — Belgian & OHADA Law | Belgium · DRC"
            : "RC Consulting — Droit belge & OHADA | Belgique · RDC"
        }
        description={t.hero.slides[0].subtitle}
        path="/"
        jsonLd={legalServiceJsonLd}
      />
      <HeroSection />
      <AboutPreview />
      <WhyUs />
      <Values />
      <PracticeAreas />
      <Method />
      <FaqPreview />
      <CtaBanner />
    </>
  );
}
