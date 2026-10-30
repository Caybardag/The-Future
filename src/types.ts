export type CategoryType =
  | "Yapay Zeka & Bilişim"
  | "Biyoloji & Tıp"
  | "Enerji & Çevre"
  | "İnsan-Makine Arayüzü"
  | "Kuantum & Güvenlik"
  | "Otonom & Lojistik"
  | "Sosyoloji & Ekonomi"
  | "Post-İnsan & Medeniyet"
  | "Uzay & Fizik";

export type PhaseId = 1 | 2 | 3;

export interface PhaseInfo {
  id: PhaseId;
  title: string;
  subtitle: string;
  startYear: number;
  endYear: number;
  color: string;
  gradient: string;
  description: string;
  keyTheme: string;
}

export type SignalCategory =
  | "official_roadmap" // 🏢 Şirket Resmi Açıklaması / Yol Haritası (OpenAI, DeepMind, TSMC, Tesla, Apple)
  | "speed_trade_secret" // 🚀 Tescilli Ar-Ge, Hız & Açık Kaynak / Model Üstünlüğü (Hugging Face, Model Ağırlıkları)
  | "clinical_field_test" // 🧪 Klinik Deney / Saha Pilot Testi (FDA Faz I-III, Saha Prototipleri)
  | "regulatory_policy" // 🏛️ Regülasyon, Yasa & Hükümet Onayı (EU AI Act, FCC, FAA, CHIPS Act)
  | "reputable_press" // 📰 Saygın Teknoloji & Sektörel Basın (Bloomberg, Reuters, MIT Tech Review, Wired)
  | "patent_ip"; // 📜 Patent & Fikri Mülkiyet (Destekleyici Kanıt Gücü)

export interface SignalIntelligenceItem {
  id: string;
  category: SignalCategory;
  title: string;
  sourceOrg: string;
  summary: string;
  url?: string;
  confidenceWeight: number; // 1-100
  signalStrength: "Zayıf Sinyal (Erken Dönem)" | "Orta Güçlü Sinyal (Pilot/Duyuru)" | "Güçlü Doğrulayıcı Sinyal (Saha/Onay/Patent)";
  isVerifiedSignal: boolean;
  evidenceTier?: "VERIFIED_EXTERNAL_RECORD" | "IDENTIFIER_PRESENT" | "URL_ONLY" | "CACHED_RECORD" | "STATIC_DATA" | "MODEL_INFERENCE" | "DEMO_FALLBACK";
  trlLevel?: number;
  deepReport?: any;
  isIntegrated?: boolean;
}

// 5 Katmanlı Dünya Durumu (5-Layer World State Matrix)
export interface TechnologicalBreakthroughsLayer {
  aiAndComputing: string; // Yapay Zeka & Bilişim odağı
  biologyAndHealth: string; // Biyoloji & Sağlık odağı
  energyAndInfra: string; // Enerji & Altyapı odağı
}

export interface DailyLifeAndBioLayer {
  morningRoutineSnippet: string; // Sabah uyandığında karşılaştığı hayat
  userAgeFormula?: string; // Kullanıcının o yılki yaşı ve eriştiği biyo-cihazlar
  commonBioInterfaces: string[]; // Lens, nöral arayüz, biyosensörler
}

export interface MacroEconomicsAndGeoLayer {
  automatedJobsRate: number; // % 0-100 otomasyon oranı
  emergingProfessions: string[]; // Yeni doğan meslekler
  geopoliticalPowerHub: string; // Küresel ekonomik & teknolojik güç odağı
}

export interface RiskAndCountermeasureLayer {
  criticalThreat: string; // Siber, sentetik biyo veya enerji darboğazı
  algorithmicDefenses: string; // Yasal ve algoritmik kalkanlar
  vulnerabilityScore: number; // 1-100 risk endeksi
}

