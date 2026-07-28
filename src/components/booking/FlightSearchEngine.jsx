import React, { useState, useEffect, useTransition } from "react";
import { Search, Plane, Calendar, Users, SlidersHorizontal, Loader2, ArrowRightLeft, ShieldCheck, Filter } from "lucide-react";
import AirportSearch from "../Search/AirportSearch";
import BookingCard from "./BookingCard";
import BookingModal from "./BookingModal";
import { searchAmadeusFlightOffers } from "../../services/api/amadeusService";
import { AIRPORTS } from "../../data/airports";
import GlassCard from "../ui/GlassCard";

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

  const [offers, setOffers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedOffer, setSelectedOffer] = useState(null);
  const [sortBy, setSortBy] = useState("PRICE"); // PRICE | DURATION | AIRLINE

  async function handleSearch(e) {
    if (e) e.preventDefault();
    if (!origin || !destination) return;

    setLoading(true);
    const results = await searchAmadeusFlightOffers({
      originIata: origin.iata,
      destinationIata: destination.iata,
      departureDate,
      adults,
      travelClass,
      nonStopOnly,
    });

    setOffers(results);
    setLoading(false);
  }

  useEffect(() => {
    handleSearch();
  }, [origin?.iata, destination?.iata]);

  const filteredOffers = offers
    .filter((offer) => {
      if (nonStopOnly) {
        return offer.itineraries[0]?.segments.length === 1;
      }
      return true;
    })
    .sort((a, b) => {
      if (sortBy === "PRICE") return a.price.total - b.price.total;
      if (sortBy === "DURATION") return (a.itineraries[0]?.durationMinutes || 0) - (b.itineraries[0]?.durationMinutes || 0);
      return a.validatingAirlineName.localeCompare(b.validatingAirlineName);
    });

  return (
    <div id="flight-search-engine" className="space-y-6">
      {/* Search Input Controls */}
      <GlassCard className="p-6 border border-cyan-500/30 shadow-2xl">
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
                <span>Direct Flights Only</span>
              </label>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="px-7 py-3 rounded-2xl font-bold text-xs flex items-center gap-2 bg-gradient-to-r from-cyan-400 to-cyan-500 text-slate-950 hover:from-cyan-300 hover:to-cyan-400 transition-all cursor-pointer shadow-xl shadow-cyan-400/20 active:scale-95 disabled:opacity-50"
            >
              {loading ? (
                <><Loader2 size={15} className="animate-spin" /> Querying GDS Inventory…</>
              ) : (
                <><Search size={15} /> Search Multi-Airline Offers</>
              )}
            </button>
          </div>
        </form>
      </GlassCard>

      {/* Live Airline Comparison Header & Sort Filters */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <span>Available Airline Flights</span>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 font-mono">
              {filteredOffers.length} Offers Found
            </span>
          </h2>
          <p className="text-xs text-slate-400">
            Comparing live ticket prices across GDS & NDC airline channels
          </p>
        </div>

        {/* Sort Controls */}
        <div className="flex items-center gap-1.5 glass p-1 rounded-2xl border border-white/10 text-xs">
          <span className="px-2.5 text-slate-400 font-semibold flex items-center gap-1">
            <Filter size={12} /> Sort:
          </span>
          <button
            onClick={() => setSortBy("PRICE")}
            className={`px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer ${
              sortBy === "PRICE" ? "bg-cyan-500/20 text-cyan-300 border border-cyan-400/40" : "text-slate-400 hover:text-white"
            }`}
          >
            Lowest Fare
          </button>
          <button
            onClick={() => setSortBy("DURATION")}
            className={`px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer ${
              sortBy === "DURATION" ? "bg-cyan-500/20 text-cyan-300 border border-cyan-400/40" : "text-slate-400 hover:text-white"
            }`}
          >
            Fastest
          </button>
          <button
            onClick={() => setSortBy("AIRLINE")}
            className={`px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer ${
              sortBy === "AIRLINE" ? "bg-cyan-500/20 text-cyan-300 border border-cyan-400/40" : "text-slate-400 hover:text-white"
            }`}
          >
            Airline
          </button>
        </div>
      </div>

      {/* Offers Results List */}
      {filteredOffers.length === 0 ? (
        <GlassCard className="p-12 text-center space-y-3">
          <div className="text-4xl">✈️</div>
          <h3 className="text-base font-bold text-white">No Flights Found for Filter</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            Try unchecking "Direct Flights Only" or selecting a different departure date.
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

      {/* Booking Checkout Handoff Modal */}
      {selectedOffer && (
        <BookingModal
          offer={selectedOffer}
          onClose={() => setSelectedOffer(null)}
        />
      )}
    </div>
  );
}
