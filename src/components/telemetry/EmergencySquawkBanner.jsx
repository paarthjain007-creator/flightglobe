import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { AlertTriangle, Radio, ShieldAlert, Crosshair, X, Bell } from "lucide-react";
import { useStore } from "../../store/useStore";
import { sound } from "../../utils/soundFx";

export default function EmergencySquawkBanner() {
  const navigate = useNavigate();
  const emergencyAlert = useStore((s) => s.emergencyAlert);
  const setEmergencyAlert = useStore((s) => s.setEmergencyAlert);
  const setSpatialCommand = useStore((s) => s.setSpatialCommand);

  // Trigger alarm audio & haptics when an emergency transponder is detected
  useEffect(() => {
    if (emergencyAlert) {
      sound.playEmergencyAlarm();
    }
  }, [emergencyAlert]);

  if (!emergencyAlert) return null;

  const isMayday = emergencyAlert.squawk === "7700";
  const accentColor = isMayday ? "#FF3B69" : "#FBBF24";

  const handleTrackEmergency = () => {
    sound.playClick();
    navigate("/explore");
    setSpatialCommand({
      action: "FOCUS_LOCATION",
      params: {
        lat: emergencyAlert.lat || 48.2,
        lng: emergencyAlert.lng || -24.5,
        altitude: 1.2,
      },
      flight_context: {
        code: emergencyAlert.callsign,
        emergency: true,
      },
      timestamp: Date.now(),
    });
  };

  const handleDismiss = () => {
    sound.playClick();
    setEmergencyAlert(null);
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -40 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -40 }}
        transition={{ type: "spring", stiffness: 450, damping: 28 }}
        className="fixed top-20 left-1/2 -translate-x-1/2 z-[250] w-[95%] max-w-2xl pointer-events-auto"
      >
        <div
          className="rounded-2xl p-3 sm:p-4 backdrop-blur-sm shadow-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border"
          style={{
            background: "rgba(16, 8, 14, 0.95)",
            borderColor: `${accentColor}88`,
            boxShadow: `0 0 35px ${accentColor}33, 0 16px 40px rgba(0,0,0,0.85)`,
          }}
        >
          {/* Beacon + Info */}
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 animate-pulse"
              style={{ background: `${accentColor}22`, border: `1px solid ${accentColor}` }}
            >
              <AlertTriangle size={20} style={{ color: accentColor }} />
            </div>

            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <span
                  className="mono text-xs font-black tracking-widest px-2 py-0.5 rounded"
                  style={{ background: `${accentColor}33`, color: accentColor, border: `1px solid ${accentColor}66` }}
                >
                  SQUAWK {emergencyAlert.squawk} {isMayday ? "MAYDAY" : "ALERT"}
                </span>
                <span className="mono text-xs font-bold text-white">
                  {emergencyAlert.callsign} ({emergencyAlert.type})
                </span>
              </div>
              <div className="mono text-[13px] text-slate-300 mt-0.5 flex items-center gap-2 flex-wrap">
                <span style={{ color: accentColor }}>{emergencyAlert.reason}</span>
                <span>· FL{Math.round(emergencyAlert.altitude / 100)}</span>
                <span className="text-red-400 font-bold">{emergencyAlert.descentRate || "-2,800 FPM"}</span>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <button
              type="button"
              onClick={handleTrackEmergency}
              className="px-3.5 py-2 rounded-xl mono text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-md transition-all hover:scale-105"
              style={{
                background: accentColor,
                color: "#040508",
                boxShadow: `0 0 16px ${accentColor}66`,
              }}
            >
              <Crosshair size={13} />
              <span>INTERCEPT</span>
            </button>

            <button
              type="button"
              onClick={handleDismiss}
              className="p-2 rounded-xl glass hover:bg-white/10 text-slate-400 hover:text-white cursor-pointer"
              title="Acknowledge & Dismiss Alert"
            >
              <X size={15} />
            </button>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}