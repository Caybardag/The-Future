import { Milestone, TelegramFeedItem } from "../types";
import { UserProfile } from "../components/UserAuthModal";
import { safeStorage } from "./safeStorage";
import { PredictionHistoryRecord } from "./predictionHistory";

export interface MilestonePersonalImpact {
  relevanceScore: number;
  relevanceLevel: "high" | "medium" | "low";
  userAgeAtMilestone: number;
  isProfilePending: boolean;
  careerImpactSummary: string;
  preparationAdvice: string;
  matchingRoadmapStep: { targetYear: number; action: string } | null;
  matchingJobRiskContext: any | null;
  riskSummary: string;
  opportunitySummary?: string;
  relevanceReason?: string;
}

export interface LiveIntelligenceSignal extends Partial<TelegramFeedItem> {
  id: string;
  telegramMessageId?: number | string;
  title?: string;
  summary?: string;
  originalText?: string;
  extractedYear?: number;
  category?: string;
  trlLevel?: number;
  confidenceScore?: number;
  impactVerdict?: string;
  channelTitle?: string;
  sourceChannel?: string;
  sourceOrg?: string;
  receivedAt?: string;
  publishedAt?: string;
  timestamp?: string | number;
  sources?: any[];
}

export interface TelegramSignalPersonalImpact {
  relevanceScore: number;
  relevanceLevel: "high" | "medium" | "low";
  userAgeAtImpact: number;
  isProfilePending: boolean;
  careerImpactSummary: string;
  actionableAdvice: string;
  matchedMilestone: Milestone | null;
  urgencyLevel: "urgent" | "moderate" | "monitoring";
  opportunityOrRisk: "opportunity" | "risk" | "neutral" | "dual";
}

export interface MilestoneActionPlan {
  urgencyBand: "immediate" | "medium_term" | "long_term";
  urgencyTitle: string;
  concreteAction: string;
  actionType: "skill_acquisition" | "strategic_positioning" | "monitoring" | "life_longevity";
  actionTypeLabel?: string;
  preparationHorizon: string;
  reviewCheckpoint?: string;
  recommendationProvenance?: string;
  userDecision: string;
  selectedOptionId: string;
  isExplicitUserChoice: boolean;
  modelRecommendation: string;
  recommendedOption?: string;
  decisionReassessment?: {
    needsReassessment: boolean;
    reassessmentType?: "BOTTLENECK_PRUDENCE" | "OUTCOME_FRICTION_PIVOT" | "SPEED_ACCELERATION_PIVOT" | "UNCERTAINTY_HEDGING";
    currentOptionId?: string;
    recommendedAlternativeOption?: string;
    reason?: string;
    isAcknowledged?: boolean;
  };
  isReassessmentAcknowledged?: boolean;
  impactEffect?: "DECELERATING_BOTTLENECK" | "ACCELERATING" | "UNCERTAINTY_CHANGE" | "NONE";
  hasLiveBreakthroughAcceleration?: boolean;
  dynamicHorizonShiftYears?: number;
  liveSignalCount?: number;
  liveSignalNotice?: string;
  outcomeStage?: "completed_unreviewed" | "completed_user_reported" | "friction_pivot_needed" | "in_progress" | "planned";
  outcomeSemantics?: "ACTION_COMPLETED_PENDING_REVIEW" | "USER_REPORTED_POSITIVE_RESULT" | "PIVOT_NEEDED" | "ACTION_PLANNED";
  realWorldOutcomeStatus?: "not_reported" | "user_reported_positive" | "in_progress";
  outcomeVerificationEvidence?: "NOT_COMPUTED" | "USER_REPORTED_SIGNAL";
  outcomeFollowUpAdvice?: string;
  timelinePhaseText?: string;
  risk?: any;
  expectedValue?: any;
  forWhom?: any;
  isProfilePending?: boolean;
  timeCost?: any;
  decisionOptions?: any[];
  userReflectionNote?: string;
  employmentContext?: any;
  actionStatus?: string;
  acceleratedHorizonShiftYears?: number;
  relevantLiveSignals?: any[];
}

export function getDomainContextualDecisionOptions(milestone?: any, profile?: any): any[] {
  return [
    { id: "opt_primary", label: "Birincil Eksen Adaptasyonu", description: "Mevcut yetkinlikleri güncelleme", expectedValue: 85, timeCost: "orta" },
    { id: "opt_pivot", label: "Stratejik Pivot", description: "Alternatif teknoloji alanına geçiş", expectedValue: 78, timeCost: "yüksek" },
  ];
}

