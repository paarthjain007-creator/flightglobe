import React from "react";
import FlightSearchEngine from "../components/booking/FlightSearchEngine";
import { useStore } from "../store/useStore";
import { Plane, ShieldCheck, Globe2 } from "lucide-react";

export default function BookingPage() {
  const waypoints = useStore((s) => s.waypoints);
  const validWps = (waypoints || []).filter(Boolean);
  const origin = validWps[0] || null;
  const destination = validWps.length >= 2 ? validWps[validWps.length - 1] : null;

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
            Compare live ticket fares, schedules, and layover milestones across all domestic & international airlines.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs font-mono text-emerald-400 glass px-3.5 py-2 rounded-2xl border border-emerald-500/30">
          <ShieldCheck size={16} />
          <span>Amadeus & Duffel Verified Inventory</span>
        </div>
      </div>

      {/* Main Flight Search Engine */}
      <FlightSearchEngine
        initialOrigin={origin}
        initialDestination={destination}
      />
    </div>
  );
}
