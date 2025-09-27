import { Request, Response, NextFunction } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";

const ACCESS_SECRET = process.env.JWT_SECRET || "rahasia-access";

export interface AuthRequest extends Request {
  user?: string | JwtPayload;
}

export function jwtAuth(req: AuthRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1]; // Bearer <token>

  if (!token) return res.status(401).json({ message: "Token missing" });

  try {
    const decoded = jwt.verify(token, ACCESS_SECRET);
    req.user = decoded;
    next();
  } catch {
    return res.status(403).json({ message: "Token invalid or expired" });
  }
}
