import React, { useState } from "react";
import { Milestone, ScenarioMode } from "../types";
import { PHASES } from "../data/timelineData";
import { useLanguage } from "../context/LanguageContext";
import { translateCategory } from "../utils/translations";
import { getLocalizedPhase } from "../utils/milestoneTranslations";
import { AIGeneratedStatisticsView } from "./AIGeneratedStatisticsView";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  Legend,
  Tooltip,
  CartesianGrid,
} from "recharts";
import { TrendingUp, Layers, AlertTriangle, Sparkles, BarChart3 } from "lucide-react";

interface AnalyticsViewProps {
  milestones: Milestone[];
  scenarioMode?: ScenarioMode;
  onNavigateToMilestone?: (year: number) => void;
}

export const AnalyticsView: React.FC<AnalyticsViewProps> = ({
  milestones = [],
  scenarioMode = "baseline",
  onNavigateToMilestone,
}) => {
  const { language, t } = useLanguage();
  const [activeTab, setActiveTab] = useState<"ai_trends" | "milestone_distribution">("ai_trends");
  const safeMilestones = Array.isArray(milestones) ? milestones : [];

  // Chart Data: Category distribution count
  const categoryCounts: Record<string, number> = {};
  safeMilestones.forEach((m) => {
    const translatedCat = translateCategory(m.category, language);
    categoryCounts[translatedCat] = (categoryCounts[translatedCat] || 0) + 1;
  });

  const categoryData = Object.entries(categoryCounts).map(([cat, count]) => ({
    category: cat,
    count,
  }));

  // Radar Data: Category-based Risk vs Opportunity
  const categoryStats: Record<string, {
    category: string;
    riskCount: number;
    oppCount: number;
    avgAiAutonomy: number;
    avgHumanAug: number;
    totalMilestones: number;
  }> = {};

  safeMilestones.forEach((m) => {
    const catName = translateCategory(m.category, language);
    if (!categoryStats[catName]) {
      categoryStats[catName] = {
        category: catName,
        riskCount: 0,
        oppCount: 0,
        avgAiAutonomy: 0,
        avgHumanAug: 0,
        totalMilestones: 0,
      };
    }
    categoryStats[catName].riskCount += (m.ethicalRisks || []).length;
    categoryStats[catName].oppCount += (m.societalOpportunities || []).length;
    categoryStats[catName].avgAiAutonomy += m.aiAutonomyIndex || 0;
    categoryStats[catName].avgHumanAug += m.humanAugmentationIndex || 0;
    categoryStats[catName].totalMilestones += 1;
  });

  const radarData = Object.values(categoryStats).map((st) => ({
    category: st.category,
    "Etik Risk Tipi": Math.min(100, st.riskCount * 12),
    "Toplumsal Fırsatlar": Math.min(100, st.oppCount * 12),
    "Yapay Zeka Otonomisi": Math.round(st.avgAiAutonomy / st.totalMilestones),
    "İnsan Artırımı": Math.round(st.avgHumanAug / st.totalMilestones),
  }));

  return (
    <div className="space-y-6 pb-12">
      {/* Mode Navigation Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-900/50 p-2 rounded-2xl border border-slate-800">
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setActiveTab("ai_trends")}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-mono font-bold transition-all ${
              activeTab === "ai_trends"
                ? "bg-cyan-500 text-slate-950 shadow-md"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Canlı AI Trend & İstatistik Simülasyonu</span>
          </button>
          <button
            onClick={() => setActiveTab("milestone_distribution")}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-mono font-bold transition-all ${
              activeTab === "milestone_distribution"
                ? "bg-blue-600 text-white shadow-md"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <BarChart3 className="w-3.5 h-3.5" />
            <span>Veriseti Dönüm Noktaları Dağılımı</span>
          </button>
        </div>

        <span className="text-[11px] font-mono text-slate-400 px-3 hidden sm:inline">
          {activeTab === "ai_trends" ? "Canlı Bilişsel Model" : `${safeMilestones.length} Kayıtlı Dönüm Noktası`}
        </span>
      </div>

      {/* TAB 1: Real-time AI Generated Statistics Engine */}
      {activeTab === "ai_trends" && (
        <AIGeneratedStatisticsView
          milestones={safeMilestones}
          initialScenario={scenarioMode}
          onNavigateToMilestone={onNavigateToMilestone}
        />
      )}

      {/* TAB 2: Historical Dataset Distribution & Phase Overview */}
      {activeTab === "milestone_distribution" && (
        <div className="space-y-6">
          {/* Category-based Radar Chart */}
          <div className="bg-slate-900/40 border border-white/5 rounded-2xl p-6 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/5 pb-4">
              <div>
                <h3 className="text-base font-bold text-white font-mono uppercase tracking-wider flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-amber-400" />
                  <span>Kategori Bazlı "Risk vs Fırsat" Radar Analitiği</span>
                </h3>
                <p className="text-[11px] text-slate-400 font-mono">
                  Sektörlerin etik risk yoğunluğu, toplumsal fırsat potansiyeli ve insan artırımı dengesi.
                </p>
              </div>
            </div>

            <div className="h-80 sm:h-[400px] w-full pt-2">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart cx="50%" cy="50%" outerRadius="75%" data={radarData}>
                  <PolarGrid stroke="#334155" />
                  <PolarAngleAxis dataKey="category" stroke="#cbd5e1" tick={{ fontSize: 10 }} />
                  <PolarRadiusAxis angle={30} domain={[0, 100]} stroke="#475569" />
                  <Radar name="Etik Risk Yükü" dataKey="Etik Risk Tipi" stroke="#ef4444" fill="#ef4444" fillOpacity={0.3} />
                  <Radar name="Toplumsal Fırsatlar" dataKey="Toplumsal Fırsatlar" stroke="#10b981" fill="#10b981" fillOpacity={0.3} />
                  <Radar name="AI Otonomisi" dataKey="Yapay Zeka Otonomisi" stroke="#a855f7" fill="#a855f7" fillOpacity={0.2} />
                  <Radar name="İnsan Artırımı" dataKey="İnsan Artırımı" stroke="#f59e0b" fill="#f59e0b" fillOpacity={0.2} />
                  <Legend wrapperStyle={{ fontSize: "11px", fontFamily: "monospace", paddingTop: "10px" }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#050507",
                      borderColor: "#334155",
                      borderRadius: "12px",
                      color: "#f8fafc",
                      fontSize: "12px",
                    }}
                  />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Category Breakdown & Phase Stats */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
            <div className="lg:col-span-7 bg-slate-900/40 border border-white/5 rounded-2xl p-6 space-y-4">
              <h3 className="text-sm font-bold text-white uppercase font-mono tracking-wider border-b border-white/5 pb-3">
                {t("all_categories")}
              </h3>
              <div className="h-64 sm:h-72 w-full pt-2">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={categoryData} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                    <XAxis
                      dataKey="category"
                      stroke="#64748b"
                      tick={{ fontSize: 10, fill: "#94a3b8" }}
                      interval={0}
                      angle={-15}
                      textAnchor="end"
                    />
                    <YAxis stroke="#64748b" tick={{ fontSize: 11, fill: "#94a3b8" }} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#050507",
                        borderColor: "#334155",
                        borderRadius: "12px",
                        color: "#f8fafc",
                        fontSize: "12px",
                      }}
                    />
                    <Bar dataKey="count" fill="#3b82f6" radius={[6, 6, 0, 0]} name={t("view_details")} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="lg:col-span-5 space-y-3">
              <h3 className="text-sm font-bold text-white uppercase font-mono tracking-wider">
                {t("phases_all")}
              </h3>

              {PHASES.map((pRaw) => {
                const p = getLocalizedPhase(pRaw, language);
                const phaseMilestones = safeMilestones.filter((m) => m.phase === p.id);
                const avgImpact = phaseMilestones.length > 0
                  ? Math.round(
                      phaseMilestones.reduce((acc, curr) => acc + curr.impactLevel, 0) / phaseMilestones.length
                    )
                  : 0;

                return (
                  <div
                    key={p.id}
                    className="bg-slate-900/40 border border-white/5 rounded-2xl p-4 space-y-2 relative overflow-hidden"
                  >
                    <div
                      className="absolute left-0 top-0 bottom-0 w-1"
                      style={{ backgroundColor: p.color }}
                    />

                    <div className="flex items-center justify-between">
                      <span
                        className="text-[10px] font-mono font-bold px-2 py-0.5 rounded border"
                        style={{ backgroundColor: `${p.color}15`, color: p.color, borderColor: `${p.color}40` }}
                      >
                        {p.subtitle}
                      </span>
                      <span className="text-xs font-mono text-slate-400">
                        AVG. IMPACT: <strong className="text-white">%{avgImpact}</strong>
                      </span>
                    </div>

                    <h4 className="text-xs font-bold text-white">{p.title}</h4>
                    <p className="text-[11px] text-slate-400 leading-relaxed font-mono">{p.keyTheme}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AnalyticsView;
