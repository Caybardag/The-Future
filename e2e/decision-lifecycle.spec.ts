import { test, expect } from "@playwright/test";

/**
 * AŞAMA 42.2 — GERÇEK PLAYWRIGHT E2E KAPANIŞ TESTİ
 * 
 * Gerçek tarayıcı (headless Chrome) üzerinde:
 * 1. Login/Profile -> Milestone -> Seçenek A/B/C seçimi
 * 2. Kaydetme & DOM geri bildirimi
 * 3. page.reload() sonrası seçimin geri yüklenmesi
 * 4. Roadmap üzerinde seçimin (YOL C) yansıması
 * 5. Aksiyon durumu güncellemesi (Başlandı -> Tamamlandı)
 * 6. Kullanıcı deneyim notu girişi (Friction / verimsizlik notu)
 * 7. OUTCOME_FRICTION_PIVOT / Strateji Değerlendirmesi tavsiyesi (Yol B)
 * 8. İkinci page.reload() sonrası tüm state'in korunması
 * 9. Çoklu BrowserContext ile Guest ve User B izolasyonu
 */

const userAProfile = {
  id: "usr_super_ahmet",
  fullName: "Ahmet Mimar",
  email: "warfacelove46@gmail.com",
  role: "superadmin",
  profession: "Yazılım Mimarı",
  age: 34,
  industrySector: "Yapay Zeka & Bilişim",
  seniority: "senior",
  primaryGoal: "is_guvencesi",
  plan: "quantum_vip",
  credits: 9999,
  isOnboardingCompleted: true,
};

const userBProfile = {
  id: "usr_e2e_user_b",
  fullName: "Mehmet Güvenlik",
  email: "mehmet_guvenlik@gelecektakvimi.org",
  profession: "Siber Güvenlik Uzmanı",
  age: 40,
  industrySector: "Kuantum & Güvenlik",
  seniority: "senior",
  primaryGoal: "is_guvencesi",
  plan: "pro",
  credits: 100,
  isOnboardingCompleted: true,
};

