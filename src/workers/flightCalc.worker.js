// Web Worker for heavy flight calculations
// Runs off the main thread to keep UI responsive

const R = 6371; // Earth radius km

function toRad(deg) { return (deg * Math.PI) / 180; }

function haversine(lat1, lng1, lat2, lng2) {
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function estimateTime(km) {
  const cruiseSpeed = 850;
  const buffer = 0.75; // hours per leg
  const totalHours = km / cruiseSpeed + buffer;
  return {
    totalHours,
    hours: Math.floor(totalHours),
    minutes: Math.round((totalHours - Math.floor(totalHours)) * 60),
  };
}

self.onmessage = function (e) {
  const { airports } = e.data; // Array of { lat, lng, iata }

  if (!airports || airports.length < 2) {
    self.postMessage({ error: "Need at least 2 airports" });
    return;
  }

  const legs = [];
  let totalKm = 0;
  let totalHours = 0;

  for (let i = 0; i < airports.length - 1; i++) {
    const a = airports[i];
    const b = airports[i + 1];
    const lat1 = Number(a?.lat || 0);
    const lng1 = Number(a?.lng ?? a?.lon ?? 0);
    const lat2 = Number(b?.lat || 0);
    const lng2 = Number(b?.lng ?? b?.lon ?? 0);
    const km = haversine(lat1, lng1, lat2, lng2);
    const time = estimateTime(km);
    totalKm += km;
    totalHours += time.totalHours;
    legs.push({
      from: a?.iata || a?.code || "ORIG",
      to: b?.iata || b?.code || "DEST",
      km: Math.round(km),
      miles: Math.round(km * 0.621371),
      time: { hours: time.hours, minutes: time.minutes },
    });
  }

  const totalMiles = Math.round(totalKm * 0.621371);
  totalKm = Math.round(totalKm);

  // CO2 Calculation: ~90 kg CO2 per person per hour (economy)
  const co2Kg = Math.round(totalHours * 90);
  const co2Tons = +(co2Kg / 1000).toFixed(3);
  const offsetCostUSD = Math.round(co2Tons * 15 * 100) / 100; // $15/ton

  const totalHoursFloor = Math.floor(totalHours);
  const totalMinutes = Math.round((totalHours - totalHoursFloor) * 60);

  self.postMessage({
    legs,
    totalKm,
    totalMiles,
    totalTime: { hours: totalHoursFloor, minutes: totalMinutes, totalHours },
    co2Kg,
    co2Tons,
    offsetCostUSD,
  });
};
