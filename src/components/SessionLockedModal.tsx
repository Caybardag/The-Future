import React, { useState } from "react";
import { Lock, ShieldAlert, WifiOff, Clock, RefreshCw, LogOut, KeyRound, User, CheckCircle2, AlertCircle } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useLanguage } from "../context/LanguageContext";
import { auth, googleProvider, signInWithPopup, db, doc, getDoc, setDoc } from "../lib/firebase";
import { UserProfile } from "./UserAuthModal";
import { getAccountByEmail, registerOrGetAccount, saveAccount } from "../utils/userAccounts";

export const SessionLockedModal: React.FC = () => {
  const {
    currentUser,
    isSessionLocked,
    sessionLockReason,
    unlockSession,
    login,
    logout,
    openAuthModal,
    setPendingVerificationUser,
  } = useAuth();
  const { language } = useLanguage();
  const isTr = language === "tr";

  const [isReauthenticating, setIsReauthenticating] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!isSessionLocked || !currentUser) {
    return null;
  }

  const handleQuickReauth = async () => {
    setIsReauthenticating(true);
    setErrorMessage(null);

    try {
      // 1. Google OAuth Popup Re-Authentication / Account Selection
      const result = await signInWithPopup(auth, googleProvider);
      if (result && result.user) {
        const fbUser = result.user;
        try {
          const freshToken = await fbUser.getIdToken();
          if (freshToken) {
            localStorage.setItem("future_user_session_token", freshToken);
          }
        } catch {}
        const googleEmail = (fbUser.email || "").trim().toLowerCase();
        const isSuper = googleEmail === "warfacelove46@gmail.com";
        const googleName = fbUser.displayName || currentUser.fullName || "Google User";

        // Fetch Firestore profile for this specific Google user
        const userRef = doc(db, "users", fbUser.uid);
        let activeUser: UserProfile;

        // Check if email is in banned_emails
        if (!isSuper) {
          try {
            const emailKey = googleEmail.replace(/[@.]/g, "_");
            const bannedRef = doc(db, "banned_emails", emailKey);
            const bSnap = await getDoc(bannedRef);
            if (bSnap.exists() && bSnap.data()?.isBanned) {
              await auth.signOut();
              logout();
              setErrorMessage(
                isTr
                  ? `⛔ Bu hesap yönetici tarafından askıya alınmıştır: ${bSnap.data()?.banReason || "Kullanıcı kuralları ihlali"}`
                  : `⛔ This account has been banned: ${bSnap.data()?.banReason || "Terms violation"}`
              );
              setIsReauthenticating(false);
              return;
            }
          } catch (e) {}
        }

        try {
          const docSnap = await getDoc(userRef);
          if (docSnap.exists()) {
            const data = docSnap.data();

            if (!isSuper && data.isBanned) {
              await auth.signOut();
              logout();
              setErrorMessage(
                isTr
                  ? `⛔ Bu hesap yönetici tarafından askıya alınmıştır: ${data.banReason || "Kullanıcı kuralları ihlali"}`
                  : `⛔ This account has been banned: ${data.banReason || "Terms violation"}`
              );
              setIsReauthenticating(false);
              return;
            }

            activeUser = {
              id: fbUser.uid,
              fullName: data.fullName || googleName,
              email: googleEmail,
              phone: data.phone || (isSuper ? "+90 (Süper Yetki)" : ""),
              role: isSuper ? "superadmin" : (data.role || "user"),
              isEmailVerified: true,
              isPhoneVerified: true,
              joinedDate: data.joinedDate || new Date().toISOString(),
              credits: isSuper ? 9999 : (data.credits ?? 0),
              plan: isSuper ? "quantum_vip" : (data.plan || "free"),
              isBanned: data.isBanned ?? false,
              banReason: data.banReason,
              avatarUrl: fbUser.photoURL || undefined,
            };
          } else {
            activeUser = {
              id: fbUser.uid,
              fullName: isSuper ? "Süper Yönetici" : googleName,
              email: googleEmail,
              phone: isSuper ? "+90 (Süper Yetki)" : "",
              role: isSuper ? "superadmin" : "user",
              isEmailVerified: true,
              isPhoneVerified: true,
              joinedDate: new Date().toISOString(),
              credits: isSuper ? 9999 : 0,
              plan: isSuper ? "quantum_vip" : "free",
              isBanned: false,
              avatarUrl: fbUser.photoURL || undefined,
            };
            await setDoc(userRef, activeUser);
          }
        } catch (e) {
          activeUser = registerOrGetAccount(googleEmail, googleName, "", isSuper ? 9999 : 50, isSuper);
        }

        if (!isSuper && activeUser.isBanned) {
          await auth.signOut();
          logout();
          setErrorMessage(
            isTr
              ? `⛔ Bu hesap askıya alınmıştır: ${activeUser.banReason || "Kullanıcı kuralları ihlali"}`
              : `⛔ This account is banned: ${activeUser.banReason || "Terms violation"}`
          );
          setIsReauthenticating(false);
          return;
        }

        // Log in and unlock session
        login(activeUser);
        await unlockSession();
        setIsReauthenticating(false);
        return;
      }

      // 2. Direct token refresh fallback
      const unlocked = await unlockSession();
      if (unlocked) {
        setIsReauthenticating(false);
      } else {
        setErrorMessage(
          isTr
            ? "Oturum otomatik açılamadı. Lütfen 'Farklı Hesapla Gir' veya 'Güvenli Çıkış' seçeneğiyle tekrar giriş yapın."
            : "Session could not be unlocked automatically. Please sign in again."
        );
        setIsReauthenticating(false);
      }
    } catch (err: any) {
      if (err.code === "auth/popup-closed-by-user") {
        setErrorMessage(
          isTr
            ? "Giriş penceresi kapatıldı. Oturumu açmak için lütfen tekrar deneyin."
            : "Popup closed. Please try again to unlock."
        );
      } else {
        setErrorMessage(
          err.message ||
            (isTr
              ? "Oturum açılamadı. Lütfen tekrar deneyin."
              : "Failed to unlock session. Please try again.")
        );
      }
      setIsReauthenticating(false);
    }
  };

  const handleManualLogin = () => {
    logout();
    openAuthModal();
  };

  const getReasonDetails = () => {
    switch (sessionLockReason) {
      case "token_expired":
        return {
          title: isTr ? "Oturum Süreniz Doldu" : "Session Expired",
          desc: isTr
            ? "Hesap güvenliğiniz için oturumunuz duraklatıldı. Kaldığınız yerden devam etmek için oturumu yeniden açın."
            : "Your session was paused for account security. Unlock your workspace to continue where you left off.",
          icon: <Clock className="w-5 h-5 text-amber-400" />,
          badgeBg: "bg-amber-500/10 border-amber-500/30 text-amber-300",
        };
      case "connectivity_lost":
        return {
          title: isTr ? "Ağ Bağlantısı Kesildi" : "Network Connection Lost",
          desc: isTr
            ? "İnternet veya sunucu bağlantısı geçici olarak koptu. Verilerinizin kaybolmaması için ekran kilitlendi."
            : "Connection to the cloud was temporarily lost. Screen locked to protect your data.",
          icon: <WifiOff className="w-5 h-5 text-rose-400" />,
          badgeBg: "bg-rose-500/10 border-rose-500/30 text-rose-300",
        };
      case "inactivity":
        return {
          title: isTr ? "Hareketsizlik Nedeniyle Kilitlendi" : "Locked Due to Inactivity",
          desc: isTr
            ? "Uzun süre işlem yapılmadığı için çalışma alanınız güvenlik amacıyla korumaya alındı."
            : "Your workspace was locked due to inactivity to protect your account.",
          icon: <Lock className="w-5 h-5 text-cyan-400" />,
          badgeBg: "bg-cyan-500/10 border-cyan-500/30 text-cyan-300",
        };
      default:
        return {
          title: isTr ? "Oturum Güvenliği Kilitlendi" : "Security Lock",
          desc: isTr
            ? "Hesap güvenliğiniz için ekran kilitlendi. Devam etmek için oturumunuzu açın."
            : "Workspace locked for security. Please unlock to continue.",
          icon: <ShieldAlert className="w-5 h-5 text-indigo-400" />,
          badgeBg: "bg-indigo-500/10 border-indigo-500/30 text-indigo-300",
        };
    }
  };

  const reasonInfo = getReasonDetails();

  return (
    <div className="fixed inset-0 z-100 flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-xl animate-in fade-in duration-300">
      <div className="relative w-full max-w-lg rounded-3xl bg-slate-900 border border-cyan-500/30 shadow-2xl p-6 sm:p-8 space-y-6 overflow-hidden">
        {/* Ambient Top Glow */}
        <div className="absolute -top-24 -left-24 w-48 h-48 bg-cyan-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 w-48 h-48 bg-rose-500/15 rounded-full blur-3xl pointer-events-none" />

        {/* Lock Header */}
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-cyan-500/10 border border-cyan-400/30 flex items-center justify-center shadow-lg shadow-cyan-500/10 shrink-0">
            <Lock className="w-7 h-7 text-cyan-400 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-400/30">
                {isTr ? "VERİ GÜVENLİĞİ MODU" : "DATA SECURITY LOCK"}
              </span>
            </div>
            <h2 className="text-xl font-bold text-white tracking-tight mt-1">
              {isTr ? "Oturum Güvenliği Kilitlendi" : "Session Securely Locked"}
            </h2>
          </div>
        </div>

        {/* Reason Alert Banner */}
        <div className={`p-4 rounded-2xl border ${reasonInfo.badgeBg} flex items-start gap-3`}>
          <div className="shrink-0 mt-0.5">{reasonInfo.icon}</div>
          <div className="space-y-1 text-sm">
            <p className="font-bold text-white">{reasonInfo.title}</p>
            <p className="text-xs text-slate-300 leading-relaxed">{reasonInfo.desc}</p>
          </div>
        </div>

        {/* User Workspace Info Card */}
        <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800/80 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-cyan-300 font-bold font-mono">
              {currentUser.fullName ? currentUser.fullName[0].toUpperCase() : "U"}
            </div>
            <div>
              <p className="text-sm font-bold text-white leading-snug">{currentUser.fullName || "Kullanıcı"}</p>
              <p className="text-xs text-slate-400 font-mono truncate max-w-[200px] sm:max-w-xs">{currentUser.email}</p>
            </div>
          </div>
          <div className="text-right font-mono">
            <span className="text-xs text-cyan-400 font-bold block">{currentUser.credits ?? 0} Kredi</span>
            <span className="text-[10px] text-slate-400 uppercase tracking-wider">{currentUser.plan || "free"}</span>
          </div>
        </div>

        {/* Error Feedback */}
        {errorMessage && (
          <div className="p-3.5 rounded-xl bg-rose-950/50 border border-rose-500/30 text-rose-300 text-xs flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
            <p className="leading-relaxed">{errorMessage}</p>
          </div>
        )}

        {/* Action Controls */}
        <div className="space-y-3 pt-1">
          <button
            type="button"
            onClick={handleQuickReauth}
            disabled={isReauthenticating}
            className="w-full py-3.5 px-5 rounded-2xl bg-cyan-500 hover:bg-cyan-400 disabled:opacity-50 text-slate-950 font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-cyan-500/20 cursor-pointer transition-all hover:scale-[1.01] active:scale-[0.99]"
          >
            <RefreshCw className={`w-4 h-4 ${isReauthenticating ? "animate-spin" : ""}`} />
            <span>
              {isReauthenticating
                ? isTr
                  ? "Açılıyor..."
                  : "Unlocking..."
                : isTr
                ? "Oturumu Aç & Devam Et"
                : "Unlock & Continue"}
            </span>
          </button>

          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={handleManualLogin}
              className="py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium text-xs flex items-center justify-center gap-2 border border-slate-700 cursor-pointer transition-colors"
            >
              <KeyRound className="w-3.5 h-3.5 text-cyan-400" />
              <span>{isTr ? "Farklı Hesapla Gir" : "Switch Account"}</span>
            </button>

            <button
              type="button"
              onClick={() => logout()}
              className="py-2.5 px-4 rounded-xl bg-rose-950/40 hover:bg-rose-900/60 text-rose-300 font-medium text-xs flex items-center justify-center gap-2 border border-rose-800/40 cursor-pointer transition-colors"
            >
              <LogOut className="w-3.5 h-3.5 text-rose-400" />
              <span>{isTr ? "Güvenli Çıkış Yap" : "Safe Logout"}</span>
            </button>
          </div>
        </div>

        {/* Footer Security Notice */}
        <p className="text-center text-[11px] text-slate-400 font-mono">
          🔒 {isTr ? "256-bit Uçtan Uca Şifrelenmiş Oturum Koruması" : "256-bit End-to-End Encrypted Session Guard"}
        </p>
      </div>
    </div>
  );
};
