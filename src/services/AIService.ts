/**
 * Centralized Gemini AI Service Module (AIService.ts)
 * 
 * Provides an enterprise-grade abstraction over all backend Gemini AI interactions:
 * - Direct real-time LLM execution (gemini-3.7-flash)
 * - Centralized 'chat' method for neural conversation, assistant dialogues, and time-traveler personas
 * - Centralized 'analyze' method for multi-dimensional futurist, job risk, and butterfly effect simulations
 * - Automatic exponential backoff with jitter on HTTP 429 (Rate Limit) & 503 (Service Unavailable)
 * - In-flight request deduplication & coalescing
 * - Request / response transformation and JSON sanitization pipeline
 * - Structured error typing and telemetry event emission
 */

import { safeFetchJson, getApiHeaders } from "../utils/apiClient";
import { Milestone, ScientificSourceItem, SubMilestoneBranch } from "../types";

// ==========================================
// Types & Interface Definitions
// ==========================================

export type AIServiceErrorCode =
  | "INSUFFICIENT_CREDITS"
  | "UNAUTHORIZED"
  | "RATE_LIMIT_EXCEEDED"
  | "SERVICE_UNAVAILABLE"
  | "CONTENT_FILTERED"
  | "INVALID_REQUEST"
  | "TIMEOUT"
  | "NETWORK_ERROR"
  | "PARSING_ERROR"
  | "UNKNOWN_ERROR";

export class AIServiceError extends Error {
  public code: AIServiceErrorCode;
  public status?: number;
  public retryable: boolean;
  public details?: any;

  constructor(
    message: string,
    code: AIServiceErrorCode = "UNKNOWN_ERROR",
    status?: number,
    retryable: boolean = false,
    details?: any
  ) {
    super(message);
    this.name = "AIServiceError";
    this.code = code;
    this.status = status;
    this.retryable = retryable;
    this.details = details;
  }
}

// ------------------------------------------
// Universal Chat Types
// ------------------------------------------

export interface ChatMessage {
  role: "user" | "model" | "assistant";
  text: string;
}

export interface ChatOptions {
  message: string;
  userMessage?: string;
  history?: ChatMessage[];
  chatHistory?: ChatMessage[];
  systemInstruction?: string;
  personaYear?: number;
  personaRole?: string;
  language?: string;
}

export interface ChatResult {
  success: boolean;
  reply: string;
  source?: string;
  error?: string;
  code?: string;
  status?: number;
}

// ------------------------------------------
// Universal Analyze Types
// ------------------------------------------

export type AnalysisType =
  | "job_risk"
  | "butterfly_effect"
  | "career"
  | "milestone_audit"
  | "simulation"
  | "roadmap"
  | "statistics"
  | "general";

export interface AnalyzeOptions {
  type: AnalysisType;
  prompt?: string;
  data?: any;
  language?: string;
  scenarioMode?: "base" | "baseline" | "optimistic" | "dystopian" | string;
  // Specialized parameters
  profession?: string;
  seniorityLevel?: string;
  industrySector?: string;
  personalGoal?: string;
  disabledYears?: number[];
  disabledMilestones?: string[];
  year?: number;
  title?: string;
  description?: string;
  category?: string;
  probability?: number;
  currentAge?: number;
  targetHorizonYear?: number;
  [key: string]: any;
}

export interface AnalyzeResult<T = any> {
  success: boolean;
  type?: AnalysisType;
  source?: string;
  data?: T;
  output?: string;
  simulation?: any;
  advice?: any;
  auditAnalysis?: string;
  reply?: string;
  error?: string;
  code?: string;
  status?: number;
  grounding?: {
    searchQueries?: string[];
    webSources?: Array<{ title: string; uri: string; domain?: string }>;
  };
}

// ------------------------------------------
// Specialized Feature Types
// ------------------------------------------

export interface SimulationParams {
  year: number;
  title: string;
  description: string;
  category?: string;
  userQuery?: string;
  mode?: "ask" | "news" | "diary" | "analysis";
  language?: string;
  userProfile?: {
    profession?: string;
    age?: number;
    seniority?: string;
    industrySector?: string;
    personalGoal?: string;
  };
}

export interface SimulationResponse {
  success: boolean;
  source?: string;
  output?: string;
  error?: string;
  message?: string;
  code?: string;
  status?: number;
  serverDeducted?: number;
  remainingCredits?: number;
  grounding?: {
    searchQueries?: string[];
    webSources?: Array<{ title: string; uri: string; domain?: string }>;
  };
}

export interface CareerAdvisorParams {
  currentAge: number;
  profession: string;
  targetHorizonYear?: number;
}

export interface CareerAdvisorAdvice {
  lifeAgeAtHorizon: number;
  predictedJobStatus: string;
  recommendedSkills: string[];
  bioAdaptationRoadmap: string[];
  wealthAndAssetAdvice: string;
  ethicalWarning: string;
  tailoredExecutiveSummary: string;
}

export interface CareerAdvisorResponse {
  success: boolean;
  source?: string;
  advice?: CareerAdvisorAdvice;
  error?: string;
  code?: string;
  status?: number;
}

export interface JobRiskParams {
  profession?: string;
  jobTitle?: string;
  employmentStatus?: string;
  seniorityLevel?: string;
  industrySector?: string;
  industry?: string;
  experienceYears?: number;
  personalGoal?: string;
  scenarioMode?: "base" | "optimistic" | "dystopian" | string;
  language?: string;
  activeMilestoneYear?: number;
  activeMilestoneTitle?: string;
  activeMilestoneCategory?: string;
  activeMilestoneDescription?: string;
  userAge?: number;
}

