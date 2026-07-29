import React, { useState } from "react";
import FlightSearchEngine from "../components/booking/FlightSearchEngine";
import { useStore } from "../store/useStore";
import { Plane, ShieldCheck, Globe2, Sparkles, Compass } from "lucide-react";
import { AIRPORTS } from "../data/airports";

const POPULAR_ROUTES = [
  { originCode: "JFK", destCode: "LHR", label: "New York ✈️ London", airline: "Emirates / British Airways" },
  { originCode: "DEL", destCode: "DXB", label: "Delhi ✈️ Dubai", airline: "Air India / Emirates" },
  { originCode: "DXB", destCode: "JFK", label: "Dubai ✈️ New York", airline: "Etihad / Emirates" },
  { originCode: "ZRH", destCode: "JFK", label: "Zurich ✈️ New York", airline: "SWISS / Lufthansa" },
  { originCode: "SIN", destCode: "HND", label: "Singapore ✈️ Tokyo", airline: "Singapore Airlines / ANA" },
  { originCode: "LHR", destCode: "SIN", label: "London ✈️ Singapore", airline: "Qantas / British Airways" },
];

export default function BookingPage() {
  const waypoints = useStore((s) => s.waypoints);
  const validWps = (waypoints || []).filter(Boolean);

  const [selectedPreset, setSelectedPreset] = useState(null);

  const initialOrigin = selectedPreset
    ? AIRPORTS.find((a) => a.iata === selectedPreset.originCode)
    : validWps[0] || null;

  const initialDestination = selectedPreset
    ? AIRPORTS.find((a) => a.iata === selectedPreset.destCode)
    : validWps.length >= 2
    ? validWps[validWps.length - 1]
    : null;

  return (
    <div
      id="booking-page"
      className="min-h-screen pt-20 pb-12 px-4 max-w-6xl mx-auto space-y-6"
      style={{ background: "var(--bg-primary)" }}
    >
      {/* Header Banner */}
      <div className="flex items-center justify-between flex-wrap gap-4 border-b border-white/10 pb-5">
        <div>
          <h1 className="text-2xl font-black text-white flex items-center gap-2">
            <span>Global Multi-Airline Booking Engine</span>
            <span className="text-xs px-3 py-1 rounded-full bg-cyan-500/20 text-cyan-300 font-mono font-normal">
              GDS & NDC Direct Channel
            </span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Compare live ticket fares, schedules, and layover milestones across Emirates, Etihad, Air India, SWISS, Lufthansa & global carriers.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs font-mono text-emerald-400 glass px-3.5 py-2 rounded-2xl border border-emerald-500/30">
          <ShieldCheck size={16} />
          <span>Amadeus & Duffel Verified Inventory</span>
        </div>
      </div>

      {/* Popular Route Presets Carousel */}
      <div className="space-y-2">
        <div className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
          <Compass size={14} className="text-cyan-400" />
          <span>Popular Global Routes (1-Click Presets):</span>
        </div>

        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
          {POPULAR_ROUTES.map((route) => (
            <button
              key={route.label}
              onClick={() => setSelectedPreset(route)}
              className="glass px-3.5 py-2 rounded-2xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer hover:border-cyan-400 flex items-center gap-2 text-slate-200 hover:text-cyan-300 flex-shrink-0"
            >
              <span>{route.label}</span>
              <span className="text-[10px] text-slate-400 font-normal font-mono">({route.airline})</span>
            </button>
          ))}
        </div>
      </div>

      {/* Main Flight Search Engine */}
      <FlightSearchEngine
        key={selectedPreset ? `${selectedPreset.originCode}-${selectedPreset.destCode}` : "default-engine"}
        initialOrigin={initialOrigin}
        initialDestination={initialDestination}
      />
    </div>
  );
}
