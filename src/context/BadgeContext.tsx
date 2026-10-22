import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { useAuth } from "./AuthContext";

export interface Badge {
  id: string;
  name: string;
  category: "Analiz" | "Simülasyon" | "Topluluk" | "Kariyer";
  iconName: string;
  description: string;
  requirementText: string;
  xpValue: number;
  unlocked: boolean;
  unlockedAt?: string;
  progress: number;
  maxProgress: number;
}

const INITIAL_BADGES: Badge[] = [
  {
    id: "badge_oracle",
    name: "Gelecek Kahini",
    category: "Simülasyon",
    iconName: "Sparkles",
    description: "Yapay Zeka ile ilk gelecek simülasyonunu veya tahmin projeksiyonunu çalıştırdınız.",
    requirementText: "1 kez Gelecek Projeksiyonu çalıştırın",
    xpValue: 150,
    unlocked: false,
    progress: 0,
    maxProgress: 1,
  },
  {
    id: "badge_analyst",
    name: "Teknoloji Analisti",
    category: "Analiz",
    iconName: "TrendingUp",
    description: "Trend analitiği, matrisler ve senaryo karşılaştırma modüllerini incelediniz.",
    requirementText: "Analitik ve Kıyaslama modüllerini ziyaret edin",
    xpValue: 100,
    unlocked: false,
    progress: 0,
    maxProgress: 2,
  },
  {
    id: "badge_time_traveler",
    name: "Zaman Yolcusu",
    category: "Simülasyon",
    iconName: "Zap",
    description: "2030-2060 insan modelleriyle canlı AI zaman personası sohbeti gerçekleştirdiniz.",
    requirementText: "Zaman Personası ile sohbet edin",
    xpValue: 200,
    unlocked: false,
    progress: 0,
    maxProgress: 1,
  },
  {
    id: "badge_butterfly",
    name: "Kelebek Mimarisi",
    category: "Simülasyon",
    iconName: "GitMerge",
    description: "Alternatif tarih ve kırılma noktalarını kelebek etkisi simülatöründe test ettiniz.",
    requirementText: "1 kez Kelebek Etkisi Simülasyonu yapın",
    xpValue: 180,
    unlocked: false,
    progress: 0,
    maxProgress: 1,
  },
  {
    id: "badge_career_strategist",
    name: "Kariyer Stratejisti",
    category: "Kariyer",
    iconName: "ShieldAlert",
    description: "Mesleğinizin 2026-2060 arası otomasyon risk raporunu sorguladınız.",
    requirementText: "Meslek Otomasyon Raporu oluşturun",
    xpValue: 250,
    unlocked: false,
    progress: 0,
    maxProgress: 1,
  },
  {
    id: "badge_causality",
    name: "Nedensellik Kaşifi",
    category: "Analiz",
    iconName: "Network",
    description: "Nedensellik ağında olaylar arasındaki domino etkilerini ve ilişkileri incelediniz.",
    requirementText: "Nedensellik Ağını keşfedin",
    xpValue: 120,
    unlocked: false,
    progress: 0,
    maxProgress: 1,
  },
  {
    id: "badge_community",
    name: "Topluluk Lideri",
    category: "Topluluk",
    iconName: "Users",
    description: "Gelecek tahmin oylamalarına katıldınız veya yeni bir milestone önerisi sundunuz.",
    requirementText: "3 tahmine oy verin veya öneride bulunun",
    xpValue: 150,
    unlocked: false,
    progress: 0,
    maxProgress: 3,
  },
  {
    id: "badge_early_predictor",
    name: "Erken Öngörücü",
    category: "Simülasyon",
    iconName: "Compass",
    description: "Zaman çizelgesindeki en az 5 farklı gelecek olayını detaylıca incelediniz.",
    requirementText: "5 farklı milestone detayına bakın",
    xpValue: 100,
    unlocked: false,
    progress: 0,
    maxProgress: 5,
  },
  {
    id: "badge_verifier",
    name: "Gelecek Hakemi & Doğrulayıcısı",
    category: "Topluluk",
    iconName: "ShieldCheck",
    description: "Otonom AI Bilimsel Kanıt Teyit modülünde onaylı bir akademik/teknik kaynak doğrulaması tescillediniz.",
    requirementText: "1 onaylı bilimsel kanıt teyit edin",
    xpValue: 300,
    unlocked: false,
    progress: 0,
    maxProgress: 1,
  },
];

