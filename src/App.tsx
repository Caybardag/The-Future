import React, { useState, useEffect, useCallback, useRef, useMemo } from "react";
import { motion, AnimatePresence } from "motion/react";
import { ViewMode, PhaseId, CategoryType, Milestone, TelegramFeedItem } from "./types";
import { safeStorage } from "./utils/safeStorage";
import { TIMELINE_DATA, PHASES } from "./data/timelineData";
import { Navbar } from "./components/Navbar";
import { EpicIntelligenceHubPortal } from "./components/EpicIntelligenceHubPortal";
import { TimelineView } from "./components/TimelineView";
import { AnalyticsView } from "./components/AnalyticsView";
import { ComparisonTool } from "./components/ComparisonTool";
import { MilestoneDetailModal } from "./components/MilestoneDetailModal";
import { PersonalRoadmapView } from "./components/PersonalRoadmapView";
import { CausalityNetworkView } from "./components/CausalityNetworkView";
import { VerificationSystemView } from "./components/VerificationSystemView";
import { JobRiskAnalyzerView } from "./components/JobRiskAnalyzerView";
import { GeographicMapView } from "./components/GeographicMapView";
import { ButterflyEffectView } from "./components/ButterflyEffectView";
import { TimeTravelerPersonaChatView } from "./components/TimeTravelerPersonaChatView";
import { CommunitySubmissionsView } from "./components/CommunitySubmissionsView";
import { UserProfileModal } from "./components/UserProfileModal";
import { ShareableCardModal } from "./components/ShareableCardModal";
import { UserAuthModal, UserProfile } from "./components/UserAuthModal";
import { OnboardingWizardModal } from "./components/OnboardingWizardModal";
import { MembershipUpsellModal } from "./components/MembershipUpsellModal";
import { GuestProtectedOverlay } from "./components/GuestProtectedOverlay";
import { PlanFeatureGateOverlay } from "./components/PlanFeatureGateOverlay";
import { hasPlanAccess } from "./utils/planAccess";
import { AutonomousAgentSystem, AgentUpdateLog } from "./components/AutonomousAgentSystem";
import { CreditStoreModal } from "./components/CreditStoreModal";
import { EmbedWidgetModal } from "./components/EmbedWidgetModal";
import { EmbeddedWidgetView } from "./components/EmbeddedWidgetView";
import { FutureVerdictView } from "./components/FutureVerdictView";
import { AlgorithmicAuditWidget } from "./components/AlgorithmicAuditWidget";
import { DataIntegrityView } from "./components/DataIntegrityView";
import { TelegramIntelligenceHubView } from "./components/TelegramIntelligenceHubView";
import { InteractiveGuideModal } from "./components/InteractiveGuideModal";
import { DailyFutureSpinWheel } from "./components/DailyFutureSpinWheel";
import { GlobalLeaderboardView } from "./components/GlobalLeaderboardView";
import { FuturistAIAdvisor } from "./components/FuturistAIAdvisor";
import { PredictionHistoryView } from "./components/PredictionHistoryView";
import { AdminDashboardView } from "./components/AdminDashboardView";
import { CognitiveLoadTracker } from "./components/CognitiveLoadTracker";
import { FuturisticAmbientBackground } from "./components/FuturisticAmbientBackground";
import { FuturisticRegistrationGate } from "./components/FuturisticRegistrationGate";
import { ScientificVerificationEngine, ScientificAnomaly } from "./services/ScientificVerificationEngine";
import { AnomalyNotificationOverlay } from "./components/AnomalyNotificationOverlay";
import { ShieldCheck, Sparkles, Cpu, Clock, Globe, X, HelpCircle, FileText, Cookie, LifeBuoy } from "lucide-react";
import { SessionLockedModal } from "./components/SessionLockedModal";
import { BannedUserModal } from "./components/BannedUserModal";
import { SupportTicketModal } from "./components/SupportTicketModal";
import { PrivacyDataModal } from "./components/PrivacyDataModal";
import { HelpSupportModal } from "./components/HelpSupportModal";
import { CookieBanner } from "./components/CookieBanner";
import { LanguageProvider, useLanguage } from "./context/LanguageContext";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { AdminProvider } from "./context/AdminContext";
import { BadgeProvider, useBadges } from "./context/BadgeContext";
import { BadgeToastNotification } from "./components/BadgeToastNotification";
import { TermsOfServiceModal } from "./components/TermsOfServiceModal";
import { CorporateFooter } from "./components/CorporateFooter";
import { ForesightDisclaimerBanner } from "./components/ForesightDisclaimerBanner";
import { UnbanProbationNoticeModal } from "./components/UnbanProbationNoticeModal";
import { CinematicTabWalkthrough } from "./components/CinematicTabWalkthrough";
import { LiveIngestToastNotification, LiveIngestToastData } from "./components/LiveIngestToastNotification";
import { ContextAwareOrchestrator } from "./components/ContextAwareOrchestrator";
import { SmartDiscoveryTicker } from "./components/SmartDiscoveryTicker";
import { NexusHolodeckDrawer } from "./components/NexusHolodeckDrawer";
import { ErrorBoundary } from "./components/ErrorBoundary";
import { getLocalizedTimelineData, getLocalizedMilestone } from "./utils/milestoneTranslations";
import { calculateDynamicProbability } from "./utils/probabilityCalculator";
import { applyScenarioTransform } from "./utils/scenarioTransformer";
import { aiService } from "./services/AIService";
import { safeFetchJson } from "./utils/apiClient";

