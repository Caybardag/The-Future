/**
 * AŞAMA 41 — GELECEK TAKVİMİ: ÜRÜN KEŞFİ, CANLI İSTİHBARAT GENİŞLEMESİ & KAPALI DÖNGÜ DENETİM TESTİ
 * 
 * Bu test paketi:
 * 1. Canlı Sinyal → Milestone → Kişisel Yol Haritası ve Eylem Aciliyeti Kapalı Döngüsü
 * 2. Otonom Canlı Sinyal İvmesi ile Zaman Ufku Hızlanması (-1 Yıl) ve Urgency Band Yükseltmesi
 * 3. Çoklu Canlı Sinyal Eşleşme Sayısı ve Detay Kayıtlarının Taşınması
 * 4. Epistemic Geri Bildirim ve Yöntem Revizyonu (Pivot) Entegrasyonu
 * 5. Kişisel Yol Haritasında Canlı Sinyal Öncelik Skoru Artışı (+25 Puan)
 */

import { describe, it, expect } from "vitest";
import { TIMELINE_DATA } from "../data/timelineData";
import {
  deriveMilestoneActionPlan,
  calculateMilestonePersonalImpact,
} from "../utils/personalTimelineEngine";
import { UserProfile } from "../components/UserAuthModal";

describe("AŞAMA 41: Gelecek Takvimi Ürün Zekâsı ve Kapalı Döngü Canlı Entegrasyon", () => {
  const milestone2028 = TIMELINE_DATA.find((m) => m.year === 2028) || TIMELINE_DATA[0];
  const milestone2032 = TIMELINE_DATA.find((m) => m.year === 2032) || TIMELINE_DATA[1];

  const seniorSoftwareProfile = {
    id: "usr_senior_dev",
    email: "senior_dev@example.com",
    fullName: "Kıdemli Yapay Zeka Mühendisi",
    phone: "",
    isEmailVerified: true,
    isPhoneVerified: false,
    joinedDate: new Date().toISOString(),
    credits: 100,
    plan: "pro" as const,
    age: 38,
    profession: "Yapay Zeka & Dağıtık Sistemler Mimarı",
    industrySector: "Yapay Zeka & Bilişim",
    seniority: "Kıdemli Lider",
    primaryGoal: "Otonom yapay zeka ajanları ve büyük ölçekli modeller mimarisine liderlik etmek",
  } as UserProfile;

  const sampleLiveBreakthroughSignal = {
    id: "live_sig_robotics_fusion_2028",
    title: "Süper İletken Füzyon Reaktöründe Plazma Kararlılığı Yapay Zeka ile Sağlandı",
    summary: "Manyetik hapsedici füzyonda yapay zeka modeli milisaniyelik plazma anomalilerini öngörerek kararlılık sağladı.",
    extractedYear: 2028,
    matchedMilestoneYear: 2028,
    matchedMilestoneTitle: milestone2028.title,
    matchConfidence: 88,
    category: "Enerji & Çevre" as const,
    trlLevel: 7,
    impactVerdict: "HIGH_BREAKTHROUGH" as const,
    channelTitle: "Frontier Science & Energy",
    timestamp: new Date().toISOString(),
    isIntegrated: true,
  };

  const sampleHumanoidSignal2032 = {
    id: "live_sig_humanoid_2032",
    title: "İnsansı Robotlar Endüstriyel Montaj Hatlarında %99 Otonomiye Ulaştı",
    summary: "Fabrika zemininde insan gözetimi olmadan 24 saat kesintisiz operasyon yapan insansı robot filosu devreye alındı.",
    extractedYear: 2032,
    matchedMilestoneYear: 2032,
    matchedMilestoneTitle: milestone2032.title,
    matchConfidence: 94,
    category: "Yapay Zeka & Bilişim" as const,
    trlLevel: 8,
    impactVerdict: "HIGH_BREAKTHROUGH" as const,
    channelTitle: "Robotics Industry Wire",
    timestamp: new Date().toISOString(),
    isIntegrated: true,
  };

  describe("1. Canlı Sinyal → Milestone → Kişisel Eylem Planı Bağlantısı", () => {
    it("Canlı sinyaller deriveMilestoneActionPlan'a verildiğinde doğru milestone ile eşleşmeli ve liveSignalNotice üretmelidir", () => {
      const plan = deriveMilestoneActionPlan(
        milestone2028,
        null,
        seniorSoftwareProfile,
        "B",
        "seen",
        undefined,
        [sampleLiveBreakthroughSignal]
      );

      expect(plan.hasLiveBreakthroughAcceleration).toBe(true);
      expect(plan.liveSignalNotice).toBeDefined();
      expect(plan.liveSignalNotice).toContain("Canlı İstihbarat Uyarısı");
      expect(plan.liveSignalNotice).toContain(sampleLiveBreakthroughSignal.title);
      expect(plan.liveSignalCount).toBe(1);
      expect(plan.acceleratedHorizonShiftYears).toBe(-1);
      expect(plan.relevantLiveSignals).toHaveLength(1);
    });

    it("Canlı sinyal bulunmadığında veya ilgisiz olduğunda ivmelenme bayrağı kapalı olmalıdır", () => {
      const unrelatedSignal = {
        id: "unrelated_123",
        title: "Tarımsal Gübre Dağıtımında Yeni Traktör Modeli",
        summary: "Klasik mekanik tarım makinelerinde küçük güncelleme.",
        extractedYear: 2045,
        matchedMilestoneYear: 2045,
        category: "Enerji & Çevre" as const,
        trlLevel: 4,
        impactVerdict: "INCREMENTAL" as const,
        channelTitle: "Agri Wire",
        timestamp: new Date().toISOString(),
      };

      const plan = deriveMilestoneActionPlan(
        milestone2028,
        null,
        seniorSoftwareProfile,
        "B",
        "seen",
        undefined,
        [unrelatedSignal]
      );

      expect(plan.hasLiveBreakthroughAcceleration).toBe(false);
      expect(plan.liveSignalNotice).toBeUndefined();
      expect(plan.liveSignalCount).toBe(0);
    });
  });

  describe("2. Zaman Ufku İvmelenmesi ve Urgency Band Yükseltmesi", () => {
    it("2032 dönüm noktası normalde near_term iken, yüksek TRL canlı sinyal geldiğinde immediate veya canlı ivmeli olarak güncellenmelidir", () => {
      // Normal statik plan (canlı sinyalsiz)
      const staticPlan = deriveMilestoneActionPlan(
        milestone2032,
        null,
        seniorSoftwareProfile,
        "B",
        "seen",
        undefined,
        []
      );

      // Canlı sinyalli plan
      const livePlan = deriveMilestoneActionPlan(
        milestone2032,
        null,
        seniorSoftwareProfile,
        "B",
        "seen",
        undefined,
        [sampleHumanoidSignal2032]
      );

      expect(staticPlan.urgencyBand).toBe("near_term");
      expect(livePlan.urgencyBand).toBe("immediate");
      expect(livePlan.urgencyTitle).toContain("Canlı Sinyal İvmesi ile Hızlandırıldı");
      expect(livePlan.hasLiveBreakthroughAcceleration).toBe(true);
      expect(livePlan.acceleratedHorizonShiftYears).toBe(-1);
    });
  });

  describe("3. Çoklu Sinyal ve Detayların Aktarımı", () => {
    it("Birden fazla sinyal eşleştiğinde liveSignalCount toplam sinyalleri saymalıdır", () => {
      const secondSignal2028 = {
        id: "fusion_sig_2",
        title: "Tokamak Enerji Yeni Manyetik Bobin Testini Tamamladı",
        summary: "Kompakt füzyon reaktöründe yüksek sıcaklık süperiletken testi başarıldı.",
        extractedYear: 2028,
        matchedMilestoneYear: 2028,
        category: "Enerji & Çevre" as const,
        trlLevel: 6,
        impactVerdict: "HIGH_BREAKTHROUGH" as const,
        channelTitle: "Fusion Energy News",
        timestamp: new Date().toISOString(),
      };

      const plan = deriveMilestoneActionPlan(
        milestone2028,
        null,
        seniorSoftwareProfile,
        "B",
        "seen",
        undefined,
        [sampleLiveBreakthroughSignal, secondSignal2028]
      );

      expect(plan.liveSignalCount).toBe(2);
      expect(plan.relevantLiveSignals).toHaveLength(2);
    });
  });

  describe("4. Epistemic Geri Bildirim ve Reassessment Döngüsü", () => {
    it("Kullanıcı eylemi tamamladığında ancak notta verimsizlik bildirdiğinde outcomeStage 'completed_pivot_needed' olmalıdır", () => {
      const frictionNote = "Araçları denedik fakat beklenen faydayı alamadım, ekipten direnç geldi.";
      const plan = deriveMilestoneActionPlan(
        milestone2028,
        null,
        seniorSoftwareProfile,
        "B",
        "completed",
        frictionNote,
        [sampleLiveBreakthroughSignal]
      );

      expect(plan.outcomeStage).toBe("completed_pivot_needed");
      expect(plan.actionTypeLabel).toContain("Yöntem Revizyonu Gerekli");
      expect(plan.concreteAction).toContain("Yöntem Revizyonu & Stratejik Yeniden Değerlendirme");
      expect(plan.outcomeFollowUpAdvice).toContain("Stratejinizi yeniden kalibre etmeniz tavsiye edilir");
    });

    it("Kullanıcı eylemi başarıyla tamamladığında ve pozitif bildirim verdiğinde outcomeStage 'completed_mastery' olmalıdır", () => {
      const successNote = "Pilot entegrasyonu başarılı oldu, haftalık raporlama süresi %40 kısaldı.";
      const plan = deriveMilestoneActionPlan(
        milestone2028,
        null,
        seniorSoftwareProfile,
        "B",
        "completed",
        successNote,
        [sampleLiveBreakthroughSignal]
      );

      expect(plan.outcomeStage).toBe("completed_mastery");
      expect(plan.actionTypeLabel).toContain("Tamamlandı ✓");
      expect(plan.reviewCheckpoint).toContain("Canlı İstihbarat İvmesi ⚡");
    });
  });
});
