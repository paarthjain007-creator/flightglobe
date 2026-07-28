import express from "express";
import cors from "cors";
import { getTrafficData } from "./proxy.js";

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors({ origin: ["http://localhost:5173", "http://localhost:4173"] }));
app.use(express.json());

// ── GET /api/traffic ─────────────────────────────────────────────────────────
app.get("/api/traffic", async (_req, res) => {
  try {
    const result = await getTrafficData();
    res.json(result);
  } catch (err) {
    console.error("[server] /api/traffic error:", err);
    res.status(500).json({ error: "Traffic data unavailable", planes: [] });
  }
});

// ── GET /api/health ──────────────────────────────────────────────────────────
app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", ts: Date.now() });
});

app.listen(PORT, () => {
  console.log(`\n  🛫  FlightGlobe Proxy Server`);
  console.log(`  ➜   http://localhost:${PORT}/api/traffic\n`);
});
