import React, { useState, useCallback, useRef, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowRight, Loader2, Zap, Cpu } from "lucide-react";
import GlobeViewer from "../components/Globe/GlobeViewer";
import LeftPanel from "../components/panels/LeftPanel";
import FeaturePanel from "../components/panels/FeaturePanel";
import { useFlightWorker } from "../hooks/useFlightWorker";
import { useLiveFlights } from "../hooks/useLiveFlights";
import { useFlightSchedules } from "../hooks/useFlightSchedules";
import { useSpatialAudio } from "../hooks/useSpatialAudio";
import { usePerformanceMonitor } from "../hooks/usePerformanceMonitor";
import { useWebXR } from "../hooks/useWebXR";
import { WebXRModal } from "../components/ui/WebXRModal";
import { SpatialAROverlay } from "../components/ar/SpatialAROverlay";
import { TimelineScrubber } from "../components/timeline/TimelineScrubber";
import { CockpitHUD } from "../components/cockpit/CockpitHUD";
import { interpolateGreatCircle } from "../utils/slerpMath";
import { useStore } from "../store/useStore";

export default function Explore() {
  const navigate      = useNavigate();
  const theme         = useStore((s) => s.theme);
  const storedWps     = useStore((s) => s.waypoints);
  const setStoreWps   = useStore((s) => s.setWaypoints);
  const addStamp      = useStore((s) => s.addStamp);
  const activeOverlayLayer = useStore((s) => s.activeOverlayLayer ?? "none");
  const setActiveOverlayLayer = useStore((s) => s.setActiveOverlayLayer);

  // FPS & Performance monitor hook
  const { fps, isLowPerformanceMode } = usePerformanceMonitor();

  // Audio & Spatial AR Hooks
  const { playClick, playSwoosh, playRouteAdd } = useSpatialAudio();
  const { startARSession } = useWebXR();
  const [arModalOpen, setArModalOpen] = useState(false);
  const [isARModeActive, setIsARModeActive] = useState(false);

  // Local route & view states
  const [waypoints, setWaypoints] = useState(() => storedWps || []);
  const [radarEnabled, setRadarEnabled] = useState(true);
  const [is4DModeEnabled, setIs4DModeEnabled] = useState(false);
  const [showWindVectors, setShowWindVectors] = useState(true);

  // Cockpit First-Person Mode state
  const [isCockpitView, setIsCockpitView] = useState(false);
  const [cockpitProgress, setCockpitProgress] = useState(0.45);

  const validWps    = waypoints.filter(Boolean);
  const hasRoute    = validWps.length >= 2;
  const origin      = hasRoute ? validWps[0] : null;
  const destination = hasRoute ? validWps[validWps.length - 1] : null;

  // 4D Timeline State
  const nowMs = useMemo(() => Date.now(), []);
  const minTimeMs = nowMs;
  const maxTimeMs = useMemo(() => nowMs + 7 * 24 * 3600 * 1000, [nowMs]);
  const [simulatedTimeMs, setSimulatedTimeMs] = useState(nowMs);

  // 7-Day Future Schedules
  const { schedules } = useFlightSchedules(origin, destination, validWps);

  // 4D Airborne Simulated Flights
  const airborne4DFlights = useMemo(() => {
    if (!is4DModeEnabled || !schedules || schedules.length === 0) return [];

    return schedules
      .map((flight) => {
        if (simulatedTimeMs < flight.depTimestamp || simulatedTimeMs > flight.arrTimestamp) {
          return null;
        }

        const progress = (simulatedTimeMs - flight.depTimestamp) / (flight.arrTimestamp - flight.depTimestamp);
        const pos = interpolateGreatCircle(
          flight.origin.lat, flight.origin.lng,
          flight.destination.lat, flight.destination.lng,
          progress
        );

        return {
          ...flight,
          lat: pos.lat,
          lng: pos.lng,
          heading: pos.heading,
          progress,
        };
      })
      .filter(Boolean);
  }, [is4DModeEnabled, schedules, simulatedTimeMs]);

  // Live Flights Hook
  const { flights: liveFlights } = useLiveFlights(destination, radarEnabled && !is4DModeEnabled);

  // Web Worker stats
  const { result, loading } = useFlightWorker(hasRoute ? validWps : null);

  const canCalculate = hasRoute && !!result && !loading;

  const stateRef = useRef({ validWps, result });
  stateRef.current = { validWps, result };

  const handleCalculate = useCallback(() => {
    playSwoosh();
    const { validWps: wps, result: res } = stateRef.current;
    if (!res || wps.length < 2) return;

    const orig = wps[0];
    const dest = wps[wps.length - 1];

    setStoreWps(wps);

    addStamp({
      id: Date.now(),
      timestamp: Date.now(),
      date: new Date().toLocaleDateString("en-US", {
        month: "short", day: "numeric", year: "numeric",
      }),
      origin: { iata: orig.iata, city: orig.city, country: orig.country },
      destination: { iata: dest.iata, city: dest.city, country: dest.country },
      totalKm: res.totalKm,
      co2Kg: res.co2Kg,
    });

    navigate("/dashboard");
  }, [setStoreWps, addStamp, navigate, playSwoosh]);

  function handleWaypointsChange(newWps) {
    playRouteAdd();
    setWaypoints(newWps);
  }

  function toggleOverlay(layer) {
    playClick();
    setActiveOverlayLayer(activeOverlayLayer === layer ? "none" : layer);
  }

  const cockpitHeading = useMemo(() => {
    if (!origin || !destination) return 78;
    const pos = interpolateGreatCircle(origin.lat, origin.lng, destination.lat, destination.lng, cockpitProgress);
    return pos.heading || 78;
  }, [origin?.iata, destination?.iata, cockpitProgress]);

  const activeWindVectors = showWindVectors && !isLowPerformanceMode;

  return (
    <div
      id="explore-page"
      className="relative overflow-hidden"
      style={{ height: "calc(100vh - 56px)", marginTop: "56px" }}
    >
      {/* 3D Globe with Live Radar, 4D Schedules, Cockpit Camera & Wind Particles */}
      <GlobeViewer
        waypoints={validWps}
        liveFlights={liveFlights}
        simulated4DFlights={airborne4DFlights}
        theme={theme}
        activeOverlayLayer={activeOverlayLayer}
        showWindVectors={activeWindVectors}
        isCockpitView={isCockpitView}
        cockpitProgress={cockpitProgress}
      />

      {/* Left Panel — Airport search & route builder */}
      {!isCockpitView && (
        <aside className="absolute left-4 top-1/2 -translate-y-1/2 z-30">
          <LeftPanel
            waypoints={waypoints}
            onWaypointsChange={handleWaypointsChange}
            workerResult={result}
          />
        </aside>
      )}

      {/* Right Feature Panel — All major features prominently displayed */}
      {!isCockpitView && !isARModeActive && (
        <aside className="absolute right-4 top-1/2 -translate-y-1/2 z-30">
          <FeaturePanel
            hasRoute={hasRoute}
            showWindVectors={showWindVectors}
            onToggleWind={() => { playClick(); setShowWindVectors((v) => !v); }}
            is4DModeEnabled={is4DModeEnabled}
            onToggle4D={() => { playClick(); setIs4DModeEnabled((v) => !v); }}
            isCockpitView={isCockpitView}
            onEnterCockpit={() => { playClick(); setIsCockpitView(true); }}
            onEnterAR={() => { playClick(); startARSession(); setArModalOpen(true); }}
            activeOverlayLayer={activeOverlayLayer}
            onToggleOverlay={toggleOverlay}
            isARModeActive={isARModeActive}
          />
        </aside>
      )}

      {/* FPS & Performance Status Indicator */}
      <div className="absolute top-4 left-4 z-20 flex items-center gap-2">
        <div className="glass px-2.5 py-1 rounded-xl text-[10px] font-mono flex items-center gap-1 text-slate-400">
          <Cpu size={10} className="text-cyan-400" />
          <span>{fps} FPS</span>
          {isLowPerformanceMode && (
            <span className="text-amber-400 font-bold ml-1">· Auto-Tuned</span>
          )}
        </div>
      </div>

      {/* Cockpit HUD Overlay */}
      {isCockpitView && (
        <CockpitHUD
          origin={origin}
          destination={destination}
          progress={cockpitProgress}
          heading={cockpitHeading}
          altitudeFt={36000}
          speedKmh={860}
          onExitCockpit={() => setIsCockpitView(false)}
        />
      )}

      {/* Spatial AR Live Overlay Viewport */}
      {isARModeActive && (
        <SpatialAROverlay
          waypoints={validWps}
          onClose={() => setIsARModeActive(false)}
        />
      )}

      {/* Bottom CTA & 4D Timeline Scrubber */}
      {!isCockpitView && !isARModeActive && (
        is4DModeEnabled ? (
          <TimelineScrubber
            simulatedTimeMs={simulatedTimeMs}
            onChangeSimulatedTime={setSimulatedTimeMs}
            airborneFlightsCount={airborne4DFlights.length}
            minTimeMs={minTimeMs}
            maxTimeMs={maxTimeMs}
          />
        ) : (
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-30 flex flex-col items-center gap-3">
            {hasRoute && (
              <button
                id="calculate-trip-btn"
                onClick={handleCalculate}
                disabled={!canCalculate}
                className="flex items-center gap-2.5 px-7 py-3 rounded-2xl font-bold text-sm transition-all cursor-pointer hover:scale-105 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed disabled:scale-100 shadow-2xl"
                style={{
                  background: canCalculate ? "var(--accent)" : "var(--glass-bg)",
                  color: canCalculate ? "var(--bg-primary)" : "var(--text-muted)",
                  boxShadow: canCalculate ? "0 0 40px var(--accent-glow)" : "none",
                  border: "1px solid var(--glass-border)",
                }}
              >
                {loading ? (
                  <><Loader2 size={15} className="animate-spin" /> Calculating route…</>
                ) : (
                  <><Zap size={15} /> Calculate Trip Insights <ArrowRight size={15} /></>
                )}
              </button>
            )}

            {!hasRoute && (
              <div
                className="glass rounded-full px-5 py-2.5 flex items-center gap-2 text-xs"
                style={{ color: "var(--text-muted)" }}
              >
                <span>🌍</span>
                <span>Search airports on the left · Toggle features on the right</span>
              </div>
            )}
          </div>
        )
      )}

      {/* WebXR AR Modal */}
      <WebXRModal
        isOpen={arModalOpen}
        onClose={() => setArModalOpen(false)}
        onStartAR={() => setIsARModeActive(true)}
      />
    </div>
  );
}
