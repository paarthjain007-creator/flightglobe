import React from "react";
import { Link } from "react-router-dom";
import { Globe2, ShieldCheck, Radio, Plane, Sparkles, Heart } from "lucide-react";

const AIRLINE_PARTNERS = [
  { name: "Emirates", flag: "🇦🇪" },
  { name: "Etihad Airways", flag: "🇦🇪" },
  { name: "Air India", flag: "🇮🇳" },
  { name: "SWISS", flag: "🇨🇭" },
  { name: "Lufthansa", flag: "🇩🇪" },
  { name: "Qatar Airways", flag: "🇶🇦" },
  { name: "British Airways", flag: "🇬🇧" },
  { name: "Singapore Airlines", flag: "🇸🇬" },
];

export default function Footer() {
  return (
    <footer
      id="app-footer"
      className="glass border-t border-white/10 mt-auto py-10 px-5 text-slate-300"
      style={{ background: "rgba(5, 10, 24, 0.95)" }}
    >
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Top Row: Brand & Status */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-white/10">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-cyan-500/20 border border-cyan-400/40 flex items-center justify-center">
                <Globe2 size={18} className="text-cyan-400" />
              </div>
              <span className="text-lg font-black tracking-tight text-white">
                Flight<span className="text-cyan-400">Globe</span>
              </span>
            </div>
            <p className="text-xs text-slate-400 max-w-md">
              Real-time 3D spatial aviation platform, live ADS-B global air traffic radar, and multi-carrier GDS booking engine.
            </p>
          </div>

          {/* Real-time Telemetry Health Chip */}
          <div className="glass px-4 py-2.5 rounded-2xl border border-emerald-500/30 flex items-center gap-3 self-start md:self-auto">
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_12px_#34d399]" />
            <div>
              <div className="text-xs font-bold text-white flex items-center gap-1.5 font-mono">
                <Radio size={12} className="text-emerald-400" />
                <span>ADS-B & GDS NETWORKS OPERATIONAL</span>
              </div>
              <div className="text-[10px] text-slate-400 font-mono">
                OpenSky ADS-B Telemetry · 60 FPS WebGL Engine
              </div>
            </div>
          </div>
        </div>

        {/* Middle Row: Links & Airlines */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 text-xs">
          {/* Quick Links */}
          <div>
            <div className="font-bold text-white mb-3 uppercase tracking-wider text-[11px] text-cyan-400">
              Platform Features
            </div>
            <ul className="space-y-2 text-slate-400">
              <li><Link to="/explore" className="hover:text-cyan-300 transition-colors">3D Interactive World Globe</Link></li>
              <li><Link to="/radar" className="hover:text-cyan-300 transition-colors flex items-center gap-1.5">Live ADS-B Radar <span className="px-1.5 py-0.2 rounded text-[9px] bg-cyan-400 text-slate-950 font-bold">LIVE</span></Link></li>
              <li><Link to="/booking" className="hover:text-cyan-300 transition-colors">GDS & NDC Flight Booking Engine</Link></li>
              <li><Link to="/copilot" className="hover:text-cyan-300 transition-colors">AI Travel Copilot & Itinerary</Link></li>
              <li><Link to="/dashboard" className="hover:text-cyan-300 transition-colors">Trip Insights & Anomaly Analytics</Link></li>
              <li><Link to="/passport" className="hover:text-cyan-300 transition-colors">Digital Passport & Travel Stamps</Link></li>
            </ul>
          </div>

          {/* Real Airline Partners */}
          <div className="md:col-span-2">
            <div className="font-bold text-white mb-3 uppercase tracking-wider text-[11px] text-cyan-400">
              Integrated Real-World Airline Fleets
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {AIRLINE_PARTNERS.map((airline) => (
                <div
                  key={airline.name}
                  className="glass px-2.5 py-2 rounded-xl border border-white/10 flex items-center gap-2 text-slate-300 font-medium hover:border-cyan-400/40 transition-colors"
                >
                  <span className="text-base">{airline.flag}</span>
                  <span className="truncate">{airline.name}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Legal & Compliance */}
          <div>
            <div className="font-bold text-white mb-3 uppercase tracking-wider text-[11px] text-cyan-400">
              Enterprise & Security
            </div>
            <ul className="space-y-2 text-slate-400">
              <li className="flex items-center gap-1.5 text-emerald-400 font-semibold"><ShieldCheck size={13} /> OAuth 2.0 Amadeus GDS</li>
              <li>OpenSky Network Open API</li>
              <li>WebXR & WebGL 2.0 Compliance</li>
              <li>Privacy Policy & Data Rights</li>
              <li>Terms of Service</li>
            </ul>
          </div>
        </div>

        {/* Bottom Copyright & Footer Note */}
        <div className="pt-6 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-slate-500">
          <div>
            © {new Date().getFullYear()} FlightGlobe Inc. All rights reserved. Architected for real-time global travel exploration.
          </div>
          <div className="flex items-center gap-1">
            Built with WebGL, React, and OpenSky Telemetry
          </div>
        </div>
      </div>
    </footer>
  );
}
