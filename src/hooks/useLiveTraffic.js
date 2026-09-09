import { useEffect, useRef, useState, useCallback } from "react";
import { fetchTrafficDataAPI } from "../services/api/apiClient";

// ── Constants ────────────────────────────────────────────────────────────────
const POLL_INTERVAL_MS  = 15_000;  // 15 s — respects OpenSky rate limits
const STATE_PUSH_MS     = 100;     // Push React state every 100ms for solid 60 FPS
const SOOTHING_SPEED_FACTOR = 0.02; // Ultra-calm, soothing flight speed multiplier

const SYNTHETIC_AIRLINES = [
  { code: "UAE", name: "Emirates" },
  { code: "BAW", name: "British Airways" },
  { code: "SIA", name: "Singapore Airlines" },
  { code: "AIC", name: "Air India" },
  { code: "DLH", name: "Lufthansa" },
  { code: "AFR", name: "Air France" },
  { code: "DAL", name: "Delta Air Lines" },
  { code: "UAL", name: "United Airlines" },
  { code: "JAL", name: "Japan Airlines" },
  { code: "QTR", name: "Qatar Airways" },
  { code: "SWR", name: "SWISS" },
  { code: "QFA", name: "Qantas" },
];

function generateClientFallbackTraffic(count = 35) {
  return Array.from({ length: count }, (_, i) => {
    const al = SYNTHETIC_AIRLINES[i % SYNTHETIC_AIRLINES.length];
    return {
      icao24: `SYN${i.toString(16).padStart(4, "0").toUpperCase()}`,
      callsign: `${al.code}${100 + Math.floor(Math.random() * 899)}`,
      originCountry: al.name,
      lat: (Math.sin(i * 1.3) * 60) + (Math.random() * 4 - 2),
      lng: (Math.cos(i * 1.7) * 160) + (Math.random() * 4 - 2),
      altitude: 28000 + Math.floor(Math.random() * 12000),
      velocity: 430 + Math.floor(Math.random() * 80),
      trueTrack: Math.floor(Math.random() * 360),
      onGround: false,
      _synthetic: true,
    };
  });
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
