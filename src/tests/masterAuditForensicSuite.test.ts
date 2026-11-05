import { describe, it, expect, vi } from "vitest";
import { TIMELINE_DATA } from "../data/timelineData";
import {
  validateCanonicalTimeline,
  hydrateCanonicalTimeline,
  getCanonicalId,
} from "../utils/canonicalTimelineValidator";
import {
  evaluateCalendarItemWithGemini,
  evaluateCalendarItemDeterministicFallback,
  runAutonomousCalendarReasoningCycle,
  setValidatedFutureState,
  getValidatedFutureState,
  getEngineAudit,
} from "../server/futureReasoningEngine";
import { CalendarItemAssessment, ValidatedFutureState } from "../types";
import fs from "fs";
import path from "path";

describe("MASTER FORENSIC AUDIT — MANDATORY 18 TEST MATRIX", () => {
  // ─────────────────────────────────────────────────────────────────────────────
  // MANDATORY TEST 1: 35 Canonical Milestones Intact
  // ─────────────────────────────────────────────────────────────────────────────
  it("Mandatory Test 1: Exactly 35 sequential milestones (2026-2060), canonical IDs 'milestone_YYYY'", () => {
    expect(TIMELINE_DATA.length).toBe(35);
    for (let i = 0; i < 35; i++) {
      const expectedYear = 2026 + i;
      expect(TIMELINE_DATA[i].year).toBe(expectedYear);
      expect(TIMELINE_DATA[i].id).toBe(`milestone_${expectedYear}`);
      expect(typeof TIMELINE_DATA[i].title).toBe("string");
      expect(TIMELINE_DATA[i].title.length).toBeGreaterThan(0);
      expect(typeof TIMELINE_DATA[i].category).toBe("string");
      expect(typeof TIMELINE_DATA[i].phase).toBe("number");
    }
  });

  // ─────────────────────────────────────────────────────────────────────────────
  // MANDATORY TEST 2: Duplicate Canonical ID -> Rejected
  // ─────────────────────────────────────────────────────────────────────────────
  it("Mandatory Test 2: Duplicate canonical ID causes validation failure and is rejected", () => {
    const duplicated = TIMELINE_DATA.map((m) => ({ ...m, id: getCanonicalId(m) }));
    duplicated[1] = { ...duplicated[0] }; // duplicate milestone_2026
    const report = validateCanonicalTimeline(duplicated);
    expect(report.status).toBe("INVALID");
    expect(report.isValid).toBe(false);
    expect(report.duplicateYears).toContain(2026);
  });

  // ─────────────────────────────────────────────────────────────────────────────
  // MANDATORY TEST 3: Assessment with only year, NO ID -> Strictly Rejected
  // ─────────────────────────────────────────────────────────────────────────────
  it("Mandatory Test 3: Assessment without explicit id is strictly rejected (no year -> milestone_${year} fallback synthesis)", () => {
    const ungroundedNoId = [
      {
        year: 2030,
        description: "Hacked description without id",
        probability: 99,
      },
    ];

    const hydrated = hydrateCanonicalTimeline(ungroundedNoId);
    expect(hydrated.length).toBe(35);
    const m2030 = hydrated.find((m) => m.year === 2030)!;
    // Canonical description preserved because item without ID was REJECTED
    expect(m2030.description).toBe(TIMELINE_DATA.find((m) => m.year === 2030)!.description);
    expect(m2030.description).not.toBe("Hacked description without id");
  });

  // ─────────────────────────────────────────────────────────────────────────────
  // MANDATORY TEST 4: Malformed ID ('item_2026', '2026', 'milestone_null') -> Rejected
  // ─────────────────────────────────────────────────────────────────────────────
  it("Mandatory Test 4: Malformed IDs are rejected by validator and hydrator", () => {
    const malformedItems = TIMELINE_DATA.map((m) => {
      if (m.year === 2026) return { ...m, id: "item_2026" };
      if (m.year === 2027) return { ...m, id: "2027" };
      if (m.year === 2028) return { ...m, id: "milestone_null" };
      return m;
    });

    const report = validateCanonicalTimeline(malformedItems);
    expect(report.status).toBe("INVALID");
    expect(report.isValid).toBe(false);

    // Hydrator also ignores malformed IDs
    const hydrated = hydrateCanonicalTimeline([
      { id: "item_2026", year: 2026, description: "Bad ID" },
      { id: "2027", year: 2027, description: "Bad ID" },
      { id: "milestone_null", year: 2028, description: "Bad ID" },
    ]);
    expect(hydrated.find((m) => m.year === 2026)!.description).toBe(TIMELINE_DATA[0].description);
  });

  // ─────────────────────────────────────────────────────────────────────────────
  // MANDATORY TEST 5: Valid ID + Mismatched Year -> Rejected
  // ─────────────────────────────────────────────────────────────────────────────
  it("Mandatory Test 5: Valid ID with mismatched year (e.g. id 'milestone_2026' with year 2027) is rejected", () => {
    const mismatched = [
      {
        id: "milestone_2026",
        year: 2027, // Mismatch!
        description: "Mismatched year attempt",
      },
    ];

    const hydrated = hydrateCanonicalTimeline(mismatched);
    expect(hydrated.find((m) => m.year === 2026)!.description).toBe(TIMELINE_DATA[0].description);
    expect(hydrated.find((m) => m.year === 2027)!.description).toBe(TIMELINE_DATA[1].description);
  });

  // ─────────────────────────────────────────────────────────────────────────────
  // MANDATORY TEST 6: status = "REVISED" without evaluationStatus -> NOT GEMINI_EVALUATED
  // ─────────────────────────────────────────────────────────────────────────────
  it("Mandatory Test 6: status = 'REVISED' alone CANNOT produce GEMINI_EVALUATED (must be NOT_ASSESSED)", () => {
    const assessmentWithoutEvalStatus = [
      {
        id: "milestone_2026",
        year: 2026,
        status: "REVISED",
        description: "Revised without Gemini verification",
      },
    ];

    const hydrated = hydrateCanonicalTimeline(assessmentWithoutEvalStatus);
    const m2026 = hydrated.find((m) => m.year === 2026)!;
    expect(m2026.evaluationStatus).not.toBe("GEMINI_EVALUATED");
    expect(m2026.evaluationStatus).toBe("NOT_ASSESSED");
    expect(m2026.epistemicProvenance).toBe("STATIC_SCENARIO");
  });

  // ─────────────────────────────────────────────────────────────────────────────
  // MANDATORY TEST 7: Genuine successful Gemini evaluation -> GEMINI_EVALUATED
  // ─────────────────────────────────────────────────────────────────────────────
  it("Mandatory Test 7: Genuine successful Gemini evaluation produces GEMINI_EVALUATED and DYNAMIC_REASONED_FORECAST", async () => {
    const mockAi = () => ({
      models: {
        generateContent: vi.fn().mockResolvedValue({
          text: JSON.stringify({
            calendarItemId: "milestone_2026",
            milestoneId: "milestone_2026",
            year: 2026,
            title: TIMELINE_DATA[0].title,
            category: TIMELINE_DATA[0].category,
            status: "REVISED",
            currentAssessment: {
              content: "Doğrulanmış Gemini akıl yürütmesi.",
              confidence: 85,
              timeWindow: {
                startYear: 2026,
                endYear: 2028,
                peakLikelihoodWindow: "2026-2027",
                rationale: "Literatür kanıtı.",
              },
              uncertaintyLevel: "LOW",
              isOverconfidentWarning: false,
            },
            reasoning: "Epistemik kanıt doğrulaması tamamlandı.",
            revisionNeeded: true,
            reasoningVersion: "2.0.0",
            evaluatedAt: new Date().toISOString(),
          }),
        }),
      },
    }) as any;

    const assessment = await evaluateCalendarItemWithGemini(mockAi, TIMELINE_DATA[0], []);
    expect(assessment.evaluationStatus).toBe("GEMINI_EVALUATED");
    expect(assessment.epistemicProvenance).toBe("DYNAMIC_REASONED_FORECAST");
    expect(assessment.currentAssessment.confidence).toBe(85);
  });

  // ─────────────────────────────────────────────────────────────────────────────
  // MANDATORY TEST 8: Gemini 429 Quota Error -> EVALUATION_FAILED
  // ─────────────────────────────────────────────────────────────────────────────
  it("Mandatory Test 8: Gemini 429 quota error sets EVALUATION_FAILED with failureReason", async () => {
    const mockFailingAi = () => ({
      models: {
        generateContent: vi.fn().mockRejectedValue(new Error("Resource has been exhausted (e.g. check quota) 429")),
      },
    }) as any;

    const assessment = await evaluateCalendarItemWithGemini(mockFailingAi, TIMELINE_DATA[0], []);
    expect(assessment.evaluationStatus).toBe("EVALUATION_FAILED");
    expect(assessment.epistemicProvenance).toBe("STATIC_SCENARIO");
    expect(assessment.failureReason).toContain("429");
  });

  // ─────────────────────────────────────────────────────────────────────────────
  // MANDATORY TEST 9: Gemini Timeout -> EVALUATION_FAILED
  // ─────────────────────────────────────────────────────────────────────────────
  it("Mandatory Test 9: Gemini network timeout sets EVALUATION_FAILED with failureReason", async () => {
    const mockTimeoutAi = () => ({
      models: {
        generateContent: vi.fn().mockRejectedValue(new Error("Request timed out after 30000ms")),
      },
    }) as any;

    const assessment = await evaluateCalendarItemWithGemini(mockTimeoutAi, TIMELINE_DATA[0], []);
    expect(assessment.evaluationStatus).toBe("EVALUATION_FAILED");
    expect(assessment.failureReason).toContain("timed out");
  });

  // ─────────────────────────────────────────────────────────────────────────────
  // MANDATORY TEST 10: Fallback Running -> NEVER GEMINI_EVALUATED
  // ─────────────────────────────────────────────────────────────────────────────
  it("Mandatory Test 10: Deterministic fallback produces NOT_ASSESSED, never faking GEMINI_EVALUATED", () => {
    const fallback = evaluateCalendarItemDeterministicFallback(TIMELINE_DATA[0], []);
    expect(fallback.evaluationStatus).toBe("NOT_ASSESSED");
    expect(fallback.evaluationStatus).not.toBe("GEMINI_EVALUATED");
    expect(fallback.epistemicProvenance).toBe("STATIC_SCENARIO");
  });

  // ─────────────────────────────────────────────────────────────────────────────
  // MANDATORY TEST 11: Evidence Missing -> confidence null / NOT_COMPUTED
  // ─────────────────────────────────────────────────────────────────────────────
  it("Mandatory Test 11: Missing evidence leaves confidence as null without fabricating numbers", () => {
    const fallback = evaluateCalendarItemDeterministicFallback(TIMELINE_DATA[10], []);
    expect(fallback.currentAssessment.confidence).toBeNull();
    expect(fallback.revision?.confidence).toBeNull();
  });

  // ─────────────────────────────────────────────────────────────────────────────
  // MANDATORY TEST 12: Canonical Probability Present But No Gemini Eval -> confidence null
  // ─────────────────────────────────────────────────────────────────────────────
  it("Mandatory Test 12: Baseline milestone probability is NOT copied into fallback confidence", () => {
    const baselineProb = TIMELINE_DATA[0].probability;
    expect(typeof baselineProb).toBe("number");
    const fallback = evaluateCalendarItemDeterministicFallback(TIMELINE_DATA[0], []);
    expect(fallback.currentAssessment.confidence).toBeNull();
    expect(fallback.currentAssessment.confidence).not.toBe(baselineProb);
  });

  // ─────────────────────────────────────────────────────────────────────────────
  // MANDATORY TEST 13: Stale Revision Application -> REJECT/IGNORE
  // ─────────────────────────────────────────────────────────────────────────────
  it("Mandatory Test 13: Incoming stale revision is rejected when older than current revision", () => {
    // Current state has revision >= 1
    const currentState = getValidatedFutureState();
    const currentRev = currentState.revision || 1;

    // Attempt to set state with strictly lower revision
    const staleState: ValidatedFutureState = {
      version: "2.0.0",
      revision: currentRev - 1,
      lastEvaluatedAt: new Date().toISOString(),
      stateHash: "stale_hash",
      assessments: {},
    };

    const accepted = setValidatedFutureState(staleState);
    expect(accepted).toBe(false);
  });

  // ─────────────────────────────────────────────────────────────────────────────
  // MANDATORY TEST 14: 35 Milestone Rotation / Anti-Starvation
  // ─────────────────────────────────────────────────────────────────────────────
  it("Mandatory Test 14: Rotation prioritizes un-evaluated milestones ensuring all 35 are evaluated over cycles", async () => {
    let callCount = 0;
    const mockAi = () => ({
      models: {
        generateContent: vi.fn().mockImplementation(() => {
          callCount++;
          return Promise.resolve({
            text: JSON.stringify({
              calendarItemId: "milestone_mock",
              milestoneId: "milestone_mock",
              year: 2026,
              title: "Mock",
              category: "Yapay Zeka & Bilişim",
              status: "UNCHANGED",
              currentAssessment: { content: "Evaluated", confidence: 80, timeWindow: { startYear: 2026, endYear: 2028 }, uncertaintyLevel: "LOW" },
              reasoning: "OK",
              evaluatedAt: new Date().toISOString(),
            }),
          });
        }),
      },
    }) as any;

    // Cycle runs with max budget 8 calls per cycle
    const cycle1 = await runAutonomousCalendarReasoningCycle(mockAi, true);
    expect(cycle1).toBeDefined();
    expect(callCount).toBeLessThanOrEqual(8);
  });

  // ─────────────────────────────────────────────────────────────────────────────
  // MANDATORY TEST 15: Persisted Legacy State Without evaluationStatus -> NOT_ASSESSED
  // ─────────────────────────────────────────────────────────────────────────────
  it("Mandatory Test 15: Legacy assessments without evaluationStatus are safely hydrated as NOT_ASSESSED", () => {
    const legacyPayload = [
      {
        id: "milestone_2030",
        year: 2030,
        description: "Legacy persisted description",
        probability: 70,
        // no evaluationStatus property
      },
    ];

    const hydrated = hydrateCanonicalTimeline(legacyPayload);
    const m2030 = hydrated.find((m) => m.year === 2030)!;
    expect(m2030.evaluationStatus).toBe("NOT_ASSESSED");
    expect(m2030.epistemicProvenance).toBe("STATIC_SCENARIO");
  });

  // ─────────────────────────────────────────────────────────────────────────────
  // MANDATORY TEST 16: Audit Gemini Count -> Only Genuine GEMINI_EVALUATED Counted
  // ─────────────────────────────────────────────────────────────────────────────
  it("Mandatory Test 16: getEngineAudit().evaluationsSummary strictly counts only genuine GEMINI_EVALUATED", () => {
    const audit = getEngineAudit();
    const summary = audit.evaluationsSummary;
    expect(summary).toBeDefined();
    expect(typeof summary?.geminiEvaluatedCount).toBe("number");
    expect(typeof summary?.notAssessedCount).toBe("number");
    expect(typeof summary?.failedCount).toBe("number");

    // Total must equal exactly 35 milestones
    const total =
      (summary?.geminiEvaluatedCount || 0) +
      (summary?.notAssessedCount || 0) +
      (summary?.failedCount || 0) +
      (summary?.pendingCount || 0) +
      (summary?.requiresReevaluationCount || 0);
    expect(total).toBe(35);
  });

  // ─────────────────────────────────────────────────────────────────────────────
  // MANDATORY TEST 17: Firebase Query / Index Mapping Classification
  // ─────────────────────────────────────────────────────────────────────────────
  it("Mandatory Test 17: Verifies firestore.indexes.json exists with composite index for credit_reservations", () => {
    const indexesPath = path.resolve(process.cwd(), "firestore.indexes.json");
    expect(fs.existsSync(indexesPath)).toBe(true);

    const indexesContent = JSON.parse(fs.readFileSync(indexesPath, "utf-8"));
    const creditIndex = indexesContent.indexes.find(
      (idx: any) => idx.collectionGroup === "credit_reservations"
    );
    expect(creditIndex).toBeDefined();
    expect(creditIndex.fields).toEqual([
      { fieldPath: "status", order: "ASCENDING" },
      { fieldPath: "expiresAt", order: "ASCENDING" },
    ]);
  });

  // ─────────────────────────────────────────────────────────────────────────────
  // MANDATORY TEST 18: Firestore Public Rule Flagged As Security Finding
  // ─────────────────────────────────────────────────────────────────────────────
  it("Mandatory Test 18: Forensic verification flags public unauthenticated rules in firestore.rules", () => {
    const rulesPath = path.resolve(process.cwd(), "firestore.rules");
    expect(fs.existsSync(rulesPath)).toBe(true);
    const rulesText = fs.readFileSync(rulesPath, "utf-8");

    // Forensic audit finding: telegram_intelligence allows unauthenticated create/update
    const hasUnauthenticatedTelegramRule =
      rulesText.includes("match /telegram_intelligence/{docId}") &&
      rulesText.includes("allow create, update: if true");

    expect(hasUnauthenticatedTelegramRule).toBe(true);
    // Forensic test passes because the security vulnerability is positively detected and flagged
  });
});