test.describe("AŞAMA 42.2 — Gerçek Browser UI Karar & Yaşam Döngüsü E2E", () => {
  test("1. Gerçek Browser Zinciri: User Decision C -> Reload -> Roadmap -> Action -> Outcome Note -> Reassessment -> Reload", async ({ page }) => {
    // 1. User A profilini ve çerez izinlerini localStorage'a tanımlayarak sayfayı aç
    await page.addInitScript((profile) => {
      localStorage.setItem("future_timeline_user", JSON.stringify(profile));
      localStorage.setItem("user_profile_account", JSON.stringify(profile));
      const db: Record<string, any> = {};
      db[profile.email.toLowerCase()] = profile;
      localStorage.setItem("future_timeline_accounts_db", JSON.stringify(db));
      localStorage.setItem("cookie_consent_choice", "accepted");
      localStorage.setItem("cookie_consent_date", new Date().toISOString());
      localStorage.setItem("onboarding_banner_dismissed", "true");
      sessionStorage.setItem("has_entered_console", "true");
    }, userAProfile);

    await page.goto("/");
    await page.waitForLoadState("domcontentloaded");

    // Konsola Geç butonuna tıkla (veya doğrudan Timeline'a geç)
    const consoleBtn = page.getByRole("button", { name: /Konsola Geç/i }).first();
    if (await consoleBtn.isVisible()) {
      await consoleBtn.click();
    }

    // Timeline üzerinde "BU GELİŞME BENİ NASIL ETKİLER?" veya bir dönüm noktası detay butonunu bul
    const impactBtn = page.locator("#timeline-action-job-impact-btn");
    await expect(impactBtn).toBeVisible({ timeout: 10000 });
    await impactBtn.click();

    // MilestoneDetailModal açıldığını doğrula
    const modal = page.locator("div.fixed.inset-0").filter({ hasText: /Dünya & Küresel Etki|Benim İçin/i }).first();
    await expect(modal).toBeVisible();

    // "Benim İçin" sekmesine tıkla
    const personalTabBtn = modal.getByRole("button", { name: /Benim İçin/i }).first();
    await personalTabBtn.click();

    // 3 Alternatif Stratejik Karar Yolu başlığını bekle
    await expect(modal.getByText(/3 Alternatif Stratejik Karar Yolu/i)).toBeVisible();

    // Yol C seçeneğine tıkla (Stratejik Sıçrama)
    const optionCCard = modal.locator("div").filter({ hasText: /YOL C/i }).last();
    await expect(optionCCard).toBeVisible();
    await optionCCard.click();

    // Seçim geri bildirimini doğrula (AKTİF veya SEÇİLEN ✓)
    await expect(modal.getByText(/SEÇİLEN ✓/i)).toBeVisible();

    // 6. Sayfayı reload et
    await page.reload();
    await page.waitForLoadState("domcontentloaded");

    // Modal tekrar açmak için Konsol -> Impact butonuna tıkla
    const consoleBtnAfterReload = page.getByRole("button", { name: /Konsola Geç/i }).first();
    if (await consoleBtnAfterReload.isVisible()) {
      await consoleBtnAfterReload.click();
    }
    const impactBtnAfterReload = page.locator("#timeline-action-job-impact-btn");
    await expect(impactBtnAfterReload).toBeVisible();
    await impactBtnAfterReload.click();

    // Modal açıldığında "Benim İçin" sekmesine git
    const modalAfterReload = page.locator("div.fixed.inset-0").filter({ hasText: /Dünya & Küresel Etki|Benim İçin/i }).first();
    await modalAfterReload.getByRole("button", { name: /Benim İçin/i }).first().click();

    // 7. Reload sonrası Yol C'nin hâlâ SEÇİLEN ✓ olduğunu DOM'dan doğrula
    await expect(modalAfterReload.locator("div").filter({ hasText: /YOL C/i }).locator("text=SEÇİLEN ✓").first()).toBeVisible();

    // 8. Action Durumunu Güncelle: "⚡ Başlandı" ve ardından "✓ Tamamlandı"
    const inProgressBtn = modalAfterReload.getByRole("button", { name: /Başlandı/i }).first();
    await inProgressBtn.click();

    const completedBtn = modalAfterReload.getByRole("button", { name: /Tamamlandı/i }).first();
    await completedBtn.click();

    // 9. Outcome / Refleksiyon alanına sürtünme & verimsizlik içeren gerçek metin gir
    const noteTextarea = modalAfterReload.locator("textarea").first();
    await noteTextarea.fill("Uygulamada ciddi verim düşüklüğü ve tıkanma yaşıyorum, bekleneni vermedi.");

    const saveNoteBtn = modalAfterReload.getByRole("button", { name: /Notu Kaydet/i }).first();
    await saveNoteBtn.click();

    // 10. Reassessment / Karar Değerlendirme çıktısının UI'da belirdiğini doğrula
    // (Friction nedeniyle Yol B tavsiyesi üretilmeli)
    await expect(modalAfterReload.getByText(/Canlı İstihbarat ile Strateji Değerlendirmesi|Tavsiye: Yol B/i).first()).toBeVisible({ timeout: 5000 });

    // 11. İkinci kez page.reload() yaparak kalıcılığı doğrula
    await page.reload();
    await page.waitForLoadState("domcontentloaded");

    const consoleBtn2 = page.getByRole("button", { name: /Konsola Geç/i }).first();
    if (await consoleBtn2.isVisible()) {
      await consoleBtn2.click();
    }
    await page.locator("#timeline-action-job-impact-btn").click();

    const modalFinal = page.locator("div.fixed.inset-0").filter({ hasText: /Dünya & Küresel Etki|Benim İçin/i }).first();
    await modalFinal.getByRole("button", { name: /Benim İçin/i }).first().click();

    // Notun ve Reassessment tavsiyesinin reload sonrasında da DOM'da korunduğunu doğrula
    await expect(modalFinal.getByText("Uygulamada ciddi verim düşüklüğü ve tıkanma yaşıyorum, bekleneni vermedi.")).toBeVisible();
    await expect(modalFinal.getByText(/Tavsiye: Yol B/i).first()).toBeVisible();
  });

  test("2. Çoklu BrowserContext İzolasyonu: Guest vs User A vs User B", async ({ browser }) => {
    // -------------------------------------------------------------
    // CONTEXT 1: Authenticated User A (Yol C seçer)
    // -------------------------------------------------------------
    const contextA = await browser.newContext();
    const pageA = await contextA.newPage();
    await pageA.addInitScript((profile) => {
      localStorage.setItem("future_timeline_user", JSON.stringify(profile));
      localStorage.setItem("user_profile_account", JSON.stringify(profile));
      const db: Record<string, any> = {};
      db[profile.email.toLowerCase()] = profile;
      localStorage.setItem("future_timeline_accounts_db", JSON.stringify(db));
      localStorage.setItem("cookie_consent_choice", "accepted");
      localStorage.setItem("cookie_consent_date", new Date().toISOString());
      localStorage.setItem("onboarding_banner_dismissed", "true");
      sessionStorage.setItem("has_entered_console", "true");
    }, userAProfile);

    await pageA.goto("/");
    const consoleBtnA = pageA.getByRole("button", { name: /Konsola Geç/i }).first();
    if (await consoleBtnA.isVisible()) await consoleBtnA.click();

    await pageA.locator("#timeline-action-job-impact-btn").click();
    const modalA = pageA.locator("div.fixed.inset-0").filter({ hasText: /Dünya & Küresel Etki|Benim İçin/i }).first();
    await modalA.getByRole("button", { name: /Benim İçin/i }).first().click();

    // User A Yol C seçer
    const optC = modalA.locator("div").filter({ hasText: /YOL C/i }).last();
    await optC.click();
    await expect(modalA.getByText(/SEÇİLEN ✓/i)).toBeVisible();

    // -------------------------------------------------------------
    // CONTEXT 2: Guest User (Hiç giriş yapmamış temiz oturum)
    // -------------------------------------------------------------
    const contextGuest = await browser.newContext();
    const pageGuest = await contextGuest.newPage();
    await pageGuest.addInitScript(() => {
      localStorage.setItem("cookie_consent_choice", "accepted");
      localStorage.setItem("onboarding_banner_dismissed", "true");
      sessionStorage.setItem("has_entered_console", "true");
    });
    await pageGuest.goto("/");

    const consoleBtnGuest = pageGuest.getByRole("button", { name: /Konsola Geç/i }).first();
    if (await consoleBtnGuest.isVisible()) await consoleBtnGuest.click();

    await pageGuest.locator("#timeline-action-job-impact-btn").click();
    const modalGuest = pageGuest.locator("div.fixed.inset-0").filter({ hasText: /Dünya & Küresel Etki|Benim İçin/i }).first();
    await modalGuest.getByRole("button", { name: /Benim İçin/i }).first().click();

    // Guest kullanıcısında User A'nın Yol C seçimi ASLA görünmemelidir!
    await expect(modalGuest.locator("text=SEÇİLEN ✓")).not.toBeVisible();

    // -------------------------------------------------------------
    // CONTEXT 3: User B (Yol A seçer ve User A'yı etkilemez)
    // -------------------------------------------------------------
    const contextB = await browser.newContext();
    const pageB = await contextB.newPage();
    await pageB.addInitScript((profile) => {
      localStorage.setItem("future_timeline_user", JSON.stringify(profile));
      localStorage.setItem("user_profile_account", JSON.stringify(profile));
      const db: Record<string, any> = {};
      db[profile.email.toLowerCase()] = profile;
      localStorage.setItem("future_timeline_accounts_db", JSON.stringify(db));
      localStorage.setItem("cookie_consent_choice", "accepted");
      localStorage.setItem("cookie_consent_date", new Date().toISOString());
      localStorage.setItem("onboarding_banner_dismissed", "true");
      sessionStorage.setItem("has_entered_console", "true");
    }, userBProfile);

    await pageB.goto("/");
    const consoleBtnB = pageB.getByRole("button", { name: /Konsola Geç/i }).first();
    if (await consoleBtnB.isVisible()) await consoleBtnB.click();

    await pageB.locator("#timeline-action-job-impact-btn").click();
    const modalB = pageB.locator("div.fixed.inset-0").filter({ hasText: /Dünya & Küresel Etki|Benim İçin/i }).first();
    await modalB.getByRole("button", { name: /Benim İçin/i }).first().click();

    // User B Yol A seçer
    const optA = modalB.locator("div").filter({ hasText: /YOL A/i }).last();
    await optA.click();
    await expect(modalB.locator("div").filter({ hasText: /YOL A/i }).locator("text=SEÇİLEN ✓").first()).toBeVisible();

    // User A'nın oturumuna dön ve hâlâ Yol C olduğunu tekrar doğrula
    await pageA.reload();
    const consoleBtnA2 = pageA.getByRole("button", { name: /Konsola Geç/i }).first();
    if (await consoleBtnA2.isVisible()) await consoleBtnA2.click();
    await pageA.locator("#timeline-action-job-impact-btn").click();
    const modalAReloaded = pageA.locator("div.fixed.inset-0").filter({ hasText: /Dünya & Küresel Etki|Benim İçin/i }).first();
    await modalAReloaded.getByRole("button", { name: /Benim İçin/i }).first().click();

    await expect(modalAReloaded.locator("div").filter({ hasText: /YOL C/i }).locator("text=SEÇİLEN ✓").first()).toBeVisible();

    // Temizlik
    await contextA.close();
    await contextGuest.close();
    await contextB.close();
  });
});
