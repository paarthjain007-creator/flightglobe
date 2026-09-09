import { useState, useEffect } from "react";
import { AIRPORTS } from "../data/airports";
import { haversineDistance } from "../utils/flightCalc";

export const REAL_AIRLINES_SCHEDULE_LIST = [
  { name: "Emirates", code: "EK", hub: "DXB" },
  { name: "Etihad Airways", code: "EY", hub: "AUH" },
  { name: "Air India", code: "AI", hub: "DEL" },
  { name: "SWISS International Air Lines", code: "LX", hub: "ZRH" },
  { name: "Lufthansa", code: "LH", hub: "FRA" },
  { name: "British Airways", code: "BA", hub: "LHR" },
  { name: "Qatar Airways", code: "QR", hub: "DOH" },
  { name: "Singapore Airlines", code: "SQ", hub: "SIN" },
  { name: "Qantas", code: "QF", hub: "SYD" },
  { name: "Air France", code: "AF", hub: "CDG" },
  { name: "Delta Air Lines", code: "DL", hub: "ATL" },
  { name: "United Airlines", code: "UA", hub: "ORD" },
  { name: "American Airlines", code: "AA", hub: "DFW" },
  { name: "Japan Airlines", code: "JL", hub: "HND" },
  { name: "All Nippon Airways (ANA)", code: "NH", hub: "NRT" },
  { name: "Turkish Airlines", code: "TK", hub: "IST" },
  { name: "Cathay Pacific", code: "CX", hub: "HKG" },
  { name: "Virgin Atlantic", code: "VS", hub: "LHR" },
];

const AIRCRAFT_MODELS = [
  "Airbus A350-1000",
  "Boeing 787-9 Dreamliner",
  "Airbus A380-800",
  "Boeing 777-300ER",
  "Airbus A330-900neo",
  "Boeing 787-10 Dreamliner",
];

/**
 * Generates dynamic, realistic flight schedules for all route legs
 * calculating true departure/arrival timestamps, real flight numbers, and distance rates
 */
function generate7DayScheduleForWaypoints(waypoints = []) {
  const valid = (waypoints || []).filter(Boolean);
  if (valid.length < 2) {
    const defaultOrigin = AIRPORTS[0];
    const defaultDest = AIRPORTS[1];
    return generateLegSchedules(defaultOrigin, defaultDest, 0);
  }

  const fullSchedule = [];

  for (let legIdx = 0; legIdx < valid.length - 1; legIdx++) {
    const legOrigin = valid[legIdx];
    const legDest = valid[legIdx + 1];

    const legSchedules = generateLegSchedules(legOrigin, legDest, legIdx);
    fullSchedule.push(...legSchedules);
  }

  return fullSchedule;
}

function generateLegSchedules(origin, dest, legIndex = 0) {
  const oLat = origin?.lat ?? origin?.latitude ?? 0;
  const oLng = origin?.lng ?? origin?.lon ?? origin?.longitude ?? 0;
  const dLat = dest?.lat ?? dest?.latitude ?? 0;
  const dLng = dest?.lng ?? dest?.lon ?? dest?.longitude ?? 0;

  const rawDist = haversineDistance(oLat, oLng, dLat, dLng);
  const distKm = Number.isFinite(rawDist) && rawDist > 0 ? rawDist : 5500;
  const flightHours = distKm / 820 + 0.45; // ~820 km/h cruise + taxi
  const durationMs = Number.isFinite(flightHours) ? Math.round(flightHours * 3600 * 1000) : 6 * 3600 * 1000;

  const now = new Date();
  const startTime = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate())).getTime();

  const schedule = [];
  const departureHours = [6, 9, 12, 15, 18, 21];

  for (let day = 0; day < 7; day++) {
    const dayMs = startTime + day * 24 * 3600 * 1000;

    departureHours.forEach((baseHour, idx) => {
      const hour = (baseHour + legIndex * 3) % 24;
      const rawDepMs = dayMs + hour * 3600 * 1000 + (idx % 2 === 0 ? 15 : 45) * 60 * 1000;
      const depMs = Number.isFinite(rawDepMs) ? rawDepMs : Date.now();
      const arrMs = depMs + durationMs;

      const airlineObj = REAL_AIRLINES_SCHEDULE_LIST[(day + idx + legIndex) % REAL_AIRLINES_SCHEDULE_LIST.length];
      const flightNum = `${airlineObj.code}${101 + ((day * 13 + idx * 7 + legIndex * 19) % 890)}`;
      const aircraft = AIRCRAFT_MODELS[(idx + day + legIndex) % AIRCRAFT_MODELS.length];

      const isPeakHour = hour === 18 || hour === 9;
      const isWeekend = day === 5 || day === 6;
      const delayProb = isPeakHour ? 32 + Math.floor(Math.random() * 18) : 10 + Math.floor(Math.random() * 12);
      const priceUSD = Math.round(
        Math.max(150, (distKm * 0.095 + 85) * (isWeekend ? 1.25 : 1.0) * (isPeakHour ? 1.15 : 0.95))
      );

      const oriIata = origin?.iata || origin?.code || "ORI";
      const dstIata = dest?.iata || dest?.code || "DST";

      schedule.push({
        id: `sched-leg${legIndex}-${oriIata}-${dstIata}-${day}-${idx}`,
        legIndex,
        flightNum,
        airline: airlineObj.name,
        airlineCode: airlineObj.code,
        aircraft,
        origin: origin || { iata: oriIata, city: "Origin" },
        destination: dest || { iata: dstIata, city: "Destination" },
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
