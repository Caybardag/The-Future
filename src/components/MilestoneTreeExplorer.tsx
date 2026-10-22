import React, { useState } from "react";
import { Milestone, SubMilestoneBranch, DetailedParametricAuditResult } from "../types";
import { aiService } from "../services/AIService";
import { useAuth } from "../context/AuthContext";
import {
  GitBranch,
  ShieldCheck,
  AlertTriangle,
  Zap,
  RefreshCw,
  Sparkles,
  ChevronRight,
  ExternalLink,
  ChevronDown,
  Layers,
  ArrowDownRight,
  Cpu,
  Flame,
  CheckCircle2,
  XCircle,
  HelpCircle
} from "lucide-react";

interface MilestoneTreeExplorerProps {
  milestone: Milestone;
  onSelectMilestoneYear?: (year: number) => void;
  onOpenAuditForMilestone?: (milestone: Milestone) => void;
}

export const MilestoneTreeExplorer: React.FC<MilestoneTreeExplorerProps> = ({
  milestone,
  onSelectMilestoneYear,
  onOpenAuditForMilestone,
}) => {
  const { deductCredits, openCreditStore } = useAuth();

  // Sub-branches state
  const [branches, setBranches] = useState<SubMilestoneBranch[]>(() => {
    try {
      const saved = localStorage.getItem(`milestone_tree_branches_${milestone.year}`);
      return saved ? JSON.parse(saved) : (milestone.subBranches || []);
    } catch {
      return milestone.subBranches || [];
    }
  });

  const [isExpanding, setIsExpanding] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [activeBranchId, setActiveBranchId] = useState<string | null>(null);

  // Deep recursive expand for any branch
  const [expandedSubSub, setExpandedSubSub] = useState<Record<string, SubMilestoneBranch[]>>({});
  const [expandingSubId, setExpandingSubId] = useState<string | null>(null);

  // Trigger Dynamic Tree Expansion via Gemini 3.7 Flash + Google Search
  const handleExpandTree = async () => {
    // 5 credits for deep real-time scientific branching
    if (!deductCredits(5)) {
      setErrorMsg("Alt dalları ve nedensellik ağını genişletmek için 5 Kredi gereklidir.");
      if (openCreditStore) openCreditStore();
      return;
    }

    setIsExpanding(true);
    setErrorMsg(null);

    try {
      const res = await aiService.expandMilestoneTree(milestone);
      if (res.success && res.branches && res.branches.length > 0) {
        setBranches(res.branches);
        try {
          localStorage.setItem(`milestone_tree_branches_${milestone.year}`, JSON.stringify(res.branches));
        } catch {}
      } else {
        setErrorMsg(res.error || "Alt dallar türetilemedi. Lütfen tekrar deneyin.");
      }
    } catch (e: any) {
      setErrorMsg(e.message || "Ağ genişletilirken beklenmeyen bir hata oluştu.");
    } finally {
      setIsExpanding(false);
    }
  };

  // Recursive second-level expand
  const handleExpandSubBranch = async (sub: SubMilestoneBranch) => {
    if (!deductCredits(5)) {
      setErrorMsg("Bu alt dalı daha da derinleştirmek için 5 Kredi gereklidir.");
      if (openCreditStore) openCreditStore();
      return;
    }

    setExpandingSubId(sub.id);
    setErrorMsg(null);

    try {
      const dummyMilestone: any = {
        year: sub.year,
        title: sub.title,
        description: sub.description,
        category: sub.category,
      };

      const res = await aiService.expandMilestoneTree(dummyMilestone);
      if (res.success && res.branches && res.branches.length > 0) {
        setExpandedSubSub((prev) => ({ ...prev, [sub.id]: res.branches! }));
      }
    } catch (e: any) {
      setErrorMsg("Alt dal derinleştirme hatası: " + e.message);
    } finally {
      setExpandingSubId(null);
    }
  };

  return (
    <div className="bg-[#080d1a] border border-cyan-500/30 rounded-2xl p-5 lg:p-6 space-y-5 font-mono text-slate-200 shadow-2xl relative overflow-hidden mt-6">
      
      {/* Header bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 pb-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-cyan-950/80 border border-cyan-400/40 text-cyan-300 shadow-md">
            <GitBranch className="w-5 h-5 text-cyan-400" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-cyan-400 bg-cyan-950/60 px-2 py-0.5 rounded border border-cyan-500/30">
                DİNAMİK TEKNOLOJİK NEDENSELLİK AĞI (RECURSIVE DAG)
              </span>
              <span className="text-[10px] font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/30">
                ⚡ 5 Kredi
              </span>
            </div>
            <h4 className="text-base font-bold text-white mt-0.5">
              {milestone.year} — Alt Kırılmalar, Ön Koşullar & Türev Dallar
            </h4>
          </div>
        </div>

        {/* Action Button: Live Expand */}
        <button
          onClick={handleExpandTree}
          disabled={isExpanding}
          className="px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-600 via-blue-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 text-slate-950 font-bold text-xs transition-all shadow-lg shadow-cyan-500/20 flex items-center gap-2 cursor-pointer disabled:opacity-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isExpanding ? "animate-spin" : ""}`} />
          <span>{isExpanding ? "Nedensellik Ağı Türetiliyor..." : "Alt Dalları ve Kırılmaları Keşfet"}</span>
        </button>
      </div>

      {errorMsg && (
        <div className="p-3 bg-amber-950/60 border border-amber-500/40 rounded-xl text-amber-200 text-xs flex items-center justify-between">
          <span>{errorMsg}</span>
          <button onClick={() => setErrorMsg(null)} className="text-amber-400 font-bold ml-2">✕</button>
        </div>
      )}

      {/* When no branches exist yet */}
      {branches.length === 0 && !isExpanding && (
        <div className="p-6 rounded-xl bg-slate-950/60 border border-dashed border-white/10 text-center space-y-3">
          <Layers className="w-8 h-8 text-cyan-400/60 mx-auto" />
          <p className="text-xs text-slate-400 max-w-md mx-auto">
            Bu dönüm noktası ({milestone.title}) için henüz alt nedensellik dalları açılmadı. 
            Derin bilişsel analiz ve kanıta dayalı fütüroloji motoruyla <strong>ön koşul fiziksel gereksinimleri, malzeme/çip darboğazlarını ve doğuracağı türev pazarları</strong> anında keşfedin.
          </p>
          <button
            onClick={handleExpandTree}
            className="px-4 py-2 rounded-xl bg-cyan-950 hover:bg-cyan-900 border border-cyan-500/40 text-cyan-300 text-xs font-bold transition-all inline-flex items-center gap-2 cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
            <span>Alt Dalları Canlı Olarak Türet (5 Kredi)</span>
          </button>
        </div>
      )}

      {/* Render Sub-Milestone Branches */}
      {branches.length > 0 && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            {branches.map((branch, bIdx) => {
              const isSelected = activeBranchId === branch.id;
              const subSubs = expandedSubSub[branch.id] || [];
              const isExpandingThis = expandingSubId === branch.id;

              return (
                <div
                  key={branch.id ? `${branch.id}-${bIdx}` : `branch-${bIdx}`}
                  className={`p-4 rounded-xl border transition-all flex flex-col justify-between space-y-3 ${
                    isSelected
                      ? "bg-slate-900 border-cyan-400/70 shadow-lg shadow-cyan-500/10"
                      : "bg-slate-950/90 border-white/10 hover:border-cyan-500/40"
                  }`}
                >
                  <div className="space-y-2">
                    {/* Top Type & Year Tag */}
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-1.5">
                        <span className="text-sm font-black text-cyan-400">
                          {branch.year}
                        </span>
                        <span
                          className={`text-[9px] font-bold px-2 py-0.5 rounded border uppercase ${
                            branch.dependencyType === "prerequisite"
                              ? "bg-emerald-500/15 text-emerald-300 border-emerald-500/30"
                              : branch.dependencyType === "engineering_bottleneck"
                              ? "bg-rose-500/15 text-rose-300 border-rose-500/30"
                              : branch.dependencyType === "breakthrough_trigger"
                              ? "bg-purple-500/15 text-purple-300 border-purple-500/30"
                              : "bg-blue-500/15 text-blue-300 border-blue-500/30"
                          }`}
                        >
                          {branch.dependencyType === "prerequisite"
                            ? "🔑 Ön Koşul Altyapı"
                            : branch.dependencyType === "engineering_bottleneck"
                            ? "⚠️ Mühendislik Darboğazı"
                            : branch.dependencyType === "breakthrough_trigger"
                            ? "🚀 Türetilmiş Kırılma"
                            : "🌐 Yeni Doğan Disiplin"}
                        </span>
                      </div>

                      <div className="flex items-center gap-2 text-[10px] text-slate-400">
                        <span className="text-emerald-400 font-bold">Aşama {branch.trlLevel}/9</span>
                        <span>|</span>
                        <span className="text-cyan-300 font-bold">%{branch.probability} Olasılık</span>
                      </div>
                    </div>

                    {/* Title & Description */}
                    <div>
                      <h5 className="text-xs font-bold text-white leading-snug">
                        {branch.title}
                      </h5>
                      <p className="text-[11px] text-slate-300 mt-1 font-sans leading-relaxed">
                        {branch.description}
                      </p>
                    </div>

                    {/* Critical Parameters */}
                    {branch.criticalParameters && branch.criticalParameters.length > 0 && (
                      <div className="bg-slate-900/90 p-2.5 rounded-lg border border-white/5 space-y-1 text-[10px]">
                        <div className="text-[9px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1">
                          <Cpu className="w-3 h-3 text-cyan-400" />
                          <span>Kritik Eşik & Parametre:</span>
                        </div>
                        {branch.criticalParameters.map((p, pIdx) => (
                          <div key={pIdx} className="flex items-center justify-between text-slate-300">
                            <span className="font-semibold">{p.name}:</span>
                            <span className={p.isBottleneck ? "text-rose-400 font-bold" : "text-emerald-400"}>
                              {p.targetValue} ({p.current2026Status})
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Branch Action Toolbar */}
                  <div className="pt-2 border-t border-white/5 flex flex-wrap items-center justify-between gap-2">
                    {/* Sources Badge */}
                    <div className="flex items-center gap-1 text-[10px] text-slate-500">
                      <span>📄 {branch.scientificSources?.join(", ") || "Bilimsel Arxiv"}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      {/* Recursive Deep Expand Button */}
                      <button
                        onClick={() => handleExpandSubBranch(branch)}
                        disabled={isExpandingThis}
                        className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 border border-white/10 text-[10px] text-cyan-300 hover:text-white font-bold transition-all flex items-center gap-1 cursor-pointer disabled:opacity-50"
                        title="Bu alt başlığı daha derin bir seviyeye dallandırın"
                      >
                        <RefreshCw className={`w-2.5 h-2.5 ${isExpandingThis ? "animate-spin" : ""}`} />
                        <span>{isExpandingThis ? "Açılıyor..." : "+ Derinleştir (5 Kredi)"}</span>
                      </button>

                      {onSelectMilestoneYear && (
                        <button
                          onClick={() => onSelectMilestoneYear(branch.year)}
                          className="px-2.5 py-1 rounded bg-cyan-950 hover:bg-cyan-900 border border-cyan-500/40 text-[10px] text-cyan-300 font-bold transition-all flex items-center gap-1 cursor-pointer"
                          title="Zaman çizelgesinde bu yıla odaklanın"
                        >
                          <span>{branch.year}'e Git</span>
                          <ArrowDownRight className="w-2.5 h-2.5" />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Level-2 Recursive Sub-Branches Rendering */}
                  {subSubs.length > 0 && (
                    <div className="mt-3 pt-3 border-t border-cyan-500/20 space-y-2 bg-slate-900/80 p-3 rounded-lg">
                      <div className="text-[10px] font-bold text-cyan-400 flex items-center gap-1">
                        <Layers className="w-3 h-3" />
                        <span>Derinleştirilmiş 2. Seviye Alt Kırılmalar ({subSubs.length}):</span>
                      </div>
                      <div className="space-y-1.5">
                        {subSubs.map((ss, ssIdx) => (
                          <div key={`sub-sub-branch-${ss.id || 'branch'}-${ssIdx}`} className="p-2 rounded bg-slate-950 border border-white/5 text-[10px] space-y-0.5">
                            <div className="flex items-center justify-between text-cyan-300 font-bold">
                              <span>{ss.year} - {ss.title}</span>
                              <span className="text-emerald-400 font-normal">Aşama {ss.trlLevel}/9</span>
                            </div>
                            <p className="text-slate-400 text-[9px] font-sans">{ss.description}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

    </div>
  );
};
