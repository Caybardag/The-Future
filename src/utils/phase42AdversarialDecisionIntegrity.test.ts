import { describe, it, expect } from "vitest";
import {
  deriveMilestoneActionPlan,
  setMilestoneSelectedOption,
  setMilestoneReassessmentAcknowledged,
  setMilestoneActionStatus,
  setMilestoneActionNote,
} from "./personalTimelineEngine";
import { Milestone } from "../types";
import { UserProfile } from "../components/UserAuthModal";
import { TIMELINE_DATA } from "../data/timelineData";

describe("AŞAMA 42 & 42.1 — Adversarial Decision Integrity & Dynamic Impact Engine Tests", () => {
  const sampleMilestone: Milestone = TIMELINE_DATA.find((m) => m.year === 2028) || TIMELINE_DATA[0];

  const dummyProfile: UserProfile = {
    id: "test-user-42",
    fullName: "Adversarial Tester",
    email: "adversarial-tester@gelecektakvimi.org",
    phone: "",
    isEmailVerified: true,
    isPhoneVerified: false,
    joinedDate: "2026-01-01",
    credits: 100,
    plan: "pro",
    profession: "Üretim ve Operasyon Mühendisi",
    age: 32,
    industrySector: "Robotik & İleri Üretim",
    primaryGoal: "is_guvencesi",
    primaryGoalLabel: "🛡️ Mevcut işimi ve gelirimi otomasyona karşı %100 güvenceye almak",
    seniority: "mid",
  };

  function testPlan(milestone: Milestone, profile: UserProfile, signals: any[], optionOverride?: "A" | "B" | "C") {
    return deriveMilestoneActionPlan(
      milestone,
      null,
      profile,
      optionOverride || null,
      null,
      null,
      signals
    );
  }

  // =========================================================================
  // TEST A: High TRL but regulatory hurdle / ban / moratorium
  // =========================================================================
  it("TEST A: High TRL with regulatory hurdle/moratorium produces DECELERATING_BOTTLENECK, not blind acceleration", () => {
    const regulatoryBottleneckSignal = {
      id: "sig_reg_01",
      title: "AB Parlamentosu Otonom Robot Dağıtımına Geçici Moratoryum ve Ağır Regülasyon Getirdi",
      summary: "Endüstriyel humanoid robotların güvenlik ve istihdam denetimleri tamamlanana kadar dağıtımı ertelendi.",
      extractedYear: 2028,
      matchedMilestoneYear: 2028,
      category: "Yapay Zeka",
      trlLevel: 8,
      impactVerdict: "DECELERATING_BOTTLENECK",
      matchConfidence: 85,
    };

    const plan = testPlan(sampleMilestone, dummyProfile, [regulatoryBottleneckSignal]);

    expect(plan.impactEffect).toBe("DECELERATING_BOTTLENECK");
    expect(plan.hasLiveBreakthroughAcceleration).toBe(false);
    expect(plan.dynamicHorizonShiftYears).toBeGreaterThanOrEqual(1);
    expect(plan.liveSignalNotice).toContain("Darboğaz & Regülasyon Kısıtı");
    expect(plan.liveSignalNotice).toContain(regulatoryBottleneckSignal.title);
  });

  // =========================================================================
  // TEST B: High TRL but infrastructure / chip shortage / energy deficit
  // =========================================================================
  it("TEST B: High TRL with severe infrastructure/chip shortage delays horizon dynamically", () => {
    const chipShortageSignal = {
      id: "sig_infra_01",
      title: "Küresel Gelişmiş Çip Kıtlığı ve Enerji Darboğazı Nedeniyle Fabrika Robotik Dağıtımları İptal Edildi",
      summary: "Tedarik zinciri çöküşü robot teslimatlarını 2 yıl geriye atıyor.",
      extractedYear: 2028,
      matchedMilestoneYear: 2028,
      category: "Yapay Zeka",
      trlLevel: 7,
      matchConfidence: 80,
    };

    const plan = testPlan(sampleMilestone, dummyProfile, [chipShortageSignal]);

    expect(plan.impactEffect).toBe("DECELERATING_BOTTLENECK");
    expect(plan.dynamicHorizonShiftYears).toBe(2); // severe keyword triggered
    expect(plan.liveSignalNotice).toContain("+2 yıl gecikme");
  });

  // =========================================================================
  // TEST C: High TRL with cost/adoption barrier
  // =========================================================================
  it("TEST C: High TRL with cost barrier & restraint identifies bottleneck", () => {
    const costBarrierSignal = {
      id: "sig_cost_01",
      title: "Yüksek Bakım ve Entegrasyon Maliyet Artışı Kısıtlaması Fabrikaları Tedirgin Etti",
      summary: "Robotik entegrasyon birim maliyetleri beklenenin 3 katına çıktı, yatırımlar durduruldu.",
      extractedYear: 2028,
      matchedMilestoneYear: 2028,
      category: "Yapay Zeka",
      trlLevel: 7,
      matchConfidence: 75,
    };

    const plan = testPlan(sampleMilestone, dummyProfile, [costBarrierSignal]);

    expect(plan.impactEffect).toBe("DECELERATING_BOTTLENECK");
    expect(plan.hasLiveBreakthroughAcceleration).toBe(false);
  });

  // =========================================================================
  // TEST D: Low TRL (TRL 3-4) but early breakthrough research signal
  // =========================================================================
  it("TEST D: Low TRL early breakthrough accelerates by -1 year, never -2 years", () => {
    const earlyLabSignal = {
      id: "sig_early_01",
      title: "Laboratuvar Ölçeğinde Yeni Biyomekanik Aktüatör Başarısı",
      summary: "Akademik pilot çalışma humanoid el hassasiyetini rekor seviyede artırdı.",
      extractedYear: 2028,
      matchedMilestoneYear: 2028,
      category: "Yapay Zeka",
      trlLevel: 4,
      impactVerdict: "HIGH_BREAKTHROUGH",
      matchConfidence: 75,
    };

    const plan = testPlan(sampleMilestone, dummyProfile, [earlyLabSignal]);

    expect(plan.impactEffect).toBe("ACCELERATING");
    expect(plan.hasLiveBreakthroughAcceleration).toBe(true);
    expect(plan.dynamicHorizonShiftYears).toBe(-1); // Not -2
  });

  // =========================================================================
  // TEST E: High TRL for far-future mature deployment
  // =========================================================================
  it("TEST E: TRL 9 with commercial global deployment enables -2 years double shift for distant milestone", () => {
    const distantMilestone: Milestone = {
      ...TIMELINE_DATA[0],
      year: 2036,
      phase: 2,
      category: "Kuantum & Güvenlik",
      title: "Hata Toleranslı Kuantum Süper-Bilgisayarları",
      description: "Ticarileşmiş kuantum işlemciler kriptografi ve simülasyonda standart hale gelir.",
    };

    const matureSignal = {
      id: "sig_mature_01",
      title: "Kuantum Çiplerinde Seri Üretim ve Küresel Dağıtım Başladı",
      summary: "Ticarileşmiş QPU kümesi veri merkezlerine entegre edildi.",
      extractedYear: 2036,
      matchedMilestoneYear: 2036,
      category: "Kuantum",
      trlLevel: 9,
      impactVerdict: "HIGH_BREAKTHROUGH",
      matchConfidence: 95,
    };

    const plan = testPlan(distantMilestone, dummyProfile, [matureSignal]);

    expect(plan.impactEffect).toBe("ACCELERATING");
    expect(plan.dynamicHorizonShiftYears).toBe(-2);
  });

  // =========================================================================
  // TEST F: Conflicting signals (both breakthrough acceleration & bottleneck)
  // =========================================================================
  it("TEST F: Conflicting signals resolve to UNCERTAINTY_CHANGE with neutral net shift and hedging advice", () => {
    // User picked Option C initially
    setMilestoneSelectedOption(sampleMilestone.year, "C", dummyProfile.email);

    const acceleratingSignal = {
      id: "sig_cf_acc",
      title: "Yeni Nesil Humanoid Robotlar Seri Üretim Bandına Girdi",
      summary: "Fabrikalarda tam otonomi sağlandı.",
      matchedMilestoneYear: 2028,
      category: "Yapay Zeka",
      trlLevel: 7,
      impactVerdict: "HIGH_BREAKTHROUGH",
      matchConfidence: 85,
    };

    const deceleratingSignal = {
      id: "sig_cf_dec",
      title: "İş Güvenliği Kurulu Robotik Dağıtımlara Ağır Kısıtlama ve Güvenlik Soruşturması Başlattı",
      summary: "Tüm operasyonlar beklemeye alındı.",
      matchedMilestoneYear: 2028,
      category: "Yapay Zeka",
      trlLevel: 6,
      matchConfidence: 85,
    };

    const plan = testPlan(sampleMilestone, dummyProfile, [acceleratingSignal, deceleratingSignal], "C");

    expect(plan.impactEffect).toBe("UNCERTAINTY_CHANGE");
    expect(plan.dynamicHorizonShiftYears).toBe(0);
    expect(plan.hasLiveBreakthroughAcceleration).toBe(false);
    expect(plan.liveSignalNotice).toContain("Çelişkili Canlı Sinyal Uyarısı");
    expect(plan.decisionReassessment?.needsReassessment).toBe(true);
    expect(plan.decisionReassessment?.reassessmentType).toBe("UNCERTAINTY_HEDGING");
    expect(plan.decisionReassessment?.recommendedAlternativeOption).toBe("B");
  });

  // =========================================================================
  // TEST G: High signal but unrelated category / distant year
  // =========================================================================
  it("TEST G: Signal from unrelated category and far year does not contaminate the milestone", () => {
    const unrelatedSignal = {
      id: "sig_unrelated",
      title: "Genom Düzenlemede CRISPR 3.0 Klinik Onay Aldı",
      summary: "Sağlık sektöründe gen terapisi onaylandı.",
      extractedYear: 2045,
      category: "Biyo-Tıp",
      trlLevel: 9,
      impactVerdict: "HIGH_BREAKTHROUGH",
      matchConfidence: 90,
    };

    const plan = testPlan(sampleMilestone, dummyProfile, [unrelatedSignal]);

    expect(plan.hasLiveBreakthroughAcceleration).toBe(false);
    expect(plan.dynamicHorizonShiftYears).toBe(0);
    expect(plan.liveSignalCount).toBe(0);
  });

  // =========================================================================
  // TEST H: Missing TRL (undefined) handled gracefully
  // =========================================================================
  it("TEST H: Signal without TRL level is parsed accurately using impactVerdict & semantics", () => {
    const noTrlSignal = {
      id: "sig_no_trl",
      title: "Otonom Robotik Sistemlerde Çığır Açan Patent Tescil Edildi",
      summary: "Üretim hatları için devrim niteliğinde motor sürücüsü.",
      matchedMilestoneYear: 2028,
      category: "Yapay Zeka",
      matchConfidence: 80,
    };

    const plan = testPlan(sampleMilestone, dummyProfile, [noTrlSignal]);

    expect(plan.impactEffect).toBe("ACCELERATING");
    expect(plan.dynamicHorizonShiftYears).toBe(-1);
    expect(plan.liveSignalNotice).toBeDefined();
  });

  // =========================================================================
  // TEST I: Low confidence noise (<40) is discarded
  // =========================================================================
  it("TEST I: Low confidence noise signals are ignored by the adversarial guard", () => {
    const noiseSignal = {
      id: "sig_noise_01",
      title: "Doğrulanmamış Forum İddiası: Gizli Robot Fabrikası Açıldı",
      summary: "Kaynağı belirsiz söylenti.",
      matchedMilestoneYear: 2028,
      category: "Yapay Zeka",
      matchConfidence: 25,
      impactVerdict: "IRRELEVANT_NOISE",
    };

    const plan = testPlan(sampleMilestone, dummyProfile, [noiseSignal]);

    expect(plan.liveSignalCount).toBe(0);
    expect(plan.hasLiveBreakthroughAcceleration).toBe(false);
  });

  // =========================================================================
  // TEST J: Duplicate signals deduplicated and do not multiply horizon shift
  // =========================================================================
  it("TEST J: Duplicate signals are deduplicated to prevent phantom compounding shifts", () => {
    const rawSignal = {
      id: "sig_dup_100",
      title: "Yeni Nesil Humanoid Robotlar Seri Üretim Bandına Girdi",
      summary: "Fabrikalarda tam otonomi sağlandı.",
      matchedMilestoneYear: 2028,
      category: "Yapay Zeka",
      trlLevel: 7,
      matchConfidence: 85,
    };

    // 4 duplicate copies of the same signal
    const duplicates = [rawSignal, { ...rawSignal }, { ...rawSignal }, { ...rawSignal }];

    const plan = testPlan(sampleMilestone, dummyProfile, duplicates);

    expect(plan.liveSignalCount).toBe(1); // deduplicated
    expect(plan.dynamicHorizonShiftYears).toBe(-1); // not -4
  });

  // =========================================================================
  // CLOSED-LOOP DECISION REASSESSMENT: Option C + Bottleneck
  // =========================================================================
  it("Reassessment: When User is on Option C (Strategic Leap) and hits Bottleneck, suggests Option B", () => {
    setMilestoneSelectedOption(sampleMilestone.year, "C", dummyProfile.email);
    setMilestoneReassessmentAcknowledged(sampleMilestone.year, false, dummyProfile.email);

    const bottleneck = {
      id: "sig_bottleneck_c",
      title: "AB Güvenlik Kuralları Fabrika Robotlarını Durdurdu",
      summary: "Ağır mevzuat gereksinimleri nedeniyle dağıtımlar askıya alındı.",
      matchedMilestoneYear: 2028,
      category: "Yapay Zeka",
      impactVerdict: "DECELERATING_BOTTLENECK",
      matchConfidence: 90,
    };

    const plan = testPlan(sampleMilestone, dummyProfile, [bottleneck], "C");

    expect(plan.decisionReassessment?.needsReassessment).toBe(true);
    expect(plan.decisionReassessment?.reassessmentType).toBe("BOTTLENECK_PRUDENCE");
    expect(plan.decisionReassessment?.currentOptionId).toBe("C");
    expect(plan.decisionReassessment?.recommendedAlternativeOption).toBe("B");
    expect(plan.decisionReassessment?.reason).toContain("yüksek atıl yatırım riski");
  });

  // =========================================================================
  // CLOSED-LOOP DECISION REASSESSMENT: User Reflection Note Friction Pivot
  // =========================================================================
  it("Reassessment: When user logs friction or low yield in their outcome reflection, triggers OUTCOME_FRICTION_PIVOT", () => {
    setMilestoneSelectedOption(sampleMilestone.year, "C", dummyProfile.email);
    setMilestoneActionStatus(sampleMilestone.year, "in_progress", dummyProfile.email);
    setMilestoneActionNote(sampleMilestone.year, "Uygulamada ciddi verim düşüklüğü ve tıkanma yaşıyorum, bekleneni vermedi.", dummyProfile.email);

    const plan = deriveMilestoneActionPlan(
      sampleMilestone,
      null,
      dummyProfile,
      "C",
      "in_progress",
      "Uygulamada ciddi verim düşüklüğü ve tıkanma yaşıyorum, bekleneni vermedi.",
      []
    );

    expect(plan.decisionReassessment?.needsReassessment).toBe(true);
    expect(plan.decisionReassessment?.reassessmentType).toBe("OUTCOME_FRICTION_PIVOT");
    expect(plan.decisionReassessment?.recommendedAlternativeOption).toBe("B");
  });

  // =========================================================================
  // CLOSED-LOOP DECISION REASSESSMENT: User Retains Decision (Acknowledged)
  // =========================================================================
  it("Reassessment: When user acknowledges and chooses to retain decision, isAcknowledged is true", () => {
    setMilestoneSelectedOption(sampleMilestone.year, "C", dummyProfile.email);
    setMilestoneReassessmentAcknowledged(sampleMilestone.year, true, dummyProfile.email);

    const bottleneck = {
      id: "sig_bottleneck_ack",
      title: "Regülasyon Kısıtı Gecikmesi",
      summary: "Gecikme uyarısı.",
      matchedMilestoneYear: 2028,
      category: "Yapay Zeka",
      impactVerdict: "DECELERATING_BOTTLENECK",
      matchConfidence: 85,
    };

    const plan = deriveMilestoneActionPlan(
      sampleMilestone,
      null,
      dummyProfile,
      "C",
      null,
      null,
      [bottleneck]
    );

    expect(plan.decisionReassessment?.needsReassessment).toBe(true);
    expect(plan.decisionReassessment?.isAcknowledged).toBe(true);
    expect(plan.isReassessmentAcknowledged).toBe(true);
  });
});
