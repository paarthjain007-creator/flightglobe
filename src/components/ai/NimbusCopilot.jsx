/**
 * NimbusCopilot ☁️
 *
 * Omnipresent floating AI assistant for FlightGlobe.
 * Wired to the Spatial Command Protocol: every user query is parsed
 * by spatialCommandEngine → dispatched via useSpatialCommandDispatcher
 * → rendered as a structured SpatialCommandReceipt card in the chat.
 *
 * Supports all 10 command types:
 *   INITIALIZE_GLOBE, FOCUS_LOCATION, DRAW_ROUTE, FILTER_HEATMAP,
 *   SHOW_AIRCRAFT_AR, TRIGGER_AR_MODE, SHOW_RADAR, SHOW_DASHBOARD,
 *   CHANGE_THEME, CHANGE_CURRENCY
 */

import React, { useState, useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  Cloud, X, Send, ArrowRight, Compass, Zap, Check,
  Globe2, Layers, MapPin, Radar, MonitorSmartphone, Route,
  Terminal, ChevronRight,
} from "lucide-react";
import { useStore } from "../../store/useStore";
import { parseIntent, SPATIAL_COMMANDS, getPresetPrompts } from "../../services/aiCopilotService";
import { humaniseCommand } from "../../services/spatialCommandEngine";
import { useSpatialCommandDispatcher } from "../../hooks/useSpatialCommandDispatcher";
import SpatialCommandReceipt from "./SpatialCommandReceipt";

// ─── Context-Aware Proactive Chips ────────────────────────────────────────────
// Each chip maps to a pre-built spatial command that fires immediately on click.

const CONTEXT_CHIPS = {
  "/explore": [
    {
      label: "🌤️ Weather overlay",
      cmd: { action: SPATIAL_COMMANDS.FILTER_HEATMAP, params: { layer: "weather_overlay" }, flight_context: { query: "Weather overlay", resolvedAt: "" }, confidence: "high" },
    },
    {
      label: "💲 Price heat-map",
      cmd: { action: SPATIAL_COMMANDS.FILTER_HEATMAP, params: { layer: "price_heat_map" }, flight_context: { query: "Price heat-map", resolvedAt: "" }, confidence: "high" },
    },
    {
      label: "✈️ Show live aircraft",
      cmd: { action: SPATIAL_COMMANDS.SHOW_AIRCRAFT_AR, params: { mode: "live_adsb" }, flight_context: { query: "Show live aircraft", resolvedAt: "" }, confidence: "high" },
    },
    {
      label: "🌍 Reset globe view",
      cmd: { action: SPATIAL_COMMANDS.INITIALIZE_GLOBE, params: { centerLat: 20, centerLng: 0, zoom: 2.5 }, flight_context: { query: "Reset globe", resolvedAt: "" }, confidence: "high" },
    },
  ],
  "/booking": [
    {
      label: "📉 Tuesday price drop",
      query: "Optimize departure date to Tuesday for cheapest fares",
    },
    {
      label: "💱 Switch to INR ₹",
      cmd: { action: SPATIAL_COMMANDS.CHANGE_CURRENCY, params: { currency: "INR" }, flight_context: { query: "Switch to INR", resolvedAt: "" }, confidence: "high" },
    },
    {
      label: "🌐 Day / Night cycle",
      cmd: { action: SPATIAL_COMMANDS.FILTER_HEATMAP, params: { layer: "day_night_cycle" }, flight_context: { query: "Day night cycle", resolvedAt: "" }, confidence: "high" },
    },
  ],
  "/dashboard": [
    {
      label: "🌧️ Check weather",
      cmd: { action: SPATIAL_COMMANDS.FILTER_HEATMAP, params: { layer: "weather_overlay" }, flight_context: { query: "Check weather", resolvedAt: "" }, confidence: "high" },
    },
    {
      label: "📊 Trip dashboard",
      cmd: { action: SPATIAL_COMMANDS.SHOW_DASHBOARD, params: {}, flight_context: { query: "Open dashboard", resolvedAt: "" }, confidence: "high" },
    },
  ],
  "/radar": [
    {
      label: "🛰️ Show aircraft AR",
      cmd: { action: SPATIAL_COMMANDS.SHOW_AIRCRAFT_AR, params: { mode: "live_adsb" }, flight_context: { query: "Show aircraft AR", resolvedAt: "" }, confidence: "high" },
    },
    {
      label: "🚀 Launch AR mode",
      cmd: { action: SPATIAL_COMMANDS.TRIGGER_AR_MODE, params: { mode: "webxr" }, flight_context: { query: "Launch AR", resolvedAt: "" }, confidence: "high" },
    },
  ],
};

