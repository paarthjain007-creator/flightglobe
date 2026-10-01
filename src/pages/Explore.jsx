import React, { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  CheckCircle2, X, Ticket, ArrowRight, ShieldCheck,
  Plane, QrCode, Radio, Search, Users, ChevronDown,
  Calendar, MapPin, Zap, Globe2, Plus, Minus, Check,
  Eye, Wind, Box, Moon, Sun, CloudRain, ArrowLeftRight
} from "lucide-react";
const Interactive3DGlobeTracker = React.lazy(() => import("../components/tracker/Interactive3DGlobeTracker"));
const CockpitHUD = React.lazy(() => import("../components/cockpit/CockpitHUD"));


import FlightDeckFAB from "../components/ui/FlightDeckFAB";
import DispatchRoom from "../components/multiplayer/DispatchRoom";
import FlightStreamMatrix from "../components/itinerary/StaggeredDepartureCards";
const KineticSeatCanvas = React.lazy(() => import("../components/canvas/KineticSeatCanvas"));
import { useStore } from "../store/useStore";
import { sound } from "../utils/soundFx";
import { AIRPORTS, getAirportByIata } from "../data/airports";
import { searchAirportsAPI, createBookingAPI } from "../services/api/apiClient";

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   FLOATING SEARCH MATRIX WITH INTERACTIVE POPOVERS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
function SearchMatrix({ origin, destination, departureDate, passengers, travelClass, onUpdateSearch }) {
  const [editing, setEditing] = useState(null); // "origin" | "destination" | "date" | "cabin"
  const [origInput, setOrigInput]   = useState(origin?.code || origin?.iata || "JFK");
  const [destInput, setDestInput]   = useState(destination?.code || destination?.iata || "LHR");
  const [dateInput, setDateInput]   = useState(departureDate || new Date().toISOString().split("T")[0]);
  const [paxInput, setPaxInput]     = useState(passengers || 1);
  const [cabinInput, setCabinInput] = useState(travelClass || "Economy");
  const [searchFilter, setSearchFilter] = useState("");
  const [remoteResults, setRemoteResults] = useState([]);
  const debounceRef = useRef(null);
  const containerRef = useRef(null);

  // Sync inputs with props
  useEffect(() => {
    if (origin) setOrigInput(origin.code || origin.iata || "JFK");
  }, [origin]);

  useEffect(() => {
    if (destination) setDestInput(destination.code || destination.iata || "LHR");
  }, [destination]);

  useEffect(() => {
    if (departureDate) setDateInput(departureDate);
  }, [departureDate]);

  // Debounced progressive airport search (200ms, 2+ chars → hits /api/airports/search)
  useEffect(() => {
    clearTimeout(debounceRef.current);
    if (searchFilter.trim().length < 2) { setRemoteResults([]); return; }
    debounceRef.current = setTimeout(async () => {
      try {
        const results = await searchAirportsAPI(searchFilter.trim());
        setRemoteResults(results || []);
      } catch { setRemoteResults([]); }
    }, 200);
    return () => clearTimeout(debounceRef.current);
  }, [searchFilter]);

  // Click outside to dismiss popover
  useEffect(() => {
    function handleClickOutside(e) {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setEditing(null);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const POPULAR = [
    { label: "JFK → LHR", from: { code:"JFK",iata:"JFK",city:"New York",country:"US",lat:40.6413,lng:-73.7781,lon:-73.7781 }, to: { code:"LHR",iata:"LHR",city:"London",country:"UK",lat:51.47,lng:-0.4543,lon:-0.4543 } },
    { label: "DEL → DXB", from: { code:"DEL",iata:"DEL",city:"New Delhi",country:"IN",lat:28.5562,lng:77.1,lon:77.1 },        to: { code:"DXB",iata:"DXB",city:"Dubai",country:"AE",lat:25.2532,lng:55.3657,lon:55.3657 } },
    { label: "SIN → HND", from: { code:"SIN",iata:"SIN",city:"Singapore",country:"SG",lat:1.3644,lng:103.9915,lon:103.9915 }, to: { code:"HND",iata:"HND",city:"Tokyo",country:"JP",lat:35.5494,lng:139.7798,lon:139.7798 } },
    { label: "SFO → SYD", from: { code:"SFO",iata:"SFO",city:"San Francisco",country:"US",lat:37.6213,lng:-122.379,lon:-122.379 }, to: { code:"SYD",iata:"SYD",city:"Sydney",country:"AU",lat:-33.9399,lng:151.1753,lon:151.1753 } },
  ];

  // Progressive airport search: remote results take priority over local filter
  const filteredAirports = useMemo(() => {
    if (remoteResults.length > 0) return remoteResults.slice(0, 10);
    const q = searchFilter.trim().toLowerCase();
    if (!q) return AIRPORTS.slice(0, 10);
    return AIRPORTS.filter((a) =>
      a.iata.toLowerCase().includes(q) ||
      a.city.toLowerCase().includes(q) ||
      a.name.toLowerCase().includes(q) ||
      a.country.toLowerCase().includes(q)
    ).slice(0, 10);
  }, [searchFilter, remoteResults]);

  function handleSelectAirport(airport, type) {
    sound.playClick();
    if (type === "origin") {
      setOrigInput(airport.iata);
      onUpdateSearch({ origin: airport });
      setSearchFilter("");
      setEditing(null);
    } else {
      setDestInput(airport.iata);
      onUpdateSearch({ destination: airport });
      setSearchFilter("");
      setEditing(null);
    }
  }

  function handleQuickDate(offsetDays) {
    sound.playClick();
    const d = new Date();
    d.setDate(d.getDate() + offsetDays);
    const dateStr = d.toISOString().split("T")[0];
    setDateInput(dateStr);
    onUpdateSearch({ date: dateStr });
    setEditing(null);
  }

  function handlePreset(p) {
    sound.playClick();
    onUpdateSearch({ origin: p.from, destination: p.to });
    setOrigInput(p.from.code);
    setDestInput(p.to.code);
  }

  function handleExecuteSearch() {
    sound.playClick();
    const origAirport = getAirportByIata(origInput) || {
      code: origInput, iata: origInput, city: origInput, lat: 40.6413, lng: -73.7781, lon: -73.7781
    };
    const destAirport = getAirportByIata(destInput) || {
      code: destInput, iata: destInput, city: destInput, lat: 51.47, lng: -0.4543, lon: -0.4543
    };
    onUpdateSearch({
      origin: origAirport,
      destination: destAirport,
      date: dateInput,
      travelClass: cabinInput,
      passengers: paxInput,
    });
    setEditing(null);
  }

  return (
    <div ref={containerRef} className="w-full flex flex-col items-center gap-2 relative">
      {/* Main Search Bar */}
      <div
        className="border-beam-card flex items-stretch rounded-2xl overflow-hidden shadow-2xl"
        style={{
          background: "rgba(13,17,27,0.85)",
          backdropFilter: "blur(32px) saturate(200%)",
          WebkitBackdropFilter: "blur(32px) saturate(200%)",
          border: "1px solid rgba(255,255,255,0.12)",
          boxShadow: "inset 0 1px 1px rgba(255,255,255,0.15), 0 24px 64px rgba(0,0,0,0.7)",
          maxWidth: "780px",
          width: "100%",
        }}
      >
        {/* ORIGIN */}
        <button
          type="button"
          onClick={() => { sound.playClick(); setEditing(editing === "origin" ? null : "origin"); setSearchFilter(""); }}
          className="flex-1 min-w-0 flex flex-col items-start px-3.5 sm:px-5 py-2.5 sm:py-3 gap-0.5 hover:bg-white/5 transition-colors cursor-pointer border-r"
          style={{ borderColor: "rgba(255,255,255,0.1)" }}
        >
          <span className="text-[10px] font-semibold tracking-wider text-slate-400 uppercase">From</span>
          <div className="flex items-center gap-1.5 min-w-0">
            <MapPin size={13} className="text-cyan-400 flex-shrink-0" />
            <span className="font-bold text-sm sm:text-base text-white tracking-tight">{origInput}</span>
            <span className="text-xs text-slate-300 font-medium truncate max-w-[90px] sm:max-w-[130px] hidden sm:inline">
              {getAirportByIata(origInput)?.city || ""}
            </span>
          </div>
        </button>

        {/* Swap Origin / Destination button */}
        <button
          type="button"
          className="flex items-center justify-center px-2 sm:px-3 cursor-pointer hover:bg-cyan-500/10 transition-colors group flex-shrink-0"
          onClick={() => {
            sound.playClick();
            sound.haptic([8]);
            const tmp = origInput;
            setOrigInput(destInput);
            setDestInput(tmp);
            const origAirport = getAirportByIata(destInput);
            const destAirport = getAirportByIata(origInput);
            if (origAirport && destAirport) {
              onUpdateSearch({ origin: origAirport, destination: destAirport });
            }
          }}
          title="Swap Origin & Destination (⇄)"
        >
          <ArrowLeftRight size={14} className="text-slate-400 group-hover:text-cyan-400 transition-transform duration-300 group-hover:rotate-180" />
        </button>

        {/* DESTINATION */}
        <button
          type="button"
          onClick={() => { sound.playClick(); setEditing(editing === "destination" ? null : "destination"); setSearchFilter(""); }}
          className="flex-1 min-w-0 flex flex-col items-start px-3.5 sm:px-5 py-2.5 sm:py-3 gap-0.5 hover:bg-white/5 transition-colors cursor-pointer border-r"
          style={{ borderColor: "rgba(255,255,255,0.1)" }}
        >
          <span className="text-[10px] font-semibold tracking-wider text-slate-400 uppercase">To</span>
          <div className="flex items-center gap-1.5 min-w-0">
            <MapPin size={13} className="text-emerald-400 flex-shrink-0" />
            <span className="font-bold text-sm sm:text-base text-white tracking-tight">{destInput}</span>
            <span className="text-xs text-slate-300 font-medium truncate max-w-[90px] sm:max-w-[130px] hidden sm:inline">
              {getAirportByIata(destInput)?.city || ""}
            </span>
          </div>
        </button>

        {/* DATE MATRIX */}
        <button
          type="button"
          onClick={() => { sound.playClick(); setEditing(editing === "date" ? null : "date"); }}
          className="flex flex-col items-start px-4 sm:px-5 py-2.5 sm:py-3 gap-0.5 hover:bg-white/5 transition-colors cursor-pointer border-r hidden md:flex"
          style={{ borderColor: "rgba(255,255,255,0.1)", minWidth: "115px" }}
        >
          <span className="text-[10px] font-semibold tracking-wider text-slate-400 uppercase">Departure</span>
          <div className="flex items-center gap-1.5">
            <Calendar size={13} className="text-cyan-400" />
            <span className="font-semibold text-xs sm:text-sm text-white">
              {new Date(dateInput).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
            </span>
          </div>
        </button>

        {/* CABIN CLASS */}
        <button
          type="button"
          onClick={() => { sound.playClick(); setEditing(editing === "cabin" ? null : "cabin"); }}
          className="flex flex-col items-start px-4 sm:px-5 py-2.5 sm:py-3 gap-0.5 hover:bg-white/5 transition-colors cursor-pointer border-r hidden lg:flex"
          style={{ borderColor: "rgba(255,255,255,0.1)", minWidth: "110px" }}
        >
          <span className="text-[10px] font-semibold tracking-wider text-slate-400 uppercase">Travelers</span>
          <div className="flex items-center gap-1.5">
            <Users size={13} className="text-amber-400" />
            <span className="font-semibold text-xs sm:text-sm text-white">
              {paxInput} Pax · {cabinInput.slice(0, 3)}
            </span>
            <ChevronDown size={11} className="text-slate-400" />
          </div>
        </button>

        {/* SEARCH CTA */}
        <button
          type="button"
          onClick={handleExecuteSearch}
          className="bg-gradient-to-r from-cyan-400 to-emerald-400 text-slate-950 hover:from-cyan-300 hover:to-emerald-300 font-bold text-xs sm:text-sm flex items-center justify-center gap-2 px-5 sm:px-7 transition-all cursor-pointer shadow-lg active:scale-95 flex-shrink-0"
          style={{ borderRadius: 0 }}
        >
          <Search size={15} />
          <span>Search</span>
        </button>
      </div>

      {/* ── INTERACTIVE POPOVER PANELS ─────────────────────────────── */}
      <AnimatePresence>
        {editing && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.98 }}
            transition={{ duration: 0.18 }}
            className="w-full max-w-[780px] rounded-3xl p-3.5 sm:p-5 shadow-2xl z-40 relative space-y-3 sm:space-y-4"
            style={{
              background: "rgba(10, 14, 24, 0.96)",
              backdropFilter: "blur(32px) saturate(190%)",
              WebkitBackdropFilter: "blur(32px) saturate(190%)",
              border: "1px solid rgba(0, 242, 254, 0.35)",
              boxShadow: "0 28px 70px rgba(0,0,0,0.85), inset 0 1px 2px rgba(255,255,255,0.2)",
            }}
          >
            {/* 1. ORIGIN OR DESTINATION AUTOCOMPLETE */}
            {(editing === "origin" || editing === "destination") && (
              <div className="space-y-3">
                <div className="flex items-center justify-between border-b border-white/10 pb-2">
                  <div className="flex items-center gap-2">
                    <MapPin size={14} color={editing === "origin" ? "#00F2FE" : "#B800FF"} />
                    <span className="mono text-xs font-bold uppercase tracking-wider text-white">
                      SELECT {editing.toUpperCase()} AIRPORT / CITY
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setEditing(null)}
                    className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/10"
                  >
                    <X size={14} />
                  </button>
                </div>

                {/* Input Search Field */}
                <div className="relative">
                  <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-cyan-400" />
                  <input
                    type="text"
                    value={searchFilter}
                    onChange={(e) => setSearchFilter(e.target.value)}
                    placeholder="Search by IATA code, city name, or country..."
                    autoFocus
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-900 border border-white/20 text-white placeholder-slate-400 focus:outline-none focus:border-cyan-400 font-sans text-sm font-medium"
                  />
                </div>

                {/* Filtered Airports List */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-56 overflow-y-auto no-scrollbar pt-1">
                  {filteredAirports.map((airport) => (
                    <button
                      key={airport.iata}
                      type="button"
                      onClick={() => handleSelectAirport(airport, editing)}
                      className="p-2.5 rounded-xl text-left transition-all cursor-pointer border border-white/10 hover:border-cyan-400/50 bg-white/[0.03] hover:bg-white/[0.08] flex items-center justify-between group"
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="mono text-xs font-bold text-cyan-300 group-hover:text-cyan-200">
                            {airport.iata}
                          </span>
                          <span className="text-sm font-bold text-white group-hover:text-cyan-100">
                            {airport.city}
                          </span>
                        </div>
                        <div className="text-xs text-slate-300 truncate max-w-[220px] mt-0.5">
                          {airport.name} · {airport.country}
                        </div>
                      </div>
                      <ArrowRight size={13} className="opacity-0 group-hover:opacity-100 text-cyan-400 transition-opacity" />
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* 2. DATE MATRIX PICKER */}
            {editing === "date" && (
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b border-white/10 pb-2">
                  <div className="flex items-center gap-2">
                    <Calendar size={14} color="#00FFA3" />
                    <span className="mono text-xs font-bold uppercase tracking-wider text-white">
                      SELECT DEPARTURE DATE
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setEditing(null)}
                    className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/10"
                  >
                    <X size={14} />
                  </button>
                </div>

                {/* Quick Date Presets */}
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="mono text-[10px] text-[#94A3B8]">QUICK PICK:</span>
                  {[
                    { label: "Today", days: 0 },
                    { label: "Tomorrow", days: 1 },
                    { label: "+7 Days", days: 7 },
                    { label: "+14 Days", days: 14 },
                    { label: "+30 Days", days: 30 },
                  ].map(({ label, days }) => (
                    <button
                      key={label}
                      type="button"
                      onClick={() => handleQuickDate(days)}
                      className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-white/5 border border-white/10 hover:border-cyan-400 text-slate-200 hover:text-cyan-300 transition-all cursor-pointer"
                    >
                      {label}
                    </button>
                  ))}
                </div>

                {/* Custom Date Input */}
                <div className="flex items-center gap-3">
                  <input
                    type="date"
                    value={dateInput}
                    min={new Date().toISOString().split("T")[0]}
                    onChange={(e) => {
                      setDateInput(e.target.value);
                      onUpdateSearch({ date: e.target.value });
                      setEditing(null);
                    }}
                    className="flex-1 px-4 py-2.5 rounded-xl bg-slate-900 border border-white/15 text-white focus:outline-none focus:border-cyan-400 font-mono text-base sm:text-xs"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      onUpdateSearch({ date: dateInput });
                      setEditing(null);
                    }}
                    className="btn-aurora px-5 py-2.5 rounded-xl text-xs font-bold cursor-pointer"
                  >
                    APPLY DATE
                  </button>
                </div>
              </div>
            )}

            {/* 3. CABIN CLASS & TRAVELERS */}
            {editing === "cabin" && (
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b border-white/10 pb-2">
                  <div className="flex items-center gap-2">
                    <Users size={14} color="#FBBF24" />
                    <span className="mono text-xs font-bold uppercase tracking-wider text-white">
                      CABIN CLASS & PASSENGER SPECIFICATION
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setEditing(null)}
                    className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/10"
                  >
                    <X size={14} />
                  </button>
                </div>

                {/* Cabin selection pills */}
                <div className="space-y-1.5">
                  <label className="mono text-[10px] text-[#94A3B8]">SELECT CABIN CLASS</label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {["Economy", "Premium", "Business", "First"].map((cls) => (
                      <button
                        key={cls}
                        type="button"
                        onClick={() => { sound.playClick(); setCabinInput(cls); }}
                        className={`py-2.5 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer border ${
                          cabinInput.toLowerCase() === cls.toLowerCase()
                            ? "bg-cyan-500/20 border-cyan-400 text-cyan-300 shadow-md"
                            : "bg-white/5 border-white/10 text-slate-300 hover:border-white/20"
                        }`}
                      >
                        {cls}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Passenger Stepper */}
                <div className="flex items-center justify-between pt-2 border-t border-white/10">
                  <div>
                    <div className="text-xs font-bold text-white">Adult Passengers</div>
                    <div className="text-[10px] text-[#94A3B8]">Age 12+ years</div>
                  </div>

                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      disabled={paxInput <= 1}
                      onClick={() => { sound.playClick(); setPaxInput(Math.max(1, paxInput - 1)); }}
                      className="w-8 h-8 rounded-xl bg-white/5 border border-white/15 flex items-center justify-center text-white disabled:opacity-30 cursor-pointer hover:bg-white/10"
                    >
                      <Minus size={13} />
                    </button>
                    <span className="mono font-bold text-sm w-6 text-center text-white">{paxInput}</span>
                    <button
                      type="button"
                      disabled={paxInput >= 6}
                      onClick={() => { sound.playClick(); setPaxInput(Math.min(6, paxInput + 1)); }}
                      className="w-8 h-8 rounded-xl bg-white/5 border border-white/15 flex items-center justify-center text-white disabled:opacity-30 cursor-pointer hover:bg-white/10"
                    >
                      <Plus size={13} />
                    </button>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    sound.playClick();
                    onUpdateSearch({ travelClass: cabinInput, passengers: paxInput });
                    setEditing(null);
                  }}
                  className="btn-aurora w-full py-3 rounded-xl text-xs font-bold cursor-pointer"
                >
                  APPLY PREFERENCES
                </button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Popular Route Presets */}
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-0.5 max-w-[780px] w-full">
        <span className="mono text-[9px] tracking-widest flex-shrink-0 text-[#94A3B8]">QUICK ROUTES:</span>
        {POPULAR.map((p) => (
          <button
            key={p.label}
            type="button"
            onClick={() => handlePreset(p)}
            className="chip flex-shrink-0 cursor-pointer"
          >
            {p.label}
          </button>
        ))}
      </div>
    </div>
  );
}

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   BOARDING PASS MODAL
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
function BoardingPassModal({ pass, onClose, onViewTrips }) {
  if (!pass) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(5,6,10,0.88)", backdropFilter: "blur(24px)" }}>
      <motion.div
        initial={{ scale: 0.92, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.92, opacity: 0, y: 20 }}
        className="relative w-full max-w-md rounded-3xl overflow-hidden"
        style={{
          background: "rgba(13,17,27,0.95)",
          border: "1px solid rgba(0,242,254,0.25)",
          boxShadow: "0 0 80px rgba(0,242,254,0.18), inset 0 1px 1px rgba(255,255,255,0.12)",
        }}
      >
        {/* Aurora top bar */}
        <div className="h-1 w-full" style={{ background: "linear-gradient(90deg, #00F2FE, #7928CA, #00FFA3)" }} />

        <div className="p-6 space-y-5">
          {/* Header */}
          <button type="button" onClick={onClose}
            className="absolute top-5 right-5 p-2 rounded-xl cursor-pointer transition-colors hover:bg-white/10"
            style={{ color: "#7A85A0" }}>
            <X size={16} />
          </button>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{ background: "rgba(0,255,163,0.12)", border: "1px solid rgba(0,255,163,0.3)" }}>
              <CheckCircle2 size={22} color="#00FFA3" />
            </div>
            <div>
              <div className="font-bold text-lg" style={{ color: "#E8EAF0" }}>BOARDING PASS ISSUED</div>
              <div className="mono text-[10px] tracking-widest" style={{ color: "#00FFA3" }}>
                REF: {pass.bookingRef} · CONFIRMED
              </div>
            </div>
          </div>

          {/* Ticket body */}
          <div className="rounded-2xl p-5 space-y-4"
            style={{ background: "rgba(5,8,18,0.80)", border: "1px solid rgba(255,255,255,0.07)" }}>

            {/* Airline + Flight code */}
            <div className="flex items-center justify-between pb-3"
              style={{ borderBottom: "1px solid rgba(255,255,255,0.07)" }}>
              <div className="flex items-center gap-2">
                <Plane size={15} color="#00F2FE" className="-rotate-45" />
                <span className="font-semibold text-sm" style={{ color: "#E8EAF0" }}>
                  {pass.flight?.airline || "FlightGlobe"}
                </span>
              </div>
              <span className="mono text-[11px] font-bold px-2 py-0.5 rounded"
                style={{ background: "rgba(0,242,254,0.10)", border: "1px solid rgba(0,242,254,0.25)", color: "#00F2FE" }}>
                {pass.flight?.callsign || pass.flight?.code || "FL-101"}
              </span>
            </div>

            {/* Route */}
            <div className="flex items-center justify-between">
              <div>
                <div className="mono font-bold" style={{ fontSize: "32px", color: "#00F2FE" }}>
                  {pass.origin?.code || pass.origin?.iata}
                </div>
                <div className="text-xs" style={{ color: "#7A85A0" }}>{pass.origin?.city}</div>
              </div>
              <div className="flex flex-col items-center">
                <ArrowRight size={20} color="#7928CA" />
                <span className="mono text-[9px] mt-1" style={{ color: "#00FFA3" }}>NON-STOP</span>
              </div>
              <div className="text-right">
                <div className="mono font-bold" style={{ fontSize: "32px", color: "#B800FF" }}>
                  {pass.destination?.code || pass.destination?.iata}
                </div>
                <div className="text-xs" style={{ color: "#7A85A0" }}>{pass.destination?.city}</div>
              </div>
            </div>

            {/* Grid: Seat / Gate / Terminal / Group */}
            <div className="grid grid-cols-4 gap-2 pt-3"
              style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}>
              {[
                { k: "SEAT", v: pass.seat, color: "#00F2FE" },
                { k: "GATE", v: pass.gate, color: "#E8EAF0" },
                { k: "TERM", v: pass.terminal, color: "#E8EAF0" },
                { k: "GROUP", v: pass.group, color: "#00FFA3" },
              ].map(({ k, v, color }) => (
                <div key={k} className="text-center py-2 rounded-xl"
                  style={{ background: "rgba(255,255,255,0.03)" }}>
                  <div className="mono text-[8px] tracking-wider mb-0.5" style={{ color: "#404660" }}>{k}</div>
                  <div className="mono font-bold text-sm" style={{ color }}>{v}</div>
                </div>
              ))}
            </div>

            {/* QR + Price */}
            <div className="flex items-center justify-between pt-3"
              style={{ borderTop: "1px dashed rgba(255,255,255,0.10)" }}>
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-white">
                  <QrCode size={32} color="#05060A" />
                </div>
                <div className="mono">
                  <div className="text-[9px] tracking-widest" style={{ color: "#404660" }}>E-TICKET</div>
                  <div className="text-[10px] font-bold" style={{ color: "#E8EAF0" }}>NFC ACTIVE</div>
                </div>
              </div>
              <div className="text-right">
                <div className="mono text-[9px]" style={{ color: "#404660" }}>TOTAL PAID</div>
                <div className="mono font-bold text-xl font-mono" style={{ color: "#00FFA3" }}>
                  {pass.currencySymbol || pass.flight?.currencySymbol || "$"}{typeof pass.totalPrice === "number" ? pass.totalPrice.toLocaleString() : pass.totalPrice}
                </div>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="grid grid-cols-2 gap-3">
            <button type="button" onClick={onViewTrips}
              className="btn-aurora py-3 rounded-2xl flex items-center justify-center gap-2 cursor-pointer">
              <Ticket size={15} />
              <span className="mono font-bold text-[11px] tracking-wider">VIEW MY PASSES</span>
            </button>
            <button type="button" onClick={onClose}
              className="btn-ghost py-3 rounded-2xl cursor-pointer mono font-bold text-[11px] tracking-wider">
              CLOSE
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   MAIN EXPLORE PAGE — AERO.SPATIAL MASTER LAYOUT
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
export default function Explore() {
  const navigate   = useNavigate();
  const storedWps  = useStore((s) => s.waypoints);
  const setStoreWps = useStore((s) => s.setWaypoints);
  const addTrip    = useStore((s) => s.addTrip);
  const addStamp   = useStore((s) => s.addStamp);
  const currency   = useStore((s) => s.currency || "USD");

  const [origin, setOrigin] = useState({
    code:"JFK",iata:"JFK",name:"John F. Kennedy Intl Airport",city:"New York",country:"US",
    lat:40.6413,lng:-73.7781,lon:-73.7781
  });
  const [destination, setDestination] = useState({
    code:"LHR",iata:"LHR",name:"Heathrow Airport",city:"London",country:"UK",
    lat:51.47,lng:-0.4543,lon:-0.4543
  });
  const [departureDate, setDepartureDate] = useState(new Date().toISOString().split("T")[0]);
  const [travelClass, setTravelClass]     = useState("Economy");
  const [passengers, setPassengers]       = useState(1);
  const [selectedFlight, setSelectedFlight] = useState(null);
  const [seatModalOpen, setSeatModalOpen]   = useState(false);
  const [confirmedPass, setConfirmedPass]   = useState(null);
  const [flightsPanelOpen, setFlightsPanelOpen] = useState(() => typeof window !== "undefined" && window.innerWidth >= 768);

  // Spatial & Telemetry Engine States
  const lastSpatialCommand                      = useStore((s) => s.lastSpatialCommand);
  const showDayNight                            = useStore((s) => s.showDayNight ?? false);
  const setShowDayNight                         = useStore((s) => s.setShowDayNight);
  const activeOverlayLayer                      = useStore((s) => s.activeOverlayLayer);
  const setActiveOverlayLayer                   = useStore((s) => s.setActiveOverlayLayer);
  const [isCockpitView, setIsCockpitView]       = useState(false);
  const [showWindVectors, setShowWindVectors]   = useState(false);
  const [isARModalOpen, setIsARModalOpen]       = useState(false);
  const [isARActive, setIsARActive]             = useState(false);
  const [showDispatchRoom, setShowDispatchRoom] = useState(false);
  const [planeTelemetry, setPlaneTelemetry]     = useState({ lat: 40.64, lng: -73.77, progress: 0.45 });

  // Sync stored waypoints
  useEffect(() => {
    if (storedWps && storedWps.length >= 2) {
      if (storedWps[0]) setOrigin(storedWps[0]);
      if (storedWps[storedWps.length - 1]) setDestination(storedWps[storedWps.length - 1]);
    }
  }, [storedWps]);

  // Reactive listener for AI Copilot spatial commands & voice triggers
  useEffect(() => {
    if (!lastSpatialCommand) return;
    if (lastSpatialCommand._arTrigger || lastSpatialCommand.action === "TRIGGER_AR_MODE") {
      setIsARModalOpen(true);
    }
    if (lastSpatialCommand._cockpitTrigger || lastSpatialCommand.action === "TRIGGER_COCKPIT_VIEW") {
      setIsCockpitView(true);
    }
    if (lastSpatialCommand._jetstreamTrigger || lastSpatialCommand.action === "TOGGLE_JETSTREAM") {
      setShowWindVectors((prev) => lastSpatialCommand.params?.enabled ?? !prev);
    }
  }, [lastSpatialCommand]);

  // Throttled plane position callback to prevent unnecessary re-render loops
  const handlePlanePosChange = useCallback((pos, prog) => {
    setPlaneTelemetry((prev) => {
      if (Math.abs(prev.progress - prog) < 0.005) return prev;
      return { lat: pos.lat, lng: pos.lng, progress: prog };
    });
  }, []);

  function handleUpdateSearch(params) {
    if (params.origin)      { setOrigin(params.origin); }
    if (params.destination) { setDestination(params.destination); }
    if (params.date)        { setDepartureDate(params.date); }
    if (params.travelClass) { setTravelClass(params.travelClass); }
    if (params.passengers)  { setPassengers(params.passengers); }
    setStoreWps([params.origin || origin, params.destination || destination]);
  }

  function handleFlightSelect(flight) {
    setSelectedFlight(flight);
    setSeatModalOpen(true);
    sound.playSeatSelect();
  }

  function handleConfirmBooking(bookingData) {
    const bookingRef = `FG-${Math.floor(100000 + Math.random() * 900000)}`;
    const pass = {
      id: `T-${Math.floor(1000 + Math.random() * 9000)}`,
      bookingRef,
      flight: bookingData.flight,
      seat: bookingData.seat,
      totalPrice: bookingData.totalPrice,
      currency: bookingData.flight?.currency || currency,
      currencySymbol: bookingData.flight?.currencySymbol || "$",
      origin: bookingData.flight?.origin || origin,
      destination: bookingData.flight?.destination || destination,
      gate: `${String.fromCharCode(65 + Math.floor(Math.random() * 4))}${Math.floor(1 + Math.random() * 24)}`,
      terminal: `T${Math.floor(1 + Math.random() * 3)}`,
      group: bookingData.seat?.[0] === "1" || bookingData.seat?.[0] === "2" ? "A" : "B",
      date: departureDate,
    };
    addTrip(pass);
    createBookingAPI(pass).catch((err) => console.warn("Failed to persist booking from Explore:", err));
    addStamp({
      origin: pass.origin,
      destination: pass.destination,
      date: departureDate,
      flightCode: pass.flight?.code || pass.flight?.callsign || "FL-101",
    });
    setSeatModalOpen(false);
    setConfirmedPass(pass);
  }

  return (
    <div className="relative w-full h-screen overflow-hidden" style={{ background: "var(--void)" }}>

      {/* ── 1. FULL-BLEED 3D GLOBE — centered, vignette-masked ─────────── */}
      <div className="absolute inset-0 globe-vignette" style={{ touchAction: "pan-y" }}>
        <React.Suspense fallback={<div className="absolute inset-0 flex items-center justify-center text-white/50 text-xs tracking-widest font-mono">LOADING 3D GLOBE ENGINE...</div>}><Interactive3DGlobeTracker
          origin={origin}
          destination={destination}
          activeFlight={selectedFlight}
          fullBleed={true}
          isCockpitView={isCockpitView}
          showWindVectors={showWindVectors}
          onPlanePosChange={handlePlanePosChange}
        /></React.Suspense>
      </div>

      {/* ── Deep-space ambient gradient underlays ──────────────────────── */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/3 w-96 h-96 rounded-full opacity-5"
          style={{ background: "radial-gradient(circle, #00F2FE 0%, transparent 70%)" }} />
        <div className="absolute bottom-1/4 right-1/4 w-72 h-72 rounded-full opacity-4"
          style={{ background: "radial-gradient(circle, #7928CA 0%, transparent 70%)" }} />
      </div>

      {/* ── 2. FLOATING SEARCH MATRIX — z-30, top of viewport ─────────── */}
      <div className="absolute inset-x-0 top-[84px] sm:top-[88px] z-30 flex justify-center px-4 pointer-events-auto">
        <SearchMatrix
          origin={origin}
          destination={destination}
          departureDate={departureDate}
          passengers={passengers}
          travelClass={travelClass}
          onUpdateSearch={handleUpdateSearch}
        />
      </div>

      {/* ── 3. LEFT FLIGHT STREAM MATRIX — z-20, collapsible drawer ─────── */}
      <AnimatePresence>
        {flightsPanelOpen ? (
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -30 }}
            transition={{ duration: 0.22 }}
            className="absolute left-4 z-20 pointer-events-auto hidden md:flex flex-col"
            style={{ top: "188px", bottom: "24px", width: "min(480px, calc(100vw - 32px))" }}
          >
            {/* Minimize toggle button bar */}
            <div className="flex justify-end pb-1 pr-1">
              <button
                type="button"
                onClick={() => { sound.playClick(); setFlightsPanelOpen(false); }}
                className="px-2.5 py-1 rounded-xl glass text-[10px] mono font-bold text-slate-400 hover:text-cyan-300 transition-colors flex items-center gap-1 cursor-pointer"
                title="Minimize Flight List to inspect 3D Globe"
              >
                <span>HIDE FLIGHTS</span>
                <ChevronDown size={11} />
              </button>
            </div>
            <div className="flex-1 overflow-hidden">
              <FlightStreamMatrix
                origin={origin}
                destination={destination}
                selectedFlight={selectedFlight}
                onSelectFlight={handleFlightSelect}
                currency={currency}
              />
            </div>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="absolute left-4 z-20 pointer-events-auto"
            style={{ top: "188px" }}
          >
            <button
              type="button"
              onClick={() => { sound.playClick(); setFlightsPanelOpen(true); }}
              className="btn-aurora flex items-center gap-2 px-4 py-3 rounded-2xl shadow-2xl cursor-pointer"
              title="Show live flight offers"
            >
              <Plane size={14} className="-rotate-45" />
              <span className="mono font-bold text-xs tracking-wider">SHOW FLIGHTS</span>
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── 3.5. FLIGHT DECK DOCK — Desktop full dock (md+), Mobile FAB (< md) ─ */}

      {/* DESKTOP DOCK (md and above) */}
      <div className="hidden md:flex absolute top-[188px] right-4 sm:right-6 z-30 flex-col gap-2 pointer-events-auto">
        {/* Live GDS Fares Engine Jump */}
        <button type="button"
          onClick={() => {
            sound.playClick();
            const fromCode = origin?.iata || origin?.code;
            const toCode = destination?.iata || destination?.code;
            navigate(`/booking?from=${fromCode}&to=${toCode}`);
          }}
          className="flex items-center gap-2.5 px-3.5 py-2.5 rounded-2xl mono text-xs font-bold transition-all shadow-2xl cursor-pointer bg-cyan-500/15 text-cyan-300 border border-cyan-400/40 hover:bg-cyan-500/25 hover:border-cyan-300 hover:text-white"
          title="Search live fares and 7-day matrix on GDS Booking Engine">
          <Plane size={15} className="text-cyan-400" />
          <span>GDS FARES</span>
        </button>

        {/* Cockpit POV Toggle */}
        <button type="button"
          onClick={() => { sound.playClick(); setIsCockpitView((prev) => !prev); }}
          className={`flex items-center gap-2.5 px-3.5 py-2.5 rounded-2xl mono text-xs font-bold transition-all shadow-2xl cursor-pointer ${
            isCockpitView ? "bg-cyan-500/25 text-cyan-300 border border-cyan-400/80 shadow-[0_0_24px_rgba(0,242,254,0.45)]"
              : "glass text-slate-300 hover:text-white hover:border-cyan-400/50"
          }`} title="Toggle First-Person Cockpit Camera & HUD">
          <Eye size={15} className={isCockpitView ? "text-cyan-400 animate-pulse" : "text-cyan-400"} />
          <span>{isCockpitView ? "EXIT COCKPIT" : "COCKPIT POV"}</span>
        </button>

        {/* Jetstream Winds Toggle */}
        <button type="button"
          onClick={() => { sound.playClick(); setShowWindVectors((prev) => !prev); }}
          className={`flex items-center gap-2.5 px-3.5 py-2.5 rounded-2xl mono text-xs font-bold transition-all shadow-2xl cursor-pointer ${
            showWindVectors ? "bg-emerald-500/25 text-emerald-300 border border-emerald-400/80 shadow-[0_0_24px_rgba(0,255,163,0.45)]"
              : "glass text-slate-300 hover:text-white hover:border-emerald-400/50"
          }`} title="Toggle Global Jetstream Wind Streamlines">
          <Wind size={15} className={showWindVectors ? "text-emerald-400 animate-spin" : "text-emerald-400"} />
          <span>{showWindVectors ? "WINDS ON" : "JETSTREAM"}</span>
        </button>

        {/* Live Weather Doppler Radar Toggle */}
        <button type="button"
          onClick={() => {
            sound.playClick();
            setActiveOverlayLayer(activeOverlayLayer === "weather" ? "none" : "weather");
          }}
          className={`flex items-center gap-2.5 px-3.5 py-2.5 rounded-2xl mono text-xs font-bold transition-all shadow-2xl cursor-pointer ${
            activeOverlayLayer === "weather"
              ? "bg-sky-500/25 text-sky-300 border border-sky-400/80 shadow-[0_0_24px_rgba(56,189,248,0.45)]"
              : "glass text-slate-300 hover:text-white hover:border-sky-400/50"
          }`} title="Toggle Live Doppler Weather Radar & Storm Cells">
          <CloudRain size={15} className={activeOverlayLayer === "weather" ? "text-sky-400 animate-pulse" : "text-sky-400"} />
          <span>{activeOverlayLayer === "weather" ? "RADAR ON" : "WEATHER"}</span>
        </button>

        {/* Day/Night Terminator Toggle */}
        <button type="button"
          onClick={() => { sound.playClick(); setShowDayNight(!showDayNight); }}
          className={`flex items-center gap-2.5 px-3.5 py-2.5 rounded-2xl mono text-xs font-bold transition-all shadow-2xl cursor-pointer ${
            showDayNight ? "bg-amber-500/25 text-amber-300 border border-amber-400/80 shadow-[0_0_24px_rgba(251,191,36,0.45)]"
              : "glass text-slate-300 hover:text-white hover:border-amber-400/50"
          }`} title="Toggle Day/Night Terminator">
          {showDayNight ? <Sun size={15} className="text-amber-400" /> : <Moon size={15} className="text-amber-400" />}
          <span>{showDayNight ? "DAY VIEW" : "NIGHT MODE"}</span>
        </button>

        {/* Spatial AR Launcher */}
        <button type="button"
          onClick={() => { sound.playClick(); setIsARModalOpen(true); }}
          className="flex items-center gap-2.5 px-3.5 py-2.5 rounded-2xl mono text-xs font-bold glass text-purple-300 hover:text-white hover:border-purple-400/60 transition-all shadow-2xl cursor-pointer border border-purple-500/30 shadow-[0_0_16px_rgba(184,0,255,0.25)]"
          title="Launch WebXR Spatial AR Hologram Mode">
          <Box size={15} className="text-purple-400" />
          <span>SPATIAL AR</span>
        </button>

        {/* Dispatch Room */}
        <button type="button"
          onClick={() => { sound.playClick(); setShowDispatchRoom(true); }}
          className="flex items-center gap-2.5 px-3.5 py-2.5 rounded-2xl mono text-xs font-bold glass text-blue-300 hover:text-white hover:border-blue-400/60 transition-all shadow-2xl cursor-pointer border border-blue-500/30"
          title="Open Collaborative Dispatch Room">
          <Users size={15} className="text-blue-400" />
          <span>DISPATCH ROOM</span>
        </button>
      </div>

      {/* MOBILE FAB (below md) */}
      <div className="md:hidden absolute z-30 pointer-events-auto" style={{ bottom: "90px", right: "16px" }}>
        <FlightDeckFAB
          isCockpitView={isCockpitView}
          showWindVectors={showWindVectors}
          onToggleCockpit={() => setIsCockpitView((p) => !p)}
          onToggleJetstream={() => setShowWindVectors((p) => !p)}
          onOpenAR={() => setIsARModalOpen(true)}
        />
      </div>

      {/* ── 4. LIVE TELEMETRY HUD PILL — bottom right (offset to not collide with Copilot) ─ */}
      <div
        className="absolute bottom-6 right-6 sm:right-[180px] z-20 hidden sm:flex items-center gap-3 px-4 py-2 rounded-2xl pointer-events-auto"
        style={{
          background: "rgba(13,17,27,0.85)",
          backdropFilter: "blur(28px)",
          WebkitBackdropFilter: "blur(28px)",
          border: "1px solid rgba(255,255,255,0.08)",
          boxShadow: "inset 0 1px 1px rgba(255,255,255,0.10)",
        }}
      >
        <div className="flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full beacon" style={{ background: "#00FFA3", boxShadow: "0 0 6px #00FFA3" }} />
          <span className="mono text-[10px] font-bold" style={{ color: "#00F2FE" }}>
            LIVE: {selectedFlight?.callsign || selectedFlight?.code || "RADAR SYNCED"}
          </span>
        </div>
        <div className="w-px h-4" style={{ background: "rgba(255,255,255,0.1)" }} />
        <span className="mono text-[10px]" style={{ color: "#7A85A0" }}>FL380</span>
        <div className="w-px h-4" style={{ background: "rgba(255,255,255,0.1)" }} />
        <span className="mono text-[10px]" style={{ color: "#7A85A0" }}>492 KTS</span>
        <div className="w-px h-4 hidden sm:block" style={{ background: "rgba(255,255,255,0.1)" }} />
        <span className="mono text-[10px] hidden sm:block" style={{ color: "#00FFA3" }}>OPTIMAL CORRIDOR</span>
      </div>

      {/* ── 5. KINETIC SEAT SELECTION MODAL (fullscreen overlay) ────────── */}
      <AnimatePresence>
        {seatModalOpen && (
          <div
            className="fixed inset-0 z-40 flex items-stretch justify-end pointer-events-auto"
            style={{ background: "rgba(5,6,10,0.82)", backdropFilter: "blur(16px)" }}
          >
            {/* Click outside to close */}
            <div className="flex-1" onClick={() => setSeatModalOpen(false)} />

            <motion.div
              initial={{ x: "100%", opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: "100%", opacity: 0 }}
              transition={{ type: "spring", stiffness: 340, damping: 32 }}
              className="relative flex flex-col overflow-hidden"
              style={{
                width: "min(500px, 100vw)",
                height: "100vh",
                background: "rgba(13,17,27,0.97)",
                backdropFilter: "blur(32px)",
                borderLeft: "1px solid rgba(255,255,255,0.08)",
                boxShadow: "-24px 0 80px rgba(0,0,0,0.6), inset 1px 0 1px rgba(255,255,255,0.10)",
              }}
            >
              {/* Aurora side accent line */}
              <div className="absolute left-0 inset-y-0 w-0.5"
                style={{ background: "linear-gradient(to bottom, transparent, #00F2FE, #7928CA, transparent)" }} />

              {/* Close */}
              <div className="flex items-center justify-between px-6 pt-6 pb-4 flex-shrink-0"
                style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
                <div>
                  <div className="mono text-[10px] tracking-widest text-cyan-400">CABIN ASSIGNMENT</div>
                  <div className="font-bold text-base" style={{ color: "#E8EAF0" }}>
                    {selectedFlight?.airline} · {selectedFlight?.callsign}
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setSeatModalOpen(false);
                      const fromCode = origin?.iata || origin?.code;
                      const toCode = destination?.iata || destination?.code;
                      navigate(`/booking?from=${fromCode}&to=${toCode}`);
                    }}
                    className="text-[10px] mono text-cyan-400 hover:text-cyan-300 hover:underline flex items-center gap-1 mt-0.5 font-bold cursor-pointer"
                  >
                    <span>Prefer live multi-carrier fares? Search GDS Engine ↗</span>
                  </button>
                </div>
                <button type="button" onClick={() => setSeatModalOpen(false)}
                  className="p-2 rounded-xl cursor-pointer hover:bg-white/10 transition-colors"
                  style={{ color: "#7A85A0" }}>
                  <X size={18} />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-6 no-scrollbar">
                <KineticSeatCanvas
                  selectedFlight={selectedFlight}
                  onConfirmBooking={handleConfirmBooking}
                  currency={currency}
                />
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ── 6. BOARDING PASS MODAL ─────────────────────────────────────── */}
      <AnimatePresence>
        {confirmedPass && (
          <BoardingPassModal
            pass={confirmedPass}
            onClose={() => setConfirmedPass(null)}
            onViewTrips={() => { setConfirmedPass(null); navigate("/passport"); }}
          />
        )}
      </AnimatePresence>

      {/* ── 7. FIRST-PERSON COCKPIT HUD OVERLAY ─────────────────────────── */}
      {isCockpitView && (
        <React.Suspense fallback={null}><CockpitHUD
          origin={origin}
          destination={destination}
          progress={planeTelemetry.progress}
          onExitCockpit={() => setIsCockpitView(false)}
        /></React.Suspense>
      )}

      {/* ── 9. COLLABORATIVE DISPATCH ROOM MODAL ──────────────────────── */}
      {showDispatchRoom && (
        <DispatchRoom onClose={() => setShowDispatchRoom(false)} />
      )}
    </div>
  );
}
