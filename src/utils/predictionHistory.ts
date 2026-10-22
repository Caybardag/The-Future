import { PredictionHistoryService } from "../services/predictionHistoryService";
import { safeStorage } from "./safeStorage";

export type PredictionFeatureKey =
  | "ai_simulation"
  | "job_risk"
  | "butterfly_effect"
  | "personal_roadmap"
  | "persona_chat"
  | "futurist_advisor"
  | "scientific_verification"
  | "custom_query";

export type PredictionSentiment = "optimistic" | "neutral" | "dystopian" | "transformative";
export type AccuracyFeedback = "bullseye" | "probable" | "unlikely" | "anomalous";

export interface PredictionHistoryRecord {
  id: string;
  userEmail?: string;
  userId?: string;
  timestamp: string; // ISO string
  featureKey: PredictionFeatureKey;
  featureName: string;
  queryTitle: string;
  queryInput: {
    prompt?: string;
    targetYear?: number;
    profession?: string;
    personaName?: string;
    scenarioMode?: "baseline" | "optimistic" | "dystopian";
    mode?: string;
    category?: string;
    customParams?: Record<string, any>;
  };
  generatedOutcome: string;
  summarySnippet: string;
  category: string;
  targetYear: number;
  scenarioMode: "baseline" | "optimistic" | "dystopian";
  creditsSpent: number;
  metrics: {
    feasibilityScore: number; // 0 - 100
    impactLevel: number; // 0 - 100
    riskLevel: "Düşük" | "Orta" | "Yüksek" | "Kritik";
    sentiment: PredictionSentiment;
    wordCount?: number;
    tokensEstimated?: number;
  };
  userEngagement: {
    isBookmarked: boolean;
    userNotes?: string;
    accuracyVote?: AccuracyFeedback | null;
    viewCount: number;
    lastViewedAt?: string;
  };
  tags: string[];
}

/**
 * Retrieve user-scoped prediction history records from local storage or cloud
 */
export function getPredictionHistory(userEmailOrId?: string | null): PredictionHistoryRecord[] {
  return PredictionHistoryService.getLocalPredictions(userEmailOrId);
}

/**
 * Save a new simulation / prediction query outcome into history (User-Isolated)
 */
