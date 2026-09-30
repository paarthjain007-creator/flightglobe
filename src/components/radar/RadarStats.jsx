import React, { useState } from "react";
import { Cpu, Radio, Clock, Globe2, Wifi, WifiOff, ChevronUp, ChevronDown, Activity } from "lucide-react";

/**
 * RadarStats — Expandable bottom-left telemetry drawer for Live Radar.
 */
export default function RadarStats({ stats }) {
  const [expanded, setExpanded] = useState(false);
  const count = stats?.count ?? 0;
  const source = stats?.source ?? "fallback";
  const lastUpdate = stats?.lastUpdate;
  const fps = stats?.fps ?? 60;

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
      className="absolute bottom-28 sm:bottom-4 left-3 sm:left-4 z-[201] pointer-events-auto rounded-2xl p-3 flex flex-col gap-2 min-w-[200px] max-w-[calc(100vw-24px)] border border-white/10 shadow-2xl transition-all"
      style={{
        background: "rgba(22, 22, 24, 0.88)",
        backdropFilter: "blur(24px)",
      }}
    >
      {/* Drawer Header Toggle */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="flex items-center justify-between gap-3 text-xs font-bold text-[#f5f5f7] cursor-pointer hover:text-white w-full"
      >
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full animate-pulse" style={{ background: sourceColor }} />
          <span>ADS-B Telemetry Drawer</span>
        </div>
        {expanded ? <ChevronDown size={14} className="text-[#86868b]" /> : <ChevronUp size={14} className="text-[#86868b]" />}
      </button>

      {/* Expandable Body */}
      {expanded && (
        <div className="space-y-2 pt-2 border-t border-white/10 animate-fade-in">
          <StatRow icon={<Globe2 size={11} className="text-[#2997ff]" />} label="Airborne Aircraft" value={count.toLocaleString()} color="#2997ff" />
          <StatRow icon={<Cpu size={11} />} label="Render FPS" value={`${fps} fps`} color={fps >= 55 ? "#30d158" : fps >= 30 ? "#ff9f0a" : "#ff453a"} />
          <StatRow
            icon={isOffline ? <WifiOff size={11} /> : <Wifi size={11} />}
            label="Feed Source"
            value={sourceLabel}
            color={sourceColor}
          />
          <StatRow icon={<Clock size={11} />} label="Last Sync" value={lastUpdateStr} />

          <div className="text-[9px] font-mono text-[#94A3B8] text-center pt-1 border-t border-white/5">
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
      <div className="flex items-center gap-1.5 text-[11px] text-[#94A3B8]">
        <span>{icon}</span>
        {label}
      </div>
      <span
        className="text-[11px] font-bold font-mono"
        style={{ color: color || "#F8FAFC" }}
      >
        {value}
      </span>
    </div>
  );
}

