/**
 * FlightGlobe AI Agent Tool Schema Declarations
 * Defines OpenAI-compatible JSON Schema functions available to Nimbus AI Agent.
 */

export const AI_TOOLS = [
  {
    type: "function",
    function: {
      name: "search_flights",
      description: "Search available direct flights, airfare matrix, and great-circle distances between origin and destination airports.",
      parameters: {
        type: "object",
        properties: {
          origin: {
            type: "string",
            description: "Origin 3-letter IATA airport code (e.g. DEL, JFK, LHR, DXB, SIN)",
          },
          destination: {
            type: "string",
            description: "Destination 3-letter IATA airport code (e.g. LHR, DXB, HND, SFO, CDG)",
          },
          departureDate: {
            type: "string",
            description: "Optional departure date in YYYY-MM-DD format",
          },
        },
        required: ["origin", "destination"],
      },
    },
  },

  {
    type: "function",
    function: {
      name: "book_flight",
      description: "Automatically create a flight booking reservation and assign a specific seat on behalf of the user.",
      parameters: {
        type: "object",
        properties: {
          airline: {
            type: "string",
            description: "Airline name (e.g. IndiGo, SpiceJet, Air India, Emirates, Singapore Air, British Airways)",
          },
          flightCode: {
            type: "string",
            description: "Flight code (e.g. 6E-452, SG-8169, AI-805, EK-201)",
          },
          fromCode: {
            type: "string",
            description: "Origin IATA code",
          },
          toCode: {
            type: "string",
            description: "Destination IATA code",
          },
          seat: {
            type: "string",
            description: "Assigned seat number (e.g. 1A, 2B, 3F, 12C, 15A)",
          },
          departureTime: {
            type: "string",
            description: "Departure time in HH:MM format",
          },
          price: {
            type: "number",
            description: "Total flight price in INR base currency",
          },
        },
        required: ["airline", "flightCode", "fromCode", "toCode", "seat"],
      },
    },
  },

  {
    type: "function",
    function: {
      name: "cancel_booking",
      description: "Cancel an active flight reservation or boarding pass using the booking ID or reference number.",
      parameters: {
        type: "object",
        properties: {
          bookingId: {
            type: "string",
            description: "The booking ID (e.g. T-8842) or reference number (e.g. FG-847291)",
          },
        },
        required: ["bookingId"],
      },
    },
  },

  {
    type: "function",
    function: {
      name: "change_currency",
      description: "Mutate global website display currency settings.",
      parameters: {
        type: "object",
        properties: {
          currency: {
            type: "string",
            enum: ["INR", "USD", "EUR", "GBP", "AED", "SGD"],
            description: "Target currency code",
          },
        },
        required: ["currency"],
      },
    },
  },

  {
    type: "function",
    function: {
      name: "navigate_view",
      description: "Switch the active UI view tab on the FlightGlobe application interface.",
      parameters: {
        type: "object",
        properties: {
          targetView: {
            type: "string",
            enum: ["search", "tracker", "trips", "ai"],
            description: "Target view screen: 'search' (Explore & Book), 'tracker' (Live Radar HUD), 'trips' (My Passes), or 'ai' (Nimbus AI Co-Pilot)",
          },
        },
        required: ["targetView"],
      },
    },
  },

  {
    type: "function",
    function: {
      name: "get_telemetry",
      description: "Fetch real-time ADS-B radar flight telemetry and METAR weather conditions for a flight route.",
      parameters: {
        type: "object",
        properties: {
          origin: { type: "string", description: "Origin IATA code" },
          destination: { type: "string", description: "Destination IATA code" },
        },
        required: ["origin", "destination"],
      },
    },
  },
];

export const SYSTEM_PROMPT = `
You are Nimbus, an autonomous agentic flight co-pilot and AI operator for FlightGlobe.
You have direct authorization to execute flight searches, book seats, cancel reservations, switch application views, change user currency, and retrieve telemetry on behalf of the logged-in user.

GUIDELINES:
1. Whenever the user asks you to perform an action (e.g., "Book seat 2B on Air India to London", "Change currency to USD", "Show my passes", "Check weather from DEL to LHR"), you MUST call the appropriate function tool.
2. If essential parameters are missing for an action (such as seat number or airline), pick intelligent defaults (e.g. seat "2B" for Business or "12A" for Economy) or state what you assigned.
3. Be professional, concise, authoritative, and helpful. Use spatial aviation terminology appropriately.
4. When a tool is executed, summarize the result clearly to the user.
`.trim();
