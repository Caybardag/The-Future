import React from "react";
import { WheelSegment } from "./DailyFutureSpinWheel";
import { FutureCollectionItem } from "../utils/spinStorage";
import {
  Award,
  Sparkles,
  CheckCircle2,
  Coins,
  Star,
  Brain,
  Atom,
  Cpu,
  Zap,
  Globe,
  Rocket,
  ShieldCheck,
  ChevronRight,
  Layers,
  Compass,
  ArrowRight,
  X
} from "lucide-react";

interface RewardCardModalProps {
  segment: WheelSegment;
  collectionItem?: FutureCollectionItem | null;
  onClose: () => void;
  onOpenProfileCollection?: () => void;
}

const CATEGORY_ICONS: Record<string, React.FC<{ className?: string }>> = {
  Brain,
  Atom,
  Cpu,
  Zap,
  Globe,
  Rocket,
  Coins,
  Sparkles,
  Award
};

export const RewardCardModal: React.FC<RewardCardModalProps> = ({
  segment,
  collectionItem,
  onClose,
  onOpenProfileCollection
}) => {
  const IconComponent = collectionItem
    ? CATEGORY_ICONS[collectionItem.iconName] || Award
    : Coins;

  const rarityColorClass =
    collectionItem?.rarity === "Efsanevi"
      ? "from-amber-500 via-yellow-400 to-amber-600 text-amber-300 border-amber-500/80 shadow-amber-500/30"
      : collectionItem?.rarity === "Epik"
      ? "from-purple-600 via-pink-500 to-indigo-600 text-purple-300 border-purple-500/80 shadow-purple-500/30"
      : collectionItem?.rarity === "Nadir"
      ? "from-cyan-500 via-blue-500 to-teal-500 text-cyan-300 border-cyan-500/80 shadow-cyan-500/30"
      : "from-emerald-500 to-teal-600 text-emerald-300 border-emerald-500/80 shadow-emerald-500/30";

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-[130] flex items-center justify-center p-2 sm:p-4 bg-slate-950/85 backdrop-blur-md animate-in zoom-in-95 duration-200"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-slate-900 border-2 border-amber-500/80 rounded-2xl sm:rounded-3xl max-w-lg w-full p-4 sm:p-6 lg:p-8 shadow-2xl text-slate-100 font-sans space-y-4 sm:space-y-6 text-center relative overflow-hidden max-h-[94dvh] overflow-y-auto"
      >
        <button
          onClick={onClose}
          className="absolute top-3 right-3 sm:top-4 sm:right-4 p-1.5 sm:p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-all cursor-pointer border border-white/10 z-20"
          aria-label="Kapat"
        >
          <X className="w-4 h-4 text-rose-400 sm:text-slate-400" />
        </button>
        
        {/* Glow Effects */}
        <div className="absolute top-0 right-0 w-48 h-48 bg-amber-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-cyan-500/20 rounded-full blur-3xl pointer-events-none" />

        {/* Celebration Header Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gradient-to-r from-amber-500/20 via-yellow-400/20 to-amber-500/20 border border-amber-500/60 text-amber-300 font-mono text-xs font-black uppercase tracking-wider animate-pulse">
          <Sparkles className="w-4 h-4 text-amber-400" />
          <span>🎉 TEBRİKLER! ÖDÜLÜNÜZ HESABINIZA YÜKLENDİ</span>
        </div>

        {/* Reward Card Main Container */}
        <div className="p-5 rounded-2xl bg-gradient-to-b from-slate-950/90 to-slate-900 border border-amber-500/40 shadow-xl space-y-4 text-left relative overflow-hidden">
          
          {/* Top Card Bar */}
          <div className="flex items-center justify-between gap-3 border-b border-white/10 pb-3">
            <div className="flex items-center gap-3">
              <div
                className={`p-3 rounded-2xl bg-gradient-to-tr ${rarityColorClass} border shadow-lg text-slate-950 flex items-center justify-center shrink-0 animate-bounce`}
              >
                <IconComponent className="w-7 h-7 text-slate-950" />
              </div>
              <div>
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-amber-400 block">
                  {collectionItem?.rarity || "Sıradan"} {collectionItem?.category || "Gelecek Bonusu"}
                </span>
                <h3 className="text-lg font-black text-white font-mono leading-tight">
                  {collectionItem ? collectionItem.title : segment.label}
                </h3>
              </div>
            </div>

            <div className="text-right shrink-0 font-mono">
              <span className="text-xs text-slate-400 block">YIL</span>
              <span className="text-sm font-black text-cyan-400">
                {collectionItem?.techTimelineYear || "2030+"}
              </span>
            </div>
          </div>

          {/* Tangible Reward Items List */}
          <div className="grid grid-cols-2 gap-2 font-mono text-xs">
            <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 font-bold flex items-center gap-2">
              <Coins className="w-4 h-4 text-amber-400 shrink-0" />
              <span>+{segment.creditAmount} AI Kredisi</span>
            </div>

            <div className="p-2.5 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 font-bold flex items-center gap-2">
              <Star className="w-4 h-4 text-cyan-400 shrink-0" />
              <span>+{segment.xpAmount} Rozet XP</span>
            </div>
          </div>

          {/* Description & Story Lore Matrix */}
          <div className="p-3.5 rounded-xl bg-slate-950 border border-white/10 space-y-2 font-sans text-xs">
            <p className="text-slate-200 leading-relaxed font-medium">
              {collectionItem
                ? collectionItem.description
                : "Günlük simülasyon krediniz doğrudan hesabınıza eklendi. Yeni AI öngörüleri çalıştırmak için kullanabilirsiniz."}
            </p>

            {collectionItem?.storyLore && (
              <div className="pt-2 border-t border-white/10 text-[11px] text-amber-200/90 font-mono space-y-1">
                <span className="text-amber-400 font-bold flex items-center gap-1">
                  <Compass className="w-3.5 h-3.5" /> Gelecek Vizyonu & Hikaye:
                </span>
                <p className="font-sans italic text-slate-300 leading-snug">
                  "{collectionItem.storyLore}"
                </p>
              </div>
            )}
          </div>

          {/* Saved Status Indicator */}
          <div className="flex items-center justify-between text-[11px] font-mono text-emerald-400 bg-emerald-950/60 border border-emerald-500/30 px-3 py-2 rounded-xl">
            <span className="flex items-center gap-1.5 font-bold">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>Dijital Koleksiyonunuza Eklendi</span>
            </span>
            <span className="text-slate-400 text-[10px]">Otomatik Kayıt</span>
          </div>

        </div>

        {/* Footer Actions */}
        <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
          {onOpenProfileCollection && (
            <button
              onClick={() => {
                onClose();
                onOpenProfileCollection();
              }}
              className="w-full sm:w-1/2 py-3 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-cyan-300 font-mono font-bold text-xs uppercase cursor-pointer flex items-center justify-center gap-1.5 transition-all border border-cyan-500/30"
            >
              <Layers className="w-4 h-4 text-cyan-400" />
              <span>Koleksiyonumu Gör</span>
            </button>
          )}

          <button
            onClick={onClose}
            className="w-full sm:w-1/2 py-3 px-4 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-amber-400 hover:to-yellow-300 text-slate-950 font-mono font-black text-xs uppercase cursor-pointer flex items-center justify-center gap-1.5 shadow-lg shadow-amber-500/20 transition-transform hover:scale-102"
          >
            <span>Harika, Anladım!</span>
            <ArrowRight className="w-4 h-4 text-slate-950" />
          </button>
        </div>

      </div>
    </div>
  );
};
