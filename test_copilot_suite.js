import { parseSpatialCommand, SPATIAL_COMMANDS, humaniseCommand } from "./src/services/spatialCommandEngine.js";
import { processCopilotPrompt } from "./src/services/aiCopilotService.js";
import { processAgentChat, executeAgentTool } from "./server/agentEngine.js";
import { getUser, createBooking, getUserBookings, cancelBooking } from "./server/db.js";
import { predictRouteAnomalies } from "./src/services/anomalyPredictor.js";
import { AIRPORTS } from "./src/data/airports.js";

async function runTests() {
  console.log("=================================================");
  console.log("  FLIGHTGLOBE EXPANDED AI & COPILOT TEST SUITE   ");
  console.log("=================================================");
  let passed = 0;
  let failed = 0;

  function assert(name, condition, details = "") {
    if (condition) {
      console.log(`✅ PASS: ${name}`);
      passed++;
    } else {
      console.error(`❌ FAIL: ${name} ${details ? "- " + details : ""}`);
      failed++;
    }
  }

  // ----------------------------------------------------
  // SECTION 1: SPATIAL COMMAND ENGINE TESTS
  // ----------------------------------------------------
  console.log("\n--- SECTION 1: Spatial Command Engine ---");

  const cmd1 = parseSpatialCommand("focus on Tokyo");
  assert("Focus on city (Tokyo -> HND)", cmd1.action === SPATIAL_COMMANDS.FOCUS_LOCATION && cmd1.params.iata === "HND");

  const cmd2 = parseSpatialCommand("fly from JFK to LHR");
  assert("Draw route between IATAs (JFK -> LHR)", cmd2.action === SPATIAL_COMMANDS.DRAW_ROUTE && cmd2.params.origin?.iata === "JFK" && cmd2.params.dest?.iata === "LHR");

  const cmd3 = parseSpatialCommand("show weather overlay");
  assert("Filter heatmap layer (weather_overlay)", cmd3.action === SPATIAL_COMMANDS.FILTER_HEATMAP && cmd3.params.layer === "weather_overlay");

  const cmd4 = parseSpatialCommand("launch AR mode");
  assert("Trigger AR mode (webxr)", cmd4.action === SPATIAL_COMMANDS.TRIGGER_AR_MODE);

  const cmd5 = parseSpatialCommand("change theme to synthwave");
  assert("Change theme (synthwave)", cmd5.action === SPATIAL_COMMANDS.CHANGE_THEME && cmd5.params.theme === "synthwave");

  const cmd6 = parseSpatialCommand("switch currency to EUR");
  assert("Change currency (EUR)", cmd6.action === SPATIAL_COMMANDS.CHANGE_CURRENCY && cmd6.params.currency === "EUR");

  const cmd7 = parseSpatialCommand("show radar telemetry");
  assert("Show radar (radar telemetry)", cmd7.action === SPATIAL_COMMANDS.SHOW_RADAR);

  const cmd8 = parseSpatialCommand("show density traffic");
  assert("Filter traffic density layer", cmd8.action === SPATIAL_COMMANDS.FILTER_HEATMAP && cmd8.params.layer === "density");

  const cmd9 = parseSpatialCommand("initialize globe");
  assert("Initialize globe view", cmd9.action === SPATIAL_COMMANDS.INITIALIZE_GLOBE && cmd9.params.zoom === 2.5);

  const cmdCockpit = parseSpatialCommand("switch to cockpit view");
  assert("Trigger Cockpit view (cockpit hud)", cmdCockpit.action === SPATIAL_COMMANDS.TRIGGER_COCKPIT_VIEW && cmdCockpit.params.enabled === true);

  const cmdJetstream = parseSpatialCommand("show jetstream wind vectors");
  assert("Toggle Jetstream winds (winds layer)", cmdJetstream.action === SPATIAL_COMMANDS.TOGGLE_JETSTREAM && cmdJetstream.params.enabled === true);

  const humanDesc = humaniseCommand(cmd2);
  assert("Humanise route command", humanDesc.includes("JFK") && humanDesc.includes("LHR"));

  // ----------------------------------------------------
  // SECTION 2: AI COPILOT SERVICE (FRONTEND) TESTS
  // ----------------------------------------------------
  console.log("\n--- SECTION 2: AI Copilot Service ---");

  const res1 = await processCopilotPrompt("Plan Japan Cultural & Eco Tour");
  assert("Preset: Japan Eco Tour", res1.success && res1.waypoints?.length >= 2 && res1.title.includes("Pacific Rim"));

  const res2 = await processCopilotPrompt("European Culinary Capital Route");
  assert("Preset: European Culinary Route", res2.success && res2.waypoints?.length >= 3 && res2.title.includes("Gastronomy"));

  const res3 = await processCopilotPrompt("Transatlantic Innovation Loop");
  assert("Preset: Transatlantic Loop", res3.success && res3.waypoints?.length >= 3);

  const res4 = await processCopilotPrompt("Book Business Class to London");
  assert("Intent: Business Class to London", res4.success && res4.waypoints?.[0]?.iata === "JFK" && res4.waypoints?.[1]?.iata === "LHR");

  const res5 = await processCopilotPrompt("Find lowest carbon routes to Tokyo");
  assert("Intent: Eco routes to Tokyo", res5.success && res5.waypoints?.[1]?.iata === "HND");

  const res6 = await processCopilotPrompt("Flight from Paris to Dubai");
  assert("NLP: from Paris to Dubai", res6.success && res6.waypoints?.length === 2 && res6.waypoints[0]?.iata === "CDG" && res6.waypoints[1]?.iata === "DXB");

  const res7 = await processCopilotPrompt("Plan a trip to Singapore");
  assert("NLP: to Singapore (resolves SIN)", res7.success && res7.waypoints?.length === 2 && res7.waypoints[1]?.iata === "SIN");

  const res8 = await processCopilotPrompt("Direct flight from Mumbai to London");
  assert("NLP: Mumbai to London (BOM -> LHR)", res8.success && res8.waypoints?.[0]?.iata === "BOM" && res8.waypoints?.[1]?.iata === "LHR");

  const res9 = await processCopilotPrompt("Fly from Sydney to Los Angeles");
  assert("NLP: Sydney to Los Angeles (SYD -> LAX)", res9.success && res9.waypoints?.[0]?.iata === "SYD" && res9.waypoints?.[1]?.iata === "LAX");

  const res10 = await processCopilotPrompt("Arbitrary open question about flying");
  assert("NLP fallback: arbitrary query returns valid flight corridor", res10.success && res10.waypoints?.length >= 2 && Boolean(res10.title));

  // ----------------------------------------------------
  // SECTION 3: SERVER AGENT ENGINE TESTS
  // ----------------------------------------------------
  console.log("\n--- SECTION 3: Server Agent Engine ---");
  const testUser = getUser("usr_commander_1");

  const agent1 = await processAgentChat(testUser, "Book seat 1A on Emirates");
  assert("Agent: Book seat 1A on Emirates", agent1.actions?.[0]?.type === "BOOKING_CREATED" && agent1.actions[0].booking?.seat === "1A" && agent1.actions[0].booking?.flight?.airline === "Emirates");

  const agent2 = await processAgentChat(testUser, "Book seat 14B from JFK to LHR on British Airways");
  assert("Agent: Book JFK -> LHR seat 14B", agent2.actions?.[0]?.type === "BOOKING_CREATED" && agent2.actions[0].booking?.seat === "14B" && agent2.actions[0].booking?.flight?.from === "JFK" && agent2.actions[0].booking?.flight?.to === "LHR");

  const agent3 = await processAgentChat(testUser, "Switch currency to EUR");
  assert("Agent: Switch currency to EUR", agent3.actions?.[0]?.type === "SET_CURRENCY" && agent3.actions[0].currency === "EUR");

  const agent4 = await processAgentChat(testUser, "Change currency to rupee");
  assert("Agent: Change currency to INR via 'rupee'", agent4.actions?.[0]?.type === "SET_CURRENCY" && agent4.actions[0].currency === "INR");

  const agent5 = await processAgentChat(testUser, "Show my passes");
  assert("Agent: Show passes navigation", agent5.actions?.[0]?.type === "SWITCH_VIEW" && agent5.actions[0].view === "trips");

  const agent6 = await processAgentChat(testUser, "Check live radar telemetry from JFK to LHR");
  assert("Agent: Radar telemetry for route", agent6.actions?.[0]?.type === "SWITCH_VIEW" && agent6.actions[0].view === "tracker");

  const agent7 = await processAgentChat(testUser, "Find cheap flights from DEL to LHR");
  assert("Agent: Search flights GDS", agent7.actions?.[0]?.type === "SET_ROUTE" && agent7.actions[0].origin === "DEL" && agent7.actions[0].destination === "LHR");

  const agent8 = await processAgentChat(testUser, "Cancel my reservation");
  assert("Agent: Cancel reservation safely", typeof agent8.text === "string" && (agent8.actions?.[0]?.type === "BOOKING_CANCELLED" || agent8.text.includes("cancelled") || agent8.text.includes("Cancelled")));

  // ----------------------------------------------------
  // SECTION 4: ANOMALY PREDICTOR AI ENGINE TESTS
  // ----------------------------------------------------
  console.log("\n--- SECTION 4: Atmospheric Anomaly Predictor ---");
  const jfk = AIRPORTS.find((a) => a.iata === "JFK");
  const lhr = AIRPORTS.find((a) => a.iata === "LHR");
  const sin = AIRPORTS.find((a) => a.iata === "SIN");
  const dxb = AIRPORTS.find((a) => a.iata === "DXB");

  const anom1 = predictRouteAnomalies(jfk, lhr);
  assert("High-latitude Transatlantic turbulence analysis", anom1.anomalies.length > 0 && anom1.warningRings.length > 0);

  const anom2 = predictRouteAnomalies(sin, dxb);
  assert("Equatorial convective storm analysis", anom2.anomalies.length > 0 && anom2.warningRings.length > 0);

  const anomEmpty = predictRouteAnomalies(null, null);
  assert("Empty endpoints route anomaly guard", anomEmpty.anomalies.length === 0 && anomEmpty.severityScore === "LOW");

  console.log("\n=================================================");
  console.log(`FINAL RESULTS: ${passed} passed, ${failed} failed`);
  console.log("=================================================");

  if (failed > 0) {
    process.exit(1);
  }
}

runTests().catch((e) => {
  console.error("Test Suite crashed:", e);
  process.exit(1);
});
