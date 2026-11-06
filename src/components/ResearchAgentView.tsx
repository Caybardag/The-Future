import React, { useState, useEffect, useCallback, useMemo } from "react";
import {
  Search,
  Cpu,
  Globe,
  BookOpen,
  ShieldCheck,
  AlertTriangle,
  ExternalLink,
  RefreshCw,
  Sparkles,
  Layers,
  TrendingUp,
  FileText,
  Activity,
  CheckCircle2,
  Clock,
  Radio,
  Filter,
  ArrowRight,
  Database,
  Terminal,
} from "lucide-react";
import { TIMELINE_DATA } from "../data/timelineData";
import { safeFetchJson } from "../utils/apiClient";
import { Milestone } from "../types";

export interface IntelligenceSignalItem {
  id: string;
  milestoneYear: number;
  milestoneTitle: string;
  title: string;
  summary: string;
  extractedClaim: string;
  sourceUrl?: string;
  sourceType: "academic_doi" | "news_report" | "social_web_trend" | "telegram_signal";
  sourcePublisher: string;
  corroborationStatus: "UNVERIFIED_SIGNAL" | "CORROBORATED_EVIDENCE" | "OFFICIAL_CONFIRMATION";
  corroboratingSources: string[];
  confidenceScore: number;
  detectedAt: string;
  trlLevel: number;
  impactOnMilestone: "STRENGTHENS" | "WEAKENS" | "NO_CHANGE" | "ACCELERATES" | "DEFERS";
}

export interface ExtractedDataPoint {
  id: string;
  key: string;
  value: string;
  milestoneYear: number;
  confidence: number;
  context: string;
  source: string;
  extractedAt: string;
}

export interface ResearchAgentState {
  activeStage: "idle" | "understanding" | "searching" | "analyzing" | "extracting" | "synthesizing";
  currentMilestoneYear: number;
  currentMilestoneTitle: string;
  progressPercent: number;
  lastScanTimestamp: string;
  totalSignalsCount: number;
  corroboratedEvidenceCount: number;
  activeSearchQuery: string;
  recentSignals: IntelligenceSignalItem[];
  extractedDataPoints: ExtractedDataPoint[];
  recentLogs: Array<{ timestamp: string; stage: string; message: string }>;
}

interface ResearchAgentViewProps {
  onSelectMilestone?: (milestone: Milestone) => void;
  onNavigateToTimeline?: () => void;
}

