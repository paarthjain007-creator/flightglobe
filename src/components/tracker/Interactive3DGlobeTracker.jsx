import React, { useRef, useMemo, useState, useEffect } from "react";
import Globe from "react-globe.gl";
import { Radio, Navigation, Gauge, Wind, Compass, Sparkles, Maximize2, RotateCcw } from "lucide-react";
import { interpolateGreatCircle } from "../../utils/slerpMath";
import { generateJetstreamPaths } from "../../utils/windVectorMath";
import { sound } from "../../utils/soundFx";
import { useStore } from "../../store/useStore";
import ErrorBoundary from "../ui/ErrorBoundary";

const NIGHT_TEXTURE = "https://unpkg.com/three-globe/example/img/earth-night.jpg";
const DAY_TEXTURE   = "https://unpkg.com/three-globe/example/img/earth-day.jpg";
const TOPOLOGY_BUMP = "https://unpkg.com/three-globe/example/img/earth-topology.png";

const THEME_ATMOSPHERE = {
  space:     { color: "#2997ff", altitude: 0.16 },
  holodeck:  { color: "#2997ff", altitude: 0.16 },
  synthwave: { color: "#bf5af2", altitude: 0.18 },
  atmosphera:{ color: "#60a5fa", altitude: 0.16 },
  cyberpunk: { color: "#818cf8", altitude: 0.18 },
  sunset:    { color: "#fb923c", altitude: 0.16 },
  daylight:  { color: "#0071e3", altitude: 0.15 },
};

