import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useStore } from "../store/useStore";
import { AIRPORTS } from "../data/airports";
import FlightDeckFAB from "../components/ui/FlightDeckFAB";
import DispatchRoom from "../components/multiplayer/DispatchRoom";

const Interactive3DGlobeTracker = React.lazy(() => import("../components/tracker/Interactive3DGlobeTracker"));
const CockpitHUD = React.lazy(() => import("../components/cockpit/CockpitHUD"));

export default function Simulator() {
  const isLiteMode = useStore((s) => s.isLiteMode);
  
  // Default to a fun route for the simulator
  const [origin] = useState(AIRPORTS.find(a => a.iata === "JFK") || AIRPORTS[0]);
  const [destination] = useState(AIRPORTS.find(a => a.iata === "LHR") || AIRPORTS[1]);
  
  const [isCockpitView, setIsCockpitView] = useState(false);
  const [isDispatchMode, setIsDispatchMode] = useState(false);
  
  const activeOverlayLayer = useStore((s) => s.activeOverlayLayer);

  // Fake telemetry for the HUD
  const [planeTelemetry, setPlaneTelemetry] = useState({
    altitude: 34000,
    speed: 510,
    heading: 84,
    progress: 0.1,
  });

  useEffect(() => {
    let frame;
    let start = Date.now();
    function tick() {
      const elapsed = Date.now() - start;
      const progress = (elapsed / 60000) % 1; // 1-minute loop for demo
      setPlaneTelemetry({
        altitude: 34000 + Math.sin(elapsed / 2000) * 100,
        speed: 510 + Math.cos(elapsed / 3000) * 5,
        heading: 84,
        progress
      });
      frame = requestAnimationFrame(tick);
    }
    tick();
    return () => cancelAnimationFrame(frame);
  }, []);

  return (
    <div className="relative w-full h-screen bg-slate-950 overflow-hidden font-sans text-slate-200 flex flex-col items-center justify-center">
      {isLiteMode ? (
        <div className="z-10 p-10 rounded-3xl bg-slate-900/90 border border-red-500/30 text-center max-w-md backdrop-blur-md">
          <h2 className="text-xl font-bold text-red-400 mb-2">Simulator Unavailable</h2>
          <p className="text-sm text-slate-400 mb-6">The 3D Flight Simulator requires WebGL. Please disable Lite Mode in the top navigation bar to launch the simulator.</p>
        </div>
      ) : (
        <>
          {/* GLOBE ENGINE */}
          <div className="absolute inset-0 globe-vignette">
            <React.Suspense fallback={<div className="absolute inset-0 flex items-center justify-center text-white/50 text-xs tracking-widest font-mono">INITIALIZING PHYSICS ENGINE...</div>}>
              <Interactive3DGlobeTracker
                origin={origin}
                destination={destination}
                activeFlight={{
                  airline: "GlobalAir",
                  flightNumber: "GL-101",
                  status: "EN_ROUTE",
                  aircraft: "B787",
                  progress: planeTelemetry.progress
                }}
                isDispatchMode={isDispatchMode}
              />
            </React.Suspense>
          </div>

          {/* COCKPIT HUD OVERLAY */}
          {isCockpitView && (
            <React.Suspense fallback={null}>
              <CockpitHUD
                origin={origin}
                destination={destination}
                progress={planeTelemetry.progress}
                altitude={planeTelemetry.altitude}
                speed={planeTelemetry.speed}
                heading={planeTelemetry.heading}
              />
            </React.Suspense>
          )}

          {/* MULTIPLAYER DISPATCH ROOM */}
          <AnimatePresence>
            {isDispatchMode && (
              <motion.div
                initial={{ opacity: 0, y: 50, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 20, scale: 0.95 }}
                className="absolute right-6 top-24 bottom-24 w-80 sm:w-96 z-[60]"
              >
                <DispatchRoom onClose={() => setIsDispatchMode(false)} />
              </motion.div>
            )}
          </AnimatePresence>

          {/* FLIGHT DECK FAB (Controls) */}
          <FlightDeckFAB
            isCockpitView={isCockpitView}
            toggleCockpit={() => setIsCockpitView(!isCockpitView)}
            isDispatchMode={isDispatchMode}
            toggleDispatch={() => setIsDispatchMode(!isDispatchMode)}
            activeOverlayLayer={activeOverlayLayer}
          />
          
          {/* SIMULATOR HEADER */}
          <div className="absolute top-24 left-8 z-[50] pointer-events-none">
            <div className="text-[10px] font-bold tracking-widest text-blue-400 mb-1">AEROSPACE ENGINE V3</div>
            <h1 className="text-3xl font-black text-white tracking-tighter">Flight Simulator</h1>
            <p className="text-xs text-slate-400 max-w-xs mt-2">Experience 3D WebGL rendering, volumetric clouds, and real-time multiplayer dispatch protocols.</p>
          </div>
        </>
      )}
    </div>
  );
}
