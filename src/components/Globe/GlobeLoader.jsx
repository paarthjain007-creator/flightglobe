import React from "react";

export default function GlobeLoader() {
  return (
    <div className="globe-container flex items-center justify-center" style={{ background: "#040508" }}>
      <div className="flex flex-col items-center gap-6">
        {/* Wireframe Globe */}
        <div className="globe-wireframe">
          <div className="globe-ring globe-ring-1" />
          <div className="globe-ring globe-ring-2" />
          <div className="globe-ring globe-ring-3" />
          <div className="globe-dot globe-dot-1" />
          <div className="globe-dot globe-dot-2" />
          <div className="globe-core" />
        </div>

        {/* Text */}
        <div className="text-center">
          <div className="text-sm font-semibold mb-1" style={{ color: "#2997ff" }}>
            Loading Globe
          </div>
          <div className="text-xs text-[#86868b]">
            Initializing WebGL renderer…
          </div>
        </div>
      </div>

      <style>{`
        .globe-wireframe {
          position: relative;
          width: 160px;
          height: 160px;
        }
        .globe-core {
          position: absolute;
          inset: 20px;
          border-radius: 50%;
          border: 1px solid rgba(255, 255, 255, 0.1);
          background: radial-gradient(ellipse at 35% 35%, rgba(41,151,255, 0.3), transparent 70%);
          animation: pulse-core 2s ease-in-out infinite;
        }
        .globe-ring {
          position: absolute;
          inset: 0;
          border-radius: 50%;
          border: 1px solid #2997ff;
          opacity: 0.3;
          animation: spin-ring 4s linear infinite;
        }
        .globe-ring-1 { transform: rotateX(70deg); animation-duration: 3.5s; opacity: 0.5; border-color: #2997ff; }
        .globe-ring-2 { transform: rotateX(70deg) rotateY(60deg); animation-duration: 4.5s; opacity: 0.3; }
        .globe-ring-3 { transform: rotateX(20deg) rotateZ(45deg); animation-duration: 6s; opacity: 0.2; }
        .globe-dot {
          position: absolute;
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: #2997ff;
          box-shadow: 0 0 8px rgba(41,151,255, 0.4);
          animation: orbit 3s linear infinite;
        }
        .globe-dot-1 { animation-duration: 2.8s; top: 10px; left: 50%; margin-left: -3px; }
        .globe-dot-2 { animation-duration: 4.2s; animation-delay: -1.4s; top: 50%; left: 10px; margin-top: -3px; }
        @keyframes spin-ring { from { transform: rotateX(70deg) rotateY(0deg); } to { transform: rotateX(70deg) rotateY(360deg); } }
        @keyframes pulse-core {
          0%, 100% { box-shadow: 0 0 0 0 rgba(217,70,239, 0.2); }
          50% { box-shadow: 0 0 30px 8px rgba(217,70,239, 0.4); }
        }
        @keyframes orbit {
          0%   { transform: rotate(0deg) translateX(72px) rotate(0deg); }
          100% { transform: rotate(360deg) translateX(72px) rotate(-360deg); }
        }
      `}</style>
    </div>
  );
}
