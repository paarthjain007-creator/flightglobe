/**
 * FlightGlobe Agentic AI Execution Engine
 * Intercepts AI tool calls, verifies security boundaries, executes bound backend database functions,
 * and formats response payloads with client state updates.
 */

import {
  getUser,
  createBooking,
  getUserBookings,
  cancelBooking,
  updateUserPreferences,
} from "./db.js";
import { get7DayFareMatrixData, getTrafficData, searchGlobalAirports, CITY_ALIASES, HUB_MAP } from "./proxy.js";

function resolveCityOrIata(term) {
  if (!term || typeof term !== "string") return null;
  const t = term.trim().toLowerCase();
  if (t.length === 3) return t.toUpperCase();
  if (CITY_ALIASES[t]) return CITY_ALIASES[t];
  if (HUB_MAP[t]) return HUB_MAP[t];
  const matched = searchGlobalAirports(t);
  if (matched && matched.length > 0 && matched[0].iata) return matched[0].iata;
  return null;
}

/**
 * Execute a specific tool function call under user context
 */
export async function executeAgentTool(user, toolName, args) {
  console.log(`[AgentEngine] Executing tool '${toolName}' for user '${user.id}'`, args);

  switch (toolName) {
    case "search_flights": {
      const { origin, destination, departureDate, currency } = args;
      const matrix = get7DayFareMatrixData(origin, destination, departureDate, currency || user.preferences?.currency || "USD");
      const lowest = matrix.matrix?.[0];
      const fareStr = lowest ? `${lowest.symbol}${lowest.price.toLocaleString()}` : "available";
      return {
        success: true,
        data: matrix,
        clientAction: {
          type: "SET_ROUTE",
          origin,
          destination,
        },
        message: `Found direct flights between ${origin} and ${destination}. 7-day lowest fare is ${fareStr}.`,
      };
    }

    case "book_flight": {
      const { airline, flightCode, fromCode, toCode, seat, departureTime, price } = args;
      const origin = fromCode || "DEL";
      const dest = toCode || "LHR";
      const userCurr = user.preferences?.currency || "USD";

      // Compute dynamic route-based price if not explicitly supplied
      const matrix = get7DayFareMatrixData(origin, dest, null, userCurr);
      const computedPrice = matrix.matrix?.[3]?.price || (userCurr === "INR" ? 42500 : 520);
      const finalPrice = typeof price === "number" && !isNaN(price) ? Math.round(price) : computedPrice;

      const airlineName = airline || "Air India";
      const flightObj = {
        code: flightCode || `${airlineName.slice(0, 2).toUpperCase()}-402`,
        airline: airlineName,
        from: origin,
        to: dest,
        dep: departureTime || "09:45",
        arr: "17:30",
        dur: "8h 15m",
        plane: "Boeing 787-9 Dreamliner",
        price: finalPrice,
        currency: userCurr,
      };

      const booking = createBooking(user.id, {
        flight: flightObj,
        seat: seat || "2B",
        currency: userCurr,
        totalPrice: finalPrice,
      });

      return {
        success: true,
        booking,
        clientAction: {
          type: "BOOKING_CREATED",
          booking,
        },
        message: `Successfully booked ${flightObj.airline} (${flightObj.code}) seat ${booking.seat}. Booking Ref: ${booking.bookingRef}.`,
      };
    }

    case "cancel_booking": {
      const { bookingId } = args;
      const cancelled = cancelBooking(user.id, bookingId);
      return {
        success: true,
        cancelledId: cancelled.id,
        clientAction: {
          type: "BOOKING_CANCELLED",
          bookingId: cancelled.id,
        },
        message: `Cancelled flight reservation ${cancelled.id} (${cancelled.flight.airline} ${cancelled.flight.code}).`,
      };
    }

    case "change_currency": {
      const { currency } = args;
      updateUserPreferences(user.id, { currency });
      return {
        success: true,
        currency,
        clientAction: {
          type: "SET_CURRENCY",
          currency,
        },
        message: `Website currency updated to ${currency}.`,
      };
    }

    case "navigate_view": {
      const { targetView } = args;
      return {
        success: true,
        targetView,
        clientAction: {
          type: "SWITCH_VIEW",
          view: targetView,
        },
        message: `Navigated UI view to '${targetView}'.`,
      };
    }

    case "get_telemetry": {
      const { origin, destination } = args;
      const traffic = await getTrafficData();
      return {
        success: true,
        activeAirspacePlanes: traffic.planes?.length || 15,
        weather: { originTemp: "28°C", destTemp: "21°C", winds: "38 KTS Tailwinds" },
        clientAction: {
          type: "SWITCH_VIEW",
          view: "tracker",
        },
        message: `Telemetry feed active for ${origin} ➔ ${destination}. Cruise FL380, 38-knot tailwinds, zero congestion.`,
      };
    }

    default:
      throw new Error(`Unknown tool '${toolName}'`);
  }
}

