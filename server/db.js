import fs from 'fs';
import path from 'path';

const DB_PATH = path.resolve(process.cwd(), 'flightglobe_db.json');

// Initialize DB if it doesn't exist
function initDB() {
  if (!fs.existsSync(DB_PATH)) {
    const defaultData = {
      users: {
        "usr_commander_1": {
          id: "usr_commander_1",
          name: "Commander Alex Vance",
          email: "alex.vance@flightglobe.io",
          role: "passenger",
          preferences: {
            currency: "INR",
            soundEnabled: true,
            defaultOrigin: "DEL",
            defaultClass: "Business",
          },
        }
      },
      bookings: {}
    };
    fs.writeFileSync(DB_PATH, JSON.stringify(defaultData, null, 2), 'utf8');
  }
}

initDB();

function readDB() {
  return JSON.parse(fs.readFileSync(DB_PATH, 'utf8'));
}

function writeDB(data) {
  fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2), 'utf8');
}

export function getUser(userId = "usr_commander_1") {
  if (!userId) return null;
  const db = readDB();
  return db.users[userId] || null;
}

export function updateUserPreferences(userId, prefs = {}) {
  const db = readDB();
  const user = db.users[userId];
  if (!user) throw new Error("User not found");
  
  user.preferences = { ...user.preferences, ...prefs };
  writeDB(db);
  return user.preferences;
}

export function getUserBookings(userId = "usr_commander_1") {
  const db = readDB();
  return Object.values(db.bookings)
    .filter((b) => b.userId === userId)
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
}

export function getBookingById(bookingId) {
  const db = readDB();
  return db.bookings[bookingId] || null;
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
  const db = readDB();
  const user = db.users[userId];
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

  db.bookings[id] = newBooking;
  writeDB(db);
  return newBooking;
}

export function cancelBooking(userId, bookingIdOrRef) {
  const db = readDB();
  const user = db.users[userId];
  if (!user) throw new Error("User not found");

  if (!bookingIdOrRef || (typeof bookingIdOrRef !== "string" && typeof bookingIdOrRef !== "number")) {
    throw new Error("Booking ID or Reference is required");
  }

  const searchTarget = String(bookingIdOrRef).trim().toUpperCase();

  let targetKey = null;
  for (const [key, b] of Object.entries(db.bookings)) {
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

  const cancelled = db.bookings[targetKey];
  delete db.bookings[targetKey];
  writeDB(db);
  return cancelled;
}
