import { useState, useEffect } from "react";
import { FeatureKey, getFeatureDailyLimit, getFeatureCreditCost } from "./creditCosts";

const DAILY_USAGE_EVENT = "daily_feature_usage_updated";
const RATE_LIMIT_KEY_PREFIX = "rate_limit_last_time_";
export const DEFAULT_RATE_LIMIT_SECONDS = 3; // 3 saniye anti-spam rate limit

export function getCurrentMonthString(): string {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  return `${year}-${month}`;
}

export function getTodayDateString(): string {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function getStorageKey(feature: FeatureKey, userIdentifier?: string | null): string {
  const user = userIdentifier ? userIdentifier.replace(/[^a-zA-Z0-9_@.-]/g, "_") : "guest";
  return `monthly_usage_${user}_${getCurrentMonthString()}_${feature}`;
}

export function getFeatureDailyUsageCount(feature: FeatureKey, userIdentifier?: string | null): number {
  try {
    const key = getStorageKey(feature, userIdentifier);
    const val = localStorage.getItem(key);
    return val ? parseInt(val, 10) || 0 : 0;
  } catch (e) {
    return 0;
  }
}

export function recordFeatureDailyUsage(feature: FeatureKey, userIdentifier?: string | null): number {
  try {
    const key = getStorageKey(feature, userIdentifier);
    const current = getFeatureDailyUsageCount(feature, userIdentifier);
    const next = current + 1;
    localStorage.setItem(key, String(next));
    
    // Dispatch custom event to notify listeners across the app
    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent(DAILY_USAGE_EVENT, { detail: { feature, userIdentifier, usage: next } }));
    }
    return next;
  } catch (e) {
    return 0;
  }
}

export function checkRateLimit(
  feature: FeatureKey,
  userIdentifier?: string | null,
  cooldownSeconds: number = DEFAULT_RATE_LIMIT_SECONDS
): { allowed: boolean; remainingSeconds: number } {
  try {
    const user = userIdentifier ? userIdentifier.replace(/[^a-zA-Z0-9_@.-]/g, "_") : "guest";
    const key = `${RATE_LIMIT_KEY_PREFIX}${user}_${feature}`;
    const lastTimeStr = localStorage.getItem(key);
    const now = Date.now();

    if (lastTimeStr) {
      const lastTime = parseInt(lastTimeStr, 10);
      const elapsedSeconds = (now - lastTime) / 1000;
      if (elapsedSeconds < cooldownSeconds) {
        const remainingSeconds = Math.ceil(cooldownSeconds - elapsedSeconds);
        return { allowed: false, remainingSeconds };
      }
    }
    return { allowed: true, remainingSeconds: 0 };
  } catch (e) {
    return { allowed: true, remainingSeconds: 0 };
  }
}

export function recordRateLimitTimestamp(
  feature: FeatureKey,
  userIdentifier?: string | null
): void {
  try {
    const user = userIdentifier ? userIdentifier.replace(/[^a-zA-Z0-9_@.-]/g, "_") : "guest";
    const key = `${RATE_LIMIT_KEY_PREFIX}${user}_${feature}`;
    localStorage.setItem(key, String(Date.now()));
  } catch (e) {}
}

export function isFeatureDailyLimitReached(
  feature: FeatureKey,
  plan?: string | null,
  userIdentifier?: string | null
): boolean {
  const usage = getFeatureDailyUsageCount(feature, userIdentifier);
  const limit = getFeatureDailyLimit(feature, plan);
  return usage >= limit;
}

export function getRemainingDailyUsage(
  feature: FeatureKey,
  plan?: string | null,
  userIdentifier?: string | null
): number {
  const usage = getFeatureDailyUsageCount(feature, userIdentifier);
  const limit = getFeatureDailyLimit(feature, plan);
  return Math.max(0, limit - usage);
}

export function useDailyFeatureLimit(
  feature: FeatureKey,
  plan?: string | null,
  userIdentifier?: string | null,
  userCredits?: number
) {
  const [usage, setUsage] = useState<number>(() => getFeatureDailyUsageCount(feature, userIdentifier));

  useEffect(() => {
    setUsage(getFeatureDailyUsageCount(feature, userIdentifier));

    const handleUpdate = (e: Event) => {
      const customEvt = e as CustomEvent;
      if (customEvt.detail && customEvt.detail.feature === feature) {
        setUsage(getFeatureDailyUsageCount(feature, userIdentifier));
      }
    };

    if (typeof window !== "undefined") {
      window.addEventListener(DAILY_USAGE_EVENT, handleUpdate);
      window.addEventListener("storage", handleUpdate);
    }

    return () => {
      if (typeof window !== "undefined") {
        window.removeEventListener(DAILY_USAGE_EVENT, handleUpdate);
        window.removeEventListener("storage", handleUpdate);
      }
    };
  }, [feature, plan, userIdentifier]);

  const dailyLimit = getFeatureDailyLimit(feature, plan);
  const featureCost = getFeatureCreditCost(feature, plan);
  const remainingFree = Math.max(0, dailyLimit - usage);
  
  // As long as the user has credits OR has remaining free quota, there is NO hard block!
  const hasFreeQuota = remainingFree > 0;
  const hasEnoughCredits = (userCredits ?? 0) >= featureCost;
  const isLimitReached = !hasFreeQuota && !hasEnoughCredits;

  const increment = () => recordFeatureDailyUsage(feature, userIdentifier);

  return {
    usage,
    dailyLimit,
    isLimitReached, // True ONLY if free quota is used up AND user lacks credits
    hasFreeQuota,
    remaining: remainingFree,
    increment,
  };
}