export function recordPredictionHistoryEntry(
  entry: Omit<PredictionHistoryRecord, "id" | "timestamp" | "userEngagement" | "summarySnippet" | "tags"> & {
    id?: string;
    userId?: string;
    userEmail?: string;
    timestamp?: string;
    summarySnippet?: string;
    tags?: string[];
    userNotes?: string;
  }
): PredictionHistoryRecord {
  const now = new Date();
  const id = entry.id || "PRED-" + Date.now();

  const words = entry.generatedOutcome ? entry.generatedOutcome.trim().split(/\s+/).length : 0;
  const estimatedTokens = Math.round(words * 2.8);

  const autoSummary =
    entry.summarySnippet ||
    (entry.generatedOutcome
      ? entry.generatedOutcome
          .replace(/[\n\r]+/g, " ")
          .replace(/[#*`_]/g, "")
          .substring(0, 180) + "..."
      : entry.queryTitle);

  const autoTags =
    entry.tags && entry.tags.length > 0
      ? entry.tags
      : [
          entry.category || "Gelecek",
          entry.targetYear ? `${entry.targetYear}` : "Genel",
          (entry.scenarioMode || "baseline").toUpperCase(),
          (entry.featureName || "Simülasyon").split(" ")[0],
        ];

  const fullRecord: PredictionHistoryRecord = {
    id,
    userEmail: entry.userEmail,
    userId: entry.userId,
    timestamp: entry.timestamp || now.toISOString(),
    featureKey: entry.featureKey,
    featureName: entry.featureName,
    queryTitle: entry.queryTitle,
    queryInput: entry.queryInput,
    generatedOutcome: entry.generatedOutcome,
    summarySnippet: autoSummary,
    category: entry.category || "Genel Gelecek",
    targetYear: entry.targetYear || 2035,
    scenarioMode: entry.scenarioMode || "baseline",
    creditsSpent: entry.creditsSpent ?? 10,
    metrics: {
      feasibilityScore: entry.metrics?.feasibilityScore ?? 85,
      impactLevel: entry.metrics?.impactLevel ?? 88,
      riskLevel: entry.metrics?.riskLevel ?? "Orta",
      sentiment: entry.metrics?.sentiment ?? "neutral",
      wordCount: words,
      tokensEstimated: estimatedTokens,
    },
    userEngagement: {
      isBookmarked: false,
      userNotes: entry.userNotes || "",
      accuracyVote: null,
      viewCount: 1,
      lastViewedAt: now.toISOString(),
    },
    tags: Array.from(new Set(autoTags)),
  };

  PredictionHistoryService.savePrediction(fullRecord, entry.userEmail || entry.userId);

  try {
    window.dispatchEvent(new CustomEvent("future_prediction_saved", { detail: fullRecord }));
  } catch (e) {
    console.warn("Failed to dispatch event:", e);
  }

  return fullRecord;
}

/**
 * Toggle bookmark/favorite status of a prediction record
 */
export function toggleBookmarkPrediction(id: string, userEmailOrId?: string | null): boolean {
  const current = getPredictionHistory(userEmailOrId);
  const target = current.find((item) => item.id === id);
  if (!target) return false;

  const nextState = !target.userEngagement.isBookmarked;
  PredictionHistoryService.updatePrediction(
    id,
    {
      userEngagement: {
        ...target.userEngagement,
        isBookmarked: nextState,
      },
    },
    userEmailOrId
  );

  try {
    window.dispatchEvent(
      new CustomEvent("future_prediction_updated", {
        detail: { id, isBookmarked: nextState, userEmailOrId },
      })
    );
  } catch {}

  return nextState;
}

/**
 * Update personal notes on a prediction record
 */
export function updatePredictionNote(
  id: string,
  notes: string,
  userEmailOrId?: string | null
): void {
  const current = getPredictionHistory(userEmailOrId);
  const target = current.find((item) => item.id === id);
  if (!target) return;

  PredictionHistoryService.updatePrediction(
    id,
    {
      userEngagement: {
        ...target.userEngagement,
        userNotes: notes,
      },
    },
    userEmailOrId
  );

  try {
    window.dispatchEvent(
      new CustomEvent("future_prediction_updated", {
        detail: { id, userNotes: notes, userEmailOrId },
      })
    );
  } catch {}
}

/**
 * Cast user accuracy rating on a generated prediction
 */
export function votePredictionAccuracy(
  id: string,
  vote: AccuracyFeedback,
  userEmailOrId?: string | null
): void {
  const current = getPredictionHistory(userEmailOrId);
  const target = current.find((item) => item.id === id);
  if (!target) return;

  PredictionHistoryService.updatePrediction(
    id,
    {
      userEngagement: {
        ...target.userEngagement,
        accuracyVote: vote,
      },
    },
    userEmailOrId
  );

  try {
    window.dispatchEvent(
      new CustomEvent("future_prediction_updated", {
        detail: { id, accuracyVote: vote, userEmailOrId },
      })
    );
  } catch {}
}

/**
 * Increment view count for engagement analytics
 */
export function incrementPredictionView(id: string, userEmailOrId?: string | null): void {
  const current = getPredictionHistory(userEmailOrId);
  const target = current.find((item) => item.id === id);
  if (!target) return;

  PredictionHistoryService.updatePrediction(
    id,
    {
      userEngagement: {
        ...target.userEngagement,
        viewCount: (target.userEngagement.viewCount || 0) + 1,
        lastViewedAt: new Date().toISOString(),
      },
    },
    userEmailOrId
  );
}

/**
 * Delete a specific prediction record
 */
export function deletePredictionRecord(id: string, userEmailOrId?: string | null): boolean {
  try {
    PredictionHistoryService.deletePrediction(id, userEmailOrId);
    window.dispatchEvent(
      new CustomEvent("future_prediction_updated", { detail: { id, deleted: true, userEmailOrId } })
    );
    return true;
  } catch {
    return false;
  }
}

/**
 * Reset / Clear all prediction history for the active user
 */
export function clearAllPredictionHistory(userEmailOrId?: string | null): void {
  try {
    PredictionHistoryService.clearAllUserPredictions(userEmailOrId);
    window.dispatchEvent(
      new CustomEvent("future_prediction_updated", { detail: { cleared: true, userEmailOrId } })
    );
  } catch {}
}

/**
 * Export history as a formatted Markdown Dossier
 */
export function exportHistoryAsMarkdown(records: PredictionHistoryRecord[]): string {
  const dateStr = new Date().toLocaleDateString("tr-TR");
  let md = `# 🔮 TEKNOLOJİK EVRİM ÇİZELGESİ — KİŞİSEL TAHMİN & SİMÜLASYON RAPORU\n`;
  md += `*Rapor Oluşturulma Tarihi: ${dateStr} | Toplam Simülasyon Sayısı: ${records.length}*\n\n`;
  md += `---\n\n`;

  records.forEach((rec, idx) => {
    md += `### ${idx + 1}. [${rec.targetYear}] ${rec.queryTitle}\n`;
    md += `- **Modül / Özellik:** ${rec.featureName} (${rec.featureKey})\n`;
    md += `- **Kategori:** ${rec.category} | **Senaryo Modu:** ${rec.scenarioMode.toUpperCase()}\n`;
    md += `- **Tarih & Saat:** ${new Date(rec.timestamp).toLocaleString("tr-TR")}\n`;
    md += `- **Metrikler:** Fizibilite: %${rec.metrics.feasibilityScore} | Etki: %${rec.metrics.impactLevel} | Risk: ${rec.metrics.riskLevel}\n`;
    if (rec.userEngagement.userNotes) {
      md += `- **Kullanıcı Notu:** _"${rec.userEngagement.userNotes}"_\n`;
    }
    if (rec.userEngagement.accuracyVote) {
      md += `- **Kullanıcı İsabet Değerlendirmesi:** ${rec.userEngagement.accuracyVote}\n`;
    }
    md += `\n**Üretilen AI Simülasyon Çıktısı:**\n\n`;
    md += `${rec.generatedOutcome}\n\n`;
    md += `---\n\n`;
  });

  md += `\n*Bu rapor 2026-2060 Teknolojik Evrim Çizelgesi Otonom AI Motoru tarafından üretilmiştir.*\n`;
  return md;
}

const PENDING_RERUN_KEY = "future_pending_rerun_record";

/**
 * Stage a prediction record to be re-run in its respective module
 */
export function setPendingRerunRecord(record: PredictionHistoryRecord): void {
  try {
    safeStorage.setItem(PENDING_RERUN_KEY, JSON.stringify(record));
    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("future_prediction_rerun_staged", { detail: record }));
    }
  } catch {}
}

/**
 * Retrieve the pending re-run record if any exists
 */
export function getPendingRerunRecord(): PredictionHistoryRecord | null {
  try {
    const raw = safeStorage.getItem(PENDING_RERUN_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

/**
 * Clear the pending re-run record after consumption
 */
export function clearPendingRerunRecord(): void {
  try {
    safeStorage.removeItem(PENDING_RERUN_KEY);
  } catch {}
}
