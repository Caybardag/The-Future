// src/utils/rewardedAdTracker.ts
// Tracks user rewarded ad views and limits (e.g. up to 10 ads per day = +150 free credits)

export const REWARDED_AD_LIMIT_PER_DAY = 5;
export const CREDITS_PER_REWARDED_AD = 5;

export const SPONSOR_CLICK_LIMIT_PER_DAY = 5;
export const CREDITS_PER_SPONSOR_CLICK = 3;

// Maximum daily free credits obtainable by free users: 5 * 5 + 5 * 3 = 40 Credits
export const MAX_DAILY_FREE_CREDITS =
  REWARDED_AD_LIMIT_PER_DAY * CREDITS_PER_REWARDED_AD +
  SPONSOR_CLICK_LIMIT_PER_DAY * CREDITS_PER_SPONSOR_CLICK;

const STORAGE_KEY = "quantum_rewarded_ad_logs_v1";
const SPONSOR_STORAGE_KEY = "quantum_sponsor_click_logs_v1";

interface AdWatchLog {
  date: string; // YYYY-MM-DD
  count: number;
  totalCreditsEarned: number;
}

export function getTodayDateString(): string {
  const now = new Date();
  return now.toISOString().split("T")[0];
}

export function getTodayRewardedAdStats(userEmail?: string): {
  watchedToday: number;
  remainingToday: number;
  maxDaily: number;
  rewardPerAd: number;
  canWatch: boolean;
} {
  const today = getTodayDateString();
  const key = `${STORAGE_KEY}_${userEmail ? userEmail.toLowerCase().trim() : "guest"}`;

  try {
    const raw = localStorage.getItem(key);
    if (raw) {
      const data: AdWatchLog = JSON.parse(raw);
      if (data.date === today) {
        const watched = data.count || 0;
        const remaining = Math.max(0, REWARDED_AD_LIMIT_PER_DAY - watched);
        return {
          watchedToday: watched,
          remainingToday: remaining,
          maxDaily: REWARDED_AD_LIMIT_PER_DAY,
          rewardPerAd: CREDITS_PER_REWARDED_AD,
          canWatch: remaining > 0,
        };
      }
    }
  } catch (e) {
    console.warn("Error reading rewarded ad stats:", e);
  }

  return {
    watchedToday: 0,
    remainingToday: REWARDED_AD_LIMIT_PER_DAY,
    maxDaily: REWARDED_AD_LIMIT_PER_DAY,
    rewardPerAd: CREDITS_PER_REWARDED_AD,
    canWatch: true,
  };
}

export function recordRewardedAdWatch(userEmail?: string): {
  watchedToday: number;
  remainingToday: number;
  creditsEarned: number;
} {
  const today = getTodayDateString();
  const key = `${STORAGE_KEY}_${userEmail ? userEmail.toLowerCase().trim() : "guest"}`;

  let currentCount = 0;
  let totalEarned = 0;

  try {
    const raw = localStorage.getItem(key);
    if (raw) {
      const data: AdWatchLog = JSON.parse(raw);
      if (data.date === today) {
        currentCount = data.count || 0;
        totalEarned = data.totalCreditsEarned || 0;
      }
    }
  } catch (e) {
    // ignore
  }

  currentCount += 1;
  totalEarned += CREDITS_PER_REWARDED_AD;

  try {
    const updated: AdWatchLog = {
      date: today,
      count: currentCount,
      totalCreditsEarned: totalEarned,
    };
    localStorage.setItem(key, JSON.stringify(updated));
  } catch (e) {
    console.warn("Failed to persist rewarded ad log:", e);
  }

  return {
    watchedToday: currentCount,
    remainingToday: Math.max(0, REWARDED_AD_LIMIT_PER_DAY - currentCount),
    creditsEarned: CREDITS_PER_REWARDED_AD,
  };
}

