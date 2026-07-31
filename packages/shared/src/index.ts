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
      "Conseil et accompagnement en droit belge pour particuliers, entreprises et institutions.",
  },
  {
    slug: "droit-ohada",
    title: "Droit OHADA",
    short:
      "Expertise en droit des affaires OHADA pour vos opérations en Afrique, notamment en RDC.",
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
      "Règlement alternatif des litiges commerciaux par une procédure d'arbitrage maîtrisée.",
  },
  {
    slug: "negociation-contrats",
    title: "Négociation & contrats",
    short:
      "Assistance à la négociation d'accords et sécurisation de vos contrats stratégiques.",
  },
  {
    slug: "accompagnement-entrepreneurs-investisseurs",
    title: "Entrepreneurs & investisseurs",
    short:
      "Accompagnement institutionnel entre la Belgique et la République démocratique du Congo.",
  },
  {
    slug: "conseil-autorites-publiques",
    title: "Autorités publiques",
    short:
      "Coordination de projets transversaux et promotion des modes alternatifs de règlement des différends.",
  },
] as const;

export type PracticeAreaSlug = (typeof PRACTICE_AREAS)[number]["slug"];
