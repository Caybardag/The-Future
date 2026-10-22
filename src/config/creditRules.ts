/**
 * CENTRALIZED AUTHORITATIVE CREDIT & REWARD RULES
 * Single Source-of-Truth for both Frontend and Backend
 */

export type UserPlan = "free" | "pro" | "quantum_vip";

export const SIGNUP_BONUS_CREDITS = 75;

export const PLAN_MULTIPLIERS: Record<UserPlan, number> = {
  free: 1.0,
  pro: 0.5,
  quantum_vip: 0.25,
};

export const REWARD_CONFIG = {
  SPIN_WHEEL: {
    minCredits: 1,
    maxCredits: 50,
    dailyLimit: 1,
  },
  REWARDED_AD: {
    rewardCredits: 10,
    dailyLimit: 5,
    cooldownMs: 60 * 1000,
  },
  SPONSOR_CLICK: {
    rewardCredits: 3,
    dailyLimit: 5,
    cooldownMs: 10 * 1000,
  },
  COMMUNITY_SUBMISSION: {
    cost: 0,
    rewardCredits: 0, // KESİNLİKLE 0: Gemini onayına bağlı otomatik kredi üretimi YOKTUR
  },
};

import {
  CANONICAL_FEATURE_BASE_COSTS,
  CANONICAL_ROUTE_CREDIT_COSTS,
} from "../utils/creditCosts";

/**
 * Base Costs for All Features (Free tier nominal price) - Single Source of Truth
 */
export const FEATURE_BASE_COSTS: Record<string, number> = {
  ...CANONICAL_FEATURE_BASE_COSTS,
  proof_audit: CANONICAL_FEATURE_BASE_COSTS.proof_audit,
  algorithmic_audit: CANONICAL_FEATURE_BASE_COSTS.proof_audit,
};

/**
 * Endpoint to Feature mapping for server-side authorization and reservation
 */
export const ROUTE_TO_FEATURE_MAP: Record<string, { feature: string; baseCost: number }> = Object.fromEntries(
  Object.entries(CANONICAL_ROUTE_CREDIT_COSTS).map(([route, val]) => [
    route,
    { feature: val.feature, baseCost: val.cost },
  ])
);

/**
 * Free daily quotas per plan
 */
export const PLAN_DAILY_FREE_QUOTAS: Record<string, Record<UserPlan, number>> = {
  job_risk_analysis: { free: 0, pro: 2, quantum_vip: 5 },
  butterfly_effect: { free: 0, pro: 1, quantum_vip: 2 },
  persona_chat: { free: 0, pro: 5, quantum_vip: 20 },
  personal_roadmap: { free: 0, pro: 1, quantum_vip: 3 },
  evidence_verification: { free: 0, pro: 3, quantum_vip: 10 },
  ai_simulation: { free: 0, pro: 2, quantum_vip: 5 },
  career_advisor: { free: 0, pro: 1, quantum_vip: 3 },
};

/**
 * Calculates effective cost based on user plan (Free: 1.0, Pro: 0.5, VIP: 0.25)
 * Minimum cost for non-zero features is always 1 credit.
 */
export function calculateEffectiveCost(baseCost: number, plan: UserPlan = "free"): number {
  if (baseCost <= 0) return 0;
  const multiplier = PLAN_MULTIPLIERS[plan] ?? 1.0;
  return Math.max(1, Math.ceil(baseCost * multiplier));
}

/**
 * Returns the effective cost for a specific feature key and plan
 */
export function getFeatureCost(featureKey: string, plan: UserPlan = "free"): number {
  const base = FEATURE_BASE_COSTS[featureKey] ?? 10;
  return calculateEffectiveCost(base, plan);
}
