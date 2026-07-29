import React, { useState } from "react";
import { NavLink } from "react-router-dom";
import { Globe2, LayoutDashboard, BookOpen, Sparkles, Volume2, VolumeX, Plane, Radio, Menu, X } from "lucide-react";
import ThemeSelector from "./ui/ThemeSelector";
import { useStore } from "../store/useStore";

const TABS = [
  { path: "/explore",   label: "Explore",      icon: Globe2 },
  { path: "/radar",     label: "Live Radar",   icon: Radio, badge: "LIVE" },
  { path: "/booking",   label: "Book Flights", icon: Plane, badge: "GDS" },
  { path: "/dashboard", label: "Dashboard",    icon: LayoutDashboard },
  { path: "/copilot",   label: "AI Copilot",   icon: Sparkles, badge: "AI" },
  { path: "/passport",  label: "Passport",     icon: BookOpen },
];

export default function NavBar() {
  const theme          = useStore((s) => s.theme);
  const setTheme       = useStore((s) => s.setTheme);
  const stamps         = useStore((s) => s.stamps);
  const soundEnabled   = useStore((s) => s.soundEnabled ?? true);
  const setSoundEnabled = useStore((s) => s.setSoundEnabled);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  function handleThemeChange(t) {
    setTheme(t);
    document.documentElement.setAttribute("data-theme", t === "space" ? "" : t);
  }

  return (
    <>
      <nav
        id="main-nav"
        className="fixed top-0 left-0 right-0 z-50 glass"
        style={{ height: "56px", borderBottom: "1px solid var(--glass-border)" }}
      >
        <div
          className="flex items-center justify-between h-full px-3 sm:px-5 gap-2 sm:gap-4 max-w-7xl mx-auto"
        >
          {/* ── Brand ───────────────────────────────── */}
          <div className="flex items-center gap-2 flex-shrink-0">
            <div
              className="w-7 h-7 rounded-lg flex items-center justify-center"
              style={{ background: "var(--accent-glow)", border: "1px solid var(--glass-border)" }}
            >
              <Globe2 size={14} style={{ color: "var(--accent)" }} />
            </div>
            <span
              className="text-sm font-bold tracking-tight select-none"
              style={{ color: "var(--text-primary)" }}
            >
              Flight<span style={{ color: "var(--accent)" }}>Globe</span>
            </span>
          </div>

          {/* ── Desktop Page Tabs ───────────────────────────── */}
          <div className="hidden md:flex items-center gap-1 overflow-x-auto no-scrollbar">
            {TABS.map(({ path, label, icon: Icon, badge }) => (
              <NavLink
                key={path}
                to={path}
                id={`nav-tab-${label.toLowerCase().replace(/\s+/g, "-")}`}
                className={({ isActive }) =>
                  `flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium transition-all cursor-pointer select-none flex-shrink-0 ${
                    isActive ? "" : "hover:opacity-80"
                  }`
                }
                style={({ isActive }) => ({
                  background: isActive ? "var(--accent-glow)" : "transparent",
                  color: isActive ? "var(--accent)" : "var(--text-muted)",
                  border: isActive
                    ? "1px solid var(--glass-border)"
                    : "1px solid transparent",
                })}
              >
                <Icon size={13} />
                <span>{label}</span>

                {badge && (
                  <span
                    className="px-1.5 py-0.2 rounded font-bold text-[9px]"
                    style={{ background: "var(--accent)", color: "var(--bg-primary)" }}
                  >
                    {badge}
                  </span>
                )}

                {path === "/passport" && stamps.length > 0 && (
                  <span
                    className="w-4 h-4 rounded-full flex items-center justify-center font-bold"
                    style={{
                      background: "var(--accent)",
                      color: "var(--bg-primary)",
                      fontSize: "9px",
                    }}
                  >
                    {stamps.length > 9 ? "9+" : stamps.length}
                  </span>
                )}
              </NavLink>
            ))}
          </div>

          {/* ── Right Side Controls ──────────────────── */}
          <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
            <ThemeSelector activeTheme={theme} onThemeChange={handleThemeChange} />

            {/* Soundscape Toggle */}
            <button
              id="toggle-sound-btn"
              onClick={() => setSoundEnabled(!soundEnabled)}
              className="p-1.5 rounded-xl transition-all cursor-pointer hover:opacity-100 opacity-70"
              style={{
                background: soundEnabled ? "var(--accent-glow)" : "rgba(255,255,255,0.04)",
                border: "1px solid var(--glass-border)",
                color: soundEnabled ? "var(--accent)" : "var(--text-muted)",
              }}
              title={soundEnabled ? "Mute spatial audio" : "Enable spatial audio"}
            >
              {soundEnabled ? <Volume2 size={13} /> : <VolumeX size={13} />}
            </button>

            {/* Mobile Menu Hamburger Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-1.5 rounded-xl glass border border-white/10 text-cyan-400 cursor-pointer"
              aria-label="Toggle mobile menu"
            >
              {mobileMenuOpen ? <X size={18} /> : <Menu size={18} />}
            </button>
          </div>
        </div>
      </nav>

      {/* ── Mobile Navigation Drawer Overlay ───────────────── */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-x-0 top-[56px] z-40 p-4 md:hidden animate-slide-up"
          style={{ background: "rgba(5, 10, 24, 0.96)", backdropFilter: "blur(24px)", borderBottom: "1px solid var(--glass-border)" }}
        >
          <div className="grid grid-cols-2 gap-2">
            {TABS.map(({ path, label, icon: Icon, badge }) => (
              <NavLink
                key={path}
                to={path}
                onClick={() => setMobileMenuOpen(false)}
                className={({ isActive }) =>
                  `flex items-center gap-2.5 p-3 rounded-2xl text-xs font-bold transition-all cursor-pointer ${
                    isActive ? "bg-cyan-500/20 text-cyan-300 border border-cyan-400/40" : "glass text-slate-300 hover:text-white"
                  }`
                }
              >
                <Icon size={16} className="text-cyan-400 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="truncate">{label}</div>
                </div>
                {badge && (
                  <span className="px-1.5 py-0.5 rounded font-bold text-[9px] bg-cyan-400 text-slate-950">
                    {badge}
                  </span>
                )}
              </NavLink>
            ))}
          </div>
        </div>
      )}
    </>
  );
}
