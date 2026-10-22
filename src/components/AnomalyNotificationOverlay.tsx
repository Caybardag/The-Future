import React, { useState } from "react";
import { ScientificAnomaly } from "../services/ScientificVerificationEngine";
import { Atom, AlertTriangle, CheckCircle2, ShieldAlert, Sparkles, X, ArrowRight, RefreshCw, FileText, ExternalLink, Cpu } from "lucide-react";

interface AnomalyNotificationOverlayProps {
  anomalies: ScientificAnomaly[];
  onDismiss: () => void;
  onApplyCorrection: (year: number, correctedDescription: string) => void;
  onRequestHitlRevision?: (year: number, userNote: string) => void;
}

export const AnomalyNotificationOverlay: React.FC<AnomalyNotificationOverlayProps> = ({
  anomalies,
  onDismiss,
  onApplyCorrection,
  onRequestHitlRevision,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [hitlInputOpen, setHitlInputOpen] = useState(false);
  const [hitlNote, setHitlNote] = useState("");
  const [appliedYears, setAppliedYears] = useState<number[]>([]);
  const [showPatentDetails, setShowPatentDetails] = useState(false);

  if (!anomalies || anomalies.length === 0) return null;

  const currentAnomaly = anomalies[currentIndex];
  if (!currentAnomaly) return null;

  const { milestoneYear, milestoneTitle, originalDescription, verification } = currentAnomaly;
  const isApplied = appliedYears.includes(milestoneYear);

  const handleApply = () => {
    onApplyCorrection(milestoneYear, verification.correctedDescription);
    setAppliedYears((prev) => [...prev, milestoneYear]);
  };

  const handleHitlSubmit = () => {
    if (onRequestHitlRevision && hitlNote.trim()) {
      onRequestHitlRevision(milestoneYear, hitlNote);
      setHitlInputOpen(false);
      setHitlNote("");
    }
  };

  const handleNext = () => {
    if (currentIndex < anomalies.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      onDismiss();
    }
  };

  return (
    <div
      onClick={onDismiss}
      className="fixed inset-0 z-[130] flex items-center justify-center p-2 sm:p-4 bg-slate-950/85 backdrop-blur-md animate-fadeIn"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-2xl bg-slate-900 border border-amber-500/40 rounded-2xl sm:rounded-3xl shadow-2xl shadow-amber-500/10 overflow-hidden flex flex-col max-h-[94dvh]"
      >
        {/* Top Glowing Gradient Bar */}
        <div className="h-1.5 w-full bg-gradient-to-r from-amber-500 via-emerald-400 to-cyan-500" />

        {/* Header */}
        <div className="p-5 border-b border-slate-800 bg-slate-950/60 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400 animate-pulse">
              <Atom className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono font-bold tracking-widest text-amber-400 uppercase bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                  MAIN BRAIN // SCIENTIFIC AUDIT
                </span>
                <span className="text-xs text-slate-400 font-mono">
                  Anomali {currentIndex + 1} / {anomalies.length}
                </span>
              </div>
              <h3 className="text-lg font-bold text-white flex items-center gap-2 mt-0.5">
                <span>{milestoneYear} - {milestoneTitle}</span>
              </h3>
            </div>
          </div>

          <button
            onClick={onDismiss}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg bg-slate-800/60 hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="p-6 overflow-y-auto space-y-5 text-sm">
          {/* Verdict Status Card */}
          <div className="bg-slate-950/80 border border-amber-500/30 rounded-xl p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="text-xs text-amber-400 font-mono font-semibold uppercase flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4 text-amber-400" />
                <span>{verification.verdictLabel}</span>
              </div>
              <p className="text-xs text-slate-300">
                {verification.aiBrainApprovalBadge}
              </p>
            </div>

            <div className="flex items-center gap-3 self-end md:self-center bg-slate-900 px-3.5 py-1.5 rounded-lg border border-slate-800">
              <span className="text-xs text-slate-400 font-mono">Fizik & Gelişim Uyumu:</span>
              <span className="text-lg font-bold font-mono text-emerald-400">
                %{verification.feasibilityScore}
              </span>
            </div>
          </div>

          {/* Scientific Critique Box */}
          <div className="space-y-2">
            <h4 className="text-xs font-mono font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <Cpu className="w-3.5 h-3.5 text-cyan-400" />
              <span>Ana Onay Beyin Motoru Bilimsel Eleştirisi</span>
            </h4>
            <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 text-xs leading-relaxed font-sans">
              {verification.scientificCritique}
            </div>
          </div>

          {/* Flagged Anomaly Badges */}
          {verification.flaggedAnomalies && verification.flaggedAnomalies.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {verification.flaggedAnomalies.map((anom, idx) => (
                <span key={idx} className="px-2.5 py-1 rounded-md bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-mono flex items-center gap-1">
                  <ShieldAlert className="w-3 h-3" />
                  {anom}
                </span>
              ))}
            </div>
          )}

          {/* Comparison View */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Original */}
            <div className="p-4 rounded-xl bg-slate-950/60 border border-red-500/20 space-y-2">
              <div className="text-[11px] font-mono uppercase text-red-400 font-semibold flex items-center gap-1">
                <X className="w-3.5 h-3.5" />
                <span>Mevcut İddia (Sorunlu / Abartılı)</span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed italic">
                "{originalDescription}"
              </p>
            </div>

            {/* Corrected */}
            <div className="p-4 rounded-xl bg-slate-950/80 border border-emerald-500/30 space-y-2">
              <div className="text-[11px] font-mono uppercase text-emerald-400 font-semibold flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Bilimsel Olarak Düzeltilmiş Tanım</span>
              </div>
              <p className="text-xs text-slate-100 leading-relaxed font-medium">
                "{verification.correctedDescription}"
              </p>
            </div>
          </div>

          {/* HITL Custom Revision Input Section */}
          {hitlInputOpen && (
            <div className="p-4 rounded-xl bg-slate-950 border border-cyan-500/40 space-y-3 animate-fadeIn">
              <label className="text-xs font-mono text-cyan-400 font-semibold flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Human-In-The-Loop (HITL) Revizyon Notunuzu Yazın:</span>
              </label>
              <textarea
                value={hitlNote}
                onChange={(e) => setHitlNote(e.target.value)}
                placeholder="Örn: 2028 katı hal pilinde batarya ömrü döngü sayısını 5000 şarja sabitleyelim..."
                rows={3}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400"
              />
              <div className="flex justify-end gap-2">
                <button
                  onClick={() => setHitlInputOpen(false)}
                  className="px-3 py-1.5 rounded-lg text-xs text-slate-400 hover:bg-slate-800"
                >
                  İptal
                </button>
                <button
                  onClick={handleHitlSubmit}
                  className="px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-cyan-500 hover:bg-cyan-400 text-slate-950"
                >
                  Revizyon Gönder & Yeniden Denetle
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/80 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            {!isApplied ? (
              <button
                onClick={handleApply}
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 text-xs font-bold flex items-center gap-2 shadow-lg shadow-emerald-500/20 transition-all"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Bilimsel Düzeltmeyi Uygula</span>
              </button>
            ) : (
              <span className="px-3 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-mono font-semibold flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4" />
                <span>Düzeltme Veri Kümesine İşlendi</span>
              </span>
            )}

            <button
              onClick={() => setHitlInputOpen(!hitlInputOpen)}
              className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold flex items-center gap-1.5 transition-colors"
            >
              <RefreshCw className="w-3.5 h-3.5 text-cyan-400" />
              <span>HITL Revize Et</span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            {currentIndex < anomalies.length - 1 ? (
              <button
                onClick={handleNext}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold flex items-center gap-1.5 border border-slate-700"
              >
                <span>Sonraki Anomali</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            ) : (
              <button
                onClick={onDismiss}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold"
              >
                Kapat & Devam Et
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
