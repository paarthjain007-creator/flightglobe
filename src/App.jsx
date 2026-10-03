import React, { Suspense, lazy, useEffect, useState } from "react";
import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import NavBar from "./components/NavBar";
import CommandPalette from "./components/ui/CommandPalette";
import TelemetryTicker from "./components/ui/TelemetryTicker";
import ATCRadioWidget from "./components/audio/ATCRadioWidget";
import EmergencySquawkBanner from "./components/telemetry/EmergencySquawkBanner";
import GlobalCopilotFloatingWidget from "./components/ai/GlobalCopilotFloatingWidget";
import { useStore } from "./store/useStore";
import { sound } from "./utils/soundFx";
// Pages
const Explore   = lazy(() => import("./pages/Explore"));
const Home      = lazy(() => import("./pages/Home"));
const RadarPage = lazy(() => import("./pages/RadarPage"));
import Copilot from "./pages/Copilot";

const Passport    = lazy(() => import("./pages/Passport"));
const BookingPage = lazy(() => import("./pages/BookingPage"));

function Spinner() {
  return (
    <div className="min-h-screen bg-black flex items-center justify-center">
      <div className="w-6 h-6 rounded-full border-2 border-blue-500/30 border-t-blue-500 animate-spin" />
    </div>
  );
}

export default function App() {
  const location = useLocation();
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
  const soundEnabled = useStore((s) => s.soundEnabled ?? true);
  const soundVolume = useStore((s) => s.soundVolume ?? 1.0);

  // Synchronize sound settings with synthesizer
  useEffect(() => {
    sound.enabled = soundEnabled;
    sound.setVolume(soundVolume);
  }, [soundEnabled, soundVolume]);

  // Reset scroll on route change
  useEffect(() => { window.scrollTo(0, 0); }, [location.pathname]);

  // Global ⌘K / Ctrl+K keyboard shortcut for Command Palette
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setIsCommandPaletteOpen((prev) => !prev);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const isFullscreen = ["/explore", "/radar", "/search", "/copilot"].includes(location.pathname);
  const isRadarOrExplore = ["/explore", "/radar", "/search"].includes(location.pathname);
  const isMinimalPage = ["/booking", "/passport", "/checkout"].includes(location.pathname);

  return (
    <div className="bg-[#0b0c10] min-h-screen text-white relative bg-[radial-gradient(circle_at_top,_var(--tw-gradient-stops))] from-[#1f2937]/30 via-[#0b0c10] to-[#0b0c10]">
      <NavBar onOpenCommandPalette={() => setIsCommandPaletteOpen(true)} />

      {/* Global Interactive Feature Overlays */}
      <CommandPalette
        isOpen={isCommandPaletteOpen}
        onClose={() => setIsCommandPaletteOpen(false)}
      />
      
      {/* Heavy Telemetry Widgets - Only render on immersive pages to reduce cognitive overload */}
      {isRadarOrExplore && (
        <>
          <EmergencySquawkBanner />
          <TelemetryTicker />
          <ATCRadioWidget />
        </>
      )}

      {location.pathname !== "/copilot" && !isMinimalPage && (
        <div className="fixed bottom-4 right-4 z-40">
          <GlobalCopilotFloatingWidget />
        </div>
      )}

      <main className={isFullscreen ? "" : "pt-14"}>
        <Suspense fallback={<Spinner />}>
          <AnimatePresence mode="wait">
            <Routes location={location} key={location.pathname}>
              <Route path="/"          element={<Navigate to="/explore" replace />} />
              <Route path="/explore"   element={<Explore />} />
              <Route path="/simulator" element={<Simulator />} />
              <Route path="/search"    element={<Explore />} />
              <Route path="/booking"   element={<BookingPage />} />
              <Route path="/dashboard" element={<Navigate to="/passport" replace />} />
              <Route path="/passport"  element={<Passport />} />
              <Route path="/radar"     element={<RadarPage />} />
              <Route path="/copilot"   element={<Copilot />} />
              <Route path="*"          element={<Navigate to="/explore" replace />} />
            </Routes>
          </AnimatePresence>
        </Suspense>
      </main>
    </div>
  );
}

