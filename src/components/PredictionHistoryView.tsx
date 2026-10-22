import React, { useState, useEffect, useMemo } from "react";
import { createPortal } from "react-dom";
import {
  PredictionHistoryRecord,
  getPredictionHistory,
  toggleBookmarkPrediction,
  updatePredictionNote,
  votePredictionAccuracy,
  deletePredictionRecord,
  clearAllPredictionHistory,
  exportHistoryAsMarkdown,
  incrementPredictionView,
  setPendingRerunRecord,
  AccuracyFeedback,
  PredictionFeatureKey,
} from "../utils/predictionHistory";
import { PredictionHistoryService } from "../services/predictionHistoryService";
import { ThoughtProcessMapView } from "./ThoughtProcessMapView";
import { ViewMode } from "../types";
import { useAuth } from "../context/AuthContext";
import {
  History,
  Sparkles,
  Bot,
  Briefcase,
  GitFork,
  User,
  MessageSquare,
  Search,
  Filter,
  Bookmark,
  BookmarkCheck,
  Share2,
  Copy,
  Check,
  Trash2,
  Download,
  Calendar,
  Layers,
  ArrowUpRight,
  TrendingUp,
  Activity,
  Sliders,
  FileText,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Flame,
  ThumbsUp,
  HelpCircle,
  X,
  PlusCircle,
  RotateCcw,
  Maximize2,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  GitBranch,
  Compass,
  ShieldCheck,
  Lock,
  LogIn,
} from "lucide-react";
import { useLanguage } from "../context/LanguageContext";

interface PredictionHistoryViewProps {
  onNavigateToView?: (view: ViewMode, targetYear?: number) => void;
  currentUser?: any;
}

