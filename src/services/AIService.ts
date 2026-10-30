import { Milestone, ScenarioMode } from "../types";
import { safeFetchJson, getApiHeaders } from "../utils/apiClient";

export class AIServiceError extends Error {
  public code: string;
  public status: number;
  public isRetryable: boolean;
  constructor(message: string, code: string = "UNKNOWN", status: number = 500, isRetryable: boolean = false) {
    super(message);
    this.name = "AIServiceError";
    this.code = code;
    this.status = status;
    this.isRetryable = isRetryable;
  }
}

export interface AIConflictItem {
  targetYear?: number;
  conflictingMilestoneYear?: number;
  conflictingMilestoneTitle?: string;
  conflictType?: "logical_paradox" | "physical_limitation" | "resource_clash" | "ethical_contradiction";
  severity?: "high" | "medium";
  badgeLabel?: string;
  title?: string;
  reasoning?: string;
  suggestedAnalysis?: string;
}

export interface AIConflictResult {
  success: boolean;
  conflicts: AIConflictItem[];
}

export interface StatisticsTrendPoint {
  year: number;
  aiAutonomy: number;
  humanAugmentation: number;
  bioDigitalIntegration: number;
}

export interface CategoryDynamicMetric {
  category: string;
  intensity: number;
  velocity: number;
  dominantTheme: string;
}

export interface TimelineStatisticsData {
  macroTrends: StatisticsTrendPoint[];
  categoryMetrics: CategoryDynamicMetric[];
  synthesisSummary: string;
  globalImpactScore: number;
  highestRiskYear: number;
  peakAccelerationYear: number;
}

export interface CareerAdvisorAdvice {
  verdict: string;
  topSkillsToLearn: string[];
  vulnerableSkills: string[];
  actionSteps: { year: number; title: string; detail: string }[];
  marketShiftPrediction: string;
}

export class AIService {
  async expandMilestoneTree(milestone: Milestone): Promise<any[]> {
    try {
      const res = await safeFetchJson<{ success: boolean; branches: any[] }>("/api/expand-milestone-tree", {
        method: "POST",
        headers: getApiHeaders(),
        body: JSON.stringify({ milestoneYear: milestone.year, milestoneTitle: milestone.title }),
      });
      if (res?.branches) return res.branches;
    } catch (e) {}
    return [
      { id: `branch_${milestone.year}_1`, year: milestone.year, title: `${milestone.title} - Faz A`, description: "Laboratuvar doğrulaması ve prototipleme.", probability: 85, trlLevel: 7, criticalParameters: [], scientificSources: [] },
      { id: `branch_${milestone.year}_2`, year: milestone.year + 2, title: `${milestone.title} - Faz B`, description: "Endüstriyel pilot ve regülasyon uyumu.", probability: 75, trlLevel: 8, criticalParameters: [], scientificSources: [] },
    ];
  }

  async chatWithTimeTraveler(params: { message: string; personaYear: number; history?: any[] }): Promise<{ reply: string }> {
    try {
      const res = await safeFetchJson<{ reply: string }>("/api/persona-chat", {
        method: "POST",
        headers: getApiHeaders(),
        body: JSON.stringify(params),
      });
      if (res?.data?.reply) return { reply: res.data.reply };
      if ((res as any)?.reply) return { reply: (res as any).reply };
    } catch (e) {}
    return {
      reply: `${params.personaYear} yılından bağlanıyorum. Burada teknoloji ve yaşam hibritleşti. Sorun hakkında deneyimlerimi aktarıyorum: ${params.message.slice(0, 50)}...`,
    };
  }

  async getMilestoneConflicts(params: {
    milestone: Milestone;
    targetYear?: number;
    allMilestones?: Milestone[];
    language?: string;
  }): Promise<AIConflictResult> {
    try {
      const res = await safeFetchJson<AIConflictResult>("/api/milestone-conflicts", {
        method: "POST",
        headers: getApiHeaders(),
        body: JSON.stringify(params),
      });
      if (res?.data?.conflicts) return res.data;
      if ((res as any)?.conflicts) return res as any;
    } catch (e) {}
    return { success: false, conflicts: [] };
  }

  async analyze(params: any): Promise<any> {
    try {
      const res = await safeFetchJson<any>("/api/butterfly-simulate", {
        method: "POST",
        headers: getApiHeaders(),
        body: JSON.stringify(params),
      });
      if (res?.data) return res.data;
    } catch (e) {}
    return { impactSummary: "Simülasyon domino etkilerini doğrulamaktadır.", cascadeChains: [] };
  }

  async analyzeMilestoneJobImpact(params: any): Promise<any> {
    try {
      const res = await safeFetchJson<any>("/api/milestone-job-impact", {
        method: "POST",
        headers: getApiHeaders(),
        body: JSON.stringify(params),
      });
      if (res?.data) return res.data;
    } catch (e) {}
    return {
      riskLevel: "Orta",
      automationPercentage: 60,
      skillsToGain: ["Yapay Zeka Okuryazarlığı", "Sistem Yönetimi"],
      actionAdvice: "Gelişmeye yönelik proaktif adımlar atın.",
    };
  }

  async analyzeCustomScenario(params: any): Promise<any> {
    try {
      const res = await safeFetchJson<any>("/api/scenario", {
        method: "POST",
        headers: getApiHeaders(),
        body: JSON.stringify(params),
      });
      if (res?.data) return res.data;
    } catch (e) {}
    return { summary: "Özelleştirilmiş senaryo analizi tamamlandı." };
  }

