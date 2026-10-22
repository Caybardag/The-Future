import React, { useRef, useEffect } from "react";
import { Milestone, PhaseId, CategoryType } from "../types";
import { PHASES } from "../data/timelineData";
import { MilestoneIcon } from "../utils/iconHelper";
import { useLanguage } from "../context/LanguageContext";
import { isLegitimateProof } from "../services/evidenceService";
import { translateCategory } from "../utils/translations";
import { getLocalizedPhase } from "../utils/milestoneTranslations";
import { calculateDynamicProbability } from "../utils/probabilityCalculator";
import { getMilestoneConflicts, hasMilestoneConflict } from "../utils/conflictDetector";
import {
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  Play,
  Pause,
  Sparkles,
  Zap,
  TrendingUp,
  Brain,
  Layers,
  ArrowRight,
  HelpCircle,
  BookOpen,
  Cpu,
  Info,
  ShieldCheck,
  Activity,
  FileText,
  ExternalLink,
  GraduationCap,
  ShieldAlert,
  AlertTriangle,
  Lock,
  Globe,
  RefreshCw,
  SlidersHorizontal,
  Compass,
  Radio,
  Share2,
  List,
  LayoutGrid,
  ArrowUp,
  User,
  Briefcase,
  Target,
  Clock,
  AlertCircle,
  CheckCircle2,
  X,
  Calendar,
} from "lucide-react";

import { useAuth } from "../context/AuthContext";
import { UserProfile } from "./UserAuthModal";
import { ViewMode } from "../types";
import { CrossFeatureRecommendation } from "./CrossFeatureRecommendation";
import { BranchingRealitiesGraph } from "./BranchingRealitiesGraph";
import { MilestoneTreeExplorer } from "./MilestoneTreeExplorer";
import { getFiveLayerWorldState } from "../utils/worldStateResolver";
import { getRichStoryForMilestone } from "../data/milestoneRichStories";
import { safeFetchJson } from "../utils/apiClient";
import { MilestoneJobImpactModal } from "./MilestoneJobImpactModal";
import { MilestoneMissionControl } from "./MilestoneMissionControl";
import {
  calculateMilestonePersonalImpact,
  MilestonePersonalImpact,
  calculateTelegramSignalPersonalImpact,
  getPersonalizedTelegramSignals,
  TelegramSignalPersonalImpact,
  LiveIntelligenceSignal,
} from "../utils/personalTimelineEngine";
import { PredictionHistoryService } from "../services/predictionHistoryService";

interface BrainKnowledgeNode {
  id: string;
  category: string;
  year: number;
  title: string;
  trlLevel: string;
  scientificFeasibilityScore: number;
  groundingProofSummary: string;
  causalDependencies: string[];
  bottlenecksAndLimits: string[];
  crossDomainImpacts: {
    targetDomain: string;
    impactDescription: string;
  }[];
  telegramSignalsIncluded?: {
    newsTitle: string;
    channelTitle: string;
    impactVerdict: string;
  }[];
  lastEvaluatedAt: string;
  evaluatedByModel: string;
  isAuthentic: boolean;
}

interface TimelineViewProps {
  milestones: Milestone[];
  activeMilestone: Milestone;
  setActiveMilestone: (m: Milestone) => void;
  isPlaying?: boolean;
  setIsPlaying?: (p: boolean) => void;
  playbackSpeed?: number;
  setPlaybackSpeed?: (speed: number) => void;
  onOpenDetailModal: (
    m: Milestone,
    initialTab?: "overview" | "personal_impact" | "five_layers" | "rich_story" | "academic_radar"
  ) => void;
  totalCount?: number;
  selectedPhase?: PhaseId | "all";
  setSelectedPhase?: (p: PhaseId | "all") => void;
  selectedCategory?: CategoryType | "all";
  searchQuery?: string;
  onResetFilters?: () => void;
  scenarioMode?: "optimistic" | "baseline" | "dystopian";
  setScenarioMode?: (mode: "optimistic" | "baseline" | "dystopian") => void;
  onNavigateToView?: (view: ViewMode, targetYear?: number) => void;
  onSyncTimelineLive?: () => Promise<void>;
  isSyncingLiveScience?: boolean;
}

