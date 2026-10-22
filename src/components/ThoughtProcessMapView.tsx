import React, { useState, useMemo } from "react";
import { PredictionHistoryRecord, PredictionFeatureKey } from "../utils/predictionHistory";
import {
  buildThoughtProcessGraph,
  ThoughtInfluenceLink,
  InfluenceType,
  CognitiveJourneySummary,
} from "../utils/thoughtProcessMap";
import {
  GitBranch,
  Sparkles,
  Bot,
  Briefcase,
  GitFork,
  MessageSquare,
  User,
  Compass,
  ArrowRight,
  TrendingUp,
  Share2,
  Calendar,
  Layers,
  Zap,
  Activity,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  Maximize2,
  Info,
  Sliders,
  ChevronRight,
  ExternalLink,
  Bookmark,
  Eye,
} from "lucide-react";
import { useLanguage } from "../context/LanguageContext";

interface ThoughtProcessMapViewProps {
  records: PredictionHistoryRecord[];
  onSelectRecord?: (record: PredictionHistoryRecord) => void;
  onRerunRecord?: (record: PredictionHistoryRecord) => void;
}

type MapMode = "flow" | "network" | "archetype";

export const ThoughtProcessMapView: React.FC<ThoughtProcessMapViewProps> = ({
  records,
  onSelectRecord,
  onRerunRecord,
}) => {
  const { language } = useLanguage();
  const isTr = language === "tr";

  const [activeMode, setActiveMode] = useState<MapMode>("flow");
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [hoveredLinkId, setHoveredLinkId] = useState<string | null>(null);

  // Compute graph data
  const { nodes, links, summary } = useMemo(() => {
    return buildThoughtProcessGraph(records);
  }, [records]);

  // Set default selected node
  const activeNode = useMemo(() => {
    if (!selectedNodeId) return nodes[0] || null;
    return nodes.find((n) => n.id === selectedNodeId) || nodes[0] || null;
  }, [selectedNodeId, nodes]);

  // Connections for active node
  const incomingLinks = useMemo(() => {
    if (!activeNode) return [];
    return links.filter((l) => l.targetId === activeNode.id);
  }, [activeNode, links]);

  const outgoingLinks = useMemo(() => {
    if (!activeNode) return [];
    return links.filter((l) => l.sourceId === activeNode.id);
  }, [activeNode, links]);

  const getFeatureIcon = (key: PredictionFeatureKey) => {
    switch (key) {
      case "ai_simulation":
        return <Bot className="w-3.5 h-3.5 text-amber-400" />;
      case "job_risk":
        return <Briefcase className="w-3.5 h-3.5 text-rose-400" />;
      case "butterfly_effect":
        return <GitFork className="w-3.5 h-3.5 text-purple-400" />;
      case "persona_chat":
        return <MessageSquare className="w-3.5 h-3.5 text-cyan-400" />;
      case "personal_roadmap":
        return <User className="w-3.5 h-3.5 text-teal-400" />;
      default:
        return <Sparkles className="w-3.5 h-3.5 text-indigo-400" />;
    }
  };

  const getInfluenceBadge = (type: InfluenceType) => {
    switch (type) {
      case "scenario_counterfactual":
        return { label: isTr ? "Karşıt Senaryo Testi" : "Counterfactual Test", color: "bg-rose-500/20 text-rose-300 border-rose-500/40" };
      case "cross_module_spark":
        return { label: isTr ? "Disiplinlerarası Sıçrama" : "Cross-Module Spark", color: "bg-cyan-500/20 text-cyan-300 border-cyan-500/40" };
      case "temporal_horizon_leap":
        return { label: isTr ? "Zaman Ufku İlerlemesi" : "Horizon Leap", color: "bg-purple-500/20 text-purple-300 border-purple-500/40" };
      case "thematic_drilldown":
        return { label: isTr ? "Kavramsal Derinleşme" : "Thematic Drilldown", color: "bg-emerald-500/20 text-emerald-300 border-emerald-500/40" };
      default:
        return { label: isTr ? "Bilişsel Bağlantı" : "Cognitive Chain", color: "bg-blue-500/20 text-blue-300 border-blue-500/40" };
    }
  };

  if (records.length === 0) {
    return (
      <div className="p-12 rounded-3xl bg-slate-900/50 border border-white/10 text-center space-y-4">
        <Compass className="w-12 h-12 text-slate-500 mx-auto animate-pulse" />
        <h3 className="text-lg font-bold text-white">
          {isTr ? "Bilişsel Keşif Haritası Oluşturulamadı" : "No Thought Process Map Available"}
        </h3>
        <p className="text-xs text-slate-400 max-w-md mx-auto">
          {isTr
            ? "Haritanın oluşması için en az 1 yapay zeka simülasyonu çalıştırmış olmanız gerekmektedir."
            : "Run at least 1 AI simulation to generate your cognitive thought process and query influence map."}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fadeIn">
      
      {/* ================= 1. THOUGHT MAP HEADER & ARCHETYPE CARD ================= */}
      <div className="p-6 rounded-3xl bg-gradient-to-br from-slate-900 via-slate-950 to-slate-900 border border-cyan-500/30 space-y-5 relative overflow-hidden shadow-2xl">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-white/10 pb-5">
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-xs font-mono font-bold">
              <Compass className="w-3.5 h-3.5 animate-spin" />
              <span>{isTr ? "BİLİŞSEL ETKİ & DÜŞÜNCE AKIŞ HARİTASI" : "COGNITIVE THOUGHT-PROCESS MAP"}</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight flex items-center gap-3">
              <span>{summary.archetypeTitle}</span>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-purple-500/20 border border-purple-500/40 text-purple-300 font-mono">
                {links.length} {isTr ? "Nedensellik Bağı" : "Influence Links"}
              </span>
            </h2>
            <p className="text-xs text-slate-400 max-w-2xl">
              {summary.archetypeDescription}
            </p>
          </div>

          {/* Perspective View Switcher */}
          <div className="flex items-center gap-1.5 p-1 bg-slate-950 rounded-2xl border border-white/10 self-start lg:self-auto font-mono text-xs">
            <button
              onClick={() => setActiveMode("flow")}
              className={`px-3 py-1.5 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer ${
                activeMode === "flow"
                  ? "bg-cyan-500 text-slate-950 font-bold shadow-md shadow-cyan-500/20"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <GitBranch className="w-3.5 h-3.5" />
              <span>{isTr ? "Nedensellik Akışı" : "Influence Flow"}</span>
            </button>

            <button
              onClick={() => setActiveMode("network")}
              className={`px-3 py-1.5 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer ${
                activeMode === "network"
                  ? "bg-purple-500 text-white font-bold shadow-md shadow-purple-500/20"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>{isTr ? "Kavramsal Ağ" : "Concept Matrix"}</span>
            </button>

            <button
              onClick={() => setActiveMode("archetype")}
              className={`px-3 py-1.5 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer ${
                activeMode === "archetype"
                  ? "bg-amber-500 text-slate-950 font-bold shadow-md shadow-amber-500/20"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <TrendingUp className="w-3.5 h-3.5" />
              <span>{isTr ? "Merak Profili" : "Curiosity Profile"}</span>
            </button>
          </div>
        </div>

        {/* Telemetry Metrics Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1">
          <div className="p-3 rounded-2xl bg-slate-950/70 border border-white/5 space-y-1">
            <div className="text-[10px] font-mono text-slate-500 uppercase">{isTr ? "Zaman Ufku Aralığı" : "Horizon Span"}</div>
            <div className="text-base font-black text-white font-mono flex items-center gap-1.5">
              <span>{summary.exploredYearSpan.min}</span>
              <ArrowRight className="w-3 h-3 text-cyan-400" />
              <span>{summary.exploredYearSpan.max}</span>
            </div>
            <div className="text-[10px] text-purple-400 font-mono">Ø {summary.exploredYearSpan.average} Ort. Ufuk</div>
          </div>

          <div className="p-3 rounded-2xl bg-slate-950/70 border border-white/5 space-y-1">
            <div className="text-[10px] font-mono text-slate-500 uppercase">{isTr ? "Merak Diverjansı" : "Curiosity Divergence"}</div>
            <div className="text-base font-black text-emerald-400 font-mono">%{summary.curiosityDivergenceScore}</div>
            <div className="text-[10px] text-slate-400 font-mono">{isTr ? "Geniş Disiplinlerarası İnceleme" : "Cross-Disciplinary"}</div>
          </div>

          <div className="p-3 rounded-2xl bg-slate-950/70 border border-white/5 space-y-1">
            <div className="text-[10px] font-mono text-slate-500 uppercase">{isTr ? "Baskın Araştırma Aksı" : "Core Exploration Axis"}</div>
            <div className="text-sm font-bold text-cyan-300 font-mono truncate">{summary.primaryInquiryDriver}</div>
            <div className="text-[10px] text-cyan-400/80 font-mono">🔥 {isTr ? "En Çok Tetiklenen Alan" : "Primary Focus"}</div>
          </div>

          <div className="p-3 rounded-2xl bg-slate-950/70 border border-white/5 space-y-1">
            <div className="text-[10px] font-mono text-slate-500 uppercase">{isTr ? "Kritik Kırılma Noktaları" : "Pivot Milestones"}</div>
            <div className="text-base font-black text-amber-400 font-mono">{summary.criticalPivotNodes.length} Odak</div>
            <div className="text-[10px] text-amber-400/80 font-mono">{isTr ? "Sonraki Sorguları Şekillendiren" : "Catalyst Queries"}</div>
          </div>
        </div>
      </div>

      {/* ================= 2. MAIN INTERACTIVE VISUALIZATION PERSPECTIVES ================= */}
      
      {/* PERSPECTIVE 1: INFLUENCE FLOW STREAM */}
      {activeMode === "flow" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* Left Canvas: Sequential Nodes with Curved Connection Arcs */}
          <div className="lg:col-span-8 p-5 sm:p-6 rounded-3xl bg-slate-900/60 border border-white/10 space-y-5">
            <div className="flex items-center justify-between text-xs font-mono border-b border-white/10 pb-3">
              <span className="text-slate-400 flex items-center gap-1.5">
                <GitBranch className="w-4 h-4 text-cyan-400" />
                <span>{isTr ? "KRONOLOJİK SİMÜLASYON ZİNCİRİ & ETKİ KÖPRÜLERİ" : "CHRONOLOGICAL INQUIRY STREAM"}</span>
              </span>
              <span className="text-[11px] text-slate-500">
                {isTr ? "Düğüm seçerek etki köklerini inceleyin" : "Select node to inspect causal roots"}
              </span>
            </div>

            {/* Nodes Stack */}
            <div className="space-y-3 relative">
              {nodes.map((node, index) => {
                const isSelected = activeNode?.id === node.id;
                const outgoingCount = links.filter((l) => l.sourceId === node.id).length;
                const incomingCount = links.filter((l) => l.targetId === node.id).length;

                return (
                  <div
                    key={`flow-node-${node.id}-${index}`}
                    onClick={() => setSelectedNodeId(node.id)}
                    className={`relative p-4 rounded-2xl border transition-all cursor-pointer ${
                      isSelected
                        ? "bg-slate-900 border-cyan-500 shadow-xl shadow-cyan-500/10 ring-2 ring-cyan-500/20"
                        : "bg-slate-950/70 border-white/10 hover:border-slate-600 hover:bg-slate-900/80"
                    }`}
                  >
                    {/* Top Row: Index, Year, Feature, Tags */}
                    <div className="flex items-center justify-between gap-2 flex-wrap pb-2">
                      <div className="flex items-center gap-2">
                        <span className="w-5 h-5 rounded-full bg-slate-800 text-slate-400 text-[10px] font-mono flex items-center justify-center font-bold">
                          {index + 1}
                        </span>
                        <div className="px-2 py-0.5 rounded-md bg-slate-900 border border-white/10 flex items-center gap-1 text-[11px] font-mono text-white">
                          {getFeatureIcon(node.featureKey)}
                          <span>{node.featureName}</span>
                        </div>
                        <span className="px-2 py-0.5 rounded-md bg-purple-500/20 border border-purple-500/40 text-purple-300 text-xs font-mono font-bold">
                          {node.targetYear} Ufku
                        </span>
                      </div>

                      {/* Connection Stats Badge */}
                      <div className="flex items-center gap-2 text-[10px] font-mono">
                        {incomingCount > 0 && (
                          <span className="text-cyan-400/90" title="Bu simülasyonu tetikleyen önceki sorgular">
                            ↙ {incomingCount} Beslendi
                          </span>
                        )}
                        {outgoingCount > 0 && (
                          <span className="text-amber-400 font-bold" title="Bu simülasyonun tetiklediği sonraki sorgular">
                            ⚡ {outgoingCount} Tetikledi
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Query Title */}
                    <h4 className={`text-sm font-bold transition-colors ${isSelected ? "text-cyan-300" : "text-white"}`}>
                      {node.queryTitle}
                    </h4>

                    <p className="text-xs text-slate-400 line-clamp-1 mt-1 font-sans">
                      {node.summarySnippet || node.generatedOutcome.slice(0, 120)}...
                    </p>

                    {/* Tags */}
                    <div className="flex items-center gap-1.5 flex-wrap pt-2 mt-2 border-t border-white/5">
                      {node.tags.slice(0, 4).map((tag, tIdx) => (
                        <span
                          key={`tag-${node.id}-${tag}-${tIdx}`}
                          className="px-2 py-0.5 rounded bg-slate-900 border border-white/5 text-[10px] text-slate-400 font-mono"
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>

                    {/* Connecting Connector Indicator */}
                    {index < nodes.length - 1 && (
                      <div className="absolute -bottom-3 left-6 z-10 w-0.5 h-3 bg-gradient-to-b from-cyan-500 to-slate-700" />
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right Inspector Panel: Causal Influences for Selected Node */}
          <div className="lg:col-span-4 p-5 sm:p-6 rounded-3xl bg-slate-900/80 border border-cyan-500/30 space-y-5 sticky top-20 shadow-2xl">
            {activeNode ? (
              <div className="space-y-4">
                
                {/* Inspector Header */}
                <div className="space-y-1 pb-3 border-b border-white/10">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono text-cyan-400 uppercase tracking-wider font-bold">
                      {isTr ? "DÜĞÜM ETKİ DENETÇİSİ" : "ACTIVE NODE INSPECTOR"}
                    </span>
                    <span className="text-xs font-mono text-slate-500">{activeNode.category}</span>
                  </div>
                  <h3 className="text-base font-bold text-white">
                    {activeNode.queryTitle}
                  </h3>
                  <div className="text-xs text-slate-400 font-mono">
                    {new Date(activeNode.timestamp).toLocaleDateString("tr-TR")} • {activeNode.targetYear} Ufku
                  </div>
                </div>

                {/* 1. INCOMING INFLUENCES (What sparked this query?) */}
                <div className="space-y-2">
                  <div className="text-xs font-mono text-cyan-300 flex items-center gap-1.5 font-bold">
                    <ArrowRight className="w-3.5 h-3.5 rotate-45 text-cyan-400" />
                    <span>{isTr ? "Bu Sorguyu Tetikleyen Geçmiş Simülasyonlar:" : "Inspired By Past Queries:"}</span>
                  </div>

                  {incomingLinks.length === 0 ? (
                    <div className="p-3 rounded-xl bg-slate-950/60 border border-white/5 text-xs text-slate-500 font-mono">
                      {isTr
                        ? "🌱 Bu simülasyon bağımsız bir başlangıç noktasıdır (Kök Keşif)."
                        : "🌱 Root exploration milestone with no preceding triggers."}
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {incomingLinks.map((link, lIdx) => {
                        const badge = getInfluenceBadge(link.influenceType);
                        return (
                          <div
                            key={`in-link-${link.id}-${link.sourceId}-${lIdx}`}
                            className="p-3 rounded-xl bg-slate-950 border border-cyan-500/20 space-y-1.5 hover:border-cyan-500/40 transition-colors"
                          >
                            <div className="flex items-center justify-between text-[10px] font-mono">
                              <span className={`px-2 py-0.5 rounded border ${badge.color}`}>
                                {badge.label}
                              </span>
                              <span className="text-slate-500 font-mono">+{link.timeDeltaHours}s sonra</span>
                            </div>
                            <div className="text-xs font-bold text-white line-clamp-1">
                              {link.sourceRecord.queryTitle}
                            </div>
                            <p className="text-[11px] text-slate-300 font-sans leading-relaxed">
                              {link.influenceDescription}
                            </p>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* 2. OUTGOING INFLUENCES (What later queries did this trigger?) */}
                <div className="space-y-2 pt-2 border-t border-white/5">
                  <div className="text-xs font-mono text-amber-300 flex items-center gap-1.5 font-bold">
                    <Zap className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
                    <span>{isTr ? "Bu Simülasyonun Tetiklediği Sonraki Sorgular:" : "Triggered Later Queries:"}</span>
                  </div>

                  {outgoingLinks.length === 0 ? (
                    <div className="p-3 rounded-xl bg-slate-950/60 border border-white/5 text-xs text-slate-500 font-mono">
                      {isTr
                        ? "🚀 Henüz bu çıktıyı baz alan yeni bir alt simülasyon çalıştırılmadı."
                        : "🚀 Terminal node in the current thought stream."}
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {outgoingLinks.map((link, lIdx) => {
                        const badge = getInfluenceBadge(link.influenceType);
                        return (
                          <div
                            key={`out-link-${link.id}-${link.targetId}-${lIdx}`}
                            onClick={() => setSelectedNodeId(link.targetId)}
                            className="p-3 rounded-xl bg-slate-950 border border-amber-500/20 space-y-1.5 hover:border-amber-500/50 transition-colors cursor-pointer"
                          >
                            <div className="flex items-center justify-between text-[10px] font-mono">
                              <span className={`px-2 py-0.5 rounded border ${badge.color}`}>
                                {badge.label}
                              </span>
                              <span className="text-amber-400 font-bold">{link.targetRecord.targetYear} Ufku</span>
                            </div>
                            <div className="text-xs font-bold text-white line-clamp-1">
                              {link.targetRecord.queryTitle}
                            </div>
                            <p className="text-[11px] text-slate-300 font-sans leading-relaxed">
                              {link.influenceDescription}
                            </p>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* Action Buttons for Active Node */}
                <div className="pt-3 border-t border-white/10 flex items-center gap-2 flex-wrap">
                  {onSelectRecord && (
                    <button
                      onClick={() => onSelectRecord(activeNode)}
                      className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-mono font-bold flex items-center gap-1.5 transition-all cursor-pointer"
                    >
                      <Eye className="w-3.5 h-3.5 text-cyan-400" />
                      <span>{isTr ? "Sonucu İncele" : "View Outcome"}</span>
                    </button>
                  )}

                  {onRerunRecord && (
                    <button
                      onClick={() => onRerunRecord(activeNode)}
                      className="px-3 py-2 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/40 text-xs font-mono font-bold flex items-center gap-1.5 transition-all cursor-pointer"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>{isTr ? "Parametrelerle Çalıştır" : "Rerun Staged"}</span>
                    </button>
                  )}
                </div>

              </div>
            ) : null}
          </div>

        </div>
      )}

      {/* PERSPECTIVE 2: THEMATIC CONCEPTUAL MATRIX */}
      {activeMode === "network" && (
        <div className="p-6 rounded-3xl bg-slate-900/60 border border-white/10 space-y-6">
          <div className="space-y-1">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Layers className="w-4 h-4 text-purple-400" />
              <span>{isTr ? "Kavramsal Ağ & Disiplinlerarası Kırılma Matrisi" : "Thematic Concept Clusters"}</span>
            </h3>
            <p className="text-xs text-slate-400">
              {isTr
                ? "Simülasyonlarınızın odaklandığı temaların birbirini nasıl beslediğini ve hangi disiplinlerin ağırlık kazandığını izleyin."
                : "Explore how different technological categories cross-pollinated your exploration sequence."}
            </p>
          </div>

          {/* Thematic Cluster Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {summary.thematicClusters.map((cluster, idx) => {
              const clusterNodes = nodes.filter((n) => n.category === cluster.category);
              return (
                <div
                  key={`cluster-${cluster.category}-${idx}`}
                  className="p-5 rounded-2xl bg-slate-950/80 border border-white/10 space-y-3 hover:border-slate-700 transition-all"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-white flex items-center gap-2">
                      <span className="w-3 h-3 rounded-full" style={{ backgroundColor: cluster.color }} />
                      <span>{cluster.category}</span>
                    </span>
                    <span className="text-xs font-mono font-bold text-slate-400">
                      %{cluster.percentage} • {cluster.count} Sorgu
                    </span>
                  </div>

                  {/* Progress bar */}
                  <div className="w-full h-1.5 bg-slate-900 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{ width: `${cluster.percentage}%`, backgroundColor: cluster.color }}
                    />
                  </div>

                  {/* Sample Query Links in this cluster */}
                  <div className="space-y-1.5 pt-2 border-t border-white/5 text-xs">
                    {clusterNodes.slice(0, 3).map((node, nIdx) => (
                      <div
                        key={`cluster-node-${cluster.category}-${node.id}-${nIdx}`}
                        onClick={() => {
                          setSelectedNodeId(node.id);
                          setActiveMode("flow");
                        }}
                        className="p-2 rounded-lg bg-slate-900/60 hover:bg-slate-900 text-slate-300 hover:text-cyan-300 font-mono text-[11px] transition-colors cursor-pointer flex items-center justify-between gap-2"
                      >
                        <span className="truncate">{node.queryTitle}</span>
                        <span className="text-slate-500 shrink-0 font-bold">{node.targetYear}</span>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* PERSPECTIVE 3: CURIOSITY ARCHETYPE & STRATEGY */}
      {activeMode === "archetype" && (
        <div className="p-6 sm:p-8 rounded-3xl bg-slate-900/60 border border-white/10 space-y-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-mono font-bold">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>{isTr ? "KİŞİSEL GELECEK ARAŞTIRMA PROFİLİ" : "EXPLORATION COGNITIVE ARCHETYPE"}</span>
            </div>
            <h3 className="text-xl sm:text-2xl font-extrabold text-white">
              {summary.archetypeTitle}
            </h3>
            <p className="text-sm text-slate-300 max-w-3xl leading-relaxed">
              {summary.archetypeDescription}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
            <div className="p-4 rounded-2xl bg-slate-950 border border-white/5 space-y-2">
              <div className="text-xs font-mono text-cyan-400 font-bold uppercase">{isTr ? "Soru Sorma Tarzı" : "Inquiry Paradigm"}</div>
              <p className="text-xs text-slate-300 leading-relaxed font-sans">
                {isTr
                  ? "Teknolojik gelişmeleri salt soyut olarak değil, iş gücü otomasyonu, enerji darboğazları ve pratik yaşam sonuçlarıyla ilişkilendirerek test ediyorsunuz."
                  : "Pragmatic, multi-layered inquiry pattern focusing on real-world adoption hurdles and human career readiness."}
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-950 border border-white/5 space-y-2">
              <div className="text-xs font-mono text-purple-400 font-bold uppercase">{isTr ? "Ufuk Esnekliği" : "Horizon Flexibility"}</div>
              <p className="text-xs text-slate-300 leading-relaxed font-sans">
                {isTr
                  ? `2026'dan ${summary.exploredYearSpan.max}'a kadar uzanan ${summary.exploredYearSpan.max - summary.exploredYearSpan.min} yıllık geniş bir zaman ekseninde düşünce simülasyonları yürütüyorsunuz.`
                  : `Broad temporal spectrum encompassing near-term breakthroughs to long-range post-human frontiers.`}
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-950 border border-white/5 space-y-2">
              <div className="text-xs font-mono text-emerald-400 font-bold uppercase">{isTr ? "Aksiyonel Tavsiye" : "Strategic Recommendation"}</div>
              <p className="text-xs text-slate-300 leading-relaxed font-sans">
                {isTr
                  ? "Kişisel Yol Haritanızda 2035 sonrası BCI (Beyin-Bilgisayar Arayüzleri) ve Kuantum Kriptografi odaklı beceri setlerini önceliklendirin."
                  : "Prioritize neuro-symbolic and quantum security orchestration competencies in your long-term personal roadmap."}
              </p>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
