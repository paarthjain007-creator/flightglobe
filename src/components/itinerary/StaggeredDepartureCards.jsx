import React, { useState, useMemo, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plane, Clock, Wifi, Luggage, Leaf, ArrowRight, ChevronDown,
  Zap, Star, DollarSign, ShieldCheck, Wind
} from "lucide-react";
import { sound } from "../../utils/soundFx";
import {
  haversineDistance,
  estimateFlightTime,
  estimateTicketCost,
  formatDistance,
  formatFlightTime,
} from "../../utils/flightCalc";
import { CURRENCY_MAP, REAL_AIRLINE_BRANDS } from "../../services/api/amadeusService";

export const SAMPLE_ITINERARIES = [
  {
    id: "fl-1",
    airline: "IndiGo",
    callsign: "6E-5312",
    dep: "06:15", arr: "08:35", dur: "2h 20m",
    price: 68,
    currencySymbol: "$",
    plane: "Airbus A321neo",
    depTerm: "T1", arrTerm: "T2",
    wifi: "Fast Onboard",
    carbonOffset: "-15% EcoFlight",
    bag: "1×15 kg",
    seatPitch: "30\"–32\" Standard",
    isCheapest: true, isDirect: true,
  },
  {
    id: "fl-2",
    airline: "SpiceJet",
    callsign: "SG-8169",
    dep: "09:40", arr: "12:05", dur: "2h 25m",
    price: 64,
    currencySymbol: "$",
    plane: "Boeing 737 MAX 8",
    depTerm: "T3", arrTerm: "T1",
    wifi: "Spicenet Entertainment",
    carbonOffset: "-14% CFM LEAP",
    bag: "1×15 kg",
    seatPitch: "30\"–34\" SpicMax",
    isBest: true, isDirect: true,
  },
  {
    id: "fl-3",
    airline: "Emirates",
    callsign: "EK-201",
    dep: "14:15", arr: "21:45", dur: "7h 30m",
    price: 185,
    currencySymbol: "$",
    plane: "Airbus A380-800",
    depTerm: "T3", arrTerm: "T2",
    wifi: "Onboard Ultra-Fast",
    carbonOffset: "-14% CO₂",
    bag: "2×32 kg",
    seatPitch: "40\"–82\" Suite",
    isDirect: true, isPremium: true,
  },
  {
    id: "fl-4",
    airline: "Air India",
    callsign: "AI-805",
    dep: "18:40", arr: "06:55", dur: "7h 15m",
    price: 110,
    currencySymbol: "$",
    plane: "Airbus A350-900",
    depTerm: "T2", arrTerm: "T4",
    wifi: "Starlink Wi-Fi",
    carbonOffset: "-19% NextGen",
    bag: "2×25 kg",
    seatPitch: "34\"–76\" Ergonomic",
    isDirect: true,
  },
];

/**
 * Dynamically computes real route-specific flights, realistic airlines, aircraft,
 * flight times, and pricing in the active currency.
 */
