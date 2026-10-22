import React, { useState, useEffect, useRef } from "react";
import {
  X,
  Play,
  Sparkles,
  Zap,
  CheckCircle2,
  AlertTriangle,
  Award,
  Film,
  Volume2,
  VolumeX,
  Coins,
  ShieldCheck,
  Cpu,
  ArrowRight,
} from "lucide-react";
import { useLanguage } from "../context/LanguageContext";
import { useAuth } from "../context/AuthContext";
import {
  getTodayRewardedAdStats,
  recordRewardedAdWatch,
  CREDITS_PER_REWARDED_AD,
} from "../utils/rewardedAdTracker";
import { getApiHeaders, notifyClientCreditsUpdated } from "../utils/apiClient";

interface RewardedAdModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRewardClaimed?: (credits: number) => void;
}

const SPONSOR_ADS = [
  {
    id: "neural_drive",
    title: "Quantum Neural Cloud: Next-Gen BCI",
    subtitle: "Yapay Zeka ve Nöral Ağların Geleceğini Keşfedin",
    durationSec: 15,
    tag: "Kuantum & AI",
    bgGradient: "from-purple-900 via-indigo-950 to-blue-900",
    description: "Saniyede 100 Trilyon işlem kapasitesiyle kuantum simülasyonlarınızı bulutta çalıştırın. Üniversiteler ve araştırmacılar için ücretsiz deneme süresi.",
    cta: "Quantum Cloud'u Keşfet",
  },
  {
    id: "biotech_longevity",
    title: "Cellular Rejuvenation Lab 2045",
    subtitle: "Hücresel Gençleşme ve Telomer Terapileri",
    durationSec: 15,
    tag: "Biyoteknoloji & Uzun Yaşam",
    bgGradient: "from-emerald-950 via-teal-950 to-cyan-950",
    description: "Kriyonik koruma, mRNA onarım algoritmaları ve hücresel yaşlanmayı tersine çeviren patentli moleküler modelleme platformu.",
    cta: "Raporu İncele",
  },
  {
    id: "fusion_energy",
    title: "Helios Stellarator Fusion Clean Power",
    subtitle: "Temiz ve Sınırsız Füzyon Enerjisi",
    durationSec: 15,
    tag: "Temiz Enerji & Plazma",
    bgGradient: "from-amber-950 via-orange-950 to-red-950",
    description: "Sıfır karbon emisyonuyla dünyanın en güçlü manyetik plazma hapsi simülatörü. Geleceğin temiz enerji ağına şimdiden ortak olun.",
    cta: "Projeyi Gör",
  },
];

