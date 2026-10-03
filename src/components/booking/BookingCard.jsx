import React, { useState, useCallback } from "react";
import { Plane, Clock, ArrowRight, ChevronDown, ChevronUp, Luggage, ExternalLink, Check, ShieldCheck, Heart } from "lucide-react";
import { motion } from "framer-motion";
import { useStore } from "../../store/useStore";
import { getAirportByIata } from "../../data/airports";
import { getAirlineBookingUrl } from "../../services/airlineRedirects";
import RedirectToast from "./RedirectToast";
import BookingModal from "./BookingModal";

export default function BookingCard({ offer, departureDate, adults }) {
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [redirectInfo, setRedirectInfo] = useState(null);
  const setHoveredFlightPath = useStore((s) => s.setHoveredFlightPath);
  const savedFlights = useStore((s) => s.savedFlights);
  const toggleSavedFlight = useStore((s) => s.toggleSavedFlight);
  const isSaved = savedFlights.some((f) => f.flight.id === offer.id);

  if (!offer || !offer.itineraries || offer.itineraries.length === 0) return null;

  const itinerary = offer.itineraries[0];
  const segments = itinerary.segments || [];
  const firstSeg = segments[0];
  const lastSeg = segments[segments.length - 1];

  let durMins = itinerary.durationMinutes;
  if (!durMins || isNaN(durMins)) {
    durMins = Math.round((new Date(lastSeg?.arrival?.at).getTime() - new Date(firstSeg?.departure?.at).getTime()) / 60000) || 120;
  }
  const durationHours = Math.floor(durMins / 60);
  const durationMins = durMins % 60;
  const isDirect = segments.length === 1;

  const depDate = firstSeg?.departure?.at ? new Date(firstSeg.departure.at) : new Date();
  const arrDate = lastSeg?.arrival?.at ? new Date(lastSeg.arrival.at) : new Date();

  const formatTime = (d) => {
    try {
      if (isNaN(d.getTime())) return "--:--";
      return d.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: false });
    } catch {
      return "--:--";
    }
  };

  const symbol = offer.price?.currencySymbol || "$";
  const formattedTotal = `${symbol}${(offer.price?.total || 0).toLocaleString()}`;
  const formattedBase = `${symbol}${(offer.price?.base || 0).toLocaleString()}`;
  const formattedFees = `${symbol}${(offer.price?.fees || 0).toLocaleString()}`;

  const airlineCode = offer.validatingAirlineCode;
  const airlineName = offer.validatingAirlineName;

  const handleMouseEnter = () => {
    const pts = segments.map((s) => getAirportByIata(s.departure.iataCode)).filter(Boolean);
    const lastDest = getAirportByIata(lastSeg?.arrival?.iataCode);
    if (lastDest) pts.push(lastDest);
    if (pts.length >= 2) setHoveredFlightPath(pts);
  };

  const handleMouseLeave = () => setHoveredFlightPath(null);

  const handleBookRedirect = useCallback(() => {
    const originIata = firstSeg?.departure?.iataCode;
    const destIata = lastSeg?.arrival?.iataCode;

    const { name, url } = getAirlineBookingUrl(airlineCode, {
      origin: originIata,
      destination: destIata,
      date: departureDate || depDate.toISOString().split("T")[0],
      passengers: adults || 1,
      cabinClass: offer.price?.cabinClass || "economy",
    });

    setRedirectInfo({ name, url });
  }, [airlineCode, firstSeg, lastSeg, departureDate, adults, offer.price?.cabinClass, depDate]);

  const originAirport = getAirportByIata(firstSeg?.departure?.iataCode);
  const destAirport = getAirportByIata(lastSeg?.arrival?.iataCode);

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        whileHover={{ translateY: -1 }}
        transition={{ duration: 0.2 }}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        className="rounded-2xl bg-[#18181b] hover:bg-[#1f1f24] border border-slate-700/60 hover:border-slate-500/80 shadow-lg p-4 sm:p-5 transition-all shadow-md space-y-4"
      >
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-5">
          {/* 1. Airline Identity */}
          <div className="flex items-center gap-3.5 min-w-[190px]">
            <div className="w-11 h-11 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-2xl flex-shrink-0">
              {offer.validatingAirlineLogo || "✈️"}
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-base font-bold text-white tracking-tight">{airlineName}</span>
                {offer.price?.isLowestFare && (
                  <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/15 text-[#30d158] border border-emerald-500/25">
                    Lowest fare
                  </span>
                )}
              </div>
              <div className="text-xs text-[#86868b] flex items-center gap-2 mt-0.5">
                <span>Flight {firstSeg?.number}</span>
                <span>·</span>
                <span className="capitalize">{offer.price?.cabinClass?.toLowerCase()}</span>
              </div>
            </div>
          </div>

          {/* 2. Schedule & Flight Route */}
          <div className="flex-1 flex items-center justify-between gap-4 w-72 md:max-w-md md:w-full flex-shrink-0 snap-center">
            {/* Departure */}
            <div className="text-left">
              <div className="text-2xl sm:text-3xl font-extrabold text-white tracking-tighter">
                {formatTime(depDate)}
              </div>
              <div className="text-sm font-bold text-[#2997ff] mt-1 uppercase tracking-wider">
                {firstSeg?.departure?.iataCode}
              </div>
            </div>

            {/* Flight Progress Bar */}
            <div className="flex-1 flex flex-col items-center px-2">
              <span className="text-xs font-medium text-[#a1a1aa] mb-2 font-mono">
                {durationHours}h {durationMins}m
              </span>
              <div className="w-full flex items-center gap-1.5">
                <div className="h-[2px] flex-1 bg-white/20 rounded"></div>
                <Plane size={13} className="text-[#86868b] rotate-90 flex-shrink-0" />
                <div className="h-[2px] flex-1 bg-white/20 rounded"></div>
              </div>
              <span className={`text-[13px] font-semibold mt-1 ${isDirect ? "text-[#30d158]" : "text-[#ff9f0a]"}`}>
                {isDirect ? "Nonstop" : `1 stop (${segments[0]?.arrival?.iataCode})`}
              </span>
            </div>

            {/* Arrival */}
            <div className="text-right">
              <div className="text-2xl sm:text-3xl font-extrabold text-white tracking-tighter">
                {formatTime(arrDate)}
              </div>
              <div className="text-sm font-bold text-emerald-400 mt-1 uppercase tracking-wider">
                {lastSeg?.arrival?.iataCode}
              </div>
            </div>
          </div>

          {/* 3. Price & Booking Actions */}
          <div className="flex items-center justify-between md:flex-col md:items-end gap-2 pt-3 md:pt-0 md:border-t-0 flex-shrink-0 w-64 md:w-auto snap-center">
            <div className="text-left md:text-right">
              <div className="text-2xl sm:text-3xl font-black text-white tracking-tighter">
                {formattedTotal}
              </div>
              <div className="text-xs text-[#86868b]">
                {adults > 1 ? `total · ${symbol}${Number(offer.price?.perAdult || Math.round((offer.price?.total || 0) / adults)).toLocaleString()} / traveler` : "total per traveler"}
              </div>
            </div>

            <div className="flex flex-col items-end gap-1.5">
              <button
                type="button"
                onClick={() => setModalOpen(true)}
                className="px-8 py-3.5 rounded-2xl font-bold text-[13px] bg-blue-600 hover:bg-blue-700 text-white transition-colors cursor-pointer shadow-md active:scale-95 whitespace-nowrap uppercase tracking-wide"
              >
                Select Flight
              </button>

              <button
                type="button"
                onClick={handleBookRedirect}
                className="text-[13px] text-[#86868b] hover:text-[#2997ff] transition-colors flex items-center gap-1 cursor-pointer"
              >
                <span>or book on {(airlineName || "Airline").split(" ")[0]}</span>
                <ExternalLink size={10} />
              </button>
            </div>
          </div>
        </div>

        {/* Card Footer Bar */}
        <div className="flex items-center justify-between pt-3 border-t border-white/5 text-xs flex-wrap gap-2">
          <div className="flex items-center gap-4 text-xs font-medium text-[#a1a1aa] flex-wrap">
            <span className="flex items-center gap-1">
              <Luggage size={12} className="text-slate-200" />
              <span>{offer.baggageAllowance || "1x 23kg included"}</span>
            </span>
            <span>·</span>
            <span className="text-emerald-400">Free cancellation within 24h</span>
            <span className="hidden sm:inline">·</span>
            <span className="hidden sm:inline">Seat choice included</span>
          </div>

          <button
            type="button"
            onClick={() => setDetailsOpen(!detailsOpen)}
            className="text-xs font-medium text-slate-200 hover:text-white transition-colors flex items-center gap-1 cursor-pointer ml-auto"
          >
            <span>{detailsOpen ? "Hide details" : "Flight details"}</span>
            {detailsOpen ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
          </button>
        </div>

        {/* Comprehensive Segment & Fare Details Drawer */}
        {detailsOpen && (
          <div className="p-4 rounded-xl bg-slate-950/60 border border-white/5 text-xs space-y-4 animate-slide-up">
            {/* Segments list */}
            <div className="space-y-3">
              <div className="text-xs font-semibold text-slate-100">Flight Route</div>
              {segments.map((seg, idx) => {
                const segDepAirport = getAirportByIata(seg.departure?.iataCode);
                const segArrAirport = getAirportByIata(seg.arrival?.iataCode);
                const segDep = new Date(seg.departure?.at || depDate);
                const segArr = new Date(seg.arrival?.at || arrDate);

                return (
                  <div key={seg.id || idx} className="p-3 rounded-lg bg-white/[0.03] border border-white/5 space-y-2">
                    <div className="flex items-center justify-between text-xs font-medium text-white flex-wrap gap-2">
                      <span className="flex items-center gap-2">
                        <span className="px-1.5 py-0.5 rounded bg-white/10 text-xs text-slate-100">Leg {idx + 1}</span>
                        <span>{segDepAirport?.city || seg.departure?.iataCode} ({seg.departure?.iataCode}) → {segArrAirport?.city || seg.arrival?.iataCode} ({seg.arrival?.iataCode})</span>
                      </span>
                      <span className="text-slate-200 text-[13px]">
                        {seg.number} · {seg.aircraft || "Modern Jet"}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[13px] text-slate-200 pt-1">
                      <div>
                        <span className="text-slate-300 block text-xs">Depart</span>
                        <span className="text-slate-200 font-medium">{formatTime(segDep)} · {seg.departure?.terminal ? `Term ${seg.departure.terminal}` : "T1"}</span>
                      </div>
                      <div>
                        <span className="text-slate-300 block text-xs">Arrive</span>
                        <span className="text-slate-200 font-medium">{formatTime(segArr)} · {seg.arrival?.terminal ? `Term ${seg.arrival.terminal}` : "T2"}</span>
                      </div>
                      <div>
                        <span className="text-slate-300 block text-xs">Duration</span>
                        <span className="text-slate-200 font-medium">
                          {Math.floor((seg.durationMinutes || Math.round((new Date(seg.arrival?.at).getTime() - new Date(seg.departure?.at).getTime()) / 60000) || 120) / 60)}h {(seg.durationMinutes || Math.round((new Date(seg.arrival?.at).getTime() - new Date(seg.departure?.at).getTime()) / 60000) || 120) % 60}m
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-300 block text-xs">Carrier</span>
                        <span className="text-slate-200 font-medium">{seg.airlineName || airlineName}</span>
                      </div>
                    </div>

                    {/* Layover banner */}
                    {idx < segments.length - 1 && (
                      <div className="mt-2 p-2 rounded bg-amber-500/10 border border-amber-500/20 text-amber-300 text-[13px] flex items-center gap-2">
                        <Clock size={12} className="flex-shrink-0" />
                        <span>Layover in {seg.arrival?.iataCode} ({segArrAirport?.city || "Transit"}) · Plane change</span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Price & Baggage Breakdown */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-2 border-t border-white/5">
              <div className="p-2.5 rounded-lg bg-white/[0.02]">
                <div className="text-slate-200 text-xs">Base Fare</div>
                <div className="text-white font-semibold mt-0.5">{formattedBase}</div>
              </div>
              <div className="p-2.5 rounded-lg bg-white/[0.02]">
                <div className="text-slate-200 text-xs">Taxes & Fees</div>
                <div className="text-white font-semibold mt-0.5">{formattedFees}</div>
              </div>
              <div className="p-2.5 rounded-lg bg-white/[0.02]">
                <div className="text-slate-200 text-xs">Baggage Allowance</div>
                <div className="text-emerald-400 font-semibold mt-0.5">{offer.baggageAllowance || "1x 23kg included"}</div>
              </div>
            </div>

            {/* Included amenities */}
            <div className="flex items-center gap-4 text-[13px] text-slate-200 pt-1">
              <span className="flex items-center gap-1 text-emerald-400"><Check size={12} /> Standard Seat</span>
              <span className="flex items-center gap-1 text-blue-300"><Check size={12} /> Wi-Fi Onboard</span>
              <span className="flex items-center gap-1 text-slate-100"><Check size={12} /> E-Boarding Pass</span>
            </div>
          </div>
        )}
      </motion.div>

      {/* Seat Booking Modal */}
      {modalOpen && (
        <BookingModal
          offer={offer}
          onClose={() => setModalOpen(false)}
        />
      )}

      {/* Airline Redirect Overlay */}
      {redirectInfo && (
        <RedirectToast
          airlineName={redirectInfo.name}
          url={redirectInfo.url}
          onDone={() => setRedirectInfo(null)}
        />
      )}
    </>
  );
}

