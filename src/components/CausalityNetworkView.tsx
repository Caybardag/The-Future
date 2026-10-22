import React, { useState, useEffect } from "react";
import { Milestone, PhaseId, CategoryType } from "../types";
import { PHASES } from "../data/timelineData";
import { GitBranch, Sparkles, Filter, ChevronRight, Info, Eye, Zap, Layers, Network, BookOpen, Database, Cpu, Activity, Radio } from "lucide-react";
import { useLanguage } from "../context/LanguageContext";
import { translateCategory } from "../utils/translations";
import { safeFetchJson } from "../utils/apiClient";
import { CausalDagMatrixVisualizer } from "./CausalDagMatrixVisualizer";
import { ForceDirectedPhysicsGraph } from "./ForceDirectedPhysicsGraph";

interface CausalityNetworkViewProps {
  milestones: Milestone[];
  onSelectMilestone: (milestone: Milestone) => void;
}

export const CausalityNetworkView: React.FC<CausalityNetworkViewProps> = ({
  milestones = [],
  onSelectMilestone,
}) => {
  const { language, t } = useLanguage();
  const safeMilestones = Array.isArray(milestones) ? milestones : [];
  const [activeTab, setActiveTab] = useState<"physics_graph" | "dag_matrix" | "classic_network">("physics_graph");
  const [selectedMilestone, setSelectedMilestone] = useState<Milestone | null>(
    safeMilestones.find((m) => m.year === 2029) || safeMilestones[0] || null
  );
  const [filterPhase, setFilterPhase] = useState<PhaseId | "all">("all");
  const [filterCategory, setFilterCategory] = useState<CategoryType | "all">("all");

  const filteredMilestones = safeMilestones.filter((m) => {
    if (filterPhase !== "all" && m.phase !== filterPhase) return false;
    if (filterCategory !== "all" && m.category !== filterCategory) return false;
    return true;
  });

  // Precursor milestones (milestones that reference this year or come before and link to this year)
  const precursors = selectedMilestone
    ? safeMilestones.filter(
        (m) =>
          m.year < selectedMilestone.year &&
          ((m.relatedYears || []).includes(selectedMilestone.year) ||
            (selectedMilestone.relatedYears || []).includes(m.year))
      )
    : [];

  // Downstream effect milestones (milestones in the future that are linked to this year)
  const downstream = selectedMilestone
    ? safeMilestones.filter(
        (m) =>
          m.year > selectedMilestone.year &&
          ((selectedMilestone.relatedYears || []).includes(m.year) ||
            (m.relatedYears || []).includes(selectedMilestone.year))
      )
    : [];

  const [semanticAnalysis, setSemanticAnalysis] = useState<{
    similarityScore: number;
    sharedConcepts: string[];
    evolutionTrajectory: string;
  } | null>(null);

  useEffect(() => {
    let isMounted = true;
    if (!selectedMilestone) return;

    const targetCategory = downstream.length > 0 ? downstream[0].category : selectedMilestone.category;
    safeFetchJson<{
      success: boolean;
      analysis: {
        similarityScore: number;
        sharedConcepts: string[];
        evolutionTrajectory: string;
      };
    }>(`/api/academic/semantic-graph?sourceCategory=${encodeURIComponent(selectedMilestone.category)}&targetCategory=${encodeURIComponent(targetCategory)}`)
      .then((res) => {
        if (isMounted && res.success && res.analysis) {
          setSemanticAnalysis(res.analysis);
        }
      })
      .catch((err) => console.warn("Semantic Graph Fetch:", err));

    return () => {
      isMounted = false;
    };
  }, [selectedMilestone?.year, selectedMilestone?.category, downstream]);

  return (
    <div className="space-y-6 pb-16 max-w-7xl mx-auto font-sans">
      
      {/* Header */}
      <div className="bg-slate-900/40 border border-white/5 rounded-2xl p-6 lg:p-8 relative overflow-hidden">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-2">
          <div className="flex items-center gap-2 text-purple-400 font-mono text-[11px] font-bold uppercase tracking-widest">
            <GitBranch className="w-4 h-4 text-purple-400" />
            <span>MILESTONE'LAR ARASI NEDENSELLİK BAĞLANTI GRAFİĞİ</span>
          </div>

          <span className="px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/30 text-purple-300 text-[10px] font-mono font-bold">
            Teknolojik Sıçrama Ağ Analizi
          </span>
        </div>

        <h2 className="text-2xl lg:text-3xl font-bold text-white tracking-tight">
          Teknolojik Zincir Reaktörü ve Etki Ağı
        </h2>
        <p className="text-slate-400 text-xs font-mono mt-1 max-w-3xl leading-relaxed">
          Geçmiş ve gelecekteki atılımların birbiriyle olan nedensellik bağlarını inceleyin. Bir dönüm noktasına tıkladığınızda, ona zemin hazırlayan öncül buluşları ve tetiklediği müteakip devrimleri canlı görün.
        </p>

        {/* Tab Selection Switcher */}
        <div className="mt-4 pt-4 border-t border-white/5 flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2 p-1 rounded-xl bg-slate-950 border border-white/10 text-xs font-mono">
            <button
              onClick={() => setActiveTab("physics_graph")}
              className={`px-3.5 py-2 rounded-lg font-bold transition-all flex items-center gap-2 cursor-pointer ${
                activeTab === "physics_graph"
                  ? "bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-md shadow-purple-500/20"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <Radio className="w-4 h-4 text-cyan-300 animate-pulse" />
              <span>🌐 İnteraktif Fizik Ağı (Force-Directed)</span>
            </button>
            <button
              onClick={() => setActiveTab("dag_matrix")}
              className={`px-3.5 py-2 rounded-lg font-bold transition-all flex items-center gap-2 cursor-pointer ${
                activeTab === "dag_matrix"
                  ? "bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <Cpu className="w-4 h-4" />
              <span>Matematiksel DAG & Simülatör (Bayesian)</span>
            </button>
            <button
              onClick={() => setActiveTab("classic_network")}
              className={`px-3.5 py-2 rounded-lg font-bold transition-all flex items-center gap-2 cursor-pointer ${
                activeTab === "classic_network"
                  ? "bg-purple-600 text-white shadow-md shadow-purple-500/20"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <Network className="w-4 h-4" />
              <span>Klasik Ağ & Semantik Kavram Haritası</span>
            </button>
          </div>

          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-cyan-950/40 border border-cyan-500/20 text-cyan-300 text-[11px] font-mono">
            <span className="animate-pulse">✌️</span>
            <span>Dokunmatik Gestür: 2 parmakla yakınlaştır (Pinch-to-zoom) & kaydır</span>
          </div>

          {activeTab === "classic_network" && (
            <div className="flex items-center gap-1.5 overflow-x-auto text-xs font-mono">
              <span className="text-slate-400 mr-1 flex items-center gap-1">
                <Filter className="w-3.5 h-3.5" /> Aşama:
              </span>
              <button
                onClick={() => setFilterPhase("all")}
                className={`px-3 py-1 rounded-full border ${
                  filterPhase === "all"
                    ? "bg-white text-black font-bold border-white"
                    : "bg-slate-900 text-slate-400 border-white/5 hover:text-white"
                }`}
              >
                Tümü
              </button>
              {PHASES.map((p) => (
                <button
                  key={p.id}
                  onClick={() => setFilterPhase(p.id)}
                  className={`px-3 py-1 rounded-full border ${
                    filterPhase === p.id
                      ? "bg-purple-600 text-white font-bold border-purple-400"
                      : "bg-slate-900 text-slate-400 border-white/5 hover:text-white"
                  }`}
                >
                  Aşama {p.id}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* RENDER ACTIVE TAB */}
      {activeTab === "physics_graph" ? (
        <ForceDirectedPhysicsGraph
          milestones={safeMilestones}
          onSelectMilestone={onSelectMilestone}
          selectedMilestoneId={selectedMilestone?.year}
        />
      ) : activeTab === "dag_matrix" ? (
        <CausalDagMatrixVisualizer
          milestones={safeMilestones}
          onSelectMilestone={onSelectMilestone}
        />
      ) : (
        /* Main Interactive Network Canvas + Side Inspector Grid */
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: Interactive Node Map */}
        <div className="lg:col-span-2 bg-slate-900/40 border border-white/5 rounded-2xl p-6 space-y-4 min-h-[500px]">
          <div className="flex items-center justify-between border-b border-white/5 pb-3">
            <span className="text-xs font-mono font-bold text-slate-300 uppercase flex items-center gap-2">
              <Layers className="w-4 h-4 text-purple-400" />
              <span>Dönüm Noktaları Düğüm Haritası ({filteredMilestones.length} Milestone)</span>
            </span>
            <span className="text-[11px] font-mono text-purple-400">
              Düğüme tıklayarak ağ zincirini inceleyin
            </span>
          </div>

          {/* Timeline Grid Nodes */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 max-h-[600px] overflow-y-auto pr-1">
            {filteredMilestones.map((m, mIdx) => {
              const isSelected = selectedMilestone?.year === m.year;
              const isPrecursor = precursors.some((p) => p.year === m.year);
              const isDownstream = downstream.some((d) => d.year === m.year);

              let borderClass = "border-white/5 hover:border-white/20 bg-slate-950/80";
              if (isSelected) {
                borderClass = "border-purple-400 bg-purple-950/40 text-white ring-2 ring-purple-500/30 shadow-lg shadow-purple-500/20";
              } else if (isPrecursor) {
                borderClass = "border-blue-500/50 bg-blue-950/30 text-blue-200 animate-pulse";
              } else if (isDownstream) {
                borderClass = "border-emerald-500/50 bg-emerald-950/30 text-emerald-200 animate-pulse";
              }

              return (
                <button
                  key={`causal-m-${m.year}-${m.title}-${mIdx}`}
                  onClick={() => setSelectedMilestone(m)}
                  className={`p-3 rounded-xl border text-left transition-all relative overflow-hidden group ${borderClass}`}
                >
                  <div className="flex items-center justify-between font-mono mb-1">
                    <span className="font-bold text-xs text-purple-300">{m.year}</span>
                    {isSelected && (
                      <span className="w-2 h-2 rounded-full bg-purple-400 animate-ping" />
                    )}
                    {isPrecursor && (
                      <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-300">ÖNCÜL</span>
                    )}
                    {isDownstream && (
                      <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300">SONUÇ</span>
                    )}
                  </div>

                  <h5 className="text-xs font-bold line-clamp-2 leading-tight group-hover:text-purple-200">
                    {m.title}
                  </h5>

                  <div className="text-[10px] font-mono text-slate-500 mt-2 truncate">
                    {translateCategory(m.category, language)}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right Column: Active Node Inspector & Causality Chain */}
        {selectedMilestone ? (
          <div className="bg-slate-900/60 border border-purple-500/30 rounded-2xl p-6 space-y-5 flex flex-col justify-between">
            <div className="space-y-4">
              
              <div className="flex items-start justify-between border-b border-white/5 pb-3">
                <div>
                  <span className="text-[11px] font-mono font-bold text-purple-400 uppercase">
                    SEÇİLİ DÜĞÜM DETAYI
                  </span>
                  <div className="text-2xl font-bold font-mono text-white flex items-center gap-2">
                    <span>{selectedMilestone.year}</span>
                    <span className="text-xs font-mono px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 border border-purple-500/30">
                      Aşama {selectedMilestone.phase}
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => onSelectMilestone(selectedMilestone)}
                  className="px-3 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-500 text-white font-mono font-bold text-xs flex items-center gap-1 transition-all shadow-md shadow-purple-500/20"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>Tam Detay</span>
                </button>
              </div>

              <div>
                <h3 className="text-base font-bold text-white leading-snug">
                  {selectedMilestone.title}
                </h3>
                <p className="text-xs text-slate-300 font-mono mt-2 leading-relaxed bg-slate-950 p-3 rounded-xl border border-white/5">
                  {selectedMilestone.description}
                </p>
              </div>

              {/* Precursors (Zemin Hazırlayan Gelişmeler) */}
              <div className="space-y-2">
                <span className="text-[11px] font-mono font-bold text-blue-400 uppercase flex items-center gap-1.5">
                  <Zap className="w-3.5 h-3.5" /> ZEMİN HAZIRLAYAN ÖNCÜL ATILIMLAR ({precursors.length}):
                </span>
                {precursors.length > 0 ? (
                  <div className="space-y-1.5">
                    {precursors.map((p, idx) => (
                      <button
                        key={`prec-${p.year}-${p.title}-${idx}`}
                        onClick={() => setSelectedMilestone(p)}
                        className="w-full text-left p-2.5 rounded-xl bg-slate-950 border border-blue-500/30 hover:bg-slate-900 transition-all flex items-center justify-between text-xs font-mono"
                      >
                        <div>
                          <span className="text-blue-400 font-bold mr-2">{p.year}</span>
                          <span className="text-slate-200">{p.title}</span>
                        </div>
                        <ChevronRight className="w-3.5 h-3.5 text-blue-400" />
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="text-xs font-mono text-slate-500 italic p-2 bg-slate-950 rounded-lg">
                    Bu milestona doğrudan öncül gösterilen kayıt temel atılımdır.
                  </div>
                )}
              </div>

              {/* Downstream Effects (Tetiklediği Müteakip Devrimler) */}
              <div className="space-y-2">
                <span className="text-[11px] font-mono font-bold text-emerald-400 uppercase flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5" /> TETİKLEDİĞİ MÜTEAKİP DEVRİMLER ({downstream.length}):
                </span>
                {downstream.length > 0 ? (
                  <div className="space-y-1.5">
                    {downstream.map((d, idx) => (
                      <button
                        key={`down-${d.year}-${d.title}-${idx}`}
                        onClick={() => setSelectedMilestone(d)}
                        className="w-full text-left p-2.5 rounded-xl bg-slate-950 border border-emerald-500/30 hover:bg-slate-900 transition-all flex items-center justify-between text-xs font-mono"
                      >
                        <div>
                          <span className="text-emerald-400 font-bold mr-2">{d.year}</span>
                          <span className="text-slate-200">{d.title}</span>
                        </div>
                        <ChevronRight className="w-3.5 h-3.5 text-emerald-400" />
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="text-xs font-mono text-slate-500 italic p-2 bg-slate-950 rounded-lg">
                    Bu gelişme henüz ufuktaki nihai dönüm noktalarındandır.
                  </div>
                )}
              </div>

              {/* Semantic Concept & Disciplinary Synergy Box */}
              {semanticAnalysis && (
                <div className="p-3.5 rounded-xl bg-gradient-to-r from-purple-950/40 via-slate-950 to-cyan-950/40 border border-purple-500/30 space-y-2 text-xs font-mono">
                  <div className="flex items-center justify-between text-[11px] text-purple-300 font-bold border-b border-white/5 pb-1.5">
                    <span className="flex items-center gap-1.5">
                      <Network className="w-3.5 h-3.5 text-cyan-400" />
                      <span>OpenAlex Semantik Kavram Grafı</span>
                    </span>
                    <span className="text-cyan-400 bg-cyan-950/60 px-2 py-0.5 rounded border border-cyan-500/30">
                      %{semanticAnalysis.similarityScore} Disiplin Uyumu
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-300 font-sans">
                    {semanticAnalysis.evolutionTrajectory}
                  </div>
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {semanticAnalysis.sharedConcepts.map((concept, cIdx) => (
                      <span key={cIdx} className="px-2 py-0.5 rounded-md bg-purple-950/80 text-purple-200 border border-purple-500/30 text-[10px]">
                        #{concept}
                      </span>
                    ))}
                  </div>
                </div>
              )}

            </div>

            <div className="pt-3 border-t border-white/5 text-[10px] font-mono text-slate-500 flex items-center justify-between">
              <span>Etki Seviyesi: %{selectedMilestone.impactLevel}</span>
              <span>Otonomi: %{selectedMilestone.aiAutonomyIndex}</span>
            </div>
          </div>
        ) : (
          <div className="bg-slate-900/40 border border-white/5 rounded-2xl p-6 flex flex-col items-center justify-center text-center text-slate-500 font-mono text-xs">
            <Info className="w-8 h-8 mb-2 text-slate-600" />
            <span>İncelemek için sol taraftan bir dönüm noktası düğümüne tıklayın.</span>
          </div>
        )}

      </div>
      )}

    </div>
  );
};
