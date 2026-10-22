import React from "react";
import { AlertCircle, Info, Sparkles } from "lucide-react";
import { useLanguage } from "../context/LanguageContext";

interface ForesightDisclaimerBannerProps {
  className?: string;
  compact?: boolean;
}

export const ForesightDisclaimerBanner: React.FC<ForesightDisclaimerBannerProps> = ({
  className = "",
  compact = false,
}) => {
  const { language } = useLanguage();
  const isTr = language === "tr";

  if (compact) {
    return (
      <div
        className={`flex items-center gap-2 px-3 py-1.5 rounded-xl bg-amber-500/10 border border-amber-500/25 text-[11px] font-sans text-amber-200/90 ${className}`}
        role="note"
      >
        <Info className="w-3.5 h-3.5 text-amber-400 shrink-0" />
        <span>
          {isTr
            ? "Olasılıksal Fütüroloji Simülasyonu: Kesin taahhüt veya resmi kurum onayı içermez."
            : "Probabilistic Futurology Simulation: Not an official endorsement or guarantee."}
        </span>
      </div>
    );
  }

  return (
    <div
      className={`p-3 sm:p-4 rounded-2xl bg-gradient-to-r from-slate-900/90 via-[#0e0a22]/90 to-slate-900/90 border border-cyan-500/25 shadow-lg backdrop-blur-md text-xs font-sans text-slate-300 relative overflow-hidden ${className}`}
      role="note"
    >
      <div className="flex items-start gap-3">
        <div className="w-8 h-8 rounded-xl bg-cyan-500/15 border border-cyan-500/30 flex items-center justify-center text-cyan-300 shrink-0 mt-0.5">
          <Info className="w-4 h-4 text-cyan-400" />
        </div>
        <div className="space-y-1 min-w-0 flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-bold text-white text-xs font-mono uppercase tracking-wide">
              {isTr ? "Olasılıksal Fütüroloji Bilgilendirmesi" : "Probabilistic Futurology Notice"}
            </span>
            <span className="px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 font-mono text-[10px] font-bold border border-cyan-500/30">
              {isTr ? "Resmi Onay / Garanti İçermez" : "No Official Endorsement"}
            </span>
          </div>
          <p className="text-[11px] sm:text-xs text-slate-300 leading-relaxed font-sans">
            {isTr
              ? "Bu platformda sunulan tüm tarihler, gelişim aşamaları ve teknolojik senaryolar araştırma ve modelleme amaçlı olasılıksal simülasyonlardır. Gerçek dünyadaki gelişmeler bu tahminlerden farklılaşabilir; kesin gerçekleşme garantisi veya resmi kurum onayı teşkil etmez."
              : "All timeline dates, development stages, and technological breakthroughs presented here are probabilistic futurology simulations for research and planning. Real-world developments may vary; they do not constitute definitive guarantees or official agency endorsements."}
          </p>
        </div>
      </div>
    </div>
  );
};
