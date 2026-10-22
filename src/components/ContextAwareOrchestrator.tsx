import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Clock,
  Briefcase,
  Bot,
  Radio,
  Compass,
  Sparkles,
  Zap,
  ShieldCheck,
  Globe,
  Layers,
  Search,
  Sliders,
  ChevronRight,
  Target,
  ArrowUpRight,
  GitFork,
  MessageSquare,
  History,
  Gift,
  Trophy,
  Users,
  Database,
  FileSearch,
} from "lucide-react";
import { ViewMode, ScenarioMode, CategoryType } from "../types";
import { useLanguage } from "../context/LanguageContext";
import { useAuth } from "../context/AuthContext";

export type DomainContext = "chronos" | "career_armor" | "oracle_ai" | "telemetry_radar";

interface ContextAwareOrchestratorProps {
  currentView: ViewMode;
  onSelectView: (view: ViewMode) => void;
  scenarioMode: ScenarioMode;
  onSelectScenario: (mode: ScenarioMode) => void;
  liveSignalCount?: number;
  onOpenDrawer: () => void;
  onOpenCreditStore: () => void;
  onOpenSpinWheel: () => void;
  onOpenProfile: () => void;
}

export const ContextAwareOrchestrator: React.FC<ContextAwareOrchestratorProps> = ({
  currentView,
  onSelectView,
  scenarioMode,
  onSelectScenario,
  liveSignalCount = 0,
  onOpenDrawer,
  onOpenCreditStore,
  onOpenSpinWheel,
  onOpenProfile,
}) => {
  const { language } = useLanguage();
  const { currentUser } = useAuth();

  // Detect domain context automatically from the active view
  const activeDomain: DomainContext = (() => {
    if (["job_risk", "personal_roadmap"].includes(currentView)) return "career_armor";
    if (["persona_chat", "futurist_advisor", "butterfly", "prediction_history", "counterfactual"].includes(currentView)) return "oracle_ai";
    if (["telegram_hub", "verification", "agent_scan", "data_integrity"].includes(currentView)) return "telemetry_radar";
    return "chronos";
  })();

  const [isMorphModalOpen, setIsMorphModalOpen] = useState(false);
  const [ambientPulse, setAmbientPulse] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => setAmbientPulse((p) => (p + 1) % 100), 2000);
    return () => clearInterval(timer);
  }, []);

  // 4 Core Context Domains
  const domains = [
    {
      id: "chronos" as DomainContext,
      title: language === "tr" ? "ZAMAN TÜNELİ & KRONOLOJİ" : "CHRONOS & DEEP TIME",
      tagline: language === "tr" ? "2026–2060 Arası Medeniyet ve Kırılma Matrisi" : "2026–2060 Global Civilization Timeline",
      icon: Clock,
      primaryView: "timeline" as ViewMode,
      themeGradient: "from-cyan-500/20 via-blue-900/30 to-slate-950",
      accentBorder: "border-cyan-500/40",
      accentColor: "text-cyan-400",
      accentGlow: "rgba(6, 182, 212, 0.4)",
      badgeBg: "bg-cyan-500/20 text-cyan-300 border-cyan-500/30",
      tools: [
        { id: "timeline" as ViewMode, label: language === "tr" ? "Kronolojik Akış" : "Timeline", icon: Clock, desc: "2026-2060 Yıllık Harita" },
        { id: "geo_map" as ViewMode, label: language === "tr" ? "Küresel Dağılım" : "World Map", icon: Globe, desc: "Bölgesel Teknoloji Gücü" },
        { id: "comparison" as ViewMode, label: language === "tr" ? "Kıyaslama" : "Compare", icon: Layers, desc: "Dönemler Arası Matris" },
        { id: "portal" as ViewMode, label: language === "tr" ? "Giriş Portalı" : "Welcome Portal", icon: Sparkles, desc: "10 Sn. Strateji Özeti" },
      ],
    },
    {
      id: "career_armor" as DomainContext,
      title: language === "tr" ? "KARİYER & İNSANİ GÜVENCE" : "CAREER & AUTOMATION ARMOR",
      tagline: language === "tr" ? "Yapay Zeka ve Otonomi Karşısında Meslek Kalkanı" : "AI Disruption Shield & Skill Longevity",
      icon: Briefcase,
      primaryView: "job_risk" as ViewMode,
      themeGradient: "from-rose-500/20 via-amber-950/30 to-slate-950",
      accentBorder: "border-rose-500/40",
      accentColor: "text-rose-400",
      accentGlow: "rgba(244, 63, 94, 0.4)",
      badgeBg: "bg-rose-500/20 text-rose-300 border-rose-500/30",
      tools: [
        { id: "job_risk" as ViewMode, label: language === "tr" ? "Meslek Risk Testi" : "Job Risk Analyzer", icon: Briefcase, desc: "Otomasyon Olasılık Skoru" },
        { id: "futurist_advisor" as ViewMode, label: language === "tr" ? "Kariyer Strateji AI" : "Career Advisor", icon: Sparkles, desc: "Geleceğe Hazırlık Yol Haritası" },
      ],
    },
    {
      id: "oracle_ai" as DomainContext,
      title: language === "tr" ? "KAHİN & SİMÜLASYON STÜDYOSU" : "ORACLE & SINGULARITY ENGINE",
      tagline: language === "tr" ? "Nedensel Olasılıklar, Kelebek Etkileri ve Gelecek İnsanları" : "Counterfactual Realities & Persona Neural Chat",
      icon: Bot,
      primaryView: "persona_chat" as ViewMode,
      themeGradient: "from-amber-500/20 via-purple-950/30 to-slate-950",
      accentBorder: "border-amber-500/40",
      accentColor: "text-amber-400",
      accentGlow: "rgba(245, 158, 11, 0.4)",
      badgeBg: "bg-amber-500/20 text-amber-300 border-amber-500/30",
      tools: [
        { id: "persona_chat" as ViewMode, label: language === "tr" ? "2045 İnsanıyla Chat" : "Future Persona Chat", icon: MessageSquare, desc: "Zaman Yolcusu ile Sohbet" },
        { id: "butterfly" as ViewMode, label: language === "tr" ? "Kelebek Etkisi" : "Butterfly Effect", icon: GitFork, desc: "Teknoloji Gecikirse Ne Olur?" },
        { id: "prediction_history" as ViewMode, label: language === "tr" ? "Simülasyon Arşivi" : "Past Forecasts", icon: History, desc: "Kaydedilen Senaryolar" },
      ],
    },
    {
      id: "telemetry_radar" as DomainContext,
      title: language === "tr" ? "CANLI RADAR & AKADEMİK KANIT" : "TELEMETRY & EMPIRICAL EVIDENCE",
      tagline: language === "tr" ? "Laboratuvarlardan Anlık Sinyaller ve Akademik Hakem Doğrulaması" : "Real-time Lab Telemetry & Peer-reviewed Proof",
      icon: Radio,
      primaryView: "telegram_hub" as ViewMode,
      themeGradient: "from-emerald-500/20 via-blue-950/30 to-slate-950",
      accentBorder: "border-emerald-500/40",
      accentColor: "text-emerald-400",
      accentGlow: "rgba(16, 185, 129, 0.4)",
      badgeBg: "bg-emerald-500/20 text-emerald-300 border-emerald-500/30",
      tools: [
        { id: "telegram_hub" as ViewMode, label: language === "tr" ? "Güncel Haberler" : "Latest News", icon: Radio, count: liveSignalCount, desc: "Doğrulanmış Canlı Akış" },
        { id: "verification" as ViewMode, label: language === "tr" ? "Kanıt Doğrulama" : "Verification", icon: ShieldCheck, desc: "arXiv, Patent & Bilimsel Kanıt" },
        { id: "agent_scan" as ViewMode, label: language === "tr" ? "Otonom Ajan" : "Autonomous Agent", icon: Zap, desc: "Canlı Tarama & Sayaç Ayarı" },
        { id: "data_integrity" as ViewMode, label: language === "tr" ? "Veri Bütünlüğü" : "Data Integrity", icon: Database, desc: "Metodoloji & Saydamlık" },
      ],
    },
  ];

  const currentDomainConfig = domains.find((d) => d.id === activeDomain) || domains[0];
  const DomainIcon = currentDomainConfig.icon;

  const handleSwitchDomain = (domainId: DomainContext) => {
    setIsMorphModalOpen(false);
    const target = domains.find((d) => d.id === domainId);
    if (target) {
      onSelectView(target.primaryView);
    }
  };

  return (
    <>
      {/* 1. TOP CONTEXT HORIZON HUD (Subtle, responsive, context-aware banner) */}
      <motion.div
        layout
        transition={{ type: "spring", stiffness: 260, damping: 26 }}
        className="w-full mb-4 px-2 sm:px-0"
      >
        <div
          className={`relative overflow-hidden rounded-2xl bg-gradient-to-r ${currentDomainConfig.themeGradient} border ${currentDomainConfig.accentBorder} p-3 sm:p-4 backdrop-blur-xl shadow-[0_8px_32px_rgba(0,0,0,0.6)] font-mono transition-colors duration-700`}
        >
          {/* Animated Background Energy Wave */}
          <div
            className="absolute -right-12 -top-12 w-48 h-48 rounded-full blur-3xl opacity-30 pointer-events-none transition-all duration-700"
            style={{ backgroundColor: currentDomainConfig.accentGlow }}
          />

          <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-3">
            {/* Left: Domain Context Indicator */}
            <div className="flex items-center gap-3 min-w-0">
              <motion.button
                whileHover={{ scale: 1.06, rotate: 5 }}
                whileTap={{ scale: 0.94 }}
                onClick={() => setIsMorphModalOpen(true)}
                className={`w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-slate-950/80 border ${currentDomainConfig.accentBorder} flex items-center justify-center shadow-lg cursor-pointer shrink-0 transition-transform`}
                title="Bağlam / Mod Değiştirici"
              >
                <DomainIcon className={`w-5 h-5 ${currentDomainConfig.accentColor} animate-pulse`} />
              </motion.button>

              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] sm:text-[11px] font-black uppercase tracking-wider text-slate-300 font-sans truncate">
                    {currentDomainConfig.title}
                  </span>
                  <button
                    onClick={() => setIsMorphModalOpen(true)}
                    className="text-[9px] px-1.5 py-0.5 rounded-full bg-white/10 hover:bg-white/20 text-white font-bold border border-white/15 cursor-pointer flex items-center gap-1 shrink-0 transition-colors"
                  >
                    <span>DEĞİŞTİR</span>
                    <ChevronRight className="w-2.5 h-2.5" />
                  </button>
                </div>
                <p className="text-[11px] text-slate-400 line-clamp-1 mt-0.5">{currentDomainConfig.tagline}</p>
              </div>
            </div>

            {/* Right: Contextual Adaptive Switcher / Scenario Branch Filter */}
            <div className="flex items-center gap-1.5 sm:gap-2 shrink-0 flex-wrap">
              {/* Context Tools for this specific domain only */}
              <div className="flex items-center gap-1 bg-slate-950/70 p-1 rounded-xl border border-white/10">
                {currentDomainConfig.tools.map((t, tIdx) => {
                  const TIcon = t.icon;
                  const isCurrent = currentView === t.id;

                  return (
                    <button
                      key={`orchestrator-hud-${t.id}-${tIdx}`}
                      onClick={() => onSelectView(t.id)}
                      className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                        isCurrent
                          ? "bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20"
                          : "text-slate-400 hover:text-white hover:bg-white/5"
                      }`}
                    >
                      <TIcon className="w-3.5 h-3.5" />
                      <span className="truncate max-w-[100px]">{t.label}</span>
                      {t.count !== undefined && t.count > 0 && (
                        <span className="px-1 py-0.2 rounded bg-cyan-400 text-slate-950 font-black text-[9px]">
                          {t.count}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Scenario Mode Pill Toggle (if in Chronos or Oracle mode) */}
              {(activeDomain === "chronos" || activeDomain === "oracle_ai") && (
                <div className="hidden lg:flex items-center gap-1 bg-slate-950/70 p-1 rounded-xl border border-white/10 text-[10px]">
                  <Sliders className="w-3 h-3 text-slate-400 ml-1" />
                  <button
                    onClick={() => onSelectScenario("baseline")}
                    className={`px-2 py-0.5 rounded font-bold transition-colors cursor-pointer ${
                      scenarioMode === "baseline" ? "bg-cyan-500 text-slate-950" : "text-slate-400 hover:text-white"
                    }`}
                  >
                    Temel
                  </button>
                  <button
                    onClick={() => onSelectScenario("optimistic")}
                    className={`px-2 py-0.5 rounded font-bold transition-colors cursor-pointer ${
                      scenarioMode === "optimistic" ? "bg-emerald-500 text-slate-950" : "text-slate-400 hover:text-white"
                    }`}
                  >
                    İyimser
                  </button>
                  <button
                    onClick={() => onSelectScenario("dystopian")}
                    className={`px-2 py-0.5 rounded font-bold transition-colors cursor-pointer ${
                      scenarioMode === "dystopian" ? "bg-rose-500 text-slate-950" : "text-slate-400 hover:text-white"
                    }`}
                  >
                    Distopik
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </motion.div>

      {/* 2. DYNAMIC BOTTOM FLOATING DOCK (Self-reconfiguring & Context-Aware) */}
      <div className="fixed bottom-3 sm:bottom-5 inset-x-0 z-40 flex justify-center pointer-events-none px-3">
        <motion.div
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ type: "spring", stiffness: 300, damping: 26 }}
          className="pointer-events-auto flex items-center gap-1.5 sm:gap-2 p-2 rounded-2xl bg-slate-950/95 backdrop-blur-2xl border border-cyan-500/30 shadow-[0_16px_50px_rgba(0,0,0,0.9),0_0_24px_rgba(6,182,212,0.2)] ring-1 ring-white/10 max-w-lg w-full justify-between font-mono"
        >
          {/* Active Domain Pill Trigger */}
          <motion.button
            whileTap={{ scale: 0.94 }}
            onClick={() => setIsMorphModalOpen(true)}
            className="flex items-center gap-2 py-1.5 px-2.5 sm:px-3 rounded-xl bg-slate-900/90 border border-white/10 hover:border-cyan-500/50 transition-all cursor-pointer min-w-0"
            title="Hedef Bağlamı Değiştir"
          >
            <div className={`w-6 h-6 rounded-lg bg-gradient-to-br ${currentDomainConfig.themeGradient} border border-white/20 flex items-center justify-center shrink-0`}>
              <DomainIcon className={`w-3.5 h-3.5 ${currentDomainConfig.accentColor}`} />
            </div>
            <div className="min-w-0 text-left">
              <span className="text-[9px] uppercase tracking-wider text-slate-400 font-sans block leading-none">
                BAĞLAM
              </span>
              <span className="text-[11px] font-extrabold text-white truncate block font-sans">
                {currentDomainConfig.title.split(" ")[0]}
              </span>
            </div>
          </motion.button>

          {/* Contextual Sub-actions inside the active domain */}
          <div className="flex items-center gap-1 flex-1 justify-center min-w-0">
            {currentDomainConfig.tools.slice(0, 3).map((tool, toolIdx) => {
              const TIcon = tool.icon;
              const isCurrent = currentView === tool.id;

              return (
                <motion.button
                  key={`orchestrator-dock-${tool.id}-${toolIdx}`}
                  whileTap={{ scale: 0.92 }}
                  whileHover={{ scale: 1.04 }}
                  onClick={() => onSelectView(tool.id)}
                  className={`px-2.5 sm:px-3 py-1.5 rounded-xl text-[11px] font-bold transition-all flex items-center gap-1.5 cursor-pointer select-none truncate ${
                    isCurrent
                      ? "bg-cyan-500 text-slate-950 shadow-lg shadow-cyan-500/25"
                      : "text-slate-400 hover:text-white hover:bg-white/5"
                  }`}
                >
                  <TIcon className="w-3.5 h-3.5 shrink-0" />
                  <span className="hidden sm:inline truncate">{tool.label}</span>
                </motion.button>
              );
            })}
          </div>

          {/* Control Center & Settings Drawer Trigger */}
          <motion.button
            whileTap={{ scale: 0.92 }}
            whileHover={{ scale: 1.08 }}
            onClick={onOpenDrawer}
            className="p-2 rounded-xl bg-purple-950/70 hover:bg-purple-900 border border-purple-500/40 text-purple-300 flex items-center justify-center transition-all cursor-pointer shadow-lg shadow-purple-500/15 shrink-0"
            title={language === "tr" ? "Tüm Araçlar & Kontrol Merkezi" : "All Tools & Control Center"}
          >
            <Compass className="w-4 h-4 text-purple-300 animate-spin" style={{ animationDuration: "25s" }} />
          </motion.button>
        </motion.div>
      </div>

      {/* 3. CONTEXT-MORPHING SELECTION PORTAL (Futuristic Dimension Selector) */}
      <AnimatePresence>
        {isMorphModalOpen && (
          <div key="context-morphing-modal-container" className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-3 sm:p-4">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMorphModalOpen(false)}
              className="fixed inset-0 bg-black/85 backdrop-blur-md cursor-pointer"
            />

            {/* Portal Card */}
            <motion.div
              initial={{ y: 120, opacity: 0, scale: 0.95 }}
              animate={{ y: 0, opacity: 1, scale: 1 }}
              exit={{ y: 120, opacity: 0, scale: 0.95 }}
              transition={{ type: "spring", stiffness: 320, damping: 28 }}
              className="relative w-full max-w-lg bg-[#060919] border border-cyan-500/40 rounded-3xl p-5 sm:p-6 shadow-[0_25px_70px_rgba(0,0,0,0.95),0_0_40px_rgba(6,182,212,0.3)] text-white font-mono z-10 space-y-4"
            >
              {/* Header */}
              <div className="flex items-center justify-between pb-3 border-b border-white/10">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-cyan-500 to-purple-600 p-[1px]">
                    <div className="w-full h-full bg-slate-950 rounded-[11px] flex items-center justify-center">
                      <Target className="w-4 h-4 text-cyan-400" />
                    </div>
                  </div>
                  <div>
                    <h3 className="font-extrabold text-sm sm:text-base text-white font-sans">
                      {language === "tr" ? "Gelecek Boyutunu Seçin" : "Select Future Domain"}
                    </h3>
                    <p className="text-[11px] text-slate-400">
                      {language === "tr"
                        ? "Arayüz seçtiğiniz bağlama göre kendini yeniden yapılandırır."
                        : "Interface reconfigures dynamically to your focus."}
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => setIsMorphModalOpen(false)}
                  className="w-8 h-8 rounded-xl bg-slate-900 border border-slate-700 text-slate-400 hover:text-white flex items-center justify-center cursor-pointer transition-colors"
                >
                  ×
                </button>
              </div>

              {/* 4 Interactive Domain Cards */}
              <div className="space-y-2.5 max-h-[60vh] overflow-y-auto custom-scrollbar pr-1">
                {domains.map((domain, domIdx) => {
                  const DIcon = domain.icon;
                  const isCurrent = activeDomain === domain.id;

                  return (
                    <motion.button
                      key={`orchestrator-domain-${domain.id}-${domIdx}`}
                      onClick={() => handleSwitchDomain(domain.id)}
                      whileHover={{ x: 4, scale: 1.01 }}
                      whileTap={{ scale: 0.98 }}
                      className={`w-full p-3.5 rounded-2xl border text-left flex items-center justify-between gap-3 transition-all cursor-pointer ${
                        isCurrent
                          ? `bg-gradient-to-r ${domain.themeGradient} ${domain.accentBorder} shadow-lg text-white`
                          : "bg-slate-950/70 border-white/10 hover:bg-slate-900 hover:border-white/20 text-slate-300"
                      }`}
                    >
                      <div className="flex items-center gap-3.5 min-w-0">
                        <div
                          className={`w-11 h-11 rounded-xl bg-slate-950/90 border ${domain.accentBorder} flex items-center justify-center shadow-md shrink-0`}
                        >
                          <DIcon className={`w-5 h-5 ${domain.accentColor}`} />
                        </div>

                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="font-extrabold text-xs sm:text-sm text-white font-sans truncate">
                              {domain.title}
                            </span>
                            {isCurrent && (
                              <span className="text-[9px] px-1.5 py-0.2 rounded bg-cyan-500 text-slate-950 font-black shrink-0 font-mono">
                                AKTİF
                              </span>
                            )}
                          </div>
                          <p className="text-[11px] text-slate-400 line-clamp-1 mt-0.5">{domain.tagline}</p>
                          <div className="flex items-center gap-1 mt-1.5 flex-wrap">
                            {domain.tools.map((t, tIdx) => (
                              <span key={`domain-tool-${domain.id}-${t.id}-${tIdx}`} className="text-[9px] px-1.5 py-0.2 rounded bg-white/5 text-slate-400 border border-white/5">
                                {t.label}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>

                      <ChevronRight
                        className={`w-4 h-4 shrink-0 transition-colors ${
                          isCurrent ? "text-cyan-400" : "text-slate-600"
                        }`}
                      />
                    </motion.button>
                  );
                })}
              </div>

              {/* Bottom Quick Action: Open Full Control Center Menu */}
              <div className="pt-2 border-t border-white/10 flex items-center justify-between">
                <span className="text-[11px] text-slate-400">
                  {language === "tr" ? "Tüm modülleri manuel incelemek için:" : "To explore all modules manually:"}
                </span>
                <button
                  onClick={() => {
                    setIsMorphModalOpen(false);
                    onOpenDrawer();
                  }}
                  className="px-3 py-1.5 rounded-xl bg-purple-950/80 border border-purple-500/40 text-purple-300 text-xs font-bold hover:bg-purple-900 flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Compass className="w-3.5 h-3.5 text-purple-400" />
                  <span>{language === "tr" ? "Kontrol Merkezini Aç" : "Open Control Center"}</span>
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};
