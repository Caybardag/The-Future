import { Milestone, CategoryType, PhaseId } from "../types";
import { TIMELINE_DATA } from "../data/timelineData";

export type CanonicalValidationStatus = "VALID" | "PARTIAL" | "INVALID";

export interface CanonicalValidationResult {
  status: CanonicalValidationStatus;
  isValid: boolean;
  isPartial: boolean;
  totalCount: number;
  expectedCount: number;
  missingYears: number[];
  duplicateYears: number[];
  duplicateIds: string[];
  invalidYears: number[];
  mismatchedIdYears: Array<{ id?: string; year?: number; expectedId?: string; expectedYear?: number }>;
  isChronological: boolean;
  errors: string[];
  validCanonicalItems: Milestone[];
}

export function getCanonicalId(m: { year: number; id?: string }): string {
  return m.id || `milestone_${m.year}`;
}

/**
 * Strict parser for canonical milestone ID.
 * Must strictly match format 'milestone_${year}' where year is integer 2026-2060.
 * Disallows arbitrary regex extraction of random numbers.
 */
export function parseCanonicalMilestoneId(id: unknown): number | null {
  if (typeof id !== "string") return null;
  const match = id.trim().match(/^milestone_(\d{4})$/);
  if (!match) return null;
  const yr = Number(match[1]);
  if (!Number.isInteger(yr) || yr < 2026 || yr > 2060) return null;
  return yr;
}

const CANONICAL_YEARS: number[] = TIMELINE_DATA.map((m) => m.year);
const CANONICAL_YEAR_MAP = new Map<number, Milestone>(TIMELINE_DATA.map((m) => [m.year, m]));
const CANONICAL_ID_TO_YEAR = new Map<string, number>(TIMELINE_DATA.map((m) => [getCanonicalId(m), m.year]));

/**
 * Validates any milestone array against the canonical 35-item framework (2026–2060).
 * Enforces mandatory ID, mandatory year, 1-to-1 matching, uniqueness, and chronological order.
 * Distinguishes VALID, PARTIAL, and INVALID based on exact structural criteria.
 */
export function validateCanonicalTimeline(items: any[] | null | undefined): CanonicalValidationResult {
  if (!items || !Array.isArray(items)) {
    return {
      status: "INVALID",
      isValid: false,
      isPartial: false,
      totalCount: 0,
      expectedCount: TIMELINE_DATA.length,
      missingYears: [...CANONICAL_YEARS],
      duplicateYears: [],
      duplicateIds: [],
      invalidYears: [],
      mismatchedIdYears: [],
      isChronological: false,
      errors: ["Girdi bir dizi (array) değildir veya boştur."],
      validCanonicalItems: [],
    };
  }

  const errors: string[] = [];
  const seenYears = new Set<number>();
  const duplicateYearsSet = new Set<number>();
  const seenIds = new Set<string>();
  const duplicateIdsSet = new Set<string>();
  const invalidYears: number[] = [];
  const mismatchedIdYears: Array<{ id?: string; year?: number; expectedId?: string; expectedYear?: number }> = [];
  const validCanonicalItems: Milestone[] = [];

  let isChronological = true;
  let previousYear = -Infinity;
  let missingIdCount = 0;

  for (let i = 0; i < items.length; i++) {
    const item = items[i];
    if (!item || typeof item !== "object" || typeof item.year !== "number") {
      errors.push(`Kayıt #${i} geçersiz nesne veya eksik yıl içeriyor.`);
      continue;
    }

    const yr = item.year;
    const itemId: string | undefined = typeof item.id === "string" ? item.id.trim() : undefined;
    const expectedId = `milestone_${yr}`;

    // 1. Mandatory ID Verification: ID is strictly required and cannot be empty or omitted
    if (!itemId) {
      missingIdCount++;
      mismatchedIdYears.push({
        id: undefined,
        year: yr,
        expectedId,
        expectedYear: yr,
      });
      errors.push(`Kayıt #${i} (${yr}) için zorunlu canonical ID eksiktir (Beklenen: '${expectedId}').`);
    } else {
      // 2. ID Uniqueness
      if (seenIds.has(itemId)) {
        duplicateIdsSet.add(itemId);
        errors.push(`ID '${itemId}' yinelenen (duplicate) olarak bulundu.`);
      } else {
        seenIds.add(itemId);
      }

      // 3. ID-to-Year exact 1-to-1 match verification
      const canonicalYearForId = CANONICAL_ID_TO_YEAR.get(itemId);
      if (itemId !== expectedId) {
        mismatchedIdYears.push({
          id: itemId,
          year: yr,
          expectedId,
          expectedYear: canonicalYearForId,
        });
        errors.push(`ID uyuşmazlığı: ID '${itemId}' ile Yıl ${yr} eşleşmiyor (Beklenen: '${expectedId}').`);
      }
    }

    // 4. Chronological order check
    if (yr <= previousYear) {
      isChronological = false;
    }
    previousYear = yr;

    // 5. Canonical year range (2026-2060)
    if (!CANONICAL_YEAR_MAP.has(yr)) {
      invalidYears.push(yr);
      errors.push(`Kayıt #${i} (${yr}) canonical takvim aralığı (2026–2060) dışındadır.`);
    }

    // 6. Duplicate year check
    if (seenYears.has(yr)) {
      duplicateYearsSet.add(yr);
      errors.push(`Yıl ${yr} yinelenen (duplicate) olarak bulundu.`);
    } else {
      seenYears.add(yr);
    }

    // Check if canonical and structurally valid so far
    if (CANONICAL_YEAR_MAP.has(yr) && itemId === expectedId) {
      validCanonicalItems.push(item);
    }
  }

  const missingYears = CANONICAL_YEARS.filter((y) => !seenYears.has(y));
  const duplicateYears = Array.from(duplicateYearsSet);
  const duplicateIds = Array.from(duplicateIdsSet);

  // Status decision: Any fatal corruption (duplicate, missing ID, mismatched ID, invalid year range, wrong chronological order) produces INVALID
  const hasFatalErrors =
    duplicateYears.length > 0 ||
    duplicateIds.length > 0 ||
    invalidYears.length > 0 ||
    mismatchedIdYears.length > 0 ||
    missingIdCount > 0;

  let status: CanonicalValidationStatus;

  if (hasFatalErrors) {
    status = "INVALID";
  } else if (!isChronological) {
    status = "INVALID";
    errors.push("Kayıtlar kronolojik sırada değildir.");
  } else if (missingYears.length === 0 && items.length === TIMELINE_DATA.length) {
    status = "VALID";
  } else {
    status = "PARTIAL";
  }

  return {
    status,
    isValid: status === "VALID",
    isPartial: status === "PARTIAL",
    totalCount: items.length,
    expectedCount: TIMELINE_DATA.length,
    missingYears,
    duplicateYears,
    duplicateIds,
    invalidYears,
    mismatchedIdYears,
    isChronological,
    errors,
    validCanonicalItems,
  };
}

