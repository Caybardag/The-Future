export type FeatureKey =
  | "job_risk_analysis"
  | "butterfly_effect"
  | "persona_chat"
  | "ai_simulation"
  | "agent_scan"
  | "proof_audit"
  | "personal_roadmap"
  | "community_submission"
  | "telegram_deep_analysis";

// Canonical Centralized Tariff (Single Source of Truth for Server & Client)
export const CANONICAL_FEATURE_BASE_COSTS = {
  job_risk_analysis: 10,
  butterfly_effect: 10,
  persona_chat: 2,
  ai_simulation: 10,
  agent_scan: 10,
  proof_audit: 10,
  personal_roadmap: 15,
  milestone_tree: 5,
  parametric_audit: 5,
  academic_radar: 5,
  evidence_verification: 5,
  milestone_verification: 5,
  causal_conflicts: 5,
  deep_comparison: 10,
  scenario_analysis: 10,
  milestone_job_impact: 3,
  career_advisor: 10,
  trend_analytics: 10,
  community_submission: 5,
  telegram_deep_analysis: 5,
} as const;

export const FEATURE_COSTS = {
  JOB_RISK: CANONICAL_FEATURE_BASE_COSTS.job_risk_analysis,
  BUTTERFLY_EFFECT: CANONICAL_FEATURE_BASE_COSTS.butterfly_effect,
  PERSONA_CHAT: CANONICAL_FEATURE_BASE_COSTS.persona_chat,
  AI_SIMULATION: CANONICAL_FEATURE_BASE_COSTS.ai_simulation,
  AGENT_SCAN: CANONICAL_FEATURE_BASE_COSTS.agent_scan,
  VERIFICATION_AUDIT: CANONICAL_FEATURE_BASE_COSTS.proof_audit,
  PERSONAL_ROADMAP: CANONICAL_FEATURE_BASE_COSTS.personal_roadmap,
} as const;

export const CANONICAL_ROUTE_CREDIT_COSTS: Record<string, { cost: number; feature: string }> = {
  "/simulate": { cost: CANONICAL_FEATURE_BASE_COSTS.ai_simulation, feature: "ai_simulation" },
  "/verify-timeline": { cost: CANONICAL_FEATURE_BASE_COSTS.proof_audit, feature: "algorithmic_audit" },
  "/verify-evidence": { cost: CANONICAL_FEATURE_BASE_COSTS.evidence_verification, feature: "evidence_verification" },
  "/chat": { cost: CANONICAL_FEATURE_BASE_COSTS.persona_chat, feature: "persona_chat" },
  "/persona-chat": { cost: CANONICAL_FEATURE_BASE_COSTS.persona_chat, feature: "persona_chat" },
  "/butterfly-effect": { cost: CANONICAL_FEATURE_BASE_COSTS.butterfly_effect, feature: "butterfly_effect" },
  "/butterfly-simulate": { cost: CANONICAL_FEATURE_BASE_COSTS.butterfly_effect, feature: "butterfly_effect" },
  "/compare-milestones-deep": { cost: CANONICAL_FEATURE_BASE_COSTS.deep_comparison, feature: "deep_comparison" },
  "/scenario": { cost: CANONICAL_FEATURE_BASE_COSTS.scenario_analysis, feature: "scenario_analysis" },
  "/verify-milestone": { cost: CANONICAL_FEATURE_BASE_COSTS.milestone_verification, feature: "milestone_verification" },
  "/conflicts": { cost: CANONICAL_FEATURE_BASE_COSTS.causal_conflicts, feature: "causal_conflicts" },
  "/audit": { cost: CANONICAL_FEATURE_BASE_COSTS.proof_audit, feature: "algorithmic_audit" },
  "/expand-milestone-tree": { cost: CANONICAL_FEATURE_BASE_COSTS.milestone_tree, feature: "milestone_tree" },
  "/parametric-audit": { cost: CANONICAL_FEATURE_BASE_COSTS.parametric_audit, feature: "parametric_audit" },
  "/academic-trl-radar": { cost: CANONICAL_FEATURE_BASE_COSTS.academic_radar, feature: "academic_radar" },
  "/auto-scan-evidence": { cost: CANONICAL_FEATURE_BASE_COSTS.evidence_verification, feature: "evidence_scan" },
  "/roadmap": { cost: CANONICAL_FEATURE_BASE_COSTS.personal_roadmap, feature: "personal_roadmap" },
  "/job-risk": { cost: CANONICAL_FEATURE_BASE_COSTS.job_risk_analysis, feature: "job_risk_analysis" },
  "/milestone-job-impact": { cost: CANONICAL_FEATURE_BASE_COSTS.milestone_job_impact, feature: "job_risk_analysis" },
  "/career-advisor": { cost: CANONICAL_FEATURE_BASE_COSTS.career_advisor, feature: "career_advisor" },
  "/statistics-trends": { cost: CANONICAL_FEATURE_BASE_COSTS.trend_analytics, feature: "trend_analytics" },
};

