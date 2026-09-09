async function runLiveEndpointTests() {
  console.log("=================================================");
  console.log("    FLIGHTGLOBE LIVE ENDPOINT DEEP SCAN AUDIT    ");
  console.log("=================================================");

  let passed = 0;
  let failed = 0;

  async function testEndpoint(name, url, options = {}, validator) {
    const start = Date.now();
    try {
      const res = await fetch(url, options);
      const elapsed = Date.now() - start;
      if (!res.ok && !options.expectedStatus) {
        console.error(`❌ FAIL: ${name} (${url}) -> HTTP ${res.status} in ${elapsed}ms`);
        failed++;
        return;
      }
      if (options.expectedStatus && res.status !== options.expectedStatus) {
        console.error(`❌ FAIL: ${name} -> Expected HTTP ${options.expectedStatus}, got ${res.status}`);
        failed++;
        return;
      }

      let data;
      const contentType = res.headers.get("content-type") || "";
      if (contentType.includes("application/json")) {
        data = await res.json();
      } else {
        data = await res.text();
      }

      if (validator && !validator(data, res)) {
        console.error(`❌ FAIL: ${name} -> Validator failed for response`);
        failed++;
        return;
      }

      console.log(`✅ PASS: ${name} (HTTP ${res.status}, ${elapsed}ms)`);
      passed++;
    } catch (err) {
      console.error(`❌ CRASH: ${name} (${url}) -> ${err.message}`);
      failed++;
    }
  }

  // 1. Backend REST API Endpoints
  console.log("\n--- SECTION 1: Backend Express API ---");
  await testEndpoint(
    "GET /api/traffic (ADS-B Telemetry)",
    "http://localhost:3001/api/traffic",
    {},
    (data) => Array.isArray(data.planes) && data.planes.length > 0
  );

  await testEndpoint(
    "GET /api/rates (Forex Matrix)",
    "http://localhost:3001/api/rates",
    {},
    (data) => data.status === "ok" && typeof data.rates?.USD === "number" && typeof data.rates?.EUR === "number"
  );

  await testEndpoint(
    "GET /api/fares/matrix (7-Day GDS Matrix)",
    "http://localhost:3001/api/fares/matrix?origin=JFK&destination=LHR&currency=USD",
    {},
    (data) => Array.isArray(data.matrix) && data.matrix.length === 7 && typeof data.matrix[0].price === "number"
  );

  await testEndpoint(
    "GET /api/airports/search?q=delhi (Global Airport Resolver)",
    "http://localhost:3001/api/airports/search?q=delhi",
    {},
    (data) => Array.isArray(data.results) && data.results.length > 0 && data.results[0].iata === "DEL"
  );

  await testEndpoint(
    "GET /api/user/me (User Profile & Session)",
    "http://localhost:3001/api/user/me",
    { headers: { Authorization: "Bearer usr_commander_1" } },
    (data) => data.status === "ok" && data.user?.id === "usr_commander_1"
  );

  await testEndpoint(
    "GET /api/bookings (User Active Bookings)",
    "http://localhost:3001/api/bookings",
    { headers: { Authorization: "Bearer usr_commander_1" } },
    (data) => data.status === "ok" && Array.isArray(data.bookings)
  );

  await testEndpoint(
    "POST /api/agent/chat (Autonomous Copilot Action Engine)",
    "http://localhost:3001/api/agent/chat",
    {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: "Bearer usr_commander_1" },
      body: JSON.stringify({ message: "Switch currency to EUR" }),
    },
    (data) => data.status === "ok" && Array.isArray(data.actions) && data.actions[0]?.currency === "EUR"
  );

  // 2. Frontend Client Pages
  console.log("\n--- SECTION 2: Frontend Client HTML/Bundle Delivery ---");
  const clientPages = [
    { name: "Page: /explore (3D Globe)", path: "/explore" },
    { name: "Page: /radar (Live Radar HUD)", path: "/radar" },
    { name: "Page: /booking (GDS Search Engine)", path: "/booking" },
    { name: "Page: /dashboard (Bento Analytics)", path: "/dashboard" },
    { name: "Page: /copilot (Nimbus AI Console)", path: "/copilot" },
    { name: "Page: /passport (Boarding Passes & Stamps)", path: "/passport" },
  ];

  for (const page of clientPages) {
    await testEndpoint(
      page.name,
      `http://localhost:5173${page.path}`,
      {},
      (html) => typeof html === "string" && html.includes("<div id=\"root\">") && html.includes("/src/main.jsx")
    );
  }

  console.log("\n=================================================");
  console.log(`LIVE AUDIT RESULTS: ${passed} passed, ${failed} failed`);
  console.log("=================================================");

  if (failed > 0) {
    process.exit(1);
  }
}

runLiveEndpointTests().catch((e) => {
  console.error("Live test suite crashed:", e);
  process.exit(1);
});
