import React, { useState, useMemo } from "react";
import { Milestone, SubMilestoneBranch } from "../types";
import { buildAndPropagateCausalDag, DagPropagationResult, DagNode } from "../utils/causalDagEngine";
import { useAuth } from "../context/AuthContext";
import {
  Network,
  GitBranch,
  ShieldCheck,
  AlertTriangle,
  Zap,
  RefreshCw,
  Sparkles,
  TrendingUp,
  Activity,
  Cpu,
  Layers,
  ArrowRight,
  ChevronRight,
  Play,
  RotateCcw,
  CheckCircle2,
  Gauge
} from "lucide-react";

interface CausalDagMatrixVisualizerProps {
  milestones: Milestone[];
  onSelectMilestone?: (milestone: Milestone) => void;
}

export const CausalDagMatrixVisualizer: React.FC<CausalDagMatrixVisualizerProps> = ({
  milestones,
  onSelectMilestone,
}) => {
  const { deductCredits, openCreditStore } = useAuth();

  // User-driven mathematical DAG simulation states
  const [userAccelerations, setUserAccelerations] = useState<Record<string, number>>({});
  const [resolvedBottlenecks, setResolvedBottlenecks] = useState<Record<string, boolean>>({});
  const [selectedNodeId, setSelectedNodeId] = useState<string>("milestone-2029");
  const [filterCategory, setFilterCategory] = useState<string>("all");

  // Load dynamically expanded branches from localStorage
  const dynamicBranchesMap = useMemo(() => {
    const map: Record<number, SubMilestoneBranch[]> = {};
    milestones.forEach((m) => {
      try {
        const saved = localStorage.getItem(`milestone_tree_branches_${m.year}`);
        if (saved) {
          map[m.year] = JSON.parse(saved);
        } else if (m.subBranches && m.subBranches.length > 0) {
          map[m.year] = m.subBranches;
        }
      } catch {}
    });
    return map;
  }, [milestones]);

  // Compute live mathematical DAG state
  const dagResult: DagPropagationResult = useMemo(() => {
    return buildAndPropagateCausalDag(
      milestones,
      dynamicBranchesMap,
      userAccelerations,
      resolvedBottlenecks
    );
  }, [milestones, dynamicBranchesMap, userAccelerations, resolvedBottlenecks]);

  const selectedNode: DagNode | undefined = dagResult.nodes[selectedNodeId] || Object.values(dagResult.nodes)[0];

  // Resolve bottleneck handler
  const handleToggleResolveBottleneck = (nodeId: string) => {
    setResolvedBottlenecks((prev) => ({
      ...prev,
      [nodeId]: !prev[nodeId],
    }));
  };

  // Acceleration boost slider handler
  const handleBoostAcceleration = (nodeId: string, delta: number) => {
    setUserAccelerations((prev) => {
      const current = prev[nodeId] || 0;
      const nextVal = Math.max(0, Math.min(60, current + delta));
      return { ...prev, [nodeId]: nextVal };
    });
  };

  // Reset simulation
  const handleResetSimulation = () => {
    setUserAccelerations({});
    setResolvedBottlenecks({});
  };

  // Filtered nodes list for graph visualization
  const displayedNodes = useMemo(() => {
    const list = Object.values(dagResult.nodes);
    if (filterCategory === "all") return list;
    return list.filter((n) => n.category.toLowerCase().includes(filterCategory.toLowerCase()));
  }, [dagResult.nodes, filterCategory]);

  return (
    <div className="space-y-6 max-w-7xl mx-auto font-mono text-slate-200">
      
      {/* 🔮 TOP CONTROL & MATHEMATICAL TELEMETRY BANNER */}
      <div className="bg-gradient-to-r from-slate-950 via-[#070e1e] to-slate-950 border border-cyan-500/30 rounded-2xl p-5 lg:p-7 shadow-2xl space-y-4">
        
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-cyan-950/80 border border-cyan-400/40 text-cyan-300 shadow-md">
              <Network className="w-6 h-6 text-cyan-400 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-cyan-300 bg-cyan-950/80 px-2 py-0.5 rounded border border-cyan-500/30">
                  MATEMATİKSEL NEDENSELLİK & ETKİ GRAFİĞİ (DAG ENGINE)
                </span>
                <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/30">
                  Bayesian Olasılık İletimi
                </span>
              </div>
              <h2 className="text-xl lg:text-2xl font-bold text-white mt-1">
                Kırılma Zincirleri ve Dalgalanma Simülatörü
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleResetSimulation}
              className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-white/10 text-xs font-bold text-slate-300 flex items-center gap-1.5 transition-all cursor-pointer"
              title="Tüm kullanıcı hızlandırma ve darboğaz çözümlerini sıfırla"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Simülasyonu Sıfırla</span>
            </button>
          </div>
        </div>

        {/* 4 Mathematical Global Telemetry Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          
          <div className="p-3.5 rounded-xl bg-slate-950/90 border border-white/10 space-y-1">
            <div className="text-[10px] text-slate-400 flex items-center justify-between">
              <span>SİSTEM ENTROPİSİ</span>
              <Activity className="w-3 h-3 text-cyan-400" />
            </div>
            <div className="text-xl font-black text-cyan-300">
              {dagResult.systemEntropy} <span className="text-[10px] font-normal text-slate-400">ΔE</span>
            </div>
            <p className="text-[9px] text-slate-400 font-sans">Düşük entropi = Yüksek kararlılık</p>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-950/90 border border-white/10 space-y-1">
            <div className="text-[10px] text-slate-400 flex items-center justify-between">
              <span>ORTALAMA ULAŞILABİLİRLİK</span>
              <Gauge className="w-3 h-3 text-emerald-400" />
            </div>
            <div className="text-xl font-black text-emerald-400">
              %{dagResult.averageFeasibilityScore}
            </div>
            <p className="text-[9px] text-slate-400 font-sans">Kolektif olasılık ortalaması</p>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-950/90 border border-white/10 space-y-1">
            <div className="text-[10px] text-slate-400 flex items-center justify-between">
              <span>AKTİF DARBOĞAZLAR</span>
              <AlertTriangle className="w-3 h-3 text-rose-400" />
            </div>
            <div className="text-xl font-black text-rose-400">
              {dagResult.totalBottlenecksCount} <span className="text-[10px] font-normal text-slate-400">Adet</span>
            </div>
            <p className="text-[9px] text-slate-400 font-sans">Zinciri geciktiren kritik engeller</p>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-950/90 border border-white/10 space-y-1">
            <div className="text-[10px] text-slate-400 flex items-center justify-between">
              <span>ZAMAN SAPMASI (DRIFT)</span>
              <TrendingUp className="w-3 h-3 text-purple-400" />
            </div>
            <div className="text-xl font-black text-purple-300">
              ±{dagResult.driftSummary.maxYearShift} Yıl
            </div>
            <p className="text-[9px] text-slate-400 font-sans">
              {dagResult.driftSummary.acceleratedCount} Öne Alındı, {dagResult.driftSummary.delayedCount} Ertelendi
            </p>
          </div>

        </div>

      </div>

      {/* 🧭 DUAL PANEL: LEFT INTERACTIVE DAG MATRIX / RIGHT CAUSAL NODE INSPECTOR */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* LEFT 2 COLUMNS: NODE GRID & MATRIX */}
        <div className="lg:col-span-2 space-y-4">
          
          <div className="flex flex-wrap items-center justify-between gap-2 bg-slate-950 p-3 rounded-xl border border-white/10 text-xs">
            <div className="flex items-center gap-2">
              <Layers className="w-4 h-4 text-cyan-400" />
              <span className="font-bold text-white">Nedensellik Düğümleri ({displayedNodes.length}):</span>
            </div>

            {/* Filter buttons */}
            <div className="flex flex-wrap items-center gap-1">
              {["all", "Yapay Zeka", "Enerji", "Biyoteknoloji", "Robotik", "Kuantum"].map((cat, catIdx) => (
                <button
                  key={`dag-cat-${cat}-${catIdx}`}
                  onClick={() => setFilterCategory(cat)}
                  className={`px-2.5 py-1 rounded text-[10px] font-bold transition-all cursor-pointer ${
                    filterCategory === cat
                      ? "bg-cyan-500 text-slate-950"
                      : "bg-slate-900 text-slate-400 hover:text-white"
                  }`}
                >
                  {cat === "all" ? "Tümü" : cat}
                </button>
              ))}
            </div>
          </div>

          {/* Causal Node Matrix */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[640px] overflow-y-auto pr-1">
            {displayedNodes.map((node, nIdx) => {
              const isSelected = selectedNodeId === node.id;
              const hasDrift = node.adjustedYear !== node.originalYear;
              const isBoosted = node.accelerationBoost > 0;

              return (
                <div
                  key={`dag-node-${node.id || 'node'}-${nIdx}`}
                  onClick={() => setSelectedNodeId(node.id)}
                  className={`p-4 rounded-xl border transition-all cursor-pointer flex flex-col justify-between space-y-3 ${
                    isSelected
                      ? "bg-slate-900 border-cyan-400 ring-2 ring-cyan-500/20 shadow-lg shadow-cyan-500/10"
                      : node.isBottleneck
                      ? "bg-slate-950/90 border-rose-500/40 hover:border-rose-400"
                      : "bg-slate-950/80 border-white/10 hover:border-cyan-500/40"
                  }`}
                >
                  <div className="space-y-2">
                    
                    {/* Top Row: Year, Category & Probability */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <span className={`text-base font-black ${hasDrift ? "text-amber-400" : "text-cyan-400"}`}>
                          {node.adjustedYear}
                        </span>
                        {hasDrift && (
                          <span className="text-[10px] text-slate-500 line-through">
                            {node.originalYear}
                          </span>
                        )}
                        <span className="text-[9px] px-1.5 py-0.5 rounded bg-slate-900 border border-white/10 text-slate-400">
                          {node.category}
                        </span>
                      </div>

                      <div className="flex items-center gap-1">
                        <span className="text-xs font-bold text-emerald-400">
                          %{node.dynamicProbability}
                        </span>
                        {isBoosted && (
                          <span className="text-[9px] font-bold text-amber-400 bg-amber-500/10 px-1 rounded">
                            +{node.accelerationBoost}%
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Title */}
                    <h4 className="text-xs font-bold text-white line-clamp-2 leading-snug">
                      {node.title}
                    </h4>

                    {/* Status badges */}
                    <div className="flex flex-wrap items-center gap-1.5 text-[9px]">
                      <span className="text-slate-400 bg-slate-900 px-1.5 py-0.5 rounded">
                        Aşama {node.trlLevel}/9
                      </span>

                      {node.isBottleneck ? (
                        <span className="bg-rose-500/20 text-rose-300 border border-rose-500/40 px-1.5 py-0.5 rounded font-bold flex items-center gap-1">
                          <AlertTriangle className="w-2.5 h-2.5" /> Darboğaz
                        </span>
                      ) : (
                        <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 px-1.5 py-0.5 rounded">
                          ✓ Dengeli
                        </span>
                      )}

                      {node.parents.length > 0 && (
                        <span className="text-cyan-400 bg-cyan-950/60 px-1.5 py-0.5 rounded">
                          🔗 {node.parents.length} Ön Koşul
                        </span>
                      )}
                    </div>

                  </div>

                  {/* Bottom Causal Connectors Bar */}
                  <div className="pt-2 border-t border-white/5 flex items-center justify-between text-[10px] text-slate-400">
                    <span>{node.children.length} Alt Kırılmayı Tetikler</span>
                    <span className="text-cyan-400 font-bold flex items-center gap-0.5">
                      İncele <ChevronRight className="w-3 h-3" />
                    </span>
                  </div>

                </div>
              );
            })}
          </div>

        </div>

        {/* RIGHT COLUMN: CAUSAL NODE INSPECTOR & MATHEMATICAL CONTROL PANEL */}
        {selectedNode && (
          <div className="space-y-4 bg-slate-950 border border-cyan-500/30 rounded-2xl p-5 lg:p-6 shadow-xl">
            
            <div className="border-b border-white/10 pb-3 space-y-1">
              <div className="flex items-center justify-between text-[10px] text-slate-400">
                <span className="text-cyan-400 font-bold uppercase">DÜĞÜM İNCELEYİCİ</span>
                <span>ID: {selectedNode.id}</span>
              </div>
              <h3 className="text-sm font-bold text-white leading-snug">
                {selectedNode.adjustedYear} — {selectedNode.title}
              </h3>
              <p className="text-[11px] text-slate-400">{selectedNode.category}</p>
            </div>

            {/* Dynamic Probability & TRL Gauges */}
            <div className="grid grid-cols-2 gap-2 bg-slate-900/80 p-3 rounded-xl border border-white/5 text-xs">
              <div>
                <span className="text-[10px] text-slate-400 block">DİNAMİK OLASILIK:</span>
                <span className="text-lg font-black text-cyan-300">
                  %{selectedNode.dynamicProbability}
                </span>
                <div className="w-full bg-slate-950 rounded-full h-1 mt-1">
                  <div
                    className="bg-cyan-400 h-1 rounded-full"
                    style={{ width: `${selectedNode.dynamicProbability}%` }}
                  />
                </div>
              </div>

              <div>
                <span className="text-[10px] text-slate-400 block">GELİŞİM AŞAMASI:</span>
                <span className="text-lg font-black text-emerald-400">
                  Aşama {selectedNode.trlLevel} / 9
                </span>
                <div className="w-full bg-slate-950 rounded-full h-1 mt-1">
                  <div
                    className="bg-emerald-400 h-1 rounded-full"
                    style={{ width: `${(selectedNode.trlLevel / 9) * 100}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Simulation Interventions (Resolve Bottleneck & R&D Boost) */}
            <div className="space-y-3 pt-2">
              <div className="text-[10px] font-bold text-cyan-400 uppercase tracking-wider">
                🧪 Nedensellik Müdahalesi & Simülasyon:
              </div>

              {/* Bottleneck Resolver Button */}
              {selectedNode.isBottleneck ? (
                <button
                  onClick={() => handleToggleResolveBottleneck(selectedNode.id)}
                  className="w-full py-2 px-3 rounded-xl bg-rose-950 hover:bg-rose-900 border border-rose-500/50 text-rose-200 text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-rose-500/10"
                >
                  <AlertTriangle className="w-4 h-4 text-rose-400" />
                  <span>Darboğazı Çöz & Zinciri Rahatlat</span>
                </button>
              ) : resolvedBottlenecks[selectedNode.id] ? (
                <button
                  onClick={() => handleToggleResolveBottleneck(selectedNode.id)}
                  className="w-full py-2 px-3 rounded-xl bg-emerald-950/80 border border-emerald-500/50 text-emerald-300 text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>Darboğaz Çözüldü (Geri Al)</span>
                </button>
              ) : null}

              {/* R&D Acceleration Slider / Stepper */}
              <div className="bg-slate-900 p-3 rounded-xl border border-white/5 space-y-2 text-xs">
                <div className="flex items-center justify-between text-slate-300">
                  <span className="text-[11px]">⚡ AR-GE / Öncelik İvmesi:</span>
                  <span className="font-bold text-amber-400">+{selectedNode.accelerationBoost}%</span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleBoostAcceleration(selectedNode.id, -10)}
                    className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-300 cursor-pointer"
                  >
                    -10%
                  </button>
                  <button
                    onClick={() => handleBoostAcceleration(selectedNode.id, 10)}
                    className="flex-1 py-1 rounded bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-slate-950 font-bold text-xs cursor-pointer text-center"
                  >
                    +10% İvme Kazandır
                  </button>
                </div>
              </div>
            </div>

            {/* Prerequisites (Parents) List */}
            <div className="space-y-2 pt-2 border-t border-white/10">
              <div className="text-[10px] font-bold text-slate-400 uppercase">
                ⬅️ Gerekli Ön Koşullar ({selectedNode.parents.length}):
              </div>
              {selectedNode.parents.length === 0 ? (
                <p className="text-[10px] text-slate-500 italic">Temel bağımsız kök teknoloji.</p>
              ) : (
                <div className="space-y-1.5">
                  {selectedNode.parents.map((pId, idx) => {
                    const pNode = dagResult.nodes[pId];
                    if (!pNode) return null;
                    return (
                      <div
                        key={`parent-${pId}-${idx}`}
                        onClick={() => setSelectedNodeId(pId)}
                        className="p-2 rounded bg-slate-900/90 border border-white/5 hover:border-cyan-500/40 text-[10px] flex items-center justify-between cursor-pointer"
                      >
                        <span className="text-slate-300 font-semibold truncate">
                          {pNode.adjustedYear} — {pNode.title}
                        </span>
                        <span className="text-cyan-400 font-bold ml-1">%{pNode.dynamicProbability}</span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Downstream Triggers (Children) List */}
            <div className="space-y-2 pt-2 border-t border-white/10">
              <div className="text-[10px] font-bold text-purple-400 uppercase">
                ➡️ Tetiklediği Türev Kırılmalar ({selectedNode.children.length}):
              </div>
              {selectedNode.children.length === 0 ? (
                <p className="text-[10px] text-slate-500 italic">Uç yaprak düğüm.</p>
              ) : (
                <div className="space-y-1.5">
                  {selectedNode.children.map((cId, idx) => {
                    const cNode = dagResult.nodes[cId];
                    if (!cNode) return null;
                    return (
                      <div
                        key={`child-${cId}-${idx}`}
                        onClick={() => setSelectedNodeId(cId)}
                        className="p-2 rounded bg-slate-900/90 border border-white/5 hover:border-purple-500/40 text-[10px] flex items-center justify-between cursor-pointer"
                      >
                        <span className="text-slate-300 font-semibold truncate">
                          {cNode.adjustedYear} — {cNode.title}
                        </span>
                        <span className="text-purple-400 font-bold ml-1">%{cNode.dynamicProbability}</span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Navigation Button */}
            {onSelectMilestone && (
              <button
                onClick={() => {
                  const m = milestones.find((item) => `milestone-${item.year}` === selectedNode.id);
                  if (m) onSelectMilestone(m);
                }}
                className="w-full py-2 px-3 rounded-xl bg-cyan-950 hover:bg-cyan-900 border border-cyan-500/40 text-cyan-300 text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer mt-2"
              >
                <span>Bu Teknolojinin Detayına Git</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}

          </div>
        )}

      </div>

    </div>
  );
};
