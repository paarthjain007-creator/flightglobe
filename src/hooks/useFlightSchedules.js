import { useState, useEffect } from "react";
import { AIRPORTS } from "../data/airports";
import { haversineDistance } from "../utils/flightCalc";

const AIRLINES_LIST = [
  { name: "Delta Air Lines", code: "DL" },
  { name: "British Airways", code: "BA" },
  { name: "Emirates", code: "EK" },
  { name: "Singapore Airlines", code: "SQ" },
  { name: "Air France", code: "AF" },
  { name: "Lufthansa", code: "LH" },
  { name: "United Airlines", code: "UA" },
  { name: "Qatar Airways", code: "QR" },
];

const AIRCRAFT_MODELS = [
  "Boeing 787-9 Dreamliner",
  "Airbus A350-900",
  "Boeing 777-300ER",
  "Airbus A330neo",
  "Boeing 737 MAX 9",
];

/**
 * Normalizes API response or generates 7-day schedule matrix for all route legs
 */
function generate7DayScheduleForWaypoints(waypoints = []) {
  const valid = (waypoints || []).filter(Boolean);
  if (valid.length < 2) {
    const defaultOrigin = AIRPORTS[0];
    const defaultDest = AIRPORTS[1];
    return generateLegSchedules(defaultOrigin, defaultDest, 0);
  }

  const fullSchedule = [];

  // Generate connected leg flight schedules for each segment in multi-leg journey
  for (let legIdx = 0; legIdx < valid.length - 1; legIdx++) {
    const legOrigin = valid[legIdx];
    const legDest = valid[legIdx + 1];

    const legSchedules = generateLegSchedules(legOrigin, legDest, legIdx);
    fullSchedule.push(...legSchedules);
  }

  return fullSchedule;
}

function generateLegSchedules(origin, dest, legIndex = 0) {
  const distKm = haversineDistance(origin.lat, origin.lng, dest.lat, dest.lng);
  const flightHours = distKm / 800 + 0.5; // ~800 km/h cruise + taxi
  const durationMs = Math.round(flightHours * 3600 * 1000);

  const now = new Date();
  const startTime = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate())).getTime();

  const schedule = [];
  const departureHours = [6, 9, 12, 15, 18, 21];

  for (let day = 0; day < 7; day++) {
    const dayMs = startTime + day * 24 * 3600 * 1000;

    departureHours.forEach((baseHour, idx) => {
      // Offset multi-leg segment departure times sequentially after layovers
      const hour = (baseHour + legIndex * 3) % 24;
      const depMs = dayMs + hour * 3600 * 1000 + (idx % 2 === 0 ? 15 : 45) * 60 * 1000;
      const arrMs = depMs + durationMs;

      const airlineObj = AIRLINES_LIST[(day + idx + legIndex) % AIRLINES_LIST.length];
      const flightNum = `${airlineObj.code}${200 + ((day * 10 + idx * 7 + legIndex * 13) % 700)}`;
      const aircraft = AIRCRAFT_MODELS[(idx + day + legIndex) % AIRCRAFT_MODELS.length];

      const isPeakHour = hour === 18 || hour === 9;
      const isWeekend = day === 5 || day === 6;
      const delayProb = isPeakHour ? 35 + Math.floor(Math.random() * 20) : 10 + Math.floor(Math.random() * 15);
      const priceUSD = Math.round(
        Math.max(120, distKm * 0.12 * (isWeekend ? 1.35 : 1.0) * (isPeakHour ? 1.2 : 0.95))
      );

      schedule.push({
        id: `sched-leg${legIndex}-${origin.iata}-${dest.iata}-${day}-${idx}`,
        legIndex,
        flightNum,
        airline: airlineObj.name,
        airlineCode: airlineObj.code,
        aircraft,
        origin,
        destination: dest,
        depTime: new Date(depMs).toISOString(),
        arrTime: new Date(arrMs).toISOString(),
        depTimestamp: depMs,
        arrTimestamp: arrMs,
        durationMinutes: Math.round(flightHours * 60),
        priceUSD,
        delayProbability: delayProb,
        dayOffset: day,
      });
    });
  }

  return schedule;
}

export function useFlightSchedules(originAirport, destinationAirport, waypoints = []) {
  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(false);
  const [dailyForecast, setDailyForecast] = useState([]);

  const validWps = waypoints.filter(Boolean).length >= 2 ? waypoints.filter(Boolean) : [originAirport, destinationAirport].filter(Boolean);
  const waypointsKey = validWps.map((w) => w?.iata ?? "").join("-");

  useEffect(() => {
    let isMounted = true;
    setLoading(true);

    const fullSchedule = generate7DayScheduleForWaypoints(validWps);

    // Compute 7-day price & delay forecast metrics
    const forecast = Array.from({ length: 7 }, (_, dayIdx) => {
      const dayFlights = fullSchedule.filter((s) => s.dayOffset === dayIdx);
      const avgPrice = Math.round(
        dayFlights.reduce((sum, f) => sum + f.priceUSD, 0) / (dayFlights.length || 1)
      );
      const avgDelayRisk = Math.round(
        dayFlights.reduce((sum, f) => sum + f.delayProbability, 0) / (dayFlights.length || 1)
      );

      const dateObj = new Date(dayFlights[0]?.depTimestamp || Date.now());
      const dayLabel = dateObj.toLocaleDateString("en-US", { weekday: "short", month: "numeric", day: "numeric" });

      return {
        dayIndex: dayIdx,
        label: dayLabel,
        avgPrice,
        avgDelayRisk,
        flightCount: dayFlights.length,
      };
    });

    if (isMounted) {
      setSchedules(fullSchedule);
      setDailyForecast(forecast);
      setLoading(false);
    }

    return () => {
      isMounted = false;
    };
  }, [waypointsKey]);

  return { schedules, dailyForecast, loading };
}
