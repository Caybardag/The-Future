import React from "react";
import { motion } from "motion/react";
import { Clock, Radio, Bot, Compass, Sparkles } from "lucide-react";
import { ViewMode } from "../types";
import { useLanguage } from "../context/LanguageContext";

interface QuantumBottomNavProps {
  currentView: ViewMode;
  onSelectView: (view: ViewMode) => void;
  onOpenDrawer: () => void;
  liveSignalCount?: number;
}

export const QuantumBottomNav: React.FC<QuantumBottomNavProps> = ({
  currentView,
  onSelectView,
  onOpenDrawer,
  liveSignalCount = 0,
}) => {
  const { language } = useLanguage();

  const isTimelineActive = currentView === "timeline" || currentView === "portal";
  const isRoadmapActive = currentView === "roadmap";
  const isPersonaActive = currentView === "persona_chat";

  const navButtons: Array<{
    id: ViewMode | "nexus_drawer";
    label: string;
    icon: any;
    isActive: boolean;
    onClick: () => void;
    accentColor: string;
    glowColor: string;
    isDrawerTrigger?: boolean;
    badge?: number | string;
  }> = [
    {
      id: "timeline" as ViewMode,
      label: language === "tr" ? "Zaman Akışı" : "Timeline",
      icon: Clock,
      isActive: isTimelineActive,
      onClick: () => onSelectView("timeline"),
      accentColor: "from-cyan-500 to-blue-600",
      glowColor: "rgba(6, 182, 212, 0.4)",
    },
    {
      id: "roadmap" as ViewMode,
      label: language === "tr" ? "Kişisel Plan" : "Roadmap",
      icon: Compass,
      isActive: isRoadmapActive,
      onClick: () => onSelectView("roadmap"),
      accentColor: "from-purple-500 to-indigo-600",
      glowColor: "rgba(168, 85, 247, 0.4)",
    },
    {
      id: "persona_chat" as ViewMode,
      label: language === "tr" ? "Zaman Yolcusu" : "Time Traveler",
      icon: Bot,
      isActive: isPersonaActive,
      onClick: () => onSelectView("persona_chat"),
      accentColor: "from-amber-400 to-orange-500",
      glowColor: "rgba(245, 158, 11, 0.4)",
    },
    {
      id: "nexus_drawer",
      label: language === "tr" ? "Tüm Menü" : "All Menu",
      icon: Sparkles,
      isActive: !isTimelineActive && !isRoadmapActive && !isPersonaActive,
      onClick: onOpenDrawer,
      accentColor: "from-pink-500 to-rose-600",
      glowColor: "rgba(236, 72, 153, 0.4)",
      isDrawerTrigger: true,
      badge: liveSignalCount > 0 ? liveSignalCount : undefined,
    },
  ];

  return (
    <div className="fixed bottom-3 sm:bottom-5 inset-x-0 z-40 flex justify-center pointer-events-none px-3">
      <motion.nav
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: "spring", stiffness: 280, damping: 26 }}
        className="pointer-events-auto flex items-center gap-1 sm:gap-2 p-1.5 sm:p-2 rounded-2xl bg-slate-950/90 backdrop-blur-2xl border border-cyan-500/30 shadow-[0_12px_40px_rgba(0,0,0,0.8),0_0_24px_rgba(6,182,212,0.15)] ring-1 ring-white/10 max-w-md w-full justify-around"
      >
        {navButtons.map((btn) => {
          const Icon = btn.icon;
          const active = btn.isActive;

          return (
            <motion.button
              key={`qnav-${btn.id}`}
              onClick={btn.onClick}
              whileTap={{ scale: 0.92 }}
              whileHover={{ scale: 1.04 }}
              transition={{ type: "spring", stiffness: 400, damping: 22 }}
              className={`relative flex flex-col items-center justify-center py-2 px-2.5 sm:px-4 rounded-xl transition-all duration-300 font-mono select-none cursor-pointer flex-1 ${
                active
                  ? "text-white font-bold"
                  : "text-slate-400 hover:text-slate-200 hover:bg-white/5"
              }`}
            >
              {/* Active Background Pill with Glow */}
              {active && (
                <motion.div
                  layoutId="quantumActiveTabIndicator"
                  transition={{ type: "spring", stiffness: 350, damping: 30 }}
                  className={`absolute inset-0 rounded-xl bg-gradient-to-r ${btn.accentColor} opacity-20 border border-white/20`}
                  style={{
                    boxShadow: `0 0 16px ${btn.glowColor}`,
                  }}
                />
              )}

              {/* Icon Container */}
              <div className="relative">
                <Icon
                  className={`w-5 h-5 transition-all duration-300 ${
                    active
                      ? "text-cyan-300 scale-110 drop-shadow-[0_0_8px_rgba(6,182,212,0.8)]"
                      : "text-slate-400 group-hover:text-slate-200"
                  } ${btn.isDrawerTrigger ? "text-purple-400" : ""}`}
                />

                {/* Live Signal Badge */}
                {btn.badge !== undefined && (
                  <span className="absolute -top-1.5 -right-2.5 min-w-[16px] h-4 px-1 rounded-full bg-cyan-500 text-slate-950 font-sans font-black text-[9px] flex items-center justify-center shadow-lg shadow-cyan-500/50 animate-pulse">
                    {btn.badge}
                  </span>
                )}

                {/* Drawer Trigger Particle Indicator */}
                {btn.isDrawerTrigger && (
                  <Sparkles className="w-2.5 h-2.5 text-pink-400 absolute -top-1 -right-1.5 animate-spin" style={{ animationDuration: "12s" }} />
                )}
              </div>

              {/* Label */}
              <span
                className={`text-[10px] sm:text-[11px] mt-1 tracking-tight transition-colors duration-200 truncate ${
                  active ? "text-cyan-200 font-extrabold" : "text-slate-400 font-medium"
                }`}
              >
                {btn.label}
              </span>
            </motion.button>
          );
        })}
      </motion.nav>
    </div>
  );
};