export function generateRouteFlights(origin, destination, currency = "USD") {
  const origCode = origin?.iata || origin?.code || "JFK";
  const origCity = origin?.city || origin?.name || "New York";
  const origCountry = origin?.country || "United States";
  const origLat = origin?.lat ?? 40.64;
  const origLng = origin?.lng ?? origin?.lon ?? -73.77;

  const destCode = destination?.iata || destination?.code || "LHR";
  const destCity = destination?.city || destination?.name || "London";
  const destCountry = destination?.country || "United Kingdom";
  const destLat = destination?.lat ?? 51.47;
  const destLng = destination?.lng ?? destination?.lon ?? -0.45;

  const distKm = Math.max(120, haversineDistance(origLat, origLng, destLat, destLng));
  const flightTime = estimateFlightTime(distKm);
  const durFormatted = formatFlightTime(flightTime.hours, flightTime.minutes);

  const currConf = CURRENCY_MAP[currency] || CURRENCY_MAP.USD;
  const ticketCost = estimateTicketCost(distKm);
  const basePrice = Math.round(ticketCost.economy * currConf.rate);

  // Airline fleet selection matching corridor
  const allBrands = Object.entries(REAL_AIRLINE_BRANDS).map(([code, d]) => ({ code, ...d }));
  const originHubAirlines = allBrands.filter((a) => a.hub === origCode || a.country === origCountry);
  const destHubAirlines = allBrands.filter((a) => a.hub === destCode || a.country === destCountry);
  
  // Combine all local/national carriers serving origin or destination
  const localAirlines = [...originHubAirlines, ...destHubAirlines].filter(
    (a, idx, self) => self.findIndex(s => s.code === a.code) === idx
  );
  const globalAirlines = allBrands.filter((a) => !localAirlines.some(loc => loc.code === a.code));

  const fleet = [];
  // Prioritize authentic local carriers (e.g. IndiGo, SpiceJet, Air India on Indian domestic/international routes)
  for (const loc of localAirlines) {
    if (fleet.length >= 4) break;
    fleet.push(loc);
  }
  for (const g of globalAirlines) {
    if (fleet.length >= 4) break;
    if (!fleet.some(f => f.code === g.code)) fleet.push(g);
  }
  while (fleet.length < 4) {
    fleet.push(allBrands[fleet.length % allBrands.length]);
  }

  function getAircraft(airlineCode, index, dist) {
    if (airlineCode === "6E") return ["Airbus A321neo", "Airbus A320neo", "Airbus A321neo", "Airbus A320neo"][index % 4];
    if (airlineCode === "SG") return ["Boeing 737 MAX 8", "Boeing 737-800", "Boeing 737 MAX 8", "Q400 NextGen"][index % 4];
    if (airlineCode === "QP") return "Boeing 737 MAX 8";
    if (airlineCode === "AI") return dist > 4000 ? "Airbus A350-900" : "Airbus A320neo";
    if (dist < 1800) {
      return ["Airbus A320neo", "Boeing 737 MAX 8", "Airbus A220-300", "Embraer E195-E2"][index % 4];
    }
    if (dist < 4500) {
      return ["Airbus A321neo LR", "Boeing 737-900ER", "Airbus A330-300", "Boeing 787-8"][index % 4];
    }
    return ["Boeing 787-9 Dreamliner", "Airbus A350-900", "Boeing 777-300ER", "Airbus A380-800"][index % 4];
  }

  const depSlots = [
    { hour: 7, minute: 30, tag: "BEST", priceMult: 1.0, isBest: true },
    { hour: 11, minute: 45, tag: "CHEAP", priceMult: 0.88, isCheapest: true },
    { hour: 15, minute: 20, tag: "PREMIUM", priceMult: 1.35, isPremium: true },
    { hour: 20, minute: 15, tag: "DIRECT", priceMult: 0.98, isDirect: true },
  ];

  return depSlots.map((slot, idx) => {
    const al = fleet[idx];
    const flightNum = 100 + ((origCode.charCodeAt(0) * 11 + destCode.charCodeAt(0) * 17 + idx * 43) % 890);
    const callsign = `${al.code}-${flightNum}`;

    const depH = String(slot.hour).padStart(2, "0");
    const depM = String(slot.minute).padStart(2, "0");
    const depStr = `${depH}:${depM}`;

    const totalArrMins = slot.hour * 60 + slot.minute + flightTime.hours * 60 + flightTime.minutes;
    const arrH = String(Math.floor((totalArrMins / 60) % 24)).padStart(2, "0");
    const arrM = String(totalArrMins % 60).padStart(2, "0");
    const arrStr = `${arrH}:${arrM}`;

    const price = Math.round(basePrice * slot.priceMult);
    const plane = getAircraft(al.code, idx, distKm);

    return {
      id: `fl-${origCode}-${destCode}-${idx}`,
      airline: al.name,
      airlineCode: al.code,
      logo: al.logo || "✈️",
      callsign,
      dep: depStr,
      arr: arrStr,
      dur: durFormatted,
      durationMinutes: flightTime.hours * 60 + flightTime.minutes,
      price,
      currencySymbol: currConf.symbol,
      currency,
      plane,
      depTerm: `T${((origCode.charCodeAt(0) + idx) % 4) + 1}`,
      arrTerm: `T${((destCode.charCodeAt(0) + idx) % 4) + 1}`,
      wifi: idx % 2 === 0 ? "Starlink Ultra-Fast" : "High-Speed Satellite",
      carbonOffset: `-${14 + idx * 2}% CO₂`,
      bag: al.baggage || "2×23 kg Included",
      seatPitch: slot.isPremium ? "40\"–82\" Suite" : "32\"–78\" Flatbed",
      isBest: !!slot.isBest,
      isCheapest: !!slot.isCheapest,
      isPremium: !!slot.isPremium,
      isDirect: true,
      origin: { code: origCode, iata: origCode, city: origCity, lat: origLat, lng: origLng },
      destination: { code: destCode, iata: destCode, city: destCity, lat: destLat, lng: destLng },
    };
  });
}

