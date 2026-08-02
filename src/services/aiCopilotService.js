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

  // STAGE A: NLP Intent Extraction
  let originQuery = null;
  let destQuery = null;

  const fromToMatch = lower.match(/from\s+([a-z\s]+?)\s+to\s+([a-z\s]+)/i);
  if (fromToMatch) {
    originQuery = fromToMatch[1].trim();
    destQuery = fromToMatch[2].trim();
  } else {
    const toMatch = lower.match(/(?:to|for)\s+([a-z\s]+)/i);
    if (toMatch) destQuery = toMatch[1].trim();
    
    const fromMatch = lower.match(/from\s+([a-z\s]+)/i);
    if (fromMatch) originQuery = fromMatch[1].trim();
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

  // STAGE B: Fuzzy Resolution Engine
  let resolvedOrigin = null;
  let resolvedDestination = null;

  if (originQuery) {
    resolvedOrigin = await fetchAirport(originQuery);
  }
  
  if (destQuery) {
    resolvedDestination = await fetchAirport(destQuery);
  }

  return {
    success: true,
    resolvedOrigin,
    resolvedDestination
  };
}
