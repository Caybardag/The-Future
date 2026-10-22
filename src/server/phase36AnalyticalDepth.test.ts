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

describe("AŞAMA 36 — ANALİTİK ÇIKTI KALİTESİ & GERÇEK KULLANICI DEĞERİ (AUDIT SUITE)", () => {
  // Test Milestones
  const milestone2029 = TIMELINE_DATA.find((m) => m.year === 2029) || TIMELINE_DATA[0]; // AGI
  const milestone2031 = TIMELINE_DATA.find((m) => m.year === 2031) || TIMELINE_DATA[1]; // CRISPR / Biotech
  const milestone2028 = TIMELINE_DATA.find((m) => m.year === 2028) || TIMELINE_DATA[2]; // Solid-state battery

  const baseProps = {
    id: "usr_test_mock",
    phone: "+905001112233",
    isEmailVerified: true,
    isPhoneVerified: true,
    joinedDate: "2026-01-01",
    credits: 100,
    plan: "pro" as const,
  };

  // Test Profiles defined by User Spec
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

  const profileD: UserProfile = {
    ...baseProps,
    id: "usr_test_d",
    username: "guest_user",
    email: "guest@example.com",
    fullName: "Misafir Kullanıcı",
    profession: "",
    age: undefined,
    seniority: "",
    industrySector: "",
    personalGoal: "",
  };

  // ─────────────────────────────────────────────────────────────────────────────
  // 1. GERÇEK ANALİZ ZİNCİRİ & PROFİL AKIŞI DOĞRULAMASI
  // ─────────────────────────────────────────────────────────────────────────────
  describe("1. Gerçek Analiz Zinciri & Profil Veri Akışı", () => {
    it("Kullanıcı mesleği ve sektörü deterministik olarak doğru alan kümesine eşlenir", () => {
      const domA = detectDomainCareerProfile(profileA.personalGoal!, profileA.profession!, profileA.seniority, profileA.personalGoal, profileA.industrySector);
      expect(domA.categoryName).toBe("Yazılım Mimarisi & Otonom Kod Sistemleri");

      const domB = detectDomainCareerProfile(profileB.personalGoal!, profileB.profession!, profileB.seniority, profileB.personalGoal, profileB.industrySector);
      expect(domB.categoryName).toBe("Finansal Zeka & Algoritmik Sermaye");

      const domC = detectDomainCareerProfile(profileC.personalGoal!, profileC.profession!, profileC.seniority, profileC.personalGoal, profileC.industrySector);
      expect(domC.categoryName).toBe("Biyoteknoloji, Genomik & Yaşam Bilimleri Araştırmacılığı");
    });

    it("Eksik profilde (Profil D) sistem sahte veri uydurmaz ve pending durumunu korur", () => {
      const impD = calculateMilestonePersonalImpact(milestone2029, profileD);
      expect(impD.isProfilePending).toBe(true);
      expect(impD.relevanceLevel).toBe("low");
      expect(impD.preparationAdvice).toContain("Profil bilgilerinizi tamamlayarak");
    });

    it("Kullanıcı yaşı dönüm noktasındaki yaş projeksiyonuna matematiksel olarak yansır", () => {
      const impA = calculateMilestonePersonalImpact(milestone2029, profileA);
      // 2029 - 2026 = 3 yıl. 30 + 3 = 33
      expect(impA.userAgeAtMilestone).toBe(33);

      const impB = calculateMilestonePersonalImpact(milestone2029, profileB);
      // 52 + 3 = 55
      expect(impB.userAgeAtMilestone).toBe(55);

      const impC = calculateMilestonePersonalImpact(milestone2031, profileC);
      // 2031 - 2026 = 5 yıl. 26 + 5 = 31
      expect(impC.userAgeAtMilestone).toBe(31);
    });
  });

  // ─────────────────────────────────────────────────────────────────────────────
  // 2. 6 BOYUTLU STRATEJİK YÖNETİCİ BRİFİNGİ ANALİTİK DENETİMİ
  // ─────────────────────────────────────────────────────────────────────────────
  describe("2. 6 Boyutlu Stratejik Yönetici Brifingi Denetimi", () => {
    const briefingOutput = generateHighFidelitySimulation({
      year: milestone2029.year,
      title: milestone2029.title,
      description: milestone2029.description,
      category: milestone2029.category,
      mode: "ask",
      userProfile: {
        profession: profileA.profession,
        seniority: profileA.seniority,
        industrySector: profileA.industrySector,
        personalGoal: profileA.personalGoal,
      },
    });

    it("Brifing tam olarak 6 ayrı numaralandırılmış stratejik boyut üretir", () => {
      expect(briefingOutput.success).toBe(true);
      const text = briefingOutput.output;
      expect(text).toContain("#### 1. 🔬 Teknolojik Kırılma");
      expect(text).toContain("#### 2. 💼 Sosyo-Ekonomik Güç Dengesi");
      expect(text).toContain("#### 3. 📉 Maliyet Eğrisi");
      expect(text).toContain("#### 4. 🛡️ Etik, Siber Güvenlik");
      expect(text).toContain("#### 5. 🧭 Bireysel ve Kurumsal Strateji");
      expect(text).toContain("#### 6. 🌐 2060 Tekillik Ufkuna Doğru");
    });

    it("Her boyut bağımsız ve birbirini tekrar etmeyen analitik içerik taşır", () => {
      const text = briefingOutput.output;
      const parts = text.split(/#### \d\./);
      expect(parts.length).toBe(7); // intro + 6 sections

      const sec1 = parts[1]; // Mimari
      const sec2 = parts[2]; // Kazananlar/Kaybedenler
      const sec3 = parts[3]; // Maliyet
      const sec4 = parts[4]; // Regülasyon
      const sec5 = parts[5]; // Eylem adımları
      const sec6 = parts[6]; // 2060 Tekillik kaskatı

      // Sec 1 must discuss engineering & thermodynamics
      expect(sec1).toMatch(/mimari|hesaplama|termodinamik|güvenilirlik/i);
      // Sec 2 must detail winners vs losers
      expect(sec2).toMatch(/Kazananlar|Kaybedenler|Orkestrasyon|marj/i);
      // Sec 3 must detail phased market penetration
      expect(sec3).toMatch(/İlk Faz|İkinci Faz|Üçüncü Faz|deflasyonist/i);
      // Sec 4 must detail governance and cryptography
      expect(sec4).toMatch(/Kriptografik|Regülasyon|Algoritmik|Etik/i);
      // Sec 5 must give actionable directives
      expect(sec5).toMatch(/Aktif Uygulayıcı|Ajan Yöneten|Portföy/i);
      // Sec 6 must project cascade waves
      expect(sec6).toMatch(/İkinci Derece|Üçüncü Derece|2060|Simbiyoz/i);
    });

    it("Kullanıcı profili brifingin 2. ve 5. boyutlarına doğrudan yansır", () => {
      const text = briefingOutput.output;
      expect(text).toContain("Kişiselleştirilmiş Rol Konumu (Yazılım Geliştirici - senior)");
      expect(text).toContain("Yazılım Geliştirici Özel Eylem Planı (Kariyer gelişimi)");
    });
  });

  // ─────────────────────────────────────────────────────────────────────────────
  // 3. PROFİL DEĞİŞTİRME ADVERSARIAL TESTİ (PROFILES A, B, C, D)
  // ─────────────────────────────────────────────────────────────────────────────
  describe("3. Profil Değiştirme Adversarial Testi", () => {
    it("Aynı dönüm noktası için Profil A (Yazılım) ve Profil B (Finans) farklı çıktılar alır", () => {
      const impA = calculateMilestonePersonalImpact(milestone2029, profileA);
      const impB = calculateMilestonePersonalImpact(milestone2029, profileB);

      // Relevance score differs by domain alignment
      expect(impA.relevanceScore).toBeGreaterThanOrEqual(impB.relevanceScore);
      expect(impA.careerImpactSummary).toContain("Yazılım Geliştirici");
      expect(impB.careerImpactSummary).toContain("Finans Uzmanı");

      const planA = deriveMilestoneActionPlan(milestone2029, impA, profileA);
      const planB = deriveMilestoneActionPlan(milestone2029, impB, profileB);

      expect(planA.concreteAction).toContain("Yazılım Geliştirici");
      expect(planB.concreteAction).toContain("Finans Uzmanı");
      expect(planA.concreteAction).not.toBe(planB.concreteAction);
    });

    it("Profil C (Biyolog, 26 yaş) biyoteknoloji dönüm noktasında yüksek alaka alır", () => {
      const impC = calculateMilestonePersonalImpact(milestone2031, profileC);
      expect(impC.relevanceLevel).toBe("high");
      expect(impC.relevanceScore).toBeGreaterThanOrEqual(75);
      expect(impC.careerImpactSummary).toContain("Biyolog");

      const planC = deriveMilestoneActionPlan(milestone2031, impC, profileC);
      expect(planC.concreteAction).toContain("Biyolog");
      expect(planC.actionTypeLabel).toBe("Biyo-Yaşam & Sağlık");
    });

    it("Dört profilin risk ve eylem çıktıları homojen değil, tamamen farklılaşmıştır", () => {
      const domA = detectDomainCareerProfile(profileA.personalGoal!, profileA.profession!, profileA.seniority, profileA.personalGoal, profileA.industrySector);
      const domB = detectDomainCareerProfile(profileB.personalGoal!, profileB.profession!, profileB.seniority, profileB.personalGoal, profileB.industrySector);
      const domC = detectDomainCareerProfile(profileC.personalGoal!, profileC.profession!, profileC.seniority, profileC.personalGoal, profileC.industrySector);
      const domD = detectDomainCareerProfile(profileD.personalGoal!, profileD.profession!, profileD.seniority, profileD.personalGoal, profileD.industrySector);

      // Verify category differentiation
      const categories = [domA.categoryName, domB.categoryName, domC.categoryName, domD.categoryName];
      const uniqueCats = new Set(categories);
      expect(uniqueCats.size).toBe(4);

      // Verify target opportunities differentiation
      expect(domA.targetOpportunities[0]).toMatch(/Yapay Zeka|Ajan|Mimar/);
      expect(domB.targetOpportunities[0]).toContain("CFO");
      expect(domC.targetOpportunities[0]).toContain("Biyoloji");
      expect(domD.targetOpportunities[0]).toContain("Hizmet");
    });
  });

  // ─────────────────────────────────────────────────────────────────────────────
  // 4. INPUT PERTURBATION TESTİ (TEK ALAN DEĞİŞİMİ DUYARLILIĞI)
  // ─────────────────────────────────────────────────────────────────────────────
  describe("4. Input Perturbation Testi (Tekil Girdi Değişimi)", () => {
    it("Kıdem düzeyi değiştiğinde (Junior vs Senior) otomasyon riski duyarlı biçimde değişir", () => {
      const juniorProf = detectDomainCareerProfile("gelişim", "Yazılım Geliştirici", "junior", "gelişim", "Teknoloji");
      const seniorProf = detectDomainCareerProfile("gelişim", "Yazılım Geliştirici", "senior", "gelişim", "Teknoloji");

      // Senior has strategic/managerial protection: lower automation risk
      expect(seniorProf.baseAutomationPct).toBeLessThan(juniorProf.baseAutomationPct);
      expect(seniorProf.personalizedVerdictTemplate).toContain("Kıdemli / Liderlik");
      expect(juniorProf.personalizedVerdictTemplate).toContain("Erken Kariyer");
    });

    it("Kariyer hedefi değiştiğinde (Güvenlik vs Büyüme vs Araştırma) stratejik tavsiye değişir", () => {
      const secGoal = detectDomainCareerProfile("güvenlik", "Yazılım Geliştirici", "mid", "güvenlik", "Teknoloji");
      const growthGoal = detectDomainCareerProfile("büyüme", "Yazılım Geliştirici", "mid", "büyüme", "Teknoloji");
      const researchGoal = detectDomainCareerProfile("araştırma", "Yazılım Geliştirici", "mid", "araştırma", "Teknoloji");

      expect(secGoal.personalizedVerdictTemplate).toContain("güvenliğini");
      expect(growthGoal.personalizedVerdictTemplate).toContain("büyümesini");
      expect(researchGoal.personalizedVerdictTemplate).toContain("araştırma");
    });

    it("Meslek değiştiğinde (Yazılım -> Finans -> Biyolog) araçlar ve yok olacak görevler değişir", () => {
      const soft = detectDomainCareerProfile("kod", "Yazılımcı", "mid", "kod", "Teknoloji");
      const fin = detectDomainCareerProfile("finans", "Muhasebeci", "mid", "finans", "Finans");
      const bio = detectDomainCareerProfile("biyo", "Biyolog", "mid", "biyo", "Biyoteknoloji");

      expect(soft.recommendedToolsAndFrameworks[0]).toContain("Cursor");
      expect(fin.recommendedToolsAndFrameworks[0]).toContain("Vic.ai");
      expect(bio.recommendedToolsAndFrameworks[0]).toContain("AlphaFold");
    });
  });

  // ─────────────────────────────────────────────────────────────────────────────
  // 5. 6 BOYUT ARASI ÇELİŞKİ VE SAYISAL TUTARLILIK TESTİ
  // ─────────────────────────────────────────────────────────────────────────────
  describe("5. 6 Boyut Arası Tutarlılık & Çelişki Kontrolü", () => {
    it("Alaka skoru ile Alaka seviyesi (Level) arasında sayısal çelişki yoktur", () => {
      for (const m of TIMELINE_DATA.slice(0, 10)) {
        const imp = calculateMilestonePersonalImpact(m, profileA);
        if (imp.relevanceScore >= 65) {
          expect(imp.relevanceLevel).toBe("high");
        } else if (imp.relevanceScore >= 40) {
          expect(imp.relevanceLevel).toBe("medium");
        } else {
          expect(imp.relevanceLevel).toBe("low");
        }
      }
    });

    it("Yüksek alaka seviyesine sahip olan dönüm noktası acil/yakın eylem planı üretir", () => {
      const imp = calculateMilestonePersonalImpact(milestone2029, profileA);
      const plan = deriveMilestoneActionPlan(milestone2029, imp, profileA);

      expect(plan.urgencyBand).toBe("immediate");
      expect(plan.preparationHorizon).toContain("2026–2028");
    });
  });

  // ─────────────────────────────────────────────────────────────────────────────
  // 6. KAYNAK → İDDİA → SONUÇ ZİNCİRİ & ANTI-HALLUCINATION TESTİ
  // ─────────────────────────────────────────────────────────────────────────────
  describe("6. Kaynak Doğrulanabilirliği & Anti-Hallucination Kalkanı", () => {
    it("Simülasyon motoru sahte kaynak uydurmaz; doğrulanabilir açık arşiv referansları üretir", () => {
      const sim = generateHighFidelitySimulation({
        year: 2029,
        title: "Yapay Genel Zeka",
        description: "AGI mimarisi",
        category: "Yapay Zeka & Bilişim",
        mode: "ask",
      });

      expect(sim.grounding).toBeDefined();
      expect(sim.grounding?.webSources.length).toBeGreaterThanOrEqual(3);

      const openAlex = sim.grounding?.webSources.find((s) => s.domain === "openalex.org");
      expect(openAlex).toBeDefined();
      expect(openAlex?.uri).toContain("openalex.org/works");

      const arxiv = sim.grounding?.webSources.find((s) => s.domain === "arxiv.org");
      expect(arxiv).toBeDefined();
      expect(arxiv?.uri).toContain("arxiv.org/search");
    });

    it("Timeline dönüm noktası verileri TRL seviyesi ve akademik kanıt göstergeleri taşır", () => {
      const worldState2029 = getFiveLayerWorldState(milestone2029);
      expect(worldState2029.scientificReadiness).toBeDefined();
      expect(worldState2029.scientificReadiness.trlLevel).toBeGreaterThanOrEqual(1);
      expect(worldState2029.scientificReadiness.trlLevel).toBeLessThanOrEqual(9);
      expect(worldState2029.scientificReadiness.academicConsensusRate).toBeGreaterThanOrEqual(1);
      expect(worldState2029.scientificReadiness.academicConsensusRate).toBeLessThanOrEqual(100);
    });
  });
});
