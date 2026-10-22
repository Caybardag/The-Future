/**
 * AŞAMA 39 — DECISION UTILITY, USER CHOICE INTEGRITY VE KAPALI DÖNGÜ (CLOSED LOOP) TESTİ
 * 
 * Bu test paketi:
 * 1. Karar seçeneklerinin (Yol A, B, C) kullanıcı tercihine göre aksiyon planını, zaman maliyetini,
 *    risk seviyesini, yetkinlikleri ve gözden geçirme takvimini gerçek biçimde değiştirdiğini (Closed Loop),
 * 2. Aynı mesleğe sahip kullanıcıların hedeflerine (Büyüme vs Güvenlik) göre varsayılan önerilen karar yolunun ayrıştığını,
 * 3. Kullanıcı tercihlerinin izole ve kalıcı olarak saklandığını,
 * 4. Yol haritası önceliklendirmesinin seçilen karar yollarına göre dinamik olarak güncellendiğini kanıtlar.
 */

import { describe, it, expect, beforeEach } from "vitest";
import {
  deriveMilestoneActionPlan,
  getDomainContextualDecisionOptions,
  getMilestoneSelectedOption,
  setMilestoneSelectedOption,
  getAllMilestoneSelectedOptions,
} from "../utils/personalTimelineEngine";
import { safeStorage } from "../utils/safeStorage";
import { Milestone } from "../types";
import { UserProfile } from "../components/UserAuthModal";

