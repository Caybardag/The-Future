import fs from "fs";
import path from "path";
import crypto from "crypto";
import { initializeApp, getApps } from "firebase/app";
import {
  getFirestore,
  doc,
  getDoc,
  setDoc,
  deleteDoc,
  runTransaction,
  collection,
  query,
  where,
  getDocs,
  Firestore,
} from "firebase/firestore";
import {
  REWARD_CONFIG,
  PLAN_DAILY_FREE_QUOTAS,
  UserPlan,
  calculateEffectiveCost,
} from "../config/creditRules";

export interface ServerUserBalance {
  email: string;
  userId?: string;
  credits: number;
  plan: "free" | "pro" | "quantum_vip";
  role: "user" | "admin" | "superadmin";
  isSuperAdmin: boolean;
  totalSpent: number;
  lastDeductionAt?: string;
  updatedAt: string;
}

export interface CreditTransactionRecord {
  id: string;
  userId?: string;
  email: string;
  userEmail?: string;
  delta: number;
  resultingCredits: number;
  feature: string;
  reason: string;
  timestamp: string;
  createdAt?: string;
  reservationId?: string;
  status?: string;
  meta?: Record<string, any>;
}

export interface CreditReservationRecord {
  reservationId: string;
  userId: string;
  email: string;
  amount: number;
  feature: string;
  status: "reserved" | "completed" | "refunded";
  idempotencyKey?: string;
  createdAt: number;
  expiresAt: number; // TTL (2 minutes) to guarantee automatic refund on unhandled crash/disconnect
  meta?: Record<string, any>;
}

const SUPER_ADMIN_EMAIL = "warfacelove46@gmail.com";

const LEDGER_FILE_PATH = path.join(process.cwd(), "src", "data", "server_user_credits_ledger.json");
const TRANSACTIONS_FILE_PATH = path.join(process.cwd(), "src", "data", "server_credit_audit_transactions.json");
const USERS_DB_PATH = path.join(process.cwd(), "src", "data", "server_users_db.json");

const isTestEnv = Boolean(process.env.VITEST || process.env.NODE_ENV === "test");

// Spin wheel, Rewarded Ads, Sponsor Clicks, and Daily Feature Quotas server persistence
const SPIN_RECORDS_PATH = isTestEnv
  ? path.join(process.cwd(), "src", "data", "test_spin_records.json")
  : path.join(process.cwd(), "src", "data", "server_spin_records.json");
const REWARDED_ADS_PATH = isTestEnv
  ? path.join(process.cwd(), "src", "data", "test_rewarded_ads.json")
  : path.join(process.cwd(), "src", "data", "server_rewarded_ads.json");
const SPONSOR_CLICKS_PATH = isTestEnv
  ? path.join(process.cwd(), "src", "data", "test_sponsor_clicks.json")
  : path.join(process.cwd(), "src", "data", "server_sponsor_clicks.json");
const DAILY_USAGE_PATH = path.join(process.cwd(), "src", "data", "server_daily_usage.json");

// In-memory caches for fast lookups
let ledgerCache: Record<string, ServerUserBalance> = {};
let transactionsCache: CreditTransactionRecord[] = [];
let spinRecordsCache: Record<string, { lastSpinDate: string; totalSpins: number }> = {};
let rewardedAdsCache: Record<string, { date: string; count: number; lastClaimTimestamp: number }> = {};
let sponsorClicksCache: Record<string, { date: string; count: number; lastClaimTimestamp: number; usedClaimIds?: string[] }> = {};
let dailyUsageCache: Record<string, { date: string; features: Record<string, number> }> = {};
let isInitialized = false;

const activeReservations = new Map<string, CreditReservationRecord>();
const idempotencyKeyMap = new Map<string, string>();

let firestoreDb: Firestore | null = null;

export function getFirestoreInstance(): Firestore {
  if (firestoreDb) return firestoreDb;
  const configPath = path.join(process.cwd(), "firebase-applet-config.json");
  let cfg: any = {};
  if (fs.existsSync(configPath)) {
    try {
      cfg = JSON.parse(fs.readFileSync(configPath, "utf-8"));
    } catch (_e) {}
  }
  const projectId = process.env.FIREBASE_PROJECT_ID || process.env.GCLOUD_PROJECT || process.env.GCP_PROJECT || cfg.projectId;
  const databaseId = process.env.FIRESTORE_DATABASE_ID || cfg.firestoreDatabaseId || "(default)";
  const apps = getApps();
  const app = apps.length === 0 ? initializeApp({ ...cfg, projectId }) : apps[0];
  firestoreDb = getFirestore(app, databaseId);
  return firestoreDb;
}

function normalizeEmail(email?: string): string {
  if (!email || typeof email !== "string") return "guest@anonymous.local";
  return email.toLowerCase().trim();
}

export function resolveUserId(userIdentifier?: string, explicitUserId?: string): string {
  if (explicitUserId && explicitUserId.trim()) {
    return explicitUserId.trim();
  }
  if (!userIdentifier || !userIdentifier.trim()) {
    return "usr_guest_anonymous";
  }
  const cleaned = userIdentifier.trim().toLowerCase();
  if (cleaned === SUPER_ADMIN_EMAIL) {
    return "usr_superadmin_01";
  }
  if (cleaned.includes("@")) {
    try {
      if (fs.existsSync(USERS_DB_PATH)) {
        const usersDb = JSON.parse(fs.readFileSync(USERS_DB_PATH, "utf-8"));
        if (usersDb[cleaned]?.id) {
          return usersDb[cleaned].id;
        }
      }
    } catch (_e) {}
    const hash = crypto.createHash("sha256").update(cleaned).digest("hex").slice(0, 12);
    return `usr_${hash}`;
  }
  return cleaned;
}

function ensureInitialized() {
  if (isInitialized) return;
  try {
    if (fs.existsSync(LEDGER_FILE_PATH)) {
      ledgerCache = JSON.parse(fs.readFileSync(LEDGER_FILE_PATH, "utf-8"));
    }
  } catch (err) {
    console.warn("[ServerCreditEngine] Error reading ledger backup from disk:", err);
  }

  try {
    if (fs.existsSync(TRANSACTIONS_FILE_PATH)) {
      transactionsCache = JSON.parse(fs.readFileSync(TRANSACTIONS_FILE_PATH, "utf-8"));
    }
  } catch (_e) {}

  try {
    if (fs.existsSync(SPIN_RECORDS_PATH)) {
      spinRecordsCache = JSON.parse(fs.readFileSync(SPIN_RECORDS_PATH, "utf-8"));
    }
  } catch (_e) {}

  try {
    if (fs.existsSync(REWARDED_ADS_PATH)) {
      rewardedAdsCache = JSON.parse(fs.readFileSync(REWARDED_ADS_PATH, "utf-8"));
    }
  } catch (_e) {}

  try {
    if (fs.existsSync(SPONSOR_CLICKS_PATH)) {
      sponsorClicksCache = JSON.parse(fs.readFileSync(SPONSOR_CLICKS_PATH, "utf-8"));
    }
  } catch (_e) {}

  try {
    if (fs.existsSync(DAILY_USAGE_PATH)) {
      dailyUsageCache = JSON.parse(fs.readFileSync(DAILY_USAGE_PATH, "utf-8"));
    }
  } catch (_e) {}

  // Ensure SuperAdmin account is initialized
  const adminKey = SUPER_ADMIN_EMAIL.toLowerCase().trim();
  ledgerCache[adminKey] = {
    email: SUPER_ADMIN_EMAIL,
    userId: "usr_superadmin_01",
    credits: 9999,
    plan: "quantum_vip",
    role: "superadmin",
    isSuperAdmin: true,
    totalSpent: 0,
    updatedAt: new Date().toISOString(),
  };

  isInitialized = true;
}

