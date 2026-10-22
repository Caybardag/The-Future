import React, { useEffect, useState } from "react";
import { Sparkles, Info, X, RefreshCw, Zap, ShieldAlert } from "lucide-react";
import { useLanguage } from "../context/LanguageContext";
import { LanguageCode } from "../types";

export interface ChangeLogEntry {
  id: string;
  title: string;
  featureName: string;
  changeReason: string;
  detail: string;
  timestamp: string;
  type: "scenario" | "agent_update" | "filter" | "conflict" | "system";
  badgeLabel?: string;
}

interface ChangeLogToastProps {
  logs: ChangeLogEntry[];
  onDismiss: (id: string) => void;
}

const TOAST_LOCALIZED: Record<LanguageCode, {
  toastHeader: string;
  changedFeature: string;
  whyChanged: string;
}> = {
  tr: {
    toastHeader: "📝 DEĞİŞİM GÜNLÜĞÜ BİLDİRİMİ",
    changedFeature: "Değişen Özellik",
    whyChanged: "Neden Değişti?",
  },
  en: {
    toastHeader: "📝 CHANGE LOG NOTIFICATION",
    changedFeature: "Changed Feature",
    whyChanged: "Why Did It Change?",
  },
  es: {
    toastHeader: "📝 REGISTRO DE CAMBIOS",
    changedFeature: "Función Modificada",
    whyChanged: "¿Por qué cambió?",
  },
  de: {
    toastHeader: "📝 ÄNDERUNGSPROTOKOLL",
    changedFeature: "Geänderte Funktion",
    whyChanged: "Warum geändert?",
  },
  fr: {
    toastHeader: "📝 JOURNAL DES MODIFICATIONS",
    changedFeature: "Fonctionnalité Modifiée",
    whyChanged: "Pourquoi cela a changé ?",
  },
  zh: {
    toastHeader: "📝 变更日志通知",
    changedFeature: "变更功能",
    whyChanged: "变更原因",
  },
  ja: {
    toastHeader: "📝 変更ログ通知",
    changedFeature: "変更された機能",
    whyChanged: "変更理由",
  },
};

export const ChangeLogToastContainer: React.FC<ChangeLogToastProps> = ({ logs, onDismiss }) => {
  if (!logs || logs.length === 0) return null;

  return (
    <div className="fixed bottom-3 right-3 left-3 sm:left-auto sm:right-5 sm:bottom-5 z-40 flex flex-col gap-2 max-w-sm sm:max-w-md w-auto pointer-events-none font-mono text-xs">
      {logs.map((log) => (
        <ChangeLogToastItem key={log.id} log={log} onDismiss={onDismiss} />
      ))}
    </div>
  );
};

const ChangeLogToastItem: React.FC<{ log: ChangeLogEntry; onDismiss: (id: string) => void }> = ({
  log,
  onDismiss,
}) => {
  const { language } = useLanguage();
  const [isVisible, setIsVisible] = useState(true);
  const [isExpanded, setIsExpanded] = useState(false);

  const loc = TOAST_LOCALIZED[language] || TOAST_LOCALIZED["en"];

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(() => onDismiss(log.id), 300);
    }, 6000);
    return () => clearTimeout(timer);
  }, [log.id, onDismiss]);

  const getIcon = () => {
    switch (log.type) {
      case "scenario":
        return <Sparkles className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-purple-400 animate-pulse shrink-0" />;
      case "agent_update":
        return <Zap className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-cyan-400 shrink-0" />;
      case "conflict":
        return <ShieldAlert className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-rose-400 shrink-0" />;
      default:
        return <RefreshCw className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-400 shrink-0" />;
    }
  };

  const getBorderColor = () => {
    switch (log.type) {
      case "scenario":
        return "border-purple-500/50 bg-gradient-to-r from-purple-950/95 via-slate-900/95 to-slate-950/95 shadow-purple-900/20";
      case "agent_update":
        return "border-cyan-500/50 bg-gradient-to-r from-cyan-950/95 via-slate-900/95 to-slate-950/95 shadow-cyan-900/20";
      case "conflict":
        return "border-rose-500/50 bg-gradient-to-r from-rose-950/95 via-slate-900/95 to-slate-950/95 shadow-rose-900/20";
      default:
        return "border-emerald-500/50 bg-gradient-to-r from-emerald-950/95 via-slate-900/95 to-slate-950/95 shadow-emerald-900/20";
    }
  };

  return (
    <div
      className={`pointer-events-auto p-3 sm:p-4 rounded-xl sm:rounded-2xl border shadow-2xl backdrop-blur-md transition-all duration-300 transform ${
        isVisible ? "translate-y-0 opacity-100 scale-100" : "translate-y-4 opacity-0 scale-95"
      } ${getBorderColor()}`}
    >
      <div className="flex items-center justify-between gap-2 border-b border-white/10 pb-1.5 mb-1.5">
        <div className="flex items-center gap-1.5 min-w-0">
          {getIcon()}
          <span className="font-bold text-white text-[11px] sm:text-xs uppercase tracking-wider truncate">
            {loc.toastHeader}
          </span>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          <span className="text-[9px] sm:text-[10px] text-slate-400 font-mono">{log.timestamp}</span>
          <button
            type="button"
            onClick={() => {
              setIsVisible(false);
              setTimeout(() => onDismiss(log.id), 200);
            }}
            className="text-slate-400 hover:text-white transition-colors p-1 rounded-lg hover:bg-white/10 cursor-pointer"
            aria-label="Kapat"
          >
            <X className="w-3.5 h-3.5 text-rose-400 sm:text-slate-400" />
          </button>
        </div>
      </div>

      <div className="space-y-1 font-sans">
        <div
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex items-center justify-between gap-2 cursor-pointer hover:opacity-90"
        >
          <h4 className="font-bold text-white text-[11px] sm:text-xs truncate">{log.title}</h4>
          <div className="flex items-center gap-1 shrink-0">
            {log.badgeLabel && (
              <span className="px-1.5 py-0.5 rounded bg-slate-800 text-[8px] sm:text-[9px] font-mono font-bold text-cyan-300 border border-white/10 shrink-0">
                {log.badgeLabel}
              </span>
            )}
            <span className="text-[10px] text-cyan-400 sm:hidden">
              {isExpanded ? "▲" : "▼"}
            </span>
          </div>
        </div>

        {/* Detailed Box - Always visible on desktop, toggleable/compact on small mobile */}
        <div className={`${isExpanded ? "block" : "hidden sm:block"} text-[10px] sm:text-[11px] text-slate-300 leading-relaxed font-mono bg-slate-950/70 p-2 sm:p-2.5 rounded-xl border border-white/5 space-y-1 mt-1`}>
          <div className="text-cyan-400 font-bold text-[9px] sm:text-[10px] uppercase flex items-center gap-1">
            <Info className="w-3 h-3 shrink-0" />
            <span className="truncate">{loc.changedFeature}: <strong className="text-white">{log.featureName}</strong></span>
          </div>
          <p className="text-slate-200 font-sans text-[11px] sm:text-xs">{log.detail}</p>
          <div className="text-amber-300/90 text-[9px] sm:text-[10px] pt-1 border-t border-white/10 italic">
            💡 <strong>{loc.whyChanged}</strong> {log.changeReason}
          </div>
        </div>
      </div>
    </div>
  );
};
