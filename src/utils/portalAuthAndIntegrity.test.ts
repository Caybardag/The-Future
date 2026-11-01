import { describe, it, expect } from "vitest";
import fs from "fs";
import path from "path";

describe("PORTAL AUTH, MEMBER AVATAR, & EPISTEMIC DATA INTEGRITY TESTS", () => {
  const appTsxPath = path.resolve(__dirname, "../App.tsx");
  const portalTsxPath = path.resolve(__dirname, "../components/EpicIntelligenceHubPortal.tsx");
  const telegramEnginePath = path.resolve(__dirname, "../server/telegramIngestionEngine.ts");

  const appContent = fs.readFileSync(appTsxPath, "utf-8");
  const portalContent = fs.readFileSync(portalTsxPath, "utf-8");
  const telegramEngineContent = fs.readFileSync(telegramEnginePath, "utf-8");

  // ─────────────────────────────────────────────────────────────────────────────
  // TEST 1: Member Avatar & Ayarlar Trigger Profile Modal, Never OpenAuthModal directly
  // ─────────────────────────────────────────────────────────────────────────────
  it("Member avatar and Ayarlar in Portal use handleUserAvatarClick instead of hardcoded openAuthModal", () => {
    // Member avatar button should use handleUserAvatarClick
    expect(portalContent).toContain("onClick={handleUserAvatarClick}");

    // The user avatar block must use handleUserAvatarClick
    const avatarBlockMatch = portalContent.match(/\{\/\* User Avatar & Name \*\/\}\s*<button[^>]*onClick=\{([^}]+)\}/);
    expect(avatarBlockMatch).not.toBeNull();
    expect(avatarBlockMatch?.[1]).toBe("handleUserAvatarClick");

    // Ayarlar footer button must use handleUserAvatarClick
    const ayarlarMatch = portalContent.match(/onClick=\{([^}]+)\}[^>]*>\s*Ayarlar/);
    expect(ayarlarMatch).not.toBeNull();
    expect(ayarlarMatch?.[1]).toBe("handleUserAvatarClick");
  });

  // ─────────────────────────────────────────────────────────────────────────────
  // TEST 2: App.tsx connects onOpenUserProfile to EpicIntelligenceHubPortal
  // ─────────────────────────────────────────────────────────────────────────────
  it("App.tsx properly supplies onOpenUserProfile to EpicIntelligenceHubPortal and registers event listener", () => {
    // onOpenUserProfile passed as prop
    expect(appContent).toMatch(/<EpicIntelligenceHubPortal[\s\S]*?onOpenUserProfile=\{/);

    // future-open-user-profile event listener registered
    expect(appContent).toContain("future-open-user-profile");
  });

  // ─────────────────────────────────────────────────────────────────────────────
  // TEST 3: Zero Synthetic / Fake Signal Fallbacks in Portal
  // ─────────────────────────────────────────────────────────────────────────────
  it("Portal does not contain hardcoded 34 signal fallback or canned articles in signal catch/else", () => {
    // No hardcoded 34 signal count in signal fetch
    expect(portalContent).not.toContain("setLiveSignalCount(34)");

    // No canned synthetic articles in fetchSignals
    expect(portalContent).not.toContain("Yapay zeka ile biyoteknolojik araştırmalarda yeni patent başvuruları artıyor.");
    expect(portalContent).not.toContain("2032'de robotik sektöründe %40 büyüme öngörülüyor.");
    expect(portalContent).not.toContain("Yeni nesil batarya teknolojilerinde önemli ilerleme kaydedildi.");

    // Contains empty state text for real zero-signal scenarios
    expect(portalContent).toContain("Henüz kaynak kaydı bulunmuyor.");
    expect(portalContent).toContain("Bu bölüm dış kaynaklardan veya bilgi havuzundan yeni kayıtlar alındığında güncellenecektir.");
  });

  // ─────────────────────────────────────────────────────────────────────────────
  // TEST 4: Job Risk Calculation Has Zero Hardcoded Industry Dictionaries
  // ─────────────────────────────────────────────────────────────────────────────
  it("memberJobRisk yields Hesaplanmadı when uncalculated, with zero hardcoded percentages", () => {
    // Checks that uncalculated state returns Hesaplanmadı and percentage: 0
    expect(portalContent).toContain('level: "Hesaplanmadı"');
    expect(portalContent).toContain("percentage: 0");
    expect(portalContent).toContain("Risk analizi henüz hesaplanmadı");

    // Must not have hardcoded mapping table like { yazılım: 55, ... }
    expect(portalContent).not.toMatch(/yazılım.*55/i);
    expect(portalContent).not.toMatch(/tasarım.*75/i);
  });

  // ─────────────────────────────────────────────────────────────────────────────
  // TEST 5: Epistemic Integrity in Telegram Ingestion Fallbacks
  // ─────────────────────────────────────────────────────────────────────────────
  it("Deterministic fallbacks label model inferences as Model Projeksiyonu / Değerlendirmesi instead of Saha Kanıtı", () => {
    expect(telegramEngineContent).not.toContain('"Saha Kanıtı:');
    expect(telegramEngineContent).not.toContain('"Laboratuvar Kanıtı:');
    expect(telegramEngineContent).toContain('"Model Projeksiyonu:');
    expect(telegramEngineContent).toContain("Model Değerlendirmesi:");
  });

  // ─────────────────────────────────────────────────────────────────────────────
  // TEST 6: Registered User Google Login Bypasses Registration Steps
  // ─────────────────────────────────────────────────────────────────────────────
  it("FuturisticRegistrationGate detects already registered users and logs them in directly without forcing Step 2", () => {
    const gatePath = path.resolve(__dirname, "../components/FuturisticRegistrationGate.tsx");
    const gateContent = fs.readFileSync(gatePath, "utf-8");

    // Must check isAlreadyRegistered before pushing to Step 2
    expect(gateContent).toContain("isAlreadyRegistered");
    expect(gateContent).toContain("onLoginExistingUser(loggedUser)");

    // Must not have the old hardcoded comment forcing wizard
    expect(gateContent).not.toContain("CRITICAL: NEVER bypass the onboarding steps!");
  });

  // ─────────────────────────────────────────────────────────────────────────────
  // TEST 7: Step 1 Detects Existing Email and Switches to Login
  // ─────────────────────────────────────────────────────────────────────────────
  it("handleNextStep in FuturisticRegistrationGate detects existing accounts in Step 1 and redirects to login", () => {
    const gatePath = path.resolve(__dirname, "../components/FuturisticRegistrationGate.tsx");
    const gateContent = fs.readFileSync(gatePath, "utf-8");

    expect(gateContent).toContain("getAccountByEmail(email)");
    expect(gateContent).toContain('setGateMode("login")');
  });

  // ─────────────────────────────────────────────────────────────────────────────
  // TEST 8: isUserProfileComplete Respects isOnboardingCompleted
  // ─────────────────────────────────────────────────────────────────────────────
  it("isUserProfileComplete treats isOnboardingCompleted as true and demographic fields properly", () => {
    const userAuthModalPath = path.resolve(__dirname, "../components/UserAuthModal.tsx");
    const userAuthModalContent = fs.readFileSync(userAuthModalPath, "utf-8");

    expect(userAuthModalContent).toContain("if (profile.isOnboardingCompleted) return true");
  });

  // ─────────────────────────────────────────────────────────────────────────────
  // TEST 9: Prediction History Record - Zero Fake Fallbacks (85, 88, 10, 2035)
  // ─────────────────────────────────────────────────────────────────────────────
  it("recordPredictionHistoryEntry and PredictionHistoryService leave uncomputed metrics as null", () => {
    const predHistUtilPath = path.resolve(__dirname, "../utils/predictionHistory.ts");
    const predHistUtilContent = fs.readFileSync(predHistUtilPath, "utf-8");
    const predHistServicePath = path.resolve(__dirname, "../services/predictionHistoryService.ts");
    const predHistServiceContent = fs.readFileSync(predHistServicePath, "utf-8");

    // Must NOT contain fake fallback metrics
    expect(predHistUtilContent).not.toContain("feasibilityScore ?? 85");
    expect(predHistUtilContent).not.toContain("impactLevel ?? 88");
    expect(predHistUtilContent).not.toContain("creditsSpent ?? 10");
    expect(predHistUtilContent).not.toContain("targetYear || 2035");

    expect(predHistServiceContent).not.toContain("feasibilityScore: data.feasibilityScore ?? 85");
    expect(predHistServiceContent).not.toContain("impactLevel: data.impactLevel ?? 88");
    expect(predHistServiceContent).not.toContain("creditsSpent: data.creditsSpent ?? 10");
    expect(predHistServiceContent).not.toContain("targetYear: data.targetYear || 2035");

    // Must use null defaults for uncomputed fields
    expect(predHistUtilContent).toContain("feasibilityScore: typeof entry.metrics?.feasibilityScore === \"number\" ? entry.metrics.feasibilityScore : null");
    expect(predHistUtilContent).toContain("impactLevel: typeof entry.metrics?.impactLevel === \"number\" ? entry.metrics.impactLevel : null");
    expect(predHistUtilContent).toContain("creditsSpent: typeof entry.creditsSpent === \"number\" ? entry.creditsSpent : null");
    expect(predHistUtilContent).toContain("targetYear: typeof entry.targetYear === \"number\" ? entry.targetYear : null");
  });

  // ─────────────────────────────────────────────────────────────────────────────
  // TEST 10: FutureVerdictView - Inevitability Score Labeled as Model Değerlendirmesi
  // ─────────────────────────────────────────────────────────────────────────────
  it("FutureVerdictView does not present static scenario metrics as real-world probability", () => {
    const verdictPath = path.resolve(__dirname, "../components/FutureVerdictView.tsx");
    const verdictContent = fs.readFileSync(verdictPath, "utf-8");

    // Must have STATIC_SCENARIO_DATA badge
    expect(verdictContent).toContain("STATİK SENARYO VERİSİ");
    // Must label score as Model Değerlendirmesi
    expect(verdictContent).toContain("Model Değerlendirmesi");
    // Must NOT present it as real-world absolute probability (%95 gerçekleşecek etc)
    expect(verdictContent).not.toContain("%95 gerçekleşecek");
    expect(verdictContent).not.toContain("%{verdict.inevitabilityScore} Senaryo Ağırlığı");
  });

  // ─────────────────────────────────────────────────────────────────────────────
  // TEST 11: MilestoneDetailModal & ComparisonTool - Model Projection Provenance
  // ─────────────────────────────────────────────────────────────────────────────
  it("MilestoneDetailModal and ComparisonTool present probability as Model Projeksiyonu / Model Skoru", () => {
    const detailModalPath = path.resolve(__dirname, "../components/MilestoneDetailModal.tsx");
    const detailModalContent = fs.readFileSync(detailModalPath, "utf-8");
    const compToolPath = path.resolve(__dirname, "../components/ComparisonTool.tsx");
    const compToolContent = fs.readFileSync(compToolPath, "utf-8");

    expect(detailModalContent).toContain("Model Projeksiyonu");
    expect(compToolContent).toContain("Model Skoru");
  });
});

