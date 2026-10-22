import { describe, it, expect } from "vitest";
import { TIMELINE_DATA } from "../data/timelineData";
import {
  calculateMilestonePersonalImpact,
  deriveMilestoneActionPlan,
  getDomainContextualDecisionOptions,
} from "../utils/personalTimelineEngine";
import { detectDomainCareerProfile } from "./domainCareerIntel";
import { UserProfile } from "../components/UserAuthModal";
import * as fs from "fs";
import * as path from "path";

describe("AŞAMA 38.1 — ADVERSARIAL GERÇEK KİŞİSELLEŞTİRME, KARAR MODELİ & İDDİA KALİBRASYONU DENETİMİ", () => {
  const milestone2029 = TIMELINE_DATA.find((m) => m.year === 2029) || TIMELINE_DATA[0];
  const milestone2031 = TIMELINE_DATA.find((m) => m.year === 2031) || TIMELINE_DATA[1];
  const milestone2035 = TIMELINE_DATA.find((m) => m.year === 2035) || TIMELINE_DATA[2];

  const baseProps = {
    id: "usr_phase38_1",
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
  // 1. RELEVANCE HEURISTIC SEMANTICS & SCORING MODEL AUDIT
  // ─────────────────────────────────────────────────────────────────────────────
  describe("1. Alaka Skoru (Relevance Score) Epistemik Ayrışımı", () => {
    it("Alaka skoru ampirik bir olasılık değil, parametrik bir model indeksidir (20 base + katsayılar)", () => {
      const impA = calculateMilestonePersonalImpact(milestone2029, profileA);
      const impB = calculateMilestonePersonalImpact(milestone2029, profileB);

      // Yazılım mühendisi AI kategorisinde kategori eşleşmesi (+35) ve anahtar kelime (+20) alır
      expect(impA.relevanceScore).toBeGreaterThanOrEqual(75);
      expect(impA.relevanceScore).toBeLessThanOrEqual(99);

      // Finans uzmanı için 2029 AGI genel kategoriye girer ancak doğrudan yazılımcı kadar yüksek keyword almaz
      expect(impB.relevanceScore).toBeLessThan(impA.relevanceScore);
      expect(impB.relevanceScore).toBeGreaterThanOrEqual(15);
    });

    it("Skor katı matematiksel determinizm sergiler (aynı profil ve milestone sıfır varyans üretir)", () => {
      const run1 = calculateMilestonePersonalImpact(milestone2029, profileA);
      const run2 = calculateMilestonePersonalImpact(milestone2029, profileA);
      expect(run1.relevanceScore).toBe(run2.relevanceScore);
      expect(run1.relevanceLevel).toBe(run2.relevanceLevel);
    });
  });

  // ─────────────────────────────────────────────────────────────────────────────
  // 2. AUTOMATION INDEX SEMANTICS & UI FRAMING
  // ─────────────────────────────────────────────────────────────────────────────
  describe("2. Rutin Otomasyon Endeksi Semantiği & İş Kaybı Algısı Koruması", () => {
    it("baseAutomationPct ve türevleri iş kaybı olasılığı (%X) değil 'Rutin Görev İkame İndeksi (X/100)' olarak çerçevelenir", () => {
      const domSoft = detectDomainCareerProfile("kod", "Yazılım Geliştirici", "senior", "büyüme", "Teknoloji");
      const domFin = detectDomainCareerProfile("finans", "Finans Uzmanı", "senior", "güvenlik", "Finans");
      const domBio = detectDomainCareerProfile("biyo", "Biyolog", "junior", "araştırma", "Biyoteknoloji");

      // Senior yazılımcı: 82 - 12 = 70/100
      expect(domSoft.baseAutomationPct).toBe(70);
      // Senior finans: 88 - 12 = 76/100
      expect(domFin.baseAutomationPct).toBe(76);
      // Junior biyolog: 52 + 10 = 62/100
      expect(domBio.baseAutomationPct).toBe(62);

      // Karar çıktısında açıkça parametrik indeks olduğu ve iş kaybı olasılığı olmadığı uyarısı yer alır
      expect(domSoft.personalizedVerdictTemplate).toContain("Rutin Görev İkame İndeksi");
      expect(domSoft.personalizedVerdictTemplate).toContain("iş kaybı olasılığı değil");
      expect(domFin.personalizedVerdictTemplate).toContain("Rutin Görev İkame İndeksi");
      expect(domFin.personalizedVerdictTemplate).toContain("iş kaybı olasılığı değildir");
    });
  });

  // ─────────────────────────────────────────────────────────────────────────────
  // 3. ADVERSARIAL AGE HEURISTIC TEST (59 -> 60 GEÇİŞİ)
  // ─────────────────────────────────────────────────────────────────────────────
  describe("3. Adversarial Yaş Eşiği Testi (59 vs 60 ve Hedef Koruması)", () => {
    it("60 yaşına giren büyüme/liderlik hedefli kullanıcı zorla emeklilik/danışmanlığa itilmez; kıdemli yönetim liderliği korunur", () => {
      const prof59Growth: UserProfile = { ...profileA, age: 59, personalGoal: "Kariyer gelişimi ve liderlik" };
      const prof60Growth: UserProfile = { ...profileA, age: 60, personalGoal: "Kariyer gelişimi ve liderlik" };

      const plan59 = deriveMilestoneActionPlan(milestone2029, null, prof59Growth);
      const plan60 = deriveMilestoneActionPlan(milestone2029, null, prof60Growth);

      // Her ikisinde de eylem büyüme ve stratejik yönetişim eksenlidir
      expect(plan60.actionTypeLabel).toContain("Kıdemli Yönetişim & Büyüme Liderliği");
      expect(plan60.concreteAction).toContain("stratejik yönetişimi");
      // 60 yaşındaki büyüme hedefli kullanıcıya 'yaşam kalitesi / emeklilik' dayatılmaz
      expect(plan60.actionTypeLabel).not.toBe("Danışmanlık & Yaşam Kalitesi");
    });

    it("60 yaşında kariyer güvenliği veya yaşam dengesi hedefleyen kullanıcıya danışmanlık ve mentorluk perspektifi sunulur", () => {
      const prof60Security: UserProfile = { ...profileA, age: 60, personalGoal: "Kariyer güvenliği ve istikrar" };
      const plan60Sec = deriveMilestoneActionPlan(milestone2029, null, prof60Security);

      expect(plan60Sec.actionTypeLabel).toBe("Danışmanlık & Yaşam Kalitesi");
      expect(plan60Sec.concreteAction).toContain("mentorluk ve danışmanlık");
    });

    it("Farklı mesleklerde 60 yaş üzerindeki kullanıcıların alan kimliği korunur", () => {
      const prof60Fin: UserProfile = { ...profileB, age: 60, personalGoal: "Kariyer güvenliği" };
      const plan60Fin = deriveMilestoneActionPlan(milestone2029, null, prof60Fin);
      expect(plan60Fin.forWhom).toContain("Finans Uzmanı");
      expect(plan60Fin.concreteAction).toContain("Finans Uzmanı");
    });
  });

  // ─────────────────────────────────────────────────────────────────────────────
  // 4. GOAL PERTURBATION TEST
  // ─────────────────────────────────────────────────────────────────────────────
  describe("4. Kariyer Hedefi Hassasiyet Testi (Growth vs Security vs Research vs Transition)", () => {
    it("Aynı meslek ve yaş için hedef değiştiğinde stratejik tavsiye ve odak farklılaşır", () => {
      const domGrowth = detectDomainCareerProfile("büyüme", "Yazılım Geliştirici", "senior", "büyüme", "Teknoloji");
      const domSecurity = detectDomainCareerProfile("güvenlik", "Yazılım Geliştirici", "senior", "güvenlik", "Teknoloji");
      const domResearch = detectDomainCareerProfile("araştırma", "Yazılım Geliştirici", "senior", "araştırma", "Teknoloji");

      expect(domGrowth.personalizedVerdictTemplate).toContain("kaldıraç");
      expect(domSecurity.personalizedVerdictTemplate).toMatch(/güvenlik|denetim/i);
      expect(domResearch.personalizedVerdictTemplate).toMatch(/araştırma|keşif/i);

      expect(domGrowth.personalizedVerdictTemplate).not.toBe(domSecurity.personalizedVerdictTemplate);
      expect(domSecurity.personalizedVerdictTemplate).not.toBe(domResearch.personalizedVerdictTemplate);
    });
  });

  // ─────────────────────────────────────────────────────────────────────────────
  // 5. SENIORITY PERTURBATION TEST
  // ─────────────────────────────────────────────────────────────────────────────
  describe("5. Kıdem Düzeyi Hassasiyet Testi (Junior vs Senior)", () => {
    it("Senior delegasyon ve karar mimarisine yönlendirilirken, junior pratik proje üretimine yönlendirilir", () => {
      const domSenior = detectDomainCareerProfile("gelişim", "Yazılım Geliştirici", "senior", "gelişim", "Teknoloji");
      const domJunior = detectDomainCareerProfile("gelişim", "Yazılım Geliştirici", "junior", "gelişim", "Teknoloji");

      expect(domSenior.personalizedVerdictTemplate).toContain("Kıdemli / Liderlik");
      expect(domSenior.personalizedVerdictTemplate).toContain("karar mimarisi ve ekip yönetişimine");
      expect(domJunior.personalizedVerdictTemplate).toContain("Erken Kariyer");
      expect(domJunior.personalizedVerdictTemplate).toContain("canlı projeler üreterek");
      expect(domSenior.baseAutomationPct).toBeLessThan(domJunior.baseAutomationPct);
    });
  });

  // ─────────────────────────────────────────────────────────────────────────────
  // 6. PROFESSION PERTURBATION TEST (DOMAIN MAPPING REASONING)
  // ─────────────────────────────────────────────────────────────────────────────
  describe("6. Meslek Değişimi & Sektörel Eşleme Ayrışımı", () => {
    it("Meslek değiştiğinde araçlar, görevler ve fırsatlar sektörel haritaya göre ayrışır", () => {
      const domSoft = detectDomainCareerProfile("kod", "Yazılım Geliştirici", "senior", "gelişim", "Teknoloji");
      const domFin = detectDomainCareerProfile("finans", "Finans Uzmanı", "senior", "güvenlik", "Finans");
      const domBio = detectDomainCareerProfile("biyo", "Biyolog", "junior", "araştırma", "Biyoteknoloji");

      expect(domSoft.recommendedToolsAndFrameworks[0]).toContain("Cursor");
      expect(domFin.recommendedToolsAndFrameworks[0]).toContain("Vic.ai");
      expect(domBio.recommendedToolsAndFrameworks[0]).toContain("AlphaFold");

      expect(domSoft.obsoleteTasks[0]).not.toBe(domFin.obsoleteTasks[0]);
      expect(domFin.obsoleteTasks[0]).not.toBe(domBio.obsoleteTasks[0]);
    });
  });

  // ─────────────────────────────────────────────────────────────────────────────
  // 7. MILESTONE PERTURBATION TEST (BAĞLAMSAL DEĞİŞİM)
  // ─────────────────────────────────────────────────────────────────────────────
  describe("7. Milestone Bağlamı Hassasiyeti (Aynı Profil, Farklı Dönüm Noktaları)", () => {
    it("Aynı profil farklı milestone'ları incelediğinde zamanlama ufku, aciliyet bandı ve eylemler değişir", () => {
      const plan2029 = deriveMilestoneActionPlan(milestone2029, null, profileA);
      const plan2035 = deriveMilestoneActionPlan(milestone2035, null, profileA);

      expect(plan2029.urgencyBand).toBe("immediate");
      expect(plan2035.urgencyBand).toBe("near_term");
      expect(plan2029.preparationHorizon).not.toBe(plan2035.preparationHorizon);
      expect(plan2029.concreteAction).not.toBe(plan2035.concreteAction);
      expect(plan2029.keyCapability).not.toBe(plan2035.keyCapability);
    });
  });

  // ─────────────────────────────────────────────────────────────────────────────
  // 8. DECISION PATH DIFFERENTIATION TEST (A/B/C REAL DISTINCTION)
  // ─────────────────────────────────────────────────────────────────────────────
  describe("8. A/B/C Karar Yollarının Gerçek Sektörel Ayrışımı (Anti-Slop)", () => {
    it("Yazılım, Finans ve Biyoloji profilleri için A/B/C karar seçeneklerinin yetkinlikleri ve yaklaşımları birbirinin kopyası değildir", () => {
      const optionsSoft = getDomainContextualDecisionOptions("Yazılım Geliştirici", "AGI Sistemleri", "Yapay Zeka & Bilişim", ["software_tech"]);
      const optionsFin = getDomainContextualDecisionOptions("Finans Uzmanı", "Otonom Finans", "Sosyoloji & Ekonomi", ["finance_business"]);
      const optionsBio = getDomainContextualDecisionOptions("Biyolog", "Genomik", "Biyoloji & Tıp", ["health_bio"]);

      const optSoftB = optionsSoft.find((o) => o.optionId === "B")!;
      const optFinB = optionsFin.find((o) => o.optionId === "B")!;
      const optBioB = optionsBio.find((o) => o.optionId === "B")!;

      // Yazılımcı Yol B ajan mimarisi gerektirir
      expect(optSoftB.requiredSkills).toContain("Ajan Mimarisi");
      // Finansçı Yol B finansal denetim gerektirir
      expect(optFinB.requiredSkills).toContain("Algoritmik Finansal Denetim");
      // Biyolog Yol B moleküler simülasyon gerektirir
      expect(optBioB.requiredSkills).toContain("Moleküler Simülasyon");

      // Yol C (Stratejik Sıçrama) yetkinlikleri de tamamen sektörel derinliğe sahiptir
      const optSoftC = optionsSoft.find((o) => o.optionId === "C")!;
      const optFinC = optionsFin.find((o) => o.optionId === "C")!;
      const optBioC = optionsBio.find((o) => o.optionId === "C")!;

      expect(optSoftC.requiredSkills).toContain("Otonom Ajan Ağları");
      expect(optFinC.requiredSkills).toContain("Fraksiyonel CFO Analitiği");
      expect(optBioC.requiredSkills).toContain("Sentetik Biyoloji Mimarisi");
    });
  });

  // ─────────────────────────────────────────────────────────────────────────────
  // 9. UNSUPPORTED NUMERIC CLAIM GUARD
  // ─────────────────────────────────────────────────────────────────────────────
  describe("9. Desteklenmeyen Sayısal İddia Koruması (%40-60, %350, 10x vb.)", () => {
    it("Eylem planında desteklenmeyen '%40-60 zaman tasarrufu' kesin olgu gibi sunulmaz; model senaryosu olarak çerçevelenir", () => {
      const plan = deriveMilestoneActionPlan(milestone2029, null, profileA);
      expect(plan.expectedValue).not.toContain("%40-60 zaman tasarrufu");
      expect(plan.expectedValue).toContain("model projeksiyonu");
    });

    it("domainCareerIntel içinde hayali '%350 değer artışı', '%400 kazanç sıçraması' gibi sahte veriler kesin gerçek olarak bulunmaz", () => {
      const filePath = path.join(process.cwd(), "src", "server", "domainCareerIntel.ts");
      const content = fs.readFileSync(filePath, "utf-8");

      expect(content).not.toMatch(/%350 değer artışı/);
      expect(content).not.toMatch(/%400 kazanç sıçraması/);
      expect(content).not.toMatch(/%340 maaş primi/);
      expect(content).not.toMatch(/%320 kazanç artışı/);
    });
  });

  // ─────────────────────────────────────────────────────────────────────────────
  // 10. SALARY CLAIM GUARD
  // ─────────────────────────────────────────────────────────────────────────────
  describe("10. Maaş / Gelir İddiası Koruması", () => {
    it("Hiçbir fırsat rolünde kesin piyasa maaş garantisi ($190K+, $150K+) bulunmaz", () => {
      const dom = detectDomainCareerProfile("kod", "Yazılım Geliştirici", "senior", "büyüme", "Teknoloji");
      for (const opp of dom.targetOpportunities) {
        expect(opp).not.toMatch(/\$190K\+/);
        expect(opp).not.toMatch(/\$150K\+/);
      }
    });
  });

  // ─────────────────────────────────────────────────────────────────────────────
  // 11. TOOL RECOMMENDATION PROVENANCE
  // ─────────────────────────────────────────────────────────────────────────────
  describe("11. Araç Önerisi Epistemik Menşei", () => {
    it("Önerilen araçlar sektör ekosistemi örnekleridir, mutlak kader dayatması değildir", () => {
      const dom = detectDomainCareerProfile("finans", "Muhasebeci", "senior", "güvenlik", "Finans");
      expect(dom.recommendedToolsAndFrameworks[0]).toContain("Kurumsal Örnek");
    });
  });

  // ─────────────────────────────────────────────────────────────────────────────
  // 12. CROSS-MODULE CONSISTENCY
  // ─────────────────────────────────────────────────────────────────────────────
  describe("12. Modüller Arası Çelişki Denetimi", () => {
    it("Yüksek alaka düzeyine sahip milestone için üretilen eylem planı boş veya çelişkili değildir", () => {
      const impact = calculateMilestonePersonalImpact(milestone2029, profileA);
      const plan = deriveMilestoneActionPlan(milestone2029, impact, profileA);

      expect(impact.relevanceLevel).toBe("high");
      expect(plan.urgencyBand).toBe("immediate");
      expect(plan.concreteAction).toBeTruthy();
      expect(plan.forWhom).toContain("30 Yaş");
    });
  });

  // ─────────────────────────────────────────────────────────────────────────────
  // 13. GUEST & INCOMPLETE PROFILE REGRESSION (AŞAMA 37.1 SINIRLARI)
  // ─────────────────────────────────────────────────────────────────────────────
  describe("13. Guest & Eksik Profil Regresyon Koruması", () => {
    it("Misafir kullanıcıda skor 0 kalır ve isProfilePending bayrağı aktif olur", () => {
      const impactGuest = calculateMilestonePersonalImpact(milestone2029, null);
      expect(impactGuest.relevanceScore).toBe(0);
      expect(impactGuest.isProfilePending).toBe(true);
      expect(impactGuest.userAgeAtMilestone).toBeUndefined();

      const planGuest = deriveMilestoneActionPlan(milestone2029, impactGuest, null);
      expect(planGuest.isProfilePending).toBe(true);
      expect(planGuest.forWhom).toContain("Tüm Bireyler");
    });

    it("Mesleği boş olan profilde çökme yaşanmaz, güvenli genel plan üretilir", () => {
      const incProfile: UserProfile = { ...profileA, profession: "" };
      const impactInc = calculateMilestonePersonalImpact(milestone2029, incProfile);
      expect(impactInc.relevanceScore).toBe(0);
      expect(impactInc.isProfilePending).toBe(true);

      const planInc = deriveMilestoneActionPlan(milestone2029, impactInc, incProfile);
      expect(planInc.isProfilePending).toBe(true);
    });
  });

  // ─────────────────────────────────────────────────────────────────────────────
  // 14. USER-FACING BRAND CONSISTENCY (AŞAMA 38.1)
  // ─────────────────────────────────────────────────────────────────────────────
  describe("14. Kullanıcı Arayüzü Marka Tutarlılığı", () => {
    it("NexusHolodeckDrawer resmi başlık olarak 'TEKNOLOJİK EVRİM TAKVİMİ' ve 'Gelecek Takvimi' gösterir", () => {
      const drawerFile = path.join(process.cwd(), "src", "components", "NexusHolodeckDrawer.tsx");
      const content = fs.readFileSync(drawerFile, "utf-8");

      expect(content).toContain("TEKNOLOJİK EVRİM TAKVİMİ");
      expect(content).toContain("Gelecek Takvimi — Gezinti & Kontrol Paneli");
      expect(content).not.toContain("TEKNOLOJİK EVRİM KONTROL MERKEZİ");
    });
  });
});
