import { AIRPORTS, searchAirports } from "../data/airports";

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
  // Simulate AI network processing latency
  await new Promise((res) => setTimeout(res, 800));

  const lower = userPrompt.toLowerCase();

  // Try matching against preset routes first
  for (const preset of AI_PRESET_PROMPTS) {
    if (lower.includes(preset.id) || lower.includes(preset.title.toLowerCase())) {
      const matchedWps = preset.routeIatas
        .map((iata) => AIRPORTS.find((a) => a.iata === iata))
        .filter(Boolean);

      return {
        success: true,
        title: preset.title,
        summary: preset.rationale,
        waypoints: matchedWps,
        insights: [
          "⚡ AI Optimization: Direct great-circle vector saving ~12% CO₂ emissions",
          "🏨 Recommended Stay: 3-4 days per hub",
          "🛂 Visa Requirement: e-Visa / Visa-free for most passports"
        ]
      };
    }
  }

  // NLP Intent Extraction
  let originQuery = null;
  let destQuery = null;

  const fromToMatch = lower.match(/from\s+([a-z\s]+?)\s+to\s+([a-z\s]+)/i);
  if (fromToMatch) {
    originQuery = fromToMatch[1].trim();
    destQuery = fromToMatch[2].trim();
  } else {
    const toMatch = lower.match(/(?:to|for)\s+([a-z\s]+)/i);
    if (toMatch) destQuery = toMatch[1].trim();
  }

  async function fetchAirport(q) {
    try {
      const res = await fetch(`http://localhost:3001/api/airports/search?q=${encodeURIComponent(q)}`);
      if (res.ok) {
        const data = await res.json();
        if (data.results && data.results.length > 0) return data.results[0];
      }
    } catch (err) {
      console.warn("Copilot API fallback:", err);
    }
    // Local fallback
    const local = searchAirports(q);
    return local.length > 0 ? local[0] : null;
  }

  let finalWaypoints = [];
  
  if (originQuery && destQuery) {
    const o = await fetchAirport(originQuery);
    const d = await fetchAirport(destQuery);
    if (o) finalWaypoints.push(o);
    if (d) finalWaypoints.push(d);
  } else if (destQuery) {
    // Only destination mentioned, assume default origin or user's current origin (handled in component)
    const d = await fetchAirport(destQuery);
    if (d) finalWaypoints.push(d);
  } else {
    // Fallback: word search
    const words = lower.split(/[\s,.-]+/);
    for (const ap of AIRPORTS) {
      if (words.includes(ap.iata.toLowerCase()) || lower.includes(ap.city.toLowerCase()) || lower.includes(ap.country.toLowerCase())) {
        if (!finalWaypoints.some((existing) => existing && existing.iata === ap.iata)) {
          finalWaypoints.push(ap);
        }
      }
    }
  }

  if (finalWaypoints.length === 0) {
    return {
      success: false,
      title: "Navigation Error",
      summary: "I couldn't identify the flight route from your prompt. Could you specify the origin and destination clearly (e.g. 'flights from Paris to Tokyo')?",
      waypoints: [],
      insights: []
    };
  }

  const title = `${finalWaypoints[0]?.city || "Origin"} to ${finalWaypoints[finalWaypoints.length - 1]?.city || "Destination"} Custom Journey`;
  const summary = `AI-generated trajectory covering ${finalWaypoints.length} destination${finalWaypoints.length > 1 ? 's' : ''} based on your request.`;

  return {
    success: true,
    title,
    summary,
    waypoints: finalWaypoints,
    insights: [
      `🎯 Matched ${finalWaypoints.length} destination hubs from your query`,
      "🌐 Route mapped on 3D Globe with live Haversine telemetry",
      "🌿 Smart Carbon offset calculated automatically"
    ]
  };
}
