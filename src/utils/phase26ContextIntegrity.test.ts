import { describe, it, expect } from "vitest";
import { TIMELINE_DATA } from "../data/timelineData";
import {
  calculateMilestonePersonalImpact,
  deriveMilestoneActionPlan,
  calculateTelegramSignalPersonalImpact,
  LiveIntelligenceSignal,
} from "./personalTimelineEngine";
import { UserProfile } from "../components/UserAuthModal";
import { safeStorage } from "./safeStorage";
import {
  setPendingRerunRecord,
  getPendingRerunRecord,
  clearPendingRerunRecord,
  PredictionHistoryRecord,
} from "./predictionHistory";

describe("PHASE 26 — Global Feature / Data / Context Integrity Suite", () => {
  const mockDoctorUser: UserProfile = {
    id: "usr_doc_26",
    fullName: "Dr. Aylin Kaya",
    email: "aylin.kaya@hospital.org",
    phone: "+905551234567",
    isEmailVerified: true,
    isPhoneVerified: true,
    joinedDate: "2026-03-01",
    credits: 100,
    plan: "pro",
    age: 36,
    profession: "Kıdemli Kardiyolog",
    lifeRole: "beyaz_yaka",
    lifeRoleLabel: "Uzman Hekim",
    primaryGoal: "saglik_omur",
    primaryGoalLabel: "Biyolojik Sağlık ve Uzun Ömür",
    personalGoal: "Genetik tıp ve mRNA tabanlı organ rejenerasyonuna klinik adaptasyon.",
    industrySector: "Sağlık & Biyoteknoloji",
    seniority: "🏆 Senior / Kıdemli (5-8 Yıl)",
    employmentStatus: "employed",
  };

  it("1. Milestone Canonicality: Verifies 35 distinct 1-to-1 milestone years with zero collisions", () => {
    expect(TIMELINE_DATA.length).toBe(35);
    const years = TIMELINE_DATA.map((m) => m.year);
    const uniqueYears = new Set(years);
    expect(uniqueYears.size).toBe(35);
    expect(Math.min(...years)).toBe(2026);
    expect(Math.max(...years)).toBe(2060);
  });

  it("2. User Profile → Personal Impact: Doctor profile receives high relevance score on Bio/Health milestone", () => {
    const medicalMilestone = TIMELINE_DATA.find((m) => m.year === 2033) || TIMELINE_DATA[7];
    const impact = calculateMilestonePersonalImpact(medicalMilestone, mockDoctorUser);

    expect(impact.relevanceScore).toBeGreaterThanOrEqual(65);
    expect(impact.relevanceLevel).toBe("high");
    expect(impact.userAgeAtMilestone).toBe(36 + (medicalMilestone.year - 2026));
    expect(impact.isProfilePending).toBe(false);
    expect(impact.careerImpactSummary).toContain("Kıdemli Kardiyolog");
  });

  it("3. User Profile → Action Plan: Concrete action plans align with user profession and horizon", () => {
    const nearTermMilestone = TIMELINE_DATA.find((m) => m.year === 2028) || TIMELINE_DATA[2];
    const impact = calculateMilestonePersonalImpact(nearTermMilestone, mockDoctorUser);
    const plan = deriveMilestoneActionPlan(nearTermMilestone, impact, mockDoctorUser);

    expect(plan.urgencyBand).toBe("immediate");
    expect(plan.timelinePhaseText).toContain("2026–2030");
    expect(plan.concreteAction).toContain("Kıdemli Kardiyolog");
  });

  it("4. Live Intelligence Context: Correlates live signals to matching milestone without context loss", () => {
    const mockSignal: LiveIntelligenceSignal = {
      id: "sig_bci_2031",
      title: "Nature Medicine: Biyo-Sentetik Nöral Arayüz Klinik Onayı",
      summary: "FDA tarafından insan deneyleri onaylanan biyo-entegre nöral implantlar.",
      category: "İnsan-Makine Arayüzü",
      timestamp: "2026-10-05T08:00:00Z",
      sourceOrg: "Nature Medicine",
      impactVerdict: "HIGH_BREAKTHROUGH",
      extractedYear: 2031,
      trlLevel: 7,
    };

    const impact = calculateTelegramSignalPersonalImpact(mockSignal, mockDoctorUser, null, null, TIMELINE_DATA);
    expect(impact.matchedMilestone).not.toBeNull();
    expect(impact.matchedMilestone?.category).toBe("İnsan-Makine Arayüzü");
    expect(impact.relevanceLevel).toBeDefined();
  });

  it("5. Storage Resilience: safeStorage correctly caches and isolates items in memory or local storage", () => {
    safeStorage.setItem("test_phase26_key", "phase26_val");
    expect(safeStorage.getItem("test_phase26_key")).toBe("phase26_val");
    safeStorage.removeItem("test_phase26_key");
    expect(safeStorage.getItem("test_phase26_key")).toBeNull();
  });

  it("6. Returning User Replay: setPendingRerunRecord stages and getPendingRerunRecord consumes record with targetYear and parameters", () => {
    const mockRecord: PredictionHistoryRecord = {
      id: "rec_job_test_123",
      timestamp: "2026-10-05T09:00:00Z",
      featureKey: "job_risk",
      featureName: "Meslek Risk Analizi",
      queryTitle: "Siber Güvenlik Uzmanı",
      queryInput: {
        profession: "Siber Güvenlik Uzmanı",
        prompt: "Siber Güvenlik Uzmanı için 2035 yapay zeka ikame riski",
      },
      targetYear: 2035,
      scenarioMode: "baseline",
      category: "Kuantum & Güvenlik",
      summarySnippet: "Siber güvenlik uzmanlığı yapay zekayla süper-uzmanlığa dönüşür.",
      creditsSpent: 0,
      tags: ["siber", "güvenlik", "2035"],
      metrics: {
        riskLevel: "Düşük",
        feasibilityScore: 92,
        impactLevel: 85,
        sentiment: "transformative",
      },
      generatedOutcome: "Siber güvenlikte yapay zeka insan uzmanları ikame etmek yerine süper-uzman seviyesine yükseltecektir.",
      userEngagement: {
        isBookmarked: true,
        viewCount: 1,
      },
    };

    setPendingRerunRecord(mockRecord);
    const retrieved = getPendingRerunRecord();
    expect(retrieved).not.toBeNull();
    expect(retrieved?.featureKey).toBe("job_risk");
    expect(retrieved?.targetYear).toBe(2035);
    expect(retrieved?.queryInput.profession).toBe("Siber Güvenlik Uzmanı");

    clearPendingRerunRecord();
    expect(getPendingRerunRecord()).toBeNull();
  });
});
