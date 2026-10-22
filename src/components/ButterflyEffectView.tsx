import React, { useState } from "react";
import { Milestone } from "../types";
import { useLanguage } from "../context/LanguageContext";
import { useAuth } from "../context/AuthContext";
import { getFeatureCreditCost } from "../utils/creditCosts";
import { useDailyFeatureLimit } from "../utils/dailyLimitTracker";
import { GitFork, AlertTriangle, RefreshCw, Sparkles, Zap, ArrowRight, ShieldX, Play, RotateCcw, FileText } from "lucide-react";

import { getApiHeaders, safeFetchJson } from "../utils/apiClient";
import { AIService, aiService } from "../services/AIService";
import { autoHealingCredit } from "../utils/autoHealingCredit";
import { recordPredictionHistoryEntry } from "../utils/predictionHistory";
import { ViewMode } from "../types";
import { CrossFeatureRecommendation } from "./CrossFeatureRecommendation";
import { CounterfactualSimulator } from "./CounterfactualSimulator";

interface ButterflyEffectViewProps {
  milestones: Milestone[];
  onSelectMilestone: (m: Milestone) => void;
  onDeductCredits?: (amount: number) => boolean;
  onOpenCreditStore?: () => void;
  onNavigateToView?: (view: ViewMode, targetYear?: number) => void;
  currentUser?: any;
  onOpenAuthModal?: () => void;
  targetMilestone?: Milestone;
  targetYear?: number;
}

