/**
 * AŞAMA 39.1 — OUTCOME LEARNING, REVIEW REASSESSMENT VE GERÇEK KARAR FAYDASI DENETİM TESTİ
 * 
 * Bu test paketi:
 * 1. ACTION → OUTCOME:
 *    Action status (completed / in_progress / planned / seen) değişiminin sadece pasif bir UI durumu olmadığını,
 *    eylem planını 'completed_mastery', 'active_execution', 'preparation' aşamalarına taşıyarak
 *    yeni tavsiye (new recommendation), stabilizasyon metrikleri ve takip takvimi ürettiğini kanıtlar.
 * 2. REVIEW REASSESSMENT:
 *    Gözden geçirme kontrolünün statik bir takvim yazısı değil, eylem durumuna (completed/in_progress/planned)
 *    ve kullanıcı notlarına göre yeniden kalibre edilen dinamik bir kontrol takvimi olduğunu kanıtlar.
 * 3. DECISION UTILITY (A/B/C Skor Katkısı Epistemik Sınıflandırması):
 *    Yol A (+10), Yol B (+20), Yol C (+35) skor artışlarının ampirik bir olasılık değil,
 *    kullanıcı tercih önceliği (USER_PREFERENCE - Parametric Heuristic) olduğunu doğrular.
 * 4. EMPLOYMENT STATUS DİNAMİĞİ:
 *    İş arayan (job_seeking) ve girişimci (entrepreneur) profillerinin zaman maliyeti, portfolyo
 *    ve ticarileşme bağlamlarında gerçek karara dönüştüğünü kanıtlar.
 * 5. SAME PROFILE / DIFFERENT OUTCOME NEGATIVE TEST:
 *    Aynı profil, aynı milestone ve aynı A/B/C seçimi için durumun (completed vs in_progress vs seen)
 *    çıktıyı deterministik olarak farklılaştırdığını; fark olmaması durumunun negatif test ile engellendiğini kanıtlar.
 */

import { describe, it, expect, beforeEach } from "vitest";
import {
  deriveMilestoneActionPlan,
  getMilestoneActionStatus,
  setMilestoneActionStatus,
  getMilestoneActionNote,
  setMilestoneActionNote,
  getMilestoneSelectedOption,
  setMilestoneSelectedOption,
} from "../utils/personalTimelineEngine";
import { safeStorage } from "../utils/safeStorage";
import { Milestone } from "../types";
import { UserProfile } from "../components/UserAuthModal";

