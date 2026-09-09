import fs from "fs";
import path from "path";

const SRC_DIR = path.resolve("./src");
const SERVER_DIR = path.resolve("./server");

// Stale tokens that were removed during AERO.SPATIAL overhaul
const STALE_CSS_VARS = [
  "var(--accent)",
  "var(--accent-glow)",
  "var(--bg-primary)",
  "var(--glass-border)",
  "var(--accent-v)",
  "var(--accent-c)"
];

// Empty or broken CSS classes
const BROKEN_CLASSES = [
  "btn-primary",
  "btn-secondary",
  "glass-input"
];

function getAllFiles(dir, exts = [".js", ".jsx", ".css"]) {
  let results = [];
  const list = fs.readdirSync(dir);
  for (const file of list) {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    if (stat.isDirectory()) {
      if (file !== "node_modules" && file !== "dist" && file !== ".git") {
        results = results.concat(getAllFiles(filePath, exts));
      }
    } else {
      if (exts.some((ext) => file.endsWith(ext))) {
        results.push(filePath);
      }
    }
  }
  return results;
}

async function deepScan() {
  console.log("=================================================");
  console.log("     FLIGHTGLOBE DEEP SCAN AUDIT (STATIC)        ");
  console.log("=================================================");

  const srcFiles = getAllFiles(SRC_DIR, [".jsx", ".js"]);
  const cssFiles = getAllFiles(SRC_DIR, [".css"]);
  let issuesCount = 0;

  // 1. Scan for Stale CSS Variables in JSX/CSS
  console.log("\n[SCAN 1] Checking for stale CSS variables...");
  for (const file of [...srcFiles, ...cssFiles]) {
    const content = fs.readFileSync(file, "utf8");
    const relPath = path.relative(".", file);
    for (const staleVar of STALE_CSS_VARS) {
      if (content.includes(staleVar)) {
        console.warn(`⚠️ [STALE VAR] ${relPath} contains '${staleVar}'`);
        issuesCount++;
      }
    }
  }

  // 2. Scan for Deprecated / Empty Button Classes in JSX
  console.log("\n[SCAN 2] Checking for deprecated / empty classes (btn-primary, glass-input)...");
  for (const file of srcFiles) {
    if (!file.endsWith(".jsx")) continue;
    const content = fs.readFileSync(file, "utf8");
    const relPath = path.relative(".", file);
    for (const brokenClass of BROKEN_CLASSES) {
      const regex = new RegExp(`\\b${brokenClass}\\b`);
      if (regex.test(content)) {
        console.warn(`⚠️ [EMPTY CLASS] ${relPath} uses '${brokenClass}'`);
        issuesCount++;
      }
    }
  }

  // 3. Scan for Broken Relative Imports in src/
  console.log("\n[SCAN 3] Checking for unresolvable relative imports in src/...");
  const importRegex = /from\s+["'](\.[^"']+)["']/g;
  for (const file of srcFiles) {
    const content = fs.readFileSync(file, "utf8");
    const relPath = path.relative(".", file);
    const dir = path.dirname(file);

    let match;
    while ((match = importRegex.exec(content)) !== null) {
      const impPath = match[1];
      let resolved = false;

      // Check exact, .js, .jsx, /index.js, /index.jsx
      const candidates = [
        path.resolve(dir, impPath),
        path.resolve(dir, impPath + ".js"),
        path.resolve(dir, impPath + ".jsx"),
        path.resolve(dir, impPath + ".ts"),
        path.resolve(dir, impPath + ".tsx"),
        path.resolve(dir, impPath, "index.js"),
        path.resolve(dir, impPath, "index.jsx")
      ];

      for (const cand of candidates) {
        if (fs.existsSync(cand) && fs.statSync(cand).isFile()) {
          resolved = true;
          break;
        }
      }

      if (!resolved) {
        console.error(`❌ [BROKEN IMPORT] ${relPath} -> '${impPath}' does not exist!`);
        issuesCount++;
      }
    }
  }

  // 4. Scan for Key collisions or dangerous patterns
  console.log("\n[SCAN 4] Checking for dangerous code patterns...");
  for (const file of srcFiles) {
    const content = fs.readFileSync(file, "utf8");
    const relPath = path.relative(".", file);

    // Look for duplicate key expressions like key={i} or key={index} on components that mutate
    if (content.includes("key={index}") && (file.includes("itinerary") || file.includes("booking"))) {
      console.warn(`⚠️ [FRAGILE KEY] ${relPath} uses key={index} on dynamic list`);
    }

    // Look for unhandled fetch calls without catch
    if (content.includes("fetch(") && !content.includes(".catch") && !content.includes("try {")) {
      console.warn(`⚠️ [UNCAUGHT FETCH] ${relPath} has fetch() without apparent try/catch`);
    }
  }

  console.log("\n=================================================");
  console.log(`SCAN COMPLETE: Found ${issuesCount} issues requiring attention.`);
  console.log("=================================================");

  if (issuesCount > 0) {
    process.exit(1);
  }
}

deepScan().catch((e) => {
  console.error("Deep scan failed:", e);
  process.exit(1);
});
