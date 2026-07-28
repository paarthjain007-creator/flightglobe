const R = 6371; // Earth radius in km

export function toRad(deg) {
  return (deg * Math.PI) / 180;
}

export function haversineDistance(lat1, lng1, lat2, lng2) {
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c; // km
}

export function estimateFlightTime(distKm) {
  const cruiseSpeed = 850; // km/h
  const buffer = 0.75; // hours (taxi + takeoff + landing)
  const hours = distKm / cruiseSpeed + buffer;
  const h = Math.floor(hours);
  const m = Math.round((hours - h) * 60);
  return { hours: h, minutes: m, totalHours: hours };
}

export function estimateTicketCost(distKm) {
  // Tiered pricing model (USD) based on distance
  let baseCost;
  if (distKm < 500) baseCost = distKm * 0.22;
  else if (distKm < 2000) baseCost = distKm * 0.16;
  else if (distKm < 5000) baseCost = distKm * 0.12;
  else if (distKm < 10000) baseCost = distKm * 0.09;
  else baseCost = distKm * 0.07;

  // Add minimum floor prices
  baseCost = Math.max(baseCost, 80);

  return {
    economy: Math.round(baseCost),
    business: Math.round(baseCost * 2.8),
    first: Math.round(baseCost * 5.5),
  };
}

export function formatDistance(km) {
  return {
    km: Math.round(km).toLocaleString(),
    miles: Math.round(km * 0.621371).toLocaleString(),
  };
}

export function formatFlightTime(hours, minutes) {
  if (hours === 0) return `${minutes}m`;
  if (minutes === 0) return `${hours}h`;
  return `${hours}h ${minutes}m`;
}

// Simulated flight status generator
const STATUS_OPTIONS = ["On Time", "On Time", "On Time", "Delayed", "Boarding", "Departed"];
const DELAY_REASONS = ["Weather", "Air Traffic", "Technical", "Crew", "Late Arrival"];
const AIRLINES = ["Emirates", "Qatar Airways", "Lufthansa", "British Airways", "Singapore Airlines", "Delta", "United", "American"];
const TERMINALS = ["A", "B", "C", "D", "T1", "T2", "T3"];

export function generateFlightStatus(origin, destination) {
  const seed = (origin.iata + destination.iata).charCodeAt(0) + Date.now() % 1000;
  const rand = (n) => Math.floor((seed * 9301 + 49297) % 233280 / 233280 * n);

  const status = STATUS_OPTIONS[rand(STATUS_OPTIONS.length)];
  const airline = AIRLINES[rand(AIRLINES.length)];
  const flightNum = `${airline.substring(0,2).toUpperCase()}${100 + rand(900)}`;
  const gate = `${TERMINALS[rand(TERMINALS.length)]}${rand(30) + 1}`;
  const delayMin = status === "Delayed" ? (rand(3) + 1) * 15 : 0;
  const delayReason = delayMin > 0 ? DELAY_REASONS[rand(DELAY_REASONS.length)] : null;

  // Departure time (next few hours from now)
  const now = new Date();
  now.setHours(now.getHours() + rand(8) + 1);
  now.setMinutes([0, 15, 30, 45][rand(4)]);
  const depTime = now.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });

  return { status, airline, flightNum, gate, delayMin, delayReason, depTime };
}
