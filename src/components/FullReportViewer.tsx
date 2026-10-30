import React from "react";
import { AgentScanReport } from "../utils/agentScanReports";
import { ViewMode } from "../types";
import { X, Sparkles, RefreshCw, FileText, CheckCircle2, AlertTriangle, ShieldCheck } from "lucide-react";

interface FullReportViewerProps {
  report: AgentScanReport;
  onClose: () => void;
  onNavigateToView?: (view: ViewMode, targetYear?: number) => void;
  userPlan?: string;
  onTriggerReScan?: (year: number) => void;
}

export const FullReportViewer: React.FC<FullReportViewerProps> = ({
  report,
  onClose,
  onNavigateToView,
  onTriggerReScan,
}) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-3xl bg-slate-900 border border-purple-500/40 rounded-3xl p-6 sm:p-8 shadow-2xl overflow-y-auto max-h-[90vh] space-y-6">
        <button
          type="button"
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-all cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 border-b border-white/10 pb-4">
          <div className="p-3 rounded-2xl bg-purple-500/20 text-purple-400 border border-purple-500/30">
            <FileText className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs font-bold text-purple-400">{report.milestoneYear}</span>
              <h3 className="text-xl font-bold text-white">{report.milestoneTitle}</h3>
            </div>
            <p className="text-xs text-slate-400">Otonom Ajan Derin Tarama Raporu</p>
          </div>
        </div>

        <div className="space-y-4 text-xs font-sans">
          <div className="p-4 rounded-2xl bg-slate-950/80 border border-white/10 space-y-2">
            <span className="text-[11px] font-mono uppercase text-slate-400 font-bold block">Özet Bulgular</span>
            <p className="text-slate-300 leading-relaxed text-sm">{report.summary}</p>
          </div>

          {report.nextSteps && report.nextSteps.length > 0 && (
            <div className="space-y-2">
              <span className="text-[11px] font-mono uppercase text-purple-400 font-bold block">Önerilen Aksiyonlar</span>
              <div className="space-y-2">
                {report.nextSteps.map((step, idx) => (
                  <div key={idx} className="p-3 rounded-xl bg-purple-950/20 border border-purple-500/20 text-slate-300">
                    <span className="font-bold text-white block">{step.title}</span>
                    <p className="text-slate-400 mt-0.5">{step.action}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="flex items-center justify-between gap-3 pt-4 border-t border-white/10">
          {onTriggerReScan && (
            <button
              type="button"
              onClick={() => {
                onTriggerReScan(report.milestoneYear);
                onClose();
              }}
              className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Yeniden Tara</span>
            </button>
          )}

          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs transition-all cursor-pointer shadow-md shadow-purple-500/20 ml-auto"
          >
            Kapat
          </button>
        </div>
      </div>
    </div>
  );
};
