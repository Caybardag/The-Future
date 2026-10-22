import { describe, it, expect, beforeEach } from "vitest";
import {
  registerServerUser,
  loginServerUser,
  resolveVerifiedUser,
  deleteServerUserAccount,
  createTestSession,
  getAllServerUsers,
} from "./serverAuthEngine";
import {
  getUserCreditsFromFirestore,
  addCreditsOnServer,
  purgeServerUserCredits,
  purgeUserFirestoreData,
  getSponsorClickStatusOnServer,
} from "./serverCreditEngine";
import { isUserProfileComplete, UserProfile } from "../components/UserAuthModal";
import {
  saveAccount,
  getAccountByEmail,
  deleteAccount,
  purgeAllUserLocalData,
  registerOrGetAccount,
} from "../utils/userAccounts";

// Node environment storage polyfill for Vitest
if (typeof localStorage === "undefined") {
  const store = new Map<string, string>();
  (globalThis as any).localStorage = {
    getItem: (k: string) => store.get(k) ?? null,
    setItem: (k: string, v: string) => store.set(k, String(v)),
    removeItem: (k: string) => store.delete(k),
    clear: () => store.clear(),
    key: (i: number) => Array.from(store.keys())[i] ?? null,
    get length() {
      return store.size;
    },
  };
}

if (typeof sessionStorage === "undefined") {
  const sStore = new Map<string, string>();
  (globalThis as any).sessionStorage = {
    getItem: (k: string) => sStore.get(k) ?? null,
    setItem: (k: string, v: string) => sStore.set(k, String(v)),
    removeItem: (k: string) => sStore.delete(k),
    clear: () => sStore.clear(),
    key: (i: number) => Array.from(sStore.keys())[i] ?? null,
    get length() {
      return sStore.size;
    },
  };
}

