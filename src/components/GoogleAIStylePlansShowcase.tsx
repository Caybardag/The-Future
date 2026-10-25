import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Sparkles,
  ChevronDown,
  ChevronUp,
  CheckCircle2,
  ArrowRight,
  Shield,
  Zap,
  Clock,
  Cpu,
  TrendingUp,
  Briefcase,
  Layers,
  Atom,
  HelpCircle,
  Flame,
  Award,
  Compass,
  Crown,
  XCircle,
} from "lucide-react";
import { ViewMode } from "../types";
import { useLanguage } from "../context/LanguageContext";
import { useAuth } from "../context/AuthContext";
import { isUserProfileComplete } from "./UserAuthModal";

interface GoogleAIStylePlansShowcaseProps {
  onEnterConsole: (targetView: ViewMode) => void;
  onOpenRegisterModal: () => void;
  userAge?: number;
}

interface InteractiveDemoPrompt {
  id: string;
  tag: string;
  year: number;
  title: string;
  category: string;
  probability: number;
  trlLevel: number;
  summary: string;
  humanImpact: string;
  color: string;
}

const DEMO_PROMPTS: InteractiveDemoPrompt[] = [
  {
    id: "agi",
    tag: "🧠 2029: AGI & İnsan-Üstü Akıl Yürütme",
    year: 2029,
    title: "Yapay Genel Zeka (AGI) Eşiği ve Otonom Araştırma",
    category: "Yapay Zeka & Bilişim",
    probability: 88,
    trlLevel: 8,
    summary: "Gemini ve yeni nesil sinir ağlarının çok modlu mantık yürütme kapasitesiyle insan bilişsel seviyesini aşması.",
    humanImpact: "Tüm bilimsel keşif süreçleri 1000 kat hızlanır; otonom yazılım ve tıp laboratuvarları devreye girer.",
    color: "from-purple-500 to-indigo-500",
  },
  {
    id: "longevity",
    tag: "🧬 2038: Biyolojik Yaşlanmanın Durdurulması",
    year: 2038,
    title: "Hücresel Gençleşme & Epigenetik Saatin Sıfırlanması",
    category: "Biyoloji & Tıp",
    probability: 72,
    trlLevel: 6,
    summary: "Yamanaka faktörleri ve mRNA telomer tedavileri ile insan biyolojik yaşının geriye döndürülmesi.",
    humanImpact: "Her 1 takvim yılı geçtikçe biyolojik ömrün 1 yıldan fazla uzatıldığı 'Kaçış Hızı' çağı başlar.",
    color: "from-emerald-500 to-cyan-500",
  },
  {
    id: "autonomous",
    tag: "🚗 2032: Seviye 5 Otonom Küresel Ağ",
    year: 2032,
    title: "Tam Otonom Ulaşım ve İnsansız Lojistik Koridoru",
    category: "Otonom Sistemler",
    probability: 84,
    trlLevel: 8,
    summary: "Direksiyonsuz araçların şehirlerde standart hale gelmesi, trafik kazalarının %99 oranında azalması.",
    humanImpact: "Milyonlarca profesyonel sürücülük mesleği dönüşür; kentsel otopark alanları yeşil parklara evrilir.",
    color: "from-blue-500 to-cyan-500",
  },
  {
    id: "fusion",
    tag: "⚛️ 2042: Ticari Füzyon & Sonsuz Enerji",
    year: 2042,
    title: "Net Pozitif Ticari Tokamak Füzyon Reaktörleri",
    category: "Enerji & İklim",
    probability: 79,
    trlLevel: 7,
    summary: "Yapay zeka ile manyetik plazma hapsedilmesi sayesinde deniz suyundan sınırsız temiz enerji üretimi.",
    humanImpact: "Karbon salınımı sıfırlanır, deniz suyunu arıtma ve karbondioksit yakalama maliyeti önemsizleşir.",
    color: "from-amber-500 to-rose-500",
  },
  {
    id: "singularity",
    tag: "🌌 2045: Teknolojik Tekillik (Kurzweil Eşiği)",
    year: 2045,
    title: "İnsan Zihni ve Sentetik Zekanın Tam Entegrasyonu",
    category: "İnsan-Makine Arayüzü",
    probability: 68,
    trlLevel: 5,
    summary: "Biyolojik olmayan zekanın tüm insanlık zekasından milyarlarca kat daha güçlü hale gelmesi.",
    humanImpact: "Hastalıklar, biyolojik sınırlamalar ve bilişsel yetersizlikler tamamen tarih olur.",
    color: "from-pink-500 to-purple-600",
  },
];

