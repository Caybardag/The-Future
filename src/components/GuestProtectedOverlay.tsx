import React from "react";
import { Lock, LogIn, Sparkles, ShieldCheck, Zap, ArrowRight, Crown } from "lucide-react";
import { useAuth } from "../context/AuthContext";

interface GuestProtectedOverlayProps {
  children: React.ReactNode;
  title?: string;
  description?: string;
  badgeText?: string;
  blurLevel?: "sm" | "md" | "lg";
  previewHeight?: string; // e.g. "max-h-[480px]" or "none"
  isProtected?: boolean; // if false, bypasses protection regardless of auth status
  className?: string;
}

export const GuestProtectedOverlay: React.FC<GuestProtectedOverlayProps> = ({
  children,
  title = "🔒 Bu Özellik İçin Giriş Yapmanız Gerekmektedir",
  description = "Meslek otomasyonu, biyo-yaş haritası ve derin gelecek simülasyonlarına erişmek için ücretsiz vatandaş hesabınızla oturum açabilir veya yeni bir hesap oluşturabilirsiniz.",
  badgeText = "VATANDAŞ GÜVENLİ ERİŞİMİ",
  blurLevel = "md",
  previewHeight = "max-h-[380px]",
  isProtected = true,
  className = "",
}) => {
  const { currentUser, openUpsellModal, openAuthModal, openCreditStore } = useAuth();

  // If user is logged in or component is explicitly marked as not protected, render children normally
  if (currentUser || !isProtected) {
    return <>{children}</>;
  }

  const handleTriggerUpsell = () => {
    openUpsellModal(title, description);
  };

  const blurClass =
    blurLevel === "sm" ? "blur-sm" : blurLevel === "lg" ? "blur-lg" : "blur-md";

  return (
    <div className={`relative overflow-hidden rounded-2xl border border-purple-500/30 bg-slate-950/90 shadow-2xl min-h-[480px] flex flex-col justify-center ${className}`}>
      {/* Blurred & Disabled Content Preview */}
      <div
        className={`select-none pointer-events-none filter ${blurClass} opacity-25 transition-all duration-500 absolute inset-0 overflow-hidden`}
        aria-hidden="true"
      >
        {children}
      </div>

      {/* Semi-Transparent Glass Overlay */}
      <div
        className="relative z-30 w-full flex flex-col items-center justify-center p-3.5 sm:p-6 bg-slate-950/80 backdrop-blur-md text-center"
      >
        <div className="max-w-md w-full p-4 sm:p-6 rounded-2xl bg-slate-900/95 border border-purple-500/40 shadow-2xl relative overflow-hidden flex flex-col items-center">
          {/* Background Ambient Glow */}
          <div className="absolute -top-16 -left-16 w-32 h-32 bg-purple-500/20 rounded-full blur-2xl pointer-events-none" />
          <div className="absolute -bottom-16 -right-16 w-32 h-32 bg-cyan-500/20 rounded-full blur-2xl pointer-events-none" />

          {/* Icon Badge */}
          <div className="relative mb-3">
            <div className="p-2.5 sm:p-3 rounded-xl bg-gradient-to-tr from-purple-500/20 to-cyan-500/30 border border-purple-500/50 text-cyan-400 shadow-inner">
              <Lock className="w-6 h-6 sm:w-7 sm:h-7 animate-pulse" />
            </div>
            <span className="absolute -bottom-2 left-1/2 -translate-x-1/2 px-2.5 py-0.5 rounded-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white text-[9px] sm:text-[10px] font-mono font-bold tracking-wider uppercase whitespace-nowrap shadow">
              {badgeText}
            </span>
          </div>

          {/* Title & Description */}
          <h3 className="text-base sm:text-lg font-black text-white mb-1.5 font-mono tracking-tight pt-1">
            {title}
          </h3>
          <p className="text-[11px] sm:text-xs text-slate-300 font-sans leading-relaxed mb-3 max-w-sm">
            {description}
          </p>

          {/* Gift Badge */}
          <div className="w-full mb-3 p-2 rounded-xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center gap-1.5 text-purple-200 text-[11px] font-mono">
            <Sparkles className="w-3.5 h-3.5 text-amber-400 shrink-0" />
            <span>
              <strong>GÜNLÜK GELECEK ÇARKI & REKLAMLAR</strong> ile Ücretsiz Kredi Kazanın
            </span>
          </div>

          {/* Feature Highlights */}
          <div className="grid grid-cols-2 gap-1.5 w-full mb-4 text-left text-[10px] sm:text-[11px] font-mono text-slate-300">
            <div className="flex items-center gap-1.5 p-1.5 rounded-lg bg-slate-800/60 border border-white/5 truncate">
              <Zap className="w-3 h-3 text-cyan-400 shrink-0" />
              <span className="truncate">Yapay Zeka Analiz Motoru</span>
            </div>
            <div className="flex items-center gap-1.5 p-1.5 rounded-lg bg-slate-800/60 border border-white/5 truncate">
              <ShieldCheck className="w-3 h-3 text-emerald-400 shrink-0" />
              <span className="truncate">Kişisel Meslek Kalkanı</span>
            </div>
          </div>

          {/* Primary Action Buttons */}
          <div className="w-full space-y-2">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                openAuthModal();
              }}
              className="w-full py-2.5 sm:py-3 px-4 rounded-xl bg-gradient-to-r from-cyan-400 via-blue-500 to-indigo-600 hover:from-cyan-300 hover:via-blue-400 hover:to-indigo-500 text-slate-950 font-mono font-black text-xs uppercase tracking-wider transition-all duration-200 transform active:scale-[0.98] shadow-lg shadow-cyan-500/25 flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <LogIn className="w-4 h-4 text-slate-950" />
              <span>Giriş Yap / Ücretsiz Kaydol</span>
            </button>

            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                handleTriggerUpsell();
              }}
              className="w-full py-2 px-3 rounded-xl bg-slate-800/70 hover:bg-slate-800 border border-slate-700/80 text-slate-300 hover:text-white font-mono font-medium text-[10px] sm:text-[11px] transition-all flex items-center justify-center gap-1 cursor-pointer"
            >
              <Sparkles className="w-3 h-3 text-purple-400" />
              <span>Vatandaş & Aile Paketleri Detayları</span>
              <ArrowRight className="w-3 h-3 opacity-60 ml-0.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
