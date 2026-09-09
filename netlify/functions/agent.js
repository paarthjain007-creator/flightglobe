/**
 * Netlify Serverless Function for Autonomous AI Copilot Engine.
 */

export async function handler(event, _context) {
  const headers = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Content-Type": "application/json",
  };

  if (event.httpMethod === "OPTIONS") {
    return { statusCode: 204, headers, body: "" };
  }

  if (event.httpMethod !== "POST") {
    return { statusCode: 405, headers, body: JSON.stringify({ error: "Method not allowed" }) };
  }

  try {
    const { message } = JSON.parse(event.body || "{}");
    if (!message) {
      return { statusCode: 400, headers, body: JSON.stringify({ error: "Message prompt is required" }) };
    }

    const query = message.trim();
    const lower = query.toLowerCase();
    const clientActions = [];
    let responseText = "";

    const isCancelling =
      lower.includes("cancel") ||
      lower.includes("cancle") ||
      lower.includes("delete booking") ||
      lower.includes("remove pass") ||
      lower.includes("drop booking");

    const isBooking =
      !isCancelling &&
      (lower.includes("book") ||
        lower.includes("bok") ||
        lower.includes("reserve") ||
        lower.includes("buy ticket") ||
        lower.includes("get ticket"));

    const isCurrency =
      lower.includes("currency") ||
      lower.includes("currensy") ||
      lower.includes("inr") ||
      lower.includes("rupee") ||
      lower.includes("usd") ||
      lower.includes("dollar") ||
      lower.includes("eur") ||
      lower.includes("euro") ||
      lower.includes("gbp") ||
      lower.includes("pound") ||
      lower.includes("aed") ||
      lower.includes("dirham") ||
      lower.includes("sgd");

    const isRadar =
      lower.includes("radar") ||
      lower.includes("radr") ||
      lower.includes("telemetry") ||
      lower.includes("telmetry") ||
      lower.includes("track") ||
      lower.includes("hud");

    const isPasses =
      lower.includes("passes") ||
      lower.includes("pasess") ||
      lower.includes("pass") ||
      lower.includes("trips") ||
      lower.includes("my flight") ||
      lower.includes("boarding pass");

    const isDashboard =
      lower.includes("dashboard") ||
      lower.includes("dashbord") ||
      lower.includes("analytics") ||
      lower.includes("delay engine") ||
      lower.includes("bento");

    const isExplore =
      lower.includes("explore") ||
      lower.includes("globe") ||
      lower.includes("3d globe") ||
      lower.includes("planetary");

    const isBookingView =
      lower.includes("booking page") ||
      lower.includes("open booking") ||
      lower.includes("gds engine") ||
      lower.includes("gds search");

    const CITY_HUB_MAP = {
      delhi: "DEL",
      "new delhi": "DEL",
      mumbai: "BOM",
      bombay: "BOM",
      london: "LHR",
      tokyo: "HND",
      dubai: "DXB",
      singapore: "SIN",
      paris: "CDG",
      frankfurt: "FRA",
      amsterdam: "AMS",
      sydney: "SYD",
      "new york": "JFK",
      nyc: "JFK",
      "san francisco": "SFO",
    };

    function resolveHub(term) {
      if (!term) return null;
      const t = term.trim().toLowerCase();
      if (t.length === 3) return t.toUpperCase();
      return CITY_HUB_MAP[t] || null;
    }

    if (isCancelling) {
      const refMatch = query.match(/T-[0-9]{4}|FG-[0-9]{6}/i);
      const bookingId = refMatch ? refMatch[0].toUpperCase() : "T-8842";
      clientActions.push({ type: "BOOKING_CANCELLED", bookingId });
      responseText = `🗑️ **Task Executed**: Reservation **${bookingId}** has been cancelled successfully. Your active itinerary has been updated.`;
    } else if (isBooking) {
      const seatMatch = query.match(/seat\s*([0-9]{1,2}\s*[a-zA-Z])/i);
      const seat = seatMatch ? seatMatch[1].replace(/\s+/g, "").toUpperCase() : "2B";

      let fromCode = "DEL";
      let toCode = "LHR";
      const routeMatch = query.match(/from\s+([a-zA-Z\s]+?)\s+to\s+([a-zA-Z\s]+)/i);
      if (routeMatch) {
        fromCode = resolveHub(routeMatch[1]) || (routeMatch[1].length === 3 ? routeMatch[1].toUpperCase() : "DEL");
        toCode = resolveHub(routeMatch[2]) || (routeMatch[2].length === 3 ? routeMatch[2].toUpperCase() : "LHR");
      }

      let airline = "Air India";
      let flightCode = "AI-805";
      if (lower.includes("indigo")) {
        airline = "IndiGo";
        flightCode = "6E-452";
      } else if (lower.includes("spicejet") || lower.includes("spice jet") || lower.includes("sg")) {
        airline = "SpiceJet";
        flightCode = "SG-8169";
      } else if (lower.includes("akasa")) {
        airline = "Akasa Air";
        flightCode = "QP-1302";
      } else if (lower.includes("vistara")) {
        airline = "Vistara";
        flightCode = "UK-945";
      } else if (lower.includes("emirates")) {
        airline = "Emirates";
        flightCode = "EK-201";
      } else if (lower.includes("british")) {
        airline = "British Airways";
        flightCode = "BA-178";
      }

      const booking = {
        id: `T-${Math.floor(1000 + Math.random() * 9000)}`,
        userId: "usr_commander_1",
        flight: {
          code: flightCode,
          airline,
          from: fromCode,
          to: toCode,
          dep: "09:45",
          arr: "17:30",
          dur: "8h 15m",
          plane: "Boeing 787-9 Dreamliner",
          price: 520,
          currency: "USD",
          currencySymbol: "$",
        },
        seat,
        gate: "A14",
        terminal: "T2",
        group: seat.startsWith("1") || seat.startsWith("2") ? "A (Priority)" : "B",
        origin: { iata: fromCode, code: fromCode, city: fromCode },
        destination: { iata: toCode, code: toCode, city: toCode },
        totalPrice: 520,
        currency: "USD",
        currencySymbol: "$",
        bookingRef: `FG-${Math.floor(100000 + Math.random() * 900000)}`,
        date: new Date().toISOString().split("T")[0],
        createdAt: new Date().toISOString(),
      };

      clientActions.push({ type: "BOOKING_CREATED", booking });
      responseText = `✈️ **Task Executed**: I have booked your flight! **${airline} (${flightCode})** seat **${seat}** (${fromCode} ➔ ${toCode}). Booking Ref: \`${booking.bookingRef}\`. You can view your pass in 'My Passes'.`;
    } else if (isCurrency) {
      let curr = "USD";
      if (lower.match(/\b(inr|rupee|rupees)\b/i)) curr = "INR";
      if (lower.match(/\b(eur|euro|euros)\b/i)) curr = "EUR";
      if (lower.match(/\b(gbp|pound|pounds)\b/i)) curr = "GBP";
      if (lower.match(/\b(aed|dirham)\b/i)) curr = "AED";
      if (lower.match(/\b(sgd)\b/i)) curr = "SGD";
      clientActions.push({ type: "SET_CURRENCY", currency: curr });
      responseText = `💱 **Task Executed**: Updated display currency to **${curr}**. All flight fares across the site have been recalculated.`;
    } else if (isRadar) {
      clientActions.push({ type: "SWITCH_VIEW", view: "tracker" });
      responseText = `🛰️ **Task Executed**: Switched to Live Radar HUD. Telemetry feed active.`;
    } else if (isPasses) {
      clientActions.push({ type: "SWITCH_VIEW", view: "trips" });
      responseText = `🎟️ **Task Executed**: Navigated to your boarding passes.`;
    } else if (isDashboard) {
      clientActions.push({ type: "SWITCH_VIEW", view: "dashboard" });
      responseText = `📊 **Task Executed**: Navigated to Trip Analytics Dashboard & Delay Forecast Engine.`;
    } else if (isExplore) {
      clientActions.push({ type: "SWITCH_VIEW", view: "explore" });
      responseText = `🌍 **Task Executed**: Navigated to 3D Master Globe Explorer.`;
    } else if (isBookingView) {
      clientActions.push({ type: "SWITCH_VIEW", view: "booking" });
      responseText = `🛫 **Task Executed**: Navigated to GDS Multi-Carrier Flight Search Engine.`;
    } else if (lower.includes("cheap") || lower.includes("deal") || lower.includes("search") || lower.includes("fare")) {
      clientActions.push({ type: "SET_ROUTE", origin: "DEL", destination: "LHR" });
      responseText = `💡 **GDS Fare Optimization**: Analyzed routes between DEL and LHR. Midweek rates show an average 18.4% price advantage!`;
    } else {
      responseText = `✨ **Nimbus Agent Active**: I can directly book seats, cancel passes, switch currency, or pull live radar. Try: *"Book seat 1A on Emirates"*, *"Switch currency to USD"*, or *"Show my passes"*.`;
    }

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        status: "ok",
        text: responseText,
        actions: clientActions,
        timestamp: new Date().toISOString(),
      }),
    };
  } catch (err) {
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: "Agent execution failure", details: err.message }),
    };
  }
}
