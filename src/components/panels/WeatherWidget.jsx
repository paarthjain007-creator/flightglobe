import React from "react";
import { Cloud, Wind, Droplets, Eye, Thermometer, Loader2 } from "lucide-react";
import GlassCard from "../ui/GlassCard";
import { useWeather, weatherCodeToDescription, weatherCodeToEmoji } from "../../hooks/useWeather";

function StatBadge({ icon: Icon, label, value }) {
  return (
    <div className="flex items-center gap-2 rounded-xl px-3 py-2" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid var(--glass-border)" }}>
      <Icon size={12} style={{ color: "var(--accent)" }} />
      <div>
        <div className="text-xs" style={{ color: "var(--text-muted)" }}>{label}</div>
        <div className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>{value}</div>
      </div>
    </div>
  );
}

export default function WeatherWidget({ airport }) {
  const { weather, loading, error } = useWeather(airport);

  if (!airport) return null;

  return (
    <GlassCard className="p-4" animate="animate-slide-up">
      <div className="flex items-center gap-2 mb-3">
        <Cloud size={14} style={{ color: "var(--accent)" }} />
        <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>
          Destination Weather
        </span>
      </div>

      <div className="text-sm font-medium mb-3" style={{ color: "var(--text-primary)" }}>
        {airport.city}, {airport.country}
      </div>

      {loading && (
        <div className="flex items-center gap-2 py-4 justify-center">
          <Loader2 size={16} className="animate-spin" style={{ color: "var(--accent)" }} />
          <span className="text-xs" style={{ color: "var(--text-muted)" }}>Fetching weather…</span>
        </div>
      )}

      {error && (
        <div className="text-xs text-center py-3 rounded-lg" style={{ color: "#f87171", background: "rgba(248,113,113,0.08)" }}>
          {error}
        </div>
      )}

      {weather && !loading && (
        <>
          <div className="flex items-center gap-4 mb-4">
            <div className="text-5xl leading-none">{weatherCodeToEmoji(weather.weathercode, weather.isDay)}</div>
            <div>
              <div className="text-3xl font-bold" style={{ color: "var(--accent)" }}>
                {weather.temp}°C
              </div>
              {weather.feelsLike !== null && (
                <div className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>
                  Feels like {weather.feelsLike}°C
                </div>
              )}
              <div className="text-xs font-medium mt-1" style={{ color: "var(--text-primary)" }}>
                {weatherCodeToDescription(weather.weathercode)}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2">
            <StatBadge icon={Wind} label="Wind" value={`${weather.windspeed} km/h`} />
            <StatBadge icon={Droplets} label="Humidity" value={`${weather.humidity}%`} />
            <StatBadge icon={Cloud} label="Cloud" value={`${weather.cloudcover}%`} />
          </div>
        </>
      )}
    </GlassCard>
  );
}
