import { NextFunction, Request, Response } from "express";
import { verifyAccessToken } from "../utils/jwt.js";
import { HttpError } from "../utils/http-error.js";

export function requireAuth(req: Request, _res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  if (!header?.startsWith("Bearer ")) {
    return next(new HttpError(401, "Authentication required"));
  }

  try {
    const payload = verifyAccessToken(header.slice(7));
    req.auth = {
      id: payload.sub,
      type: payload.type,
      role: payload.role
    };
    next();
  } catch {
    next(new HttpError(401, "Invalid or expired token"));
  }
}

export function requireAdmin(...roles: string[]) {
  return (req: Request, _res: Response, next: NextFunction) => {
    if (req.auth?.type !== "ADMIN") {
      return next(new HttpError(403, "Admin access required"));
    }
    if (roles.length && (!req.auth.role || !roles.includes(req.auth.role))) {
      return next(new HttpError(403, "Insufficient permission"));
    }
    next();
  };
}

export function requirePensioner(req: Request, _res: Response, next: NextFunction) {
  if (req.auth?.type !== "PENSIONER") {
    return next(new HttpError(403, "Pensioner access required"));
  }
  next();
}
