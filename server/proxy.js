/**
 * OpenSky Network ADS-B Proxy — caches state vectors, normalises fields,
 * and provides a deterministic fallback when the public API is unavailable.
 *
 * OpenSky /api/states/all returns:
 *   { time, states: [[icao24, callsign, origin_country, time_position,
 *       last_contact, longitude, latitude, baro_altitude, on_ground,
 *       velocity, true_track, vertical_rate, sensors, geo_altitude,
 *       squawk, spi, position_source], ...] }
 */

import fetch from "node-fetch";

// ── Cache ────────────────────────────────────────────────────────────────────
let cachedPlanes = [];
let cacheTimestamp = 0;
const CACHE_TTL_MS = 12_000; // 12 s — respect the 10-s OpenSky rate limit

// ── OpenSky endpoint ─────────────────────────────────────────────────────────
const OPENSKY_URL = "https://opensky-network.org/api/states/all";

// Optional: set OPENSKY_USER and OPENSKY_PASS env vars for higher rate limits
function buildOpenSkyUrl() {
  const user = process.env.OPENSKY_USER;
  const pass = process.env.OPENSKY_PASS;
  if (user && pass) {
    const u = new URL(OPENSKY_URL);
    u.username = user;
    u.password = pass;
    return u.toString();
  }
  return OPENSKY_URL;
}

/**
 * Normalise a raw OpenSky state vector array into a clean object.
 * Index reference: https://openskynetwork.github.io/opensky-api/rest.html
 */
function normaliseState(sv) {
  const [
    icao24, callsign, originCountry, , ,
    longitude, latitude, baroAltitude, onGround,
    velocity, trueTrack,
  ] = sv;

  if (latitude == null || longitude == null) return null;

  return {
    icao24: icao24 || "??????",
    callsign: (callsign || "").trim() || icao24 || "N/A",
    originCountry: originCountry || "Unknown",
    lat: parseFloat(latitude),
    lng: parseFloat(longitude),
    altitude: baroAltitude != null ? Math.round(parseFloat(baroAltitude) * 3.28084) : null, // → feet
    velocity: velocity != null ? Math.round(parseFloat(velocity) * 1.94384) : null,          // m/s → knots
    trueTrack: parseFloat(trueTrack) || 0,
    onGround: Boolean(onGround),
  };
}

// ── Fallback synthetic traffic ────────────────────────────────────────────────
const AIRLINES = [
  ["DAL", "Delta"], ["UAL", "United"], ["BAW", "British"], ["AFR", "Air France"],
  ["DLH", "Lufthansa"], ["SIA", "Singapore"], ["QFA", "Qantas"], ["UAE", "Emirates"],
  ["AAL", "American"], ["KAL", "Korean Air"], ["ANA", "ANA"], ["JAL", "JAL"],
  ["THY", "Turkish"], ["ETH", "Ethiopian"], ["MSR", "EgyptAir"],
];

function generateFallbackTraffic(count = 15) {
  return Array.from({ length: count }, (_, i) => {
    const airline = AIRLINES[i % AIRLINES.length];
    const lat = (Math.random() - 0.5) * 160;
    const lng = (Math.random() - 0.5) * 360;
    return {
      icao24: `FAKE${i.toString(16).padStart(4, "0").toUpperCase()}`,
      callsign: `${airline[0]}${100 + Math.floor(Math.random() * 9900)}`,
      originCountry: airline[1],
      lat,
      lng,
      altitude: 25000 + Math.floor(Math.random() * 15000),
      velocity: 420 + Math.floor(Math.random() * 100),
      trueTrack: Math.random() * 360,
      onGround: false,
      _synthetic: true,
    };
  });
}

// ── Main export ──────────────────────────────────────────────────────────────
export async function getTrafficData() {
  const now = Date.now();

  // Serve from cache if still fresh
  if (cachedPlanes.length > 0 && now - cacheTimestamp < CACHE_TTL_MS) {
    return { planes: cachedPlanes, source: "cache", ts: cacheTimestamp };
  }

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8000); // 8 s timeout

    const res = await fetch(buildOpenSkyUrl(), {
      headers: { "Accept": "application/json" },
      signal: controller.signal,
    });
    clearTimeout(timeout);

    if (!res.ok) throw new Error(`OpenSky HTTP ${res.status}`);

    const data = await res.json();
    const states = data.states || [];

    const planes = states
      .map(normaliseState)
      .filter(Boolean)
      .filter((p) => !p.onGround); // only airborne flights

    if (planes.length > 0) {
      cachedPlanes = planes;
      cacheTimestamp = now;
      return { planes, source: "opensky", ts: now };
    }

    throw new Error("Empty OpenSky response");
  } catch (err) {
    console.warn(`[proxy] OpenSky fetch failed (${err.message}) — using fallback traffic`);

    // On first ever request generate fallback; otherwise keep cached
    if (cachedPlanes.length === 0) {
      cachedPlanes = generateFallbackTraffic(15);
      cacheTimestamp = now;
    }

    return { planes: cachedPlanes, source: "fallback", ts: cacheTimestamp };
  }
}
