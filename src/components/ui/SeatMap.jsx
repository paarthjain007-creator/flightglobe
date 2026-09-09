import React, { useState } from "react";
import { motion } from "framer-motion";
import { Sparkles, Check, Armchair, ShieldCheck } from "lucide-react";
import { formatPrice } from "./DepartureCards";
import { sound } from "../../utils/soundFx";

const ROWS  = 6;
const COLS  = 6;
const LABELS = ["A","B","C","D","E","F"];

function getSeatCode(row, col) {
  return `${row + 1}${LABELS[col]}`;
}

function Seat({ row, col, status, selected, onClick }) {
  const [ringing, setRinging] = useState(false);
  const seatCode = getSeatCode(row, col);

  const handleClick = () => {
    if (status === "taken") return;
    sound.playSeatSelect();
    setRinging(true);
    setTimeout(() => setRinging(false), 650);
    onClick(seatCode, row, col);
  };

  const isSelected = selected;
  const isTaken    = status === "taken";
  const isBusiness = row < 2;

  return (
    <motion.button
      type="button"
      onClick={handleClick}
      whileHover={!isTaken ? { scale: 1.15, y: -3 } : {}}
      whileTap={!isTaken   ? { scale: 0.9 } : {}}
      transition={{ type: "spring", stiffness: 350, damping: 20 }}
      disabled={isTaken}
      className={`relative w-8 h-8 sm:w-9 sm:h-9 rounded-xl font-mono text-xs font-bold cursor-pointer transition-all flex items-center justify-center ${ringing ? "seat-ring" : ""}`}
      style={{
        background: isTaken
          ? "rgba(255,255,255,0.03)"
          : isSelected
          ? "linear-gradient(135deg, #4F46E5, #06B6D4)"
          : isBusiness
          ? "rgba(79,70,229,0.22)"
          : "rgba(255,255,255,0.06)",
        border: isTaken
          ? "1px solid rgba(255,255,255,0.05)"
          : isSelected
          ? "1px solid #06B6D4"
          : isBusiness
          ? "1px solid rgba(79,70,229,0.5)"
          : "1px solid rgba(255,255,255,0.12)",
        color: isTaken   ? "#334155"
             : isSelected ? "#ffffff"
             : isBusiness  ? "#A5B4FC"
             : "var(--text)",
        cursor: isTaken ? "not-allowed" : "pointer",
        boxShadow: isSelected ? "0 0 20px rgba(6,182,212,0.6)" : "none",
      }}
      title={isTaken ? `Seat ${seatCode} (Occupied)` : `Seat ${seatCode} (${isBusiness ? "Business Flatbed" : "Economy"})`}
    >
      {LABELS[col]}

      {/* 3D Depth bar */}
      {!isTaken && (
        <span
          className="absolute bottom-0 inset-x-0 h-1 rounded-b-xl"
          style={{
            background: isSelected
              ? "rgba(6,182,212,0.6)"
              : isBusiness
              ? "rgba(79,70,229,0.3)"
              : "rgba(255,255,255,0.08)",
          }}
        />
      )}
    </motion.button>
  );
}

