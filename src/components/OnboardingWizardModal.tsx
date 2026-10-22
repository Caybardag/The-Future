import React, { useState, useEffect } from "react";
import {
  User,
  ShieldCheck,
  MapPin,
  Briefcase,
  Target,
  Sparkles,
  ArrowRight,
  ArrowLeft,
  Check,
  Lock,
  Eye,
  EyeOff,
  Coins,
  HeartPulse,
  GraduationCap,
  Store,
  Baby,
  Building,
  Microscope,
  Compass,
  AlertCircle,
  HelpCircle,
  X,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { UserProfile, isUserProfileComplete } from "./UserAuthModal";
import { saveAccount } from "../utils/userAccounts";

interface OnboardingWizardModalProps {
  isOpen: boolean;
  currentUser: UserProfile;
  onComplete: (updatedUser: UserProfile) => void;
  onClose?: () => void;
}

export const TURKEY_CITIES = [
  "İstanbul",
  "Ankara",
  "İzmir",
  "Bursa",
  "Antalya",
  "Adana",
  "Konya",
  "Gaziantep",
  "Kocaeli",
  "Mersin",
  "Diyarbakır",
  "Kayseri",
  "Eskişehir",
  "Samsun",
  "Denizli",
  "Şanlıurfa",
  "Adapazarı (Sakarya)",
  "Malatya",
  "Kahramanmaraş",
  "Erzurum",
  "Van",
  "Batman",
  "Elazığ",
  "Manisa",
  "Sivas",
  "Gebze / Kocaeli",
  "Balıkesir",
  "Trabzon",
  "Çanakkale",
  "Muğla",
  "Aydın",
  "Tekirdağ",
  "Diğer / Yurt Dışı",
];

export const LIFE_ROLES = [
  {
    id: "emekli",
    title: "Emekliyim",
    subtitle: "Emekli maaşı, birikim koruma, sağlık & uzun yaşam odaklı",
    icon: Coins,
    color: "amber",
    badge: "Kıdemli Vatandaş",
    samplePriority: "birikim_koruma",
  },
  {
    id: "calisan_asgari",
    title: "Çalışanım / Asgari Ücretliyim",
    subtitle: "İş güvencesi, geçim dengesi, otomasyon & robotik riski odaklı",
    icon: Briefcase,
    color: "blue",
    badge: "İş Gücü Güvencesi",
    samplePriority: "is_guvencesi",
  },
  {
    id: "beyaz_yaka",
    title: "Özel Sektör / Memur (Beyaz Yaka)",
    subtitle: "Yapay zekanın ofis işlerine etkisi, kariyer dönüşümü & yönetim",
    icon: Building,
    color: "cyan",
    badge: "Kariyer & Yönetim",
    samplePriority: "gelecek_becerileri",
  },
  {
    id: "esnaf_kobi",
    title: "Küçük Esnaf / KOBİ / Dükkan Sahibi",
    subtitle: "Giderleri kısma, yapay zekayı işe entegre etme ve rekabet",
    icon: Store,
    color: "emerald",
    badge: "İşletme & Esnaf",
    samplePriority: "birikim_koruma",
  },
  {
    id: "ogrenci",
    title: "Lise / Üniversite Öğrencisiyim",
    subtitle: "Geleceğin meslekleri, YKS, hangi bölümü ve beceriyi seçmeliyim",
    icon: GraduationCap,
    color: "indigo",
    badge: "Gençlik & Eğitim",
    samplePriority: "gelecek_becerileri",
  },
  {
    id: "ebeveyn",
    title: "Ebeveynim (Çocuk Yetiştiriyorum)",
    subtitle: "Çocuğumu 2030+ dünyasına nasıl doğru hazırlamalıyım?",
    icon: Baby,
    color: "rose",
    badge: "Aile & Gelecek Nesil",
    samplePriority: "cocuk_egitimi",
  },
  {
    id: "akademisyen",
    title: "Akademisyen / Araştırmacıyım",
    subtitle: "Bilimsel gelişim aşamaları, araştırma fonları, küresel trendler",
    icon: Microscope,
    color: "purple",
    badge: "Bilim & Akademi",
    samplePriority: "teknoloji_takip",
  },
  {
    id: "diger",
    title: "Serbest / Diğer",
    subtitle: "Gelecek teknolojilerini ve insanlığın rotasını genel olarak izliyorum",
    icon: Compass,
    color: "slate",
    badge: "Genel Gelecek",
    samplePriority: "teknoloji_takip",
  },
];

export const PRIMARY_GOALS = [
  {
    id: "birikim_koruma",
    title: "Paramı ve birikimimi enflasyon / teknoloji karşısında korumak",
    desc: "Dijital para, yapay zeka ekonomisi ve piyasa kırılmalarında varlık güvenliği.",
    icon: Coins,
    accent: "text-amber-400 border-amber-500/30 bg-amber-500/10",
  },
  {
    id: "is_guvencesi",
    title: "Mevcut işimi, mesleğimi ve gelirimi kaybetmemek",
    desc: "Yapay zeka ve robotların ikame edemeyeceği güvenli becerileri belirleme.",
    icon: Briefcase,
    accent: "text-blue-400 border-blue-500/30 bg-blue-500/10",
  },
  {
    id: "gelecek_becerileri",
    title: "Yapay zekanın kazandıran yeni becerilerini öğrenip öne geçmek",
    desc: "Otonom ajanlar ve yeni çağın en değerli uzmanlıklarında öncü olmak.",
    icon: Sparkles,
    accent: "text-cyan-400 border-cyan-500/30 bg-cyan-500/10",
  },
  {
    id: "cocuk_egitimi",
    title: "Çocuğuma geleceğe uygun doğru eğitim ve rehberlik vermek",
    desc: "Eski tip ezber eğitim yerine gelecekte işe yarayacak gerçek yetkinlikler.",
    icon: Baby,
    accent: "text-rose-400 border-rose-500/30 bg-rose-500/10",
  },
  {
    id: "saglik_omur",
    title: "Sağlık, yeni tıp tedavileri ve uzun yaşam teknolojilerinden faydalanmak",
    desc: "Biyoteknoloji, hücresel gençleşme ve yeni nesil koruyucu tıp gelişmeleri.",
    icon: HeartPulse,
    accent: "text-emerald-400 border-emerald-500/30 bg-emerald-500/10",
  },
  {
    id: "teknoloji_takip",
    title: "Yapay zekanın dünyayı ve Türkiye'yi nereye götüreceğini anlamak",
    desc: "Jeopolitik dengeler, AGI eşiği ve medeniyetin yeni teknolojik evresi.",
    icon: Compass,
    accent: "text-purple-400 border-purple-500/30 bg-purple-500/10",
  },
];

export const OnboardingWizardModal: React.FC<OnboardingWizardModalProps> = ({
  isOpen,
  currentUser,
  onComplete,
  onClose,
}) => {
  const isEditMode = isUserProfileComplete(currentUser);

  // Current Step: 1 -> 2 -> 3 -> 4 -> 5
  const [step, setStep] = useState<number>(1);

  // Form States initialized with existing values if available
  const [username, setUsername] = useState<string>(() => {
    return (
      currentUser.username ||
      currentUser.fullName ||
      (currentUser.email ? currentUser.email.split("@")[0] : "") ||
      "Gelecek Yolcusu"
    );
  });

  const [age, setAge] = useState<number>(() => {
    return currentUser.age || 52;
  });

  const [gender, setGender] = useState<string>(() => {
    return currentUser.gender || "Erkek";
  });

  const [country, setCountry] = useState<string>(() => {
    return currentUser.country || "Türkiye";
  });

  const [city, setCity] = useState<string>(() => {
    return currentUser.city || currentUser.location?.city || "İstanbul";
  });

  const [isProfilePrivate, setIsProfilePrivate] = useState<boolean>(() => {
    return currentUser.isProfilePrivate ?? true;
  });

  const [lifeRole, setLifeRole] = useState<string>(() => {
    return currentUser.lifeRole || "emekli";
  });

  const [primaryGoal, setPrimaryGoal] = useState<string>(() => {
    return currentUser.primaryGoal || "birikim_koruma";
  });

  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (currentUser) {
      if (currentUser.username) setUsername(currentUser.username);
      if (currentUser.age) setAge(currentUser.age);
      if (currentUser.gender) setGender(currentUser.gender);
      if (currentUser.city) setCity(currentUser.city);
      if (currentUser.lifeRole) setLifeRole(currentUser.lifeRole);
      if (currentUser.primaryGoal) setPrimaryGoal(currentUser.primaryGoal);
    }
  }, [currentUser]);

  if (!isOpen) return null;

  // Selected Role & Goal Objects
  const selectedRoleObj = LIFE_ROLES.find((r) => r.id === lifeRole) || LIFE_ROLES[0];
  const selectedGoalObj = PRIMARY_GOALS.find((g) => g.id === primaryGoal) || PRIMARY_GOALS[0];

  // Handlers
  const handleNextStep = () => {
    setErrorMsg(null);

    // Validations
    if (step === 1) {
      if (!username.trim()) {
        setErrorMsg("Lütfen platformda görünecek bir kullanıcı adı veya isim yazın.");
        return;
      }
      setStep(2);
    } else if (step === 2) {
      if (!age || age < 7 || age > 115) {
        setErrorMsg("Lütfen geçerli bir yaş giriniz.");
        return;
      }
      if (!city) {
        setErrorMsg("Lütfen yaşadığınız şehri seçiniz.");
        return;
      }
      setStep(3);
    } else if (step === 3) {
      if (!lifeRole) {
        setErrorMsg("Lütfen size en yakın hayat durumunu seçiniz.");
        return;
      }
      setStep(4);
    } else if (step === 4) {
      if (!primaryGoal) {
        setErrorMsg("Lütfen gelecekle ilgili en önemli önceliğinizi seçiniz.");
        return;
      }
      setStep(5);
    }
  };

  const handlePrevStep = () => {
    setErrorMsg(null);
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const handleFinishOnboarding = () => {
    const updated: UserProfile = {
      ...currentUser,
      username: username.trim(),
      fullName: currentUser.fullName || username.trim(),
      age: Number(age),
      gender,
      country,
      city,
      isProfilePrivate,
      lifeRole,
      lifeRoleLabel: selectedRoleObj.title,
      profession: currentUser.profession || selectedRoleObj.title,
      personalGoal: selectedGoalObj.title,
      primaryGoal,
      primaryGoalLabel: selectedGoalObj.title,
      employmentStatus: lifeRole === "emekli" ? "retired" : lifeRole === "ogrenci" ? "student" : "employed",
      seniority: lifeRole === "emekli" ? "retired" : lifeRole === "ogrenci" ? "student" : "mid",
      industrySector: selectedRoleObj.title,
      isOnboardingCompleted: true,
    };

    saveAccount(updated);
    onComplete(updated);
  };

  return (
    <div
      id="onboarding-wizard-overlay"
      className="fixed inset-0 z-[120] flex items-center justify-center p-3 sm:p-6 bg-[#020617]/90 backdrop-blur-2xl overflow-y-auto animate-in fade-in duration-300"
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ type: "spring", damping: 25, stiffness: 300 }}
        className="relative w-full max-w-2xl bg-gradient-to-b from-slate-900/98 via-slate-950/98 to-[#020617] border border-cyan-500/30 rounded-3xl shadow-[0_0_60px_rgba(6,182,212,0.18),0_25px_60px_rgba(0,0,0,0.9)] overflow-hidden flex flex-col font-sans my-auto text-slate-100"
      >
        {/* Ambient Top Glow Line */}
        <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-blue-500 via-cyan-400 to-indigo-500" />
        <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-80 h-32 bg-cyan-500/15 blur-3xl pointer-events-none" />

        {/* HEADER & STEP PROGRESS BAR */}
        <div className="p-6 sm:p-8 border-b border-white/10 relative">
          <div className="flex items-center justify-between gap-4 mb-4">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-lg sm:text-xl font-extrabold text-white tracking-tight">
                  {isEditMode ? "Gelecek Profilinizi Düzenleyin" : "Gelecek Rehberinizi Kişiselleştirin"}
                </h2>
                <p className="text-xs text-slate-400">
                  {currentUser.email} • Adım {step} / 5
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-800/80 border border-white/10 text-xs text-cyan-300 font-mono">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span>{isEditMode ? "Profil Düzenleme" : "Kişiye Özel Analiz"}</span>
              </div>
              {onClose && (
                <button
                  type="button"
                  onClick={onClose}
                  className="p-2 rounded-2xl bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors cursor-pointer shrink-0"
                  title={isEditMode ? "İptal & Kapat" : "Kapat"}
                  aria-label="Kapat"
                >
                  <X className="w-5 h-5" />
                </button>
              )}
            </div>
          </div>

          {/* 5-Segment Step Indicator */}
          <div className="grid grid-cols-5 gap-2 pt-1">
            {[
              { num: 1, label: "İsim" },
              { num: 2, label: "Yaş & Şehir" },
              { num: 3, label: "Hayat Rolü" },
              { num: 4, label: "Öncelik" },
              { num: 5, label: "Analiz" },
            ].map((s) => {
              const isPassed = step > s.num;
              const isCurrent = step === s.num;
              return (
                <div key={s.num} className="space-y-1">
                  <div
                    className={`h-1.5 rounded-full transition-all duration-300 ${
                      isPassed
                        ? "bg-emerald-400"
                        : isCurrent
                        ? "bg-cyan-400 ring-2 ring-cyan-400/30"
                        : "bg-slate-800"
                    }`}
                  />
                  <div className="flex items-center justify-between text-[11px] font-mono">
                    <span
                      className={`${
                        isCurrent
                          ? "text-cyan-300 font-bold"
                          : isPassed
                          ? "text-emerald-400"
                          : "text-slate-500"
                      }`}
                    >
                      {s.label}
                    </span>
                    {isPassed && <Check className="w-3 h-3 text-emerald-400 inline" />}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* ERROR NOTIFICATION */}
        {errorMsg && (
          <div className="mx-6 sm:mx-8 mt-4 p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/30 flex items-center gap-3 text-rose-300 text-xs sm:text-sm animate-in fade-in">
            <AlertCircle className="w-5 h-5 shrink-0 text-rose-400" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* STEP CONTENT BODY */}
        <div className="p-6 sm:p-8 space-y-6">
          <AnimatePresence mode="wait">
            {/* STEP 1: KULLANICI ADI OLUŞTUR */}
            {step === 1 && (
              <motion.div
                key="step-1"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div className="space-y-2">
                  <span className="text-xs font-mono uppercase tracking-wider text-cyan-400 font-bold flex items-center gap-1.5">
                    <User className="w-4 h-4" /> 1. Aşama: Kimliğiniz
                  </span>
                  <h3 className="text-xl sm:text-2xl font-bold text-white">
                    Platformda size nasıl hitap edelim?
                  </h3>
                  <p className="text-sm text-slate-300 leading-relaxed">
                    Bu isim platformda görünecek <strong>tek herkese açık</strong> bilginizdir. Gerçek adınızı (Örn: <em>Ahmet Yılmaz</em>) veya sevdiğiniz bir kullanıcı adını yazabilirsiniz.
                  </p>
                </div>

                <div className="space-y-2">
                  <label className="block text-xs font-bold font-mono text-slate-300 uppercase tracking-wider">
                    Görünecek İsim / Kullanıcı Adı
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-cyan-400">
                      <User className="w-5 h-5" />
                    </div>
                    <input
                      type="text"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      placeholder="Örn: Ahmet Bey, Emekli_Gezgin, Aylin..."
                      autoFocus
                      className="w-full pl-12 pr-4 py-4 rounded-2xl bg-slate-950/80 border border-slate-700 focus:border-cyan-400 focus:ring-4 focus:ring-cyan-500/20 text-white text-base sm:text-lg font-medium outline-none transition"
                    />
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-start gap-3 text-xs sm:text-sm text-blue-200">
                  <ShieldCheck className="w-5 h-5 shrink-0 text-cyan-400 mt-0.5" />
                  <p>
                    <strong>Gizlilik Güvencesi:</strong> İlerleyen adımlarda gireceğiniz yaş, cinsiyet ve konum bilgileri varsayılan olarak tamamen gizli tutulur. Diğer kullanıcılar yalnızca burada yazdığınız ismi görebilir.
                  </p>
                </div>
              </motion.div>
            )}

            {/* STEP 2: YAŞ, CİNSİYET & ŞEHİR */}
            {step === 2 && (
              <motion.div
                key="step-2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div className="space-y-2">
                  <span className="text-xs font-mono uppercase tracking-wider text-cyan-400 font-bold flex items-center gap-1.5">
                    <MapPin className="w-4 h-4" /> 2. Aşama: Temel Bilgileriniz
                  </span>
                  <h3 className="text-xl sm:text-2xl font-bold text-white">
                    Yaşınız, Cinsiyetiniz ve Yaşadığınız Şehir
                  </h3>
                  <p className="text-sm text-slate-300 leading-relaxed">
                    Bu veriler; 2026–2060 arasındaki sağlık, emeklilik, enflasyon ve istihdam dalgalarını <strong>doğrudan sizin hayat evrenize</strong> uyarlamak için kullanılır.
                  </p>
                </div>

                {/* Privacy Badge */}
                <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/25 flex items-center justify-between gap-3 text-xs sm:text-sm text-emerald-200">
                  <div className="flex items-center gap-2.5">
                    <Lock className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>Bu bilgiler varsayılan olarak <strong>herkese gizlidir</strong>.</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsProfilePrivate(!isProfilePrivate)}
                    className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-slate-900 border border-white/10 text-xs font-mono font-bold text-white hover:border-emerald-400 transition"
                  >
                    {isProfilePrivate ? (
                      <>
                        <EyeOff className="w-3.5 h-3.5 text-emerald-400" />
                        <span>Gizli (Açık)</span>
                      </>
                    ) : (
                      <>
                        <Eye className="w-3.5 h-3.5 text-amber-400" />
                        <span>Profilde Göster</span>
                      </>
                    )}
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Yaş Seçimi */}
                  <div className="space-y-2">
                    <label className="block text-xs font-bold font-mono text-slate-300 uppercase tracking-wider">
                      Yaşınız
                    </label>
                    <input
                      type="number"
                      min={7}
                      max={110}
                      value={age || ""}
                      onChange={(e) => setAge(Number(e.target.value))}
                      placeholder="Örn: 55"
                      className="w-full px-4 py-3.5 rounded-2xl bg-slate-950/80 border border-slate-700 focus:border-cyan-400 focus:ring-2 focus:ring-cyan-500/20 text-white text-lg font-bold outline-none transition font-mono"
                    />
                    {/* Hızlı Yaş Butonları */}
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {[
                        { label: "18-24 (Genç)", val: 21 },
                        { label: "25-39 (Kariyer)", val: 32 },
                        { label: "40-54 (Olgun)", val: 47 },
                        { label: "55-64 (Kıdemli)", val: 58 },
                        { label: "65+ (Emekli)", val: 68 },
                      ].map((grp) => (
                        <button
                          key={grp.label}
                          type="button"
                          onClick={() => setAge(grp.val)}
                          className={`px-2.5 py-1 rounded-xl text-[11px] font-mono border transition ${
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
                  <div className="space-y-2">
                    <label className="block text-xs font-bold font-mono text-slate-300 uppercase tracking-wider">
                      Cinsiyet
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      {["Erkek", "Kadın", "Belirtmek İstemiyorum"].map((g) => {
                        const isSel = gender === g;
                        return (
                          <button
                            key={g}
                            type="button"
                            onClick={() => setGender(g)}
                            className={`p-3 rounded-2xl border text-xs sm:text-sm font-bold transition flex flex-col items-center justify-center text-center gap-1 ${
                              isSel
                                ? "bg-cyan-500/20 border-cyan-400 text-white shadow-md shadow-cyan-500/20"
                                : "bg-slate-950/60 border-white/10 text-slate-400 hover:text-white hover:bg-slate-900"
                            }`}
                          >
                            <span>{g}</span>
                            {isSel && <Check className="w-3.5 h-3.5 text-cyan-400" />}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* Şehir Seçimi */}
                <div className="space-y-2">
                  <label className="block text-xs font-bold font-mono text-slate-300 uppercase tracking-wider flex items-center justify-between">
                    <span>Yaşadığınız Şehir (Türkiye)</span>
                    <span className="text-[11px] text-slate-500 font-normal">Yerel ekonomik projeksiyonlar için</span>
                  </label>
                  <select
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full px-4 py-3.5 rounded-2xl bg-slate-950/80 border border-slate-700 focus:border-cyan-400 focus:ring-2 focus:ring-cyan-500/20 text-white text-base font-medium outline-none transition cursor-pointer"
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

            {/* STEP 3: HAYAT ROLÜNÜZ / MESLEKİ DURUM */}
            {step === 3 && (
              <motion.div
                key="step-3"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-4"
              >
                <div className="space-y-1">
                  <span className="text-xs font-mono uppercase tracking-wider text-cyan-400 font-bold flex items-center gap-1.5">
                    <Briefcase className="w-4 h-4" /> 3. Aşama: Hayat Rolünüz
                  </span>
                  <h3 className="text-xl sm:text-2xl font-bold text-white">
                    Şu anki durumunuz hangisine daha yakın?
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-300">
                    Sistemimiz, karmaşık terimler yerine doğrudan sizin hayatınızı ilgilendiren dili seçecektir.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[46vh] overflow-y-auto pr-1">
                  {LIFE_ROLES.map((role) => {
                    const isSel = lifeRole === role.id;
                    const IconComp = role.icon;
                    return (
                      <div
                        key={role.id}
                        onClick={() => {
                          setLifeRole(role.id);
                          if (role.samplePriority) {
                            setPrimaryGoal(role.samplePriority);
                          }
                        }}
                        className={`p-3.5 sm:p-4 rounded-2xl border cursor-pointer transition-all flex items-start gap-3 text-left ${
                          isSel
                            ? "bg-slate-900 border-cyan-400 ring-2 ring-cyan-500/30 shadow-lg shadow-cyan-500/10"
                            : "bg-slate-950/60 border-white/5 hover:border-slate-700 hover:bg-slate-900/60"
                        }`}
                      >
                        <div
                          className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                            isSel
                              ? "bg-cyan-500 text-slate-950 font-bold"
                              : "bg-slate-900 border border-white/10 text-slate-300"
                          }`}
                        >
                          <IconComp className="w-5 h-5" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center justify-between gap-1">
                            <h4 className="text-sm font-bold text-white">{role.title}</h4>
                            {isSel && <Check className="w-4 h-4 text-cyan-400 shrink-0" />}
                          </div>
                          <p className="text-xs text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                            {role.subtitle}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </motion.div>
            )}

            {/* STEP 4: 1 NUMARALI GELECEK ÖNCELİĞİ */}
            {step === 4 && (
              <motion.div
                key="step-4"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-4"
              >
                <div className="space-y-1">
                  <span className="text-xs font-mono uppercase tracking-wider text-cyan-400 font-bold flex items-center gap-1.5">
                    <Target className="w-4 h-4" /> 4. Aşama: 1 Numaralı Önceliğiniz
                  </span>
                  <h3 className="text-xl sm:text-2xl font-bold text-white">
                    Geleceğe baktığınızda en çok neyi önemsiyorsunuz?
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-300">
                    Sistem, 2026–2060 arasındaki yüzlerce gelişmeyi bu cevabınıza göre önceliklendirecektir.
                  </p>
                </div>

                <div className="space-y-2.5 max-h-[46vh] overflow-y-auto pr-1">
                  {PRIMARY_GOALS.map((goal) => {
                    const isSel = primaryGoal === goal.id;
                    const IconComp = goal.icon;
                    return (
                      <div
                        key={goal.id}
                        onClick={() => setPrimaryGoal(goal.id)}
                        className={`p-4 rounded-2xl border cursor-pointer transition-all flex items-center justify-between gap-3 text-left ${
                          isSel
                            ? "bg-slate-900 border-cyan-400 ring-2 ring-cyan-500/30 shadow-lg shadow-cyan-500/10"
                            : "bg-slate-950/60 border-white/5 hover:border-slate-700 hover:bg-slate-900/60"
                        }`}
                      >
                        <div className="flex items-center gap-3.5 min-w-0">
                          <div
                            className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                              isSel
                                ? "bg-cyan-500 text-slate-950 font-bold"
                                : "bg-slate-900 border border-white/10 text-slate-300"
                            }`}
                          >
                            <IconComp className="w-5 h-5" />
                          </div>
                          <div>
                            <h4 className="text-sm font-bold text-white">{goal.title}</h4>
                            <p className="text-xs text-slate-400 mt-0.5">{goal.desc}</p>
                          </div>
                        </div>

                        <div className="shrink-0">
                          {isSel ? (
                            <div className="w-6 h-6 rounded-full bg-cyan-400 text-slate-950 flex items-center justify-center">
                              <Check className="w-4 h-4 font-bold" />
                            </div>
                          ) : (
                            <div className="w-6 h-6 rounded-full border border-slate-700" />
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </motion.div>
            )}

            {/* STEP 5: ÖZET VE KOKPİTE GİRİŞ */}
            {step === 5 && (
              <motion.div
                key="step-5"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div className="text-center space-y-2">
                  <div className="w-14 h-14 rounded-3xl bg-gradient-to-tr from-cyan-500 to-blue-600 text-white flex items-center justify-center mx-auto shadow-xl shadow-cyan-500/25">
                    <Sparkles className="w-7 h-7" />
                  </div>
                  <h3 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                    Tebrikler, {username}!
                  </h3>
                  <p className="text-sm text-slate-300 max-w-md mx-auto">
                    Kişisel Gelecek Kokpitiniz hazırlandı. Artık yüzlerce karmaşık sekme arasında kaybolmak zorunda değilsiniz.
                  </p>
                </div>

                {/* Sentez Özeti Kartı */}
                <div className="p-5 rounded-3xl bg-slate-900/90 border border-cyan-500/30 space-y-4 shadow-xl">
                  <div className="flex items-center justify-between border-b border-white/10 pb-3">
                    <span className="text-xs font-mono text-cyan-400 uppercase tracking-wider font-bold">
                      Kişisel Profil Analiz Özeti
                    </span>
                    <span className="text-xs font-mono text-emerald-400 flex items-center gap-1 font-bold">
                      <ShieldCheck className="w-4 h-4" /> %100 Hazır
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    <div className="p-3 rounded-2xl bg-slate-950/60 border border-white/5 space-y-1">
                      <span className="text-slate-500 font-mono block">Görünecek İsim:</span>
                      <span className="text-white font-bold text-sm">{username}</span>
                    </div>

                    <div className="p-3 rounded-2xl bg-slate-950/60 border border-white/5 space-y-1">
                      <span className="text-slate-500 font-mono block">Gizli Profil Verisi:</span>
                      <span className="text-white font-bold text-sm">
                        {age} Yaşında • {selectedRoleObj.title}
                      </span>
                    </div>

                    <div className="p-3 rounded-2xl bg-slate-950/60 border border-white/5 space-y-1">
                      <span className="text-slate-500 font-mono block">Konum:</span>
                      <span className="text-white font-bold text-sm">
                        {city}, {country}
                      </span>
                    </div>

                    <div className="p-3 rounded-2xl bg-slate-950/60 border border-white/5 space-y-1">
                      <span className="text-slate-500 font-mono block">1 Numaralı Öncelik:</span>
                      <span className="text-amber-300 font-bold text-sm truncate block">
                        {selectedGoalObj.title}
                      </span>
                    </div>
                  </div>

                  {/* Özel Analiz Çıktısı */}
                  <div className="p-3.5 rounded-2xl bg-blue-500/10 border border-blue-500/20 text-xs text-blue-200 leading-relaxed">
                    💡 <strong>Sistem Notu:</strong> 2026–2060 Canlı Zaman Çizelgesi'ne girdiğinizde,{" "}
                    <strong>{age} yaş grubu</strong> ve <strong>{selectedRoleObj.title}</strong> durumunuz için en kritik yıllar
                    parlatılarak en üste getirilecek.
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* FOOTER ACTIONS */}
        <div className="p-6 sm:p-8 border-t border-white/10 bg-slate-950/50 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            {step > 1 && step < 5 && (
              <button
                type="button"
                onClick={handlePrevStep}
                className="px-5 py-3.5 rounded-2xl border border-white/10 hover:border-slate-600 bg-slate-900 text-slate-300 hover:text-white text-sm font-bold transition flex items-center gap-2 cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Geri</span>
              </button>
            )}

            {onClose && (
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-3 rounded-2xl border border-white/10 hover:border-slate-700 bg-slate-900/60 text-slate-400 hover:text-white text-xs sm:text-sm font-medium transition cursor-pointer"
              >
                {isEditMode ? "İptal" : "Daha Sonra Tamamla"}
              </button>
            )}
          </div>

          {step < 5 ? (
            <button
              type="button"
              onClick={handleNextStep}
              className="ml-auto px-7 py-3.5 rounded-2xl bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white text-sm sm:text-base font-bold shadow-lg shadow-cyan-500/25 transition-all flex items-center gap-2 cursor-pointer hover:scale-102"
            >
              <span>İlerle</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              type="button"
              onClick={handleFinishOnboarding}
              className="w-full sm:w-auto ml-auto py-3.5 px-6 rounded-2xl bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 text-slate-950 text-sm sm:text-base font-extrabold shadow-xl shadow-emerald-500/25 transition-all flex items-center justify-center gap-3 cursor-pointer hover:scale-102"
            >
              <Sparkles className="w-5 h-5 text-slate-950" />
              <span>
                {isEditMode
                  ? "Değişiklikleri Kaydet & Geleceğimi Gör ➔"
                  : "Geleceğimi Keşfetmeye Başla (2026–2060) ➔"}
              </span>
            </button>
          )}
        </div>
      </motion.div>
    </div>
  );
};
