import React, { useState, useEffect } from "react";
import { X, Play, CheckCircle2, Sparkles, Award } from "lucide-react";
import { safeFetchJson, getApiHeaders, notifyClientCreditsUpdated } from "../utils/apiClient";
import { useAuth } from "../context/AuthContext";

interface RewardedAdModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRewardClaimed?: (earnedCredits: number) => void;
}

export const RewardedAdModal: React.FC<RewardedAdModalProps> = ({ isOpen, onClose, onRewardClaimed }) => {
  const { addCredits, currentUser } = useAuth();
  const [secondsRemaining, setSecondsRemaining] = useState<number>(5);
  const [isCompleted, setIsCompleted] = useState<boolean>(false);
  const [isClaiming, setIsClaiming] = useState<boolean>(false);

  useEffect(() => {
    if (!isOpen) {
      setSecondsRemaining(5);
      setIsCompleted(false);
      return;
    }
    const timer = setInterval(() => {
      setSecondsRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          setIsCompleted(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [isOpen]);

  if (!isOpen) return null;

  const handleClaimReward = async () => {
    setIsClaiming(true);
    const earned = 15;
    try {
      await safeFetchJson("/api/credits/ad-reward", {
        method: "POST",
        headers: getApiHeaders(),
        body: JSON.stringify({ userEmail: currentUser?.email }),
      });
    } catch (e) {}

    addCredits(earned);
    notifyClientCreditsUpdated(earned);
    onRewardClaimed?.(earned);
    setIsClaiming(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md">
      <div className="relative w-full max-w-md bg-slate-900 border border-amber-500/30 rounded-3xl p-6 text-center space-y-4 shadow-2xl">
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="inline-flex p-3 rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/40">
          <Award className="w-8 h-8" />
        </div>

        <h3 className="text-xl font-bold text-white">Ödüllü Video Sponsorluğu</h3>
        <p className="text-xs text-slate-300">
          Sponsor içerik gösterimi tamamlandığında hesabınıza anında <span className="font-bold text-amber-400">+15 Kredi</span> tanımlanacaktır.
        </p>

        <div className="py-6 rounded-2xl bg-slate-950 border border-white/10 flex flex-col items-center justify-center space-y-2">
          {!isCompleted ? (
            <>
              <div className="text-3xl font-black text-amber-400 font-mono">{secondsRemaining}s</div>
              <p className="text-[11px] text-slate-400">Sponsor tanıtımı izleniyor...</p>
            </>
          ) : (
            <>
              <CheckCircle2 className="w-10 h-10 text-emerald-400 animate-bounce" />
              <p className="text-xs font-bold text-emerald-400">Gösterim Tamamlandı!</p>
            </>
          )}
        </div>

        <button
          type="button"
          disabled={!isCompleted || isClaiming}
          onClick={handleClaimReward}
          className={`w-full py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all ${
            isCompleted
              ? "bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 cursor-pointer shadow-lg shadow-amber-500/20"
              : "bg-slate-800 text-slate-500 cursor-not-allowed"
          }`}
        >
          <Sparkles className="w-4 h-4" />
          <span>{isClaiming ? "Kredi Yükleniyor..." : "+15 Krediyi Al"}</span>
        </button>
      </div>
    </div>
  );
};
