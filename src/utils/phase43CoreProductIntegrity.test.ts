import { describe, it, expect, beforeEach } from "vitest";
import {
  deriveMilestoneActionPlan,
  setMilestoneSelectedOption,
  getMilestoneSelectedOption,
  getMilestoneDecisionHistory,
  calculateDynamicImpactAssessment,
  calculateMilestonePersonalImpact,
} from "./personalTimelineEngine";
import { safeStorage } from "./safeStorage";
import { Milestone } from "../types";
import { UserProfile } from "../components/UserAuthModal";

describe("AŞAMA 43 — Core Product Integrity, Epistemics & Decision Invariants", () => {
  const mockMilestone: Milestone = {
    year: 2029,
    title: "Yapay Genel Zeka (AGI) Eşiği",
    description: "İlk laboratuvar ortamı AGI sistemlerinin doğrulanması.",
    canonicalDescription: "İlk laboratuvar ortamı AGI sistemlerinin doğrulanması.",
    phase: 1,
    category: "Yapay Zeka & Bilişim",
    probability: 80,
    iconName: "Cpu",
    impactLevel: 95,
    humanAugmentationIndex: 70,
    aiAutonomyIndex: 90,
    bioDigitalIntegrationRate: 40,
    keyDrivers: ["Scaling laws", "Reasoning models"],
    dailyLifeImpact: "Otonom bilişsel sistemler rutin bilişsel işleri devralır.",
    ethicalRisks: ["Alignment", "Control loss"],
    societalOpportunities: ["Scientific breakthrough", "Productivity surge"],
    relatedYears: [2026, 2028, 2030],
    signals: [],
  };

  const mockUser: UserProfile = {
    id: "usr-dr-aylin",
    fullName: "Dr. Aylin",
    email: "test_researcher@example.com",
    phone: "+905550000001",
    isEmailVerified: true,
    isPhoneVerified: true,
    joinedDate: "2026-01-01",
    credits: 100,
    plan: "pro",
    age: 32,
    profession: "Kıdemli Yazılım Mühendisi",
    primaryGoal: "Yapay zeka sistem liderliği",
  };

  beforeEach(() => {
    safeStorage.clear();
  });

  describe("Invariant 1: USER DECISION ≠ MODEL RECOMMENDATION", () => {
    it("preserves user explicit decision 'A' even if model recommends 'B' due to live signals", () => {
      // 1. User explicitly decides on Option A
      setMilestoneSelectedOption(2029, "A", mockUser.email, "user_manual_selection");
      expect(getMilestoneSelectedOption(2029, mockUser.email)).toBe("A");

      // 2. High-urgency live signal arrives that triggers model reassessment towards Option B
      const accelerationSignal = {
        id: "sig-agi-speedup",
        extractedYear: 2028,
        title: "Model Acceleration Signal",
        summary: "Autonomous reasoning breakhthrough ahead of schedule",
        confidenceWeight: 92,
        isVerifiedSignal: true,
        sourceOrg: "ArXiv / Nature",
        date: new Date().toISOString(),
      };

      const personalImpact = calculateMilestonePersonalImpact(mockMilestone, mockUser);
      const actionPlan = deriveMilestoneActionPlan(
        mockMilestone,
        personalImpact,
        mockUser,
        "A",
        "in_progress",
        "",
        [accelerationSignal]
      );

      // CRITICAL INVARIANT: User decision MUST strictly remain "A"
      expect(actionPlan.userDecision).toBe("A");
      expect(actionPlan.selectedOptionId).toBe("A");
      expect(actionPlan.isExplicitUserChoice).toBe(true);

      // Model recommendation may suggest alternative option "B"
      expect(actionPlan.modelRecommendation).toBeDefined();
      if (actionPlan.decisionReassessment?.needsReassessment) {
        expect(actionPlan.decisionReassessment.recommendedAlternativeOption).not.toBe("A");
        // User decision must NOT be silently mutated
        expect(actionPlan.userDecision).toBe("A");
      }
    });

    it("falls back to model recommendation when user has NOT made an explicit choice", () => {
      const personalImpact = calculateMilestonePersonalImpact(mockMilestone, mockUser);
      const actionPlan = deriveMilestoneActionPlan(
        mockMilestone,
        personalImpact,
        mockUser,
        undefined, // No user choice
        "seen",
        "",
        []
      );

      expect(actionPlan.userDecision).toBeNull();
      expect(actionPlan.isExplicitUserChoice).toBe(false);
      expect(actionPlan.selectedOptionId).toBe(actionPlan.modelRecommendation || actionPlan.recommendedOption || "A");
    });

    it("records full audit history when user modifies their strategic decision", () => {
      setMilestoneSelectedOption(2029, "A", mockUser.email, "user_manual_selection", "Initial selection");
      let history = getMilestoneDecisionHistory(2029, mockUser.email);
      expect(history.length).toBe(1);
      expect(history[0].selectedOptionId).toBe("A");
      expect(history[0].previousOptionId).toBeNull();

      // User changes mind to Option C
      setMilestoneSelectedOption(2029, "C", mockUser.email, "user_manual_selection", "Pivoting to deeper research");
      history = getMilestoneDecisionHistory(2029, mockUser.email);
      expect(history.length).toBe(2);
      expect(history[1].selectedOptionId).toBe("C");
      expect(history[1].previousOptionId).toBe("A");
      expect(history[1].reason).toBe("Pivoting to deeper research");
    });
  });

  describe("Invariant 2: Outcome Semantics Decoupling", () => {
    it("marks completed action as ACTION_COMPLETED_PENDING_REVIEW when no reflection note is provided", () => {
      const personalImpact = calculateMilestonePersonalImpact(mockMilestone, mockUser);
      const actionPlan = deriveMilestoneActionPlan(
        mockMilestone,
        personalImpact,
        mockUser,
        "A",
        "completed", // user clicked completed
        "", // no reflection note yet
        []
      );

      expect(actionPlan.outcomeStage).toBe("completed_unreviewed");
      expect(actionPlan.outcomeSemantics).toBe("ACTION_COMPLETED_PENDING_REVIEW");
      // Must not falsely assert objective verified outcome
      expect(actionPlan.outcomeFollowUpAdvice).toContain("Eylemi tamamlandı olarak işaretlediniz. Sonuç henüz değerlendirilmedi.");
    });

    it("detects friction and pivots when user reports blockers in note", () => {
      const personalImpact = calculateMilestonePersonalImpact(mockMilestone, mockUser);
      const actionPlan = deriveMilestoneActionPlan(
        mockMilestone,
        personalImpact,
        mockUser,
        "A",
        "in_progress",
        "Uygulamada ciddi zorluklar yaşadık, regülasyon engeli ve gecikme çıktı, farklı bir yol denemeliyiz.",
        []
      );

      expect(actionPlan.outcomeStage).toBe("friction_pivot_needed");
      expect(actionPlan.outcomeSemantics).toBe("PIVOT_NEEDED");
      expect(actionPlan.outcomeFollowUpAdvice).toContain("darboğaz veya tıkanıklık");
    });

    it("records positive outcome only when explicitly confirmed by user reflection", () => {
      const personalImpact = calculateMilestonePersonalImpact(mockMilestone, mockUser);
      const actionPlan = deriveMilestoneActionPlan(
        mockMilestone,
        personalImpact,
        mockUser,
        "A",
        "completed",
        "İlk prototipi başarıyla devreye aldık ve ekiple entegrasyonu tamamladık.",
        []
      );

      expect(actionPlan.outcomeStage).toBe("completed_unreviewed");
      expect(actionPlan.outcomeSemantics).toBe("USER_REPORTED_POSITIVE_RESULT");
    });
  });

  describe("Invariant 3: Dynamic Impact Engine Epistemic Integrity", () => {
    it("labels readiness calculations explicitly as MODEL_PROJECTION_NOT_FACT", () => {
      const assessment = calculateDynamicImpactAssessment(
        mockMilestone,
        [{ confidenceWeight: 85, sourceOrg: "Nature AI", extractedYear: 2028, summary: "Lab benchmark" }]
      );

      expect(assessment.epistemicStatus).toBe("MODEL_PROJECTION_NOT_FACT");
      expect(assessment.disclaimer).toContain("MODEL PROJECTION ≠ FACT");
      expect(assessment.readinessDimensions).toBeDefined();
      expect(assessment.readinessDimensions.infrastructureReadiness).toBeGreaterThanOrEqual(0);
      expect(assessment.readinessDimensions.regulatoryReadiness).toBeGreaterThanOrEqual(0);
      expect(assessment.readinessDimensions.commercialReadiness).toBeGreaterThanOrEqual(0);
      expect(assessment.readinessDimensions.overallReadinessScore).toBeGreaterThanOrEqual(0);
    });
  });

  describe("Invariant 4: Canonical Baseline Ground Truth Preservation", () => {
    it("maintains canonicalDescription as immutable reference even with dynamic live signals", () => {
      const modifiedMilestone: Milestone = {
        ...mockMilestone,
        canonicalDescription: "2026-2060 Değişmez Özgün Bilimsel Tanım",
        liveSignalAnnotation: "2026 Canlı İstihbarat Güncellemesi",
      };

      expect(modifiedMilestone.canonicalDescription).toBe("2026-2060 Değişmez Özgün Bilimsel Tanım");
      expect(modifiedMilestone.liveSignalAnnotation).toBe("2026 Canlı İstihbarat Güncellemesi");
    });
  });
});
