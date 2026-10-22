import React, { useState } from "react";
import { UserAccountProfile } from "../types";
import { useLanguage } from "../context/LanguageContext";
import { useAuth } from "../context/AuthContext";
import { useBadges } from "../context/BadgeContext";
import {
  X,
  User,
  Award,
  ShieldCheck,
  CheckCircle2,
  Flame,
  Edit3,
  Save,
  Layers,
  Sparkles,
  Lock,
  LogIn,
  LogOut,
  ArrowRight,
  TrendingUp,
  Zap,
  GitMerge,
  ShieldAlert,
  Network,
  Users,
  Compass,
  Search,
  Filter,
  Brain,
  Atom,
  Cpu,
  Globe,
  Coins,
  Gift,
  Star,
  Clock,
  Info,
  Trash2,
  AlertCircle,
  Film,
  Play,
  Target,
} from "lucide-react";
import { RewardedAdModal } from "./RewardedAdModal";
import { isUserProfileComplete } from "./UserAuthModal";
import { AdBanner } from "./AdBanner";
import {
  getCollectionItems,
  getSpinAnalytics,
  FutureCollectionItem
} from "../utils/spinStorage";

interface UserProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultTab?: "profile" | "badges" | "collection";
  onOpenAdmin?: () => void;
  onOpenOnboarding?: () => void;
}

const DEFAULT_PROFILE: UserAccountProfile = {
  id: "usr_9981",
  username: "Futurologist_Arda",
  email: "arda.futurist@example.com",
  avatarUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80",
  profession: "",
  titleBadge: "Kıdemli Gelecek Analisti Level 4",
  accuracyScore: 94.2,
  predictionsCount: 18,
  joinedDate: "2026-03-15",
  savedRoadmaps: 3,
};

const BADGE_ICONS: Record<string, React.FC<{ className?: string }>> = {
  Sparkles,
  TrendingUp,
  Zap,
  GitMerge,
  ShieldAlert,
  Network,
  Users,
  Compass,
  Award,
};

const TECH_ICONS: Record<string, React.FC<{ className?: string }>> = {
  Brain,
  Atom,
  Cpu,
  Zap,
  Globe,
  Coins,
  Sparkles,
  Award
};