export const ButterflyEffectView: React.FC<ButterflyEffectViewProps> = ({
  milestones,
  onSelectMilestone,
  onDeductCredits: propOnDeductCredits,
  onOpenCreditStore: propOnOpenCreditStore,
  onNavigateToView,
  targetMilestone,
  targetYear,
}) => {
  const { language, t } = useLanguage();
  const auth = useAuth();
  const onDeductCredits = propOnDeductCredits || auth.deductCredits;
  const onOpenCreditStore = propOnOpenCreditStore || auth.openCreditStore;

  // Active Tab
  const [activeSubTab, setActiveSubTab] = useState<"counterfactual_whatif" | "classic_domino">("counterfactual_whatif");

  // Set of disabled milestone years
  const [disabledYears, setDisabledYears] = useState<number[]>([2030]); // Default AGI disabled for demo
  const [creditError, setCreditError] = useState<string | null>(null);
  const [loadingAi, setLoadingAi] = useState<boolean>(false);
  const [aiReport, setAiReport] = useState<{
    executiveSummary: string;
    consequences: string[];
  } | null>(null);

  const cost = getFeatureCreditCost("butterfly_effect", auth.plan);

  const { isLimitReached, remaining, dailyLimit, increment, hasFreeQuota } = useDailyFeatureLimit(
    "butterfly_effect",
    auth.plan,
    auth.currentUser?.email,
    auth.credits
  );

  const fetchAiButterflySimulation = async (updatedDisabledYears: number[]) => {
    setLoadingAi(true);
    try {
      const disabledTitles = (milestones || [])
        .filter((m) => updatedDisabledYears.includes(m.year))
        .map((m) => `${m.year} - ${m.title}`);

      const data = await aiService.analyze({
        type: "butterfly_effect",
        disabledYears: updatedDisabledYears,
        disabledMilestones: disabledTitles,
        language,
      });

      if (data.success && data.simulation) {
        setAiReport({
          executiveSummary: data.simulation.executiveSummary,
          consequences: data.simulation.consequences || [],
        });

        // Record to Prediction History
        const consequenceText = (data.simulation.consequences || [])
          .map((c: any) => `• [${c.year || "Zaman Akışı"}] ${c.title || ""}: ${c.description || ""}`)
          .join("\n");
        const outcome = `${data.simulation.executiveSummary}\n\nKaskat Sonuçlar:\n${consequenceText}`;

        recordPredictionHistoryEntry({
          userEmail: auth.currentUser?.email,
          featureKey: "butterfly_effect",
          featureName: "Kelebek Etkisi & Zaman Kırılması",
          queryTitle: `Alternatif Tarih Simülasyonu: ${disabledTitles.join(", ")} devredışı bırakılsaydı?`,
          queryInput: {
            prompt: `Devredışı bırakılan kırılımlar: ${disabledTitles.join(", ")}`,
            targetYear: updatedDisabledYears[0] || 2035,
            scenarioMode: "dystopian",
          },
          generatedOutcome: outcome,
          category: "Genel Gelecek",
          targetYear: updatedDisabledYears[0] || 2035,
          scenarioMode: "dystopian",
          creditsSpent: cost || 0,
          metrics: {
            feasibilityScore: 82,
            impactLevel: 95,
            riskLevel: "Yüksek",
            sentiment: "dystopian",
          },
          tags: ["Kelebek Etkisi", "Alternatif Zaman", `${updatedDisabledYears[0] || 2035}`],
        });
      } else {
        const isTimeout = (data.error || "").toLowerCase().includes("timeout") || data.code === "TIMEOUT";
        const httpStatus = data.status || (data.code?.startsWith("HTTP_") ? data.code.replace("HTTP_", "") : undefined);

        if (auth.currentUser?.email && (cost > 0 || !hasFreeQuota)) {
          autoHealingCredit({
            userEmail: auth.currentUser.email,
            featureKey: "butterfly_effect",
            featureName: "Kelebek Etkisi & Zaman Kırılması Simülasyonu",
            deductedCredits: cost,
            errorMessage: data.error || "200 dışı HTTP durum kodu",
            httpStatus,
            isTimeout,
            refundNote: `Sistem Kaynaklı İade: Kelebek Etkisi Simülasyonunda ${httpStatus ? 'HTTP ' + httpStatus : 'API hatası'} nedeniyle ${cost} kredi bakiye kurtarma yapıldı.`,
            onRefundCredits: (amount) => auth.addCredits(amount),
          });
          setCreditError(`⚠️ Simülasyon Hatası: ${data.error || "Sunucu yanıt vermedi"}. Harcanan ${cost} Krediniz 'Sistem Kaynaklı İade' ile ANINDA İADE EDİLDİ ⚡`);
        }
      }
    } catch (e: any) {
      console.error("Butterfly effect AI error:", e);
      const isTimeout = e?.name === "AbortError" || (e?.message || "").toLowerCase().includes("timeout");
      if (auth.currentUser?.email && (cost > 0 || !hasFreeQuota)) {
        autoHealingCredit({
          userEmail: auth.currentUser.email,
          featureKey: "butterfly_effect",
          featureName: "Kelebek Etkisi & Zaman Kırılması Simülasyonu",
          deductedCredits: cost,
          errorMessage: e?.message || "Bağlantı hatası",
          isTimeout,
          refundNote: `Sistem Kaynaklı İade: Kelebek Etkisi Simülasyonunda bağlantı/timeout hatası nedeniyle ${cost} kredi iade edildi.`,
          onRefundCredits: (amount) => auth.addCredits(amount),
        });
        setCreditError(`⚠️ Bağlantı hatası: ${e?.message || "Sunucuya ulaşılamadı"}. Harcanan ${cost} Krediniz 'Sistem Kaynaklı İade' ile ANINDA İADE EDİLDİ ⚡`);
      }
    } finally {
      setLoadingAi(false);
    }
  };

  const toggleMilestoneDisabled = (year: number) => {
    const isTurningOff = !disabledYears.includes(year);

    // Deduct Credits or consume free daily quota if turning OFF a milestone
    if (isTurningOff) {
      if (onDeductCredits) {
        const success = onDeductCredits(cost, "butterfly_effect");
        if (!success) {
          return;
        }
      } else {
        increment();
      }
    }

    setCreditError(null);
    const updated = disabledYears.includes(year)
      ? disabledYears.filter((y) => y !== year)
      : [...disabledYears, year];

    setDisabledYears(updated);
    if (updated.length > 0) {
      fetchAiButterflySimulation(updated);
    } else {
      setAiReport(null);
    }
  };

  const resetAll = () => {
    setDisabledYears([]);
    setAiReport(null);
  };

  // Calculate domino delay for each milestone
  // If a milestone or its dependencies are disabled, downstream milestones delay by +3 to +7 years
  const calculatedTimeline = (milestones || []).map((m) => {
    let extraDelay = 0;
    let isDisabledDirectly = disabledYears.includes(m.year);

    // Check if any related prior year was disabled
    (m.relatedYears || []).forEach((relatedYear) => {
      if (relatedYear < m.year && disabledYears.includes(relatedYear)) {
        extraDelay += 4;
      }
    });

    // Also cascade if any milestone occurring earlier is disabled
    disabledYears.forEach((dYear) => {
      if (dYear < m.year && !(m.relatedYears || []).includes(dYear)) {
        extraDelay += 1.5;
      }
    });

    const revisedYear = isDisabledDirectly
      ? m.year + 15
      : Math.min(2075, m.year + Math.round(extraDelay));

    return {
      ...m,
      revisedYear,
      isDelayed: revisedYear > m.year,
      isDisabledDirectly,
      delayAmount: revisedYear - m.year,
    };
  });

  const baseSingularityYear = 2045;
  const singularityMilestone = calculatedTimeline.find((m) => m.year === 2045);
  const revisedSingularityYear = singularityMilestone ? singularityMilestone.revisedYear : 2045;

  return (
    <div className="space-y-6 pb-12">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-purple-950/60 via-slate-900 to-amber-950/60 border border-purple-500/30 rounded-2xl p-6 lg:p-8 backdrop-blur-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          <div className="space-y-3 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/30 text-purple-400 font-mono text-xs font-bold uppercase">
              <GitFork className="w-3.5 h-3.5 animate-pulse" />
              <span>Dallanan Kelebek Etkisi Simülatörü // "Ya Şu Olmasaydı?"</span>
            </div>

            <h2 className="text-2xl lg:text-3xl font-bold tracking-tight text-white uppercase">
              Kritik Kırılmaları İptal Edin, Geleceği Yeniden Hesaplayın
            </h2>

            <p className="text-slate-300 text-sm leading-relaxed">
              Tarihteki bir teknolojik dönüm noktasını iptal ettiğinizde veya yasakladığınızda domino etkisiyle geleceğin nasıl ertelendiğini ve Singularity tarihinin nasıl kaydığını canlı simüle edin.
            </p>
          </div>

          {/* Singularity Impact Box */}
          <div className="bg-slate-900/90 border border-purple-500/40 rounded-2xl p-5 min-w-[260px] text-center shadow-xl shadow-purple-500/5 space-y-2">
            <div className="flex items-center justify-between text-[10px] font-mono uppercase tracking-widest text-slate-400">
              <span>Revize Singularity Yılı</span>
              <span className="text-amber-400 font-bold px-1.5 py-0.5 bg-amber-500/10 border border-amber-500/30 rounded">
                {cost === 0 ? "VIP Ücretsiz" : `${cost} Kredi / İşlem`}
              </span>
            </div>

            <div className="flex items-center justify-center gap-3 font-mono">
              <span className="text-xl text-slate-500 line-through">2045</span>
              <ArrowRight className="w-4 h-4 text-purple-400" />
              <span className="text-3xl font-extrabold text-amber-400">
                {revisedSingularityYear}
              </span>
            </div>

            <p className="text-[11px] text-amber-300/90 font-mono bg-amber-950/40 border border-amber-500/20 py-1 px-2 rounded-lg">
              +{revisedSingularityYear - 2045} Yıl Gecikmeli Kelebek Etkisi
            </p>

            <button
              onClick={resetAll}
              className="mt-2 w-full py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-mono text-[11px] font-bold border border-white/10 flex items-center justify-center gap-1.5 transition-all cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Simülasyonu Sıfırla</span>
            </button>
          </div>
        </div>

        {/* Active Milestone Context Banner if coming from timeline */}
        {targetMilestone && (
          <div className="pt-3 border-t border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2.5">
              <span className="px-2.5 py-1 rounded-lg bg-purple-500/20 text-purple-300 font-mono font-bold border border-purple-500/30 shrink-0">
                🦋 {targetMilestone.year} DÖNÜM NOKTASI
              </span>
              <span className="text-slate-300">
                <strong className="text-white">{targetMilestone.title}</strong> teknolojisini inceliyordunuz. Bu teknoloji için karşı-olgusal ve domino simülasyonu aktif edildi.
              </span>
            </div>
            {onNavigateToView && (
              <button
                type="button"
                onClick={() => onNavigateToView("timeline", targetMilestone.year)}
                className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-purple-300 hover:text-white border border-purple-500/30 font-mono text-[11px] font-bold transition flex items-center gap-1.5 shrink-0 self-start sm:self-auto cursor-pointer"
              >
                <span>🕒 Takvime Dön ({targetMilestone.year})</span>
              </button>
            )}
          </div>
        )}

        {/* Tab Selection Switcher */}
        <div className="mt-4 pt-4 border-t border-white/10 flex flex-wrap items-center gap-2 font-mono">
          <button
            onClick={() => setActiveSubTab("counterfactual_whatif")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
              activeSubTab === "counterfactual_whatif"
                ? "bg-purple-600 text-white shadow-lg shadow-purple-500/20"
                : "bg-slate-900 text-slate-400 hover:text-white"
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>🌌 What-If: Paralel Zaman Çizgisi Simülatörü</span>
          </button>
          <button
            onClick={() => setActiveSubTab("classic_domino")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
              activeSubTab === "classic_domino"
                ? "bg-amber-600 text-white shadow-lg shadow-amber-500/20"
                : "bg-slate-900 text-slate-400 hover:text-white"
            }`}
          >
            <GitFork className="w-3.5 h-3.5" />
            <span>🛑 Klasik Teknoloji İptal & Domino Tablosu</span>
          </button>
        </div>
      </div>

      {/* Credit Error Alert */}
      {creditError && (
        <div className="p-4 bg-red-950/90 border border-red-500/50 rounded-2xl text-red-200 text-xs font-mono flex items-center justify-between shadow-xl">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-red-400" />
            <span>{creditError}</span>
          </div>
          <button
            onClick={onOpenCreditStore}
            className="px-3 py-1 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-lg transition-all cursor-pointer"
          >
            Kredi Yükle
          </button>
        </div>
      )}

      {/* RENDER ACTIVE TAB */}
      {activeSubTab === "counterfactual_whatif" ? (
        <CounterfactualSimulator
          milestones={milestones || []}
          onSelectMilestone={onSelectMilestone}
          selectedMilestone={targetMilestone}
          targetYear={targetYear}
        />
      ) : (
        <>
          {/* AI Generated Alternative Universe Report Banner */}
      {(loadingAi || aiReport) && (
        <div className="bg-slate-900/90 border border-purple-500/40 rounded-2xl p-6 space-y-4 font-mono text-slate-200 shadow-2xl backdrop-blur-xl animate-in fade-in duration-300">
          <div className="flex items-center justify-between border-b border-white/10 pb-3">
            <div className="flex items-center gap-2 text-purple-400 font-bold">
              <Sparkles className="w-5 h-5 text-purple-400 animate-pulse" />
              <span>✓ Derin Kuantum Nedensellik Raporu (25 Kredi)</span>
            </div>
            <span className="text-xs text-amber-300 bg-amber-950/80 px-2.5 py-0.5 rounded border border-amber-500/30">
              {loadingAi ? "Kuantum Evren Zinciri Hesaplanıyor..." : "Alternatif Gelecek Evreni"}
            </span>
          </div>

          {loadingAi ? (
            <div className="py-6 text-center space-y-2">
              <RefreshCw className="w-6 h-6 text-purple-400 animate-spin mx-auto" />
              <p className="text-xs text-slate-400">İptal edilen teknolojilerin 50 yıllık domino etkileri ve sosyo-ekonomik kırılmaları simüle ediliyor...</p>
            </div>
          ) : (
            aiReport && (
              <div className="space-y-4">
                <div className="p-4 rounded-xl bg-purple-950/30 border border-purple-500/30 space-y-1">
                  <span className="text-xs text-purple-300 font-bold uppercase block">Kuantum Kırılma Özeti:</span>
                  <p className="text-xs text-slate-300 leading-relaxed font-sans">{aiReport.executiveSummary}</p>
                </div>

                <div className="space-y-2">
                  <span className="text-xs text-amber-300 font-bold uppercase block">Tespit Edilen Zincirleme Sonuçlar:</span>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                    {aiReport.consequences.map((c, i) => (
                      <div key={i} className="p-3 rounded-xl bg-slate-950 border border-white/5 space-y-1">
                        <span className="text-amber-400 font-bold text-[10px]">Sonuç 0{i + 1}</span>
                        <p className="text-slate-300 text-[11px] font-sans leading-normal">{c}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )
          )}
        </div>
      )}

      {/* Cross-Feature Recommendation Bridges */}
      {onNavigateToView && (
        <CrossFeatureRecommendation
          sourceView="butterfly"
          onNavigate={(view, targetYear) => onNavigateToView(view, targetYear)}
          onOpenCreditStore={onOpenCreditStore}
        />
      )}

      {/* Grid of Interactive Milestones */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {calculatedTimeline.map((item, idx) => (
          <div
            key={`butterfly-${item.year}-${item.title}-${idx}`}
            className={`bg-slate-900/60 border rounded-2xl p-5 space-y-4 transition-all flex flex-col justify-between ${
              item.isDisabledDirectly
                ? "border-red-500/60 bg-red-950/20 opacity-75"
                : item.isDelayed
                ? "border-amber-500/40 bg-amber-950/10"
                : "border-white/5 hover:border-purple-500/30"
            }`}
          >
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 font-mono">
                  <span className={`text-lg font-bold ${item.isDelayed ? "line-through text-slate-500" : "text-purple-400"}`}>
                    {item.year}
                  </span>

                  {item.isDelayed && (
                    <span className="text-lg font-extrabold text-amber-400 flex items-center gap-1">
                      <ArrowRight className="w-3.5 h-3.5" />
                      <span>{item.revisedYear}</span>
                    </span>
                  )}
                </div>

                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-400">
                  {item.category}
                </span>
              </div>

              <h3
                onClick={() => onSelectMilestone(item)}
                className="font-bold text-white text-sm hover:text-purple-300 cursor-pointer transition-colors"
              >
                {item.title}
              </h3>

              <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                {item.description}
              </p>
            </div>

            {/* Toggle Butterfly Action Button */}
            <div className="pt-3 border-t border-white/5 flex items-center justify-between">
              {item.isDelayed && !item.isDisabledDirectly && (
                <span className="text-[10px] font-mono text-amber-400 font-semibold flex items-center gap-1">
                  <AlertTriangle className="w-3 h-3" />
                  <span>+{item.delayAmount} Yıl Ertelendi</span>
                </span>
              )}

              {item.isDisabledDirectly && (
                <span className="text-[10px] font-mono text-red-400 font-semibold flex items-center gap-1">
                  <ShieldX className="w-3 h-3" />
                  <span>İptal Edildi / Yasaklandı</span>
                </span>
              )}

              {!item.isDelayed && !item.isDisabledDirectly && (
                <span className="text-[10px] font-mono text-emerald-400">Normal Akışında</span>
              )}

              <button
                disabled={!item.isDisabledDirectly && isLimitReached}
                onClick={() => toggleMilestoneDisabled(item.year)}
                className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold transition-all border ${
                  item.isDisabledDirectly
                    ? "bg-emerald-600 hover:bg-emerald-500 text-white border-emerald-400 cursor-pointer"
                    : isLimitReached
                    ? "bg-slate-800 text-red-400 border-red-500/40 cursor-not-allowed"
                    : "bg-red-950/80 hover:bg-red-900/80 text-red-300 border-red-500/30 cursor-pointer"
                }`}
              >
                {item.isDisabledDirectly
                  ? "Yeniden Etkinleştir"
                  : isLimitReached
                  ? "Yetersiz Kredi"
                  : "İptal Et (Yasakla)"}
              </button>
            </div>
          </div>
        ))}
      </div>
      </>
      )}
    </div>
  );
};
