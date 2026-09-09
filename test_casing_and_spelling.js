import { parseSpatialCommand, SPATIAL_COMMANDS } from "./src/services/spatialCommandEngine.js";
import { processCopilotPrompt } from "./src/services/aiCopilotService.js";
import { processAgentChat } from "./server/agentEngine.js";
import { getUser } from "./server/db.js";
import { searchAirports } from "./src/data/airports.js";

async function runCasingAndSpellingTests() {
  console.log("==========================================================");
  console.log("  CASING & SPELL CHECK VERIFICATION TEST SUITE (AI/COPILOT)");
  console.log("==========================================================");

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
  // TEST GROUP 1: CASING INVARIANCE (UPPER, LOWER, MIXED)
  // ----------------------------------------------------
  console.log("\n--- GROUP 1: Casing Invariance ---");

  const c1 = parseSpatialCommand("FOCUS ON TOKYO");
  assert("ALL CAPS: 'FOCUS ON TOKYO'", c1.action === SPATIAL_COMMANDS.FOCUS_LOCATION && c1.params.iata === "HND");

  const c2 = parseSpatialCommand("fLy fRoM jFk tO lHr");
  assert("mIxEd cAsE: 'fLy fRoM jFk tO lHr'", c2.action === SPATIAL_COMMANDS.DRAW_ROUTE && c2.params.origin?.iata === "JFK" && c2.params.dest?.iata === "LHR");

  const c3 = parseSpatialCommand("sWiTcH cUrReNcY tO eUr");
  assert("mIxEd cAsE: 'sWiTcH cUrReNcY tO eUr'", c3.action === SPATIAL_COMMANDS.CHANGE_CURRENCY && c3.params.currency === "EUR");

  const c4 = parseSpatialCommand("SHOW RADAR TELEMETRY");
  assert("ALL CAPS: 'SHOW RADAR TELEMETRY'", c4.action === SPATIAL_COMMANDS.SHOW_RADAR);

  const copilotCasing1 = await processCopilotPrompt("FLIGHT FROM NEW YORK TO LONDON");
  assert("Copilot ALL CAPS: 'FLIGHT FROM NEW YORK TO LONDON'", copilotCasing1.success && copilotCasing1.waypoints?.[0]?.iata === "JFK" && copilotCasing1.waypoints?.[1]?.iata === "LHR");

  const copilotCasing2 = await processCopilotPrompt("bOoK bUsInEsS cLaSs tO lOnDoN");
  assert("Copilot mIxEd cAsE: 'bOoK bUsInEsS cLaSs tO lOnDoN'", copilotCasing2.success && copilotCasing2.waypoints?.[1]?.iata === "LHR");

  const testUser = getUser("usr_commander_1");
  const agentCasing1 = await processAgentChat(testUser, "BOOK SEAT 1a ON EMIRATES");
  assert("Agent ALL CAPS + lowercase seat: 'BOOK SEAT 1a ON EMIRATES'", agentCasing1.actions?.[0]?.booking?.seat === "1A" && agentCasing1.actions[0].booking?.flight?.airline === "Emirates");

  const agentCasing2 = await processAgentChat(testUser, "sWiTcH cUrReNcY tO iNr");
  assert("Agent mIxEd cAsE: 'sWiTcH cUrReNcY tO iNr'", agentCasing2.actions?.[0]?.currency === "INR");

  // ----------------------------------------------------
  // TEST GROUP 2: CITY SPELL CHECK & FUZZY TYPO TOLERANCE
  // ----------------------------------------------------
  console.log("\n--- GROUP 2: City Typo Spell Check ---");

  const typo1 = searchAirports("tokio");
  assert("Typo: 'tokio' -> Tokyo (HND)", typo1.length > 0 && typo1[0].city === "Tokyo");

  const typo2 = searchAirports("londn");
  assert("Typo: 'londn' -> London (LHR)", typo2.length > 0 && typo2[0].city === "London");

  const typo3 = searchAirports("singapor");
  assert("Typo: 'singapor' -> Singapore (SIN)", typo3.length > 0 && typo3[0].city === "Singapore");

  const typo4 = searchAirports("dubayy");
  assert("Typo: 'dubayy' -> Dubai (DXB)", typo4.length > 0 && typo4[0].city === "Dubai");

  const typo5 = searchAirports("mumbay");
  assert("Typo: 'mumbay' -> Mumbai (BOM)", typo5.length > 0 && typo5[0].city === "Mumbai");

  const typo6 = searchAirports("sidney");
  assert("Typo: 'sidney' -> Sydney (SYD)", typo6.length > 0 && typo6[0].city === "Sydney");

  const typo7 = searchAirports("pariss");
  assert("Typo: 'pariss' -> Paris (CDG)", typo7.length > 0 && typo7[0].city === "Paris");

  const typo8 = searchAirports("newyork");
  assert("Typo: 'newyork' -> New York (JFK)", typo8.length > 0 && typo8[0].city === "New York");

  const typo9 = searchAirports("frankfort");
  assert("Typo: 'frankfort' -> Frankfurt (FRA)", typo9.length > 0 && typo9[0].city === "Frankfurt");

  const typo10 = searchAirports("amsterdm");
  assert("Typo: 'amsterdm' -> Amsterdam (AMS)", typo10.length > 0 && typo10[0].city === "Amsterdam");

  // ----------------------------------------------------
  // TEST GROUP 3: COPILOT NLP WITH TYPOS
  // ----------------------------------------------------
  console.log("\n--- GROUP 3: Copilot NLP with City Typos ---");

  const copilotTypo1 = await processCopilotPrompt("Fly from Tokio to Londn");
  assert("Copilot NLP: 'Fly from Tokio to Londn' (HND -> LHR)", copilotTypo1.success && copilotTypo1.waypoints?.[0]?.iata === "HND" && copilotTypo1.waypoints?.[1]?.iata === "LHR");

  const copilotTypo2 = await processCopilotPrompt("Trip from Pariss to Dubayy");
  assert("Copilot NLP: 'Trip from Pariss to Dubayy' (CDG -> DXB)", copilotTypo2.success && copilotTypo2.waypoints?.[0]?.iata === "CDG" && copilotTypo2.waypoints?.[1]?.iata === "DXB");

  const copilotTypo3 = await processCopilotPrompt("Travel to Singapor");
  assert("Copilot NLP: 'Travel to Singapor' (resolves SIN)", copilotTypo3.success && copilotTypo3.waypoints?.[1]?.iata === "SIN");

  const copilotTypo4 = await processCopilotPrompt("Flght from Mumbay to Sidney");
  assert("Copilot NLP: 'Flght from Mumbay to Sidney' (BOM -> SYD)", copilotTypo4.success && copilotTypo4.waypoints?.[0]?.iata === "BOM" && copilotTypo4.waypoints?.[1]?.iata === "SYD");

  // ----------------------------------------------------
  // TEST GROUP 4: AGENT COMMAND SPELL CHECK
  // ----------------------------------------------------
  console.log("\n--- GROUP 4: Agent Command Typo Tolerance ---");

  const agentTypo1 = await processAgentChat(testUser, "bok seat 3A on Emirates");
  assert("Agent Typo: 'bok seat 3A' -> book_flight", agentTypo1.actions?.[0]?.type === "BOOKING_CREATED" && agentTypo1.actions[0].booking?.seat === "3A");

  const agentTypo2 = await processAgentChat(testUser, "cancle my reservation");
  assert("Agent Typo: 'cancle my reservation' -> cancel_booking", typeof agentTypo2.text === "string" && (agentTypo2.actions?.[0]?.type === "BOOKING_CANCELLED" || agentTypo2.text.includes("cancelled") || agentTypo2.text.includes("Cancelled") || agentTypo2.text.includes("Notice")));

  const agentTypo3 = await processAgentChat(testUser, "switch currensy to eruo");
  assert("Agent Typo: 'switch currensy to eruo' -> EUR", agentTypo3.actions?.[0]?.type === "SET_CURRENCY" && agentTypo3.actions[0].currency === "EUR");

  const agentTypo4 = await processAgentChat(testUser, "change currensy to doller");
  assert("Agent Typo: 'change currensy to doller' -> USD", agentTypo4.actions?.[0]?.type === "SET_CURRENCY" && agentTypo4.actions[0].currency === "USD");

  const agentTypo5 = await processAgentChat(testUser, "show radr telmetry");
  assert("Agent Typo: 'show radr telmetry' -> Live Radar HUD", agentTypo5.actions?.[0]?.type === "SWITCH_VIEW" && agentTypo5.actions[0].view === "tracker");

  const agentTypo6 = await processAgentChat(testUser, "show my pasess");
  assert("Agent Typo: 'show my pasess' -> Trips view", agentTypo6.actions?.[0]?.type === "SWITCH_VIEW" && agentTypo6.actions[0].view === "trips");

  // ----------------------------------------------------
  // TEST GROUP 5: SPATIAL COMMAND SPELL CHECK
  // ----------------------------------------------------
  console.log("\n--- GROUP 5: Spatial Command Typo Tolerance ---");

  const spTypo1 = parseSpatialCommand("switch currensy to eruo");
  assert("Spatial Typo: 'switch currensy to eruo' -> EUR", spTypo1.action === SPATIAL_COMMANDS.CHANGE_CURRENCY && spTypo1.params.currency === "EUR");

  const spTypo2 = parseSpatialCommand("show weater overlay");
  assert("Spatial Typo: 'show weater overlay' -> weather_overlay", spTypo2.action === SPATIAL_COMMANDS.FILTER_HEATMAP && spTypo2.params.layer === "weather_overlay");

  const spTypo3 = parseSpatialCommand("open dashbord metrics");
  assert("Spatial Typo: 'open dashbord metrics' -> SHOW_DASHBOARD", spTypo3.action === SPATIAL_COMMANDS.SHOW_DASHBOARD);

  const spTypo4 = parseSpatialCommand("fly from tokio to londn");
  assert("Spatial Typo: 'fly from tokio to londn' -> DRAW_ROUTE HND to LHR", spTypo4.action === SPATIAL_COMMANDS.DRAW_ROUTE && spTypo4.params.origin?.iata === "HND" && spTypo4.params.dest?.iata === "LHR");

  console.log("\n==========================================================");
  console.log(`FINAL RESULTS: ${passed} passed, ${failed} failed`);
  console.log("==========================================================");

  if (failed > 0) {
    process.exit(1);
  }
}

runCasingAndSpellingTests().catch((e) => {
  console.error("Test Suite crashed:", e);
  process.exit(1);
});
