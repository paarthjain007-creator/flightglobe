import React from "react";
import { Link } from "react-router-dom";
import { Globe2, ShieldCheck, Radio, Plane, Sparkles, Compass, LayoutDashboard, Ticket } from "lucide-react";

const PLATFORM_LINKS = [
  { label: "3D Globe Explorer",   to: "/explore",   icon: Compass },
  { label: "Book Flights",        to: "/booking",   icon: Plane },
  { label: "Live ADS-B Radar",    to: "/radar",     icon: Radio, badge: "LIVE" },
  { label: "AI Flight Copilot",   to: "/copilot",   icon: Sparkles, badge: "AI" },
  { label: "Delay Analytics",     to: "/passport", icon: LayoutDashboard },
  { label: "My Passes & Stamps",  to: "/passport",  icon: Ticket },
];

const AIRLINE_PARTNERS = [
  { name: "IndiGo",            route: "/booking?from=DEL&to=BOM" },
  { name: "SpiceJet",          route: "/booking?from=DEL&to=BLR" },
  { name: "Air India",         route: "/booking?from=DEL&to=DXB" },
  { name: "Emirates",          route: "/booking?from=DXB&to=JFK" },
  { name: "British Airways",   route: "/booking?from=JFK&to=LHR" },
  { name: "Lufthansa",         route: "/booking?from=FRA&to=JFK" },
  { name: "Singapore Airlines", route: "/booking?from=SIN&to=HND" },
  { name: "Qatar Airways",     route: "/booking?from=DOH&to=LHR" },
];

const SECURITY_ITEMS = [
  { label: "Amadeus GDS OAuth 2.0", icon: ShieldCheck },
  { label: "OpenSky Network ADS-B Telemetry" },
  { label: "256-Bit TLS Data Encryption" },
  { label: "WebGL 2.0 Spatial Engine" },
  { label: "Privacy Policy" },
  { label: "Terms of Service" },
];

export default function Footer() {
  return (
    <footer
      id="app-footer"
      className="border-t border-white/10 bg-[#121214] text-[#86868b]"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-10">

        {/* ── Top Row: Brand & Live Status ─────────────────────────── */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-8 border-b border-white/10">

          {/* Brand */}
          <div className="space-y-2.5">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center bg-blue-500/10 border border-blue-400/20">
                <Globe2 size={18} className="text-[#2997ff]" />
              </div>
              <div>
                <div className="text-lg font-extrabold text-white tracking-tight">
                  Flight<span className="text-[#2997ff]">Globe</span>
                </div>
                <div className="text-xs font-medium text-[#86868b] uppercase tracking-wider">
                  Global Aerospace Telemetry &amp; GDS Network
                </div>
              </div>
            </div>
            <p className="text-sm text-[#86868b] max-w-md leading-relaxed">
              Real-time 3D planetary flight tracking, live OpenSky ADS-B transponder telemetry, and worldwide GDS multi-carrier airline reservations.
            </p>
          </div>

          {/* Status badge */}
          <div className="flex items-center gap-3 px-4 py-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/25 self-start md:self-auto">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse flex-shrink-0" />
            <div>
              <div className="text-xs font-semibold text-white flex items-center gap-1.5">
                <Radio size={12} className="text-emerald-400" />
                <span>All Flight Systems Operational</span>
              </div>
              <div className="text-[13px] text-slate-400 mt-0.5">
                OpenSky ADS-B · 60 FPS WebGL Engine · Live Fares
              </div>
            </div>
          </div>
        </div>

        {/* ── Middle: Link Columns ─────────────────────────────────── */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
          
          {/* Column 1: Navigation */}
          <div>
            <h3 className="text-xs font-semibold text-white uppercase tracking-wider mb-4 flex items-center gap-1.5">
              <span>Platform Views</span>
            </h3>
            <ul className="space-y-2.5">
              {PLATFORM_LINKS.map(({ label, to, badge, icon: Icon }) => (
                <li key={label}>
                  <Link
                    to={to}
                    className="text-sm text-[#86868b] hover:text-[#2997ff] transition-colors flex items-center gap-2"
                  >
                    <Icon size={14} className="text-[#86868b]" />
                    <span>{label}</span>
                    {badge && (
                      <span className={`text-xs font-bold px-1.5 py-0.2 rounded-full ${
                        badge === "LIVE"
                          ? "bg-emerald-500/15 text-[#30d158] border border-emerald-500/25"
                          : "bg-blue-500/15 text-[#2997ff] border border-blue-500/25"
                      }`}>
                        {badge}
                      </span>
                    )}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 2: Airline Partners */}
          <div>
            <h3 className="text-xs font-semibold text-white uppercase tracking-wider mb-4">
              Airline Partners &amp; Fares
            </h3>
            <ul className="grid grid-cols-2 gap-2 text-sm">
              {AIRLINE_PARTNERS.map(({ name, route }) => (
                <li key={name}>
                  <Link
                    to={route}
                    className="text-[#86868b] hover:text-[#2997ff] transition-colors flex items-center gap-1.5 py-0.5"
                  >
                    <Plane size={11} className="text-[#86868b] flex-shrink-0" />
                    <span className="truncate">{name}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 3: Security & Compliance */}
          <div>
            <h3 className="text-xs font-semibold text-white uppercase tracking-wider mb-4">
              Security &amp; Technology
            </h3>
            <ul className="space-y-2 text-sm text-slate-400">
              {SECURITY_ITEMS.map(({ label, icon: Icon }) => (
                <li key={label} className="flex items-center gap-2">
                  {Icon ? (
                    <Icon size={14} className="text-emerald-400 flex-shrink-0" />
                  ) : (
                    <span className="w-1.5 h-1.5 rounded-full bg-slate-600 flex-shrink-0" />
                  )}
                  <span>{label}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* ── Bottom: Copyright & Notice ───────────────────────────── */}
        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-white/10 text-xs text-slate-400">
          <div>
            © {new Date().getFullYear()} FlightGlobe Inc. All rights reserved.
          </div>
          <div>
            Real-Time Aviation Telemetry · Built with React &amp; Three.js
          </div>
        </div>
      </div>
    </footer>
  );
}

