import React, { useState, useEffect } from "react";
import { Milestone, ResearchCitation, SignalIntelligenceItem, SignalCategory } from "../types";
import {
  getReferenceSourcesForMilestone,
  getCitationTypeBadge,
  getSignalsForMilestone,
  getSignalBadge,
} from "../utils/referenceSources";
import {
  BookOpen,
  ExternalLink,
  Search,
  FileText,
  ShieldCheck,
  GraduationCap,
  Award,
  Building2,
  Globe,
  CheckCircle2,
  Sparkles,
  Info,
  Radio,
  Zap,
  Activity,
  Layers,
  Lock,
  LogIn,
  AlertCircle,
  Database,
  RefreshCw
} from "lucide-react";
import { UserProfile } from "./UserAuthModal";
import { safeFetchJson } from "../utils/apiClient";

interface AcademicLiveWorkItem {
  id: string;
  source: "OpenAlex" | "arXiv" | "Crossref" | "LocalCache";
  title: string;
  year: number;
  authors: string[];
  doi?: string;
  url: string;
  pdfUrl?: string;
  citedByCount: number;
  openAccess: boolean;
  abstractSnippet?: string;
  primaryCategory?: string;
  confidenceScore: number;
  lastFetchedAt: string;
}

interface ReferenceSourcesTabProps {
  milestone: Milestone;
  isCompact?: boolean;
  currentUser?: UserProfile | null;
  onOpenAuthModal?: () => void;
}

