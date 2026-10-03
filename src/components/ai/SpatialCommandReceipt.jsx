/**
 * SpatialCommandReceipt
 *
 * Visual "command receipt" card rendered inside Nimbus chat bubbles
 * whenever a spatial command is dispatched. Shows the structured
 * command name, its parameters, and flight context metadata.
 *
 * Design: glassmorphism + cyan glow + monospace params table.
 */

import React from "react";
import {
  Globe2, MapPin, Route, Layers, Radar, Cpu, Zap,
  MonitorSmartphone, Navigation, CheckCircle2, ArrowUpRight,
} from "lucide-react";
import { SPATIAL_COMMANDS } from "../../services/spatialCommandEngine";

// ─── Action → Icon + colour map ──────────────────────────────────────────────

const ACTION_META = {
  [SPATIAL_COMMANDS.INITIALIZE_GLOBE]:  { icon: Globe2,          label: "INITIALIZE_GLOBE",  colour: "#22d3ee" },
  [SPATIAL_COMMANDS.FOCUS_LOCATION]:    { icon: MapPin,          label: "FOCUS_LOCATION",    colour: "#a78bfa" },
  [SPATIAL_COMMANDS.DRAW_ROUTE]:        { icon: Route,           label: "DRAW_ROUTE",        colour: "#34d399" },
  [SPATIAL_COMMANDS.FILTER_HEATMAP]:    { icon: Layers,          label: "FILTER_HEATMAP",    colour: "#fb923c" },
  [SPATIAL_COMMANDS.SHOW_AIRCRAFT_AR]:  { icon: Radar,           label: "SHOW_AIRCRAFT_AR",  colour: "#f472b6" },
  [SPATIAL_COMMANDS.TRIGGER_AR_MODE]:   { icon: MonitorSmartphone,label: "TRIGGER_AR_MODE",  colour: "#c084fc" },
  [SPATIAL_COMMANDS.SHOW_RADAR]:        { icon: Radar,           label: "SHOW_RADAR",        colour: "#38bdf8" },
  [SPATIAL_COMMANDS.SHOW_DASHBOARD]:    { icon: Cpu,             label: "SHOW_DASHBOARD",    colour: "#4ade80" },
  [SPATIAL_COMMANDS.CHANGE_THEME]:      { icon: Zap,             label: "CHANGE_THEME",      colour: "#facc15" },
  [SPATIAL_COMMANDS.CHANGE_CURRENCY]:   { icon: Navigation,      label: "CHANGE_CURRENCY",   colour: "#fb7185" },
  [SPATIAL_COMMANDS.SEARCH_FLIGHTS]:    { icon: Route,           label: "SEARCH_FLIGHTS",    colour: "#34d399" },
};

const FALLBACK_META = { icon: Zap, label: "COMMAND", colour: "#22d3ee" };

// ─── Param formatter ─────────────────────────────────────────────────────────

function formatParams(params) {
  if (!params || Object.keys(params).length === 0) return [];

  return Object.entries(params)
    .filter(([k]) => !["resolvedAt"].includes(k))
    .map(([key, value]) => {
      let display = value;
      if (typeof value === "object" && value !== null) {
        display = value.iata
          ? `${value.iata} — ${value.city ?? value.name ?? ""}`
          : JSON.stringify(value);
      } else if (typeof value === "number") {
        display = String(Number(value).toFixed(value % 1 === 0 ? 0 : 4));
      }
      return { key, display: String(display) };
    });
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function SpatialCommandReceipt({ command, resultMessage, success = true }) {
  if (!command || !command.action) return null;

  const meta   = ACTION_META[command.action] ?? FALLBACK_META;
  const Icon   = meta.icon;
  const colour = meta.colour;
  const rows   = formatParams(command.params);
  const ctx    = command.flight_context ?? {};
  const conf   = command.confidence ?? "high";

  return (
    <div
      className="mt-3 rounded-2xl overflow-hidden"
      style={{
        background: "rgba(2, 6, 23, 0.85)",
        border: `1px solid ${colour}55`,
        boxShadow: `0 0 20px ${colour}22, inset 0 1px 0 ${colour}22`,
      }}
    >
      {/* Header bar */}
      <div
        className="px-3 py-2 flex items-center gap-2 border-b"
        style={{ borderColor: `${colour}33`, background: `${colour}12` }}
      >
        {/* Pulsing status dot */}
        <span
          className="w-1.5 h-1.5 rounded-full animate-ping"
          style={{ background: colour }}
        />
        <Icon size={12} style={{ color: colour }} />
        <span
          className="text-xs font-bold tracking-widest uppercase font-mono"
          style={{ color: colour }}
        >
          {meta.label}
        </span>

        {/* Confidence badge */}
        <span
          className="ml-auto text-xs px-1.5 py-0.5 rounded-md font-mono font-semibold"
          style={{
            background: conf === "high" ? "rgba(52,211,153,0.15)" : "rgba(251,146,60,0.15)",
            color: conf === "high" ? "#34d399" : "#fb923c",
          }}
        >
          {conf.toUpperCase()}
        </span>
      </div>

      {/* Params table */}
      {rows.length > 0 && (
        <div className="px-3 py-2 space-y-1">
          {rows.map(({ key, display }) => (
            <div key={key} className="flex items-start gap-2 text-xs font-mono">
              <span className="text-slate-400 w-24 flex-shrink-0">{key}</span>
              <span className="text-slate-200 break-all">{display}</span>
            </div>
          ))}
        </div>
      )}

      {/* Separator */}
      {rows.length > 0 && (
        <div className="mx-3 border-t border-white/5" />
      )}

      {/* Flight context + result */}
      <div className="px-3 py-2 space-y-1">
        {ctx.query && (
          <div className="text-xs font-mono text-slate-400 truncate">
            <span className="text-slate-600">query: </span>"{ctx.query}"
          </div>
        )}
        {ctx.resolvedAt && (
          <div className="text-xs font-mono text-slate-600">
            <span className="text-slate-600">at: </span>
            {new Date(ctx.resolvedAt).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", second: "2-digit" })}
          </div>
        )}

        {/* Execution result */}
        {resultMessage && (
          <div
            className="flex items-center gap-1.5 mt-1 text-xs"
            style={{ color: success ? "#4ade80" : "#f87171" }}
          >
            {success
              ? <CheckCircle2 size={10} />
              : <ArrowUpRight size={10} />
            }
            <span className="font-mono">{resultMessage}</span>
          </div>
        )}
      </div>
    </div>
  );
}
