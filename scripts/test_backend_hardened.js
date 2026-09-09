/**
 * scripts/test_backend_hardened.js
 * Comprehensive Forensic Backend Test Suite:
 * - Security & Authentication enforcement
 * - Malformed payload resilience (400)
 * - Safe 404 JSON routing
 * - Edge-case input tolerance (nulls, types, fuzzy strings, invalid dates)
 * - Serverless Netlify function feature parity
 * - High-concurrency stress testing
 */

import { handler as trafficHandler } from "../netlify/functions/traffic.js";
import { handler as ratesHandler } from "../netlify/functions/rates.js";
import { handler as faresHandler } from "../netlify/functions/fares.js";
import { handler as airportsHandler } from "../netlify/functions/airports.js";
import { handler as bookingsHandler } from "../netlify/functions/bookings.js";
import { handler as agentHandler } from "../netlify/functions/agent.js";
import { handler as userHandler } from "../netlify/functions/user.js";
import { handler as healthHandler } from "../netlify/functions/health.js";

const API_BASE = "http://localhost:3001";
const AUTH_HEADER = { Authorization: "Bearer usr_commander_1" };

async function runHardenedTests() {
  console.log("================================================================================");
  console.log("           FLIGHTGLOBE ELITE BACKEND FORENSIC & RESILIENCE AUDIT                ");
  console.log("================================================================================");

  let passed = 0;
  let failed = 0;

  function assert(condition, testName, details = "") {
    if (condition) {
      console.log(`  ✅ [PASS] ${testName}`);
      passed++;
    } else {
      console.error(`  ❌ [FAIL] ${testName}${details ? " -> " + details : ""}`);
      failed++;
    }
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // 1. SECURITY, AUTHENTICATION & ROUTE BOUNDARIES
  // ─────────────────────────────────────────────────────────────────────────────
  console.log("\n[SECTION 1: Security, Authentication & Route Boundaries]");

  try {
    // 1.1 Unauthenticated requests rejected
    const unauthRes = await fetch(`${API_BASE}/api/user/me`);
    assert(unauthRes.status === 401, "GET /api/user/me rejects unauthenticated request with 401");

    // 1.2 Invalid Bearer token rejected
    const badTokenRes = await fetch(`${API_BASE}/api/bookings`, {
      headers: { Authorization: "Bearer invalid_token_xyz" },
    });
    assert(badTokenRes.status === 401, "GET /api/bookings rejects invalid Bearer token with 401");

    // 1.3 Clean JSON 404 on non-existent /api routes
    const notFoundRes = await fetch(`${API_BASE}/api/non_existent_endpoint_xyz`);
    const notFoundJson = await notFoundRes.json();
    assert(
      notFoundRes.status === 404 && notFoundJson.error === "API endpoint not found",
      "GET /api/unknown returns clean JSON 404 rather than HTML fallback"
    );

    // 1.4 Malformed JSON payload returns 400 Bad Request safely
    const malformedRes = await fetch(`${API_BASE}/api/bookings`, {
      method: "POST",
      headers: { ...AUTH_HEADER, "Content-Type": "application/json" },
      body: "{ invalid json ...",
    });
    assert(malformedRes.status === 400, "POST /api/bookings with malformed JSON returns 400 Bad Request safely");

  } catch (err) {
    console.error("Section 1 Crashed:", err);
    failed++;
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // 2. RESILIENCE UNDER EXTREME & UNEXPECTED INPUTS
  // ─────────────────────────────────────────────────────────────────────────────
  console.log("\n[SECTION 2: Input Resilience & Defensive Processing]");

  try {
    // 2.1 Airport resolver with weird symbols and edge cases
    const weirdQueries = ["", "a", "123", "!@#$%", "   ", "londn", "dubayy", "bombay", "sanfran"];
    for (const q of weirdQueries) {
      const res = await fetch(`${API_BASE}/api/airports/search?q=${encodeURIComponent(q)}`);
      const data = await res.json();
      assert(
        res.status === 200 && data.status === "ok" && Array.isArray(data.results),
        `GET /api/airports/search?q=${JSON.stringify(q)} handles input without error`
      );
    }

    // 2.2 Fare matrix with invalid parameters & NaN protection
    const fareRes = await fetch(
      `${API_BASE}/api/fares/matrix?origin=INVALID&destination=UNKNOWN&departureDate=invalid-date&currency=NONEXISTENT`
    );
    const fareData = await fareRes.json();
    assert(
      fareRes.status === 200 &&
        Array.isArray(fareData.matrix) &&
        fareData.matrix.length === 7 &&
        typeof fareData.matrix[0].price === "number" &&
        !isNaN(fareData.matrix[0].price),
      "GET /api/fares/matrix gracefully resolves unknown airports and bad date/currency inputs"
    );

    // 2.3 Cancel booking with non-existent ID returns clean 404
    const cancelNonExistent = await fetch(`${API_BASE}/api/bookings/T-999999-DOES-NOT-EXIST`, {
      method: "DELETE",
      headers: AUTH_HEADER,
    });
    assert(cancelNonExistent.status === 404, "DELETE /api/bookings/:id for non-existent booking returns 404");

  } catch (err) {
    console.error("Section 2 Crashed:", err);
    failed++;
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // 3. PERSISTENCE & SCHEMAS INTEGRITY (EXPRESS)
  // ─────────────────────────────────────────────────────────────────────────────
  console.log("\n[SECTION 3: Persistence Layer & Data Schema Integrity]");

  try {
    // 3.1 Create booking with partial / minimal payload
    const minimalPayload = {
      flight: { code: "6E-551" },
      seat: "14C",
    };
    const createMinRes = await fetch(`${API_BASE}/api/bookings`, {
      method: "POST",
      headers: { ...AUTH_HEADER, "Content-Type": "application/json" },
      body: JSON.stringify(minimalPayload),
    });
    const createMinData = await createMinRes.json();
    const b = createMinData.booking;

    assert(
      createMinRes.status === 201 &&
        b &&
        b.id &&
        b.origin?.iata &&
        b.destination?.iata &&
        typeof b.totalPrice === "number" &&
        b.currency &&
        b.currencySymbol &&
        b.bookingRef,
      "POST /api/bookings normalizes partial input into a complete, valid booking record"
    );

    // 3.2 Case-insensitive and whitespace-tolerant cancellation
    const minBookingId = b.id;
    const cancelPadded = await fetch(`${API_BASE}/api/bookings/${encodeURIComponent("  " + minBookingId.toLowerCase() + "  ")}`, {
      method: "DELETE",
      headers: AUTH_HEADER,
    });
    assert(cancelPadded.status === 200, "DELETE /api/bookings/:id handles lowercase and whitespace padding");

  } catch (err) {
    console.error("Section 3 Crashed:", err);
    failed++;
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // 4. AUTONOMOUS AI AGENT ENGINE INTENTS & VIEW NAVIGATION
  // ─────────────────────────────────────────────────────────────────────────────
  console.log("\n[SECTION 4: Autonomous AI Copilot Agent Engine]");

  try {
    const agentQueries = [
      { msg: "Navigate to delay analytics dashboard", expectedAction: "SWITCH_VIEW", expectedView: "dashboard" },
      { msg: "Open the 3D planetary explorer globe", expectedAction: "SWITCH_VIEW", expectedView: "explore" },
      { msg: "Take me to GDS multi-carrier booking page", expectedAction: "SWITCH_VIEW", expectedView: "booking" },
      { msg: "Show my boarding passes and trips", expectedAction: "SWITCH_VIEW", expectedView: "trips" },
      { msg: "Show live radar telemetry for flights from DEL to LHR", expectedAction: "SWITCH_VIEW", expectedView: "tracker" },
      { msg: "Change my display currency to AED", expectedAction: "SET_CURRENCY", expectedCurrency: "AED" },
      { msg: "Book seat 1A on Emirates from JFK to LHR", expectedAction: "BOOKING_CREATED", verifyBooking: true },
      { msg: "Book seat 3F on IndiGo from DEL to BOM", expectedAction: "BOOKING_CREATED", verifyIndiGo: true },
      { msg: "Book seat 14A on SpiceJet from DEL to BLR", expectedAction: "BOOKING_CREATED", verifySpiceJet: true },
    ];

    for (const item of agentQueries) {
      const res = await fetch(`${API_BASE}/api/agent/chat`, {
        method: "POST",
        headers: { ...AUTH_HEADER, "Content-Type": "application/json" },
        body: JSON.stringify({ message: item.msg }),
      });
      const data = await res.json();
      assert(
        res.status === 200 && data.status === "ok" && Array.isArray(data.actions),
        `Agent processed query: "${item.msg}"`
      );

      const action = data.actions.find((a) => a.type === item.expectedAction);
      assert(
        Boolean(action),
        `Agent returned expected clientAction '${item.expectedAction}'`
      );

      if (item.expectedView) {
        assert(action?.view === item.expectedView, `Target view matches '${item.expectedView}'`);
      }
      if (item.expectedCurrency) {
        assert(action?.currency === item.expectedCurrency, `Currency matches '${item.expectedCurrency}'`);
      }
      if (item.verifyBooking && action?.booking) {
        assert(
          action.booking.flight.from === "JFK" && action.booking.flight.to === "LHR",
          "Agent correctly parsed route from JFK to LHR"
        );
        // Clean up created booking
        await fetch(`${API_BASE}/api/bookings/${action.booking.id}`, { method: "DELETE", headers: AUTH_HEADER });
      }
      if (item.verifyIndiGo && action?.booking) {
        assert(
          action.booking.flight.airline === "IndiGo" && action.booking.flight.from === "DEL" && action.booking.flight.to === "BOM",
          "Agent correctly booked IndiGo flight from DEL to BOM"
        );
        await fetch(`${API_BASE}/api/bookings/${action.booking.id}`, { method: "DELETE", headers: AUTH_HEADER });
      }
      if (item.verifySpiceJet && action?.booking) {
        assert(
          action.booking.flight.airline === "SpiceJet" && action.booking.flight.from === "DEL" && action.booking.flight.to === "BLR",
          "Agent correctly booked SpiceJet flight from DEL to BLR"
        );
        await fetch(`${API_BASE}/api/bookings/${action.booking.id}`, { method: "DELETE", headers: AUTH_HEADER });
      }
    }

  } catch (err) {
    console.error("Section 4 Crashed:", err);
    failed++;
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // 5. SERVERLESS FUNCTION DIRECT HANDLER PARITY
  // ─────────────────────────────────────────────────────────────────────────────
  console.log("\n[SECTION 5: Netlify Serverless Functions Parity Audit]");

  try {
    // 5.1 bookingsHandler POST with partial payload
    const sBookingPost = await bookingsHandler({
      httpMethod: "POST",
      headers: { authorization: "Bearer usr_commander_1" },
      body: JSON.stringify({ seat: "1A", flight: { code: "EK-201" } }),
    }, {});
    const sBookingData = JSON.parse(sBookingPost.body);
    assert(
      sBookingPost.statusCode === 201 && sBookingData.booking?.seat === "1A" && sBookingData.booking?.origin?.iata,
      "Netlify bookings.js: POST normalizes booking schema"
    );

    // 5.2 bookingsHandler DELETE with trailing slash in path
    const createdSId = sBookingData.booking.id;
    const sDeleteRes = await bookingsHandler({
      httpMethod: "DELETE",
      path: `/.netlify/functions/bookings/${createdSId}/`,
      headers: { authorization: "Bearer usr_commander_1" },
    }, {});
    assert(sDeleteRes.statusCode === 200, "Netlify bookings.js: DELETE handles trailing slashes");

    // 5.3 agentHandler full intent checks
    const sAgentRes = await agentHandler({
      httpMethod: "POST",
      headers: { authorization: "Bearer usr_commander_1" },
      body: JSON.stringify({ message: "Navigate to trip dashboard" }),
    }, {});
    const sAgentData = JSON.parse(sAgentRes.body);
    assert(
      sAgentRes.statusCode === 200 && sAgentData.actions?.some((a) => a.type === "SWITCH_VIEW" && a.view === "dashboard"),
      "Netlify agent.js: executes SWITCH_VIEW to dashboard"
    );

    // 5.4 airportsHandler fuzzy resolution
    const sAirportRes = await airportsHandler({
      httpMethod: "GET",
      queryStringParameters: { q: "dubai" },
    }, {});
    assert(
      sAirportRes.statusCode === 200 && JSON.parse(sAirportRes.body).results.some((a) => a.iata === "DXB"),
      "Netlify airports.js: resolves Dubai to DXB"
    );

  } catch (err) {
    console.error("Section 5 Crashed:", err);
    failed++;
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // 6. HIGH-CONCURRENCY STRESS TESTING (20 PARALLEL REQUESTS)
  // ─────────────────────────────────────────────────────────────────────────────
  console.log("\n[SECTION 6: Concurrency & Race Condition Verification]");

  try {
    const concurrentRequests = Array.from({ length: 20 }, (_, idx) => {
      if (idx % 3 === 0) return fetch(`${API_BASE}/api/traffic`);
      if (idx % 3 === 1) return fetch(`${API_BASE}/api/rates`);
      return fetch(`${API_BASE}/api/fares/matrix?origin=DEL&destination=LHR&currency=USD`);
    });

    const results = await Promise.all(concurrentRequests);
    const allSuccessful = results.every((r) => r.ok);
    assert(allSuccessful, "20 concurrent requests across traffic, rates, and fares all succeeded (HTTP 200)");

  } catch (err) {
    console.error("Section 6 Crashed:", err);
    failed++;
  }

  console.log("\n================================================================================");
  console.log(`  AUDIT SUMMARY: ${passed} PASSED, ${failed} FAILED`);
  console.log("================================================================================");

  if (failed > 0) {
    process.exit(1);
  }
}

runHardenedTests().catch((err) => {
  console.error("Hardened audit suite encountered a fatal error:", err);
  process.exit(1);
});
