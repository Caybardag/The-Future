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

  it("Tüm dönüm noktaları 2026-2060 aralığında ve geçerli aşamada olmalı", () => {
    expect(TIMELINE_DATA.length).toBeGreaterThanOrEqual(30);

    TIMELINE_DATA.forEach((milestone) => {
      expect(milestone.year).toBeGreaterThanOrEqual(2026);
      expect(milestone.year).toBeLessThanOrEqual(2060);
      expect(milestone.title).toBeTruthy();
      expect(milestone.description).toBeTruthy();
      expect([1, 2, 3]).toContain(milestone.phase);
      expect(milestone.impactLevel).toBeGreaterThanOrEqual(1);
      expect(milestone.impactLevel).toBeLessThanOrEqual(100);
    });
  });

  it("Her dönüm noktasında geçerli kategori ve ana itici güçler bulunmalı", () => {
    TIMELINE_DATA.forEach((milestone) => {
      expect(milestone.category).toBeTruthy();
      expect(Array.isArray(milestone.keyDrivers)).toBe(true);
    });
  });
});
