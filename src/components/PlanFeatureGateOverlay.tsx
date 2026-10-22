import React from "react";
import {
  Lock,
  Sparkles,
  ArrowRight,
  Shield,
  Crown,
  CheckCircle2,
  Clock,
  Briefcase,
  Users,
  Compass,
} from "lucide-react";
import { ViewMode } from "../types";
import { VIEW_PLAN_RULES, UserPlan, getPlanDisplayName, hasPlanAccess } from "../utils/planAccess";
import { useLanguage } from "../context/LanguageContext";
import { useAuth } from "../context/AuthContext";

interface PlanFeatureGateOverlayProps {
  targetView: ViewMode;
  onNavigateBack?: () => void;
  onOpenStoreModal?: () => void;
  children?: React.ReactNode;
}

export const PlanFeatureGateOverlay: React.FC<PlanFeatureGateOverlayProps> = ({
  targetView,
  onNavigateBack,
  onOpenStoreModal,
  children,
}) => {
  const { language } = useLanguage();
  const isTr = language === "tr";
  const { currentUser, plan, openCreditStore, openAuthModal } = useAuth();

  // In the pure credit economy, all feature views are accessible directly
  if (children) {
    return <>{children}</>;
  }

  const handleStoreClick = () => {
    if (!currentUser) {
      openAuthModal();
      return;
    }
    if (onOpenStoreModal) {
      onOpenStoreModal();
    } else {
      openCreditStore();
    }
  };

  return (
    <div className="relative w-full max-w-4xl mx-auto my-8 px-4 font-sans animate-fadeIn">
      <div className="relative rounded-3xl bg-gradient-to-b from-[#170e30]/95 via-[#100b24]/95 to-[#090615] border border-purple-500/30 p-6 sm:p-10 shadow-2xl backdrop-blur-xl text-center space-y-6">
        <div className="relative inline-flex items-center justify-center p-4 rounded-3xl bg-purple-950/70 border border-purple-500/50 shadow-xl shadow-purple-950/60">
          <Sparkles className="w-10 h-10 text-amber-400" />
        </div>

        <div className="space-y-2 max-w-2xl mx-auto">
          <h3 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            {isTr ? "Saf Kredi Modeli ile Tüm Modüller Açık" : "All Modules Unlocked with Pure Credit Model"}
          </h3>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            {isTr
              ? "Abonelik ve paket kilitleri kaldırılmıştır. Tüm özelliklere erişebilir, yapay zeka analizlerini şeffaf kredi harcayarak çalıştırabilirsiniz."
              : "Subscription walls have been removed. Explore all features and run AI simulations using transparent credits."}
          </p>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-3 pt-4">
          <button
            type="button"
            onClick={handleStoreClick}
            className="px-6 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-xs sm:text-sm flex items-center gap-2 shadow-lg shadow-amber-500/20 transition-all cursor-pointer"
          >
            <Sparkles className="w-4 h-4" />
            <span>{isTr ? "Kredi Yükle / Reklam İzle" : "Get Credits / Watch Ads"}</span>
          </button>

          {onNavigateBack && (
            <button
              type="button"
              onClick={onNavigateBack}
              className="px-5 py-3 rounded-xl bg-slate-900 hover:bg-slate-800 border border-white/10 text-slate-300 hover:text-white font-bold text-xs sm:text-sm flex items-center gap-2 transition-all cursor-pointer"
            >
              <Clock className="w-4 h-4 text-slate-400" />
              <span>{isTr ? "Zaman Çizelgesine Dön" : "Back to Timeline"}</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
