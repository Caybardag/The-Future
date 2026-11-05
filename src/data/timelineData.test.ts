import { describe, it, expect } from "vitest";
import { PHASES, TIMELINE_DATA } from "./timelineData";

describe("Timeline Veri Bütünlüğü ve Dönüşüm Testleri", () => {
  it("3 ana evre tanımlı ve tarih aralıkları tutarlı olmalı", () => {
    expect(PHASES).toHaveLength(3);
    expect(PHASES[0].startYear).toBe(2026);
    expect(PHASES[0].endYear).toBe(2035);
    expect(PHASES[1].startYear).toBe(2036);
    expect(PHASES[1].endYear).toBe(2045);
    expect(PHASES[2].startYear).toBe(2046);
    expect(PHASES[2].endYear).toBe(2060);
  });

  it("Tüm dönüm noktaları 2026-2060 aralığında, tam 35 adet, benzersiz ID ve sıralı olmalı", () => {
    // 1. Exact 35 milestones invariant
    expect(TIMELINE_DATA).toHaveLength(35);

    const seenIds = new Set<string>();
    const seenYears = new Set<number>();
    let prevYear = 2025;

    TIMELINE_DATA.forEach((milestone, idx) => {
      const expectedYear = 2026 + idx;
      // 2. Exact sequential years 2026..2060
      expect(milestone.year).toBe(expectedYear);
      expect(milestone.year).toBeGreaterThan(prevYear);
      prevYear = milestone.year;

      // 3. Exact ID format: milestone_${year}
      expect(milestone.id).toBe(`milestone_${expectedYear}`);

      // 4. Unique IDs and unique years
      expect(seenIds.has(milestone.id)).toBe(false);
      expect(seenYears.has(milestone.year)).toBe(false);
      seenIds.add(milestone.id);
      seenYears.add(milestone.year);

      expect(milestone.title).toBeTruthy();
      expect(milestone.description).toBeTruthy();
      expect([1, 2, 3]).toContain(milestone.phase);
      expect(milestone.impactLevel).toBeGreaterThanOrEqual(1);
      expect(milestone.impactLevel).toBeLessThanOrEqual(100);
    });

    expect(seenIds.size).toBe(35);
    expect(seenYears.size).toBe(35);
  });

  it("Her dönüm noktasında geçerli kategori ve ana itici güçler bulunmalı", () => {
    TIMELINE_DATA.forEach((milestone) => {
      expect(milestone.category).toBeTruthy();
      expect(Array.isArray(milestone.keyDrivers)).toBe(true);
    });
  });
});
