/**
 * Netlify Serverless Function for OpenSky Network ADS-B Telemetry.
 * Features Singleflight request collapsing, fast 3.5s timeout, and real airline brand mappings.
 */

let cachedPlanes = [];
let cacheTimestamp = 0;
let inFlightPromise = null;
const CACHE_TTL_MS = 12_000;
const OPENSKY_URL = "https://opensky-network.org/api/states/all";

const REAL_AIRLINE_ICAO_MAP = {
  ETD: { name: "Etihad Airways", logo: "🇦🇪", country: "United Arab Emirates" },
  UAE: { name: "Emirates", logo: "🇦🇪", country: "United Arab Emirates" },
  AIC: { name: "Air India", logo: "🇮🇳", country: "India" },
  IGO: { name: "IndiGo", logo: "🇮🇳", country: "India" },
  SEJ: { name: "SpiceJet", logo: "🇮🇳", country: "India" },
  VTI: { name: "Vistara", logo: "🇮🇳", country: "India" },
  AKJ: { name: "Akasa Air", logo: "🇮🇳", country: "India" },
  AXB: { name: "Air India Express", logo: "🇮🇳", country: "India" },
  SWR: { name: "SWISS International Air Lines", logo: "🇨🇭", country: "Switzerland" },
  DLH: { name: "Lufthansa", logo: "🇩🇪", country: "Germany" },
  BAW: { name: "British Airways", logo: "🇬🇧", country: "United Kingdom" },
  QTR: { name: "Qatar Airways", logo: "🇶🇦", country: "Qatar" },
  SIA: { name: "Singapore Airlines", logo: "🇸🇬", country: "Singapore" },
  QFA: { name: "Qantas", logo: "🇦🇺", country: "Australia" },
  AFR: { name: "Air France", logo: "🇫🇷", country: "France" },
  DAL: { name: "Delta Air Lines", logo: "🇺🇸", country: "United States" },
  UAL: { name: "United Airlines", logo: "🇺🇸", country: "United States" },
  AAL: { name: "American Airlines", logo: "🇺🇸", country: "United States" },
  JAL: { name: "Japan Airlines", logo: "🇯🇵", country: "Japan" },
  ANA: { name: "All Nippon Airways (ANA)", logo: "🇯🇵", country: "Japan" },
  THY: { name: "Turkish Airlines", logo: "🇹🇷", country: "Turkey" },
  CPA: { name: "Cathay Pacific", logo: "🇭🇰", country: "Hong Kong" },
  VIR: { name: "Virgin Atlantic", logo: "🇬🇧", country: "United Kingdom" },
};

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
    icao24, rawCallsign, originCountry, , ,
    longitude, latitude, baroAltitude, onGround,
    velocity, trueTrack,
  ] = sv;

  if (latitude == null || longitude == null) return null;

  const callsignStr = (rawCallsign || "").trim() || icao24 || "N/A";
  const icaoPrefix = callsignStr.slice(0, 3).toUpperCase();
  const airlineMeta = REAL_AIRLINE_ICAO_MAP[icaoPrefix];

  return {
    icao24: icao24 || "??????",
    callsign: callsignStr,
    originCountry: airlineMeta ? airlineMeta.name : (originCountry || "Unknown"),
    lat: parseFloat(latitude),
    lng: parseFloat(longitude),
    altitude: baroAltitude != null ? Math.round(parseFloat(baroAltitude) * 3.28084) : null,
    velocity: velocity != null ? Math.round(parseFloat(velocity) * 1.94384) : null,
    trueTrack: parseFloat(trueTrack) || 0,
    onGround: Boolean(onGround),
  };
}

function generateFallbackTraffic(count = 15) {
  const airlines = Object.keys(REAL_AIRLINE_ICAO_MAP);

  return Array.from({ length: count }, (_, i) => {
    const code = airlines[i % airlines.length];
    const brand = REAL_AIRLINE_ICAO_MAP[code];

    return {
      icao24: `A8${i.toString(16).padStart(4, "0").toUpperCase()}`,
      callsign: `${code}${101 + Math.floor(Math.random() * 899)}`,
      originCountry: brand.name,
      lat: (Math.random() - 0.5) * 140,
      lng: (Math.random() - 0.5) * 340,
      altitude: 28000 + Math.floor(Math.random() * 12000),
      velocity: 430 + Math.floor(Math.random() * 80),
      trueTrack: Math.floor(Math.random() * 360),
      onGround: false,
      _synthetic: true,
    };
  });
}

export async function handler(_event, _context) {
  const now = Date.now();

  const headers = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
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

  if (inFlightPromise) {
    const res = await inFlightPromise;
    return { statusCode: 200, headers, body: JSON.stringify(res) };
  }

  inFlightPromise = (async () => {
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 3500);

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
        cacheTimestamp = Date.now();
        return { planes, source: "opensky", ts: cacheTimestamp };
      }

      throw new Error("Empty states response");
    } catch (err) {
      if (cachedPlanes.length === 0) {
        cachedPlanes = generateFallbackTraffic(15);
        cacheTimestamp = Date.now();
      }

      return { planes: cachedPlanes, source: "fallback", ts: cacheTimestamp };
    } finally {
      inFlightPromise = null;
    }
  })();

  const result = await inFlightPromise;
  return {
    statusCode: 200,
    headers,
    body: JSON.stringify(result),
  };
}
