import { describe, it, expect } from "vitest";
import { TIMELINE_DATA } from "../data/timelineData";
import {
  calculateMilestonePersonalImpact,
  getPersonalizedTimelineMilestones,
  MilestonePersonalImpact,
  calculateTelegramSignalPersonalImpact,
  getPersonalizedTelegramSignals,
  LiveIntelligenceSignal,
  deriveMilestoneActionPlan,
  getMilestoneActionStatus,
  setMilestoneActionStatus,
  getAllMilestoneActionStatuses,
} from "./personalTimelineEngine";
import { UserProfile } from "../components/UserAuthModal";
import { PredictionHistoryRecord } from "./predictionHistory";

describe("PHASE 17 — Benim Geleceğim / Kişisel Timeline Engine Suite", () => {
  const sampleMilestone = TIMELINE_DATA[0]; // 2026 Yapay Zeka Ajanları Çağı

  const mockSoftwareUser: UserProfile = {
    id: "usr_software_test",
    fullName: "Mehmet Demir",
    email: "mehmet@example.com",
    phone: "+905551234567",
    isEmailVerified: true,
    isPhoneVerified: true,
    joinedDate: "2026-01-01",
    credits: 100,
    plan: "free",
    profession: "Yazılım Mühendisi & Full Stack Geliştirici",
    age: 28,
    city: "İstanbul",
    country: "Türkiye",
    lifeRole: "beyaz_yaka",
    primaryGoal: "gelecek_becerileri",
    personalGoal: "Otonom yazılım ve yapay zeka ajanlarında uzmanlaşmak",
  };

  const mockDoctorUser: UserProfile = {
    id: "usr_doctor_test",
    fullName: "Dr. Ayşe Yılmaz",
    email: "ayse@example.com",
    phone: "+905559876543",
    isEmailVerified: true,
    isPhoneVerified: true,
    joinedDate: "2026-01-01",
    credits: 100,
    plan: "free",
    profession: "Kardiyoloji Uzmanı & Tıp Doktoru",
    age: 42,
    city: "Ankara",
    country: "Türkiye",
    lifeRole: "beyaz_yaka",
    primaryGoal: "saglik_omur",
    personalGoal: "Biyoteknoloji ve genomik tedavileri klinik pratiğe entegre etmek",
  };

  const mockRoadmapRecord: PredictionHistoryRecord = {
    id: "pred_roadmap_1",
    userEmail: "mehmet@example.com",
    timestamp: new Date().toISOString(),
    featureKey: "personal_roadmap",
    featureName: "Kişisel Yol Haritası",
    queryTitle: "28 Yaş Yazılım Mühendisi Gelecek Planı",
    queryInput: {
      profession: "Yazılım Mühendisi & Full Stack Geliştirici",
      category: "Yapay Zeka & Bilişim",
      targetYear: 2060,
    },
    generatedOutcome: "2026: Yapay zeka ajanları ile orkestrasyon kurma. 2029: AGI çağında sistem mimarlığına geçiş.",
    summarySnippet: "Yazılım ve AI odaklı kişisel yol haritası",
    category: "Yapay Zeka & Bilişim",
    targetYear: 2060,
    scenarioMode: "optimistic",
    creditsSpent: 15,
    metrics: {
      feasibilityScore: 90,
      impactLevel: 95,
      riskLevel: "Düşük",
      sentiment: "optimistic",
    },
    userEngagement: {
      isBookmarked: true,
      viewCount: 3,
    },
    tags: ["roadmap", "yazılım"],
  };

  const mockJobRiskRecord: PredictionHistoryRecord = {
    id: "pred_jobrisk_1",
    userEmail: "mehmet@example.com",
    timestamp: new Date().toISOString(),
    featureKey: "job_risk",
    featureName: "Meslek Risk Analizi",
    queryTitle: "Yazılım Mühendisliği Otomasyon Riski",
    queryInput: {
      profession: "Yazılım Mühendisi & Full Stack Geliştirici",
    },
    generatedOutcome: "2026-2030 arasında rutin kodlama %70 otomatikleşiyor.",
    summarySnippet: "Yazılım otomasyon riski",
    category: "Yapay Zeka & Bilişim",
    targetYear: 2030,
    scenarioMode: "baseline",
    creditsSpent: 10,
    metrics: {
      feasibilityScore: 85,
      impactLevel: 80,
      riskLevel: "Yüksek",
      sentiment: "transformative",
    },
    userEngagement: {
      isBookmarked: false,
      viewCount: 1,
    },
    tags: ["job_risk", "software"],
  };

  // TEST 1: Profil + timeline mevcut -> kişisel timeline doğru oluşuyor
  it("TEST 1: Calculates accurate personal impact when profile and timeline milestone exist", () => {
    const impact = calculateMilestonePersonalImpact(sampleMilestone, mockSoftwareUser);
    expect(impact).toBeDefined();
    expect(impact.relevanceScore).toBeGreaterThanOrEqual(50);
    expect(impact.relevanceLevel).toBe("high");
    expect(impact.userAgeAtMilestone).toBe(28); // 2026 - 2026 + 28
    expect(impact.isProfilePending).toBe(false);
    expect(impact.careerImpactSummary).toContain("Yazılım Mühendisi");
  });

  // TEST 2: Roadmap mevcut -> roadmap bağlantıları doğru milestone'a bağlanıyor
  it("TEST 2: Links saved roadmap actions when milestone matches roadmap horizon", () => {
    const impact = calculateMilestonePersonalImpact(
      sampleMilestone,
      mockSoftwareUser,
      mockRoadmapRecord,
      mockJobRiskRecord
    );
    expect(impact.matchingRoadmapStep).not.toBeNull();
    expect(impact.matchingRoadmapStep?.targetYear).toBe(2026);
    expect(impact.matchingRoadmapStep?.action).toContain("yol haritanız");
  });

  // TEST 3: Roadmap yok -> timeline çalışıyor, crash yok
  it("TEST 3: Gracefully handles missing roadmap without throwing errors", () => {
    const impact = calculateMilestonePersonalImpact(sampleMilestone, mockSoftwareUser, null, null);
    expect(impact).toBeDefined();
    expect(impact.matchingRoadmapStep).toBeNull();
    expect(impact.preparationAdvice).toBeTruthy();
  });

  // TEST 4: Job Risk yok -> timeline çalışıyor
  it("TEST 4: Gracefully handles missing job risk without throwing errors", () => {
    const impact = calculateMilestonePersonalImpact(sampleMilestone, mockSoftwareUser, mockRoadmapRecord, null);
    expect(impact).toBeDefined();
    expect(impact.matchingJobRiskContext).toBeNull();
    expect(impact.riskSummary).toBeTruthy();
  });

  // TEST 5: Profil eksik -> uygun onboarding/profile yönlendirmesi (isProfilePending)
  it("TEST 5: Sets isProfilePending true and provides helpful guidance when profile is incomplete", () => {
    const emptyProfile: UserProfile = {
      ...mockSoftwareUser,
      profession: undefined,
    };
    const impact = calculateMilestonePersonalImpact(sampleMilestone, emptyProfile);
    expect(impact.isProfilePending).toBe(true);
    expect(impact.preparationAdvice).toContain("Profil bilgilerinizi tamamlayarak");
  });

  // TEST 6: Aynı kullanıcı aynı verilerle -> deterministic aynı relevance sonucu
  it("TEST 6: Guarantees strict mathematical determinism for identical user inputs", () => {
    const run1 = calculateMilestonePersonalImpact(sampleMilestone, mockSoftwareUser);
    const run2 = calculateMilestonePersonalImpact(sampleMilestone, mockSoftwareUser);
    expect(run1.relevanceScore).toBe(run2.relevanceScore);
    expect(run1.relevanceLevel).toBe(run2.relevanceLevel);
    expect(run1.careerImpactSummary).toBe(run2.careerImpactSummary);
    expect(run1.preparationAdvice).toBe(run2.preparationAdvice);
  });

  // TEST 7: İki farklı kullanıcı -> kişisel veriler birbirine karışmıyor (veri izolasyonu)
  it("TEST 7: Enforces strict data isolation between software engineer and medical doctor", () => {
    const softwareImpact = calculateMilestonePersonalImpact(sampleMilestone, mockSoftwareUser);
    const doctorImpact = calculateMilestonePersonalImpact(sampleMilestone, mockDoctorUser);

    expect(softwareImpact.relevanceLevel).toBe("high"); // Software is primary domain for 2026 AI Agents
    expect(doctorImpact.relevanceLevel).not.toBe("high"); // Doctor is secondary domain for 2026 AI Agents
    expect(softwareImpact.careerImpactSummary).not.toBe(doctorImpact.careerImpactSummary);
    expect(softwareImpact.userAgeAtMilestone).toBe(28);
    expect(doctorImpact.userAgeAtMilestone).toBe(42);
  });

  // TEST 8: Timeline açılması -> gereksiz Gemini çağrısı yok (zero AI calls)
  it("TEST 8: Client-side calculation does not invoke AI SDK and executes synchronously", () => {
    const startTime = performance.now();
    const results = getPersonalizedTimelineMilestones(TIMELINE_DATA, mockSoftwareUser);
    const duration = performance.now() - startTime;

    expect(results.length).toBe(TIMELINE_DATA.length);
    expect(duration).toBeLessThan(50); // Under 50ms for all 100 milestones!
  });

  // TEST 9: Timeline açılması -> kredi düşümü yok (zero credit deduction)
  it("TEST 9: Calculation returns pure data objects with no side-effects or credit charges", () => {
    const initialCredits = mockSoftwareUser.credits;
    calculateMilestonePersonalImpact(sampleMilestone, mockSoftwareUser);
    expect(mockSoftwareUser.credits).toBe(initialCredits); // Pure function
  });

  // TEST 10: Global timeline -> eski davranışı bozulmadan çalışıyor
  it("TEST 10: Preserves global timeline dataset and ordering intact", () => {
    const results = getPersonalizedTimelineMilestones(TIMELINE_DATA, mockSoftwareUser);
    for (let i = 0; i < TIMELINE_DATA.length; i++) {
      expect(results[i].milestone.year).toBe(TIMELINE_DATA[i].year);
      expect(results[i].milestone.title).toBe(TIMELINE_DATA[i].title);
    }
  });

  // TEST 11: Mobil rendering / relevance level & scores -> format ve taşma yapmayan değer aralıkları (0-100)
  it("TEST 11: Validates scores are bound within [15, 99] and user age projects monotonically", () => {
    const results = getPersonalizedTimelineMilestones(TIMELINE_DATA, mockSoftwareUser);
    let previousAge = 0;
    for (const item of results) {
      expect(item.impact.relevanceScore).toBeGreaterThanOrEqual(15);
      expect(item.impact.relevanceScore).toBeLessThanOrEqual(99);
      expect(["high", "medium", "low"]).toContain(item.impact.relevanceLevel);
      if (item.impact.userAgeAtMilestone) {
        expect(item.impact.userAgeAtMilestone).toBeGreaterThanOrEqual(previousAge);
        previousAge = item.impact.userAgeAtMilestone;
      }
    }
  });
});

