import React, { useState, useEffect, useMemo, useCallback } from "react";
import { Milestone, ScenarioMode } from "../types";
import { useLanguage } from "../context/LanguageContext";
import { AIService, aiService, TimelineStatisticsData, StatisticsTrendPoint, CategoryDynamicMetric } from "../services/AIService";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  BarChart,
  Bar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  Legend,
} from "recharts";
import {
  TrendingUp,
  Brain,
  Zap,
  Activity,
  ShieldAlert,
  Sparkles,
  RefreshCw,
  Sliders,
  DollarSign,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Download,
  Flame,
  Layers,
  ChevronRight,
} from "lucide-react";

interface AIGeneratedStatisticsViewProps {
  milestones?: Milestone[];
  initialScenario?: ScenarioMode;
  onNavigateToMilestone?: (year: number) => void;
}

export const AIGeneratedStatisticsView: React.FC<AIGeneratedStatisticsViewProps> = ({
  milestones = [],
  initialScenario = "baseline",
  onNavigateToMilestone,
}) => {
  const { language, t } = useLanguage();
  const [scenarioMode, setScenarioMode] = useState<ScenarioMode>(initialScenario);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [statsData, setStatsData] = useState<TimelineStatisticsData | null>(null);
  const [selectedYear, setSelectedYear] = useState<number>(2045);
  const [error, setError] = useState<string | null>(null);
  const [dataSource, setDataSource] = useState<string>("gemini-3.7-flash");

  // Chart Metric Toggles
  const [activeMetrics, setActiveMetrics] = useState({
    computationalPower: true,
    aiAutonomy: true,
    humanAugmentation: true,
    bioLongevity: false,
    cleanEnergy: true,
    postScarcity: false,
    disruptionRisk: true,
  });

  const toggleMetric = (key: keyof typeof activeMetrics) => {
    setActiveMetrics((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const fetchLiveStatistics = useCallback(async (isSilentRefresh = false) => {
    if (isSilentRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }
    setError(null);

    try {
      const response = await aiService.getTimelineStatistics({
        scenarioMode,
        language,
        focusCategory: selectedCategory,
      });

      if (response.success && response.data) {
        setStatsData(response.data);
        setDataSource(response.source || "gemini-3.7-flash");
      } else {
        setError(response.error || "İstatistik verisi alınamadı.");
      }
    } catch (err: any) {
      setError(err?.message || "Bağlantı hatası oluştu.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [scenarioMode, language, selectedCategory]);

  useEffect(() => {
    fetchLiveStatistics();
  }, [fetchLiveStatistics]);

  // Selected year snapshot
  const activeYearPoint = useMemo<StatisticsTrendPoint | null>(() => {
    if (!statsData?.timelinePoints) return null;
    const match = statsData.timelinePoints.find((p) => p.year === selectedYear);
    return match || statsData.timelinePoints[0] || null;
  }, [statsData, selectedYear]);

  // Radar Data for Categories
  const categoryRadarData = useMemo(() => {
    if (!statsData?.categoryDynamics) return [];
    return statsData.categoryDynamics.map((c) => ({
      category: c.category.length > 14 ? c.category.slice(0, 12) + "..." : c.category,
      "İvmelenme Hızı": c.velocity,
      "Etik Sürtünme": c.ethicalFriction,
      "Dönüşüm Oranı": c.transformRatio,
      "Uyum Gecikmesi (x10)": Math.min(100, Math.round(c.adoptionLagYears * 10)),
    }));
  }, [statsData]);

  // Export CSV Data
  const handleExportCSV = () => {
    if (!statsData?.timelinePoints) return;
    const headers = ["Yıl", "Hesaplama Gücü (%)", "AI Otonomi (%)", "İnsan Artırımı (%)", "Yaşam Beklentisi (Yıl)", "Temiz Enerji (%)", "Post-Kıtlık (%)", "Risk (%)"];
    const rows = statsData.timelinePoints.map((p) => [
      p.year,
      p.computationalPower,
      p.aiAutonomy,
      p.humanAugmentation,
      p.bioLongevity,
      p.cleanEnergy,
      p.postScarcity,
      p.disruptionRisk,
    ]);

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `2026_2060_teknolojik_trend_analizi_${scenarioMode}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 pb-16">
      {/* Top Banner Header */}
      <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6 lg:p-8 relative overflow-hidden">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 relative z-10">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-mono font-bold bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                <Sparkles className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
                {dataSource === "gemini-3.7-flash" ? "Canlı Bilişsel AI Trend Motoru" : "Yerel Ampirik Analiz Modeli"}
              </span>
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-mono text-slate-400 bg-slate-800/80 border border-slate-700/50">
                <Clock className="w-3 h-3 text-slate-400" />
                2026—2060 Ufku
              </span>
            </div>
            <h1 className="text-2xl lg:text-3xl font-bold text-white tracking-tight">
              AI Üretimli Çok Boyutlu Trend Analitiği
            </h1>
            <p className="text-slate-400 text-xs sm:text-sm font-mono max-w-3xl leading-relaxed">
              Hesaplama gücü, bilişsel otonomi, biyolojik yaşam beklentisi ve temiz enerji dönüşümünün 2026-2060 dönemi boyunca ampirik ve fiziksel sınırlar altındaki canlı izdüşümü.
            </p>
          </div>

          {/* Action & Filter Toolbar */}
          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            {/* Scenario Selector */}
            <div className="inline-flex rounded-xl bg-slate-950 p-1 border border-slate-800">
              <button
                onClick={() => setScenarioMode("baseline")}
                className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-all whitespace-nowrap ${
                  scenarioMode === "baseline"
                    ? "bg-blue-600 text-white shadow-sm"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                Temel (Standart)
              </button>
              <button
                onClick={() => setScenarioMode("optimistic")}
                className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-all whitespace-nowrap ${
                  scenarioMode === "optimistic"
                    ? "bg-emerald-600 text-white shadow-sm"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                Hızlandırılmış (AGI+)
              </button>
              <button
                onClick={() => setScenarioMode("dystopian")}
                className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-all whitespace-nowrap ${
                  scenarioMode === "dystopian"
                    ? "bg-rose-600 text-white shadow-sm"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                Regülasyon / Kısıtlı
              </button>
            </div>

            {/* Refresh Button */}
            <button
              onClick={() => fetchLiveStatistics(true)}
              disabled={refreshing || loading}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-mono font-bold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? "animate-spin text-cyan-400" : ""}`} />
              <span className="whitespace-nowrap">Yenile</span>
            </button>

            {/* Export CSV Button */}
            <button
              onClick={handleExportCSV}
              disabled={!statsData?.timelinePoints}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-mono font-bold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors disabled:opacity-50"
              title="CSV Olarak İndir"
            >
              <Download className="w-3.5 h-3.5 text-slate-300" />
              <span className="whitespace-nowrap">CSV</span>
            </button>
          </div>
        </div>

        {/* Executive Summary Snippet */}
        {statsData?.executiveSummary && (
          <div className="mt-5 pt-4 border-t border-slate-800/80 flex items-start gap-3 bg-slate-950/40 p-3.5 rounded-xl border border-slate-800/40">
            <Sparkles className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <span className="text-[11px] font-mono font-bold text-cyan-400 uppercase tracking-wider">
                Yapay Zeka Sentez Özeti ({scenarioMode.toUpperCase()})
              </span>
              <p className="text-xs text-slate-300 font-mono leading-relaxed">
                {statsData.executiveSummary}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* KPI Overview Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5">
        <div className="bg-slate-900/40 border border-slate-800/80 rounded-2xl p-4 space-y-1.5">
          <span className="text-[11px] font-mono text-slate-400 flex items-center gap-1.5">
            <Flame className="w-3.5 h-3.5 text-amber-400" />
            Tekillik Kırılma Yılı
          </span>
          <div className="text-2xl font-bold font-mono text-white">
            {statsData?.singularityTippingPointYear || 2045}
          </div>
          <span className="text-[10px] font-mono text-amber-400/90">
            Medyan tahmin eşiği
          </span>
        </div>

        <div className="bg-slate-900/40 border border-slate-800/80 rounded-2xl p-4 space-y-1.5">
          <span className="text-[11px] font-mono text-slate-400 flex items-center gap-1.5">
            <Brain className="w-3.5 h-3.5 text-purple-400" />
            2060 AI Otonomi İndeksi
          </span>
          <div className="text-2xl font-bold font-mono text-purple-400">
            %{statsData?.timelinePoints?.slice(-1)[0]?.aiAutonomy || 99}
          </div>
          <span className="text-[10px] font-mono text-slate-400">
            Küresel bilişsel otonomi
          </span>
        </div>

        <div className="bg-slate-900/40 border border-slate-800/80 rounded-2xl p-4 space-y-1.5">
          <span className="text-[11px] font-mono text-slate-400 flex items-center gap-1.5">
            <Activity className="w-3.5 h-3.5 text-emerald-400" />
            2060 Yaşam Beklentisi
          </span>
          <div className="text-2xl font-bold font-mono text-emerald-400">
            {statsData?.timelinePoints?.slice(-1)[0]?.bioLongevity || 122} Yaş
          </div>
          <span className="text-[10px] font-mono text-emerald-400/80">
            Hücresel telomer optimizasyonu
          </span>
        </div>

        <div className="bg-slate-900/40 border border-slate-800/80 rounded-2xl p-4 space-y-1.5">
          <span className="text-[11px] font-mono text-slate-400 flex items-center gap-1.5">
            <Zap className="w-3.5 h-3.5 text-cyan-400" />
            2060 Temiz Enerji Payı
          </span>
          <div className="text-2xl font-bold font-mono text-cyan-400">
            %{statsData?.timelinePoints?.slice(-1)[0]?.cleanEnergy || 99}
          </div>
          <span className="text-[10px] font-mono text-slate-400">
            Füzyon & katı hal şebekesi
          </span>
        </div>
      </div>

      {/* Main Multi-Vector Interactive Line Chart */}
      <div className="bg-slate-900/40 border border-slate-800/80 rounded-2xl p-6 space-y-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-4">
          <div className="space-y-1">
            <h2 className="text-base font-bold text-white font-mono uppercase tracking-wider flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-cyan-400" />
              <span>Üstel İlerleme Eğrisi (2026—2060 Projeksiyonu)</span>
            </h2>
            <p className="text-[11px] text-slate-400 font-mono">
              Grafikte görüntülemek istediğiniz metrikleri seçin veya gizleyin.
            </p>
          </div>

          {/* Metric Toggle Chips */}
          <div className="flex flex-wrap items-center gap-1.5 text-[11px] font-mono">
            <button
              onClick={() => toggleMetric("computationalPower")}
              className={`px-2.5 py-1 rounded-lg border transition-all ${
                activeMetrics.computationalPower
                  ? "bg-blue-500/20 text-blue-300 border-blue-500/40 font-bold"
                  : "bg-slate-950 text-slate-500 border-slate-800 opacity-60"
              }`}
            >
              Hesaplama Gücü
            </button>
            <button
              onClick={() => toggleMetric("aiAutonomy")}
              className={`px-2.5 py-1 rounded-lg border transition-all ${
                activeMetrics.aiAutonomy
                  ? "bg-purple-500/20 text-purple-300 border-purple-500/40 font-bold"
                  : "bg-slate-950 text-slate-500 border-slate-800 opacity-60"
              }`}
            >
              AI Otonomi
            </button>
            <button
              onClick={() => toggleMetric("humanAugmentation")}
              className={`px-2.5 py-1 rounded-lg border transition-all ${
                activeMetrics.humanAugmentation
                  ? "bg-amber-500/20 text-amber-300 border-amber-500/40 font-bold"
                  : "bg-slate-950 text-slate-500 border-slate-800 opacity-60"
              }`}
            >
              İnsan Artırımı
            </button>
            <button
              onClick={() => toggleMetric("cleanEnergy")}
              className={`px-2.5 py-1 rounded-lg border transition-all ${
                activeMetrics.cleanEnergy
                  ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/40 font-bold"
                  : "bg-slate-950 text-slate-500 border-slate-800 opacity-60"
              }`}
            >
              Temiz Enerji
            </button>
            <button
              onClick={() => toggleMetric("postScarcity")}
              className={`px-2.5 py-1 rounded-lg border transition-all ${
                activeMetrics.postScarcity
                  ? "bg-cyan-500/20 text-cyan-300 border-cyan-500/40 font-bold"
                  : "bg-slate-950 text-slate-500 border-slate-800 opacity-60"
              }`}
            >
              Post-Kıtlık
            </button>
            <button
              onClick={() => toggleMetric("disruptionRisk")}
              className={`px-2.5 py-1 rounded-lg border transition-all ${
                activeMetrics.disruptionRisk
                  ? "bg-rose-500/20 text-rose-300 border-rose-500/40 font-bold"
                  : "bg-slate-950 text-slate-500 border-slate-800 opacity-60"
              }`}
            >
              Jeopolitik Risk
            </button>
          </div>
        </div>

        {/* Line Chart */}
        <div className="h-80 sm:h-96 w-full pt-2">
          {loading ? (
            <div className="h-full flex items-center justify-center font-mono text-xs text-slate-400 gap-2">
              <RefreshCw className="w-4 h-4 animate-spin text-cyan-400" />
              <span>Yapay zeka trend modelleri hesaplanıyor...</span>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={statsData?.timelinePoints || []}
                margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                onClick={(e: any) => {
                  if (e && e.activePayload && e.activePayload[0]) {
                    setSelectedYear(e.activePayload[0].payload.year);
                  }
                }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis
                  dataKey="year"
                  stroke="#64748b"
                  tick={{ fontSize: 11, fill: "#94a3b8" }}
                />
                <YAxis
                  domain={[0, 100]}
                  stroke="#64748b"
                  tick={{ fontSize: 11, fill: "#94a3b8" }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#050507",
                    borderColor: "#334155",
                    borderRadius: "12px",
                    color: "#f8fafc",
                    fontSize: "12px",
                    fontFamily: "monospace",
                  }}
                />
                {activeMetrics.computationalPower && (
                  <Line
                    type="monotone"
                    dataKey="computationalPower"
                    stroke="#3b82f6"
                    strokeWidth={2.5}
                    dot={{ r: 4 }}
                    name="Hesaplama Gücü (%)"
                  />
                )}
                {activeMetrics.aiAutonomy && (
                  <Line
                    type="monotone"
                    dataKey="aiAutonomy"
                    stroke="#a855f7"
                    strokeWidth={2.5}
                    dot={{ r: 4 }}
                    name="AI Otonomi (%)"
                  />
                )}
                {activeMetrics.humanAugmentation && (
                  <Line
                    type="monotone"
                    dataKey="humanAugmentation"
                    stroke="#f59e0b"
                    strokeWidth={2.5}
                    dot={{ r: 4 }}
                    name="İnsan Artırımı (%)"
                  />
                )}
                {activeMetrics.cleanEnergy && (
                  <Line
                    type="monotone"
                    dataKey="cleanEnergy"
                    stroke="#10b981"
                    strokeWidth={2.5}
                    dot={{ r: 4 }}
                    name="Temiz Enerji Payı (%)"
                  />
                )}
                {activeMetrics.postScarcity && (
                  <Line
                    type="monotone"
                    dataKey="postScarcity"
                    stroke="#06b6d4"
                    strokeWidth={2.5}
                    dot={{ r: 4 }}
                    name="Post-Kıtlık İndeksi (%)"
                  />
                )}
                {activeMetrics.disruptionRisk && (
                  <Line
                    type="monotone"
                    dataKey="disruptionRisk"
                    stroke="#f43f5e"
                    strokeWidth={2}
                    strokeDasharray="4 4"
                    dot={{ r: 3 }}
                    name="Jeopolitik Risk (%)"
                  />
                )}
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Year Scrubbing Selector Bar */}
        <div className="pt-2 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-3">
          <span className="text-xs font-mono text-slate-400">
            Detaylı Yıl İncelemesi:
          </span>
          <div className="flex flex-wrap items-center gap-1.5">
            {(statsData?.timelinePoints || []).map((point, idx) => (
              <button
                key={`${point.year}-${idx}`}
                onClick={() => setSelectedYear(point.year)}
                className={`px-3 py-1 rounded-lg text-xs font-mono font-bold transition-all ${
                  selectedYear === point.year
                    ? "bg-cyan-500 text-slate-950 shadow-md"
                    : "bg-slate-950 text-slate-400 hover:text-slate-200 border border-slate-800"
                }`}
              >
                {point.year}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Selected Year Deep Snapshot Bento Card */}
      {activeYearPoint && (
        <div className="bg-gradient-to-r from-slate-900/60 via-slate-900/40 to-slate-900/60 border border-slate-800 rounded-2xl p-6 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2.5">
              <span className="text-xl font-bold font-mono text-cyan-400">
                {activeYearPoint.year} Yılı Çok Boyutlu Telemetrisi
              </span>
              <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                Anlık Durum
              </span>
            </div>
            {onNavigateToMilestone && (
              <button
                onClick={() => onNavigateToMilestone(activeYearPoint.year)}
                className="inline-flex items-center gap-1 text-xs font-mono text-cyan-400 hover:text-cyan-300 font-bold transition-colors"
              >
                <span>Bu yılın dönüm noktalarını gör</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 pt-1">
            <div className="bg-slate-950/60 border border-slate-800/80 rounded-xl p-3 space-y-1">
              <span className="text-[10px] font-mono text-slate-400">Hesaplama Gücü</span>
              <div className="text-lg font-bold font-mono text-blue-400">%{activeYearPoint.computationalPower}</div>
              <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                <div className="bg-blue-400 h-full rounded-full" style={{ width: `${activeYearPoint.computationalPower}%` }} />
              </div>
            </div>

            <div className="bg-slate-950/60 border border-slate-800/80 rounded-xl p-3 space-y-1">
              <span className="text-[10px] font-mono text-slate-400">AI Otonomi</span>
              <div className="text-lg font-bold font-mono text-purple-400">%{activeYearPoint.aiAutonomy}</div>
              <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                <div className="bg-purple-400 h-full rounded-full" style={{ width: `${activeYearPoint.aiAutonomy}%` }} />
              </div>
            </div>

            <div className="bg-slate-950/60 border border-slate-800/80 rounded-xl p-3 space-y-1">
              <span className="text-[10px] font-mono text-slate-400">İnsan Artırımı</span>
              <div className="text-lg font-bold font-mono text-amber-400">%{activeYearPoint.humanAugmentation}</div>
              <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                <div className="bg-amber-400 h-full rounded-full" style={{ width: `${activeYearPoint.humanAugmentation}%` }} />
              </div>
            </div>

            <div className="bg-slate-950/60 border border-slate-800/80 rounded-xl p-3 space-y-1">
              <span className="text-[10px] font-mono text-slate-400">Sağlıklı Ömür</span>
              <div className="text-lg font-bold font-mono text-emerald-400">{activeYearPoint.bioLongevity} Yaş</div>
              <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                <div className="bg-emerald-400 h-full rounded-full" style={{ width: `${Math.min(100, (activeYearPoint.bioLongevity / 130) * 100)}%` }} />
              </div>
            </div>

            <div className="bg-slate-950/60 border border-slate-800/80 rounded-xl p-3 space-y-1">
              <span className="text-[10px] font-mono text-slate-400">Temiz Enerji</span>
              <div className="text-lg font-bold font-mono text-teal-400">%{activeYearPoint.cleanEnergy}</div>
              <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                <div className="bg-teal-400 h-full rounded-full" style={{ width: `${activeYearPoint.cleanEnergy}%` }} />
              </div>
            </div>

            <div className="bg-slate-950/60 border border-slate-800/80 rounded-xl p-3 space-y-1">
              <span className="text-[10px] font-mono text-slate-400">Jeopolitik Risk</span>
              <div className="text-lg font-bold font-mono text-rose-400">%{activeYearPoint.disruptionRisk}</div>
              <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                <div className="bg-rose-400 h-full rounded-full" style={{ width: `${activeYearPoint.disruptionRisk}%` }} />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Two Columns: Category Dynamics Radar & Sector Investment / Velocity Table */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Radar Chart: Sektörel Dinamikler */}
        <div className="lg:col-span-6 bg-slate-900/40 border border-slate-800/80 rounded-2xl p-6 space-y-4">
          <div className="border-b border-slate-800 pb-3">
            <h3 className="text-sm font-bold text-white font-mono uppercase tracking-wider flex items-center gap-2">
              <Layers className="w-4 h-4 text-emerald-400" />
              <span>Sektörel İvme & Etik Sürtünme Radarı</span>
            </h3>
            <p className="text-[11px] text-slate-400 font-mono">
              Kategorilerin inovasyon hızı, etik bariyerleri ve regülasyon gecikmeleri.
            </p>
          </div>

          <div className="h-72 sm:h-80 w-full pt-1">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart cx="50%" cy="50%" outerRadius="72%" data={categoryRadarData}>
                <PolarGrid stroke="#334155" />
                <PolarAngleAxis dataKey="category" stroke="#94a3b8" tick={{ fontSize: 10 }} />
                <PolarRadiusAxis angle={30} domain={[0, 100]} stroke="#475569" />
                <Radar name="İvmelenme Hızı" dataKey="İvmelenme Hızı" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.25} />
                <Radar name="Etik Sürtünme" dataKey="Etik Sürtünme" stroke="#ef4444" fill="#ef4444" fillOpacity={0.2} />
                <Radar name="Dönüşüm Oranı" dataKey="Dönüşüm Oranı" stroke="#10b981" fill="#10b981" fillOpacity={0.2} />
                <Legend wrapperStyle={{ fontSize: "11px", fontFamily: "monospace", paddingTop: "8px" }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#050507",
                    borderColor: "#334155",
                    borderRadius: "12px",
                    color: "#f8fafc",
                    fontSize: "12px",
                    fontFamily: "monospace",
                  }}
                />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Sector Investment & Transformation Breakdown */}
        <div className="lg:col-span-6 bg-slate-900/40 border border-slate-800/80 rounded-2xl p-6 space-y-4">
          <div className="border-b border-slate-800 pb-3">
            <h3 className="text-sm font-bold text-white font-mono uppercase tracking-wider flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-amber-400" />
              <span>Sektörel Yatırım Hacmi & Dönüşüm Matrisi</span>
            </h3>
            <p className="text-[11px] text-slate-400 font-mono">
              Yıllık tahmini Ar-Ge sermayesi ve toplumsal uyum süresi.
            </p>
          </div>

          <div className="space-y-2.5 overflow-y-auto max-h-[340px] pr-1">
            {(statsData?.categoryDynamics || []).map((cat, idx) => (
              <div
                key={idx}
                className="bg-slate-950/60 border border-slate-800/70 rounded-xl p-3 space-y-2 transition-all hover:border-slate-700"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-white font-mono">{cat.category}</span>
                  <span className="text-xs font-mono font-bold text-amber-400">
                    ${cat.investmentBillionUSD} Mrd / Yıl
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-2 text-[10px] font-mono text-slate-400 pt-1">
                  <div>
                    İnovasyon İvmesi: <strong className="text-cyan-400">%{cat.velocity}</strong>
                  </div>
                  <div>
                    Etik Sürtünme: <strong className="text-rose-400">%{cat.ethicalFriction}</strong>
                  </div>
                  <div>
                    Uyum Gecikmesi: <strong className="text-slate-200">{cat.adoptionLagYears} Yıl</strong>
                  </div>
                </div>

                <div className="w-full bg-slate-900 h-1.5 rounded-full overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-blue-500 to-cyan-400 h-full rounded-full"
                    style={{ width: `${cat.transformRatio}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Critical Physical & Regulatory Bottlenecks */}
      {statsData?.criticalBottlenecks && statsData.criticalBottlenecks.length > 0 && (
        <div className="bg-slate-900/40 border border-slate-800/80 rounded-2xl p-6 space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
            <AlertTriangle className="w-4 h-4 text-amber-400" />
            <h3 className="text-sm font-bold text-white font-mono uppercase tracking-wider">
              Fiziksel Kanun & Küresel Ölçeklenme Kısıtları (9 Değişmez Yasa Uyarınca)
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {statsData.criticalBottlenecks.map((bottleneck, i) => (
              <div
                key={i}
                className="bg-slate-950/60 border border-slate-800/70 rounded-xl p-3.5 flex items-start gap-3"
              >
                <span className="w-5 h-5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20 text-xs font-mono font-bold flex items-center justify-center shrink-0 mt-0.5">
                  {i + 1}
                </span>
                <span className="text-xs font-mono text-slate-300 leading-relaxed">
                  {bottleneck}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default AIGeneratedStatisticsView;
