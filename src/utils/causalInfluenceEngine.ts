import { Milestone } from "../types";

export interface DependencyLink {
  sourceYear: number;
  targetYear: number;
  strength: "critical" | "high" | "moderate";
  impactDescription: string;
  delayMultiplier: number;
  crossCategoryDomain?: string;
}

/**
 * MOTOR 2: Causal Influence DAG Network
 * Dynamic non-linear dependency mappings between technological breakthrough milestones.
 */
export const CAUSAL_DEPENDENCY_GRAPH: DependencyLink[] = [
  {
    sourceYear: 2026,
    targetYear: 2028,
    strength: "critical",
    impactDescription: "Otonom Biyo-Bilişim ve Ajan sürüleri gecikirse, Katı Hal Pili ve kuantum simülasyon hesaplamaları yavaşlar.",
    delayMultiplier: 0.85,
    crossCategoryDomain: "Bilişim -> Enerji",
  },
  {
    sourceYear: 2026,
    targetYear: 2030,
    strength: "high",
    impactDescription: "2026'daki otonom ajan koordinasyonu aksarsa, 2030 Biyo-Yapay Zeka ve kişisel sağlık modelleri 1.5 yıl gecikir.",
    delayMultiplier: 1.0,
    crossCategoryDomain: "Bilişim -> Biyo-Tıp",
  },
  {
    sourceYear: 2028,
    targetYear: 2033,
    strength: "critical",
    impactDescription: "2028 Katı Hal Pili gecikirse, 2033 Uçan Otonom Taksilerin menzili ve piyasaya çıkışı doğrudan ertelenir.",
    delayMultiplier: 1.2,
    crossCategoryDomain: "Enerji -> Ulaşım",
  },
  {
    sourceYear: 2028,
    targetYear: 2038,
    strength: "moderate",
    impactDescription: "Temiz enerji ve batarya yoğunluğundaki gecikme, 2038 Füzyon ve orbital veri merkezlerini öteler.",
    delayMultiplier: 0.7,
    crossCategoryDomain: "Enerji -> Uzay",
  },
  {
    sourceYear: 2030,
    targetYear: 2035,
    strength: "critical",
    impactDescription: "2030 Biyolojik Yapay Zeka gecikirse, 2035 BCI (Beyin-Bilgisayar Arayüzü) tüketici entegrasyonu duraklar.",
    delayMultiplier: 1.1,
    crossCategoryDomain: "Biyo-Tıp -> Nöroteknoloji",
  },
  {
    sourceYear: 2030,
    targetYear: 2045,
    strength: "high",
    impactDescription: "Biyo-bilişim ve AGI temellerindeki gecikme, 2045 Kuantum İnternet ve Yapay Süper Zeka (ASI) ufkunu öteler.",
    delayMultiplier: 1.05,
    crossCategoryDomain: "Bilişim -> Singularity",
  },
  {
    sourceYear: 2035,
    targetYear: 2040,
    strength: "critical",
    impactDescription: "2035 Nöral arayüz standartları gecikirse, 2040 Sentetik Organ ve genetik geriletme protokolleri aksar.",
    delayMultiplier: 0.95,
    crossCategoryDomain: "Nöroteknoloji -> Biyo-Rejenerasyon",
  },
  {
    sourceYear: 2035,
    targetYear: 2050,
    strength: "high",
    impactDescription: "Doğrudan zihin arayüzleri olmadan 2050 Dijital Ölümsüzlük ve Zihin Aktarımı pilotları başlayamaz.",
    delayMultiplier: 1.3,
    crossCategoryDomain: "Nöroteknoloji -> Bilinç Aktarımı",
  },
  {
    sourceYear: 2040,
    targetYear: 2055,
    strength: "high",
    impactDescription: "Sentetik Biyoloji ve Nano-Robotik olmadan 2055 Gezegenlerarası Koloni ekosistemleri kurulamaz.",
    delayMultiplier: 0.85,
    crossCategoryDomain: "Biyo-Robotik -> Uzay Kolonisi",
  },
  {
    sourceYear: 2045,
    targetYear: 2060,
    strength: "critical",
    impactDescription: "Kuantum Süper Zeka olmadan 2060 Teknolojik Singularity ve Homo Sapiens 2.0 fazına ulaşılamaz.",
    delayMultiplier: 1.4,
    crossCategoryDomain: "ASI -> Post-İnsan",
  },
];