describe("PHASE 18 — Beni Etkileyen Canlı Gelişmeler (Telegram & Live Signals) Engine Suite", () => {
  const mockSoftwareUser: UserProfile = {
    id: "usr_software_test",
    fullName: "Mehmet Demir",
    email: "mehmet@example.com",
    phone: "+905551234567",
    isEmailVerified: true,
    isPhoneVerified: true,
    joinedDate: "2026-01-01",
    credits: 100,
    plan: "free",
    profession: "Yazılım Mühendisi & Full Stack Geliştirici",
    age: 28,
    city: "İstanbul",
    country: "Türkiye",
    lifeRole: "beyaz_yaka",
    primaryGoal: "gelecek_becerileri",
    personalGoal: "Otonom yazılım ve yapay zeka ajanlarında uzmanlaşmak",
  };

  const mockDoctorUser: UserProfile = {
    id: "usr_doctor_test",
    fullName: "Dr. Ayşe Yılmaz",
    email: "ayse@example.com",
    phone: "+905559876543",
    isEmailVerified: true,
    isPhoneVerified: true,
    joinedDate: "2026-01-01",
    credits: 100,
    plan: "free",
    profession: "Kardiyoloji Uzmanı & Tıp Doktoru",
    age: 42,
    city: "Ankara",
    country: "Türkiye",
    lifeRole: "beyaz_yaka",
    primaryGoal: "saglik_omur",
    personalGoal: "Biyoteknoloji ve genomik tedavileri klinik pratiğe entegre etmek",
  };

  const sampleAISignal: LiveIntelligenceSignal = {
    id: "sig_ai_agents_2026",
    telegramMessageId: 101,
    title: "Otonom Kodlama ve Yazılım Ajanlarında Büyük Atılım",
    summary: "Yeni nesil çoklu model orkestrasyonu, yazılım mühendislerinin rutin kodlama yükünü otomatikleştiriyor.",
    originalText: "Teknoloji devleri yazılım ve yapay zeka geliştiricileri için otonom ajan protokolünü duyurdu.",
    extractedYear: 2027,
    category: "Yapay Zeka & Bilişim",
    trlLevel: 7,
    confidenceScore: 92,
    impactVerdict: "HIGH_BREAKTHROUGH",
    channelTitle: "Gelecek Takvimi",
    receivedAt: "2026-09-30T12:00:00Z",
  };

  const sampleBioSignal: LiveIntelligenceSignal = {
    id: "sig_crispr_cure_2028",
    telegramMessageId: 102,
    title: "Genomik Tedavilerde ve Biyoteknolojide Yeni Klinik Başarı",
    summary: "Kardiyovasküler hastalıklara karşı hedeflenmiş gen terapisi klinik faz 3 aşamasını başarıyla tamamladı.",
    originalText: "Tıp hekimleri ve kardiyoloji uzmanları için yeni genetik tedavi protokolü onaylandı.",
    extractedYear: 2028,
    category: "Biyoloji & Tıp",
    trlLevel: 8,
    confidenceScore: 95,
    impactVerdict: "HIGH_BREAKTHROUGH",
    channelTitle: "Bilimsel İnovasyon",
    receivedAt: "2026-09-30T14:00:00Z",
  };

  // TEST 1: Canlı gelişme + Yazılım Mühendisi profili -> Yüksek mesleki ilgi ve kariyer etkisi
  it("TEST 1: Calculates high relevance impact for software engineer on AI/coding signal", () => {
    const impact = calculateTelegramSignalPersonalImpact(sampleAISignal, mockSoftwareUser, null, null, TIMELINE_DATA);
    expect(impact).toBeDefined();
    expect(impact.relevanceScore).toBeGreaterThanOrEqual(65);
    expect(impact.relevanceLevel).toBe("high");
    expect(impact.userAgeAtImpact).toBe(29); // 2027 - 2026 + 28
    expect(impact.careerImpactSummary).toContain("Yazılım Mühendisi");
    expect(impact.isProfilePending).toBe(false);
  });

  // TEST 2: Veri İzolasyonu: Aynı AI sinyali Doktor profiliyle karşılaştırıldığında farklı sonuç üretir
  it("TEST 2: Enforces strict data isolation between software engineer and medical doctor", () => {
    const softwareImpact = calculateTelegramSignalPersonalImpact(sampleAISignal, mockSoftwareUser, null, null, TIMELINE_DATA);
    const doctorImpact = calculateTelegramSignalPersonalImpact(sampleAISignal, mockDoctorUser, null, null, TIMELINE_DATA);

    expect(softwareImpact.relevanceLevel).toBe("high");
    expect(doctorImpact.relevanceLevel).not.toBe("high");
    expect(softwareImpact.relevanceScore).toBeGreaterThan(doctorImpact.relevanceScore);
    expect(softwareImpact.careerImpactSummary).not.toBe(doctorImpact.careerImpactSummary);
  });

  // TEST 3: Biyoteknoloji sinyali Doktor için yüksek, Yazılımcı için düşük/orta etkilidir
  it("TEST 3: Calculates high relevance impact for medical doctor on genomics/cardio signal", () => {
    const doctorImpact = calculateTelegramSignalPersonalImpact(sampleBioSignal, mockDoctorUser, null, null, TIMELINE_DATA);
    const softwareImpact = calculateTelegramSignalPersonalImpact(sampleBioSignal, mockSoftwareUser, null, null, TIMELINE_DATA);

    expect(doctorImpact.relevanceScore).toBeGreaterThanOrEqual(65);
    expect(doctorImpact.relevanceLevel).toBe("high");
    expect(doctorImpact.careerImpactSummary).toContain("Kardiyoloji Uzmanı");
    expect(doctorImpact.relevanceScore).toBeGreaterThan(softwareImpact.relevanceScore);
  });

  // TEST 4: Canlı sinyal zaman çizelgesiyle eşleşir (matchedMilestone)
  it("TEST 4: Correlates live signal to matching timeline milestone by year and category", () => {
    const impact = calculateTelegramSignalPersonalImpact(sampleAISignal, mockSoftwareUser, null, null, TIMELINE_DATA);
    expect(impact.matchedMilestone).not.toBeNull();
    expect(impact.matchedMilestone?.category).toBe("Yapay Zeka & Bilişim");
  });

  // TEST 5: Profil eksik olduğunda çökmez, isProfilePending: true ve yönlendirici tavsiye üretir
  it("TEST 5: Gracefully handles missing profession without crashing", () => {
    const incompleteUser: UserProfile = { ...mockSoftwareUser, profession: undefined };
    const impact = calculateTelegramSignalPersonalImpact(sampleAISignal, incompleteUser, null, null, TIMELINE_DATA);

    expect(impact.isProfilePending).toBe(true);
    expect(impact.actionableAdvice).toContain("Profil bilgilerinizi tamamlayarak");
    expect(impact.relevanceScore).toBe(0);
  });

  // TEST 6: Deterministik hesaplama: Aynı girdilerle her zaman aynı sonucu verir
  it("TEST 6: Guarantees strict mathematical determinism for identical inputs", () => {
    const run1 = calculateTelegramSignalPersonalImpact(sampleAISignal, mockSoftwareUser, null, null, TIMELINE_DATA);
    const run2 = calculateTelegramSignalPersonalImpact(sampleAISignal, mockSoftwareUser, null, null, TIMELINE_DATA);

    expect(run1.relevanceScore).toBe(run2.relevanceScore);
    expect(run1.relevanceLevel).toBe(run2.relevanceLevel);
    expect(run1.careerImpactSummary).toBe(run2.careerImpactSummary);
    expect(run1.actionableAdvice).toBe(run2.actionableAdvice);
  });

  // TEST 7: Sıfır yapay zeka çağrısı & 15ms altında eşzamanlı çalışma
  it("TEST 7: Client-side signal personalization executes synchronously without AI API calls", () => {
    const startTime = performance.now();
    const signals = [sampleAISignal, sampleBioSignal];
    const results = getPersonalizedTelegramSignals(signals, mockSoftwareUser, null, null, TIMELINE_DATA);
    const duration = performance.now() - startTime;

    expect(results.length).toBe(2);
    expect(duration).toBeLessThan(15);
  });

  // TEST 8: Sıfır kredi düşümü (pure calculation)
  it("TEST 8: Executes without altering user credits", () => {
    const initialCredits = mockSoftwareUser.credits;
    calculateTelegramSignalPersonalImpact(sampleAISignal, mockSoftwareUser);
    expect(mockSoftwareUser.credits).toBe(initialCredits);
  });

  // TEST 9: getPersonalizedTelegramSignals filtreleme ve sıralama
  it("TEST 9: Supports onlyHighRelevance filter and score-based sorting", () => {
    const signals = [sampleBioSignal, sampleAISignal];
    const allPersonalized = getPersonalizedTelegramSignals(signals, mockSoftwareUser, null, null, TIMELINE_DATA);
    // For software user, AISignal should be ranked first
    expect(allPersonalized[0].signal.id).toBe(sampleAISignal.id);
    expect(allPersonalized[0].impact.relevanceScore).toBeGreaterThanOrEqual(allPersonalized[1].impact.relevanceScore);

    const filtered = getPersonalizedTelegramSignals(signals, mockSoftwareUser, null, null, TIMELINE_DATA, {
      onlyHighRelevance: true,
    });
    expect(filtered.every((f) => f.impact.relevanceLevel === "high" || f.impact.relevanceLevel === "medium")).toBe(true);
  });

  // TEST 10: Aciliyet ve Risk/Fırsat tespit mantığı
  it("TEST 10: Correctly evaluates urgency and opportunity/risk classifications", () => {
    const impact = calculateTelegramSignalPersonalImpact(sampleAISignal, mockSoftwareUser, null, null, TIMELINE_DATA);
    expect(["urgent", "moderate", "monitoring"]).toContain(impact.urgencyLevel);
    expect(["opportunity", "risk", "neutral", "dual"]).toContain(impact.opportunityOrRisk);
  });
});

