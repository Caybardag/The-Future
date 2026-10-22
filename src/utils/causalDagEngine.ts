import { Milestone, SubMilestoneBranch, DetailedParametricAuditResult } from "../types";

export interface DagNode {
  id: string;
  year: number;
  originalYear: number;
  adjustedYear: number;
  title: string;
  category: string;
  baseProbability: number;
  dynamicProbability: number;
  trlLevel: number; // 1 - 9
  isBottleneck: boolean;
  bottleneckSeverity: number; // 0.0 to 1.0
  dependencyType?: "prerequisite" | "breakthrough_trigger" | "engineering_bottleneck" | "emergent_domain";
  parents: string[]; // prerequisite node IDs
  children: string[]; // downstream node IDs
  disciplineParameters?: {
    name: string;
    feasibility: number;
    isBottleneck: boolean;
  }[];
  accelerationBoost: number; // user or R&D boost in %
}

export interface DagEdge {
  from: string;
  to: string;
  type: "prerequisite" | "trigger" | "bottleneck_coupling";
  weight: number; // 0.0 to 1.0 (influence weight)
  minLeadTimeYears: number;
}

export interface DagPropagationResult {
  nodes: Record<string, DagNode>;
  edges: DagEdge[];
  criticalPath: string[];
  systemEntropy: number;
  totalBottlenecksCount: number;
  averageFeasibilityScore: number;
  driftSummary: {
    acceleratedCount: number;
    delayedCount: number;
    onTrackCount: number;
    maxYearShift: number;
  };
}

/**
 * Builds and mathematically propagates a causal DAG network across milestones and sub-branches
 */
