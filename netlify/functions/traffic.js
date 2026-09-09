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

const AIRWAY_CORRIDORS = [
  // ── India & South Asia (IndiGo, SpiceJet, Air India, Vistara, Akasa) ──
  { from: { lat: 28.5562, lng: 77.1000 }, to: { lat: 19.0896, lng: 72.8656 }, code: "IGO", airline: "IndiGo", num: 204 },
  { from: { lat: 19.0896, lng: 72.8656 }, to: { lat: 28.5562, lng: 77.1000 }, code: "SEJ", airline: "SpiceJet", num: 8114 },
  { from: { lat: 28.5562, lng: 77.1000 }, to: { lat: 13.1986, lng: 77.7066 }, code: "IGO", airline: "IndiGo", num: 501 },
  { from: { lat: 13.1986, lng: 77.7066 }, to: { lat: 28.5562, lng: 77.1000 }, code: "SEJ", airline: "SpiceJet", num: 198 },
  { from: { lat: 19.0896, lng: 72.8656 }, to: { lat: 15.3808, lng: 73.8314 }, code: "IGO", airline: "IndiGo", num: 342 },
  { from: { lat: 28.5562, lng: 77.1000 }, to: { lat: 22.6547, lng: 88.4467 }, code: "AIC", airline: "Air India", num: 401 },
  { from: { lat: 13.1986, lng: 77.7066 }, to: { lat: 17.2403, lng: 78.4294 }, code: "SEJ", airline: "SpiceJet", num: 624 },
  { from: { lat: 28.5562, lng: 77.1000 }, to: { lat: 13.0827, lng: 80.2707 }, code: "VTI", airline: "Vistara", num: 945 },
  { from: { lat: 19.0896, lng: 72.8656 }, to: { lat: 28.5562, lng: 77.1000 }, code: "AKJ", airline: "Akasa Air", num: 1352 },
  { from: { lat: 10.1518, lng: 76.4019 }, to: { lat: 25.2532, lng: 55.3657 }, code: "AXB", airline: "Air India Express", num: 435 },
  { from: { lat: 28.5562, lng: 77.1000 }, to: { lat: 25.2532, lng: 55.3657 }, code: "IGO", airline: "IndiGo", num: 147 },
  { from: { lat: 19.0896, lng: 72.8656 }, to: { lat: 25.2731, lng: 51.6081 }, code: "QTR", airline: "Qatar Airways", num: 557 },
  { from: { lat: 28.5562, lng: 77.1000 }, to: { lat: 51.4700, lng: -0.4543 }, code: "AIC", airline: "Air India", num: 161 },
  { from: { lat: 19.0896, lng: 72.8656 }, to: { lat: 51.4700, lng: -0.4543 }, code: "BAW", airline: "British Airways", num: 138 },
  { from: { lat: 28.5562, lng: 77.1000 }, to: { lat: 1.3644, lng: 103.9915 }, code: "SIA", airline: "Singapore Airlines", num: 403 },

  // ── Middle East Super-Hubs (Emirates, Etihad, Qatar) ──
  { from: { lat: 25.2532, lng: 55.3657 }, to: { lat: 51.4700, lng: -0.4543 }, code: "UAE", airline: "Emirates", num: 1 },
  { from: { lat: 25.2532, lng: 55.3657 }, to: { lat: 40.6413, lng: -73.7781 }, code: "UAE", airline: "Emirates", num: 201 },
  { from: { lat: 25.2731, lng: 51.6081 }, to: { lat: 51.4700, lng: -0.4543 }, code: "QTR", airline: "Qatar Airways", num: 7 },
  { from: { lat: 24.4330, lng: 54.6511 }, to: { lat: 40.6413, lng: -73.7781 }, code: "ETD", airline: "Etihad Airways", num: 101 },
  { from: { lat: 25.2532, lng: 55.3657 }, to: { lat: 35.5494, lng: 139.7798 }, code: "UAE", airline: "Emirates", num: 318 },

  // ── Transatlantic & European Air Arteries ──
  { from: { lat: 40.6413, lng: -73.7781 }, to: { lat: 51.4700, lng: -0.4543 }, code: "BAW", airline: "British Airways", num: 114 },
  { from: { lat: 51.4700, lng: -0.4543 }, to: { lat: 40.6413, lng: -73.7781 }, code: "VIR", airline: "Virgin Atlantic", num: 3 },
  { from: { lat: 42.3656, lng: -71.0096 }, to: { lat: 49.0097, lng: 2.5479 }, code: "AFR", airline: "Air France", num: 333 },
  { from: { lat: 41.9742, lng: -87.9073 }, to: { lat: 50.0379, lng: 8.5622 }, code: "DLH", airline: "Lufthansa", num: 431 },
  { from: { lat: 40.6895, lng: -74.1745 }, to: { lat: 47.4582, lng: 8.5555 }, code: "SWR", airline: "SWISS", num: 19 },
  { from: { lat: 51.4700, lng: -0.4543 }, to: { lat: 49.0097, lng: 2.5479 }, code: "BAW", airline: "British Airways", num: 304 },
  { from: { lat: 50.0379, lng: 8.5622 }, to: { lat: 41.8003, lng: 12.2389 }, code: "DLH", airline: "Lufthansa", num: 232 },
  { from: { lat: 41.0082, lng: 28.9784 }, to: { lat: 51.4700, lng: -0.4543 }, code: "THY", airline: "Turkish Airlines", num: 1983 },

  // ── North American Transcontinental ──
  { from: { lat: 40.6413, lng: -73.7781 }, to: { lat: 33.9416, lng: -118.4085 }, code: "DAL", airline: "Delta Air Lines", num: 442 },
  { from: { lat: 37.6213, lng: -122.3790 }, to: { lat: 40.6413, lng: -73.7781 }, code: "UAL", airline: "United Airlines", num: 1204 },
  { from: { lat: 41.9742, lng: -87.9073 }, to: { lat: 25.7959, lng: -80.2870 }, code: "AAL", airline: "American Airlines", num: 1082 },
  { from: { lat: 32.8998, lng: -97.0403 }, to: { lat: 47.4502, lng: -122.3088 }, code: "AAL", airline: "American Airlines", num: 1740 },

  // ── Asia-Pacific & Transpacific ──
  { from: { lat: 1.3644, lng: 103.9915 }, to: { lat: 35.5494, lng: 139.7798 }, code: "SIA", airline: "Singapore Airlines", num: 638 },
  { from: { lat: 22.3080, lng: 113.9185 }, to: { lat: 35.7720, lng: 140.3929 }, code: "CPA", airline: "Cathay Pacific", num: 504 },
  { from: { lat: -33.9399, lng: 151.1753 }, to: { lat: 1.3644, lng: 103.9915 }, code: "QFA", airline: "Qantas", num: 81 },
  { from: { lat: 33.9416, lng: -118.4085 }, to: { lat: 35.5494, lng: 139.7798 }, code: "JAL", airline: "Japan Airlines", num: 61 },
  { from: { lat: 35.5494, lng: 139.7798 }, to: { lat: 37.6213, lng: -122.3790 }, code: "ANA", airline: "All Nippon Airways (ANA)", num: 8 },
  { from: { lat: 37.6213, lng: -122.3790 }, to: { lat: -33.9399, lng: 151.1753 }, code: "UAL", airline: "United Airlines", num: 863 },
];

