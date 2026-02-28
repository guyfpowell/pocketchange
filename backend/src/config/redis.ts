import Redis from "ioredis";
import { env } from "./env";

export const redis = new Redis(env.REDIS_URL, { lazyConnect: true });

redis.on("error", (err) => {
  console.error("Redis error:", err.message);
});

const REFRESH_TTL_SECONDS = 60 * 60 * 24 * 7; // 7 days

export async function storeRefreshToken(userId: string): Promise<void> {
  await redis.set(`refresh:${userId}`, "1", "EX", REFRESH_TTL_SECONDS);
}

export async function getRefreshToken(userId: string): Promise<string | null> {
  return redis.get(`refresh:${userId}`);
}

export async function deleteRefreshToken(userId: string): Promise<void> {
  await redis.del(`refresh:${userId}`);
}