export function calculateMilestonePersonalImpact(
  milestone: Milestone,
  userProfile?: UserProfile | null,
  roadmapRecord?: PredictionHistoryRecord | null,
  jobRiskRecord?: PredictionHistoryRecord | null
): MilestonePersonalImpact {
  const isProfilePending = !userProfile || !userProfile.profession;
  const birthYear = userProfile?.age ? 2026 - userProfile.age : 1995;
  const userAgeAtMilestone = Math.max(0, milestone.year - birthYear);

  const prof = (userProfile?.profession || "").toLowerCase();
  const cat = (milestone.category || "").toLowerCase();

  let relevanceLevel: "high" | "medium" | "low" = "medium";
  let relevanceScore = 60;

  if (isProfilePending) {
    return {
      relevanceScore: 40,
      relevanceLevel: "medium",
      userAgeAtMilestone,
      isProfilePending: true,
      careerImpactSummary: "Profilinizde meslek belirtildiğinde bu dönüm noktasının kariyerinize kişiselleştirilmiş etkisi hesaplanacaktır.",
      preparationAdvice: "Profil bilgilerinizi tamamlayarak bu gelişmenin mesleğinizi nasıl dönüştüreceğini görün.",
      matchingRoadmapStep: null,
      matchingJobRiskContext: null,
      riskSummary: "Genel teknolojik etki alanı",
      opportunitySummary: "Profilinizi tamamlayarak kariyerinize özel fırsat analizlerini keşfedebilirsiniz.",
      relevanceReason: "Profil tanımlanmadığı için küresel teknoloji trendlerine göre genel etki değerlendirilmektedir.",
    };
  }

  const isTechUser = prof.includes("yazılım") || prof.includes("kod") || prof.includes("software") || prof.includes("developer") || prof.includes("mühendis");
  const isMedUser = prof.includes("tıp") || prof.includes("doktor") || prof.includes("doctor") || prof.includes("kardiyoloji") || prof.includes("hekim") || prof.includes("sağlık");
  const isStudent = prof.includes("student") || prof.includes("öğrenci") || userProfile?.lifeRole === "ogrenci";
  const isManager = prof.includes("manager") || prof.includes("yönetici") || userProfile?.seniority === "Manager";
  const isTransition = userProfile?.primaryGoal === "career_transition" || Boolean(userProfile?.personalGoal && userProfile.personalGoal.includes("geçiş"));

  let careerImpactSummary = `${userProfile.profession} kariyeriniz bu dönüm noktasından doğrudan etkilenecektir.`;
  let opportunitySummary = "Bu alandaki teknolojik sıçramalar mesleğinizde yeni yetkinlik pencereleri açar.";
  let riskSummary = `${milestone.category} alanında yapısal değişim`;
  const relevanceReason = `${userProfile.profession} kariyeriniz ile ${milestone.title} (${milestone.category}) arasındaki sektörel ve teknolojik kesişim.`;

  if (isStudent) {
    relevanceLevel = "high";
    relevanceScore = 75;
    careerImpactSummary = "Bu teknoloji eğitim ve kariyer başlangıcınızda size benzersiz bir sıçrama alanı sağlar.";
    opportunitySummary = "Açık kaynak projeler ve yeni teknolojilerle güçlü bir portfolyo oluşturma fırsatı.";
  } else if (isTransition) {
    relevanceLevel = "high";
    relevanceScore = 80;
    careerImpactSummary = "Mevcut uzmanlığınızı yeni nesil teknolojiyle birleştirerek kariyer geçiş sürecinizi hızlandırabilirsiniz.";
    opportunitySummary = "Geçmiş tecrübelerinizden aktarılabilir becerileri yeni teknoloji alanlarına taşıma fırsatı.";
  } else if (isManager) {
    relevanceLevel = "high";
    relevanceScore = 85;
    careerImpactSummary = "Gelişmiş teknolojilerin ve otonom ekiplerin orkestrasyonuna liderlik ederek organizasyonel dönüşümü yönetebilirsiniz.";
    opportunitySummary = "Ekipleri geleceğin araçlarıyla donatma ve yönetişim standartlarını belirleme fırsatı.";
  } else if (isTechUser && (cat.includes("yapay zeka") || cat.includes("kuantum") || cat.includes("bilişim"))) {
    relevanceLevel = "high";
    relevanceScore = 88;
    opportunitySummary = "Yapay zeka araçlarıyla mimari ve kodlama yetkinliklerinizi birleştirerek alanınızda süper-uzman konumuna erişebilirsiniz.";
  } else if (isMedUser && (cat.includes("biyoloji") || cat.includes("tıp") || cat.includes("genetik"))) {
    relevanceLevel = "high";
    relevanceScore = 92;
    opportunitySummary = "Biyoteknoloji ve genetik teşhis alanında süper-uzman hekim konumuna erişme fırsatı sunar.";
    riskSummary = "Rutin veri analizinde otomasyon, ancak klinik hekim teşhis yetkisi ve uzmanlığı korunur.";
  } else if (isTechUser && (cat.includes("biyoloji") || cat.includes("tıp"))) {
    relevanceLevel = "medium";
    relevanceScore = 55;
  } else if (isMedUser && (cat.includes("yapay zeka") || cat.includes("bilişim"))) {
    relevanceLevel = "medium";
    relevanceScore = 62;
  }

  const matchesRoadmapYear = Boolean(
    roadmapRecord && (
      roadmapRecord.targetYear === milestone.year ||
      (typeof roadmapRecord.generatedOutcome === "string" && roadmapRecord.generatedOutcome.includes(String(milestone.year))) ||
      (typeof roadmapRecord.summarySnippet === "string" && roadmapRecord.summarySnippet.includes(String(milestone.year)))
    )
  );

  const matchingRoadmapStep = matchesRoadmapYear
    ? { targetYear: milestone.year, action: `Kişisel yol haritanız ile bağlantılı adım: ${roadmapRecord.queryTitle || milestone.title}` }
    : null;

  return {
    relevanceScore,
    relevanceLevel,
    userAgeAtMilestone,
    isProfilePending: false,
    careerImpactSummary,
    preparationAdvice: `${milestone.title} eşiğine hazırlanmak için yetkinliklerinizi güncelleyin.`,
    matchingRoadmapStep,
    matchingJobRiskContext: jobRiskRecord || null,
    riskSummary,
    opportunitySummary,
    relevanceReason,
  };
}

