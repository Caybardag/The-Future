import { db, auth } from "../lib/firebase";
import { collection, addDoc, getDocs, deleteDoc, doc, query, orderBy, limit, onSnapshot } from "firebase/firestore";
import { EvidenceProof } from "../components/VerificationSystemView";

const STORAGE_KEY = "milestone_evidence_proofs";

// Meşruiyet ve uydurma/sahte/troll/çelişkili içerik tespit ve temizleme filtresi
export function isLegitimateProof(proof: any): boolean {
  if (!proof) return false;
  if (proof.aiVerdict !== "ONAYLANDI" || Number(proof.aiVerificationScore || 0) < 70) {
    return false;
  }

  const url = String(proof.sourceUrl || "").trim().toLowerCase();
  const title = String(proof.sourceTitle || "").trim().toLowerCase();
  const summary = String(proof.userSummary || "").trim().toLowerCase();
  const critique = String(proof.aiCritique || "").trim().toLowerCase();
  const combined = `${title} ${summary} ${url}`;

  // AI Analizinde ret, uyuşmazlık veya çelişki tespit edildiyse kesinlikle meşru değildir
  if (
    critique.includes("reddedildi") ||
    critique.includes("uyuşmuyor") ||
    critique.includes("uyusmuyor") ||
    critique.includes("çelişki") ||
    critique.includes("celiski") ||
    critique.includes("sahte") ||
    critique.includes("çarpıt") ||
    critique.includes("carpit") ||
    critique.includes("uydurma")
  ) {
    return false;
  }

  // 1. Uydurma, troll, argo ve gayriciddi metin kalıpları
  const fabricationAndTrollPatterns = [
    /\buydurma\b/i,
    /\buydurdum\b/i,
    /\buyduruk\b/i,
    /\buydurmasyon\b/i,
    /\bsallama\b/i,
    /\bsalladım\b/i,
    /\bsallamasyon\b/i,
    /\byalan\b/i,
    /\bfake\b/i,
    /\boylesine\b/i,
    /\böylesine\b/i,
    /\brastgele\b/i,
    /\balakasız\b/i,
    /\balakasiz\b/i,
    /\bdeneme\b/i,
    /\banan[ıi]n\b/i,
    /\bana[ns]ı\b/i,
    /\borospu\b/i,
    /\bpi[çc]\b/i,
    /\bsik\b/i,
    /\byarrak\b/i,
    /\bamk\b/i,
    /\baq\b/i,
    /\bg[öo]t\b/i,
    /\bgercekler ac[ıi]t[ıi]r\b/i,
    /\bsalak\b/i,
    /\baptal\b/i,
    /\bmanyak\b/i,
    /\btroll\b/i,
    /\bsa[çc]ma\b/i,
    /(asdf|qwerty|zxcv|ghjkl|12345|aaaa|bbbb|cccc|dddd)/i,
    /\b(ölümsüzlük bulundu|zaman makinesi yapıldı|zaman yolculuğu bulundu|uzaylılar açıklandı)\b/i,
  ];

  if (fabricationAndTrollPatterns.some((pattern) => pattern.test(combined))) {
    return false;
  }

  // 2. URL Format, Alan Adı ve Sayfa Spesifikliği Kontrolü
  if (!url || url.length < 8 || url.includes(" ")) {
    return false;
  }

  try {
    const parsed = new URL(url.startsWith("http") ? url : `https://${url}`);
    const domain = parsed.hostname.replace(/^www\./, "");
    if (!domain.includes(".") || domain.length < 4) return false;
    // Yalnızca ana sayfa girilip spesifik araştırma girilmediyse geçersiz
    if (!parsed.pathname || parsed.pathname === "/" || parsed.pathname.length <= 1) {
      return false;
    }
  } catch {
    return false;
  }

  if (url.includes("yapay zekanın") || url.includes("test.test") || url.includes("fake.xyz")) {
    return false;
  }

  // 3. İçerik ve Açıklama Derinliği Kontrolü
  if (summary.length < 20 || summary.split(/\s+/).length < 4) {
    return false;
  }

  return true;
}

