import { DynamicReasonedForecast, FutureReasoningAudit, Milestone, ReEvaluationAction } from "../types";
import { safeFetchJson, getApiHeaders } from "../utils/apiClient";
import { safeStorage } from "../utils/safeStorage";

const CACHE_KEY_REASONED_FORECASTS = "future_reasoned_forecasts_cache";
const CACHE_KEY_AUDIT = "future_reasoning_audit_cache";

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
      if (cached && cached.milestones && cached.milestones.length > 0) {
        // Return cached immediately and refresh in background
        this.refreshInMemory().catch(() => {});
        return cached;
      }
    }

    try {
      const res = await safeFetchJson<ReasoningTimelineResponse>("/api/reasoning/timeline", {
        method: "GET",
        headers: getApiHeaders(),
      });
      const data = (res?.data || res) as any;
      if (data && data.success && data.milestones) {
        safeStorage.setJSON(CACHE_KEY_REASONED_FORECASTS, data);
        return data as ReasoningTimelineResponse;
      }
    } catch (err) {
      console.warn("[FutureReasoningService] API fetch warning, fallback to cached:", err);
    }

    const fallbackCached = safeStorage.getJSON<ReasoningTimelineResponse | null>(CACHE_KEY_REASONED_FORECASTS, null);
    if (fallbackCached) return fallbackCached;

    return {
      success: true,
      provenance: "STATIC_SCENARIO",
      forecasts: [],
      milestones: [],
      audit: {
        totalForecasts: 0,
        forecastsByStatus: {
          CONFIRMED_BY_EVIDENCE: 0,
          EMERGING_HYPOTHESIS: 0,
          INSUFFICIENT_EVIDENCE: 0,
          WEAKENED_BY_CONTRADICTION: 0,
          DEFERRED_BY_BOTTLENECK: 0,
          REVOKED: 0,
        },
        totalVerifiedSources: 0,
        averageUncertaintyLevel: "UNKNOWN",
        reEvaluationsCount: 0,
        lastCycleTimestamp: new Date().toISOString(),
        engineMode: "OFFLINE_DETERMINISTIC_EVAL",
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
