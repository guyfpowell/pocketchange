import { Request, Response, NextFunction } from "express";
import * as authService from "./auth.service";
import type { RegisterInput, LoginInput, RefreshInput } from "@pocketchange/shared";

export async function registerHandler(
  req: Request<object, object, RegisterInput>,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const user = await authService.register(req.body);
    res.status(201).json({ user });
  } catch (err) {
    next(err);
  }
}

export async function loginHandler(
  req: Request<object, object, LoginInput>,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const tokens = await authService.login(req.body);
    res.json(tokens);
  } catch (err) {
    next(err);
  }
}

export async function refreshHandler(
  req: Request<object, object, RefreshInput>,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const result = await authService.refresh(req.body.refreshToken);
    res.json(result);
  } catch (err) {
    next(err);
  }
}

export async function logoutHandler(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    await authService.logout(req.user!.id);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
}
