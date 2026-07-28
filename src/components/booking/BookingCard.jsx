import React from "react";
import { Plane, Clock, ShieldCheck, ArrowRight, ExternalLink, Milestone, CheckCircle2 } from "lucide-react";
import GlassCard from "../ui/GlassCard";

export default function BookingCard({ offer, onSelectOffer }) {
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

  return (
    <GlassCard className="p-5 hover:border-cyan-400/50 transition-all duration-300 group shadow-xl" animate="animate-slide-up">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">

        {/* Airline Info & Flight Number */}
        <div className="flex items-center gap-3 min-w-[180px]">
          <div className="w-10 h-10 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-xl shadow-inner">
            {offer.validatingAirlineLogo || "✈️"}
          </div>
          <div>
            <div className="text-sm font-bold text-white group-hover:text-cyan-300 transition-colors">
              {offer.validatingAirlineName}
            </div>
            <div className="text-xs text-slate-400 font-mono">
              Flight {firstSeg?.number} · {offer.price.cabinClass}
            </div>
          </div>
        </div>

        {/* Departure -> Duration & Layover -> Arrival */}
        <div className="flex-1 flex items-center justify-between gap-3 px-2">
          {/* Departure */}
          <div className="text-left">
            <div className="text-lg font-black text-white">
              {depDate.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: false })}
            </div>
            <div className="text-xs font-bold text-cyan-400">{firstSeg?.departure.iataCode}</div>
          </div>

          {/* Duration & Segment Milestones */}
          <div className="flex-1 flex flex-col items-center px-4">
            <div className="text-[11px] text-slate-400 font-mono flex items-center gap-1 mb-1">
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
                <span className="text-amber-400 flex items-center gap-1">
                  <Milestone size={10} />
                  1 Stop via {segments[0].arrival.iataCode}
                </span>
              )}
            </div>
          </div>

          {/* Arrival */}
          <div className="text-right">
            <div className="text-lg font-black text-white">
              {arrDate.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: false })}
            </div>
            <div className="text-xs font-bold text-emerald-400">{lastSeg?.arrival.iataCode}</div>
          </div>
        </div>

        {/* Price & Book Handoff CTA */}
        <div className="flex items-center justify-between md:justify-end gap-4 pt-3 md:pt-0 border-t md:border-t-0 border-white/10">
          <div className="text-left md:text-right">
            <div className="text-2xl font-black text-white tracking-tight">
              ${offer.price.total.toLocaleString()}
            </div>
            <div className="text-[10px] text-slate-400 font-mono">
              Total per adult (incl. taxes)
            </div>
          </div>

          <button
            onClick={() => onSelectOffer(offer)}
            className="px-5 py-2.5 rounded-2xl font-bold text-xs flex items-center gap-2 bg-gradient-to-r from-cyan-400 to-cyan-500 text-slate-950 hover:from-cyan-300 hover:to-cyan-400 transition-all cursor-pointer shadow-lg shadow-cyan-400/20 active:scale-95"
          >
            <span>Book Now</span>
            <ArrowRight size={14} />
          </button>
        </div>
      </div>
    </GlassCard>
  );
}
