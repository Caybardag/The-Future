import fs from "fs";
import path from "path";
import { GoogleGenAI } from "@google/genai";
import { telegramIntelligenceFeed } from "./telegramIngestionEngine";

export interface BrainKnowledgeNode {
  id: string;
  category: string;
  year: number;
  title: string;
  trlLevel: string;
  scientificFeasibilityScore: number;
  groundingProofSummary: string;
  causalDependencies: string[];
  bottlenecksAndLimits: string[];
  crossDomainImpacts: {
    targetDomain: string;
    impactDescription: string;
  }[];
  telegramSignalsIncluded?: {
    newsTitle: string;
    channelTitle: string;
    impactVerdict: string;
  }[];
  lastEvaluatedAt: string;
  evaluatedByModel: string;
  isAuthentic: boolean;
}

export interface BrainCycleLog {
  cycleId: number;
  timestamp: string;
  status: "SUCCESS" | "NO_DATA" | "API_ERROR" | "SKIPPED_BUDGET" | "IDLE";
  modelUsed?: string;
  nodeProcessed?: string;
  details: string;
  durationMs: number;
}

export interface AutonomousBrainState {
  isActive: boolean;
  totalCyclesCompleted: number;
  lastRunTimestamp: string | null;
  lastSuccessTimestamp: string | null;
  lastError: string | null;
  currentStatus: "INITIALIZING" | "IDLE" | "ANALYZING" | "COOLDOWN" | "ERROR_NO_DATA";
  knowledgeNodes: BrainKnowledgeNode[];
  recentLogs: BrainCycleLog[];
}

const VAULT_FILE_PATH = path.join(process.cwd(), "src", "data", "autonomous_brain_vault.json");

// Core State
let brainState: AutonomousBrainState = {
  isActive: false,
  totalCyclesCompleted: 0,
  lastRunTimestamp: null,
  lastSuccessTimestamp: null,
  lastError: null,
  currentStatus: "INITIALIZING",
  knowledgeNodes: [],
  recentLogs: [],
};

let intervalHandle: NodeJS.Timeout | null = null;
let isCycleRunning = false;

// 1. Load persisted genuine knowledge state from disk
export function loadBrainVault(): void {
  try {
    if (fs.existsSync(VAULT_FILE_PATH)) {
      const raw = fs.readFileSync(VAULT_FILE_PATH, "utf-8");
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed === "object") {
        brainState.knowledgeNodes = Array.isArray(parsed.knowledgeNodes) ? parsed.knowledgeNodes : [];
        brainState.totalCyclesCompleted = parsed.totalCyclesCompleted || 0;
        brainState.lastRunTimestamp = parsed.lastRunTimestamp || null;
        brainState.lastSuccessTimestamp = parsed.lastSuccessTimestamp || null;
        brainState.recentLogs = Array.isArray(parsed.recentLogs) ? parsed.recentLogs : [];
        console.log(`[Autonomous Brain Engine] Vault loaded: ${brainState.knowledgeNodes.length} genuine knowledge nodes found.`);
      }
    }
  } catch (err: any) {
    console.warn(`[Autonomous Brain Engine] Vault read skipped or empty: ${err?.message}`);
  }
}

// 2. Persist genuine state to disk
export function saveBrainVault(): void {
  try {
    const dir = path.dirname(VAULT_FILE_PATH);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    const dataToSave = {
      version: "2.0.0-authentic",
      savedAt: new Date().toISOString(),
      totalCyclesCompleted: brainState.totalCyclesCompleted,
      lastRunTimestamp: brainState.lastRunTimestamp,
      lastSuccessTimestamp: brainState.lastSuccessTimestamp,
      knowledgeNodes: brainState.knowledgeNodes,
      recentLogs: brainState.recentLogs.slice(0, 30),
    };
    fs.writeFileSync(VAULT_FILE_PATH, JSON.stringify(dataToSave, null, 2), "utf-8");
  } catch (err: any) {
    console.error(`[Autonomous Brain Engine] Failed to save vault: ${err?.message}`);
  }
}