export function buildAndPropagateCausalDag(
  milestones: Milestone[],
  dynamicBranches: Record<number, SubMilestoneBranch[]> = {},
  userAccelerations: Record<string, number> = {},
  resolvedBottlenecks: Record<string, boolean> = {}
): DagPropagationResult {
  const nodes: Record<string, DagNode> = {};
  const edges: DagEdge[] = [];

  // 1. Initialize primary milestone nodes
  milestones.forEach((m) => {
    const nodeId = `milestone-${m.year}`;
    const boost = userAccelerations[nodeId] || 0;
    const baseProb = m.probability || 75;

    nodes[nodeId] = {
      id: nodeId,
      year: m.year,
      originalYear: m.year,
      adjustedYear: m.year,
      title: m.title,
      category: m.category || "Genel",
      baseProbability: baseProb,
      dynamicProbability: baseProb,
      trlLevel: m.year <= 2026 ? 8 : Math.max(2, 9 - Math.floor((m.year - 2026) / 4)),
      isBottleneck: false,
      bottleneckSeverity: 0,
      parents: [],
      children: [],
      accelerationBoost: boost,
    };
  });

  // 2. Connect primary milestone sequential & related edges
  const sortedMilestones = [...milestones].sort((a, b) => a.year - b.year);
  for (let i = 0; i < sortedMilestones.length; i++) {
    const current = sortedMilestones[i];
    const currentId = `milestone-${current.year}`;

    // Explicit related years
    if (current.relatedYears && current.relatedYears.length > 0) {
      current.relatedYears.forEach((rYear) => {
        const targetId = `milestone-${rYear}`;
        if (nodes[targetId] && rYear > current.year) {
          edges.push({
            from: currentId,
            to: targetId,
            type: "prerequisite",
            weight: 0.75,
            minLeadTimeYears: Math.max(1, Math.min(3, rYear - current.year)),
          });
          if (!nodes[currentId].children.includes(targetId)) nodes[currentId].children.push(targetId);
          if (!nodes[targetId].parents.includes(currentId)) nodes[targetId].parents.push(currentId);
        }
      });
    }

    // Direct temporal sequence edge if close and same/cross category
    if (i < sortedMilestones.length - 1) {
      const next = sortedMilestones[i + 1];
      const nextId = `milestone-${next.year}`;
      const gap = next.year - current.year;
      if (gap <= 4) {
        if (!edges.some((e) => e.from === currentId && e.to === nextId)) {
          edges.push({
            from: currentId,
            to: nextId,
            type: "trigger",
            weight: 0.5,
            minLeadTimeYears: Math.max(1, gap),
          });
          if (!nodes[currentId].children.includes(nextId)) nodes[currentId].children.push(nextId);
          if (!nodes[nextId].parents.includes(currentId)) nodes[nextId].parents.push(currentId);
        }
      }
    }
  }

  // 3. Inject Recursive Sub-Milestone Branches into the mathematical graph
  Object.entries(dynamicBranches).forEach(([parentYearStr, branches]) => {
    const parentYear = parseInt(parentYearStr, 10);
    const parentId = `milestone-${parentYear}`;

    branches.forEach((b) => {
      const branchId = b.id || `branch-${parentYear}-${b.year}-${b.title.slice(0, 10)}`;
      const isResolved = resolvedBottlenecks[branchId] || false;
      const boost = userAccelerations[branchId] || 0;
      const hasBottleneckParam = b.criticalParameters?.some((p) => p.isBottleneck) || b.dependencyType === "engineering_bottleneck";

      nodes[branchId] = {
        id: branchId,
        year: b.year,
        originalYear: b.year,
        adjustedYear: b.year,
        title: b.title,
        category: b.category,
        baseProbability: b.probability || 80,
        dynamicProbability: b.probability || 80,
        trlLevel: b.trlLevel || 5,
        isBottleneck: hasBottleneckParam && !isResolved,
        bottleneckSeverity: hasBottleneckParam && !isResolved ? 0.35 : 0.05,
        dependencyType: b.dependencyType,
        parents: [],
        children: [],
        disciplineParameters: (b.criticalParameters || []).map((cp) => ({
          name: cp.name,
          feasibility: cp.isBottleneck ? 55 : 90,
          isBottleneck: cp.isBottleneck && !isResolved,
        })),
        accelerationBoost: boost,
      };

      // Connect with parent node based on dependencyType
      if (nodes[parentId]) {
        if (b.dependencyType === "prerequisite" || b.dependencyType === "engineering_bottleneck") {
          // Branch is prerequisite to parent milestone
          edges.push({
            from: branchId,
            to: parentId,
            type: b.dependencyType === "engineering_bottleneck" ? "bottleneck_coupling" : "prerequisite",
            weight: b.dependencyType === "engineering_bottleneck" ? 0.9 : 0.7,
            minLeadTimeYears: Math.max(1, parentYear - b.year),
          });
          nodes[branchId].children.push(parentId);
          nodes[parentId].parents.push(branchId);
        } else {
          // Branch is triggered by parent milestone
          edges.push({
            from: parentId,
            to: branchId,
            type: "trigger",
            weight: 0.8,
            minLeadTimeYears: Math.max(1, b.year - parentYear),
          });
          nodes[parentId].children.push(branchId);
          nodes[branchId].parents.push(parentId);
        }
      }
    });
  });

  // 4. Mathematical Topological Sorting & Forward Causal Propagation
  const inDegree: Record<string, number> = {};
  Object.keys(nodes).forEach((k) => (inDegree[k] = 0));
  edges.forEach((e) => {
    if (inDegree[e.to] !== undefined) {
      inDegree[e.to]++;
    }
  });

  const queue: string[] = Object.keys(nodes).filter((k) => inDegree[k] === 0);
  const topologicalOrder: string[] = [];

  while (queue.length > 0) {
    const curr = queue.shift()!;
    topologicalOrder.push(curr);

    const outgoing = edges.filter((e) => e.from === curr);
    outgoing.forEach((e) => {
      inDegree[e.to]--;
      if (inDegree[e.to] === 0) {
        queue.push(e.to);
      }
    });
  }

  // Handle any potential cyclic references smoothly by appending remaining
  Object.keys(nodes).forEach((k) => {
    if (!topologicalOrder.includes(k)) topologicalOrder.push(k);
  });

  // 5. Compute Mathematical Probability & Timeline Shock Drift Propagation
  let acceleratedCount = 0;
  let delayedCount = 0;
  let onTrackCount = 0;
  let maxYearShift = 0;
  let totalFeasibilitySum = 0;
  let totalBottlenecksCount = 0;

  topologicalOrder.forEach((nodeId) => {
    const node = nodes[nodeId];
    if (!node) return;

    let parentInfluenceMultiplier = 1.0;
    let minEarliestYear = node.originalYear;

    const incomingEdges = edges.filter((e) => e.to === nodeId);

    if (incomingEdges.length > 0) {
      let weightedSum = 0;
      let totalWeight = 0;

      incomingEdges.forEach((edge) => {
        const parentNode = nodes[edge.from];
        if (!parentNode) return;

        const parentProbNorm = parentNode.dynamicProbability / 100;
        weightedSum += parentProbNorm * edge.weight;
        totalWeight += edge.weight;

        // Timeline causality enforcement: downstream must not precede prerequisite resolved time
        const requiredArrival = parentNode.adjustedYear + edge.minLeadTimeYears;
        if (requiredArrival > minEarliestYear) {
          minEarliestYear = requiredArrival;
        }
      });

      if (totalWeight > 0) {
        parentInfluenceMultiplier = weightedSum / totalWeight;
      }
    }

    // Apply bottleneck degradation penalty
    const bottleneckPenalty = node.isBottleneck ? node.bottleneckSeverity : 0.0;
    if (node.isBottleneck) totalBottlenecksCount++;

    // Acceleration boost (R&D investment / user priority)
    const boostMultiplier = 1.0 + node.accelerationBoost / 100;

    // Mathematical formula: P_dyn = P_base * (ParentProb)^0.6 * (1 - BottleneckPenalty) * Boost
    let computedProbability =
      node.baseProbability *
      Math.pow(parentInfluenceMultiplier, 0.55) *
      (1.0 - bottleneckPenalty) *
      boostMultiplier;

    computedProbability = Math.max(5, Math.min(99, Math.round(computedProbability)));
    node.dynamicProbability = computedProbability;

    // Timeline drift adjustment:
    // If probability >= 88 and boosted -> can accelerate by 1-2 years
    // If bottleneck is critical or parent is delayed -> delayed by 1-3 years
    let yearDrift = 0;
    if (node.isBottleneck) {
      yearDrift += Math.ceil(node.bottleneckSeverity * 4);
    }
    if (node.accelerationBoost >= 20) {
      yearDrift -= Math.floor(node.accelerationBoost / 25);
    }

    const calculatedAdjustedYear = Math.max(minEarliestYear + yearDrift, 2026);
    node.adjustedYear = calculatedAdjustedYear;

    const shift = node.adjustedYear - node.originalYear;
    if (Math.abs(shift) > maxYearShift) maxYearShift = Math.abs(shift);

    if (shift < 0) acceleratedCount++;
    else if (shift > 0) delayedCount++;
    else onTrackCount++;

    totalFeasibilitySum += node.dynamicProbability;
  });

  // 6. Find Critical Path (Longest Path in terms of bottleneck & timeline impact)
  const criticalPath: string[] = [];
  let highestImpactNodeId = Object.keys(nodes).reduce((maxId, currentId) => {
    const node = nodes[currentId];
    const maxNode = nodes[maxId];
    const score = (node.isBottleneck ? 50 : 0) + (node.adjustedYear - node.originalYear) * 10;
    const maxScore = (maxNode?.isBottleneck ? 50 : 0) + ((maxNode?.adjustedYear || 0) - (maxNode?.originalYear || 0)) * 10;
    return score > maxScore ? currentId : maxId;
  }, Object.keys(nodes)[0] || "");

  if (highestImpactNodeId && nodes[highestImpactNodeId]) {
    criticalPath.push(highestImpactNodeId);
    let curr: string | undefined = highestImpactNodeId;
    while (curr && nodes[curr]?.parents.length > 0) {
      curr = nodes[curr].parents[0];
      if (curr && !criticalPath.includes(curr)) {
        criticalPath.unshift(curr);
      } else {
        break;
      }
    }
  }

  const nodeCount = Object.keys(nodes).length || 1;
  const averageFeasibilityScore = Math.round(totalFeasibilitySum / nodeCount);
  const systemEntropy = Math.round(
    ((totalBottlenecksCount * 18 + maxYearShift * 8) / (nodeCount + 10)) * 100
  ) / 100;

  return {
    nodes,
    edges,
    criticalPath,
    systemEntropy: Math.min(1.0, Math.max(0.05, systemEntropy)),
    totalBottlenecksCount,
    averageFeasibilityScore,
    driftSummary: {
      acceleratedCount,
      delayedCount,
      onTrackCount,
      maxYearShift,
    },
  };
}
