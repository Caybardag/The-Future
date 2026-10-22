import { test, expect } from "@playwright/test";

test.describe("Kullanıcı Profil Modalı ve Sekme Gezinimi", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
  });

  test("Profil butonuna tıklandığında modal açılmalı ve sekmeler çalışmalı", async ({ page }) => {
    const profileBtn = page.getByTestId("navbar-profile-btn");
    await expect(profileBtn).toBeVisible();

    // Click profile button to open modal
    await profileBtn.click();

    // Verify modal is visible
    const modal = page.getByTestId("user-profile-modal");
    await expect(modal).toBeVisible();

    // Verify safe user tabs exist: Profil, Koleksiyon, Rozetler
    const tabProfile = page.getByTestId("tab-profile");
    const tabCollection = page.getByTestId("tab-collection");
    const tabBadges = page.getByTestId("tab-badges");

    await expect(tabProfile).toBeVisible();
    await expect(tabCollection).toBeVisible();
    await expect(tabBadges).toBeVisible();

    // Switch to Koleksiyon tab
    await tabCollection.click();
    await expect(modal).toContainText(/KOLEKSİYON|Koleksiyon/i);

    // Switch to Rozetler tab
    await tabBadges.click();
    await expect(modal).toContainText(/Rozet|XP|Başarılar/i);

    // Switch back to Profil tab
    await tabProfile.click();
    await expect(modal).toContainText(/Profil|Kullanıcı/i);

    // Close modal via close button
    const closeBtn = modal.getByRole("button", { name: /Kapat/i }).last();
    await closeBtn.click();

    // Modal should no longer be visible
    await expect(modal).not.toBeVisible();
  });

  test("Kullanıcı profilinde gizlilik gereği telemetri/GPS butonları olmamalı", async ({ page }) => {
    const profileBtn = page.getByTestId("navbar-profile-btn");
    await profileBtn.click();

    const modal = page.getByTestId("user-profile-modal");
    await expect(modal).toBeVisible();

    // Confirm that 'Konum & Yönelimim' or 'Gerçek GPS/Konum Doğrula' is NOT rendered in user modal
    await expect(modal).not.toContainText("Konum & Yönelimim");
    await expect(modal).not.toContainText("Gerçek GPS/Konum Doğrula");
  });
});