export interface RippleEffectResult {
  sourceMilestone: Milestone;
  delayYears: number;
  affectedMilestones: {
    milestone: Milestone;
    shiftedYear: number;
    originalYear: number;
    delayAmount: number;
    causalReason: string;
    chainLevel: number;
    crossDomain?: string;
  }[];
  newSingularityYear: number;
  systemEntropyScore: number;
  resilienceIndex: number;
}

/**
 * Calculates the cascading domino ripple effect dynamically when a milestone is delayed or blocked.
 * Uses Non-Linear Dynamic Breadth-First-Search (BFS) over the Causal Influence DAG.
 */
export function calculateMilestoneDelayCascade(
  milestones: Milestone[],
  delayedSourceYear: number,
  delayAmountYears: number = 2
): RippleEffectResult {
  const sourceMilestone = milestones.find((m) => m.year === delayedSourceYear) || milestones[0];
  const delayMap: Record<number, number> = {};
  const reasonMap: Record<number, string> = {};
  const levelMap: Record<number, number> = {};
  const domainMap: Record<number, string> = {};

  delayMap[delayedSourceYear] = delayAmountYears;
  levelMap[delayedSourceYear] = 0;

  const queue: number[] = [delayedSourceYear];

  while (queue.length > 0) {
    const currentYear = queue.shift()!;
    const currentDelay = delayMap[currentYear] || 0;
    const currentLevel = levelMap[currentYear] || 0;

    // Find all downstream milestones dependent on currentYear
    const outgoingEdges = CAUSAL_DEPENDENCY_GRAPH.filter((e) => e.sourceYear === currentYear);

    for (const edge of outgoingEdges) {
      // Dynamic non-linear dampening/amplification based on chain depth and criticality
      const dampening = 1.0 - (currentLevel * 0.04);
      const inheritedDelay = Math.round(currentDelay * edge.delayMultiplier * dampening * 10) / 10;

      if (inheritedDelay > 0.3) {
        if (!delayMap[edge.targetYear] || delayMap[edge.targetYear] < inheritedDelay) {
          delayMap[edge.targetYear] = inheritedDelay;
          reasonMap[edge.targetYear] = edge.impactDescription;
          levelMap[edge.targetYear] = currentLevel + 1;
          domainMap[edge.targetYear] = edge.crossCategoryDomain || "Teknoloji";
          queue.push(edge.targetYear);
        }
      }
    }
  }

  const affectedList = Object.keys(delayMap)
    .map(Number)
    .filter((yr) => yr !== delayedSourceYear)
    .sort((a, b) => a - b)
    .map((yr) => {
      const targetMilestone = milestones.find((m) => m.year === yr);
      const delay = delayMap[yr];
      return {
        milestone: targetMilestone || {
          year: yr,
          title: `Gelecek Kırılım ${yr}`,
          description: "",
          phase: 2,
          category: "Yapay Zeka & Bilişim" as const,
          probability: 70,
          iconName: "Zap",
          impactLevel: 80,
          humanAugmentationIndex: 70,
          aiAutonomyIndex: 75,
          bioDigitalIntegrationRate: 60,
          keyDrivers: ["Otonom Sistemler"],
          dailyLifeImpact: "Etkilenen teknoloji dalgası.",
          ethicalRisks: ["Gecikme Etkisi"],
          societalOpportunities: ["Alternatif Çözümler"],
          relatedYears: [],
        },
        shiftedYear: Math.round(yr + delay),
        originalYear: yr,
        delayAmount: delay,
        causalReason: reasonMap[yr] || "Nedensellik ağı üzerinden aktarılan gecikme.",
        chainLevel: levelMap[yr] || 1,
        crossDomain: domainMap[yr],
      };
    });

  // Calculate dynamic revised Singularity year based on downstream cascade
  const singularityDelay = delayMap[2060] || (delayMap[2045] ? delayMap[2045] * 0.9 : delayAmountYears * 0.6);
  const newSingularityYear = Math.min(2075, Math.round(2060 + singularityDelay));

  // Dynamic Entropy Score: Higher delays across more milestones increase system instability
  const totalCascadeDelay = Object.values(delayMap).reduce((a, b) => a + b, 0);
  const systemEntropyScore = Math.min(95, Math.max(15, Math.round(20 + totalCascadeDelay * 5.2)));
  const resilienceIndex = Math.max(10, Math.min(95, 100 - systemEntropyScore));

  return {
    sourceMilestone,
    delayYears: delayAmountYears,
    affectedMilestones: affectedList,
    newSingularityYear,
    systemEntropyScore,
    resilienceIndex,
  };
}
