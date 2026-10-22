import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from "react";
import { UserProfile, isUserProfileComplete } from "../components/UserAuthModal";
import { saveAccount, getAccountByEmail, deleteAccount, purgeAllUserLocalData } from "../utils/userAccounts";
import { fetchRealClientLocation, detectDeviceTelemetry } from "../utils/userTelemetry";
import { FeatureKey } from "../utils/creditCosts";
import {
  isFeatureDailyLimitReached,
  getRemainingDailyUsage,
  recordFeatureDailyUsage,
  checkRateLimit,
  recordRateLimitTimestamp,
} from "../utils/dailyLimitTracker";
import {
  auth,
  googleProvider,
  deleteUser,
  reauthenticateWithPopup,
  onAuthStateChanged,
  onIdTokenChanged,
  getIdTokenResult,
  db,
  doc,
  getDoc,
  setDoc,
  deleteDoc,
  firebaseSignOut,
  collection,
  addDoc,
  onSnapshot,
} from "../lib/firebase";

export type AuthStatus = "authorized" | "guest";
export type SessionLockReason = "token_expired" | "connectivity_lost" | "inactivity" | null;

export interface AuthContextType {
  currentUser: UserProfile | null;
  pendingVerificationUser: UserProfile | null;
  authStatus: AuthStatus;
  isAuthorized: boolean;
  isGuest: boolean;
  credits: number;
  plan: "free" | "pro" | "quantum_vip";

  // Session Lock & Token Expiry Security
  isSessionLocked: boolean;
  sessionLockReason: SessionLockReason;
  lockSession: (reason?: SessionLockReason) => void;
  unlockSession: () => Promise<boolean>;
  
  // Daily Feature Limits
  checkDailyLimit: (feature: FeatureKey) => boolean;
  getRemainingDailyLimit: (feature: FeatureKey) => number;
  recordFeatureConsumption: (feature: FeatureKey) => void;

  // Modals state & controls
  userAuthModalOpen: boolean;
  creditStoreModalOpen: boolean;
  upsellModalOpen: boolean;
  bannedModalOpen: boolean;
  banReasonState: string;
  upsellContextTitle: string;
  upsellContextDesc: string;
  setUserAuthModalOpen: (open: boolean) => void;
  setCreditStoreModalOpen: (open: boolean) => void;
  setUpsellModalOpen: (open: boolean) => void;
  setBannedModalOpen: (open: boolean) => void;
  openAuthModal: () => void;
  openCreditStore: () => void;
  openUpsellModal: (title?: string, desc?: string) => void;
  closeUpsellModal: () => void;
  setPendingVerificationUser: (user: UserProfile | null) => void;

  // Actions
  login: (user: UserProfile) => void;
  logout: (options?: { skipSaveAccount?: boolean }) => void;
  deleteCurrentUserAccount: () => Promise<boolean>;
  updateUserProfile: (data: Partial<UserProfile>) => void;
  deductCredits: (amount: number, feature?: FeatureKey) => boolean;
  addCredits: (amount: number) => void;
  upgradePlan: (plan: "free" | "pro" | "quantum_vip", addedCredits: number) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [bannedModalOpen, setBannedModalOpen] = useState<boolean>(false);
  const [banReasonState, setBanReasonState] = useState<string>("");

  const [currentUser, setCurrentUser] = useState<UserProfile | null>(() => {
    try {
      const saved = localStorage.getItem("future_timeline_user");
      if (!saved) return null;
      const parsed = JSON.parse(saved);
      const isSuper = (parsed.email || "").toLowerCase().trim() === "warfacelove46@gmail.com";
      if (!isSuper && parsed.isBanned) {
        localStorage.removeItem("future_timeline_user");
        return null;
      }
      // Restore user session if not banned
      const sanitizedProfession =
        parsed.profession === "Kuantum Sistemler Araştırmacısı" ? undefined : parsed.profession;
      return {
        ...parsed,
        profession: sanitizedProfession,
        isPhoneVerified: true,
      };
    } catch (e) {
      return null;
    }
  });

  // Session Lock State
  const [isSessionLocked, setIsSessionLocked] = useState<boolean>(() => {
    try {
      return sessionStorage.getItem("future_session_locked") === "true";
    } catch {
      return false;
    }
  });

  const [sessionLockReason, setSessionLockReason] = useState<SessionLockReason>(() => {
    try {
      return (sessionStorage.getItem("future_session_lock_reason") as SessionLockReason) || null;
    } catch {
      return null;
    }
  });

  const lastActivityRef = useRef<number>(Date.now());
  const currentUserRef = useRef<UserProfile | null>(currentUser);
  currentUserRef.current = currentUser;
  const isLoggingOutRef = useRef<boolean>(false);

