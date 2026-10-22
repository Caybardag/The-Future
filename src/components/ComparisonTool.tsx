import React, { useState } from "react";
import { Milestone } from "../types";
import { MilestoneIcon } from "../utils/iconHelper";
import { GitCompare, ShieldAlert } from "lucide-react";
import { useLanguage } from "../context/LanguageContext";
import { translateCategory } from "../utils/translations";
import { getMilestoneConflicts } from "../utils/conflictDetector";

interface ComparisonToolProps {
  milestones: Milestone[];
}

export const ComparisonTool: React.FC<ComparisonToolProps> = ({ milestones }) => {
  const { language, t } = useLanguage();
  const [year1, setYear1] = useState<number>(2026);
  const [year2, setYear2] = useState<number>(2045);
  const [year3, setYear3] = useState<number>(2060);

  const m1 = milestones.find((m) => m.year === year1) || milestones[0];
  const m2 = milestones.find((m) => m.year === year2) || milestones[19];
  const m3 = milestones.find((m) => m.year === year3) || milestones[34];

  const comparedList = [m1, m2, m3];

  return (
    <div className="space-y-6 pb-12">
      
      {/* Header Bento Cell */}
      <div className="bg-slate-900/40 border border-white/5 rounded-2xl p-6 lg:p-8 relative overflow-hidden">
        <div className="flex items-center gap-2 text-emerald-400 font-mono text-[11px] font-bold uppercase tracking-widest mb-2">
          <GitCompare className="w-4 h-4 text-emerald-400" />
          <span>{t("comparison_tool")}</span>
        </div>
        <h2 className="text-2xl lg:text-3xl font-bold text-white tracking-tight">
          {t("comparison_tool")}
        </h2>
        <p className="text-slate-400 text-xs font-mono mt-1 max-w-3xl leading-relaxed">
          {t("comparison_desc")}
        </p>
      </div>

      {/* Selectors Bar Bento Cell */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-slate-900/40 border border-white/5 rounded-2xl p-4">
        <div className="space-y-1">
          <label className="text-[10px] font-mono text-blue-400 font-bold uppercase">{t("select_milestone")} 1 (2026—2035):</label>
          <select
            value={year1}
            onChange={(e) => setYear1(Number(e.target.value))}
            className="w-full bg-slate-950 border border-white/5 text-white text-xs font-mono rounded-xl px-3 py-2 focus:outline-none focus:border-blue-500 cursor-pointer"
          >
            {(milestones || []).map((m, idx) => (
              <option key={`${m.year}-${m.title}-opt1-${idx}`} value={m.year}>
                {m.year} — {m.title}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-1">
          <label className="text-[10px] font-mono text-amber-400 font-bold uppercase">{t("select_milestone")} 2 (2036—2045):</label>
          <select
            value={year2}
            onChange={(e) => setYear2(Number(e.target.value))}
            className="w-full bg-slate-950 border border-white/5 text-white text-xs font-mono rounded-xl px-3 py-2 focus:outline-none focus:border-amber-500 cursor-pointer"
          >
            {(milestones || []).map((m, idx) => (
              <option key={`${m.year}-${m.title}-opt2-${idx}`} value={m.year}>
                {m.year} — {m.title}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-1">
          <label className="text-[10px] font-mono text-purple-400 font-bold uppercase">{t("select_milestone")} 3 (2046—2060):</label>
          <select
            value={year3}
            onChange={(e) => setYear3(Number(e.target.value))}
            className="w-full bg-slate-950 border border-white/5 text-white text-xs font-mono rounded-xl px-3 py-2 focus:outline-none focus:border-purple-500 cursor-pointer"
          >
            {(milestones || []).map((m, idx) => (
              <option key={`${m.year}-${m.title}-opt3-${idx}`} value={m.year}>
                {m.year} — {m.title}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Comparison Bento Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {comparedList.map((m, index) => {
          const accentColor = index === 0 ? "#3b82f6" : index === 1 ? "#f59e0b" : "#a855f7";

          return (
            <div
              key={`${m.year}-${m.title}-${index}`}
              className="bg-slate-900/40 border border-white/5 rounded-2xl p-6 space-y-4 relative overflow-hidden flex flex-col justify-between"
            >
              <div
                className="absolute top-0 left-0 right-0 h-1"
                style={{ backgroundColor: accentColor }}
              />

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span
                    className="text-2xl font-mono font-bold"
                    style={{ color: accentColor }}
                  >
                    {m.year}
                  </span>
                  <div className="flex items-center gap-1.5">
                    {(() => {
                      const conflicts = getMilestoneConflicts(m, milestones);
                      if (conflicts.length === 0) return null;
                      return (
                        <span
                          className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/40 animate-pulse flex items-center gap-1"
                          title={`⚠️ Çelişki Uyarısı: ${conflicts[0].title}`}
                        >
                          <ShieldAlert className="w-3 h-3 text-rose-400" />
                          <span>Çelişki!</span>
                        </span>
                      );
                    })()}
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-950 border border-white/5 text-slate-300">
                      PHASE 0{m.phase}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div
                    className="p-2.5 rounded-xl bg-slate-950 border border-white/5 flex-shrink-0"
                    style={{ color: accentColor }}
                  >
                    <MilestoneIcon name={m.iconName} size={20} />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white leading-tight">{m.title}</h3>
                    <span className="text-[10px] text-slate-400 font-mono">{translateCategory(m.category, language)}</span>
                  </div>
                </div>

                <div className="bg-slate-950/80 border border-white/5 rounded-xl p-3 text-xs text-slate-300 leading-relaxed font-mono">
                  {m.description}
                </div>

                {/* Metrics */}
                <div className="space-y-1.5 text-[11px] font-mono bg-slate-950/60 border border-white/5 p-3 rounded-xl">
                  <div className="flex justify-between">
                    <span className="text-slate-400">{t("impact_level")}:</span>
                    <span className="font-bold text-blue-400">%{m.impactLevel}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">{t("ai_autonomy")}:</span>
                    <span className="font-bold text-purple-400">%{m.aiAutonomyIndex}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">{t("human_augmentation")}:</span>
                    <span className="font-bold text-amber-400">%{m.humanAugmentationIndex}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">{t("bio_digital")}:</span>
                    <span className="font-bold text-emerald-400">%{m.bioDigitalIntegrationRate}</span>
                  </div>
                </div>

                {/* Daily Life */}
                <div className="space-y-1">
                  <span className="text-[10px] font-mono uppercase font-bold text-slate-400">
                    {t("daily_life_impact")}:
                  </span>
                  <p className="text-xs text-slate-300 italic bg-slate-950 p-3 rounded-xl border border-white/5 font-mono">
                    "{m.dailyLifeImpact}"
                  </p>
                </div>
              </div>

              <div className="pt-3 border-t border-white/5 text-[10px] font-mono text-slate-400 flex justify-between">
                <span>{t("probability")}: %{m.probability}</span>
                <span className="text-emerald-400 font-bold">{t("patent_supported")}</span>
              </div>
            </div>
          );
        })}
      </div>

    </div>
  );
};


