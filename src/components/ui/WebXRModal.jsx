import React from "react";
import { Box, X, Sparkles, Move3d } from "lucide-react";

export function WebXRModal({ isOpen, onClose, onStartAR }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-fade-in">
      <div
        className="glass rounded-3xl p-6 max-w-md w-full relative space-y-4 border border-cyan-400/40 shadow-2xl"
        style={{ background: "rgba(10, 15, 30, 0.9)" }}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-full hover:bg-white/10 transition-colors cursor-pointer"
        >
          <X size={16} className="text-muted" />
        </button>

        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-cyan-500/20 flex items-center justify-center text-cyan-400">
            <Box size={22} />
          </div>
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-1.5">
              Spatial AR Globe Mode
              <Sparkles size={14} className="text-cyan-400" />
            </h3>
            <p className="text-xs text-slate-400">WebXR Vision & Spatial Computing Session</p>
          </div>
        </div>

        {/* Spatial Preview Graphic */}
        <div className="relative h-44 rounded-2xl border border-dashed border-cyan-500/30 bg-cyan-950/20 flex flex-col items-center justify-center p-4 text-center overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-t from-cyan-950/40 to-transparent pointer-events-none" />
          <Move3d size={40} className="text-cyan-400 animate-pulse mb-2" />
          <div className="text-xs font-semibold text-cyan-300">
            Place 3D Globe in Physical Room
          </div>
          <div className="text-[11px] text-slate-400 mt-1 max-w-xs">
            Point camera at a flat surface (table or floor) to anchor your interactive flight globe with live device camera passthrough.
          </div>
        </div>

        <div className="flex items-center gap-2 pt-2">
          <button
            onClick={() => {
              onClose();
              if (onStartAR) onStartAR();
            }}
            className="flex-1 py-3 rounded-xl text-xs font-bold bg-cyan-400 text-slate-950 hover:bg-cyan-300 cursor-pointer transition-all shadow-lg shadow-cyan-400/20"
          >
            Launch Live AR Viewport
          </button>
        </div>
      </div>
    </div>
  );
}

export default WebXRModal;
