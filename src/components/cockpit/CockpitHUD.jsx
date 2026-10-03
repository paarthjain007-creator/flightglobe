import React, { useMemo } from "react";
import { Compass, Navigation, Shield, X, Gauge, ArrowUpRight } from "lucide-react";

export function CockpitHUD({
  origin,
  destination,
  progress = 0.5,
  heading,
  altitudeFt = 36000,
  speedKmh = 860,
  onExitCockpit,
}) {
  const speedKnots = Math.round(speedKmh * 0.539957);
  const altitudeM = Math.round(altitudeFt * 0.3048);
  const progressPct = Math.round(progress * 100);

  const calculatedHeading = useMemo(() => {
    if (heading != null) return heading;
    if (origin && destination) {
      const oLat = ((origin.lat ?? 0) * Math.PI) / 180;
      const dLat = ((destination.lat ?? 0) * Math.PI) / 180;
      const oLng = origin.lng ?? origin.lon ?? 0;
      const dLng = destination.lng ?? destination.lon ?? 0;
      const deltaLng = ((dLng - oLng) * Math.PI) / 180;
      const y = Math.sin(deltaLng) * Math.cos(dLat);
      const x = Math.cos(oLat) * Math.sin(dLat) - Math.sin(oLat) * Math.cos(dLat) * Math.cos(deltaLng);
      const deg = (Math.atan2(y, x) * 180) / Math.PI;
      return Math.round((deg + 360) % 360);
    }
    return 78;
  }, [heading, origin, destination]);

  return (
    <div
      id="cockpit-hud-overlay"
      className="fixed inset-0 z-40 pointer-events-none flex flex-col justify-between p-4 sm:p-6 select-none"
    >
      {/* Top HUD Bar */}
      <div className="flex items-start justify-between flex-wrap gap-3">
        {/* Left Telemetry Box */}
        <div
          className="glass px-4 py-2.5 rounded-2xl border border-white/12 text-xs font-mono space-y-1 shadow-2xl pointer-events-auto"
          style={{ background: "rgba(22, 22, 24, 0.85)", backdropFilter: "blur(12px)", WebkitBackdropFilter: "blur(12px)" }}
        >
          <div className="flex items-center gap-2 text-[#2997ff] font-semibold">
            <Gauge size={14} />
            <span>AIRSPEED</span>
          </div>
          <div className="text-xl font-bold text-[#f5f5f7]">
            {speedKnots} <span className="text-xs text-[#86868b]">KTS</span> ({speedKmh} km/h)
          </div>
        </div>

        {/* Center Compass & Route Header */}
        <div
          className="glass px-6 py-2.5 rounded-2xl border border-white/12 text-center shadow-2xl pointer-events-auto"
          style={{ background: "rgba(22, 22, 24, 0.88)", backdropFilter: "blur(12px)", WebkitBackdropFilter: "blur(12px)" }}
        >
          <div className="text-xs text-[#2997ff] font-semibold tracking-widest uppercase mb-0.5">
            COCKPIT FIRST-PERSON HUD
          </div>
          <div className="text-base font-bold text-[#f5f5f7] flex items-center justify-center gap-2">
            <span>{origin?.iata || origin?.code || "DEP"}</span>
            <ArrowUpRight size={14} className="text-[#2997ff]" />
            <span>{destination?.iata || destination?.code || "ARR"}</span>
          </div>
          <div className="flex items-center justify-center gap-1.5 text-xs text-[#86868b] font-mono mt-0.5">
            <Compass size={12} />
            <span>HDG {calculatedHeading}°</span>
          </div>
        </div>

        {/* Right Telemetry Box & Exit CTA */}
        <div className="flex items-center gap-2 pointer-events-auto">
          <div
            className="glass px-4 py-2.5 rounded-2xl border border-white/12 text-xs font-mono space-y-1 shadow-2xl"
            style={{ background: "rgba(22, 22, 24, 0.85)", backdropFilter: "blur(12px)", WebkitBackdropFilter: "blur(12px)" }}
          >
            <div className="flex items-center gap-2 text-[#2997ff] font-semibold">
              <Navigation size={14} />
              <span>ALTITUDE</span>
            </div>
            <div className="text-xl font-bold text-[#f5f5f7]">
              {altitudeFt.toLocaleString()} <span className="text-xs text-[#86868b]">FT</span> ({altitudeM.toLocaleString()}m)
            </div>
          </div>

          <button
            onClick={onExitCockpit}
            className="p-3 rounded-2xl bg-white/[0.06] text-[#86868b] border border-white/12 hover:bg-white/[0.12] hover:text-white transition-all cursor-pointer shadow-lg"
            title="Exit Cockpit View"
          >
            <X size={18} />
          </button>
        </div>
      </div>

      {/* Central Crosshair & Artificial Horizon Indicator */}
      <div className="relative flex-1 flex items-center justify-center pointer-events-none">
        {/* Pitch ladder & horizon crosshair */}
        <div className="relative w-64 h-64 flex items-center justify-center opacity-70">
          {/* Outer Ring */}
          <div className="absolute inset-0 rounded-full border border-white/20 animate-pulse" />

          {/* Crosshair Horizontal Bars */}
          <div className="w-48 h-px bg-[#2997ff]/60" />
          <div className="h-20 w-px bg-[#2997ff]/60 absolute" />

          {/* Center Target Box */}
          <div className="w-8 h-8 border border-white/30 rounded-md absolute" />
        </div>
      </div>

      {/* Bottom Progress Bar */}
      <div className="w-full max-w-xl mx-auto glass p-3.5 rounded-2xl border border-white/12 shadow-2xl space-y-2 pointer-events-auto" style={{ background: "rgba(22, 22, 24, 0.88)", backdropFilter: "blur(12px)", WebkitBackdropFilter: "blur(12px)" }}>
        <div className="flex items-center justify-between text-xs font-mono font-semibold text-[#86868b]">
          <span>Enroute Flight Progress</span>
          <span className="text-[#f5f5f7]">{progressPct}%</span>
        </div>
        <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
          <div
            className="h-full bg-[#0071e3] transition-all duration-300 rounded-full"
            style={{ width: `${progressPct}%` }}
          />
        </div>
      </div>
    </div>
  );
}

export default CockpitHUD;
