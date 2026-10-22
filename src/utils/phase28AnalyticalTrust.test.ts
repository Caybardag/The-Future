import { describe, it, expect } from "vitest";
import { TIMELINE_DATA } from "../data/timelineData";
import {
  calculateMilestonePersonalImpact,
  deriveMilestoneActionPlan,
  calculateTelegramSignalPersonalImpact,
  LiveIntelligenceSignal,
} from "./personalTimelineEngine";
import { calculateDynamicProbability } from "./probabilityCalculator";
import { UserProfile } from "../components/UserAuthModal";

describe("PHASE 28 — Analytical Trust & Evidence Integrity Suite", () => {
  const doctorUser: UserProfile = {
    id: "usr_cardio_28",
    fullName: "Dr. Selin Demir",
    email: "selin.demir@cardio.med",
    phone: "+905559876543",
    isEmailVerified: true,
    isPhoneVerified: true,
    joinedDate: "2026-04-01",
    credits: 80,
    plan: "pro",
    age: 38,
    profession: "Kıdemli Kardiyolog",
    lifeRole: "beyaz_yaka",
    lifeRoleLabel: "Uzman Hekim",
    primaryGoal: "saglik_omur",
    primaryGoalLabel: "Biyolojik Sağlık ve Uzun Ömür",
    personalGoal: "Genetik tanı ve kardiyovasküler rejeneratif tıp",
    industrySector: "Sağlık & Biyoteknoloji",
    seniority: "🏆 Senior / Kıdemli (5-8 Yıl)",
    employmentStatus: "employed",
  };

  const softwareUser: UserProfile = {
    id: "usr_dev_28",
    fullName: "Emre Can",
    email: "emre.can@clouddev.io",
    phone: "+905551122334",
    isEmailVerified: true,
    isPhoneVerified: true,
    joinedDate: "2026-04-01",
    credits: 50,
    plan: "free",
    age: 26,
    profession: "Bulut Yazılım Geliştirici",
    lifeRole: "serbest_calisan",
    lifeRoleLabel: "Yazılım Uzmanı",
    primaryGoal: "teknoloji_beceri",
    primaryGoalLabel: "Teknolojik Yetkinlik ve Otonom Beceriler",
    personalGoal: "Büyük dil modelleri ve dağıtık kuantum bulut altyapıları",
    industrySector: "Bilişim & Yazılım",
    seniority: "⭐ Mid-Level / Uzman (3-5 Yıl)",
    employmentStatus: "employed",
  };

  it("1. Deterministic Score Repeatability: Identical inputs yield identical scores (Zero randomness)", () => {
    const milestone2033 = TIMELINE_DATA.find((m) => m.year === 2033) || TIMELINE_DATA[7];
    const run1 = calculateMilestonePersonalImpact(milestone2033, doctorUser);
    const run2 = calculateMilestonePersonalImpact(milestone2033, doctorUser);
    const run3 = calculateMilestonePersonalImpact(milestone2033, doctorUser);

    expect(run1.relevanceScore).toBe(run2.relevanceScore);
    expect(run2.relevanceScore).toBe(run3.relevanceScore);
    expect(run1.relevanceLevel).toBe(run2.relevanceLevel);
    expect(run1.careerImpactSummary).toBe(run2.careerImpactSummary);
  });

  it("2. No Hardcoded Profile Leakage: Distinct profiles receive distinct career impact & tailored advice", () => {
    const aiMilestone2029 = TIMELINE_DATA.find((m) => m.year === 2029) || TIMELINE_DATA[3];
    const doctorImpact = calculateMilestonePersonalImpact(aiMilestone2029, doctorUser);
    const softwareImpact = calculateMilestonePersonalImpact(aiMilestone2029, softwareUser);

    // Software engineer should have higher relevance on AI & Computing milestone than cardiologist
    expect(softwareImpact.relevanceScore).toBeGreaterThan(doctorImpact.relevanceScore);
    expect(doctorImpact.careerImpactSummary).toContain("Kıdemli Kardiyolog");
    expect(softwareImpact.careerImpactSummary).toContain("Bulut Yazılım Geliştirici");
  });

  it("3. Dynamic Probability: Compound uncertainty decay strictly decreases with time distance", () => {
    const near = calculateDynamicProbability(90, 2028, "baseline");
    const mid = calculateDynamicProbability(90, 2038, "baseline");
    const far = calculateDynamicProbability(90, 2055, "baseline");

    expect(near.adjustedProbability).toBeGreaterThan(mid.adjustedProbability);
    expect(mid.adjustedProbability).toBeGreaterThan(far.adjustedProbability);
    expect(near.confidenceCategory).toBe("Yakın Ufuk Projeksiyonu");
    expect(far.confidenceCategory).toBe("Teorik Model Hipotezi");
  });

  it("4. Epistemic Probability vs Relevance Distinction: Relevance is an interest score (15-99), not milestone occurrence certainty", () => {
    const milestone2033 = TIMELINE_DATA.find((m) => m.year === 2033) || TIMELINE_DATA[7];
    const impact = calculateMilestonePersonalImpact(milestone2033, doctorUser);

    expect(impact.relevanceScore).toBeGreaterThanOrEqual(15);
    expect(impact.relevanceScore).toBeLessThanOrEqual(99);
    // Relevance score measures user alignment, independent of milestone's global base probability
    expect(typeof impact.relevanceLevel).toBe("string");
  });

  it("5. Live Intelligence Provenance: Correctly maps signal to matching milestone without fabricating links", () => {
    const validSignal: LiveIntelligenceSignal = {
      id: "sig_crispr_01",
      title: "Nature Biotechnology: CRISPR Cas12a Klinik Evre Raporu",
      summary: "Monogenik kardiyomiyopati gen tedavisinde Faz 2 klinik deney sonuçları.",
      category: "Biyoloji & Tıp",
      timestamp: "2026-10-06T00:00:00Z",
      sourceOrg: "Nature Biotechnology",
      extractedYear: 2031,
      trlLevel: 6,
    };

    const impact = calculateTelegramSignalPersonalImpact(validSignal, doctorUser, null, null, TIMELINE_DATA);
    expect(impact.matchedMilestone).not.toBeNull();
    expect(impact.matchedMilestone?.category).toBe("Biyoloji & Tıp");
    expect(impact.relevanceLevel).toBe("high");
  });

  it("6. Empty / Incomplete Profile Handling: Gracefully returns pending state with zero hallucination", () => {
    const emptyUser: UserProfile = {
      ...doctorUser,
      profession: "",
      primaryGoal: "",
      personalGoal: "",
    };

    const milestone2031 = TIMELINE_DATA.find((m) => m.year === 2031) || TIMELINE_DATA[5];
    const impact = calculateMilestonePersonalImpact(milestone2031, emptyUser);

    expect(impact.isProfilePending).toBe(true);
    expect(impact.careerImpactSummary).toContain("Profilinizde meslek belirtildiğinde");
  });
});
