import { Request, Response, NextFunction } from "express";

export class AppError extends Error {
  constructor(
    public readonly message: string,
    public readonly statusCode: number
  ) {
    super(message);
    this.name = "AppError";
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

export function errorHandler(
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
): void {
  if (err instanceof AppError) {
    res.status(err.statusCode).json({ error: err.message });
    return;
  }

  console.error(err);
  res.status(500).json({ error: "Internal server error" });
}
