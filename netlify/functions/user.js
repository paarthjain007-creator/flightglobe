/**
 * Netlify Serverless Function for User Profile & Preferences.
 */

let USER_STATE = {
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
};

export async function handler(event, _context) {
  const headers = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
    "Access-Control-Allow-Methods": "GET, PUT, OPTIONS",
    "Content-Type": "application/json",
  };

  if (event.httpMethod === "OPTIONS") {
    return { statusCode: 204, headers, body: "" };
  }

  if (event.httpMethod === "GET") {
    return { statusCode: 200, headers, body: JSON.stringify({ status: "ok", user: USER_STATE }) };
  }

  if (event.httpMethod === "PUT") {
    try {
      const body = JSON.parse(event.body || "{}");
      USER_STATE.preferences = { ...USER_STATE.preferences, ...body };
      return { statusCode: 200, headers, body: JSON.stringify({ status: "ok", preferences: USER_STATE.preferences }) };
    } catch (err) {
      return { statusCode: 400, headers, body: JSON.stringify({ error: err.message }) };
    }
  }

  return { statusCode: 405, headers, body: JSON.stringify({ error: "Method not allowed" }) };
}