interface BadgeToastInfo {
  badge: Badge;
  isGuest: boolean;
}

interface BadgeContextType {
  badges: Badge[];
  unlockedCount: number;
  totalXp: number;
  lastUnlockedBadgeToast: BadgeToastInfo | null;
  dismissBadgeToast: () => void;
  triggerActivity: (actionType: string) => void;
  resetBadgesProgress: () => void;
}

const BadgeContext = createContext<BadgeContextType | undefined>(undefined);

export const BadgeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { currentUser } = useAuth();
  const currentUserRef = React.useRef(currentUser);
  currentUserRef.current = currentUser;

  const [badges, setBadges] = useState<Badge[]>(() => {
    try {
      const saved = localStorage.getItem("future_user_badges");
      if (saved) return JSON.parse(saved);
    } catch (e) {
      // fallback
    }
    return INITIAL_BADGES;
  });

  const [lastUnlockedBadgeToast, setLastUnlockedBadgeToast] = useState<BadgeToastInfo | null>(null);

  // Sync to localStorage
  useEffect(() => {
    try {
      localStorage.setItem("future_user_badges", JSON.stringify(badges));
    } catch (e) {
      // storage error
    }
  }, [badges]);

  const triggerActivity = useCallback((actionType: string) => {
    setBadges((prevBadges) => {
      let newlyUnlockedBadge: Badge | null = null;
      let hasChange = false;

      const updatedBadges = prevBadges.map((b) => {
        if (b.unlocked) return b;

        let inc = 0;
        if (actionType === "run_ai_sim" && b.id === "badge_oracle") inc = 1;
        if (actionType === "visit_analytics" && b.id === "badge_analyst") inc = 1;
        if (actionType === "chat_persona" && b.id === "badge_time_traveler") inc = 1;
        if (actionType === "run_butterfly" && b.id === "badge_butterfly") inc = 1;
        if (actionType === "run_job_risk" && b.id === "badge_career_strategist") inc = 1;
        if (actionType === "visit_network" && b.id === "badge_causality") inc = 1;
        if (actionType === "vote_community" && b.id === "badge_community") inc = 1;
        if (actionType === "view_milestone_detail" && b.id === "badge_early_predictor") inc = 1;
        if (actionType === "verify_evidence" && b.id === "badge_verifier") inc = 1;

        if (inc > 0) {
          const newProgress = Math.min(b.maxProgress, b.progress + inc);
          if (newProgress !== b.progress) {
            hasChange = true;
            const isNewlyUnlocked = newProgress >= b.maxProgress;

            if (isNewlyUnlocked) {
              const unlockedItem: Badge = {
                ...b,
                progress: newProgress,
                unlocked: true,
                unlockedAt: new Date().toLocaleDateString("tr-TR"),
              };
              newlyUnlockedBadge = unlockedItem;
              return unlockedItem;
            }

            return { ...b, progress: newProgress };
          }
        }

        return b;
      });

      if (!hasChange) {
        return prevBadges;
      }

      if (newlyUnlockedBadge) {
        // Badges are unlocked silently without screen-covering popup notifications
        setLastUnlockedBadgeToast(null);
      }

      return updatedBadges;
    });
  }, []);

  const dismissBadgeToast = useCallback(() => {
    setLastUnlockedBadgeToast(null);
  }, []);

  const resetBadgesProgress = useCallback(() => {
    setBadges(INITIAL_BADGES);
    localStorage.removeItem("future_user_badges");
  }, []);

  const unlockedCount = badges.filter((b) => b.unlocked).length;
  const totalXp = badges
    .filter((b) => b.unlocked)
    .reduce((sum, b) => sum + b.xpValue, 0);

  return (
    <BadgeContext.Provider
      value={{
        badges,
        unlockedCount,
        totalXp,
        lastUnlockedBadgeToast,
        dismissBadgeToast,
        triggerActivity,
        resetBadgesProgress,
      }}
    >
      {children}
    </BadgeContext.Provider>
  );
};

export const useBadges = (): BadgeContextType => {
  const context = useContext(BadgeContext);
  if (!context) {
    throw new Error("useBadges must be used within a BadgeProvider");
  }
  return context;
};
