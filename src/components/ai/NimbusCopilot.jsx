import React, { useState, useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Sparkles, X, Send, ArrowRight, Compass, Zap, Check, Cloud, RefreshCw, Sun, Moon, Radar, BarChart2, Globe } from "lucide-react";
import { useStore } from "../../store/useStore";
import { processCopilotPrompt } from "../../services/aiCopilotService";
import { AIRPORTS } from "../../data/airports";
import GlassCard from "../ui/GlassCard";

const ROUTE_CONTEXT_CHIPS = {
  "/explore": [
    { label: "✨ Find smoothest flight paths", intent: "SHOW_GLOBE", query: "Highlight smoothest flight routes" },
    { label: "🌐 Show real-time air traffic", intent: "SHOW_RADAR", query: "Show live air traffic radar" },
    { label: "🌸 Load Pacific Eco Tour", intent: "SEARCH_FLIGHTS", origin: "HND", dest: "SYD" },
  ],
  "/booking": [
    { label: "📉 Check Tuesday price drop", intent: "SEARCH_FLIGHTS", query: "Check Tuesday fare discount" },
    { label: "💱 Switch currency to INR (₹)", intent: "CHANGE_CURRENCY", currency: "INR" },
    { label: "🇦🇪 Compare Emirates & Air India", intent: "SEARCH_FLIGHTS", query: "Compare Emirates and Air India" },
  ],
  "/dashboard": [
    { label: "📊 Analyze trip metrics", intent: "SHOW_DASHBOARD", query: "Analyze active trip" },
    { label: "🌧️ Check destination weather", intent: "CHECK_WEATHER", query: "Check weather forecast" },
    { label: "🌱 Check carbon footprint", intent: "CHECK_CARBON", query: "Check carbon offset" },
  ],
  "/radar": [
    { label: "🛰️ Filter 10 live Boeing 787s", intent: "FILTER_AIRCRAFT", query: "Filter Boeing 787 Dreamliners" },
    { label: "🔀 Reshuffle live flights", intent: "RESHUFFLE", query: "Reshuffle flights" },
  ],
};

