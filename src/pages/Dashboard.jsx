import React from "react";
import { useNavigate } from "react-router-dom";
import { Globe2, Plane, Loader2, ArrowLeft, Users, ShieldCheck, Sparkles } from "lucide-react";
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

/* ── Hero Widget (Col 1-8 in Bento Grid) ─────────────────────────────────── */
function RouteSummaryHero({ waypoints, workerResult }) {
  const valid = waypoints.filter(Boolean);
  return (
    <GlassCard className="p-6 border border-cyan-500/30 shadow-2xl flex flex-col justify-between h-full">
      <div>
        <div className="text-[11px] font-bold uppercase tracking-wider text-cyan-400 mb-3 flex items-center gap-1.5">
          <Sparkles size={13} />
          <span>Active Route Telemetry Overview</span>
        </div>

        {/* Route Chain */}
        <div className="flex items-center gap-2 flex-wrap mb-5">
          {valid.map((wp, i) => (
            <React.Fragment key={`${wp.iata}-${i}`}>
              <div className="flex flex-col items-center flex-shrink-0">
                <div
                  className="text-3xl sm:text-4xl font-black tracking-tight"
                  style={{ color: STOP_COLORS[i % STOP_COLORS.length] }}
                >
                  {wp.iata}
                </div>
                <div className="text-xs text-center font-medium text-slate-300">
                  {wp.city}
                </div>
              </div>
              {i < valid.length - 1 && (
                <div className="flex items-center gap-1 flex-1 min-w-8">
                  <div className="flex-1 h-px bg-white/20" />
                  <Plane size={14} className="text-cyan-400" />
                  <div className="flex-1 h-px bg-white/20" />
                </div>
              )}
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* Stats row */}
      {workerResult ? (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4 border-t border-white/10">
          <HeroStat label="Total Distance" value={`${workerResult.totalKm.toLocaleString()} km`} sub={`${workerResult.totalMiles.toLocaleString()} mi`} />
          <HeroStat label="Flight Time"    value={`${workerResult.totalTime.hours}h ${workerResult.totalTime.minutes}m`} sub="estimated cruise" />
          <HeroStat label="CO₂ Footprint"  value={`${workerResult.co2Kg} kg`} sub="per traveler" color="#4ade80" />
          <HeroStat label="Leg Count"      value={String(workerResult.legs.length)} sub={`${workerResult.legs.length}-leg itinerary`} color="#00f0ff" />
        </div>
      ) : (
        <div className="flex items-center gap-2 pt-3 border-t border-white/10 text-cyan-300">
          <Loader2 size={14} className="animate-spin" />
          <span className="text-xs font-mono">Computing flight trajectory...</span>
        </div>
      )}
    </GlassCard>
  );
}

function HeroStat({ label, value, sub, color }) {
  return (
    <div className="flex flex-col gap-0.5">
      <div className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold">{label}</div>
      <div className="text-xl sm:text-2xl font-black font-mono" style={{ color: color || "#ffffff" }}>{value}</div>
      {sub && <div className="text-[10px] text-slate-400">{sub}</div>}
    </div>
  );
}

/* ── Empty State ───────────────────────────────────────────── */
function EmptyState({ onNavigate }) {
  return (
    <div className="flex flex-col items-center justify-center text-center px-6 py-28 gap-5">
      <div className="text-7xl">🗺️</div>
      <div>
        <h2 className="text-2xl font-bold text-white mb-2">
          No Flight Route Selected
        </h2>
        <p className="text-xs text-slate-400 max-w-sm">
          Go to <strong className="text-cyan-400">Explore</strong> or <strong className="text-cyan-400">Booking</strong>, select a route, and hit <strong className="text-cyan-400">"Calculate Insights"</strong>.
        </p>
      </div>
      <button
        id="dashboard-plan-route-btn"
        onClick={onNavigate}
        className="flex items-center gap-2 px-6 py-3 rounded-2xl font-bold text-xs bg-cyan-400 text-slate-950 hover:bg-cyan-300 cursor-pointer shadow-xl transition-all"
      >
        <Globe2 size={15} /> Select Route on 3D Globe
      </button>
    </div>
  );
}

/* ── 12-Column Bento Grid Dashboard ───────────────────────── */
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
      className="relative min-h-screen pt-20 pb-16 px-4 sm:px-6 max-w-7xl mx-auto space-y-6"
      style={{ background: "var(--bg-primary)" }}
    >
      {/* Live Multiplayer Cursors & Reactions Overlay */}
      <MultiplayerCursors peers={peers} reactions={reactions} onSendReaction={sendReaction} />

      {!origin || !destination ? (
        <EmptyState onNavigate={() => navigate("/explore")} />
      ) : (
        <div className="space-y-6 animate-fade-in">
          {/* Header & Presence Control Bar */}
          <div className="flex items-center justify-between flex-wrap gap-4 border-b border-white/10 pb-5">
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-black text-white flex items-center gap-2">
                  <span>Trip Telemetry & Analytics Dashboard</span>
                  <span className="text-xs px-3 py-1 rounded-full bg-cyan-500/20 text-cyan-300 font-mono font-normal">
                    Bento Architecture
                  </span>
                </h1>
                
                {/* Teammates Presence Avatars */}
                <div className="flex items-center -space-x-2">
                  {peers.map((peer) => (
                    <div
                      key={peer.id}
                      className="w-7 h-7 rounded-full border-2 border-slate-900 flex items-center justify-center text-xs shadow-sm"
                      style={{ background: peer.color, color: "#000" }}
                      title={`${peer.name} (${peer.city})`}
                    >
                      {peer.avatar}
                    </div>
                  ))}
                </div>
              </div>

              <p className="text-xs text-slate-400 mt-1">
                Route: <strong className="text-cyan-300 font-mono">{origin.city} ({origin.iata})</strong> ✈️ <strong className="text-emerald-300 font-mono">{destination.city} ({destination.iata})</strong>
                {validWps.length > 2 && ` (+${validWps.length - 2} stopovers)`}
              </p>
            </div>

            <button
              id="edit-route-btn"
              onClick={() => navigate("/explore")}
              className="flex items-center gap-1.5 px-4 py-2 rounded-2xl text-xs font-bold glass text-cyan-300 border border-cyan-500/30 hover:border-cyan-400 cursor-pointer transition-all"
            >
              <ArrowLeft size={13} /> Modify Route
            </button>
          </div>

          {/* 12-Column Bento Box Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

            {/* Hero Widget (Cols 1-8) */}
            <div className="lg:col-span-8">
              <RouteSummaryHero waypoints={validWps} workerResult={workerResult} />
            </div>

            {/* AI Anomaly Radar (Cols 9-12) */}
            <div className="lg:col-span-4">
              <AnomalyWidget origin={origin} destination={destination} />
            </div>

            {/* Price & Delay Forecast (Cols 1-6) */}
            <div className="lg:col-span-6">
              <PriceDelayForecastWidget dailyForecast={dailyForecast} />
            </div>

            {/* Carbon & Environmental Footprint (Cols 7-12) */}
            <div className="lg:col-span-6">
              <CarbonWidget workerResult={workerResult} loading={workerLoading} />
            </div>

            {/* Trip Utilities 4-Grid (Cols 1-12 Split) */}
            <div className="lg:col-span-6">
              <TimezoneCompare origin={origin} destination={destination} />
            </div>

            <div className="lg:col-span-6">
              <WeatherWidget airport={destination} />
            </div>

            <div className="lg:col-span-6">
              <CurrencyConverter
                baseCostUSD={
                  workerResult?.totalKm
                    ? Math.round(workerResult.totalKm * 0.12)
                    : undefined
                }
                destCurrency={destination?.currency}
              />
            </div>

            <div className="lg:col-span-6">
              <VisaVibeCard destination={destination} />
            </div>

            {/* Bottom Row: Simulated Flight Status & Expense Breakdown (Cols 1-12) */}
            <div className="lg:col-span-6">
              <FlightStatusCard origin={origin} destination={destination} />
            </div>

            <div className="lg:col-span-6">
              {costs && (
                <ExpenseBreakdown
                  costs={costs}
                  distKm={workerResult?.totalKm}
                  flightTime={workerResult?.totalTime}
                />
              )}
            </div>

          </div>
        </div>
      )}
    </div>
  );
}