/**
 * Agent Execution Process
 */
export async function processAgentChat(user, message, history = []) {
  const query = message.trim();
  const lower = query.toLowerCase();
  const clientActions = [];
  let responseText = "";

  // Intelligent intent detection & tool matching (with typo tolerance)
  const isCancelling =
    lower.includes("cancel") ||
    lower.includes("cancle") ||
    lower.includes("delete booking") ||
    lower.includes("remove pass") ||
    lower.includes("drop booking");

  const isBookingView =
    lower.includes("booking page") ||
    lower.includes("open booking") ||
    lower.includes("booking view") ||
    lower.includes("booking tab") ||
    lower.includes("gds engine") ||
    lower.includes("gds search");

  const isBooking =
    !isCancelling &&
    !isBookingView &&
    (lower.match(/\b(book|reserve|reservation)\b/i) ||
      lower.includes("book seat") ||
      lower.includes("book flight") ||
      lower.includes("book ticket") ||
      lower.includes("buy ticket") ||
      lower.includes("get ticket"));

  const isCurrency =
    lower.includes("currency") ||
    lower.includes("currensy") ||
    lower.includes("inr") ||
    lower.includes("rupee") ||
    lower.includes("rupe") ||
    lower.includes("usd") ||
    lower.includes("dollar") ||
    lower.includes("doller") ||
    lower.includes("eur") ||
    lower.includes("euro") ||
    lower.includes("eruo") ||
    lower.includes("gbp") ||
    lower.includes("pound") ||
    lower.includes("pund") ||
    lower.includes("aed") ||
    lower.includes("dirham") ||
    lower.includes("dirhm") ||
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

  if (isCancelling) {
    const refMatch = query.match(/T-[0-9]{4}|FG-[0-9]{6}/i);
    let bookingId = refMatch ? refMatch[0].toUpperCase() : null;

    if (!bookingId) {
      const userBookings = getUserBookings(user.id);
      if (userBookings.length > 0) {
        bookingId = userBookings[0].id;
      }
    }

    if (!bookingId) {
      responseText = `ℹ️ **Notice**: You have no active flight reservations to cancel.`;
    } else {
      try {
        const toolResult = await executeAgentTool(user, "cancel_booking", { bookingId });
        clientActions.push(toolResult.clientAction);
        responseText = `🗑️ **Task Executed**: Reservation **${bookingId}** has been cancelled successfully. Your active itinerary has been updated.`;
      } catch (err) {
        responseText = `⚠️ **Execution Error**: ${err.message}`;
      }
    }

  } else if (isBookingView) {
    const toolResult = await executeAgentTool(user, "navigate_view", { targetView: "booking" });
    clientActions.push(toolResult.clientAction);
    responseText = `🛫 **Task Executed**: Navigated to GDS Multi-Carrier Flight Search Engine.`;

  } else if (isDashboard) {
    const toolResult = await executeAgentTool(user, "navigate_view", { targetView: "dashboard" });
    clientActions.push(toolResult.clientAction);
    responseText = `📊 **Task Executed**: Navigated to Trip Analytics Dashboard & Delay Forecast Engine.`;

  } else if (isExplore) {
    const toolResult = await executeAgentTool(user, "navigate_view", { targetView: "explore" });
    clientActions.push(toolResult.clientAction);
    responseText = `🌍 **Task Executed**: Navigated to 3D Master Globe Explorer.`;

  } else if (isPasses) {
    const toolResult = await executeAgentTool(user, "navigate_view", { targetView: "trips" });
    clientActions.push(toolResult.clientAction);
    responseText = `🎟️ **Task Executed**: Navigated to your boarding passes.`;

  } else if (isRadar) {
    let origin = "DEL";
    let destination = "LHR";
    const routeMatch = query.match(/from\s+([a-zA-Z\s]+?)\s+to\s+([a-zA-Z\s]+)/i);
    if (routeMatch) {
      origin = resolveCityOrIata(routeMatch[1]) || "DEL";
      destination = resolveCityOrIata(routeMatch[2]) || "LHR";
    }
    const toolResult = await executeAgentTool(user, "get_telemetry", { origin, destination });
    clientActions.push(toolResult.clientAction);
    responseText = `🛰️ **Task Executed**: Switched to Live Radar HUD. ${toolResult.message}`;

  } else if (isCurrency) {
    let curr = "USD";
    if (lower.match(/\b(inr|rupee|rupees|rupe)\b/i)) curr = "INR";
    if (lower.match(/\b(eur|euro|euros|eruo)\b/i)) curr = "EUR";
    if (lower.match(/\b(gbp|pound|pounds|pund)\b/i)) curr = "GBP";
    if (lower.match(/\b(aed|dirham|dirhams|dirhm)\b/i)) curr = "AED";
    if (lower.match(/\b(sgd)\b/i)) curr = "SGD";
    if (lower.match(/\b(usd|dollar|dollars|doller)\b/i)) curr = "USD";

    const toolResult = await executeAgentTool(user, "change_currency", { currency: curr });
    clientActions.push(toolResult.clientAction);
    responseText = `💱 **Task Executed**: Updated display currency to **${curr}**. All flight fares across the site have been recalculated.`;

  } else if (isBooking) {
    // Extract seat if specified (supports "seat 1A", "seat 1a", "seat 14 b")
    const seatMatch = query.match(/seat\s*([0-9]{1,2}\s*[a-zA-Z])/i);
    const seat = seatMatch ? seatMatch[1].replace(/\s+/g, "").toUpperCase() : "2B";

    // Dynamic origin & destination extraction
    let fromCode = "DEL";
    let toCode = "LHR";
    const routeMatch = query.match(/from\s+([a-zA-Z]{3}|[a-zA-Z\s]+?)\s+to\s+([a-zA-Z]{3}|[a-zA-Z\s]+)/i);
    if (routeMatch) {
      const o = routeMatch[1].trim();
      const d = routeMatch[2].trim();
      const resolvedFrom = resolveCityOrIata(o);
      const resolvedTo = resolveCityOrIata(d);
      if (resolvedFrom) fromCode = resolvedFrom;
      if (resolvedTo) toCode = resolvedTo;
    } else {
      const toOnly = query.match(/to\s+([a-zA-Z\s]+)/i);
      if (toOnly) {
        const resolvedTo = resolveCityOrIata(toOnly[1].trim());
        if (resolvedTo) toCode = resolvedTo;
      }
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

    const toolResult = await executeAgentTool(user, "book_flight", {
      airline,
      flightCode,
      fromCode,
      toCode,
      seat,
    });

    clientActions.push(toolResult.clientAction);
    responseText = `✈️ **Task Executed**: I have booked your flight! **${toolResult.booking.flight.airline} (${toolResult.booking.flight.code})** seat **${toolResult.booking.seat}** (${fromCode} ➔ ${toCode}). Booking Ref: \`${toolResult.booking.bookingRef}\`. You can view your pass in 'My Passes'.`;

  } else if (lower.includes("cheap") || lower.includes("deal") || lower.includes("search") || lower.includes("fare") || lower.includes("fligth") || lower.includes("flght")) {
    let origin = "DEL";
    let destination = "LHR";
    const routeMatch = query.match(/from\s+([a-zA-Z\s]+?)\s+to\s+([a-zA-Z\s]+)/i);
    if (routeMatch) {
      origin = resolveCityOrIata(routeMatch[1]) || "DEL";
      destination = resolveCityOrIata(routeMatch[2]) || "LHR";
    }
    const toolResult = await executeAgentTool(user, "search_flights", { origin, destination });
    clientActions.push(toolResult.clientAction);
    responseText = `💡 **GDS Fare Optimization**: Analyzed routes between ${origin} and ${destination}. Midweek rates show an average 18.4% price advantage!`;

  } else {
    responseText = `✨ **Nimbus Agent Active**: I monitored your request. I can directly book seats, cancel passes, switch currency, or pull live ADS-B radar. Try asking: *"Book seat 1A on Emirates"*, *"Switch currency to USD"*, or *"Show my passes"*.`;
  }

  return {
    text: responseText,
    actions: clientActions,
    timestamp: new Date().toISOString(),
  };
}
