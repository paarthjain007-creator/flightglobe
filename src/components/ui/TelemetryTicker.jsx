import React, { useState, useEffect } from "react";
import { Activity, Radio, Compass, Wifi, Shield, ChevronUp, ChevronDown } from "lucide-react";
import { sound } from "../../utils/soundFx";

export default function TelemetryTicker() {
  const [collapsed, setCollapsed] = useState(true);
  const [activePlanes, setActivePlanes] = useState(10482);
  const [utcTime, setUtcTime] = useState("");
  const [ping, setPing] = useState(18);

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setUtcTime(now.toUTCString().slice(17, 25) + " UTC");
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  // Subtle plane count jitter to simulate live transponder ingest
  useEffect(() => {
    const interval = setInterval(() => {
      setActivePlanes((prev) => prev + Math.floor((Math.random() - 0.48) * 5));
      setPing(Math.floor(16 + Math.random() * 6));
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="fixed bottom-3 left-3 sm:left-4 z-40 pointer-events-auto select-none max-w-[calc(100vw-24px)]">
      <div
        className="rounded-2xl backdrop-blur-sm transition-all duration-300 overflow-hidden shadow-2xl flex items-center"
        style={{
          background: "rgba(22, 22, 24, 0.90)",
          border: "1px solid rgba(255, 255, 255, 0.12)",
          boxShadow: "0 8px 32px rgba(0, 0, 0, 0.6)",
        }}
      >
        {/* Toggle pill button */}
        <button
          type="button"
          onClick={() => {
            sound.playClick();
            setCollapsed(!collapsed);
          }}
          className="flex items-center gap-2 px-3 py-2 text-[10px] mono font-bold text-slate-300 hover:text-white cursor-pointer transition-colors"
          title={collapsed ? "Expand Live Flight Telemetry" : "Collapse Telemetry"}
        >
          <span className="w-2 h-2 rounded-full bg-[#30d158] animate-pulse shadow-[0_0_8px_rgba(48,209,88,0.5)]" />
          <span className="tracking-wider text-[#2997ff]">AERO.HUD</span>
          {collapsed ? <ChevronUp size={12} className="text-[#86868b]" /> : <ChevronDown size={12} className="text-[#86868b]" />}
        </button>

        {/* Expanded Telemetry Ticker Items */}
        {!collapsed && (
          <div className="flex items-center gap-4 pr-4 pl-1 text-[10px] mono border-l border-white/10 animate-fade-in">
            <div className="flex items-center gap-1.5 text-slate-300">
              <Radio size={11} className="text-[#2997ff]" />
              <span className="text-[#86868b]">FLIGHTS:</span>
              <span className="font-bold text-white">{activePlanes.toLocaleString()}</span>
            </div>

            <div className="hidden sm:flex items-center gap-1.5 text-slate-300">
              <Activity size={11} className="text-[#30d158]" />
              <span className="text-[#86868b]">ADS-B:</span>
              <span className="font-bold text-[#30d158]">{ping}ms</span>
            </div>

            <div className="hidden md:flex items-center gap-1.5 text-slate-300">
              <Compass size={11} className="text-[#bf5af2]" />
              <span className="text-[#86868b]">GNSS:</span>
              <span className="font-bold text-[#bf5af2]">32 SVs LOCK</span>
            </div>

            <div className="hidden lg:flex items-center gap-1.5 text-slate-300">
              <Shield size={11} className="text-[#ff9f0a]" />
              <span className="text-[#86868b]">SECURITY:</span>
              <span className="font-bold text-[#ff9f0a]">ICAO SECURE</span>
            </div>

            <div className="flex items-center gap-1.5 text-[#f5f5f7] font-bold">
              <span>{utcTime}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}