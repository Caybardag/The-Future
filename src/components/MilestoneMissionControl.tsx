import React from "react";
import {
  Compass,
  Brain,
  GraduationCap,
  Activity,
  Zap,
  Cpu,
  TrendingUp,
  ShieldAlert,
  ShieldCheck,
  AlertTriangle,
  Globe,
  BookOpen,
  RefreshCw,
  ExternalLink,
  FileText,
} from "lucide-react";
import { Milestone } from "../types";
import { getFiveLayerWorldState } from "../utils/worldStateResolver";
import { MilestoneTreeExplorer } from "./MilestoneTreeExplorer";

interface MilestoneMissionControlProps {
  activeMilestone: Milestone;
  brainNodes: any[];
  academicLiterature: any[];
  isLoadingAcademic: boolean;
  verifiedMap: Record<number, any>;
  milestones: Milestone[];
  onSelectMilestoneYear: (year: number) => void;
  activeHeroTab: "overview" | "brain" | "evidence" | "telemetry" | "tree";
  setActiveHeroTab: (tab: "overview" | "brain" | "evidence" | "telemetry" | "tree") => void;
}

export const MilestoneMissionControl: React.FC<MilestoneMissionControlProps> = ({
  activeMilestone,
  brainNodes,
  academicLiterature,
  isLoadingAcademic,
  verifiedMap,
  milestones,
  onSelectMilestoneYear,
  activeHeroTab,
  setActiveHeroTab,
}) => {
  const activeHeroWorldState = getFiveLayerWorldState(activeMilestone, 1995);
  const activeBrainNode = brainNodes.find((n) => n.year === activeMilestone.year);

  return (
    <div className="bg-slate-950/80 border border-white/10 rounded-2xl p-4 sm:p-5 space-y-4 shadow-xl">
      {/* Tab Navigation Header */}
      <div className="flex items-center justify-between gap-2 border-b border-white/10 pb-3 overflow-x-auto scrollbar-none">
        <div className="flex items-center gap-1.5 shrink-0">
          <button
            type="button"
            onClick={() => setActiveHeroTab("overview")}
            className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold flex items-center gap-1.5 transition-all cursor-pointer whitespace-nowrap ${
              activeHeroTab === "overview"
                ? "bg-blue-600 text-white shadow-md shadow-blue-500/25"
                : "text-slate-400 hover:text-white hover:bg-white/5"
            }`}
          >
            <Compass className="w-3.5 h-3.5" />
            <span>Genel Bakış</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveHeroTab("brain")}
            className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold flex items-center gap-1.5 transition-all cursor-pointer whitespace-nowrap ${
              activeHeroTab === "brain"
                ? "bg-purple-600 text-white shadow-md shadow-purple-500/25"
                : "text-slate-400 hover:text-white hover:bg-white/5"
            }`}
          >
            <Brain className="w-3.5 h-3.5 text-purple-300" />
            <span>Sistem Beyni (Canlı AI)</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveHeroTab("evidence")}
            className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold flex items-center gap-1.5 transition-all cursor-pointer whitespace-nowrap ${
              activeHeroTab === "evidence"
                ? "bg-cyan-600 text-white shadow-md shadow-cyan-500/25"
                : "text-slate-400 hover:text-white hover:bg-white/5"
            }`}
          >
            <GraduationCap className="w-3.5 h-3.5 text-cyan-300" />
            <span>Kanıtlar & Makaleler ({academicLiterature.length || activeMilestone.signals?.length || 1})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveHeroTab("telemetry")}
            className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold flex items-center gap-1.5 transition-all cursor-pointer whitespace-nowrap ${
              activeHeroTab === "telemetry"
                ? "bg-emerald-600 text-white shadow-md shadow-emerald-500/25"
                : "text-slate-400 hover:text-white hover:bg-white/5"
            }`}
          >
            <Activity className="w-3.5 h-3.5 text-emerald-300" />
            <span>Telemetri & Riskler</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveHeroTab("tree")}
            className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold flex items-center gap-1.5 transition-all cursor-pointer whitespace-nowrap ${
              activeHeroTab === "tree"
                ? "bg-amber-600 text-white shadow-md shadow-amber-500/25"
                : "text-slate-400 hover:text-white hover:bg-white/5"
            }`}
          >
            <Zap className="w-3.5 h-3.5 text-amber-300" />
            <span>Neden-Sonuç Alt Ağacı</span>
          </button>
        </div>
      </div>

      {/* SEKME 1: GENEL BAKIŞ & DÜNYA DURUMU */}
      {activeHeroTab === "overview" && (
        <div className="space-y-3 font-mono text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="p-3.5 rounded-xl bg-slate-900/80 border border-cyan-500/20 space-y-1">
              <span className="text-[10px] text-cyan-400 uppercase font-bold flex items-center gap-1">
                <Cpu className="w-3.5 h-3.5" />
                <span>Gelişim Aşaması</span>
              </span>
              <div className="text-base font-bold text-white">Aşama {activeHeroWorldState.scientificReadiness.trlLevel}/9 <span className="text-[10px] text-slate-400 font-normal font-mono">(Model Tahmini)</span></div>
              <div className="text-[11px] text-slate-300 font-sans">
                Model konsensus projeksiyonu: %{activeHeroWorldState.scientificReadiness.academicConsensusRate}
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-900/80 border border-amber-500/20 space-y-1">
              <span className="text-[10px] text-amber-400 uppercase font-bold flex items-center gap-1">
                <TrendingUp className="w-3.5 h-3.5" />
                <span>Ekonomi & İşgücü</span>
              </span>
              <div className="text-base font-bold text-white">%{activeHeroWorldState.macroEconomicsAndGeo.automatedJobsRate} Otonom</div>
              <div className="text-[11px] text-slate-300 font-sans">
                {activeHeroWorldState.macroEconomicsAndGeo.geopoliticalPowerHub}
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-900/80 border border-rose-500/20 space-y-1">
              <span className="text-[10px] text-rose-400 uppercase font-bold flex items-center gap-1">
                <ShieldAlert className="w-3.5 h-3.5" />
                <span>Makro Kırılganlık</span>
              </span>
              <div className="text-base font-bold text-white">{activeHeroWorldState.riskAndCountermeasures.vulnerabilityScore}/100 Risk</div>
              <div className="text-[11px] text-slate-300 font-sans truncate">
                {activeHeroWorldState.riskAndCountermeasures.criticalThreat}
              </div>
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-900/50 border border-white/5 space-y-1.5">
            <span className="text-slate-300 text-xs font-bold font-sans">
              💡 {activeMilestone.year} Günlük Yaşam Senaryosu & Bireye Yansıması:
            </span>
            <p className="text-xs text-slate-300 font-sans font-normal leading-relaxed">
              {activeHeroWorldState.dailyLifeAndBio.morningRoutineSnippet}
            </p>
          </div>
        </div>
      )}

      {/* SEKME 2: CANLI OTONOM SİSTEM BEYNİ */}
      {activeHeroTab === "brain" && (
        <div className="space-y-4 font-mono">
          {activeBrainNode ? (
            <div className="space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-purple-500/20 pb-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-purple-600/30 border border-purple-400/40 flex items-center justify-center shrink-0">
                    <Brain className="w-4 h-4 text-purple-300 animate-pulse" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs sm:text-sm font-extrabold text-white tracking-wide">
                        Otonom Sistem Beyni Sentezi & Bilimsel Değerlendirme
                      </span>
                      <span className="px-2 py-0.5 rounded-md bg-purple-500/20 border border-purple-400/40 text-purple-200 text-[10px] font-bold">
                        Canlı AI Analizi
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-400 mt-0.5">
                      Model: <span className="text-purple-300 font-bold">{activeBrainNode.evaluatedByModel}</span> • Son Sentez:{" "}
                      <span className="text-slate-300">
                        {new Date(activeBrainNode.lastEvaluatedAt).toLocaleTimeString("tr-TR", { hour: "2-digit", minute: "2-digit" })}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                  <span className="px-3 py-1 rounded-xl bg-blue-500/20 border border-blue-400/40 text-blue-300 text-xs font-extrabold">
                    {activeBrainNode.trlLevel?.replace(/TRL\s*/i, "Aşama ") || "Gelişim Aşaması"}
                  </span>
                  <span className="px-3 py-1 rounded-xl bg-emerald-500/20 border border-emerald-400/40 text-emerald-300 text-xs font-extrabold">
                    %{activeBrainNode.scientificFeasibilityScore} Gerçekleşebilirlik
                  </span>
                </div>
              </div>

              <div className="space-y-1.5 bg-slate-900/60 p-3.5 rounded-xl border border-white/5">
                <div className="text-xs font-bold text-purple-300 flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-purple-400" />
                  <span>🔬 Bilimsel Literatür & Teorik Çerçeve:</span>
                </div>
                <p className="text-xs text-slate-200 leading-relaxed font-sans font-normal">
                  {activeBrainNode.groundingProofSummary}
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                <div className="bg-slate-900/60 p-3.5 rounded-xl border border-blue-500/20 space-y-2">
                  <div className="text-blue-300 font-bold flex items-center gap-1.5">
                    <Zap className="w-3.5 h-3.5 text-blue-400" />
                    <span>⛓️ Zorunlu Öncül Koşullar</span>
                  </div>
                  <ul className="space-y-1.5 text-[11px] text-slate-300 font-sans">
                    {activeBrainNode.causalDependencies.map((dep, idx) => (
                      <li key={idx} className="flex items-start gap-1.5">
                        <span className="text-blue-400 font-bold">•</span>
                        <span>{dep}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="bg-slate-900/60 p-3.5 rounded-xl border border-amber-500/20 space-y-2">
                  <div className="text-amber-300 font-bold flex items-center gap-1.5">
                    <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
                    <span>⚠️ Fiziksel & Malzeme Kısıtları</span>
                  </div>
                  <ul className="space-y-1.5 text-[11px] text-slate-300 font-sans">
                    {activeBrainNode.bottlenecksAndLimits.map((bot, idx) => (
                      <li key={idx} className="flex items-start gap-1.5">
                        <span className="text-amber-400 font-bold">•</span>
                        <span>{bot}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-4 bg-slate-900/60 rounded-xl border border-white/10 text-xs text-slate-400 flex items-center gap-2">
              <Brain className="w-4 h-4 text-purple-400 animate-pulse" />
              <span>Otonom Sistem Beyni bu yıl ({activeMilestone.year}) için analiz matrisini güncelliyor...</span>
            </div>
          )}
        </div>
      )}

      {/* SEKME 3: KANITLAR, MAKALE ARŞİVİ VE PATENTLER */}
      {activeHeroTab === "evidence" && (
        <div className="space-y-4 font-mono text-xs">
          {verifiedMap[activeMilestone.year] && (
            <div className="p-3.5 rounded-xl bg-emerald-950/40 border border-emerald-500/40 flex items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                <div>
                  <span className="font-bold text-emerald-300 block">Akademik Literatür Kaynağı</span>
                  <p className="text-[11px] text-slate-300 font-sans mt-0.5">
                    "{verifiedMap[activeMilestone.year].userSummary}"
                  </p>
                </div>
              </div>
              <span className="px-2.5 py-1 rounded bg-emerald-500/20 text-emerald-300 text-xs font-bold border border-emerald-500/40 shrink-0">
                %{verifiedMap[activeMilestone.year].aiVerificationScore} Uyum Skoru
              </span>
            </div>
          )}

          {activeMilestone.patents && activeMilestone.patents.length > 0 && (
            <div className="p-3.5 rounded-xl bg-amber-950/30 border border-amber-500/30 space-y-1">
              <div className="flex items-center justify-between text-xs font-bold text-amber-400">
                <span className="flex items-center gap-1.5">
                  <FileText className="w-4 h-4" />
                  <span>Patent Kaydı ({activeMilestone.patents[0].patentNumber})</span>
                </span>
                <a
                  href={activeMilestone.patents[0].googlePatentsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-400 hover:text-blue-300 underline flex items-center gap-1 text-[11px]"
                >
                  <span>Google Patents'te Aç</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
              <p className="text-xs text-slate-300">
                {activeMilestone.patents[0].title} — <span className="text-slate-400">{activeMilestone.patents[0].assignee}</span>
              </p>
            </div>
          )}

          {/* OpenAlex Papers */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-cyan-300 flex items-center gap-1.5">
                <BookOpen className="w-4 h-4" />
                <span>Hakemli Makaleler (OpenAlex & arXiv):</span>
              </span>
              <span className="text-[10px] text-slate-400">
                {academicLiterature.length > 0 ? `${academicLiterature.length} Makale` : "Taranıyor"}
              </span>
            </div>

            {isLoadingAcademic ? (
              <div className="p-3 bg-slate-900/60 rounded-xl border border-white/5 animate-pulse text-xs text-slate-400 flex items-center gap-2">
                <RefreshCw className="w-3.5 h-3.5 animate-spin text-cyan-400" />
                <span>Makale arşivi getiriliyor...</span>
              </div>
            ) : academicLiterature.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {academicLiterature.slice(0, 4).map((p: any, idx: number) => (
                  <div key={`paper-tab-${p.id || 'paper'}-${idx}`} className="p-3 rounded-xl bg-slate-900/90 border border-cyan-500/30 space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-white font-sans line-clamp-1">{p.title}</span>
                      {p.citedByCount ? (
                        <span className="text-[10px] text-emerald-400 font-bold shrink-0">{p.citedByCount} Atıf</span>
                      ) : null}
                    </div>
                    <p className="text-[11px] text-slate-300 font-sans line-clamp-2 leading-relaxed">
                      {p.abstractSnippet || "Özet hazır."}
                    </p>
                    <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1">
                      <span>{p.authors?.slice(0, 2).join(", ")} ({p.year})</span>
                      <a
                        href={p.url || (p.doi ? `https://doi.org/${p.doi}` : "https://openalex.org")}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-cyan-400 hover:underline flex items-center gap-0.5"
                      >
                        <span>İncele</span>
                        <ExternalLink className="w-2.5 h-2.5" />
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-3 bg-slate-900/40 border border-white/5 rounded-xl text-xs text-slate-400 font-sans">
                {activeMilestone.year} yılı için akademik kaynak eşleştirmesi tamamlandı.
              </div>
            )}
          </div>

          {/* Güncel Haber Sinyalleri */}
          {activeMilestone.signals && activeMilestone.signals.length > 0 && (
            <div className="space-y-2 pt-2 border-t border-white/5">
              <span className="font-bold text-slate-300">Harici Kaynaklı Canlı Haber Sinyalleri:</span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {activeMilestone.signals.map((sig, sIdx) => (
                  <div key={`tab-signal-${sIdx}`} className="bg-slate-900/90 p-3 rounded-xl border border-white/10 space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-white font-sans truncate">{sig.title}</span>
                      <span className="text-[10px] text-emerald-400 font-bold shrink-0">%{sig.confidenceWeight}</span>
                    </div>
                    <p className="text-[11px] text-slate-300 font-sans line-clamp-2 leading-relaxed">
                      {sig.summary}
                    </p>
                    <div className="text-[10px] text-cyan-400 pt-1">{sig.sourceOrg?.replace(/Telegram/gi, "Haber")}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* SEKME 4: TELEMETRİ VE RİSKLER */}
      {activeHeroTab === "telemetry" && (
        <div className="space-y-4 font-mono text-xs">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            <div className="p-3 rounded-xl bg-slate-900 border border-white/10 space-y-1">
              <span className="text-slate-400 text-[10px] uppercase">Etki Seviyesi</span>
              <div className="text-lg font-bold text-blue-400">%{activeMilestone.impactLevel}</div>
              <div className="h-1 bg-slate-950 rounded-full overflow-hidden">
                <div className="h-full bg-blue-500" style={{ width: `${activeMilestone.impactLevel}%` }} />
              </div>
            </div>

            <div className="p-3 rounded-xl bg-slate-900 border border-white/10 space-y-1">
              <span className="text-slate-400 text-[10px] uppercase">Yapay Zeka Otonomisi</span>
              <div className="text-lg font-bold text-purple-400">%{activeMilestone.aiAutonomyIndex}</div>
              <div className="h-1 bg-slate-950 rounded-full overflow-hidden">
                <div className="h-full bg-purple-500" style={{ width: `${activeMilestone.aiAutonomyIndex}%` }} />
              </div>
            </div>

            <div className="p-3 rounded-xl bg-slate-900 border border-white/10 space-y-1">
              <span className="text-slate-400 text-[10px] uppercase">İnsan Güçlendirme</span>
              <div className="text-lg font-bold text-amber-400">%{activeMilestone.humanAugmentationIndex}</div>
              <div className="h-1 bg-slate-950 rounded-full overflow-hidden">
                <div className="h-full bg-amber-500" style={{ width: `${activeMilestone.humanAugmentationIndex}%` }} />
              </div>
            </div>

            <div className="p-3 rounded-xl bg-slate-900 border border-white/10 space-y-1">
              <span className="text-slate-400 text-[10px] uppercase">Biyo-Dijital Uyum</span>
              <div className="text-lg font-bold text-emerald-400">%{activeMilestone.bioDigitalIntegrationRate}</div>
              <div className="h-1 bg-slate-950 rounded-full overflow-hidden">
                <div className="h-full bg-emerald-500" style={{ width: `${activeMilestone.bioDigitalIntegrationRate}%` }} />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="bg-rose-950/30 border border-rose-500/30 p-3.5 rounded-xl space-y-1">
              <span className="text-rose-400 font-bold uppercase text-[10px] block">⚠️ Etik & Güvenlik Riskleri:</span>
              <p className="text-slate-300 font-sans text-xs">{activeMilestone.ethicalRisks[0]}</p>
            </div>
            <div className="bg-emerald-950/30 border border-emerald-500/30 p-3.5 rounded-xl space-y-1">
              <span className="text-emerald-400 font-bold uppercase text-[10px] block">🌟 Toplumsal Fırsatlar:</span>
              <p className="text-slate-300 font-sans text-xs">{activeMilestone.societalOpportunities[0]}</p>
            </div>
          </div>
        </div>
      )}

      {/* SEKME 5: NEDEN-SONUÇ ALT AĞACI */}
      {activeHeroTab === "tree" && (
        <div className="pt-1">
          <MilestoneTreeExplorer
            milestone={activeMilestone}
            onSelectMilestoneYear={onSelectMilestoneYear}
          />
        </div>
      )}
    </div>
  );
};

export default MilestoneMissionControl;