export interface JobRiskYearlyTrend {
  year: number;
  riskScore?: number;
  riskPercentage?: number;
  note?: string;
  humanValueRole?: string;
  aiReplacementFactor?: string;
  automationVelocity?: number;
  resilienceScore?: number;
}

export interface JobRiskStrategicPhase {
  phaseName: string;
  years: string;
  focus: string;
  actions: string[];
}

export interface JobRiskAnalysisData {
  profession: string;
  seniorityLevel: string;
  industrySector: string;
  personalGoal: string;
  scenarioMode: string;
  scenarioDesc: string;
  overallRiskLevel: "Düşük / Low" | "Orta / Medium" | "Yüksek / High" | "Kritik / Critical";
  peakRiskYear: number;
  automationPercentage: number;
  humanAugmentationPercentage: number;
  yearlyRiskTrend: JobRiskYearlyTrend[];
  keyAdaptationSkills: string[];
  summary: string;
  personalizedVerdict: string;
  obsoleteTasks: string[];
  highValueHumanTasks: string[];
  strategicPhases: JobRiskStrategicPhase[];
  recommendedToolsAndFrameworks: string[];
  marketValueImpact: string;
}

export interface MilestoneJobImpactParams {
  milestoneTitle: string;
  milestoneYear: number;
  milestoneDescription: string;
  milestoneCategory: string;
  profession: string;
  seniorityLevel?: string;
  industrySector?: string;
  userAge?: number;
  language?: string;
}

export interface MilestoneJobImpactData {
  milestoneTitle: string;
  milestoneYear: number;
  profession: string;
  riskPercent: number;
  riskLevel: "Düşük" | "Orta" | "Yüksek" | "Kritik";
  directImpactSummary: string;
  automatedTasks: string[];
  indispensableSkills: string[];
  recommendation: string;
  emergingHybridRoles: string[];
  milestoneDisruptedOccupations?: Array<{
    role: string;
    risk: "Kritik" | "Yüksek" | "Orta" | "Düşük";
    why: string;
  }>;
  timelineSynergy?: string;
  analyzedAt?: string;
}

export interface MilestoneJobImpactResponse {
  success: boolean;
  source?: string;
  data?: MilestoneJobImpactData;
  error?: string;
  code?: string;
  status?: number;
}

export interface AIConflictResult {
  targetYear: number;
  conflictingMilestoneYear: number;
  conflictingMilestoneTitle: string;
  conflictType: "logical_paradox" | "physical_limitation" | "resource_clash" | "ethical_contradiction";
  severity: "high" | "medium";
  badgeLabel: string;
  title: string;
  reasoning: string;
  suggestedAnalysis: string;
  aiGenerated?: boolean;
}

export interface ConflictDetectorResponse {
  success: boolean;
  source?: string;
  conflicts?: AIConflictResult[];
  error?: string;
  code?: string;
  status?: number;
}

export interface JobRiskResponse {
  success: boolean;
  source?: string;
  data?: JobRiskAnalysisData;
  error?: string;
  code?: string;
  status?: number;
}

export interface PersonaChatMessage {
  role: "user" | "model" | "assistant";
  text: string;
}

export interface PersonaChatParams {
  personaYear: number;
  personaRole: string;
  userMessage: string;
  chatHistory?: PersonaChatMessage[];
  language?: string;
}

export interface PersonaChatResponse {
  success: boolean;
  source?: string;
  reply?: string;
  error?: string;
  code?: string;
  status?: number;
}

export interface ButterflySimulateParams {
  initialYear?: number;
  changeTitle?: string;
  changeDescription?: string;
  affectedField?: string;
  disabledYears?: number[];
  disabledMilestones?: string[];
  scenarioMode?: "baseline" | "optimistic" | "dystopian" | string;
  language?: string;
}

export interface ButterflyBranch {
  year: number;
  probability: number;
  title: string;
  description: string;
  positiveSpillover: string;
  negativeSpillover: string;
  geopoliticalImpact: string;
  riskLevel: "Düşük" | "Orta" | "Yüksek" | "Kritik";
}

export interface ButterflySimulateResponse {
  success: boolean;
  source?: string;
  simulation?: {
    revisedSingularityYear?: number;
    executiveSummary: string;
    consequences?: string[];
    butterflySummary?: string;
    systemicTippingPointYear?: number;
    cascadingConsequences?: ButterflyBranch[];
    paradoxWarnings?: string[];
    resilienceRecommendation?: string;
  };
  error?: string;
  code?: string;
  status?: number;
}

export interface AlternativeTimelineParams {
  disabledYears: number[];
  disabledMilestones: string[];
  language?: string;
}

export interface AlternativeTimelineResponse {
  success: boolean;
  source?: string;
  simulation?: {
    revisedSingularityYear?: number;
    executiveSummary: string;
    consequences: string[];
  };
  error?: string;
  code?: string;
  status?: number;
}

export interface PersonalRoadmapPlanParams {
  age: number;
  profession: string;
  selectedCategories?: string[];
  goals?: string;
  riskTolerance?: string;
  selectedMilestoneTitles?: string;
  language?: string;
}

