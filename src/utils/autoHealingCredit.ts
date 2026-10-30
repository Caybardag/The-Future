export interface AutoHealingCreditParams {
  userEmail: string;
  featureKey: string;
  featureName: string;
  deductedCredits: number;
  errorMessage: string;
  httpStatus?: string | number;
  isTimeout?: boolean;
  refundNote?: string;
  payload?: any;
  onRefundCredits?: (amount: number) => void;
}

export function autoHealingCredit(params: AutoHealingCreditParams): void {
  const { userEmail, deductedCredits, refundNote, onRefundCredits } = params;
  if (!deductedCredits || deductedCredits <= 0) return;

  console.info(`[AutoHealingCredit] Automatically refunding ${deductedCredits} credits to ${userEmail}. Reason: ${refundNote || params.errorMessage}`);

  if (typeof onRefundCredits === "function") {
    onRefundCredits(deductedCredits);
  }

  try {
    const raw = localStorage.getItem("future_timeline_user");
    if (raw) {
      const user = JSON.parse(raw);
      if (user && user.email === userEmail) {
        user.credits = (user.credits || 0) + deductedCredits;
        localStorage.setItem("future_timeline_user", JSON.stringify(user));
      }
    }
  } catch (e) {
    console.warn("[AutoHealingCredit] LocalStorage refund update error:", e);
  }
}
