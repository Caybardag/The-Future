import { describe, it, expect } from "vitest";
import {
  MILESTONE_TECHNICAL_PARAMETERS,
  getTechnicalProfileForYear,
} from "../data/milestoneTechnicalParameters";
import { TIMELINE_DATA } from "../data/timelineData";

describe("Milestone Technical Parameters & Specification Matrix Suite", () => {
  it("verifies full coverage of all 35 canonical milestones from 2026 to 2060", () => {
    expect(TIMELINE_DATA).toHaveLength(35);

    for (const milestone of TIMELINE_DATA) {
      const profile = getTechnicalProfileForYear(milestone.year);
      expect(profile).toBeDefined();
      expect(profile!.year).toBe(milestone.year);
      expect(profile!.primaryDomain.length).toBeGreaterThan(0);
      expect(profile!.theoreticalBoundary.length).toBeGreaterThan(0);
      expect(profile!.trlStage).toBeGreaterThanOrEqual(1);
      expect(profile!.trlStage).toBeLessThanOrEqual(9);
    }
  });

  it("ensures each milestone has at least 5 structured technical parameters with valid categories", () => {
    const validCategories = new Set([
      "Fizik & Termodinamik",
      "Hesaplama & Donanım",
      "Biyo-Tıp & Genomik",
      "Regülasyon & Güvenlik",
      "Enerji & Malzeme",
    ]);

    for (let year = 2026; year <= 2060; year++) {
      const profile = MILESTONE_TECHNICAL_PARAMETERS[year];
      expect(profile).toBeDefined();
      expect(profile.parameters.length).toBeGreaterThanOrEqual(5);

      for (const param of profile.parameters) {
        expect(param.id).toBeDefined();
        expect(param.name.length).toBeGreaterThan(0);
        expect(param.targetValue.length).toBeGreaterThan(0);
        expect(param.current2026Status.length).toBeGreaterThan(0);
        expect(param.verificationLimit.length).toBeGreaterThan(0);
        expect(validCategories.has(param.category)).toBe(true);
      }
    }
  });

  it("verifies 2028 solid-state battery milestone correctly details thermodynamic energy density limits", () => {
    const profile2028 = getTechnicalProfileForYear(2028);
    expect(profile2028).toBeDefined();

    const gravimetricParam = profile2028!.parameters.find((p) =>
      p.name.includes("Gravimetrik Enerji")
    );
    expect(gravimetricParam).toBeDefined();
    expect(gravimetricParam!.targetValue).toContain("480 Wh/kg");
    expect(gravimetricParam!.verificationLimit).toContain("Termodinamik");
    expect(gravimetricParam!.category).toBe("Fizik & Termodinamik");
  });
});
