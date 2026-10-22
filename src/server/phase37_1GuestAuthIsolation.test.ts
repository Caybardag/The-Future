import { describe, it, expect } from "vitest";
import { TIMELINE_DATA } from "../data/timelineData";
import {
  calculateMilestonePersonalImpact,
  calculateTelegramSignalPersonalImpact,
  deriveMilestoneActionPlan,
  LiveIntelligenceSignal,
} from "../utils/personalTimelineEngine";
import { UserProfile } from "../components/UserAuthModal";

describe("AŞAMA 37.1 — GUEST / AUTH SINIRI VE KİŞİSEL VERİ İZOLASYON DOĞRULAMA TESTLERİ", () => {
  const milestone2029 = TIMELINE_DATA.find((m) => m.year === 2029) || TIMELINE_DATA[0];
  const milestone2040 = TIMELINE_DATA.find((m) => m.year === 2040) || TIMELINE_DATA[10];

  const sampleSignal: LiveIntelligenceSignal = {
    id: "sig_ai_test_2026",
    title: "Otonom Kodlama Ajanları ve Derleyici Entegrasyonu",
    summary: "Yapay zeka modelleri kod yazımı ve mimari test süreçlerini otomatize ediyor.",
    source: "arXiv:2603.01182",
    date: "2026-03-28",
    extractedYear: 2028,
    category: "Yapay Zeka & Bilişim",
    impactVerdict: "HIGH_BREAKTHROUGH",
    trlLevel: 7,
  };

  const completeUser: UserProfile = {
    id: "usr_auth_real",
    phone: "+905001112233",
    isEmailVerified: true,
    isPhoneVerified: true,
    joinedDate: "2026-01-01",
    credits: 100,
    plan: "pro",
    username: "dev_senior_32",
    email: "dev@example.com",
    fullName: "Gerçek Kullanıcı",
    profession: "Yazılım Mimarı",
    age: 32,
    seniority: "senior",
    industrySector: "Bilişim",
    personalGoal: "Teknoloji liderliği",
  };

  // ─────────────────────────────────────────────────────────────────────────────
  // 1. GUEST KULLANICI İÇİN KİŞİSEL VERİ VE SKOR SIFIRLANMASI (ZERO LEAKAGE)
  // ─────────────────────────────────────────────────────────────────────────────
  describe("1. Guest Kullanıcı Koruma Sınırı", () => {
    it("Guest (null profil) için relevanceScore kesinlikle 0 döner, yapay skor üretilmez", () => {
      const impact = calculateMilestonePersonalImpact(milestone2029, null);
      expect(impact.isProfilePending).toBe(true);
      expect(impact.relevanceScore).toBe(0);
      expect(impact.relevanceLevel).toBe("low");
    });

    it("Guest (null profil) için yaş hesabı yapılmaz (userAgeAtMilestone undefined olmalıdır)", () => {
      const impact2029 = calculateMilestonePersonalImpact(milestone2029, null);
      expect(impact2029.userAgeAtMilestone).toBeUndefined();

      const impact2040 = calculateMilestonePersonalImpact(milestone2040, null);
      expect(impact2040.userAgeAtMilestone).toBeUndefined();
    });

    it("Guest için canlı sinyal (Telegram/Live Intelligence) relevanceScore 0 döner ve yaş undefined olur", () => {
      const signalImpact = calculateTelegramSignalPersonalImpact(sampleSignal, null);
      expect(signalImpact.isProfilePending).toBe(true);
      expect(signalImpact.relevanceScore).toBe(0);
      expect(signalImpact.relevanceLevel).toBe("low");
      expect(signalImpact.userAgeAtImpact).toBeUndefined();
    });

    it("Guest için kariyer ve hazırlık metinleri kişisel meslek içermez, profil tamamlama yönlendirmesi yapar", () => {
      const impact = calculateMilestonePersonalImpact(milestone2029, null);
      expect(impact.careerImpactSummary).toContain("Profilinizde meslek belirtildiğinde");
      expect(impact.preparationAdvice).toContain("Profil bilgilerinizi tamamlayarak");
      expect(impact.careerImpactSummary).not.toContain("Yazılım");
      expect(impact.careerImpactSummary).not.toContain("Finans");
    });

    it("Guest için eylem planı (deriveMilestoneActionPlan) kişiselleştirilmiş başlık veya rol içermez", () => {
      const actionPlan = deriveMilestoneActionPlan(milestone2029, null);
      expect(actionPlan.isProfilePending).toBe(true);
      expect(actionPlan.userAgeAtMilestone).toBeUndefined();
      expect(actionPlan.recommendedMilestoneFocus).toContain("Profil bilgilerinizi tamamlayarak");
    });
  });

  // ─────────────────────────────────────────────────────────────────────────────
  // 2. PROFİLİ EKSİK KULLANICI (PROFILE INCOMPLETE)
  // ─────────────────────────────────────────────────────────────────────────────
  describe("2. Profili Eksik Kullanıcı Koruma Sınırı", () => {
    it("Mesleği boş olan kullanıcıda isProfilePending true olur ve relevanceScore 0 kalır", () => {
      const incompleteProfile: UserProfile = {
        ...completeUser,
        profession: "",
      };
      const impact = calculateMilestonePersonalImpact(milestone2029, incompleteProfile);
      expect(impact.isProfilePending).toBe(true);
      expect(impact.relevanceScore).toBe(0);
    });

    it("Mesleği boş ama yaşı olan kullanıcıda yaş doğrulanır ancak meslek tahmini uydurulmaz", () => {
      const incompleteProfileWithAge: UserProfile = {
        ...completeUser,
        profession: "   ",
        age: 25,
      };
      const impact = calculateMilestonePersonalImpact(milestone2029, incompleteProfileWithAge);
      expect(impact.isProfilePending).toBe(true);
      expect(impact.relevanceScore).toBe(0);
      expect(impact.userAgeAtMilestone).toBe(28); // 25 + (2029 - 2026) = 28
      expect(impact.careerImpactSummary).toContain("Profilinizde meslek belirtildiğinde");
    });

    it("Yaşı olmayan kullanıcının yaşı asla varsayılan 28 olarak projeksiyonlanmaz", () => {
      const profileNoAge: UserProfile = {
        ...completeUser,
        age: undefined,
      };
      const impact = calculateMilestonePersonalImpact(milestone2029, profileNoAge);
      expect(impact.userAgeAtMilestone).toBeUndefined();
    });
  });

  // ─────────────────────────────────────────────────────────────────────────────
  // 3. AUTHENTICATED & PROFİLİ TAM KULLANICI (GENUINE PERSONALIZATION)
  // ─────────────────────────────────────────────────────────────────────────────
  describe("3. Giriş Yapmış & Tam Profilli Kullanıcı Doğrulaması", () => {
    it("Tam profilli kullanıcı için gerçek kişisel etki ve skor üretilir", () => {
      const impact = calculateMilestonePersonalImpact(milestone2029, completeUser);
      expect(impact.isProfilePending).toBe(false);
      expect(impact.relevanceScore).toBeGreaterThanOrEqual(50);
      expect(impact.userAgeAtMilestone).toBe(35); // 32 + (2029 - 2026) = 35
      expect(impact.careerImpactSummary).toContain("Yazılım Mimarı");
    });

    it("Canlı sinyaller için tam profilli kullanıcıya sektörel eşleşme ve tavsiye üretilir", () => {
      const signalImpact = calculateTelegramSignalPersonalImpact(sampleSignal, completeUser);
      expect(signalImpact.isProfilePending).toBe(false);
      expect(signalImpact.relevanceScore).toBeGreaterThanOrEqual(65);
      expect(signalImpact.careerImpactSummary).toContain("Yazılım Mimarı");
      expect(signalImpact.userAgeAtImpact).toBe(34); // 32 + (2028 - 2026) = 34
    });
  });
});
