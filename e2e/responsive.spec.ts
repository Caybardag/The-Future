import { test, expect } from "@playwright/test";

test.describe("Mobil Uyumluluk ve Duyarlı Tasarım Testi", () => {
  test.use({ viewport: { width: 390, height: 844 } }); // iPhone 14/15 viewport

  test("Mobil ekranda navbar kontrolleri taşma yapmadan görünmeli", async ({ page }) => {
    await page.goto("/");

    const profileBtn = page.getByTestId("navbar-profile-btn");
    const creditBtn = page.getByTestId("navbar-credit-btn");

    // Both buttons should be visible and within viewport
    await expect(profileBtn).toBeVisible();
    await expect(creditBtn).toBeVisible();

    const profileBox = await profileBtn.boundingBox();
    const creditBox = await creditBtn.boundingBox();

    expect(profileBox).not.toBeNull();
    expect(creditBox).not.toBeNull();

    if (profileBox && creditBox) {
      // Ensure buttons do not overflow 390px viewport width
      expect(profileBox.x + profileBox.width).toBeLessThanOrEqual(395);
      expect(creditBox.x + creditBox.width).toBeLessThanOrEqual(395);
    }
  });

  test("Mobilde profil açıldığında sayfa kaydırılabilir olmalı ve taşmamalı", async ({ page }) => {
    await page.goto("/");

    const profileBtn = page.getByTestId("navbar-profile-btn");
    await profileBtn.click();

    const modal = page.getByTestId("user-profile-modal");
    await expect(modal).toBeVisible();

    const box = await modal.boundingBox();
    expect(box).not.toBeNull();
    if (box) {
      expect(box.width).toBeLessThanOrEqual(390);
    }
  });
});