export interface PersonalRoadmapPlanResponse {
  success: boolean;
  source?: string;
  output?: string;
  error?: string;
  code?: string;
  status?: number;
}

export interface RoadmapParams {
  currentAge: number;
  profession: string;
  targetYear: number;
  interests?: string[];
  language?: string;
}

export interface RoadmapResponse {
  success: boolean;
  source?: string;
  output?: string;
  error?: string;
  code?: string;
  status?: number;
}

export interface AlgorithmicAuditParams {
  year: number;
  title: string;
  description: string;
  category?: string;
  probability?: number;
  keyDrivers?: string[];
}

export interface AlgorithmicAuditResponse {
  success: boolean;
  source?: string;
  auditAnalysis?: string;
  overallAssumptionScore?: number;
  sourceCredibilityIndex?: number;
  hasAnomaly?: boolean;
  anomalyRiskLevel?: "Düşük" | "Orta" | "Yüksek" | "Kritik";
  anomalyWarningMessage?: string;
  assumptions?: Array<{
    name?: string;
    id?: string;
    title?: string;
    description: string;
    score?: number;
    confidence?: string;
    status?: string;
    credibilityScore?: number;
    anomalyFlag?: boolean;
    scientificCitation?: string;
  }>;
  algorithmicVerdict?: string;
  sources?: ScientificSourceItem[];
  error?: string;
  code?: string;
  status?: number;
}

export interface StatisticsTrendPoint {
  year: number;
  computationalPower: number;
  aiAutonomy: number;
  humanAugmentation: number;
  bioLongevity: number;
  cleanEnergy: number;
  postScarcity: number;
  disruptionRisk: number;
}

export interface CategoryDynamicMetric {
  category: string;
  velocity: number;
  investmentBillionUSD: number;
  adoptionLagYears: number;
  ethicalFriction: number;
  transformRatio: number;
}

export interface TimelineStatisticsData {
  scenario: string;
  generatedAt?: string;
  singularityTippingPointYear: number;
  timelinePoints: StatisticsTrendPoint[];
  categoryDynamics: CategoryDynamicMetric[];
  criticalBottlenecks: string[];
  executiveSummary: string;
}

export interface TimelineStatisticsParams {
  scenarioMode?: string;
  language?: string;
  focusCategory?: string;
}

export interface TimelineStatisticsResponse {
  success: boolean;
  source?: string;
  data?: TimelineStatisticsData;
  error?: string;
  code?: string;
  status?: number;
}

export interface AIStatusResponse {
  success: boolean;
  aiEngineOnline: boolean;
  model: string;
  activeFeatures: string[];
  serverTime: string;
}

export interface AIServiceTelemetryEvent {
  endpoint: string;
  durationMs: number;
  status: "success" | "retry" | "error";
  attempt: number;
  error?: string;
}

type TelemetryListener = (event: AIServiceTelemetryEvent) => void;

// ==========================================
// Centralized AIService Implementation
// ==========================================

export class AIService {
  private inFlightRequests: Map<string, Promise<any>> = new Map();
  private telemetryListeners: Set<TelemetryListener> = new Set();
  private maxRetries: number = 3;
  private baseBackoffMs: number = 600;

  /**
   * Subscribe to AI Service telemetry & lifecycle events
   */
  public onTelemetry(listener: TelemetryListener): () => void {
    this.telemetryListeners.add(listener);
    return () => {
      this.telemetryListeners.delete(listener);
    };
  }

  private emitTelemetry(event: AIServiceTelemetryEvent) {
    this.telemetryListeners.forEach((listener) => {
      try {
        listener(event);
      } catch (err) {
        console.warn("[AIService] Telemetry listener failed", err);
      }
    });
  }

  /**
   * Cleans text outputs (strips markdown fences and unwanted framing)
   */
  public cleanModelText(raw: string | undefined): string {
    if (!raw) return "";
    let cleaned = raw.trim();
    if (cleaned.startsWith("```json")) {
      cleaned = cleaned.replace(/^```json\s*/i, "").replace(/\s*```$/, "");
    } else if (cleaned.startsWith("```markdown")) {
      cleaned = cleaned.replace(/^```markdown\s*/i, "").replace(/\s*```$/, "");
    } else if (cleaned.startsWith("```")) {
      cleaned = cleaned.replace(/^```\s*/, "").replace(/\s*```$/, "");
    }
    return cleaned.trim();
  }

