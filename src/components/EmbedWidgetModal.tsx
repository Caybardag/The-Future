import React, { useState } from "react";
import { Milestone } from "../types";
import { X, Copy, Check, Code, ExternalLink, Sparkles } from "lucide-react";

interface EmbedWidgetModalProps {
  milestone: Milestone | null;
  onClose: () => void;
}

export const EmbedWidgetModal: React.FC<EmbedWidgetModalProps> = ({
  milestone,
  onClose,
}) => {
  const [copied, setCopied] = useState(false);
  const [widgetYear, setWidgetYear] = useState<number>(milestone ? milestone.year : 2030);

  if (!milestone) return null;

  const appUrl = window.location.origin;
  const embedCode = `<iframe src="${appUrl}/?embed=true&year=${widgetYear}" width="100%" height="480" frameborder="0" style="border-radius: 16px; overflow: hidden; border: 1px solid rgba(255,255,255,0.1);"></iframe>`;

  const handleCopy = () => {
    navigator.clipboard.writeText(embedCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div
      className="fixed inset-0 z-[130] bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-2 sm:p-4"
      onClick={onClose}
    >
      <div
        className="bg-[#0B0F19] border border-cyan-500/40 rounded-2xl sm:rounded-3xl max-w-xl w-full p-4 sm:p-6 space-y-4 sm:space-y-5 shadow-2xl relative max-h-[94dvh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-3.5 right-3.5 sm:top-4 sm:right-4 p-1.5 sm:p-2 rounded-xl bg-slate-900 border border-white/10 hover:border-white/20 text-slate-300 hover:text-white flex items-center gap-1 font-mono text-xs cursor-pointer"
          aria-label="Kapat"
        >
          <X className="w-4 h-4 text-rose-400 sm:text-slate-400" />
          <span className="text-[11px] sm:text-xs hidden xs:inline">Kapat</span>
        </button>

        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 font-mono text-[11px] font-bold uppercase">
            <Code className="w-3.5 h-3.5" />
            <span>Gömülebilir Web Widget / iFrame Code</span>
          </div>
          <h3 className="text-xl font-bold text-white uppercase tracking-tight">
            Milestone Widget'ını Sitenize Ekleyin
          </h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            Bu milestone kartını blogunuza, haber sitenize veya web uygulamanıza tek satır iframe koduyla gömün.
          </p>
        </div>

        {/* Live Widget Preview Card */}
        <div className="bg-slate-900/90 border border-white/10 rounded-xl p-4 space-y-3 font-mono">
          <div className="flex items-center justify-between border-b border-white/10 pb-2">
            <span className="text-cyan-400 font-bold text-sm">{milestone.year} — {milestone.title}</span>
            <span className="text-[10px] text-slate-400 px-2 py-0.5 rounded bg-slate-800">Canlı Widget Önizlemesi</span>
          </div>
          <p className="text-xs text-slate-300 font-sans line-clamp-2">{milestone.description}</p>
          <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1">
            <span>Otonomi: %{milestone.aiAutonomyIndex}</span>
            <span>Etki: %{milestone.impactLevel}</span>
          </div>
        </div>

        {/* iFrame Code Output */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono font-bold text-slate-300 uppercase">HTML iFrame Embed Kodu:</span>
            <button
              onClick={handleCopy}
              className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-mono text-xs font-bold transition-all cursor-pointer"
            >
              {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? "Kopyalandı!" : "Kodu Kopyala"}</span>
            </button>
          </div>

          <textarea
            readOnly
            value={embedCode}
            rows={3}
            className="w-full bg-slate-950 border border-white/10 rounded-xl p-3 text-xs font-mono text-cyan-300 focus:outline-none resize-none"
          />
        </div>

        <div className="pt-2 text-[11px] text-slate-500 font-mono text-center">
          Gömülen widget duyarlı (responsive) yapıda olup, ziyaretçilerin canlı oy vermesini sağlar.
        </div>
      </div>
    </div>
  );
};
