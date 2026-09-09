import React, { useState, useCallback } from "react";
import { motion } from "framer-motion";
import { Users, Copy, Check, Radio, X, Wifi } from "lucide-react";
import { useStore } from "../../store/useStore";
import { useMultiplayer } from "../../hooks/useMultiplayer";
import { sound } from "../../utils/soundFx";

function generateRoomCode() {
  return "ROOM-" + Array.from({ length: 6 }, () =>
    "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"[Math.floor(Math.random() * 32)]
  ).join("");
}

export default function DispatchRoom({ onClose }) {
  const multiplayerRoom   = useStore((s) => s.multiplayerRoom);
  const setMultiplayerRoom = useStore((s) => s.setMultiplayerRoom);
  const searchOrigin      = useStore((s) => s.searchOrigin);
  const searchDest        = useStore((s) => s.searchDestination);
  const [joinInput, setJoinInput] = useState("");
  const [copied, setCopied] = useState(false);
  const [tab, setTab] = useState("lobby");

  const room = multiplayerRoom || null;
  const { peers, sendReaction, notifyStateSync } = useMultiplayer(room || "lobby");

  const handleCreate = useCallback(() => {
    const code = generateRoomCode();
    setMultiplayerRoom(code);
    setTab("room");
    sound.playClick();
    notifyStateSync("Commander created room " + code);
  }, [setMultiplayerRoom, notifyStateSync]);

  const handleJoin = useCallback(() => {
    if (!joinInput.trim()) return;
    const code = joinInput.trim().toUpperCase();
    setMultiplayerRoom(code);
    setTab("room");
    sound.playClick();
    notifyStateSync("You joined " + code);
  }, [joinInput, setMultiplayerRoom, notifyStateSync]);

  const handleCopy = useCallback(() => {
    if (room) {
      navigator.clipboard.writeText(room).catch(() => {});
      setCopied(true);
      sound.haptic([10]);
      setTimeout(() => setCopied(false), 2000);
    }
  }, [room]);

  const handleLeave = useCallback(() => {
    setMultiplayerRoom(null);
    setTab("lobby");
    sound.playClick();
  }, [setMultiplayerRoom]);

  const REACTIONS = ["aircraft", "globe", "rocket", "wave", "target", "lightning"];
  const REACTION_EMOJIS = { aircraft: "plane", globe: "world", rocket: "rocket", wave: "wave", target: "target", lightning: "bolt" };

  return React.createElement("div", {
    className: "fixed inset-0 z-[120] flex items-center justify-center p-4",
    style: { background: "rgba(4,5,8,0.88)", backdropFilter: "blur(20px)" }
  },
    React.createElement(motion.div, {
      initial: { scale: 0.92, opacity: 0, y: 16 },
      animate: { scale: 1, opacity: 1, y: 0 },
      className: "relative w-full max-w-sm rounded-3xl overflow-hidden",
      style: { background: "rgba(10,14,24,0.96)", border: "1px solid rgba(0,242,254,0.20)", boxShadow: "0 0 60px rgba(0,242,254,0.12)" }
    },
      React.createElement("div", { className: "h-0.5 w-full", style: { background: "linear-gradient(90deg, #00F2FE, #7928CA, #00FFA3)" } }),
      React.createElement("div", { className: "flex items-center justify-between px-5 pt-5 pb-3" },
        React.createElement("div", { className: "flex items-center gap-2" },
          React.createElement(Users, { size: 14, style: { color: "#00F2FE" } }),
          React.createElement("span", { className: "mono text-xs font-bold tracking-widest", style: { color: "#E8EAF0" } }, "DISPATCH ROOM"),
          room && React.createElement("span", { className: "w-2 h-2 rounded-full", style: { background: "#00FFA3", boxShadow: "0 0 6px #00FFA3" } })
        ),
        React.createElement("button", { type: "button", onClick: onClose, className: "p-1.5 rounded-lg cursor-pointer hover:bg-white/10", style: { color: "#64748B" } },
          React.createElement(X, { size: 15 })
        )
      ),
      React.createElement("div", { className: "px-5 pb-5 space-y-4" },
        tab === "lobby"
          ? React.createElement(React.Fragment, null,
              React.createElement("p", { className: "text-[11px] leading-relaxed", style: { color: "#64748B" } }, "Share your globe with travel partners. Create a room or join with a code."),
              React.createElement("button", {
                type: "button", onClick: handleCreate,
                className: "w-full py-3 rounded-2xl mono font-bold text-xs tracking-wider cursor-pointer transition-all",
                style: { background: "rgba(0,242,254,0.12)", border: "1px solid rgba(0,242,254,0.35)", color: "#00F2FE" }
              }, "+ CREATE ROOM"),
              React.createElement("div", { className: "flex items-center gap-2" },
                React.createElement("input", {
                  value: joinInput,
                  onChange: e => setJoinInput(e.target.value),
                  placeholder: "ROOM-XXXXXX",
                  className: "flex-1 px-3 py-2 rounded-xl mono text-xs font-bold outline-none",
                  style: { background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.10)", color: "#E8EAF0" },
                  onKeyDown: e => e.key === "Enter" && handleJoin(),
                }),
                React.createElement("button", {
                  type: "button", onClick: handleJoin,
                  className: "px-3 py-2 rounded-xl mono text-xs font-bold cursor-pointer",
                  style: { background: "rgba(0,255,163,0.12)", border: "1px solid rgba(0,255,163,0.30)", color: "#00FFA3" }
                }, "JOIN")
              )
            )
          : React.createElement(React.Fragment, null,
              React.createElement("div", {
                className: "flex items-center justify-between px-3 py-2.5 rounded-xl",
                style: { background: "rgba(0,242,254,0.08)", border: "1px solid rgba(0,242,254,0.22)" }
              },
                React.createElement("span", { className: "mono font-black text-sm tracking-widest", style: { color: "#00F2FE" } }, room),
                React.createElement("button", { type: "button", onClick: handleCopy, className: "cursor-pointer" },
                  copied ? React.createElement(Check, { size: 14, style: { color: "#00FFA3" } }) : React.createElement(Copy, { size: 14, style: { color: "#64748B" } })
                )
              ),
              React.createElement("div", { className: "space-y-1.5" },
                React.createElement("div", { className: "mono text-[9px] tracking-widest text-slate-500" }, "ACTIVE PLANNERS"),
                React.createElement("div", {
                  className: "flex items-center gap-2.5 px-2.5 py-2 rounded-xl",
                  style: { background: "rgba(0,242,254,0.06)", border: "1px solid rgba(0,242,254,0.15)" }
                },
                  React.createElement("span", { className: "text-base" }, "pilot"),
                  React.createElement("div", { className: "flex-1" },
                    React.createElement("div", { className: "text-xs font-bold", style: { color: "#E8EAF0" } }, "You (Commander)"),
                    React.createElement("div", { className: "mono text-[9px]", style: { color: "#00F2FE" } },
                      (searchOrigin?.iata || "---") + " to " + (searchDest?.iata || "---")
                    )
                  ),
                  React.createElement(Radio, { size: 10, className: "animate-pulse", style: { color: "#00FFA3" } })
                ),
                ...peers.map(p => (
                  React.createElement("div", {
                    key: p.id,
                    className: "flex items-center gap-2.5 px-2.5 py-2 rounded-xl",
                    style: { background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)" }
                  },
                    React.createElement("span", { className: "text-sm" }, p.avatar),
                    React.createElement("div", { className: "flex-1" },
                      React.createElement("div", { className: "text-[11px] font-semibold", style: { color: "#E8EAF0" } }, p.name),
                      React.createElement("div", { className: "mono text-[9px]", style: { color: p.color } }, p.city)
                    ),
                    React.createElement(Wifi, { size: 9, style: { color: p.color, opacity: 0.7 } })
                  )
                ))
              ),
              React.createElement("button", {
                type: "button", onClick: handleLeave,
                className: "w-full py-2 rounded-xl mono text-[10px] font-bold cursor-pointer",
                style: { background: "rgba(255,59,105,0.08)", border: "1px solid rgba(255,59,105,0.20)", color: "#FF3B69" }
              }, "LEAVE ROOM")
            )
      )
    )
  );
}