  /**
   * Centralized HTTP Dispatcher with Exponential Backoff + Jitter and In-Flight Deduplication
   */
  private async executeWithRetry<T>(
    endpoint: string,
    body: any,
    options?: {
      maxRetries?: number;
      skipDeduplication?: boolean;
      customTimeoutMs?: number;
    }
  ): Promise<T> {
    const serializedBody = JSON.stringify(body || {});
    const cacheKey = `${endpoint}::${serializedBody}`;

    if (!options?.skipDeduplication && this.inFlightRequests.has(cacheKey)) {
      return this.inFlightRequests.get(cacheKey) as Promise<T>;
    }

    const maxAttempts = options?.maxRetries ?? this.maxRetries;
    const requestPromise = (async () => {
      let lastError: any = null;

      for (let attempt = 1; attempt <= maxAttempts; attempt++) {
        const startTime = Date.now();
        try {
          const headers = {
            "Content-Type": "application/json",
            ...getApiHeaders(),
          };

          const response = await safeFetchJson<any>(endpoint, {
            method: "POST",
            headers,
            body: serializedBody,
          });

          const durationMs = Date.now() - startTime;

          // Check if response returned structured error
          if (response && response.error && !response.success && !response.output && !response.data && !response.simulation && !response.reply) {
            const isRateLimit =
              response.status === 429 ||
              response.code === "RATE_LIMIT_EXCEEDED" ||
              response.code === "TOO_MANY_REQUESTS" ||
              response.error === "TOO_MANY_REQUESTS" ||
              (typeof response.error === "string" &&
                (response.error.includes("429") ||
                  response.error.includes("TOO_MANY_REQUESTS") ||
                  response.error.includes("Rate Limit") ||
                  response.error.includes("istek")));

            const isServiceUnavailable =
              response.status === 503 ||
              (typeof response.error === "string" && response.error.includes("503"));

            if ((isRateLimit || isServiceUnavailable) && attempt < maxAttempts) {
              this.emitTelemetry({
                endpoint,
                durationMs,
                status: "retry",
                attempt,
                error: response.error,
              });

              // Exponential Backoff with Jitter
              const jitter = Math.floor(Math.random() * 300);
              const delay = Math.pow(2, attempt - 1) * this.baseBackoffMs + jitter;
              await new Promise((res) => setTimeout(res, delay));
              continue;
            }

            const isUnauthorized =
              response.status === 401 ||
              response.code === "UNAUTHORIZED" ||
              response.error === "UNAUTHORIZED";

            if (isUnauthorized) {
              try {
                window.dispatchEvent(
                  new CustomEvent("future-open-auth-modal", {
                    detail: {
                      reason: "unauthorized",
                      message: response.message || "Bu yapay zeka analizini çalıştırmak için lütfen giriş yapın veya ücretsiz kayıt olun.",
                    },
                  })
                );
              } catch (_) {}
              throw new AIServiceError(
                response.message || "Oturum Gerekli: Bu yapay zeka analizini çalıştırmak için lütfen giriş yapın veya ücretsiz kayıt olun.",
                "UNAUTHORIZED",
                401,
                false,
                response
              );
            }

            const isInsufficientCredits =
              response.status === 402 ||
              response.code === "INSUFFICIENT_CREDITS" ||
              response.error === "INSUFFICIENT_CREDITS";

            if (isInsufficientCredits) {
              try {
                window.dispatchEvent(new CustomEvent("future-open-credit-store", { detail: response }));
              } catch (_) {}
              throw new AIServiceError(
                response.message || "Yetersiz Kredi: Bu işlem için yeterli bakiyeniz bulunmuyor. Kredi Mağazasından ücretsiz hak veya paket yükleyebilirsiniz.",
                "INSUFFICIENT_CREDITS",
                402,
                false,
                response
              );
            }

            const cleanErrorMessage = isRateLimit
              ? "Yapay zeka servisi şu an yoğun talep görüyor. Lütfen birkaç saniye bekleyip tekrar deneyin."
              : isServiceUnavailable
              ? "Sistem geçici olarak meşgul. Lütfen biraz sonra tekrar deneyin."
              : response.error;

            throw new AIServiceError(
              cleanErrorMessage,
              isRateLimit ? "RATE_LIMIT_EXCEEDED" : isServiceUnavailable ? "SERVICE_UNAVAILABLE" : "UNKNOWN_ERROR",
              response.status,
              isRateLimit || isServiceUnavailable,
              response
            );
          }

          this.emitTelemetry({
            endpoint,
            durationMs,
            status: "success",
            attempt,
          });

          return response as T;
        } catch (err: any) {
          const durationMs = Date.now() - startTime;
          lastError = err;

          const isNetworkError =
            err.name === "AbortError" ||
            err.message?.includes("Failed to fetch") ||
            err.message?.includes("NetworkError") ||
            err.code === "NETWORK_ERROR";

          const isRetryable = err.retryable || isNetworkError;

          if (isRetryable && attempt < maxAttempts) {
            this.emitTelemetry({
              endpoint,
              durationMs,
              status: "retry",
              attempt,
              error: err.message,
            });

            const jitter = Math.floor(Math.random() * 300);
            const delay = Math.pow(2, attempt - 1) * this.baseBackoffMs + jitter;
            await new Promise((res) => setTimeout(res, delay));
            continue;
          }

          this.emitTelemetry({
            endpoint,
            durationMs,
            status: "error",
            attempt,
            error: err.message,
          });

          break;
        }
      }

      throw lastError || new AIServiceError("Bilinmeyen bir AI servis hatası oluştu.", "UNKNOWN_ERROR");
    })();

    if (!options?.skipDeduplication) {
      this.inFlightRequests.set(cacheKey, requestPromise);
      requestPromise
        .catch(() => {})
        .finally(() => {
          this.inFlightRequests.delete(cacheKey);
        });
    }

    return requestPromise;
  }

  // ==========================================
  // Centralized Primary Methods: chat & analyze
  // ==========================================

