import React, { useRef, useEffect, useState, useMemo } from "react";
import Globe from "react-globe.gl";
import { AIRPORTS } from "../../data/airports";
import { generateJetstreamPaths, calculateWindEffect } from "../../utils/windVectorMath";
import { predictRouteAnomalies } from "../../services/anomalyPredictor";
import { interpolateGreatCircle } from "../../utils/slerpMath";
import { useStore } from "../../store/useStore";

const THEME_CONFIG = {
  space:     { atmosphere: "#1e3a8a", bg: "#050a18", arcColor: "#60a5fa" },
  holodeck:  { atmosphere: "#00f0ff", bg: "#020813", arcColor: "#00f0ff" },
  synthwave: { atmosphere: "#ff007f", bg: "#120224", arcColor: "#ff2a85" },
  atmosphera:{ atmosphere: "#38bdf8", bg: "#0b192c", arcColor: "#a5f3fc" },
  cyberpunk: { atmosphere: "#4c1d95", bg: "#0d0019", arcColor: "#c084fc" },
  sunset:    { atmosphere: "#7c2d12", bg: "#1a0a00", arcColor: "#fb923c" },
  slate:     { atmosphere: "#1e293b", bg: "#1e2530", arcColor: "#94a3b8" },
};

const DAY_TEXTURE   = "//unpkg.com/three-globe/example/img/earth-blue-marble.jpg";
const NIGHT_TEXTURE = "//unpkg.com/three-globe/example/img/earth-night.jpg";
const BUMP_TEXTURE  = "//unpkg.com/three-globe/example/img/earth-topology.png";
const DARK_TEXTURE  = "//unpkg.com/three-globe/example/img/earth-dark.jpg";

// Dynamically sample ~120 real airports to act as interactive background dots
const INTERACTIVE_BG_AIRPORTS = AIRPORTS.filter((a, i) => i % 2 === 0).slice(0, 120);

function hexToRgba(hex6, alpha) {
  const r = parseInt(hex6.slice(1, 3), 16);
  const g = parseInt(hex6.slice(3, 5), 16);
  const b = parseInt(hex6.slice(5, 7), 16);
  return `rgba(${r},${g},${b},${alpha})`;
}

function isDayAt(timezone) {
  try {
    const h = parseInt(
      new Date().toLocaleString("en-US", { timeZone: timezone, hour: "numeric", hour12: false }),
      10
    );
    return h >= 6 && h < 20;
  } catch { return true; }
}

function buildArcs(waypoints, arcColorTint, hoveredFlightPath) {
  const arcs = [];
  
  // Base Route Arcs
  if (waypoints && waypoints.length >= 2) {
    const colorStr = hexToRgba(arcColorTint, 0.85);
    for (let i = 0; i < waypoints.length - 1; i++) {
      const a = waypoints[i];
      const b = waypoints[i + 1];
      if (!a || !b) continue;
      arcs.push({
        startLat: a.lat, startLng: a.lng,
        endLat:   b.lat, endLng:   b.lng,
        color: [colorStr, colorStr],
        stroke: 0.5
      });
    }
  }

  // Hovered Booking Flight Path
  if (hoveredFlightPath && hoveredFlightPath.length >= 2) {
    for (let i = 0; i < hoveredFlightPath.length - 1; i++) {
      const a = hoveredFlightPath[i];
      const b = hoveredFlightPath[i + 1];
      if (!a || !b) continue;
      arcs.push({
        startLat: a.lat, startLng: a.lng,
        endLat:   b.lat, endLng:   b.lng,
        color: ["#00f0ff", "#34d399"],
        stroke: 1.5,
        altitude: 0.2
      });
    }
  }

  return arcs;
}

