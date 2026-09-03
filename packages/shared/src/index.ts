export * from "./schemas/appointment.js";
export * from "./schemas/contact.js";
export * from "./schemas/auth.js";
export * from "./schemas/blog.js";
export * from "./schemas/faq.js";
export * from "./schemas/availability.js";

export const PRACTICE_AREAS = [
  {
    slug: "droit-belge",
    title: "Droit belge",
    short:
      "Conseil et accompagnement en droit belge pour particuliers, entreprises et institutions publiques.",
  },
  {
    slug: "droit-ohada",
    title: "Droit OHADA",
    short:
      "Expertise en droit OHADA pour vos opérations en Afrique, notamment en RDC.",
  },
  {
    slug: "mediation",
    title: "Médiation",
    short:
      "Prévention et règlement amiable des différends civils ou commerciaux.",
  },
  {
    slug: "arbitrage",
    title: "Arbitrage",
    short:
      "Règlement alternatif des litiges commerciaux par arbitrage.",
  },
  {
    slug: "consultance-accompagnement",
    title: "Consultance & Accompagnement",
    short:
      "Négociation de contrats, accompagnement institutionnel Belgique–RDC et conseil aux autorités publiques.",
  },
] as const;

export type PracticeAreaSlug = (typeof PRACTICE_AREAS)[number]["slug"];