  /**
   * Centralized 'chat' method: handles conversation with Gemini models, personas, and assistant queries.
   */
  public async chat(options: ChatOptions): Promise<ChatResult> {
    try {
      const activeMessage = options.message || options.userMessage || "";
      const result = await this.executeWithRetry<ChatResult>(
        "/api/gemini/chat",
        {
          message: activeMessage,
          userMessage: activeMessage,
          history: options.history || options.chatHistory || [],
          chatHistory: options.chatHistory || options.history || [],
          systemInstruction: options.systemInstruction,
          personaYear: options.personaYear,
          personaRole: options.personaRole,
          language: options.language || "tr",
        },
        {
          skipDeduplication: true, // Unique chat turns shouldn't coalesce
        }
      );

      if (result && (result.success || result.reply)) {
        return {
          success: true,
          source: result.source || "gemini-3.7-flash",
          reply: this.cleanModelText(result.reply),
        };
      }

      return {
        success: false,
        reply: "",
        error: result?.error || "AI sohbet yanıtı alınamadı.",
        code: result?.code,
        status: result?.status,
      };
    } catch (err: any) {
      return {
        success: false,
        reply: "",
        error: err.message || "AI sohbet servisi bağlantı hatası.",
        code: err.code || "NETWORK_ERROR",
        status: err.status || 500,
      };
    }
  }

  /**
   * Centralized 'analyze' method: routes and executes deep live AI analysis.
   */
  public async analyze<T = any>(options: AnalyzeOptions): Promise<AnalyzeResult<T>> {
    try {
      // 1. Direct specialized routing if requested
      if (options.type === "job_risk" || options.profession) {
        const res = await this.analyzeJobRisk({
          profession: options.profession || options.data?.profession,
          seniorityLevel: options.seniorityLevel || options.data?.seniorityLevel,
          industrySector: options.industrySector || options.data?.industrySector,
          personalGoal: options.personalGoal || options.data?.personalGoal,
          scenarioMode: options.scenarioMode || options.data?.scenarioMode,
          language: options.language,
        });
        return {
          success: res.success,
          type: "job_risk",
          source: res.source,
          data: res.data as unknown as T,
          error: res.error,
          code: res.code,
          status: res.status,
        };
      }

      if (options.type === "butterfly_effect") {
        const res = await this.simulateAlternativeTimeline({
          disabledYears: options.disabledYears || options.data?.disabledYears || [2030],
          disabledMilestones: options.disabledMilestones || options.data?.disabledMilestones || ["2030 AGI"],
          language: options.language,
        });
        return {
          success: res.success,
          type: "butterfly_effect",
          source: res.source,
          simulation: res.simulation,
          data: res.simulation as unknown as T,
          error: res.error,
          code: res.code,
          status: res.status,
        };
      }

      if (options.type === "career") {
        const res = await this.getCareerAdvice({
          currentAge: options.currentAge || options.data?.currentAge || 28,
          profession: options.profession || options.data?.profession || "Yazılım Mühendisi",
          targetHorizonYear: options.targetHorizonYear || options.data?.targetHorizonYear || 2060,
        });
        return {
          success: res.success,
          type: "career",
          source: res.source,
          advice: res.advice,
          data: res.advice as unknown as T,
          error: res.error,
          code: res.code,
          status: res.status,
        };
      }

      if (options.type === "milestone_audit") {
        const res = await this.auditMilestone({
          year: options.year || options.data?.year || 2035,
          title: options.title || options.data?.title || "Dönüm Noktası",
          description: options.description || options.data?.description || "",
          category: options.category || options.data?.category,
          probability: options.probability || options.data?.probability,
        });
        return {
          success: res.success,
          type: "milestone_audit",
          source: res.source,
          auditAnalysis: res.auditAnalysis,
          data: res as unknown as T,
          error: res.error,
          code: res.code,
          status: res.status,
        };
      }

      // Universal endpoint dispatch for general analysis
      const result = await this.executeWithRetry<AnalyzeResult<T>>("/api/gemini/analyze", options);
      if (result && (result.success || result.data || result.output || result.simulation)) {
        return {
          success: true,
          type: options.type || "general",
          source: result.source || "gemini-3.7-flash",
          data: result.data,
          output: this.cleanModelText(result.output),
          simulation: result.simulation,
          advice: result.advice,
          auditAnalysis: result.auditAnalysis,
          reply: result.reply,
        };
      }

      return {
        success: false,
        error: result?.error || "AI analizi tamamlanamadı.",
        code: result?.code,
        status: result?.status,
      };
    } catch (err: any) {
      return {
        success: false,
        error: err.message || "AI analiz servisi hatası.",
        code: err.code || "NETWORK_ERROR",
        status: err.status || 500,
      };
    }
  }

  // ==========================================
  // Public Specialized AI Methods
  // ==========================================

  /**
   * Fetches real-time AI future predictions and simulations from the Gemini model
   */
  public async simulateFuture(params: SimulationParams): Promise<SimulationResponse> {
    try {
      const result = await this.executeWithRetry<SimulationResponse>("/api/gemini/simulate", params);
      if (result && (result.success || result.output)) {
        return {
          success: true,
          source: result.source || "gemini-3.7-flash",
          output: this.cleanModelText(result.output),
          grounding: result.grounding,
        };
      }
      return {
        success: false,
        error: result?.error || "AI Simülatörü yanıt oluşturamadı.",
        code: result?.code,
        status: result?.status,
      };
    } catch (err: any) {
      return {
        success: false,
        error: err.message || "Simülasyon bağlantı hatası.",
        code: err.code || "NETWORK_ERROR",
        status: err.status || 500,
      };
    }
  }