function buildPoints(waypoints, liveFlights = [], simulated4DFlights = [], arcColor) {
  const bgPts = INTERACTIVE_BG_AIRPORTS.map((ap) => ({
    ...ap,
    color: "rgba(255,255,255,0.25)",
    r: 0.35,
    isBgAirport: true,
    label: `<div style="background:rgba(10,15,30,0.85);padding:4px 8px;border-radius:8px;font-size:11px;color:#fff;border:1px solid rgba(255,255,255,0.15)"><b>${ap.iata}</b> - ${ap.city}, ${ap.country}<br/><span style="color:#60a5fa;font-size:9px">Click to add to route</span></div>`
  }));

  const waypointPts = (waypoints || [])
    .map((ap, i) => {
      if (!ap) return null;
      const isFirst = i === 0;
      const isLast  = i === waypoints.length - 1;
      return {
        lat: ap.lat,
        lng: ap.lng,
        color: isFirst ? "#4ade80" : isLast ? "#f87171" : arcColor,
        r: 0.6,
        isWaypoint: true,
        label: `<div style="background:rgba(10,15,30,0.85);padding:4px 8px;border-radius:8px;font-size:11px;color:#fff;border:1px solid rgba(255,255,255,0.2)"><b>${ap.iata}</b> - ${ap.city}, ${ap.country}</div>`
      };
    })
    .filter(Boolean);

  const flightPts = (liveFlights || []).map((flt) => ({
    lat: flt.lat,
    lng: flt.lng,
    color: flt.isSimulated ? "#00f0ff" : "#38bdf8",
    r: 0.45,
    isLiveFlight: true,
    label: `
      <div style="background:rgba(10,15,30,0.9);padding:6px 10px;border-radius:10px;font-size:11px;color:#fff;border:1px solid #00f0ff">
        <div style="color:#00f0ff;font-weight:bold">✈️ ${flt.callsign}</div>
        <div>Alt: ${flt.altitudeFeet.toLocaleString()} ft (${flt.altitudeMeters.toLocaleString()}m)</div>
        <div>Speed: ${flt.velocityKmh} km/h | Route: ${flt.origin} → ${flt.destination}</div>
      </div>
    `
  }));

  const sim4DPts = (simulated4DFlights || []).map((flt) => ({
    lat: flt.lat,
    lng: flt.lng,
    color: "#fbbf24",
    r: 0.55,
    is4DFlight: true,
    label: `
      <div style="background:rgba(20,15,5,0.92);padding:6px 10px;border-radius:10px;font-size:11px;color:#fff;border:1px solid #fbbf24">
        <div style="color:#fbbf24;font-weight:bold">✈️ 4D PREDICTIVE FLIGHT: ${flt.flightNum}</div>
        <div>${flt.airline} (${flt.aircraft})</div>
        <div>Heading: ${flt.heading}° | Progress: ${Math.round(flt.progress * 100)}%</div>
        <div>Route: ${flt.origin.iata || flt.origin} → ${flt.destination.iata || flt.destination}</div>
      </div>
    `
  }));

  return [...bgPts, ...waypointPts, ...flightPts, ...sim4DPts];
}

function buildRings(waypoints, warningRings = []) {
  const rings = [];
  if (waypoints && waypoints.length >= 2) {
    const colors = [hexToRgba("#4ade80", 0.55), hexToRgba("#f87171", 0.55)];
    [waypoints[0], waypoints[waypoints.length - 1]].forEach((ap, i) => {
      if (ap) rings.push({
        lat: ap.lat, lng: ap.lng,
        maxR: 3, propagationSpeed: 2, repeatPeriod: 1200,
        color: () => colors[i],
      });
    });
  }

  (warningRings || []).forEach((wRing) => {
    rings.push({
      lat: wRing.lat,
      lng: wRing.lng,
      maxR: wRing.maxR,
      propagationSpeed: wRing.propagationSpeed,
      repeatPeriod: wRing.repeatPeriod,
      color: () => wRing.color,
    });
  });

  return rings;
}