export interface ScientificReadinessLayer {
  trlLevel: number; // TRL 1-9 (Technology Readiness Level)
  trlType?: "real_source" | "model_estimated" | "ai_estimated" | "default";
  academicConsensusRate: number; // % 0-100
  consensusType?: "empirical" | "model_projected";
  supportingSignalCount: number;
}

export interface FiveLayerWorldState {
  technologicalBreakthroughs: TechnologicalBreakthroughsLayer;
  dailyLifeAndBio: DailyLifeAndBioLayer;
  macroEconomicsAndGeo: MacroEconomicsAndGeoLayer;
  riskAndCountermeasures: RiskAndCountermeasureLayer;
  scientificReadiness: ScientificReadinessLayer;
  dominoEffects: string[]; // 2035, 2045 ve 2060'ta tetiklediği domino etkileri
}

export interface SubMilestoneBranch {
  id: string;
  year: number;
  title: string;
  description: string;
  category: CategoryType;
  dependencyType: "prerequisite" | "breakthrough_trigger" | "engineering_bottleneck" | "emergent_domain";
  probability: number;
  trlLevel: number;
  criticalParameters: {
    name: string;
    targetValue: string;
    current2026Status: string;
    isBottleneck: boolean;
  }[];
  scientificSources: string[];
  subBranchesCount?: number;
}

export interface DetailedParametricAuditResult {
  year: number;
  title: string;
  status: "accelerated" | "on_track" | "bottleneck" | "paradigm_shift";
  statusLabel: string;
  driftYears: number; // e.g. -2 for 2 years earlier, +3 for 3 years delayed
  scientificConfidenceScore: number; // 0 - 100
  discipline: string; // e.g. "Biyoteknoloji & Genetik", "Robotik & Mekatronik", "Kuantum Bilişim"
  keyEngineeringParameters: {
    paramName: string;
    unit: string;
    requiredThreshold: string;
    currentLabState2026: string;
    feasibilityRatio: number; // 0 - 100
    verdict: "Met" | "In_Progress" | "Critical_Gap";
  }[];
  primaryBottleneck: {
    category: "Physics_Thermodynamics" | "Materials_Synthesis" | "Energy_Density" | "Compute_Scale" | "Regulation_Clinical";
    description: string;
    mitigationStrategy: string;
  };
  breakthroughSignals: string[];
  consequentialDownstreamTriggers: string[];
  scientificVerdictSummary: string;
}

export interface Milestone {
  year: number;
  title: string;
  description: string;
  phase: PhaseId;
  category: CategoryType;
  probability: number; // e.g. 99%
  iconName: string;
  
  // Rich analytical fields
  impactLevel: number; // 1-100
  humanAugmentationIndex: number; // 1-100
  aiAutonomyIndex: number; // 1-100
  bioDigitalIntegrationRate: number; // 1-100
  
  keyDrivers: string[];
  dailyLifeImpact: string;
  ethicalRisks: string[];
  societalOpportunities: string[];
  relatedYears: number[];
  
  // Rich narrative, deep scenario & story breakdown
  extendedStory?: string; // 3-4 paragraflık derinlemesine fütüristik senaryo & anlatı
  societalShiftNarrative?: string; // Toplumsal ve kültürel dönüşüm hikayesi
  technicalBreakthroughsNarrative?: string; // Teknik mimari ve mühendislik detayları

  // 5 Katmanlı Dünya Durumu (5-Layer Living Matrix)
  worldState?: FiveLayerWorldState;

  // Google Patents Integration
  patents?: PatentInfo[];
  googlePatentsSearchUrl?: string;

  // Research & Citations Transparency
  citations?: ResearchCitation[];
  academicPapers?: ResearchCitation[];
  
  // Multi-Modal Signal Intelligence (6 Sinyal İzleme Katmanı)
  signals?: SignalIntelligenceItem[];
  
  // Motor 2: Causal Influence DAG Links
  prerequisiteMilestoneYears?: number[];
  dependentDownstreamYears?: number[];

