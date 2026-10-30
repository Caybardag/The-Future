export type UserPlan = "free" | "pro" | "quantum_vip";

export const PLAN_DAILY_FREE_QUOTAS: Record<UserPlan, number> = {
  free: 10,
  pro: 50,
  quantum_vip: 200,
};

export const REWARD_CONFIG = {
  dailySpin: { min: 10, max: 50 },
  adReward: 15,
  sponsorClick: 5,
};

export function calculateEffectiveCost(baseCost: number, plan: UserPlan = "free"): number {
  if (plan === "quantum_vip") return Math.max(0, Math.floor(baseCost * 0.5));
  if (plan === "pro") return Math.max(0, Math.floor(baseCost * 0.8));
  return baseCost;
}
