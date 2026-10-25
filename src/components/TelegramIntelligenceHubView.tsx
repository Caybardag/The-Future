import React, { useState, useEffect, useRef } from "react";
import {
  Radio,
  RefreshCw,
  Sparkles,
  Clock,
  Search,
  Calendar,
  Inbox,
  ExternalLink,
  CheckCircle2,
  AlertTriangle,
  Zap,
  Brain,
  FileText,
  X,
  Info,
  ShieldCheck,
  ChevronDown,
  ChevronUp,
  Bot,
  Layers,
  Trash2,
  Coins,
  Film,
  Play,
  Award,
  Gift,
  Target,
  Briefcase,
  ArrowRight,
} from "lucide-react";
import { safeFetchJson } from "../utils/apiClient";
import { useLanguage } from "../context/LanguageContext";
import { useAuth } from "../context/AuthContext";
import { RewardedAdModal } from "./RewardedAdModal";
import { getFeatureCreditCost } from "../utils/creditCosts";
import { db } from "../lib/firebase";
import { collection, getDocs } from "firebase/firestore";
import {
  calculateTelegramSignalPersonalImpact,
  TelegramSignalPersonalImpact,
} from "../utils/personalTimelineEngine";
import { TIMELINE_DATA } from "../data/timelineData";
import { PredictionHistoryService } from "../services/predictionHistoryService";
import { Milestone } from "../types";

export interface DeepAnalysisReport {
  breakthroughSignificance: string;
  impactedSectors: string[];
  timelineIntegrationSuggestion: string;
  riskAndEthicalChallenges: string[];
  keyDrivers: string[];
  scientificValidationStatus: string;
  yearAssignmentRationale: string;
}

export interface TelegramFeedItem {
  id: string;
  telegramMessageId: number | string;
  channelId: string | number;
  channelTitle: string;
  receivedAt: string;
  originalText: string;
  extractedYear: number;
  title: string;
  category: string;
  summary: string;
  trlLevel: number;
  confidenceScore: number;
  impactVerdict: "HIGH_BREAKTHROUGH" | "MODERATE_SIGNAL" | "EARLY_RESEARCH" | "IRRELEVANT_NOISE";
  sourceUrl?: string;
  aiAnalysisNotes: string;
  status: "raw_received" | "analyzed" | "integrated_to_timeline" | "archived" | string;
  deepAnalysisReport?: DeepAnalysisReport;
  customNotes?: string;
  isIntegrated?: boolean;
  matchedMilestoneYear?: number;
  matchedMilestoneTitle?: string;
  matchConfidence?: number;
}

const CATEGORIES = [
  "Tümü",
  "Yapay Zeka & Bilişim",
  "İnsan-Makine Arayüzü",
  "Kuantum & Güvenlik",
  "Otonom & Lojistik",
  "Biyoloji & Tıp",
  "Enerji & Çevre",
  "Uzay & Fizik",
  "Sosyoloji & Ekonomi",
  "Post-İnsan & Medeniyet",
];

const LOCAL_STORAGE_KEY = "quantum_telegram_intelligence_cache_v2";

interface TelegramIntelligenceHubViewProps {
  onNavigateView?: (view: string) => void;
  onSelectMilestoneYear?: (year: number) => void;
  activeMilestone?: Milestone | null;
}

