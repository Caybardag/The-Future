import React, { useState, useEffect } from "react";
import { Award, Sparkles, X } from "lucide-react";

export const BadgeToastNotification: React.FC = () => {
  const [activeToast, setActiveToast] = useState<{ title: string; xp: number } | null>(null);

  useEffect(() => {
    const handleBadgeUnlocked = (e: any) => {
      if (e?.detail) {
        setActiveToast({ title: e.detail.title || "Yeni Rozet!", xp: e.detail.xp || 50 });
        setTimeout(() => setActiveToast(null), 4000);
      }
    };
    window.addEventListener("future_badge_unlocked", handleBadgeUnlocked);
    return () => window.removeEventListener("future_badge_unlocked", handleBadgeUnlocked);
  }, []);

  if (!activeToast) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 animate-bounce">
      <div className="bg-slate-900 border border-amber-500/50 rounded-2xl p-4 shadow-2xl flex items-center gap-3 text-xs">
        <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400">
          <Award className="w-5 h-5" />
        </div>
        <div>
          <span className="text-[10px] text-amber-400 font-bold uppercase block font-mono">Tebrikler! Rozet Açıldı</span>
          <p className="font-bold text-white">{activeToast.title}</p>
        </div>
        <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 font-mono font-bold text-[11px] ml-2">
          +{activeToast.xp} XP
        </span>
        <button
          type="button"
          onClick={() => setActiveToast(null)}
          className="text-slate-400 hover:text-white ml-1"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