describe("AŞAMA 39.1: OUTCOME LEARNING, REVIEW REASSESSMENT VE KARAR FAYDASI DENETİMİ", () => {
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

  const baseSoftwareProfile: UserProfile = {
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

  // ─────────────────────────────────────────────────────────────────────────────
  // 1. ACTION → OUTCOME (TRACKING WITH LEARNING VERIFICATION)
  // ─────────────────────────────────────────────────────────────────────────────
  describe("1. Action → Outcome: Durum Değişiminin Yeni Öneriye Dönüşümü", () => {
    it("Eylem tamamlandığında (completed) sistem başlangıç eğitim tavsiyesini yinelenmez; 'completed_mastery' aşamasına geçer", () => {
      // Eylem henüz yapılmamış (seen)
      const initialPlan = deriveMilestoneActionPlan(milestone2028, null, baseSoftwareProfile, "B", "seen");
      expect(initialPlan.outcomeStage).toBe("initial_assessment");
      expect(initialPlan.concreteAction).not.toContain("Kazanılan Yetkinlik Doğrulaması");

      // Kullanıcı eylemi tamamladığında (completed)
      const completedPlan = deriveMilestoneActionPlan(milestone2028, null, baseSoftwareProfile, "B", "completed");
      expect(completedPlan.outcomeStage).toBe("completed_mastery");
      expect(completedPlan.actionTypeLabel).toContain("Tamamlandı ✓");
      expect(completedPlan.concreteAction).toContain("Kazanılan Yetkinlik Doğrulaması");
      expect(completedPlan.expectedValue).toContain("Temel entegrasyon tamamlandı");
      expect(completedPlan.outcomeFollowUpAdvice).toContain("eylemi başarıyla tamamladınız");
    });

    it("Eylem eylemde (in_progress) olduğunda haftalık odaklanma ve 30 günlük pilot denetimi devreye girer", () => {
      const activePlan = deriveMilestoneActionPlan(milestone2028, null, baseSoftwareProfile, "B", "in_progress");
      expect(activePlan.outcomeStage).toBe("active_execution");
      expect(activePlan.reviewCheckpoint).toContain("Eylemde ⚡");
      expect(activePlan.reviewCheckpoint).toContain("30 Gün Sonra");
      expect(activePlan.outcomeFollowUpAdvice).toContain("aktif uygulama aşamasında");
    });

    it("Eylem planlandığında (planned) başlangıç hazırlığı ve 60 günlük hazırlık denetimi devreye girer", () => {
      const plannedPlan = deriveMilestoneActionPlan(milestone2028, null, baseSoftwareProfile, "B", "planned");
      expect(plannedPlan.outcomeStage).toBe("preparation");
      expect(plannedPlan.reviewCheckpoint).toContain("Planlandı 📅");
      expect(plannedPlan.reviewCheckpoint).toContain("60 Gün Sonra");
    });
  });

  // ─────────────────────────────────────────────────────────────────────────────
  // 2. REVIEW REASSESSMENT (GERÇEK DİNAMİK YENİDEN DEĞERLENDİRME)
  // ─────────────────────────────────────────────────────────────────────────────
  describe("2. Review Reassessment: Dinamik Gözden Geçirme Kalibrasyonu", () => {
    it("Review checkpoint statik bir takvim metni değildir; eylemin aşamasına göre yeniden kalibre edilir", () => {
      const planSeen = deriveMilestoneActionPlan(milestone2028, null, baseSoftwareProfile, "B", "seen");
      const planActive = deriveMilestoneActionPlan(milestone2028, null, baseSoftwareProfile, "B", "in_progress");
      const planCompleted = deriveMilestoneActionPlan(milestone2028, null, baseSoftwareProfile, "B", "completed");

      // Başlangıç ufkuna göre 6 ay iken, aktif eylemde 30 güne iner; tamamlandığında 12 aylık stabilizasyona evrilir
      expect(planSeen.reviewCheckpoint).toContain("6 Ay Sonra");
      expect(planActive.reviewCheckpoint).toContain("30 Gün Sonra");
      expect(planCompleted.reviewCheckpoint).toContain("12 Ay Sonra");

      expect(planSeen.reviewCheckpoint).not.toBe(planActive.reviewCheckpoint);
      expect(planActive.reviewCheckpoint).not.toBe(planCompleted.reviewCheckpoint);
    });

    it("Kullanıcının yazdığı kişisel eylem notu (userReflectionNote) sisteme entegre edilir ve korunur", () => {
      setMilestoneActionNote(2028, "Cursor ve Claude son sürümlerini CI pipeline'ına ekledim.", baseSoftwareProfile.email);
      expect(getMilestoneActionNote(2028, baseSoftwareProfile.email)).toBe("Cursor ve Claude son sürümlerini CI pipeline'ına ekledim.");

      const planWithNote = deriveMilestoneActionPlan(milestone2028, null, baseSoftwareProfile, "B");
      expect(planWithNote.userReflectionNote).toBe("Cursor ve Claude son sürümlerini CI pipeline'ına ekledim.");
    });
  });

  // ─────────────────────────────────────────────────────────────────────────────
  // 3. DECISION UTILITY (USER PREFERENCE HEURISTIC PRIORITY)
  // ─────────────────────────────────────────────────────────────────────────────
  describe("3. Decision Utility: Kullanıcı Tercih Önceliği Sınıflandırması", () => {
    it("A/B/C seçeneklerinin roadmap katkısı (+10/+20/+35) ampirik olasılık değil USER_PREFERENCE (Heuristic) niteliğindedir", () => {
      const planA = deriveMilestoneActionPlan(milestone2028, null, baseSoftwareProfile, "A");
      const planB = deriveMilestoneActionPlan(milestone2028, null, baseSoftwareProfile, "B");
      const planC = deriveMilestoneActionPlan(milestone2028, null, baseSoftwareProfile, "C");

      expect(planA.timeCost).toContain("Model Heuristic");
      expect(planB.timeCost).toContain("Model Heuristic");
      expect(planC.timeCost).toContain("Model Heuristic");

      expect(planA.expectedValue).toContain("model projeksiyonu");
      expect(planC.expectedValue).toContain("model projeksiyonu");
    });
  });

  // ─────────────────────────────────────────────────────────────────────────────
  // 4. EMPLOYMENT STATUS DİNAMİĞİ (JOB SEEKING VS ENTREPRENEUR VS EMPLOYED)
  // ─────────────────────────────────────────────────────────────────────────────
  describe("4. Employment Status Karar Bağlamı Testi", () => {
    it("İş arayan (job_seeking) kullanıcı için zaman maliyeti artar ve somut portfolyo/mülakat notu eklenir", () => {
      const profileJobSeeking: UserProfile = {
        ...baseSoftwareProfile,
        employmentStatus: "job_seeking",
      };

      const planJobSeeker = deriveMilestoneActionPlan(milestone2028, null, profileJobSeeking, "B", "seen");
      expect(planJobSeeker.employmentContext).toContain("İş Arayışı");
      expect(planJobSeeker.timeCost).toContain("10+ saat aktif portfolyo");
      expect(planJobSeeker.concreteAction).toContain("İş Arayışı Notu");
      expect(planJobSeeker.concreteAction).toContain("portfolyo");
    });

    it("Girişimci (entrepreneur) kullanıcı için ticarileştirme, MVP ve müşteri değeri bağlamı eklenir", () => {
      const profileEntrepreneur: UserProfile = {
        ...baseSoftwareProfile,
        employmentStatus: "entrepreneur",
      };

      const planEnt = deriveMilestoneActionPlan(milestone2028, null, profileEntrepreneur, "B", "seen");
      expect(planEnt.employmentContext).toContain("Girişimci");
      expect(planEnt.timeCost).toContain("6–8 saat ticari MVP");
      expect(planEnt.concreteAction).toContain("Girişimci Notu");
      expect(planEnt.concreteAction).toContain("MVP");
    });

    it("Standart çalışan (employed) kullanıcı kurumsal rol içi verimlilik odağını korur", () => {
      const planEmployed = deriveMilestoneActionPlan(milestone2028, null, baseSoftwareProfile, "B", "seen");
      expect(planEmployed.employmentContext).toContain("Kurumsal Rol İçi Verimlilik");
      expect(planEmployed.concreteAction).not.toContain("İş Arayışı Notu");
      expect(planEmployed.concreteAction).not.toContain("Girişimci Notu");
    });
  });

  // ─────────────────────────────────────────────────────────────────────────────
  // 5. SAME PROFILE / DIFFERENT OUTCOME NEGATIVE TEST
  // ─────────────────────────────────────────────────────────────────────────────
  describe("5. Same Profile / Different Outcome Negatif Testi", () => {
    it("Aynı profil + aynı milestone + aynı A/B/C için farklı durumlar (completed vs in_progress vs seen) mutlaka ayrışır", () => {
      const caseA_completed = deriveMilestoneActionPlan(milestone2028, null, baseSoftwareProfile, "C", "completed");
      const caseB_inProgress = deriveMilestoneActionPlan(milestone2028, null, baseSoftwareProfile, "C", "in_progress");
      const caseC_seen = deriveMilestoneActionPlan(milestone2028, null, baseSoftwareProfile, "C", "seen");

      // 1. Outcome stage ayrışımı
      expect(caseA_completed.outcomeStage).toBe("completed_mastery");
      expect(caseB_inProgress.outcomeStage).toBe("active_execution");
      expect(caseC_seen.outcomeStage).toBe("initial_assessment");

      // 2. Concrete action ayrışımı
      expect(caseA_completed.concreteAction).toContain("Kazanılan Yetkinlik Doğrulaması");
      expect(caseB_inProgress.concreteAction).not.toContain("Kazanılan Yetkinlik Doğrulaması");
      expect(caseC_seen.concreteAction).not.toContain("Kazanılan Yetkinlik Doğrulaması");

      // 3. Review checkpoint ayrışımı
      expect(caseA_completed.reviewCheckpoint).toContain("12 Ay Sonra");
      expect(caseB_inProgress.reviewCheckpoint).toContain("30 Gün Sonra");
      expect(caseC_seen.reviewCheckpoint).toContain("30–60 Gün Sonra");

      // 4. Time cost ayrışımı (tamamlanan eylem sadece stabilizasyon gerektirir)
      expect(caseA_completed.timeCost).toContain("30 dk stabilizasyon");
      expect(caseC_seen.timeCost).toContain("8–10 saat");

      // NEGATİF KANIT: Case A, Case B ve Case C kesinlikle aynı çıktıyı üretmez!
      expect(caseA_completed.concreteAction).not.toBe(caseC_seen.concreteAction);
      expect(caseA_completed.timeCost).not.toBe(caseC_seen.timeCost);
      expect(caseA_completed.reviewCheckpoint).not.toBe(caseC_seen.reviewCheckpoint);
    });
  });

  // ─────────────────────────────────────────────────────────────────────────────
  // 6. CLOSED LOOP TRANSITION INTEGRITY
  // ─────────────────────────────────────────────────────────────────────────────
  describe("6. Kapalı Döngü Geçiş Bütünlüğü (Closed Loop Integrity)", () => {
    it("PROFILE → MILESTONE → IMPACT → OPTIONS → CHOICE → ACTION → STATUS → REVIEW döngüsü kesintisiz çalışır", () => {
      // 1. User sets choice
      setMilestoneSelectedOption(2028, "C", baseSoftwareProfile.email);
      // 2. User sets status
      setMilestoneActionStatus(2028, "completed", baseSoftwareProfile.email);

      // 3. Action plan evaluates directly from stored loop
      const activePlan = deriveMilestoneActionPlan(milestone2028, null, baseSoftwareProfile);

      expect(activePlan.selectedOptionId).toBe("C");
      expect(activePlan.actionStatus).toBe("completed");
      expect(activePlan.outcomeStage).toBe("completed_mastery");
      expect(activePlan.isExplicitUserChoice).toBe(true);
      expect(activePlan.concreteAction).toContain("Kazanılan Yetkinlik Doğrulaması");
      expect(activePlan.reviewCheckpoint).toContain("Tamamlandı ✓");
    });
  });
});
