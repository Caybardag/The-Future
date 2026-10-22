import React from "react";
import { ViewMode, Milestone } from "../types";
import { useLanguage } from "../context/LanguageContext";
import { useAuth } from "../context/AuthContext";
import { getSmartRecommendations, RecommendationCardData } from "../utils/recommendationEngine";
import {
  Sparkles,
  ArrowRight,
  Zap,
  ShieldAlert,
  Bot,
  Compass,
  Cpu,
  Globe,
  Lock,
  Gift,
  Coins
} from "lucide-react";

interface CrossFeatureRecommendationProps {
  sourceView: ViewMode;
  currentMilestone?: Milestone | null;
  profession?: string;
  riskScore?: number;
  onNavigate: (view: ViewMode, targetYear?: number) => void;
  onOpenCreditStore?: () => void;
  onOpenAuthModal?: () => void;
  className?: string;
  compact?: boolean;
}

export const CrossFeatureRecommendation: React.FC<CrossFeatureRecommendationProps> = ({
  sourceView,
  currentMilestone,
  profession,
  riskScore,
  onNavigate,
  onOpenCreditStore,
  onOpenAuthModal,
  className = "",
  compact = false,
}) => {
  const { language } = useLanguage();
  const { currentUser, credits, openCreditStore, openAuthModal } = useAuth();

  const recommendations = getSmartRecommendations({
    sourceView,
    currentMilestone,
    profession,
    riskScore,
    userCredits: credits,
    language,
  });

  if (!recommendations || recommendations.length === 0) return null;

  const handleAction = (item: RecommendationCardData) => {
    if (!currentUser && item.creditCost > 0) {
      if (onOpenAuthModal) onOpenAuthModal();
      else if (openAuthModal) openAuthModal();
      return;
    }

    if (currentUser && item.creditCost > 0 && credits < item.creditCost) {
      if (onOpenCreditStore) onOpenCreditStore();
      else if (openCreditStore) openCreditStore();
      return;
    }

    onNavigate(item.targetView, item.targetYear);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const getBadgeClasses = (color: string) => {
    switch (color) {
      case "rose":
        return "bg-rose-500/20 text-rose-300 border-rose-500/40";
      case "purple":
        return "bg-purple-500/20 text-purple-300 border-purple-500/40";
      case "cyan":
        return "bg-cyan-500/20 text-cyan-300 border-cyan-500/40";
      case "emerald":
        return "bg-emerald-500/20 text-emerald-300 border-emerald-500/40";
      case "amber":
        return "bg-amber-500/20 text-amber-300 border-amber-500/40";
      default:
        return "bg-blue-500/20 text-blue-300 border-blue-500/40";
    }
  };

  const getCardBorder = (color: string) => {
    switch (color) {
      case "rose":
        return "hover:border-rose-500/50 hover:shadow-rose-500/10";
      case "purple":
        return "hover:border-purple-500/50 hover:shadow-purple-500/10";
      case "cyan":
        return "hover:border-cyan-500/50 hover:shadow-cyan-500/10";
      case "emerald":
        return "hover:border-emerald-500/50 hover:shadow-emerald-500/10";
      case "amber":
        return "hover:border-amber-500/50 hover:shadow-amber-500/10";
      default:
        return "hover:border-blue-500/50 hover:shadow-blue-500/10";
    }
  };

  return (
    <div className={`mt-6 space-y-3 ${className}`}>
      {/* Header Banner */}
      <div className="flex flex-wrap items-center justify-between gap-2 px-1">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-gradient-to-br from-purple-500/30 via-cyan-500/30 to-blue-500/30 border border-purple-500/40 text-cyan-300">
            <Sparkles className="w-4 h-4 animate-pulse" />
          </div>
          <div>
            <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-200 flex items-center gap-2">
              <span>{language === "tr" ? "Yapay Zeka Mantıksal Sıradaki Adım" : "AI Next Recommended Step"}</span>
              <span className="text-[10px] px-2 py-0.2 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 font-mono">
                {language === "tr" ? "ÇAPRAZ ANALİZ" : "CROSS-ANALYSIS"}
              </span>
            </h4>
          </div>
        </div>

        {/* User Credit Pill */}
        <div className="flex items-center gap-1.5 text-[11px] font-mono text-slate-400 bg-slate-900/80 px-2.5 py-1 rounded-xl border border-white/5">
          <Coins className="w-3.5 h-3.5 text-amber-400" />
          <span>{language === "tr" ? "Bakiye:" : "Credits:"}</span>
          <span className="text-amber-300 font-bold">{currentUser ? credits : "0"}</span>
        </div>
      </div>

      {/* Recommendations Grid */}
      <div className={`grid gap-3.5 ${compact ? "grid-cols-1" : "grid-cols-1 md:grid-cols-2"}`}>
        {recommendations.map((item, idx) => {
          const isAffordable = !item.creditCost || (currentUser && credits >= item.creditCost);

          return (
            <div
              key={`rec-item-${item.id || 'card'}-${idx}`}
              className={`group relative bg-gradient-to-b from-slate-900/90 to-slate-950/90 border border-white/10 rounded-2xl p-4 sm:p-5 transition-all duration-300 shadow-xl flex flex-col justify-between space-y-4 ${getCardBorder(
                item.badgeColor
              )}`}
            >
              {/* Card Top: Badges */}
              <div className="space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <span
                    className={`text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded-md border tracking-wider ${getBadgeClasses(
                      item.badgeColor
                    )}`}
                  >
                    {item.badge}
                  </span>

                  {item.highlightTag && (
                    <span className="text-[10px] font-mono font-bold text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded-full">
                      {item.highlightTag}
                    </span>
                  )}
                </div>

                <h5 className="text-sm font-bold text-white group-hover:text-cyan-300 transition-colors leading-snug font-mono">
                  {item.title}
                </h5>

                <p className="text-xs text-slate-300 leading-relaxed font-sans line-clamp-2">
                  {item.description}
                </p>
              </div>

              {/* Card Bottom: Action CTA */}
              <div className="pt-2 border-t border-white/5 flex items-center justify-between gap-2">
                {/* Cost Indicator */}
                <div className="flex items-center gap-1.5 font-mono text-xs">
                  {item.creditCost > 0 ? (
                    <span className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-500/10 text-amber-300 border border-amber-500/20 font-bold text-[11px]">
                      <Zap className="w-3 h-3 text-amber-400 fill-amber-400" />
                      <span>{item.creditCost} {language === "tr" ? "Kredi" : "Credits"}</span>
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 font-bold text-[11px]">
                      <Gift className="w-3 h-3 text-emerald-400" />
                      <span>{language === "tr" ? "Ücretsiz" : "Free"}</span>
                    </span>
                  )}
                </div>

                {/* Primary CTA Button */}
                <button
                  onClick={() => handleAction(item)}
                  className={`px-3.5 py-2 rounded-xl text-xs font-mono font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-md ${
                    !currentUser && item.creditCost > 0
                      ? "bg-slate-800 hover:bg-slate-700 text-amber-300 border border-amber-500/30"
                      : isAffordable
                      ? "bg-cyan-500 hover:bg-cyan-400 text-slate-950 shadow-cyan-500/20 hover:shadow-cyan-500/40"
                      : "bg-amber-600 hover:bg-amber-500 text-slate-950 shadow-amber-500/20"
                  }`}
                >
                  {!currentUser && item.creditCost > 0 ? (
                    <>
                      <Lock className="w-3.5 h-3.5" />
                      <span>{language === "tr" ? "Giriş Yap & Başlat" : "Sign In & Start"}</span>
                    </>
                  ) : !isAffordable ? (
                    <>
                      <Coins className="w-3.5 h-3.5" />
                      <span>{language === "tr" ? "Kredi Al & Başlat" : "Get Credits"}</span>
                    </>
                  ) : (
                    <>
                      <span>{item.actionText}</span>
                      <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                    </>
                  )}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