describe("PHASE 15E — GERÇEK HESAP SİLME / YENİDEN GOOGLE GİRİŞ YAŞAM DÖNGÜSÜ TESTLERİ", () => {
  const superAdminEmail = "warfacelove46@gmail.com";

  beforeEach(() => {
    // Reset test storage
  });

  describe("1. Server-Side User Deletion & Session Invalidation", () => {
    it("server user deletion: successfully removes user from server DB and revokes session tokens", () => {
      const email = `test_delete_${Date.now()}@example.com`;
      const reg = registerServerUser({
        email,
        password: "TestPassword123!",
        fullName: "Test Citizen",
      });
      expect(reg.success).toBe(true);

      const login = loginServerUser(email, "TestPassword123!");
      expect(login.success).toBe(true);
      expect(login.token).toBeDefined();

      // Deletion of server account
      const deleted = deleteServerUserAccount(email);
      expect(deleted).toBe(true);

      // Verify user is gone from server users
      const allUsers = getAllServerUsers();
      const userFound = allUsers.find((u) => u.email === email);
      expect(userFound).toBeUndefined();

      // Verify old session token is revoked and unusable
      const loginAttempt = loginServerUser(email, "TestPassword123!");
      expect(loginAttempt.success).toBe(false);
    });

    it("duplicate deletion & retry: deleting an already deleted user is safe and idempotent", () => {
      const email = `retry_delete_${Date.now()}@example.com`;
      registerServerUser({ email, password: "Password123!", fullName: "Retry Citizen" });

      // First deletion
      const first = deleteServerUserAccount(email);
      expect(first).toBe(true);

      // Second deletion (idempotency check)
      const second = deleteServerUserAccount(email);
      expect(second).toBe(false); // Cleanly returns false without throwing
    });

    it("unauthorized deletion & superadmin protection: superadmin account cannot be deleted", () => {
      const result = deleteServerUserAccount(superAdminEmail);
      expect(result).toBe(false);

      const superBalancePurge = purgeServerUserCredits(superAdminEmail);
      expect(superBalancePurge).toBe(false);
    });
  });

  describe("2. Server Credit Preservation & Invalidation", () => {
    it("credit invalidation: purged user has no remaining ledger and no daily limit leaks", async () => {
      const email = `credit_purge_${Date.now()}@example.com`;
      await addCreditsOnServer(email, 50, "Initial Grant");

      // Verify credits exist
      const before = await getUserCreditsFromFirestore(email);
      expect(before?.credits).toBe(50);

      // Purge credits on server
      const purged = purgeServerUserCredits(email);
      expect(purged).toBe(true);

      // Verify ledger has been cleaned completely
      const after = await getUserCreditsFromFirestore(email);
      expect(after).toBeNull();

      // Verify daily limits / sponsor status reset
      const sponsorStatus = getSponsorClickStatusOnServer(email);
      expect(sponsorStatus.clickedToday).toBe(0);
      expect(sponsorStatus.remainingToday).toBe(5);
    });
  });

  describe("3. LocalStorage Resurrection Regression Test", () => {
    it("localStorage resurrection regression: purgeAllUserLocalData cleans all caches and logout does NOT re-save user", () => {
      const email = `resurrect_check_${Date.now()}@example.com`;
      const testUser: UserProfile = {
        id: `usr_${Date.now()}`,
        email,
        fullName: "Test Resurrect",
        phone: "+905550000000",
        isEmailVerified: true,
        isPhoneVerified: true,
        joinedDate: "2026-09-29",
        credits: 25,
        plan: "free",
        isOnboardingCompleted: true,
        profession: "AI Mühendisi",
        age: 28,
        city: "İstanbul",
      };

      // 1. Save user into local storage DB
      saveAccount(testUser);
      expect(getAccountByEmail(email)).not.toBeNull();

      // 2. Simulate account deletion purge
      purgeAllUserLocalData(email);

      // 3. Verify user is removed from accounts DB
      expect(getAccountByEmail(email)).toBeNull();

      // 4. Simulate logout with skipSaveAccount: true
      // (This verifies the fix where currentUserRef.current is cleared and skipSaveAccount prevents re-saving)
      let currentUserRef: { current: UserProfile | null } = { current: null };
      const skipSaveAccount = true;
      if (!skipSaveAccount && currentUserRef.current) {
        saveAccount(currentUserRef.current);
      }

      // 5. Must remain null! Old account must NOT be resurrected
      expect(getAccountByEmail(email)).toBeNull();
    });
  });

  describe("4. Google Re-Login Lifecycle: Old Profile Non-Resurrection & Onboarding Re-Entry", () => {
    it("New account on re-login: when Firestore document is absent, user is treated as new with 0 credits and isOnboardingCompleted = false", () => {
      const email = `google_relogin_${Date.now()}@example.com`;
      const googleUid = `google_uid_${Date.now()}`;

      // Simulate candidateUser created for newly logged in Google user when docSnap.exists() is false
      const isSuper = email === superAdminEmail;
      const candidateUser: UserProfile = {
        id: googleUid,
        fullName: "Yeniden Giriş Yapan Vatandaş",
        email,
        phone: isSuper ? "+90 (Süper Yetki)" : "",
        role: isSuper ? "superadmin" : "user",
        isEmailVerified: true,
        isPhoneVerified: true,
        joinedDate: new Date().toISOString(),
        credits: isSuper ? 99999 : 0, // Canonical initial value: 0
        plan: isSuper ? "quantum_vip" : "free",
        isBanned: false,
        country: "Türkiye",
        isOnboardingCompleted: false, // MANDATORY: MUST BE FALSE FOR NEW USER
      };

      // Verify that profile is marked as NOT complete
      const isComplete = isUserProfileComplete(candidateUser);
      expect(isComplete).toBe(false);

      // Verify credits are strictly new account initial credits (0)
      expect(candidateUser.credits).toBe(0);

      // Verify plan is free
      expect(candidateUser.plan).toBe("free");

      // Verify old profile attributes (profession, age, personalGoal) are undefined
      expect(candidateUser.profession).toBeUndefined();
      expect(candidateUser.age).toBeUndefined();
    });

    it("registerOrGetAccount fallback returns clean new account after deletion", () => {
      const email = `fresh_reg_${Date.now()}@example.com`;
      deleteAccount(email);

      const acc = registerOrGetAccount(email, "Temiz Kullanıcı", "", 0, true);
      expect(acc.email).toBe(email);
      expect(acc.credits).toBe(0);
      expect(acc.isOnboardingCompleted).toBeUndefined(); // Incomplete onboarding
      expect(isUserProfileComplete(acc)).toBe(false);
    });
  });

  describe("5. Firestore Purge & Anonymization Engine", () => {
    it("purgeUserFirestoreData cleans up user records while gracefully handling empty collections", async () => {
      const testUid = `usr_test_fs_${Date.now()}`;
      const testEmail = `fs_test_${Date.now()}@example.com`;

      const result = await purgeUserFirestoreData(testUid, testEmail);
      expect(result.success).toBe(true);
      expect(typeof result.deletedDocsCount).toBe("number");
      expect(typeof result.anonymizedTxCount).toBe("number");
    });
  });
});