export const PredictionHistoryView: React.FC<PredictionHistoryViewProps> = ({
  onNavigateToView,
  currentUser,
}) => {
  const { language } = useLanguage();
  const isTr = language === "tr";
  const auth = useAuth();
  
  const activeUser = currentUser || auth.currentUser;
  const userEmail = activeUser?.email || null;
  const isAuthenticated = Boolean(activeUser);

  // User-scoped records state
  const [records, setRecords] = useState<PredictionHistoryRecord[]>(() => {
    return userEmail ? getPredictionHistory(userEmail) : [];
  });
  const [activeViewTab, setActiveViewTab] = useState<"thought_map" | "list">("thought_map");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedFeature, setSelectedFeature] = useState<PredictionFeatureKey | "all">("all");
  const [selectedScenario, setSelectedScenario] = useState<string>("all");
  const [selectedYearRange, setSelectedYearRange] = useState<string>("all");
  const [onlyBookmarked, setOnlyBookmarked] = useState<boolean>(false);
  const [sortBy, setSortBy] = useState<"newest" | "oldest" | "impact" | "feasibility" | "views">("newest");

  // Interaction states
  const [expandedRecordId, setExpandedRecordId] = useState<string | null>(null);
  const [modalRecord, setModalRecord] = useState<PredictionHistoryRecord | null>(null);
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
  const [noteDraft, setNoteDraft] = useState<string>("");
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Cloud Firestore Sync & User-Isolation Lifecycle
  useEffect(() => {
    if (!isAuthenticated || !userEmail) {
      setRecords([]);
      return;
    }

    // 1. Initial Fetch
    PredictionHistoryService.fetchUserPredictions(userEmail).then((fetched) => {
      if (fetched && fetched.length > 0) {
        setRecords(fetched);
      } else {
        setRecords(getPredictionHistory(userEmail));
      }
    });

    // 2. Realtime listener
    const unsubscribe = PredictionHistoryService.subscribeToUserPredictions(userEmail, (updatedRecords) => {
      setRecords(updatedRecords);
    });

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [userEmail, isAuthenticated]);

  // Synchronize on local live events
  useEffect(() => {
    const handleUpdate = () => {
      if (userEmail) {
        setRecords(getPredictionHistory(userEmail));
      } else {
        setRecords([]);
      }
    };
    window.addEventListener("future_prediction_saved", handleUpdate);
    window.addEventListener("future_prediction_updated", handleUpdate);
    return () => {
      window.removeEventListener("future_prediction_saved", handleUpdate);
      window.removeEventListener("future_prediction_updated", handleUpdate);
    };
  }, [userEmail]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Filtered and sorted records
  const filteredRecords = useMemo(() => {
    return records
      .filter((rec) => {
        // Search
        if (searchQuery.trim() !== "") {
          const q = searchQuery.toLowerCase();
          const matchTitle = rec.queryTitle.toLowerCase().includes(q);
          const matchOutcome = rec.generatedOutcome.toLowerCase().includes(q);
          const matchTags = rec.tags.some((t) => t.toLowerCase().includes(q));
          const matchNotes = (rec.userEngagement.userNotes || "").toLowerCase().includes(q);
          const matchYear = rec.targetYear.toString().includes(q);
          if (!matchTitle && !matchOutcome && !matchTags && !matchNotes && !matchYear) {
            return false;
          }
        }

        // Feature filter
        if (selectedFeature !== "all" && rec.featureKey !== selectedFeature) {
          return false;
        }

        // Scenario filter
        if (selectedScenario !== "all" && rec.scenarioMode !== selectedScenario) {
          return false;
        }

        // Year range filter
        if (selectedYearRange !== "all") {
          if (selectedYearRange === "2026-2030" && (rec.targetYear < 2026 || rec.targetYear > 2030)) return false;
          if (selectedYearRange === "2031-2040" && (rec.targetYear < 2031 || rec.targetYear > 2040)) return false;
          if (selectedYearRange === "2041-2060" && rec.targetYear < 2041) return false;
        }

        // Bookmarked only
        if (onlyBookmarked && !rec.userEngagement.isBookmarked) {
          return false;
        }

        return true;
      })
      .sort((a, b) => {
        if (sortBy === "newest") return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
        if (sortBy === "oldest") return new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime();
        if (sortBy === "impact") return b.metrics.impactLevel - a.metrics.impactLevel;
        if (sortBy === "feasibility") return b.metrics.feasibilityScore - a.metrics.feasibilityScore;
        if (sortBy === "views") return (b.userEngagement.viewCount || 0) - (a.userEngagement.viewCount || 0);
        return 0;
      });
  }, [records, searchQuery, selectedFeature, selectedScenario, selectedYearRange, onlyBookmarked, sortBy]);

  // Aggregate Engagement Statistics
  const stats = useMemo(() => {
    const totalRuns = records.length;
    const totalTokens = records.reduce((acc, r) => acc + (r.metrics.tokensEstimated || 350), 0);
    const bookmarkedCount = records.filter((r) => r.userEngagement.isBookmarked).length;

    // Most explored year
    const yearCounts: Record<number, number> = {};
    records.forEach((r) => {
      yearCounts[r.targetYear] = (yearCounts[r.targetYear] || 0) + 1;
    });
    let topYear = 2035;
    let maxYearCount = 0;
    Object.entries(yearCounts).forEach(([yr, count]) => {
      if (count > maxYearCount) {
        maxYearCount = count;
        topYear = Number(yr);
      }
    });

    // Top Category
    const catCounts: Record<string, number> = {};
    records.forEach((r) => {
      catCounts[r.category] = (catCounts[r.category] || 0) + 1;
    });
    let topCat = "Yapay Zeka & Bilişim";
    let maxCatCount = 0;
    Object.entries(catCounts).forEach(([cat, count]) => {
      if (count > maxCatCount) {
        maxCatCount = count;
        topCat = cat;
      }
    });

    // Average Feasibility
    const avgFeasibility = totalRuns > 0
      ? Math.round(records.reduce((acc, r) => acc + r.metrics.feasibilityScore, 0) / totalRuns)
      : 85;

    // Scenarios breakdown
    const optimisticCount = records.filter((r) => r.scenarioMode === "optimistic").length;
    const baselineCount = records.filter((r) => r.scenarioMode === "baseline").length;
    const dystopianCount = records.filter((r) => r.scenarioMode === "dystopian").length;

    return {
      totalRuns,
      totalTokens,
      bookmarkedCount,
      topYear,
      topCat,
      avgFeasibility,
      optimisticCount,
      baselineCount,
      dystopianCount,
    };
  }, [records]);

  // Handlers
  const handleToggleBookmark = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const next = toggleBookmarkPrediction(id, userEmail);
    if (userEmail) setRecords(getPredictionHistory(userEmail));
    showToast(next ? (isTr ? "⭐ Tahmin favorilere eklendi" : "Bookmarked!") : (isTr ? "Favorilerden kaldırıldı" : "Removed from bookmarks"));
  };

  const handleCopyOutcome = (record: PredictionHistoryRecord, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const textToCopy = `🔮 [${record.targetYear} - ${record.featureName}]\n${record.queryTitle}\n\nSonuç:\n${record.generatedOutcome}\n\n— 2026-2060 Teknolojik Evrim Çizelgesi`;
    navigator.clipboard.writeText(textToCopy);
    setCopiedId(record.id);
    setTimeout(() => setCopiedId(null), 2500);
    showToast(isTr ? "📋 Simülasyon çıktısı kopyalandı" : "Copied to clipboard!");
  };

  const handleVoteAccuracy = (id: string, vote: AccuracyFeedback, e: React.MouseEvent) => {
    e.stopPropagation();
    votePredictionAccuracy(id, vote, userEmail);
    if (userEmail) setRecords(getPredictionHistory(userEmail));
    showToast(isTr ? "🗳️ Değerlendirmeniz kaydedildi" : "Rating saved!");
  };

  const handleSaveNote = (id: string) => {
    updatePredictionNote(id, noteDraft, userEmail);
    if (userEmail) setRecords(getPredictionHistory(userEmail));
    setEditingNoteId(null);
    showToast(isTr ? "📝 Notunuz güncellendi" : "Note updated!");
  };

  const handleDeleteRecord = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm(isTr ? "Bu simülasyon kaydını geçmişten silmek istediğinize emin misiniz?" : "Are you sure you want to delete this prediction record?")) {
      deletePredictionRecord(id, userEmail);
      if (userEmail) setRecords(getPredictionHistory(userEmail));
      if (modalRecord?.id === id) setModalRecord(null);
      showToast(isTr ? "🗑️ Kayıt silindi" : "Record deleted");
    }
  };

  const handleClearAll = () => {
    if (window.confirm(isTr ? "TÜM simülasyon ve sorgu geçmişinizi temizlemek istediğinize emin misiniz?" : "Clear ALL prediction history?")) {
      clearAllPredictionHistory(userEmail);
      setRecords([]);
      setModalRecord(null);
      showToast(isTr ? "🧹 Tüm geçmiş temizlendi" : "History cleared");
    }
  };

  const handleExportMarkdown = () => {
    const md = exportHistoryAsMarkdown(filteredRecords);
    const blob = new Blob([md], { type: "text/markdown;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `Gelecek-Simulasyon-Gecmisi-${new Date().toISOString().slice(0, 10)}.md`;
    a.click();
    URL.revokeObjectURL(url);
    showToast(isTr ? "📥 Markdown raporu indirildi" : "Markdown downloaded!");
  };

  const handleExportJSON = () => {
    const dataStr = JSON.stringify(filteredRecords, null, 2);
    const blob = new Blob([dataStr], { type: "application/json;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `simulation-history-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
    showToast(isTr ? "📥 JSON verisi indirildi" : "JSON downloaded!");
  };

  const handleRerun = (record: PredictionHistoryRecord) => {
    if (!onNavigateToView) return;

    // Stage pending rerun record for immediate seamless loading & auto-fill
    setPendingRerunRecord(record);

    if (record.featureKey === "job_risk") {
      onNavigateToView("job_risk", record.targetYear);
    } else if (record.featureKey === "butterfly_effect") {
      onNavigateToView("butterfly", record.targetYear);
    } else if (record.featureKey === "persona_chat") {
      onNavigateToView("persona_chat");
    } else if (record.featureKey === "personal_roadmap") {
      onNavigateToView("roadmap", record.targetYear);
    } else if (record.featureKey === "ai_simulation") {
      onNavigateToView("timeline", record.targetYear);
    } else if (record.featureKey === "futurist_advisor") {
      onNavigateToView("futurist_advisor", record.targetYear);
    } else {
      onNavigateToView("timeline", record.targetYear);
    }
  };

  const openDetailModal = (record: PredictionHistoryRecord) => {
    incrementPredictionView(record.id, userEmail);
    setModalRecord(record);
  };

  const getFeatureIcon = (key: PredictionFeatureKey) => {
    switch (key) {
      case "ai_simulation":
        return <Bot className="w-4 h-4 text-amber-400" />;
      case "job_risk":
        return <Briefcase className="w-4 h-4 text-rose-400" />;
      case "butterfly_effect":
        return <GitFork className="w-4 h-4 text-purple-400" />;
      case "persona_chat":
        return <MessageSquare className="w-4 h-4 text-cyan-400" />;
      case "personal_roadmap":
        return <User className="w-4 h-4 text-teal-400" />;
      case "futurist_advisor":
        return <Sparkles className="w-4 h-4 text-indigo-400" />;
      default:
        return <History className="w-4 h-4 text-blue-400" />;
    }
  };

  const getScenarioBadgeClass = (mode: string) => {
    if (mode === "optimistic") return "bg-emerald-500/10 border-emerald-500/30 text-emerald-400";
    if (mode === "dystopian") return "bg-rose-500/10 border-rose-500/30 text-rose-400";
    return "bg-cyan-500/10 border-cyan-500/30 text-cyan-400";
  };

  // ─────────────────────────────────────────────────────────────────────────────
  // 1. UN-AUTHENTICATED / LOGGED-OUT GUEST PRIVACY VIEW
  // ─────────────────────────────────────────────────────────────────────────────
  if (!isAuthenticated) {
    return (
      <div className="w-full max-w-4xl mx-auto px-4 py-16 text-center space-y-8 animate-fadeIn">
        <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-cyan-500/20 to-blue-600/20 border border-cyan-500/40 text-cyan-400 mx-auto flex items-center justify-center shadow-xl shadow-cyan-500/10">
          <Lock className="w-10 h-10" />
        </div>

        <div className="space-y-3">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-xs font-mono font-bold tracking-wider">
            <ShieldCheck className="w-4 h-4 text-cyan-400" />
            <span>{isTr ? "KİŞİYE ÖZEL & GİZLİ SİMÜLASYON HAFIZASI" : "USER-ISOLATED SIMULATION DOSSIER"}</span>
          </div>

          <h2 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
            {isTr ? "Simülasyon Geçmişi Hesabınıza Özeldir" : "Simulation History Is Strictly User-Specific"}
          </h2>

          <p className="text-xs sm:text-sm text-slate-400 max-w-xl mx-auto leading-relaxed">
            {isTr
              ? "Yapay zeka modelleriyle yürüttüğünüz tüm gelecek simülasyonları, meslek risk analizleri, kelebek etkisi zaman kırılmaları ve bilişsel düşünce haritaları sadece sizin hesabınız altında güvenle saklanır. Hesaptan çıkış yapıldığında veriler gizlenir."
              : "All your AI future simulations, career impact matrices, butterfly effect timeline branches, and cognitive thought maps are securely isolated per user account. Logging out keeps your data private."}
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <button
            onClick={() => auth.openAuthModal()}
            className="w-full sm:w-auto px-6 py-3.5 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold text-sm font-mono shadow-xl shadow-cyan-500/25 transition-all cursor-pointer flex items-center justify-center gap-2"
          >
            <LogIn className="w-4 h-4" />
            <span>{isTr ? "Giriş Yap / Ücretsiz Kayıt Ol" : "Sign In / Register"}</span>
          </button>

          {onNavigateToView && (
            <button
              onClick={() => onNavigateToView("timeline")}
              className="w-full sm:w-auto px-6 py-3.5 rounded-2xl bg-slate-900 hover:bg-slate-800 border border-white/10 text-slate-300 font-bold text-sm font-mono transition-all cursor-pointer"
            >
              {isTr ? "Zaman Çizelgesine Dön" : "Explore Timeline"}
            </button>
          )}
        </div>

        {/* Feature Cards Showcase */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-6 text-left">
          <div className="p-4 rounded-2xl bg-slate-900/60 border border-white/5 space-y-1.5">
            <div className="flex items-center gap-2 text-cyan-400 font-mono text-xs font-bold">
              <Bot className="w-4 h-4" />
              <span>{isTr ? "AI Simülasyonları" : "AI Simulations"}</span>
            </div>
            <p className="text-slate-400 text-xs leading-relaxed">
              {isTr ? "Çalıştırdığınız senaryolar ve model yanıtları otomatik arşivlenir." : "Every generated future forecast is automatically archived."}
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-900/60 border border-white/5 space-y-1.5">
            <div className="flex items-center gap-2 text-purple-400 font-mono text-xs font-bold">
              <Compass className="w-4 h-4" />
              <span>{isTr ? "Bilişsel Keşif Haritası" : "Cognitive Map"}</span>
            </div>
            <p className="text-slate-400 text-xs leading-relaxed">
              {isTr ? "Sorgularınız arasındaki nedensellik ilişkilerini grafiksel ağda inceleyin." : "Explore causal links between your simulation queries in an interactive graph."}
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-900/60 border border-white/5 space-y-1.5">
            <div className="flex items-center gap-2 text-amber-400 font-mono text-xs font-bold">
              <BookmarkCheck className="w-4 h-4" />
              <span>{isTr ? "Kişisel Notlar & Raporlar" : "Notes & Export"}</span>
            </div>
            <p className="text-slate-400 text-xs leading-relaxed">
              {isTr ? "Tahminlere not ekleyin, Markdown veya JSON formatında indirin." : "Annotate predictions and export formatted dossiers in Markdown or JSON."}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-7xl mx-auto px-3 sm:px-6 py-6 sm:py-10 space-y-8 animate-fadeIn">
      
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 px-4 py-3 rounded-2xl bg-slate-900 border border-cyan-500/40 text-cyan-200 text-xs font-mono shadow-2xl flex items-center gap-2 animate-slideUp">
          <Sparkles className="w-4 h-4 text-cyan-400 animate-spin" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* HEADER TITLE & ACTIONS */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-white/10">
        <div className="space-y-1.5">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-xs font-mono font-bold tracking-wider">
            <History className="w-3.5 h-3.5 animate-pulse" />
            <span>{isTr ? `KİŞİSEL SİMÜLASYON HAFIZASI: ${userEmail}` : `SIMULATION DOSSIER: ${userEmail}`}</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight flex items-center gap-3">
            <span>{isTr ? "Tahmin & Simülasyon Geçmişim" : "My Prediction History"}</span>
            <span className="text-xs px-2.5 py-1 rounded-lg bg-slate-800 text-slate-400 font-mono font-bold">
              {filteredRecords.length} / {records.length} {isTr ? "Kayıt" : "Records"}
            </span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 max-w-2xl">
            {isTr
              ? "Geçmişte yürüttüğünüz yapay zeka simülasyonlarını, meslek analizlerini, alternatif zaman akışlarını ve sistem çıktılarını tek merkezden izleyin; kişisel notlar ekleyip sonuçları dışa aktarın."
              : "Track all your historical AI simulations, career automations, butterfly effect timelines, and system outcomes over time with rich analytics."}
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={handleExportMarkdown}
            disabled={records.length === 0}
            className={`px-3.5 py-2 rounded-xl border text-xs font-mono font-bold transition-all flex items-center gap-1.5 ${
              records.length === 0
                ? "bg-slate-950 border-white/5 text-slate-600 cursor-not-allowed"
                : "bg-slate-900 hover:bg-slate-800 border-white/10 hover:border-cyan-500/40 text-slate-200 cursor-pointer"
            }`}
            title="Markdown (.md) formatında indir"
          >
            <Download className="w-3.5 h-3.5 text-cyan-400" />
            <span>Markdown Raporu</span>
          </button>

          <button
            onClick={handleExportJSON}
            disabled={records.length === 0}
            className={`px-3.5 py-2 rounded-xl border text-xs font-mono font-bold transition-all flex items-center gap-1.5 ${
              records.length === 0
                ? "bg-slate-950 border-white/5 text-slate-600 cursor-not-allowed"
                : "bg-slate-900 hover:bg-slate-800 border-white/10 hover:border-amber-500/40 text-slate-200 cursor-pointer"
            }`}
            title="JSON verisi olarak indir"
          >
            <FileText className="w-3.5 h-3.5 text-amber-400" />
            <span>JSON İndir</span>
          </button>

          {records.length > 0 && (
            <button
              onClick={handleClearAll}
              className="px-3 py-2 rounded-xl bg-rose-950/40 hover:bg-rose-900/60 border border-rose-500/30 text-rose-300 text-xs font-mono font-bold transition-all flex items-center gap-1.5 cursor-pointer"
              title="Tüm geçmişi temizle"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Temizle</span>
            </button>
          )}
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────────────────────
          2. EMPTY STATE WHEN LOGGED IN BUT NO SIMULATIONS RECORDED YET
         ───────────────────────────────────────────────────────────────────────────── */}
      {records.length === 0 ? (
        <div className="p-8 sm:p-12 rounded-3xl bg-slate-900/60 border border-white/10 text-center space-y-6 animate-fadeIn">
          <div className="w-16 h-16 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 mx-auto flex items-center justify-center">
            <Sparkles className="w-8 h-8 animate-pulse" />
          </div>

          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-xs font-mono font-bold">
              <span>{isTr ? "✨ SİMÜLASYON HAFIZANIZ HENÜZ BOŞ" : "✨ NO SIMULATIONS YET"}</span>
            </div>
            <h3 className="text-xl sm:text-2xl font-bold text-white">
              {isTr ? "İlk Gelecek Projeksiyonunuzu Oluşturun" : "Start Your First Future Projection"}
            </h3>
            <p className="text-xs sm:text-sm text-slate-400 max-w-lg mx-auto leading-relaxed">
              {isTr
                ? "Henüz kaydedilmiş bir simülasyonunuz bulunmuyor. Aşağıdaki yapay zeka araçlarını kullanarak ilk tahmininizi çalıştırın; sonuçlar, istatistikler ve bilişsel düşünce haritanız burada otomatik olarak modellenecektir."
                : "You haven't run any AI simulations yet. Choose a tool below to run your first projection; your outcomes and causal network will be automatically mapped here."}
            </p>
          </div>

          {onNavigateToView && (
            <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
              <button
                onClick={() => onNavigateToView("persona_chat")}
                className="px-4 py-2.5 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-500/40 text-cyan-300 text-xs font-mono font-bold transition-all flex items-center gap-2 cursor-pointer shadow-lg shadow-cyan-500/10"
              >
                <Bot className="w-4 h-4 text-cyan-400" />
                <span>Zaman Yolcusu Sohbeti</span>
              </button>

              <button
                onClick={() => onNavigateToView("job_risk")}
                className="px-4 py-2.5 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 border border-rose-500/40 text-rose-300 text-xs font-mono font-bold transition-all flex items-center gap-2 cursor-pointer shadow-lg shadow-rose-500/10"
              >
                <Briefcase className="w-4 h-4 text-rose-400" />
                <span>Meslek Risk Analizi</span>
              </button>

              <button
                onClick={() => onNavigateToView("butterfly")}
                className="px-4 py-2.5 rounded-xl bg-purple-500/20 hover:bg-purple-500/30 border border-purple-500/40 text-purple-300 text-xs font-mono font-bold transition-all flex items-center gap-2 cursor-pointer shadow-lg shadow-purple-500/10"
              >
                <GitFork className="w-4 h-4 text-purple-400" />
                <span>Kelebek Etkisi</span>
              </button>

              <button
                onClick={() => onNavigateToView("roadmap")}
                className="px-4 py-2.5 rounded-xl bg-teal-500/20 hover:bg-teal-500/30 border border-teal-500/40 text-teal-300 text-xs font-mono font-bold transition-all flex items-center gap-2 cursor-pointer shadow-lg shadow-teal-500/10"
              >
                <User className="w-4 h-4 text-teal-400" />
                <span>Kişisel Yol Haritası</span>
              </button>
            </div>
          )}
        </div>
      ) : (
        <>
          {/* ================= 1. ENGAGEMENT ANALYTICS STRIP ================= */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            
            <div className="p-4 rounded-2xl bg-gradient-to-br from-slate-900 to-slate-950 border border-white/10 space-y-1">
              <div className="flex items-center justify-between text-slate-400 text-xs font-mono">
                <span>{isTr ? "Toplam Sorgu" : "Total Queries"}</span>
                <Activity className="w-3.5 h-3.5 text-cyan-400" />
              </div>
              <div className="text-2xl font-black text-white font-mono">{stats.totalRuns}</div>
              <div className="text-[10px] text-cyan-400/80 font-mono">⚡ {isTr ? "Çalıştırılan Sim" : "Executed Sims"}</div>
            </div>

            <div className="p-4 rounded-2xl bg-gradient-to-br from-slate-900 to-slate-950 border border-white/10 space-y-1">
              <div className="flex items-center justify-between text-slate-400 text-xs font-mono">
                <span>{isTr ? "Hesaplanan Token" : "Computed Tokens"}</span>
                <TrendingUp className="w-3.5 h-3.5 text-amber-400" />
              </div>
              <div className="text-2xl font-black text-amber-400 font-mono">
                {(stats.totalTokens / 1000).toFixed(1)}k
              </div>
              <div className="text-[10px] text-slate-400 font-mono">🧠 AI Nöral İşlem</div>
            </div>

            <div className="p-4 rounded-2xl bg-gradient-to-br from-slate-900 to-slate-950 border border-white/10 space-y-1">
              <div className="flex items-center justify-between text-slate-400 text-xs font-mono">
                <span>{isTr ? "Odak Yılı" : "Focus Horizon"}</span>
                <Calendar className="w-3.5 h-3.5 text-purple-400" />
              </div>
              <div className="text-2xl font-black text-purple-300 font-mono">{stats.topYear}</div>
              <div className="text-[10px] text-purple-400/80 font-mono">{isTr ? "En Çok Taranan" : "Most Explored"}</div>
            </div>

            <div className="p-4 rounded-2xl bg-gradient-to-br from-slate-900 to-slate-950 border border-white/10 space-y-1">
              <div className="flex items-center justify-between text-slate-400 text-xs font-mono">
                <span>{isTr ? "Ort. Fizibilite" : "Avg Feasibility"}</span>
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              </div>
              <div className="text-2xl font-black text-emerald-400 font-mono">%{stats.avgFeasibility}</div>
              <div className="text-[10px] text-emerald-400/80 font-mono">{isTr ? "Model Olasılık Skoru" : "Probability Score"}</div>
            </div>

            <div className="p-4 rounded-2xl bg-gradient-to-br from-slate-900 to-slate-950 border border-white/10 space-y-1">
              <div className="flex items-center justify-between text-slate-400 text-xs font-mono">
                <span>{isTr ? "Yıldızlı / Notlu" : "Starred"}</span>
                <BookmarkCheck className="w-3.5 h-3.5 text-yellow-400" />
              </div>
              <div className="text-2xl font-black text-yellow-300 font-mono">{stats.bookmarkedCount}</div>
              <div className="text-[10px] text-yellow-400/80 font-mono">{isTr ? "Kişisel Arşiv" : "Archived"}</div>
            </div>

            <div className="p-4 rounded-2xl bg-gradient-to-br from-slate-900 to-slate-950 border border-white/10 space-y-1">
              <div className="flex items-center justify-between text-slate-400 text-xs font-mono">
                <span>{isTr ? "Senaryo Dengesi" : "Scenario Bias"}</span>
                <Sliders className="w-3.5 h-3.5 text-cyan-400" />
              </div>
              <div className="flex items-center gap-1 pt-1">
                <span className="text-[11px] font-bold text-emerald-400">+{stats.optimisticCount}</span>
                <span className="text-slate-600">/</span>
                <span className="text-[11px] font-bold text-cyan-300">{stats.baselineCount}</span>
                <span className="text-slate-600">/</span>
                <span className="text-[11px] font-bold text-rose-400">-{stats.dystopianCount}</span>
              </div>
              <div className="text-[9px] text-slate-400 font-mono">Ütopik / Baz / Distopik</div>
            </div>

          </div>

          {/* ================= PRIMARY DOSSIER VIEW TABS ================= */}
          <div className="flex items-center justify-between gap-4 border-b border-white/10 pb-4 flex-wrap">
            <div className="flex items-center gap-2 p-1.5 rounded-2xl bg-slate-900/90 border border-white/10">
              
              <button
                onClick={() => setActiveViewTab("thought_map")}
                className={`px-4 py-2.5 rounded-xl font-mono text-xs sm:text-sm font-bold transition-all flex items-center gap-2 cursor-pointer ${
                  activeViewTab === "thought_map"
                    ? "bg-gradient-to-r from-cyan-500 to-blue-600 text-slate-950 shadow-lg shadow-cyan-500/20"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                <Compass className="w-4 h-4" />
                <span>{isTr ? "Bilişsel Keşif & Etki Haritası" : "Thought-Process Map"}</span>
                <span className="px-1.5 py-0.5 rounded-md bg-cyan-950 text-cyan-300 text-[10px] border border-cyan-400/40">
                  {isTr ? "GÖRSEL AĞ" : "GRAPH"}
                </span>
              </button>

              <button
                onClick={() => setActiveViewTab("list")}
                className={`px-4 py-2.5 rounded-xl font-mono text-xs sm:text-sm font-bold transition-all flex items-center gap-2 cursor-pointer ${
                  activeViewTab === "list"
                    ? "bg-gradient-to-r from-purple-500 to-indigo-600 text-white shadow-lg shadow-purple-500/20"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                <Layers className="w-4 h-4" />
                <span>{isTr ? "Kayıt Listesi & Dosyalar" : "Simulation Dossier"}</span>
                <span className="px-1.5 py-0.5 rounded-md bg-slate-950 text-slate-300 text-[10px] border border-white/10">
                  {filteredRecords.length}
                </span>
              </button>

            </div>

            <div className="text-xs font-mono text-slate-400 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>{isTr ? "Kişisel Bulut Senkronizasyonu Aktif" : "Cloud Sync Active"}</span>
            </div>
          </div>

          {/* ================= THOUGHT PROCESS INFLUENCE MAP TAB ================= */}
          {activeViewTab === "thought_map" && (
            <ThoughtProcessMapView
              records={records}
              onSelectRecord={openDetailModal}
              onRerunRecord={handleRerun}
            />
          )}

          {/* ================= RECORD LIST & SEARCH TAB ================= */}
          {activeViewTab === "list" && (
            <>
              {/* ================= 2. SEARCH & FILTER CONTROLS ================= */}
              <div className="p-4 rounded-2xl bg-slate-900/80 border border-white/10 space-y-4">
            
            {/* Top Search Line */}
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={isTr ? "Tahmin başlığı, prompt, anahtar kelime veya not ara..." : "Search query title, prompt, keyword or personal notes..."}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-950 border border-white/10 text-white placeholder-slate-500 text-xs sm:text-sm focus:outline-none focus:border-cyan-500 transition-all"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery("")}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>

              {/* Reset button */}
              {(searchQuery || selectedFeature !== "all" || selectedScenario !== "all" || selectedYearRange !== "all" || onlyBookmarked) && (
                <button
                  onClick={() => {
                    setSearchQuery("");
                    setSelectedFeature("all");
                    setSelectedScenario("all");
                    setSelectedYearRange("all");
                    setOnlyBookmarked(false);
                  }}
                  className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-mono font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Sıfırla</span>
                </button>
              )}
            </div>

            {/* Filter Pills */}
            <div className="flex items-center gap-2 flex-wrap text-xs font-mono">
              
              {/* Feature Filter */}
              <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-white/5 flex-wrap">
                <span className="text-slate-500 px-2 py-1 flex items-center gap-1">
                  <Filter className="w-3 h-3" />
                  <span className="hidden sm:inline">Modül:</span>
                </span>
                {[
                  { key: "all", label: "Tümü" },
                  { key: "ai_simulation", label: "AI Simülatör" },
                  { key: "job_risk", label: "Meslek Riski" },
                  { key: "butterfly_effect", label: "Kelebek Etkisi" },
                  { key: "personal_roadmap", label: "Yol Haritası" },
                  { key: "persona_chat", label: "Persona Chat" },
                ].map((f, fIdx) => (
                  <button
                    key={`feat-filter-${f.key}-${fIdx}`}
                    onClick={() => setSelectedFeature(f.key as any)}
                    className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                      selectedFeature === f.key
                        ? "bg-cyan-500 text-slate-950 font-bold"
                        : "text-slate-400 hover:text-white"
                    }`}
                  >
                    {f.label}
                  </button>
                ))}
              </div>

              {/* Scenario Mode Filter */}
              <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-white/5 flex-wrap">
                <span className="text-slate-500 px-2 py-1">Senaryo:</span>
                {[
                  { key: "all", label: "Tümü" },
                  { key: "baseline", label: "Baz" },
                  { key: "optimistic", label: "Ütopik" },
                  { key: "dystopian", label: "Distopik" },
                ].map((s, sIdx) => (
                  <button
                    key={`scen-filter-${s.key}-${sIdx}`}
                    onClick={() => setSelectedScenario(s.key)}
                    className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                      selectedScenario === s.key
                        ? "bg-purple-500 text-white font-bold"
                        : "text-slate-400 hover:text-white"
                    }`}
                  >
                    {s.label}
                  </button>
                ))}
              </div>

              {/* Year Range Filter */}
              <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-white/5">
                <span className="text-slate-500 px-2 py-1">Ufuk:</span>
                {[
                  { key: "all", label: "Tümü" },
                  { key: "2026-2030", label: "2026-30" },
                  { key: "2031-2040", label: "2031-40" },
                  { key: "2041-2060", label: "2041-60" },
                ].map((y, yIdx) => (
                  <button
                    key={`year-filter-${y.key}-${yIdx}`}
                    onClick={() => setSelectedYearRange(y.key)}
                    className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                      selectedYearRange === y.key
                        ? "bg-amber-500 text-slate-950 font-bold"
                        : "text-slate-400 hover:text-white"
                    }`}
                  >
                    {y.label}
                  </button>
                ))}
              </div>

              {/* Bookmark Toggle Filter */}
              <button
                onClick={() => setOnlyBookmarked(!onlyBookmarked)}
                className={`px-3 py-1.5 rounded-xl border transition-all flex items-center gap-1.5 cursor-pointer ml-auto ${
                  onlyBookmarked
                    ? "bg-amber-500/20 border-amber-500 text-amber-300 font-bold"
                    : "bg-slate-950 border-white/10 text-slate-400 hover:text-white"
                }`}
              >
                <Bookmark className="w-3.5 h-3.5" />
                <span>Yıldızlı ({stats.bookmarkedCount})</span>
              </button>

            </div>
          </div>

          {/* ================= 3. RECORD DOSSIER LIST ================= */}
          {filteredRecords.length === 0 ? (
            <div className="p-8 rounded-2xl bg-slate-900/60 border border-white/10 text-center space-y-4">
              <div className="w-12 h-12 rounded-xl bg-slate-800 text-slate-400 mx-auto flex items-center justify-center">
                <History className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <h3 className="text-base sm:text-lg font-bold text-white">
                  {isTr ? "Filtrelerle Eşleşen Kayıt Bulunamadı" : "No Simulation Records Found"}
                </h3>
                <p className="text-xs text-slate-400 max-w-md mx-auto">
                  {isTr
                    ? "Seçtiğiniz filtreleme kriterlerine uygun geçmiş kaydı bulunamadı."
                    : "No prediction history matching the active search/filter criteria."}
                </p>
              </div>
              <button
                onClick={() => {
                  setSearchQuery("");
                  setSelectedFeature("all");
                  setSelectedScenario("all");
                  setSelectedYearRange("all");
                  setOnlyBookmarked(false);
                }}
                className="px-4 py-2 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 text-xs font-mono font-bold transition-all cursor-pointer"
              >
                {isTr ? "Filtreleri Sıfırla" : "Reset Filters"}
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredRecords.map((record, rIdx) => {
                const isExpanded = expandedRecordId === record.id;
                const isCopied = copiedId === record.id;
                const isEditingNote = editingNoteId === record.id;

                return (
                  <div
                    key={record.id ? `${record.id}-${rIdx}` : `pred-rec-${rIdx}`}
                    onClick={() => openDetailModal(record)}
                    className={`group rounded-2xl border transition-all cursor-pointer ${
                      record.userEngagement.isBookmarked
                        ? "bg-slate-900/90 border-amber-500/40 shadow-lg shadow-amber-500/5 hover:border-amber-400"
                        : "bg-slate-900/70 border-white/10 hover:border-cyan-500/40 hover:bg-slate-900"
                    } p-5 space-y-4`}
                  >
                    {/* CARD HEADER */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      
                      {/* Left Badges */}
                      <div className="flex items-center gap-2 flex-wrap">
                        <div className="px-2.5 py-1 rounded-lg bg-slate-950 border border-white/10 flex items-center gap-1.5 text-xs font-mono text-white">
                          {getFeatureIcon(record.featureKey)}
                          <span className="font-bold">{record.featureName}</span>
                        </div>

                        <span className="px-2 py-0.5 rounded-md bg-purple-500/20 border border-purple-500/40 text-purple-300 text-xs font-mono font-bold">
                          {record.targetYear}
                        </span>

                        <span className={`px-2 py-0.5 rounded-md border text-[11px] font-mono font-bold uppercase ${getScenarioBadgeClass(record.scenarioMode)}`}>
                          {record.scenarioMode}
                        </span>

                        <span className="text-[11px] text-slate-500 font-mono hidden md:inline">
                          {record.category}
                        </span>
                      </div>

                      {/* Right Meta & Star */}
                      <div className="flex items-center gap-2 self-end sm:self-auto text-xs font-mono text-slate-400">
                        <span className="text-[11px] text-slate-500">
                          {new Date(record.timestamp).toLocaleDateString("tr-TR")} {new Date(record.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                        </span>

                        <button
                          onClick={(e) => handleToggleBookmark(record.id, e)}
                          className={`p-1.5 rounded-lg transition-all cursor-pointer ${
                            record.userEngagement.isBookmarked
                              ? "bg-amber-500 text-slate-950"
                              : "bg-slate-800 text-slate-400 hover:text-amber-400"
                          }`}
                          title={record.userEngagement.isBookmarked ? "Favorilerden Çıkar" : "Favorilere Ekle"}
                        >
                          <Bookmark className="w-4 h-4 fill-current" />
                        </button>
                      </div>
                    </div>

                    {/* QUERY TITLE */}
                    <div>
                      <h3 className="text-base sm:text-lg font-bold text-white group-hover:text-cyan-300 transition-colors">
                        {record.queryTitle}
                      </h3>
                      {record.queryInput.prompt && record.queryInput.prompt !== record.queryTitle && (
                        <p className="text-xs text-slate-400 font-sans italic mt-1 line-clamp-1">
                          "{record.queryInput.prompt}"
                        </p>
                      )}
                    </div>

                    {/* GENERATED OUTCOME PREVIEW / EXPANDED */}
                    <div className="p-3.5 rounded-xl bg-slate-950/80 border border-white/5 text-xs sm:text-sm text-slate-300 leading-relaxed font-sans space-y-2">
                      <div className="flex items-center justify-between text-[11px] font-mono text-cyan-400/90 pb-1 border-b border-white/5">
                        <span className="flex items-center gap-1">
                          <Sparkles className="w-3 h-3 text-cyan-400" />
                          <span>Sistem Yapay Zeka Çıktısı:</span>
                        </span>
                        <span className="text-slate-500 font-mono text-[10px]">
                          {record.metrics.wordCount || 100} kelime • ~{record.metrics.tokensEstimated || 300} token
                        </span>
                      </div>

                      <div className={`whitespace-pre-line ${!isExpanded ? "line-clamp-3" : ""}`}>
                        {record.generatedOutcome}
                      </div>

                      {record.generatedOutcome.length > 200 && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setExpandedRecordId(isExpanded ? null : record.id);
                          }}
                          className="text-xs font-mono text-cyan-400 hover:text-cyan-300 pt-1 flex items-center gap-1 cursor-pointer"
                        >
                          {isExpanded ? (
                            <>
                              <ChevronUp className="w-3.5 h-3.5" />
                              <span>Daha Az Göster</span>
                            </>
                          ) : (
                            <>
                              <ChevronDown className="w-3.5 h-3.5" />
                              <span>Tam Metni Genişlet</span>
                            </>
                          )}
                        </button>
                      )}
                    </div>

                    {/* USER PERSONAL NOTE SECTION */}
                    {record.userEngagement.userNotes && !isEditingNote && (
                      <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-200 flex items-start justify-between gap-2">
                        <div className="flex items-start gap-2">
                          <span className="font-bold text-amber-400 shrink-0 font-mono">📝 Not:</span>
                          <span className="font-sans italic">{record.userEngagement.userNotes}</span>
                        </div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setNoteDraft(record.userEngagement.userNotes || "");
                            setEditingNoteId(record.id);
                          }}
                          className="text-[10px] text-amber-400 hover:underline font-mono shrink-0 cursor-pointer"
                        >
                          Düzenle
                        </button>
                      </div>
                    )}

                    {isEditingNote && (
                      <div
                        onClick={(e) => e.stopPropagation()}
                        className="p-3 rounded-xl bg-slate-950 border border-amber-500/40 space-y-2"
                      >
                        <div className="text-[11px] font-mono text-amber-400 font-bold">Kişisel Notunuzu Yazın:</div>
                        <textarea
                          value={noteDraft}
                          onChange={(e) => setNoteDraft(e.target.value)}
                          rows={2}
                          className="w-full p-2 rounded-lg bg-slate-900 border border-white/10 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
                          placeholder="Bu simülasyonla ilgili stratejik notunuz..."
                        />
                        <div className="flex items-center justify-end gap-2 text-xs font-mono">
                          <button
                            onClick={() => setEditingNoteId(null)}
                            className="px-2.5 py-1 rounded-md text-slate-400 hover:text-white"
                          >
                            İptal
                          </button>
                          <button
                            onClick={() => handleSaveNote(record.id)}
                            className="px-3 py-1 rounded-md bg-amber-500 text-slate-950 font-bold"
                          >
                            Kaydet
                          </button>
                        </div>
                      </div>
                    )}

                    {/* CARD FOOTER & ACTIONS */}
                    <div className="flex items-center justify-between gap-2 pt-2 border-t border-white/5 flex-wrap text-xs font-mono">
                      
                      {/* Metric Chips */}
                      <div className="flex items-center gap-3 text-slate-400">
                        <span>Fizibilite: <strong className="text-emerald-400">%{record.metrics.feasibilityScore}</strong></span>
                        <span>Etki: <strong className="text-cyan-300">%{record.metrics.impactLevel}</strong></span>
                        <span>Risk: <strong className={record.metrics.riskLevel === "Kritik" || record.metrics.riskLevel === "Yüksek" ? "text-rose-400" : "text-slate-300"}>{record.metrics.riskLevel}</strong></span>
                      </div>

                      {/* Right Action Icons */}
                      <div className="flex items-center gap-1.5 ml-auto">
                        
                        {/* Add Note Button if none */}
                        {!record.userEngagement.userNotes && !isEditingNote && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setNoteDraft("");
                              setEditingNoteId(record.id);
                            }}
                            className="px-2 py-1 rounded-md bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] transition-all flex items-center gap-1 cursor-pointer"
                            title="Not Ekle"
                          >
                            <FileText className="w-3 h-3 text-amber-400" />
                            <span>Not Ekle</span>
                          </button>
                        )}

                        {/* Copy outcome */}
                        <button
                          onClick={(e) => handleCopyOutcome(record, e)}
                          className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white text-[11px] transition-all cursor-pointer"
                          title="Çıktıyı Kopyala"
                        >
                          {isCopied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                        </button>

                        {/* Re-run button */}
                        {onNavigateToView && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleRerun(record);
                            }}
                            className="px-3 py-1.5 rounded-lg bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 text-[11px] font-mono font-bold transition-all flex items-center gap-1 cursor-pointer"
                            title="Bu simülasyonu ilgili modülde tekrar çalıştır"
                          >
                            <RotateCcw className="w-3 h-3" />
                            <span>Tekrar Çalıştır</span>
                          </button>
                        )}

                        {/* Delete Record */}
                        <button
                          onClick={(e) => handleDeleteRecord(record.id, e)}
                          className="p-1.5 rounded-lg bg-slate-800 hover:bg-rose-950 text-slate-400 hover:text-rose-400 text-[11px] transition-all cursor-pointer"
                          title="Kaydı Sil"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                    </div>

                  </div>
                );
              })}
            </div>
          )}
        </>
      )}
      </>
      )}

      {/* ================= 4. FULLSCREEN / MODAL DETAIL VIEW ================= */}
      {modalRecord &&
        createPortal(
          <div
            onClick={(e) => {
              if (e.target === e.currentTarget) setModalRecord(null);
            }}
            className="fixed inset-0 z-[999] flex items-center justify-center p-2 sm:p-4 md:p-6 bg-black/85 backdrop-blur-md animate-fadeIn"
          >
            <div
              onClick={(e) => e.stopPropagation()}
              className="relative w-full max-w-3xl max-h-[92dvh] sm:max-h-[88vh] bg-slate-950 border border-cyan-500/40 rounded-2xl sm:rounded-3xl shadow-2xl flex flex-col overflow-hidden font-sans"
            >
              {/* Modal Pinned Header */}
              <div className="p-4 sm:p-6 border-b border-white/10 bg-slate-900/95 flex items-start justify-between gap-3 shrink-0">
                <div className="space-y-1.5 min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="px-2.5 py-0.5 rounded-md bg-cyan-500/20 border border-cyan-500 text-cyan-300 text-[11px] font-mono font-bold">
                      {modalRecord.featureName}
                    </span>
                    <span className="px-2.5 py-0.5 rounded-md bg-purple-500/20 border border-purple-500 text-purple-300 text-[11px] font-mono font-bold">
                      {modalRecord.targetYear} Ufku
                    </span>
                    <span className={`px-2.5 py-0.5 rounded-md border text-[10px] font-mono font-bold uppercase ${getScenarioBadgeClass(modalRecord.scenarioMode)}`}>
                      {modalRecord.scenarioMode}
                    </span>
                  </div>
                  <h2 className="text-base sm:text-xl font-bold text-white leading-snug break-words">
                    {modalRecord.queryTitle}
                  </h2>
                </div>

                <button
                  onClick={() => setModalRecord(null)}
                  className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-all cursor-pointer shrink-0"
                  title="Kapat"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Modal Scrollable Body */}
              <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 text-xs sm:text-sm text-slate-200">
                
                {/* Query Inputs Card */}
                <div className="p-3.5 sm:p-4 rounded-xl sm:rounded-2xl bg-slate-900/80 border border-white/10 space-y-2">
                  <div className="text-[11px] font-mono text-slate-400 uppercase tracking-wider">
                    Sorgu Parametreleri & Prompt
                  </div>
                  <p className="text-slate-200 font-mono text-xs leading-relaxed break-words">
                    {modalRecord.queryInput.prompt || modalRecord.queryTitle}
                  </p>
                  {modalRecord.queryInput.profession && (
                    <div className="text-xs text-rose-300 font-mono">
                      • Hedef Meslek: <strong>{modalRecord.queryInput.profession}</strong>
                    </div>
                  )}
                  {modalRecord.queryInput.personaName && (
                    <div className="text-xs text-cyan-300 font-mono">
                      • Zaman Personası: <strong>{modalRecord.queryInput.personaName}</strong>
                    </div>
                  )}
                </div>

                {/* System Generated Outcome */}
                <div className="p-4 sm:p-5 rounded-xl sm:rounded-2xl bg-gradient-to-b from-slate-900 to-slate-950 border border-cyan-500/30 space-y-3 shadow-inner">
                  <div className="flex items-center justify-between text-xs font-mono text-cyan-400 pb-2 border-b border-white/5">
                    <span className="flex items-center gap-1.5 font-bold">
                      <Sparkles className="w-4 h-4 text-cyan-400" />
                      <span>Üretilen Yapay Zeka Çıktısı</span>
                    </span>
                    <span className="text-slate-500 text-[11px]">{new Date(modalRecord.timestamp).toLocaleString("tr-TR")}</span>
                  </div>
                  <div className="text-slate-100 font-sans leading-relaxed text-xs sm:text-sm whitespace-pre-line space-y-2 select-text">
                    {modalRecord.generatedOutcome}
                  </div>
                </div>

                {/* Accuracy Voting Feedback */}
                <div className="p-3.5 sm:p-4 rounded-xl sm:rounded-2xl bg-slate-900/80 border border-white/10 space-y-2">
                  <div className="text-[11px] font-mono text-slate-400">
                    Bu Gelecek Projeksiyonunun İsabetini Değerlendirin:
                  </div>
                  <div className="flex items-center gap-2 flex-wrap text-xs font-mono">
                    {[
                      { key: "bullseye", label: "🎯 %90+ Çok İsabetli", color: "bg-emerald-500/20 border-emerald-500 text-emerald-300" },
                      { key: "probable", label: "👍 Olası & Tutarlı", color: "bg-cyan-500/20 border-cyan-500 text-cyan-300" },
                      { key: "unlikely", label: "🤔 Düşük İhtimal", color: "bg-amber-500/20 border-amber-500 text-amber-300" },
                      { key: "anomalous", label: "🚨 Çelişkili / Spekülatif", color: "bg-rose-500/20 border-rose-500 text-rose-300" },
                    ].map((btn, bIdx) => (
                      <button
                        key={`vote-btn-${btn.key}-${bIdx}`}
                        onClick={(e) => handleVoteAccuracy(modalRecord.id, btn.key as any, e)}
                        className={`px-3 py-1.5 rounded-lg sm:rounded-xl border transition-all cursor-pointer text-xs ${
                          modalRecord.userEngagement.accuracyVote === btn.key
                            ? btn.color + " font-bold shadow-md ring-2 ring-white/20"
                            : "bg-slate-950 border-white/10 text-slate-400 hover:text-white"
                        }`}
                      >
                        {btn.label}
                      </button>
                    ))}
                  </div>
                </div>

              </div>

              {/* Modal Pinned Footer */}
              <div className="p-3 sm:p-4 border-t border-white/10 bg-slate-900/95 flex items-center justify-between gap-2 flex-wrap shrink-0">
                <div className="flex items-center gap-2">
                  <button
                    onClick={(e) => handleToggleBookmark(modalRecord.id, e)}
                    className={`px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-xl text-xs font-mono font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                      modalRecord.userEngagement.isBookmarked
                        ? "bg-amber-500 text-slate-950"
                        : "bg-slate-800 text-slate-300 hover:bg-slate-700"
                    }`}
                  >
                    <Bookmark className="w-3.5 h-3.5" />
                    <span>{modalRecord.userEngagement.isBookmarked ? "Favoride" : "Favoriye Ekle"}</span>
                  </button>

                  <button
                    onClick={() => handleCopyOutcome(modalRecord)}
                    className="px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-mono font-bold flex items-center gap-1.5 transition-all cursor-pointer"
                  >
                    <Copy className="w-3.5 h-3.5" />
                    <span>Kopyala</span>
                  </button>
                </div>

                {onNavigateToView && (
                  <button
                    onClick={() => {
                      handleRerun(modalRecord);
                      setModalRecord(null);
                    }}
                    className="px-4 py-2 sm:px-5 sm:py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold text-xs font-mono flex items-center gap-1.5 shadow-lg shadow-cyan-500/20 cursor-pointer ml-auto"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Tekrar Çalıştır</span>
                  </button>
                )}
              </div>

            </div>
          </div>,
          document.body
        )}

    </div>
  );
};
