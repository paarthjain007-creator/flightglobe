import React, { useState } from "react";
import { X, CheckCircle2, ShieldCheck, CreditCard, ExternalLink, Plane, User, Mail, Globe } from "lucide-react";
import { createDuffelBookingHandoff } from "../../services/api/duffelService";

export default function BookingModal({ offer, onClose }) {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [bookingResult, setBookingResult] = useState(null);

  if (!offer) return null;

  const itinerary = offer.itineraries[0];
  const segments = itinerary?.segments || [];
  const firstSeg = segments[0];
  const lastSeg = segments[segments.length - 1];

  async function handleSubmitBooking(e) {
    e.preventDefault();
    setIsSubmitting(true);

    const res = await createDuffelBookingHandoff(offer, { firstName, lastName, email });
    setBookingResult(res);
    setIsSubmitting(false);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
      <div
        className="glass rounded-3xl p-6 max-w-lg w-full relative space-y-5 border border-cyan-400/40 shadow-2xl overflow-hidden"
        style={{ background: "rgba(10, 15, 30, 0.95)" }}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full hover:bg-white/10 text-slate-400 hover:text-white transition-colors cursor-pointer"
        >
          <X size={18} />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center text-2xl border border-cyan-400/30">
            {offer.validatingAirlineLogo || "✈️"}
          </div>
          <div>
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <span>{offer.validatingAirlineName}</span>
              <span className="text-xs px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 font-mono">
                {offer.source}
              </span>
            </h3>
            <p className="text-xs text-slate-400 font-mono">
              {firstSeg?.departure.iataCode} → {lastSeg?.arrival.iataCode} · {offer.price.cabinClass}
            </p>
          </div>
        </div>

        {bookingResult ? (
          /* Success Handoff State */
          <div className="space-y-4 text-center py-4 animate-scale-up">
            <div className="w-16 h-16 rounded-full bg-emerald-500/20 border border-emerald-400/40 text-emerald-400 flex items-center justify-center mx-auto text-3xl">
              <CheckCircle2 size={36} />
            </div>
            <div>
              <h4 className="text-xl font-bold text-white mb-1">Booking Handoff Ready</h4>
              <p className="text-xs text-slate-300">
                Your PNR Reference: <strong className="text-cyan-300 font-mono">{bookingResult.bookingReference}</strong>
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-900/60 border border-white/10 text-left text-xs space-y-2 font-mono">
              <div className="flex justify-between text-slate-400">
                <span>Airline Carrier:</span>
                <span className="text-white font-bold">{offer.validatingAirlineName}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Passenger:</span>
                <span className="text-white font-bold">{firstName} {lastName}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Total Fare Paid:</span>
                <span className="text-emerald-400 font-bold">${offer.price.total} USD</span>
              </div>
            </div>

            <a
              href={bookingResult.checkoutUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full py-3.5 rounded-2xl font-bold text-xs flex items-center justify-center gap-2 bg-gradient-to-r from-emerald-400 to-cyan-400 text-slate-950 hover:opacity-90 transition-all shadow-xl shadow-emerald-400/20 cursor-pointer"
            >
              <span>Complete Booking on {offer.validatingAirlineName}</span>
              <ExternalLink size={14} />
            </a>
          </div>
        ) : (
          /* Passenger Checkout Form */
          <form onSubmit={handleSubmitBooking} className="space-y-4">
            {/* Itinerary Summary Box */}
            <div className="p-3.5 rounded-2xl bg-cyan-950/30 border border-cyan-500/20 flex items-center justify-between text-xs font-mono">
              <div>
                <div className="text-slate-400">Route</div>
                <div className="font-bold text-cyan-300">{firstSeg?.departure.iataCode} to {lastSeg?.arrival.iataCode}</div>
              </div>
              <div className="text-right">
                <div className="text-slate-400">Total Price</div>
                <div className="font-bold text-emerald-400 text-sm">${offer.price.total} USD</div>
              </div>
            </div>

            {/* Inputs */}
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-semibold text-slate-300 mb-1 block">First Name</label>
                  <input
                    type="text"
                    required
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    placeholder="John"
                    className="w-full px-3 py-2 rounded-xl bg-slate-900/80 border border-white/15 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400"
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
                    className="w-full px-3 py-2 rounded-xl bg-slate-900/80 border border-white/15 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400"
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] font-semibold text-slate-300 mb-1 block">Passenger Contact Email</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="passenger@example.com"
                  className="w-full px-3 py-2 rounded-xl bg-slate-900/80 border border-white/15 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400"
                />
              </div>
            </div>

            <div className="flex items-center gap-2 text-[11px] text-slate-400 pt-1">
              <ShieldCheck size={14} className="text-emerald-400" />
              <span>GDS / NDC Direct Ticket Handoff via Amadeus & Duffel APIs</span>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3.5 rounded-2xl font-bold text-xs flex items-center justify-center gap-2 bg-gradient-to-r from-cyan-400 to-cyan-500 text-slate-950 hover:from-cyan-300 hover:to-cyan-400 transition-all cursor-pointer shadow-xl shadow-cyan-400/20 active:scale-95 disabled:opacity-50"
            >
              {isSubmitting ? (
                <span>Generating Airline PNR Reference…</span>
              ) : (
                <>
                  <CreditCard size={15} />
                  <span>Proceed to Airline Checkout (${offer.price.total})</span>
                </>
              )}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