export class EvidenceService {
  /**
   * Save a verified evidence proof to Firestore and localStorage
   */
  static async saveProof(proof: EvidenceProof): Promise<void> {
    if (!isLegitimateProof(proof)) {
      console.warn("Evidence proof rejected by client-side integrity filter, not saving.");
      return;
    }
    // 1. Always update localStorage for instant offline access and fallback
    try {
      const existing = this.getLocalProofs().filter(isLegitimateProof);
      const filtered = existing.filter((p) => p.id !== proof.id);
      localStorage.setItem(STORAGE_KEY, JSON.stringify([proof, ...filtered]));
    } catch (e) {
      console.warn("Local storage cache write error:", e);
    }

    // 2. Persist to Firestore if online / authenticated
    try {
      if (db) {
        await addDoc(collection(db, "evidenceProofs"), {
          ...proof,
          userEmail: auth.currentUser?.email || "anonymous_contributor",
          submittedBy: auth.currentUser?.displayName || "Araştırmacı Kullanıcı",
          persistedAt: new Date().toISOString(),
        });
        console.log("Proof successfully saved to cloud Firestore!");
      }
    } catch (err) {
      console.warn("Firestore save skipped/failed (will remain in local cache):", err);
    }
  }

  /**
   * Delete a specific evidence proof by ID from both Firestore and localStorage
   */
  static async deleteProof(proofId: string): Promise<boolean> {
    try {
      // 1. Remove from localStorage
      const local = this.getLocalProofs();
      const updatedLocal = local.filter((p) => p.id !== proofId);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedLocal));

