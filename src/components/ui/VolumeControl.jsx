import React, { useState } from "react";
import { Volume, Volume1, Volume2, VolumeX } from "lucide-react";
import { sound } from "../../utils/soundFx";
import { useStore } from "../../store/useStore";

const LEVELS = [
  { value: 0,    label: "MUTE", Icon: VolumeX },
  { value: 0.35, label: "LOW",  Icon: Volume  },
  { value: 0.65, label: "MED",  Icon: Volume1 },
  { value: 1.0,  label: "MAX",  Icon: Volume2 },
];

export default function VolumeControl() {
  const soundVolume    = useStore((s) => s.soundVolume ?? 1.0);
  const setSoundVolume = useStore((s) => s.setSoundVolume);
  const soundEnabled   = useStore((s) => s.soundEnabled ?? true);
  const setSoundEnabled = useStore((s) => s.setSoundEnabled);
  const [open, setOpen] = useState(false);

  const current = LEVELS.reduce((prev, cur) =>
    Math.abs(cur.value - soundVolume) < Math.abs(prev.value - soundVolume) ? cur : prev
  );
  const Icon = current.Icon;

  function handleSelect(lvl) {
    if (lvl.value === 0) {
      setSoundEnabled(false);
      sound.enabled = false;
    } else {
      setSoundEnabled(true);
      sound.enabled = true;
    }
    setSoundVolume(lvl.value);
    sound.setVolume(lvl.value);
    sound.haptic([8]);
    setOpen(false);
    if (lvl.value > 0) sound.playClick();
  }

  return (
    React.createElement("div", { className: "relative" },
      React.createElement("button", {
        type: "button",
        title: "Audio Volume",
        onClick: () => setOpen(p => !p),
        className: "p-1.5 rounded-lg transition-colors cursor-pointer",
        style: { background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", color: soundEnabled ? "#94A3B8" : "#475569" },
      }, React.createElement(Icon, { size: 14 })),
      open && React.createElement("div", {
        className: "absolute right-0 top-full mt-2 z-[200] rounded-xl shadow-2xl overflow-hidden",
        style: { background: "rgba(8,12,22,0.96)", border: "1px solid rgba(255,255,255,0.10)", backdropFilter: "blur(20px)", minWidth: "96px" },
      }, LEVELS.map((lvl) => {
        const LvlIcon = lvl.Icon;
        const isActive = Math.abs(lvl.value - soundVolume) < 0.05;
        return React.createElement("button", {
          key: lvl.label, type: "button",
          onClick: () => handleSelect(lvl),
          className: "w-full flex items-center gap-2 px-3 py-2 cursor-pointer transition-colors",
          style: { background: isActive ? "rgba(41,151,255,0.12)" : "transparent", color: isActive ? "#2997ff" : "#86868b" },
        },
          React.createElement(LvlIcon, { size: 12 }),
          React.createElement("span", { className: "mono text-[10px] font-bold" }, lvl.label),
          isActive && React.createElement("span", { className: "w-1.5 h-1.5 rounded-full ml-auto", style: { background: "#2997ff" } })
        );
      }))
    )
  );
}