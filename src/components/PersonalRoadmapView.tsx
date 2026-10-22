import React, { useState, useMemo, useEffect } from "react";
import { Milestone, CategoryType } from "../types";
import {
  User,
  Briefcase,
  Sparkles,
  ArrowRight,
  Share2,
  Award,
  RefreshCw,
  ChevronRight,
  AlertCircle,
  ShieldCheck,
  Zap,
  Compass,
  Radio,
  ListChecks,
  CheckCircle2,
  Clock,
  Filter,
  Lock,
} from "lucide-react";
import { useLanguage } from "../context/LanguageContext";
import { useAuth } from "../context/AuthContext";
import { getFeatureCreditCost } from "../utils/creditCosts";
import { useDailyFeatureLimit } from "../utils/dailyLimitTracker";
import { translateCategory } from "../utils/translations";
import { calculateDynamicProbability } from "../utils/probabilityCalculator";
import {
  getAllMilestoneActionStatuses,
  setMilestoneActionStatus,
  getAllMilestoneActionNotes,
  setMilestoneActionNote,
  ActionProgressStatus,
  calculateMilestonePersonalImpact,
  deriveMilestoneActionPlan,
  getAllMilestoneSelectedOptions,
  setMilestoneSelectedOption,
  setMilestoneReassessmentAcknowledged,
  getAllMilestoneReassessmentAcknowledged,
} from "../utils/personalTimelineEngine";
import { aiService } from "../services/AIService";
import { autoHealingCredit } from "../utils/autoHealingCredit";
import { recordPredictionHistoryEntry, getPendingRerunRecord, clearPendingRerunRecord } from "../utils/predictionHistory";
import { useBadges } from "../context/BadgeContext";

interface PersonalRoadmapViewProps {
  milestones: Milestone[];
  categories?: CategoryType[];
  onSelectMilestone?: (milestone: Milestone) => void;
  onOpenShareCard?: (milestone: Milestone) => void;
  activeMilestone?: Milestone | null;
  onNavigateToView?: (view: any, targetYear?: number) => void;
  liveSignals?: any[];
}

