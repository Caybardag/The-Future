import React, { useState } from "react";
import { Info, X } from "lucide-react";

export const ForesightDisclaimerBanner: React.FC = () => {
  const [isDismissed, setIsDismissed] = useState<boolean>(() => {
    try {
      return sessionStorage.getItem("foresight_disclaimer_dismissed") === "true";
    } catch {
      return false;
    }
  });

  if (isDismissed) return null;

  const handleDismiss = () => {
    setIsDismissed(true);
    try {
      sessionStorage.setItem("foresight_disclaimer_dismissed", "true");
    } catch {}
  };

  return (
    <div className="w-full bg-blue-950/40 border-b border-blue-500/20 px-4 py-2 text-xs text-slate-300 font-sans flex items-center justify-between gap-3 backdrop-blur-sm">
      <div className="flex items-center gap-2 max-w-5xl mx-auto">
        <Info className="w-4 h-4 text-blue-400 shrink-0" />
        <p className="text-[11px] leading-tight">
          <span className="font-bold text-blue-300">Epistemik Hatırlatma:</span> Gelecek Takvimi'ndeki veriler kesin gerçekleşme garantisi değil; bilimsel literatür, patentler ve teknolojik eğilimlerin olasılıksal modelleme projeksiyonlarıdır.
        </p>
      </div>
      <button
        type="button"
        onClick={handleDismiss}
        className="text-slate-400 hover:text-white p-1 rounded transition-colors"
      >
        <X className="w-3.5 h-3.5" />
      </button>
    </div>
  );
};