// ─── Short AI response text generator ────────────────────────────────────────

function buildNimbusText(cmd, dispatchResult) {
  const { action, params } = cmd;
  if (!dispatchResult?.success) {
    return dispatchResult?.message ?? "I couldn't process that request. Try describing a city, route, or overlay.";
  }
  switch (action) {
    case SPATIAL_COMMANDS.DRAW_ROUTE:
      return `Route mapped ✈️  ${params.origin?.iata ?? "?"} → ${params.dest?.iata ?? "?"}. Rendering arc on globe now!`;
    case SPATIAL_COMMANDS.FOCUS_LOCATION:
      return `Camera locked onto ${params.city ?? params.iata ?? "your location"} ☁️`;
    case SPATIAL_COMMANDS.FILTER_HEATMAP:
      return `${params.layer?.replace(/_/g, " ")} overlay applied to the globe!`;
    case SPATIAL_COMMANDS.SHOW_AIRCRAFT_AR:
      return "Live aircraft AR pins activated! ✈️ Real-time ADS-B telemetry rendering.";
    case SPATIAL_COMMANDS.TRIGGER_AR_MODE:
      return "WebXR / AR session launched! Put on your headset or allow camera access. 🥽";
    case SPATIAL_COMMANDS.INITIALIZE_GLOBE:
      return "Globe reset to global view 🌍";
    case SPATIAL_COMMANDS.SHOW_RADAR:
      return "Opening Live Air Traffic Radar! Real-time ADS-B feed activating... 📡";
    case SPATIAL_COMMANDS.SHOW_DASHBOARD:
      return "Opening Trip Telemetry Dashboard! 📊";
    case SPATIAL_COMMANDS.CHANGE_THEME:
      return `Theme switched to ${params.theme} 🎨`;
    case SPATIAL_COMMANDS.CHANGE_CURRENCY:
      return `Currency updated to ${params.currency}! All fares recalculated 💱`;
    case SPATIAL_COMMANDS.SEARCH_FLIGHTS:
      return `Searching flights to ${params.dest?.city ?? "destination"}...`;
    default:
      return dispatchResult?.message ?? "Command executed!";
  }
}

// ─── Nimbus AI Action: handle UNKNOWN fallback ────────────────────────────────

