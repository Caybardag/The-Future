import React, { useState } from "react";
import {
  Copy,
  Check,
  Cpu,
  Layers,
  ShieldCheck,
  AlertTriangle,
  Zap,
  Download,
  Info,
} from "lucide-react";
import { Milestone } from "../types";
import {
  getTechnicalProfileForYear,
  TechnicalParameterItem,
} from "../data/milestoneTechnicalParameters";

interface MilestoneTechnicalDataTableProps {
  milestone: Milestone;
  compact?: boolean;
}

export const MilestoneTechnicalDataTable: React.FC<MilestoneTechnicalDataTableProps> = ({
  milestone,
  compact = false,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [copied, setCopied] = useState<boolean>(false);

  const profile = getTechnicalProfileForYear(milestone.year);

  if (!profile) {
    return (
      <div className="p-4 rounded-xl bg-slate-900/60 border border-white/10 text-xs text-slate-400 font-mono">
        {milestone.year} yılı için teknik parametre matrisi hazırlanıyor...
      </div>
    );
  }

  const allParams = profile.parameters || [];
  const filteredParams =
    selectedCategory === "all"
      ? allParams
      : allParams.filter((p) => p.category === selectedCategory);

  const categories = Array.from(new Set(allParams.map((p) => p.category)));

  const handleCopyTable = () => {
    const textData = [
      `=== ${milestone.year} · ${milestone.title} TEKNİK SPESİFİKASYON TABLOSU ===`,
      `Alan: ${profile.primaryDomain} | TRL Aşaması: ${profile.trlStage}/9`,
      `Teorik Sınır: ${profile.theoreticalBoundary}`,
      `Referans: ${profile.academicCitationReference || "IEEE/Nature Benchmark"}`,
      "",
      ...allParams.map(
        (p, idx) =>
          `[${idx + 1}] ${p.name}\n  - Hedef: ${p.targetValue}\n  - 2026 Durumu: ${p.current2026Status}\n  - Doğrulama/Sınır: ${p.verificationLimit}\n  - Kategori: ${p.category} | Durum: ${p.status}`
      ),
    ].join("\n");

    navigator.clipboard.writeText(textData);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleExportCsv = () => {
    const headers = ["Parametre", "Hedef Değer", "2026 Başlangıç", "Doğrulama / Fiziksel Sınır", "Kategori", "Durum"];
    const rows = allParams.map((p) => [
      `"${p.name.replace(/"/g, '""')}"`,
      `"${p.targetValue.replace(/"/g, '""')}"`,
      `"${p.current2026Status.replace(/"/g, '""')}"`,
      `"${p.verificationLimit.replace(/"/g, '""')}"`,
      `"${p.category}"`,
      `"${p.status}"`,
    ]);

    const csvContent = "data:text/csv;charset=utf-8,\uFEFF" + [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `teknik_parametreler_${milestone.year}_${milestone.title.slice(0, 20)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-3 font-sans">
      {/* Header bar: Unboxed metadata and precision controls */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/10 pb-2.5">
        <div className="space-y-0.5">
          <div className="flex items-center gap-2 text-xs text-slate-400 font-mono">
            <span className="text-cyan-400 font-bold uppercase">{profile.primaryDomain}</span>
            <span aria-hidden="true">·</span>
            <span className="text-slate-300">TRL Aşama {profile.trlStage}/9</span>
            <span aria-hidden="true">·</span>
            <span>{allParams.length} Ölçülebilir Parametre</span>
          </div>
          <div className="text-[11px] text-slate-400 font-mono flex items-center gap-1.5 pt-0.5">
            <ShieldCheck className="w-3.5 h-3.5 text-purple-400 shrink-0" />
            <span>Teorik Çeper: <strong className="text-slate-200 font-semibold">{profile.theoreticalBoundary}</strong></span>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-1.5 shrink-0">
          <button
            type="button"
            onClick={handleCopyTable}
            className="px-2.5 py-1 rounded-lg bg-slate-900 border border-white/10 hover:border-cyan-500/40 text-slate-300 hover:text-white text-xs font-mono flex items-center gap-1.5 transition-colors cursor-pointer"
            title="Tabloyu Metin Olarak Kopyala"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? "Kopyalandı" : "Kopyala"}</span>
          </button>
          <button
            type="button"
            onClick={handleExportCsv}
            className="px-2.5 py-1 rounded-lg bg-slate-900 border border-white/10 hover:border-cyan-500/40 text-slate-300 hover:text-white text-xs font-mono flex items-center gap-1.5 transition-colors cursor-pointer"
            title="CSV Dosyası Olarak İndir"
          >
            <Download className="w-3.5 h-3.5 text-cyan-400" />
            <span>CSV İndir</span>
          </button>
        </div>
      </div>

      {/* Segmented Filter Controls */}
      {categories.length > 1 && !compact && (
        <div className="flex items-center gap-1 p-1 bg-slate-950 rounded-xl border border-white/5 overflow-x-auto scrollbar-none">
          <button
            type="button"
            onClick={() => setSelectedCategory("all")}
            className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors cursor-pointer whitespace-nowrap ${
              selectedCategory === "all"
                ? "bg-slate-800 text-white font-semibold shadow-sm"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            Tüm Parametreler ({allParams.length})
          </button>
          {categories.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors cursor-pointer whitespace-nowrap ${
                selectedCategory === cat
                  ? "bg-slate-800 text-white font-semibold shadow-sm"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      )}

      {/* Scientific Data Table */}
      <div className="overflow-x-auto rounded-xl border border-white/10 bg-slate-950/90 shadow-inner">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="border-b border-white/10 bg-slate-900/90 font-mono text-[11px] text-slate-400 uppercase tracking-wider">
              <th scope="col" className="py-2.5 px-3.5 font-bold">Teknik Parametre</th>
              <th scope="col" className="py-2.5 px-3.5 font-bold text-cyan-400">Hedef Değer</th>
              <th scope="col" className="py-2.5 px-3.5 font-bold text-slate-300">2026 Mevcut Durum</th>
              <th scope="col" className="py-2.5 px-3.5 font-bold text-amber-400">Fiziksel / Doğrulama Limiti</th>
              <th scope="col" className="py-2.5 px-3.5 font-bold text-slate-400">Durum</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5 text-slate-200">
            {filteredParams.map((param, index) => {
              const isEven = index % 2 === 0;
              return (
                <tr
                  key={param.id}
                  className={`hover:bg-cyan-950/20 transition-colors ${
                    isEven ? "bg-slate-950/40" : "bg-slate-900/30"
                  }`}
                >
                  {/* Parameter Name & Category */}
                  <td className="py-3 px-3.5 align-top">
                    <div className="font-semibold text-white tracking-tight leading-snug">
                      {param.name}
                    </div>
                    <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                      {param.category}
                    </div>
                    {param.notes && (
                      <div className="text-[11px] text-amber-300/90 italic mt-1 leading-normal">
                        ℹ️ {param.notes}
                      </div>
                    )}
                  </td>

                  {/* Target Value */}
                  <td className="py-3 px-3.5 align-top font-mono tabular-nums font-bold text-cyan-300 whitespace-nowrap">
                    {param.targetValue}
                  </td>

                  {/* 2026 Current Baseline */}
                  <td className="py-3 px-3.5 align-top font-mono tabular-nums text-slate-300 whitespace-nowrap">
                    {param.current2026Status}
                  </td>

                  {/* Verification / Physical Limit */}
                  <td className="py-3 px-3.5 align-top text-[11px] text-amber-200/90 font-mono leading-relaxed">
                    <div className="flex items-start gap-1">
                      <span className="text-amber-400 font-bold shrink-0">•</span>
                      <span>{param.verificationLimit}</span>
                    </div>
                  </td>

                  {/* Status Indicator */}
                  <td className="py-3 px-3.5 align-top font-mono text-[10px] whitespace-nowrap">
                    {param.status === "VERIFIED" && (
                      <span className="text-emerald-400 font-bold flex items-center gap-1">
                        <Check className="w-3 h-3" /> Doğrulandı
                      </span>
                    )}
                    {param.status === "IN_PROGRESS" && (
                      <span className="text-cyan-400 font-bold flex items-center gap-1">
                        <Cpu className="w-3 h-3" /> Geliştiriliyor
                      </span>
                    )}
                    {param.status === "THEORETICAL_LIMIT" && (
                      <span className="text-amber-400 font-bold flex items-center gap-1">
                        <AlertTriangle className="w-3 h-3" /> Teorik Limit
                      </span>
                    )}
                    {param.status === "REGULATORY_PENDING" && (
                      <span className="text-purple-400 font-bold flex items-center gap-1">
                        <Layers className="w-3 h-3" /> Regülasyon Bekliyor
                      </span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Citation and Academic Provenance Note */}
      <div className="p-2.5 rounded-lg bg-slate-900/50 border border-white/5 flex flex-wrap items-center justify-between gap-2 text-[10px] text-slate-400 font-mono">
        <div className="flex items-center gap-1.5">
          <Info className="w-3 h-3 text-cyan-400 shrink-0" />
          <span>Kaynak: {profile.academicCitationReference || "IEEE & Nature Bilimsel Konsensus Modeli"}</span>
        </div>
        <span className="text-slate-300">
          * Parametreler termodinamik ve ampirik AR-GE modellerine göre hesaplanmıştır.
        </span>
      </div>
    </div>
  );
};

export default MilestoneTechnicalDataTable;
