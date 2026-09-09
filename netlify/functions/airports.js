/**
 * Netlify Serverless Function for Global Airport Autocomplete & Resolver.
 * Connects directly to the comprehensive 350+ commercial airports dataset with
 * typo correction, fuzzy search, and dynamic global fallback.
 */

import { searchAirports, getAirportByIata } from "../../src/data/airports.js";

export async function handler(event, _context) {
  const headers = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
    "Content-Type": "application/json",
    "Cache-Control": "public, max-age=120",
  };

  if (event.httpMethod === "OPTIONS") {
    return { statusCode: 204, headers, body: "" };
  }

  const q = (event.queryStringParameters?.q || "").trim();

  // If empty query, return top major global hubs
  if (!q) {
    const defaultHubs = searchAirports("").slice(0, 10);
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ status: "ok", results: defaultHubs, count: defaultHubs.length }),
    };
  }

  // Exact 3-letter IATA resolution request
  if (q.length === 3 && /^[a-zA-Z]{3}$/.test(q)) {
    const airport = getAirportByIata(q);
    if (airport) {
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ status: "ok", results: [airport], count: 1 }),
      };
    }
  }

  const results = searchAirports(q);

  return {
    statusCode: 200,
    headers,
    body: JSON.stringify({ status: "ok", results, count: results.length }),
  };
}

