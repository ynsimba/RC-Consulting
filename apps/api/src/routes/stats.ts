import { Router } from "express";
import { prisma } from "../lib/prisma.js";
import { requireAdmin } from "../middleware/auth.js";

export const statsRouter = Router();

statsRouter.get("/", requireAdmin, async (_req, res, next) => {
  try {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const [
      appointmentsTotal,
      appointmentsMonth,
      clientsTotal,
      messagesUnread,
      articlesPublished,
      upcoming,
      byStatus,
    ] = await Promise.all([
      prisma.appointment.count(),
      prisma.appointment.count({ where: { createdAt: { gte: startOfMonth } } }),
      prisma.client.count(),
      prisma.message.count({ where: { read: false } }),
      prisma.article.count({ where: { published: true } }),
      prisma.appointment.count({
        where: {
          startsAt: { gte: now },
          status: { in: ["PENDING", "CONFIRMED"] },
        },
      }),
      prisma.appointment.groupBy({
        by: ["status"],
        _count: true,
      }),
    ]);

    res.json({
      appointmentsTotal,
      appointmentsMonth,
      clientsTotal,
      messagesUnread,
      articlesPublished,
      upcoming,
      byStatus: Object.fromEntries(byStatus.map((s) => [s.status, s._count])),
    });
  } catch (error) {
    next(error);
  }
});
