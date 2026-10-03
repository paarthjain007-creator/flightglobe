import React from "react";
import { TrendingUp, AlertTriangle, Calendar, ShieldCheck, DollarSign } from "lucide-react";
import GlassCard from "../ui/GlassCard";
import { useStore } from "../../store/useStore";
import { CURRENCY_MAP } from "../../services/api/amadeusService";

export default function PriceDelayForecastWidget({ dailyForecast = [], selectedDayIndex = 0 }) {
  const storeCurrency = useStore((s) => s.currency || "USD");
  const currencyConf = CURRENCY_MAP[storeCurrency] || CURRENCY_MAP.USD;
  const symbol = currencyConf.symbol || "$";

  if (!dailyForecast || dailyForecast.length === 0) return null;

  const maxPrice = Math.max(...dailyForecast.map((d) => d.avgPrice), 1);
  const selectedDay = dailyForecast[selectedDayIndex] || dailyForecast[0];

  // Lowest price day recommendation
  const cheapestDay = [...dailyForecast].sort((a, b) => a.avgPrice - b.avgPrice)[0];

  return (
    <GlassCard className="p-4" animate="animate-slide-up">
      {/* Header */}
      <div className="flex items-center gap-2 mb-3">
        <TrendingUp size={14} className="text-[#2997ff]" />
        <span className="text-xs font-semibold uppercase tracking-wider text-[#86868b]">
          Price & Delay Predictive Forecast
        </span>
      </div>

      {/* 7-Day Price Bar Chart */}
      <div className="mb-4">
        <div className="flex items-center justify-between text-xs mb-2">
          <span className="text-[#86868b]">7-Day Ticket Price Trend</span>
          <span className="font-bold text-[#30d158]">
            Lowest: {symbol}{cheapestDay?.avgPrice?.toLocaleString() || 0} ({cheapestDay?.label})
          </span>
        </div>

        <div className="flex items-end gap-1.5 h-24 pt-2 px-1 border-b border-white/10">
          {dailyForecast.map((d, idx) => {
            const heightPct = Math.max(15, (d.avgPrice / maxPrice) * 100);
            const isSelected = idx === selectedDayIndex;
            const isCheapest = d.dayIndex === cheapestDay?.dayIndex;

            return (
              <div key={d.dayIndex} className="flex-1 flex flex-col items-center gap-1 group">
                <span className="text-xs text-[#86868b] opacity-0 group-hover:opacity-100 transition-opacity font-mono">
                  {symbol}{d.avgPrice}
                </span>
                <div
                  className={`w-full rounded-t-lg transition-all duration-300 ${
                    isCheapest
                      ? "bg-[#30d158]"
                      : isSelected
                      ? "bg-[#2997ff]"
                      : "bg-white/15 group-hover:bg-white/30"
                  }`}
                  style={{ height: `${heightPct}%` }}
                />
                <span className={`text-xs font-semibold ${isSelected ? "text-[#2997ff]" : "text-[#86868b]"}`}>
                  {d.label?.split(" ")[0] || d.day || ""}
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
            background: selectedDay.avgDelayRisk > 30 ? "rgba(255,69,58,0.08)" : "rgba(48,209,88,0.08)",
            border: `1px solid ${selectedDay.avgDelayRisk > 30 ? "rgba(255,69,58,0.2)" : "rgba(48,209,88,0.2)"}`,
          }}
        >
          <div className="flex items-center gap-1 text-[13px] font-medium" style={{ color: selectedDay.avgDelayRisk > 30 ? "#ff453a" : "#30d158" }}>
            <AlertTriangle size={12} />
            <span>Delay Risk</span>
          </div>
          <div className="text-lg font-bold text-[#f5f5f7]">
            {selectedDay.avgDelayRisk}%
          </div>
          <div className="text-xs text-[#86868b]">
            {selectedDay.avgDelayRisk > 30 ? "Peak traffic expected" : "Low historical delay"}
          </div>
        </div>

        {/* Optimal Booking Window */}
        <div
          className="p-3 rounded-xl space-y-1"
          style={{ background: "rgba(41,151,255,0.08)", border: "1px solid rgba(41,151,255,0.2)" }}
        >
          <div className="flex items-center gap-1 text-[13px] font-medium" style={{ color: "#2997ff" }}>
            <ShieldCheck size={12} />
            <span>Booking Advice</span>
          </div>
          <div className="text-sm font-bold truncate text-[#f5f5f7]">
            {selectedDay.dayIndex === cheapestDay?.dayIndex ? "Best Value Day" : "Standard Fare"}
          </div>
          <div className="text-xs text-[#86868b] font-mono">
            Avg {symbol}{selectedDay.avgPrice?.toLocaleString() || 0} / person
          </div>
        </div>
      </div>
    </GlassCard>
  );
}
