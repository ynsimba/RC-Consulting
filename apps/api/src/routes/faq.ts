import { Router } from "express";
import { faqSchema } from "@rc/shared";
import { prisma } from "../lib/prisma.js";
import { HttpError } from "../middleware/error.js";
import { requireAdmin } from "../middleware/auth.js";

export const faqRouter = Router();

faqRouter.get("/", async (_req, res, next) => {
  try {
    const items = await prisma.faq.findMany({
      where: { published: true },
      orderBy: [{ order: "asc" }, { createdAt: "asc" }],
    });
    res.json(items);
  } catch (error) {
    next(error);
  }
});

faqRouter.get("/admin", requireAdmin, async (_req, res, next) => {
  try {
    const items = await prisma.faq.findMany({
      orderBy: [{ order: "asc" }, { createdAt: "asc" }],
    });
    res.json(items);
  } catch (error) {
    next(error);
  }
});

faqRouter.post("/admin", requireAdmin, async (req, res, next) => {
  try {
    const data = faqSchema.parse(req.body);
    const item = await prisma.faq.create({ data });
    res.status(201).json(item);
  } catch (error) {
    next(error);
  }
});

faqRouter.put("/admin/:id", requireAdmin, async (req, res, next) => {
  try {
    const data = faqSchema.parse(req.body);
    const item = await prisma.faq.update({
      where: { id: req.params.id },
      data,
    });
    res.json(item);
  } catch (error) {
    next(error);
  }
});

faqRouter.delete("/admin/:id", requireAdmin, async (req, res, next) => {
  try {
    await prisma.faq.delete({ where: { id: req.params.id } });
    res.status(204).end();
  } catch (error) {
    next(error);
  }
});

faqRouter.get("/:id", async (req, res, next) => {
  try {
    const item = await prisma.faq.findUnique({ where: { id: req.params.id } });
    if (!item) throw new HttpError(404, "FAQ introuvable");
    res.json(item);
  } catch (error) {
    next(error);
  }
});
