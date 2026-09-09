/**
 * Netlify Serverless Function for Dynamic 7-Day GDS Fare Matrix.
 */

const CURRENCY_SYMBOLS = {
  USD: "$",
  EUR: "€",
  GBP: "£",
  INR: "₹",
  AED: "AED ",
  CHF: "CHF ",
  JPY: "¥",
  AUD: "A$",
};

const FX_RATES = {
  USD: 1.0,
  EUR: 0.92,
  GBP: 0.79,
  INR: 86.5,
  AED: 3.67,
  CHF: 0.90,
  JPY: 154.2,
  AUD: 1.54,
};

const CORE_AIRPORT_COORDS = {
  JFK: { lat: 40.64, lng: -73.77 },
  LHR: { lat: 51.47, lng: -0.45 },
  DEL: { lat: 28.55, lng: 77.10 },
  DXB: { lat: 25.25, lng: 55.36 },
  SIN: { lat: 1.36, lng: 103.99 },
  HND: { lat: 35.54, lng: 139.77 },
  SFO: { lat: 37.62, lng: -122.38 },
  SYD: { lat: -33.94, lng: 151.17 },
  CDG: { lat: 49.00, lng: 2.54 },
  FRA: { lat: 50.03, lng: 8.57 },
  AMS: { lat: 52.31, lng: 4.76 },
};

function haversineDistance(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  return R * (2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)));
}

export async function handler(event, _context) {
  const headers = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
    "Content-Type": "application/json",
    "Cache-Control": "public, max-age=60",
  };

  const params = event.queryStringParameters || {};
  const originCode = (params.origin || "JFK").toUpperCase();
  const destCode = (params.destination || "LHR").toUpperCase();
  const currencyCode = (params.currency || "USD").toUpperCase();
  const departureDateStr = params.departureDate || new Date().toISOString().split("T")[0];

  const origin = CORE_AIRPORT_COORDS[originCode] || { lat: 40.64, lng: -73.77 };
  const dest = CORE_AIRPORT_COORDS[destCode] || { lat: 51.47, lng: -0.45 };

  const distKm = haversineDistance(origin.lat, origin.lng, dest.lat, dest.lng);
  const baseUsd = Math.round(Math.max(120, distKm * 0.085 + 75));

  const fxRate = FX_RATES[currencyCode] || 1.0;
  const symbol = CURRENCY_SYMBOLS[currencyCode] || "$";
  const baseDate = new Date(departureDateStr);

  const matrix = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(baseDate);
    d.setDate(d.getDate() + (i - 3));

    const dayName = d.toLocaleDateString("en-US", { weekday: "short" });
    const dateStr = d.toISOString().split("T")[0];
    const dayOfWeek = d.getDay();
    const multiplier = dayOfWeek === 0 || dayOfWeek === 6 ? 1.22 : dayOfWeek === 2 || dayOfWeek === 3 ? 0.86 : 1.0;
    const usdFare = Math.round(baseUsd * multiplier + (i % 3) * 15);
    const convertedFare = Math.round(usdFare * fxRate);

    return {
      dateStr,
      dayName,
      dayNumber: d.getDate(),
      price: convertedFare,
      symbol,
      isCheapest: dayOfWeek === 2 || dayOfWeek === 3,
      isSelected: i === 3,
    };
  });

  return {
    statusCode: 200,
    headers,
    body: JSON.stringify({
      status: "ok",
      origin: originCode,
      destination: destCode,
      distKm: Math.round(distKm),
      currency: currencyCode,
      matrix,
    }),
  };
}
