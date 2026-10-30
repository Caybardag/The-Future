import React, { useState } from "react";
import { Milestone } from "../types";
import { GitFork, ArrowRight, Zap, Layers, Sparkles } from "lucide-react";

interface CausalityNetworkViewProps {
  milestones: Milestone[];
  onSelectMilestone?: (milestone: Milestone) => void;
}

export const CausalityNetworkView: React.FC<CausalityNetworkViewProps> = ({
  milestones,
  onSelectMilestone,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  const filtered = selectedCategory === "all"
    ? milestones
    : milestones.filter((m) => m.category === selectedCategory);

  const categories = Array.from(new Set(milestones.map((m) => m.category)));

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-6">
      <div className="bg-slate-900/80 border border-purple-500/20 rounded-3xl p-6 shadow-xl backdrop-blur-md">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/10 pb-4 mb-6">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-purple-500/20 text-purple-400 border border-purple-500/30">
              <GitFork className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-white">Nedensellik & Domino Zinciri Haritası</h2>
              <p className="text-xs text-slate-400">Teknolojik kırılmaların birbirini nasıl tetiklediğini ve zincirleme etkileri keşfedin.</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              aria-label="Kategori Filtresi"
              className="bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-xs text-white"
            >
              <option value="all">Tüm Kategoriler</option>
              {categories.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.slice(0, 18).map((m) => (
            <div
              key={m.year}
              onClick={() => onSelectMilestone?.(m)}
              className="p-4 rounded-2xl bg-slate-950/60 border border-white/10 hover:border-purple-500/50 transition-all cursor-pointer space-y-3 group"
            >
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs font-bold text-purple-400">{m.year}</span>
                <span className="text-[10px] text-slate-400 font-mono uppercase truncate max-w-[150px]">{m.category}</span>
              </div>
              <h4 className="font-bold text-white text-sm group-hover:text-purple-300 transition-colors">{m.title}</h4>
              <p className="text-xs text-slate-400 line-clamp-2">{m.description}</p>
              
              {m.relatedYears && m.relatedYears.length > 0 && (
                <div className="pt-2 border-t border-white/5 flex items-center gap-1.5 text-[11px] text-slate-500 font-mono">
                  <span>Tetiklediği Yıllar:</span>
                  <span className="text-purple-400">{m.relatedYears.join(", ")}</span>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
