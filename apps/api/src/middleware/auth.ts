import type { NextFunction, Request, Response } from "express";
import { getSession } from "@auth/express";
import { authConfig } from "../auth/config.js";
import { HttpError } from "./error.js";
import { readSession } from "../lib/session.js";

export type SessionUser = {
  id: string;
  email: string;
  role: "ADMIN" | "CLIENT";
  name?: string | null;
};

declare global {
  namespace Express {
    interface Request {
      user?: SessionUser;
    }
  }
}

export async function attachUser(
  req: Request,
  _res: Response,
  next: NextFunction,
) {
  try {
    const local = readSession(req);
    if (local) {
      req.user = {
        id: local.id,
        email: local.email,
        role: local.role,
        name: local.name,
      };
      return next();
    }

    const session = await getSession(req, authConfig);
    if (session?.user) {
      req.user = session.user as SessionUser;
    }
    next();
  } catch (error) {
    next(error);
  }
}

export function requireAuth(req: Request, _res: Response, next: NextFunction) {
  if (!req.user) return next(new HttpError(401, "Non authentifié"));
  next();
}

export function requireAdmin(req: Request, _res: Response, next: NextFunction) {
  if (!req.user) return next(new HttpError(401, "Non authentifié"));
  if (req.user.role !== "ADMIN") return next(new HttpError(403, "Accès refusé"));
  next();
}
