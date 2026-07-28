import React, { useMemo } from "react";
import { Navigation2, Ruler, Clock, ArrowDown, Plane, Globe2, Plus, X, Milestone } from "lucide-react";
import GlassCard from "../ui/GlassCard";
import AirportSearch from "../Search/AirportSearch";
import { estimateTicketCost } from "../../utils/flightCalc";

// Gradient colors for each waypoint stop
const STOP_COLORS = ["#4ade80", "#60a5fa", "#c084fc", "#fb923c", "#fbbf24", "#f87171"];

function LegSummary({ workerResult }) {
  if (!workerResult) return null;
  const { legs, totalKm, totalTime } = workerResult;
  const isMulti = legs.length > 1;

  return (
    <div className="rounded-xl p-3 space-y-2 animate-slide-up" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid var(--glass-border)" }}>
      {isMulti && (
        <div className="text-xs font-semibold mb-1" style={{ color: "var(--text-muted)" }}>
          {legs.length}-Leg Journey
        </div>
      )}

      {legs.map((leg, i) => (
        <div key={`${leg.from}-${leg.to}-${i}`} className="flex items-center gap-2 text-xs">
          <span className="font-bold" style={{ color: STOP_COLORS[i % STOP_COLORS.length] }}>{leg.from}</span>
          <div className="flex-1 flex items-center">
            <div className="flex-1 h-px" style={{ background: "var(--glass-border)" }} />
            <Plane size={10} className="mx-1" style={{ color: "var(--accent)" }} />
            <div className="flex-1 h-px" style={{ background: "var(--glass-border)" }} />
          </div>
          <span className="font-bold" style={{ color: STOP_COLORS[(i + 1) % STOP_COLORS.length] }}>{leg.to}</span>
          <span className="tabular-nums text-right" style={{ color: "var(--text-muted)", minWidth: "52px" }}>
            {leg.km.toLocaleString()} km
          </span>
        </div>
      ))}

      {/* Total row */}
      <div className="pt-2" style={{ borderTop: "1px solid var(--glass-border)" }}>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <div className="flex items-center gap-1 mb-0.5">
              <Ruler size={10} style={{ color: "var(--accent)" }} />
              <span className="text-xs" style={{ color: "var(--text-muted)" }}>Total</span>
            </div>
            <div className="text-sm font-bold" style={{ color: "var(--text-primary)" }}>
              {totalKm.toLocaleString()} km
            </div>
          </div>
          <div>
            <div className="flex items-center gap-1 mb-0.5">
              <Clock size={10} style={{ color: "var(--accent)" }} />
              <span className="text-xs" style={{ color: "var(--text-muted)" }}>Est. Time</span>
            </div>
            <div className="text-sm font-bold" style={{ color: "var(--text-primary)" }}>
              {totalTime.hours}h {totalTime.minutes}m
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function LeftPanel({ waypoints, onWaypointsChange, workerResult }) {
  // Derive states: origin = waypoints[0], destination = waypoints[last], stops = middle
  const origin      = waypoints[0] || null;
  const destination = waypoints.length >= 2 ? waypoints[waypoints.length - 1] : null;
  const stops       = waypoints.slice(1, waypoints.length - 1);

  function setWaypoint(index, airport) {
    const next = [...waypoints];
    next[index] = airport;
    onWaypointsChange(next);
  }

  function setOrigin(airport) {
    const next = [airport, ...waypoints.slice(1)];
    onWaypointsChange(next);
  }

  function setDestination(airport) {
    if (waypoints.length < 2) {
      onWaypointsChange([waypoints[0] || null, airport]);
    } else {
      const next = [...waypoints];
      next[next.length - 1] = airport;
      onWaypointsChange(next);
    }
  }

  function addStop() {
    if (waypoints.length < 2) {
      onWaypointsChange([waypoints[0] || null, null, null]);
    } else {
      const next = [...waypoints];
      next.splice(next.length - 1, 0, null); // insert before destination
      onWaypointsChange(next);
    }
  }

  function removeStop(stopIndex) {
    const next = [...waypoints];
    next.splice(stopIndex + 1, 1);
    onWaypointsChange(next);
  }

  function swapOriginDest() {
    const next = [...waypoints].reverse();
    onWaypointsChange(next);
  }

  const hasRoute    = waypoints.filter(Boolean).length >= 2;
  const canAddStop  = waypoints.length < 6; // max 5-stop journey

  const costs = useMemo(() => {
    if (!workerResult?.totalKm) return null;
    return estimateTicketCost(workerResult.totalKm);
  }, [workerResult?.totalKm]);

  return (
    <GlassCard
      className="p-4 w-72 flex flex-col gap-3 animate-slide-left"
      style={{ maxHeight: "calc(100vh - 100px)" }}
    >
      {/* Header */}
      <div className="flex items-center gap-2.5">
        <div
          className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
          style={{ background: "var(--accent-glow)", border: "1px solid var(--glass-border)" }}
        >
          <Globe2 size={15} style={{ color: "var(--accent)" }} />
        </div>
        <div>
          <div className="text-sm font-bold" style={{ color: "var(--text-primary)" }}>Route Planner</div>
          <div className="text-xs" style={{ color: "var(--text-muted)" }}>
            {waypoints.filter(Boolean).length < 2 ? "Select airports to begin" : `${waypoints.filter(Boolean).length} stops`}
          </div>
        </div>

        {/* Multi-leg indicator */}
        {stops.length > 0 && (
          <div className="ml-auto flex items-center gap-1 px-2 py-0.5 rounded-full text-xs" style={{ background: "var(--accent-glow)", color: "var(--accent)", border: "1px solid var(--glass-border)" }}>
            <Milestone size={10} />
            Multi-leg
          </div>
        )}
      </div>

      <div className="glow-line" />

      {/* Scrollable area */}
      <div className="panel-scroll flex flex-col gap-3 flex-1">

        {/* ORIGIN */}
        <div>
          <div className="flex items-center gap-1.5 mb-2">
            <div className="w-2.5 h-2.5 rounded-full" style={{ background: STOP_COLORS[0] }} />
            <span className="text-xs font-semibold" style={{ color: STOP_COLORS[0] }}>Origin</span>
          </div>
          <AirportSearch
            id="origin-search"
            value={origin}
            onChange={setOrigin}
            placeholder="City, airport or IATA…"
          />
        </div>

        {/* INTERMEDIATE STOPS */}
        {stops.map((stop, i) => (
          <div key={stop?.iata || `stop-slot-${i}`}>
            <div className="flex items-center gap-1.5 mb-2">
              <div className="w-2.5 h-2.5 rounded-full" style={{ background: STOP_COLORS[(i + 1) % STOP_COLORS.length] }} />
              <span className="text-xs font-semibold" style={{ color: STOP_COLORS[(i + 1) % STOP_COLORS.length] }}>
                Stop {i + 1}
              </span>
              <button
                onClick={() => removeStop(i)}
                className="ml-auto p-0.5 rounded cursor-pointer hover:opacity-80 transition-opacity"
                style={{ color: "#f87171" }}
                title="Remove stop"
              >
                <X size={12} />
              </button>
            </div>
            <AirportSearch
              id={`stop-${i}-search`}
              value={stop}
              onChange={(airport) => setWaypoint(i + 1, airport)}
              placeholder="Add intermediate stop…"
            />
          </div>
        ))}

        {/* ADD STOP button */}
        {origin && destination && canAddStop && (
          <button
            id="add-stop-btn"
            onClick={addStop}
            className="flex items-center justify-center gap-2 w-full py-2 rounded-xl text-xs font-medium cursor-pointer transition-all hover:opacity-90 active:scale-95"
            style={{
              background: "rgba(255,255,255,0.04)",
              border: "1px dashed var(--glass-border)",
              color: "var(--accent)",
            }}
          >
            <Plus size={12} />
            Add Layover Stop
          </button>
        )}

        {/* SWAP */}
        <div className="flex justify-center">
          <button
            id="swap-airports-btn"
            onClick={swapOriginDest}
            disabled={waypoints.filter(Boolean).length < 2}
            className="p-2 rounded-full transition-all cursor-pointer hover:scale-110 active:scale-95 disabled:opacity-30 disabled:cursor-not-allowed"
            style={{ background: "var(--accent-glow)", border: "1px solid var(--glass-border)", color: "var(--accent)" }}
            title="Reverse entire route"
          >
            <ArrowDown size={14} />
          </button>
        </div>

        {/* DESTINATION */}
        <div>
          <div className="flex items-center gap-1.5 mb-2">
            <div className="w-2.5 h-2.5 rounded-full" style={{ background: "#f87171" }} />
            <span className="text-xs font-semibold" style={{ color: "#f87171" }}>Destination</span>
          </div>
          <AirportSearch
            id="destination-search"
            value={destination}
            onChange={setDestination}
            placeholder="City, airport or IATA…"
          />
        </div>

        {/* LEG SUMMARY from Worker */}
        {hasRoute && (
          <>
            <div className="glow-line" />
            <LegSummary workerResult={workerResult} />

            {/* Ticket costs */}
            {costs && (
              <div className="grid grid-cols-3 gap-1.5">
                {[
                  { label: "Economy", key: "economy", color: "#4ade80" },
                  { label: "Business", key: "business", color: "var(--accent)" },
                  { label: "First", key: "first", color: "#fbbf24" },
                ].map(({ label, key, color }) => (
                  <div
                    key={key}
                    className="rounded-xl px-2 py-2 text-center"
                    style={{ background: "rgba(255,255,255,0.04)", border: "1px solid var(--glass-border)" }}
                  >
                    <div className="text-xs mb-0.5" style={{ color: "var(--text-muted)" }}>{label}</div>
                    <div className="text-xs font-bold" style={{ color }}>${costs[key].toLocaleString()}</div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {/* Empty state */}
        {!origin && !destination && (
          <div className="text-center py-4">
            <Navigation2 size={24} className="mx-auto mb-2 opacity-30" style={{ color: "var(--accent)" }} />
            <p className="text-xs" style={{ color: "var(--text-muted)" }}>
              Search airports to draw a flight path on the globe
            </p>
          </div>
        )}
      </div>
    </GlassCard>
  );
}