  // Epistemic Integrity: Canonical Baseline vs Live Model Projection
  canonicalDescription?: string;
  liveSignalAnnotation?: string;

  // Recursive Sub-Trees & Breakthrough Branches
  subBranches?: SubMilestoneBranch[];

  isCommunitySubmission?: boolean;
  isDynamicBreakthrough?: boolean;
}

export interface MilestoneDecisionHistoryEntry {
  year: number;
  selectedOptionId: "A" | "B" | "C";
  previousOptionId?: "A" | "B" | "C" | null;
  selectedAt: string;
  reason?: string;
  trigger?: "user_manual_selection" | "recommendation_adopted" | "reassessment_retained";
}

export interface DynamicImpactAssessment {
  epistemicStatus: "MODEL_PROJECTION_NOT_FACT";
  projectionMethodology: "multi_dimensional_heuristic";
  primaryShiftEstimateYears: number;
  trlLevel?: number;
  dimensions: {
    adoptionReadiness: "EARLY_LAB" | "PILOT_VALIDATED" | "COMMERCIAL_SCALE";
    regulatoryFriction: "LOW" | "MODERATE" | "HIGH_RESTRICTIVE";
    infrastructureDependency: "EXISTING_INFRA" | "NEW_CAPEX_NEEDED" | "ECOSYSTEM_BLOCKER";
    commercialReadiness: "PRE_REVENUE" | "NICHE_DEPLOYED" | "MASS_MARKET";
    manufacturingReadiness: "LAB_PROTOTYPE" | "PILOT_FOUNDRY" | "HIGH_YIELD_FOUNDRY";
    deploymentFriction: "FRICTIONLESS_SOFTWARE" | "HARDWARE_DEPLOYMENT" | "HEAVY_CAPEX_GRID";
    signalStrength: "WEAK_EARLY" | "MODERATE_PILOT" | "STRONG_BREAKTHROUGH";
    evidenceQuality: "HIGH_PEER_REVIEWED" | "MODERATE_INDUSTRY" | "UNVERIFIED_CLAIM";
    confidenceScore: number;
    contradictionLevel: "NONE" | "LOW_DIVERGENT" | "HIGH_CONTRADICTORY";
  };
  readinessDimensions?: {
    adoptionReadiness: number;
    infrastructureReadiness: number;
    regulatoryReadiness: number;
    commercialReadiness: number;
    overallReadinessScore: number;
  };
  disclaimer: string;
}

export type OutcomeSemanticsType =
  | "INITIAL_ASSESSMENT_PENDING"
  | "PREPARATION_PLANNED"
  | "EXECUTION_IN_PROGRESS"
  | "ACTION_COMPLETED_PENDING_REVIEW"
  | "USER_REPORTED_POSITIVE_RESULT"
  | "USER_REPORTED_FRICTION"
  | "PIVOT_NEEDED"
  | "OBJECTIVE_VERIFIED_OUTCOME_UNAVAILABLE";

export interface ResearchCitation {
  source: string; // e.g. "Gartner Hype Cycle 2026", "MIT Tech Review", "McKinsey AI Report", "Nature Biotechnology"
  title: string;
  year: number;
  confidenceScore: number; // 1-100
  url?: string;
  type?: "academic_paper" | "patent_trend" | "industry_roadmap" | "tech_report" | "governmental_policy";
  authors?: string;
  doi?: string;
  snippet?: string;
}

export type ScenarioMode = "baseline" | "optimistic" | "dystopian";

export interface PatentInfo {
  patentNumber: string; // e.g. "US10452978B2"
  title: string;
  assignee: string; // e.g. "Google LLC" or "Neuralink Corp"
  yearFiled: number;
  googlePatentsUrl: string;
  abstractSnippet: string;
  patentType?: "verified_patent" | "research_patent" | "patent_application";
  isRealPatent?: boolean;
  evidenceTier?: "VERIFIED_EXTERNAL_RECORD" | "IDENTIFIER_PRESENT" | "URL_ONLY" | "CACHED_RECORD" | "STATIC_DATA" | "MODEL_INFERENCE" | "DEMO_FALLBACK";
}

