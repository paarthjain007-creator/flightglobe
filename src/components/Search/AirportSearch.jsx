import React, { useState, useRef, useEffect } from "react";
import { Search, MapPin, X, Globe, Loader2 } from "lucide-react";
import { searchAirports, getAirportByIata } from "../../data/airports";

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

        // Fetch live from 28k massive proxy API
        try {
          const res = await fetch(`http://localhost:3001/api/airports/search?q=${encodeURIComponent(q)}`);
          if (res.ok) {
            const data = await res.json();
            if (data.results && data.results.length > 0) {
              const liveAirports = data.results;
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

  return (
    <div ref={containerRef} className="relative w-full">
      {label && (
        <label className="block text-xs font-semibold mb-1.5 uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>
          {label}
        </label>
      )}

      <div className="relative flex items-center">
        {loading ? (
          <Loader2
            size={14}
            className="absolute left-3 pointer-events-none animate-spin"
            style={{ color: "var(--accent)" }}
          />
        ) : (
          <Search
            size={14}
            className="absolute left-3 pointer-events-none"
            style={{ color: "var(--accent)" }}
          />
        )}
        <input
          id={id}
          type="text"
          value={query}
          onChange={handleInput}
          onFocus={() => query.length >= 1 && setOpen(true)}
          placeholder={placeholder}
          autoComplete="off"
          className="glass-input w-full pl-9 pr-8 py-2.5 rounded-xl text-sm"
          style={{ color: "var(--text-primary)" }}
        />
        {(query || value) && (
          <button
            onClick={handleClear}
            className="absolute right-2.5 p-0.5 rounded-full hover:opacity-100 opacity-50 transition-opacity cursor-pointer"
          >
            <X size={13} style={{ color: "var(--text-muted)" }} />
          </button>
        )}
      </div>

      {/* Dropdown */}
      {open && results.length > 0 && (
        <div
          className="absolute z-50 mt-1.5 w-full rounded-xl overflow-hidden shadow-2xl animate-slide-up max-h-64 overflow-y-auto"
          style={{
            background: "var(--bg-secondary)",
            border: "1px solid var(--glass-border)",
          }}
        >
          {results.map((airport) => (
            <button
              key={airport.iata}
              id={`airport-option-${id}-${airport.iata}`}
              className="dropdown-item w-full flex items-center gap-3 px-3 py-2.5 text-left border-b border-white/5 last:border-0 hover:bg-cyan-500/10 transition-colors"
              onClick={() => handleSelect(airport)}
            >
              <div
                className="flex-shrink-0 w-10 h-7 rounded-lg flex items-center justify-center text-xs font-bold"
                style={{
                  background: "var(--accent-glow)",
                  color: "var(--accent)",
                  border: "1px solid var(--glass-border)",
                }}
              >
                {airport.iata}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium truncate" style={{ color: "var(--text-primary)" }}>
                  {airport.city}, {airport.country}
                </div>
                <div className="text-xs truncate" style={{ color: "var(--text-muted)" }}>
                  {airport.name}
                </div>
              </div>
              <MapPin size={11} style={{ color: "var(--text-muted)" }} className="flex-shrink-0" />
            </button>
          ))}
        </div>
      )}

      {/* Selected Badge */}
      {value && (
        <div className="mt-1.5 flex items-center gap-2 px-1">
          <div
            className="w-1.5 h-1.5 rounded-full flex-shrink-0 pulse-dot"
            style={{ background: "var(--accent)" }}
          />
          <span className="text-xs truncate" style={{ color: "var(--text-muted)" }}>
            {value.name} ({value.country})
          </span>
        </div>
      )}
    </div>
  );
}
