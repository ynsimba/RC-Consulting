import { Router } from "express";
import { PRACTICE_AREAS } from "@rc/shared";
import { prisma } from "../lib/prisma.js";
import { env } from "../lib/env.js";

export const seoRouter = Router();

seoRouter.get("/robots.txt", (_req, res) => {
  res.type("text/plain").send(`User-agent: *
Allow: /
Disallow: /admin
Disallow: /api

Sitemap: ${env.webUrl}/sitemap.xml
`);
});

seoRouter.get("/sitemap.xml", async (_req, res, next) => {
  try {
    const articles = await prisma.article.findMany({
      where: { published: true },
      select: { slug: true, updatedAt: true },
    });

    const staticPaths = [
      "/",
      "/a-propos",
      "/nos-expertises",
      "/blog",
      "/faq",
      "/rendez-vous",
      "/contact",
      "/mentions-legales",
      "/politique-de-confidentialite",
      ...PRACTICE_AREAS.map((p) => `/nos-expertises/${p.slug}`),
    ];

    const urls = [
      ...staticPaths.map(
        (path) => `
  <url>
    <loc>${env.webUrl}${path}</loc>
    <changefreq>weekly</changefreq>
    <priority>${path === "/" ? "1.0" : "0.7"}</priority>
  </url>`,
      ),
      ...articles.map(
        (a) => `
  <url>
    <loc>${env.webUrl}/blog/${a.slug}</loc>
    <lastmod>${a.updatedAt.toISOString()}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.6</priority>
  </url>`,
      ),
    ];

    res
      .type("application/xml")
      .send(`<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.join("\n")}
</urlset>`);
  } catch (error) {
    next(error);
  }
});

seoRouter.get("/site-config", (_req, res) => {
  res.json({
    contact: env.contact,
    brand: {
      name: "RC Consulting",
      tagline: "Droit belge & OHADA — Belgique · RDC",
    },
  });
});
