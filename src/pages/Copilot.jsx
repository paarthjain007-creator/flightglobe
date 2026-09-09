import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Sparkles, Send, ArrowRight, Bot, User, Globe2, CheckCircle2,
  Zap, Radio, Mic, Volume2, Plane
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { processCopilotPrompt, getPresetPrompts } from "../services/aiCopilotService";
import { sendAgentChatMessageAPI } from "../services/api/apiClient";
import { AIRPORTS, getAirportByIata } from "../data/airports";
import { useStore } from "../store/useStore";

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   QUICK-ACTION CHIPS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
const QUICK_CHIPS = [
  { emoji: "🇮🇳", label: "IndiGo & SpiceJet DEL to BOM" },
  { emoji: "🌸", label: "Japan Eco Tour" },
  { emoji: "🍷", label: "European Culinary Route" },
  { emoji: "🗽", label: "Transatlantic Loop" },
  { emoji: "💺", label: "Business Class to London" },
  { emoji: "🌿", label: "Low Carbon Routes to Tokyo" },
];

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   AI RESULT CARD
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
function AIResultCard({ result, msgId, onApply, onBook }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="mt-4 rounded-2xl overflow-hidden"
      style={{
        background: "rgba(0, 15, 30, 0.85)",
        border: "1px solid rgba(0,242,254,0.18)",
        boxShadow: "0 0 28px rgba(0,242,254,0.06)",
      }}
    >
      {/* Top accent bar */}
      <div className="h-0.5 w-full" style={{ background: "linear-gradient(90deg, #00F2FE, #7928CA, #00FFA3)" }} />

      <div className="p-4 space-y-3">
        {/* Title + hub count */}
        <div className="flex items-start justify-between gap-3">
          <div className="font-bold text-[15px] leading-snug" style={{ color: "#E8EAF0" }}>
            {result.title}
          </div>
          <span
            className="mono text-[9px] font-bold px-2 py-0.5 rounded flex-shrink-0"
            style={{ background: "rgba(0,255,163,0.12)", border: "1px solid rgba(0,255,163,0.25)", color: "#00FFA3" }}
          >
            {result.waypoints.length} HUBS
          </span>
        </div>

        {/* Summary */}
        <p className="text-[12px] leading-relaxed" style={{ color: "#7A85A0" }}>
          {result.summary}
        </p>

        {/* Waypoint chain */}
        <div className="flex items-center gap-1.5 flex-wrap py-1">
          {result.waypoints.map((wp, idx) => (
            <React.Fragment key={`${wp.iata}-${idx}`}>
              <span
                className="mono text-[11px] font-bold px-2.5 py-1 rounded-lg"
                style={{
                  background: `rgba(0,242,254,${0.06 + idx * 0.02})`,
                  border: "1px solid rgba(0,242,254,0.2)",
                  color: "#00F2FE",
                }}
              >
                {wp.iata}
                <span className="ml-1 font-normal" style={{ color: "#7A85A0", fontSize: "9px" }}>
                  {wp.city}
                </span>
              </span>
              {idx < result.waypoints.length - 1 && (
                <ArrowRight size={10} color="#404660" />
              )}
            </React.Fragment>
          ))}
        </div>

        {/* Insights */}
        <div className="space-y-1.5">
          {result.insights.map((ins, i) => (
            <div key={i} className="flex items-center gap-2 text-[11px]" style={{ color: "#7A85A0" }}>
              <CheckCircle2 size={11} color="#00FFA3" className="flex-shrink-0" />
              <span>{ins}</span>
            </div>
          ))}
        </div>

        {/* CTAs: Render 3D and Book in GDS Engine */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
          <button
            id={`apply-ai-route-${msgId}`}
            onClick={() => onApply(result.waypoints)}
            className="btn-aurora flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl font-bold text-[11px] cursor-pointer"
          >
            <Globe2 size={13} />
            <span>3D GLOBE ROUTE</span>
            <ArrowRight size={12} />
          </button>

          {onBook && (
            <button
              id={`book-ai-route-${msgId}`}
              onClick={() => onBook(result.waypoints)}
              className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl font-bold text-[11px] cursor-pointer bg-cyan-500/15 hover:bg-cyan-500/25 border border-cyan-400/40 text-cyan-300 hover:text-white transition-all shadow-md"
            >
              <Plane size={13} className="text-cyan-400" />
              <span>BOOK IN GDS ENGINE</span>
              <ArrowRight size={12} />
            </button>
          )}
        </div>
      </div>
    </motion.div>
  );
}

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   PRESET CARD
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
function PresetCard({ preset, onSend }) {
  return (
    <button
      type="button"
      onClick={() => {
        sound.playClick();
        onSend(preset.prompt);
      }}
      className="w-full text-left p-4 rounded-2xl cursor-pointer transition-all duration-200 group glass-card glass-interactive-cyan border border-white/8 hover:border-cyan-400/40"
      style={{
        background: "rgba(13,17,27,0.65)",
        backdropFilter: "blur(20px)",
      }}
    >
      <div className="mono text-[11px] font-bold mb-1.5 flex items-center justify-between" style={{ color: "#00F2FE" }}>
        <span>{preset.label}</span>
        <Sparkles size={11} className="opacity-0 group-hover:opacity-100 text-cyan-400 transition-opacity" />
      </div>
      <div className="text-[11px] leading-relaxed line-clamp-2 text-slate-400 group-hover:text-slate-200 transition-colors">
        {preset.prompt}
      </div>
    </button>
  );
}


