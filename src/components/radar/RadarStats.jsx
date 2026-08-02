import React, { useState } from "react";
import { Cpu, Radio, Clock, Globe2, Wifi, WifiOff, ChevronUp, ChevronDown, Activity } from "lucide-react";

/**
 * RadarStats — Expandable bottom-left telemetry drawer for Live Radar.
 */
export default function RadarStats({ stats }) {
  const [expanded, setExpanded] = useState(false);
  const { count, source, lastUpdate, fps } = stats;

  const isLive    = source === "opensky";
  const isCached  = source === "cache";
  const isOffline = source === "fallback";

  const sourceColor = isLive ? "#4ade80" : isCached ? "#fbbf24" : "#f87171";
  const sourceLabel = isLive ? "OpenSky ADS-B Live" : isCached ? "Cached" : "Synthetic Demo";

  const lastUpdateStr = lastUpdate
    ? lastUpdate.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: false })
    : "—";

  return (
    <div
      id="radar-stats"
      className="absolute bottom-4 left-4 z-30 glass rounded-2xl p-3 flex flex-col gap-2 min-w-[200px] border border-cyan-500/30 shadow-2xl transition-all"
    >
      {/* Drawer Header Toggle */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="flex items-center justify-between gap-3 text-xs font-bold text-slate-200 cursor-pointer hover:text-cyan-300 w-full"
      >
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full animate-pulse" style={{ background: sourceColor }} />
          <span>ADS-B Telemetry Drawer</span>
        </div>
        {expanded ? <ChevronDown size={14} /> : <ChevronUp size={14} />}
      </button>

      {/* Expandable Body */}
      {expanded && (
        <div className="space-y-2 pt-2 border-t border-white/10 animate-fade-in">
          <StatRow icon={<Globe2 size={11} />} label="Airborne Aircraft" value={count.toLocaleString()} color="#60a5fa" />
          <StatRow icon={<Cpu size={11} />} label="Render FPS" value={`${fps} fps`} color={fps >= 55 ? "#4ade80" : fps >= 30 ? "#fbbf24" : "#f87171"} />
          <StatRow
            icon={isOffline ? <WifiOff size={11} /> : <Wifi size={11} />}
            label="Feed Source"
            value={sourceLabel}
            color={sourceColor}
          />
          <StatRow icon={<Clock size={11} />} label="Last Sync" value={lastUpdateStr} />

          <div className="text-[9px] font-mono text-slate-400 text-center pt-1 border-t border-white/5">
            15s Cadence · Real-World Flight Telemetry
          </div>
        </div>
      )}
    </div>
  );
}

function StatRow({ icon, label, value, color }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
        <span>{icon}</span>
        {label}
      </div>
      <span
        className="text-[11px] font-bold font-mono"
        style={{ color: color || "#ffffff" }}
      >
        {value}
      </span>
    </div>
  );
}
