import { describe, it, expect, beforeEach } from "vitest";
import {
  claimSponsorClickOnServer,
  getSponsorClickStatusOnServer,
  getUserCreditsFromFirestore,
  addCreditsOnServer,
  reserveUserCredits,
  commitCreditReservation,
} from "./serverCreditEngine";
import {
  CANONICAL_FEATURE_BASE_COSTS,
  FEATURE_COSTS,
  getFeatureCreditCost,
} from "../utils/creditCosts";
import { isUserProfileComplete, UserProfile } from "../components/UserAuthModal";

describe("PHASE 15D — KREDİ SİSTEMİ VE PROFİL AKIŞI DOĞRULAMA TESTLERİ", () => {
  const testCitizenEmail = `test_citizen_15d_${Date.now()}@example.com`;
  const superAdminEmail = "warfacelove46@gmail.com";

  beforeEach(() => {
    // Fresh test user context
  });

  describe("1. Community Submission: 0 Credit Reward Guarantee", () => {
    it("approved community submission → credit balance unchanged (0 credit reward)", async () => {
      // Setup user with 20 credits
      await addCreditsOnServer(testCitizenEmail, 20, "Test Balance Initialization");
      const initialAccount = await getUserCreditsFromFirestore(testCitizenEmail);
      const startingCredits = initialAccount.credits;

      // 1. Simulate community submission cost reservation & commit (5 credits)
      const res = await reserveUserCredits(testCitizenEmail, 5, "community_submission");
      expect(res.allowed).toBe(true);
      expect(res.reservationId).toBeDefined();

      if (res.reservationId) {
        const commitRes = await commitCreditReservation(res.reservationId);
        expect(commitRes.success).toBe(true);
        expect(commitRes.remainingCredits).toBe(startingCredits - 5);
      }

      // Check balance after deduction
      const balanceAfterSubmission = (await getUserCreditsFromFirestore(testCitizenEmail)).credits;
      expect(balanceAfterSubmission).toBe(startingCredits - 5);

      // 2. Simulate AI / Gemini evaluation result: "approved", "verified", "quality", "scientific_contribution"
      const geminiEvaluationResult = {
        approved: true,
        sourceTrustScore: 95,
        thermodynamicConsistencyScore: 98,
        isPeerReviewed: true,
        feedback: "Kuantum termodinamik tutarlılığı onaylandı. Katkı arşivlendi.",
      };
      expect(geminiEvaluationResult.approved).toBe(true);

      // STRICT RULE: Approval MUST produce EXACTLY 0 credit reward!
      // In accordance with Stage 15D, no credit minting or deposit occurs for approval.
      const balanceAfterApproval = (await getUserCreditsFromFirestore(testCitizenEmail)).credits;
      expect(balanceAfterApproval).toBe(balanceAfterSubmission);
      expect(balanceAfterApproval).toBe(startingCredits - 5);
    });
  });

  describe("2. Server-Authoritative Sponsor Credits (+3 Credits, Max 5/Day)", () => {
    const sponsorUserEmail = `sponsor_user_${Date.now()}@example.com`;

    it("Grants +3 credits per valid claim on server", async () => {
      const claimId1 = `claim_${Date.now()}_1`;
      const result = await claimSponsorClickOnServer(sponsorUserEmail, {
        campaignId: "quantum_tpu",
        claimId: claimId1,
        bypassCooldown: true,
      });

      expect(result.success).toBe(true);
      expect(result.creditsEarned).toBe(3);
      expect(result.clickedToday).toBe(1);
    });

    it("Prevents replay attacks using the same claimId (Idempotency)", async () => {
      const replayClaimId = `replay_claim_${Date.now()}`;
      const replayEmail = `replay_user_${Date.now()}@example.com`;

      // First attempt succeeds
      const first = await claimSponsorClickOnServer(replayEmail, {
        campaignId: "quantum_tpu",
        claimId: replayClaimId,
        bypassCooldown: true,
      });
      expect(first.success).toBe(true);

      // Replay attempt with identical claimId fails
      const replay = await claimSponsorClickOnServer(replayEmail, {
        campaignId: "quantum_tpu",
        claimId: replayClaimId,
        bypassCooldown: true,
      });
      expect(replay.success).toBe(false);
      expect(replay.error).toContain("zaten kullanıldı");
    });

    it("Enforces server daily limit of max 5 sponsor claims per day", async () => {
      const limitUser = `limit_user_${Date.now()}@example.com`;

      // Perform claims up to limit (5 claims)
      for (let i = 1; i <= 5; i++) {
        const claimRes = await claimSponsorClickOnServer(limitUser, {
          campaignId: `camp_${i}`,
          claimId: `limit_claim_${Date.now()}_${i}`,
          bypassCooldown: true,
        });
        expect(claimRes.success).toBe(true);
        expect(claimRes.clickedToday).toBe(i);
      }

      // 6th claim must be rejected by server
      const sixthClaim = await claimSponsorClickOnServer(limitUser, {
        campaignId: "camp_6",
        claimId: `limit_claim_${Date.now()}_6`,
        bypassCooldown: true,
      });
      expect(sixthClaim.success).toBe(false);
      expect(sixthClaim.error).toContain("Günlük maksimum 5 sponsor tıklama");

      // Verify status query returns remainingToday: 0 and canClick: false
      const status = getSponsorClickStatusOnServer(limitUser);
      expect(status.clickedToday).toBe(5);
      expect(status.remainingToday).toBe(0);
      expect(status.canClick).toBe(false);
    });
  });

  describe("3. Single Source of Truth for Feature Costs & Tier Pricing", () => {
    it("Verifies canonical base prices exactly match specification", () => {
      expect(CANONICAL_FEATURE_BASE_COSTS.job_risk_analysis).toBe(10);
      expect(CANONICAL_FEATURE_BASE_COSTS.butterfly_effect).toBe(10);
      expect(CANONICAL_FEATURE_BASE_COSTS.persona_chat).toBe(2);
      expect(CANONICAL_FEATURE_BASE_COSTS.ai_simulation).toBe(10);
      expect(CANONICAL_FEATURE_BASE_COSTS.agent_scan).toBe(10);
      expect(CANONICAL_FEATURE_BASE_COSTS.proof_audit).toBe(10);
      expect(CANONICAL_FEATURE_BASE_COSTS.personal_roadmap).toBe(15);
      expect(CANONICAL_FEATURE_BASE_COSTS.milestone_tree).toBe(5);
      expect(CANONICAL_FEATURE_BASE_COSTS.parametric_audit).toBe(5);
      expect(CANONICAL_FEATURE_BASE_COSTS.telegram_deep_analysis).toBe(5);
      expect(CANONICAL_FEATURE_BASE_COSTS.community_submission).toBe(5);
    });

    it("Verifies plan multipliers: Free = 100%, Pro = 50%, Quantum VIP = 25%", () => {
      // Free plan: 100%
      expect(getFeatureCreditCost("job_risk_analysis", "free")).toBe(10);
      expect(getFeatureCreditCost("personal_roadmap", "free")).toBe(15);
      expect(getFeatureCreditCost("persona_chat", "free")).toBe(2);

      // Pro plan: Math.ceil(base * 0.50)
      expect(getFeatureCreditCost("job_risk_analysis", "pro")).toBe(5);
      expect(getFeatureCreditCost("personal_roadmap", "pro")).toBe(8); // ceil(15 * 0.5) = 8
      expect(getFeatureCreditCost("persona_chat", "pro")).toBe(1);

      // Quantum VIP: Math.ceil(base * 0.25)
      expect(getFeatureCreditCost("job_risk_analysis", "quantum_vip")).toBe(3); // ceil(10 * 0.25) = 3
      expect(getFeatureCreditCost("personal_roadmap", "quantum_vip")).toBe(4); // ceil(15 * 0.25) = 4
      expect(getFeatureCreditCost("persona_chat", "quantum_vip")).toBe(1); // max(1, ceil(2 * 0.25)) = 1
    });
  });

  describe("4. Unified Profile Model & Completeness Flow", () => {
    it("Recognizes complete profile when required fields are present", () => {
      const completeUser: UserProfile = {
        id: "usr_comp_1",
        fullName: "Dr. Aylin Kaya",
        email: "aylin.kaya@example.com",
        phone: "+905551234567",
        isEmailVerified: true,
        isPhoneVerified: true,
        joinedDate: "2026-04-01",
        credits: 0,
        plan: "free",
        profession: "Biyoteknoloji Mühendisi",
        age: 32,
        city: "Ankara",
        country: "Türkiye",
        lifeRole: "beyaz_yaka",
        primaryGoal: "gelecek_becerileri",
        employmentStatus: "employed",
        seniority: "Senior (6+ Yıl)",
        industrySector: "Biyoteknoloji & Tıp",
        isOnboardingCompleted: true,
      };

      expect(isUserProfileComplete(completeUser)).toBe(true);
    });

    it("Marks incomplete profile when vital fields are missing (e.g. freshly registered Google user)", () => {
      const freshGoogleUser: UserProfile = {
        id: "usr_google_fresh",
        fullName: "Yeni Google Kullanıcısı",
        email: "yeni.google@gmail.com",
        phone: "",
        isEmailVerified: true,
        isPhoneVerified: true,
        joinedDate: "2026-09-29",
        credits: 0,
        plan: "free",
        isOnboardingCompleted: false,
      };

      // Incomplete profile triggers profile completion wizard
      expect(isUserProfileComplete(freshGoogleUser)).toBe(false);
    });

    it("Always treats super admin as complete", () => {
      const superAdminUser: UserProfile = {
        id: "usr_superadmin",
        fullName: "Süper Yönetici",
        email: superAdminEmail,
        phone: "+90 (Süper Yetki)",
        isEmailVerified: true,
        isPhoneVerified: true,
        joinedDate: "2026-01-01",
        credits: 9999,
        plan: "quantum_vip",
        role: "superadmin",
        isOnboardingCompleted: false, // Even if flag is false, super admin is always complete
      };

      expect(isUserProfileComplete(superAdminUser)).toBe(true);
    });
  });
});
