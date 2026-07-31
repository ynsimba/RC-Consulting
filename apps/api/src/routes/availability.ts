import { Router } from "express";
import { availabilitySchema, blockedSlotSchema } from "@rc/shared";
import { prisma } from "../lib/prisma.js";
import { requireAdmin } from "../middleware/auth.js";
import { HttpError } from "../middleware/error.js";

export const availabilityAdminRouter = Router();

availabilityAdminRouter.use(requireAdmin);

availabilityAdminRouter.get("/", async (_req, res, next) => {
  try {
    const [windows, blocked] = await Promise.all([
      prisma.availability.findMany({ orderBy: [{ dayOfWeek: "asc" }, { startTime: "asc" }] }),
      prisma.blockedSlot.findMany({ orderBy: { date: "asc" } }),
    ]);
    res.json({ windows, blocked });
  } catch (error) {
    next(error);
  }
});

availabilityAdminRouter.post("/windows", async (req, res, next) => {
  try {
    const data = availabilitySchema.parse(req.body);
    const item = await prisma.availability.create({ data });
    res.status(201).json(item);
  } catch (error) {
    next(error);
  }
});

availabilityAdminRouter.put("/windows/:id", async (req, res, next) => {
  try {
    const data = availabilitySchema.parse(req.body);
    const item = await prisma.availability.update({
      where: { id: req.params.id },
      data,
    });
    res.json(item);
  } catch {
    next(new HttpError(404, "Disponibilité introuvable"));
  }
});

availabilityAdminRouter.delete("/windows/:id", async (req, res, next) => {
  try {
    await prisma.availability.delete({ where: { id: req.params.id } });
    res.status(204).end();
  } catch (error) {
    next(error);
  }
});

availabilityAdminRouter.post("/blocked", async (req, res, next) => {
  try {
    const data = blockedSlotSchema.parse(req.body);
    const item = await prisma.blockedSlot.create({
      data: {
        date: new Date(`${data.date}T00:00:00.000Z`),
        startTime: data.startTime ?? null,
        endTime: data.endTime ?? null,
        reason: data.reason ?? null,
      },
    });
    res.status(201).json(item);
  } catch (error) {
    next(error);
  }
});

availabilityAdminRouter.delete("/blocked/:id", async (req, res, next) => {
  try {
    await prisma.blockedSlot.delete({ where: { id: req.params.id } });
    res.status(204).end();
  } catch (error) {
    next(error);
  }
});
