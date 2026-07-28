import { useEffect, useRef, useState, useCallback } from "react";

// ── Constants ────────────────────────────────────────────────────────────────
const POLL_INTERVAL_MS  = 15_000;  // 15 s — respects OpenSky rate limits
const STATE_PUSH_MS     = 100;     // Push React state every 100ms for solid 60 FPS
const SOOTHING_SPEED_FACTOR = 0.02; // Ultra-calm, soothing flight speed multiplier

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

  // ── API Poll ─────────────────────────────────────────────────────────────────
  const fetchTraffic = useCallback(async () => {
    try {
      const res = await fetch("/api/traffic", { cache: "no-store" });
      if (!res.ok) return;
      const data = await res.json();
      const incoming = data.planes || [];

      setStats((s) => ({
        ...s,
        count: incoming.length,
        source: data.source || "opensky",
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
    } catch (err) {
      console.warn("[useLiveTraffic] fetch error:", err);
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
