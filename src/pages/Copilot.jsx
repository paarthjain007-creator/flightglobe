import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Sparkles, Send, ArrowRight, Bot, User, Globe2, CheckCircle2, Zap } from "lucide-react";
import { processCopilotPrompt, getPresetPrompts } from "../services/aiCopilotService";
import { useStore } from "../store/useStore";
import GlassCard from "../components/ui/GlassCard";

export default function Copilot() {
  const navigate = useNavigate();
  const setStoreWaypoints = useStore((s) => s.setWaypoints);

  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: "ai",
      text: "Hello! I am your AI Travel Copilot. Ask me to plan a custom multi-leg journey (e.g. 'Plan a 10-day eco-friendly trip starting in Tokyo, visiting Singapore and Sydney').",
      result: null,
    },
  ]);

  const messagesEndRef = useRef(null);
  const presets = getPresetPrompts();

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  async function handleSend(promptText) {
    const textToProcess = promptText || input;
    if (!textToProcess.trim() || loading) return;

    const userMsg = { id: Date.now(), sender: "user", text: textToProcess };
    setMessages((prev) => [...prev, userMsg]);
    if (!promptText) setInput("");
    setLoading(true);

    try {
      const aiResult = await processCopilotPrompt(textToProcess);

      const aiMsg = {
        id: Date.now() + 1,
        sender: "ai",
        text: `Here is your generated itinerary: **${aiResult.title}**`,
        result: aiResult,
      };

      setMessages((prev) => [...prev, aiMsg]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now() + 1,
          sender: "ai",
          text: "I encountered an error parsing your prompt. Please try selecting one of the suggested routes below.",
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

  return (
    <div
      id="copilot-page"
      className="px-4 sm:px-6 py-6 mx-auto flex flex-col"
      style={{
        minHeight: "calc(100vh - 56px)",
        marginTop: "56px",
        maxWidth: "1000px",
        paddingBottom: "32px",
      }}
    >
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div
          className="w-10 h-10 rounded-2xl flex items-center justify-center"
          style={{ background: "var(--accent-glow)", border: "1px solid var(--glass-border)" }}
        >
          <Sparkles size={20} style={{ color: "var(--accent)" }} />
        </div>
        <div>
          <h1 className="text-xl font-bold flex items-center gap-2" style={{ color: "var(--text-primary)" }}>
            AI Travel Copilot
            <span className="text-xs px-2 py-0.5 rounded-full font-semibold" style={{ background: "var(--accent-glow)", color: "var(--accent)" }}>
              Generative NLP
            </span>
          </h1>
          <p className="text-xs" style={{ color: "var(--text-muted)" }}>
            Describe your dream travel goals & automatically render multi-leg 3D flight paths.
          </p>
        </div>
      </div>

      {/* Main Chat Box */}
      <GlassCard className="flex-1 p-4 sm:p-6 flex flex-col mb-4 min-h-[450px]">
        {/* Message History */}
        <div className="flex-1 space-y-4 overflow-y-auto pr-1 mb-4 max-h-[500px]">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex gap-3 ${msg.sender === "user" ? "justify-end" : "justify-start"}`}
            >
              {msg.sender === "ai" && (
                <div
                  className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ background: "var(--accent-glow)", color: "var(--accent)" }}
                >
                  <Bot size={16} />
                </div>
              )}

              <div
                className={`max-w-[85%] rounded-2xl p-4 text-sm ${
                  msg.sender === "user"
                    ? "rounded-tr-none"
                    : "rounded-tl-none glass"
                }`}
                style={
                  msg.sender === "user"
                    ? { background: "var(--accent)", color: "var(--bg-primary)", fontWeight: "600" }
                    : { border: "1px solid var(--glass-border)" }
                }
              >
                <div className="leading-relaxed">{msg.text}</div>

                {/* AI Generated Itinerary Result Card */}
                {msg.result && (
                  <div
                    className="mt-4 p-4 rounded-xl space-y-3 animate-slide-up"
                    style={{
                      background: "rgba(0, 0, 0, 0.25)",
                      border: "1px solid var(--glass-border)",
                    }}
                  >
                    <div className="flex items-center justify-between">
                      <div className="font-bold text-base" style={{ color: "var(--text-primary)" }}>
                        {msg.result.title}
                      </div>
                      <div className="text-xs px-2 py-0.5 rounded-md font-semibold" style={{ background: "rgba(74,222,128,0.15)", color: "#4ade80" }}>
                        {msg.result.waypoints.length} Hubs
                      </div>
                    </div>

                    <p className="text-xs" style={{ color: "var(--text-muted)" }}>
                      {msg.result.summary}
                    </p>

                    {/* Legs Chain */}
                    <div className="flex items-center gap-2 flex-wrap py-2">
                      {msg.result.waypoints.map((wp, idx) => (
                        <React.Fragment key={`${wp.iata}-${idx}`}>
                          <span
                            className="px-2.5 py-1 rounded-lg text-xs font-bold"
                            style={{ background: "var(--accent-glow)", color: "var(--accent)", border: "1px solid var(--glass-border)" }}
                          >
                            {wp.iata} ({wp.city})
                          </span>
                          {idx < msg.result.waypoints.length - 1 && (
                            <span className="text-xs" style={{ color: "var(--text-muted)" }}>→</span>
                          )}
                        </React.Fragment>
                      ))}
                    </div>

                    {/* Insights List */}
                    <div className="space-y-1 pt-1">
                      {msg.result.insights.map((ins, i) => (
                        <div key={i} className="flex items-center gap-1.5 text-xs" style={{ color: "var(--text-muted)" }}>
                          <CheckCircle2 size={12} style={{ color: "#4ade80" }} />
                          <span>{ins}</span>
                        </div>
                      ))}
                    </div>

                    {/* Action Button */}
                    <button
                      id={`apply-ai-route-${msg.id}`}
                      onClick={() => handleApplyRoute(msg.result.waypoints)}
                      className="w-full mt-2 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs cursor-pointer hover:scale-[1.02] active:scale-[0.98] transition-all"
                      style={{ background: "var(--accent)", color: "var(--bg-primary)" }}
                    >
                      <Globe2 size={14} />
                      Render 3D Route on Globe
                      <ArrowRight size={14} />
                    </button>
                  </div>
                )}
              </div>

              {msg.sender === "user" && (
                <div
                  className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ background: "rgba(255,255,255,0.1)", color: "var(--text-primary)" }}
                >
                  <User size={16} />
                </div>
              )}
            </div>
          ))}

          {loading && (
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: "var(--accent-glow)", color: "var(--accent)" }}>
                <Bot size={16} />
              </div>
              <div className="glass px-4 py-2.5 rounded-2xl text-xs flex items-center gap-2" style={{ color: "var(--text-muted)" }}>
                <Zap size={14} className="animate-spin" style={{ color: "var(--accent)" }} />
                AI is parsing global telemetry & calculating trajectory...
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Bar */}
        <div className="flex items-center gap-2">
          <input
            id="copilot-input"
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
            placeholder="Ask AI to plan a trip (e.g., 'Plan a 10-day trip starting in Tokyo')..."
            className="glass-input flex-1 px-4 py-3 rounded-xl text-sm"
            style={{ color: "var(--text-primary)" }}
          />
          <button
            id="copilot-send-btn"
            onClick={() => handleSend()}
            disabled={loading || !input.trim()}
            className="px-5 py-3 rounded-xl font-semibold text-xs flex items-center gap-1.5 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed hover:scale-105 active:scale-95 transition-all"
            style={{ background: "var(--accent)", color: "var(--bg-primary)" }}
          >
            <Send size={14} />
            <span>Send</span>
          </button>
        </div>
      </GlassCard>

      {/* Preset Suggestions */}
      <div className="space-y-2">
        <div className="text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>
          Suggested Prompt Templates
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {presets.map((preset) => (
            <button
              key={preset.id}
              onClick={() => handleSend(preset.prompt)}
              className="glass p-3 rounded-xl text-left hover:border-accent transition-all cursor-pointer group"
              style={{ border: "1px solid var(--glass-border)" }}
            >
              <div className="text-xs font-bold mb-1" style={{ color: "var(--text-primary)" }}>
                {preset.label}
              </div>
              <div className="text-xs line-clamp-2" style={{ color: "var(--text-muted)", fontSize: "11px" }}>
                {preset.prompt}
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