export const GoogleAIStylePlansShowcase: React.FC<GoogleAIStylePlansShowcaseProps> = ({
  onEnterConsole,
  onOpenRegisterModal,
  userAge,
}) => {
  const { language } = useLanguage();
  const isTr = language === "tr";
  const { currentUser, plan, openCreditStore, openAuthModal } = useAuth();
  const isProfileComplete = isUserProfileComplete(currentUser);

  // Selected interactive prompt simulation
  const [selectedPrompt, setSelectedPrompt] = useState<InteractiveDemoPrompt>(DEMO_PROMPTS[0]);
  const [isSimulating, setIsSimulating] = useState<boolean>(false);
  const [simulationProgress, setSimulationProgress] = useState<number>(100);

  // Expandable plan drawer state (Google AI Plans features-drawer)
  const [expandedPlan, setExpandedPlan] = useState<string | null>("pro");

  // FAQ Accordion State
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const handleSelectPrompt = (prompt: InteractiveDemoPrompt) => {
    setSelectedPrompt(prompt);
    setIsSimulating(true);
    setSimulationProgress(0);

    let current = 0;
    const interval = setInterval(() => {
      current += 20;
      setSimulationProgress(current);
      if (current >= 100) {
        clearInterval(interval);
        setIsSimulating(false);
      }
    }, 60);
  };

  const isUserLoggedInWithAge = Boolean(currentUser && currentUser.age && currentUser.age >= 10 && currentUser.age <= 100);
  const realUserAge = isUserLoggedInWithAge ? currentUser!.age! : null;
  const userAgeAtYear = realUserAge !== null ? realUserAge + (selectedPrompt.year - 2026) : null;

  return (
    <div className="relative w-full max-w-7xl mx-auto py-12 px-4 sm:px-6 text-white font-sans space-y-16">
      {/* 1. GOOGLE AI PLANS STYLE HERO SECTION */}
      <div className="text-center space-y-4 max-w-4xl mx-auto">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gradient-to-r from-purple-500/20 via-cyan-500/20 to-indigo-500/20 border border-purple-500/30 text-xs font-mono text-cyan-300 shadow-lg shadow-purple-950/40">
          <Sparkles className="w-4 h-4 text-cyan-400 animate-spin" style={{ animationDuration: "6s" }} />
          <span>{isTr ? "2026—2060 STRATEJİK GELECEK MİMARİSİ" : "2026—2060 STRATEGIC FUTURE ARCHITECTURE"}</span>
        </div>

        <h2 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-white via-cyan-100 to-purple-200 drop-shadow-md">
          {isTr ? "Fikirlerinizi Harekete Geçirin: Geleceği Şekillendirin" : "Power Your Tomorrow: Explore the Evolution"}
        </h2>

        <p className="text-sm sm:text-base text-slate-300 max-w-2xl mx-auto leading-relaxed">
          {isTr
            ? "Teknolojik Evrim Takvimi: 2026—2060 teknolojik tekillik takvimini ücretsiz keşfedin, yapay zeka ile biyo-yaşınızı ve kariyer risk haritanızı kişiselleştirin."
            : "Technological Evolution Timeline: Freely explore 100+ verified milestones, simulate your bio-age longevity, and defend your career against automation."}
        </p>

        {/* Dual Primary Call-to-Actions */}
        <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
          <button
            type="button"
            onClick={() => onEnterConsole("timeline")}
            className="px-6 py-3.5 rounded-2xl bg-gradient-to-r from-cyan-500 via-blue-600 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-slate-950 font-bold text-sm flex items-center gap-2.5 shadow-xl shadow-cyan-500/25 transition-all transform hover:-translate-y-0.5 cursor-pointer"
          >
            <Clock className="w-4 h-4 text-slate-950" />
            <span>{isTr ? "Zaman Çizelgesini Keşfet (2026—2060)" : "Explore Live Timeline (2026-2060)"}</span>
            <ArrowRight className="w-4 h-4 text-slate-950" />
          </button>

          {isProfileComplete ? (
            <button
              type="button"
              onClick={() => onEnterConsole("roadmap")}
              className="px-6 py-3.5 rounded-2xl bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-700 hover:from-purple-500 hover:to-indigo-500 border border-purple-400/50 text-white font-bold text-sm flex items-center gap-2.5 shadow-xl shadow-purple-500/25 transition-all transform hover:-translate-y-0.5 cursor-pointer"
            >
              <Sparkles className="w-4 h-4 text-cyan-300" />
              <span>{isTr ? "Kişisel Geleceğimi Gör" : "View My Personal Future"}</span>
              <ArrowRight className="w-4 h-4 text-cyan-300" />
            </button>
          ) : (
            <button
              type="button"
              onClick={onOpenRegisterModal}
              className="px-6 py-3.5 rounded-2xl bg-slate-900/90 hover:bg-slate-800 border border-purple-500/40 hover:border-purple-400 text-purple-200 hover:text-white font-bold text-sm flex items-center gap-2.5 shadow-lg transition-all cursor-pointer"
            >
              <Sparkles className="w-4 h-4 text-purple-400" />
              <span>{isTr ? "Kişisel Gelecek Profilini Başlat" : "Start Your Personal Future Profile"}</span>
            </button>
          )}
        </div>
      </div>

      {/* 2. GOOGLE "AUTONOMOUS TRENDS / DEEP RESEARCH" STYLE INTERACTIVE SIMULATOR */}
      <div className="relative rounded-3xl bg-gradient-to-b from-[#130f2c]/95 via-[#0e0a22]/95 to-[#090614] border-2 border-purple-500/30 p-5 sm:p-8 shadow-2xl backdrop-blur-xl overflow-hidden">
        {/* Ambient Top Glow */}
        <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-96 h-96 bg-cyan-500/20 rounded-full blur-[120px] pointer-events-none" />

        <div className="relative z-10 space-y-6">
          {/* Header & Prompt Bar */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-white/10 pb-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-ping" />
                <h3 className="text-lg sm:text-xl font-black text-white font-mono uppercase tracking-wider">
                  {isTr ? "CANLI YAPAY ZEKA SİMÜLASYON TERMİNALİ" : "LIVE AI SIMULATION TERMINAL"}
                </h3>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                {isTr
                  ? "Bilişsel fütüroloji ve çok modlu senaryo simülasyonunu anında test edin."
                  : "Test live cognitive reasoning and development stage forecasts in real-time."}
              </p>
            </div>

            <span className="px-3 py-1 rounded-full bg-purple-500/20 border border-purple-500/40 text-purple-300 text-xs font-mono font-bold flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5 text-purple-400" />
              <span>{isTr ? "Bilişsel Canlı Öngörü" : "Cognitive Live Forecast"}</span>
            </span>
          </div>

          {/* Interactive Chips Selector */}
          <div className="flex flex-wrap items-center gap-2">
            {DEMO_PROMPTS.map((prompt) => {
              const isSelected = selectedPrompt.id === prompt.id;
              return (
                <button
                  key={prompt.id}
                  type="button"
                  onClick={() => handleSelectPrompt(prompt)}
                  className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                    isSelected
                      ? "bg-gradient-to-r from-cyan-500 to-blue-600 text-slate-950 shadow-lg shadow-cyan-500/20 scale-[1.02]"
                      : "bg-slate-900/80 hover:bg-slate-800 border border-white/10 text-slate-300 hover:text-white"
                  }`}
                >
                  <span>{prompt.tag}</span>
                </button>
              );
            })}
          </div>

          {/* Live Progress Bar (Simulating Google's progress notification) */}
          <div className="space-y-1.5 bg-slate-950/60 p-4 rounded-2xl border border-white/5">
            <div className="flex items-center justify-between text-xs font-mono">
              <span className="text-slate-300 flex items-center gap-2">
                {isSimulating ? (
                  <>
                    <span className="w-2 h-2 rounded-full bg-amber-400 animate-spin" />
                    <span className="text-amber-300">{isTr ? "Kuantum Veri Analizi Yapılıyor..." : "Simulating Quantum Data..."}</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span className="text-emerald-300 font-bold">{isTr ? "Model Projeksiyonu Hesaplandı & Hazır" : "Projection Computed & Ready"}</span>
                  </>
                )}
              </span>
              <span className="text-cyan-400 font-bold">%{simulationProgress}</span>
            </div>

            <div className="w-full h-2 rounded-full bg-slate-900 overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-cyan-400 via-purple-500 to-indigo-500"
                style={{ width: `${simulationProgress}%` }}
                transition={{ ease: "easeOut" }}
              />
            </div>
          </div>

          {/* Holographic Result Preview Card */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {/* Main Milestone Narrative */}
            <div className="lg:col-span-2 p-5 rounded-2xl bg-gradient-to-br from-slate-900/90 to-slate-950 border border-white/10 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono px-2.5 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                  {selectedPrompt.category} • {selectedPrompt.year}
                </span>
                {userAgeAtYear !== null ? (
                  <span className="text-xs font-mono text-purple-300">
                    {isTr ? `Biyolojik Yaşınız: ${userAgeAtYear}` : `Your Bio-Age: ${userAgeAtYear}`}
                  </span>
                ) : (
                  <button
                    type="button"
                    onClick={() => {
                      if (!currentUser) openAuthModal();
                      else window.dispatchEvent(new CustomEvent("open_profile_completion"));
                    }}
                    className="text-[11px] font-mono text-purple-400 hover:text-purple-300 underline cursor-pointer"
                  >
                    {isTr ? "Kişisel Yaş: Giriş Yapın" : "Bio-Age: Sign In"}
                  </button>
                )}
              </div>

              <h4 className="text-lg sm:text-xl font-bold text-white leading-snug">
                {selectedPrompt.title}
              </h4>

              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                {selectedPrompt.summary}
              </p>

              <div className="p-3 rounded-xl bg-purple-950/40 border border-purple-500/30 text-xs text-purple-200">
                <strong>{isTr ? "Toplumsal & İnsani Etki:" : "Human & Societal Impact:"}</strong>{" "}
                {selectedPrompt.humanImpact}
              </div>
            </div>

            {/* Metrics Panel */}
            <div className="p-5 rounded-2xl bg-slate-950/80 border border-white/10 flex flex-col justify-between space-y-4">
              <div className="space-y-3 text-xs">
                <div className="flex items-center justify-between border-b border-white/5 pb-2">
                  <span className="text-slate-400">{isTr ? "Gerçekleşme Olasılığı:" : "Probability:"}</span>
                  <span className="text-emerald-400 font-mono font-bold text-sm">%{selectedPrompt.probability}</span>
                </div>

                <div className="flex items-center justify-between border-b border-white/5 pb-2">
                  <span className="text-slate-400">{isTr ? "Gelişim Aşaması:" : "Development Stage:"}</span>
                  <span className="text-cyan-400 font-mono font-bold text-sm">
                    {isTr ? `Aşama ${selectedPrompt.trlLevel} / 9` : `Stage ${selectedPrompt.trlLevel} / 9`}
                  </span>
                </div>

                <div className="flex items-center justify-between border-b border-white/5 pb-2">
                  <span className="text-slate-400">{isTr ? "Kişisel Yaş Dönümünüz:" : "Your Bio-Horizon:"}</span>
                  {userAgeAtYear !== null && realUserAge !== null ? (
                    <span className="text-amber-300 font-mono font-bold text-sm">
                      {realUserAge} ➜ {userAgeAtYear} Yaş
                    </span>
                  ) : (
                    <button
                      type="button"
                      onClick={() => {
                        if (!currentUser) openAuthModal();
                        else window.dispatchEvent(new CustomEvent("open_profile_completion"));
                      }}
                      className="text-amber-400 hover:text-amber-300 font-mono text-xs underline cursor-pointer"
                    >
                      {isTr ? "Hesaplamak için Giriş Yapın" : "Sign In to Calculate"}
                    </button>
                  )}
                </div>
              </div>

              <button
                type="button"
                onClick={() => onEnterConsole("timeline")}
                className="w-full py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-cyan-500/20 transition-all cursor-pointer"
              >
                <span>{isTr ? "Tüm Zaman Çizelgesinde Gör" : "View on Timeline"}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 3. GELECEK EKOSİSTEMİ: ÜÇ TEMEL SÜTUN (Sanatsal & Kurumsal Vitrin) */}
      <div className="space-y-6">
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-xs font-mono font-bold">
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
            <span>{isTr ? "2026—2060 GELECEK EKOSİSTEMİ" : "2026—2060 FUTURE ECOSYSTEM"}</span>
          </div>
          <h3 className="text-2xl sm:text-4xl font-black text-white tracking-tight">
            {isTr ? "Teknolojik Dönüşümün Üç Boyutu" : "Three Dimensions of Technological Evolution"}
          </h3>
          <p className="text-xs sm:text-sm text-slate-300 max-w-xl mx-auto">
            {isTr
              ? "Kronolojik tarihsel projeksiyonlar, kişiselleştirilmiş bireysel eylem haritaları ve otonom gelecek zekası."
              : "Chronological projections, personalized life roadmaps, and autonomous temporal intelligence."}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch">
          {/* SÜTUN 1: İNTERAKTİF ZAMAN AKIŞI */}
          <div className="relative rounded-3xl bg-slate-900/80 border border-cyan-500/30 p-6 flex flex-col justify-between shadow-xl group hover:border-cyan-400/60 transition-all">
            <div className="space-y-4">
              <span className="text-[10px] font-mono font-bold px-3 py-1 rounded-full bg-cyan-950/80 text-cyan-300 border border-cyan-500/40 inline-block">
                {isTr ? "KRONOLOJİK UFUK" : "CHRONOLOGICAL HORIZON"}
              </span>

              <div>
                <h4 className="text-2xl font-black text-white flex items-center gap-2">
                  <span>{isTr ? "Zaman Akışı" : "Timeline"}</span>
                  <Clock className="w-5 h-5 text-cyan-400" />
                </h4>
                <p className="text-xs text-slate-300 mt-1">
                  {isTr ? "2026—2060 kronolojik teknoloji ve bilimsel dönüşüm haritası." : "2026—2060 chronological tech and science transformation map."}
                </p>
              </div>

              {/* Core Features */}
              <ul className="space-y-2.5 text-xs text-slate-300 pt-3 border-t border-white/5">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0" />
                  <span>{isTr ? "100+ Gelecek Dönüm Noktası & Trend Analizi" : "100+ Future Milestones & Trend Projections"}</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0" />
                  <span>{isTr ? "Gelişim Aşamaları (1-9) & Bilimsel Kanıtlar" : "Development Stages (1-9) & Evidence"}</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0" />
                  <span>{isTr ? "A/B/C Karar Simülasyonları ve Etki Tahminleri" : "A/B/C Decision Projections"}</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0" />
                  <span>{isTr ? "Canlı Bilimsel İstihbarat & Kanıt Akışı" : "Live Tech & Science Signals"}</span>
                </li>
              </ul>
            </div>

            <button
              type="button"
              onClick={() => onEnterConsole("timeline")}
              className="mt-6 w-full py-3.5 rounded-2xl bg-cyan-950 hover:bg-cyan-900 border border-cyan-500/50 text-cyan-200 hover:text-white font-bold text-xs transition-all cursor-pointer flex items-center justify-center gap-2"
            >
              <span>{isTr ? "Zaman Akışını Keşfet" : "Explore Timeline"}</span>
              <ArrowRight className="w-3.5 h-3.5 text-cyan-400" />
            </button>
          </div>

          {/* SÜTUN 2: KİŞİSEL GELECEK PLANI */}
          <div className="relative rounded-3xl bg-gradient-to-b from-[#1c133a] via-[#120d26] to-[#0a0718] border-2 border-purple-500/60 p-6 flex flex-col justify-between shadow-2xl shadow-purple-950/50 transform lg:-translate-y-2">
            <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-gradient-to-r from-purple-500 via-cyan-400 to-indigo-500 text-slate-950 text-[10px] font-black uppercase tracking-wider shadow-lg shadow-purple-500/30">
              {isTr ? "BİREYSEL EYLEM PLANI" : "PERSONAL ACTION PLAN"}
            </div>

            <div className="space-y-4 pt-2">
              <span className="text-[10px] font-mono font-bold px-3 py-1 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/40 inline-block">
                {isTr ? "HAYAT & KARİYER HARİTASI" : "LIFE & CAREER MAP"}
              </span>

              <div>
                <h4 className="text-2xl font-black text-white flex items-center gap-2">
                  <span>{isTr ? "Kişisel Gelecek Planı" : "Personal Roadmap"}</span>
                  <Compass className="w-5 h-5 text-amber-400" />
                </h4>
                <p className="text-xs text-purple-200 mt-1">
                  {isTr ? "Doğum yılınız ve mesleğinize göre şekillenen 2026—2060 kişisel hayat haritanız." : "Your 2026—2060 personal life and longevity roadmap tailored to you."}
                </p>
              </div>

              {/* Core Features */}
              <ul className="space-y-2.5 text-xs text-purple-100 pt-3 border-t border-purple-500/20">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>{isTr ? "Biyolojik Yaşlanma ve Gençleşme Takvimi" : "Biological Age & Longevity Milestones"}</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>{isTr ? "Mesleki Otomasyon & Gelir Güvenliği Analizi" : "Career Automation & Income Security"}</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>{isTr ? "A/B/C Karar Takibi ve Dinamik Yol Haritası Güncellemesi" : "A/B/C Decision Tracking & Roadmap Updates"}</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>{isTr ? "Kişisel Gelecek Kartı ve Eylem Planı" : "Personal Future Card & Action Plan"}</span>
                </li>
              </ul>
            </div>

            <button
              type="button"
              onClick={() => onEnterConsole("roadmap")}
              className="mt-6 w-full py-3.5 rounded-2xl bg-gradient-to-r from-purple-600 via-indigo-600 to-cyan-500 hover:from-purple-500 hover:to-cyan-400 text-white font-black text-xs flex items-center justify-center gap-2 shadow-xl shadow-purple-600/30 transition-all cursor-pointer"
            >
              <Compass className="w-4 h-4 text-amber-300" />
              <span>{isTr ? "Kişisel Planımı Başlat" : "Start My Roadmap"}</span>
            </button>
          </div>

          {/* SÜTUN 3: 2060 ZAMAN YOLCUSU */}
          <div className="relative rounded-3xl bg-slate-900/80 border border-amber-500/30 p-6 flex flex-col justify-between shadow-xl group hover:border-amber-400/60 transition-all">
            <div className="space-y-4">
              <span className="text-[10px] font-mono font-bold px-3 py-1 rounded-full bg-amber-950/80 text-amber-300 border border-amber-500/40 inline-block">
                {isTr ? "OTONOM GELECEK ZEKASI" : "AUTONOMOUS TEMPORAL AI"}
              </span>

              <div>
                <h4 className="text-2xl font-black text-white flex items-center gap-2">
                  <span>{isTr ? "Zaman Yolcusu" : "Time Traveler"}</span>
                  <Sparkles className="w-5 h-5 text-amber-400" />
                </h4>
                <p className="text-xs text-slate-300 mt-1">
                  {isTr ? "2030, 2045 ve 2060 çağlarının koşullarıyla interaktif bilişsel diyalog." : "Interactive cognitive dialogue with simulated future eras."}
                </p>
              </div>

              {/* Core Features */}
              <ul className="space-y-2.5 text-xs text-slate-300 pt-3 border-t border-white/5">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0" />
                  <span>{isTr ? "Nöral Arayüz Tasarımcısı & Biyoteknoloji Uzmanları" : "Neural Interface Designers & Biologists"}</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0" />
                  <span>{isTr ? "Gerçekçi Dönem Koşulları ve Meslek Tavsiyeleri" : "Realistic Future Era Conditions & Advice"}</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0" />
                  <span>{isTr ? "Post-Kıtlık ve Sibernetik Yaşam Simülasyonu" : "Post-Scarcity & Cybernetic Simulation"}</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0" />
                  <span>{isTr ? "Kişiselleştirilmiş Senaryo Sentezi" : "Personalized Scenario Synthesis"}</span>
                </li>
              </ul>
            </div>

            <button
              type="button"
              onClick={() => onEnterConsole("persona_chat")}
              className="mt-6 w-full py-3.5 rounded-2xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs transition-all cursor-pointer flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20"
            >
              <span>{isTr ? "Zaman Yolcusunu Başlat" : "Launch Time Traveler"}</span>
              <ArrowRight className="w-3.5 h-3.5 text-slate-950" />
            </button>
          </div>
        </div>
      </div>

      {/* 4. GOOGLE STYLE FAQ ACCORDION */}
      <div className="max-w-3xl mx-auto space-y-4 pt-6">
        <div className="text-center space-y-1 mb-6">
          <h3 className="text-xl sm:text-2xl font-bold text-white">
            {isTr ? "Sıkça Sorulan Sorular" : "Frequently Asked Questions"}
          </h3>
          <p className="text-xs text-slate-400">
            {isTr ? "Teknolojik Evrim 2026-2060 platformu hakkında merak edilenler." : "Everything you need to know about the platform."}
          </p>
        </div>

        {[
          {
            qTr: "Kişisel Gelecek Yol Haritası ve Biyolojik Yaş Nasıl Hesaplanır?",
            qEn: "How is the Personal Future Roadmap and Bio-Age Calculated?",
            aTr: "Kayıt olurken veya formda girdiğiniz yaş bilgisi referans alınarak, 2026'dan 2060'a kadar gerçekleşecek 100+ dönüm noktasındaki yaşınız dinamik olarak hesaplanır. Mesleğiniz ve ilgi alanlarınız taranarak en yüksek etki alanına sahip 10 kritik dönüm noktası eşleştirilir.",
            aEn: "Using your entered age, your projected age at each milestone from 2026 to 2060 is dynamically calculated. We match your profession and interest areas with the top 10 most impactful milestones.",
          },
          {
            qTr: "2026—2060 Öngörüleri Hangi Bilimsel Metodolojiye Dayanıyor?",
            qEn: "What Scientific Methodology Backs the 2026-2060 Forecasts?",
            aTr: "Platformumuz; akademik gelişim aşamaları (1-9), Ray Kurzweil'in İvmelenen Getiriler Yasası, Stanford ve MIT AI Index raporları ile 100'ün üzerinde hakemli makale ve patent verisini temel alır. Tüm analizler olasılıksal fütüroloji projeksiyonu olup kesin bir gelecek garantisi içermez.",
            aEn: "Our platform leverages academic development stages (1-9), Ray Kurzweil's Law of Accelerating Returns, Stanford AI Index, and over 100 peer-reviewed publications. All data are probabilistic simulations without definitive guarantees.",
          },
          {
            qTr: "Meslek Risk Analizi Otomasyonu Nasıl Değerlendirir?",
            qEn: "How Does the Job Risk Analyzer Evaluate Automation?",
            aTr: "Gelişmiş analitik fütüroloji motorumuz; mesleğinizin rutin görevlerini, bilişsel karmaşıklığını ve robotik otomasyona duyarlılığını analiz ederek korunma ve adaptasyon stratejileri üretir.",
            aEn: "Our cognitive forecasting engine analyzes your routine duties, cognitive complexity, and physical robotics exposure to calculate your substitution risk and defense recommendations.",
          },
        ].map((faq, idx) => {
          const isOpen = openFaq === idx;
          return (
            <div
              key={idx}
              className="rounded-2xl bg-slate-900/60 border border-white/10 overflow-hidden transition-all"
            >
              <button
                type="button"
                onClick={() => setOpenFaq(isOpen ? null : idx)}
                className="w-full p-4 sm:p-5 text-left flex items-center justify-between text-xs sm:text-sm font-bold text-white hover:text-cyan-300 transition-colors cursor-pointer"
              >
                <span>{isTr ? faq.qTr : faq.qEn}</span>
                {isOpen ? <ChevronUp className="w-4 h-4 text-cyan-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
              </button>

              <AnimatePresence>
                {isOpen && (
                  <motion.div
                    key={`faq-answer-${idx}`}
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="px-4 sm:px-5 pb-4 sm:pb-5 text-xs text-slate-300 leading-relaxed border-t border-white/5 pt-3"
                  >
                    {isTr ? faq.aTr : faq.aEn}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>
    </div>
  );
};
