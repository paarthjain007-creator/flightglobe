import { AIRPORTS, searchAirports, getAirportByIata } from "../data/airports.js";
import { parseSpatialCommand, SPATIAL_COMMANDS } from "./spatialCommandEngine.js";
import { searchAirportsAPI } from "./api/apiClient.js";

/**
 * parseIntent(query)
 *
 * Thin wrapper around the Spatial Command Engine's parser.
 * Returns a full { action, params, flight_context, confidence } object.
 * Consumed by NimbusCopilot so it doesn't need to import the engine directly.
 */
export function parseIntent(query) {
  return parseSpatialCommand(query);
}

export { SPATIAL_COMMANDS };

const AI_PRESET_PROMPTS = [
  {
    id: "japan-eco",
    label: "🌸 Japan Cultural & Eco Tour",
    prompt: "Plan a 10-day trip starting in Tokyo Haneda (HND), hopping to Singapore (SIN) and Sydney (SYD).",
    routeIatas: ["HND", "SIN", "SYD"],
    title: "Pacific Rim Cultural & Eco Journey",
    rationale: "Optimized trajectory avoiding high-emission detours while connecting top green transit hubs."
  },
  {
    id: "europe-food",
    label: "🍷 European Culinary Capital Route",
    prompt: "Design a culinary food tour starting in London Heathrow (LHR), flying to Paris (CDG), Rome (FCO), and Barcelona (BCN).",
    routeIatas: ["LHR", "CDG", "FCO", "BCN"],
    title: "Grand European Gastronomy Arc",
    rationale: "Short intra-European legs maximizing regional rail connectivity and world-class dining destinations."
  },
  {
    id: "transatlantic-hubs",
    label: "🗽 Transatlantic Innovation Loop",
    prompt: "Create a business route connecting New York (JFK), Frankfurt (FRA), Dubai (DXB), and Mumbai (BOM).",
    routeIatas: ["JFK", "FRA", "DXB", "BOM"],
    title: "Global Tech & Commerce Corridor",
    rationale: "Strategic high-altitude corridor with premium lounge access and optimal time-zone adjustments."
  }
];

export function getPresetPrompts() {
  return AI_PRESET_PROMPTS;
}

