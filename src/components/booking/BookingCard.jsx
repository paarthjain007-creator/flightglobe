import React, { useState } from "react";
import { Plane, Clock, ShieldCheck, ArrowRight, ChevronDown, ChevronUp, Luggage, TrendingDown, Info } from "lucide-react";
import GlassCard from "../ui/GlassCard";

export default function BookingCard({ offer, onSelectOffer }) {
  const [detailsOpen, setDetailsOpen] = useState(false);

  if (!offer || !offer.itineraries || offer.itineraries.length === 0) return null;

  const itinerary = offer.itineraries[0];
  const segments = itinerary.segments || [];
  const firstSeg = segments[0];
  const lastSeg = segments[segments.length - 1];

  const durationHours = Math.floor(itinerary.durationMinutes / 60);
  const durationMins = itinerary.durationMinutes % 60;
  const isDirect = segments.length === 1;

  const depDate = firstSeg ? new Date(firstSeg.departure.at) : new Date();
  const arrDate = lastSeg ? new Date(lastSeg.arrival.at) : new Date();

  const symbol = offer.price.currencySymbol || "$";
  const formattedTotal = `${symbol}${offer.price.total.toLocaleString()}`;
  const formattedBase = `${symbol}${offer.price.base.toLocaleString()}`;
  const formattedFees = `${symbol}${offer.price.fees.toLocaleString()}`;

  return (
    <GlassCard className="p-4 sm:p-5 hover:border-cyan-400/50 transition-all duration-300 group shadow-xl space-y-3" animate="animate-slide-up">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">

        {/* Airline Info & Flight Number */}
        <div className="flex items-center gap-3 min-w-[200px]">
          <div className="w-11 h-11 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-2xl shadow-inner flex-shrink-0">
            {offer.validatingAirlineLogo || "✈️"}
          </div>
          <div>
            <div className="text-sm font-bold text-white group-hover:text-cyan-300 transition-colors flex items-center gap-2">
              <span>{offer.validatingAirlineName}</span>
              {offer.price.isLowestFare && (
                <span className="px-2 py-0.2 rounded-full text-[9px] font-bold bg-emerald-400 text-slate-950 flex items-center gap-0.5">
                  <TrendingDown size={9} /> Lowest Rate
                </span>
              )}
            </div>
            <div className="text-xs text-slate-400 font-mono">
              Flight {firstSeg?.number} · {offer.price.cabinClass}
            </div>
            {/* Baggage allowance */}
            <div className="text-[10px] text-cyan-300 flex items-center gap-1 font-mono mt-0.5">
              <Luggage size={11} />
              <span>{offer.baggageAllowance || "1x 23kg Included"}</span>
            </div>
          </div>
        </div>

        {/* Departure -> Duration & Layover -> Arrival */}
        <div className="flex-1 flex items-center justify-between gap-3 px-2">
          {/* Departure */}
          <div className="text-left">
            <div className="text-base sm:text-lg font-black text-white">
              {depDate.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: false })}
            </div>
            <div className="text-xs font-bold text-cyan-400">{firstSeg?.departure.iataCode}</div>
          </div>

          {/* Duration & Segment Milestones */}
          <div className="flex-1 flex flex-col items-center px-3">
            <div className="text-[10px] sm:text-[11px] text-slate-400 font-mono flex items-center gap-1 mb-1">
              <Clock size={11} />
              <span>{durationHours}h {durationMins}m</span>
            </div>

            {/* Flight Polyline Track */}
            <div className="w-full flex items-center">
              <div className="w-2 h-2 rounded-full bg-cyan-400 shadow-[0_0_8px_#00f0ff]" />
              <div className="flex-1 h-0.5 bg-gradient-to-r from-cyan-400 via-purple-400 to-emerald-400 relative">
                {!isDirect && (
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-2.5 h-2.5 rounded-full bg-amber-400 border border-slate-900 shadow-sm" title={`Layover: ${segments[0].arrival.iataCode}`} />
                )}
              </div>
              <div className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_#34d399]" />
            </div>

            <div className="text-[10px] font-semibold mt-1">
              {isDirect ? (
                <span className="text-emerald-400">Direct Non-stop</span>
              ) : (
                <span className="text-amber-400">
                  1 Stop via {segments[0].arrival.iataCode}
                </span>
              )}
            </div>
          </div>

          {/* Arrival */}
          <div className="text-right">
            <div className="text-base sm:text-lg font-black text-white">
              {arrDate.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: false })}
            </div>
            <div className="text-xs font-bold text-emerald-400">{lastSeg?.arrival.iataCode}</div>
          </div>
        </div>

        {/* Price & Book Handoff CTA */}
        <div className="flex items-center justify-between md:justify-end gap-3 pt-3 md:pt-0 border-t md:border-t-0 border-white/10">
          <div className="text-left md:text-right">
            <div className="text-xl sm:text-2xl font-black text-white tracking-tight">
              {formattedTotal}
            </div>
            <div className="text-[10px] text-slate-400 font-mono">
              Real rate per adult (incl. taxes)
            </div>
          </div>

          <button
            onClick={() => onSelectOffer(offer)}
            className="px-4 py-2.5 rounded-2xl font-bold text-xs flex items-center gap-1.5 bg-gradient-to-r from-cyan-400 to-cyan-500 text-slate-950 hover:from-cyan-300 hover:to-cyan-400 transition-all cursor-pointer shadow-lg shadow-cyan-400/20 active:scale-95"
          >
            <span>Book Flight</span>
            <ArrowRight size={14} />
          </button>
        </div>
      </div>

      {/* Expandable Detailed Rate & Fare Breakdown Bar */}
      <div className="pt-2 border-t border-white/10 flex items-center justify-between text-xs">
        <button
          type="button"
          onClick={() => setDetailsOpen(!detailsOpen)}
          className="text-slate-400 hover:text-cyan-300 transition-colors flex items-center gap-1 text-[11px] font-semibold cursor-pointer"
        >
          <Info size={12} />
          <span>Fare & Tax Breakdown</span>
          {detailsOpen ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
        </button>

        <span className="text-[10px] text-emerald-400 font-mono">⚡ Instant GDS E-Ticket Confirmation</span>
      </div>

      {detailsOpen && (
        <div className="p-3 rounded-2xl bg-slate-950/60 border border-white/10 text-xs space-y-2 animate-slide-up">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-slate-300 font-mono text-[11px]">
            <div>
              <span className="text-slate-500 block text-[9px]">Base Airfare</span>
              <span className="font-bold text-white">{formattedBase}</span>
            </div>
            <div>
              <span className="text-slate-500 block text-[9px]">Govt & Airport Taxes</span>
              <span className="font-bold text-white">{formattedFees}</span>
            </div>
            <div>
              <span className="text-slate-500 block text-[9px]">Cabin Class</span>
              <span className="font-bold text-cyan-300">{offer.price.cabinClass}</span>
            </div>
            <div>
              <span className="text-slate-500 block text-[9px]">Baggage Included</span>
              <span className="font-bold text-emerald-400">{offer.baggageAllowance}</span>
            </div>
          </div>

          <div className="text-[10px] text-slate-400 border-t border-white/10 pt-2 flex items-center justify-between">
            <span>Aircraft: <strong className="text-white">{firstSeg?.aircraft}</strong></span>
            <span>Flight No: <strong className="text-white">{firstSeg?.number}</strong></span>
          </div>
        </div>
      )}
    </GlassCard>
  );
}
