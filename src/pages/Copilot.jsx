import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Bot, Send, User, Sparkles, ArrowRight, RotateCcw, Compass, Plane } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { processCopilotPrompt } from "../services/aiCopilotService";
import { sendAgentChatMessageAPI } from "../services/api/apiClient";
import { sound } from "../utils/soundFx";
import { useStore } from "../store/useStore";
import { getAirportByIata } from "../data/airports";

const QUICK_CHIPS = [
  { emoji: "✈️", label: "Find flights DEL to BOM today", prompt: "Find direct flights from DEL to BOM today with lowest fare" },
  { emoji: "🌍", label: "Cheapest route to Europe", prompt: "What is the cheapest route to fly to Europe from Delhi or Mumbai?" },
  { emoji: "🏝️", label: "Best beach destinations in November", prompt: "Recommend the best tropical beach destinations with warm weather in November" },
  { emoji: "🔄", label: "Round trip to Dubai under ₹20,000", prompt: "Can you find a round trip flight to Dubai (DXB) under ₹20,000?" },
];

/**
 * FormattedContent — Renders markdown bolding, code tags, and indented bullet lists
 * with Apple's typography hierarchy and zero visual clutter.
 */
function FormattedContent({ text }) {
  if (!text) return null;

  const lines = text.split("\n");

  return (
    <div className="space-y-1.5 text-[14px] sm:text-[15px] leading-relaxed">
      {lines.map((line, idx) => {
        const trimmed = line.trim();
        if (!trimmed) {
          return <div key={idx} className="h-1.5" />;
        }

        // Bullet item detection (-, *, •)
        const isBullet = /^[•\-*]\s+/.test(trimmed);
        const cleanLine = isBullet ? trimmed.replace(/^[•\-*]\s+/, "") : trimmed;

        // Render inline elements (bold, code)
        const renderInline = (str) => {
          const parts = str.split(/(\*\*.*?\*\*|`.*?`)/g);
          return parts.map((part, pIdx) => {
            if (part.startsWith("**") && part.endsWith("**")) {
              return (
                <strong key={pIdx} className="font-semibold text-white">
                  {part.slice(2, -2)}
                </strong>
              );
            }
            if (part.startsWith("`") && part.endsWith("`")) {
              return (
                <code key={pIdx} className="px-1.5 py-0.5 mx-0.5 rounded-md bg-white/10 font-mono text-[12px] text-[#2997ff]">
                  {part.slice(1, -1)}
                </code>
              );
            }
            return part;
          });
        };

        if (isBullet) {
          return (
            <div key={idx} className="flex items-start gap-2.5 ml-1 my-0.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[#2997ff] mt-2 shrink-0" />
              <div className="flex-1 text-slate-200">{renderInline(cleanLine)}</div>
            </div>
          );
        }

        return (
          <p key={idx} className="text-[#f5f5f7]">
            {renderInline(cleanLine)}
          </p>
        );
      })}
    </div>
  );
}

function Message({ msg, onSelectRoute }) {
  const isUser = msg.role === "user";
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, ease: "easeOut" }}
      className={`flex gap-3 items-start w-full ${isUser ? "flex-row-reverse" : "flex-row"}`}
    >
      {/* Avatar */}
      <div className={`w-8 h-8 rounded-full shrink-0 flex items-center justify-center text-sm ${
        isUser
          ? "bg-[#0071e3] text-white shadow-md"
          : "bg-white/[0.08] border border-white/12 text-[#2997ff]"
      }`}>
        {isUser ? <User className="w-4 h-4 text-white" /> : <Bot className="w-4 h-4 text-[#2997ff]" />}
      </div>

      {/* Bubble Container */}
      <div className={`max-w-[85%] sm:max-w-[78%] px-4 py-3 rounded-2xl shadow-sm ${
        isUser
          ? "bg-[#0071e3] text-white rounded-tr-sm shadow-md"
          : "bg-[#1c1c1e] border border-white/10 text-[#f5f5f7] rounded-tl-sm shadow-lg"
      }`}>
        {msg.loading ? (
          <div className="flex gap-1.5 items-center py-1.5 px-1">
            {[0, 1, 2].map(i => (
              <motion.div
                key={i}
                className="w-2 h-2 rounded-full bg-[#86868b]"
                animate={{ opacity: [0.3, 1, 0.3], y: [0, -3, 0] }}
                transition={{ repeat: Infinity, duration: 0.9, delay: i * 0.18 }}
              />
            ))}
          </div>
        ) : (
          <FormattedContent text={msg.content} />
        )}

        {/* Optional Action Stubs if route details were provided */}
        {msg.route && (
          <div className="mt-3 pt-2.5 border-t border-white/10 flex items-center justify-between gap-3">
            <span className="text-[11px] mono text-[#86868b] flex items-center gap-1.5">
              <Plane size={12} className="text-[#2997ff]" />
              <span>{msg.route.origin} ➔ {msg.route.dest}</span>
            </span>
            <button
              onClick={() => onSelectRoute?.(msg.route)}
              className="px-2.5 py-1 rounded-xl text-xs font-semibold bg-[#0071e3] hover:bg-[#0077ed] text-white flex items-center gap-1 cursor-pointer transition-colors"
            >
              <span>View Fares</span>
              <ArrowRight size={11} />
            </button>
          </div>
        )}
      </div>
    </motion.div>
  );
}

