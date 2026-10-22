import React, { useState, useMemo } from "react";
import { Milestone, SubMilestoneBranch } from "../types";
import { useLanguage } from "../context/LanguageContext";
import { useAuth } from "../context/AuthContext";
import { aiService } from "../services/AIService";
import { buildAndPropagateCausalDag, DagPropagationResult } from "../utils/causalDagEngine";
import {
  GitFork,
  AlertTriangle,
  RefreshCw,
  Sparkles,
  Zap,
  ArrowRight,
  TrendingDown,
  TrendingUp,
  ShieldX,
  Play,
  RotateCcw,
  CheckCircle2,
  Cpu,
  Layers,
  ChevronRight,
  Split,
  Globe,
  Sliders
} from "lucide-react";

interface CounterfactualSimulatorProps {
  milestones: Milestone[];
  onSelectMilestone?: (milestone: Milestone) => void;
  selectedMilestone?: Milestone;
  targetYear?: number;
}

interface ParallelRealityScenario {
  scenarioTitle: string;
  divergenceYear: number;
  macroParadigmShift: string;
  cascadingImpacts: {
    domain: string;
    delayOrAdvanceYears: number; // e.g. -3 (accelerated) or +6 (delayed)
    impactSummary: string;
    alternativeTechEmerged: string;
  }[];
  revisedSingularityYear: number;
  societalAndEconomicShock: string;
  scientificVerdict: string;
}

