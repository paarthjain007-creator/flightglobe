import React from "react";
import {
  Wind, Clock, Gauge, Box, Flame, CloudRain, X, ChevronRight,
} from "lucide-react";

/**
 * FeaturePanel — Prominent side panel showing all major interactive features
 * on the Explore globe view with glowing active states.
 */
export default function FeaturePanel({
  hasRoute,
  showWindVectors,
  onToggleWind,
  is4DModeEnabled,
  onToggle4D,
  isCockpitView,
  onEnterCockpit,
  onEnterAR,
  activeOverlayLayer,
  onToggleOverlay,
  isARModeActive,
}) {
  const features = [
    {
      id: "cockpit",
      label: "Cockpit POV",
      subtitle: "First-person flight cam",
      icon: Gauge,
      color: "#00f0ff",
      glowColor: "rgba(0, 240, 255, 0.25)",
      borderColor: "rgba(0, 240, 255, 0.5)",
      active: isCockpitView,
      disabled: !hasRoute,
      disabledHint: "Select a route first",
      onClick: onEnterCockpit,
    },
    {
      id: "4d-schedules",
      label: "4D Time-Travel",
      subtitle: "Future flight simulator",
      icon: Clock,
      color: "#fbbf24",
      glowColor: "rgba(251, 191, 36, 0.25)",
      borderColor: "rgba(251, 191, 36, 0.5)",
      active: is4DModeEnabled,
      onClick: onToggle4D,
    },
    {
      id: "jetstream",
      label: "Jetstream Wind",
      subtitle: "Live atmospheric vectors",
      icon: Wind,
      color: "#a855f7",
      glowColor: "rgba(168, 85, 247, 0.25)",
      borderColor: "rgba(168, 85, 247, 0.5)",
      active: showWindVectors,
      onClick: onToggleWind,
    },
    {
      id: "ar-mode",
      label: "Spatial AR Mode",
      subtitle: "WebXR passthrough overlay",
      icon: Box,
      color: "#34d399",
      glowColor: "rgba(52, 211, 153, 0.25)",
      borderColor: "rgba(52, 211, 153, 0.5)",
      active: isARModeActive,
      onClick: onEnterAR,
    },
  ];

  const overlays = [
    {
      id: "density",
      label: "Flight Density",
      subtitle: "Traffic heatmap",
      icon: Flame,
      color: "#f97316",
      glowColor: "rgba(249, 115, 22, 0.25)",
      borderColor: "rgba(249, 115, 22, 0.5)",
    },
    {
      id: "weather",
      label: "Storm Weather",
      subtitle: "Live weather cells",
      icon: CloudRain,
      color: "#38bdf8",
      glowColor: "rgba(56, 189, 248, 0.25)",
      borderColor: "rgba(56, 189, 248, 0.5)",
    },
  ];

  return (
    <div
      id="feature-panel"
      className="flex flex-col gap-2 w-[170px]"
    >
      {/* Feature Header */}
      <div className="glass px-3 py-2 rounded-xl flex items-center gap-2">
        <span className="text-[10px] font-bold uppercase tracking-widest" style={{ color: "var(--text-muted)" }}>
          Features
        </span>
        <div className="flex-1 h-px" style={{ background: "var(--glass-border)" }} />
      </div>

      {/* Main Feature Buttons */}
      {features.map((feat) => {
        const Icon = feat.icon;
        const isActive = feat.active;
        const isDisabled = feat.disabled;

        return (
          <button
            key={feat.id}
            id={`feature-btn-${feat.id}`}
            onClick={isDisabled ? undefined : feat.onClick}
            title={isDisabled ? feat.disabledHint : feat.label}
            className={`
              relative w-full text-left rounded-2xl px-3 py-2.5 flex items-center gap-2.5
              transition-all duration-200 group border
              ${isDisabled ? "opacity-40 cursor-not-allowed" : "cursor-pointer hover:scale-[1.02] active:scale-[0.98]"}
            `}
            style={{
              background: isActive ? feat.glowColor : "var(--glass-bg)",
              borderColor: isActive ? feat.borderColor : "var(--glass-border)",
              boxShadow: isActive ? `0 0 20px ${feat.glowColor}` : "none",
              backdropFilter: "blur(16px)",
            }}
          >
            {/* Icon */}
            <div
              className="w-7 h-7 rounded-xl flex items-center justify-center flex-shrink-0 transition-all"
              style={{
                background: isActive ? feat.glowColor : "rgba(255,255,255,0.05)",
                border: `1px solid ${isActive ? feat.borderColor : "var(--glass-border)"}`,
              }}
            >
              <Icon
                size={14}
                style={{ color: isActive ? feat.color : "var(--text-muted)" }}
                className={isActive && feat.id === "jetstream" ? "animate-pulse" : ""}
              />
            </div>

            {/* Labels */}
            <div className="flex-1 min-w-0">
              <div
                className="text-[11px] font-bold leading-tight truncate"
                style={{ color: isActive ? feat.color : "var(--text-primary)" }}
              >
                {feat.label}
              </div>
              <div className="text-[9px] leading-tight truncate" style={{ color: "var(--text-muted)" }}>
                {feat.subtitle}
              </div>
            </div>

            {/* Active Indicator */}
            {isActive && (
              <div
                className="w-1.5 h-1.5 rounded-full flex-shrink-0 animate-pulse"
                style={{ background: feat.color }}
              />
            )}

            {/* Chevron for inactive non-disabled */}
            {!isActive && !isDisabled && (
              <ChevronRight
                size={12}
                className="flex-shrink-0 opacity-0 group-hover:opacity-60 transition-opacity"
                style={{ color: "var(--text-muted)" }}
              />
            )}
          </button>
        );
      })}

      {/* Map Overlay Sub-section */}
      <div className="glass px-3 py-2 rounded-xl flex items-center gap-2 mt-1">
        <span className="text-[10px] font-bold uppercase tracking-widest" style={{ color: "var(--text-muted)" }}>
          Overlays
        </span>
        <div className="flex-1 h-px" style={{ background: "var(--glass-border)" }} />
      </div>

      {overlays.map((ovl) => {
        const Icon = ovl.icon;
        const isActive = activeOverlayLayer === ovl.id;
        return (
          <button
            key={ovl.id}
            id={`overlay-btn-${ovl.id}`}
            onClick={() => onToggleOverlay(ovl.id)}
            className={`
              w-full text-left rounded-2xl px-3 py-2.5 flex items-center gap-2.5
              transition-all duration-200 group border cursor-pointer
              hover:scale-[1.02] active:scale-[0.98]
            `}
            style={{
              background: isActive ? ovl.glowColor : "var(--glass-bg)",
              borderColor: isActive ? ovl.borderColor : "var(--glass-border)",
              boxShadow: isActive ? `0 0 16px ${ovl.glowColor}` : "none",
              backdropFilter: "blur(16px)",
            }}
          >
            <div
              className="w-7 h-7 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{
                background: isActive ? ovl.glowColor : "rgba(255,255,255,0.05)",
                border: `1px solid ${isActive ? ovl.borderColor : "var(--glass-border)"}`,
              }}
            >
              <Icon size={14} style={{ color: isActive ? ovl.color : "var(--text-muted)" }} />
            </div>
            <div className="flex-1 min-w-0">
              <div
                className="text-[11px] font-bold leading-tight truncate"
                style={{ color: isActive ? ovl.color : "var(--text-primary)" }}
              >
                {ovl.label}
              </div>
              <div className="text-[9px] leading-tight truncate" style={{ color: "var(--text-muted)" }}>
                {ovl.subtitle}
              </div>
            </div>
            {isActive && (
              <div
                className="w-1.5 h-1.5 rounded-full flex-shrink-0 animate-pulse"
                style={{ background: ovl.color }}
              />
            )}
          </button>
        );
      })}
    </div>
  );
}