export default function Copilot() {
  const navigate = useNavigate();
  const addTrip = useStore(s => s.addTrip);
  const removeTrip = useStore(s => s.removeTrip);
  const setCurrency = useStore(s => s.setCurrency);
  const setSearchOrigin = useStore(s => s.setSearchOrigin);
  const setSearchDestination = useStore(s => s.setSearchDestination);
  const setWaypoints = useStore(s => s.setWaypoints);

  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content: "Hi! I'm your AI Flight Copilot ✈️\n\nAsk me anything about flight routes, carrier price comparisons, seasonal travel ideas, or say where you'd like to travel.",
    }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);
  const textareaRef = useRef(null);

  // Auto-scroll to bottom of chat
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const handleReset = () => {
    sound.playClick();
    setMessages([
      {
        role: "assistant",
        content: "Hi! I'm your AI Flight Copilot ✈️\n\nAsk me anything about flight routes, carrier price comparisons, seasonal travel ideas, or say where you'd like to travel.",
      }
    ]);
    setInput("");
    setTimeout(() => textareaRef.current?.focus(), 50);
  };

  const send = async (text) => {
    const userMsg = text || input.trim();
    if (!userMsg || loading) return;
    setInput("");
    sound.playClick();

    // Reset textarea height
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }

    setMessages(prev => [...prev, { role: "user", content: userMsg }]);
    setMessages(prev => [...prev, { role: "assistant", content: "", loading: true }]);
    setLoading(true);

    try {
      const history = messages.map(m => ({ role: m.role, content: m.content }));
      const result = await sendAgentChatMessageAPI(userMsg, history).catch(() => null);

      let reply = result?.text
        || result?.data?.text
        || result?.data?.reply
        || result?.reply;

      const actions = result?.actions || result?.data?.actions || result?.data?.clientActions || result?.clientActions;

      if (!reply) {
        // High-fidelity client-side AI fallback for instant response
        const localAi = await processCopilotPrompt(userMsg).catch(() => null);
        if (localAi?.summary) {
          const insightsText = (localAi.insights || []).map(ins => `• ${ins}`).join("\n");
          reply = `✧ **${localAi.title || "Travel Recommendation"}**\n\n${localAi.summary}\n\n${insightsText}`;
        } else {
          reply = `I've analyzed your flight query for "${userMsg}". You can inspect direct airline fares in our Flights section or track live transponders on the 3D Globe.`;
        }
      }

      // Execute Client Actions
      if (Array.isArray(actions)) {
        for (const act of actions) {
          if (act.type === "BOOKING_CREATED" && act.booking) {
            addTrip(act.booking);
          } else if (act.type === "BOOKING_CANCELLED" && act.bookingId) {
            removeTrip(act.bookingId);
          } else if (act.type === "SET_CURRENCY" && act.currency) {
            setCurrency(act.currency);
          } else if (act.type === "SWITCH_VIEW") {
            const v = (act.view || "").toLowerCase();
            if ((v === "trips" || v === "passport")) navigate("/passport");
            else if ((v === "tracker" || v === "radar")) navigate("/radar");
            else if ((v === "search" || v === "booking")) navigate("/booking");
            else if ((v === "explore" || v === "globe")) navigate("/explore");
          } else if (act.type === "SET_ROUTE") {
            const origAirport = getAirportByIata(act.origin);
            const destAirport = getAirportByIata(act.destination);
            if (origAirport && destAirport) {
              setSearchOrigin(origAirport);
              setSearchDestination(destAirport);
              setWaypoints([origAirport, destAirport]);
            }
          }
        }
      }

      setMessages(prev => [
        ...prev.slice(0, -1),
        { role: "assistant", content: reply }
      ]);
    } catch {
      setMessages(prev => [
        ...prev.slice(0, -1),
        {
          role: "assistant",
          content: "I have registered your route request. You can browse live departures and booking options in our Flights portal."
        }
      ]);
    } finally {
      setLoading(false);
      setTimeout(() => textareaRef.current?.focus(), 50);
    }
  };

  const handleKey = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  };

  const handleInputResize = (e) => {
    setInput(e.target.value);
    const target = e.target;
    target.style.height = "auto";
    target.style.height = `${Math.min(target.scrollHeight, 120)}px`;
  };

  return (
    <div className="h-screen w-full bg-[#000000] pt-14 flex flex-col overflow-hidden">
      {/* ── Pinned Top Header Bar ────────────────────────────────────────── */}
      <header className="border-b border-white/10 px-4 sm:px-8 py-3.5 bg-[#121214]/85 backdrop-blur-sm shrink-0 z-10">
        <div className="max-w-3xl mx-auto w-full flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-blue-500/15 border border-blue-400/30 flex items-center justify-center shrink-0">
              <Bot className="w-5 h-5 text-[#2997ff]" />
            </div>
            <div>
              <h1 className="text-[16px] sm:text-[17px] font-semibold text-white flex items-center gap-2">
                <span>AI Flight Copilot</span>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#30d158]/10 border border-[#30d158]/20 text-[#30d158] text-[10px] font-medium">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#30d158] animate-pulse" /> Live
                </span>
              </h1>
              <p className="text-[12px] text-[#86868b] hidden sm:block">
                Powered by FlightGlobe Agent · Real-Time GDS Telemetry
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleReset}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium text-[#86868b] hover:text-white bg-white/5 border border-white/10 hover:border-white/20 transition-all cursor-pointer"
              title="Reset conversation"
            >
              <RotateCcw size={12} />
              <span className="hidden sm:inline">New Chat</span>
            </button>
            <Link
              to="/explore"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium text-[#2997ff] bg-blue-500/10 border border-blue-400/20 hover:bg-blue-500/20 transition-all cursor-pointer"
            >
              <Compass size={12} />
              <span className="hidden sm:inline">3D Globe</span>
            </Link>
          </div>
        </div>
      </header>

      {/* ── Main Scrollable Messages Stream ─────────────────────────────── */}
      <main className="flex-1 overflow-y-auto px-4 sm:px-6 py-6 scroll-smooth overscroll-contain touch-pan-y flex flex-col">
        <div className={`max-w-3xl mx-auto w-full flex flex-col gap-5 flex-1 ${messages.length <= 1 ? 'justify-center pb-20' : ''}`}>
          {messages.map((msg, i) => (
            <Message
              key={i}
              msg={msg}
              onSelectRoute={(route) => navigate(`/booking?from=${route.origin}&to=${route.dest}`)}
            />
          ))}

          {/* Quick Suggestions */}
          {messages.length <= 1 && (
            <div className="mt-2 pt-2 animate-fade-in">
              <p className="text-[11px] font-bold text-[#86868b] uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
                <Sparkles size={11} className="text-[#2997ff]" />
                <span>Quick flight suggestions:</span>
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {QUICK_CHIPS.map(({ emoji, label, prompt }) => (
                  <button
                    key={label}
                    onClick={() => send(prompt || label)}
                    className="p-3.5 rounded-2xl bg-[#161618] border border-white/10 hover:border-[#2997ff]/40 hover:bg-[#1c1c1e] text-left flex items-center gap-3 transition-all cursor-pointer group shadow-sm"
                  >
                    <span className="text-xl shrink-0">{emoji}</span>
                    <span className="text-[13px] text-[#86868b] group-hover:text-white transition-colors flex-1 line-clamp-1">
                      {label}
                    </span>
                    <ArrowRight className="w-3.5 h-3.5 text-[#6e6e73] group-hover:text-[#2997ff] shrink-0 transition-colors" />
                  </button>
                ))}
              </div>
            </div>
          )}

          <div ref={bottomRef} className="h-2 shrink-0" />
        </div>
      </main>

      {/* ── Pinned Bottom Input Dock ────────────────────────────────────── */}
      <footer className="border-t border-white/10 px-4 sm:px-8 py-3.5 bg-[#121214]/90 backdrop-blur-sm shrink-0 z-10">
        <div className="max-w-3xl mx-auto w-full flex flex-col gap-2">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              send();
            }}
            className="flex items-center gap-2.5 rounded-2xl bg-[#2a2a2c] border border-white/30 focus-within:border-[#2997ff] focus-within:bg-[#323235] p-1.5 pl-4 transition-all shadow-inner"
          >
            <textarea
              ref={textareaRef}
              value={input}
              onChange={handleInputResize}
              onKeyDown={handleKey}
              placeholder="Ask about flights, destinations, prices..."
              rows={1}
              className="flex-1 bg-transparent text-[#f5f5f7] placeholder-[#86868b] focus:outline-none resize-none text-[14px] leading-relaxed max-h-32 overflow-y-auto py-1"
            />
            <button
              type="submit"
              disabled={!input.trim() || loading}
              className="w-10 h-10 rounded-xl bg-[#0071e3] hover:bg-[#0077ed] disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center text-white transition-all cursor-pointer shrink-0 shadow-md"
              title="Send message"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <Send className="w-4 h-4 text-white" />
              )}
            </button>
          </form>
          <p className="text-[11px] text-[#6e6e73] text-center">
            Press Enter to send · Shift+Enter for new line
          </p>
        </div>
      </footer>
    </div>
  );
}

