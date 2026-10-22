/**
 * AŞAMA 42 — GELECEK TAKVİMİ: DİNAMİK ETKİ MOTORU, ÇOK YÖNLÜ ZAMAN UFKU & KARAR YENİDEN DEĞERLENDİRME DENETİM TESTİ
 * 
 * Bu test paketi:
 * 1. Dinamik Etki Sınıflandırması: Sabit -1 Yıl kuralının yerini alan çok yönlü analiz (İvmelenme, Darboğaz/Gecikme, Kapsam Genişlemesi)
 * 2. Darboğaz & Regülasyon Kısıtı: Negatif/kısıtlayıcı sinyallerin ufku +1 veya +2 yıl ertelemesi ve temkinli takvim üretmesi
 * 3. Kapalı Döngü Karar Yeniden Değerlendirme (Decision Reassessment):
 *    - Seçenek A (Koruyucu Uyum) seçilmişken yüksek ivmeli sinyal gelmesi durumunda Seçenek B/C tavsiyesi
 *    - Seçenek C (Stratejik Sıçrama) seçilmişken darboğaz sinyali gelmesi durumunda Seçenek B temkin tavsiyesi
 *    - Deneyim notunda verim düşüklüğü bildirildiğinde pivot tavsiyesi
 * 4. Çoklu Teknoloji Bağımlılık Zinciri (Causal Influence Graph) Doğrulaması
 */

import { describe, it, expect } from "vitest";
import { TIMELINE_DATA } from "../data/timelineData";
import {
  deriveMilestoneActionPlan,
  calculateMilestonePersonalImpact,
} from "../utils/personalTimelineEngine";
import { CAUSAL_DEPENDENCY_GRAPH } from "../utils/causalInfluenceEngine";
import { UserProfile } from "../components/UserAuthModal";

