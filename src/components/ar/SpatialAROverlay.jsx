import React, { useEffect, useRef, useState, Suspense } from "react";
import { Camera, X, RotateCcw, Maximize2, Minimize2, Navigation } from "lucide-react";
import { useSpatialAudio } from "../../hooks/useSpatialAudio";
import Globe from "react-globe.gl";

const EARTH_TEXTURE = "//unpkg.com/three-globe/example/img/earth-blue-marble.jpg";
const EARTH_BUMP    = "//unpkg.com/three-globe/example/img/earth-topology.png";

// Sample airport dots to show on the AR globe
const AR_DOTS = [
  { lat: 40.64, lng: -73.77 },  // JFK
  { lat: 51.47, lng: -0.45 },   // LHR
  { lat: 49.01, lng: 2.54 },    // CDG
  { lat: 25.25, lng: 55.36 },   // DXB
  { lat: 1.36,  lng: 103.99 },  // SIN
  { lat: 35.55, lng: 139.78 },  // NRT
  { lat: -33.95,lng: 151.18 },  // SYD
  { lat: 33.94, lng: -118.41},  // LAX
];

export function SpatialAROverlay({ waypoints = [], onClose }) {
  const videoRef   = useRef(null);
  const globeRef   = useRef(null);
  const [hasCameraPermission, setHasCameraPermission] = useState(false);
  const [isAnchored, setIsAnchored]   = useState(false);
  const [scale, setScale]             = useState(1.0);
  const [rotationY, setRotationY]     = useState(0);
  const [globeSize, setGlobeSize]     = useState(340);
  const { playClick, playSwoosh }     = useSpatialAudio();

  const validWps    = waypoints.filter(Boolean);
  const origin      = validWps[0] || null;
  const destination = validWps.length >= 2 ? validWps[validWps.length - 1] : null;

  // Build arc between waypoints for the AR globe
  const origLng = origin ? (origin.lng ?? origin.lon ?? 0) : 0;
  const destLng = destination ? (destination.lng ?? destination.lon ?? 0) : 0;
  const arArcs = (origin && destination) ? [{
    startLat: origin.lat, startLng: origLng,
    endLat: destination.lat, endLng: destLng,
    color: ["rgba(0,240,255,0.9)", "rgba(0,240,255,0.3)"],
  }] : [];

  // Request device camera feed for AR passthrough
  useEffect(() => {
    let stream = null;
    async function enableCamera() {
      try {
        if (navigator.mediaDevices?.getUserMedia) {
          stream = await navigator.mediaDevices.getUserMedia({
            video: { facingMode: "environment", width: { ideal: 1920 }, height: { ideal: 1080 } },
          });
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
            videoRef.current.play();
            setHasCameraPermission(true);
          }
        }
      } catch (err) {
        console.warn("Camera passthrough not available:", err);
        setHasCameraPermission(false);
      }
    }
    enableCamera();
    return () => { if (stream) stream.getTracks().forEach((t) => t.stop()); };
  }, []);

  // Auto-spin the AR globe slowly
  useEffect(() => {
    if (!isAnchored || !globeRef.current) return;
    const controls = globeRef.current.controls?.();
    if (controls) {
      controls.autoRotate      = true;
      controls.autoRotateSpeed = 0.6;
    }
  }, [isAnchored]);

  function handleAnchor() {
    playSwoosh();
    setIsAnchored(true);
  }

  return (
    <div
      id="spatial-ar-overlay"
      className="fixed inset-0 z-50 overflow-hidden flex flex-col justify-between p-4 select-none"
      style={{ background: hasCameraPermission ? "transparent" : "rgba(5,10,24,0.92)" }}
    >
      {/* ── Camera passthrough / ambient grid background ─────────────────── */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {hasCameraPermission ? (
          <video ref={videoRef} playsInline muted className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center"
            style={{ background: "radial-gradient(ellipse at center, #0b1a2e 0%, #050a18 100%)" }}
          >
            <div
              className="absolute inset-0"
              style={{
                backgroundImage: "linear-gradient(to right,#082f4912 1px,transparent 1px),linear-gradient(to bottom,#082f4912 1px,transparent 1px)",
                backgroundSize: "4rem 4rem",
              }}
            />
          </div>
        )}
      </div>

      {/* ── Top HUD Bar ──────────────────────────────────────────────────── */}
      <div className="relative z-10 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 glass px-4 py-2 rounded-2xl border border-cyan-400/30 text-white shadow-2xl">
          <Camera size={16} className="text-cyan-400 animate-pulse" />
          <span className="text-xs font-bold font-mono">
            {hasCameraPermission ? "LIVE AR PASSTHROUGH ACTIVE" : "SPATIAL COMPUTING PREVIEW"}
          </span>
        </div>

        <div className="flex items-center gap-2">
          {origin && destination && (
            <div className="hidden sm:flex items-center gap-2 glass px-3 py-1.5 rounded-xl border border-white/10 text-xs font-semibold text-cyan-300">
              <Navigation size={13} />
              <span>{origin.iata || origin.code || "ORIG"} → {destination.iata || destination.code || "DEST"}</span>
            </div>
          )}
          <button
            onClick={() => { playClick(); onClose(); }}
            className="p-2.5 rounded-2xl glass border border-red-500/40 text-red-400 hover:bg-red-500/20 transition-all cursor-pointer shadow-lg"
            title="Exit AR Mode"
          >
            <X size={18} />
          </button>
        </div>
      </div>

      {/* ── Central Area ─────────────────────────────────────────────────── */}
      <div className="relative z-10 flex-1 flex flex-col items-center justify-center pointer-events-none">
        {!isAnchored ? (
          /* Placement Target Ring */
          <div className="flex flex-col items-center gap-4 text-center pointer-events-auto">
            <div
              onClick={handleAnchor}
              className="relative w-56 h-56 rounded-full border-2 border-dashed border-cyan-400 flex items-center justify-center cursor-pointer hover:scale-105 transition-transform bg-cyan-500/10 shadow-[0_0_50px_rgba(0,240,255,0.3)]"
            >
              <div className="w-40 h-40 rounded-full border border-cyan-300/40 animate-ping absolute" />
              <div className="text-cyan-400 font-bold text-xs font-mono uppercase tracking-widest">
                TAP TO ANCHOR GLOBE
              </div>
            </div>
            <div className="glass px-4 py-2 rounded-2xl border border-white/15 text-xs text-cyan-200">
              Point camera at flat surface · Tap to anchor 3D globe
            </div>
          </div>
        ) : (
          /* ── Anchored: real react-globe.gl rendering ───────────────────── */
          <div
            className="pointer-events-auto flex flex-col items-center gap-3"
            style={{ transform: `scale(${scale}) rotateY(${rotationY}deg)` }}
          >
            {/* Holographic ring frame */}
            <div
              className="relative rounded-full overflow-hidden shadow-[0_0_80px_rgba(0,240,255,0.5)]"
              style={{
                width: globeSize,
                height: globeSize,
                border: "2px solid rgba(0,240,255,0.4)",
                background: "transparent",
              }}
            >
              {/* Spinning outer ring */}
              <div
                className="absolute inset-0 rounded-full border border-dashed border-cyan-300/40 pointer-events-none"
                style={{ animation: "spin 12s linear infinite" }}
              />

              {/* The actual 3D Globe */}
              <Suspense fallback={
                <div className="w-full h-full flex items-center justify-center text-cyan-400 text-xs font-mono animate-pulse">
                  Loading globe…
                </div>
              }>
                <Globe
                  ref={globeRef}
                  width={globeSize}
                  height={globeSize}
                  backgroundColor="rgba(0,0,0,0)"
                  atmosphereColor="#00f0ff"
                  atmosphereAltitude={0.18}
                  globeImageUrl={EARTH_TEXTURE}
                  bumpImageUrl={EARTH_BUMP}

                  // Airport dots
                  pointsData={AR_DOTS}
                  pointColor={() => "rgba(0,240,255,0.9)"}
                  pointRadius={0.4}
                  pointAltitude={0.01}

                  // Route arc (if route selected)
                  arcsData={arArcs}
                  arcColor="color"
                  arcStroke={0.5}
                  arcDashLength={0.6}
                  arcDashGap={0.4}
                  arcDashAnimateTime={2000}

                  // Controls
                  enablePointerInteraction={true}
                />
              </Suspense>
            </div>

            {/* Route label */}
            <div className="glass px-4 py-2 rounded-2xl border border-cyan-400/30 text-xs font-mono text-center text-cyan-300 shadow-xl">
              {origin && destination
                ? `${origin.city || origin.iata || origin.code || "Origin"} → ${destination.city || destination.iata || destination.code || "Destination"}`
                : "Global Live Flight Tracker"}
            </div>
          </div>
        )}
      </div>

      {/* ── Bottom Control Panel (only when anchored) ─────────────────────── */}
      {isAnchored && (
        <div className="relative z-10 max-w-md mx-auto w-full glass p-4 rounded-3xl border border-cyan-400/40 shadow-2xl flex items-center justify-between gap-4 animate-slide-up">
          {/* Scale controls */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => { playClick(); setScale((s) => Math.max(0.4, s - 0.2)); }}
              className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-cyan-300 cursor-pointer"
              title="Shrink"
            >
              <Minimize2 size={16} />
            </button>
            <span className="text-xs font-mono font-bold text-white min-w-12 text-center">
              {Math.round(scale * 100)}%
            </span>
            <button
              onClick={() => { playClick(); setScale((s) => Math.min(2.5, s + 0.2)); }}
              className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-cyan-300 cursor-pointer"
              title="Grow"
            >
              <Maximize2 size={16} />
            </button>
          </div>

          {/* Rotate */}
          <button
            onClick={() => { playClick(); setRotationY((r) => r + 45); }}
            className="px-3 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-bold text-cyan-300 flex items-center gap-1.5 cursor-pointer"
          >
            <RotateCcw size={14} /> Rotate 45°
          </button>

          {/* Re-anchor */}
          <button
            onClick={() => { playClick(); setIsAnchored(false); }}
            className="px-3 py-2 rounded-xl bg-cyan-500/20 text-cyan-400 hover:bg-cyan-500/30 text-xs font-bold cursor-pointer"
          >
            Re-Anchor
          </button>
        </div>
      )}

      {/* ── Inline spin keyframe ──────────────────────────────────────────── */}
      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

export default SpatialAROverlay;
