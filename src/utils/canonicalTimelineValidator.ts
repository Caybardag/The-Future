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

const CANONICAL_YEARS: number[] = TIMELINE_DATA.map((m) => m.year);
const CANONICAL_YEAR_MAP = new Map<number, Milestone>(TIMELINE_DATA.map((m) => [m.year, m]));
const CANONICAL_ID_TO_YEAR = new Map<string, number>(TIMELINE_DATA.map((m) => [getCanonicalId(m), m.year]));

/**
 * Validates any milestone array against the canonical 35-item framework (2026–2060).
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

  for (let i = 0; i < items.length; i++) {
    const item = items[i];
    if (!item || typeof item !== "object" || typeof item.year !== "number") {
      errors.push(`Kayıt #${i} geçersiz nesne veya eksik yıl içeriyor.`);
      continue;
    }

    const yr = item.year;
    const itemId: string | undefined = item.id;

    // Check chronological order
    if (yr <= previousYear) {
      isChronological = false;
    }
    previousYear = yr;

    // Check canonical year range (2026-2060)
    if (!CANONICAL_YEAR_MAP.has(yr)) {
      invalidYears.push(yr);
      errors.push(`Kayıt #${i} (${yr}) canonical takvim aralığı (2026–2060) dışındadır.`);
    }

    // Check duplicate year
    if (seenYears.has(yr)) {
      duplicateYearsSet.add(yr);
      errors.push(`Yıl ${yr} yinelenen (duplicate) olarak bulundu.`);
    } else {
      seenYears.add(yr);
    }

    // Check ID validation if present
    if (itemId) {
      if (seenIds.has(itemId)) {
        duplicateIdsSet.add(itemId);
        errors.push(`ID '${itemId}' yinelenen (duplicate) olarak bulundu.`);
      } else {
        seenIds.add(itemId);
      }

      const expectedId = `milestone_${yr}`;
      const canonicalYearForId = CANONICAL_ID_TO_YEAR.get(itemId);

      if (itemId !== expectedId) {
        // ID does not match year
        mismatchedIdYears.push({
          id: itemId,
          year: yr,
          expectedId,
          expectedYear: canonicalYearForId,
        });
        errors.push(`ID uyuşmazlığı: ID '${itemId}' ile Yıl ${yr} eşleşmiyor (Beklenen: '${expectedId}').`);
      }
    }

    // Check if canonical and valid so far
    if (CANONICAL_YEAR_MAP.has(yr)) {
      validCanonicalItems.push(item);
    }
  }

  const missingYears = CANONICAL_YEARS.filter((y) => !seenYears.has(y));
  const duplicateYears = Array.from(duplicateYearsSet);
  const duplicateIds = Array.from(duplicateIdsSet);

  // Status decision
  const hasFatalErrors =
    duplicateYears.length > 0 ||
    duplicateIds.length > 0 ||
    invalidYears.length > 0 ||
    mismatchedIdYears.length > 0;

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
 * Strictly guarantees that canonical ID, year, title, category, phase, and order CANNOT be overwritten.
 */
export function hydrateCanonicalTimeline(
  assessmentsOrReasoned: any[] | Record<string, any> | null | undefined,
  baseMilestones: Milestone[] = TIMELINE_DATA
): Milestone[] {
  // Normalize lookup map
  const assessmentMap = new Map<number, any>();

  if (assessmentsOrReasoned) {
    if (Array.isArray(assessmentsOrReasoned)) {
      assessmentsOrReasoned.forEach((item) => {
        if (item && typeof item === "object") {
          const yr = item.year || (item.calendarItemId ? Number(String(item.calendarItemId).replace(/\D/g, "")) : undefined);
          if (typeof yr === "number" && yr >= 2026 && yr <= 2060) {
            assessmentMap.set(yr, item);
          }
        }
      });
    } else if (typeof assessmentsOrReasoned === "object") {
      const assessmentsObj = assessmentsOrReasoned.assessments || assessmentsOrReasoned;
      Object.entries(assessmentsObj).forEach(([key, val]: [string, any]) => {
        if (val && typeof val === "object") {
          const yr = val.year || Number(String(key).replace(/\D/g, ""));
          if (typeof yr === "number" && yr >= 2026 && yr <= 2060) {
            assessmentMap.set(yr, val);
          }
        }
      });
    }
  }

  // Iterate strictly over the canonical baseline framework (35 items)
  return baseMilestones.map((canonical) => {
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
    const isRevised =
      rawAssessment.status === "REVISED" ||
      rawAssessment.forecastStatus === "CONFIRMED_BY_EVIDENCE";

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
      reasoningSummary: rawAssessment.reasoning || rawAssessment.reasoningSummary || canonical.reasoningSummary,
      forecastStatus:
        rawAssessment.forecastStatus ||
        (rawAssessment.status === "REVISED"
          ? "CONFIRMED_BY_EVIDENCE"
          : rawAssessment.status === "UNCERTAIN" || rawAssessment.status === "INSUFFICIENT_EVIDENCE"
          ? "INSUFFICIENT_EVIDENCE"
          : "EMERGING_HYPOTHESIS"),
      uncertaintyLevel: current?.uncertaintyLevel || rawAssessment.uncertaintyLevel || canonical.uncertaintyLevel,
      epistemicProvenance: rawAssessment.epistemicProvenance || "DYNAMIC_REASONED_FORECAST",
      signals: rawAssessment.signals || canonical.signals,
      supportingEvidence: rawAssessment.supportingEvidence || canonical.supportingEvidence,
    };
  });
}
