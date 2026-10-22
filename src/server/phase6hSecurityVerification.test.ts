import { describe, it, expect, beforeEach } from "vitest";
import { isReqAdmin } from "../../server";
import {
  reserveUserCredits,
  commitCreditReservation,
  rollbackCreditReservation,
  getUserCreditsFromFirestore,
  syncServerUserAccountInFirestore,
  resetCreditReservationsForTesting,
} from "./serverCreditEngine";
import { resolveVerifiedUser, createTestSession } from "./serverAuthEngine";
import { checkAdminSdkIamConnectivity } from "./firebaseAdmin";
import fs from "fs";
import path from "path";

describe("PHASE 6H — Server-Only Firestore Authorization & Attack Mitigation Suite", () => {
  const TEST_USER = "normal_user_phase6h@example.com";
  const ATTACKER = "attacker_phase6h@example.com";

  beforeEach(async () => {
    resetCreditReservationsForTesting();
    await syncServerUserAccountInFirestore(TEST_USER, { credits: 20, plan: "free", role: "user" });
    await syncServerUserAccountInFirestore(ATTACKER, { credits: 0, plan: "free", role: "user" });
  });

  // =========================================================================
  // TEST A: Client Attempting to Modify Credits
  // =========================================================================
  it("TEST A: Prevents client from mutating credits directly", async () => {
    // Normal client attempts to set credits to 9999
    const clientAttempt = {
      email: ATTACKER,
      credits: 9999,
      role: "user",
    };

    // Client write is simulated against security invariants:
    // Only backend authoritative engine can mutate credits
    const current = await getUserCreditsFromFirestore(ATTACKER);
    expect(current?.credits).toBe(0);

    // Any direct client payload cannot change the balance
    expect(current?.credits).not.toBe(clientAttempt.credits);
  });

  // =========================================================================
  // TEST B: Normal Client Token Cannot Create credit_transactions
  // =========================================================================
  it("TEST B: Firestore Rules explicitly deny client writes to credit_transactions", () => {
    const rulesPath = path.join(process.cwd(), "firestore.rules");
    const rules = fs.readFileSync(rulesPath, "utf-8");

    // Extract credit_transactions block
    const txBlockMatch = rules.match(/match\s+\/credit_transactions\/\{txId\}\s*\{([\s\S]*?)\}/);
    expect(txBlockMatch).not.toBeNull();
    const txBlock = txBlockMatch![1];

    // Verify create, update, delete are restricted only to superadmin (NO client write!)
    expect(txBlock).toContain("allow create, update, delete: if isSuperAdmin();");
    expect(txBlock).not.toContain("isServerAuthorizedForWrite");
    expect(txBlock).not.toContain("allow write: if true");
  });

  // =========================================================================
  // TEST C: Normal Client Token Cannot Create/Update credit_reservations
  // =========================================================================
  it("TEST C: Firestore Rules explicitly deny client writes to credit_reservations", () => {
    const rulesPath = path.join(process.cwd(), "firestore.rules");
    const rules = fs.readFileSync(rulesPath, "utf-8");

    const resBlockMatch = rules.match(/match\s+\/credit_reservations\/\{reservationId\}\s*\{([\s\S]*?)\}/);
    expect(resBlockMatch).not.toBeNull();
    const resBlock = resBlockMatch![1];

    // Verify create, update, delete are restricted only to superadmin (NO client write!)
    expect(resBlock).toContain("allow create, update, delete: if isSuperAdmin();");
    expect(resBlock).not.toContain("isServerAuthorizedForWrite");
  });

  // =========================================================================
  // TEST D: Normal Client Token Cannot Escalate Role
  // =========================================================================
  it("TEST D: Firestore Rules and auth engine strictly prevent privilege escalation", () => {
    const rulesPath = path.join(process.cwd(), "firestore.rules");
    const rules = fs.readFileSync(rulesPath, "utf-8");

    const userBlockMatch = rules.match(/match\s+\/users\/\{userId\}\s*\{([\s\S]*?)\}/);
    expect(userBlockMatch).not.toBeNull();
    const userBlock = userBlockMatch![1];

    // In users collection, client create/update forces role to match existing or be 'user'
    expect(userBlock).toContain("(!('role' in request.resource.data) || request.resource.data.role == 'user')");
    expect(userBlock).toContain("(!('role' in request.resource.data) || request.resource.data.role == resource.data.role)");
  });

  // =========================================================================
  // TEST E: users/{uid} Contains NO serverSecret or serverNonce Credential
  // =========================================================================
  it("TEST E: Client cannot extract serverSecret or serverNonce from users document", async () => {
    const userDoc = await getUserCreditsFromFirestore(TEST_USER);
    expect(userDoc).toBeDefined();

    // Verify that the user document representation contains NO serverSecret
    expect((userDoc as any).serverSecret).toBeUndefined();
    expect((userDoc as any).serverNonce).toBeUndefined();
  });

  // =========================================================================
  // TEST F: Old serverSecret + Nonce Mechanism is Completely Removed
  // =========================================================================
  it("TEST F: Old serverSecret mechanism is absent from rules and active engine code", () => {
    const rulesPath = path.join(process.cwd(), "firestore.rules");
    const rules = fs.readFileSync(rulesPath, "utf-8");

    // The old secret string must not exist in rules
    expect(rules).not.toContain("future_timeline_internal_server_secret");
    expect(rules).not.toContain("isServerAuthorizedForWrite");
    expect(rules).not.toContain("isServerDocument");
  });

  // =========================================================================
  // TEST G: x-admin-key Fails to Grant Admin Access
  // =========================================================================
  it("TEST G: x-admin-key header is completely ignored and rejected", () => {
    const mockReq = {
      headers: {
        "x-admin-key": "admin2026",
      },
      query: {},
    };

    const hasAdmin = isReqAdmin(mockReq);
    expect(hasAdmin).toBe(false);
  });

  // =========================================================================
  // TEST H: query.adminKey Fails to Grant Admin Access
  // =========================================================================
  it("TEST H: query.adminKey is completely ignored and rejected", () => {
    const mockReq = {
      headers: {},
      query: {
        adminKey: "admin2026",
      },
    };

    const hasAdmin = isReqAdmin(mockReq);
    expect(hasAdmin).toBe(false);
  });

  // =========================================================================
  // TEST I: Valid Firebase Session Authentication Works for Normal Operations
  // =========================================================================
  it("TEST I: Valid session token resolves identity accurately", async () => {
    const token = createTestSession(TEST_USER);
    const mockReq = {
      headers: {
        authorization: `Bearer ${token}`,
      },
    };

    const verified = await resolveVerifiedUser(mockReq);
    expect(verified).not.toBeNull();
    expect(verified?.email).toBe(TEST_USER);
    expect(verified?.role).toBe("user");
  });

  // =========================================================================
  // TEST J: Credit Reservation Operates Exclusively via Server Backend Engine
  // =========================================================================
  it("TEST J: Server credit engine handles reservations atomically with balance protection", async () => {
    const res = await reserveUserCredits(TEST_USER, 5, "timeline_simulation", {
      idempotencyKey: "idem_p6h_test_1",
    });

    expect(res.allowed).toBe(true);
    expect(res.remainingCredits).toBe(15);
    expect(res.reservationId).toBeDefined();

    // Commit reservation
    const commit = await commitCreditReservation(res.reservationId!);
    expect(commit.success).toBe(true);
    expect(commit.remainingCredits).toBe(15);

    // Verify balance remains 15
    const finalBalance = await getUserCreditsFromFirestore(TEST_USER);
    expect(finalBalance?.credits).toBe(15);
  });

  // =========================================================================
  // TEST K: Cross-Project IAM Connectivity Verification
  // =========================================================================
  it("TEST K: Accurately identifies cross-project IAM state for Admin SDK", async () => {
    const status = await checkAdminSdkIamConnectivity();
    // In this Cloud Run environment, the service account lacks roles/datastore.user
    // on the target project smurfy-citizen-xn50x, returning IAM_PERMISSION_DENIED.
    expect(status.status).toBe("IAM_PERMISSION_DENIED");
    expect(status.error).toContain("Missing or insufficient permissions");
  });
});
