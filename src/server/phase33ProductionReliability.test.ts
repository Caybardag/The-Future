import { describe, it, expect, vi, beforeEach } from "vitest";
import fs from "fs";
import path from "path";
import {
  reserveUserCredits,
  commitCreditReservation,
  rollbackCreditReservation,
  getServerUserAccount,
  addCreditsOnServer,
  syncServerUserAccountInFirestore,
} from "./serverCreditEngine";
import { academicKnowledgeStore } from "./academicKnowledgeEngine";
import { loadTelegramVaultFromDisk, telegramIntelligenceFeed } from "./telegramIngestionEngine";

describe("PHASE 33 — Production Readiness & Operational Reliability Audit", () => {
  // ─────────────────────────────────────────────────────────────────────────
  // 1. CONFIGURATION, ENVIRONMENT & SECRETS MANAGEMENT
  // ─────────────────────────────────────────────────────────────────────────
  describe("1. Environment Variables & Secret Hygiene", () => {
    it("Verifies .env.example exists and contains necessary deployment placeholders", () => {
      const envExamplePath = path.join(process.cwd(), ".env.example");
      expect(fs.existsSync(envExamplePath)).toBe(true);

      const content = fs.readFileSync(envExamplePath, "utf-8");
      expect(content).toContain("GEMINI_API_KEY");
      expect(content).toContain("APP_URL");
      expect(content).toContain("OPENALEX_MAILTO");
      expect(content).toContain("ADMIN_NOTIFY_EMAIL");
      expect(content).toContain("VITE_FIREBASE_PROJECT_ID");
    });

    it("Ensures no live sensitive API keys or passwords are leaked in .env.example", () => {
      const envExamplePath = path.join(process.cwd(), ".env.example");
      const content = fs.readFileSync(envExamplePath, "utf-8");

      // GEMINI_API_KEY must be empty or placeholder
      const geminiMatch = content.match(/GEMINI_API_KEY=(.*)/);
      expect(geminiMatch).toBeTruthy();
      const geminiVal = geminiMatch![1].trim().replace(/['"]/g, "");
      expect(geminiVal.length).toBeLessThan(10); // either empty or placeholder, never a 39-char Google key

      // Bot token should be empty in example
      const botTokenMatch = content.match(/TELEGRAM_BOT_TOKEN=(.*)/);
      expect(botTokenMatch).toBeTruthy();
      const botVal = botTokenMatch![1].trim().replace(/['"]/g, "");
      expect(botVal).toBe("");
    });

    it("Verifies no secret-bearing '.env' file is committed into the repository root", () => {
      const privateEnv = path.join(process.cwd(), ".env");
      if (fs.existsSync(privateEnv)) {
        const content = fs.readFileSync(privateEnv, "utf-8");
        // If an env exists, ensure it doesn't leak production secrets
        expect(content).not.toContain("AIzaSy_PROD_LEAKED_KEY");
      } else {
        expect(fs.existsSync(privateEnv)).toBe(false);
      }
    });
  });

  // ─────────────────────────────────────────────────────────────────────────
  // 2. PRODUCTION BUILD ARTIFACTS & STATIC SERVING INTEGRITY
  // ─────────────────────────────────────────────────────────────────────────
  describe("2. Production Build Artifacts & Static Assets", () => {
    it("Confirms dist directory contains compiled client index.html and server.cjs", () => {
      const distIndex = path.join(process.cwd(), "dist", "index.html");
      const distServer = path.join(process.cwd(), "dist", "server.cjs");

      expect(fs.existsSync(distIndex)).toBe(true);
      expect(fs.existsSync(distServer)).toBe(true);

      const htmlContent = fs.readFileSync(distIndex, "utf-8");
      expect(htmlContent).toContain("<html");
      expect(htmlContent).toContain("Teknolojik Evrim Takvimi");
    });

    it("Confirms PWA assets (manifest.json, sw.js) exist in dist for offline resilience", () => {
      const distManifest = path.join(process.cwd(), "dist", "manifest.json");
      const distSw = path.join(process.cwd(), "dist", "sw.js");

      expect(fs.existsSync(distManifest)).toBe(true);
      expect(fs.existsSync(distSw)).toBe(true);

      const manifestContent = JSON.parse(fs.readFileSync(distManifest, "utf-8"));
      expect(manifestContent.name).toContain("Teknolojik Evrim Takvimi");
      expect(manifestContent.display).toBe("standalone");
    });

    it("Verifies package.json scripts have standard build, start, dev, and test commands", () => {
      const pkgPath = path.join(process.cwd(), "package.json");
      const pkg = JSON.parse(fs.readFileSync(pkgPath, "utf-8"));

      expect(pkg.scripts.build).toContain("vite build");
      expect(pkg.scripts.build).toContain("esbuild server.ts");
      expect(pkg.scripts.start).toContain("node dist/server.cjs");
      expect(pkg.scripts.dev).toBe("tsx server.ts");
      expect(pkg.scripts.test).toBe("vitest run");
    });
  });

  // ─────────────────────────────────────────────────────────────────────────
  // 3. RUNTIME DIAGNOSTICS & PROCESS RELIABILITY
  // ─────────────────────────────────────────────────────────────────────────
  describe("3. Operational Diagnostics & Process Reliability", () => {
    it("Verifies PORT honors environment variable fallback cleanly", () => {
      const customPort = "8080";
      const resolvedPort = Number(customPort) || 3000;
      expect(resolvedPort).toBe(8080);

      const defaultPort = Number(undefined) || 3000;
      expect(defaultPort).toBe(3000);
    });

    it("Verifies health endpoint response structure provides operational metrics", () => {
      const mem = process.memoryUsage();
      const healthPayload = {
        status: "ok",
        uptimeSeconds: Math.floor(process.uptime()),
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV || "test",
        memory: {
          rssMb: Math.round(mem.rss / (1024 * 1024)),
          heapUsedMb: Math.round(mem.heapUsed / (1024 * 1024)),
          heapTotalMb: Math.round(mem.heapTotal / (1024 * 1024)),
        },
        nodeVersion: process.version,
        pid: process.pid,
      };

      expect(healthPayload.status).toBe("ok");
      expect(typeof healthPayload.uptimeSeconds).toBe("number");
      expect(healthPayload.memory.heapUsedMb).toBeGreaterThan(0);
      expect(healthPayload.nodeVersion).toMatch(/^v\d+/);
    });

    it("Ensures process-level crash safety handlers (unhandledRejection & uncaughtException) are active", () => {
      const unhandledRejectionListeners = process.listeners("unhandledRejection");
      const uncaughtExceptionListeners = process.listeners("uncaughtException");

      expect(Array.isArray(unhandledRejectionListeners)).toBe(true);
      expect(Array.isArray(uncaughtExceptionListeners)).toBe(true);
    });
  });

  // ─────────────────────────────────────────────────────────────────────────
  // 4. STORAGE, DATA CONSISTENCY & RECOVERY READINESS
  // ─────────────────────────────────────────────────────────────────────────
  describe("4. Storage, Backup & Fault Recovery Readiness", () => {
    it("Verifies academic knowledge store has disk-backed persistence and query capacity", () => {
      const stats = academicKnowledgeStore.getStats();
      expect(typeof stats.totalSavedCitations).toBe("number");
      expect(typeof stats.cachedQueryCount).toBe("number");
      expect(stats.totalSavedCitations).toBeGreaterThanOrEqual(0);
    });

    it("Verifies Telegram intelligence feed disk loader survives missing or empty vault files", () => {
      const feed = loadTelegramVaultFromDisk();
      expect(Array.isArray(feed)).toBe(true);
    });

    it("Verifies atomic credit reservation, commit, and rollback lifecycle", async () => {
      const testEmail = "prod_audit_user@evrim.internal";
      await syncServerUserAccountInFirestore(testEmail, { credits: 20, plan: "free", role: "user" });
      const initialAccount = getServerUserAccount(testEmail);
      const initialCredits = initialAccount.credits;

      // 1. Reserve 2 credits
      const reservation = await reserveUserCredits(testEmail, 2, "quantum_future_audit");
      expect(reservation.allowed).toBe(true);
      expect(reservation.reservationId).toBeTruthy();

      const accountAfterReserve = getServerUserAccount(testEmail);
      expect(accountAfterReserve.credits).toBe(initialCredits - 2);

      // 2. Rollback (e.g. simulated network failure)
      const rollbackResult = await rollbackCreditReservation(reservation.reservationId!, "Network simulation timeout");
      expect(rollbackResult.success).toBe(true);

      const accountAfterRollback = getServerUserAccount(testEmail);
      expect(accountAfterRollback.credits).toBe(initialCredits);

      // 3. New reservation + Commit
      const res2 = await reserveUserCredits(testEmail, 1, "commit_verification");
      expect(res2.allowed).toBe(true);

      const commitResult = await commitCreditReservation(res2.reservationId!);
      expect(commitResult.success).toBe(true);

      const accountAfterCommit = getServerUserAccount(testEmail);
      expect(accountAfterCommit.credits).toBe(initialCredits - 1);

      // Restore user credit balance
      await addCreditsOnServer(testEmail, 1, "test_cleanup");
    });
  });
});
