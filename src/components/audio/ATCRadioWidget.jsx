import React, { useState, useEffect, useRef } from "react";
import { Radio, Volume2, VolumeX, Mic, Activity, ChevronDown, ChevronUp, Play, Pause } from "lucide-react";
import { useStore } from "../../store/useStore";
import { sound } from "../../utils/soundFx";

const ATC_CHANNELS = [
  { freq: "118.700", name: "JFK TWR", callsign: "Kennedy Tower", city: "New York", active: true },
  { freq: "128.050", name: "LHR RDR", callsign: "Heathrow Radar", city: "London", active: true },
  { freq: "119.550", name: "HND APP", callsign: "Tokyo Approach", city: "Tokyo", active: true },
  { freq: "120.400", name: "DXB CTL", callsign: "Emirates Control", city: "Dubai", active: true },
];

const ATC_TRANSMISSIONS = [
  "Speedbird 114, radar contact 15 miles west, climb and maintain FL350, squawk 4212.",
  "American 100 heavy, cleared ILS runway 22L, wind 240 at 14 knots, altimeter 29.92.",
  "Emirates 201, turn left heading 280, descend and maintain 4,000 feet, contact Tower 118.7.",
  "Air India 101, traffic 2 o'clock, 8 miles, Boeing 787 opposite direction at FL370.",
  "All aircraft on frequency, runway 27R visual approach in use, hold short line active.",
  "Delta 442, direct to WAVEY intersection, resume normal navigation, good day.",
  "Lufthansa 400, contact Shanwick Oceanic on 127.9, safe oceanic crossing.",
];

