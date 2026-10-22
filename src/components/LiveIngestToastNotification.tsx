import React from "react";
import { Sparkles, X, ArrowUpRight, Zap, Radio } from "lucide-react";

export interface LiveIngestToastData {
  id: string;
  title: string;
  year: number;
  category: string;
  summary: string;
  receivedAt: string;
}

interface Props {
  toast: LiveIngestToastData | null;
  onDismiss: () => void;
  onViewMilestone?: (year: number) => void;
}

export const LiveIngestToastNotification: React.FC<Props> = ({
  toast,
  onDismiss,
  onViewMilestone,
}) => {
  if (!toast) return null;

  return (
    <aside
      id="live-ingest-toast"
      aria-label="Canlı Veri Bildirimi"
      className="fixed bottom-5 left-4 right-4 sm:left-auto sm:right-6 sm:max-w-md z-50 animate-bounceIn"
    >
      <div className="relative p-4 sm:p-5 rounded-2xl bg-[#0B0F19]/95 border-2 border-cyan-500/80 shadow-2xl shadow-cyan-500/20 backdrop-blur-xl text-slate-100 overflow-hidden flex flex-col gap-3">
        {/* Glow Effects */}
        <div className="absolute -top-10 -left-10 w-24 h-24 bg-cyan-500/20 rounded-full blur-xl pointer-events-none" />
        <div className="absolute -bottom-10 -right-10 w-24 h-24 bg-blue-500/20 rounded-full blur-xl pointer-events-none" />

        {/* Header */}
        <div className="flex items-start justify-between gap-2 relative z-10">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-cyan-500/20 border border-cyan-400/50 text-cyan-300 shadow-md animate-pulse">
              <Radio className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                <span className="px-2 py-0.5 rounded-md bg-cyan-500/20 border border-cyan-500/40 text-cyan-300 text-[10px] font-mono font-black uppercase tracking-wider">
                  CANLI AKIŞ: YENİ VERİ ALINDI
                </span>
              </div>
              <h4 className="text-sm font-bold text-white font-mono mt-0.5 line-clamp-1">
                {toast.title}
              </h4>
            </div>
          </div>

          <button
            id="dismiss-live-toast-btn"
            onClick={onDismiss}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
            title="Kapat"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Snippet */}
        <div className="p-3 rounded-xl bg-slate-950/80 border border-cyan-500/20 text-xs font-mono relative z-10 space-y-1.5">
          <div className="flex items-center justify-between text-[11px] text-slate-400">
            <span className="text-cyan-400 font-bold">🎯 Hedef Yıl: {toast.year}</span>
            <span className="text-slate-400">{toast.category}</span>
          </div>
          <p className="text-slate-300 font-sans line-clamp-2 text-xs leading-relaxed">
            {toast.summary}
          </p>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between gap-2 pt-1 border-t border-slate-800/80 relative z-10">
          <span className="text-[10px] font-mono text-emerald-400 flex items-center gap-1">
            <Zap className="w-3 h-3 text-emerald-400" />
            Zaman Çizelgesine İşlendi
          </span>
          {onViewMilestone && (
            <button
              id="view-live-milestone-btn"
              onClick={() => {
                onViewMilestone(toast.year);
                onDismiss();
              }}
              className="px-3 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-mono font-bold flex items-center gap-1 transition-all cursor-pointer shadow-lg shadow-cyan-600/30"
            >
              <span>{toast.year} Yılını İncele</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>
    </aside>
  );
};
