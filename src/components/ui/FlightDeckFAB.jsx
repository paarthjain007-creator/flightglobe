import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Eye, Wind, Box, Plus, X } from "lucide-react";
import { sound } from "../../utils/soundFx";

export default function FlightDeckFAB({ isCockpitView, showWindVectors, onToggleCockpit, onToggleJetstream, onOpenAR }) {
  const [open, setOpen] = useState(false);

  const actions = [
    {
      icon: Eye, label: isCockpitView ? "EXIT" : "COCKPIT",
      color: "#00F2FE", glow: "rgba(0,242,254,0.55)",
      bg: isCockpitView ? "rgba(0,242,254,0.22)" : "rgba(0,242,254,0.10)",
      border: isCockpitView ? "rgba(0,242,254,0.80)" : "rgba(0,242,254,0.35)",
      action: () => { sound.playClick(); onToggleCockpit(); },
    },
    {
      icon: Wind, label: showWindVectors ? "WINDS ON" : "JETSTRM",
      color: "#00FFA3", glow: "rgba(0,255,163,0.55)",
      bg: showWindVectors ? "rgba(0,255,163,0.22)" : "rgba(0,255,163,0.10)",
      border: showWindVectors ? "rgba(0,255,163,0.80)" : "rgba(0,255,163,0.35)",
      action: () => { sound.playClick(); onToggleJetstream(); },
    },
    {
      icon: Box, label: "SPATIAL",
      color: "#B800FF", glow: "rgba(184,0,255,0.55)",
      bg: "rgba(184,0,255,0.10)", border: "rgba(184,0,255,0.35)",
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
              className: "w-11 h-11 rounded-2xl flex items-center justify-center shadow-2xl",
              style: { background: a.bg, border: `1px solid ${a.border}`, boxShadow: `0 0 16px ${a.glow}, inset 0 1px 1px rgba(255,255,255,0.15)` },
            }, React.createElement(Icon, { size: 16, style: { color: a.color } })),
            React.createElement("span", {
              className: "mono text-[8px] font-bold tracking-widest",
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
        className: "w-full h-full rounded-2xl flex items-center justify-center cursor-pointer shadow-2xl z-50 relative",
        style: {
          background: open ? "rgba(0,242,254,0.20)" : "rgba(255,255,255,0.07)",
          border: open ? "1px solid rgba(0,242,254,0.65)" : "1px solid rgba(255,255,255,0.15)",
          boxShadow: open ? "0 0 24px rgba(0,242,254,0.40)" : "0 8px 32px rgba(0,0,0,0.4)",
        },
        title: "Flight Deck Controls",
      }, open ? React.createElement(X, { size: 18, style: { color: "#00F2FE" } }) : React.createElement(Plus, { size: 18, style: { color: "#94A3B8" } }))
    )
  );
}