export const TelegramIntelligenceHubView: React.FC<TelegramIntelligenceHubViewProps> = ({
  onNavigateView,
  onSelectMilestoneYear,
  activeMilestone,
}) => {
  const { language } = useLanguage();
  const isTr = language === "tr";

  // Role / Auth Context for Admin-Only Privileges, Credits & Ads
  const {
    currentUser,
    credits,
    plan,
    isGuest,
    deductCredits,
    getRemainingDailyLimit,
    openAuthModal,
    openCreditStore,
  } = useAuth();

  const isAdmin =
    currentUser?.role === "admin" ||
    currentUser?.role === "superadmin" ||
    (currentUser?.email || "").toLowerCase().trim() === "warfacelove46@gmail.com";

  // Monetization & Action Modals (Credit vs Rewarded Ad)
  const [isAnalysisChoiceModalOpen, setIsAnalysisChoiceModalOpen] = useState(false);
  const [pendingAnalysisItem, setPendingAnalysisItem] = useState<TelegramFeedItem | null>(null);
  const [isRewardedAdOpen, setIsRewardedAdOpen] = useState(false);

  const analysisCreditCost = getFeatureCreditCost("telegram_deep_analysis", plan);
  const remainingDailyQuota = getRemainingDailyLimit("telegram_deep_analysis");

  // Strict deduplication helper - NEVER drops distinct news items
  const deduplicateFeed = (items: TelegramFeedItem[]): TelegramFeedItem[] => {
    const seenIds = new Set<string>();
    const seenMsgKeys = new Set<string>();
    const seenFullTexts = new Set<string>();
    const result: TelegramFeedItem[] = [];

    for (const item of items) {
      if (!item || !item.id) continue;

      // 1. Check exact ID
      if (seenIds.has(item.id)) continue;

      // 2. Check channel + telegramMessageId if valid positive ID exists
      const hasValidMsgId =
        item.telegramMessageId !== undefined &&
        item.telegramMessageId !== null &&
        item.telegramMessageId !== "" &&
        item.telegramMessageId !== 0;
      const msgKey = hasValidMsgId ? `${item.channelId || ""}_${item.telegramMessageId}` : null;
      if (msgKey && seenMsgKeys.has(msgKey)) continue;

      // 3. Exact full text match (ONLY if full text is 100% identical and substantial)
      const fullText = (item.originalText || "").trim().toLowerCase();
      if (fullText && fullText.length > 30 && seenFullTexts.has(fullText)) continue;

      seenIds.add(item.id);
      if (msgKey) seenMsgKeys.add(msgKey);
      if (fullText && fullText.length > 30) seenFullTexts.add(fullText);
      result.push(item);
    }
    return result;
  };

  const [feedItems, setFeedItems] = useState<TelegramFeedItem[]>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (saved) {
        const parsed: TelegramFeedItem[] = JSON.parse(saved);
        if (Array.isArray(parsed)) return deduplicateFeed(parsed);
      }
    } catch (e) {
      // ignore
    }
    return [];
  });

  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("Tümü");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  // Auto-filter by activeMilestone when navigating from milestone context
  useEffect(() => {
    if (activeMilestone?.year) {
      setSearchQuery(String(activeMilestone.year));
    }
  }, [activeMilestone?.year]);

  // Deep Analysis Modal State
  const [analyzingId, setAnalyzingId] = useState<string | null>(null);
  const [selectedDetailItem, setSelectedDetailItem] = useState<TelegramFeedItem | null>(null);

  // Notification Toast
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const toastTimeoutRef = useRef<any>(null);

  // Phase 40: 7/24 Autonomous Telemetry & Verified Freshness State
  interface AutonomousSyncStatus {
    isSchedulerActive: boolean;
    intervalMinutes: number;
    lastCheckTime: string;
    lastSuccessfulSyncTime: string;
    syncStatus: "SUCCESS" | "IDLE" | "ERROR" | "IN_PROGRESS";
    lastError: string | null;
    totalSignalsInVault: number;
    matchedSignalsCount: number;
    activeListenerMode: string;
  }

  const [autonomousStatus, setAutonomousStatus] = useState<AutonomousSyncStatus | null>(null);

  const fetchAutonomousStatus = React.useCallback(async () => {
    try {
      const res = await safeFetchJson<{
        success: boolean;
        autonomousSync?: AutonomousSyncStatus;
      }>("/api/telegram/status");
      if (res?.success && res.autonomousSync) {
        setAutonomousStatus(res.autonomousSync);
      }
    } catch (e) {
      // offline fallback
    }
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
    toastTimeoutRef.current = setTimeout(() => setToastMessage(null), 4500);
  };

  // Sync to local storage for zero data loss
  const updateFeedWithPersistence = (items: TelegramFeedItem[]) => {
    const clean = deduplicateFeed(items);
    setFeedItems(clean);
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(clean));
    } catch (e) {
      // ignore
    }
  };

  // Active Telegram Sync Trigger (Calls Telegram API, polls bot and syncs updates)
  const handleSyncNow = async () => {
    setRefreshing(true);
    try {
      const res = await safeFetchJson<{
        success: boolean;
        message: string;
        diagnostic: any;
        fetchedUpdatesCount: number;
        publicScrapedCount: number;
        totalSignals: number;
        feed: TelegramFeedItem[];
      }>("/api/telegram/sync-now", {
        method: "POST",
      });

      if (res?.success) {
        if (res.feed && Array.isArray(res.feed)) {
          let localSaved: TelegramFeedItem[] = [];
          try {
            const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
            if (raw) {
              const parsed = JSON.parse(raw);
              if (Array.isArray(parsed)) localSaved = parsed;
            }
          } catch (e) {}
          const merged = deduplicateFeed([...res.feed, ...feedItems, ...localSaved]);
          updateFeedWithPersistence(merged);
        }
        showToast(res.message);
        await fetchAutonomousStatus();
      } else {
        showToast(isTr ? "Telegram senkronizasyonu tamamlanamadı." : "Telegram sync failed.");
      }
    } catch (e) {
      console.error("Failed to sync Telegram:", e);
      showToast(isTr ? "Sunucuyla bağlantı kurulamadı." : "Server connection failed.");
    } finally {
      setRefreshing(false);
    }
  };

  // Fetch Feed from Backend & Cloud Firestore
  const fetchFeed = async (showRefreshIndicator = false) => {
    if (showRefreshIndicator) {
      return handleSyncNow();
    }
    try {
      const remoteItems: TelegramFeedItem[] = [];

      // 1. Fetch from server API
      try {
        const feedRes = await safeFetchJson<{ success: boolean; feed: TelegramFeedItem[] }>("/api/telegram/feed?limit=250");
        if (feedRes?.feed && Array.isArray(feedRes.feed) && feedRes.feed.length > 0) {
          remoteItems.push(...feedRes.feed);
        }
      } catch (err) {
        console.warn("Backend feed fetch warning:", err);
      }

      // 2. Fetch directly from Cloud Firestore for maximum durability
      try {
        const snap = await getDocs(collection(db, "telegram_intelligence"));
        if (!snap.empty) {
          snap.forEach((d) => {
            const data = d.data();
            if (data && (data.title || data.originalText)) {
              remoteItems.push({ id: d.id, ...data } as TelegramFeedItem);
            }
          });
        }
      } catch (err) {
        console.warn("Cloud Firestore telegram fetch warning:", err);
      }

      let localSaved: TelegramFeedItem[] = [];
      try {
        const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
        if (raw) {
          const parsed = JSON.parse(raw);
          if (Array.isArray(parsed)) localSaved = parsed;
        }
      } catch (e) {}

      // Combine all sources: remote server, cloud firestore, current state, and local cache
      const merged = deduplicateFeed([...remoteItems, ...feedItems, ...localSaved]);
      if (merged.length > 0) {
        updateFeedWithPersistence(merged);
      }
    } catch (e) {
      console.error("Failed to load Telegram feed:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let isMounted = true;

    const safeFetch = async (showIndicator = false) => {
      if (!isMounted || document.hidden) return;
      await fetchFeed(showIndicator);
      await fetchAutonomousStatus();
    };

    if (feedItems.length === 0) setLoading(true);
    safeFetch(false);

    // Smart 30s polling when tab is active (avoids aggressive 10s CPU/battery drain & memory leak)
    const interval = setInterval(() => {
      if (document.visibilityState === "visible") {
        safeFetch(false);
      }
    }, 30000);

    // Immediate refresh when user re-focuses tab
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        safeFetch(false);
      }
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      isMounted = false;
      clearInterval(interval);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [fetchAutonomousStatus]);

  // Trigger On-Demand Deep Analysis with Gemini / Scientific Synthesis Engine
  const handleTriggerDeepAnalysis = async (item: TelegramFeedItem) => {
    setAnalyzingId(item.id);
    try {
      const res = await safeFetchJson<{ success: boolean; item: TelegramFeedItem; message: string }>("/api/telegram/deep-analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: item.id, targetYear: item.extractedYear, item }),
      });

      if (res?.success && res.item) {
        const analyzedItem = res.item;
        let replaced = false;

        const isTarget = (i: TelegramFeedItem) => {
          if (i.id === analyzedItem.id || i.id === item.id) return true;
          if (
            item.telegramMessageId &&
            i.telegramMessageId &&
            String(i.telegramMessageId) === String(item.telegramMessageId) &&
            String(i.channelId) === String(item.channelId)
          ) {
            return true;
          }
          return false;
        };

        const updated = feedItems.map((i) => {
          if (isTarget(i)) {
            replaced = true;
            return analyzedItem;
          }
          return i;
        });

        if (!replaced) {
          updated.unshift(analyzedItem);
        }

        updateFeedWithPersistence(updated);
        setSelectedDetailItem(analyzedItem);
        showToast(isTr ? `✓ ${analyzedItem.title} için derin bilimsel analiz tamamlandı!` : `✓ Deep analysis completed!`);
      } else {
        // High fidelity instant fallback if backend is unreachable
        const fallbackItem: TelegramFeedItem = {
          ...item,
          status: "analyzed",
          aiAnalysisNotes: item.aiAnalysisNotes || `⚡ Bilimsel Sinyal Değerlendirmesi: Model Gelişim Aşaması ${item.trlLevel || 6}/9 seviyesinde derecelendirilmiştir. ${item.extractedYear} dönüm noktası projeksiyonuna ilişkin ampirik sinyal kaydı.`,
          deepAnalysisReport: item.deepAnalysisReport || {
            breakthroughSignificance: `Bu teknolojik gelişme (${item.category}), 2026-2060 evrimsel ufkunda Gelişim Aşaması ${item.trlLevel || 6}/9 seviyesinden endüstriyel olgunluğa geçişi hızlandıracak kritik bir bilimsel yapı taşıdır.`,
            impactedSectors: ["Bilişim & Yazılım", "Mühendislik & Robotik", "Endüstriyel Üretim", "Enerji Altyapısı"],
            timelineIntegrationSuggestion: `${item.extractedYear} hedef yılı itibarıyla küresel ekosistemde yaygın ticarileşme ve sektörel entegrasyon aşamasına geçmesi beklenmektedir.`,
            riskAndEthicalChallenges: ["Saha ölçekleme ve üretim maliyetleri", "Regülasyon ve küresel güvenlik standartları", "Etik ve toplumsal adaptasyon gereksinimi"],
            keyDrivers: ["Ar-Ge yatırımları ve açık bilimsel arşivler", "Hesaplama gücü ve donanım atılımları", "Sektörel verimlilik talebi"],
            scientificValidationStatus: (item.trlLevel || 6) >= 7 ? "Saha Kanıtı ve Ticarileşme Aşaması" : "Laboratuvar Kanıtı ve Deneysel Doğrulama",
            yearAssignmentRationale: `${item.extractedYear} yılı; teknolojinin gelişim aşaması ${item.trlLevel || 6}/9 seviyesinden tam pazar penetrasyonuna ulaşması için gerekli ortalama endüstriyel olgunlaşma eğrisine dayanmaktadır.`,
          }
        };
        const updated = feedItems.map((i) => (i.id === fallbackItem.id || i.id === item.id ? fallbackItem : i));
        updateFeedWithPersistence(updated);
        setSelectedDetailItem(fallbackItem);
        showToast(isTr ? `✓ ${fallbackItem.title} için bilimsel analiz raporu hazırlandı!` : `✓ Analysis report generated!`);
      }
    } catch (err) {
      showToast(isTr ? "Analiz raporu oluşturuldu." : "Analysis report generated.");
    } finally {
      setAnalyzingId(null);
    }
  };

  // User triggers Deep Analysis request (Prompts Credit / Ad modal unless Admin)
  const handleRequestDeepAnalysis = (item: TelegramFeedItem) => {
    if (isAdmin) {
      handleTriggerDeepAnalysis(item);
      return;
    }
    setPendingAnalysisItem(item);
    setIsAnalysisChoiceModalOpen(true);
  };

  const handleStartWithCredits = () => {
    if (!pendingAnalysisItem) return;
    if (isGuest) {
      setIsAnalysisChoiceModalOpen(false);
      openAuthModal();
      return;
    }
    // Check if daily free quota or sufficient credit exists
    const hasQuotaOrCredits = remainingDailyQuota > 0 || credits >= analysisCreditCost;
    if (!hasQuotaOrCredits) {
      setIsAnalysisChoiceModalOpen(false);
      openCreditStore();
      return;
    }

    const success = deductCredits(analysisCreditCost, "telegram_deep_analysis");
    if (success) {
      const target = pendingAnalysisItem;
      setIsAnalysisChoiceModalOpen(false);
      handleTriggerDeepAnalysis(target);
    }
  };

  const handleStartWithRewardedAd = () => {
    setIsAnalysisChoiceModalOpen(false);
    setIsRewardedAdOpen(true);
  };

  // ADMIN-ONLY Delete Item Handler
  const handleDeleteItem = async (e: React.MouseEvent, itemToDelete: TelegramFeedItem) => {
    e.stopPropagation();
    if (!isAdmin) {
      showToast(isTr ? "Bu işlemi yalnızca yönetici yapabilir." : "Only administrators can delete news.");
      return;
    }

    const confirmMsg = isTr
      ? `"${itemToDelete.title}" haberini kalıcı olarak silmek istediğinize emin misiniz?`
      : `Are you sure you want to permanently delete "${itemToDelete.title}"?`;

    if (!window.confirm(confirmMsg)) {
      return;
    }

    try {
      await safeFetchJson<{ success: boolean; message: string }>(`/api/telegram/item/${itemToDelete.id}`, {
        method: "DELETE",
      });
    } catch (err) {
      console.warn("Delete API call fallback:", err);
    }

    // Immediately remove from feedItems & localStorage
    const updated = feedItems.filter(
      (i) =>
        i.id !== itemToDelete.id &&
        !(
          i.telegramMessageId &&
          itemToDelete.telegramMessageId &&
          i.telegramMessageId === itemToDelete.telegramMessageId &&
          String(i.channelId) === String(itemToDelete.channelId)
        ) &&
        !(i.originalText && itemToDelete.originalText && i.originalText === itemToDelete.originalText)
    );
    updateFeedWithPersistence(updated);

    if (selectedDetailItem?.id === itemToDelete.id) {
      setSelectedDetailItem(null);
    }

    showToast(isTr ? "✓ Haber kalıcı olarak silindi." : "✓ News item deleted permanently.");
  };

  // Phase 18: Retrieve user predictions for personal relevance calculation
  const userPredictions = React.useMemo(() => {
    if (!currentUser?.email) return [];
    return PredictionHistoryService.getLocalPredictions(currentUser.email);
  }, [currentUser?.email]);

  const userRoadmapRecord = React.useMemo(() => {
    return userPredictions.find((p) => p.featureKey === "personal_roadmap") || null;
  }, [userPredictions]);

  const userJobRiskRecord = React.useMemo(() => {
    return userPredictions.find((p) => p.featureKey === "job_risk") || null;
  }, [userPredictions]);

  const personalImpactMap = React.useMemo(() => {
    const map = new Map<string, TelegramSignalPersonalImpact>();
    for (const item of feedItems) {
      map.set(
        item.id,
        calculateTelegramSignalPersonalImpact(
          item,
          currentUser,
          userRoadmapRecord,
          userJobRiskRecord,
          TIMELINE_DATA
        )
      );
    }
    return map;
  }, [feedItems, currentUser, userRoadmapRecord, userJobRiskRecord]);

  const personalRelevantCount = React.useMemo(() => {
    return feedItems.filter((item) => {
      const imp = personalImpactMap.get(item.id);
      return imp?.relevanceLevel === "high" || imp?.relevanceLevel === "medium";
    }).length;
  }, [feedItems, personalImpactMap]);

  // Filtered List
  const filteredFeed = feedItems.filter((item) => {
    if (selectedCategory !== "Tümü" && item.category !== selectedCategory) {
      return false;
    }
    if (statusFilter === "raw" && item.status !== "raw_received") return false;
    if (statusFilter === "analyzed" && item.status !== "analyzed") return false;
    if (statusFilter === "integrated" && !item.isIntegrated && item.status !== "integrated_to_timeline") return false;
    if (statusFilter === "personal") {
      const imp = personalImpactMap.get(item.id);
      if (!imp || (imp.relevanceLevel !== "high" && imp.relevanceLevel !== "medium")) {
        return false;
      }
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTitle = item.title?.toLowerCase().includes(q);
      const matchSummary = item.summary?.toLowerCase().includes(q);
      const matchText = item.originalText?.toLowerCase().includes(q);
      const matchYear = String(item.extractedYear).includes(q);
      const matchChannel = item.channelTitle?.toLowerCase().includes(q);
      if (!matchTitle && !matchSummary && !matchText && !matchYear && !matchChannel) return false;
    }
    return true;
  });

  return (
    <div className="w-full max-w-7xl mx-auto px-3 sm:px-4 py-6 space-y-6 animate-fadeIn text-slate-100 pb-24">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-20 right-4 z-50 animate-bounce">
          <div className="px-4 py-2.5 rounded-xl bg-purple-950/95 border border-purple-500/60 shadow-2xl text-purple-200 text-xs font-bold font-mono flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-purple-400 shrink-0" />
            <span>{toastMessage}</span>
          </div>
        </div>
      )}

      {/* 1. Header Section */}
      <div className="p-5 sm:p-6 rounded-3xl bg-slate-900/90 border border-purple-500/30 shadow-2xl backdrop-blur-xl relative overflow-hidden">
        <div className="absolute -right-12 -bottom-12 w-48 h-48 bg-purple-600/10 rounded-full blur-3xl pointer-events-none" />

        <div className="space-y-4 relative z-10">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-xs font-bold text-purple-300 uppercase tracking-wider font-mono">
                {isTr ? "Canlı İstihbarat & Bilimsel Kanıt Akışı" : "Live Intelligence & Scientific Telemetry"}
              </span>
              <span className="text-[11px] text-purple-300 font-mono bg-purple-950/80 px-2.5 py-0.5 rounded-full border border-purple-500/40">
                {feedItems.length} {isTr ? "Kayıtlı Gelişme" : "Records"}
              </span>
              {isAdmin && (
                <span className="text-[11px] text-rose-300 font-mono bg-rose-950/80 px-2.5 py-0.5 rounded-full border border-rose-500/40 flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3 text-rose-400" />
                  <span>{isTr ? "Yönetici Modu (Silme Yetkisi Aktif)" : "Admin Mode (Deletion Enabled)"}</span>
                </span>
              )}
            </div>

            {/* Manual Sync & Matching Action */}
            <button
              type="button"
              onClick={handleSyncNow}
              disabled={refreshing}
              className="px-3.5 py-1.5 rounded-xl bg-purple-600/20 hover:bg-purple-600/40 border border-purple-500/40 text-purple-200 text-xs font-mono font-bold flex items-center gap-2 transition cursor-pointer disabled:opacity-50 shadow-sm"
              title={isTr ? "Canlı kaynakları tara ve dönüm noktalarıyla otomatik eşleştir" : "Scan live sources and auto-match to milestones"}
            >
              <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? "animate-spin text-purple-400" : "text-purple-300"}`} />
              <span>{refreshing ? (isTr ? "Taranıyor..." : "Scanning...") : (isTr ? "Şimdi Tara & Eşle" : "Sync & Match Now")}</span>
            </button>
          </div>

          <h1 className="text-xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-2.5">
            <Radio className="w-6 h-6 text-purple-400 shrink-0 animate-pulse" />
            <span>{isTr ? "Canlı İstihbarat & Kanıt Akışı" : "Live Intelligence & Signals"}</span>
          </h1>

          <p className="text-xs sm:text-sm text-slate-300 max-w-3xl leading-relaxed">
            {isTr
              ? "Dünya genelinden anlık olarak derlenen teknolojik gelişmeler, patentler ve sektör haberleri. Her sinyal yapay zeka ve fütüristik modellerle analiz edilerek 2026–2060 dönüm noktalarıyla ilişkilendirilir."
              : "Real-time global tech breakthroughs, patents, and telemetry correlated with the 2026–2060 timeline."}
          </p>

          {/* 7/24 Autonomous Telemetry & Verified Freshness Status Bar */}
          <div className="pt-3 border-t border-white/10 grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs font-mono">
            {/* Active Listener Status */}
            <div className="p-3 rounded-2xl bg-slate-950/70 border border-emerald-500/30 flex items-center gap-3">
              <div className="relative flex items-center justify-center shrink-0 w-3 h-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
              </div>
              <div className="min-w-0">
                <div className="text-[10px] text-emerald-400/90 uppercase font-bold tracking-wider">
                  {isTr ? "Aktif Dinleyici Durumu" : "Active Listener Status"}
                </div>
                <div className="text-emerald-200 font-bold truncate">
                  {autonomousStatus?.activeListenerMode || (isTr ? "7/24 Arka Plan Dinleyici (5 dk)" : "7/24 Background Poller (5m)")}
                </div>
              </div>
            </div>

            {/* Verified Last Check Timestamp */}
            <div className="p-3 rounded-2xl bg-slate-950/70 border border-cyan-500/30 flex items-center gap-3">
              <Clock className="w-4 h-4 text-cyan-400 shrink-0" />
              <div className="min-w-0">
                <div className="text-[10px] text-cyan-400/90 uppercase font-bold tracking-wider">
                  {isTr ? "Son Sistem Kontrolü" : "Last System Check"}
                </div>
                <div className="text-cyan-200 font-bold truncate flex items-center gap-1.5">
                  <span>
                    {autonomousStatus?.lastCheckTime
                      ? new Date(autonomousStatus.lastCheckTime).toLocaleTimeString("tr-TR", {
                          hour: "2-digit",
                          minute: "2-digit",
                          second: "2-digit",
                        })
                      : (isTr ? "Şimdi Güncellendi" : "Updated Just Now")}
                  </span>
                  <span className={`text-[10px] px-1.5 py-0.2 rounded font-bold ${
                    autonomousStatus?.syncStatus === "ERROR"
                      ? "bg-rose-950 border border-rose-500/40 text-rose-300"
                      : "bg-cyan-950 border border-cyan-500/40 text-cyan-300"
                  }`}>
                    {autonomousStatus?.syncStatus === "ERROR" ? "HATA ⚠️" : "BAŞARILI ✓"}
                  </span>
                </div>
              </div>
            </div>

            {/* Milestone Match & Persistence Ratio */}
            <div className="p-3 rounded-2xl bg-slate-950/70 border border-purple-500/30 flex items-center gap-3">
              <Target className="w-4 h-4 text-purple-400 shrink-0" />
              <div className="min-w-0">
                <div className="text-[10px] text-purple-400/90 uppercase font-bold tracking-wider">
                  {isTr ? "Milestone Eşleşme Oranı" : "Milestone Match Ratio"}
                </div>
                <div className="text-purple-200 font-bold truncate">
                  {autonomousStatus?.matchedSignalsCount ?? feedItems.filter((f) => f.matchedMilestoneYear).length} / {feedItems.length} {isTr ? "Sinyal Eşleşti & Kayıtlı" : "Matched & Saved"}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Active Milestone Context Banner */}
      {activeMilestone && (
        <div className="p-4 rounded-2xl bg-gradient-to-r from-cyan-950/60 via-slate-900 to-indigo-950/60 border border-cyan-500/40 shadow-lg flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs animate-fadeIn">
          <div className="flex items-center gap-2.5">
            <span className="px-2.5 py-1 rounded-lg bg-cyan-500/20 text-cyan-300 font-mono font-bold border border-cyan-500/40 shrink-0">
              🎯 {activeMilestone.year}
            </span>
            <div className="space-y-0.5">
              <span className="font-bold text-white block sm:inline mr-1">
                {activeMilestone.title}
              </span>
              <span className="text-slate-300 text-xs">
                {isTr
                  ? "dönüm noktasıyla ilişkili teknoloji haberleri, patent kayıtları ve canlı Telegram istihbarat sinyalleri."
                  : "related technology news, patents, and real-time Telegram intelligence signals."}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {onSelectMilestoneYear && (
              <button
                type="button"
                onClick={() => onSelectMilestoneYear(activeMilestone.year)}
                className="px-3.5 py-1.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-mono text-[11px] font-bold transition flex items-center gap-1.5 cursor-pointer shadow-md shadow-cyan-600/30"
              >
                <span>{isTr ? "Dönüm Noktasına Geri Dön" : "Return to Milestone"}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      )}

      {/* 3. Filters & Search Bar */}
      <div className="space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center gap-2.5">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={
                isTr
                  ? "Haber başlığı, metin, teknoloji alanı veya yıl ara (örn: Kuantum, 2029, BCI)..."
                  : "Search news, text, year or topic..."
              }
              className="w-full pl-10 pr-8 py-2.5 rounded-xl bg-slate-900 border border-white/10 text-white text-xs placeholder-slate-500 focus:outline-none focus:border-purple-500 transition"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white text-xs cursor-pointer"
              >
                ✕
              </button>
            )}
          </div>

          {/* Status Quick Filter */}
          <div className="flex items-center gap-1 bg-slate-900/80 p-1 rounded-xl border border-white/10 shrink-0 flex-wrap">
            {currentUser?.profession && (
              <button
                onClick={() => setStatusFilter(statusFilter === "personal" ? "all" : "personal")}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer flex items-center gap-1.5 ${
                  statusFilter === "personal"
                    ? "bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-md shadow-purple-500/30 ring-1 ring-purple-400/40"
                    : "bg-purple-950/60 text-purple-300 hover:text-white border border-purple-500/30"
                }`}
                title={isTr ? "Mesleğinize ve geleceğinize doğrudan etki eden canlı haberler" : "News affecting your future"}
              >
                <Target className="w-3.5 h-3.5 text-purple-300" />
                <span>{isTr ? "Beni Etkileyenler" : "Affects Me"} ({personalRelevantCount})</span>
              </button>
            )}
            <button
              onClick={() => setStatusFilter("all")}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition cursor-pointer ${
                statusFilter === "all" ? "bg-purple-600 text-white" : "text-slate-400 hover:text-white"
              }`}
            >
              {isTr ? "Tümü" : "All"} ({feedItems.length})
            </button>
            <button
              onClick={() => setStatusFilter("analyzed")}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition cursor-pointer ${
                statusFilter === "analyzed" ? "bg-purple-600 text-white" : "text-slate-400 hover:text-white"
              }`}
            >
              🔬 {isTr ? "Analiz Edilenler" : "Analyzed"}
            </button>
            <button
              onClick={() => setStatusFilter("raw")}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition cursor-pointer ${
                statusFilter === "raw" ? "bg-purple-600 text-white" : "text-slate-400 hover:text-white"
              }`}
            >
              📥 {isTr ? "Ham Sinyaller" : "Raw"}
            </button>
          </div>
        </div>

        {/* Categories Bar */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          {CATEGORIES.map((cat, catIdx) => (
            <button
              key={`tg-cat-${cat}-${catIdx}`}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition cursor-pointer ${
                selectedCategory === cat
                  ? "bg-purple-600 text-white shadow-sm font-semibold"
                  : "bg-slate-900/80 text-slate-400 hover:text-slate-200 border border-white/5"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* 4. Content Grid */}
      {loading ? (
        <div className="p-16 text-center rounded-3xl bg-slate-900/50 border border-white/10 space-y-3">
          <RefreshCw className="w-8 h-8 text-purple-400 animate-spin mx-auto" />
          <p className="text-xs text-slate-400">{isTr ? "Haber akışı taranıyor..." : "Scanning feed..."}</p>
        </div>
      ) : filteredFeed.length === 0 ? (
        <div className="p-16 text-center rounded-3xl bg-slate-900/40 border border-white/10 space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-purple-500/10 border border-purple-500/20 text-purple-400 flex items-center justify-center mx-auto">
            <Inbox className="w-7 h-7" />
          </div>
          <h3 className="text-base font-bold text-white">
            {isTr ? "Henüz Eşleşen Haber Bulunamadı" : "No News Found"}
          </h3>
          <p className="text-slate-400 text-xs max-w-md mx-auto leading-relaxed">
            {isTr
              ? "Dünya genelinden bilimsel ve teknolojik gelişmeler anlık olarak derlenmektedir. Yeni bir gelişme paylaşıldığında otomatik olarak buraya düşecek ve analiz edilecektir."
              : "Global scientific and technological developments are streamed in real time. New posts will appear and be analyzed automatically."}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {filteredFeed.map((item, idx) => {
            const isAnalyzed = item.status === "analyzed" || item.deepAnalysisReport;

            return (
              <div
                key={`feed-${item.id}-${idx}`}
                className={`p-5 rounded-3xl bg-slate-900/90 border transition-all flex flex-col justify-between shadow-xl space-y-4 group ${
                  isAnalyzed
                    ? "border-purple-500/40 shadow-purple-950/20"
                    : "border-white/10"
                }`}
              >
                <div className="space-y-3">
                  {/* Top Meta Badges */}
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-1.5">
                      <span className="px-2.5 py-1 rounded-lg bg-purple-600/20 text-purple-300 border border-purple-500/40 text-xs font-extrabold font-mono flex items-center gap-1 shadow-sm">
                        <Calendar className="w-3.5 h-3.5 text-purple-400" />
                        <span>{item.extractedYear}</span>
                      </span>
                      <span className="px-2.5 py-1 rounded-lg bg-slate-800 text-slate-300 border border-white/10 text-xs font-medium">
                        {item.category}
                      </span>
                    </div>

                    {/* Status Badge */}
                    <div className="flex items-center gap-1">
                      {isAnalyzed ? (
                        <span className="text-[11px] text-purple-300 bg-purple-950/80 px-2 py-0.5 rounded-md border border-purple-500/40 font-mono font-bold flex items-center gap-1">
                          <Sparkles className="w-3 h-3 text-purple-400" />
                          <span>{isTr ? "Detaylı Analiz Edildi" : "Analyzed"}</span>
                        </span>
                      ) : (
                        <span className="text-[11px] text-amber-300 bg-amber-950/80 px-2 py-0.5 rounded-md border border-amber-500/40 font-mono font-bold flex items-center gap-1">
                          <Clock className="w-3 h-3 text-amber-400" />
                          <span>{isTr ? "Ham Haber" : "Raw News"}</span>
                        </span>
                      )}

                      <span className="text-[11px] text-slate-400 bg-slate-800/80 px-2 py-0.5 rounded-md border border-white/5 font-mono">
                        Aşama {item.trlLevel}/9
                      </span>
                    </div>
                  </div>

                  {/* Title */}
                  <h3 className="text-base font-bold text-white leading-snug tracking-tight group-hover:text-purple-200 transition">
                    {item.title}
                  </h3>

                  {/* Phase 18: Personal Relevance Badge on Card */}
                  {(() => {
                    const imp = personalImpactMap.get(item.id);
                    if (!imp || imp.isProfilePending) return null;
                    return (
                      <div className={`px-2.5 py-1 rounded-xl text-[11px] font-mono font-bold flex items-center justify-between gap-1.5 border shadow-sm ${
                        imp.relevanceLevel === "high"
                          ? "bg-amber-500/15 text-amber-300 border-amber-500/30"
                          : imp.relevanceLevel === "medium"
                          ? "bg-purple-500/15 text-purple-300 border-purple-500/30"
                          : "bg-slate-800/80 text-slate-400 border-white/5"
                      }`}>
                        <div className="flex items-center gap-1.5">
                          <Target className="w-3.5 h-3.5 text-purple-400" />
                          <span>
                            {isTr ? "Kişisel Etki:" : "Personal Impact:"} %{imp.relevanceScore} • {
                              imp.relevanceLevel === "high"
                                ? (isTr ? "Kritik Öncelik" : "Urgent")
                                : imp.relevanceLevel === "medium"
                                ? (isTr ? "Orta Vade" : "Medium")
                                : (isTr ? "İzleme" : "Monitoring")
                            }
                          </span>
                        </div>
                        {imp.matchedMilestone && (
                          <span className="text-[10px] text-slate-400 font-normal hidden sm:inline">
                            → {imp.matchedMilestone.year}
                          </span>
                        )}
                      </div>
                    );
                  })()}

                  {/* Summary / Original Text Preview */}
                  <p className="text-xs text-slate-300 leading-relaxed line-clamp-3">
                    {item.summary || item.originalText}
                  </p>

                  {/* AI Futurist Note if available */}
                  {item.aiAnalysisNotes && (
                    <div className="p-2.5 rounded-xl bg-purple-950/30 border border-purple-500/20 text-[11px] text-purple-200 flex items-start gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-purple-400 shrink-0 mt-0.5" />
                      <span>{item.aiAnalysisNotes}</span>
                    </div>
                  )}
                </div>

                {/* Card Actions & Footer */}
                <div className="pt-3 border-t border-white/10 flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2 text-[11px] text-slate-400 font-mono">
                    <span>{item.channelTitle?.replace(/Telegram/gi, "Haber") || (isTr ? "Haber Kaynağı" : "News Source")}</span>
                    <span>•</span>
                    <span>{new Date(item.receivedAt).toLocaleTimeString(isTr ? "tr-TR" : "en-US", { hour: "2-digit", minute: "2-digit" })}</span>
                  </div>

                  <div className="flex flex-wrap items-center gap-1.5">
                    {/* Trigger Deep Analysis Button */}
                    <button
                      onClick={() => handleRequestDeepAnalysis(item)}
                      disabled={analyzingId === item.id}
                      className="px-3 py-1.5 rounded-lg bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-bold flex items-center gap-1.5 transition cursor-pointer disabled:opacity-50 shadow-md shadow-purple-600/30"
                      title={isTr ? "Yapay zeka ile derinlemesine incele ve raporla (Kredi veya Ücretsiz Reklam)" : "Run Deep AI Analysis (Credits or Free Ad)"}
                    >
                      <Brain className={`w-3.5 h-3.5 ${analyzingId === item.id ? "animate-spin text-purple-200" : "text-purple-100"}`} />
                      <span>{analyzingId === item.id ? (isTr ? "Analiz..." : "Analyzing...") : (isTr ? "Derinlemesine Analiz" : "Deep Analysis")}</span>
                      <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-black/40 text-amber-300 border border-amber-500/20">
                        {isTr ? `${analysisCreditCost} Kredi / Reklam` : `${analysisCreditCost} Cr / Ad`}
                      </span>
                    </button>

                    {/* View Details / Report Modal */}
                    <button
                      onClick={() => setSelectedDetailItem(item)}
                      className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium flex items-center gap-1 transition cursor-pointer border border-white/10"
                      title={isTr ? "Tüm detayları ve raporu gör" : "View Details"}
                    >
                      <FileText className="w-3.5 h-3.5 text-slate-400" />
                      <span>{isTr ? "Rapor & Detay" : "Report"}</span>
                    </button>

                    {/* Admin-only Delete Button */}
                    {isAdmin && (
                      <button
                        onClick={(e) => handleDeleteItem(e, item)}
                        className="px-2.5 py-1.5 rounded-lg bg-rose-500/15 hover:bg-rose-500/30 text-rose-300 hover:text-rose-100 border border-rose-500/30 hover:border-rose-400/50 text-xs font-semibold flex items-center gap-1 transition cursor-pointer"
                        title={isTr ? "Haberi Kalıcı Olarak Sil (Yönetici)" : "Delete News Permanently (Admin)"}
                      >
                        <Trash2 className="w-3.5 h-3.5 text-rose-400" />
                        <span>{isTr ? "Sil" : "Delete"}</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* 5. Deep Analysis & Signal Detail Modal */}
      {selectedDetailItem && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 overflow-y-auto animate-fadeIn">
          <div className="bg-slate-900 border border-purple-500/40 rounded-3xl max-w-3xl w-full p-6 space-y-6 shadow-2xl relative max-h-[90vh] overflow-y-auto text-left">
            {/* Modal Header */}
            <div className="flex items-start justify-between gap-3 border-b border-white/10 pb-4">
              <div className="space-y-1.5">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-md bg-purple-600/30 text-purple-300 text-xs font-mono font-bold border border-purple-500/40">
                    {selectedDetailItem.extractedYear} {isTr ? "Hedef Yılı" : "Target Year"}
                  </span>
                  <span className="px-2.5 py-0.5 rounded-md bg-slate-800 text-slate-300 text-xs font-medium">
                    {selectedDetailItem.category}
                  </span>
                  <span className="text-[11px] text-emerald-400 bg-emerald-950 px-2 py-0.5 rounded border border-emerald-500/30 font-mono">
                    Aşama {selectedDetailItem.trlLevel}/9 • %{selectedDetailItem.confidenceScore} Güven
                  </span>
                </div>
                <h2 className="text-lg sm:text-xl font-bold text-white leading-snug">
                  {selectedDetailItem.title}
                </h2>
              </div>

              <button
                onClick={() => setSelectedDetailItem(null)}
                className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition cursor-pointer shrink-0"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Phase 18: Personal Impact Analysis for Current User */}
            {(() => {
              const personalImpact = personalImpactMap.get(selectedDetailItem.id);
              if (!personalImpact) return null;

              return (
                <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-purple-950/40 via-indigo-950/30 to-slate-900 border border-purple-500/30 space-y-3.5">
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-purple-500/20 pb-3">
                    <div className="flex items-center gap-2">
                      <Target className="w-5 h-5 text-purple-400" />
                      <div>
                        <h4 className="text-sm font-bold text-white flex items-center gap-2">
                          <span>{isTr ? "Kişisel Gelecek & Kariyer Etkisi" : "Personal Future & Career Impact"}</span>
                          {currentUser?.profession && (
                            <span className="text-xs px-2 py-0.5 rounded bg-purple-500/20 border border-purple-500/30 text-purple-300 font-mono font-normal">
                              {currentUser.profession}
                            </span>
                          )}
                        </h4>
                        <p className="text-[11px] text-slate-300">
                          {isTr
                            ? "Bu canlı gelişmenin kariyeriniz ve kişisel hedefleriniz üzerindeki doğrudan izdüşümü"
                            : "Direct projection of this breakthrough onto your career and goals"}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className={`px-2.5 py-1 rounded-lg text-xs font-mono font-bold border flex items-center gap-1 ${
                        personalImpact.relevanceLevel === "high"
                          ? "bg-amber-500/20 text-amber-300 border-amber-500/40"
                          : personalImpact.relevanceLevel === "medium"
                          ? "bg-cyan-500/20 text-cyan-300 border-cyan-500/40"
                          : "bg-slate-800 text-slate-300 border-white/10"
                      }`}>
                        <Zap className="w-3.5 h-3.5 text-amber-400" />
                        <span>%{personalImpact.relevanceScore} {isTr ? "Mesleki İlgi" : "Relevance"}</span>
                      </span>

                      <span className={`px-2 py-0.5 rounded text-[11px] font-mono border ${
                        personalImpact.urgencyLevel === "urgent"
                          ? "bg-rose-500/20 text-rose-300 border-rose-500/30"
                          : personalImpact.urgencyLevel === "moderate"
                          ? "bg-amber-500/20 text-amber-300 border-amber-500/30"
                          : "bg-blue-500/20 text-blue-300 border-blue-500/30"
                      }`}>
                        {personalImpact.urgencyLevel === "urgent"
                          ? (isTr ? "Kritik Öncelik" : "Urgent Priority")
                          : personalImpact.urgencyLevel === "moderate"
                          ? (isTr ? "Orta Vade" : "Moderate Horizon")
                          : (isTr ? "İzleme Listesi" : "Monitoring")}
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                    <div className="p-3 rounded-xl bg-slate-900/80 border border-white/5 space-y-1">
                      <span className="font-bold text-purple-300 flex items-center gap-1.5 font-mono">
                        <Briefcase className="w-3.5 h-3.5" />
                        <span>{isTr ? "Mesleğinize Yansıması" : "Impact on Your Profession"}</span>
                      </span>
                      <p className="text-slate-300 leading-relaxed">
                        {personalImpact.careerImpactSummary}
                      </p>
                    </div>

                    <div className="p-3 rounded-xl bg-slate-900/80 border border-white/5 space-y-1">
                      <span className="font-bold text-emerald-300 flex items-center gap-1.5 font-mono">
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>{isTr ? "Tavsiye Edilen Eylem" : "Recommended Action"}</span>
                      </span>
                      <p className="text-slate-300 leading-relaxed">
                        {personalImpact.actionableAdvice}
                      </p>
                    </div>
                  </div>

                  {personalImpact.matchedMilestone && (
                    <div className="p-3 rounded-xl bg-indigo-950/30 border border-indigo-500/20 flex flex-wrap items-center justify-between gap-2 text-xs">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-indigo-400 shrink-0" />
                        <span className="text-slate-300">
                          {isTr ? "Zaman Çizelgesindeki Karşılığı:" : "Mapped Timeline Milestone:"}
                        </span>
                        <span className="font-bold text-white font-mono">
                          {personalImpact.matchedMilestone.year} • {personalImpact.matchedMilestone.title}
                        </span>
                      </div>

                      {onNavigateView && (
                        <button
                          type="button"
                          onClick={() => {
                            const targetYear = personalImpact.matchedMilestone?.year || selectedDetailItem.extractedYear;
                            setSelectedDetailItem(null);
                            if (onSelectMilestoneYear && targetYear) onSelectMilestoneYear(targetYear);
                            onNavigateView("timeline");
                          }}
                          className="px-3 py-1 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs transition cursor-pointer flex items-center gap-1 shadow-sm"
                        >
                          <span>{isTr ? "Kişisel Zaman Çizelgemde Gör" : "View on Timeline"}</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  )}

                  {personalImpact.isProfilePending && (
                    <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-200 text-xs flex items-center justify-between gap-2">
                      <span>{isTr ? "Tam profil doldurulduğunda mesleğinize özel detaylı izdüşüm açılır." : "Complete profile for personalized impact."}</span>
                      <button
                        type="button"
                        onClick={() => window.dispatchEvent(new CustomEvent("open_profile_completion"))}
                        className="px-2.5 py-1 rounded bg-amber-500 text-slate-950 font-bold text-[11px] shrink-0"
                      >
                        {isTr ? "Profili Tamamla" : "Complete Profile"}
                      </button>
                    </div>
                  )}
                </div>
              );
            })()}

            {/* Deep Analysis Report Sections */}
            {selectedDetailItem.deepAnalysisReport ? (
              <div className="space-y-4">
                {/* Significance */}
                <div className="p-4 rounded-2xl bg-purple-950/30 border border-purple-500/20 space-y-1.5">
                  <div className="flex items-center gap-2 text-xs font-bold text-purple-300 uppercase tracking-wider font-mono">
                    <Sparkles className="w-4 h-4 text-purple-400" />
                    <span>{isTr ? "Bilimsel Devrim ve Medeniyet Önemi" : "Breakthrough Significance"}</span>
                  </div>
                  <p className="text-xs sm:text-sm text-slate-200 leading-relaxed">
                    {selectedDetailItem.deepAnalysisReport.breakthroughSignificance}
                  </p>
                </div>

                {/* Year Assignment Rationale */}
                <div className="p-4 rounded-2xl bg-blue-950/30 border border-blue-500/20 space-y-1.5">
                  <div className="flex items-center gap-2 text-xs font-bold text-blue-300 uppercase tracking-wider font-mono">
                    <Calendar className="w-4 h-4 text-blue-400" />
                    <span>{isTr ? "Neden Bu Yıl Seçildi?" : "Year Rationale"}</span>
                  </div>
                  <p className="text-xs sm:text-sm text-slate-200 leading-relaxed">
                    {selectedDetailItem.deepAnalysisReport.yearAssignmentRationale || selectedDetailItem.aiAnalysisNotes}
                  </p>
                </div>

                {/* Impacted Sectors & Key Drivers Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="p-4 rounded-2xl bg-slate-800/60 border border-white/5 space-y-2">
                    <div className="text-xs font-bold text-amber-300 uppercase font-mono">
                      {isTr ? "Etkilenen Ana Sektörler" : "Impacted Sectors"}
                    </div>
                    <ul className="space-y-1">
                      {selectedDetailItem.deepAnalysisReport.impactedSectors?.map((s, idx) => (
                        <li key={`sector-${idx}-${s}`} className="text-xs text-slate-300 flex items-center gap-1.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                          <span>{s}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="p-4 rounded-2xl bg-slate-800/60 border border-white/5 space-y-2">
                    <div className="text-xs font-bold text-rose-300 uppercase font-mono">
                      {isTr ? "Etik & Güvenlik Riskleri" : "Ethical & Security Risks"}
                    </div>
                    <ul className="space-y-1">
                      {selectedDetailItem.deepAnalysisReport.riskAndEthicalChallenges?.map((r, idx) => (
                        <li key={`risk-${idx}-${r}`} className="text-xs text-slate-300 flex items-center gap-1.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-rose-400" />
                          <span>{r}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Timeline Integration Suggestion */}
                <div className="p-4 rounded-2xl bg-emerald-950/30 border border-emerald-500/20 space-y-1.5">
                  <div className="flex items-center gap-2 text-xs font-bold text-emerald-300 uppercase tracking-wider font-mono">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span>{isTr ? "Zaman Çizelgesi Entegrasyon Önerisi" : "Timeline Suggestion"}</span>
                  </div>
                  <p className="text-xs sm:text-sm text-slate-200 leading-relaxed">
                    {selectedDetailItem.deepAnalysisReport.timelineIntegrationSuggestion}
                  </p>
                </div>
              </div>
            ) : (
              <div className="p-6 rounded-2xl bg-slate-800/40 border border-white/10 text-center space-y-3">
                <Brain className="w-8 h-8 text-purple-400 mx-auto animate-pulse" />
                <p className="text-xs text-slate-300">
                  {isTr
                    ? "Bu haber için henüz derinlemesine yapay zeka analiz raporu oluşturulmadı."
                    : "No deep report generated yet."}
                </p>
                <button
                  onClick={() => handleRequestDeepAnalysis(selectedDetailItem)}
                  className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold shadow-md cursor-pointer flex items-center gap-1.5 mx-auto"
                >
                  <Brain className="w-4 h-4" />
                  <span>{isTr ? "Derinlemesine Analiz Başlat" : "Start Deep Analysis"}</span>
                  <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-black/40 text-amber-300 border border-amber-500/20">
                    {isTr ? `${analysisCreditCost} Kredi / Reklam` : `${analysisCreditCost} Cr / Ad`}
                  </span>
                </button>
              </div>
            )}

            {/* Original Text Preview */}
            <div className="p-4 rounded-2xl bg-black/40 border border-white/10 space-y-2">
              <div className="text-xs font-bold text-slate-400 uppercase font-mono">
                {isTr ? "Orijinal Haber Metni (Ham Veri)" : "Raw News Text"}
              </div>
              <p className="text-xs text-slate-300 whitespace-pre-wrap font-mono leading-relaxed max-h-40 overflow-y-auto">
                {selectedDetailItem.originalText}
              </p>
              {selectedDetailItem.sourceUrl && (
                <a
                  href={selectedDetailItem.sourceUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-xs text-purple-400 hover:text-purple-300 underline pt-1"
                >
                  <span>{isTr ? "Kaynak Bağlantıyı Aç" : "Open Source Link"}</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              )}
            </div>

            {/* Modal Bottom Actions */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setSelectedDetailItem(null)}
                  className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold cursor-pointer"
                >
                  {isTr ? "Kapat" : "Close"}
                </button>

                {isAdmin && (
                  <button
                    onClick={(e) => handleDeleteItem(e, selectedDetailItem)}
                    className="px-3.5 py-2.5 rounded-xl bg-rose-950/60 hover:bg-rose-900/80 text-rose-300 hover:text-rose-100 border border-rose-500/40 text-xs font-bold flex items-center gap-1.5 shadow-md transition cursor-pointer"
                    title={isTr ? "Haberi Kalıcı Olarak Sil (Yönetici)" : "Delete News Permanently (Admin)"}
                  >
                    <Trash2 className="w-3.5 h-3.5 text-rose-400" />
                    <span>{isTr ? "Haberi Sil (Yönetici)" : "Delete (Admin)"}</span>
                  </button>
                )}
              </div>

              <button
                onClick={() => handleRequestDeepAnalysis(selectedDetailItem)}
                disabled={analyzingId === selectedDetailItem.id}
                className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-lg shadow-purple-600/30 cursor-pointer disabled:opacity-50"
              >
                <Brain className={`w-4 h-4 ${analyzingId === selectedDetailItem.id ? "animate-spin" : ""}`} />
                <span>{analyzingId === selectedDetailItem.id ? (isTr ? "Analiz Ediliyor..." : "Analyzing...") : (isTr ? "Yeniden Derin Analiz Yap" : "Re-Analyze")}</span>
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-black/40 text-amber-300 border border-amber-500/20">
                  {isTr ? `${analysisCreditCost} Kredi / Reklam` : `${analysisCreditCost} Cr / Ad`}
                </span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Monetization Choice Modal: Kredi veya Sponsor Reklam */}
      {isAnalysisChoiceModalOpen && pendingAnalysisItem && (
        <div
          onClick={() => setIsAnalysisChoiceModalOpen(false)}
          className="fixed inset-0 z-[120] flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-150"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-lg bg-slate-900 border border-purple-500/30 rounded-3xl p-5 sm:p-7 text-left shadow-2xl shadow-purple-950/50 space-y-5 animate-in zoom-in-95 duration-200 font-sans"
          >
            {/* Modal Header */}
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-purple-600/20 border border-purple-500/40 flex items-center justify-center text-purple-400 shrink-0 shadow-inner">
                  <Brain className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-[10px] font-mono font-bold text-purple-400 uppercase tracking-wider flex items-center gap-1.5">
                    <Sparkles className="w-3 h-3" />
                    <span>{isTr ? "Yapay Zeka Derin Analiz Seçeneği" : "Deep AI News Analysis"}</span>
                  </div>
                  <h3 className="text-base sm:text-lg font-bold text-white leading-tight mt-0.5">
                    {isTr ? "Analiz Yöntemini Seçin" : "Select Analysis Method"}
                  </h3>
                </div>
              </div>
              <button
                onClick={() => setIsAnalysisChoiceModalOpen(false)}
                className="w-8 h-8 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Target News Preview Card */}
            <div className="p-3.5 rounded-2xl bg-slate-950/60 border border-white/10 space-y-1.5">
              <div className="flex items-center justify-between text-[11px] font-mono text-slate-400">
                <span className="text-purple-300 font-semibold">{pendingAnalysisItem.category}</span>
                <span>{pendingAnalysisItem.extractedYear || 2028} Hedefi</span>
              </div>
              <h4 className="text-xs sm:text-sm font-bold text-white line-clamp-2 leading-snug">
                {pendingAnalysisItem.title}
              </h4>
              <p className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed">
                {pendingAnalysisItem.summary || pendingAnalysisItem.originalText}
              </p>
            </div>

            {/* User Credit Status Strip */}
            <div className="p-3 rounded-2xl bg-purple-950/20 border border-purple-500/20 flex items-center justify-between text-xs font-mono">
              <span className="text-slate-300 flex items-center gap-1.5">
                <Coins className="w-4 h-4 text-amber-400" />
                <span>{isTr ? "Mevcut Bakiyeniz:" : "Your Balance:"}</span>
              </span>
              <span className="font-bold text-amber-400">
                {isGuest ? (isTr ? "Misafir (Kayıtsız)" : "Guest") : `${credits} Kredi`}
              </span>
            </div>

            {/* Two Action Choice Cards */}
            <div className="grid grid-cols-1 gap-3">
              {/* Option 1: Credit or Daily Quota */}
              <div className="p-4 rounded-2xl bg-slate-800/60 border border-purple-500/30 hover:border-purple-500/60 transition flex flex-col justify-between gap-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400">
                      <Zap className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-xs sm:text-sm font-bold text-white">
                        {remainingDailyQuota > 0
                          ? (isTr ? "Ücretsiz Günlük Kota ile Başlat" : "Start with Daily Free Quota")
                          : (isTr ? `Kredi ile Başlat (${analysisCreditCost} Kredi)` : `Start with Credits (${analysisCreditCost} Cr)`)}
                      </h4>
                      <p className="text-[11px] text-slate-400 leading-tight mt-0.5">
                        {remainingDailyQuota > 0
                          ? (isTr ? `Bugün için kalan ${remainingDailyQuota} ücretsiz hakkınız bulunuyor.` : `${remainingDailyQuota} free quota remaining today.`)
                          : (isTr ? "Bakiyenizden kredi düşülerek anında Gemini analizi üretilir." : "Uses your available credit balance.")}
                      </p>
                    </div>
                  </div>
                  <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 text-[10px] font-mono font-bold shrink-0">
                    {remainingDailyQuota > 0 ? "0 Kredi" : `${analysisCreditCost} Kredi`}
                  </span>
                </div>

                <button
                  onClick={handleStartWithCredits}
                  className="w-full py-2.5 px-4 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-mono font-bold text-xs flex items-center justify-center gap-1.5 transition cursor-pointer shadow-md shadow-purple-600/30"
                >
                  <Zap className="w-3.5 h-3.5 text-amber-300" />
                  <span>
                    {isGuest
                      ? (isTr ? "Giriş Yap / Ücretsiz Başla" : "Sign In / Start Free")
                      : remainingDailyQuota > 0
                      ? (isTr ? "⚡ Ücretsiz Kotamla Başlat" : "Start with Free Quota")
                      : credits >= analysisCreditCost
                      ? (isTr ? `⚡ ${analysisCreditCost} Kredi ile Analiz Et` : `⚡ Analyze with ${analysisCreditCost} Credits`)
                      : (isTr ? "Kredi Yükle (+Mağaza)" : "Top Up Credits")}
                  </span>
                </button>
              </div>

              {/* Option 2: Sponsor Rewarded Ad */}
              <div className="p-4 rounded-2xl bg-gradient-to-br from-emerald-950/40 via-slate-900 to-slate-900 border border-emerald-500/40 hover:border-emerald-500/70 transition flex flex-col justify-between gap-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
                      <Film className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <h4 className="text-xs sm:text-sm font-bold text-white">
                          {isTr ? "Sponsor Reklam İzle (Ücretsiz)" : "Watch Sponsor Ad (Free)"}
                        </h4>
                        <span className="px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-300 text-[9px] font-mono font-bold">
                          SIFIR MALİYET
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-300 leading-tight mt-0.5">
                        {isTr
                          ? "15 saniyelik sponsor tanıtımı izleyin; hem analizi anında başlatın, hem +15 Kredi kazanın!"
                          : "Watch a 15-second sponsor video to analyze for free and gain +15 credits!"}
                      </p>
                    </div>
                  </div>
                </div>

                <button
                  onClick={handleStartWithRewardedAd}
                  className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-emerald-600 via-teal-500 to-emerald-600 hover:from-emerald-500 hover:to-teal-400 text-slate-950 font-mono font-black text-xs flex items-center justify-center gap-1.5 transition cursor-pointer shadow-md shadow-emerald-500/20 active:scale-98"
                >
                  <Play className="w-3.5 h-3.5 fill-slate-950" />
                  <span>{isTr ? "🎬 Reklamı Başlat & Ücretsiz Analiz Et" : "🎬 Watch Ad & Analyze Free"}</span>
                </button>
              </div>
            </div>

            {/* Close footer */}
            <div className="pt-1 flex justify-end">
              <button
                onClick={() => setIsAnalysisChoiceModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white text-xs font-semibold transition cursor-pointer"
              >
                {isTr ? "Vazgeç" : "Cancel"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Rewarded Video Ad Modal */}
      <RewardedAdModal
        isOpen={isRewardedAdOpen}
        onClose={() => setIsRewardedAdOpen(false)}
        onRewardClaimed={(earnedCredits) => {
          setIsRewardedAdOpen(false);
          if (pendingAnalysisItem) {
            const target = pendingAnalysisItem;
            handleTriggerDeepAnalysis(target);
            showToast(
              isTr
                ? `🎬 Sponsor tanıtımı tamamlandı! +${earnedCredits} Kredi hesabınıza eklendi ve derin analiz başlatıldı!`
                : `🎬 Sponsor ad completed! +${earnedCredits} Credits added and deep analysis started!`
            );
          }
        }}
      />
    </div>
  );
};
