import { Router } from "express";
import bcrypt from "bcryptjs";
import { loginSchema, registerSchema } from "@rc/shared";
import { prisma } from "../lib/prisma.js";
import { requireAuth } from "../middleware/auth.js";
import { HttpError } from "../middleware/error.js";
import {
  clearSessionCookie,
  createSessionToken,
  setSessionCookie,
} from "../lib/session.js";

export const authRouter = Router();

authRouter.post("/register", async (req, res, next) => {
  try {
    const data = registerSchema.parse(req.body);
    const exists = await prisma.user.findUnique({
      where: { email: data.email.toLowerCase() },
    });
    if (exists) throw new HttpError(409, "Email déjà utilisé");

    const passwordHash = await bcrypt.hash(data.password, 12);
    const user = await prisma.user.create({
      data: {
        email: data.email.toLowerCase(),
        passwordHash,
        firstName: data.firstName,
        lastName: data.lastName,
        phone: data.phone,
        role: "CLIENT",
        client: {
          create: {
            firstName: data.firstName,
            lastName: data.lastName,
            email: data.email.toLowerCase(),
            phone: data.phone,
          },
        },
      },
    });

    const token = createSessionToken({
      id: user.id,
      email: user.email,
      role: user.role,
      name: [user.firstName, user.lastName].filter(Boolean).join(" "),
    });
    setSessionCookie(res, token);

    res.status(201).json({
      id: user.id,
      email: user.email,
      role: user.role,
      name: [user.firstName, user.lastName].filter(Boolean).join(" "),
    });
  } catch (error) {
    next(error);
  }
});

authRouter.post("/login", async (req, res, next) => {
  try {
    const data = loginSchema.parse(req.body);
    const user = await prisma.user.findUnique({
      where: { email: data.email.toLowerCase() },
    });
    if (!user) throw new HttpError(401, "Identifiants invalides");

    const valid = await bcrypt.compare(data.password, user.passwordHash);
    if (!valid) throw new HttpError(401, "Identifiants invalides");

    const token = createSessionToken({
      id: user.id,
      email: user.email,
      role: user.role,
      name: [user.firstName, user.lastName].filter(Boolean).join(" "),
    });
    setSessionCookie(res, token);

    res.json({
      id: user.id,
      email: user.email,
      role: user.role,
      name: [user.firstName, user.lastName].filter(Boolean).join(" "),
    });
  } catch (error) {
    next(error);
  }
});

authRouter.post("/logout", (_req, res) => {
  clearSessionCookie(res);
  res.json({ ok: true });
});

authRouter.get("/me", requireAuth, async (req, res) => {
  res.json(req.user);
});
