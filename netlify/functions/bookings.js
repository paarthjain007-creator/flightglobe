/**
 * Netlify Serverless Function for User Flight Bookings (CRUD).
 */

let IN_MEMORY_BOOKINGS = [
  {
    id: "T-8842",
    userId: "usr_commander_1",
    flight: {
      code: "AI-805",
      airline: "Air India",
      from: "DEL",
      to: "LHR",
      dep: "09:45",
      arr: "11:55",
      dur: "8h 40m",
      plane: "Boeing 787-9 Dreamliner",
      price: 42500,
      currency: "INR",
      currencySymbol: "₹",
    },
    seat: "2B",
    gate: "B14",
    terminal: "T3",
    group: "A (Priority)",
    bookingRef: "FG-847291",
    date: "2026-09-20",
    totalPrice: 42500,
    currency: "INR",
    currencySymbol: "₹",
    createdAt: new Date().toISOString(),
  },
];

export async function handler(event, _context) {
  const headers = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
    "Access-Control-Allow-Methods": "GET, POST, DELETE, OPTIONS",
    "Content-Type": "application/json",
  };

  if (event.httpMethod === "OPTIONS") {
    return { statusCode: 204, headers, body: "" };
  }

  // GET /api/bookings
  if (event.httpMethod === "GET") {
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ status: "ok", bookings: IN_MEMORY_BOOKINGS }),
    };
  }

  // POST /api/bookings
  if (event.httpMethod === "POST") {
    try {
      const body = JSON.parse(event.body || "{}");
      const id = body.id || `T-${Math.floor(1000 + Math.random() * 9000)}`;
      const bookingRef = body.bookingRef || `FG-${Math.floor(100000 + Math.random() * 900000)}`;
      const flight = body.flight || {};

      const originCode = (body.origin?.iata || body.origin?.code || flight.from || "DEL").toUpperCase();
      const destCode = (body.destination?.iata || body.destination?.code || flight.to || "LHR").toUpperCase();
      const currency = (body.currency || flight.currency || "USD").toUpperCase();
      const symbolMap = { USD: "$", EUR: "€", GBP: "£", INR: "₹", AED: "AED ", CHF: "CHF ", JPY: "¥", AUD: "A$" };
      const currencySymbol = body.currencySymbol || flight.currencySymbol || symbolMap[currency] || "$";

      const defaultPrice = currency === "INR" ? 42500 : 520;
      const rawPrice = body.totalPrice ?? flight.price ?? defaultPrice;
      const totalPrice = typeof rawPrice === "number" && !isNaN(rawPrice) ? Math.round(rawPrice) : defaultPrice;

      const normalizedFlight = {
        code: flight.code || `AI-${Math.floor(100 + Math.random() * 899)}`,
        airline: flight.airline || "Air India",
        from: originCode,
        to: destCode,
        dep: flight.dep || "09:45",
        arr: flight.arr || "11:55",
        dur: flight.dur || "8h 40m",
        plane: flight.plane || "Boeing 787-9 Dreamliner",
        price: totalPrice,
        currency,
        currencySymbol,
      };

      const seat = String(body.seat || "3A").trim().toUpperCase();

      const newBooking = {
        id,
        userId: "usr_commander_1",
        flight: normalizedFlight,
        seat,
        gate: body.gate || "A12",
        terminal: body.terminal || "T2",
        group: body.group || (seat.startsWith("1") || seat.startsWith("2") ? "A (Priority)" : "B"),
        origin: {
          iata: originCode,
          code: originCode,
          city: body.origin?.city || flight.fromCity || originCode,
        },
        destination: {
          iata: destCode,
          code: destCode,
          city: body.destination?.city || flight.toCity || destCode,
        },
        totalPrice,
        currency,
        currencySymbol,
        bookingRef,
        date: body.date || new Date().toISOString().split("T")[0],
        createdAt: new Date().toISOString(),
      };

      IN_MEMORY_BOOKINGS.unshift(newBooking);
      return {
        statusCode: 201,
        headers,
        body: JSON.stringify({ status: "ok", booking: newBooking }),
      };
    } catch (err) {
      return { statusCode: 400, headers, body: JSON.stringify({ error: err.message }) };
    }
  }

  // DELETE /api/bookings/:id
  if (event.httpMethod === "DELETE") {
    const cleanParts = (event.path || "").split("/").filter(Boolean);
    const idFromPath = cleanParts.length > 0 ? cleanParts[cleanParts.length - 1] : "";
    const idFromQuery = event.queryStringParameters?.id || event.queryStringParameters?.bookingId || "";
    const idToDelete = decodeURIComponent(idFromQuery || idFromPath || "").trim().toUpperCase();

    if (!idToDelete) {
      return { statusCode: 400, headers, body: JSON.stringify({ error: "Booking ID or Reference is required" }) };
    }

    const idx = IN_MEMORY_BOOKINGS.findIndex(
      (b) => (b.id && b.id.toUpperCase() === idToDelete) || (b.bookingRef && b.bookingRef.toUpperCase() === idToDelete)
    );

    if (idx !== -1) {
      const removed = IN_MEMORY_BOOKINGS.splice(idx, 1)[0];
      return { statusCode: 200, headers, body: JSON.stringify({ status: "ok", cancelled: removed }) };
    }

    return { statusCode: 404, headers, body: JSON.stringify({ error: `Booking '${idToDelete}' not found` }) };
  }

  return { statusCode: 405, headers, body: JSON.stringify({ error: "Method not allowed" }) };
}
