import fs from "fs";
import path from "path";
import crypto from "crypto";
import { initializeApp, getApps } from "firebase/app";
import { getFirestore, doc, getDoc, setDoc, collection, getDocs } from "firebase/firestore";

const SUPER_ADMIN_EMAIL = "warfacelove46@gmail.com";

const LEDGER_PATH = path.join(process.cwd(), "src", "data", "server_user_credits_ledger.json");
const AUDIT_PATH = path.join(process.cwd(), "src", "data", "server_credit_audit_transactions.json");
const USERS_DB_PATH = path.join(process.cwd(), "src", "data", "server_users_db.json");
const BACKUPS_DIR = path.join(process.cwd(), "src", "data", "backups");

function getFirestoreInstance() {
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
  return getFirestore(app, databaseId);
}

export interface MigrationDryRunResult {
  totalLedgerUsers: number;
  totalCreditsInLedger: number;
  duplicateOrInvalidUsers: string[];
  alreadyExistingInFirestore: Array<{
    userId: string;
    email: string;
    jsonCredits: number;
    firestoreCredits: number;
    diff: number;
    conflictResolvedHow: string;
  }>;
  usersToMigrate: Array<{
    userId: string;
    email: string;
    credits: number;
    plan: string;
    role: string;
  }>;
  totalAuditTransactionsInJson: number;
  backupFilesCreated: string[];
}