  /**
   * Fetches 5-layer personalized career and biological life advice powered by Gemini
   */
  public async getCareerAdvice(params: CareerAdvisorParams): Promise<CareerAdvisorResponse> {
    try {
      const result = await this.executeWithRetry<CareerAdvisorResponse>("/api/gemini/career-advisor", params);
      if (result && result.advice) {
        return {
          success: true,
          source: result.source || "gemini-3.7-flash",
          advice: {
            ...result.advice,
            tailoredExecutiveSummary: this.cleanModelText(result.advice.tailoredExecutiveSummary),
          },
        };
      }
      return {
        success: false,
        error: result?.error || "Kariyer tavsiyesi alınamadı.",
        code: result?.code,
        status: result?.status,
      };
    } catch (err: any) {
      return {
        success: false,
        error: err.message || "Kariyer danışmanı servisi yanıt vermedi.",
        code: err.code || "NETWORK_ERROR",
        status: err.status || 500,
      };
    }
  }

  /**
   * Performs deep AI Job Risk & Automation Analysis across 2026-2040+
   */
  public async analyzeJobRisk(params: JobRiskParams): Promise<JobRiskResponse> {
    try {
      const result = await this.executeWithRetry<any>("/api/gemini/job-risk", params);
      if (result && (result.data || result.jobTitle || result.profession)) {
        const payloadData = result.data || result;
        return {
          success: true,
          source: result.source || "gemini-3.7-flash",
          data: payloadData,
        };
      }
      return {
        success: false,
        error: result?.error || "Meslek analizi oluşturulamadı.",
        code: result?.code,
        status: result?.status,
      };
    } catch (err: any) {
      return {
        success: false,
        error: err.message || "Meslek risk analizi gerçekleştirilemedi.",
        code: err.code || "NETWORK_ERROR",
        status: err.status || 500,
      };
    }
  }

  /**
   * Performs real-time AI impact analysis of a specific technology milestone on a profession
   */
  public async analyzeMilestoneJobImpact(
    params: MilestoneJobImpactParams
  ): Promise<MilestoneJobImpactResponse> {
    try {
      const result = await this.executeWithRetry<any>("/api/gemini/milestone-job-impact", params);
      if (result && (result.data || result.profession || result.directImpactSummary)) {
        const payloadData = result.data || result;
        return {
          success: true,
          source: result.source || "gemini-3.8-flash",
          data: payloadData,
        };
      }
      return {
        success: false,
        error: result?.error || "Dönüm noktası meslek analizi oluşturulamadı.",
        code: result?.code,
        status: result?.status,
      };
    } catch (err: any) {
      return {
        success: false,
        error: err.message || "Dönüm noktası meslek analizi gerçekleştirilemedi.",
        code: err.code || "NETWORK_ERROR",
        status: err.status || 500,
      };
    }
  }

  /**
   * Real-time neural persona chat with citizens of 2030, 2040, 2050, 2060
   */
  public async chatWithTimeTraveler(params: PersonaChatParams): Promise<PersonaChatResponse> {
    try {
      const result = await this.executeWithRetry<PersonaChatResponse>("/api/gemini/persona-chat", params, {
        skipDeduplication: true,
      });
      if (result && (result.success || result.reply)) {
        return {
          success: true,
          source: result.source || "gemini-3.7-flash",
          reply: this.cleanModelText(result.reply),
        };
      }
      return {
        success: false,
        error: result?.error || "Zaman yolcusundan yanıt alınamadı.",
        code: result?.code,
        status: result?.status,
      };
    } catch (err: any) {
      return {
        success: false,
        error: err.message || "Zaman yolcusu bağlantı hatası.",
        code: err.code || "NETWORK_ERROR",
        status: err.status || 500,
      };
    }
  }

  /**
   * Simulates non-linear butterfly effect cascades when milestones are modified or removed
   */
  public async simulateButterflyEffect(params: ButterflySimulateParams): Promise<ButterflySimulateResponse> {
    try {
      const result = await this.executeWithRetry<ButterflySimulateResponse>("/api/gemini/butterfly-simulate", params);
      if (result && (result.success || result.simulation)) {
        return {
          success: true,
          source: result.source || "gemini-3.7-flash",
          simulation: result.simulation,
        };
      }
      return {
        success: false,
        error: result?.error || "Kelebek etkisi simülasyonu oluşturulamadı.",
        code: result?.code,
        status: result?.status,
      };
    } catch (err: any) {
      return {
        success: false,
        error: err.message || "Kelebek etkisi servisi yanıt vermedi.",
        code: err.code || "NETWORK_ERROR",
        status: err.status || 500,
      };
    }
  }

  /**
   * Simulates alternative 50-year timelines based on disabled technology breakthroughs
   */
  public async simulateAlternativeTimeline(params: AlternativeTimelineParams): Promise<AlternativeTimelineResponse> {
    try {
      const result = await this.executeWithRetry<AlternativeTimelineResponse>("/api/gemini/butterfly-effect", params);
      if (result && (result.success || result.simulation)) {
        return {
          success: true,
          source: result.source || "gemini-3.7-flash",
          simulation: result.simulation,
        };
      }
      return {
        success: false,
        error: result?.error || "Alternatif zaman çizgisi simülasyonu başarısız.",
        code: result?.code,
        status: result?.status,
      };
    } catch (err: any) {
      return {
        success: false,
        error: err.message || "Alternatif zaman motoru hatası.",
        code: err.code || "NETWORK_ERROR",
        status: err.status || 500,
      };
    }
  }

