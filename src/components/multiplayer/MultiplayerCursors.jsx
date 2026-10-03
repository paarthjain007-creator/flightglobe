import React from "react";
import { MousePointer2, Users, Sparkles } from "lucide-react";

export function MultiplayerCursors({ peers, reactions, onSendReaction }) {
  return (
    <>
      {/* Live Peer Cursors */}
      <div className="pointer-events-none fixed inset-0 z-40 overflow-hidden">
        {peers.map((peer) => {
          if (!peer.x || !peer.y) return null;
          return (
            <div
              key={peer.id}
              className="absolute transition-all duration-1000 ease-out flex items-center gap-1.5"
              style={{
                transform: `translate3d(${peer.x}px, ${peer.y}px, 0)`,
              }}
            >
              <MousePointer2
                size={18}
                style={{ color: peer.color, fill: peer.color }}
                className="drop-shadow-md"
              />
              <div
                className="px-2 py-0.5 rounded-full text-xs font-semibold flex items-center gap-1 shadow-lg"
                style={{
                  background: "rgba(10, 15, 30, 0.85)",
                  border: `1px solid ${peer.color}`,
                  color: "#F8FAFC",
                  fontSize: "12px",
                  backdropFilter: "blur(8px)",
                }}
              >
                <span>{peer.avatar}</span>
                <span>{peer.name}</span>
              </div>
            </div>
          );
        })}

        {/* Floating Reactions */}
        {reactions.map((r) => (
          <div
            key={r.id}
            className="absolute text-3xl animate-bounce pointer-events-none"
            style={{
              left: `${r.x}px`,
              top: `${r.y}px`,
              animation: "slideUpFade 2.5s forwards",
            }}
          >
            {r.emoji}
          </div>
        ))}
      </div>

      {/* Floating Collaboration Bar */}
      <div className="fixed bottom-4 left-4 z-40 flex items-center gap-2 glass px-3.5 py-2 rounded-2xl border border-white/10 shadow-xl">
        <div className="flex items-center gap-1 text-xs font-bold" style={{ color: "#2997ff" }}>
          <Users size={14} />
          <span>{peers.length + 1} Online</span>
        </div>
        <div className="w-px h-4 bg-white/10 mx-1" />
        <div className="flex items-center gap-1">
          {["👍", "✈️", "🔥", "❤️"].map((emoji) => (
            <button
              key={emoji}
              onClick={() => onSendReaction(emoji)}
              className="hover:scale-125 active:scale-95 transition-transform text-sm p-1 cursor-pointer"
              title={`Send ${emoji} reaction`}
            >
              {emoji}
            </button>
          ))}
        </div>
      </div>
    </>
  );
}
