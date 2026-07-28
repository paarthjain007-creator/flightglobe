import React from "react";
import { AlertOctagon, ShieldAlert, Wind, CloudLightning, CheckCircle } from "lucide-react";
import GlassCard from "../ui/GlassCard";
import { predictRouteAnomalies } from "../../services/anomalyPredictor";

export default function AnomalyWidget({ origin, destination }) {
  const { anomalies, severityScore } = predictRouteAnomalies(origin, destination);

  if (!origin || !destination) return null;

  const isHigh = severityScore === "HIGH";

  return (
    <GlassCard className="p-4" animate="animate-slide-up">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <ShieldAlert size={14} className={isHigh ? "text-red-400 animate-pulse" : "text-amber-400"} />
          <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>
            AI Flight Anomaly Radar
          </span>
        </div>

        {/* Severity Badge */}
        <span
          className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
            isHigh
              ? "bg-red-500/20 text-red-400 border border-red-500/40 animate-pulse"
              : anomalies.length > 0
              ? "bg-amber-500/20 text-amber-400 border border-amber-500/40"
              : "bg-emerald-500/20 text-emerald-400 border border-emerald-500/40"
          }`}
        >
          {severityScore} RISK
        </span>
      </div>

      {/* Anomalies List */}
      {anomalies.length === 0 ? (
        <div className="flex items-center gap-2 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs">
          <CheckCircle size={14} />
          <span>Optimal Flight Corridor. Zero turbulence anomalies predicted.</span>
        </div>
      ) : (
        <div className="space-y-2">
          {anomalies.map((anom) => (
            <div
              key={anom.id}
              className="p-3 rounded-xl space-y-1.5 transition-all"
              style={{
                background: anom.severity === "high" ? "rgba(248, 113, 113, 0.08)" : "rgba(251, 191, 36, 0.08)",
                border: `1px solid ${anom.severity === "high" ? "rgba(248, 113, 113, 0.25)" : "rgba(251, 191, 36, 0.25)"}`,
              }}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 font-bold text-xs" style={{ color: "var(--text-primary)" }}>
                  {anom.severity === "high" ? <AlertOctagon size={13} className="text-red-400" /> : <Wind size={13} className="text-amber-400" />}
                  <span>{anom.title}</span>
                </div>
                <span className="text-[11px] font-bold text-red-400">
                  {anom.probability}% Prob
                </span>
              </div>

              <div className="text-[11px]" style={{ color: "var(--text-muted)" }}>
                📍 Location: {anom.location}
              </div>
              <p className="text-[11px] leading-tight" style={{ color: "var(--text-primary)" }}>
                {anom.description}
              </p>
            </div>
          ))}
        </div>
      )}
    </GlassCard>
  );
}
