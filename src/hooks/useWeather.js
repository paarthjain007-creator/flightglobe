import { useState, useEffect } from "react";

export function useWeather(airport) {
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!airport) {
      setWeather(null);
      return;
    }

    const controller = new AbortController();
    setLoading(true);
    setError(null);

    const url = `https://api.open-meteo.com/v1/forecast?latitude=${airport.lat}&longitude=${airport.lng}&current_weather=true&hourly=relativehumidity_2m,cloudcover,apparent_temperature&timezone=auto&forecast_days=1`;

    fetch(url, { signal: controller.signal })
      .then((r) => r.json())
      .then((data) => {
        const cw = data.current_weather;
        const hourly = data.hourly;
        const idx = 0;
        setWeather({
          temp: Math.round(cw.temperature),
          windspeed: Math.round(cw.windspeed),
          weathercode: cw.weathercode,
          isDay: cw.is_day,
          humidity: hourly?.relativehumidity_2m?.[idx] ?? "N/A",
          cloudcover: hourly?.cloudcover?.[idx] ?? 0,
          feelsLike: hourly?.apparent_temperature
            ? Math.round(hourly.apparent_temperature[idx])
            : null,
        });
        setLoading(false);
      })
      .catch((err) => {
        if (err.name !== "AbortError") {
          setError("Weather data unavailable");
          setLoading(false);
        }
      });

    return () => controller.abort();
  }, [airport?.iata]);

  return { weather, loading, error };
}

export function weatherCodeToDescription(code) {
  const codes = {
    0: "Clear Sky", 1: "Mainly Clear", 2: "Partly Cloudy", 3: "Overcast",
    45: "Fog", 48: "Icy Fog",
    51: "Light Drizzle", 53: "Moderate Drizzle", 55: "Dense Drizzle",
    61: "Slight Rain", 63: "Moderate Rain", 65: "Heavy Rain",
    71: "Slight Snow", 73: "Moderate Snow", 75: "Heavy Snow",
    77: "Snow Grains",
    80: "Slight Showers", 81: "Moderate Showers", 82: "Heavy Showers",
    85: "Slight Snow Showers", 86: "Heavy Snow Showers",
    95: "Thunderstorm", 96: "Thunderstorm w/ Hail", 99: "Thunderstorm w/ Heavy Hail",
  };
  return codes[code] ?? "Unknown";
}

export function weatherCodeToEmoji(code, isDay = 1) {
  if (code === 0) return isDay ? "☀️" : "🌙";
  if (code <= 2) return isDay ? "⛅" : "🌤️";
  if (code === 3) return "☁️";
  if (code <= 48) return "🌫️";
  if (code <= 55) return "🌦️";
  if (code <= 65) return "🌧️";
  if (code <= 77) return "❄️";
  if (code <= 82) return "🌨️";
  if (code <= 86) return "🌨️";
  return "⛈️";
}
