#!/usr/bin/env node

import fs from "fs/promises";
import path from "path";
import { parseEnv, scanUsedVars, analyzeEnv } from "../src/index.js";

async function run() {
  const rootDir = process.cwd();
  const envPath = path.join(rootDir, ".env");

  try {
    // 1. Read and parse .env
    let envContent = "";
    try {
      envContent = await fs.readFile(envPath, "utf8");
    } catch (err) {
      // Fallback to empty if no .env found
    }
    const envVars = parseEnv(envContent);

    // 2. Scan codebase
    const usedVars = await scanUsedVars(rootDir);

    // 3. Analyze
    const { unused, missing } = analyzeEnv(envVars, usedVars);

    // 4. Output Report
    console.log("\n[envguard] Environment Variable Report:");

    if (unused.length === 0 && missing.length === 0) {
      console.log("\n  ✓ All environment variables are in sync\n");
      return;
    }

    if (unused.length > 0) {
      console.log("\nUnused variables (.env but not used):");
      unused.forEach((v) => console.log(`  - ${v}`));
    }

    if (missing.length > 0) {
      console.log("\nMissing variables (used in code but not in .env):");
      missing.forEach((v) => console.log(`  - ${v}`));
    }

    console.log("");
  } catch (error) {
    console.error("\n[envguard] Error during scan:", error.message);
    process.exit(1);
  }
}

run();
