import React from "react";
import { useNavigate } from "react-router-dom";
import { Globe2, Plane, Loader2, ArrowLeft, Users, Wifi } from "lucide-react";
import { useStore } from "../store/useStore";
import { useFlightWorker } from "../hooks/useFlightWorker";
import { useFlightSchedules } from "../hooks/useFlightSchedules";
import { useMultiplayer } from "../hooks/useMultiplayer";
import { estimateTicketCost } from "../utils/flightCalc";
import GlassCard from "../components/ui/GlassCard";
import TimezoneCompare from "../components/panels/TimezoneCompare";
import CarbonWidget from "../components/panels/CarbonWidget";
import WeatherWidget from "../components/panels/WeatherWidget";
import FlightStatusCard from "../components/panels/FlightStatusCard";
import ExpenseBreakdown from "../components/panels/ExpenseBreakdown";
import CurrencyConverter from "../components/panels/CurrencyConverter";
import VisaVibeCard from "../components/panels/VisaVibeCard";
import PriceDelayForecastWidget from "../components/panels/PriceDelayForecastWidget";
import AnomalyWidget from "../components/panels/AnomalyWidget";
import { MultiplayerCursors } from "../components/multiplayer/MultiplayerCursors";

const STOP_COLORS = ["#4ade80", "#60a5fa", "#c084fc", "#fb923c", "#fbbf24", "#f87171"];

/* ── Route Hero ────────────────────────────────────────────── */
function RouteSummaryHero({ waypoints, workerResult }) {
  const valid = waypoints.filter(Boolean);
  return (
    <GlassCard className="p-6 mb-5">
      {/* Route chain */}
      <div className="flex items-center gap-2 flex-wrap mb-5">
        {valid.map((wp, i) => (
          <React.Fragment key={`${wp.iata}-${i}`}>
            <div className="flex flex-col items-center flex-shrink-0">
              <div
                className="text-3xl font-black tracking-tight"
                style={{ color: STOP_COLORS[i % STOP_COLORS.length] }}
              >
                {wp.iata}
              </div>
              <div className="text-xs text-center" style={{ color: "var(--text-muted)" }}>
                {wp.city}
              </div>
            </div>
            {i < valid.length - 1 && (
              <div className="flex items-center gap-1 flex-1 min-w-8">
                <div className="flex-1 h-px" style={{ background: "var(--glass-border)" }} />
                <Plane size={12} style={{ color: "var(--accent)" }} />
                <div className="flex-1 h-px" style={{ background: "var(--glass-border)" }} />
              </div>
            )}
          </React.Fragment>
        ))}
      </div>

      {/* Stats — only render when worker result is ready */}
      {workerResult ? (
        <div
          className="flex flex-wrap gap-6 pt-4"
          style={{ borderTop: "1px solid var(--glass-border)" }}
        >
          <HeroStat label="Total Distance" value={`${workerResult.totalKm.toLocaleString()} km`} sub={`${workerResult.totalMiles.toLocaleString()} mi`} />
          <HeroStat label="Flight Time"    value={`${workerResult.totalTime.hours}h ${workerResult.totalTime.minutes}m`} sub="estimated" />
          <HeroStat label="CO₂ Footprint"  value={`${workerResult.co2Kg} kg`} sub="per person" color="#4ade80" />
          <HeroStat label="Legs"           value={String(workerResult.legs.length)} sub={`${workerResult.legs.length}-stop journey`} color="var(--accent)" />
        </div>
      ) : (
        <div className="flex items-center gap-2 pt-3" style={{ borderTop: "1px solid var(--glass-border)" }}>
          <Loader2 size={13} className="animate-spin" style={{ color: "var(--accent)" }} />
          <span className="text-xs" style={{ color: "var(--text-muted)" }}>Computing stats…</span>
        </div>
      )}
    </GlassCard>
  );
}

function HeroStat({ label, value, sub, color }) {
  return (
    <div className="flex flex-col gap-0.5">
      <div className="text-xs uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>{label}</div>
      <div className="text-2xl font-black" style={{ color: color || "var(--text-primary)" }}>{value}</div>
      {sub && <div className="text-xs" style={{ color: "var(--text-muted)" }}>{sub}</div>}
    </div>
  );
}