export interface FeatureCreditInfo {
  key: FeatureKey;
  name: string;
  description: string;
  baseCost: number;       // Standart Kredi maliyeti
  proCost: number;        // Pro Research (%50 indirimli)
  quantumVipCost: number; // Quantum VIP (%75 indirimli)
  freeMonthlyLimit: number;       // Standart Aylık Ücretsiz Hak
  proMonthlyLimit: number;        // Pro Research Aylık Hak
  quantumVipMonthlyLimit: number; // Quantum VIP Aylık Hak
  freeDailyLimit: number;         // Uyumlu Alias
  proDailyLimit: number;          // Uyumlu Alias
  quantumVipDailyLimit: number;   // Uyumlu Alias
  unitLabel: string;
  adEquivalent: string;           // Reklam / Tıklama karşılığı
  freeTierDailyCapacity: string;  // Günlük bedava kazanılan krediyle yapılabilirlik
  freeTierStatus: string;         // Ücretsiz durum özeti
}

export const FEATURE_CREDIT_TABLE: Record<FeatureKey, FeatureCreditInfo> = {
  job_risk_analysis: {
    key: "job_risk_analysis",
    name: "Meslek Otomasyon Risk Analizi",
    description: "2026-2060 dönemi mesleki otomasyon ve maaş kayma simülasyonu",
    baseCost: CANONICAL_FEATURE_BASE_COSTS.job_risk_analysis,
    proCost: Math.max(1, Math.ceil(CANONICAL_FEATURE_BASE_COSTS.job_risk_analysis * 0.50)),
    quantumVipCost: Math.max(1, Math.ceil(CANONICAL_FEATURE_BASE_COSTS.job_risk_analysis * 0.25)),
    freeMonthlyLimit: 1,
    proMonthlyLimit: 5,
    quantumVipMonthlyLimit: 15,
    freeDailyLimit: 1,
    proDailyLimit: 5,
    quantumVipDailyLimit: 15,
    unitLabel: "sorgu",
    adEquivalent: "1 Reklam = 5 Kredi",
    freeTierDailyCapacity: "Günde 5x Ücretsiz",
    freeTierStatus: "Reklamla Sınırsız Açık",
  },
  butterfly_effect: {
    key: "butterfly_effect",
    name: "Kelebek Etkisi Dominosu",
    description: "Tarihsel kırılmayı iptal edip Singularity gecikmesini simüle etme",
    baseCost: CANONICAL_FEATURE_BASE_COSTS.butterfly_effect,
    proCost: Math.max(1, Math.ceil(CANONICAL_FEATURE_BASE_COSTS.butterfly_effect * 0.50)),
    quantumVipCost: Math.max(1, Math.ceil(CANONICAL_FEATURE_BASE_COSTS.butterfly_effect * 0.25)),
    freeMonthlyLimit: 0,
    proMonthlyLimit: 2,
    quantumVipMonthlyLimit: 5,
    freeDailyLimit: 0,
    proDailyLimit: 2,
    quantumVipDailyLimit: 5,
    unitLabel: "işlem",
    adEquivalent: "2 Reklam İzleme",
    freeTierDailyCapacity: "Günde 5x Ücretsiz",
    freeTierStatus: "Reklamla Sınırsız Açık",
  },
  persona_chat: {
    key: "persona_chat",
    name: "2060 AI Persona Sohbeti",
    description: "Gelecekten bir kişi veya robot bilinç ile kuantum zaman tüneli mesajlaşması",
    baseCost: CANONICAL_FEATURE_BASE_COSTS.persona_chat,
    proCost: Math.max(1, Math.ceil(CANONICAL_FEATURE_BASE_COSTS.persona_chat * 0.50)),
    quantumVipCost: Math.max(1, Math.ceil(CANONICAL_FEATURE_BASE_COSTS.persona_chat * 0.25)),
    freeMonthlyLimit: 5,
    proMonthlyLimit: 15,
    quantumVipMonthlyLimit: 50,
    freeDailyLimit: 5,
    proDailyLimit: 15,
    quantumVipDailyLimit: 50,
    unitLabel: "mesaj",
    adEquivalent: "1 Reklam = ~2-3 Mesaj",
    freeTierDailyCapacity: "Günde 25+ Mesaj",
    freeTierStatus: "5 Mesaj Dahil + Reklamla Açık",
  },
  ai_simulation: {
    key: "ai_simulation",
    name: "Derin Gelecek & Senaryo Simülasyonu",
    description: "Belirli bir yıl için günlük gazete haberi, özel günlük veya AI kehanet raporu üretme",
    baseCost: CANONICAL_FEATURE_BASE_COSTS.ai_simulation,
    proCost: Math.max(1, Math.ceil(CANONICAL_FEATURE_BASE_COSTS.ai_simulation * 0.50)),
    quantumVipCost: Math.max(1, Math.ceil(CANONICAL_FEATURE_BASE_COSTS.ai_simulation * 0.25)),
    freeMonthlyLimit: 0,
    proMonthlyLimit: 2,
    quantumVipMonthlyLimit: 5,
    freeDailyLimit: 0,
    proDailyLimit: 2,
    quantumVipDailyLimit: 5,
    unitLabel: "simülasyon",
    adEquivalent: "2 Reklam İzleme",
    freeTierDailyCapacity: "Günde 5x Ücretsiz",
    freeTierStatus: "Reklamla Sınırsız Açık",
  },
  agent_scan: {
    key: "agent_scan",
    name: "Otonom AI Ajan Canlı Taraması",
    description: "Otonom AI ajanlarının canlı zaman kayma vektörlerini hesaplama",
    baseCost: CANONICAL_FEATURE_BASE_COSTS.agent_scan,
    proCost: Math.max(1, Math.ceil(CANONICAL_FEATURE_BASE_COSTS.agent_scan * 0.50)),
    quantumVipCost: Math.max(1, Math.ceil(CANONICAL_FEATURE_BASE_COSTS.agent_scan * 0.25)),
    freeMonthlyLimit: 0,
    proMonthlyLimit: 2,
    quantumVipMonthlyLimit: 5,
    freeDailyLimit: 0,
    proDailyLimit: 2,
    quantumVipDailyLimit: 5,
    unitLabel: "tarama",
    adEquivalent: "2 Reklam İzleme",
    freeTierDailyCapacity: "Günde 5x Ücretsiz",
    freeTierStatus: "Reklamla Sınırsız Açık",
  },
  proof_audit: {
    key: "proof_audit",
    name: "Otonom AI Kaynak / Bilimsel Denetimi",
    description: "Kullanıcı kanıtını OpenAlex / arXiv / Patent indekslerinde denetleme",
    baseCost: CANONICAL_FEATURE_BASE_COSTS.proof_audit,
    proCost: Math.max(1, Math.ceil(CANONICAL_FEATURE_BASE_COSTS.proof_audit * 0.50)),
    quantumVipCost: Math.max(1, Math.ceil(CANONICAL_FEATURE_BASE_COSTS.proof_audit * 0.25)),
    freeMonthlyLimit: 0,
    proMonthlyLimit: 3,
    quantumVipMonthlyLimit: 10,
    freeDailyLimit: 0,
    proDailyLimit: 3,
    quantumVipDailyLimit: 10,
    unitLabel: "denetim",
    adEquivalent: "2 Reklam İzleme",
    freeTierDailyCapacity: "Günde 5x Ücretsiz",
    freeTierStatus: "Reklamla Sınırsız Açık",
  },
  personal_roadmap: {
    key: "personal_roadmap",
    name: "Kişisel Gelecek Yol Haritası",
    description: "Kullanıcının kendi kariyer, finans ve beceri dönüşümünü 2026-2060 arasında haritalama",
    baseCost: CANONICAL_FEATURE_BASE_COSTS.personal_roadmap,
    proCost: Math.max(1, Math.ceil(CANONICAL_FEATURE_BASE_COSTS.personal_roadmap * 0.50)),
    quantumVipCost: Math.max(1, Math.ceil(CANONICAL_FEATURE_BASE_COSTS.personal_roadmap * 0.25)),
    freeMonthlyLimit: 0,
    proMonthlyLimit: 2,
    quantumVipMonthlyLimit: 5,
    freeDailyLimit: 0,
    proDailyLimit: 2,
    quantumVipDailyLimit: 5,
    unitLabel: "yol haritası",
    adEquivalent: "3 Reklam İzleme",
    freeTierDailyCapacity: "Günde 3x Ücretsiz",
    freeTierStatus: "Reklamla Sınırsız Açık",
  },
  community_submission: {
    key: "community_submission",
    name: "Topluluk Dönüm Noktası Gönderimi",
    description: "Yeni bir teknolojik gelişme önerisinde bulunma",
    baseCost: CANONICAL_FEATURE_BASE_COSTS.community_submission,
    proCost: Math.max(1, Math.ceil(CANONICAL_FEATURE_BASE_COSTS.community_submission * 0.50)),
    quantumVipCost: Math.max(1, Math.ceil(CANONICAL_FEATURE_BASE_COSTS.community_submission * 0.25)),
    freeMonthlyLimit: 1,
    proMonthlyLimit: 5,
    quantumVipMonthlyLimit: 15,
    freeDailyLimit: 1,
    proDailyLimit: 5,
    quantumVipDailyLimit: 15,
    unitLabel: "gönderi",
    adEquivalent: "1 Reklam = 5 Kredi",
    freeTierDailyCapacity: "Günde 15+ Gönderi",
    freeTierStatus: "1 Ücretsiz Dahil + Reklam/Tıkla",
  },
  telegram_deep_analysis: {
    key: "telegram_deep_analysis",
    name: "Canlı Haber Derinlemesine Analizi",
    description: "Telegram bilimsel ve teknolojik istihbarat haberlerini TRL seviyesi, kırılma puanı ve 2026-2060 takvim entegrasyonuyla detaylı inceleme",
    baseCost: CANONICAL_FEATURE_BASE_COSTS.telegram_deep_analysis,
    proCost: Math.max(1, Math.ceil(CANONICAL_FEATURE_BASE_COSTS.telegram_deep_analysis * 0.50)),
    quantumVipCost: Math.max(1, Math.ceil(CANONICAL_FEATURE_BASE_COSTS.telegram_deep_analysis * 0.25)),
    freeMonthlyLimit: 1,
    proMonthlyLimit: 5,
    quantumVipMonthlyLimit: 15,
    freeDailyLimit: 1,
    proDailyLimit: 5,
    quantumVipDailyLimit: 15,
    unitLabel: "analiz",
    adEquivalent: "1 Reklam İzleme",
    freeTierDailyCapacity: "Günde 5x Ücretsiz",
    freeTierStatus: "1 Ücretsiz Dahil + Reklamla Açık",
  },
};

export function getFeatureCreditCost(feature: FeatureKey, plan?: string | null): number {
  const info = FEATURE_CREDIT_TABLE[feature];
  if (!info) return 10;

  if (plan === "quantum_vip") {
    return info.quantumVipCost;
  }
  if (plan === "pro") {
    return info.proCost;
  }
  return info.baseCost;
}

export function getFeatureMonthlyLimit(feature: FeatureKey, plan?: string | null): number {
  const info = FEATURE_CREDIT_TABLE[feature];
  if (!info) return 0;

  if (plan === "quantum_vip") {
    return info.quantumVipMonthlyLimit;
  }
  if (plan === "pro") {
    return info.proMonthlyLimit;
  }
  return info.freeMonthlyLimit;
}

export function getFeatureDailyLimit(feature: FeatureKey, plan?: string | null): number {
  return getFeatureMonthlyLimit(feature, plan);
}
