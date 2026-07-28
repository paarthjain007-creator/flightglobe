import React from "react";
import { TrendingUp, AlertTriangle, Calendar, ShieldCheck, DollarSign } from "lucide-react";
import GlassCard from "../ui/GlassCard";

export default function PriceDelayForecastWidget({ dailyForecast = [], selectedDayIndex = 0 }) {
  if (!dailyForecast || dailyForecast.length === 0) return null;

  const maxPrice = Math.max(...dailyForecast.map((d) => d.avgPrice), 1);
  const selectedDay = dailyForecast[selectedDayIndex] || dailyForecast[0];

  // Lowest price day recommendation
  const cheapestDay = [...dailyForecast].sort((a, b) => a.avgPrice - b.avgPrice)[0];

  return (
    <GlassCard className="p-4" animate="animate-slide-up">
      {/* Header */}
      <div className="flex items-center gap-2 mb-3">
        <TrendingUp size={14} style={{ color: "var(--accent)" }} />
        <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>
          Price & Delay Predictive Forecast
        </span>
      </div>

      {/* 7-Day Price Bar Chart */}
      <div className="mb-4">
        <div className="flex items-center justify-between text-xs mb-2">
          <span style={{ color: "var(--text-muted)" }}>7-Day Ticket Price Trend</span>
          <span className="font-bold" style={{ color: "var(--accent)" }}>
            Lowest: ${cheapestDay?.avgPrice} ({cheapestDay?.label})
          </span>
        </div>

        <div className="flex items-end gap-1.5 h-24 pt-2 px-1 border-b border-white/10">
          {dailyForecast.map((d, idx) => {
            const heightPct = Math.max(15, (d.avgPrice / maxPrice) * 100);
            const isSelected = idx === selectedDayIndex;
            const isCheapest = d.dayIndex === cheapestDay?.dayIndex;

            return (
              <div key={d.dayIndex} className="flex-1 flex flex-col items-center gap-1 group">
                <span className="text-[9px] text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity">
                  ${d.avgPrice}
                </span>
                <div
                  className={`w-full rounded-t-lg transition-all duration-300 ${
                    isCheapest
                      ? "bg-emerald-400"
                      : isSelected
                      ? "bg-cyan-400"
                      : "bg-cyan-500/30 group-hover:bg-cyan-400/60"
                  }`}
                  style={{ height: `${heightPct}%` }}
                />
                <span className={`text-[10px] font-semibold ${isSelected ? "text-cyan-300" : "text-slate-400"}`}>
                  {d.label.split(" ")[0]}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Selected Day Forecast Breakdown */}
      <div className="grid grid-cols-2 gap-2 mb-3">
        {/* Delay Risk */}
        <div
          className="p-3 rounded-xl space-y-1"
          style={{
            background: selectedDay.avgDelayRisk > 30 ? "rgba(248,113,113,0.08)" : "rgba(74,222,128,0.08)",
            border: `1px solid ${selectedDay.avgDelayRisk > 30 ? "rgba(248,113,113,0.2)" : "rgba(74,222,128,0.2)"}`,
          }}
        >
          <div className="flex items-center gap-1 text-[11px] font-medium" style={{ color: selectedDay.avgDelayRisk > 30 ? "#f87171" : "#4ade80" }}>
            <AlertTriangle size={12} />
            <span>Delay Risk</span>
          </div>
          <div className="text-lg font-bold" style={{ color: "var(--text-primary)" }}>
            {selectedDay.avgDelayRisk}%
          </div>
          <div className="text-[10px]" style={{ color: "var(--text-muted)" }}>
            {selectedDay.avgDelayRisk > 30 ? "Peak traffic expected" : "Low historical delay"}
          </div>
        </div>

        {/* Optimal Booking Window */}
        <div
          className="p-3 rounded-xl space-y-1"
          style={{ background: "rgba(96,165,250,0.08)", border: "1px solid rgba(96,165,250,0.2)" }}
        >
          <div className="flex items-center gap-1 text-[11px] font-medium" style={{ color: "var(--accent)" }}>
            <ShieldCheck size={12} />
            <span>Booking Advice</span>
          </div>
          <div className="text-sm font-bold truncate" style={{ color: "var(--text-primary)" }}>
            {selectedDay.dayIndex === cheapestDay?.dayIndex ? "Best Value Day" : "Standard Fare"}
          </div>
          <div className="text-[10px]" style={{ color: "var(--text-muted)" }}>
            Avg ${selectedDay.avgPrice} / person
          </div>
        </div>
      </div>
    </GlassCard>
  );
}