export default function Interactive3DGlobeTracker({
  origin,
  destination,
  activeFlight,
  fullBleed = false,
  isCockpitView = false,
  showWindVectors = false,
  onPlanePosChange,
  autoRotate: externalAutoRotate,
  onToggleAutoRotate,
}) {
  const theme = useStore((s) => s.theme || "space");
  const currentAtmo = THEME_ATMOSPHERE[theme] || THEME_ATMOSPHERE.space;
  const showDayNight = useStore((s) => s.showDayNight ?? false);
  const activeOverlay = useStore((s) => s.activeOverlayLayer || "none");
  const globeFocusTarget = useStore((s) => s.globeFocusTarget);
  const globeTexture = showDayNight ? DAY_TEXTURE : NIGHT_TEXTURE;
  const globeRef = useRef(null);
  const containerRef = useRef(null);
  const wasCockpitRef = useRef(false);
  const [dimensions, setDimensions] = useState({ width: 800, height: 500 });
  const [progress, setProgress] = useState(0.45);
  const [internalAutoRotate, setInternalAutoRotate] = useState(false);
  const autoRotate = externalAutoRotate !== undefined ? externalAutoRotate : internalAutoRotate;

  // PHASE 4: ENFORCE UI VALIDATION - Strictly bind telemetry globe view to GDS coordinates
  const displayOrigin = origin || { lat: 40.6413, lng: -73.7781, iata: "JFK", city: "New York" };
  const displayDest = destination || { lat: 51.4700, lng: -0.4543, iata: "LHR", city: "London" };

  const origLat = displayOrigin.lat;
  const origLng = displayOrigin.lon ?? displayOrigin.lng;
  const destLat = displayDest.lat;
  const destLng = displayDest.lon ?? displayDest.lng;

  const flightCode = activeFlight?.code || "AA 100";
  const airlineName = activeFlight?.airline || "American Airlines";

  // Pre-generate global jetstream atmospheric paths
  const jetstreamPaths = useMemo(() => generateJetstreamPaths(), []);

  // Meteorological precipitation & cloud cluster simulation
  const weatherHexPoints = useMemo(() => {
    if (activeOverlay !== "weather" && activeOverlay !== "weather_overlay") return [];
    const pts = [];
    for (let i = 0; i < 110; i++) {
      const lat = Math.sin(i * 0.18) * 55 + Math.sin(i * 0.9) * 12;
      const lng = ((i * 137.5) % 360) - 180;
      pts.push({ lat, lng, weight: 2 + (i % 6) * 1.5 });
    }
    return pts;
  }, [activeOverlay]);

  // Measure container size dynamically
  useEffect(() => {
    if (!containerRef.current) return;
    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        setDimensions({
          width: Math.max(300, Math.floor(entry.contentRect.width)),
          height: Math.max(250, Math.floor(entry.contentRect.height)),
        });
      }
    });
    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  // Cruising aircraft position along great circle
  const planePos = useMemo(() => {
    return interpolateGreatCircle(origLat, origLng, destLat, destLng, progress);
  }, [origLat, origLng, destLat, destLng, progress]);

  // Animate cruising aircraft along the arc
  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((prev) => {
        const next = prev + 0.003;
        return next > 1 ? 0 : next;
      });
    }, 50);
    return () => clearInterval(interval);
  }, []);

  const onPlanePosChangeRef = useRef(onPlanePosChange);
  useEffect(() => {
    onPlanePosChangeRef.current = onPlanePosChange;
  }, [onPlanePosChange]);

  // Notify parent of updated aircraft telemetry
  useEffect(() => {
    if (onPlanePosChangeRef.current && planePos) {
      onPlanePosChangeRef.current(planePos, progress);
    }
  }, [planePos, progress]);

  // Cockpit first-person camera chase
  useEffect(() => {
    if (!globeRef.current || !planePos) return;
    if (isCockpitView) {
      wasCockpitRef.current = true;
      globeRef.current.pointOfView(
        {
          lat: planePos.lat,
          lng: planePos.lng,
          altitude: 0.14,
        },
        120
      );
    } else if (wasCockpitRef.current) {
      wasCockpitRef.current = false;
      const midLat = (origLat + destLat) / 2;
      const midLng = (origLng + destLng) / 2;
      globeRef.current.pointOfView({ lat: midLat, lng: midLng, altitude: 2.2 }, 1000);
    }
  }, [isCockpitView, planePos, origLat, origLng, destLat, destLng]);

  // Handle auto-orbit safely without clashing with cockpit mode
  useEffect(() => {
    if (globeRef.current) {
      const controls = globeRef.current.controls?.();
      if (controls) {
        controls.autoRotate = autoRotate && !isCockpitView;
        controls.autoRotateSpeed = 0.8;
      }
    }
  }, [autoRotate, isCockpitView]);

  // Center globe camera on route
  const handleResetCamera = () => {
    sound.playClick();
    if (globeRef.current) {
      const midLat = (origLat + destLat) / 2;
      const midLng = (origLng + destLng) / 2;
      globeRef.current.pointOfView({ lat: midLat, lng: midLng, altitude: 2.1 }, 1000);
    }
  };

  const handleToggleAutoRotate = () => {
    sound.playClick();
    if (externalAutoRotate !== undefined && onToggleAutoRotate) {
      onToggleAutoRotate(!autoRotate);
    } else {
      setInternalAutoRotate(!autoRotate);
    }
  };

  useEffect(() => {
    if (globeRef.current && !isCockpitView) {
      const midLat = (origLat + destLat) / 2;
      const midLng = (origLng + destLng) / 2;
      globeRef.current.pointOfView({ lat: midLat, lng: midLng, altitude: 2.2 }, 1200);
    }
  }, [origLat, origLng, destLat, destLng, isCockpitView]);

  // Glide camera smoothly to globeFocusTarget when requested
  useEffect(() => {
    if (globeRef.current && globeFocusTarget?.lat !== undefined && globeFocusTarget?.lng !== undefined) {
      globeRef.current.pointOfView(
        {
          lat: globeFocusTarget.lat,
          lng: globeFocusTarget.lng,
          altitude: globeFocusTarget.altitude || 2.1,
        },
        1200
      );
    }
  }, [globeFocusTarget]);

  // Arcs data for 3D trajectory
  const arcsData = useMemo(() => {
    return [
      {
        startLat: origLat,
        startLng: origLng,
        endLat: destLat,
        endLng: destLng,
        color: ["#2997ff", "#6366f1"],
        stroke: 1.2,
        altitude: 0.22,
      },
    ];
  }, [origLat, origLng, destLat, destLng]);

  // Points for Origin, Destination & Live Airplane
  const pointsData = useMemo(() => {
    return [
      {
        lat: origLat,
        lng: origLng,
        size: 0.6,
        color: "#2997ff",
        label: `${origin?.code || origin?.iata || "ORIG"} · ${origin?.city || "Origin"}`,
      },
      {
        lat: destLat,
        lng: destLng,
        size: 0.6,
        color: "#bf5af2",
        label: `${destination?.code || destination?.iata || "DEST"} · ${destination?.city || "Destination"}`,
      },
      {
        lat: planePos.lat,
        lng: planePos.lng,
        size: 0.9,
        color: "#ffffff",
        isPlane: true,
        label: `✈️ ${flightCode} · FL380 · 492 kts`,
      },
    ];
  }, [origLat, origLng, destLat, destLng, planePos, origin, destination, flightCode]);

  if (fullBleed) {
    return (
      <div ref={containerRef} className="absolute inset-0 w-full h-full overflow-hidden pointer-events-auto">
        <ErrorBoundary fallback={
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/90 text-[#86868b] font-mono text-xs">
            <Radio size={24} className="animate-pulse mb-2 text-[#2997ff]" />
            <span>3D Planetary Canvas Resting · Telemetry Active</span>
          </div>
        }>
          <Globe
            ref={globeRef}
            globeImageUrl={globeTexture}
            bumpImageUrl={TOPOLOGY_BUMP}
            backgroundColor="rgba(0, 0, 0, 0)"
            showAtmosphere={true}
            atmosphereColor={currentAtmo.color}
            atmosphereAltitude={currentAtmo.altitude}
            arcsData={arcsData}
            arcColor="color"
            arcStroke="stroke"
            arcAltitude="altitude"
            arcDashLength={0.4}
            arcDashGap={0.15}
            arcDashAnimateTime={2500}
            pathsData={showWindVectors ? jetstreamPaths : []}
            pathPoints="coords"
            pathPointLat="lat"
            pathPointLng="lng"
            pathPointAlt="alt"
            pathColor="color"
            pathStroke="stroke"
            pathDashLength={0.3}
            pathDashGap={0.08}
            pathDashAnimateTime={3500}
            pointsData={pointsData}
            pointColor="color"
            pointRadius="size"
            pointAltitude={0.03}
            pointLabel="label"
            hexBinPointsData={weatherHexPoints}
            hexBinPointLat="lat"
            hexBinPointLng="lng"
            hexBinPointWeight="weight"
            hexBinResolution={3}
            hexTopColor={() => "#2997ff"}
            hexSideColor={() => "rgba(41, 151, 255, 0.25)"}
            hexAltitude={(d) => Math.min(0.25, d.sumWeight * 0.025)}
            width={dimensions.width}
            height={dimensions.height}
            animateIn={true}
          />
        </ErrorBoundary>
        {/* Subtle radial vignette overlay matching active theme void */}
        <div className="absolute inset-0 pointer-events-none" style={{ background: "radial-gradient(circle at center, transparent 35%, rgba(0,0,0,0.45) 70%, var(--void, #000000) 100%)" }} />
      </div>
    );
  }

  return (
    <div className="glass rounded-3xl p-5 sm:p-6 flex flex-col h-full relative overflow-hidden shadow-2xl border border-white/10">
      
      {/* ─── Top Telemetry Status Header ─────────────────────────────── */}
      <div className="flex items-center justify-between flex-wrap gap-2 z-20 mb-2">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-bold uppercase tracking-widest text-blue-400 mono flex items-center gap-1.5">
              <Radio size={13} className="animate-pulse text-blue-400" />
              INTERACTIVE 3D FLIGHT TRACKER
            </span>
          </div>

          <div className="flex items-center gap-3 mt-1">
            <div className="text-xl sm:text-2xl font-bold mono text-white tracking-tight flex items-center gap-2">
              <span>{flightCode}</span>
              <span className="w-2 h-2 rounded-full bg-blue-400 animate-ping" />
            </div>
            <span className="text-xs text-slate-400 mono">· {airlineName}</span>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleToggleAutoRotate}
            className={`px-3 py-1.5 rounded-xl text-xs mono font-bold transition-all cursor-pointer ${
              autoRotate ? "bg-blue-500/20 text-blue-300 border border-blue-400/40" : "glass text-slate-400 hover:text-white"
            }`}
          >
            {autoRotate ? "Auto-Orbit ON" : "Orbit"}
          </button>
          <button
            type="button"
            onClick={handleResetCamera}
            className="p-2 rounded-xl glass text-slate-400 hover:text-blue-300 transition-colors cursor-pointer"
            title="Recenter Camera on Trajectory"
          >
            <RotateCcw size={14} />
          </button>
        </div>
      </div>

      {/* Progress Track Bar */}
      <div className="w-full h-1 bg-white/10 rounded-full overflow-hidden mb-3 z-20">
        <div
          className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full transition-all duration-300"
          style={{ width: `${Math.round(progress * 100)}%` }}
        />
      </div>

      {/* ─── 3D WebGL Globe Viewport ─────────────────────────────────── */}
      <div ref={containerRef} className="flex-1 min-h-[300px] w-full relative rounded-2xl overflow-hidden flex items-center justify-center">
        <ErrorBoundary fallback={
          <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center bg-black/80 rounded-2xl border border-blue-500/20">
            <Radio size={22} className="text-blue-400 animate-pulse mb-2" />
            <div className="text-xs font-bold text-white">Spatial Telemetry Standby</div>
            <p className="text-[10px] text-slate-400 max-w-xs mt-1">
              3D WebGL context is initializing or resting. Coordinates and flight telemetry remain fully synchronized.
            </p>
          </div>
        }>
          <Globe
            ref={globeRef}
            globeImageUrl={globeTexture}
            bumpImageUrl={TOPOLOGY_BUMP}
            backgroundColor="rgba(0,0,0,0)"
            showAtmosphere={true}
            atmosphereColor={currentAtmo.color}
            atmosphereAltitude={currentAtmo.altitude}
            arcsData={arcsData}
            arcColor="color"
            arcStroke="stroke"
            arcAltitude="altitude"
            arcDashLength={0.4}
            arcDashGap={0.15}
            arcDashAnimateTime={2500}
            pathsData={showWindVectors ? jetstreamPaths : []}
            pathPoints="coords"
            pathPointLat="lat"
            pathPointLng="lng"
            pathPointAlt="alt"
            pathColor="color"
            pathStroke="stroke"
            pathDashLength={0.3}
            pathDashGap={0.08}
            pathDashAnimateTime={3500}
            pointsData={pointsData}
            pointColor="color"
            pointRadius="size"
            pointAltitude={0.03}
            pointLabel="label"
            hexBinPointsData={weatherHexPoints}
            hexBinPointLat="lat"
            hexBinPointLng="lng"
            hexBinPointWeight="weight"
            hexBinResolution={3}
            hexTopColor={() => "#2997ff"}
            hexSideColor={() => "rgba(41, 151, 255, 0.25)"}
            hexAltitude={(d) => Math.min(0.25, d.sumWeight * 0.025)}
            width={dimensions.width}
            height={dimensions.height}
            animateIn={true}
          />
        </ErrorBoundary>

        {/* Ambient Gradient Glow Backdrop */}
        <div className="absolute inset-0 pointer-events-none bg-radial from-blue-500/10 via-transparent to-transparent opacity-60" />

        {/* Live Coordinate Badges */}
        <div className="absolute bottom-3 left-3 glass px-3 py-1.5 rounded-xl text-[10px] mono text-slate-300 flex items-center gap-2 border border-white/10 pointer-events-none">
          <Navigation size={11} className="text-blue-400" />
          <span>POS: {planePos ? `${planePos.lat.toFixed(2)}°N, ${planePos.lng.toFixed(2)}°W` : "INITIALIZING..."}</span>
        </div>

        <div className="absolute bottom-3 right-3 glass px-3 py-1.5 rounded-xl text-[10px] mono text-[#30d158] font-semibold border border-white/10 pointer-events-none">
          CRUISING · FL380 · 492 KTS
        </div>
      </div>
    </div>
  );
}
