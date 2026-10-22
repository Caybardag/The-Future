import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Sparkles,
  Bot,
  Radio,
  Briefcase,
  GitFork,
  Globe,
  Gift,
  ShieldCheck,
  ArrowRight,
  X,
  Compass,
} from "lucide-react";
import { ViewMode } from "../types";
import { useLanguage } from "../context/LanguageContext";

interface SmartDiscoveryTickerProps {
  onSelectView: (view: ViewMode) => void;
  currentView: ViewMode;
}

export const SmartDiscoveryTicker: React.FC<SmartDiscoveryTickerProps> = ({
  onSelectView,
  currentView,
}) => {
  const { language } = useLanguage();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isDismissed, setIsDismissed] = useState(false);

  const discoveryPrompts = [
    {
      id: "persona_chat",
      view: "persona_chat" as ViewMode,
      icon: Bot,
      color: "text-amber-400",
      border: "border-amber-500/30",
      bg: "bg-amber-950/40",
      badge: language === "tr" ? "Zaman Yolcusu" : "Future Persona",
      text:
        language === "tr"
          ? "2045 yılında yaşayan sibernetik mühendisi veya Mars kolonisti ile canlı sohbet edin."
          : "Chat live with a 2045 cybernetic engineer or Mars colonist.",
      actionLabel: language === "tr" ? "Sohbeti Başlat" : "Start Chat",
    },
    {
      id: "job_risk",
      view: "job_risk" as ViewMode,
      icon: Briefcase,
      color: "text-rose-400",
      border: "border-rose-500/30",
      bg: "bg-rose-950/40",
      badge: language === "tr" ? "Kariyer Kalkanı" : "Job Risk",
      text:
        language === "tr"
          ? "Mesleğinizin yapay zeka otomasyon riskini 30 saniyede hesaplayın ve hayatta kalma becerilerini görün."
          : "Calculate AI automation risk for your job and discover future-proof skills.",
      actionLabel: language === "tr" ? "Mesleğini Test Et" : "Test Job Risk",
    },
    {
      id: "butterfly",
      view: "butterfly" as ViewMode,
      icon: GitFork,
      color: "text-purple-400",
      border: "border-purple-500/30",
      bg: "bg-purple-950/40",
      badge: language === "tr" ? "Kelebek Etkisi" : "Butterfly Effect",
      text:
        language === "tr"
          ? "Bir teknolojik kırılma 3 yıl gecikirse veya hızlanırsa dünyanın dengesi nasıl değişir?"
          : "What if a key technology is delayed by 3 years? Simulate cascading global effects.",
      actionLabel: language === "tr" ? "Simüle Et" : "Simulate",
    },
    {
      id: "telegram_hub",
      view: "telegram_hub" as ViewMode,
      icon: Radio,
      color: "text-cyan-400",
      border: "border-cyan-500/30",
      bg: "bg-cyan-950/40",
      badge: language === "tr" ? "Güncel Haberler" : "Live Signals",
      text:
        language === "tr"
          ? "Doğrulanmış açık haber kanallarından taranan anlık bilimsel kırılma sinyallerini inceleyin."
          : "Explore real-time scientific breakthrough signals aggregated from open channels.",
      actionLabel: language === "tr" ? "Radarı İncele" : "Open Radar",
    },
    {
      id: "spin_wheel",
      view: "spin_wheel" as ViewMode,
      icon: Gift,
      color: "text-emerald-400",
      border: "border-emerald-500/30",
      bg: "bg-emerald-950/40",
      badge: language === "tr" ? "Günlük Hediye" : "Daily Reward",
      text:
        language === "tr"
          ? "Gelecek Çarkıfeleği'ni çevirerek günlük ücretsiz +5 ile +50 Kredi kazanın!"
          : "Spin the Future Wheel to claim your free daily credits (+5 to +50)!",
      actionLabel: language === "tr" ? "Çarkı Çevir" : "Spin Wheel",
    },
    {
      id: "geo_map",
      view: "geo_map" as ViewMode,
      icon: Globe,
      color: "text-blue-400",
      border: "border-blue-500/30",
      bg: "bg-blue-950/40",
      badge: language === "tr" ? "Küresel Harita" : "World Map",
      text:
        language === "tr"
          ? "2026–2060 arası kuantum, yapay zeka ve füzyon lideri ülkeleri interaktif dünya haritasında keşfedin."
          : "Explore countries leading AI, quantum & fusion tech on an interactive globe.",
      actionLabel: language === "tr" ? "Haritayı Aç" : "View Map",
    },
  ];

  // Filter out the prompt that points to the currently active view
  const availablePrompts = discoveryPrompts.filter((p) => p.view !== currentView);

  useEffect(() => {
    if (availablePrompts.length === 0) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % availablePrompts.length);
    }, 12000);
    return () => clearInterval(interval);
  }, [availablePrompts.length]);

  if (isDismissed || availablePrompts.length === 0) return null;

  const current = availablePrompts[currentIndex % availablePrompts.length];
  const Icon = current.icon;

  return (
    <div className="w-full mb-4 font-mono">
      <AnimatePresence mode="wait">
        <motion.div
          key={`discovery-prompt-${current?.id || currentIndex}`}
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 8 }}
          transition={{ duration: 0.3 }}
          className={`relative flex items-center justify-between gap-3 p-2.5 sm:p-3 rounded-2xl ${current.bg} border ${current.border} backdrop-blur-xl shadow-lg`}
        >
          {/* Left Icon & Text */}
          <div className="flex items-center gap-2.5 min-w-0 flex-1">
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-slate-950/80 border border-white/10 flex items-center justify-center shrink-0 shadow-sm">
              <Icon className={`w-4 h-4 ${current.color}`} />
            </div>

            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <span className="text-[9px] uppercase tracking-wider px-1.5 py-0.2 rounded font-bold bg-white/10 text-slate-300 shrink-0">
                  {current.badge}
                </span>
                <span className="text-xs text-slate-300 truncate hidden md:inline">
                  {current.text}
                </span>
                <span className="text-xs text-slate-300 truncate md:hidden">
                  {current.text}
                </span>
              </div>
            </div>
          </div>

          {/* Right Action & Close */}
          <div className="flex items-center gap-1.5 shrink-0">
            <button
              onClick={() => onSelectView(current.view)}
              className="px-2.5 sm:px-3 py-1 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-[11px] flex items-center gap-1 transition-colors cursor-pointer border border-white/15 shrink-0"
            >
              <span>{current.actionLabel}</span>
              <ArrowRight className="w-3 h-3" />
            </button>

            <button
              onClick={() => setIsDismissed(true)}
              className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition-colors cursor-pointer"
              title={language === "tr" ? "Kapat" : "Dismiss"}
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
};
