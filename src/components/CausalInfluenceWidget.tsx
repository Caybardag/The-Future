import React, { useState } from "react";
import { Milestone } from "../types";
import { calculateMilestoneDelayCascade, RippleEffectResult } from "../utils/causalInfluenceEngine";
import {
  GitFork,
  AlertTriangle,
  Clock,
  ArrowRight,
  ShieldAlert,
  Zap,
  CheckCircle2,
  RefreshCw,
  Sparkles,
} from "lucide-react";

interface CausalInfluenceModalProps {
  milestone: Milestone;
  allMilestones: Milestone[];
  onSelectMilestone?: (year: number) => void;
}

export const CausalInfluenceWidget: React.FC<CausalInfluenceModalProps> = ({
  milestone,
  allMilestones,
  onSelectMilestone,
}) => {
  const [delayYears, setDelayYears] = useState<number>(2);

  const rippleResult: RippleEffectResult = calculateMilestoneDelayCascade(
    allMilestones,
    milestone.year,
    delayYears
  );

  return (
    <div className="bg-slate-950/90 border border-purple-500/30 rounded-2xl p-4 sm:p-5 space-y-4 font-mono text-xs shadow-xl animate-in fade-in">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/10 pb-3">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-purple-500/20 text-purple-300 border border-purple-500/30">
            <GitFork className="w-4 h-4 text-purple-400" />
          </div>
          <div>
            <h4 className="font-bold text-white text-sm flex items-center gap-2">
              <span>Motor 2: Nedensellik & Domino Ağı (Causal DAG)</span>
              <span className="text-[10px] bg-purple-500/20 text-purple-300 px-2 py-0.5 rounded-full border border-purple-500/30">
                Gecikme Simülatörü
              </span>
            </h4>
            <p className="text-slate-400 text-[11px] font-sans">
              "{milestone.title}" gelişmesinde yaşanacak bir kriz veya regülasyon gecikmesinin gelecekteki yıllara ve Singularity'ye domino etkisi.
            </p>
          </div>
        </div>
      </div>

      {/* Delay Slider Controller */}
      <div className="p-4 rounded-xl bg-slate-900 border border-white/10 space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-slate-300 font-bold flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-amber-400" />
            <span>Simüle Edilen Gecikme Miktarı:</span>
          </span>
          <span className="px-3 py-1 rounded-lg bg-amber-500/20 text-amber-300 border border-amber-500/40 font-bold text-sm">
            +{delayYears} Yıl Gecikme
          </span>
        </div>

        <input
          type="range"
          min={1}
          max={6}
          step={1}
          value={delayYears}
          onChange={(e) => setDelayYears(Number(e.target.value))}
          className="w-full h-2 bg-slate-950 rounded-lg appearance-none cursor-pointer accent-purple-500"
        />

        <div className="flex justify-between text-[10px] text-slate-500">
          <span>+1 Yıl (Hafif Regülasyon)</span>
          <span>+3 Yıl (Çip & Tedarik Darboğazı)</span>
          <span>+6 Yıl (Küresel Kriz / Yasaklama)</span>
        </div>
      </div>

      {/* Summary Impact Banner */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="p-3.5 rounded-xl bg-purple-950/30 border border-purple-500/40 space-y-1">
          <span className="text-[10px] text-purple-300 font-bold uppercase block">
            Revize Edilen Singularity Yılı:
          </span>
          <div className="text-2xl font-bold text-purple-200">
            {rippleResult.newSingularityYear}{" "}
            <span className="text-xs text-rose-400 font-normal">
              (+{rippleResult.newSingularityYear - 2052} yıl ötelendi)
            </span>
          </div>
          <p className="text-[10px] text-slate-400 font-sans">
            Temel teknolojideki gecikme tüm yapay süper zeka zincirini öteler.
          </p>
        </div>

        <div className="p-3.5 rounded-xl bg-rose-950/20 border border-rose-500/30 space-y-1">
          <span className="text-[10px] text-rose-300 font-bold uppercase block">
            Sistem Entropi & Belirsizlik Skoru:
          </span>
          <div className="text-2xl font-bold text-rose-300">
            %{rippleResult.systemEntropyScore}
          </div>
          <p className="text-[10px] text-slate-400 font-sans">
            Öngörülebilirlik seviyesinde düşüş ve alternatif patika riski.
          </p>
        </div>
      </div>

      {/* Downstream Affected Milestones Cascade */}
      <div className="space-y-2 pt-1">
        <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">
          Doğrudan Etkilenen Gelecek Kilometre Taşları ({rippleResult.affectedMilestones.length}):
        </span>

        {rippleResult.affectedMilestones.length === 0 ? (
          <div className="p-4 rounded-xl bg-slate-900 border border-white/5 text-center text-slate-400 text-xs font-sans">
            Bu gelişmenin downstream Causal DAG zincirinde doğrudan kritik bağımlılığı bulunmuyor.
          </div>
        ) : (
          <div className="space-y-2 max-h-64 overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-slate-800">
            {rippleResult.affectedMilestones.map((item, idx) => (
              <div
                key={idx}
                onClick={() => onSelectMilestone && onSelectMilestone(item.originalYear)}
                className="p-3 rounded-xl bg-slate-900/90 border border-white/10 hover:border-purple-500/40 flex items-start justify-between gap-3 transition-all cursor-pointer group"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded bg-slate-950 text-slate-400 text-[10px] font-mono line-through">
                      {item.originalYear}
                    </span>
                    <ArrowRight className="w-3 h-3 text-purple-400" />
                    <span className="px-2 py-0.5 rounded bg-purple-950 text-purple-300 border border-purple-500/40 text-[11px] font-mono font-bold">
                      {item.shiftedYear}
                    </span>
                    <span className="text-white font-bold text-xs group-hover:text-purple-300 transition-colors">
                      {item.milestone.title}
                    </span>
                  </div>
                  <p className="text-slate-300 text-[11px] font-sans leading-relaxed">
                    {item.causalReason}
                  </p>
                </div>

                <span className="px-2 py-1 rounded bg-rose-950 text-rose-300 border border-rose-500/30 text-[10px] font-bold shrink-0">
                  +{item.delayAmount}y Gecikme
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
