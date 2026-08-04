import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Globe2, Trash2, Plane, MapPin } from "lucide-react";
import { useStore } from "../store/useStore";
import { readStampsFromLocalStorage } from "../hooks/usePassportStamps";

const PALETTES = [
  { border: "#60a5fa", text: "#60a5fa", bg: "rgba(96,165,250,0.08)"  },
  { border: "#c084fc", text: "#c084fc", bg: "rgba(192,132,252,0.08)" },
  { border: "#fb923c", text: "#fb923c", bg: "rgba(251,146,60,0.08)"  },
  { border: "#4ade80", text: "#4ade80", bg: "rgba(74,222,128,0.08)"  },
  { border: "#f87171", text: "#f87171", bg: "rgba(248,113,113,0.08)" },
  { border: "#fbbf24", text: "#fbbf24", bg: "rgba(251,191,36,0.08)"  },
];

/** Deterministic rotation in range –8° to +8° — never re-shuffles */
function stampRotation(index) {
  return ((index * 7 + 3) % 17) - 8;
}

/* ── Single Stamp Card ──────────────────────────────────────── */
function PassportStamp({ stamp, index, onRemove }) {
  const p   = PALETTES[index % PALETTES.length];
  const rot = stampRotation(index);

  function handleMouseEnter(e) {
    e.currentTarget.style.transform = "rotate(0deg) scale(1.06)";
    e.currentTarget.style.zIndex = "10";
  }
  function handleMouseLeave(e) {
    e.currentTarget.style.transform = `rotate(${rot}deg) scale(1)`;
    e.currentTarget.style.zIndex = "1";
  }

  return (
    <div
      className="relative group select-none"
      style={{
        transform: `rotate(${rot}deg)`,
        transition: "transform 0.25s cubic-bezier(0.23,1,0.32,1), z-index 0s",
        zIndex: 1,
        position: "relative",
      }}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <div
        className="rounded-2xl p-5 flex flex-col items-center gap-2"
        style={{
          background: p.bg,
          border: `2px dashed ${p.border}55`,
          minWidth: "140px",
          maxWidth: "160px",
          opacity: 0.88,
          boxShadow: `0 4px 24px ${p.border}18`,
        }}
      >
        {/* Remove button */}
        <button
          id={`remove-stamp-${stamp.id}`}
          onClick={() => onRemove(stamp.id)}
          className="absolute top-2 right-2 p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
          style={{ background: "rgba(248,113,113,0.18)", color: "#f87171" }}
          title="Remove stamp"
        >
          <Trash2 size={9} />
        </button>

        {/* VISITED label */}
        <div
          className="text-xs font-bold tracking-widest uppercase"
          style={{ color: p.text, opacity: 0.7, letterSpacing: "0.15em" }}
        >
          VISITED
        </div>

        {/* IATA code */}
        <div
          className="text-5xl font-black leading-none"
          style={{
            color: p.text,
            textShadow: `0 0 24px ${p.border}55`,
            fontFamily: "'Courier New', Courier, monospace",
          }}
        >
          {stamp.destination.iata}
        </div>

        {/* City */}
        <div className="text-xs font-semibold text-center" style={{ color: "var(--text-primary)" }}>
          {stamp.destination.city}
        </div>
        <div className="text-xs text-center" style={{ color: "var(--text-muted)" }}>
          {stamp.destination.country}
        </div>

        {/* Route */}
        <div
          className="flex items-center gap-1 px-2 py-0.5 rounded-full text-xs"
          style={{ background: `${p.border}18`, color: p.text }}
        >
          <span>{stamp.origin.iata}</span>
          <Plane size={9} />
          <span>{stamp.destination.iata}</span>
        </div>

        {/* Date */}
        <div
          className="text-xs font-medium px-2 py-0.5 rounded-full"
          style={{ background: `${p.border}20`, color: p.text }}
        >
          {stamp.date}
        </div>

        {/* Distance */}
        {stamp.totalKm && (
          <div className="text-xs" style={{ color: "var(--text-muted)" }}>
            {stamp.totalKm.toLocaleString()} km
          </div>
        )}
      </div>
    </div>
  );
}

