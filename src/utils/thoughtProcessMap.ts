import { PredictionHistoryRecord, PredictionFeatureKey } from "./predictionHistory";

export type InfluenceType =
  | "thematic_drilldown"
  | "cross_module_spark"
  | "temporal_horizon_leap"
  | "scenario_counterfactual"
  | "direct_evolution";

export interface ThoughtInfluenceLink {
  id: string;
  sourceId: string;
  targetId: string;
  sourceRecord: PredictionHistoryRecord;
  targetRecord: PredictionHistoryRecord;
  influenceType: InfluenceType;
  influenceTitle: string;
  influenceDescription: string;
  weight: number; // 0.1 to 1.0
  timeDeltaHours: number;
  thematicOverlap: string[];
}

export interface CognitiveJourneySummary {
  archetypeTitle: string;
  archetypeDescription: string;
  primaryInquiryDriver: string;
  exploredYearSpan: { min: number; max: number; average: number };
  criticalPivotNodes: PredictionHistoryRecord[];
  thematicClusters: {
    category: string;
    count: number;
    color: string;
    percentage: number;
  }[];
  totalConnections: number;
  curiosityDivergenceScore: number; // 0 - 100
}

/**
 * Common keyword semantic dictionary to detect cross-query affinity
 */
const TOPIC_KEYWORDS: Record<string, string[]> = {
  ai_computing: ["yapay zeka", "ai", "agi", "asi", "kuantum", "çip", "işlemci", "algoritma", "ajan", "kodlama", "yazılım", "llm", "nöromorfik"],
  automation_career: ["meslek", "iş gücü", "istihdam", "otomasyon", "yazılımcı", "mühendis", "kariyer", "maaş", "adaptasyon", "beceri", "risk"],
  energy_environment: ["enerji", "füzyon", "nükleer", "batarya", "pil", "karbon", "iklim", "smr", "güneş", "şebeke", "elektrik"],
  biotech_transhumanism: ["biyo", "telomer", "yaşlanma", "sibernetik", "organ", "gen", "nöral", "bci", "beyin", "transhümanizm", "tıp", "sağlık"],
  space_economy: ["uzay", "koloni", "mars", "ay", "roket", "ekonomi", "finans", "kripto", "regülasyon", "toplum", "jeopolitik"],
};

/**
 * Analyzes two simulation records and determines if and how the earlier record influenced the later one
 */
function evaluateInfluence(
  older: PredictionHistoryRecord,
  newer: PredictionHistoryRecord
): {
  type: InfluenceType;
  title: string;
  description: string;
  weight: number;
  overlap: string[];
} | null {
  const olderText = `${older.queryTitle} ${older.queryInput.prompt || ""} ${older.tags.join(" ")} ${older.category}`.toLowerCase();
  const newerText = `${newer.queryTitle} ${newer.queryInput.prompt || ""} ${newer.tags.join(" ")} ${newer.category}`.toLowerCase();

  // Find shared topic keywords
  const matchedTopics: string[] = [];
  Object.entries(TOPIC_KEYWORDS).forEach(([topic, words]) => {
    const hasOlder = words.some((w) => olderText.includes(w));
    const hasNewer = words.some((w) => newerText.includes(w));
    if (hasOlder && hasNewer) {
      matchedTopics.push(topic);
    }
  });

  // Calculate shared tags
  const sharedTags = older.tags.filter((t) => newer.tags.some((nt) => nt.toLowerCase() === t.toLowerCase()));

  // Time difference in hours
  const hoursDiff = (new Date(newer.timestamp).getTime() - new Date(older.timestamp).getTime()) / (1000 * 60 * 60);

  // 1. Scenario Counterfactual link (e.g. baseline or optimistic followed by dystopian stress-test)
  if (
    (older.scenarioMode !== newer.scenarioMode && Math.abs(older.targetYear - newer.targetYear) <= 5) ||
    (older.featureKey === "ai_simulation" && newer.featureKey === "butterfly_effect")
  ) {
    return {
      type: "scenario_counterfactual",
      title: "Karşıt Senaryo Stres Testi",
      description: `'${older.targetYear}' odaklı simülasyonun ardından, sistemin kırılma veya karşıt senaryo dinamiklerini test eden derinleştirici sorgu tetiklendi.`,
      weight: 0.95,
      overlap: sharedTags.length > 0 ? sharedTags : ["Senaryo Kırılımı", `${older.targetYear} ➔ ${newer.targetYear}`],
    };
  }

  // 2. Cross-Module Spark (e.g. AI Simulator -> Job Risk Analyzer or Personal Roadmap)
  if (older.featureKey !== newer.featureKey && (matchedTopics.length > 0 || sharedTags.length > 0)) {
    return {
      type: "cross_module_spark",
      title: `${older.featureName} ➔ ${newer.featureName} Sıçraması`,
      description: `'${older.queryTitle.slice(0, 40)}...' çıktısındaki teknolojik sıçrama, '${newer.featureName}' modülünde stratejik bir alt sorgu başlattı.`,
      weight: 0.88,
      overlap: sharedTags.length > 0 ? sharedTags : ["Disiplinlerarası Geçiş"],
    };
  }

  // 3. Temporal Horizon Leap (e.g. 2029 -> 2035 -> 2045 evolution)
  if (newer.targetYear > older.targetYear && (matchedTopics.length > 0 || older.category === newer.category)) {
    return {
      type: "temporal_horizon_leap",
      title: `${older.targetYear} ➔ ${newer.targetYear} Zaman Ufku İlerlemesi`,
      description: `${older.targetYear} yılındaki temelin (${older.category}), ${newer.targetYear} yılındaki uzun vadeli yansımalarını inceleyen vizyon genişlemesi.`,
      weight: 0.82,
      overlap: sharedTags.length > 0 ? sharedTags : [`+${newer.targetYear - older.targetYear} Yıl Ufuk`],
    };
  }

  // 4. Thematic Drilldown (Same category / topic deep dive)
  if (matchedTopics.length > 0 || older.category === newer.category || sharedTags.length > 0) {
    return {
      type: "thematic_drilldown",
      title: "Kavramsal Derinleşme & İnceleme",
      description: `'${older.category}' ekseninde elde edilen veriler, bir sonraki detaylı simülasyon parametresini şekillendirdi.`,
      weight: 0.75,
      overlap: sharedTags.length > 0 ? sharedTags : [older.category],
    };
  }

  // 5. Direct Sequential Cognitive Chain (close in time)
  if (hoursDiff <= 48 && hoursDiff >= 0) {
    return {
      type: "direct_evolution",
      title: "Sıralı Bilişsel Zincir",
      description: `Kullanıcının ardışık düşünce akışı içerisinde birbirini besleyen keşif adımı.`,
      weight: 0.65,
      overlap: ["Sıralı Keşif"],
    };
  }

  return null;
}

