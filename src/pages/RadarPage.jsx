import React, { useState, useEffect, useRef, useMemo, useCallback } from "react";
import Globe from "react-globe.gl";
import { useLiveTraffic } from "../hooks/useLiveTraffic";
import FlightTooltip from "../components/radar/FlightTooltip";
import RadarStats from "../components/radar/RadarStats";
import { Layers, Filter, ZoomIn, ZoomOut, Shuffle } from "lucide-react";
import { useStore } from "../store/useStore";

// ── Theme configs ────────────────────────────────────────────────────────────
const THEME_CONFIG = {
  space:     { atmosphere: "#1e3a8a", bg: "#050a18" },
  holodeck:  { atmosphere: "#00f0ff", bg: "#020813" },
  synthwave: { atmosphere: "#ff007f", bg: "#120224" },
  atmosphera:{ atmosphere: "#38bdf8", bg: "#0b192c" },
  cyberpunk: { atmosphere: "#4c1d95", bg: "#0d0019" },
  sunset:    { atmosphere: "#7c2d12", bg: "#1a0a00" },
  slate:     { atmosphere: "#1e293b", bg: "#1e2530" },
};

const EARTH_TEXTURE = "//unpkg.com/three-globe/example/img/earth-night.jpg";
const EARTH_BUMP    = "//unpkg.com/three-globe/example/img/earth-topology.png";

const MAX_PLANES = 10;
const TEN_MINUTES_MS = 10 * 60 * 1000; // 10 minutes shuffle interval

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

  const { planes, selectedPlane, setSelectedPlane, stats } = useLiveTraffic();

  const globeRef     = useRef(null);
  const containerRef = useRef(null);
  const [dims, setDims]             = useState({ w: window.innerWidth, h: window.innerHeight - 56 });
  const [filterOnGround, setFilterOnGround] = useState(true);
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });
  const [hoverPlane, setHoverPlane] = useState(null);
  const [hoverPos, setHoverPos]     = useState({ x: 0, y: 0 });

  // Shuffle seed state for picking 10 random flights
  const [shuffleSeed, setShuffleSeed] = useState(0);

  // Responsive resize
  useEffect(() => {
    const onResize = () => setDims({ w: window.innerWidth, h: window.innerHeight - 56 });
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
    
    return shuffleArray(airborne).slice(0, MAX_PLANES);
  }, [planes, filterOnGround, shuffleSeed]);

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
      style={{ height: `${dims.h}px`, marginTop: "56px", background: themeConf.bg }}
      onClick={(e) => { if (e.target === containerRef.current) setSelectedPlane(null); }}
    >
      {/* ── Globe Canvas with Small Rotated Airplane Models ─────────────── */}
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

      {/* ── Stats HUD ─────────────────────────────────────────────────────── */}
      <RadarStats stats={{ ...stats, count: displayPlanes.length }} />

      {/* ── Top-right Controls ────────────────────────────────────────────── */}
      <div className="absolute top-4 right-4 z-30 flex flex-col gap-2">
        {/* Manual Reshuffle Button */}
        <button
          id="shuffle-planes-btn"
          onClick={handleManualShuffle}
          className="glass px-3 py-2 rounded-xl flex items-center gap-2 text-xs font-semibold cursor-pointer hover:border-cyan-400 transition-all text-cyan-300"
          title="Reshuffle 10 random global flights"
        >
          <Shuffle size={13} />
          <span>Shuffle 10 Flights</span>
        </button>

        {/* Airborne Filter Button */}
        <button
          id="radar-ground-filter-btn"
          onClick={() => setFilterOnGround((v) => !v)}
          className="glass px-3 py-2 rounded-xl flex items-center gap-2 text-xs font-semibold cursor-pointer hover:opacity-90 transition-all"
          style={{
            color: filterOnGround ? "#4ade80" : "var(--text-muted)",
            borderColor: filterOnGround ? "rgba(74,222,128,0.4)" : "var(--glass-border)",
          }}
        >
          <Filter size={13} />
          <span>{filterOnGround ? "Airborne" : "All"}</span>
        </button>

        {/* Plane Count Badge */}
        <div className="glass px-3 py-2 rounded-xl flex items-center gap-2 text-xs font-mono" style={{ color: "var(--text-muted)" }}>
          <Layers size={13} style={{ color: "var(--accent)" }} />
          <span>{displayPlanes.length} / 10 Active</span>
        </div>

        {/* Zoom controls */}
        <div className="flex flex-col gap-1">
          <button onClick={zoomIn} className="glass p-2 rounded-xl flex items-center justify-center cursor-pointer hover:opacity-90" style={{ color: "var(--accent)" }} title="Zoom In">
            <ZoomIn size={14} />
          </button>
          <button onClick={zoomOut} className="glass p-2 rounded-xl flex items-center justify-center cursor-pointer hover:opacity-90" style={{ color: "var(--accent)" }} title="Zoom Out">
            <ZoomOut size={14} />
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
