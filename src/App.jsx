import React, { useState, useEffect, Suspense, lazy } from "react";
import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import NavBar from "./components/NavBar";
import Footer from "./components/Footer";
import GlobalCopilotFloatingWidget from "./components/ai/GlobalCopilotFloatingWidget";
import AuroraBackground from "./components/canvas/AuroraBackground";
import CommandPalette from "./components/ui/CommandPalette";
import TelemetryTicker from "./components/ui/TelemetryTicker";
import ATCRadioWidget from "./components/audio/ATCRadioWidget";
import EmergencySquawkBanner from "./components/telemetry/EmergencySquawkBanner";
import { sound } from "./utils/soundFx";
import { useStore } from "./store/useStore";
import { fetchUserBookingsAPI } from "./services/api/apiClient";
import ErrorBoundary from "./components/ui/ErrorBoundary";

// Lazy loaded page views
const Explore     = lazy(() => import("./pages/Explore"));
const RadarPage   = lazy(() => import("./pages/RadarPage"));
const BookingPage = lazy(() => import("./pages/BookingPage"));
const Dashboard   = lazy(() => import("./pages/Dashboard"));
const Copilot     = lazy(() => import("./pages/Copilot"));
const Passport    = lazy(() => import("./pages/Passport"));

function PageFallback() {
  return (
    <div
      className="w-full flex flex-col items-center justify-center min-h-[60vh] gap-3 text-cyan-300 font-mono text-sm"
      style={{ marginTop: "88px" }}
    >
      <div className="w-8 h-8 rounded-full border-2 border-cyan-400 border-t-transparent animate-spin" />
      <span>Synthesizing 3D Planetary Radar & GDS Engine...</span>
    </div>
  );
}

export default function App() {
  const location = useLocation();
  const theme = useStore((s) => s.theme);
  const soundEnabled = useStore((s) => s.soundEnabled ?? true);
  const setTrips = useStore((s) => s.setTrips);
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);

  // Global Cmd+K / Ctrl+K listener for Aerospace Command Palette
  useEffect(() => {
    function handleKeyDown(e) {
      if ((e.metaKey || e.ctrlKey) && (e.key === "k" || e.key === "K")) {
        e.preventDefault();
        setIsCommandPaletteOpen((prev) => !prev);
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Sync spatial sound setting
  useEffect(() => {
    sound.enabled = soundEnabled;
  }, [soundEnabled]);

  // Sync active theme to DOM
  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme || "space");
  }, [theme]);

  // Fetch initial user bookings from backend API if available
  useEffect(() => {
    async function loadBackendBookings() {
      try {
        const bookings = await fetchUserBookingsAPI();
        if (bookings && bookings.length > 0) {
          setTrips(bookings);
        }
      } catch {
        // Fallback to local storage zustand
      }
    }
    loadBackendBookings();
  }, [setTrips]);

  // Full-viewport pages: no footer, page manages own scroll/overflow
  const isFullViewport = ["/explore", "/radar"].includes(location.pathname);

  return (
    <div
      className="min-h-screen flex flex-col relative overflow-x-hidden selection:bg-cyan-500/30 selection:text-cyan-200"
      style={{ background: "var(--void)", color: "var(--text-primary)" }}
    >
      {/* ─── Living Aurora Borealis Canvas Background ────────────── */}
      <AuroraBackground />

      {/* ─── Persistent AERO.SPATIAL HUD Header ─────────────────── */}
      <NavBar onOpenCommandPalette={() => setIsCommandPaletteOpen(true)} />

      {/* ─── Main Route Viewports ─────────────────────────────────
            Full-viewport pages handle their own positioning (absolute/fixed).
            Scrollable pages get 88px top padding (16px margin + 64px header bar).
      ──────────────────────────────────────────────────────────── */}
      <div className={isFullViewport ? "flex-1" : "flex-1 flex flex-col"}>
        <ErrorBoundary
          title="Telemetry Engine Anomaly"
          message="FlightGlobe encountered a temporary interface or rendering exception. You can reboot the flight system or refresh the view."
          showError={true}
        >
          <Suspense fallback={<PageFallback />}>
            <Routes>
              <Route path="/" element={<Navigate to="/explore" replace />} />
              <Route path="/explore"   element={<Explore />} />
              <Route path="/radar"     element={<RadarPage />} />
              <Route path="/booking"   element={<BookingPage />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/copilot"   element={<Copilot />} />
              <Route path="/passport"  element={<Passport />} />
              <Route path="*"          element={<Navigate to="/explore" replace />} />
            </Routes>
          </Suspense>
        </ErrorBoundary>
      </div>

      {/* ─── Footer (only on scrollable pages) ───────────────────── */}
      {!isFullViewport && <Footer />}

      {/* ─── Global Aerospace Command Palette Modal (Cmd+K / Ctrl+K) ─ */}
      <CommandPalette
        isOpen={isCommandPaletteOpen}
        onClose={() => setIsCommandPaletteOpen(false)}
      />

      {/* ─── Real-Time Global Telemetry Status Bar ────────────────── */}
      <TelemetryTicker />

      {/* ─── VHF Aviation Radio Chatter Console ───────────────────── */}
      <ATCRadioWidget />

      {/* ─── Emergency Squawk 7700 Alert Banner ─────────────────────── */}
      <EmergencySquawkBanner />

      {/* ─── Omnipresent AI Copilot Widget ───────────────────────── */}
      <GlobalCopilotFloatingWidget />
    </div>
  );
}


