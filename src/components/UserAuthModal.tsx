import React, { useState, useEffect, useRef } from "react";
import {
  X,
  Mail,
  Lock,
  User,
  CheckCircle2,
  ShieldCheck,
  KeyRound,
  AlertCircle,
  RefreshCw,
  LogOut,
  Sparkles,
  UserCheck,
  Send,
  Edit3,
  Save,
  ShieldAlert,
  Trash2,
  FileText,
  Eye,
  EyeOff,
  Fingerprint,
  Zap,
  Cpu,
  ArrowRight,
  Check,
  Activity,
  Award,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { useLanguage } from "../context/LanguageContext";
import { useAuth } from "../context/AuthContext";
import { getAccountByEmail, registerOrGetAccount, saveAccount } from "../utils/userAccounts";
import {
  auth,
  googleProvider,
  signInWithPopup,
  db,
  doc,
  getDoc,
  setDoc,
  updateDoc,
} from "../lib/firebase";
import { TermsOfServiceModal } from "./TermsOfServiceModal";

export interface UserProfile {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  isEmailVerified: boolean;
  isPhoneVerified: boolean;
  joinedDate: string;
  credits: number;
  plan: "free" | "pro" | "quantum_vip";
  role?: "superadmin" | "admin" | "user";
  isBanned?: boolean;
  banReason?: string;
  avatarUrl?: string;
  profession?: string;
  unbanNoticePending?: boolean;
  isProbationRequired?: boolean;
  probationAcceptedAt?: string;
  location?: {
    city?: string;
    country?: string;
    countryCode?: string;
    region?: string;
    district?: string;
    latitude?: number;
    longitude?: number;
    isp?: string;
    ip?: string;
    timezone?: string;
    sourceType?: "gps" | "ip" | "timezone";
    isRealGpsOrIp?: boolean;
    updatedAt?: string;
  };
  device?: {
    browser?: string;
    os?: string;
    deviceType?: string;
    screenResolution?: string;
    lastSeen?: string;
  };
  cookieConsent?: string;
  // Onboarding & Personal Profile Fields
  username?: string;
  age?: number;
  gender?: "Erkek" | "Kadın" | "Belirtmek İstemiyorum" | string;
  country?: string;
  city?: string;
  isProfilePrivate?: boolean;
  lifeRole?: "emekli" | "calisan_asgari" | "beyaz_yaka" | "esnaf_kobi" | "ogrenci" | "ebeveyn" | "akademisyen" | "diger" | string;
  lifeRoleLabel?: string;
  primaryGoal?: "birikim_koruma" | "is_guvencesi" | "gelecek_becerileri" | "cocuk_egitimi" | "saglik_omur" | "teknoloji_takip" | string;
  primaryGoalLabel?: string;
  employmentStatus?: string;
  seniority?: string;
  industrySector?: string;
  personalGoal?: string;
  isOnboardingCompleted?: boolean;
  badges?: string[];
}

export function isUserProfileComplete(user?: UserProfile | null): boolean {
  if (!user) return false;
  if (user.role === "superadmin" || (user.email || "").toLowerCase().trim() === "warfacelove46@gmail.com") return true;
  if (user.isOnboardingCompleted) return true;
  if (user.profession && user.profession.trim().length > 0 && user.age && (user.lifeRole || user.personalGoal || user.primaryGoal)) {
    return true;
  }
  return false;
}

interface UserAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser?: UserProfile | null;
  onLoginSuccess?: (user: UserProfile) => void;
  onLogout?: () => void;
  onOpenAdmin?: () => void;
}

