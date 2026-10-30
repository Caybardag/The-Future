import React from "react";

export interface ContextAwareOrchestratorProps {
  currentView?: string;
  onContextChange?: (context: any) => void;
}

export const ContextAwareOrchestrator: React.FC<ContextAwareOrchestratorProps> = () => {
  return null;
};
