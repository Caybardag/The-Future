import React, { useState } from "react";
import {
  Sparkles,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  Shield,
  Zap,
  Lock,
  Eye,
  EyeOff,
  User,
  Mail,
  MapPin,
  Coins,
  Briefcase,
  Target,
  Check,
  ShieldCheck,
  LogIn,
  AlertCircle,
  Clock,
  Compass,
  X,
} from "lucide-react";
import { motion } from "motion/react";
import { UserProfile } from "./UserAuthModal";
import { saveAccount, getAccountByEmail, registerOrGetAccount } from "../utils/userAccounts";
import {
  LIFE_ROLES,
  PRIMARY_GOALS,
  TURKEY_CITIES,
} from "./OnboardingWizardModal";
import {
  auth,
  googleProvider,
  signInWithPopup,
  db,
  doc,
  getDoc,
  setDoc,
} from "../lib/firebase";

interface FuturisticRegistrationGateProps {
  onCompleteRegistration: (user: UserProfile) => void;
  onLoginExistingUser: (user: UserProfile) => void;
  onExploreAsGuest?: () => void;
  onClose?: () => void;
}

export const FuturisticRegistrationGate: React.FC<FuturisticRegistrationGateProps> = ({
  onCompleteRegistration,
  onLoginExistingUser,
  onExploreAsGuest,
  onClose,
}) => {
  // Mode: "register" (5 steps) OR "login" (direct sign in)
  const [gateMode, setGateMode] = useState<"register" | "login">("register");

  // Multi-step Registration Progress: 1 to 5
  const [currentStep, setCurrentStep] = useState<number>(1);
  const totalSteps = 5;

  // Step 1 Form Data: Identity & Credentials
  const [fullName, setFullName] = useState<string>("");
  const [username, setUsername] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [avatarUrl, setAvatarUrl] = useState<string | undefined>(undefined);
  const [isGoogleAuth, setIsGoogleAuth] = useState<boolean>(false);
  const [googleUid, setGoogleUid] = useState<string>("");

  // Step 2 Form Data: Yaş, Cinsiyet & Şehir
  const [age, setAge] = useState<number>(28);
  const [gender, setGender] = useState<string>("Erkek");
  const [city, setCity] = useState<string>("İstanbul");
  const [country] = useState<string>("Türkiye");

  // Step 3 Form Data: Hayat Rolü & Mesleki Durum (LIFE_ROLES)
  const [selectedLifeRole, setSelectedLifeRole] = useState<string>("beyaz_yaka");

  // Step 4 Form Data: 1 Numaralı Gelecek Önceliği (PRIMARY_GOALS)
  const [selectedPrimaryGoal, setSelectedPrimaryGoal] = useState<string>("gelecek_becerileri");

  // Step 5 Form Data: Terms & Activation
  const [acceptedTerms, setAcceptedTerms] = useState<boolean>(true);
  const [isActivating, setIsActivating] = useState<boolean>(false);
  const [activationSuccess, setActivationSuccess] = useState<boolean>(false);
  const [validationError, setValidationError] = useState<string>("");

  // Direct Login Form Data
  const [loginEmail, setLoginEmail] = useState<string>("");
  const [loginPassword, setLoginPassword] = useState<string>("");
  const [loginError, setLoginError] = useState<string>("");
  const [isGoogleLoading, setIsGoogleLoading] = useState<boolean>(false);

  // Sound Synth Feedback
  const playPulseSound = (frequency: number = 520, type: OscillatorType = "sine", duration: number = 0.12) => {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = type;
      osc.frequency.setValueAtTime(frequency, ctx.currentTime);
      gain.gain.setValueAtTime(0.04, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + duration);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + duration);
    } catch {}
  };

  // Google OAuth Login & Continue Handler
  const handleGoogleAuth = async () => {
    setValidationError("");
    setLoginError("");
    setIsGoogleLoading(true);

    try {
      const result = await signInWithPopup(auth, googleProvider);
      const fbUser = result.user;
      try {
        const freshToken = await fbUser.getIdToken();
        if (freshToken) {
          localStorage.setItem("future_user_session_token", freshToken);
        }
      } catch {}
      const gEmail = (fbUser.email || "").trim().toLowerCase();
      const gName = fbUser.displayName || gEmail.split("@")[0] || "Gelecek Yolcusu";
      const isSuper = gEmail === "warfacelove46@gmail.com";

      // Check if user already exists in local accounts or Firestore
      let existing = getAccountByEmail(gEmail);
      let firestoreData: any = null;

      try {
        const userRef = doc(db, "users", fbUser.uid);
        const docSnap = await getDoc(userRef);
        if (docSnap.exists()) {
          firestoreData = docSnap.data();
        }
      } catch {}

      // Pre-fill existing data as defaults if available, so user can confirm/edit them
      if (firestoreData?.age || existing?.age) {
        setAge(Number(firestoreData?.age || existing?.age));
      }
      if (firestoreData?.gender || existing?.gender) {
        setGender(firestoreData?.gender || existing?.gender);
      }
      if (firestoreData?.city || existing?.city) {
        setCity(firestoreData?.city || existing?.city);
      }
      if (firestoreData?.lifeRole || existing?.lifeRole) {
        setSelectedLifeRole(firestoreData?.lifeRole || existing?.lifeRole);
      }
      if (firestoreData?.primaryGoal || existing?.primaryGoal) {
        setSelectedPrimaryGoal(firestoreData?.primaryGoal || existing?.primaryGoal);
      }

      // Populate identity fields from Google
      setFullName(gName);
      setEmail(gEmail);
      const generatedUsername = (
        firestoreData?.username ||
        existing?.username ||
        gEmail.split("@")[0]
      )
        .replace(/[^a-zA-Z0-9_]/g, "_")
        .toLowerCase();
      setUsername(generatedUsername);
      setAvatarUrl(fbUser.photoURL || undefined);
      setIsGoogleAuth(true);
      setGoogleUid(fbUser.uid);

      // CRITICAL: NEVER bypass the onboarding steps! Always take user through the demographic & priority wizard!
      setGateMode("register");
      setCurrentStep(2); // Advance directly to Step 2 (Yaş, Cinsiyet, Şehir)
      playPulseSound(720);
    } catch (err: any) {
      if (
        err.code === "auth/popup-closed-by-user" ||
        err.code === "auth/cancelled-popup-request" ||
        err.message?.includes("closed-by-user")
      ) {
        setValidationError("Google giriş penceresi kapatıldı.");
      } else {
        setValidationError("Google ile bağlantı kurulamadı. Lütfen e-posta ile kayıt olmayı deneyin.");
      }
    } finally {
      setIsGoogleLoading(false);
    }
  };

  // Step Validation & Forward Navigation
  const handleNextStep = () => {
    setValidationError("");

    if (currentStep === 1) {
      if (!fullName.trim()) {
        setValidationError("Lütfen adınızı ve soyadınızı belirtin.");
        return;
      }
      if (!email.trim() || !email.includes("@")) {
        setValidationError("Lütfen geçerli bir e-posta adresi girin.");
        return;
      }
      if (!isGoogleAuth && (!password || password.length < 6)) {
        setValidationError("Parolanız en az 6 karakterli olmalıdır.");
        return;
      }
      playPulseSound(580);
      setCurrentStep(2);
      return;
    }

    if (currentStep === 2) {
      if (!age || age < 7 || age > 115) {
        setValidationError("Lütfen 7 ile 115 arasında geçerli bir yaş belirtin.");
        return;
      }
      if (!city) {
        setValidationError("Lütfen yaşadığınız şehri seçin.");
        return;
      }
      playPulseSound(640);
      setCurrentStep(3);
      return;
    }

    if (currentStep === 3) {
      if (!selectedLifeRole) {
        setValidationError("Lütfen hayat durumunuza en yakın rolü seçin.");
        return;
      }
      playPulseSound(700);
      setCurrentStep(4);
      return;
    }

    if (currentStep === 4) {
      if (!selectedPrimaryGoal) {
        setValidationError("Lütfen gelecekle ilgili en önemli önceliğinizi seçin.");
        return;
      }
      playPulseSound(760);
      setCurrentStep(5);
      return;
    }
  };

  const handlePrevStep = () => {
    setValidationError("");
    if (currentStep > 1) {
      playPulseSound(440);
      setCurrentStep((prev) => prev - 1);
    }
  };

  // Final Registration Completion
  const handleCompleteRegistration = async () => {
    if (!acceptedTerms) {
      setValidationError("Lütfen protokol güvenlik ilkelerini onaylayın.");
      return;
    }

    setIsActivating(true);
    playPulseSound(880, "sine", 0.4);

    // Get selected objects from single source of truth
    const roleObj = LIFE_ROLES.find((r) => r.id === selectedLifeRole) || LIFE_ROLES[0];
    const goalObj = PRIMARY_GOALS.find((g) => g.id === selectedPrimaryGoal) || PRIMARY_GOALS[0];

    const cleanUsername = username.trim() || fullName.trim().toLowerCase().replace(/\s+/g, "_");
    const cleanEmail = email.trim().toLowerCase();
    const isSuper = cleanEmail === "warfacelove46@gmail.com";

    // Initial starting credits (0 credits; users spin wheel & watch ads)
    const initialCredits = isSuper ? 99999 : 0;

    setTimeout(async () => {
      const newUser: UserProfile = {
        id: googleUid || `usr_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
        fullName: fullName.trim(),
        username: cleanUsername,
        email: cleanEmail,
        phone: isSuper ? "+90 (Süper Yetki)" : "",
        isEmailVerified: true,
        isPhoneVerified: true,
        joinedDate: new Date().toLocaleDateString("tr-TR"),
        role: isSuper ? "superadmin" : "user",
        plan: isSuper ? "quantum_vip" : "free",
        credits: initialCredits,
        badges: ["PIONEER_2026", isGoogleAuth ? "GOOGLE_VERIFIED" : "VERIFIED_EXPLORER"],
        isOnboardingCompleted: true, // Mark completely finished!
        profession: roleObj.title,
        lifeRole: selectedLifeRole,
        lifeRoleLabel: roleObj.title,
        primaryGoal: selectedPrimaryGoal,
        primaryGoalLabel: goalObj.title,
        age: Number(age),
        gender,
        city,
        country,
        avatarUrl: avatarUrl,
      };

      // Persist user account locally
      saveAccount({
        ...newUser,
        hasClaimedWelcomeBonus: true,
      });

      // Also persist to Firestore if available
      try {
        if (googleUid) {
          const userRef = doc(db, "users", googleUid);
          await setDoc(userRef, newUser, { merge: true });
        }
      } catch {}

      setActivationSuccess(true);
      playPulseSound(1040, "triangle", 0.5);

      setTimeout(() => {
        onCompleteRegistration(newUser);
      }, 1200);
    }, 1000);
  };

  // Direct Login Handler
  const handleDirectLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError("");

    if (!loginEmail.trim() || !loginPassword) {
      setLoginError("Lütfen e-posta ve şifrenizi giriniz.");
      return;
    }

    const cleanMail = loginEmail.trim().toLowerCase();

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: cleanMail, password: loginPassword }),
      });
      const data = await res.json();
      if (!data.success) {
        setLoginError(data.error || "Giriş başarısız. Bilgilerinizi kontrol ediniz.");
        return;
      }
      if (data.token) {
        try {
          localStorage.setItem("future_user_session_token", data.token);
        } catch {}
      }

      playPulseSound(880);
      const existing = getAccountByEmail(cleanMail);

      const loggedUser: UserProfile = {
        id: data.user?.id || existing?.id || "usr_" + Date.now(),
        fullName: data.user?.fullName || existing?.fullName || cleanMail.split("@")[0],
        username: existing?.username || data.user?.fullName || cleanMail.split("@")[0],
        email: cleanMail,
        phone: data.user?.phone || existing?.phone || "",
        isEmailVerified: true,
        isPhoneVerified: true,
        joinedDate: data.user?.joinedDate || existing?.joinedDate || new Date().toLocaleDateString("tr-TR"),
        role: (data.user?.role || existing?.role || "user") as any,
        plan: data.user?.plan || existing?.plan || "free",
        credits: data.user?.credits ?? existing?.credits ?? 0,
        badges: existing?.badges || ["PIONEER_2026"],
        isOnboardingCompleted: existing?.isOnboardingCompleted ?? true,
        lifeRole: existing?.lifeRole,
        lifeRoleLabel: existing?.lifeRoleLabel,
        primaryGoal: existing?.primaryGoal,
        primaryGoalLabel: existing?.primaryGoalLabel,
        age: existing?.age,
        gender: existing?.gender,
        city: existing?.city,
        country: existing?.country,
        avatarUrl: existing?.avatarUrl,
      };

      onLoginExistingUser(loggedUser);
    } catch {
      setLoginError("Sunucu ile bağlantı hatası oluştu.");
    }
  };

  const selectedRoleObj = LIFE_ROLES.find((r) => r.id === selectedLifeRole) || LIFE_ROLES[0];
  const selectedGoalObj = PRIMARY_GOALS.find((g) => g.id === selectedPrimaryGoal) || PRIMARY_GOALS[0];

  return (
    <div className="fixed inset-0 z-[150] overflow-y-auto bg-[#050713] text-slate-100 flex flex-col items-center justify-center p-3 sm:p-6 select-none font-sans">
      {/* Background Ambient Glows & Cyber Grid */}
      <div className="fixed inset-0 pointer-events-none opacity-40">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-purple-600/30 blur-[120px]" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full bg-cyan-600/30 blur-[120px]" />
        <div className="absolute inset-0 bg-[radial-gradient(#ffffff0a_1px,transparent_1px)] [background-size:24px_24px]" />
      </div>

      {/* Main Container Card */}
      <div className="relative z-10 w-full max-w-2xl bg-[#0b0e22]/95 border border-purple-500/30 rounded-3xl p-5 sm:p-8 shadow-2xl backdrop-blur-2xl my-auto">
        {/* Header Branding */}
        <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-purple-600 to-cyan-500 p-0.5 shadow-lg shadow-purple-500/30 shrink-0">
              <div className="w-full h-full bg-[#0d0922] rounded-[14px] flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-cyan-300 animate-pulse" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base sm:text-lg font-black tracking-tight text-white uppercase font-sans">
                  TEKNOLOJİK EVRİM 2026—2060
                </h1>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 font-mono font-bold border border-cyan-500/40">
                  PROTOKOL
                </span>
              </div>
              <p className="text-xs text-slate-400 font-sans">
                Gelecek İstihbarat & Simülasyon Ağına Yetkili Giriş
              </p>
            </div>
          </div>

          {/* Header Action Buttons */}
          <div className="flex items-center gap-2">
            {/* Guest Explore Option */}
            {(onExploreAsGuest || onClose) && (
              <button
                type="button"
                onClick={() => {
                  if (onExploreAsGuest) onExploreAsGuest();
                  else if (onClose) onClose();
                }}
                className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900/80 hover:bg-slate-800 border border-white/10 text-slate-300 hover:text-white text-xs font-mono transition-all cursor-pointer"
                title="Kayıt olmadan siteyi misafir olarak incele"
              >
                <Compass className="w-3.5 h-3.5 text-cyan-400" />
                <span>Misafir İncele</span>
              </button>
            )}

            {/* Toggle Between Register & Login */}
            <button
              type="button"
              onClick={() => {
                setGateMode(gateMode === "register" ? "login" : "register");
                setValidationError("");
                setLoginError("");
              }}
              className="px-3 py-1.5 rounded-xl bg-purple-950/60 hover:bg-purple-900/60 border border-purple-500/30 text-purple-200 hover:text-white text-xs font-mono flex items-center gap-1.5 transition-all cursor-pointer"
            >
              {gateMode === "register" ? (
                <>
                  <LogIn className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Giriş Yap</span>
                </>
              ) : (
                <>
                  <User className="w-3.5 h-3.5 text-purple-400" />
                  <span>Yeni Kayıt</span>
                </>
              )}
            </button>

            {/* Close (X) button if dismissible */}
            {(onClose || onExploreAsGuest) && (
              <button
                type="button"
                onClick={() => {
                  if (onClose) onClose();
                  else if (onExploreAsGuest) onExploreAsGuest();
                }}
                className="w-8 h-8 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-center text-slate-400 hover:text-white transition-all cursor-pointer"
                title="Pencereyi Kapat"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* MODE 1: MULTI-STEP REGISTRATION */}
        {gateMode === "register" ? (
          <div className="space-y-6">
            {/* Step Progress Stepper Bar */}
            <div>
              <div className="flex items-center justify-between text-xs font-mono mb-2">
                <span className="text-cyan-300 font-bold flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
                  AŞAMA {currentStep} / {totalSteps}:{" "}
                  {currentStep === 1 && "Kimlik & Kuantum Giriş"}
                  {currentStep === 2 && "Yaş, Cinsiyet & Şehir"}
                  {currentStep === 3 && "Hayat Durumu & Rol"}
                  {currentStep === 4 && "1 Numaralı Öncelik"}
                  {currentStep === 5 && "Kuantum Aktivasyon & Onay"}
                </span>
                <span className="text-slate-400">%{Math.round((currentStep / totalSteps) * 100)} Tamamlandı</span>
              </div>

              {/* Progress Track */}
              <div className="w-full h-2 rounded-full bg-slate-900 border border-white/10 overflow-hidden flex">
                <div
                  className="h-full bg-gradient-to-r from-purple-500 via-indigo-500 to-cyan-400 transition-all duration-300 rounded-full"
                  style={{ width: `${(currentStep / totalSteps) * 100}%` }}
                />
              </div>

              {/* Step Dots */}
              <div className="grid grid-cols-5 gap-1 pt-2">
                {[
                  { num: 1, label: "Kimlik" },
                  { num: 2, label: "Yaş & Şehir" },
                  { num: 3, label: "Hayat Rolü" },
                  { num: 4, label: "Öncelik" },
                  { num: 5, label: "Aktivasyon" },
                ].map((s) => (
                  <div
                    key={`step-dot-${s.num}`}
                    className={`text-center text-[10px] font-mono py-1 rounded transition-all ${
                      s.num === currentStep
                        ? "text-cyan-300 font-bold bg-cyan-500/10 border border-cyan-500/30"
                        : s.num < currentStep
                        ? "text-purple-300"
                        : "text-slate-600"
                    }`}
                  >
                    {s.label}
                  </div>
                ))}
              </div>
            </div>

            {/* Validation Alert */}
            {validationError && (
              <div className="p-3 rounded-xl bg-rose-500/15 border border-rose-500/40 text-rose-300 text-xs font-sans flex items-center gap-2">
                <Shield className="w-4 h-4 text-rose-400 shrink-0" />
                <span>{validationError}</span>
              </div>
            )}

            {/* STEP 1: IDENTITY & CREDENTIALS (With Google OAuth Option) */}
            {currentStep === 1 && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                className="space-y-4"
              >
                <div className="space-y-1">
                  <h3 className="text-sm sm:text-base font-bold text-white flex items-center gap-2">
                    <User className="w-4 h-4 text-cyan-400" />
                    <span>Adım 1: Protokol Kimliği & Giriş Anahtarı</span>
                  </h3>
                  <p className="text-xs text-slate-400">
                    Google hesabınızla tek tıkla bağlanabilir veya bilgilerinizi manuel girip sonraki adımlara geçebilirsiniz.
                  </p>
                </div>

                {/* When Google Account is connected */}
                {isGoogleAuth ? (
                  <div className="p-3.5 rounded-2xl bg-emerald-950/40 border border-emerald-500/40 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      {avatarUrl ? (
                        <img
                          src={avatarUrl}
                          alt={fullName}
                          referrerPolicy="no-referrer"
                          className="w-10 h-10 rounded-full border border-emerald-400/60 object-cover shrink-0"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-emerald-500/20 border border-emerald-400 flex items-center justify-center shrink-0">
                          <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                        </div>
                      )}
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="text-xs font-bold text-white truncate">{fullName}</span>
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-mono font-bold">
                            Google Doğrulandı ✓
                          </span>
                        </div>
                        <div className="text-[11px] text-slate-400 truncate">{email}</div>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setIsGoogleAuth(false);
                        setGoogleUid("");
                        setEmail("");
                        setFullName("");
                        setUsername("");
                      }}
                      className="text-[10px] text-slate-400 hover:text-rose-300 underline font-mono shrink-0 cursor-pointer"
                    >
                      Değiştir
                    </button>
                  </div>
                ) : (
                  <>
                    {/* Google Quick Sign-In / Continue Button */}
                    <button
                      type="button"
                      onClick={handleGoogleAuth}
                      disabled={isGoogleLoading}
                      className="w-full py-3 px-4 rounded-2xl bg-white hover:bg-slate-100 text-slate-900 font-bold text-xs sm:text-sm flex items-center justify-center gap-3 shadow-lg shadow-white/10 transition-all cursor-pointer disabled:opacity-50"
                    >
                      {isGoogleLoading ? (
                        <div className="w-4 h-4 rounded-full border-2 border-slate-900 border-t-transparent animate-spin" />
                      ) : (
                        <svg className="w-4 h-4" viewBox="0 0 24 24">
                          <path
                            fill="#4285F4"
                            d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.8-2.4 3.65v3.03h3.88c2.27-2.09 3.665-5.17 3.665-9.12z"
                          />
                          <path
                            fill="#34A853"
                            d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.03c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.13C3.26 21.36 7.33 24 12 24z"
                          />
                          <path
                            fill="#FBBC05"
                            d="M5.28 14.29c-.25-.72-.38-1.49-.38-2.29s.13-1.57.38-2.29V6.58H1.25C.45 8.18 0 9.98 0 12s.45 3.82 1.25 5.42l4.03-3.13z"
                          />
                          <path
                            fill="#EA4335"
                            d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.13c.95-2.83 3.6-4.96 6.72-4.96z"
                          />
                        </svg>
                      )}
                      <span>Google ile Devam Et (Kayıt Adımlarını Başlat)</span>
                    </button>

                    <div className="relative flex items-center justify-center my-3">
                      <div className="border-t border-white/10 w-full" />
                      <span className="bg-[#0b0e22] px-3 text-[10px] font-mono text-slate-500 uppercase tracking-widest absolute">
                        veya e-posta ile kayıt ol
                      </span>
                    </div>
                  </>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-mono text-slate-300 mb-1">Adınız & Soyadınız *</label>
                    <div className="relative">
                      <User className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
                      <input
                        type="text"
                        placeholder="Örn: Ahmet Yılmaz"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-950/80 border border-white/10 text-white text-xs placeholder-slate-500 focus:border-cyan-400 focus:outline-none transition-colors"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-mono text-slate-300 mb-1">Kullanıcı Adı (Profilde Görünecek)</label>
                    <div className="relative">
                      <Sparkles className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
                      <input
                        type="text"
                        placeholder="Örn: ahmet_2030"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-950/80 border border-white/10 text-white text-xs placeholder-slate-500 focus:border-cyan-400 focus:outline-none transition-colors"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-mono text-slate-300 mb-1">E-Posta Adresi *</label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
                    <input
                      type="email"
                      placeholder="adiniz@ornek.com"
                      value={email}
                      disabled={isGoogleAuth}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-950/80 border border-white/10 text-white text-xs placeholder-slate-500 focus:border-cyan-400 focus:outline-none transition-colors disabled:opacity-60"
                    />
                  </div>
                </div>

                {!isGoogleAuth && (
                  <div>
                    <label className="block text-xs font-mono text-slate-300 mb-1">Kuantum Güvenlik Parolası *</label>
                    <div className="relative">
                      <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
                      <input
                        type={showPassword ? "text" : "password"}
                        placeholder="En az 6 karakter"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full pl-9 pr-10 py-2 rounded-xl bg-slate-950/80 border border-white/10 text-white text-xs placeholder-slate-500 focus:border-cyan-400 focus:outline-none transition-colors"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-2.5 text-slate-400 hover:text-white transition-colors"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                )}
              </motion.div>
            )}

            {/* STEP 2: YAŞ, CİNSİYET & ŞEHİR (Exact match with profile fields) */}
            {currentStep === 2 && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                className="space-y-4"
              >
                <div className="space-y-1">
                  <h3 className="text-sm sm:text-base font-bold text-white flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-cyan-400" />
                    <span>Adım 2: Yaşınız, Cinsiyetiniz ve Yaşadığınız Şehir</span>
                  </h3>
                  <p className="text-xs text-slate-400">
                    2026–2060 arasındaki teknolojik dönüşüm ve analizler profilinizdeki bu demografiye göre filtrelenir.
                  </p>
                </div>

                {/* Google Connection Info if active */}
                {isGoogleAuth && (
                  <div className="p-2.5 rounded-xl bg-cyan-950/40 border border-cyan-500/40 flex items-center gap-2.5 text-xs text-cyan-200">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span className="leading-relaxed">
                      Google kimliğiniz doğrulandı (<strong>{fullName}</strong>). Şimdi lütfen yaşınızı, cinsiyetinizi ve şehrinizi belirleyerek adımlara devam edin.
                    </span>
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* Yaş Seçimi */}
                  <div>
                    <label className="block text-xs font-mono text-slate-300 mb-1">Yaşınız *</label>
                    <input
                      type="number"
                      min={7}
                      max={115}
                      value={age || ""}
                      onChange={(e) => setAge(Number(e.target.value))}
                      className="w-full px-3 py-2 rounded-xl bg-slate-950/80 border border-white/10 text-white font-mono text-sm focus:border-cyan-400 focus:outline-none"
                    />
                    {/* Hızlı Yaş Butonları */}
                    <div className="flex flex-wrap gap-1 pt-1.5">
                      {[
                        { label: "18-24 (Genç)", val: 21 },
                        { label: "25-39 (Kariyer)", val: 32 },
                        { label: "40-54 (Olgun)", val: 47 },
                        { label: "55+ (Kıdemli)", val: 58 },
                      ].map((grp) => (
                        <button
                          key={grp.label}
                          type="button"
                          onClick={() => setAge(grp.val)}
                          className={`px-2 py-0.5 rounded-lg text-[10px] font-mono border transition ${
                            age >= grp.val - 5 && age <= grp.val + 6
                              ? "bg-cyan-500/20 border-cyan-400 text-cyan-300 font-bold"
                              : "bg-slate-900 border-white/5 text-slate-400 hover:text-white"
                          }`}
                        >
                          {grp.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Cinsiyet Seçimi */}
                  <div>
                    <label className="block text-xs font-mono text-slate-300 mb-1">Cinsiyet</label>
                    <div className="grid grid-cols-3 gap-1.5">
                      {["Erkek", "Kadın", "Belirtmek İstemiyorum"].map((g) => {
                        const isSel = gender === g;
                        return (
                          <button
                            key={g}
                            type="button"
                            onClick={() => setGender(g)}
                            className={`py-2 px-1 rounded-xl border text-[11px] font-bold transition flex flex-col items-center justify-center text-center ${
                              isSel
                                ? "bg-cyan-500/20 border-cyan-400 text-white"
                                : "bg-slate-950/60 border-white/10 text-slate-400 hover:text-white"
                            }`}
                          >
                            <span>{g === "Belirtmek İstemiyorum" ? "Diğer" : g}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* Şehir Seçimi */}
                <div>
                  <label className="block text-xs font-mono text-slate-300 mb-1">
                    Yaşadığınız Şehir (Türkiye) *
                  </label>
                  <select
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950/80 border border-white/10 text-white text-xs focus:border-cyan-400 focus:outline-none transition cursor-pointer"
                  >
                    {TURKEY_CITIES.map((c) => (
                      <option key={c} value={c} className="bg-slate-950 text-white">
                        {c}
                      </option>
                    ))}
                  </select>
                </div>
              </motion.div>
            )}

            {/* STEP 3: HAYAT DURUMU & ROLÜ (LIFE_ROLES) */}
            {currentStep === 3 && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                className="space-y-4"
              >
                <div className="space-y-1">
                  <h3 className="text-sm sm:text-base font-bold text-white flex items-center gap-2">
                    <Briefcase className="w-4 h-4 text-cyan-400" />
                    <span>Adım 3: Hayat Durumunuz & Mesleki Alanınız</span>
                  </h3>
                  <p className="text-xs text-slate-400">
                    Profiliniz ve yapay zeka risk analizleriniz doğrudan seçtiğiniz bu hayat durumuna göre düzenlenir.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-[300px] overflow-y-auto pr-1">
                  {LIFE_ROLES.map((role) => {
                    const isSelected = selectedLifeRole === role.id;
                    const Icon = role.icon;
                    return (
                      <div
                        key={`role-opt-${role.id}`}
                        onClick={() => {
                          setSelectedLifeRole(role.id);
                          if (role.samplePriority) {
                            setSelectedPrimaryGoal(role.samplePriority);
                          }
                        }}
                        className={`p-3 rounded-2xl border transition-all cursor-pointer flex items-start gap-2.5 ${
                          isSelected
                            ? "bg-cyan-950/50 border-cyan-400 shadow-md shadow-cyan-500/10"
                            : "bg-slate-950/60 border-white/10 hover:border-slate-700"
                        }`}
                      >
                        <div className="w-8 h-8 rounded-xl bg-slate-900 border border-white/10 flex items-center justify-center shrink-0 mt-0.5">
                          <Icon className="w-4 h-4 text-cyan-300" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-xs font-bold text-white">{role.title}</div>
                          <div className="text-[11px] text-slate-400 line-clamp-2">{role.subtitle}</div>
                        </div>
                        <div
                          className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 mt-1 ${
                            isSelected ? "bg-cyan-500 border-cyan-400 text-slate-950" : "border-white/20"
                          }`}
                        >
                          {isSelected && <Check className="w-2.5 h-2.5 stroke-[3]" />}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </motion.div>
            )}

            {/* STEP 4: 1 NUMARALI ÖNCELİK (PRIMARY_GOALS) */}
            {currentStep === 4 && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                className="space-y-4"
              >
                <div className="space-y-1">
                  <h3 className="text-sm sm:text-base font-bold text-white flex items-center gap-2">
                    <Target className="w-4 h-4 text-pink-400" />
                    <span>Adım 4: 1 Numaralı Gelecek Önceliğiniz</span>
                  </h3>
                  <p className="text-xs text-slate-400">
                    Profil sayfanızda görüntülenecek ve bildirimlerinizi önceliklendirecek ana hedefinizi seçin.
                  </p>
                </div>

                <div className="space-y-2.5 max-h-[310px] overflow-y-auto pr-1">
                  {PRIMARY_GOALS.map((goal) => {
                    const isSelected = selectedPrimaryGoal === goal.id;
                    const Icon = goal.icon;
                    return (
                      <div
                        key={`goal-opt-${goal.id}`}
                        onClick={() => setSelectedPrimaryGoal(goal.id)}
                        className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-start gap-3 relative overflow-hidden ${
                          isSelected
                            ? "bg-purple-950/50 border-purple-400 shadow-md shadow-purple-500/20"
                            : "bg-slate-950/60 border-white/10 hover:border-slate-700"
                        }`}
                      >
                        <div className="w-8 h-8 rounded-xl bg-slate-900 border border-white/10 flex items-center justify-center shrink-0 mt-0.5">
                          <Icon className="w-4 h-4 text-purple-300" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="text-xs font-bold text-white">{goal.title}</h4>
                          <p className="text-[11px] text-slate-400 font-sans mt-0.5">{goal.desc}</p>
                        </div>
                        <div
                          className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 mt-0.5 ${
                            isSelected ? "bg-cyan-500 border-cyan-400 text-slate-950" : "border-white/20"
                          }`}
                        >
                          {isSelected && <Check className="w-2.5 h-2.5 stroke-[3]" />}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </motion.div>
            )}

            {/* STEP 5: QUANTUM ACTIVATION & PROFILE CONFIRMATION */}
            {currentStep === 5 && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                className="space-y-4"
              >
                <div className="text-center space-y-2 py-1">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-cyan-500 to-purple-600 p-0.5 mx-auto shadow-lg shadow-cyan-500/20">
                    <div className="w-full h-full bg-[#0d0a26] rounded-[14px] flex items-center justify-center">
                      <ShieldCheck className="w-7 h-7 text-cyan-300 animate-pulse" />
                    </div>
                  </div>
                  <h3 className="text-base font-black text-white">
                    Gelecek Profiliniz Hazır!
                  </h3>
                  <p className="text-xs text-slate-400 max-w-md mx-auto font-sans">
                    Aşağıdaki bilgilerle profiliniz oluşturulacak ve profil kartınızda birebir görüntülenecektir.
                  </p>
                </div>

                {/* Profile Summary Card (Matches User Profile Screen exactly!) */}
                <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-white/10 space-y-2 font-mono text-xs">
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <span className="text-[10px] text-slate-500 block">Kullanıcı Adı:</span>
                      <span className="text-white font-bold truncate block">{username || fullName}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-500 block">Yaş & Cinsiyet:</span>
                      <span className="text-cyan-300 font-bold block">{age} Yaş • {gender}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-500 block">Hayat Durumu:</span>
                      <span className="text-white font-bold truncate block">{selectedRoleObj.title}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-500 block">Şehir / Konum:</span>
                      <span className="text-emerald-400 font-bold truncate block">{city}</span>
                    </div>
                  </div>
                  <div className="pt-1 border-t border-white/5 font-sans">
                    <span className="text-slate-400 text-[11px]">1 Numaralı Önceliğiniz: </span>
                    <span className="text-cyan-300 font-bold text-xs">{selectedGoalObj.title}</span>
                  </div>
                </div>

                {/* Rewards Showcase */}
                <div className="grid grid-cols-2 gap-2.5 font-sans">
                  <div className="p-3 rounded-2xl bg-cyan-950/30 border border-cyan-500/30 flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-cyan-500/20 flex items-center justify-center shrink-0">
                      <Coins className="w-4 h-4 text-cyan-400" />
                    </div>
                    <div>
                      <div className="text-xs font-mono text-cyan-300 font-bold">Gelecek Çarkı & Reklamlar</div>
                      <div className="text-[10px] text-slate-400">Ücretsiz Kredi Kazanımı</div>
                    </div>
                  </div>

                  <div className="p-3 rounded-2xl bg-purple-950/30 border border-purple-500/30 flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-purple-500/20 flex items-center justify-center shrink-0">
                      <Sparkles className="w-4 h-4 text-purple-400" />
                    </div>
                    <div>
                      <div className="text-xs font-mono text-purple-300 font-bold">2026 Öncü Rozeti</div>
                      <div className="text-[10px] text-slate-400">Dijital Koleksiyon</div>
                    </div>
                  </div>
                </div>

                {/* Consent Checkbox */}
                <div
                  onClick={() => setAcceptedTerms(!acceptedTerms)}
                  className="p-3 rounded-xl bg-slate-950/60 border border-white/10 flex items-center gap-3 cursor-pointer hover:border-slate-700 transition-colors"
                >
                  <div
                    className={`w-5 h-5 rounded-lg border flex items-center justify-center shrink-0 transition-colors ${
                      acceptedTerms ? "bg-cyan-500 border-cyan-400 text-slate-950" : "border-white/30"
                    }`}
                  >
                    {acceptedTerms && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                  </div>
                  <div className="text-xs text-slate-300 font-sans">
                    <span className="font-bold text-white">2026—2060 Güvenlik ve Gizlilik Protokolünü</span> kabul ediyorum.
                  </div>
                </div>
              </motion.div>
            )}

            {/* Navigation Buttons */}
            <div className="flex items-center justify-between pt-4 border-t border-white/10">
              {currentStep > 1 ? (
                <button
                  type="button"
                  onClick={handlePrevStep}
                  disabled={isActivating}
                  className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-white/10 text-xs font-mono text-slate-300 flex items-center gap-1.5 transition-all cursor-pointer"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Önceki Adım</span>
                </button>
              ) : (
                <div />
              )}

              {currentStep < totalSteps ? (
                <button
                  type="button"
                  onClick={handleNextStep}
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-cyan-600 hover:from-purple-500 hover:to-cyan-500 text-white text-xs font-bold font-mono shadow-lg shadow-cyan-500/20 flex items-center gap-2 transition-all cursor-pointer"
                >
                  <span>Sonraki Aşamaya İlerle</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleCompleteRegistration}
                  disabled={isActivating}
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 via-teal-500 to-cyan-500 hover:from-emerald-500 hover:to-cyan-400 text-slate-950 font-black text-xs font-mono shadow-xl shadow-emerald-500/30 flex items-center gap-2 transition-all cursor-pointer disabled:opacity-50"
                >
                  {isActivating ? (
                    <>
                      <div className="w-4 h-4 rounded-full border-2 border-slate-950 border-t-transparent animate-spin" />
                      <span>Kuantum Aktivasyonu Yapılıyor...</span>
                    </>
                  ) : activationSuccess ? (
                    <>
                      <CheckCircle2 className="w-4 h-4 text-slate-950" />
                      <span>Erişim Verildi! Giriş Yapılıyor...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4 text-slate-950 animate-pulse" />
                      <span>KAYDI TAMAMLA VE SİTEYE GİRİŞ YAP</span>
                    </>
                  )}
                </button>
              )}
            </div>

            {/* Guest Explore Quick Bypass */}
            {(onExploreAsGuest || onClose) && (
              <div className="text-center pt-3 border-t border-white/5">
                <button
                  type="button"
                  onClick={() => {
                    if (onExploreAsGuest) onExploreAsGuest();
                    else if (onClose) onClose();
                  }}
                  className="text-xs text-slate-400 hover:text-cyan-300 font-mono flex items-center justify-center gap-1.5 mx-auto transition-colors cursor-pointer"
                >
                  <Compass className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Kayıt olmadan misafir olarak siteyi keşfet ➔</span>
                </button>
              </div>
            )}
          </div>
        ) : (
          /* MODE 2: DIRECT LOGIN FOR RETURNING USERS */
          <div className="space-y-4">
            <div className="space-y-1">
              <h3 className="text-sm sm:text-base font-bold text-white flex items-center gap-2">
                <LogIn className="w-4 h-4 text-cyan-400" />
                <span>Mevcut Protokol Hesabıyla Giriş Yap</span>
              </h3>
              <p className="text-xs text-slate-400">
                Google hesabınızla profil adımlarınızı tamamlayarak veya kayıtlı e-posta ve şifrenizle giriş yapabilirsiniz.
              </p>
            </div>

            {loginError && (
              <div className="p-3 rounded-xl bg-rose-500/15 border border-rose-500/40 text-rose-300 text-xs font-sans flex items-center gap-2">
                <Shield className="w-4 h-4 text-rose-400 shrink-0" />
                <span>{loginError}</span>
              </div>
            )}

            {/* Google Quick Sign-In */}
            <button
              type="button"
              onClick={handleGoogleAuth}
              disabled={isGoogleLoading}
              className="w-full py-3 px-4 rounded-2xl bg-white hover:bg-slate-100 text-slate-900 font-bold text-xs sm:text-sm flex items-center justify-center gap-3 shadow-lg shadow-white/10 transition-all cursor-pointer disabled:opacity-50"
            >
              {isGoogleLoading ? (
                <div className="w-4 h-4 rounded-full border-2 border-slate-900 border-t-transparent animate-spin" />
              ) : (
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.8-2.4 3.65v3.03h3.88c2.27-2.09 3.665-5.17 3.665-9.12z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.03c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.13C3.26 21.36 7.33 24 12 24z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.28 14.29c-.25-.72-.38-1.49-.38-2.29s.13-1.57.38-2.29V6.58H1.25C.45 8.18 0 9.98 0 12s.45 3.82 1.25 5.42l4.03-3.13z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.13c.95-2.83 3.6-4.96 6.72-4.96z"
                  />
                </svg>
              )}
              <span>Google ile Bağlan & Kayıt Adımlarını Tamamla</span>
            </button>

            <div className="relative flex items-center justify-center my-3">
              <div className="border-t border-white/10 w-full" />
              <span className="bg-[#0b0e22] px-3 text-[10px] font-mono text-slate-500 uppercase tracking-widest absolute">
                veya e-posta ile giriş
              </span>
            </div>

            <form onSubmit={handleDirectLogin} className="space-y-3">
              <div>
                <label className="block text-xs font-mono text-slate-300 mb-1">E-Posta Adresi</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
                  <input
                    type="email"
                    placeholder="adiniz@ornek.com"
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-950/80 border border-white/10 text-white text-xs placeholder-slate-500 focus:border-cyan-400 focus:outline-none transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-mono text-slate-300 mb-1">Şifre</label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
                  <input
                    type="password"
                    placeholder="Şifreniz"
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-950/80 border border-white/10 text-white text-xs placeholder-slate-500 focus:border-cyan-400 focus:outline-none transition-colors"
                  />
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-cyan-600 hover:from-purple-500 hover:to-cyan-500 text-white font-bold text-xs font-mono shadow-lg shadow-cyan-500/20 flex items-center justify-center gap-2 transition-all cursor-pointer"
                >
                  <LogIn className="w-4 h-4" />
                  <span>Giriş Yap ve Gelecek Konsoluna Geç</span>
                </button>
              </div>
            </form>

            {/* Helper to switch to register */}
            <div className="text-center pt-2">
              <button
                type="button"
                onClick={() => setGateMode("register")}
                className="text-xs text-slate-400 hover:text-cyan-300 transition-colors cursor-pointer"
              >
                Henüz bir protokol kaydınız yok mu? <span className="text-cyan-400 underline font-bold">Yeni Kayıt Oluştur</span>
              </button>
            </div>

            {/* Guest Explore Quick Bypass */}
            {(onExploreAsGuest || onClose) && (
              <div className="text-center pt-2 border-t border-white/5">
                <button
                  type="button"
                  onClick={() => {
                    if (onExploreAsGuest) onExploreAsGuest();
                    else if (onClose) onClose();
                  }}
                  className="text-xs text-slate-400 hover:text-cyan-300 font-mono flex items-center justify-center gap-1.5 mx-auto transition-colors cursor-pointer"
                >
                  <Compass className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Kayıt olmadan misafir olarak siteyi keşfet ➔</span>
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
