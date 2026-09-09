import { useEffect, useRef, useState, useCallback } from "react";
import { fetchTrafficDataAPI } from "../services/api/apiClient";

// ── Constants ────────────────────────────────────────────────────────────────
const POLL_INTERVAL_MS  = 15_000;  // 15 s — respects OpenSky rate limits
const STATE_PUSH_MS     = 100;     // Push React state every 100ms for solid 60 FPS
const SOOTHING_SPEED_FACTOR = 0.02; // Ultra-calm, soothing flight speed multiplier

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

function generateClientFallbackTraffic(count = 200) {
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
      icao24: `SYN${(1000 + i).toString(16).toUpperCase()}`,
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

/**
 * Shortest-path angle interpolation for headings (0–360°).
 */
function lerpAngle(a, b, t) {
  const diff = ((b - a + 540) % 360) - 180;
  return (a + diff * t + 360) % 360;
}

/**
 * Continuous Soothing Dead-Reckoning Live Flight Hook.
 * Planes move forward continuously with a calm, soothing speed across the globe.
 */
export function useLiveTraffic() {
  const [planes, setPlanes]             = useState([]);
  const [selectedPlane, setSelectedPlane] = useState(null);
  const [stats, setStats]               = useState({ count: 0, source: "—", lastUpdate: null, fps: 0 });

  const targetMapRef   = useRef(new Map());
  const currentMapRef  = useRef(new Map());
  const rafRef         = useRef(null);
  const lastTimeRef    = useRef(performance.now());
  const lastPushRef    = useRef(0);
  const lastFpsRef     = useRef(performance.now());
  const frameCountRef  = useRef(0);
  const fpsRef         = useRef(60);

  // ── API Poll with Resilient Standalone Fallback ────────────────────────────────
  const fetchTraffic = useCallback(async () => {
    let incoming = [];
    let source = "opensky";

    try {
      const data = await fetchTrafficDataAPI();
      if (data && Array.isArray(data.planes)) {
        incoming = data.planes;
        source = data.source || "opensky";
      }
    } catch {
      // offline / static deployment fallback
    }

    if (!incoming || incoming.length === 0) {
      incoming = generateClientFallbackTraffic(35);
      source = "telemetry-sim";
    }

    setStats((s) => ({
      ...s,
      count: incoming.length,
      source,
      lastUpdate: new Date(),
    }));

    const targetMap  = targetMapRef.current;
    const currentMap = currentMapRef.current;

    incoming.forEach((p) => {
      targetMap.set(p.icao24, p);
      if (!currentMap.has(p.icao24)) {
        currentMap.set(p.icao24, { ...p });
      }
    });

    const incoming24 = new Set(incoming.map((p) => p.icao24));
    for (const key of targetMap.keys()) {
      if (!incoming24.has(key)) {
        targetMap.delete(key);
        currentMap.delete(key);
      }
    }
  }, []);

  // ── Gentle, Soothing Flight RAF Loop ───────────────────────────────────────
  const rafLoop = useCallback(() => {
    const now = performance.now();
    const dt  = Math.min((now - lastTimeRef.current) / 1000, 0.2); // delta time in seconds
    lastTimeRef.current = now;

    const targetMap  = targetMapRef.current;
    const currentMap = currentMapRef.current;

    for (const [icao24, target] of targetMap.entries()) {
      const cur = currentMap.get(icao24) || target;

      // Soothing speed multiplier for a relaxed, calm visual gliding pace
      const knots = cur.velocity || target.velocity || 450;
      const speedDegPerSec = knots * 0.000514 * SOOTHING_SPEED_FACTOR;
      const distanceDeg = speedDegPerSec * dt;

      // Ultra-smooth heading transition
      const heading = lerpAngle(cur.trueTrack || 0, target.trueTrack || 0, 0.025);
      const headingRad = (heading * Math.PI) / 180;

      // Calculate continuous forward movement along heading vector
      const latCos = Math.max(0.1, Math.cos((cur.lat * Math.PI) / 180));
      let newLat = cur.lat + Math.cos(headingRad) * distanceDeg;
      let newLng = cur.lng + (Math.sin(headingRad) * distanceDeg) / latCos;

      // Gentle 1% position convergence towards API target state
      if (target.lat != null && target.lng != null) {
        newLat += (target.lat - newLat) * 0.01;
        newLng += (target.lng - newLng) * 0.01;
      }

      // Wrap coordinates around world boundaries
      if (newLng > 180) newLng -= 360;
      if (newLng < -180) newLng += 360;
      if (newLat > 85) newLat = 85;
      if (newLat < -85) newLat = -85;

      currentMap.set(icao24, {
        ...target,
        lat: newLat,
        lng: newLng,
        trueTrack: heading,
      });
    }

    // Throttled React state push for optimal 60 FPS performance
    if (now - lastPushRef.current >= STATE_PUSH_MS) {
      lastPushRef.current = now;
      setPlanes([...currentMap.values()]);
    }

    // FPS counter
    frameCountRef.current++;
    if (now - lastFpsRef.current >= 1000) {
      fpsRef.current = frameCountRef.current;
      frameCountRef.current = 0;
      lastFpsRef.current = now;
      setStats((s) => ({ ...s, fps: fpsRef.current }));
    }

    rafRef.current = requestAnimationFrame(rafLoop);
  }, []);

  // ── Mount / Unmount ───────────────────────────────────────────────────────────
  useEffect(() => {
    lastTimeRef.current = performance.now();
    fetchTraffic();
    const interval = setInterval(fetchTraffic, POLL_INTERVAL_MS);
    rafRef.current = requestAnimationFrame(rafLoop);
    return () => {
      clearInterval(interval);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [fetchTraffic, rafLoop]);

  return { planes, selectedPlane, setSelectedPlane, stats };
}
