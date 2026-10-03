import React, { useState, useEffect } from "react";
import { X, Globe2, Sparkles, Stamp, Plane, ChevronRight, ChevronLeft } from "lucide-react";

const TOUR_KEY = "flightglobe_tour_v1";

const STEPS = [
  {
    icon: Globe2,
    color: "text-fuchsia-400",
    title: "Interactive 3D Globe",
    desc: "Click any airport dot on the globe to add a waypoint. Build a multi-leg route by adding two or more stops, then hit \"Calculate Trip Insights\" to unlock the full telemetry dashboard.",
    hint: "💡 Try clicking on any glowing dot — that's a live airport!",
  },
  {
    icon: Plane,
    color: "text-emerald-400",
    title: "Live Flight Radar",
    desc: "The globe displays live ADS-B aircraft positions in real time. Use the Radar page for a 2D radar view filtered by region, altitude, and airline.",
    hint: "💡 Enable \"Radar\" in the Features panel to watch aircraft move.",
  },
  {
    icon: Sparkles,
    color: "text-purple-400",
    title: "Nimbus AI Co-pilot",
    desc: "Hit the ✦ Nimbus button (bottom-right) to talk to your AI travel assistant. Ask it to plan routes, compare fares, check visa requirements, or explain live data on screen.",
    hint: "💡 Try: \"Plan a trip from Delhi to Dubai with a stopover in Mumbai\"",
  },
  {
    icon: Stamp,
    color: "text-amber-400",
    title: "Your Travel Passport",
    desc: "Every route you calculate and every flight you book earns you a Passport stamp — a gamified record of all your journeys with CO₂ stats, fare data, and timestamps.",
    hint: "💡 Access your Passport from the navigation bar anytime.",
  },
];

export default function GuidedTour({ onDone }) {
  const [step, setStep] = useState(0);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!localStorage.getItem(TOUR_KEY)) {
      setVisible(true);
    }
  }, []);

  function dismiss() {
    localStorage.setItem(TOUR_KEY, "1");
    setVisible(false);
    if (onDone) onDone();
  }

  function next() {
    if (step < STEPS.length - 1) setStep((s) => s + 1);
    else dismiss();
  }

  function prev() {
    setStep((s) => Math.max(0, s - 1));
  }

  if (!visible) return null;

  const { icon: Icon, color, title, desc, hint } = STEPS[step];

  return (
    <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div
        className="w-full max-w-md rounded-3xl border border-fuchsia-400/30 shadow-2xl p-6 space-y-5 relative"
        style={{ background: "rgba(5, 10, 24, 0.96)" }}
      >
        {/* Close */}
        <button
          onClick={dismiss}
          aria-label="Skip tour"
          className="absolute top-4 right-4 p-1.5 rounded-full hover:bg-white/10 text-slate-400 hover:text-white transition-colors cursor-pointer"
        >
          <X size={15} />
        </button>

        {/* Step Pips */}
        <div className="flex items-center gap-1.5">
          {STEPS.map((_, i) => (
            <div
              key={i}
              className={`h-1 rounded-full transition-all duration-300 ${
                i === step ? "w-6 bg-fuchsia-400" : "w-2 bg-white/20"
              }`}
            />
          ))}
          <span className="ml-auto text-xs text-slate-400 font-mono">
            {step + 1} / {STEPS.length}
          </span>
        </div>

        {/* Icon */}
        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center bg-white/5 border border-white/10 ${color}`}>
          <Icon size={24} />
        </div>

        {/* Content */}
        <div className="space-y-2">
          <h2 className="text-lg font-bold text-white">{title}</h2>
          <p className="text-sm text-slate-300 leading-relaxed">{desc}</p>
          <p className="text-xs text-slate-400 italic">{hint}</p>
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-between pt-2 border-t border-white/10">
          <button
            onClick={dismiss}
            className="text-xs text-slate-400 hover:text-slate-300 cursor-pointer transition-colors"
          >
            Skip Tour
          </button>
          <div className="flex items-center gap-2">
            {step > 0 && (
              <button
                onClick={prev}
                aria-label="Previous step"
                className="px-3 py-1.5 rounded-xl text-xs font-semibold glass text-slate-300 hover:text-white flex items-center gap-1 cursor-pointer"
              >
                <ChevronLeft size={13} /> Back
              </button>
            )}
            <button
              onClick={next}
              aria-label={step < STEPS.length - 1 ? "Next step" : "Start exploring"}
              className="px-4 py-1.5 rounded-xl text-xs font-bold bg-fuchsia-400 text-slate-950 hover:bg-cyan-300 flex items-center gap-1 cursor-pointer transition-all"
            >
              {step < STEPS.length - 1 ? (
                <>Next <ChevronRight size={13} /></>
              ) : (
                <>Start Exploring ✦</>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
