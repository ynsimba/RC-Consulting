import { Helmet } from "react-helmet-async";

type SeoProps = {
  title: string;
  description: string;
  path?: string;
  image?: string;
  type?: string;
  jsonLd?: Record<string, unknown> | Record<string, unknown>[];
  /** Empêche l’indexation (pages token / privées). */
  noIndex?: boolean;
  /** Politique Referer (ex. pages avec secret dans le fragment). */
  referrer?: "no-referrer" | "strict-origin-when-cross-origin";
};

const SITE = (
  import.meta.env.VITE_SITE_URL ?? "https://rc-consulting-legal.com"
).replace(/\/$/, "");
const DEFAULT_IMAGE =
  "https://images.unsplash.com/photo-1505664194779-8beaceb93744?auto=format&fit=crop&w=1200&q=80";

export function Seo({
  title,
  description,
  path = "/",
  image = DEFAULT_IMAGE,
  type = "website",
  jsonLd,
  noIndex = false,
  referrer,
}: SeoProps) {
  const url = `${SITE}${path}`;
  const fullTitle = title.includes("RC Consulting")
    ? title
    : `${title} | RC Consulting`;

  return (
    <Helmet>
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      <link rel="canonical" href={url} />
      {noIndex && <meta name="robots" content="noindex, nofollow" />}
      {referrer && <meta name="referrer" content={referrer} />}
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:type" content={type} />
      <meta property="og:url" content={url} />
      <meta property="og:image" content={image} />
      <meta property="og:locale" content="fr_BE" />
      <meta property="og:site_name" content="RC Consulting" />
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={image} />
      {jsonLd && (
        <script type="application/ld+json">
          {JSON.stringify(jsonLd)}
        </script>
      )}
    </Helmet>
  );
}

export const legalServiceJsonLd = {
  "@context": "https://schema.org",
  "@type": "LegalService",
  name: "RC Consulting",
  description:
    "Cabinet de conseil juridique en droit belge et en droit OHADA, actif en Belgique et en République démocratique du Congo. Médiation, arbitrage et accompagnement institutionnel.",
  url: SITE,
  telephone: "+32476950655",
  email: "contact@rc-consulting-legal.com",
  areaServed: [
    { "@type": "Country", name: "Belgium" },
    { "@type": "Country", name: "Democratic Republic of the Congo" },
  ],
  knowsAbout: [
    "Droit belge",
    "Droit OHADA",
    "Médiation",
    "Arbitrage",
    "Négociation de contrats",
  ],
  priceRange: "€€€",
};