export function getPersonalizedTimelineMilestones(
  milestones: Milestone[],
  userProfile?: UserProfile | null
): { milestone: Milestone; impact: MilestonePersonalImpact }[] {
  return milestones.map((m) => ({
    milestone: m,
    impact: calculateMilestonePersonalImpact(m, userProfile),
  }));
}

export function calculateTelegramSignalPersonalImpact(
  signal: LiveIntelligenceSignal,
  userProfile?: UserProfile | null,
  roadmapRecord?: any,
  jobRiskRecord?: any,
  timelineData?: Milestone[]
): TelegramSignalPersonalImpact {
  if (!userProfile || !userProfile.profession) {
    return {
      relevanceScore: 0,
      relevanceLevel: "low",
      userAgeAtImpact: 28,
      isProfilePending: true,
      careerImpactSummary: "Profil bekleniyor",
      actionableAdvice: "Profil bilgilerinizi tamamlayarak bu sinyalin mesleğinize etkisini keşfedin.",
      matchedMilestone: null,
      urgencyLevel: "monitoring",
      opportunityOrRisk: "neutral",
    };
  }

  const birthYear = userProfile?.age ? 2026 - userProfile.age : 1995;
  const signalYear = signal.extractedYear || 2026;
  const userAgeAtImpact = Math.max(0, signalYear - birthYear);

  const prof = (userProfile.profession || "").toLowerCase();
  const text = ((signal.title || "") + " " + (signal.originalText || "") + " " + (signal.category || "")).toLowerCase();

  const isTechUser = prof.includes("yazılım") || prof.includes("software") || prof.includes("geliştirici");
  const isMedUser = prof.includes("tıp") || prof.includes("doktor") || prof.includes("kardiyoloji");

  let relevanceScore = 50;
  let relevanceLevel: "high" | "medium" | "low" = "medium";

  if (isTechUser && (text.includes("yazılım") || text.includes("kodlama") || text.includes("yapay zeka"))) {
    relevanceScore = 85;
    relevanceLevel = "high";
  } else if (isMedUser && (text.includes("genetik") || text.includes("biyoteknoloji") || text.includes("tıp") || text.includes("tedavi") || text.includes("kardiyoloji"))) {
    relevanceScore = 90;
    relevanceLevel = "high";
  } else {
    relevanceScore = 40;
    relevanceLevel = "low";
  }

  const matched = (timelineData || []).find((m) => m.year === signalYear || m.category === signal.category) || null;

  return {
    relevanceScore,
    relevanceLevel,
    userAgeAtImpact,
    isProfilePending: false,
    careerImpactSummary: `${userProfile.profession} için bu gelişme sektörel dönüşüm yaratabilir ve fırsat pencereleri sunar.`,
    actionableAdvice: "Sektörel adaptasyon adımlarını erkenden planlayın.",
    matchedMilestone: matched,
    urgencyLevel: relevanceScore > 75 ? "urgent" : "monitoring",
    opportunityOrRisk: "opportunity",
  };
}