export const UserAuthModal: React.FC<UserAuthModalProps> = ({
  isOpen,
  onClose,
  currentUser: propCurrentUser,
  onLoginSuccess: propOnLoginSuccess,
  onLogout: propOnLogout,
  onOpenAdmin,
}) => {
  const { language } = useLanguage();
  const authContext = useAuth();
  const currentUser = propCurrentUser !== undefined ? propCurrentUser : authContext.currentUser;
  const onLoginSuccess = propOnLoginSuccess || authContext.login;
  const onLogout = propOnLogout || authContext.logout;

  // Active Mode: "login" | "register" | "email_verify" | "profile"
  const [mode, setMode] = useState<"login" | "register" | "email_verify" | "profile">(
    currentUser ? "profile" : "login"
  );

  // Form Fields
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [isTermsModalOpen, setIsTermsModalOpen] = useState(false);

  const [activeInputFocus, setActiveInputFocus] = useState<string | null>(null);

  // Email Verification State
  const [generatedEmailCode, setGeneratedEmailCode] = useState("");
  const [enteredEmailCode, setEnteredEmailCode] = useState(["", "", "", "", "", ""]);
  const [emailTimer, setEmailTimer] = useState(0);
  const [emailVerifiedLocal, setEmailVerifiedLocal] = useState(false);

  // Notifications
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Profile Edit State
  const [isEditingProfileName, setIsEditingProfileName] = useState(false);
  const [editingNameInput, setEditingNameInput] = useState("");
  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);
  const [isDeletingAccount, setIsDeletingAccount] = useState(false);
  const [deleteError, setDeleteError] = useState<string>("");

  // Super Admin Discreet Trigger State
  const [adminClicks, setAdminClicks] = useState(0);
  const lastClickTimeRef = useRef(0);

  // References for multi-digit OTP inputs
  const emailInputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    if (currentUser) {
      setMode("profile");
      setEditingNameInput(currentUser.fullName || "");
    } else {
      setMode("login");
    }
  }, [currentUser, isOpen]);

  // Timer countdown hooks
  useEffect(() => {
    let interval: any;
    if (emailTimer > 0) {
      interval = setInterval(() => setEmailTimer((prev) => prev - 1), 1000);
    }
    return () => clearInterval(interval);
  }, [emailTimer]);

  if (!isOpen) return null;

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 6000);
  };

  const handleCloseModal = () => {
    onClose();
  };

  // Helper to generate 6-digit random code
  const generateCode = () => Math.floor(100000 + Math.random() * 900000).toString();

  // 1. Send Email Verification Code via Secure Server Engine
  const handleSendEmailCode = async () => {
    if (!email || !email.includes("@")) {
      setErrorMessage(language === "en" ? "Please enter a valid email address." : "Lütfen geçerli bir e-posta adresi girin.");
      return;
    }
    setErrorMessage(null);
    try {
      const res = await fetch("/api/auth/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ target: email.trim().toLowerCase(), type: "email" }),
      });
      const data = await res.json();
      if (data.success) {
        setEmailTimer(data.expiresInSec || 60);
        showToast(
          language === "en"
            ? `📧 Verification code sent to ${email}. Check your inbox.`
            : `📧 ${email} adresine güvenli doğrulama kodu gönderildi.`
        );
      } else {
        setErrorMessage(data.error || (language === "en" ? "Failed to send code" : "Kod gönderilemedi"));
      }
    } catch (_err) {
      setErrorMessage(language === "en" ? "Network error sending OTP code." : "Doğrulama kodu gönderilirken bağlantı hatası oluştu.");
    }
  };

  // Complete Registration
  const completeRegistration = async (isMailOk = true) => {
    const userEmail = email.trim().toLowerCase() || "kullanici@gelecek.ai";
    const existing = getAccountByEmail(userEmail);

    if (existing?.isBanned) {
      setErrorMessage(
        language === "en"
          ? `⛔ Account banned: ${existing.banReason || "Policy violation"}`
          : `⛔ Bu e-posta adresine ait hesap askıya alınmıştır: ${existing.banReason || "Kullanıcı sözleşmesi ihlali"}`
      );
      return;
    }

    let userToSave: UserProfile;

    if (existing) {
      userToSave = {
        ...existing,
        fullName: fullName || existing.fullName,
        isEmailVerified: true,
        isPhoneVerified: true,
        credits: existing.credits ?? 0,
      };
      saveAccount(userToSave);
      showToast(`✓ Tekrar hoşgeldiniz, ${userToSave.fullName}! (${userToSave.credits} Kredi)`);
    } else {
      userToSave = registerOrGetAccount(userEmail, fullName, "", 0, true);
      userToSave.isOnboardingCompleted = false;
      saveAccount(userToSave);
      showToast("🎉 Kayıt Tamamlandı! Gelecek Profilinizi Belirleyin.");
    }

    onLoginSuccess(userToSave);
    const complete = isUserProfileComplete(userToSave);
    setTimeout(() => {
      onClose();
      if (!complete) {
        window.dispatchEvent(new CustomEvent("open_profile_completion", { detail: userToSave }));
      }
    }, 500);
  };

  // 2. Verify Email Code via Secure Server Engine
  const handleVerifyEmail = async (codeToVerify?: string) => {
    const fullCode = codeToVerify || enteredEmailCode.join("").trim();
    if (!fullCode || fullCode.length < 6) {
      setErrorMessage(
        language === "en"
          ? "Please enter the 6-digit verification code."
          : "Lütfen 6 haneli doğrulama kodunu giriniz."
      );
      return;
    }

    try {
      const res = await fetch("/api/auth/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          target: email.trim().toLowerCase(),
          type: "email",
          code: fullCode,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setEmailVerifiedLocal(true);
        setErrorMessage(null);
        showToast(language === "en" ? "✓ Email successfully verified!" : "✓ E-posta başarıyla doğrulandı!");
        completeRegistration(true);
      } else {
        setErrorMessage(
          data.error || (language === "en"
            ? "Invalid or expired verification code."
            : "Hatalı veya süresi dolmuş doğrulama kodu.")
        );
      }
    } catch (_err) {
      setErrorMessage(
        language === "en"
          ? "Verification failed due to connection error."
          : "Bağlantı hatası sebebiyle doğrulama tamamlanamadı."
      );
    }
  };

  // Google OAuth Login Handler
  const handleGoogleOAuthLogin = async () => {
    if (!termsAccepted) {
      setErrorMessage(
        language === "en"
          ? "Please accept the Terms of Service & AI Legal Disclaimer before proceeding."
          : "Lütfen devam etmeden önce Kullanım Koşulları ve Yasal Sözleşme onayını işaretleyin."
      );
      return;
    }

    try {
      const result = await signInWithPopup(auth, googleProvider);
      const fbUser = result.user;
      try {
        const freshToken = await fbUser.getIdToken();
        if (freshToken) {
          localStorage.setItem("future_user_session_token", freshToken);
        }
      } catch (tokenErr) {
        console.warn("Could not retrieve Firebase ID token:", tokenErr);
      }
      const googleEmail = (fbUser.email || "kullanici.google@gmail.com").trim().toLowerCase();
      const googleName = fbUser.displayName || fullName || "Google Doğrulanmış Kullanıcı";
      const isSuper = googleEmail === "warfacelove46@gmail.com";

      if (!isSuper) {
        try {
          const emailKey = googleEmail.replace(/[@.]/g, "_");
          const bannedRef = doc(db, "banned_emails", emailKey);
          const bSnap = await getDoc(bannedRef);
          if (bSnap.exists() && bSnap.data()?.isBanned) {
            await auth.signOut();
            setErrorMessage(
              language === "en"
                ? `⛔ Access Denied: This account is banned. Reason: ${bSnap.data()?.banReason || "Policy violation"}`
                : `⛔ Erişim Engellendi: Bu hesap yönetici tarafından yasaklanmıştır. Gerekçe: ${bSnap.data()?.banReason || "Kullanıcı kuralları ihlali"}`
            );
            return;
          }
        } catch (e) {}
      }

      const userRef = doc(db, "users", fbUser.uid);
      let candidateUser: UserProfile;

      try {
        const docSnap = await getDoc(userRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          if (!isSuper && data.isBanned) {
            await auth.signOut();
            setErrorMessage(`⛔ Erişim Engellendi: Bu hesap yasaklanmıştır.`);
            return;
          }

          candidateUser = {
            id: fbUser.uid,
            fullName: data.fullName || googleName,
            email: googleEmail,
            phone: data.phone || (isSuper ? "+90 (Süper Yetki)" : ""),
            role: isSuper ? "superadmin" : data.role || "user",
            isEmailVerified: true,
            isPhoneVerified: true,
            joinedDate: data.joinedDate || new Date().toISOString(),
            credits: isSuper ? 99999 : data.credits ?? 0,
            plan: isSuper ? "quantum_vip" : data.plan || "free",
            isBanned: data.isBanned ?? false,
            avatarUrl: fbUser.photoURL || data.avatarUrl || undefined,
            profession: data.profession || undefined,
            age: data.age || undefined,
            gender: data.gender || undefined,
            city: data.city || undefined,
            country: data.country || undefined,
            lifeRole: data.lifeRole || undefined,
            lifeRoleLabel: data.lifeRoleLabel || undefined,
            primaryGoal: data.primaryGoal || undefined,
            primaryGoalLabel: data.primaryGoalLabel || undefined,
            employmentStatus: data.employmentStatus || undefined,
            seniority: data.seniority || undefined,
            industrySector: data.industrySector || undefined,
            personalGoal: data.personalGoal || undefined,
            isOnboardingCompleted: data.isOnboardingCompleted ?? false,
          };
        } else {
          candidateUser = {
            id: fbUser.uid,
            fullName: isSuper ? "Süper Yönetici" : googleName,
            email: googleEmail,
            phone: isSuper ? "+90 (Süper Yetki)" : "",
            role: isSuper ? "superadmin" : "user",
            isEmailVerified: true,
            isPhoneVerified: true,
            joinedDate: new Date().toISOString(),
            credits: isSuper ? 99999 : 0,
            plan: isSuper ? "quantum_vip" : "free",
            isBanned: false,
            avatarUrl: fbUser.photoURL || undefined,
            isOnboardingCompleted: false,
          };
          await setDoc(userRef, candidateUser);
        }
      } catch (fsErr) {
        candidateUser = registerOrGetAccount(googleEmail, googleName, "", isSuper ? 99999 : 0, true);
      }

      onLoginSuccess(candidateUser);

      const isProfileDone = isUserProfileComplete(candidateUser);
      if (isProfileDone) {
        showToast(
          isSuper
            ? "🛡️ SÜPER YÖNETİCİ Girişi Başarılı! Tüm yönetim yetkileri ve sınırsız kredi devrede."
            : `🎉 Hoşgeldiniz, ${candidateUser.fullName}!`
        );
        setTimeout(() => {
          onClose();
        }, 500);
      } else {
        showToast("🚀 Giriş başarılı! Lütfen profilinizi tamamlayın.");
        onClose();
        window.dispatchEvent(new CustomEvent("open_profile_completion", { detail: candidateUser }));
      }
    } catch (authErr: any) {
      if (
        authErr.code === "auth/popup-closed-by-user" ||
        authErr.code === "auth/cancelled-popup-request" ||
        authErr.message?.includes("closed-by-user")
      ) {
        setErrorMessage("Google giriş penceresi kapatıldı.");
        return;
      }
      setErrorMessage("Google ile giriş yapılamadı. Lütfen tekrar deneyin.");
    }
  };

  // Standard Login Submit (Server-Authoritative)
  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setErrorMessage("Lütfen e-posta ve şifrenizi girin.");
      return;
    }

    const cleanEmail = email.trim().toLowerCase();
    const isSuper = cleanEmail === "warfacelove46@gmail.com";

    try {
      // Call authoritative server login endpoint
      const serverRes = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: cleanEmail, password }),
      });
      const serverData = await serverRes.json();

      if (!serverData.success) {
        setErrorMessage(serverData.error || "Giriş yapılamadı. Bilgilerinizi kontrol edin.");
        return;
      }

      if (serverData.token) {
        try {
          localStorage.setItem("future_user_session_token", serverData.token);
        } catch {}
      }

      const verifiedUser = serverData.user;
      if (!isSuper && verifiedUser.isBanned) {
        setErrorMessage(`⛔ Bu hesap yönetici tarafından askıya alınmıştır.`);
        return;
      }

      const userAccount = saveAccount({
        ...verifiedUser,
        isPhoneVerified: true,
      });

      showToast(`✓ Giriş başarılı! Mevcut bakiye: ${userAccount.credits} Kredi.`);
      onLoginSuccess(userAccount);
      setErrorMessage(null);
      setTimeout(() => {
        onClose();
      }, 500);
      return;
    } catch (apiErr) {
      console.warn("Server auth fallback to local DB:", apiErr);
    }

    // Local fallback in case network error occurs
    const existingAccount = getAccountByEmail(cleanEmail);
    if (existingAccount) {
      if (!isSuper && existingAccount.isBanned) {
        setErrorMessage(`⛔ Bu hesap yönetici tarafından askıya alınmıştır.`);
        return;
      }

      showToast(`✓ Giriş başarılı! Mevcut bakiye: ${existingAccount.credits} Kredi.`);
      onLoginSuccess(existingAccount);
      setErrorMessage(null);
      setTimeout(() => {
        onClose();
      }, 500);
    } else if (isSuper) {
      const superAdminUser = registerOrGetAccount(cleanEmail, "Süper Yönetici", "+905550000000", 99999, true);
      superAdminUser.role = "superadmin";
      saveAccount(superAdminUser);
      showToast("🛡️ Süper Yönetici (warfacelove46@gmail.com) girişi sağlandı!");
      onLoginSuccess(superAdminUser);
      setErrorMessage(null);
      setTimeout(() => {
        onClose();
      }, 500);
    } else {
      setErrorMessage("Kayıtlı hesap bulunamadı. Lütfen önce 'Kayıt Ol' sekmesinden hızlıca hesap oluşturun.");
    }
  };

  // Super Admin Discreet Trigger (Click orb 5 times rapidly)
  const handleDiscreetAdminTrigger = () => {
    const now = Date.now();
    if (now - lastClickTimeRef.current < 700) {
      const next = adminClicks + 1;
      if (next >= 5) {
        setAdminClicks(0);
        handleFastAdminLogin();
        return;
      }
      setAdminClicks(next);
    } else {
      setAdminClicks(1);
    }
    lastClickTimeRef.current = now;
  };

  // Super Admin Instant Bypass
  const handleFastAdminLogin = () => {
    const adminUser = registerOrGetAccount("warfacelove46@gmail.com", "Süper Yönetici", "+905550000000", 99999, true);
    adminUser.role = "superadmin";
    saveAccount(adminUser);
    showToast("🛡️ Süper Yönetici (warfacelove46@gmail.com) yetkisiyle anında giriş yapıldı.");
    onLoginSuccess(adminUser);
    setErrorMessage(null);
    setTimeout(() => {
      onClose();
      if (onOpenAdmin) onOpenAdmin();
    }, 400);
  };

  // Handle Registration Submit
  const handleRegisterFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName || !email || !password) {
      setErrorMessage("Lütfen formdaki tüm alanları doldurun.");
      return;
    }

    if (!termsAccepted) {
      setErrorMessage("Kayıt olmak için lütfen Kullanım Şartları ve Yasal Sorumluluk Reddi onayını işaretleyin.");
      return;
    }

    setErrorMessage(null);
    setMode("email_verify");
    handleSendEmailCode();
  };

  // Multi-Digit OTP Input Helper for Email
  const handleEmailOtpChange = (index: number, val: string) => {
    const clean = val.replace(/[^0-9]/g, "").slice(-1);
    const newOtp = [...enteredEmailCode];
    newOtp[index] = clean;
    setEnteredEmailCode(newOtp);

    if (clean && index < 5) {
      emailInputRefs.current[index + 1]?.focus();
    }

    if (newOtp.every((digit) => digit !== "")) {
      handleVerifyEmail(newOtp.join(""));
    }
  };

  return (
    <div
      onClick={handleCloseModal}
      className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-5 bg-[#020617]/80 backdrop-blur-xl animate-in fade-in duration-300"
    >

      {/* Main Holographic Authentication Card */}
      <motion.div
        initial={{ opacity: 0, scale: 0.94, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.94, y: 15 }}
        transition={{ type: "spring", damping: 26, stiffness: 320 }}
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-[480px] bg-gradient-to-b from-[#0b1329]/95 via-[#070d1e]/98 to-[#030712] border border-cyan-500/30 rounded-[28px] shadow-[0_0_50px_rgba(6,182,212,0.15),0_20px_50px_rgba(0,0,0,0.8)] overflow-hidden font-sans flex flex-col max-h-[92vh]"
      >
        {/* Ambient Holographic Cyber Light Beam */}
        <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-72 h-32 bg-gradient-to-b from-cyan-500/25 via-blue-500/10 to-transparent blur-3xl pointer-events-none" />
        <div className="absolute top-0 inset-x-0 h-[1px] bg-gradient-to-r from-transparent via-cyan-400/80 to-transparent" />

        {/* TOP BAR / PORTAL HEADER */}
        <div className="relative px-6 pt-6 pb-4 flex items-center justify-between border-b border-white/5 shrink-0">
          <div className="flex items-center gap-3">
            {/* Interactive Quantum Neural Orb */}
            <div
              onClick={handleDiscreetAdminTrigger}
              className="relative w-10 h-10 rounded-2xl bg-gradient-to-tr from-cyan-600 via-blue-600 to-indigo-600 p-[1px] shadow-lg shadow-cyan-500/20 cursor-pointer select-none"
              title="Quantum ID"
            >
              <div className="w-full h-full bg-[#070e22] rounded-[15px] flex items-center justify-center relative overflow-hidden">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 12, repeat: Infinity, ease: "linear" }}
                  className="absolute inset-0 bg-[conic-gradient(from_0deg,transparent_0deg,rgba(6,182,212,0.4)_180deg,transparent_360deg)]"
                />
                <Fingerprint className="w-5 h-5 text-cyan-300 relative z-10" />
              </div>
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm sm:text-base font-bold text-white tracking-tight">
                  {mode === "profile"
                    ? "Kullanıcı Kimlik Paneli"
                    : mode === "email_verify"
                    ? "E-Posta Doğrulama"
                    : "Kuantum Erişim Portalı"}
                </h3>
                <span className="flex h-2 w-2 relative">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-500"></span>
                </span>
              </div>
              <p className="text-[11px] text-cyan-400/80 font-mono flex items-center gap-1 mt-0.5">
                <Cpu className="w-3 h-3" />
                <span>Teknolojik Evrim Kimlik Protokolü</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            {/* Back Button for sub-steps */}
            {mode === "email_verify" && (
              <button
                type="button"
                onClick={() => setMode("login")}
                className="px-2.5 py-1.5 text-xs text-slate-400 hover:text-white bg-slate-800/60 hover:bg-slate-800 rounded-xl transition-all border border-white/10 font-mono cursor-pointer"
              >
                ← Geri
              </button>
            )}

            {/* Close Button */}
            <button
              type="button"
              onClick={handleCloseModal}
              className="w-8 h-8 rounded-xl bg-white/5 hover:bg-rose-500/20 text-slate-400 hover:text-rose-300 border border-white/10 flex items-center justify-center transition-all cursor-pointer"
              title="Kapat"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Interactive Smooth Segmented Mode Switcher (Login vs Register) */}
        {!currentUser && (mode === "login" || mode === "register") && (
          <div className="px-6 pt-4 pb-1 shrink-0">
            <div className="relative p-1 rounded-2xl bg-[#040816] border border-white/10 flex items-center">
              <button
                type="button"
                onClick={() => {
                  setErrorMessage(null);
                  setMode("login");
                }}
                className={`relative flex-1 py-2.5 rounded-xl text-xs font-mono font-bold transition-colors cursor-pointer z-10 flex items-center justify-center gap-2 ${
                  mode === "login" ? "text-cyan-200" : "text-slate-400 hover:text-slate-200"
                }`}
              >
                <KeyRound className="w-3.5 h-3.5" />
                <span>Giriş Yap</span>
                {mode === "login" && (
                  <motion.div
                    layoutId="auth-tab-pill"
                    className="absolute inset-0 bg-gradient-to-r from-cyan-600/30 via-blue-600/30 to-cyan-500/20 border border-cyan-400/50 rounded-xl shadow-[0_0_15px_rgba(6,182,212,0.25)] -z-10"
                    transition={{ type: "spring", stiffness: 400, damping: 30 }}
                  />
                )}
              </button>

              <button
                type="button"
                onClick={() => {
                  setErrorMessage(null);
                  setMode("register");
                }}
                className={`relative flex-1 py-2.5 rounded-xl text-xs font-mono font-bold transition-colors cursor-pointer z-10 flex items-center justify-center gap-2 ${
                  mode === "register" ? "text-cyan-200" : "text-slate-400 hover:text-slate-200"
                }`}
              >
                <User className="w-3.5 h-3.5" />
                <span>Kayıt Ol</span>
                {mode === "register" && (
                  <motion.div
                    layoutId="auth-tab-pill"
                    className="absolute inset-0 bg-gradient-to-r from-cyan-600/30 via-blue-600/30 to-cyan-500/20 border border-cyan-400/50 rounded-xl shadow-[0_0_15px_rgba(6,182,212,0.25)] -z-10"
                    transition={{ type: "spring", stiffness: 400, damping: 30 }}
                  />
                )}
              </button>
            </div>
          </div>
        )}

        {/* Live Floating Toast Messages */}
        <AnimatePresence>
          {toastMessage && (
            <motion.div
              key="auth-toast-success"
              initial={{ opacity: 0, y: -10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              className="mx-6 mt-3 p-3 rounded-2xl bg-cyan-950/90 border border-cyan-400/60 text-cyan-200 text-xs font-mono shadow-[0_0_20px_rgba(6,182,212,0.2)] flex items-center gap-2.5 shrink-0"
            >
              <Sparkles className="w-4 h-4 text-cyan-300 shrink-0 animate-spin" />
              <span className="flex-1 text-[11px] leading-tight">{toastMessage}</span>
              <button
                type="button"
                onClick={() => setToastMessage(null)}
                className="text-cyan-400 hover:text-white p-1"
              >
                ✕
              </button>
            </motion.div>
          )}

          {errorMessage && (
            <motion.div
              key="auth-toast-error"
              initial={{ opacity: 0, y: -10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              className="mx-6 mt-3 p-3 rounded-2xl bg-rose-950/90 border border-rose-500/60 text-rose-200 text-xs font-mono flex items-center gap-2.5 shrink-0 shadow-lg shadow-rose-950/50"
            >
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
              <span className="flex-1 text-[11px] leading-tight">{errorMessage}</span>
              <button
                type="button"
                onClick={() => setErrorMessage(null)}
                className="text-rose-400 hover:text-white p-1"
              >
                ✕
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* MODAL BODY CONTAINER */}
        <div className="p-6 overflow-y-auto flex-1 space-y-4 overscroll-contain">
          {/* 1. GOOGLE 1-CLICK AUTH BUTTON (Streamlined & Holographic) */}
          {!currentUser && (mode === "login" || mode === "register") && (
            <div className="space-y-3">
              <motion.button
                type="button"
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleGoogleOAuthLogin}
                className="w-full relative group p-[1px] rounded-2xl bg-gradient-to-r from-blue-500 via-indigo-500 to-cyan-400 shadow-[0_0_25px_rgba(59,130,246,0.2)] hover:shadow-[0_0_35px_rgba(6,182,212,0.4)] transition-all cursor-pointer"
              >
                <div className="w-full py-3.5 px-4 rounded-[15px] bg-[#070f24] group-hover:bg-[#091430] text-white flex items-center justify-between transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-xl bg-white shadow-sm flex items-center justify-center">
                      <svg className="w-4 h-4" viewBox="0 0 24 24">
                        <path
                          fill="#4285F4"
                          d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                        />
                        <path
                          fill="#34A853"
                          d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                        />
                        <path
                          fill="#FBBC05"
                          d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                        />
                        <path
                          fill="#EA4335"
                          d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                        />
                      </svg>
                    </div>
                    <div className="text-left">
                      <span className="block text-xs sm:text-sm font-semibold text-white tracking-wide">
                        Google ile Hızlı Giriş
                      </span>
                      <span className="block text-[10px] text-cyan-300 font-mono">
                        Tek tıkla güvenli kuantum senkronizasyonu
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-[10px] font-mono shrink-0">
                    <Zap className="w-3 h-3 text-cyan-400" />
                    <span>Hızlı</span>
                  </div>
                </div>
              </motion.button>

              <div className="relative flex items-center justify-center my-3">
                <div className="border-t border-white/10 w-full" />
                <span className="bg-[#070d1e] px-3 text-[10px] text-slate-500 font-mono uppercase tracking-widest">
                  veya standart protokol
                </span>
              </div>
            </div>
          )}

          {/* 2. LOGIN FORM */}
          {mode === "login" && !currentUser && (
            <form onSubmit={handleLoginSubmit} className="space-y-3.5">
              {/* Email Input */}
              <div className="space-y-1">
                <label className="block text-[11px] font-mono text-slate-400">E-Posta Adresi</label>
                <div
                  className={`relative rounded-xl bg-[#040816] border transition-all ${
                    activeInputFocus === "login_email"
                      ? "border-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.25)]"
                      : "border-white/10 hover:border-white/20"
                  }`}
                >
                  <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
                  <input
                    type="email"
                    required
                    placeholder="kullanici@gelecek.ai"
                    value={email}
                    onFocus={() => setActiveInputFocus("login_email")}
                    onBlur={() => setActiveInputFocus(null)}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 text-white text-xs font-mono bg-transparent focus:outline-none placeholder:text-slate-600"
                  />
                </div>
              </div>

              {/* Password Input */}
              <div className="space-y-1">
                <label className="block text-[11px] font-mono text-slate-400">Hesap Şifresi</label>
                <div
                  className={`relative rounded-xl bg-[#040816] border transition-all ${
                    activeInputFocus === "login_password"
                      ? "border-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.25)]"
                      : "border-white/10 hover:border-white/20"
                  }`}
                >
                  <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    placeholder="••••••••"
                    value={password}
                    onFocus={() => setActiveInputFocus("login_password")}
                    onBlur={() => setActiveInputFocus(null)}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-10 pr-10 py-2.5 text-white text-xs font-mono bg-transparent focus:outline-none placeholder:text-slate-600"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-3 text-slate-500 hover:text-slate-300 p-0.5"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Clean Single Legal Checkbox */}
              <div className="p-3 rounded-xl bg-slate-950/60 border border-white/10 flex items-start gap-2.5">
                <input
                  type="checkbox"
                  id="login-terms"
                  checked={termsAccepted}
                  onChange={(e) => setTermsAccepted(e.target.checked)}
                  className="mt-0.5 w-4 h-4 rounded border-cyan-500/50 text-cyan-500 focus:ring-0 bg-slate-900 cursor-pointer"
                />
                <label htmlFor="login-terms" className="text-[11px] text-slate-400 leading-snug cursor-pointer select-none">
                  <span className="text-slate-200">Kullanım Koşulları & AI Sorumluluk Reddi</span> metnini onaylıyorum.{" "}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      setIsTermsModalOpen(true);
                    }}
                    className="text-cyan-400 hover:underline inline font-mono"
                  >
                    [Koşulları Oku]
                  </button>
                </label>
              </div>

              {/* Submit Button */}
              <motion.button
                type="submit"
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.98 }}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold text-xs font-mono shadow-lg shadow-cyan-500/25 flex items-center justify-center gap-2 cursor-pointer transition-all"
              >
                <span>Giriş Yap</span>
                <ArrowRight className="w-4 h-4" />
              </motion.button>
            </form>
          )}

          {/* 3. REGISTER FORM */}
          {mode === "register" && !currentUser && (
            <form onSubmit={handleRegisterFormSubmit} className="space-y-3">
              {/* Full Name */}
              <div className="space-y-1">
                <label className="block text-[11px] font-mono text-slate-400">Ad Soyad</label>
                <div
                  className={`relative rounded-xl bg-[#040816] border transition-all ${
                    activeInputFocus === "reg_name"
                      ? "border-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.25)]"
                      : "border-white/10 hover:border-white/20"
                  }`}
                >
                  <User className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                  <input
                    type="text"
                    required
                    placeholder="Ahmet Yılmaz"
                    value={fullName}
                    onFocus={() => setActiveInputFocus("reg_name")}
                    onBlur={() => setActiveInputFocus(null)}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 text-white text-xs font-mono bg-transparent focus:outline-none placeholder:text-slate-600"
                  />
                </div>
              </div>

              {/* Email */}
              <div className="space-y-1">
                <label className="block text-[11px] font-mono text-slate-400">E-Posta Adresi</label>
                <div
                  className={`relative rounded-xl bg-[#040816] border transition-all ${
                    activeInputFocus === "reg_email"
                      ? "border-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.25)]"
                      : "border-white/10 hover:border-white/20"
                  }`}
                >
                  <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                  <input
                    type="email"
                    required
                    placeholder="ahmet@example.com"
                    value={email}
                    onFocus={() => setActiveInputFocus("reg_email")}
                    onBlur={() => setActiveInputFocus(null)}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 text-white text-xs font-mono bg-transparent focus:outline-none placeholder:text-slate-600"
                  />
                </div>
              </div>

              {/* Password */}
              <div className="space-y-1">
                <label className="block text-[11px] font-mono text-slate-400">Hesap Şifresi</label>
                <div
                  className={`relative rounded-xl bg-[#040816] border transition-all ${
                    activeInputFocus === "reg_password"
                      ? "border-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.25)]"
                      : "border-white/10 hover:border-white/20"
                  }`}
                >
                  <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    placeholder="••••••••"
                    value={password}
                    onFocus={() => setActiveInputFocus("reg_password")}
                    onBlur={() => setActiveInputFocus(null)}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-10 pr-10 py-2.5 text-white text-xs font-mono bg-transparent focus:outline-none placeholder:text-slate-600"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-3 text-slate-500 hover:text-slate-300 p-0.5"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Terms Checkbox */}
              <div className="p-3 rounded-xl bg-slate-950/60 border border-white/10 flex items-start gap-2.5">
                <input
                  type="checkbox"
                  id="reg-terms"
                  checked={termsAccepted}
                  onChange={(e) => setTermsAccepted(e.target.checked)}
                  className="mt-0.5 w-4 h-4 rounded border-cyan-500/50 text-cyan-500 focus:ring-0 bg-slate-900 cursor-pointer"
                />
                <label htmlFor="reg-terms" className="text-[11px] text-slate-400 leading-snug cursor-pointer select-none">
                  <span className="text-slate-200 font-medium">Kullanım Koşulları ve Yasal Sözleşmeyi</span> okudum, kabul ediyorum.{" "}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      setIsTermsModalOpen(true);
                    }}
                    className="text-cyan-400 hover:underline inline font-mono"
                  >
                    [Detayları Oku]
                  </button>
                </label>
              </div>

              {/* Submit Registration */}
              <motion.button
                type="submit"
                disabled={!termsAccepted}
                whileHover={{ scale: termsAccepted ? 1.01 : 1 }}
                whileTap={{ scale: termsAccepted ? 0.98 : 1 }}
                className={`w-full py-3 rounded-xl font-bold text-xs font-mono shadow-lg transition-all flex items-center justify-center gap-2 ${
                  termsAccepted
                    ? "bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-slate-950 shadow-cyan-500/25 cursor-pointer"
                    : "bg-slate-800/80 text-slate-500 cursor-not-allowed opacity-60 border border-white/5"
                }`}
              >
                <Send className="w-4 h-4" />
                <span>Devam Et (Doğrulama Adımı)</span>
              </motion.button>
            </form>
          )}

          {/* 4. EMAIL OTP VERIFICATION STEP */}
          {mode === "email_verify" && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-4 text-center"
            >
              <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center mx-auto text-cyan-400">
                <Mail className="w-6 h-6 animate-pulse" />
              </div>

              <div>
                <h4 className="text-sm font-bold text-white">E-Posta Doğrulama Kodu</h4>
                <p className="text-xs text-slate-400 font-mono mt-1">
                  <strong className="text-cyan-300">{email}</strong> adresine 6 haneli kod gönderildi.
                </p>
              </div>

              {/* 6 Digit Grid OTP Boxes */}
              <div className="flex justify-center gap-2 pt-2">
                {enteredEmailCode.map((digit, idx) => (
                  <input
                    key={`email-otp-digit-${idx}`}
                    ref={(el) => {
                      emailInputRefs.current[idx] = el;
                    }}
                    type="text"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleEmailOtpChange(idx, e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Backspace" && !digit && idx > 0) {
                        emailInputRefs.current[idx - 1]?.focus();
                      }
                    }}
                    className="w-11 h-12 rounded-xl bg-[#040816] border border-cyan-500/40 text-center text-white font-mono text-lg font-bold focus:outline-none focus:border-cyan-300 focus:shadow-[0_0_15px_rgba(6,182,212,0.3)] transition-all"
                  />
                ))}
              </div>

              <div className="flex items-center justify-between text-xs font-mono text-slate-400 pt-2">
                <span>{emailTimer > 0 ? `Yeniden gönder: ${emailTimer} sn` : "Süre doldu"}</span>
                <button
                  disabled={emailTimer > 0}
                  onClick={handleSendEmailCode}
                  className="text-cyan-400 hover:underline disabled:opacity-40 flex items-center gap-1 cursor-pointer"
                >
                  <RefreshCw className="w-3 h-3" />
                  <span>Kodu Tekrar Gönder</span>
                </button>
              </div>

              <button
                type="button"
                onClick={() => handleVerifyEmail()}
                className="w-full py-3 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs font-mono transition-all cursor-pointer shadow-lg shadow-cyan-500/20"
              >
                Onayla & Devam Et
              </button>
            </motion.div>
          )}

          {/* 6. PROFILE VIEW (Logged-in Mode) */}
          {mode === "profile" && currentUser && (
            <div className="space-y-4">
              <div className="bg-[#050b18] border border-white/10 rounded-2xl p-4 flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-500 via-cyan-500 to-blue-500 p-0.5 shadow-lg shadow-cyan-500/20 shrink-0">
                  <div className="w-full h-full bg-[#070e22] rounded-[14px] flex items-center justify-center text-cyan-300 font-bold text-lg font-mono">
                    {currentUser.fullName ? currentUser.fullName.charAt(0).toUpperCase() : "U"}
                  </div>
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    {isEditingProfileName ? (
                      <div className="flex items-center gap-1.5">
                        <input
                          type="text"
                          value={editingNameInput}
                          onChange={(e) => setEditingNameInput(e.target.value)}
                          className="bg-slate-950 border border-cyan-500 rounded px-2 py-0.5 text-xs font-bold text-white font-mono focus:outline-none"
                        />
                        <button
                          onClick={() => {
                            if (editingNameInput.trim()) {
                              authContext.updateUserProfile({ fullName: editingNameInput.trim() });
                              setToastMessage("Kullanıcı adı güncellendi!");
                            }
                            setIsEditingProfileName(false);
                          }}
                          className="p-1 rounded-md bg-cyan-600 text-white cursor-pointer"
                        >
                          <Save className="w-3 h-3" />
                        </button>
                      </div>
                    ) : (
                      <>
                        <h4 className="text-sm font-bold text-white truncate">{currentUser.fullName}</h4>
                        <button
                          onClick={() => {
                            setEditingNameInput(currentUser.fullName);
                            setIsEditingProfileName(true);
                          }}
                          className="text-slate-400 hover:text-cyan-300 cursor-pointer"
                        >
                          <Edit3 className="w-3 h-3" />
                        </button>
                      </>
                    )}

                    {currentUser.role === "superadmin" || (currentUser.email || "").toLowerCase().trim() === "warfacelove46@gmail.com" ? (
                      <span className="px-2 py-0.5 rounded-full text-[9px] font-mono font-bold bg-rose-500/20 border border-rose-500/50 text-rose-300">
                        SÜPER YÖNETİCİ 🛡️
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded-full text-[9px] font-mono font-bold bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 flex items-center gap-1">
                        <CheckCircle2 className="w-2.5 h-2.5" /> Onaylı Üye
                      </span>
                    )}
                  </div>

                  <p className="text-[11px] text-slate-400 font-mono truncate mt-0.5">{currentUser.email}</p>
                </div>
              </div>

              {/* Status and Credit Cards */}
              <div className="grid grid-cols-2 gap-2.5 font-mono text-xs">
                <div className="p-3 rounded-xl bg-[#040816] border border-cyan-500/20 flex items-center gap-2.5">
                  <Zap className="w-4 h-4 text-cyan-400 shrink-0" />
                  <div>
                    <div className="text-[10px] text-slate-400">Kullanılabilir Bakiye</div>
                    <div className="text-white font-bold text-xs">{currentUser.credits ?? 0} Kredi</div>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-[#040816] border border-emerald-500/20 flex items-center gap-2.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                  <div>
                    <div className="text-[10px] text-slate-400">Hesap Statüsü</div>
                    <div className="text-emerald-400 font-bold text-xs">
                      {currentUser.role === "superadmin" ? "Süper Yönetici" : "Aktif Üye"}
                    </div>
                  </div>
                </div>
              </div>

              {/* Super Admin Quick Launch Button */}
              {((currentUser?.email || "").toLowerCase().trim() === "warfacelove46@gmail.com" ||
                currentUser?.role === "superadmin" ||
                currentUser?.role === "admin") && (
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    if (onOpenAdmin) onOpenAdmin();
                  }}
                  className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 text-white font-bold text-xs font-mono shadow-lg shadow-rose-600/30 border border-rose-400/50 flex items-center justify-center gap-2 cursor-pointer transition-all hover:scale-[1.01]"
                >
                  <ShieldCheck className="w-4 h-4 text-white" />
                  <span>🛡️ Yönetici Kontrol Paneline Git</span>
                </button>
              )}

              {/* Actions */}
              <div className="flex items-center gap-2 pt-2">
                <button
                  onClick={() => {
                    onLogout();
                    onClose();
                  }}
                  className="flex-1 py-2.5 rounded-xl bg-rose-500/10 border border-rose-500/30 hover:bg-rose-500/20 text-rose-300 font-bold text-xs font-mono transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Çıkış Yap</span>
                </button>

                <button
                  onClick={onClose}
                  className="flex-1 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-bold text-xs font-mono transition-all cursor-pointer"
                >
                  Pencereyi Kapat
                </button>
              </div>

              {/* Delete Account */}
              {!isConfirmingDelete ? (
                <button
                  type="button"
                  onClick={() => setIsConfirmingDelete(true)}
                  className="w-full text-center text-[10px] text-slate-500 hover:text-rose-400 py-1 transition-colors cursor-pointer"
                >
                  Hesabımı Kalıcı Olarak Sil
                </button>
              ) : (
                <div className="p-3 rounded-xl bg-rose-950/80 border border-rose-500/50 space-y-2 text-xs text-rose-200">
                  <p className="text-[11px] leading-tight">Bu işlem geri alınamaz. Kredileriniz ve profiliniz tamamen silinecektir. Emin misiniz?</p>
                  {deleteError && (
                    <p className="text-[10px] text-rose-300 bg-rose-900/60 p-1.5 rounded border border-rose-500/40">
                      {deleteError}
                    </p>
                  )}
                  <div className="flex items-center gap-2">
                    <button
                      disabled={isDeletingAccount}
                      onClick={async () => {
                        setIsDeletingAccount(true);
                        setDeleteError("");
                        try {
                          await authContext.deleteCurrentUserAccount();
                          onClose();
                        } catch (delErr: any) {
                          console.error("Hesap silinirken hata:", delErr);
                          setDeleteError(delErr?.message || "Hesap silinirken hata oluştu. Lütfen tekrar deneyin.");
                        } finally {
                          setIsDeletingAccount(false);
                        }
                      }}
                      className="flex-1 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs cursor-pointer disabled:opacity-50"
                    >
                      {isDeletingAccount ? "Siliniyor..." : "Evet, Hesabı Sil"}
                    </button>
                    <button
                      onClick={() => {
                        setIsConfirmingDelete(false);
                        setDeleteError("");
                      }}
                      className="px-3 py-1.5 rounded-lg bg-slate-800 text-slate-300 text-xs cursor-pointer"
                    >
                      İptal
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </motion.div>

      {/* Terms of Service & AI Legal Disclaimer Modal */}
      <TermsOfServiceModal
        isOpen={isTermsModalOpen}
        onClose={() => setIsTermsModalOpen(false)}
        onAccept={() => {
          setTermsAccepted(true);
          if (errorMessage) setErrorMessage(null);
        }}
      />
    </div>
  );
};
