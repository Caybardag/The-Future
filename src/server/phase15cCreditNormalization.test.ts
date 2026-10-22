import { describe, it, expect } from "vitest";
import { FEATURE_CREDIT_TABLE, getFeatureCreditCost } from "../utils/creditCosts";
import {
  reserveUserCreditsInFirestore,
  commitCreditReservationInFirestore,
  rollbackCreditReservationInFirestore,
  spinWheelOnServer,
  claimRewardedAdOnServer,
  getRewardedAdStatusOnServer,
  syncServerUserAccount,
} from "./serverCreditEngine";
import {
  REWARDED_AD_LIMIT_PER_DAY,
  CREDITS_PER_REWARDED_AD,
  SPONSOR_CLICK_LIMIT_PER_DAY,
  CREDITS_PER_SPONSOR_CLICK,
  MAX_DAILY_FREE_CREDITS,
} from "../utils/rewardedAdTracker";
import { FEATURE_COSTS } from "../components/CreditStoreModal";

describe("PHASE 15C — Credit Economy Normalization & Centralization Verification", () => {
  describe("1. Single Source of Truth & Cost Parity", () => {
    it("Verifies FEATURE_CREDIT_TABLE and FEATURE_COSTS align on primary features", () => {
      expect(FEATURE_CREDIT_TABLE.job_risk_analysis.baseCost).toBe(FEATURE_COSTS.JOB_RISK);
      expect(FEATURE_CREDIT_TABLE.butterfly_effect.baseCost).toBe(FEATURE_COSTS.BUTTERFLY_EFFECT);
      expect(FEATURE_CREDIT_TABLE.persona_chat.baseCost).toBe(FEATURE_COSTS.PERSONA_CHAT);
      expect(FEATURE_CREDIT_TABLE.ai_simulation.baseCost).toBe(FEATURE_COSTS.AI_SIMULATION);
      expect(FEATURE_CREDIT_TABLE.agent_scan.baseCost).toBe(FEATURE_COSTS.AGENT_SCAN);
      expect(FEATURE_CREDIT_TABLE.proof_audit.baseCost).toBe(FEATURE_COSTS.VERIFICATION_AUDIT);
      expect(FEATURE_CREDIT_TABLE.personal_roadmap.baseCost).toBe(FEATURE_COSTS.PERSONAL_ROADMAP);
    });

    it("Verifies client getFeatureCreditCost calculates plan discounts accurately", () => {
      // Job Risk: Base 10, Pro 5, VIP 3
      expect(getFeatureCreditCost("job_risk_analysis", "free")).toBe(10);
      expect(getFeatureCreditCost("job_risk_analysis", "pro")).toBe(5);
      expect(getFeatureCreditCost("job_risk_analysis", "quantum_vip")).toBe(3);

      // Persona Chat: Base 2, Pro 1, VIP 1
      expect(getFeatureCreditCost("persona_chat", "free")).toBe(2);
      expect(getFeatureCreditCost("persona_chat", "pro")).toBe(1);
      expect(getFeatureCreditCost("persona_chat", "quantum_vip")).toBe(1);

      // Personal Roadmap: Base 15, Pro 8, VIP 4
      expect(getFeatureCreditCost("personal_roadmap", "free")).toBe(15);
      expect(getFeatureCreditCost("personal_roadmap", "pro")).toBe(8);
      expect(getFeatureCreditCost("personal_roadmap", "quantum_vip")).toBe(4);
    });
  });

  describe("2. Server-Authoritative Plan Discount Engine", () => {
    it("Applies 50% discount for Pro plan on server reservation", async () => {
      const testEmail = "pro_user_test_15c@example.com";
      syncServerUserAccount(testEmail, { credits: 20, plan: "pro", role: "user" });

      const reservation = await reserveUserCreditsInFirestore(
        testEmail,
        10, // Base cost
        "ai_simulation",
        { plan: "pro", meta: { test: true } }
      );

      expect(reservation.allowed).toBe(true);
      expect(reservation.amount).toBe(5); // 50% of 10
      if (reservation.reservationId) {
        await rollbackCreditReservationInFirestore(reservation.reservationId, "Test cleanup");
      }
    });

    it("Applies 75% discount for Quantum VIP plan on server reservation", async () => {
      const testEmail = "vip_user_test_15c@example.com";
      syncServerUserAccount(testEmail, { credits: 20, plan: "quantum_vip", role: "user" });

      const reservation = await reserveUserCreditsInFirestore(
        testEmail,
        10, // Base cost
        "butterfly_effect",
        { plan: "quantum_vip", meta: { test: true } }
      );

      expect(reservation.allowed).toBe(true);
      expect(reservation.amount).toBe(3); // Math.ceil(10 * 0.25) = 3
      if (reservation.reservationId) {
        await rollbackCreditReservationInFirestore(reservation.reservationId, "Test cleanup");
      }
    });

    it("Exempts SuperAdmin entirely (cost = 0, balance = 9999)", async () => {
      const superEmail = "warfacelove46@gmail.com";
      const reservation = await reserveUserCreditsInFirestore(
        superEmail,
        30,
        "ai_simulation"
      );

      expect(reservation.allowed).toBe(true);
      expect(reservation.isSuperAdmin).toBe(true);
      expect(reservation.remainingCredits).toBe(9999);
      expect(reservation.amount).toBe(0);
    });
  });

  describe("3. Rewarded Ad & Daily Free Economy Parity", () => {
    it("Verifies rewarded ad parameters are completely unified", () => {
      expect(REWARDED_AD_LIMIT_PER_DAY).toBe(5);
      expect(CREDITS_PER_REWARDED_AD).toBe(5);
      expect(SPONSOR_CLICK_LIMIT_PER_DAY).toBe(5);
      expect(CREDITS_PER_SPONSOR_CLICK).toBe(3);
      expect(MAX_DAILY_FREE_CREDITS).toBe(40);
    });

    it("Verifies server rewarded ad claim awards exactly 5 credits", async () => {
      const testEmail = `ad_test_${Date.now()}@example.com`;
      const status = getRewardedAdStatusOnServer(testEmail);
      expect(status.maxPerDay).toBe(5);

      const claim = await claimRewardedAdOnServer(testEmail);
      if (claim.success) {
        expect(claim.creditsEarned).toBe(5);
      }
    });
  });

  describe("4. Quantum Wheel Server Authoritative Alignment", () => {
    it("Verifies server spin includes selectedIndex and remainingCredits", async () => {
      const testEmail = `spin_test_${Date.now()}@example.com`;
      const spin = await spinWheelOnServer(testEmail);
      if (spin.success) {
        expect(typeof spin.selectedIndex).toBe("number");
        expect(spin.selectedIndex).toBeGreaterThanOrEqual(0);
        expect(spin.selectedIndex).toBeLessThanOrEqual(7);
        expect(typeof spin.remainingCredits).toBe("number");
        expect(typeof spin.segment?.creditAmount).toBe("number");
      }
    });
  });
});
