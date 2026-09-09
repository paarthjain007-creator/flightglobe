import React, { useState, useEffect, useRef, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search, Globe2, Radio, LayoutDashboard, Sparkles, Ticket, Plane,
  Eye, Wind, CloudRain, Sun, Moon, Box, Users, Zap,
  Coins, ArrowRight, CornerDownLeft, X, MapPin, AlertTriangle
} from "lucide-react";
import { useStore } from "../../store/useStore";
import { sound } from "../../utils/soundFx";
import { AIRPORTS } from "../../data/airports";

export default function CommandPalette({ isOpen, onClose }) {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [activeIndex, setActiveIndex] = useState(0);
  const inputRef = useRef(null);
  const listRef = useRef(null);
  const selectedItemRef = useRef(null);

  // Store actions & state
  const theme = useStore((s) => s.theme);
  const setTheme = useStore((s) => s.setTheme);
  const currency = useStore((s) => s.currency);
  const setCurrency = useStore((s) => s.setCurrency);
  const showDayNight = useStore((s) => s.showDayNight);
  const setShowDayNight = useStore((s) => s.setShowDayNight);
  const activeOverlayLayer = useStore((s) => s.activeOverlayLayer);
  const setActiveOverlayLayer = useStore((s) => s.setActiveOverlayLayer);
  const setSearchOrigin = useStore((s) => s.setSearchOrigin);
  const setSearchDestination = useStore((s) => s.setSearchDestination);
  const setWaypoints = useStore((s) => s.setWaypoints);
  const setSpatialCommand = useStore((s) => s.setSpatialCommand);
  const atcRadioEnabled = useStore((s) => s.atcRadioEnabled);
  const setAtcRadioEnabled = useStore((s) => s.setAtcRadioEnabled);
  const setEmergencyAlert = useStore((s) => s.setEmergencyAlert);

  // Focus input when opened
  useEffect(() => {
    if (isOpen) {
      setQuery("");
      setActiveIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  // Global ESC and arrow navigation
  useEffect(() => {
    if (!isOpen) return;
    function handleKeyDown(e) {
      if (e.key === "Escape") {
        onClose();
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  // Build command items
  const items = useMemo(() => {
    const q = query.trim().toLowerCase();

    const staticItems = [
      // Navigation
      {
        id: "nav-explore",
        title: "Explore 3D Master Globe",
        category: "Navigation",
        icon: Globe2,
        color: "#00F2FE",
        action: () => { navigate("/explore"); onClose(); },
      },
      {
        id: "nav-booking",
        title: "Search & Book Flights (GDS Engine)",
        category: "Navigation",
        icon: Plane,
        color: "#38BDF8",
        action: () => { navigate("/booking"); onClose(); },
      },
      {
        id: "nav-radar",
        title: "Tactical Live Radar HUD",
        category: "Navigation",
        icon: Radio,
        color: "#00FFA3",
        action: () => { navigate("/radar"); onClose(); },
      },
      {
        id: "nav-dashboard",
        title: "Analytics Bento Grid & Delay Engine",
        category: "Navigation",
        icon: LayoutDashboard,
        color: "#A78BFA",
        action: () => { navigate("/dashboard"); onClose(); },
      },
      {
        id: "nav-copilot",
        title: "Nimbus AI Copilot Console",
        category: "Navigation",
        icon: Sparkles,
        color: "#B800FF",
        action: () => { navigate("/copilot"); onClose(); },
      },
      {
        id: "nav-passport",
        title: "My Passes & Holographic Stamps",
        category: "Navigation",
        icon: Ticket,
        color: "#FBBF24",
        action: () => { navigate("/passport"); onClose(); },
      },

      // Flight Deck Spatial Actions
      {
        id: "action-cockpit",
        title: "Toggle First-Person Cockpit POV",
        category: "Flight Deck",
        icon: Eye,
        color: "#00F2FE",
        action: () => {
          navigate("/explore");
          setSpatialCommand({ action: "TRIGGER_COCKPIT_VIEW", _cockpitTrigger: true, timestamp: Date.now() });
          onClose();
        },
      },
      {
        id: "action-jetstream",
        title: "Toggle Global Jetstream Wind Streamlines",
        category: "Flight Deck",
        icon: Wind,
        color: "#00FFA3",
        action: () => {
          navigate("/explore");
          setSpatialCommand({ action: "TOGGLE_JETSTREAM", _jetstreamTrigger: true, timestamp: Date.now() });
          onClose();
        },
      },
      {
        id: "action-weather",
        title: "Toggle Live Doppler Weather Radar Overlay",
        category: "Flight Deck",
        icon: CloudRain,
        color: "#38BDF8",
        action: () => {
          navigate("/explore");
          setActiveOverlayLayer(activeOverlayLayer === "weather" ? "none" : "weather");
          onClose();
        },
      },
      {
        id: "action-daynight",
        title: `Switch to ${showDayNight ? "Night Mode" : "Daylight Solar View"}`,
        category: "Flight Deck",
        icon: showDayNight ? Moon : Sun,
        color: "#FBBF24",
        action: () => {
          setShowDayNight(!showDayNight);
          onClose();
        },
      },
      {
        id: "action-ar",
        title: "Launch WebXR Spatial Hologram Mode",
        category: "Flight Deck",
        icon: Box,
        color: "#B800FF",
        action: () => {
          navigate("/explore");
          setSpatialCommand({ action: "TRIGGER_AR_MODE", _arTrigger: true, timestamp: Date.now() });
          onClose();
        },
      },
      {
        id: "action-atc",
        title: `Toggle VHF ATC Tower Comms (${atcRadioEnabled ? "Currently ON" : "Currently OFF"})`,
        category: "Telemetry & Audio",
        icon: Radio,
        color: "#00F2FE",
        badge: atcRadioEnabled ? "LIVE" : null,
        action: () => {
          setAtcRadioEnabled(!atcRadioEnabled);
          onClose();
        },
      },
      {
        id: "action-squawk7700",
        title: "Simulate Transponder Squawk 7700 Emergency Alert",
        category: "Telemetry & Audio",
        icon: AlertTriangle,
        color: "#FF3B69",
        badge: "ALERT",
        action: () => {
          setEmergencyAlert({
            squawk: "7700",
            callsign: "DL-442",
            type: "B777-200",
            reason: "CABIN DEPRESSURIZATION",
            descentRate: "-2,800 FPM",
            altitude: 14500,
            lat: 48.2,
            lng: -24.5,
          });
          onClose();
        },
      },

      // Themes
      ...["space", "holodeck", "synthwave", "atmosphera", "cyberpunk", "sunset", "daylight"].map((t) => ({
        id: `theme-${t}`,
        title: `Theme: ${t.toUpperCase()}`,
        category: "Themes",
        icon: Zap,
        color: t === theme ? "#00FFA3" : "#94A3B8",
        badge: t === theme ? "ACTIVE" : null,
        action: () => {
          setTheme(t);
          document.documentElement.setAttribute("data-theme", t);
          onClose();
        },
      })),

      // Currencies
      ...["USD", "EUR", "GBP", "INR", "AED", "JPY"].map((c) => ({
        id: `curr-${c}`,
        title: `Currency: ${c}`,
        category: "Currencies",
        icon: Coins,
        color: c === currency ? "#FBBF24" : "#94A3B8",
        badge: c === currency ? "ACTIVE" : null,
        action: () => {
          setCurrency(c);
          onClose();
        },
      })),
    ];

    // Airport searches
    const matchingAirports = AIRPORTS.filter(
      (a) =>
        a.iata.toLowerCase().includes(q) ||
        a.city.toLowerCase().includes(q) ||
        a.name.toLowerCase().includes(q)
    ).slice(0, 5).map((a) => ({
      id: `airport-${a.iata}`,
      title: `${a.iata} — ${a.city} (${a.name})`,
      category: "Airports & Hubs",
      icon: MapPin,
      color: "#00F2FE",
      action: () => {
        setSearchDestination(a);
        setWaypoints([AIRPORTS[0], a]);
        navigate("/explore");
        onClose();
      },
    }));

    const combined = [...matchingAirports, ...staticItems];

    if (!q) return combined.slice(0, 15);

    return combined.filter(
      (item) =>
        item.title.toLowerCase().includes(q) ||
        item.category.toLowerCase().includes(q)
    );
  }, [query, theme, currency, showDayNight, activeOverlayLayer, navigate, onClose, setTheme, setCurrency, setShowDayNight, setActiveOverlayLayer, setSearchDestination, setWaypoints, setSpatialCommand]);

  // Clamp activeIndex
  useEffect(() => {
    setActiveIndex(0);
  }, [items]);

  useEffect(() => {
    selectedItemRef.current?.scrollIntoView({ block: "nearest" });
  }, [activeIndex]);

  const handleSelect = (item) => {
    sound.playClick();
    sound.haptic([10]);
    item.action();
  };

  const handleKeyDown = (e) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((prev) => (prev + 1) % Math.max(1, items.length));
      sound.haptic([5]);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((prev) => (prev - 1 + items.length) % Math.max(1, items.length));
      sound.haptic([5]);
    } else if (e.key === "Enter" && items[activeIndex]) {
      e.preventDefault();
      handleSelect(items[activeIndex]);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[300] flex items-start justify-center pt-10 sm:pt-24 px-3 sm:px-4"
      style={{ background: "rgba(4, 6, 12, 0.82)", backdropFilter: "blur(24px)" }}
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: -16 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: -16 }}
        transition={{ duration: 0.16 }}
        className="border-beam-card w-full max-w-xl rounded-3xl overflow-hidden shadow-2xl flex flex-col pointer-events-auto"
        style={{
          background: "rgba(9, 13, 23, 0.98)",
          border: "1px solid rgba(0, 242, 254, 0.25)",
          boxShadow: "0 0 50px rgba(0, 242, 254, 0.12), inset 0 1px 1px rgba(255, 255, 255, 0.10)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top luminous accent bar */}
        <div className="h-0.5 w-full" style={{ background: "linear-gradient(90deg, #00F2FE, #7928CA, #00FFA3)" }} />

        {/* Search Input Bar */}
        <div className="flex items-center gap-3 px-5 py-3.5 border-b border-white/10">
          <Search size={18} className="text-cyan-400 flex-shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type a command, airport (JFK, HND), or page..."
            className="flex-1 bg-transparent text-base sm:text-sm text-white placeholder-slate-500 outline-none mono font-medium"
          />
          {query && (
            <button
              type="button"
              onClick={() => setQuery("")}
              className="p-1 rounded-md text-slate-500 hover:text-white cursor-pointer"
            >
              <X size={14} />
            </button>
          )}
          <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[10px] mono text-slate-400 bg-white/5 border border-white/10">
            <span>ESC</span>
          </div>
        </div>

        {/* Results List */}
        <div
          ref={listRef}
          className="max-h-[380px] overflow-y-auto p-2 space-y-1 custom-scrollbar"
        >
          {items.length === 0 ? (
            <div className="p-8 text-center text-slate-500 mono text-xs">
              No matching aerospace commands or airports found for "{query}".
            </div>
          ) : (
            items.map((item, index) => {
              const Icon = item.icon;
              const isSelected = index === activeIndex;
              return (
                <button
                  key={item.id}
                  ref={isSelected ? selectedItemRef : null}
                  type="button"
                  onClick={() => handleSelect(item)}
                  onMouseEnter={() => setActiveIndex(index)}
                  className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-2xl cursor-pointer transition-all text-left"
                  style={{
                    background: isSelected ? "rgba(0, 242, 254, 0.10)" : "transparent",
                    border: isSelected ? "1px solid rgba(0, 242, 254, 0.35)" : "1px solid transparent",
                    boxShadow: isSelected ? "0 0 16px rgba(0, 242, 254, 0.10)" : "none",
                  }}
                >
                  <div
                    className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{
                      background: isSelected ? "rgba(0, 242, 254, 0.20)" : "rgba(255, 255, 255, 0.05)",
                      border: `1px solid ${isSelected ? "rgba(0, 242, 254, 0.40)" : "rgba(255, 255, 255, 0.08)"}`,
                    }}
                  >
                    <Icon size={14} style={{ color: item.color }} />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-semibold text-white truncate flex items-center gap-2">
                      <span>{item.title}</span>
                      {item.badge && (
                        <span
                          className="mono text-[8px] font-bold px-1.5 py-0.5 rounded"
                          style={{ background: "rgba(0, 255, 163, 0.15)", color: "#00FFA3", border: "1px solid rgba(0, 255, 163, 0.3)" }}
                        >
                          {item.badge}
                        </span>
                      )}
                    </div>
                    <div className="mono text-[9px] text-slate-400 mt-0.5">
                      {item.category}
                    </div>
                  </div>

                  {isSelected && (
                    <div className="flex items-center gap-1 text-[10px] mono text-cyan-400 flex-shrink-0">
                      <span>SELECT</span>
                      <CornerDownLeft size={10} />
                    </div>
                  )}
                </button>
              );
            })
          )}
        </div>

        {/* Footer info */}
        <div className="px-5 py-2.5 border-t border-white/10 flex items-center justify-between text-[10px] mono text-slate-500 bg-white/[0.02]">
          <div className="flex items-center gap-3">
            <span>↑↓ Navigate</span>
            <span>↵ Execute</span>
            <span>ESC Close</span>
          </div>
          <div className="flex items-center gap-1.5 text-cyan-400/80">
            <Zap size={11} />
            <span>FLIGHTGLOBE COMMAND ENGINE</span>
          </div>
        </div>
      </motion.div>
    </div>
  );
}