import React from "react";
import { Info } from "lucide-react";
import GlassCard from "../ui/GlassCard";
import WeatherWidget from "./WeatherWidget";
import FlightStatusCard from "./FlightStatusCard";
import TimezoneCompare from "./TimezoneCompare";
import CurrencyConverter from "./CurrencyConverter";
import { useStore } from "../../store/useStore";

export default function RightPanel({ origin, destination, workerResult, workerLoading }) {
  const hasRoute = origin && destination;
  const storeCurrency = useStore((s) => s.currency || "USD");

  return (
    <GlassCard
      className="p-4 w-72 flex flex-col gap-3 animate-slide-right"
      style={{ maxHeight: "calc(100vh - 100px)" }}
    >
      {/* Header */}
      <div className="flex items-center gap-2">
        <div
          className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
          style={{ background: "rgba(41, 151, 255, 0.12)", border: "1px solid rgba(41, 151, 255, 0.25)" }}
        >
          <Info size={15} style={{ color: "#2997ff" }} />
        </div>
        <div>
          <div className="text-sm font-bold text-[#f5f5f7]">
            Destination Insights
          </div>
          <div className="text-xs text-[#86868b]">
            {destination ? `${destination.city}, ${destination.country}` : "Select a destination"}
          </div>
        </div>
      </div>

      <div className="glow-line" />

      {/* Scrollable panels */}
      <div className="panel-scroll flex flex-col gap-3 flex-1">

        {/* Empty state */}
        {!hasRoute && (
          <div className="text-center py-8">
            <div className="text-4xl mb-3">🛫</div>
            <p className="text-sm font-medium mb-1" style={{ color: "#F8FAFC" }}>
              Plan Your Journey
            </p>
            <p className="text-xs leading-relaxed text-slate-400">
              Select origin & destination to unlock weather, timezones, and flight status.
            </p>
          </div>
        )}

        {/* Timezone Comparison (NEW) */}
        {hasRoute && <TimezoneCompare origin={origin} destination={destination} />}

        {/* Weather */}
        {destination && <WeatherWidget airport={destination} />}

        {/* Flight Status */}
        {hasRoute && <FlightStatusCard origin={origin} destination={destination} />}

        {/* Currency Converter */}
        {hasRoute && (
          <CurrencyConverter
            baseCostUSD={workerResult ? Math.round(workerResult.totalKm * 0.12) : undefined}
            destCurrency={destination?.currency}
          />
        )}
      </div>
    </GlassCard>
  );
}
