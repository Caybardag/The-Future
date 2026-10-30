import { Milestone, FiveLayerWorldState } from "../types";

export function getFiveLayerWorldState(milestone: Milestone, userBirthYear?: number): FiveLayerWorldState {
  const currentYear = milestone.year || 2026;
  const birthYear = userBirthYear || 1995;
  const userAgeAtYear = Math.max(0, currentYear - birthYear);

  // Nearer milestones have higher TRL (maturation curve), farther milestones lower TRL
  // e.g. 2026 -> TRL 9, 2030 -> TRL 7, 2040 -> TRL 5, 2060 -> TRL 3
  const yearDelta = Math.max(0, currentYear - 2026);
  const calculatedTrl = Math.max(2, Math.min(9, Math.round(9 - yearDelta * 0.18)));

  const automationRate = Math.min(98, Math.max(25, Math.round(30 + yearDelta * 1.8)));
  const consensusRate = Math.max(30, Math.min(95, Math.round(85 - yearDelta * 1.2)));

  return {
    technologicalBreakthroughs: {
      aiAndComputing: `${milestone.title}: Otonom algoritmalar ve bilişsel modeller altyapıya entegre.`,
      biologyAndHealth: currentYear >= 2035 ? "Sentetik biyoloji ve hücresel gençleşme klinikte." : "Hedefe yönelik gen tedavileri ve biyosensörler.",
      energyAndInfra: currentYear >= 2040 ? "Füzyon enerjisi ve akıllı süper-şebekeler." : "Yeni nesil bataryalar ve yeşil enerji geçişi.",
    },
    dailyLifeAndBio: {
      morningRoutineSnippet: `${currentYear} yılında sabah uyandığında çevre sensörleri ve biyometrik arayüzler sağlık durumunu anlık optimize eder.`,
      userAgeFormula: `${currentYear} yılında ${userAgeAtYear} yaşındasın.`,
      commonBioInterfaces: ["Non-invaziv biyosensör", "Akıllı AR lens", "Hücresel metabolizma monitörü"],
    },
    macroEconomicsAndGeo: {
      automatedJobsRate: automationRate,
      emergingProfessions: ["Otonom Sistem Mimarı", "Biyo-Sentetik Veri Küratörü", "Kuantum Güvenlik Uzmanı"],
      geopoliticalPowerHub: "Çok kutuplu bilişim ve kuantum altyapı merkezleri",
    },
    riskAndCountermeasures: {
      criticalThreat: milestone.ethicalRisks?.[0] || "Sistemik siber güvenlik ve yapay zeka denetim açığı",
      algorithmicDefenses: "Merkeziyetsiz kriptografik doğrulama ve etik kalkan protokolleri",
      vulnerabilityScore: Math.min(90, Math.max(20, Math.round(35 + yearDelta * 1.1))),
    },
    scientificReadiness: {
      trlLevel: calculatedTrl,
      trlType: "model_estimated",
      academicConsensusRate: consensusRate,
      consensusType: "model_projected",
      supportingSignalCount: milestone.signals?.length || 2,
    },
    dominoEffects: [
      `${currentYear + 2}: Endüstriyel işgücü dönüşümünde hızlanma`,
      `${currentYear + 5}: Küresel regülasyon ve etik standartların revizyonu`,
      `${currentYear + 10}: Post-endüstriyel ekonomik modellere geçiş`,
    ],
  };
}