function buildUnknownText(query) {
  const lower = query.toLowerCase();
  if (lower.includes("hi") || lower.includes("hello") || lower.includes("hey")) {
    return "Hey there! ☁️ I'm Nimbus, your flight intelligence AI. Ask me to draw a route, show a weather overlay, focus the globe on a city, or even launch AR mode!";
  }
  if (lower.includes("help") || lower.includes("what can you")) {
    return "I can: ✈️ **Draw routes** (\"Fly from Tokyo to London\"), 🗺️ **Focus globe** (\"Go to Singapore\"), 🌤️ **Apply overlays** (\"Show weather\"), 🛩️ **Show aircraft** (\"Show live planes\"), 🥽 **Launch AR** (\"Switch to AR mode\"), or 📡 **Open radar** (\"Show radar\").";
  }
  return "I couldn't map that to a specific flight or globe action. Try: \"Fly from Paris to NYC\", \"Focus on Dubai\", \"Show weather overlay\", or \"Switch to AR mode\".";
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function NimbusCopilot() {
  const location  = useLocation();
  const navigate  = useNavigate();
  const pathname  = location.pathname;

  const theme              = useStore((s) => s.theme);
  const searchOrigin       = useStore((s) => s.searchOrigin);
  const searchDestination  = useStore((s) => s.searchDestination);
  const setDepartureDate   = useStore((s) => s.setDepartureDate);

  const { dispatch } = useSpatialCommandDispatcher();

  const [isOpen,      setIsOpen]      = useState(false);
  const [input,       setInput]       = useState("");
  const [isThinking,  setIsThinking]  = useState(false);
  const [decryptText, setDecryptText] = useState("PARSING TELEMETRY...");

  const [messages, setMessages] = useState([
    {
      id: "nimbus-init",
      sender: "nimbus",
      text: `Hi! I'm Nimbus ☁️ — your AI spatial flight assistant. Say "Fly from Tokyo to London", "Show weather overlay", or "Focus on Dubai".`,
      timestamp: "Just now",
    },
  ]);

  const messagesEndRef = useRef(null);
  const inputRef       = useRef(null);

  const contextChips = CONTEXT_CHIPS[pathname] ?? CONTEXT_CHIPS["/explore"];

  // Scroll to bottom
  useEffect(() => {
    if (isOpen) messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isOpen]);

  // Decryption animation during thinking
  useEffect(() => {
    if (!isThinking) return;
    const phrases = [
      "PARSING AIRLINE GDS TELEMETRY...",
      "RESOLVING SPATIAL COORDINATES...",
      "OPTIMISING FLIGHT VECTOR...",
      "DECRYPTING ROUTE DATA...",
      "INITIALISING GLOBE COMMAND...",
    ];
    let i = 0;
    const iv = setInterval(() => {
      i = (i + 1) % phrases.length;
      setDecryptText(phrases[i]);
    }, 340);
    return () => clearInterval(iv);
  }, [isThinking]);

  // Auto-focus input when opened
  useEffect(() => {
    if (isOpen) setTimeout(() => inputRef.current?.focus(), 80);
  }, [isOpen]);

  // ── Core send handler ────────────────────────────────────────────────────

  async function handleSend(textOverride) {
    const query = textOverride ?? input;
    if (!query?.trim() || isThinking) return;

    const ts = new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });

    setMessages((prev) => [
      ...prev,
      { id: `user-${Date.now()}`, sender: "user", text: query, timestamp: ts },
    ]);
    if (!textOverride) setInput("");
    setIsThinking(true);

    // Small artificial latency for polish
    await new Promise((r) => setTimeout(r, 650));

    const cmd = parseIntent(query);

    // ── UNKNOWN: no spatial action detected ─────────────────────────────
    if (cmd.action === SPATIAL_COMMANDS.UNKNOWN) {
      setMessages((prev) => [
        ...prev,
        {
          id: `nimbus-${Date.now()}`,
          sender: "nimbus",
          text: buildUnknownText(query),
          timestamp: ts,
        },
      ]);
      setIsThinking(false);
      return;
    }

    // ── Stamp resolvedAt before dispatch ───────────────────────────────
    cmd.flight_context = { ...cmd.flight_context, resolvedAt: new Date().toISOString() };

    // ── Special: CHANGE_CURRENCY + Tuesday date optimise ───────────────
    if (cmd.action === SPATIAL_COMMANDS.CHANGE_CURRENCY && query.toLowerCase().includes("tuesday")) {
      const nextTuesday = new Date();
      nextTuesday.setDate(nextTuesday.getDate() + ((2 + 7 - nextTuesday.getDay()) % 7 || 7));
      setDepartureDate(nextTuesday.toISOString().split("T")[0]);
    }

    // ── Dispatch to hook ────────────────────────────────────────────────
    const result = await dispatch(cmd);

    setMessages((prev) => [
      ...prev,
      {
        id: `nimbus-${Date.now()}`,
        sender: "nimbus",
        text: buildNimbusText(cmd, result),
        timestamp: ts,
        spatialCommand: cmd,
        dispatchResult: result,
        // Legacy waypoints for "Book Flight" CTA (DRAW_ROUTE only)
        waypoints:
          cmd.action === SPATIAL_COMMANDS.DRAW_ROUTE && cmd.params.origin && cmd.params.dest
            ? [cmd.params.origin, cmd.params.dest]
            : undefined,
      },
    ]);

    setIsThinking(false);
  }

  // ── Chip click ──────────────────────────────────────────────────────────

  async function handleChipClick(chip) {
    if (chip.cmd) {
      // Pre-built command — stamp resolvedAt and dispatch directly
      const cmd = { ...chip.cmd, flight_context: { ...chip.cmd.flight_context, resolvedAt: new Date().toISOString() } };
      const ts  = new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });
      setIsThinking(true);
      await new Promise((r) => setTimeout(r, 400));
      const result = await dispatch(cmd);
      setMessages((prev) => [
        ...prev,
        { id: `user-${Date.now()}`, sender: "user", text: chip.label, timestamp: ts },
        {
          id: `nimbus-${Date.now()}`,
          sender: "nimbus",
          text: buildNimbusText(cmd, result),
          timestamp: ts,
          spatialCommand: cmd,
          dispatchResult: result,
        },
      ]);
      setIsThinking(false);
    } else if (chip.query) {
      handleSend(chip.query);
    }
  }

  // ── Render ──────────────────────────────────────────────────────────────

  return (
    <div id="nimbus-copilot" className={`fixed z-[100] font-sans select-none transition-all duration-300 ${
      isOpen ? "inset-0 flex items-center justify-center p-3 sm:p-4 bg-black/50 backdrop-blur-sm" : "bottom-4 right-4 sm:bottom-6 sm:right-6"
    }`}>

      {/* ── EXPANDED COMMAND PALETTE ──────────────────────────────────────── */}
      {isOpen ? (
        <div className="w-[95%] sm:w-[92%] max-w-[620px] h-[82vh] max-h-[570px] min-h-[380px] flex flex-col rounded-3xl overflow-hidden relative"
          style={{
            background: "rgba(3, 7, 18, 0.96)",
            border: "1px solid rgba(34, 211, 238, 0.25)",
            boxShadow: "0 0 60px rgba(34, 211, 238, 0.12), inset 0 1px 0 rgba(255,255,255,0.06)",
          }}
        >
          {/* Top input bar */}
          <div className="p-4 flex items-center gap-3 border-b border-white/10"
            style={{ background: "rgba(255,255,255,0.03)" }}
          >
            <div className={`w-10 h-10 rounded-2xl flex items-center justify-center text-cyan-300 border border-cyan-400/40 flex-shrink-0 ${isThinking ? "animate-spin" : "animate-pulse"}`}
              style={{ background: "rgba(34,211,238,0.12)" }}
            >
              <Cloud size={20} />
            </div>

            <form className="flex-1 flex items-center" onSubmit={(e) => { e.preventDefault(); handleSend(); }}>
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder='Ask Nimbus… e.g. "Fly from Dubai to Tokyo" or "Show weather"'
                disabled={isThinking}
                className="w-full bg-transparent border-none text-base text-white placeholder-slate-500 focus:outline-none"
              />
            </form>

            <button
              onClick={() => { if (input.trim()) handleSend(); else setIsOpen(false); }}
              className="p-2 rounded-xl border border-white/10 text-slate-400 hover:text-white transition-colors cursor-pointer flex-shrink-0"
              style={{ background: input.trim() ? "rgba(34,211,238,0.15)" : "transparent" }}
            >
              {input.trim() ? <Send size={16} className="text-cyan-300" /> : <X size={16} />}
            </button>
          </div>

          {/* Context chips */}
          <div className="px-3 py-2 border-b border-white/8" style={{ background: "rgba(0,0,0,0.3)" }}>
            <div className="text-[9px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-1 mb-1.5">
              <Compass size={9} className="text-cyan-500" />
              Spatial Quick Commands
            </div>
            <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5" style={{ scrollbarWidth: "none" }}>
              {contextChips.map((chip, idx) => (
                <button
                  key={idx}
                  onClick={() => handleChipClick(chip)}
                  disabled={isThinking}
                  className="px-2.5 py-1 rounded-xl text-[10px] font-semibold whitespace-nowrap cursor-pointer flex-shrink-0 flex items-center gap-1 transition-all disabled:opacity-40"
                  style={{
                    background: "rgba(255,255,255,0.05)",
                    border: "1px solid rgba(255,255,255,0.1)",
                    color: "#cbd5e1",
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.borderColor = "rgba(34,211,238,0.5)"; e.currentTarget.style.color = "#22d3ee"; }}
                  onMouseLeave={(e) => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)"; e.currentTarget.style.color = "#cbd5e1"; }}
                >
                  {chip.label}
                </button>
              ))}
            </div>
          </div>

          {/* Message scroll area */}
          <div className="flex-1 p-4 overflow-y-auto space-y-3 text-xs" style={{ scrollbarWidth: "thin", scrollbarColor: "rgba(34,211,238,0.2) transparent" }}>
            {messages.map((msg) => (
              <div key={msg.id} className={`flex flex-col ${msg.sender === "user" ? "items-end" : "items-start"}`}>
                <div
                  className={`max-w-[88%] p-3.5 rounded-2xl space-y-0.5 ${msg.sender === "user" ? "rounded-br-none" : "rounded-bl-none"}`}
                  style={msg.sender === "user"
                    ? { background: "rgba(34,211,238,0.18)", border: "1px solid rgba(34,211,238,0.35)", color: "#a5f3fc" }
                    : { background: "rgba(15,23,42,0.9)", border: "1px solid rgba(255,255,255,0.1)", color: "#e2e8f0", boxShadow: "0 4px 20px rgba(0,0,0,0.3)" }
                  }
                >
                  <p className="leading-relaxed text-[11px]">{msg.text}</p>

                  {/* ── Spatial Command Receipt ─────────────────────────── */}
                  {msg.spatialCommand && (
                    <SpatialCommandReceipt
                      command={msg.spatialCommand}
                      resultMessage={msg.dispatchResult?.message}
                      success={msg.dispatchResult?.success !== false}
                    />
                  )}

                  {/* ── Book Flight CTA (DRAW_ROUTE only) ──────────────── */}
                  {msg.waypoints && msg.waypoints.length >= 2 && (
                    <div className="mt-3 p-3 rounded-xl flex items-center justify-between"
                      style={{ background: "rgba(34,211,238,0.08)", border: "1px solid rgba(34,211,238,0.3)" }}
                    >
                      <div className="flex flex-col">
                        <span className="text-[9px] text-cyan-400 uppercase tracking-widest font-bold mb-0.5">Route Ready</span>
                        <div className="text-sm font-bold text-white flex items-center gap-1.5">
                          {msg.waypoints[0].iata}
                          <ArrowRight size={12} className="text-cyan-400" />
                          {msg.waypoints[msg.waypoints.length - 1].iata}
                        </div>
                      </div>
                      <button
                        onClick={() => navigate("/booking")}
                        className="px-3 py-2 rounded-xl text-[11px] font-bold flex items-center gap-1.5 cursor-pointer transition-all hover:scale-105 active:scale-95"
                        style={{ background: "#22d3ee", color: "#020617" }}
                      >
                        <span>Book Flight</span>
                        <ChevronRight size={12} />
                      </button>
                    </div>
                  )}
                </div>

                <span className="text-[9px] text-slate-600 font-mono mt-1 px-1">{msg.timestamp}</span>
              </div>
            ))}

            {/* Thinking animation */}
            {isThinking && (
              <div className="flex items-center gap-2 px-3 py-2.5 rounded-2xl text-[10px] font-mono animate-pulse"
                style={{ background: "rgba(34,211,238,0.08)", border: "1px solid rgba(34,211,238,0.2)", color: "#67e8f9" }}
              >
                <Terminal size={12} className="animate-spin text-cyan-400" />
                <span>[{decryptText}]</span>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Bottom close bar */}
          <div className="px-4 py-2 border-t border-white/8 flex items-center justify-between"
            style={{ background: "rgba(0,0,0,0.4)" }}
          >
            <span className="text-[9px] text-slate-600 font-mono">
              Nimbus ☁️ Spatial AI · {pathname}
            </span>
            <button
              onClick={() => setIsOpen(false)}
              className="text-[10px] text-slate-500 hover:text-slate-300 transition-colors cursor-pointer flex items-center gap-1"
            >
              <X size={10} /> Collapse
            </button>
          </div>
        </div>

      ) : (
        /* ── COLLAPSED FLOATING ORB ────────────────────────────────────────── */
        <button
          id="nimbus-fab"
          onClick={() => setIsOpen(true)}
          className="group relative flex items-center gap-2.5 px-4 py-3 rounded-full cursor-pointer transition-all duration-300"
          style={{
            background: "rgba(3, 7, 18, 0.9)",
            border: "1px solid rgba(34, 211, 238, 0.45)",
            boxShadow: "0 0 30px rgba(34, 211, 238, 0.35)",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.boxShadow = "0 0 50px rgba(34,211,238,0.6)")}
          onMouseLeave={(e) => (e.currentTarget.style.boxShadow = "0 0 30px rgba(34,211,238,0.35)")}
        >
          <div className="w-8 h-8 rounded-full flex items-center justify-center text-cyan-300 transition-transform group-hover:scale-110"
            style={{ background: "rgba(34,211,238,0.15)", border: "1px solid rgba(34,211,238,0.4)" }}
          >
            <Cloud size={18} className="animate-pulse" />
          </div>

          <div className="text-left">
            <div className="text-xs font-bold text-white flex items-center gap-1.5">
              Nimbus ☁️
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
            </div>
            <div className="text-[10px] font-mono" style={{ color: "#67e8f9" }}>
              Spatial AI Assistant
            </div>
          </div>
        </button>
      )}
    </div>
  );
}
