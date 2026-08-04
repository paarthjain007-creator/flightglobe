import React, { useEffect, Suspense } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import NavBar from "./components/NavBar";
import Footer from "./components/Footer";
import Explore from "./pages/Explore";
import BookingPage from "./pages/BookingPage";
import Dashboard from "./pages/Dashboard";
import Copilot from "./pages/Copilot";
import Passport from "./pages/Passport";
import RadarPage from "./pages/RadarPage";
import OfflineToast from "./components/ui/OfflineToast";
import NimbusCopilot from "./components/ai/NimbusCopilot";
import { ErrorBoundary } from "./components/ui/ErrorBoundary";
import { useStore } from "./store/useStore";

// Simple page-level loading fallback
function PageLoadingFallback() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center" aria-live="polite" aria-label="Loading page">
      <div className="flex flex-col items-center gap-4">
        <div className="w-12 h-12 rounded-full border-2 border-cyan-400 border-t-transparent animate-spin" />
        <p className="text-xs text-slate-400 font-mono">Loading FlightGlobe module…</p>
      </div>
    </div>
  );
}

export default function App() {
  const theme = useStore((s) => s.theme);

  // Sync persisted theme to DOM on initial load
  useEffect(() => {
    document.documentElement.setAttribute(
      "data-theme",
      theme === "space" ? "" : theme
    );
  }, [theme]);

  return (
    // Outermost boundary: catches catastrophic layout crashes
    <ErrorBoundary
      title="FlightGlobe Encountered a Critical Error"
      message="The main application shell crashed. Please refresh the page to restore flight services."
    >
      <div className="min-h-screen flex flex-col justify-between" style={{ background: "var(--bg-primary)" }}>
        <NavBar />
        
        <main className="flex-1">
          <Routes>
            <Route path="/" element={<Navigate to="/explore" replace />} />

            <Route
              path="/explore"
              element={
                <ErrorBoundary title="3D Globe Renderer Crashed" message="The Three.js WebGL context failed. Try switching themes or refreshing.">
                  <Suspense fallback={<PageLoadingFallback />}>
                    <Explore />
                  </Suspense>
                </ErrorBoundary>
              }
            />

            <Route
              path="/booking"
              element={
                <ErrorBoundary title="GDS Booking Engine Error" message="The flight search engine encountered an API error. Check your network and try again.">
                  <Suspense fallback={<PageLoadingFallback />}>
                    <BookingPage />
                  </Suspense>
                </ErrorBoundary>
              }
            />

            <Route
              path="/radar"
              element={
                <ErrorBoundary title="Live Radar Module Error" message="The ADS-B radar feed failed to initialize.">
                  <Suspense fallback={<PageLoadingFallback />}>
                    <RadarPage />
                  </Suspense>
                </ErrorBoundary>
              }
            />

            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/copilot"   element={<Copilot />} />
            <Route path="/passport"  element={<Passport />} />
            {/* Fallback */}
            <Route path="*" element={<Navigate to="/explore" replace />} />
          </Routes>
        </main>

        {/* Global Omnipresent AI Assistant: Nimbus ☁️ */}
        <ErrorBoundary title="Nimbus AI Offline" message="The AI assistant encountered an error and has been temporarily disabled.">
          <NimbusCopilot />
        </ErrorBoundary>

        {/* Global Launch Footer */}
        <Footer />

        {/* Global Offline Mode Toast Indicator */}
        <OfflineToast />
      </div>
    </ErrorBoundary>
  );
}


