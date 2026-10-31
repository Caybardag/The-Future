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
});
