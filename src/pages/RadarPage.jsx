import React, { useState, useEffect, useRef, useMemo, useCallback } from "react";
import Globe from "react-globe.gl";
import { useLiveTraffic } from "../hooks/useLiveTraffic";
import FlightTooltip from "../components/radar/FlightTooltip";
import RadarStats from "../components/radar/RadarStats";
import { Layers, Filter, ZoomIn, ZoomOut, Shuffle, Crosshair, Radio } from "lucide-react";
import { useStore } from "../store/useStore";
import ErrorBoundary from "../components/ui/ErrorBoundary";

// ── Theme configs ────────────────────────────────────────────────────────────
const THEME_CONFIG = {
  space:     { atmosphere: "#1e3a8a", bg: "#050a18" },
  holodeck:  { atmosphere: "#00f0ff", bg: "#020813" },
  synthwave: { atmosphere: "#ff007f", bg: "#120224" },
  atmosphera:{ atmosphere: "#38bdf8", bg: "#0b192c" },
  cyberpunk: { atmosphere: "#4c1d95", bg: "#0d0019" },
  sunset:    { atmosphere: "#7c2d12", bg: "#1a0a00" },
  daylight:  { atmosphere: "#38bdf8", bg: "#0b192c" },
  slate:     { atmosphere: "#1e293b", bg: "#1e2530" },
};

const EARTH_TEXTURE = "https://unpkg.com/three-globe/example/img/earth-night.jpg";
const EARTH_BUMP    = "https://unpkg.com/three-globe/example/img/earth-topology.png";

const LOD_CONFIG = {
  LOW:    { max: 10,  label: "LITE",   color: "#00FFA3", desc: "10 planes — 60 FPS guaranteed" },
  MEDIUM: { max: 50,  label: "MEDIUM", color: "#FBBF24", desc: "50 planes — high-performance mode" },
  MATRIX: { max: 200, label: "MATRIX", color: "#FF3B69", desc: "200 planes — global fleet view" },
};
const TEN_MINUTES_MS = 10 * 60 * 1000;

