import React from "react";

/**
 * FlightSkeletonLoader
 * A premium animated skeleton that renders during flight data fetching
 * and currency conversion delays. Prevents jarring UI snaps.
 */
export function FlightCardSkeleton() {
  return (
    <div
      aria-busy="true"
      aria-label="Loading flight results"
      className="w-full rounded-2xl border border-white/5 bg-slate-800/40 p-4 flex items-center gap-4 animate-pulse"
    >
      {/* Airline Logo Placeholder */}
      <div className="w-11 h-11 rounded-full bg-slate-700/60 flex-shrink-0" />

      <div className="flex-1 space-y-2 min-w-0">
        <div className="flex items-center gap-2">
          <div className="h-3.5 w-24 bg-slate-700/60 rounded" />
          <div className="h-3 w-16 bg-slate-700/40 rounded" />
        </div>
        <div className="h-3 w-1/3 bg-slate-700/40 rounded" />
        <div className="flex gap-2 mt-1">
          <div className="h-2.5 w-20 bg-slate-700/30 rounded" />
          <div className="h-2.5 w-16 bg-slate-700/30 rounded" />
        </div>
      </div>

      {/* Price Placeholder */}
      <div className="text-right flex-shrink-0 space-y-2">
        <div className="h-5 w-20 bg-cyan-900/40 rounded-lg" />
        <div className="h-7 w-24 bg-cyan-500/20 rounded-xl" />
      </div>
    </div>
  );
}

export function FareMatrixSkeleton() {
  return (
    <div
      aria-busy="true"
      aria-label="Loading fare calendar"
      className="grid grid-cols-7 gap-2"
    >
      {Array.from({ length: 7 }).map((_, idx) => (
        <div
          key={idx}
          className="p-2.5 rounded-2xl bg-white/5 border border-white/10 text-center animate-pulse space-y-1.5"
        >
          <div className="h-2.5 bg-slate-700/60 rounded w-10 mx-auto" />
          <div className="h-4 bg-cyan-500/20 rounded w-14 mx-auto" />
        </div>
      ))}
    </div>
  );
}

export function FlightResultsSkeleton({ count = 4 }) {
  return (
    <div className="space-y-3" aria-busy="true" aria-label="Loading flight offers">
      {Array.from({ length: count }).map((_, i) => (
        <FlightCardSkeleton key={i} />
      ))}
    </div>
  );
}

export default FlightResultsSkeleton;