export default function ATCRadioWidget() {
  const soundVolume = useStore((s) => s.soundVolume ?? 1.0);
  const soundEnabled = useStore((s) => s.soundEnabled ?? true);
  const atcRadioEnabled = useStore((s) => s.atcRadioEnabled ?? false);
  const setAtcRadioEnabled = useStore((s) => s.setAtcRadioEnabled);
  const atcRadioFrequency = useStore((s) => s.atcRadioFrequency ?? "118.700");
  const setAtcRadioFrequency = useStore((s) => s.setAtcRadioFrequency);

  const [expanded, setExpanded] = useState(false);
  const [transmitting, setTransmitting] = useState(false);
  const [currentCallout, setCurrentCallout] = useState("RADIO MONITOR STANDBY — CH 118.700");
  const [audioBars, setAudioBars] = useState([8, 14, 22, 10, 18, 28, 12, 16]);

  const activeChannel = ATC_CHANNELS.find((c) => c.freq === atcRadioFrequency) || ATC_CHANNELS[0];

  // Simulated transmission loop
  useEffect(() => {
    if (!atcRadioEnabled || !soundEnabled) {
      setTransmitting(false);
      return;
    }

    const interval = setInterval(() => {
      // Trigger random comms transmission
      const msg = ATC_TRANSMISSIONS[Math.floor(Math.random() * ATC_TRANSMISSIONS.length)];
      setCurrentCallout(msg);
      setTransmitting(true);
      sound.playRadioSquelch();

      // Audio visualizer jitter
      const jitterInterval = setInterval(() => {
        setAudioBars(Array.from({ length: 8 }, () => Math.floor(6 + Math.random() * 26)));
      }, 100);

      setTimeout(() => {
        clearInterval(jitterInterval);
        setTransmitting(false);
        setAudioBars([4, 6, 8, 4, 6, 8, 4, 6]);
      }, 4500);
    }, 12000);

    return () => clearInterval(interval);
  }, [atcRadioEnabled, soundEnabled]);

  const handleTogglePower = () => {
    sound.playClick();
    const next = !atcRadioEnabled;
    setAtcRadioEnabled(next);
    if (next) {
      sound.playRadioSquelch();
      setCurrentCallout(`MONITORING ${activeChannel.name} (${activeChannel.freq} MHz)`);
    } else {
      setCurrentCallout("RADIO COMMS MUTED");
    }
  };

  const handleTestSquelch = () => {
    sound.playRadioSquelch();
    const msg = ATC_TRANSMISSIONS[Math.floor(Math.random() * ATC_TRANSMISSIONS.length)];
    setCurrentCallout(`[TEST] ${msg}`);
    setTransmitting(true);
    setTimeout(() => setTransmitting(false), 3500);
  };

  return (
    <div className="fixed bottom-14 left-3 sm:left-4 z-40 pointer-events-auto select-none max-w-[calc(100vw-24px)]">
      <div
        className="rounded-2xl backdrop-blur-sm transition-all duration-300 overflow-hidden shadow-2xl border flex flex-col"
        style={{
          background: "rgba(8, 12, 22, 0.94)",
          borderColor: atcRadioEnabled ? "rgba(41, 151, 255, 0.40)" : "rgba(255, 255, 255, 0.10)",
          boxShadow: atcRadioEnabled
            ? "0 0 30px rgba(41, 151, 255, 0.20), 0 12px 32px rgba(0,0,0,0.6)"
            : "0 8px 24px rgba(0,0,0,0.5)",
          width: expanded ? "min(310px, calc(100vw - 24px))" : "auto",
        }}
      >
        {/* Main Bar / Collapsed view */}
        <div className="flex items-center justify-between gap-2 px-3 py-2">
          <button
            type="button"
            onClick={handleTogglePower}
            className="flex items-center gap-2 cursor-pointer transition-colors"
            title={atcRadioEnabled ? "Mute VHF Tower Radio" : "Power On VHF Tower Radio"}
          >
            <div
              className="w-6 h-6 rounded-lg flex items-center justify-center transition-all"
              style={{
                background: atcRadioEnabled ? "rgba(41, 151, 255, 0.25)" : "rgba(255, 255, 255, 0.06)",
                border: `1px solid ${atcRadioEnabled ? "rgba(41, 151, 255, 0.55)" : "rgba(255, 255, 255, 0.12)"}`,
              }}
            >
              <Radio size={13} style={{ color: atcRadioEnabled ? "#2997ff" : "#64748B" }} />
            </div>

            <div className="flex flex-col text-left">
              <div className="flex items-center gap-1.5">
                <span className="mono text-[9px] font-bold tracking-widest text-blue-400">
                  ATC RADIO
                </span>
                <span
                  className="w-1.5 h-1.5 rounded-full"
                  style={{
                    background: atcRadioEnabled ? (transmitting ? "#30d158" : "#2997ff") : "#475569",
                    boxShadow: transmitting ? "0 0 8px rgba(48,209,88,0.5)" : "none",
                  }}
                />
              </div>
              <span className="mono text-[10px] font-bold text-slate-200">
                {activeChannel.freq} MHz
              </span>
            </div>
          </button>

          {/* Oscilloscope bars preview */}
          {atcRadioEnabled && (
            <div className="flex items-end gap-0.5 h-5 px-2">
              {audioBars.map((h, i) => (
                <div
                  key={i}
                  className="w-1 rounded-full transition-all duration-75"
                  style={{
                    height: `${h}px`,
                    background: transmitting ? "#30d158" : "rgba(41, 151, 255, 0.6)",
                  }}
                />
              ))}
            </div>
          )}

          {/* Expand toggle */}
          <button
            type="button"
            onClick={() => setExpanded(!expanded)}
            className="p-1 rounded-lg text-slate-400 hover:text-white cursor-pointer"
            title={expanded ? "Minimize Radio" : "Expand Radio Console"}
          >
            {expanded ? <ChevronDown size={14} /> : <ChevronUp size={14} />}
          </button>
        </div>

        {/* Expanded Console */}
        {expanded && (
          <div className="p-3 border-t border-white/10 space-y-3 animate-fade-in text-[10px] mono">
            {/* Live Ticker display */}
            <div
              className="p-2 rounded-xl bg-black/40 border border-white/10 text-slate-200 font-mono text-[10px] leading-relaxed flex items-start gap-2"
            >
              <Activity size={12} className={`flex-shrink-0 mt-0.5 ${transmitting ? "text-[#30d158] animate-pulse" : "text-[#86868b]"}`} />
              <p className="line-clamp-2">{currentCallout}</p>
            </div>

            {/* Channels Grid */}
            <div className="space-y-1">
              <span className="text-[#86868b] text-[9px] tracking-wider">VHF FREQUENCIES</span>
              <div className="grid grid-cols-2 gap-1.5">
                {ATC_CHANNELS.map((ch) => {
                  const isCur = ch.freq === atcRadioFrequency;
                  return (
                    <button
                      key={ch.freq}
                      type="button"
                      onClick={() => {
                        sound.playClick();
                        setAtcRadioFrequency(ch.freq);
                        sound.playRadioSquelch();
                        setCurrentCallout(`TUNED TO ${ch.callsign} (${ch.freq})`);
                      }}
                      className="px-2.5 py-1.5 rounded-xl flex items-center justify-between text-left cursor-pointer transition-all border"
                      style={{
                        background: isCur ? "rgba(41, 151, 255, 0.15)" : "rgba(255, 255, 255, 0.04)",
                        borderColor: isCur ? "rgba(41, 151, 255, 0.45)" : "rgba(255, 255, 255, 0.08)",
                        color: isCur ? "#2997ff" : "#86868b",
                      }}
                    >
                      <span className="font-bold">{ch.name}</span>
                      <span className="text-[9px] opacity-75">{ch.freq}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Test transmission & action bar */}
            <div className="flex items-center justify-between pt-1 border-t border-white/10">
              <button
                type="button"
                onClick={handleTestSquelch}
                disabled={!atcRadioEnabled}
                className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-fuchsia-500/15 border border-white/10 text-fuchsia-300 font-bold flex items-center gap-1.5 cursor-pointer disabled:opacity-40"
              >
                <Mic size={11} />
                <span>TEST SQUELCH</span>
              </button>

              <span className="text-[9px] text-slate-500">
                VOL: {Math.round(soundVolume * 100)}%
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}