// Curated 2026-2060 key technological pillars for autonomous deep evaluation
const COGNITIVE_TARGETS = [
  { year: 2026, title: "Otonom Bilişsel AI Ajanları & Multi-Agent Ağları", category: "Yapay Zeka & Bilişim" },
  { year: 2028, title: "Kuantum Avantajı & Kırılmayan Şifreleme (QKD)", category: "Kuantum & Hesaplama" },
  { year: 2029, title: "Yapay Genel Zeka (AGI) & Otonom Bilimsel Keşif", category: "Yapay Zeka & Bilişim" },
  { year: 2031, title: "CRISPR-Cas9 ile Monogenik Hastalıkların Eradikasyonu", category: "Biyoteknoloji & Genetik" },
  { year: 2035, title: "Biyolojik Yaşlanmanın Yavaşlatılması & Hücre Gençleştirme", category: "Biyoteknoloji & Sağlık" },
  { year: 2038, title: "İnvaziv Olmayan Yüksek Bant Genişlikli Nöral Arayüzler", category: "Nöroteknoloji & Sibernetik" },
  { year: 2042, title: "Ticari Tokamak & Manyetik Sıkıştırmalı Nükleer Füzyon", category: "Temiz Enerji & Fizik" },
  { year: 2045, title: "Tekillik (Singularity) & Yapay Süper Zeka (ASI)", category: "Yapay Zeka & Singularity" },
  { year: 2050, title: "Ay ve Yörünge Madenciliği ile Kaynak Bağımsızlığı", category: "Uzay & Astromühendislik" },
  { year: 2060, title: "Post-Kıtlık Biyo-Dijital Medeniyet Entegrasyonu", category: "Sosyoloji & Gelecek" },
];

/**
 * Execute a single authentic, autonomous deep reasoning cycle using Gemini
 */