export default function SeatMap({
  flight,
  onConfirm,
  currency = "INR"
}) {
  const [taken] = useState(() => new Set(["1B", "1E", "2A", "3C", "3D", "4B", "5F", "6A"]));
  const [selectedSeat, setSelectedSeat] = useState("2B");

  const toggle = (seatCode) => {
    setSelectedSeat(selectedSeat === seatCode ? null : seatCode);
  };

  const isBusinessSelected = selectedSeat && (selectedSeat.startsWith("1") || selectedSeat.startsWith("2"));
  const seatUpgradePrice = isBusinessSelected ? 2400 : 0;
  const totalPrice = (flight?.price || 5000) + seatUpgradePrice;

  return (
    <div className="flex flex-col h-full justify-between gap-3">
      {/* Header */}
      <div>
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base sm:text-lg font-black text-white flex items-center gap-2">
              <Sparkles size={16} className="text-cyan-400" />
              Kinetic Seat Selection
            </h3>
            <p className="text-xs text-slate-400 mono mt-0.5">
              {flight ? `${flight.code} · ${flight.from} → ${flight.to}` : "Choose your seat"}
            </p>
          </div>

          {selectedSeat && (
            <div className="px-3 py-1 rounded-xl bg-cyan-500/20 border border-cyan-400/30 text-cyan-300 mono text-xs font-bold shadow-md">
              Seat {selectedSeat} ({isBusinessSelected ? "Business" : "Economy"})
            </div>
          )}
        </div>

        {/* Business Cabin Header */}
        <div className="flex items-center gap-3 my-2.5">
          <div className="flex-1 h-px bg-gradient-to-r from-indigo-500/50 to-transparent" />
          <span className="text-[10px] font-bold uppercase tracking-widest text-indigo-400 mono">
            Business Class Flatbed (Rows 1–2)
          </span>
          <div className="flex-1 h-px bg-gradient-to-l from-indigo-500/50 to-transparent" />
        </div>

        {/* Seat Grid */}
        <div className="flex flex-col items-center gap-1.5 sm:gap-2">
          {Array.from({ length: ROWS }).map((_, r) => {
            const isDivider = r === 2;

            return (
              <React.Fragment key={r}>
                {isDivider && (
                  <div className="w-full flex items-center gap-3 my-1.5">
                    <div className="flex-1 h-px bg-gradient-to-r from-cyan-500/50 to-transparent" />
                    <span className="text-[10px] font-bold uppercase tracking-widest text-cyan-400 mono">
                      Economy Class (Rows 3–6)
                    </span>
                    <div className="flex-1 h-px bg-gradient-to-l from-cyan-500/50 to-transparent" />
                  </div>
                )}

                <div className="flex items-center gap-1.5 sm:gap-2">
                  <span className="text-[10px] mono font-bold text-slate-500 w-3 text-right">
                    {r + 1}
                  </span>

                  {/* Left Block (A B C) */}
                  <div className="flex gap-1 sm:gap-1.5">
                    {[0, 1, 2].map((c) => {
                      const code = getSeatCode(r, c);
                      return (
                        <Seat
                          key={code}
                          row={r}
                          col={c}
                          status={taken.has(code) ? "taken" : "free"}
                          selected={selectedSeat === code}
                          onClick={toggle}
                        />
                      );
                    })}
                  </div>

                  {/* Aisle */}
                  <div className="w-3 sm:w-5 text-center text-[9px] mono text-slate-600">|</div>

                  {/* Right Block (D E F) */}
                  <div className="flex gap-1 sm:gap-1.5">
                    {[3, 4, 5].map((c) => {
                      const code = getSeatCode(r, c);
                      return (
                        <Seat
                          key={code}
                          row={r}
                          col={c}
                          status={taken.has(code) ? "taken" : "free"}
                          selected={selectedSeat === code}
                          onClick={toggle}
                        />
                      );
                    })}
                  </div>
                </div>
              </React.Fragment>
            );
          })}
        </div>

        {/* Legend */}
        <div className="flex items-center justify-center gap-3 mt-3 text-[10px] mono text-slate-400 flex-wrap">
          <div className="flex items-center gap-1">
            <span className="w-3 h-3 rounded-lg bg-white/5 border border-white/15" /> Available
          </div>
          <div className="flex items-center gap-1">
            <span className="w-3 h-3 rounded-lg bg-indigo-500/20 border border-indigo-400/40" /> Business
          </div>
          <div className="flex items-center gap-1">
            <span className="w-3 h-3 rounded-lg bg-gradient-to-br from-indigo-500 to-cyan-500" /> Selected
          </div>
          <div className="flex items-center gap-1">
            <span className="w-3 h-3 rounded-lg bg-white/5 border border-white/5 opacity-40" /> Taken
          </div>
        </div>
      </div>

      {/* Confirmation Box */}
      <div className="pt-3 border-t border-white/10 space-y-2.5">
        <div className="flex items-center justify-between text-xs mono">
          <span className="text-slate-400">
            Assigned Seat: <strong className="text-cyan-300">{selectedSeat || "None"}</strong>
          </span>
          <span className="text-white font-black text-sm">
            Total: {formatPrice(totalPrice, currency)}
          </span>
        </div>

        <motion.button
          type="button"
          disabled={!selectedSeat || !flight}
          whileHover={selectedSeat && flight ? { scale: 1.02 } : {}}
          whileTap={selectedSeat && flight ? { scale: 0.98 } : {}}
          onClick={() => {
            sound.playBookingChime();
            selectedSeat && flight && onConfirm?.({ flight, seat: selectedSeat, totalPrice });
          }}
          className="w-full py-3 rounded-2xl font-bold text-xs text-white cursor-pointer flex items-center justify-center gap-2 shadow-xl"
          style={{
            background: selectedSeat && flight
              ? "linear-gradient(135deg, #4F46E5, #06B6D4)"
              : "rgba(255,255,255,0.06)",
            boxShadow: selectedSeat && flight ? "0 0 24px rgba(6,182,212,0.4)" : "none",
            cursor: selectedSeat && flight ? "pointer" : "not-allowed",
          }}
        >
          {selectedSeat ? (
            <>
              <Check size={15} /> Confirm Reservation for Seat {selectedSeat}
            </>
          ) : (
            "Select an open seat to proceed"
          )}
        </motion.button>
      </div>
    </div>
  );
}
