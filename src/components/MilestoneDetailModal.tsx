import React, { useState, useRef, useEffect } from "react";
import { Milestone } from "../types";
import { PHASES, TIMELINE_DATA } from "../data/timelineData";
import { MilestoneIcon } from "../utils/iconHelper";
import { useLanguage } from "../context/LanguageContext";
import { translateCategory } from "../utils/translations";
import { getLocalizedPhase } from "../utils/milestoneTranslations";
import { AcademicTrlRadarCard } from "./AcademicTrlRadarCard";
import { ReferenceSourcesTab } from "./ReferenceSourcesTab";
import { getRichStoryForMilestone } from "../data/milestoneRichStories";
import { calculateDynamicProbability } from "../utils/probabilityCalculator";
import { FiveLayerWorldStateView } from "./FiveLayerWorldStateView";
import {
  X,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  BookOpen,
  Share2,
  Globe,
  Binary,
  Flame,
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  Compass,
  ArrowUp,
  Layers,
  User,
  Briefcase,
  Target,
  Clock,
  AlertCircle,
  Radio,
  ExternalLink,
  Brain,
  ShieldAlert,
  Zap,
  CheckCircle2,
  Lock,
  RefreshCw
} from "lucide-react";
import { UserProfile } from "./UserAuthModal";
import { ViewMode } from "../types";
import {
  calculateMilestonePersonalImpact,
  deriveMilestoneActionPlan,
  getMilestoneActionStatus,
  setMilestoneActionStatus,
  getMilestoneActionNote,
  setMilestoneActionNote,
  getMilestoneSelectedOption,
  setMilestoneSelectedOption,
  getMilestoneReassessmentAcknowledged,
  setMilestoneReassessmentAcknowledged,
  ActionProgressStatus,
  MilestoneActionPlan
} from "../utils/personalTimelineEngine";
import { PredictionHistoryService } from "../services/predictionHistoryService";

interface MilestoneDetailModalProps {
  milestone: Milestone | null;
  onClose: () => void;
  onSelectMilestone: (year: number) => void;
  onOpenShareCard?: (m: Milestone) => void;
  currentUser?: UserProfile | null;
  onOpenAuthModal?: () => void;
  onOpenCreditStore?: () => void;
  onNavigateToView?: (view: ViewMode, targetYear?: number) => void;
  initialTab?: ModalTabId;
  liveSignals?: any[];
}

type ModalTabId = "overview" | "personal_impact" | "five_layers" | "rich_story" | "academic_radar";

interface TabDefinition {
  id: ModalTabId;
  labelTr: string;
  labelEn: string;
  icon: React.ComponentType<{ className?: string }>;
  shortLabelTr: string;
  shortLabelEn: string;
}

const MODAL_TABS: TabDefinition[] = [
  {
    id: "overview",
    labelTr: "🌍 Dünya & Küresel Etki",
    labelEn: "🌍 World & Global Impact",
    shortLabelTr: "Dünya",
    shortLabelEn: "World",
    icon: Globe,
  },
  {
    id: "personal_impact",
    labelTr: "👤 Benim İçin (Nasıl Etkiler?)",
    labelEn: "👤 For Me (How It Impacts Me)",
    shortLabelTr: "Benim İçin",
    shortLabelEn: "For Me",
    icon: User,
  },
  {
    id: "five_layers",
    labelTr: "5 Katmanlı Dünya & Biyo-Yaşam",
    labelEn: "5-Layer World & Bio-Life",
    shortLabelTr: "5 Katman",
    shortLabelEn: "5 Layers",
    icon: Layers,
  },
  {
    id: "rich_story",
    labelTr: "Gelecek Hikayesi & Senaryo",
    labelEn: "Future Story & Scenario",
    shortLabelTr: "Hikaye",
    shortLabelEn: "Story",
    icon: BookOpen,
  },
  {
    id: "academic_radar",
    labelTr: "Gelişim Aşaması & Bilimsel Radar",
    labelEn: "Development Stage & Radar",
    shortLabelTr: "Gelişim Radarı",
    shortLabelEn: "Stage Radar",
    icon: ShieldCheck,
  },
];

