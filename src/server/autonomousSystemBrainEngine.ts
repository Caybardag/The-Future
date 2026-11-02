import { getValidatedFutureState, runAutonomousCalendarReasoningCycle } from "./futureReasoningEngine";
import { TIMELINE_DATA } from "../data/timelineData";

export interface AutonomousBrainState {
  isRunning: boolean;
  cycleCount: number;
  lastCycleAt?: string;
  knowledgeNodes: {
    year: number;
    title: string;
    summary: string;
    analyzedAt: string;
    relevanceIndex: number;
  }[];
  activeHypotheses: string[];
}

let cycleCount = 1;
let isRunning = false;
let lastCycleAt = new Date().toISOString();
let brainInterval: any = null;

export function getAutonomousBrainState(): AutonomousBrainState {
  const futureState = getValidatedFutureState();
  const assessments = Object.values(futureState.assessments || {});

  let knowledgeNodes: AutonomousBrainState["knowledgeNodes"] = [];
  let activeHypotheses: string[] = [];

  if (assessments.length > 0) {
    // Derive real knowledge nodes from the latest reasoned assessments
    knowledgeNodes = assessments.slice(0, 10).map((a) => {
      const year = a.year || Number(String(a.calendarItemId).replace(/\D/g, "")) || 2026;
      return {
        year,
        title: a.title,
        summary: a.currentAssessment?.content || a.reasoning || "Doğrulanmış kanıt analizi",
        analyzedAt: a.evaluatedAt || new Date().toISOString(),
        relevanceIndex: a.currentAssessment?.confidence || 80,
      };
    });

    activeHypotheses = assessments
      .filter((a) => a.status === "UNCERTAIN" || a.status === "REVISED")
      .slice(0, 5)
      .map((a) => `${a.year || ""}: ${a.title} - ${a.reasoning.slice(0, 80)}...`);
  }

  // Baseline fallback if no assessments are ready yet
  if (knowledgeNodes.length === 0) {
    knowledgeNodes = TIMELINE_DATA.slice(0, 5).map((m) => ({
      year: m.year,
      title: m.title,
      summary: m.description,
      analyzedAt: new Date().toISOString(),
      relevanceIndex: m.probability,
    }));
    activeHypotheses = [
      "Kuantum koherans süresinde 2030 öncesi 10x artış ve PQC entegrasyonu",
      "Biyo-dijital arayüzlerde non-invaziv standartlaşma ve klinik faz denemeleri",
    ];
  }

  return {
    isRunning,
    cycleCount,
    lastCycleAt,
    knowledgeNodes,
    activeHypotheses,
  };
}

export async function executeAutonomousBrainCycle(getAiFn?: () => any): Promise<{ success: boolean; nodesProcessed: number }> {
  cycleCount += 1;
  lastCycleAt = new Date().toISOString();

  try {
    if (getAiFn) {
      await runAutonomousCalendarReasoningCycle(getAiFn, false);
    }
  } catch (err) {
    console.warn("[AutonomousSystemBrain] Cycle execution notice:", err);
  }

  const currentState = getAutonomousBrainState();
  return { success: true, nodesProcessed: currentState.knowledgeNodes.length };
}

export function startAutonomousSystemBrain(getAiFn: () => any, intervalMs: number = 300000): void {
  if (isRunning) return;
  isRunning = true;
  executeAutonomousBrainCycle(getAiFn).catch(() => {});
  brainInterval = setInterval(() => {
    executeAutonomousBrainCycle(getAiFn).catch(() => {});
  }, intervalMs);
}
