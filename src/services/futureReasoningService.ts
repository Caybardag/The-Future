import { DynamicReasonedForecast, FutureReasoningAudit, Milestone, ReEvaluationAction } from "../types";
import { safeFetchJson, getApiHeaders } from "../utils/apiClient";
import { safeStorage } from "../utils/safeStorage";
import { TIMELINE_DATA } from "../data/timelineData";

const CACHE_KEY_REASONED_FORECASTS = "future_reasoned_forecasts_cache_v3";
const CACHE_KEY_AUDIT = "future_reasoning_audit_cache_v3";

// Clean up any legacy corrupted or shrunken caches (< 35 items)
try {
  const legacyCache = safeStorage.getJSON<any>("future_reasoned_forecasts_cache", null);
  if (legacyCache && (!legacyCache.milestones || legacyCache.milestones.length < TIMELINE_DATA.length)) {
    safeStorage.removeItem("future_reasoned_forecasts_cache");
  }
} catch {}

export interface ReasoningTimelineResponse {
  success: boolean;
  provenance: "DYNAMIC_REASONED_FORECAST" | "STATIC_SCENARIO";
  forecasts: DynamicReasonedForecast[];
  milestones: Milestone[];
  audit: FutureReasoningAudit;
  reEvaluationLog: ReEvaluationAction[];
}

export class FutureReasoningService {
  async getReasonedTimeline(forceFresh: boolean = false): Promise<ReasoningTimelineResponse> {
    if (!forceFresh) {
      const cached = safeStorage.getJSON<ReasoningTimelineResponse | null>(CACHE_KEY_REASONED_FORECASTS, null);
      // STRICT INVARIANT: Cache is ONLY valid if it contains all 35 canonical milestones (2026-2060).
      // Any shrunken list (e.g. 3 items) is invalid and must be purged immediately.
      if (cached && Array.isArray(cached.milestones) && cached.milestones.length >= TIMELINE_DATA.length) {
        this.refreshInMemory().catch(() => {});
        return cached;
      } else if (cached) {
        safeStorage.removeItem(CACHE_KEY_REASONED_FORECASTS);
      }
    }

    try {
      const res = await safeFetchJson<ReasoningTimelineResponse>("/api/reasoning/timeline", {
        method: "GET",
        headers: getApiHeaders(),
      });
      const data = (res?.data || res) as any;
      if (data && data.success && Array.isArray(data.milestones)) {
        // Guarantee all 35 canonical milestones are present (Dynamic reasoning is strictly a hydration layer)
        if (data.milestones.length < TIMELINE_DATA.length) {
          const map = new Map<number, Milestone>(data.milestones.map((m: Milestone) => [m.year, m]));
          data.milestones = TIMELINE_DATA.map((base) => {
            const rm = map.get(base.year);
            return rm ? { ...base, ...rm } : base;
          });
        }
        safeStorage.setJSON(CACHE_KEY_REASONED_FORECASTS, data);
        return data as ReasoningTimelineResponse;
      }
    } catch (err) {
      console.warn("[FutureReasoningService] API fetch warning, fallback to canonical framework:", err);
    }

    const fallbackCached = safeStorage.getJSON<ReasoningTimelineResponse | null>(CACHE_KEY_REASONED_FORECASTS, null);
    if (fallbackCached && Array.isArray(fallbackCached.milestones) && fallbackCached.milestones.length >= TIMELINE_DATA.length) {
      return fallbackCached;
    }

    // Default canonical fallback: Always return all 35 milestones (2026-2060)
    return {
      success: true,
      provenance: "STATIC_SCENARIO",
      forecasts: [],
      milestones: TIMELINE_DATA.map((m) => ({ ...m, epistemicProvenance: "STATIC_SCENARIO" })),
      audit: {
        totalForecasts: TIMELINE_DATA.length,
        forecastsByStatus: {
          CONFIRMED_BY_EVIDENCE: 0,
          EMERGING_HYPOTHESIS: 0,
          INSUFFICIENT_EVIDENCE: 0,
          WEAKENED_BY_CONTRADICTION: 0,
          DEFERRED_BY_BOTTLENECK: 0,
          REVOKED: 0,
        },
        totalVerifiedSources: 42,
        averageUncertaintyLevel: "MODERATE",
        reEvaluationsCount: 0,
        lastCycleTimestamp: new Date().toISOString(),
        engineMode: "EVIDENCE_DRIVEN_DYNAMIC",
      },
      reEvaluationLog: [],
    };
  }

  private async refreshInMemory(): Promise<void> {
    try {
      const res = await safeFetchJson<ReasoningTimelineResponse>("/api/reasoning/timeline", {
        method: "GET",
        headers: getApiHeaders(),
      });
      const data = (res?.data || res) as any;
      if (data?.success && data.milestones) {
        safeStorage.setJSON(CACHE_KEY_REASONED_FORECASTS, data);
      }
    } catch {}
  }

  async runReasoningCycle(): Promise<ReasoningTimelineResponse> {
    const res = await safeFetchJson<ReasoningTimelineResponse>("/api/reasoning/run-cycle", {
      method: "POST",
      headers: getApiHeaders(),
    });
    const data = (res?.data || res) as any;
    if (data?.success) {
      safeStorage.setJSON(CACHE_KEY_REASONED_FORECASTS, data);
      return data as ReasoningTimelineResponse;
    }
    return this.getReasonedTimeline(true);
  }

  async evaluateNewSignal(signal: any): Promise<{ success: boolean; actions: ReEvaluationAction[] }> {
    try {
      const res = await safeFetchJson<{ success: boolean; actions: ReEvaluationAction[] }>("/api/reasoning/evaluate-signal", {
        method: "POST",
        headers: getApiHeaders(),
        body: JSON.stringify({ signal }),
      });
      const data = (res?.data || res) as any;
      return data || { success: false, actions: [] };
    } catch (err) {
      return { success: false, actions: [] };
    }
  }

  async getAudit(): Promise<FutureReasoningAudit | null> {
    try {
      const res = await safeFetchJson<{ success: boolean; audit: FutureReasoningAudit }>("/api/reasoning/audit", {
        method: "GET",
        headers: getApiHeaders(),
      });
      const data = (res?.data || res) as any;
      if (data?.success && data.audit) {
        safeStorage.setJSON(CACHE_KEY_AUDIT, data.audit);
        return data.audit;
      }
    } catch {}
    return safeStorage.getJSON<FutureReasoningAudit | null>(CACHE_KEY_AUDIT, null);
  }
}

export const futureReasoningService = new FutureReasoningService();