export const MilestoneDetailModal: React.FC<MilestoneDetailModalProps> = ({
  milestone: rawMilestone,
  onClose,
  onSelectMilestone,
  onOpenShareCard,
  currentUser,
  onOpenAuthModal,
  onOpenCreditStore,
  onNavigateToView,
  initialTab,
  liveSignals,
}) => {
  const { language, t } = useLanguage();
  const isTr = language === "tr";
  const [activeModalTab, setActiveModalTab] = useState<ModalTabId>(initialTab || "overview");
  const [actionStatus, setActionStatus] = useState<ActionProgressStatus>("seen");
  const [actionNote, setActionNote] = useState<string>("");
  const [isEditingNote, setIsEditingNote] = useState<boolean>(false);
  const [noteSavedFeedback, setNoteSavedFeedback] = useState<boolean>(false);
  const [selectedDecisionOption, setSelectedDecisionOption] = useState<"A" | "B" | "C" | null>(null);
  const [optionSavedFeedback, setOptionSavedFeedback] = useState<boolean>(false);
  const [reassessmentAcknowledged, setReassessmentAcknowledged] = useState<boolean>(false);

  // Scroll & swipe state
  const modalContentRef = useRef<HTMLDivElement>(null);
  const tabsContainerRef = useRef<HTMLDivElement>(null);
  const tabButtonRefs = useRef<Record<string, HTMLButtonElement | null>>({});
  const [canScrollLeft, setCanScrollLeft] = useState<boolean>(false);
  const [canScrollRight, setCanScrollRight] = useState<boolean>(false);
  const [touchStartX, setTouchStartX] = useState<number | null>(null);

  const personalImpact = React.useMemo(() => {
    if (!rawMilestone) return null;
    const predictions = PredictionHistoryService.getLocalPredictions(currentUser?.email);
    const roadmapRecord = predictions.find((p) => p.featureKey === "personal_roadmap");
    const jobRiskRecord = predictions.find((p) => p.featureKey === "job_risk");
    return calculateMilestonePersonalImpact(rawMilestone, currentUser, roadmapRecord, jobRiskRecord);
  }, [rawMilestone, currentUser]);

  const actionPlan = React.useMemo(() => {
    if (!rawMilestone || !personalImpact) return null;
    return deriveMilestoneActionPlan(
      rawMilestone,
      personalImpact,
      currentUser,
      selectedDecisionOption,
      actionStatus,
      actionNote,
      liveSignals || (rawMilestone as any)?.liveSignals || []
    );
  }, [rawMilestone, personalImpact, currentUser, selectedDecisionOption, actionStatus, actionNote, liveSignals]);

  const handleSelectDecisionOption = (optionId: "A" | "B" | "C") => {
    if (!rawMilestone) return;
    setMilestoneSelectedOption(rawMilestone.year, optionId, currentUser?.email);
    setSelectedDecisionOption(optionId);
    setOptionSavedFeedback(true);
    setTimeout(() => setOptionSavedFeedback(false), 3000);
  };

  const handleAcknowledgeAndAcceptReassessment = (newOption: "A" | "B" | "C") => {
    if (!rawMilestone) return;
    setMilestoneSelectedOption(rawMilestone.year, newOption, currentUser?.email);
    setSelectedDecisionOption(newOption);
    setMilestoneReassessmentAcknowledged(rawMilestone.year, true, currentUser?.email);
    setReassessmentAcknowledged(true);
    setOptionSavedFeedback(true);
    setTimeout(() => setOptionSavedFeedback(false), 3000);
  };

  const handleAcknowledgeAndKeepCurrentDecision = () => {
    if (!rawMilestone) return;
    setMilestoneReassessmentAcknowledged(rawMilestone.year, true, currentUser?.email);
    setReassessmentAcknowledged(true);
  };

  const handleResetReassessmentAcknowledgment = () => {
    if (!rawMilestone) return;
    setMilestoneReassessmentAcknowledged(rawMilestone.year, false, currentUser?.email);
    setReassessmentAcknowledged(false);
  };

  useEffect(() => {
    if (initialTab) {
      setActiveModalTab(initialTab);
      setTimeout(() => {
        const targetBtn = tabButtonRefs.current[initialTab];
        if (targetBtn && tabsContainerRef.current) {
          targetBtn.scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" });
        }
      }, 50);
    }
  }, [initialTab, rawMilestone?.year]);

  useEffect(() => {
    if (rawMilestone) {
      setActionStatus(getMilestoneActionStatus(rawMilestone.year, currentUser?.email));
      setActionNote(getMilestoneActionNote(rawMilestone.year, currentUser?.email));
      setSelectedDecisionOption(getMilestoneSelectedOption(rawMilestone.year, currentUser?.email));
      setReassessmentAcknowledged(getMilestoneReassessmentAcknowledged(rawMilestone.year, currentUser?.email));
      setIsEditingNote(false);
      setNoteSavedFeedback(false);
      setOptionSavedFeedback(false);
    }
  }, [rawMilestone?.year, currentUser?.email]);

  const checkTabScroll = () => {
    const el = tabsContainerRef.current;
    if (!el) return;
    const { scrollLeft, scrollWidth, clientWidth } = el;
    setCanScrollLeft(scrollLeft > 4);
    setCanScrollRight(scrollLeft + clientWidth < scrollWidth - 4);
  };

  useEffect(() => {
    checkTabScroll();
    const el = tabsContainerRef.current;
    if (el) {
      el.addEventListener("scroll", checkTabScroll, { passive: true });
    }
    window.addEventListener("resize", checkTabScroll);
    return () => {
      if (el) el.removeEventListener("scroll", checkTabScroll);
      window.removeEventListener("resize", checkTabScroll);
    };
  }, [rawMilestone]);

  // When milestone year changes (e.g. user clicked "2029 Yılına Git"), scroll modal to top
  useEffect(() => {
    if (modalContentRef.current) {
      modalContentRef.current.scrollTo({ top: 0, behavior: "smooth" });
    }
    // Re-check tab scroll on year switch
    setTimeout(checkTabScroll, 100);
  }, [rawMilestone?.year]);

  const handleUpdateActionStatus = (newStatus: ActionProgressStatus) => {
    if (!rawMilestone) return;
    setActionStatus(newStatus);
    setMilestoneActionStatus(rawMilestone.year, newStatus, currentUser?.email);
  };

  const activeTabIndex = MODAL_TABS.findIndex((tab) => tab.id === activeModalTab);

  const handleTabChange = (tabId: ModalTabId) => {
    setActiveModalTab(tabId);
    if (modalContentRef.current) {
      modalContentRef.current.scrollTo({ top: 0, behavior: "instant" });
    }
    const targetBtn = tabButtonRefs.current[tabId];
    if (targetBtn && tabsContainerRef.current) {
      targetBtn.scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" });
    }
    setTimeout(checkTabScroll, 200);
  };

  const scrollTabs = (direction: "left" | "right") => {
    const el = tabsContainerRef.current;
    if (!el) return;
    const scrollOffset = direction === "left" ? -180 : 180;
    el.scrollBy({ left: scrollOffset, behavior: "smooth" });
    setTimeout(checkTabScroll, 250);
  };

  // Touch swipe between tabs on mobile
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStartX(e.touches[0].clientX);
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX === null) return;
    const touchEndX = e.changedTouches[0].clientX;
    const diffX = touchEndX - touchStartX;
    const threshold = 60; // minimum pixels to trigger swipe tab switch

    if (diffX < -threshold) {
      // Swiped left -> next tab
      const nextIdx = Math.min(activeTabIndex + 1, MODAL_TABS.length - 1);
      handleTabChange(MODAL_TABS[nextIdx].id);
    } else if (diffX > threshold) {
      // Swiped right -> prev tab
      const prevIdx = Math.max(activeTabIndex - 1, 0);
      handleTabChange(MODAL_TABS[prevIdx].id);
    }
    setTouchStartX(null);
  };

  if (!rawMilestone) return null;

  const milestone = rawMilestone;
  const rawPhase = PHASES.find((p) => p.id === milestone.phase);
  const phase = rawPhase ? getLocalizedPhase(rawPhase, language) : null;
  const probData = calculateDynamicProbability(milestone.probability, milestone.year);
  const richStory = getRichStoryForMilestone(milestone.year, milestone.description);

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-5 bg-slate-950/85 backdrop-blur-md animate-fadeIn"
    >
      <div
        ref={modalContentRef}
        className="relative w-full max-w-3xl max-h-[90vh] overflow-y-auto bg-slate-900 border border-white/15 rounded-3xl p-5 sm:p-7 shadow-2xl space-y-5 text-slate-100 scrollbar-thin scrollbar-thumb-slate-800"
        onClick={(e) => e.stopPropagation()}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        {/* Top Action Buttons */}
        <div className="absolute top-4 right-4 sm:top-6 sm:right-6 flex items-center gap-2 z-10">
          <button
            onClick={() => {
              onClose();
              onSelectMilestone(milestone.year);
              setTimeout(() => {
                document.getElementById("timeline-spotlight-hero")?.scrollIntoView({ behavior: "smooth", block: "start" });
              }, 100);
            }}
            className="px-2.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-white/10 text-slate-300 hover:text-cyan-300 text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer"
            title={isTr ? "Spotlight Alanına Git" : "Go to Spotlight"}
          >
            <ArrowUp className="w-3.5 h-3.5 text-cyan-400" />
            <span className="hidden sm:inline">{isTr ? "Spotlight'a Git" : "Spotlight"}</span>
          </button>

          {onOpenShareCard && (
            <button
              onClick={() => onOpenShareCard(milestone)}
              className="px-3 py-1.5 rounded-xl bg-purple-500/10 hover:bg-purple-500/20 border border-purple-500/30 text-purple-300 text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer"
              title="Kartı Paylaş"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Paylaş</span>
            </button>
          )}

          <button
            onClick={onClose}
            className="p-1.5 sm:p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-white/10 transition cursor-pointer"
            aria-label="Kapat"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Header */}
        <div className="space-y-3 pr-16 sm:pr-0">
          <div className="flex flex-wrap items-center gap-2">
            <span
              className="px-2.5 py-0.5 rounded-full text-[11px] font-mono font-bold uppercase border"
              style={{
                color: phase?.color || "#a855f7",
                borderColor: `${phase?.color || "#a855f7"}40`,
                backgroundColor: `${phase?.color || "#a855f7"}15`,
              }}
            >
              FAZ 0{milestone.phase} • {phase?.subtitle}
            </span>

            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-mono bg-slate-800 text-slate-300 border border-white/10">
              {translateCategory(milestone.category, language)}
            </span>

            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-mono font-bold bg-emerald-500/10 text-emerald-300 border border-emerald-500/30">
              %{probData.adjustedProbability} {isTr ? "Model Olasılık Skoru" : "Model Probability Score"}
            </span>
          </div>

          <div className="flex items-start gap-3.5 pt-1">
            <div className="p-3 rounded-2xl bg-purple-600/15 border border-purple-500/30 text-purple-400 shrink-0 mt-0.5">
              <MilestoneIcon name={milestone.iconName} size={26} />
            </div>

            <div>
              <span className="text-3xl sm:text-4xl font-mono font-extrabold text-purple-400">
                {milestone.year}
              </span>
              <h2 className="text-xl sm:text-2xl font-bold text-white leading-snug">
                {milestone.title}
              </h2>
            </div>
          </div>
        </div>

        {/* 🌟 ENHANCED NAVIGATION TABS WITH SMART OVERFLOW INDICATOR */}
        <div className="space-y-1.5 pt-1">
          {/* Helper Micro-Bar: Tab Count & Swipe / More Tabs Hint */}
          <div className="flex items-center justify-between text-xs font-mono px-0.5">
            <div className="flex items-center gap-2">
              <span className="text-[11px] text-slate-400 flex items-center gap-1.5 font-bold">
                <span>{isTr ? "SEKME" : "TAB"}</span>
                <span className="px-1.5 py-0.2 rounded bg-purple-950/70 text-purple-300 border border-purple-500/30 text-[10px]">
                  {activeTabIndex + 1} / {MODAL_TABS.length}
                </span>
              </span>

              {/* Quick Stepper Dots */}
              <div className="flex items-center gap-1.5 pl-1" title={isTr ? "Sekmeler arası hızlı geçiş" : "Quick tab switch"}>
                {MODAL_TABS.map((tab, idx) => (
                  <button
                    key={`modal-dot-${tab.id}-${idx}`}
                    type="button"
                    onClick={() => handleTabChange(tab.id)}
                    className={`h-2 rounded-full transition-all cursor-pointer ${
                      activeModalTab === tab.id
                        ? "w-5 bg-gradient-to-r from-purple-400 to-cyan-400 shadow-[0_0_8px_rgba(168,85,247,0.8)]"
                        : "w-2 bg-white/20 hover:bg-white/40"
                    }`}
                    aria-label={`Sekme ${idx + 1}: ${isTr ? tab.labelTr : tab.labelEn}`}
                  />
                ))}
              </div>
            </div>

            {/* Right: Dynamic "More Tabs" Hint Button when overflowing */}
            {canScrollRight && (
              <button
                type="button"
                onClick={() => scrollTabs("right")}
                className="flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-gradient-to-r from-purple-950/90 to-indigo-950/90 hover:from-purple-900 hover:to-indigo-900 border border-purple-400/50 text-purple-200 hover:text-white text-[10px] font-bold transition-all shadow-md shadow-purple-950/40 cursor-pointer animate-pulse"
                title={isTr ? "Sağdaki diğer sekmeleri göster (tıklayarak kaydırın)" : "Show more tabs (click to scroll)"}
              >
                <span>{isTr ? "👉 1 Sekme Daha Var" : "👉 More Tabs"}</span>
                <ChevronRight className="w-3 h-3 text-purple-300" />
              </button>
            )}

            {!canScrollRight && canScrollLeft && (
              <button
                type="button"
                onClick={() => scrollTabs("left")}
                className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-slate-800 hover:bg-slate-700 border border-white/10 text-slate-300 hover:text-white text-[10px] font-bold transition cursor-pointer"
                title={isTr ? "Başa dön" : "Scroll left"}
              >
                <ChevronLeft className="w-3 h-3" />
                <span>{isTr ? "Başa Dön" : "First Tab"}</span>
              </button>
            )}
          </div>

          {/* Interactive Tab Scroll Track with Left & Right Gradient Shadows */}
          <div className="relative group/tabs">
            {/* Left Edge Gradient Fade & Left Chevron */}
            {canScrollLeft && (
              <div className="absolute left-0 top-0 bottom-0 z-20 flex items-center pr-4 bg-gradient-to-r from-slate-900 via-slate-900/95 to-transparent pointer-events-none">
                <button
                  type="button"
                  onClick={() => scrollTabs("left")}
                  className="pointer-events-auto p-1.5 rounded-lg bg-slate-800/90 hover:bg-slate-700 text-purple-300 hover:text-white border border-white/10 shadow-lg cursor-pointer transition active:scale-95"
                  title={isTr ? "Sola kaydır" : "Scroll left"}
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                </button>
              </div>
            )}

            {/* Right Edge Gradient Fade & Right Chevron */}
            {canScrollRight && (
              <div className="absolute right-0 top-0 bottom-0 z-20 flex items-center pl-4 bg-gradient-to-l from-slate-900 via-slate-900/95 to-transparent pointer-events-none">
                <button
                  type="button"
                  onClick={() => scrollTabs("right")}
                  className="pointer-events-auto p-1.5 rounded-lg bg-purple-950/90 hover:bg-purple-900 text-purple-200 hover:text-white border border-purple-400/50 shadow-lg shadow-purple-900/50 cursor-pointer transition active:scale-95 animate-pulse"
                  title={isTr ? "Sağa kaydır (Daha fazla sekme)" : "Scroll right"}
                >
                  <ChevronRight className="w-3.5 h-3.5 text-purple-300" />
                </button>
              </div>
            )}

            {/* Scrollable Tab Pills */}
            <div
              ref={tabsContainerRef}
              className="flex border-b border-white/10 gap-1.5 font-mono text-xs overflow-x-auto pb-0.5 scroll-smooth no-scrollbar scrollbar-none"
            >
              {MODAL_TABS.map((tab, idx) => {
                const isActive = activeModalTab === tab.id;
                const Icon = tab.icon;
                return (
                  <button
                    key={`modal-tab-${tab.id}`}
                    ref={(el) => { tabButtonRefs.current[tab.id] = el; }}
                    type="button"
                    onClick={() => handleTabChange(tab.id)}
                    className={`px-3.5 sm:px-4 py-2.5 rounded-t-xl font-bold flex items-center gap-2 transition cursor-pointer border-t border-x whitespace-nowrap shrink-0 select-none ${
                      isActive
                        ? "bg-slate-800/95 border-purple-500/50 text-purple-300 shadow-inner ring-1 ring-purple-500/20"
                        : "bg-transparent border-transparent text-slate-400 hover:text-slate-200 hover:bg-white/5"
                    }`}
                  >
                    <Icon className={`w-3.5 h-3.5 ${isActive ? "text-purple-400 animate-pulse" : "text-slate-400"}`} />
                    <span>{isTr ? tab.labelTr : tab.labelEn}</span>
                    <span
                      className={`text-[9px] px-1.5 py-0.2 rounded-full font-mono border ${
                        isActive
                          ? "bg-purple-500/25 border-purple-400/50 text-purple-200 font-extrabold"
                          : "bg-white/5 border-white/10 text-slate-500"
                      }`}
                    >
                      0{idx + 1}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* TAB 1: OVERVIEW */}
        {activeModalTab === "overview" && (
          <div className="space-y-4 animate-fadeIn">
            {/* Main Description */}
            <div className="p-4 sm:p-5 rounded-2xl bg-slate-800/50 border border-white/10 space-y-2">
              <p className="text-sm sm:text-base text-slate-200 leading-relaxed font-sans">
                {milestone.description}
              </p>
            </div>

            {/* Daily Life Impact & Drivers */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
              <div className="p-4 rounded-2xl bg-slate-800/40 border border-white/10 space-y-2">
                <h4 className="text-xs font-mono font-bold uppercase text-purple-300 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-purple-400" />
                  <span>{t("daily_life_impact")}</span>
                </h4>
                <p className="text-xs text-slate-300 leading-relaxed font-sans italic">
                  "{milestone.dailyLifeImpact}"
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-800/40 border border-white/10 space-y-2">
                <h4 className="text-xs font-mono font-bold uppercase text-slate-300">
                  {t("key_drivers")}
                </h4>
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {(milestone.keyDrivers || []).map((driver, idx) => (
                    <span
                      key={`driver-${driver}-${idx}`}
                      className="px-2.5 py-1 rounded-lg bg-slate-900 border border-white/10 text-purple-200 text-xs font-mono"
                    >
                      #{driver}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Clean Metrics Grid */}
            <div className="p-4 rounded-2xl bg-slate-800/30 border border-white/10 space-y-3 font-mono">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                {milestone.year} Etki ve Hazırlık Oranları
              </h4>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-center">
                <div className="p-3 rounded-xl bg-slate-900/80 border border-white/5">
                  <span className="text-slate-400 text-xs block">{t("impact_level")}</span>
                  <span className="text-lg font-bold text-purple-400">%{milestone.impactLevel}</span>
                </div>

                <div className="p-3 rounded-xl bg-slate-900/80 border border-white/5">
                  <span className="text-slate-400 text-xs block">{t("ai_autonomy")}</span>
                  <span className="text-lg font-bold text-blue-400">%{milestone.aiAutonomyIndex}</span>
                </div>

                <div className="p-3 rounded-xl bg-slate-900/80 border border-white/5">
                  <span className="text-slate-400 text-xs block">{t("human_augmentation")}</span>
                  <span className="text-lg font-bold text-amber-400">%{milestone.humanAugmentationIndex}</span>
                </div>

                <div className="p-3 rounded-xl bg-slate-900/80 border border-white/5">
                  <span className="text-slate-400 text-xs block">{t("bio_digital")}</span>
                  <span className="text-lg font-bold text-emerald-400">%{milestone.bioDigitalIntegrationRate}</span>
                </div>
              </div>
            </div>

            {/* Opportunities vs Ethical Risks */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
              <div className="p-4 rounded-2xl bg-emerald-950/20 border border-emerald-500/20 space-y-2">
                <h4 className="text-xs font-mono font-bold uppercase text-emerald-400 flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                  <span>{t("societal_opportunities")}</span>
                </h4>
                <ul className="space-y-1 text-xs text-slate-300 font-sans list-disc list-inside">
                  {(milestone.societalOpportunities || []).map((opp, idx) => (
                    <li key={`opp-${idx}-${opp.substring(0, 15)}`}>{opp}</li>
                  ))}
                </ul>
              </div>

              <div className="p-4 rounded-2xl bg-rose-950/20 border border-rose-500/20 space-y-2">
                <h4 className="text-xs font-mono font-bold uppercase text-rose-400 flex items-center gap-1.5">
                  <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
                  <span>{t("ethical_risks")}</span>
                </h4>
                <ul className="space-y-1 text-xs text-slate-300 font-sans list-disc list-inside">
                  {(milestone.ethicalRisks || []).map((risk, idx) => (
                    <li key={`risk-${idx}-${risk.substring(0, 15)}`}>{risk}</li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Related Years Transition */}
            {milestone.relatedYears && milestone.relatedYears.length > 0 && (
              <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-purple-950/20 via-slate-800/40 to-slate-800/20 border border-purple-500/20 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono text-purple-300 uppercase font-bold flex items-center gap-1.5">
                    <Compass className="w-3.5 h-3.5 text-purple-400" />
                    <span>{t("related_milestones") || (isTr ? "İlişkili Kırılma Yılları" : "Related Milestones")}</span>
                  </span>
                  <span className="text-[10px] font-mono text-slate-400">
                    {milestone.relatedYears.length} {isTr ? "Bağlantılı Yıl" : "Linked Years"}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {milestone.relatedYears.map((ryear, idx) => {
                    const targetM = TIMELINE_DATA.find((m) => m.year === ryear);
                    return (
                      <button
                        key={`${ryear}-${idx}`}
                        type="button"
                        onClick={() => {
                          onSelectMilestone(ryear);
                          modalContentRef.current?.scrollTo({ top: 0, behavior: "smooth" });
                        }}
                        className="group p-3 rounded-xl bg-slate-900/90 hover:bg-purple-950/60 border border-white/10 hover:border-purple-400/60 text-left transition-all shadow-md flex items-center justify-between gap-2 cursor-pointer active:scale-[0.98]"
                        title={`${ryear} yılı detayına git`}
                      >
                        <div className="space-y-0.5 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-purple-400 group-hover:scale-125 transition-transform" />
                            <span className="font-mono font-extrabold text-sm text-purple-300 group-hover:text-purple-200">
                              {ryear} {isTr ? "Yılına Git" : "Go to Year"}
                            </span>
                          </div>
                          {targetM && (
                            <p className="text-xs text-slate-300 font-sans truncate pl-4">
                              {targetM.title}
                            </p>
                          )}
                        </div>
                        <div className="p-1.5 rounded-lg bg-white/5 group-hover:bg-purple-500/20 text-slate-400 group-hover:text-purple-300 transition-colors shrink-0">
                          <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* 🌟 DIRECT BRIDGE TO PERSONAL IMPACT TAB */}
            <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-purple-950/60 via-indigo-950/40 to-slate-900 border-2 border-purple-500/40 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-left">
              <div className="space-y-1">
                <span className="text-xs font-mono font-bold uppercase text-purple-300 flex items-center gap-1.5">
                  <User className="w-4 h-4 text-purple-400" />
                  <span>{isTr ? "Bu Gelişme Beni Nasıl Etkiler?" : "How Does This Impact Me?"}</span>
                </span>
                <p className="text-xs text-slate-300 font-sans leading-relaxed">
                  {isTr
                    ? `${milestone.year} yılındaki bu kırılmanın yaşınıza, mesleğinize, kariyer risklerinize ve yol haritanıza özel analizini inceleyin.`
                    : `Explore the personalized analysis of this ${milestone.year} breakthrough tailored to your age, role, career risks, and roadmap.`}
                </p>
              </div>
              <button
                type="button"
                onClick={() => handleTabChange("personal_impact")}
                className="px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs font-sans flex items-center gap-2 shadow-lg shadow-purple-600/30 transition-all cursor-pointer shrink-0 self-start sm:self-center"
              >
                <span>{isTr ? "Kişisel Analize Geç" : "View Personal Impact"}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* TAB: BENİM İÇİN (PERSONAL IMPACT) */}
        {activeModalTab === "personal_impact" && (
          <div className="space-y-4 animate-fadeIn">
            {!currentUser ? (
              /* GUEST AUTHENTICATION GATE: Never display personal scores, fake ages, or fake roadmaps to visitors */
              <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-b from-[#180e35]/95 via-[#100b25]/95 to-[#0a0718] border-2 border-purple-500/40 text-center space-y-5 animate-fadeIn shadow-2xl">
                <div className="w-16 h-16 rounded-3xl bg-purple-500/20 border border-purple-400/40 text-purple-300 mx-auto flex items-center justify-center shadow-lg shadow-purple-500/20">
                  <Lock className="w-8 h-8 text-purple-300 animate-pulse" />
                </div>
                <div className="space-y-2 max-w-lg mx-auto">
                  <span className="px-3 py-1 rounded-full text-xs font-mono font-bold bg-purple-500/20 text-purple-300 border border-purple-500/40">
                    {isTr ? "KİŞİYE ÖZEL GELECEK ETKİSİ" : "PERSONAL FUTURE IMPACT"}
                  </span>
                  <h4 className="text-lg sm:text-xl font-bold text-white">
                    {isTr ? "Kişisel Gelecek Analizi İçin Giriş Yapın" : "Sign In for Personal Impact Analysis"}
                  </h4>
                  <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-sans">
                    {isTr
                      ? "Bu dönüm noktasının yaşınıza, mesleğinize ve kariyer hedeflerinize özel doğrudan etkilerini, kişisel risk puanını ve somut eylem planını görmek için ücretsiz giriş yapın."
                      : "Sign in to see how this milestone impacts your specific age, profession, and career goals with actionable next steps."}
                  </p>
                </div>
                <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      if (onOpenAuthModal) onOpenAuthModal();
                    }}
                    className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-xs shadow-lg shadow-purple-600/30 transition cursor-pointer flex items-center gap-2"
                  >
                    <User className="w-4 h-4" />
                    <span>{isTr ? "Giriş Yap / Ücretsiz Kayıt Ol" : "Sign In / Register Free"}</span>
                  </button>
                </div>
              </div>
            ) : personalImpact && personalImpact.isProfilePending ? (
              /* INCOMPLETE PROFILE GATE: Authenticated but missing profession/age */
              <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-b from-[#251708]/95 via-[#180f05]/95 to-[#0e0903] border-2 border-amber-500/40 text-center space-y-5 animate-fadeIn shadow-2xl">
                <div className="w-16 h-16 rounded-3xl bg-amber-500/20 border border-amber-400/40 text-amber-300 mx-auto flex items-center justify-center shadow-lg shadow-amber-500/20">
                  <AlertCircle className="w-8 h-8 text-amber-300" />
                </div>
                <div className="space-y-2 max-w-lg mx-auto">
                  <span className="px-3 py-1 rounded-full text-xs font-mono font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40">
                    {isTr ? "EKSİK PROFİL BİLGİSİ" : "INCOMPLETE PROFILE"}
                  </span>
                  <h4 className="text-lg sm:text-xl font-bold text-amber-200">
                    {isTr ? "Profilinizi Tamamlayarak Kişisel Analizi Açın" : "Complete Profile to Unlock Personal Analysis"}
                  </h4>
                  <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-sans">
                    {isTr
                      ? "Mesleğinizi ve doğum yaşınızı profilinize ekleyerek bu dönüm noktasının sizin üzerinizdeki rutin görev otomasyon baskısını, süper-uzmanlaşma fırsatlarını ve somut eylem planını açabilirsiniz."
                      : "Add your profession and age to your profile to calculate tailored task automation impacts, opportunity horizons, and concrete action steps."}
                  </p>
                </div>
                <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
                  <button
                    type="button"
                    onClick={() => window.dispatchEvent(new CustomEvent("open_profile_completion"))}
                    className="px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-lg shadow-amber-500/30 transition cursor-pointer flex items-center gap-2"
                  >
                    <User className="w-4 h-4" />
                    <span>{isTr ? "Profili Şimdi Tamamla (5 Adım)" : "Complete Profile (5 Steps)"}</span>
                  </button>
                </div>
              </div>
            ) : personalImpact ? (
              /* COMPLETE PROFILE: Verified personal output */
              <>
                <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-purple-950/40 via-indigo-950/30 to-slate-900/60 border border-purple-500/30 space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono font-bold uppercase text-purple-300 flex items-center gap-1.5">
                          <User className="w-3.5 h-3.5 text-purple-400" />
                          <span>{currentUser?.profession || currentUser?.lifeRoleLabel || (isTr ? "Genel Teknoloji Takipçisi" : "Tech Observer")}</span>
                        </span>
                        {personalImpact.userAgeAtMilestone && (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-extrabold bg-purple-500/20 text-purple-200 border border-purple-400/30">
                            {milestone.year} // ~{personalImpact.userAgeAtMilestone} {isTr ? "Yaşında" : "Years Old"}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-300 font-sans">
                        {personalImpact.relevanceReason}
                      </p>
                    </div>

                    <div className="shrink-0 flex items-center gap-2">
                      <span
                        className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold border flex items-center gap-1.5 ${
                          personalImpact.relevanceLevel === "high"
                            ? "bg-red-500/20 text-red-300 border-red-500/40 shadow-sm shadow-red-500/20"
                            : personalImpact.relevanceLevel === "medium"
                            ? "bg-amber-500/20 text-amber-300 border-amber-500/40 shadow-sm shadow-amber-500/20"
                            : "bg-blue-500/20 text-blue-300 border-blue-500/40"
                        }`}
                      >
                        <Target className="w-3.5 h-3.5" />
                        <span>
                          {personalImpact.relevanceLevel === "high"
                            ? (isTr ? "Kritik Mesleki Etki" : "High Career Impact")
                            : personalImpact.relevanceLevel === "medium"
                            ? (isTr ? "Orta İlgi & Fırsat" : "Medium Relevance")
                            : (isTr ? "Genel Makro Gelişme" : "Macro Milestone")}
                        </span>
                        <span className="opacity-90 font-mono text-[11px]">({isTr ? "Alaka Skoru" : "Relevance"}: {personalImpact.relevanceScore}/100)</span>
                      </span>
                    </div>
                  </div>

                  {/* Progress relevance bar */}
                  <div className="w-full bg-slate-900/80 rounded-full h-1.5 overflow-hidden border border-white/5">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        personalImpact.relevanceLevel === "high"
                          ? "bg-gradient-to-r from-amber-500 to-red-500"
                          : personalImpact.relevanceLevel === "medium"
                          ? "bg-gradient-to-r from-blue-500 to-amber-500"
                          : "bg-blue-500"
                      }`}
                      style={{ width: `${personalImpact.relevanceScore}%` }}
                    />
                  </div>
                </div>

            {/* Career Impact vs Opportunity */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
              <div className="p-4 rounded-2xl bg-slate-800/40 border border-white/10 space-y-2">
                <h4 className="text-xs font-mono font-bold uppercase text-red-300 flex items-center gap-1.5">
                  <Briefcase className="w-3.5 h-3.5 text-red-400" />
                  <span>{isTr ? "Meslek & Görev Otomasyon Etkisi" : "Career & Automation Impact"}</span>
                </h4>
                <p className="text-xs text-slate-300 leading-relaxed font-sans">
                  {personalImpact.careerImpactSummary}
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-800/40 border border-white/10 space-y-2">
                <h4 className="text-xs font-mono font-bold uppercase text-emerald-300 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                  <span>{isTr ? "Fırsat & Süper-Uzmanlaşma" : "Opportunity & Super-Specialization"}</span>
                </h4>
                <p className="text-xs text-slate-300 leading-relaxed font-sans">
                  {personalImpact.opportunitySummary}
                </p>
              </div>
            </div>

            {/* Risk vs Preparation Timeline */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
              <div className="p-4 rounded-2xl bg-slate-800/40 border border-white/10 space-y-2">
                <h4 className="text-xs font-mono font-bold uppercase text-amber-300 flex items-center gap-1.5">
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
                  <span>{isTr ? "Risk & Kaçınılması Gerekenler" : "Risk & Traps to Avoid"}</span>
                </h4>
                <p className="text-xs text-slate-300 leading-relaxed font-sans">
                  {personalImpact.riskSummary}
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-800/40 border border-white/10 space-y-2">
                <h4 className="text-xs font-mono font-bold uppercase text-cyan-300 flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-cyan-400" />
                  <span>{isTr ? "Hazırlık & Eylem Dönemi" : "Preparation & Action Horizon"}</span>
                </h4>
                <p className="text-xs text-slate-300 leading-relaxed font-sans">
                  {personalImpact.preparationAdvice}
                </p>
              </div>
            </div>

            {/* Matching Roadmap or Link to Generate */}
            <div className="p-4 rounded-2xl bg-slate-900/80 border border-purple-500/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="space-y-1">
                <span className="text-xs font-mono font-bold uppercase text-purple-300 flex items-center gap-1.5">
                  <Compass className="w-3.5 h-3.5 text-purple-400" />
                  <span>{isTr ? "Kişisel Gelecek Yol Haritası Entegrasyonu" : "Personal Roadmap Integration"}</span>
                </span>
                <p className="text-xs text-slate-300 font-sans">
                  {personalImpact.matchingRoadmapStep
                    ? personalImpact.matchingRoadmapStep.action
                    : (isTr
                        ? "Bu dönüm noktasını içeren 2026-2060 kişiselleştirilmiş adaptasyon takviminizi Yol Haritası modülünde oluşturabilirsiniz."
                        : "You can generate a personalized 2026-2060 adaptation timeline including this milestone in the Roadmap module.")}
                </p>
              </div>

              <button
                type="button"
                onClick={() => {
                  onClose();
                  if (onNavigateToView) onNavigateToView("roadmap", milestone.year);
                }}
                className="px-3.5 py-2 rounded-xl bg-purple-600/30 hover:bg-purple-600 border border-purple-500/40 text-purple-200 hover:text-white text-xs font-bold font-mono transition cursor-pointer flex items-center gap-1.5 shrink-0 self-start sm:self-center"
              >
                <span>{isTr ? "Yol Haritasına Git" : "Open Roadmap"}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* 📡 İLGİLİ CANLI GELİŞMELER & İSTİHBARAT RADARI */}
            <div className="p-4 sm:p-5 rounded-2xl bg-slate-900/90 border border-cyan-500/25 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-bold uppercase text-cyan-300 flex items-center gap-1.5">
                  <Radio className="w-4 h-4 text-cyan-400 animate-pulse" />
                  <span>{isTr ? "Canlı İstihbarat & Destekleyici Sinyaller" : "Live Intelligence & Supporting Signals"}</span>
                </span>
                <span className="text-[10px] font-mono text-cyan-400/80 bg-cyan-950/70 border border-cyan-500/30 px-2 py-0.5 rounded-full">
                  {milestone.signals && milestone.signals.length > 0
                    ? `${milestone.signals.length} ${isTr ? "Aktif Sinyal" : "Active Signals"}`
                    : (isTr ? "Radar Aktif" : "Radar Active")}
                </span>
              </div>

              {milestone.signals && milestone.signals.length > 0 ? (
                <div className="space-y-2.5">
                  {milestone.signals.slice(0, 3).map((sig, idx) => (
                    <div
                      key={`modal-sig-${sig.id || idx}`}
                      className="p-3 rounded-xl bg-slate-950/70 border border-white/10 hover:border-cyan-500/40 transition-colors space-y-1.5"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-1.5">
                        <span className="text-xs font-bold text-slate-100 flex items-center gap-1.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 shrink-0" />
                          <span>{sig.title}</span>
                        </span>
                        <div className="flex items-center gap-1.5 text-[10px] font-mono">
                          <span className="px-1.5 py-0.2 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 font-bold">
                            %{sig.confidenceWeight} {isTr ? "Güven" : "Confidence"}
                          </span>
                          {sig.isVerifiedSignal ? (
                            <span className="px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-bold">
                              ✓ {isTr ? "Harici Kaynak Kaydı" : "Source-Backed Record"}
                            </span>
                          ) : (
                            <span className="px-1.5 py-0.2 rounded bg-slate-800 text-slate-400 border border-white/5 font-normal">
                              🔍 {isTr ? "Arama İndeksi" : "Search Query"}
                            </span>
                          )}
                        </div>
                      </div>
                      <p className="text-xs text-slate-300 leading-relaxed font-sans">
                        {sig.summary}
                      </p>
                      <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono pt-0.5">
                        <span className="truncate max-w-[240px]">📡 {sig.sourceOrg}</span>
                        {sig.url && (
                          <a
                            href={sig.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-cyan-400 hover:text-cyan-200 flex items-center gap-1 hover:underline"
                          >
                            <span>{isTr ? "Kaynak" : "Source"}</span>
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        )}
                      </div>
                    </div>
                  ))}
                  <div className="pt-1 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-t border-white/5">
                    <span className="text-[11px] text-slate-400 font-mono">
                      {isTr ? "Bu dönüm noktası küresel arXiv ve Telegram istihbarat ağımızla taranmaktadır." : "Continuously monitored via arXiv & Telegram radar."}
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        onClose();
                        if (onNavigateToView) onNavigateToView("telegram_feed", milestone.year);
                      }}
                      className="px-3 py-1.5 rounded-lg bg-cyan-950/80 hover:bg-cyan-900 border border-cyan-500/40 text-cyan-300 hover:text-white text-xs font-mono font-bold flex items-center gap-1.5 transition cursor-pointer shrink-0"
                    >
                      <Radio className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
                      <span>{isTr ? "Tüm Canlı İstihbaratı Gör" : "View All Live Intelligence"}</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ) : (
                <div className="p-3.5 rounded-xl bg-slate-950/50 border border-dashed border-cyan-500/30 flex flex-col sm:flex-row items-center justify-between gap-3 text-left">
                  <div className="space-y-1">
                    <p className="text-xs text-slate-300 font-sans">
                      {isTr
                        ? "Bu dönüm noktası için küresel arXiv, patent ve teknoloji istihbarat ağımız aktif olarak sinyal taramaktadır."
                        : "Our global arXiv, patent, and tech intelligence networks are continuously monitoring for signals."}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      if (onNavigateToView) onNavigateToView("telegram_feed", milestone.year);
                    }}
                    className="px-3 py-1.5 rounded-lg bg-cyan-950/60 hover:bg-cyan-900 border border-cyan-500/40 text-cyan-300 hover:text-white text-xs font-mono font-bold flex items-center gap-1.5 transition cursor-pointer shrink-0"
                  >
                    <span>{isTr ? "İstihbarat Merkezini Aç" : "Open Intelligence"}</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
              )}
            </div>

            {/* 🚀 BÖLÜM 4: “PEKİ ŞİMDİ NE YAPMALIYIM?” — SOMUT EYLEM PLANI & TAKİP DÖNGÜSÜ (AŞAMA 20) */}
            {actionPlan && (
              <div className="p-5 sm:p-6 rounded-3xl bg-gradient-to-br from-indigo-950/80 via-slate-900 to-purple-950/80 border-2 border-cyan-400/40 shadow-2xl space-y-4 relative overflow-hidden text-left">
                <div className="absolute top-0 right-0 w-48 h-48 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none -mr-16 -mt-16" />

                {/* Header: Eylem Başlığı & Zamanlama Ufku */}
                <div className="flex flex-wrap items-center justify-between gap-2.5 border-b border-white/10 pb-3 relative z-10">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-xl bg-cyan-500/20 border border-cyan-400/40 flex items-center justify-center text-cyan-300 shrink-0">
                      <Zap className="w-4 h-4 text-cyan-400" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-white flex items-center gap-2 font-mono">
                        <span>{isTr ? "Peki Şimdi Ne Yapmalıyım?" : "What Should I Do Now?"}</span>
                      </h4>
                      <span className="text-[11px] text-cyan-300/90 font-sans">
                        {isTr ? "Kişisel Eylem Planı & Stratejik Zamanlama" : "Personal Action Plan & Strategic Timing"}
                      </span>
                    </div>
                  </div>

                  {/* Timing & Phase Badge */}
                  <div className="flex items-center gap-2">
                    <span className="px-3 py-1 rounded-full text-xs font-mono font-bold border bg-cyan-950/80 text-cyan-300 border-cyan-400/50 shadow-sm flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-cyan-400" />
                      <span>{actionPlan.urgencyTitle}</span>
                    </span>
                  </div>
                </div>

                {/* Concrete Action Card */}
                <div className="p-4 rounded-2xl bg-slate-950/80 border border-white/10 space-y-2.5 relative z-10">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[11px] font-mono font-bold uppercase text-purple-300 bg-purple-500/20 px-2.5 py-0.5 rounded-md border border-purple-500/30 flex items-center gap-1">
                      <Sparkles className="w-3 h-3 text-purple-400" />
                      <span>{actionPlan.actionTypeLabel}</span>
                    </span>
                    <span className="text-[10px] font-mono text-slate-400 bg-slate-900/80 px-2 py-0.5 rounded border border-white/5">
                      {isTr ? "🎯 Model & Profil Önerisi" : "🎯 Model & Profile Recommendation"}
                    </span>
                    <span className="text-[11px] font-mono text-slate-400">
                      {actionPlan.timelinePhaseText}
                    </span>
                  </div>

                  <p className="text-sm sm:text-base text-slate-100 font-sans font-semibold leading-relaxed">
                    "{actionPlan.concreteAction}"
                  </p>

                  {/* Epistemic & Decision Invariant Status Banner */}
                  <div className="flex flex-wrap items-center gap-2 pt-1 pb-1">
                    <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-mono border bg-slate-900/90 border-purple-500/40">
                      <span className="text-slate-400">{isTr ? "Kullanıcı Kararı:" : "User Decision:"}</span>
                      <span className="font-bold text-purple-300">
                        {actionPlan.userDecision ? `Yol ${actionPlan.userDecision}` : (isTr ? "Seçilmedi (Öneri Takip Ediliyor)" : "Not Set (Following Model)")}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-mono border bg-slate-900/90 border-cyan-500/40">
                      <span className="text-slate-400">{isTr ? "Model Tavsiyesi:" : "Model Recommendation:"}</span>
                      <span className="font-bold text-cyan-300">
                        Yol {actionPlan.modelRecommendation || actionPlan.recommendedOption || "A"}
                      </span>
                    </div>
                    {actionPlan.userDecision && actionPlan.modelRecommendation && actionPlan.userDecision !== actionPlan.modelRecommendation && (
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40">
                        {isTr ? "🛡️ Kararınız Korunuyor (Model Önerisinden Bağımsız)" : "🛡️ Choice Retained (Independent of Model)"}
                      </span>
                    )}
                  </div>

                  {actionPlan.dynamicImpactAssessment && (
                    <div className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-700/60 text-[11px] font-mono space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-slate-400 font-bold uppercase flex items-center gap-1">
                          <span>{isTr ? "Çok Boyutlu Hazırlık Analizi" : "Multi-Dimensional Readiness"}</span>
                        </span>
                        <span className="text-[9px] px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30 font-bold">
                          MODEL PROJECTION ≠ FACT
                        </span>
                      </div>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 text-[10px] text-slate-300 pt-1">
                        <div>TRL: <span className="text-cyan-300 font-bold">{actionPlan.dynamicImpactAssessment.trlLevel}/9</span></div>
                        <div>Altyapı: <span className="text-cyan-300 font-bold">%{actionPlan.dynamicImpactAssessment.readinessDimensions.infrastructureReadiness}</span></div>
                        <div>Regülasyon: <span className="text-cyan-300 font-bold">%{actionPlan.dynamicImpactAssessment.readinessDimensions.regulatoryReadiness}</span></div>
                        <div>Ticarileşme: <span className="text-cyan-300 font-bold">%{actionPlan.dynamicImpactAssessment.readinessDimensions.commercialReadiness}</span></div>
                      </div>
                    </div>
                  )}

                  {actionPlan.outcomeFollowUpAdvice && (
                    <div className="p-2.5 rounded-xl bg-emerald-950/50 border border-emerald-500/40 text-xs font-mono text-emerald-300 flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                      <span>{actionPlan.outcomeFollowUpAdvice}</span>
                    </div>
                  )}

                  {/* Structured Decision Framework (Aşama 38) */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-2 border-t border-white/5">
                    <div className="text-xs text-slate-300 font-sans flex items-start gap-1.5 bg-slate-900/60 p-2.5 rounded-xl border border-white/5">
                      <span className="text-cyan-400 font-mono font-bold shrink-0">{isTr ? "Zaman Ufku:" : "Time Horizon:"}</span>
                      <span className="text-slate-300">{actionPlan.urgencySubtitle}</span>
                    </div>

                    <div className="text-xs font-sans flex items-start gap-1.5 bg-amber-950/40 p-2.5 rounded-xl border border-amber-500/30">
                      <span className="text-amber-400 font-mono font-bold shrink-0 flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" />
                        <span>{isTr ? "Ne Zaman Tekrar Kontrol Etmeliyim?" : "When to Check Back?"}</span>
                      </span>
                      <span className="text-amber-200 font-mono font-medium leading-relaxed">{actionPlan.reviewCheckpoint}</span>
                    </div>

                    {actionPlan.why && (
                      <div className="text-xs text-slate-300 font-sans flex items-start gap-1.5 bg-slate-900/60 p-2.5 rounded-xl border border-white/5 sm:col-span-2">
                        <span className="text-purple-400 font-mono font-bold shrink-0">{isTr ? "Neden Önemli (Gerekçe):" : "Why It Matters:"}</span>
                        <span className="text-slate-300">{actionPlan.why}</span>
                      </div>
                    )}

                    {actionPlan.expectedValue && (
                      <div className="text-xs text-slate-300 font-sans flex items-start gap-1.5 bg-emerald-950/30 p-2.5 rounded-xl border border-emerald-500/30">
                        <span className="text-emerald-400 font-mono font-bold shrink-0">{isTr ? "Beklenen Değer:" : "Expected Value:"}</span>
                        <span className="text-emerald-200">{actionPlan.expectedValue}</span>
                      </div>
                    )}

                    {actionPlan.risk && (
                      <div className="text-xs text-slate-300 font-sans flex items-start gap-1.5 bg-rose-950/30 p-2.5 rounded-xl border border-rose-500/30">
                        <span className="text-rose-400 font-mono font-bold shrink-0">{isTr ? "Eylemsizlik Riski:" : "Inaction Risk:"}</span>
                        <span className="text-rose-200">{actionPlan.risk}</span>
                      </div>
                    )}
                  </div>

                  {/* 3 Stratejik Karar Yolu / Seçenekler (Aşama 38 & 39 Kapalı Döngü) */}
                  {actionPlan.decisionOptions && actionPlan.decisionOptions.length > 0 && (
                    <div className="pt-3 border-t border-white/10 space-y-2">
                      <div className="flex items-center justify-between text-xs font-mono font-bold text-slate-300">
                        <span className="text-cyan-300 flex items-center gap-1">
                          <Compass className="w-3.5 h-3.5 text-cyan-400" />
                          <span>{isTr ? "3 Alternatif Stratejik Karar Yolu:" : "3 Strategic Decision Options:"}</span>
                        </span>
                        <span className="text-[10px] text-slate-400">
                          {isTr ? "Tıklayarak aktif stratejinizi belirleyin" : "Click to select your active strategy"}
                        </span>
                      </div>

                      {optionSavedFeedback && (
                        <div className="p-2 rounded-xl bg-emerald-950/70 border border-emerald-500/40 text-[11px] font-mono text-emerald-300 flex items-center justify-between animate-fadeIn">
                          <span className="flex items-center gap-1.5">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                            <span>{isTr ? "Stratejik karar yolunuz kaydedildi; eylem planı ve yol haritası güncellendi." : "Strategic decision path saved; action plan and roadmap updated."}</span>
                          </span>
                          <span className="text-[10px] text-emerald-400 font-bold font-mono">AKTİF</span>
                        </div>
                      )}

                      {/* ⚡ Canlı İstihbarat ile Strateji Değerlendirmesi Bildirimi & Kapalı Döngü Karar Akışı */}
                      {actionPlan.decisionReassessment?.needsReassessment && (
                        <div className="p-3.5 rounded-2xl bg-purple-950/80 border-2 border-purple-400/60 text-purple-200 text-xs font-mono space-y-2.5 shadow-lg shadow-purple-950/50 animate-fadeIn">
                          <div className="flex items-center justify-between">
                            <span className="font-bold flex items-center gap-1.5 text-purple-300">
                              <RefreshCw className="w-3.5 h-3.5 text-purple-400 animate-spin-slow" />
                              <span>{isTr ? "⚡ Canlı İstihbarat ile Strateji Değerlendirmesi" : "⚡ Live Intelligence Strategy Reassessment"}</span>
                            </span>
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-purple-500/30 text-purple-200 border border-purple-500/50">
                              {isTr ? `Tavsiye: Yol ${actionPlan.decisionReassessment.recommendedAlternativeOption}` : `Recommended: Path ${actionPlan.decisionReassessment.recommendedAlternativeOption}`}
                            </span>
                          </div>

                          <p className="text-[11px] text-purple-100 font-sans leading-relaxed">
                            {actionPlan.decisionReassessment.reason}
                          </p>

                          {/* Closed-Loop User Interaction: MODEL REASSESSMENT ≠ USER ACKNOWLEDGEMENT */}
                          {!reassessmentAcknowledged ? (
                            <div className="pt-2 border-t border-purple-400/20 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2">
                              <span className="text-[10px] text-purple-300/80 font-mono">
                                {isTr ? "Yeni sinyalleri değerlendirip kararınızı güncelleyin veya mevcut seçiminizi onaylayın:" : "Review the signals to update your strategy or keep current choice:"}
                              </span>
                              <div className="flex items-center gap-2 shrink-0">
                                <button
                                  type="button"
                                  onClick={() => handleAcknowledgeAndAcceptReassessment(actionPlan.decisionReassessment!.recommendedAlternativeOption)}
                                  className="px-2.5 py-1.5 rounded-lg bg-purple-500 hover:bg-purple-400 text-slate-950 text-[11px] font-mono font-bold flex items-center gap-1 transition-all cursor-pointer shadow-md shadow-purple-950"
                                >
                                  <Sparkles className="w-3 h-3" />
                                  <span>{isTr ? `Öneriye Geç (Yol ${actionPlan.decisionReassessment.recommendedAlternativeOption})` : `Accept Path ${actionPlan.decisionReassessment.recommendedAlternativeOption}`}</span>
                                </button>
                                <button
                                  type="button"
                                  onClick={handleAcknowledgeAndKeepCurrentDecision}
                                  className="px-2.5 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-purple-400/40 text-purple-200 hover:text-white text-[11px] font-mono font-medium transition-all cursor-pointer"
                                >
                                  <span>{isTr ? `Mevcut Kararımda Kal (Yol ${selectedDecisionOption || actionPlan.selectedOptionId || "A"})` : `Keep Current Path`}</span>
                                </button>
                              </div>
                            </div>
                          ) : (
                            <div className="pt-2 border-t border-purple-400/20 flex items-center justify-between text-[10px] font-mono text-purple-300/90">
                              <span className="flex items-center gap-1.5">
                                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                                <span>{isTr ? "✓ Değerlendirme gözden geçirildi (Kullanıcı tercihi aktif)" : "✓ Reassessment acknowledged (User choice active)"}</span>
                              </span>
                              <button
                                type="button"
                                onClick={handleResetReassessmentAcknowledgment}
                                className="text-purple-400 hover:text-purple-200 underline cursor-pointer"
                              >
                                {isTr ? "Tekrar İncele" : "Review Again"}
                              </button>
                            </div>
                          )}
                        </div>
                      )}

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                        {actionPlan.decisionOptions.map((opt) => {
                          const isSelected = (selectedDecisionOption || actionPlan.selectedOptionId) === opt.optionId;
                          const isRecommendedByLiveIntel = actionPlan.decisionReassessment?.needsReassessment && actionPlan.decisionReassessment.recommendedAlternativeOption === opt.optionId;
                          return (
                            <div
                              key={`act-opt-${opt.optionId}`}
                              onClick={() => handleSelectDecisionOption(opt.optionId)}
                              className={`p-3 rounded-xl border space-y-1.5 text-left transition-all cursor-pointer relative group ${
                                isSelected
                                  ? "bg-gradient-to-b from-purple-950/70 to-slate-900/90 border-purple-400 ring-2 ring-purple-500/40 shadow-lg shadow-purple-950/70"
                                  : isRecommendedByLiveIntel
                                  ? "bg-purple-950/40 border-purple-400/50 hover:border-purple-300 hover:bg-purple-950/60"
                                  : "bg-slate-900/60 border-white/10 hover:border-white/30 hover:bg-slate-900/80"
                              }`}
                            >
                              <div className="flex items-center justify-between gap-1">
                                <div className="flex items-center gap-1.5">
                                  <span className={`px-1.5 py-0.5 rounded text-[10px] font-mono font-bold border ${
                                    isSelected
                                      ? "bg-purple-900/80 text-purple-200 border-purple-400"
                                      : isRecommendedByLiveIntel
                                      ? "bg-purple-900/50 text-purple-200 border-purple-400/60"
                                      : "bg-cyan-950 border-cyan-500/40 text-cyan-300"
                                  }`}>
                                    YOL {opt.optionId}
                                  </span>
                                  {isSelected && (
                                    <span className="px-1.5 py-0.2 rounded text-[9px] font-mono font-bold bg-emerald-950/90 text-emerald-300 border border-emerald-500/40">
                                      {isTr ? "SEÇİLEN ✓" : "SELECTED ✓"}
                                    </span>
                                  )}
                                  {isRecommendedByLiveIntel && !isSelected && (
                                    <span className="px-1.5 py-0.2 rounded text-[9px] font-mono font-bold bg-purple-950/90 text-purple-300 border border-purple-400 animate-pulse">
                                      {isTr ? "⚡ TAVSİYE" : "⚡ SUGGESTED"}
                                    </span>
                                  )}
                                </div>
                                <span className={`text-[10px] font-mono px-1.5 py-0.2 rounded border font-semibold ${
                                  opt.riskLevel === "Düşük"
                                    ? "bg-emerald-950/60 text-emerald-300 border-emerald-500/30"
                                    : opt.riskLevel === "Orta"
                                    ? "bg-amber-950/60 text-amber-300 border-amber-500/30"
                                    : "bg-rose-950/60 text-rose-300 border-rose-500/30"
                                }`}>
                                  {opt.riskLevel} Risk
                                </span>
                              </div>

                              <h5 className="text-xs font-bold text-white font-sans line-clamp-1">
                                {opt.title}
                              </h5>

                              <p className="text-[11px] text-slate-300 leading-relaxed font-sans line-clamp-3">
                                {opt.approach}
                              </p>

                              <div className="pt-1.5 border-t border-white/5 text-[10px] font-mono flex items-center justify-between">
                                <span className="text-slate-400">Geri Dönülebilirlik:</span>
                                <span className="text-slate-200 font-semibold">{opt.reversibility.split(" ")[0]}</span>
                              </div>

                              <div className="pt-1 flex items-center justify-end">
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleSelectDecisionOption(opt.optionId);
                                  }}
                                  className={`w-full py-1 px-2 rounded-lg text-[10px] font-mono font-bold transition-all ${
                                    isSelected
                                      ? "bg-purple-600/30 text-purple-200 border border-purple-400/50"
                                      : "bg-white/5 hover:bg-white/10 text-slate-300 border border-white/10 group-hover:border-cyan-500/40 group-hover:text-cyan-300"
                                  }`}
                                >
                                  {isSelected
                                    ? (isTr ? "✓ Aktif Stratejiniz" : "✓ Active Strategy")
                                    : (isTr ? "Bu Stratejiyi Seç" : "Select This Strategy")}
                                </button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>

                {/* Eylem Durumu Takip Döngüsü (Görüldü, Planlandı, Başlandı, Tamamlandı) */}
                <div className="p-3.5 rounded-2xl bg-slate-950/60 border border-white/10 space-y-3 relative z-10">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono text-slate-300 font-bold flex items-center gap-1.5">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                      <span>{isTr ? "Eylem Durumunuzu İşaretleyin:" : "Track Action Progress:"}</span>
                    </span>
                    <span className="text-[10px] font-mono text-slate-400">
                      {isTr ? "Anında Kaydedilir" : "Auto-Saved"}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs font-mono">
                    {[
                      { id: "seen", labelTr: "👁️ Görüldü", labelEn: "👁️ Seen", color: "border-slate-500/40 bg-slate-800/80 text-slate-300" },
                      { id: "planned", labelTr: "📅 Planlandı", labelEn: "📅 Planned", color: "border-blue-500/50 bg-blue-950/70 text-blue-300" },
                      { id: "in_progress", labelTr: "⚡ Başlandı", labelEn: "⚡ In Progress", color: "border-amber-500/50 bg-amber-950/70 text-amber-300" },
                      { id: "completed", labelTr: "✓ Tamamlandı", labelEn: "✓ Completed", color: "border-emerald-500/50 bg-emerald-950/70 text-emerald-300" },
                    ].map((st) => {
                      const isCurrent = actionStatus === st.id;
                      return (
                        <button
                          key={`act-st-${st.id}`}
                          type="button"
                          onClick={() => handleUpdateActionStatus(st.id as ActionProgressStatus)}
                          className={`py-2 px-2.5 rounded-xl border text-center font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                            isCurrent
                              ? `${st.color} ring-2 ring-cyan-400/60 shadow-lg shadow-cyan-950/50 scale-[1.02]`
                              : "border-white/5 bg-slate-900/50 text-slate-400 hover:text-white hover:bg-slate-800"
                          }`}
                        >
                          <span>{isTr ? st.labelTr : st.labelEn}</span>
                          {isCurrent && <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />}
                        </button>
                      );
                    })}
                  </div>

                  {actionStatus === "completed" && (
                    <div className="p-3 rounded-xl bg-slate-900/90 border border-emerald-500/40 text-xs font-mono space-y-1 animate-fadeIn">
                      <div className="flex items-center justify-between">
                        <span className="text-emerald-300 font-bold flex items-center gap-1.5">
                          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                          <span>{isTr ? "Eylem Kaydı: Tamamlandı Olarak İşaretlendi" : "Action Marked as Completed"}</span>
                        </span>
                        <span className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-white/10 font-bold">
                          {actionPlan.outcomeSemantics || "ACTION_COMPLETED_PENDING_REVIEW"}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-300 font-sans leading-relaxed">
                        {isTr
                          ? "* Bu işaretleme sizin kişisel beyanınızdır. Gerçek dünya mesleki yetkinliği veya dış dünya somut çıktısı otomatik olarak hesaplanmamıştır. Deneyim ve sonuç notlarınızı aşağıya ekleyerek gözden geçirebilirsiniz."
                          : "* This is a user-reported status. Objective real-world outcome has not been automatically verified. Add your reflection notes below."}
                      </p>
                    </div>
                  )}

                  {/* Kişisel Eylem Notu & Takip Refleksiyonu */}
                  <div className="pt-2 border-t border-white/5 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-mono text-slate-300 font-bold flex items-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400" />
                        <span>{isTr ? "Kişisel İlerleme & Takip Notunuz:" : "Personal Action Progress Note:"}</span>
                      </span>
                      {actionNote && !isEditingNote && (
                        <button
                          type="button"
                          onClick={() => setIsEditingNote(true)}
                          className="text-[10px] text-cyan-400 hover:text-cyan-300 underline font-mono cursor-pointer"
                        >
                          {isTr ? "Notu Düzenle" : "Edit Note"}
                        </button>
                      )}
                    </div>

                    {isEditingNote || !actionNote ? (
                      <div className="space-y-1.5">
                        <textarea
                          value={actionNote}
                          onChange={(e) => setActionNote(e.target.value)}
                          placeholder={isTr ? "Bu eylemle ilgili adımlarınızı kaydedin (Örn: Çevrimiçi kursa başladım, Claude Code denedim)..." : "Write your progress notes or reflections here..."}
                          className="w-full text-xs font-mono bg-slate-900/80 border border-white/10 rounded-xl p-2.5 text-slate-200 focus:outline-none focus:border-cyan-400 resize-none h-16 transition-colors"
                        />
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-mono text-slate-400">
                            {noteSavedFeedback ? (isTr ? "✓ Not cihazınıza kaydedildi" : "✓ Saved locally") : ""}
                          </span>
                          <button
                            type="button"
                            onClick={() => {
                              if (rawMilestone) {
                                setMilestoneActionNote(rawMilestone.year, actionNote, currentUser?.email);
                                setIsEditingNote(false);
                                setNoteSavedFeedback(true);
                                setTimeout(() => setNoteSavedFeedback(false), 2500);
                              }
                            }}
                            className="px-3 py-1 bg-cyan-600 hover:bg-cyan-500 text-white font-mono text-[11px] font-bold rounded-lg transition cursor-pointer"
                          >
                            {isTr ? "Notu Kaydet" : "Save Note"}
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="p-2.5 rounded-xl bg-slate-900/80 border border-white/5 flex items-start justify-between gap-2">
                        <p className="text-xs text-slate-200 font-mono whitespace-pre-wrap leading-relaxed">
                          "{actionNote}"
                        </p>
                      </div>
                    )}
                  </div>
                </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
                {/* Action 1: Roadmap */}
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    if (onNavigateToView) onNavigateToView("roadmap", milestone.year);
                  }}
                  className="p-3.5 rounded-xl bg-slate-900/90 hover:bg-purple-950/70 border border-purple-500/30 hover:border-purple-400 text-left transition-all cursor-pointer group flex flex-col justify-between gap-2 shadow-md"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-purple-200 flex items-center gap-1.5">
                      <Compass className="w-3.5 h-3.5 text-purple-400 group-hover:rotate-45 transition-transform" />
                      <span>{isTr ? "Kişisel Yol Haritası" : "Personal Roadmap"}</span>
                    </span>
                    <ArrowRight className="w-3 h-3 text-purple-400 group-hover:translate-x-1 transition-transform" />
                  </div>
                  <p className="text-[11px] text-slate-400 font-sans leading-snug">
                    {isTr ? `${milestone.year} yılına özel adaptasyon ve beceri planınızı açın.` : `Open adaptation and skill plan for ${milestone.year}.`}
                  </p>
                </button>

                {/* Action 2: Job Risk */}
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    if (onNavigateToView) onNavigateToView("job_risk", milestone.year);
                  }}
                  className="p-3.5 rounded-xl bg-slate-900/90 hover:bg-rose-950/60 border border-rose-500/30 hover:border-rose-400 text-left transition-all cursor-pointer group flex flex-col justify-between gap-2 shadow-md"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-rose-200 flex items-center gap-1.5">
                      <ShieldAlert className="w-3.5 h-3.5 text-rose-400 group-hover:scale-110 transition-transform" />
                      <span>{isTr ? "Meslek Risk Raporu" : "Job Risk Report"}</span>
                    </span>
                    <ArrowRight className="w-3 h-3 text-rose-400 group-hover:translate-x-1 transition-transform" />
                  </div>
                  <p className="text-[11px] text-slate-400 font-sans leading-snug">
                    {isTr ? "Mesleğinizin gelecekteki otomasyon ve görev dağılımını test edin." : "Test future automation and task shifts in your profession."}
                  </p>
                </button>

                {/* Action 3: Live Intelligence */}
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    if (onNavigateToView) onNavigateToView("telegram_feed", milestone.year);
                  }}
                  className="p-3.5 rounded-xl bg-slate-900/90 hover:bg-cyan-950/70 border border-cyan-500/30 hover:border-cyan-400 text-left transition-all cursor-pointer group flex flex-col justify-between gap-2 shadow-md"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-cyan-200 flex items-center gap-1.5">
                      <Radio className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
                      <span>{isTr ? "Canlı İstihbarat & Radar" : "Live Signals Radar"}</span>
                    </span>
                    <ArrowRight className="w-3 h-3 text-cyan-400 group-hover:translate-x-1 transition-transform" />
                  </div>
                  <p className="text-[11px] text-slate-400 font-sans leading-snug">
                    {isTr ? "Bu projeksiyonu destekleyen arXiv, patent ve canlı sinyalleri izleyin." : "Track supporting arXiv, patents, and real-time signals."}
                  </p>
                </button>

                {/* Action 4: Persona Chat */}
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    if (onNavigateToView) onNavigateToView("persona_chat", milestone.year);
                  }}
                  className="p-3.5 rounded-xl bg-slate-900/90 hover:bg-amber-950/60 border border-amber-500/30 hover:border-amber-400 text-left transition-all cursor-pointer group flex flex-col justify-between gap-2 shadow-md"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-amber-200 flex items-center gap-1.5">
                      <Brain className="w-3.5 h-3.5 text-amber-400 group-hover:scale-110 transition-transform" />
                      <span>{isTr ? `${milestone.year} İnsanıyla Konuş` : `Chat with ${milestone.year}`}</span>
                    </span>
                    <ArrowRight className="w-3 h-3 text-amber-400 group-hover:translate-x-1 transition-transform" />
                  </div>
                  <p className="text-[11px] text-slate-400 font-sans leading-snug">
                    {isTr ? "O çağda yaşayan bir vatandaşla canlı yapay zeka sohbeti başlatın." : "Start AI dialogue with a citizen living in that era."}
                  </p>
                </button>
              </div>
            </div>
            )}
            </>
            ) : null}
          </div>
        )}

        {/* TAB 3: 5-LAYER WORLD STATE & BIO-LIFE AGE */}
        {activeModalTab === "five_layers" && (
          <div className="space-y-4 animate-fadeIn">
            <FiveLayerWorldStateView
              milestone={milestone}
              onSelectMilestone={onSelectMilestone}
              userBirthYear={currentUser?.age ? 2026 - currentUser.age : undefined}
            />

            {/* Quick Next Action Bridge */}
            <div className="p-4 rounded-2xl bg-gradient-to-r from-purple-950/40 via-indigo-950/30 to-slate-900 border border-purple-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-left">
              <div className="space-y-0.5">
                <span className="text-xs font-mono font-bold uppercase text-purple-300 flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-purple-400" />
                  <span>{isTr ? "Bu Kırılmanın Kişisel Etkisi & Yol Haritası" : "Personal Impact & Action Plan"}</span>
                </span>
                <p className="text-[11px] text-slate-400 font-sans">
                  {isTr
                    ? `${milestone.year} yılı için yaşınıza ve mesleğinize özel risk/fırsat analizini inceleyin.`
                    : `See how this ${milestone.year} milestone impacts your career and life roadmap.`}
                </p>
              </div>
              <button
                type="button"
                onClick={() => handleTabChange("personal_impact")}
                className="px-3.5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs font-sans flex items-center gap-1.5 shadow-md shadow-purple-600/30 transition-all cursor-pointer shrink-0 self-start sm:self-center"
              >
                <span>{isTr ? "Kişisel Analize Geç" : "View Personal Impact"}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}

        {/* TAB 4: RICH FUTURE STORY */}
        {activeModalTab === "rich_story" && (
          <div className="space-y-4 animate-fadeIn">
            {/* Extended Story Narrative */}
            <div className="bg-slate-800/50 border border-white/10 rounded-2xl p-5 sm:p-6 space-y-3 font-sans text-slate-200 leading-relaxed">
              <h4 className="text-xs font-mono font-bold text-purple-300 uppercase tracking-widest flex items-center gap-2">
                <Flame className="w-4 h-4 text-purple-400" />
                <span>{milestone.year} Kırılma Eşiği & Gelecek Hikayesi</span>
              </h4>
              <div className="space-y-3 text-xs sm:text-sm text-slate-300 whitespace-pre-line leading-relaxed">
                {richStory.extendedStory}
              </div>
            </div>

            {/* Living Scenario Snippet */}
            <div className="bg-purple-950/20 border border-purple-500/30 rounded-2xl p-4 sm:p-5 space-y-2">
              <div className="flex items-center gap-2 text-purple-300 font-bold text-xs font-mono">
                <Sparkles className="w-4 h-4 text-purple-400" />
                <span className="uppercase tracking-wider">Gündelik Hayattan Bir Kesit (Yaşam Simülasyonu)</span>
              </div>
              <p className="text-slate-200 text-xs sm:text-sm font-sans italic bg-slate-900/80 p-3.5 rounded-xl border border-white/5 leading-relaxed">
                "{richStory.livingScenarioSnippet}"
              </p>
            </div>

            {/* Societal Shift vs Technical Breakthroughs */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
              <div className="bg-slate-800/40 border border-white/10 rounded-2xl p-4 space-y-2">
                <h4 className="text-xs font-mono font-bold uppercase text-amber-300 flex items-center gap-2">
                  <Globe className="w-4 h-4 text-amber-400" />
                  <span>Toplumsal & Kültürel Dönüşüm</span>
                </h4>
                <p className="text-xs text-slate-300 font-sans leading-relaxed">
                  {richStory.societalShiftNarrative}
                </p>
              </div>

              <div className="bg-slate-800/40 border border-white/10 rounded-2xl p-4 space-y-2">
                <h4 className="text-xs font-mono font-bold uppercase text-blue-300 flex items-center gap-2">
                  <Binary className="w-4 h-4 text-blue-400" />
                  <span>Teknik & Mühendislik Kırılması</span>
                </h4>
                <p className="text-xs text-slate-300 font-sans leading-relaxed">
                  {richStory.technicalBreakthroughsNarrative}
                </p>
              </div>
            </div>

            {/* Quick Next Action Bridge */}
            <div className="p-4 rounded-2xl bg-gradient-to-r from-purple-950/40 via-indigo-950/30 to-slate-900 border border-purple-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-left">
              <div className="space-y-0.5">
                <span className="text-xs font-mono font-bold uppercase text-purple-300 flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-purple-400" />
                  <span>{isTr ? "Bu Hikaye Sizi Nasıl Etkiler?" : "How Does This Story Impact You?"}</span>
                </span>
                <p className="text-[11px] text-slate-400 font-sans">
                  {isTr
                    ? `${milestone.year} yılı için kariyer ve yaşam adaptasyon yol haritanızı inceleyin.`
                    : `Explore your career and life adaptation roadmap for ${milestone.year}.`}
                </p>
              </div>
              <button
                type="button"
                onClick={() => handleTabChange("personal_impact")}
                className="px-3.5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs font-sans flex items-center gap-1.5 shadow-md shadow-purple-600/30 transition-all cursor-pointer shrink-0 self-start sm:self-center"
              >
                <span>{isTr ? "Kişisel Analize Geç" : "View Personal Impact"}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}

        {/* TAB 5: ACADEMIC & TRL RADAR */}
        {activeModalTab === "academic_radar" && (
          <div className="space-y-4 animate-fadeIn">
            <AcademicTrlRadarCard milestone={milestone} />

            <ReferenceSourcesTab
              milestone={milestone}
              currentUser={currentUser}
              onOpenAuthModal={onOpenAuthModal}
            />

            {/* Quick Next Action Bridge */}
            <div className="p-4 rounded-2xl bg-gradient-to-r from-purple-950/40 via-indigo-950/30 to-slate-900 border border-purple-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-left">
              <div className="space-y-0.5">
                <span className="text-xs font-mono font-bold uppercase text-purple-300 flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-purple-400" />
                  <span>{isTr ? "Bilimsel Kanıttan Kişisel Eyleme" : "From Science to Personal Action"}</span>
                </span>
                <p className="text-[11px] text-slate-400 font-sans">
                  {isTr
                    ? `${milestone.year} bilimsel kanıtlarının kariyerinize ve yol haritanıza yansımalarını görün.`
                    : `See how ${milestone.year} scientific proofs translate into personal career action.`}
                </p>
              </div>
              <button
                type="button"
                onClick={() => handleTabChange("personal_impact")}
                className="px-3.5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs font-sans flex items-center gap-1.5 shadow-md shadow-purple-600/30 transition-all cursor-pointer shrink-0 self-start sm:self-center"
              >
                <span>{isTr ? "Kişisel Analize Geç" : "View Personal Impact"}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