  const lockSession = useCallback((reason: SessionLockReason = "token_expired") => {
    if (!currentUserRef.current) return;
    setIsSessionLocked(true);
    setSessionLockReason(reason);
    try {
      sessionStorage.setItem("future_session_locked", "true");
      if (reason) {
        sessionStorage.setItem("future_session_lock_reason", reason);
      }
    } catch {}
  }, []);

  const unlockSession = useCallback(async (): Promise<boolean> => {
    try {
      // 1. If Firebase Auth user exists, force token refresh
      if (auth.currentUser) {
        await auth.currentUser.getIdToken(true);
      }
      // 2. Clear locked state
      setIsSessionLocked(false);
      setSessionLockReason(null);
      lastActivityRef.current = Date.now();
      try {
        sessionStorage.removeItem("future_session_locked");
        sessionStorage.removeItem("future_session_lock_reason");
      } catch {}
      return true;
    } catch (err) {
      console.warn("Session unlock token refresh failed:", err);
      return false;
    }
  }, []);

  const [pendingVerificationUser, setPendingVerificationUserState] = useState<UserProfile | null>(() => {
    try {
      const savedPending = localStorage.getItem("future_timeline_pending_verification");
      if (!savedPending) return null;
      return JSON.parse(savedPending);
    } catch (e) {
      return null;
    }
  });

  const setPendingVerificationUser = useCallback((user: UserProfile | null) => {
    setPendingVerificationUserState(user);
    try {
      if (user) {
        localStorage.setItem("future_timeline_pending_verification", JSON.stringify(user));
      } else {
        localStorage.removeItem("future_timeline_pending_verification");
      }
    } catch (e) {}
  }, []);

  const [userAuthModalOpen, setUserAuthModalOpen] = useState<boolean>(false);
  const [creditStoreModalOpen, setCreditStoreModalOpen] = useState<boolean>(false);
  const [upsellModalOpen, setUpsellModalOpen] = useState<boolean>(false);
  const [upsellContextTitle, setUpsellContextTitle] = useState<string>("Gelecek Simülasyonu & Analiz Paneli");
  const [upsellContextDesc, setUpsellContextDesc] = useState<string>("Bu gelişmiş AI özelliği, derin gelecek analizleri ve kişiselleştirilmiş senaryolar sunar.");

  const authStatus: AuthStatus = currentUser ? "authorized" : "guest";
  const isAuthorized = !!currentUser;
  const isGuest = !currentUser;
  const credits = currentUser ? (currentUser.credits ?? 0) : 0;
  const plan: "free" | "pro" | "quantum_vip" = currentUser
    ? (currentUser.plan ?? "free")
    : "free";

  // Helper to sync to Firestore atomically and log transaction
  const syncUserToFirestore = useCallback(async (user: UserProfile, txMeta?: { delta: number; reason: string; feature?: string }) => {
    if (!user) return;
    try {
      const docKey = user.id || user.email.replace(/[^a-zA-Z0-9]/g, "_");
      const userRef = doc(db, "users", docKey);
      
      const securityAudit = {
        lastActiveAt: new Date().toISOString(),
        platform: typeof navigator !== "undefined" ? navigator.platform || "unknown" : "unknown",
        userAgent: typeof navigator !== "undefined" ? navigator.userAgent || "unknown" : "unknown",
        screenResolution: typeof window !== "undefined" ? `${window.screen?.width || 0}x${window.screen?.height || 0}` : "unknown",
        language: typeof navigator !== "undefined" ? navigator.language || "tr-TR" : "tr-TR",
      };

      await setDoc(userRef, {
        ...user,
        securityAudit,
      }, { merge: true });

      if (txMeta) {
        const txRef = collection(db, "credit_transactions");
        await addDoc(txRef, {
          userId: user.id || docKey,
          userEmail: user.email,
          delta: txMeta.delta,
          resultingCredits: user.credits,
          reason: txMeta.reason,
          feature: txMeta.feature || "general",
          timestamp: new Date().toISOString(),
        }).catch((err) => console.warn("Firestore transaction log warning:", err));
      }
    } catch (err) {
      console.warn("Firestore user sync warning:", err);
    }
  }, []);

