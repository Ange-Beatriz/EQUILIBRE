import type { Request, Response, NextFunction } from "express";
import jwt, { Secret } from "jsonwebtoken";

const JWT_SECRET: Secret = (process.env.JWT_SECRET || "secret-dev") as Secret;

export function requireAuth(req: Request, res: Response, next: NextFunction) {
  const token = req.cookies?.token || req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ message: "Non autorisé" });

  try {
    const payload = jwt.verify(token, JWT_SECRET) as any;
    req.user = payload; // { id, email, role }
    next();
  } catch {
    return res.status(401).json({ message: "Token invalide" });
  }
}
