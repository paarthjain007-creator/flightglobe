import React, { useState } from "react";
import { X, CheckCircle2, ShieldCheck, CreditCard, ExternalLink, Luggage, Printer, Ticket, Check } from "lucide-react";
import { createDuffelBookingHandoff } from "../../services/api/duffelService";
import { createBookingAPI } from "../../services/api/apiClient";
import { usePassportStamps } from "../../hooks/usePassportStamps";
import { useStore } from "../../store/useStore";

import { AIRPORTS, getAirportByIata } from "../../data/airports";

const SEAT_OPTIONS = ["12A (Window)", "12B (Middle)", "12C (Aisle)", "14A (Window)", "14F (Window)", "18C (Aisle)", "22D (Extra Legroom)"];

export default function BookingModal({ offer, onClose }) {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [selectedSeat, setSelectedSeat] = useState(SEAT_OPTIONS[0]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [bookingResult, setBookingResult] = useState(null);

  // Passport stamp hook — saves to localStorage + Zustand on confirmed booking
  const addStampToStore = useStore((s) => s.addStamp);
  const addTrip = useStore((s) => s.addTrip);
  const { saveStamp } = usePassportStamps(addStampToStore);

  if (!offer) return null;

  const itinerary = offer.itineraries[0];
  const segments = itinerary?.segments || [];
  const firstSeg = segments[0];
  const lastSeg = segments[segments.length - 1];

  const symbol = offer.price?.currencySymbol || "$";
  const currencyCode = offer.price?.currency || "USD";

  async function handleSubmitBooking(e) {
    e.preventDefault();
    setIsSubmitting(true);

    const res = await createDuffelBookingHandoff(offer, { firstName, lastName, email, seat: selectedSeat });
    setBookingResult(res);
    setIsSubmitting(false);

    // Persist stamp & full trip to localStorage + Zustand + Backend API after confirmed booking
    if (res && offer?.itineraries?.length > 0) {
      const segments = offer.itineraries[0]?.segments || [];
      const firstSeg = segments[0];
      const lastSeg  = segments[segments.length - 1];
      const bookingId = `T-${Math.floor(1000 + Math.random() * 9000)}`;

      const depIata = firstSeg?.departure?.iataCode || "JFK";
      const arrIata = lastSeg?.arrival?.iataCode || "LHR";
      const depAirport = getAirportByIata(depIata);
      const arrAirport = getAirportByIata(arrIata);

      const durMins = itinerary?.durationMinutes || Math.round((new Date(lastSeg?.arrival?.at).getTime() - new Date(firstSeg?.departure?.at).getTime()) / 60000);
      const durationStr = (durMins && !isNaN(durMins))
        ? `${Math.floor(durMins / 60)}h ${durMins % 60}m`
        : itinerary?.duration?.replace("PT", "").toLowerCase() || "7h 15m";

      const depTime = firstSeg?.departure?.at ? firstSeg.departure.at.slice(11, 16) : "08:30";
      const arrTime = lastSeg?.arrival?.at ? lastSeg.arrival.at.slice(11, 16) : "17:45";
      const plane = firstSeg?.aircraft || "Boeing 787-9 Dreamliner";
      const priceVal = offer.price?.total || 420;

      const tripObj = {
        id: bookingId,
        flight: {
          code: firstSeg?.number ? `${offer.validatingAirlineCode || "AI"}-${firstSeg.number}` : "FL-101",
          airline: offer.validatingAirlineName || "FlightGlobe",
          from: depIata,
          to: arrIata,
          dep: depTime,
          arr: arrTime,
          dur: durationStr,
          plane,
          price: priceVal,
          currency: currencyCode,
          currencySymbol: symbol,
        },
        origin: {
          iata: depIata,
          code: depIata,
          city: depAirport?.city || depIata,
        },
        destination: {
          iata: arrIata,
          code: arrIata,
          city: arrAirport?.city || arrIata,
        },
        totalPrice: priceVal,
        currency: currencyCode,
        currencySymbol: symbol,
        seat: selectedSeat.split(" ")[0] || "3A",
        gate: `${String.fromCharCode(65 + Math.floor(Math.random() * 4))}${Math.floor(1 + Math.random() * 24)}`,
        terminal: firstSeg?.departure?.terminal || `T${Math.floor(1 + Math.random() * 3)}`,
        group: selectedSeat.startsWith("1") || selectedSeat.startsWith("2") ? "A (Priority)" : "B",
        bookingRef: res.bookingReference,
        date: firstSeg?.departure?.at ? firstSeg.departure.at.slice(0, 10) : new Date().toISOString().split("T")[0],
      };

      addTrip(tripObj);
      createBookingAPI(tripObj).catch(() => {});

      saveStamp({
        id: Date.now(),
        timestamp: Date.now(),
        date: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
        origin: {
          iata:    depIata,
          city:    depAirport?.city || depIata,
          country: offer.validatingAirlineName || "",
        },
        destination: {
          iata:    arrIata,
          city:    arrAirport?.city || arrIata,
          country: offer.validatingAirlineName || "",
        },
        airline:    offer.validatingAirlineName,
        cabinClass: offer.price?.cabinClass || "Economy",
        pricePaid:  priceVal,
        currency:   currencyCode,
        pnr:        res.bookingReference,
      });
    }
  }

  function handlePrintBoardingPass() {
    window.print();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
      <div
        className="glass rounded-3xl p-6 max-w-xl w-full relative space-y-5 border border-blue-400/40 shadow-2xl overflow-y-auto max-h-[90vh]"
        style={{ background: "rgba(10, 15, 30, 0.96)" }}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full hover:bg-white/10 text-slate-400 hover:text-white transition-colors cursor-pointer"
        >
          <X size={18} />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3 border-b border-white/10 pb-4">
          <div className="w-12 h-12 rounded-2xl bg-blue-500/20 text-blue-400 flex items-center justify-center text-2xl border border-blue-400/30 flex-shrink-0">
            {offer.validatingAirlineLogo || "✈️"}
          </div>
          <div>
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <span>{offer.validatingAirlineName}</span>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-blue-500/20 text-blue-300 font-mono">
                {offer.source}
              </span>
            </h3>
            <p className="text-xs text-slate-400 font-mono">
              Flight {firstSeg?.number} · {firstSeg?.departure.iataCode} → {lastSeg?.arrival.iataCode} · {offer.price.cabinClass}
            </p>
          </div>
        </div>

        {bookingResult ? (
          /* Digital Boarding Pass & Confirmation */
          <div className="space-y-4 animate-scale-up">
            <div className="text-center space-y-1">
              <div className="w-14 h-14 rounded-full bg-emerald-500/20 border border-emerald-400/40 text-emerald-400 flex items-center justify-center mx-auto text-2xl">
                <CheckCircle2 size={32} />
              </div>
              <h4 className="text-xl font-bold text-white">E-Ticket Confirmed</h4>
              <p className="text-xs text-slate-300">
                PNR Reference: <strong className="text-blue-300 font-mono">{bookingResult.bookingReference}</strong>
              </p>
            </div>

            {/* Boarding Pass Ticket */}
            <div className="p-5 rounded-3xl bg-gradient-to-br from-slate-900 via-slate-900 to-cyan-950/40 border border-blue-400/40 text-xs space-y-4 relative overflow-hidden font-mono shadow-2xl">
              <div className="flex items-center justify-between border-b border-blue-500/20 pb-3">
                <div className="flex items-center gap-2">
                  <Ticket size={18} className="text-blue-400" />
                  <span className="font-bold text-white text-sm">BOARDING PASS</span>
                </div>
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-bold">
                  VERIFIED GDS
                </span>
              </div>

              <div className="flex overflow-x-auto snap-x snap-mandatory no-scrollbar gap-4 sm:grid sm:grid-cols-3 sm:gap-3 pb-2 sm:pb-0">
                <div className="flex-shrink-0 w-28 sm:w-auto snap-center">
                  <span className="text-[10px] text-slate-400 block uppercase">Passenger</span>
                  <span className="font-bold text-white text-sm">{firstName} {lastName}</span>
                </div>
                <div className="flex-shrink-0 w-28 sm:w-auto snap-center">
                  <span className="text-[10px] text-slate-400 block uppercase">Flight No</span>
                  <span className="font-bold text-blue-300 text-sm">{firstSeg?.number}</span>
                </div>
                <div className="flex-shrink-0 w-28 sm:w-auto snap-center">
                  <span className="text-[10px] text-slate-400 block uppercase">Seat Number</span>
                  <span className="font-bold text-emerald-400 text-sm">{selectedSeat.split(" ")[0]}</span>
                </div>
                <div className="flex-shrink-0 w-28 sm:w-auto snap-center">
                  <span className="text-[10px] text-slate-400 block uppercase">Dep Terminal</span>
                  <span className="font-bold text-white">{firstSeg?.departure.terminal || "T1"}</span>
                </div>
                <div className="flex-shrink-0 w-28 sm:w-auto snap-center">
                  <span className="text-[10px] text-slate-400 block uppercase">Cabin</span>
                  <span className="font-bold text-white">{offer.price.cabinClass}</span>
                </div>
                <div className="flex-shrink-0 w-28 sm:w-auto snap-center">
                  <span className="text-[10px] text-slate-400 block uppercase">Total Rate</span>
                  <span className="font-bold text-emerald-300">{symbol}{offer.price.total.toLocaleString()} {currencyCode}</span>
                </div>
              </div>

              <div className="border-t border-dashed border-white/20 pt-3 flex items-center justify-between text-[11px]">
                <span>Carrier: <strong>{offer.validatingAirlineName}</strong></span>
                <span>Baggage: <strong>{offer.baggageAllowance}</strong></span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={handlePrintBoardingPass}
                className="flex-1 py-3 rounded-2xl font-bold text-xs flex items-center justify-center gap-2 glass text-slate-200 hover:text-white border border-white/15 cursor-pointer"
              >
                <Printer size={14} />
                <span>Print Boarding Pass</span>
              </button>

              <button
                type="button"
                onClick={() => { onClose(); window.location.href = "/passport"; }}
                className="flex-1 py-3 rounded-2xl font-bold text-xs flex items-center justify-center gap-2 bg-gradient-to-r from-cyan-400 to-emerald-400 text-slate-950 hover:opacity-90 transition-all shadow-xl cursor-pointer"
              >
                <span>View My Passes</span>
                <Luggage size={14} />
              </button>
            </div>
          </div>
        ) : (
          /* Passenger Checkout Form */
          <form onSubmit={handleSubmitBooking} className="space-y-4">
            
            {/* Detailed Rate Breakdown Box */}
            <div className="p-4 rounded-2xl bg-cyan-950/30 border border-blue-500/20 space-y-2 text-xs">
              <div className="font-bold text-blue-300 flex items-center justify-between border-b border-white/10 pb-1.5">
                <span>Real-Time Rate & Tax Breakdown ({currencyCode}):</span>
                <span className="text-emerald-400 font-mono text-sm">{symbol}{offer.price.total.toLocaleString()}</span>
              </div>

              <div className="flex overflow-x-auto snap-x snap-mandatory no-scrollbar gap-4 sm:grid sm:grid-cols-3 sm:gap-2 font-mono text-[11px] text-slate-300 pt-1 pb-1">
                <div className="flex-shrink-0 w-24 sm:w-auto snap-center">
                  <span className="text-slate-400 text-[10px] block">Base Fare</span>
                  <span className="font-bold">{symbol}{offer.price.base.toLocaleString()}</span>
                </div>
                <div className="flex-shrink-0 w-24 sm:w-auto snap-center">
                  <span className="text-slate-400 text-[10px] block">Govt Taxes</span>
                  <span className="font-bold">{symbol}{offer.price.fees.toLocaleString()}</span>
                </div>
                <div className="flex-shrink-0 w-24 sm:w-auto snap-center">
                  <span className="text-slate-400 text-[10px] block">Fuel Surcharge</span>
                  <span className="font-bold">{symbol}{(offer.price.fuelSurcharge || 0).toLocaleString()}</span>
                </div>
              </div>
            </div>

            {/* Passenger Information */}
            <div className="space-y-3">
              <div className="flex flex-col sm:grid sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-semibold text-slate-300 mb-1 block">First Name</label>
                  <input
                    type="text"
                    required
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    placeholder="John"
                    className="w-full px-3 py-2 rounded-xl bg-slate-900/80 border border-white/15 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-400"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-semibold text-slate-300 mb-1 block">Last Name</label>
                  <input
                    type="text"
                    required
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    placeholder="Doe"
                    className="w-full px-3 py-2 rounded-xl bg-slate-900/80 border border-white/15 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-400"
                  />
                </div>
              </div>

              <div className="flex flex-col sm:grid sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-semibold text-slate-300 mb-1 block">Passenger Contact Email</label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="passenger@example.com"
                    className="w-full px-3 py-2 rounded-xl bg-slate-900/80 border border-white/15 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-400"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-slate-300 mb-1 block">Seat Assignment</label>
                  <select
                    value={selectedSeat}
                    onChange={(e) => setSelectedSeat(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900/80 border border-white/15 text-xs text-white focus:outline-none focus:border-blue-400 font-mono"
                  >
                    {SEAT_OPTIONS.map((seat) => (
                      <option key={seat} value={seat}>{seat}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1">
              <div className="flex items-center gap-1.5 text-emerald-400 font-mono">
                <ShieldCheck size={14} />
                <span>Verified GDS Live Pricing</span>
              </div>
              <div className="text-slate-400 font-mono">
                Baggage: <strong className="text-white">{offer.baggageAllowance}</strong>
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3.5 rounded-2xl font-bold text-xs flex items-center justify-center gap-2 bg-gradient-to-r from-cyan-400 to-cyan-500 text-slate-950 hover:from-cyan-300 hover:to-cyan-400 transition-all cursor-pointer shadow-xl shadow-cyan-400/20 active:scale-95 disabled:opacity-50"
            >
              {isSubmitting ? (
                <span>Generating Airline Boarding Ticket…</span>
              ) : (
                <>
                  <CreditCard size={15} />
                  <span>Issue E-Ticket Ticket ({symbol}{offer.price.total.toLocaleString()} {currencyCode})</span>
                </>
              )}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
