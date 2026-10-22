import { describe, it, expect } from "vitest";
import { TIMELINE_DATA } from "../data/timelineData";
import {
  calculateMilestonePersonalImpact,
  deriveMilestoneActionPlan,
  getMilestoneActionStatus,
  setMilestoneActionStatus,
  getAllMilestoneActionStatuses,
  getMilestoneActionNote,
  setMilestoneActionNote,
  getAllMilestoneActionNotes,
} from "./personalTimelineEngine";
import { UserProfile } from "../components/UserAuthModal";

describe("PHASE 31 — User Value & Decision Quality Suite", () => {
  const mockDoctorUser: UserProfile = {
    id: "test-doctor-31",
    email: "dr.ayse.31@hospital.org",
    fullName: "Dr. Ayşe",
    phone: "+905551112233",
    isEmailVerified: true,
    isPhoneVerified: true,
    joinedDate: "2026-01-01",
    credits: 100,
    plan: "free",
    profession: "Kardiyoloji Uzmanı Tıp Doktoru",
    industrySector: "Sağlık ve Biyoteknoloji",
    age: 40,
    primaryGoal: "Klinik sağlık araştırmalarında yaşam kalitesi ve genomik",
  };

  const mockEngineerUser: UserProfile = {
    id: "test-dev-31",
    email: "dev.can.31@cloud.io",
    fullName: "Can",
    phone: "+905551112244",
    isEmailVerified: true,
    isPhoneVerified: true,
    joinedDate: "2026-01-01",
    credits: 100,
    plan: "free",
    profession: "Bulut Sistemleri ve Yapay Zeka Mühendisi",
    industrySector: "Bilişim ve Bulut Sistemleri",
    age: 30,
    primaryGoal: "Yapay zeka araçlarıyla otonom sistem mimarisi",
  };

  // 1. BİLGİ → İÇGÖRÜ → KARAR → AKSİYON: Tam Karar Zinciri Bütünlüğü
  it("1. Complete decision chain seamlessly bridges from milestone knowledge to concrete personal action", () => {
    const nearMilestone = TIMELINE_DATA[0]; // 2026
    const personalImpact = calculateMilestonePersonalImpact(nearMilestone, mockEngineerUser);
    const actionPlan = deriveMilestoneActionPlan(nearMilestone, personalImpact, mockEngineerUser);

    // Bilgi (Knowledge)
    expect(nearMilestone.title).toBeTruthy();
    expect(nearMilestone.year).toBe(2026);

    // Kişisel Alaka (Personal Relevance)
    expect(personalImpact.relevanceScore).toBeGreaterThanOrEqual(50);
    expect(personalImpact.relevanceReason).toContain("Bulut Sistemleri");

    // İçgörü (Insight: Career Impact, Opportunity, Risk)
    expect(personalImpact.careerImpactSummary).toBeTruthy();
    expect(personalImpact.opportunitySummary).toBeTruthy();
    expect(personalImpact.riskSummary).toBeTruthy();

    // Karar & Aksiyon (Decision & Action)
    expect(actionPlan.concreteAction).toBeTruthy();
    expect(actionPlan.actionTypeLabel).toBeTruthy();
    expect(actionPlan.urgencyTitle).toBeTruthy();
    expect(actionPlan.reviewCheckpoint).toBeTruthy();
  });

  // 2. "NE ZAMAN TEKRAR KONTROL ETMELİYİM?" (Review Checkpoint Calculation)
  it("2. Explicitly answers 'When should I check back?' for all timeline horizons without omission", () => {
    TIMELINE_DATA.forEach((m) => {
      const impact = calculateMilestonePersonalImpact(m, mockEngineerUser);
      const plan = deriveMilestoneActionPlan(m, impact, mockEngineerUser);

      expect(plan.reviewCheckpoint).toBeDefined();
      expect(plan.reviewCheckpoint.length).toBeGreaterThan(15);
      expect(plan.reviewCheckpoint).toContain("Sonraki Kontrol:");

      if (m.year <= 2029) {
        expect(plan.reviewCheckpoint).toContain("6 Ay Sonra");
      } else if (m.year <= 2035) {
        expect(plan.reviewCheckpoint).toContain("12 Ay Sonra");
      } else if (m.year <= 2045) {
        expect(plan.reviewCheckpoint).toContain("2-3 Yılda Bir");
      } else {
        expect(plan.reviewCheckpoint).toContain("5 Yılda Bir");
      }
    });
  });

  // 3. AKSİYON DURUMU GEÇİŞLERİ (Takip Döngüsü: seen → planned → in_progress → completed)
  it("3. Action progress status transitions smoothly through full tracking lifecycle", () => {
    const testYear = 2028;
    const userEmail = "track_user_31@test.com";

    // Default status is 'seen'
    expect(getMilestoneActionStatus(testYear, userEmail)).toBe("seen");

    // Plan
    setMilestoneActionStatus(testYear, "planned", userEmail);
    expect(getMilestoneActionStatus(testYear, userEmail)).toBe("planned");

    // Start action
    setMilestoneActionStatus(testYear, "in_progress", userEmail);
    expect(getMilestoneActionStatus(testYear, userEmail)).toBe("in_progress");

    // Complete action
    setMilestoneActionStatus(testYear, "completed", userEmail);
    expect(getMilestoneActionStatus(testYear, userEmail)).toBe("completed");

    const allStatuses = getAllMilestoneActionStatuses(userEmail);
    expect(allStatuses[testYear]).toBe("completed");
  });

  // 4. GERİ BİLDİRİM & KİŞİSEL İLERLEME NOTLARI (Action Reflection Notes)
  it("4. Action notes enable personal reflection and check-in without external server dependencies", () => {
    const testYear = 2026;
    const userEmail = "notes_user_31@test.com";

    // Default note is empty
    expect(getMilestoneActionNote(testYear, userEmail)).toBe("");

    // Set personal reflection note
    const sampleNote = "GitHub Copilot ve Cursor IDE iş akışıma entegre edildi. Test süreçleri %40 hızlandı.";
    setMilestoneActionNote(testYear, sampleNote, userEmail);

    expect(getMilestoneActionNote(testYear, userEmail)).toBe(sampleNote);

    const allNotes = getAllMilestoneActionNotes(userEmail);
    expect(allNotes[testYear]).toBe(sampleNote);

    // Update reflection note
    const updatedNote = "İleri seviye ajan mimarisi kursu tamamlandı.";
    setMilestoneActionNote(testYear, updatedNote, userEmail);
    expect(getMilestoneActionNote(testYear, userEmail)).toBe(updatedNote);
  });

  // 5. KULLANICI İZOLASYONU (User Isolation in Action Progress & Notes)
  it("5. Strictly isolates action statuses and reflection notes between different user accounts", () => {
    const year = 2030;
    const userA = "alice_31@test.org";
    const userB = "bob_31@test.org";

    setMilestoneActionStatus(year, "completed", userA);
    setMilestoneActionNote(year, "Alice completed her task", userA);

    setMilestoneActionStatus(year, "planned", userB);
    setMilestoneActionNote(year, "Bob is planning his task", userB);

    expect(getMilestoneActionStatus(year, userA)).toBe("completed");
    expect(getMilestoneActionNote(year, userA)).toBe("Alice completed her task");

    expect(getMilestoneActionStatus(year, userB)).toBe("planned");
    expect(getMilestoneActionNote(year, userB)).toBe("Bob is planning his task");
  });

  // 6. SCENARIO A: YENİ VE PROFİLSİZ KULLANICI (Guest Safe Navigation)
  it("6. Guest user receives meaningful guidance and non-coercive CTAs without crashes or forced paywalls", () => {
    const milestone = TIMELINE_DATA[1];
    const guestImpact = calculateMilestonePersonalImpact(milestone, null);
    const guestAction = deriveMilestoneActionPlan(milestone, guestImpact, null);

    expect(guestImpact.isProfilePending).toBe(true);
    expect(guestImpact.careerImpactSummary).toContain("Profilinizde meslek belirtildiğinde");
    expect(guestAction.recommendationProvenance).toBe("deterministic_projection");
    expect(guestAction.concreteAction).toContain("Profil bilgilerinizi tamamlayarak");
    expect(guestAction.reviewCheckpoint).toBeDefined();
  });

  // 7. SCENARIO B: PROFİLİ TAM KULLANICI (Tailored Value Quality)
  it("7. Full profile user receives domain-specific actions without generic corporate boilerplate", () => {
    const bioMilestone = TIMELINE_DATA.find((m) => m.category === "Biyoloji & Tıp")!;
    const doctorImpact = calculateMilestonePersonalImpact(bioMilestone, mockDoctorUser);
    const doctorAction = deriveMilestoneActionPlan(bioMilestone, doctorImpact, mockDoctorUser);

    expect(doctorImpact.relevanceLevel).toBe("high");
    expect(doctorAction.actionType).toBe("life_longevity");
    expect(doctorAction.actionTypeLabel).toContain("Biyo-Yaşam");
    expect(doctorAction.concreteAction).toContain("Kardiyoloji");
  });

  // 8. DETERMINİZM & PERFORMANS: < 5ms Senkron Yürütme ve Sıfır Stokastik Sapma
  it("8. Action and decision evaluations execute 100% deterministically in < 5ms", () => {
    const m = TIMELINE_DATA[4];
    const start = performance.now();
    const run1 = deriveMilestoneActionPlan(m, calculateMilestonePersonalImpact(m, mockEngineerUser), mockEngineerUser);
    const run2 = deriveMilestoneActionPlan(m, calculateMilestonePersonalImpact(m, mockEngineerUser), mockEngineerUser);
    const elapsed = performance.now() - start;

    expect(run1.concreteAction).toBe(run2.concreteAction);
    expect(run1.reviewCheckpoint).toBe(run2.reviewCheckpoint);
    expect(run1.urgencyTitle).toBe(run2.urgencyTitle);
    expect(elapsed).toBeLessThan(5);
  });
});