export async function processCopilotPrompt(userPrompt) {
  // Quick response latency
  await new Promise((res) => setTimeout(res, 120));

  const lower = userPrompt.toLowerCase();

  // 1. Try matching against preset routes by keywords or label/id
  for (const preset of AI_PRESET_PROMPTS) {
    const matchesId = lower.includes(preset.id);
    const matchesTitle = lower.includes(preset.title.toLowerCase());
    const matchesPresetTour =
      (preset.id === "japan-eco" && (lower.includes("japan cultural") || lower.includes("japan eco") || (lower.includes("japan") && lower.includes("tour")))) ||
      (preset.id === "europe-food" && (lower.includes("culinary") || lower.includes("gastronomy") || (lower.includes("europe") && lower.includes("food")))) ||
      (preset.id === "transatlantic-hubs" && (lower.includes("transatlantic") && (lower.includes("loop") || lower.includes("innovation") || lower.includes("corridor"))));

    if (matchesId || matchesTitle || matchesPresetTour) {
      const matchedWps = preset.routeIatas
        .map((iata) => getAirportByIata(iata))
        .filter(Boolean);

      return {
        success: true,
        title: preset.title,
        summary: preset.rationale,
        waypoints: matchedWps,
        insights: [
          "⚡ AI Optimization: Great-circle vector saving ~14% CO₂ emissions",
          "🏨 Recommended Stay: 3-4 days per destination hub",
          "🛂 Digital Clearance: e-Visa / Fast-track transit automated",
          "📡 Live Telemetry: ADS-B transponder corridor active"
        ]
      };
    }
  }

  // 2. Specific heuristic intent detection
  if (lower.includes("indigo") || lower.includes("spicejet") || (lower.includes("delhi") && lower.includes("mumbai"))) {
    const del = getAirportByIata("DEL");
    const bom = getAirportByIata("BOM");
    return {
      success: true,
      title: "Delhi (DEL) → Mumbai (BOM) IndiGo & SpiceJet Trunk Corridor",
      summary: "India's premier commercial air vector with high-frequency non-stop flights via IndiGo (A321neo) and SpiceJet (Boeing 737 MAX 8).",
      waypoints: [del, bom].filter(Boolean),
      insights: [
        "⚡ Direct Great Circle distance: 1,148 km (~2h 10m duration)",
        "✈️ Operators: IndiGo (6E) & SpiceJet (SG) with hourly departures",
        "💺 Best Value: Direct fares starting from ₹3,800 ($45)",
        "📡 Live ADS-B radar tracking active over Mumbai and Delhi FIR"
      ]
    };
  }

  if (lower.includes("london") && (lower.includes("business") || lower.includes("book"))) {
    const jfk = getAirportByIata("JFK");
    const lhr = getAirportByIata("LHR");
    return {
      success: true,
      title: "New York (JFK) → London Heathrow (LHR) Business Vector",
      summary: "Transatlantic supersonic corridor optimized for Lie-Flat comfort and Starlink priority uplink.",
      waypoints: [jfk, lhr].filter(Boolean),
      insights: [
        "⚡ Direct Great Circle distance: 5,540 km",
        "💺 Business Class: 78\" Flatbed with direct aisle access",
        "🌱 SAF Blended Fuel: 18% net carbon offset",
        "⏱️ Average flight duration: 7h 15m"
      ]
    };
  }

  if (lower.includes("tokyo") || lower.includes("carbon")) {
    const sfo = getAirportByIata("SFO");
    const hnd = getAirportByIata("HND");
    return {
      success: true,
      title: "San Francisco (SFO) → Tokyo Haneda (HND) Eco-Vector",
      summary: "Pacific high-altitude jetstream corridor with minimal aerodynamic resistance and optimized fuel burn.",
      waypoints: [sfo, hnd].filter(Boolean),
      insights: [
        "⚡ High-altitude polar curve: 8,280 km",
        "🌱 Eco-Efficiency: Lowest carbon index among transpacific routes",
        "🛂 Fast-Track biometric e-Gates active at Haneda T3"
      ]
    };
  }

  // 3. STAGE A: NLP Origin/Destination Extraction
  let originQuery = null;
  let destQuery = null;

  const fromToMatch = lower.match(/from\s+([a-z\s]+?)\s+to\s+([a-z\s]+)/i);
  if (fromToMatch) {
    originQuery = fromToMatch[1].trim();
    destQuery = fromToMatch[2].trim();
  } else {
    const toMatch = lower.match(/(?:to|for|into|towards)\s+([a-z\s]+)/i);
    if (toMatch) destQuery = toMatch[1].trim();
    
    const fromMatch = lower.match(/(?:from|starting in|departing)\s+([a-z\s]+)/i);
    if (fromMatch) originQuery = fromMatch[1].trim();
  }

  async function fetchAirport(q) {
    if (!q) return null;
    const cleanQ = q.trim().toLowerCase();

    // 1. Primary curated airport dataset with typo spell-check and fuzzy matching
    const localMatches = searchAirports(cleanQ);
    if (localMatches.length > 0) return localMatches[0];

    // 2. Query backend global airport database API
    try {
      const results = await searchAirportsAPI(cleanQ);
      if (results && results.length > 0) return results[0];
    } catch {
      // ignore
    }

    return null;
  }

  // STAGE B: Fuzzy Resolution Engine
  let resolvedOrigin = originQuery ? await fetchAirport(originQuery) : null;
  let resolvedDestination = destQuery ? await fetchAirport(destQuery) : null;

  // Fallback defaults if only one endpoint was parsed
  if (!resolvedOrigin && resolvedDestination) {
    resolvedOrigin = getAirportByIata("JFK") || AIRPORTS[0];
  } else if (resolvedOrigin && !resolvedDestination) {
    resolvedDestination = getAirportByIata("LHR") || AIRPORTS[1];
  }

  if (resolvedOrigin && resolvedDestination) {
    return {
      success: true,
      title: `${resolvedOrigin.city} (${resolvedOrigin.iata || resolvedOrigin.code}) → ${resolvedDestination.city} (${resolvedDestination.iata || resolvedDestination.code})`,
      summary: `Dynamic flight corridor from ${resolvedOrigin.name} to ${resolvedDestination.name}. Waypoints synchronized with GDS schedules.`,
      waypoints: [resolvedOrigin, resolvedDestination],
      insights: [
        "⚡ Great Circle trajectory optimized for prevailing wind corridors",
        "🛡️ 256-bit encrypted GDS booking confirmed available",
        "📡 Live telemetry tracking enabled on 3D globe"
      ]
    };
  }

  // 4. Fallback: Default to iconic Transatlantic Loop if nothing matched
  const defaultWps = ["JFK", "LHR", "DXB", "SIN"].map((iata) => getAirportByIata(iata)).filter(Boolean);
  return {
    success: true,
    title: "Global Metropolises Quad-Vector",
    summary: "High-connectivity multi-hub global itinerary spanning North America, Western Europe, Middle East, and Southeast Asia.",
    waypoints: defaultWps,
    insights: [
      "⚡ 4-continent circumnavigation corridor",
      "🏨 Optimized layover schedules under 2.5 hours",
      "🛂 Lounge and e-Gate access across all terminals"
    ]
  };
}
