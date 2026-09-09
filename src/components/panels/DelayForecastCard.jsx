import React, { useMemo } from "react";
import { Clock, AlertTriangle, CheckCircle2, CloudLightning, Wind } from "lucide-react";
import { useCountUp } from "../../hooks/useCountUp";

const AIRPORTS_EXTRA = {
  JFK: { congestion: 0.62, weather: 0.38, hub: "New York" },
  LHR: { congestion: 0.70, weather: 0.45, hub: "London" },
  DXB: { congestion: 0.40, weather: 0.15, hub: "Dubai" },
  DEL: { congestion: 0.55, weather: 0.60, hub: "New Delhi" },
  CDG: { congestion: 0.58, weather: 0.42, hub: "Paris" },
  SIN: { congestion: 0.35, weather: 0.30, hub: "Singapore" },
  HND: { congestion: 0.38, weather: 0.28, hub: "Tokyo" },
  LAX: { congestion: 0.60, weather: 0.25, hub: "Los Angeles" },
  default: { congestion: 0.45, weather: 0.35, hub: "" },
};

const RISK_CAUSES = [
  "Inbound aircraft en-route from",
  "Airspace congestion over",
  "Terminal aerodrome forecast at",
  "Gate conflict at",
  "Ground handling at",
];

function computeDelay(origin, destination) {
  const o = AIRPORTS_EXTRA[origin?.iata] || AIRPORTS_EXTRA.default;
  const d = AIRPORTS_EXTRA[destination?.iata] || AIRPORTS_EXTRA.default;
  const hour = new Date().getUTCHours();
  const peakFactor = ((hour >= 7 && hour <= 9) || (hour >= 17 && hour <= 20)) ? 0.18 : 0;
  const riskScore = o.congestion * 0.4 + d.congestion * 0.3 + o.weather * 0.2 + peakFactor * 0.1;
  const onTimeProb = Math.round(100 - riskScore * 58);
  const delayMins = riskScore > 0.55 ? Math.round(riskScore * 22 + 3) : 0;
  let status = "ON-TIME", color = "#00FFA3", borderColor = "rgba(0,255,163,0.30)";
  if (onTimeProb < 82) { status = "LIKELY DELAYED"; color = "#FBBF24"; borderColor = "rgba(251,191,36,0.30)"; }
  if (onTimeProb < 68) { status = "HIGH DELAY RISK"; color = "#FF3B69"; borderColor = "rgba(255,59,105,0.30)"; }
  const cause = riskScore > 0.52 ? RISK_CAUSES[Math.floor(riskScore * 5) % RISK_CAUSES.length] + " " + (d.hub || destination?.city || "terminal") : null;
  return { onTimeProb, delayMins, status, color, borderColor, cause };
}

export default function DelayForecastCard({ origin, destination }) {
  const delay = useMemo(() => computeDelay(origin, destination), [origin?.iata, destination?.iata]);
  const animatedScore = useCountUp(delay.onTimeProb, 1200);
  const arc = (delay.onTimeProb / 100) * 283;
  const StatusIcon = delay.onTimeProb >= 82 ? CheckCircle2 : delay.onTimeProb >= 68 ? Clock : AlertTriangle;

  return (
    React.createElement("div", {
      className: "rounded-2xl p-4 flex flex-col gap-3 h-full",
      style: { background: "rgba(8,12,22,0.80)", border: `1px solid ${delay.borderColor}`, boxShadow: `0 0 20px ${delay.borderColor}` }
    },
      React.createElement("div", { className: "flex items-center gap-2" },
        React.createElement(CloudLightning, { size: 13, style: { color: delay.color } }),
        React.createElement("span", { className: "mono text-[10px] font-bold tracking-widest text-slate-400" }, "DELAY FORECAST ENGINE")
      ),
      React.createElement("div", { className: "flex items-center gap-4" },
        React.createElement("div", { className: "relative flex-shrink-0", style: { width: 80, height: 80 } },
          React.createElement("svg", { width: "80", height: "80", viewBox: "0 0 100 100" },
            React.createElement("circle", { cx: "50", cy: "50", r: "45", fill: "none", stroke: "rgba(255,255,255,0.07)", strokeWidth: "8" }),
            React.createElement("circle", {
              cx: "50", cy: "50", r: "45", fill: "none",
              stroke: delay.color, strokeWidth: "8",
              strokeDasharray: `${arc} ${283 - arc}`,
              strokeLinecap: "round",
              strokeDashoffset: "70.75",
              style: { transition: "stroke-dasharray 0.8s ease", filter: `drop-shadow(0 0 4px ${delay.color})` }
            })
          ),
          React.createElement("div", { className: "absolute inset-0 flex flex-col items-center justify-center" },
            React.createElement("span", { className: "mono font-black text-lg leading-none", style: { color: delay.color } }, animatedScore + "%"),
            React.createElement("span", { className: "mono text-[7px] text-slate-500" }, "ON-TIME")
          )
        ),
        React.createElement("div", { className: "flex-1 min-w-0 flex flex-col gap-1.5" },
          React.createElement("div", { className: "flex items-center gap-1.5" },
            React.createElement(StatusIcon, { size: 12, style: { color: delay.color } }),
            React.createElement("span", { className: "mono text-[10px] font-black tracking-wider", style: { color: delay.color } }, delay.status)
          ),
          delay.delayMins > 0 && React.createElement("div", { className: "text-[11px]", style: { color: "#94A3B8" } },
            "Est. delay ",
            React.createElement("span", { style: { color: "#FBBF24" }, className: "font-bold" }, "+" + delay.delayMins + " min")
          ),
          delay.cause && React.createElement("div", { className: "text-[10px] leading-snug", style: { color: "#64748B" } }, "Warning: " + delay.cause)
        )
      ),
      React.createElement("div", {
        className: "flex items-center gap-2 pt-1",
        style: { borderTop: "1px solid rgba(255,255,255,0.06)" }
      },
        React.createElement(Wind, { size: 10, style: { color: "#64748B" } }),
        React.createElement("span", { className: "text-[9px] mono text-slate-500" },
          (origin?.iata || "---") + " to " + (destination?.iata || "---") + " HEURISTIC MODEL LIVE"
        )
      )
    )
  );
}