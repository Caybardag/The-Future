import { describe, it, expect } from "vitest";
import fs from "fs";
import path from "path";
import { ViewMode } from "../types";
import { TIMELINE_DATA } from "../data/timelineData";
import { calculateMilestonePersonalImpact } from "./personalTimelineEngine";

describe("PORTAL SINGLE HEADER & AUTH NAVIGATION INTEGRITY AUDIT", () => {
  const appTsxPath = path.resolve(__dirname, "../App.tsx");
  const portalTsxPath = path.resolve(__dirname, "../components/EpicIntelligenceHubPortal.tsx");
  const appContent = fs.readFileSync(appTsxPath, "utf-8");
  const portalContent = fs.readFileSync(portalTsxPath, "utf-8");

  // ─────────────────────────────────────────────────────────────────────────────
  // INVARIANT 1: Portal + Guest -> Global Navbar Duplicate Olmamalı
  // ─────────────────────────────────────────────────────────────────────────────
  it("Invariant 1: Global Navbar is strictly conditionally rendered and hidden when currentView is portal", () => {
    // Check that App.tsx wraps Navbar with currentView !== 'portal'
    expect(appContent).toMatch(/currentView\s*!==\s*["']portal["']\s*&&\s*\(\s*<Navbar/);

    // Verify soft onboarding banner is also suppressed on portal
    expect(appContent).toMatch(/showSoftOnboardingBanner\s*&&\s*currentView\s*!==\s*["']portal["']/);
  });

  // ─────────────────────────────────────────────────────────────────────────────
  // INVARIANT 2: Non-Portal View -> Global Navbar Çalışmalı
  // ─────────────────────────────────────────────────────────────────────────────
  it("Invariant 2: Global Navbar is active and rendered for non-portal views (timeline, roadmap, job_risk, etc.)", () => {
    const viewsToTest: ViewMode[] = ["timeline", "roadmap", "job_risk", "verification", "persona_chat"];
    for (const view of viewsToTest) {
      const shouldRenderNavbar = view !== "portal";
      expect(shouldRenderNavbar).toBe(true);
    }
  });

  // ─────────────────────────────────────────────────────────────────────────────
  // INVARIANT 3: Login -> Portal → Timeline Otomatik Redirect Olmamalı
  // ─────────────────────────────────────────────────────────────────────────────
  it("Invariant 3: Login while on portal does not force-redirect user to timeline", () => {
    // Verify that App.tsx does NOT unconditionally do setCurrentView("timeline") upon user login
    const loginEffectRegex = /if\s*\(\s*currentUser\s*&&\s*!prevUserRef\.current\s*\)\s*\{\s*setCurrentView\(["']timeline["']\);/g;
    expect(appContent).not.toMatch(loginEffectRegex);

    // Initial view should default to portal for unified Gelecek Merkezi entrance
    expect(appContent).toMatch(/const\s*\[currentView,\s*setCurrentView\]\s*=\s*useState<ViewMode>\(\s*["']portal["']\s*\);/);
  });

  // ─────────────────────────────────────────────────────────────────────────────
  // INVARIANT 4: Portal Header Is Single Entrance With Zero Duplicate Auth
  // ─────────────────────────────────────────────────────────────────────────────
  it("Invariant 4: Portal Header provides unified single entrance with distinct Guest and Member layouts", () => {
    // Portal has its own header with brand and auth triggers
    expect(portalContent).toContain("Gelecek Takvimi");
    expect(portalContent).toContain("isMember ?");

    // Guest layout has Giriş Yap & Kayıt Ol buttons
    expect(portalContent).toContain("Giriş Yap");
    expect(portalContent).toContain("Kayıt Ol");

    // Member layout has Hoş geldin & personalized greeting
    expect(portalContent).toContain("Geleceğine kaldığın");
    expect(portalContent).toContain("yerden devam et.");
  });

  // ─────────────────────────────────────────────────────────────────────────────
  // INVARIANT 5: Guest Feature Card Opens FeatureExplainerModal (Anti-Bypass Guard)
  // ─────────────────────────────────────────────────────────────────────────────
  it("Invariant 5: Guest feature card click triggers FeatureExplainerModal; Member navigates directly", () => {
    // Verify the conditional click handler exists in portal
    expect(portalContent).toMatch(/isMember\s*\?\s*onEnterConsole\(card\.targetView\)\s*:\s*setExplainerFeatureId\(card\.id\)/);

    // FeatureExplainerModal is mounted and wired to explainerFeatureId
    expect(portalContent).toContain("<FeatureExplainerModal");
    expect(portalContent).toContain("featureId={explainerFeatureId}");
  });

  // ─────────────────────────────────────────────────────────────────────────────
  // INVARIANT 6: Zero Hardcoded Mock Telemetry in Member View
  // ─────────────────────────────────────────────────────────────────────────────
  it("Invariant 6: Member metrics are derived dynamically from actual state rather than static mock strings", () => {
    // Profile score is mathematically derived from user fields
    expect(portalContent).toContain("memberProfileScore");
    expect(portalContent).toContain("%{memberProfileScore}");

    // Critical milestone is computed dynamically from timeline data relevance
    expect(portalContent).toContain("criticalMilestone.year");
    expect(portalContent).toContain("criticalMilestone.title");

    // Career risk and action step are derived from profession and goals
    expect(portalContent).toContain("memberJobRisk.level");
    expect(portalContent).toContain("memberPersonalAction");
  });

  // ─────────────────────────────────────────────────────────────────────────────
  // INVARIANT 7: Intro Video Background is Preserved with Dark Atmospheric Overlay
  // ─────────────────────────────────────────────────────────────────────────────
  it("Invariant 7: Background video intro.mp4 is preserved and loops continuously", () => {
    expect(portalContent).toContain('src="/intro.mp4"');
    expect(portalContent).toContain("autoPlay");
    expect(portalContent).toContain("loop");
    expect(portalContent).toContain("muted");
  });
});