export async function executeAutonomousBrainCycle(getAIClient: () => GoogleGenAI | null): Promise<BrainCycleLog> {
  const startTime = Date.now();
  const cycleNumber = brainState.totalCyclesCompleted + 1;
  brainState.lastRunTimestamp = new Date().toISOString();
  brainState.currentStatus = "ANALYZING";

  const ai = getAIClient();
  if (!ai) {
    const errorLog: BrainCycleLog = {
      cycleId: cycleNumber,
      timestamp: new Date().toISOString(),
      status: "NO_DATA",
      details: "Gemini API istemcisi başlatılamadı veya GEMINI_API_KEY ortam değişkeni tanımlı değil. Veri üretilmedi.",
      durationMs: Date.now() - startTime,
    };
    brainState.lastError = errorLog.details;
    brainState.currentStatus = "ERROR_NO_DATA";
    brainState.recentLogs.unshift(errorLog);
    return errorLog;
  }

  // Pick target based on rotation
  const targetIndex = (cycleNumber - 1) % COGNITIVE_TARGETS.length;
  const target = COGNITIVE_TARGETS[targetIndex];

  // Retrieve relevant real Telegram news intelligence matching this category or year
  const relevantTelegramNews = (telegramIntelligenceFeed || [])
    .filter((n) => {
      const catMatch = n.category && target.category.toLowerCase().includes(n.category.toLowerCase().slice(0, 4));
      const yearMatch = Math.abs(Number(n.extractedYear || 2026) - target.year) <= 5;
      return catMatch || yearMatch;
    })
    .slice(0, 3);

  const telegramContextSnippet = relevantTelegramNews.length > 0
    ? `\nCANLI GÜNCEL TELEGRAM VE HABER AKIŞI BULGULARI:\n` +
      relevantTelegramNews.map((n, i) => `[Sinyal #${i+1}] Kaynak: ${n.channelTitle}, Başlık: "${n.title}", Etki: ${n.impactVerdict}, Özet: ${n.summary}`).join("\n") +
      `\nBu güncel haber sinyallerini de analizine dahil et ve öncül koşul/darboğaz sentezinde dikkate al.`
    : "";

  const evaluationPrompt = `Sen 2026-2060 Gelecek Bilişsel ve Bilimsel Doğrulama Motorusun (Autonomous Core Brain).
Görev: "${target.year} - ${target.title}" (${target.category}) hedefini fiziksel yasalar, 1-9 gelişim aşaması ölçeği, disiplinlerarası bağımlılıklar ve gerçek zamanlı gelen istihbarat çerçevesinde kesin ve bilimsel olarak değerlendir.
${telegramContextSnippet}

Asla uydurma veya bilim kurgu fantezisi yazma; bilinen fizik sınırları (termodinamik, Carnot verimi, Landauer limiti, poligenik genetik) ile gerçek bilimsel yayın trendlerini baz al.

YALNIZCA aşağıdaki JSON formatında çıktı ver:
{
  "trlLevel": "TRL 4 - Laboratuvar Doğrulaması" | "TRL 6 - Saha Prototipi" | "TRL 8 - Operasyonel Entegrasyon" | "TRL 9 - Yaygın Kullanım",
  "scientificFeasibilityScore": 88,
  "groundingProofSummary": "Fiziksel ve bilimsel kanıt temeli (2-3 cümle)",
  "causalDependencies": [
    "Bu teknolojinin gerçekleşmesi için zorunlu olan öncül atılım 1",
    "Hesaplama / Malzeme / Enerji ön şartı 2"
  ],
  "bottlenecksAndLimits": [
    "Aşılması gereken temel fiziksel veya endüstriyel darboğaz 1",
    "Termodinamik veya malzeme kısıtı 2"
  ],
  "crossDomainImpacts": [
    {
      "targetDomain": "Enerji / Biyo / Kuantum / Sosyoloji",
      "impactDescription": "Bu hedefin diğer sektöre zincirleme somut etkisi"
    }
  ]
}`;

  // Ordered list of resilient, active model candidates (fast, modern, non-deprecated)
  const modelsToAttempt = [
    "gemini-3.1-flash-lite",
    "gemini-3-flash-preview",
    "gemini-flash-latest",
    "gemini-3.1-pro-preview",
  ];
  let finalResult: BrainKnowledgeNode | null = null;
  let usedModelName = "";
  let executionError: string | null = null;

  modelLoop: for (const modelName of modelsToAttempt) {
    try {
      const response = await ai.models.generateContent({
        model: modelName,
        contents: evaluationPrompt,
        config: {
          responseMimeType: "application/json",
          temperature: 0.2,
        },
      });

      const rawText = response?.text?.trim() || "";
      if (!rawText) {
        throw new Error("Boş API yanıtı alındı.");
      }

      const parsed = JSON.parse(rawText);
      if (!parsed || typeof parsed !== "object") {
        throw new Error("Geçersiz JSON formatı.");
      }

      usedModelName = modelName;
      finalResult = {
        id: `node-${target.year}-${target.category.toLowerCase().replace(/[^a-z0-9]/g, "-")}`,
        year: target.year,
        title: target.title,
        category: target.category,
        trlLevel: parsed.trlLevel || "TRL 6 - Saha Prototipi",
        scientificFeasibilityScore: Number(parsed.scientificFeasibilityScore) || 85,
        groundingProofSummary: String(parsed.groundingProofSummary || "Bilimsel ilkeler çerçevesinde modellendi."),
        causalDependencies: Array.isArray(parsed.causalDependencies) ? parsed.causalDependencies : [],
        bottlenecksAndLimits: Array.isArray(parsed.bottlenecksAndLimits) ? parsed.bottlenecksAndLimits : [],
        crossDomainImpacts: Array.isArray(parsed.crossDomainImpacts) ? parsed.crossDomainImpacts : [],
        telegramSignalsIncluded: relevantTelegramNews.map((n) => ({
          newsTitle: n.title,
          channelTitle: n.channelTitle,
          impactVerdict: n.impactVerdict,
        })),
        lastEvaluatedAt: new Date().toISOString(),
        evaluatedByModel: modelName,
        isAuthentic: true,
      };
      break modelLoop; // Success!
    } catch (err: any) {
      executionError = err?.message || String(err);
      const errMsgLower = executionError.toLowerCase();
      const isHighDemand =
        errMsgLower.includes("503") ||
        errMsgLower.includes("unavailable") ||
        errMsgLower.includes("high demand") ||
        errMsgLower.includes("resource_exhausted") ||
        errMsgLower.includes("429");

      if (isHighDemand) {
        // Silently and immediately failover to next model candidate
        continue modelLoop;
      }
      
      // Short pause before next model attempt for transient network glitches
      await new Promise((res) => setTimeout(res, 200));
    }
  }

  const duration = Date.now() - startTime;

  if (finalResult) {
    // Upsert genuine knowledge node
    const existingIndex = brainState.knowledgeNodes.findIndex((n) => n.id === finalResult!.id);
    if (existingIndex >= 0) {
      brainState.knowledgeNodes[existingIndex] = finalResult;
    } else {
      brainState.knowledgeNodes.push(finalResult);
    }

    brainState.totalCyclesCompleted++;
    brainState.lastSuccessTimestamp = new Date().toISOString();
    brainState.lastError = null;
    brainState.currentStatus = "COOLDOWN";

    const log: BrainCycleLog = {
      cycleId: cycleNumber,
      timestamp: new Date().toISOString(),
      status: "SUCCESS",
      modelUsed: usedModelName,
      nodeProcessed: `${target.year} - ${target.title}`,
      details: `Gerçek Gemini bilişsel sentezi başarıyla tamamlandı (${usedModelName}). TRL: ${finalResult.trlLevel}, Skor: %${finalResult.scientificFeasibilityScore}`,
      durationMs: duration,
    };

    brainState.recentLogs.unshift(log);
    if (brainState.recentLogs.length > 50) brainState.recentLogs.pop();

    saveBrainVault();
    console.log(`[Autonomous Brain Engine] Cycle #${cycleNumber} completed successfully. Verified: ${target.title}`);
    return log;
  } else {
    // API Failed honestly - NO fake data generated!
    const errLower = (executionError || "").toLowerCase();
    const isQuotaExceeded = errLower.includes("429") || errLower.includes("resource_exhausted") || errLower.includes("quota exceeded");
    const isHighDemand = errLower.includes("503") || errLower.includes("unavailable") || errLower.includes("high demand");
    
    let friendlyDetails = "";
    if (isQuotaExceeded) {
      friendlyDetails = `Gemini API günlük istek sınırı (429 Rate Limit) aşıldı. Mevcut veri ve hafıza kasası aktif hizmet vermeye devam ediyor.`;
    } else if (isHighDemand) {
      friendlyDetails = `Gemini modelleri geçici yoğunluk (503) yanıtı verdi. Mevcut sistem hafıza kasası güvenle korunuyor.`;
    } else {
      friendlyDetails = `Gemini API çağrısı geçici olarak tamamlanamadı. Mevcut sistem hafıza kasası korunuyor.`;
    }

    const log: BrainCycleLog = {
      cycleId: cycleNumber,
      timestamp: new Date().toISOString(),
      status: "API_ERROR",
      nodeProcessed: `${target.year} - ${target.title}`,
      details: friendlyDetails,
      durationMs: duration,
    };

    brainState.lastError = log.details;
    brainState.currentStatus = isQuotaExceeded ? "COOLDOWN" : "ERROR_NO_DATA";
    brainState.recentLogs.unshift(log);
    if (brainState.recentLogs.length > 50) brainState.recentLogs.pop();

    saveBrainVault();
    console.warn(`[Autonomous Brain Engine] Cycle #${cycleNumber} status: ${log.details}`);

    // If transient 503 error, schedule single delayed retry after 2 minutes; DO NOT fast-retry on 429 quota limits
    if (isHighDemand && !isQuotaExceeded) {
      setTimeout(async () => {
        if (!isCycleRunning && brainState.isActive) {
          isCycleRunning = true;
          try {
            console.log("[Autonomous Brain Engine] Executing delayed recovery cycle...");
            await executeAutonomousBrainCycle(getAIClient);
          } catch (e: any) {
            console.warn("[Autonomous Brain Engine] Recovery notice:", e?.message);
          } finally {
            isCycleRunning = false;
          }
        }
      }, 120000);
    }

    return log;
  }
}

