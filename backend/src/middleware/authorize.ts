import { Request, Response, NextFunction } from "express";
import { UserRole } from "@prisma/client";
import { AppError } from "./errorHandler";

export function authorize(...roles: UserRole[]) {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      return next(new AppError("Unauthenticated", 401));
    }

    if (!roles.includes(req.user.role)) {
      return next(new AppError("Forbidden", 403));
    }

    next();
  };
}
