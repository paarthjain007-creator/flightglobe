import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Globe2, Trash2, Plane, MapPin, Ticket, QrCode, ArrowRight,
  ShieldCheck, Sparkles, Plus, Clock, Luggage, Wifi, Award,
  CheckCircle2, Navigation, Compass, Share2
} from "lucide-react";
import { useStore } from "../store/useStore";
import { readStampsFromLocalStorage } from "../hooks/usePassportStamps";
import { sound } from "../utils/soundFx";
import { cancelBookingAPI } from "../services/api/apiClient";

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   AURORA STAMP PALETTES (High-contrast aerospace HUD themes)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
const STAMP_PALETTES = [
  {
    border: "#00F2FE",
    text: "#00F2FE",
    bg: "rgba(0, 242, 254, 0.06)",
    glow: "rgba(0, 242, 254, 0.25)",
    label: "PACIFIC SECTOR",
  },
  {
    border: "#00FFA3",
    text: "#00FFA3",
    bg: "rgba(0, 255, 163, 0.06)",
    glow: "rgba(0, 255, 163, 0.25)",
    label: "TRANSIT APPROVED",
  },
  {
    border: "#B800FF",
    text: "#B800FF",
    bg: "rgba(184, 0, 255, 0.07)",
    glow: "rgba(184, 0, 255, 0.25)",
    label: "EUROPEAN CORRIDOR",
  },
  {
    border: "#E2B755",
    text: "#E2B755",
    bg: "rgba(226, 183, 85, 0.07)",
    glow: "rgba(226, 183, 85, 0.25)",
    label: "PREMIUM CLEARANCE",
  },
];

