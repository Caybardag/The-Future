import React, { useState } from "react";
import { Milestone } from "../types";
import { Sparkles, CheckCircle2, Award, Zap, ExternalLink } from "lucide-react";

interface EmbeddedWidgetViewProps {
  milestones: Milestone[];
}

export const EmbeddedWidgetView: React.FC<EmbeddedWidgetViewProps> = ({ milestones }) => {
  const urlParams = new URLSearchParams(window.location.search);
  const yearParam = Number(urlParams.get("year")) || 2030;

  const milestone = milestones.find((m) => m.year === yearParam) || milestones[0];

  const [voted, setVoted] = useState<string | null>(null);

  return (
    <div className="min-h-screen bg-[#050507] text-slate-100 p-4 font-sans flex items-center justify-center">
      <div className="max-w-md w-full bg-gradient-to-b from-slate-900 to-[#0B0F19] border border-cyan-500/30 rounded-2xl p-5 space-y-4 shadow-2xl relative overflow-hidden">
        
        {/* Glow */}
        <div className="absolute top-0 right-0 w-40 h-40 bg-cyan-500/10 rounded-full blur-2xl pointer-events-none" />

        <div className="flex items-center justify-between border-b border-white/10 pb-3">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-cyan-400" />
            <span className="font-mono text-xs font-bold uppercase tracking-wider text-slate-300">
              Teknolojik Evrim 2026-2060
            </span>
          </div>
          <span className="text-xs font-mono font-extrabold text-cyan-400 px-2.5 py-0.5 rounded-full bg-cyan-950 border border-cyan-500/30">
            {milestone.year}
          </span>
        </div>

        <div className="space-y-2">
          <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-slate-800 text-slate-400">
            {milestone.category}
          </span>
          <h2 className="text-lg font-bold text-white leading-snug">{milestone.title}</h2>
          <p className="text-xs text-slate-300 leading-relaxed">{milestone.description}</p>
        </div>

        <div className="grid grid-cols-3 gap-2 py-2 border-y border-white/5 font-mono text-[11px] text-center">
          <div className="bg-slate-900 p-2 rounded-lg border border-white/5">
            <span className="text-slate-400 block text-[9px]">Otonomi</span>
            <span className="font-bold text-cyan-400">%{milestone.aiAutonomyIndex}</span>
          </div>
          <div className="bg-slate-900 p-2 rounded-lg border border-white/5">
            <span className="text-slate-400 block text-[9px]">Etki</span>
            <span className="font-bold text-amber-400">%{milestone.impactLevel}</span>
          </div>
          <div className="bg-slate-900 p-2 rounded-lg border border-white/5">
            <span className="text-slate-400 block text-[9px]">Artırım</span>
            <span className="font-bold text-emerald-400">%{milestone.humanAugmentationIndex}</span>
          </div>
        </div>

        {/* Voting Widget */}
        <div className="space-y-2 pt-1">
          <p className="text-[11px] font-mono text-slate-400">Bu öngörü gerçekleşti mi?</p>
          <div className="grid grid-cols-3 gap-1.5">
            <button
              onClick={() => setVoted("realized")}
              className={`py-1.5 rounded-lg text-[10px] font-mono font-bold transition-all border ${
                voted === "realized" ? "bg-emerald-500 text-black border-emerald-400" : "bg-slate-800 text-emerald-400 border-white/5"
              }`}
            >
              Gerçekleşti
            </button>
            <button
              onClick={() => setVoted("partially")}
              className={`py-1.5 rounded-lg text-[10px] font-mono font-bold transition-all border ${
                voted === "partially" ? "bg-amber-500 text-black border-amber-400" : "bg-slate-800 text-amber-400 border-white/5"
              }`}
            >
              Kısmen
            </button>
            <button
              onClick={() => setVoted("not_yet")}
              className={`py-1.5 rounded-lg text-[10px] font-mono font-bold transition-all border ${
                voted === "not_yet" ? "bg-red-500 text-black border-red-400" : "bg-slate-800 text-red-400 border-white/5"
              }`}
            >
              Henüz Yok
            </button>
          </div>
        </div>

        {/* Footer Link */}
        <div className="pt-2 flex items-center justify-between border-t border-white/5 text-[10px] font-mono text-slate-400">
          <span>Powered by Algorithmic Futurology</span>
          <a
            href={window.location.origin}
            target="_blank"
            rel="noopener noreferrer"
            className="text-cyan-400 hover:underline flex items-center gap-1"
          >
            <span>Tüm Takvim</span>
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      </div>
    </div>
  );
};
