import React from "react";
import { WifiOff, AlertTriangle } from "lucide-react";
import { useOnlineStatus } from "../../hooks/useOnlineStatus";

export default function OfflineToast() {
  const isOnline = useOnlineStatus();

  if (isOnline) return null;

  return (
    <div
      id="offline-toast"
      className="fixed bottom-4 right-4 z-50 flex items-center gap-3 px-4 py-3 rounded-2xl glass animate-slide-up shadow-2xl"
      style={{
        background: "rgba(30, 10, 10, 0.85)",
        border: "1px solid rgba(248, 113, 113, 0.35)",
        backdropFilter: "blur(12px)",
      }}
    >
      <div
        className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
        style={{ background: "rgba(248, 113, 113, 0.15)", color: "#f87171" }}
      >
        <WifiOff size={18} />
      </div>
      <div>
        <div className="flex items-center gap-1.5 text-xs font-bold" style={{ color: "#f87171" }}>
          <AlertTriangle size={12} />
          <span>Offline Mode Active</span>
        </div>
        <p className="text-xs" style={{ color: "var(--text-muted)", fontSize: "13px" }}>
          Live flight tracking & AI search are running on cached offline models.
        </p>
      </div>
    </div>
  );
}
