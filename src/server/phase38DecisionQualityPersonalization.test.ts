import { describe, it, expect } from "vitest";
import { TIMELINE_DATA } from "../data/timelineData";
import {
  calculateMilestonePersonalImpact,
  deriveMilestoneActionPlan,
} from "../utils/personalTimelineEngine";
import { detectDomainCareerProfile } from "./domainCareerIntel";
import { generateHighFidelitySimulation } from "./offlineFuturologyEngine";
import { UserProfile } from "../components/UserAuthModal";

describe("AŞAMA 38 — GERÇEK KİŞİSELLEŞTİRME, KARAR KALİTESİ & ANALİTİK DEĞER DENETİM SUITE", () => {
  const milestone2029 = TIMELINE_DATA.find((m) => m.year === 2029) || TIMELINE_DATA[0];
  const milestone2031 = TIMELINE_DATA.find((m) => m.year === 2031) || TIMELINE_DATA[1];

  const baseProps = {
    id: "usr_phase38",
    phone: "+905001112233",
    isEmailVerified: true,
    isPhoneVerified: true,
    joinedDate: "2026-01-01",
    credits: 100,
    plan: "pro" as const,
  };

  // PROFILE A: 30 / Senior / Software / Growth
  const profileA: UserProfile = {
    ...baseProps,
    username: "dev_senior_30",
    email: "dev@example.com",
    fullName: "Ali Yazılımcı",
    profession: "Yazılım Geliştirici",
    age: 30,
    seniority: "senior",
    industrySector: "Teknoloji",
    personalGoal: "Kariyer gelişimi / büyüme",
  };

  // PROFILE B: 52 / Senior / Finance / Security
  const profileB: UserProfile = {
    ...baseProps,
    username: "finance_senior_52",
    email: "finance@example.com",
    fullName: "Mehmet Finans",
    profession: "Finans Uzmanı",
    age: 52,
    seniority: "senior",
    industrySector: "Finans",
    personalGoal: "Kariyer güvenliği",
  };

  // PROFILE C: 26 / Junior / Biology / Research
  const profileC: UserProfile = {
    ...baseProps,
    username: "bio_junior_26",
    email: "bio@example.com",
    fullName: "Ayşe Biyolog",
    profession: "Biyolog",
    age: 26,
    seniority: "junior",
    industrySector: "Biyoteknoloji",
    personalGoal: "Araştırma kariyeri",
  };

  // ─────────────────────────────────────────────────────────────────────────────
  // 1. RELEVANCE SCORE / PARAMETRİK MODEL İNDEKSİ DENETİMİ
  // ─────────────────────────────────────────────────────────────────────────────
  describe("1. Alaka Skoru (Relevance Score) Epistemik Sınıflandırması", () => {
    it("Alaka skoru deterministiktir, bilimsel frekans olasılığı değil model indeksidir (15–99 aralığında)", () => {
      const impactA = calculateMilestonePersonalImpact(milestone2029, profileA);
      const impactB = calculateMilestonePersonalImpact(milestone2029, profileB);

      expect(impactA.relevanceScore).toBeGreaterThanOrEqual(15);
      expect(impactA.relevanceScore).toBeLessThanOrEqual(99);
      expect(impactB.relevanceScore).toBeGreaterThanOrEqual(15);
      expect(impactB.relevanceScore).toBeLessThanOrEqual(99);

      // Yazılım mühendisinin 2029 Yapay Zeka dönüm noktasına alaka skoru, finans uzmanından anlamlı derecede yüksektir
      expect(impactA.relevanceScore).toBeGreaterThan(impactB.relevanceScore);
      expect(impactA.relevanceLevel).toBe("high");
    });

    it("Aynı girdi her zaman aynı skoru üretir (katı matematiksel determinizm)", () => {
      const run1 = calculateMilestonePersonalImpact(milestone2029, profileA);
      const run2 = calculateMilestonePersonalImpact(milestone2029, profileA);
      expect(run1.relevanceScore).toBe(run2.relevanceScore);
      expect(run1.careerImpactSummary).toBe(run2.careerImpactSummary);
    });
  });

  // ─────────────────────────────────────────────────────────────────────────────
  // 2. TEK DEĞİŞKENLİ PERTURBATION TESTLERİ (A1, A2, A3, A4, A5)
  // ─────────────────────────────────────────────────────────────────────────────
  describe("2. Tek Değişkenli Perturbation (Hassasiyet) Testleri", () => {
    it("A1 (Yaş Değişimi: 30 -> 55): Yaş projeksiyonu değişir, ileri yaşta kıdemli mentorluk/sağlık perspektifi devreye girer", () => {
      const profileA_age55: UserProfile = { ...profileA, age: 55 };
      const impact30 = calculateMilestonePersonalImpact(milestone2029, profileA);
      const impact55 = calculateMilestonePersonalImpact(milestone2029, profileA_age55);

      expect(impact30.userAgeAtMilestone).toBe(33); // 30 + (2029 - 2026)
      expect(impact55.userAgeAtMilestone).toBe(58); // 55 + (2029 - 2026)
      expect(impact30.userAgeAtMilestone).not.toBe(impact55.userAgeAtMilestone);

      const plan30 = deriveMilestoneActionPlan(milestone2029, impact30, profileA);
      const plan55 = deriveMilestoneActionPlan(milestone2029, impact55, profileA_age55);
      expect(plan30.forWhom).toContain("30");
      expect(plan55.forWhom).toContain("55");
    });

    it("A2 (Meslek Değişimi: Yazılım -> Finans): Sektörel araçlar, görevler ve eylemler tamamen farklılaşır", () => {
      const domSoft = detectDomainCareerProfile(profileA.personalGoal!, profileA.profession!, profileA.seniority, profileA.personalGoal, profileA.industrySector);
      const domFin = detectDomainCareerProfile(profileA.personalGoal!, "Finans Uzmanı", profileA.seniority, profileA.personalGoal, "Finans");

      expect(domSoft.categoryName).toContain("Yazılım");
      expect(domFin.categoryName).toContain("Finans");
      expect(domSoft.recommendedToolsAndFrameworks[0]).toContain("Cursor");
      expect(domFin.recommendedToolsAndFrameworks[0]).toContain("Vic.ai");
      expect(domSoft.obsoleteTasks[0]).not.toBe(domFin.obsoleteTasks[0]);
    });

    it("A3 (Hedef Değişimi: Büyüme -> Güvenlik): Stratejik tavsiye kaldıracı ve regülatif koruma odağı değişir", () => {
      const domGrowth = detectDomainCareerProfile("büyüme", "Yazılım Geliştirici", "senior", "büyüme", "Teknoloji");
      const domSecurity = detectDomainCareerProfile("güvenlik", "Yazılım Geliştirici", "senior", "güvenlik", "Teknoloji");

      expect(domGrowth.personalizedVerdictTemplate).toContain("kaldıraç");
      expect(domSecurity.personalizedVerdictTemplate).toMatch(/güvenlik|güvenliğ/i);
      expect(domGrowth.personalizedVerdictTemplate).not.toBe(domSecurity.personalizedVerdictTemplate);
    });

    it("A4 (Kıdem Değişimi: Senior -> Junior): Rutin otomasyon endeksi ve eylem planı rol seviyesine göre ayrışır", () => {
      const domSenior = detectDomainCareerProfile("gelişim", "Yazılım Geliştirici", "senior", "gelişim", "Teknoloji");
      const domJunior = detectDomainCareerProfile("gelişim", "Yazılım Geliştirici", "junior", "gelişim", "Teknoloji");

      // Senior kıdem düzeyi gereği operasyonel rutinlerden ayrışır, junior ise rutin görevlere daha açıktır
      expect(domSenior.baseAutomationPct).toBe(70); // 82 - 12
      expect(domJunior.baseAutomationPct).toBe(92); // 82 + 10
      expect(domSenior.personalizedVerdictTemplate).toContain("Kıdemli / Liderlik");
      expect(domJunior.personalizedVerdictTemplate).toContain("Erken Kariyer");
    });

    it("A5 (Sektör Değişimi: Teknoloji -> Biyoteknoloji): Sektörel eşleşme ve biyoteknoloji kesişimi değişir", () => {
      const impactTech = calculateMilestonePersonalImpact(milestone2031, profileA);
      const impactBioSector: UserProfile = { ...profileA, industrySector: "Biyoteknoloji" };
      const impactBio = calculateMilestonePersonalImpact(milestone2031, impactBioSector);

      expect(impactBio.relevanceScore).toBeGreaterThanOrEqual(impactTech.relevanceScore);
    });
  });

  // ─────────────────────────────────────────────────────────────────────────────
  // 3. EYLEM PLANI KALİTESİ (WHAT / WHY / FOR WHOM / EXPECTED VALUE / REVERSIBILITY)
  // ─────────────────────────────────────────────────────────────────────────────
  describe("3. Karar Kalitesi & Yapılandırılmış Eylem Çerçevesi (Aşama 38)", () => {
    it("Eylem planı yapılandırılmış WHAT/WHY/FOR WHOM/EXPECTED VALUE/RISK/REVERSIBILITY alanlarını içerir", () => {
      const impact = calculateMilestonePersonalImpact(milestone2029, profileA);
      const plan = deriveMilestoneActionPlan(milestone2029, impact, profileA);

      expect(plan.what).toBeTruthy();
      expect(plan.why).toBeTruthy();
      expect(plan.why).toContain("Yazılım Geliştirici");
      expect(plan.forWhom).toContain("Yazılım Geliştirici");
      expect(plan.expectedValue).toBeTruthy();
      expect(plan.timeCost).toBeTruthy();
      expect(plan.risk).toBeTruthy();
      expect(plan.reversibility).toContain("Yüksek");
      expect(plan.reviewDate).toBeTruthy();
    });

    it("Kullanıcıya tek bir gelecek dayatılmaz; 3 alternatif stratejik karar seçeneği (A/B/C) sunulur", () => {
      const impact = calculateMilestonePersonalImpact(milestone2029, profileA);
      const plan = deriveMilestoneActionPlan(milestone2029, impact, profileA);

      expect(plan.decisionOptions).toBeDefined();
      expect(plan.decisionOptions?.length).toBe(3);

      const optA = plan.decisionOptions?.find((o) => o.optionId === "A");
      const optB = plan.decisionOptions?.find((o) => o.optionId === "B");
      const optC = plan.decisionOptions?.find((o) => o.optionId === "C");

      expect(optA?.riskLevel).toBe("Düşük");
      expect(optB?.riskLevel).toBe("Orta");
      expect(optC?.riskLevel).toBe("Yüksek");

      expect(optA?.title).toContain("Koruyucu");
      expect(optB?.title).toContain("Hibritleşme");
      expect(optC?.title).toContain("Sıçrama");
    });
  });

  // ─────────────────────────────────────────────────────────────────────────────
  // 4. KANIT & İDDİA KALİBRASYONU (MAAŞ / 99.999 / SANSASYONEL İFADELER)
  // ─────────────────────────────────────────────────────────────────────────────
  describe("4. İddia ve Epistemik Sınır Kalibrasyonu", () => {
    it("Kariyer fırsatlarında kesin sahte maaş garantisi ($190K+) verilmez, model senaryo rolü olarak sunulur", () => {
      const dom = detectDomainCareerProfile("büyüme", "Yazılım Geliştirici", "senior", "büyüme", "Teknoloji");
      for (const opp of dom.targetOpportunities) {
        expect(opp).not.toMatch(/\$190K\+/);
      }
      expect(dom.targetOpportunities[0]).toContain("Model Senaryo Rolü");
    });

    it("Yapay zeka brifinglerinde endüstriyel 5-dokuz (%99.999) güvenilirlik gerçek ölçüm değil, model hedefi olarak nitelendirilir", () => {
      const sim = generateHighFidelitySimulation({
        year: milestone2029.year,
        title: milestone2029.title,
        description: milestone2029.description,
        category: milestone2029.category,
        mode: "ask",
        userProfile: profileA,
      });

      expect(sim.output).toContain("model hedefi");
      expect(sim.output).toMatch(/99\.999/);
    });

    it("Meslek analizlerinde sansasyonel 'işiniz bitecek / mesleğiniz yok olacak' yerine görev dönüşümü kullanılır", () => {
      const dom = detectDomainCareerProfile("finans", "Muhasebeci", "senior", "güvenlik", "Finans");
      expect(dom.summaryTemplate).not.toContain("tamamen bitiyor");
      expect(dom.summaryTemplate).toContain("görevleri yüksek otomasyon baskısıyla dönüşüyor");
    });
  });

  // ─────────────────────────────────────────────────────────────────────────────
  // 5. KİŞİSELLEŞTİRME DELTASI (PERSONALIZATION DELTA)
  // ─────────────────────────────────────────────────────────────────────────────
  describe("5. Kişiselleştirme Deltası: Profil A vs Profil B Karşılaştırması", () => {
    it("Aynı dönüm noktası (2029 AGI) için Profil A ve B çıktılarının en az 8 temel boyutta ayrıştığını kanıtlar", () => {
      const impA = calculateMilestonePersonalImpact(milestone2029, profileA);
      const impB = calculateMilestonePersonalImpact(milestone2029, profileB);

      const planA = deriveMilestoneActionPlan(milestone2029, impA, profileA);
      const planB = deriveMilestoneActionPlan(milestone2029, impB, profileB);

      const domA = detectDomainCareerProfile(profileA.personalGoal!, profileA.profession!, profileA.seniority, profileA.personalGoal, profileA.industrySector);
      const domB = detectDomainCareerProfile(profileB.personalGoal!, profileB.profession!, profileB.seniority, profileB.personalGoal, profileB.industrySector);

      // 1. Yaş Projeksiyonu
      expect(impA.userAgeAtMilestone).not.toBe(impB.userAgeAtMilestone);
      // 2. Alaka Skoru
      expect(impA.relevanceScore).not.toBe(impB.relevanceScore);
      // 3. Kariyer Etki Özeti
      expect(impA.careerImpactSummary).not.toBe(impB.careerImpactSummary);
      // 4. Somut Eylem Metni
      expect(planA.concreteAction).not.toBe(planB.concreteAction);
      // 5. Araç Önerileri
      expect(domA.recommendedToolsAndFrameworks[0]).not.toBe(domB.recommendedToolsAndFrameworks[0]);
      // 6. Yok Olacak Görevler
      expect(domA.obsoleteTasks[0]).not.toBe(domB.obsoleteTasks[0]);
      // 7. Yüksek Katma Değerli Görevler
      expect(domA.highValueHumanTasks[0]).not.toBe(domB.highValueHumanTasks[0]);
      // 8. Hedef Kariyer Fırsatları
      expect(domA.targetOpportunities[0]).not.toBe(domB.targetOpportunities[0]);
      // 9. Karar Gerekçesi (Why)
      expect(planA.why).not.toBe(planB.why);
    });
  });
});