export function getPersonalizedTelegramSignals(
  signals: LiveIntelligenceSignal[],
  userProfile?: UserProfile | null,
  roadmapRecord?: any,
  jobRiskRecord?: any,
  timelineData?: Milestone[],
  options?: { onlyHighRelevance?: boolean }
): { signal: LiveIntelligenceSignal; impact: TelegramSignalPersonalImpact }[] {
  const evaluated = signals.map((s) => ({
    signal: s,
    impact: calculateTelegramSignalPersonalImpact(s, userProfile, roadmapRecord, jobRiskRecord, timelineData),
  }));

  evaluated.sort((a, b) => b.impact.relevanceScore - a.impact.relevanceScore);

  if (options?.onlyHighRelevance) {
    return evaluated.filter((e) => e.impact.relevanceLevel === "high" || e.impact.relevanceLevel === "medium");
  }

  return evaluated;
}

export type ActionProgressStatus = "seen" | "planned" | "in_progress" | "completed";

export function getMilestoneActionStatus(year: number, userEmail?: string): ActionProgressStatus {
  const key = `action_status_${userEmail || "guest"}_${year}`;
  return (safeStorage.getItem(key) as ActionProgressStatus) || "seen";
}

export function setMilestoneActionStatus(year: number, status: ActionProgressStatus | string, userEmail?: string): void {
  const key = `action_status_${userEmail || "guest"}_${year}`;
  safeStorage.setItem(key, status);
  const allKey = `all_action_statuses_${userEmail || "guest"}`;
  try {
    const raw = safeStorage.getItem(allKey);
    const parsed = raw ? JSON.parse(raw) : {};
    parsed[year] = status;
    safeStorage.setItem(allKey, JSON.stringify(parsed));
  } catch (e) {}
}

export function getAllMilestoneActionStatuses(userEmail?: string): Record<number, string> {
  const allKey = `all_action_statuses_${userEmail || "guest"}`;
  try {
    const raw = safeStorage.getItem(allKey);
    return raw ? JSON.parse(raw) : {};
  } catch (e) {
    return {};
  }
}

export function getAllMilestoneActionNotes(userEmail?: string): Record<number, string> {
  const key = `all_action_notes_${userEmail || "guest"}`;
  try {
    const raw = safeStorage.getItem(key);
    return raw ? JSON.parse(raw) : {};
  } catch (e) {
    return {};
  }
}

export function getMilestoneActionNote(year: number, userEmail?: string): string {
  const notes = getAllMilestoneActionNotes(userEmail);
  return notes[year] || "";
}

export function setMilestoneActionNote(year: number, note: string, userEmail?: string): void {
  const allKey = `all_action_notes_${userEmail || "guest"}`;
  try {
    const raw = safeStorage.getItem(allKey);
    const parsed = raw ? JSON.parse(raw) : {};
    parsed[year] = note;
    safeStorage.setItem(allKey, JSON.stringify(parsed));
  } catch (e) {}
}

export function getMilestoneSelectedOption(year: number, userEmail?: string): string | null {
  const key = `selected_option_${userEmail || "guest"}_${year}`;
  return safeStorage.getItem(key) || null;
}

export function getAllMilestoneSelectedOptions(userEmail?: string): Record<number, string> {
  const allKey = `all_selected_options_${userEmail || "guest"}`;
  try {
    const raw = safeStorage.getItem(allKey);
    return raw ? JSON.parse(raw) : {};
  } catch (e) {
    return {};
  }
}

export function setMilestoneSelectedOption(
  year: number,
  optionId: string,
  userEmail?: string,
  source?: string,
  reason?: string
): void {
  const key = `selected_option_${userEmail || "guest"}_${year}`;
  const previous = safeStorage.getItem(key);
  safeStorage.setItem(key, optionId);

  const allKey = `all_selected_options_${userEmail || "guest"}`;
  try {
    const raw = safeStorage.getItem(allKey);
    const parsed = raw ? JSON.parse(raw) : {};
    parsed[year] = optionId;
    safeStorage.setItem(allKey, JSON.stringify(parsed));
  } catch (e) {}

  const histKey = `decision_history_${userEmail || "guest"}_${year}`;
  try {
    const rawHist = safeStorage.getItem(histKey);
    const parsedHist = rawHist ? JSON.parse(rawHist) : [];
    parsedHist.push({
      selectedOptionId: optionId,
      previousOptionId: previous || null,
      source: source || "user_manual_selection",
      reason: reason || null,
      timestamp: new Date().toISOString(),
    });
    safeStorage.setItem(histKey, JSON.stringify(parsedHist));
  } catch (e) {}
}

export function getMilestoneDecisionHistory(year: number, userEmail?: string): any[] {
  const key = `decision_history_${userEmail || "guest"}_${year}`;
  try {
    const raw = safeStorage.getItem(key);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    return [];
  }
}

export function getMilestoneReassessmentAcknowledged(year: number, userEmail?: string): boolean {
  const key = `reassessment_ack_${userEmail || "guest"}_${year}`;
  return safeStorage.getItem(key) === "true";
}

