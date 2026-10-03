import React, { useState, useEffect, useRef } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Globe2, Radio, Compass, LayoutDashboard, Sparkles, Ticket, Plane,
  Volume2, VolumeX, User, Settings, ChevronDown, Menu, X, Search, BatteryCharging, Battery
} from "lucide-react";
import ThemeSelector from "./ui/ThemeSelector";
import VolumeControl from "./ui/VolumeControl";
import { useStore } from "../store/useStore";
import { sound } from "../utils/soundFx";

const CURRENCIES = ["USD", "EUR", "GBP", "INR", "AED", "JPY"];

const NAV_TABS = [
  { path: "/explore",   label: "Explore 3D",     icon: Compass },
  { path: "/booking",   label: "Book Flights",   icon: Plane },
  { path: "/radar",     label: "Live Radar",     icon: Radio,    badge: "LIVE" },
  { path: "/copilot",   label: "AI Copilot",     icon: Sparkles, badge: "AI" },
  { path: "/passport",  label: "My Passes",      icon: Ticket },
];

function UtcClock() {
  const [time, setTime] = useState("");
  useEffect(() => {
    function tick() {
      const d = new Date();
      setTime(
        d.toUTCString().split(" ")[4] + " UTC"
      );
    }
    tick();
    const t = setInterval(tick, 1000);
    return () => clearInterval(t);
  }, []);
  return (
    <span className="font-mono text-xs text-slate-300 tracking-wider">
      {time}
    </span>
  );
}

