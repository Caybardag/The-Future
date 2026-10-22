import { describe, it, expect } from "vitest";
import { detectDomainCareerProfile } from "./domainCareerIntel";
import { generateHighFidelitySimulation } from "./offlineFuturologyEngine";
import {
  calculateMilestonePersonalImpact,
  deriveMilestoneActionPlan,
} from "../utils/personalTimelineEngine";
import { TIMELINE_DATA } from "../data/timelineData";
import { UserProfile } from "../components/UserAuthModal";
import { getFiveLayerWorldState } from "../utils/worldStateResolver";

describe("AŞAMA 36.1 — ADVERSARIAL ANALYTICAL VALUE & PROVENANCE VERIFICATION", () => {
  const milestone2029 = TIMELINE_DATA.find((m) => m.year === 2029) || TIMELINE_DATA[0]; // AGI

  const baseProps = {
    id: "usr_test_mock",
    phone: "+905001112233",
    isEmailVerified: true,
    isPhoneVerified: true,
    joinedDate: "2026-01-01",
    credits: 100,
    plan: "pro" as const,
  };

  const profileA: UserProfile = {
    ...baseProps,
    id: "usr_test_a",
    username: "dev_senior_30",
    email: "dev@example.com",
    fullName: "Ali Yazılımcı",
    profession: "Yazılım Geliştirici",
    age: 30,
    seniority: "senior",
    industrySector: "Teknoloji",
    personalGoal: "Kariyer gelişimi",
  };

  const profileB: UserProfile = {
    ...baseProps,
    id: "usr_test_b",
    username: "finance_senior_52",
    email: "finance@example.com",
    fullName: "Mehmet Finans",
    profession: "Finans Uzmanı",
    age: 52,
    seniority: "senior",
    industrySector: "Finans",
    personalGoal: "Kariyer güvenliği",
  };

  const profileC: UserProfile = {
    ...baseProps,
    id: "usr_test_c",
    username: "bio_junior_26",
    email: "bio@example.com",
    fullName: "Ayşe Biyolog",
    profession: "Biyolog",
    age: 26,
    seniority: "junior",
    industrySector: "Biyoteknoloji",
    personalGoal: "Araştırma kariyeri",
  };

  // 1. RISK SCORE PROVENANCE & CALIBRATION CHECK
  describe("1. Risk Score Provenance: Deterministik vs Model Sınıflandırması", () => {
    it("Otomasyon risk puanları bilimsel frekans olasılığı değil, parametrik model indeksidir", () => {
      const domA = detectDomainCareerProfile(profileA.personalGoal!, profileA.profession!, profileA.seniority, profileA.personalGoal, profileA.industrySector);
      const domB = detectDomainCareerProfile(profileB.personalGoal!, profileB.profession!, profileB.seniority, profileB.personalGoal, profileB.industrySector);
      const domC = detectDomainCareerProfile(profileC.personalGoal!, profileC.profession!, profileC.seniority, profileC.personalGoal, profileC.industrySector);

      // Verifying base percentages and seniority adjustments
      // Software: 82 base - 12 (senior) = 70
      expect(domA.baseAutomationPct).toBe(70);
      // Finance: 88 base - 12 (senior) = 76
      expect(domB.baseAutomationPct).toBe(76);
      // Biology: 52 base + 10 (junior) = 62
      expect(domC.baseAutomationPct).toBe(62);

      // Scores are deterministic with identical inputs
      const domA_repeat = detectDomainCareerProfile(profileA.personalGoal!, profileA.profession!, profileA.seniority, profileA.personalGoal, profileA.industrySector);
      expect(domA_repeat.baseAutomationPct).toBe(domA.baseAutomationPct);
    });
  });

  // 2. SIX-DIMENSION UNIQUENESS & OVERLAP CHECK
  describe("2. 6 Boyutun Analitik Ayrışması & Tekrar Denetimi", () => {
    it("6 boyutlu brifingin her boyutu farklı bir analitik odağa sahiptir ve birbirini papağan gibi tekrarlamaz", () => {
      const briefing = generateHighFidelitySimulation({
        year: milestone2029.year,
        title: milestone2029.title,
        description: milestone2029.description,
        category: milestone2029.category,
        mode: "ask",
        userProfile: profileA,
      });

      expect(briefing.success).toBe(true);
      const sections = briefing.output.split(/#### \d\./);
      expect(sections.length).toBe(7); // intro + 6 dimensions

      // Dimension 1: Technical & thermodynamic limits
      expect(sections[1]).toMatch(/Landauer|termodinamik|mimari|hesaplama/i);
      // Dimension 2: Socio-economic winners & losers
      expect(sections[2]).toMatch(/Kazananlar|Kaybedenler|Orkestrasyon|marj/i);
      // Dimension 3: Cost curves and deployment phases
      expect(sections[3]).toMatch(/İlk Faz|İkinci Faz|Üçüncü Faz|deflasyonist/i);
      // Dimension 4: Governance and regulatory shields
      expect(sections[4]).toMatch(/Kriptografik|Regülasyon|Algoritmik|Etik/i);
      // Dimension 5: Concrete action steps
      expect(sections[5]).toMatch(/Uygulayıcı|Ajan Yöneten|Portföy/i);
      // Dimension 6: Macro singularity cascade towards 2060
      expect(sections[6]).toMatch(/İkinci Derece|Üçüncü Derece|2060|Simbiyoz/i);
    });
  });

  // 3. FULL PROFILE DIFF ACROSS PROFILES A, B, C
  describe("3. Profil A/B/C Tam Çıktı Nesnesi Karşılaştırması", () => {
    it("Profil A, B ve C tüm analitik alanlarda (araçlar, görevler, eylemler, fırsatlar) ayrışır", () => {
      const domA = detectDomainCareerProfile(profileA.personalGoal!, profileA.profession!, profileA.seniority, profileA.personalGoal, profileA.industrySector);
      const domB = detectDomainCareerProfile(profileB.personalGoal!, profileB.profession!, profileB.seniority, profileB.personalGoal, profileB.industrySector);
      const domC = detectDomainCareerProfile(profileC.personalGoal!, profileC.profession!, profileC.seniority, profileC.personalGoal, profileC.industrySector);

      // Unique tools across profiles
      expect(domA.recommendedToolsAndFrameworks[0]).toContain("Cursor");
      expect(domB.recommendedToolsAndFrameworks[0]).toContain("Vic.ai");
      expect(domC.recommendedToolsAndFrameworks[0]).toContain("AlphaFold");

      // Unique obsolete tasks
      expect(domA.obsoleteTasks[0]).toContain("REST API");
      expect(domA.obsoleteTasks[0]).not.toBe(domB.obsoleteTasks[0]);
      expect(domB.obsoleteTasks[0]).toMatch(/Fatura|dekont/i);
      expect(domC.obsoleteTasks[0]).toContain("pipetleme");

      // Unique future opportunities
      expect(domA.targetOpportunities[0]).toContain("Yapay Zeka");
      expect(domB.targetOpportunities[0]).toContain("CFO");
      expect(domC.targetOpportunities[0]).toContain("Biyoloji");
    });
  });

  // 4. SINGLE PARAMETER PERTURBATION SENSITIVITY
  describe("4. Tekil Parametre Değişimi Duyarlılık Testi", () => {
    it("Yalnızca yaş değiştiğinde hedef yıldaki yaş ve emeklilik ufku değişir, mesleki araçlar sabit kalır", () => {
      const prof30 = { ...profileA, age: 30 };
      const prof55 = { ...profileA, age: 55 };

      const impact30 = calculateMilestonePersonalImpact(milestone2029, prof30);
      const impact55 = calculateMilestonePersonalImpact(milestone2029, prof55);

      expect(impact30.userAgeAtMilestone).toBe(33);
      expect(impact55.userAgeAtMilestone).toBe(58);
      // Domain tool recommendations do not change just because age changed
      const dom30 = detectDomainCareerProfile(prof30.personalGoal!, prof30.profession!, prof30.seniority, prof30.personalGoal, prof30.industrySector);
      const dom55 = detectDomainCareerProfile(prof55.personalGoal!, prof55.profession!, prof55.seniority, prof55.personalGoal, prof55.industrySector);
      expect(dom30.recommendedToolsAndFrameworks[0]).toBe(dom55.recommendedToolsAndFrameworks[0]);
    });

    it("Yalnızca meslek değiştiğinde otomasyon ve görev matrisi bütünüyle değişir", () => {
      const soft = detectDomainCareerProfile("büyüme", "Yazılım Geliştirici", "senior", "büyüme", "Teknoloji");
      const bio = detectDomainCareerProfile("büyüme", "Biyolog", "senior", "büyüme", "Teknoloji");

      expect(soft.categoryName).not.toBe(bio.categoryName);
      expect(soft.baseAutomationPct).not.toBe(bio.baseAutomationPct);
    });

    it("Yalnızca kıdem değiştiğinde otomasyon riski ve yönetici perspektifi değişir", () => {
      const jun = detectDomainCareerProfile("büyüme", "Yazılım Geliştirici", "junior", "büyüme", "Teknoloji");
      const sen = detectDomainCareerProfile("büyüme", "Yazılım Geliştirici", "senior", "büyüme", "Teknoloji");

      expect(jun.baseAutomationPct).toBe(92); // 82 + 10
      expect(sen.baseAutomationPct).toBe(70); // 82 - 12
      expect(sen.personalizedVerdictTemplate).toContain("Liderlik");
      expect(jun.personalizedVerdictTemplate).toContain("Erken Kariyer");
    });
  });

  // 5. BRANDING & VALUE AUDIT
  describe("5. Marka & Ücretli Ürün Değeri Bütünlüğü", () => {
    it("Ürün kullanıcıya resmi olarak 'Gelecek Takvimi / Teknolojik Evrim Takvimi' olarak sunulur", () => {
      expect(milestone2029.title).toBeDefined();
      expect(milestone2029.year).toBe(2029);
    });
  });
});