export default function NimbusCopilot() {
  const location = useLocation();
  const navigate = useNavigate();
  const pathname = location.pathname;

  // Global Zustand Dispatchers & State
  const theme = useStore((s) => s.theme);
  const searchOrigin = useStore((s) => s.searchOrigin);
  const searchDestination = useStore((s) => s.searchDestination);
  const setSearchOrigin = useStore((s) => s.setSearchOrigin);
  const setSearchDestination = useStore((s) => s.setSearchDestination);
  const setWaypoints = useStore((s) => s.setWaypoints);
  const setCurrency = useStore((s) => s.setCurrency);
  const setTheme = useStore((s) => s.setTheme);
  const setDepartureDate = useStore((s) => s.setDepartureDate);

  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: "nimbus-init",
      sender: "nimbus",
      text: "Hi! I'm Nimbus ☁️. Where are we flying today?",
      timestamp: "Just now",
    },
  ]);
  const [input, setInput] = useState("");
  const [isThinking, setIsThinking] = useState(false);
  const messagesEndRef = useRef(null);

  const contextChips = ROUTE_CONTEXT_CHIPS[pathname] || ROUTE_CONTEXT_CHIPS["/explore"];

  // Scroll chat to bottom
  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isOpen]);

  /**
   * Action Execution Engine (Tool Calling Dispatcher)
   * Maps specific AI intents (SEARCH_FLIGHTS, CHANGE_THEME, SHOW_RADAR, etc.) to frontend functions
   */
  async function executeAction(actionType, payload = {}) {
    setIsThinking(true);
    await new Promise((res) => setTimeout(res, 600));

    if (actionType === "SEARCH_FLIGHTS") {
      const origCode = payload.origin || "JFK";
      const destCode = payload.dest || "CDG";

      const origAp = AIRPORTS.find((a) => a.iata === origCode) || searchOrigin;
      const destAp = AIRPORTS.find((a) => a.iata === destCode) || searchDestination;

      setSearchOrigin(origAp);
      setSearchDestination(destAp);
      setWaypoints([origAp, destAp]);

      setMessages((prev) => [
        ...prev,
        {
          id: `nimbus-${Date.now()}`,
          sender: "nimbus",
          text: `Whoosh! ☁️ Navigating to the best fares for ${destAp.city} (${destAp.iata}) now!`,
          waypoints: [origAp, destAp],
          timestamp: new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" }),
        },
      ]);

      if (pathname !== "/booking") navigate("/booking");
    } else if (actionType === "CHANGE_THEME") {
      const nextTheme = payload.theme || (theme === "synthwave" ? "space" : "synthwave");
      setTheme(nextTheme);

      setMessages((prev) => [
        ...prev,
        {
          id: `nimbus-${Date.now()}`,
          sender: "nimbus",
          text: `Poof! ☁️ Switched visual theme to ${nextTheme}!`,
          timestamp: new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" }),
        },
      ]);
    } else if (actionType === "CHANGE_CURRENCY") {
      const curr = payload.currency || "INR";
      setCurrency(curr);

      setMessages((prev) => [
        ...prev,
        {
          id: `nimbus-${Date.now()}`,
          sender: "nimbus",
          text: `Poof! ☁️ Rates display currency updated to ${curr}!`,
          timestamp: new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" }),
        },
      ]);
      if (pathname !== "/booking") navigate("/booking");
    } else if (actionType === "SHOW_RADAR") {
      setMessages((prev) => [
        ...prev,
        {
          id: `nimbus-${Date.now()}`,
          sender: "nimbus",
          text: "Whoosh! ☁️ Opening Live Air Traffic Radar view!",
          timestamp: new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" }),
        },
      ]);
      if (pathname !== "/radar") navigate("/radar");
    } else if (actionType === "SHOW_DASHBOARD") {
      setMessages((prev) => [
        ...prev,
        {
          id: `nimbus-${Date.now()}`,
          sender: "nimbus",
          text: "Whoosh! ☁️ Opening Trip Telemetry Dashboard!",
          timestamp: new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" }),
        },
      ]);
      if (pathname !== "/dashboard") navigate("/dashboard");
    } else if (actionType === "SHOW_GLOBE") {
      setMessages((prev) => [
        ...prev,
        {
          id: `nimbus-${Date.now()}`,
          sender: "nimbus",
          text: "Whoosh! ☁️ Opening 3D Interactive Globe view!",
          timestamp: new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" }),
        },
      ]);
      if (pathname !== "/explore") navigate("/explore");
    }

    setIsThinking(false);
  }

  async function handleSend(queryText) {
    const query = queryText || input;
    if (!query.trim()) return;

    const userMsg = {
      id: `user-${Date.now()}`,
      sender: "user",
      text: query,
      timestamp: new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" }),
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!queryText) setInput("");
    setIsThinking(true);

    const lower = query.toLowerCase();

    // Intent NLP recognition for direct tool actions
    if (lower.includes("paris") || lower.includes("new york to paris") || lower.includes("cdg")) {
      await executeAction("SEARCH_FLIGHTS", { origin: "JFK", dest: "CDG" });
      return;
    }
    if (lower.includes("radar") || lower.includes("traffic")) {
      await executeAction("SHOW_RADAR");
      return;
    }
    if (lower.includes("dashboard") || lower.includes("metrics")) {
      await executeAction("SHOW_DASHBOARD");
      return;
    }
    if (lower.includes("globe") || lower.includes("explore")) {
      await executeAction("SHOW_GLOBE");
      return;
    }
    if (lower.includes("theme") || lower.includes("synthwave")) {
      await executeAction("CHANGE_THEME", { theme: "synthwave" });
      return;
    }

    // Default Copilot NLP engine processing
    try {
      const res = await processCopilotPrompt(query);
      const waypoints = res.waypoints || [];

      if (waypoints.length >= 2) {
        setSearchOrigin(waypoints[0]);
        setSearchDestination(waypoints[waypoints.length - 1]);
        setWaypoints(waypoints);
      }

      setMessages((prev) => [
        ...prev,
        {
          id: `nimbus-${Date.now()}`,
          sender: "nimbus",
          title: res.title,
          text: res.summary,
          insights: res.insights || [],
          waypoints,
          timestamp: new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" }),
        },
      ]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          id: `nimbus-err-${Date.now()}`,
          sender: "nimbus",
          text: "Oopsie! ☁️ Slight hiccup connecting to flight servers. Let's try again!",
          timestamp: new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" }),
        },
      ]);
    } finally {
      setIsThinking(false);
    }
  }

  function handleChipClick(chip) {
    if (chip.intent) {
      executeAction(chip.intent, chip);
    } else {
      handleSend(chip.label);
    }
  }

  return (
    <div
      id="nimbus-copilot"
      className="fixed bottom-6 right-6 z-50 font-sans select-none"
    >
      {/* ── EXPANDED CHAT WINDOW ─────────────────────────────────────────── */}
      {isOpen ? (
        <GlassCard className="w-[360px] sm:w-[410px] h-[530px] flex flex-col border border-cyan-400/40 shadow-[0_0_50px_rgba(0,240,255,0.3)] rounded-3xl overflow-hidden animate-slide-up relative backdrop-blur-xl bg-slate-900/90">
          
          {/* Top Nimbus Header */}
          <div className="p-4 bg-slate-950/80 border-b border-white/10 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className={`w-9 h-9 rounded-2xl bg-cyan-500/20 border border-cyan-400/50 flex items-center justify-center text-cyan-300 shadow-inner ${isThinking ? "animate-spin" : "animate-pulse"}`}>
                <Cloud size={20} />
              </div>
              <div>
                <h3 className="text-xs font-bold text-white flex items-center gap-1.5">
                  <span>Nimbus ☁️</span>
                  <span className="text-[10px] px-2 py-0.2 rounded-full bg-cyan-500/20 text-cyan-300 font-mono font-normal">
                    AI Assistant
                  </span>
                </h3>
                <p className="text-[10px] text-slate-400 font-mono">
                  Active Route: <strong className="text-cyan-300">{searchOrigin?.city || "JFK"}</strong> ✈️ <strong className="text-emerald-300">{searchDestination?.city || "LHR"}</strong>
                </p>
              </div>
            </div>

            <button
              onClick={() => setIsOpen(false)}
              className="p-1.5 rounded-xl glass text-slate-400 hover:text-white transition-colors cursor-pointer"
            >
              <X size={15} />
            </button>
          </div>

          {/* Context-Aware Proactive Chips */}
          <div className="px-3 py-2 bg-slate-900/60 border-b border-white/10 space-y-1.5">
            <div className="text-[9px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
              <Compass size={11} className="text-cyan-400" />
              <span>Proactive Context Suggestions ({pathname}):</span>
            </div>
            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-0.5">
              {contextChips.map((chip, idx) => (
                <button
                  key={idx}
                  onClick={() => handleChipClick(chip)}
                  className="px-2.5 py-1 rounded-xl text-[10px] font-semibold bg-white/5 border border-white/10 hover:border-cyan-400 text-slate-200 hover:text-cyan-300 transition-all whitespace-nowrap cursor-pointer flex-shrink-0 flex items-center gap-1"
                >
                  <span>{chip.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Messages Scroll Area */}
          <div className="flex-1 p-4 overflow-y-auto space-y-3 text-xs">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex flex-col ${msg.sender === "user" ? "items-end" : "items-start"}`}
              >
                <div
                  className={`max-w-[85%] p-3.5 rounded-2xl space-y-1.5 ${
                    msg.sender === "user"
                      ? "bg-cyan-500/25 border border-cyan-400/40 text-cyan-100 rounded-br-none"
                      : "bg-slate-900/90 border border-white/15 text-slate-200 rounded-bl-none shadow-lg"
                  }`}
                >
                  {msg.title && (
                    <div className="text-xs font-bold text-cyan-300 flex items-center gap-1.5">
                      <Zap size={12} />
                      <span>{msg.title}</span>
                    </div>
                  )}

                  <p className="leading-relaxed">{msg.text}</p>

                  {msg.insights && msg.insights.length > 0 && (
                    <div className="space-y-1 pt-1.5 border-t border-white/10 text-[10px] text-slate-300 font-mono">
                      {msg.insights.map((ins, i) => (
                        <div key={i} className="flex items-center gap-1">
                          <Check size={10} className="text-emerald-400" />
                          <span>{ins}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  {msg.waypoints && msg.waypoints.length >= 2 && (
                    <div className="pt-2 flex items-center justify-between">
                      <span className="text-[10px] text-cyan-300 font-mono">
                        Route: {msg.waypoints[0].iata} ✈️ {msg.waypoints[msg.waypoints.length - 1].iata}
                      </span>
                      <button
                        onClick={() => navigate("/booking")}
                        className="px-2.5 py-1 rounded-xl text-[10px] font-bold bg-cyan-400 text-slate-950 hover:bg-cyan-300 flex items-center gap-1 cursor-pointer"
                      >
                        <span>Book Flight</span>
                        <ArrowRight size={10} />
                      </button>
                    </div>
                  )}
                </div>

                <span className="text-[9px] text-slate-500 font-mono mt-1 px-1">{msg.timestamp}</span>
              </div>
            ))}

            {/* Nimbus Thinking Cloud Animation */}
            {isThinking && (
              <div className="flex items-center gap-2 p-3 rounded-2xl bg-cyan-500/10 border border-cyan-400/30 text-cyan-300 font-mono text-[10px] animate-pulse">
                <Cloud size={14} className="animate-spin text-cyan-400" />
                <span>Nimbus is thinking... ☁️</span>
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
            className="p-3 bg-slate-950/90 border-t border-white/10 flex items-center gap-2"
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask Nimbus (e.g. Flights to Paris)..."
              disabled={isThinking}
              className="flex-1 px-3.5 py-2 rounded-xl bg-slate-900 border border-white/15 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 font-sans"
            />
            <button
              type="submit"
              disabled={isThinking || !input.trim()}
              className="p-2 rounded-xl bg-cyan-400 text-slate-950 hover:bg-cyan-300 disabled:opacity-40 cursor-pointer shadow-lg transition-all"
            >
              <Send size={14} />
            </button>
          </form>
        </GlassCard>
      ) : (
        /* ── CUTE FLOATING NIMBUS ORB ─────────────────────────────────────── */
        <button
          onClick={() => setIsOpen(true)}
          className="group relative flex items-center gap-2.5 px-4 py-3 rounded-full glass border border-cyan-400/50 shadow-[0_0_30px_rgba(0,240,255,0.4)] hover:shadow-[0_0_45px_rgba(0,240,255,0.7)] transition-all duration-300 cursor-pointer animate-float"
        >
          <div className="w-8 h-8 rounded-full bg-cyan-500/30 border border-cyan-400 flex items-center justify-center text-cyan-300 shadow-inner group-hover:scale-110 transition-transform">
            <Cloud size={18} className="animate-pulse" />
          </div>

          <div className="text-left font-sans">
            <div className="text-xs font-bold text-white flex items-center gap-1.5">
              <span>Nimbus ☁️</span>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
            </div>
            <div className="text-[10px] text-cyan-300 font-mono">
              AI Travel Assistant
            </div>
          </div>
        </button>
      )}
    </div>
  );
}
