import React from "react";
import {
  ShieldCheck,
  Sparkles,
  FileText,
  HelpCircle,
  CheckCircle2,
  Clock,
  Compass,
  MessageSquare,
  BarChart3,
  Mail,
  ExternalLink,
  Lock,
  Globe,
  Radio,
} from "lucide-react";
import { useLanguage } from "../context/LanguageContext";
import { ViewMode } from "../types";

interface CorporateFooterProps {
  onOpenPrivacy: () => void;
  onOpenTerms: () => void;
  onOpenHelpSupport: () => void;
  onOpenSupportTicket?: () => void;
  onOpenVerification?: () => void;
  onOpenAudit?: () => void;
  onNavigateView?: (view: ViewMode) => void;
}

export const CorporateFooter: React.FC<CorporateFooterProps> = ({
  onOpenPrivacy,
  onOpenTerms,
  onOpenHelpSupport,
  onOpenSupportTicket,
  onOpenVerification,
  onOpenAudit,
  onNavigateView,
}) => {
  const { language, t } = useLanguage();
  const isTr = language === "tr";

  return (
    <footer className="border-t border-slate-800/80 bg-[#070514]/95 backdrop-blur-2xl text-slate-400 font-sans relative z-20 pt-12 pb-24 md:pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        {/* Main Grid: 4 Clean, Distinct Columns */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 lg:gap-10">
          {/* Brand & Mission Statement (Span 2 columns on lg) */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-purple-600 via-indigo-600 to-cyan-500 p-[1px] shadow-lg shadow-purple-500/20 flex items-center justify-center">
                <div className="w-full h-full bg-[#0d0922] rounded-[11px] flex items-center justify-center">
                  <Sparkles className="w-4 h-4 text-cyan-300" />
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-black text-sm tracking-tight text-white uppercase font-sans">
                  {t("app_title") || "TEKNOLOJİK EVRİM"}
                </span>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-purple-500/20 text-purple-300 font-mono font-bold border border-purple-500/40">
                  2026—2060
                </span>
              </div>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed max-w-sm font-sans">
              {isTr
                ? "2026'dan 2060'a uzanan 34 yıllık küresel teknolojik, bilişsel ve biyolojik kırılma haritası. Açık bilimsel literatür ve analitik modellemeye dayalı olasılıksal fütüroloji projeksiyonları."
                : "A 34-year strategic roadmap of global technological, cognitive, and biological transformations (2026–2060), based on open peer-reviewed literature and probabilistic futurology models."}
            </p>

            <div className="flex flex-wrap items-center gap-2 pt-1 font-mono text-[11px]">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span>{isTr ? "Sistem: Operasyonel" : "System: Operational"}</span>
              </span>
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-slate-900 border border-white/10 text-slate-400">
                <span>{isTr ? "Gelişim Aşaması 1-9 Ölçeği" : "Stage 1-9 Development Scale"}</span>
              </span>
            </div>
          </div>

          {/* Sütun 1: Ekosistem & Çekirdek Modüller */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider font-mono">
              {isTr ? "Çekirdek Ekosistem" : "Core Ecosystem"}
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <button
                  type="button"
                  onClick={() => onNavigateView?.("timeline")}
                  className="hover:text-cyan-300 transition-colors cursor-pointer flex items-center gap-1.5"
                >
                  <Clock className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                  <span>{isTr ? "Zaman Akışı (2026—2060)" : "Timeline (2026—2060)"}</span>
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onNavigateView?.("roadmap")}
                  className="hover:text-purple-300 transition-colors cursor-pointer flex items-center gap-1.5"
                >
                  <Compass className="w-3.5 h-3.5 text-purple-400 shrink-0" />
                  <span>{isTr ? "Kişisel Gelecek Planı" : "Personal Roadmap"}</span>
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onNavigateView?.("persona_chat")}
                  className="hover:text-amber-300 transition-colors cursor-pointer flex items-center gap-1.5"
                >
                  <MessageSquare className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                  <span>{isTr ? "Zaman Yolcusu Zekası" : "Time Traveler AI"}</span>
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onNavigateView?.("analytics")}
                  className="hover:text-cyan-300 transition-colors cursor-pointer flex items-center gap-1.5"
                >
                  <BarChart3 className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                  <span>{isTr ? "Bilişsel Trend Analitiği" : "Cognitive Trend Analytics"}</span>
                </button>
              </li>
            </ul>
          </div>

          {/* Sütun 2: Doğrulama & Denetim */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider font-mono">
              {isTr ? "Bilimsel Güvenilirlik" : "Scientific Trust"}
            </h4>
            <ul className="space-y-2 text-xs">
              {onOpenVerification && (
                <li>
                  <button
                    type="button"
                    onClick={onOpenVerification}
                    className="hover:text-purple-300 transition-colors cursor-pointer flex items-center gap-1.5"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5 text-purple-400 shrink-0" />
                    <span>{isTr ? "Bilimsel Literatür & Doğrulama" : "Scientific Literature & Verification"}</span>
                  </button>
                </li>
              )}
              {onOpenAudit && (
                <li>
                  <button
                    type="button"
                    onClick={onOpenAudit}
                    className="hover:text-cyan-300 transition-colors cursor-pointer flex items-center gap-1.5"
                  >
                    <ShieldCheck className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                    <span>{isTr ? "Algoritmik Denetim Raporu" : "Algorithmic Audit"}</span>
                  </button>
                </li>
              )}
              <li>
                <button
                  type="button"
                  onClick={() => onNavigateView?.("telegram_feed")}
                  className="hover:text-amber-300 transition-colors cursor-pointer flex items-center gap-1.5"
                >
                  <Radio className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                  <span>{isTr ? "Canlı Bilimsel İstihbarat" : "Live Scientific Feed"}</span>
                </button>
              </li>
            </ul>
          </div>

          {/* Sütun 3: Kurumsal Hukuk & İletişim */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider font-mono">
              {isTr ? "Hukuk & İletişim" : "Legal & Contact"}
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <button
                  type="button"
                  onClick={onOpenTerms}
                  className="hover:text-cyan-300 transition-colors cursor-pointer flex items-center gap-1.5"
                >
                  <FileText className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                  <span>{isTr ? "Kullanım Koşulları" : "Terms of Service"}</span>
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={onOpenPrivacy}
                  className="hover:text-cyan-300 transition-colors cursor-pointer flex items-center gap-1.5"
                >
                  <Lock className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                  <span>{isTr ? "Gizlilik & Çerez Politikası" : "Privacy & Cookies"}</span>
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={onOpenHelpSupport}
                  className="hover:text-purple-300 transition-colors cursor-pointer flex items-center gap-1.5"
                >
                  <HelpCircle className="w-3.5 h-3.5 text-purple-400 shrink-0" />
                  <span>{isTr ? "Yardım ve Destek Merkezi" : "Help & Documentation"}</span>
                </button>
              </li>
              {onOpenSupportTicket && (
                <li>
                  <button
                    type="button"
                    onClick={onOpenSupportTicket}
                    className="hover:text-purple-300 transition-colors cursor-pointer flex items-center gap-1.5"
                  >
                    <Mail className="w-3.5 h-3.5 text-purple-400 shrink-0" />
                    <span>{isTr ? "Kurumsal İletişim Masası" : "Contact & Support Desk"}</span>
                  </button>
                </li>
              )}
            </ul>
          </div>
        </div>

        {/* Bottom Bar: Copyright & Compliance */}
        <div className="pt-8 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-mono text-slate-500">
          <div className="text-center sm:text-left">
            <span>© 2026 - 2060 {t("app_title") || "Teknolojik Evrim Takvimi"}.</span>{" "}
            <span>{isTr ? "Tüm Hakları Saklıdır." : "All Rights Reserved."}</span>
          </div>

          <div className="flex items-center gap-3 text-[11px]">
            <span>ISO/IEC & Google Standard Veri İlkeleri</span>
            <span>•</span>
            <span className="text-slate-400">v3.9 Enterprise</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
