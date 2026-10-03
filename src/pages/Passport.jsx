import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Globe2, Trash2, Plane, MapPin, Ticket, QrCode, ArrowRight,
  ShieldCheck, Sparkles, Plus, Clock, Luggage, Wifi, Award,
  CheckCircle2, Navigation, Compass, Share2, Heart
} from "lucide-react";
import { useStore } from "../store/useStore";
import { readStampsFromLocalStorage } from "../hooks/usePassportStamps";
import { sound } from "../utils/soundFx";
import { cancelBookingAPI, fetchUserBookingsAPI } from "../services/api/apiClient";

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   AURORA STAMP PALETTES (High-contrast aerospace HUD themes)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
const STAMP_PALETTES = [
  {
    border: "#2997ff",
    text: "#2997ff",
    bg: "rgba(41, 151, 255, 0.08)",
    glow: "rgba(41, 151, 255, 0.18)",
    label: "PACIFIC SECTOR",
  },
  {
    border: "#30d158",
    text: "#30d158",
    bg: "rgba(48, 209, 88, 0.08)",
    glow: "rgba(48, 209, 88, 0.18)",
    label: "TRANSIT APPROVED",
  },
  {
    border: "#bf5af2",
    text: "#bf5af2",
    bg: "rgba(191, 90, 242, 0.08)",
    glow: "rgba(191, 90, 242, 0.18)",
    label: "EUROPEAN CORRIDOR",
  },
  {
    border: "#ff9f0a",
    text: "#ff9f0a",
    bg: "rgba(255, 159, 10, 0.08)",
    glow: "rgba(255, 159, 10, 0.18)",
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
          <div className="mono text-[8px] tracking-widest mt-0.5" style={{ color: "#94A3B8" }}>
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
            <div className="mono text-xs uppercase tracking-wider" style={{ color: "#94A3B8" }}>
              {countryName}
            </div>
          )}
        </div>

        {/* Route breadcrumb badge */}
        <div
          className="flex items-center gap-1.5 px-2.5 py-1 rounded-full mono text-xs font-bold"
          style={{ background: "rgba(255,255,255,0.05)", border: `1px solid ${pal.border}44`, color: "#E8EAF0" }}
        >
          <span>{origIata}</span>
          <Plane size={9} style={{ color: pal.text }} />
          <span>{destIata}</span>
        </div>

        {/* Footer date & distance */}
        <div className="w-full border-t pt-2 mt-2 flex items-center justify-between" style={{ borderColor: `${pal.border}33` }}>
          <span className="mono text-xs" style={{ color: "#94A3B8" }}>
            {stamp.date || "ACTIVE"}
          </span>
          <button
            type="button"
            onClick={() => onViewGlobe(stamp)}
            className="mono text-xs font-bold flex items-center gap-0.5 cursor-pointer hover:underline"
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
        backdropFilter: "blur(12px) saturate(180%)",
        border: "1px solid rgba(255,255,255,0.10)",
        boxShadow: "inset 0 1px 1.5px rgba(255,255,255,0.15), 0 20px 50px rgba(0,0,0,0.55)",
      }}
    >
      {/* Top Foil Security Strip */}
      <div
        className="h-1.5 w-full"
        style={{
          background: isBusiness
            ? "linear-gradient(90deg, #ff9f0a, #bf5af2, #2997ff)"
            : "linear-gradient(90deg, #2997ff, #bf5af2)"
        }}
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
                  background: isBusiness ? "rgba(255,159,10,0.12)" : "rgba(41,151,255,0.12)",
                  border: `1px solid ${isBusiness ? "rgba(255,159,10,0.3)" : "rgba(41,151,255,0.3)"}`,
                }}
              >
                <Plane size={18} color={isBusiness ? "#ff9f0a" : "#2997ff"} className="-rotate-45" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-[15px] text-white">{airline}</span>
                  <span
                    className="mono text-xs font-bold px-2 py-0.5 rounded"
                    style={{
                      background: isBusiness ? "rgba(255,159,10,0.15)" : "rgba(41,151,255,0.12)",
                      border: `1px solid ${isBusiness ? "rgba(255,159,10,0.35)" : "rgba(41,151,255,0.3)"}`,
                      color: isBusiness ? "#ff9f0a" : "#2997ff",
                    }}
                  >
                    {flightCode}
                  </span>
                </div>
                <div className="mono text-xs text-[#86868b] mt-0.5">
                  DATE: {trip.date || "2026-09-04"} · GATEWAY FLIGHT-OS
                </div>
              </div>
            </div>

            {/* PNR Ref & Status Badge */}
            <div className="flex items-center gap-2.5">
              <button
                type="button"
                onClick={handleCopyPnr}
                className="chip text-xs py-1 cursor-pointer"
                title="Copy PNR Booking Reference"
              >
                <span className="text-[#86868b]">REF:</span>
                <span className="text-white">{trip.bookingRef || "FG-849201"}</span>
                {copied && <CheckCircle2 size={11} color="#30d158" />}
              </button>
              <div
                className="flex items-center gap-1 px-2.5 py-1 rounded-full mono text-xs font-bold"
                style={{
                  background: "rgba(48,209,88,0.12)",
                  border: "1px solid rgba(48,209,88,0.3)",
                  color: "#30d158",
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
              <div className="mono text-[34px] sm:text-[42px] font-black leading-none text-white">
                {origCode}
              </div>
              <div className="font-semibold text-sm text-white mt-1">{origCity}</div>
              <div className="mono text-[13px] text-[#86868b] mt-0.5">
                DEP {flight.dep || "07:30"} · {trip.terminal || "T4"}
              </div>
            </div>

            {/* Middle Flight Path Arc */}
            <div className="flex flex-col items-center justify-center flex-1 max-w-[200px] px-2">
              <span className="mono text-xs text-[#30d158] font-bold tracking-wider mb-1">
                NON-STOP
              </span>
              <div className="relative w-full flex items-center justify-center">
                <div className="w-full h-px" style={{ background: "linear-gradient(90deg, #2997ff, #bf5af2)" }} />
                <div
                  className="absolute w-6 h-6 rounded-full flex items-center justify-center"
                  style={{ background: "#161618", border: "1px solid rgba(41,151,255,0.4)" }}
                >
                  <Plane size={11} color="#2997ff" className="rotate-45" />
                </div>
              </div>
              <span className="mono text-xs text-[#86868b] mt-1.5">
                {flight.dur || "7h 15m"}
              </span>
            </div>

            {/* Destination */}
            <div className="flex-1 text-right">
              <div className="mono text-[34px] sm:text-[42px] font-black leading-none text-white">
                {destCode}
              </div>
              <div className="font-semibold text-sm text-white mt-1">{destCity}</div>
              <div className="mono text-[13px] text-[#86868b] mt-0.5">
                ARR {flight.arr || "19:45"} · {trip.terminal || "T5"}
              </div>
            </div>
          </div>

          {/* Passenger & Flight Specs Grid */}
          <div
            className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 p-3.5 rounded-2xl"
            style={{ background: "rgba(22, 22, 24, 0.70)", border: "1px solid rgba(255,255,255,0.06)" }}
          >
            <div>
              <div className="mono text-[8px] uppercase tracking-widest text-[#86868b]">ASSIGNED SEAT</div>
              <div className="mono text-base font-bold" style={{ color: isBusiness ? "#ff9f0a" : "#2997ff" }}>
                {seat}
              </div>
              <div className="mono text-xs text-[#86868b]">{cabinClass}</div>
            </div>

            <div>
              <div className="mono text-[8px] uppercase tracking-widest text-[#86868b]">GATE / BOARDING</div>
              <div className="mono text-base font-bold text-white">
                {trip.gate || "B14"}
              </div>
              <div className="mono text-xs text-[#30d158]">GROUP {trip.group || "A"}</div>
            </div>

            <div>
              <div className="mono text-[8px] uppercase tracking-widest text-[#86868b]">TERMINAL</div>
              <div className="mono text-base font-bold text-white">
                {trip.terminal || "T4"}
              </div>
              <div className="mono text-xs text-[#86868b]">FAST-TRACK</div>
            </div>

            <div>
              <div className="mono text-[8px] uppercase tracking-widest text-[#86868b]">TOTAL FARE</div>
              <div className="mono text-base font-bold font-mono text-[#30d158]">
                {currencySymbol}{typeof price === "number" ? price.toLocaleString() : price}
              </div>
              <div className="mono text-xs text-[#86868b]">TAXES INCL.</div>
            </div>
          </div>

          {/* Quick Actions Footer */}
          <div className="flex items-center justify-between flex-wrap gap-3 pt-2">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => onViewGlobe({ origin, destination, flight })}
                className="btn-ghost flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-[13px] font-bold cursor-pointer"
              >
                <Globe2 size={13} />
                <span>VIEW 3D CORRIDOR</span>
              </button>

              <button
                type="button"
                onClick={handleCopyPnr}
                className="btn-ghost flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-[13px] font-bold cursor-pointer"
              >
                <Share2 size={13} />
                <span>SHARE ITINERARY</span>
              </button>

              {onBookSimilar && (
                <button
                  type="button"
                  onClick={() => onBookSimilar(origCode, destCode)}
                  className="btn-ghost flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-[13px] font-bold cursor-pointer hover:text-blue-300"
                  title="Search & book another flight on this corridor"
                >
                  <Plane size={13} className="text-blue-400" />
                  <span>BOOK SIMILAR ROUTE</span>
                </button>
              )}
            </div>

            <button
              type="button"
              onClick={() => onCancel(trip.id)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[13px] font-bold cursor-pointer transition-all hover:bg-rose-500/20 text-[#FF3B69] border border-rose-500/20"
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
            background: "rgba(22, 22, 24, 0.75)",
            border: "1px solid rgba(255,255,255,0.06)",
          }}
        >
          <div className="w-full space-y-1">
            <div className="mono text-xs font-bold tracking-widest text-[#2997ff]">
              DIGITAL WALLET NFC
            </div>
            <div className="mono text-xs text-[#86868b]">
              BIOMETRIC SMART PASS
            </div>
          </div>

          {/* High contrast QR code */}
          <div className="my-4 p-3 rounded-2xl bg-white shadow-xl flex items-center justify-center">
            <QrCode size={110} color="#161618" />
          </div>

          <div className="w-full space-y-3">
            <div className="mono text-xs text-[#86868b] leading-relaxed">
              SCAN AT TSA PRE-CHECK & BOARDING E-GATES
            </div>

            <div
              className="flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-xl mono text-xs font-semibold text-[#30d158]"
              style={{ background: "rgba(48,209,88,0.08)", border: "1px solid rgba(48,209,88,0.2)" }}
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
  
  // Real DB state
  const [dbTrips, setDbTrips] = useState([]);
  const [loadingDb, setLoadingDb] = useState(true);
  
  const removeTrip  = useStore((s) => s.removeTrip);
  const setStoreWps = useStore((s) => s.setWaypoints);
    const savedFlights = useStore((s) => s.savedFlights);
    const toggleSavedFlight = useStore((s) => s.toggleSavedFlight);

  const [activeTab, setActiveTab] = useState("passes"); // "passes" | "stamps"

  useEffect(() => {
    async function load() {
      setLoadingDb(true);
      try {
        const data = await fetchUserBookingsAPI();
        if (data) {
          setDbTrips(data);
        }
      } catch (err) {
        console.error("Failed to fetch bookings", err);
      } finally {
        setLoadingDb(false);
      }
    }
    load();
  }, []);

  const uniqueStamps = React.useMemo(() => {
    const seen = new Set();
    return dbTrips.map(trip => ({
      id: trip.id,
      origin: trip.origin,
      destination: trip.destination,
      date: trip.date,
      airline: trip.flight?.airline,
      flightNo: trip.flight?.code
    })).filter((s) => {
      const id = s.id || `${s.origin?.iata}-${s.destination?.iata}-${s.date}`;
      if (seen.has(id)) return false;
      seen.add(id);
      return true;
    });
  }, [dbTrips]);

  const uniqueDests = Array.from(
    new Set((uniqueStamps || []).map((s) => s.destination?.iata || s.destination?.code).filter(Boolean))
  );

  async function handleCancelTrip(id) {
    sound.playClick();
    setDbTrips(prev => prev.filter(t => t.id !== id));
    try {
      await cancelBookingAPI(id);
      removeTrip(id); // fallback clear local
    } catch(err) {
      console.warn("Failed to cancel trip in backend:", err);
    }
  }

  const trips = dbTrips; // override the variable used by the rest of the file

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
      className="px-4 pl-6 sm:px-8 sm:pl-10 mx-auto space-y-6 pt-24 sm:pt-28 pb-16 max-w-[1160px] animate-fade-in relative z-10"
    >
      {/* ── HUD HEADER ─────────────────────────────────────────── */}
      <div
        className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6"
        style={{ borderBottom: "1px solid rgba(255,255,255,0.07)" }}
      >
        <div className="flex-1 max-w-md">
          <div className="mono text-xs tracking-widest mb-1 text-[#64748B]">
            DIGITAL CREDENTIALS // TRAVEL DOSSIER
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white flex items-center gap-2">
            <span>Passes & Digital Passport</span>
          </h1>
          <p className="text-xs text-[#94A3B8] mt-1 break-words whitespace-normal">
            Active electronic boarding passes, biometric flight clearances, and verified destination stamps.
          </p>
        </div>

        {/* 🚀 Elite Status Gamification Panel */}
      <div className="p-4 sm:p-5 rounded-3xl mb-8 relative overflow-hidden group" style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)" }}>
        <div className="absolute -right-8 -top-8 text-indigo-500/5 group-hover:text-indigo-500/10 transition-colors pointer-events-none">
          <Award size={140} />
        </div>
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-[13px] font-bold text-white flex items-center gap-1.5"><Award size={15} className="text-[#bf5af2]" /> Frequent Flyer Status</h3>
            <p className="text-[13px] text-[#94A3B8] mt-1.5 max-w-sm leading-relaxed">You have collected <span className="font-bold text-white">{uniqueStamps.length}</span> digital stamps. Book flights to earn stamps and unlock exclusive UI themes (like <span className="text-[#c084fc]">Cyberpunk</span> and <span className="text-[#ff2a85]">Synthwave</span>).</p>
          </div>
          <div className="flex-1 max-w-sm w-full bg-black/40 p-3 rounded-2xl border border-white/5">
            <div className="flex justify-between text-xs text-[#bf5af2] font-bold mb-2 uppercase tracking-wider">
              <span>{uniqueStamps.length < 2 ? "Novice" : uniqueStamps.length < 8 ? "Explorer" : "Elite Tier"}</span>
              <span>{uniqueStamps.length < 2 ? "2 Stamps to Sunset Theme" : uniqueStamps.length < 4 ? "4 Stamps to Synthwave" : uniqueStamps.length < 8 ? "8 Stamps to Cyberpunk" : "All Themes Unlocked"}</span>
            </div>
            <div className="h-2 rounded-full bg-slate-900/80 border border-white/5 overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 transition-all duration-1000 relative" 
                style={{ width: `${Math.min(100, (uniqueStamps.length / 8) * 100)}%` }}
              >
                <div className="absolute inset-0 bg-white/20 w-full animate-[shimmer_2s_infinite]" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* View Switcher Segmented Control */}
        <div className="flex items-center gap-3 flex-wrap relative z-50">
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
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer"
              style={{
                background: activeTab === "passes" ? "rgba(41,151,255,0.12)" : "transparent",
                border: activeTab === "passes" ? "1px solid rgba(41,151,255,0.3)" : "1px solid transparent",
                color: activeTab === "passes" ? "#2997ff" : "#86868b",
              }}
            >
              <Ticket size={13} />
              <span>BOARDING PASSES</span>
              <span
                className="mono w-5 h-5 rounded-full text-xs font-bold flex items-center justify-center"
                style={{
                  background: activeTab === "passes" ? "#0071e3" : "rgba(255,255,255,0.08)",
                  color: "#ffffff",
                }}
              >
                {trips.length}
              </span>
            </button>

            {/* STAMPS TAB */}
            <button
              type="button"
              onClick={() => { sound.playClick(); setActiveTab("stamps"); }}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer"
              style={{
                background: activeTab === "stamps" ? "rgba(191,90,242,0.12)" : "transparent",
                border: activeTab === "stamps" ? "1px solid rgba(191,90,242,0.3)" : "1px solid transparent",
                color: activeTab === "stamps" ? "#bf5af2" : "#86868b",
              }}
            >
              <span>🌍 PASSPORT STAMPS</span>
              <span
                className="mono w-5 h-5 rounded-full text-xs font-bold flex items-center justify-center"
                style={{
                  background: activeTab === "stamps" ? "#bf5af2" : "rgba(255,255,255,0.08)",
                  color: "#fff",
                }}
              >
                {uniqueStamps.length}
              </span>
            </button>

            {/* WATCHLIST TAB */}
            <button
              type="button"
              onClick={() => { sound.playClick(); setActiveTab("watchlist"); }}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer"
              style={{
                background: activeTab === "watchlist" ? "rgba(244,63,94,0.12)" : "transparent",
                border: activeTab === "watchlist" ? "1px solid rgba(244,63,94,0.3)" : "1px solid transparent",
                color: activeTab === "watchlist" ? "#f43f5e" : "#86868b",
              }}
            >
              <span><Heart size={13} className="inline mr-1" /> WATCHLIST</span>
              <span
                className="mono w-5 h-5 rounded-full text-xs font-bold flex items-center justify-center"
                style={{
                  background: activeTab === "watchlist" ? "#f43f5e" : "rgba(255,255,255,0.08)",
                  color: "#fff",
                }}
              >
                {savedFlights ? savedFlights.length : 0}
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
                background: "rgba(22, 22, 24, 0.65)",
                border: "1px dashed rgba(255,255,255,0.12)",
                backdropFilter: "blur(12px)",
              }}
            >
              <div
                className="w-16 h-16 rounded-2xl mx-auto flex items-center justify-center"
                style={{ background: "rgba(41,151,255,0.10)", border: "1px solid rgba(41,151,255,0.25)" }}
              >
                <Ticket size={28} color="#2997ff" />
              </div>
              <div className="space-y-1">
                <h3 className="text-xl font-bold text-white">No active electronic boarding passes</h3>
                <p className="text-xs text-[#94A3B8] max-w-md mx-auto">
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
      {/* TAB 3: WATCHLIST */}
        {activeTab === "watchlist" && (
          <div className="animate-slide-up space-y-4">
            {(!savedFlights || savedFlights.length === 0) ? (
              <div className="p-12 text-center rounded-3xl flex flex-col items-center" style={{ background: "rgba(13, 17, 27, 0.65)", border: "1px dashed rgba(255,255,255,0.12)" }}>
                <Heart size={32} className="text-[#86868b] mb-4" />
                <h3 className="text-sm font-bold text-white mb-2">No Saved Flights</h3>
                <p className="text-xs text-[#86868b] max-w-sm mx-auto leading-relaxed">Use the heart icon on any flight booking card to watch prices and save itineraries for later.</p>
                <button onClick={() => navigate("/booking")} className="mt-6 px-5 py-2.5 bg-rose-500/10 border border-rose-500/20 text-rose-400 font-bold text-xs rounded-xl hover:bg-rose-500/20 transition-all">Find Flights</button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {savedFlights.map((item, idx) => (
                  <div key={idx} className="p-5 rounded-3xl bg-white/[0.02] border border-white/5 hover:border-rose-500/30 transition-all group relative cursor-default shadow-lg">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <div className="text-xs font-bold text-[#86868b] tracking-widest uppercase flex items-center gap-1.5">
                          {item.searchContext.origin} <ArrowRight size={10} /> {item.searchContext.destination}
                        </div>
                        <div className="text-2xl font-black text-white mt-1 tracking-tighter">{item.flight.price?.currencySymbol || "$"}{(item.flight.price?.total || 0).toLocaleString()}</div>
                      </div>
                      <button 
                        onClick={() => toggleSavedFlight(item.flight, item.searchContext)}
                        className="text-rose-400 p-2 rounded-xl hover:bg-rose-500/10 transition-colors"
                      >
                        <Heart size={18} fill="currentColor" />
                      </button>
                    </div>
                    
                    <div className="flex items-center justify-between text-xs text-slate-300 mb-5">
                      <div className="flex items-center gap-2">
                        <Clock size={12} className="text-[#2997ff]" />
                        <span>{new Date(item.searchContext.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}</span>
                      </div>
                      <span className="px-2.5 py-1 rounded-md bg-white/5 font-semibold text-xs uppercase tracking-wider">{item.searchContext.travelClass}</span>
                    </div>

                    <button 
                      onClick={() => navigate(`/booking?from=${item.searchContext.origin}&to=${item.searchContext.destination}`)}
                      className="w-full py-2.5 bg-[#2997ff]/10 hover:bg-[#2997ff]/20 text-[#2997ff] text-xs font-bold rounded-xl transition-colors border border-[#2997ff]/20"
                    >
                      Check Live Price
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === "stamps" && (
        <div className="space-y-6">
          {uniqueStamps.length === 0 ? (
            /* Empty State */
            <div
              className="rounded-3xl p-12 sm:p-16 text-center space-y-4"
              style={{
                background: "rgba(13, 17, 27, 0.65)",
                border: "1px dashed rgba(255,255,255,0.12)",
                backdropFilter: "blur(12px)",
              }}
            >
              <div className="text-6xl">🌍</div>
              <div className="space-y-1">
                <h3 className="text-xl font-bold text-white">Digital Passport Empty</h3>
                <p className="text-xs text-[#94A3B8] max-w-md mx-auto">
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
                  background: "rgba(22, 22, 24, 0.70)",
                  border: "1px solid rgba(255,255,255,0.08)",
                }}
              >
                <div className="flex items-center gap-3 flex-wrap">
                  <div className="flex items-center gap-1.5">
                    <MapPin size={15} color="#2997ff" />
                    <span className="mono text-xs font-bold text-white">
                      VISITED HUBS ({uniqueDests.length}):
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 flex-wrap">
                    {uniqueDests.map((iata) => (
                      <span
                        key={iata}
                        className="mono text-xs font-semibold px-2.5 py-0.5 rounded-lg"
                        style={{
                          background: "rgba(41,151,255,0.10)",
                          border: "1px solid rgba(41,151,255,0.25)",
                          color: "#2997ff",
                        }}
                      >
                        {iata}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span className="mono text-xs text-[#94A3B8] hidden md:block">
                    HOVER STAMP TO INSPECT
                  </span>
                  <button
                    type="button"
                    onClick={() => { sound.playClick(); clearStamps(); }}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold cursor-pointer transition-all hover:bg-rose-500/20 text-[#FF3B69] border border-rose-500/20"
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
