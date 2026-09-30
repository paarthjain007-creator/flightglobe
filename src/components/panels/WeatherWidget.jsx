import React from "react";
import { Cloud, Wind, Droplets, Eye, Thermometer, Loader2 } from "lucide-react";
import GlassCard from "../ui/GlassCard";
import { useWeather, weatherCodeToDescription, weatherCodeToEmoji } from "../../hooks/useWeather";

function StatBadge({ icon: Icon, label, value }) {
  return (
    <div className="flex items-center gap-2 rounded-xl px-3 py-2" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}>
      <Icon size={12} style={{ color: "#2997ff" }} />
      <div>
        <div className="text-xs text-[#86868b]">{label}</div>
        <div className="text-sm font-semibold text-[#f5f5f7]">{value}</div>
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
        <Cloud size={14} style={{ color: "#2997ff" }} />
        <span className="text-xs font-semibold uppercase tracking-wider text-[#86868b]">
          Destination Weather
        </span>
      </div>

      <div className="text-sm font-medium mb-3 text-[#f5f5f7]">
        {airport.city}, {airport.country}
      </div>

      {loading && (
        <div className="flex items-center gap-2 py-4 justify-center">
          <Loader2 size={16} className="animate-spin" style={{ color: "#2997ff" }} />
          <span className="text-xs text-[#86868b]">Fetching weather…</span>
        </div>
      )}

      {error && (
        <div className="text-xs text-center py-3 rounded-lg" style={{ color: "#ff453a", background: "rgba(255,69,58,0.08)" }}>
          {error}
        </div>
      )}

      {weather && !loading && (
        <>
          <div className="flex items-center gap-4 mb-4">
            <div className="text-5xl leading-none">{weatherCodeToEmoji(weather.weathercode, weather.isDay)}</div>
            <div>
              <div className="text-3xl font-bold font-mono text-[#f5f5f7]">
                {weather.temp}°C
              </div>
              {weather.feelsLike !== null && (
                <div className="text-xs mt-0.5 text-[#86868b]">
                  Feels like {weather.feelsLike}°C
                </div>
              )}
              <div className="text-xs font-medium mt-1 text-[#F8FAFC]">
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
