import React, { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plane, Clock, ExternalLink, ChevronDown, Sparkles, Zap, Shield,
  Wifi, Coffee, Luggage, TrendingDown, Calendar
} from "lucide-react";
import { sound } from "../../utils/soundFx";

/* ── Currency Rate Map ───────────────────────────────────────────────── */
const CURRENCY_RATES = {
  INR: { symbol: "₹", rate: 1 },
  USD: { symbol: "$", rate: 0.012 },
  EUR: { symbol: "€", rate: 0.011 },
  GBP: { symbol: "£", rate: 0.0094 },
  AED: { symbol: "AED ", rate: 0.044 },
  SGD: { symbol: "S$", rate: 0.016 },
  JPY: { symbol: "¥", rate: 1.85 },
  AUD: { symbol: "A$", rate: 0.018 },
  CAD: { symbol: "CA$", rate: 0.016 },
  CHF: { symbol: "CHF ", rate: 0.011 },
};

export function formatPrice(inrAmount, currency = "INR") {
  const c = CURRENCY_RATES[currency] || CURRENCY_RATES.INR;
  const converted = Math.round(inrAmount * c.rate);
  return `${c.symbol}${converted.toLocaleString()}`;
}

/* ── Great-Circle Distance ───────────────────────────────────────────── */
function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
    Math.sin(dLon / 2) ** 2;
  return Math.round(R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)));
}

function formatFlightDuration(distanceKm) {
  const totalMinutes = Math.max(55, Math.round((distanceKm / 820) * 60 + 30));
  const hrs = Math.floor(totalMinutes / 60);
  const mins = totalMinutes % 60;
  return `${hrs}h ${mins}m`;
}

function calculateArrivalTime(depTime, distanceKm) {
  const [depH, depM] = depTime.split(":").map(Number);
  const totalMinutes = Math.max(55, Math.round((distanceKm / 820) * 60 + 30));
  const arrMinutesTotal = depH * 60 + depM + totalMinutes;
  const arrH = Math.floor(arrMinutesTotal / 60) % 24;
  const arrM = arrMinutesTotal % 60;
  return `${String(arrH).padStart(2, "0")}:${String(arrM).padStart(2, "0")}`;
}

const AIRLINE_TEMPLATES = [
  { name: "IndiGo",         codePrefix: "6E", tag: "Lowest Fare",      tagColor: "#F97316", plane: "Airbus A321neo",     baseRate: 4.1, rating: "4.8 ★", bag: "15 kg", wifi: "Complimentary", meal: "Light Snacks" },
  { name: "SpiceJet",       codePrefix: "SG", tag: "SpicMax Value",    tagColor: "#EF4444", plane: "Boeing 737 MAX 8",   baseRate: 3.9, rating: "4.6 ★", bag: "15 kg", wifi: "Spicenet Basic", meal: "Hot Meals Available" },
  { name: "Air India",      codePrefix: "AI", tag: "Non-Stop Flag",    tagColor: "#06B6D4", plane: "Boeing 787-9",       baseRate: 4.7, rating: "4.7 ★", bag: "25 kg", wifi: "High-Speed",    meal: "Full Gourmet" },
  { name: "Emirates",       codePrefix: "EK", tag: "Luxury Suite",     tagColor: "#8B5CF6", plane: "Airbus A380-800",   baseRate: 6.8, rating: "4.9 ★", bag: "35 kg", wifi: "Ultra-Fast",    meal: "Chef's Menu" },
  { name: "Singapore Air",  codePrefix: "SQ", tag: "Top Rated",        tagColor: "#10B981", plane: "Airbus A350-900",   baseRate: 6.3, rating: "4.9 ★", bag: "30 kg", wifi: "Starlink",      meal: "Multi-Course" },
  { name: "British Airways",codePrefix: "BA", tag: "Direct Royal",     tagColor: "#3B82F6", plane: "Boeing 777-300ER",  baseRate: 5.8, rating: "4.7 ★", bag: "23 kg", wifi: "Available",     meal: "Full Bar & Meal" },
];