export const TimelineView: React.FC<TimelineViewProps> = ({
  milestones,
  activeMilestone,
  setActiveMilestone,
  isPlaying,
  setIsPlaying,
  playbackSpeed,
  setPlaybackSpeed,
  onOpenDetailModal,
  totalCount = 35,
  selectedPhase = "all",
  setSelectedPhase,
  selectedCategory = "all",
  searchQuery = "",
  onResetFilters,
  scenarioMode = "baseline",
  setScenarioMode,
  onNavigateToView,
  onSyncTimelineLive,
  isSyncingLiveScience = false,
}) => {
  const { language, t } = useLanguage();
  const authContext = useAuth();
  const isSuper = (authContext.currentUser?.email || "").toLowerCase().trim() === "warfacelove46@gmail.com";
  const isVerifiedUser = isSuper || (authContext.currentUser && authContext.currentUser.isPhoneVerified);
  const scrollerRef = useRef<HTMLDivElement>(null);

  // Verified proofs map from localStorage
  const [verifiedMap, setVerifiedMap] = React.useState<Record<number, any>>({});
  const [onlyVerified, setOnlyVerified] = React.useState<boolean>(false);

  // Autonomous Academic Literature (OpenAlex 250M Catalog)
  const [academicLiterature, setAcademicLiterature] = React.useState<any[]>([]);
  const [isLoadingAcademic, setIsLoadingAcademic] = React.useState<boolean>(false);

  useEffect(() => {
    let isMounted = true;
    async function fetchMilestoneAcademicPapers() {
      setIsLoadingAcademic(true);
      try {
        const q = encodeURIComponent(activeMilestone.title);
        const cat = encodeURIComponent(activeMilestone.category);
        const res = await fetch(`/api/academic/search?query=${q}&category=${cat}&limit=3`);
        if (res.ok) {
          const data = await res.json();
          if (isMounted && data.results && data.results.length > 0) {
            setAcademicLiterature(data.results);
          } else if (isMounted) {
            setAcademicLiterature([]);
          }
        }
      } catch (e) {
        console.warn("Academic papers fetch note:", e);
      } finally {
        if (isMounted) setIsLoadingAcademic(false);
      }
    }
    fetchMilestoneAcademicPapers();
    return () => {
      isMounted = false;
    };
  }, [activeMilestone.year, activeMilestone.title, activeMilestone.category]);

  // Smooth Rolling Digital Year Animation
  const [displayYear, setDisplayYear] = React.useState<number>(activeMilestone.year);
  const previousYearRef = useRef<number>(activeMilestone.year);
  const animationFrameRef = useRef<number | null>(null);

  useEffect(() => {
    const fromYear = previousYearRef.current;
    const toYear = activeMilestone.year;

    if (fromYear !== toYear) {
      // Smooth digital rolling counter over transition
      const durationMs = 380;
      const startTime = performance.now();

      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }

      const step = (currentTime: number) => {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / durationMs, 1);
        // Smooth cubic ease out
        const easeOut = 1 - Math.pow(1 - progress, 3);
        const currentCalculatedYear = Math.round(fromYear + (toYear - fromYear) * easeOut);
        setDisplayYear(currentCalculatedYear);

        if (progress < 1) {
          animationFrameRef.current = requestAnimationFrame(step);
        } else {
          setDisplayYear(toYear);
        }
      };

      animationFrameRef.current = requestAnimationFrame(step);
      previousYearRef.current = toYear;
    } else {
      setDisplayYear(toYear);
    }

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [activeMilestone.year]);

  React.useEffect(() => {
    const loadVerified = () => {
      try {
        const saved = localStorage.getItem("milestone_evidence_proofs");
        if (saved) {
          const parsed = JSON.parse(saved);
          const map: Record<number, any> = {};
          if (Array.isArray(parsed)) {
            parsed.forEach((p) => {
              if (p.aiVerdict === "ONAYLANDI" && isLegitimateProof(p)) {
                if (!map[p.year] || p.aiVerificationScore > map[p.year].aiVerificationScore) {
                  map[p.year] = p;
                }
              }
            });
          }
          setVerifiedMap(map);
        }
      } catch (e) {
        console.error(e);
      }
    };
    loadVerified();
    window.addEventListener("storage", loadVerified);
    return () => window.removeEventListener("storage", loadVerified);
  }, []);

  const displayedMilestones = onlyVerified
    ? (milestones || []).filter((m) => Boolean(verifiedMap[m.year]))
    : (milestones || []);

  // Scope: Global World Timeline vs Personal Future Timeline ("Benim Geleceğim")
  const [timelineScope, setTimelineScope] = React.useState<"global" | "personal">("global");
  const [onlyHighRelevance, setOnlyHighRelevance] = React.useState<boolean>(false);

  // Retrieve isolated user predictions (Roadmap & Job Risk)
  const userPredictions = React.useMemo(() => {
    if (!authContext.currentUser?.email) return [];
    return PredictionHistoryService.getLocalPredictions(authContext.currentUser.email);
  }, [authContext.currentUser?.email]);

  const userRoadmapRecord = React.useMemo(() => {
    return userPredictions.find((p) => p.featureKey === "personal_roadmap") || null;
  }, [userPredictions]);

  const userJobRiskRecord = React.useMemo(() => {
    return userPredictions.find((p) => p.featureKey === "job_risk") || null;
  }, [userPredictions]);

  // Memoized personal impact map for all milestones
  const personalImpactMap = React.useMemo(() => {
    const map = new Map<number, MilestonePersonalImpact>();
    for (const m of milestones) {
      map.set(
        m.year,
        calculateMilestonePersonalImpact(m, authContext.currentUser, userRoadmapRecord, userJobRiskRecord)
      );
    }
    return map;
  }, [milestones, authContext.currentUser, userRoadmapRecord, userJobRiskRecord]);

  const activeMilestonePersonalImpact = React.useMemo(() => {
    return personalImpactMap.get(activeMilestone.year) || calculateMilestonePersonalImpact(activeMilestone, authContext.currentUser, userRoadmapRecord, userJobRiskRecord);
  }, [personalImpactMap, activeMilestone, authContext.currentUser, userRoadmapRecord, userJobRiskRecord]);

  const highRelevanceCount = React.useMemo(() => {
    return displayedMilestones.filter((m) => {
      const imp = personalImpactMap.get(m.year);
      return imp?.relevanceLevel === "high" || imp?.relevanceLevel === "medium";
    }).length;
  }, [displayedMilestones, personalImpactMap]);

  // Phase 18: Live Intelligence (Telegram / Signals) State & Personal Matching
  const [liveSignals, setLiveSignals] = React.useState<LiveIntelligenceSignal[]>(() => {
    try {
      const cached = localStorage.getItem("quantum_telegram_intelligence_cache_v2");
      if (cached) {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch (e) {
      // ignore
    }
    return [];
  });

  const [selectedSignalForDetail, setSelectedSignalForDetail] = React.useState<{
    signal: LiveIntelligenceSignal;
    impact: TelegramSignalPersonalImpact;
  } | null>(null);

  React.useEffect(() => {
    let isMounted = true;
    safeFetchJson<{ success: boolean; feed: LiveIntelligenceSignal[] }>("/api/telegram/feed?limit=60")
      .then((res) => {
        if (isMounted && res?.success && Array.isArray(res.feed) && res.feed.length > 0) {
          setLiveSignals(res.feed);
        }
      })
      .catch(() => {});
    return () => {
      isMounted = false;
    };
  }, []);

  const personalizedLiveSignals = React.useMemo(() => {
    return getPersonalizedTelegramSignals(
      liveSignals,
      authContext.currentUser,
      userRoadmapRecord,
      userJobRiskRecord,
      milestones,
      { onlyHighRelevance: false, sortByScore: true }
    );
  }, [liveSignals, authContext.currentUser, userRoadmapRecord, userJobRiskRecord, milestones]);

  const highRelevanceLiveSignals = React.useMemo(() => {
    return personalizedLiveSignals.filter(
      (item) => item.impact.relevanceLevel === "high" || item.impact.relevanceLevel === "medium"
    );
  }, [personalizedLiveSignals]);

  const activeMilestoneLiveSignals = React.useMemo(() => {
    return personalizedLiveSignals.filter((item) => {
      const isYearMatch = (item.signal.matchedMilestoneYear || item.signal.extractedYear) === activeMilestone.year;
      const isCatMatch = item.signal.category === activeMilestone.category;
      const isHigh = item.impact.relevanceLevel === "high" || item.impact.relevanceLevel === "medium";
      return (isYearMatch || (isCatMatch && item.impact.relevanceLevel === "high")) && isHigh;
    });
  }, [personalizedLiveSignals, activeMilestone]);

  // Era filter for chronological list: "all" | 1 (2026-2030) | 2 (2031-2040) | 3 (2041-2060)
  type EraFilterType = "all" | 1 | 2 | 3;
  const [selectedEra, setSelectedEra] = React.useState<EraFilterType>("all");

  // View layout mode: "grid" (bento cards) vs "compact" (super fluid single-row list)
  const [layoutMode, setLayoutMode] = React.useState<"grid" | "compact">("grid");

  // Progressive card loading to avoid endless scrolling fatigue
  const [visibleCardsCount, setVisibleCardsCount] = React.useState<number>(6);

  // Active milestone tabbed mission control (reduces vertical scroll by ~70%)
  type HeroTab = "overview" | "brain" | "evidence" | "telemetry" | "tree";
  const [activeHeroTab, setActiveHeroTab] = React.useState<HeroTab>("overview");

  // Floating back to top visibility
  const [showBackToTop, setShowBackToTop] = React.useState<boolean>(false);

  useEffect(() => {
    const handleScroll = () => {
      setShowBackToTop(window.scrollY > 400);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const eraFilteredMilestones = React.useMemo(() => {
    let list = displayedMilestones;
    if (selectedEra !== "all") {
      list = list.filter((m) => m.phase === selectedEra);
    }
    if (timelineScope === "personal" && onlyHighRelevance) {
      list = list.filter((m) => {
        const imp = personalImpactMap.get(m.year);
        return imp?.relevanceLevel === "high" || imp?.relevanceLevel === "medium";
      });
    }
    return list;
  }, [displayedMilestones, selectedEra, timelineScope, onlyHighRelevance, personalImpactMap]);

  const eraCounts = React.useMemo(() => {
    return {
      all: displayedMilestones.length,
      p1: displayedMilestones.filter((m) => m.phase === 1).length,
      p2: displayedMilestones.filter((m) => m.phase === 2).length,
      p3: displayedMilestones.filter((m) => m.phase === 3).length,
    };
  }, [displayedMilestones]);

  // Autonomous System Brain Live State
  const [brainNodes, setBrainNodes] = React.useState<BrainKnowledgeNode[]>([]);
  const [isBrainSyncing, setIsBrainSyncing] = React.useState<boolean>(false);
  const [showBrainDetails, setShowBrainDetails] = React.useState<boolean>(true);

  useEffect(() => {
    let isMounted = true;
    const fetchBrainData = async () => {
      if (!isMounted || document.hidden) return;
      try {
        setIsBrainSyncing(true);
        const res = await safeFetchJson<{ success: boolean; nodes: BrainKnowledgeNode[]; totalNodes: number }>("/api/brain/knowledge-matrix");
        if (res && res.success && Array.isArray(res.nodes) && isMounted) {
          setBrainNodes(res.nodes);
        }
      } catch (err) {
        console.warn("Could not load brain matrix:", err);
      } finally {
        if (isMounted) setIsBrainSyncing(false);
      }
    };

    fetchBrainData();
    const interval = setInterval(fetchBrainData, 30000);

    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        fetchBrainData();
      }
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      isMounted = false;
      clearInterval(interval);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, []);

  // Ensure the page starts at the top when entering the timeline
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "instant" });
  }, []);

  // Collapsible drawers for advanced evidence and telemetry metrics
  const [showEvidenceDrawer, setShowEvidenceDrawer] = React.useState<boolean>(false);
  const [showMetricsDrawer, setShowMetricsDrawer] = React.useState<boolean>(false);
  // Dedicated modal for immediate milestone career/job impact analysis
  const [jobImpactModalMilestone, setJobImpactModalMilestone] = React.useState<Milestone | null>(null);

  // Auto-scroll drawers into visible screen when opened so they don't open hidden down below
  useEffect(() => {
    if (showEvidenceDrawer) {
      setTimeout(() => {
        const el = document.getElementById("evidence-drawer-section");
        if (el) el.scrollIntoView({ behavior: "smooth", block: "nearest" });
      }, 50);
    }
  }, [showEvidenceDrawer]);

  useEffect(() => {
    if (showMetricsDrawer) {
      setTimeout(() => {
        const el = document.getElementById("metrics-drawer-section");
        if (el) el.scrollIntoView({ behavior: "smooth", block: "nearest" });
      }, 50);
    }
  }, [showMetricsDrawer]);

  // Auto-scroll the top timeline strip horizontally when activeMilestone changes
  // NOTE: We deliberately use scroller.scrollTo (horizontal only) rather than element.scrollIntoView
  // because scrollIntoView triggers vertical document shifts on mobile browsers.
  useEffect(() => {
    if (scrollerRef.current && activeMilestone?.year) {
      const activeElem = scrollerRef.current.querySelector(`[data-year="${activeMilestone.year}"]`);
      if (activeElem && scrollerRef.current) {
        const scroller = scrollerRef.current;
        const elem = activeElem as HTMLElement;
        const targetScrollLeft = elem.offsetLeft - scroller.offsetWidth / 2 + elem.offsetWidth / 2;
        scroller.scrollTo({ left: targetScrollLeft, behavior: "smooth" });
      }
    }
  }, [activeMilestone?.year]);

  const rawPhase = PHASES.find((p) => p.id === activeMilestone.phase);
  const activePhase = rawPhase ? getLocalizedPhase(rawPhase, language) : null;

  const handlePrev = () => {
    const currentIndex = displayedMilestones.findIndex((m) => m.year === activeMilestone.year);
    if (currentIndex > 0) {
      setActiveMilestone(displayedMilestones[currentIndex - 1]);
    }
  };

  const handleNext = () => {
    const currentIndex = displayedMilestones.findIndex((m) => m.year === activeMilestone.year);
    if (currentIndex < displayedMilestones.length - 1) {
      setActiveMilestone(displayedMilestones[currentIndex + 1]);
    }
  };

  // Card swipe gesture detection
  const cardTouchRef = useRef<{ x: number; y: number } | null>(null);
  const handleCardTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 1) {
      cardTouchRef.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
    }
  };
  const handleCardTouchEnd = (e: React.TouchEvent) => {
    if (!cardTouchRef.current || e.changedTouches.length !== 1) return;
    const deltaX = e.changedTouches[0].clientX - cardTouchRef.current.x;
    const deltaY = e.changedTouches[0].clientY - cardTouchRef.current.y;
    cardTouchRef.current = null;

    if (Math.abs(deltaX) > 45 && Math.abs(deltaX) > Math.abs(deltaY) * 1.3) {
      if (deltaX < 0) {
        handleNext();
      } else {
        handlePrev();
      }
    }
  };

  return (
    <div className="space-y-6 pb-12 relative">
      {/* Active Filter Banner if filtered */}
      {(selectedPhase !== "all" || selectedCategory !== "all" || searchQuery !== "") && (
        <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-3 flex flex-wrap items-center justify-between gap-3 text-xs font-mono text-amber-300">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
            <span>
              {language === "tr"
                ? `Filtre Aktif: ${milestones.length} / ${totalCount} olay gösteriliyor.`
                : `Filter Active: Showing ${milestones.length} of ${totalCount} milestones.`}
              {selectedPhase !== "all" && (
                <strong className="ml-1 text-white">
                  ({language === "tr" ? `Aşama ${selectedPhase}` : `Phase ${selectedPhase}`})
                </strong>
              )}
            </span>
          </div>

          <div className="flex items-center gap-2">
            {setSelectedPhase && (
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setSelectedPhase("all")}
                  className={`px-2 py-0.5 rounded text-[11px] border cursor-pointer ${
                    selectedPhase === "all"
                      ? "bg-amber-400 text-slate-950 font-bold border-amber-400"
                      : "bg-slate-900 text-amber-300 border-amber-500/40 hover:bg-amber-500/20"
                  }`}
                >
                  Tüm Yıllar (2026-2060)
                </button>
              </div>
            )}

            {onResetFilters && (
              <button
                onClick={onResetFilters}
                className="px-2.5 py-1 rounded bg-amber-500/20 hover:bg-amber-500/40 text-white font-bold border border-amber-500/40 transition-colors cursor-pointer"
              >
                {language === "tr" ? "Filtreleri Temizle" : "Reset Filters"}
              </button>
            )}
          </div>
        </div>
      )}

      {/* 1. HORIZONTAL TIME SCRUBBER STRIP (Bento Header Cell) */}
      <div id="timeline-main-view" className="bg-slate-900/40 border border-white/5 rounded-2xl p-4 shadow-2xl relative overflow-hidden space-y-3">
        
        {/* Top Control Bar: Title, Scenario Switcher & Clean Stepper */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/5 pb-2.5">
          {/* Left: Clean Title */}
          <div className="flex items-center gap-2.5 flex-wrap">
            <Sparkles className="w-4 h-4 text-purple-400" />
            <h2 className="text-xs font-bold uppercase tracking-widest text-slate-200 font-mono">
              2026—2060 {t("timeline_view")}
            </h2>
            <span className="text-[11px] text-purple-300/80 font-mono bg-purple-950/40 px-2 py-0.5 rounded-full border border-purple-500/20">
              {displayedMilestones.length} Yıl
            </span>
          </div>

          {/* Middle: Scope Switcher [ Dünya ] [ Benim Geleceğim ] & Scenario Switcher */}
          <div className="flex items-center gap-2 flex-wrap">
            <div className="flex items-center gap-1 bg-slate-950/90 border border-white/10 rounded-xl p-1 text-xs font-mono shadow-inner">
              <button
                type="button"
                onClick={() => setTimelineScope("global")}
                className={`px-3 py-1 rounded-lg transition-all text-xs font-bold cursor-pointer flex items-center gap-1.5 ${
                  timelineScope === "global"
                    ? "bg-blue-600 text-white shadow-md shadow-blue-500/30"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                <Globe className="w-3.5 h-3.5" />
                <span>{language === "tr" ? "Dünya Geleceği" : "World Timeline"}</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  if (!authContext.currentUser) {
                    authContext.openAuthModal();
                  } else {
                    setTimelineScope("personal");
                  }
                }}
                className={`px-3 py-1 rounded-lg transition-all text-xs font-bold cursor-pointer flex items-center gap-1.5 ${
                  timelineScope === "personal"
                    ? "bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-md shadow-purple-500/30 ring-1 ring-purple-400/40"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                <User className="w-3.5 h-3.5 text-purple-300" />
                <span>{language === "tr" ? "Benim Geleceğim" : "My Future"}</span>
                {authContext.currentUser && (
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                )}
              </button>
            </div>

            {setScenarioMode && (
              <div id="scenario-switcher-bar" className="flex items-center gap-1 bg-slate-950/90 border border-white/10 rounded-xl p-1 text-xs font-mono">
                <button
                  type="button"
                  onClick={() => setScenarioMode("baseline")}
                  className={`px-2 py-1 rounded-lg transition-all text-[11px] font-bold cursor-pointer ${
                    scenarioMode === "baseline"
                      ? "bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/30"
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  {language === "tr" ? "Baz" : "Base"}
                </button>
                <button
                  type="button"
                  onClick={() => setScenarioMode("optimistic")}
                  className={`px-2 py-1 rounded-lg transition-all text-[11px] font-bold cursor-pointer ${
                    scenarioMode === "optimistic"
                      ? "bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/30"
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  {language === "tr" ? "İyimser" : "Opt"}
                </button>
                <button
                  type="button"
                  onClick={() => setScenarioMode("dystopian")}
                  className={`px-2 py-1 rounded-lg transition-all text-[11px] font-bold cursor-pointer ${
                    scenarioMode === "dystopian"
                      ? "bg-rose-500 text-slate-950 shadow-md shadow-rose-500/30"
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  {language === "tr" ? "Distopik" : "Dys"}
                </button>
              </div>
            )}
          </div>

          {/* Right: Sleek Year Stepper */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono text-purple-300 font-bold bg-slate-950/80 px-2.5 py-1 rounded-xl border border-white/10">
              {activeMilestone.year} • {activeMilestone.title}
            </span>
            <div className="flex items-center gap-1 bg-slate-950/80 border border-white/10 rounded-xl p-1 text-xs font-mono">
              <button
                onClick={handlePrev}
                className="p-1 rounded-lg bg-slate-800/60 text-slate-300 hover:bg-slate-700 hover:text-white disabled:opacity-30 border border-white/5 cursor-pointer transition-all"
                disabled={displayedMilestones[0]?.year === activeMilestone.year}
                title="Önceki Yıl"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={handleNext}
                className="p-1 rounded-lg bg-slate-800/60 text-slate-300 hover:bg-slate-700 hover:text-white disabled:opacity-30 border border-white/5 cursor-pointer transition-all"
                disabled={displayedMilestones[displayedMilestones.length - 1]?.year === activeMilestone.year}
                title="Sonraki Yıl"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Personal Future Scope Dashboard & Guidance */}
        {timelineScope === "personal" && (
          <div className="p-4 rounded-xl bg-gradient-to-r from-purple-950/30 via-indigo-950/20 to-slate-900/60 border border-purple-500/25 space-y-3 font-mono animate-fadeIn">
            {!authContext.currentUser ? (
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                <div className="flex items-start gap-2.5">
                  <AlertCircle className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" />
                  <div className="space-y-0.5 font-sans">
                    <p className="font-bold text-white">
                      {language === "tr" ? "Geleceğinizi Kişiselleştirin" : "Personalize Your Future"}
                    </p>
                    <p className="text-slate-300 text-xs">
                      {language === "tr"
                        ? "Giriş yaparak mesleğinize, yaşınıza ve hedeflerinize özel bir 2026-2060 etki filtresi oluşturun."
                        : "Login to generate a tailored 2026-2060 timeline impact based on your profession and age."}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => authContext.openAuthModal()}
                  className="px-3.5 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs transition cursor-pointer flex items-center gap-1.5 shadow-md shadow-purple-600/30 shrink-0 self-start sm:self-center"
                >
                  <User className="w-3.5 h-3.5" />
                  <span>{language === "tr" ? "Giriş Yap / Kaydol" : "Login / Sign Up"}</span>
                </button>
              </div>
            ) : !authContext.currentUser.profession ? (
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                <div className="flex items-start gap-2.5">
                  <AlertCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                  <div className="space-y-0.5 font-sans">
                    <p className="font-bold text-amber-200">
                      {language === "tr" ? "Meslek ve Yaş Bilgisi Eksik" : "Profession & Age Missing"}
                    </p>
                    <p className="text-slate-300 text-xs">
                      {language === "tr"
                        ? "Mesleğinizi ve yaşınızı profilinize ekleyerek hangi dönüm noktalarının sizi doğrudan etkilediğini görebilirsiniz."
                        : "Add your profession and age to your profile to see which milestones directly affect you."}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => window.dispatchEvent(new CustomEvent("open_profile_completion"))}
                  className="px-3.5 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs transition cursor-pointer flex items-center gap-1.5 shadow-md shadow-amber-500/20 shrink-0 self-start sm:self-center"
                >
                  <User className="w-3.5 h-3.5" />
                  <span>{language === "tr" ? "Profili Tamamla" : "Complete Profile"}</span>
                </button>
              </div>
            ) : (
              <>
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
                  <div className="flex items-center gap-3 flex-wrap">
                    <div className="flex items-center gap-2 text-xs">
                      <span className="text-purple-300 font-bold flex items-center gap-1">
                        <Briefcase className="w-3.5 h-3.5 text-purple-400" />
                        <span>{authContext.currentUser.profession}</span>
                      </span>
                      <span className="text-slate-500">•</span>
                      <span className="text-cyan-300">
                        {language === "tr" ? `2026: ${authContext.currentUser.age || 28} Yaş` : `2026: Age ${authContext.currentUser.age || 28}`}
                      </span>
                      <span className="text-slate-500">→</span>
                      <span className="text-purple-300">
                        {language === "tr" ? `2060: ${(authContext.currentUser.age || 28) + 34} Yaş` : `2060: Age ${(authContext.currentUser.age || 28) + 34}`}
                      </span>
                    </div>

                    <span className={`text-[11px] px-2 py-0.5 rounded-full border ${
                      userRoadmapRecord
                        ? "bg-emerald-500/10 text-emerald-300 border-emerald-500/30"
                        : "bg-blue-500/10 text-blue-300 border-blue-500/30"
                    }`}>
                      {userRoadmapRecord
                        ? (language === "tr" ? "✓ Yol Haritası Entegre" : "✓ Roadmap Integrated")
                        : (language === "tr" ? "💡 Yol Haritası Önerilir" : "💡 Roadmap Available")}
                    </span>
                  </div>

                  {/* Relevance Filter Toggle */}
                  <div className="flex items-center gap-1.5 shrink-0 self-start lg:self-center">
                    <button
                      type="button"
                      onClick={() => setOnlyHighRelevance(false)}
                      className={`px-2.5 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
                        !onlyHighRelevance
                          ? "bg-purple-600 text-white shadow-sm shadow-purple-500/30"
                          : "bg-slate-900/60 text-slate-400 hover:text-white border border-white/5"
                      }`}
                    >
                      {language === "tr" ? `Tüm Yıllar (${displayedMilestones.length})` : `All Milestones (${displayedMilestones.length})`}
                    </button>
                    <button
                      type="button"
                      onClick={() => setOnlyHighRelevance(true)}
                      className={`px-2.5 py-1 rounded-lg text-xs font-bold transition cursor-pointer flex items-center gap-1.5 ${
                        onlyHighRelevance
                          ? "bg-amber-500 text-slate-950 shadow-sm shadow-amber-500/30 font-extrabold"
                          : "bg-slate-900/60 text-slate-400 hover:text-white border border-white/5"
                      }`}
                    >
                      <Target className="w-3.5 h-3.5 text-amber-400" />
                      <span>{language === "tr" ? `Kritik & Orta Etkili (${highRelevanceCount})` : `High & Medium (${highRelevanceCount})`}</span>
                    </button>
                  </div>
                </div>

                {/* Phase 18: Live Intelligence Stream Matching User's Future */}
                {highRelevanceLiveSignals.length > 0 && (
                  <div className="pt-3 border-t border-purple-500/20 space-y-2">
                    <div className="flex items-center justify-between flex-wrap gap-2 text-xs">
                      <div className="flex items-center gap-2">
                        <Radio className="w-3.5 h-3.5 text-purple-400 animate-pulse" />
                        <span className="font-bold text-white font-mono">
                          {language === "tr" ? "Beni Etkileyen Canlı Gelişmeler" : "Live Signals Affecting You"}
                        </span>
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30">
                          {highRelevanceLiveSignals.length} {language === "tr" ? "Aktif Sinyal" : "Signals"}
                        </span>
                      </div>

                      {onNavigateToView && (
                        <button
                          type="button"
                          onClick={() => onNavigateToView("network")}
                          className="text-[11px] text-purple-400 hover:text-purple-300 flex items-center gap-1 font-mono hover:underline cursor-pointer"
                        >
                          <span>{language === "tr" ? "Tüm İstihbarat Akışını Aç" : "View Intelligence Vault"}</span>
                          <ArrowRight className="w-3 h-3" />
                        </button>
                      )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2.5">
                      {highRelevanceLiveSignals.slice(0, 3).map(({ signal, impact }, sIdx) => (
                        <div
                          key={`live-sig-${signal.id}-${sIdx}`}
                          onClick={() => setSelectedSignalForDetail({ signal, impact })}
                          className="p-3 rounded-xl bg-slate-900/90 hover:bg-slate-800/90 border border-purple-500/20 hover:border-purple-400/50 transition cursor-pointer space-y-2 group shadow-sm text-left"
                        >
                          <div className="flex items-center justify-between gap-1 text-[11px] font-mono">
                            <span className="px-1.5 py-0.5 rounded bg-purple-600/30 text-purple-300 font-bold border border-purple-500/30">
                              {signal.extractedYear || 2026}
                            </span>
                            <span className={`px-1.5 py-0.2 rounded border font-bold ${
                              impact.relevanceLevel === "high"
                                ? "bg-amber-500/20 text-amber-300 border-amber-500/30"
                                : "bg-purple-500/20 text-purple-300 border-purple-500/30"
                            }`}>
                              %{impact.relevanceScore} {language === "tr" ? "İlgi" : "Score"}
                            </span>
                          </div>

                          <h4 className="text-xs font-bold text-white line-clamp-1 group-hover:text-purple-200 transition">
                            {signal.title}
                          </h4>

                          <p className="text-[11px] text-slate-300 line-clamp-2 leading-relaxed">
                            {impact.careerImpactSummary}
                          </p>

                          <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1 border-t border-white/5 font-mono">
                            <span className="text-emerald-400 truncate max-w-[150px]">
                              {impact.matchedMilestone ? `→ ${impact.matchedMilestone.year} ${impact.matchedMilestone.title}` : signal.category}
                            </span>
                            <span className="text-purple-300 group-hover:translate-x-0.5 transition-transform flex items-center gap-0.5">
                              {language === "tr" ? "İncele" : "Detail"} →
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {/* Year nodes scroll strip with edge gradient indicators */}
        <div className="relative group/yearstrip">
          {/* Left subtle fade */}
          <div className="absolute left-0 top-0 bottom-2 w-6 bg-gradient-to-r from-slate-900/90 to-transparent pointer-events-none z-10" />
          {/* Right subtle fade */}
          <div className="absolute right-0 top-0 bottom-2 w-6 bg-gradient-to-l from-slate-900/90 to-transparent pointer-events-none z-10" />

          <div
            ref={scrollerRef}
            className="flex items-center gap-2 overflow-x-auto pb-2 pt-1 scrollbar-thin scrollbar-thumb-slate-800 scrollbar-track-transparent px-3"
          >
            {(displayedMilestones || []).map((m, idx) => {
              const isActive = m.year === activeMilestone.year;
              const phaseColor =
                m.phase === 1 ? "#3b82f6" : m.phase === 2 ? "#f59e0b" : "#a855f7";

              return (
                <button
                  key={`scroller-${m.year}-${m.title}-${idx}`}
                  data-year={m.year}
                  onClick={() => setActiveMilestone(m)}
                  className={`flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-mono font-bold transition-all cursor-pointer ${
                    isActive
                      ? "bg-purple-600 border-purple-400 text-white shadow-lg shadow-purple-500/25 ring-2 ring-purple-400/40"
                      : "bg-slate-950/80 border-white/10 text-slate-400 hover:text-slate-200 hover:border-white/20 hover:bg-slate-900"
                  }`}
                >
                  <span
                    className="w-2 h-2 rounded-full shrink-0"
                    style={{ backgroundColor: isActive ? "#ffffff" : phaseColor }}
                  />
                  <span>{m.year}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* 2. FEATURE SPOTLIGHT: IMMERSIVE FUTURE CHRONICLE HERO */}
      <div id="timeline-spotlight-hero" className="space-y-4 scroll-mt-28">
        {/* Main Active Milestone Chronicle Card (Supports Touch Swipe for Next/Prev Milestones) */}
        <div
          onTouchStart={handleCardTouchStart}
          onTouchEnd={handleCardTouchEnd}
          className="bg-slate-900/60 backdrop-blur-xl border border-white/10 rounded-3xl p-6 sm:p-8 relative overflow-hidden group transition-all duration-300 shadow-2xl touch-pan-y"
        >
          <div className="space-y-6 relative z-10">
            {/* Clean Minimalist Meta Bar */}
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/10 pb-3 text-xs">
              <div className="flex flex-wrap items-center gap-2 text-slate-300">
                <span
                  className="font-mono text-xs font-bold px-2.5 py-0.5 rounded-md border flex items-center gap-1.5"
                  style={{
                    color: activePhase?.color || "#3b82f6",
                    borderColor: `${activePhase?.color || "#3b82f6"}40`,
                    backgroundColor: `${activePhase?.color || "#3b82f6"}15`,
                  }}
                >
                  <Layers className="w-3.5 h-3.5" />
                  <span>Faz 0{activeMilestone.phase} • {activePhase?.subtitle}</span>
                </span>

                <span className="text-slate-400 flex items-center gap-1 font-medium bg-slate-800/80 px-2.5 py-0.5 rounded-md border border-white/5">
                  <MilestoneIcon name={activeMilestone.iconName} size={13} />
                  <span>{translateCategory(activeMilestone.category, language)}</span>
                </span>

                {verifiedMap[activeMilestone.year] && (
                  <span className="px-2 py-0.5 rounded-md bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[11px] font-medium flex items-center gap-1" title="Bilimsel kanıt ve patent verileriyle onaylandı">
                    <ShieldCheck className="w-3 h-3 text-emerald-400" />
                    <span>Onaylı</span>
                  </span>
                )}

                {activeMilestone.signals && activeMilestone.signals.length > 0 && (
                  <span className="px-2 py-0.5 rounded-md bg-cyan-500/10 border border-cyan-500/20 text-cyan-300 text-[11px] font-medium flex items-center gap-1" title="Canlı istihbarat akışından gelen sinyaller">
                    <Radio className="w-3 h-3 text-cyan-400" />
                    <span>{activeMilestone.signals.length} Sinyal</span>
                  </span>
                )}

                {/* Phase 18: Live Signals Affecting User for this Milestone */}
                {timelineScope === "personal" && activeMilestoneLiveSignals.length > 0 && (
                  <button
                    type="button"
                    onClick={() => setSelectedSignalForDetail(activeMilestoneLiveSignals[0])}
                    className="px-2.5 py-0.5 rounded-md bg-purple-500/20 hover:bg-purple-500/30 border border-purple-500/40 text-purple-200 text-[11px] font-mono font-bold flex items-center gap-1.5 transition cursor-pointer shadow-sm animate-pulse"
                    title={language === "tr" ? "Bu dönüm noktasıyla eşleşen canlı haberleri incele" : "Review live signals matching this milestone"}
                  >
                    <Radio className="w-3 h-3 text-purple-400" />
                    <span>{activeMilestoneLiveSignals.length} {language === "tr" ? "Canlı Gelişme Sizi Etkiliyor" : "Live Signals"}</span>
                  </button>
                )}

                {activeMilestone.isDynamicBreakthrough && (
                  <span className="px-2 py-0.5 rounded-md bg-amber-500/10 border border-amber-500/20 text-amber-300 text-[11px] font-medium flex items-center gap-1">
                    <Sparkles className="w-3 h-3 text-amber-400" />
                    <span>Dinamik</span>
                  </span>
                )}

                {(() => {
                  const conflicts = getMilestoneConflicts(activeMilestone, milestones);
                  if (conflicts.length === 0) return null;
                  return (
                    <button
                      type="button"
                      onClick={() => onOpenDetailModal(activeMilestone)}
                      className="px-2.5 py-0.5 rounded-md bg-rose-500/15 hover:bg-rose-500/25 border border-rose-500/30 text-rose-300 text-[11px] font-medium flex items-center gap-1 transition cursor-pointer"
                      title="Bu dönüm noktası için mantıksal çelişki tespit edildi. Detaylar için tıklayın."
                    >
                      <AlertTriangle className="w-3 h-3 text-rose-400" />
                      <span>{conflicts.length} Çelişki</span>
                    </button>
                  );
                })()}
              </div>

              {(() => {
                const probInfo = calculateDynamicProbability(activeMilestone.probability, activeMilestone.year);
                return (
                  <div
                    className="flex items-center gap-1.5 text-xs font-mono font-semibold px-2.5 py-0.5 rounded-md bg-slate-900 border border-white/10 text-slate-300"
                    title={probInfo.explanation}
                  >
                    <Zap className={`w-3.5 h-3.5 ${probInfo.adjustedProbability > 75 ? "text-emerald-400" : probInfo.adjustedProbability > 50 ? "text-amber-400" : "text-purple-400"}`} />
                    <span>%{probInfo.adjustedProbability} {language === "tr" ? "Model Olasılık Skoru" : "Model Score"}</span>
                  </div>
                );
              })()}
            </div>

            {/* Title & Rolling Year Hero Header */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6">
              <div className="relative select-none shrink-0">
                <div className="text-5xl sm:text-7xl font-mono font-black tracking-tight text-blue-400">
                  {displayYear}
                </div>

                <div className="text-[10px] font-mono font-bold tracking-widest text-slate-500 uppercase mt-0.5 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-blue-500" />
                  <span>KİLOMETRE TAŞI</span>
                </div>
              </div>

              <div className="flex-1 space-y-1.5">
                <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-white tracking-tight leading-snug">
                  {activeMilestone.title}
                </h2>
                <p className="text-xs sm:text-sm text-slate-400 font-mono flex items-center gap-2">
                  <span>#{translateCategory(activeMilestone.category, language)}</span>
                  <span>•</span>
                  <span>Etki Seviyesi: %{activeMilestone.impactLevel}</span>
                  <span>•</span>
                  <span>Öngörü Güveni: {(activeMilestone as any).confidenceScore || activeMilestone.probability}/100</span>
                </p>
              </div>
            </div>

            {/* Living Story & Real Impact Box (Clear, Readable, Engaging) */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
              {/* Left 8 cols: What changes in our world? */}
              <div className="lg:col-span-8 bg-slate-950/80 border border-white/10 rounded-2xl p-5 sm:p-6 space-y-4 shadow-xl">
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-blue-400 font-mono text-xs font-bold uppercase tracking-wider">
                    <Info className="w-4 h-4 text-blue-400" />
                    <span>Bu Yılda Neler Yaşanacak? (Gelecek Senaryosu)</span>
                  </div>
                  <p className="text-slate-200 text-sm sm:text-base leading-relaxed font-sans font-normal">
                    {activeMilestone.description}
                  </p>
                </div>

                {/* Living Daily Scenario Snippet */}
                {(() => {
                  const richStory = getRichStoryForMilestone(activeMilestone.year, activeMilestone.description);
                  return (
                    <div className="bg-gradient-to-r from-blue-950/40 via-purple-950/30 to-slate-900/60 p-4 rounded-xl border border-cyan-500/20 space-y-1.5">
                      <div className="flex items-center gap-2 text-cyan-300 font-mono text-xs font-bold">
                        <Sparkles className="w-4 h-4 text-cyan-400 shrink-0 animate-pulse" />
                        <span>{activeMilestone.year} Gündelik Yaşamından Bir Kesit:</span>
                      </div>
                      <p className="text-xs sm:text-sm text-slate-300 italic leading-relaxed font-sans">
                        "{richStory.livingScenarioSnippet}"
                      </p>
                    </div>
                  );
                })()}

                {/* Daily Life Impact Pill */}
                <div className="flex items-start gap-2.5 text-xs text-slate-300 font-sans pt-1 border-t border-white/5">
                  <span className="font-mono text-cyan-400 font-bold uppercase shrink-0">Bireysel Hayata Etkisi:</span>
                  <span className="leading-relaxed">"{activeMilestone.dailyLifeImpact}"</span>
                </div>

                {/* Personal Scope Hero Insight */}
                {timelineScope === "personal" && authContext.currentUser && authContext.currentUser.profession && activeMilestonePersonalImpact && activeMilestonePersonalImpact.relevanceScore > 0 && (
                  <div className="bg-gradient-to-r from-purple-950/40 via-indigo-950/30 to-slate-900/60 p-4 rounded-xl border border-purple-500/30 space-y-2 font-sans pt-3">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2 text-purple-300 font-mono text-xs font-bold">
                        <Target className="w-4 h-4 text-purple-400 shrink-0" />
                        <span>{language === "tr" ? `Benim İçin (${activeMilestone.year}):` : `For Me (${activeMilestone.year}):`}</span>
                        {activeMilestonePersonalImpact.userAgeAtMilestone && (
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-200 border border-purple-400/30">
                            {language === "tr" ? `~${activeMilestonePersonalImpact.userAgeAtMilestone} Yaşınızda` : `~Age ${activeMilestonePersonalImpact.userAgeAtMilestone}`}
                          </span>
                        )}
                      </div>
                      <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full border ${
                        activeMilestonePersonalImpact.relevanceLevel === "high"
                          ? "bg-red-500/20 text-red-300 border-red-500/40"
                          : activeMilestonePersonalImpact.relevanceLevel === "medium"
                          ? "bg-amber-500/20 text-amber-300 border-amber-500/40"
                          : "bg-blue-500/20 text-blue-300 border-blue-500/40"
                      }`}>
                        %{activeMilestonePersonalImpact.relevanceScore} {language === "tr" ? "İlgi" : "Relevance"}
                      </span>
                    </div>
                    <p className="text-xs text-slate-200 leading-relaxed">
                      {activeMilestonePersonalImpact.careerImpactSummary}
                    </p>
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-[11px] pt-1 text-slate-300">
                      <span className="text-purple-300 font-mono text-[10px] sm:text-xs">
                        {language === "tr" ? "Tavsiye: " : "Action: "}{activeMilestonePersonalImpact.preparationAdvice}
                      </span>
                      <button
                        type="button"
                        onClick={() => onOpenDetailModal(activeMilestone)}
                        className="text-xs text-purple-400 hover:text-purple-200 font-bold underline cursor-pointer shrink-0 self-start sm:self-auto"
                      >
                        {language === "tr" ? "Detaylı Kişisel Analiz →" : "Personal Analysis →"}
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Right 4 cols: Key Drivers & High-Level Summary */}
              <div className="lg:col-span-4 bg-slate-950/80 border border-white/10 rounded-2xl p-5 flex flex-col justify-between space-y-4">
                <div className="space-y-3 font-mono text-xs">
                  <div className="flex items-center justify-between border-b border-white/5 pb-2">
                    <span className="text-[11px] font-bold text-slate-400 uppercase">Temel İtici Güçler</span>
                    <span className="text-blue-400 font-bold">{activeMilestone.year}</span>
                  </div>

                  <div className="flex flex-wrap gap-1.5">
                    {(activeMilestone.keyDrivers || []).map((driver, i) => (
                      <span key={`active-driver-${driver}-${i}`} className="text-[11px] bg-slate-900 border border-blue-500/30 text-blue-300 px-2.5 py-1 rounded-lg">
                        #{driver}
                      </span>
                    ))}
                  </div>

                  <div className="pt-2 border-t border-white/5 space-y-2">
                    <div className="flex justify-between text-slate-300 text-[11px]">
                      <span>İşgücü Otomasyonu:</span>
                      <strong className="text-amber-400">%{activeMilestone.aiAutonomyIndex}</strong>
                    </div>
                    <div className="flex justify-between text-slate-300 text-[11px]">
                      <span>Biyo-Dijital Entegrasyon:</span>
                      <strong className="text-emerald-400">%{activeMilestone.bioDigitalIntegrationRate}</strong>
                    </div>
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    type="button"
                    onClick={() => setShowMetricsDrawer((prev) => !prev)}
                    className="w-full py-2 px-3 rounded-xl bg-slate-900 hover:bg-slate-800 border border-white/10 text-slate-300 hover:text-white text-xs font-mono font-bold flex items-center justify-center gap-2 transition-all cursor-pointer"
                  >
                    <Activity className="w-3.5 h-3.5 text-blue-400" />
                    <span>{showMetricsDrawer ? "Metrikleri Gizle" : "Tüm Metrikleri İncele"}</span>
                    {showMetricsDrawer ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>
            </div>

            {/* 🌟 3 PRIMARY ACTION BUTTONS: PROMINENTLY IN VIEWPORT RIGHT AFTER STORY */}
            <div className="bg-gradient-to-r from-blue-950/60 via-purple-950/50 to-slate-950 border-2 border-cyan-500/40 rounded-2xl p-4 sm:p-5 shadow-2xl space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-bold uppercase tracking-wider text-cyan-300 flex items-center gap-1.5">
                  <Compass className="w-4 h-4 text-cyan-400" />
                  <span>Bu Gelecek İçin Ne Yapmak İstersiniz?</span>
                </span>
                <span className="text-[10px] font-mono text-slate-400 hidden sm:inline">3 ANA AKSİYON</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {/* Action 1: Deep Story & Scenario */}
                <button
                  type="button"
                  onClick={() => onOpenDetailModal(activeMilestone)}
                  className="p-4 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-mono text-xs font-extrabold flex flex-col justify-between gap-2 shadow-lg shadow-blue-500/20 transition-all cursor-pointer group hover:scale-[1.02]"
                >
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-2 text-sm">
                      <BookOpen className="w-4 h-4 text-blue-200 group-hover:rotate-6 transition-transform" />
                      <span>Gelecek Senaryosu</span>
                    </span>
                    <ArrowRight className="w-4 h-4 text-blue-200 group-hover:translate-x-1 transition-transform" />
                  </div>
                  <p className="text-[11px] text-blue-100 font-sans font-normal text-left">
                    Tüm derin hikaye, belgesel simülasyonu ve analizi oku.
                  </p>
                </button>

                {/* Action 2: Chat with Future Persona */}
                <button
                  type="button"
                  id="timeline-action-persona-btn"
                  onClick={() => {
                    window.scrollTo({ top: 0, left: 0, behavior: "instant" });
                    document.documentElement.scrollTop = 0;
                    document.body.scrollTop = 0;
                    if (onNavigateToView) onNavigateToView("persona_chat", activeMilestone.year);
                  }}
                  className="p-4 rounded-xl bg-gradient-to-br from-amber-950/60 via-amber-900/40 to-slate-900/80 hover:from-amber-900/80 hover:to-slate-900 border border-amber-500/60 hover:border-amber-400 text-amber-200 font-mono text-xs font-extrabold flex flex-col justify-between gap-2.5 shadow-xl shadow-amber-950/30 transition-all cursor-pointer group hover:scale-[1.02] active:scale-[0.99] relative overflow-hidden"
                >
                  <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/10 rounded-full blur-xl pointer-events-none -mr-8 -mt-8 group-hover:bg-amber-500/20 transition-all" />
                  <div className="flex items-center justify-between relative z-10">
                    <span className="flex items-center gap-2 text-sm text-amber-300 font-bold">
                      <Brain className="w-4 h-4 text-amber-400 group-hover:scale-110 transition-transform shrink-0" />
                      <span>{activeMilestone.year} İnsanıyla Konuş</span>
                    </span>
                    <span className="px-1.5 py-0.5 rounded bg-amber-500/20 border border-amber-500/40 text-[10px] text-amber-300 font-mono font-bold">
                      Zaman Tüneli
                    </span>
                  </div>
                  <p className="text-[11px] text-amber-200/90 font-sans font-normal text-left relative z-10 leading-relaxed">
                    {activeMilestone.year} çağında yaşayan bir vatandaşla ({activeMilestone.title} sonrasını) canlı konuş.
                  </p>
                </button>

                {/* Action 3: BU GELİŞME BENİ NASIL ETKİLER? (AŞAMA 19) */}
                <button
                  type="button"
                  id="timeline-action-job-impact-btn"
                  onClick={() => {
                    onOpenDetailModal(activeMilestone, "personal_impact");
                  }}
                  className="p-4 rounded-xl bg-gradient-to-br from-purple-950/70 via-indigo-950/50 to-slate-900/80 hover:from-purple-900/80 hover:to-slate-900 border border-purple-500/60 hover:border-purple-400 text-purple-200 font-mono text-xs font-extrabold flex flex-col justify-between gap-2.5 shadow-xl shadow-purple-950/30 transition-all cursor-pointer group hover:scale-[1.02] active:scale-[0.99] relative overflow-hidden"
                >
                  <div className="absolute top-0 right-0 w-24 h-24 bg-purple-500/10 rounded-full blur-xl pointer-events-none -mr-8 -mt-8 group-hover:bg-purple-500/20 transition-all" />
                  <div className="flex items-center justify-between relative z-10">
                    <span className="flex items-center gap-2 text-sm text-purple-300 font-bold">
                      <User className="w-4 h-4 text-purple-400 group-hover:scale-110 transition-transform shrink-0" />
                      <span>Bu Gelişme Beni Nasıl Etkiler?</span>
                    </span>
                    <span className="px-1.5 py-0.5 rounded bg-purple-500/20 border border-purple-500/40 text-[10px] text-purple-300 font-mono font-bold">
                      Kişisel Etki
                    </span>
                  </div>
                  <p className="text-[11px] text-purple-200/90 font-sans font-normal text-left relative z-10 leading-relaxed">
                    Bu teknolojinin ({activeMilestone.title}) yaşınıza, kariyerinize, yol haritanıza ve risklerinize etkisini görün.
                  </p>
                </button>
              </div>

            </div>

            {/* 🎛️ AKTİF DÖNÜM NOKTASI DERİN ANALİZ SEKMELERİ (MISSION CONTROL) */}
            <MilestoneMissionControl
              activeMilestone={activeMilestone}
              brainNodes={brainNodes}
              academicLiterature={academicLiterature}
              isLoadingAcademic={isLoadingAcademic}
              verifiedMap={verifiedMap}
              milestones={milestones}
              onSelectMilestoneYear={(targetYear) => {
                const target = milestones.find((m) => m.year === targetYear);
                if (target) {
                  setActiveMilestone(target);
                }
              }}
              activeHeroTab={activeHeroTab}
              setActiveHeroTab={setActiveHeroTab}
            />

          </div>
        </div>
      </div>

      {/* Cross-Feature Recommendation Bridge for Active Milestone */}
      {onNavigateToView && (
        <CrossFeatureRecommendation
          sourceView="timeline"
          currentMilestone={activeMilestone}
          onNavigate={(view, targetYear) => onNavigateToView(view, targetYear)}
          compact={false}
        />
      )}

      {/* 3. BENTO GRID / COMPACT CHRONOLOGICAL CARDS */}
      <div className="space-y-4 pt-4">
        <div className="flex flex-wrap items-center justify-between border-b border-white/5 pb-3 gap-2">
          <h3 className="text-base font-bold text-white uppercase tracking-wider font-mono flex items-center gap-2">
            <span>{t("timeline_view")}</span>
            <span className="text-[10px] font-mono text-blue-400 border border-blue-400/30 px-2 py-0.5 rounded-full">
              2026—2060
            </span>
            {onlyVerified && (
              <span className="text-[10px] font-mono font-bold text-emerald-300 bg-emerald-950/80 border border-emerald-500/40 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                <ShieldCheck className="w-3 h-3 text-emerald-400" />
                <span>İncelenen Kaynaklı Teknolojiler ({displayedMilestones.length})</span>
              </span>
            )}
          </h3>
          <p className="text-[11px] text-slate-400 font-mono">{t("select_milestone")}</p>
        </div>

        {/* Era Filter & View Mode Controls */}
        <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-900/60 p-2.5 rounded-2xl border border-white/5">
          <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none">
            <button
              type="button"
              onClick={() => setSelectedEra("all")}
              className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold transition-all cursor-pointer whitespace-nowrap ${
                selectedEra === "all"
                  ? "bg-blue-600 text-white shadow-md shadow-blue-500/30"
                  : "bg-slate-950/60 text-slate-400 hover:text-white border border-white/5"
              }`}
            >
              Tüm Yıllar ({eraCounts.all})
            </button>
            <button
              type="button"
              onClick={() => setSelectedEra(1)}
              className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold transition-all cursor-pointer whitespace-nowrap ${
                selectedEra === 1
                  ? "bg-blue-500 text-white shadow-md shadow-blue-500/30"
                  : "bg-slate-950/60 text-slate-400 hover:text-white border border-white/5"
              }`}
            >
              Aşama 1: 2026–2030 ({eraCounts.p1})
            </button>
            <button
              type="button"
              onClick={() => setSelectedEra(2)}
              className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold transition-all cursor-pointer whitespace-nowrap ${
                selectedEra === 2
                  ? "bg-amber-500 text-slate-950 font-extrabold shadow-md shadow-amber-500/30"
                  : "bg-slate-950/60 text-slate-400 hover:text-white border border-white/5"
              }`}
            >
              Aşama 2: 2031–2040 ({eraCounts.p2})
            </button>
            <button
              type="button"
              onClick={() => setSelectedEra(3)}
              className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold transition-all cursor-pointer whitespace-nowrap ${
                selectedEra === 3
                  ? "bg-purple-600 text-white shadow-md shadow-purple-500/30"
                  : "bg-slate-950/60 text-slate-400 hover:text-white border border-white/5"
              }`}
            >
              Aşama 3: 2041–2060 ({eraCounts.p3})
            </button>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            <button
              type="button"
              onClick={() => setLayoutMode("grid")}
              className={`p-1.5 rounded-lg border text-xs font-mono transition cursor-pointer flex items-center gap-1 ${
                layoutMode === "grid"
                  ? "bg-blue-600/30 border-blue-400 text-blue-300"
                  : "bg-slate-950/60 border-white/5 text-slate-400 hover:text-white"
              }`}
              title="Bento Kart Görünümü"
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span className="hidden sm:inline text-[11px]">Kartlar</span>
            </button>
            <button
              type="button"
              onClick={() => setLayoutMode("compact")}
              className={`p-1.5 rounded-lg border text-xs font-mono transition cursor-pointer flex items-center gap-1 ${
                layoutMode === "compact"
                  ? "bg-blue-600/30 border-blue-400 text-blue-300"
                  : "bg-slate-950/60 border-white/5 text-slate-400 hover:text-white"
              }`}
              title="Kompakt Liste Görünümü (Daha Az Kaydırma)"
            >
              <List className="w-3.5 h-3.5" />
              <span className="hidden sm:inline text-[11px]">Kompakt</span>
            </button>
          </div>
        </div>

        {onlyVerified && displayedMilestones.length === 0 && (
          <div className="bg-slate-900/60 border border-emerald-500/30 rounded-2xl p-8 text-center space-y-3 font-mono my-4">
            <ShieldCheck className="w-10 h-10 text-emerald-400 mx-auto animate-bounce" />
            <h3 className="text-lg font-bold text-white">Henüz Bu Filtrede İncelenmiş Kaynak Kaydı Bulunmuyor</h3>
            <p className="text-xs text-slate-300 max-w-lg mx-auto leading-relaxed">
              Filtreleriniz ile eşleşen kaynak incelemesi bulunamadı. Filtreleri temizleyebilir veya Kaynak Analiz modülünden yeni bir kaynak ekleyebilirsiniz!
            </p>
            <button
              onClick={() => setOnlyVerified(false)}
              className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold rounded-xl text-xs transition-all cursor-pointer shadow-lg shadow-emerald-500/20"
            >
              Tüm Kilometre Taşlarını Göster
            </button>
          </div>
        )}

        <div className="relative">
          {layoutMode === "compact" ? (
            <div className="space-y-2">
              {((!isVerifiedUser && eraFilteredMilestones.length > 8)
                ? eraFilteredMilestones.slice(0, 8)
                : eraFilteredMilestones
              ).map((m, index) => {
                const isSelected = m.year === activeMilestone.year;
                const isLocked = !isVerifiedUser && index >= 6;
                const probInfo = calculateDynamicProbability(m.probability, m.year);
                return (
                  <div
                    key={`compact-${m.year}-${m.title}-${index}`}
                    onClick={() => {
                      if (isLocked) {
                        authContext.openAuthModal();
                      } else {
                        setActiveMilestone(m);
                        onOpenDetailModal(m);
                        document.getElementById("timeline-spotlight-hero")?.scrollIntoView({ behavior: "smooth", block: "start" });
                      }
                    }}
                    className={`p-3 rounded-xl border flex items-center justify-between gap-3 cursor-pointer transition-all ${
                      isSelected
                        ? "bg-slate-900 border-blue-500 shadow-md shadow-blue-500/20 ring-1 ring-blue-500/30"
                        : "bg-slate-950/60 border-white/5 hover:border-slate-700 hover:bg-slate-900/60"
                    } ${isLocked ? "opacity-60" : ""}`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <span className={`px-2 py-0.5 rounded-lg text-xs font-mono font-bold shrink-0 ${
                        m.phase === 1 ? "bg-blue-500/20 text-blue-300 border border-blue-400/30" :
                        m.phase === 2 ? "bg-amber-500/20 text-amber-300 border border-amber-400/30" :
                        "bg-purple-500/20 text-purple-300 border border-purple-400/30"
                      }`}>
                        {m.year}
                      </span>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-white truncate">{m.title}</span>
                          {isLocked && <Lock className="w-3 h-3 text-amber-400 shrink-0" />}
                        </div>
                        <span className="text-[10px] text-slate-400 block truncate">{translateCategory(m.category, language)}</span>
                        {timelineScope === "personal" && authContext.currentUser && authContext.currentUser.profession && personalImpactMap.get(m.year) && personalImpactMap.get(m.year)!.relevanceScore > 0 && (
                          <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
                            <span className={`text-[9px] font-mono px-1.5 py-0.2 rounded font-bold border flex items-center gap-1 ${
                              personalImpactMap.get(m.year)!.relevanceLevel === "high"
                                ? "bg-red-500/20 text-red-300 border-red-500/40"
                                : personalImpactMap.get(m.year)!.relevanceLevel === "medium"
                                ? "bg-amber-500/20 text-amber-300 border-amber-500/40"
                                : "bg-blue-500/20 text-blue-300 border-blue-500/40"
                            }`}>
                              <Target className="w-2.5 h-2.5" />
                              <span>%{personalImpactMap.get(m.year)!.relevanceScore} {language === "tr" ? "İlgi" : "Relevance"}</span>
                            </span>
                            {personalImpactMap.get(m.year)!.userAgeAtMilestone && (
                              <span className="text-[9px] font-mono text-purple-300 bg-purple-950/40 border border-purple-500/20 px-1.5 py-0.2 rounded">
                                ~{personalImpactMap.get(m.year)!.userAgeAtMilestone} {language === "tr" ? "Yaş" : "Age"}
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-3 shrink-0 text-xs font-mono">
                      <span className="text-emerald-400 font-bold hidden sm:inline">%{probInfo.adjustedProbability} {language === "tr" ? "Model Skoru" : "Score"}</span>
                      <span className="text-blue-400 font-bold hidden md:inline">%{m.impactLevel} Etki</span>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          if (isLocked) {
                            authContext.openAuthModal();
                          } else {
                            setActiveMilestone(m);
                            onOpenDetailModal(m);
                          }
                        }}
                        className="px-2.5 py-1 rounded-lg bg-blue-600/30 hover:bg-blue-600 border border-blue-500/40 text-blue-200 hover:text-white text-[11px] font-bold transition cursor-pointer"
                      >
                        {isLocked ? "Kilidi Aç" : (language === "tr" ? "Detayları Aç" : "View Details")}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5 relative">
              {((!isVerifiedUser && eraFilteredMilestones.length > 8)
                ? eraFilteredMilestones.slice(0, 8)
                : eraFilteredMilestones
              ).map((m, index) => {
              const isSelected = m.year === activeMilestone.year;
              const phaseColor = m.phase === 1 ? "text-blue-400 border-blue-400/30" : m.phase === 2 ? "text-amber-400 border-amber-400/30" : "text-purple-400 border-purple-400/30";
              const probInfo = calculateDynamicProbability(m.probability, m.year);
              const proof = verifiedMap[m.year];
              const worldState = getFiveLayerWorldState(m, 1995);

              // First 6 cards are 100% crystal clear. Cards 7 & 8 are teaser previews
              const isLocked = !isVerifiedUser && index >= 6;
              const isHeavyBlur = !isVerifiedUser && index >= 7;

              return (
                <div
                  key={`${m.year}-${m.title}-${index}`}
                  onClick={() => {
                    if (isLocked) {
                      authContext.openAuthModal();
                    } else {
                      setActiveMilestone(m);
                      onOpenDetailModal(m);
                      document.getElementById("timeline-spotlight-hero")?.scrollIntoView({ behavior: "smooth", block: "start" });
                    }
                  }}
                  className={`group cursor-pointer rounded-2xl p-4 sm:p-5 border transition-all duration-200 relative flex flex-col justify-between space-y-3 backdrop-blur-md ${
                    isSelected
                      ? "bg-slate-900/75 border-blue-500/80 shadow-xl shadow-blue-500/20 ring-1 ring-blue-500/40"
                      : proof
                      ? "bg-slate-900/50 border-emerald-500/40 hover:border-emerald-400/80 hover:bg-slate-900/70 shadow-md shadow-emerald-500/10"
                      : "bg-slate-900/40 border-slate-800/80 hover:border-slate-600/80 hover:bg-slate-900/60"
                  } ${isHeavyBlur ? "blur-[2px] opacity-40 select-none pointer-events-auto" : isLocked ? "blur-[0.5px] opacity-75" : ""}`}
                >
                  {/* Header */}
                  <div className="space-y-2.5">
                    <div className="flex items-center justify-between">
                      <span className={`text-[10px] font-mono border px-2 py-0.5 rounded-full uppercase font-bold ${phaseColor}`}>
                        {m.year} // PHASE 0{m.phase}
                      </span>

                      <span className="text-[10px] font-mono text-slate-400 bg-slate-950 border border-white/5 px-2 py-0.5 rounded flex items-center gap-1">
                        {isLocked && <Lock className="w-2.5 h-2.5 text-amber-400" />}
                        <span>{translateCategory(m.category, language)}</span>
                      </span>
                    </div>

                    {proof && (
                      <div className="p-2 rounded-xl bg-emerald-950/70 border border-emerald-500/50 flex items-center justify-between text-[10px] font-mono font-bold text-emerald-300">
                        <span className="flex items-center gap-1">
                          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                          <span>LİTERATÜR & KAYNAK PROJEKSİYONU</span>
                        </span>
                        <span className="text-emerald-400">%{proof.aiVerificationScore} Kaynak Uyum Skoru</span>
                      </div>
                    )}

                    {timelineScope === "personal" && authContext.currentUser && authContext.currentUser.profession && personalImpactMap.get(m.year) && personalImpactMap.get(m.year)!.relevanceScore > 0 && (
                      <div className={`p-2 rounded-xl border flex items-center justify-between text-[10px] font-mono font-bold ${
                        personalImpactMap.get(m.year)!.relevanceLevel === "high"
                          ? "bg-red-950/60 border-red-500/40 text-red-300"
                          : personalImpactMap.get(m.year)!.relevanceLevel === "medium"
                          ? "bg-amber-950/60 border-amber-500/40 text-amber-300"
                          : "bg-blue-950/60 border-blue-500/30 text-blue-300"
                      }`}>
                        <span className="flex items-center gap-1.5">
                          <Target className="w-3.5 h-3.5 shrink-0" />
                          <span>
                            {personalImpactMap.get(m.year)!.relevanceLevel === "high"
                              ? (language === "tr" ? "Kritik Mesleki Etki" : "High Career Impact")
                              : personalImpactMap.get(m.year)!.relevanceLevel === "medium"
                              ? (language === "tr" ? "Orta İlgi / Fırsat" : "Medium Relevance")
                              : (language === "tr" ? "Genel Makro Gelişme" : "Macro Milestone")}
                          </span>
                        </span>
                        <div className="flex items-center gap-1.5">
                          {personalImpactMap.get(m.year)!.userAgeAtMilestone && (
                            <span className="text-[9px] opacity-80">
                              ~{personalImpactMap.get(m.year)!.userAgeAtMilestone} {language === "tr" ? "Yaş" : "Age"}
                            </span>
                          )}
                          <span className="px-1.5 py-0.5 rounded bg-black/40 border border-white/10">
                            %{personalImpactMap.get(m.year)!.relevanceScore}
                          </span>
                        </div>
                      </div>
                    )}

                    <div className="flex items-start gap-3">
                      <div className="p-2 rounded-xl bg-slate-800/60 border border-white/5 text-blue-400 group-hover:scale-105 transition-transform flex-shrink-0">
                        <MilestoneIcon name={m.iconName} size={18} />
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-white group-hover:text-blue-400 transition-colors line-clamp-1">
                          {m.title}
                        </h4>
                        <p className="text-xs text-slate-400 line-clamp-2 mt-0.5 leading-relaxed">
                          {m.description}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* 5-Layer Bento Quick Pill Row */}
                  <div className="grid grid-cols-3 gap-1.5 pt-2 border-t border-white/5 font-mono text-[9px]">
                    {/* Gelişim Aşaması & Science */}
                    <div className="p-1.5 rounded-lg bg-slate-950/50 backdrop-blur-sm border border-cyan-500/30 text-cyan-300 space-y-0.5">
                      <span className="text-[8px] text-slate-400 uppercase block font-bold">Gelişim Aşaması / Konsensus</span>
                      <div className="font-bold">Aşama {worldState.scientificReadiness.trlLevel}/9 (Tahmin) · %{worldState.scientificReadiness.academicConsensusRate}</div>
                    </div>

                    {/* Automation & Economy */}
                    <div className="p-1.5 rounded-lg bg-slate-950/50 backdrop-blur-sm border border-amber-500/30 text-amber-300 space-y-0.5">
                      <span className="text-[8px] text-slate-400 uppercase block font-bold">İşgücü Otomasyonu</span>
                      <div className="font-bold">%{worldState.macroEconomicsAndGeo.automatedJobsRate} Ajan</div>
                    </div>

                    {/* Ethics & Threat */}
                    <div className="p-1.5 rounded-lg bg-slate-950/50 backdrop-blur-sm border border-rose-500/30 text-rose-300 space-y-0.5">
                      <span className="text-[8px] text-slate-400 uppercase block font-bold">Kırılganlık</span>
                      <div className="font-bold">{worldState.riskAndCountermeasures.vulnerabilityScore}/100 Risk</div>
                    </div>
                  </div>

                  {/* Footer */}
                  <div className="pt-2 border-t border-white/5 flex items-center justify-between text-[11px] font-mono text-slate-400">
                    <span
                      className={`font-bold flex items-center gap-1 ${
                        probInfo.adjustedProbability > 75
                          ? "text-emerald-400"
                          : probInfo.adjustedProbability > 50
                          ? "text-amber-300"
                          : "text-purple-300"
                      }`}
                      title={probInfo.explanation}
                    >
                      %{probInfo.adjustedProbability} {language === "tr" ? "Model Skoru" : "Score"} ({probInfo.confidenceCategory})
                    </span>
                    <div className="flex items-center gap-1.5">
                      {/* Spotlight quick jump button without opening modal */}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          if (isLocked) {
                            authContext.openAuthModal();
                          } else {
                            setActiveMilestone(m);
                            document.getElementById("timeline-spotlight-hero")?.scrollIntoView({ behavior: "smooth", block: "start" });
                          }
                        }}
                        className="px-2 py-1 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-cyan-300 flex items-center gap-1 text-[10px] font-bold cursor-pointer transition-colors border border-white/5"
                        title={language === "tr" ? "Yukarıdaki Spotlight alanına git" : "Scroll to Spotlight"}
                      >
                        <ArrowUp className="w-2.5 h-2.5 text-cyan-400" />
                        <span className="hidden sm:inline">Spotlight</span>
                      </button>

                      {/* Open Full Detailed Modal */}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          if (isLocked) {
                            authContext.openAuthModal();
                          } else {
                            setActiveMilestone(m);
                            onOpenDetailModal(m);
                          }
                        }}
                        className="px-2.5 py-1 rounded-lg bg-blue-600/30 hover:bg-blue-600/50 text-blue-200 hover:text-white border border-blue-500/40 flex items-center gap-1 font-bold cursor-pointer transition-all text-[10px]"
                      >
                        <span>{isLocked ? "Kilidi Aç" : (language === "tr" ? "Detayları Aç" : t("view_details"))}</span>
                        <ArrowRight className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
          )}

          {/* Immediate High-Conversion Paywall Curtain for unverified users */}
          {!isVerifiedUser && displayedMilestones.length > 6 && (
            <div className="mt-4 p-5 sm:p-7 rounded-3xl bg-gradient-to-b from-slate-900/95 via-[#0c1427]/98 to-slate-950 border border-cyan-500/40 shadow-2xl space-y-4">
              <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-center md:text-left">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-cyan-500/20 border border-cyan-400/50 flex items-center justify-center text-cyan-300 shrink-0 shadow-lg shadow-cyan-500/20">
                    <Sparkles className="w-6 h-6 animate-pulse" />
                  </div>
                  <div>
                    <div className="flex items-center justify-center md:justify-start gap-2 flex-wrap">
                      <h4 className="text-base font-bold text-white font-mono">
                        2035—2060 Dönemlerini ve {displayedMilestones.length - 6}+ Gelecek Simülasyonunu Açın
                      </h4>
                      <span className="text-[10px] bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 px-2.5 py-0.5 rounded-full font-bold">
                        +50 ÜCRETSİZ KREDİ
                      </span>
                    </div>
                    <p className="text-xs text-slate-300 mt-1 font-sans">
                      Ücretsiz hesabınızı oluşturarak kuantum simülasyonlarına ve derin gelecek analizlerine anında erişin.
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => authContext.openAuthModal()}
                  className="w-full md:w-auto px-6 py-3.5 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-mono font-bold text-xs shadow-xl shadow-cyan-500/30 transition-all shrink-0 cursor-pointer flex items-center justify-center gap-2 hover:scale-[1.02]"
                >
                  <Lock className="w-4 h-4" />
                  <span>Ücretsiz Giriş Yap / Kayıt Ol</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>

              {/* Locked Features Teaser Pill Row */}
              <div className="pt-3 border-t border-white/10 flex items-center justify-between flex-wrap gap-2 text-[11px] font-mono text-slate-400">
                <span className="text-cyan-300 font-bold flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5 text-amber-400" />
                  Kilitli Gelecek Teknolojileri ({displayedMilestones.length - 6} Adet):
                </span>
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="px-2 py-0.5 rounded-md bg-slate-900 border border-white/10 text-slate-300">Kuantum İnternet (2038)</span>
                  <span className="px-2 py-0.5 rounded-md bg-slate-900 border border-white/10 text-slate-300">AGI Seviye 5 (2042)</span>
                  <span className="px-2 py-0.5 rounded-md bg-slate-900 border border-white/10 text-slate-300">Nükleer Füzyon Ağı (2045)</span>
                  <span className="px-2 py-0.5 rounded-md bg-slate-900 border border-white/10 text-slate-300">Zihin Yükleme (2050)</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Immediate Milestone Job & Career Impact Modal */}
      {jobImpactModalMilestone && (
        <MilestoneJobImpactModal
          milestone={jobImpactModalMilestone}
          onClose={() => setJobImpactModalMilestone(null)}
          onNavigateToFullJobRisk={(targetYear, profession) => {
            const targetM = jobImpactModalMilestone;
            setJobImpactModalMilestone(null);
            if (targetM) {
              setActiveMilestone(targetM);
            }
            if (onNavigateToView) {
              onNavigateToView("job_risk", targetYear);
            }
          }}
        />
      )}

      {/* Phase 18: Live Signal Personal Impact Modal */}
      {selectedSignalForDetail && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 overflow-y-auto animate-fadeIn">
          <div className="bg-slate-900 border border-purple-500/40 rounded-3xl max-w-2xl w-full p-6 space-y-5 shadow-2xl relative max-h-[90vh] overflow-y-auto text-left font-sans">
            <div className="flex items-start justify-between gap-3 border-b border-white/10 pb-4">
              <div className="space-y-1.5">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-md bg-purple-600/30 text-purple-300 text-xs font-mono font-bold border border-purple-500/40">
                    {selectedSignalForDetail.signal.extractedYear || 2026}
                  </span>
                  <span className="px-2.5 py-0.5 rounded-md bg-slate-800 text-slate-300 text-xs font-medium">
                    {selectedSignalForDetail.signal.category}
                  </span>
                  <span className={`px-2 py-0.5 rounded text-[11px] font-mono border ${
                    selectedSignalForDetail.impact.relevanceLevel === "high"
                      ? "bg-amber-500/20 text-amber-300 border-amber-500/30 font-bold"
                      : "bg-purple-500/20 text-purple-300 border-purple-500/30"
                  }`}>
                    %{selectedSignalForDetail.impact.relevanceScore} {language === "tr" ? "Mesleki İlgi" : "Relevance"}
                  </span>
                </div>
                <h3 className="text-lg font-bold text-white leading-snug">
                  {selectedSignalForDetail.signal.title}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedSignalForDetail(null)}
                className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition cursor-pointer shrink-0"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Personal Career Reflection */}
            <div className="p-4 rounded-2xl bg-purple-950/30 border border-purple-500/20 space-y-3">
              <div className="flex items-center gap-2 text-xs font-bold text-purple-300 uppercase tracking-wider font-mono">
                <Briefcase className="w-4 h-4 text-purple-400" />
                <span>
                  {language === "tr" ? "Mesleğinize Yansıması" : "Impact on Your Profession"}
                  {authContext.currentUser?.profession && ` (${authContext.currentUser.profession})`}
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-200 leading-relaxed">
                {selectedSignalForDetail.impact.careerImpactSummary}
              </p>

              <div className="pt-2 border-t border-purple-500/20 flex items-start gap-2">
                <Sparkles className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <p className="text-xs text-emerald-300 leading-relaxed">
                  <strong className="font-bold">{language === "tr" ? "Önerilen Aksiyon: " : "Action: "}</strong>
                  {selectedSignalForDetail.impact.actionableAdvice}
                </p>
              </div>
            </div>

            {/* Matched Milestone Link */}
            {selectedSignalForDetail.impact.matchedMilestone && (
              <div className="p-3.5 rounded-2xl bg-indigo-950/30 border border-indigo-500/20 flex flex-wrap items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-indigo-400 shrink-0" />
                  <span className="text-slate-300">{language === "tr" ? "İlişkili Dönüm Noktası:" : "Related Milestone:"}</span>
                  <span className="font-bold text-white font-mono">
                    {selectedSignalForDetail.impact.matchedMilestone.year} • {selectedSignalForDetail.impact.matchedMilestone.title}
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    const matched = milestones.find((m) => m.year === selectedSignalForDetail.impact.matchedMilestone?.year);
                    if (matched) {
                      setActiveMilestone(matched);
                      setSelectedSignalForDetail(null);
                    }
                  }}
                  className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs transition cursor-pointer flex items-center gap-1 shadow-sm"
                >
                  <span>{language === "tr" ? "Bu Yıla Git" : "Go to Year"}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            )}

            {/* Raw News Summary */}
            <div className="p-3.5 rounded-2xl bg-black/40 border border-white/5 space-y-1.5 text-xs text-slate-300">
              <span className="font-mono text-[11px] text-slate-400 font-bold uppercase">
                {language === "tr" ? "Haber İçeriği / Özet:" : "News Summary:"}
              </span>
              <p className="leading-relaxed line-clamp-4">
                {selectedSignalForDetail.signal.summary || selectedSignalForDetail.signal.originalText}
              </p>
            </div>

            {/* Close Button */}
            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={() => setSelectedSignalForDetail(null)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold cursor-pointer transition"
              >
                {language === "tr" ? "Kapat" : "Close"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 🚀 AKICI GEZİNME: YUKARI ÇIK & AKTİF DÖNÜM NOKTASINA DÖN FLOATING BUTONU */}
      {showBackToTop && (
        <button
          type="button"
          onClick={() => {
            window.scrollTo({ top: 0, behavior: "smooth" });
          }}
          className="fixed bottom-24 right-6 z-40 px-4 py-2.5 rounded-2xl bg-slate-900/95 hover:bg-blue-600 text-white font-mono text-xs font-bold shadow-2xl border border-white/20 backdrop-blur-md flex items-center gap-2 transition-all cursor-pointer hover:scale-105"
        >
          <ArrowUp className="w-4 h-4 text-cyan-400" />
          <span>Yukarı / {activeMilestone.year} Odak</span>
        </button>
      )}

    </div>
  );
};


