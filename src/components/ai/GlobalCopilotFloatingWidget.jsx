import React, { useState, useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Sparkles, Bot, X, Send, ArrowRight, Compass, ShieldCheck, Zap, RefreshCw, Terminal, Check } from "lucide-react";
import { useStore } from "../../store/useStore";
import { processCopilotPrompt } from "../../services/aiCopilotService";
import { sendAgentChatMessageAPI } from "../../services/api/apiClient";
import { AIRPORTS, getAirportByIata } from "../../data/airports";
import GlassCard from "../ui/GlassCard";

const CONTEXT_SUGGESTIONS = {
  "/explore": [
    { text: "🌡️ Filter globe for destinations above 25°C", action: "WARM_WEATHER" },
    { text: "⚡ Highlight lowest turbulence flight vectors", action: "TURBULENCE" },
    { text: "🌸 Load Pacific Rim Eco Tour (HND ✈️ SIN ✈️ SYD)", action: "PRESET_JAPAN" },
  ],
  "/booking": [
    { text: "📉 Tuesday flights are 14% cheaper. Update departure date?", action: "OPTIMIZE_TUESDAY" },
    { text: "🇮🇳 Compare IndiGo vs SpiceJet vs Air India fares", action: "COMPARE_CARRIERS" },
    { text: "💱 Switch rates display to INR (₹) or EUR (€)", action: "SWITCH_CURRENCY" },
  ],

  "/radar": [
    { text: "🛰️ Filter 10 live flights by Boeing 787 Dreamliners", action: "FILTER_AIRCRAFT" },
    { text: "🔀 Reshuffle 10 random global flight vectors", action: "RESHUFFLE" },
  ],
};