/**
 * Builds the comprehensive Thought Process Influence Graph from simulation history
 */
export function buildThoughtProcessGraph(records: PredictionHistoryRecord[]): {
  nodes: PredictionHistoryRecord[];
  links: ThoughtInfluenceLink[];
  summary: CognitiveJourneySummary;
} {
  if (!records || records.length === 0) {
    return {
      nodes: [],
      links: [],
      summary: {
        archetypeTitle: "Gelecek Kaşifi (Henüz Veri Yok)",
        archetypeDescription: "Simülasyon geçmişiniz oluştukça bilişsel keşif haritanız burada haritalandırılacaktır.",
        primaryInquiryDriver: "Genel Teknolojik Merak",
        exploredYearSpan: { min: 2026, max: 2060, average: 2035 },
        criticalPivotNodes: [],
        thematicClusters: [],
        totalConnections: 0,
        curiosityDivergenceScore: 50,
      },
    };
  }

  // Sort chronological (oldest to newest for causal chain analysis)
  const sortedRecords = [...records].sort(
    (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
  );

  const links: ThoughtInfluenceLink[] = [];

  // Identify influential connections across historical sequence
  for (let i = 0; i < sortedRecords.length; i++) {
    const older = sortedRecords[i];

    // Check subsequent records (up to next 4 steps to avoid extreme clutter while retaining depth)
    for (let j = i + 1; j < Math.min(sortedRecords.length, i + 5); j++) {
      const newer = sortedRecords[j];
      const influence = evaluateInfluence(older, newer);

      if (influence) {
        const timeDiff =
          (new Date(newer.timestamp).getTime() - new Date(older.timestamp).getTime()) / (1000 * 60 * 60);

        links.push({
          id: `LINK-${older.id}-${newer.id}`,
          sourceId: older.id,
          targetId: newer.id,
          sourceRecord: older,
          targetRecord: newer,
          influenceType: influence.type,
          influenceTitle: influence.title,
          influenceDescription: influence.description,
          weight: influence.weight,
          timeDeltaHours: Math.max(0.1, Number(timeDiff.toFixed(1))),
          thematicOverlap: influence.overlap,
        });
      }
    }
  }

  // Calculate Thematic Clusters
  const categoryCounts: Record<string, number> = {};
  sortedRecords.forEach((r) => {
    categoryCounts[r.category] = (categoryCounts[r.category] || 0) + 1;
  });

  const categoryColorMap: Record<string, string> = {
    "Yapay Zeka & Bilişim": "#38bdf8",
    "Enerji & Çevre": "#fbbf24",
    "İnsan-Makine Arayüzü": "#c084fc",
    "Sosyoloji & Ekonomi": "#34d399",
    "Biyoteknoloji & Sağlık": "#f43f5e",
    "Uzay & Ulaşım": "#818cf8",
  };

  const thematicClusters = Object.entries(categoryCounts).map(([cat, count]) => ({
    category: cat,
    count,
    color: categoryColorMap[cat] || "#94a3b8",
    percentage: Math.round((count / sortedRecords.length) * 100),
  }));

  // Calculate Explored Years
  const years = sortedRecords.map((r) => r.targetYear);
  const minYear = Math.min(...years);
  const maxYear = Math.max(...years);
  const avgYear = Math.round(years.reduce((acc, y) => acc + y, 0) / years.length);

  // Determine Critical Pivot Nodes (nodes with highest outgoing or incoming connections, or high impact)
  const nodeLinkScores: Record<string, number> = {};
  links.forEach((l) => {
    nodeLinkScores[l.sourceId] = (nodeLinkScores[l.sourceId] || 0) + 1.5;
    nodeLinkScores[l.targetId] = (nodeLinkScores[l.targetId] || 0) + 1.0;
  });

  const criticalPivotNodes = sortedRecords
    .map((r) => ({
      record: r,
      score: (nodeLinkScores[r.id] || 0) + (r.metrics.impactLevel / 20) + (r.userEngagement.isBookmarked ? 3 : 0),
    }))
    .sort((a, b) => b.score - a.score)
    .slice(0, 3)
    .map((item) => item.record);

  // Compute User Cognitive Exploration Archetype
  let archetypeTitle = "Stratejik Teknoloji Vizyoneri";
  let archetypeDescription = "Farklı disiplinler ve zaman ufukları arasında mantıksal nedensellik bağları kurarak ilerleyen dengeli ve analitik bir düşünce rotası.";

  const hasJobRisk = sortedRecords.some((r) => r.featureKey === "job_risk");
  const hasButterfly = sortedRecords.some((r) => r.featureKey === "butterfly_effect");
  const hasTranshuman = sortedRecords.some((r) => r.category === "İnsan-Makine Arayüzü" || r.tags.includes("Sibernetik"));
  const hasEnergy = sortedRecords.some((r) => r.category === "Enerji & Çevre");

  if (hasButterfly && hasJobRisk) {
    archetypeTitle = "Kriz & Stres Testi Mimarı";
    archetypeDescription = "Sistemik riskleri, mesleki otomasyon tehditlerini ve alternatif kırılma senaryolarını titizlikle simüle eden proaktif savunma zihniyeti.";
  } else if (hasTranshuman && maxYear >= 2045) {
    archetypeTitle = "Post-Human & Singularity Kaşifi";
    archetypeDescription = "İnsan biyolojisinin sınırlarını, sibernetik evrimi ve 2045 sonrası zihin aktarımı olanaklarını keşfetmeye odaklanan ileri-fütürist.";
  } else if (hasJobRisk && sortedRecords.some((r) => r.featureKey === "personal_roadmap")) {
    archetypeTitle = "Kariyer Adaptasyon Stratejisti";
    archetypeDescription = "Yapay zeka çağında kişisel yeteneklerini dönüştürmek ve mesleki otomasyona karşı dirençli bir gelecek inşa etmek için çalışan eylem odaklı profil.";
  } else if (hasEnergy) {
    archetypeTitle = "Sürdürülebilirlik & Makro-Altyapı Analisti";
    archetypeDescription = "Teknolojik sıçramaların altında yatan enerji, hesaplama gücü ve fiziksel gezegen sınırlarını merkeze alan gerçekçi futurist.";
  }

  // Curiosity Divergence Score (measure of breadth across categories, modules and years)
  const uniqueCategories = new Set(sortedRecords.map((r) => r.category)).size;
  const uniqueFeatures = new Set(sortedRecords.map((r) => r.featureKey)).size;
  const yearSpread = maxYear - minYear;
  const curiosityDivergenceScore = Math.min(
    100,
    Math.round(uniqueCategories * 15 + uniqueFeatures * 12 + (yearSpread / 35) * 30)
  );

  return {
    nodes: sortedRecords,
    links,
    summary: {
      archetypeTitle,
      archetypeDescription,
      primaryInquiryDriver: thematicClusters[0]?.category || "Yapay Zeka & Bilişim",
      exploredYearSpan: { min: minYear, max: maxYear, average: avgYear },
      criticalPivotNodes,
      thematicClusters,
      totalConnections: links.length,
      curiosityDivergenceScore,
    },
  };
}
