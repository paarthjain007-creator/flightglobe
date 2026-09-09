import React, { useState, useEffect } from "react";
import { Plane, Clock, AlertCircle, CheckCircle2, Loader2, DoorOpen } from "lucide-react";
import GlassCard from "../ui/GlassCard";
import { generateFlightStatus } from "../../utils/flightCalc";

function StatusBadge({ status }) {
  const config = {
    "On Time": { cls: "status-on-time", icon: CheckCircle2, bg: "rgba(74,222,128,0.08)" },
    "Delayed":  { cls: "status-delayed",  icon: AlertCircle,   bg: "rgba(248,113,113,0.08)" },
    "Boarding": { cls: "status-boarding", icon: DoorOpen,       bg: "rgba(251,191,36,0.08)"  },
    "Departed": { cls: "status-departed", icon: Plane,          bg: "rgba(96,165,250,0.08)"  },
  };
  const { cls, icon: Icon, bg } = config[status] || config["On Time"];

  return (
    <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${cls}`} style={{ background: bg, border: `1px solid currentColor`, opacity: 0.9 }}>
      <Icon size={11} />
      {status}
    </div>
  );
}

export default function FlightStatusCard({ origin, destination }) {
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!origin || !destination) { setStatus(null); return; }
    setLoading(true);
    // Simulate async API call
    const t = setTimeout(() => {
      setStatus(generateFlightStatus(origin, destination));
      setLoading(false);
    }, 800);
    return () => clearTimeout(t);
  }, [origin?.iata, destination?.iata]);

  if (!origin || !destination) return null;

  return (
    <GlassCard className="p-4" animate="animate-slide-up">
      <div className="flex items-center gap-2 mb-3">
        <Plane size={14} style={{ color: "#00F2FE" }} />
        <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
          Flight Status
        </span>
        <div className="ml-auto">
          <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: "rgba(0, 242, 254, 0.12)", color: "#00F2FE", border: "1px solid rgba(0, 242, 254, 0.25)" }}>
            Simulated
          </span>
        </div>
      </div>

      {loading && (
        <div className="flex items-center gap-2 py-3 justify-center">
          <Loader2 size={14} className="animate-spin" style={{ color: "#00F2FE" }} />
          <span className="text-xs text-slate-400">Loading status…</span>
        </div>
      )}

      {status && !loading && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-lg font-bold" style={{ color: "#F8FAFC" }}>{status.flightNum}</div>
              <div className="text-xs text-slate-400">{status.airline}</div>
            </div>
            <StatusBadge status={status.status} />
          </div>

          <div className="glow-line" />

          <div className="grid grid-cols-2 gap-2 text-sm">
            <div className="rounded-lg px-3 py-2" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255, 255, 255, 0.08)" }}>
              <div className="text-xs mb-0.5 text-slate-400">Departure</div>
              <div className="font-semibold" style={{ color: "#F8FAFC" }}>{status.depTime}</div>
            </div>
            <div className="rounded-lg px-3 py-2" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255, 255, 255, 0.08)" }}>
              <div className="text-xs mb-0.5 text-slate-400">Gate</div>
              <div className="font-semibold" style={{ color: "#F8FAFC" }}>{status.gate}</div>
            </div>
          </div>

          {status.delayMin > 0 && (
            <div className="flex items-center gap-2 rounded-lg px-3 py-2" style={{ background: "rgba(248,113,113,0.08)", border: "1px solid rgba(248,113,113,0.2)" }}>
              <Clock size={12} className="status-delayed" />
              <span className="text-xs" style={{ color: "#f87171" }}>
                Delayed {status.delayMin} min — {status.delayReason}
              </span>
            </div>
          )}
        </div>
      )}
    </GlassCard>
  );
}
