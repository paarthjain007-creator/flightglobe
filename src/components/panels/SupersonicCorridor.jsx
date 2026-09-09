import React, { useState } from "react";
import { Zap, ChevronRight } from "lucide-react";

const SUPERSONIC_ROUTES = [
  { id: "ssr-1", label: "LHR to JFK", origin: "London Heathrow", dest: "New York JFK", duration: "3h 15m", mach: "2.04", altitude: "60,000 ft", aircraft: "Concorde", distance: "5,570 km", color: "#00F2FE", era: "1976-2003", note: "Regular transatlantic service — fastest commercial flight ever" },
  { id: "ssr-2", label: "CDG to JFK", origin: "Paris Charles de Gaulle", dest: "New York JFK", duration: "3h 32m", mach: "2.02", altitude: "58,000 ft", aircraft: "Concorde", distance: "5,830 km", color: "#B800FF", era: "1977-2003", note: "Air France Concorde service — inaugural 1977" },
  { id: "ssr-3", label: "LHR to IAD", origin: "London Heathrow", dest: "Washington Dulles", duration: "3h 40m", mach: "2.00", altitude: "58,500 ft", aircraft: "Concorde", distance: "5,898 km", color: "#FBBF24", era: "1984-2003", note: "Washington route — served US government officials" },
  { id: "ssr-4", label: "SYD to LAX", origin: "Sydney Kingsford", dest: "Los Angeles LAX", duration: "6h 20m", mach: "2.20", altitude: "62,000 ft", aircraft: "Boom Overture (2027+)", distance: "12,074 km", color: "#00FFA3", era: "Projected 2027", note: "Next-gen supersonic — Boom Overture production underway" },
];

export default function SupersonicCorridor() {
  const [selected, setSelected] = useState("ssr-1");
  const route = SUPERSONIC_ROUTES.find(r => r.id === selected);

  return (
    React.createElement("div", {
      className: "rounded-2xl p-4 flex flex-col gap-3 h-full",
      style: { background: "rgba(8,12,22,0.80)", border: "1px solid rgba(255,255,255,0.08)" }
    },
      React.createElement("div", { className: "flex items-center gap-2" },
        React.createElement(Zap, { size: 13, style: { color: "#FBBF24" } }),
        React.createElement("span", { className: "mono text-[10px] font-bold tracking-widest text-slate-400" }, "SUPERSONIC CORRIDOR"),
        React.createElement("span", {
          className: "mono text-[8px] px-1.5 py-0.5 rounded ml-auto",
          style: { background: "rgba(251,191,36,0.12)", border: "1px solid rgba(251,191,36,0.25)", color: "#FBBF24" }
        }, "MACH 2+")
      ),
      React.createElement("div", { className: "flex gap-1.5 flex-wrap" },
        SUPERSONIC_ROUTES.map(r => (
          React.createElement("button", {
            key: r.id, type: "button",
            onClick: () => setSelected(r.id),
            className: "mono text-[9px] font-bold px-2.5 py-1 rounded-lg cursor-pointer transition-all",
            style: {
              background: selected === r.id ? r.color + "22" : "rgba(255,255,255,0.04)",
              border: "1px solid " + (selected === r.id ? r.color : "rgba(255,255,255,0.08)"),
              color: selected === r.id ? r.color : "#64748B",
            }
          }, r.label)
        ))
      ),
      route && React.createElement("div", { className: "flex flex-col gap-2 flex-1" },
        React.createElement("div", {
          className: "relative h-14 rounded-xl overflow-hidden",
          style: { background: "rgba(0,0,0,0.4)", border: "1px solid rgba(255,255,255,0.06)" }
        },
          React.createElement("svg", { width: "100%", height: "100%", viewBox: "0 0 300 56", preserveAspectRatio: "none" },
            React.createElement("line", { x1: "20", y1: "50", x2: "280", y2: "50", stroke: "rgba(255,255,255,0.08)", strokeWidth: "1" }),
            React.createElement("path", {
              d: "M 20,48 Q 150,8 280,48",
              fill: "none", stroke: route.color, strokeWidth: "2", strokeDasharray: "6,4",
              style: { filter: "drop-shadow(0 0 3px " + route.color + ")" }
            }),
            React.createElement("text", { x: "148", y: "22", textAnchor: "middle", fontSize: "14", style: { userSelect: "none" } }, "✈"),
            React.createElement("text", { x: "20", y: "56", fill: "rgba(255,255,255,0.35)", fontSize: "8", fontFamily: "monospace" }, route.origin.split(" ")[0]),
            React.createElement("text", { x: "280", y: "56", fill: "rgba(255,255,255,0.35)", fontSize: "8", textAnchor: "end", fontFamily: "monospace" }, route.dest.split(" ")[0])
          )
        ),
        React.createElement("div", { className: "grid grid-cols-2 gap-2" },
          [
            { label: "DURATION", value: route.duration, color: route.color },
            { label: "MACH", value: route.mach, color: "#FBBF24" },
            { label: "ALTITUDE", value: route.altitude, color: "#00FFA3" },
            { label: "ERA", value: route.era, color: "#94A3B8" },
          ].map(stat => (
            React.createElement("div", {
              key: stat.label,
              className: "rounded-xl p-2",
              style: { background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.06)" }
            },
              React.createElement("div", { className: "mono text-[8px] tracking-widest text-slate-500" }, stat.label),
              React.createElement("div", { className: "mono font-bold text-[11px] mt-0.5", style: { color: stat.color } }, stat.value)
            )
          ))
        ),
        React.createElement("div", { className: "flex items-start gap-1.5" },
          React.createElement(ChevronRight, { size: 10, style: { color: "#64748B", marginTop: 2, flexShrink: 0 } }),
          React.createElement("p", { className: "text-[9px] leading-relaxed", style: { color: "#64748B" } }, route.note)
        )
      )
    )
  );
}