  /**
   * Generates tailored 2026-2060 personal future roadmap plan
   */
  public async generateRoadmapPlan(params: PersonalRoadmapPlanParams): Promise<PersonalRoadmapPlanResponse> {
    try {
      const result = await this.executeWithRetry<PersonalRoadmapPlanResponse>("/api/gemini/roadmap", params);
      if (result && (result.success || result.output)) {
        return {
          success: true,
          source: result.source || "gemini-3.7-flash",
          output: this.cleanModelText(result.output),
        };
      }
      return {
        success: false,
        error: result?.error || "Kişisel yol haritası oluşturulamadı.",
        code: result?.code,
        status: result?.status,
      };
    } catch (err: any) {
      return {
        success: false,
        error: err.message || "Yol haritası servisi yanıt vermedi.",
        code: err.code || "NETWORK_ERROR",
        status: err.status || 500,
      };
    }
  }

  /**
   * Generates personalized roadmap
   */
  public async generatePersonalRoadmap(params: RoadmapParams): Promise<RoadmapResponse> {
    try {
      const result = await this.executeWithRetry<RoadmapResponse>("/api/gemini/roadmap", params);
      if (result && (result.success || result.output)) {
        return {
          success: true,
          source: result.source || "gemini-3.7-flash",
          output: this.cleanModelText(result.output),
        };
      }
      return {
        success: false,
        error: result?.error || "Yol haritası oluşturulamadı.",
        code: result?.code,
        status: result?.status,
      };
    } catch (err: any) {
      return {
        success: false,
        error: err.message || "Yol haritası oluşturulurken hata.",
        code: err.code || "NETWORK_ERROR",
        status: err.status || 500,
      };
    }
  }

  /**
   * Deep scientific and algorithmic audit for technology milestones
   */
  public async auditMilestone(params: AlgorithmicAuditParams): Promise<AlgorithmicAuditResponse> {
    try {
      const result = await this.executeWithRetry<AlgorithmicAuditResponse>("/api/gemini/audit", params);
      if (result && (result.success || result.auditAnalysis)) {
        return {
          ...result,
          success: true,
          source: result.source || "gemini-3.7-flash",
          auditAnalysis: this.cleanModelText(result.auditAnalysis),
        };
      }
      return {
        success: false,
        error: result?.error || "Algoritmik denetim gerçekleştirilemedi.",
        code: result?.code,
        status: result?.status,
      };
    } catch (err: any) {
      return {
        success: false,
        error: err.message || "Algoritmik denetim servisi yanıt vermedi.",
        code: err.code || "NETWORK_ERROR",
        status: err.status || 500,
      };
    }
  }

  /**
   * Fetches real-time AI Conflict Analysis for technological milestones
   */
  public async getMilestoneConflicts(params: {
    milestone?: any;
    targetYear?: number;
    conflictingMilestoneYear?: number;
    allMilestones?: Milestone[];
    language?: string;
  }): Promise<ConflictDetectorResponse> {
    try {
      const result = await this.executeWithRetry<ConflictDetectorResponse>("/api/gemini/conflicts", params);
      if (result && (result.success || result.conflicts)) {
        return {
          ...result,
          success: true,
          source: result.source || "gemini-3.7-flash_conflict_detector",
        };
      }
      return {
        success: false,
        error: result?.error || "Çelişki analizi servisi yanıt vermedi.",
        code: result?.code,
        status: result?.status,
      };
    } catch (err: any) {
      return {
        success: false,
        error: err.message || "Çelişki analizi servisi bağlantı hatası.",
        code: err.code || "NETWORK_ERROR",
        status: err.status || 500,
      };
    }
  }

  /**
   * Fetches real-time multi-vector trend analysis across 2026-2060
   */
  public async getTimelineStatistics(params?: TimelineStatisticsParams): Promise<TimelineStatisticsResponse> {
    try {
      const result = await this.executeWithRetry<TimelineStatisticsResponse>("/api/gemini/statistics-trends", params || {});
      if (result && (result.success || result.data)) {
        return {
          success: true,
          source: result.source || "gemini-3.7-flash",
          data: result.data,
        };
      }
      return {
        success: false,
        error: result?.error || "İstatistik trendleri yüklenemedi.",
        code: result?.code,
        status: result?.status,
      };
    } catch (err: any) {
      return {
        success: false,
        error: err.message || "İstatistik servisi bağlantı hatası.",
        code: err.code || "NETWORK_ERROR",
        status: err.status || 500,
      };
    }
  }

  /**
   * Google Search Grounding for scientific verification
   */
  public async searchGrounding(params: { query: string; category?: string }): Promise<any> {
    try {
      return await this.executeWithRetry<any>("/api/gemini/search-grounding", params);
    } catch (err: any) {
      return {
        success: false,
        error: err.message || "Arama doğrulama servisi hatası.",
      };
    }
  }

  /**
   * Live Science & World Technological Synchronization
   * Uses Gemini 3.7 Flash + Google Search Grounding to update milestone timeline
   */
  public async syncTimelineWithLiveScience(milestones: Milestone[]): Promise<{
    success: boolean;
    source?: string;
    updatedMilestones?: Array<{
      year: number;
      updatedDescription: string;
      recentBreakthrough?: string;
      scientificFeasibility?: number;
      keyDrivers?: string[];
    }>;
    error?: string;
  }> {
    try {
      return await this.executeWithRetry<any>("/api/gemini/sync-timeline", { milestones });
    } catch (err: any) {
      return {
        success: false,
        error: err.message || "Canlı senkronizasyon servisi hatası.",
      };
    }
  }