/* ── Passport Page ──────────────────────────────────────────── */
export default function Passport() {
  const navigate    = useNavigate();
  const stamps      = useStore((s) => s.stamps);
  const removeStamp = useStore((s) => s.removeStamp);
  const clearStamps = useStore((s) => s.clearStamps);
  const addStamp    = useStore((s) => s.addStamp);

  // TASK 1: Hydrate from localStorage on mount — merges any stamps not yet in Zustand
  useEffect(() => {
    const lsStamps = readStampsFromLocalStorage();
    lsStamps.forEach((s) => addStamp(s));

    // Listen for real-time stamp additions from the booking confirmation
    function onStampAdded(e) {
      addStamp(e.detail);
    }
    window.addEventListener("passport:stamp-added", onStampAdded);
    return () => window.removeEventListener("passport:stamp-added", onStampAdded);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const uniqueDests = Array.from(new Set((stamps || []).map((s) => s.destination.iata)));

  return (
    <div
      id="passport-page"
      className="px-6 py-8 mx-auto"
      style={{
        minHeight: "calc(100vh - 56px)",
        marginTop: "56px",
        maxWidth: "1200px",
        // Extra bottom padding so content doesn't hide behind any fixed elements
        paddingBottom: "48px",
      }}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-8">
        <div>
          <h1 className="text-3xl font-black mb-1" style={{ color: "var(--text-primary)" }}>
            ✈️ Digital Passport
          </h1>
          <p className="text-sm" style={{ color: "var(--text-muted)" }}>
            {stamps.length === 0
              ? "Your travel history will appear here"
              : `${stamps.length} stamp${stamps.length !== 1 ? "s" : ""} collected`}
          </p>
        </div>

        {stamps.length > 0 && (
          <div className="flex items-center gap-2 flex-shrink-0 mt-1">
            <div
              className="px-3 py-1 rounded-full text-xs font-semibold"
              style={{
                background: "var(--accent-glow)",
                color: "var(--accent)",
                border: "1px solid var(--glass-border)",
              }}
            >
              {stamps.length} stamp{stamps.length !== 1 ? "s" : ""}
            </div>
            <button
              id="clear-all-stamps-btn"
              onClick={clearStamps}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium cursor-pointer hover:opacity-80 transition-all"
              style={{
                background: "rgba(248,113,113,0.1)",
                border: "1px solid rgba(248,113,113,0.22)",
                color: "#f87171",
              }}
            >
              <Trash2 size={11} /> Clear All
            </button>
          </div>
        )}
      </div>

      {/* Empty State */}
      {stamps.length === 0 ? (
        <div className="flex flex-col items-center justify-center text-center py-24 gap-5">
          <div className="text-8xl">🌍</div>
          <div>
            <h2 className="text-2xl font-bold mb-2" style={{ color: "var(--text-primary)" }}>
              No stamps yet
            </h2>
            <p className="text-sm max-w-xs mx-auto" style={{ color: "var(--text-muted)" }}>
              Plan a route on Explore and click{" "}
              <span style={{ color: "var(--accent)" }}>"Calculate Trip Insights"</span> to earn
              your first passport stamp
            </p>
          </div>
          <button
            id="passport-go-explore-btn"
            onClick={() => navigate("/explore")}
            className="flex items-center gap-2 px-6 py-3 rounded-2xl font-semibold text-sm cursor-pointer hover:scale-105 active:scale-95 transition-all"
            style={{ background: "var(--accent)", color: "var(--bg-primary)" }}
          >
            <Globe2 size={15} /> Start Exploring
          </button>
        </div>
      ) : (
        <>
          {/* Destinations summary bar */}
          <div className="glass rounded-2xl px-5 py-3 mb-8 flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2">
              <MapPin size={13} style={{ color: "var(--accent)" }} />
              <span className="text-xs font-medium" style={{ color: "var(--text-muted)" }}>
                Destinations:
              </span>
            </div>
            {uniqueDests.map((iata) => (
              <span
                key={iata}
                className="text-xs font-bold px-2 py-0.5 rounded-full"
                style={{
                  background: "var(--accent-glow)",
                  color: "var(--accent)",
                  border: "1px solid var(--glass-border)",
                }}
              >
                {iata}
              </span>
            ))}
            <span className="ml-auto text-xs hidden sm:block" style={{ color: "var(--text-muted)" }}>
              Hover to straighten a stamp
            </span>
          </div>

          {/* Stamp wall */}
          <div className="flex flex-wrap gap-8 items-start" style={{ padding: "8px 0 32px" }}>
            {stamps.map((stamp, i) => (
              <PassportStamp
                key={stamp.id}
                stamp={stamp}
                index={i}
                onRemove={removeStamp}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
