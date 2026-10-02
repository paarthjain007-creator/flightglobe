/**
 * airlineRedirects.js
 *
 * Centralized mapping utility for direct airline booking deep links.
 * Due to airlines employing bot-protection (Akamai/Cloudflare) and session-based 
 * POST routing for their booking funnels, direct GET deep-links often result in 404s 
 * or session errors. We redirect to the official airline homepage to ensure a safe handoff.
 */

const AIRLINE_REDIRECTS = {
  // Indian Domestic
  AI: { name: "Air India", url: "https://www.airindia.com/" },
  "6E": { name: "IndiGo", url: "https://www.goindigo.in/" },
  SG: { name: "SpiceJet", url: "https://www.spicejet.com/" },
  UK: { name: "Vistara", url: "https://www.airvistara.com/" },
  QP: { name: "Akasa Air", url: "https://www.akasaair.com/" },
  IX: { name: "Air India Express", url: "https://www.airindiaexpress.com/" },
  G8: { name: "Go First", url: "https://www.flygofirst.com/" },
  I5: { name: "AirAsia India", url: "https://www.airasia.com/" },

  // Gulf / Middle East
  EK: { name: "Emirates", url: "https://www.emirates.com/" },
  EY: { name: "Etihad Airways", url: "https://www.etihad.com/" },
  QR: { name: "Qatar Airways", url: "https://www.qatarairways.com/" },

  // European
  LH: { name: "Lufthansa", url: "https://www.lufthansa.com/" },
  LX: { name: "SWISS", url: "https://www.swiss.com/" },
  BA: { name: "British Airways", url: "https://www.britishairways.com/" },
  AF: { name: "Air France", url: "https://www.airfrance.com/" },
  TK: { name: "Turkish Airlines", url: "https://www.turkishairlines.com/" },
  VS: { name: "Virgin Atlantic", url: "https://www.virginatlantic.com/" },

  // Americas
  DL: { name: "Delta Air Lines", url: "https://www.delta.com/" },
  UA: { name: "United Airlines", url: "https://www.united.com/" },
  AA: { name: "American Airlines", url: "https://www.aa.com/" },

  // Asia-Pacific
  SQ: { name: "Singapore Airlines", url: "https://www.singaporeair.com/" },
  CX: { name: "Cathay Pacific", url: "https://www.cathaypacific.com/" },
  QF: { name: "Qantas", url: "https://www.qantas.com/" },
  JL: { name: "Japan Airlines", url: "https://www.jal.co.jp/" },
  NH: { name: "All Nippon Airways", url: "https://www.ana.co.jp/" },
};

/**
 * Get the airline booking URL for a given airline code.
 * @param {string} airlineCode - IATA 2-letter airline code (e.g. "EK", "AI", "6E")
 * @param {Object} params - { origin, destination, date, passengers, cabinClass }
 * @returns {{ name: string, url: string, isDirect: boolean }}
 */
export function getAirlineBookingUrl(airlineCode, params = {}) {
  const entry = AIRLINE_REDIRECTS[airlineCode];

  // We return the official airline homepage because airlines block deep-linking 
  // into their funnels with 404s/Session Errors.
  if (entry) {
    return { name: entry.name, url: entry.url, isDirect: true };
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
