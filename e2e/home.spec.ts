import { test, expect } from "@playwright/test";

test.describe("Ana Sayfa ve Gelecek Zaman Çizelgesi", () => {
  test("Ana sayfa başarıyla yüklenmeli ve temel bileşenler görünmeli", async ({ page }) => {
    // Navigate to base URL
    await page.goto("/");

    // Page title verification
    await expect(page).toHaveTitle(/Teknoloji|Evrim|Gelecek|AI/i);

    // Navbar profile and credit buttons should be rendered
    const profileBtn = page.getByTestId("navbar-profile-btn");
    const creditBtn = page.getByTestId("navbar-credit-btn");

    await expect(profileBtn).toBeVisible();
    await expect(creditBtn).toBeVisible();

    // Verify credit counter has a numeric value or default
    await expect(creditBtn).toHaveText(/\d+/);
  });

  test("Konsolda kritik JavaScript çökme hatası olmamalı", async ({ page }) => {
    const criticalErrors: string[] = [];

    page.on("pageerror", (err) => {
      // Catch unhandled exceptions on page
      criticalErrors.push(err.message);
    });

    await page.goto("/");
    await page.waitForLoadState("domcontentloaded");

    // Filter out benign Vite websocket connection retries in sandboxed environments
    const actualCrashes = criticalErrors.filter(
      (msg) => !msg.includes("websocket") && !msg.includes("ResizeObserver")
    );

    expect(actualCrashes).toEqual([]);
  });
});