/* ── Empty State ───────────────────────────────────────────── */
function EmptyState({ onNavigate }) {
  return (
    <div className="flex flex-col items-center justify-center text-center px-6 py-28 gap-5">
      <div className="text-7xl">🗺️</div>
      <div>
        <h2 className="text-2xl font-bold mb-2" style={{ color: "var(--text-primary)" }}>
          No Route Planned Yet
        </h2>
        <p className="text-sm max-w-sm" style={{ color: "var(--text-muted)" }}>
          Go to <strong style={{ color: "var(--accent)" }}>Explore</strong> or <strong style={{ color: "var(--accent)" }}>AI Copilot</strong>, build a route, then
          hit <strong style={{ color: "var(--accent)" }}>"Calculate Trip Insights"</strong>
        </p>
      </div>
      <button
        id="dashboard-plan-route-btn"
        onClick={onNavigate}
        className="flex items-center gap-2 px-6 py-3 rounded-2xl font-semibold text-sm cursor-pointer hover:scale-105 active:scale-95 transition-all"
        style={{ background: "var(--accent)", color: "var(--bg-primary)" }}
      >
        <Globe2 size={15} /> Plan a Route
      </button>
    </div>
  );
}

/* ── Dashboard Page ────────────────────────────────────────── */
export default function Dashboard() {
  const navigate    = useNavigate();
  const waypoints   = useStore((s) => s.waypoints);
  const validWps    = (waypoints || []).filter(Boolean);
  const origin      = validWps[0] ?? null;
  const destination = validWps.length >= 2 ? validWps[validWps.length - 1] : null;

  // Web Worker for math
  const { result: workerResult, loading: workerLoading } = useFlightWorker(
    validWps.length >= 2 ? validWps : null
  );

  // 7-Day Future Schedules & Predictive Forecast
  const { dailyForecast } = useFlightSchedules(origin, destination);

  // Multiplayer presence hook
  const { peers, reactions, sendReaction } = useMultiplayer("trip-dashboard");

  const costs = workerResult?.totalKm ? estimateTicketCost(workerResult.totalKm) : null;

  return (
    <div
      id="dashboard-page"
      className="relative"
      style={{ minHeight: "calc(100vh - 56px)", marginTop: "56px", background: "var(--bg-primary)" }}
    >
      {/* Live Multiplayer Cursors & Reactions Overlay */}
      <MultiplayerCursors peers={peers} reactions={reactions} onSendReaction={sendReaction} />

      {!origin || !destination ? (
        <EmptyState onNavigate={() => navigate("/explore")} />
      ) : (
        <div className="px-5 py-6 mx-auto" style={{ maxWidth: "1200px" }}>
          {/* Header & Presence Bar */}
          <div className="flex items-center justify-between mb-5 flex-wrap gap-3">
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-xl font-bold" style={{ color: "var(--text-primary)" }}>
                  Trip Dashboard
                </h1>
                
                {/* Teammates Presence Avatars */}
                <div className="flex items-center -space-x-2">
                  {peers.map((peer) => (
                    <div
                      key={peer.id}
                      className="w-6 h-6 rounded-full border-2 border-slate-900 flex items-center justify-center text-[10px] shadow-sm"
                      style={{ background: peer.color, color: "#000" }}
                      title={`${peer.name} (${peer.city})`}
                    >
                      {peer.avatar}
                    </div>
                  ))}
                </div>
              </div>

              <p className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>
                {origin.city} → {destination.city}
                {validWps.length > 2 &&
                  ` (+${validWps.length - 2} stop${validWps.length - 2 > 1 ? "s" : ""})`}
              </p>
            </div>

            <button
              id="edit-route-btn"
              onClick={() => navigate("/explore")}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium cursor-pointer hover:opacity-80 transition-all"
              style={{
                background: "var(--accent-glow)",
                border: "1px solid var(--glass-border)",
                color: "var(--accent)",
              }}
            >
              <ArrowLeft size={12} /> Edit Route
            </button>
          </div>

          {/* Route Hero */}
          <RouteSummaryHero waypoints={validWps} workerResult={workerResult} />

          {/* 2-column widget grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="space-y-4">
              <AnomalyWidget origin={origin} destination={destination} />
              <TimezoneCompare origin={origin} destination={destination} />
              <CarbonWidget workerResult={workerResult} loading={workerLoading} />
              {costs && (
                <ExpenseBreakdown
                  costs={costs}
                  distKm={workerResult?.totalKm}
                  flightTime={workerResult?.totalTime}
                />
              )}
              <FlightStatusCard origin={origin} destination={destination} />
            </div>

            <div className="space-y-4">
              <PriceDelayForecastWidget dailyForecast={dailyForecast} />
              <WeatherWidget airport={destination} />
              <CurrencyConverter
                baseCostUSD={
                  workerResult?.totalKm
                    ? Math.round(workerResult.totalKm * 0.12)
                    : undefined
                }
                destCurrency={destination?.currency}
              />
              <VisaVibeCard destination={destination} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
