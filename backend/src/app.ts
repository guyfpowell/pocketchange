import "./config/env";
import express from "express";
import helmet from "helmet";
import cors from "cors";
import rateLimit from "express-rate-limit";
import { env } from "./config/env";
import { prisma } from "./lib/prisma";
import { errorHandler } from "./middleware/errorHandler";

const app = express();

app.use(
  "/api/webhooks/stripe",
  express.raw({ type: "application/json" })
);

app.use(helmet());
app.use(cors({ origin: env.CORS_ORIGIN }));
app.use(express.json());

app.use(
  "/api/auth",
  rateLimit({ windowMs: 15 * 60 * 1000, max: 20, standardHeaders: true, legacyHeaders: false })
);

app.get("/", (req, res) => {
  res.json({ message: "PocketChange API" });
});

app.get("/api/health", (req, res) => {
  res.json({ status: "ok" });
});

app.get("/api/users", async (req, res, next) => {
  try {
    const users = await prisma.user.findMany();
    res.json(users);
  } catch (err) {
    next(err);
  }
});

app.use(errorHandler);

app.listen(env.PORT, () => {
  console.log(`Backend running on port ${env.PORT}`);
});