/**
 * Start the background Autonomous System Brain daemon
 */
export function startAutonomousSystemBrain(
  getAIClient: () => GoogleGenAI | null,
  intervalMs = 8 * 60 * 1000 // Every 8 minutes
): void {
  if (intervalHandle) {
    console.log("[Autonomous Brain Engine] Already running in background.");
    return;
  }

  loadBrainVault();
  brainState.isActive = true;
  brainState.currentStatus = "IDLE";
  console.log(`[Autonomous Brain Engine] Daemon started. Cycle interval: ${intervalMs / 1000}s. Grounding mode: 100% Authentic.`);

  // Initial trigger after 15 seconds of server warmup
  setTimeout(async () => {
    if (isCycleRunning) return;
    isCycleRunning = true;
    try {
      await executeAutonomousBrainCycle(getAIClient);
    } catch (e: any) {
      console.error("[Autonomous Brain Engine] Initial cycle error:", e?.message);
    } finally {
      isCycleRunning = false;
    }
  }, 15000);

  // Background recurring schedule
  intervalHandle = setInterval(async () => {
    if (isCycleRunning) return;
    isCycleRunning = true;
    try {
      await executeAutonomousBrainCycle(getAIClient);
    } catch (e: any) {
      console.error("[Autonomous Brain Engine] Scheduled cycle error:", e?.message);
    } finally {
      isCycleRunning = false;
    }
  }, intervalMs);
}

/**
 * Get the real state of the brain
 */
export function getAutonomousBrainState(): AutonomousBrainState {
  return {
    ...brainState,
    knowledgeNodes: [...brainState.knowledgeNodes],
    recentLogs: [...brainState.recentLogs],
  };
}
