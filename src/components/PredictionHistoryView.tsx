import React from "react";
import { ViewMode } from "../types";
import { UserProfile } from "./UserAuthModal";
import { History, Sparkles, Clock, ArrowRight, ShieldCheck } from "lucide-react";
import { getLocalPredictionHistory } from "../utils/predictionHistory";

interface PredictionHistoryViewProps {
  onNavigateToView?: (view: ViewMode, targetYear?: number) => void;
  currentUser?: UserProfile | null;
}

export const PredictionHistoryView: React.FC<PredictionHistoryViewProps> = ({
  onNavigateToView,
  currentUser,
}) => {
  const history = getLocalPredictionHistory(currentUser?.email);

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
      <div className="bg-slate-900/80 border border-purple-500/20 rounded-3xl p-6 sm:p-8 shadow-xl backdrop-blur-md space-y-6">
        <div className="flex items-center gap-3 border-b border-white/10 pb-4">
          <div className="p-3 rounded-2xl bg-purple-500/20 text-purple-400 border border-purple-500/30">
            <History className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-white">Tahmin & Analiz Geçmişim</h2>
            <p className="text-xs text-slate-400">Çalıştırdığınız yapay zeka analizleri, senaryo simülasyonları ve yol haritası kararlarınız.</p>
          </div>
        </div>

        {history.length === 0 ? (
          <div className="text-center py-12 rounded-2xl bg-slate-950/50 border border-white/5 space-y-3">
            <Clock className="w-8 h-8 text-slate-500 mx-auto" />
            <p className="text-sm text-slate-400">Henüz kayıtlı bir tahmin geçmişiniz bulunmamaktadır.</p>
            {onNavigateToView && (
              <button
                type="button"
                onClick={() => onNavigateToView("timeline")}
                className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold transition-all cursor-pointer"
              >
                Zaman Çizelgesini Keşfet
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            {history.map((item) => (
              <div
                key={item.id}
                className="p-4 rounded-2xl bg-slate-950/60 border border-white/5 hover:border-purple-500/30 transition-all flex items-center justify-between gap-4"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] uppercase font-bold text-purple-400 font-mono px-2 py-0.5 rounded bg-purple-950/50 border border-purple-500/30">
                      {item.featureName || item.featureKey}
                    </span>
                    <span className="text-[11px] text-slate-500 font-mono">
                      {new Date(item.timestamp).toLocaleDateString("tr-TR")}
                    </span>
                  </div>
                  <h4 className="font-bold text-white text-sm">{item.queryTitle}</h4>
                  <p className="text-xs text-slate-400 line-clamp-1">{item.summarySnippet || item.generatedOutcome}</p>
                </div>

                {item.targetYear && onNavigateToView && (
                  <button
                    type="button"
                    onClick={() => onNavigateToView("timeline", item.targetYear)}
                    className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white transition-all cursor-pointer shrink-0"
                  >
                    <ArrowRight className="w-4 h-4" />
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
