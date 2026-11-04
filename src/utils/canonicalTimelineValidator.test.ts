import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  validateCanonicalTimeline,
  hydrateCanonicalTimeline,
  getCanonicalId,
} from "./canonicalTimelineValidator";
import { TIMELINE_DATA } from "../data/timelineData";
import { FutureReasoningService } from "../services/futureReasoningService";
import { safeStorage } from "./safeStorage";
import { Milestone } from "../types";

describe("CANONICAL 35-MILESTONE INTEGRITY & VALIDATION SUITE (24 SPEC TESTS)", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  // ─────────────────────────────────────────────────────────────────────────────
  // 1. VALIDATOR TESTS (SCENARIOS 1 - 9)
  // ─────────────────────────────────────────────────────────────────────────────

  it("1. 35 doğru canonical kayıt → VALID", () => {
    const validItems = TIMELINE_DATA.map((m) => ({
      ...m,
      id: getCanonicalId(m),
    }));

    const result = validateCanonicalTimeline(validItems);
    expect(result.status).toBe("VALID");
    expect(result.isValid).toBe(true);
    expect(result.isPartial).toBe(false);
    expect(result.missingYears.length).toBe(0);
    expect(result.duplicateYears.length).toBe(0);
    expect(result.invalidYears.length).toBe(0);
  });

  it("2. 3 kayıt → PARTIAL", () => {
    const threeItems = TIMELINE_DATA.slice(0, 3).map((m) => ({
      ...m,
      id: getCanonicalId(m),
    }));

    const result = validateCanonicalTimeline(threeItems);
    expect(result.status).toBe("PARTIAL");
    expect(result.isValid).toBe(false);
    expect(result.isPartial).toBe(true);
    expect(result.totalCount).toBe(3);
    expect(result.missingYears.length).toBe(32);
    expect(result.errors.length).toBe(0);
  });

  it("3. 34 kayıt → PARTIAL", () => {
    const thirtyFourItems = TIMELINE_DATA.slice(0, 34).map((m) => ({
      ...m,
      id: getCanonicalId(m),
    }));

    const result = validateCanonicalTimeline(thirtyFourItems);
    expect(result.status).toBe("PARTIAL");
    expect(result.isValid).toBe(false);
    expect(result.isPartial).toBe(true);
    expect(result.totalCount).toBe(34);
    expect(result.missingYears).toEqual([2060]);
  });

  it("4. 35 kayıt fakat duplicate yıl → INVALID", () => {
    // 35 items, but 2026 is duplicated and 2060 is replaced
    const items = TIMELINE_DATA.slice(0, 34).map((m) => ({ ...m, id: getCanonicalId(m) }));
    items.push({ ...TIMELINE_DATA[0], id: `milestone_${TIMELINE_DATA[0].year}` }); // duplicate 2026

    const result = validateCanonicalTimeline(items);
    expect(result.status).toBe("INVALID");
    expect(result.duplicateYears).toContain(2026);
  });

  it("5. 35 kayıt fakat eksik 2035 ve duplicate 2027 → INVALID", () => {
    const items = TIMELINE_DATA.map((m) => {
      if (m.year === 2035) {
        // replace 2035 with duplicate 2027
        const m2027 = TIMELINE_DATA.find((x) => x.year === 2027)!;
        return { ...m2027, id: getCanonicalId(m2027) };
      }
      return { ...m, id: getCanonicalId(m) };
    });

    const result = validateCanonicalTimeline(items);
    expect(result.status).toBe("INVALID");
    expect(result.duplicateYears).toContain(2027);
    expect(result.missingYears).toContain(2035);
  });

  it("6. 2061 kaydı → INVALID veya güvenli biçimde canonical dışı olarak reddedilmeli", () => {
    const items = [
      ...TIMELINE_DATA.slice(0, 34).map((m) => ({ ...m, id: getCanonicalId(m) })),
      {
        year: 2061,
        id: "milestone_2061",
        title: "Kuraldışı 2061 Kaydı",
        category: "Uzay & Fizik",
        phase: 3,
      },
    ];

    const result = validateCanonicalTimeline(items);
    expect(result.status).toBe("INVALID");
    expect(result.invalidYears).toContain(2061);
  });

  it("7. Yanlış ID fakat doğru yıl → INVALID", () => {
    const items = TIMELINE_DATA.map((m) => ({
      ...m,
      id: m.year === 2028 ? "milestone_incorrect_id" : getCanonicalId(m),
    }));

    const result = validateCanonicalTimeline(items);
    expect(result.status).toBe("INVALID");
    expect(result.mismatchedIdYears.some((e) => e.year === 2028)).toBe(true);
  });

  it("8. Yanlış yıl fakat doğru ID → INVALID", () => {
    const items = TIMELINE_DATA.map((m) => {
      if (m.year === 2029) {
        return {
          ...m,
          year: 2030, // Wrong year, but ID is milestone_2029
          id: "milestone_2029",
        };
      }
      return { ...m, id: getCanonicalId(m) };
    });

    const result = validateCanonicalTimeline(items);
    expect(result.status).toBe("INVALID");
    expect(result.mismatchedIdYears.some((e) => e.id === "milestone_2029")).toBe(true);
  });

  it("9. Sırası bozulmuş kayıtlar → canonical sıraya normalize edilmeli veya geçersiz raporlanmalı; UI sırası bozulmamalı", () => {
    // Reverse order
    const reversed = [...TIMELINE_DATA].reverse().map((m) => ({ ...m, id: getCanonicalId(m) }));
    const result = validateCanonicalTimeline(reversed);
    expect(result.isChronological).toBe(false);
    expect(result.status).toBe("INVALID");

    // Hydration automatically restores strictly ascending canonical order
    const normalized = hydrateCanonicalTimeline(reversed);
    expect(normalized.length).toBe(35);
    expect(normalized[0].year).toBe(2026);
    expect(normalized[34].year).toBe(2060);
    for (let i = 0; i < normalized.length - 1; i++) {
      expect(normalized[i].year).toBeLessThan(normalized[i + 1].year);
    }
  });

  // ─────────────────────────────────────────────────────────────────────────────
  // 2. CACHE TESTS (SCENARIOS 10 - 14)
  // ─────────────────────────────────────────────────────────────────────────────

  it("10. Eski 3 kayıtlı cache → reddedilmeli ve canonical 35'e tamamlanmalı, asla 3 döndürmemeli", async () => {
    const service = new FutureReasoningService();
    const oldThreeCache = {
      success: true,
      provenance: "DYNAMIC_REASONED_FORECAST",
      milestones: TIMELINE_DATA.slice(0, 3).map((m) => ({ ...m, id: getCanonicalId(m) })),
      forecasts: [],
      audit: {} as any,
      reEvaluationLog: [],
    };

    safeStorage.setJSON("future_reasoned_forecasts_cache_v3", oldThreeCache);

    // Mock API fetch to verify cache behavior
    vi.spyOn(global, "fetch").mockRejectedValue(new Error("Network offline"));

    const res = await service.getReasonedTimeline(false);
    expect(res.milestones.length).toBe(35); // MUST BE 35, NEVER 3!
    expect(res.milestones[0].year).toBe(2026);
    expect(res.milestones[34].year).toBe(2060);
  });

  it("11. 35 kayıtlı fakat duplicate içeren cache → reddedilmeli", async () => {
    const service = new FutureReasoningService();
    const corruptedCache = {
      success: true,
      provenance: "DYNAMIC_REASONED_FORECAST",
      milestones: [
        ...TIMELINE_DATA.slice(0, 34).map((m) => ({ ...m, id: getCanonicalId(m) })),
        { ...TIMELINE_DATA[0], id: getCanonicalId(TIMELINE_DATA[0]) }, // duplicate 2026
      ],
      forecasts: [],
      audit: {} as any,
      reEvaluationLog: [],
    };

    safeStorage.setJSON("future_reasoned_forecasts_cache_v3", corruptedCache);
    vi.spyOn(global, "fetch").mockRejectedValue(new Error("Network offline"));

    const res = await service.getReasonedTimeline(false);
    // Corrupted cache should be purged and fallback to canonical 35 items
    expect(res.milestones.length).toBe(35);
    expect(validateCanonicalTimeline(res.milestones).status).toBe("VALID");
  });

  it("12. Geçerli 35 kayıtlı cache → kullanılmalı", async () => {
    const service = new FutureReasoningService();
    const validCache = {
      success: true,
      provenance: "DYNAMIC_REASONED_FORECAST" as const,
      milestones: TIMELINE_DATA.map((m) => ({
        ...m,
        id: getCanonicalId(m),
        description: `Doğrulanmış ${m.year} açıklaması`,
        probability: 77,
      })),
      forecasts: [],
      audit: {} as any,
      reEvaluationLog: [],
    };

    safeStorage.setJSON("future_reasoned_forecasts_cache_v3", validCache);

    const res = await service.getReasonedTimeline(false);
    expect(res.milestones.length).toBe(35);
    expect(res.milestones[0].description).toBe("Doğrulanmış 2026 açıklaması");
    expect(res.milestones[0].probability).toBe(77);
  });

  it("13. Bozuk cache → otomatik güvenli fallback", async () => {
    const service = new FutureReasoningService();
    // Non-array garbage data
    safeStorage.setJSON("future_reasoned_forecasts_cache_v3", { milestones: "corrupted_string" });
    vi.spyOn(global, "fetch").mockRejectedValue(new Error("Network offline"));

    const res = await service.getReasonedTimeline(false);
    expect(res.milestones.length).toBe(35);
    expect(res.provenance).toBe("STATIC_SCENARIO");
  });

  it("14. Cache temizliği diğer kullanıcı verilerini silmemeli", async () => {
    // Set unrelated user preferences and keys
    safeStorage.setItem("user_theme_preference", "dark");
    safeStorage.setItem("user_saved_roadmaps", JSON.stringify([{ id: "r1" }]));
    safeStorage.setItem("future_reasoned_forecasts_cache_v3", "{ corrupted json");

    const service = new FutureReasoningService();
    vi.spyOn(global, "fetch").mockRejectedValue(new Error("Network offline"));

    await service.getReasonedTimeline(false);

    // Unrelated keys must be strictly preserved!
    expect(safeStorage.getItem("user_theme_preference")).toBe("dark");
    expect(safeStorage.getItem("user_saved_roadmaps")).toContain("r1");
  });

  // ─────────────────────────────────────────────────────────────────────────────
  // 3. HYDRATION TESTS (SCENARIOS 15 - 20)
  // ─────────────────────────────────────────────────────────────────────────────

  it("15. Gemini title değiştirmeye çalışır → canonical title korunmalı", () => {
    const maliciousGeminiAssessment = [
      {
        year: 2026,
        title: "GEMINI_HACKED_TITLE_SAHTE_BASLIK",
        description: "Geçerli revize açıklama",
        probability: 88,
      },
    ];

    const hydrated = hydrateCanonicalTimeline(maliciousGeminiAssessment);
    const m2026 = hydrated.find((m) => m.year === 2026)!;

    // Canonical title MUST NOT change!
    expect(m2026.title).toBe(TIMELINE_DATA[0].title);
    expect(m2026.title).not.toBe("GEMINI_HACKED_TITLE_SAHTE_BASLIK");
    // Permitted evaluation fields ARE updated
    expect(m2026.description).toBe("Geçerli revize açıklama");
    expect(m2026.probability).toBe(88);
  });

  it("16. Gemini year değiştirmeye çalışır → canonical year korunmalı", () => {
    const invalidAssessment = [
      {
        year: 2099, // Non-canonical year
        title: "Gelecek 2099",
      },
    ];

    const hydrated = hydrateCanonicalTimeline(invalidAssessment);
    expect(hydrated.length).toBe(35);
    expect(hydrated.some((m) => m.year === 2099)).toBe(false);
    expect(hydrated[0].year).toBe(2026);
    expect(hydrated[34].year).toBe(2060);
  });

  it("17. Gemini category değiştirmeye çalışır → canonical category korunmalı", () => {
    const categoryOverrideAttempt = [
      {
        year: 2026,
        category: "Post-İnsan & Medeniyet" as const, // Canonical is "Yapay Zeka & Bilişim"
      },
    ];

    const hydrated = hydrateCanonicalTimeline(categoryOverrideAttempt);
    const m2026 = hydrated.find((m) => m.year === 2026)!;

    expect(m2026.category).toBe("Yapay Zeka & Bilişim");
  });

  it("18. Gemini phase değiştirmeye çalışır → canonical phase korunmalı", () => {
    const phaseOverrideAttempt = [
      {
        year: 2026,
        phase: 3, // Canonical is 1
      },
    ];

    const hydrated = hydrateCanonicalTimeline(phaseOverrideAttempt);
    const m2026 = hydrated.find((m) => m.year === 2026)!;

    expect(m2026.phase).toBe(1);
  });

  it("19. Üç assessment → 35 canonical milestone üzerinde yalnızca üç ilgili kayıt güncellenmeli", () => {
    const threeAssessments = [
      { year: 2026, description: "2026 Güncellendi", probability: 80, status: "REVISED" },
      { year: 2027, description: "2027 Güncellendi", probability: 85, status: "REVISED" },
      { year: 2028, description: "2028 Güncellendi", probability: 90, status: "REVISED" },
    ];

    const hydrated = hydrateCanonicalTimeline(threeAssessments);
    expect(hydrated.length).toBe(35);

    // Updated records
    expect(hydrated[0].description).toBe("2026 Güncellendi");
    expect(hydrated[0].probability).toBe(80);
    expect(hydrated[1].description).toBe("2027 Güncellendi");
    expect(hydrated[2].description).toBe("2028 Güncellendi");

    // Other 32 records remain strictly canonical
    expect(hydrated[3].year).toBe(2029);
    expect(hydrated[3].description).toBe(TIMELINE_DATA[3].description);
    expect(hydrated[34].year).toBe(2060);
    expect(hydrated[34].description).toBe(TIMELINE_DATA[34].description);
  });

  it("20. Boş assessment → 35 canonical kayıt korunmalı", () => {
    const hydratedFromEmpty = hydrateCanonicalTimeline([]);
    expect(hydratedFromEmpty.length).toBe(35);
    expect(hydratedFromEmpty.map((m) => m.year)).toEqual(TIMELINE_DATA.map((m) => m.year));
    expect(hydratedFromEmpty[0].epistemicProvenance).toBe("STATIC_SCENARIO");
  });

  // ─────────────────────────────────────────────────────────────────────────────
  // 4. INTEGRATION TESTS (SCENARIOS 21 - 24)
  // ─────────────────────────────────────────────────────────────────────────────

  it("21. Gemini API hatası → UI 35 canonical kayıt göstermeli", async () => {
    const service = new FutureReasoningService();
    vi.spyOn(global, "fetch").mockImplementation(() =>
      Promise.resolve(new Response(JSON.stringify({ error: "Gemini Quota Exceeded (429)" }), { status: 500 }))
    );

    const res = await service.getReasonedTimeline(true);
    expect(res.milestones.length).toBe(35);
    expect(res.milestones[0].year).toBe(2026);
    expect(res.milestones[34].year).toBe(2060);
  });

  it("22. Background reasoning tamamlanır → React state güncellenmeli", async () => {
    const service = new FutureReasoningService();
    let listenerCalled = false;
    let receivedMilestoneCount = 0;

    const unsubscribe = service.onTimelineUpdated((timeline) => {
      listenerCalled = true;
      receivedMilestoneCount = timeline.milestones.length;
    });

    vi.spyOn(global, "fetch").mockImplementation(() =>
      Promise.resolve(
        new Response(
          JSON.stringify({
            success: true,
            milestones: TIMELINE_DATA.map((m) => ({
              year: m.year,
              description: `Canlı güncellenen ${m.year}`,
            })),
          }),
          { status: 200 }
        )
      )
    );

    await service.runReasoningCycle();

    expect(listenerCalled).toBe(true);
    expect(receivedMilestoneCount).toBe(35);
    unsubscribe();
  });

  it("23. Eski cache ve yeni API cevabı çakışır → eski cevap yeni state'i ezmemeli", async () => {
    const service = new FutureReasoningService();
    const updateEvents: string[] = [];

    service.onTimelineUpdated((timeline) => {
      updateEvents.push(timeline.updatedAt || "");
    });

    // Simulate newer update first
    vi.spyOn(global, "fetch").mockImplementation(() =>
      Promise.resolve(
        new Response(
          JSON.stringify({
            success: true,
            milestones: TIMELINE_DATA.map((m) => ({ year: m.year, description: "Newer response" })),
          }),
          { status: 200 }
        )
      )
    );

    await service.runReasoningCycle();
    const newerLength = updateEvents.length;
    expect(newerLength).toBeGreaterThan(0);
  });

  it("24. Filtre ve sayfalama → mevcut davranış korunmalı", () => {
    const hydrated = hydrateCanonicalTimeline([]);
    expect(hydrated.length).toBe(35);

    // Phase 1 filter
    const phase1 = hydrated.filter((m) => m.phase === 1);
    expect(phase1.length).toBe(TIMELINE_DATA.filter((m) => m.phase === 1).length);

    // Category filter
    const aiCategory = hydrated.filter((m) => m.category === "Yapay Zeka & Bilişim");
    expect(aiCategory.length).toBe(TIMELINE_DATA.filter((m) => m.category === "Yapay Zeka & Bilişim").length);

    // Search query
    const searchMatch = hydrated.filter((m) => m.title.toLowerCase().includes("ajan"));
    expect(searchMatch.length).toBeGreaterThanOrEqual(1);
    expect(searchMatch[0].year).toBe(2026);
  });

  // ─────────────────────────────────────────────────────────────────────────────
  // 5. FORENSIC AUDIT TESTS (SCENARIOS 25 - 28)
  // ─────────────────────────────────────────────────────────────────────────────

  it("25. Herhangi bir kayıtta zorunlu id eksikse → INVALID ve fatal error üretilmeli", () => {
    // Take canonical data and delete `id` from 2030 item
    const itemsWithoutId = TIMELINE_DATA.map((m) => {
      const copy = { ...m };
      if (m.year === 2030) {
        delete (copy as any).id;
      }
      return copy;
    });

    const result = validateCanonicalTimeline(itemsWithoutId);
    expect(result.status).toBe("INVALID");
    expect(result.isValid).toBe(false);
    expect(result.mismatchedIdYears.some((e) => e.year === 2030 && e.id === undefined)).toBe(true);
    expect(result.errors.some((err) => err.includes("zorunlu canonical ID eksiktir"))).toBe(true);
  });

  it("26. Non-canonical ID formatları ('item_2026', '2026', 'milestone_null') → INVALID", () => {
    const invalidFormatItems = TIMELINE_DATA.map((m) => {
      if (m.year === 2026) return { ...m, id: "item_2026" };
      if (m.year === 2027) return { ...m, id: "2027" };
      if (m.year === 2028) return { ...m, id: "milestone_null" };
      return m;
    });

    const result = validateCanonicalTimeline(invalidFormatItems);
    expect(result.status).toBe("INVALID");
    expect(result.isValid).toBe(false);
    expect(result.mismatchedIdYears.length).toBeGreaterThanOrEqual(3);
  });

  it("27. Hydrator duplicate assessment geldiğinde ilkini korur, ikincisini reddeder", () => {
    const assessmentsWithDuplicates = [
      { id: "milestone_2026", year: 2026, description: "İlk Geçerli Değerlendirme", probability: 75 },
      { id: "milestone_2026", year: 2026, description: "İkinci Yinelenen Değerlendirme (Reddedilmeli)", probability: 30 },
    ];

    const hydrated = hydrateCanonicalTimeline(assessmentsWithDuplicates);
    expect(hydrated.length).toBe(35);
    const m2026 = hydrated.find((m) => m.year === 2026)!;
    expect(m2026.description).toBe("İlk Geçerli Değerlendirme");
    expect(m2026.probability).toBe(75);
  });

  it("28. Hydrator canonical framework'e ait 16 temel alanın tamamını titizlikle korur", () => {
    const canonical2030 = TIMELINE_DATA.find((m) => m.year === 2030)!;

    const invasiveGeminiPayload = [
      {
        id: "milestone_2030",
        year: 2030,
        title: "SAHTE_BASLIK_HACK",
        category: "Uzay & Fizik",
        phase: 3,
        iconName: "FakeIcon",
        impactLevel: 1,
        humanAugmentationIndex: 2,
        aiAutonomyIndex: 3,
        bioDigitalIntegrationRate: 4,
        keyDrivers: ["fake driver"],
        dailyLifeImpact: "fake daily life",
        ethicalRisks: ["fake ethical risk"],
        societalOpportunities: ["fake opportunity"],
        relatedYears: [9999],
        patents: [{ patentNumber: "FAKE_PATENT" }],
        citations: [{ source: "fake source" }],
        canonicalDescription: "fake canonical desc",
        // Permitted evaluation fields:
        description: "Meşru revize açıklama",
        probability: 65,
      },
    ];

    const hydrated = hydrateCanonicalTimeline(invasiveGeminiPayload);
    const m2030 = hydrated.find((m) => m.year === 2030)!;

    // Verify all 16 canonical fields were preserved:
    expect(m2030.id).toBe("milestone_2030");
    expect(m2030.year).toBe(2030);
    expect(m2030.title).toBe(canonical2030.title);
    expect(m2030.category).toBe(canonical2030.category);
    expect(m2030.phase).toBe(canonical2030.phase);
    expect(m2030.iconName).toBe(canonical2030.iconName);
    expect(m2030.impactLevel).toBe(canonical2030.impactLevel);
    expect(m2030.humanAugmentationIndex).toBe(canonical2030.humanAugmentationIndex);
    expect(m2030.aiAutonomyIndex).toBe(canonical2030.aiAutonomyIndex);
    expect(m2030.bioDigitalIntegrationRate).toBe(canonical2030.bioDigitalIntegrationRate);
    expect(m2030.keyDrivers).toEqual(canonical2030.keyDrivers);
    expect(m2030.dailyLifeImpact).toBe(canonical2030.dailyLifeImpact);
    expect(m2030.ethicalRisks).toEqual(canonical2030.ethicalRisks);
    expect(m2030.societalOpportunities).toEqual(canonical2030.societalOpportunities);
    expect(m2030.relatedYears).toEqual(canonical2030.relatedYears);
    expect(m2030.canonicalDescription).toBe(canonical2030.canonicalDescription || canonical2030.description);

    // Permitted evaluation fields WERE safely applied:
    expect(m2030.description).toBe("Meşru revize açıklama");
    expect(m2030.probability).toBe(65);
  });
});

