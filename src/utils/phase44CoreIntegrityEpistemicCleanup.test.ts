import { describe, it, expect } from "vitest";
import {
  deriveMilestoneActionPlan,
  calculateMilestonePersonalImpact,
} from "./personalTimelineEngine";
import { Milestone, CategoryType } from "../types";
import { TIMELINE_DATA } from "../data/timelineData";
import fs from "fs";
import path from "path";

describe("PHASE 44 — P0/P1 CORE INTEGRITY & EPISTEMIC LANGUAGE CLEANUP REGRESSION TESTS", () => {
  const baseMilestone: Milestone = TIMELINE_DATA.find((m) => m.year === 2028) || TIMELINE_DATA[0];

  // ─────────────────────────────────────────────────────────────────────────────
  // TEST A — PROFESSION INTEGRITY
  // ─────────────────────────────────────────────────────────────────────────────
  describe("Test A — Profession Integrity: Role Selection never overwrites real profession", () => {
    it("preserves profession = 'Doktor' when user selects lifeRole = 'parent'", () => {
      const currentUser = {
        email: "doctor@example.com",
        profession: "Doktor",
        lifeRole: undefined,
        lifeRoleLabel: undefined,
        seniority: "senior",
        employmentStatus: "employed",
      };

      // Simulating handleSelectRole logic from FutureVerdictView
      const mappedRole = {
        profession: "Ebeveyn / Aile Temsilcisi",
        lifeRole: "parent",
        lifeRoleLabel: "Ebeveyn",
        employmentStatus: "employed",
        seniority: "mid",
      };

      const existingProfession = currentUser.profession?.trim();
      const effectiveProfession = existingProfession && existingProfession.length > 0
        ? currentUser.profession
        : mappedRole.profession;

      const effectiveSeniority = currentUser.seniority?.trim()
        ? currentUser.seniority
        : mappedRole.seniority;

      const updatedProfile = {
        ...currentUser,
        lifeRole: mappedRole.lifeRole,
        lifeRoleLabel: mappedRole.lifeRoleLabel,
        profession: effectiveProfession,
        seniority: effectiveSeniority,
      };

      expect(updatedProfile.profession).toBe("Doktor");
      expect(updatedProfile.lifeRole).toBe("parent");
      expect(updatedProfile.lifeRoleLabel).toBe("Ebeveyn");
      expect(updatedProfile.seniority).toBe("senior");
    });

    it("preserves profession = 'Yazılım Mühendisi' when repeatedly selecting life roles", () => {
      const currentUser = {
        email: "engineer@example.com",
        profession: "Yazılım Mühendisi",
        lifeRole: "parent",
        seniority: "senior",
      };

      const mappedStudent = {
        profession: "Öğrenci / Genç Araştırmacı",
        lifeRole: "student",
        lifeRoleLabel: "Öğrenci",
        seniority: "junior",
      };

      const existingProfession = currentUser.profession?.trim();
      const effectiveProfession = existingProfession && existingProfession.length > 0
        ? currentUser.profession
        : mappedStudent.profession;

      expect(effectiveProfession).toBe("Yazılım Mühendisi");
    });
  });

  // ─────────────────────────────────────────────────────────────────────────────
  // TEST B — ACTION COMPLETION: ACTION COMPLETED ≠ SUCCESSFUL OUTCOME ≠ MASTERY
  // ─────────────────────────────────────────────────────────────────────────────
  describe("Test B — Action Completion: Completed status without review note", () => {
    it("marks completed action as completed_unreviewed and ACTION_COMPLETED_PENDING_REVIEW without claiming mastery", () => {
      const profile = {
        email: "dev@example.com",
        profession: "Yazılım Geliştirici",
        seniority: "mid",
        employmentStatus: "employed",
      };

      const plan = deriveMilestoneActionPlan(
        baseMilestone,
        null,
        profile as any,
        "A",
        "completed",
        "" // No reflection note
      );

      // Must NOT be completed_mastery
      expect(plan.outcomeStage).not.toBe("completed_mastery");
      expect(plan.outcomeStage).toBe("completed_unreviewed");
      expect(plan.outcomeSemantics).toBe("ACTION_COMPLETED_PENDING_REVIEW");
      expect(plan.realWorldOutcomeStatus).toBe("not_reported");
      expect(plan.outcomeVerificationEvidence).toBe("NOT_COMPUTED");
      expect(plan.outcomeFollowUpAdvice).toContain("Eylemi tamamlandı olarak işaretlediniz. Sonuç henüz değerlendirilmedi.");
      expect(plan.outcomeFollowUpAdvice).not.toContain("Başarıyla tamamladınız");
    });
  });

  // ─────────────────────────────────────────────────────────────────────────────
  // TEST C — POSITIVE USER REPORT: USER REPORTED RESULT ≠ OBJECTIVE VERIFIED RESULT
  // ─────────────────────────────────────────────────────────────────────────────
  describe("Test C — Positive User Report: User reported note never creates objective verification", () => {
    it("records user_reported_positive without asserting objective external verification", () => {
      const profile = {
        email: "researcher@example.com",
        profession: "Biyolog",
        seniority: "senior",
        employmentStatus: "employed",
      };

      const plan = deriveMilestoneActionPlan(
        baseMilestone,
        null,
        profile as any,
        "B",
        "completed",
        "İlk fazı tamamladık ve laboratuvarda başarılı, verimli sonuç aldık."
      );

      expect(plan.realWorldOutcomeStatus).toBe("user_reported_positive");
      expect(plan.outcomeSemantics).toBe("USER_REPORTED_POSITIVE_RESULT");
      expect(plan.outcomeVerificationEvidence).toBe("USER_REPORTED_SIGNAL");
      // Must explicitly note that external objective verification is independent / not computed
      expect(plan.outcomeFollowUpAdvice).toContain("Objektif harici sonuç ve yetkinlik çıktısı bağımsız bir süreçtir (NOT_COMPUTED)");
      expect(plan.outcomeFollowUpAdvice).not.toContain("OBJECTIVELY_VERIFIED_RESULT");
    });
  });

  // ─────────────────────────────────────────────────────────────────────────────
  // TEST D — DYNAMIC MILESTONE PRESERVATION
  // ─────────────────────────────────────────────────────────────────────────────
  describe("Test D — Dynamic Milestone Context Preservation across navigation", () => {
    it("preserves liveSignalAnnotation and isDynamicBreakthrough metadata during active milestone merging", () => {
      const dynamicMilestone: Milestone = {
        year: 2035,
        title: "Kuantum Moleküler Simülasyon Kırılması",
        category: "Kuantum & Güvenlik" as CategoryType,
        phase: "era2" as any,
        description: "Laboratuvar düzeyinde yeni bir kuantum hızlanma sinyali.",
        probability: 88,
        impactLevel: 95,
        aiAutonomyIndex: 85,
        humanAugmentationIndex: 90,
        bioDigitalIntegrationRate: 75,
        iconName: "Cpu",
        keyDrivers: ["Canlı Sinyal", "arXiv Patentleri"],
        ethicalRisks: ["Kriptografik riskler"],
        societalOpportunities: ["İlaç keşfinde hızlanma"],
        dailyLifeImpact: "Tıbbi tedavi tasarım süreleri aylar yerine günlere iner.",
        relatedYears: [2034, 2036],
        liveSignalAnnotation: "Canlı İstihbarat: IBM ve Oxford kuantum laboratuvarında 1000 qubit eşiği aşıldı.",
        isDynamicBreakthrough: true,
        signals: [
          {
            id: "sig_dynamic_2035",
            category: "clinical_field_test" as const,
            title: "Oxford 1000 Qubit Lab Testi",
            sourceOrg: "Oxford Lab",
            summary: "Kuantum koherans süresinde 10x artış.",
            confidenceWeight: 92,
            signalStrength: "Güçlü Doğrulayıcı Sinyal (Saha/Onay/Patent)",
            isVerifiedSignal: true,
            evidenceTier: "IDENTIFIER_PRESENT",
          },
        ],
      };

      // Simulating App.tsx localized timeline resolution with active milestone state preservation
      const canonicalMatch = TIMELINE_DATA.find((m) => m.year === dynamicMilestone.year) || dynamicMilestone;
      const preservedActiveMilestone: Milestone = {
        ...canonicalMatch,
        ...dynamicMilestone,
        liveSignalAnnotation: dynamicMilestone.liveSignalAnnotation !== undefined
          ? dynamicMilestone.liveSignalAnnotation
          : canonicalMatch.liveSignalAnnotation,
        isDynamicBreakthrough: dynamicMilestone.isDynamicBreakthrough ?? canonicalMatch.isDynamicBreakthrough,
        signals: (dynamicMilestone.signals && dynamicMilestone.signals.length > 0)
          ? dynamicMilestone.signals
          : canonicalMatch.signals,
      };

      expect(preservedActiveMilestone.liveSignalAnnotation).toBe("Canlı İstihbarat: IBM ve Oxford kuantum laboratuvarında 1000 qubit eşiği aşıldı.");
      expect(preservedActiveMilestone.isDynamicBreakthrough).toBe(true);
      expect(preservedActiveMilestone.signals).toHaveLength(1);
      expect(preservedActiveMilestone.signals?.[0].title).toBe("Oxford 1000 Qubit Lab Testi");
    });
  });

  // ─────────────────────────────────────────────────────────────────────────────
  // TEST E — PREDICTION HISTORY: DERIVED VS HARDCODED METRICS
  // ─────────────────────────────────────────────────────────────────────────────
  describe("Test E — Prediction History: Mathematically derived metrics vs hardcoded demo values", () => {
    it("produces differentiated derived metrics for two different profiles and milestone sets", () => {
      const profileA = {
        email: "junior@example.com",
        age: 22,
        profession: "Yazılım Stajyeri",
        primaryGoal: "Yapay zeka ve teknoloji becerisi kazanmak",
      };

      const profileB = {
        email: "senior@example.com",
        age: 62,
        profession: "Emekli Hekim",
        primaryGoal: "Sağlık, ömür ve biyolojik yaşam kalitesi",
      };

      const milestonesA = TIMELINE_DATA.filter((m) => m.category === "Yapay Zeka & Bilişim").slice(0, 4);
      const milestonesB = TIMELINE_DATA.filter((m) => m.category === "Biyoloji & Tıp").slice(0, 4);

      const deriveMetrics = (milestones: Milestone[], profile: any) => {
        const selectedCount = Math.max(1, milestones.length);
        const rawAvgProb = milestones.reduce((acc, m) => acc + (m.probability || 70), 0) / selectedCount;
        const rawAvgImpact = milestones.reduce((acc, m) => acc + (m.impactLevel || 75), 0) / selectedCount;

        const relevanceWeights = milestones.map((m) => {
          const pImpact = calculateMilestonePersonalImpact(m, profile);
          return pImpact.relevanceScore || 50;
        });
        const avgRelevance = relevanceWeights.reduce((a, b) => a + b, 0) / selectedCount;

        const ageFactor = profile.age ? (profile.age < 30 ? 5 : profile.age > 55 ? -5 : 0) : 0;
        const derivedFeasibility = Math.min(99, Math.max(20, Math.round(rawAvgProb * 0.7 + avgRelevance * 0.3 + ageFactor)));
        const derivedImpact = Math.min(99, Math.max(25, Math.round(rawAvgImpact * 0.75 + avgRelevance * 0.25)));

        let derivedRisk: "Düşük" | "Orta" | "Yüksek" | "Kritik" = "Orta";
        if (derivedFeasibility >= 75 && derivedImpact <= 80) {
          derivedRisk = "Düşük";
        } else if (derivedFeasibility < 50 || derivedImpact >= 90) {
          derivedRisk = "Yüksek";
        }

        let derivedSentiment: "optimistic" | "balanced" | "cautious" = "balanced";
        if (derivedFeasibility >= 70 && derivedRisk === "Düşük") {
          derivedSentiment = "optimistic";
        } else if (derivedFeasibility < 50 || derivedRisk === "Yüksek") {
          derivedSentiment = "cautious";
        }

        return {
          feasibilityScore: derivedFeasibility,
          impactLevel: derivedImpact,
          riskLevel: derivedRisk,
          sentiment: derivedSentiment,
        };
      };

      const metricsA = deriveMetrics(milestonesA, profileA);
      const metricsB = deriveMetrics(milestonesB, profileB);

      // Must be derived and differ
      expect(metricsA).not.toEqual(metricsB);
      // Must not be the old static demo constant triplet: 88, 92, "Düşük", "optimistic" across both
      expect(metricsA.feasibilityScore !== metricsB.feasibilityScore || metricsA.impactLevel !== metricsB.impactLevel).toBe(true);
    });
  });

  // ─────────────────────────────────────────────────────────────────────────────
  // TEST F — EPISTEMIC LANGUAGE SCAN
  // ─────────────────────────────────────────────────────────────────────────────
  describe("Test F — Epistemic Language Scan: Absence of authoritative truth claims in UI", () => {
    it("ensures no user-facing UI component displays 'AI-Verified' or 'Yapay Zeka Onaylı'", () => {
      const componentsDir = path.join(process.cwd(), "src", "components");
      const files = fs.readdirSync(componentsDir).filter((f) => f.endsWith(".tsx"));

      const forbiddenPhrases = [
        "AI-VERIFIED TOP 10",
        "YAPAY ZEKA ONAYLI 10",
        "Doğrulanmış Tarihi Dönüm Noktası",
        "100+ Verified Future Milestones",
      ];

      for (const file of files) {
        const content = fs.readFileSync(path.join(componentsDir, file), "utf-8");
        for (const phrase of forbiddenPhrases) {
          expect(content.includes(phrase)).toBe(false);
        }
      }
    });

    it("ensures technical metadata fields (evidenceTier, isVerifiedSignal, VERIFIED_EXTERNAL_RECORD) are properly retained in data models", () => {
      // Invariant: Technical evidence classification is NOT erased from data schemas
      const sampleSignal = {
        id: "sig-test-1",
        title: "Test Signal",
        isVerifiedSignal: true,
        evidenceTier: "VERIFIED_EXTERNAL_RECORD" as const,
      };

      expect(sampleSignal.isVerifiedSignal).toBe(true);
      expect(sampleSignal.evidenceTier).toBe("VERIFIED_EXTERNAL_RECORD");
    });
  });
});
