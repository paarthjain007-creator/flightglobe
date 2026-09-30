import React from "react";
import { BookOpen, X, Trash2, MapPin, Plane } from "lucide-react";

// Stamp color palette - Apple subtle accent colors
const STAMP_PALETTES = [
  { border: "#2997ff", bg: "rgba(41,151,255,0.06)",  text: "#2997ff" },
  { border: "#30d158", bg: "rgba(48,209,88,0.06)",   text: "#30d158" },
  { border: "#ff9f0a", bg: "rgba(255,159,10,0.06)",  text: "#ff9f0a" },
  { border: "#bf5af2", bg: "rgba(191,90,242,0.06)",  text: "#bf5af2" },
  { border: "#64d2ff", bg: "rgba(100,210,255,0.06)", text: "#64d2ff" },
  { border: "#ff453a", bg: "rgba(255,69,58,0.06)",   text: "#ff453a" },
];

function PassportStamp({ stamp, onRemove, index }) {
  const palette = STAMP_PALETTES[index % STAMP_PALETTES.length];

  return (
    <div
      className="relative rounded-xl p-3 flex gap-3 items-start group transition-all hover:scale-[1.01]"
      style={{ background: palette.bg, border: `1px solid ${palette.border}33` }}
    >
      {/* Stamp mark */}
      <div
        className="flex-shrink-0 w-14 h-14 rounded-xl flex flex-col items-center justify-center"
        style={{
          border: `2px dashed ${palette.border}66`,
          background: `${palette.bg}`,
        }}
      >
        <div className="text-lg font-black leading-none" style={{ color: palette.text }}>
          {stamp.destination.iata}
        </div>
        <div className="text-xs mt-0.5 opacity-60" style={{ color: palette.text }}>
          VISITED
        </div>
      </div>

      {/* Details */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1 mb-0.5">
          <span className="text-xs font-bold" style={{ color: palette.text }}>
            {stamp.origin.iata}
          </span>
          <Plane size={9} className="text-[#86868b]" />
          <span className="text-xs font-bold" style={{ color: palette.text }}>
            {stamp.destination.iata}
          </span>
        </div>
        <div className="text-xs font-medium truncate text-[#f5f5f7]">
          {stamp.destination.city}, {stamp.destination.country}
        </div>
        <div className="text-xs mt-1 text-[#86868b]">
          {stamp.date}
        </div>
        {stamp.totalKm && (
          <div className="text-xs mt-0.5 text-[#86868b]">
            {stamp.totalKm.toLocaleString()} km
            {stamp.co2Kg && ` · ${stamp.co2Kg} kg CO₂`}
          </div>
        )}
      </div>

      {/* Remove button */}
      <button
        onClick={() => onRemove(stamp.id)}
        className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 p-1 rounded-lg transition-all cursor-pointer hover:scale-110"
        style={{ background: "rgba(255,69,58,0.15)", color: "#ff453a" }}
        title="Remove stamp"
      >
        <X size={10} />
      </button>
    </div>
  );
}

export default function PassportDrawer({ stamps, isOpen, onClose, onRemove, onClearAll }) {
  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40 transition-all duration-300"
        style={{
          background: "rgba(0,0,0,0.6)",
          backdropFilter: "blur(8px)",
          opacity: isOpen ? 1 : 0,
          pointerEvents: isOpen ? "auto" : "none",
        }}
        onClick={onClose}
      />

      {/* Drawer */}
      <div
        className="fixed right-0 top-0 h-full z-50 flex flex-col"
        style={{
          width: "320px",
          background: "#121214",
          borderLeft: "1px solid rgba(255, 255, 255, 0.10)",
          boxShadow: "-8px 0 40px rgba(0,0,0,0.6)",
          transform: isOpen ? "translateX(0)" : "translateX(100%)",
          transition: "transform 0.35s cubic-bezier(0.23, 1, 0.32, 1)",
        }}
      >
        {/* Header */}
        <div
          className="flex items-center gap-3 px-5 py-4 flex-shrink-0"
          style={{ borderBottom: "1px solid rgba(255, 255, 255, 0.08)" }}
        >
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center"
            style={{ background: "rgba(41, 151, 255, 0.12)", border: "1px solid rgba(41, 151, 255, 0.25)" }}
          >
            <BookOpen size={16} style={{ color: "#2997ff" }} />
          </div>
          <div>
            <div className="text-sm font-bold text-[#f5f5f7]">
              Digital Passport
            </div>
            <div className="text-xs text-[#86868b]">
              {stamps.length} stamp{stamps.length !== 1 ? "s" : ""} collected
            </div>
          </div>
          <div className="ml-auto flex items-center gap-2">
            {stamps.length > 0 && (
              <button
                onClick={onClearAll}
                className="p-1.5 rounded-lg cursor-pointer hover:opacity-80 transition-opacity"
                style={{ background: "rgba(248,113,113,0.1)", color: "#f87171" }}
                title="Clear all stamps"
              >
                <Trash2 size={12} />
              </button>
            )}
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg cursor-pointer hover:opacity-80 transition-opacity"
              style={{ background: "rgba(255,255,255,0.06)", color: "#94A3B8" }}
            >
              <X size={14} />
            </button>
          </div>
        </div>

        {/* Stamps list */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {stamps.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center gap-3 py-12">
              <div className="text-5xl">🌍</div>
              <div className="text-sm font-semibold" style={{ color: "#F8FAFC" }}>
                No stamps yet
              </div>
              <div className="text-xs leading-relaxed max-w-48 text-slate-400">
                Complete a route calculation to earn your first passport stamp
              </div>
            </div>
          ) : (
            stamps.map((stamp, i) => (
              <PassportStamp
                key={stamp.id}
                stamp={stamp}
                index={i}
                onRemove={onRemove}
              />
            ))
          )}
        </div>

        {/* Footer */}
        <div
          className="px-5 py-3 flex-shrink-0 text-center"
          style={{ borderTop: "1px solid rgba(255, 255, 255, 0.08)" }}
        >
          <div className="text-xs text-slate-400">
            <MapPin size={10} className="inline mr-1" />
            Stamps saved locally in your browser
          </div>
        </div>
      </div>
    </>
  );
}
