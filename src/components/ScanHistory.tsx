import React, { useState, useEffect } from "react";
import { 
  FileText, 
  Clock, 
  Trash2, 
  Sparkles, 
  ExternalLink, 
  RefreshCw, 
  ShieldCheck, 
  AlertTriangle, 
  Search,
  Database,
  CheckCircle2,
  Maximize2
} from "lucide-react";
import { useLanguage } from "../context/LanguageContext";
import { useAuth } from "../context/AuthContext";
import { 
  AgentScanReport, 
  fetchUserAgentReportsFromFirestore, 
  deleteAgentScanReport 
} from "../utils/agentScanReports";

interface ScanHistoryProps {
  onSelectReport: (report: AgentScanReport) => void;
  onNavigateToNewScan?: () => void;
  refreshTrigger?: number;
}

export const ScanHistory: React.FC<ScanHistoryProps> = ({
  onSelectReport,
  onNavigateToNewScan,
  refreshTrigger = 0
}) => {
  const { language } = useLanguage();
  const auth = useAuth();
  const [reports, setReports] = useState<AgentScanReport[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  const loadReports = async () => {
    setLoading(true);
    try {
      const data = await fetchUserAgentReportsFromFirestore(auth.currentUser?.email);
      setReports(data);
    } catch (err) {
      console.warn("[ScanHistory] Failed to load reports:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReports();
  }, [auth.currentUser?.email, refreshTrigger]);

  const handleDelete = async (e: React.MouseEvent, reportId: string) => {
    e.stopPropagation();
    deleteAgentScanReport(reportId, auth.currentUser?.email);
    setReports((prev) => prev.filter((r) => r.id !== reportId));
  };

  const categories = Array.from(new Set(reports.map((r) => r.milestoneCategory).filter(Boolean)));

  const filteredReports = reports.filter((r) => {
    const matchesSearch = 
      r.milestoneTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.milestoneYear.toString().includes(searchQuery) ||
      (r.summary && r.summary.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesCategory = selectedCategory === "all" || r.milestoneCategory === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-5 font-sans">
      
      {/* Top Header & Stat Banner */}
      <div className="bg-slate-900/60 border border-white/10 rounded-2xl p-5 flex flex-wrap items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Database className="w-5 h-5 text-cyan-400" />
            <h3 className="font-bold text-white text-base sm:text-lg">
              {language === "en" ? "Scan History & Firestore Archive" : "Tarama Geçmişim (Firestore Arşivi)"}
            </h3>
          </div>
          <p className="text-xs text-slate-400 font-mono">
            {language === "en"
              ? "All your previous autonomous telemetry reports are saved to Firestore 'agent_reports' collection and can be viewed for 0 Credits (Free)."
              : "Daha önce gerçekleştirdiğiniz tüm Ajan Taramaları Firestore 'agent_reports' koleksiyonuna kaydedilir ve 0 Kredi (Tamamen Ücretsiz) olarak görüntülenebilir."}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={loadReports}
            disabled={loading}
            className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-white/5 font-mono text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-all disabled:opacity-50"
            title="Firestore'dan Yenile"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-cyan-400 ${loading ? "animate-spin" : ""}`} />
            <span>{loading ? "Yenileniyor..." : "Yenile"}</span>
          </button>

          {onNavigateToNewScan && (
            <button
              onClick={onNavigateToNewScan}
              className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-mono text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-all shadow-md"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>{language === "en" ? "New Scan" : "Yeni Tarama Başlat"}</span>
            </button>
          )}
        </div>
      </div>

      {/* Free View Guarantee Banner */}
      <div className="p-3.5 bg-emerald-950/40 border border-emerald-500/30 rounded-xl flex items-center justify-between gap-3 text-xs text-emerald-200 font-mono">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>
            <strong>Ücretsiz Görüntüleme Güvencesi:</strong> Kayıtlı geçmiş raporları açmak, okumak ve kopyalamak <strong>0 Kredi</strong>dir (Bakiye düşmez).
          </span>
        </div>
        <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/40 text-[10px] shrink-0">
          0 KREDİ
        </span>
      </div>

      {/* Filters & Search */}
      {reports.length > 0 && (
        <div className="flex flex-wrap items-center justify-between gap-3 font-mono text-xs">
          {/* Search Box */}
          <div className="relative flex-1 min-w-[240px]">
            <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Rapor başlığı, yıl veya içerikte ara..."
              className="w-full bg-slate-950 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-white focus:outline-none focus:border-cyan-500 text-xs"
            />
          </div>

          {/* Category Filter */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 max-w-full">
            <button
              onClick={() => setSelectedCategory("all")}
              className={`px-3 py-1.5 rounded-lg text-[11px] font-bold transition-all cursor-pointer whitespace-nowrap ${
                selectedCategory === "all"
                  ? "bg-cyan-500 text-slate-950 shadow-sm"
                  : "bg-slate-900 text-slate-400 border border-white/5 hover:text-white"
              }`}
            >
              Tümü ({reports.length})
            </button>
            {categories.map((cat, cIdx) => (
              <button
                key={`scan-cat-${cat}-${cIdx}`}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 rounded-lg text-[11px] font-bold transition-all cursor-pointer whitespace-nowrap ${
                  selectedCategory === cat
                    ? "bg-cyan-500 text-slate-950 shadow-sm"
                    : "bg-slate-900 text-slate-400 border border-white/5 hover:text-white"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Reports Grid */}
      {loading ? (
        <div className="p-12 text-center bg-slate-900/30 rounded-2xl border border-white/5 space-y-3 font-mono">
          <RefreshCw className="w-8 h-8 text-cyan-400 animate-spin mx-auto" />
          <p className="text-sm text-slate-300">Firestore 'agent_reports' koleksiyonundan taranan raporlar yükleniyor...</p>
        </div>
      ) : filteredReports.length === 0 ? (
        <div className="p-12 text-center bg-slate-900/40 rounded-2xl border border-white/5 text-slate-400 space-y-3 font-sans">
          <FileText className="w-12 h-12 text-slate-600 mx-auto" />
          <div className="space-y-1">
            <p className="font-bold text-base text-slate-300 font-mono">
              {reports.length === 0
                ? "Henüz Gerçekleştirilmiş Bir Ajan Taraması Bulunamadı"
                : "Arama Kriterine Uygun Rapor Bulunamadı"}
            </p>
            <p className="text-xs text-slate-500 max-w-md mx-auto">
              {reports.length === 0
                ? "35 dönüm noktası arasından dilediğiniz bir hedefi seçerek ilk otonom telemetri taramasını başlatabilirsiniz."
                : "Arama teriminizi veya kategori filtrenizi değiştirerek tekrar deneyiniz."}
            </p>
          </div>
          {reports.length === 0 && onNavigateToNewScan && (
            <button
              onClick={onNavigateToNewScan}
              className="mt-2 px-4 py-2 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold font-mono text-xs rounded-xl inline-flex items-center gap-2 cursor-pointer shadow-lg"
            >
              <Sparkles className="w-4 h-4" />
              <span>İlk Taramayı Başlat</span>
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredReports.map((report, idx) => (
            <div
              key={`${report.id || 'report'}-${idx}`}
              onClick={() => onSelectReport(report)}
              className="bg-slate-900/70 hover:bg-slate-850 border border-white/10 hover:border-cyan-500/50 rounded-2xl p-5 space-y-3 cursor-pointer transition-all group relative overflow-hidden shadow-lg"
            >
              {/* Header Badges */}
              <div className="flex items-start justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 flex-wrap font-mono">
                    <span className="px-2.5 py-0.5 rounded text-[10px] bg-cyan-950 border border-cyan-500/40 text-cyan-300 font-bold">
                      [{report.milestoneYear}] {report.milestoneCategory}
                    </span>
                    <span className="px-2.5 py-0.5 rounded text-[10px] bg-emerald-950 border border-emerald-500/40 text-emerald-300 font-bold">
                      {report.trendLabel}
                    </span>
                    <span className="text-[11px] text-amber-300 font-bold">
                      %{report.confidenceScore} Güven
                    </span>
                  </div>
                  <h4 className="font-bold text-white text-sm sm:text-base group-hover:text-cyan-300 transition-colors">
                    {report.milestoneTitle}
                  </h4>
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={(e) => handleDelete(e, report.id)}
                    className="p-2 text-slate-500 hover:text-rose-400 hover:bg-rose-950/60 rounded-xl transition-all opacity-0 group-hover:opacity-100"
                    title="Raporu Arşivden Sil"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Cover Summary */}
              <p className="text-xs text-slate-300 line-clamp-3 leading-relaxed font-sans">
                {report.summary}
              </p>

              {/* Footer Meta */}
              <div className="pt-3 border-t border-white/5 flex items-center justify-between text-[11px] text-slate-400 font-mono">
                <span className="flex items-center gap-1.5 text-slate-500">
                  <Clock className="w-3.5 h-3.5" />
                  <span><strong>Üretim Zamanı:</strong> {report.createdAt}</span>
                </span>

                <span className="text-cyan-400 group-hover:translate-x-1 transition-transform font-bold flex items-center gap-1">
                  <span>Raporu Oku (0⚡)</span>
                  <Maximize2 className="w-3 h-3" />
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

    </div>
  );
};