export type ViewMode =
  | "portal"
  | "timeline"
  | "verdict"
  | "analytics"
  | "comparison"
  | "roadmap"
  | "network"
  | "verification"
  | "job_risk"
  | "geo_map"
  | "butterfly"
  | "persona_chat"
  | "community"
  | "audit"
  | "data_integrity"
  | "spin_wheel"
  | "leaderboard"
  | "futurist_advisor"
  | "agent_scan"
  | "prediction_history"
  | "telegram_feed"
  | "admin";

export interface AuditAssumptionScore {
  name?: string;
  id?: string;
  title?: string;
  score?: number; // 0 - 100
  confidence?: "Yüksek" | "Orta" | "Düşük" | string;
  status?: "verified" | "optimistic" | "speculative" | "anomalous" | string;
  description: string;
  credibilityScore?: number;
  anomalyFlag?: boolean;
  scientificCitation?: string;
}

export interface AlgorithmicAuditReport {
  milestoneYear: number;
  milestoneTitle: string;
  freshnessScore: number;
  lastScannedDate: string;
  sourceCredibilityIndex: number;
  sourceCount: number;
  overallAssumptionScore: number;
  hasAnomaly: boolean;
  anomalyRiskLevel: "Düşük" | "Orta" | "Yüksek" | "Kritik";
  anomalyWarningMessage?: string;
  assumptions: AuditAssumptionScore[];
  verificationSources: { name: string; type: string; reliability: number }[];
  algorithmicVerdict: string;
}

export interface PersonaChatMessage {
  id: string;
  sender: "user" | "persona";
  text: string;
  timestamp: string;
}

export interface CommunityMilestone {
  id: string;
  year: number;
  title: string;
  description: string;
  category: CategoryType;
  submittedBy: string;
  submittedAt: string;
  votesCount: number;
  aiModerationStatus: "approved" | "pending" | "flagged";
  suggestedProbability: number;
  sourceUrl?: string;
  sourceTitle?: string;
  sourceTier?: "TIER_1_ACADEMIC" | "TIER_2_CORP_RND" | "TIER_3_REPUTABLE_NEWS" | "TIER_4_GENERAL";
  sourceTierLabel?: string;
  sourceTrustScore?: number;
  trlLevel?: number;
  trlLabel?: string;
  breakthroughImpact?: string;
  aiPeerReviewCritique?: string;
  thermodynamicConsistencyScore?: number;
  isPeerReviewed?: boolean;
}

export interface UserAccountProfile {
  id: string;
  username: string;
  email: string;
  avatarUrl: string;
  profession: string;
  titleBadge: string;
  accuracyScore: number;
  predictionsCount: number;
  joinedDate: string;
  savedRoadmaps: number;
}


export interface VerificationVote {
  milestoneYear: number;
  status: "realized" | "partially_realized" | "not_realized";
  timestamp: string;
}

export interface JobRiskAnalysisResult {
  profession: string;
  seniorityLevel?: string;
  industrySector?: string;
  personalGoal?: string;
  scenarioMode?: string;
  scenarioDesc?: string;
  overallRiskLevel: "Düşük / Low" | "Orta / Medium" | "Yüksek / High" | "Kritik / Critical";
  peakRiskYear: number;
  automationPercentage: number;
  humanAugmentationPercentage: number;
  yearlyRiskTrend: { year: number; riskScore: number; note: string }[];
  keyAdaptationSkills: string[];
  summary: string;
  // Deep personalized fields
  personalizedVerdict?: string;
  obsoleteTasks?: string[];
  highValueHumanTasks?: string[];
  strategicPhases?: {
    phaseName: string;
    years: string;
    focus: string;
    actions: string[];
  }[];
  recommendedToolsAndFrameworks?: string[];
  marketValueImpact?: string;
  employmentStatus?: string;
  targetOpportunities?: string[];
  quickWinSkills?: string[];
}