export const ReferenceSourcesTab: React.FC<ReferenceSourcesTabProps> = ({
  milestone,
  isCompact = false,
  currentUser,
  onOpenAuthModal,
}) => {
  const sources = getReferenceSourcesForMilestone(milestone);
  const signals = getSignalsForMilestone(milestone);

  const [activeSubTab, setActiveSubTab] = useState<"signals" | "academic">("signals");
  const [filterType, setFilterType] = useState<string>("all");
  const [signalCategoryFilter, setSignalCategoryFilter] = useState<string>("all");

  // Live OpenAlex & arXiv Academic Ingestion State
  const [searchQuery, setSearchQuery] = useState<string>(milestone.title);
  const [isSearching, setIsSearching] = useState<boolean>(false);
  const [academicWorks, setAcademicWorks] = useState<AcademicLiveWorkItem[]>([]);
  const [isFromCache, setIsFromCache] = useState<boolean>(false);
  const [totalCacheStats, setTotalCacheStats] = useState<{ totalSavedCitations: number; cachedQueryCount: number } | null>(null);

  // Auto-Ingest academic papers for milestone title on first mount
  useEffect(() => {
    let isMounted = true;
    const fetchInitialAcademicData = async () => {
      try {
        const res = await safeFetchJson<{
          success: boolean;
          results: AcademicLiveWorkItem[];
          fromCache: boolean;
          stats: { totalSavedCitations: number; cachedQueryCount: number };
        }>(`/api/academic/search?query=${encodeURIComponent(milestone.title)}&category=${encodeURIComponent(milestone.category)}&limit=6`);

        if (isMounted && res.success && res.results) {
          setAcademicWorks(res.results);
          setIsFromCache(!!res.fromCache);
          if (res.stats) setTotalCacheStats(res.stats);
        }
      } catch (err) {
        console.warn("Academic Auto-Ingest:", err);
      }
    };

    fetchInitialAcademicData();
    return () => {
      isMounted = false;
    };
  }, [milestone.title, milestone.category]);

  const handleAcademicSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    setIsSearching(true);
    try {
      const res = await safeFetchJson<{
        success: boolean;
        results: AcademicLiveWorkItem[];
        fromCache: boolean;
        stats: { totalSavedCitations: number; cachedQueryCount: number };
      }>(`/api/academic/search?query=${encodeURIComponent(searchQuery)}&category=${encodeURIComponent(milestone.category)}&limit=8`);

      if (res.success && res.results) {
        setAcademicWorks(res.results);
        setIsFromCache(!!res.fromCache);
        if (res.stats) setTotalCacheStats(res.stats);
      }
    } catch (err) {
      console.error("Academic Search Error:", err);
    } finally {
      setIsSearching(false);
    }
  };

  const filteredSources = sources.filter((s) => {
    if (filterType === "all") return true;
    if (filterType === "academic") return s.type === "academic_paper";
    if (filterType === "patent") return s.type === "patent_trend";
    if (filterType === "industry") return s.type === "industry_roadmap" || s.type === "tech_report";
    if (filterType === "policy") return s.type === "governmental_policy";
    return true;
  });

  const filteredSignals = signals.filter((sig) => {
    if (signalCategoryFilter === "all") return true;
    return sig.category === signalCategoryFilter;
  });

  return (
    <div className="bg-slate-950/90 border border-cyan-500/30 rounded-2xl p-4 sm:p-6 space-y-5 font-mono text-xs shadow-xl animate-in fade-in">
      
      {/* Header Banner */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 pb-3">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-cyan-500/20 border border-cyan-400/40 text-cyan-300">
            <Radio className="w-5 h-5 text-cyan-400 animate-pulse" />
          </div>
          <div>
            <h3 className="font-bold text-white text-sm sm:text-base flex items-center gap-2">
              <span>Sinyal İstihbaratı & Açık Bilim Radarı</span>
              <span className="text-[10px] bg-cyan-500/20 text-cyan-300 px-2 py-0.5 rounded-full border border-cyan-500/30">
                {signals.length} Sinyal & {sources.length + academicWorks.length} Kaynak
              </span>
            </h3>
            <p className="text-slate-400 text-[11px] font-sans">
              OpenAlex, arXiv, Crossref ve Google Patents verilerini birleştiren; kalıcı bellek mimarisiyle sıfır dış gecikmeli çalışan istihbarat motoru.
            </p>
          </div>
        </div>

        {/* Global Scholar / Patents Search Quick Action */}
        <div className="flex items-center gap-2 shrink-0">
          <a
            href={`https://scholar.google.com/scholar?q=${encodeURIComponent(milestone.title + " research")}`}
            target="_blank"
            rel="noopener noreferrer"
            className="px-3 py-1.5 rounded-xl bg-blue-600/20 hover:bg-blue-600/30 text-blue-300 border border-blue-500/40 text-[11px] font-bold flex items-center gap-1.5 transition-all cursor-pointer"
            title="Google Scholar Akademi Araması"
          >
            <Search className="w-3.5 h-3.5 text-blue-400" />
            <span className="hidden sm:inline">Google Scholar</span>
            <ExternalLink className="w-3 h-3" />
          </a>

          {milestone.googlePatentsSearchUrl && (
            <a
              href={milestone.googlePatentsSearchUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="px-3 py-1.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 text-[11px] font-bold flex items-center gap-1.5 transition-all cursor-pointer"
              title="Google Patents Araması"
            >
              <FileText className="w-3.5 h-3.5 text-amber-400" />
              <span className="hidden sm:inline">Google Patents</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          )}
        </div>
      </div>

      {/* KRİTİK METODOLOJİ BİLGİ KUTUSU: "PATENT = TEK VE ZORUNLU KANIT DEĞİLDİR" */}
      <div className="p-3.5 rounded-xl bg-gradient-to-r from-purple-950/40 via-slate-900 to-cyan-950/40 border border-purple-500/30 space-y-1.5 text-[11px] font-sans">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-purple-300 font-bold font-mono text-xs">
            <Zap className="w-4 h-4 text-purple-400" />
            <span>Fütüroloji & Kanıt İstihbaratı: "Açık Bilim + Kalıcı Akademik Bellek"</span>
          </div>
          {totalCacheStats && (
            <span className="text-[10px] font-mono text-cyan-300 bg-cyan-950/60 px-2 py-0.5 rounded border border-cyan-500/30 flex items-center gap-1">
              <Database className="w-3 h-3 text-cyan-400" />
              {totalCacheStats.totalSavedCitations} Kalıcı Atıf Bellekte
            </span>
          )}
        </div>
        <p className="text-slate-300 leading-relaxed">
          OpenAlex (250M+ akademik çalışma) ve arXiv (fizik, AI, kuantum ön baskı arşivi) sorguları yapıldıktan sonra sistemin <strong>kendi yerel kalıcı havuzuna</strong> yazılır. Tekrar eden sorgularda dış API tüketilmez; 0ms gecikmeyle kendi veritabanımızdan sunulur.
        </p>
      </div>

      {/* Main Tab Switcher: 6'lı Sinyal İstihbaratı vs. Hakemli Akademik Kaynaklar */}
      <div className="flex items-center gap-2 border-b border-white/10 pb-2">
        <button
          type="button"
          onClick={() => setActiveSubTab("signals")}
          className={`px-4 py-2 rounded-xl text-xs font-mono font-bold transition-all cursor-pointer flex items-center gap-2 border ${
            activeSubTab === "signals"
              ? "bg-cyan-500 text-slate-950 border-cyan-400 shadow-md shadow-cyan-500/20"
              : "bg-slate-900 text-slate-400 border-white/5 hover:text-white"
          }`}
        >
          <Radio className="w-3.5 h-3.5" />
          <span>📡 6'lı Sinyal İstihbarat Radarı ({signals.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveSubTab("academic")}
          className={`px-4 py-2 rounded-xl text-xs font-mono font-bold transition-all cursor-pointer flex items-center gap-2 border ${
            activeSubTab === "academic"
              ? "bg-cyan-500 text-slate-950 border-cyan-400 shadow-md shadow-cyan-500/20"
              : "bg-slate-900 text-slate-400 border-white/5 hover:text-white"
          }`}
        >
          <GraduationCap className="w-3.5 h-3.5" />
          <span>🎓 OpenAlex & arXiv Canlı Havuz ({sources.length + academicWorks.length})</span>
        </button>
      </div>

      {/* SUB-VIEW 1: 6'LI SİNYAL İSTİHBARAT RADARI */}
      {activeSubTab === "signals" && (
        <div className="space-y-4">
          
          {/* Signal Category Filters */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
            {[
              { id: "all", label: "Tüm Sinyaller" },
              { id: "official_roadmap", label: "🏢 Şirket Yol Haritası" },
              { id: "speed_trade_secret", label: "🚀 Ticari Sır / Hız" },
              { id: "clinical_field_test", label: "🧪 Saha / Klinik Test" },
              { id: "regulatory_policy", label: "🏛️ Regülasyon / İzin" },
              { id: "reputable_press", label: "📰 Saygın Basın" },
              { id: "patent_ip", label: "📜 Patent (Destekleyici)" },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setSignalCategoryFilter(tab.id)}
                className={`px-2.5 py-1 rounded-xl text-[11px] font-bold border whitespace-nowrap transition-all cursor-pointer ${
                  signalCategoryFilter === tab.id
                    ? "bg-cyan-500/20 border-cyan-400 text-cyan-300 shadow-sm"
                    : "bg-slate-900 border-white/10 text-slate-400 hover:text-white"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Signals Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            {filteredSignals.map((sig, sIdx) => {
              const badge = getSignalBadge(sig.category);

              return (
                <div
                  key={`sig-${sig.id || 'signal'}-${sIdx}`}
                  className="p-4 rounded-2xl bg-slate-900/80 border border-white/10 hover:border-cyan-500/40 transition-all space-y-2.5 flex flex-col justify-between shadow-lg"
                >
                  <div className="space-y-2">
                    {/* Signal Badge & Org */}
                    <div className="flex flex-wrap items-center justify-between gap-1.5">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold border flex items-center gap-1 ${badge.badgeClass}`}>
                        <span>{badge.iconEmoji}</span>
                        <span>{badge.label}</span>
                      </span>

                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-950 text-emerald-300 border border-emerald-500/30 font-bold">
                        %{sig.confidenceWeight} Güven
                      </span>
                    </div>

                    {/* Title */}
                    <h4 className="font-bold text-white text-xs sm:text-sm font-sans leading-snug">
                      {sig.title}
                    </h4>

                    {/* Org / Issuer */}
                    <div className="flex items-center gap-1.5 text-[11px] text-cyan-300 font-mono">
                      <Building2 className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                      <span className="truncate">{sig.sourceOrg}</span>
                    </div>

                    {/* Summary */}
                    <p className="text-slate-300 text-xs font-sans leading-relaxed">
                      {sig.summary}
                    </p>
                  </div>

                  {/* Signal Strength & Link */}
                  <div className="pt-2 border-t border-white/5 flex items-center justify-between text-[10px] font-mono">
                    <span className="text-slate-400 flex items-center gap-1">
                      <Activity className="w-3 h-3 text-cyan-400" />
                      <span>{sig.signalStrength}</span>
                    </span>

                    {sig.url && (
                      <a
                        href={sig.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-cyan-400 hover:text-cyan-300 flex items-center gap-1 underline"
                      >
                        <span>Sinyali İncele</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* SUB-VIEW 2: AKADEMİK & PATENT KAYNAKLARI (OPENALEX & ARXIV ENTEGRELİ) */}
      {activeSubTab === "academic" && (
        <div className="space-y-4">
          
          {/* Live OpenAlex / arXiv Query Search Bar */}
          <div className="p-3.5 rounded-xl bg-gradient-to-r from-blue-950/60 via-slate-900 to-cyan-950/60 border border-blue-500/30 space-y-2">
            <form onSubmit={handleAcademicSearch} className="flex flex-col sm:flex-row items-center gap-2">
              <div className="relative flex-1 w-full">
                <Search className="w-4 h-4 text-cyan-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="OpenAlex & arXiv'de Makale ve DOI Taraması Yapın..."
                  className="w-full bg-slate-950 border border-white/10 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 font-sans"
                />
              </div>
              <button
                type="submit"
                disabled={isSearching}
                className="w-full sm:w-auto px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs flex items-center justify-center gap-1.5 transition-all shadow-md shadow-cyan-500/20 disabled:opacity-50 cursor-pointer shrink-0"
              >
                {isSearching ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin text-slate-950" />
                    <span>Taranıyor...</span>
                  </>
                ) : (
                  <>
                    <Database className="w-3.5 h-3.5" />
                    <span>OpenAlex & arXiv Sorgula</span>
                  </>
                )}
              </button>
            </form>

            {/* Cache Hit / Source Banner */}
            <div className="flex flex-wrap items-center justify-between text-[11px] font-mono text-slate-400 pt-1">
              <div className="flex items-center gap-2">
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${isFromCache ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/40" : "bg-cyan-500/20 text-cyan-300 border-cyan-500/40"}`}>
                  {isFromCache ? "⚡ Yerel Kalıcı Bellekten (0ms Gecikme)" : "🌐 Açık Bilim Ağından Yeni İçe Aktarıldı"}
                </span>
                <span className="text-slate-300">OpenAlex & arXiv & DOI Deposu</span>
              </div>
              <span className="text-slate-500 text-[10px]">{academicWorks.length} Akademik Literatür İndeksi</span>
            </div>
          </div>

          {/* OpenAlex & arXiv Dynamically Ingested Real Works */}
          {academicWorks.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-xs font-mono text-cyan-300 font-bold border-b border-cyan-500/20 pb-1.5">
                <Sparkles className="w-4 h-4 text-cyan-400" />
                <span>Açık Bilim ve Hakemli Makale İndeksi (OpenAlex & arXiv)</span>
              </div>

              <div className="grid grid-cols-1 gap-3">
                {academicWorks.map((work, wIdx) => {
                  const isLockedForGuest = !currentUser && wIdx >= 2;

                  if (isLockedForGuest) {
                    if (wIdx === 2) {
                      const remainingCount = academicWorks.length - 2;
                      return (
                        <div key="locked_academic_banner" className="p-4 rounded-xl bg-slate-900/90 border border-cyan-500/30 text-center space-y-2">
                          <p className="text-xs text-slate-300 font-sans">
                            🔒 +{remainingCount} OpenAlex & arXiv Tam Metin ve DOI bağlantısını görüntülemek için oturum açın.
                          </p>
                          <button
                            type="button"
                            onClick={onOpenAuthModal}
                            className="px-4 py-1.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold font-mono text-xs cursor-pointer shadow-md"
                          >
                            Oturum Aç / Ücretsiz Başla
                          </button>
                        </div>
                      );
                    }
                    return null;
                  }

                  return (
                    <div
                      key={`academic-${work.id || 'work'}-${wIdx}`}
                      className="p-3.5 rounded-xl bg-slate-900/90 border border-cyan-500/20 hover:border-cyan-400/50 transition-all space-y-2"
                    >
                      <div className="flex flex-wrap items-start justify-between gap-2">
                        <div className="space-y-1 flex-1">
                          <div className="flex flex-wrap items-center gap-2 text-[10px] font-mono">
                            <span className={`px-2 py-0.5 rounded font-bold border ${work.source === "arXiv" ? "bg-amber-500/20 text-amber-300 border-amber-500/40" : "bg-blue-500/20 text-blue-300 border-blue-500/40"}`}>
                              {work.source === "arXiv" ? "arXiv Preprint" : "OpenAlex Index"}
                            </span>
                            {work.citedByCount > 0 && (
                              <span className="text-emerald-300 bg-emerald-950/40 px-1.5 py-0.5 rounded border border-emerald-500/30">
                                📚 {work.citedByCount} Atıf
                              </span>
                            )}
                            {work.openAccess && (
                              <span className="text-cyan-300 bg-cyan-950/40 px-1.5 py-0.5 rounded border border-cyan-500/30">
                                🔓 Açık Erişim
                              </span>
                            )}
                            <span className="text-slate-500">({work.year})</span>
                          </div>

                          <h4 className="font-bold text-white text-xs sm:text-sm font-sans leading-snug">
                            {work.title}
                          </h4>
                        </div>

                        <div className="flex items-center gap-1.5 shrink-0">
                          {work.pdfUrl && (
                            <a
                              href={work.pdfUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="px-2.5 py-1 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-300 border border-red-500/30 text-[10px] font-bold flex items-center gap-1"
                              title="PDF İndir / Oku"
                            >
                              <FileText className="w-3 h-3" />
                              <span>PDF</span>
                            </a>
                          )}
                          {work.url && (
                            <a
                              href={work.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-white/10 transition-all"
                              title="Yayın Sayfasına Git"
                            >
                              <ExternalLink className="w-3.5 h-3.5" />
                            </a>
                          )}
                        </div>
                      </div>

                      {work.authors && work.authors.length > 0 && (
                        <div className="text-[10px] text-slate-400 font-sans flex items-center gap-1">
                          <Award className="w-3 h-3 text-amber-400 shrink-0" />
                          <span>{work.authors.join(", ")}</span>
                        </div>
                      )}

                      {work.doi && (
                        <div className="text-[10px] font-mono text-cyan-400">
                          DOI: <a href={`https://doi.org/${work.doi}`} target="_blank" rel="noopener noreferrer" className="underline hover:text-cyan-300">{work.doi}</a>
                        </div>
                      )}

                      {work.abstractSnippet && (
                        <p className="text-[11px] text-slate-300 font-sans italic bg-slate-950/70 p-2 rounded-lg border border-white/5 leading-relaxed">
                          "{work.abstractSnippet}"
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Sources List Grid (Static Curated Curation) */}
          <div className="space-y-3 relative pt-2 border-t border-white/10">
            <div className="flex items-center gap-2 text-xs font-mono text-slate-400 font-bold">
              <BookOpen className="w-4 h-4 text-cyan-400" />
              <span>Sektörel Yol Haritaları & Küratör Kaynaklar ({filteredSources.length})</span>
            </div>

            {filteredSources.map((source, idx) => {
              const badge = getCitationTypeBadge(source.type);
              const isLockedForGuest = !currentUser && idx >= 2;

              if (isLockedForGuest) {
                if (idx === 2) {
                  const remainingCount = filteredSources.length - 2;
                  return (
                    <div key="locked_teaser_banner" className="relative mt-4 pt-6 border-t border-cyan-500/20">
                      <div className="p-6 rounded-2xl bg-gradient-to-b from-slate-950/90 via-slate-900/95 to-cyan-950/90 border border-cyan-500/40 text-center space-y-3 shadow-2xl relative overflow-hidden">
                        <div className="w-12 h-12 rounded-2xl bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-cyan-400 mx-auto">
                          <Lock className="w-6 h-6" />
                        </div>
                        <div>
                          <h4 className="text-sm font-bold text-white font-mono uppercase tracking-tight">
                            🔒 +{remainingCount} Derin Akademik Kaynak, Açık Bilim Raporu ve Patent Detayı Kilitli
                          </h4>
                          <p className="text-xs text-slate-300 font-sans max-w-md mx-auto mt-1 leading-relaxed">
                            Tüm güvenilir kaynakları, makaleleri ve detaylı analizleri görüntülemek için <strong>ücretsiz giriş yapın</strong>.
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={onOpenAuthModal}
                          className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold font-mono text-xs uppercase inline-flex items-center gap-2 transition-all shadow-lg shadow-cyan-500/20 cursor-pointer"
                        >
                          <LogIn className="w-4 h-4" />
                          <span>Oturum Aç / Kaydol</span>
                        </button>
                      </div>
                    </div>
                  );
                }
                return null;
              }

              return (
                <div
                  key={`source-${source.title || 'src'}-${idx}`}
                  className="p-3.5 rounded-xl bg-slate-900/80 border border-white/10 hover:border-cyan-500/40 transition-all space-y-2 group"
                >
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div className="space-y-1 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold border uppercase tracking-wider ${badge.colorClass}`}>
                          {badge.label}
                        </span>
                        <span className="text-[11px] text-slate-400 font-bold flex items-center gap-1">
                          <Building2 className="w-3 h-3 text-slate-500" />
                          <span>{source.source}</span>
                        </span>
                        <span className="text-[10px] text-slate-500">({source.year})</span>
                      </div>

                      <h4 className="font-bold text-white text-xs sm:text-sm group-hover:text-cyan-300 transition-colors leading-snug">
                        {source.title}
                      </h4>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <div className="px-2.5 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 font-bold text-[10px] flex items-center gap-1">
                        <ShieldCheck className="w-3 h-3 text-emerald-400" />
                        <span>%{source.confidenceScore} Güven</span>
                      </div>

                      {source.url && (
                        <a
                          href={source.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-white/10 transition-all"
                          title="Kaynak Bağlantısına Git"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                      )}
                    </div>
                  </div>

                  {(source.authors || source.doi) && (
                    <div className="flex flex-wrap items-center gap-3 text-[10px] text-slate-400 font-sans border-t border-white/5 pt-1.5">
                      {source.authors && (
                        <span className="flex items-center gap-1">
                          <Award className="w-3 h-3 text-amber-400" />
                          <strong className="text-slate-300">Araştırmacılar:</strong> {source.authors}
                        </span>
                      )}
                      {source.doi && (
                        <span className="font-mono text-cyan-400 bg-cyan-950/40 px-1.5 py-0.5 rounded border border-cyan-500/20">
                          DOI: {source.doi}
                        </span>
                      )}
                    </div>
                  )}

                  {source.snippet && (
                    <div className="p-2.5 rounded-lg bg-slate-950 border border-white/5 text-[11px] text-slate-300 font-sans italic leading-relaxed flex items-start gap-2">
                      <Info className="w-3.5 h-3.5 text-cyan-400 shrink-0 mt-0.5" />
                      <span>"{source.snippet}"</span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Scientific Transparency Footer */}
      <div className="p-3 rounded-xl bg-cyan-950/30 border border-cyan-500/20 text-[10px] text-slate-300 font-sans flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>Veri modelleri; OpenAlex, arXiv, teknoloji yol haritaları, regülasyonlar ve patent kayıtlarıyla projekte edilmektedir.</span>
        </div>
        <span className="text-cyan-400 font-mono font-bold shrink-0">✓ Çok Boyutlu Akademik Sinyal Ağı</span>
      </div>

    </div>
  );
};

