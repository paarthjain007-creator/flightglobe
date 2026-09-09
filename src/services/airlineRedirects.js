/**
 * airlineRedirects.js
 *
 * Centralized mapping utility for direct airline booking deep links.
 * Each airline entry contains: name, booking URL builder, and fallback URL.
 */

const AIRLINE_REDIRECTS = {
  // ── Indian Domestic ──────────────────────────────────────────
  AI: {
    name: "Air India",
    buildUrl: ({ origin, destination, date, passengers, cabinClass }) =>
      `https://www.airindia.com/in/en/book/flights.html?origin=${origin}&destination=${destination}&date=${date}&adults=${passengers || 1}&class=${cabinClass || 'economy'}`,
    fallback: "https://www.airindia.com/in/en/book/flights.html",
  },
  "6E": {
    name: "IndiGo",
    buildUrl: ({ origin, destination, date, passengers }) =>
      `https://www.goindigo.in/flight-search.html?origin=${origin}&destination=${destination}&date=${date}&adults=${passengers || 1}`,
    fallback: "https://www.goindigo.in/",
  },
  SG: {
    name: "SpiceJet",
    buildUrl: ({ origin, destination, date }) =>
      `https://www.spicejet.com/flights/${origin}-to-${destination}?date=${date}`,
    fallback: "https://www.spicejet.com/",
  },
  UK: {
    name: "Vistara (Air India)",
    buildUrl: ({ origin, destination, date }) =>
      `https://www.airindia.com/in/en/book/flights.html?origin=${origin}&destination=${destination}&date=${date}`,
    fallback: "https://www.airindia.com/",
  },
  QP: {
    name: "Akasa Air",
    buildUrl: ({ origin, destination, date }) =>
      `https://www.akasaair.com/fly?origin=${origin}&destination=${destination}&date=${date}`,
    fallback: "https://www.akasaair.com/",
  },
  IX: {
    name: "Air India Express",
    buildUrl: ({ origin, destination, date }) =>
      `https://www.airindiaexpress.com/search-flights?origin=${origin}&destination=${destination}&date=${date}`,
    fallback: "https://www.airindiaexpress.com/",
  },
  G8: {
    name: "Go First",
    buildUrl: () => `https://www.flygofirst.com/`,
    fallback: "https://www.flygofirst.com/",
  },
  I5: {
    name: "AirAsia India",
    buildUrl: ({ origin, destination, date }) =>
      `https://www.airasia.com/flights/search?origin=${origin}&destination=${destination}&departDate=${date}`,
    fallback: "https://www.airasia.com/",
  },

  // ── Gulf / Middle East ───────────────────────────────────────
  EK: {
    name: "Emirates",
    buildUrl: ({ origin, destination, date, passengers, cabinClass }) =>
      `https://www.emirates.com/flights/search?origin=${origin}&destination=${destination}&date=${date}&pax=${passengers || 1}&class=${cabinClass || 'economy'}`,
    fallback: "https://www.emirates.com/",
  },
  EY: {
    name: "Etihad Airways",
    buildUrl: ({ origin, destination, date }) =>
      `https://www.etihad.com/en/fly-etihad/book-a-flight?departure=${origin}&arrival=${destination}&date=${date}`,
    fallback: "https://www.etihad.com/",
  },
  QR: {
    name: "Qatar Airways",
    buildUrl: ({ origin, destination, date, passengers, cabinClass }) =>
      `https://www.qatarairways.com/en/booking/book-a-flight.html?from=${origin}&to=${destination}&departing=${date}&adults=${passengers || 1}&class=${cabinClass || 'Economy'}`,
    fallback: "https://www.qatarairways.com/",
  },

  // ── European ─────────────────────────────────────────────────
  LH: {
    name: "Lufthansa",
    buildUrl: ({ origin, destination, date, passengers, cabinClass }) =>
      `https://www.lufthansa.com/xx/en/flight-search?origin=${origin}&destination=${destination}&outDate=${date}&adults=${passengers || 1}&cabin=${cabinClass || 'economy'}`,
    fallback: "https://www.lufthansa.com/",
  },
  LX: {
    name: "SWISS",
    buildUrl: ({ origin, destination, date }) =>
      `https://www.swiss.com/xx/en/book/offers?origin=${origin}&destination=${destination}&date=${date}`,
    fallback: "https://www.swiss.com/",
  },
  BA: {
    name: "British Airways",
    buildUrl: ({ origin, destination, date, passengers, cabinClass }) =>
      `https://www.britishairways.com/travel/book/public/en_gb?from=${origin}&to=${destination}&depDate=${date}&ADT=${passengers || 1}&cabin=${cabinClass || 'M'}`,
    fallback: "https://www.britishairways.com/",
  },
  AF: {
    name: "Air France",
    buildUrl: ({ origin, destination, date }) =>
      `https://www.airfrance.com/search/offer?origin=${origin}&destination=${destination}&outboundDate=${date}`,
    fallback: "https://www.airfrance.com/",
  },
  TK: {
    name: "Turkish Airlines",
    buildUrl: ({ origin, destination, date }) =>
      `https://www.turkishairlines.com/en-int/flights/?origin=${origin}&destination=${destination}&date=${date}`,
    fallback: "https://www.turkishairlines.com/",
  },
  VS: {
    name: "Virgin Atlantic",
    buildUrl: ({ origin, destination, date }) =>
      `https://www.virginatlantic.com/flight-search?origin=${origin}&destination=${destination}&date=${date}`,
    fallback: "https://www.virginatlantic.com/",
  },

  // ── Americas ─────────────────────────────────────────────────
  DL: {
    name: "Delta Air Lines",
    buildUrl: ({ origin, destination, date, passengers }) =>
      `https://www.delta.com/flight-search/search?tripType=ONE_WAY&origin=${origin}&destination=${destination}&departureDate=${date}&paxCount=${passengers || 1}`,
    fallback: "https://www.delta.com/",
  },
  UA: {
    name: "United Airlines",
    buildUrl: ({ origin, destination, date }) =>
      `https://www.united.com/en/us/fsr/choose-flights?f=${origin}&t=${destination}&d=${date}&tt=1`,
    fallback: "https://www.united.com/",
  },
  AA: {
    name: "American Airlines",
    buildUrl: ({ origin, destination, date }) =>
      `https://www.aa.com/booking/find-flights?origin=${origin}&destination=${destination}&departDate=${date}`,
    fallback: "https://www.aa.com/",
  },

  // ── Asia-Pacific ─────────────────────────────────────────────
  SQ: {
    name: "Singapore Airlines",
    buildUrl: ({ origin, destination, date, passengers, cabinClass }) =>
      `https://www.singaporeair.com/en_UK/plan-and-book/book-flight/?origin=${origin}&destination=${destination}&departureDate=${date}&cabinClass=${cabinClass || 'Y'}&adults=${passengers || 1}`,
    fallback: "https://www.singaporeair.com/",
  },
  CX: {
    name: "Cathay Pacific",
    buildUrl: ({ origin, destination, date }) =>
      `https://www.cathaypacific.com/flights?from=${origin}&to=${destination}&date=${date}`,
    fallback: "https://www.cathaypacific.com/",
  },
  QF: {
    name: "Qantas",
    buildUrl: ({ origin, destination, date }) =>
      `https://www.qantas.com/au/en/book-a-trip/flights?from=${origin}&to=${destination}&date=${date}`,
    fallback: "https://www.qantas.com/",
  },
  JL: {
    name: "Japan Airlines",
    buildUrl: ({ origin, destination, date }) =>
      `https://www.jal.co.jp/en/flight/search?from=${origin}&to=${destination}&date=${date}`,
    fallback: "https://www.jal.co.jp/",
  },
  NH: {
    name: "All Nippon Airways",
    buildUrl: ({ origin, destination, date }) =>
      `https://www.ana.co.jp/en/us/book-plan/search/?origin=${origin}&destination=${destination}&date=${date}`,
    fallback: "https://www.ana.co.jp/",
  },
};

/**
 * Get the airline booking URL for a given airline code.
 *
 * @param {string} airlineCode - IATA 2-letter airline code (e.g. "EK", "AI", "6E")
 * @param {Object} params - { origin, destination, date, passengers, cabinClass }
 * @returns {{ name: string, url: string, isDirect: boolean }}
 */
export function getAirlineBookingUrl(airlineCode, params = {}) {
  const entry = AIRLINE_REDIRECTS[airlineCode];

  if (entry) {
    try {
      const url = entry.buildUrl(params);
      return { name: entry.name, url, isDirect: true };
    } catch {
      return { name: entry.name, url: entry.fallback, isDirect: false };
    }
  }

  // Fallback: generic Google Flights search
  const { origin, destination, date } = params;
  const googleUrl = `https://www.google.com/travel/flights?q=flights+from+${origin || ''}+to+${destination || ''}+on+${date || ''}`;
  return { name: airlineCode, url: googleUrl, isDirect: false };
}

/**
 * Get the airline display name for a given code.
 */
export function getAirlineName(airlineCode) {
  return AIRLINE_REDIRECTS[airlineCode]?.name || airlineCode;
}

export default AIRLINE_REDIRECTS;
