import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Armchair, Check, Ticket, Zap, ArrowRight, ShieldCheck, X
} from "lucide-react";
import { sound } from "../../utils/soundFx";
import { CURRENCY_MAP } from "../../services/api/amadeusService";

const SEATS = {
  business: [
    { code: "1A", type: "Window" }, { code: "1B", type: "Aisle" },
    { code: "1C", type: "Aisle" }, { code: "1D", type: "Window" },
    { code: "2A", type: "Window" }, { code: "2B", type: "Aisle" },
    { code: "2C", type: "Aisle" }, { code: "2D", type: "Window" },
  ],
  economy: [
    ["3A","3B","3C","3D","3E","3F"],
    ["4A","4B","4C","4D","4E","4F"],
    ["5A","5B","5C","5D","5E","5F"],
    ["6A","6B","6C","6D","6E","6F"],
    ["7A","7B","7C","7D","7E","7F"],
    ["8A","8B","8C","8D","8E","8F"],
  ],
};

const OCCUPIED = new Set(["1C","2A","3B","4D","5A","6F","7C","8B"]);

export default function KineticSeatCanvas({
  selectedFlight,
  onConfirmBooking,
  currency = "USD",
}) {
  const [selectedSeat, setSelectedSeat] = useState("2B");
  const [displayedPrice, setDisplayedPrice] = useState(() => selectedFlight?.price || 120);

  const symbol = selectedFlight?.currencySymbol || CURRENCY_MAP[currency]?.symbol || "$";
  const basePrice = selectedFlight?.price || 120;
  const isBusiness = selectedSeat?.[0] === "1" || selectedSeat?.[0] === "2";
  const businessSurcharge = Math.round(basePrice * 0.75);
  const targetPrice = basePrice + (isBusiness ? businessSurcharge : 0);

  // Sync displayed price on flight switch
  useEffect(() => {
    if (selectedFlight?.price) {
      setDisplayedPrice(targetPrice);
    }
  }, [selectedFlight?.id, selectedFlight?.price]);

  // Smooth price counter animation
  useEffect(() => {
    let start = displayedPrice;
    const end = targetPrice;
    if (start === end) return;
    const dur = 450;
    const t0 = performance.now();
    function step(now) {
      const p = Math.min((now - t0) / dur, 1);
      setDisplayedPrice(Math.round(start + (end - start) * p));
      if (p < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }, [targetPrice]);

  function handleSeat(code) {
    if (OCCUPIED.has(code)) return;
    sound.playSeatSelect();
    setSelectedSeat(code);
  }

  function handleConfirm() {
    sound.playBookingChime();
    onConfirmBooking({
      flight: {
        code: selectedFlight?.callsign || selectedFlight?.code || "FL-101",
        airline: selectedFlight?.airline || "FlightGlobe Airways",
        from: selectedFlight?.origin?.iata || selectedFlight?.origin?.code || "JFK",
        to: selectedFlight?.destination?.iata || selectedFlight?.destination?.code || "LHR",
        dep: selectedFlight?.dep || "08:30",
        arr: selectedFlight?.arr || "17:45",
        dur: selectedFlight?.dur || "7h 15m",
        plane: selectedFlight?.plane || "Boeing 787-9 Dreamliner",
        price: displayedPrice,
        currency,
        currencySymbol: symbol,
        cabinClass: isBusiness ? "Business" : "Economy",
      },
      seat: selectedSeat,
      totalPrice: displayedPrice,
    });
  }

  const seatAttrs = isBusiness
    ? { pitch: "78\" Lie-Flat", power: "USB-A + USB-C + AC", view: "Direct Aisle Access", wifi: "Starlink Priority" }
    : { pitch: "32\" Standard", power: "USB-C", view: selectedSeat?.[1] === "A" || selectedSeat?.[1] === "F" ? "Window" : "Middle/Aisle", wifi: "Starlink Standard" };

  return (
    <div className="flex flex-col h-full">
      {/* ── Header: Flight + Live Price Ticker ─────────────────────────── */}
      <div className="flex-shrink-0 pb-4">
        <div className="mono text-[10px] tracking-widest mb-1 text-[#86868b]">
          KINETIC SEAT SELECTION // {selectedFlight?.callsign || "FLIGHT-OS"}
        </div>
        <div className="flex items-baseline gap-3">
          <div
            className="mono font-bold leading-none text-[#f5f5f7]"
            style={{ fontSize: "38px" }}
          >
            {symbol}{displayedPrice.toLocaleString()}
          </div>
          <div>
            <div className="mono text-[11px] font-semibold" style={{ color: isBusiness ? "#ff9f0a" : "#2997ff" }}>
              {isBusiness ? "BUSINESS CLASS SUITE" : "ECONOMY CLASS"}
            </div>
            <div className="mono text-[10px] text-[#86868b]">
              SEAT {selectedSeat} · {seatAttrs.pitch} PITCH
            </div>
          </div>
        </div>
      </div>

      {/* ── Cabin Cross-Section ────────────────────────────────────────── */}
      <div
        className="flex-1 rounded-2xl p-4 overflow-y-auto no-scrollbar min-h-0 relative"
        style={{
          background: "rgba(22, 22, 24, 0.75)",
          border: "1px solid rgba(255,255,255,0.08)",
        }}
      >
        {/* Ambient glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-16 pointer-events-none"
          style={{ background: "radial-gradient(ellipse, rgba(41,151,255,0.05) 0%, transparent 70%)" }} />

        {/* Front marker */}
        <div className="flex items-center gap-3 mb-4">
          <div className="flex-1 h-px" style={{ background: "rgba(255,255,255,0.08)" }} />
          <span className="mono text-[9px] tracking-widest text-[#86868b]">▲ FORWARD CABIN</span>
          <div className="flex-1 h-px" style={{ background: "rgba(255,255,255,0.08)" }} />
        </div>

        {/* Business / First class */}
        <div className="mb-5">
          <div className="flex items-center gap-2 mb-2">
            <div className="h-px flex-1" style={{ background: "rgba(255,159,10,0.25)" }} />
            <span className="mono text-[9px] font-semibold tracking-widest text-[#ff9f0a]">
              ✦ BUSINESS CLASS
            </span>
            <div className="h-px flex-1" style={{ background: "rgba(255,159,10,0.25)" }} />
          </div>

          <div className="space-y-2 max-w-[280px] mx-auto">
            {[["1A", "1B", "1C", "1D"], ["2A", "2B", "2C", "2D"]].map((row, rIdx) => (
              <div key={`biz-row-${rIdx}`} className="flex items-center justify-between gap-3">
                {/* Left Side (A, B) */}
                <div className="flex items-center gap-2">
                  {row.slice(0, 2).map((code) => {
                    const isOcc = OCCUPIED.has(code);
                    const isSel = selectedSeat === code;
                    return (
                      <div key={code} className="relative flex justify-center">
                        <button
                          type="button"
                          disabled={isOcc}
                          onClick={() => handleSeat(code)}
                          className={`w-10 h-10 rounded-xl mono text-[10px] font-bold relative z-10 transition-all ${
                            isOcc ? "seat-occupied cursor-not-allowed" :
                            isSel ? "seat-business-selected" : "seat-business"
                          }`}
                          title={`${code} Business Seat`}
                        >
                          {isOcc ? "—" : code}
                        </button>
                        {isSel && !isOcc && (
                          <div className="absolute inset-0 -m-1.5 rounded-2xl border-2 pointer-events-none seat-active-ring"
                            style={{ borderColor: "#ff9f0a" }} />
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Center Aisle Indicator */}
                <span className="mono text-[8px] tracking-widest text-[#86868b] select-none">
                  AISLE
                </span>

                {/* Right Side (C, D) */}
                <div className="flex items-center gap-2">
                  {row.slice(2, 4).map((code) => {
                    const isOcc = OCCUPIED.has(code);
                    const isSel = selectedSeat === code;
                    return (
                      <div key={code} className="relative flex justify-center">
                        <button
                          type="button"
                          disabled={isOcc}
                          onClick={() => handleSeat(code)}
                          className={`w-10 h-10 rounded-xl mono text-[10px] font-bold relative z-10 transition-all ${
                            isOcc ? "seat-occupied cursor-not-allowed" :
                            isSel ? "seat-business-selected" : "seat-business"
                          }`}
                          title={`${code} Business Seat`}
                        >
                          {isOcc ? "—" : code}
                        </button>
                        {isSel && !isOcc && (
                          <div className="absolute inset-0 -m-1.5 rounded-2xl border-2 pointer-events-none seat-active-ring"
                            style={{ borderColor: "#ff9f0a" }} />
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Galley divider */}
        <div className="flex items-center gap-3 mb-4">
          <div className="flex-1 h-px" style={{ background: "rgba(255,255,255,0.08)" }} />
          <span className="mono text-[9px] tracking-widest text-[#86868b]">— GALLEY & RESTROOMS —</span>
          <div className="flex-1 h-px" style={{ background: "rgba(255,255,255,0.08)" }} />
        </div>

        {/* Economy */}
        <div>
          <div className="flex items-center gap-2 mb-2">
            <div className="h-px flex-1" style={{ background: "rgba(255,255,255,0.08)" }} />
            <span className="mono text-[9px] font-semibold tracking-widest text-[#86868b]">
              ECONOMY CLASS — ROWS 3–8
            </span>
            <div className="h-px flex-1" style={{ background: "rgba(255,255,255,0.08)" }} />
          </div>

          {/* Column headers with aisle gap */}
          <div className="flex items-center justify-between max-w-[280px] mx-auto mb-1.5 px-1">
            <div className="flex items-center gap-1.5">
              {["A","B","C"].map((col) => (
                <span key={col} className="mono text-[8px] w-8 text-center text-[#86868b]">{col}</span>
              ))}
            </div>
            <span className="mono text-[7px] tracking-wider text-[#86868b]">AISLE</span>
            <div className="flex items-center gap-1.5">
              {["D","E","F"].map((col) => (
                <span key={col} className="mono text-[8px] w-8 text-center text-[#86868b]">{col}</span>
              ))}
            </div>
          </div>

          <div className="space-y-1.5 max-w-[280px] mx-auto">
            {SEATS.economy.map((row, rIdx) => {
              const leftSeats = row.slice(0, 3);
              const rightSeats = row.slice(3, 6);
              return (
                <div key={rIdx} className="flex items-center justify-between gap-1.5">
                  {/* Left 3 seats (A, B, C) */}
                  <div className="flex items-center gap-1.5">
                    {leftSeats.map((code) => {
                      const isOcc = OCCUPIED.has(code);
                      const isSel = selectedSeat === code;
                      return (
                        <div key={code} className="relative flex justify-center">
                          <button
                            type="button"
                            disabled={isOcc}
                            onClick={() => handleSeat(code)}
                            className={`w-8 h-8 rounded-lg mono text-[9px] font-bold relative z-10 transition-all ${
                              isOcc ? "seat-occupied cursor-not-allowed" :
                              isSel ? "seat-selected" : "seat-available"
                            }`}
                            title={`Seat ${code}`}
                          >
                            {isOcc ? "—" : isSel ? "✓" : code}
                          </button>
                          {isSel && !isOcc && (
                            <div className="absolute inset-0 -m-1 rounded-xl border-2 pointer-events-none seat-active-ring"
                              style={{ borderColor: "#2997ff" }} />
                          )}
                        </div>
                      );
                    })}
                  </div>

                  {/* Aisle Spacer with subtle floor light */}
                  <div className="w-4 flex items-center justify-center">
                    <span className="w-1 h-1 rounded-full bg-white/25" />
                  </div>

                  {/* Right 3 seats (D, E, F) */}
                  <div className="flex items-center gap-1.5">
                    {rightSeats.map((code) => {
                      const isOcc = OCCUPIED.has(code);
                      const isSel = selectedSeat === code;
                      return (
                        <div key={code} className="relative flex justify-center">
                          <button
                            type="button"
                            disabled={isOcc}
                            onClick={() => handleSeat(code)}
                            className={`w-8 h-8 rounded-lg mono text-[9px] font-bold relative z-10 transition-all ${
                              isOcc ? "seat-occupied cursor-not-allowed" :
                              isSel ? "seat-selected" : "seat-available"
                            }`}
                            title={`Seat ${code}`}
                          >
                            {isOcc ? "—" : isSel ? "✓" : code}
                          </button>
                          {isSel && !isOcc && (
                            <div className="absolute inset-0 -m-1 rounded-xl border-2 pointer-events-none seat-active-ring"
                              style={{ borderColor: "#2997ff" }} />
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* ── Seat Attribute Panel + CTA ──────────────────────────────────── */}
      <div className="flex-shrink-0 pt-3 space-y-3">
        {/* Attributes */}
        <div className="grid grid-cols-2 gap-2">
          {Object.entries(seatAttrs).map(([k, v]) => (
            <div key={k} className="flex items-center gap-2 px-3 py-2 rounded-xl"
              style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}>
              <div>
                <div className="mono text-[8px] tracking-widest text-[#86868b]">
                  {k.toUpperCase()}
                </div>
                <div className="mono text-[10px] font-semibold text-[#f5f5f7]">{v}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Trust line */}
        <div className="flex items-center justify-center gap-3">
          <ShieldCheck size={12} color="#30d158" />
          <span className="mono text-[9px] tracking-wider text-[#86868b]">
            256-BIT ENCRYPTED · IATA GDS · FREE 24H CANCELLATION
          </span>
        </div>

        {/* Confirm CTA */}
        <motion.button
          type="button"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleConfirm}
          className="btn-aurora w-full py-4 rounded-2xl flex items-center justify-center gap-2.5 cursor-pointer"
        >
          <Ticket size={17} />
          <span className="mono font-bold text-[13px] tracking-widest">
            CONFIRM SEAT {selectedSeat} — ${displayedPrice}
          </span>
          <ArrowRight size={16} />
        </motion.button>
      </div>
    </div>
  );
}
