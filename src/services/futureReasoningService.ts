import { DynamicReasonedForecast, FutureReasoningAudit, Milestone, ReEvaluationAction } from "../types";
import { safeFetchJson, getApiHeaders } from "../utils/apiClient";
import { safeStorage } from "../utils/safeStorage";
import { TIMELINE_DATA } from "../data/timelineData";
import {
  validateCanonicalTimeline,
  hydrateCanonicalTimeline,
} from "../utils/canonicalTimelineValidator";

const CACHE_KEY_REASONED_FORECASTS = "future_reasoned_forecasts_cache_v3";
const CACHE_KEY_AUDIT = "future_reasoning_audit_cache_v3";

export interface ReasoningTimelineResponse {
  success: boolean;
  provenance: "DYNAMIC_REASONED_FORECAST" | "STATIC_SCENARIO";
  forecasts: DynamicReasonedForecast[];
  milestones: Milestone[];
  audit: FutureReasoningAudit;
  reEvaluationLog: ReEvaluationAction[];
  version?: string;
  updatedAt?: string;
}

type TimelineUpdateSubscriber = (res: ReasoningTimelineResponse) => void;

export class FutureReasoningService {
  private subscribers: Set<TimelineUpdateSubscriber> = new Set();
  private lastEvaluatedTimestamp: number = 0;

  /**
   * Subscribe to timeline reasoning updates (ensures React State and Background Reasoning stay in sync)
   */
  onTimelineUpdated(subscriber: TimelineUpdateSubscriber): () => void {
    this.subscribers.add(subscriber);
    return () => {
      this.subscribers.delete(subscriber);
    };
  }

  private notifySubscribers(res: ReasoningTimelineResponse): void {
    this.subscribers.forEach((sub) => {
      try {
        sub(res);
      } catch (err) {
        console.warn("[FutureReasoningService] Subscriber notification error:", err);
      }
    });
  }

  async getReasonedTimeline(forceFresh: boolean = false): Promise<ReasoningTimelineResponse> {
    if (!forceFresh) {
      const cached = safeStorage.getJSON<ReasoningTimelineResponse | null>(CACHE_KEY_REASONED_FORECASTS, null);
      if (cached && cached.milestones) {
        const val = validateCanonicalTimeline(cached.milestones);
        if (val.status === "VALID") {
          // Re-hydrate over canonical baseline to guarantee canonical fields are grounded
          const canonicalHydrated = hydrateCanonicalTimeline(cached.milestones);
          const validatedResponse: ReasoningTimelineResponse = {
            ...cached,
            milestones: canonicalHydrated,
          };
          this.refreshInMemory().catch(() => {});
          return validatedResponse;
        } else if (val.status === "PARTIAL") {
          // PARTIAL: Valid assessments applied to canonical 35 items; schedule background refresh
          const partiallyHydrated = hydrateCanonicalTimeline(cached.milestones);
          const partialResponse: ReasoningTimelineResponse = {
            ...cached,
            milestones: partiallyHydrated,
          };
          this.refreshInMemory().catch(() => {});
          return partialResponse;
        } else {
          // INVALID: Purge corrupted cache safely (never touches other keys)
          safeStorage.removeItem(CACHE_KEY_REASONED_FORECASTS);
        }
      }
    }

    try {
      const res = await safeFetchJson<ReasoningTimelineResponse>("/api/reasoning/timeline", {
        method: "GET",
        headers: getApiHeaders(),
      });
      const data = (res?.data || res) as any;
      if (data && data.success && Array.isArray(data.milestones)) {
        // Run central canonical validator & hydration
        const hydratedMilestones = hydrateCanonicalTimeline(data.milestones);
        const validatedResponse: ReasoningTimelineResponse = {
          success: true,
          provenance: data.provenance || "DYNAMIC_REASONED_FORECAST",
          forecasts: data.forecasts || [],
          milestones: hydratedMilestones,
          audit: data.audit || this.createDefaultAudit(),
          reEvaluationLog: data.reEvaluationLog || [],
          updatedAt: new Date().toISOString(),
        };

        const resTime = new Date(validatedResponse.updatedAt || "").getTime() || Date.now();
        if (resTime >= this.lastEvaluatedTimestamp) {
          this.lastEvaluatedTimestamp = resTime;
          safeStorage.setJSON(CACHE_KEY_REASONED_FORECASTS, validatedResponse);
          this.notifySubscribers(validatedResponse);
        }
        return validatedResponse;
      }
    } catch (err) {
      console.warn("[FutureReasoningService] API fetch warning, fallback to canonical framework:", err);
    }

    // Fallback: Check if cached is valid or partial
    const fallbackCached = safeStorage.getJSON<ReasoningTimelineResponse | null>(CACHE_KEY_REASONED_FORECASTS, null);
    if (fallbackCached && fallbackCached.milestones) {
      const val = validateCanonicalTimeline(fallbackCached.milestones);
      if (val.status === "VALID" || val.status === "PARTIAL") {
        return {
          ...fallbackCached,
          milestones: hydrateCanonicalTimeline(fallbackCached.milestones),
        };
      }
    }

    // Default canonical fallback: Always return all 35 milestones (2026-2060)
    return {
      success: true,
      provenance: "STATIC_SCENARIO",
      forecasts: [],
      milestones: hydrateCanonicalTimeline([]),
      audit: this.createDefaultAudit(),
      reEvaluationLog: [],
      updatedAt: new Date().toISOString(),
    };
  }