describe("AŞAMA 42: Dinamik Etki Motoru ve Karar Yeniden Değerlendirme", () => {
  const milestone2028 = TIMELINE_DATA.find((m) => m.year === 2028) || TIMELINE_DATA[0];
  const milestone2032 = TIMELINE_DATA.find((m) => m.year === 2032) || TIMELINE_DATA[1];
  const milestone2038 = TIMELINE_DATA.find((m) => m.year === 2038) || TIMELINE_DATA[2];

  const seniorSoftwareProfile = {
    id: "usr_architect",
    email: "architect@example.com",
    fullName: "Sistem Mimarı",
    phone: "",
    isEmailVerified: true,
    isPhoneVerified: false,
    joinedDate: new Date().toISOString(),
    credits: 100,
    plan: "pro" as const,
    age: 36,
    profession: "Dağıtık Sistemler Mimarı",
    industrySector: "Yapay Zeka & Bilişim",
    seniority: "Kıdemli Lider",
    primaryGoal: "Otonom yapay zeka ajanları ve büyük ölçekli modeller mimarisine liderlik etmek",
  } as UserProfile;

  const conservativeProfile = {
    id: "usr_sec_focus",
    email: "security_focus@example.com",
    fullName: "Güvenlik Odaklı Geliştirici",
    phone: "",
    isEmailVerified: true,
    isPhoneVerified: false,
    joinedDate: new Date().toISOString(),
    credits: 50,
    plan: "free" as const,
    age: 42,
    profession: "Veri Tabanı Yöneticisi",
    industrySector: "Bilişim",
    seniority: "Kıdemli",
    primaryGoal: "Mevcut işimi ve istikrarımı korumak, güvenlik risklerini minimize etmek",
  } as UserProfile;

  // Test Sinyalleri
  const acceleratingSignalTRL7 = {
    id: "sig_fusion_pilot_2028",
    title: "Süper İletken Füzyon Reaktöründe Plazma Kararlılığı Yapay Zeka ile Sağlandı",
    summary: "Manyetik hapsedici füzyonda yapay zeka modeli milisaniyelik plazma anomalilerini öngörerek kararlılık sağladı.",
    extractedYear: 2028,
    matchedMilestoneYear: 2028,
    category: "Enerji & Çevre" as const,
    trlLevel: 7,
    impactVerdict: "HIGH_BREAKTHROUGH" as const,
    timestamp: new Date().toISOString(),
  };

  const bottleneckSignalRegulatory = {
    id: "sig_quantum_export_ban_2028",
    title: "Kritik Kuantum Çiplerine ve Süper İletken Malzemelere Küresel İhracat Ambargosu ve Regülasyon Yasağı",
    summary: "Uluslararası ticaret komisyonu kuantum algoritmik çiplerine katı ihracat kısıtlaması ve moratoryum getirdi; tedarik zinciri darboğazı nedeniyle ticari dağıtım durduruldu.",
    extractedYear: 2028,
    matchedMilestoneYear: 2028,
    category: "Enerji & Çevre" as const,
    trlLevel: 5,
    impactVerdict: "DECELERATING_BOTTLENECK" as const,
    timestamp: new Date().toISOString(),
  };

  const matureCommercialSignalTRL9 = {
    id: "sig_mature_grid_2038",
    title: "Ticari Orbital Güneş ve Füzyon Santrali Seri Üretim ve Küresel Dağıtım Aşamasına Geçti",
    summary: "Ticari ölçekte enerji üretimi yapan füzyon reaktörleri seri üretim bandına girdi; küresel dağıtım başladı.",
    extractedYear: 2038,
    matchedMilestoneYear: 2038,
    category: "Enerji & Çevre" as const,
    trlLevel: 9,
    impactVerdict: "HIGH_BREAKTHROUGH" as const,
    timestamp: new Date().toISOString(),
  };

  const expandingScopeSignal = {
    id: "sig_cross_industry_bio_2028",
    title: "Biyo-Dijital Temiz Enerji Katalizörleri Çoklu Modalite ile Çapraz Sektör Uygulamalarına Genişledi",
    summary: "Enerji depolama algoritması genel amaçlı endüstriyel kimya ve tarım sektörlerine de entegre edildi.",
    extractedYear: 2028,
    matchedMilestoneYear: 2028,
    category: "Enerji & Çevre" as const,
    trlLevel: 6,
    impactVerdict: "MODERATE_SIGNAL" as const,
    timestamp: new Date().toISOString(),
  };

  describe("1. Dinamik Zaman Ufku ve Etki Türü Sınıflandırması", () => {
    it("Hızlandırıcı atılım sinyali (TRL 7) zaman ufkunu -1 yıl ivmelendirmelidir", () => {
      const plan = deriveMilestoneActionPlan(
        milestone2028,
        null,
        seniorSoftwareProfile,
        "B",
        "seen",
        undefined,
        [acceleratingSignalTRL7]
      );

      expect(plan.impactEffect).toBe("ACCELERATING");
      expect(plan.hasLiveBreakthroughAcceleration).toBe(true);
      expect(plan.dynamicHorizonShiftYears).toBe(-1);
      expect(plan.acceleratedHorizonShiftYears).toBe(-1);
      expect(plan.liveSignalNotice).toContain("ivmelenme baskısı");
    });

    it("Olgun ticari atılım (TRL 9 / Seri Üretim) zaman ufkunu -2 yıl ivmelendirebilmelidir", () => {
      const plan = deriveMilestoneActionPlan(
        milestone2038,
        null,
        seniorSoftwareProfile,
        "B",
        "seen",
        undefined,
        [matureCommercialSignalTRL9]
      );

      expect(plan.impactEffect).toBe("ACCELERATING");
      expect(plan.dynamicHorizonShiftYears).toBe(-2);
      expect(plan.acceleratedHorizonShiftYears).toBe(-2);
    });

    it("Regülasyon engeli ve ambargo sinyali ufku +1 veya +2 yıl geciktirmeli ve DECELERATING_BOTTLENECK olarak sınıflamalıdır", () => {
      const plan = deriveMilestoneActionPlan(
        milestone2028,
        null,
        seniorSoftwareProfile,
        "B",
        "seen",
        undefined,
        [bottleneckSignalRegulatory]
      );

      expect(plan.impactEffect).toBe("DECELERATING_BOTTLENECK");
      expect(plan.hasLiveBreakthroughAcceleration).toBe(false);
      expect(plan.dynamicHorizonShiftYears).toBeGreaterThanOrEqual(1);
      expect(plan.liveSignalNotice).toContain("Darboğaz & Regülasyon Kısıtı");
      expect(plan.risk).toContain("Darboğaz & Kısıt Uyarısı");
    });

    it("Kapsam genişleme sinyali zaman ufkunu kaydırmamalı (0 yıl), ancak EXPANDING_SCOPE olarak sınıflamalıdır", () => {
      const plan = deriveMilestoneActionPlan(
        milestone2028,
        null,
        seniorSoftwareProfile,
        "B",
        "seen",
        undefined,
        [expandingScopeSignal]
      );

      expect(plan.impactEffect).toBe("EXPANDING_SCOPE");
      expect(plan.dynamicHorizonShiftYears).toBe(0);
      expect(plan.liveSignalNotice).toContain("Kapsam Genişleme Sinyali");
    });
  });

  describe("2. Kapalı Döngü Karar Yeniden Değerlendirme (Decision Reassessment)", () => {
    it("Kullanıcı Seçenek A (Koruyucu Uyum) seçmişken yüksek atılım sinyali geldiğinde Seçenek B veya C tavsiye edilmelidir", () => {
      const plan = deriveMilestoneActionPlan(
        milestone2028,
        null,
        conservativeProfile,
        "A", // Kullanıcı savunmacı/koruyucu seçti
        "seen",
        undefined,
        [acceleratingSignalTRL7]
      );

      expect(plan.decisionReassessment).toBeDefined();
      expect(plan.decisionReassessment?.needsReassessment).toBe(true);
      expect(plan.decisionReassessment?.reassessmentType).toBe("ACCELERATION_RISK");
      expect(plan.decisionReassessment?.currentOptionId).toBe("A");
      expect(["B", "C"]).toContain(plan.decisionReassessment?.recommendedAlternativeOption);
      expect(plan.decisionReassessment?.reason).toContain("risk altında");
    });

    it("Kullanıcı Seçenek C (Stratejik Sıçrama) seçmişken darboğaz sinyali geldiğinde Seçenek B temkin tavsiyesi üretilmelidir", () => {
      const plan = deriveMilestoneActionPlan(
        milestone2028,
        null,
        seniorSoftwareProfile,
        "C", // Kullanıcı agresif sıçrama seçti
        "seen",
        undefined,
        [bottleneckSignalRegulatory]
      );

      expect(plan.decisionReassessment).toBeDefined();
      expect(plan.decisionReassessment?.needsReassessment).toBe(true);
      expect(plan.decisionReassessment?.reassessmentType).toBe("BOTTLENECK_PRUDENCE");
      expect(plan.decisionReassessment?.currentOptionId).toBe("C");
      expect(plan.decisionReassessment?.recommendedAlternativeOption).toBe("B");
      expect(plan.decisionReassessment?.reason).toContain("yüksek atıl yatırım riski");
    });

    it("Kullanıcı notunda tıkanma/verimsizlik bildirdiğinde OUTCOME_FRICTION_PIVOT tavsiyesi verilmelidir", () => {
      const plan = deriveMilestoneActionPlan(
        milestone2028,
        null,
        seniorSoftwareProfile,
        "C",
        "in_progress",
        "Bu araçlarda aşırı tıkandım ve beklenen faydayı alamadım, ekipten verim alamadık.",
        []
      );

      expect(plan.decisionReassessment).toBeDefined();
      expect(plan.decisionReassessment?.needsReassessment).toBe(true);
      expect(plan.decisionReassessment?.reassessmentType).toBe("OUTCOME_FRICTION_PIVOT");
      expect(plan.decisionReassessment?.recommendedAlternativeOption).toBe("B");
    });

    it("Kullanıcı stratejisi gelen sinyalle uyumlu olduğunda ALIGNMENT_OPTIMAL olarak raporlanmalıdır", () => {
      const plan = deriveMilestoneActionPlan(
        milestone2028,
        null,
        seniorSoftwareProfile,
        "B", // Dengeli hibritleşme
        "seen",
        undefined,
        [acceleratingSignalTRL7]
      );

      expect(plan.decisionReassessment).toBeDefined();
      expect(plan.decisionReassessment?.needsReassessment).toBe(false);
      expect(plan.decisionReassessment?.reassessmentType).toBe("ALIGNMENT_OPTIMAL");
    });
  });

  describe("3. Çoklu Teknoloji Bağımlılık Haritası Doğrulaması", () => {
    it("CAUSAL_DEPENDENCY_GRAPH gerçek çapraz sektör teknoloji bağımlılıklarını barındırmalıdır", () => {
      expect(CAUSAL_DEPENDENCY_GRAPH.length).toBeGreaterThan(0);
      const link2026to2028 = CAUSAL_DEPENDENCY_GRAPH.find(
        (l) => l.sourceYear === 2026 && l.targetYear === 2028
      );
      expect(link2026to2028).toBeDefined();
      expect(link2026to2028?.crossCategoryDomain).toBe("Bilişim -> Enerji");
      expect(link2026to2028?.strength).toBe("critical");
    });
  });
});
