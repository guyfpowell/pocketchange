import express from "express";

const app = express();
const PORT = process.env.PORT || 4000;

app.get("/", (req, res) => {
  res.send("Backend is working!");
});

app.get("/api/health", (req, res) => {
  res.json({ message: "Backend is reachable!" });
});

app.listen(PORT, () => {
  console.log(`Backend running on port ${PORT}`);
});