export const UserProfileModal: React.FC<UserProfileModalProps> = ({
  isOpen,
  onClose,
  defaultTab = "profile",
  onOpenAdmin,
  onOpenOnboarding,
}) => {
  const { language, t } = useLanguage();
  const isTr = language === "tr";
  const { currentUser, openAuthModal, logout, lockSession, updateUserProfile, deleteCurrentUserAccount, setCreditStoreModalOpen } = useAuth();
  const { badges, unlockedCount, totalXp } = useBadges();

  const [activeTab, setActiveTab] = useState<"profile" | "badges" | "collection">(defaultTab || "profile");
  const [isRewardedAdOpen, setIsRewardedAdOpen] = useState(false);
  const [badgeSearch, setBadgeSearch] = useState("");
  const [badgeFilter, setBadgeFilter] = useState<"all" | "unlocked" | "locked">("all");
  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);
  const [isDeletingAccount, setIsDeletingAccount] = useState(false);
  const [deleteError, setDeleteError] = useState<string>("");

  // Collection filters
  const [collectionCategory, setCollectionCategory] = useState<string>("all");
  const [selectedTechDetail, setSelectedTechDetail] = useState<FutureCollectionItem | null>(null);

  const [isEditing, setIsEditing] = useState(false);
  const [username, setUsername] = useState(currentUser?.fullName || "");
  const [profession, setProfession] = useState(currentUser?.profession || "");
  const [age, setAge] = useState<number | string>(currentUser?.age || "");
  const [city, setCity] = useState(currentUser?.city || "İstanbul");
  const [employmentStatus, setEmploymentStatus] = useState(currentUser?.employmentStatus || "employed");
  const [seniority, setSeniority] = useState(currentUser?.seniority || "Mid-Level / Uzman (3-5 Yıl)");
  const [industrySector, setIndustrySector] = useState(currentUser?.industrySector || "Bilişim & Genel Sektör");
  const [personalGoal, setPersonalGoal] = useState(currentUser?.personalGoal || currentUser?.primaryGoalLabel || "");

  React.useEffect(() => {
    if (currentUser) {
      setUsername(currentUser.fullName || "");
      setProfession(currentUser.profession || "");
      setAge(currentUser.age || "");
      setCity(currentUser.city || "İstanbul");
      setEmploymentStatus(currentUser.employmentStatus || "employed");
      setSeniority(currentUser.seniority || "Mid-Level / Uzman (3-5 Yıl)");
      setIndustrySector(currentUser.industrySector || "Bilişim & Genel Sektör");
      setPersonalGoal(currentUser.personalGoal || currentUser.primaryGoalLabel || "");
    }
  }, [currentUser, isOpen]);

  // Lock background scroll when modal is open so only modal scrolls
  React.useEffect(() => {
    if (isOpen) {
      const originalOverflow = document.body.style.overflow;
      const originalTouchAction = document.body.style.touchAction;
      document.body.style.overflow = "hidden";
      document.body.style.touchAction = "none";
      return () => {
        document.body.style.overflow = originalOverflow;
        document.body.style.touchAction = originalTouchAction;
      };
    }
  }, [isOpen]);

  if (!isOpen) return null;

  if (!currentUser) {
    return (
      <div
        onClick={onClose}
        className="fixed inset-0 z-[110] flex items-center justify-center p-3 sm:p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-200 font-sans"
      >
        <div
          onClick={(e) => e.stopPropagation()}
          className="bg-slate-900 border border-cyan-500/30 rounded-3xl w-full max-w-md p-6 sm:p-8 flex flex-col items-center text-center shadow-2xl relative text-slate-100"
        >
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-all cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="w-16 h-16 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 mb-4 shadow-lg shadow-cyan-500/10">
            <Lock className="w-8 h-8" />
          </div>

          <h2 className="text-xl font-black text-white font-mono uppercase mb-2">
            OTURUM KAPALI
          </h2>
          <p className="text-sm text-slate-300 mb-6 leading-relaxed font-sans">
            Profilinizi, kazandığınız rozetleri, kredi bakiyenizi ve kişisel gelecek koleksiyonunuzu görüntülemek için lütfen giriş yapın.
          </p>

          <div className="flex flex-col gap-3 w-full font-mono">
            <button
              onClick={() => {
                onClose();
                openAuthModal();
              }}
              className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-blue-600 via-cyan-500 to-emerald-400 text-slate-950 font-bold text-sm hover:opacity-90 transition-all shadow-lg shadow-cyan-500/20 flex items-center justify-center gap-2 cursor-pointer"
            >
              <LogIn className="w-4 h-4" />
              <span>GİRİŞ YAP / KAYIT OL</span>
            </button>

            <button
              onClick={onClose}
              className="w-full py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs transition-all cursor-pointer"
            >
              Kapat
            </button>
          </div>
        </div>
      </div>
    );
  }

  const activeProfile: UserAccountProfile = {
    id: currentUser.id || "usr_current",
    username: currentUser.username || currentUser.fullName || "Kullanıcı",
    email: currentUser.email,
    avatarUrl: currentUser.avatarUrl || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80",
    profession: currentUser.profession || "",
    titleBadge: currentUser.plan === "quantum_vip" ? "Quantum VIP Kahini Level 5" : currentUser.plan === "pro" ? "Pro Futurist Level 3" : "Gelecek Analisti Level 1",
    accuracyScore: 98.2,
    predictionsCount: 24,
    joinedDate: "2026-08-01",
    savedRoadmaps: 5,
  };

  const collectionItems = getCollectionItems();
  const spinAnalytics = getSpinAnalytics();

  const handleSave = () => {
    if (currentUser) {
      const cleanName = username.trim() || currentUser.fullName || currentUser.username || "Kullanıcı";
      const cleanGoal = personalGoal.trim() || currentUser.personalGoal || currentUser.primaryGoalLabel || "";
      updateUserProfile({
        fullName: cleanName,
        username: cleanName,
        profession: profession.trim() ? profession.trim() : undefined,
        age: age ? Number(age) : currentUser.age,
        city: city.trim(),
        employmentStatus,
        seniority,
        industrySector,
        personalGoal: cleanGoal,
        primaryGoalLabel: cleanGoal,
        isOnboardingCompleted: true,
      });
    }
    setIsEditing(false);
  };

  const handleRegisterClick = () => {
    onClose();
    openAuthModal();
  };

  // Filtered badges list for Badge Gallery
  const filteredBadges = badges.filter((b) => {
    if (badgeFilter === "unlocked" && !b.unlocked) return false;
    if (badgeFilter === "locked" && b.unlocked) return false;
    if (badgeSearch.trim() !== "") {
      const q = badgeSearch.toLowerCase();
      return (
        b.name.toLowerCase().includes(q) ||
        b.description.toLowerCase().includes(q) ||
        b.requirementText.toLowerCase().includes(q)
      );
    }
    return true;
  });

  // Filtered Collection Items
  const filteredCollection = collectionItems.filter((item) => {
    if (collectionCategory !== "all" && item.category !== collectionCategory) return false;
    return true;
  });

  return (
    <div
      data-testid="user-profile-overlay"
      onClick={onClose}
      className="fixed inset-0 z-[100] flex items-center justify-center p-2 sm:p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-200 overscroll-contain touch-none"
    >
      <div
        data-testid="user-profile-modal"
        onClick={(e) => e.stopPropagation()}
        className={`bg-slate-900 border border-cyan-500/30 rounded-2xl sm:rounded-3xl w-full ${activeTab === "collection" ? "max-w-5xl" : "max-w-3xl"} h-[88dvh] max-h-[92dvh] sm:max-h-[90vh] flex flex-col overflow-hidden shadow-2xl relative font-sans text-slate-100 transition-all duration-300 overscroll-contain touch-auto`}
      >
        
        {/* Header Bar */}
        <div className="p-4 sm:p-5 bg-gradient-to-r from-cyan-950/80 via-slate-900 to-indigo-950/80 border-b border-white/10 flex items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-2xl bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-cyan-400 font-bold shrink-0">
              <User className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <h2 className="font-bold text-white text-sm sm:text-base font-mono uppercase truncate">
                {activeTab === "profile" && "Kullanıcı Profili"}
                {activeTab === "badges" && "Rozet Galerisi & Başarılar"}
                {activeTab === "collection" && "Dijital Gelecek Koleksiyonu"}
              </h2>
              <p className="text-[11px] sm:text-xs text-cyan-400 font-mono truncate">
                {activeProfile.username} • {spinAnalytics.isWheelOracle ? "🎡 Aktif Çark Kahini" : activeProfile.titleBadge}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => {
                lockSession("inactivity");
                onClose();
              }}
              className="p-2 rounded-xl bg-slate-800 hover:bg-cyan-500/20 hover:border-cyan-500/40 border border-white/10 text-cyan-300 transition-all cursor-pointer flex items-center gap-1.5 font-mono text-xs font-bold"
              title="Oturumu Kilitle"
            >
              <Lock className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Kilitle</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-slate-800 hover:bg-rose-500/20 hover:border-rose-500/40 border border-white/10 text-slate-400 hover:text-white transition-all cursor-pointer"
              title="Kapat"
            >
              <X className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
          </div>
        </div>

        {/* Tab Switcher Bar */}
        <div className="px-4 py-2 bg-slate-950/90 border-b border-white/5 flex items-center gap-2 overflow-x-auto shrink-0 font-mono text-xs">
          <button
            data-testid="tab-profile"
            onClick={() => setActiveTab("profile")}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl font-bold transition-all cursor-pointer whitespace-nowrap ${
              activeTab === "profile"
                ? "bg-cyan-600 text-white shadow-md shadow-cyan-600/30"
                : "text-slate-400 hover:text-white bg-slate-900/60"
            }`}
          >
            <User className="w-3.5 h-3.5" />
            <span>Profil</span>
          </button>

          <button
            data-testid="tab-collection"
            onClick={() => setActiveTab("collection")}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl font-bold transition-all cursor-pointer whitespace-nowrap ${
              activeTab === "collection"
                ? "bg-amber-500 text-slate-950 shadow-md shadow-amber-500/30 font-black"
                : "text-amber-400 hover:text-amber-200 bg-slate-900/60"
            }`}
          >
            <Gift className="w-3.5 h-3.5" />
            <span>Koleksiyon ({collectionItems.length})</span>
          </button>

          <button
            data-testid="tab-badges"
            onClick={() => setActiveTab("badges")}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl font-bold transition-all cursor-pointer whitespace-nowrap ${
              activeTab === "badges"
                ? "bg-purple-600 text-white shadow-md shadow-purple-600/30 font-bold"
                : "text-purple-400 hover:text-purple-200 bg-slate-900/60"
            }`}
          >
            <Award className="w-3.5 h-3.5" />
            <span>Rozetler ({unlockedCount})</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-3.5 sm:p-6 overflow-y-auto overscroll-contain space-y-6 flex-1 min-h-0 touch-pan-y">
          
          {/* TAB 1: PROFILE INFO */}
          {activeTab === "profile" && (
            <>
              {/* Main Card Header */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-slate-950/80 p-4 sm:p-5 rounded-2xl border border-white/10">
                <div className="flex items-center gap-3.5 min-w-0 flex-1">
                  <div className="relative shrink-0">
                    <img
                      src={activeProfile.avatarUrl}
                      alt="Avatar"
                      className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl object-cover border-2 border-cyan-500/50"
                    />
                    <span className="absolute -bottom-1 -right-1 p-1 rounded-full bg-emerald-500 text-slate-950 border border-slate-900">
                      <CheckCircle2 className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                    </span>
                  </div>

                  <div className="flex-1 min-w-0">
                    {isEditing ? (
                      <div className="space-y-2">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          <input
                            type="text"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            placeholder="Kullanıcı Adı"
                            className="bg-slate-900 border border-cyan-500 rounded-lg px-3 py-1.5 text-xs font-mono text-white focus:outline-none"
                          />
                          <input
                            type="text"
                            value={profession}
                            onChange={(e) => setProfession(e.target.value)}
                            placeholder={isTr ? "Uzmanlık / Meslek (örn: Yazılım Mühendisi)" : "Profession / Expertise"}
                            className="bg-slate-900 border border-cyan-500 rounded-lg px-3 py-1.5 text-xs text-slate-300 focus:outline-none"
                          />
                        </div>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                          <input
                            type="number"
                            value={age}
                            onChange={(e) => setAge(e.target.value)}
                            placeholder="Yaş (örn: 30)"
                            className="bg-slate-900 border border-cyan-500/70 rounded-lg px-2.5 py-1 text-xs font-mono text-cyan-300 focus:outline-none"
                          />
                          <input
                            type="text"
                            value={city}
                            onChange={(e) => setCity(e.target.value)}
                            placeholder="Şehir"
                            className="bg-slate-900 border border-cyan-500/70 rounded-lg px-2.5 py-1 text-xs text-slate-300 focus:outline-none"
                          />
                          <input
                            type="text"
                            value={industrySector}
                            onChange={(e) => setIndustrySector(e.target.value)}
                            placeholder="Sektör"
                            className="bg-slate-900 border border-cyan-500/70 rounded-lg px-2.5 py-1 text-xs text-slate-300 focus:outline-none col-span-2 sm:col-span-1"
                          />
                        </div>
                        <input
                          type="text"
                          value={personalGoal}
                          onChange={(e) => setPersonalGoal(e.target.value)}
                          placeholder="Gelecek / Kariyer Hedefiniz"
                          className="w-full bg-slate-900 border border-cyan-500/70 rounded-lg px-3 py-1.5 text-xs text-slate-300 focus:outline-none"
                        />
                      </div>
                    ) : (
                      <div>
                        <h3 className="font-bold text-white text-base sm:text-lg font-mono truncate">
                          {activeProfile.username}
                        </h3>
                        <p className="text-xs text-cyan-300 font-sans mt-0.5 truncate">
                          {activeProfile.profession || (isTr ? "Meslek belirtilmedi" : "No profession specified")}
                        </p>
                        <p className="text-[10px] font-mono text-slate-500 mt-1">Katılım: {activeProfile.joinedDate}</p>
                      </div>
                    )}
                  </div>
                </div>

                <div className="w-full sm:w-auto flex items-center justify-end gap-2 shrink-0">
                  <button
                    onClick={() => (isEditing ? handleSave() : setIsEditing(true))}
                    className="w-full sm:w-auto px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-cyan-300 font-mono text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer border border-cyan-500/30"
                  >
                    {isEditing ? <Save className="w-3.5 h-3.5" /> : <Edit3 className="w-3.5 h-3.5" />}
                    <span>{isEditing ? "Kaydet" : "Profili Düzenle"}</span>
                  </button>
                </div>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 font-mono text-center">
                <div className="bg-slate-950/80 p-3.5 rounded-2xl border border-cyan-500/20 space-y-1">
                  <span className="text-xl font-extrabold text-cyan-400">%{activeProfile.accuracyScore}</span>
                  <p className="text-[10px] text-slate-400 uppercase">Tahmin İsabeti</p>
                </div>

                <div className="bg-slate-950/80 p-3.5 rounded-2xl border border-amber-500/20 space-y-1">
                  <span className="text-xl font-extrabold text-amber-400">{spinAnalytics.totalSpins}</span>
                  <p className="text-[10px] text-slate-400 uppercase">Çark Çevirme</p>
                </div>

                <div className="bg-slate-950/80 p-3.5 rounded-2xl border border-emerald-500/20 space-y-1">
                  <span className="text-xl font-extrabold text-emerald-400">+{spinAnalytics.totalCreditsWon}</span>
                  <p className="text-[10px] text-slate-400 uppercase">Çark Kredisi</p>
                </div>

                <div className="bg-slate-950/80 p-3.5 rounded-2xl border border-purple-500/20 space-y-1">
                  <span className="text-xl font-extrabold text-purple-400">{collectionItems.length}</span>
                  <p className="text-[10px] text-slate-400 uppercase">Gelecek Kartı</p>
                </div>
              </div>

              {/* Credit Balance & Rewarded Ad Action Card */}
              <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-amber-950/40 p-4 sm:p-5 rounded-2xl border border-amber-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3.5">
                  <div className="p-3 rounded-2xl bg-amber-500/20 border border-amber-400/40 text-amber-300 shrink-0">
                    <Coins className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs font-mono text-slate-400">Yapay Zeka İşlem Bakiyesi:</span>
                      <span className="text-base font-bold font-mono text-amber-400">
                        {currentUser?.credits ?? 0} Kredi
                      </span>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-mono uppercase bg-amber-500/20 text-amber-300 border border-amber-500/30">
                        {isTr ? "Standart Gelecek Hesabı" : "Standard Future Account"}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-300 font-sans mt-0.5">
                      15 saniyelik video izleyerek anında bedava +5 kredi kazanın veya mağazadan avantajlı paket yükleyin.
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                  <button
                    type="button"
                    onClick={() => setIsRewardedAdOpen(true)}
                    className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-slate-950 font-bold font-mono text-xs flex items-center gap-1.5 shadow-md shadow-emerald-500/20 cursor-pointer active:scale-95 transition-all"
                  >
                    <Play className="w-3.5 h-3.5 fill-slate-950" />
                    <span>Reklam İzle (+5)</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      setCreditStoreModalOpen(true);
                    }}
                    className="px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold font-mono text-xs flex items-center gap-1.5 shadow-md shadow-amber-500/20 cursor-pointer active:scale-95 transition-all"
                  >
                    <Coins className="w-3.5 h-3.5" />
                    <span>Kredi Yükle</span>
                  </button>
                </div>
              </div>

              {/* Native Futuristic Sponsor Banner */}
              <AdBanner slot="profile_modal_sponsor" format="horizontal" />

              {/* 5-Step Personalized Future Profile Overview & Wizard Button */}
              <div className="bg-gradient-to-r from-cyan-950/70 via-slate-900 to-blue-950/70 p-4 sm:p-5 rounded-2xl border border-cyan-500/30 space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-cyan-500/20 border border-cyan-500/30 flex items-center justify-center text-cyan-400 shrink-0">
                      <Sparkles className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-bold text-white text-sm font-mono flex items-center gap-2">
                        <span>Kişiselleştirilmiş Gelecek Profili</span>
                        <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-mono border border-emerald-500/30">
                          {isUserProfileComplete(currentUser) ? "Aktif & Eşleştirildi" : "Tamamlanmadı"}
                        </span>
                      </h4>
                      <p className="text-xs text-slate-300 font-sans mt-0.5">
                        Yaş, meslek/rol, kıdem ve önceliklerinize göre takvimi ve analizleri filtreleyen profil ayarlarınız.
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      window.dispatchEvent(new CustomEvent("reopen_registration_wizard"));
                      if (onOpenOnboarding) onOpenOnboarding();
                    }}
                    className="px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold font-mono text-xs flex items-center justify-center gap-2 shadow-md shadow-cyan-500/20 cursor-pointer transition-all self-start sm:self-center shrink-0"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    <span>{isUserProfileComplete(currentUser) ? "Profili Düzenle" : "Profili Tamamla (5 Adım)"}</span>
                  </button>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 font-mono text-xs">
                  <div className="p-2.5 rounded-xl bg-slate-950/80 border border-white/5 space-y-0.5">
                    <span className="text-[10px] text-slate-500 block">Kullanıcı Adı:</span>
                    <span className="font-bold text-white truncate block">
                      {currentUser?.username || currentUser?.fullName || "Belirtilmedi"}
                    </span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-slate-950/80 border border-white/5 space-y-0.5">
                    <span className="text-[10px] text-slate-500 block">Gizli Yaş & Cinsiyet:</span>
                    <span className="font-bold text-cyan-300 truncate block">
                      {currentUser?.age ? `${currentUser.age} Yaş` : "Belirtilmedi"} • {currentUser?.gender || "-"}
                    </span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-slate-950/80 border border-white/5 space-y-0.5">
                    <span className="text-[10px] text-slate-500 block">Uzmanlık / Meslek:</span>
                    <span className="font-bold text-cyan-300 truncate block">
                      {currentUser?.profession || "Belirtilmedi"}
                    </span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-slate-950/80 border border-white/5 space-y-0.5">
                    <span className="text-[10px] text-slate-500 block">Şehir / Konum:</span>
                    <span className="font-bold text-emerald-400 truncate block">
                      {currentUser?.city || "Türkiye"}
                    </span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-slate-950/80 border border-white/5 space-y-0.5">
                    <span className="text-[10px] text-slate-500 block">Hayat Durumu:</span>
                    <span className="font-bold text-white truncate block">
                      {currentUser?.lifeRoleLabel || currentUser?.lifeRole || "Standart"}
                    </span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-slate-950/80 border border-white/5 space-y-0.5">
                    <span className="text-[10px] text-slate-500 block">Kıdem Seviyesi:</span>
                    <span className="font-bold text-amber-300 truncate block">
                      {currentUser?.seniority || "Belirtilmedi"}
                    </span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-slate-950/80 border border-white/5 space-y-0.5">
                    <span className="text-[10px] text-slate-500 block">Sektör:</span>
                    <span className="font-bold text-purple-300 truncate block">
                      {currentUser?.industrySector || "Belirtilmedi"}
                    </span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-slate-950/80 border border-white/5 space-y-0.5">
                    <span className="text-[10px] text-slate-500 block">Kariyer / Hedef:</span>
                    <span className="font-bold text-cyan-400 truncate block">
                      {currentUser?.personalGoal || currentUser?.primaryGoalLabel || "Belirtilmedi"}
                    </span>
                  </div>
                </div>

                {currentUser?.primaryGoalLabel && (
                  <div className="p-2.5 rounded-xl bg-blue-500/10 border border-blue-500/20 text-xs text-blue-200 flex items-center gap-2">
                    <Target className="w-4 h-4 text-cyan-400 shrink-0" />
                    <span><strong>1 Numaralı Önceliğiniz:</strong> {currentUser.primaryGoalLabel}</span>
                  </div>
                )}
              </div>

              {/* Digital Collection Banner Promo */}
              <div
                onClick={() => setActiveTab("collection")}
                className="bg-gradient-to-r from-amber-950/60 via-slate-900 to-amber-950/60 p-4 rounded-2xl border border-amber-500/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3 cursor-pointer hover:border-amber-400 transition-all group"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-amber-500/20 text-amber-400 shrink-0">
                    <Gift className="w-6 h-6 animate-pulse" />
                  </div>
                  <div>
                    <h4 className="font-bold text-white text-sm font-mono group-hover:text-amber-300 transition-colors">
                      Dijital Gelecek Koleksiyonu ({collectionItems.length} Kart Açıldı)
                    </h4>
                    <p className="text-xs text-slate-400 font-sans mt-0.5">
                      Çarktan kazandığınız Transinsan Sırrı, Kuantum BCI ve AGI teknolojilerinin detaylı analizlerini inceleyin.
                    </p>
                  </div>
                </div>
                <span className="self-end sm:self-center px-3.5 py-1.5 rounded-xl bg-amber-500 group-hover:bg-amber-400 text-slate-950 font-mono text-xs font-black uppercase transition-all shrink-0">
                  Koleksiyona Git →
                </span>
              </div>

              {/* Super Admin Access Banner */}
              {((currentUser?.email || "").toLowerCase().trim() === "warfacelove46@gmail.com" ||
                currentUser?.role === "superadmin" ||
                currentUser?.role === "admin") && (
                <div className="bg-gradient-to-r from-rose-950/80 via-red-900/50 to-slate-900 p-4 rounded-2xl border border-rose-500/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xl shadow-rose-950/30">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-xl bg-rose-500/20 text-rose-300 shrink-0">
                      <ShieldAlert className="w-6 h-6 text-rose-400 animate-pulse" />
                    </div>
                    <div>
                      <h4 className="font-bold text-white text-sm font-mono flex items-center gap-2">
                        <span>🛡️ Süper Yönetici Yetkisi Aktif</span>
                        <span className="px-2 py-0.5 rounded-full bg-rose-500/30 text-rose-300 text-[10px] uppercase font-mono">SUPERADMIN</span>
                      </h4>
                      <p className="text-xs text-rose-200/80 font-sans mt-0.5">
                        warfacelove46@gmail.com hesabınızla tüm sistem, içerik ve kullanıcı yönetim yetkilerine tam erişiminiz mevcuttur.
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      if (onOpenAdmin) onOpenAdmin();
                    }}
                    className="self-end sm:self-center px-4 py-2 rounded-xl bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 text-white font-mono text-xs font-bold uppercase transition-all shadow-lg shadow-rose-600/30 cursor-pointer whitespace-nowrap flex items-center gap-2"
                  >
                    <span>Yönetici Paneline Git</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}

              {/* Google Standard Privacy & Data Management Access */}
              <div className="p-3.5 rounded-2xl bg-cyan-950/40 border border-cyan-500/30 flex items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-2.5">
                  <ShieldCheck className="w-4 h-4 text-cyan-400 shrink-0" />
                  <div>
                    <span className="font-bold text-white text-xs block">Gizlilik, Çerezler & Veri Kontrolü</span>
                    <span className="text-[11px] text-slate-400">Google Gemini gizlilik standartları, yerel geçmişi temizleme ve veri yönetimi</span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    window.dispatchEvent(new CustomEvent("open_privacy_modal"));
                  }}
                  className="px-3 py-1.5 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-400/40 text-cyan-200 font-bold text-xs transition-colors cursor-pointer shrink-0"
                >
                  Yönet →
                </button>
              </div>

              {/* Danger Zone: Account Deletion (KVKK / GDPR Compliance) */}
              <div className="pt-3 border-t border-white/5 font-mono">
                {!isConfirmingDelete ? (
                  <button
                    type="button"
                    onClick={() => setIsConfirmingDelete(true)}
                    className="w-full py-2.5 text-xs text-slate-500 hover:text-rose-400 flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Hesabımı ve Tüm Verilerimi Kalıcı Olarak Sil</span>
                  </button>
                ) : (
                  <div className="p-4 rounded-2xl bg-rose-950/80 border border-rose-500/50 space-y-2.5 text-xs text-rose-200 animate-in fade-in">
                    <div className="flex items-center gap-2 text-rose-300 font-bold">
                      <AlertCircle className="w-4 h-4 text-rose-400" />
                      <span>Hesabı Kalıcı Olarak Silmek İstediğinize Emin Misiniz?</span>
                    </div>
                    <p className="text-[11px] text-rose-300/80 leading-relaxed font-sans">
                      Bu işlem geri alınamaz. Kalan kredileriniz, kayıtlı kişisel yol haritalarınız ve kullanıcı verileriniz sistemden tamamen temizlenir.
                    </p>
                    {deleteError && (
                      <p className="text-[11px] text-rose-300 bg-rose-900/60 p-2 rounded-lg border border-rose-500/50 font-sans">
                        {deleteError}
                      </p>
                    )}
                    <div className="flex items-center gap-2 pt-1">
                      <button
                        disabled={isDeletingAccount}
                        onClick={async () => {
                          setIsDeletingAccount(true);
                          setDeleteError("");
                          try {
                            await deleteCurrentUserAccount();
                            onClose();
                          } catch (delErr: any) {
                            console.error("Hesap silinirken hata:", delErr);
                            setDeleteError(delErr?.message || "Hesap silinirken bir hata oluştu. Lütfen tekrar deneyin.");
                          } finally {
                            setIsDeletingAccount(false);
                          }
                        }}
                        className="flex-1 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs transition-all shadow-md shadow-rose-600/30 cursor-pointer flex items-center justify-center gap-1.5 disabled:opacity-50"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>{isDeletingAccount ? "Siliniyor..." : "Evet, Hesabımı Kalıcı Olarak Sil"}</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setIsConfirmingDelete(false);
                          setDeleteError("");
                        }}
                        className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs transition-all cursor-pointer"
                      >
                        İptal
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </>
          )}

          {/* TAB 2: DİJİTAL GELECEK KOLEKSİYONU */}
          {activeTab === "collection" && (
            <div className="space-y-5">
              
              {/* Collection Header Banner */}
              <div className="p-5 rounded-2xl bg-gradient-to-r from-amber-950/80 via-slate-900 to-cyan-950/80 border border-amber-500/40 flex flex-col sm:flex-row items-center justify-between gap-4 font-mono">
                <div className="space-y-1 text-center sm:text-left">
                  <h3 className="text-lg font-black text-white flex items-center justify-center sm:justify-start gap-2">
                    <Gift className="w-5 h-5 text-amber-400" />
                    <span>DİJİTAL GELECEK KOLEKSİYONU & ANALİTİK</span>
                  </h3>
                  <p className="text-xs text-slate-300 font-sans">
                    Günlük çarktan ve simülasyon görevlerinden kazandığınız 2030-2060 dönüm noktası teknoloji kartları.
                  </p>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <div className="px-3.5 py-1.5 rounded-xl bg-amber-500/20 border border-amber-500/40 text-amber-300 font-bold text-center">
                    <span className="text-[10px] block text-slate-400">AÇILAN KART</span>
                    <span className="text-base text-amber-400">{collectionItems.length} Adet</span>
                  </div>

                  <div className="px-3.5 py-1.5 rounded-xl bg-cyan-500/20 border border-cyan-500/40 text-cyan-300 font-bold text-center">
                    <span className="text-[10px] block text-slate-400">SERİ STREAK</span>
                    <span className="text-base text-cyan-300">🔥 {spinAnalytics.currentStreak} Gün</span>
                  </div>
                </div>
              </div>

              {/* Category Filter Tabs */}
              <div className="flex items-center gap-2 overflow-x-auto pb-1 font-mono text-xs">
                {["all", "Biyoteknoloji", "Kuantum", "Yapay Zeka", "Uzay & Enerji"].map((cat, catIdx) => (
                  <button
                    key={`up-cat-${cat}-${catIdx}`}
                    onClick={() => setCollectionCategory(cat)}
                    className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer whitespace-nowrap ${
                      collectionCategory === cat
                        ? "bg-amber-500 text-slate-950 font-black shadow-md"
                        : "bg-slate-950 text-slate-400 hover:text-white border border-white/10"
                    }`}
                  >
                    {cat === "all" ? "Tüm Kategoriler" : cat}
                  </button>
                ))}
              </div>

              {/* Cards Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredCollection.map((item, itemIdx) => {
                  const IconComp = TECH_ICONS[item.iconName] || Sparkles;

                  return (
                    <div
                      key={item.id ? `${item.id}-${itemIdx}` : `up-item-${itemIdx}`}
                      onClick={() => setSelectedTechDetail(item)}
                      className="p-4 rounded-2xl bg-slate-950/80 border border-amber-500/30 hover:border-amber-400 transition-all duration-200 cursor-pointer hover:scale-[1.02] shadow-lg flex flex-col justify-between space-y-3 relative group"
                    >
                      {/* Top Bar */}
                      <div className="flex items-start justify-between gap-2">
                        <div className="p-2.5 rounded-xl bg-amber-500/20 border border-amber-500/40 text-amber-400 group-hover:bg-amber-500 group-hover:text-slate-950 transition-colors">
                          <IconComp className="w-5 h-5" />
                        </div>

                        <div className="text-right font-mono">
                          <span className="px-2 py-0.5 rounded bg-amber-500/20 border border-amber-500/30 text-amber-300 text-[10px] font-bold block">
                            {item.rarity}
                          </span>
                          <span className="text-[10px] text-cyan-400 font-bold block mt-1">
                            {item.techTimelineYear}
                          </span>
                        </div>
                      </div>

                      {/* Content */}
                      <div className="space-y-1">
                        <span className="text-[10px] font-mono font-bold uppercase text-slate-400 block">
                          {item.category}
                        </span>
                        <h4 className="font-bold text-white text-sm font-mono group-hover:text-amber-300 transition-colors line-clamp-1">
                          {item.title}
                        </h4>
                        <p className="text-xs text-slate-300 font-sans line-clamp-2 leading-relaxed">
                          {item.description}
                        </p>
                      </div>

                      {/* Footer Info */}
                      <div className="pt-2 border-t border-white/10 flex items-center justify-between text-[10px] font-mono text-slate-400">
                        <span className="text-emerald-400 font-bold">+{item.creditAmount} Kredi</span>
                        <span className="text-cyan-400 font-bold">+{item.xpAmount} XP</span>
                        <span className="text-amber-300 font-bold group-hover:underline">Detaylar →</span>
                      </div>
                    </div>
                  );
                })}
              </div>

            </div>
          )}

          {/* TAB 3: DEDICATED BADGE GALLERY */}
          {activeTab === "badges" && (
            <div className="space-y-5">
              
              {/* Badge Stats Header Banner */}
              <div className="p-5 rounded-2xl bg-gradient-to-r from-purple-950/80 via-slate-900 to-cyan-950/80 border border-purple-500/40 flex flex-col sm:flex-row items-center justify-between gap-4 font-mono">
                <div className="space-y-1 text-center sm:text-left">
                  <h3 className="text-lg font-black text-white flex items-center justify-center sm:justify-start gap-2">
                    <Award className="w-5 h-5 text-purple-400" />
                    <span>ROZET GALERİSİ & XP DURUMU</span>
                  </h3>
                  <p className="text-xs text-slate-300 font-sans">
                    Kazandığınız rozetler profilinizde sergilenir ve Global Liderlik Tablosundaki sıralamanızı yükseltir.
                  </p>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <div className="px-4 py-2 rounded-xl bg-purple-500/20 border border-purple-500/40 text-purple-300 font-bold text-center">
                    <span className="text-xs block text-slate-400">AÇILAN ROZET</span>
                    <span className="text-lg text-purple-300">{unlockedCount} / {badges.length}</span>
                  </div>

                  <div className="px-4 py-2 rounded-xl bg-cyan-500/20 border border-cyan-500/40 text-cyan-300 font-bold text-center">
                    <span className="text-xs block text-slate-400">TOPLAM XP</span>
                    <span className="text-lg text-cyan-300">+{totalXp} XP</span>
                  </div>
                </div>
              </div>

              {!currentUser && (
                <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-between gap-3 font-mono text-xs">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
                    <span className="text-amber-200">
                      Rozetlerinizi ve puanlarınızı kalıcı olarak kaydetmek için kaydolun.
                    </span>
                  </div>
                  <button
                    onClick={handleRegisterClick}
                    className="px-3.5 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold shrink-0 flex items-center gap-1 cursor-pointer"
                  >
                    <LogIn className="w-3.5 h-3.5" />
                    <span>KAYDOL (+50 KREDİ)</span>
                  </button>
                </div>
              )}

              {/* Filters & Search */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 font-mono text-xs">
                <div className="flex items-center gap-1.5 bg-slate-950 p-1 rounded-xl border border-white/10 w-full sm:w-auto">
                  <button
                    onClick={() => setBadgeFilter("all")}
                    className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                      badgeFilter === "all" ? "bg-purple-600 text-white font-bold" : "text-slate-400 hover:text-white"
                    }`}
                  >
                    Tüm Rozetler ({badges.length})
                  </button>
                  <button
                    onClick={() => setBadgeFilter("unlocked")}
                    className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                      badgeFilter === "unlocked" ? "bg-purple-600 text-white font-bold" : "text-slate-400 hover:text-white"
                    }`}
                  >
                    Açılanlar ({unlockedCount})
                  </button>
                  <button
                    onClick={() => setBadgeFilter("locked")}
                    className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                      badgeFilter === "locked" ? "bg-purple-600 text-white font-bold" : "text-slate-400 hover:text-white"
                    }`}
                  >
                    Kilitliler ({badges.length - unlockedCount})
                  </button>
                </div>

                <div className="relative w-full sm:w-60">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    placeholder="Rozet ara..."
                    value={badgeSearch}
                    onChange={(e) => setBadgeSearch(e.target.value)}
                    className="w-full bg-slate-950 border border-white/10 rounded-xl pl-9 pr-3 py-1.5 text-xs text-slate-100 focus:outline-none focus:border-purple-500/50"
                  />
                </div>
              </div>

              {/* Badges Grid Showcase */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 font-mono text-xs">
                {filteredBadges.map((b, bIdx) => {
                  const BIcon = BADGE_ICONS[b.iconName] || Award;
                  const progressPct = Math.min(100, Math.round((b.progress / b.maxProgress) * 100));

                  return (
                    <div
                      key={b.id ? `${b.id}-${bIdx}` : `badge-${bIdx}`}
                      className={`p-4 rounded-2xl border transition-all flex items-start gap-3.5 relative overflow-hidden ${
                        b.unlocked
                          ? "bg-slate-950/90 border-purple-500/50 shadow-lg shadow-purple-500/10"
                          : "bg-slate-950/40 border-slate-800/80 text-slate-400 grayscale opacity-75 hover:grayscale-0 hover:opacity-100"
                      }`}
                    >
                      {/* Icon Container */}
                      <div
                        className={`p-3 rounded-2xl border shrink-0 ${
                          b.unlocked
                            ? "bg-gradient-to-tr from-purple-500/30 to-pink-500/20 border-purple-500/60 text-purple-300 shadow-md"
                            : "bg-slate-900 border-slate-700 text-slate-500"
                        }`}
                      >
                        <BIcon className="w-6 h-6" />
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0 space-y-1">
                        <div className="flex items-center justify-between gap-1">
                          <h4 className="font-bold text-white truncate text-xs flex items-center gap-1.5">
                            {b.name}
                            {b.unlocked && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 inline" />}
                          </h4>
                          <span className="text-xs font-black text-purple-400 shrink-0">
                            +{b.xpValue} XP
                          </span>
                        </div>

                        <p className="text-[11px] text-slate-300 font-sans leading-snug">
                          {b.description}
                        </p>

                        {/* Progress or Unlock Date */}
                        <div className="pt-2">
                          {b.unlocked ? (
                            <div className="flex items-center justify-between text-[10px] text-emerald-400 font-bold bg-emerald-950/40 border border-emerald-500/30 px-2.5 py-1 rounded-lg">
                              <span>✓ Rozet Açıldı</span>
                              <span>Tarih: {b.unlockedAt}</span>
                            </div>
                          ) : (
                            <div className="space-y-1">
                              <div className="flex items-center justify-between text-[10px] text-slate-400">
                                <span className="flex items-center gap-1 text-purple-300">
                                  <Lock className="w-3 h-3 text-purple-400" /> Görev İpucu: {b.requirementText}
                                </span>
                                <span className="font-bold text-white">{b.progress}/{b.maxProgress}</span>
                              </div>

                              {/* Progress bar */}
                              <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden border border-white/10">
                                <div
                                  className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full transition-all duration-500"
                                  style={{ width: `${progressPct}%` }}
                                />
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

            </div>
          )}

        {/* Selected Tech Detail Modal */}
        {selectedTechDetail && (
          <div
            onClick={() => setSelectedTechDetail(null)}
            className="fixed inset-0 z-[130] flex items-center justify-center p-3 sm:p-4 bg-slate-950/85 backdrop-blur-md animate-in zoom-in-95 duration-200"
          >
            <div
              onClick={(e) => e.stopPropagation()}
              className="bg-slate-900 border-2 border-amber-500/80 rounded-2xl sm:rounded-3xl max-w-lg w-full p-4 sm:p-6 shadow-2xl text-slate-100 font-sans space-y-4 relative max-h-[90vh] overflow-y-auto"
            >
              <button
                onClick={() => setSelectedTechDetail(null)}
                className="absolute top-4 right-4 p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-all cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="flex items-center gap-3">
                <div className="p-3 rounded-2xl bg-amber-500/20 border border-amber-500/50 text-amber-400">
                  <Brain className="w-8 h-8" />
                </div>
                <div>
                  <span className="px-2.5 py-0.5 rounded bg-amber-500/20 border border-amber-500/40 text-amber-300 text-xs font-mono font-bold">
                    {selectedTechDetail.rarity} • Yıl: {selectedTechDetail.techTimelineYear}
                  </span>
                  <h3 className="text-lg font-black text-white font-mono leading-tight mt-1">
                    {selectedTechDetail.title}
                  </h3>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-slate-950 border border-white/10 space-y-3 font-sans text-xs">
                <div>
                  <span className="text-slate-400 text-[10px] font-mono block">TEKNOLOJİK ANALİZ</span>
                  <p className="text-slate-200 leading-relaxed font-medium mt-0.5">
                    {selectedTechDetail.description}
                  </p>
                </div>

                <div className="pt-2 border-t border-white/10">
                  <span className="text-amber-400 text-[10px] font-mono font-bold flex items-center gap-1">
                    <Compass className="w-3.5 h-3.5" /> GELECEK VİZYONU VE TARİHSEL LORE
                  </span>
                  <p className="text-amber-100/90 italic font-sans mt-0.5 leading-snug">
                    "{selectedTechDetail.storyLore}"
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-between font-mono text-xs bg-slate-950/80 p-3 rounded-xl border border-white/5">
                <span className="text-emerald-400 font-bold">+{selectedTechDetail.creditAmount} AI Kredisi</span>
                <span className="text-cyan-400 font-bold">+{selectedTechDetail.xpAmount} Rozet XP</span>
                <span className="text-slate-400 text-[10px]">Kazanıldı: {selectedTechDetail.wonAt}</span>
              </div>

              <button
                onClick={() => setSelectedTechDetail(null)}
                className="w-full py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-mono font-black text-xs uppercase cursor-pointer"
              >
                Kapat
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
        <div className="p-4 bg-slate-950/95 border-t border-white/10 flex items-center justify-between gap-3 font-mono text-xs text-slate-400 shrink-0">
          <div className="flex items-center gap-2 min-w-0">
            <span className="flex items-center gap-1.5 text-emerald-400 font-bold truncate">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span className="truncate">{currentUser ? (currentUser.fullName || currentUser.username) : activeProfile.username}</span>
            </span>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {currentUser && (
              <button
                onClick={async () => {
                  await logout();
                  onClose();
                }}
                className="px-3 py-1.5 rounded-xl bg-rose-600/20 hover:bg-rose-600 text-rose-300 hover:text-white border border-rose-500/40 font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer shadow-sm"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Oturumu Kapat</span>
              </button>
            )}

            <button
              onClick={onClose}
              className="px-4 py-1.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold transition-all cursor-pointer shadow-sm shadow-cyan-600/20"
            >
              Kapat
            </button>
          </div>
        </div>

        {/* Rewarded Video Ad Modal for Earning Credits */}
        <RewardedAdModal
          isOpen={isRewardedAdOpen}
          onClose={() => setIsRewardedAdOpen(false)}
        />

      </div>
    </div>
  );
};
