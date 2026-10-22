import React, { useState, useRef } from "react";
import { Milestone } from "../types";
import { X, Download, Share2, Copy, Check, Sparkles, Image as ImageIcon, ShieldCheck, ArrowLeft } from "lucide-react";
import { useLanguage } from "../context/LanguageContext";
import { translateCategory } from "../utils/translations";

interface ShareableCardModalProps {
  milestone: Milestone | null;
  onClose: () => void;
}

export const ShareableCardModal: React.FC<ShareableCardModalProps> = ({
  milestone,
  onClose,
}) => {
  const { language, t } = useLanguage();
  const [theme, setTheme] = useState<"cyan" | "neon" | "gold" | "dark">("cyan");
  const [customQuote, setCustomQuote] = useState<string>("");
  const [copied, setCopied] = useState<boolean>(false);
  const cardRef = useRef<HTMLDivElement>(null);

  if (!milestone) return null;

  const handleCopyLinkText = () => {
    const textToCopy = `🚀 ${milestone.year} - ${milestone.title}
${milestone.description}

📍 Kategori: ${translateCategory(milestone.category, language)}
⚡ Etki Seviyesi: %${milestone.impactLevel}
🤖 Yapay Zeka Otonomisi: %${milestone.aiAutonomyIndex}

${customQuote ? `💬 "${customQuote}"\n` : ""}
Teknolojik Evrim Takvimi (2026-2060): ${window.location.href}`;

    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadImage = () => {
    if (!cardRef.current) return;

    // Use HTML Canvas drawing to render a high-res image of the card
    const canvas = document.createElement("canvas");
    canvas.width = 1200;
    canvas.height = 630;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Theme colors
    let bgGradStart = "#0B0F19";
    let bgGradEnd = "#050507";
    let accentColor = "#00F2FE";
    let subAccent = "#3B82F6";

    if (theme === "neon") {
      bgGradStart = "#1A0933";
      bgGradEnd = "#0A0217";
      accentColor = "#D946EF";
      subAccent = "#8B5CF6";
    } else if (theme === "gold") {
      bgGradStart = "#1F1501";
      bgGradEnd = "#080500";
      accentColor = "#F59E0B";
      subAccent = "#10B981";
    } else if (theme === "dark") {
      bgGradStart = "#111827";
      bgGradEnd = "#030712";
      accentColor = "#E2E8F0";
      subAccent = "#94A3B8";
    }

    // Draw background gradient
    const grad = ctx.createLinearGradient(0, 0, 1200, 630);
    grad.addColorStop(0, bgGradStart);
    grad.addColorStop(1, bgGradEnd);
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 1200, 630);

    // Draw grid pattern lines
    ctx.strokeStyle = "rgba(255, 255, 255, 0.04)";
    ctx.lineWidth = 1;
    for (let x = 0; x < 1200; x += 40) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, 630);
      ctx.stroke();
    }
    for (let y = 0; y < 630; y += 40) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(1200, y);
      ctx.stroke();
    }

    // Border frame
    ctx.strokeStyle = accentColor;
    ctx.lineWidth = 4;
    ctx.strokeRect(30, 30, 1140, 570);

    // Top Badge Header
    ctx.fillStyle = accentColor;
    ctx.font = "bold 20px monospace";
    ctx.fillText("TEKNOLOJİK EVRİM TAKVİMİ // 2026-2060", 60, 80);

    ctx.fillStyle = "#94A3B8";
    ctx.font = "16px monospace";
    ctx.fillText("ALGORİTMİK PROJEKSİYON RAPORU", 60, 105);

    // Year Badge
    ctx.fillStyle = accentColor;
    ctx.font = "bold 90px monospace";
    ctx.fillText(milestone.year.toString(), 60, 220);

    // Title
    ctx.fillStyle = "#FFFFFF";
    ctx.font = "bold 36px sans-serif";
    ctx.fillText(milestone.title, 60, 280);

    // Category pill
    ctx.fillStyle = subAccent;
    ctx.font = "bold 18px monospace";
    ctx.fillText(`Kategori: ${translateCategory(milestone.category, language).toUpperCase()}`, 60, 320);

    // Description text wrapping
    ctx.fillStyle = "#CBD5E1";
    ctx.font = "20px sans-serif";
    const words = milestone.description.split(" ");
    let line = "";
    let yPos = 375;
    for (let n = 0; n < words.length; n++) {
      const testLine = line + words[n] + " ";
      const metrics = ctx.measureText(testLine);
      if (metrics.width > 1000 && n > 0) {
        ctx.fillText(line, 60, yPos);
        line = words[n] + " ";
        yPos += 30;
      } else {
        line = testLine;
      }
    }
    ctx.fillText(line, 60, yPos);

    // Custom Quote if present
    if (customQuote) {
      yPos += 45;
      ctx.fillStyle = accentColor;
      ctx.font = "italic 22px sans-serif";
      ctx.fillText(`"${customQuote}"`, 60, yPos);
    }

    // Bottom Stats & Branding
    ctx.fillStyle = "#64748B";
    ctx.font = "bold 16px monospace";
    ctx.fillText(`Etki Seviyesi: %${milestone.impactLevel}  |  AI Otonomisi: %${milestone.aiAutonomyIndex}  |  İnsan Artırımı: %${milestone.humanAugmentationIndex}`, 60, 560);

    ctx.fillStyle = "#94A3B8";
    ctx.fillText("ai.studio/build // 2026-2060 Technological Evolution", 750, 560);

    // Trigger download
    const link = document.createElement("a");
    link.download = `Milestone_${milestone.year}_${milestone.title.replace(/\s+/g, "_")}.png`;
    link.href = canvas.toDataURL("image/png");
    link.click();
  };

  const getThemeClasses = () => {
    switch (theme) {
      case "neon":
        return "from-purple-950 via-slate-950 to-pink-950 border-pink-500/40 text-pink-300 shadow-pink-500/10";
      case "gold":
        return "from-amber-950 via-slate-950 to-emerald-950 border-amber-500/40 text-amber-300 shadow-amber-500/10";
      case "dark":
        return "from-slate-900 via-slate-950 to-gray-950 border-slate-700 text-slate-200 shadow-slate-900/50";
      default:
        return "from-blue-950 via-slate-950 to-cyan-950 border-cyan-500/40 text-cyan-300 shadow-cyan-500/10";
    }
  };

  return (
    <div
      className="fixed inset-0 z-[130] bg-black/85 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 overflow-y-auto animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="bg-[#0B0F19] border border-cyan-500/40 rounded-2xl sm:rounded-3xl max-w-2xl w-full p-3.5 sm:p-6 space-y-3 sm:space-y-5 relative shadow-2xl max-h-[92dvh] overflow-y-auto flex flex-col my-auto scrollbar-thin scrollbar-thumb-white/10"
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/5 pb-3">
          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white transition-all border border-white/10 flex items-center gap-1.5 font-mono text-xs font-bold cursor-pointer"
              title="Geri Dön"
            >
              <ArrowLeft className="w-4 h-4 text-cyan-400" />
              <span>{language === "en" ? "Back" : "Geri Dön"}</span>
            </button>

            <div className="h-4 w-[1px] bg-white/10 mx-1 hidden sm:block" />

            <div className="flex items-center gap-2">
              <Share2 className="w-4 h-4 text-cyan-400 hidden sm:block" />
              <h3 className="text-xs sm:text-base font-bold text-white font-mono uppercase tracking-wider">
                {language === "en" ? "Social Media Card" : "Sosyal Medya Kartı"}
              </h3>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white transition-all border border-white/5 cursor-pointer"
            title={language === "en" ? "Close" : "Kapat"}
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Theme Selector Controls */}
        <div className="space-y-1.5 font-mono text-[11px] sm:text-xs">
          <label className="text-slate-400 uppercase font-bold text-[10px] sm:text-xs">
            {language === "en" ? "SELECT CARD THEME STYLE:" : "KART TEMA SİTİLİ SEÇİN:"}
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 sm:gap-2">
            
            <button
              onClick={() => setTheme("cyan")}
              className={`p-2 sm:p-2.5 rounded-xl border flex items-center justify-center gap-1.5 sm:gap-2 font-bold transition-all cursor-pointer text-[11px] sm:text-xs ${
                theme === "cyan"
                  ? "bg-cyan-500/20 border-cyan-400 text-cyan-300"
                  : "bg-slate-900 border-white/5 text-slate-400 hover:bg-slate-800"
              }`}
            >
              <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 shrink-0" />
              <span className="truncate">Cyber Cyan</span>
            </button>

            <button
              onClick={() => setTheme("neon")}
              className={`p-2 sm:p-2.5 rounded-xl border flex items-center justify-center gap-1.5 sm:gap-2 font-bold transition-all cursor-pointer text-[11px] sm:text-xs ${
                theme === "neon"
                  ? "bg-pink-500/20 border-pink-400 text-pink-300"
                  : "bg-slate-900 border-white/5 text-slate-400 hover:bg-slate-800"
              }`}
            >
              <span className="w-2.5 h-2.5 rounded-full bg-pink-400 shrink-0" />
              <span className="truncate">Neon Hologram</span>
            </button>

            <button
              onClick={() => setTheme("gold")}
              className={`p-2 sm:p-2.5 rounded-xl border flex items-center justify-center gap-1.5 sm:gap-2 font-bold transition-all cursor-pointer text-[11px] sm:text-xs ${
                theme === "gold"
                  ? "bg-amber-500/20 border-amber-400 text-amber-300"
                  : "bg-slate-900 border-white/5 text-slate-400 hover:bg-slate-800"
              }`}
            >
              <span className="w-2.5 h-2.5 rounded-full bg-amber-400 shrink-0" />
              <span className="truncate">Quantum Gold</span>
            </button>

            <button
              onClick={() => setTheme("dark")}
              className={`p-2 sm:p-2.5 rounded-xl border flex items-center justify-center gap-1.5 sm:gap-2 font-bold transition-all cursor-pointer text-[11px] sm:text-xs ${
                theme === "dark"
                  ? "bg-slate-700/50 border-slate-400 text-white"
                  : "bg-slate-900 border-white/5 text-slate-400 hover:bg-slate-800"
              }`}
            >
              <span className="w-2.5 h-2.5 rounded-full bg-slate-300 shrink-0" />
              <span className="truncate">Minimal Dark</span>
            </button>

          </div>
        </div>

        {/* Custom Note input */}
        <div className="space-y-1 font-mono text-[11px] sm:text-xs">
          <label className="text-slate-400 uppercase font-bold text-[10px] sm:text-xs">
            {language === "en" ? "ADD PERSONAL COMMENT OR NOTE (OPTIONAL):" : "KİŞİSEL YORUM VEYA NOT EKLE (OPSİYONEL):"}
          </label>
          <input
            type="text"
            value={customQuote}
            onChange={(e) => setCustomQuote(e.target.value)}
            placeholder={language === "en" ? "E.g. This tech will revolutionize our workflow by 2030!" : "Örn: Bu teknoloji 2030'a kadar tüm iş akışımızı baştan yazacak!"}
            className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500"
          />
        </div>

        {/* LIVE CARD PREVIEW (Fully responsive without clipping) */}
        <div
          ref={cardRef}
          className={`bg-gradient-to-br ${getThemeClasses()} border-2 rounded-2xl p-4 sm:p-6 lg:p-8 space-y-3 sm:space-y-4 shadow-2xl relative overflow-hidden font-sans`}
        >
          {/* Subtle Grid overlay */}
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff08_1px,transparent_1px),linear-gradient(to_bottom,#ffffff08_1px,transparent_1px)] bg-[size:16px_16px] pointer-events-none" />

          <div className="flex items-center justify-between border-b border-white/10 pb-2.5 relative z-10 font-mono text-[10px] sm:text-xs">
            <div className="flex items-center gap-1.5 sm:gap-2 font-bold tracking-wider truncate">
              <Sparkles className="w-3.5 h-3.5 shrink-0" />
              <span className="truncate">2026-2060 TEKNOLOJİK EVRİM TAKVİMİ</span>
            </div>
            <span className="px-2 py-0.5 rounded bg-white/10 border border-white/10 text-[9px] sm:text-[10px] shrink-0 ml-2">
              VERİ ONAYLI HARİTA
            </span>
          </div>

          <div className="space-y-2 relative z-10">
            <div className="flex items-baseline gap-2.5 sm:gap-3 flex-wrap">
              <span className="text-3xl sm:text-4xl lg:text-5xl font-black font-mono tracking-tight text-white">
                {milestone.year}
              </span>
              <span className="text-[10px] sm:text-xs font-mono px-2 py-0.5 sm:px-2.5 sm:py-1 rounded bg-white/10 border border-white/10 font-bold uppercase text-cyan-200">
                {translateCategory(milestone.category, language)}
              </span>
            </div>

            <h2 className="text-base sm:text-xl lg:text-2xl font-bold text-white tracking-tight leading-snug">
              {milestone.title}
            </h2>

            <p className="text-[11px] sm:text-xs lg:text-sm text-slate-300 leading-relaxed font-mono">
              {milestone.description}
            </p>

            {customQuote && (
              <div className="p-2 sm:p-3 rounded-xl bg-white/5 border border-white/10 italic text-[11px] sm:text-xs text-white">
                "{customQuote}"
              </div>
            )}
          </div>

          <div className="pt-2.5 border-t border-white/10 flex items-center justify-between text-[10px] sm:text-[11px] font-mono text-slate-400 relative z-10">
            <div className="flex items-center gap-2 sm:gap-3">
              <span>Etki: %{milestone.impactLevel}</span>
              <span>AI: %{milestone.aiAutonomyIndex}</span>
            </div>
            <span className="text-slate-400 text-[10px]">ai.studio/build</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 font-mono text-xs pt-1 border-t border-white/5">
          <button
            onClick={handleDownloadImage}
            className="flex-1 py-2.5 sm:py-3 px-4 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-black flex items-center justify-center gap-2 transition-all shadow-lg shadow-cyan-500/20 cursor-pointer text-xs"
          >
            <Download className="w-4 h-4" />
            <span>{language === "en" ? "DOWNLOAD CARD (PNG)" : "GÖRSELİ İNDİR (PNG)"}</span>
          </button>

          <button
            onClick={handleCopyLinkText}
            className="py-2.5 sm:py-3 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 border border-white/10 text-slate-200 font-bold flex items-center justify-center gap-2 transition-all cursor-pointer text-xs"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
            <span>{copied ? (language === "en" ? "Copied!" : "Kopyalandı") : (language === "en" ? "Copy Text" : "Metni Kopyala")}</span>
          </button>
        </div>

      </div>
    </div>
  );
};
