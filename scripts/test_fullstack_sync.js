/**
 * scripts/test_fullstack_sync.js
 * End-to-end integration test verifying:
 * 1. Express REST API CRUD for Bookings
 * 2. AI Copilot Agent Chat & Autonomous Tool Invocations
 * 3. Case-insensitive cancellation
 * 4. Netlify Serverless Function handler parity
 */

import { handler as trafficHandler } from "../netlify/functions/traffic.js";
import { handler as ratesHandler } from "../netlify/functions/rates.js";
import { handler as faresHandler } from "../netlify/functions/fares.js";
import { handler as airportsHandler } from "../netlify/functions/airports.js";
import { handler as bookingsHandler } from "../netlify/functions/bookings.js";
import { handler as agentHandler } from "../netlify/functions/agent.js";
import { handler as userHandler } from "../netlify/functions/user.js";
import { handler as healthHandler } from "../netlify/functions/health.js";

async function runSyncAudit() {
  console.log("==========================================================");
  console.log("  FLIGHTGLOBE FULL-STACK SYNC & SERVERLESS INTEGRATION TEST");
  console.log("==========================================================");

  let passed = 0;
  let failed = 0;

  function assert(condition, message) {
    if (condition) {
      console.log(`✅ PASS: ${message}`);
      passed++;
    } else {
      console.error(`❌ FAIL: ${message}`);
      failed++;
    }
  }

  // ── TEST 1: Express REST API Booking CRUD ─────────────────────────────
  console.log("\n--- Section 1: Express REST API Booking Lifecycle ---");
  const API_BASE = "http://localhost:3001";
  const AUTH_HEADER = { Authorization: "Bearer usr_commander_1" };

  try {
    // 1.1 List existing bookings
    const listRes = await fetch(`${API_BASE}/api/bookings`, { headers: AUTH_HEADER });
    const listData = await listRes.json();
    assert(listRes.ok && Array.isArray(listData.bookings), "GET /api/bookings returns active bookings list");
    const initialCount = listData.bookings.length;

    // 1.2 Create a new booking via API
    const testTrip = {
      flight: {
        code: "BA-178",
        airline: "British Airways",
        from: "JFK",
        to: "LHR",
        dep: "08:30",
        arr: "20:45",
        dur: "7h 15m",
        plane: "Boeing 777-300ER",
        price: 48500,
      },
      origin: { iata: "JFK", code: "JFK", city: "New York" },
      destination: { iata: "LHR", code: "LHR", city: "London" },
      seat: "7A",
      bookingRef: "FG-991122",
      totalPrice: 48500,
    };

    const createRes = await fetch(`${API_BASE}/api/bookings`, {
      method: "POST",
      headers: { ...AUTH_HEADER, "Content-Type": "application/json" },
      body: JSON.stringify(testTrip),
    });
    const createData = await createRes.json();
    assert(createRes.ok && createData.status === "ok" && createData.booking?.seat === "7A", "POST /api/bookings creates booking successfully");
    const createdId = createData.booking.id;

    // 1.3 Verify booking count increased
    const verifyRes = await fetch(`${API_BASE}/api/bookings`, { headers: AUTH_HEADER });
    const verifyData = await verifyRes.json();
    assert(verifyData.bookings.length === initialCount + 1, `Booking persisted in database (count: ${initialCount} -> ${verifyData.bookings.length})`);

    // 1.4 Case-insensitive cancellation via API
    const cancelRes = await fetch(`${API_BASE}/api/bookings/${createdId.toLowerCase()}`, {
      method: "DELETE",
      headers: AUTH_HEADER,
    });
    const cancelData = await cancelRes.json();
    assert(cancelRes.ok && cancelData.status === "ok" && cancelData.cancelled?.id === createdId, `DELETE /api/bookings/:id succeeds case-insensitively for '${createdId.toLowerCase()}'`);

    // 1.5 Verify booking removed
    const verifyDelRes = await fetch(`${API_BASE}/api/bookings`, { headers: AUTH_HEADER });
    const verifyDelData = await verifyDelRes.json();
    assert(verifyDelData.bookings.length === initialCount, "Cancelled booking no longer appears in user bookings list");

  } catch (err) {
    console.error("Express API Section Crashed:", err);
    failed++;
  }

  // ── TEST 2: Autonomous Agent Chat & Tool Execution ─────────────────────
  console.log("\n--- Section 2: AI Copilot Agent Chat & Action Execution ---");
  try {
    // 2.1 Currency Switch Action
    const currRes = await fetch(`${API_BASE}/api/agent/chat`, {
      method: "POST",
      headers: { ...AUTH_HEADER, "Content-Type": "application/json" },
      body: JSON.stringify({ message: "Can you change currency to INR?" }),
    });
    const currData = await currRes.json();
    assert(
      currData.status === "ok" && currData.actions?.some((a) => a.type === "SET_CURRENCY" && a.currency === "INR"),
      "AI Agent executes 'change_currency' tool and returns SET_CURRENCY action"
    );

    // 2.2 Direct Booking via AI Agent
    const agentBookRes = await fetch(`${API_BASE}/api/agent/chat`, {
      method: "POST",
      headers: { ...AUTH_HEADER, "Content-Type": "application/json" },
      body: JSON.stringify({ message: "Book seat 1A on Emirates from DEL to LHR" }),
    });
    const agentBookData = await agentBookRes.json();
    const createdAction = agentBookData.actions?.find((a) => a.type === "BOOKING_CREATED");
    assert(
      agentBookData.status === "ok" && createdAction?.booking?.seat === "1A" && createdAction?.booking?.flight?.airline === "Emirates",
      "AI Agent executes 'book_flight' tool with seat 1A and Emirates airline"
    );

    const agentBookingId = createdAction?.booking?.id;

    // 2.3 Cancel booking via AI Agent
    if (agentBookingId) {
      const agentCancelRes = await fetch(`${API_BASE}/api/agent/chat`, {
        method: "POST",
        headers: { ...AUTH_HEADER, "Content-Type": "application/json" },
        body: JSON.stringify({ message: `Please cancel booking ${agentBookingId.toLowerCase()}` }),
      });
      const agentCancelData = await agentCancelRes.json();
      assert(
        agentCancelData.status === "ok" && agentCancelData.actions?.some((a) => a.type === "BOOKING_CANCELLED" && a.bookingId === agentBookingId),
        `AI Agent executes 'cancel_booking' tool for ${agentBookingId}`
      );
    }

  } catch (err) {
    console.error("AI Agent Section Crashed:", err);
    failed++;
  }

  // ── TEST 3: Netlify Serverless Functions In-Memory Execution ────────────
  console.log("\n--- Section 3: Netlify Serverless Functions Execution ---");

  // 3.1 health.js
  const healthRes = await healthHandler({ httpMethod: "GET" }, {});
  assert(healthRes.statusCode === 200 && JSON.parse(healthRes.body).status === "ok", "Netlify Function: health.js returns 200 OK");

  // 3.2 traffic.js
  const trafficRes = await trafficHandler({ httpMethod: "GET" }, {});
  assert(trafficRes.statusCode === 200 && Array.isArray(JSON.parse(trafficRes.body).planes), "Netlify Function: traffic.js returns valid planes array");

  // 3.3 rates.js
  const ratesRes = await ratesHandler({ httpMethod: "GET" }, {});
  assert(ratesRes.statusCode === 200 && JSON.parse(ratesRes.body).rates?.USD === 1, "Netlify Function: rates.js returns exchange rates");

  // 3.4 fares.js
  const faresRes = await faresHandler({
    httpMethod: "GET",
    queryStringParameters: { origin: "DEL", destination: "LHR", currency: "USD" },
  }, {});
  assert(faresRes.statusCode === 200 && Array.isArray(JSON.parse(faresRes.body).matrix), "Netlify Function: fares.js returns 7-day matrix");

  // 3.5 airports.js
  const airportsRes = await airportsHandler({
    httpMethod: "GET",
    queryStringParameters: { q: "tokyo" },
  }, {});
  const airportsData = JSON.parse(airportsRes.body);
  assert(airportsRes.statusCode === 200 && airportsData.results.some((a) => a.iata === "HND" || a.iata === "NRT"), "Netlify Function: airports.js resolves Tokyo hubs");

  // 3.6 user.js
  const userRes = await userHandler({
    httpMethod: "GET",
    headers: { authorization: "Bearer usr_commander_1" },
  }, {});
  assert(userRes.statusCode === 200 && JSON.parse(userRes.body).user?.id === "usr_commander_1", "Netlify Function: user.js authenticates user session");

  // 3.7 bookings.js (GET & POST)
  const bookingsRes = await bookingsHandler({
    httpMethod: "GET",
    headers: { authorization: "Bearer usr_commander_1" },
  }, {});
  assert(bookingsRes.statusCode === 200 && Array.isArray(JSON.parse(bookingsRes.body).bookings), "Netlify Function: bookings.js lists active bookings");

  // 3.8 agent.js
  const agentRes = await agentHandler({
    httpMethod: "POST",
    headers: { authorization: "Bearer usr_commander_1" },
    body: JSON.stringify({ message: "Switch currency to USD" }),
  }, {});
  assert(agentRes.statusCode === 200 && JSON.parse(agentRes.body).actions?.some((a) => a.currency === "USD"), "Netlify Function: agent.js executes autonomous agent request");

  console.log("\n==========================================================");
  console.log(`  FINAL RESULTS: ${passed} PASSED, ${failed} FAILED`);
  console.log("==========================================================");

  if (failed > 0) {
    process.exit(1);
  }
}

runSyncAudit().catch((err) => {
  console.error("Fatal test error:", err);
  process.exit(1);
});
