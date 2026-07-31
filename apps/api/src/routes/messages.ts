import { Router } from "express";
import { contactMessageSchema } from "@rc/shared";
import { prisma } from "../lib/prisma.js";
import { sendEmail } from "../lib/email.js";
import { env } from "../lib/env.js";
import { requireAdmin } from "../middleware/auth.js";
import { HttpError } from "../middleware/error.js";

export const messagesRouter = Router();

messagesRouter.post("/", async (req, res, next) => {
  try {
    const data = contactMessageSchema.parse(req.body);
    const message = await prisma.message.create({ data });

    await sendEmail({
      to: env.contact.email,
      subject: `Contact — ${data.subject}`,
      html: `
        <p><strong>${data.firstName} ${data.lastName}</strong> (${data.email})</p>
        <p>${data.phone ?? ""}</p>
        <p><strong>${data.subject}</strong></p>
        <p>${data.message}</p>
      `,
    });

    await prisma.notification.create({
      data: {
        title: "Nouveau message",
        body: `${data.firstName} ${data.lastName} — ${data.subject}`,
        link: "/admin/messages",
      },
    });

    res.status(201).json({ ok: true, id: message.id });
  } catch (error) {
    next(error);
  }
});

messagesRouter.get("/", requireAdmin, async (_req, res, next) => {
  try {
    const items = await prisma.message.findMany({
      orderBy: { createdAt: "desc" },
    });
    res.json(items);
  } catch (error) {
    next(error);
  }
});

messagesRouter.patch("/:id/read", requireAdmin, async (req, res, next) => {
  try {
    const item = await prisma.message.update({
      where: { id: req.params.id },
      data: { read: true },
    });
    res.json(item);
  } catch {
    next(new HttpError(404, "Message introuvable"));
  }
});

messagesRouter.delete("/:id", requireAdmin, async (req, res, next) => {
  try {
    await prisma.message.delete({ where: { id: req.params.id } });
    res.status(204).end();
  } catch (error) {
    next(error);
  }
});
