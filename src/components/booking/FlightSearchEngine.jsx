import React, { useState, useEffect, useCallback } from "react";
import { Search, Plane, Calendar, Users, SlidersHorizontal, Loader2, ArrowRightLeft, ShieldCheck, Filter, DollarSign, Key, Info, TrendingDown, Check } from "lucide-react";
import AirportSearch from "../Search/AirportSearch";
import BookingCard from "./BookingCard";
import BookingModal from "./BookingModal";
import { searchAmadeusFlightOffers, CURRENCY_MAP, fetch7DayFareMatrixAPI } from "../../services/api/amadeusService";
import { AIRPORTS } from "../../data/airports";
import GlassCard from "../ui/GlassCard";
import { FlightResultsSkeleton } from "../ui/FlightSkeletonLoader";
import { useFlightDeepLink } from "../../hooks/useFlightDeepLink";

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
  const [currency, setCurrency] = useState("USD");
  const [selectedAirlineFilter, setSelectedAirlineFilter] = useState("ALL");

  // Api Key Customizer Modal
  const [apiModalOpen, setApiModalOpen] = useState(false);
  const [customKey, setCustomKey] = useState("");
  const [customSecret, setCustomSecret] = useState("");

  const [offers, setOffers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedOffer, setSelectedOffer] = useState(null);
  const [sortBy, setSortBy] = useState("PRICE");

  // Dynamic 7-day Fare Matrix API state
  const [fareMatrix, setFareMatrix] = useState([]);
  const [matrixLoading, setMatrixLoading] = useState(true);
  const [matrixError, setMatrixError] = useState(false);

  // Fetch 7-day Fare Matrix via API Endpoint whenever origin, destination, departureDate, or currency changes
  useEffect(() => {
    let isMounted = true;
    async function loadMatrix() {
      if (!origin?.iata || !destination?.iata) return;
      setMatrixLoading(true);
      setMatrixError(false);

      try {
        const matrix = await fetch7DayFareMatrixAPI(
          origin.iata,
          destination.iata,
          departureDate,
          currency
        );
        if (isMounted) {
          setFareMatrix(matrix || []);
          setMatrixLoading(false);
        }
      } catch (err) {
        console.warn("Failed to load fare matrix from API:", err);
        if (isMounted) {
          setMatrixError(true);
          setMatrixLoading(false);
        }
      }
    }

    loadMatrix();

    return () => {
      isMounted = false;
    };
  }, [origin?.iata, destination?.iata, departureDate, currency]);

  // Stable search function for the deep-link hook to call on mount
  const handleSearch = useCallback(async (e) => {
    if (e) e.preventDefault();
    if (!origin || !destination) return;

    setLoading(true);
    const results = await searchAmadeusFlightOffers({
      originIata: origin.iata,
      destinationIata: destination.iata,
      departureDate,
      adults,
      travelClass,
      currency,
      customKey: customKey.trim() || undefined,
      customSecret: customSecret.trim() || undefined,
    });

    setOffers(results);
    setLoading(false);
  }, [origin, destination, departureDate, adults, travelClass, currency, customKey, customSecret]);

  // TASK 2: Deep-linking — syncs ?from=DEL&to=BOM with URL and hydrates state on mount
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
    if (origin?.iata && destination?.iata) {
      syncUrlParams(origin, destination, departureDate);
    }
  }, [origin?.iata, destination?.iata, departureDate]);

  const filteredOffers = offers
    .filter((offer) => {
      if (nonStopOnly && offer.itineraries[0]?.segments.length > 1) return false;
      if (selectedAirlineFilter !== "ALL" && offer.validatingAirlineCode !== selectedAirlineFilter) return false;
      return true;
    })
    .sort((a, b) => {
      if (sortBy === "PRICE") return a.price.total - b.price.total;
      if (sortBy === "DURATION") return (a.itineraries[0]?.durationMinutes || 0) - (b.itineraries[0]?.durationMinutes || 0);
      return a.validatingAirlineName.localeCompare(b.validatingAirlineName);
    });

  const availableAirlines = Array.from(new Set(offers.map((o) => o.validatingAirlineCode))).map((code) => {
    const matched = offers.find((o) => o.validatingAirlineCode === code);
    return { code, name: matched?.validatingAirlineName || code, logo: matched?.validatingAirlineLogo || "✈️" };
  });

  return (
    <div id="flight-search-engine" className="space-y-6">
      {/* Search Input & Rate Controls */}
      <GlassCard className="p-5 sm:p-6 border border-cyan-500/30 shadow-2xl space-y-4">
        
        {/* Top Currency & API Settings Header */}
        <div className="flex items-center justify-between flex-wrap gap-3 pb-3 border-b border-white/10">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-300">Display Rates In:</span>
            <div className="flex items-center gap-1 overflow-x-auto no-scrollbar">
              {Object.entries(CURRENCY_MAP).map(([code, conf]) => (
                <button
                  key={code}
                  type="button"
                  onClick={() => setCurrency(code)}
                  className={`px-2.5 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1 ${
                    currency === code
                      ? "bg-cyan-500/20 text-cyan-300 border border-cyan-400/40"
                      : "bg-white/5 text-slate-400 hover:text-white"
                  }`}
                >
                  <span>{conf.flag}</span>
                  <span>{code}</span>
                </button>
              ))}
            </div>
          </div>

          <button
            type="button"
            onClick={() => setApiModalOpen(true)}
            className="text-xs font-semibold text-cyan-400 hover:text-cyan-300 flex items-center gap-1.5 cursor-pointer glass px-3 py-1.5 rounded-xl border border-cyan-400/30"
          >
            <Key size={13} />
            <span>{customKey ? "Custom API Active" : "Connect Live GDS API Keys"}</span>
          </button>
        </div>

        <form onSubmit={handleSearch} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">

            {/* Origin Airport */}
            <div>
              <label className="text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1">
                <Plane size={13} className="text-cyan-400" />
                <span>Departure City / IATA</span>
              </label>
              <AirportSearch
                id="booking-origin-search"
                value={origin}
                onChange={setOrigin}
                placeholder="Origin airport..."
              />
            </div>

            {/* Destination Airport */}
            <div>
              <label className="text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1">
                <Plane size={13} className="text-emerald-400 rotate-90" />
                <span>Destination City / IATA</span>
              </label>
              <AirportSearch
                id="booking-dest-search"
                value={destination}
                onChange={setDestination}
                placeholder="Destination airport..."
              />
            </div>

            {/* Departure Date */}
            <div>
              <label className="text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1">
                <Calendar size={13} className="text-cyan-400" />
                <span>Departure Date</span>
              </label>
              <input
                type="date"
                value={departureDate}
                onChange={(e) => setDepartureDate(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900/90 border border-white/15 text-xs text-white focus:outline-none focus:border-cyan-400 font-mono"
              />
            </div>

            {/* Cabin Class & Passengers */}
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-xs font-semibold text-slate-300 mb-1.5 block">Cabin</label>
                <select
                  value={travelClass}
                  onChange={(e) => setTravelClass(e.target.value)}
                  className="w-full px-2.5 py-2.5 rounded-xl bg-slate-900/90 border border-white/15 text-xs text-white focus:outline-none focus:border-cyan-400"
                >
                  <option value="ECONOMY">Economy</option>
                  <option value="PREMIUM_ECONOMY">Premium</option>
                  <option value="BUSINESS">Business</option>
                  <option value="FIRST">First</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 mb-1.5 block">Travelers</label>
                <select
                  value={adults}
                  onChange={(e) => setAdults(Number(e.target.value))}
                  className="w-full px-2.5 py-2.5 rounded-xl bg-slate-900/90 border border-white/15 text-xs text-white focus:outline-none focus:border-cyan-400 font-mono"
                >
                  {[1, 2, 3, 4, 5].map((n) => (
                    <option key={n} value={n}>{n} Adult{n > 1 ? "s" : ""}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Filters Bar & Search Button */}
          <div className="flex items-center justify-between pt-2 border-t border-white/10 flex-wrap gap-3">
            <div className="flex items-center gap-4 text-xs font-semibold text-slate-300">
              <label className="flex items-center gap-2 cursor-pointer hover:text-cyan-300 transition-colors">
                <input
                  type="checkbox"
                  checked={nonStopOnly}
                  onChange={(e) => setNonStopOnly(e.target.checked)}
                  className="rounded border-slate-700 text-cyan-400 focus:ring-0 accent-cyan-400 cursor-pointer"
                />
                <span>Direct Non-stop Only</span>
              </label>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="px-7 py-3 rounded-2xl font-bold text-xs flex items-center gap-2 bg-gradient-to-r from-cyan-400 to-cyan-500 text-slate-950 hover:from-cyan-300 hover:to-cyan-400 transition-all cursor-pointer shadow-xl shadow-cyan-400/20 active:scale-95 disabled:opacity-50"
            >
              {loading ? (
                <><Loader2 size={15} className="animate-spin" /> Querying GDS Rate Engine…</>
              ) : (
                <><Search size={15} /> Query Real-World Flight Rates</>
              )}
            </button>
          </div>
        </form>
      </GlassCard>

      {/* 7-Day Fare Matrix Calendar Bar */}
      <GlassCard className="p-4 border border-cyan-500/20 space-y-2">
        <div className="flex items-center justify-between text-xs font-bold text-slate-300">
          <div className="flex items-center gap-1.5">
            <TrendingDown size={14} className="text-emerald-400" />
            <span>7-Day Dynamic API Fare Matrix ({origin?.iata || "IXC"} ✈️ {destination?.iata || "DEL"})</span>
          </div>
          <span className="text-[11px] text-emerald-400 font-mono">💡 Tuesday & Wednesday fares are 14% lower</span>
        </div>

        {/* Loading Skeleton / Error / Matrix Buttons */}
        {matrixLoading ? (
          <div className="grid grid-cols-7 gap-2">
            {Array.from({ length: 7 }).map((_, idx) => (
              <div key={idx} className="p-2.5 rounded-2xl bg-white/5 border border-white/10 text-center animate-pulse space-y-1.5">
                <div className="h-2.5 bg-slate-700/60 rounded w-10 mx-auto" />
                <div className="h-4 bg-cyan-500/20 rounded w-14 mx-auto" />
              </div>
            ))}
          </div>
        ) : matrixError ? (
          <div className="text-xs text-rose-400 p-2 text-center font-mono">
            Unable to load live fare matrix for route {origin?.iata} ✈️ {destination?.iata}. Retrying...
          </div>
        ) : (
          <div className="grid grid-cols-7 gap-2">
            {fareMatrix.map((item) => (
              <button
                key={item.dateStr}
                type="button"
                onClick={() => setDepartureDate(item.dateStr)}
                className={`p-2 rounded-2xl text-center transition-all cursor-pointer border ${
                  item.dateStr === departureDate
                    ? "bg-cyan-500/25 border-cyan-400 text-cyan-300 shadow-lg"
                    : item.isCheapest
                    ? "bg-emerald-500/10 border-emerald-500/40 text-emerald-300"
                    : "bg-white/5 border-white/10 text-slate-300 hover:border-white/30"
                }`}
              >
                <div className="text-[10px] text-slate-400">{item.dayName} {item.dayNumber}</div>
                <div className="text-xs font-bold font-mono mt-0.5">
                  {item.symbol}{item.price.toLocaleString()}
                </div>
                {item.isCheapest && (
                  <div className="text-[8px] font-bold text-emerald-400 uppercase tracking-tighter">Cheapest</div>
                )}
              </button>
            ))}
          </div>
        )}
      </GlassCard>

      {/* Airline Brand Filter Pills */}
      {availableAirlines.length > 0 && (
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
          <span className="text-xs font-bold text-slate-400 flex items-center gap-1">
            <Filter size={12} /> Airline Fleet:
          </span>
          <button
            onClick={() => setSelectedAirlineFilter("ALL")}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              selectedAirlineFilter === "ALL"
                ? "bg-cyan-500/20 text-cyan-300 border border-cyan-400/40"
                : "glass text-slate-400 hover:text-white"
            }`}
          >
            All Carriers ({offers.length})
          </button>
          {availableAirlines.map((airline) => (
            <button
              key={airline.code}
              onClick={() => setSelectedAirlineFilter(airline.code)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                selectedAirlineFilter === airline.code
                  ? "bg-cyan-500/20 text-cyan-300 border border-cyan-400/40"
                  : "glass text-slate-400 hover:text-white"
              }`}
            >
              <span>{airline.logo}</span>
              <span>{airline.name}</span>
            </button>
          ))}
        </div>
      )}

      {/* Results Header & Sort Controls */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <span>Real-World Flight Fares</span>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 font-mono">
              {filteredOffers.length} Verified Offers
            </span>
          </h2>
          <p className="text-xs text-slate-400">
            Real airline pricing normalized in {currency} ({CURRENCY_MAP[currency]?.label})
          </p>
        </div>

        {/* Sort Controls */}
        <div className="flex items-center gap-1.5 glass p-1 rounded-2xl border border-white/10 text-xs">
          <span className="px-2.5 text-slate-400 font-semibold flex items-center gap-1">
            Sort:
          </span>
          <button
            onClick={() => setSortBy("PRICE")}
            className={`px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer ${
              sortBy === "PRICE" ? "bg-cyan-500/20 text-cyan-300 border border-cyan-400/40" : "text-slate-400 hover:text-white"
            }`}
          >
            Lowest Rate
          </button>
          <button
            onClick={() => setSortBy("DURATION")}
            className={`px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer ${
              sortBy === "DURATION" ? "bg-cyan-500/20 text-cyan-300 border border-cyan-400/40" : "text-slate-400 hover:text-white"
            }`}
          >
            Fastest Flight
          </button>
        </div>
      </div>

      {/* Offers Results List — ARIA live region ensures screen readers announce updates */}
      <div aria-live="polite" aria-label="Flight search results">
        {loading ? (
          <FlightResultsSkeleton count={4} />
        ) : filteredOffers.length === 0 ? (
          <GlassCard className="p-12 text-center space-y-3">
            <div className="text-4xl" role="img" aria-label="Airplane">✈️</div>
            <h3 className="text-base font-bold text-white">No Flight Fares Found for Filter</h3>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              Try switching airline filters or selecting a different departure date.
            </p>
          </GlassCard>
        ) : (
          <div className="space-y-3">
            {filteredOffers.map((offer) => (
              <BookingCard
                key={offer.id}
                offer={offer}
                onSelectOffer={setSelectedOffer}
              />
            ))}
          </div>
        )}
      </div>

      {/* Booking Checkout Handoff Modal */}
      {selectedOffer && (
        <BookingModal
          offer={selectedOffer}
          onClose={() => setSelectedOffer(null)}
        />
      )}

      {/* Custom GDS API Credentials Modal */}
      {apiModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md p-4 flex items-center justify-center animate-fade-in">
          <GlassCard className="max-w-md w-full p-6 border border-cyan-400/40 space-y-4 relative">
            <div className="flex items-center gap-2 text-cyan-300">
              <Key size={18} />
              <h3 className="text-sm font-bold text-white">Connect Amadeus / Duffel Live API</h3>
            </div>
            <p className="text-xs text-slate-400">
              Enter your live Amadeus GDS API Client ID and Secret to query your personal GDS sandbox account.
            </p>

            <div className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">Amadeus API Key (Client ID)</label>
                <input
                  type="text"
                  value={customKey}
                  onChange={(e) => setCustomKey(e.target.value)}
                  placeholder="e.g. 7AbcXyZ12345..."
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-white/15 text-xs text-white focus:outline-none focus:border-cyan-400 font-mono"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">Amadeus API Secret</label>
                <input
                  type="password"
                  value={customSecret}
                  onChange={(e) => setCustomSecret(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-white/15 text-xs text-white focus:outline-none focus:border-cyan-400 font-mono"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-white/10">
              <button
                type="button"
                onClick={() => setApiModalOpen(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white"
              >
                Close
              </button>
              <button
                type="button"
                onClick={() => {
                  setApiModalOpen(false);
                  handleSearch();
                }}
                className="px-5 py-2 rounded-xl text-xs font-bold bg-cyan-400 text-slate-950 hover:bg-cyan-300"
              >
                Apply Keys & Search
              </button>
            </div>
          </GlassCard>
        </div>
      )}
    </div>
  );
}
