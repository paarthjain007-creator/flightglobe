import React from "react";
import { Info } from "lucide-react";
import GlassCard from "../ui/GlassCard";
import WeatherWidget from "./WeatherWidget";
import FlightStatusCard from "./FlightStatusCard";
import ExpenseBreakdown from "./ExpenseBreakdown";
import CurrencyConverter from "./CurrencyConverter";
import TimezoneCompare from "./TimezoneCompare";
import CarbonWidget from "./CarbonWidget";
import VisaVibeCard from "./VisaVibeCard";

export default function RightPanel({ origin, destination, workerResult, workerLoading }) {
  const hasRoute = origin && destination;

  return (
    <GlassCard
      className="p-4 w-72 flex flex-col gap-3 animate-slide-right"
      style={{ maxHeight: "calc(100vh - 100px)" }}
    >
      {/* Header */}
      <div className="flex items-center gap-2">
        <div
          className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
          style={{ background: "var(--accent-glow)", border: "1px solid var(--glass-border)" }}
        >
          <Info size={15} style={{ color: "var(--accent)" }} />
        </div>
        <div>
          <div className="text-sm font-bold" style={{ color: "var(--text-primary)" }}>
            Destination Insights
          </div>
          <div className="text-xs" style={{ color: "var(--text-muted)" }}>
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
            <div className="text-4xl mb-3">✈️</div>
            <p className="text-sm font-medium mb-1" style={{ color: "var(--text-primary)" }}>
              Plan Your Journey
            </p>
            <p className="text-xs leading-relaxed" style={{ color: "var(--text-muted)" }}>
              Select origin & destination to unlock weather, timezones, CO₂ tracking, visa info, and more
            </p>
          </div>
        )}

        {/* Timezone Comparison (NEW) */}
        {hasRoute && <TimezoneCompare origin={origin} destination={destination} />}

        {/* Weather */}
        {destination && <WeatherWidget airport={destination} />}

        {/* Flight Status */}
        {hasRoute && <FlightStatusCard origin={origin} destination={destination} />}

        {/* Carbon Footprint (NEW — from Web Worker) */}
        {hasRoute && (
          <CarbonWidget workerResult={workerResult} loading={workerLoading} />
        )}

        {/* Expense Breakdown */}
        {workerResult?.totalKm && (
          <ExpenseBreakdown
            costs={{
              economy:  Math.round(workerResult.totalKm * (workerResult.totalKm < 2000 ? 0.16 : 0.10)),
              business: Math.round(workerResult.totalKm * (workerResult.totalKm < 2000 ? 0.45 : 0.28)),
              first:    Math.round(workerResult.totalKm * (workerResult.totalKm < 2000 ? 0.88 : 0.55)),
            }}
            distKm={workerResult.totalKm}
            flightTime={workerResult.totalTime}
          />
        )}

        {/* Currency Converter */}
        {hasRoute && (
          <CurrencyConverter
            baseCostUSD={workerResult ? Math.round(workerResult.totalKm * 0.12) : undefined}
            destCurrency={destination?.currency}
          />
        )}

        {/* Visa & Vibe Check (NEW) */}
        {destination && <VisaVibeCard destination={destination} />}
      </div>
    </GlassCard>
  );
}
