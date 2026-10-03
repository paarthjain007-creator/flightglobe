import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowRight, Check, Calendar, Users, DollarSign,
  ArrowRightLeft, Sparkles, MapPin, X, ChevronDown, SlidersHorizontal
} from "lucide-react";
import { AIRPORTS as ALL_AIRPORTS } from "../../data/airports";
import { sound } from "../../utils/soundFx";

export default function LivingHeroSearchBar({
  origin,
  destination,
  departureDate,
  travelClass,
  passengers,
  currency,
  onUpdateSearch,
}) {
  const [isOpen, setIsOpen] = useState(false);

  // Local editable draft state when modal is open
  const [draftOrigin, setDraftOrigin] = useState(origin);
  const [draftDest, setDraftDest] = useState(destination);
  const [draftDate, setDraftDate] = useState(departureDate || new Date().toISOString().split("T")[0]);
  const [draftClass, setDraftClass] = useState(travelClass || "Economy");
  const [draftPax, setDraftPax] = useState(passengers || 1);
  const [draftCurr, setDraftCurr] = useState(currency || "USD");

  const [originSearchQuery, setOriginSearchQuery] = useState("");
  const [destSearchQuery, setDestSearchQuery] = useState("");
  const [originDropdownOpen, setOriginDropdownOpen] = useState(false);
  const [destDropdownOpen, setDestDropdownOpen] = useState(false);

  // Sync draft when props change
  useEffect(() => {
    setDraftOrigin(origin);
    setDraftDest(destination);
  }, [origin, destination]);

  const originCode = origin?.code || origin?.iata || "JFK";
  const destCode = destination?.code || destination?.iata || "LHR";

  // Filter airports for pickers
  const filteredOrigins = ALL_AIRPORTS.filter((a) => {
    const q = originSearchQuery.toLowerCase();
    return a.iata.toLowerCase().includes(q) || a.city.toLowerCase().includes(q) || a.name.toLowerCase().includes(q);
  }).slice(0, 8);

  const filteredDests = ALL_AIRPORTS.filter((a) => {
    const q = destSearchQuery.toLowerCase();
    return a.iata.toLowerCase().includes(q) || a.city.toLowerCase().includes(q) || a.name.toLowerCase().includes(q);
  }).slice(0, 8);

  function handleSwap() {
    sound.playClick();
    const temp = draftOrigin;
    setDraftOrigin(draftDest);
    setDraftDest(temp);
  }

  function handleApply() {
    sound.playRadarPulse();
    onUpdateSearch({
      origin: draftOrigin,
      destination: draftDest,
      date: draftDate,
      travelClass: draftClass,
      passengers: draftPax,
      currency: draftCurr,
    });
    setIsOpen(false);
  }

  return (
    <div className="relative flex justify-center w-full z-40">
      {/* ─── The Living Hero Pill (Collapsed State) ────────────────────── */}
      <motion.button
        type="button"
        layoutId="living-hero-pill"
        onClick={() => { sound.playClick(); setIsOpen(true); }}
        className="group relative flex items-center justify-between gap-4 px-6 sm:px-8 py-3 rounded-full glow-pill cursor-pointer shadow-2xl transition-all duration-300 hover:scale-[1.02] active:scale-[0.99] max-w-xl w-full glass-prism"
      >
        <div className="flex items-center gap-3 sm:gap-4 font-mono">
          <div className="flex items-center gap-2 text-white font-black text-base sm:text-lg tracking-wider">
            <span className="text-fuchsia-300 drop-shadow-[0_0_8px_rgba(6,182,212,0.8)]">{originCode}</span>
            <ArrowRight size={16} className="text-slate-400 group-hover:translate-x-1 transition-transform" />
            <span className="text-indigo-300 drop-shadow-[0_0_8px_rgba(165,180,252,0.8)]">{destCode}</span>
          </div>
          <span className="text-slate-400 font-sans">|</span>
          <span className="text-xs sm:text-sm font-sans font-medium text-slate-300">
            {draftDate ? new Date(draftDate).toLocaleDateString("en-US", { month: "short", day: "numeric" }) : "Tomorrow"}
          </span>
        </div>

        {/* Morphing Circular Checkmark Indicator */}
        <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-cyan-400 to-indigo-500 flex items-center justify-center text-slate-950 shadow-[0_0_15px_rgba(6,182,212,0.6)] group-hover:shadow-[0_0_22px_rgba(6,182,212,0.9)] transition-shadow flex-shrink-0">
          <Check size={16} strokeWidth={3} />
        </div>
      </motion.button>

      {/* ─── Expanding Glass Command Center Modal ──────────────────────── */}
      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="obsidian-panel rounded-3xl p-6 sm:p-8 max-w-2xl w-full border border-fuchsia-400/30 shadow-[0_0_50px_rgba(6,182,212,0.25)] space-y-6 relative"
            >
              {/* Modal Header */}
              <div className="flex items-center justify-between border-b border-white/10 pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-2xl bg-fuchsia-500/20 border border-fuchsia-400/40 flex items-center justify-center text-fuchsia-300">
                    <Sparkles size={18} />
                  </div>
                  <div>
                    <h3 className="text-base font-black text-white">Living Flight Search Engine</h3>
                    <p className="text-xs text-slate-400">Select origins, destinations, and cabin preferences</p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => { sound.playClick(); setIsOpen(false); }}
                  className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Origin / Destination Selectors */}
              <div className="grid grid-cols-1 sm:grid-cols-11 gap-3 items-center">
                {/* Origin Picker */}
                <div className="sm:col-span-5 relative">
                  <label className="text-xs mono uppercase font-bold text-fuchsia-400 mb-1 flex items-center gap-1">
                    <MapPin size={11} /> Origin City / Airport
                  </label>
                  <button
                    type="button"
                    onClick={() => setOriginDropdownOpen(!originDropdownOpen)}
                    className="w-full px-4 py-3 rounded-2xl glass border border-white/12 flex items-center justify-between text-left hover:border-fuchsia-400/40 transition-colors"
                  >
                    <div>
                      <div className="text-base font-black mono text-fuchsia-300">{draftOrigin?.code || draftOrigin?.iata || "JFK"}</div>
                      <div className="text-xs text-slate-300 truncate">{draftOrigin?.city || "New York"}</div>
                    </div>
                    <ChevronDown size={14} className="text-slate-400" />
                  </button>

                  {originDropdownOpen && (
                    <div className="absolute top-full left-0 right-0 mt-2 p-2 rounded-2xl obsidian-panel border border-white/15 shadow-2xl z-50 max-h-56 overflow-y-auto">
                      <input
                        type="text"
                        placeholder="Search origin airport..."
                        value={originSearchQuery}
                        onChange={(e) => setOriginSearchQuery(e.target.value)}
                        className="w-full px-3 py-2 mb-2 rounded-xl bg-white/5 border border-white/10 text-xs text-white outline-none focus:border-fuchsia-400"
                        autoFocus
                      />
                      <div className="space-y-1">
                        {filteredOrigins.map((ap) => (
                          <button
                            key={ap.iata}
                            type="button"
                            onClick={() => {
                              setDraftOrigin({ code: ap.iata, iata: ap.iata, city: ap.city, name: ap.name, lat: ap.lat, lng: ap.lng, lon: ap.lng });
                              setOriginDropdownOpen(false);
                            }}
                            className="w-full px-3 py-2 rounded-xl hover:bg-fuchsia-500/20 text-left text-xs flex items-center justify-between text-slate-200 hover:text-fuchsia-300"
                          >
                            <span className="font-bold">{ap.city} ({ap.iata})</span>
                            <span className="text-xs text-slate-400 truncate max-w-[120px]">{ap.name}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Swap Button */}
                <div className="sm:col-span-1 flex justify-center">
                  <button
                    type="button"
                    onClick={handleSwap}
                    className="p-3 rounded-2xl glass border border-white/12 hover:border-fuchsia-400 text-fuchsia-400 hover:bg-fuchsia-500/20 transition-all cursor-pointer"
                    title="Swap Origin and Destination"
                  >
                    <ArrowRightLeft size={16} />
                  </button>
                </div>

                {/* Destination Picker */}
                <div className="sm:col-span-5 relative">
                  <label className="text-xs mono uppercase font-bold text-indigo-400 mb-1 flex items-center gap-1">
                    <MapPin size={11} /> Destination City / Airport
                  </label>
                  <button
                    type="button"
                    onClick={() => setDestDropdownOpen(!destDropdownOpen)}
                    className="w-full px-4 py-3 rounded-2xl glass border border-white/12 flex items-center justify-between text-left hover:border-indigo-400/40 transition-colors"
                  >
                    <div>
                      <div className="text-base font-black mono text-indigo-300">{draftDest?.code || draftDest?.iata || "LHR"}</div>
                      <div className="text-xs text-slate-300 truncate">{draftDest?.city || "London"}</div>
                    </div>
                    <ChevronDown size={14} className="text-slate-400" />
                  </button>

                  {destDropdownOpen && (
                    <div className="absolute top-full left-0 right-0 mt-2 p-2 rounded-2xl obsidian-panel border border-white/15 shadow-2xl z-50 max-h-56 overflow-y-auto">
                      <input
                        type="text"
                        placeholder="Search destination airport..."
                        value={destSearchQuery}
                        onChange={(e) => setDestSearchQuery(e.target.value)}
                        className="w-full px-3 py-2 mb-2 rounded-xl bg-white/5 border border-white/10 text-xs text-white outline-none focus:border-indigo-400"
                        autoFocus
                      />
                      <div className="space-y-1">
                        {filteredDests.map((ap) => (
                          <button
                            key={ap.iata}
                            type="button"
                            onClick={() => {
                              setDraftDest({ code: ap.iata, iata: ap.iata, city: ap.city, name: ap.name, lat: ap.lat, lng: ap.lng, lon: ap.lng });
                              setDestDropdownOpen(false);
                            }}
                            className="w-full px-3 py-2 rounded-xl hover:bg-indigo-500/20 text-left text-xs flex items-center justify-between text-slate-200 hover:text-indigo-300"
                          >
                            <span className="font-bold">{ap.city} ({ap.iata})</span>
                            <span className="text-xs text-slate-400 truncate max-w-[120px]">{ap.name}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Auxiliary Parameters: Date, Class, Pax, Currency */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
                {/* Date */}
                <div>
                  <label className="text-xs mono text-slate-400 uppercase font-bold mb-1 flex items-center gap-1">
                    <Calendar size={10} className="text-fuchsia-400" /> Date
                  </label>
                  <input
                    type="date"
                    value={draftDate}
                    onChange={(e) => setDraftDate(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl glass border border-white/12 text-xs font-mono text-white outline-none focus:border-fuchsia-400"
                  />
                </div>

                {/* Class */}
                <div>
                  <label className="text-xs mono text-slate-400 uppercase font-bold mb-1 flex items-center gap-1">
                    <SlidersHorizontal size={10} className="text-fuchsia-400" /> Cabin Class
                  </label>
                  <select
                    value={draftClass}
                    onChange={(e) => setDraftClass(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl glass border border-white/12 text-xs font-mono text-white outline-none focus:border-fuchsia-400 bg-slate-900"
                  >
                    <option value="Economy">Economy</option>
                    <option value="Premium Economy">Premium Economy</option>
                    <option value="Business">Business Flatbed</option>
                    <option value="First">First Suite</option>
                  </select>
                </div>

                {/* Passengers */}
                <div>
                  <label className="text-xs mono text-slate-400 uppercase font-bold mb-1 flex items-center gap-1">
                    <Users size={10} className="text-fuchsia-400" /> Passengers
                  </label>
                  <div className="flex items-center rounded-xl glass border border-white/12 px-2 py-1.5 justify-between">
                    <button
                      type="button"
                      onClick={() => setDraftPax(Math.max(1, draftPax - 1))}
                      className="w-6 h-6 rounded-lg bg-white/5 hover:bg-white/15 text-white font-bold flex items-center justify-center cursor-pointer text-xs"
                    >
                      -
                    </button>
                    <span className="text-xs font-bold mono text-white">{draftPax}</span>
                    <button
                      type="button"
                      onClick={() => setDraftPax(Math.min(9, draftPax + 1))}
                      className="w-6 h-6 rounded-lg bg-white/5 hover:bg-white/15 text-white font-bold flex items-center justify-center cursor-pointer text-xs"
                    >
                      +
                    </button>
                  </div>
                </div>

                {/* Currency */}
                <div>
                  <label className="text-xs mono text-slate-400 uppercase font-bold mb-1 flex items-center gap-1">
                    <DollarSign size={10} className="text-fuchsia-400" /> Currency
                  </label>
                  <select
                    value={draftCurr}
                    onChange={(e) => setDraftCurr(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl glass border border-white/12 text-xs font-mono text-white outline-none focus:border-fuchsia-400 bg-slate-900"
                  >
                    <option value="USD">USD ($)</option>
                    <option value="EUR">EUR (€)</option>
                    <option value="GBP">GBP (£)</option>
                    <option value="INR">INR (₹)</option>
                    <option value="AED">AED (AED)</option>
                    <option value="SGD">SGD (S$)</option>
                  </select>
                </div>
              </div>

              {/* Submit CTA */}
              <div className="flex justify-end gap-3 pt-4 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="px-5 py-3 rounded-2xl glass border border-white/10 text-xs font-bold text-slate-300 hover:text-white cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleApply}
                  className="btn-aurora px-8 py-3 rounded-2xl text-xs font-bold cursor-pointer shadow-lg flex items-center gap-2"
                >
                  <Check size={15} /> Update Flight Path & Telemetry
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
