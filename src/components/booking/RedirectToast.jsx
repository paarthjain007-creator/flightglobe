import React, { useEffect, useState } from "react";
import { ExternalLink, Loader2, CheckCircle2 } from "lucide-react";

/**
 * RedirectToast — Brief animated overlay shown when redirecting to official airline site.
 * Auto-dismisses after 2.4s and opens the URL in a new tab.
 */
export default function RedirectToast({ airlineName, url, onDone }) {
  const [phase, setPhase] = useState("redirecting"); // "redirecting" | "opening"

  useEffect(() => {
    const t1 = setTimeout(() => setPhase("opening"), 1200);
    const t2 = setTimeout(() => {
      window.open(url, "_blank", "noopener,noreferrer");
      if (onDone) onDone();
    }, 2000);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, [url, onDone]);

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/60 backdrop-blur-sm animate-fade-in">
      <div
        className="glass rounded-3xl p-6 max-w-sm w-[90%] text-center space-y-4 border border-cyan-400/40 shadow-2xl"
        style={{ background: "rgba(5, 10, 24, 0.96)" }}
      >
        {phase === "redirecting" ? (
          <>
            <Loader2 size={32} className="text-cyan-400 animate-spin mx-auto" />
            <div>
              <div className="text-sm font-bold text-white">Redirecting to {airlineName}</div>
              <div className="text-xs text-slate-400 mt-1">Opening official airline booking page...</div>
            </div>
          </>
        ) : (
          <>
            <CheckCircle2 size={32} className="text-emerald-400 mx-auto" />
            <div>
              <div className="text-sm font-bold text-white">Opening {airlineName} ↗</div>
              <div className="text-xs text-slate-400 mt-1 flex items-center justify-center gap-1">
                <ExternalLink size={10} />
                <span className="truncate max-w-[200px] font-mono">{(() => { try { return new URL(url).hostname; } catch { return url; } })()}</span>
              </div>
            </div>
          </>
        )}

        <div className="w-full bg-white/10 rounded-full h-1 overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-[2000ms] ease-linear"
            style={{
              width: phase === "redirecting" ? "50%" : "100%",
              background: "linear-gradient(90deg, #22d3ee, #34d399)",
            }}
          />
        </div>
      </div>
    </div>
  );
}
