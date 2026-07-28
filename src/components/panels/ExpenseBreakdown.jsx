import React from "react";
import { DollarSign, Briefcase, Crown, TrendingUp } from "lucide-react";
import GlassCard from "../ui/GlassCard";

const TIERS = [
  { key: "economy", label: "Economy", icon: DollarSign, color: "#4ade80", bgColor: "rgba(74,222,128,0.08)", borderColor: "rgba(74,222,128,0.2)" },
  { key: "business", label: "Business", icon: Briefcase, color: "var(--accent)", bgColor: "var(--accent-glow)", borderColor: "var(--glass-border)" },
  { key: "first", label: "First Class", icon: Crown, color: "#fbbf24", bgColor: "rgba(251,191,36,0.08)", borderColor: "rgba(251,191,36,0.2)" },
];

export default function ExpenseBreakdown({ costs, distKm, flightTime }) {
  if (!costs) return null;

  return (
    <GlassCard className="p-4" animate="animate-slide-up">
      <div className="flex items-center gap-2 mb-3">
        <TrendingUp size={14} style={{ color: "var(--accent)" }} />
        <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>
          Ticket Estimate
        </span>
        <span className="ml-auto text-xs" style={{ color: "var(--text-muted)" }}>USD</span>
      </div>

      <div className="space-y-2">
        {TIERS.map(({ key, label, icon: Icon, color, bgColor, borderColor }) => (
          <div
            key={key}
            className="flex items-center gap-3 rounded-xl px-3 py-2.5"
            style={{ background: bgColor, border: `1px solid ${borderColor}` }}
          >
            <div className="flex-shrink-0 w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: `${color}22` }}>
              <Icon size={13} style={{ color }} />
            </div>
            <div className="flex-1">
              <div className="text-xs font-medium" style={{ color: "var(--text-muted)" }}>{label}</div>
            </div>
            <div className="text-sm font-bold" style={{ color }}>
              ${costs[key].toLocaleString()}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-3 pt-3 border-t" style={{ borderColor: "var(--glass-border)" }}>
        <div className="flex justify-between text-xs" style={{ color: "var(--text-muted)" }}>
          <span>* Round-trip estimate. Prices vary.</span>
        </div>
      </div>
    </GlassCard>
  );
}
