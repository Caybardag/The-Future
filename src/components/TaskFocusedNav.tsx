import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Briefcase,
  Bot,
  Radio,
  Clock,
  ArrowRight,
  Sparkles,
  ChevronDown,
  ChevronUp,
  X,
  Target,
  ShieldCheck,
  Compass,
  Layers,
  Zap,
} from "lucide-react";
import { ViewMode } from "../types";
import { useLanguage } from "../context/LanguageContext";

export type MissionGoal = "career" | "ai_forecast" | "timeline_explore" | "live_signals" | "all";

interface TaskFocusedNavProps {
  currentView: ViewMode;
  onSelectView: (view: ViewMode) => void;
  onOpenDrawer: () => void;
  liveSignalCount?: number;
}

export const TaskFocusedNav: React.FC<TaskFocusedNavProps> = ({
  currentView,
  onSelectView,
  onOpenDrawer,
  liveSignalCount = 0,
}) => {
  const { language } = useLanguage();
  const [activeMission, setActiveMission] = useState<MissionGoal>(() => {
    if (currentView === "job_risk" || currentView === "roadmap") return "career";
    if (currentView === "persona_chat" || currentView === "futurist_advisor") return "ai_forecast";
    if (currentView === "telegram_feed" || currentView === "verification" || currentView === "agent_scan") return "live_signals";
    return "timeline_explore";
  });

  const [isSwitcherOpen, setIsSwitcherOpen] = useState(false);
  const [isDockMinimized, setIsDockMinimized] = useState(false);

  // Sync activeMission when currentView changes externally
  useEffect(() => {
    if (currentView === "job_risk" || currentView === "roadmap") {
      setActiveMission("career");
    } else if (["persona_chat", "futurist_advisor", "butterfly"].includes(currentView)) {
      setActiveMission("ai_forecast");
    } else if (["telegram_feed", "verification", "agent_scan"].includes(currentView)) {
      setActiveMission("live_signals");
    } else if (["timeline", "portal", "geo_map", "comparison"].includes(currentView)) {
      setActiveMission("timeline_explore");
    }
  }, [currentView]);

  // Mission configurations with their dedicated contextual toolkits
  const missions = [
    {
      id: "timeline_explore" as MissionGoal,
      title: language === "tr" ? "Zaman Yolculuğu & Keşif" : "Timeline Exploration",
      shortTitle: language === "tr" ? "Zaman Akışı" : "Timeline",
      description: language === "tr" ? "2026–2060 arası dönüm noktaları ve küresel harita" : "2026–2060 milestones & global map",
      icon: Clock,
      primaryView: "timeline" as ViewMode,
      accentColor: "from-cyan-500 to-blue-600",
      glowColor: "rgba(6, 182, 212, 0.4)",
      badgeBg: "bg-cyan-500/20 text-cyan-300 border-cyan-500/30",
      contextTools: [
        { id: "timeline" as ViewMode, label: language === "tr" ? "Kronolojik Akış" : "Timeline", icon: Clock },
        { id: "geo_map" as ViewMode, label: language === "tr" ? "Küresel Harita" : "World Map", icon: Compass },
        { id: "comparison" as ViewMode, label: language === "tr" ? "Kıyaslama Matrisi" : "Compare Years", icon: Layers },
      ],
    },
    {
      id: "career" as MissionGoal,
      title: language === "tr" ? "Kariyer & Meslek Güvencesi" : "Career Future & Job Risk",
      shortTitle: language === "tr" ? "Kariyer Hedefi" : "Career Goal",
      description: language === "tr" ? "Mesleğinizin yapay zeka dönüşüm riskini ve yol haritasını hesaplayın" : "Analyze AI automation risk and roadmap for your profession",
      icon: Briefcase,
      primaryView: "roadmap" as ViewMode,
      accentColor: "from-purple-500 to-rose-600",
      glowColor: "rgba(168, 85, 247, 0.4)",
      badgeBg: "bg-purple-500/20 text-purple-300 border-purple-500/30",
      contextTools: [
        { id: "roadmap" as ViewMode, label: language === "tr" ? "Kişisel Yol Haritası" : "Personal Roadmap", icon: Compass },
        { id: "job_risk" as ViewMode, label: language === "tr" ? "Meslek Risk Analizi" : "Job Risk Test", icon: Briefcase },
        { id: "futurist_advisor" as ViewMode, label: language === "tr" ? "Fütürist Kariyer Danışmanı" : "Career Advisor", icon: Sparkles },
      ],
    },
    {
      id: "ai_forecast" as MissionGoal,
      title: language === "tr" ? "Zaman Yolcusu & Gelecek İnsanı" : "Time Traveler & Future Persona",
      shortTitle: language === "tr" ? "Zaman Yolcusu" : "Time Traveler",
      description: language === "tr" ? "2030, 2045 ve 2060 insan modelleriyle canlı sohbet edin" : "Chat directly with future human personas",
      icon: Bot,
      primaryView: "persona_chat" as ViewMode,
      accentColor: "from-amber-400 to-orange-500",
      glowColor: "rgba(245, 158, 11, 0.4)",
      badgeBg: "bg-amber-500/20 text-amber-300 border-amber-500/30",
      contextTools: [
        { id: "persona_chat" as ViewMode, label: language === "tr" ? "Zaman Yolcusu Chat" : "Future Persona", icon: Bot },
        { id: "butterfly" as ViewMode, label: language === "tr" ? "Kelebek Etkisi" : "Butterfly Effect", icon: Zap },
      ],
    },
    {
      id: "live_signals" as MissionGoal,
      title: language === "tr" ? "Canlı İstihbarat & Bilimsel İnceleme" : "Live Signals & Research",
      shortTitle: language === "tr" ? "Canlı Radar" : "Live Radar",
      description: language === "tr" ? "Kanallardan akan canlı bilimsel haberler ve akademik kaynak taraması" : "Real-time news feeds & academic source scans",
      icon: Radio,
      primaryView: "telegram_hub" as ViewMode,
      accentColor: "from-blue-500 to-indigo-600",
      glowColor: "rgba(59, 130, 246, 0.4)",
      badgeBg: "bg-blue-500/20 text-blue-300 border-blue-500/30",
      contextTools: [
        { id: "telegram_hub" as ViewMode, label: language === "tr" ? "Güncel Haberler" : "Latest News", icon: Radio, count: liveSignalCount },
        { id: "verification" as ViewMode, label: language === "tr" ? "Akademik Radar" : "Academic Radar", icon: ShieldCheck },
        { id: "agent_scan" as ViewMode, label: language === "tr" ? "Otonom Ajan" : "Autonomous Agent", icon: Zap },
      ],
    },
  ];

  const currentMissionConfig = missions.find((m) => m.id === activeMission) || missions[0];
  const CurrentIcon = currentMissionConfig.icon;

  const handleSelectMission = (missionId: MissionGoal) => {
    setActiveMission(missionId);
    setIsSwitcherOpen(false);
    const target = missions.find((m) => m.id === missionId);
    if (target) {
      onSelectView(target.primaryView);
    }
  };

  return (
    <>
      {/* 1. FLOATING MISSION COCKPIT / TASK FOCUS BAR (BOTTOM CENTER) */}
      <div className="fixed bottom-3 sm:bottom-5 inset-x-0 z-40 flex flex-col items-center pointer-events-none px-3">
        <motion.div
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ type: "spring", stiffness: 300, damping: 25 }}
          className="pointer-events-auto flex flex-col items-center max-w-lg w-full font-mono"
        >
          {/* Main Focus Capsule */}
          <div className="w-full bg-slate-950/95 backdrop-blur-2xl border border-cyan-500/30 rounded-2xl p-2 shadow-[0_12px_45px_rgba(0,0,0,0.85),0_0_24px_rgba(6,182,212,0.2)] ring-1 ring-white/10 flex items-center justify-between gap-2">
            
            {/* Left: Active Mission Indicator & Quick Goal Switcher Trigger */}
            <motion.button
              whileTap={{ scale: 0.96 }}
              onClick={() => setIsSwitcherOpen(!isSwitcherOpen)}
              className="flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-900/90 hover:bg-slate-800 border border-white/10 text-left transition-all cursor-pointer group flex-1 min-w-0"
              title="Hedef Odaklı Görevi Değiştir"
            >
              <div
                className={`w-7 h-7 rounded-lg bg-gradient-to-br ${currentMissionConfig.accentColor} flex items-center justify-center text-white shadow-md shrink-0`}
              >
                <CurrentIcon className="w-4 h-4 text-white" />
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] uppercase tracking-wider text-slate-400 font-sans font-bold truncate">
                    {language === "tr" ? "ODAK HEDEF:" : "FOCUSED MISSION:"}
                  </span>
                  <span className={`text-[9px] px-1 py-0.2 rounded font-extrabold border shrink-0 ${currentMissionConfig.badgeBg}`}>
                    AKTİF
                  </span>
                </div>
                <div className="text-xs font-black text-white truncate font-sans group-hover:text-cyan-300 transition-colors">
                  {currentMissionConfig.shortTitle}
                </div>
              </div>

              <ChevronDown
                className={`w-4 h-4 text-slate-400 group-hover:text-white transition-transform shrink-0 ${
                  isSwitcherOpen ? "rotate-180 text-cyan-400" : ""
                }`}
              />
            </motion.button>

            {/* Middle: Contextual Mission Sub-tools (Only the ones relevant to this goal) */}
            <div className="flex items-center gap-1 shrink-0">
              {currentMissionConfig.contextTools.map((tool, tIdx) => {
                const ToolIcon = tool.icon;
                const isSelected = currentView === tool.id;

                return (
                  <motion.button
                    key={`m-tool-${tool.id}-${tIdx}`}
                    onClick={() => onSelectView(tool.id)}
                    whileTap={{ scale: 0.92 }}
                    whileHover={{ scale: 1.05 }}
                    className={`relative px-2.5 sm:px-3 py-2 rounded-xl text-[11px] font-bold transition-all flex items-center gap-1.5 cursor-pointer select-none ${
                      isSelected
                        ? "bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/30"
                        : "bg-slate-900/60 hover:bg-slate-800 text-slate-300 border border-white/5"
                    }`}
                  >
                    <ToolIcon className={`w-3.5 h-3.5 ${isSelected ? "text-slate-950" : "text-cyan-400"}`} />
                    <span className="hidden sm:inline truncate max-w-[90px]">{tool.label}</span>

                    {tool.count !== undefined && tool.count > 0 && (
                      <span className="ml-0.5 px-1 py-0.2 rounded-full bg-cyan-400 text-slate-950 font-black text-[9px] animate-pulse">
                        {tool.count}
                      </span>
                    )}
                  </motion.button>
                );
              })}
            </div>

            {/* Right: Complete Holodeck Trigger (Opens everything if user explicitly wants deep archive) */}
            <motion.button
              whileTap={{ scale: 0.92 }}
              whileHover={{ scale: 1.08 }}
              onClick={onOpenDrawer}
              className="p-2 rounded-xl bg-purple-950/60 hover:bg-purple-900/90 border border-purple-500/40 text-purple-300 flex items-center justify-center transition-all cursor-pointer shadow-lg shadow-purple-500/10 shrink-0"
              title={language === "tr" ? "Tüm Araçlar & Kontrol Merkezi" : "All Tools & Control Center"}
            >
              <Compass className="w-4 h-4 text-purple-300 animate-spin" style={{ animationDuration: "25s" }} />
            </motion.button>
          </div>
        </motion.div>
      </div>

      {/* 2. AUTO-REVEALING TASK SWITCHER MODAL / BOTTOM SHEET */}
      <AnimatePresence>
        {isSwitcherOpen && (
          <div key="task-focused-nav-switcher-container" className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-3 sm:p-4">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsSwitcherOpen(false)}
              className="fixed inset-0 bg-black/80 backdrop-blur-md cursor-pointer"
            />

            {/* Modal Card */}
            <motion.div
              initial={{ y: 100, opacity: 0, scale: 0.95 }}
              animate={{ y: 0, opacity: 1, scale: 1 }}
              exit={{ y: 100, opacity: 0, scale: 0.95 }}
              transition={{ type: "spring", stiffness: 320, damping: 28 }}
              className="relative w-full max-w-md bg-[#070b18] border border-cyan-500/40 rounded-3xl p-5 shadow-[0_20px_60px_rgba(0,0,0,0.9),0_0_35px_rgba(6,182,212,0.25)] text-white font-mono z-10 space-y-4"
            >
              {/* Header */}
              <div className="flex items-center justify-between pb-3 border-b border-white/10">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-cyan-500/20 text-cyan-300 flex items-center justify-center border border-cyan-500/30">
                    <Target className="w-4 h-4 text-cyan-400" />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-sm text-white font-sans">
                      {language === "tr" ? "Hangi Hedefe Odaklanmak İstiyorsunuz?" : "Choose Your Focus Goal"}
                    </h3>
                    <p className="text-[11px] text-slate-400">
                      {language === "tr"
                        ? "Seçtiğiniz hedefe göre gereksiz sekmeler arka plana atılır."
                        : "Irrelevant tabs are automatically secluded."}
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => setIsSwitcherOpen(false)}
                  className="w-7 h-7 rounded-lg bg-slate-900 border border-slate-700 text-slate-400 hover:text-white flex items-center justify-center cursor-pointer transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Goal Cards Selection */}
              <div className="space-y-2 max-h-[60vh] overflow-y-auto custom-scrollbar pr-1">
                {missions.map((mission, mIdx) => {
                  const MIcon = mission.icon;
                  const isCurrent = activeMission === mission.id;

                  return (
                    <motion.button
                      key={`m-mission-${mission.id}-${mIdx}`}
                      onClick={() => handleSelectMission(mission.id)}
                      whileHover={{ x: 3 }}
                      whileTap={{ scale: 0.98 }}
                      className={`w-full p-3 rounded-2xl border text-left flex items-center justify-between gap-3 transition-all cursor-pointer ${
                        isCurrent
                          ? "bg-gradient-to-r from-cyan-950/80 to-slate-900 border-cyan-400 shadow-lg shadow-cyan-500/20 text-white"
                          : "bg-slate-950/70 border-white/10 hover:bg-slate-900 hover:border-white/20 text-slate-300"
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div
                          className={`w-10 h-10 rounded-xl bg-gradient-to-br ${mission.accentColor} flex items-center justify-center text-white shadow-md shrink-0`}
                        >
                          <MIcon className="w-5 h-5 text-white" />
                        </div>

                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-xs sm:text-sm text-white font-sans truncate">
                              {mission.title}
                            </span>
                            {isCurrent && (
                              <span className="text-[9px] px-1.5 py-0.2 rounded bg-cyan-500 text-slate-950 font-black shrink-0">
                                SEÇİLİ
                              </span>
                            )}
                          </div>
                          <p className="text-[11px] text-slate-400 line-clamp-1">{mission.description}</p>
                        </div>
                      </div>

                      <ArrowRight
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
                  {language === "tr" ? "Tüm modülleri manuel incelemek için:" : "To review all modules manually:"}
                </span>
                <button
                  onClick={() => {
                    setIsSwitcherOpen(false);
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
