import React, { useState, useEffect } from "react";
import { AgentScanReport, getLocalAgentReports } from "../utils/agentScanReports";
import { Clock, History, FileText, ArrowRight, ShieldCheck } from "lucide-react";
import { useAuth } from "../context/AuthContext";

interface ScanHistoryProps {
  onSelectReport: (report: AgentScanReport) => void;
  onNavigateToNewScan: () => void;
  refreshTrigger?: number;
}

export const ScanHistory: React.FC<ScanHistoryProps> = ({
  onSelectReport,
  onNavigateToNewScan,
  refreshTrigger,
}) => {
  const { currentUser } = useAuth();
  const [reports, setReports] = useState<AgentScanReport[]>([]);

  useEffect(() => {
    const list = getLocalAgentReports(currentUser?.email);
    setReports(list);
  }, [currentUser, refreshTrigger]);

  if (reports.length === 0) {
    return (
      <div className="p-8 text-center rounded-2xl bg-slate-950/60 border border-white/5 space-y-3">
        <History className="w-8 h-8 text-slate-500 mx-auto" />
        <p className="text-xs text-slate-400">Henüz kaydedilmiş bir otonom ajan tarama raporunuz bulunmuyor.</p>
        <button
          type="button"
          onClick={onNavigateToNewScan}
          className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold transition-all cursor-pointer"
        >
          Yeni Tarama Başlat
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {reports.map((r) => (
        <div
          key={r.id}
          onClick={() => onSelectReport(r)}
          className="p-4 rounded-2xl bg-slate-950/70 border border-white/10 hover:border-purple-500/40 transition-all cursor-pointer flex items-center justify-between gap-4"
        >
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs font-bold text-purple-400">{r.milestoneYear}</span>
              <span className="text-[11px] text-slate-400">{r.milestoneTitle}</span>
            </div>
            <p className="text-xs text-slate-300 mt-1 line-clamp-1">{r.summary}</p>
          </div>
          <ArrowRight className="w-4 h-4 text-slate-500" />
        </div>
      ))}
    </div>
  );
};
