import bcrypt from "bcrypt";
import { prisma } from "../../lib/prisma";
import { signAccessToken, signRefreshToken, verifyRefreshToken } from "../../config/jwt";
import { storeRefreshToken, getRefreshToken, deleteRefreshToken } from "../../config/redis";
import { AppError } from "../../middleware/errorHandler";
import type { RegisterInput, LoginInput } from "@pocketchange/shared";
import { UserRole } from "@prisma/client";

const SALT_ROUNDS = 10;

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface SafeUser {
  id: string;
  email: string;
  role: UserRole;
  walletBalance: number;
  createdAt: Date;
}

function toSafeUser(user: { id: string; email: string; role: UserRole; walletBalance: number; createdAt: Date }): SafeUser {
  return {
    id: user.id,
    email: user.email,
    role: user.role,
    walletBalance: user.walletBalance,
    createdAt: user.createdAt,
  };
}

export async function register(input: RegisterInput): Promise<SafeUser> {
  const existing = await prisma.user.findUnique({ where: { email: input.email } });
  if (existing) {
    throw new AppError("Email already in use", 409);
  }

  const hashed = await bcrypt.hash(input.password, SALT_ROUNDS);

  const user = await prisma.user.create({
    data: {
      email: input.email,
      password: hashed,
      role: input.role as UserRole,
    },
  });

  return toSafeUser(user);
}

export async function login(input: LoginInput): Promise<AuthTokens> {
  const user = await prisma.user.findUnique({ where: { email: input.email } });

  if (!user) {
    throw new AppError("Invalid credentials", 401);
  }

  const valid = await bcrypt.compare(input.password, user.password);
  if (!valid) {
    throw new AppError("Invalid credentials", 401);
  }

  const payload = { sub: user.id, role: user.role };
  const accessToken = signAccessToken(payload);
  const refreshToken = signRefreshToken(payload);

  await storeRefreshToken(user.id);

  return { accessToken, refreshToken };
}

export async function refresh(rawRefreshToken: string): Promise<{ accessToken: string }> {
  let payload: { sub: string; role: string };

  try {
    payload = verifyRefreshToken(rawRefreshToken);
  } catch {
    throw new AppError("Invalid or expired refresh token", 401);
  }

  const stored = await getRefreshToken(payload.sub);
  if (!stored) {
    throw new AppError("Session expired, please log in again", 401);
  }

  const accessToken = signAccessToken({ sub: payload.sub, role: payload.role });
  return { accessToken };
}

export async function logout(userId: string): Promise<void> {
  await deleteRefreshToken(userId);
}
