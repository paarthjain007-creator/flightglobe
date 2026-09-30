import React, { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { Search, Plane, Calendar, Loader2, ArrowRightLeft, Filter, TrendingDown, Zap, Clock, ArrowUpRight, ChevronDown, ChevronUp } from "lucide-react";
import AirportSearch from "../Search/AirportSearch";
import BookingCard from "./BookingCard";
import { searchAmadeusFlightOffers, CURRENCY_MAP, fetch7DayFareMatrixAPI } from "../../services/api/amadeusService";
import { AIRPORTS } from "../../data/airports";
import GlassCard from "../ui/GlassCard";
import DatePicker from "../ui/DatePicker";
import { FlightResultsSkeleton } from "../ui/FlightSkeletonLoader";
import { useFlightDeepLink } from "../../hooks/useFlightDeepLink";
import { useStore } from "../../store/useStore";

const SORT_OPTIONS = [
  { id: "CHEAPEST",  label: "Cheapest",    icon: TrendingDown },
  { id: "FASTEST",   label: "Fastest",     icon: Zap },
  { id: "EARLIEST",  label: "Earliest",    icon: Clock },
  { id: "DIRECT",    label: "Direct Only", icon: ArrowUpRight },
];

export default function FlightSearchEngine({ initialOrigin, initialDestination }) {
  const [origin, setOrigin] = useState(initialOrigin || AIRPORTS[0]);
  const [destination, setDestination] = useState(initialDestination || AIRPORTS[1]);
  const [departureDate, setDepartureDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 7);
    return d.toISOString().split("T")[0];
  });
  const [travelClass, setTravelClass] = useState("ECONOMY");
  const [adults, setAdults] = useState(1);
  const [nonStopOnly, setNonStopOnly] = useState(false);

  // Global Currency Sync from Store
  const storeCurrency = useStore((s) => s.currency);
  const setStoreCurrency = useStore((s) => s.setCurrency);
  const currency = storeCurrency || "USD";
  const setCurrency = setStoreCurrency;

  // State
  const [offers, setOffers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [quickFilter, setQuickFilter] = useState("CHEAPEST");
  const [selectedAirlineFilter, setSelectedAirlineFilter] = useState("ALL");
  const [showCalendarMatrix, setShowCalendarMatrix] = useState(false);
  const [showAirlineFilter, setShowAirlineFilter] = useState(false);

  // Dynamic 7-day Fare Matrix API state
  const [fareMatrix, setFareMatrix] = useState([]);
  const [matrixLoading, setMatrixLoading] = useState(true);
  const [matrixError, setMatrixError] = useState(false);

  const today = new Date().toISOString().split("T")[0];
  const isSameAirport = !!(origin && destination && (origin.iata || origin.code) === (destination.iata || destination.code));

  const setSearchOrigin = useStore((s) => s.setSearchOrigin);
  const setSearchDestination = useStore((s) => s.setSearchDestination);

  const prevInitOriginRef = useRef(initialOrigin?.iata || initialOrigin?.code);
  const prevInitDestRef = useRef(initialDestination?.iata || initialDestination?.code);

  // Synchronize ONLY when initialOrigin prop explicitly changes from outside (e.g. preset clicked)
  useEffect(() => {
    const nextCode = initialOrigin?.iata || initialOrigin?.code;
    if (nextCode && nextCode !== prevInitOriginRef.current) {
      prevInitOriginRef.current = nextCode;
      setOrigin(initialOrigin);
    }
  }, [initialOrigin]);

  // Synchronize ONLY when initialDestination prop explicitly changes from outside (e.g. preset clicked)
  useEffect(() => {
    const nextCode = initialDestination?.iata || initialDestination?.code;
    if (nextCode && nextCode !== prevInitDestRef.current) {
      prevInitDestRef.current = nextCode;
      setDestination(initialDestination);
    }
  }, [initialDestination]);

  const handleOriginChange = (newOrig) => {
    setOrigin(newOrig);
    if (newOrig) {
      setSearchOrigin(newOrig);
    }
  };

  const handleDestinationChange = (newDest) => {
    setDestination(newDest);
    if (newDest) {
      setSearchDestination(newDest);
    }
  };

  // Swap Origin and Destination
  const handleSwapAirports = () => {
    if (!origin || !destination) return;
    const tempOrigin = origin;
    const tempDest = destination;
    setOrigin(tempDest);
    setDestination(tempOrigin);
    setSearchOrigin(tempDest);
    setSearchDestination(tempOrigin);
  };

  // Fetch 7-day Fare Matrix — AbortController prevents race conditions
  useEffect(() => {
    let abortCtrl = new AbortController();
    async function loadMatrix() {
      const origCode = origin?.iata || origin?.code;
      const destCode = destination?.iata || destination?.code;
      if (!origCode || !destCode || isSameAirport) return;
      setMatrixLoading(true);
      setMatrixError(false);

      try {
        const matrix = await fetch7DayFareMatrixAPI(
          origCode,
          destCode,
          departureDate,
          currency
        );
        if (!abortCtrl.signal.aborted) {
          setFareMatrix(matrix || []);
          setMatrixLoading(false);
        }
      } catch (err) {
        if (!abortCtrl.signal.aborted) {
          console.warn("Failed to load fare matrix from API:", err);
          setMatrixError(true);
          setMatrixLoading(false);
        }
      }
    }

    loadMatrix();
    return () => { abortCtrl.abort(); };
  }, [origin?.iata, origin?.code, destination?.iata, destination?.code, departureDate, currency, isSameAirport]);

  // Stable search function for the deep-link hook to call on mount
  const handleSearch = useCallback(async (e) => {
    if (e) e.preventDefault();
    const originIata = origin?.iata || origin?.code;
    const destIata = destination?.iata || destination?.code;
    if (!originIata || !destIata || isSameAirport) return;

    setLoading(true);
    const results = await searchAmadeusFlightOffers({
      originIata,
      destinationIata: destIata,
      departureDate,
      adults,
      travelClass,
      currency,
    });

    setOffers(results);
    setLoading(false);
  }, [origin, destination, departureDate, adults, travelClass, currency, isSameAirport]);

  // Deep-linking — syncs ?from=DEL&to=BOM with URL and hydrates state on mount
  const { syncUrlParams } = useFlightDeepLink({
    origin,
    destination,
    departureDate,
    setOrigin,
    setDestination,
    setDepartureDate,
    triggerSearch: handleSearch,
  });

  useEffect(() => {
    const origCode = origin?.iata || origin?.code;
    const destCode = destination?.iata || destination?.code;
    if (origCode && destCode && origCode !== destCode) {
      syncUrlParams(origin, destination, departureDate);
      handleSearch();
    }
  }, [origin, destination, departureDate, handleSearch, syncUrlParams]);

  const filteredOffers = useMemo(() => {
    let result = [...offers];

    // Airline filter
    if (selectedAirlineFilter !== "ALL") {
      result = result.filter((o) => o.validatingAirlineCode === selectedAirlineFilter);
    }

    // Non-stop checkbox filter
    if (nonStopOnly) {
      result = result.filter((o) => o.itineraries[0]?.segments.length === 1);
    }

    // Quick sort tab
    switch (quickFilter) {
      case "CHEAPEST":
        result.sort((a, b) => a.price.total - b.price.total);
        break;
      case "FASTEST":
        result.sort((a, b) => (a.itineraries[0]?.durationMinutes || 0) - (b.itineraries[0]?.durationMinutes || 0));
        break;
      case "EARLIEST": {
        const getDepTime = (o) => new Date(o.itineraries[0]?.segments[0]?.departure?.at || 0).getTime();
        result.sort((a, b) => getDepTime(a) - getDepTime(b));
        break;
      }
      case "DIRECT":
        result = result.filter((o) => o.itineraries[0]?.segments.length === 1);
        result.sort((a, b) => a.price.total - b.price.total);
        break;
      default:
        result.sort((a, b) => a.price.total - b.price.total);
    }

    return result;
  }, [offers, selectedAirlineFilter, nonStopOnly, quickFilter]);

  const availableAirlines = Array.from(new Set(offers.map((o) => o.validatingAirlineCode))).map((code) => {
    const matched = offers.find((o) => o.validatingAirlineCode === code);
    const count = offers.filter((o) => o.validatingAirlineCode === code).length;
    return {
      code,
      name: matched?.validatingAirlineName || code,
      logo: matched?.validatingAirlineLogo || "✈️",
      count,
    };
  });

  return (
    <div id="flight-search-engine" className="space-y-5">
      {/* ── Search Input Card ───────────────────────────────────── */}
      <div className="p-6 sm:p-8 bg-[#18181b] border border-white/5 rounded-3xl shadow-2xl space-y-5 !overflow-visible relative">
        
        {/* Top utility row: Trip Type & Currency Switcher */}
        <div className="flex items-center justify-between pb-3 border-b border-white/10 flex-wrap gap-2 text-xs">
          <div className="flex items-center gap-2 text-slate-300 font-medium">
            <span className="px-2.5 py-1 rounded-lg bg-white/5 border border-white/10 text-white">One-way</span>
            <span className="text-slate-500">·</span>
            <span className="text-slate-400">Direct bookings & live GDS inventory</span>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-slate-400 text-xs hidden sm:inline">Currency:</span>
            <div className="flex items-center gap-1 p-0.5 rounded-xl bg-white/5 border border-white/10">
              {Object.entries(CURRENCY_MAP).map(([code, conf]) => (
                <button
                  key={code}
                  type="button"
                  onClick={() => setCurrency(code)}
                  title={conf.name}
                  className={`px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-lg text-xs font-medium transition-all cursor-pointer flex items-center gap-1 ${
                    currency === code
                      ? "bg-blue-500/20 text-blue-300 border border-blue-400/40 shadow-sm"
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  <span className="text-[11px]">{conf.flag}</span>
                  <span>{code}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Search Inputs Form */}
        <form onSubmit={handleSearch} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-end">

            {/* Origin Airport */}
            <div className="md:col-span-5 relative z-30">
              <label className="text-xs font-medium text-slate-300 mb-1.5 flex items-center gap-1.5">
                <Plane size={13} className="text-blue-400" />
                <span>Departure City or Airport</span>
              </label>
              <AirportSearch
                id="booking-origin-search"
                value={origin}
                onChange={handleOriginChange}
                placeholder="Where from?"
              />
            </div>

            {/* Desktop Swap Button */}
            <div className="hidden md:flex md:col-span-2 justify-center pb-1">
              <button
                type="button"
                onClick={handleSwapAirports}
                title="Swap Origin and Destination"
                aria-label="Swap Origin and Destination"
                className="w-10 h-10 rounded-full bg-slate-900 border border-white/15 text-slate-300 hover:text-blue-300 hover:border-blue-400/50 hover:bg-white/5 flex items-center justify-center transition-all cursor-pointer active:scale-90 active:rotate-180 shadow-md"
              >
                <ArrowRightLeft size={14} />
              </button>
            </div>

            {/* Destination Airport */}
            <div className="md:col-span-5 relative z-20">
              <label className="text-xs font-medium text-slate-300 mb-1.5 flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <Plane size={13} className="text-emerald-400 rotate-90" />
                  <span>Destination City or Airport</span>
                </span>
                {/* Mobile Swap Button */}
                <button
                  type="button"
                  onClick={handleSwapAirports}
                  className="md:hidden text-xs text-blue-400 hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <ArrowRightLeft size={11} /> Swap
                </button>
              </label>
              <AirportSearch
                id="booking-dest-search"
                value={destination}
                onChange={handleDestinationChange}
                placeholder="Where to?"
              />
            </div>
          </div>

          {/* Second Row: Date, Class, Travelers & Search CTA */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-12 gap-3 items-end pt-1">
            
            {/* Departure Date */}
            <div className="md:col-span-4">
              <label className="text-xs font-medium text-slate-300 mb-1.5 flex items-center gap-1.5">
                <Calendar size={13} className="text-blue-400" />
                <span>Departure Date</span>
              </label>
              <input
                type="date"
                value={departureDate}
                min={today}
                onChange={(e) => setDepartureDate(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900/90 border border-white/15 focus:outline-none focus:border-blue-400 text-white text-sm"
                style={{ colorScheme: "dark" }}
              />
            </div>

            {/* Cabin Class */}
            <div className="md:col-span-3">
              <label className="text-xs font-medium text-slate-300 mb-1.5 block">Cabin Class</label>
              <select
                value={travelClass}
                onChange={(e) => setTravelClass(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl bg-slate-900/90 border border-white/15 text-white text-sm focus:outline-none focus:border-blue-400 cursor-pointer"
                style={{ colorScheme: "dark" }}
              >
                <option value="ECONOMY">Economy</option>
                <option value="PREMIUM_ECONOMY">Premium Economy</option>
                <option value="BUSINESS">Business Class</option>
                <option value="FIRST">First Class</option>
              </select>
            </div>

            {/* Passengers */}
            <div className="md:col-span-2">
              <label className="text-xs font-medium text-slate-300 mb-1.5 block">Travelers</label>
              <select
                value={adults}
                onChange={(e) => setAdults(Number(e.target.value))}
                className="w-full px-3 py-2.5 rounded-xl bg-slate-900/90 border border-white/15 text-white text-sm focus:outline-none focus:border-blue-400 cursor-pointer"
                style={{ colorScheme: "dark" }}
              >
                {[1, 2, 3, 4, 5, 6].map((n) => (
                  <option key={n} value={n}>{n} {n === 1 ? "Adult" : "Adults"}</option>
                ))}
              </select>
            </div>

            {/* Search CTA */}
            <div className="sm:col-span-2 md:col-span-3">
              <button
                type="submit"
                disabled={loading || isSameAirport}
                className="w-full h-full py-3 sm:py-0 rounded-2xl font-bold text-[13px] uppercase tracking-wider flex items-center justify-center gap-2 bg-cyan-500 text-slate-950 hover:bg-cyan-400 transition-all cursor-pointer shadow-[0_0_20px_rgba(34,211,238,0.25)] hover:shadow-[0_0_30px_rgba(34,211,238,0.4)] active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <><Loader2 size={16} className="animate-spin" /> Searching...</>
                ) : (
                  <><Search size={16} /> Search Flights</>
                )}
              </button>
            </div>
          </div>

          {/* Validation Error */}
          {isSameAirport && (
            <div className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-rose-500/10 border border-rose-500/30 text-xs text-rose-300">
              <span>⚠️</span>
              <span>Departure and destination airports cannot be the same.</span>
            </div>
          )}
        </form>
      </div>

      {/* ── Clean Filter & Sort Controls Toolbar ─────────────────── */}
      <div className="p-3 rounded-2xl bg-white/[0.02] border border-white/10 backdrop-blur-md flex items-center justify-between flex-wrap gap-3">
        
        {/* Left: Results Count & Sort Tabs */}
        <div className="flex items-center gap-3 flex-wrap">
          <span className="text-sm font-semibold text-white">
            {filteredOffers.length} {filteredOffers.length === 1 ? "flight" : "flights"} found
          </span>

          <div className="h-4 w-px bg-white/10 hidden sm:block" />

          {/* Sort Buttons */}
          <div className="flex items-center gap-1 p-0.5 rounded-xl bg-white/5 border border-white/10 overflow-x-auto no-scrollbar">
            {SORT_OPTIONS.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                type="button"
                onClick={() => setQuickFilter(id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
                  quickFilter === id
                    ? "bg-blue-500/20 text-blue-300 border border-blue-400/40 shadow-sm"
                    : "text-slate-400 hover:text-white hover:bg-white/5 border border-transparent"
                }`}
              >
                <Icon size={12} />
                <span>{label}</span>
              </button>
            ))}
          </div>

          {/* Direct flights checkbox */}
          <label className="hidden lg:flex items-center gap-1.5 text-xs text-slate-300 cursor-pointer hover:text-white transition-colors ml-1">
            <input
              type="checkbox"
              checked={nonStopOnly}
              onChange={(e) => setNonStopOnly(e.target.checked)}
              className="rounded border-slate-700 text-blue-400 focus:ring-0 accent-cyan-400 cursor-pointer"
            />
            <span>Nonstop only</span>
          </label>
        </div>

        {/* Right: Drawer Expand Toggles for 7-Day Fare Matrix & Airline Fleet */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setShowCalendarMatrix(!showCalendarMatrix)}
            className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all cursor-pointer flex items-center gap-1.5 border ${
              showCalendarMatrix
                ? "bg-blue-500/20 text-blue-300 border-blue-400/50 shadow-sm"
                : "bg-white/5 text-slate-300 border-white/10 hover:border-white/20 hover:text-white"
            }`}
          >
            <TrendingDown size={13} className={showCalendarMatrix ? "text-blue-300" : "text-emerald-400"} />
            <span>7-Day Calendar</span>
            {showCalendarMatrix ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
          </button>

          {availableAirlines.length > 0 && (
            <button
              type="button"
              onClick={() => setShowAirlineFilter(!showAirlineFilter)}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all cursor-pointer flex items-center gap-1.5 border ${
                showAirlineFilter || selectedAirlineFilter !== "ALL"
                  ? "bg-blue-500/20 text-blue-300 border-blue-400/50 shadow-sm"
                  : "bg-white/5 text-slate-300 border-white/10 hover:border-white/20 hover:text-white"
              }`}
            >
              <Filter size={13} className="text-blue-400" />
              <span>Airlines {selectedAirlineFilter !== "ALL" ? `(${selectedAirlineFilter})` : `(${availableAirlines.length})`}</span>
              {showAirlineFilter ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
            </button>
          )}
        </div>
      </div>

      {/* ── Collapsible 7-Day Fare Matrix Drawer ─────────────────── */}
      {showCalendarMatrix && (
        <div className="p-4 border border-white/10 bg-slate-900/90 space-y-3">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-300 flex-wrap gap-2">
            <div className="flex items-center gap-1.5">
              <TrendingDown size={14} className="text-emerald-400" />
              <span>7-Day Fare Trends ({origin?.iata || "DEL"} → {destination?.iata || "BOM"})</span>
            </div>
            <span className="text-xs text-emerald-400">Lowest fares marked in green</span>
          </div>

          {matrixLoading ? (
            <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-2">
              {Array.from({ length: 7 }).map((_, idx) => (
                <div key={idx} className="p-3 rounded-xl bg-white/5 border border-white/10 text-center animate-pulse space-y-1.5">
                  <div className="h-2.5 bg-slate-700/60 rounded w-12 mx-auto" />
                  <div className="h-4 bg-blue-500/20 rounded w-16 mx-auto" />
                </div>
              ))}
            </div>
          ) : matrixError ? (
            <div className="text-xs text-rose-300 p-3 text-center">
              Unable to load live fare calendar for this route. Please select departure date above.
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-2">
              {fareMatrix.map((item) => (
                <button
                  key={item.dateStr}
                  type="button"
                  onClick={() => setDepartureDate(item.dateStr)}
                  className={`p-2.5 rounded-xl text-center transition-all cursor-pointer border ${
                    item.dateStr === departureDate
                      ? "bg-blue-500/20 border-blue-400 text-cyan-200 shadow-md"
                      : item.isCheapest
                      ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-300 hover:border-emerald-400/60"
                      : "bg-white/5 border-white/10 text-slate-300 hover:border-white/20"
                  }`}
                >
                  <div className="text-[11px] text-slate-400">{item.dayName} {item.dayNumber}</div>
                  <div className="text-xs font-bold mt-1 truncate">
                    {item.symbol}{item.price.toLocaleString()}
                  </div>
                  {item.isCheapest && (
                    <div className="text-[9px] font-semibold text-emerald-400 mt-0.5">Lowest</div>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── Collapsible Airline Fleet Filter Drawer ──────────────── */}
      {showAirlineFilter && availableAirlines.length > 0 && (
        <div className="flex items-center gap-2 p-2.5 rounded-xl bg-white/[0.03] border border-white/10 overflow-x-auto no-scrollbar">
          <span className="text-xs font-medium text-slate-400 flex-shrink-0">
            Filter:
          </span>
          <button
            type="button"
            onClick={() => setSelectedAirlineFilter("ALL")}
            className={`px-3 py-1 rounded-lg text-xs font-medium transition-all cursor-pointer flex-shrink-0 border ${
              selectedAirlineFilter === "ALL"
                ? "bg-blue-500/20 text-blue-300 border-blue-400/40"
                : "bg-white/5 text-slate-400 hover:text-white border-transparent"
            }`}
          >
            All Airlines ({offers.length})
          </button>
          {availableAirlines.map((airline) => (
            <button
              key={airline.code}
              type="button"
              onClick={() => setSelectedAirlineFilter(airline.code)}
              className={`px-3 py-1 rounded-lg text-xs font-medium transition-all cursor-pointer flex items-center gap-1.5 flex-shrink-0 border ${
                selectedAirlineFilter === airline.code
                  ? "bg-blue-500/20 text-blue-300 border-blue-400/40"
                  : "bg-white/5 text-slate-400 hover:text-white border-transparent"
              }`}
            >
              <span>{airline.logo}</span>
              <span>{airline.name}</span>
              <span className="text-[10px] text-slate-500">({airline.count})</span>
            </button>
          ))}
        </div>
      )}

      {/* ── Offers Results List (Single Column Spacious Flow) ─────── */}
      <div aria-live="polite" aria-label="Flight search results" className="space-y-3.5">
        {loading ? (
          <FlightResultsSkeleton count={4} />
        ) : filteredOffers.length === 0 ? (
          <div className="p-12 text-center space-y-3 border border-white/10">
            <div className="text-4xl" role="img" aria-label="Airplane">✈️</div>
            <h3 className="text-base font-semibold text-white">No Flights Found</h3>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              No flight options matched your current filter criteria. Try selecting "All Airlines" or changing your dates.
            </p>
          </div>
        ) : (
          filteredOffers.map((offer) => (
            <BookingCard
              key={offer.id}
              offer={offer}
              departureDate={departureDate}
              adults={adults}
            />
          ))
        )}
      </div>
    </div>
  );
}


