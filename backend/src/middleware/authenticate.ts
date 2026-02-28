import { Request, Response, NextFunction } from "express";
import { verifyAccessToken } from "../config/jwt";
import { UserRole } from "@prisma/client";
import { AppError } from "./errorHandler";

export function authenticate(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  const authHeader = req.headers.authorization;

  if (!authHeader?.startsWith("Bearer ")) {
    return next(new AppError("Missing or invalid Authorization header", 401));
  }

  const token = authHeader.slice(7);

  try {
    const payload = verifyAccessToken(token);
    req.user = {
      id: payload.sub,
      role: payload.role as UserRole,
    };
    next();
  } catch {
    next(new AppError("Invalid or expired token", 401));
  }
}
