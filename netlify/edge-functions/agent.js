export default async (req, context) => {
  const headers = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Content-Type": "application/json",
  };

  if (req.method === "OPTIONS") {
    return new Response(null, { status: 204, headers });
  }

  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), { status: 405, headers });
  }

  try {
    const { message, history = [] } = await req.json();
    if (!message) {
      return new Response(JSON.stringify({ error: "Message prompt is required" }), { status: 400, headers });
    }

    const apiKey = Deno.env.get("GEMINI_API_KEY");
    if (!apiKey) {
      return new Response(
        JSON.stringify({ status: "error", message: "GEMINI_API_KEY missing in Netlify environment variables" }),
        { status: 500, headers }
      );
    }

    const todayDate = new Date().toISOString().split("T")[0];
    const systemPrompt = `You are Nimbus, the FlightGlobe Autonomous AI Copilot.
You are integrated into a real flight booking platform with live GDS data.
Your job is to understand what the user wants and respond with a JSON action object.

You MUST return ONLY valid JSON matching this exact schema:
{
  "intent": "search_flights" | "book_flight" | "cancel_booking" | "change_currency" | "navigate_view" | "chat",
  "parameters": {
    "origin": "3-letter IATA code (e.g. DEL, BOM, JFK, LHR)",
    "destination": "3-letter IATA code",
    "date": "YYYY-MM-DD or null",
    "currency": "USD" | "EUR" | "INR" | "GBP" | "AED" | null,
    "targetView": "booking" | "radar" | "explore" | "passport" | null,
    "bookingId": "booking ID string or null",
    "airline": "Airline name or null",
    "seat": "Seat like 12A or null"
  },
  "reply": "A short, friendly, professional response confirming what you are doing."
}

City to IATA mapping examples:
- Delhi / New Delhi -> DEL
- Mumbai / Bombay -> BOM  
- Bangalore / Bengaluru -> BLR
- Chennai / Madras -> MAA
- Kolkata / Calcutta -> CCU
- Hyderabad -> HYD
- Goa -> GOI
- London -> LHR
- New York -> JFK

Rules:
1. For flight search requests, ALWAYS set intent="search_flights" and extract origin/destination.
2. For navigation ("show me radar", "go to my passes"), set intent="navigate_view".
3. For currency changes ("switch to INR", "show prices in rupees"), set intent="change_currency".
4. For general questions (no action needed), set intent="chat".
5. Always map city names correctly to their IATA codes.
6. If the user says "today" for date, use today's date: ${todayDate}`;

    const contents = history.map(msg => ({
      role: msg.role === "user" ? "user" : "model",
      parts: [{ text: msg.content }]
    }));
    contents.push({ role: "user", parts: [{ text: message }] });

    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.1-flash-lite:generateContent?key=${apiKey}`;

    const response = await fetch(apiUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents,
        system_instruction: { parts: [{ text: systemPrompt }] },
        generationConfig: {
          response_mime_type: "application/json",
          temperature: 0.2
        }
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      return new Response(JSON.stringify({ status: "error", message: errorText }), { status: response.status, headers });
    }

    const data = await response.json();
    const rawContent = data.candidates?.[0]?.content?.parts?.[0]?.text;
    
    if (!rawContent) {
       return new Response(JSON.stringify({ status: "error", message: "Empty AI response" }), { status: 500, headers });
    }

    let parsed;
    try {
      parsed = JSON.parse(rawContent);
    } catch (e) {
      parsed = { intent: "chat", reply: rawContent, parameters: {} };
    }

    const intent = parsed.intent || "chat";
    const params = parsed.parameters || {};
    const reply = parsed.reply || "How can I help you?";

    const clientActions = [];

    if (intent === "search_flights") {
      const origin = params.origin || "DEL";
      const destination = params.destination || "BOM";
      clientActions.push({ type: "SET_ROUTE", origin, destination });
      clientActions.push({ type: "NAVIGATE", path: "/booking", origin, destination });
    } else if (intent === "change_currency") {
      clientActions.push({ type: "SET_CURRENCY", currency: params.currency || "USD" });
    } else if (intent === "navigate_view") {
      clientActions.push({ type: "SWITCH_VIEW", view: params.targetView || "explore" });
    } else if (intent === "book_flight") {
      const origin = params.origin || "DEL";
      const destination = params.destination || "LHR";
      clientActions.push({ type: "SET_ROUTE", origin, destination });
      clientActions.push({ type: "NAVIGATE", path: "/booking", origin, destination });
    } else if (intent === "cancel_booking" && params.bookingId) {
      clientActions.push({ type: "BOOKING_CANCELLED", bookingId: params.bookingId });
    }

    return new Response(JSON.stringify({ status: "ok", reply, clientActions }), { status: 200, headers });

  } catch (err) {
    console.error("Edge AI Agent Error:", err);
    return new Response(JSON.stringify({ status: "error", message: err.message }), { status: 500, headers });
  }
};
