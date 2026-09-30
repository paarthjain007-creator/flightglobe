import React, { useState, useRef, useEffect } from "react";
import {
  Palette, Moon, Zap, Sun, Cpu, Radio, Sparkles, ChevronDown, Check,
} from "lucide-react";

const THEMES = [
  {
    id: "space",
    label: "Deep Space",
    description: "Midnight blue cosmos",
    icon: Moon,
    dot: "#60a5fa",
    gradient: "from-blue-950 to-slate-950",
  },
  {
    id: "holodeck",
    label: "Holo-Deck",
    description: "Neon cyan holographic",
    icon: Cpu,
    dot: "#00f0ff",
    gradient: "from-cyan-950 to-teal-950",
  },
  {
    id: "synthwave",
    label: "Synthwave",
    description: "Retro pink & magenta",
    icon: Radio,
    dot: "#ff2a85",
    gradient: "from-pink-950 to-purple-950",
  },
  {
    id: "atmosphera",
    label: "Atmosphera",
    description: "Arctic sky blue tones",
    icon: Sparkles,
    dot: "#a5f3fc",
    gradient: "from-sky-950 to-cyan-950",
  },
  {
    id: "cyberpunk",
    label: "Cyberpunk",
    description: "Purple neon city glow",
    icon: Zap,
    dot: "#c084fc",
    gradient: "from-purple-950 to-violet-950",
  },
  {
    id: "sunset",
    label: "Sunset",
    description: "Warm amber & orange",
    icon: Sun,
    dot: "#fb923c",
    gradient: "from-orange-950 to-amber-950",
  },
  {
    id: "daylight",
    label: "Daylight",
    description: "High-contrast light mode",
    icon: Sun,
    dot: "#2563eb",
    gradient: "from-sky-100 to-blue-200",
  },
];

export default function ThemeSelector({ activeTheme, onThemeChange }) {
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef(null);

  const activeThemeData = THEMES.find((t) => t.id === activeTheme) || THEMES[0];
  const ActiveIcon = activeThemeData.icon;

  // Close on outside click
  useEffect(() => {
    function handleClick(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  return (
    <div ref={dropdownRef} className="relative" id="theme-selector-dropdown">
      {/* Trigger Button */}
      <button
        id="theme-dropdown-trigger"
        type="button"
        aria-label="Toggle Atmosphere visual theme selector"
        onClick={() => setOpen((prev) => !prev)}
        className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer border"
        style={{
          background: "rgba(255, 255, 255, 0.06)",
          borderColor: "rgba(255, 255, 255, 0.12)",
          color: "#f5f5f7",
          backdropFilter: "blur(20px)",
        }}
        title="Toggle Atmosphere Visual Theme"
      >
        <Palette size={13} className="text-[#2997ff]" />
        <span className="font-bold hidden xl:inline text-[#86868b]">Atmosphere:</span>
        <span
          className="w-2 h-2 rounded-full flex-shrink-0"
          style={{ background: activeThemeData.dot }}
        />
        <span className="hidden sm:inline font-medium text-slate-200">{activeThemeData.label}</span>
        <ChevronDown
          size={12}
          className={`transition-transform duration-200 text-[#86868b] ${open ? "rotate-180" : ""}`}
        />
      </button>

      {/* Dropdown Panel */}
      {open && (
        <div
          className="absolute right-0 top-full mt-2 w-56 z-[100] rounded-2xl shadow-2xl border overflow-hidden animate-slide-up"
          style={{
            background: "rgba(22, 22, 24, 0.96)",
            borderColor: "rgba(255, 255, 255, 0.12)",
            backdropFilter: "blur(24px)",
            boxShadow: "0 20px 50px rgba(0, 0, 0, 0.7)",
          }}
        >
          {/* Header */}
          <div className="px-4 py-2.5 border-b flex items-center gap-2" style={{ borderColor: "rgba(255, 255, 255, 0.08)" }}>
            <Palette size={13} style={{ color: "#2997ff" }} />
            <span className="text-xs font-bold text-[#86868b]">
              Visual Themes
            </span>
          </div>

          {/* Theme Options */}
          <div className="py-1.5">
            {THEMES.map((t) => {
              const Icon = t.icon;
              const isActive = activeTheme === t.id;
              return (
                <button
                  key={t.id}
                  id={`theme-btn-${t.id}`}
                  onClick={() => {
                    onThemeChange(t.id);
                    setOpen(false);
                  }}
                  className="w-full flex items-center gap-3 px-4 py-2.5 text-left transition-all cursor-pointer group"
                  style={{
                    background: isActive ? "rgba(41, 151, 255, 0.12)" : "transparent",
                  }}
                  onMouseEnter={(e) => {
                    if (!isActive) e.currentTarget.style.background = "rgba(255,255,255,0.05)";
                  }}
                  onMouseLeave={(e) => {
                    if (!isActive) e.currentTarget.style.background = "transparent";
                  }}
                >
                  {/* Color Swatch */}
                  <span
                    className="w-3 h-3 rounded-full flex-shrink-0 shadow-sm"
                    style={{
                      background: t.dot,
                      boxShadow: isActive ? `0 0 6px ${t.dot}` : "none",
                    }}
                  />
                  {/* Icon */}
                  <Icon size={13} style={{ color: isActive ? "#2997ff" : "#86868b", flexShrink: 0 }} />
                  {/* Labels */}
                  <div className="flex-1 min-w-0">
                    <div
                      className="text-xs font-bold leading-tight"
                      style={{ color: isActive ? "#2997ff" : "#F8FAFC" }}
                    >
                      {t.label}
                    </div>
                    <div className="text-[10px] leading-tight text-[#86868b]">
                      {t.description}
                    </div>
                  </div>
                  {/* Active Check */}
                  {isActive && (
                    <Check size={13} style={{ color: "#2997ff", flexShrink: 0 }} />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
