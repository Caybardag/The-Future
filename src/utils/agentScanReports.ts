import { 
  db, 
  collection, 
  doc, 
  setDoc, 
  getDocs, 
  query, 
  where, 
  deleteDoc 
} from "../lib/firebase";

export interface AgentScanSource {
  title: string;
  tier?: string;
  url?: string;
}

export interface AgentScanNextStep {
  title: string;
  description: string;
  targetView: "job_risk" | "butterfly_effect" | "ai_simulation" | "persona_chat" | "personal_roadmap" | "verification" | "audit";
  targetYear?: number;
  creditCostFree: number;
  creditCostPro: number;
  creditCostVip: number;
  badgeLabel?: string;
}

export interface AgentScanReport {
  id: string;
  milestoneYear: number;
  milestoneTitle: string;
  milestoneCategory: string;
  trend: "güçleniyor" | "yavaşlıyor" | "belirsiz";
  trendLabel: string;
  confidenceScore: number;
  
  // Section 1: Executive Cover Summary (3-5 sentences)
  summary: string;
  
  // Section 2: Detailed Domain & Technical Analysis
  reasoning: string;
  
  // Section 3: Evidence & Sources
  evidenceSummary: string;
  sources: AgentScanSource[];
  
  // Section 4: Risks & 2-3 Signals to watch
  risksAndSignals: string[];
  
  // Section 5: Re-scan recommendation
  rescanRecommendation: string;
  
  // Section 6: Next Step Recommendations ("Sırada ne bakmalısın?")
  nextStepRecommendations: AgentScanNextStep[];
  
  createdAt: string;
  createdAtTimestamp: number;
  userEmail?: string;
  cached?: boolean;
  isOfflineSimulated?: boolean;
  disclaimer: string;
}

function getStorageKey(userEmail?: string | null): string {
  const sanitized = userEmail ? userEmail.replace(/[^a-zA-Z0-9_@.-]/g, "_") : "guest";
  return `future_agent_scan_reports_${sanitized}`;
}

export function saveAgentScanReport(report: AgentScanReport, userEmail?: string | null): void {
  // 1. LocalStorage update
  try {
    const key = getStorageKey(userEmail);
    const existing = getUserAgentScanReports(userEmail);
    const filtered = existing.filter((r) => r.id !== report.id);
    const updated = [report, ...filtered].slice(0, 50);
    localStorage.setItem(key, JSON.stringify(updated));
  } catch (err) {
    console.warn("[AgentScanReports] LocalStorage save warning:", err);
  }

  // 2. Firestore Sync: Save to 'agent_reports' collection
  if (userEmail && userEmail !== "guest") {
    try {
      const docRef = doc(db, "agent_reports", report.id);
      setDoc(docRef, {
        ...report,
        userEmail: userEmail.toLowerCase().trim()
      }).catch((firestoreErr) => {
        console.warn("[AgentScanReports] Firestore background save error:", firestoreErr);
      });
    } catch (err) {
      console.warn("[AgentScanReports] Firestore trigger error:", err);
    }
  }
}

export function getUserAgentScanReports(userEmail?: string | null): AgentScanReport[] {
  try {
    const key = getStorageKey(userEmail);
    const raw = localStorage.getItem(key);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (err) {
    console.warn("[AgentScanReports] Failed to read local reports:", err);
    return [];
  }
}

/**
 * Fetches user's saved agent scan reports from Firestore ('agent_reports' collection)
 * completely free of charge (0 Credits). Merges with local storage.
 */
export async function fetchUserAgentReportsFromFirestore(
  userEmail?: string | null
): Promise<AgentScanReport[]> {
  const localList = getUserAgentScanReports(userEmail);
  if (!userEmail || userEmail === "guest") {
    return localList;
  }

  try {
    const q = query(
      collection(db, "agent_reports"),
      where("userEmail", "==", userEmail.toLowerCase().trim())
    );
    const querySnapshot = await getDocs(q);
    const remoteList: AgentScanReport[] = [];

    querySnapshot.forEach((docSnap) => {
      const data = docSnap.data() as AgentScanReport;
      remoteList.push({
        ...data,
        id: data.id || docSnap.id
      });
    });

    // Merge and sort by creation timestamp descending
    const mergedMap = new Map<string, AgentScanReport>();
    [...remoteList, ...localList].forEach((item) => {
      if (item.id) mergedMap.set(item.id, item);
    });

    const finalMerged = Array.from(mergedMap.values()).sort(
      (a, b) => (b.createdAtTimestamp || 0) - (a.createdAtTimestamp || 0)
    );

    // Sync back to local storage cache
    const key = getStorageKey(userEmail);
    localStorage.setItem(key, JSON.stringify(finalMerged));

    return finalMerged;
  } catch (err) {
    console.warn("[AgentScanReports] Error fetching from Firestore, returning local data:", err);
    return localList;
  }
}

export function getLatestReportForMilestone(
  milestoneYear: number,
  userEmail?: string | null
): AgentScanReport | null {
  const reports = getUserAgentScanReports(userEmail);
  return reports.find((r) => r.milestoneYear === milestoneYear) || null;
}

export function deleteAgentScanReport(reportId: string, userEmail?: string | null): void {
  try {
    const key = getStorageKey(userEmail);
    const existing = getUserAgentScanReports(userEmail);
    const updated = existing.filter((r) => r.id !== reportId);
    localStorage.setItem(key, JSON.stringify(updated));
  } catch (err) {
    console.warn("[AgentScanReports] Failed to delete report locally:", err);
  }

  if (userEmail && userEmail !== "guest") {
    try {
      const docRef = doc(db, "agent_reports", reportId);
      deleteDoc(docRef).catch((e) => console.warn("[AgentScanReports] Firestore delete error:", e));
    } catch (e) {
      console.warn("[AgentScanReports] Firestore delete trigger error:", e);
    }
  }
}
