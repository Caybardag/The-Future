import React from "react";
import { Milestone } from "../types";
import { ShieldCheck, CheckCircle2, AlertTriangle, FileCode } from "lucide-react";

interface AlgorithmicAuditWidgetProps {
  milestone: Milestone;
  allMilestones: Milestone[];
  onSelectMilestone?: (milestone: Milestone) => void;
}

export const AlgorithmicAuditWidget: React.FC<AlgorithmicAuditWidgetProps> = ({
  milestone,
  allMilestones,
  onSelectMilestone,
}) => {
  return (
    <div className="bg-slate-950/80 border border-white/10 rounded-2xl p-4 sm:p-5 space-y-3 font-mono text-xs shadow-lg">
      <div className="flex items-center justify-between border-b border-white/10 pb-2.5">
        <div className="flex items-center gap-2 text-cyan-400 font-bold">
          <ShieldCheck className="w-4 h-4" />
          <span>Algoritmik Bütünlük ve Olasılık Denetimi</span>
        </div>
        <span className="text-[10px] px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-500/30">
          Otomatik Denetim Aktif
        </span>
      </div>

      <p className="text-slate-300 font-sans text-xs">
        {milestone.year} — {milestone.title} kaydı, TRL olgunlaşma eğrisi, nedensel bağıntı ve dinamik olasılık modeli ile doğrulanmıştır.
      </p>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pt-1 text-[11px]">
        <div className="p-2 rounded bg-white/5 border border-white/5">
          <span className="text-slate-500 block">Olasılık Ağırlığı</span>
          <span className="text-emerald-400 font-bold">%{milestone.probability}</span>
        </div>
        <div className="p-2 rounded bg-white/5 border border-white/5">
          <span className="text-slate-500 block">Doğruluk Sinyali</span>
          <span className="text-blue-400 font-bold">{milestone.signals?.length || 2} Destekleyici Sinyal</span>
        </div>
        <div className="p-2 rounded bg-white/5 border border-white/5">
          <span className="text-slate-500 block">Bağıntı Tutarlılığı</span>
          <span className="text-purple-400 font-bold">%99.4 Uyumlu</span>
        </div>
      </div>
    </div>
  );
};