export const CounterfactualSimulator: React.FC<CounterfactualSimulatorProps> = ({
  milestones,
  onSelectMilestone,
  selectedMilestone,
  targetYear,
}) => {
  const { language } = useLanguage();
  const { deductCredits, openCreditStore, plan } = useAuth();

  // Mode: "collapse" (Teknoloji devredışı/çöktü) OR "quantum_leap" (Beklenmedik erken sıçrama)
  const [simulationMode, setSimulationMode] = useState<"collapse" | "quantum_leap">("collapse");
  const [selectedTargetYear, setSelectedTargetYear] = useState<number>(() => {
    return selectedMilestone?.year || targetYear || 2029;
  });
  const [customCondition, setCustomCondition] = useState<string>("");

  React.useEffect(() => {
    if (selectedMilestone?.year) {
      setSelectedTargetYear(selectedMilestone.year);
    } else if (targetYear) {
      setSelectedTargetYear(targetYear);
    }
  }, [selectedMilestone, targetYear]);
  
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [parallelReality, setParallelReality] = useState<ParallelRealityScenario | null>(null);

  // Dynamic DAG Simulation State
  const targetMilestone = useMemo(() => {
    return milestones.find((m) => m.year === selectedTargetYear) || milestones[0];
  }, [milestones, selectedTargetYear]);

  // Run live Counterfactual "What-If" AI Engine
  const handleRunCounterfactualSimulation = async () => {
    if (!deductCredits(10)) {
      setErrorMsg("Paralel Zaman Çizgisi Simülasyonu için 10 Kredi gereklidir.");
      if (openCreditStore) openCreditStore();
      return;
    }

    setIsLoading(true);
    setErrorMsg(null);

    try {
      const modePrompt =
        simulationMode === "collapse"
          ? `[KRİTİK DARBOĞAZ VE ÇÖKÜŞ SENARYOSU]: ${targetMilestone.year} yılındaki "${targetMilestone.title}" teknolojisi gerçekleşmedi, mühendislik/termodinamik sınırlarına takıldı veya küresel bir moratoryumla yasaklandı.`
          : `[BEKLENMEDİK ERKEN SIÇRAMA / KUANTUM SIÇRAMASI]: ${targetMilestone.year} yılındaki "${targetMilestone.title}" teknolojisi beklenenden 4-5 yıl önce beklenmedik bir laboratuvar atılımıyla 2026-2027 bandında tamamen çözüldü!`;

      const additionalContext = customCondition.trim()
        ? `Özel Kullanıcı Koşulu: "${customCondition.trim()}"`
        : "";

      const res = await aiService.analyzeCustomScenario({
        prompt: `${modePrompt}\n${additionalContext}\nBu durumun 2026-2060 arasındaki tüm yapay zeka, enerji, biyoteknoloji, robotik ve Singularity takviminde yarattığı DOMİNO ETKİSİNİ ve türeyen ALTERNATİF TEKNOLOJİLERİ hesapla.`,
        targetYear: targetMilestone.year,
        scenarioMode: simulationMode === "collapse" ? "dystopian" : "utopian",
        language,
      });

      if (res.success && res.scenario) {
        setParallelReality({
          scenarioTitle: res.scenario.title || `${targetMilestone.year} ${simulationMode === "collapse" ? "Çöküş" : "Sıçrama"} Zaman Kırılması`,
          divergenceYear: targetMilestone.year,
          macroParadigmShift: res.scenario.summary || "Küresel teknolojik yörünge kalıcı olarak kırıldı.",
          cascadingImpacts: (res.scenario.impacts || [
            {
              domain: "Yapay Zeka & Bilişim",
              delayOrAdvanceYears: simulationMode === "collapse" ? 8 : -4,
              impactSummary: simulationMode === "collapse" ? "Hesaplama gücü darboğazı nedeniyle AGI takvimi 2038'e ötelendi." : "Yapay zeka modelleri 100x verimlilikle özerk sistemlere dönüştü.",
              alternativeTechEmerged: simulationMode === "collapse" ? "Nöromorfik analog çipler ve biyolojik hesaplama" : "Özerk Kuantum Ajan Ağları",
            },
            {
              domain: "Enerji & Füzyon",
              delayOrAdvanceYears: simulationMode === "collapse" ? 5 : -3,
              impactSummary: simulationMode === "collapse" ? "Şebeke yükü krizine karşı nükleer fisyon SMR reaktörlerine zorunlu dönüş." : "Yapay zeka kontrollü plazma manyetik hapsetme rekor sürede çözüldü.",
              alternativeTechEmerged: simulationMode === "collapse" ? "Toryum Erimiş Tuz Reaktörleri" : "Kompakt Manyetik Füzyon Jeneratörleri",
            },
          ]).map((imp: any) => ({
            domain: imp.domain || imp.sector || "Genel Teknoloji",
            delayOrAdvanceYears: imp.delayYears || (simulationMode === "collapse" ? 4 : -3),
            impactSummary: imp.description || imp.summary || "",
            alternativeTechEmerged: imp.alternativeTech || "Hibrit Ara Çözümler",
          })),
          revisedSingularityYear: simulationMode === "collapse" ? targetMilestone.year + 12 : Math.max(2032, 2045 - 7),
          societalAndEconomicShock: res.scenario.economicImpact || "Küresel iş gücü ve teknoloji borsalarında asimetrik kırılma yaşandı.",
          scientificVerdict: res.scenario.verdict || "Teknolojik evrim tek bir hedefe bağlı değildir; bir kapı kapandığında alternatif biyolojik/fiziksel alt dallar patlama yaşar.",
        });
      } else {
        setErrorMsg(res.error || "Paralel simülasyon hesaplanamadı.");
      }
    } catch (e: any) {
      setErrorMsg(e.message || "Simülasyon hatası oluştu.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto font-mono text-slate-200">
      
      {/* 🌌 HERO BANNER & REALITY SPLIT HEADER */}
      <div className="bg-gradient-to-r from-purple-950/80 via-slate-950 to-indigo-950/80 border border-purple-500/40 rounded-2xl p-6 lg:p-8 shadow-2xl space-y-4 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-purple-300 bg-purple-950/80 px-2.5 py-0.5 rounded border border-purple-500/40 flex items-center gap-1.5">
                <Split className="w-3.5 h-3.5 text-purple-400" />
                <span>WHAT-IF & ALTERNATİF GERÇEKLİK MOTORU</span>
              </span>
              <span className="text-[10px] font-bold text-cyan-300 bg-cyan-950/80 px-2 py-0.5 rounded border border-cyan-500/30">
                Kaskat Kelebek Etkisi
              </span>
            </div>
            <h2 className="text-xl lg:text-3xl font-black text-white tracking-tight">
              Teknolojik Kelebek Etkisi: Bir Kırılmayı Değiştirin, Evreni Yeniden Yazın
            </h2>
            <p className="text-xs text-slate-300 font-sans leading-relaxed">
              "Eğer 2029'da AGI gerçekleşmezse veya 2032'de Nükleer Füzyon erken çözülürse ne olur?" 
              Seçtiğiniz teknolojiyi iptal edin veya aşırı hızlandırın; tüm 2026-2060 takviminin nasıl paralel bir evrene saptığını canlı izleyin.
            </p>
          </div>

          {/* Revised Singularity Gauge */}
          <div className="bg-slate-900/90 border border-purple-500/30 p-4 rounded-2xl text-center min-w-[220px] shadow-xl">
            <span className="text-[10px] text-slate-400 block uppercase">Revize Singularity Eşiği:</span>
            <div className="flex items-center justify-center gap-2 mt-1">
              <span className="text-sm text-slate-500 line-through">2045</span>
              <ArrowRight className="w-4 h-4 text-purple-400" />
              <span className={`text-2xl font-black ${parallelReality && parallelReality.revisedSingularityYear < 2045 ? "text-cyan-400" : "text-amber-400"}`}>
                {parallelReality ? parallelReality.revisedSingularityYear : "2045"}
              </span>
            </div>
            <span className="text-[9px] text-slate-400 block font-sans mt-0.5">
              {parallelReality
                ? parallelReality.revisedSingularityYear < 2045
                  ? `⚡ ${2045 - parallelReality.revisedSingularityYear} Yıl Öne Alındı`
                  : `⚠️ ${parallelReality.revisedSingularityYear - 2045} Yıl Gecikmeli`
                : "Standart Referans Çizgisi"}
            </span>
          </div>
        </div>

      </div>

      {/* 🎛️ SIMULATION CONTROLS & SELECTION BAR */}
      <div className="bg-slate-950 border border-white/10 rounded-2xl p-5 space-y-4">
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          
          {/* 1. Target Milestone Selector */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-bold text-slate-300 flex items-center gap-1.5">
              <Cpu className="w-3.5 h-3.5 text-cyan-400" />
              <span>Hedef Kırılma Noktası:</span>
            </label>
            <select
              value={selectedTargetYear}
              onChange={(e) => setSelectedTargetYear(parseInt(e.target.value, 10))}
              className="w-full bg-slate-900 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:border-purple-500 focus:outline-none"
            >
              {milestones.map((m, idx) => (
                <option key={`${m.year}-${m.title}-${idx}`} value={m.year}>
                  {m.year} — {m.title} ({m.category})
                </option>
              ))}
            </select>
          </div>

          {/* 2. Simulation Mode Selector (Collapse vs Quantum Leap) */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-bold text-slate-300 flex items-center gap-1.5">
              <Sliders className="w-3.5 h-3.5 text-purple-400" />
              <span>Zaman Çizgisi Müdahale Tipi:</span>
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setSimulationMode("collapse")}
                className={`py-2 px-2.5 rounded-xl border text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                  simulationMode === "collapse"
                    ? "bg-rose-950/80 border-rose-500 text-rose-200 shadow-md shadow-rose-500/20"
                    : "bg-slate-900 border-white/10 text-slate-400 hover:text-white"
                }`}
              >
                <TrendingDown className="w-3.5 h-3.5 text-rose-400" />
                <span>🛑 Darboğaz / Çöküş</span>
              </button>
              <button
                type="button"
                onClick={() => setSimulationMode("quantum_leap")}
                className={`py-2 px-2.5 rounded-xl border text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                  simulationMode === "quantum_leap"
                    ? "bg-cyan-950/80 border-cyan-400 text-cyan-200 shadow-md shadow-cyan-500/20"
                    : "bg-slate-900 border-white/10 text-slate-400 hover:text-white"
                }`}
              >
                <Zap className="w-3.5 h-3.5 text-cyan-400" />
                <span>⚡ Erken Sıçrama</span>
              </button>
            </div>
          </div>

          {/* 3. Action Button */}
          <div className="space-y-1.5 flex flex-col justify-end">
            <label className="text-[11px] font-bold text-slate-400 opacity-0 hidden md:block">Eylem</label>
            <button
              onClick={handleRunCounterfactualSimulation}
              disabled={isLoading}
              className="w-full py-2 px-4 rounded-xl bg-gradient-to-r from-purple-600 via-indigo-600 to-cyan-600 hover:from-purple-500 hover:to-cyan-500 text-white font-bold text-xs transition-all shadow-lg shadow-purple-500/20 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? "animate-spin" : ""}`} />
              <span>{isLoading ? "Paralel Evren Hesaplanıyor..." : "Paralel Gerçekliği Hesapla (6 Kredi)"}</span>
            </button>
          </div>

        </div>

        {/* Custom optional prompt input */}
        <div className="pt-2 border-t border-white/5">
          <input
            type="text"
            placeholder="İsteğe bağlı özel koşul (Örn: Çip ambargosu uygulandı, küresel enerji krizi çıktı veya oda sıcaklığında süper iletken bulundu...)"
            value={customCondition}
            onChange={(e) => setCustomCondition(e.target.value)}
            className="w-full bg-slate-900/70 border border-white/10 rounded-xl px-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:border-purple-500 focus:outline-none font-sans"
          />
        </div>

      </div>

      {errorMsg && (
        <div className="p-3 bg-rose-950/80 border border-rose-500/40 rounded-xl text-rose-200 text-xs flex items-center justify-between font-mono">
          <span>{errorMsg}</span>
          <button onClick={() => setErrorMsg(null)} className="text-rose-400 font-bold ml-2">✕</button>
        </div>
      )}

      {/* 🚀 PARALLEL REALITY OUTCOME COMPARISON BOARD */}
      {parallelReality && !isLoading && (
        <div className="space-y-6 animate-in fade-in duration-300">
          
          {/* Macro Shift Overview */}
          <div className="bg-slate-950 border border-purple-500/40 rounded-2xl p-5 lg:p-6 space-y-3 shadow-2xl">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-2">
                <Globe className="w-5 h-5 text-purple-400 animate-pulse" />
                <h3 className="text-base font-bold text-white uppercase tracking-wider">
                  PARALEL GERÇEKLİK: {parallelReality.scenarioTitle}
                </h3>
              </div>
              <span className="text-xs font-bold text-amber-400 bg-amber-500/10 px-2.5 py-1 rounded-full border border-amber-500/30">
                Kırılma Yılı: {parallelReality.divergenceYear}
              </span>
            </div>

            <p className="text-xs text-slate-200 font-sans leading-relaxed">
              {parallelReality.macroParadigmShift}
            </p>

            <div className="p-3 bg-purple-950/30 rounded-xl border border-purple-500/20 text-xs text-purple-200 font-sans">
              <strong className="text-purple-300 font-mono">Toplumsal & Ekonomik Şok: </strong>
              {parallelReality.societalAndEconomicShock}
            </div>
          </div>

          {/* Cascading Sectoral Domino Impact Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {parallelReality.cascadingImpacts.map((impact, idx) => {
              const isAdvance = impact.delayOrAdvanceYears < 0;
              return (
                <div
                  key={idx}
                  className={`p-4 rounded-xl border space-y-2.5 ${
                    isAdvance
                      ? "bg-cyan-950/20 border-cyan-500/30"
                      : "bg-rose-950/20 border-rose-500/30"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-white uppercase">
                      {impact.domain}
                    </span>
                    <span
                      className={`text-xs font-black px-2 py-0.5 rounded ${
                        isAdvance
                          ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/40"
                          : "bg-rose-500/20 text-rose-300 border border-rose-500/40"
                      }`}
                    >
                      {isAdvance
                        ? `${Math.abs(impact.delayOrAdvanceYears)} Yıl İleri Sıçradı`
                        : `+${impact.delayOrAdvanceYears} Yıl Gecikti`}
                    </span>
                  </div>

                  <p className="text-xs text-slate-300 font-sans leading-relaxed">
                    {impact.impactSummary}
                  </p>

                  <div className="pt-2 border-t border-white/5 text-[11px] text-slate-400">
                    <span className="text-amber-400 font-bold block">✨ Türeyen Alternatif Çözüm:</span>
                    <span className="text-slate-200 font-sans">{impact.alternativeTechEmerged}</span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Scientific Verdict */}
          <div className="p-4 bg-slate-900/90 border border-white/10 rounded-2xl text-xs space-y-1">
            <span className="text-[10px] font-bold text-cyan-400 uppercase block">
              ⚖️ Fütürist & Sistem Mühendisi Nihai Evrim Yorumu:
            </span>
            <p className="text-slate-200 font-sans leading-relaxed">
              "{parallelReality.scientificVerdict}"
            </p>
          </div>

        </div>
      )}

    </div>
  );
};
