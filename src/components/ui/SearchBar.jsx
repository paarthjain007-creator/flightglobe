import React, { useState, useRef, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search, ArrowRightLeft, Check, MapPin, Calendar, Users,
  Sparkles, ChevronDown, DollarSign, Globe
} from "lucide-react";
import { AIRPORTS as FULL_AIRPORTS } from "../../data/airports";
import { sound } from "../../utils/soundFx";

// Featured major international airports
export const DEFAULT_AIRPORTS = [
  { iata: "DEL", name: "Indira Gandhi International Airport", city: "New Delhi", country: "India", lat: 28.5562, lng: 77.1000 },
  { iata: "BOM", name: "Chhatrapati Shivaji Maharaj International", city: "Mumbai", country: "India", lat: 19.0896, lng: 72.8656 },
  { iata: "LHR", name: "Heathrow Airport", city: "London", country: "United Kingdom", lat: 51.4700, lng: -0.4543 },
  { iata: "DXB", name: "Dubai International Airport", city: "Dubai", country: "United Arab Emirates", lat: 25.2532, lng: 55.3657 },
  { iata: "JFK", name: "John F. Kennedy International Airport", city: "New York", country: "United States", lat: 40.6413, lng: -73.7781 },
  { iata: "SIN", name: "Singapore Changi Airport", city: "Singapore", country: "Singapore", lat: 1.3644, lng: 103.9915 },
  { iata: "HND", name: "Tokyo Haneda Airport", city: "Tokyo", country: "Japan", lat: 35.5494, lng: 139.7798 },
  { iata: "CDG", name: "Charles de Gaulle Airport", city: "Paris", country: "France", lat: 49.0097, lng: 2.5479 },
  { iata: "SYD", name: "Sydney Kingsford Smith Airport", city: "Sydney", country: "Australia", lat: -33.9399, lng: 151.1753 },
  { iata: "FRA", name: "Frankfurt Airport", city: "Frankfurt", country: "Germany", lat: 50.0379, lng: 8.5622 },
  { iata: "DOH", name: "Hamad International Airport", city: "Doha", country: "Qatar", lat: 25.2731, lng: 51.6081 },
  { iata: "SFO", name: "San Francisco International Airport", city: "San Francisco", country: "United States", lat: 37.6213, lng: -122.3790 },
];

export const AIRPORTS = DEFAULT_AIRPORTS.map(a => ({
  code: a.iata,
  city: a.city,
  name: a.name,
  country: a.country,
  lat: a.lat,
  lon: a.lng
}));

