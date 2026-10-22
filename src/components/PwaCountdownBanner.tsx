import React, { useState, useEffect } from "react";
import { Clock, Download, Bell, Sparkles, ShieldCheck, CheckCircle2, Zap, Trophy, Gift, HelpCircle, RefreshCw } from "lucide-react";
import { useLanguage } from "../context/LanguageContext";
import { ViewMode } from "../types";
import { BackendSyncStatus } from "./BackendSyncStatus";

interface CountdownBannerProps {
  targetYearShift?: number; // Shift in years caused by agent telemetry (e.g. -1.8 years)
  evolutionProgress?: number; // Transhumanism evolution progress %
  agentLogCount?: number;
  onNavigateView?: (view: ViewMode) => void;
  onOpenGuideModal?: () => void;
  onOpenCreditStore?: () => void;
  onOpenUserProfileModal?: () => void;
  currentUser?: any;
}

export const PwaCountdownBanner: React.FC<CountdownBannerProps> = ({
  targetYearShift = -1.2,
  evolutionProgress = 84.2,
  agentLogCount = 12,
  onNavigateView,
  onOpenGuideModal,
  onOpenCreditStore,
  onOpenUserProfileModal,
  currentUser,
}) => {
  const { language, t } = useLanguage();

  // Target Year strictly 2052 (or dynamic 2052 + shift)
  const effectiveTargetYear = 2052 + (targetYearShift ? targetYearShift * 0.1 : 0);
  const targetYearInt = Math.floor(effectiveTargetYear);

  const [timeLeft, setTimeLeft] = useState<{ days: number; hours: number; mins: number; secs: number }>({
    days: 0,
    hours: 0,
    mins: 0,
    secs: 0,
  });

  const [installPrompt, setInstallPrompt] = useState<any>(null);
  const [isInstalled, setIsInstalled] = useState<boolean>(false);
  const [notificationsActive, setNotificationsActive] = useState<boolean>(false);

  // Countdown Ticker Loop
  useEffect(() => {
    const baseTargetDate = new Date(`${targetYearInt}-01-01T00:00:00`);
    const targetTimestamp = baseTargetDate.getTime();

    const updateTimer = () => {
      const now = new Date();
      const diff = targetTimestamp - now.getTime();

      if (diff > 0) {
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
        const mins = Math.floor((diff / 1000 / 60) % 60);
        const secs = Math.floor((diff / 1000) % 60);
        setTimeLeft({ days, hours, mins, secs });
      } else {
        setTimeLeft({ days: 0, hours: 0, mins: 0, secs: 0 });
      }
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [targetYearInt]);

  // Listen for PWA BeforeInstallPrompt Event
  useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setInstallPrompt(e);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    return () => window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
  }, []);

  const handleInstallClick = async () => {
    if (installPrompt) {
      installPrompt.prompt();
      const choice = await installPrompt.userChoice;
      if (choice.outcome === "accepted") {
        setIsInstalled(true);
      }
      setInstallPrompt(null);
    } else {
      alert(language === "tr" ? "PWA Yükleme: Bu uygulamayı cihazınızın ana ekranına eklemek için tarayıcı menünüzden 'Ana Ekrana Ekle' seçeneğini kullanabilirsiniz." : "PWA Install: Use your browser menu to 'Add to Home Screen'.");
    }
  };

  const handleNotificationToggle = () => {
    if ("Notification" in window) {
      Notification.requestPermission().then((permission) => {
        if (permission === "granted") {
          setNotificationsActive(true);
          new Notification("Gelecek Bildirimleri", {
            body: "Gelecek bildirimleri aktif! 2052 Teknolojik Evrim canlı takip ediliyor.",
          });
        }
      });
    } else {
      setNotificationsActive(!notificationsActive);
    }
  };

  return (
    <div className="bg-[#060a14] border-b border-cyan-500/20 px-3 md:px-6 py-2.5 backdrop-blur-xl font-mono text-xs shadow-md">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-3">
        
        {/* Left: Hedef: 2052 Countdown Ticker */}
        <div className="flex items-center gap-2.5 bg-slate-950 border border-amber-500/30 rounded-2xl px-3.5 py-1.5 shadow-inner w-full md:w-auto justify-center md:justify-start">
          <Clock className="w-4 h-4 text-amber-400 animate-spin" style={{ animationDuration: "14s" }} />

          <div className="flex items-center gap-1 font-bold text-white text-xs">
            <span className="text-[10px] text-amber-400 uppercase mr-1 font-sans font-bold">
              Hedef: {targetYearInt} (Post-Biyolojik Transinsanlık)
            </span>
            <span className="bg-amber-950/80 border border-amber-500/40 px-1.5 py-0.5 rounded text-amber-300 font-mono">
              {timeLeft.days} Gün
            </span>
            <span className="text-amber-400">:</span>
            <span className="bg-amber-950/80 border border-amber-500/40 px-1.5 py-0.5 rounded text-amber-300 font-mono">
              {String(timeLeft.hours).padStart(2, "0")}s
            </span>
            <span className="text-amber-400">:</span>
            <span className="bg-amber-950/80 border border-amber-500/40 px-1.5 py-0.5 rounded text-amber-300 font-mono">
              {String(timeLeft.mins).padStart(2, "0")}d
            </span>
            <span className="text-amber-400">:</span>
            <span className="bg-amber-950/80 border border-amber-500/40 px-1.5 py-0.5 rounded text-amber-300 font-mono text-amber-400 animate-pulse">
              {String(timeLeft.secs).padStart(2, "0")}s
            </span>
          </div>
        </div>

        {/* Center: Utility Shortcuts (🎡 Çark, 🏆 Liderlik, ❓ Rehber) */}
        <div className="flex items-center gap-2 overflow-x-auto py-0.5 max-w-full">
          {onNavigateView && (
            <>
              <button
                onClick={() => onNavigateView("spin_wheel")}
                className="flex items-center gap-1.5 px-3 py-1 rounded-xl font-mono text-xs font-bold bg-amber-500/10 border border-amber-500/40 text-amber-300 hover:bg-amber-500/20 transition-all shrink-0 cursor-pointer"
                title="Günlük Hediye Kredi Çarkı"
              >
                <Gift className="w-3.5 h-3.5 text-amber-400 animate-bounce" />
                <span>{language === "tr" ? "Gelecek Çarkı 🎡" : "Spin Wheel 🎡"}</span>
              </button>

              <button
                onClick={() => onNavigateView("leaderboard")}
                className="flex items-center gap-1.5 px-3 py-1 rounded-xl font-mono text-xs font-bold bg-slate-900 border border-yellow-500/30 text-amber-300 hover:bg-slate-800 transition-all shrink-0 cursor-pointer"
                title="Global Liderlik Tablosu"
              >
                <Trophy className="w-3.5 h-3.5 text-amber-400" />
                <span>{language === "tr" ? "Liderlik 🏆" : "Leaderboard 🏆"}</span>
              </button>
            </>
          )}

          {onOpenGuideModal && (
            <button
              onClick={onOpenGuideModal}
              className="flex items-center gap-1.5 px-3 py-1 rounded-xl font-mono text-xs font-bold bg-cyan-950/80 border border-cyan-500/40 text-cyan-300 hover:text-white transition-all shrink-0 cursor-pointer"
              title="Kullanım Kılavuzu"
            >
              <span className="text-amber-400">❓</span>
              <span>{language === "tr" ? "Nasıl Kullanılır?" : "How to Use?"}</span>
            </button>
          )}
        </div>

        {/* Right: Realtime Sync & Credits & PWA */}
        <div className="flex items-center gap-2 justify-end w-full md:w-auto">
          <BackendSyncStatus compact={true} />

          {onOpenCreditStore && (
            <button
              onClick={currentUser ? onOpenCreditStore : onOpenUserProfileModal}
              className="flex items-center gap-1 px-2.5 py-1 rounded-xl font-mono text-xs font-bold bg-amber-500/10 border border-amber-500/40 text-amber-300 hover:bg-amber-500/20 transition-all cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>{currentUser ? `${currentUser.credits ?? 0} ⚡` : "0 ⚡ Kredi"}</span>
            </button>
          )}

          <button
            onClick={handleNotificationToggle}
            className={`p-1.5 rounded-xl border transition-all cursor-pointer ${
              notificationsActive
                ? "bg-amber-500/20 text-amber-300 border-amber-500/50"
                : "bg-slate-900 text-slate-400 border-white/10 hover:text-white"
            }`}
            title="Gelecek Bildirimleri"
          >
            <Bell className="w-3.5 h-3.5 text-amber-400" />
          </button>

          <button
            onClick={handleInstallClick}
            className="px-2.5 py-1 rounded-xl bg-blue-600/30 hover:bg-blue-600/50 text-cyan-300 border border-blue-500/40 flex items-center gap-1 font-bold cursor-pointer"
            title="PWA Yükle"
          >
            <Download className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">PWA</span>
          </button>
        </div>

      </div>
    </div>
  );
};