export function getAllMilestoneReassessmentAcknowledged(userEmail?: string): Record<number, boolean> {
  const allKey = `all_reassessment_ack_${userEmail || "guest"}`;
  try {
    const raw = safeStorage.getItem(allKey);
    return raw ? JSON.parse(raw) : {};
  } catch (e) {
    return {};
  }
}

export function setMilestoneReassessmentAcknowledged(year: number, ack: boolean, userEmail?: string): void {
  const key = `reassessment_ack_${userEmail || "guest"}_${year}`;
  safeStorage.setItem(key, ack ? "true" : "false");
  const allKey = `all_reassessment_ack_${userEmail || "guest"}`;
  try {
    const raw = safeStorage.getItem(allKey);
    const parsed = raw ? JSON.parse(raw) : {};
    parsed[year] = ack;
    safeStorage.setItem(allKey, JSON.stringify(parsed));
  } catch (e) {}
}

export function calculateDynamicImpactAssessment(milestone: Milestone, signals?: any) {
  const prob = milestone.probability || 70;
  const impact = milestone.impactLevel || 80;
  const auto = milestone.aiAutonomyIndex || 75;
  const overall = Math.round((prob + impact + auto) / 3);

  return {
    epistemicStatus: "MODEL_PROJECTION_NOT_FACT",
    disclaimer: "MODEL PROJECTION ≠ FACT: Bu değerlendirme kesin bir gelecek garantisi değil, olasılıksal bir model projeksiyonudur.",
    readinessDimensions: {
      infrastructureReadiness: Math.min(100, Math.max(10, prob)),
      regulatoryReadiness: Math.min(100, Math.max(10, Math.round(impact * 0.8))),
      commercialReadiness: Math.min(100, Math.max(10, Math.round(auto * 0.9))),
      overallReadinessScore: overall,
    },
    ...calculateMilestonePersonalImpact(milestone, null),
  };
}

export function deriveRoadmapMetrics(milestones: Milestone[], userProfile?: UserProfile | null, userAge?: number) {
  const statuses = getAllMilestoneActionStatuses(userProfile?.email);
  const completed = Object.values(statuses).filter((s) => s === "completed").length;
  const planned = Object.values(statuses).filter((s) => s === "planned" || s === "in_progress").length;

  const validMilestones = milestones && milestones.length > 0 ? milestones : [];
  const avgProb = validMilestones.length > 0
    ? Math.round(validMilestones.reduce((acc, m) => acc + (m.probability || 60), 0) / validMilestones.length)
    : 75;
  const avgImpact = validMilestones.length > 0
    ? Math.round(validMilestones.reduce((acc, m) => acc + (m.impactLevel || 70), 0) / validMilestones.length)
    : 80;

  const prof = (userProfile?.profession || "").toLowerCase();
  let feasibilityScore = avgProb;
  if (prof.includes("yazılım") || prof.includes("stajyer")) {
    feasibilityScore = Math.min(98, Math.max(25, avgProb + 4));
  } else if (prof.includes("hekim") || prof.includes("doktor") || prof.includes("emekli")) {
    feasibilityScore = Math.min(98, Math.max(25, avgProb - 3));
  }

  let riskLevel: "Düşük" | "Orta" | "Yüksek" | "Kritik" = "Orta";
  if (avgImpact >= 85) riskLevel = "Yüksek";
  else if (avgImpact <= 60) riskLevel = "Düşük";

  return {
    feasibilityScore,
    impactLevel: avgImpact,
    riskLevel,
    sentiment: avgProb > 75 ? "optimistic" : "transformative",
    completedCount: completed,
    plannedCount: planned,
    totalMilestones: validMilestones.length,
  };
}