export default function GlobalCopilotFloatingWidget() {
  const location = useLocation();
  const navigate = useNavigate();
  const pathname = location.pathname;

  const theme = useStore((s) => s.theme);
  const searchOrigin = useStore((s) => s.searchOrigin);
  const searchDestination = useStore((s) => s.searchDestination);
  const setSearchOrigin = useStore((s) => s.setSearchOrigin);
  const setSearchDestination = useStore((s) => s.setSearchDestination);
  const setWaypoints = useStore((s) => s.setWaypoints);
  const setCurrency = useStore((s) => s.setCurrency);
  const setDepartureDate = useStore((s) => s.setDepartureDate);
  const addTrip = useStore((s) => s.addTrip);
  const removeTrip = useStore((s) => s.removeTrip);

  const [isOpen, setIsOpen] = useState(false);

  const [messages, setMessages] = useState([
    {
      id: "init",
      sender: "ai",
      text: `Greetings, Flight Commander. I am your omnipresent AI Copilot. Telemetry active for route ${searchOrigin?.city || "Origin"} ✈️ ${searchDestination?.city || "Destination"}. How may I assist your journey?`,
      timestamp: "Just now",
    },
  ]);
  const [input, setInput] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [decryptionText, setDecryptionText] = useState("DECRYPTING GDS TELEMETRY...");
  const messagesEndRef = useRef(null);

  const activeSuggestions = CONTEXT_SUGGESTIONS[pathname] || CONTEXT_SUGGESTIONS["/explore"];

  // Scroll to bottom of chat
  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isOpen]);

  // Terminal decryption text animation during AI processing
  useEffect(() => {
    let interval;
    if (isProcessing) {
      const phrases = [
        "PARSING AIRLINE GDS TELEMETRY...",
        "ANALYZING REAL-WORLD FLIGHT RATES...",
        "OPTIMIZING FLIGHT VECTOR TRAJECTORY...",
        "DECRYPTING AIRPORT TIMEZONES...",
      ];
      let i = 0;
      interval = setInterval(() => {
        i = (i + 1) % phrases.length;
        setDecryptionText(phrases[i]);
      }, 350);
    }
    return () => clearInterval(interval);
  }, [isProcessing]);

  async function handleSend(textToSend) {
    const query = textToSend || input;
    if (!query.trim()) return;

    const userMsg = {
      id: `user-${Date.now()}`,
      sender: "user",
      text: query,
      timestamp: new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" }),
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!textToSend) setInput("");
    setIsProcessing(true);

    try {
      // 1. Try autonomous backend Agent Engine API
      const historyPayload = messages
        .filter((m) => m.text)
        .slice(-6)
        .map((m) => ({
          role: m.sender === "user" ? "user" : "assistant",
          content: m.text,
        }));

      const agentResult = await sendAgentChatMessageAPI(query, historyPayload);

      const replyText = agentResult?.text || agentResult?.data?.text || agentResult?.data?.reply || agentResult?.reply;
      const actions = agentResult?.actions || agentResult?.data?.actions || agentResult?.data?.clientActions || agentResult?.clientActions;

      if (replyText) {
        // Dispatch autonomous agent actions
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
              if ((v === "trips" || v === "passport") && pathname !== "/passport") navigate("/passport");
              else if ((v === "tracker" || v === "radar") && pathname !== "/radar") navigate("/radar");
              else if ((v === "search" || v === "booking") && pathname !== "/booking") navigate("/booking");

              else if ((v === "explore" || v === "globe") && pathname !== "/explore") navigate("/explore");
              else if (v === "copilot" && pathname !== "/copilot") navigate("/copilot");
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

        const aiMsg = {
          id: `ai-${Date.now()}`,
          sender: "ai",
          title: "Nimbus Autonomous Agent",
          text: replyText,
          timestamp: new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" }),
        };

        setMessages((prev) => [...prev, aiMsg]);
        return;
      }

      // 2. Client-side fallback if backend unavailable
      const response = await processCopilotPrompt(query);
      const waypoints = response.waypoints || [];

      // Actionable tool execution
      if (waypoints.length >= 2) {
        setSearchOrigin(waypoints[0]);
        setSearchDestination(waypoints[waypoints.length - 1]);
        setWaypoints(waypoints);
      }

      const aiMsg = {
        id: `ai-${Date.now()}`,
        sender: "ai",
        title: response.title,
        text: response.summary,
        insights: response.insights || [],
        waypoints,
        timestamp: new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" }),
      };

      setMessages((prev) => [...prev, aiMsg]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          id: `ai-err-${Date.now()}`,
          sender: "ai",
          text: "Telemetry exception encountered while processing GDS route. Re-establishing connection...",
          timestamp: new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" }),
        },
      ]);
    } finally {
      setIsProcessing(false);
    }
  }

  function handleActionClick(actionItem) {
    if (actionItem.action === "OPTIMIZE_TUESDAY") {
      const nextTuesday = new Date();
      nextTuesday.setDate(nextTuesday.getDate() + ((2 + 7 - nextTuesday.getDay()) % 7 || 7));
      const dateStr = nextTuesday.toISOString().split("T")[0];
      setDepartureDate(dateStr);
      
      setMessages((prev) => [
        ...prev,
        {
          id: `action-${Date.now()}`,
          sender: "ai",
          text: `✅ Optimized departure date set to Tuesday (${dateStr}). Flight offers re-querying with 14% lower fares!`,
          timestamp: new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" }),
        },
      ]);
      if (pathname !== "/booking") navigate("/booking");
    } else if (actionItem.action === "SWITCH_CURRENCY") {
      setCurrency("INR");
      setMessages((prev) => [
        ...prev,
        {
          id: `action-${Date.now()}`,
          sender: "ai",
          text: "✅ Display currency updated to INR (₹). Real-world pricing recalculated across all carriers.",
          timestamp: new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" }),
        },
      ]);
    } else if (actionItem.action === "PRESET_JAPAN") {
      handleSend("🌸 Japan Cultural & Eco Tour");
      if (pathname !== "/explore") navigate("/explore");
    } else {
      handleSend(actionItem.text);
    }
  }

  if (pathname === "/copilot") return null;

  return (
    <div id="global-copilot-widget" className="fixed bottom-4 right-3 sm:bottom-6 sm:right-6 z-50 font-sans max-w-[calc(100vw-24px)]">
      {/* ── EXPANDED CHAT PANEL ────────────────────────────────────────────── */}
      {isOpen ? (
        <GlassCard className="w-[calc(100vw-24px)] sm:w-[420px] max-w-[420px] h-[min(520px,calc(100vh-100px))] flex flex-col border border-white/12 shadow-[0_20px_50px_rgba(0,0,0,0.7)] rounded-3xl overflow-hidden animate-slide-up relative">
          
          {/* Header Bar */}
          <div className="p-4 bg-[#121214] border-b border-white/10 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-blue-500/15 border border-blue-400/30 flex items-center justify-center text-[#2997ff]">
                <Sparkles size={16} className="animate-pulse" />
              </div>
              <div>
                <h3 className="text-xs font-bold text-white flex items-center gap-1.5">
                  <span>AI Flight Commander</span>
                  <span className="w-1.5 h-1.5 rounded-full bg-[#30d158] animate-ping" />
                </h3>
                <p className="text-[10px] text-[#86868b] font-mono">
                  Context: <strong className="text-[#2997ff]">{pathname}</strong>
                </p>
              </div>
            </div>

            <button
              onClick={() => setIsOpen(false)}
              className="p-1.5 rounded-xl glass text-[#86868b] hover:text-white transition-colors cursor-pointer"
            >
              <X size={15} />
            </button>
          </div>

          {/* Contextual Proactive Chips Bar */}
          <div className="px-3 py-2 bg-black/40 border-b border-white/10 space-y-1.5">
            <div className="text-[9px] font-bold text-[#86868b] uppercase tracking-wider flex items-center gap-1">
              <Compass size={11} className="text-[#2997ff]" />
              <span>Proactive Route Suggestions:</span>
            </div>
            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-0.5">
              {activeSuggestions.map((item, idx) => (
                <button
                  key={idx}
                  onClick={() => handleActionClick(item)}
                  className="px-2.5 py-1 rounded-xl text-[10px] font-semibold bg-white/5 border border-white/10 hover:border-[#2997ff] text-slate-200 hover:text-[#2997ff] transition-all whitespace-nowrap cursor-pointer flex-shrink-0 flex items-center gap-1"
                >
                  <span>{item.text}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Messages Scroll Area */}
          <div className="flex-1 p-4 overflow-y-auto space-y-3 font-sans text-xs">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex flex-col ${msg.sender === "user" ? "items-end" : "items-start"}`}
              >
                <div
                  className={`max-w-[85%] p-3 rounded-2xl space-y-1.5 ${
                    msg.sender === "user"
                      ? "bg-[#0071e3] text-white rounded-br-none shadow-md"
                      : "bg-[#1c1c1e] border border-white/10 text-slate-200 rounded-bl-none shadow-lg"
                  }`}
                >
                  {msg.title && (
                    <div className="text-xs font-bold text-[#2997ff] flex items-center gap-1.5">
                      <Zap size={12} />
                      <span>{msg.title}</span>
                    </div>
                  )}

                  <p className="leading-relaxed">{msg.text}</p>

                  {msg.insights && msg.insights.length > 0 && (
                    <div className="space-y-1 pt-1.5 border-t border-white/10 text-[10px] text-slate-300 font-mono">
                      {msg.insights.map((ins, i) => (
                        <div key={i} className="flex items-center gap-1">
                          <Check size={10} className="text-[#30d158]" />
                          <span>{ins}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  {msg.waypoints && msg.waypoints.length >= 2 && (
                    <div className="pt-2 flex items-center justify-between">
                      <span className="text-[10px] text-[#2997ff] font-mono">
                        Route: {msg.waypoints[0].iata} ✈️ {msg.waypoints[msg.waypoints.length - 1].iata}
                      </span>
                      <button
                        onClick={() => navigate("/search")}
                        className="px-2.5 py-1 rounded-xl text-[10px] font-bold bg-[#0071e3] text-white hover:bg-[#0077ed] flex items-center gap-1 cursor-pointer transition-colors"
                      >
                        <span>Book Now</span>
                        <ArrowRight size={10} />
                      </button>
                    </div>
                  )}
                </div>

                <span className="text-[9px] text-[#86868b] font-mono mt-1 px-1">{msg.timestamp}</span>
              </div>
            ))}

            {/* Terminal Decryption Processing Animation */}
            {isProcessing && (
              <div className="flex items-center gap-2 p-3 rounded-2xl bg-blue-500/10 border border-blue-400/30 text-blue-300 font-mono text-[10px] animate-pulse">
                <Terminal size={12} className="animate-spin" />
                <span>[{decryptionText}]</span>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Chat Input Bar */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="p-3 bg-[#121214] border-t border-white/10 flex items-center gap-2"
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask Copilot (e.g. Fly me to Munich)..."
              disabled={isProcessing}
              className="flex-1 px-3.5 py-2 rounded-xl bg-black/40 border border-white/10 text-white placeholder-[#86868b] focus:outline-none focus:border-[#2997ff] font-sans text-base sm:text-xs"
            />
            <button
              type="submit"
              disabled={isProcessing || !input.trim()}
              className="p-2 rounded-xl bg-[#0071e3] text-white hover:bg-[#0077ed] disabled:opacity-40 cursor-pointer shadow-md transition-all"
            >
              <Send size={14} />
            </button>
          </form>
        </GlassCard>
      ) : (
        /* ── COLLAPSED FLOATING ORB BUTTON ───────────────────────────────── */
        <button
          onClick={() => setIsOpen(true)}
          className="group relative flex items-center gap-2 sm:gap-2.5 px-3 py-2 sm:px-4 sm:py-3 rounded-full glass border border-white/12 shadow-[0_8px_30px_rgba(0,0,0,0.5)] hover:border-white/20 transition-all duration-300 cursor-pointer"
        >
          <div className="w-7 h-7 rounded-full bg-blue-500/15 border border-blue-400/30 flex items-center justify-center text-[#2997ff] shadow-inner group-hover:scale-105 transition-transform">
            <Sparkles size={15} className="animate-pulse" />
          </div>

          <div className="text-left font-sans">
            <div className="text-xs font-bold text-white flex items-center gap-1.5">
              <span>AI Copilot</span>
              <span className="w-1.5 h-1.5 rounded-full bg-[#30d158] animate-ping" />
            </div>
            <div className="text-[10px] text-[#86868b] font-mono">
              Live Assistant
            </div>
          </div>
        </button>
      )}
    </div>
  );
}

