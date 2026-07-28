import React from "react";
import { Cpu, Radio, Clock, Globe2, Wifi, WifiOff } from "lucide-react";

/**
 * RadarStats — top-left HUD overlay showing live radar telemetry stats.
 */
export default function RadarStats({ stats }) {
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
      className="absolute top-4 left-4 z-20 glass rounded-2xl px-3.5 py-3 flex flex-col gap-2 min-w-[180px] animate-slide-left"
      style={{ borderColor: "rgba(96,165,250,0.25)" }}
    >
      {/* Title */}
      <div className="flex items-center gap-2">
        <div className="w-2 h-2 rounded-full animate-pulse" style={{ background: sourceColor }} />
        <span className="text-xs font-bold" style={{ color: "var(--text-primary)" }}>
          Live Air Traffic
        </span>
      </div>

      <div className="h-px" style={{ background: "var(--glass-border)" }} />

      {/* Stats */}
      <StatRow icon={<Globe2 size={11} />} label="Aircraft" value={count.toLocaleString()} color="#60a5fa" />
      <StatRow icon={<Cpu size={11} />} label="Render FPS" value={`${fps} fps`} color={fps >= 55 ? "#4ade80" : fps >= 30 ? "#fbbf24" : "#f87171"} />
      <StatRow
        icon={isOffline ? <WifiOff size={11} /> : <Wifi size={11} />}
        label="Source"
        value={sourceLabel}
        color={sourceColor}
      />
      <StatRow icon={<Clock size={11} />} label="Updated" value={lastUpdateStr} />

      {/* Poll cadence */}
      <div className="text-[9px] font-mono text-center pt-0.5" style={{ color: "var(--text-muted)" }}>
        Updates every 15 s · ADS-B telemetry
      </div>
    </div>
  );
}

function StatRow({ icon, label, value, color }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <div className="flex items-center gap-1.5 text-[11px]" style={{ color: "var(--text-muted)" }}>
        <span>{icon}</span>
        {label}
      </div>
      <span
        className="text-[11px] font-bold font-mono"
        style={{ color: color || "var(--text-primary)" }}
      >
        {value}
      </span>
    </div>
  );
}