export const ResearchAgentView: React.FC<ResearchAgentViewProps> = ({
  onSelectMilestone,
  onNavigateToTimeline,
}) => {
  const [agentState, setAgentState] = useState<ResearchAgentState | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isScanning, setIsScanning] = useState<boolean>(false);
  const [selectedYear, setSelectedYear] = useState<number>(2026);
  const [activeFilter, setActiveFilter] = useState<"all" | "academic" | "news" | "social">("all");
  const [searchQueryFilter, setSearchQueryFilter] = useState<string>("");
  const [expandedSignalId, setExpandedSignalId] = useState<string | null>(null);
  const [autoRefresh, setAutoRefresh] = useState<boolean>(true);

  const fetchStatus = useCallback(async () => {
    try {
      const res = await safeFetchJson<{ success: boolean; state: ResearchAgentState }>(
        "/api/intelligence/status",
        { timeoutMs: 5000 }
      );
      if (res && res.success && res.state) {
        setAgentState(res.state);
        if (res.state.activeStage !== "idle") {
          setIsScanning(true);
        } else {
          setIsScanning(false);
        }
      }
    } catch (e) {
      console.warn("[Research Agent] Status polling notice:", e);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStatus();
    let interval: any = null;
    if (autoRefresh) {
      interval = setInterval(() => {
        fetchStatus();
      }, 4000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [fetchStatus, autoRefresh]);

  const handleTriggerScan = async (yearToScan?: number) => {
    setIsScanning(true);
    try {
      const res = await safeFetchJson<{ success: boolean; state: ResearchAgentState }>(
        "/api/intelligence/scan",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ year: yearToScan || selectedYear }),
          timeoutMs: 30000,
        }
      );
      if (res && res.success && res.state) {
        setAgentState(res.state);
      }
    } catch (err: any) {
      console.warn("[Research Agent] Scan error notice:", err);
    } finally {
      setIsScanning(false);
      fetchStatus();
    }
  };

  const filteredSignals = useMemo(() => {
    if (!agentState?.recentSignals) return [];
    return agentState.recentSignals.filter((sig) => {
      if (activeFilter === "academic" && sig.sourceType !== "academic_doi") return false;
      if (activeFilter === "news" && sig.sourceType !== "news_report") return false;
      if (activeFilter === "social" && sig.sourceType !== "social_web_trend" && sig.sourceType !== "telegram_signal") return false;

      if (searchQueryFilter.trim()) {
        const q = searchQueryFilter.toLowerCase();
        return (
          sig.title.toLowerCase().includes(q) ||
          sig.summary.toLowerCase().includes(q) ||
          sig.extractedClaim.toLowerCase().includes(q) ||
          sig.sourcePublisher.toLowerCase().includes(q) ||
          sig.milestoneYear.toString().includes(q)
        );
      }
      return true;
    });
  }, [agentState?.recentSignals, activeFilter, searchQueryFilter]);

  const stages = [
    { key: "understanding", num: "01", label: "Kavram Analizi & Ontoloji", desc: "Sabit takvim maddesinin semantik arama profili ve anahtar kavramları taranır." },
    { key: "searching", num: "02", label: "Çok Katmanlı Arama Radarı", desc: "Google Search Grounding, X/sosyal medya trendleri ve OpenAlex REST API sorgulanır." },
    { key: "analyzing", num: "03", label: "Çapraz Kanıt Doğrulama", desc: "Ham iddialar bağımsız haberler, resmi bültenler ve DOI atıflarıyla teyit edilir." },
    { key: "extracting", num: "04", label: "Somut Veri Çıkarımı", desc: "TRL seviyesi, termodinamik metrikler ve ölçülebilir parametreler ayrıştırılır." },
    { key: "synthesizing", num: "05", label: "Gemini Otonom Sentezi", desc: "Doğrulanmış kanıtlar akıl yürütme motoruna aktarılır ve takvim dinamik olarak değerlendirilir." },
  ];

  const currentStageIndex = useMemo(() => {
    if (!agentState) return 0;
    switch (agentState.activeStage) {
      case "understanding": return 0;
      case "searching": return 1;
      case "analyzing": return 2;
      case "extracting": return 3;
      case "synthesizing": return 4;
      default: return 5; // idle / complete
    }
  }, [agentState?.activeStage]);

  const handleMilestoneClick = (year: number) => {
    const target = TIMELINE_DATA.find((m) => m.year === year);
    if (target && onSelectMilestone) {
      onSelectMilestone(target);
    } else if (onNavigateToTimeline) {
      onNavigateToTimeline();
    }
  };

  return (
    <div className="w-full max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 text-slate-100">
      {/* ─────────────────────────────────────────────────────────────────────────────
          1. HEADER & CONTROL BAR
          ───────────────────────────────────────────────────────────────────────────── */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-6 border-b border-slate-800">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-cyan-950/60 border border-cyan-500/30 text-cyan-400">
              <Cpu className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-bold tracking-tight text-white">
                  Research AI Agent & Canlı İstihbarat Radarı
                </h1>
                <span className="inline-flex items-center gap-1.5 text-xs font-mono text-emerald-400 bg-emerald-950/50 px-2 py-0.5 rounded border border-emerald-500/30">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                  Canlı Radar Aktif
                </span>
              </div>
              <p className="text-sm text-slate-400">
                2026–2060 arasındaki 35 kanonik dönüm noktası için Google Search Grounding, OpenAlex ve X/web sinyallerini tarayan otonom araştırma konsolu.
              </p>
            </div>
          </div>
        </div>

        {/* Global Controls */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 bg-slate-900 border border-slate-800 rounded-lg p-1 text-xs">
            <span className="text-slate-400 pl-2">Hedef Yıl:</span>
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(Number(e.target.value))}
              className="bg-slate-800 border-none rounded text-white py-1 px-2 text-xs focus:ring-1 focus:ring-cyan-500"
            >
              {TIMELINE_DATA.map((m) => (
                <option key={m.year} value={m.year}>
                  {m.year} — {m.title.slice(0, 28)}
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={() => handleTriggerScan(selectedYear)}
            disabled={isScanning}
            className={`inline-flex items-center gap-2 px-4 py-2 text-xs font-medium rounded-lg text-white transition-all ${
              isScanning
                ? "bg-slate-800 border border-slate-700 cursor-not-allowed opacity-75"
                : "bg-cyan-600 hover:bg-cyan-500 border border-cyan-400/30 shadow-lg shadow-cyan-950/50"
            }`}
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isScanning ? "animate-spin text-cyan-400" : ""}`} />
            {isScanning ? "İstihbarat Taranıyor..." : "Canlı Taramayı Başlat"}
          </button>

          <button
            onClick={() => setAutoRefresh(!autoRefresh)}
            className={`px-3 py-2 text-xs font-medium rounded-lg border transition-colors ${
              autoRefresh
                ? "bg-slate-900 border-slate-700 text-slate-300"
                : "bg-slate-950 border-slate-800 text-slate-500"
            }`}
          >
            Otomatik Arka Plan: {autoRefresh ? "AÇIK" : "KAPALI"}
          </button>
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────────────────────
          2. KPI SUMMARY STRIP
          ───────────────────────────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-1">
          <div className="text-xs text-slate-400 uppercase tracking-wider font-mono">Toplam Canlı Sinyal</div>
          <div className="text-2xl font-mono font-bold text-white tabular-nums">
            {agentState?.totalSignalsCount || 3}
          </div>
          <div className="text-[11px] text-slate-500">Google Search + OpenAlex + X</div>
        </div>

        <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-1">
          <div className="text-xs text-slate-400 uppercase tracking-wider font-mono">Teyitli Kanıt Sicili</div>
          <div className="text-2xl font-mono font-bold text-cyan-400 tabular-nums">
            {agentState?.corroboratedEvidenceCount || 3}
          </div>
          <div className="text-[11px] text-slate-500">Çapraz doğrulanmış kanıtlar</div>
        </div>

        <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-1">
          <div className="text-xs text-slate-400 uppercase tracking-wider font-mono">Aktif Tarama Hedefi</div>
          <div className="text-lg font-bold text-amber-400 truncate">
            {agentState?.currentMilestoneYear || selectedYear}
          </div>
          <div className="text-[11px] text-slate-500 truncate">
            {agentState?.currentMilestoneTitle || "Yapay Zeka Ajanları Çağı"}
          </div>
        </div>

        <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-1">
          <div className="text-xs text-slate-400 uppercase tracking-wider font-mono">Ajan Durumu</div>
          <div className="text-lg font-bold text-emerald-400 flex items-center gap-2">
            <span className={`w-2 h-2 rounded-full ${isScanning ? "bg-cyan-400 animate-ping" : "bg-emerald-400"}`} />
            {isScanning ? "Çoklu Hat Taraması" : "İzleme Modu (Nominal)"}
          </div>
          <div className="text-[11px] text-slate-500 truncate">
            {agentState?.activeSearchQuery ? `"${agentState.activeSearchQuery.slice(0, 24)}..."` : "Beklemede"}
          </div>
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────────────────────
          3. MAIN THREE-COLUMN WORKSPACE
          ───────────────────────────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* ── COLUMN 1: RESEARCH PROGRESS (4 Cols) ── */}
        <div className="lg:col-span-4 space-y-6">
          <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-5">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold tracking-wide uppercase font-mono text-cyan-400 flex items-center gap-2">
                <Activity className="w-4 h-4" />
                Araştırma Aşamaları
              </h2>
              <span className="text-xs font-mono text-slate-400">
                %{agentState?.progressPercent || (isScanning ? 50 : 100)}
              </span>
            </div>

            {/* Stages Stack */}
            <div className="space-y-3">
              {stages.map((st, idx) => {
                const isCompleted = isScanning ? currentStageIndex > idx : true;
                const isCurrent = isScanning && currentStageIndex === idx;

                return (
                  <div
                    key={st.key}
                    className={`p-3.5 rounded-xl border transition-all ${
                      isCurrent
                        ? "bg-cyan-950/40 border-cyan-500/50 shadow-md shadow-cyan-950/30"
                        : isCompleted
                        ? "bg-slate-950/50 border-slate-800/80"
                        : "bg-slate-950/20 border-slate-900 opacity-60"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-2.5">
                        <span className={`text-xs font-mono font-bold mt-0.5 ${isCurrent ? "text-cyan-400" : isCompleted ? "text-emerald-400" : "text-slate-600"}`}>
                          {st.num}
                        </span>
                        <div>
                          <div className={`text-xs font-semibold ${isCurrent ? "text-white" : isCompleted ? "text-slate-200" : "text-slate-500"}`}>
                            {st.label}
                          </div>
                          <div className="text-[11px] text-slate-400 mt-0.5 leading-relaxed">
                            {st.desc}
                          </div>
                        </div>
                      </div>

                      {isCurrent ? (
                        <RefreshCw className="w-4 h-4 text-cyan-400 animate-spin shrink-0" />
                      ) : isCompleted ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                      ) : (
                        <div className="w-4 h-4 rounded-full border border-slate-700 shrink-0" />
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Activity Log Terminal */}
          <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800/80 space-y-3 font-mono text-xs">
            <div className="flex items-center justify-between text-slate-400 border-b border-slate-900 pb-2">
              <span className="flex items-center gap-2 text-[11px] uppercase tracking-wider text-slate-300">
                <Terminal className="w-3.5 h-3.5 text-cyan-400" />
                Ajan Konsol Günlüğü
              </span>
              <span className="text-[10px] text-slate-500">Canlı Akış</span>
            </div>

            <div className="space-y-2 max-h-56 overflow-y-auto pr-1 text-[11px] leading-relaxed">
              {agentState?.recentLogs && agentState.recentLogs.length > 0 ? (
                agentState.recentLogs.map((log, i) => (
                  <div key={i} className="flex items-start gap-2 text-slate-400">
                    <span className="text-slate-600 shrink-0">{new Date(log.timestamp).toLocaleTimeString()}</span>
                    <span className="text-cyan-400 font-bold shrink-0">[{log.stage}]</span>
                    <span className="text-slate-300">{log.message}</span>
                  </div>
                ))
              ) : (
                <div className="text-slate-600 italic">Henüz günlük kaydı bulunmuyor.</div>
              )}
            </div>
          </div>
        </div>

        {/* ── COLUMN 2: INGESTED INTELLIGENCE & SOURCED CLAIMS (5 Cols) ── */}
        <div className="lg:col-span-5 space-y-5">
          <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h2 className="text-sm font-semibold tracking-wide uppercase font-mono text-cyan-400 flex items-center gap-2">
                  <Globe className="w-4 h-4" />
                  Gerçek Dünya Kanıtları ({filteredSignals.length})
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Doğrulanmış akademik yayınlar, resmi basın bültenleri ve X / web sinyalleri.
                </p>
              </div>

              {/* Source Filters */}
              <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-lg border border-slate-800 text-xs">
                <button
                  onClick={() => setActiveFilter("all")}
                  className={`px-2.5 py-1 rounded transition-colors ${
                    activeFilter === "all" ? "bg-slate-800 text-white" : "text-slate-400 hover:text-white"
                  }`}
                >
                  Tümü
                </button>
                <button
                  onClick={() => setActiveFilter("academic")}
                  className={`px-2.5 py-1 rounded transition-colors ${
                    activeFilter === "academic" ? "bg-slate-800 text-white" : "text-slate-400 hover:text-white"
                  }`}
                >
                  Akademik
                </button>
                <button
                  onClick={() => setActiveFilter("news")}
                  className={`px-2.5 py-1 rounded transition-colors ${
                    activeFilter === "news" ? "bg-slate-800 text-white" : "text-slate-400 hover:text-white"
                  }`}
                >
                  Haber/Rapor
                </button>
                <button
                  onClick={() => setActiveFilter("social")}
                  className={`px-2.5 py-1 rounded transition-colors ${
                    activeFilter === "social" ? "bg-slate-800 text-white" : "text-slate-400 hover:text-white"
                  }`}
                >
                  Web/X
                </button>
              </div>
            </div>

            {/* Quick Search in Signals */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-3" />
              <input
                type="text"
                placeholder="Kanıt başlığı, yayıncı veya iddia ara..."
                value={searchQueryFilter}
                onChange={(e) => setSearchQueryFilter(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
              />
            </div>

            {/* Signal Cards Feed */}
            <div className="space-y-3 max-h-[620px] overflow-y-auto pr-1">
              {filteredSignals.length > 0 ? (
                filteredSignals.map((sig) => {
                  const isExpanded = expandedSignalId === sig.id;

                  return (
                    <div
                      key={sig.id}
                      className="p-4 rounded-xl bg-slate-950/70 border border-slate-800/80 hover:border-slate-700 transition-all space-y-3"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 text-xs">
                            <span
                              onClick={() => handleMilestoneClick(sig.milestoneYear)}
                              className="font-mono text-cyan-400 hover:underline cursor-pointer"
                            >
                              {sig.milestoneYear} · {sig.milestoneTitle}
                            </span>
                            <span className="text-slate-600">/</span>
                            <span className="text-slate-400 text-[11px]">{sig.sourcePublisher}</span>
                          </div>

                          <h3 className="text-xs font-semibold text-white leading-snug">
                            {sig.title}
                          </h3>
                        </div>

                        {/* Corroboration Badge */}
                        <span
                          className={`text-[10px] font-mono px-2 py-0.5 rounded border shrink-0 ${
                            sig.corroborationStatus === "OFFICIAL_CONFIRMATION"
                              ? "bg-emerald-950/60 border-emerald-500/40 text-emerald-400"
                              : sig.corroborationStatus === "CORROBORATED_EVIDENCE"
                              ? "bg-cyan-950/60 border-cyan-500/40 text-cyan-400"
                              : "bg-amber-950/60 border-amber-500/40 text-amber-400"
                          }`}
                        >
                          {sig.corroborationStatus === "OFFICIAL_CONFIRMATION"
                            ? "Resmi Onay"
                            : sig.corroborationStatus === "CORROBORATED_EVIDENCE"
                            ? "Çapraz Teyitli"
                            : "Erken Sinyal"}
                        </span>
                      </div>

                      <p className="text-xs text-slate-300 leading-relaxed">
                        {sig.summary}
                      </p>

                      {/* Extracted Claim Box */}
                      <div className="p-2.5 rounded-lg bg-slate-900/60 border border-slate-800/60 text-[11px] text-slate-300 space-y-1 font-mono">
                        <div className="text-[10px] uppercase text-slate-400 font-bold">Çıkarılan Bilimsel/Teknolojik İddia:</div>
                        <div>"{sig.extractedClaim}"</div>
                      </div>

                      {/* Metadata Row */}
                      <div className="flex flex-wrap items-center justify-between text-[11px] text-slate-400 pt-1 border-t border-slate-900">
                        <div className="flex items-center gap-3">
                          <span className="font-mono">TRL-{sig.trlLevel}</span>
                          <span>·</span>
                          <span className="font-mono">Güven: %{sig.confidenceScore}</span>
                          <span>·</span>
                          <span className={sig.impactOnMilestone === "STRENGTHENS" ? "text-emerald-400" : sig.impactOnMilestone === "WEAKENS" ? "text-amber-400" : "text-slate-400"}>
                            {sig.impactOnMilestone === "STRENGTHENS" ? "Tahmini Güçlendirir" : sig.impactOnMilestone === "WEAKENS" ? "Tahmini Zayıflatır" : "Nötr Etki"}
                          </span>
                        </div>

                        {sig.sourceUrl && (
                          <a
                            href={sig.sourceUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-cyan-400 hover:text-cyan-300 text-xs transition-colors"
                          >
                            Kaynağı Aç <ExternalLink className="w-3 h-3" />
                          </a>
                        )}
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="text-center py-12 text-slate-500 text-xs italic">
                  Filtreye uygun kanıt bulunamadı. "Canlı Taramayı Başlat" butonu ile tarama yapabilirsiniz.
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ── COLUMN 3: EXTRACTED DATA POINTS & EVIDENCE REGISTRY (3 Cols) ── */}
        <div className="lg:col-span-3 space-y-6">
          <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-4">
            <div>
              <h2 className="text-sm font-semibold tracking-wide uppercase font-mono text-cyan-400 flex items-center gap-2">
                <Database className="w-4 h-4" />
                Çıkarılan Somut Veriler
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Metinlerden ayrıştırılan somut teknolojik parametreler ve ölçütler.
              </p>
            </div>

            <div className="space-y-3">
              {agentState?.extractedDataPoints && agentState.extractedDataPoints.length > 0 ? (
                agentState.extractedDataPoints.map((dp) => (
                  <div
                    key={dp.id}
                    className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800 space-y-1.5"
                  >
                    <div className="flex items-center justify-between text-[11px]">
                      <span
                        onClick={() => handleMilestoneClick(dp.milestoneYear)}
                        className="font-mono text-cyan-400 hover:underline cursor-pointer"
                      >
                        {dp.milestoneYear} Dönüm Noktası
                      </span>
                      <span className="font-mono text-emerald-400">%{dp.confidence} Güven</span>
                    </div>

                    <div className="text-xs font-bold text-white">
                      {dp.key}
                    </div>

                    <div className="text-xs font-mono text-cyan-300 bg-cyan-950/30 px-2 py-1 rounded border border-cyan-500/20">
                      {dp.value}
                    </div>

                    <div className="text-[11px] text-slate-400 leading-snug">
                      {dp.context}
                    </div>

                    <div className="text-[10px] text-slate-500 pt-1 border-t border-slate-900">
                      Kaynak: {dp.source}
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-slate-600 text-xs italic text-center py-6">
                  Henüz veri noktası çıkarılmadı.
                </div>
              )}
            </div>
          </div>

          {/* Direct Link to Timeline */}
          {onNavigateToTimeline && (
            <div className="p-4 rounded-xl bg-gradient-to-br from-cyan-950/40 to-slate-900 border border-cyan-500/20 space-y-3">
              <div className="text-xs font-semibold text-white">
                Kanıtların Takvimdeki Yansıması
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Bu istihbarat motoru tarafından toplanan tüm kanıtlar 2026–2060 takvimindeki 35 dönüm noktasının olasılık ve zaman ufkunu doğrudan besler.
              </p>
              <button
                onClick={onNavigateToTimeline}
                className="w-full inline-flex items-center justify-center gap-2 py-2 px-3 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-medium transition-colors"
              >
                Gelecek Takvimini İncele <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
