import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { env } from "../config/env";

type JwtPayload = {
  sub: string;
  isAdmin?: boolean;
};

export interface AuthRequest extends Request {
  user?: { id: string; isAdmin: boolean };
}

export function protect(req: AuthRequest, res: Response, next: NextFunction) {
  const header = req.headers.authorization;

  if (!header || !header.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Missing or invalid Authorization header" });
  }

  const token = header.slice("Bearer ".length).trim();

  try {
    const decoded = jwt.verify(token, env.JWT_SECRET) as JwtPayload;

    req.user = {
      id: decoded.sub,
      isAdmin: Boolean(decoded.isAdmin)
    };

    return next();
  } catch (err) {
    return res.status(401).json({ message: "Invalid or expired token" });
  }
}
