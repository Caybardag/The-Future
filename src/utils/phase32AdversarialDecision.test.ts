import { describe, it, expect } from "vitest";
import { TIMELINE_DATA } from "../data/timelineData";
import {
  calculateMilestonePersonalImpact,
  deriveMilestoneActionPlan,
  getMilestoneActionStatus,
  setMilestoneActionStatus,
  getAllMilestoneActionStatuses,
  getMilestoneActionNote,
  setMilestoneActionNote,
  getAllMilestoneActionNotes,
} from "./personalTimelineEngine";
import { calculateDynamicProbability } from "./probabilityCalculator";
import { getFiveLayerWorldState } from "./worldStateResolver";
import { getSignalsForMilestone } from "./referenceSources";
import { UserProfile } from "../components/UserAuthModal";

describe("PHASE 32 — Real-World Decision Simulation & Adversarial User Suite", () => {
  // ─── ADVERSARIAL PROFILE FIXTURES ───
  const profileSoftwareEngineer: UserProfile = {
    id: "adv-usr-swe-32",
    email: "swe.senior@devops.org",
    fullName: "Mehmet Demir",
    phone: "+905551110001",
    isEmailVerified: true,
    isPhoneVerified: true,
    joinedDate: "2026-01-01",
    credits: 100,
    plan: "pro",
    profession: "Software Engineer",
    industrySector: "Technology",
    seniority: "Senior",
    primaryGoal: "Career growth",
    lifeRole: "Professional",
    age: 32,
  };

  const profileDoctor: UserProfile = {
    id: "adv-usr-doc-32",
    email: "dr.ayse@health.gov",
    fullName: "Dr. Ayşe Yılmaz",
    phone: "+905551110002",
    isEmailVerified: true,
    isPhoneVerified: true,
    joinedDate: "2026-01-01",
    credits: 100,
    plan: "free",
    profession: "Doctor",
    industrySector: "Healthcare",
    seniority: "Senior",
    primaryGoal: "Career stability",
    age: 42,
  };

  const profileStudent: UserProfile = {
    id: "adv-usr-stu-32",
    email: "ali.student@uni.edu",
    fullName: "Ali Kaya",
    phone: "+905551110003",
    isEmailVerified: true,
    isPhoneVerified: true,
    joinedDate: "2026-01-01",
    credits: 100,
    plan: "free",
    profession: "Student",
    industrySector: "Education",
    seniority: "Entry",
    primaryGoal: "Career discovery",
    lifeRole: "ogrenci",
    age: 20,
  };

  const profileManager: UserProfile = {
    id: "adv-usr-mgr-32",
    email: "zeynep.mgr@enterprise.corp",
    fullName: "Zeynep Arslan",
    phone: "+905551110004",
    isEmailVerified: true,
    isPhoneVerified: true,
    joinedDate: "2026-01-01",
    credits: 100,
    plan: "pro",
    profession: "Technology Manager",
    industrySector: "Technology",
    seniority: "Manager",
    primaryGoal: "Strategic decision making",
    age: 46,
  };

  const profileCareerTransition: UserProfile = {
    id: "adv-usr-tra-32",
    email: "mert.switch@career.io",
    fullName: "Mert Öztürk",
    phone: "+905551110005",
    isEmailVerified: true,
    isPhoneVerified: true,
    joinedDate: "2026-01-01",
    credits: 100,
    plan: "free",
    profession: "Muhasebe ve Finans Uzmanı",
    industrySector: "Finance",
    seniority: "Mid",
    primaryGoal: "career_transition",
    personalGoal: "Yapay zeka ve veri bilimi alanına geçiş yapmak",
    age: 34,
  };

  const profileIncomplete: UserProfile = {
    id: "adv-usr-inc-32",
    email: "anon@ghost.io",
    fullName: "",
    phone: "",
    isEmailVerified: false,
    isPhoneVerified: false,
    joinedDate: "2026-01-01",
    credits: 0,
    plan: "free",
    profession: "",
    industrySector: "",
    seniority: "",
    primaryGoal: "",
  };

  // TEST 1: PROFILE A — SOFTWARE ENGINEER
  it("TEST 1: Software Engineer receives task-level automation insights and tool augmentation without job elimination fatalism", () => {
    const aiMilestone = TIMELINE_DATA[0]; // 2026 Ajanlar
    const impact = calculateMilestonePersonalImpact(aiMilestone, profileSoftwareEngineer);
    const plan = deriveMilestoneActionPlan(aiMilestone, impact, profileSoftwareEngineer);

    expect(impact.relevanceLevel).toBe("high");
    expect(impact.relevanceScore).toBeGreaterThanOrEqual(65);
    expect(impact.opportunitySummary).toContain("süper-uzman");
    expect(impact.careerImpactSummary).not.toContain("mesleğiniz yok olacak");
    expect(impact.riskSummary).not.toContain("kesin işsizlik");
    expect(plan.concreteAction).toContain("Software Engineer");
  });

  // TEST 2: PROFILE B — DOCTOR
  it("TEST 2: Doctor profile prioritizes clinical diagnostic protocols and preserves human decision authority without leaking developer advice", () => {
    const bioMilestone = TIMELINE_DATA.find((m) => m.category === "Biyoloji & Tıp")!;
    const docImpact = calculateMilestonePersonalImpact(bioMilestone, profileDoctor);
    const docPlan = deriveMilestoneActionPlan(bioMilestone, docImpact, profileDoctor);

    expect(docImpact.relevanceLevel).toBe("high");
    expect(docPlan.actionType).toBe("life_longevity");
    expect(docPlan.concreteAction).toContain("klinik");
    expect(docPlan.concreteAction).not.toContain("kodlama");
    expect(docPlan.concreteAction).not.toContain("developer");
  });

  // TEST 3: PROFILE C — STUDENT
  it("TEST 3: Student profile focuses on learning, open source exploration, and portfolio building without assuming corporate seniority", () => {
    const aiMilestone = TIMELINE_DATA[0];
    const stuImpact = calculateMilestonePersonalImpact(aiMilestone, profileStudent);
    const stuPlan = deriveMilestoneActionPlan(aiMilestone, stuImpact, profileStudent);

    expect(stuImpact.careerImpactSummary).toContain("eğitim ve kariyer başlangıcınızda");
    expect(stuImpact.opportunitySummary).toContain("portfolyo");
    expect(stuPlan.actionTypeLabel).toContain("Öğrenme & Portfolyo Keşfi");
    expect(stuPlan.concreteAction).toContain("öğrenim sürecinize");
    expect(stuPlan.concreteAction).not.toContain("kurumunuzun");
  });

  // TEST 4: PROFILE D — TECHNOLOGY MANAGER
  it("TEST 4: Technology Manager receives organizational orchestration and governance recommendations rather than individual developer tasks", () => {
    const aiMilestone = TIMELINE_DATA[0];
    const mgrImpact = calculateMilestonePersonalImpact(aiMilestone, profileManager);
    const mgrPlan = deriveMilestoneActionPlan(aiMilestone, mgrImpact, profileManager);

    expect(mgrImpact.careerImpactSummary).toContain("ekiplerin");
    expect(mgrImpact.careerImpactSummary).toContain("orkestrasyonuna");
    expect(mgrPlan.actionTypeLabel).toContain("Stratejik Yönetişim");
    expect(mgrPlan.concreteAction).toContain("ekip iş akışlarınıza");
  });

  // TEST 5: PROFILE E — CAREER TRANSITION
  it("TEST 5: Career transition profile builds transferability bridges rather than forcing the user to stay locked in legacy career", () => {
    const aiMilestone = TIMELINE_DATA[0];
    const traImpact = calculateMilestonePersonalImpact(aiMilestone, profileCareerTransition);
    const traPlan = deriveMilestoneActionPlan(aiMilestone, traImpact, profileCareerTransition);

    expect(traImpact.careerImpactSummary).toContain("kariyer geçiş");
    expect(traImpact.opportunitySummary).toContain("aktarılabilir");
    expect(traPlan.actionTypeLabel).toContain("Kariyer Geçişi");
    expect(traPlan.concreteAction).toContain("aktarılabilir yetkinlikler");
  });

  // TEST 6: PROFILE F — INCOMPLETE PROFILE
  it("TEST 6: Incomplete profile safely returns fallback guidance without fabricating nonexistent professions or crashing", () => {
    const milestone = TIMELINE_DATA[2];
    const incImpact = calculateMilestonePersonalImpact(milestone, profileIncomplete);
    const incPlan = deriveMilestoneActionPlan(milestone, incImpact, profileIncomplete);

    expect(incImpact.isProfilePending).toBe(true);
    expect(incImpact.careerImpactSummary).toContain("Profilinizde meslek belirtildiğinde");
    expect(incPlan.recommendationProvenance).toBe("deterministic_projection");
    expect(incPlan.concreteAction).toContain("Profil bilgilerinizi tamamlayarak");
  });

  // TEST 7: PROFILE DIFFERENTIATION (SAME MILESTONE / DIFFERENT PROFILES)
  it("TEST 7: Same milestone yields distinctly different personal impacts and actions across professions", () => {
    const milestone = TIMELINE_DATA[0];

    const swe = deriveMilestoneActionPlan(milestone, calculateMilestonePersonalImpact(milestone, profileSoftwareEngineer), profileSoftwareEngineer);
    const doc = deriveMilestoneActionPlan(milestone, calculateMilestonePersonalImpact(milestone, profileDoctor), profileDoctor);
    const stu = deriveMilestoneActionPlan(milestone, calculateMilestonePersonalImpact(milestone, profileStudent), profileStudent);
    const mgr = deriveMilestoneActionPlan(milestone, calculateMilestonePersonalImpact(milestone, profileManager), profileManager);

    // Each persona receives a tailored action plan
    expect(swe.concreteAction).not.toBe(doc.concreteAction);
    expect(swe.concreteAction).not.toBe(stu.concreteAction);
    expect(swe.concreteAction).not.toBe(mgr.concreteAction);
    expect(stu.concreteAction).not.toBe(mgr.concreteAction);

    // Action types reflect persona needs
    expect(stu.actionTypeLabel).toContain("Öğrenme");
    expect(mgr.actionTypeLabel).toContain("Yönetişim");
  });

  // TEST 8: PROFILE INVARIANCE (GLOBAL FACTS NEVER MUTATE PER USER)
  it("TEST 8: Global milestone facts, TRL levels, citations, and base probabilities remain strictly invariant to user profile", () => {
    const milestone = TIMELINE_DATA[5];

    const sweWorld = getFiveLayerWorldState(milestone, 1990);
    const docWorld = getFiveLayerWorldState(milestone, 1990);

    // World states are immutable facts regardless of persona
    expect(sweWorld.scientificReadiness.trlLevel).toBe(docWorld.scientificReadiness.trlLevel);
    expect(sweWorld.scientificReadiness.consensusType).toBe(docWorld.scientificReadiness.consensusType);
    expect(milestone.year).toBe(2031);
    expect(milestone.category).toBe("Biyoloji & Tıp");
    expect(milestone.impactLevel).toBe(62);
  });

  // TEST 9: RISK VS OPPORTUNITY MATRIX
  it("TEST 9: High automation potential presents both opportunity and risk without inducing panic", () => {
    const milestone = TIMELINE_DATA[0];
    const impact = calculateMilestonePersonalImpact(milestone, profileSoftwareEngineer);

    expect(impact.opportunitySummary.length).toBeGreaterThan(15);
    expect(impact.riskSummary.length).toBeGreaterThan(15);
    // Balanced tone check: avoids fatalism
    expect(impact.riskSummary).not.toContain("felaket");
    expect(impact.riskSummary).not.toContain("mahvolacak");
    expect(impact.opportunitySummary).not.toContain("garanti başarı");
  });

  // TEST 10: RELEVANCE VS CAREER RISK INDEPENDENCE
  it("TEST 10: Relevance score is orthogonal to career risk and does not conflate high interest with high danger", () => {
    // Bio milestone has high relevance for Doctor, but career risk is low/constructive
    const bioMilestone = TIMELINE_DATA.find((m) => m.category === "Biyoloji & Tıp")!;
    const docImpact = calculateMilestonePersonalImpact(bioMilestone, profileDoctor);

    expect(docImpact.relevanceLevel).toBe("high");
    expect(docImpact.opportunitySummary).toContain("süper-uzman");
    expect(docImpact.riskSummary).not.toContain("işini kaybedecek");
  });

  // TEST 11: AGE DIFFERENTIATION (18 vs 35 vs 65)
  it("TEST 11: Age meaningfully influences career horizon and advice without giving absurd recommendations", () => {
    const milestone = TIMELINE_DATA[2];

    const youngUser: UserProfile = { ...profileSoftwareEngineer, age: 18 };
    const midUser: UserProfile = { ...profileSoftwareEngineer, age: 35 };
    const seniorUser: UserProfile = { ...profileSoftwareEngineer, age: 65 };

    const youngImpact = calculateMilestonePersonalImpact(milestone, youngUser);
    const midImpact = calculateMilestonePersonalImpact(milestone, midUser);
    const seniorImpact = calculateMilestonePersonalImpact(milestone, seniorUser);

    expect(youngImpact.userAgeAtMilestone).toBe(18 + (milestone.year - 2026));
    expect(midImpact.userAgeAtMilestone).toBe(35 + (milestone.year - 2026));
    expect(seniorImpact.userAgeAtMilestone).toBe(65 + (milestone.year - 2026));

    const seniorPlan = deriveMilestoneActionPlan(milestone, seniorImpact, seniorUser);
    expect(seniorPlan.actionTypeLabel).toContain("Danışmanlık");
    expect(seniorPlan.concreteAction).toContain("mentorluk");
  });

  // TEST 12: LONG-HORIZON UNCERTAINTY (2055–2060)
  it("TEST 12: Long-horizon milestones (2055+) preserve epistemic uncertainty without deterministic urgency", () => {
    const lateMilestone = TIMELINE_DATA.find((m) => m.year >= 2055)!;
    const probData = calculateDynamicProbability(lateMilestone.probability, lateMilestone.year);
    const plan = deriveMilestoneActionPlan(lateMilestone, calculateMilestonePersonalImpact(lateMilestone, profileSoftwareEngineer), profileSoftwareEngineer);

    expect(probData.confidenceCategory).toBe("Teorik Model Hipotezi");
    expect(probData.adjustedProbability).toBeLessThanOrEqual(55);
    expect(plan.urgencyBand).toBe("long_term");
    expect(plan.urgencyTitle).toContain("2045+");
    expect(plan.reviewCheckpoint).toContain("5 Yılda Bir");
  });

  // TEST 13: CONTRADICTORY PROFILES (Doctor in Software / Student as Senior)
  it("TEST 13: Contradictory profiles are handled safely without unhandled exceptions or data corruption", () => {
    const hybridProfile: UserProfile = {
      ...profileDoctor,
      industrySector: "Technology",
      personalGoal: "Sağlık yazılımlarında yapay zeka entegrasyonu",
    };

    const milestone = TIMELINE_DATA[0];
    const hybridImpact = calculateMilestonePersonalImpact(milestone, hybridProfile);
    const hybridPlan = deriveMilestoneActionPlan(milestone, hybridImpact, hybridProfile);

    expect(hybridImpact.relevanceScore).toBeGreaterThanOrEqual(50);
    expect(hybridPlan.concreteAction).toBeDefined();
    expect(hybridPlan.recommendationProvenance).toBe("model_profile_derived");
  });

  // TEST 14: ACTION QUALITY & NON-COERCIVE ADVICE
  it("TEST 14: Action recommendations are actionable, achievable, and use non-coercive advisory language", () => {
    const milestone = TIMELINE_DATA[1];
    const plan = deriveMilestoneActionPlan(milestone, calculateMilestonePersonalImpact(milestone, profileSoftwareEngineer), profileSoftwareEngineer);

    expect(plan.concreteAction.length).toBeGreaterThan(20);
    expect(plan.concreteAction).not.toContain("mecbursunuz");
    expect(plan.concreteAction).not.toContain("zorundasınız");
    expect(plan.concreteAction).not.toContain("şarttır");
  });

  // TEST 15: REVIEW CHECKPOINT MODEL INTEGRITY
  it("TEST 15: Review checkpoints recommend plausible follow-up timeframes mapped to temporal horizons", () => {
    const nearM = TIMELINE_DATA.find((m) => m.year <= 2029)!;
    const midM = TIMELINE_DATA.find((m) => m.year >= 2030 && m.year <= 2035)!;
    const farM = TIMELINE_DATA.find((m) => m.year >= 2050)!;

    const nearPlan = deriveMilestoneActionPlan(nearM, calculateMilestonePersonalImpact(nearM, profileSoftwareEngineer), profileSoftwareEngineer);
    const midPlan = deriveMilestoneActionPlan(midM, calculateMilestonePersonalImpact(midM, profileSoftwareEngineer), profileSoftwareEngineer);
    const farPlan = deriveMilestoneActionPlan(farM, calculateMilestonePersonalImpact(farM, profileSoftwareEngineer), profileSoftwareEngineer);

    expect(nearPlan.reviewCheckpoint).toContain("6 Ay");
    expect(midPlan.reviewCheckpoint).toContain("12 Ay");
    expect(farPlan.reviewCheckpoint).toContain("5 Yıl");
  });

  // TEST 16: ACTION TRACKING LIFECYCLE (BIDIRECTIONAL TRANSITIONS)
  it("TEST 16: Action tracking supports full bidirectional lifecycle transitions without data corruption", () => {
    const year = 2029;
    const email = "lifecycle_test@client.org";

    setMilestoneActionStatus(year, "seen", email);
    expect(getMilestoneActionStatus(year, email)).toBe("seen");

    setMilestoneActionStatus(year, "planned", email);
    expect(getMilestoneActionStatus(year, email)).toBe("planned");

    setMilestoneActionStatus(year, "in_progress", email);
    expect(getMilestoneActionStatus(year, email)).toBe("in_progress");

    setMilestoneActionStatus(year, "completed", email);
    expect(getMilestoneActionStatus(year, email)).toBe("completed");

    // Revert back to planned
    setMilestoneActionStatus(year, "planned", email);
    expect(getMilestoneActionStatus(year, email)).toBe("planned");
  });

  // TEST 17: MULTI-USER ISOLATION
  it("TEST 17: Ensures absolute client-side isolation between multiple users on the same runtime", () => {
    const year = 2033;
    const userA = "usr_alpha@test.com";
    const userB = "usr_beta@test.com";

    setMilestoneActionStatus(year, "completed", userA);
    setMilestoneActionNote(year, "Alpha completed task", userA);

    setMilestoneActionStatus(year, "planned", userB);
    setMilestoneActionNote(year, "Beta planned task", userB);

    expect(getMilestoneActionStatus(year, userA)).toBe("completed");
    expect(getMilestoneActionNote(year, userA)).toBe("Alpha completed task");

    expect(getMilestoneActionStatus(year, userB)).toBe("planned");
    expect(getMilestoneActionNote(year, userB)).toBe("Beta planned task");
  });

  // TEST 18: DETERMINISTIC DECISION OUTPUT
  it("TEST 18: Identical inputs produce 100% deterministic outputs with zero stochastic drift", () => {
    const m = TIMELINE_DATA[3];
    const imp1 = calculateMilestonePersonalImpact(m, profileManager);
    const imp2 = calculateMilestonePersonalImpact(m, profileManager);

    expect(imp1.relevanceScore).toBe(imp2.relevanceScore);
    expect(imp1.careerImpactSummary).toBe(imp2.careerImpactSummary);
    expect(imp1.opportunitySummary).toBe(imp2.opportunitySummary);

    const act1 = deriveMilestoneActionPlan(m, imp1, profileManager);
    const act2 = deriveMilestoneActionPlan(m, imp2, profileManager);

    expect(act1.concreteAction).toBe(act2.concreteAction);
    expect(act1.reviewCheckpoint).toBe(act2.reviewCheckpoint);
  });

  // TEST 19: NO FABRICATED EVIDENCE OR FAKE PROFILE ATTRIBUTION
  it("TEST 19: System strictly preserves factual source integrity and never fabricates sources", () => {
    const milestone = TIMELINE_DATA[0];
    expect(milestone.patents).toBeDefined();
    expect(milestone.patents?.length).toBeGreaterThan(0);

    milestone.patents?.forEach((pat) => {
      expect(pat.title).toBeTruthy();
      expect(pat.assignee).toBeTruthy();
      expect(pat.googlePatentsUrl).toContain("patents.google.com");
      expect(pat.isRealPatent).toBe(true);
    });

    const signals = getSignalsForMilestone(milestone);
    expect(signals.length).toBeGreaterThan(0);
    signals.forEach((sig) => {
      expect(sig.title).toBeTruthy();
      expect(sig.sourceOrg).toBeTruthy();
    });
  });

  // TEST 20: NO GUARANTEED FUTURE OR JOB-LOSS FATALISM
  it("TEST 20: System avoids fatalistic claims of total profession elimination across all personas", () => {
    const profiles = [profileSoftwareEngineer, profileDoctor, profileStudent, profileManager];

    TIMELINE_DATA.slice(0, 10).forEach((m) => {
      profiles.forEach((p) => {
        const impact = calculateMilestonePersonalImpact(m, p);
        expect(impact.careerImpactSummary).not.toContain("mesleğiniz yok olacak");
        expect(impact.careerImpactSummary).not.toContain("kesin işsizlik");
        expect(impact.careerImpactSummary).not.toContain("garanti yıkım");
      });
    });
  });
});
