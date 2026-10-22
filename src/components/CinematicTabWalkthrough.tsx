import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Sparkles,
  ArrowRight,
  ArrowLeft,
  X,
  Clock,
  Briefcase,
  Bot,
  Zap,
  Radio,
  Sliders,
  Compass,
  Layers,
  CheckCircle2,
  ChevronRight,
  Eye,
  Activity,
  GitBranch,
  Search,
  Cpu,
  BarChart3,
  ShieldCheck,
  Disc3,
  Scale
} from "lucide-react";
import { useLanguage } from "../context/LanguageContext";
import { ViewMode } from "../types";

export interface TabStepInfo {
  stepNumber: number;
  titleTr: string;
  titleEn: string;
  descTr: string;
  descEn: string;
  tipTr?: string;
  tipEn?: string;
  icon: React.ReactNode;
}

export interface TabTourConfig {
  code: string;
  tabTitleTr: string;
  tabTitleEn: string;
  accentColor: string; // Tailwind border & glow
  badgeColor: string;
  steps: TabStepInfo[];
}

const TAB_TOUR_REGISTRY: Partial<Record<ViewMode, TabTourConfig>> = {
  timeline: {
    code: "TIMELINE-SYS-01",
    tabTitleTr: "Zaman Çizelgesi & Teknoloji Radarı (2026—2060)",
    tabTitleEn: "Timeline & Technology Radar (2026—2060)",
    accentColor: "border-cyan-500/40 shadow-[0_0_35px_rgba(6,182,212,0.25)]",
    badgeColor: "bg-cyan-500/20 text-cyan-300 border-cyan-400/40",
    steps: [
      {
        stepNumber: 1,
        titleTr: "Kronolojik 2026—2060 Kırılma Noktaları",
        titleEn: "Chronological 2026—2060 Milestones",
        descTr:
          "2026'dan 2060'a uzanan 16 ana dönüm noktasını zaman şeridi üzerinde yatay kaydırarak veya yıl adımlarıyla inceleyebilirsiniz.",
        descEn:
          "Explore 16 major breakthroughs spanning 2026 to 2060 by scrubbing horizontally across the interactive timeline.",
        tipTr: "İpucu: Kartlara tıklayarak 5 katmanlı dünya durumu ve patent dokümanlarını görüntüleyin.",
        tipEn: "Tip: Click on any milestone card to open deep 5-layer world data and Google Patents.",
        icon: <Clock className="w-5 h-5 text-cyan-400" />
      },
      {
        stepNumber: 2,
        titleTr: "Dinamik Senaryo Çatallanması",
        titleEn: "Dynamic Scenario Matrix",
        descTr:
          "Üstteki menüden Baz Patika, İyimser (Ütopya) ve Distopik (Risk) senaryolarına anında geçiş yaparak geleceğin farklı dallarını simüle edin.",
        descEn:
          "Switch between Baseline, Optimistic (Utopia), and Dystopian (Risk) branches at any moment from the top switcher.",
        tipTr: "İpucu: Senaryo değiştiğinde gerçekleşme olasılıkları ve risk analizleri anında güncellenir.",
        tipEn: "Tip: Probability scores and ethical impacts recalibrate dynamically with each scenario.",
        icon: <Sparkles className="w-5 h-5 text-purple-400" />
      },
      {
        stepNumber: 3,
        titleTr: "Faz & Kategori Filtreleme",
        titleEn: "Phase & Domain Filters",
        descTr:
          "Phase 1 (Laboratuvar), Phase 2 (Erken Ticari) ve Phase 3 (Medeniyet Ölçeği) filtreleriyle teknolojinin olgunlaşma hızını takip edin.",
        descEn:
          "Track technology maturity with Phase 1 (Lab), Phase 2 (Early Commercial), and Phase 3 (Civilization Scale) filters.",
        tipTr: "İpucu: Sağ üstteki arama kutusuna 'Kuantum', 'AGI' veya 'Füzyon' yazarak hızlı filtreleyin.",
        tipEn: "Tip: Type 'Quantum', 'AGI', or 'Fusion' in the search bar for instant lookup.",
        icon: <Layers className="w-5 h-5 text-indigo-400" />
      }
    ]
  },

  persona_chat: {
    code: "TIME-TRAVELER-AI-02",
    tabTitleTr: "Zaman Yolcusu & Gelecek İnsanı Sohbeti",
    tabTitleEn: "Time Traveler & Future Persona Chat",
    accentColor: "border-cyan-500/40 shadow-[0_0_35px_rgba(6,182,212,0.25)]",
    badgeColor: "bg-cyan-500/20 text-cyan-300 border-cyan-400/40",
    steps: [
      {
        stepNumber: 1,
        titleTr: "Gelecek Çağını ve İnsanını Seçin",
        titleEn: "Choose Future Era and Persona",
        descTr:
          "2030, 2045 veya 2060 yıllarındaki sibernetik ve teknolojik insan modellerinden biriyle konuşmaya başlayın.",
        descEn:
          "Start communicating with simulated cybernetic or enhanced human models from 2030, 2045, or 2060.",
        tipTr: "İpucu: Farklı yıllardaki insanların yapay zeka entegrasyonu ve günlük rutinleri farklıdır.",
        tipEn: "Tip: Personas across different decades have unique philosophical views and interfaces.",
        icon: <Bot className="w-5 h-5 text-cyan-400" />
      },
      {
        stepNumber: 2,
        titleTr: "Canlı Nöral Diyalog",
        titleEn: "Live Neural Dialogue",
        descTr:
          "O dönemin yaşam şartları, meslekleri ve insan-makine birleşimi hakkında aklınıza gelen her şeyi sorun.",
        descEn:
          "Ask any questions about living conditions, jobs, and human-machine symbiosis in their timeline.",
        tipTr: "İpucu: Sorularınıza o dönemin kültürel ve teknolojik jargonuyla yanıt verirler.",
        tipEn: "Tip: They respond with period-authentic cultural perspectives and technological terminology.",
        icon: <Zap className="w-5 h-5 text-amber-400" />
      }
    ]
  },

  job_risk: {
    code: "CAREER-RISK-HUD-03",
    tabTitleTr: "Mesleki Risk Radarı & Kariyer Kalkanı",
    tabTitleEn: "Career Risk Radar & Adaptation Shield",
    accentColor: "border-rose-500/40 shadow-[0_0_35px_rgba(244,63,94,0.25)]",
    badgeColor: "bg-rose-500/20 text-rose-300 border-rose-400/40",
    steps: [
      {
        stepNumber: 1,
        titleTr: "Mesleğinizin Otomasyon Eşiği",
        titleEn: "Job Automation Threshold",
        descTr:
          "Mesleğinizi aratın veya popüler kariyer kartlarından seçin; yapay zeka ve robotik sistemlerin hangi görevleri ne zaman devralacağını görün.",
        descEn:
          "Search your profession or pick from featured roles to see automation timelines and task breakdown.",
        tipTr: "İpucu: 2026-2060 arası yıl kaydırıcısıyla otomasyon baskısının artış ivmesini izleyin.",
        tipEn: "Tip: Scrub through 2026-2060 to visualize accelerating automation pressure.",
        icon: <Briefcase className="w-5 h-5 text-rose-400" />
      },
      {
        stepNumber: 2,
        titleTr: "Geleceğe Dirençli Yetenek Önerileri",
        titleEn: "Future-Proof Reskilling Strategies",
        descTr:
          "Sistem, seçtiğiniz mesleği korumak ve geliştirmek için biyo-dijital yetenek ve yeni çağ uzmanlık alanlarını listeler.",
        descEn:
          "Get customized reskilling pathways and bio-digital capabilities to stay irreplaceable in the AI era.",
        tipTr: "İpucu: İki mesleği yan yana koyarak kıyaslama yapabilirsiniz.",
        tipEn: "Tip: Compare two jobs side-by-side to discover the safest transition paths.",
        icon: <CheckCircle2 className="w-5 h-5 text-emerald-400" />
      }
    ]
  },

  butterfly: {
    code: "BUTTERFLY-NODE-04",
    tabTitleTr: "Kelebek Etkisi & Çatallanan Gerçeklikler",
    tabTitleEn: "Butterfly Effect & Branching Realities",
    accentColor: "border-amber-500/40 shadow-[0_0_35px_rgba(245,158,11,0.25)]",
    badgeColor: "bg-amber-500/20 text-amber-300 border-amber-400/40",
    steps: [
      {
        stepNumber: 1,
        titleTr: "Mikro Karardan Küresel Sonuçlara",
        titleEn: "From Micro Decision to Global Consequence",
        descTr:
          "Tarihin veya geleceğin dönüm noktasındaki tek bir kararı değiştirin; örneğin AI açık kaynağı yasaklansaydı ne olurdu?",
        descEn:
          "Tweak a single historical or future turning point—like what if open-source AI was banned in 2026?",
        tipTr: "İpucu: Karar düğümlerine tıklayarak 1. seviye, 2. seviye ve 3. seviye sonuçları haritada görün.",
        tipEn: "Tip: Click decision nodes to uncover 1st, 2nd, and 3rd order consequential cascades.",
        icon: <GitBranch className="w-5 h-5 text-amber-400" />
      },
      {
        stepNumber: 2,
        titleTr: "2060 Nihai Medeniyet Durumu",
        titleEn: "2060 Final Civilization State",
        descTr:
          "Değiştirdiğiniz parametrenin 2060 yılındaki jeopolitik, ekolojik ve insani dengeyi nasıl dönüştürdüğünü canlı simülasyonla gözlemleyin.",
        descEn:
          "Watch how your selected choice reshapes the final 2060 geopolitical, ecological, and human equilibrium.",
        tipTr: "İpucu: Alternatif dalları kaydedip diğer senaryolarla karşılaştırabilirsiniz.",
        tipEn: "Tip: Save alternative reality trees and compare outcomes across runs.",
        icon: <Activity className="w-5 h-5 text-cyan-400" />
      }
    ]
  },

  telegram_feed: {
    code: "INTEL-FEED-LIVE-05",
    tabTitleTr: "Canlı Bilim & Güncel Haberler Radarı",
    tabTitleEn: "Live Science & News Radar",
    accentColor: "border-sky-500/40 shadow-[0_0_35px_rgba(14,165,233,0.25)]",
    badgeColor: "bg-sky-500/20 text-sky-300 border-sky-400/40",
    steps: [
      {
        stepNumber: 1,
        titleTr: "Doğrulanmış Sinyal İstihbaratı",
        titleEn: "Verified Signal Intelligence",
        descTr:
          "Dünya genelindeki laboratuvarlardan, patent bültenlerinden ve saygın teknoloji basınından toplanan teyitli sinyal akışını canlı izleyin.",
        descEn:
          "Monitor verified live intelligence streams gathered from global labs, patent gazettes, and reputable tech journals.",
        tipTr: "İpucu: Sağ üstteki 'Canlı Senkronize Et' ile en taze bilimsel verileri çekebilirsiniz.",
        tipEn: "Tip: Click 'Live Sync' at the top right to pull the freshest scientific breakthroughs.",
        icon: <Radio className="w-5 h-5 text-sky-400" />
      },
      {
        stepNumber: 2,
        titleTr: "Sinyal Gücü & Doğruluk Filtreleri",
        titleEn: "Signal Strength & Credibility Filters",
        descTr:
          "Zayıf sinyallerden resmi şirket yol haritalarına kadar istihbarat türüne göre filtreleme yapın.",
        descEn:
          "Filter signals by confidence weight, from early weak signals to peer-reviewed laboratory breakthroughs.",
        tipTr: "İpucu: Güçlü sinyaller doğrudan ilgili yılın tahmin doğruluğunu artırır.",
        tipEn: "Tip: Strong signals directly validate and update the timeline milestone probabilities.",
        icon: <ShieldCheck className="w-5 h-5 text-emerald-400" />
      }
    ]
  },

  analytics: {
    code: "ANALYTICS-QUANTUM-06",
    tabTitleTr: "Gelecek İstatistikleri & Kuantum Trend Analizi",
    tabTitleEn: "Future Analytics & Quantum Trend Analysis",
    accentColor: "border-emerald-500/40 shadow-[0_0_35px_rgba(16,185,129,0.25)]",
    badgeColor: "bg-emerald-500/20 text-emerald-300 border-emerald-400/40",
    steps: [
      {
        stepNumber: 1,
        titleTr: "Matematiksel Entropi & Hızlanma Eğrileri",
        titleEn: "Mathematical Entropy & Acceleration Curves",
        descTr:
          "Teknolojik kırılmaların kategori bazlı olasılık dağılımını, insan biyo-entegrasyon eğrilerini ve yapay zeka özerklik oranlarını analiz edin.",
        descEn:
          "Analyze category probability densities, human bio-integration curves, and AI autonomy indexes across decades.",
        tipTr: "İpucu: Tüm analiz verilerini akademik çalışmalarınız için CSV formatında dışa aktarabilirsiniz.",
        tipEn: "Tip: Export all analytical matrix data as CSV for reports and research.",
        icon: <BarChart3 className="w-5 h-5 text-emerald-400" />
      }
    ]
  },

  spin_wheel: {
    code: "WHEEL-FATE-07",
    tabTitleTr: "Kader Çarkı & Rastgele Gelecek Simülasyonu",
    tabTitleEn: "Wheel of Fate & Random Future Encounter",
    accentColor: "border-yellow-500/40 shadow-[0_0_35px_rgba(234,179,8,0.25)]",
    badgeColor: "bg-yellow-500/20 text-yellow-300 border-yellow-400/40",
    steps: [
      {
        stepNumber: 1,
        titleTr: "Gelecekten Bir Güne Işınlanın",
        titleEn: "Teleport to a Future Day",
        descTr:
          "Çarkı çevirerek 2026-2060 arasındaki rastgele bir yıla ışınlanın; o günün insanının sabah rutinini ve biyo-teknolojik yaşamını deneyimleyin.",
        descEn:
          "Spin the wheel to teleport into a random future year; experience daily life, morning routines, and bio-tech augments.",
        tipTr: "İpucu: Her çevirmede analiz kredisi ve nadir fütürist rozetleri kazanırsınız.",
        tipEn: "Tip: Each spin rewards analysis credits and collectible futuristic badges.",
        icon: <Disc3 className="w-5 h-5 text-yellow-400" />
      }
    ]
  },

  comparison: {
    code: "COMPARISON-TIME-08",
    tabTitleTr: "Yıllar Arası Kıyaslama & Evrim Matrisi",
    tabTitleEn: "Multi-Year Comparison & Evolution Matrix",
    accentColor: "border-blue-500/40 shadow-[0_0_35px_rgba(59,130,246,0.25)]",
    badgeColor: "bg-blue-500/20 text-blue-300 border-blue-400/40",
    steps: [
      {
        stepNumber: 1,
        titleTr: "İki Çağı Yan Yana Kıyaslayın",
        titleEn: "Compare Two Eras Side-by-Side",
        descTr:
          "Örneğin 2026 ile 2045 yıllarını seçerek işlem gücü, insan ömrü beklentisi ve biyo-entegrasyon farklarını doğrudan karşılaştırın.",
        descEn:
          "Compare any two years (e.g. 2026 vs 2045) side-by-side across computing, longevity, and bio-digital integration.",
        tipTr: "İpucu: Kıyaslama tablosu aradaki teknolojik sıçrama katsayısını otomatik hesaplar.",
        tipEn: "Tip: The matrix automatically calculates the leap factor and delta growth.",
        icon: <Scale className="w-5 h-5 text-blue-400" />
      }
    ]
  },

  futurist_advisor: {
    code: "ADVISOR-AI-09",
    tabTitleTr: "AI Fütürist Danışman & Mentor",
    tabTitleEn: "AI Futurist Advisor & Mentor",
    accentColor: "border-teal-500/40 shadow-[0_0_35px_rgba(20,184,166,0.25)]",
    badgeColor: "bg-teal-500/20 text-teal-300 border-teal-400/40",
    steps: [
      {
        stepNumber: 1,
        titleTr: "2060 Perspektifinden Stratejik Rehberlik",
        titleEn: "Strategic Guidance from a 2060 Perspective",
        descTr:
          "Yapay zeka fütüristine kariyeriniz, yatırımlarınız veya insanlığın geleceği hakkında sorular sorarak bilimsel temelli öngörüler alın.",
        descEn:
          "Ask the AI futurist about career longevity, ethical governance, or investments for science-grounded forecasts.",
        tipTr: "İpucu: Sokratik diyalog moduyla geleceğin etik ikilemlerini tartışabilirsiniz.",
        tipEn: "Tip: Engage in Socratic dialogue mode to explore profound ethical dilemmas.",
        icon: <Compass className="w-5 h-5 text-teal-400" />
      }
    ]
  }
};

