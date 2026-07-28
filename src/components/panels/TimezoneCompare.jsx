import React, { useState, useEffect } from "react";
import { Clock, ArrowRight } from "lucide-react";
import GlassCard from "../ui/GlassCard";

function getLocalTime(timezone) {
  try {
    return new Intl.DateTimeFormat("en-US", {
      timeZone: timezone,
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    }).format(new Date());
  } catch {
    return "--:--";
  }
}


function getOffsetBetween(tz1, tz2) {
  try {
    const now = new Date();
    const d1 = new Date(now.toLocaleString("en-US", { timeZone: tz1 }));
    const d2 = new Date(now.toLocaleString("en-US", { timeZone: tz2 }));
    return (d2 - d1) / 3600000; // hours dest is ahead of origin
  } catch { return 0; }
}

export default function TimezoneCompare({ origin, destination }) {
  const [tick, setTick] = useState(0);

  // Refresh clock every minute
  useEffect(() => {
    const id = setInterval(() => setTick(t => t + 1), 60000);
    return () => clearInterval(id);
  }, []);

  if (!origin || !destination) return null;

  const originTime = getLocalTime(origin.timezone);
  const destTime   = getLocalTime(destination.timezone);
  const diffHours  = getOffsetBetween(origin.timezone, destination.timezone);
  const absDiff    = Math.abs(diffHours);
  const h = Math.floor(absDiff);
  const m = Math.round((absDiff - h) * 60);
  const diffLabel = `${h > 0 ? `${h}h` : ""}${m > 0 ? ` ${m}m` : ""}`.trim() || "0";

  const isAhead = diffHours > 0;
  const isSame  = diffHours === 0;
  const isBehind = diffHours < -23; // crosses date line

  let message = isSame
    ? "Same timezone ✓"
    : isAhead
    ? `+${diffLabel} ahead at destination`
    : `${diffLabel} behind at destination`;

  let messageColor = isSame ? "#4ade80" : isAhead ? "#fbbf24" : "#60a5fa";
  let note = null;
  if (diffHours < 0 && Math.abs(diffHours) > 5) {
    note = "🕐 Jet lag risk — plan recovery time";
  }
  if (diffHours > 5) {
    note = "🌅 You may arrive before local sunset";
  }
  if (isBehind) {
    note = "🪄 You arrive before you left! (date line)";
    messageColor = "#e879f9";
  }

  // Timeline bar: map offset to 0–100%
  const barFill = Math.min(100, Math.abs(diffHours / 24) * 100);

  return (
    <GlassCard className="p-4" animate="animate-slide-up">
      <div className="flex items-center gap-2 mb-3">
        <Clock size={14} style={{ color: "var(--accent)" }} />
        <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>
          Timezone Comparison
        </span>
      </div>

      {/* Clock Row */}
      <div className="flex items-center gap-2 mb-3">
        {/* Origin */}
        <div className="flex-1 rounded-xl p-2.5 text-center" style={{ background: "rgba(74,222,128,0.06)", border: "1px solid rgba(74,222,128,0.2)" }}>
          <div className="text-xs font-medium mb-0.5" style={{ color: "#4ade80" }}>{origin.iata}</div>
          <div className="text-lg font-bold" style={{ color: "var(--text-primary)" }}>{originTime}</div>
          <div className="text-xs mt-0.5 truncate" style={{ color: "var(--text-muted)" }}>{origin.city}</div>
        </div>

        <div className="flex-shrink-0 flex flex-col items-center gap-0.5">
          <ArrowRight size={14} style={{ color: "var(--accent)" }} />
          <span
            className="text-xs font-bold px-1.5 py-0.5 rounded-md"
            style={{ color: messageColor, background: `${messageColor}15`, border: `1px solid ${messageColor}40` }}
          >
            {isSame ? "=" : isAhead ? `+${h}h` : `-${h}h`}
          </span>
        </div>

        {/* Destination */}
        <div className="flex-1 rounded-xl p-2.5 text-center" style={{ background: "rgba(248,113,113,0.06)", border: "1px solid rgba(248,113,113,0.2)" }}>
          <div className="text-xs font-medium mb-0.5" style={{ color: "#f87171" }}>{destination.iata}</div>
          <div className="text-lg font-bold" style={{ color: "var(--text-primary)" }}>{destTime}</div>
          <div className="text-xs mt-0.5 truncate" style={{ color: "var(--text-muted)" }}>{destination.city}</div>
        </div>
      </div>

      {/* Timeline bar */}
      {!isSame && (
        <div className="mb-3">
          <div className="h-1.5 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.06)" }}>
            <div
              className="h-full rounded-full transition-all duration-700"
              style={{
                width: `${barFill}%`,
                background: `linear-gradient(90deg, ${messageColor}88, ${messageColor})`,
                marginLeft: isAhead ? "0" : "auto",
              }}
            />
          </div>
          <div className="flex justify-between mt-1">
            <span className="text-xs" style={{ color: "var(--text-muted)" }}>UTC-12</span>
            <span className="text-xs font-medium" style={{ color: messageColor }}>{message}</span>
            <span className="text-xs" style={{ color: "var(--text-muted)" }}>UTC+14</span>
          </div>
        </div>
      )}

      {/* Note */}
      {note && (
        <div className="rounded-lg px-3 py-2 text-xs" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid var(--glass-border)", color: "var(--text-muted)" }}>
          {note}
        </div>
      )}
    </GlassCard>
  );
}