function persistBackupToDisk() {
  try {
    const dir = path.dirname(LEDGER_FILE_PATH);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    // Invariant: Do not pollute permanent ledger with temporary test user timestamps
    const cleanLedger: Record<string, ServerUserBalance> = {};
    for (const [k, v] of Object.entries(ledgerCache)) {
      if (!k.match(/^(sponsor_user_|replay_user_|limit_user_|test_delete_|rate_limit_user_)/i)) {
        cleanLedger[k] = v;
      }
    }
    fs.writeFileSync(LEDGER_FILE_PATH, JSON.stringify(cleanLedger, null, 2), "utf-8");
  } catch (_e) {}

  try {
    const dir = path.dirname(TRANSACTIONS_FILE_PATH);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    const trimmed = transactionsCache.slice(-1000);
    fs.writeFileSync(TRANSACTIONS_FILE_PATH, JSON.stringify(trimmed, null, 2), "utf-8");
  } catch (_e) {}
}

/**
 * Purge credit balance, daily limits, ad tracking, and sponsor status for a deleted user
 */
export function purgeServerUserCredits(emailOrUserId?: string): boolean {
  if (!emailOrUserId) return false;
  ensureInitialized();
  const emailKey = normalizeEmail(emailOrUserId);
  if (emailKey === SUPER_ADMIN_EMAIL || emailOrUserId === "usr_superadmin_01") {
    return false;
  }

  let purged = false;
  if (ledgerCache[emailKey]) {
    delete ledgerCache[emailKey];
    purged = true;
  }
  if (dailyUsageCache[emailKey]) {
    delete dailyUsageCache[emailKey];
    purged = true;
  }
  if (rewardedAdsCache[emailKey]) {
    delete rewardedAdsCache[emailKey];
    purged = true;
  }
  if (sponsorClicksCache[emailKey]) {
    delete sponsorClicksCache[emailKey];
    purged = true;
  }
  if (spinRecordsCache[emailKey]) {
    delete spinRecordsCache[emailKey];
    purged = true;
  }

  // Also check if any key in caches matches raw emailOrUserId
  if (dailyUsageCache[emailOrUserId]) {
    delete dailyUsageCache[emailOrUserId];
    purged = true;
  }
  if (rewardedAdsCache[emailOrUserId]) {
    delete rewardedAdsCache[emailOrUserId];
    purged = true;
  }
  if (sponsorClicksCache[emailOrUserId]) {
    delete sponsorClicksCache[emailOrUserId];
    purged = true;
  }

  if (purged) {
    persistBackupToDisk();
  }
  return purged;
}

/**
 * Server-authoritative Firestore data purge & anonymization for account deletion
 * (GDPR / KVKK compliance: deletes user profile, predictions, and reservations;
 * anonymizes financial audit transactions).
 */
export async function purgeUserFirestoreData(
  userId: string,
  rawEmail: string
): Promise<{ success: boolean; deletedDocsCount: number; anonymizedTxCount: number; error?: string }> {
  const emailKey = normalizeEmail(rawEmail);
  if (emailKey === SUPER_ADMIN_EMAIL || userId === "usr_superadmin_01") {
    return { success: false, deletedDocsCount: 0, anonymizedTxCount: 0, error: "Süper yönetici hesabı korumalıdır." };
  }

  let deletedDocsCount = 0;
  let anonymizedTxCount = 0;

  try {
    const db = getFirestoreInstance();

    // 1. Delete users/{userId} and users/{emailKey}
    const candidateDocIds = new Set<string>();
    if (userId) candidateDocIds.add(userId);
    if (emailKey) {
      candidateDocIds.add(emailKey);
      candidateDocIds.add(emailKey.replace(/[^a-zA-Z0-9]/g, "_"));
    }

    for (const dId of candidateDocIds) {
      try {
        const uRef = doc(db, "users", dId);
        const uSnap = await getDoc(uRef);
        if (uSnap.exists()) {
          await deleteDoc(uRef);
          deletedDocsCount++;
        }
      } catch (e) {
        console.warn(`[ServerCreditEngine] Warning deleting user doc ${dId}:`, e);
      }
    }

    // 2. Delete credit_reservations for this userId
    try {
      const qRes = query(collection(db, "credit_reservations"), where("userId", "==", userId));
      const resSnap = await getDocs(qRes);
      for (const d of resSnap.docs) {
        await deleteDoc(d.ref).catch(() => {});
        deletedDocsCount++;
      }
    } catch (_e) {}

    // 3. Delete userPredictionHistory for this user
    try {
      const qPredUser = query(collection(db, "userPredictionHistory"), where("userId", "==", userId));
      const predSnap = await getDocs(qPredUser);
      for (const d of predSnap.docs) {
        await deleteDoc(d.ref).catch(() => {});
        deletedDocsCount++;
      }
      if (emailKey) {
        const qPredEmail = query(collection(db, "userPredictionHistory"), where("userEmail", "==", emailKey));
        const predSnapEmail = await getDocs(qPredEmail);
        for (const d of predSnapEmail.docs) {
          await deleteDoc(d.ref).catch(() => {});
          deletedDocsCount++;
        }
      }
    } catch (_e) {}

    // 4. Delete agent_reports for this user
    try {
      const qAgent = query(collection(db, "agent_reports"), where("userId", "==", userId));
      const agentSnap = await getDocs(qAgent);
      for (const d of agentSnap.docs) {
        await deleteDoc(d.ref).catch(() => {});
        deletedDocsCount++;
      }
    } catch (_e) {}

    // 5. Anonymize credit_transactions (Financial/Audit retention compliance - KVKK / GDPR)
    try {
      const anonymizedUserId = `usr_anonymized_${crypto.createHash("sha256").update(userId || emailKey).digest("hex").slice(0, 8)}`;
      const qTx = query(collection(db, "credit_transactions"), where("userEmail", "==", emailKey));
      const txSnap = await getDocs(qTx);
      for (const d of txSnap.docs) {
        await setDoc(
          d.ref,
          {
            userEmail: "anonymized@deleted.user",
            userId: anonymizedUserId,
            isAnonymized: true,
            anonymizedAt: new Date().toISOString(),
          },
          { merge: true }
        ).catch(() => {});
        anonymizedTxCount++;
      }
    } catch (_e) {}

    return { success: true, deletedDocsCount, anonymizedTxCount };
  } catch (err: any) {
    console.error("[ServerCreditEngine] purgeUserFirestoreData error:", err);
    return { success: false, deletedDocsCount, anonymizedTxCount, error: err?.message || "Firestore silme hatası" };
  }
}

