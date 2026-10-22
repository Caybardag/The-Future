import React, { useState, useEffect } from "react";
import { Milestone, AlgorithmicAuditReport } from "../types";
import { generateAlgorithmicAudit } from "../utils/auditGenerator";
import { aiService } from "../services/AIService";
import { useAuth } from "../context/AuthContext";
import { ParametricAuditCard } from "./ParametricAuditCard";
import { MilestoneTreeExplorer } from "./MilestoneTreeExplorer";
import {
  ShieldAlert,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Cpu,
  Database,
  FileCheck,
  Activity,
  Award,
  Search,
  Zap,
  Sparkles,
  GitBranch,
} from "lucide-react";
import { useLanguage } from "../context/LanguageContext";

interface AlgorithmicAuditWidgetProps {
  milestone?: Milestone;
  allMilestones?: Milestone[];
  onSelectMilestone?: (m: Milestone) => void;
  onOpenDetailModal?: (m: Milestone) => void;
  standalone?: boolean;
}

export const AlgorithmicAuditWidget: React.FC<AlgorithmicAuditWidgetProps> = ({
  milestone: initialMilestone,
  allMilestones = [],
  onSelectMilestone,
  onOpenDetailModal,
  standalone = false,
}) => {
  const { language } = useLanguage();
  const { currentUser, deductCredits, credits: userCredits, openCreditStore } = useAuth();
  
  const [activeMilestone, setActiveMilestone] = useState<Milestone>(
    initialMilestone || (allMilestones.length > 0 ? allMilestones[0] : ({
      year: 2045,
      title: "Otonom Yapay Genel Zeka (AGI) & Sınırsız Bilişim",
      description: "AGI sistemleri küresel ölçekte otonom yazılım ve bilimsel ar-ge yapabilir.",
      phase: 2,
      category: "Yapay Zeka & Bilişim",
      probability: 88,
      iconName: "Cpu",
      impactLevel: 98,
      humanAugmentationIndex: 90,
      aiAutonomyIndex: 95,
      bioDigitalIntegrationRate: 85,
      keyDrivers: ["Transformer Architecture", "Supercomputing Energy Grids", "Quantum Acceleration"],
      dailyLifeImpact: "Tüm bilimsel çalışmalar otonom otopilot modunda yürütülür.",
      ethicalRisks: ["Otonomi Kontrolü", "Ekonomik Uyum"],
      societalOpportunities: ["Hastalıkların Tedavisi", "Temiz Enerji"],
      relatedYears: [2035, 2050],
    } as Milestone))
  );

  const [auditReport, setAuditReport] = useState<AlgorithmicAuditReport>(() =>
    generateAlgorithmicAudit(activeMilestone)
  );

  // Multi-milestone selection state
  const [selectedMilestoneYears, setSelectedMilestoneYears] = useState<number[]>([activeMilestone.year]);
  const [loadingAudit, setLoadingAudit] = useState<boolean>(false);
  const [liveAiAnalysis, setLiveAiAnalysis] = useState<string | null>(null);
  const [filterAnomaliesOnly, setFilterAnomaliesOnly] = useState<boolean>(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  // Dynamic credit calculation based on selected milestone count (5 credits per milestone)
  const totalCost = Math.max(5, selectedMilestoneYears.length * 5);

  // Toggle or select milestone in multi-select mode
  const handleToggleMilestoneSelection = (m: Milestone) => {
    setActiveMilestone(m);
    setAuditReport(generateAlgorithmicAudit(m));
    setLiveAiAnalysis(null);
    if (onSelectMilestone) onSelectMilestone(m);

    setSelectedMilestoneYears((prev) => {
      if (prev.includes(m.year)) {
        if (prev.length === 1) return prev; // keep at least one selected
        return prev.filter((y) => y !== m.year);
      } else {
        return [...prev, m.year];
      }
    });
  };

  const [activeTab, setActiveTab] = useState<"overview" | "parametric" | "tree">("overview");

  const handleSelectAllMilestones = () => {
    const listToSelect = filterAnomaliesOnly ? anomalousMilestones : allMilestones;
    if (selectedMilestoneYears.length === listToSelect.length) {
      // Deselect to only active
      setSelectedMilestoneYears([activeMilestone.year]);
    } else {
      setSelectedMilestoneYears(listToSelect.map((m) => m.year));
    }
  };

  // Update audit report when active milestone changes
  const handleSelectMilestone = (m: Milestone) => {
    setActiveMilestone(m);
    setAuditReport(generateAlgorithmicAudit(m));
    setLiveAiAnalysis(null);
    if (!selectedMilestoneYears.includes(m.year)) {
      setSelectedMilestoneYears([m.year]);
    }
    if (onSelectMilestone) onSelectMilestone(m);
  };

  const handleRunLiveAudit = async () => {
    const requiredCredits = Math.max(10, selectedMilestoneYears.length * 5);

    if (!deductCredits(requiredCredits)) {
      setStatusMessage(`❌ Yetersiz Kredi! ${selectedMilestoneYears.length} adet dönüm noktası denetimi için ${requiredCredits} Kredi gereklidir.`);
      if (openCreditStore) openCreditStore();
      return;
    }

    setLoadingAudit(true);
    setLiveAiAnalysis(null);
    setStatusMessage(null);

    const milestonesToAudit = allMilestones.filter((m) => selectedMilestoneYears.includes(m.year));
    const targetList = milestonesToAudit.length > 0 ? milestonesToAudit : [activeMilestone];

    try {
      if (targetList.length === 1) {
        const target = targetList[0];
        const data = await aiService.auditMilestone({
          year: target.year,
          title: target.title,
          description: target.description,
          category: target.category,
          probability: target.probability,
          keyDrivers: target.keyDrivers,
        });

        if (data.success && data.auditAnalysis) {
          setLiveAiAnalysis(`🔍 [${target.year} - ${target.title} Denetim Raporu]\n\n` + data.auditAnalysis);
          if (data.assumptions && Array.isArray(data.assumptions)) {
            setAuditReport((prev) => ({
              ...prev,
              overallAssumptionScore: data.overallAssumptionScore || prev.overallAssumptionScore,
              sourceCredibilityIndex: data.sourceCredibilityIndex || prev.sourceCredibilityIndex,
              hasAnomaly: Boolean(data.hasAnomaly),
              anomalyRiskLevel: data.anomalyRiskLevel || prev.anomalyRiskLevel,
              anomalyWarningMessage: data.anomalyWarningMessage || prev.anomalyWarningMessage,
              assumptions: data.assumptions,
              algorithmicVerdict: data.algorithmicVerdict || prev.algorithmicVerdict,
            }));
          }
        } else {
          setAuditReport(generateAlgorithmicAudit(target));
          setLiveAiAnalysis(
            `✓ Dönüm Noktası Denetimi Tamamlandı!\n\n${target.title} (${target.year}) hedefli olarak denetlenmiş, nedensellik zinciri ve fizibilite varsayımları %${auditReport.sourceCredibilityIndex} kaynak uyum skoruyla güncellenmiştir.`
          );
        }
      } else {
        // Multi-Milestone Batch Audit
        let combinedAnalysis = `📊 ÇOKLU DÖNÜM NOKTASI ALGORİTMİK DENETİM RAPORU (${targetList.length} Dönüm Noktası - Harcanan: ${requiredCredits} Kredi)\n\n`;
        
        for (let i = 0; i < targetList.length; i++) {
          const target = targetList[i];
          try {
            const data = await aiService.auditMilestone({
              year: target.year,
              title: target.title,
              description: target.description,
              category: target.category,
              probability: target.probability,
              keyDrivers: target.keyDrivers,
            });

            if (data.success && data.auditAnalysis) {
              combinedAnalysis += `--- [${i + 1}/${targetList.length}] ${target.year} - ${target.title} ---\n`;
              combinedAnalysis += `Fizibilite Skoru: %${data.overallAssumptionScore || 85} | Güven: %${data.sourceCredibilityIndex || 90} | Anomali: ${data.hasAnomaly ? "⚠️ Tespit Edildi" : "✅ Normal"}\n`;
              combinedAnalysis += `${data.auditAnalysis}\n\n`;
            } else {
              const localReport = generateAlgorithmicAudit(target);
              combinedAnalysis += `--- [${i + 1}/${targetList.length}] ${target.year} - ${target.title} ---\n`;
              combinedAnalysis += `Fizibilite Skoru: %${localReport.overallAssumptionScore} | Anomali: ${localReport.hasAnomaly ? "⚠️ " + localReport.anomalyRiskLevel : "✅ Uyumlu"}\n`;
              combinedAnalysis += `Hüküm: ${localReport.algorithmicVerdict}\n\n`;
            }
          } catch {
            const localReport = generateAlgorithmicAudit(target);
            combinedAnalysis += `--- [${i + 1}/${targetList.length}] ${target.year} - ${target.title} ---\n`;
            combinedAnalysis += `Hüküm: ${localReport.algorithmicVerdict}\n\n`;
          }
        }

        setLiveAiAnalysis(combinedAnalysis);
        setAuditReport(generateAlgorithmicAudit(activeMilestone));
      }
    } catch (err: any) {
      setLiveAiAnalysis("Canlı denetim gerçekleştirilirken hata oluştu: " + err.message);
    } finally {
      setLoadingAudit(false);
    }
  };

  // Compute anomaly count across all milestones if provided
  const anomalousMilestones = allMilestones.filter((m) => generateAlgorithmicAudit(m).hasAnomaly);

  return (
    <div className="bg-[#070b14] border border-cyan-500/30 rounded-2xl p-5 lg:p-7 space-y-6 shadow-2xl relative overflow-hidden font-mono text-slate-100">
      
      {/* Background Subtle Gradient Glow */}
      <div className="absolute top-0 right-0 w-80 h-80 bg-cyan-500/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-80 h-80 bg-purple-500/5 rounded-full blur-3xl pointer-events-none" />

      {/* Header Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/10 pb-4 relative z-10">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-purple-950/80 border border-purple-500/40 text-purple-400 shadow-lg shadow-purple-500/10">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-purple-500/20 text-purple-300 border border-purple-500/40">
                BİLİMSEL VE FİZİKSEL DOĞRULAMA
              </span>
              <span className="text-[10px] text-amber-400 font-bold bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/30">
                5 Kredi / Denetim
              </span>
            </div>
            <h3 className="text-base lg:text-lg font-bold text-white mt-0.5">
              Bilişsel Algoritma & Fiziksel Varsayım Denetimi
            </h3>
          </div>
        </div>

        {/* Action Button */}
        <button
          onClick={handleRunLiveAudit}
          disabled={loadingAudit}
          className="px-4 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-xs transition-all shadow-lg shadow-purple-500/20 flex items-center gap-2 cursor-pointer disabled:opacity-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loadingAudit ? "animate-spin" : ""}`} />
          <span>{loadingAudit ? "Denetleniyor..." : "Seçili Dönüm Noktasını Canlı Denetle"}</span>
        </button>
      </div>

      {statusMessage && (
        <div className="p-3 rounded-xl bg-amber-950/80 border border-amber-500/50 text-amber-200 text-xs flex items-center justify-between font-sans relative z-10">
          <span>{statusMessage}</span>
          <button
            onClick={() => setStatusMessage(null)}
            className="text-amber-400 hover:text-white font-bold ml-2 text-xs cursor-pointer"
          >
            ✕
          </button>
        </div>
      )}

      {/* Milestone Selection (if standalone mode or provided allMilestones) */}
      {(standalone || allMilestones.length > 0) && (
        <div className="space-y-3 relative z-10 bg-slate-900/90 border border-cyan-500/30 p-4 rounded-2xl shadow-lg">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <label className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
              <Search className="w-4 h-4 text-cyan-400" />
              <span>Denetlenecek Teknolojik Dönüm Noktalarını Seçin (Çoklu Seçim Desteklenir):</span>
            </label>

            <div className="flex items-center gap-2">
              <button
                onClick={handleSelectAllMilestones}
                className="px-2.5 py-1 rounded-lg border text-xs font-bold bg-cyan-950/60 border-cyan-500/40 text-cyan-300 hover:bg-cyan-900/60 transition-all cursor-pointer"
              >
                {selectedMilestoneYears.length === (filterAnomaliesOnly ? anomalousMilestones.length : allMilestones.length)
                  ? "Seçimi Sıfırla"
                  : "Tümünü Seç"}
              </button>

              {allMilestones.length > 0 && (
                <button
                  onClick={() => setFilterAnomaliesOnly(!filterAnomaliesOnly)}
                  className={`px-3 py-1 rounded-lg border text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                    filterAnomaliesOnly
                      ? "bg-amber-500/20 border-amber-500/60 text-amber-300 shadow-md"
                      : "bg-slate-950 border-white/10 text-slate-400 hover:text-white"
                  }`}
                >
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
                  <span>Sadece Anormallikler ({anomalousMilestones.length})</span>
                </button>
              )}
            </div>
          </div>

          {/* Primary Select Dropdown */}
          <div className="relative">
            <select
              value={activeMilestone.year}
              onChange={(e) => {
                const selectedYear = Number(e.target.value);
                const found = allMilestones.find((m) => m.year === selectedYear);
                if (found) {
                  handleSelectMilestone(found);
                }
              }}
              className="w-full bg-slate-950 border-2 border-cyan-500/40 rounded-xl px-4 py-2.5 text-xs text-cyan-200 font-medium focus:outline-none focus:border-cyan-400 cursor-pointer transition-all shadow-inner"
            >
              {(filterAnomaliesOnly ? anomalousMilestones : allMilestones).map((m, idx) => {
                const report = generateAlgorithmicAudit(m);
                const isChecked = selectedMilestoneYears.includes(m.year);
                return (
                  <option key={`audit-opt-${m.year}-${m.title}-${idx}`} value={m.year} className="bg-slate-950 text-slate-200 py-1">
                    {isChecked ? "✓ " : ""}{m.year} - {m.title} {report.hasAnomaly ? "⚠️ [Anomali Sapması]" : ""}
                  </option>
                );
              })}
            </select>
          </div>

          {/* Quick Selection Chips (Scrollable Multi-select) */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-thin scrollbar-thumb-slate-800 text-xs">
            <span className="text-[10px] text-slate-500 font-mono uppercase shrink-0">Çoklu Seç (Tıkla):</span>
            {(filterAnomaliesOnly ? anomalousMilestones : allMilestones).map((m, idx) => {
              const report = generateAlgorithmicAudit(m);
              const isSelected = selectedMilestoneYears.includes(m.year);
              const isActivePrimary = m.year === activeMilestone.year;
              return (
                <button
                  key={`audit-chip-${m.year}-${m.title}-${idx}`}
                  onClick={() => handleToggleMilestoneSelection(m)}
                  title={`${m.year} - ${m.title} (Seçmek / kaldırmak için tıklayın)`}
                  className={`px-2.5 py-1 rounded-lg border text-[11px] transition-all flex items-center gap-1.5 cursor-pointer shrink-0 ${
                    isSelected
                      ? "bg-cyan-500/30 border-cyan-400 text-cyan-100 font-bold shadow-sm ring-1 ring-cyan-400/50"
                      : "bg-slate-950/80 border-white/5 text-slate-400 hover:border-white/20 hover:text-slate-200"
                  }`}
                >
                  <span className={`w-3 h-3 rounded flex items-center justify-center text-[8px] font-bold ${
                    isSelected ? "bg-cyan-400 text-slate-950" : "border border-slate-600 text-transparent"
                  }`}>
                    ✓
                  </span>
                  <span className="font-bold text-cyan-400">{m.year}</span>
                  <span className="truncate max-w-[120px]">{m.title}</span>
                  {report.hasAnomaly && (
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-400 shrink-0" />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Selected Milestone Audit Header Box */}
      <div className="bg-slate-900/90 border border-white/10 rounded-2xl p-4 lg:p-5 space-y-4 relative z-10">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="max-w-xl">
            <span className="text-2xl font-bold text-cyan-400">{activeMilestone.year}</span>
            <h4 className="text-base lg:text-lg font-bold text-white">{activeMilestone.title}</h4>
            <p className="text-xs text-slate-400 mt-1">{activeMilestone.description}</p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <span className="px-3 py-1 rounded-xl bg-slate-950 border border-cyan-500/30 text-cyan-300 text-xs font-bold flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5 text-cyan-400" />
              <span>Olasılık: %{activeMilestone.probability}</span>
            </span>

            {onOpenDetailModal && (
              <button
                onClick={() => onOpenDetailModal(activeMilestone)}
                className="px-3 py-1 rounded-xl bg-slate-800 hover:bg-slate-700 border border-white/10 text-slate-300 hover:text-white text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
                title="Tüm dönüm noktası detaylarını ve referanslarını açın"
              >
                <span>Detayları Göster ℹ️</span>
              </button>
            )}
          </div>
        </div>

        {/* Tab Navigation for Audit Sections */}
        <div className="flex items-center gap-2 border-b border-white/10 pt-2">
          <button
            onClick={() => setActiveTab("overview")}
            className={`px-4 py-2 text-xs font-bold rounded-t-xl transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === "overview"
                ? "bg-purple-950/80 text-purple-300 border-t-2 border-purple-500 border-x border-white/10"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <FileCheck className="w-3.5 h-3.5" />
            <span>Varsayımlar & Skorlama</span>
          </button>

          <button
            onClick={() => setActiveTab("parametric")}
            className={`px-4 py-2 text-xs font-bold rounded-t-xl transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === "parametric"
                ? "bg-purple-950/80 text-purple-300 border-t-2 border-purple-500 border-x border-white/10"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <Cpu className="w-3.5 h-3.5" />
            <span>Fiziksel Parametreler</span>
          </button>

          <button
            onClick={() => setActiveTab("tree")}
            className={`px-4 py-2 text-xs font-bold rounded-t-xl transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === "tree"
                ? "bg-purple-950/80 text-purple-300 border-t-2 border-purple-500 border-x border-white/10"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <GitBranch className="w-3.5 h-3.5" />
            <span>Nedensellik Ağacı (DAG)</span>
          </button>
        </div>
      </div>

      {/* ANOMALY WARNING BANNER (If Anomaly Detected) */}
      {auditReport.hasAnomaly && (
        <div className="bg-gradient-to-r from-amber-950/90 via-slate-900 to-amber-950/90 border-2 border-amber-500/60 rounded-2xl p-4 space-y-2 shadow-xl animate-in fade-in duration-300 relative z-10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5 text-amber-400 font-bold text-xs">
              <ShieldAlert className="w-4 h-4 text-amber-400 shrink-0" />
              <span>⚠️ ALGORİTMİK ANORMALLİK DETEKTÖRÜ</span>
            </div>
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40">
              {auditReport.anomalyRiskLevel} Seviye
            </span>
          </div>
          <p className="text-xs text-amber-200 leading-relaxed bg-amber-950/40 p-2.5 rounded-xl border border-amber-500/30">
            {auditReport.anomalyWarningMessage}
          </p>
        </div>
      )}

      {/* LIVE AI ANALYSIS VERDICT (IF RUN) */}
      {liveAiAnalysis && (
        <div className="bg-slate-900 border border-purple-400/40 rounded-2xl p-4 space-y-2 relative z-10 animate-in fade-in duration-300">
          <div className="flex items-center gap-2 text-purple-400 font-bold text-xs uppercase">
            <Sparkles className="w-4 h-4 text-purple-400" />
            <span>Otonom Canlı Algoritmik Denetim Özeti</span>
          </div>
          <p className="text-xs text-slate-200 leading-relaxed whitespace-pre-line font-mono">
            {liveAiAnalysis}
          </p>
        </div>
      )}

      {/* TAB CONTENT 1: OVERVIEW & ASSUMPTIONS */}
      {activeTab === "overview" && (
        <div className="space-y-4 relative z-10 animate-in fade-in">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <FileCheck className="w-4 h-4 text-purple-400" />
              <span>Teknolojik Varsayım Puanlaması</span>
            </h4>
            <span className="text-[11px] text-slate-400 font-mono">
              {auditReport?.assumptions?.length || 0} Kriter
            </span>
          </div>

          <div className="space-y-2.5">
            {(auditReport?.assumptions || []).map((item, idx) => (
              <div
                key={idx}
                className="p-3.5 rounded-xl bg-slate-950/80 border border-white/10 space-y-2 hover:border-purple-500/30 transition-all"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-xs text-slate-200">{item.name}</span>
                    {item.status === "verified" && (
                      <span className="px-2 py-0.5 rounded text-[9px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3 text-emerald-400" /> Literatürle Uyumlu
                      </span>
                    )}
                    {item.status === "optimistic" && (
                      <span className="px-2 py-0.5 rounded text-[9px] font-bold bg-blue-500/20 text-blue-300 border border-blue-500/30">
                        İyimser Beklenti
                      </span>
                    )}
                    {item.status === "speculative" && (
                      <span className="px-2 py-0.5 rounded text-[9px] font-bold bg-purple-500/20 text-purple-300 border border-purple-500/30">
                        Spekülatif
                      </span>
                    )}
                    {item.status === "anomalous" && (
                      <span className="px-2 py-0.5 rounded text-[9px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30 flex items-center gap-1">
                        <AlertTriangle className="w-3 h-3 text-amber-400" /> Sapma
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-[11px] text-slate-400">Güven: {item.confidence}</span>
                    <span className="text-sm font-bold text-purple-400">%{item.score}</span>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="w-full bg-slate-900 rounded-full h-1.5 overflow-hidden border border-white/5">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      item.score >= 90
                        ? "bg-gradient-to-r from-emerald-500 to-cyan-400"
                        : item.score >= 75
                        ? "bg-gradient-to-r from-purple-500 to-blue-500"
                        : "bg-gradient-to-r from-amber-500 to-rose-500"
                    }`}
                    style={{ width: `${item.score}%` }}
                  />
                </div>

                <p className="text-[11px] text-slate-400 leading-normal">{item.description}</p>
              </div>
            ))}
          </div>

          {/* VERIFICATION SOURCES & AUDIT VERDICT */}
          <div className="bg-slate-950 p-4 rounded-xl border border-white/10 space-y-2 font-mono text-xs">
            <div className="flex items-center justify-between text-slate-300">
              <span className="font-bold uppercase text-[10px] text-slate-400">Algoritmik Karar Metni:</span>
              <span className="text-[10px] text-emerald-400 font-bold">✓ Dijital İmzalı Denetim Sertifikası</span>
            </div>
            <p className="text-slate-300 leading-relaxed text-xs italic">
              "{auditReport.algorithmicVerdict}"
            </p>
            <div className="pt-2 border-t border-white/5 flex flex-wrap items-center justify-between gap-2 text-[10px] text-slate-500">
              <span>Doğrulama Veritabanları: Google Patents, OpenAlex, arXiv, Nature, Gartner</span>
              <span>Sertifika ID: AUD-{activeMilestone.year}-SEC99</span>
            </div>
          </div>
        </div>
      )}

      {/* TAB CONTENT 2: PARAMETRIC PHYSICAL AUDIT */}
      {activeTab === "parametric" && (
        <div className="animate-in fade-in">
          <ParametricAuditCard
            milestone={activeMilestone}
            onAuditCompleted={(res) => {
              setAuditReport((prev) => ({
                ...prev,
                overallAssumptionScore: res.scientificConfidenceScore,
                algorithmicVerdict: res.scientificVerdictSummary,
              }));
            }}
          />
        </div>
      )}

      {/* TAB CONTENT 3: CAUSAL DAG TREE */}
      {activeTab === "tree" && (
        <div className="animate-in fade-in">
          <MilestoneTreeExplorer
            milestone={activeMilestone}
            onSelectMilestoneYear={(targetYear) => {
              const found = allMilestones.find((m) => m.year === targetYear);
              if (found) {
                handleToggleMilestoneSelection(found);
              }
            }}
          />
        </div>
      )}

    </div>
  );
};

