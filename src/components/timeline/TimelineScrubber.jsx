import React, { useState, useEffect, useRef } from "react";
import { Play, Pause, RotateCcw, Clock, Plane, Sparkles, FastForward } from "lucide-react";

export function TimelineScrubber({
  simulatedTimeMs,
  onChangeSimulatedTime,
  airborneFlightsCount = 0,
  minTimeMs,
  maxTimeMs,
}) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(1); // 1x, 5x, 20x
  const animFrameRef = useRef(null);
  const lastTickRef = useRef(null);

  const totalRangeMs = Math.max(1, maxTimeMs - minTimeMs);
  const progressPercent = Math.min(100, Math.max(0, ((simulatedTimeMs - minTimeMs) / totalRangeMs) * 100));

  // 4D Auto-Playback Animation Loop
  useEffect(() => {
    if (!isPlaying) {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
      return;
    }

    lastTickRef.current = performance.now();

    function step(now) {
      const deltaMs = now - (lastTickRef.current || now);
      lastTickRef.current = now;

      // 1 real sec = 1 hour (3600000ms) * playbackSpeed
      const timeAdvancement = deltaMs * 3600 * playbackSpeed;

      onChangeSimulatedTime((prevTime) => {
        let nextTime = prevTime + timeAdvancement;
        if (nextTime >= maxTimeMs) {
          nextTime = minTimeMs; // Loop back to start
        }
        return nextTime;
      });

      animFrameRef.current = requestAnimationFrame(step);
    }

    animFrameRef.current = requestAnimationFrame(step);

    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [isPlaying, playbackSpeed, minTimeMs, maxTimeMs, onChangeSimulatedTime]);

  const dateObj = new Date(simulatedTimeMs);
  const formattedDate = dateObj.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
  const formattedTime = dateObj.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    timeZoneName: "short",
  });

  return (
    <div
      id="4d-timeline-scrubber"
      className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 w-[92%] max-w-3xl glass rounded-3xl p-4 border border-white/15 shadow-2xl animate-slide-up"
      style={{ background: "rgba(10, 15, 30, 0.88)", backdropFilter: "blur(20px)" }}
    >
      <div className="flex items-center justify-between mb-2 flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center">
            <Clock size={14} />
          </div>
          <div>
            <div className="text-xs font-bold text-white flex items-center gap-2">
              <span>{formattedDate} · {formattedTime}</span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 font-mono">
                4D Time-Travel
              </span>
            </div>
          </div>
        </div>

        {/* Airborne Flight Counter Badge */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-950/60 border border-cyan-500/30 text-xs font-bold text-cyan-400">
            <Plane size={13} className={airborneFlightsCount > 0 ? "animate-pulse" : ""} />
            <span>{airborneFlightsCount} Airborne</span>
          </div>

          {/* Reset Button */}
          <button
            onClick={() => {
              setIsPlaying(false);
              onChangeSimulatedTime(minTimeMs);
            }}
            className="p-1.5 rounded-xl hover:bg-white/10 text-slate-400 hover:text-white transition-colors cursor-pointer"
            title="Reset to Now"
          >
            <RotateCcw size={13} />
          </button>
        </div>
      </div>

      {/* Slider Track with Rush-Hour Density Histogram */}
      <div className="relative py-2">
        {/* Rush Hour Tick Histogram Background */}
        <div className="absolute top-1 left-0 right-0 h-3 flex justify-between pointer-events-none opacity-30 px-1">
          {Array.from({ length: 28 }).map((_, i) => {
            const isRush = i % 4 === 1 || i % 4 === 3;
            return (
              <div
                key={i}
                className={`w-1 rounded-full ${isRush ? "bg-amber-400 h-3" : "bg-cyan-400 h-1.5 self-end"}`}
              />
            );
          })}
        </div>

        <input
          id="timeline-range-input"
          type="range"
          min={minTimeMs}
          max={maxTimeMs}
          step={60000} // 1 minute resolution
          value={simulatedTimeMs}
          onChange={(e) => {
            setIsPlaying(false);
            onChangeSimulatedTime(Number(e.target.value));
          }}
          className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-400 relative z-10"
        />
      </div>

      {/* Controls Bar */}
      <div className="flex items-center justify-between pt-1">
        <div className="text-[11px] text-slate-400 font-mono">
          Now
        </div>

        {/* Playback Controls */}
        <div className="flex items-center gap-2">
          <button
            id="play-4d-timeline-btn"
            onClick={() => setIsPlaying(!isPlaying)}
            className="px-4 py-1.5 rounded-xl font-bold text-xs flex items-center gap-1.5 bg-cyan-400 text-slate-950 hover:bg-cyan-300 transition-all cursor-pointer shadow-lg shadow-cyan-400/20"
          >
            {isPlaying ? <Pause size={13} /> : <Play size={13} />}
            <span>{isPlaying ? "Pause 4D" : "Play 4D"}</span>
          </button>

          <button
            onClick={() => setPlaybackSpeed((s) => (s === 1 ? 5 : s === 5 ? 20 : 1))}
            className="px-2.5 py-1 rounded-xl text-xs font-bold bg-white/10 hover:bg-white/20 text-cyan-300 border border-white/10 transition-all cursor-pointer"
            title="Toggle playback speed"
          >
            {playbackSpeed}x Speed
          </button>
        </div>

        <div className="text-[11px] text-slate-400 font-mono">
          +7 Days
        </div>
      </div>
    </div>
  );
}