      // 2. Remove from Firestore if online
      if (db) {
        const q = query(collection(db, "evidenceProofs"), limit(100));
        const snapshot = await getDocs(q);
        snapshot.forEach(async (docSnap) => {
          const data = docSnap.data();
          if (docSnap.id === proofId || data.id === proofId) {
            await deleteDoc(doc(db, "evidenceProofs", docSnap.id)).catch(() => {});
          }
        });
      }
      return true;
    } catch (e) {
      console.error("deleteProof error:", e);
      return false;
    }
  }

  /**
   * Autonomous AI Brain Sweeper: Detects and purges all fabricated / illegitimate proofs
   */
  static async cleanFabricatedProofs(): Promise<{ purgedCount: number; remaining: EvidenceProof[] }> {
    let purgedCount = 0;

    // 1. Clean localStorage
    let currentLocal: EvidenceProof[] = [];
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) {
          const valid = parsed.filter((p) => {
            const ok = isLegitimateProof(p);
            if (!ok) purgedCount++;
            return ok;
          });
          currentLocal = valid;
          localStorage.setItem(STORAGE_KEY, JSON.stringify(valid));
        }
      }
    } catch (e) {
      console.warn("Local storage clean error:", e);
    }

    // 2. Clean Firestore documents
    if (db) {
      try {
        const q = query(collection(db, "evidenceProofs"), limit(100));
        const snapshot = await getDocs(q);
        const deletePromises: Promise<any>[] = [];

        snapshot.forEach((docSnap) => {
          const data = docSnap.data();
          const p: EvidenceProof = {
            id: data.id || docSnap.id,
            year: data.year,
            milestoneTitle: data.milestoneTitle,
            status: data.status,
            sourceUrl: data.sourceUrl,
            sourceTitle: data.sourceTitle,
            userSummary: data.userSummary,
            aiVerificationScore: data.aiVerificationScore,
            aiVerdict: data.aiVerdict,
            aiCritique: data.aiCritique,
            submittedAt: data.submittedAt,
            isSystemAutoVerified: data.isSystemAutoVerified ?? false,
            verifierType: data.verifierType || "user_contributed",
            sourceTier: data.sourceTier,
            tierLabel: data.tierLabel,
            sourceTrustScore: data.sourceTrustScore,
            verificationMultiplier: data.verificationMultiplier,
          };

          if (!isLegitimateProof(p)) {
            purgedCount++;
            deletePromises.push(deleteDoc(doc(db, "evidenceProofs", docSnap.id)).catch(() => {}));
          }
        });

        await Promise.allSettled(deletePromises);
      } catch (err) {
        console.warn("Firestore clean error:", err);
      }
    }

    return { purgedCount, remaining: currentLocal };
  }

  /**
   * Fetch all proofs from Firestore, falling back to localStorage
   */
  static async fetchProofs(fallbackDefaults: EvidenceProof[]): Promise<EvidenceProof[]> {
    try {
      if (db) {
        const q = query(collection(db, "evidenceProofs"), orderBy("submittedAt", "desc"), limit(50));
        const snapshot = await getDocs(q);
        if (!snapshot.empty) {
          const cloudProofs: EvidenceProof[] = [];
          snapshot.forEach((docSnap) => {
            const data = docSnap.data();
            const p: EvidenceProof = {
              id: data.id || docSnap.id,
              year: data.year,
              milestoneTitle: data.milestoneTitle,
              status: data.status,
              sourceUrl: data.sourceUrl,
              sourceTitle: data.sourceTitle,
              userSummary: data.userSummary,
              aiVerificationScore: data.aiVerificationScore,
              aiVerdict: data.aiVerdict,
              aiCritique: data.aiCritique,
              submittedAt: data.submittedAt,
              isSystemAutoVerified: data.isSystemAutoVerified ?? false,
              verifierType: data.verifierType || "user_contributed",
              sourceTier: data.sourceTier,
              tierLabel: data.tierLabel,
              sourceTrustScore: data.sourceTrustScore,
              verificationMultiplier: data.verificationMultiplier,
            };
            if (isLegitimateProof(p)) {
              cloudProofs.push(p);
            } else {
              // Auto-purge illegitimate data from Firestore in background
              deleteDoc(doc(db, "evidenceProofs", docSnap.id)).catch(() => {});
            }
          });

          // Merge with initial system defaults to prevent losing seed proofs
          const merged = [...cloudProofs];
          fallbackDefaults.filter(isLegitimateProof).forEach((def) => {
            if (!merged.some((p) => p.id === def.id)) {
              merged.push(def);
            }
          });

          // Update local cache
          localStorage.setItem(STORAGE_KEY, JSON.stringify(merged));
          return merged;
        }
      }
    } catch (err) {
      console.warn("Firestore fetch error, reading from local cache:", err);
    }

    return this.getLocalProofs(fallbackDefaults);
  }

  /**
   * Get cached proofs from localStorage
   */
  static getLocalProofs(fallbackDefaults: EvidenceProof[] = []): EvidenceProof[] {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          const filtered = parsed.filter(isLegitimateProof);
          if (filtered.length !== parsed.length) {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
          }
          return filtered.length > 0 ? filtered : fallbackDefaults;
        }
      }
    } catch (e) {
      console.error("Local storage read error:", e);
    }
    return fallbackDefaults.filter(isLegitimateProof);
  }

  /**
   * Subscribe to real-time cloud updates with strict validation
   */
  static subscribeToProofs(
    fallbackDefaults: EvidenceProof[],
    onUpdate: (proofs: EvidenceProof[]) => void
  ): () => void {
    try {
      if (!db) return () => {};
      const q = query(collection(db, "evidenceProofs"), limit(50));
      return onSnapshot(
        q,
        (snapshot) => {
          if (!snapshot.empty) {
            const cloudProofs: EvidenceProof[] = [];
            snapshot.forEach((docSnap) => {
              const data = docSnap.data();
              const p: EvidenceProof = {
                id: data.id || docSnap.id,
                year: data.year,
                milestoneTitle: data.milestoneTitle,
                status: data.status,
                sourceUrl: data.sourceUrl,
                sourceTitle: data.sourceTitle,
                userSummary: data.userSummary,
                aiVerificationScore: data.aiVerificationScore,
                aiVerdict: data.aiVerdict,
                aiCritique: data.aiCritique,
                submittedAt: data.submittedAt,
                isSystemAutoVerified: data.isSystemAutoVerified ?? false,
                verifierType: data.verifierType || "user_contributed",
                sourceTier: data.sourceTier,
                tierLabel: data.tierLabel,
                sourceTrustScore: data.sourceTrustScore,
                verificationMultiplier: data.verificationMultiplier,
              };
              if (isLegitimateProof(p)) {
                cloudProofs.push(p);
              } else {
                // Auto-purge invalid/fabricated doc from Firestore
                deleteDoc(doc(db, "evidenceProofs", docSnap.id)).catch(() => {});
              }
            });

            // Merge with system defaults
            const merged = [...cloudProofs];
            fallbackDefaults.filter(isLegitimateProof).forEach((def) => {
              if (!merged.some((p) => p.id === def.id)) {
                merged.push(def);
              }
            });

            onUpdate(merged);
          }
        },
        (error) => {
          console.warn("Firestore snapshot listener error:", error);
        }
      );
    } catch (e) {
      console.warn("Could not attach listener:", e);
      return () => {};
    }
  }
}

