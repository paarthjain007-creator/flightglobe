import React, { useState, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import FlightSearchEngine from "../components/booking/FlightSearchEngine";
import { useStore } from "../store/useStore";
import { Plane, CheckCircle2 } from "lucide-react";
import { AIRPORTS, getAirportByIata } from "../data/airports";

const POPULAR_ROUTES = [
  { originCode: "DEL", destCode: "BOM", label: "Delhi → Mumbai", airline: "IndiGo · SpiceJet" },
  { originCode: "DEL", destCode: "BLR", label: "Delhi → Bengaluru", airline: "IndiGo · SpiceJet" },
  { originCode: "DEL", destCode: "DXB", label: "Delhi → Dubai", airline: "IndiGo · Emirates" },
  { originCode: "JFK", destCode: "LHR", label: "New York → London", airline: "British Airways · Virgin" },
  { originCode: "DXB", destCode: "JFK", label: "Dubai → New York", airline: "Emirates · Etihad" },
  { originCode: "SIN", destCode: "HND", label: "Singapore → Tokyo", airline: "Singapore Airlines · ANA" },
];

export default function BookingPage() {
  const [searchParams] = useSearchParams();
  const fromParam = searchParams.get("from")?.toUpperCase();
  const toParam = searchParams.get("to")?.toUpperCase();

  const waypoints = useStore((s) => s.waypoints);
  const searchOrigin = useStore((s) => s.searchOrigin);
  const searchDestination = useStore((s) => s.searchDestination);
  const setSearchOrigin = useStore((s) => s.setSearchOrigin);
  const setSearchDestination = useStore((s) => s.setSearchDestination);
  const validWps = useMemo(() => (waypoints || []).filter(Boolean), [waypoints]);

  const [selectedPreset, setSelectedPreset] = useState(null);

  // Compute active initial airports prioritizing:
  // 1. Clicked preset
  // 2. URL search parameters (?from=...&to=...)
  // 3. Store waypoints
  // 4. Store searchOrigin / searchDestination
  // 5. Default AIRPORTS
  const initialOrigin = useMemo(() => {
    if (selectedPreset) {
      return getAirportByIata(selectedPreset.originCode) || AIRPORTS[0];
    }
    if (fromParam) {
      const found = getAirportByIata(fromParam);
      if (found) return found;
    }
    return validWps[0] || searchOrigin || AIRPORTS[0];
  }, [selectedPreset, fromParam, validWps, searchOrigin]);

  const initialDestination = useMemo(() => {
    if (selectedPreset) {
      return getAirportByIata(selectedPreset.destCode) || AIRPORTS[1];
    }
    if (toParam) {
      const found = getAirportByIata(toParam);
      if (found) return found;
    }
    return validWps.length >= 2
      ? validWps[validWps.length - 1]
      : searchDestination || AIRPORTS[1];
  }, [selectedPreset, toParam, validWps, searchDestination]);

  const handleSelectPreset = (route) => {
    setSelectedPreset(route);
    const orig = getAirportByIata(route.originCode);
    const dest = getAirportByIata(route.destCode);
    if (orig && dest) {
      setSearchOrigin(orig);
      setSearchDestination(dest);
    }
  };

  const hasPresetOrDeepLink = !!((fromParam && toParam) || selectedPreset || (validWps.length >= 2));

  return (
    <div
      id="booking-page"
      className="min-h-screen pb-20 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto space-y-6 pt-24 sm:pt-28 animate-fade-in"
    >
      {/* ── Page Header ─────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-3 border-b border-white/10">
        <div>
          <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-cyan-400 uppercase tracking-wider mb-1">
            <Plane size={13} />
            <span>Global Flight Search</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Book Flights
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-2xl leading-relaxed">
            Real-time fares and instant booking across IndiGo, SpiceJet, Air India, Emirates, and 150+ airlines worldwide.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto flex-shrink-0">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-medium">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span>Live GDS Network</span>
          </div>
        </div>
      </div>

      {/* ── Optional Synced Route Notice ────────────────────────── */}
      {hasPresetOrDeepLink && initialOrigin && initialDestination && (
        <div className="flex items-center justify-between px-3.5 py-2 rounded-xl bg-cyan-950/30 border border-cyan-500/20 text-xs text-slate-300">
          <div className="flex items-center gap-2">
            <CheckCircle2 size={14} className="text-cyan-400 flex-shrink-0" />
            <span>
              Selected Route: <strong className="text-white">{initialOrigin.city} ({initialOrigin.iata})</strong> → <strong className="text-white">{initialDestination.city} ({initialDestination.iata})</strong>
            </span>
          </div>
          <span className="text-[11px] text-cyan-400 font-mono hidden sm:inline">
            {fromParam ? "Deep-link synced" : "Active"}
          </span>
        </div>
      )}

      {/* ── Popular Route Presets Strip ──────────────────────────── */}
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-0.5">
        <span className="text-xs font-medium text-slate-400 flex-shrink-0">
          Popular:
        </span>
        {POPULAR_ROUTES.map((route) => {
          const isSelected =
            (selectedPreset?.originCode === route.originCode && selectedPreset?.destCode === route.destCode) ||
            (initialOrigin?.iata === route.originCode && initialDestination?.iata === route.destCode);

          return (
            <button
              key={`${route.originCode}-${route.destCode}`}
              type="button"
              onClick={() => handleSelectPreset(route)}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all cursor-pointer border flex-shrink-0 flex items-center gap-1.5 ${
                isSelected
                  ? "bg-cyan-500/15 border-cyan-400/40 text-cyan-300 shadow-sm"
                  : "bg-white/[0.03] border-white/10 text-slate-300 hover:text-white hover:bg-white/[0.08]"
              }`}
            >
              <span>{route.label}</span>
              <span className="text-[10px] text-slate-400 font-normal hidden sm:inline">({route.airline})</span>
            </button>
          );
        })}
      </div>

      {/* ── Main Flight Search Engine ────────────────────────────── */}
      <FlightSearchEngine
        initialOrigin={initialOrigin}
        initialDestination={initialDestination}
      />
    </div>
  );
}
