import { NextFunction, Request, Response } from "express";
import { verifyAccessToken } from "../lib/tokens";

export interface AuthenticatedUser {
  id: string;
  role: "USER" | "ADMIN";
}

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      user?: AuthenticatedUser;
    }
  }
}

export function requireAuth(req: Request, res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  const token = header?.startsWith("Bearer ") ? header.slice("Bearer ".length) : undefined;

  if (!token) {
    return res.status(401).json({ error: "Missing access token" });
  }

  try {
    const payload = verifyAccessToken(token);
    req.user = { id: payload.id, role: payload.role };
    return next();
  } catch {
    return res.status(401).json({ error: "Invalid or expired access token" });
  }
}

// Attaches req.user when a valid token is present, but never rejects the
// request. Used for endpoints that are public but personalize when logged in.
export function optionalAuth(req: Request, _res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  const token = header?.startsWith("Bearer ") ? header.slice("Bearer ".length) : undefined;

  if (token) {
    try {
      const payload = verifyAccessToken(token);
      req.user = { id: payload.id, role: payload.role };
    } catch {
      // Ignore invalid token; treat as anonymous.
    }
  }
  return next();
}

export function requireAdmin(req: Request, res: Response, next: NextFunction) {
  if (req.user?.role !== "ADMIN") {
    return res.status(403).json({ error: "Admin access required" });
  }
  return next();
}
