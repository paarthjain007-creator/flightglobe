import React from "react";
import { Leaf, DollarSign, TreePine, Loader2 } from "lucide-react";
import GlassCard from "../ui/GlassCard";

function OffsetBar({ co2Kg }) {
  // Visual severity bar: green (<100kg) → yellow (<500kg) → red (>500kg)
  const maxKg = 1500;
  const pct = Math.min(100, (co2Kg / maxKg) * 100);
  const color = co2Kg < 150 ? "#4ade80" : co2Kg < 500 ? "#fbbf24" : "#f87171";
  const label = co2Kg < 150 ? "Low impact" : co2Kg < 500 ? "Moderate" : "High impact";

  return (
    <div className="space-y-1.5">
      <div className="flex justify-between text-xs text-slate-400">
        <span>{label}</span>
        <span style={{ color }}>{co2Kg} kg CO₂</span>
      </div>
      <div className="h-2 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.07)" }}>
        <div
          className="h-full rounded-full transition-all duration-1000"
          style={{ width: `${pct}%`, background: `linear-gradient(90deg, #4ade8088, ${color})` }}
        />
      </div>
    </div>
  );
}

export default function CarbonWidget({ workerResult, loading }) {
  if (loading) {
    return (
      <GlassCard className="p-4 flex items-center justify-center gap-2" animate="animate-slide-up">
        <Loader2 size={14} className="animate-spin" style={{ color: "#00F2FE" }} />
        <span className="text-xs text-[#94A3B8]">Calculating emissions…</span>
      </GlassCard>
    );
  }

  if (!workerResult) return null;

  const { co2Kg, co2Tons, offsetCostUSD, totalTime } = workerResult;
  if (co2Kg === undefined || !totalTime) return null; // guard against incomplete result
  const treesNeeded = Math.max(1, Math.ceil(co2Kg / 21)); // ~21 kg CO2 absorbed per tree/year

  return (
    <GlassCard className="p-4" animate="animate-slide-up">
      <div className="flex items-center gap-2 mb-3">
        <Leaf size={14} style={{ color: "#4ade80" }} />
        <span className="text-xs font-semibold uppercase tracking-wider text-[#94A3B8]">
          Carbon Footprint
        </span>
      </div>

      {/* Main CO2 stat */}
      <div className="flex items-end gap-2 mb-3">
        <div className="text-3xl font-black font-mono" style={{ color: "#4ade80" }}>{co2Kg}</div>
        <div className="mb-1 text-sm font-medium text-[#94A3B8]">kg CO₂ / person</div>
      </div>

      <OffsetBar co2Kg={co2Kg} />

      <div className="mt-3 grid grid-cols-2 gap-2">
        {/* Offset cost */}
        <div className="rounded-xl px-3 py-2.5" style={{ background: "rgba(251,191,36,0.07)", border: "1px solid rgba(251,191,36,0.2)" }}>
          <div className="flex items-center gap-1 mb-1">
            <DollarSign size={11} style={{ color: "#fbbf24" }} />
            <span className="text-xs text-[#fbbf24]">Offset Cost</span>
          </div>
          <div className="text-sm font-bold text-[#F8FAFC] font-mono">${offsetCostUSD}</div>
          <div className="text-xs text-[#94A3B8]">at $15/ton</div>
        </div>

        {/* Trees */}
        <div className="rounded-xl px-3 py-2.5" style={{ background: "rgba(74,222,128,0.06)", border: "1px solid rgba(74,222,128,0.2)" }}>
          <div className="flex items-center gap-1 mb-1">
            <TreePine size={11} style={{ color: "#4ade80" }} />
            <span className="text-xs text-[#4ade80]">Trees/year</span>
          </div>
          <div className="text-sm font-bold text-[#F8FAFC] font-mono">{treesNeeded}</div>
          <div className="text-xs text-[#94A3B8]">to absorb</div>
        </div>
      </div>

      {/* Emissions context */}
      <div className="mt-3 text-xs px-2 py-1.5 rounded-lg text-[#94A3B8]" style={{ background: "rgba(255,255,255,0.03)" }}>
        ≈ {co2Tons ?? 0} tons · based on {totalTime?.hours ?? 0}h {totalTime?.minutes ?? 0}m total flight time
      </div>
    </GlassCard>
  );
}
