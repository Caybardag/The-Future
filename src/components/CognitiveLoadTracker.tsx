import React, { useState, useEffect, useMemo, useRef, useCallback } from "react";
import { ViewMode, Milestone } from "../types";
import { useLanguage } from "../context/LanguageContext";
import {
  Brain,
  Zap,
  Sparkles,
  CheckCircle2,
  X,
  Volume2,
  VolumeX,
  Play,
  Pause,
  RotateCcw,
  Maximize2,
  Minimize2,
  Sliders,
  Clock,
  ArrowRight,
  Eye,
  EyeOff,
  Shield,
  Layers,
  ChevronRight,
  ChevronLeft,
  BookOpen,
  Activity,
  Heart,
  BarChart2,
  Compass,
} from "lucide-react";

interface CognitiveLoadTrackerProps {
  currentView: ViewMode;
  onSwitchView: (view: ViewMode) => void;
  milestones?: Milestone[];
  onSelectMilestone?: (milestone: Milestone) => void;
}

interface ViewDwellTime {
  view: ViewMode;
  label: string;
  seconds: number;
  weight: number; // Cognitive weight (1.0 = normal, 1.5 = high complexity)
  visitCount: number;
}

const VIEW_METRICS: Record<ViewMode, { label: string; weight: number }> = {
  portal: { label: "Karşılama Portalı", weight: 0.4 },
  timeline: { label: "İnteraktif Zaman Çizgisi", weight: 0.8 },
  verdict: { label: "Gelecek Pusulası (Sentez Motoru)", weight: 0.3 },
  analytics: { label: "Trend Analitiği & İstatistik", weight: 1.2 },
  comparison: { label: "Senaryo Karşılaştırma", weight: 1.1 },
  roadmap: { label: "Kişisel Yol Haritası", weight: 1.0 },
  network: { label: "Nedensellik Ağ Grafiği", weight: 1.5 },
  verification: { label: "Kanıt & Doğrulama Sistemi", weight: 1.2 },
  job_risk: { label: "Meslek & Otomasyon Riski", weight: 1.4 },
  geo_map: { label: "Coğrafi Harita Analizi", weight: 1.1 },
  butterfly: { label: "Kelebek Etkisi & Zaman Kırılması", weight: 1.5 },
  persona_chat: { label: "Zaman Yolcusu Nöral Sohbet", weight: 1.2 },
  community: { label: "Topluluk Öngörüleri", weight: 0.9 },
  audit: { label: "Algoritmik Patent Denetimi", weight: 1.4 },
  data_integrity: { label: "Veri Bütünlüğü & Merkle Ağacı", weight: 1.3 },
  spin_wheel: { label: "Günün Çarkı", weight: 0.5 },
  leaderboard: { label: "Global Liderlik Tablosu", weight: 0.6 },
  futurist_advisor: { label: "Fütürist AI Danışmanı", weight: 1.2 },
  agent_scan: { label: "Otonom Ajan Taraması", weight: 1.3 },
  prediction_history: { label: "Öngörü Geçmişi", weight: 0.8 },
  telegram_feed: { label: "Güncel Haberler Akışı", weight: 1.1 },
  admin: { label: "Yönetici Konsolu", weight: 1.0 },
};