export default function GlobeCore({
  waypoints = [],
  liveFlights = [],
  simulated4DFlights = [],
  theme = "space",
  activeOverlayLayer = "none",
  showWindVectors = false,
  isCockpitView = false,
  cockpitProgress = 0.5,
  onPointClick,
  hoveredFlightPath = null,
}) {
  const globeRef = useRef(null);
  const cfg = THEME_CONFIG[theme] || THEME_CONFIG.space;

  // ── Spatial Command: FOCUS_LOCATION / DRAW_ROUTE camera pan ─────────────
  const globeFocusTarget  = useStore((s) => s.globeFocusTarget);
  const setGlobeFocusTarget = useStore((s) => s.setGlobeFocusTarget);

  useEffect(() => {
    if (!globeFocusTarget || !globeRef.current) return;
    const { lat, lng, altitude = 1.8 } = globeFocusTarget;
    if (typeof lat !== "number" || typeof lng !== "number") return;
    globeRef.current.pointOfView({ lat, lng, altitude }, 1200);
    // Clear after firing so a repeat dispatch of the same coords still triggers
    const timer = setTimeout(() => setGlobeFocusTarget(null), 1300);
    return () => clearTimeout(timer);
  }, [globeFocusTarget]);

  const containerRef = useRef(null);
  const [dims, setDims] = useState({ w: window.innerWidth, h: window.innerHeight });

  useEffect(() => {
    function update() {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        setDims({ w: rect.width, h: rect.height });
      }
    }
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  const origin      = waypoints[0] || null;
  const destination = waypoints.length >= 2 ? waypoints[waypoints.length - 1] : null;
  const useNight    = destination?.timezone ? !isDayAt(destination.timezone) : false;

  const windEffect = useMemo(() => calculateWindEffect(origin, destination), [origin?.iata, destination?.iata]);
  const { warningRings } = useMemo(() => predictRouteAnomalies(origin, destination), [origin?.iata, destination?.iata]);

  const jetstreamPaths = useMemo(() => (showWindVectors ? generateJetstreamPaths() : []), [showWindVectors]);

  const globeTexture = theme === "holodeck" || theme === "synthwave" ? DARK_TEXTURE : useNight ? NIGHT_TEXTURE : DAY_TEXTURE;

  const arcs   = buildArcs(waypoints, windEffect.arcColorTint || cfg.arcColor, hoveredFlightPath);
  const points = buildPoints(waypoints, liveFlights, simulated4DFlights, cfg.arcColor);
  const rings  = buildRings(waypoints, warningRings);

  const hexPointsData = useMemo(() => {
    if (activeOverlayLayer === "none") return [];

    // Flight density / traffic
    if (activeOverlayLayer === "density") {
      const pts = [];
      AIRPORTS.forEach((ap) => {
        for (let i = 0; i < 6; i++) {
          pts.push({
            lat: ap.lat + (Math.random() - 0.5) * 3,
            lng: ap.lng + (Math.random() - 0.5) * 3,
            weight: 3 + Math.random() * 5,
          });
        }
      });
      return pts;
    }

    // Legacy "weather" alias + new "weather_overlay"
    if (activeOverlayLayer === "weather" || activeOverlayLayer === "weather_overlay") {
      const pts = [];
      for (let i = 0; i < 90; i++) {
        const lat = (Math.random() - 0.5) * 140;
        const lng = (Math.random() - 0.5) * 360;
        pts.push({ lat, lng, weight: 1 + Math.random() * 7 });
      }
      return pts;
    }

    // Price / fare heat-map — clusters around major route hubs
    if (activeOverlayLayer === "price_heat_map") {
      const hubs = AIRPORTS.filter((_, i) => i % 4 === 0).slice(0, 40);
      const pts = [];
      hubs.forEach((ap) => {
        const intensity = Math.floor(2 + Math.random() * 6);
        for (let i = 0; i < intensity; i++) {
          pts.push({
            lat: ap.lat + (Math.random() - 0.5) * 5,
            lng: ap.lng + (Math.random() - 0.5) * 5,
            weight: 4 + Math.random() * 8,
          });
        }
      });
      return pts;
    }

    // Day/Night terminator band — longitudinal gradient
    if (activeOverlayLayer === "day_night_cycle") {
      const pts = [];
      const terminatorLng = -((new Date().getUTCHours() / 24) * 360 - 180);
      for (let lat = -80; lat <= 80; lat += 4) {
        for (let d = -15; d <= 15; d += 3) {
          pts.push({ lat, lng: terminatorLng + d, weight: 5 - Math.abs(d) * 0.3 });
        }
      }
      return pts;
    }

    // Aircraft AR pins — reuse live flight pattern with dense sampling
    if (activeOverlayLayer === "aircraft_ar") {
      const pts = [];
      for (let i = 0; i < 60; i++) {
        pts.push({
          lat: (Math.random() - 0.5) * 120,
          lng: (Math.random() - 0.5) * 360,
          weight: 3 + Math.random() * 4,
        });
      }
      return pts;
    }

    return [];
  }, [activeOverlayLayer]);

  const waypointKey = waypoints.map((w) => w?.iata ?? "").join(",");
  useEffect(() => {
    if (!globeRef.current) return;
    const ctrl = globeRef.current.controls?.();
    if (!ctrl) return;

    if (isCockpitView && origin && destination) {
      const cockpitPos = interpolateGreatCircle(origin.lat, origin.lng, destination.lat, destination.lng, cockpitProgress);
      ctrl.autoRotate = false;
      globeRef.current.pointOfView({ lat: cockpitPos.lat, lng: cockpitPos.lng, altitude: 0.12 }, 400);
      return;
    }

    const hasRoute = waypoints.filter(Boolean).length >= 2;
    ctrl.autoRotate      = !hasRoute;
    ctrl.autoRotateSpeed = theme === "atmosphera" ? 0.25 : 0.45;
    ctrl.enableZoom      = true;
    ctrl.minDistance     = 120;
    ctrl.maxDistance     = 700;

    if (hasRoute) {
      const vw = waypoints.filter(Boolean);
      const midLat = vw.reduce((s, a) => s + a.lat, 0) / vw.length;
      const midLng = vw.reduce((s, a) => s + a.lng, 0) / vw.length;
      const spread = Math.max(
        ...vw.map((a) => Math.abs(a.lat - midLat)),
        ...vw.map((a) => Math.abs(a.lng - midLng))
      );
      const alt = Math.min(3.5, Math.max(1.6, spread / 40));
      globeRef.current.pointOfView({ lat: midLat, lng: midLng, altitude: alt }, 1400);
    } else {
      globeRef.current.pointOfView({ lat: 20, lng: 0, altitude: 2.6 }, 1000);
    }
  }, [waypointKey, theme, isCockpitView, cockpitProgress, origin?.iata, destination?.iata]);

  return (
    <div
      ref={containerRef}
      className={`globe-container ${theme === "holodeck" ? "crt-overlay" : ""}`}
      style={{ background: `radial-gradient(ellipse at 50% 58%, ${cfg.bg}dd 0%, ${cfg.bg} 72%)` }}
    >
      <Globe
        ref={globeRef}
        width={dims.w}
        height={dims.h}
        backgroundColor="rgba(0,0,0,0)"
        globeImageUrl={globeTexture}
        bumpImageUrl={BUMP_TEXTURE}
        atmosphereColor={cfg.atmosphere}
        atmosphereAltitude={theme === "synthwave" ? 0.35 : 0.2}
        arcsData={arcs}
        arcColor="color"
        arcDashLength={0.55}
        arcDashGap={0.22}
        arcDashAnimateTime={1800}
        arcStroke={theme === "holodeck" ? 0.85 : 0.65}
        arcAltitude={0.28}
        arcAltitudeAutoScale={0.35}
        pointsData={points}
        pointLat="lat"
        pointLng="lng"
        pointColor={(d) => (d.is4DFlight ? d.color : d.isLiveFlight ? d.color : d.isWaypoint ? d.color : hexToRgba("#ffffff", 0.22))}
        pointAltitude={(d) => (d.is4DFlight ? 0.07 : d.isLiveFlight ? 0.05 : 0.005)}
        pointRadius={(d) => (d.is4DFlight ? 0.55 : d.isLiveFlight ? 0.45 : d.r || 0.16)}
        pointLabel="label"
        pointsMerge={false}
        onPointClick={(point) => {
          if (point.isBgAirport || point.isWaypoint) {
             if (onPointClick) onPointClick(point);
          }
        }}
        ringsData={rings}
        ringLat="lat"
        ringLng="lng"
        ringMaxRadius="maxR"
        ringPropagationSpeed="propagationSpeed"
        ringRepeatPeriod="repeatPeriod"
        ringColor="color"
        ringResolution={64}
        pathsData={showWindVectors && jetstreamPaths.length > 0 ? jetstreamPaths : []}
        pathPoints={(d) => (d && Array.isArray(d?.coords) ? d.coords : [])}
        pathCoordinates={(d) => (d && Array.isArray(d?.coords) ? d.coords : [])}
        pathPointLat={(p) => (Array.isArray(p) ? p[0] : typeof p?.lat === "number" ? p.lat : 0)}
        pathPointLng={(p) => (Array.isArray(p) ? p[1] : typeof p?.lng === "number" ? p.lng : 0)}
        pathPointAlt={(p) => (Array.isArray(p) ? p[2] : typeof p?.alt === "number" ? p.alt : 0.1)}
        pathColor={(d) => d?.color || "rgba(56, 189, 248, 0.4)"}
        pathStroke={(d) => d?.stroke || 1}
        pathDashLength={0.4}
        pathDashGap={0.1}
        pathDashAnimateTime={2500}
        hexBinPointsData={hexPointsData}
        hexBinPointLat="lat"
        hexBinPointLng="lng"
        hexBinPointWeight="weight"
        hexBinResolution={3}
        hexTopColor={() => (activeOverlayLayer === "weather" ? "#38bdf8" : "#fb923c")}
        hexSideColor={() => (activeOverlayLayer === "weather" ? "rgba(56, 189, 248, 0.4)" : "rgba(251, 146, 60, 0.4)")}
        hexAltitude={(d) => Math.min(0.35, d.sumWeight * 0.035)}
      />

      {destination && !isCockpitView && (
        <div
          className="absolute bottom-24 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1.5 z-10"
          style={{ background: "rgba(10, 14, 24, 0.72)", border: "1px solid rgba(255, 255, 255, 0.08)", color: "#94A3B8" }}
        >
          <span>{useNight ? "🌙" : "☀️"}</span>
          <span>{useNight ? "Night" : "Daytime"} at {destination.city}</span>
          {windEffect.label && (
            <span className="ml-1 pl-1 border-l border-white/20 font-bold" style={{ color: windEffect.arcColorTint }}>
              ({windEffect.label})
            </span>
          )}
        </div>
      )}

      <div
        className="absolute inset-0 pointer-events-none"
        style={{ background: `radial-gradient(ellipse at center, transparent 38%, ${cfg.bg}a0 100%)` }}
      />
    </div>
  );
}