/** Deterministic tilt (-6° to +6°) */
function getStampRotation(index) {
  const angles = [-5, 4, -3, 6, -4, 3, -6, 5];
  return angles[index % angles.length];
}

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   HOLOGRAPHIC PASSPORT STAMP COMPONENT
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
function HolographicStamp({ stamp, index, onRemove, onViewGlobe }) {
  const pal = STAMP_PALETTES[index % STAMP_PALETTES.length];
  const rot = getStampRotation(index);
  const [hovered, setHovered] = useState(false);

  const destIata = stamp.destination?.iata || stamp.destination?.code || "DEST";
  const origIata = stamp.origin?.iata || stamp.origin?.code || "ORIG";
  const cityName = stamp.destination?.city || "Unknown City";
  const countryName = stamp.destination?.country || "";

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9, y: 15 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ delay: index * 0.04, duration: 0.25 }}
      className="relative group select-none"
      style={{
        transform: hovered ? "rotate(0deg) translateY(-6px) scale(1.04)" : `rotate(${rot}deg)`,
        transition: "transform 0.26s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.26s ease",
        zIndex: hovered ? 20 : 1,
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div
        className="holographic-sheen rounded-3xl p-5 flex flex-col items-center justify-between text-center relative overflow-hidden"
        style={{
          width: "180px",
          minHeight: "225px",
          background: pal.bg,
          border: `2px dashed ${pal.border}`,
          boxShadow: hovered ? `0 16px 36px ${pal.glow}` : `0 6px 20px ${pal.glow}`,
          backdropFilter: "blur(18px)",
        }}
      >
        {/* Laser security watermark */}
        <div
          className="absolute inset-0 pointer-events-none opacity-5"
          style={{
            backgroundImage: "radial-gradient(circle at 50% 50%, white 1px, transparent 1px)",
            backgroundSize: "12px 12px",
          }}
        />

        {/* Delete stamp button */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            sound.playClick();
            onRemove(stamp.id);
          }}
          className="absolute top-2.5 right-2.5 p-1 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer z-10"
          style={{ background: "rgba(255, 59, 105, 0.2)", color: "#FF3B69" }}
          title="Remove Stamp"
        >
          <Trash2 size={11} />
        </button>

        {/* Top Header Stamp Mark */}
        <div className="w-full border-b pb-2" style={{ borderColor: `${pal.border}33` }}>
          <div className="mono text-[8px] font-bold tracking-[0.18em]" style={{ color: pal.text }}>
            ★ {pal.label} ★
          </div>
          <div className="mono text-[8px] tracking-widest mt-0.5" style={{ color: "#7A85A0" }}>
            CLEARANCE REF: {stamp.id?.toString().slice(-4) || "7041"}
          </div>
        </div>

        {/* Core IATA Code */}
        <div className="my-1 flex flex-col items-center">
          <div
            className="mono font-black tracking-wider leading-none"
            style={{
              fontSize: "44px",
              color: pal.text,
              textShadow: `0 0 20px ${pal.glow}`,
            }}
          >
            {destIata}
          </div>
          <div className="font-bold text-[13px] mt-1 text-white tracking-wide">
            {cityName}
          </div>
          {countryName && (
            <div className="mono text-[9px] uppercase tracking-wider" style={{ color: "#7A85A0" }}>
              {countryName}
            </div>
          )}
        </div>

        {/* Route breadcrumb badge */}
        <div
          className="flex items-center gap-1.5 px-2.5 py-1 rounded-full mono text-[9px] font-bold"
          style={{ background: "rgba(255,255,255,0.05)", border: `1px solid ${pal.border}44`, color: "#E8EAF0" }}
        >
          <span>{origIata}</span>
          <Plane size={9} style={{ color: pal.text }} />
          <span>{destIata}</span>
        </div>

        {/* Footer date & distance */}
        <div className="w-full border-t pt-2 mt-2 flex items-center justify-between" style={{ borderColor: `${pal.border}33` }}>
          <span className="mono text-[9px]" style={{ color: "#7A85A0" }}>
            {stamp.date || "ACTIVE"}
          </span>
          <button
            type="button"
            onClick={() => onViewGlobe(stamp)}
            className="mono text-[9px] font-bold flex items-center gap-0.5 cursor-pointer hover:underline"
            style={{ color: pal.text }}
          >
            <span>ROUTE</span>
            <ArrowRight size={9} />
          </button>
        </div>
      </div>
    </motion.div>
  );
}

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   AEROSPACE BOARDING PASS TICKET CARD
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
function BoardingPassTicket({ trip, onCancel, onViewGlobe, onBookSimilar }) {
  const [copied, setCopied] = useState(false);

  const flight = trip.flight || {};
  const origin = trip.origin || {};
  const destination = trip.destination || {};

  const origCode = origin.iata || origin.code || flight.from || "JFK";
  const origCity = origin.city || "New York";
  const destCode = destination.iata || destination.code || flight.to || "LHR";
  const destCity = destination.city || "London";

  const airline = flight.airline || "American Airlines";
  const flightCode = flight.callsign || flight.code || "AA-1416";
  const seat = trip.seat || "2B";
  const isBusiness = seat.startsWith("1") || seat.startsWith("2");
  const cabinClass = isBusiness ? "BUSINESS CLASS" : "ECONOMY CLASS";
  const price = trip.totalPrice || flight.price || 185;
  const currencySymbol = trip.currencySymbol || flight.currencySymbol || "$";

  function handleCopyPnr() {
    sound.playClick();
    if (navigator.clipboard) {
      navigator.clipboard.writeText(trip.bookingRef || "FG-849201");
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.96 }}
      className="holographic-sheen relative rounded-3xl overflow-hidden glass-card"
      style={{
        background: "rgba(13, 17, 27, 0.85)",
        backdropFilter: "blur(28px) saturate(180%)",
        border: "1px solid rgba(255,255,255,0.10)",
        boxShadow: "inset 0 1px 1.5px rgba(255,255,255,0.15), 0 20px 50px rgba(0,0,0,0.55)",
      }}
    >
      {/* Top Foil Aurora Security Strip */}
      <div
        className={`h-1.5 w-full ${isBusiness ? "" : "holo-edge"}`}
        style={
          isBusiness
            ? { background: "linear-gradient(90deg, #E2B755, #00F2FE, #E2B755)" }
            : undefined
        }
      />

      <div className="p-4 sm:p-6 md:p-8 flex flex-col lg:flex-row gap-6 lg:gap-8 items-stretch">

        {/* ── LEFT & CENTER: Flight Dossier ────────────────────────── */}
        <div className="flex-1 flex flex-col justify-between space-y-6">

          {/* Top metadata header */}
          <div className="flex items-center justify-between flex-wrap gap-3 pb-4 border-b border-white/5">
            <div className="flex items-center gap-3">
              <div
                className="w-10 h-10 rounded-2xl flex items-center justify-center flex-shrink-0"
                style={{
                  background: isBusiness ? "rgba(226,183,85,0.12)" : "rgba(0,242,254,0.10)",
                  border: `1px solid ${isBusiness ? "rgba(226,183,85,0.3)" : "rgba(0,242,254,0.25)"}`,
                }}
              >
                <Plane size={18} color={isBusiness ? "#E2B755" : "#00F2FE"} className="-rotate-45" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-[15px] text-white">{airline}</span>
                  <span
                    className="mono text-[10px] font-bold px-2 py-0.5 rounded"
                    style={{
                      background: isBusiness ? "rgba(226,183,85,0.15)" : "rgba(0,242,254,0.12)",
                      border: `1px solid ${isBusiness ? "rgba(226,183,85,0.35)" : "rgba(0,242,254,0.3)"}`,
                      color: isBusiness ? "#E2B755" : "#00F2FE",
                    }}
                  >
                    {flightCode}
                  </span>
                </div>
                <div className="mono text-[10px] text-[#7A85A0] mt-0.5">
                  DATE: {trip.date || "2026-09-04"} · GATEWAY FLIGHT-OS
                </div>
              </div>
            </div>

            {/* PNR Ref & Status Badge */}
            <div className="flex items-center gap-2.5">
              <button
                type="button"
                onClick={handleCopyPnr}
                className="chip text-[10px] py-1 cursor-pointer"
                title="Copy PNR Booking Reference"
              >
                <span className="text-[#7A85A0]">REF:</span>
                <span className="text-white">{trip.bookingRef || "FG-849201"}</span>
                {copied && <CheckCircle2 size={11} color="#00FFA3" />}
              </button>
              <div
                className="flex items-center gap-1 px-2.5 py-1 rounded-full mono text-[9px] font-bold"
                style={{
                  background: "rgba(0,255,163,0.12)",
                  border: "1px solid rgba(0,255,163,0.3)",
                  color: "#00FFA3",
                }}
              >
                <CheckCircle2 size={10} />
                <span>CONFIRMED GDS</span>
              </div>
            </div>
          </div>

          {/* Core Departure & Arrival Row */}
          <div className="flex items-center justify-between gap-4 py-2">
            {/* Origin */}
            <div className="flex-1">
              <div className="mono text-[34px] sm:text-[42px] font-black leading-none" style={{ color: "#00F2FE" }}>
                {origCode}
              </div>
              <div className="font-semibold text-sm text-white mt-1">{origCity}</div>
              <div className="mono text-[11px] text-[#7A85A0] mt-0.5">
                DEP {flight.dep || "07:30"} · {trip.terminal || "T4"}
              </div>
            </div>

            {/* Middle Flight Path Arc */}
            <div className="flex flex-col items-center justify-center flex-1 max-w-[200px] px-2">
              <span className="mono text-[10px] text-[#00FFA3] font-bold tracking-wider mb-1">
                NON-STOP
              </span>
              <div className="relative w-full flex items-center justify-center">
                <div className="w-full h-px" style={{ background: "linear-gradient(90deg, #00F2FE, #7928CA, #00FFA3)" }} />
                <div
                  className="absolute w-6 h-6 rounded-full flex items-center justify-center"
                  style={{ background: "#05060A", border: "1px solid rgba(0,242,254,0.4)" }}
                >
                  <Plane size={11} color="#00F2FE" className="rotate-45" />
                </div>
              </div>
              <span className="mono text-[9px] text-[#7A85A0] mt-1.5">
                {flight.dur || "7h 15m"}
              </span>
            </div>

            {/* Destination */}
            <div className="flex-1 text-right">
              <div className="mono text-[34px] sm:text-[42px] font-black leading-none" style={{ color: "#B800FF" }}>
                {destCode}
              </div>
              <div className="font-semibold text-sm text-white mt-1">{destCity}</div>
              <div className="mono text-[11px] text-[#7A85A0] mt-0.5">
                ARR {flight.arr || "19:45"} · {trip.terminal || "T5"}
              </div>
            </div>
          </div>

          {/* Passenger & Flight Specs Grid */}
          <div
            className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 p-3.5 rounded-2xl"
            style={{ background: "rgba(5, 8, 18, 0.70)", border: "1px solid rgba(255,255,255,0.05)" }}
          >
            <div>
              <div className="mono text-[8px] uppercase tracking-widest text-[#64748B]">ASSIGNED SEAT</div>
              <div className="mono text-base font-bold" style={{ color: isBusiness ? "#E2B755" : "#00F2FE" }}>
                {seat}
              </div>
              <div className="mono text-[9px] text-[#94A3B8]">{cabinClass}</div>
            </div>

            <div>
              <div className="mono text-[8px] uppercase tracking-widest text-[#64748B]">GATE / BOARDING</div>
              <div className="mono text-base font-bold text-white">
                {trip.gate || "B14"}
              </div>
              <div className="mono text-[9px] text-[#00FFA3]">GROUP {trip.group || "A"}</div>
            </div>

            <div>
              <div className="mono text-[8px] uppercase tracking-widest text-[#64748B]">TERMINAL</div>
              <div className="mono text-base font-bold text-white">
                {trip.terminal || "T4"}
              </div>
              <div className="mono text-[9px] text-[#94A3B8]">FAST-TRACK</div>
            </div>

            <div>
              <div className="mono text-[8px] uppercase tracking-widest text-[#64748B]">TOTAL FARE</div>
              <div className="mono text-base font-bold font-mono" style={{ color: "#00FFA3" }}>
                {currencySymbol}{typeof price === "number" ? price.toLocaleString() : price}
              </div>
              <div className="mono text-[9px] text-[#94A3B8]">TAXES INCL.</div>
            </div>
          </div>

          {/* Quick Actions Footer */}
          <div className="flex items-center justify-between flex-wrap gap-3 pt-2">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => onViewGlobe({ origin, destination, flight })}
                className="btn-ghost flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-[11px] font-bold cursor-pointer"
              >
                <Globe2 size={13} />
                <span>VIEW 3D CORRIDOR</span>
              </button>

              <button
                type="button"
                onClick={handleCopyPnr}
                className="btn-ghost flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-[11px] font-bold cursor-pointer"
              >
                <Share2 size={13} />
                <span>SHARE ITINERARY</span>
              </button>

              {onBookSimilar && (
                <button
                  type="button"
                  onClick={() => onBookSimilar(origCode, destCode)}
                  className="btn-ghost flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-[11px] font-bold cursor-pointer hover:text-cyan-300"
                  title="Search & book another flight on this corridor"
                >
                  <Plane size={13} className="text-cyan-400" />
                  <span>BOOK SIMILAR ROUTE</span>
                </button>
              )}
            </div>

            <button
              type="button"
              onClick={() => onCancel(trip.id)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[11px] font-bold cursor-pointer transition-all hover:bg-rose-500/20 text-[#FF3B69] border border-rose-500/20"
              title="Cancel flight reservation"
            >
              <Trash2 size={12} />
              <span>CANCEL RESERVATION</span>
            </button>
          </div>
        </div>

        {/* ── Perforation line (desktop) ─────────────────────────── */}
        <div className="hidden lg:flex flex-col items-center justify-between -my-8 py-4 relative">
          <div className="w-5 h-5 -mt-2.5 rounded-full bg-[#05060A] border-b border-white/10" />
          <div className="w-px h-full border-r border-dashed border-white/20 my-2" />
          <div className="w-5 h-5 -mb-2.5 rounded-full bg-[#05060A] border-t border-white/10" />
        </div>

        {/* ── RIGHT: Digital Wallet & NFC QR Matrix Stub ─────────── */}
        <div
          className="lg:w-64 flex flex-col justify-between items-center text-center p-5 rounded-2xl"
          style={{
            background: "rgba(5, 8, 18, 0.75)",
            border: "1px solid rgba(255,255,255,0.06)",
          }}
        >
          <div className="w-full space-y-1">
            <div className="mono text-[9px] font-bold tracking-widest text-[#00F2FE]">
              DIGITAL WALLET NFC
            </div>
            <div className="mono text-[10px] text-[#7A85A0]">
              BIOMETRIC SMART PASS
            </div>
          </div>

          {/* High contrast QR code */}
          <div className="my-4 p-3 rounded-2xl bg-white shadow-xl flex items-center justify-center">
            <QrCode size={110} color="#05060A" />
          </div>

          <div className="w-full space-y-3">
            <div className="mono text-[9px] text-[#7A85A0] leading-relaxed">
              SCAN AT TSA PRE-CHECK & BOARDING E-GATES
            </div>

            <div
              className="flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-xl mono text-[9px] font-bold text-[#00FFA3]"
              style={{ background: "rgba(0,255,163,0.08)", border: "1px solid rgba(0,255,163,0.2)" }}
            >
              <ShieldCheck size={12} />
              <span>IATA DIGITAL READY</span>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   MAIN PASSPORT & PASSES DOSSIER PAGE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
export default function Passport() {
  const navigate    = useNavigate();
  const stamps      = useStore((s) => s.stamps || []);
  const removeStamp = useStore((s) => s.removeStamp);
  const clearStamps = useStore((s) => s.clearStamps);
  const addStamp    = useStore((s) => s.addStamp);
  const trips       = useStore((s) => s.trips || []);
  const removeTrip  = useStore((s) => s.removeTrip);
  const setStoreWps = useStore((s) => s.setWaypoints);

  const [activeTab, setActiveTab] = useState("passes"); // "passes" | "stamps"

  // Deduplicate stamps by ID
  const uniqueStamps = React.useMemo(() => {
    const seen = new Set();
    return (stamps || []).filter((s) => {
      const id = s.id || `${s.origin?.iata}-${s.destination?.iata}-${s.date}`;
      if (seen.has(id)) return false;
      seen.add(id);
      return true;
    });
  }, [stamps]);

  // Hydrate local storage stamps on mount (only if not already loaded)
  useEffect(() => {
    const lsStamps = readStampsFromLocalStorage();
    const existingIds = new Set((stamps || []).map((s) => s.id));
    lsStamps.forEach((s) => {
      if (s.id && !existingIds.has(s.id)) {
        addStamp(s);
      }
    });

    function onStampAdded(e) {
      if (e.detail && !existingIds.has(e.detail.id)) {
        addStamp(e.detail);
      }
    }
    window.addEventListener("passport:stamp-added", onStampAdded);
    return () => window.removeEventListener("passport:stamp-added", onStampAdded);
  }, [addStamp]);

  const uniqueDests = Array.from(
    new Set((uniqueStamps || []).map((s) => s.destination?.iata || s.destination?.code).filter(Boolean))
  );

  function handleCancelTrip(id) {
    sound.playClick();
    cancelBookingAPI(id).catch((err) => console.warn("Failed to cancel trip in backend:", err));
    removeTrip(id);
  }

  function handleViewGlobe(item) {
    sound.playClick();
    if (item.origin && item.destination) {
      setStoreWps([item.origin, item.destination]);
    }
    navigate("/explore");
  }

  return (
    <div
      id="passport-page"
      className="px-4 sm:px-6 mx-auto space-y-6 pt-24 sm:pt-28 pb-16 max-w-[1160px] animate-fade-in"
    >
      {/* ── HUD HEADER ─────────────────────────────────────────── */}
      <div
        className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6"
        style={{ borderBottom: "1px solid rgba(255,255,255,0.07)" }}
      >
        <div>
          <div className="mono text-[9px] tracking-widest mb-1 text-[#64748B]">
            DIGITAL CREDENTIALS // TRAVEL DOSSIER
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white flex items-center gap-2">
            <span>Passes & Digital Passport</span>
          </h1>
          <p className="text-xs text-[#94A3B8] mt-1">
            Active electronic boarding passes, biometric flight clearances, and verified destination stamps.
          </p>
        </div>

        {/* View Switcher Segmented Control */}
        <div className="flex items-center gap-3 flex-wrap">
          <div
            className="flex items-center gap-1 p-1 rounded-2xl"
            style={{
              background: "rgba(255,255,255,0.03)",
              border: "1px solid rgba(255,255,255,0.08)",
            }}
          >
            {/* PASSES TAB */}
            <button
              type="button"
              onClick={() => { sound.playClick(); setActiveTab("passes"); }}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer"
              style={{
                background: activeTab === "passes" ? "rgba(0,242,254,0.12)" : "transparent",
                border: activeTab === "passes" ? "1px solid rgba(0,242,254,0.3)" : "1px solid transparent",
                color: activeTab === "passes" ? "#00F2FE" : "#7A85A0",
              }}
            >
              <Ticket size={13} />
              <span>BOARDING PASSES</span>
              <span
                className="mono w-5 h-5 rounded-full text-[9px] font-bold flex items-center justify-center"
                style={{
                  background: activeTab === "passes" ? "#00F2FE" : "rgba(255,255,255,0.08)",
                  color: activeTab === "passes" ? "#05060A" : "#7A85A0",
                }}
              >
                {trips.length}
              </span>
            </button>

            {/* STAMPS TAB */}
            <button
              type="button"
              onClick={() => { sound.playClick(); setActiveTab("stamps"); }}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer"
              style={{
                background: activeTab === "stamps" ? "rgba(184,0,255,0.12)" : "transparent",
                border: activeTab === "stamps" ? "1px solid rgba(184,0,255,0.3)" : "1px solid transparent",
                color: activeTab === "stamps" ? "#B800FF" : "#7A85A0",
              }}
            >
              <span>🌍 PASSPORT STAMPS</span>
              <span
                className="mono w-5 h-5 rounded-full text-[9px] font-bold flex items-center justify-center"
                style={{
                  background: activeTab === "stamps" ? "#B800FF" : "rgba(255,255,255,0.08)",
                  color: "#fff",
                }}
              >
                {uniqueStamps.length}
              </span>
            </button>
          </div>

          {/* New Booking CTA */}
          <button
            type="button"
            onClick={() => { sound.playClick(); navigate("/booking"); }}
            className="btn-aurora flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold cursor-pointer"
            title="Open GDS Flight Search Engine"
          >
            <Plane size={14} />
            <span>BOOK FLIGHT</span>
          </button>
        </div>
      </div>

      {/* ════════════════════ TAB 1: BOARDING PASSES ════════════════════ */}
      {activeTab === "passes" && (
        <div className="space-y-6">
          {trips.length === 0 ? (
            /* Empty State */
            <div
              className="rounded-3xl p-12 sm:p-16 text-center space-y-4"
              style={{
                background: "rgba(13, 17, 27, 0.65)",
                border: "1px dashed rgba(255,255,255,0.12)",
                backdropFilter: "blur(20px)",
              }}
            >
              <div
                className="w-16 h-16 rounded-2xl mx-auto flex items-center justify-center"
                style={{ background: "rgba(0,242,254,0.08)", border: "1px solid rgba(0,242,254,0.2)" }}
              >
                <Ticket size={28} color="#00F2FE" />
              </div>
              <div className="space-y-1">
                <h3 className="text-xl font-bold text-white">No active electronic boarding passes</h3>
                <p className="text-xs text-[#7A85A0] max-w-md mx-auto">
                  Book a flight through the GDS booking engine, explore routes on the 3D globe, or request an itinerary with Nimbus AI Copilot.
                </p>
              </div>
              <div className="pt-2 flex justify-center gap-3 flex-wrap">
                <button
                  type="button"
                  onClick={() => { sound.playClick(); navigate("/booking"); }}
                  className="btn-aurora flex items-center gap-2 px-6 py-3 rounded-xl text-xs font-bold cursor-pointer"
                >
                  <Plane size={15} />
                  <span>BOOK ON GDS ENGINE</span>
                </button>
                <button
                  type="button"
                  onClick={() => { sound.playClick(); navigate("/explore"); }}
                  className="btn-ghost flex items-center gap-2 px-5 py-3 rounded-xl text-xs font-bold cursor-pointer"
                >
                  <Globe2 size={15} />
                  <span>EXPLORE 3D GLOBE</span>
                </button>
                <button
                  type="button"
                  onClick={() => { sound.playClick(); navigate("/copilot"); }}
                  className="btn-ghost flex items-center gap-2 px-5 py-3 rounded-xl text-xs font-bold cursor-pointer"
                >
                  <Sparkles size={14} />
                  <span>ASK AI COPILOT</span>
                </button>
              </div>
            </div>
          ) : (
            <AnimatePresence>
              <div className="space-y-5">
                {trips.map((trip) => (
                  <BoardingPassTicket
                    key={trip.id}
                    trip={trip}
                    onCancel={handleCancelTrip}
                    onViewGlobe={handleViewGlobe}
                    onBookSimilar={(from, to) => navigate(`/booking?from=${from}&to=${to}`)}
                  />
                ))}
              </div>
            </AnimatePresence>
          )}
        </div>
      )}

      {/* ════════════════════ TAB 2: PASSPORT STAMPS ════════════════════ */}
      {activeTab === "stamps" && (
        <div className="space-y-6">
          {uniqueStamps.length === 0 ? (
            /* Empty State */
            <div
              className="rounded-3xl p-12 sm:p-16 text-center space-y-4"
              style={{
                background: "rgba(13, 17, 27, 0.65)",
                border: "1px dashed rgba(255,255,255,0.12)",
                backdropFilter: "blur(20px)",
              }}
            >
              <div className="text-6xl">🌍</div>
              <div className="space-y-1">
                <h3 className="text-xl font-bold text-white">Digital Passport Empty</h3>
                <p className="text-xs text-[#7A85A0] max-w-md mx-auto">
                  Confirm any booking or select flight trajectories on Explore to earn holographic transit stamps across world hubs.
                </p>
              </div>
              <div className="pt-2 flex justify-center gap-3 flex-wrap">
                <button
                  type="button"
                  onClick={() => { sound.playClick(); navigate("/booking"); }}
                  className="btn-aurora px-6 py-3 rounded-xl text-xs font-bold cursor-pointer inline-flex items-center gap-2"
                >
                  <Plane size={15} />
                  <span>BOOK IN GDS ENGINE</span>
                </button>
                <button
                  type="button"
                  onClick={() => { sound.playClick(); navigate("/explore"); }}
                  className="btn-ghost px-6 py-3 rounded-xl text-xs font-bold cursor-pointer inline-flex items-center gap-2"
                >
                  <Compass size={15} />
                  <span>EXPLORE DESTINATIONS</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Telemetry Summary Strip */}
              <div
                className="p-4 sm:p-5 rounded-2xl flex flex-wrap items-center justify-between gap-4"
                style={{
                  background: "rgba(13, 17, 27, 0.70)",
                  border: "1px solid rgba(255,255,255,0.07)",
                }}
              >
                <div className="flex items-center gap-3 flex-wrap">
                  <div className="flex items-center gap-1.5">
                    <MapPin size={15} color="#00F2FE" />
                    <span className="mono text-xs font-bold text-white">
                      VISITED HUBS ({uniqueDests.length}):
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 flex-wrap">
                    {uniqueDests.map((iata) => (
                      <span
                        key={iata}
                        className="mono text-[10px] font-bold px-2.5 py-0.5 rounded-lg"
                        style={{
                          background: "rgba(0,242,254,0.10)",
                          border: "1px solid rgba(0,242,254,0.25)",
                          color: "#00F2FE",
                        }}
                      >
                        {iata}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span className="mono text-[10px] text-[#7A85A0] hidden md:block">
                    HOVER STAMP TO INSPECT
                  </span>
                  <button
                    type="button"
                    onClick={() => { sound.playClick(); clearStamps(); }}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[10px] font-bold cursor-pointer transition-all hover:bg-rose-500/20 text-[#FF3B69] border border-rose-500/20"
                  >
                    <Trash2 size={11} />
                    <span>RESET STAMPS</span>
                  </button>
                </div>
              </div>

              {/* Stamp Wall with natural tilt */}
              <div className="flex flex-wrap gap-8 items-start py-4">
                {uniqueStamps.map((stamp, i) => (
                  <HolographicStamp
                    key={stamp.id ? `stamp-${stamp.id}-${i}` : `stamp-idx-${i}`}
                    stamp={stamp}
                    index={i}
                    onRemove={removeStamp}
                    onViewGlobe={handleViewGlobe}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
