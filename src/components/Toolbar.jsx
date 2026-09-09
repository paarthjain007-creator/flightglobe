import React from "react";
import { Globe2, RotateCcw, BookOpen } from "lucide-react";
import ThemeSelector from "./ui/ThemeSelector";

export default function Toolbar({ activeTheme, onThemeChange, onResetGlobe, onOpenPassport, stampCount }) {
  return (
    <header
      className="absolute top-4 left-1/2 -translate-x-1/2 z-40 glass rounded-2xl px-4 py-2.5 flex items-center gap-4 animate-slide-up"
      style={{ width: "fit-content", maxWidth: "calc(100vw - 2rem)" }}
    >
      {/* Brand */}
      <div className="flex items-center gap-2 flex-shrink-0">
        <div
          className="w-7 h-7 rounded-lg flex items-center justify-center"
          style={{ background: "rgba(0, 242, 254, 0.12)", border: "1px solid rgba(0, 242, 254, 0.25)" }}
        >
          <Globe2 size={14} style={{ color: "#00F2FE" }} />
        </div>
        <span className="text-sm font-bold tracking-tight" style={{ color: "#F8FAFC" }}>
          Flight<span style={{ color: "#00F2FE" }}>Globe</span>
        </span>
      </div>

      <div className="w-px h-5 opacity-30" style={{ background: "rgba(255, 255, 255, 0.1)" }} />

      {/* Theme Switcher */}
      <ThemeSelector activeTheme={activeTheme} onThemeChange={onThemeChange} />

      <div className="w-px h-5 opacity-30" style={{ background: "rgba(255, 255, 255, 0.1)" }} />

      {/* Globe Controls */}
      <div className="flex items-center gap-1.5">
        <button
          id="globe-reset-btn"
          onClick={onResetGlobe}
          className="p-1.5 rounded-lg transition-all cursor-pointer hover:opacity-80 active:scale-95"
          style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255, 255, 255, 0.1)", color: "#94A3B8" }}
          title="Reset globe"
        >
          <RotateCcw size={12} />
        </button>

        {/* Passport Button */}
        <button
          id="passport-open-btn"
          onClick={onOpenPassport}
          className="relative flex items-center gap-1.5 p-1.5 rounded-lg transition-all cursor-pointer hover:opacity-90 active:scale-95"
          style={{ background: "rgba(0, 242, 254, 0.12)", border: "1px solid rgba(0, 242, 254, 0.25)", color: "#00F2FE" }}
          title="Open Digital Passport"
        >
          <BookOpen size={12} />
          <span className="text-xs font-medium hidden sm:inline">Passport</span>
          {stampCount > 0 && (
            <span
              className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full flex items-center justify-center text-xs font-bold"
              style={{ background: "#00F2FE", color: "#040508", fontSize: "9px" }}
            >
              {stampCount > 9 ? "9+" : stampCount}
            </span>
          )}
        </button>
      </div>

      {/* Live indicator */}
      <div className="flex items-center gap-1.5 flex-shrink-0">
        <div className="w-1.5 h-1.5 rounded-full pulse-dot" style={{ background: "#4ade80" }} />
        <span className="text-xs hidden sm:block text-slate-400">Live</span>
      </div>
    </header>
  );
}