export function deriveMilestoneActionPlan(
  milestone: Milestone,
  impact?: any,
  userProfile?: UserProfile | null,
  selectedOptionId?: string | null,
  actionStatus?: string | null,
  frictionNote?: string | null,
  signals?: any[]
): MilestoneActionPlan {
  const year = milestone.year;
  const email = userProfile?.email;

  const explicitChoice = selectedOptionId !== undefined && selectedOptionId !== null
    ? selectedOptionId
    : getMilestoneSelectedOption(year, email);

  const isExplicitUserChoice = Boolean(explicitChoice);
  const userDecision = isExplicitUserChoice ? explicitChoice! : null;
  const modelRecommendation = "A";
  const effectiveSelectedOption = isExplicitUserChoice ? explicitChoice! : modelRecommendation;

  const isNearTerm = year <= 2029;
  const isFarTerm = year >= 2045;

  let urgencyBand: "immediate" | "medium_term" | "long_term" = "medium_term";
  let urgencyTitle = "Orta Vadeli Planlama";
  let preparationHorizon = "2-5 Yıllık Ufuk";

  if (isNearTerm) {
    urgencyBand = "immediate";
    urgencyTitle = "Şimdi Hazırlan (2026-2029)";
    preparationHorizon = "Acil Eylem Penceresi: İlk 18-24 Ay";
  } else if (isFarTerm) {
    urgencyBand = "long_term";
    urgencyTitle = "2045+ Uzun Vadeli Vizyon";
    preparationHorizon = "Derin Gelecek Ufku";
  }

  // 1. Process Live Signals (Adversarial Robustness, Deduplication & Guardrails)
  const rawSignals = Array.isArray(signals) ? signals : [];
  const validSignals: any[] = [];
  const seenIds = new Set<string>();

  for (const s of rawSignals) {
    if (!s) continue;
    const sId = s.id || JSON.stringify(s);
    if (seenIds.has(sId)) continue;

    const conf = s.confidenceWeight !== undefined ? s.confidenceWeight : (s.matchConfidence !== undefined ? s.matchConfidence : 70);
    if (conf < 40 || s.impactVerdict === "IRRELEVANT_NOISE") continue; // Noise signal ignored

    const sYear = s.extractedYear || s.matchedMilestoneYear;
    const cat = (s.category || "").toLowerCase();
    const mCat = (milestone.category || "").toLowerCase();
    const isDirectlyMatched = s.matchedMilestoneYear === milestone.year;
    const catMatch = isDirectlyMatched || !s.category || cat.includes(mCat) || mCat.includes(cat) || 
      (cat.includes("yapay zeka") && mCat.includes("yapay zeka")) ||
      (cat.includes("kuantum") && mCat.includes("kuantum")) ||
      (cat.includes("biyoloji") && mCat.includes("biyoloji"));

    // Guard against unrelated category or far years (>3 years away unless matching milestone)
    const isMatched = isDirectlyMatched || (sYear && Math.abs(sYear - milestone.year) <= 2);

    if (isMatched && catMatch) {
      seenIds.add(sId);
      validSignals.push(s);
    }
  }

  let impactEffect: "DECELERATING_BOTTLENECK" | "ACCELERATING" | "UNCERTAINTY_CHANGE" | "NONE" = "NONE";
  let hasLiveBreakthroughAcceleration = false;
  let dynamicHorizonShiftYears = 0;
  let liveSignalNotice: string | undefined = undefined;
  const liveSignalCount = validSignals.length;

  let hasBottleneckSignal = false;
  let hasAcceleratingSignal = false;

  for (const s of validSignals) {
    const text = `${s.title || ""} ${s.summary || ""} ${s.impactVerdict || ""}`.toLowerCase();
    const isBot =
      s.impactVerdict === "DECELERATING_BOTTLENECK" ||
      text.includes("moratoryum") ||
      text.includes("regülasyon") ||
      text.includes("kısıt") ||
      text.includes("darboğaz") ||
      text.includes("çip kıtlığı") ||
      text.includes("kıtlık") ||
      text.includes("ertelendi") ||
      text.includes("iptal") ||
      text.includes("maliyet artışı") ||
      text.includes("soruşturma");

    const isAcc =
      s.impactVerdict === "ACCELERATING" ||
      s.impactVerdict === "HIGH_BREAKTHROUGH" ||
      text.includes("hızlanma") ||
      text.includes("breakthrough") ||
      text.includes("atılım") ||
      text.includes("seri üretim") ||
      text.includes("çığır açan") ||
      text.includes("devrim") ||
      text.includes("ahead of schedule");

    if (isBot) hasBottleneckSignal = true;
    if (isAcc) hasAcceleratingSignal = true;
  }

  if (hasBottleneckSignal && hasAcceleratingSignal) {
    impactEffect = "UNCERTAINTY_CHANGE";
    hasLiveBreakthroughAcceleration = false;
    dynamicHorizonShiftYears = 0;
    liveSignalNotice = "Çelişkili Canlı Sinyal Uyarısı: Hem atılım hem regülasyon darboğazı sinyali mevcut.";
  } else if (hasBottleneckSignal) {
    impactEffect = "DECELERATING_BOTTLENECK";
    hasLiveBreakthroughAcceleration = false;
    const allText = validSignals.map((s) => `${s.title || ""} ${s.summary || ""}`).join(" ").toLowerCase();
    const isSevere = allText.includes("2 yıl") || allText.includes("iki yıl") || allText.includes("çip kıtlığı") || allText.includes("çöküş");
    dynamicHorizonShiftYears = isSevere ? 2 : 1;
    liveSignalNotice = `Darboğaz & Regülasyon Kısıtı: ${validSignals[0].title}${dynamicHorizonShiftYears > 1 ? ` (+${dynamicHorizonShiftYears} yıl gecikme)` : ""}`;
  } else if (hasAcceleratingSignal) {
    impactEffect = "ACCELERATING";
    hasLiveBreakthroughAcceleration = true;
    const allText = validSignals.map((s) => `${s.title || ""} ${s.summary || ""}`).join(" ").toLowerCase();
    const isMatureTrl9 = validSignals.some((s) => s.trlLevel === 9) && (allText.includes("seri üretim") || allText.includes("ticarileş") || allText.includes("küresel"));
    dynamicHorizonShiftYears = isMatureTrl9 ? -2 : -1;
    liveSignalNotice = `Hızlanma Sinyali: ${validSignals[0].title}`;
  } else if (validSignals.length > 0) {
    impactEffect = "UNCERTAINTY_CHANGE";
    hasLiveBreakthroughAcceleration = false;
    dynamicHorizonShiftYears = 0;
    liveSignalNotice = `Belirsizlik Sinyali: ${validSignals[0].title}`;
  }

  // 2. Closed-Loop Reassessment Trigger
  const isAck = getMilestoneReassessmentAcknowledged(year, email);
  let decisionReassessment: MilestoneActionPlan["decisionReassessment"] = undefined;

  const note = (frictionNote || "").toLowerCase();
  const isOutcomeFriction = note.includes("verim") || note.includes("tıkan") || note.includes("beklenen") || note.includes("zorluk") || note.includes("engel") || note.includes("fayda");

  if (hasBottleneckSignal && hasAcceleratingSignal) {
    decisionReassessment = {
      needsReassessment: true,
      reassessmentType: "UNCERTAINTY_HEDGING" as any,
      currentOptionId: effectiveSelectedOption,
      recommendedAlternativeOption: "B",
      reason: "Çelişkili sinyaller nedeniyle dengeli ilerleme (B seçeneği) önerilir.",
      isAcknowledged: isAck,
    };
  } else if (effectiveSelectedOption === "C" && impactEffect === "DECELERATING_BOTTLENECK") {
    decisionReassessment = {
      needsReassessment: true,
      reassessmentType: "BOTTLENECK_PRUDENCE",
      currentOptionId: "C",
      recommendedAlternativeOption: "B",
      reason: "Darboğaz nedeniyle yüksek atıl yatırım riski oluştu, B seçeneğine pivot önerilir.",
      isAcknowledged: isAck,
    };
  } else if (isOutcomeFriction) {
    decisionReassessment = {
      needsReassessment: true,
      reassessmentType: "OUTCOME_FRICTION_PIVOT",
      currentOptionId: effectiveSelectedOption,
      recommendedAlternativeOption: "B",
      reason: "Kullanıcı sonucunda tıkanıklık bildirildi, stratejik pivot önerilir.",
      isAcknowledged: isAck,
    };
  }

  // 3. Outcome Semantics Decoupling
  let outcomeStage: any = undefined;
  let outcomeSemantics: any = undefined;
  let realWorldOutcomeStatus: any = undefined;
  let outcomeVerificationEvidence: any = undefined;
  let outcomeFollowUpAdvice: any = undefined;

  const isPivotFriction = note.includes("zorluk") || note.includes("engel") || note.includes("gecikme") || note.includes("farklı bir yol") || note.includes("tıkanıklık") || note.includes("darboğaz");

  if (isPivotFriction && actionStatus === "in_progress") {
    outcomeStage = "friction_pivot_needed";
    outcomeSemantics = "PIVOT_NEEDED";
    outcomeFollowUpAdvice = "Kullanıcı bildiriminde darboğaz veya tıkanıklık tespit edildi. Yeni bir stratejik eksene pivot önerilir.";
  } else if (actionStatus === "completed") {
    const isPositive = note.includes("başarı") || note.includes("tamamladık") || note.includes("verimli");

    if (isPositive) {
      outcomeStage = "completed_unreviewed";
      realWorldOutcomeStatus = "user_reported_positive";
      outcomeSemantics = "USER_REPORTED_POSITIVE_RESULT";
      outcomeVerificationEvidence = "USER_REPORTED_SIGNAL";
      outcomeFollowUpAdvice = "Kullanıcı beyanına göre olumlu sonuç kaydedildi. Objektif harici sonuç ve yetkinlik çıktısı bağımsız bir süreçtir (NOT_COMPUTED).";
    } else {
      outcomeStage = "completed_unreviewed";
      realWorldOutcomeStatus = "not_reported";
      outcomeSemantics = "ACTION_COMPLETED_PENDING_REVIEW";
      outcomeVerificationEvidence = "NOT_COMPUTED";
      outcomeFollowUpAdvice = "Eylemi tamamlandı olarak işaretlediniz. Sonuç henüz değerlendirilmedi.";
    }
  }

  const prof = (userProfile?.profession || "").toLowerCase();
  const cat = (milestone.category || "").toLowerCase();
  const isProfileIncomplete = !userProfile || !userProfile.profession || (impact && impact.isProfilePending);
  const isSenior = Boolean(userProfile?.age && userProfile.age >= 60);
  const isStudent = Boolean(prof.includes("student") || prof.includes("öğrenci") || userProfile?.lifeRole === "ogrenci");
  const isTransition = Boolean(userProfile?.primaryGoal === "career_transition" || (userProfile?.personalGoal && userProfile.personalGoal.includes("geçiş")));
  const isManager = Boolean(prof.includes("manager") || prof.includes("yönetici") || userProfile?.seniority === "Manager");
  const isDoctor = Boolean(prof.includes("doktor") || prof.includes("doctor") || prof.includes("hekim"));
  const isTechUser = Boolean(prof.includes("yazılım") || prof.includes("kod") || prof.includes("software") || prof.includes("developer") || prof.includes("mühendis"));

  let actionType: "skill_acquisition" | "strategic_positioning" | "monitoring" | "life_longevity" = "skill_acquisition";
  let actionTypeLabel = "Yetenek Geliştirme ve Stratejik Konumlanma";
  let concreteAction = `${milestone.title} için otonom yetkinlikler edinin ve stratejinizi kurgulayın.`;
  let recommendationProvenance = "model_profile_derived";

  if (isProfileIncomplete) {
    recommendationProvenance = "deterministic_projection";
    actionTypeLabel = "Genel Teknoloji Takibi";
    concreteAction = "Profil bilgilerinizi tamamlayarak bu gelişmeye dair kişiselleştirilmiş eylem planınızı oluşturun.";
  } else if (isSenior) {
    actionTypeLabel = "Stratejik Danışmanlık ve Bilgi Aktarımı";
    concreteAction = "Deneyiminizi genç nesillere aktaracak mentorluk ve danışmanlık mekanizmaları kurarak sektörde kalıcı etki bırakın.";
  } else if (isStudent) {
    actionTypeLabel = "Öğrenme & Portfolyo Keşfi";
    concreteAction = "İlgili açık kaynak araçları ve projeleri öğrenim sürecinize dahil ederek ilk adımı atın.";
  } else if (isTransition) {
    actionTypeLabel = "Kariyer Geçişi & Yetkinlik Köprüsü";
    concreteAction = "Mevcut alanınızdaki aktarılabilir yetkinlikler üzerine veri ve yapay zeka odaklı yeni beceriler inşa edin.";
  } else if (isManager) {
    actionTypeLabel = "Stratejik Yönetişim & Orkestrasyon";
    concreteAction = "Teknoloji yönetişim çerçevesi oluşturarak otonom sistemleri ekip iş akışlarınıza güvenle entegre edin.";
  } else if (isDoctor) {
    if (cat.includes("biyoloji") || cat.includes("tıp")) {
      actionType = "life_longevity";
    } else {
      actionType = "strategic_positioning";
    }
    actionTypeLabel = "Biyo-Yaşam ve Klinik Protokol Takibi";
    concreteAction = `${userProfile.profession || "Hekimlik"} kapsamında yeni nesil klinik teşhis ve biyoteknolojik tedavi protokollerini uzmanlığınıza uyarlayın.`;
  } else if (isTechUser) {
    actionTypeLabel = "Yetenek Geliştirme ve Stratejik Konumlanma";
    concreteAction = `${userProfile.profession} olarak ${milestone.title} teknolojilerini mimarinize entegre edin ve otonom araçlarla üretkenliğinizi katlayın.`;
  }

  let reviewCheckpoint = "Sonraki Kontrol: 12 Ay Sonra Stratejik İnceleme";
  if (year <= 2029) {
    reviewCheckpoint = "Sonraki Kontrol: 6 Ay Sonra Stratejik İnceleme";
  } else if (year <= 2035) {
    reviewCheckpoint = "Sonraki Kontrol: 12 Ay Sonra Stratejik İnceleme";
  } else if (year <= 2045) {
    reviewCheckpoint = "Sonraki Kontrol: 2-3 Yılda Bir Stratejik İnceleme";
  } else {
    reviewCheckpoint = "Sonraki Kontrol: 5 Yılda Bir Stratejik İnceleme";
  }

  return {
    urgencyBand,
    urgencyTitle,
    concreteAction,
    actionType,
    actionTypeLabel,
    preparationHorizon,
    reviewCheckpoint,
    recommendationProvenance,
    userDecision: userDecision as any,
    selectedOptionId: effectiveSelectedOption,
    recommendedOption: modelRecommendation,
    isExplicitUserChoice,
    modelRecommendation,
    decisionReassessment,
    isReassessmentAcknowledged: isAck,
    impactEffect,
    hasLiveBreakthroughAcceleration,
    dynamicHorizonShiftYears,
    liveSignalCount,
    liveSignalNotice,
    outcomeStage,
    outcomeSemantics,
    realWorldOutcomeStatus,
    outcomeVerificationEvidence,
    outcomeFollowUpAdvice,
  };
}
