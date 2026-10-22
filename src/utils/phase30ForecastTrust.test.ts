import { describe, it, expect } from "vitest";
import { TIMELINE_DATA } from "../data/timelineData";
import {
  calculateMilestonePersonalImpact,
  deriveMilestoneActionPlan,
  calculateTelegramSignalPersonalImpact,
  LiveIntelligenceSignal,
} from "./personalTimelineEngine";
import { calculateDynamicProbability } from "./probabilityCalculator";
import { getFiveLayerWorldState } from "./worldStateResolver";
import { getReferenceSourcesForMilestone } from "./referenceSources";
import { UserProfile } from "../components/UserAuthModal";

describe("PHASE 30 — Forecast Trust & Decision Integrity Suite", () => {
  const mockDoctorUser: UserProfile = {
    id: "test-doctor-30",
    email: "doctor@hospital.org",
    fullName: "Dr. Ayşe",
    phone: "+905551112233",
    isEmailVerified: true,
    isPhoneVerified: true,
    joinedDate: "2026-01-01",
    credits: 100,
    plan: "free",
    profession: "Kardiyoloji Uzmanı Doktor",
    industrySector: "Sağlık ve Biyoteknoloji",
    age: 38,
    primaryGoal: "Klinik sağlık araştırmalarında yaşam kalitesi ve biyoteknoloji",
  };

  const mockSoftwareUser: UserProfile = {
    id: "test-sw-30",
    email: "dev@cloud.io",
    fullName: "Barış",
    phone: "+905551112244",
    isEmailVerified: true,
    isPhoneVerified: true,
    joinedDate: "2026-01-01",
    credits: 100,
    plan: "pro",
    profession: "Kıdemli Yazılım Geliştirici",
    industrySector: "Bilişim ve Bulut Sistemleri",
    age: 32,
    primaryGoal: "Yapay zeka araçlarıyla verimlilik ve SaaS girişimciliği",
  };

  // 1. FACT vs FORECAST: Projection texts are probabilistic models, not historical certainty
  it("1. Future projection states are explicitly framed as model forecasts, not guaranteed historical facts", () => {
    const nearMilestone = TIMELINE_DATA[0]; // e.g. 2026
    const farMilestone = TIMELINE_DATA.find((m) => m.year >= 2050)!;

    const nearProb = calculateDynamicProbability(nearMilestone.probability, nearMilestone.year);
    const farProb = calculateDynamicProbability(farMilestone.probability, farMilestone.year);

    // Near-term has patent/literature backing; far-term is categorized as theoretical hypothesis
    expect(nearProb.confidenceCategory).toBe("Yakın Ufuk Projeksiyonu");
    expect(nearProb.explanation).toContain("model olasılığı");

    expect(farProb.confidenceCategory).toBe("Teorik Model Hipotezi");
    expect(farProb.explanation).toContain("Yüksek teorik varyans");
  });

  // 2. PROBABILITY SEMANTICS: Probability scores apply temporal decay and avoid certainty claims
  it("2. Probability scores strictly implement uncertainty decay without exceeding epistemic limits", () => {
    const baseP = 85;
    const p2026 = calculateDynamicProbability(baseP, 2026, "baseline");
    const p2035 = calculateDynamicProbability(baseP, 2035, "baseline");
    const p2050 = calculateDynamicProbability(baseP, 2050, "baseline");

    expect(p2026.adjustedProbability).toBeGreaterThan(p2035.adjustedProbability);
    expect(p2035.adjustedProbability).toBeGreaterThan(p2050.adjustedProbability);

    // Decays strictly monotonically with time distance
    expect(p2026.decayFactor).toBe(1.0);
    expect(p2035.decayFactor).toBeLessThan(1.0);
    expect(p2050.decayFactor).toBeLessThan(0.6);
  });

  // 3. CONSENSUS SEMANTICS: Consensus is model-projected, not fabricated human consensus
  it("3. Scientific readiness explicitly labels consensus as model_projected rather than unanimous empirical agreement", () => {
    const milestone = TIMELINE_DATA[5];
    const worldState = getFiveLayerWorldState(milestone, 1990);

    expect(worldState.scientificReadiness.consensusType).toBe("model_projected");
    expect(worldState.scientificReadiness.academicConsensusRate).toBeGreaterThanOrEqual(35);
    expect(worldState.scientificReadiness.academicConsensusRate).toBeLessThanOrEqual(98);
  });

  // 4. RELEVANCE vs CAREER RISK: High personal relevance does not equal high career risk
  it("4. High personal relevance is orthogonal to career risk and does not force alarmist job loss claims", () => {
    // Bio milestone with doctor user: high relevance, but positive opportunity
    const bioMilestone = TIMELINE_DATA.find((m) => m.category === "Biyoloji & Tıp")!;
    const doctorImpact = calculateMilestonePersonalImpact(bioMilestone, mockDoctorUser);

    expect(doctorImpact.relevanceLevel).toBe("high");
    expect(doctorImpact.relevanceScore).toBeGreaterThanOrEqual(65);

    // Opportunity focuses on super-specialization, not job destruction
    expect(doctorImpact.opportunitySummary).toContain("süper-uzman");
    expect(doctorImpact.careerImpactSummary).not.toContain("mesleğiniz yok olacak");
    expect(doctorImpact.riskSummary).not.toContain("kesin işsizlik");
  });

  // 5. SCIENTIFIC SOURCE → FUTURE EVENT: Source presence does not imply future certainty
  it("5. Citations and patent records provide trend context without guaranteeing future milestone occurrence", () => {
    const milestoneWithPatents = TIMELINE_DATA.find((m) => m.patents && m.patents.length > 0)!;
    const citations = getReferenceSourcesForMilestone(milestoneWithPatents);

    const patentCitation = citations.find((c) => c.type === "patent_trend");
    expect(patentCitation).toBeDefined();

    // Patent is labeled as trend/filing, never as proof of future occurrence
    expect(patentCitation?.type).toBe("patent_trend");
    expect(patentCitation?.title).not.toContain("garanti");
  });

  // 6. TRL CLASSIFICATION: Model-estimated TRL is decoupled from certified laboratory TRL
  it("6. System distinguishes model-derived TRL from real lab-certified TRL", () => {
    const m = TIMELINE_DATA[0];
    const worldState = getFiveLayerWorldState(m, 1995);

    expect(worldState.scientificReadiness.trlType).toBe("model_estimated");
    expect(worldState.scientificReadiness.trlLevel).toBeGreaterThanOrEqual(1);
    expect(worldState.scientificReadiness.trlLevel).toBeLessThanOrEqual(9);
  });

  // 7. ACTION PLAN PROVENANCE: Action plan carries explicit recommendation provenance
  it("7. Action plan provides recommendationProvenance without using coercive mandatory language", () => {
    const nearMilestone = TIMELINE_DATA[0];
    const impact = calculateMilestonePersonalImpact(nearMilestone, mockSoftwareUser);
    const actionPlan = deriveMilestoneActionPlan(nearMilestone, impact, mockSoftwareUser);

    expect(actionPlan.recommendationProvenance).toBe("model_profile_derived");
    expect(actionPlan.concreteAction).toBeDefined();
    expect(actionPlan.concreteAction.length).toBeGreaterThan(10);
    // Advisory tone, not forcing fatalism
    expect(actionPlan.concreteAction).not.toContain("zorundasınız");
    expect(actionPlan.concreteAction).not.toContain("kesinlikle mecbur");
  });

  // 8. MISSING PROFILE SAFETY: Incomplete profile gracefully defaults without hallucinating details
  it("8. Incomplete or pending profile gracefully returns pending state without hallucinating professions", () => {
    const milestone = TIMELINE_DATA[3];
    const anonymousImpact = calculateMilestonePersonalImpact(milestone, null);

    expect(anonymousImpact.isProfilePending).toBe(true);
    expect(anonymousImpact.careerImpactSummary).toContain("Profilinizde meslek belirtildiğinde");
    expect(anonymousImpact.relevanceReason).toContain("küresel teknoloji");

    const anonymousAction = deriveMilestoneActionPlan(milestone, anonymousImpact, null);
    expect(anonymousAction.recommendationProvenance).toBe("deterministic_projection");
    expect(anonymousAction.concreteAction).toContain("Profil bilgilerinizi tamamlayarak");
  });

  // 9. LIVE SIGNAL DECISION CHAIN: Community signals provide context without claiming verified scientific truth
  it("9. Live Telegram signals evaluate relevance without promoting community rumors to peer-reviewed status", () => {
    const sampleSignal: LiveIntelligenceSignal = {
      id: "sig-test-30",
      title: "Yeni Açık Kaynak 30B Model Duyuruldu",
      category: "Yapay Zeka & Bilişim",
      extractedYear: 2027,
      originalText: "Yeni model kodlama ve ajan mimarilerinde %40 hız artışı sağlıyor.",
      impactVerdict: "HIGH_BREAKTHROUGH",
      trlLevel: 6,
    };

    const impact = calculateTelegramSignalPersonalImpact(sampleSignal, mockSoftwareUser);

    expect(impact.relevanceLevel).toBe("high");
    expect(impact.actionableAdvice).toBeDefined();
    // Neutral or opportunity, not artificial threat panic
    expect(impact.opportunityOrRisk).not.toBe("risk");
    expect(impact.careerImpactSummary).toContain("dönüşüm yaratabilir");
  });

  // 10. LONG-HORIZON UNCERTAINTY: 2050+ milestones retain high uncertainty
  it("10. 2050+ long-horizon milestones preserve uncertainty and do not overpromise deterministic accuracy", () => {
    const farMilestones = TIMELINE_DATA.filter((m) => m.year >= 2050);
    expect(farMilestones.length).toBeGreaterThan(0);

    farMilestones.forEach((m) => {
      const prob = calculateDynamicProbability(m.probability, m.year);
      expect(prob.confidenceCategory).toBe("Teorik Model Hipotezi");
      expect(prob.adjustedProbability).toBeLessThanOrEqual(60);
    });
  });

  // 11. DETERMINISTIC REPEATABILITY: Identical inputs produce identical scores
  it("11. Personal impact and action planning are 100% deterministic with zero stochastic variance", () => {
    const m = TIMELINE_DATA[2];
    const run1 = calculateMilestonePersonalImpact(m, mockDoctorUser);
    const run2 = calculateMilestonePersonalImpact(m, mockDoctorUser);

    expect(run1.relevanceScore).toBe(run2.relevanceScore);
    expect(run1.relevanceLevel).toBe(run2.relevanceLevel);
    expect(run1.relevanceReason).toBe(run2.relevanceReason);
    expect(run1.careerImpactSummary).toBe(run2.careerImpactSummary);

    const plan1 = deriveMilestoneActionPlan(m, run1, mockDoctorUser);
    const plan2 = deriveMilestoneActionPlan(m, run2, mockDoctorUser);
    expect(plan1.concreteAction).toBe(plan2.concreteAction);
    expect(plan1.recommendationProvenance).toBe(plan2.recommendationProvenance);
  });
});