export interface UserPredictionVote {
  year: number; // target milestone official year
  predictedYear: number; // user's vote year
  comment?: string;
  votedAt: string;
}

export interface UserRoadmapProfile {
  age: number;
  profession: string;
  selectedCategories: CategoryType[];
  goals: string;
  riskTolerance?: "low" | "balanced" | "high";
  customSelectedMilestoneYears?: number[];
  selectionMode?: "auto" | "manual";
}

export interface PersonalizedMilestoneAdvice {
  year: number;
  userAgeAtMilestone: number;
  relevanceScore: number; // 1-100
  careerAdvice: string;
  lifeImpact: string;
  keyOpportunity: string;
}

export type LanguageCode = "tr" | "en" | "es" | "de" | "fr" | "zh" | "ja";

export interface LanguageOption {
  code: LanguageCode;
  name: string;
  nativeName: string;
  flag: string;
}

export interface ScientificSourceItem {
  title?: string;
  url?: string;
  snippet?: string;
  sourceOrg?: string;
  publishedDate?: string;
}

export type InformationSourceType =
  | "MANUAL"
  | "TELEGRAM"
  | "ACADEMIC"
  | "PUBLIC_WEB"
  | "USER_SUBMISSION"
  | "OTHER"
  | "telegram_bot"
  | "academic_openalex"
  | "scraped"
  | "manual";

export type DataOriginType =
  | "EXTERNAL_SOURCE"
  | "MANUAL_ENTRY"
  | "MODEL_DERIVED";

export type ProcessingStatusType =
  | "RAW"
  | "CLASSIFIED"
  | "AI_ANALYZED"
  | "TIMELINE_MATCHED";

export interface TelegramFeedItem {
  id: string;
  telegramMessageId: number | string;
  channelName?: string;
  channelUsername?: string;
  channelId?: string | number;
  channelTitle?: string;
  sourceUrl?: string;
  impactVerdict?: string;
  sourceType: InformationSourceType;
  dataOrigin?: DataOriginType;
  processingStatus?: ProcessingStatusType;
  sourceCapturedAt?: string;
  analyzedAt?: string;
  author?: string;
  originalText: string;
  receivedAt: string;
  extractedYear?: number;
  category?: CategoryType | string;
  title?: string;
  summary?: string;
  trlLevel?: number;
  status?: string;
  aiAnalysisNotes?: string;
  deepAnalysisReport?: any;
  customNotes?: string;
  academicProof?: {
    doi?: string;
    primaryAuthor?: string;
    year?: number;
    title?: string;
    citationCount?: number;
    field?: string;
  };
  sources?: ScientificSourceItem[];
  confidenceScore?: number;
  isIntegrated?: boolean;
  matchedMilestoneYear?: number;
  matchedMilestoneTitle?: string;
  matchConfidence?: number;
}

export type SupportCategory =
  | "ban_appeal"
  | "credit_issue"
  | "account_issue"
  | "login_issue"
  | "bug_report"
  | "feature_request"
  | "privacy"
  | "other";

export type TicketStatus = "open" | "in_review" | "resolved" | "closed";

export interface SupportTicket {
  id: string;
  userId?: string;
  userEmail: string;
  userName?: string;
  userPhone?: string;
  category: SupportCategory;
  categoryTitle?: string;
  subject: string;
  description: string;
  banReasonSnapshot?: string;
  status: TicketStatus;
  priority: "low" | "medium" | "high" | "urgent";
  createdAt: string;
  updatedAt: string;
  adminReply?: string;
  adminRepliedAt?: string;
  adminRepliedBy?: string;
  resolvedAt?: string;
}

