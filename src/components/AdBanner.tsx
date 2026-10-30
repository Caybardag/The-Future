import React from "react";
import { Sparkles, ExternalLink } from "lucide-react";

interface AdBannerProps {
  slot: string;
  format?: "horizontal" | "vertical" | "square";
}

export const AdBanner: React.FC<AdBannerProps> = ({ slot, format = "horizontal" }) => {
  return (
    <div className="w-full rounded-2xl bg-gradient-to-r from-purple-950/40 via-blue-950/30 to-purple-950/40 border border-purple-500/20 p-4 text-xs font-sans text-slate-300 flex items-center justify-between gap-4">
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-xl bg-purple-500/20 text-purple-400 border border-purple-500/30">
          <Sparkles className="w-4 h-4" />
        </div>
        <div>
          <span className="text-[10px] uppercase font-bold tracking-wider text-purple-400 font-mono">Sponsorlu Alan</span>
          <p className="font-semibold text-white text-xs">Gelecek Teknolojileri Araştırma Bursu & Destek Fonu</p>
        </div>
      </div>
      <a
        href="#explore"
        className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white border border-white/10 text-[11px] font-bold flex items-center gap-1.5 transition-all"
      >
        <span>İncele</span>
        <ExternalLink className="w-3 h-3 text-slate-400" />
      </a>
    </div>
  );
};