export function getTodaySponsorClickStats(userEmail?: string): {
  clickedToday: number;
  remainingToday: number;
  maxDaily: number;
  rewardPerClick: number;
  canClick: boolean;
} {
  const today = getTodayDateString();
  const key = `${SPONSOR_STORAGE_KEY}_${userEmail ? userEmail.toLowerCase().trim() : "guest"}`;

  try {
    const raw = localStorage.getItem(key);
    if (raw) {
      const data: AdWatchLog = JSON.parse(raw);
      if (data.date === today) {
        const clicked = data.count || 0;
        const remaining = Math.max(0, SPONSOR_CLICK_LIMIT_PER_DAY - clicked);
        return {
          clickedToday: clicked,
          remainingToday: remaining,
          maxDaily: SPONSOR_CLICK_LIMIT_PER_DAY,
          rewardPerClick: CREDITS_PER_SPONSOR_CLICK,
          canClick: remaining > 0,
        };
      }
    }
  } catch (e) {
    console.warn("Error reading sponsor click stats:", e);
  }

  return {
    clickedToday: 0,
    remainingToday: SPONSOR_CLICK_LIMIT_PER_DAY,
    maxDaily: SPONSOR_CLICK_LIMIT_PER_DAY,
    rewardPerClick: CREDITS_PER_SPONSOR_CLICK,
    canClick: true,
  };
}

export function syncSponsorClickStatsFromServer(
  userEmail?: string,
  serverData?: { clickedToday?: number; remainingToday?: number; canClick?: boolean }
): void {
  if (!serverData) return;
  const today = getTodayDateString();
  const key = `${SPONSOR_STORAGE_KEY}_${userEmail ? userEmail.toLowerCase().trim() : "guest"}`;
  try {
    const updated: AdWatchLog = {
      date: today,
      count: typeof serverData.clickedToday === "number" ? serverData.clickedToday : 0,
      totalCreditsEarned: (serverData.clickedToday || 0) * CREDITS_PER_SPONSOR_CLICK,
    };
    localStorage.setItem(key, JSON.stringify(updated));
  } catch (e) {
    console.warn("Failed to sync sponsor click stats from server:", e);
  }
}

export function recordSponsorClick(userEmail?: string): {
  clickedToday: number;
  remainingToday: number;
  creditsEarned: number;
} {
  const today = getTodayDateString();
  const key = `${SPONSOR_STORAGE_KEY}_${userEmail ? userEmail.toLowerCase().trim() : "guest"}`;

  let currentCount = 0;
  let totalEarned = 0;

  try {
    const raw = localStorage.getItem(key);
    if (raw) {
      const data: AdWatchLog = JSON.parse(raw);
      if (data.date === today) {
        currentCount = data.count || 0;
        totalEarned = data.totalCreditsEarned || 0;
      }
    }
  } catch (e) {
    // ignore
  }

  currentCount += 1;
  totalEarned += CREDITS_PER_SPONSOR_CLICK;

  try {
    const updated: AdWatchLog = {
      date: today,
      count: currentCount,
      totalCreditsEarned: totalEarned,
    };
    localStorage.setItem(key, JSON.stringify(updated));
  } catch (e) {
    console.warn("Failed to persist sponsor click log:", e);
  }

  return {
    clickedToday: currentCount,
    remainingToday: Math.max(0, SPONSOR_CLICK_LIMIT_PER_DAY - currentCount),
    creditsEarned: CREDITS_PER_SPONSOR_CLICK,
  };
}

export function getCombinedDailyFreeEarned(userEmail?: string): {
  totalCreditsEarnedToday: number;
  totalRemainingPotentialToday: number;
  maxDailyPotential: number;
} {
  const adStats = getTodayRewardedAdStats(userEmail);
  const clickStats = getTodaySponsorClickStats(userEmail);

  const earned =
    adStats.watchedToday * CREDITS_PER_REWARDED_AD +
    clickStats.clickedToday * CREDITS_PER_SPONSOR_CLICK;

  const remaining =
    adStats.remainingToday * CREDITS_PER_REWARDED_AD +
    clickStats.remainingToday * CREDITS_PER_SPONSOR_CLICK;

  return {
    totalCreditsEarnedToday: earned,
    totalRemainingPotentialToday: remaining,
    maxDailyPotential: MAX_DAILY_FREE_CREDITS,
  };
}
