import React from "react";
import { Milestone, ScenarioMode } from "../types";
import { AIGeneratedStatisticsView } from "./AIGeneratedStatisticsView";

interface AnalyticsViewProps {
  milestones: Milestone[];
  scenarioMode?: ScenarioMode;
  onNavigateToMilestone?: (year: number) => void;
}

export const AnalyticsView: React.FC<AnalyticsViewProps> = ({
  milestones,
  scenarioMode = "baseline",
  onNavigateToMilestone,
}) => {
  return (
    <AIGeneratedStatisticsView
      milestones={milestones}
      initialScenario={scenarioMode}
      onNavigateToMilestone={onNavigateToMilestone}
    />
  );
};