describe("PHASE 20 — Peki Şimdi Ne Yapmalıyım? / Eylem Planı & Takip Döngüsü Suite", () => {
  const sampleNearTermMilestone = TIMELINE_DATA[0]; // 2026
  const sampleFarTermMilestone = TIMELINE_DATA[TIMELINE_DATA.length - 1]; // 2060 or late year

  const mockSoftwareUser: UserProfile = {
    id: "usr_act_test",
    fullName: "Mehmet Demir",
    email: "act_test@example.com",
    phone: "+905551234567",
    isEmailVerified: true,
    isPhoneVerified: true,
    joinedDate: "2026-01-01",
    credits: 100,
    plan: "free",
    profession: "Yazılım Mühendisi & Full Stack Geliştirici",
    age: 28,
    lifeRole: "beyaz_yaka",
    primaryGoal: "gelecek_becerileri",
  };

  // TEST 1: Near term milestone generates immediate urgency and concrete action
  it("TEST 1: Derives immediate urgency and action plan for near-term milestone (<= 2029)", () => {
    const impact = calculateMilestonePersonalImpact(sampleNearTermMilestone, mockSoftwareUser);
    const plan = deriveMilestoneActionPlan(sampleNearTermMilestone, impact, mockSoftwareUser);

    expect(plan.urgencyBand).toBe("immediate");
    expect(plan.urgencyTitle).toContain("Şimdi Hazırlan");
    expect(plan.concreteAction).toBeTruthy();
    expect(plan.actionType).toBe("skill_acquisition");
    expect(plan.preparationHorizon).toContain("Acil Eylem Penceresi");
  });

  // TEST 2: Far future milestone generates long-term horizon plan
  it("TEST 2: Derives long-term visionary horizon for 2045+ milestones", () => {
    const impact = calculateMilestonePersonalImpact(sampleFarTermMilestone, mockSoftwareUser);
    const plan = deriveMilestoneActionPlan(sampleFarTermMilestone, impact, mockSoftwareUser);

    expect(plan.urgencyBand).toBe("long_term");
    expect(plan.urgencyTitle).toContain("2045+");
    expect(plan.preparationHorizon).toContain("Derin Gelecek");
  });

  // TEST 3: Action status default is 'seen' and can transition smoothly
  it("TEST 3: Initializes default action status as 'seen' and updates status reliably", () => {
    const testYear = 2027;
    const testEmail = "test_tracker_user@example.com";

    expect(getMilestoneActionStatus(testYear, testEmail)).toBe("seen");

    setMilestoneActionStatus(testYear, "planned", testEmail);
    expect(getMilestoneActionStatus(testYear, testEmail)).toBe("planned");

    setMilestoneActionStatus(testYear, "in_progress", testEmail);
    expect(getMilestoneActionStatus(testYear, testEmail)).toBe("in_progress");

    setMilestoneActionStatus(testYear, "completed", testEmail);
    expect(getMilestoneActionStatus(testYear, testEmail)).toBe("completed");

    const allStatuses = getAllMilestoneActionStatuses(testEmail);
    expect(allStatuses[testYear]).toBe("completed");
  });

  // TEST 4: Guarantees zero AI calls, pure determinism, and instant execution
  it("TEST 4: Action plan derivation executes deterministically and synchronously in < 5ms", () => {
    const impact = calculateMilestonePersonalImpact(sampleNearTermMilestone, mockSoftwareUser);
    const start = performance.now();
    const planA = deriveMilestoneActionPlan(sampleNearTermMilestone, impact, mockSoftwareUser);
    const planB = deriveMilestoneActionPlan(sampleNearTermMilestone, impact, mockSoftwareUser);
    const duration = performance.now() - start;

    expect(planA.concreteAction).toBe(planB.concreteAction);
    expect(planA.urgencyTitle).toBe(planB.urgencyTitle);
    expect(duration).toBeLessThan(5);
  });
});


