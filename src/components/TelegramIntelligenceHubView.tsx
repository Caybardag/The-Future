import React, { useState, useEffect, useMemo, useCallback } from "react";
import { Milestone, TelegramFeedItem, CategoryType } from "../types";
import { useAuth } from "../context/AuthContext";
import { safeFetchJson, getApiHeaders } from "../utils/apiClient";
import {
  Layers,
  Database,
  PlusCircle,
  Filter,
  RefreshCw,
  Search,
  ExternalLink,
  Bot,
  User,
  Radio,
  Clock,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  Info,
  Calendar,
  X,
  FileText,
  TrendingUp,
  Tag,
  Link as LinkIcon,
} from "lucide-react";

interface TelegramIntelligenceHubViewProps {
  activeMilestone?: Milestone;
  onNavigateView?: (view: any) => void;
  onSelectMilestoneYear?: (year: number) => void;
}

export function formatRealTimeAgo(dateString?: string): string {
  if (!dateString) return "Zaman bilgisi mevcut değil";
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return "Zaman bilgisi mevcut değil";
  const diffSec = Math.floor((Date.now() - date.getTime()) / 1000);
  if (diffSec < 0) return "Az önce";
  if (diffSec < 60) return "Az önce";
  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return `${diffMin} dakika önce`;
  const diffHours = Math.floor(diffMin / 60);
  if (diffHours < 24) return `${diffHours} saat önce`;
  const diffDays = Math.floor(diffHours / 24);
  if (diffDays < 30) return `${diffDays} gün önce`;
  const diffMonths = Math.floor(diffDays / 30);
  return `${diffMonths} ay önce`;
}

export function getProvenanceBadge(item: TelegramFeedItem) {
  if (item.sourceType === "MANUAL" || item.dataOrigin === "MANUAL_ENTRY") {
    return {
      label: "✍️ Manuel Kayıt",
      color: "bg-purple-950/60 text-purple-300 border-purple-500/40",
      description: "Kullanıcı / editör tarafından doğrudan eklenmiş kayıt.",
    };
  }
  if (item.sourceType === "ACADEMIC") {
    return {
      label: "🎓 Akademik Kaynak",
      color: "bg-blue-950/60 text-blue-300 border-blue-500/40",
      description: "Hakemli bilimsel yayın veya akademik arşiv.",
    };
  }
  if (item.sourceType === "PUBLIC_WEB") {
    return {
      label: "🌐 Açık Web",
      color: "bg-emerald-950/60 text-emerald-300 border-emerald-500/40",
      description: "Açık web ve teknoloji bülteni kaynağından derlenmiştir.",
    };
  }
  if (item.sourceType === "TELEGRAM" || item.dataOrigin === "EXTERNAL_SOURCE") {
    return {
      label: "📡 Dış Kaynak (Telegram)",
      color: "bg-cyan-950/60 text-cyan-300 border-cyan-500/40",
      description: "Seçili Telegram kanalından çekilmiş dış kaynak kaydı.",
    };
  }
  return {
    label: "📰 Dış Kaynak",
    color: "bg-slate-800 text-slate-300 border-slate-700",
    description: "Harici bilgi akışı kaydı.",
  };
}