/* ── Interactive Airport Combobox ─────────────────────────────── */
function AirportPicker({ label, value, onChange }) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const ref = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (ref.current && !ref.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return AIRPORTS;
    
    const all = FULL_AIRPORTS.map(a => ({
      code: a.iata,
      city: a.city,
      name: a.name,
      country: a.country,
      lat: a.lat,
      lon: a.lng || a.lon || 0
    }));

    return all.filter(a =>
      a.code.toLowerCase().includes(q) ||
      a.city.toLowerCase().includes(q) ||
      (a.name && a.name.toLowerCase().includes(q)) ||
      (a.country && a.country.toLowerCase().includes(q))
    ).slice(0, 15);
  }, [query]);

  return (
    <div ref={ref} className="relative flex-1 min-w-[130px]">
      <div className="text-[10px] font-bold uppercase tracking-widest mb-1 mono flex items-center gap-1 text-[#86868b]">
        <MapPin size={10} className="text-[#2997ff]" />
        {label}
      </div>

      <button
        type="button"
        onClick={() => {
          sound.playClick();
          setOpen(!open);
          setTimeout(() => inputRef.current?.focus(), 50);
        }}
        className="w-full flex items-center justify-between gap-2 px-3 py-2 rounded-2xl cursor-pointer text-left transition-all hover:border-white/20"
        style={{
          background: "rgba(255, 255, 255, 0.04)",
          border: open ? "1px solid rgba(41, 151, 255, 0.5)" : "1px solid rgba(255, 255, 255, 0.1)",
          boxShadow: open ? "0 0 12px rgba(41, 151, 255, 0.15)" : "none",
        }}
      >
        <div className="min-w-0">
          <div className="text-lg font-black mono leading-none text-[#2997ff]">
            {value?.code || value?.iata || "DEL"}
          </div>
          <div className="text-[11px] truncate font-medium text-slate-200 mt-0.5">
            {value?.city || "New Delhi"}
          </div>
        </div>
        <ChevronDown size={13} className={`transition-transform duration-200 ${open ? "rotate-180 text-[#2997ff]" : "text-[#86868b]"}`} />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -6, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.98 }}
            transition={{ duration: 0.15 }}
            className="absolute top-full left-0 right-0 mt-1.5 rounded-2xl p-2 z-50 shadow-2xl"
            style={{
              background: "rgba(22, 22, 24, 0.96)",
              border: "1px solid rgba(255, 255, 255, 0.12)",
              backdropFilter: "blur(24px)",
              minWidth: "260px",
            }}
          >
            <div className="p-1 mb-1">
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search city, IATA code, or airport..."
                className="w-full px-3 py-2 rounded-xl text-sm font-medium outline-none bg-black/40 border border-white/10 text-white placeholder-[#86868b] focus:border-[#2997ff]"
              />
            </div>

            <ul className="max-h-48 overflow-y-auto no-scrollbar space-y-1">
              {filtered.map((a) => (
                <li key={a.code}>
                  <button
                    type="button"
                    onClick={() => {
                      sound.playClick();
                      onChange(a);
                      setOpen(false);
                      setQuery("");
                    }}
                    className="w-full flex items-center justify-between px-3 py-1.5 rounded-xl text-left cursor-pointer transition-colors"
                    style={{
                      background: (value?.code || value?.iata) === a.code ? "rgba(41, 151, 255, 0.12)" : "transparent",
                      color: (value?.code || value?.iata) === a.code ? "#2997ff" : "#F8FAFC",
                    }}
                    onMouseEnter={(e) => {
                      if ((value?.code || value?.iata) !== a.code) e.currentTarget.style.background = "rgba(255,255,255,0.06)";
                    }}
                    onMouseLeave={(e) => {
                      if ((value?.code || value?.iata) !== a.code) e.currentTarget.style.background = "transparent";
                    }}
                  >
                    <div>
                      <div className="text-xs font-bold">{a.city}</div>
                      <div className="text-[10px] text-[#86868b] truncate max-w-[170px]">{a.name}</div>
                    </div>
                    <span className="mono font-bold text-[11px] px-2 py-0.5 rounded-md"
                      style={{ background: "rgba(255,255,255,0.08)", color: "#2997ff" }}>
                      {a.code}
                    </span>
                  </button>
                </li>
              ))}
              {filtered.length === 0 && (
                <div className="text-center py-3 text-xs text-[#86868b] mono">
                  No airports found
                </div>
              )}
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ── Main Living Search Bar ──────────────────────────────────── */
export default function SearchBar({
  fromAirport,
  toAirport,
  onSearch,
  currency = "INR",
  onCurrencyChange
}) {
  const [origin, setOrigin] = useState(fromAirport || AIRPORTS[0]);
  const [dest, setDest]     = useState(toAirport || AIRPORTS[2]);
  const [tripType, setTripType] = useState("oneway");
  const [date, setDate]     = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 5);
    return d.toISOString().split("T")[0];
  });
  const [travelClass, setTravelClass] = useState("Economy");
  const [travelers, setTravelers]     = useState(1);
  const [submitted, setSubmitted]     = useState(false);

  useEffect(() => {
    if (fromAirport) setOrigin(fromAirport);
  }, [fromAirport]);

  useEffect(() => {
    if (toAirport) setDest(toAirport);
  }, [toAirport]);

  function swap() {
    sound.playClick();
    const temp = origin;
    setOrigin(dest);
    setDest(temp);
  }

  function handleSubmit(e) {
    e?.preventDefault();
    if (origin.code === dest.code) return;
    sound.playRadarPulse();
    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      onSearch?.({ origin, dest, date, travelClass, travelers, tripType });
    }, 600);
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="w-full"
    >
      <div
        className="glass rounded-3xl p-3 sm:p-4 flex flex-col gap-3 shadow-2xl border border-white/10"
      >
        {/* Top Controls: Trip Type & Currency */}
        <div className="flex items-center justify-between border-b border-white/5 pb-2.5">
          {/* Trip Type Toggle */}
          <div className="flex items-center gap-1 glass p-0.5 rounded-xl border border-white/10">
            {[
              { id: "oneway", label: "One-Way" },
              { id: "round",  label: "Round-Trip" },
            ].map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => {
                  sound.playClick();
                  setTripType(t.id);
                }}
                className={`px-3 py-1 rounded-lg text-[10px] font-bold mono transition-all cursor-pointer ${
                  tripType === t.id
                    ? "bg-white/10 text-white border border-white/20 shadow-sm"
                    : "text-[#86868b] hover:text-white"
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>

          {/* Currency Switcher */}
          {onCurrencyChange && (
            <div className="flex items-center gap-1.5 text-[10px] mono text-[#86868b]">
              <DollarSign size={11} className="text-[#2997ff]" />
              <span>Currency:</span>
              <select
                value={currency}
                onChange={(e) => {
                  sound.playClick();
                  onCurrencyChange(e.target.value);
                }}
                className="bg-white/5 border border-white/15 text-slate-200 px-2 py-0.5 rounded-lg font-bold outline-none cursor-pointer"
              >
                <option value="INR" className="bg-[#161618]">INR (₹)</option>
                <option value="USD" className="bg-[#161618]">USD ($)</option>
                <option value="EUR" className="bg-[#161618]">EUR (€)</option>
                <option value="GBP" className="bg-[#161618]">GBP (£)</option>
                <option value="AED" className="bg-[#161618]">AED (د.إ)</option>
                <option value="SGD" className="bg-[#161618]">SGD (S$)</option>
              </select>
            </div>
          )}
        </div>

        {/* Origin / Dest row */}
        <div className="flex flex-col sm:flex-row items-center gap-2.5">
          <AirportPicker label="From (Origin)" value={origin} onChange={setOrigin} />

          {/* Swap action */}
          <motion.button
            type="button"
            whileHover={{ rotate: 180, scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
            onClick={swap}
            aria-label="Swap origin and destination"
            className="sm:mt-4 w-9 h-9 rounded-2xl flex items-center justify-center cursor-pointer flex-shrink-0 bg-white/5 border border-white/10 text-[#86868b] hover:text-white hover:bg-white/10 transition-colors"
          >
            <ArrowRightLeft size={14} />
          </motion.button>

          <AirportPicker label="To (Destination)" value={dest} onChange={setDest} />
        </div>

        {/* Date, Class, and Submit Row */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 items-end">
          {/* Departure Date */}
          <div>
            <div className="text-[10px] font-bold uppercase tracking-widest mb-1 mono flex items-center gap-1 text-[#86868b]">
              <Calendar size={10} className="text-[#2997ff]" />
              Departure Date
            </div>
            <input
              type="date"
              value={date}
              min={new Date().toISOString().split("T")[0]}
              onChange={(e) => setDate(e.target.value)}
              className="w-full px-3 py-2 rounded-2xl mono text-xs font-semibold outline-none cursor-pointer bg-white/5 border border-white/10 text-white"
              style={{ fontSize: "13px" }}
            />
          </div>

          {/* Cabin Class & Pax */}
          <div className="flex gap-2">
            <div className="flex-1">
              <div className="text-[10px] font-bold uppercase tracking-widest mb-1 mono flex items-center gap-1 text-[#86868b]">
                <Sparkles size={10} className="text-[#2997ff]" />
                Cabin
              </div>
              <select
                value={travelClass}
                onChange={(e) => setTravelClass(e.target.value)}
                className="w-full px-2 py-2 rounded-2xl mono text-xs font-semibold outline-none cursor-pointer bg-[#161618] border border-white/10 text-white"
              >
                <option value="Economy">Economy</option>
                <option value="Premium">Prem. Economy</option>
                <option value="Business">Business</option>
                <option value="First">First Class</option>
              </select>
            </div>

            <div className="w-20">
              <div className="text-[10px] font-bold uppercase tracking-widest mb-1 mono flex items-center gap-1 text-[#86868b]">
                <Users size={10} className="text-[#2997ff]" />
                Pax
              </div>
              <select
                value={travelers}
                onChange={(e) => setTravelers(Number(e.target.value))}
                className="w-full px-2 py-2 rounded-2xl mono text-xs font-semibold outline-none cursor-pointer bg-[#161618] border border-white/10 text-white"
              >
                {[1, 2, 3, 4, 5, 6].map(n => (
                  <option key={n} value={n}>{n} Pax</option>
                ))}
              </select>
            </div>
          </div>

          {/* Search Button */}
          <div>
            <motion.button
              type="submit"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full py-2.5 rounded-2xl flex items-center justify-center gap-2 text-white font-bold text-xs cursor-pointer relative overflow-hidden transition-all"
              style={{
                background: "#0071e3",
                boxShadow: submitted
                  ? "0 0 20px rgba(0, 113, 227, 0.6)"
                  : "0 2px 10px rgba(0, 113, 227, 0.35)",
              }}
            >
              <AnimatePresence mode="wait" initial={false}>
                {submitted ? (
                  <motion.span
                    key="check"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    exit={{ scale: 0 }}
                    className="flex items-center gap-1.5"
                  >
                    <Check size={15} /> Scanning Airspace...
                  </motion.span>
                ) : (
                  <motion.span
                    key="search"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="flex items-center gap-1.5"
                  >
                    <Search size={14} /> Update Direct Routes
                  </motion.span>
                )}
              </AnimatePresence>
            </motion.button>
          </div>
        </div>

        {/* Same-airport validation */}
        {origin.code === dest.code && (
          <div className="text-[11px] text-rose-400 mono flex items-center gap-1">
            ⚠️ Please choose distinct departure and arrival airports.
          </div>
        )}
      </div>
    </form>
  );
}
