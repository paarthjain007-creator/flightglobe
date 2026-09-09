/**
 * Spatial Command Engine — FlightGlobe AI Copilot
 *
 * Defines the canonical SPATIAL_COMMANDS protocol.
 * Converts raw user text → structured { action, params, flight_context }
 * objects that the useSpatialCommandDispatcher hook can execute.
 */

import { searchAirports, AIRPORTS, getAirportByIata } from "../data/airports.js";

// ─── Canonical Command Enum ───────────────────────────────────────────────────

export const SPATIAL_COMMANDS = Object.freeze({
  INITIALIZE_GLOBE:     "INITIALIZE_GLOBE",
  FOCUS_LOCATION:       "FOCUS_LOCATION",
  DRAW_ROUTE:           "DRAW_ROUTE",
  FILTER_HEATMAP:       "FILTER_HEATMAP",
  SHOW_AIRCRAFT_AR:     "SHOW_AIRCRAFT_AR",
  TRIGGER_AR_MODE:      "TRIGGER_AR_MODE",
  TRIGGER_COCKPIT_VIEW: "TRIGGER_COCKPIT_VIEW",
  TOGGLE_JETSTREAM:     "TOGGLE_JETSTREAM",
  // Pass-through: pure conversational NLP (no spatial side-effect)
  SEARCH_FLIGHTS:       "SEARCH_FLIGHTS",
  CHANGE_THEME:         "CHANGE_THEME",
  CHANGE_CURRENCY:      "CHANGE_CURRENCY",
  SHOW_RADAR:           "SHOW_RADAR",
  SHOW_DASHBOARD:       "SHOW_DASHBOARD",
  UNKNOWN:              "UNKNOWN",
});

// ─── Heatmap Layer Aliases ────────────────────────────────────────────────────

const HEATMAP_LAYER_ALIASES = {
  weather:          "weather_overlay",
  weather_overlay:  "weather_overlay",
  weater:           "weather_overlay",
  weathr:           "weather_overlay",
  rain:             "weather_overlay",
  storm:            "weather_overlay",
  cloud:            "weather_overlay",
  wind:             "weather_overlay",
  turbulence:       "weather_overlay",
  "flight density": "density",
  density:          "density",
  traffic:          "density",
  congestion:       "density",
  heatmap:          "density",
  heatmp:           "density",
  price:            "price_heat_map",
  fare:             "price_heat_map",
  cost:             "price_heat_map",
  cheap:            "price_heat_map",
  "day night":      "day_night_cycle",
  night:            "day_night_cycle",
  "day/night":      "day_night_cycle",
  terminator:       "day_night_cycle",
};

// ─── City → Coordinate Table (major world airports) ──────────────────────────

const CITY_COORDS = {
  tokyo:      { lat: 35.6762, lng: 139.6503, zoom: 1.5, iata: "HND" },
  "new york": { lat: 40.7128, lng: -74.0060,  zoom: 1.5, iata: "JFK" },
  london:     { lat: 51.5074, lng: -0.1278,   zoom: 1.5, iata: "LHR" },
  paris:      { lat: 48.8566, lng:  2.3522,   zoom: 1.5, iata: "CDG" },
  dubai:      { lat: 25.2048, lng: 55.2708,   zoom: 1.5, iata: "DXB" },
  singapore:  { lat:  1.3521, lng: 103.8198,  zoom: 1.5, iata: "SIN" },
  sydney:     { lat: -33.8688, lng: 151.2093, zoom: 1.5, iata: "SYD" },
  mumbai:     { lat: 19.0760, lng: 72.8777,   zoom: 1.5, iata: "BOM" },
  delhi:      { lat: 28.6139, lng: 77.2090,   zoom: 1.5, iata: "DEL" },
  frankfurt:  { lat: 50.1109, lng:  8.6821,   zoom: 1.5, iata: "FRA" },
  toronto:    { lat: 43.6532, lng: -79.3832,  zoom: 1.5, iata: "YYZ" },
  amsterdam:  { lat: 52.3676, lng:  4.9041,   zoom: 1.5, iata: "AMS" },
  hong_kong:  { lat: 22.3193, lng: 114.1694,  zoom: 1.5, iata: "HKG" },
  "hong kong":{ lat: 22.3193, lng: 114.1694,  zoom: 1.5, iata: "HKG" },
  istanbul:   { lat: 41.0082, lng: 28.9784,   zoom: 1.5, iata: "IST" },
  seoul:      { lat: 37.5665, lng: 126.9780,  zoom: 1.5, iata: "ICN" },
  bangkok:    { lat: 13.7563, lng: 100.5018,  zoom: 1.5, iata: "BKK" },
  madrid:     { lat: 40.4168, lng: -3.7038,   zoom: 1.5, iata: "MAD" },
  rome:       { lat: 41.9028, lng: 12.4964,   zoom: 1.5, iata: "FCO" },
  barcelona:  { lat: 41.3851, lng:  2.1734,   zoom: 1.5, iata: "BCN" },
  doha:       { lat: 25.2854, lng: 51.5310,   zoom: 1.5, iata: "DOH" },
  abu_dhabi:  { lat: 24.2992, lng: 54.6973,   zoom: 1.5, iata: "AUH" },
  "abu dhabi":{ lat: 24.2992, lng: 54.6973,   zoom: 1.5, iata: "AUH" },
  johannesburg:{ lat: -26.2041, lng: 28.0473, zoom: 1.5, iata: "JNB" },
  cairo:      { lat: 30.0444, lng: 31.2357,   zoom: 1.5, iata: "CAI" },
  nairobi:    { lat: -1.2921, lng: 36.8219,   zoom: 1.5, iata: "NBO" },
  melbourne:  { lat: -37.8136, lng: 144.9631, zoom: 1.5, iata: "MEL" },
  los_angeles:{ lat: 34.0522, lng: -118.2437, zoom: 1.5, iata: "LAX" },
  "los angeles":{ lat: 34.0522, lng: -118.2437, zoom: 1.5, iata: "LAX" },
  chicago:    { lat: 41.8781, lng: -87.6298,  zoom: 1.5, iata: "ORD" },
  san_francisco:{ lat: 37.7749, lng: -122.4194, zoom: 1.5, iata: "SFO" },
  "san francisco":{ lat: 37.7749, lng: -122.4194, zoom: 1.5, iata: "SFO" },
};

