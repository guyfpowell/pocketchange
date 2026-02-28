import { Request, Response, NextFunction } from "express";
import { ZodTypeAny, z } from "zod";
import { AppError } from "./errorHandler";

export function validate(schema: ZodTypeAny) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const result = schema.safeParse(req.body);

    if (!result.success) {
      const message = result.error.issues
        .map((issue) => `${issue.path.join(".")}: ${issue.message}`)
        .join(", ");
      return next(new AppError(message, 422));
    }

    req.body = result.data as z.infer<typeof schema>;
    next();
  };
}
