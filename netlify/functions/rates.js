/**
 * Netlify Serverless Function for Live Financial Forex Exchange Rates.
 */

let cachedFxRates = {
  USD: 1.0,
  EUR: 0.92,
  GBP: 0.79,
  INR: 86.5,
  AED: 3.67,
  CHF: 0.90,
  JPY: 154.2,
  AUD: 1.54,
  CAD: 1.38,
  NZD: 1.68,
  ZAR: 18.2,
  BRL: 5.65,
  SGD: 1.35,
  HKD: 7.82,
  CNY: 7.24,
  MYR: 4.42,
  THB: 35.8,
  PKR: 278.5,
  SAR: 3.75,
};
let fxCacheTimestamp = 0;
const FX_CACHE_TTL = 3600_000;

export async function handler(_event, _context) {
  const headers = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
    "Content-Type": "application/json",
    "Cache-Control": "public, max-age=300",
  };

  const now = Date.now();
  if (now - fxCacheTimestamp < FX_CACHE_TTL) {
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ status: "ok", rates: cachedFxRates, base: "USD", ts: fxCacheTimestamp }),
    };
  }

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 3000);
    const res = await fetch("https://open.er-api.com/v6/latest/USD", { signal: controller.signal });
    clearTimeout(timeout);

    if (res.ok) {
      const data = await res.json();
      if (data && data.rates) {
        cachedFxRates = { ...cachedFxRates, ...data.rates };
        fxCacheTimestamp = now;
      }
    }
  } catch (err) {
    // Fallback to cachedFxRates
  }

  return {
    statusCode: 200,
    headers,
    body: JSON.stringify({ status: "ok", rates: cachedFxRates, base: "USD", ts: fxCacheTimestamp || now }),
  };
}