export const CognitiveLoadTracker: React.FC<CognitiveLoadTrackerProps> = ({
  currentView,
  onSwitchView,
  milestones = [],
  onSelectMilestone,
}) => {
  const { language } = useLanguage();

  // Dwell times storage
  const [dwellTimes, setDwellTimes] = useState<Record<string, ViewDwellTime>>(() => {
    try {
      const saved = sessionStorage.getItem("cognitive_dwell_times");
      if (saved) return JSON.parse(saved);
    } catch {}

    const initial: Record<string, ViewDwellTime> = {};
    Object.entries(VIEW_METRICS).forEach(([key, meta]) => {
      initial[key] = {
        view: key as ViewMode,
        label: meta.label,
        seconds: 0,
        weight: meta.weight,
        visitCount: 0,
      };
    });
    return initial;
  });

  // Tracking state
  const [sessionStartTime] = useState<number>(Date.now());
  const [contextSwitches, setContextSwitches] = useState<number>(0);
  const [lastSwitchTime, setLastSwitchTime] = useState<number>(Date.now());
  const activeViewRef = useRef<ViewMode>(currentView);
  activeViewRef.current = currentView;

  // UI state: HUD and popup notifications are completely hidden from user view by default.
  // The system runs silently in the background calculating ergonomics, memory load, and dwell time.
  const [isRecommendationOpen, setIsRecommendationOpen] = useState<boolean>(false);
  const [hasDismissedRecently, setHasDismissedRecently] = useState<boolean>(false);
  const [isTelemetryModalOpen, setIsTelemetryModalOpen] = useState<boolean>(false);
  const [isFocusModeActive, setIsFocusModeActive] = useState<boolean>(false);
  const [isCollapsedHud, setIsCollapsedHud] = useState<boolean>(true);
  const [isHudHidden, setIsHudHidden] = useState<boolean>(true);
  const [sensitivity, setSensitivity] = useState<"low" | "medium" | "high">("medium");

  // Listen for explicit manual triggers (e.g. from developer/settings console)
  useEffect(() => {
    const handleOpenTelemetry = () => setIsTelemetryModalOpen(true);
    const handleStartFocus = () => handleStartFocusMode();
    window.addEventListener("open_cognitive_telemetry", handleOpenTelemetry);
    window.addEventListener("start_focus_mode", handleStartFocus);
    return () => {
      window.removeEventListener("open_cognitive_telemetry", handleOpenTelemetry);
      window.removeEventListener("start_focus_mode", handleStartFocus);
    };
  }, []);

  // Focus Mode internal state
  const [focusMilestoneIndex, setFocusMilestoneIndex] = useState<number>(0);
  const [focusTimerSeconds, setFocusTimerSeconds] = useState<number>(300); // 5 min default focus session
  const [isTimerRunning, setIsTimerRunning] = useState<boolean>(true);
  const [isAmbiencePlaying, setIsAmbiencePlaying] = useState<boolean>(false);
  const [scratchpadNotes, setScratchpadNotes] = useState<string>(() => {
    try {
      return localStorage.getItem("focus_mode_notes") || "";
    } catch {
      return "";
    }
  });

  // Audio Ambience Synthesis (Gentle Neural White-Noise / Pink-Noise with Web Audio API)
  const audioCtxRef = useRef<AudioContext | null>(null);
  const noiseNodeRef = useRef<AudioNode | null>(null);
  const gainNodeRef = useRef<GainNode | null>(null);

  // Track active time per second
  useEffect(() => {
    const timer = setInterval(() => {
      setDwellTimes((prev) => {
        const currentKey = activeViewRef.current;
        const currentMeta = VIEW_METRICS[currentKey] || { label: currentKey, weight: 1.0 };
        const existing = prev[currentKey] || {
          view: currentKey,
          label: currentMeta.label,
          seconds: 0,
          weight: currentMeta.weight,
          visitCount: 1,
        };

        const updated = {
          ...prev,
          [currentKey]: {
            ...existing,
            seconds: existing.seconds + 1,
          },
        };

        try {
          sessionStorage.setItem("cognitive_dwell_times", JSON.stringify(updated));
        } catch {}

        return updated;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Track context switches
  useEffect(() => {
    setContextSwitches((prev) => prev + 1);
    setLastSwitchTime(Date.now());

    setDwellTimes((prev) => {
      const currentMeta = VIEW_METRICS[currentView] || { label: currentView, weight: 1.0 };
      const existing = prev[currentView] || {
        view: currentView,
        label: currentMeta.label,
        seconds: 0,
        weight: currentMeta.weight,
        visitCount: 0,
      };

      return {
        ...prev,
        [currentView]: {
          ...existing,
          visitCount: existing.visitCount + 1,
        },
      };
    });
  }, [currentView]);

  // Compute Cognitive Load Score (0% to 100%)
  const cognitiveStats = useMemo(() => {
    const entries: ViewDwellTime[] = Object.values(dwellTimes);
    const totalSeconds = entries.reduce((acc: number, curr: ViewDwellTime) => acc + curr.seconds, 0);
    const activeVisitedModules = entries.filter((e) => e.seconds >= 15);
    const visitedComplexModulesCount = activeVisitedModules.filter((e) => e.weight >= 1.2).length;

    // Weighted dwell time
    const weightedSeconds = entries.reduce((acc: number, curr: ViewDwellTime) => acc + curr.seconds * curr.weight, 0);

    // Switch velocity penalty (frequent jumping between views increases mental fatigue)
    const sessionMinutes = Math.max(1, Math.floor((Date.now() - sessionStartTime) / 60000));
    const switchFrequencyPerMin = contextSwitches / sessionMinutes;

    // Sensitivity factor
    const sensMultiplier = sensitivity === "high" ? 1.25 : sensitivity === "low" ? 0.75 : 1.0;

    // Base score calculation
    let rawScore = 0;

    // 1. Time & complexity contribution (up to 45 points)
    const timeFactor = Math.min(45, (weightedSeconds / 480) * 45); // 8 mins = max time factor

    // 2. Multi-module exploration contribution (up to 35 points)
    const moduleDiversityFactor = Math.min(35, visitedComplexModulesCount * 8.5);

    // 3. Rapid context switching penalty (up to 20 points)
    const switchFactor = Math.min(20, Math.max(0, switchFrequencyPerMin - 1.5) * 6);

    rawScore = (timeFactor + moduleDiversityFactor + switchFactor) * sensMultiplier;
    const finalScore = Math.min(100, Math.max(8, Math.round(rawScore)));

    // Categorization
    let status: "optimal" | "moderate" | "overload" = "optimal";
    let statusLabel = "Dengeli Keşif (Optimal)";
    let statusColor = "text-emerald-400 bg-emerald-500/10 border-emerald-500/30";
    let barColor = "from-emerald-500 to-teal-400";

    if (finalScore >= 70) {
      status = "overload";
      statusLabel = "Yüksek Bilişsel Yük";
      statusColor = "text-rose-400 bg-rose-500/10 border-rose-500/30";
      barColor = "from-amber-500 to-rose-500";
    } else if (finalScore >= 42) {
      status = "moderate";
      statusLabel = "Yoğun Bilgi Tüketimi";
      statusColor = "text-amber-400 bg-amber-500/10 border-amber-500/30";
      barColor = "from-cyan-500 to-amber-500";
    }

    return {
      score: finalScore,
      status,
      statusLabel,
      statusColor,
      barColor,
      totalSeconds,
      visitedCount: activeVisitedModules.length,
      complexCount: visitedComplexModulesCount,
      switchCount: contextSwitches,
      entries,
    };
  }, [dwellTimes, contextSwitches, sessionStartTime, sensitivity]);

  // Proactive recommendation trigger is disabled by default so it runs silently in the background without annoying popups
  // Users or admins can still view detailed telemetry on-demand via drawer or settings
  useEffect(() => {
    // Silent background monitoring only
  }, [cognitiveStats.score]);

  // Focus Timer Tick
  useEffect(() => {
    if (!isFocusModeActive || !isTimerRunning) return;
    const interval = setInterval(() => {
      setFocusTimerSeconds((prev) => {
        if (prev <= 1) {
          setIsTimerRunning(false);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isFocusModeActive, isTimerRunning]);

  // Ambience Audio Control
  const toggleAmbience = () => {
    if (isAmbiencePlaying) {
      if (audioCtxRef.current) {
        audioCtxRef.current.close();
        audioCtxRef.current = null;
      }
      setIsAmbiencePlaying(false);
    } else {
      try {
        const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
        const ctx = new AudioContextClass();
        audioCtxRef.current = ctx;

        // Generate gentle Brownian / Pink noise
        const bufferSize = ctx.sampleRate * 2;
        const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
        const output = noiseBuffer.getChannelData(0);
        let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;

        for (let i = 0; i < bufferSize; i++) {
          const white = Math.random() * 2 - 1;
          b0 = 0.99886 * b0 + white * 0.0555179;
          b1 = 0.99332 * b1 + white * 0.0750759;
          b2 = 0.96900 * b2 + white * 0.1538520;
          b3 = 0.86650 * b3 + white * 0.3104856;
          b4 = 0.55000 * b4 + white * 0.5329522;
          b5 = -0.7616 * b5 - white * 0.0168980;
          output[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362) * 0.035;
          b6 = white * 0.115926;
        }

        const whiteNoise = ctx.createBufferSource();
        whiteNoise.buffer = noiseBuffer;
        whiteNoise.loop = true;

        const gainNode = ctx.createGain();
        gainNode.gain.setValueAtTime(0.12, ctx.currentTime);

        whiteNoise.connect(gainNode);
        gainNode.connect(ctx.destination);
        whiteNoise.start();

        noiseNodeRef.current = whiteNoise;
        gainNodeRef.current = gainNode;
        setIsAmbiencePlaying(true);
      } catch {
        setIsAmbiencePlaying(false);
      }
    }
  };

  // Cleanup audio on unmount
  useEffect(() => {
    return () => {
      if (audioCtxRef.current) {
        audioCtxRef.current.close().catch(() => {});
      }
    };
  }, []);

  const handleStartFocusMode = () => {
    setIsRecommendationOpen(false);
    setIsFocusModeActive(true);
    setFocusTimerSeconds(300); // 5 min default
    setIsTimerRunning(true);
  };

  const handleDismissRecommendation = () => {
    setIsRecommendationOpen(false);
    setHasDismissedRecently(true);
    // Snooze for 8 minutes
    setTimeout(() => {
      setHasDismissedRecently(false);
    }, 8 * 60 * 1000);
  };

  const handleResetMetrics = () => {
    const initial: Record<string, ViewDwellTime> = {};
    Object.entries(VIEW_METRICS).forEach(([key, meta]) => {
      initial[key] = {
        view: key as ViewMode,
        label: meta.label,
        seconds: 0,
        weight: meta.weight,
        visitCount: 0,
      };
    });
    setDwellTimes(initial);
    setContextSwitches(0);
    try {
      sessionStorage.removeItem("cognitive_dwell_times");
    } catch {}
  };

  const currentFocusMilestone = milestones[focusMilestoneIndex] || milestones[0];

  const formatSeconds = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m}:${s < 10 ? "0" : ""}${s}`;
  };

  return (
    <>
      {/* 1. FLOATING COGNITIVE HUD STATUS PILL */}
      {!isFocusModeActive && !isHudHidden && (
        <div className="fixed bottom-16 right-3 sm:bottom-24 sm:right-5 z-40 font-mono">
          {isCollapsedHud ? (
            /* Minimized discrete circular badge */
            <div className="flex items-center gap-1">
              <button
                onClick={() => {
                  setIsCollapsedHud(false);
                  try {
                    localStorage.setItem("cognitive_hud_minimized", "false");
                  } catch {}
                }}
                className="group relative p-2 sm:p-2.5 rounded-2xl bg-slate-950/85 hover:bg-slate-900 backdrop-blur-md border border-slate-800 hover:border-cyan-500/50 text-cyan-400 shadow-xl shadow-black/60 transition-all flex items-center gap-1.5 cursor-pointer"
                title="Bilişsel Yük Göstergesini Genişlet"
              >
                <Brain className={`w-4 h-4 ${cognitiveStats.score >= 70 ? "text-rose-400 animate-pulse" : "text-cyan-400"}`} />
                <span className="text-[10px] font-bold text-slate-300">%{cognitiveStats.score}</span>
                {cognitiveStats.score >= 70 && (
                  <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-rose-500 animate-ping" />
                )}
              </button>
              <button
                onClick={() => {
                  setIsHudHidden(true);
                  try {
                    localStorage.setItem("cognitive_hud_hidden", "true");
                  } catch {}
                }}
                className="w-5 h-5 rounded-full bg-slate-900/80 hover:bg-slate-800 border border-slate-700/80 text-slate-400 hover:text-rose-300 flex items-center justify-center text-[9px] shadow transition-colors cursor-pointer"
                title="Göstergeyi Gizle"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          ) : (
            /* Expanded sleek pill with minimize and close buttons */
            <div className="flex items-center gap-1.5 bg-slate-950/90 backdrop-blur-md border border-slate-800/90 rounded-2xl p-1.5 shadow-2xl shadow-black/80 hover:border-slate-700 transition-all">
              <button
                onClick={() => setIsTelemetryModalOpen(true)}
                className="flex items-center gap-2 px-2.5 py-1.5 rounded-xl hover:bg-slate-900/80 transition-colors text-left group cursor-pointer"
                title="Bilişsel Yük & Ergonomi Telemetrisi"
              >
                <div className="relative">
                  <Brain className={`w-4 h-4 ${cognitiveStats.score >= 70 ? "text-rose-400 animate-pulse" : "text-cyan-400"}`} />
                  {cognitiveStats.score >= 70 && (
                    <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-rose-500 animate-ping" />
                  )}
                </div>

                <div className="flex flex-col">
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] uppercase font-bold text-slate-400">
                      Bilişsel Yük
                    </span>
                    <span className="text-[11px] font-bold text-white">
                      %{cognitiveStats.score}
                    </span>
                  </div>
                  <div className="w-16 sm:w-20 bg-slate-800 h-1 rounded-full overflow-hidden mt-0.5">
                    <div
                      className={`h-full rounded-full bg-gradient-to-r ${cognitiveStats.barColor} transition-all duration-500`}
                      style={{ width: `${cognitiveStats.score}%` }}
                    />
                  </div>
                </div>
              </button>

              {/* Quick Switch to Focus Mode Button */}
              <button
                onClick={handleStartFocusMode}
                className="px-2 py-1.5 rounded-xl bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 text-[10px] font-bold flex items-center gap-1 transition-all cursor-pointer"
                title="Odaklanma Modunu Aç"
              >
                <Sparkles className="w-3 h-3 text-cyan-400" />
                <span className="hidden sm:inline">Odak Modu</span>
              </button>

              {/* Minimize button */}
              <button
                onClick={() => {
                  setIsCollapsedHud(true);
                  try {
                    localStorage.setItem("cognitive_hud_minimized", "true");
                  } catch {}
                }}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors cursor-pointer"
                title="Simge Durumuna Küçült"
              >
                <Minimize2 className="w-3.5 h-3.5" />
              </button>

              {/* Close / Hide button */}
              <button
                onClick={() => {
                  setIsHudHidden(true);
                  try {
                    localStorage.setItem("cognitive_hud_hidden", "true");
                  } catch {}
                }}
                className="p-1 rounded-lg text-slate-400 hover:text-rose-300 hover:bg-slate-800 transition-colors cursor-pointer"
                title="Tamamen Kapat"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>
      )}

      {/* 2. PROACTIVE FOCUS MODE RECOMMENDATION TOAST */}
      {isRecommendationOpen && !isFocusModeActive && (
        <div className="fixed bottom-6 left-5 right-5 sm:left-auto sm:right-5 sm:max-w-md z-50 animate-in slide-in-from-bottom-5 duration-300">
          <div className="bg-gradient-to-b from-slate-900 to-slate-950 border-2 border-cyan-500/40 rounded-2xl p-5 shadow-2xl shadow-cyan-950/60 space-y-3 font-mono">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
                  <Brain className="w-5 h-5 animate-pulse" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                    Bilişsel Yük Dengesi Uyarısı
                  </h4>
                  <span className="text-[10px] text-cyan-400 font-bold">
                    Yük Endeksi: %{cognitiveStats.score} (Yüksek Yoğunluk)
                  </span>
                </div>
              </div>
              <button
                onClick={handleDismissRecommendation}
                className="text-slate-500 hover:text-slate-300 p-1 rounded-lg hover:bg-slate-800"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              Son oturumda <strong>{cognitiveStats.complexCount} karmaşık analitik modülü</strong> incelediniz ve bağlam değişim hızı yükseldi. Zihinsel yorgunluğu önlemek ve bilgileri derinlemesine sindirmek için <strong>Odaklanma Modu</strong>'na geçmeniz önerilir.
            </p>

            <div className="flex items-center gap-2 pt-1">
              <button
                onClick={handleStartFocusMode}
                className="flex-1 px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold text-xs flex items-center justify-center gap-1.5 shadow-lg shadow-cyan-500/20 transition-all"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Odaklanma Modunu Başlat</span>
              </button>
              <button
                onClick={handleDismissRecommendation}
                className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition-colors"
              >
                Sonra
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 3. COGNITIVE TELEMETRY & ERGONOMICS MODAL */}
      {isTelemetryModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-slate-950 border border-slate-800 rounded-3xl p-6 sm:p-8 max-w-2xl w-full space-y-6 shadow-2xl font-mono max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-2xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
                  <Brain className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-base sm:text-lg font-bold text-white">
                    Bilişsel Yük & Zihinsel Ergonomi Telemetrisi
                  </h2>
                  <p className="text-xs text-slate-400">
                    Kullanıcı bağlam geçişleri ve analitik bilgi yoğunluğu takibi
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsTelemetryModalOpen(false)}
                className="text-slate-400 hover:text-white p-1.5 rounded-xl hover:bg-slate-900"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Score Breakdown Card */}
            <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-5 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-400 uppercase font-bold">
                  Anlık Bilişsel Gerilim Endeksi
                </span>
                <span className={`text-xs px-2.5 py-1 rounded-lg font-bold border ${cognitiveStats.statusColor}`}>
                  {cognitiveStats.statusLabel}
                </span>
              </div>

              <div className="flex items-baseline gap-2">
                <div className="text-4xl font-black text-white">
                  %{cognitiveStats.score}
                </div>
                <span className="text-xs text-slate-400">
                  / %100 Max Kapasite
                </span>
              </div>

              <div className="w-full bg-slate-800 h-2.5 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full bg-gradient-to-r ${cognitiveStats.barColor} transition-all duration-500`}
                  style={{ width: `${cognitiveStats.score}%` }}
                />
              </div>

              <div className="grid grid-cols-3 gap-3 pt-2 text-center text-xs">
                <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800/60">
                  <div className="text-[10px] text-slate-400">Toplam Oturum</div>
                  <div className="text-sm font-bold text-cyan-400 mt-0.5">
                    {Math.floor(cognitiveStats.totalSeconds / 60)} dk {cognitiveStats.totalSeconds % 60} sn
                  </div>
                </div>
                <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800/60">
                  <div className="text-[10px] text-slate-400">Karmaşık Modüller</div>
                  <div className="text-sm font-bold text-purple-400 mt-0.5">
                    {cognitiveStats.complexCount} / {Object.keys(VIEW_METRICS).length}
                  </div>
                </div>
                <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800/60">
                  <div className="text-[10px] text-slate-400">Bağlam Geçişi</div>
                  <div className="text-sm font-bold text-amber-400 mt-0.5">
                    {cognitiveStats.switchCount} Kez
                  </div>
                </div>
              </div>
            </div>

            {/* Dwell Time per Module Breakdown */}
            <div className="space-y-3">
              <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <Activity className="w-4 h-4 text-cyan-400" />
                <span>Modüllerde Geçirilen Odak Süreleri</span>
              </h3>

              <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                {cognitiveStats.entries
                  .filter((e) => e.seconds > 0)
                  .sort((a, b) => b.seconds - a.seconds)
                  .map((item, idx) => (
                    <div
                      key={`cog-stat-${item.view || 'view'}-${idx}`}
                      className="flex items-center justify-between p-2.5 bg-slate-900/40 border border-slate-800/60 rounded-xl text-xs"
                    >
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-cyan-400" />
                        <span className="text-slate-200 font-bold">{item.label}</span>
                        {item.weight >= 1.3 && (
                          <span className="text-[9px] px-1.5 py-0.5 rounded bg-purple-500/10 text-purple-400 border border-purple-500/20">
                            Yoğun
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-3 text-slate-400">
                        <span>{item.visitCount} ziyaret</span>
                        <strong className="text-white">{formatSeconds(item.seconds)}</strong>
                      </div>
                    </div>
                  ))}
              </div>
            </div>

            {/* Sensitivity & Reset Controls */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-800 text-xs">
              <div className="flex items-center gap-2">
                <span className="text-slate-400">Hassasiyet:</span>
                {(["low", "medium", "high"] as const).map((lvl) => (
                  <button
                    key={`sensitivity-lvl-${lvl}`}
                    onClick={() => setSensitivity(lvl)}
                    className={`px-2 py-1 rounded-lg font-bold uppercase text-[10px] transition-all ${
                      sensitivity === lvl
                        ? "bg-cyan-500 text-slate-950"
                        : "bg-slate-900 text-slate-400 hover:text-slate-200"
                    }`}
                  >
                    {lvl === "low" ? "Düşük" : lvl === "medium" ? "Orta" : "Yüksek"}
                  </button>
                ))}
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleResetMetrics}
                  className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 text-xs font-bold border border-slate-800 transition-colors"
                >
                  Metrikleri Sıfırla
                </button>
                <button
                  onClick={() => {
                    setIsTelemetryModalOpen(false);
                    handleStartFocusMode();
                  }}
                  className="px-4 py-1.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 shadow-lg shadow-cyan-500/20 transition-all"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Odaklanma Modu</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 4. FULL-SCREEN ZEN "FOCUS MODE" (ODAKLANMA MODU) VIEW */}
      {isFocusModeActive && (
        <div className="fixed inset-0 z-50 bg-[#06080E] text-slate-100 flex flex-col font-mono overflow-y-auto animate-in fade-in duration-300">
          {/* Minimalist Top Focus Bar */}
          <header className="border-b border-slate-800/80 px-6 py-4 flex items-center justify-between bg-slate-950/80 backdrop-blur-md sticky top-0 z-30">
            <div className="flex items-center gap-3">
              <span className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
                <Sparkles className="w-4 h-4 animate-pulse" />
              </span>
              <div>
                <h1 className="text-sm font-bold text-white tracking-wide">
                  Zen Odaklanma Modu (Focus Stream)
                </h1>
                <span className="text-[10px] text-cyan-400 font-semibold">
                  Distraction-Free Deep Analysis • 2026—2060
                </span>
              </div>
            </div>

            {/* Controls: Timer, White Noise Ambience & Exit */}
            <div className="flex items-center gap-3">
              {/* Focus Timer */}
              <div className="flex items-center gap-2 bg-slate-900 border border-slate-800 px-3 py-1.5 rounded-xl text-xs">
                <Clock className="w-3.5 h-3.5 text-amber-400" />
                <span className="font-bold text-amber-300">
                  {formatSeconds(focusTimerSeconds)}
                </span>
                <button
                  onClick={() => setIsTimerRunning(!isTimerRunning)}
                  className="text-slate-400 hover:text-white ml-1"
                >
                  {isTimerRunning ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                </button>
                <button
                  onClick={() => setFocusTimerSeconds(300)}
                  className="text-slate-400 hover:text-white"
                  title="5 Dk Sıfırla"
                >
                  <RotateCcw className="w-3 h-3" />
                </button>
              </div>

              {/* Ambient Noise Toggle */}
              <button
                onClick={toggleAmbience}
                className={`p-2 rounded-xl border transition-all ${
                  isAmbiencePlaying
                    ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/40"
                    : "bg-slate-900 text-slate-400 border-slate-800 hover:text-slate-200"
                }`}
                title={isAmbiencePlaying ? "Nöral Ambiyans Sesi Açık" : "Nöral Ambiyans Sesi Kapalı"}
              >
                {isAmbiencePlaying ? <Volume2 className="w-4 h-4 text-emerald-400" /> : <VolumeX className="w-4 h-4" />}
              </button>

              {/* Exit Focus Mode */}
              <button
                onClick={() => {
                  setIsFocusModeActive(false);
                  if (audioCtxRef.current) {
                    audioCtxRef.current.close().catch(() => {});
                    audioCtxRef.current = null;
                    setIsAmbiencePlaying(false);
                  }
                }}
                className="px-3.5 py-1.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/30 text-xs font-bold flex items-center gap-1.5 transition-all"
              >
                <X className="w-3.5 h-3.5" />
                <span>Odak Modundan Çık</span>
              </button>
            </div>
          </header>

          {/* Main Focus Content Container */}
          <main className="max-w-4xl mx-auto w-full flex-1 p-6 sm:p-10 space-y-8">
            {/* Milestone Navigator & Index */}
            {currentFocusMilestone && (
              <div className="space-y-6">
                <div className="flex items-center justify-between text-xs text-slate-400 border-b border-slate-800/80 pb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-cyan-400 font-bold text-base">
                      {currentFocusMilestone.year}
                    </span>
                    <span className="text-slate-600">/</span>
                    <span className="text-slate-300 font-semibold">
                      {currentFocusMilestone.category}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-[11px] text-slate-500">
                      {focusMilestoneIndex + 1} / {milestones.length}
                    </span>
                    <button
                      onClick={() => setFocusMilestoneIndex((prev) => Math.max(0, prev - 1))}
                      disabled={focusMilestoneIndex === 0}
                      className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 disabled:opacity-40"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setFocusMilestoneIndex((prev) => Math.min(milestones.length - 1, prev + 1))}
                      disabled={focusMilestoneIndex === milestones.length - 1}
                      className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 disabled:opacity-40"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Big Clean Milestone Card */}
                <article className="space-y-5">
                  <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight leading-snug">
                    {currentFocusMilestone.title}
                  </h2>

                  <p className="text-base sm:text-lg text-slate-300 font-sans leading-relaxed">
                    {currentFocusMilestone.description}
                  </p>

                  {/* Key Highlights Bento */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 pt-3">
                    <div className="bg-slate-950/70 border border-slate-800/80 rounded-2xl p-4 space-y-1">
                      <span className="text-[10px] uppercase text-cyan-400 font-bold">
                        AI Otonomi İndeksi
                      </span>
                      <div className="text-xl font-bold text-white">
                        %{currentFocusMilestone.aiAutonomyIndex || 50}
                      </div>
                    </div>

                    <div className="bg-slate-950/70 border border-slate-800/80 rounded-2xl p-4 space-y-1">
                      <span className="text-[10px] uppercase text-amber-400 font-bold">
                        İnsan Artırımı
                      </span>
                      <div className="text-xl font-bold text-white">
                        %{currentFocusMilestone.humanAugmentationIndex || 40}
                      </div>
                    </div>

                    <div className="bg-slate-950/70 border border-slate-800/80 rounded-2xl p-4 space-y-1">
                      <span className="text-[10px] uppercase text-emerald-400 font-bold">
                        Gerçekleşme İhtimali
                      </span>
                      <div className="text-xl font-bold text-white">
                        %{currentFocusMilestone.probability || 80}
                      </div>
                    </div>
                  </div>

                  {/* Key Ethical / Societal Implications */}
                  {currentFocusMilestone.ethicalRisks && currentFocusMilestone.ethicalRisks.length > 0 && (
                    <div className="bg-slate-900/40 border border-slate-800/80 rounded-2xl p-4 space-y-2">
                      <span className="text-xs font-bold text-rose-400 flex items-center gap-1.5">
                        <Shield className="w-3.5 h-3.5" />
                        <span>Kritik Etik & Toplumsal Risk</span>
                      </span>
                      <p className="text-xs text-slate-300 leading-relaxed">
                        {currentFocusMilestone.ethicalRisks.join(" • ")}
                      </p>
                    </div>
                  )}
                </article>
              </div>
            )}

            {/* Distraction-free Focus Scratchpad */}
            <div className="border-t border-slate-800/80 pt-6 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-400 flex items-center gap-2">
                  <BookOpen className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Kişisel Odak Notları & Düşünce Günlüğü</span>
                </span>
                <span className="text-[10px] text-slate-500">
                  Tarayıcınızda otomatik kaydedilir
                </span>
              </div>
              <textarea
                value={scratchpadNotes}
                onChange={(e) => {
                  setScratchpadNotes(e.target.value);
                  try {
                    localStorage.setItem("focus_mode_notes", e.target.value);
                  } catch {}
                }}
                placeholder="Bu dönüm noktası hakkında düşüncelerinizi, sentezlerinizi ve çıkarımlarınızı buraya yazın..."
                rows={4}
                className="w-full bg-slate-950/80 border border-slate-800 rounded-2xl p-4 text-xs font-mono text-slate-200 focus:outline-none focus:border-cyan-500 transition-colors resize-none placeholder-slate-600"
              />
            </div>
          </main>
        </div>
      )}
    </>
  );
};

export default CognitiveLoadTracker;
