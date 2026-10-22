import fs from "fs";
import path from "path";
import { initializeApp, getApps, App } from "firebase-admin/app";
import { getFirestore, Firestore } from "firebase-admin/firestore";

let adminApp: App | null = null;
let adminDb: Firestore | null = null;
let isIamBlocked = false;
let iamCheckDone = false;

export function getAdminFirestoreInstance(): { db: Firestore | null; isBlockedByIam: boolean } {
  if (adminDb) {
    return { db: adminDb, isBlockedByIam: isIamBlocked };
  }

  try {
    const configPath = path.join(process.cwd(), "firebase-applet-config.json");
    let projectId = process.env.FIREBASE_PROJECT_ID || process.env.GCLOUD_PROJECT || process.env.GCP_PROJECT || "smurfy-citizen-xn50x";
    let databaseId = process.env.FIRESTORE_DATABASE_ID || "(default)";

    if (fs.existsSync(configPath)) {
      try {
        const cfg = JSON.parse(fs.readFileSync(configPath, "utf-8"));
        projectId = process.env.FIREBASE_PROJECT_ID || process.env.GCLOUD_PROJECT || process.env.GCP_PROJECT || cfg.projectId || projectId;
        databaseId = process.env.FIRESTORE_DATABASE_ID || cfg.firestoreDatabaseId || databaseId;
      } catch (_e) {}
    }

    const apps = getApps();
    if (apps.length === 0) {
      adminApp = initializeApp({
        projectId,
      });
    } else {
      adminApp = apps[0];
    }

    adminDb = getFirestore(adminApp, databaseId);
    return { db: adminDb, isBlockedByIam: isIamBlocked };
  } catch (err: any) {
    console.error("[FirebaseAdmin] Failed to initialize Firebase Admin SDK:", err?.message);
    return { db: null, isBlockedByIam: true };
  }
}

/**
 * Diagnostic helper to verify whether Cloud Run service account has IAM permissions
 * on the target Firestore project.
 */
export async function checkAdminSdkIamConnectivity(): Promise<{
  connected: boolean;
  serviceAccount?: string;
  error?: string;
  status: "AUTHORIZED" | "IAM_PERMISSION_DENIED" | "UNINITIALIZED";
}> {
  const { db } = getAdminFirestoreInstance();
  if (!db) {
    return {
      connected: false,
      status: "UNINITIALIZED",
      error: "Firebase Admin SDK could not be initialized",
    };
  }

  try {
    // Attempt a light read query
    await db.collection("users").limit(1).get();
    iamCheckDone = true;
    isIamBlocked = false;
    return {
      connected: true,
      status: "AUTHORIZED",
    };
  } catch (err: any) {
    iamCheckDone = true;
    const isPermissionDenied = err?.code === 7 || err?.message?.includes("Missing or insufficient permissions");
    if (isPermissionDenied) {
      isIamBlocked = true;
    }
    return {
      connected: false,
      status: isPermissionDenied ? "IAM_PERMISSION_DENIED" : "UNINITIALIZED",
      error: err?.message,
    };
  }
}