const FILTERS = [
  { id: "ALL",    label: "ALL FARES" },
  { id: "DIRECT", label: "DIRECT ONLY" },
  { id: "BEST",   label: "BEST VALUE" },
  { id: "CHEAP",  label: "LOWEST PRICE" },
];

// Animated flight path spline
function FlightSpline({ active }) {
  return (
    <div className="relative w-full flex items-center gap-1.5 py-1">
      <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: "#00F2FE", boxShadow: "0 0 8px #00F2FE" }} />
      <div className="relative flex-1 h-px overflow-hidden">
        <div className="absolute inset-0" style={{ background: "linear-gradient(90deg, #00F2FE, rgba(0,242,254,0.1))" }} />
        {active && (
          <div
            className="absolute top-0 h-px w-8 rounded-full"
            style={{
              background: "#00F2FE",
              animation: "shimmer 1.4s ease-in-out infinite",
              boxShadow: "0 0 6px #00F2FE",
            }}
          />
        )}
      </div>
      <Plane size={12} color="#00F2FE" className="-rotate-[10deg] flex-shrink-0" />
      <div className="relative flex-1 h-px overflow-hidden">
        <div className="absolute inset-0" style={{ background: "linear-gradient(90deg, rgba(0,242,254,0.1), #7928CA)" }} />
      </div>
      <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: "#7928CA", boxShadow: "0 0 8px #B800FF" }} />
    </div>
  );
}