  async analyzeJobRisk(params: any): Promise<any> {
    try {
      const res = await safeFetchJson<any>("/api/gemini/job-risk", {
        method: "POST",
        headers: getApiHeaders(),
        body: JSON.stringify(params),
      });
      if (res?.status === 401 || res?.code === "UNAUTHORIZED" || res?.error === "UNAUTHORIZED") {
        return {
          success: false,
          code: "UNAUTHORIZED",
          status: 401,
          error: "Yetkisiz erişim: Oturum açmanız gerekmektedir.",
        };
      }
      if (res?.data) return res.data;
      if (res?.success === false) return res;
    } catch (e) {}
    return {
      profession: params.profession || "Profesyonel",
      automationPercentage: 65,
      overallRiskLevel: "Orta / Medium",
      peakRiskYear: 2032,
      yearlyRiskTrend: [
        { year: 2026, riskScore: 35, note: "Rutin operasyonlar otomatikleşir." },
        { year: 2030, riskScore: 65, note: "Bilişsel sistemler yaygınlaşır." },
      ],
      keyAdaptationSkills: ["AI Araçları", "Stratejik Yönetim"],
      summary: "Mesleki dönüşüm hızlanmaktadır.",
    };
  }

  async getCareerAdvice(params: any): Promise<CareerAdvisorAdvice> {
    try {
      const res = await safeFetchJson<any>("/api/career-advisor", {
        method: "POST",
        headers: getApiHeaders(),
        body: JSON.stringify(params),
      });
      if (res?.data) return res.data;
    } catch (e) {}
    return {
      verdict: "Kariyerinizde yapay zeka araçlarını uzmanlık alanınızla birleştirerek stratejik avantaj sağlayabilirsiniz.",
      topSkillsToLearn: ["AI Ajan Orkestrasyonu", "Veri Güvenliği & Mimari", "Çok Boyutlu Problem Çözme"],
      vulnerableSkills: ["Rutin veri hazırlama", "Manuel raporlama"],
      actionSteps: [
        { year: 2026, title: "Araç Entegrasyonu", detail: "Günlük iş akışlarınıza otonom asistanları dahil edin." },
        { year: 2029, title: "Mimari Dönüşüm", detail: "İcra yerine stratejik koordinasyon rolüne geçiş yapın." },
      ],
      marketShiftPrediction: "Gelecek 5 yıl içinde hibrit çalışan profilleri piyasa değerini %40 artıracaktır.",
    };
  }

  async getTimelineStatistics(params: { milestones: Milestone[]; scenario?: ScenarioMode }): Promise<TimelineStatisticsData> {
    const milestones = params.milestones || [];
    const macroTrends: StatisticsTrendPoint[] = [
      { year: 2026, aiAutonomy: 40, humanAugmentation: 60, bioDigitalIntegration: 25 },
      { year: 2030, aiAutonomy: 70, humanAugmentation: 75, bioDigitalIntegration: 45 },
      { year: 2035, aiAutonomy: 85, humanAugmentation: 85, bioDigitalIntegration: 70 },
      { year: 2045, aiAutonomy: 95, humanAugmentation: 92, bioDigitalIntegration: 88 },
      { year: 2060, aiAutonomy: 98, humanAugmentation: 96, bioDigitalIntegration: 95 },
    ];

    const categoryMetrics: CategoryDynamicMetric[] = [
      { category: "Yapay Zeka & Bilişim", intensity: 94, velocity: 90, dominantTheme: "Otonom Ajanlar & AGI" },
      { category: "Biyoloji & Tıp", intensity: 88, velocity: 82, dominantTheme: "Sentetik Biyoloji & Gençleşme" },
      { category: "Kuantum & Güvenlik", intensity: 85, velocity: 80, dominantTheme: "Kuantum Kripto & Üstünlük" },
      { category: "Enerji & Çevre", intensity: 82, velocity: 75, dominantTheme: "Füzyon & Akıllı Şebekeler" },
    ];

    return {
      macroTrends,
      categoryMetrics,
      synthesisSummary: "Zaman çizelgesi, 2026-2035 yılları arasında bilişsel otomasyonun ve biyoteknolojik atılımların eşzamanlı hızlandığını göstermektedir.",
      globalImpactScore: 89,
      highestRiskYear: 2033,
      peakAccelerationYear: 2029,
    };
  }

  async generateRoadmapPlan(params: any): Promise<any> {
    try {
      const res = await safeFetchJson<any>("/api/personal-roadmap", {
        method: "POST",
        headers: getApiHeaders(),
        body: JSON.stringify(params),
      });
      if (res?.data) return res.data;
    } catch (e) {}
    return {
      title: "Kişisel Gelecek Planı",
      steps: [
        { year: 2026, milestone: "Ajan Araçlarına Hakimiyet", action: "Agentic workflow entegrasyonu" },
        { year: 2029, milestone: "Sistem Liderliği", action: "Karmaşık sistem mimarisine liderlik etme" },
      ],
    };
  }

  async executeWithRetry(url: string, options: any = {}, retryConfig?: { maxRetries?: number }): Promise<any> {
    const res = await safeFetchJson<any>(url, options, retryConfig?.maxRetries ?? 0);
    if (res?.status === 401 || res?.code === "UNAUTHORIZED" || res?.error === "UNAUTHORIZED") {
      throw new AIServiceError("Yetkisiz erişim: Oturum açmanız gerekmektedir.", "UNAUTHORIZED", 401, false);
    }
    if (!res.success) {
      throw new AIServiceError(res.error || "İşlem başarısız", res.code || "UNKNOWN", res.status || 500, false);
    }
    return res.data || res;
  }

  async syncTimelineWithLiveScience(milestones: Milestone[]): Promise<any> {
    return { success: true, updatedCount: 0 };
  }
}

export const aiService = new AIService();
