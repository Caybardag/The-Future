import { getAccountByEmail, saveAccount } from "./userAccounts";
import { CreditDisputeRecord, getDisputeLogs } from "./creditDisputes";

export interface AutoHealingCreditParams {
  userEmail: string;
  featureKey: string;
  featureName: string;
  deductedCredits: number;
  errorMessage: string;
  httpStatus?: number | string;
  isTimeout?: boolean;
  payload?: any;
  refundNote?: string;
  onRefundCredits?: (amount: number) => void;
}

export interface AutoHealingResult {
  healed: boolean;
  refundedCredits: number;
  disputeId: string;
  refundNote: string;
  timestamp: string;
}

const DISPUTES_STORAGE_KEY = "future_timeline_dispute_logs";
const AUDIT_STORAGE_KEY = "future_timeline_audit_logs";

/**
 * Auto-Healing Credit Engine
 * Automatically refunds user credits upon non-200 HTTP responses, timeouts, or API failures,
 * and records the event with "Sistem Kaynaklı İade" in dispute and admin audit logs.
 */
export function autoHealingCredit(params: AutoHealingCreditParams): AutoHealingResult {
  const now = new Date();
  const nowIso = now.toISOString();
  const disputeId = "HEAL-" + Date.now();

  const isEligible = params.deductedCredits > 0 && Boolean(params.userEmail);
  const statusDetail = params.isTimeout
    ? "Zaman Aşımı (Timeout)"
    : params.httpStatus
    ? `HTTP ${params.httpStatus}`
    : "API İletişim Hatası";

  const standardNote =
    params.refundNote ||
    `Sistem Kaynaklı İade: [${params.featureName}] işleminde ${statusDetail} nedeniyle çıktı üretilemedi. ${params.deductedCredits} kredi kullanıcı bakiyesine otomatik olarak geri yüklendi.`;

  if (!isEligible) {
    return {
      healed: false,
      refundedCredits: 0,
      disputeId,
      refundNote: standardNote,
      timestamp: nowIso,
    };
  }

  // 1. Exact 1-to-1 Credit Restoration (No extra or duplicate bonus)
  if (params.onRefundCredits) {
    try {
      // onRefundCredits (via AuthContext addCredits) already updates React state, localStorage and Firestore
      params.onRefundCredits(params.deductedCredits);
    } catch (cbErr) {
      console.warn("[Auto-Healing] onRefundCredits callback warning:", cbErr);
    }
  } else {
    // 2. Fallback to direct storage update ONLY if no callback was provided
    try {
      const savedAcc = getAccountByEmail(params.userEmail);
      if (savedAcc) {
        const currentCredits = savedAcc.credits ?? 0;
        const updatedAcc = {
          ...savedAcc,
          credits: currentCredits + params.deductedCredits,
        };
        saveAccount(updatedAcc);
      }
    } catch (storageErr) {
      console.warn("[Auto-Healing] Account storage update warning:", storageErr);
    }
  }

  // 3. Register Dispute Log as "auto_refunded" with 'Sistem Kaynaklı İade'
  const newDispute: CreditDisputeRecord = {
    id: disputeId,
    timestamp: nowIso,
    userEmail: params.userEmail,
    featureKey: params.featureKey,
    featureName: params.featureName,
    deductedCredits: params.deductedCredits,
    status: "auto_refunded",
    errorMessage: `[${statusDetail}] ${params.errorMessage}`,
    refundedAt: nowIso,
    refundNote: standardNote,
    payload: params.payload,
  };

  try {
    const currentDisputes = getDisputeLogs();
    const updatedDisputes = [newDispute, ...currentDisputes].slice(0, 200);
    localStorage.setItem(DISPUTES_STORAGE_KEY, JSON.stringify(updatedDisputes));
  } catch (disputeErr) {
    console.warn("[Auto-Healing] Dispute storage error:", disputeErr);
  }

  // 4. Register Admin System Audit Log with action "Sistem Kaynaklı İade"
  try {
    const rawAudit = localStorage.getItem(AUDIT_STORAGE_KEY);
    const auditLogs = rawAudit ? JSON.parse(rawAudit) : [];
    const newAuditLog = {
      id: "AUDIT-" + Date.now(),
      timestamp: nowIso,
      adminEmail: "sistem@otonom-iyilestirme.local",
      action: "Sistem Kaynaklı İade",
      targetUser: params.userEmail,
      status: "success",
      severity: "info",
      ip: "127.0.0.1",
      details: `⚡ Sistem Kaynaklı İade (Auto-Healing): [${params.featureName}] işleminde ${statusDetail} oluştu (${params.errorMessage}). ${params.deductedCredits} Kredi anında iade edildi.`,
    };
    localStorage.setItem(AUDIT_STORAGE_KEY, JSON.stringify([newAuditLog, ...auditLogs].slice(0, 250)));
    window.dispatchEvent(new CustomEvent("future_audit_created", { detail: newAuditLog }));
  } catch (auditErr) {
    console.warn("[Auto-Healing] Audit log error:", auditErr);
  }

  // 5. Dispatch Live Global Window Events
  try {
    window.dispatchEvent(new CustomEvent("future_dispute_created", { detail: newDispute }));
    window.dispatchEvent(
      new CustomEvent("future_credit_healed", {
        detail: {
          userEmail: params.userEmail,
          refundedCredits: params.deductedCredits,
          featureName: params.featureName,
          note: standardNote,
        },
      })
    );
  } catch {}

  return {
    healed: true,
    refundedCredits: params.deductedCredits,
    disputeId,
    refundNote: standardNote,
    timestamp: nowIso,
  };
}