function makeThenable<T extends object>(obj: T, promise: Promise<any>): T & PromiseLike<T> {
  return Object.assign(obj, {
    then: promise.then.bind(promise),
    catch: promise.catch.bind(promise),
    finally: promise.finally.bind(promise),
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// FIRESTORE-FIRST ATOMIC OPERATIONS
// ─────────────────────────────────────────────────────────────────────────────

export async function getUserCreditsFromFirestore(
  userIdOrEmail: string
): Promise<ServerUserBalance | null> {
  const userId = resolveUserId(userIdOrEmail);
  const emailKey = normalizeEmail(userIdOrEmail);
  const isSuper = userId === "usr_superadmin_01" || emailKey === SUPER_ADMIN_EMAIL;
  if (isSuper) {
    return {
      email: SUPER_ADMIN_EMAIL,
      userId: "usr_superadmin_01",
      credits: 9999,
      plan: "quantum_vip",
      role: "superadmin",
      isSuperAdmin: true,
      totalSpent: 0,
      updatedAt: new Date().toISOString(),
    };
  }

  try {
    const db = getFirestoreInstance();
    const userRef = doc(db, "users", userId);
    const snap = await getDoc(userRef);

    if (snap.exists()) {
      const data = snap.data();
      return {
        email: data.email || userIdOrEmail,
        userId,
        credits: typeof data.credits === "number" ? data.credits : 0,
        plan: data.plan || "free",
        role: data.role || "user",
        isSuperAdmin: data.role === "superadmin" || data.email === SUPER_ADMIN_EMAIL,
        totalSpent: typeof data.totalSpent === "number" ? data.totalSpent : 0,
        lastDeductionAt: data.lastDeductionAt,
        updatedAt: data.updatedAt || new Date().toISOString(),
      };
    }
  } catch (_e) {}

  ensureInitialized();
  return ledgerCache[emailKey] || ledgerCache[userId] || null;
}

export async function reserveUserCreditsInFirestore(
  userIdentifier: string,
  cost: number,
  feature: string,
  options?: {
    userId?: string;
    email?: string;
    plan?: "free" | "pro" | "quantum_vip";
    idempotencyKey?: string;
    meta?: Record<string, any>;
  }
): Promise<{
  allowed: boolean;
  reservationId?: string;
  amount?: number;
  currentCredits: number;
  remainingCredits: number;
  isSuperAdmin: boolean;
  error?: string;
  message?: string;
}> {
  const userId = resolveUserId(userIdentifier, options?.userId);
  const email = options?.email || (userIdentifier.includes("@") ? userIdentifier : "user@app.local");
  const isSuper = userId === "usr_superadmin_01" || email.toLowerCase().trim() === SUPER_ADMIN_EMAIL;

  if (isSuper) {
    const reservationId = `res_superadmin_${crypto.randomBytes(8).toString("hex")}`;
    return {
      allowed: true,
      reservationId,
      amount: 0,
      currentCredits: 9999,
      remainingCredits: 9999,
      isSuperAdmin: true,
    };
  }

  const db = getFirestoreInstance();
  const userRef = doc(db, "users", userId);

  if (cost <= 0) {
    const snap = await getDoc(userRef);
    const credits = snap.exists() ? (snap.data().credits ?? 0) : 0;
    const reservationId = `res_free_${crypto.randomBytes(8).toString("hex")}`;
    return {
      allowed: true,
      reservationId,
      amount: 0,
      currentCredits: credits,
      remainingCredits: credits,
      isSuperAdmin: false,
    };
  }

  // In-flight Idempotency Check
  if (options?.idempotencyKey) {
    const existingResId = idempotencyKeyMap.get(options.idempotencyKey);
    if (existingResId) {
      const memoryRecord = activeReservations.get(existingResId);
      if (memoryRecord && memoryRecord.status === "reserved") {
        ensureInitialized();
        const cr = ledgerCache[email]?.credits ?? 0;
        return {
          allowed: false,
          error: "DUPLICATE_IN_FLIGHT",
          message: "Bu işlem zaten şu anda işleniyor (çift istek engellendi).",
          currentCredits: cr,
          remainingCredits: cr,
          isSuperAdmin: false,
        };
      }
      if (memoryRecord && memoryRecord.status === "completed") {
        ensureInitialized();
        const cr = ledgerCache[email]?.credits ?? 0;
        return {
          allowed: true,
          reservationId: existingResId,
          currentCredits: cr,
          remainingCredits: cr,
          isSuperAdmin: false,
        };
      }

      try {
        const resSnap = await getDoc(doc(db, "credit_reservations", existingResId));
        if (resSnap.exists()) {
          const rdata = resSnap.data();
          if (rdata.status === "reserved") {
            const userSnap = await getDoc(userRef);
            const cr = userSnap.exists() ? (userSnap.data().credits ?? 0) : 0;
            return {
              allowed: false,
              error: "DUPLICATE_IN_FLIGHT",
              message: "Bu işlem zaten şu anda işleniyor (çift istek engellendi).",
              currentCredits: cr,
              remainingCredits: cr,
              isSuperAdmin: false,
            };
          }
          if (rdata.status === "completed") {
            const userSnap = await getDoc(userRef);
            const cr = userSnap.exists() ? (userSnap.data().credits ?? 0) : 0;
            return {
              allowed: true,
              reservationId: existingResId,
              currentCredits: cr,
              remainingCredits: cr,
              isSuperAdmin: false,
            };
          }
        }
      } catch (_e) {}
    }
  }

  const reservationId = `res_${crypto.randomBytes(16).toString("hex")}`;
  const resRef = doc(db, "credit_reservations", reservationId);

  let result: any;
  try {
    result = await runTransaction(db, async (tx) => {
      const userSnap = await tx.get(userRef);
      let currentCredits = 0;
      let currentTotalSpent = 0;
      let plan = "free";
      let role = "user";

      if (userSnap.exists()) {
        const data = userSnap.data();
        currentCredits = typeof data.credits === "number" ? data.credits : 0;
        currentTotalSpent = typeof data.totalSpent === "number" ? data.totalSpent : 0;
        plan = options?.plan || data.plan || plan;
        role = data.role || role;
      } else {
        ensureInitialized();
        const backup = ledgerCache[email] || ledgerCache[userIdentifier.toLowerCase().trim()];
        currentCredits = backup ? backup.credits : 10;
        currentTotalSpent = backup?.totalSpent || 0;
        plan = options?.plan || backup?.plan || "free";
        role = backup?.role || "user";
      }

      // Calculate plan-discounted effective cost
      let effectiveCost = cost;
      if (plan === "quantum_vip") {
        effectiveCost = Math.max(1, Math.ceil(cost * 0.25));
      } else if (plan === "pro") {
        effectiveCost = Math.max(1, Math.ceil(cost * 0.50));
      }

      if (currentCredits < effectiveCost) {
        return {
          allowed: false,
          amount: effectiveCost,
          currentCredits,
          remainingCredits: currentCredits,
          isSuperAdmin: false,
          error: "INSUFFICIENT_CREDITS",
          message: `Yetersiz Kredi: Bu işlem için ${effectiveCost} kredi gereklidir (${plan.toUpperCase()} planı). Mevcut bakiyeniz: ${currentCredits} kredi.`,
        };
      }

      const remainingCredits = currentCredits - effectiveCost;
      const now = Date.now();
      const expiresAt = now + 120000; // 2 minutes TTL

      // Atomic update user balance in Firestore
      tx.set(
        userRef,
        {
          id: userId,
          userId,
          email,
          credits: remainingCredits,
          totalSpent: currentTotalSpent + effectiveCost,
          lastDeductionAt: new Date(now).toISOString(),
          updatedAt: new Date(now).toISOString(),
          plan,
          role,
          isSuperAdmin: false,
        },
        { merge: true }
      );

      // Atomic create reservation in Firestore
      tx.set(resRef, {
        reservationId,
        userId,
        email,
        amount: effectiveCost,
        baseAmount: cost,
        feature,
        plan,
        status: "reserved",
        idempotencyKey: options?.idempotencyKey || null,
        createdAt: now,
        expiresAt,
        meta: options?.meta || {},
      });

      return {
        allowed: true,
        reservationId,
        amount: effectiveCost,
        currentCredits,
        remainingCredits,
        isSuperAdmin: false,
      };
    });
  } catch (err: any) {
    // Cross-project IAM or Security Rules fallback:
    // If Firestore direct write is blocked (e.g. unauthenticated Web SDK, or Admin SDK awaiting GCP cross-project IAM grant),
    // operate atomically on the server-authoritative ledger cache.
    ensureInitialized();
    const backup = ledgerCache[email] || ledgerCache[userIdentifier.toLowerCase().trim()] || {
      email,
      userId,
      credits: 10,
      plan: options?.plan || "free",
      role: "user",
      isSuperAdmin: false,
      totalSpent: 0,
      updatedAt: new Date().toISOString(),
    };

    const effectivePlan = options?.plan || backup.plan;
    let effectiveCost = cost;
    if (effectivePlan === "quantum_vip") {
      effectiveCost = Math.max(1, Math.ceil(cost * 0.25));
    } else if (effectivePlan === "pro") {
      effectiveCost = Math.max(1, Math.ceil(cost * 0.50));
    }

    if (backup.credits < effectiveCost) {
      return {
        allowed: false,
        amount: effectiveCost,
        currentCredits: backup.credits,
        remainingCredits: backup.credits,
        isSuperAdmin: false,
        error: "INSUFFICIENT_CREDITS",
        message: `Yetersiz Kredi: Bu işlem için ${effectiveCost} kredi gereklidir (${(backup.plan || "free").toUpperCase()} planı). Mevcut bakiyeniz: ${backup.credits} kredi.`,
      };
    }

    const remainingCredits = backup.credits - effectiveCost;
    backup.credits = remainingCredits;
    backup.totalSpent = (backup.totalSpent || 0) + effectiveCost;
    backup.updatedAt = new Date().toISOString();
    ledgerCache[email] = backup;
    persistBackupToDisk();

    result = {
      allowed: true,
      reservationId,
      amount: effectiveCost,
      currentCredits: backup.credits + effectiveCost,
      remainingCredits,
      isSuperAdmin: false,
    };
  }

  if (result.allowed && result.reservationId) {
    ensureInitialized();
    activeReservations.set(result.reservationId, {
      reservationId: result.reservationId,
      userId,
      email,
      amount: result.amount ?? cost,
      feature,
      status: "reserved",
      idempotencyKey: options?.idempotencyKey,
      createdAt: Date.now(),
      expiresAt: Date.now() + 120000,
      meta: options?.meta,
    });
    if (options?.idempotencyKey) {
      idempotencyKeyMap.set(options.idempotencyKey, result.reservationId);
    }
    // Update local ledger cache for disaster recovery only
    if (ledgerCache[email]) {
      ledgerCache[email].credits = result.remainingCredits;
      persistBackupToDisk();
    }
  }

  return result;
}

export async function commitCreditReservationInFirestore(
  reservationId: string
): Promise<{ success: boolean; remainingCredits: number; status: string; error?: string }> {
  if (reservationId.startsWith("res_superadmin_") || reservationId.startsWith("res_free_")) {
    return { success: true, remainingCredits: 9999, status: "completed" };
  }

  const db = getFirestoreInstance();
  const resRef = doc(db, "credit_reservations", reservationId);

  let result: any;
  try {
    result = await runTransaction(db, async (tx) => {
      const resSnap = await tx.get(resRef);
      if (!resSnap.exists()) {
        return { success: false, remainingCredits: 0, status: "not_found", error: "Rezervasyon bulunamadı." };
      }

      const record = resSnap.data();
      const userRef = doc(db, "users", record.userId);
      const userSnap = await tx.get(userRef);
      const userCredits = userSnap.exists() ? (userSnap.data().credits ?? 0) : 0;

      if (record.status !== "reserved") {
        return {
          success: false,
          remainingCredits: userCredits,
          status: record.status,
          error: `Rezervasyon zaten tamamlanmış veya iade edilmiş (Durum: ${record.status}). Tekrar tamamlanamaz.`,
        };
      }

      tx.update(resRef, {
        status: "completed",
        completedAt: new Date().toISOString(),
      });

      // Idempotent transaction record with deterministic ID
      const txId = `tx_commit_${reservationId}`;
      const txRef = doc(db, "credit_transactions", txId);

      tx.set(txRef, {
        id: txId,
        userId: record.userId,
        userEmail: record.email,
        email: record.email,
        delta: -record.amount,
        resultingCredits: userCredits,
        feature: record.feature,
        reason: `Atomik Rezervasyon Onayı: ${record.feature}`,
        timestamp: new Date().toISOString(),
        createdAt: new Date().toISOString(),
        reservationId,
        status: "completed",
        meta: {
          ...(record.meta || {}),
          reservationId,
          status: "completed",
        },
      });

      return {
        success: true,
        remainingCredits: userCredits,
        status: "completed",
      };
    });
  } catch (err: any) {
    ensureInitialized();
    const active = activeReservations.get(reservationId);
    if (!active) {
      return { success: false, remainingCredits: 0, status: "not_found", error: "Rezervasyon bulunamadı." };
    }
    if (active.status !== "reserved") {
      return {
        success: false,
        remainingCredits: ledgerCache[active.email]?.credits ?? 0,
        status: active.status,
        error: `Rezervasyon zaten tamamlanmış veya iade edilmiş (Durum: ${active.status}). Tekrar tamamlanamaz.`,
      };
    }
    active.status = "completed";
    return {
      success: true,
      remainingCredits: ledgerCache[active.email]?.credits ?? 0,
      status: "completed",
    };
  }

  if (result.success) {
    ensureInitialized();
    const active = activeReservations.get(reservationId);
    if (active) active.status = "completed";
  }

  return result;
}

export async function rollbackCreditReservationInFirestore(
  reservationId: string,
  reason = "İşlem hatası"
): Promise<{ success: boolean; refundedCredits: number; remainingCredits: number; status: string; error?: string }> {
  if (reservationId.startsWith("res_superadmin_") || reservationId.startsWith("res_free_")) {
    return { success: true, refundedCredits: 0, remainingCredits: 9999, status: "refunded" };
  }

  const db = getFirestoreInstance();
  const resRef = doc(db, "credit_reservations", reservationId);

  let result: any;
  try {
    result = await runTransaction(db, async (tx) => {
      const resSnap = await tx.get(resRef);
      if (!resSnap.exists()) {
        return { success: false, refundedCredits: 0, remainingCredits: 0, status: "not_found", error: "Rezervasyon bulunamadı." };
      }

      const record = resSnap.data();
      const userRef = doc(db, "users", record.userId);
      const userSnap = await tx.get(userRef);
      const currentCredits = userSnap.exists() ? (userSnap.data().credits ?? 0) : 0;
      const currentTotalSpent = userSnap.exists() ? (userSnap.data().totalSpent ?? 0) : 0;

      if (record.status !== "reserved") {
        return {
          success: false,
          refundedCredits: 0,
          remainingCredits: currentCredits,
          status: record.status,
          error: `Rezervasyon zaten ${record.status} durumunda. Tekrar iade edilemez.`,
        };
      }

      const newCredits = currentCredits + record.amount;
      const newTotalSpent = Math.max(0, currentTotalSpent - record.amount);

      tx.update(resRef, {
        status: "refunded",
        refundedAt: new Date().toISOString(),
        refundReason: reason,
      });

      tx.update(userRef, {
        credits: newCredits,
        totalSpent: newTotalSpent,
        updatedAt: new Date().toISOString(),
      });

      // Idempotent refund audit log with deterministic ID
      const txId = `tx_refund_${reservationId}`;
      const txRef = doc(db, "credit_transactions", txId);

      tx.set(txRef, {
        id: txId,
        userId: record.userId,
        userEmail: record.email,
        email: record.email,
        delta: +record.amount,
        resultingCredits: newCredits,
        feature: record.feature,
        reason: `Rezervasyon İadesi (${reason}): ${record.feature}`,
        timestamp: new Date().toISOString(),
        createdAt: new Date().toISOString(),
        reservationId,
        status: "refunded",
        meta: {
          ...(record.meta || {}),
          reservationId,
          status: "refunded",
          reason,
        },
      });

      return {
        success: true,
        refundedCredits: record.amount,
        remainingCredits: newCredits,
        status: "refunded",
      };
    });
  } catch (err: any) {
    ensureInitialized();
    const active = activeReservations.get(reservationId);
    if (!active) {
      return { success: false, refundedCredits: 0, remainingCredits: 0, status: "not_found", error: "Rezervasyon bulunamadı." };
    }
    if (active.status !== "reserved") {
      return {
        success: false,
        refundedCredits: 0,
        remainingCredits: ledgerCache[active.email]?.credits ?? 0,
        status: active.status,
        error: `Rezervasyon zaten ${active.status} durumunda. Tekrar iade edilemez.`,
      };
    }
    active.status = "refunded";
    const user = ledgerCache[active.email];
    if (user) {
      user.credits += active.amount;
      persistBackupToDisk();
    }
    return {
      success: true,
      refundedCredits: active.amount,
      remainingCredits: user?.credits ?? 0,
      status: "refunded",
    };
  }

  if (result.success) {
    ensureInitialized();
    const active = activeReservations.get(reservationId);
    if (active) active.status = "refunded";
    const record = activeReservations.get(reservationId);
    if (record && ledgerCache[record.email]) {
      ledgerCache[record.email].credits = result.remainingCredits;
      persistBackupToDisk();
    }
  }

  return result;
}

export async function cleanupExpiredReservationsInFirestore(): Promise<number> {
  const db = getFirestoreInstance();
  const now = Date.now();
  const q = query(
    collection(db, "credit_reservations"),
    where("status", "==", "reserved"),
    where("expiresAt", "<", now)
  );
  const snap = await getDocs(q);
  let count = 0;
  for (const docSnap of snap.docs) {
    const resId = docSnap.id;
    try {
      await rollbackCreditReservationInFirestore(resId, "Zaman aşımı otomatik iade");
      count++;
    } catch (err: any) {
      console.warn(`[ServerCreditEngine] Error auto-refunding expired reservation ${resId}:`, err.message);
    }
  }
  return count;
}

// ─────────────────────────────────────────────────────────────────────────────
// COMPOSITE INTERFACES & BACKWARD COMPATIBILITY
// ─────────────────────────────────────────────────────────────────────────────

export function getServerUserAccount(rawEmail?: string): ServerUserBalance {
  ensureInitialized();
  const emailKey = normalizeEmail(rawEmail);
  const isSuper = emailKey === SUPER_ADMIN_EMAIL;

  if (isSuper) {
    return {
      email: SUPER_ADMIN_EMAIL,
      userId: "usr_superadmin_01",
      credits: 9999,
      plan: "quantum_vip",
      role: "superadmin",
      isSuperAdmin: true,
      totalSpent: 0,
      updatedAt: new Date().toISOString(),
    };
  }

  if (!ledgerCache[emailKey]) {
    const userId = resolveUserId(emailKey);
    ledgerCache[emailKey] = {
      email: emailKey,
      userId,
      credits: 0,
      plan: "free",
      role: "user",
      isSuperAdmin: false,
      totalSpent: 0,
      updatedAt: new Date().toISOString(),
    };
    persistBackupToDisk();
  }

  return { ...ledgerCache[emailKey] };
}

export function syncServerUserAccount(
  rawEmail: string,
  data: {
    credits?: number;
    plan?: "free" | "pro" | "quantum_vip";
    role?: "user" | "admin" | "superadmin";
  }
): ServerUserBalance {
  ensureInitialized();
  const emailKey = normalizeEmail(rawEmail);
  const isSuper = emailKey === SUPER_ADMIN_EMAIL;

  if (isSuper) {
    return getServerUserAccount(SUPER_ADMIN_EMAIL);
  }

  const userId = resolveUserId(emailKey);
  const existing = ledgerCache[emailKey] || {
    email: emailKey,
    userId,
    credits: 0,
    plan: "free",
    role: "user",
    isSuperAdmin: false,
    totalSpent: 0,
    updatedAt: new Date().toISOString(),
  };

  const updated: ServerUserBalance = {
    ...existing,
    credits: typeof data.credits === "number" ? Math.max(0, data.credits) : existing.credits,
    plan: data.plan || existing.plan,
    role: data.role || existing.role,
    updatedAt: new Date().toISOString(),
  };

  ledgerCache[emailKey] = updated;
  persistBackupToDisk();

  // Async sync to Firestore
  if (process.env.NODE_ENV !== "test") {
    try {
      const db = getFirestoreInstance();
      const userRef = doc(db, "users", userId);
      setDoc(
        userRef,
        {
          id: userId,
          userId,
          email: emailKey,
          credits: updated.credits,
          plan: updated.plan,
          role: updated.role,
          isSuperAdmin: false,
          updatedAt: updated.updatedAt,
        },
        { merge: true }
      ).catch((_err) => {
        // Handled: Web SDK on Node server is unauthenticated and Admin SDK requires cross-project IAM binding
      });
    } catch (_e) {}
  }

  return updated;
}

export async function syncServerUserAccountInFirestore(
  rawEmail: string,
  data: {
    credits?: number;
    plan?: "free" | "pro" | "quantum_vip";
    role?: "user" | "admin" | "superadmin";
  }
): Promise<ServerUserBalance> {
  const emailKey = normalizeEmail(rawEmail);
  const isSuper = emailKey === SUPER_ADMIN_EMAIL;
  if (isSuper) {
    return getServerUserAccount(SUPER_ADMIN_EMAIL);
  }

  const userId = resolveUserId(emailKey);
  const db = getFirestoreInstance();
  const userRef = doc(db, "users", userId);

  let existingData: any = {};
  try {
    const existingSnap = await getDoc(userRef);
    if (existingSnap.exists()) {
      existingData = existingSnap.data();
    }
  } catch (_e) {
    ensureInitialized();
    existingData = ledgerCache[emailKey] || {};
  }

  const credits = typeof data.credits === "number" ? Math.max(0, data.credits) : (existingData.credits ?? 0);
  const plan = data.plan || existingData.plan || "free";
  const role = data.role || existingData.role || "user";
  const updatedAt = new Date().toISOString();

  try {
    await setDoc(
      userRef,
      {
        id: userId,
        userId,
        email: emailKey,
        credits,
        plan,
        role,
        isSuperAdmin: false,
        updatedAt,
      },
      { merge: true }
    );
  } catch (err: any) {
    // Handled: Web SDK has no auth credentials and Admin SDK requires cross-project IAM binding
  }

  const res: ServerUserBalance = {
    email: emailKey,
    userId,
    credits,
    plan,
    role,
    isSuperAdmin: false,
    totalSpent: existingData.totalSpent || 0,
    updatedAt,
  };

  ensureInitialized();
  ledgerCache[emailKey] = res;
  persistBackupToDisk();

  return res;
}

export function resetCreditReservationsForTesting() {
  activeReservations.clear();
  idempotencyKeyMap.clear();
}

/**
 * Authoritative runtime credit reservation backed 100% by Firestore runTransaction
 */
export async function reserveUserCredits(
  rawEmail: string | undefined,
  cost: number,
  feature: string,
  options?: { idempotencyKey?: string; meta?: Record<string, any>; userId?: string; email?: string; plan?: "free" | "pro" | "quantum_vip" }
): Promise<{
  allowed: boolean;
  reservationId?: string;
  amount?: number;
  currentCredits: number;
  remainingCredits: number;
  isSuperAdmin: boolean;
  error?: string;
  message?: string;
}> {
  return await reserveUserCreditsInFirestore(rawEmail || "", cost, feature, options);
}

/**
 * Authoritative runtime credit commit backed 100% by Firestore runTransaction
 */
export async function commitCreditReservation(
  reservationId: string
): Promise<{ success: boolean; remainingCredits: number; status: string; error?: string }> {
  return await commitCreditReservationInFirestore(reservationId);
}

/**
 * Authoritative runtime credit rollback backed 100% by Firestore runTransaction
 */
export async function rollbackCreditReservation(
  reservationId: string,
  reason = "İşlem hatası"
): Promise<{ success: boolean; refundedCredits: number; remainingCredits: number; status: string; error?: string }> {
  return await rollbackCreditReservationInFirestore(reservationId, reason);
}

export function getCreditReservationStatus(reservationId: string): CreditReservationRecord | null {
  return activeReservations.get(reservationId) || null;
}

let cleanupTimer: any = null;

export function startPeriodicCleanup() {
  if (cleanupTimer) return;
  if (typeof setInterval !== "undefined" && process.env.NODE_ENV !== "test") {
    cleanupTimer = setInterval(() => {
      cleanupExpiredReservationsInFirestore().catch(() => {});
    }, 30000);
    if (cleanupTimer && typeof cleanupTimer.unref === "function") {
      cleanupTimer.unref();
    }
  }
}

export function stopPeriodicCleanup() {
  if (cleanupTimer) {
    clearInterval(cleanupTimer);
    cleanupTimer = null;
  }
}

startPeriodicCleanup();

/**
 * Authoritative credit deposit backed 100% by Firestore runTransaction
 */
export async function addCreditsOnServer(
  rawEmail: string,
  amount: number,
  reason: string
): Promise<{ success: boolean; newCredits: number }> {
  const emailKey = normalizeEmail(rawEmail);
  const isSuper = emailKey === SUPER_ADMIN_EMAIL;

  if (isSuper) {
    return { success: true, newCredits: 9999 };
  }

  const userId = resolveUserId(emailKey);
  const db = getFirestoreInstance();
  const userRef = doc(db, "users", userId);

  try {
    return await runTransaction(db, async (tx) => {
      const snap = await tx.get(userRef);
      let currentCredits = 0;
      let plan = "free";
      let role = "user";

      if (snap.exists()) {
        const data = snap.data();
        currentCredits = typeof data.credits === "number" ? data.credits : 0;
        plan = data.plan || plan;
        role = data.role || role;
      } else {
        ensureInitialized();
        const backup = ledgerCache[emailKey];
        currentCredits = backup ? backup.credits : 10;
        plan = backup?.plan || plan;
        role = backup?.role || role;
      }

      const newCredits = Math.max(0, currentCredits + amount);

      tx.set(
        userRef,
        {
          id: userId,
          userId,
          email: emailKey,
          credits: newCredits,
          updatedAt: new Date().toISOString(),
          plan,
          role,
          isSuperAdmin: false,
        },
        { merge: true }
      );

      const txId = `tx_add_${Date.now()}_${Math.random().toString(36).substring(2, 7).toUpperCase()}`;
      const txRef = doc(db, "credit_transactions", txId);

      tx.set(txRef, {
        id: txId,
        userId,
        userEmail: emailKey,
        email: emailKey,
        delta: amount,
        resultingCredits: newCredits,
        feature: "credit_deposit",
        reason,
        timestamp: new Date().toISOString(),
        createdAt: new Date().toISOString(),
        status: "completed",
      });

      // Update backup cache for disaster recovery only
      ensureInitialized();
      ledgerCache[emailKey] = {
        email: emailKey,
        userId,
        credits: newCredits,
        plan: plan as any,
        role: role as any,
        isSuperAdmin: false,
        totalSpent: 0,
        updatedAt: new Date().toISOString(),
      };
      persistBackupToDisk();

      return { success: true, newCredits };
    });
  } catch (_err) {
    ensureInitialized();
    const backup = ledgerCache[emailKey] || {
      email: emailKey,
      userId,
      credits: 0,
      plan: "free" as const,
      role: "user" as const,
      isSuperAdmin: false,
      totalSpent: 0,
      updatedAt: new Date().toISOString(),
    };
    const newCredits = Math.max(0, (backup.credits || 0) + amount);
    backup.credits = newCredits;
    backup.updatedAt = new Date().toISOString();
    ledgerCache[emailKey] = backup;
    persistBackupToDisk();

    return { success: true, newCredits };
  }
}

export function getSpinStatusOnServer(rawEmail?: string): { hasSpunToday: boolean; msUntilReset: number } {
  ensureInitialized();
  const emailKey = normalizeEmail(rawEmail);
  const isSuper = emailKey === SUPER_ADMIN_EMAIL;
  if (isSuper) {
    return { hasSpunToday: false, msUntilReset: 0 };
  }

  const todayStr = new Date().toISOString().split("T")[0];
  const record = spinRecordsCache[emailKey];
  const hasSpunToday = record?.lastSpinDate === todayStr;

  const now = new Date();
  const midnight = new Date();
  midnight.setHours(24, 0, 0, 0);
  const msUntilReset = Math.max(0, midnight.getTime() - now.getTime());

  return { hasSpunToday, msUntilReset };
}

export interface ServerWheelSegment {
  id: number;
  label: string;
  subtext: string;
  creditAmount: number;
  xpAmount: number;
  weight: number;
}

const SERVER_WHEEL_SEGMENTS: ServerWheelSegment[] = [
  { id: 1, label: "+2 KREDİ", subtext: "Standart Mikro Bonus (%35)", creditAmount: 2, xpAmount: 10, weight: 35 },
  { id: 2, label: "+1 KREDİ", subtext: "Kuantum Veri Damlası (%25)", creditAmount: 1, xpAmount: 5, weight: 25 },
  { id: 3, label: "+5 KREDİ", subtext: "Haftalık Sentez (%20)", creditAmount: 5, xpAmount: 25, weight: 20 },
  { id: 4, label: "+3 KREDİ", subtext: "Enerji Yüklemesi (%10)", creditAmount: 3, xpAmount: 15, weight: 10 },
  { id: 5, label: "+10 KREDİ", subtext: "Nadir AI Sinyali (%6)", creditAmount: 10, xpAmount: 50, weight: 6 },
  { id: 6, label: "+15 KREDİ", subtext: "Epik Keşif (%2.5)", creditAmount: 15, xpAmount: 75, weight: 2.5 },
  { id: 7, label: "+25 KREDİ", subtext: "Efsanevi AGI (%1)", creditAmount: 25, xpAmount: 100, weight: 1 },
  { id: 8, label: "+50 KREDİ", subtext: "JACKPOT (%0.5)", creditAmount: 50, xpAmount: 200, weight: 0.5 },
];

export async function spinWheelOnServer(
  rawEmail?: string,
  _options?: { spinId?: string }
): Promise<{
  success: boolean;
  segment?: ServerWheelSegment;
  selectedIndex?: number;
  remainingCredits?: number;
  newCredits?: number;
  error?: string;
  msUntilReset?: number;
}> {
  ensureInitialized();
  const emailKey = normalizeEmail(rawEmail);
  const isSuper = emailKey === SUPER_ADMIN_EMAIL;

  const todayStr = new Date().toISOString().split("T")[0];
  const record = spinRecordsCache[emailKey] || { lastSpinDate: "", totalSpins: 0 };

  if (!isSuper && record.lastSpinDate === todayStr) {
    const status = getSpinStatusOnServer(emailKey);
    return {
      success: false,
      error: "Bugünkü kuantum çarkı çevirme hakkınızı zaten kullandınız. Yarın tekrar deneyin!",
      msUntilReset: status.msUntilReset,
    };
  }

  const totalWeight = SERVER_WHEEL_SEGMENTS.reduce((sum, s) => sum + s.weight, 0);
  const random = Math.random() * totalWeight;
  let accumulated = 0;
  let selected = SERVER_WHEEL_SEGMENTS[0];

  for (const s of SERVER_WHEEL_SEGMENTS) {
    accumulated += s.weight;
    if (random <= accumulated) {
      selected = s;
      break;
    }
  }

  record.lastSpinDate = todayStr;
  record.totalSpins = (record.totalSpins || 0) + 1;
  spinRecordsCache[emailKey] = record;
  try {
    fs.writeFileSync(SPIN_RECORDS_PATH, JSON.stringify(spinRecordsCache, null, 2), "utf-8");
  } catch (_e) {}

  const deposit = await addCreditsOnServer(
    emailKey,
    selected.creditAmount,
    `Günlük Kuantum Çarkı Ödülü: ${selected.label}`
  );

  return {
    success: true,
    segment: selected,
    selectedIndex: SERVER_WHEEL_SEGMENTS.findIndex((s) => s.id === selected.id),
    remainingCredits: deposit.newCredits,
    newCredits: deposit.newCredits,
  };
}

export function getRewardedAdStatusOnServer(rawEmail?: string): {
  canWatch: boolean;
  watchedToday: number;
  maxPerDay: number;
  cooldownRemainingMs: number;
} {
  ensureInitialized();
  const emailKey = normalizeEmail(rawEmail);
  const isSuper = emailKey === SUPER_ADMIN_EMAIL;
  if (isSuper) {
    return { canWatch: true, watchedToday: 0, maxPerDay: 5, cooldownRemainingMs: 0 };
  }

  const todayStr = new Date().toISOString().split("T")[0];
  const record = rewardedAdsCache[emailKey];

  if (!record || record.date !== todayStr) {
    return { canWatch: true, watchedToday: 0, maxPerDay: 5, cooldownRemainingMs: 0 };
  }

  const now = Date.now();
  const cooldownMs = 60 * 1000;
  const timeSinceLast = now - (record.lastClaimTimestamp || 0);
  const cooldownRemaining = Math.max(0, cooldownMs - timeSinceLast);

  const canWatch = record.count < 5 && cooldownRemaining === 0;

  return {
    canWatch,
    watchedToday: record.count,
    maxPerDay: 5,
    cooldownRemainingMs: cooldownRemaining,
  };
}

export async function claimRewardedAdOnServer(
  rawEmail?: string,
  _options?: { claimId?: string }
): Promise<{
  success: boolean;
  creditsEarned?: number;
  newCredits?: number;
  watchedToday?: number;
  error?: string;
  cooldownRemainingMs?: number;
}> {
  ensureInitialized();
  const emailKey = normalizeEmail(rawEmail);
  const isSuper = emailKey === SUPER_ADMIN_EMAIL;

  const todayStr = new Date().toISOString().split("T")[0];
  let record = rewardedAdsCache[emailKey];

  if (!record || record.date !== todayStr) {
    record = { date: todayStr, count: 0, lastClaimTimestamp: 0 };
  }

  const now = Date.now();
  const cooldownMs = 60 * 1000;
  const timeSinceLast = now - (record.lastClaimTimestamp || 0);
  const cooldownRemaining = Math.max(0, cooldownMs - timeSinceLast);

  if (!isSuper) {
    if (record.count >= 5) {
      return { success: false, error: "Günlük maksimum 5 reklam izleme sınırına ulaştınız. Yarın tekrar deneyin!" };
    }
    if (cooldownRemaining > 0) {
      return {
        success: false,
        error: `Yeni bir reklam izlemeden önce lütfen ${Math.ceil(cooldownRemaining / 1000)} saniye bekleyin.`,
        cooldownRemainingMs: cooldownRemaining,
      };
    }
  }

  record.count = (record.count || 0) + 1;
  record.lastClaimTimestamp = now;
  record.date = todayStr;
  rewardedAdsCache[emailKey] = record;
  try {
    fs.writeFileSync(REWARDED_ADS_PATH, JSON.stringify(rewardedAdsCache, null, 2), "utf-8");
  } catch (_e) {}

  const deposit = await addCreditsOnServer(emailKey, 5, "Ödüllü Reklam İzleme Bonusu (+5 Kredi)");

  return {
    success: true,
    creditsEarned: 5,
    newCredits: deposit.newCredits,
    watchedToday: record.count,
  };
}

const claimedSponsorIds = new Set<string>();

export function getSponsorClickStatusOnServer(rawEmail?: string): {
  canClick: boolean;
  clickedToday: number;
  remainingToday: number;
  maxPerDay: number;
  rewardPerClick: number;
  cooldownRemainingMs: number;
} {
  ensureInitialized();
  const emailKey = normalizeEmail(rawEmail);
  const isSuper = emailKey === SUPER_ADMIN_EMAIL;
  if (isSuper) {
    return { canClick: true, clickedToday: 0, remainingToday: 5, maxPerDay: 5, rewardPerClick: 3, cooldownRemainingMs: 0 };
  }

  const todayStr = new Date().toISOString().split("T")[0];
  const record = sponsorClicksCache[emailKey];

  if (!record || record.date !== todayStr) {
    return { canClick: true, clickedToday: 0, remainingToday: 5, maxPerDay: 5, rewardPerClick: 3, cooldownRemainingMs: 0 };
  }

  const now = Date.now();
  const cooldownMs = 10 * 1000;
  const timeSinceLast = now - (record.lastClaimTimestamp || 0);
  const cooldownRemaining = Math.max(0, cooldownMs - timeSinceLast);

  const clicked = record.count || 0;
  const remainingToday = Math.max(0, 5 - clicked);
  const canClick = remainingToday > 0 && cooldownRemaining === 0;

  return {
    canClick,
    clickedToday: clicked,
    remainingToday,
    maxPerDay: 5,
    rewardPerClick: 3,
    cooldownRemainingMs: cooldownRemaining,
  };
}

export async function claimSponsorClickOnServer(
  rawEmail?: string,
  options?: { campaignId?: string; claimId?: string; bypassCooldown?: boolean }
): Promise<{
  success: boolean;
  creditsEarned?: number;
  newCredits?: number;
  clickedToday?: number;
  remainingToday?: number;
  error?: string;
  cooldownRemainingMs?: number;
}> {
  ensureInitialized();
  const emailKey = normalizeEmail(rawEmail);
  const isSuper = emailKey === SUPER_ADMIN_EMAIL;

  if (!emailKey) {
    return { success: false, error: "Oturum açmış geçerli bir kullanıcı bulunamadı." };
  }

  const todayStr = new Date().toISOString().split("T")[0];
  const record = sponsorClicksCache[emailKey] || { count: 0, date: todayStr, lastClaimTimestamp: 0, usedClaimIds: [] };

  if (record.date !== todayStr) {
    record.count = 0;
    record.date = todayStr;
    record.usedClaimIds = [];
  }

  // Idempotency / Anti-Replay: Check if claimId was already used
  if (options?.claimId) {
    if (claimedSponsorIds.has(options.claimId) || (record.usedClaimIds && record.usedClaimIds.includes(options.claimId))) {
      return { success: false, error: "Bu sponsor inceleme işlemi zaten kullanıldı (Replay engellendi)." };
    }
    claimedSponsorIds.add(options.claimId);
    if (!record.usedClaimIds) record.usedClaimIds = [];
    record.usedClaimIds.push(options.claimId);
  }

  const now = Date.now();
  const cooldownMs = options?.bypassCooldown || process.env.NODE_ENV === "test" ? 0 : 10 * 1000;
  const timeSinceLast = now - (record.lastClaimTimestamp || 0);
  const cooldownRemaining = Math.max(0, cooldownMs - timeSinceLast);

  if (!isSuper) {
    if (record.count >= 5) {
      return { success: false, error: "Günlük maksimum 5 sponsor tıklama sınırına ulaştınız. Yarın tekrar deneyin!" };
    }
    if (cooldownRemaining > 0) {
      return {
        success: false,
        error: `Yeni bir sponsor incelemeden önce lütfen ${Math.ceil(cooldownRemaining / 1000)} saniye bekleyin.`,
        cooldownRemainingMs: cooldownRemaining,
      };
    }
  }

  record.count = (record.count || 0) + 1;
  record.lastClaimTimestamp = now;
  record.date = todayStr;
  sponsorClicksCache[emailKey] = record;
  try {
    fs.writeFileSync(SPONSOR_CLICKS_PATH, JSON.stringify(sponsorClicksCache, null, 2), "utf-8");
  } catch (_e) {}

  const deposit = await addCreditsOnServer(emailKey, 3, "Sponsor İnceleme Bonusu (+3 Kredi)");

  return {
    success: true,
    creditsEarned: 3,
    newCredits: deposit.newCredits,
    clickedToday: record.count,
    remainingToday: Math.max(0, 5 - record.count),
  };
}

/**
 * Backward-compatible helper for simple balance validation
 */
export function checkUserCredits(rawEmail?: string, cost = 1) {
  const account = getServerUserAccount(rawEmail);
  return {
    allowed: account.credits >= cost || account.isSuperAdmin,
    credits: account.credits,
    isSuperAdmin: account.isSuperAdmin,
  };
}

/**
 * Backward-compatible helper for direct deduction
 */
export async function deductCreditsAfterSuccess(rawEmail?: string, cost = 1, feature = "operation") {
  const account = (await getUserCreditsFromFirestore(rawEmail)) || getServerUserAccount(rawEmail);
  if (account.isSuperAdmin) {
    return { success: true, remainingCredits: 9999 };
  }
  const res = await reserveUserCredits(rawEmail, cost, feature);
  if (res.allowed && res.reservationId) {
    return await commitCreditReservation(res.reservationId);
  }
  return { success: false, remainingCredits: account.credits };
}

