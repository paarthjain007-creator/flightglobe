import React from "react";
import { X, Plane, Gauge, Navigation, Globe2, Radio, TrendingUp } from "lucide-react";

/**
 * FlightTooltip — glassmorphism card anchored at pointer position with mobile bounds protection.
 */
export default function FlightTooltip({ plane, x, y, onClose }) {
  if (!plane) return null;

  const isOnGround = plane.onGround;
  const isSynthetic = plane._synthetic;

  // Viewport bounds protection
  const LEFT_OFFSET = 12;
  const TOP_OFFSET  = -10;
  const adjustedX = Math.max(10, Math.min(x + LEFT_OFFSET, window.innerWidth - 270));
  const adjustedY = Math.max(70, Math.min(y + TOP_OFFSET, window.innerHeight - 250));

  return (
    <div
      id="flight-tooltip"
      className="fixed z-[200] pointer-events-auto animate-scale-up"
      style={{ left: adjustedX, top: adjustedY }}
    >
      <div
        className="w-64 rounded-2xl border shadow-2xl overflow-hidden"
        style={{
          background: "rgba(5, 10, 24, 0.95)",
          backdropFilter: "blur(28px)",
          borderColor: isOnGround ? "rgba(251,191,36,0.4)" : "rgba(96,165,250,0.4)",
          boxShadow: isOnGround
            ? "0 0 32px rgba(251,191,36,0.15)"
            : "0 0 32px rgba(96,165,250,0.15)",
        }}
      >
        {/* Header stripe */}
        <div
          className="px-3.5 py-2.5 flex items-center justify-between"
          style={{
            background: isOnGround
              ? "rgba(251,191,36,0.12)"
              : "rgba(96,165,250,0.12)",
            borderBottom: `1px solid ${isOnGround ? "rgba(251,191,36,0.2)" : "rgba(96,165,250,0.2)"}`,
          }}
        >
          <div className="flex items-center gap-2">
            <span className="text-lg">✈️</span>
            <div>
              <div
                className="text-xs font-black tracking-wider font-mono"
                style={{ color: isOnGround ? "#fbbf24" : "#60a5fa" }}
              >
                {plane.callsign}
              </div>
              <div className="text-[10px] font-mono" style={{ color: "var(--text-muted)" }}>
                ICAO: {plane.icao24?.toUpperCase()}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <span
              className="text-[9px] font-bold px-2 py-0.5 rounded-full"
              style={{
                background: isOnGround ? "rgba(251,191,36,0.2)" : "rgba(74,222,128,0.2)",
                color: isOnGround ? "#fbbf24" : "#4ade80",
                border: `1px solid ${isOnGround ? "rgba(251,191,36,0.4)" : "rgba(74,222,128,0.4)"}`,
              }}
            >
              {isOnGround ? "GROUND" : "AIRBORNE"}
            </span>
            {onClose && (
              <button
                onClick={onClose}
                className="p-1 rounded-full text-slate-400 hover:text-white cursor-pointer"
              >
                <X size={14} />
              </button>
            )}
          </div>
        </div>

        {/* Data rows */}
        <div className="px-3.5 py-2.5 space-y-2">
          <DataRow
            icon={<Globe2 size={11} />}
            label="Airline / Country"
            value={plane.originCountry || "—"}
          />
          <DataRow
            icon={<TrendingUp size={11} />}
            label="Altitude"
            value={plane.altitude != null ? `${plane.altitude.toLocaleString()} ft` : "—"}
            color="#34d399"
          />
          <DataRow
            icon={<Gauge size={11} />}
            label="Speed"
            value={plane.velocity != null ? `${plane.velocity} kts` : "—"}
            color="#60a5fa"
          />
          <DataRow
            icon={<Navigation size={11} />}
            label="Heading"
            value={`${Math.round(plane.trueTrack)}°`}
          />
          <DataRow
            icon={<Radio size={11} />}
            label="Telemetry Source"
            value={isSynthetic ? "Synthetic Fleet" : "OpenSky ADS-B"}
            color={isSynthetic ? "#f97316" : "#4ade80"}
          />
        </div>

        {/* Coord footer */}
        <div
          className="px-3.5 py-1.5 font-mono text-[10px] border-t flex items-center justify-between"
          style={{ borderColor: "var(--glass-border)", color: "var(--text-muted)" }}
        >
          <span>📍 Coords</span>
          <span className="text-white font-semibold">
            {plane.lat.toFixed(2)}°, {plane.lng.toFixed(2)}°
          </span>
        </div>
      </div>
    </div>
  );
}

function DataRow({ icon, label, value, color }) {
  return (
    <div className="flex items-center justify-between gap-2">
      <div className="flex items-center gap-1 text-[10px]" style={{ color: "var(--text-muted)" }}>
        <span>{icon}</span>
        <span>{label}</span>
      </div>
      <span
        className="text-[10px] font-bold font-mono truncate max-w-[120px] text-right"
        style={{ color: color || "var(--text-primary)" }}
      >
        {value}
      </span>
    </div>
  );
}
