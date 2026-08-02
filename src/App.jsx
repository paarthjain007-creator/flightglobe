import React, { useEffect } from "react";
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
import GlobalCopilotFloatingWidget from "./components/ai/GlobalCopilotFloatingWidget";
import { useStore } from "./store/useStore";

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
    <div className="min-h-screen flex flex-col justify-between" style={{ background: "var(--bg-primary)" }}>
      <NavBar />
      
      <main className="flex-1">
        <Routes>
          <Route path="/" element={<Navigate to="/explore" replace />} />
          <Route path="/explore" element={<Explore />} />
          <Route path="/booking" element={<BookingPage />} />
          <Route path="/radar"   element={<RadarPage />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/copilot" element={<Copilot />} />
          <Route path="/passport" element={<Passport />} />
          {/* Fallback */}
          <Route path="*" element={<Navigate to="/explore" replace />} />
        </Routes>
      </main>

      {/* Global Omnipresent AI Copilot Floating Widget */}
      <GlobalCopilotFloatingWidget />

      {/* Global Launch Footer */}
      <Footer />

      {/* Global Offline Mode Toast Indicator */}
      <OfflineToast />
    </div>
  );
}
