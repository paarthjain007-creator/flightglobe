/**
 * Netlify Serverless Function for OpenSky Network ADS-B Telemetry.
 * Proxies OpenSky API calls directly on Netlify without needing a separate backend server.
 */

let cachedPlanes = [];
let cacheTimestamp = 0;
const CACHE_TTL_MS = 12_000;
const OPENSKY_URL = "https://opensky-network.org/api/states/all";

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
    altitude: baroAltitude != null ? Math.round(parseFloat(baroAltitude) * 3.28084) : null,
    velocity: velocity != null ? Math.round(parseFloat(velocity) * 1.94384) : null,
    trueTrack: parseFloat(trueTrack) || 0,
    onGround: Boolean(onGround),
  };
}

const AIRLINES = [
  ["DAL", "Delta"], ["UAL", "United"], ["BAW", "British"], ["AFR", "Air France"],
  ["DLH", "Lufthansa"], ["SIA", "Singapore"], ["QFA", "Qantas"], ["UAE", "Emirates"],
  ["AAL", "American"], ["KAL", "Korean Air"], ["ANA", "ANA"], ["JAL", "JAL"],
  ["THY", "Turkish"], ["ETH", "Ethiopian"], ["MSR", "EgyptAir"],
];

function generateFallbackTraffic(count = 15) {
  return Array.from({ length: count }, (_, i) => {
    const airline = AIRLINES[i % AIRLINES.length];
    return {
      icao24: `FAKE${i.toString(16).padStart(4, "0").toUpperCase()}`,
      callsign: `${airline[0]}${100 + Math.floor(Math.random() * 9900)}`,
      originCountry: airline[1],
      lat: (Math.random() - 0.5) * 160,
      lng: (Math.random() - 0.5) * 360,
      altitude: 25000 + Math.floor(Math.random() * 15000),
      velocity: 420 + Math.floor(Math.random() * 100),
      trueTrack: Math.random() * 360,
      onGround: false,
      _synthetic: true,
    };
  });
}

export async function handler(_event, _context) {
  const now = Date.now();

  const headers = {
    "Access-Control-Allow-Origin": "*",
    "Content-Type": "application/json",
    "Cache-Control": "public, max-age=10",
  };

  if (cachedPlanes.length > 0 && now - cacheTimestamp < CACHE_TTL_MS) {
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ planes: cachedPlanes, source: "cache", ts: cacheTimestamp }),
    };
  }

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 6000);

    const res = await fetch(buildOpenSkyUrl(), {
      headers: { Accept: "application/json" },
      signal: controller.signal,
    });
    clearTimeout(timeout);

    if (!res.ok) throw new Error(`HTTP ${res.status}`);

    const data = await res.json();
    const states = data.states || [];

    const planes = states
      .map(normaliseState)
      .filter(Boolean)
      .filter((p) => !p.onGround);

    if (planes.length > 0) {
      cachedPlanes = planes;
      cacheTimestamp = now;
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ planes, source: "opensky", ts: now }),
      };
    }

    throw new Error("Empty states response");
  } catch (err) {
    if (cachedPlanes.length === 0) {
      cachedPlanes = generateFallbackTraffic(15);
      cacheTimestamp = now;
    }

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ planes: cachedPlanes, source: "fallback", ts: cacheTimestamp }),
    };
  }
}
