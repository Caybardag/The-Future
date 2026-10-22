import React, { useState, useEffect } from "react";
import { Cookie, ShieldCheck, X, Sparkles, ExternalLink } from "lucide-react";
import { useLanguage } from "../context/LanguageContext";

interface CookieBannerProps {
  onOpenPrivacy: () => void;
}

export const CookieBanner: React.FC<CookieBannerProps> = ({ onOpenPrivacy }) => {
  const { language } = useLanguage();
  const isTr = language === "tr";

  const [isVisible, setIsVisible] = useState<boolean>(false);

  useEffect(() => {
    try {
      const consent = localStorage.getItem("cookie_consent_choice");
      if (!consent) {
        // Delay slightly for smooth entering experience
        const timer = setTimeout(() => setIsVisible(true), 1200);
        return () => clearTimeout(timer);
      }
    } catch {
      // ignore
    }
  }, []);

  const handleAcceptAll = () => {
    try {
      localStorage.setItem("cookie_consent_choice", "accepted");
    } catch {}
    setIsVisible(false);
  };

  const handleCustomise = () => {
    onOpenPrivacy();
    try {
      localStorage.setItem("cookie_consent_choice", "customized");
    } catch {}
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-2 inset-x-2 sm:bottom-5 sm:left-6 sm:right-auto sm:max-w-xl z-[99] animate-in slide-in-from-bottom-5 duration-300">
      <div className="p-3.5 sm:p-4.5 rounded-2xl sm:rounded-3xl bg-[#0c1124]/95 border border-cyan-500/40 backdrop-blur-xl shadow-[0_15px_40px_rgba(0,0,0,0.8)] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs font-sans text-slate-200">
        <div className="flex items-start gap-3 w-full sm:w-auto">
          <div className="w-9 h-9 rounded-2xl bg-cyan-500/20 border border-cyan-400/40 flex items-center justify-center text-cyan-300 shrink-0 mt-0.5">
            <Cookie className="w-4.5 h-4.5" />
          </div>

          <div className="space-y-1 min-w-0 flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-bold text-white text-xs">
                {isTr ? "Gizlilik & Çerez Bildirimi" : "Privacy & Cookie Notice"}
              </span>
              <span className="px-1.5 py-0.5 rounded bg-cyan-500/20 text-[10px] text-cyan-300 font-mono">
                Google Standard
              </span>
            </div>
            <p className="text-[11px] text-slate-300 leading-relaxed break-words">
              {isTr
                ? "Platformumuz; güvenli oturum yönetimi, dil tercihleri ve AI sorgularını optimize etmek amacıyla çerezler ve yerel bellek kullanır. Verileriniz asla satılmaz."
                : "We utilize cookies and local storage to secure sessions, remember language preferences, and optimize AI projections. Your data is never sold."}
            </p>
          </div>

          <button
            type="button"
            onClick={() => setIsVisible(false)}
            className="sm:hidden p-2 -mr-1 -mt-1 rounded-xl text-slate-400 hover:text-white min-w-[44px] min-h-[44px] flex items-center justify-center transition-colors cursor-pointer shrink-0"
            aria-label="Kapat"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto shrink-0 justify-end pt-2 sm:pt-0 border-t border-white/5 sm:border-t-0">
          <button
            type="button"
            onClick={handleCustomise}
            className="flex-1 sm:flex-none px-3.5 py-2.5 min-h-[44px] rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white font-semibold text-xs flex items-center justify-center transition-colors cursor-pointer whitespace-nowrap active:scale-95"
          >
            {isTr ? "İncele / Yönet" : "Review / Manage"}
          </button>

          <button
            type="button"
            onClick={handleAcceptAll}
            className="flex-1 sm:flex-none px-4 py-2.5 min-h-[44px] rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold text-xs shadow-md shadow-cyan-950 flex items-center justify-center transition-all cursor-pointer whitespace-nowrap active:scale-95"
          >
            {isTr ? "Kabul Et" : "Accept All"}
          </button>

          <button
            type="button"
            onClick={() => setIsVisible(false)}
            className="hidden sm:flex p-2 rounded-xl text-slate-400 hover:text-white min-w-[44px] min-h-[44px] items-center justify-center transition-colors cursor-pointer"
            aria-label="Kapat"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
