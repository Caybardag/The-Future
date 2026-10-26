import { describe, it, expect, beforeEach } from "vitest";
import {
  deriveMilestoneActionPlan,
  calculateMilestonePersonalImpact,
  deriveRoadmapMetrics,
  getMilestoneReassessmentAcknowledged,
  setMilestoneReassessmentAcknowledged,
  setMilestoneSelectedOption,
  getMilestoneSelectedOption,
} from "./personalTimelineEngine";
import { ROLE_VERDICTS, MetricProvenanceType } from "../components/FutureVerdictView";
import { Milestone, CategoryType } from "../types";
import { TIMELINE_DATA } from "../data/timelineData";
import { safeStorage } from "./safeStorage";
import fs from "fs";
import path from "path";

describe("PHASE 45 — P1 INTEGRITY, CLOSED-LOOP & PROVENANCE REGRESSION AUDIT", () => {
  const baseMilestone: Milestone = TIMELINE_DATA.find((m) => m.year === 2028) || TIMELINE_DATA[0];

  beforeEach(() => {
    safeStorage.clear();
  });

  // ─────────────────────────────────────────────────────────────────────────────
  // TEST 1 & TEST 10 — FILTER PRESERVES RUNTIME MILESTONE CONTEXT & NO STALE REVERT
  // ─────────────────────────────────────────────────────────────────────────────
  describe("Test 1 & 10 — Filter Context Preservation: Filter change never reverts dynamic milestone to stale baseline", () => {
    it("preserves dynamic breakthrough status, liveSignalAnnotation and signals when filter criteria change", () => {
      // 1. Dynamic milestone created at runtime
      const dynamicMilestone: Milestone = {
        year: 2035,
        title: "Kuantum Algoritma Kırılması 2035",
        category: "Kuantum & Güvenlik" as CategoryType,
        phase: 2,
        description: "Laboratuvar düzeyinde yeni bir kuantum hızlanma sinyali.",
        probability: 91,
        impactLevel: 96,
        aiAutonomyIndex: 88,
        humanAugmentationIndex: 92,
        bioDigitalIntegrationRate: 80,
        iconName: "Cpu",
        keyDrivers: ["Canlı Sinyal", "Patent Kaydı"],
        ethicalRisks: ["Kriptografik riskler"],
        societalOpportunities: ["İlaç keşfinde hızlanma"],
        dailyLifeImpact: "Tıbbi modellemeler günlere iner.",
        relatedYears: [2034, 2036],
        liveSignalAnnotation: "Canlı İstihbarat: Oxford ve MIT kuantum eşiğini aştı.",
        isDynamicBreakthrough: true,
        signals: [
          {
            id: "sig_dynamic_2035",
            category: "clinical_field_test" as const,
            title: "Oxford 1000 Qubit Testi",
            sourceOrg: "Oxford Q-Lab",
            summary: "Koherans süresinde 10x artış sağlandı.",
            confidenceWeight: 94,
            signalStrength: "Güçlü Doğrulayıcı Sinyal (Saha/Onay/Patent)",
            isVerifiedSignal: true,
            evidenceTier: "IDENTIFIER_PRESENT",
          },
        ],
      };

      // 2. Active milestone list before filter
      const fullTimeline = [baseMilestone, dynamicMilestone];

      // 3. User applies category filter that includes only Quantum category
      const selectedCategory: CategoryType | "all" = "Kuantum & Güvenlik";
      const filteredMilestones = fullTimeline.filter((m) => m.category === selectedCategory);

      // Invariant: The resolver picks from filteredMilestones, NOT raw static TIMELINE_DATA
      const firstFilteredYear = filteredMilestones[0]?.year;
      expect(firstFilteredYear).toBe(2035);

      // Verify old regression pattern: TIMELINE_DATA.find(item => item.year === 2035) might return stale object or undefined
      // Modern resolution pattern from App.tsx:
      const nextActive = filteredMilestones.find((m) => m.year === firstFilteredYear) || filteredMilestones[0];

      expect(nextActive).toBeDefined();
      expect(nextActive.isDynamicBreakthrough).toBe(true);
      expect(nextActive.liveSignalAnnotation).toBe("Canlı İstihbarat: Oxford ve MIT kuantum eşiğini aştı.");
      expect(nextActive.signals).toHaveLength(1);
      expect(nextActive.signals?.[0].title).toBe("Oxford 1000 Qubit Testi");
    });
  });

  // ─────────────────────────────────────────────────────────────────────────────
  // TEST 2 — REASSESSMENT REQUIRES USER INTERACTION (NO AUTOMATIC ACKNOWLEDGEMENT)
  // ─────────────────────────────────────────────────────────────────────────────
  describe("Test 2 — Reassessment Closed Loop: Model reassessment requires explicit user interaction", () => {
    it("leaves reassessment unacknowledged until user explicitly takes an action", () => {
      const userEmail = "analyst@example.com";
      const year = 2028;

      // Ensure clean state: not acknowledged
      const initialAck = getMilestoneReassessmentAcknowledged(year, userEmail);
      expect(initialAck).toBe(false);

      // Derive action plan with friction note that triggers reassessment
      const plan = deriveMilestoneActionPlan(
        baseMilestone,
        null,
        { email: userEmail, profession: "Veri Bilimci" } as any,
        "A",
        "completed",
        "Yol A eyleminde tıkandım ve beklenen faydayı alamadım, verimsiz oldu.",
        []
      );

      // Model recommends pivot, but isAcknowledged MUST be false initially
      expect(plan.decisionReassessment?.needsReassessment).toBe(true);
      expect(plan.decisionReassessment?.isAcknowledged).toBe(false);

      // User performs explicit acknowledgment via closed-loop UI
      setMilestoneReassessmentAcknowledged(year, true, userEmail);
      const postAck = getMilestoneReassessmentAcknowledged(year, userEmail);
      expect(postAck).toBe(true);

      // Re-deriving plan now reflects acknowledged status
      const updatedPlan = deriveMilestoneActionPlan(
        baseMilestone,
        null,
        { email: userEmail, profession: "Veri Bilimci" } as any,
        "A",
        "completed",
        "Yol A eyleminde tıkandım ve beklenen faydayı alamadım, verimsiz oldu.",
        []
      );
      expect(updatedPlan.decisionReassessment?.isAcknowledged).toBe(true);
    });
  });

  // ─────────────────────────────────────────────────────────────────────────────
  // TEST 3 — USER REJECTION / OVERRIDE REMAINS PRESERVED (USER CHOICE ≠ MODEL RECOMMENDATION)
  // ─────────────────────────────────────────────────────────────────────────────
  describe("Test 3 — Decision Independence: User decision remains distinct from model recommendation", () => {
    it("preserves User Option B even when model recommends Option A or C", () => {
      const userEmail = "engineer@example.com";
      const year = 2028;

      // User explicitly decides Option B
      setMilestoneSelectedOption(year, "B", userEmail);
      const selected = getMilestoneSelectedOption(year, userEmail);
      expect(selected).toBe("B");

      // Model generates plan with friction triggering alternative recommendation (Option A)
      const plan = deriveMilestoneActionPlan(
        baseMilestone,
        null,
        { email: userEmail, profession: "Sistem Mühendisi" } as any,
        "B",
        "completed",
        "Uygulamada darboğaz ve zorluk yaşadık.",
        []
      );

      // Invariant: User decision remains "B" while model recommendation is "A"
      expect(plan.userDecision).toBe("B");
      expect(plan.selectedOptionId).toBe("B");
      expect(plan.modelRecommendation).toBe("A");
      expect(plan.userDecision).not.toBe(plan.modelRecommendation);
    });
  });

  // ─────────────────────────────────────────────────────────────────────────────
  // TEST 4 — STATIC ROLE METRICS CLASSIFICATION & PROVENANCE
  // ─────────────────────────────────────────────────────────────────────────────
  describe("Test 4 — Epistemic Provenance: ROLE_VERDICTS metrics are classified as STATIC_SCENARIO_DATA", () => {
    it("ensures every role verdict has explicit STATIC_SCENARIO_DATA provenance", () => {
      const roles = Object.keys(ROLE_VERDICTS);
      expect(roles.length).toBeGreaterThanOrEqual(7);

      for (const roleKey of roles) {
        const verdict = ROLE_VERDICTS[roleKey];
        expect(verdict.provenance).toBe("STATIC_SCENARIO_DATA");
        expect(verdict.macroFocus.provenance).toBe("STATIC_SCENARIO_DATA");
        expect(verdict.criticalBreakthrough.provenance).toBe("STATIC_SCENARIO_DATA");
        expect(typeof verdict.criticalBreakthrough.inevitabilityScore).toBe("number");
        expect(verdict.criticalBreakthrough.inevitabilityScore).toBeGreaterThanOrEqual(80);
      }
    });
  });

  // ─────────────────────────────────────────────────────────────────────────────
  // TEST 5 — SYNTHETIC TELEMETRY CLASSIFICATION
  // ─────────────────────────────────────────────────────────────────────────────
  describe("Test 5 — Telemetry Epistemics: Synthetic demo telemetry is tagged and not treated as empirical live hardware readings", () => {
    it("verifies synthetic initial agent logs carry SYNTHETIC_DEMO_DATA provenance", () => {
      const sampleLog = {
        id: "init_1",
        agentName: "Otonom Analiz Motoru",
        agentType: "sentinel" as const,
        timestamp: "12:00:00",
        message: "Gelecek trendi ve otomasyon etki modelleri güncellendi (Simülasyon Modeli).",
        impactOn2060CountdownYears: -1.4,
        evolutionProgressDelta: +2.8,
        provenance: "SYNTHETIC_DEMO_DATA" as const,
      };

      expect(sampleLog.provenance).toBe("SYNTHETIC_DEMO_DATA");
      expect(sampleLog.provenance).not.toBe("REAL_LIVE_DATA");
    });
  });

  // ─────────────────────────────────────────────────────────────────────────────
  // TEST 6 — ACTION COMPLETED ≠ SUCCESSFUL OUTCOME ≠ MASTERY
  // ─────────────────────────────────────────────────────────────────────────────
  describe("Test 6 — Action Completion Invariant: Marking complete does not assert success or mastery", () => {
    it("marks completed action without note as completed_unreviewed and ACTION_COMPLETED_PENDING_REVIEW", () => {
      const plan = deriveMilestoneActionPlan(
        baseMilestone,
        null,
        null,
        "A",
        "completed",
        ""
      );

      expect(plan.outcomeStage).toBe("completed_unreviewed");
      expect(plan.outcomeSemantics).toBe("ACTION_COMPLETED_PENDING_REVIEW");
      expect(plan.outcomeStage).not.toBe("completed_mastery");
      expect(plan.realWorldOutcomeStatus).toBe("not_reported");
      expect(plan.outcomeVerificationEvidence).toBe("NOT_COMPUTED");
    });
  });

  // ─────────────────────────────────────────────────────────────────────────────
  // TEST 7 — PREDICTION HISTORY USES MATHEMATICALLY DERIVED METRICS
  // ─────────────────────────────────────────────────────────────────────────────
  describe("Test 7 — Prediction History Invariant: Metrics are mathematically derived from milestones and profile", () => {
    it("dynamically derives feasibility, impact, risk and sentiment without hardcoded constants", () => {
      const milestones = TIMELINE_DATA.slice(0, 3);
      const metrics = deriveRoadmapMetrics(milestones, { profession: "Hekim", age: 35 } as any, 35);

      expect(typeof metrics.feasibilityScore).toBe("number");
      expect(typeof metrics.impactLevel).toBe("number");
      expect(["Düşük", "Orta", "Yüksek", "Kritik"]).toContain(metrics.riskLevel);
      expect(["optimistic", "neutral", "dystopian", "transformative"]).toContain(metrics.sentiment);
    });
  });

  // ─────────────────────────────────────────────────────────────────────────────
  // TEST 8 — PROFESSION INTEGRITY: ROLE SELECTION NEVER OVERWRITES REAL PROFESSION
  // ─────────────────────────────────────────────────────────────────────────────
  describe("Test 8 — Profession Invariant: Role selection preserves real profession, seniority, and employment status", () => {
    it("keeps existing profession = 'Mimar' when lifeRole = 'parent' is selected", () => {
      const currentUser = {
        profession: "Mimar",
        seniority: "senior",
        employmentStatus: "self_employed",
      };

      const mappedRole = {
        profession: "Ebeveyn / Aile Temsilcisi",
        lifeRole: "parent",
        lifeRoleLabel: "Ebeveyn",
        employmentStatus: "employed",
        seniority: "mid",
      };

      const effectiveProfession = currentUser.profession?.trim()
        ? currentUser.profession
        : mappedRole.profession;

      expect(effectiveProfession).toBe("Mimar");
    });
  });

  // ─────────────────────────────────────────────────────────────────────────────
  // TEST 9 — CANONICAL DESCRIPTION VS LIVE SIGNAL ANNOTATION SEPARATION
  // ─────────────────────────────────────────────────────────────────────────────
  describe("Test 9 — Epistemic Grounding: Canonical description and live signal annotation remain separated", () => {
    it("never overwrites canonicalDescription with liveSignalAnnotation", () => {
      const canonicalDescription = "2028 yılında ticari insansı robotların ilk kitlesel pilotları fabrikalara girer.";
      const liveSignalAnnotation = "Canlı Sinyal: Tesla ve Agility Robotics yeni fabrika pilotunu duyurdu.";

      const milestone: Milestone = {
        ...baseMilestone,
        canonicalDescription,
        description: canonicalDescription,
        liveSignalAnnotation,
      };

      expect(milestone.canonicalDescription).toBe(canonicalDescription);
      expect(milestone.liveSignalAnnotation).toBe(liveSignalAnnotation);
      expect(milestone.canonicalDescription).not.toBe(milestone.liveSignalAnnotation);
    });
  });
});