/**
 * Higher-Order Wrapper for Core Query Services & AI Engines
 * Automatically executes the request, verifies HTTP status / timeout,
 * and triggers Auto-Healing if anything fails after credit deduction.
 */
export async function executeWithAutoHealingCredit<T = any>(config: {
  userEmail?: string;
  featureKey: string;
  featureName: string;
  creditCost: number;
  hasFreeQuota?: boolean;
  onDeduct?: (cost: number) => boolean;
  onRefund?: (cost: number) => void;
  onIncrementQuota?: () => void;
  action: () => Promise<{
    success: boolean;
    data?: T;
    error?: string;
    code?: string;
    status?: number;
    [key: string]: any;
  }>;
  payload?: any;
}): Promise<{
  success: boolean;
  data?: T;
  error?: string;
  code?: string;
  wasHealed: boolean;
  healedAmount: number;
  [key: string]: any;
}> {
  let deductedAmount = 0;

  // 1. Credit deduction step
  if (config.creditCost > 0 || !config.hasFreeQuota) {
    if (config.onDeduct) {
      const ok = config.onDeduct(config.creditCost);
      if (!ok) {
        return {
          success: false,
          error: "Yetersiz kredi bakiyesi.",
          wasHealed: false,
          healedAmount: 0,
        };
      }
      deductedAmount = config.creditCost;
    }
  } else if (config.onIncrementQuota) {
    config.onIncrementQuota();
  }

  // 2. Perform API Query
  try {
    const res = await config.action();

    // If API returned 200 / success
    if (res.success && (!res.status || (res.status >= 200 && res.status < 300))) {
      return {
        ...res,
        wasHealed: false,
        healedAmount: 0,
      };
    }

    // Non-200 or failure returned by API
    const isTimeout = res.code === "TIMEOUT" || (res.error || "").toLowerCase().includes("timeout");
    const httpStatus = res.status || (res.code?.startsWith("HTTP_") ? res.code.replace("HTTP_", "") : undefined);
    const errorMsg = res.error || "Bilinmeyen API hatası (200 dışı durum kodu)";

    let wasHealed = false;
    if (deductedAmount > 0 && config.userEmail) {
      autoHealingCredit({
        userEmail: config.userEmail,
        featureKey: config.featureKey,
        featureName: config.featureName,
        deductedCredits: deductedAmount,
        errorMessage: errorMsg,
        httpStatus,
        isTimeout,
        payload: config.payload,
        refundNote: `Sistem Kaynaklı İade: ${config.featureName} sorgusunda ${httpStatus ? 'HTTP ' + httpStatus : 'API hatası'} oluştu. Harcanan ${deductedAmount} kredi anında iade edildi.`,
        onRefundCredits: config.onRefund,
      });
      wasHealed = true;
    }

    return {
      ...res,
      success: false,
      error: errorMsg,
      wasHealed,
      healedAmount: wasHealed ? deductedAmount : 0,
    };
  } catch (caughtErr: any) {
    const isTimeout =
      caughtErr?.name === "AbortError" ||
      (caughtErr?.message || "").toLowerCase().includes("timeout");
    const errorMsg = caughtErr?.message || "Ağ veya sunucu bağlantı hatası";

    let wasHealed = false;
    if (deductedAmount > 0 && config.userEmail) {
      autoHealingCredit({
        userEmail: config.userEmail,
        featureKey: config.featureKey,
        featureName: config.featureName,
        deductedCredits: deductedAmount,
        errorMessage: errorMsg,
        isTimeout,
        payload: config.payload,
        refundNote: `Sistem Kaynaklı İade: ${config.featureName} bağlantı/zaman aşımı hatası nedeniyle ${deductedAmount} kredi iade edildi.`,
        onRefundCredits: config.onRefund,
      });
      wasHealed = true;
    }

    return {
      success: false,
      error: errorMsg,
      code: isTimeout ? "TIMEOUT" : "EXCEPTION",
      wasHealed,
      healedAmount: wasHealed ? deductedAmount : 0,
    };
  }
}
