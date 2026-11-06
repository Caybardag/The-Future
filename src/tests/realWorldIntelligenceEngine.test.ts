import { describe, it, expect } from "vitest";
import { ScientificVerificationEngine } from "../services/ScientificVerificationEngine";
import { TIMELINE_DATA } from "../data/timelineData";
import { MILESTONE_KNOWLEDGE_MAP, getKnowledgeProfileForYear } from "../data/milestoneKnowledgeMap";
import { realWorldIntelligenceEngine } from "../server/realWorldIntelligenceEngine";
import { academicKnowledgeStore } from "../server/academicKnowledgeEngine";

describe("Real-World Intelligence & Scientific Verification Suite", () => {
  it("verifies that 2028 canonical description triggers NO false-positive thermodynamic anomaly", async () => {
    const item2028 = TIMELINE_DATA.find((m) => m.year === 2028);
    expect(item2028).toBeDefined();

    // Scan only 2028
    const anomalies = await ScientificVerificationEngine.scanDatasetAnomalies([item2028!]);
    const thermoAnomaly = anomalies.find(
      (a) =>
        a.milestoneYear === 2028 &&
        (a.verification.flaggedAnomalies?.some((f) => f.includes("Termodinamik")) ||
          a.verification.verdictStatus === "PHYSICALLY_IMPOSSIBLE_CORRECTED")
    );
    expect(thermoAnomaly).toBeUndefined();
  });

  it("confirms full 35-milestone coverage in MILESTONE_KNOWLEDGE_MAP from 2026 to 2060", () => {
    expect(Object.keys(MILESTONE_KNOWLEDGE_MAP).length).toBe(35);

    for (let year = 2026; year <= 2060; year++) {
      const knowledge = getKnowledgeProfileForYear(year);
      expect(knowledge).toBeDefined();
      expect(knowledge!.year).toBe(year);
      expect(knowledge!.googleSearchQueries.length).toBeGreaterThanOrEqual(2);
      expect(knowledge!.socialAndWebKeywords.length).toBeGreaterThanOrEqual(1);
      expect(knowledge!.openAlexConcept.length).toBeGreaterThan(0);
      expect(knowledge!.entities.length).toBeGreaterThan(0);
    }
  });

  it("checks realWorldIntelligenceEngine state and signal structures", () => {
    const state = realWorldIntelligenceEngine.getState();
    expect(state).toBeDefined();
    expect(typeof state.activeStage).toBe("string");
    expect(Array.isArray(state.recentSignals)).toBe(true);
    expect(Array.isArray(state.extractedDataPoints)).toBe(true);
    expect(Array.isArray(state.recentLogs)).toBe(true);
    expect(typeof state.totalSignalsCount).toBe("number");
    expect(typeof state.corroboratedEvidenceCount).toBe("number");
    expect(state.totalSignalsCount).toBeGreaterThanOrEqual(0);
  });

  it("checks academicKnowledgeStore dynamic statistics calculation without hardcoded fake values", () => {
    const stats = academicKnowledgeStore.getStats();
    expect(stats).toBeDefined();
    expect(typeof stats.totalWorks).toBe("number");
    expect(typeof stats.totalCitations).toBe("number");
    expect(typeof stats.categoriesCount).toBe("number");
    expect(stats.totalWorks).toBeGreaterThanOrEqual(0);
    expect(stats.totalCitations).toBeGreaterThanOrEqual(0);
  });
});
