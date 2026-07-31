import { Router } from "express";
import { prisma } from "../lib/prisma.js";
import { requireAdmin } from "../middleware/auth.js";
import { HttpError } from "../middleware/error.js";

export const clientsRouter = Router();

clientsRouter.use(requireAdmin);

clientsRouter.get("/", async (_req, res, next) => {
  try {
    const clients = await prisma.client.findMany({
      include: {
        _count: { select: { appointments: true } },
        appointments: {
          orderBy: { startsAt: "desc" },
          take: 1,
        },
      },
      orderBy: { createdAt: "desc" },
    });
    res.json(clients);
  } catch (error) {
    next(error);
  }
});

clientsRouter.get("/:id", async (req, res, next) => {
  try {
    const client = await prisma.client.findUnique({
      where: { id: req.params.id },
      include: { appointments: { orderBy: { startsAt: "desc" } } },
    });
    if (!client) throw new HttpError(404, "Client introuvable");
    res.json(client);
  } catch (error) {
    next(error);
  }
});

clientsRouter.delete("/:id", async (req, res, next) => {
  try {
    await prisma.client.delete({ where: { id: req.params.id } });
    res.status(204).end();
  } catch (error) {
    next(error);
  }
});
