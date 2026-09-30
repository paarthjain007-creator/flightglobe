import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Eye, Wind, Box, Plus, X } from "lucide-react";
import { sound } from "../../utils/soundFx";

export default function FlightDeckFAB({ isCockpitView, showWindVectors, onToggleCockpit, onToggleJetstream, onOpenAR }) {
  const [open, setOpen] = useState(false);

  const actions = [
    {
      icon: Eye, label: isCockpitView ? "EXIT" : "COCKPIT",
      color: "#2997ff", glow: "rgba(41,151,255,0.25)",
      bg: isCockpitView ? "rgba(41,151,255,0.18)" : "rgba(22,22,24,0.85)",
      border: isCockpitView ? "rgba(41,151,255,0.50)" : "rgba(255,255,255,0.12)",
      action: () => { sound.playClick(); onToggleCockpit(); },
    },
    {
      icon: Wind, label: showWindVectors ? "WINDS ON" : "JETSTRM",
      color: "#30d158", glow: "rgba(48,209,88,0.25)",
      bg: showWindVectors ? "rgba(48,209,88,0.18)" : "rgba(22,22,24,0.85)",
      border: showWindVectors ? "rgba(48,209,88,0.50)" : "rgba(255,255,255,0.12)",
      action: () => { sound.playClick(); onToggleJetstream(); },
    },
    {
      icon: Box, label: "SPATIAL",
      color: "#bf5af2", glow: "rgba(191,90,242,0.25)",
      bg: "rgba(22,22,24,0.85)", border: "rgba(255,255,255,0.12)",
      action: () => { sound.playClick(); onOpenAR(); setOpen(false); },
    },
  ];

  const positions = [{ x: 0, y: -72 }, { x: -68, y: -40 }, { x: -72, y: 22 }];

  return (
    React.createElement("div", { className: "relative", style: { width: 52, height: 52 } },
      React.createElement(AnimatePresence, null,
        open && actions.map((a, i) => {
          const Icon = a.icon;
          return React.createElement(motion.button, {
            key: a.label, type: "button",
            initial: { opacity: 0, x: 0, y: 0, scale: 0.4 },
            animate: { opacity: 1, x: positions[i].x, y: positions[i].y, scale: 1 },
            exit: { opacity: 0, x: 0, y: 0, scale: 0.4 },
            transition: { type: "spring", stiffness: 480, damping: 30, delay: i * 0.04 },
            onClick: a.action,
            className: "absolute flex flex-col items-center gap-1 cursor-pointer",
            style: { top: 0, right: 0, zIndex: 50 },
            title: a.label,
          },
            React.createElement("div", {
              className: "w-11 h-11 rounded-2xl flex items-center justify-center shadow-xl backdrop-blur-sm",
              style: { background: a.bg, border: `1px solid ${a.border}`, boxShadow: `0 4px 16px rgba(0,0,0,0.5), inset 0 1px 1px rgba(255,255,255,0.12)` },
            }, React.createElement(Icon, { size: 16, style: { color: a.color } })),
            React.createElement("span", {
              className: "mono text-[8px] font-semibold tracking-widest",
              style: { color: a.color },
            }, a.label)
          );
        })
      ),
      React.createElement(motion.button, {
        type: "button",
        onClick: () => { sound.playClick(); setOpen(p => !p); },
        animate: { rotate: open ? 45 : 0 },
        transition: { type: "spring", stiffness: 400, damping: 28 },
        className: "w-full h-full rounded-2xl flex items-center justify-center cursor-pointer shadow-2xl z-50 relative backdrop-blur-sm",
        style: {
          background: open ? "rgba(41,151,255,0.15)" : "rgba(22,22,24,0.90)",
          border: open ? "1px solid rgba(41,151,255,0.40)" : "1px solid rgba(255,255,255,0.12)",
          boxShadow: open ? "0 8px 30px rgba(41,151,255,0.25)" : "0 8px 32px rgba(0,0,0,0.5)",
        },
        title: "Flight Deck Controls",
      }, open ? React.createElement(X, { size: 18, style: { color: "#2997ff" } }) : React.createElement(Plus, { size: 18, style: { color: "#86868b" } }))
    )
  );
}