interface CinematicTabWalkthroughProps {
  currentView: ViewMode;
}

export const CinematicTabWalkthrough: React.FC<CinematicTabWalkthroughProps> = ({ currentView }) => {
  const { language } = useLanguage();
  const isTr = language === "tr";

  const [activeConfig, setActiveConfig] = useState<TabTourConfig | null>(null);
  const [currentStepIdx, setCurrentStepIdx] = useState<number>(0);
  const [isVisible, setIsVisible] = useState<boolean>(false);

  // Check if currentView has a configured tour and if it hasn't been seen yet
  useEffect(() => {
    // Portal screen does not need an intrusive tab tour
    if (currentView === "portal" || currentView === "admin") {
      setIsVisible(false);
      setActiveConfig(null);
      return;
    }

    const config = TAB_TOUR_REGISTRY[currentView];
    if (!config) {
      setIsVisible(false);
      setActiveConfig(null);
      return;
    }

    try {
      const storageKey = `seen_cinematic_tour_${currentView}`;
      const hasSeen = localStorage.getItem(storageKey) === "true";

      if (!hasSeen) {
        setActiveConfig(config);
        setCurrentStepIdx(0);
        // Slight delay for smooth cinematic entrance after tab mounts
        const timer = setTimeout(() => {
          setIsVisible(true);
        }, 350);
        return () => clearTimeout(timer);
      } else {
        setIsVisible(false);
        setActiveConfig(null);
      }
    } catch {
      setIsVisible(false);
    }
  }, [currentView]);

  const handleDismiss = () => {
    setIsVisible(false);
    try {
      if (currentView) {
        localStorage.setItem(`seen_cinematic_tour_${currentView}`, "true");
      }
    } catch {}
  };

  const handleNext = () => {
    if (!activeConfig) return;
    if (currentStepIdx < activeConfig.steps.length - 1) {
      setCurrentStepIdx((prev) => prev + 1);
    } else {
      handleDismiss();
    }
  };

  const handlePrev = () => {
    if (currentStepIdx > 0) {
      setCurrentStepIdx((prev) => prev - 1);
    }
  };

  if (!isVisible || !activeConfig) return null;

  const currentStep = activeConfig.steps[currentStepIdx] || activeConfig.steps[0];
  const isLastStep = currentStepIdx === activeConfig.steps.length - 1;

  return (
    <div className="pointer-events-none fixed inset-0 z-40 flex flex-col justify-end p-4 sm:p-6 md:p-8">
      {/* 1. Cinematic Holographic Scanline Laser (One-time soft entry sweep) */}
      <motion.div
        initial={{ top: "-10%", opacity: 0 }}
        animate={{ top: "110%", opacity: [0, 0.7, 0] }}
        transition={{ duration: 1.4, ease: "easeInOut" }}
        className="pointer-events-none fixed inset-x-0 h-2 bg-gradient-to-r from-transparent via-cyan-400 to-transparent blur-sm z-30"
      />

      {/* 2. Sleek Floating Cinematic HUD Walkthrough Card (Anchored bottom-right / bottom-center) */}
      <motion.div
        layout
        initial={{ opacity: 0, y: 40, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 30, scale: 0.95 }}
        transition={{ duration: 0.35, ease: "easeOut" }}
        className={`pointer-events-auto relative w-full max-w-lg mx-auto sm:mr-4 sm:ml-auto rounded-3xl bg-slate-950/95 backdrop-blur-2xl border ${activeConfig.accentColor} p-5 sm:p-6 shadow-2xl overflow-hidden font-sans`}
      >
        {/* Ambient Top Glow Line */}
        <div className="absolute top-0 inset-x-0 h-[2px] bg-gradient-to-r from-transparent via-cyan-400 to-transparent opacity-80" />

        {/* Ambient Radial Spotlight inside Card */}
        <div className="absolute -top-12 -right-12 w-48 h-48 bg-cyan-500/10 rounded-full blur-2xl pointer-events-none" />

        {/* HEADER: Sci-Fi Telemetry Badge, Step Indicator & Quick Dismiss */}
        <div className="flex items-center justify-between gap-3 border-b border-white/10 pb-3 mb-3.5">
          <div className="flex items-center gap-2">
            <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold tracking-widest border ${activeConfig.badgeColor} flex items-center gap-1.5`}>
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
              {activeConfig.code}
            </span>
            <span className="text-[11px] font-mono text-slate-400 hidden xs:inline">
              {isTr ? activeConfig.tabTitleTr : activeConfig.tabTitleEn}
            </span>
          </div>

          <div className="flex items-center gap-2">
            {/* Step Counter Badge */}
            <span className="px-2 py-0.5 rounded-md bg-white/10 text-white font-mono text-xs font-bold">
              {currentStepIdx + 1} / {activeConfig.steps.length}
            </span>

            {/* Quick Dismiss Button */}
            <button
              type="button"
              onClick={handleDismiss}
              className="p-1.5 rounded-lg bg-white/5 hover:bg-white/15 text-slate-400 hover:text-white border border-white/10 transition-colors cursor-pointer"
              title={isTr ? "Turu Kapat" : "Close Tour"}
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* BODY: Animated Step Content with smooth layout animation */}
        <AnimatePresence mode="wait">
          <motion.div
            key={`${activeConfig.code}-${currentStepIdx}`}
            initial={{ opacity: 0, x: 15 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -15 }}
            transition={{ duration: 0.22, ease: "easeOut" }}
            className="space-y-3"
          >
            {/* Title with Icon */}
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center shrink-0 shadow-inner">
                {currentStep.icon}
              </div>
              <div className="space-y-1">
                <h4 className="text-sm sm:text-base font-bold text-white tracking-tight leading-snug">
                  {isTr ? currentStep.titleTr : currentStep.titleEn}
                </h4>
                <p className="text-xs sm:text-[13px] text-slate-300 leading-relaxed">
                  {isTr ? currentStep.descTr : currentStep.descEn}
                </p>
              </div>
            </div>

            {/* Tactical Tip / Pro Hint */}
            {(currentStep.tipTr || currentStep.tipEn) && (
              <div className="p-2.5 rounded-xl bg-cyan-950/40 border border-cyan-500/20 text-[11px] text-cyan-200/90 flex items-start gap-2 font-mono">
                <Sparkles className="w-3.5 h-3.5 text-cyan-300 shrink-0 mt-0.5" />
                <span>{isTr ? currentStep.tipTr : currentStep.tipEn}</span>
              </div>
            )}
          </motion.div>
        </AnimatePresence>

        {/* FOOTER: Stepper Dots & Action Buttons */}
        <div className="flex items-center justify-between gap-3 pt-4 border-t border-white/10 mt-4">
          {/* Stepper Dots */}
          <div className="flex items-center gap-1.5">
            {activeConfig.steps.map((_, idx) => (
              <button
                key={`step-dot-${activeConfig.code}-${idx}`}
                type="button"
                onClick={() => setCurrentStepIdx(idx)}
                className={`h-1.5 rounded-full transition-all cursor-pointer ${
                  idx === currentStepIdx
                    ? "w-6 bg-cyan-400 shadow-[0_0_8px_rgba(6,182,212,0.8)]"
                    : "w-2 bg-white/20 hover:bg-white/40"
                }`}
                aria-label={`Adım ${idx + 1}`}
              />
            ))}
          </div>

          {/* Controls: Önceki / Sonraki / Anladım */}
          <div className="flex items-center gap-2">
            {currentStepIdx > 0 && (
              <button
                type="button"
                onClick={handlePrev}
                className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 hover:text-white text-xs font-mono font-bold flex items-center gap-1 transition-all cursor-pointer"
              >
                <ArrowLeft className="w-3 h-3" />
                <span>{isTr ? "Önceki" : "Back"}</span>
              </button>
            )}

            <button
              type="button"
              onClick={handleNext}
              className={`px-4 py-1.5 rounded-xl text-xs font-mono font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-lg ${
                isLastStep
                  ? "bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-extrabold shadow-emerald-500/25"
                  : "bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-extrabold shadow-cyan-500/25"
              }`}
            >
              <span>{isLastStep ? (isTr ? "Anladım & Keşfet" : "Got it & Explore") : (isTr ? "Sonraki" : "Next")}</span>
              {isLastStep ? <CheckCircle2 className="w-3.5 h-3.5" /> : <ArrowRight className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
