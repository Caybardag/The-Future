import React, { useState } from "react";
import { createPortal } from "react-dom";
import { 
  X, 
  Copy, 
  Check, 
  Clock, 
  AlertTriangle, 
  ShieldCheck, 
  TrendingUp, 
  AlertCircle, 
  Activity, 
  Zap, 
  Sparkles, 
  ArrowRight,
  ExternalLink,
  Info,
  Calendar
} from "lucide-react";
import { useLanguage } from "../context/LanguageContext";
import { AgentScanReport, AgentScanNextStep } from "../utils/agentScanReports";
import { ViewMode } from "../types";

interface FullReportViewerProps {
  report: AgentScanReport;
  onClose: () => void;
  onNavigateToView?: (view: ViewMode, targetYear?: number) => void;
  userPlan?: "free" | "pro" | "quantum_vip";
  onTriggerReScan?: (milestoneYear: number) => void;
}

export const FullReportViewer: React.FC<FullReportViewerProps> = ({
  report,
  onClose,
  onNavigateToView,
  userPlan = "free",
  onTriggerReScan
}) => {
  const { language } = useLanguage();
  const [isCopied, setIsCopied] = useState(false);

  const handleCopyReport = () => {
    const text = `================================================================================
📡 AJAN TELEMETRİ BRİFİNGİ: [${report.milestoneYear}] ${report.milestoneTitle}
Kategori: ${report.milestoneCategory}
Durum / Trend: ${report.trendLabel} (Güven Skoru: %${report.confidenceScore})
Üretim Zamanı: ${report.createdAt}
${report.isOfflineSimulated ? "UYARI: Örnek / simülasyon modu aktif.\n" : ""}
================================================================================

1. KAPAK ÖZETİ (GİRİŞ):
${report.summary}

2. TEKNİK & SEKTÖREL DERİN ANALİZ:
${report.reasoning}

3. KANIT & KAYNAK ÖZETİ:
${report.evidenceSummary}
${report.sources && report.sources.length > 0 ? report.sources.map(s => `- ${s.title} (${s.tier || 'Kaynak'})`).join('\n') : ''}

4. RİSKLER & İZLENECEK SİNYALLER:
${report.risksAndSignals ? report.risksAndSignals.map((r, i) => `${i + 1}. ${r}`).join("\n") : "Belirtilmedi"}

5. NE ZAMAN YENİDEN TARAMA MANTIKLI?
${report.rescanRecommendation || "6-12 ay sonra"}

⚠️ GÜNCELLİK BİLGİLENDİRMESİ:
${report.disclaimer}
================================================================================`;

    navigator.clipboard.writeText(text);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const getStepCreditCost = (step: AgentScanNextStep) => {
    if (userPlan === "quantum_vip") return step.creditCostVip === 0 ? "Ücretsiz (VIP)" : `${step.creditCostVip} Kredi`;
    if (userPlan === "pro") return `${step.creditCostPro} Kredi (Pro)`;
    return `${step.creditCostFree} Kredi`;
  };

  return createPortal(
    <div
      onClick={onClose}
      className="fixed inset-0 z-[999] bg-black/85 backdrop-blur-md flex items-center justify-center p-2 sm:p-6 animate-in fade-in"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-slate-950 border border-cyan-500/50 rounded-2xl sm:rounded-3xl max-w-4xl w-full max-h-[94dvh] flex flex-col shadow-2xl shadow-cyan-950/90 overflow-hidden font-sans"
      >
        
        {/* Modal Top Bar */}
        <div className="p-5 sm:p-6 border-b border-white/10 flex items-start justify-between gap-4 bg-slate-900/80 rounded-t-3xl">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2 flex-wrap font-mono">
              <span className="px-2.5 py-0.5 rounded text-[10px] bg-cyan-950 border border-cyan-500/40 text-cyan-300 font-bold">
                [{report.milestoneYear}] {report.milestoneCategory}
              </span>
              <span className="px-2.5 py-0.5 rounded text-[10px] bg-emerald-950 border border-emerald-500/40 text-emerald-300 font-bold">
                {report.trendLabel}
              </span>
              <span className="text-xs text-amber-300 font-bold">
                Güven Skoru: %{report.confidenceScore}
              </span>
            </div>
            <h3 className="font-bold text-white text-base sm:text-xl">
              {report.milestoneTitle}
            </h3>
            <div className="text-xs text-slate-400 font-mono flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-slate-500" />
              <span><strong>Üretim Zamanı:</strong> {report.createdAt}</span>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={handleCopyReport}
              className="p-2.5 rounded-xl bg-slate-900 border border-white/10 hover:bg-slate-800 text-slate-300 hover:text-white transition-all cursor-pointer shadow-sm"
              title="Raporu Kopyala"
            >
              {isCopied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4 text-slate-400" />}
            </button>
            <button
              onClick={onClose}
              className="p-2.5 rounded-xl bg-slate-900 border border-white/10 hover:bg-rose-950/80 text-slate-400 hover:text-rose-300 transition-all cursor-pointer shadow-sm"
              title="Kapat"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Scrollable Report Content */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-6 text-slate-300 text-xs sm:text-sm">
          
          {/* OFFLINE / SIMULATION CALLOUT */}
          {report.isOfflineSimulated && (
            <div className="p-4 bg-amber-950/40 border border-amber-500/40 rounded-2xl text-amber-200 text-xs flex items-center gap-3">
              <Info className="w-5 h-5 text-amber-400 shrink-0" />
              <div className="leading-relaxed">
                <strong>Çevrimdışı Analiz Protokolü:</strong> Ağ telemetrisi aktif olmadığında doğrulanmış parametrik modelleme devrededir; hayali istatistik veya uydurma kaynak içermez.
              </div>
            </div>
          )}

          {/* 1. COVER SUMMARY (EXECUTIVE BRIEFING) */}
          <div className="p-5 bg-slate-900/90 rounded-2xl border border-cyan-500/30 space-y-2">
            <div className="font-mono font-bold text-cyan-300 text-xs flex items-center gap-2">
              <Zap className="w-4 h-4 text-cyan-400" />
              <span>1. KAPAK ÖZETİ (GİRİŞ)</span>
            </div>
            <p className="text-white font-medium text-xs sm:text-sm leading-relaxed">
              {report.summary}
            </p>
          </div>

          {/* 2. TECHNICAL & DOMAIN DEEP-DIVE */}
          <div className="p-5 bg-slate-900/60 rounded-2xl border border-white/5 space-y-3">
            <div className="font-mono font-bold text-slate-200 text-xs flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-cyan-400" />
              <span>2. TEKNİK & SEKTÖREL DERİN ANALİZ</span>
            </div>
            <div className="text-slate-300 text-xs sm:text-sm leading-relaxed whitespace-pre-line">
              {report.reasoning}
            </div>
          </div>

          {/* 3. EVIDENCE & SOURCES */}
          <div className="p-5 bg-slate-900/60 rounded-2xl border border-white/5 space-y-3">
            <div className="font-mono font-bold text-slate-200 text-xs flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>3. KANIT & KAYNAK ÖZETİ</span>
            </div>
            <p className="text-slate-300 text-xs sm:text-sm leading-relaxed">
              {report.evidenceSummary}
            </p>
            {report.sources && report.sources.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2">
                {report.sources.map((src, idx) => (
                  <div key={`report-src-${src.title}-${idx}`} className="p-3 bg-slate-950 rounded-xl border border-white/5 text-xs flex flex-col justify-between gap-1.5">
                    <div>
                      <div className="font-bold text-cyan-300">{src.title}</div>
                      {src.tier && <div className="text-[11px] text-slate-400 font-mono mt-1">{src.tier}</div>}
                    </div>
                    {src.url && (
                      <a
                        href={src.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-[11px] font-mono text-cyan-400 hover:text-cyan-300 underline pt-1"
                      >
                        <span>Kaynağı Doğrula / Makaleyi Aç</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* 4 & 5: RISKS, SIGNALS & RE-SCAN ADVICE */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            {/* 4. Risks & Signals */}
            <div className="p-5 bg-slate-900/60 rounded-2xl border border-white/5 space-y-2.5">
              <div className="font-mono font-bold text-rose-300 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-400" />
                <span>4. RİSKLER & İZLENECEK 2-3 SİNYAL</span>
              </div>
              <ul className="space-y-2">
                {(report.risksAndSignals || [
                  "Temel fiziksel ve termodinamik ölçeklenme sınırları",
                  "Regülatif onay ve endüstriyel sermaye yatırımı akışı"
                ]).map((risk, idx) => (
                  <li key={`report-risk-${idx}-${risk.substring(0, 15)}`} className="text-slate-300 text-xs flex items-start gap-2">
                    <span className="text-rose-400 font-bold font-mono">▸</span>
                    <span>{risk}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* 5. Re-scan Advice */}
            <div className="p-5 bg-slate-900/60 rounded-2xl border border-white/5 space-y-2.5">
              <div className="font-mono font-bold text-cyan-300 text-xs flex items-center gap-2">
                <Activity className="w-4 h-4 text-cyan-400" />
                <span>5. NE ZAMAN YENİDEN TARAMA MANTIKLI?</span>
              </div>
              <p className="text-slate-300 text-xs sm:text-sm leading-relaxed">
                {report.rescanRecommendation || "6 ila 12 ay sonra veya ilgili sektörde büyük bir akademik yayın / patent duyurusu yapıldığında yeni tarama önerilir."}
              </p>
            </div>

          </div>

          {/* GÜNCELLİK BİLGİLENDİRMESİ VE UYARISI BANNERI */}
          <div className="p-5 bg-amber-950/40 border-2 border-amber-500/50 rounded-2xl text-amber-200 space-y-2 shadow-lg">
            <div className="font-bold font-mono text-amber-300 flex items-center gap-2 text-xs sm:text-sm">
              <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0" />
              <span>GÜNCELLİK BİLGİLENDİRMESİ & METODOLOJİ UYARISI</span>
            </div>
            <p className="text-xs sm:text-sm leading-relaxed text-slate-200 font-mono">
              {report.disclaimer || "Bu rapor, oluşturulduğu andaki modelleme ve analitik telemetri verilerini yansıtır. Göstergeler ve araştırma parametreleri güncellendikçe analiz sonuçları dinamik olarak revize edilebilir. Arşivlenmiş raporlar kayıt altında tutulur; güncel simülasyonlar için yeni analiz başlatılabilir."}
            </p>
            <div className="pt-2 flex flex-wrap items-center justify-between gap-3 text-xs font-mono border-t border-amber-500/20">
              <span className="text-amber-300/80">
                ● Raporun Kesin Üretim Zamanı: <strong>{report.createdAt}</strong>
              </span>
              {onTriggerReScan && (
                <button
                  onClick={() => {
                    onClose();
                    onTriggerReScan(report.milestoneYear);
                  }}
                  className="px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-lg transition-all cursor-pointer"
                >
                  Bu Hedefi Güncel Verilerle Yeniden Tara
                </button>
              )}
            </div>
          </div>

          {/* 6. "SIRADA NE BAKMALISIN?" YÖNLENDİRME BLOĞU */}
          {report.nextStepRecommendations && report.nextStepRecommendations.length > 0 && (
            <div className="p-5 bg-slate-900/90 rounded-2xl border border-cyan-500/40 space-y-4">
              <div className="flex items-center justify-between gap-2 flex-wrap">
                <div className="font-mono font-bold text-white text-xs sm:text-sm flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-cyan-400" />
                  <span>SIRADA NE BAKMALISIN? (MANTIKLI SONRAKİ ADIMLAR)</span>
                </div>
                <span className="text-xs text-slate-400 font-mono">
                  Seçtiğiniz adıma parametrelerle doğrudan geçebilirsiniz
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
                {report.nextStepRecommendations.map((step, idx) => (
                  <div
                    key={`rec-step-${step.title}-${idx}`}
                    onClick={() => {
                      onClose();
                      if (onNavigateToView) {
                        onNavigateToView(step.targetView as ViewMode, step.targetYear);
                      }
                    }}
                    className="p-4 bg-slate-950/90 hover:bg-cyan-950/40 border border-white/10 hover:border-cyan-400/60 rounded-xl cursor-pointer transition-all flex flex-col justify-between space-y-3 group shadow-md"
                  >
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-bold text-cyan-300 group-hover:text-cyan-200 transition-colors">
                          {step.title}
                        </span>
                        <span className="px-2 py-0.5 rounded text-[10px] bg-cyan-950 border border-cyan-500/30 text-cyan-400 font-mono">
                          {step.badgeLabel || "Modül"}
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 leading-relaxed">
                        {step.description}
                      </p>
                    </div>

                    <div className="flex items-center justify-between text-xs text-slate-500 pt-2 border-t border-white/5 font-mono">
                      <span className="text-amber-400/90 font-bold">⚡ {getStepCreditCost(step)}</span>
                      <span className="text-cyan-400 group-hover:translate-x-1 transition-transform flex items-center gap-1 font-bold">
                        İncele <ArrowRight className="w-3.5 h-3.5" />
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-white/10 bg-slate-900/60 flex items-center justify-between font-mono text-xs text-slate-400">
          <span>0 Kredi — Kayıtlı Rapor Görüntüleme</span>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-xl transition-all cursor-pointer"
          >
            Kapat
          </button>
        </div>

      </div>
    </div>,
    document.body
  );
};