/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   MAIN COPILOT PAGE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
export default function Copilot() {
  const navigate          = useNavigate();
  const setStoreWaypoints = useStore((s) => s.setWaypoints);
  const addTrip           = useStore((s) => s.addTrip);
  const removeTrip        = useStore((s) => s.removeTrip);
  const setCurrency       = useStore((s) => s.setCurrency);
  const setSearchOrigin   = useStore((s) => s.setSearchOrigin);
  const setSearchDestination = useStore((s) => s.setSearchDestination);

  const [input,    setInput]   = useState("");
  const [loading,  setLoading] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: "ai",
      text: "NIMBUS AI ONLINE. Ready to plan your next journey. Describe your travel goals — I will calculate the optimal multi-leg route and render it on the 3D globe.",
      result: null,
    },
  ]);

  const messagesEndRef = useRef(null);
  const inputRef       = useRef(null);
  const presets        = getPresetPrompts();

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  async function handleSend(promptText) {
    const text = promptText || input;
    if (!text.trim() || loading) return;

    setMessages((prev) => [...prev, { id: Date.now(), sender: "user", text }]);
    if (!promptText) setInput("");
    setLoading(true);

    try {
      // 1. Check if backend agent engine recognizes actionable commands
      const historyPayload = messages
        .filter((m) => m.text)
        .slice(-6)
        .map((m) => ({
          role: m.sender === "user" ? "user" : "assistant",
          content: m.text,
        }));

      const agentResult = await sendAgentChatMessageAPI(text, historyPayload);
      if (agentResult && agentResult.actions && agentResult.actions.length > 0) {
        for (const act of agentResult.actions) {
          if (act.type === "BOOKING_CREATED" && act.booking) {
            addTrip(act.booking);
          } else if (act.type === "BOOKING_CANCELLED" && act.bookingId) {
            removeTrip(act.bookingId);
          } else if (act.type === "SET_CURRENCY" && act.currency) {
            setCurrency(act.currency);
          } else if (act.type === "SWITCH_VIEW") {
            const v = (act.view || "").toLowerCase();
            if (v === "trips" || v === "passport") navigate("/passport");
            else if (v === "tracker" || v === "radar") navigate("/radar");
            else if (v === "search" || v === "booking") navigate("/booking");
            else if (v === "dashboard") navigate("/dashboard");
            else if (v === "explore" || v === "globe") navigate("/explore");
            else if (v === "copilot") navigate("/copilot");
          } else if (act.type === "SET_ROUTE") {
            const origAirport = getAirportByIata(act.origin);
            const destAirport = getAirportByIata(act.destination);
            setSearchOrigin(origAirport);
            setSearchDestination(destAirport);
            setStoreWaypoints([origAirport, destAirport]);
          }
        }

        setMessages((prev) => [
          ...prev,
          {
            id: Date.now() + 1,
            sender: "ai",
            text: agentResult.text,
            result: null,
          },
        ]);
        return;
      }

      // 2. Multi-leg / route-generation heuristic engine
      const aiResult = await processCopilotPrompt(text);
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now() + 1,
          sender: "ai",
          text: `Route computed: **${aiResult.title}**`,
          result: aiResult,
        },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now() + 1,
          sender: "ai",
          text: "SIGNAL LOST. Could not parse route. Try a preset below or rephrase your query.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  }

  function handleApplyRoute(waypoints) {
    if (!waypoints || waypoints.length < 2) return;
    setStoreWaypoints(waypoints);
    navigate("/explore");
  }

  function handleBookRoute(waypoints) {
    if (!waypoints || waypoints.length < 2) return;
    const origin = waypoints[0];
    const destination = waypoints[waypoints.length - 1];
    const origCode = origin.iata || origin.code;
    const destCode = destination.iata || destination.code;
    setSearchOrigin(origin);
    setSearchDestination(destination);
    setStoreWaypoints(waypoints);
    navigate(`/booking?from=${origCode}&to=${destCode}`);
  }

  function handleVoice() {
    const lastMsg = messages[messages.length - 1];
    if (!lastMsg || typeof window === "undefined" || !window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(lastMsg.text.replace(/[*_#`]/g, ""));
    utterance.rate = 1.05;
    window.speechSynthesis.speak(utterance);
  }

  return (
    <div
      id="copilot-page"
      className="px-4 sm:px-6 mx-auto pt-24 sm:pt-28 pb-12 max-w-[980px] animate-fade-in"
      style={{ minHeight: "100dvh" }}
    >
      {/* ── PAGE HEADER ─────────────────────────────────────────── */}
      <div
        className="flex items-center justify-between flex-wrap gap-4 pb-5 mb-6"
        style={{ borderBottom: "1px solid rgba(255,255,255,0.07)" }}
      >
        <div className="flex items-center gap-3">
          <div
            className="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0"
            style={{
              background: "linear-gradient(135deg, #7928CA, #00F2FE)",
              boxShadow: "0 0 28px rgba(121,40,202,0.45)",
            }}
          >
            <Sparkles size={22} color="#fff" />
          </div>
          <div>
            <div className="mono text-[9px] tracking-widest" style={{ color: "#64748B" }}>
              NIMBUS AI ENGINE // AGENT ACTIVE
            </div>
            <h1 className="text-2xl font-black text-aurora-glow">
              AI Travel Copilot
              <span
                className="mono ml-2 text-[9px] px-2 py-0.5 rounded font-bold align-middle"
                style={{ background: "rgba(184,0,255,0.18)", border: "1px solid rgba(184,0,255,0.45)", color: "#B800FF" }}
              >
                AI
              </span>
            </h1>
            <p className="text-[12px] mt-0.5" style={{ color: "#94A3B8" }}>
              Describe travel goals — auto-render multi-leg 3D flight paths on the globe.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Live indicator */}
          <div
            className="flex items-center gap-2 px-3 py-1.5 rounded-xl"
            style={{ background: "rgba(0,255,163,0.07)", border: "1px solid rgba(0,255,163,0.2)" }}
          >
            <Radio size={11} color="#00FFA3" />
            <span className="mono text-[10px] font-bold" style={{ color: "#00FFA3" }}>LIVE</span>
          </div>
          {/* Voice brief */}
          <button
            type="button"
            onClick={handleVoice}
            className="flex items-center gap-2 px-3 py-1.5 rounded-xl cursor-pointer transition-all btn-ghost"
            title="Read last message aloud"
          >
            <Volume2 size={13} />
            <span className="mono text-[10px] font-bold">VOICE</span>
          </button>
        </div>
      </div>

      {/* ── TWO-COLUMN LAYOUT: Chat (left) + Presets (right) ──────── */}
      <div className="flex flex-col lg:flex-row gap-5">

        {/* LEFT: Chat Interface */}
        <div className="flex-1 flex flex-col min-h-0">

          {/* Quick-action chips */}
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-3">
            {QUICK_CHIPS.map((c, i) => (
              <button
                key={i}
                type="button"
                onClick={() => handleSend(`${c.emoji} ${c.label}`)}
                className="chip flex-shrink-0"
              >
                {c.emoji} {c.label}
              </button>
            ))}
          </div>

          {/* Chat window */}
          <div
            className="flex-1 flex flex-col rounded-3xl overflow-hidden"
            style={{
              background: "rgba(13,17,27,0.75)",
              backdropFilter: "blur(28px) saturate(180%)",
              border: "1px solid rgba(255,255,255,0.07)",
              boxShadow: "inset 0 1px 1px rgba(255,255,255,0.10)",
              minHeight: "min(520px, calc(100vh - 280px))",
            }}
          >
            {/* Aurora top accent */}
            <div className="h-0.5 w-full flex-shrink-0"
              style={{ background: "linear-gradient(90deg, #7928CA, #00F2FE, #00FFA3)" }} />

            {/* Message list */}
            <div className="flex-1 overflow-y-auto p-5 space-y-4 no-scrollbar">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex gap-3 ${msg.sender === "user" ? "justify-end" : "justify-start"}`}
                >
                  {/* AI Avatar */}
                  {msg.sender === "ai" && (
                    <div
                      className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5"
                      style={{
                        background: "linear-gradient(135deg, #7928CA, #00F2FE)",
                        boxShadow: "0 0 14px rgba(121,40,202,0.35)",
                      }}
                    >
                      <Bot size={14} color="#fff" />
                    </div>
                  )}

                  {/* Bubble */}
                  <div
                    className="max-w-[82%] rounded-2xl p-3.5 text-[13px] leading-relaxed"
                    style={
                      msg.sender === "user"
                        ? {
                            background: "linear-gradient(135deg, rgba(0,242,254,0.15), rgba(121,40,202,0.12))",
                            border: "1px solid rgba(0,242,254,0.25)",
                            color: "#E8EAF0",
                            borderRadius: "18px 18px 4px 18px",
                          }
                        : {
                            background: "rgba(255,255,255,0.03)",
                            border: "1px solid rgba(255,255,255,0.07)",
                            color: "#E8EAF0",
                            borderRadius: "4px 18px 18px 18px",
                          }
                    }
                  >
                    {/* Monospace prefix for AI */}
                    {msg.sender === "ai" && (
                      <div className="mono text-[9px] mb-1.5 tracking-widest" style={{ color: "#404660" }}>
                        NIMBUS AI //
                      </div>
                    )}
                    <div>{msg.text}</div>
                    {msg.result && (
                      <AIResultCard
                        result={msg.result}
                        msgId={msg.id}
                        onApply={handleApplyRoute}
                        onBook={handleBookRoute}
                      />
                    )}
                  </div>

                  {/* User Avatar */}
                  {msg.sender === "user" && (
                    <div
                      className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5"
                      style={{
                        background: "rgba(0,242,254,0.10)",
                        border: "1px solid rgba(0,242,254,0.25)",
                        color: "#00F2FE",
                      }}
                    >
                      <User size={14} />
                    </div>
                  )}
                </div>
              ))}

              {/* Loading indicator */}
              {loading && (
                <div className="flex items-center gap-3">
                  <div
                    className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ background: "linear-gradient(135deg, #7928CA, #00F2FE)" }}
                  >
                    <Bot size={14} color="#fff" />
                  </div>
                  <div
                    className="px-4 py-2.5 rounded-2xl text-[12px] flex items-center gap-2"
                    style={{
                      background: "rgba(255,255,255,0.03)",
                      border: "1px solid rgba(255,255,255,0.07)",
                      color: "#7A85A0",
                      borderRadius: "4px 18px 18px 18px",
                    }}
                  >
                    <Zap size={12} color="#00F2FE" className="animate-spin" />
                    <span className="mono text-[10px]">PARSING GLOBAL TELEMETRY...</span>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Input bar */}
            <div
              className="flex-shrink-0 p-4 flex items-center gap-2"
              style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}
            >
              <input
                ref={inputRef}
                id="copilot-input"
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSend()}
                placeholder="Describe your journey... (e.g. Plan 10-day Japan eco tour)"
                className="flex-1 px-4 py-3 rounded-xl text-base sm:text-[13px] outline-none"
                style={{
                  background: "rgba(255,255,255,0.04)",
                  border: "1px solid rgba(255,255,255,0.08)",
                  color: "#E8EAF0",
                  caretColor: "#00F2FE",
                  fontFamily: "inherit",
                }}
                onFocus={(e) => (e.target.style.borderColor = "rgba(0,242,254,0.35)")}
                onBlur={(e) => (e.target.style.borderColor = "rgba(255,255,255,0.08)")}
              />
              <button
                id="copilot-send-btn"
                type="button"
                onClick={() => handleSend()}
                disabled={loading || !input.trim()}
                className="btn-aurora flex items-center gap-2 px-5 py-3 rounded-xl font-bold text-[12px] cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <Send size={14} />
                <span>SEND</span>
              </button>
            </div>
          </div>
        </div>

        {/* RIGHT: Preset Panel */}
        <div className="lg:w-72 flex-shrink-0 space-y-4">
          <div
            className="mono text-[10px] tracking-widest"
            style={{ color: "#64748B" }}
          >
            MISSION PRESETS
          </div>
          <div className="space-y-2.5">
            {presets.map((preset) => (
              <PresetCard key={preset.id} preset={preset} onSend={handleSend} />
            ))}
          </div>

          {/* System status card */}
          <div
            className="rounded-2xl p-4 space-y-2.5 mt-4"
            style={{
              background: "rgba(0,255,163,0.04)",
              border: "1px solid rgba(0,255,163,0.14)",
            }}
          >
            <div className="mono text-[9px] tracking-widest" style={{ color: "#00FFA3" }}>
              SYSTEM STATUS
            </div>
            {[
              { label: "AI Engine", value: "ONLINE", color: "#00FFA3" },
              { label: "GDS Feed", value: "LIVE", color: "#00FFA3" },
              { label: "Globe Renderer", value: "READY", color: "#00F2FE" },
              { label: "Speech Synth", value: "ACTIVE", color: "#FBBF24" },
            ].map(({ label, value, color }) => (
              <div key={label} className="flex items-center justify-between">
                <span className="text-[11px]" style={{ color: "#94A3B8" }}>{label}</span>
                <span className="mono text-[10px] font-bold" style={{ color }}>{value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
