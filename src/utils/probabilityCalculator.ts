import { Milestone, ScenarioMode } from "../types";

/**
 * Calculates dynamically adjusted probability based on time horizon (Time-Decay Decay Model),
 * baseline confidence, and chosen Scenario Mode (Optimistic, Baseline, Dystopian).
 * 
 * Mathematical Model:
 * Current Year: 2026
 * Delta Years: Y - 2026
 * Decay Rate (alpha): 0.022 (approx 2.2% compound uncertainty decay per year into future)
 * Formula: P(Y) = P_base * exp(-alpha * DeltaYears) * ScenarioModifier
 */
export function calculateDynamicProbability(
  baseProbability: number,
  targetYear: number,
  scenario: ScenarioMode = "baseline"
): {
  adjustedProbability: number;
  confidenceCategory: "Yakın Ufuk Projeksiyonu" | "Orta Vadeli Sistem Tahmini" | "Uzun Vadeli Otonom Projeksiyon" | "Teorik Model Hipotezi";
  decayFactor: number;
  explanation: string;
} {
  const currentYear = 2026;
  const deltaYears = Math.max(0, targetYear - currentYear);

  // Decay factor alpha = 0.022
  const alpha = 0.022;
  const rawDecay = Math.exp(-alpha * deltaYears);

  // Scenario modifier
  let scenarioMod = 1.0;
  if (scenario === "optimistic") {
    scenarioMod = 1.08; // Ar-Ge hızlanır, olasılık %8 daha yüksek
  } else if (scenario === "dystopian") {
    scenarioMod = 0.92; // Etik/küresel kriz engelleri, olasılık %8 daha düşük
  }

  // Calculate adjusted percentage
  let adjusted = baseProbability * rawDecay * scenarioMod;
  
  // Cap between 15% and 99%
  adjusted = Math.min(99, Math.max(15, Math.round(adjusted)));

  // Categorize confidence level based on distance and calculated probability
  let confidenceCategory: "Yakın Ufuk Projeksiyonu" | "Orta Vadeli Sistem Tahmini" | "Uzun Vadeli Otonom Projeksiyon" | "Teorik Model Hipotezi" = "Yakın Ufuk Projeksiyonu";
  let explanation = "";

  if (deltaYears <= 4) {
    confidenceCategory = "Yakın Ufuk Projeksiyonu";
    explanation = `Mevcut patent ve açık bilim literatürüne dayalı sistem tahmini (%${adjusted} model olasılığı).`;
  } else if (deltaYears <= 10) {
    confidenceCategory = "Orta Vadeli Sistem Tahmini";
    explanation = `10 yıllık projeksiyon penceresinde akademik literatür ve teknoloji yol haritası modellemesi (%${adjusted} model olasılığı).`;
  } else if (deltaYears <= 20) {
    confidenceCategory = "Uzun Vadeli Otonom Projeksiyon";
    explanation = `20 yıla uzanan otonom veri projeksiyonu; teknolojik kırılma ve entropi faktörleri (%${adjusted} model olasılığı).`;
  } else {
    confidenceCategory = "Teorik Model Hipotezi";
    explanation = `2045+ sonrası post-singularity varsayımları. Yüksek teorik varyans ve spekülatif dinamikler içerir.`;
  }

  return {
    adjustedProbability: adjusted,
    confidenceCategory,
    decayFactor: Math.round(rawDecay * 100) / 100,
    explanation,
  };
}

/**
 * Updates an array of Milestones by applying the dynamic probability decay algorithm.
 */
export function applyTimeDecayToMilestones(
  milestones: Milestone[],
  scenario: ScenarioMode = "baseline"
): Milestone[] {
  return milestones.map((m) => {
    const { adjustedProbability } = calculateDynamicProbability(m.probability, m.year, scenario);
    return {
      ...m,
      probability: adjustedProbability,
    };
  });
}