export default function NavBar({ onOpenCommandPalette }) {
  const navigate        = useNavigate();
  const theme           = useStore((s) => s.theme);
  const setTheme        = useStore((s) => s.setTheme);
  const trips           = useStore((s) => s.trips || []);
  const currency        = useStore((s) => s.currency || "USD");
  const setCurrency     = useStore((s) => s.setCurrency);
  const soundEnabled    = useStore((s) => s.soundEnabled ?? true);
  const setSoundEnabled = useStore((s) => s.setSoundEnabled);

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  function handleThemeChange(t) {
    setTheme(t);
    document.documentElement.setAttribute("data-theme", t);
  }

  function handleCycleCurrency() {
    sound.playClick();
    const nextIdx = (CURRENCIES.indexOf(currency) + 1) % CURRENCIES.length;
    setCurrency(CURRENCIES[nextIdx]);
  }

  return (
    <header
      className="fixed top-0 inset-x-0 z-[160] px-3 sm:px-6 py-2.5 sm:py-3 pointer-events-none"
    >
      <div
        className="flex items-center justify-between h-14 px-3 sm:px-5 rounded-2xl glass-prism pointer-events-auto"
        style={{
          background: "rgba(18, 18, 20, 0.82)",
          backdropFilter: "blur(28px) saturate(180%)",
          WebkitBackdropFilter: "blur(28px) saturate(180%)",
          border: "1px solid rgba(255, 255, 255, 0.10)",
          boxShadow: "0 8px 32px rgba(0, 0, 0, 0.5)",
        }}
      >

        {/* ── Brand Logotype ──────────────────────────────────────────── */}
        <NavLink
          to="/explore"
          className="flex items-center gap-2.5 flex-shrink-0 group cursor-pointer"
          style={{ textDecoration: "none" }}
        >
          {/* Pulsing beacon + globe icon */}
          <div className="relative flex-shrink-0">
            <div
              className="w-8 h-8 rounded-xl flex items-center justify-center bg-white/[0.06] border border-white/10 text-white"
            >
              <Globe2 size={16} className="text-[#2997ff]" />
            </div>
            <span
              className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full beacon"
              style={{ background: "#30d158", boxShadow: "0 0 6px rgba(48, 209, 88, 0.4)" }}
            />
          </div>

          <div className="flex flex-col leading-tight">
            <span className="text-sm sm:text-base font-bold tracking-tight text-[#f5f5f7]">
              Flight<span className="text-[#2997ff]">Globe</span>
            </span>
            <span className="text-[9px] font-medium text-[#86868b] tracking-wide hidden sm:inline">
              Live GDS Network
            </span>
          </div>
        </NavLink>

        {/* ── Segmented Glass Pill Nav with Kinetic Sliding Indicator ────────────────────────────────── */}
        <nav
          className="hidden md:flex items-center gap-0.5 lg:gap-1 rounded-2xl p-1 relative bg-white/[0.03] border border-white/8"
        >
          {NAV_TABS.map(({ path, label, icon: Icon, badge }) => (
            <NavLink
              key={path}
              to={path}
              onClick={() => sound.playClick()}
              style={{ textDecoration: "none" }}
              className={({ isActive }) =>
                `relative flex items-center gap-1.5 lg:gap-2 px-2.5 py-1 md:px-2.5 lg:px-3.5 md:py-1 lg:py-1.5 rounded-xl transition-colors duration-200 cursor-pointer ${
                  isActive ? "text-white font-medium" : "text-[#86868b] hover:text-white font-medium"
                }`
              }
            >
              {({ isActive }) => (
                <>
                  {/* Sliding Luminous Frosted Glass Capsule */}
                  {isActive && (
                    <motion.span
                      layoutId="activeNavTab"
                      transition={{ type: "spring", stiffness: 450, damping: 32 }}
                      className="absolute inset-0 rounded-xl"
                      style={{
                        background: "rgba(255, 255, 255, 0.10)",
                        border: "1px solid rgba(255, 255, 255, 0.18)",
                        boxShadow: "0 2px 10px rgba(0, 0, 0, 0.3)",
                        backdropFilter: "blur(12px)",
                      }}
                    />
                  )}
                  <Icon
                    size={14}
                    className="relative z-10 flex-shrink-0 transition-transform duration-200 group-hover:scale-110"
                    color={isActive ? "#2997ff" : "#86868b"}
                  />
                  <span
                    className="text-[11px] lg:text-[13px] relative z-10 whitespace-nowrap"
                    style={{
                      color: isActive ? "#ffffff" : "#86868b",
                    }}
                  >
                    {label}
                  </span>
                  {badge && (
                    <span
                      className="relative z-10 text-[8px] lg:text-[9px] font-bold px-1 lg:px-1.5 py-0.5 rounded-full shadow-sm"
                      style={{
                        background: badge === "LIVE" ? "rgba(48, 209, 88, 0.12)" : badge === "AI" ? "rgba(191, 90, 242, 0.12)" : "rgba(41, 151, 255, 0.12)",
                        border: `1px solid ${badge === "LIVE" ? "rgba(48, 209, 88, 0.25)" : badge === "AI" ? "rgba(191, 90, 242, 0.25)" : "rgba(41, 151, 255, 0.25)"}`,
                        color: badge === "LIVE" ? "#30d158" : badge === "AI" ? "#bf5af2" : "#2997ff",
                      }}
                    >
                      {badge}
                    </span>
                  )}
                  {path === "/passport" && trips.length > 0 && (
                    <span
                      className="relative z-10 text-[8px] lg:text-[9px] font-bold px-1.5 rounded-full shadow-md bg-white/20 text-white"
                    >
                      {trips.length}
                    </span>
                  )}
                </>
              )}
            </NavLink>
          ))}
        </nav>

        {/* ── Right Controls ──────────────────────────────────────────── */}
        <div className="flex items-center gap-1.5 sm:gap-2.5">
          {/* Quick Command Palette Trigger (Cmd+K) */}
          <button
            type="button"
            onClick={() => { sound.playClick(); onOpenCommandPalette?.(); }}
            className="hidden md:flex items-center gap-1.5 lg:gap-2 px-2.5 py-1.5 lg:px-3 rounded-xl transition-all cursor-pointer bg-white/[0.04] border border-white/10 hover:border-white/20 hover:bg-white/[0.08]"
            title="Search flights, routes, or commands (Ctrl+K)"
          >
            <Search size={13} className="text-[#2997ff]" />
            <span className="text-xs text-[#86868b] font-medium hidden xl:inline">Search</span>
            <kbd className="text-[10px] px-1.5 py-0.5 rounded bg-white/10 text-[#86868b] font-mono border border-white/10">
              ⌘K
            </kbd>
          </button>

          {/* UTC Clock (hidden on smaller displays, visible on wide desktop) */}
          <div className="hidden xl:block px-2 py-1 rounded-lg bg-white/[0.04] border border-white/8">
            <UtcClock />
          </div>

          {/* Currency/Language button */}
          <button
            type="button"
            onClick={handleCycleCurrency}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl cursor-pointer transition-all bg-white/[0.04] border border-white/10 hover:bg-white/[0.08] hover:border-white/20"
            title="Switch active currency"
          >
            <span className="text-sm">🇺🇸</span>
            <span className="text-[11px] font-semibold text-[#f5f5f7] tracking-wide">{currency}</span>
            <ChevronDown size={11} className="text-[#86868b] ml-0.5" />
          </button>

          {/* Volume Control */}
          <VolumeControl />

          {/* Theme */}
          <ThemeSelector activeTheme={theme} onThemeChange={handleThemeChange} />

          {/* Lite Mode Toggle */}
          <button
            type="button"
            onClick={() => {
              sound.playClick();
              setIsLiteMode(!isLiteMode);
            }}
            title={isLiteMode ? "Lite Mode Active (Fast 2D)" : "Immersive Mode Active (WebGL 3D)"}
            className={`hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all cursor-pointer border ${
              isLiteMode
                ? "bg-emerald-500/20 text-emerald-300 border-emerald-400/50 shadow-[0_0_10px_rgba(52,211,153,0.2)]"
                : "bg-white/5 text-slate-400 hover:text-white border-white/10 hover:border-white/20"
            }`}
          >
            {isLiteMode ? <BatteryCharging size={13} /> : <Battery size={13} />}
            <span>{isLiteMode ? "Lite" : "3D"}</span>
          </button>

          {/* Profile beacon */}
          <button
            type="button"
            onClick={() => { sound.playClick(); navigate("/passport"); }}
            className="hidden sm:flex w-8 h-8 rounded-xl items-center justify-center cursor-pointer bg-white/[0.04] border border-white/10 hover:border-white/20 hover:bg-white/[0.08] transition-all text-[#86868b] hover:text-white"
            title="My Passes & Digital Credentials"
          >
            <User size={14} />
          </button>

          {/* Mobile hamburger toggle (< md) */}
          <button
            type="button"
            onClick={() => { sound.playClick(); setMobileMenuOpen(!mobileMenuOpen); }}
            className="md:hidden p-2 rounded-xl cursor-pointer transition-colors bg-white/[0.04] border border-white/10 text-[#86868b] hover:text-white"
            title="Toggle Navigation Menu"
          >
            {mobileMenuOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>
      </div>

      {/* ── Mobile Navigation Drawer ────────────────────────────────── */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.98 }}
            transition={{ duration: 0.18 }}
            className="md:hidden mt-2 p-3 rounded-2xl space-y-1 pointer-events-auto"
            style={{
              background: "rgba(18, 18, 20, 0.96)",
              backdropFilter: "blur(32px)",
              WebkitBackdropFilter: "blur(32px)",
              border: "1px solid rgba(255, 255, 255, 0.12)",
              boxShadow: "0 24px 60px rgba(0,0,0,0.8), inset 0 1px 1.5px rgba(255,255,255,0.1)",
            }}
          >
            {NAV_TABS.map(({ path, label, icon: Icon, badge }) => (
              <NavLink
                key={path}
                to={path}
                onClick={() => { sound.playClick(); setMobileMenuOpen(false); }}
                className={({ isActive }) =>
                  `flex items-center justify-between px-4 py-3 rounded-xl transition-all cursor-pointer ${
                    isActive
                      ? "bg-cyan-500/15 border border-cyan-400/40 text-cyan-300 font-bold"
                      : "text-slate-300 hover:bg-white/5 hover:text-white"
                  }`
                }
              >
                <div className="flex items-center gap-3">
                  <Icon size={17} />
                  <span className="text-sm font-medium">{label}</span>
                </div>
                {badge && (
                  <span
                    className="text-[9px] font-semibold px-2 py-0.5 rounded-full"
                    style={{
                      background: badge === "LIVE" ? "rgba(48, 209, 88, 0.12)" : "rgba(191, 90, 242, 0.12)",
                      border: `1px solid ${badge === "LIVE" ? "rgba(48, 209, 88, 0.25)" : "rgba(191, 90, 242, 0.25)"}`,
                      color: badge === "LIVE" ? "#30d158" : "#bf5af2",
                    }}
                  >
                    {badge}
                  </span>
                )}
                {path === "/passport" && trips.length > 0 && (
                  <span
                    className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-[#0071e3] text-white"
                  >
                    {trips.length}
                  </span>
                )}
              </NavLink>
            ))}

            {/* Mobile Command Center trigger */}
            <button
              type="button"
              onClick={() => {
                sound.playClick();
                setMobileMenuOpen(false);
                onOpenCommandPalette?.();
              }}
              className="w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all cursor-pointer text-cyan-300 hover:bg-cyan-500/10 border border-cyan-400/20"
            >
              <div className="flex items-center gap-3">
                <Search size={16} className="text-cyan-400" />
                <span className="text-sm font-medium">Search Flights & Commands</span>
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-white/10 text-cyan-300 border border-white/10">
                ⌘K
              </span>
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}

