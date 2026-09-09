import React from "react";
import { useNavigate } from "react-router-dom";
import { Globe2, Plane, Loader2, ArrowLeft, Users, ShieldCheck, Sparkles, TrendingUp, Zap } from "lucide-react";
import { useStore } from "../store/useStore";
import { useFlightWorker } from "../hooks/useFlightWorker";
import { useFlightSchedules } from "../hooks/useFlightSchedules";
import { useMultiplayer } from "../hooks/useMultiplayer";
import { estimateTicketCost } from "../utils/flightCalc";
import { AIRPORTS, getAirportByIata } from "../data/airports";
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
import DelayForecastCard from "../components/panels/DelayForecastCard";
import SupersonicCorridor from "../components/panels/SupersonicCorridor";
import { MultiplayerCursors } from "../components/multiplayer/MultiplayerCursors";

const STOP_COLORS = ["#4ade80", "#60a5fa", "#c084fc", "#fb923c", "#fbbf24", "#f87171"];

/* ── Hero Widget (Col 1-8 in Bento Grid) ─────────────────────────────────── */
function RouteSummaryHero({ waypoints, workerResult, onBookRoute }) {
  const valid = waypoints.filter(Boolean);
  return (
    <GlassCard
      tilt={true}
      glare={true}
      glow="cyan"
      className="p-6 border border-cyan-500/30 shadow-2xl flex flex-col justify-between h-full"
    >
      <div>
        <div className="flex items-center justify-between gap-2 mb-3">
          <div className="text-[11px] font-bold uppercase tracking-wider text-cyan-400 flex items-center gap-1.5">
            <Sparkles size={13} />
            <span>Your Trip Summary</span>
          </div>
          {onBookRoute && (
            <button
              type="button"
              onClick={onBookRoute}
              className="mono text-[10px] text-cyan-400 hover:text-cyan-300 font-bold flex items-center gap-1 px-2.5 py-1 rounded-xl bg-cyan-500/10 border border-cyan-400/30 hover:border-cyan-300 transition-all cursor-pointer"
            >
              <Plane size={11} />
              <span>Search Fares ↗</span>
            </button>
          )}
        </div>

        {/* Route Chain */}
        <div className="flex items-center gap-2 flex-wrap mb-5">
          {valid.map((wp, i) => (
            <React.Fragment key={`${wp.iata || wp.code}-${i}`}>
              <div className="flex flex-col items-center flex-shrink-0">
                <div
                  className="text-3xl sm:text-4xl font-black tracking-tight"
                  style={{ color: STOP_COLORS[i % STOP_COLORS.length] }}
                >
                  {wp.iata || wp.code}
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
      <div className="text-[10px] uppercase tracking-wider text-[#94A3B8] font-semibold">{label}</div>
      <div className="text-xl sm:text-2xl font-black font-mono" style={{ color: color || "#F8FAFC" }}>{value}</div>
      {sub && <div className="text-[10px] text-[#64748B]">{sub}</div>}
    </div>
  );
}

const TRENDING_ROUTES = [
  { from: "DEL", to: "BOM", label: "Delhi → Mumbai",         emoji: "🇮🇳→🌊", tag: "IndiGo / SpiceJet", tagColor: "text-orange-400" },
  { from: "JFK", to: "LHR", label: "New York → London",      emoji: "🗽→🎡", tag: "Most Booked",    tagColor: "text-cyan-400"    },
  { from: "DXB", to: "SIN", label: "Dubai → Singapore",      emoji: "🏙️→🦁", tag: "Best Value",     tagColor: "text-emerald-400" },
  { from: "DEL", to: "LHR", label: "Delhi → London",         emoji: "🇮🇳→🇬🇧",  tag: "Trending Now",  tagColor: "text-amber-400"   },
  { from: "LAX", to: "NRT", label: "Los Angeles → Tokyo",    emoji: "🌴→⛩️",  tag: "Popular Route", tagColor: "text-purple-400"  },
  { from: "CDG", to: "DXB", label: "Paris → Dubai",          emoji: "🗼→🏙️", tag: "Low CO₂",       tagColor: "text-green-400"   },
  { from: "SYD", to: "SIN", label: "Sydney → Singapore",     emoji: "🦘→🦁", tag: "Direct Flight", tagColor: "text-sky-400"     },
];

function TrendingDiscovery({ onSelectRoute, onBookRoute }) {
  return (
    <div className="max-w-4xl mx-auto px-4 py-16 space-y-8">
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full glass border border-cyan-400/20 text-xs font-semibold text-cyan-400">
          <TrendingUp size={12} /> Trending Global Routes
        </div>
        <h2 className="text-3xl font-black text-aurora-glow">Where will you fly next?</h2>
        <p className="text-sm text-[#94A3B8]">Pick a trending route to instantly load telemetry, fares &amp; insights</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {TRENDING_ROUTES.map(({ from, to, label, emoji, tag, tagColor }) => {
          const origin = getAirportByIata(from);
          const destination = getAirportByIata(to);
          if (!origin || !destination) return null;
          return (
            <GlassCard
              key={`${from}-${to}`}
              tilt={true}
              glare={true}
              glow="cyan"
              soundFeedback={true}
              onClick={() => onSelectRoute(origin, destination)}
              className="group p-5 text-left space-y-3 cursor-pointer border border-white/10 hover:border-cyan-400/40 transition-all duration-200"
            >
              <div className="flex items-start justify-between">
                <div className="text-2xl">{emoji}</div>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full bg-white/5 ${tagColor}`}>{tag}</span>
              </div>
              <div>
                <div className="text-sm font-bold text-[#F8FAFC] group-hover:text-cyan-300 transition-colors">{label}</div>
                <div className="text-xs text-[#94A3B8] font-mono mt-0.5">{from} → {to}</div>
              </div>
              <div className="flex items-center justify-between gap-2 pt-1 border-t border-white/5">
                <div className="flex items-center gap-1.5 text-xs text-cyan-400 font-semibold">
                  <Zap size={11} /> <span>Load Dashboard</span>
                </div>
                {onBookRoute && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onBookRoute(from, to);
                    }}
                    className="text-[10px] mono text-emerald-400 hover:text-emerald-300 hover:underline flex items-center gap-0.5 font-bold cursor-pointer"
                  >
                    <span>Book Flight ↗</span>
                  </button>
                )}
              </div>
            </GlassCard>
          );
        })}
      </div>

      <p className="text-center text-xs text-[#64748B]">
        Or go to <strong className="text-cyan-400">Explore</strong> to plot any custom route on the 3D globe
      </p>
    </div>
  );
}

/* ── 12-Column Bento Grid Dashboard ───────────────────────── */
export default function Dashboard() {
  const navigate    = useNavigate();
  const waypoints   = useStore((s) => s.waypoints);
  const setWaypoints = useStore((s) => s.setWaypoints);
  const searchOrigin = useStore((s) => s.searchOrigin);
  const searchDestination = useStore((s) => s.searchDestination);
  const validWps    = (waypoints || []).filter(Boolean);

  // Active route: prioritize waypoints, fallback to searchOrigin/searchDestination, fallback to JFK/LHR
  const activeWaypoints = validWps.length >= 2
    ? validWps
    : [searchOrigin || AIRPORTS[0], searchDestination || AIRPORTS[1]];

  const origin      = activeWaypoints[0];
  const destination = activeWaypoints[activeWaypoints.length - 1];

  function handleSelectTrendingRoute(originAirport, destAirport) {
    setWaypoints([originAirport, destAirport]);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  // Web Worker for math
  const { result: workerResult, loading: workerLoading } = useFlightWorker(
    activeWaypoints
  );

  // 7-Day Future Schedules & Predictive Forecast
  const { dailyForecast } = useFlightSchedules(origin, destination);

  // Multiplayer presence hook
  const { peers, reactions, sendReaction } = useMultiplayer("trip-dashboard");

  const currency = useStore((s) => s.currency || "USD");
  const costs = workerResult?.totalKm ? estimateTicketCost(workerResult.totalKm, currency) : null;

  return (
    <div
      id="dashboard-page"
      className="relative min-h-screen pb-16 px-4 sm:px-6 max-w-7xl mx-auto space-y-6 pt-24 sm:pt-28"
    >
      {/* Live Multiplayer Cursors & Reactions Overlay */}
      <MultiplayerCursors peers={peers} reactions={reactions} onSendReaction={sendReaction} />

      <div className="space-y-6 animate-fade-in">
        {/* ── Header & Presence Control Bar ──────────────────── */}
        <div
          className="flex items-center justify-between flex-wrap gap-4 pb-5"
          style={{ borderBottom: "1px solid rgba(255,255,255,0.07)" }}
        >
          <div>
            <div className="mono text-[10px] tracking-widest mb-1" style={{ color: "#64748B" }}>
              TRIP ANALYTICS // BENTO ARCHITECTURE
            </div>
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="text-2xl font-black text-aurora-glow">
                Telemetry Dashboard
              </h1>
              {/* Teammates Presence Avatars */}
              <div className="flex items-center -space-x-2">
                {peers.map((peer) => (
                  <div
                    key={peer.id}
                    className="w-7 h-7 rounded-full border-2 flex items-center justify-center text-xs shadow-sm"
                    style={{ background: peer.color, color: "#000", borderColor: "#040508" }}
                    title={`${peer.name} (${peer.city})`}
                  >
                    {peer.avatar}
                  </div>
                ))}
              </div>
            </div>
            <p className="text-xs mt-1" style={{ color: "#94A3B8" }}>
              Active Route:{" "}
              <span className="mono font-bold" style={{ color: "#00F2FE" }}>{origin.city} ({origin.iata || origin.code})</span>
              {" → "}
              <span className="mono font-bold" style={{ color: "#00FFA3" }}>{destination.city} ({destination.iata || destination.code})</span>
              {activeWaypoints.length > 2 && ` (+${activeWaypoints.length - 2} stopovers)`}
            </p>
          </div>

          <div className="flex items-center gap-2.5 flex-wrap">
            <button
              id="book-route-gds-btn"
              onClick={() => {
                const fromCode = origin?.iata || origin?.code;
                const toCode = destination?.iata || destination?.code;
                navigate(`/booking?from=${fromCode}&to=${toCode}`);
              }}
              className="flex items-center gap-2 px-4 py-2 rounded-2xl text-xs font-bold cursor-pointer transition-all btn-aurora shadow-lg shadow-cyan-500/20"
            >
              <Plane size={14} />
              <span>BOOK IN GDS ENGINE ↗</span>
            </button>

            <button
              id="edit-route-btn"
              onClick={() => navigate("/explore")}
              className="flex items-center gap-1.5 px-4 py-2 rounded-2xl text-xs font-bold cursor-pointer transition-all btn-ghost"
            >
              <ArrowLeft size={13} /> 3D GLOBE RADAR
            </button>
          </div>
        </div>

        {/* 12-Column Bento Box Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

          {/* Hero Widget (Cols 1-8) */}
          <div className="lg:col-span-8">
            <RouteSummaryHero
              waypoints={activeWaypoints}
              workerResult={workerResult}
              onBookRoute={() => {
                const fromCode = origin?.iata || origin?.code;
                const toCode = destination?.iata || destination?.code;
                navigate(`/booking?from=${fromCode}&to=${toCode}`);
              }}
            />
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

        {/* ── New Widgets Row: Delay Forecast + Supersonic Corridor ── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 mt-4">
          <div className="lg:col-span-6">
            <DelayForecastCard origin={origin} destination={destination} />
          </div>
          <div className="lg:col-span-6">
            <SupersonicCorridor />
          </div>
        </div>

        {/* ── Trending Corridors Quick Switcher ────────────────── */}
        <div className="pt-8 border-t border-white/10">
          <TrendingDiscovery
            onSelectRoute={handleSelectTrendingRoute}
            onBookRoute={(from, to) => navigate(`/booking?from=${from}&to=${to}`)}
          />
        </div>
      </div>
    </div>
  );
}