describe("AŞAMA 39: DECISION UTILITY VE KAPALI DÖNGÜ (CLOSED LOOP) KARAR DENETİMİ", () => {
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

  const profileSoftwareGrowth: UserProfile = {
    id: "usr-growth-35",
    fullName: "Barış Gelişim",
    email: "dev-growth@example.com",
    phone: "+905550000001",
    isEmailVerified: true,
    isPhoneVerified: true,
    joinedDate: "2026-01-01",
    credits: 100,
    plan: "free",
    profession: "Kıdemli Yazılım Geliştirici",
    seniority: "senior",
    age: 35,
    primaryGoal: "büyüme ve stratejik liderlik",
    industrySector: "Teknoloji & Yazılım",
  };

  const profileSoftwareSecurity: UserProfile = {
    id: "usr-security-35",
    fullName: "Ahmet Koruma",
    email: "dev-security@example.com",
    phone: "+905550000002",
    isEmailVerified: true,
    isPhoneVerified: true,
    joinedDate: "2026-01-01",
    credits: 100,
    plan: "free",
    profession: "Kıdemli Yazılım Geliştirici",
    seniority: "senior",
    age: 35,
    primaryGoal: "güvenlik ve finansal istikrar",
    industrySector: "Teknoloji & Yazılım",
  };

  // ─────────────────────────────────────────────────────────────────────────────
  // 1. CLOSED-LOOP DECISION SELECTION (YOL A vs YOL B vs YOL C AYRIŞIMI)
  // ─────────────────────────────────────────────────────────────────────────────
  describe("1. Closed-Loop Decision Selection (A / B / C Ayrışımı)", () => {
    it("Kullanıcı Yol A (Koruyucu Uyum) seçtiğinde aksiyon planı düşük risk, düşük zaman maliyeti ve uzun vadeli denetime evrilir", () => {
      const planA = deriveMilestoneActionPlan(milestone2028, null, profileSoftwareGrowth, "A");

      expect(planA.selectedOptionId).toBe("A");
      expect(planA.actionType).toBe("workflow_integration");
      expect(planA.actionTypeLabel).toContain("Koruyucu Uyum");
      expect(planA.timeCost).toContain("1–2 saat");
      expect(planA.risk).toContain("Düşük Risk");
      expect(planA.reviewCheckpoint).toContain("12-18 Ay");
      expect(planA.concreteAction).toContain("kod tamamlama ve birim test desteği");
    });

    it("Kullanıcı Yol B (Dengeli Hibritleşme) seçtiğinde aksiyon planı orta risk, 3-5 saat zaman maliyeti ve ajan orkestrasyonuna evrilir", () => {
      const planB = deriveMilestoneActionPlan(milestone2028, null, profileSoftwareGrowth, "B");

      expect(planB.selectedOptionId).toBe("B");
      expect(planB.actionType).toBe("skill_acquisition");
      expect(planB.actionTypeLabel).toContain("Dengeli Hibritleşme");
      expect(planB.timeCost).toContain("3–5 saat");
      expect(planB.risk).toContain("Orta Risk");
      expect(planB.reviewCheckpoint).toContain("6 Ay");
      expect(planB.concreteAction).toContain("çoklu ajan mimarileri");
    });

    it("Kullanıcı Yol C (Stratejik Sıçrama) seçtiğinde aksiyon planı yüksek risk, 8-10 saat yoğun zaman ve sıkı denetime (30-60 gün) evrilir", () => {
      const planC = deriveMilestoneActionPlan(milestone2028, null, profileSoftwareGrowth, "C");

      expect(planC.selectedOptionId).toBe("C");
      expect(planC.actionType).toBe("strategic_positioning");
      expect(planC.actionTypeLabel).toContain("Stratejik Sıçrama");
      expect(planC.timeCost).toContain("8–10 saat");
      expect(planC.risk).toContain("Yüksek Risk");
      expect(planC.reviewCheckpoint).toContain("30–60 Gün");
      expect(planC.concreteAction).toContain("otonom yapay zeka ürünleri ve dağıtık platformlar");
    });

    it("Aynı dönüm noktası için Yol A, Yol B ve Yol C'nin beklenen değerleri ve gereken yetkinlikleri tamamen ayrışır", () => {
      const planA = deriveMilestoneActionPlan(milestone2028, null, profileSoftwareGrowth, "A");
      const planB = deriveMilestoneActionPlan(milestone2028, null, profileSoftwareGrowth, "B");
      const planC = deriveMilestoneActionPlan(milestone2028, null, profileSoftwareGrowth, "C");

      expect(planA.concreteAction).not.toBe(planB.concreteAction);
      expect(planB.concreteAction).not.toBe(planC.concreteAction);
      expect(planA.timeCost).not.toBe(planC.timeCost);
      expect(planA.risk).not.toBe(planC.risk);
      expect(planA.reviewCheckpoint).not.toBe(planC.reviewCheckpoint);
    });
  });

  // ─────────────────────────────────────────────────────────────────────────────
  // 2. AYNI MESLEK — FARKLI HEDEF (GROWTH VS SECURITY AYRIŞIMI)
  // ─────────────────────────────────────────────────────────────────────────────
  describe("2. Aynı Meslek — Farklı Hedef Ayrışması (Growth vs Security)", () => {
    it("Büyüme hedefli yazılımcı için varsayılan öneri Yol C (Stratejik Sıçrama) iken, güvenlik hedefli yazılımcı için Yol A (Koruyucu Uyum) önerilir", () => {
      const planGrowth = deriveMilestoneActionPlan(milestone2028, null, profileSoftwareGrowth);
      const planSecurity = deriveMilestoneActionPlan(milestone2028, null, profileSoftwareSecurity);

      // Hedefe göre varsayılan önerilen yol farklılaşır
      expect(planGrowth.selectedOptionId).toBe("C");
      expect(planSecurity.selectedOptionId).toBe("A");

      // Önerilen opsiyonun başlığı dinamik olarak '(Önerilen)' etiketi alır
      const growthRec = planGrowth.decisionOptions?.find((o) => o.optionId === "C");
      const securityRec = planSecurity.decisionOptions?.find((o) => o.optionId === "A");

      expect(growthRec?.title).toContain("(Önerilen)");
      expect(securityRec?.title).toContain("(Önerilen)");
    });

    it("Büyüme hedefli profil ile güvenlik hedefli profilin eylem aciliyeti, risk seviyesi ve zaman maliyeti farklıdır", () => {
      const planGrowth = deriveMilestoneActionPlan(milestone2028, null, profileSoftwareGrowth);
      const planSecurity = deriveMilestoneActionPlan(milestone2028, null, profileSoftwareSecurity);

      expect(planGrowth.timeCost).toContain("8–10 saat");
      expect(planSecurity.timeCost).toContain("1–2 saat");

      expect(planGrowth.risk).toContain("Yüksek Risk");
      expect(planSecurity.risk).toContain("Düşük Risk");
    });
  });

  // ─────────────────────────────────────────────────────────────────────────────
  // 3. USER CHOICE PERSISTENCE & USER ISOLATION
  // ─────────────────────────────────────────────────────────────────────────────
  describe("3. Kullanıcı Seçimi Kalıcılığı ve İzolasyonu (Storage Integrity)", () => {
    it("Kullanıcı A'nın Yol C seçimi, Kullanıcı B'nin Yol A seçimi ile karışmaz", () => {
      setMilestoneSelectedOption(2028, "C", "user_a@example.com");
      setMilestoneSelectedOption(2028, "A", "user_b@example.com");

      expect(getMilestoneSelectedOption(2028, "user_a@example.com")).toBe("C");
      expect(getMilestoneSelectedOption(2028, "user_b@example.com")).toBe("A");
      expect(getMilestoneSelectedOption(2028, "user_c@example.com")).toBeNull();
    });

    it("Kullanıcı seçimi kaydedildiğinde deriveMilestoneActionPlan açık argüman verilmeden de o seçimi yükler", () => {
      setMilestoneSelectedOption(2028, "C", profileSoftwareSecurity.email);

      // profileSoftwareSecurity'nin varsayılanı 'A' olsa bile, kullanıcı manuel olarak 'C' seçtiği için 'C' gelmelidir!
      const planWithSavedChoice = deriveMilestoneActionPlan(milestone2028, null, profileSoftwareSecurity);

      expect(planWithSavedChoice.selectedOptionId).toBe("C");
      expect(planWithSavedChoice.isExplicitUserChoice).toBe(true);
      expect(planWithSavedChoice.timeCost).toContain("8–10 saat");
    });

    it("getAllMilestoneSelectedOptions bir kullanıcının tüm kararlarını sözlük olarak döndürür", () => {
      setMilestoneSelectedOption(2028, "C", "test@example.com");
      setMilestoneSelectedOption(2032, "B", "test@example.com");
      setMilestoneSelectedOption(2040, "A", "test@example.com");

      const all = getAllMilestoneSelectedOptions("test@example.com");
      expect(all[2028]).toBe("C");
      expect(all[2032]).toBe("B");
      expect(all[2040]).toBe("A");
      expect(all[2050]).toBeUndefined();
    });
  });

  // ─────────────────────────────────────────────────────────────────────────────
  // 4. MULTI-DOMAIN STRATEGIC DIFFERENTIATION (SAĞLIK, FİNANS, HUKUK)
  // ─────────────────────────────────────────────────────────────────────────────
  describe("4. Çoklu Sektör Stratejik Karar Yolları Ayrışımı", () => {
    it("Doktor / Biyolog profili için Yol A, B ve C tıp ve genomik odaklıdır", () => {
      const bioOpts = getDomainContextualDecisionOptions("Hekim / Biyolog", "Genomik AI", "Biyoloji & Tıp", ["health_bio"], "B");
      const optA = bioOpts.find((o) => o.optionId === "A")!;
      const optB = bioOpts.find((o) => o.optionId === "B")!;
      const optC = bioOpts.find((o) => o.optionId === "C")!;

      expect(optA.requiredSkills).toContain("Biyomedikal Veri Okuryazarlığı");
      expect(optB.requiredSkills).toContain("Moleküler Simülasyon");
      expect(optC.requiredSkills).toContain("Sentetik Biyoloji Mimarisi");
      expect(optB.title).toContain("(Önerilen)");
    });

    it("Finans yöneticisi için Yol A, B ve C mali denetim ve algoritmik risk odaklıdır", () => {
      const finOpts = getDomainContextualDecisionOptions("Finans Direktörü", "Otonom Finans", "Sosyoloji & Ekonomi", ["finance_business"], "B");
      const optA = finOpts.find((o) => o.optionId === "A")!;
      const optB = finOpts.find((o) => o.optionId === "B")!;
      const optC = finOpts.find((o) => o.optionId === "C")!;

      expect(optA.requiredSkills).toContain("Finansal Tablo Otomasyonu");
      expect(optB.requiredSkills).toContain("Algoritmik Finansal Denetim");
      expect(optC.requiredSkills).toContain("Fraksiyonel CFO Analitiği");
    });
  });
});