function calculateGreatCircleHeading(lat1, lon1, lat2, lon2) {
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const y = Math.sin(dLon) * Math.cos((lat2 * Math.PI) / 180);
  const x = Math.cos((lat1 * Math.PI) / 180) * Math.sin((lat2 * Math.PI) / 180) -
            Math.sin((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.cos(dLon);
  return (Math.round((Math.atan2(y, x) * 180) / Math.PI) + 360) % 360;
}

function generateFallbackTraffic(count = 200) {
  const planes = [];
  const targetCount = Math.max(count, 200);

  for (let i = 0; i < targetCount; i++) {
    const corridor = AIRWAY_CORRIDORS[i % AIRWAY_CORRIDORS.length];
    const subIdx = Math.floor(i / AIRWAY_CORRIDORS.length);
    const reverse = subIdx % 2 === 1;

    const from = reverse ? corridor.to : corridor.from;
    const to = reverse ? corridor.from : corridor.to;

    const progress = 0.08 + ((subIdx * 0.19 + (i % 7) * 0.03) % 0.84);
    const lat = from.lat + (to.lat - from.lat) * progress;
    const lng = from.lng + (to.lng - from.lng) * progress;

    const heading = calculateGreatCircleHeading(from.lat, from.lng, to.lat, to.lng);
    const flightNum = corridor.num + (subIdx * 10);

    planes.push({
      icao24: `A8${(1000 + i).toString(16).toUpperCase()}`,
      callsign: `${corridor.code}${flightNum}`,
      originCountry: corridor.airline,
      lat: Math.round(lat * 10000) / 10000,
      lng: Math.round(lng * 10000) / 10000,
      altitude: 28000 + (i % 12) * 1000,
      velocity: 440 + (i % 9) * 10,
      trueTrack: heading,
      onGround: false,
      _synthetic: true,
    });
  }

  return planes;
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
        cachedPlanes = generateFallbackTraffic(200);
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
