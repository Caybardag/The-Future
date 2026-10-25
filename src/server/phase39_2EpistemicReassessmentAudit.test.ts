/**
 * AŞAMA 39.2 — EPISTEMIC REGRESSION, GERÇEK REASSESSMENT VE OUTCOME/STATUS AYRIMI DENETİM TESTİ
 * 
 * Bu test paketi:
 * 1. EPISTEMIC REGRESSION SCAN:
 *    Model tarafından tahmin edilen veya yıldan türetilen TRL değerlerinin asla FACT/VERIFIED
 *    olarak maskelenmediğini, "Model Tahmini" epistemik disiplininin korunduğunu doğrular.
 * 2. OUTCOME ≠ COMPLETED AYRIMI:
 *    "completed" durumunun yalnızca kullanıcının eylem adımlarını tamamladığını (STATUS)
 *    gösterdiğini; harici ampirik başarı kanıtı olmaksızın OUTCOME'un 'NOT_COMPUTED' kaldığını kanıtlar.
 * 3. GERÇEK REVIEW REASSESSMENT DÖNGÜSÜ (4 VAKA KARŞILAŞTIRMASI):
 *    - CASE 1: status = planned (Hazırlık)
 *    - CASE 2: status = completed (Stabilizasyon & Metrik Takibi)
 *    - CASE 3: completed + userReflectionNote = "Beklenen faydayı alamadım" (Acil Yöntem Revizyonu & Pivot)
 *    - CASE 4: completed + Canlı Atılım İstihbaratı (3 Aylık Hızlandırılmış Gözden Geçirme)
 * 4. USER REFLECTION NOTE REASSESSMENT:
 *    Kullanıcı notunun yalnızca pasif bir depolama alanı olmadığını; verim düşüklüğü bildiriminde
 *    aksiyonu, tavsiyeyi ve denetim aralığını aktif olarak revize ettiğini kanıtlar.
 * 5. LIVE INTELLIGENCE → DECISION:
 *    Yüksek etkili canlı istihbarat sinyalinin risk yorumunu ve denetim sıklığını somut olarak değiştirdiğini kanıtlar.
 * 6. DECISION UTILITY EPİSTEMİK SINIFLANDIRMASI:
 *    A/B/C seçeneklerinin roadmap skor katkısının ampirik kesinlik değil USER_PREFERENCE (Heuristic) olduğunu doğrular.
 */

import { describe, it, expect, beforeEach } from "vitest";
import {
  deriveMilestoneActionPlan,
  getMilestoneActionStatus,
  setMilestoneActionStatus,
  getMilestoneActionNote,
  setMilestoneActionNote,
  LiveIntelligenceSignal,
} from "../utils/personalTimelineEngine";
import { safeStorage } from "../utils/safeStorage";
import { Milestone } from "../types";
import { UserProfile } from "../components/UserAuthModal";

