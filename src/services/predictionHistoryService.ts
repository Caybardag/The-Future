import { db, auth } from "../lib/firebase";
import {
  collection,
  doc,
  setDoc,
  getDocs,
  query,
  where,
  deleteDoc,
  updateDoc,
  onSnapshot,
} from "firebase/firestore";
import { PredictionHistoryRecord } from "../utils/predictionHistory";

/**
 * Gets a sanitized key for local storage partitioning
 */
function getStorageKey(userEmailOrId?: string | null): string {
  if (!userEmailOrId || userEmailOrId === "guest" || userEmailOrId.trim() === "") {
    return "future_timeline_prediction_history_guest";
  }
  const clean = userEmailOrId.toLowerCase().replace(/[^a-z0-9]/g, "_");
  return `future_timeline_prediction_history_${clean}`;
}

export class PredictionHistoryService {
  /**
   * Get cached prediction records from user-scoped localStorage
   */
  static getLocalPredictions(userEmailOrId?: string | null): PredictionHistoryRecord[] {
    try {
      const key = getStorageKey(userEmailOrId);
      const raw = localStorage.getItem(key);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) {
          return parsed;
        }
      }
    } catch (err) {
      console.warn("Error reading local prediction history:", err);
    }
    return [];
  }

  /**
   * Save prediction record to user-scoped local storage AND sync to Firestore
   */
  static async savePrediction(
    record: PredictionHistoryRecord,
    userEmailOrId?: string | null
  ): Promise<void> {
    const activeUser = userEmailOrId || auth.currentUser?.email || "guest";
    const key = getStorageKey(activeUser);

    // 1. Update user-scoped local cache immediately
    try {
      const current = this.getLocalPredictions(activeUser);
      const updated = [record, ...current.filter((item) => item.id !== record.id)].slice(0, 150);
      localStorage.setItem(key, JSON.stringify(updated));
    } catch (err) {
      console.warn("Failed to write prediction to local storage:", err);
    }

    // 2. Persist to Firestore if authenticated
    try {
      if (db && auth.currentUser && activeUser !== "guest") {
        const userUid = auth.currentUser.uid;
        const docRef = doc(db, "userPredictionHistory", `${userUid}_${record.id}`);
        await setDoc(docRef, {
          ...record,
          userId: userUid,
          userEmail: auth.currentUser.email || activeUser,
          updatedAt: new Date().toISOString(),
        });
        console.log("Prediction record persisted to cloud Firestore for user:", activeUser);
      }
    } catch (err) {
      console.warn("Firestore save skipped/failed for prediction record:", err);
    }
  }

  /**
   * Update fields of a prediction record in local storage and Firestore
   */
  static async updatePrediction(
    recordId: string,
    updates: Partial<PredictionHistoryRecord>,
    userEmailOrId?: string | null
  ): Promise<void> {
    const activeUser = userEmailOrId || auth.currentUser?.email || "guest";
    const key = getStorageKey(activeUser);

    // 1. Update local cache
    try {
      const current = this.getLocalPredictions(activeUser);
      const updated = current.map((item) => {
        if (item.id === recordId) {
          return {
            ...item,
            ...updates,
            userEngagement: {
              ...item.userEngagement,
              ...(updates.userEngagement || {}),
            },
          };
        }
        return item;
      });
      localStorage.setItem(key, JSON.stringify(updated));
    } catch (err) {
      console.warn("Failed to update local prediction record:", err);
    }

    // 2. Update Firestore
    try {
      if (db && auth.currentUser && activeUser !== "guest") {
        const userUid = auth.currentUser.uid;
        const docRef = doc(db, "userPredictionHistory", `${userUid}_${recordId}`);
        await updateDoc(docRef, {
          ...updates,
          updatedAt: new Date().toISOString(),
        });
      }
    } catch (err) {
      console.warn("Firestore update skipped/failed:", err);
    }
  }

  /**
   * Delete a prediction record from local storage and Firestore
   */
  static async deletePrediction(
    recordId: string,
    userEmailOrId?: string | null
  ): Promise<void> {
    const activeUser = userEmailOrId || auth.currentUser?.email || "guest";
    const key = getStorageKey(activeUser);

    // 1. Update local cache
    try {
      const current = this.getLocalPredictions(activeUser);
      const filtered = current.filter((item) => item.id !== recordId);
      localStorage.setItem(key, JSON.stringify(filtered));
    } catch (err) {
      console.warn("Failed to delete local prediction record:", err);
    }

    // 2. Delete from Firestore
    try {
      if (db && auth.currentUser && activeUser !== "guest") {
        const userUid = auth.currentUser.uid;
        const docRef = doc(db, "userPredictionHistory", `${userUid}_${recordId}`);
        await deleteDoc(docRef);
      }
    } catch (err) {
      console.warn("Firestore delete skipped/failed:", err);
    }
  }

  /**
   * Fetch all user predictions from Firestore with local fallback
   */
  static async fetchUserPredictions(
    userEmailOrId?: string | null
  ): Promise<PredictionHistoryRecord[]> {
    const activeUser = userEmailOrId || auth.currentUser?.email;

    if (!activeUser || activeUser === "guest") {
      return this.getLocalPredictions("guest");
    }

    try {
      if (db && auth.currentUser) {
        const userUid = auth.currentUser.uid;
        const q = query(
          collection(db, "userPredictionHistory"),
          where("userId", "==", userUid)
        );
        const snapshot = await getDocs(q);

        if (!snapshot.empty) {
          const cloudRecords: PredictionHistoryRecord[] = [];
          snapshot.forEach((docSnap) => {
            const data = docSnap.data() as any;
            cloudRecords.push({
              id: data.id || docSnap.id,
              userEmail: data.userEmail || activeUser,
              timestamp: data.timestamp || new Date().toISOString(),
              featureKey: data.featureKey || "ai_simulation",
              featureName: data.featureName || "AI Simülasyonu",
              queryTitle: data.queryTitle || "Gelecek Simülasyonu",
              queryInput: data.queryInput || {},
              generatedOutcome: data.generatedOutcome || "",
              summarySnippet: data.summarySnippet || "",
              category: data.category || "Genel Gelecek",
              targetYear: data.targetYear || 2035,
              scenarioMode: data.scenarioMode || "baseline",
              creditsSpent: data.creditsSpent ?? 10,
              metrics: data.metrics || {
                feasibilityScore: 85,
                impactLevel: 88,
                riskLevel: "Orta",
                sentiment: "neutral",
              },
              userEngagement: data.userEngagement || {
                isBookmarked: false,
                userNotes: "",
                accuracyVote: null,
                viewCount: 1,
              },
              tags: data.tags || [],
            });
          });

          // Sort by timestamp desc
          cloudRecords.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

          // Update local cache
          const key = getStorageKey(activeUser);
          localStorage.setItem(key, JSON.stringify(cloudRecords));
          return cloudRecords;
        }
      }
    } catch (err) {
      console.warn("Firestore prediction fetch error, falling back to local storage:", err);
    }

    return this.getLocalPredictions(activeUser);
  }

  /**
   * Subscribe to real-time updates of the user's prediction history
   */
  static subscribeToUserPredictions(
    userEmailOrId: string | null | undefined,
    onUpdate: (records: PredictionHistoryRecord[]) => void
  ): () => void {
    const activeUser = userEmailOrId || auth.currentUser?.email;

    if (!activeUser || activeUser === "guest" || !db || !auth.currentUser) {
      onUpdate(this.getLocalPredictions("guest"));
      return () => {};
    }

    try {
      const userUid = auth.currentUser.uid;
      const q = query(
        collection(db, "userPredictionHistory"),
        where("userId", "==", userUid)
      );

      return onSnapshot(
        q,
        (snapshot) => {
          const cloudRecords: PredictionHistoryRecord[] = [];
          snapshot.forEach((docSnap) => {
            const data = docSnap.data() as any;
            cloudRecords.push({
              id: data.id || docSnap.id,
              userEmail: data.userEmail || activeUser,
              timestamp: data.timestamp || new Date().toISOString(),
              featureKey: data.featureKey || "ai_simulation",
              featureName: data.featureName || "AI Simülasyonu",
              queryTitle: data.queryTitle || "Gelecek Simülasyonu",
              queryInput: data.queryInput || {},
              generatedOutcome: data.generatedOutcome || "",
              summarySnippet: data.summarySnippet || "",
              category: data.category || "Genel Gelecek",
              targetYear: data.targetYear || 2035,
              scenarioMode: data.scenarioMode || "baseline",
              creditsSpent: data.creditsSpent ?? 10,
              metrics: data.metrics || {
                feasibilityScore: 85,
                impactLevel: 88,
                riskLevel: "Orta",
                sentiment: "neutral",
              },
              userEngagement: data.userEngagement || {
                isBookmarked: false,
                userNotes: "",
                accuracyVote: null,
                viewCount: 1,
              },
              tags: data.tags || [],
            });
          });

          cloudRecords.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

          const key = getStorageKey(activeUser);
          localStorage.setItem(key, JSON.stringify(cloudRecords));
          onUpdate(cloudRecords);
        },
        (error) => {
          console.warn("Snapshot listener for user predictions failed:", error);
          onUpdate(this.getLocalPredictions(activeUser));
        }
      );
    } catch (e) {
      console.warn("Could not setup realtime listener for predictions:", e);
      return () => {};
    }
  }

  /**
   * Clear all records for the current user
   */
  static async clearAllUserPredictions(userEmailOrId?: string | null): Promise<void> {
    const activeUser = userEmailOrId || auth.currentUser?.email || "guest";
    const key = getStorageKey(activeUser);

    try {
      localStorage.setItem(key, JSON.stringify([]));
    } catch (err) {
      console.warn("Failed to clear local predictions:", err);
    }

    try {
      if (db && auth.currentUser && activeUser !== "guest") {
        const userUid = auth.currentUser.uid;
        const q = query(
          collection(db, "userPredictionHistory"),
          where("userId", "==", userUid)
        );
        const snapshot = await getDocs(q);
        const deletePromises = snapshot.docs.map((docSnap) => deleteDoc(docSnap.ref));
        await Promise.all(deletePromises);
      }
    } catch (err) {
      console.warn("Failed to clear cloud predictions:", err);
    }
  }
}