// ─── Intent Pattern Registry ──────────────────────────────────────────────────

const INTENT_PATTERNS = [
  // TRIGGER_COCKPIT_VIEW
  {
    action: SPATIAL_COMMANDS.TRIGGER_COCKPIT_VIEW,
    patterns: [
      /\b(?:cockpit|cockpit\s+view|cockpit\s+hud|first\s+person|pilot\s+view|cockpit\s+mode|pilot\s+seat)\b/i,
      /\b(?:switch\s+to|enter|launch|open|show)\s+(?:the\s+)?cockpit\b/i,
    ],
    extract: () => ({ enabled: true }),
  },
  // TOGGLE_JETSTREAM
  {
    action: SPATIAL_COMMANDS.TOGGLE_JETSTREAM,
    patterns: [
      /\b(?:jetstream|jet\s+stream|wind\s+vectors?|atmospheric\s+winds?|jetstream\s+winds?)\b/i,
      /\b(?:show|toggle|enable|display|hide)\s+(?:the\s+)?(?:jetstream|jet\s+stream|wind\s+vectors?)\b/i,
    ],
    extract: (lower) => ({ enabled: !lower.includes("hide") && !lower.includes("disable") }),
  },
  // TRIGGER_AR_MODE — must check before SHOW_AIRCRAFT_AR
  {
    action: SPATIAL_COMMANDS.TRIGGER_AR_MODE,
    patterns: [/\b(switch|launch|open|start|enter|trigger|enable)\s+(?:to\s+)?ar\b/i, /\bar\s+mode\b/i, /\bwebxr\b/i, /\bvision\s+pro\b/i, /\b(?:spatial|augmented)\s+reality\b/i],
    extract: () => ({ mode: "webxr" }),
  },
  // SHOW_RADAR
  {
    action: SPATIAL_COMMANDS.SHOW_RADAR,
    patterns: [/\b(?:radar|live\s+radar|radar\s+telemetry|live\s+traffic|air\s+traffic|adsb\s+radar)\b/i, /\b(?:open|show|switch\s+to|launch)\s+radar\b/i],
    extract: () => ({}),
  },
  // SHOW_AIRCRAFT_AR
  {
    action: SPATIAL_COMMANDS.SHOW_AIRCRAFT_AR,
    patterns: [/\bshow\s+(?:live\s+)?(?:aircraft|planes?|flights?)\b/i, /\bpin\s+(?:aircraft|planes?)\b/i, /\baircraft\s+(?:on\s+)?(?:globe|map|ar)\b/i, /\btrack\s+(?:live\s+)?(?:aircraft|planes?)\b/i, /\bads-?b\b/i, /\baircraft\s+telemetry\b/i],
    extract: () => ({ mode: "live_adsb" }),
  },
  // FILTER_HEATMAP
  {
    action: SPATIAL_COMMANDS.FILTER_HEATMAP,
    patterns: [/\b(?:show|apply|enable|add|toggle|display|filter|overlay)\s+(?:the\s+)?(?:weather|rain|storm|wind|turbulence|cloud|density|traffic|congestion|price|fare|cost|cheap|night|day)\b/i, /\bheatmap\b/i, /\boverlay\b/i, /\bweather\s+(?:map|layer|view|mode)\b/i],
    extract: (lower) => {
      for (const [key, layer] of Object.entries(HEATMAP_LAYER_ALIASES)) {
        if (lower.includes(key)) return { layer };
      }
      return { layer: "density" };
    },
  },
  // INITIALIZE_GLOBE
  {
    action: SPATIAL_COMMANDS.INITIALIZE_GLOBE,
    patterns: [/\b(?:initialize|init|reset|spawn|create|load)\s+(?:the\s+)?globe\b/i, /\bstart\s+(?:new\s+)?globe\b/i, /\bglobal\s+view\b/i],
    extract: () => ({ centerLat: 20, centerLng: 0, zoom: 2.5 }),
  },
  // FOCUS_LOCATION — "go to X", "focus on X", "zoom to X", "center on X"
  {
    action: SPATIAL_COMMANDS.FOCUS_LOCATION,
    patterns: [/\b(?:go\s+to|focus\s+on|zoom\s+(?:to|in\s+on)|center\s+on|look\s+at|navigate\s+to|point\s+(?:to|at)|fly\s+over)\s+([a-z\s]+)/i],
    extract: (lower, match) => {
      const cityRaw = match?.[1]?.trim().toLowerCase() ?? "";
      return resolveCity(cityRaw);
    },
  },
  // DRAW_ROUTE — "from X to Y" or "fly from X to Y"
  {
    action: SPATIAL_COMMANDS.DRAW_ROUTE,
    patterns: [/\b(?:fly|travel|route|draw|plan|book|plot)\s+(?:from|me\s+from)\s+([a-z\s]+?)\s+to\s+([a-z\s]+)/i, /\bfrom\s+([a-z\s]+?)\s+to\s+([a-z\s]+)\b/i],
    extract: (lower, match) => {
      const originQ = match?.[1]?.trim() ?? "";
      const destQ   = match?.[2]?.trim() ?? "";
      const origin  = resolveAirport(originQ);
      const dest    = resolveAirport(destQ);
      return { origin, dest };
    },
  },
  // SHOW_DASHBOARD
  {
    action: SPATIAL_COMMANDS.SHOW_DASHBOARD,
    patterns: [/\b(?:dashboard|dashbord|dashbaord|metrics|metrix|analytics|analitics|trip\s+stats|carbon)\b/i],
    extract: () => ({}),
  },
  // CHANGE_THEME
  {
    action: SPATIAL_COMMANDS.CHANGE_THEME,
    patterns: [/\b(?:theme|synthwave|holodeck|cyberpunk|space|atmosphera|sunset|slate|daylight)\b/i],
    extract: (lower) => {
      const themes = ["synthwave", "holodeck", "cyberpunk", "atmosphera", "sunset", "slate", "daylight", "space"];
      return { theme: themes.find((t) => lower.includes(t)) ?? "synthwave" };
    },
  },
  // CHANGE_CURRENCY (with spell-check & currency name mapping)
  {
    action: SPATIAL_COMMANDS.CHANGE_CURRENCY,
    patterns: [/\b(?:currency|currensy|currecny|curreny|inr|rupee|rupees|rupe|usd|dollar|dollars|doller|eur|euro|euros|eruo|gbp|pound|pounds|pund|aed|dirham|dirhams|dirhm|jpy|yen|aud|chf)\b/i],
    extract: (lower) => {
      if (lower.match(/\b(inr|rupee|rupees|rupe)\b/i)) return { currency: "INR" };
      if (lower.match(/\b(eur|euro|euros|eruo)\b/i)) return { currency: "EUR" };
      if (lower.match(/\b(gbp|pound|pounds|pund)\b/i)) return { currency: "GBP" };
      if (lower.match(/\b(aed|dirham|dirhams|dirhm)\b/i)) return { currency: "AED" };
      if (lower.match(/\b(jpy|yen)\b/i)) return { currency: "JPY" };
      if (lower.match(/\b(aud)\b/i)) return { currency: "AUD" };
      if (lower.match(/\b(chf)\b/i)) return { currency: "CHF" };
      return { currency: "USD" };
    },
  },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function resolveCity(cityRaw) {
  // Direct lookup
  if (CITY_COORDS[cityRaw]) return CITY_COORDS[cityRaw];

  // Partial match
  for (const [key, coords] of Object.entries(CITY_COORDS)) {
    if (cityRaw.includes(key) || key.includes(cityRaw)) return coords;
  }

  // Airport data fallback
  const results = searchAirports(cityRaw);
  if (results.length > 0) {
    const ap = results[0];
    return { lat: ap.lat, lng: ap.lng, zoom: 1.5, iata: ap.iata, city: ap.city };
  }

  return { lat: 20, lng: 0, zoom: 2.5, iata: null };
}

function resolveAirport(query) {
  if (!query) return null;
  const q = query.trim().toLowerCase();

  // IATA direct
  if (q.length === 3) {
    const byIata = getAirportByIata(q);
    if (byIata) return byIata;
  }

  // City lookup
  const city = resolveCity(q);
  if (city && city.iata) {
    const ap = getAirportByIata(city.iata);
    return ap ?? { iata: city.iata, city: q, lat: city.lat, lng: city.lng };
  }

  // Fuzzy
  const results = searchAirports(q);
  return results.length > 0 ? results[0] : null;
}

// ─── Main Parser ──────────────────────────────────────────────────────────────

/**
 * parseSpatialCommand(userQuery)
 *
 * Converts raw user text into a structured spatial command object.
 * Returns:
 * {
 *   action: SPATIAL_COMMANDS.*,
 *   params: { ... },
 *   flight_context: { query: string, resolvedAt: ISO string },
 *   confidence: "high" | "medium" | "low"
 * }
 */
export function parseSpatialCommand(userQuery) {
  const lower = userQuery.toLowerCase().trim();
  const resolvedAt = new Date().toISOString();

  for (const intent of INTENT_PATTERNS) {
    for (const pattern of intent.patterns) {
      const match = lower.match(pattern);
      if (match) {
        const params = intent.extract(lower, match) ?? {};
        return {
          action: intent.action,
          params,
          flight_context: { query: userQuery, resolvedAt },
          confidence: "high",
        };
      }
    }
  }

  // Search flights fallback (origin + dest NLP)
  const routeMatch = lower.match(/([a-z\s]+?)\s+to\s+([a-z\s]+)/i);
  if (routeMatch) {
    const origin = resolveAirport(routeMatch[1].trim());
    const dest   = resolveAirport(routeMatch[2].trim());
    if (origin && dest) {
      return {
        action: SPATIAL_COMMANDS.DRAW_ROUTE,
        params: { origin, dest },
        flight_context: { query: userQuery, resolvedAt },
        confidence: "medium",
      };
    }
  }

  return {
    action: SPATIAL_COMMANDS.UNKNOWN,
    params: {},
    flight_context: { query: userQuery, resolvedAt },
    confidence: "low",
  };
}

/**
 * humaniseCommand(command)
 * Returns a short description for UI display.
 */
export function humaniseCommand(command) {
  const { action, params } = command;
  switch (action) {
    case SPATIAL_COMMANDS.INITIALIZE_GLOBE:
      return "Globe initialized at world view";
    case SPATIAL_COMMANDS.FOCUS_LOCATION:
      return `Camera focused on ${params.city ?? params.iata ?? "location"}`;
    case SPATIAL_COMMANDS.DRAW_ROUTE:
      return `Route rendered: ${params.origin?.iata ?? "?"} → ${params.dest?.iata ?? "?"}`;
    case SPATIAL_COMMANDS.FILTER_HEATMAP:
      return `Overlay applied: ${params.layer?.replace(/_/g, " ")}`;
    case SPATIAL_COMMANDS.SHOW_AIRCRAFT_AR:
      return "Live aircraft pinned on globe";
    case SPATIAL_COMMANDS.TRIGGER_AR_MODE:
      return "AR / WebXR session launched";
    case SPATIAL_COMMANDS.TRIGGER_COCKPIT_VIEW:
      return "First-Person Cockpit View activated";
    case SPATIAL_COMMANDS.TOGGLE_JETSTREAM:
      return params.enabled === false ? "Jetstream wind vectors hidden" : "Global Jetstream wind streams displayed";
    case SPATIAL_COMMANDS.SHOW_RADAR:
      return "Navigating to Live Radar view";
    case SPATIAL_COMMANDS.SHOW_DASHBOARD:
      return "Navigating to Trip Dashboard";
    case SPATIAL_COMMANDS.CHANGE_THEME:
      return `Visual theme switched to ${params.theme}`;
    case SPATIAL_COMMANDS.CHANGE_CURRENCY:
      return `Display currency updated to ${params.currency}`;
    default:
      return "Analysing your request...";
  }
}
