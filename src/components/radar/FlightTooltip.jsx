import React from "react";
import { X, Plane, Gauge, Navigation, Globe2, Radio, TrendingUp } from "lucide-react";

/**
 * FlightTooltip — glassmorphism card anchored at pointer position.
 * Shows ADS-B data for the selected/hovered flight.
 */
export default function FlightTooltip({ plane, x, y, onClose }) {
  if (!plane) return null;

  const isOnGround = plane.onGround;
  const isSynthetic = plane._synthetic;

  // Keep card within viewport
  const LEFT_OFFSET = 18;
  const TOP_OFFSET  = -12;
  const adjustedX = Math.min(x + LEFT_OFFSET, window.innerWidth  - 280);
  const adjustedY = Math.min(y + TOP_OFFSET,  window.innerHeight - 260);

  return (
    <div
      id="flight-tooltip"
      className="fixed z-[200] pointer-events-none animate-scale-up"
      style={{ left: adjustedX, top: adjustedY }}
    >
      <div
        className="w-64 rounded-2xl border shadow-2xl overflow-hidden"
        style={{
          background: "rgba(5, 10, 24, 0.94)",
          backdropFilter: "blur(28px)",
          borderColor: isOnGround ? "rgba(251,191,36,0.4)" : "rgba(96,165,250,0.4)",
          boxShadow: isOnGround
            ? "0 0 32px rgba(251,191,36,0.15)"
            : "0 0 32px rgba(96,165,250,0.15)",
        }}
      >
        {/* Header stripe */}
        <div
          className="px-4 py-2.5 flex items-center justify-between"
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
                className="text-sm font-black tracking-widest font-mono"
                style={{ color: isOnGround ? "#fbbf24" : "#60a5fa" }}
              >
                {plane.callsign}
              </div>
              <div className="text-[10px] font-mono" style={{ color: "var(--text-muted)" }}>
                ICAO: {plane.icao24?.toUpperCase()}
              </div>
            </div>
          </div>

          {/* Status badge */}
          <span
            className="text-[9px] font-bold px-2 py-0.5 rounded-full"
            style={{
              background: isOnGround ? "rgba(251,191,36,0.2)" : "rgba(74,222,128,0.2)",
              color: isOnGround ? "#fbbf24" : "#4ade80",
              border: `1px solid ${isOnGround ? "rgba(251,191,36,0.4)" : "rgba(74,222,128,0.4)"}`,
            }}
          >
            {isOnGround ? "ON GROUND" : "AIRBORNE"}
          </span>
        </div>

        {/* Data rows */}
        <div className="px-4 py-3 space-y-2.5">
          <DataRow
            icon={<Globe2 size={12} />}
            label="Country"
            value={plane.originCountry || "—"}
          />
          <DataRow
            icon={<TrendingUp size={12} />}
            label="Altitude"
            value={plane.altitude != null ? `${plane.altitude.toLocaleString()} ft` : "—"}
            color="#34d399"
          />
          <DataRow
            icon={<Gauge size={12} />}
            label="Speed"
            value={plane.velocity != null ? `${plane.velocity} kts` : "—"}
            color="#60a5fa"
          />
          <DataRow
            icon={<Navigation size={12} />}
            label="Heading"
            value={`${Math.round(plane.trueTrack)}°`}
          />
          <DataRow
            icon={<Radio size={12} />}
            label="Source"
            value={isSynthetic ? "Synthetic (demo)" : "OpenSky ADS-B"}
            color={isSynthetic ? "#f97316" : "#4ade80"}
          />
        </div>

        {/* Coord footer */}
        <div
          className="px-4 py-2 font-mono text-[10px] border-t flex items-center gap-1.5"
          style={{ borderColor: "var(--glass-border)", color: "var(--text-muted)" }}
        >
          <span>📍</span>
          <span>
            {plane.lat.toFixed(3)}°, {plane.lng.toFixed(3)}°
          </span>
        </div>
      </div>
    </div>
  );
}

function DataRow({ icon, label, value, color }) {
  return (
    <div className="flex items-center justify-between gap-2">
      <div className="flex items-center gap-1.5 text-[11px]" style={{ color: "var(--text-muted)" }}>
        <span style={{ color: "var(--text-muted)" }}>{icon}</span>
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