export async function runCreditsMigration(options: { dryRun?: boolean; execute?: boolean } = {}): Promise<{
  success: boolean;
  dryRunResult: MigrationDryRunResult;
  migratedUsersCount?: number;
  migratedAuditCount?: number;
  message: string;
}> {
  const isDryRun = options.dryRun !== false && !options.execute;

  // 1. Ensure Backups Directory & Create Timestamped Backups
  if (!fs.existsSync(BACKUPS_DIR)) {
    fs.mkdirSync(BACKUPS_DIR, { recursive: true });
  }

  const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
  const ledgerBackupPath = path.join(BACKUPS_DIR, `pre_migration_server_user_credits_ledger_${timestamp}.json`);
  const auditBackupPath = path.join(BACKUPS_DIR, `pre_migration_server_credit_audit_${timestamp}.json`);

  const createdBackups: string[] = [];
  if (fs.existsSync(LEDGER_PATH)) {
    fs.copyFileSync(LEDGER_PATH, ledgerBackupPath);
    createdBackups.push(ledgerBackupPath);
  }
  if (fs.existsSync(AUDIT_PATH)) {
    fs.copyFileSync(AUDIT_PATH, auditBackupPath);
    createdBackups.push(auditBackupPath);
  }

  // 2. Read Source Data
  const ledgerData: Record<string, any> = fs.existsSync(LEDGER_PATH)
    ? JSON.parse(fs.readFileSync(LEDGER_PATH, "utf-8"))
    : {};
  const auditData: any[] = fs.existsSync(AUDIT_PATH)
    ? JSON.parse(fs.readFileSync(AUDIT_PATH, "utf-8"))
    : [];
  const usersDb: Record<string, any> = fs.existsSync(USERS_DB_PATH)
    ? JSON.parse(fs.readFileSync(USERS_DB_PATH, "utf-8"))
    : {};

  const emails = Object.keys(ledgerData);
  let totalCredits = 0;
  const duplicateOrInvalidUsers: string[] = [];
  const usersToMigrate: MigrationDryRunResult["usersToMigrate"] = [];
  const alreadyExistingInFirestore: MigrationDryRunResult["alreadyExistingInFirestore"] = [];

  const db = getFirestoreInstance();

  // 3. Inspect and reconcile each user in Ledger
  for (const rawEmail of emails) {
    const item = ledgerData[rawEmail];
    const email = rawEmail.toLowerCase().trim();

    if (!email || typeof item.credits !== "number" || isNaN(item.credits)) {
      duplicateOrInvalidUsers.push(rawEmail);
      continue;
    }

    totalCredits += item.credits;

    // Resolve stable userId
    const knownUser = usersDb[email];
    const userId = knownUser?.id || `usr_${crypto.createHash("sha256").update(email).digest("hex").slice(0, 12)}`;

    // Check if user already exists in Firestore users collection
    try {
      const docRef = doc(db, "users", userId);
      const snap = await getDoc(docRef);

      if (snap.exists()) {
        const firestoreData = snap.data();
        const firestoreCredits = typeof firestoreData.credits === "number" ? firestoreData.credits : 0;
        const diff = firestoreCredits - item.credits;

        alreadyExistingInFirestore.push({
          userId,
          email,
          jsonCredits: item.credits,
          firestoreCredits,
          diff,
          conflictResolvedHow:
            diff === 0
              ? "MATCH: JSON and Firestore credits are identical."
              : `DIFFERENCE REPORTED: Firestore has ${firestoreCredits}, JSON has ${item.credits}. Retaining Firestore verified credits without blind estimation.`,
        });

        // If Firestore already has authoritative credits, we do NOT overwrite them blindly!
        usersToMigrate.push({
          userId,
          email,
          credits: firestoreCredits, // Preserve authoritative Firestore balance
          plan: item.plan || firestoreData.plan || "free",
          role: item.role || firestoreData.role || (email === SUPER_ADMIN_EMAIL ? "superadmin" : "user"),
        });
      } else {
        usersToMigrate.push({
          userId,
          email,
          credits: item.credits,
          plan: item.plan || "free",
          role: item.role || (email === SUPER_ADMIN_EMAIL ? "superadmin" : "user"),
        });
      }
    } catch (err: any) {
      console.warn(`[Migration Check] Warning reading users/${userId}:`, err.message);
      usersToMigrate.push({
        userId,
        email,
        credits: item.credits,
        plan: item.plan || "free",
        role: item.role || (email === SUPER_ADMIN_EMAIL ? "superadmin" : "user"),
      });
    }
  }

  const dryRunResult: MigrationDryRunResult = {
    totalLedgerUsers: emails.length,
    totalCreditsInLedger: totalCredits,
    duplicateOrInvalidUsers,
    alreadyExistingInFirestore,
    usersToMigrate,
    totalAuditTransactionsInJson: auditData.length,
    backupFilesCreated: createdBackups,
  };

  if (isDryRun) {
    return {
      success: true,
      dryRunResult,
      message: `[DRY-RUN COMPLETE] Evaluated ${emails.length} users (${totalCredits} total credits). ${alreadyExistingInFirestore.length} users examined against Firestore. Backups created at ${createdBackups.join(", ")}.`,
    };
  }

  // 4. Execution Mode: Persist directly into Firestore
  let migratedUsersCount = 0;
  for (const u of usersToMigrate) {
    const docRef = doc(db, "users", u.userId);
    await setDoc(
      docRef,
      {
        id: u.userId,
        userId: u.userId,
        email: u.email,
        credits: u.credits,
        plan: u.plan,
        role: u.role,
        isSuperAdmin: u.role === "superadmin" || u.email === SUPER_ADMIN_EMAIL,
        migratedAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      { merge: true }
    );
    migratedUsersCount++;
  }

  // 5. Migrate past audit transactions to Firestore credit_transactions
  let migratedAuditCount = 0;
  for (const tx of auditData) {
    if (!tx.id) continue;
    const txDocRef = doc(db, "credit_transactions", tx.id);
    await setDoc(
      txDocRef,
      {
        id: tx.id,
        userId: tx.userId || tx.email,
        userEmail: tx.email,
        email: tx.email,
        delta: tx.delta,
        resultingCredits: tx.resultingCredits,
        feature: tx.feature || "legacy",
        reason: tx.reason || "Migrated from legacy audit JSON",
        timestamp: tx.timestamp || new Date().toISOString(),
        createdAt: tx.timestamp || new Date().toISOString(),
        meta: tx.meta || {},
      },
      { merge: true }
    );
    migratedAuditCount++;
  }

  return {
    success: true,
    dryRunResult,
    migratedUsersCount,
    migratedAuditCount,
    message: `[MIGRATION SUCCESS] Migrated ${migratedUsersCount} user accounts and ${migratedAuditCount} audit transactions into Cloud Firestore.`,
  };
}

// CLI Execution support
if (process.argv[1] && process.argv[1].endsWith("migrateCreditsToFirestore.ts")) {
  const isExecute = process.argv.includes("--execute");
  runCreditsMigration({ execute: isExecute })
    .then((res) => {
      console.log(JSON.stringify(res, null, 2));
      process.exit(0);
    })
    .catch((err) => {
      console.error("Migration fatal error:", err);
      process.exit(1);
    });
}
