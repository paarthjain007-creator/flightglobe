import React from "react";

/* ── Pulsing shimmer building block ──────────────────────────── */
function Bone({ className = "" }) {
  return (
    <div
      className={`rounded-xl bg-white/5 shimmer ${className}`}
    />
  );
}

/* ── Dashboard: 12-col Bento Grid Skeleton ───────────────────── */
export function DashboardSkeleton() {
  return (
    <div className="relative min-h-screen pt-20 pb-16 px-4 sm:px-6 max-w-7xl mx-auto space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between pb-5 border-b border-white/10">
        <div className="space-y-2">
          <Bone className="h-7 w-64" />
          <Bone className="h-3 w-44" />
        </div>
        <Bone className="h-8 w-28 rounded-2xl" />
      </div>

      {/* Bento Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Hero (8 col) */}
        <div className="lg:col-span-8">
          <div className="glass-panel p-6 h-48 space-y-4">
            <Bone className="h-4 w-36" />
            <div className="flex items-center gap-3 flex-wrap">
              {[0,1,2].map(i => <Bone key={i} className="h-10 w-16" />)}
            </div>
            <div className="grid grid-cols-4 gap-4 pt-2">
              {[0,1,2,3].map(i => (
                <div key={i} className="space-y-1">
                  <Bone className="h-2.5 w-16" />
                  <Bone className="h-6 w-20" />
                </div>
              ))}
            </div>
          </div>
        </div>
        {/* Anomaly (4 col) */}
        <div className="lg:col-span-4">
          <div className="glass-panel p-5 h-48 space-y-3">
            <Bone className="h-4 w-28" />
            <Bone className="h-24 w-full rounded-2xl" />
          </div>
        </div>
        {/* Two half-width cards */}
        {[0,1].map(i => (
          <div key={i} className="lg:col-span-6">
            <div className="glass-panel p-5 h-44 space-y-3">
              <Bone className="h-4 w-32" />
              <Bone className="h-28 w-full rounded-2xl" />
            </div>
          </div>
        ))}
        {/* Four quarter cards */}
        {[0,1,2,3].map(i => (
          <div key={i} className="lg:col-span-6">
            <div className="glass-panel p-5 h-36 space-y-3">
              <Bone className="h-3.5 w-28" />
              <Bone className="h-20 w-full rounded-xl" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ── Explore: Globe Canvas Skeleton ──────────────────────────── */
export function GlobeSkeleton() {
  return (
    <div
      className="relative overflow-hidden flex items-center justify-center"
      style={{ height: "calc(100dvh - 88px)", marginTop: "88px" }}
    >
      {/* Fake globe circle */}
      <div className="relative">
        <div
          className="w-72 h-72 sm:w-96 sm:h-96 rounded-full shimmer opacity-40"
          style={{ background: "radial-gradient(circle at 35% 35%, rgba(96,165,250,0.3), rgba(5,10,24,0.8))" }}
        />
        {/* Orbit ring */}
        <div
          className="absolute inset-0 rounded-full border border-cyan-400/20 shimmer"
          style={{ transform: "rotateX(70deg) scale(1.15)" }}
        />
      </div>

      {/* Left panel ghost */}
      <div className="hidden md:block absolute left-4 top-1/2 -translate-y-1/2 w-64 space-y-3">
        <div className="glass-panel p-4 space-y-3">
          <Bone className="h-3 w-24" />
          <Bone className="h-9 w-full rounded-xl" />
          <Bone className="h-9 w-full rounded-xl" />
          <Bone className="h-8 w-full rounded-2xl" />
        </div>
      </div>

      {/* Bottom CTA ghost */}
      <div className="absolute bottom-5 left-1/2 -translate-x-1/2">
        <Bone className="h-11 w-52 rounded-2xl" />
      </div>
    </div>
  );
}

/* ── Generic page spinner (fallback) ────────────────────────── */
export function PageSpinner() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center" aria-live="polite">
      <div className="flex flex-col items-center gap-4">
        <div className="w-12 h-12 rounded-full border-2 border-cyan-400 border-t-transparent animate-spin" />
        <p className="text-xs text-slate-400 font-mono">Loading FlightGlobe module…</p>
      </div>
    </div>
  );
}
