import React, { useState } from "react";
import { Milestone, ViewMode, TelegramFeedItem } from "../types";
import { UserProfile } from "./UserAuthModal";
import { X, Sparkles, Share2, Compass, Cpu, TrendingUp, ShieldAlert, BookOpen, Layers } from "lucide-react";
import { getFiveLayerWorldState } from "../utils/worldStateResolver";
import { MilestoneJobImpactModal } from "./MilestoneJobImpactModal";

interface MilestoneDetailModalProps {
  milestone: Milestone;
  onClose: () => void;
  onSelectMilestone?: (year: number) => void;
  onOpenShareCard?: (milestone: Milestone) => void;
  currentUser?: UserProfile | null;
  onOpenAuthModal?: () => void;
  onOpenCreditStore?: () => void;
  onNavigateToView?: (view: ViewMode, targetYear?: number) => void;
  initialTab?: string;
  liveSignals?: TelegramFeedItem[];
}

export const MilestoneDetailModal: React.FC<MilestoneDetailModalProps> = ({
  milestone,
  onClose,
  onSelectMilestone,
  onOpenShareCard,
  currentUser,
  onNavigateToView,
}) => {
  const [activeTab, setActiveTab] = useState<"overview" | "layers" | "ethics">("overview");
  const worldState = getFiveLayerWorldState(milestone, currentUser?.age ? 2026 - currentUser.age : 1995);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-3xl bg-slate-900 border border-purple-500/30 rounded-3xl p-6 sm:p-8 shadow-2xl overflow-y-auto max-h-[90vh] space-y-6">
        <button
          type="button"
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-all cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3">
          <span className="px-3 py-1 rounded-xl bg-purple-500/20 text-purple-300 font-mono text-xs font-bold border border-purple-500/30">
            {milestone.year}
          </span>
          <span className="text-xs text-slate-400 font-mono uppercase">{milestone.category}</span>
        </div>

        <div>
          <h2 className="text-2xl font-bold text-white">{milestone.title}</h2>
          <p className="text-sm text-slate-300 mt-2 leading-relaxed">{milestone.description}</p>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 border-b border-white/10 pb-3">
          <button
            type="button"
            onClick={() => setActiveTab("overview")}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === "overview" ? "bg-purple-600 text-white" : "text-slate-400 hover:text-white"
            }`}
          >
            Genel Bakış
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("layers")}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === "layers" ? "bg-purple-600 text-white" : "text-slate-400 hover:text-white"
            }`}
          >
            5 Katmanlı Dünya Durumu
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("ethics")}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === "ethics" ? "bg-purple-600 text-white" : "text-slate-400 hover:text-white"
            }`}
          >
            Riskler & Fırsatlar
          </button>
        </div>

        {activeTab === "overview" && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono">
              <div className="p-3 rounded-xl bg-slate-950 border border-white/10">
                <span className="text-slate-400">Olasılık</span>
                <p className="text-emerald-400 text-base font-bold">%{milestone.probability}</p>
              </div>
              <div className="p-3 rounded-xl bg-slate-950 border border-white/10">
                <span className="text-slate-400">Etki Seviyesi</span>
                <p className="text-blue-400 text-base font-bold">%{milestone.impactLevel}</p>
              </div>
              <div className="p-3 rounded-xl bg-slate-950 border border-white/10">
                <span className="text-slate-400">TRL Seviyesi</span>
                <p className="text-purple-400 text-base font-bold">TRL {worldState.scientificReadiness.trlLevel}</p>
              </div>
              <div className="p-3 rounded-xl bg-slate-950 border border-white/10">
                <span className="text-slate-400">AI Otonomi</span>
                <p className="text-cyan-400 text-base font-bold">%{milestone.aiAutonomyIndex || 50}</p>
              </div>
            </div>

            {milestone.dailyLifeImpact && (
              <div className="p-4 rounded-2xl bg-white/5 border border-white/10 text-xs">
                <span className="font-bold text-amber-300 font-mono">GÜNLÜK HAYATA ETKİSİ:</span>
                <p className="text-slate-300 mt-1">{milestone.dailyLifeImpact}</p>
              </div>
            )}
          </div>
        )}

        {activeTab === "layers" && (
          <div className="space-y-3 text-xs">
            <div className="p-3 rounded-xl bg-cyan-950/30 border border-cyan-500/20">
              <span className="font-bold text-cyan-400">🌐 Bilişim & Altyapı:</span>
              <p className="text-slate-300 mt-1">{worldState.technologicalBreakthroughs.aiAndComputing}</p>
            </div>
            <div className="p-3 rounded-xl bg-emerald-950/30 border border-emerald-500/20">
              <span className="font-bold text-emerald-400">👤 Biyo-Yaşam & Sen:</span>
              <p className="text-slate-300 mt-1">{worldState.dailyLifeAndBio.morningRoutineSnippet}</p>
            </div>
            <div className="p-3 rounded-xl bg-amber-950/30 border border-amber-500/20">
              <span className="font-bold text-amber-400">💼 İş & Ekonomi:</span>
              <p className="text-slate-300 mt-1">Tahmini Otomasyon Oranı: %{worldState.macroEconomicsAndGeo.automatedJobsRate}</p>
            </div>
          </div>
        )}

        {activeTab === "ethics" && (
          <div className="space-y-3 text-xs">
            <div className="p-3 rounded-xl bg-rose-950/30 border border-rose-500/20">
              <span className="font-bold text-rose-400">⚠️ Etik Riskler:</span>
              <ul className="list-disc list-inside text-slate-300 mt-1 space-y-1">
                {(milestone.ethicalRisks || []).map((r, i) => (
                  <li key={i}>{r}</li>
                ))}
              </ul>
            </div>
            <div className="p-3 rounded-xl bg-emerald-950/30 border border-emerald-500/20">
              <span className="font-bold text-emerald-400">✨ Toplumsal Fırsatlar:</span>
              <ul className="list-disc list-inside text-slate-300 mt-1 space-y-1">
                {(milestone.societalOpportunities || []).map((o, i) => (
                  <li key={i}>{o}</li>
                ))}
              </ul>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-white/10">
          {onOpenShareCard && (
            <button
              type="button"
              onClick={() => onOpenShareCard(milestone)}
              className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white text-xs font-bold flex items-center gap-2 transition-all cursor-pointer"
            >
              <Share2 className="w-4 h-4" />
              <span>Kartı Paylaş</span>
            </button>
          )}

          {onNavigateToView && (
            <button
              type="button"
              onClick={() => onNavigateToView("roadmap", milestone.year)}
              className="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold flex items-center gap-2 shadow-lg shadow-purple-500/20 transition-all cursor-pointer"
            >
              <Sparkles className="w-4 h-4" />
              <span>Kişisel Yol Haritasına Ekle</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