function MainAppContent() {
  const { language, t } = useLanguage();
  const isTr = language === "tr";
  const { triggerActivity } = useBadges();
  // AuthContext integration
  const {
    currentUser,
    pendingVerificationUser,
    credits: userCredits,
    plan: userPlan,
    userAuthModalOpen,
    creditStoreModalOpen,
    upsellModalOpen,
    bannedModalOpen,
    banReasonState,
    upsellContextTitle,
    upsellContextDesc,
    setUserAuthModalOpen,
    setCreditStoreModalOpen,
    setBannedModalOpen,
    closeUpsellModal,
    openAuthModal,
    openCreditStore,
    openUpsellModal,
    login: handleLoginSuccess,
    logout: handleLogout,
    deductCredits: handleDeductCredits,
    addCredits: handleAddCredits,
    upgradePlan: handleUpgradePlan,
  } = useAuth();

  // Standalone embed check
  const isEmbedded = typeof window !== "undefined" && window.location.search.includes("embed=true");

  // Automatically start with the welcoming GoogleStyleLandingPortal for guests/unauthenticated visitors
  // Modals for Google standard Privacy, Help Center and Support Tickets
  const [supportModalOpen, setSupportModalOpen] = useState(false);
  const [helpSupportModalOpen, setHelpSupportModalOpen] = useState(false);
  const [privacyModalOpen, setPrivacyModalOpen] = useState(false);
  const [isNexusDrawerOpen, setIsNexusDrawerOpen] = useState(false);
  const [isOnboardingModalOpen, setIsOnboardingModalOpen] = useState(false);

  useEffect(() => {
    const handleOpenSupport = () => setHelpSupportModalOpen(true);
    const handleOpenPrivacy = () => setPrivacyModalOpen(true);
    const handleOpenProfileCompletion = () => setIsOnboardingModalOpen(true);
    window.addEventListener("open_support_modal", handleOpenSupport);
    window.addEventListener("open_privacy_modal", handleOpenPrivacy);
    window.addEventListener("open_profile_completion", handleOpenProfileCompletion);
    return () => {
      window.removeEventListener("open_support_modal", handleOpenSupport);
      window.removeEventListener("open_privacy_modal", handleOpenPrivacy);
      window.removeEventListener("open_profile_completion", handleOpenProfileCompletion);
    };
  }, []);

  // ROUTING LOGIC:
  // - Unauthenticated guests start at the welcoming artistic portal ("portal").
  // - Authenticated members go straight to their active workspace cockpit ("timeline").
  const [currentView, setCurrentView] = useState<ViewMode>(() => {
    try {
      const stored = localStorage.getItem("future_timeline_user") || localStorage.getItem("auth_current_user");
      if (stored && JSON.parse(stored)) return "timeline";
    } catch {}
    return "portal";
  });

  // CRITICAL MOBILE FIX: Whenever view changes, immediately reset scroll position to top
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "instant" });
  }, [currentView]);

  const prevUserRef = useRef<UserProfile | null>(currentUser);

  useEffect(() => {
    if (currentUser && !prevUserRef.current) {
      // Member just logged in -> direct them immediately to the active workspace cockpit
      setCurrentView("timeline");
    } else if (!currentUser && prevUserRef.current) {
      // Member logged out -> present the welcoming artistic portal
      setCurrentView("portal");
      try {
        sessionStorage.removeItem("has_entered_console");
      } catch {}
    }
    prevUserRef.current = currentUser;
  }, [currentUser]);

  // Automatically trigger badge activity when user visits or uses different modules
  useEffect(() => {
    if (currentView === "analytics" || currentView === "comparison") {
      triggerActivity("visit_analytics");
    } else if (currentView === "network") {
      triggerActivity("visit_network");
    } else if (currentView === "job_risk") {
      triggerActivity("run_job_risk");
    } else if (currentView === "butterfly") {
      triggerActivity("run_butterfly");
    } else if (currentView === "persona_chat") {
      triggerActivity("chat_persona");
    } else if (currentView === "community") {
      triggerActivity("vote_community");
    }
  }, [currentView, triggerActivity]);

  // Project-wide guarantee: Whenever active view/tab changes, always reset scroll to top immediately
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "instant" });
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
    const mainEl = document.querySelector("main");
    if (mainEl) mainEl.scrollTop = 0;
  }, [currentView]);

  const [activeMilestoneState, setActiveMilestoneState] = useState<Milestone>(TIMELINE_DATA[0]);
  const [selectedPhase, setSelectedPhase] = useState<PhaseId | "all">("all");
  const [selectedCategory, setSelectedCategory] = useState<CategoryType | "all">("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1);

  // Scenario Mode & Guide Modal State
  const [scenarioMode, setScenarioMode] = useState<"baseline" | "optimistic" | "dystopian">("baseline");
  const [guideModalOpen, setGuideModalOpen] = useState<boolean>(false);
  const [isGlobalTermsModalOpen, setIsGlobalTermsModalOpen] = useState<boolean>(false);

  const handleScenarioChange = (newMode: "baseline" | "optimistic" | "dystopian") => {
    setScenarioMode(newMode);
  };

  // Homo Sapiens 2.0 Transhumanism & Autonomous Agent State (Provenance: MODEL_DERIVED / SYNTHETIC_DEMO_DATA)
  // Invariant: SYNTHETIC_DEMO_DATA ≠ LIVE_TELEMETRY. Benchmark simulation seeds prior to live agent telemetry.
  const [targetYearShift, setTargetYearShift] = useState<number>(-1.4);
  const [evolutionProgress, setEvolutionProgress] = useState<number>(84.8);
  const [agentLogs, setAgentLogs] = useState<AgentUpdateLog[]>([
    {
      id: "init_1",
      agentName: "Otonom Analiz Motoru",
      agentType: "sentinel",
      timestamp: new Date().toLocaleTimeString(),
      message: "Gelecek trendi ve otomasyon etki modelleri güncellendi (Simülasyon Modeli).",
      impactOn2060CountdownYears: -1.4,
      evolutionProgressDelta: +2.8,
      provenance: "SYNTHETIC_DEMO_DATA",
    },
    {
      id: "init_2",
      agentName: "Veri Doğrulama Servisi",
      agentType: "ethics",
      timestamp: new Date().toLocaleTimeString(),
      message: "Teknolojik tahmin matrisi ve pazar dinamikleri stabil (Simülasyon Modeli).",
      impactOn2060CountdownYears: +0.2,
      evolutionProgressDelta: +0.6,
      provenance: "SYNTHETIC_DEMO_DATA",
    },
  ]);

  const handleAgentUpdateCountdown = useCallback((yearsDelta: number, progressDelta: number, log: AgentUpdateLog) => {
    setTargetYearShift((prev) => prev + yearsDelta);
    setEvolutionProgress((prev) => Math.min(99.9, Math.max(10, prev + progressDelta)));
    setAgentLogs((prev) => [log, ...prev.slice(0, 24)]);
  }, []);

  // Modals state
  const [detailModalMilestone, setDetailModalMilestone] = useState<Milestone | null>(null);
  const [detailModalInitialTab, setDetailModalInitialTab] = useState<
    "overview" | "personal_impact" | "five_layers" | "rich_story" | "academic_radar"
  >("overview");
  const [shareCardMilestone, setShareCardMilestone] = useState<Milestone | null>(null);

  const handleOpenDetailModal = (
    m: Milestone,
    tab?: "overview" | "personal_impact" | "five_layers" | "rich_story" | "academic_radar"
  ) => {
    setDetailModalMilestone(m);
    setDetailModalInitialTab(tab || "overview");
  };
  const [embedModalMilestone, setEmbedModalMilestone] = useState<Milestone | null>(null);
  const [userProfileModalOpen, setUserProfileModalOpen] = useState<boolean>(false);
  const [userProfileModalDefaultTab, setUserProfileModalDefaultTab] = useState<"profile" | "badges" | "collection">("profile");

  // Scientific Verification Engine & Anomaly Notification State
  const [customDescriptions, setCustomDescriptions] = useState<Record<number, string>>(() => {
    return safeStorage.getJSON<Record<number, string>>("milestone_live_synced_descriptions", {});
  });
  const [detectedAnomalies, setDetectedAnomalies] = useState<ScientificAnomaly[]>([]);
  const [isScanningBrain, setIsScanningBrain] = useState<boolean>(false);
  const [isSyncingLiveScience, setIsSyncingLiveScience] = useState<boolean>(false);
  const [liveTelegramFeeds, setLiveTelegramFeeds] = useState<TelegramFeedItem[]>([]);
  const [liveIngestToast, setLiveIngestToast] = useState<LiveIngestToastData | null>(null);
  const seenIngestIdsRef = useRef<Set<string>>(new Set());

  // Automatically fetch live intelligence feed from server with smart visibility-aware polling
  useEffect(() => {
    let isMounted = true;
    const fetchLiveFeed = async () => {
      if (!isMounted || document.hidden) return;
      try {
        const res = await safeFetchJson<any>("/api/telegram/feed?limit=50");
        if (isMounted && res?.success && Array.isArray(res.feed)) {
          // Check for newly arrived items to show real notification toast
          if (seenIngestIdsRef.current.size > 0) {
            const newlyArrived = res.feed.find((item: any) => item.id && !seenIngestIdsRef.current.has(item.id));
            if (newlyArrived) {
              setLiveIngestToast({
                id: newlyArrived.id,
                title: newlyArrived.title || "Canlı Bilimsel İstihbarat",
                year: newlyArrived.extractedYear || 2028,
                category: newlyArrived.category || "Yapay Zeka & Bilişim",
                summary: newlyArrived.summary || newlyArrived.originalText,
                receivedAt: newlyArrived.receivedAt || new Date().toISOString(),
              });
            }
          }

          // Update seen set
          res.feed.forEach((item: any) => {
            if (item.id) seenIngestIdsRef.current.add(item.id);
          });

          setLiveTelegramFeeds(res.feed);
        }
      } catch (err) {
        console.warn("[Live Feed Polling] Failed to fetch feed:", err);
      }
    };

    fetchLiveFeed();
    const interval = setInterval(() => {
      if (document.visibilityState === "visible") {
        fetchLiveFeed();
      }
    }, 30000);

    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        fetchLiveFeed();
      }
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      isMounted = false;
      clearInterval(interval);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, []);

  // Automatically persist any updated / synchronized milestone descriptions
  useEffect(() => {
    if (Object.keys(customDescriptions).length > 0) {
      safeStorage.setJSON("milestone_live_synced_descriptions", customDescriptions);
    }
  }, [customDescriptions]);

  // Live Scientific & Technological Grounding Sync Trigger
  const handleSyncTimelineLive = useCallback(async () => {
    try {
      setIsSyncingLiveScience(true);
      const res = await aiService.syncTimelineWithLiveScience(TIMELINE_DATA);
      if (res.success && res.updatedMilestones && res.updatedMilestones.length > 0) {
        const updates: Record<number, string> = {};
        res.updatedMilestones.forEach((um) => {
          if (um.updatedDescription) {
            updates[um.year] = um.updatedDescription;
          }
        });
        if (Object.keys(updates).length > 0) {
          setCustomDescriptions((prev) => ({ ...prev, ...updates }));
        }
      }
    } catch (e) {
      console.warn("[Live Timeline Sync] Error syncing timeline with live science:", e);
    } finally {
      setIsSyncingLiveScience(false);
    }
  }, []);

  // Fully Autonomous Background Science Audit & Self-Service Healing
  useEffect(() => {
    let isMounted = true;
    const runAutonomousBackgroundAudit = async () => {
      try {
        setIsScanningBrain(true);
        const anomalies = await ScientificVerificationEngine.scanDatasetAnomalies(TIMELINE_DATA);
        if (!isMounted) return;
        setIsScanningBrain(false);

        if (anomalies.length > 0) {
          const autoCorrections: Record<number, string> = {};
          anomalies.forEach((a) => {
            if (a.verification?.correctedDescription) {
              autoCorrections[a.milestoneYear] = a.verification.correctedDescription;
            }
          });

          if (Object.keys(autoCorrections).length > 0) {
            setCustomDescriptions((prev) => ({ ...prev, ...autoCorrections }));
          }
        }
      } catch (err) {
        console.warn("[Background Autonomous Audit] Auto-healing check completed.", err);
        if (isMounted) setIsScanningBrain(false);
      }
    };

    runAutonomousBackgroundAudit();
    return () => { isMounted = false; };
  }, []);

  const handleApplyAnomalyCorrection = useCallback((year: number, correctedDescription: string) => {
    setCustomDescriptions((prev) => ({ ...prev, [year]: correctedDescription }));
    setDetectedAnomalies((prev) => prev.filter((a) => a.milestoneYear !== year));
  }, []);

  const handleHitlRevision = useCallback((year: number, userNote: string) => {
    console.log(`[HITL Revision Request] Year: ${year}, Note: ${userNote}`);
  }, []);

  // Localized canonical dataset based on active language and Scenario Mode branch with Dynamic Time-Decay Probabilities
  const rawLocalizedTimeline = getLocalizedTimelineData(TIMELINE_DATA, language);

  const baseLocalizedTimeline = rawLocalizedTimeline.map((m) => {
    // Epistemic Grounding: Preserve canonical factual baseline description separately from model annotations
    const canonicalDescription = m.canonicalDescription || m.description;
    const customDesc = customDescriptions[m.year];

    // Attach any live Telegram intelligence items matching this target year
    const matchingTelegramSignals = liveTelegramFeeds.filter(
      (feed) => (feed.matchedMilestoneYear || feed.extractedYear) === m.year
    );
    const liveAnnotation = matchingTelegramSignals.length > 0 ? matchingTelegramSignals[0].summary : undefined;
    const baseMilestone = customDesc
      ? { ...m, canonicalDescription, description: customDesc, liveSignalAnnotation: liveAnnotation }
      : { ...m, canonicalDescription, liveSignalAnnotation: liveAnnotation };

    // Calculate mathematical time-decay probability for the milestone's target year
    const { adjustedProbability } = calculateDynamicProbability(baseMilestone.probability, baseMilestone.year, scenarioMode);
    
    // Base item with dynamic probability and live signals attached
    const item: Milestone = {
      ...baseMilestone,
      canonicalDescription,
      liveSignalAnnotation: liveAnnotation,
      probability: adjustedProbability,
      signals: [
        ...(baseMilestone.signals || []),
        ...matchingTelegramSignals.map((sigItem, sigIdx) => ({
          id: sigItem.id ? `sig-${sigItem.id}-${sigIdx}` : `tg-sig-${m.year}-${sigIdx}`,
          category: "clinical_field_test" as const,
          title: sigItem.title,
          sourceOrg: sigItem.channelTitle || "Telegram İstihbarat Kanalı",
          summary: sigItem.summary || sigItem.originalText,
          url: sigItem.sourceUrl,
          confidenceWeight: sigItem.confidenceScore || 85,
          signalStrength: (sigItem.impactVerdict === "HIGH_BREAKTHROUGH"
            ? "Güçlü Doğrulayıcı Sinyal (Saha/Onay/Patent)"
            : "Orta Güçlü Sinyal (Pilot/Duyuru)") as any,
          isVerifiedSignal: Boolean(
            sigItem.sourceUrl &&
            !sigItem.sourceUrl.includes("telegram.org") &&
            (sigItem.sourceUrl.includes("science.org") || sigItem.sourceUrl.includes("doi") || sigItem.sourceUrl.includes("arxiv") || sigItem.sourceUrl.includes("patents"))
          ),
          evidenceTier: (Boolean(sigItem.sourceUrl && !sigItem.sourceUrl.includes("telegram.org") && sigItem.sourceUrl.includes("science.org"))
            ? "IDENTIFIER_PRESENT"
            : "URL_ONLY") as "IDENTIFIER_PRESENT" | "URL_ONLY",
        })),
      ],
    };

    return applyScenarioTransform(item, scenarioMode, language);
  });

  // Dynamic milestone synthesis for years introduced via Telegram intelligence vault
  const baseYears = new Set(rawLocalizedTimeline.map((m) => m.year));
  const dynamicYearsGroup: Record<number, TelegramFeedItem[]> = {};
  liveTelegramFeeds.forEach((feed) => {
    if (feed.extractedYear && !baseYears.has(feed.extractedYear) && feed.extractedYear >= 2026 && feed.extractedYear <= 2060) {
      if (!dynamicYearsGroup[feed.extractedYear]) dynamicYearsGroup[feed.extractedYear] = [];
      dynamicYearsGroup[feed.extractedYear].push(feed);
    }
  });

  const dynamicMilestoneItems: Milestone[] = Object.entries(dynamicYearsGroup).map(([yearStr, feeds]) => {
    const yr = Number(yearStr);
    const top = feeds[0];
    const phase: PhaseId = yr <= 2030 ? 1 : yr <= 2045 ? 2 : 3;
    const cat = (top.category || "Yapay Zeka & Bilişim") as CategoryType;
    return {
      year: yr,
      title: top.title || `Teknolojik Kırılma (${yr})`,
      category: cat,
      phase,
      description: top.summary || top.originalText,
      probability: top.confidenceScore || 85,
      impactLevel: 88,
      aiAutonomyIndex: yr <= 2030 ? 45 : yr <= 2045 ? 78 : 95,
      humanAugmentationIndex: yr <= 2030 ? 35 : yr <= 2045 ? 68 : 92,
      bioDigitalIntegrationRate: yr <= 2030 ? 25 : yr <= 2045 ? 60 : 88,
      iconName: "Zap",
      keyDrivers: ["Telegram Canlı İstihbarat", "Hızlandırılmış Saha Deneyleri", top.channelTitle || "Kanal Verisi"],
      ethicalRisks: ["Yeni teknolojik dağılım eşitsizliği ve adaptasyon hızı"],
      societalOpportunities: ["Hızlandırılmış inovasyon ve verimlilik artışı"],
      dailyLifeImpact: "Bireysel yaşamda ve iş süreçlerinde doğrudan ölçülebilir dönüşüm.",
      relatedYears: [yr - 1, yr + 1],
      signals: feeds.map((f, fIdx) => ({
        id: f.id ? `feed-sig-${f.id}-${fIdx}` : `feed-sig-${yr}-${fIdx}`,
        category: "clinical_field_test" as const,
        title: f.title,
        sourceOrg: f.channelTitle || "Telegram İstihbarat Kanalı",
        summary: f.summary || f.originalText,
        url: f.sourceUrl,
        confidenceWeight: f.confidenceScore || 85,
        signalStrength: "Güçlü Doğrulayıcı Sinyal (Saha/Onay/Patent)" as const,
        isVerifiedSignal: Boolean(
          f.sourceUrl &&
          !f.sourceUrl.includes("telegram.org") &&
          (f.sourceUrl.includes("science.org") || f.sourceUrl.includes("doi") || f.sourceUrl.includes("arxiv") || f.sourceUrl.includes("patents"))
        ),
        evidenceTier: (Boolean(f.sourceUrl && !f.sourceUrl.includes("telegram.org") && f.sourceUrl.includes("science.org"))
          ? "IDENTIFIER_PRESENT"
          : "URL_ONLY") as "IDENTIFIER_PRESENT" | "URL_ONLY",
      })),
      isDynamicBreakthrough: true,
    };
  });

  const localizedTimeline = useMemo(() => {
    return [...baseLocalizedTimeline, ...dynamicMilestoneItems].sort((a, b) => a.year - b.year);
  }, [baseLocalizedTimeline, dynamicMilestoneItems]);

  // Active milestone lookup preserving dynamic annotations, breakthroughs, and live signals
  const activeMilestone = useMemo(() => {
    if (!activeMilestoneState) return localizedTimeline[0];
    
    // Check if the timeline has a localized counterpart for this year
    const localizedMatch = localizedTimeline.find((m) => m.year === activeMilestoneState.year);
    if (!localizedMatch) {
      return activeMilestoneState;
    }

    // Invariant: Preserve dynamic/runtime annotations (liveSignalAnnotation, isDynamicBreakthrough, dynamic signals)
    // while keeping localized baseline labels when appropriate.
    return {
      ...localizedMatch,
      ...activeMilestoneState,
      title: activeMilestoneState.isDynamicBreakthrough ? activeMilestoneState.title : (localizedMatch.title || activeMilestoneState.title),
      description: activeMilestoneState.isDynamicBreakthrough ? activeMilestoneState.description : (localizedMatch.description || activeMilestoneState.description),
      liveSignalAnnotation: activeMilestoneState.liveSignalAnnotation !== undefined ? activeMilestoneState.liveSignalAnnotation : localizedMatch.liveSignalAnnotation,
      isDynamicBreakthrough: activeMilestoneState.isDynamicBreakthrough ?? localizedMatch.isDynamicBreakthrough,
      signals: (activeMilestoneState.signals && activeMilestoneState.signals.length > 0) ? activeMilestoneState.signals : localizedMatch.signals,
    };
  }, [localizedTimeline, activeMilestoneState]);

  // Currently open detail modal milestone resolved dynamically preserving runtime annotations
  const currentDetailMilestone = useMemo(() => {
    if (!detailModalMilestone) return null;
    const localizedMatch = localizedTimeline.find((m) => m.year === detailModalMilestone.year);
    if (!localizedMatch) return detailModalMilestone;
    return {
      ...localizedMatch,
      ...detailModalMilestone,
      title: detailModalMilestone.isDynamicBreakthrough ? detailModalMilestone.title : (localizedMatch.title || detailModalMilestone.title),
      description: detailModalMilestone.isDynamicBreakthrough ? detailModalMilestone.description : (localizedMatch.description || detailModalMilestone.description),
      liveSignalAnnotation: detailModalMilestone.liveSignalAnnotation !== undefined ? detailModalMilestone.liveSignalAnnotation : localizedMatch.liveSignalAnnotation,
      isDynamicBreakthrough: detailModalMilestone.isDynamicBreakthrough ?? localizedMatch.isDynamicBreakthrough,
      signals: (detailModalMilestone.signals && detailModalMilestone.signals.length > 0) ? detailModalMilestone.signals : localizedMatch.signals,
    };
  }, [detailModalMilestone, localizedTimeline]);

  // Get list of unique categories
  const categories = Array.from(new Set(TIMELINE_DATA.map((m) => m.category))) as CategoryType[];

  // Filter milestones based on state
  const filteredMilestones = localizedTimeline.filter((m) => {
    if (selectedPhase !== "all" && m.phase !== selectedPhase) return false;
    if (selectedCategory !== "all" && m.category !== selectedCategory) return false;
    if (searchQuery.trim() !== "") {
      const q = searchQuery.toLowerCase();
      const matchTitle = m.title.toLowerCase().includes(q);
      const matchDesc = m.description.toLowerCase().includes(q);
      const matchYear = m.year.toString().includes(q);
      const matchDrivers = m.keyDrivers.some((d) => d.toLowerCase().includes(q));
      return matchTitle || matchDesc || matchYear || matchDrivers;
    }
    return true;
  });

  const setActiveMilestone = (m: Milestone) => {
    // Preserve the full milestone object and all dynamic/runtime annotations (live signals, breakthrough status, etc.)
    setActiveMilestoneState(m);
  };

  const activeMilestoneYear = activeMilestone?.year;
  const firstFilteredMilestoneYear = filteredMilestones[0]?.year;

  // Ensure activeMilestone stays valid when filters change
  useEffect(() => {
    if (
      filteredMilestones.length > 0 &&
      activeMilestoneYear !== undefined &&
      !filteredMilestones.some((m) => m.year === activeMilestoneYear) &&
      firstFilteredMilestoneYear !== undefined
    ) {
      // Invariant: Do not revert to raw static TIMELINE_DATA. Use the localized and runtime-aware
      // filteredMilestones element which retains liveSignalAnnotation, isDynamicBreakthrough, and dynamic signals.
      const nextActive = filteredMilestones.find((m) => m.year === firstFilteredMilestoneYear) || filteredMilestones[0];
      if (nextActive) {
        setActiveMilestoneState(nextActive);
      }
    }
  }, [selectedPhase, selectedCategory, searchQuery, activeMilestoneYear, firstFilteredMilestoneYear, filteredMilestones]);

  // Simulation playback timer
  useEffect(() => {
    let interval: any = null;
    if (isPlaying && filteredMilestones.length > 0) {
      interval = setInterval(() => {
        setActiveMilestoneState((prev) => {
          const idx = filteredMilestones.findIndex((m) => m.year === prev.year);
          if (idx < 0 || idx >= filteredMilestones.length - 1) {
            return filteredMilestones[0];
          }
          return filteredMilestones[idx + 1];
        });
      }, 3000 / playbackSpeed);
    }
    return () => clearInterval(interval);
  }, [isPlaying, playbackSpeed, filteredMilestones.length, selectedPhase, selectedCategory, searchQuery, scenarioMode, language]);

  const handleSelectMilestoneByYear = (year: number) => {
    const list = localizedTimeline && localizedTimeline.length > 0 ? localizedTimeline : TIMELINE_DATA;
    if (!list || list.length === 0) return;
    let closest = list[0];
    let minDiff = Math.abs(list[0].year - year);
    for (const m of list) {
      const diff = Math.abs(m.year - year);
      if (diff < minDiff) {
        minDiff = diff;
        closest = m;
      }
    }
    setActiveMilestone(closest);
    setDetailModalMilestone(closest);
  };

  const handleResetFilters = () => {
    setSelectedPhase("all");
    setSelectedCategory("all");
    setSearchQuery("");
  };

  const handleNavigateToView = (view: ViewMode, targetYear?: number) => {
    const canonicalView = (view as string) === "telegram_hub" ? "telegram_feed" : view;
    setCurrentView(canonicalView);
    if (targetYear) {
      if (activeMilestoneState && activeMilestoneState.year === targetYear) {
        // Keep active milestone's dynamic context
      } else {
        const match = localizedTimeline.find((m) => m.year === targetYear);
        if (match) {
          setActiveMilestone(match);
        }
      }
    }
    window.scrollTo({ top: 0, left: 0, behavior: "instant" });
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
    const mainEl = document.querySelector("main");
    if (mainEl) mainEl.scrollTop = 0;
  };

  if (isEmbedded) {
    return <EmbeddedWidgetView milestones={localizedTimeline} />;
  }

  // Dedicated registration gate modal state
  // Visitors can explore the site freely like Google One, and register when they choose to
  const [showRegistrationGate, setShowRegistrationGate] = useState<boolean>(false);

  // Soft notification flag if logged-in user hasn't completed their onboarding details yet
  const [hasDismissedOnboardingBanner, setHasDismissedOnboardingBanner] = useState<boolean>(false);
  const showSoftOnboardingBanner = !hasDismissedOnboardingBanner && !!(currentUser && currentUser.isOnboardingCompleted === false);

  // Listener for custom re-opening of the onboarding wizard (e.g. from user profile modal or navbar)
  useEffect(() => {
    const handleReopenWizard = () => {
      setIsOnboardingModalOpen(true);
    };
    window.addEventListener("reopen_registration_wizard", handleReopenWizard);
    return () => window.removeEventListener("reopen_registration_wizard", handleReopenWizard);
  }, []);

  return (
    <div className="min-h-screen bg-[#080B14] text-slate-100 flex flex-col font-sans selection:bg-cyan-500 selection:text-slate-950 relative overflow-x-hidden">
      {/* Dynamic Futuristic Ambient Background for All Tabs */}
      <FuturisticAmbientBackground scenarioMode={scenarioMode} />

      {/* Gentle Non-Intrusive Onboarding Reminder Banner (Never blocks the screen) */}
      {showSoftOnboardingBanner && (
        <div className="relative z-30 bg-gradient-to-r from-purple-950/90 via-indigo-950/90 to-purple-950/90 border-b border-purple-500/40 px-4 py-2 text-xs flex items-center justify-between shadow-lg">
          <div className="flex items-center gap-2 text-purple-200">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse shrink-0" />
            <span>
              <strong>Gelecek Profilinizi Tamamlayın:</strong> Yaş, meslek ve 2026-2060 hedeflerinizi ekleyerek yapay zeka analizlerinizi kişiselleştirin.
            </span>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            <button
              type="button"
              onClick={() => setIsOnboardingModalOpen(true)}
              className="px-3 py-1 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-[11px] transition-all cursor-pointer"
            >
              Profili Şimdi Tamamla
            </button>
            <button
              type="button"
              onClick={() => setHasDismissedOnboardingBanner(true)}
              className="text-slate-400 hover:text-white text-xs cursor-pointer"
              title="Kapat"
            >
              ✕
            </button>
          </div>
        </div>
      )}
      
      {/* Futuristic Registration Gate Modal (Opens on demand when clicked, with full close button) */}
      {showRegistrationGate && (
        <FuturisticRegistrationGate
          onCompleteRegistration={(registeredUser) => {
            setShowRegistrationGate(false);
            handleLoginSuccess(registeredUser);
          }}
          onLoginExistingUser={(loggedInUser) => {
            setShowRegistrationGate(false);
            handleLoginSuccess(loggedInUser);
          }}
          onExploreAsGuest={() => {
            setShowRegistrationGate(false);
          }}
          onClose={() => {
            setShowRegistrationGate(false);
          }}
        />
      )}
      
      {/* Unified Top Futurist HUD & Navbar Header */}
      <Navbar
        currentView={currentView}
        setCurrentView={setCurrentView}
        selectedPhase={selectedPhase}
        setSelectedPhase={setSelectedPhase}
        selectedCategory={selectedCategory}
        setSelectedCategory={setSelectedCategory}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        categories={categories}
        onOpenEmbedModal={() => setEmbedModalMilestone(activeMilestone)}
        scenarioMode={scenarioMode}
        setScenarioMode={handleScenarioChange}
        onOpenUserProfileModal={() => {
          if (!currentUser) {
            setUserAuthModalOpen(true);
          } else {
            setUserProfileModalDefaultTab("profile");
            setUserProfileModalOpen(true);
          }
        }}
        onOpenCreditStore={() => setCreditStoreModalOpen(true)}
        onOpenGuideModal={() => setGuideModalOpen(true)}
        onOpenDrawer={() => setIsNexusDrawerOpen(true)}
        currentUser={currentUser}
        targetYearShift={targetYearShift}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-3 sm:px-4 lg:px-8 py-3 sm:py-4 pb-28 md:pb-12 relative z-10">
        {/* Sleek, uncluttered view navigation bar for active modules (No sensory overload or stacked tickers) */}
        {currentView !== "portal" && (
          <div className={`flex flex-wrap items-center justify-between gap-2.5 ${currentView === "persona_chat" ? "mb-2 sm:mb-5" : "mb-5"} px-3 py-1.5 sm:py-2.5 rounded-2xl bg-[#0f0a24]/90 border border-purple-500/20 backdrop-blur-xl shadow-lg font-sans`}>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setCurrentView("portal")}
                className="px-2 sm:px-3 py-1 rounded-xl bg-purple-600/20 hover:bg-purple-600/40 border border-purple-500/40 text-purple-200 hover:text-white text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shrink-0"
                title="Ana Gelecek İstihbarat Merkezine Dön"
              >
                <span>←</span>
                <span className="hidden xs:inline">{language === "tr" ? "Ana Gelecek Merkezi" : "Back to Hub"}</span>
                <span className="xs:hidden">{language === "tr" ? "Merkez" : "Hub"}</span>
              </button>

              <span className="text-slate-600">|</span>

              <div className="flex items-center gap-2 text-xs">
                <span className="text-slate-400 font-medium">{language === "tr" ? "Aktif Görünüm:" : "Active Module:"}</span>
                <span className="font-bold text-white px-2 py-0.5 rounded-lg bg-purple-950/80 border border-purple-500/30">
                  {currentView === "timeline" && (language === "tr" ? "🕒 2026—2060 Zaman Çizelgesi" : "🕒 2026—2060 Timeline")}
                  {(currentView === "telegram_feed" || (currentView as string) === "telegram_hub") && (language === "tr" ? "⚡ Telegram Canlı İstihbarat" : "⚡ Telegram Intelligence")}
                  {currentView === "job_risk" && (language === "tr" ? "💼 Meslek Risk Analizi" : "💼 Job Risk Analyzer")}
                  {currentView === "verification" && (language === "tr" ? "🔬 Bilimsel Doğrulama & Gelişim Aşaması" : "🔬 Scientific Verification & Stage Scale")}
                  {currentView === "persona_chat" && (language === "tr" ? "💬 2060 Zaman Yolcusu Sohbeti" : "💬 2060 Time Traveler Chat")}
                  {currentView === "network" && (language === "tr" ? "🕸️ Nedensellik & Etki Ağı" : "🕸️ Causality Network")}
                  {currentView === "butterfly" && (language === "tr" ? "🦋 Kelebek Etkisi" : "🦋 Butterfly Effect")}
                  {currentView === "geo_map" && (language === "tr" ? "🌐 5-Katmanlı Dünya Durumu" : "🌐 5-Layer World Map")}
                  {currentView === "roadmap" && (language === "tr" ? "🗺️ Kişisel Gelecek Planı" : "🗺️ Personal Roadmap")}
                  {currentView === "spin_wheel" && (language === "tr" ? "🎰 Günlük Gelecek Çarkı" : "🎰 Daily Spin Wheel")}
                  {currentView === "leaderboard" && (language === "tr" ? "🏆 Global Liderlik Tablosu" : "🏆 Leaderboard")}
                  {currentView === "audit" && (language === "tr" ? "⚙️ Algoritmik Denetim" : "⚙️ Algorithmic Audit")}
                  {currentView === "data_integrity" && (language === "tr" ? "🛡️ Veri Bütünlüğü" : "🛡️ Data Integrity")}
                  {currentView === "futurist_advisor" && (language === "tr" ? "🤖 2060 Futurist AI" : "🤖 2060 Futurist AI")}
                  {currentView === "prediction_history" && (language === "tr" ? "📜 Tahmin Arşivi" : "📜 Prediction History")}
                </span>
              </div>
            </div>

            {/* Live Feed count indicator */}
            <div className="flex items-center gap-2 text-xs">
              {liveTelegramFeeds.length > 0 && (
                <button
                  onClick={() => setCurrentView("telegram_feed")}
                  className="px-2.5 py-1 rounded-xl bg-purple-500/20 hover:bg-purple-500/30 border border-purple-500/40 text-purple-200 font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer"
                  title="Canlı Telegram İstihbarat Akışını Görüntüle"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  <span>{liveTelegramFeeds.length} {language === "tr" ? "Canlı İstihbarat Sinyali" : "Signals"}</span>
                </button>
              )}
            </div>
          </div>
        )}

        {currentView !== "portal" && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4 pb-1">
            <ForesightDisclaimerBanner />
          </div>
        )}

        <ErrorBoundary componentName={`View-${currentView}`} onReset={() => setCurrentView("portal")}>
          <AnimatePresence mode="wait">
            {/* VIEW 0: EPIC INTELLIGENCE HUB PORTAL (Clean, Focused, Uncluttered) */}
            {currentView === "portal" && (
              <EpicIntelligenceHubPortal
                key="epic-landing-portal"
                onEnterConsole={(targetView) => {
                  try {
                    sessionStorage.setItem("has_entered_console", "true");
                  } catch {}
                  setCurrentView(targetView || "timeline");
                  window.scrollTo({ top: 0, left: 0, behavior: "instant" });
                }}
              />
            )}
          </AnimatePresence>

        {/* VIEW 1: TIMELINE */}
        {currentView === "timeline" && (
          <TimelineView
            milestones={filteredMilestones}
            activeMilestone={activeMilestone}
            setActiveMilestone={setActiveMilestone}
            playbackSpeed={playbackSpeed}
            setPlaybackSpeed={setPlaybackSpeed}
            onOpenDetailModal={handleOpenDetailModal}
            totalCount={localizedTimeline.length}
            selectedPhase={selectedPhase}
            setSelectedPhase={setSelectedPhase}
            selectedCategory={selectedCategory}
            searchQuery={searchQuery}
            onResetFilters={handleResetFilters}
            scenarioMode={scenarioMode}
            setScenarioMode={handleScenarioChange}
            onNavigateToView={handleNavigateToView}
            onSyncTimelineLive={handleSyncTimelineLive}
            isSyncingLiveScience={isSyncingLiveScience}
          />
        )}

        {/* VIEW 1.5: GELECEK ÇARKI STANDALONE */}
        {currentView === "spin_wheel" && (
          <DailyFutureSpinWheel
            onOpenProfileCollection={() => {
              setUserProfileModalDefaultTab("collection");
              setUserProfileModalOpen(true);
            }}
          />
        )}

        {/* VIEW 1.6: GLOBAL LİDERLİK TABLOSU */}
        {currentView === "leaderboard" && (
          <GlobalLeaderboardView />
        )}

        {/* VIEW 1.7: FUTURIST AI ADVISOR (2060 CAREER & LIFE ADVICE) */}
        {currentView === "futurist_advisor" && (
          <PlanFeatureGateOverlay
            targetView="futurist_advisor"
            onNavigateBack={() => setCurrentView("timeline")}
            onOpenStoreModal={() => setCreditStoreModalOpen(true)}
          >
            <FuturistAIAdvisor
              milestones={localizedTimeline}
              currentUser={currentUser}
              onNavigateToView={handleNavigateToView}
              onNavigateToMilestone={(year) => {
                const found = localizedTimeline.find((m) => m.year === year);
                if (found) {
                  setActiveMilestone(found);
                  setCurrentView("timeline");
                }
              }}
            />
          </PlanFeatureGateOverlay>
        )}

        {/* VIEW 1.8: PREDICTION & SIMULATION ENGAGEMENT HISTORY DOSSIER */}
        {currentView === "prediction_history" && (
          <PredictionHistoryView
            onNavigateToView={handleNavigateToView}
            currentUser={currentUser}
          />
        )}

        {/* VIEW 2: PERSONAL ROADMAP */}
        {currentView === "roadmap" && (
          <PlanFeatureGateOverlay
            targetView="roadmap"
            onNavigateBack={() => setCurrentView("timeline")}
            onOpenStoreModal={() => setCreditStoreModalOpen(true)}
          >
            <PersonalRoadmapView
              milestones={localizedTimeline}
              categories={categories}
              activeMilestone={activeMilestone}
              liveSignals={liveTelegramFeeds}
              onNavigateToView={handleNavigateToView}
              onSelectMilestone={(m) => {
                setActiveMilestone(m);
                handleOpenDetailModal(m, "personal_impact");
              }}
            />
          </PlanFeatureGateOverlay>
        )}

        {/* VIEW 3: CAUSALITY NETWORK */}
        {currentView === "network" && (
          <PlanFeatureGateOverlay
            targetView="network"
            onNavigateBack={() => setCurrentView("timeline")}
            onOpenStoreModal={() => setCreditStoreModalOpen(true)}
          >
            <CausalityNetworkView
              milestones={localizedTimeline}
              onSelectMilestone={(m) => {
                setActiveMilestone(m);
                setDetailModalMilestone(m);
              }}
            />
          </PlanFeatureGateOverlay>
        )}

        {/* VIEW 4: VERIFICATION SYSTEM ("Gerçekleşti mi?") */}
        {currentView === "verification" && (
          <VerificationSystemView
            milestones={localizedTimeline}
            userCredits={userCredits}
            onDeductCredits={handleDeductCredits}
            onOpenCreditStore={() => setCreditStoreModalOpen(true)}
            onSelectMilestone={(m) => {
              setActiveMilestone(m);
              setDetailModalMilestone(m);
            }}
          />
        )}

        {/* VIEW 4.5: ALGORITHMIC AUDIT & ANOMALY DETECTOR */}
        {currentView === "audit" && (
          <PlanFeatureGateOverlay
            targetView="audit"
            onNavigateBack={() => setCurrentView("timeline")}
            onOpenStoreModal={() => setCreditStoreModalOpen(true)}
          >
            <AlgorithmicAuditWidget
              milestone={activeMilestone}
              allMilestones={localizedTimeline}
              onSelectMilestone={(m) => {
                setActiveMilestone(m);
              }}
              onOpenDetailModal={(m) => {
                setDetailModalMilestone(m);
              }}
              standalone={true}
            />
          </PlanFeatureGateOverlay>
        )}

        {/* VIEW 4.8: DEDICATED FULL-PAGE AUTONOMOUS AGENT SCAN VIEW */}
        {currentView === "agent_scan" && (
          <PlanFeatureGateOverlay
            targetView="agent_scan"
            onNavigateBack={() => setCurrentView("timeline")}
            onOpenStoreModal={() => setCreditStoreModalOpen(true)}
          >
            <AutonomousAgentSystem
              isFullPageView={true}
              onNavigateToView={(view, targetYear) => {
                setCurrentView(view);
                if (targetYear) {
                  const match = localizedTimeline.find((m) => m.year === targetYear);
                  if (match) setActiveMilestoneState(match);
                }
                window.scrollTo({ top: 0, behavior: "smooth" });
              }}
              userCredits={userCredits}
              userPlan={userPlan}
              currentUser={currentUser}
              onDeductCredits={handleDeductCredits}
              onOpenCreditStore={() => setCreditStoreModalOpen(true)}
              onOpenAuthModal={() => setUserAuthModalOpen(true)}
            />
          </PlanFeatureGateOverlay>
        )}

        {/* VIEW: GELECEK PUSULASI & KİŞİSEL KARAR MOTORU (3 Hızlı Soru & Sentez) */}
        {currentView === "verdict" && (
          <FutureVerdictView
            milestones={localizedTimeline}
            onSelectMilestone={(m) => {
              setActiveMilestone(m);
              setDetailModalMilestone(m);
            }}
            onNavigateView={handleNavigateToView}
            onOpenAuthModal={() => setUserAuthModalOpen(true)}
            onOpenGuideModal={() => setGuideModalOpen(true)}
          />
        )}

        {/* VIEW 5: JOB AUTOMATION RISK SCORE */}
        {currentView === "job_risk" && (
          <PlanFeatureGateOverlay
            targetView="job_risk"
            onNavigateBack={() => setCurrentView("timeline")}
            onOpenStoreModal={() => setCreditStoreModalOpen(true)}
          >
            <JobRiskAnalyzerView
              scenarioMode={scenarioMode === "baseline" ? "base" : scenarioMode}
              onDeductCredits={handleDeductCredits}
              onOpenCreditStore={() => setCreditStoreModalOpen(true)}
              currentUser={currentUser}
              onOpenAuthModal={() => setUserAuthModalOpen(true)}
              onNavigateToView={handleNavigateToView}
              activeMilestone={activeMilestone}
              onOpenDetailModal={(m, tab) => handleOpenDetailModal(m, tab || "personal_impact")}
              liveSignals={liveTelegramFeeds}
            />
          </PlanFeatureGateOverlay>
        )}

        {/* VIEW 6: GEOGRAPHIC DISTRIBUTION MAP */}
        {currentView === "geo_map" && (
          <GeographicMapView
            milestones={localizedTimeline}
            onSelectMilestone={(m) => {
              setActiveMilestone(m);
              setDetailModalMilestone(m);
            }}
            activeMilestone={activeMilestone}
            onNavigateToView={handleNavigateToView}
            userCredits={userCredits}
            onDeductCredits={handleDeductCredits}
            onOpenCreditStore={() => setCreditStoreModalOpen(true)}
          />
        )}

        {/* VIEW 7: BUTTERFLY EFFECT SIMULATOR ("Ya Şu Olmasaydı?") */}
        {currentView === "butterfly" && (
          <PlanFeatureGateOverlay
            targetView="butterfly"
            onNavigateBack={() => setCurrentView("timeline")}
            onOpenStoreModal={() => setCreditStoreModalOpen(true)}
          >
            <ButterflyEffectView
              milestones={localizedTimeline}
              onSelectMilestone={(m) => {
                setActiveMilestone(m);
                setDetailModalMilestone(m);
              }}
              onDeductCredits={handleDeductCredits}
              onOpenCreditStore={() => setCreditStoreModalOpen(true)}
              currentUser={currentUser}
              onOpenAuthModal={() => setUserAuthModalOpen(true)}
              onNavigateToView={handleNavigateToView}
              targetMilestone={activeMilestone}
            />
          </PlanFeatureGateOverlay>
        )}

        {/* VIEW 8: CANLI PERSONA SOHBETİ */}
        {currentView === "persona_chat" && (
          <PlanFeatureGateOverlay
            targetView="persona_chat"
            onNavigateBack={() => setCurrentView("timeline")}
            onOpenStoreModal={() => setCreditStoreModalOpen(true)}
          >
            <TimeTravelerPersonaChatView
              onDeductCredits={handleDeductCredits}
              onOpenCreditStore={() => setCreditStoreModalOpen(true)}
              currentUser={currentUser}
              onOpenAuthModal={() => setUserAuthModalOpen(true)}
              targetMilestone={activeMilestone}
              targetYear={activeMilestoneYear}
              onNavigateToView={handleNavigateToView}
              onOpenDetailModal={(m, tab) => handleOpenDetailModal(m, tab || "personal_impact")}
            />
          </PlanFeatureGateOverlay>
        )}

        {/* VIEW 9: TOPLULUK KATKILARI & MİLESTONE ÖNERİSİ */}
        {currentView === "community" && <CommunitySubmissionsView />}

        {/* VIEW 9.2: CANLI TELEGRAM İSTİHBARAT AKIŞI & BOT YÖNETİMİ */}
        {(currentView === "telegram_feed" || (currentView as string) === "telegram_hub") && (
          <TelegramIntelligenceHubView
            activeMilestone={activeMilestone}
            onNavigateView={(v) => setCurrentView(v as any)}
            onSelectMilestoneYear={(year) => {
              const target = localizedTimeline.find((m) => m.year === year) || TIMELINE_DATA.find((m) => m.year === year);
              if (target) {
                setActiveMilestone(target);
                setDetailModalMilestone(target);
              }
              setCurrentView("timeline");
            }}
          />
        )}

        {/* VIEW 9.5: VERİ BÜTÜNLÜĞÜ VE ŞEFFAFLIK ANALİZİ */}
        {currentView === "data_integrity" && (
          <PlanFeatureGateOverlay
            targetView="data_integrity"
            onNavigateBack={() => setCurrentView("timeline")}
            onOpenStoreModal={() => setCreditStoreModalOpen(true)}
          >
            <DataIntegrityView
              onSelectMilestone={(m) => {
                setActiveMilestone(m);
                setDetailModalMilestone(m);
              }}
            />
          </PlanFeatureGateOverlay>
        )}

        {/* VIEW 10: ANALYTICS */}
        {currentView === "analytics" && (
          <PlanFeatureGateOverlay
            targetView="analytics"
            onNavigateBack={() => setCurrentView("timeline")}
            onOpenStoreModal={() => setCreditStoreModalOpen(true)}
          >
            <AnalyticsView
              milestones={localizedTimeline}
              scenarioMode={scenarioMode}
              onNavigateToMilestone={(year) => {
                const found = localizedTimeline.find((m) => m.year === year);
                if (found) {
                  setActiveMilestone(found);
                  setCurrentView("timeline");
                }
              }}
            />
          </PlanFeatureGateOverlay>
        )}

        {/* VIEW 11: COMPARISON TOOL */}
        {currentView === "comparison" && (
          <GuestProtectedOverlay
            title="🔒 Senaryo Karşılaştırma Matrisi Kilitlidir"
            description="Farklı gelecek senaryolarını, teknoloji kırılma noktalarını ve olasılık sapmalarını kıyaslamak için oturum açın."
            badgeText="SENARYO KIYASLAMA"
          >
            <ComparisonTool milestones={localizedTimeline} />
          </GuestProtectedOverlay>
        )}

        {/* VIEW 13: SUPER ADMIN DASHBOARD */}
        {currentView === "admin" && (
          <AdminDashboardView />
        )}
        </ErrorBoundary>

      </main>

      {/* Membership & Upsell Value Modal */}
      <MembershipUpsellModal
        isOpen={upsellModalOpen}
        onClose={closeUpsellModal}
        featureTitle={upsellContextTitle}
        featureDescription={upsellContextDesc}
      />

      {/* User Verification & Auth Modal */}
      <UserAuthModal
        isOpen={userAuthModalOpen}
        onClose={() => setUserAuthModalOpen(false)}
        currentUser={currentUser}
        onLoginSuccess={handleLoginSuccess}
        onLogout={handleLogout}
        onOpenAdmin={() => setCurrentView("admin")}
      />

      {/* User Profile & Digital Collection Modal */}
      <UserProfileModal
        isOpen={userProfileModalOpen}
        onClose={() => setUserProfileModalOpen(false)}
        defaultTab={userProfileModalDefaultTab}
        onOpenAdmin={() => setCurrentView("admin")}
        onOpenOnboarding={() => setIsOnboardingModalOpen(true)}
      />

      {/* 5-Step Personalized Onboarding & Profiling Wizard (Available from Profile menu) */}
      {currentUser && (
        <OnboardingWizardModal
          isOpen={isOnboardingModalOpen}
          currentUser={currentUser}
          onComplete={(updatedUser) => {
            handleLoginSuccess(updatedUser);
            setIsOnboardingModalOpen(false);
          }}
          onClose={() => setIsOnboardingModalOpen(false)}
        />
      )}

      {/* Credit & Subscription Store Modal */}
      <CreditStoreModal
        isOpen={creditStoreModalOpen}
        onClose={() => setCreditStoreModalOpen(false)}
        currentUser={currentUser}
        onAddCredits={handleAddCredits}
        onUpgradePlan={handleUpgradePlan}
        onOpenAuthModal={() => setUserAuthModalOpen(true)}
      />

      {/* Detail Modal */}
      {currentDetailMilestone && (
        <MilestoneDetailModal
          milestone={currentDetailMilestone}
          onClose={() => setDetailModalMilestone(null)}
          onSelectMilestone={handleSelectMilestoneByYear}
          onOpenShareCard={(m) => setShareCardMilestone(m)}
          currentUser={currentUser}
          onOpenAuthModal={() => setUserAuthModalOpen(true)}
          onOpenCreditStore={() => setCreditStoreModalOpen(true)}
          onNavigateToView={handleNavigateToView}
          initialTab={detailModalInitialTab}
          liveSignals={liveTelegramFeeds}
        />
      )}

      {/* Shareable Card Modal */}
      <ShareableCardModal
        milestone={shareCardMilestone}
        onClose={() => setShareCardMilestone(null)}
      />

      {/* Embed Widget Modal */}
      <EmbedWidgetModal
        milestone={embedModalMilestone}
        onClose={() => setEmbedModalMilestone(null)}
      />

      {/* Unified Corporate Footer */}
      <CorporateFooter
        onOpenPrivacy={() => setPrivacyModalOpen(true)}
        onOpenTerms={() => setIsGlobalTermsModalOpen(true)}
        onOpenHelpSupport={() => setHelpSupportModalOpen(true)}
        onOpenSupportTicket={() => setSupportModalOpen(true)}
        onOpenVerification={() => {
          setCurrentView("verification");
          window.scrollTo({ top: 0, left: 0, behavior: "instant" });
        }}
        onOpenAudit={() => {
          setCurrentView("audit");
          window.scrollTo({ top: 0, left: 0, behavior: "instant" });
        }}
        onNavigateView={(v) => {
          setCurrentView(v);
          window.scrollTo({ top: 0, left: 0, behavior: "instant" });
        }}
      />

      {/* Global Terms of Service Modal */}
      <TermsOfServiceModal
        isOpen={isGlobalTermsModalOpen}
        onClose={() => setIsGlobalTermsModalOpen(false)}
      />


      {/* Teknolojik Evrim Kontrol Merkezi Slide-over Drawer */}
      <NexusHolodeckDrawer
        isOpen={isNexusDrawerOpen}
        onClose={() => setIsNexusDrawerOpen(false)}
        currentView={currentView}
        onSelectView={(v) => {
          try {
            sessionStorage.setItem("has_entered_console", "true");
          } catch {}
          setCurrentView(v);
        }}
        scenarioMode={scenarioMode}
        onSelectScenario={handleScenarioChange}
        onOpenUserProfile={() => {
          if (!currentUser) {
            setUserAuthModalOpen(true);
          } else {
            setUserProfileModalDefaultTab("profile");
            setUserProfileModalOpen(true);
          }
        }}
        onOpenCreditStore={() => setCreditStoreModalOpen(true)}
        onOpenGuideModal={() => setGuideModalOpen(true)}
        onOpenTermsModal={() => setIsGlobalTermsModalOpen(true)}
      />

      {/* Interactive Platform Guide & Feature Explorer Modal */}
      <InteractiveGuideModal
        isOpen={guideModalOpen}
        onClose={() => setGuideModalOpen(false)}
        onSelectFeatureView={(viewId) => setCurrentView(viewId as ViewMode)}
      />

      {/* 🚀 Cinematic Contextual Tab Walkthrough (Zero robotic voice, triggered smoothly when entering tabs) */}
      <CinematicTabWalkthrough currentView={currentView} />

      {/* Session Lock & Data Security Overlay */}
      <SessionLockedModal />

      {/* Banned User Security Notice Overlay */}
      <BannedUserModal
        isOpen={bannedModalOpen}
        reason={banReasonState}
        onDismiss={() => setBannedModalOpen(false)}
      />

      {/* Unban Probationary Legal Protocol & Ethical Warning Modal */}
      <UnbanProbationNoticeModal
        isOpen={Boolean(
          currentUser &&
            (currentUser.unbanNoticePending || currentUser.isProbationRequired)
        )}
      />

      {/* Google Standard Privacy & Data Hub Modal */}
      <PrivacyDataModal
        isOpen={privacyModalOpen}
        onClose={() => setPrivacyModalOpen(false)}
      />

      {/* Google Help Center Standard Help & Support Modal */}
      <HelpSupportModal
        isOpen={helpSupportModalOpen}
        onClose={() => setHelpSupportModalOpen(false)}
        onOpenPrivacyModal={() => setPrivacyModalOpen(true)}
        onOpenTicketModal={() => setSupportModalOpen(true)}
      />

      {/* Global Support & Appeal Ticket Modal */}
      <SupportTicketModal
        isOpen={supportModalOpen}
        onClose={() => setSupportModalOpen(false)}
        initialCategory="other"
        initialEmail={currentUser?.email}
      />

      {/* Cookie Banner (Google Privacy Compliant) */}
      <CookieBanner onOpenPrivacy={() => setPrivacyModalOpen(true)} />

      {/* Gamified Badge Toast Notification */}
      <BadgeToastNotification />

      {/* Real Live Ingested Telegram Signal Toast Notification */}
      <LiveIngestToastNotification
        toast={liveIngestToast}
        onDismiss={() => setLiveIngestToast(null)}
        onViewMilestone={(year) => {
          const target = localizedTimeline.find((m) => m.year === year);
          if (target) {
            setActiveMilestoneState(target);
          }
          setCurrentView("timeline");
        }}
      />

      {/* Main Brain Scientific Anomaly Notification Overlay */}
      {detectedAnomalies.length > 0 && (
        <AnomalyNotificationOverlay
          anomalies={detectedAnomalies}
          onDismiss={() => setDetectedAnomalies([])}
          onApplyCorrection={handleApplyAnomalyCorrection}
          onRequestHitlRevision={handleHitlRevision}
        />
      )}

      {/* Cognitive Load Tracker & Proactive Focus Mode System */}
      <CognitiveLoadTracker
        currentView={currentView}
        onSwitchView={(v) => setCurrentView(v)}
        milestones={localizedTimeline}
        onSelectMilestone={(m) => setActiveMilestone(m)}
      />

    </div>
  );
}

export default function App() {
  return (
    <ErrorBoundary componentName="RootApplication">
      <LanguageProvider>
        <AuthProvider>
          <AdminProvider>
            <BadgeProvider>
              <MainAppContent />
            </BadgeProvider>
          </AdminProvider>
        </AuthProvider>
      </LanguageProvider>
    </ErrorBoundary>
  );
}

