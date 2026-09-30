/**
 * FlightGlobe Unified Safe API Client
 * Features:
 * - Content-Type validation (protects against SPA HTML 200 responses throwing SyntaxError: Unexpected token '<')
 * - Robust dual-mode execution (Express backend / Netlify serverless / offline client fallback)
 * - State synchronization for Bookings, AI Copilot, Fare Matrix, and Telemetry.
 */

const API_BASE = typeof window !== "undefined" ? "" : "http://localhost:3001";

/**
 * Executes a network request and safely guarantees valid JSON return.
 * If the response is HTML (e.g. static host SPA fallback) or network fails, returns null without throwing.
 */
export async function safeFetchJson(endpoint, options = {}) {
  try {
    const url = endpoint.startsWith("http") ? endpoint : `${API_BASE}${endpoint}`;
    const headers = {
      Accept: "application/json",
      ...(options.headers || {}),
    };

    const timeout = options.timeout || 6000;
    const signal = options.signal || (typeof AbortSignal?.timeout === "function" ? AbortSignal.timeout(timeout) : undefined);

    const res = await fetch(url, { ...options, headers, signal });
    const contentType = res.headers.get("content-type") || "";

    // Guard against static host SPA fallback returning 200 OK with index.html
    if (contentType.includes("text/html")) {
      return { ok: false, isHtmlFallback: true, status: res.status, data: null };
    }

    if (!res.ok) {
      return { ok: false, status: res.status, data: null };
    }

    const data = await res.json();
    return { ok: true, status: res.status, data };
  } catch (err) {
    return { ok: false, error: err.message, data: null };
  }
}

/* ─── 1. USER & BOOKINGS API ───────────────────────────────────────────────── */

export async function fetchUserBookingsAPI() {
  const result = await safeFetchJson("/api/bookings", {
    headers: { Authorization: "Bearer usr_commander_1" },
  });

  if (result.ok && result.data?.bookings && Array.isArray(result.data.bookings)) {
    return result.data.bookings;
  }
  return null;
}

export async function createBookingAPI(bookingData) {
  const result = await safeFetchJson("/api/bookings", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: "Bearer usr_commander_1",
    },
    body: JSON.stringify(bookingData),
  });

  if (result.ok && result.data?.booking) {
    return result.data.booking;
  }
  return null;
}

export async function cancelBookingAPI(bookingId) {
  const result = await safeFetchJson(`/api/bookings/${encodeURIComponent(bookingId)}`, {
    method: "DELETE",
    headers: { Authorization: "Bearer usr_commander_1" },
  });

  if (result.ok && result.data?.cancelled) {
    return result.data.cancelled;
  }
  return null;
}

/* ─── 2. AUTONOMOUS AI COPILOT AGENT API ────────────────────────────────────── */

export async function sendAgentChatMessageAPI(message, history = []) {
  const result = await safeFetchJson("/api/agent/chat", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: "Bearer usr_commander_1",
    },
    body: JSON.stringify({ message, history }),
    timeout: 15000,
  });

  if (result.ok && result.data?.status === "ok") {
    return result.data;
  }
  return null;
}

/* ─── 3. AIRPORT AUTOCOMPLETE & GDS SEARCH API ─────────────────────────────── */

export async function searchAirportsAPI(query) {
  if (!query || query.trim().length < 2) return [];
  const result = await safeFetchJson(`/api/airports/search?q=${encodeURIComponent(query.trim())}`);

  if (result.ok && Array.isArray(result.data?.results)) {
    return result.data.results;
  }
  return [];
}

export async function fetch7DayFareMatrixAPI(origin, destination, departureDate, currency = "USD") {
  const params = new URLSearchParams({
    origin: origin || "JFK",
    destination: destination || "LHR",
    departureDate: departureDate || new Date().toISOString().split("T")[0],
    currency,
  });

  const result = await safeFetchJson(`/api/fares/matrix?${params.toString()}`);
  if (result.ok && Array.isArray(result.data?.matrix) && result.data.matrix.length > 0) {
    return result.data.matrix;
  }
  return null;
}

/* ─── 4. TELEMETRY & FOREX RATES API ───────────────────────────────────────── */

export async function fetchTrafficDataAPI() {
  const result = await safeFetchJson("/api/traffic", { cache: "no-store" });
  if (result.ok && Array.isArray(result.data?.planes)) {
    return result.data;
  }
  return null;
}

export async function fetchExchangeRatesAPI() {
  const result = await safeFetchJson("/api/rates");
  if (result.ok && result.data?.rates) {
    return result.data.rates;
  }
  return null;
}