export default function FlightStreamMatrix({
  origin,
  destination,
  selectedFlight,
  onSelectFlight,
  currency = "USD",
}) {
  const navigate = useNavigate();
  const [activeFilter, setActiveFilter] = useState("ALL");
  const [expandedId, setExpandedId] = useState(null);

  const origCode = origin?.code || origin?.iata || "JFK";
  const origCity = origin?.city || origin?.name || "New York";
  const destCode = destination?.code || destination?.iata || "LHR";
  const destCity = destination?.city || destination?.name || "London";

  const origLat = origin?.lat ?? 40.64;
  const origLng = origin?.lng ?? origin?.lon ?? -73.77;
  const destLat = destination?.lat ?? 51.47;
  const destLng = destination?.lng ?? destination?.lon ?? -0.45;

  const distKm = Math.max(120, haversineDistance(origLat, origLng, destLat, destLng));
  const totalKm = formatDistance(distKm).km + " km";
  const flightTime = estimateFlightTime(distKm);
  const avgDur = formatFlightTime(flightTime.hours, flightTime.minutes);

  const flights = useMemo(() => {
    return generateRouteFlights(origin, destination, currency);
  }, [origin, destination, currency]);

  const filtered = flights.filter((f) => {
    if (activeFilter === "DIRECT") return f.isDirect;
    if (activeFilter === "BEST")   return f.isBest;
    if (activeFilter === "CHEAP")  return f.isCheapest;
    return true;
  });

  return (
    <div
      className="flex flex-col h-full overflow-hidden rounded-3xl"
      style={{
        background: "rgba(13, 17, 27, 0.72)",
        backdropFilter: "blur(28px) saturate(180%)",
        WebkitBackdropFilter: "blur(28px) saturate(180%)",
        border: "1px solid rgba(255,255,255,0.07)",
        boxShadow: "inset 0 1px 1px rgba(255,255,255,0.12), 0 24px 64px rgba(0,0,0,0.5)",
      }}
    >
      {/* ── Header: Route Breadcrumb & GDS Engine Jump ──────────────── */}
      <div className="p-5 pb-3 flex-shrink-0">
        {/* Route header */}
        <div className="flex items-baseline gap-2 mb-1 flex-wrap">
          <span className="mono text-[22px] font-bold" style={{ color: "#00F2FE" }}>{origCode}</span>
          <ArrowRight size={16} color="#404660" />
          <span className="mono text-[22px] font-bold" style={{ color: "#B800FF" }}>{destCode}</span>
          <span className="mono text-[11px] ml-auto" style={{ color: "#404660" }}>
            {totalKm} · {avgDur} avg
          </span>
        </div>
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <p className="text-[11px]" style={{ color: "#7A85A0" }}>
            {origCity} → {destCity} · {filtered.length} verified offers
          </p>
          <button
            type="button"
            onClick={() => {
              sound.playClick();
              navigate(`/booking?from=${origCode}&to=${destCode}`);
            }}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-[10px] font-bold mono bg-cyan-500/15 text-cyan-300 border border-cyan-400/30 hover:bg-cyan-500/25 hover:border-cyan-300 transition-all cursor-pointer shadow-sm"
            title="Open live multi-carrier fares and 7-day matrix in GDS Booking Engine"
          >
            <Plane size={11} className="text-cyan-400" />
            <span>GDS ENGINE ↗</span>
          </button>
        </div>

        {/* Filter chips */}
        <div className="flex items-center gap-1.5 mt-3 overflow-x-auto no-scrollbar">
          {FILTERS.map((f) => (
            <button
              key={f.id}
              type="button"
              onClick={() => { sound.playClick(); setActiveFilter(f.id); }}
              className={`chip flex-shrink-0 ${activeFilter === f.id ? "chip-active" : ""}`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Divider */}
      <div className="mx-5 h-px" style={{ background: "rgba(255,255,255,0.05)" }} />

      {/* ── Flight Cards Stream ───────────────────────────────────────── */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2.5 no-scrollbar min-h-0">
        {filtered.map((flight, idx) => {
          const isSelected = selectedFlight?.id === flight.id || (!selectedFlight && idx === 0);
          const isExpanded = expandedId === flight.id;
          const isBiz = flight.isPremium;

          return (
            <motion.div
              key={flight.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.04, duration: 0.22 }}
            >
              <div
                onClick={() => { sound.playSeatSelect(); onSelectFlight(flight); }}
                style={{
                  background: isSelected
                    ? "linear-gradient(135deg, rgba(0,242,254,0.07) 0%, rgba(121,40,202,0.07) 100%)"
                    : "rgba(255,255,255,0.025)",
                  border: `1px solid ${isSelected ? "rgba(0,242,254,0.28)" : "rgba(255,255,255,0.06)"}`,
                  borderLeft: isSelected ? "3px solid #00F2FE" : "3px solid transparent",
                  boxShadow: isSelected ? "0 0 28px rgba(0,242,254,0.10)" : "none",
                  borderRadius: "16px",
                  cursor: "pointer",
                  transition: "all 0.22s cubic-bezier(0.16, 1, 0.3, 1)",
                }}
                className="p-4"
              >
                {/* Card row */}
                <div className="flex items-start gap-3">
                  {/* Left: Airline identity */}
                  <div className="flex flex-col gap-1 min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="mono text-[11px] font-bold tracking-widest" style={{ color: isSelected ? "#00F2FE" : "#E2B755" }}>
                        {flight.callsign}
                      </span>
                      <span className="text-[12px] font-semibold" style={{ color: "#E8EAF0" }}>
                        {flight.airline}
                      </span>
                      {flight.isBest && (
                        <span className="chip chip-active text-[9px] px-1.5 py-0.5">BEST VALUE</span>
                      )}
                      {flight.isCheapest && (
                        <span className="mono text-[9px] font-bold px-1.5 py-0.5 rounded" style={{ background: "rgba(0,255,163,0.15)", border: "1px solid rgba(0,255,163,0.3)", color: "#00FFA3" }}>
                          LOWEST FARE
                        </span>
                      )}
                      {flight.isPremium && (
                        <span className="mono text-[9px] font-bold px-1.5 py-0.5 rounded" style={{ background: "rgba(226,183,85,0.15)", border: "1px solid rgba(226,183,85,0.3)", color: "#E2B755" }}>
                          ✦ PREMIUM
                        </span>
                      )}
                    </div>

                    {/* Times */}
                    <div className="flex items-end gap-3 mt-1.5">
                      <div>
                        <div className="mono text-[22px] font-bold leading-none" style={{ color: "#E8EAF0" }}>{flight.dep}</div>
                        <div className="mono text-[10px] font-bold mt-0.5" style={{ color: "#00F2FE" }}>{origCode}</div>
                        <div className="text-[10px] mt-0.5" style={{ color: "#7A85A0" }}>T{flight.depTerm}</div>
                      </div>

                      <div className="flex-1 pb-4">
                        <FlightSpline active={isSelected} />
                        <div className="flex items-center justify-center gap-1 mt-0.5">
                          <Clock size={9} color="#7A85A0" />
                          <span className="mono text-[9px]" style={{ color: "#7A85A0" }}>{flight.dur}</span>
                          <span className="mono text-[9px]" style={{ color: "#00FFA3" }}>DIRECT</span>
                        </div>
                      </div>

                      <div className="text-right">
                        <div className="mono text-[22px] font-bold leading-none" style={{ color: "#E8EAF0" }}>{flight.arr}</div>
                        <div className="mono text-[10px] font-bold mt-0.5" style={{ color: "#B800FF" }}>{destCode}</div>
                        <div className="text-[10px] mt-0.5" style={{ color: "#7A85A0" }}>T{flight.arrTerm}</div>
                      </div>
                    </div>
                  </div>

                  {/* Right: Price & CTA */}
                  <div className="flex flex-col items-end gap-2 flex-shrink-0 pl-3 border-l" style={{ borderColor: "rgba(255,255,255,0.06)" }}>
                    <div className="text-right">
                      <div
                        className="mono text-[20px] font-bold"
                        style={{ color: flight.isCheapest ? "#00FFA3" : flight.isPremium ? "#E2B755" : "#E8EAF0" }}
                      >
                        {flight.currencySymbol || "$"}{flight.price.toLocaleString()}
                      </div>
                      <div className="mono text-[9px] mt-0.5" style={{ color: "#404660" }}>incl. taxes</div>
                    </div>

                    <button
                      type="button"
                      onClick={(e) => { e.stopPropagation(); sound.playSeatSelect(); onSelectFlight(flight); }}
                      className="btn-aurora flex items-center gap-1 px-3 py-1.5 rounded-xl text-[10px] font-bold"
                    >
                      <span>SELECT SEAT</span>
                      <ArrowRight size={11} />
                    </button>

                    {/* Expand toggle */}
                    <button
                      type="button"
                      onClick={(e) => { e.stopPropagation(); setExpandedId(isExpanded ? null : flight.id); }}
                      className="btn-ghost flex items-center gap-1 px-2 py-1 rounded-lg text-[9px] font-bold"
                    >
                      <span>DETAILS</span>
                      <ChevronDown size={10} style={{ transform: isExpanded ? "rotate(180deg)" : "none", transition: "0.2s" }} />
                    </button>
                  </div>
                </div>

                {/* Accordion: Expanded details */}
                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.22 }}
                      className="overflow-hidden"
                    >
                      <div
                        className="mt-3 pt-3 grid grid-cols-4 gap-2"
                        style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}
                      >
                        {[
                          { icon: Wifi,     label: "WI-FI",   val: flight.wifi,          color: "#00F2FE" },
                          { icon: Luggage,  label: "BAGGAGE", val: flight.bag,            color: "#7A85A0" },
                          { icon: Leaf,     label: "ECO",     val: flight.carbonOffset,   color: "#00FFA3" },
                          { icon: Plane,    label: "AIRCRAFT",val: (flight.plane || "").split(" ").slice(0, 2).join(" ") || "Jetliner", color: "#E2B755" },
                        ].map(({ icon: Icon, label, val, color }) => (
                          <div key={label} className="flex flex-col items-center gap-1 p-2 rounded-xl" style={{ background: "rgba(255,255,255,0.025)" }}>
                            <Icon size={12} color={color} />
                            <span className="mono text-[8px] tracking-wider" style={{ color: "#404660" }}>{label}</span>
                            <span className="mono text-[9px] font-bold text-center leading-tight" style={{ color: "#E8EAF0" }}>{val}</span>
                          </div>
                        ))}
                      </div>
                      <div className="mono text-[9px] mt-2 px-1" style={{ color: "#404660" }}>
                        {flight.plane} · SEAT PITCH: {flight.seatPitch}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* ── Footer trust strip & GDS shortcut ───────────────────────── */}
      <div
        className="px-5 py-3 flex items-center justify-between gap-3 flex-shrink-0 flex-wrap"
        style={{ borderTop: "1px solid rgba(255,255,255,0.05)" }}
      >
        <div className="flex items-center gap-3 flex-wrap">
          {[
            { icon: ShieldCheck, label: "256-BIT SSL", color: "#00FFA3" },
            { label: "IATA GDS DATA", color: "#7A85A0" },
            { label: "24H CANCELLATION", color: "#7A85A0" },
          ].map(({ icon: Icon, label, color }) => (
            <div key={label} className="flex items-center gap-1">
              {Icon && <Icon size={11} color={color} />}
              <span className="mono text-[9px] font-bold tracking-widest" style={{ color }}>{label}</span>
            </div>
          ))}
        </div>

        <button
          type="button"
          onClick={() => {
            sound.playClick();
            navigate(`/booking?from=${origCode}&to=${destCode}`);
          }}
          className="text-[10px] mono text-cyan-400 hover:text-cyan-300 hover:underline flex items-center gap-1 font-bold cursor-pointer"
        >
          <span>Compare All Fares in GDS Engine ↗</span>
        </button>
      </div>
    </div>
  );
}