export const RewardedAdModal: React.FC<RewardedAdModalProps> = ({
  isOpen,
  onClose,
  onRewardClaimed,
}) => {
  const { language } = useLanguage();
  const isTr = language === "tr";
  const { currentUser, addCredits } = useAuth();

  const [adState, setAdState] = useState<"ready" | "watching" | "completed" | "limit_reached">("ready");
  const [remainingSec, setRemainingSec] = useState<number>(15);
  const [selectedAdIndex, setSelectedAdIndex] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [showExitConfirm, setShowExitConfirm] = useState(false);
  const [stats, setStats] = useState(() => getTodayRewardedAdStats(currentUser?.email));

  const timerRef = useRef<any>(null);

  // Reset when opening
  useEffect(() => {
    if (isOpen) {
      setStats(getTodayRewardedAdStats(currentUser?.email));
      setSelectedAdIndex(Math.floor(Math.random() * SPONSOR_ADS.length));
      setAdState("ready");
      setRemainingSec(15);
      setShowExitConfirm(false);

      if (currentUser?.email) {
        fetch(`/api/credits/rewarded-ad-status?email=${encodeURIComponent(currentUser.email)}`)
          .then((res) => res.json())
          .then((data) => {
            if (data?.success) {
              setStats((prev) => ({
                ...prev,
                watchedToday: data.watchedToday,
                remainingToday: data.remainingToday,
                canWatch: data.canWatch === 1,
              }));
              if (data.canWatch === 0) {
                setAdState("limit_reached");
              }
            }
          })
          .catch(() => {});
      }
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
  }, [isOpen, currentUser]);

  const activeAd = SPONSOR_ADS[selectedAdIndex];

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  // When countdown completes during watching
  useEffect(() => {
    if (adState === "watching" && remainingSec === 0) {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
      handleAdCompleted();
    }
  }, [adState, remainingSec]);

  // Start watching ad
  const handleStartWatching = () => {
    if (!stats.canWatch) return;
    setAdState("watching");
    setRemainingSec(15);

    if (timerRef.current) clearInterval(timerRef.current);

    timerRef.current = setInterval(() => {
      setRemainingSec((prev) => {
        if (prev <= 1) {
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  // When timer hits 0
  const handleAdCompleted = async () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    setAdState("completed");

    try {
      const res = await fetch("/api/credits/claim-rewarded-ad", {
        method: "POST",
        headers: { "Content-Type": "application/json", ...getApiHeaders() },
        body: JSON.stringify({ email: currentUser?.email }),
      });
      const data = await res.json();
      if (data?.success && typeof data.newCredits === "number") {
        notifyClientCreditsUpdated(data.newCredits);
      } else {
        addCredits(CREDITS_PER_REWARDED_AD);
      }
    } catch (_e) {
      addCredits(CREDITS_PER_REWARDED_AD);
    }

    const updatedStats = recordRewardedAdWatch(currentUser?.email);
    setStats({
      ...stats,
      watchedToday: updatedStats.watchedToday,
      remainingToday: updatedStats.remainingToday,
      canWatch: updatedStats.remainingToday > 0,
    });

    if (onRewardClaimed) {
      onRewardClaimed(CREDITS_PER_REWARDED_AD);
    }
  };

  // Close attempt handler
  const handleRequestClose = () => {
    if (adState === "watching" && remainingSec > 0) {
      setShowExitConfirm(true);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
      onClose();
    }
  };

  const handleConfirmExit = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    setShowExitConfirm(false);
    onClose();
  };

  if (!isOpen) return null;

  const progressPercent = Math.min(100, Math.max(0, ((15 - remainingSec) / 15) * 100));

  return (
    <div
      onClick={handleRequestClose}
      className="fixed inset-0 z-[130] flex items-center justify-center p-3 sm:p-4 bg-slate-950/90 backdrop-blur-lg animate-in fade-in duration-200 font-sans"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-lg bg-[#0a0f1d] border border-amber-500/40 rounded-3xl shadow-2xl overflow-hidden flex flex-col"
      >
        {/* Top Header */}
        <div className="bg-gradient-to-r from-amber-950/80 via-slate-900 to-amber-950/80 px-5 py-3.5 border-b border-amber-500/30 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-xl bg-amber-500/20 border border-amber-400/40 text-amber-300">
              <Film className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-xs sm:text-sm font-bold text-white font-mono flex items-center gap-1.5">
                <span>{isTr ? "Ödüllü Reklam İzleme" : "Rewarded Video Stream"}</span>
                <span className="text-[10px] bg-amber-500/20 text-amber-300 px-2 py-0.2 rounded-full border border-amber-500/30">
                  +{CREDITS_PER_REWARDED_AD} {isTr ? "KREDİ" : "CREDITS"}
                </span>
              </h3>
            </div>
          </div>

          <button
            onClick={handleRequestClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
            aria-label="Kapat"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Exit confirmation overlay if user tries to leave during ad */}
        {showExitConfirm && (
          <div className="absolute inset-0 z-20 bg-slate-950/95 flex flex-col items-center justify-center p-6 text-center animate-in fade-in">
            <AlertTriangle className="w-12 h-12 text-amber-400 mb-3 animate-bounce" />
            <h4 className="text-base font-bold text-white font-mono">
              {isTr ? "Ödülü Kaybetmek Üzeresiniz!" : "You will lose your reward!"}
            </h4>
            <p className="text-xs text-slate-300 mt-2 max-w-xs leading-relaxed">
              {isTr
                ? `Kredi kazanmak için kalan ${remainingSec} saniyeyi tamamlamanız gerekmektedir. Şimdi çıkarsanız +${CREDITS_PER_REWARDED_AD} kredi yüklenmeyecektir.`
                : `You must watch the remaining ${remainingSec} seconds to receive your +${CREDITS_PER_REWARDED_AD} credits.`}
            </p>
            <div className="flex items-center gap-3 mt-5">
              <button
                onClick={() => setShowExitConfirm(false)}
                className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold font-mono transition-colors cursor-pointer shadow-lg shadow-amber-500/20"
              >
                {isTr ? "İzlemeye Devam Et" : "Continue Watching"}
              </button>
              <button
                onClick={handleConfirmExit}
                className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-rose-400 text-xs font-mono transition-colors cursor-pointer"
              >
                {isTr ? "Yine de Çık" : "Exit Anyway"}
              </button>
            </div>
          </div>
        )}

        {/* State 1: READY */}
        {adState === "ready" && (
          <div className="p-6 text-center space-y-5">
            <div className="mx-auto w-16 h-16 rounded-2xl bg-gradient-to-tr from-amber-500 to-yellow-400 p-0.5 shadow-xl shadow-amber-500/20">
              <div className="w-full h-full bg-[#0a0f1d] rounded-[14px] flex items-center justify-center text-amber-400">
                <Play className="w-8 h-8 fill-amber-400/20 stroke-[1.5]" />
              </div>
            </div>

            <div>
              <h4 className="text-lg font-bold text-white font-mono">
                {isTr ? "15 Saniye Reklam İzle, Anında 15 Kredi Kazan" : "Watch a 15-Second Ad for +15 Credits"}
              </h4>
              <p className="text-xs text-slate-300 mt-1.5 leading-relaxed max-w-sm mx-auto font-sans">
                {isTr
                  ? "Kredi kartı veya ödeme gerekmeksizin; kısa sponsorlu video/tanıtımı izleyerek geleceğin yapay zeka simülasyonları için bakiye kazanabilirsiniz."
                  : "Earn instant AI credits for simulations by watching a short futuristic sponsor presentation."}
              </p>
            </div>

            {/* Daily stats badge */}
            <div className="p-3 rounded-2xl bg-slate-900/90 border border-white/10 flex items-center justify-between text-xs font-mono text-slate-300">
              <span className="flex items-center gap-1.5">
                <Award className="w-4 h-4 text-amber-400" />
                <span>{isTr ? "Bugünkü Kalan Hak:" : "Today's Limit:"}</span>
              </span>
              <span className="font-bold text-amber-400">
                {stats.remainingToday} / {stats.maxDaily} {isTr ? "Reklam" : "Ads"}
              </span>
            </div>

            {stats.canWatch ? (
              <button
                onClick={handleStartWatching}
                className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 hover:from-amber-400 hover:to-yellow-300 text-slate-950 font-mono font-black text-xs uppercase tracking-wider transition-all shadow-xl shadow-amber-500/25 flex items-center justify-center gap-2 cursor-pointer active:scale-98"
              >
                <Play className="w-4 h-4 fill-slate-950" />
                <span>{isTr ? "REKLAMI BAŞLAT (+15 KREDİ)" : "START AD (+15 CREDITS)"}</span>
              </button>
            ) : (
              <div className="p-3 rounded-xl bg-rose-950/50 border border-rose-500/40 text-rose-300 text-xs font-mono text-center">
                {isTr
                  ? "Bugünkü 10 reklamlık izleme limitinize ulaştınız. Yarın tekrar izleyebilirsiniz veya mağazadan kredi yükleyebilirsiniz."
                  : "Daily rewarded ad limit reached. Please come back tomorrow or top up credits."}
              </div>
            )}
          </div>
        )}

        {/* State 2: WATCHING (Interactive Stream / Video Simulator) */}
        {adState === "watching" && (
          <div className="relative flex flex-col min-h-[320px]">
            {/* Ad Progress Bar */}
            <div className="w-full h-1.5 bg-slate-800 relative overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-amber-500 to-yellow-400 transition-all duration-1000 ease-linear"
                style={{ width: `${progressPercent}%` }}
              />
            </div>

            {/* Simulated High-Def Video Creative Canvas */}
            <div
              className={`flex-1 p-6 sm:p-8 bg-gradient-to-br ${activeAd.bgGradient} flex flex-col justify-between relative overflow-hidden`}
            >
              {/* Overlay particles */}
              <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-2xl pointer-events-none" />
              <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-amber-500/10 rounded-full blur-2xl pointer-events-none" />

              {/* Top overlay pills */}
              <div className="flex items-center justify-between relative z-10">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-1 rounded-full bg-black/60 border border-white/20 text-[10px] font-mono font-bold text-amber-300 backdrop-blur-md flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                    <span>SPONSORLU YAYIN</span>
                  </span>
                  <span className="px-2 py-0.5 rounded-full bg-white/10 text-[10px] font-mono text-white/90">
                    {activeAd.tag}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setIsMuted(!isMuted)}
                    className="p-1.5 rounded-lg bg-black/40 text-white/80 hover:text-white border border-white/10 cursor-pointer"
                  >
                    {isMuted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
                  </button>
                  <div className="px-3 py-1 rounded-full bg-amber-500 text-slate-950 font-mono font-black text-xs shadow-lg">
                    {remainingSec}s
                  </div>
                </div>
              </div>

              {/* Center Creative Pitch */}
              <div className="relative z-10 py-6 text-left space-y-2">
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded bg-white/15 text-white text-[11px] font-mono font-semibold backdrop-blur-sm">
                  <Cpu className="w-3 h-3 text-amber-300" />
                  <span>Teknoloji & Gelecek Sponsoru</span>
                </div>
                <h3 className="text-xl sm:text-2xl font-black text-white font-mono tracking-tight drop-shadow-md">
                  {activeAd.title}
                </h3>
                <p className="text-xs text-white/90 font-sans leading-relaxed max-w-md drop-shadow">
                  {activeAd.description}
                </p>
              </div>

              {/* Bottom Notice */}
              <div className="relative z-10 flex items-center justify-between border-t border-white/15 pt-3 text-[11px] font-mono text-white/80">
                <span>{isTr ? "Kredi Yüklenmesi İçin Bekleyin:" : "Reward unlocking in:"}</span>
                <span className="font-bold text-amber-300">
                  {remainingSec === 0 ? "TAMAMLANDI" : `${remainingSec} Saniye`}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* State 3: COMPLETED */}
        {adState === "completed" && (
          <div className="p-6 text-center space-y-5 animate-in zoom-in-95 duration-200">
            <div className="mx-auto w-16 h-16 rounded-2xl bg-emerald-500/20 border-2 border-emerald-400 flex items-center justify-center text-emerald-400 shadow-xl shadow-emerald-500/20">
              <CheckCircle2 className="w-9 h-9" />
            </div>

            <div>
              <div className="inline-flex items-center gap-1 text-[11px] font-mono font-bold text-emerald-400 bg-emerald-950/80 px-2.5 py-0.5 rounded-full border border-emerald-500/40 mb-1.5">
                <Sparkles className="w-3 h-3" />
                <span>ÖDÜL HESABINIZA YATIRILDI</span>
              </div>
              <h4 className="text-lg sm:text-xl font-bold text-white font-mono">
                +{CREDITS_PER_REWARDED_AD} {isTr ? "Kredi Hesabınıza Eklendi!" : "Credits Added!"}
              </h4>
              <p className="text-xs text-slate-300 mt-1 max-w-xs mx-auto font-sans">
                {isTr
                  ? "Sponsor reklamını izlediğiniz için teşekkürler. Yeni bakiyenizle dilediğiniz yapay zeka analizini çalıştırabilirsiniz."
                  : "Thank you for watching. You can now run your simulations."}
              </p>
            </div>

            <div className="p-3 rounded-2xl bg-slate-900 border border-white/10 flex items-center justify-between text-xs font-mono">
              <span className="text-slate-400">{isTr ? "Güncel Bakiyeniz:" : "Current Balance:"}</span>
              <span className="font-bold text-amber-400 text-sm">
                {(currentUser?.credits ?? 0) + CREDITS_PER_REWARDED_AD} Kredi
              </span>
            </div>

            <div className="flex flex-col sm:flex-row gap-2 pt-2">
              {stats.remainingToday > 0 && (
                <button
                  onClick={handleStartWatching}
                  className="flex-1 py-2.5 px-4 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 text-amber-300 text-xs font-mono font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Play className="w-3.5 h-3.5" />
                  <span>{isTr ? "Tekrar İzle (+15 Kredi)" : "Watch Again"}</span>
                </button>
              )}
              <button
                onClick={onClose}
                className="flex-1 py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-mono font-bold transition-colors cursor-pointer"
              >
                {isTr ? "Analizlere Dön" : "Done"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
