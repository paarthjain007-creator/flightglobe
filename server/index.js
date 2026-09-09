import express from "express";
import cors from "cors";
import { getTrafficData, getLiveExchangeRates, searchGlobalAirports, get7DayFareMatrixData } from "./proxy.js";
import { authenticateUser, authorizeRole } from "./auth.js";
import { getUser, getUserBookings, createBooking, cancelBooking, updateUserPreferences } from "./db.js";
import { processAgentChat } from "./agentEngine.js";

const app = express();
const PORT = process.env.PORT || 3001;

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (mobile apps, curl, server-to-server)
      if (!origin) return callback(null, true);
      if (
        /^https?:\/\/localhost(:\d+)?$/.test(origin) ||
        /^https?:\/\/127\.0\.0\.1(:\d+)?$/.test(origin) ||
        /^https?:\/\/192\.168\.\d+\.\d+(:\d+)?$/.test(origin) ||
        /^https?:\/\/10\.\d+\.\d+\.\d+(:\d+)?$/.test(origin) ||
        /\.netlify\.app$/.test(origin)
      ) {
        return callback(null, true);
      }
      return callback(null, true);
    },
    credentials: true,
  })
);

app.use(express.json());

// Defensive error handler for malformed JSON payloads
app.use((err, _req, res, next) => {
  if (err instanceof SyntaxError && err.status === 400 && "body" in err) {
    return res.status(400).json({ error: "Invalid JSON payload" });
  }
  next(err);
});

/* ── PHASE 1: REST API ROUTES & SECURITY ─────────────────────────────────────── */

// GET /api/user/me — Fetch active user profile
app.get("/api/user/me", authenticateUser, (req, res) => {
  res.json({ status: "ok", user: req.user });
});

// PUT /api/user/preferences — Mutate user settings
app.put("/api/user/preferences", authenticateUser, authorizeRole(["passenger", "admin"]), (req, res) => {
  try {
    const prefs = updateUserPreferences(req.user.id, req.body);
    res.json({ status: "ok", preferences: prefs });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// GET /api/bookings — Fetch user's active bookings
app.get("/api/bookings", authenticateUser, (req, res) => {
  const bookings = getUserBookings(req.user.id);
  res.json({ status: "ok", bookings });
});

// POST /api/bookings — Create a new flight booking
app.post("/api/bookings", authenticateUser, authorizeRole(["passenger", "admin"]), (req, res) => {
  try {
    const booking = createBooking(req.user.id, req.body);
    res.status(201).json({ status: "ok", booking });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// DELETE /api/bookings/:id — Cancel a booking
app.delete("/api/bookings/:id", authenticateUser, authorizeRole(["passenger", "admin"]), (req, res) => {
  try {
    const cancelled = cancelBooking(req.user.id, req.params.id);
    res.json({ status: "ok", cancelled });
  } catch (err) {
    res.status(404).json({ error: err.message });
  }
});

/* ── PHASE 2: AGENTIC AI ASSISTANT ROUTE ───────────────────────────────────── */

// POST /api/agent/chat — Process user query via Nimbus AI Agent & execute tools
app.post("/api/agent/chat", authenticateUser, async (req, res) => {
  try {
    const { message, history } = req.body;
    if (!message) return res.status(400).json({ error: "Message prompt is required" });

    const result = await processAgentChat(req.user, message, history);
    res.json({ status: "ok", ...result });
  } catch (err) {
    console.error("[server] /api/agent/chat error:", err);
    res.status(500).json({ error: "Agent execution failure", details: err.message });
  }
});

/* ── PROXY TELEMETRY ROUTES ─────────────────────────────────────────────────── */

app.get("/api/traffic", async (_req, res) => {
  try {
    const result = await getTrafficData();
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: "Traffic data unavailable", planes: [] });
  }
});

app.get("/api/rates", async (_req, res) => {
  try {
    const rates = await getLiveExchangeRates();
    res.json({ status: "ok", rates, base: "USD", ts: Date.now() });
  } catch (err) {
    res.status(500).json({ error: "Exchange rates unavailable" });
  }
});

app.get("/api/fares/matrix", (req, res) => {
  try {
    const { origin, destination, departureDate, currency } = req.query;
    const data = get7DayFareMatrixData(origin, destination, departureDate, currency);
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: "Fare matrix unavailable", matrix: [] });
  }
});

app.get("/api/airports/search", (req, res) => {
  const query = req.query.q || "";
  const results = searchGlobalAirports(query);
  res.json({ status: "ok", results, count: results.length });
});

app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", uptime: process.uptime(), version: "4.2.0", ts: Date.now() });
});

// 404 handler for unknown API endpoints
app.use("/api", (_req, res) => {
  res.status(404).json({ error: "API endpoint not found", status: 404 });
});

// Fallback error handler
app.use((err, _req, res, _next) => {
  console.error("[server] Uncaught exception:", err);
  res.status(err.status || 500).json({ error: err.message || "Internal Server Error" });
});

app.listen(PORT, () => {
  console.log(`\n  🛫  FlightGlobe Full-Stack Logic & Agent Server`);
  console.log(`  ➜   http://localhost:${PORT}/api/bookings`);
  console.log(`  ➜   http://localhost:${PORT}/api/agent/chat`);
  console.log(`  ➜   http://localhost:${PORT}/api/traffic\n`);
});
