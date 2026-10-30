export type UserPlan = "free" | "pro" | "quantum_vip";

export const VIEW_PLAN_RULES: Record<string, UserPlan> = {
  default: "free",
};

export function getPlanDisplayName(plan: UserPlan = "free"): string {
  if (plan === "quantum_vip") return "Quantum VIP";
  if (plan === "pro") return "Pro";
  return "Free";
}

export function hasPlanAccess(userPlan: UserPlan = "free", requiredPlan: UserPlan = "free"): boolean {
  // Pure credit model: all features accessible, usage is credit-metered
  return true;
}
