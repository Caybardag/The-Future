import React, { useState, useEffect } from "react";
import { Milestone, DetailedParametricAuditResult } from "../types";
import { aiService } from "../services/AIService";
import { useAuth } from "../context/AuthContext";
import {
  ShieldCheck,
  AlertTriangle,
  RefreshCw,
  Cpu,
  Layers,
  Sparkles,
  Zap,
  Activity,
  Flame,
  CheckCircle2,
  XCircle,
  HelpCircle,
  TrendingUp,
  Clock,
  ArrowRight
} from "lucide-react";

interface ParametricAuditCardProps {
  milestone: Milestone;
  onAuditCompleted?: (result: DetailedParametricAuditResult) => void;
}

export const ParametricAuditCard: React.FC<ParametricAuditCardProps> = ({
  milestone,
  onAuditCompleted,
}) => {
  const { deductCredits, openCreditStore } = useAuth();

  const [auditResult, setAuditResult] = useState<DetailedParametricAuditResult | null>(() => {
    try {
      const saved = localStorage.getItem(`parametric_audit_result_${milestone.year}`);
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Run deep discipline-specific parametric audit
  const handleRunParametricAudit = async () => {
    if (!deductCredits(5)) {
      setErrorMsg("Parametrik bilimsel denetim için 5 Kredi gereklidir.");
      if (openCreditStore) openCreditStore();
      return;
    }

    setIsLoading(true);
    setErrorMsg(null);

    try {
      const res = await aiService.runParametricAudit(milestone);
      if (res.success && res.audit) {
        setAuditResult(res.audit);
        try {
          localStorage.setItem(`parametric_audit_result_${milestone.year}`, JSON.stringify(res.audit));
        } catch {}
        if (onAuditCompleted) onAuditCompleted(res.audit);
      } else {
        setErrorMsg(res.error || "Parametrik denetim gerçekleştirilemedi.");
      }
    } catch (e: any) {
      setErrorMsg("Denetim hatası: " + (e.message || "Bilinmeyen hata"));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-[#060a14] border border-cyan-500/40 rounded-2xl p-5 lg:p-6 space-y-5 font-mono text-slate-100 shadow-2xl relative overflow-hidden">
      
      {/* Top Banner Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 pb-4">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-xl bg-cyan-950/80 border border-cyan-400/50 text-cyan-300 shadow-lg shadow-cyan-500/10">
            <ShieldCheck className="w-6 h-6 text-cyan-400 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-cyan-300 bg-cyan-950/80 px-2.5 py-0.5 rounded border border-cyan-500/40">
                {milestone.category} DİSİPLİNİ BİLİMSEL VE FİZİKSEL DENETİMİ
              </span>
              <span className="text-[10px] font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/30">
                ⚡ 5 Kredi
              </span>
            </div>
            <h3 className="text-base lg:text-lg font-bold text-white mt-1">
              {milestone.year} — {milestone.title}
            </h3>
          </div>
        </div>

        {/* Audit Run / Re-Run Button */}
        <button
          onClick={handleRunParametricAudit}
          disabled={isLoading}
          className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-cyan-600 via-blue-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 text-slate-950 font-bold text-xs transition-all shadow-lg shadow-cyan-500/20 flex items-center gap-2 cursor-pointer disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`} />
          <span>
            {isLoading
              ? "Disiplin Parametreleri Taranıyor..."
              : auditResult
              ? "Parametrik Denetimi Yeniden Çalıştır (5 Kredi)"
              : "Parametrik Denetimi Başlat (5 Kredi)"}
          </span>
        </button>
      </div>

      {errorMsg && (
        <div className="p-3 bg-amber-950/80 border border-amber-500/40 rounded-xl text-amber-200 text-xs flex items-center justify-between">
          <span>{errorMsg}</span>
          <button onClick={() => setErrorMsg(null)} className="text-amber-400 font-bold ml-2">✕</button>
        </div>
      )}

      {/* When no audit has been performed yet */}
      {!auditResult && !isLoading && (
        <div className="p-8 rounded-xl bg-slate-950/70 border border-dashed border-cyan-500/20 text-center space-y-3">
          <Cpu className="w-10 h-10 text-cyan-400/60 mx-auto" />
          <h4 className="text-sm font-bold text-slate-200">
            {milestone.category} Alanına Özel Fiziksel & Mühendislik Kriter Taraması
          </h4>
          <p className="text-xs text-slate-400 max-w-lg mx-auto font-sans leading-relaxed">
            Bu teknoloji için henüz derin parametrik denetim çalıştırılmadı. Butona tıkladığınızda sistem; 
            <strong> 2026 laboratuvar eşiklerini, Wh/kg veya FLOPs/W gibi fiziksel darboğazları ve patent verilerini</strong> canlı olarak denetleyecektir.
          </p>
          <button
            onClick={handleRunParametricAudit}
            className="px-4 py-2 rounded-xl bg-cyan-950 hover:bg-cyan-900 border border-cyan-500/40 text-cyan-300 text-xs font-bold transition-all inline-flex items-center gap-2 cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
            <span>Fiziksel Parametre Denetimini Canlı Çalıştır</span>
          </button>
        </div>
      )}

      {/* Loading state skeleton animation */}
      {isLoading && (
        <div className="p-8 rounded-xl bg-slate-950/90 border border-cyan-500/30 text-center space-y-4 animate-pulse">
          <RefreshCw className="w-8 h-8 text-cyan-400 animate-spin mx-auto" />
          <p className="text-xs text-cyan-300 font-bold">
            Google Search Grounding & Academic Databases taranıyor...
          </p>
          <p className="text-[11px] text-slate-400 font-sans max-w-md mx-auto">
            {milestone.category} kategorisindeki 2026 güncel laboratuvar atılımları, patentler ve fiziksel sınırlar karşılaştırılıyor...
          </p>
        </div>
      )}

      {/* Detailed Parametric Audit Result Cards */}
      {auditResult && !isLoading && (
        <div className="space-y-5 animate-in fade-in duration-300">
          
          {/* Top Status & Drift Badge Row */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            
            {/* Status 1: Progression Velocity */}
            <div className="p-4 rounded-xl bg-slate-950 border border-white/10 space-y-1">
              <div className="text-[10px] text-slate-400 flex items-center justify-between">
                <span>GERÇEKLEŞME EĞRİSİ:</span>
                <span className="font-bold text-cyan-400">{auditResult.statusLabel}</span>
              </div>
              <div className="text-lg font-black text-white flex items-center gap-2">
                {auditResult.status === "accelerated" && <span className="text-emerald-400">⚡ Hızlanıyor ({auditResult.driftYears} Yıl Öne Çekildi)</span>}
                {auditResult.status === "on_track" && <span className="text-blue-400">🎯 Zamanında İlerliyor</span>}
                {auditResult.status === "bottleneck" && <span className="text-rose-400">⚠️ Darboğazda (+{auditResult.driftYears} Yıl Gecikme)</span>}
                {auditResult.status === "paradigm_shift" && <span className="text-purple-400">🌀 Paradigma Değişimi</span>}
              </div>
            </div>

            {/* Status 2: Scientific Confidence Score */}
            <div className="p-4 rounded-xl bg-slate-950 border border-cyan-500/30 space-y-1">
              <div className="text-[10px] text-slate-400 flex items-center justify-between">
                <span>BİLİMSEL GÜVEN SKORU:</span>
                <span className="text-emerald-400 font-bold">Nature & IEEE Uyumlu</span>
              </div>
              <div className="text-2xl font-black text-cyan-300">
                %{auditResult.scientificConfidenceScore}
              </div>
            </div>

            {/* Status 3: Discipline Category */}
            <div className="p-4 rounded-xl bg-slate-950 border border-white/10 space-y-1">
              <div className="text-[10px] text-slate-400 flex items-center justify-between">
                <span>DENETLENEN DİSİPLİN:</span>
              </div>
              <div className="text-sm font-bold text-slate-200 truncate">
                {auditResult.discipline}
              </div>
            </div>

          </div>

          {/* Key Engineering / Physical Parameters Table */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between text-xs font-bold text-cyan-400 uppercase tracking-wider">
              <span className="flex items-center gap-1.5">
                <Cpu className="w-4 h-4 text-cyan-400" />
                <span>Disipline Özgü Fiziksel/Mühendislik Parametreleri</span>
              </span>
              <span className="text-slate-400 font-normal text-[10px]">
                {auditResult.keyEngineeringParameters?.length || 0} Parametre Ölçüldü
              </span>
            </div>

            <div className="space-y-2">
              {(auditResult.keyEngineeringParameters || []).map((param, pIdx) => (
                <div
                  key={pIdx}
                  className="p-3.5 rounded-xl bg-slate-950/80 border border-white/10 space-y-2 hover:border-cyan-500/40 transition-all"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-white">{param.paramName}</span>
                      <span className="text-[10px] px-2 py-0.5 rounded bg-slate-900 border border-white/10 text-slate-400 font-mono">
                        Birim: {param.unit}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 text-xs">
                      {param.verdict === "Met" && (
                        <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-bold text-[10px] flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3 text-emerald-400" /> Karşılandı
                        </span>
                      )}
                      {param.verdict === "In_Progress" && (
                        <span className="px-2 py-0.5 rounded bg-blue-500/20 text-blue-300 border border-blue-500/40 font-bold text-[10px]">
                          Ar-Ge İlerleme Sürecinde
                        </span>
                      )}
                      {param.verdict === "Critical_Gap" && (
                        <span className="px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 border border-rose-500/40 font-bold text-[10px] flex items-center gap-1">
                          <XCircle className="w-3 h-3 text-rose-400" /> Kritik Boşluk
                        </span>
                      )}
                      <span className="font-black text-cyan-400">%{param.feasibilityRatio}</span>
                    </div>
                  </div>

                  {/* Progress ratio */}
                  <div className="w-full bg-slate-900 rounded-full h-1.5 overflow-hidden">
                    <div
                      className={`h-full rounded-full ${
                        param.feasibilityRatio >= 85
                          ? "bg-gradient-to-r from-emerald-500 to-cyan-400"
                          : param.feasibilityRatio >= 60
                          ? "bg-gradient-to-r from-cyan-500 to-blue-500"
                          : "bg-gradient-to-r from-amber-500 to-rose-500"
                      }`}
                      style={{ width: `${param.feasibilityRatio}%` }}
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] font-sans pt-1">
                    <div className="text-slate-400">
                      <strong>Gereken Eşik:</strong> <span className="text-slate-200">{param.requiredThreshold}</span>
                    </div>
                    <div className="text-slate-400">
                      <strong>2026 Mevcut Seviye:</strong> <span className="text-cyan-300">{param.currentLabState2026}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Primary Bottleneck & Mitigation Strategy */}
          {auditResult.primaryBottleneck && (
            <div className="p-4 rounded-xl bg-gradient-to-r from-rose-950/40 via-slate-950 to-slate-950 border border-rose-500/30 space-y-2">
              <div className="flex items-center gap-2 text-rose-400 font-bold text-xs uppercase">
                <AlertTriangle className="w-4 h-4 text-rose-400" />
                <span>Kritik Darboğaz: {auditResult.primaryBottleneck.category}</span>
              </div>
              <p className="text-xs text-slate-200 font-sans leading-relaxed">
                {auditResult.primaryBottleneck.description}
              </p>
              <div className="pt-1 text-[11px] text-emerald-300 font-sans">
                <strong>2026 Çözüm Yaklaşımı:</strong> {auditResult.primaryBottleneck.mitigationStrategy}
              </div>
            </div>
          )}

          {/* Breakthrough Signals & Downstream Triggers */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="p-3.5 rounded-xl bg-slate-950 border border-white/10 space-y-1.5">
              <div className="text-[10px] font-bold text-cyan-400 uppercase">
                🔬 2026 Gerçek Dünya Sinyalleri
              </div>
              <ul className="list-disc list-inside text-[11px] text-slate-300 space-y-1 font-sans">
                {(auditResult.breakthroughSignals || []).map((s, idx) => (
                  <li key={idx}>{s}</li>
                ))}
              </ul>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-950 border border-white/10 space-y-1.5">
              <div className="text-[10px] font-bold text-purple-400 uppercase">
                🚀 Doğuracağı Türev Kırılmalar
              </div>
              <ul className="list-disc list-inside text-[11px] text-slate-300 space-y-1 font-sans">
                {(auditResult.consequentialDownstreamTriggers || []).map((t, idx) => (
                  <li key={idx}>{t}</li>
                ))}
              </ul>
            </div>
          </div>

          {/* Final Verdict Box */}
          <div className="p-4 rounded-xl bg-gradient-to-r from-cyan-950/60 to-slate-950 border border-cyan-500/40 space-y-1.5">
            <div className="flex items-center justify-between text-[10px] font-bold text-cyan-400 uppercase">
              <span>⚖️ Baş Bilim İnsanı ve Denetçi Hükmü</span>
              <span className="text-emerald-400">✓ Onaylı Değerlendirme</span>
            </div>
            <p className="text-xs text-slate-200 font-sans leading-relaxed">
              "{auditResult.scientificVerdictSummary}"
            </p>
          </div>

        </div>
      )}

    </div>
  );
};
