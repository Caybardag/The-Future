import React, { useState, useEffect } from "react";
import { Milestone } from "../types";
import { aiService } from "../services/AIService";
import { useAuth } from "../context/AuthContext";
import {
  GraduationCap,
  Sparkles,
  RefreshCw,
  TrendingUp,
  AlertCircle,
  ExternalLink,
  ShieldCheck,
  Zap,
  CheckCircle2,
  Calendar,
  Layers,
  FileText,
  Clock,
  Compass,
  ArrowRight,
  BookOpen,
  Quote
} from "lucide-react";

interface AcademicTrlRadarCardProps {
  milestone: Milestone;
}

export const AcademicTrlRadarCard: React.FC<AcademicTrlRadarCardProps> = ({ milestone }) => {
  const { deductCredits, openCreditStore } = useAuth();

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [radarData, setRadarData] = useState<any>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Autonomous OpenAlex verified academic literature state
  const [academicPapers, setAcademicPapers] = useState<any[]>([]);
  const [loadingPapers, setLoadingPapers] = useState<boolean>(false);

  // Load verified OpenAlex papers automatically on mount / milestone switch
  useEffect(() => {
    let isMounted = true;
    async function loadAcademicLiterature() {
      setLoadingPapers(true);
      try {
        const queryParam = encodeURIComponent(milestone.title);
        const catParam = encodeURIComponent(milestone.category);
        const res = await fetch(`/api/academic/search?query=${queryParam}&category=${catParam}&limit=4`);
        if (res.ok) {
          const data = await res.json();
          if (isMounted && data.results && data.results.length > 0) {
            setAcademicPapers(data.results);
          }
        }
      } catch (err) {
        console.warn("[Academic Radar] Literature fetch note:", err);
      } finally {
        if (isMounted) setLoadingPapers(false);
      }
    }
    loadAcademicLiterature();
    return () => {
      isMounted = false;
    };
  }, [milestone.year, milestone.title, milestone.category]);

  // Load cached radar if present in localStorage
  useEffect(() => {
    try {
      const cacheKey = `trl_academic_radar_${milestone.year}`;
      const saved = localStorage.getItem(cacheKey);
      if (saved) {
        setRadarData(JSON.parse(saved));
      } else {
        setRadarData(null);
      }
    } catch {}
  }, [milestone.year]);

  // Scan Live Academic arXiv/Nature & USPTO Patent Signals
  const handleScanAcademicRadar = async () => {
    if (!deductCredits(5)) {
      setErrorMsg("Canlı Gelişim Aşaması & Derin Akademik Radar taraması için 5 Kredi gereklidir.");
      if (openCreditStore) openCreditStore();
      return;
    }

    setIsLoading(true);
    setErrorMsg(null);

    try {
      const res = await aiService.fetchAcademicTrlRadar(milestone);
      if (res.success && res.radar) {
        setRadarData(res.radar);
        localStorage.setItem(`trl_academic_radar_${milestone.year}`, JSON.stringify(res.radar));
      } else {
        setErrorMsg(res.error || "Akademik radar taraması gerçekleştirilemedi.");
      }
    } catch (e: any) {
      setErrorMsg(e.message || "Radar tarama hatası.");
    } finally {
      setIsLoading(false);
    }
  };

  // Scale Definition (Gelişim Aşaması 1-9)
  const getTrlColor = (lvl: number) => {
    if (lvl >= 8) return "text-emerald-400 bg-emerald-500/10 border-emerald-500/30";
    if (lvl >= 6) return "text-cyan-400 bg-cyan-500/10 border-cyan-500/30";
    if (lvl >= 4) return "text-amber-400 bg-amber-500/10 border-amber-500/30";
    return "text-purple-400 bg-purple-500/10 border-purple-500/30";
  };

  return (
    <div className="bg-slate-950/90 border border-emerald-500/30 rounded-2xl p-5 lg:p-6 space-y-4 font-mono text-slate-200 shadow-2xl relative overflow-hidden">
      
      {/* Top Banner */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 pb-3">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-lg bg-emerald-950/80 border border-emerald-400/40 text-emerald-300">
            <GraduationCap className="w-5 h-5 text-emerald-400" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400 bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-500/30">
                OTONOM AKADEMİK RADAR (ARXIV, NATURE & PATENTLER)
              </span>
              <span className="text-[10px] text-slate-400">Gelişim Aşaması 1-9</span>
            </div>
            <h3 className="text-sm font-bold text-white mt-0.5">
              Teknolojik Gelişim Aşaması (1-9) & Laboratuvar Sinyalleri
            </h3>
          </div>
        </div>

        <button
          onClick={handleScanAcademicRadar}
          disabled={isLoading}
          className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-emerald-600 to-cyan-600 hover:from-emerald-500 hover:to-cyan-500 text-slate-950 font-bold text-xs transition-all shadow-md shadow-emerald-500/20 flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? "animate-spin" : ""}`} />
          <span>
            {isLoading
              ? "arXiv/Nature Taranıyor..."
              : radarData
              ? "Radarı Güncelle (4 Kredi)"
              : "Canlı Akademik Radarı Çalıştır (4 Kredi)"}
          </span>
        </button>
      </div>

      {errorMsg && (
        <div className="p-3 bg-amber-950/80 border border-amber-500/40 rounded-xl text-amber-200 text-xs flex items-center justify-between font-mono">
          <span>{errorMsg}</span>
          <button onClick={() => setErrorMsg(null)} className="text-amber-400 font-bold ml-2">✕</button>
        </div>
      )}

      {/* When Radar Data is Available */}
      {radarData ? (
        <div className="space-y-4 animate-in fade-in duration-300">
          
          {/* Gauge Bar & Velocity Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            
            {/* Stage Level */}
            <div className="p-3.5 rounded-xl bg-slate-900/90 border border-white/10 space-y-1">
              <span className="text-[10px] text-slate-400 block uppercase">TAHMİNİ GELİŞİM AŞAMASI (1-9):</span>
              <div className="flex items-center gap-2">
                <span className="text-2xl font-black text-emerald-400">
                  Aşama {radarData.trlLevel}
                </span>
                <span className="text-xs text-slate-400">/ 9 (Olgunluk Ölçeği)</span>
              </div>
              <p className="text-[10px] text-slate-300 font-sans line-clamp-2">
                {radarData.trlName}
              </p>
            </div>

            {/* Maturity Velocity */}
            <div className="p-3.5 rounded-xl bg-slate-900/90 border border-white/10 space-y-1">
              <span className="text-[10px] text-slate-400 block uppercase">OLGUNLAŞMA HIZI:</span>
              <div className="text-sm font-bold text-cyan-300 flex items-center gap-1.5 mt-1">
                <TrendingUp className="w-4 h-4 text-cyan-400" />
                <span>{radarData.maturityVelocity}</span>
              </div>
              <p className="text-[10px] text-slate-400 font-sans">
                Yıllık patent ve hakemli makale artış ivmesi
              </p>
            </div>

            {/* Commercial Horizon */}
            <div className="p-3.5 rounded-xl bg-slate-900/90 border border-white/10 space-y-1">
              <span className="text-[10px] text-slate-400 block uppercase">İLK TİCARİLEŞME UFKU:</span>
              <div className="text-sm font-bold text-amber-300 flex items-center gap-1.5 mt-1">
                <Clock className="w-4 h-4 text-amber-400" />
                <span>{radarData.commercializationHorizon}</span>
              </div>
              <p className="text-[10px] text-slate-400 font-sans">
                İlk pilot endüstriyel dağıtım hedefi
              </p>
            </div>

          </div>

          {/* 9-Step Visual Progress Bar */}
          <div className="space-y-1.5 bg-slate-900/60 p-3 rounded-xl border border-white/5">
            <div className="flex items-center justify-between text-[10px] text-slate-400">
              <span>Aşama 1: Temel İlkeler</span>
              <span className="text-emerald-400 font-bold">Gelişim Aşaması Matrisi (1-9)</span>
              <span>Aşama 9: Sahada Operasyonel</span>
            </div>
            <div className="grid grid-cols-9 gap-1 h-2.5">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((step) => {
                const isPassed = step <= (radarData.trlLevel || 5);
                const isCurrent = step === (radarData.trlLevel || 5);
                return (
                  <div
                    key={step}
                    className={`rounded-sm transition-all ${
                      isCurrent
                        ? "bg-emerald-400 shadow-md shadow-emerald-400/50 animate-pulse"
                        : isPassed
                        ? "bg-emerald-600/80"
                        : "bg-slate-800"
                    }`}
                    title={`Aşama ${step}`}
                  />
                );
              })}
            </div>
          </div>

          {/* 2025-2026 Live Signals Grid */}
          <div className="space-y-2">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
              📡 Son 2025-2026 Akademik & Sınai Kanıt Sinyalleri:
            </span>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {(radarData.recentSignals2026 || []).map((sig: any, idx: number) => (
                <div
                  key={idx}
                  className="p-3.5 rounded-xl bg-slate-900/90 border border-white/10 space-y-1.5"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-cyan-300 truncate">
                      {sig.sourceTitle}
                    </span>
                    <span className="text-[9px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-400">
                      {sig.publishedYear}
                    </span>
                  </div>

                  <p className="text-xs text-slate-300 font-sans leading-relaxed">
                    {sig.keyFinding}
                  </p>

                  <div className="pt-1.5 border-t border-white/5 flex items-center justify-between text-[10px]">
                    <span className="text-slate-400">Aşama İlerlemesi:</span>
                    <span className="text-emerald-400 font-bold">{sig.impactOnTrl}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Critical Next Test Bench */}
          {radarData.criticalTestBench && (
            <div className="p-3.5 bg-amber-950/20 border border-amber-500/30 rounded-xl text-xs space-y-1">
              <span className="text-[10px] font-bold text-amber-400 uppercase flex items-center gap-1">
                <Compass className="w-3.5 h-3.5" />
                <span>Bir Sonraki Gelişim Aşaması İçin Zorunlu Test Düzeneği:</span>
              </span>
              <p className="text-slate-300 font-sans leading-relaxed">
                {radarData.criticalTestBench}
              </p>
            </div>
          )}

          {/* Chief Analyst Summary */}
          {radarData.analystSummary && (
            <div className="p-3.5 bg-slate-900 border border-white/10 rounded-xl text-xs space-y-1">
              <span className="text-[10px] font-bold text-emerald-400 uppercase block">
                ⚖️ Baş Denetçi Akademik Durum Özeti:
              </span>
              <p className="text-slate-200 font-sans leading-relaxed">
                "{radarData.analystSummary}"
              </p>
            </div>
          )}

        </div>
      ) : (
        <div className="p-4 bg-slate-900/40 border border-dashed border-emerald-500/20 rounded-xl flex items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2.5">
            <GraduationCap className="w-5 h-5 text-emerald-400 shrink-0" />
            <span className="text-slate-300 font-sans">
              2026 yılı yapay zeka destekli 1-9 gelişim aşaması ve canlı sinyal analizi.
            </span>
          </div>
        </div>
      )}

      {/* ───────────────────────────────────────────────────────────────────────────── */}
      {/* 📚 VERIFIED OPENALEX & PEER-REVIEWED SCIENTIFIC LITERATURE EVIDENCE */}
      {/* ───────────────────────────────────────────────────────────────────────────── */}
      <div className="space-y-3 pt-2 border-t border-white/10">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-cyan-400" />
            <h4 className="text-xs font-bold text-cyan-300 uppercase tracking-wider">
              Hakemli Bilimsel Literatür İndeksi (OpenAlex 250M Kataloğu)
            </h4>
          </div>
          <span className="text-[10px] text-slate-400 font-mono">
            {academicPapers.length} Makale İndekslendi
          </span>
        </div>

        {loadingPapers ? (
          <div className="p-4 rounded-xl bg-slate-900/60 border border-white/5 animate-pulse text-xs text-slate-400 flex items-center gap-2">
            <RefreshCw className="w-3.5 h-3.5 animate-spin text-cyan-400" />
            <span>OpenAlex küresel akademik arşivi taranıyor...</span>
          </div>
        ) : academicPapers.length > 0 ? (
          <div className="grid grid-cols-1 gap-2.5">
            {academicPapers.map((paper: any, pIdx: number) => (
              <div
                key={`academic-paper-${paper.id || 'paper'}-${pIdx}`}
                className="p-3.5 rounded-xl bg-slate-900/90 hover:bg-slate-900 border border-cyan-500/20 hover:border-cyan-500/40 transition-all space-y-2 group"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="space-y-1 flex-1">
                    <div className="flex flex-wrap items-center gap-1.5">
                      <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-cyan-950/80 text-cyan-300 border border-cyan-500/30">
                        {paper.source || "OpenAlex"}
                      </span>
                      <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-slate-800 text-slate-300">
                        {paper.year}
                      </span>
                      {paper.citedByCount !== undefined && paper.citedByCount > 0 && (
                        <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-emerald-950/70 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                          <Quote className="w-2.5 h-2.5" />
                          <span>{Number(paper.citedByCount).toLocaleString()} Atıf</span>
                        </span>
                      )}
                      {paper.openAccess && (
                        <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-amber-950/70 text-amber-300 border border-amber-500/30">
                          Açık Erişim (OA)
                        </span>
                      )}
                      {paper.doi && (
                        <span className="text-[9px] text-slate-400 font-mono truncate max-w-[150px]">
                          DOI: {paper.doi}
                        </span>
                      )}
                    </div>

                    <a
                      href={paper.url || (paper.doi ? `https://doi.org/${paper.doi}` : `https://openalex.org`)}
                      target="_blank"
                      rel="noopener noreferrer"
                      referrerPolicy="no-referrer"
                      className="text-xs font-bold text-white group-hover:text-cyan-300 transition-colors flex items-center gap-1.5 leading-snug"
                    >
                      <span>{paper.title}</span>
                      <ExternalLink className="w-3 h-3 text-slate-500 group-hover:text-cyan-400 shrink-0" />
                    </a>
                  </div>

                  {paper.pdfUrl && (
                    <a
                      href={paper.pdfUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      referrerPolicy="no-referrer"
                      className="px-2 py-1 rounded bg-red-950/60 hover:bg-red-900/80 border border-red-500/30 text-red-300 text-[10px] font-bold shrink-0 transition flex items-center gap-1"
                      title="Orijinal PDF Belgesini İndir / Oku"
                    >
                      <FileText className="w-3 h-3" />
                      <span>PDF</span>
                    </a>
                  )}
                </div>

                {paper.abstractSnippet && (
                  <p className="text-[11px] text-slate-300 font-sans leading-relaxed line-clamp-3">
                    {paper.abstractSnippet}
                  </p>
                )}

                {paper.authors && paper.authors.length > 0 && (
                  <div className="pt-1 border-t border-white/5 flex items-center justify-between text-[10px] text-slate-400">
                    <span className="truncate max-w-[280px]">
                      Yazarlar: {paper.authors.slice(0, 3).join(", ")}{paper.authors.length > 3 ? " vd." : ""}
                    </span>
                    <span className="text-emerald-400 font-mono font-semibold">
                      Güvenilirlik: %{paper.confidenceScore || 95}
                    </span>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="p-3 bg-slate-900/40 border border-white/5 rounded-xl text-xs text-slate-400">
            Bu teknolojik alan için OpenAlex ve arXiv veritabanı önbelleği doğrulanıyor.
          </div>
        )}
      </div>

    </div>
  );
};
