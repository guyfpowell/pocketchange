import express from "express";
import { prisma } from "./lib/prisma";

const app = express();
const PORT = process.env.PORT || 4000;

app.get("/", (req, res) => {
  res.send("Backend is working!");
});

app.get("/api/health", (req, res) => {
  res.json({ message: "Backend is reachable!" });
});

app.get("/api/users", async (req, res) => {
  const users = await prisma.user.findMany();
  res.json(users);
});

app.listen(PORT, () => {
  console.log(`Backend running on port ${PORT}`);
});