  // Sync to local storage and server ledger on user state changes
  useEffect(() => {
    try {
      if (currentUser) {
        localStorage.setItem("future_timeline_user", JSON.stringify(currentUser));
        saveAccount(currentUser);

        // Keep server ledger in sync with client account state
        if (currentUser.email) {
          fetch("/api/credits/sync", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              email: currentUser.email,
              credits: currentUser.credits,
              plan: currentUser.plan,
              role: currentUser.role,
            }),
          }).catch(() => {});
        }
      } else {
        localStorage.removeItem("future_timeline_user");
      }
    } catch (e) {}
  }, [currentUser]);

  // Listen for Atomic Server Credit Deductions pushed by API responses and credit store open requests
  useEffect(() => {
    const handleServerCreditUpdate = (e: any) => {
      const serverCredits = e.detail?.credits;
      if (typeof serverCredits === "number") {
        setCurrentUser((prev) => {
          if (!prev) return null;
          if (prev.credits === serverCredits) return prev;
          const updated = { ...prev, credits: serverCredits };
          saveAccount(updated);
          return updated;
        });
      }
    };

    const handleOpenCreditStore = () => {
      setCreditStoreModalOpen(true);
    };

    window.addEventListener("server-credits-updated", handleServerCreditUpdate);
    window.addEventListener("future-open-credit-store", handleOpenCreditStore);
    return () => {
      window.removeEventListener("server-credits-updated", handleServerCreditUpdate);
      window.removeEventListener("future-open-credit-store", handleOpenCreditStore);
    };
  }, []);

  // Subscribe to Firestore user document for live real-time cloud balance
  useEffect(() => {
    const user = currentUserRef.current;
    if (!user?.email) return;
    const docKey = user.id || user.email.replace(/[^a-zA-Z0-9]/g, "_");
    const userRef = doc(db, "users", docKey);

    const unsubscribeDoc = onSnapshot(userRef, (snapshot) => {
      if (snapshot.exists()) {
        const cloudData = snapshot.data();
        const activeNow = currentUserRef.current;
        if (!activeNow) return;

        const isSuper = (activeNow.email || "").toLowerCase().trim() === "warfacelove46@gmail.com";
        const cloudCredits = isSuper ? 9999 : (cloudData.credits ?? activeNow.credits);
        const cloudPlan = isSuper ? "quantum_vip" : (cloudData.plan ?? activeNow.plan);
        const isPhoneVerified = cloudData.isPhoneVerified ?? activeNow.isPhoneVerified;

        if (
          cloudCredits !== activeNow.credits ||
          cloudPlan !== activeNow.plan ||
          isPhoneVerified !== activeNow.isPhoneVerified
        ) {
          setCurrentUser((prev) => {
            if (!prev) return null;
            const updated = {
              ...prev,
              credits: cloudCredits,
              plan: cloudPlan,
              isPhoneVerified,
            };
            saveAccount(updated);
            try {
              localStorage.setItem("future_timeline_user", JSON.stringify(updated));
            } catch (e) {}
            return updated;
          });
        }
      }
    }, (err) => {
      console.warn("Firestore user snapshot listener warning:", err);
    });

    return () => unsubscribeDoc();
  }, [currentUser?.email, currentUser?.id]);

  // Sync real IP/device telemetry to active account
  useEffect(() => {
    if (!currentUser?.email) return;
    let isCancelled = false;

    fetchRealClientLocation().then((loc) => {
      if (isCancelled || !loc) return;
      if (loc.isRealGpsOrIp) {
        const dev = detectDeviceTelemetry();
        const savedConsent = typeof localStorage !== "undefined" ? localStorage.getItem("cookie_consent_choice") || "accepted" : "accepted";
        
        setCurrentUser((prev) => {
          if (!prev) return null;
          // Check if already matching to avoid loops
          if (
            prev.location?.city === loc.city &&
            prev.location?.country === loc.country &&
            prev.location?.ip === loc.ip &&
            prev.device?.os === dev.os &&
            prev.device?.browser === dev.browser
          ) {
            return prev;
          }

          const updated: UserProfile = {
            ...prev,
            location: {
              city: loc.city,
              country: loc.country,
              countryCode: loc.countryCode,
              region: loc.region,
              district: loc.district,
              isp: loc.isp,
              ip: loc.ip,
              timezone: loc.timezone,
              sourceType: loc.sourceType,
              isRealGpsOrIp: loc.isRealGpsOrIp,
              updatedAt: new Date().toISOString(),
            },
            device: {
              browser: dev.browser,
              os: dev.os,
              deviceType: dev.deviceType,
              screenResolution: dev.screenResolution,
              lastSeen: new Date().toISOString(),
            },
            cookieConsent: savedConsent,
          };
          saveAccount(updated);
          try {
            localStorage.setItem("future_timeline_user", JSON.stringify(updated));
          } catch (e) {}
          return updated;
        });
      }
    }).catch(() => {});

    return () => {
      isCancelled = true;
    };
  }, [currentUser?.email]);

  // 1. Subscribe to Firebase Auth and Token lifecycle
  useEffect(() => {
    // Listen for Token changes / Token Expiry
    const unsubscribeToken = onIdTokenChanged(auth, async (fbUser) => {
      if (fbUser) {
        try {
          const freshToken = await fbUser.getIdToken();
          if (freshToken) {
            localStorage.setItem("future_user_session_token", freshToken);
          }
          const tokenResult = await getIdTokenResult(fbUser);
          const expirationTime = new Date(tokenResult.expirationTime).getTime();
          const now = Date.now();
          // If token has expired or is invalid
          if (expirationTime <= now) {
            lockSession("token_expired");
          }
        } catch (err: any) {
          console.warn("Token validation failed:", err);
          if (err.code === "auth/user-token-expired" || err.code === "auth/invalid-user-token") {
            lockSession("token_expired");
          }
        }
      }
    });

    const unsubscribeAuth = onAuthStateChanged(auth, async (fbUser) => {
      // If logout is currently in progress, do not resurrect user state
      if (isLoggingOutRef.current) {
        return;
      }

      if (!fbUser) {
        // Firebase has no active user: only clear if not logged in via local session/token
        const hasSessionToken = typeof localStorage !== "undefined" && !!localStorage.getItem("future_user_session_token");
        const hasLocalSavedUser = typeof localStorage !== "undefined" && !!localStorage.getItem("future_timeline_user");
        if (currentUserRef.current && !isLoggingOutRef.current && !hasSessionToken && !hasLocalSavedUser) {
          setCurrentUser(null);
          try {
            localStorage.removeItem("future_timeline_user");
            localStorage.removeItem("future_user_session_token");
          } catch (e) {}
        }
        return;
      }

      if (fbUser) {
        try {
          const freshToken = await fbUser.getIdToken();
          if (freshToken) {
            localStorage.setItem("future_user_session_token", freshToken);
          }
        } catch {}
        const userEmail = (fbUser.email || "").toLowerCase().trim();
        const isSuper = userEmail === "warfacelove46@gmail.com";

        // Check if this account is banned in Firestore banned_emails or local DB
        if (!isSuper) {
          try {
            const emailKey = userEmail.replace(/[@.]/g, "_");
            const bannedDocRef = doc(db, "banned_emails", emailKey);
            const bannedSnap = await getDoc(bannedDocRef);
            if (bannedSnap.exists() && bannedSnap.data()?.isBanned) {
              await firebaseSignOut(auth);
              setCurrentUser(null);
              localStorage.removeItem("future_timeline_user");
              setBanReasonState(bannedSnap.data()?.banReason || "Hesabınız yönetici tarafından askıya alınmıştır.");
              setBannedModalOpen(true);
              return;
            }
          } catch (e) {}
        }

        const activeUser = currentUserRef.current;
        // Check if user changed (or no current user)
        if (!activeUser || activeUser.id !== fbUser.uid || activeUser.email.toLowerCase().trim() !== userEmail) {
          try {
            const userRef = doc(db, "users", fbUser.uid);
            const docSnap = await getDoc(userRef);
            if (docSnap.exists()) {
              const data = docSnap.data();

              if (!isSuper && data.isBanned) {
                await firebaseSignOut(auth);
                setCurrentUser(null);
                localStorage.removeItem("future_timeline_user");
                setBanReasonState(data.banReason || "Hesabınız yönetici tarafından askıya alınmıştır.");
                setBannedModalOpen(true);
                return;
              }

              const hasPendingUnban = data.unbanNoticePending || localStorage.getItem(`future_unban_notice_${userEmail}`) === "true";
              const loadedUser: UserProfile = {
                id: fbUser.uid,
                fullName: data.fullName || fbUser.displayName || (isSuper ? "Süper Yönetici" : "Google User"),
                email: userEmail,
                phone: data.phone || (isSuper ? "+90 (Süper Yetki)" : ""),
                role: isSuper ? "superadmin" : (data.role || "user"),
                isEmailVerified: true,
                isPhoneVerified: true,
                joinedDate: data.joinedDate || new Date().toISOString(),
                credits: isSuper ? 9999 : (data.credits ?? 0),
                plan: isSuper ? "quantum_vip" : (data.plan || "free"),
                isBanned: data.isBanned ?? false,
                banReason: data.banReason,
                avatarUrl: fbUser.photoURL || data.avatarUrl || undefined,
                unbanNoticePending: hasPendingUnban,
                isProbationRequired: data.isProbationRequired ?? hasPendingUnban,
                probationAcceptedAt: data.probationAcceptedAt,
                isOnboardingCompleted: data.isOnboardingCompleted === true,
                age: data.age,
                gender: data.gender,
                country: data.country || "Türkiye",
                city: data.city,
                lifeRole: data.lifeRole,
                lifeRoleLabel: data.lifeRoleLabel,
                primaryGoal: data.primaryGoal,
                primaryGoalLabel: data.primaryGoalLabel,
                profession: data.profession === "Kuantum Sistemler Araştırmacısı" ? undefined : data.profession,
                personalGoal: data.personalGoal,
                employmentStatus: data.employmentStatus,
                seniority: data.seniority,
                industrySector: data.industrySector,
                username: data.username,
                isProfilePrivate: data.isProfilePrivate ?? true,
                location: data.location,
                device: data.device,
              };
              setCurrentUser(loadedUser);
              saveAccount(loadedUser);
              try {
                localStorage.setItem("future_timeline_user", JSON.stringify(loadedUser));
              } catch (e) {}

              // Google Login & Session Restore: Check if profile is complete
              const isProfileComplete = isUserProfileComplete(loadedUser);
              if (!isProfileComplete && !isSuper) {
                setTimeout(() => {
                  window.dispatchEvent(new CustomEvent("open_profile_completion", { detail: loadedUser }));
                }, 500);
              }
            } else {
              // Create default doc for new Google user with incomplete onboarding
              const newUser: UserProfile = {
                id: fbUser.uid,
                fullName: isSuper ? "Süper Yönetici" : (fbUser.displayName || "Google User"),
                email: userEmail,
                phone: isSuper ? "+90 (Süper Yetki)" : "",
                role: isSuper ? "superadmin" : "user",
                isEmailVerified: true,
                isPhoneVerified: true,
                joinedDate: new Date().toISOString(),
                credits: isSuper ? 9999 : 0,
                plan: isSuper ? "quantum_vip" : "free",
                isBanned: false,
                avatarUrl: fbUser.photoURL || undefined,
                country: "Türkiye",
                isOnboardingCompleted: false,
              };
              await setDoc(userRef, newUser);
              setCurrentUser(newUser);
              saveAccount(newUser);
              if (!isSuper) {
                setTimeout(() => {
                  window.dispatchEvent(new CustomEvent("open_profile_completion", { detail: newUser }));
                }, 500);
              }
            }
          } catch (err) {
            console.warn("Error fetching user profile on auth change:", err);
          }
        }
      }
    });

    return () => {
      unsubscribeToken();
      unsubscribeAuth();
    };
  }, [lockSession]);

  // Realtime ban monitoring for active user session
  useEffect(() => {
    if (!currentUser || (currentUser.email || "").toLowerCase().trim() === "warfacelove46@gmail.com") return;

    const emailKey = currentUser.email.toLowerCase().trim().replace(/[@.]/g, "_");
    const bannedDocRef = doc(db, "banned_emails", emailKey);

    const unsubBannedEmail = onSnapshot(bannedDocRef, (snap) => {
      if (snap.exists() && snap.data()?.isBanned) {
        const reason = snap.data()?.banReason || "Hesabınız yönetici tarafından askıya alınmıştır.";
        setBanReasonState(reason);
        setBannedModalOpen(true);
        setCurrentUser(null);
        localStorage.removeItem("future_timeline_user");
        firebaseSignOut(auth).catch(() => {});
      }
    }, () => {});

    let unsubUserDoc = () => {};
    if (currentUser.id) {
      unsubUserDoc = onSnapshot(doc(db, "users", currentUser.id), (snap) => {
        if (snap.exists() && snap.data()?.isBanned) {
          const reason = snap.data()?.banReason || "Hesabınız yönetici tarafından askıya alınmıştır.";
          setBanReasonState(reason);
          setBannedModalOpen(true);
          setCurrentUser(null);
          localStorage.removeItem("future_timeline_user");
          firebaseSignOut(auth).catch(() => {});
        }
      }, () => {});
    }

    return () => {
      unsubBannedEmail();
      unsubUserDoc();
    };
  }, [currentUser?.id, currentUser?.email]);

  // 2. Network and Cloud Connectivity Monitoring
  useEffect(() => {
    if (!currentUser) return;

    const handleOffline = () => {
      lockSession("connectivity_lost");
    };

    window.addEventListener("offline", handleOffline);
    return () => {
      window.removeEventListener("offline", handleOffline);
    };
  }, [currentUser, lockSession]);

  // 3. User Activity & Inactivity Security Lock Timer (30 minutes of idle time)
  useEffect(() => {
    if (!currentUser) return;

    const resetActivity = () => {
      lastActivityRef.current = Date.now();
    };

    const events = ["mousedown", "mousemove", "keydown", "scroll", "touchstart", "click"];
    events.forEach((ev) => window.addEventListener(ev, resetActivity, { passive: true }));

    const interval = setInterval(() => {
      const now = Date.now();
      const idleTime = now - lastActivityRef.current;
      const MAX_IDLE_MS = 30 * 60 * 1000; // 30 minutes
      if (idleTime > MAX_IDLE_MS && !isSessionLocked) {
        lockSession("inactivity");
      }
    }, 60000); // check every minute

    return () => {
      events.forEach((ev) => window.removeEventListener(ev, resetActivity));
      clearInterval(interval);
    };
  }, [currentUser, isSessionLocked, lockSession]);

  const login = useCallback(async (user: UserProfile) => {
    const isSuper = (user.email || "").toLowerCase().trim() === "warfacelove46@gmail.com";
    const docKey = user.id || user.email.replace(/[^a-zA-Z0-9]/g, "_");
    
    // First, check if there is an existing Firestore record to restore true balance & ban status
    let cloudBalance = user.credits;
    let cloudPlan = user.plan;
    let cloudPhoneVerified = user.isPhoneVerified;
    let isCloudBanned = user.isBanned ?? false;
    let cloudBanReason = user.banReason;

    try {
      const userRef = doc(db, "users", docKey);
      const snap = await getDoc(userRef);
      if (snap.exists()) {
        const cData = snap.data();
        if (cData.credits !== undefined) cloudBalance = cData.credits;
        if (cData.plan !== undefined) cloudPlan = cData.plan;
        if (cData.isPhoneVerified !== undefined) cloudPhoneVerified = cData.isPhoneVerified;
        if (cData.isBanned !== undefined) isCloudBanned = cData.isBanned;
        if (cData.banReason) cloudBanReason = cData.banReason;
      }
    } catch (err) {
      console.warn("Firestore login check fallback:", err);
    }

    if (!isSuper) {
      try {
        const emailKey = (user.email || "").toLowerCase().trim().replace(/[@.]/g, "_");
        const bannedRef = doc(db, "banned_emails", emailKey);
        const bSnap = await getDoc(bannedRef);
        if (bSnap.exists() && bSnap.data()?.isBanned) {
          isCloudBanned = true;
          cloudBanReason = bSnap.data()?.banReason || cloudBanReason;
        }
      } catch (err) {}
    }

    const existingSaved = getAccountByEmail(user.email);
    if (!isSuper && (isCloudBanned || existingSaved?.isBanned)) {
      await firebaseSignOut(auth).catch(() => {});
      setCurrentUser(null);
      localStorage.removeItem("future_timeline_user");
      setBanReasonState(cloudBanReason || existingSaved?.banReason || "Hesabınız yönetici tarafından askıya alınmıştır.");
      setBannedModalOpen(true);
      return;
    }

    const hydratedUser: UserProfile = {
      ...user,
      role: isSuper ? "superadmin" : (user.role || existingSaved?.role || "user"),
      credits: isSuper ? 9999 : (cloudBalance !== undefined ? cloudBalance : (existingSaved?.credits ?? 0)),
      plan: isSuper ? "quantum_vip" : (cloudPlan || user.plan || existingSaved?.plan || "free"),
      isPhoneVerified: true,
      isBanned: false,
    };

    saveAccount(hydratedUser);
    syncUserToFirestore(hydratedUser);
    setCurrentUser(hydratedUser);
    try {
      localStorage.setItem("future_timeline_user", JSON.stringify(hydratedUser));
    } catch (e) {}
  }, [syncUserToFirestore]);

  const logout = useCallback(async (options?: { skipSaveAccount?: boolean }) => {
    isLoggingOutRef.current = true;
    try {
      const token = localStorage.getItem("future_user_session_token");
      if (token) {
        fetch("/api/auth/logout", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }).catch(() => {});
      }
      if (!options?.skipSaveAccount && currentUserRef.current) {
        saveAccount(currentUserRef.current);
      }
      currentUserRef.current = null;
      localStorage.removeItem("future_timeline_user");
      localStorage.removeItem("future_user_session_token");
      localStorage.removeItem("user_profile_account");
      localStorage.removeItem("future_timeline_pending_verification");
      sessionStorage.removeItem("future_session_locked");
      sessionStorage.removeItem("future_session_lock_reason");
      sessionStorage.removeItem("future_admin_session_auth_key");
    } catch (e) {}

    // Immediately clear state for instant, single-click UI logout
    setCurrentUser(null);
    setPendingVerificationUserState(null);
    setIsSessionLocked(false);
    setSessionLockReason(null);

    try {
      await firebaseSignOut(auth);
    } catch (e) {
      console.warn("Firebase signout warning:", e);
    } finally {
      setTimeout(() => {
        isLoggingOutRef.current = false;
      }, 500);
    }
  }, []);

  const deleteCurrentUserAccount = useCallback(async (): Promise<boolean> => {
    if (!currentUser) {
      throw new Error("Aktif bir kullanıcı oturumu bulunamadı.");
    }
    const emailToDelete = currentUser.email;
    const userIdToDelete = currentUser.id;

    if (emailToDelete.toLowerCase().trim() === "warfacelove46@gmail.com") {
      throw new Error("Süper yönetici hesabı sistem güvenliği ve sürekliliği nedeniyle silinemez.");
    }

    // 1. Obtain verified authorization token for server call
    let authToken = "";
    if (auth.currentUser) {
      try {
        authToken = await auth.currentUser.getIdToken(true);
      } catch (tokenErr) {
        console.warn("Could not get fresh Firebase ID token:", tokenErr);
      }
    }
    if (!authToken) {
      authToken = localStorage.getItem("future_user_session_token") || "";
    }

    if (!authToken) {
      throw new Error("Kimlik doğrulama belirteci bulunamadı. Lütfen oturumunuzu yenileyip tekrar deneyin.");
    }

    // 2. Authoritative Server Deletion (Deletes Firestore docs, server DB user, credits, and cleans active sessions)
    const serverRes = await fetch("/api/auth/delete-account", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${authToken}`,
      },
      body: JSON.stringify({ userId: userIdToDelete, email: emailToDelete }),
    });

    const serverData = await serverRes.json().catch(() => null);
    if (!serverRes.ok || !serverData?.success) {
      throw new Error(serverData?.error || "Sunucu tarafında kullanıcı verileri silinemedi.");
    }

    // 3. Real Firebase Authentication deletion with recent-login protection
    if (auth.currentUser) {
      try {
        await deleteUser(auth.currentUser);
      } catch (authErr: any) {
        if (authErr?.code === "auth/requires-recent-login") {
          try {
            await reauthenticateWithPopup(auth.currentUser, googleProvider);
            await deleteUser(auth.currentUser);
          } catch (reauthErr: any) {
            console.error("Firebase reauthentication failed:", reauthErr);
            throw new Error("Güvenlik nedeniyle hesap silinmeden önce kimliğinizi Google ile doğrulamanız gerekmektedir.");
          }
        } else {
          console.error("Firebase deleteUser error:", authErr);
          throw new Error(authErr?.message || "Firebase kimlik hesabı silinemedi.");
        }
      }
    }

    // 4. Complete client local storage purge & break resurrection reference
    currentUserRef.current = null;
    purgeAllUserLocalData(emailToDelete);

    // 5. Sign out cleanly with skipSaveAccount: true
    await logout({ skipSaveAccount: true });
    return true;
  }, [currentUser, logout]);

  const updateUserProfile = useCallback((data: Partial<UserProfile>) => {
    setCurrentUser((prev) => {
      if (!prev) return null;
      const updatedUser: UserProfile = { ...prev, ...data };
      saveAccount(updatedUser);
      try {
        localStorage.setItem("future_timeline_user", JSON.stringify(updatedUser));
      } catch (e) {}
      syncUserToFirestore(updatedUser);
      return updatedUser;
    });
  }, [syncUserToFirestore]);

  const openAuthModal = useCallback(() => setUserAuthModalOpen(true), []);
  const openCreditStore = useCallback(() => setCreditStoreModalOpen(true), []);

  const openUpsellModal = useCallback((title?: string, desc?: string) => {
    if (title) setUpsellContextTitle(title);
    if (desc) setUpsellContextDesc(desc);
    setUpsellModalOpen(true);
  }, []);

  const closeUpsellModal = useCallback(() => setUpsellModalOpen(false), []);

  const checkDailyLimit = useCallback((feature: FeatureKey): boolean => {
    return isFeatureDailyLimitReached(feature, plan, currentUser?.email || "guest");
  }, [plan, currentUser]);

  const getRemainingDailyLimitCallback = useCallback((feature: FeatureKey): number => {
    return getRemainingDailyUsage(feature, plan, currentUser?.email || "guest");
  }, [plan, currentUser]);

  const recordFeatureConsumption = useCallback((feature: FeatureKey) => {
    recordFeatureDailyUsage(feature, currentUser?.email || "guest");
  }, [currentUser]);

  const deductCredits = useCallback((amount: number, feature?: FeatureKey): boolean => {
    if (!currentUser) {
      openUpsellModal("Giriş Yapılması Gerekli", "Gelecek simülasyonları çalıştırmak ve analiz raporu oluşturmak için hesabınızla oturum açın (Günlük çark ve video izleme ile ücretsiz kredi kazanabilirsiniz).");
      return false;
    }

    const isSuperAdmin = currentUser.role === "superadmin" || (currentUser.email || "").toLowerCase().trim() === "warfacelove46@gmail.com";

    // 1. Technical Rate Limit
    if (feature) {
      const rateLimitCheck = checkRateLimit(feature, currentUser.email);
      if (!rateLimitCheck.allowed) {
        alert(`Teknik Rate Limit: Spam ve sistem yükü koruması aktif. Lütfen ${rateLimitCheck.remainingSeconds} saniye bekleyin.`);
        return false;
      }
    }

    // 2. Check if user has free daily quota available for this feature
    if (feature) {
      const remainingFree = getRemainingDailyUsage(feature, plan, currentUser.email);
      if (remainingFree > 0) {
        recordFeatureDailyUsage(feature, currentUser.email);
        recordRateLimitTimestamp(feature, currentUser.email);
        return true;
      }
    }

    // 3. Free daily quota exhausted -> Verify Balance
    const currentCreds = currentUser.credits ?? 0;
    if (currentCreds < amount && !isSuperAdmin) {
      setCreditStoreModalOpen(true);
      return false;
    }

    // Server-Authoritative Architecture:
    // AI features make API requests to /api/gemini/..., where server.ts middleware
    // atomically reserves and commits credits in Firestore, then returns the authoritative
    // remainingCredits via response body (handled automatically by notifyClientCreditsUpdated).
    // To prevent double deduction, client only preemptively mutates local balance
    // for purely offline/client-only features (e.g. community_submission).
    const isClientOnlyOperation = feature === "community_submission";

    if (isClientOnlyOperation) {
      const newCredits = isSuperAdmin ? 9999 : Math.max(0, currentCreds - amount);
      const updatedUser: UserProfile = {
        ...currentUser,
        credits: newCredits,
      };

      saveAccount(updatedUser);
      setCurrentUser(updatedUser);
      syncUserToFirestore(updatedUser, {
        delta: -amount,
        reason: `Özellik Harcaması: ${feature || "Topluluk Gönderisi"}`,
        feature: feature || "community_submission",
      });
    }

    if (feature) {
      recordFeatureDailyUsage(feature, currentUser.email);
      recordRateLimitTimestamp(feature, currentUser.email);
    }

    return true;
  }, [currentUser, plan, openUpsellModal, syncUserToFirestore]);

  const addCredits = useCallback((amount: number) => {
    if (!currentUser) {
      setUserAuthModalOpen(true);
      return;
    }

    const currentCreds = currentUser.credits ?? 0;
    const isSuper = (currentUser.email || "").toLowerCase().trim() === "warfacelove46@gmail.com";
    const updatedUser: UserProfile = {
      ...currentUser,
      credits: isSuper ? 9999 : currentCreds + amount,
    };

    saveAccount(updatedUser);
    setCurrentUser(updatedUser);
    syncUserToFirestore(updatedUser, {
      delta: amount,
      reason: "Kredi Satın Alma / İade / Bonus Yükleme",
    });
  }, [currentUser, syncUserToFirestore]);

  const upgradePlan = useCallback((newPlan: "free" | "pro" | "quantum_vip", addedCredits: number) => {
    if (!currentUser) {
      setUserAuthModalOpen(true);
      return;
    }

    const currentCreds = currentUser.credits ?? 0;
    const isSuper = (currentUser.email || "").toLowerCase().trim() === "warfacelove46@gmail.com";
    const updatedUser: UserProfile = {
      ...currentUser,
      plan: newPlan,
      credits: isSuper ? 9999 : currentCreds + addedCredits,
    };

    saveAccount(updatedUser);
    setCurrentUser(updatedUser);
    syncUserToFirestore(updatedUser, {
      delta: addedCredits,
      reason: `Üyelik Paketi Yükseltme: ${newPlan}`,
    });
  }, [currentUser, syncUserToFirestore]);

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        pendingVerificationUser,
        authStatus,
        isAuthorized,
        isGuest,
        credits,
        plan,
        isSessionLocked,
        sessionLockReason,
        lockSession,
        unlockSession,
        checkDailyLimit,
        getRemainingDailyLimit: getRemainingDailyLimitCallback,
        recordFeatureConsumption,
        userAuthModalOpen,
        creditStoreModalOpen,
        upsellModalOpen,
        bannedModalOpen,
        banReasonState,
        upsellContextTitle,
        upsellContextDesc,
        setUserAuthModalOpen,
        setCreditStoreModalOpen,
        setUpsellModalOpen,
        setBannedModalOpen,
        openAuthModal,
        openCreditStore,
        openUpsellModal,
        closeUpsellModal,
        setPendingVerificationUser,
        login,
        logout,
        deleteCurrentUserAccount,
        updateUserProfile,
        deductCredits,
        addCredits,
        upgradePlan,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
