import React, { createContext, useContext, useState, useEffect, useCallback } from "react";

export interface BadgeItem {
  id: string;
  title: string;
  description: string;
  icon: string;
  category: "explorer" | "scholar" | "decision" | "community";
  unlocked: boolean;
  unlockedAt?: string;
  xpReward: number;
}

const DEFAULT_BADGES: BadgeItem[] = [
  { id: "first_exploration", title: "Zaman Gezgini", description: "İlk teknolojik kırılmayı detaylı inceledin.", icon: "Compass", category: "explorer", unlocked: true, xpReward: 50 },
  { id: "quantum_curious", title: "Kuantum Kaşifi", description: "Kuantum teknolojileri ve kriptografi dönüm noktalarını analiz ettin.", icon: "Cpu", category: "scholar", unlocked: true, xpReward: 75 },
  { id: "decision_maker", title: "Geleceğin Mimarı", description: "İlk kişisel kariyer ve strateji kararını kaydettin.", icon: "Award", category: "decision", unlocked: false, xpReward: 100 },
  { id: "community_voice", title: "Vizyon Paylaşımı", description: "Topluluk havuzuna doğrulanabilir bir teknoloji gelişmesi ekledin.", icon: "Sparkles", category: "community", unlocked: false, xpReward: 120 },
];

interface BadgeContextType {
  badges: BadgeItem[];
  unlockedCount: number;
  totalXp: number;
  triggerActivity: (activityType: string, meta?: any) => void;
  unlockBadge: (badgeId: string) => void;
}

const BadgeContext = createContext<BadgeContextType | undefined>(undefined);

export const BadgeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [badges, setBadges] = useState<BadgeItem[]>(() => {
    try {
      const saved = localStorage.getItem("future_timeline_badges");
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return DEFAULT_BADGES;
  });

  const unlockBadge = useCallback((badgeId: string) => {
    setBadges((prev) => {
      const updated = prev.map((b) => (b.id === badgeId ? { ...b, unlocked: true, unlockedAt: new Date().toISOString() } : b));
      try {
        localStorage.setItem("future_timeline_badges", JSON.stringify(updated));
      } catch (e) {}
      return updated;
    });
  }, []);

  const triggerActivity = useCallback((activityType: string, meta?: any) => {
    if (activityType === "explore_milestone") unlockBadge("first_exploration");
    if (activityType === "make_decision") unlockBadge("decision_maker");
    if (activityType === "add_community_signal") unlockBadge("community_voice");
  }, [unlockBadge]);

  const unlockedCount = badges.filter((b) => b.unlocked).length;
  const totalXp = badges.filter((b) => b.unlocked).reduce((sum, b) => sum + b.xpReward, 0);

  return (
    <BadgeContext.Provider value={{ badges, unlockedCount, totalXp, triggerActivity, unlockBadge }}>
      {children}
    </BadgeContext.Provider>
  );
};

export function useBadges() {
  const ctx = useContext(BadgeContext);
  if (!ctx) {
    return {
      badges: DEFAULT_BADGES,
      unlockedCount: 2,
      totalXp: 125,
      triggerActivity: () => {},
      unlockBadge: () => {},
    };
  }
  return ctx;
}
