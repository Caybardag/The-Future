import { FeatureKey } from "./creditCosts";

const DAILY_LIMITS_KEY = "future_timeline_daily_limits";
const RATE_LIMIT_KEY = "future_timeline_rate_limits";

interface DailyLimitRecord {
  date: string;
  counts: Record<string, number>;
}

function getTodayString(): string {
  return new Date().toISOString().slice(0, 10);
}

function getStoredDailyLimits(userKey: string): DailyLimitRecord {
  try {
    const raw = localStorage.getItem(`${DAILY_LIMITS_KEY}_${userKey}`);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed.date === getTodayString()) {
        return parsed;
      }
    }
  } catch (e) {
    // fallback
  }
  return { date: getTodayString(), counts: {} };
}

function saveDailyLimits(userKey: string, record: DailyLimitRecord) {
  try {
    localStorage.setItem(`${DAILY_LIMITS_KEY}_${userKey}`, JSON.stringify(record));
  } catch (e) {}
}

export function isFeatureDailyLimitReached(
  feature: FeatureKey | string,
  plan: "free" | "pro" | "quantum_vip" = "free",
  userEmail: string = "guest"
): boolean {
  // Pure credit model: usage is credit-driven, no rigid blocking limit
  return false;
}

export function getRemainingDailyUsage(
  feature: FeatureKey | string,
  plan: "free" | "pro" | "quantum_vip" = "free",
  userEmail: string = "guest"
): number {
  const quotas: Record<string, number> = {
    free: 5,
    pro: 25,
    quantum_vip: 100,
  };
  const maxQuota = quotas[plan] || 5;
  const limits = getStoredDailyLimits(userEmail);
  const used = limits.counts[feature] || 0;
  return Math.max(0, maxQuota - used);
}

export function recordFeatureDailyUsage(feature: FeatureKey | string, userEmail: string = "guest"): void {
  const limits = getStoredDailyLimits(userEmail);
  limits.counts[feature] = (limits.counts[feature] || 0) + 1;
  saveDailyLimits(userEmail, limits);
}

export function checkRateLimit(
  feature: FeatureKey | string,
  userEmail: string = "guest"
): { allowed: boolean; waitSeconds?: number } {
  try {
    const key = `${RATE_LIMIT_KEY}_${userEmail}_${feature}`;
    const lastTimestamp = sessionStorage.getItem(key);
    const now = Date.now();
    if (lastTimestamp) {
      const diff = now - Number(lastTimestamp);
      if (diff < 1500) {
        return { allowed: false, waitSeconds: Math.ceil((1500 - diff) / 1000) };
      }
    }
    sessionStorage.setItem(key, String(now));
  } catch (e) {}
  return { allowed: true };
}

export function recordRateLimitTimestamp(feature: FeatureKey | string, userEmail: string = "guest"): void {
  try {
    const key = `${RATE_LIMIT_KEY}_${userEmail}_${feature}`;
    sessionStorage.setItem(key, String(Date.now()));
  } catch (e) {}
}

export function useDailyFeatureLimit(feature: FeatureKey | string) {
  return {
    isLimitReached: false,
    increment: () => recordFeatureDailyUsage(feature),
    remainingCount: 10,
    hasRemainingUsage: true,
  };
}
