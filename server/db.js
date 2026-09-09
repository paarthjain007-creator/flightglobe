/**
 * FlightGlobe Database & Persistence Layer
 * Handles in-memory & persistent CRUD operations for Users, Bookings, Flights, and System Settings.
 */

// Initial Seed Data
const USERS_DB = new Map([
  [
    "usr_commander_1",
    {
      id: "usr_commander_1",
      name: "Commander Alex Vance",
      email: "alex.vance@flightglobe.io",
      role: "passenger", // 'passenger' | 'admin' | 'agent'
      preferences: {
        currency: "INR",
        soundEnabled: true,
        defaultOrigin: "DEL",
        defaultClass: "Business",
      },
    },
  ],
]);

const BOOKINGS_DB = new Map([
  [
    "T-8842",
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
  ],
]);

/* ─── Database Operations ─────────────────────────────────────────────────── */

export function getUser(userId = "usr_commander_1") {
  if (!userId) return null;
  return USERS_DB.get(userId) || null;
}

export function updateUserPreferences(userId, prefs = {}) {
  const user = getUser(userId);
  if (!user) throw new Error("User not found");
  user.preferences = { ...user.preferences, ...prefs };
  USERS_DB.set(user.id, user);
  return user.preferences;
}

export function getUserBookings(userId = "usr_commander_1") {
  return Array.from(BOOKINGS_DB.values())
    .filter((b) => b.userId === userId)
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
}

export function getBookingById(bookingId) {
  return BOOKINGS_DB.get(bookingId) || null;
}

const SYMBOL_LOOKUP = {
  INR: "₹",
  USD: "$",
  EUR: "€",
  GBP: "£",
  AED: "AED ",
  CHF: "CHF ",
  JPY: "¥",
  AUD: "A$",
};

export function createBooking(userId, bookingData = {}) {
  const user = getUser(userId);
  if (!user) throw new Error("User not found");

  const id = bookingData.id || `T-${Math.floor(1000 + Math.random() * 9000)}`;
  const bookingRef = bookingData.bookingRef || `FG-${Math.floor(100000 + Math.random() * 900000)}`;

  const flight = bookingData.flight || {};
  const originCode = (bookingData.origin?.iata || bookingData.origin?.code || flight.from || "DEL").toUpperCase();
  const destCode = (bookingData.destination?.iata || bookingData.destination?.code || flight.to || "LHR").toUpperCase();

  const currency = (
    bookingData.currency ||
    flight.currency ||
    user.preferences?.currency ||
    "USD"
  ).toUpperCase();
  const currencySymbol =
    bookingData.currencySymbol ||
    flight.currencySymbol ||
    SYMBOL_LOOKUP[currency] ||
    "$";

  const defaultPrice = currency === "INR" ? 42500 : 520;
  const rawPrice = bookingData.totalPrice ?? flight.price ?? defaultPrice;
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

  const seat = String(bookingData.seat || "3A").trim().toUpperCase();

  const newBooking = {
    id,
    userId: user.id,
    flight: normalizedFlight,
    seat,
    gate: bookingData.gate || `${String.fromCharCode(65 + Math.floor(Math.random() * 4))}${Math.floor(1 + Math.random() * 24)}`,
    terminal: bookingData.terminal || `T${Math.floor(1 + Math.random() * 3)}`,
    group: bookingData.group || (seat.startsWith("1") || seat.startsWith("2") ? "A (Priority)" : "B"),
    origin: {
      iata: originCode,
      code: originCode,
      city: bookingData.origin?.city || flight.fromCity || originCode,
    },
    destination: {
      iata: destCode,
      code: destCode,
      city: bookingData.destination?.city || flight.toCity || destCode,
    },
    totalPrice,
    currency,
    currencySymbol,
    bookingRef,
    date: bookingData.date || new Date().toISOString().split("T")[0],
    createdAt: new Date().toISOString(),
  };

  BOOKINGS_DB.set(id, newBooking);
  return newBooking;
}

export function cancelBooking(userId, bookingIdOrRef) {
  const user = getUser(userId);
  if (!user) throw new Error("User not found");

  if (!bookingIdOrRef || (typeof bookingIdOrRef !== "string" && typeof bookingIdOrRef !== "number")) {
    throw new Error("Booking ID or Reference is required");
  }

  const searchTarget = String(bookingIdOrRef).trim().toUpperCase();
  if (!searchTarget) {
    throw new Error("Booking ID or Reference cannot be blank");
  }

  // Find by ID or Booking Reference (case-insensitive)
  let targetKey = null;
  for (const [key, b] of BOOKINGS_DB.entries()) {
    const idMatch = b.id && b.id.toUpperCase() === searchTarget;
    const refMatch = b.bookingRef && b.bookingRef.toUpperCase() === searchTarget;
    if ((idMatch || refMatch) && b.userId === user.id) {
      targetKey = key;
      break;
    }
  }

  if (!targetKey) {
    throw new Error(`Booking '${bookingIdOrRef}' not found or unauthorized.`);
  }

  const cancelled = BOOKINGS_DB.get(targetKey);
  BOOKINGS_DB.delete(targetKey);
  return cancelled;
}