/** Fisher-Yates array shuffle */
function shuffleArray(arr) {
  const array = [...arr];
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

export default function RadarPage() {
  const theme = useStore((s) => s.theme);
  const themeConf = THEME_CONFIG[theme] || THEME_CONFIG.space;
  const trafficDensity = useStore((s) => s.trafficDensity || "LOW");
  const setTrafficDensity = useStore((s) => s.setTrafficDensity);
  const lod = LOD_CONFIG[trafficDensity] || LOD_CONFIG.LOW;

  const { planes, selectedPlane, setSelectedPlane, stats } = useLiveTraffic();

  const globeRef     = useRef(null);
  const containerRef = useRef(null);
  const [dims, setDims]             = useState({ w: window.innerWidth, h: window.innerHeight - 88 });
  const [filterOnGround, setFilterOnGround] = useState(true);
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });
  const [hoverPlane, setHoverPlane] = useState(null);
  const [hoverPos, setHoverPos]     = useState({ x: 0, y: 0 });

  // Shuffle seed state for picking 10 random flights
  const [shuffleSeed, setShuffleSeed] = useState(0);
  const [showScope, setShowScope]     = useState(false);

  // Responsive resize
  useEffect(() => {
    const onResize = () => setDims({ w: window.innerWidth, h: window.innerHeight - 88 });
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  // Initial globe camera viewpoint
  useEffect(() => {
    if (globeRef.current) {
      globeRef.current.pointOfView({ lat: 20, lng: 10, altitude: 2.2 }, 800);
    }
  }, []);

  // Auto-shuffle 10 random global planes every 10 minutes
  useEffect(() => {
    const interval = setInterval(() => {
      setShuffleSeed((s) => s + 1);
    }, TEN_MINUTES_MS);
    return () => clearInterval(interval);
  }, []);

  // Filter 10 random planes from anywhere globally
  const displayPlanes = useMemo(() => {
    const airborne = filterOnGround ? planes.filter((p) => !p.onGround) : planes;
    if (airborne.length === 0) return [];
    
    return shuffleArray(airborne).slice(0, lod.max);
  }, [planes, filterOnGround, shuffleSeed, lod.max]);

  // Point style getters
  const getPointColor = useCallback((d) => {
    if (selectedPlane?.icao24 === d.icao24) return "rgba(0,240,255,1)";
    if (d._synthetic) return "rgba(251,146,60,0.85)";
    return "rgba(255,255,255,0.9)";
  }, [selectedPlane?.icao24]);

  const getPointRadius = useCallback((d) => {
    return selectedPlane?.icao24 === d.icao24 ? 0.45 : 0.25;
  }, [selectedPlane?.icao24]);

  // Globe interaction
  const handlePointClick = useCallback((point, _ev, coords) => {
    setSelectedPlane(point);
    setTooltipPos({
      x: coords?.x ?? window.innerWidth / 2,
      y: coords?.y ?? window.innerHeight / 2,
    });
  }, [setSelectedPlane]);

  const handlePointHover = useCallback((point, _prev, coords) => {
    setHoverPlane(point || null);
    if (point && coords) setHoverPos({ x: coords.x, y: coords.y });
    document.body.style.cursor = point ? "pointer" : "grab";
  }, []);

  const zoomIn = () => {
    if (!globeRef.current) return;
    const { lat, lng, altitude } = globeRef.current.pointOfView();
    globeRef.current.pointOfView({ lat, lng, altitude: Math.max(0.4, altitude - 0.35) }, 350);
  };
  const zoomOut = () => {
    if (!globeRef.current) return;
    const { lat, lng, altitude } = globeRef.current.pointOfView();
    globeRef.current.pointOfView({ lat, lng, altitude: Math.min(4.5, altitude + 0.35) }, 350);
  };

  function handleManualShuffle() {
    setShuffleSeed((s) => s + 1);
  }

  return (
    <div
      id="radar-page"
      ref={containerRef}
      className="relative overflow-hidden"
      style={{ height: `${dims.h}px`, marginTop: "88px", background: themeConf.bg }}
      onClick={(e) => { if (e.target === containerRef.current) setSelectedPlane(null); }}
    >
      {/* ── Globe Canvas with Small Rotated Airplane Models ─────────────── */}
      <ErrorBoundary fallback={
        <div className="w-full h-full flex flex-col items-center justify-center text-center p-8 bg-slate-950 text-cyan-300 font-mono text-sm">
          <Radio size={28} className="text-cyan-400 animate-pulse mb-3" />
          <div className="font-bold text-white text-base mb-1">Tactical Radar Standby</div>
          <p className="text-xs text-slate-400 max-w-sm">
            Live ADS-B transponder feeds active. The 3D planetary mesh is refreshing.
          </p>
        </div>
      }>
        <Globe
          ref={globeRef}
          width={dims.w}
          height={dims.h}
          backgroundColor={themeConf.bg}
          atmosphereColor={themeConf.atmosphere}
          atmosphereAltitude={0.15}
          globeImageUrl={EARTH_TEXTURE}
          bumpImageUrl={EARTH_BUMP}

          // Plane points
          pointsData={displayPlanes}
          pointLat={(d) => d.lat}
          pointLng={(d) => d.lng}
          pointColor={getPointColor}
          pointRadius={getPointRadius}
          pointAltitude={0.005}
          pointResolution={6}

          // Rotated Small Plane Icons (10 HTML elements = smooth 60 FPS)
          htmlElementsData={displayPlanes}
          htmlLat={(d) => d.lat}
          htmlLng={(d) => d.lng}
          htmlAltitude={0.018}
          htmlElement={(d) => {
            const div = document.createElement("div");
            const rot = Math.round(d.trueTrack || 0);
            const isSelected = selectedPlane?.icao24 === d.icao24;
            div.innerHTML = `
              <div style="position: relative; display: flex; align-items: center; justify-content: center;">
                ${isSelected ? `
                  <div class="sonar-pulse-ring" style="
                    position: absolute;
                    width: 34px;
                    height: 34px;
                    border-radius: 50%;
                    border: 1.5px solid #00f0ff;
                    box-shadow: 0 0 12px rgba(0,240,255,0.8);
                    pointer-events: none;
                  "></div>
                ` : ""}
                <div style="
                  transform: rotate(${rot}deg);
                  font-size: ${isSelected ? "20px" : "15px"};
                  line-height: 1;
                  color: ${isSelected ? "#00f0ff" : "#60a5fa"};
                  filter: drop-shadow(0 0 6px ${isSelected ? "rgba(0,240,255,0.9)" : "rgba(96,165,250,0.8)"});
                  cursor: pointer;
                  user-select: none;
                  transition: transform 0.2s ease;
                ">✈</div>
              </div>
            `;
            div.style.pointerEvents = "auto";
            div.onclick = (ev) => {
              ev.stopPropagation();
              handlePointClick(d, ev, { x: ev.clientX, y: ev.clientY });
            };
            div.onmouseenter = (ev) => {
              handlePointHover(d, ev, { x: ev.clientX, y: ev.clientY });
            };
            div.onmouseleave = () => {
              handlePointHover(null);
            };
            return div;
          }}

          onPointClick={handlePointClick}
          onPointHover={handlePointHover}
        />
      </ErrorBoundary>

      {/* ── Tactical Reticle Scope Overlay ──────────────────────────────── */}
      {showScope && (
        <div className="absolute inset-0 pointer-events-none z-10 flex items-center justify-center overflow-hidden">
          <svg className="w-full h-full max-w-[840px] max-h-[840px] opacity-35" viewBox="0 0 800 800">
            {/* Concentric distance rings */}
            <circle cx="400" cy="400" r="140" fill="none" stroke="#00F2FE" strokeWidth="1" strokeDasharray="4 4" />
            <circle cx="400" cy="400" r="240" fill="none" stroke="#00F2FE" strokeWidth="1" strokeDasharray="6 6" />
            <circle cx="400" cy="400" r="340" fill="none" stroke="#00F2FE" strokeWidth="1.2" />

            {/* Crosshairs */}
            <line x1="60" y1="400" x2="740" y2="400" stroke="#00F2FE" strokeWidth="0.8" strokeDasharray="4 8" />
            <line x1="400" y1="60" x2="400" y2="740" stroke="#00F2FE" strokeWidth="0.8" strokeDasharray="4 8" />

            {/* Cardinal direction labels */}
            <text x="400" y="45" textAnchor="middle" fill="#00F2FE" fontSize="11" fontFamily="monospace" fontWeight="bold">000° N</text>
            <text x="765" y="404" textAnchor="start" fill="#00F2FE" fontSize="11" fontFamily="monospace" fontWeight="bold">090° E</text>
            <text x="400" y="765" textAnchor="middle" fill="#00F2FE" fontSize="11" fontFamily="monospace" fontWeight="bold">180° S</text>
            <text x="35" y="404" textAnchor="end" fill="#00F2FE" fontSize="11" fontFamily="monospace" fontWeight="bold">270° W</text>

            {/* Distance markers */}
            <text x="408" y="265" fill="rgba(0,242,254,0.7)" fontSize="9" fontFamily="monospace">500 NM</text>
            <text x="408" y="165" fill="rgba(0,242,254,0.7)" fontSize="9" fontFamily="monospace">1000 NM</text>
            <text x="408" y="65" fill="rgba(0,242,254,0.7)" fontSize="9" fontFamily="monospace">1500 NM</text>

            {/* 360° Phosphor Radar Sweep Beam */}
            <g className="radar-sweep-beam">
              <line x1="400" y1="400" x2="400" y2="60" stroke="#00F2FE" strokeWidth="1.8" />
              <path
                d="M 400 400 L 400 60 A 340 340 0 0 1 540 89 Z"
                fill="url(#radarSweepGradient)"
                opacity="0.25"
              />
            </g>
            <defs>
              <linearGradient id="radarSweepGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#00F2FE" stopOpacity="0.4" />
                <stop offset="100%" stopColor="#00F2FE" stopOpacity="0" />
              </linearGradient>
            </defs>
          </svg>
        </div>
      )}

      {/* ── Stats HUD ─────────────────────────────────────────────────────── */}
      <RadarStats stats={{ ...stats, count: displayPlanes.length }} />

      {/* ── Top-right Controls ────────────────────────────────────────────── */}
      <div className="absolute top-3 right-3 z-30 flex flex-col items-end gap-1.5 sm:gap-2">

        {/* Traffic Density LOD Selector */}
        <div className="flex items-center gap-1 glass px-2 py-1.5 rounded-xl">
          {Object.entries(LOD_CONFIG).map(([key, cfg]) => (
            <button key={key} type="button"
              onClick={() => setTrafficDensity(key)}
              title={cfg.desc}
              className="mono text-[9px] font-black px-2 py-1 rounded-lg cursor-pointer transition-all"
              style={{
                background: trafficDensity === key ? `${cfg.color}22` : "transparent",
                color: trafficDensity === key ? cfg.color : "#475569",
                border: trafficDensity === key ? `1px solid ${cfg.color}` : "1px solid transparent",
                boxShadow: trafficDensity === key ? `0 0 8px ${cfg.color}44` : "none",
              }}>
              {cfg.label}
            </button>
          ))}
        </div>

        {/* Manual Reshuffle Button */}
        <button
          id="shuffle-planes-btn"
          onClick={handleManualShuffle}
          className="glass px-2.5 py-1.5 sm:px-3 sm:py-2 rounded-xl flex items-center gap-1.5 text-[11px] sm:text-xs font-semibold cursor-pointer hover:border-cyan-400 transition-all text-cyan-300 shadow-md"
          title={`Reshuffle ${lod.max} global flights`}
        >
          <Shuffle size={12} />
          <span className="hidden sm:inline">Shuffle {lod.max} Flights</span>
          <span className="sm:hidden">Shuffle</span>
        </button>

        {/* Airborne Filter Button */}
        <button
          id="radar-ground-filter-btn"
          onClick={() => setFilterOnGround((v) => !v)}
          className="glass px-2.5 py-1.5 sm:px-3 sm:py-2 rounded-xl flex items-center gap-1.5 text-[11px] sm:text-xs font-semibold cursor-pointer hover:opacity-90 transition-all shadow-md"
          style={{
            color: filterOnGround ? "#4ade80" : "#94A3B8",
            borderColor: filterOnGround ? "rgba(74,222,128,0.4)" : "rgba(255, 255, 255, 0.1)",
          }}
        >
          <Filter size={12} />
          <span>{filterOnGround ? "Airborne" : "All"}</span>
        </button>

        {/* Tactical Radar Scope Reticle Toggle */}
        <button
          onClick={() => setShowScope((s) => !s)}
          className={`glass px-2.5 py-1.5 sm:px-3 sm:py-2 rounded-xl flex items-center gap-1.5 text-[11px] sm:text-xs font-semibold cursor-pointer transition-all shadow-md ${
            showScope ? "border-cyan-400 text-cyan-300 shadow-[0_0_14px_rgba(0,242,254,0.35)]" : "text-slate-400 hover:text-white"
          }`}
          title="Toggle Tactical Air-Traffic Reticle Scope Overlay"
        >
          <Crosshair size={12} className={showScope ? "text-cyan-400 animate-spin" : "text-slate-400"} />
          <span>{showScope ? "Scope ON" : "Scope"}</span>
        </button>

        {/* Plane Count Badge */}
        <div className="glass px-2.5 py-1.5 sm:px-3 sm:py-2 rounded-xl flex items-center gap-1.5 text-[10px] sm:text-xs font-mono shadow-md" style={{ color: "#94A3B8" }}>
          <Layers size={12} style={{ color: lod.color }} />
          <span style={{ color: lod.color }}>{displayPlanes.length}</span>
          <span>/ {lod.max} Active</span>
        </div>

        {/* Zoom controls */}
        <div className="flex gap-1">
          <button onClick={zoomIn} className="glass p-1.5 sm:p-2 rounded-xl flex items-center justify-center cursor-pointer hover:opacity-90 shadow-md" style={{ color: "#00F2FE" }} title="Zoom In">
            <ZoomIn size={13} />
          </button>
          <button onClick={zoomOut} className="glass p-1.5 sm:p-2 rounded-xl flex items-center justify-center cursor-pointer hover:opacity-90 shadow-md" style={{ color: "#00F2FE" }} title="Zoom Out">
            <ZoomOut size={13} />
          </button>
        </div>
      </div>

      {/* ── Click Tooltip ─────────────────────────────────────────────────── */}
      {selectedPlane && (
        <>
          <FlightTooltip
            plane={selectedPlane}
            x={tooltipPos.x}
            y={tooltipPos.y}
            onClose={() => setSelectedPlane(null)}
          />
          <button
            className="fixed inset-0 z-[199] cursor-default"
            style={{ background: "transparent", border: "none" }}
            onClick={() => setSelectedPlane(null)}
            aria-label="Dismiss tooltip"
          />
        </>
      )}

      {/* ── Hover Tooltip ─────────────────────────────────────────────────── */}
      {hoverPlane && !selectedPlane && (
        <FlightTooltip plane={hoverPlane} x={hoverPos.x} y={hoverPos.y} />
      )}
    </div>
  );
}
