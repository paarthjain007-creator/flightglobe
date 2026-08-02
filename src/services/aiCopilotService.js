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
  await new Promise((res) => setTimeout(res, 1000));

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

  // Dynamic NLP airport search extraction
  const foundAirports = [];
  const words = lower.split(/[\s,.-]+/);

  // Direct IATA matching
  for (const ap of AIRPORTS) {
    if (words.includes(ap.iata.toLowerCase()) || lower.includes(ap.city.toLowerCase()) || lower.includes(ap.country.toLowerCase())) {
      if (!foundAirports.some((existing) => existing && existing.iata === ap.iata)) {
        foundAirports.push(ap);
      }
    }
  }

  // Fallback defaults if fewer than 2 airports matched
  if (foundAirports.length < 2) {
    if (foundAirports.length === 1) {
      // Add a complementary destination hub
      const complement = AIRPORTS.find((a) => a && a.iata !== foundAirports[0].iata && (a.currency !== foundAirports[0].currency || a.country !== foundAirports[0].country));
      if (complement) foundAirports.push(complement);
    } else {
      // Default curated route: JFK -> LHR -> SIN
      foundAirports.push(
        AIRPORTS.find((a) => a.iata === "JFK"),
        AIRPORTS.find((a) => a.iata === "LHR"),
        AIRPORTS.find((a) => a.iata === "SIN")
      );
    }
  }

  // Filter out any potential undefined elements and cap at 5 airports
  const finalWaypoints = foundAirports.filter(Boolean).slice(0, 5);

  const title = `${finalWaypoints[0]?.city || "Origin"} to ${finalWaypoints[finalWaypoints.length - 1]?.city || "Destination"} Custom Journey`;
  const summary = `AI-generated multi-leg trajectory covering ${finalWaypoints.length} global destinations based on your travel goals.`;

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