/**
 * Immutable Canonical Hydrator
 * Takes any reasoning assessments or partial items and overlays them onto the 35 canonical milestones.
 * Enforces strict assessment validation:
 * - Requires exact 'milestone_${year}' identifier format (no arbitrary regex digit extraction).
 * - Rejects duplicate assessments for the same year/id.
 * - Rejects corrupted assessments.
 * - Strictly protects all 16 canonical framework fields from being overwritten by Gemini or external sources.
 */
export function hydrateCanonicalTimeline(
  assessmentsOrReasoned: any[] | Record<string, any> | null | undefined,
  baseMilestones: Milestone[] = TIMELINE_DATA
): Milestone[] {
  const assessmentMap = new Map<number, any>();
  const seenAssessmentYears = new Set<number>();
  const seenAssessmentIds = new Set<string>();

  const processAssessmentItem = (item: any) => {
    if (!item || typeof item !== "object") return;
    
    let targetYear: number | null = null;
    let targetId: string | null = null;

    const rawId = item.milestoneId || item.calendarItemId || item.id;
    if (typeof rawId === "string") {
      const parsed = parseCanonicalMilestoneId(rawId);
      if (!parsed) {
        // If rawId is explicitly provided, it MUST strictly match 'milestone_${year}' (2026-2060)
        return;
      }
      targetYear = parsed;
      targetId = rawId;

      // If explicit year is also provided, it must match parsedYear 1-to-1
      if (typeof item.year === "number" && item.year !== parsed) {
        return; // Mismatched ID and year, rejected
      }
    } else if (typeof item.year === "number") {
      // If no ID is given, year must be a valid canonical year
      if (Number.isInteger(item.year) && item.year >= 2026 && item.year <= 2060 && CANONICAL_YEAR_MAP.has(item.year)) {
        targetYear = item.year;
        targetId = `milestone_${item.year}`;
      } else {
        return; // Non-canonical or invalid year
      }
    } else {
      return; // Neither valid id nor valid year
    }

    // Rejection of duplicate assessments for same year or same ID
    if (seenAssessmentYears.has(targetYear) || seenAssessmentIds.has(targetId)) {
      return;
    }

    seenAssessmentYears.add(targetYear);
    seenAssessmentIds.add(targetId);
    assessmentMap.set(targetYear, item);
  };

  if (assessmentsOrReasoned) {
    if (Array.isArray(assessmentsOrReasoned)) {
      assessmentsOrReasoned.forEach(processAssessmentItem);
    } else if (typeof assessmentsOrReasoned === "object") {
      const assessmentsObj = assessmentsOrReasoned.assessments || assessmentsOrReasoned;
      Object.entries(assessmentsObj).forEach(([key, val]: [string, any]) => {
        if (val && typeof val === "object") {
          const itemToProcess = {
            ...val,
            milestoneId: val.milestoneId || val.calendarItemId || val.id || key,
          };
          processAssessmentItem(itemToProcess);
        }
      });
    }
  }

  // Iterate strictly over the canonical baseline framework (35 items)
  return baseMilestones.map((canonical, idx) => {
    const rawAssessment = assessmentMap.get(canonical.year);
    if (!rawAssessment) {
      return {
        ...canonical,
        id: `milestone_${canonical.year}`,
        canonicalDescription: canonical.canonicalDescription || canonical.description,
        epistemicProvenance: canonical.epistemicProvenance || ("STATIC_SCENARIO" as const),
      };
    }

    const current = rawAssessment.currentAssessment || rawAssessment;

    const revisedDesc =
      rawAssessment.revision?.content ||
      (current?.content && current.content !== canonical.description ? current.content : undefined) ||
      (rawAssessment.description && rawAssessment.description !== canonical.description ? rawAssessment.description : undefined) ||
      canonical.description;

    const probability =
      typeof current?.confidence === "number"
        ? current.confidence
        : typeof rawAssessment.probability === "number"
        ? rawAssessment.probability
        : canonical.probability;

    return {
      // ─────────────────────────────────────────────────────────────────────────────
      // 1. STRICT CANONICAL IMMUTABLE FIELDS (NEVER OVERWRITTEN BY GEMINI / API)
      // ─────────────────────────────────────────────────────────────────────────────
      id: `milestone_${canonical.year}`,
      year: canonical.year,
      title: canonical.title,
      category: canonical.category as CategoryType,
      phase: canonical.phase as PhaseId,
      iconName: canonical.iconName,

      // Baseline analytical foundations
      impactLevel: canonical.impactLevel,
      humanAugmentationIndex: canonical.humanAugmentationIndex,
      aiAutonomyIndex: canonical.aiAutonomyIndex,
      bioDigitalIntegrationRate: canonical.bioDigitalIntegrationRate,
      keyDrivers: canonical.keyDrivers,
      dailyLifeImpact: canonical.dailyLifeImpact,
      ethicalRisks: canonical.ethicalRisks,
      societalOpportunities: canonical.societalOpportunities,
      relatedYears: canonical.relatedYears,
      patents: canonical.patents,
      citations: canonical.citations,
      canonicalDescription: canonical.canonicalDescription || canonical.description,

      // ─────────────────────────────────────────────────────────────────────────────
      // 2. PERMITTED REASONING & HYDRATION FIELDS ONLY
      // ─────────────────────────────────────────────────────────────────────────────
      description: revisedDesc,
      probability,
      temporalWindow: current?.timeWindow || rawAssessment.temporalWindow || canonical.temporalWindow,
      assessment: rawAssessment.assessment || (rawAssessment.currentAssessment ? rawAssessment : undefined),
      reasoningSummary: rawAssessment.reasoningSummary || rawAssessment.reasoning || canonical.reasoningSummary,
      forecastStatus:
        rawAssessment.forecastStatus ||
        (rawAssessment.status === "REVISED"
          ? "CONFIRMED_BY_EVIDENCE"
          : rawAssessment.status === "UNCERTAIN" || rawAssessment.status === "INSUFFICIENT_EVIDENCE"
          ? "INSUFFICIENT_EVIDENCE"
          : "EMERGING_HYPOTHESIS"),
      uncertaintyLevel: current?.uncertaintyLevel || rawAssessment.uncertaintyLevel || canonical.uncertaintyLevel,
      epistemicProvenance: rawAssessment.epistemicProvenance || "DYNAMIC_REASONED_FORECAST",
      evaluationStatus: rawAssessment.evaluationStatus || (rawAssessment.status === "REVISED" ? "GEMINI_EVALUATED" : "NOT_ASSESSED"),
      evaluatedAt: rawAssessment.evaluatedAt || canonical.evaluatedAt,
      failureReason: rawAssessment.failureReason,
      lastEvaluationVersion: rawAssessment.lastEvaluationVersion,
      signals: rawAssessment.signals || canonical.signals,
      supportingEvidence: rawAssessment.supportingEvidence || canonical.supportingEvidence,
    };
  });
}
