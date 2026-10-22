import React from "react";
import { ScenarioMode } from "../types";
import { GitBranch, Zap, Sparkles, AlertTriangle, TrendingUp, Cpu } from "lucide-react";

interface BranchingRealitiesGraphProps {
  scenarioMode: "baseline" | "optimistic" | "dystopian";
  onSelectScenario: (mode: "baseline" | "optimistic" | "dystopian") => void;
  activeYear?: number;
}

export const BranchingRealitiesGraph: React.FC<BranchingRealitiesGraphProps> = ({
  scenarioMode,
  onSelectScenario,
  activeYear = 2035,
}) => {
  // Scenario comparison details for Motor 3
  const scenarios = [
    {
      id: "optimistic" as const,
      name: "Hızlandırılmış / Singularity",
      tagline: "Yüksek Yatırım & Açık İnovasyon",
      probability: "%25",
      singularityYear: "2045",
      accelerationLabel: "+%35 Hızlanma",
      color: "emerald",
      borderClass: "border-emerald-500/50 bg-emerald-950/40 text-emerald-300",
      activeClass: "ring-2 ring-emerald-400 bg-emerald-950/80 border-emerald-400 shadow-lg shadow-emerald-500/20",
      stroke: "#10b981",
      path: "M 10,65 Q 40,40 70,25 T 100,10",
    },
    {
      id: "baseline" as const,
      name: "Baz Senaryo (Konsensus)",
      tagline: "Dengeli Teknolojik & Regülasyon Patikası",
      probability: "%55",
      singularityYear: "2052",
      accelerationLabel: "Standart Hız",
      color: "blue",
      borderClass: "border-blue-500/50 bg-blue-950/40 text-blue-300",
      activeClass: "ring-2 ring-blue-400 bg-blue-950/80 border-blue-400 shadow-lg shadow-blue-500/20",
      stroke: "#3b82f6",
      path: "M 10,65 Q 40,55 70,45 T 100,35",
    },
    {
      id: "dystopian" as const,
      name: "Fragmente / Kriz Patikası",
      tagline: "Jeopolitik Bloklaşma & Regülasyon Freni",
      probability: "%20",
      singularityYear: "2060+",
      accelerationLabel: "-3.5 Yıl Gecikme",
      color: "rose",
      borderClass: "border-rose-500/50 bg-rose-950/40 text-rose-300",
      activeClass: "ring-2 ring-rose-400 bg-rose-950/80 border-rose-400 shadow-lg shadow-rose-500/20",
      stroke: "#f43f5e",
      path: "M 10,65 Q 40,75 70,80 T 100,90",
    },
  ];

  return (
    <div className="bg-slate-950/80 border border-purple-500/30 rounded-2xl p-4 font-mono text-xs space-y-3 shadow-xl">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/5 pb-2.5">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-purple-500/20 text-purple-300 border border-purple-500/30">
            <GitBranch className="w-4 h-4 text-purple-400" />
          </div>
          <div>
            <span className="font-bold text-white text-xs flex items-center gap-2">
              <span>Motor 3: Çatallanan Gerçeklikler (Branching Realities)</span>
              <span className="text-[9px] px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30">
                Olasılık Koridoru
              </span>
            </span>
            <p className="text-[10px] text-slate-400 font-sans">
              2026 başlangıç noktasından 2060 ufkuna 3 farklı çatallanma patikası.
            </p>
          </div>
        </div>

        {/* Real-time Dynamic Mini SVG Graph */}
        <div className="hidden sm:flex items-center gap-2 bg-slate-900 px-3 py-1.5 rounded-xl border border-white/10">
          <span className="text-[10px] text-slate-400">Çatallanma Grafiği:</span>
          <svg className="w-24 h-8 overflow-visible" viewBox="0 0 100 100">
            {scenarios.map((sc) => (
              <path
                key={sc.id}
                d={sc.path}
                fill="none"
                stroke={sc.stroke}
                strokeWidth={scenarioMode === sc.id ? "5" : "2"}
                strokeOpacity={scenarioMode === sc.id ? "1" : "0.35"}
                className="transition-all duration-300"
              />
            ))}
            {/* Origin Node 2026 */}
            <circle cx="10" cy="65" r="4" fill="#a855f7" />
          </svg>
        </div>
      </div>

      {/* Scenario Branch Selection Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5">
        {scenarios.map((sc) => {
          const isSelected = scenarioMode === sc.id;
          return (
            <button
              key={sc.id}
              type="button"
              onClick={() => onSelectScenario(sc.id)}
              className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between space-y-2 ${
                isSelected ? sc.activeClass : `${sc.borderClass} opacity-70 hover:opacity-100`
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="font-bold text-xs flex items-center gap-1.5">
                  <span className={`w-2 h-2 rounded-full ${isSelected ? "animate-ping" : ""}`} style={{ backgroundColor: sc.stroke }} />
                  <span>{sc.name}</span>
                </span>
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-950/80 border border-white/10">
                  {sc.probability} Olasılık
                </span>
              </div>

              <p className="text-[11px] text-slate-300 font-sans line-clamp-1">
                {sc.tagline}
              </p>

              <div className="pt-1 border-t border-white/5 flex items-center justify-between text-[10px]">
                <span className="text-slate-400">Singularity Ufku:</span>
                <strong className="text-white font-mono">{sc.singularityYear} ({sc.accelerationLabel})</strong>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