  private async refreshInMemory(): Promise<void> {
    try {
      const res = await safeFetchJson<ReasoningTimelineResponse>("/api/reasoning/timeline", {
        method: "GET",
        headers: getApiHeaders(),
      });
      const data = (res?.data || res) as any;
      if (data?.success && Array.isArray(data.milestones)) {
        const hydrated = hydrateCanonicalTimeline(data.milestones);
        const validatedResponse: ReasoningTimelineResponse = {
          ...data,
          milestones: hydrated,
          updatedAt: new Date().toISOString(),
        };
        const resTime = Date.now();
        if (resTime >= this.lastEvaluatedTimestamp) {
          this.lastEvaluatedTimestamp = resTime;
          safeStorage.setJSON(CACHE_KEY_REASONED_FORECASTS, validatedResponse);
          this.notifySubscribers(validatedResponse);
        }
      }
    } catch {}
  }

  async runReasoningCycle(): Promise<ReasoningTimelineResponse> {
    const res = await safeFetchJson<ReasoningTimelineResponse>("/api/reasoning/run-cycle", {
      method: "POST",
      headers: getApiHeaders(),
    });
    const data = (res?.data || res) as any;
    if (data?.success && Array.isArray(data.milestones)) {
      const hydrated = hydrateCanonicalTimeline(data.milestones);
      const validatedResponse: ReasoningTimelineResponse = {
        ...data,
        milestones: hydrated,
        updatedAt: new Date().toISOString(),
      };
      this.lastEvaluatedTimestamp = Date.now();
      safeStorage.setJSON(CACHE_KEY_REASONED_FORECASTS, validatedResponse);
      this.notifySubscribers(validatedResponse);
      return validatedResponse;
    }
    return this.getReasonedTimeline(true);
  }

  private createDefaultAudit(): FutureReasoningAudit {
    return {
      totalForecasts: TIMELINE_DATA.length,
      forecastsByStatus: {
        CONFIRMED_BY_EVIDENCE: 0,
        EMERGING_HYPOTHESIS: 0,
        INSUFFICIENT_EVIDENCE: 0,
        WEAKENED_BY_CONTRADICTION: 0,
        DEFERRED_BY_BOTTLENECK: 0,
        REVOKED: 0,
      },
      totalVerifiedSources: 0,
      averageUncertaintyLevel: "NOT_COMPUTED",
      uncertaintySampleSize: 0,
      reEvaluationsCount: 0,
      lastCycleTimestamp: new Date().toISOString(),
      engineMode: "EVIDENCE_DRIVEN_DYNAMIC",
      revision: 0,
      evaluationsSummary: {
        geminiEvaluatedCount: 0,
        pendingCount: 0,
        failedCount: 0,
        notAssessedCount: TIMELINE_DATA.length,
        requiresReevaluationCount: 0,
      },
    };
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
