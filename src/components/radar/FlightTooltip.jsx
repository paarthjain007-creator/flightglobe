import React, { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { X, Plane, Gauge, Navigation, Globe2, Radio, TrendingUp } from "lucide-react";
import { AIRPORTS } from "../../data/airports";

/**
 * FlightTooltip — glassmorphism card anchored at pointer position with mobile bounds protection.
 */
export default function FlightTooltip({ plane, x, y, onClose }) {
  const navigate = useNavigate();
  if (!plane) return null;

  const isOnGround = plane.onGround;
  const isSynthetic = plane._synthetic;

  // Find nearest major airport
  const nearestAirport = useMemo(() => {
    if (plane.lat == null || plane.lng == null) return null;
    let closest = null;
    let minDist = Infinity;
    for (const apt of AIRPORTS) {
      const aptLng = apt.lng ?? apt.lon;
      if (apt.lat == null || aptLng == null) continue;
      const d = Math.hypot(apt.lat - plane.lat, aptLng - plane.lng);
      if (d < minDist) {
        minDist = d;
        closest = apt;
      }
    }
    return closest;
  }, [plane.lat, plane.lng]);

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
              <div className="text-[10px] font-mono text-slate-400">
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
            value={plane.trueTrack != null ? `${Math.round(plane.trueTrack)}°` : "—"}
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
          className="px-3.5 py-1.5 font-mono text-[10px] border-t flex items-center justify-between text-slate-400"
          style={{ borderColor: "rgba(255, 255, 255, 0.08)" }}
        >
          <span>📍 Coords</span>
          <span className="text-white font-semibold">
            {plane.lat != null ? plane.lat.toFixed(2) : "—"}°, {plane.lng != null ? plane.lng.toFixed(2) : "—"}°
          </span>
        </div>

        {/* Book Flights Shortcut */}
        {nearestAirport && (
          <div className="p-2 border-t border-white/10 bg-white/[0.03]">
            <button
              type="button"
              onClick={() => {
                onClose?.();
                navigate(`/search?from=${nearestAirport.iata}`);
              }}
              className="w-full flex items-center justify-center gap-1.5 py-1.5 rounded-xl bg-blue-500/15 hover:bg-blue-500/25 border border-blue-400/40 text-blue-300 hover:text-white text-[11px] font-semibold transition-all cursor-pointer shadow-sm"
              title={`Search flights originating from ${nearestAirport.city} (${nearestAirport.iata})`}
            >
              <Plane size={11} className="text-blue-400" />
              <span>Search Flights from {nearestAirport.iata} ↗</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function DataRow({ icon, label, value, color }) {
  return (
    <div className="flex items-center justify-between gap-2">
      <div className="flex items-center gap-1 text-[10px] text-slate-400">
        <span>{icon}</span>
        <span>{label}</span>
      </div>
      <span
        className="text-[10px] font-bold font-mono truncate max-w-[120px] text-right"
        style={{ color: color || "#F8FAFC" }}
      >
        {value}
      </span>
    </div>
  );
}