export const PersonalRoadmapView: React.FC<PersonalRoadmapViewProps> = ({
  milestones = [],
  categories: propCategories,
  onSelectMilestone,
  onOpenShareCard,
  activeMilestone,
  onNavigateToView,
  liveSignals = [],
}) => {
  const { language, t } = useLanguage();
  const isTr = language === "tr";
  const auth = useAuth();
  const { triggerActivity } = useBadges();
  const [creditError, setCreditError] = useState<string | null>(null);
  const [actionStatuses, setActionStatuses] = useState<Record<number, ActionProgressStatus>>({});
  const [actionNotes, setActionNotes] = useState<Record<number, string>>({});
  const [activeStatusFilter, setActiveStatusFilter] = useState<"all" | "planned" | "in_progress" | "completed">("all");
  const [activeNoteYear, setActiveNoteYear] = useState<number | null>(null);
  const [tempNoteText, setTempNoteText] = useState<string>("");

  useEffect(() => {
    setActionStatuses(getAllMilestoneActionStatuses(auth.currentUser?.email));
    setActionNotes(getAllMilestoneActionNotes(auth.currentUser?.email));
  }, [auth.currentUser?.email]);

  const handleUpdateMilestoneStatus = (year: number, newStatus: ActionProgressStatus) => {
    setMilestoneActionStatus(year, newStatus, auth.currentUser?.email);
    setActionStatuses((prev) => ({ ...prev, [year]: newStatus }));
    triggerActivity("action_tracker");
  };

  const handleSaveMilestoneNote = (year: number, note: string) => {
    setMilestoneActionNote(year, note, auth.currentUser?.email);
    setActionNotes((prev) => ({ ...prev, [year]: note }));
    setActiveNoteYear(null);
  };

  const trackingSummary = useMemo(() => {
    let planned = 0;
    let inProgress = 0;
    let completed = 0;
    for (const st of Object.values(actionStatuses)) {
      if (st === "planned") planned++;
      else if (st === "in_progress") inProgress++;
      else if (st === "completed") completed++;
    }
    return { planned, inProgress, completed, totalTracked: planned + inProgress + completed };
  }, [actionStatuses]);

  // Consume any pending rerun staged from history
  useEffect(() => {
    const pending = getPendingRerunRecord();
    if (pending && pending.featureKey === "personal_roadmap") {
      clearPendingRerunRecord();
    }
  }, []);

  // 1. Resolve central profile attributes (Zero duplicated user form)
  const userAge = auth.currentUser?.age && auth.currentUser.age >= 10 && auth.currentUser.age <= 100
    ? auth.currentUser.age
    : undefined;

  const userProfession =
    auth.currentUser?.profession ||
    auth.currentUser?.lifeRoleLabel ||
    "";

  const userGoals =
    auth.currentUser?.personalGoal ||
    auth.currentUser?.primaryGoalLabel ||
    auth.currentUser?.primaryGoal ||
    (isTr
      ? "Geleceğin otonom teknolojilerine adaptasyon sağlamak ve stratejik uzmanlaşma geliştirmek."
      : "Adapt to future autonomous technologies and develop strategic expertise.");

  const isProfilePending =
    !auth.currentUser || !auth.currentUser.profession || auth.currentUser.profession.trim().length === 0;

  // 2. Derive priority categories safely from central profile context
  const userCategories = useMemo<CategoryType[]>(() => {
    const list: CategoryType[] = [];
    const combined = `${auth.currentUser?.profession || ""} ${auth.currentUser?.industrySector || ""} ${auth.currentUser?.primaryGoal || ""}`.toLowerCase();
    if (
      combined.includes("yazılım") ||
      combined.includes("bilisim") ||
      combined.includes("yapay") ||
      combined.includes("tech") ||
      combined.includes("ai") ||
      combined.includes("data")
    ) {
      list.push("Yapay Zeka & Bilişim", "İnsan-Makine Arayüzü");
    }
    if (
      combined.includes("tıp") ||
      combined.includes("sağlık") ||
      combined.includes("biyo") ||
      combined.includes("health") ||
      combined.includes("med")
    ) {
      list.push("Biyoloji & Tıp", "Post-İnsan & Medeniyet");
    }
    if (
      combined.includes("enerji") ||
      combined.includes("fizik") ||
      combined.includes("climate") ||
      combined.includes("uzay")
    ) {
      list.push("Uzay & Fizik", "Enerji & Çevre");
    }
    if (list.length === 0) {
      list.push("Yapay Zeka & Bilişim", "Biyoloji & Tıp", "İnsan-Makine Arayüzü");
    }
    return list;
  }, [auth.currentUser]);

  const { isLimitReached, remaining, dailyLimit, increment, hasFreeQuota } = useDailyFeatureLimit(
    "personal_roadmap",
    auth.plan,
    auth.currentUser?.email,
    auth.credits
  );

  const [loading, setLoading] = useState<boolean>(false);
  const [aiReport, setAiReport] = useState<string | null>(null);
  const [generatedTopMilestones, setGeneratedTopMilestones] = useState<Milestone[]>([]);

  const [selectedOptionsState, setSelectedOptionsState] = useState<Record<number, "A" | "B" | "C">>({});
  const [reassessmentAcks, setReassessmentAcks] = useState<Record<number, boolean>>({});

  // 3. Autonomous Milestone Scoring & Matching Algorithm based directly on central UserProfile & Selected Strategic Paths (Aşama 39 & 42)
  const userSelectedOptions = useMemo(() => {
    const fromStorage = getAllMilestoneSelectedOptions(auth.currentUser?.email);
    return { ...fromStorage, ...selectedOptionsState };
  }, [auth.currentUser?.email, selectedOptionsState]);

  const handleSwitchOption = (year: number, optionId: "A" | "B" | "C") => {
    setMilestoneSelectedOption(year, optionId, auth.currentUser?.email);
    setSelectedOptionsState((prev) => ({ ...prev, [year]: optionId }));
  };

  const handleAcknowledgeReassessment = (year: number) => {
    setMilestoneReassessmentAcknowledged(year, true, auth.currentUser?.email);
    setReassessmentAcks((prev) => ({ ...prev, [year]: true }));
  };

  const currentActiveMilestones = useMemo(() => {
    const profLower = userProfession.toLowerCase();
    const goalsLower = userGoals.toLowerCase();

    const scored = (milestones || []).map((m) => {
      let score = 0;

      // Category match (+50)
      if (userCategories.includes(m.category)) {
        score += 50;
      }

      // Keyword / Profession cross match (+15 each)
      const mText = (m.title + " " + m.description + " " + m.category).toLowerCase();
      const keywords = [...profLower.split(/\s+/), ...goalsLower.split(/\s+/)].filter((k) => k.length > 3);
      for (const kw of keywords) {
        if (mText.includes(kw)) {
          score += 15;
        }
      }

      // Impact weighting
      score += (m.impactLevel || 50) * 0.2;

      // Near-term horizon balance
      if (m.year <= 2035) score += 5;

      // Closed-Loop Strategic Decision Priority Boost (Aşama 39)
      const chosenOpt = userSelectedOptions[m.year];
      if (chosenOpt === "C") {
        score += 35; // Aggressive strategic leap commits high action priority
      } else if (chosenOpt === "B") {
        score += 20; // Balanced hybrid pathway
      } else if (chosenOpt === "A") {
        score += 10; // Protective adaptation
      }

      // Live Signal Autonomous Momentum Boost (+25) (Aşama 41)
      const hasLiveSignal = (liveSignals || []).some(
        (s: any) => (s.matchedMilestoneYear || s.extractedYear) === m.year
      );
      if (hasLiveSignal) {
        score += 25;
      }

      return { milestone: m, score };
    });

    const sortedByScore = [...scored].sort((a, b) => b.score - a.score);
    const topRelevant = sortedByScore.slice(0, 10);
    const selectedList = topRelevant
      .sort((a, b) => a.milestone.year - b.milestone.year)
      .map((item) => item.milestone);

    return selectedList.length > 0 ? selectedList : (milestones || []).slice(0, 10);
  }, [milestones, userProfession, userGoals, userCategories, userSelectedOptions, liveSignals]);

  // 4. Execute Roadmap AI Generation via centralized profile params
  const handleGenerateRoadmap = async () => {
    if (!auth.currentUser) {
      auth.openAuthModal();
      return;
    }

    const cost = getFeatureCreditCost("personal_roadmap", auth.plan);

    if (hasFreeQuota) {
      increment();
    } else {
      const success = auth.deductCredits(cost, "personal_roadmap");
      if (!success) {
        setCreditError(
          isTr
            ? `Yetersiz Kredi! Yol haritası üretmek için ${cost} Kredi gereklidir. Mevcut bakiyeniz: ${auth.credits} Kredi.`
            : `Insufficient Credits! ${cost} Credits required. Current balance: ${auth.credits} Credits.`
        );
        if (auth.openCreditStore) auth.openCreditStore();
        return;
      }
    }

    setCreditError(null);
    setLoading(true);
    setAiReport(null);
    setGeneratedTopMilestones(currentActiveMilestones);

    try {
      const selectedDecisionsSummary = currentActiveMilestones
        .filter((m) => userSelectedOptions[m.year])
        .map((m) => `${m.year} (${m.title}): Yol ${userSelectedOptions[m.year]}`)
        .join("; ");

      const data = await aiService.generateRoadmapPlan({
        age: userAge,
        profession: userProfession,
        selectedCategories: userCategories,
        goals: `${userGoals}${selectedDecisionsSummary ? ` | Tercih Edilen Stratejik Karar Yolları: ${selectedDecisionsSummary}` : ""}`,
        riskTolerance: Object.values(userSelectedOptions).includes("C") ? "high" : Object.values(userSelectedOptions).includes("A") ? "conservative" : "balanced",
        selectedMilestoneTitles: currentActiveMilestones.map((m) => `${m.year}: ${m.title}${userSelectedOptions[m.year] ? ` [Yol ${userSelectedOptions[m.year]}]` : ""}`).join("; "),
        language: language,
      });

      if (data.success && data.output) {
        setAiReport(data.output);
        triggerActivity("roadmap_created");

        // Record to Prediction History Dossier
        recordPredictionHistoryEntry({
          userEmail: auth.currentUser?.email,
          featureKey: "personal_roadmap",
          featureName: "Kişisel Yol Haritası",
          queryTitle: `${userAge} Yaş - ${userProfession} Gelecek Adaptasyon Planı`,
          queryInput: {
            profession: userProfession,
            category: userCategories[0] || "Genel",
            targetYear: 2060,
            prompt: `Yaş: ${userAge}, Hedefler: ${userGoals}`,
            customParams: {
              age: userAge,
              selectedCategories: userCategories,
              riskTolerance: "balanced",
              selectedMilestones: currentActiveMilestones.map((m) => `${m.year}: ${m.title}`).slice(0, 5),
            },
          },
          generatedOutcome: data.output,
          category: userCategories[0] || "Sosyoloji & Ekonomi",
          targetYear: 2060,
          scenarioMode: "optimistic",
          creditsSpent: cost || 0,
          metrics: {
            feasibilityScore: 88,
            impactLevel: 92,
            riskLevel: "Düşük",
            sentiment: "optimistic",
          },
          tags: ["Yol Haritası", userProfession, `${userAge} Yaş`],
        });
      } else {
        const isTimeout = (data.error || "").toLowerCase().includes("timeout") || data.code === "TIMEOUT";
        const httpStatus = data.status || (data.code?.startsWith("HTTP_") ? data.code.replace("HTTP_", "") : undefined);

        if (auth.currentUser?.email && (cost > 0 || !hasFreeQuota)) {
          autoHealingCredit({
            userEmail: auth.currentUser.email,
            featureKey: "personal_roadmap",
            featureName: "Kişisel Yol Haritası Simülatörü",
            deductedCredits: cost,
            errorMessage: data.error || "200 dışı API durum kodu",
            httpStatus,
            isTimeout,
            refundNote: `Sistem Kaynaklı İade: Kişisel Yol Haritası API hatası (${httpStatus || "Zaman Aşımı"}) nedeniyle ${cost} kredi bakiye kurtarma yapıldı.`,
            onRefundCredits: (amount) => auth.addCredits(amount),
          });
          setAiReport(
            isTr
              ? `⚠️ Kişisel yol haritası üretilirken hata oluştu: ${data.error || "Sunucu yanıt vermedi"}.\n\n🛡️ [SİSTEM KAYNAKLI İADE]: Harcanan ${cost} Krediniz hesabınıza ANINDA OTOMATİK İADE EDİLDİ.`
              : `⚠️ Failed to generate roadmap: ${data.error || "No response"}.\n\n🛡️ [AUTO-HEALING CREDIT]: Deducted ${cost} Credits have been REFUNDED to your balance.`
          );
        } else {
          setAiReport(
            isTr
              ? "Kişisel yol haritası üretilirken bir sorun oluştu: " + (data.error || "Sunucu yanıt vermedi.")
              : "Failed to generate roadmap: " + (data.error || "No server response.")
          );
        }
      }
    } catch (err: any) {
      const isTimeout = err?.name === "AbortError" || (err?.message || "").toLowerCase().includes("timeout");
      if (auth.currentUser?.email && (cost > 0 || !hasFreeQuota)) {
        autoHealingCredit({
          userEmail: auth.currentUser.email,
          featureKey: "personal_roadmap",
          featureName: "Kişisel Yol Haritası Simülatörü",
          deductedCredits: cost,
          errorMessage: err?.message || "Bağlantı hatası",
          isTimeout,
          refundNote: `Sistem Kaynaklı İade: Kişisel Yol Haritası bağlantı/zaman aşımı hatası nedeniyle ${cost} kredi iade edildi.`,
          onRefundCredits: (amount) => auth.addCredits(amount),
        });
        setAiReport(
          isTr
            ? `⚠️ Bağlantı hatası oluştu: ${err.message}.\n\n🛡️ [SİSTEM KAYNAKLI İADE]: Harcanan ${cost} Krediniz hesabınıza ANINDA OTOMATİK İADE EDİLDİ.`
            : `⚠️ Connection error: ${err.message}.\n\n🛡️ [AUTO-HEALING CREDIT]: Deducted ${cost} Credits have been REFUNDED to your balance.`
        );
      } else {
        setAiReport(isTr ? "Bağlantı hatası: " + err.message : "Connection error: " + err.message);
      }
    } finally {
      setLoading(false);
    }
  };

  if (!auth.currentUser) {
    return (
      <div className="w-full max-w-4xl mx-auto px-4 py-16 text-center space-y-6 animate-fadeIn font-sans">
        <div className="w-16 h-16 rounded-3xl bg-purple-500/20 border border-purple-400/40 text-purple-300 mx-auto flex items-center justify-center shadow-lg shadow-purple-500/20">
          <Lock className="w-8 h-8 text-purple-300 animate-pulse" />
        </div>
        <div className="space-y-2 max-w-md mx-auto">
          <span className="px-3 py-1 rounded-full text-xs font-mono font-bold bg-purple-500/20 text-purple-300 border border-purple-500/40">
            {isTr ? "KİŞİYE ÖZEL GELECEK PLANI" : "PERSONAL FUTURE ROADMAP"}
          </span>
          <h3 className="text-xl font-bold text-white font-mono">
            {isTr ? "Kişisel Gelecek Planı & Yol Haritası" : "Personal Future Roadmap"}
          </h3>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-sans">
            {isTr
              ? "2026-2060 kişisel adaptasyon haritanızı, mesleğinize özel dönüm noktalarını ve yaş projeksiyonunuzu görmek için lütfen giriş yapın."
              : "Sign in to access your personal adaptation roadmap, profession-specific milestones, and age projections."}
          </p>
        </div>
        <button
          type="button"
          onClick={() => auth.openAuthModal()}
          className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-xs shadow-lg shadow-purple-600/30 transition cursor-pointer"
        >
          {isTr ? "Giriş Yap / Ücretsiz Kaydol" : "Sign In / Register Free"}
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-16 max-w-6xl mx-auto font-sans">
      {/* Header Bento Card */}
      <div className="bg-slate-900/60 border border-white/10 rounded-2xl sm:rounded-3xl p-5 sm:p-8 relative overflow-hidden backdrop-blur-xl shadow-2xl">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-2">
          <div className="flex items-center gap-2 text-cyan-400 font-mono text-xs font-bold uppercase tracking-widest">
            <User className="w-4 h-4 text-cyan-400" />
            <span>{isTr ? "KİŞİSEL GELECEK YOL HARİTASI SİMÜLATÖRÜ" : "PERSONAL FUTURE ROADMAP SIMULATOR"}</span>
          </div>

          <span className="px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-[11px] font-mono font-bold">
            {isTr ? "10 Özel Milestone & AI Biyo-Kariyer Raporu" : "10 Custom Milestones & AI Life Report"}
          </span>
        </div>

        <h2 className="text-xl sm:text-3xl font-black text-white tracking-tight">
          {isTr ? "Kendi Geleceğini Planla: Yaş, Meslek ve Yaşam Hedeflerin" : "Design Your Future: Age, Profession & Life Goals"}
        </h2>

        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mt-3">
          <p className="text-slate-300 text-xs sm:text-sm font-sans max-w-2xl leading-relaxed">
            {isTr
              ? "Stratejik Gelecek Analiz Motoru, 2026—2060 arasındaki küresel teknolojik kırılmalar arasından kariyerinizi ve yaş ufkunuzu doğrudan etkileyecek en kritik 10 dönüm noktasını profilinizle eşleştirir, yaşlanma eğrinizle birleştirir ve size özel stratejik gelecek yol haritası sunar."
              : "The Strategic Future Engine maps critical breakthroughs from 2026-2060 against your career and biological aging trajectory to deliver an executive-grade future roadmap."}
          </p>
        </div>
      </div>

      {/* 🧭 İncelenen Dönüm Noktası Bağlamı & Geri Dönüş Köprüsü */}
      {activeMilestone && (
        <div className="p-3.5 sm:p-4 rounded-2xl bg-gradient-to-r from-cyan-950/70 via-slate-900 to-indigo-950/70 border border-cyan-500/40 flex flex-wrap items-center justify-between gap-3 shadow-lg animate-fadeIn">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-8 h-8 rounded-xl bg-cyan-500/20 border border-cyan-400/50 flex items-center justify-center text-cyan-300 shrink-0">
              <Compass className="w-4 h-4 text-cyan-400" />
            </div>
            <div className="min-w-0">
              <span className="text-[10px] font-mono uppercase text-cyan-400 font-bold block">
                {isTr ? "İncelenen Dönüm Noktası Bağlamı" : "Milestone in Focus Context"}
              </span>
              <p className="text-xs sm:text-sm font-bold text-white truncate">
                {activeMilestone.year} — {activeMilestone.title}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {onSelectMilestone && (
              <button
                type="button"
                onClick={() => onSelectMilestone(activeMilestone)}
                className="px-3.5 py-1.5 rounded-xl bg-cyan-600/30 hover:bg-cyan-600 border border-cyan-500/50 text-cyan-100 hover:text-white text-xs font-mono font-bold flex items-center gap-1.5 transition cursor-pointer shadow-sm"
              >
                <span>{isTr ? "Dönüm Noktasına Geri Dön" : "Return to Milestone"}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      )}

      {/* 🌟 MERKEZİ KULLANICI PROFİLİ VE GELECEK VİZYONU KARTI (SIFIR TEKRAR FORMU) */}
      <div className="bg-slate-900/60 border border-purple-500/30 rounded-2xl sm:rounded-3xl p-5 sm:p-7 space-y-5 shadow-2xl relative overflow-hidden backdrop-blur-xl">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-purple-500/20 border border-purple-400/40 flex items-center justify-center text-purple-300">
              <User className="w-4 h-4 text-purple-400" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white font-mono uppercase tracking-wider">
                {isTr ? "Kişisel Gelecek Profiliniz" : "Your Personal Future Profile"}
              </h3>
              <span className="text-[11px] text-purple-300 font-sans">
                {isTr ? "Merkezi profilinizden otomatik olarak bağlandı" : "Linked directly from your central profile"}
              </span>
            </div>
          </div>

          {/* Profil Düzenle Butonu (Merkezi Onboarding/Profile modalını açar) */}
          <button
            type="button"
            onClick={() => {
              if (!auth.currentUser) {
                auth.openAuthModal();
              } else {
                window.dispatchEvent(new CustomEvent("reopen_registration_wizard"));
              }
            }}
            className="px-3.5 py-1.5 rounded-xl bg-purple-950/60 hover:bg-purple-900 border border-purple-500/40 text-purple-200 hover:text-white text-xs font-mono font-bold flex items-center gap-1.5 transition cursor-pointer"
          >
            <span>{isTr ? "Profili Düzenle" : "Edit Profile"}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Profil Eksik Uyarısı veya Tamamlanmış Profil Özeti */}
        {isProfilePending ? (
          <div className="p-4 rounded-2xl bg-amber-950/40 border border-amber-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="space-y-1">
              <h4 className="text-xs font-bold text-amber-200 flex items-center gap-1.5">
                <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />
                <span>{isTr ? "Profil Bilgileriniz Eksik" : "Profile Details Incomplete"}</span>
              </h4>
              <p className="text-xs text-amber-300/80 font-sans">
                {isTr
                  ? "Yaş ve meslek bilgilerinizi ekleyerek 2026-2060 kişisel gelecek projeksiyonunuzu anında derinleştirin."
                  : "Complete your age and profession to unlock tailored 2026-2060 milestones."}
              </p>
            </div>
            <button
              type="button"
              onClick={() => {
                if (!auth.currentUser) {
                  auth.openAuthModal();
                } else {
                  window.dispatchEvent(new CustomEvent("open_profile_completion"));
                }
              }}
              className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs font-mono transition cursor-pointer shrink-0"
            >
              {isTr ? "Profili Tamamla" : "Complete Profile"}
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs font-mono">
            {/* Meslek */}
            <div className="p-3 rounded-xl bg-slate-950/80 border border-white/5 space-y-1">
              <span className="text-[10px] text-slate-400 uppercase font-bold">{isTr ? "Mesleğiniz / Rol:" : "Profession / Role:"}</span>
              <p className="text-white font-bold truncate text-xs sm:text-sm">{userProfession}</p>
            </div>

            {/* Yaş */}
            <div className="p-3 rounded-xl bg-slate-950/80 border border-white/5 space-y-1">
              <span className="text-[10px] text-slate-400 uppercase font-bold">{isTr ? "Şu Anki Yaşınız (2026):" : "Current Age (2026):"}</span>
              <p className="text-cyan-400 font-bold text-xs sm:text-sm">{userAge} {isTr ? "Yaşında" : "Years Old"}</p>
            </div>

            {/* Sektör / Kıdem */}
            <div className="p-3 rounded-xl bg-slate-950/80 border border-white/5 space-y-1">
              <span className="text-[10px] text-slate-400 uppercase font-bold">{isTr ? "Sektör & Kıdem:" : "Industry & Seniority:"}</span>
              <p className="text-purple-300 font-bold truncate text-xs sm:text-sm">
                {auth.currentUser?.industrySector || auth.currentUser?.seniority || (isTr ? "Teknoloji & Bilişim" : "Tech & Innovation")}
              </p>
            </div>

            {/* Öncelikli Hedef */}
            <div className="p-3 rounded-xl bg-slate-950/80 border border-white/5 space-y-1">
              <span className="text-[10px] text-slate-400 uppercase font-bold">{isTr ? "Gelecek Hedefi:" : "Future Goal:"}</span>
              <p className="text-amber-300 font-bold truncate text-xs sm:text-sm">
                {auth.currentUser?.primaryGoalLabel || userGoals}
              </p>
            </div>
          </div>
        )}

        {/* Quota & Credits Banner */}
        <div className="p-3.5 bg-slate-950/90 border border-cyan-500/30 rounded-xl font-mono text-xs space-y-2">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/5 pb-2">
            <div className="flex items-center gap-2 text-cyan-300 font-bold">
              <Sparkles className="w-4 h-4 text-cyan-400" />
              <span>{isTr ? "GÜNLÜK KOTA VE KREDİ DURUMU" : "DAILY QUOTA & CREDITS"}</span>
            </div>
            <span className="text-[11px] text-slate-400">
              {isTr ? "Mevcut Bakiyeniz:" : "Current Balance:"}{" "}
              <strong className="text-amber-400 font-bold">{auth.credits} ⚡</strong>
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
            <div className="flex items-center justify-between p-2 bg-slate-900/60 rounded-lg border border-white/5">
              <span className="text-slate-300">{isTr ? "Günlük Ücretsiz Hak:" : "Daily Free Quota:"}</span>
              <span
                className={`font-bold px-2 py-0.5 rounded ${
                  hasFreeQuota
                    ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                    : "bg-slate-800 text-slate-400"
                }`}
              >
                {hasFreeQuota
                  ? isTr
                    ? "1 / 1 (ÜCRETSİZ KULLANILABİLİR)"
                    : "1 / 1 (FREE QUOTA AVAILABLE)"
                  : isTr
                  ? "0 / 1 (Ücretsiz Hak Tükendi)"
                  : "0 / 1 (Quota Used)"}
              </span>
            </div>

            <div className="flex items-center justify-between p-2 bg-slate-900/60 rounded-lg border border-white/5">
              <span className="text-slate-300">{isTr ? "İşlem Maliyeti:" : "Cost:"}</span>
              <span className={`font-bold ${hasFreeQuota ? "text-emerald-400" : "text-amber-400"}`}>
                {hasFreeQuota
                  ? isTr
                    ? "0 KREDİ (Ücretsiz Hak Aktif)"
                    : "0 CREDITS (Free)"
                  : `${getFeatureCreditCost("personal_roadmap", auth.plan)} Kredi`}
              </span>
            </div>
          </div>
        </div>

        {/* Credit Error Alert */}
        {creditError && (
          <div className="p-3 bg-red-950/90 border border-red-500/50 rounded-xl text-red-200 text-xs font-mono flex items-center justify-between">
            <span>{creditError}</span>
            <button
              onClick={() => auth.openCreditStore()}
              className="px-3 py-1 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-lg transition-all cursor-pointer"
            >
              {isTr ? "Kredi Yükle" : "Top Up"}
            </button>
          </div>
        )}

        {/* Generate Button */}
        <button
          onClick={handleGenerateRoadmap}
          disabled={loading || isLimitReached}
          className={`w-full py-4 rounded-xl font-mono font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all shadow-xl cursor-pointer ${
            isLimitReached
              ? "bg-slate-800 text-red-400 border border-red-500/40 cursor-not-allowed shadow-none"
              : "bg-gradient-to-r from-cyan-500 via-blue-600 to-purple-600 hover:from-cyan-400 hover:to-purple-500 text-slate-950 shadow-cyan-500/20 disabled:opacity-50"
          }`}
        >
          {loading ? <RefreshCw className="w-5 h-5 animate-spin" /> : <Sparkles className="w-5 h-5" />}
          <span>
            {loading
              ? isTr
                ? "YOL HARİTASI VE YAŞ GRUBU ETKİLERİ HESAPLANIYOR..."
                : "CALCULATING ROADMAP..."
              : isLimitReached
              ? isTr
                ? "Yetersiz Kredi (Kredi Mağazasından Bakiyenizi Yükseltin)"
                : "Insufficient Credits"
              : hasFreeQuota
              ? isTr
                ? "SANA ÖZEL 10 MILESTONE VE GELECEK YOL HARİTASI OLUŞTUR (1/1 ÜCRETSİZ)"
                : "GENERATE PERSONAL ROADMAP (1/1 FREE)"
              : isTr
              ? `SANA ÖZEL 10 MILESTONE VE GELECEK YOL HARİTASI OLUŞTUR (${getFeatureCreditCost("personal_roadmap", auth.plan)} KREDİ)`
              : `GENERATE PERSONAL ROADMAP (${getFeatureCreditCost("personal_roadmap", auth.plan)} CREDITS)`}
          </span>
        </button>
      </div>

      {/* AI Personal Roadmap Text Output */}
      {aiReport && (
        <div className="bg-slate-900/60 border border-cyan-500/30 rounded-2xl sm:rounded-3xl p-5 sm:p-8 space-y-4 animate-in fade-in duration-300 shadow-2xl backdrop-blur-xl">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/10 pb-3">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-cyan-400" />
              <h3 className="text-sm font-bold text-white font-mono uppercase tracking-wider">
                {isTr ? "YAPAY ZEKA DANIŞMANININ SANA ÖZEL KARİYER VE YAŞAM HARİTASI" : "AI CAREER & LIFE ROADMAP"}
              </h3>
            </div>
            <span className="text-xs font-mono text-cyan-400 font-bold">
              {userAge} {isTr ? "Yaş" : "Age"} → 2026-2060
            </span>
          </div>

          <div className="bg-slate-950/90 border border-white/5 rounded-2xl p-5 sm:p-7 text-slate-200 text-xs sm:text-sm leading-relaxed whitespace-pre-line font-mono border-l-4 border-l-cyan-500">
            {aiReport}
          </div>
        </div>
      )}

      {/* Top 10 Personalized Milestones Timeline View */}
      {currentActiveMilestones.length > 0 && (
        <div className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <Award className="w-5 h-5 text-amber-400" />
              <h3 className="text-base font-bold text-white font-mono uppercase tracking-wider">
                {generatedTopMilestones.length > 0
                  ? isTr
                    ? "SENİN İÇİN YAPAY ZEKA ONAYLI 10 KRİTİK MILESTONE"
                    : "YOUR AI-VERIFIED TOP 10 MILESTONES"
                  : isTr
                  ? "PROFİLİNİZE GÖRE DOĞRUDAN EŞLEŞEN 10 DÖNÜM NOKTASI"
                  : "LIVE MATCHED 10 MILESTONES FOR YOUR PROFILE"}
              </h3>
              {generatedTopMilestones.length === 0 && (
                <span className="px-2 py-0.5 rounded-md bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 text-[10px] font-mono font-bold">
                  {isTr ? "⚡ Anlık Canlı Önizleme" : "⚡ Live Dynamic Preview"}
                </span>
              )}
            </div>
            <span className="text-xs font-mono text-slate-400">
              {isTr
                ? `Profilinize Göre (${userAge} Yaş, ${userProfession}): Olası Yaş ve Etki Projeksiyonu`
                : `Tailored to ${userAge} yrs, ${userProfession}`}
            </span>
          </div>

          {generatedTopMilestones.length === 0 && (
            <div className="p-3 bg-cyan-950/40 border border-cyan-500/30 rounded-xl flex items-center justify-between text-xs font-mono text-cyan-200">
              <span className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-cyan-400 shrink-0" />
                <span>
                  {isTr
                    ? "Merkezi profilinizdeki yaş ve meslek verilerine göre en kritik 10 dönüm noktası anında hesaplanmıştır. Derin yapay zeka analiz raporu için yukarıdaki butona tıklayabilirsiniz."
                    : "Top 10 milestones are calculated directly from your central profile. Click generate above for the deep AI report."}
                </span>
              </span>
            </div>
          )}

          {/* 📊 EYLEM TAKİP & İLERLEME PANOSU (AŞAMA 31 - DECISION & VALUE LOOP) */}
          <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-slate-900/90 via-indigo-950/40 to-slate-900/90 border border-cyan-500/30 shadow-xl space-y-3.5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <ListChecks className="w-4 h-4 text-cyan-400" />
                  <h4 className="text-xs font-mono font-bold uppercase text-white tracking-wider">
                    {isTr ? "Kişisel Eylem ve İlerleme Takip Panosu" : "Personal Action & Progress Board"}
                  </h4>
                </div>
                <p className="text-[11px] text-slate-300 font-sans">
                  {isTr
                    ? "Yol haritanızdaki dönüm noktalarını eyleme dönüştürün, durumlarını güncelleyin ve gözden geçirme takvimini izleyin."
                    : "Turn roadmap milestones into actions, track progress status, and monitor review checkpoints."}
                </p>
              </div>

              {/* Completion Percentage Badge */}
              <div className="flex items-center gap-2 shrink-0">
                <span className="text-xs font-mono text-cyan-300 font-bold bg-cyan-950/80 px-2.5 py-1 rounded-lg border border-cyan-500/40">
                  {trackingSummary.completed} / {(generatedTopMilestones.length > 0 ? generatedTopMilestones : currentActiveMilestones).length} {isTr ? "Tamamlandı" : "Completed"} (
                  {(generatedTopMilestones.length > 0 ? generatedTopMilestones : currentActiveMilestones).length > 0
                    ? Math.round((trackingSummary.completed / (generatedTopMilestones.length > 0 ? generatedTopMilestones : currentActiveMilestones).length) * 100)
                    : 0}%)
                </span>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="w-full bg-slate-950/80 rounded-full h-2 overflow-hidden border border-white/5 flex">
              <div
                className="bg-emerald-500 transition-all duration-300"
                style={{
                  width: `${
                    (generatedTopMilestones.length > 0 ? generatedTopMilestones : currentActiveMilestones).length > 0
                      ? (trackingSummary.completed / (generatedTopMilestones.length > 0 ? generatedTopMilestones : currentActiveMilestones).length) * 100
                      : 0
                  }%`,
                }}
                title={isTr ? "Tamamlananlar" : "Completed"}
              />
              <div
                className="bg-amber-500 transition-all duration-300"
                style={{
                  width: `${
                    (generatedTopMilestones.length > 0 ? generatedTopMilestones : currentActiveMilestones).length > 0
                      ? (trackingSummary.inProgress / (generatedTopMilestones.length > 0 ? generatedTopMilestones : currentActiveMilestones).length) * 100
                      : 0
                  }%`,
                }}
                title={isTr ? "Eylemdekiler" : "In Progress"}
              />
              <div
                className="bg-blue-500 transition-all duration-300"
                style={{
                  width: `${
                    (generatedTopMilestones.length > 0 ? generatedTopMilestones : currentActiveMilestones).length > 0
                      ? (trackingSummary.planned / (generatedTopMilestones.length > 0 ? generatedTopMilestones : currentActiveMilestones).length) * 100
                      : 0
                  }%`,
                }}
                title={isTr ? "Planlananlar" : "Planned"}
              />
            </div>

            {/* Status Filter Tabs */}
            <div className="flex flex-wrap items-center gap-2 pt-1 text-xs font-mono">
              <span className="text-[11px] text-slate-400 font-bold mr-1 flex items-center gap-1">
                <Filter className="w-3 h-3 text-cyan-400" />
                <span>{isTr ? "Filtrele:" : "Filter:"}</span>
              </span>

              {[
                {
                  id: "all",
                  labelTr: `Tümü (${(generatedTopMilestones.length > 0 ? generatedTopMilestones : currentActiveMilestones).length})`,
                  labelEn: `All (${(generatedTopMilestones.length > 0 ? generatedTopMilestones : currentActiveMilestones).length})`,
                },
                { id: "planned", labelTr: `📅 Planlandı (${trackingSummary.planned})`, labelEn: `📅 Planned (${trackingSummary.planned})` },
                { id: "in_progress", labelTr: `⚡ Eylemde (${trackingSummary.inProgress})`, labelEn: `⚡ In Progress (${trackingSummary.inProgress})` },
                { id: "completed", labelTr: `✓ Tamamlandı (${trackingSummary.completed})`, labelEn: `✓ Completed (${trackingSummary.completed})` },
              ].map((tab) => {
                const isSelected = activeStatusFilter === tab.id;
                return (
                  <button
                    key={`filter-${tab.id}`}
                    type="button"
                    onClick={() => setActiveStatusFilter(tab.id as any)}
                    className={`px-3 py-1 rounded-xl font-bold transition cursor-pointer border ${
                      isSelected
                        ? "bg-cyan-500 text-slate-950 border-cyan-400 shadow-md shadow-cyan-500/20"
                        : "bg-slate-900/60 text-slate-400 hover:text-white border-white/5 hover:border-white/20"
                    }`}
                  >
                    {isTr ? tab.labelTr : tab.labelEn}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Milestone Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {(generatedTopMilestones.length > 0 ? generatedTopMilestones : currentActiveMilestones)
              .filter((m) => {
                if (activeStatusFilter === "all") return true;
                const status = actionStatuses[m.year] || "seen";
                return status === activeStatusFilter;
              })
              .map((m, idx) => {
              const userAgeAtYear = userAge !== undefined ? userAge + (m.year - 2026) : undefined;
              const probData = calculateDynamicProbability(m.probability, m.year);
              const isCurrentFocus = activeMilestone?.year === m.year;
              const personalImpact = calculateMilestonePersonalImpact(m, auth.currentUser);
              const currentStatus = actionStatuses[m.year] || "seen";
              const currentNote = actionNotes[m.year] || "";
              const isEditingThisNote = activeNoteYear === m.year;
              const actionPlan = deriveMilestoneActionPlan(
                m,
                personalImpact,
                auth.currentUser,
                userSelectedOptions[m.year],
                currentStatus,
                currentNote,
                liveSignals
              );

              return (
                <div
                  key={`${m.year}-${m.title}-${idx}`}
                  className={`bg-slate-900/60 rounded-2xl p-4 sm:p-6 space-y-3.5 transition-all hover:bg-slate-900/80 group relative overflow-hidden shadow-xl ${
                    isCurrentFocus
                      ? "border-2 border-cyan-400 ring-2 ring-cyan-400/30 bg-slate-900/90"
                      : "border border-white/10 hover:border-cyan-500/40"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="w-7 h-7 rounded-lg bg-cyan-500/20 text-cyan-300 font-mono font-bold text-xs flex items-center justify-center border border-cyan-500/30">
                        #{idx + 1}
                      </span>
                      <span className="text-xl font-bold font-mono text-white">{m.year}</span>
                      {isCurrentFocus && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-400/50">
                          {isTr ? "İncelenen" : "In Focus"}
                        </span>
                      )}
                    </div>

                    <div className="flex flex-col items-end gap-1">
                      <div className="flex items-center gap-1.5 flex-wrap justify-end">
                        {userAgeAtYear !== undefined && (
                          <span className="px-2.5 py-1 rounded-full bg-slate-950 border border-amber-500/30 text-amber-300 font-mono text-[11px] font-bold">
                            {isTr ? `O Yılda ${userAgeAtYear} Yaşındasın` : `Age ${userAgeAtYear} that year`}
                          </span>
                        )}
                        {actionPlan.selectedOptionId && (
                          <span
                            className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded border ${
                              actionPlan.selectedOptionId === "C"
                                ? "bg-purple-950/90 text-purple-200 border-purple-400"
                                : actionPlan.selectedOptionId === "A"
                                ? "bg-emerald-950/90 text-emerald-300 border-emerald-400"
                                : "bg-cyan-950/90 text-cyan-200 border-cyan-400"
                            }`}
                          >
                            {actionPlan.isExplicitUserChoice ? "✓ " : ""}
                            YOL {actionPlan.selectedOptionId}
                          </span>
                        )}
                        {actionStatuses[m.year] && actionStatuses[m.year] !== "seen" && (
                          <span
                            className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded border ${
                              actionStatuses[m.year] === "completed"
                                ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/40"
                                : actionStatuses[m.year] === "in_progress"
                                ? "bg-amber-500/20 text-amber-300 border-amber-500/40"
                                : "bg-blue-500/20 text-blue-300 border-blue-500/40"
                            }`}
                          >
                            {actionStatuses[m.year] === "completed"
                              ? (isTr ? "✓ Tamamlandı" : "Completed")
                              : actionStatuses[m.year] === "in_progress"
                              ? (isTr ? "⚡ Eylemde" : "In Progress")
                              : (isTr ? "📅 Planlandı" : "Planned")}
                          </span>
                        )}
                      </div>
                      <span
                        className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded ${
                          probData.adjustedProbability > 75
                            ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                            : probData.adjustedProbability > 50
                            ? "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                            : "bg-purple-500/20 text-purple-300 border border-purple-500/30"
                        }`}
                      >
                        %{probData.adjustedProbability} {isTr ? "Model Skoru" : "Model Score"} ({probData.confidenceCategory})
                      </span>
                    </div>
                  </div>

                  <div>
                    <h4 className="text-sm font-bold text-white group-hover:text-cyan-300 transition-colors">
                      {m.title}
                    </h4>
                    <p className="text-xs text-slate-300 font-sans mt-1 line-clamp-2 leading-relaxed">
                      {m.description}
                    </p>

                    {/* Milestone Selection Justification Tag */}
                    <div className="mt-2.5 p-2.5 bg-slate-950/80 border border-cyan-500/20 rounded-xl text-[11px] font-mono text-cyan-200/90 flex items-start gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-cyan-400 shrink-0 mt-0.5" />
                      <span>
                        <strong>{isTr ? "Neden Eşleşti:" : "Match Reason:"}</strong>{" "}
                        {userCategories.includes(m.category)
                          ? isTr
                            ? `Seçilen ${translateCategory(m.category, language)} alanında `
                            : `In your ${translateCategory(m.category, language)} focus `
                          : isTr
                          ? `2026-2060 projeksiyonunda `
                          : `In 2026-2060 timeline `}
                        {isTr
                          ? `${userAgeAtYear !== undefined ? `${userAgeAtYear} yaşınızdaki ` : ""}kariyer (${userProfession}) ve yaşam kalitenizi doğrudan dönüştürecektir.`
                          : `directly transforms your career (${userProfession}) and life quality${userAgeAtYear !== undefined ? ` at age ${userAgeAtYear}` : ""}.`}
                      </span>
                    </div>
                  </div>

                  {/* ⚡ / ⏳ CANLI İSTİHBARAT & DİNAMİK ZAMAN UFKU BİLDİRİMİ (AŞAMA 41 & 42) */}
                  {(actionPlan.hasLiveBreakthroughAcceleration || actionPlan.liveSignalNotice || (actionPlan.dynamicHorizonShiftYears && actionPlan.dynamicHorizonShiftYears !== 0)) && (
                    <div className={`p-3 rounded-xl border text-xs font-mono space-y-1.5 shadow-lg animate-fadeIn ${
                      actionPlan.impactEffect === "DECELERATING_BOTTLENECK" || (actionPlan.dynamicHorizonShiftYears && actionPlan.dynamicHorizonShiftYears > 0)
                        ? "bg-gradient-to-r from-rose-950/70 via-rose-900/30 to-slate-950 border-rose-500/50 text-rose-200 shadow-rose-950/40"
                        : actionPlan.impactEffect === "EXPANDING_SCOPE"
                        ? "bg-gradient-to-r from-cyan-950/70 via-cyan-900/30 to-slate-950 border-cyan-500/50 text-cyan-200 shadow-cyan-950/40"
                        : "bg-gradient-to-r from-amber-950/70 via-amber-900/30 to-slate-950 border-amber-500/50 text-amber-200 shadow-amber-950/40"
                    }`}>
                      <div className="flex items-center justify-between">
                        <span className={`font-bold flex items-center gap-1.5 ${
                          actionPlan.impactEffect === "DECELERATING_BOTTLENECK" || (actionPlan.dynamicHorizonShiftYears && actionPlan.dynamicHorizonShiftYears > 0)
                            ? "text-rose-300"
                            : actionPlan.impactEffect === "EXPANDING_SCOPE"
                            ? "text-cyan-300"
                            : "text-amber-300"
                        }`}>
                          {actionPlan.impactEffect === "DECELERATING_BOTTLENECK" || (actionPlan.dynamicHorizonShiftYears && actionPlan.dynamicHorizonShiftYears > 0) ? (
                            <>
                              <Clock className="w-3.5 h-3.5 text-rose-400 animate-pulse" />
                              <span>{isTr ? "⏳ Darboğaz & Regülasyon Kısıtı" : "⏳ Bottleneck & Constraint"}</span>
                            </>
                          ) : actionPlan.impactEffect === "EXPANDING_SCOPE" ? (
                            <>
                              <Compass className="w-3.5 h-3.5 text-cyan-400" />
                              <span>{isTr ? "🌐 Kapsam Genişleme Sinyali" : "🌐 Scope Expansion Signal"}</span>
                            </>
                          ) : (
                            <>
                              <Zap className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
                              <span>{isTr ? "⚡ Canlı İstihbarat İvmesi" : "⚡ Live Breakthrough Acceleration"}</span>
                            </>
                          )}
                        </span>
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                          (actionPlan.dynamicHorizonShiftYears && actionPlan.dynamicHorizonShiftYears > 0) || (actionPlan.acceleratedHorizonShiftYears && actionPlan.acceleratedHorizonShiftYears > 0)
                            ? "bg-rose-500/20 text-rose-300 border-rose-500/40"
                            : (actionPlan.dynamicHorizonShiftYears && actionPlan.dynamicHorizonShiftYears < 0) || (actionPlan.acceleratedHorizonShiftYears && actionPlan.acceleratedHorizonShiftYears < 0)
                            ? "bg-amber-500/20 text-amber-300 border-amber-500/40"
                            : "bg-cyan-500/20 text-cyan-300 border-cyan-500/40"
                        }`}>
                          {(actionPlan.dynamicHorizonShiftYears && actionPlan.dynamicHorizonShiftYears > 0) || (actionPlan.acceleratedHorizonShiftYears && actionPlan.acceleratedHorizonShiftYears > 0)
                            ? `${isTr ? "Zaman Ufku: +" : "Timeline: +"}${actionPlan.dynamicHorizonShiftYears || actionPlan.acceleratedHorizonShiftYears} ${isTr ? "Yıl (Gecikme)" : "Years (Delayed)"}`
                            : (actionPlan.dynamicHorizonShiftYears && actionPlan.dynamicHorizonShiftYears < 0) || (actionPlan.acceleratedHorizonShiftYears && actionPlan.acceleratedHorizonShiftYears < 0)
                            ? `${isTr ? "Zaman Ufku: " : "Timeline: "}${actionPlan.dynamicHorizonShiftYears || actionPlan.acceleratedHorizonShiftYears} ${isTr ? "Yıl (Hızlanma)" : "Years (Accelerated)"}`
                            : `${isTr ? "Zaman Ufku: Stabil" : "Timeline: Stable"}`}
                        </span>
                      </div>
                      <p className="text-[11px] font-sans leading-relaxed opacity-95">
                        {actionPlan.liveSignalNotice}
                      </p>
                      {actionPlan.liveSignalCount && actionPlan.liveSignalCount > 1 && (
                        <div className="text-[10px] opacity-80 font-mono">
                          {isTr
                            ? `📡 Bu dönüm noktasıyla eşleşen toplam ${actionPlan.liveSignalCount} otonom istihbarat sinyali mevcut.`
                            : `📡 Total ${actionPlan.liveSignalCount} autonomous intelligence signals matching this milestone.`}
                        </div>
                      )}
                    </div>
                  )}

                  {/* 🔄 STRATEJİK KARAR YENİDEN DEĞERLENDİRME & TAVSİYE (AŞAMA 42 & 42.1 KAPALI DÖNGÜ) */}
                  {actionPlan.decisionReassessment?.needsReassessment && (
                    (actionPlan.isReassessmentAcknowledged || reassessmentAcks[m.year]) ? (
                      <div className="p-2.5 rounded-xl bg-slate-900/90 border border-purple-500/30 text-purple-200 text-xs font-mono flex flex-wrap items-center justify-between gap-2 animate-fadeIn">
                        <div className="flex items-center gap-1.5">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                          <span className="text-[11px]">
                            {isTr
                              ? `Karar Bilinçli Olarak Korundu: Seçenek ${actionPlan.selectedOptionId} stratejisi aktif.`
                              : `Decision Explicitly Retained: Option ${actionPlan.selectedOptionId} active.`}
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            setMilestoneReassessmentAcknowledged(m.year, false, auth.currentUser?.email);
                            setReassessmentAcks((prev) => ({ ...prev, [m.year]: false }));
                          }}
                          className="text-[10px] text-purple-300 hover:text-white underline cursor-pointer"
                        >
                          {isTr ? "Uyarılara Tekrar Bak" : "Review Reassessment"}
                        </button>
                      </div>
                    ) : (
                      <div className="p-3.5 rounded-xl bg-gradient-to-r from-purple-950/80 via-slate-900 to-indigo-950/80 border-2 border-purple-400/60 text-purple-200 text-xs font-mono space-y-2.5 shadow-xl shadow-purple-950/40 animate-fadeIn">
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-1.5 font-bold text-purple-300">
                            <RefreshCw className="w-4 h-4 text-purple-400 animate-spin-slow shrink-0" />
                            <span>{isTr ? "🔄 Karar Yeniden Değerlendirme Önerisi" : "🔄 Strategic Decision Reassessment"}</span>
                          </div>
                          <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-purple-500/20 text-purple-200 border border-purple-500/40 uppercase">
                            {actionPlan.decisionReassessment.reassessmentType === "ACCELERATION_RISK"
                              ? (isTr ? "İvmelenme Riski" : "Acceleration Risk")
                              : actionPlan.decisionReassessment.reassessmentType === "BOTTLENECK_PRUDENCE"
                              ? (isTr ? "Darboğaz Temkini" : "Bottleneck Prudence")
                              : actionPlan.decisionReassessment.reassessmentType === "UNCERTAINTY_HEDGING"
                              ? (isTr ? "Belirsizlik Dengeleme" : "Uncertainty Hedging")
                              : (isTr ? "Deneyim Revizyonu" : "Experience Pivot")}
                          </span>
                        </div>
                        <p className="text-[11px] text-purple-100/90 font-sans leading-relaxed">
                          {actionPlan.decisionReassessment.reason}
                        </p>
                        <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-purple-400/20">
                          <div className="text-[10px] text-purple-300/80 font-mono">
                            {isTr
                              ? `Mevcut Tercih: Seçenek ${actionPlan.decisionReassessment.currentOptionId} ➔ Tavsiye: Seçenek ${actionPlan.decisionReassessment.recommendedAlternativeOption}`
                              : `Current: Option ${actionPlan.decisionReassessment.currentOptionId} ➔ Suggested: Option ${actionPlan.decisionReassessment.recommendedAlternativeOption}`}
                          </div>
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => handleAcknowledgeReassessment(m.year)}
                              className="px-2.5 py-1 rounded-lg bg-slate-800/80 hover:bg-slate-700/80 text-slate-300 font-sans text-[11px] transition-all cursor-pointer border border-white/10"
                            >
                              {isTr ? "Kararımı Koru" : "Retain My Decision"}
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                if (actionPlan.decisionReassessment?.recommendedAlternativeOption) {
                                  handleSwitchOption(m.year, actionPlan.decisionReassessment.recommendedAlternativeOption);
                                }
                              }}
                              className="px-3 py-1 rounded-lg bg-gradient-to-r from-purple-600 to-cyan-600 hover:from-purple-500 hover:to-cyan-500 text-white font-sans font-bold text-[11px] transition-all flex items-center gap-1.5 shadow-md active:scale-95 cursor-pointer"
                            >
                              <Sparkles className="w-3 h-3 text-cyan-200" />
                              <span>
                                {isTr
                                  ? `Seçenek ${actionPlan.decisionReassessment.recommendedAlternativeOption} Stratejisine Geç`
                                  : `Switch to Option ${actionPlan.decisionReassessment.recommendedAlternativeOption}`}
                              </span>
                            </button>
                          </div>
                        </div>
                      </div>
                    )
                  )}

                  {/* ⚠️ STRATEJİK PİVOT & YÖNTEM REVİZYONU BİLDİRİMİ */}
                  {actionPlan.outcomeStage === "completed_pivot_needed" && (
                    <div className="p-3 rounded-xl bg-rose-950/70 border border-rose-500/50 text-rose-200 text-xs font-mono space-y-1 shadow-lg shadow-rose-950/40 animate-fadeIn">
                      <div className="flex items-center gap-1.5 font-bold text-rose-300">
                        <AlertCircle className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                        <span>{isTr ? "⚠️ Yöntem Revizyonu ve Pivot Uyarısı" : "⚠️ Pivot & Reassessment Warning"}</span>
                      </div>
                      <p className="text-[11px] text-rose-200/90 font-sans leading-relaxed">
                        {actionPlan.outcomeFollowUpAdvice || actionPlan.concreteAction}
                      </p>
                    </div>
                  )}

                  {/* 🎯 ÖNERİLEN SOMUT EYLEM & KONTROL ZAMANI (AŞAMA 31 & 39 KAPALI DÖNGÜ) */}
                  <div className="p-3 rounded-xl bg-slate-950/70 border border-white/10 space-y-2">
                    <div className="flex items-center justify-between text-[11px] font-mono">
                      <span className="text-purple-300 font-bold flex items-center gap-1">
                        <Zap className="w-3 h-3 text-purple-400" />
                        <span>{actionPlan.actionTypeLabel}</span>
                      </span>
                      <span className="text-slate-400">{actionPlan.urgencyTitle}</span>
                    </div>

                    <p className="text-xs text-slate-200 font-sans leading-relaxed">
                      "{actionPlan.concreteAction}"
                    </p>

                    {actionPlan.selectedOption?.requiredSkills && actionPlan.selectedOption.requiredSkills.length > 0 && (
                      <div className="flex items-center gap-1.5 flex-wrap pt-1.5 border-t border-white/5">
                        <span className="text-[10px] font-mono text-cyan-400 font-bold">{isTr ? "Yetkinlikler:" : "Skills:"}</span>
                        {actionPlan.selectedOption.requiredSkills.map((sk) => (
                          <span key={sk} className="px-1.5 py-0.2 rounded bg-cyan-950/80 border border-cyan-500/30 text-[10px] font-mono text-cyan-200">
                            {sk}
                          </span>
                        ))}
                      </div>
                    )}

                    <div className="flex items-start gap-1.5 pt-1 border-t border-white/5 text-[11px] text-amber-300/90 font-mono">
                      <Clock className="w-3 h-3 text-amber-400 shrink-0 mt-0.5" />
                      <span>{actionPlan.reviewCheckpoint}</span>
                    </div>

                    {actionPlan.outcomeFollowUpAdvice && actionPlan.outcomeStage !== "completed_pivot_needed" && (
                      <div className="text-[11px] font-mono p-2 rounded-lg bg-emerald-950/40 border border-emerald-500/30 text-emerald-300 flex items-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                        <span>{actionPlan.outcomeFollowUpAdvice}</span>
                      </div>
                    )}
                  </div>

                  {/* ⚡ HIZLI EYLEM DURUMU SEÇİCİ */}
                  <div className="p-2.5 rounded-xl bg-slate-950/60 border border-white/5 space-y-1.5">
                    <div className="flex items-center justify-between text-[10px] font-mono text-slate-400">
                      <span>{isTr ? "Eylem Durumunu Güncelle:" : "Update Action Status:"}</span>
                      <span>{isTr ? "Anında Kaydedilir" : "Auto-Saved"}</span>
                    </div>

                    <div className="grid grid-cols-4 gap-1.5 text-[11px] font-mono">
                      {[
                        { id: "seen", labelTr: "👁️", fullTr: "Görüldü" },
                        { id: "planned", labelTr: "📅 Planla", fullTr: "Planlandı" },
                        { id: "in_progress", labelTr: "⚡ Eylemde", fullTr: "Eylemde" },
                        { id: "completed", labelTr: "✓ Tamamla", fullTr: "Tamamlandı" },
                      ].map((st) => {
                        const isCurrent = currentStatus === st.id;
                        return (
                          <button
                            key={`btn-st-${m.year}-${st.id}`}
                            type="button"
                            onClick={() => handleUpdateMilestoneStatus(m.year, st.id as ActionProgressStatus)}
                            className={`py-1 px-1.5 rounded-lg border text-center font-bold transition-all cursor-pointer text-[10px] sm:text-[11px] ${
                              isCurrent
                                ? "bg-cyan-500 text-slate-950 border-cyan-400 shadow-sm shadow-cyan-500/30 scale-[1.02]"
                                : "bg-slate-900/60 text-slate-400 hover:text-white border-white/5 hover:bg-slate-800"
                            }`}
                            title={isTr ? st.fullTr : st.id}
                          >
                            <span>{st.labelTr}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* 📝 KİŞİSEL İLERLEME NOTU */}
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-[10px] font-mono">
                      <button
                        type="button"
                        onClick={() => {
                          if (isEditingThisNote) {
                            setActiveNoteYear(null);
                          } else {
                            setActiveNoteYear(m.year);
                            setTempNoteText(currentNote);
                          }
                        }}
                        className="text-cyan-400 hover:text-cyan-300 underline cursor-pointer flex items-center gap-1"
                      >
                        <CheckCircle2 className="w-3 h-3 text-cyan-400" />
                        <span>{currentNote ? (isTr ? "Kişisel Notu Göster / Düzenle" : "View / Edit Note") : (isTr ? "+ Kişisel Not Ekle" : "+ Add Personal Note")}</span>
                      </button>
                    </div>

                    {isEditingThisNote ? (
                      <div className="space-y-1.5 pt-1">
                        <textarea
                          value={tempNoteText}
                          onChange={(e) => setTempNoteText(e.target.value)}
                          placeholder={isTr ? "Bu teknoloji adımıyla ilgili aldığınız aksiyonları not edin..." : "Record your action notes..."}
                          className="w-full text-xs font-mono bg-slate-950/90 border border-white/10 rounded-lg p-2 text-slate-200 focus:outline-none focus:border-cyan-400 resize-none h-14"
                        />
                        <div className="flex justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => setActiveNoteYear(null)}
                            className="px-2 py-0.5 text-[10px] font-mono text-slate-400 hover:text-white cursor-pointer"
                          >
                            {isTr ? "İptal" : "Cancel"}
                          </button>
                          <button
                            type="button"
                            onClick={() => handleSaveMilestoneNote(m.year, tempNoteText)}
                            className="px-2.5 py-0.5 bg-cyan-600 hover:bg-cyan-500 text-white text-[10px] font-mono font-bold rounded cursor-pointer"
                          >
                            {isTr ? "Kaydet" : "Save"}
                          </button>
                        </div>
                      </div>
                    ) : currentNote ? (
                      <p className="text-[11px] text-slate-300 font-mono bg-slate-950/70 p-2 rounded-lg border border-white/5 line-clamp-2">
                        "{currentNote}"
                      </p>
                    ) : null}
                  </div>

                  <div className="pt-2.5 border-t border-white/5 flex items-center justify-between text-xs font-mono">
                    <span className="text-slate-400">{translateCategory(m.category, language)}</span>

                    <div className="flex items-center gap-2">
                      {onOpenShareCard && (
                        <button
                          onClick={() => onOpenShareCard(m)}
                          className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-[11px] font-bold flex items-center gap-1 transition-all border border-white/5 cursor-pointer"
                        >
                          <Share2 className="w-3.5 h-3.5 text-cyan-400" />
                          <span>{isTr ? "Kart Yap" : "Card"}</span>
                        </button>
                      )}

                      {onSelectMilestone && (
                        <button
                          onClick={() => onSelectMilestone(m)}
                          className="px-2.5 py-1 rounded-lg bg-cyan-600/20 hover:bg-cyan-600/30 text-cyan-300 text-[11px] font-bold flex items-center gap-1 transition-all border border-cyan-500/30 cursor-pointer"
                        >
                          <span>{isTr ? "Detay" : "Detail"}</span>
                          <ChevronRight className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 🚀 Eyleme Geçiş & İlgili Modüller Köprüsü (Aşama 23) */}
      {onNavigateToView && (
        <div className="p-6 rounded-3xl bg-gradient-to-r from-purple-950/60 via-slate-900 to-indigo-950/60 border border-purple-500/30 shadow-xl space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/10 pb-3">
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-cyan-400" />
              <h4 className="text-xs font-mono font-bold uppercase text-white tracking-wider">
                {isTr ? "Yol Haritanızı Eyleme Dönüştürün" : "Transform Your Roadmap into Action"}
              </h4>
            </div>
            <span className="text-[11px] font-mono text-purple-300">
              {isTr ? "Kişisel Eylem → Meslek Riski → Canlı İstihbarat Döngüsü" : "Action → Career Risk → Live Signals Cycle"}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => onNavigateToView("job_risk", activeMilestone?.year)}
              className="p-4 rounded-2xl bg-slate-950/80 hover:bg-rose-950/50 border border-rose-500/30 hover:border-rose-400 text-left transition flex items-center justify-between cursor-pointer group shadow-md"
            >
              <div className="space-y-1">
                <span className="text-xs font-bold text-rose-200 flex items-center gap-2">
                  <Briefcase className="w-4 h-4 text-rose-400" />
                  <span>{isTr ? "Meslek & Otomasyon Risk Raporu" : "Career & Automation Risk Report"}</span>
                </span>
                <p className="text-[11px] text-slate-400 font-sans leading-relaxed">
                  {isTr
                    ? "Mesleğinizin yapay zeka tarafından ikame veya desteklenme oranlarını test edin."
                    : "Simulate AI replacement and augmentation rates for your profession."}
                </p>
              </div>
              <ArrowRight className="w-4 h-4 text-rose-400 group-hover:translate-x-1 transition shrink-0 ml-2" />
            </button>

            <button
              type="button"
              onClick={() => onNavigateToView("telegram_feed", activeMilestone?.year)}
              className="p-4 rounded-2xl bg-slate-950/80 hover:bg-cyan-950/50 border border-cyan-500/30 hover:border-cyan-400 text-left transition flex items-center justify-between cursor-pointer group shadow-md"
            >
              <div className="space-y-1">
                <span className="text-xs font-bold text-cyan-200 flex items-center gap-2">
                  <Radio className="w-4 h-4 text-cyan-400 animate-pulse" />
                  <span>{isTr ? "Canlı İstihbarat & Destekleyici Sinyaller" : "Live Signals Radar"}</span>
                </span>
                <p className="text-[11px] text-slate-400 font-sans leading-relaxed">
                  {isTr
                    ? "Yol haritanızdaki teknolojileri destekleyen arXiv ve patent gelişmelerini canlı izleyin."
                    : "Track live arXiv and patent breakthroughs supporting your roadmap."}
                </p>
              </div>
              <ArrowRight className="w-4 h-4 text-cyan-400 group-hover:translate-x-1 transition shrink-0 ml-2" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
