import express from "express";
import cors from "cors";
import { getTrafficData, getLiveExchangeRates, searchGlobalAirports, get7DayFareMatrixData } from "./proxy.js";
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

// ── GET /api/rates ───────────────────────────────────────────────────────────
app.get("/api/rates", async (_req, res) => {
  try {
    const rates = await getLiveExchangeRates();
    res.json({ status: "ok", rates, base: "USD", ts: Date.now() });
  } catch (err) {
    console.error("[server] /api/rates error:", err);
    res.status(500).json({ error: "Exchange rates unavailable" });
  }
});

// ── GET /api/fares/matrix ────────────────────────────────────────────────────
app.get("/api/fares/matrix", (req, res) => {
  try {
    const { origin, destination, departureDate, currency } = req.query;
    const data = get7DayFareMatrixData(origin, destination, departureDate, currency);
    res.json(data);
  } catch (err) {
    console.error("[server] /api/fares/matrix error:", err);
    res.status(500).json({ error: "Fare matrix unavailable", matrix: [] });
  }
});

// ── GET /api/airports/search ─────────────────────────────────────────────────
app.get("/api/airports/search", (req, res) => {
  const query = req.query.q || "";
  const results = searchGlobalAirports(query);
  res.json({ status: "ok", results, count: results.length });
});

// ── GET /api/health ──────────────────────────────────────────────────────────
app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", ts: Date.now() });
});

app.listen(PORT, () => {
  console.log(`\n  🛫  FlightGlobe Proxy Server`);
  console.log(`  ➜   http://localhost:${PORT}/api/traffic`);
  console.log(`  ➜   http://localhost:${PORT}/api/rates`);
  console.log(`  ➜   http://localhost:${PORT}/api/fares/matrix`);
  console.log(`  ➜   http://localhost:${PORT}/api/airports/search\n`);
});