/* ── Individual Flight Card ─────────────────────────────────────────── */
function FlightCard({ flight, index, onSelect, currency = "INR" }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -3 }}
      transition={{ type: "spring", stiffness: 260, damping: 22, delay: index * 0.06 }}
      className="glass-card glass-interactive-cyan rounded-2xl p-5 border border-white/10 hover:border-fuchsia-400/50 shadow-xl transition-all duration-200 relative overflow-hidden"
    >
      {/* ── Top row: tag + airline name + code ── */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <span
            className="text-xs font-extrabold px-3 py-1 rounded-full mono uppercase tracking-wider"
            style={{
              background: `${flight.tagColor}22`,
              color: flight.tagColor,
              border: `1px solid ${flight.tagColor}55`,
            }}
          >
            {flight.tag}
          </span>
          <span className="text-sm font-bold text-[#F8FAFC]">{flight.airline}</span>
        </div>
        <span className="mono text-xs font-semibold text-[#64748B] tracking-widest">
          {flight.code}
        </span>
      </div>

      {/* ── Main row: times + route line + price ── */}
      <div className="flex items-center gap-4">

        {/* Departure */}
        <div className="text-left min-w-[56px]">
          <div className="text-3xl font-black mono tracking-tight text-[#F8FAFC] leading-none">
            {flight.dep}
          </div>
          <div className="text-[13px] font-bold mono mt-1.5 text-fuchsia-400 tracking-wide">
            {flight.from}
          </div>
        </div>

        {/* Flight Path Graphic */}
        <div className="flex-1 flex flex-col items-center gap-1">
          <div className="text-xs font-semibold mono flex items-center gap-1.5 text-[#94A3B8]">
            <Clock size={10} />
            {flight.dur}
          </div>
          <div className="w-full flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full bg-fuchsia-400/80 flex-shrink-0" />
            <div className="flex-1 h-px bg-gradient-to-r from-cyan-400 via-indigo-400 to-indigo-500" />
            <Plane size={13} className="text-fuchsia-400 flex-shrink-0" />
            <div className="flex-1 h-px bg-gradient-to-r from-indigo-500 via-indigo-400 to-cyan-400" />
            <div className="w-2 h-2 rounded-full bg-indigo-500/80 flex-shrink-0" />
          </div>
          <div className="text-xs font-bold text-emerald-400 flex items-center gap-1">
            ✦ Non-Stop · {flight.distanceKm.toLocaleString()} km
          </div>
        </div>

        {/* Arrival */}
        <div className="text-right min-w-[56px]">
          <div className="text-3xl font-black mono tracking-tight text-[#F8FAFC] leading-none">
            {flight.arr}
          </div>
          <div className="text-[13px] font-bold mono mt-1.5 text-fuchsia-300 tracking-wide">
            {flight.to}
          </div>
        </div>

        {/* Divider */}
        <div className="w-px h-14 bg-white/8 flex-shrink-0 hidden sm:block" />

        {/* Price + CTA */}
        <div className="flex flex-col items-end gap-2.5 flex-shrink-0 min-w-[110px]">
          <div>
            <div className="text-2xl font-black mono text-[#F8FAFC] leading-none">
              {formatPrice(flight.price, currency)}
            </div>
            <div className="text-xs text-[#94A3B8] mono mt-0.5 text-right">
              incl. all taxes
            </div>
          </div>
          <motion.button
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.96 }}
            onClick={() => { sound.playSeatSelect(); onSelect(flight); }}
            className="btn-aurora flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-[13px] cursor-pointer"
          >
            Select Seat <ExternalLink size={12} />
          </motion.button>
        </div>
      </div>

      {/* ── Expand toggle ── */}
      <button
        type="button"
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-center gap-1.5 mt-4 pt-3 text-[13px] font-semibold text-slate-400 hover:text-fuchsia-300 transition-colors cursor-pointer border-t border-white/5"
      >
        <span>{expanded ? "Hide Details" : "Aircraft Specs & Amenities"}</span>
        <ChevronDown
          size={13}
          className={`transition-transform duration-200 ${expanded ? "rotate-180" : ""}`}
        />
      </button>

      {/* ── Expandable amenities ── */}
      <AnimatePresence initial={false}>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.22, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-3 bg-white/4 p-4 rounded-xl border border-white/6">
              {[
                { icon: Plane,   label: "Aircraft",  value: flight.plane },
                { icon: Luggage, label: "Baggage",   value: flight.bag   },
                { icon: Wifi,    label: "Wi-Fi",     value: flight.wifi  },
                { icon: Coffee,  label: "Meal",      value: flight.meal  },
              ].map(({ icon: Icon, label, value }) => (
                <div key={label}>
                  <div className="text-xs uppercase tracking-widest mono text-slate-400 flex items-center gap-1 mb-1">
                    <Icon size={9} className="text-fuchsia-400" />
                    {label}
                  </div>
                  <div className="text-xs font-bold text-white/90 truncate">{value}</div>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

/* ── 7-Day Fare Matrix Bar ───────────────────────────────────────────── */
function FareMatrixBar({ basePrice, currency, onSelectDate }) {
  const days = useMemo(() => {
    const arr = [];
    const date = new Date();
    const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    for (let i = 0; i < 7; i++) {
      const d = new Date(date);
      d.setDate(d.getDate() + i + 1);
      const mult = [1.08, 0.94, 0.88, 0.92, 1.15, 1.22, 1.10][d.getDay()];
      const price = Math.round(basePrice * mult);
      arr.push({
        day: dayNames[d.getDay()],
        dateStr: `${d.getDate()} ${d.toLocaleString("default", { month: "short" })}`,
        price,
        isLowest: mult <= 0.9,
      });
    }
    return arr;
  }, [basePrice]);

  return (
    <div className="glass rounded-2xl border border-white/10 p-4 mb-1 shadow-lg">
      <div className="flex items-center justify-between mb-3">
        <span className="flex items-center gap-2 text-[13px] font-bold mono text-fuchsia-300">
          <TrendingDown size={13} />
          7-Day Lowest Fare Forecast
        </span>
        <span className="text-xs text-emerald-400 font-semibold">
          🟢 Midweek Lowest
        </span>
      </div>

      <div className="grid grid-cols-7 gap-2">
        {days.map((item, idx) => (
          <button
            key={idx}
            type="button"
            onClick={() => { sound.playClick(); onSelectDate?.(item); }}
            className={`p-2 rounded-xl text-center transition-all cursor-pointer ${
              item.isLowest
                ? "bg-emerald-500/15 border border-emerald-400/35 text-emerald-300"
                : "bg-white/4 hover:bg-white/8 text-slate-300 border border-white/6"
            }`}
          >
            <div className="text-xs font-bold mb-0.5">{item.day}</div>
            <div className="text-[8px] mono text-slate-400">{item.dateStr}</div>
            <div className="text-xs font-black mono mt-1">{formatPrice(item.price, currency)}</div>
          </button>
        ))}
      </div>
    </div>
  );
}

/* ── Main Departure Cards Hub ────────────────────────────────────────── */
export default function DepartureCards({ origin, dest, onSelect, currency = "INR" }) {
  const [filter, setFilter] = useState("all");

  const flights = useMemo(() => {
    if (!origin || !dest) return [];
    const distance = calculateDistance(origin.lat, origin.lon, dest.lat, dest.lon);
    const duration = formatFlightDuration(distance);
    const depTimes = ["06:15", "09:40", "13:15", "17:50", "22:10"];

    return AIRLINE_TEMPLATES.map((tmpl, idx) => {
      const dep = depTimes[idx % depTimes.length];
      const arr = calculateArrivalTime(dep, distance);
      const price = Math.round(Math.max(2800, distance * tmpl.baseRate + idx * 650));
      return {
        id: idx + 1,
        airline: tmpl.name,
        code: `${tmpl.codePrefix}-${Math.floor(200 + Math.random() * 700)}`,
        from: origin.code,
        to: dest.code,
        dep, arr,
        dur: duration,
        distanceKm: distance,
        price,
        tag: tmpl.tag,
        tagColor: tmpl.tagColor,
        plane: tmpl.plane,
        rating: tmpl.rating,
        bag: tmpl.bag,
        wifi: tmpl.wifi,
        meal: tmpl.meal,
      };
    });
  }, [origin?.code, dest?.code]);

  const filteredFlights = useMemo(() => {
    if (filter === "cheapest") return [...flights].sort((a, b) => a.price - b.price);
    if (filter === "luxury")   return [...flights].filter(f => f.price > 8000 || f.tag.includes("Luxury") || f.tag.includes("Top"));
    return flights;
  }, [flights, filter]);

  const basePrice = flights[0]?.price || 4500;

  return (
    <div className="flex flex-col gap-4 h-full overflow-hidden">
      {/* 7-Day Forecast */}
      <FareMatrixBar basePrice={basePrice} currency={currency} />

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 flex-shrink-0">
        {[
          { id: "all",      label: "All Flights",    icon: Sparkles },
          { id: "cheapest", label: "Lowest Price",   icon: Zap      },
          { id: "luxury",   label: "Premium",        icon: Shield   },
        ].map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => { sound.playClick(); setFilter(id); }}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-[12px] font-bold transition-all cursor-pointer whitespace-nowrap ${
              filter === id
                ? "bg-fuchsia-500/15 text-fuchsia-300 border border-fuchsia-400/35 shadow-sm"
                : "glass text-slate-400 hover:text-white hover:bg-white/8"
            }`}
          >
            <Icon size={12} />
            {label}
          </button>
        ))}
      </div>

      {/* Flight Cards */}
      <div className="flex-1 overflow-y-auto space-y-3 pr-1 pb-6">
        {filteredFlights.map((f, i) => (
          <FlightCard
            key={f.id}
            flight={f}
            index={i}
            onSelect={onSelect}
            currency={currency}
          />
        ))}
      </div>
    </div>
  );
}
