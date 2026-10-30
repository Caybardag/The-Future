import React, { useState } from "react";
import { Milestone } from "../types";
import { GitCompare, Sparkles, TrendingUp, Cpu, ShieldAlert, CheckCircle2, ArrowRight } from "lucide-react";

interface ComparisonToolProps {
  milestones: Milestone[];
}

export const ComparisonTool: React.FC<ComparisonToolProps> = ({ milestones }) => {
  const [leftYear, setLeftYear] = useState<number>(milestones[0]?.year || 2026);
  const [rightYear, setRightYear] = useState<number>(milestones[1]?.year || 2029);

  const leftMilestone = milestones.find((m) => m.year === leftYear) || milestones[0];
  const rightMilestone = milestones.find((m) => m.year === rightYear) || milestones[1] || milestones[0];

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-6">
      <div className="bg-slate-900/80 border border-purple-500/20 rounded-3xl p-6 shadow-xl backdrop-blur-md">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/10 pb-4 mb-6">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-purple-500/20 text-purple-400 border border-purple-500/30">
              <GitCompare className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-white">Dönüm Noktası Karşılaştırma Matrisi</h2>
              <p className="text-xs text-slate-400">İki farklı teknolojik kırılmayı yan yana kıyaslayın ve domino etkilerini inceleyin.</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Left Selection */}
          <div className="bg-slate-950/70 border border-white/10 rounded-2xl p-5 space-y-4">
            <label className="block text-xs font-mono uppercase text-slate-400">1. Dönüm Noktası</label>
            <select
              value={leftYear}
              onChange={(e) => setLeftYear(Number(e.target.value))}
              aria-label="1. Dönüm Noktası Seçimi"
              className="w-full bg-slate-900 border border-white/20 rounded-xl px-3 py-2 text-white text-sm"
            >
              {milestones.map((m) => (
                <option key={`left_${m.year}`} value={m.year}>
                  {m.year} — {m.title}
                </option>
              ))}
            </select>

            {leftMilestone && (
              <div className="space-y-3 pt-2">
                <div className="p-3 rounded-xl bg-purple-950/30 border border-purple-500/20">
                  <span className="text-[10px] text-purple-400 font-bold uppercase">{leftMilestone.category}</span>
                  <h4 className="text-base font-bold text-white">{leftMilestone.title}</h4>
                  <p className="text-xs text-slate-300 mt-1">{leftMilestone.description}</p>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                  <div className="p-2.5 rounded-lg bg-white/5 border border-white/5">
                    <span className="text-slate-400 text-[10px]">Olasılık</span>
                    <p className="text-emerald-400 font-bold">%{leftMilestone.probability}</p>
                  </div>
                  <div className="p-2.5 rounded-lg bg-white/5 border border-white/5">
                    <span className="text-slate-400 text-[10px]">Etki Seviyesi</span>
                    <p className="text-blue-400 font-bold">%{leftMilestone.impactLevel}</p>
                  </div>
                  <div className="p-2.5 rounded-lg bg-white/5 border border-white/5">
                    <span className="text-slate-400 text-[10px]">AI Otonomi</span>
                    <p className="text-purple-400 font-bold">%{leftMilestone.aiAutonomyIndex || 50}</p>
                  </div>
                  <div className="p-2.5 rounded-lg bg-white/5 border border-white/5">
                    <span className="text-slate-400 text-[10px]">İnsan Artırımı</span>
                    <p className="text-cyan-400 font-bold">%{leftMilestone.humanAugmentationIndex || 50}</p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Right Selection */}
          <div className="bg-slate-950/70 border border-white/10 rounded-2xl p-5 space-y-4">
            <label className="block text-xs font-mono uppercase text-slate-400">2. Dönüm Noktası</label>
            <select
              value={rightYear}
              onChange={(e) => setRightYear(Number(e.target.value))}
              aria-label="2. Dönüm Noktası Seçimi"
              className="w-full bg-slate-900 border border-white/20 rounded-xl px-3 py-2 text-white text-sm"
            >
              {milestones.map((m) => (
                <option key={`right_${m.year}`} value={m.year}>
                  {m.year} — {m.title}
                </option>
              ))}
            </select>

            {rightMilestone && (
              <div className="space-y-3 pt-2">
                <div className="p-3 rounded-xl bg-blue-950/30 border border-blue-500/20">
                  <span className="text-[10px] text-blue-400 font-bold uppercase">{rightMilestone.category}</span>
                  <h4 className="text-base font-bold text-white">{rightMilestone.title}</h4>
                  <p className="text-xs text-slate-300 mt-1">{rightMilestone.description}</p>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                  <div className="p-2.5 rounded-lg bg-white/5 border border-white/5">
                    <span className="text-slate-400 text-[10px]">Olasılık</span>
                    <p className="text-emerald-400 font-bold">%{rightMilestone.probability}</p>
                  </div>
                  <div className="p-2.5 rounded-lg bg-white/5 border border-white/5">
                    <span className="text-slate-400 text-[10px]">Etki Seviyesi</span>
                    <p className="text-blue-400 font-bold">%{rightMilestone.impactLevel}</p>
                  </div>
                  <div className="p-2.5 rounded-lg bg-white/5 border border-white/5">
                    <span className="text-slate-400 text-[10px]">AI Otonomi</span>
                    <p className="text-purple-400 font-bold">%{rightMilestone.aiAutonomyIndex || 50}</p>
                  </div>
                  <div className="p-2.5 rounded-lg bg-white/5 border border-white/5">
                    <span className="text-slate-400 text-[10px]">İnsan Artırımı</span>
                    <p className="text-cyan-400 font-bold">%{rightMilestone.humanAugmentationIndex || 50}</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
