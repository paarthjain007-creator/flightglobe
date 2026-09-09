import React, { useState, useRef, useEffect } from "react";
import { Search, MapPin, X, Globe, Loader2 } from "lucide-react";
import { searchAirports, getAirportByIata } from "../../data/airports";
import { searchAirportsAPI } from "../../services/api/apiClient";

export default function AirportSearch({ label, value, onChange, onClear, placeholder = "Search global airports…", id }) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const containerRef = useRef(null);

  useEffect(() => {
    if (value) setQuery(`${value.iata} — ${value.city}`);
    else setQuery("");
  }, [value]);

  useEffect(() => {
    function handleClickOutside(e) {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    const q = query.trim();
    if (!q || q === (value ? `${value.iata} — ${value.city}` : "")) return;

    const delayDebounceFn = setTimeout(async () => {
      if (q.length >= 2) {
        setLoading(true);
        // Start with local static fallback/cache
        let matched = searchAirports(q);
        
        if (q.length === 3 && !matched.some((a) => a.iata.toUpperCase() === q.toUpperCase())) {
          const customAirport = getAirportByIata(q);
          matched = [customAirport, ...matched];
        }
        
        setResults(matched);
        setOpen(true);

        // Fetch live from safe proxy API
        try {
          const liveAirports = await searchAirportsAPI(q);
          if (liveAirports && liveAirports.length > 0) {
            const merged = [...liveAirports, ...matched];
            const seen = new Set();
            const finalResults = [];
            for (const item of merged) {
              if (!seen.has(item.iata)) {
                seen.add(item.iata);
                finalResults.push(item);
              }
            }
            setResults(finalResults.slice(0, 10));
          }
        } catch (err) {
          console.warn("Global API search failed", err);
        }
        
        setLoading(false);
      } else {
        setResults([]);
        setOpen(false);
      }
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [query, value]);

  function handleInput(e) {
    setQuery(e.target.value);
    if (value) onChange(null);
  }

  function handleSelect(airport) {
    onChange(airport);
    setQuery(`${airport.iata} — ${airport.city}`);
    setOpen(false);
    setResults([]);
  }

  function handleClear() {
    setQuery("");
    setResults([]);
    setOpen(false);
    onChange(null);
    if (onClear) onClear();
  }

  function handleKeyDown(e) {
    if (e.key === "Enter" && results.length > 0 && open) {
      e.preventDefault();
      handleSelect(results[0]);
    } else if (e.key === "Escape") {
      setOpen(false);
    }
  }

  return (
    <div ref={containerRef} className="relative w-full">
      {label && (
        <label className="block text-xs font-semibold mb-1.5 uppercase tracking-wider text-slate-300">
          {label}
        </label>
      )}

      <div className="relative flex items-center">
        {loading ? (
          <Loader2
            size={15}
            className="absolute left-3.5 pointer-events-none animate-spin text-cyan-400"
          />
        ) : (
          <Search
            size={15}
            className="absolute left-3.5 pointer-events-none text-cyan-400"
          />
        )}
        <input
          id={id}
          type="text"
          value={query}
          onChange={handleInput}
          onKeyDown={handleKeyDown}
          onFocus={() => query.length >= 1 && setOpen(true)}
          placeholder={placeholder}
          autoComplete="off"
          className="w-full pl-10 pr-9 py-2.5 rounded-xl bg-slate-900/95 border border-white/20 hover:border-white/35 text-white placeholder-slate-400 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400/30 text-sm font-semibold transition-all"
          style={{ fontSize: "15px" }}
        />
        {(query || value) && (
          <button
            onClick={handleClear}
            aria-label="Clear airport selection"
            className="absolute right-3 p-1 rounded-lg hover:bg-white/10 transition-colors cursor-pointer text-slate-400 hover:text-white"
          >
            <X size={14} />
          </button>
        )}
      </div>

      {/* Dropdown Results */}
      {open && results.length > 0 && (
        <div
          className="absolute z-50 mt-1.5 w-full rounded-2xl overflow-hidden shadow-2xl animate-slide-up max-h-72 overflow-y-auto p-1.5 bg-slate-950/95 border border-white/20 backdrop-blur-2xl"
        >
          {results.map((airport) => (
            <button
              key={airport.iata}
              id={`airport-option-${id}-${airport.iata}`}
              className="w-full flex items-center gap-3 p-2.5 rounded-xl text-left hover:bg-white/10 transition-colors cursor-pointer border-b border-white/5 last:border-0"
              onClick={() => handleSelect(airport)}
            >
              <div
                className="flex-shrink-0 px-2.5 py-1 rounded-lg flex items-center justify-center text-xs font-bold font-mono bg-cyan-500/15 border border-cyan-400/30 text-cyan-300"
              >
                {airport.iata}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-bold truncate text-white">
                  {airport.city}, {airport.country}
                </div>
                <div className="text-xs truncate text-slate-300 mt-0.5">
                  {airport.name}
                </div>
              </div>
              <MapPin size={13} className="flex-shrink-0 text-cyan-400/70" />
            </button>
          ))}
        </div>
      )}

      {/* Selected Airport Pill */}
      {value && (
        <div className="mt-1.5 flex items-center gap-2 px-1 text-xs text-slate-300 font-medium">
          <div
            className="w-2 h-2 rounded-full flex-shrink-0 bg-emerald-400 shadow-[0_0_6px_#00FFA3]"
          />
          <span className="truncate">
            {value.name} · {value.country}
          </span>
        </div>
      )}
    </div>
  );
}
