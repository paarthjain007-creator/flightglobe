import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Ticket, ArrowRight, ShieldCheck, Star, Coffee, Briefcase } from "lucide-react";
import { sound } from "../../utils/soundFx";
import { CURRENCY_MAP } from "../../services/api/amadeusService";

const CABIN_CLASSES = [
  {
    id: "economy",
    name: "Economy",
    icon: Coffee,
    surcharge: 0,
    features: ["Standard legroom", "1 carry-on", "Paid meals"],
    color: "#00F2FE"
  },
  {
    id: "premium",
    name: "Premium Economy",
    icon: Star,
    surcharge: 0.3,
    features: ["Extra legroom", "Priority boarding", "Free drinks"],
    color: "#7928CA"
  },
  {
    id: "business",
    name: "Business Class",
    icon: Briefcase,
    surcharge: 0.75,
    features: ["Lie-flat seats", "Lounge access", "Gourmet dining"],
    color: "#FF0080"
  }
];

export default function KineticSeatCanvas({
  selectedFlight,
  onConfirmBooking,
  currency = "USD",
}) {
  const [selectedClass, setSelectedClass] = useState(CABIN_CLASSES[0]);
  const [displayedPrice, setDisplayedPrice] = useState(() => selectedFlight?.price || 120);

  const symbol = selectedFlight?.currencySymbol || CURRENCY_MAP[currency]?.symbol || "$";
  const basePrice = selectedFlight?.price || 120;
  const targetPrice = Math.round(basePrice * (1 + selectedClass.surcharge));

  // Sync displayed price on flight switch
  useEffect(() => {
    if (selectedFlight?.price) {
      setDisplayedPrice(targetPrice);
    }
  }, [selectedFlight?.id, selectedFlight?.price, targetPrice]);

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
        cabinClass: selectedClass.name,
      },
      seat: "Auto-Assigned", // Removing fake specific seat
      totalPrice: displayedPrice,
    });
  }

  return (
    <div className="flex flex-col h-full space-y-6">
      <div className="flex-shrink-0 text-center">
        <h3 className="text-xl font-bold text-white mb-2">Select Cabin Class</h3>
        <p className="text-xs text-slate-400">Exact seats are assigned securely at checkout via GDS.</p>
      </div>

      <div className="flex-1 flex flex-col gap-4 overflow-y-auto no-scrollbar">
        {CABIN_CLASSES.map((c) => {
          const isSelected = selectedClass.id === c.id;
          const Icon = c.icon;
          return (
            <motion.div
              key={c.id}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => { sound.playClick(); setSelectedClass(c); }}
              className={`relative p-4 rounded-2xl cursor-pointer transition-all ${
                isSelected 
                  ? "bg-white/10 border-white/30" 
                  : "bg-white/5 border-white/5 hover:bg-white/10"
              }`}
              style={{
                borderWidth: 1,
                boxShadow: isSelected ? `0 0 20px ${c.color}30` : 'none'
              }}
            >
              <div className="flex justify-between items-center mb-3">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl" style={{ background: `${c.color}20`, color: c.color }}>
                    <Icon size={20} />
                  </div>
                  <span className="font-bold text-slate-200">{c.name}</span>
                </div>
                <span className="font-mono font-bold" style={{ color: c.color }}>
                  {symbol}{Math.round(basePrice * (1 + c.surcharge))}
                </span>
              </div>
              <ul className="text-xs text-slate-400 space-y-1">
                {c.features.map(f => (
                  <li key={f} className="flex items-center gap-2">
                    <div className="w-1 h-1 rounded-full bg-slate-500" />
                    {f}
                  </li>
                ))}
              </ul>
            </motion.div>
          );
        })}
      </div>

      <div className="flex-shrink-0 pt-4 border-t border-white/10 space-y-4">
        <div className="flex items-center justify-center gap-3">
          <ShieldCheck size={12} color="#30d158" />
          <span className="mono text-xs tracking-wider text-[#94A3B8]">
            SECURE CHECKOUT A SEATS ASSIGNED POST-PAYMENT
          </span>
        </div>

        <motion.button
          type="button"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleConfirm}
          className="btn-aurora w-full py-4 rounded-2xl flex items-center justify-center gap-2.5 cursor-pointer"
        >
          <Ticket size={17} />
          <span className="mono font-bold text-sm tracking-widest">
            CONTINUE TO BOOKING ?" {symbol}{displayedPrice}
          </span>
          <ArrowRight size={16} />
        </motion.button>
      </div>
    </div>
  );
}