describe("AŞAMA 39.2: EPISTEMIC REGRESSION, GERÇEK REASSESSMENT VE OUTCOME/STATUS AYRIMI DENETİMİ", () => {
  beforeEach(() => {
    safeStorage.clear();
  });

  const milestone2028: Milestone = {
    year: 2028,
    title: "Yapay Genel Zeka (AGI) ve Otonom Kodlama Sistemleri",
    category: "Yapay Zeka & Bilişim",
    description: "Yazılım geliştirme süreçlerinin %80'inin otonom ajan filoları tarafından icra edildiği dönüm noktası.",
    probability: 85,
    impactLevel: 90,
    phase: 1,
    iconName: "Cpu",
    humanAugmentationIndex: 80,
    aiAutonomyIndex: 85,
    bioDigitalIntegrationRate: 60,
    dailyLifeImpact: "Yazılım iş akışları otonomlaşır.",
    ethicalRisks: ["İkame riski"],
    societalOpportunities: ["Verimlilik artışı"],
    relatedYears: [2026, 2030],
    keyDrivers: ["Büyük Dil Modelleri", "Ajan Ağları"],
  };

  const softwareSeniorProfile: UserProfile = {
    id: "usr-dev-35",
    fullName: "Mehmet Mühendis",
    email: "mehmet.dev@example.com",
    phone: "+905550000003",
    isEmailVerified: true,
    isPhoneVerified: true,
    joinedDate: "2026-01-01",
    credits: 100,
    plan: "pro",
    profession: "Kıdemli Yazılım Geliştirici",
    seniority: "senior",
    age: 35,
    primaryGoal: "büyüme ve stratejik liderlik",
    industrySector: "Teknoloji & Yazılım",
    employmentStatus: "employed",
  };

  const liveBreakthroughSignal: LiveIntelligenceSignal = {
    id: "sig-ai-2028-breakthrough",
    title: "Otonom Kodlama Ajanlarında %92 Sıçrama ve Endüstriyel Pilot Başarısı",
    summary: "Büyük Dil Modelleri tabanlı çoklu ajan ağları, kurumsal üretim ortamında insan müdahalesiz kod üretiminde ilk büyük saha başarısını gösterdi.",
    extractedYear: 2028,
    category: "Yapay Zeka & Bilişim",
    trlLevel: 7,
    impactVerdict: "HIGH_BREAKTHROUGH",
    confidenceScore: 92,
    sourceChannel: "@ai_frontier_telemetry",
    publishedAt: "2026-10-15T10:00:00Z",
  };

  // ─────────────────────────────────────────────────────────────────────────────
  // 1. EPISTEMIC REGRESSION SCAN: TRL DOĞRULUK SINIFLANDIRMASI
  // ─────────────────────────────────────────────────────────────────────────────
  describe("1. Epistemic Discipline: TRL ve Projeksiyon Düzeyi Sınıflandırması", () => {
    it("Model projeksiyonundan türetilen eylem planı ampirik kesinlik (FACT) iddiasında bulunmaz", () => {
      const plan = deriveMilestoneActionPlan(milestone2028, null, softwareSeniorProfile, "B", "seen");
      
      // Provenance deterministik olarak model profiline dayalı olmalıdır
      expect(plan.recommendationProvenance).toBe("model_profile_derived");
      // Zaman maliyeti ve beklenen değer açıkça Heuristic ve Projeksiyon olarak etiketlenmelidir
      expect(plan.timeCost).toContain("Model Heuristic");
      expect(plan.expectedValue).toContain("model projeksiyonu");
      expect(plan.expectedValue).not.toContain("FACT_PROVEN");
      expect(plan.concreteAction).not.toContain("GARANTİ EDİLEN SONUÇ");
    });
  });

  // ─────────────────────────────────────────────────────────────────────────────
  // 2. OUTCOME ≠ COMPLETED AYRIMI (STATUS VS REAL OUTCOME)
  // ─────────────────────────────────────────────────────────────────────────────
  describe("2. Outcome ≠ Completed: Durum ile Gerçek Dünya Sonucu Ayrımı", () => {
    it("Kullanıcı eylemi 'completed' olarak işaretlediğinde sistem sahte ampirik başarı üretmez; OUTCOME = NOT_COMPUTED kalır", () => {
      const completedPlanWithoutNote = deriveMilestoneActionPlan(
        milestone2028,
        null,
        softwareSeniorProfile,
        "B",
        "completed"
      );

      // Status 'completed' olmalıdır
      expect(completedPlanWithoutNote.actionStatus).toBe("completed");
      // Fakat harici ölçüm veya kullanıcı notu olmadığından gerçek dünya sonucu raporlanmamış ve NOT_COMPUTED olmalıdır
      expect(completedPlanWithoutNote.realWorldOutcomeStatus).toBe("not_reported");
      expect(completedPlanWithoutNote.outcomeVerificationEvidence).toBe("NOT_COMPUTED");
      // Tavsiye metni kullanıcının adımları tamamladığını belirtirken sonucun henüz değerlendirilmediğini açıkça vurgular
      expect(completedPlanWithoutNote.outcomeFollowUpAdvice).toContain("Eylemi tamamlandı olarak işaretlediniz. Sonuç henüz değerlendirilmedi.");
    });

    it("Sistem kullanıcı eylemi tamamladığında sahte ROI yüzdesi veya uydurma verimlilik rakamı üretmez", () => {
      const plan = deriveMilestoneActionPlan(milestone2028, null, softwareSeniorProfile, "C", "completed");
      
      expect(plan.expectedValue).not.toContain("%100 Kesin Başarı");
      expect(plan.expectedValue).not.toContain("Garantili Maaş Artışı");
      expect(plan.expectedValue).toContain("Model Projeksiyonu");
    });
  });

  // ─────────────────────────────────────────────────────────────────────────────
  // 3. GERÇEK REVIEW REASSESSMENT DÖNGÜSÜ (4 VAKA KARŞILAŞTIRMASI)
  // ─────────────────────────────────────────────────────────────────────────────
  describe("3. Review Reassessment: 4 Farklı Durumda Deterministik Davranış Farkı", () => {
    it("CASE 1 (planned), CASE 2 (completed), CASE 3 (completed + sürtünme notu), CASE 4 (completed + canlı sinyal) çıktılarının deterministik olarak ayrıştığını kanıtlar", () => {
      // CASE 1: Planned
      const case1_planned = deriveMilestoneActionPlan(
        milestone2028,
        null,
        softwareSeniorProfile,
        "B",
        "planned"
      );

      // CASE 2: Completed (No reflection note)
      const case2_completed = deriveMilestoneActionPlan(
        milestone2028,
        null,
        softwareSeniorProfile,
        "B",
        "completed"
      );

      // CASE 3: Completed + Friction Note ("Beklenen faydayı alamadım")
      const case3_pivot = deriveMilestoneActionPlan(
        milestone2028,
        null,
        softwareSeniorProfile,
        "B",
        "completed",
        "Beklenen faydayı alamadım, mevcut araçlar iş akışımıza uymadı."
      );

      // CASE 4: Completed + New Live Breakthrough Signal
      const case4_liveBreakthrough = deriveMilestoneActionPlan(
        milestone2028,
        null,
        softwareSeniorProfile,
        "B",
        "completed",
        undefined,
        [liveBreakthroughSignal]
      );

      // 1. Review Checkpoints Farkı
      expect(case1_planned.reviewCheckpoint).toContain("Planlandı 📅 — Başlangıç Hazırlık Kontrolü: 60 Gün Sonra");
      expect(case2_completed.reviewCheckpoint).toContain("Tamamlandı (Değerlendirme Bekliyor) — İlk Sonuç Gözden Geçirmesi: 30–60 Gün Sonra");
      expect(case3_pivot.reviewCheckpoint).toContain("Acil Yeniden Değerlendirme & Yöntem Revizyonu: 14–30 Gün Sonra");
      expect(case4_liveBreakthrough.reviewCheckpoint).toContain("Canlı İstihbarat İvmesi ⚡ — Hızlandırılmış Gözden Geçirme: 3 Ay Sonra");

      // 2. Concrete Action Farkı
      expect(case1_planned.concreteAction).not.toContain("Sonuç Değerlendirmesi Bekleniyor");
      expect(case2_completed.concreteAction).toContain("Sonuç Değerlendirmesi Bekleniyor");
      expect(case3_pivot.concreteAction).toContain("Yöntem Revizyonu & Stratejik Yeniden Değerlendirme");
      expect(case3_pivot.concreteAction).toContain("Yol A veya Yol C"); // Alternatif yol önerisi

      // 3. Outcome Stage Farkı
      expect(case1_planned.outcomeStage).toBe("preparation");
      expect(case2_completed.outcomeStage).toBe("completed_unreviewed");
      expect(case3_pivot.outcomeStage).toBe("completed_pivot_needed");

      // 4. Real World Outcome Status Farkı
      expect(case2_completed.realWorldOutcomeStatus).toBe("not_reported");
      expect(case3_pivot.realWorldOutcomeStatus).toBe("low_yield_friction");
      expect(case3_pivot.outcomeVerificationEvidence).toBe("USER_REPORTED_SIGNAL");

      // 5. Live Breakthrough Indicator Farkı
      expect(case2_completed.hasLiveBreakthroughAcceleration).toBeFalsy();
      expect(case4_liveBreakthrough.hasLiveBreakthroughAcceleration).toBe(true);
      expect(case4_liveBreakthrough.liveSignalNotice).toContain("Otonom Kodlama Ajanlarında %92 Sıçrama");
      expect(case4_liveBreakthrough.risk).toContain("Canlı Sinyal İvmelenmesi");
    });
  });

  // ─────────────────────────────────────────────────────────────────────────────
  // 4. USER REFLECTION NOTE REASSESSMENT (NOTE STORAGE + DECISION EFFECT)
  // ─────────────────────────────────────────────────────────────────────────────
  describe("4. User Reflection Note: Geri Bildirimin Eylemi ve Gözden Geçirmeyi Yeniden Şekillendirmesi", () => {
    it("Kullanıcı eylem notunda olumlu adaptasyon bildirdiğinde 'user_reported_positive' statüsü oluşur", () => {
      const positivePlan = deriveMilestoneActionPlan(
        milestone2028,
        null,
        softwareSeniorProfile,
        "B",
        "completed",
        "Ajan orkestrasyonunu başarıyla üretim ortamına entegre ettik, verimli oldu."
      );

      expect(positivePlan.outcomeStage).toBe("completed_unreviewed");
      expect(positivePlan.realWorldOutcomeStatus).toBe("user_reported_positive");
      expect(positivePlan.outcomeVerificationEvidence).toBe("USER_REPORTED_SIGNAL");
      expect(positivePlan.userReflectionNote).toBe("Ajan orkestrasyonunu başarıyla üretim ortamına entegre ettik, verimli oldu.");
    });

    it("Kullanıcı notunda verim alamadığını (sürtünme) belirttiğinde sistem eylemi 'completed_pivot_needed' durumuna geçirir ve 14-30 günlük acil kontrol atar", () => {
      setMilestoneActionNote(2028, "Verim alamadım, ekip araçlara uyum sağlayamadı.", softwareSeniorProfile.email);
      setMilestoneActionStatus(2028, "completed", softwareSeniorProfile.email);

      const planFromStorage = deriveMilestoneActionPlan(milestone2028, null, softwareSeniorProfile, "B");

      expect(planFromStorage.outcomeStage).toBe("completed_pivot_needed");
      expect(planFromStorage.realWorldOutcomeStatus).toBe("low_yield_friction");
      expect(planFromStorage.actionTypeLabel).toContain("Tamamlandı — Yöntem Revizyonu Gerekli ⚠️");
      expect(planFromStorage.reviewCheckpoint).toContain("Acil Yeniden Değerlendirme & Yöntem Revizyonu: 14–30 Gün Sonra");
      expect(planFromStorage.timeCost).toContain("Pivot Süreci");
    });
  });

  // ─────────────────────────────────────────────────────────────────────────────
  // 5. LIVE INTELLIGENCE → DECISION IMPACT
  // ─────────────────────────────────────────────────────────────────────────────
  describe("5. Live Intelligence: Canlı Kanıtın Gözden Geçirme Takvimi ve Risk Yorumuna Etkisi", () => {
    it("İlgisiz kategorideki bir canlı sinyal 2028 Yapay Zeka eylem planını etkilemez (Negatif İzolasyon Testi)", () => {
      const unrelatedSignal: LiveIntelligenceSignal = {
        id: "sig-unrelated",
        title: "Derin Uzay Radyasyon Kalkanında Yeni Polimer Geliştirildi",
        summary: "Uzay araştırmaları için yeni radyasyon kalkanı test edildi.",
        extractedYear: 2038,
        category: "Uzay & Fizik",
        trlLevel: 4,
        impactVerdict: "EARLY_RESEARCH",
        confidenceScore: 70,
        publishedAt: "2026-10-15T10:00:00Z",
      };

      const planWithUnrelated = deriveMilestoneActionPlan(
        milestone2028,
        null,
        softwareSeniorProfile,
        "B",
        "completed",
        undefined,
        [unrelatedSignal]
      );

      expect(planWithUnrelated.hasLiveBreakthroughAcceleration).toBeFalsy();
      expect(planWithUnrelated.liveSignalNotice).toBeUndefined();
      expect(planWithUnrelated.reviewCheckpoint).toContain("30–60 Gün Sonra");
    });
  });

  // ─────────────────────────────────────────────────────────────────────────────
  // 6. NEGATİF TESTLER (EPISTEMIC & CAUSAL INTEGRITY)
  // ─────────────────────────────────────────────────────────────────────────────
  describe("6. Negatif Testler ve Epistemik Bütünlük", () => {
    it("Kullanıcı eylemi 'completed' yaptığında, harici kanıt olmadan gerçek dünya başarısı var kabul edilmez", () => {
      const plan = deriveMilestoneActionPlan(milestone2028, null, softwareSeniorProfile, "B", "completed");
      expect(plan.realWorldOutcomeStatus).not.toBe("validated_positive");
      expect(plan.outcomeVerificationEvidence).toBe("NOT_COMPUTED");
    });

    it("A/B/C seçenekleri ampirik kesinlik değil kullanıcı tercihi (USER_PREFERENCE) olarak değerlendirilir", () => {
      const planA = deriveMilestoneActionPlan(milestone2028, null, softwareSeniorProfile, "A");
      const planB = deriveMilestoneActionPlan(milestone2028, null, softwareSeniorProfile, "B");
      const planC = deriveMilestoneActionPlan(milestone2028, null, softwareSeniorProfile, "C");

      expect(planA.timeCost).toContain("Model Heuristic");
      expect(planB.timeCost).toContain("Model Heuristic");
      expect(planC.timeCost).toContain("Model Heuristic");

      expect(planA.risk).toContain("Risk Düzeyi: Düşük");
      expect(planC.risk).toContain("Risk Düzeyi: Yüksek");
    });
  });
});
