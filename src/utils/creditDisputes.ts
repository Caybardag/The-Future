import { getAccountByEmail, saveAccount } from "./userAccounts";

export interface CreditDisputeRecord {
  id: string;
  timestamp: string;
  userEmail: string;
  featureKey: string;
  featureName: string;
  deductedCredits: number;
  status: "failed_ai" | "auto_refunded" | "refunded";
  errorMessage: string;
  refundedAt?: string;
  refundNote?: string;
  payload?: any;
}

const DISPUTES_STORAGE_KEY = "future_timeline_dispute_logs";
const AUDIT_STORAGE_KEY = "future_timeline_audit_logs";

/**
 * Get all dispute & auto-refund records
 */
export function getDisputeLogs(): CreditDisputeRecord[] {
  try {
    const raw = localStorage.getItem(DISPUTES_STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

/**
 * Executes an instant automatic refund and logs the failure + refund to Admin logs
 */
export function handleAutoRefundAndLog(params: {
  userEmail: string;
  featureKey: string;
  featureName: string;
  deductedCredits: number;
  errorMessage: string;
  payload?: any;
  onRefundCredits?: (amount: number) => void;
}): CreditDisputeRecord {
  const currentLogs = getDisputeLogs();
  const now = new Date();
  const nowIso = now.toISOString();
  
  const isAutoRefund = params.deductedCredits > 0;

  const newDispute: CreditDisputeRecord = {
    id: "DISP-" + Date.now(),
    timestamp: nowIso,
    userEmail: params.userEmail,
    featureKey: params.featureKey,
    featureName: params.featureName,
    deductedCredits: params.deductedCredits,
    status: isAutoRefund ? "auto_refunded" : "failed_ai",
    errorMessage: params.errorMessage,
    refundedAt: isAutoRefund ? nowIso : undefined,
    refundNote: isAutoRefund
      ? `🛡️ SİSTEM ANLIK OTOMATİK TELAFİSİ: Yapay zeka çıktısı alınamadığı için ${params.deductedCredits} kredi anında kullanıcıya iade edildi.`
      : undefined,
    payload: params.payload,
  };

  // 1. Perform client credit restoration callback
  if (isAutoRefund && params.onRefundCredits) {
    try {
      params.onRefundCredits(params.deductedCredits);
    } catch (e) {
      console.warn("Failed to invoke onRefundCredits:", e);
    }
  }

  // 2. Also directly update local user account registry to guarantee persistent balance restoration
  if (isAutoRefund && params.userEmail) {
    try {
      const savedAcc = getAccountByEmail(params.userEmail);
      if (savedAcc) {
        const updatedAcc = {
          ...savedAcc,
          credits: (savedAcc.credits ?? 0) + params.deductedCredits,
        };
        saveAccount(updatedAcc);
      }
    } catch (accErr) {
      console.warn("Auto-refund registry update warning:", accErr);
    }
  }

  // 3. Persist dispute record
  const updatedDisputes = [newDispute, ...currentLogs].slice(0, 150);
  try {
    localStorage.setItem(DISPUTES_STORAGE_KEY, JSON.stringify(updatedDisputes));
  } catch (e) {
    console.warn("Failed to persist dispute record to localStorage", e);
  }

  // 4. Create an Audit Log entry in Admin System Logs so the admin sees the error and auto-refund
  try {
    const rawAudit = localStorage.getItem(AUDIT_STORAGE_KEY);
    const auditLogs = rawAudit ? JSON.parse(rawAudit) : [];
    const newAuditLog = {
      id: "AUDIT-" + Date.now(),
      timestamp: nowIso,
      adminEmail: "sistem@otonom-guvenlik.local",
      action: "OTOMATİK TELAFİ İADESİ",
      targetUser: params.userEmail,
      status: "success",
      severity: "info",
      ip: "127.0.0.1",
      details: `⚡ OTOMATİK İADE: [${params.featureName}] işleminde hata oluştu (${params.errorMessage}). ${params.deductedCredits} Kredi ${params.userEmail} hesabına anında iade edildi.`,
    };
    localStorage.setItem(AUDIT_STORAGE_KEY, JSON.stringify([newAuditLog, ...auditLogs].slice(0, 200)));
    window.dispatchEvent(new CustomEvent("future_audit_created", { detail: newAuditLog }));
  } catch (auditErr) {
    console.warn("Auto-refund audit log error:", auditErr);
  }

  // 5. Dispatch live window event for Admin panel real-time refresh
  try {
    window.dispatchEvent(new CustomEvent("future_dispute_created", { detail: newDispute }));
  } catch {}

  return newDispute;
}

/**
 * Legacy record failed query dispute
 */
export function recordFailedQueryDispute(entry: Omit<CreditDisputeRecord, "id" | "timestamp" | "status"> & { id?: string }): CreditDisputeRecord {
  return handleAutoRefundAndLog({
    userEmail: entry.userEmail,
    featureKey: entry.featureKey,
    featureName: entry.featureName,
    deductedCredits: entry.deductedCredits,
    errorMessage: entry.errorMessage,
    payload: entry.payload,
  });
}

/**
 * Mark a dispute as refunded and update storage
 */
export function markDisputeRefunded(disputeId: string, note?: string): boolean {
  const currentLogs = getDisputeLogs();
  let found = false;

  const updated = currentLogs.map((log) => {
    if (log.id === disputeId) {
      found = true;
      return {
        ...log,
        status: "refunded" as const,
        refundedAt: new Date().toISOString(),
        refundNote: note || "Admin tarafından manuel telafi iadesi yapıldı.",
      };
    }
    return log;
  });

  if (found) {
    try {
      localStorage.setItem(DISPUTES_STORAGE_KEY, JSON.stringify(updated));
      window.dispatchEvent(new CustomEvent("future_dispute_created", { detail: { id: disputeId } }));
    } catch {}
  }

  return found;
}