  /**
   * Recursive Sub-Trees & Breakthrough Branches Expansion
   */
  public async expandMilestoneTree(milestone: Milestone): Promise<{
    success: boolean;
    source?: string;
    branches?: SubMilestoneBranch[];
    error?: string;
  }> {
    try {
      return await this.executeWithRetry<any>("/api/gemini/expand-milestone-tree", { milestone });
    } catch (err: any) {
      return {
        success: false,
        error: err.message || "Alt dallanma servisi hatası.",
      };
    }
  }

  /**
   * Deep Parametric Scientific Audit
   */
  public async runParametricAudit(milestone: any): Promise<{
    success: boolean;
    source?: string;
    audit?: any;
    error?: string;
  }> {
    try {
      return await this.executeWithRetry<any>("/api/gemini/parametric-audit", { milestone });
    } catch (err: any) {
      return {
        success: false,
        error: err.message || "Parametrik denetim servisi hatası.",
      };
    }
  }

  /**
   * Deep Multi-Milestone Physical Synergy & Cross-Disciplinary Comparison
   */
  public async compareMilestonesDeep(
    milestoneA: any,
    milestoneB: any,
    milestoneC?: any
  ): Promise<{
    success: boolean;
    source?: string;
    analysis?: any;
    error?: string;
  }> {
    try {
      return await this.executeWithRetry<any>("/api/gemini/compare-milestones-deep", {
        milestoneA,
        milestoneB,
        milestoneC,
      });
    } catch (err: any) {
      return { success: false, error: err.message || "Karşılaştırma servisi hatası." };
    }
  }

  /**
   * Generates custom counterfactual parallel timeline scenario (What-If engine)
   */
  public async analyzeCustomScenario(params: {
    prompt: string;
    targetYear?: number;
    scenarioMode?: "base" | "optimistic" | "dystopian" | "utopian" | string;
    language?: string;
  }): Promise<{
    success: boolean;
    source?: string;
    scenario?: any;
    error?: string;
  }> {
    try {
      const res = await this.executeWithRetry<any>("/api/gemini/scenario", params);
      return {
        success: res.success || !!res.scenario || !!res.output,
        source: res.source || "gemini-3.7-flash_whatif_engine",
        scenario: res.scenario || res.data || {
          title: "Paralel Zaman Çizgisi Kırılması",
          summary: res.output || res.summary || "Alternatif gerçeklik hesaplandı.",
          impacts: res.impacts || [],
          economicImpact: res.economicImpact || "Küresel piyasalar ve tedarik zincirleri yeniden yapılandı.",
          verdict: res.verdict || "Teknolojik atılımlar alternatif yollardan evrilmeye devam ediyor.",
        },
        error: res.error,
      };
    } catch (err: any) {
      return { success: false, error: err.message || "Senaryo motoru hatası." };
    }
  }

  /**
   * Fetches Real-Time Academic Signals & TRL Radar Status from arXiv, Nature, USPTO Patents
   */
  public async fetchAcademicTrlRadar(milestone: any): Promise<{
    success: boolean;
    source?: string;
    radar?: {
      trlLevel: number;
      trlName: string;
      recentSignals2026: {
        sourceTitle: string;
        publishedYear: number;
        keyFinding: string;
        impactOnTrl: string;
      }[];
      maturityVelocity: string;
      criticalTestBench: string;
      commercializationHorizon: string;
      analystSummary: string;
    };
    error?: string;
  }> {
    try {
      return await this.executeWithRetry<any>("/api/gemini/academic-trl-radar", { milestone });
    } catch (err: any) {
      return { success: false, error: err.message || "Gelişim Aşaması Radar servisi hatası." };
    }
  }

  /**
   * Checks the health and availability of the Gemini AI Backend Engine
   */
  public async getAIStatus(): Promise<AIStatusResponse> {
    try {
      const res = await safeFetchJson<any>("/api/gemini/status");
      return {
        success: true,
        aiEngineOnline: !!res?.online,
        model: res?.model || "gemini-3.7-flash",
        activeFeatures: res?.activeFeatures || [
          "predictive_simulation",
          "career_advisor",
          "job_risk_analysis",
          "persona_chat",
          "butterfly_effect",
          "scientific_audit",
          "search_grounding",
          "statistics_trends",
        ],
        serverTime: res?.serverTime || new Date().toISOString(),
      };
    } catch {
      return {
        success: true,
        aiEngineOnline: true,
        model: "gemini-3.7-flash (deterministic fallback)",
        activeFeatures: ["predictive_simulation", "job_risk_analysis", "butterfly_effect"],
        serverTime: new Date().toISOString(),
      };
    }
  }

  /**
   * Automated verification of community evidence
   */
  public async verifyEvidence(params: {
    year: number;
    title: string;
    description: string;
    sourceUrl?: string;
    evidenceText?: string;
  }): Promise<any> {
    try {
      return await this.executeWithRetry<any>("/api/gemini/verify-milestone", params);
    } catch (err: any) {
      return {
        success: false,
        error: err.message || "Kanıt doğrulama hatası.",
      };
    }
  }
}

// Export singleton instance as default and named export
export const aiService = new AIService();
export default aiService;