export const TelegramIntelligenceHubView: React.FC<TelegramIntelligenceHubViewProps> = ({
  activeMilestone,
  onNavigateView,
  onSelectMilestoneYear,
}) => {
  const { currentUser } = useAuth();
  const [items, setItems] = useState<TelegramFeedItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [activeFilter, setActiveFilter] = useState<"all" | "external" | "manual" | "ai_analyzed" | "relevant">("all");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [isManualModalOpen, setIsManualModalOpen] = useState<boolean>(false);
  const [refreshKey, setRefreshKey] = useState<number>(0);

  // Manual Entry Form State
  const [manualTitle, setManualTitle] = useState<string>("");
  const [manualText, setManualText] = useState<string>("");
  const [manualCategory, setManualCategory] = useState<CategoryType>("Yapay Zeka & Bilişim");
  const [manualYear, setManualYear] = useState<number>(new Date().getFullYear());
  const [manualSourceUrl, setManualSourceUrl] = useState<string>("");
  const [isSubmittingManual, setIsSubmittingManual] = useState<boolean>(false);
  const [manualSuccessMsg, setManualSuccessMsg] = useState<string>("");
  const [manualErrorMsg, setManualErrorMsg] = useState<string>("");

  const loadFeedItems = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await safeFetchJson<{ success: boolean; data: TelegramFeedItem[] }>("/api/telegram/feed", {
        headers: getApiHeaders(),
      });
      if (res && Array.isArray(res.data)) {
        setItems(res.data);
      }
    } catch (e) {
      console.warn("Feed items fetch error, using local fallback vault:", e);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadFeedItems();
  }, [loadFeedItems, refreshKey]);

  const handleManualSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualTitle.trim() || !manualText.trim()) {
      setManualErrorMsg("Lütfen başlık ve açıklama alanlarını doldurun.");
      return;
    }

    setIsSubmittingManual(true);
    setManualErrorMsg("");
    setManualSuccessMsg("");

    try {
      const payload = {
        title: manualTitle.trim(),
        text: manualText.trim(),
        category: manualCategory,
        year: manualYear,
        sourceUrl: manualSourceUrl.trim() || undefined,
        author: currentUser?.displayName || currentUser?.fullName || currentUser?.email || "Kullanıcı",
        userEmail: currentUser?.email,
      };

      const res = await safeFetchJson<{ success: boolean; item?: TelegramFeedItem; error?: string }>("/api/telegram/manual-entry", {
        method: "POST",
        headers: getApiHeaders(),
        body: JSON.stringify(payload),
      });

      if (res && res.success) {
        setManualSuccessMsg("Yeni gelişme bilgi havuzuna başarıyla eklendi.");
        setManualTitle("");
        setManualText("");
        setManualSourceUrl("");
        setTimeout(() => {
          setIsManualModalOpen(false);
          setManualSuccessMsg("");
          setRefreshKey((k) => k + 1);
        }, 1200);
      } else {
        setManualErrorMsg(res?.error || "Gelişme kaydedilirken bir hata oluştu.");
      }
    } catch (err: any) {
      setManualErrorMsg(err?.message || "Sunucuya bağlanılamadı.");
    } finally {
      setIsSubmittingManual(false);
    }
  };

  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      // 1. Text search
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchTitle = (item.title || "").toLowerCase().includes(q);
        const matchSummary = (item.summary || "").toLowerCase().includes(q);
        const matchText = (item.originalText || "").toLowerCase().includes(q);
        const matchAuthor = (item.author || item.channelTitle || "").toLowerCase().includes(q);
        if (!matchTitle && !matchSummary && !matchText && !matchAuthor) return false;
      }

      // 2. Filter tabs
      if (activeFilter === "external") {
        if (item.sourceType === "MANUAL" || item.dataOrigin === "MANUAL_ENTRY") return false;
      } else if (activeFilter === "manual") {
        if (item.sourceType !== "MANUAL" && item.dataOrigin !== "MANUAL_ENTRY") return false;
      } else if (activeFilter === "ai_analyzed") {
        if (item.processingStatus !== "AI_ANALYZED") return false;
      } else if (activeFilter === "relevant") {
        if (!currentUser?.profession) return true;
        const prof = currentUser.profession.toLowerCase();
        const text = ((item.title || "") + " " + (item.summary || "") + " " + (item.category || "")).toLowerCase();
        const isMatch = (prof.includes("yazılım") && text.includes("yapay zeka")) ||
                        (prof.includes("tıp") && (text.includes("biyoloji") || text.includes("tıp") || text.includes("genetik"))) ||
                        (prof.includes("mühendis") && (text.includes("robot") || text.includes("enerji")));
        if (!isMatch) return false;
      }

      // 3. Category
      if (selectedCategory !== "all") {
        if (item.category !== selectedCategory) return false;
      }

      return true;
    });
  }, [items, searchQuery, activeFilter, selectedCategory, currentUser]);

  const stats = useMemo(() => {
    const total = items.length;
    const manualCount = items.filter((i) => i.sourceType === "MANUAL" || i.dataOrigin === "MANUAL_ENTRY").length;
    const externalCount = items.filter((i) => i.sourceType !== "MANUAL" && i.dataOrigin !== "MANUAL_ENTRY").length;
    const matchedCount = items.filter((i) => i.matchedMilestoneYear).length;
    return { total, manualCount, externalCount, matchedCount };
  }, [items]);

  const categories = useMemo(() => {
    const set = new Set<string>();
    items.forEach((i) => {
      if (i.category) set.add(i.category);
    });
    return Array.from(set);
  }, [items]);

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-6 animate-fadeIn font-sans">
      {/* Top Header Card */}
      <div className="bg-slate-900/90 border border-purple-500/30 rounded-3xl p-6 sm:p-8 shadow-2xl backdrop-blur-xl space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/10 pb-6">
          <div className="flex items-center gap-3.5">
            <div className="p-3.5 rounded-2xl bg-gradient-to-br from-purple-600/30 via-blue-600/20 to-purple-800/30 text-purple-300 border border-purple-500/40 shadow-lg shadow-purple-950/50">
              <Database className="w-7 h-7 text-purple-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                  Gelişmeler ve Bilgi Havuzu
                </h1>
                <span className="text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full bg-cyan-950/80 text-cyan-300 border border-cyan-500/40">
                  Şeffaf Bilgi Kaynakları
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-2xl leading-relaxed">
                Dünyadaki teknolojik gelişmeleri ve seçtiğiniz kaynaklardan gelen bilgileri toplar, sınıflandırır ve Gelecek Takvimi'ndeki konularla ilişkilendirir.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={() => setIsManualModalOpen(true)}
              className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-xs flex items-center gap-2 shadow-lg shadow-purple-500/20 transition-all cursor-pointer"
            >
              <PlusCircle className="w-4 h-4" />
              <span>+ Yeni Gelişme Ekle</span>
            </button>
            <button
              type="button"
              onClick={() => setRefreshKey((k) => k + 1)}
              aria-label="Yenile"
              className="p-2.5 rounded-xl bg-slate-950/80 border border-white/10 hover:border-purple-500/40 text-slate-400 hover:text-white transition-all cursor-pointer"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? "animate-spin text-purple-400" : ""}`} />
            </button>
          </div>
        </div>

        {/* Status / Metric Summary Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono">
          <div className="p-3.5 rounded-2xl bg-slate-950/70 border border-white/10 flex flex-col justify-between">
            <span className="text-slate-400 text-[11px] block">Toplam Kayıt</span>
            <div className="flex items-baseline gap-1 mt-1">
              <span className="text-lg font-bold text-white">{stats.total}</span>
              <span className="text-[10px] text-slate-500">gelişme</span>
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-950/70 border border-white/10 flex flex-col justify-between">
            <span className="text-slate-400 text-[11px] block">Harici Bilgi Akışı</span>
            <div className="flex items-baseline gap-1 mt-1">
              <span className="text-lg font-bold text-cyan-400">{stats.externalCount}</span>
              <span className="text-[10px] text-slate-500">kaynak</span>
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-950/70 border border-white/10 flex flex-col justify-between">
            <span className="text-slate-400 text-[11px] block">Manuel Kayıtlar</span>
            <div className="flex items-baseline gap-1 mt-1">
              <span className="text-lg font-bold text-purple-400">{stats.manualCount}</span>
              <span className="text-[10px] text-slate-500">kullanıcı</span>
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-950/70 border border-white/10 flex flex-col justify-between">
            <span className="text-slate-400 text-[11px] block">Arka Plan Veri Toplama</span>
            <div className="flex items-center gap-1.5 mt-1">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-xs font-bold text-emerald-300">Aktif</span>
            </div>
          </div>
        </div>

        {/* Epistemic Transparency Notice */}
        <div className="p-3.5 rounded-2xl bg-blue-950/30 border border-blue-500/20 text-xs text-slate-300 flex items-start gap-2.5">
          <Info className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
          <p className="text-[11px] leading-relaxed">
            <span className="font-bold text-blue-300">Veri Ayrımı & Epistemik Prensip:</span> Bilgi havuzundaki kayıtlar seçili dış kaynaklardan ve kullanıcı katkılarından derlenir. Dış kaynak kayıtları mutlak bilimsel kanıt niteliği taşımaz; yapay zeka analizleri ise kesinleşmiş gelecek değil, analitik model değerlendirmeleridir.
          </p>
        </div>

        {/* Search & Filter Bar */}
        <div className="space-y-3 pt-2">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Başlık, içerik, kaynak veya anahtar kelime ara..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-950 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-500/60"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              aria-label="Kategoriye Göre Filtrele"
              className="bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-purple-500/60"
            >
              <option value="all">Tüm Kategoriler</option>
              {categories.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          {/* Filter Pills */}
          <div className="flex flex-wrap items-center gap-2 pt-1">
            <button
              type="button"
              onClick={() => setActiveFilter("all")}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeFilter === "all"
                  ? "bg-purple-600 text-white shadow-md shadow-purple-500/25"
                  : "bg-slate-950/70 border border-white/10 text-slate-400 hover:text-white hover:bg-white/5"
              }`}
            >
              Tümü ({items.length})
            </button>
            <button
              type="button"
              onClick={() => setActiveFilter("external")}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeFilter === "external"
                  ? "bg-cyan-600 text-white shadow-md shadow-cyan-500/25"
                  : "bg-slate-950/70 border border-white/10 text-slate-400 hover:text-white hover:bg-white/5"
              }`}
            >
              Harici Kaynaklar ({stats.externalCount})
            </button>
            <button
              type="button"
              onClick={() => setActiveFilter("manual")}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeFilter === "manual"
                  ? "bg-purple-600 text-white shadow-md shadow-purple-500/25"
                  : "bg-slate-950/70 border border-white/10 text-slate-400 hover:text-white hover:bg-white/5"
              }`}
            >
              Manuel Kayıtlar ({stats.manualCount})
            </button>
            <button
              type="button"
              onClick={() => setActiveFilter("ai_analyzed")}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeFilter === "ai_analyzed"
                  ? "bg-indigo-600 text-white shadow-md shadow-indigo-500/25"
                  : "bg-slate-950/70 border border-white/10 text-slate-400 hover:text-white hover:bg-white/5"
              }`}
            >
              AI Analiz Edilenler
            </button>
            <button
              type="button"
              onClick={() => setActiveFilter("relevant")}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeFilter === "relevant"
                  ? "bg-emerald-600 text-white shadow-md shadow-emerald-500/25"
                  : "bg-slate-950/70 border border-white/10 text-slate-400 hover:text-white hover:bg-white/5"
              }`}
            >
              Beni Etkileyenler {currentUser?.profession ? `(${currentUser.profession})` : ""}
            </button>
          </div>
        </div>
      </div>

      {/* Item List */}
      <div className="space-y-4">
        {isLoading && items.length === 0 ? (
          <div className="text-center py-16 rounded-3xl bg-slate-900/40 border border-white/5 space-y-3">
            <RefreshCw className="w-8 h-8 text-purple-400 animate-spin mx-auto" />
            <p className="text-xs text-slate-400 font-mono">Bilgi havuzu kayıtları taranıyor...</p>
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="text-center py-16 rounded-3xl bg-slate-900/40 border border-white/5 space-y-3">
            <Database className="w-8 h-8 text-slate-500 mx-auto" />
            <p className="text-sm text-slate-300 font-bold">Kriterlere uygun kayıt bulunamadı</p>
            <p className="text-xs text-slate-500">Arama terimlerinizi veya filtre ayarlarınızı değiştirebilirsiniz.</p>
          </div>
        ) : (
          filteredItems.map((item) => {
            const prov = getProvenanceBadge(item);
            const timeAgo = formatRealTimeAgo(item.sourceCapturedAt || item.receivedAt);
            const isManual = item.sourceType === "MANUAL" || item.dataOrigin === "MANUAL_ENTRY";
            const isAiAnalyzed = item.processingStatus === "AI_ANALYZED";

            return (
              <div
                key={item.id}
                className="p-5 sm:p-6 rounded-3xl bg-slate-900/80 border border-white/10 hover:border-purple-500/40 transition-all shadow-xl backdrop-blur-md space-y-4"
              >
                {/* Card Top Provenance Header */}
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/5 pb-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className={`text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full border ${prov.color}`}>
                      {prov.label}
                    </span>

                    {item.category && (
                      <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-white/10">
                        {item.category}
                      </span>
                    )}

                    {isAiAnalyzed && (
                      <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-indigo-950/70 text-indigo-300 border border-indigo-500/30 flex items-center gap-1">
                        <Bot className="w-3 h-3 text-indigo-400" />
                        <span>Model Değerlendirmesi</span>
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-3 text-xs text-slate-400 font-mono">
                    <span className="flex items-center gap-1 text-[11px]">
                      <Clock className="w-3 h-3 text-slate-500" />
                      <span>{timeAgo}</span>
                    </span>

                    {(item.channelTitle || item.channelName || item.author) && (
                      <span className="text-[11px] text-slate-400 truncate max-w-[180px]">
                        Kaynak: <span className="text-white font-semibold">{item.channelTitle || item.channelName || item.author}</span>
                      </span>
                    )}
                  </div>
                </div>

                {/* Title & Body Content */}
                <div className="space-y-2">
                  <h3 className="text-base sm:text-lg font-bold text-white tracking-tight">
                    {item.title || "Teknolojik Gelişme Kaydı"}
                  </h3>

                  <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-sans">
                    {item.summary || item.originalText}
                  </p>

                  {item.summary && item.originalText && item.summary !== item.originalText && (
                    <details className="text-xs text-slate-400 pt-1 group">
                      <summary className="cursor-pointer text-[11px] text-purple-400 hover:text-purple-300 font-mono font-bold select-none">
                        Ham Kaynak Metnini Göster
                      </summary>
                      <div className="p-3 mt-2 rounded-xl bg-slate-950/80 border border-white/5 text-[11px] font-mono text-slate-400 whitespace-pre-wrap leading-relaxed">
                        {item.originalText}
                      </div>
                    </details>
                  )}
                </div>

                {/* AI Commentary Block (if analyzed) */}
                {item.aiAnalysisNotes && (
                  <div className="p-3.5 rounded-2xl bg-purple-950/30 border border-purple-500/20 text-xs space-y-1.5 font-sans">
                    <div className="flex items-center gap-1.5 text-purple-300 font-bold font-mono text-[11px]">
                      <Bot className="w-3.5 h-3.5 text-purple-400" />
                      <span>Yapay Zeka Yorumu & Epistemik Değerlendirme</span>
                    </div>
                    <p className="text-slate-300 text-xs leading-relaxed">
                      {item.aiAnalysisNotes}
                    </p>
                  </div>
                )}

                {/* Milestone Correlation Block */}
                {item.matchedMilestoneYear && (
                  <div className="p-3.5 rounded-2xl bg-cyan-950/30 border border-cyan-500/20 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="space-y-1">
                      <span className="text-[10px] uppercase font-mono font-bold text-cyan-400 block">
                        İlişkili Gelecek Takvimi Konusu
                      </span>
                      <p className="font-bold text-white text-xs sm:text-sm">
                        {item.matchedMilestoneYear} — {item.matchedMilestoneTitle || "Dönüm Noktası"}
                        {item.matchConfidence ? (
                          <span className="text-cyan-300 font-mono text-xs ml-2 font-normal">
                            (Algoritmik Eşleşme Skoru: %{item.matchConfidence})
                          </span>
                        ) : null}
                      </p>
                      <p className="text-[10px] text-slate-400">
                        * Bu bağlantı istatistiksel ve semantik benzerlik algoritmaları ile kurulmuştur; mutlak gerçekleşme garantisi içermez.
                      </p>
                    </div>

                    {onSelectMilestoneYear && (
                      <button
                        type="button"
                        onClick={() => onSelectMilestoneYear(item.matchedMilestoneYear!)}
                        className="px-3.5 py-1.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs flex items-center gap-1.5 shrink-0 transition-all cursor-pointer shadow-md shadow-cyan-500/20"
                      >
                        <span>Takvimde İncele</span>
                        <ExternalLink className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                )}

                {/* Card Footer: Metadata and Source Link */}
                <div className="flex flex-wrap items-center justify-between gap-3 pt-2 text-[11px] font-mono text-slate-400 border-t border-white/5">
                  <div className="flex items-center gap-3">
                    {item.extractedYear && (
                      <span className="text-slate-400">
                        Ufuk Yılı: <strong className="text-white">{item.extractedYear}</strong>
                      </span>
                    )}

                    {item.trlLevel && (
                      <span className="text-slate-400">
                        TRL Seviyesi: <strong className="text-purple-400">TRL {item.trlLevel}</strong>
                      </span>
                    )}
                  </div>

                  {item.sourceUrl && (
                    <a
                      href={item.sourceUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-purple-400 hover:text-purple-300 flex items-center gap-1 underline underline-offset-2 transition-colors"
                    >
                      <span>Orijinal Kaynağa Git</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Manual Entry Modal */}
      {isManualModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-fadeIn">
          <div className="relative w-full max-w-xl bg-slate-900 border border-purple-500/40 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-5">
            <button
              type="button"
              onClick={() => setIsManualModalOpen(false)}
              className="absolute top-5 right-5 p-2 rounded-full bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-all cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 border-b border-white/10 pb-4">
              <div className="p-3 rounded-2xl bg-purple-500/20 text-purple-400 border border-purple-500/30">
                <PlusCircle className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white">Yeni Gelişme Kaydı Ekle</h3>
                <p className="text-xs text-slate-400">Doğrulanabilir bir teknolojik haberi, makaleyi veya gelişmeyi bilgi havuzuna ekleyin.</p>
              </div>
            </div>

            {manualErrorMsg && (
              <div className="p-3 rounded-xl bg-rose-950/60 border border-rose-500/40 text-xs text-rose-300 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0 text-rose-400" />
                <span>{manualErrorMsg}</span>
              </div>
            )}

            {manualSuccessMsg && (
              <div className="p-3 rounded-xl bg-emerald-950/60 border border-emerald-500/40 text-xs text-emerald-300 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
                <span>{manualSuccessMsg}</span>
              </div>
            )}

            <form onSubmit={handleManualSubmit} className="space-y-4 text-xs font-sans">
              <div>
                <label className="block text-slate-300 font-bold mb-1 font-mono text-[11px] uppercase">
                  Gelişme Başlığı *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Örn: MIT araştırmacıları yeni katı hal batarya hücre prototipi geliştirdi"
                  value={manualTitle}
                  onChange={(e) => setManualTitle(e.target.value)}
                  className="w-full bg-slate-950 border border-white/10 rounded-xl px-3.5 py-2.5 text-white text-xs focus:outline-none focus:border-purple-500/60"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-bold mb-1 font-mono text-[11px] uppercase">
                    Kategori *
                  </label>
                  <select
                    value={manualCategory}
                    onChange={(e) => setManualCategory(e.target.value as CategoryType)}
                    className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-white text-xs focus:outline-none focus:border-purple-500/60"
                  >
                    <option value="Yapay Zeka & Bilişim">Yapay Zeka & Bilişim</option>
                    <option value="Biyoloji & Tıp">Biyoloji & Tıp</option>
                    <option value="Enerji & Çevre">Enerji & Çevre</option>
                    <option value="Kuantum & Güvenlik">Kuantum & Güvenlik</option>
                    <option value="Otonom & Lojistik">Otonom & Lojistik</option>
                    <option value="İnsan-Makine Arayüzü">İnsan-Makine Arayüzü</option>
                    <option value="Sosyoloji & Ekonomi">Sosyoloji & Ekonomi</option>
                    <option value="Post-İnsan & Medeniyet">Post-İnsan & Medeniyet</option>
                    <option value="Uzay & Fizik">Uzay & Fizik</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-bold mb-1 font-mono text-[11px] uppercase">
                    Hedef / Etki Yılı
                  </label>
                  <input
                    type="number"
                    min={2024}
                    max={2100}
                    value={manualYear}
                    onChange={(e) => setManualYear(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-white text-xs focus:outline-none focus:border-purple-500/60 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-bold mb-1 font-mono text-[11px] uppercase">
                  Orijinal Kaynak Bağlantısı (URL)
                </label>
                <input
                  type="url"
                  placeholder="https://nature.com/... veya https://arxiv.org/..."
                  value={manualSourceUrl}
                  onChange={(e) => setManualSourceUrl(e.target.value)}
                  className="w-full bg-slate-950 border border-white/10 rounded-xl px-3.5 py-2 text-white text-xs focus:outline-none focus:border-purple-500/60 font-mono"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-bold mb-1 font-mono text-[11px] uppercase">
                  Gelişme Detayı & Özet *
                </label>
                <textarea
                  required
                  rows={4}
                  placeholder="Gelişmenin detayları, kanıt düzeyi, hangi kuruluş tarafından yapıldığı ve sektörel etkileri..."
                  value={manualText}
                  onChange={(e) => setManualText(e.target.value)}
                  className="w-full bg-slate-950 border border-white/10 rounded-xl p-3 text-white text-xs focus:outline-none focus:border-purple-500/60 leading-relaxed"
                />
              </div>

              <div className="p-3 rounded-xl bg-white/5 border border-white/5 text-[11px] text-slate-400">
                ℹ️ Eklediğiniz kayıt <strong className="text-purple-300">"✍️ Manuel Kayıt"</strong> olarak etiketlenecek ve otomatik olarak Gelecek Takvimi konularıyla eşleştirilecektir.
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setIsManualModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl bg-slate-950 hover:bg-slate-800 border border-white/10 text-slate-300 hover:text-white font-bold text-xs transition-all cursor-pointer"
                >
                  Vazgeç
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingManual}
                  className="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 disabled:bg-purple-900 text-white font-bold text-xs flex items-center gap-2 shadow-lg shadow-purple-500/25 transition-all cursor-pointer"
                >
                  <PlusCircle className="w-4 h-4" />
                  <span>{isSubmittingManual ? "Kaydediliyor..." : "Havuzuna Ekle"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
