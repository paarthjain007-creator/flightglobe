/**
 * Unified 1-Command Launcher for FlightGlobe.
 * Launches both the Express ADS-B Proxy Server and Vite Frontend concurrently in one terminal.
 */

import { spawn } from "child_process";

console.log("\n🚀 Starting FlightGlobe Unified Full-Stack Environment...\n");

// 1. Launch Express ADS-B Proxy Server (Port 3001)
const serverProcess = spawn(process.execPath, ["server/index.js"], {
  stdio: "inherit",
});

// 2. Launch Vite Dev Server (Port 5173)
const viteProcess = process.platform === "win32"
  ? spawn("cmd.exe", ["/c", "npx", "vite"], { stdio: "inherit" })
  : spawn("npx", ["vite"], { stdio: "inherit" });

function handleExit(code) {
  serverProcess.kill();
  viteProcess.kill();
  process.exit(code);
}

process.on("SIGINT", () => handleExit(0));
process.on("SIGTERM", () => handleExit(0));
serverProcess.on("exit", (code) => { if (code !== 0) handleExit(code); });
viteProcess.on("exit", (code) => { if (code !== 0) handleExit(code); });
