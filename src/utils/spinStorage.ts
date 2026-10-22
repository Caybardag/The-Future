import { WheelSegment } from "../components/DailyFutureSpinWheel";

export interface FutureCollectionItem {
  id: string;
  title: string;
  subtitle: string;
  category: "Biyoteknoloji" | "Kuantum" | "Yapay Zeka" | "Uzay & Enerji" | "Kredi Bonusu";
  rarity: "Efsanevi" | "Epik" | "Nadir" | "Sıradan";
  iconName: string;
  description: string;
  storyLore: string;
  techTimelineYear: string;
  creditAmount: number;
  xpAmount: number;
  wonAt: string;
}

export interface SpinAnalytics {
  totalSpins: number;
  lastSpinDate: string;
  totalCreditsWon: number;
  totalXpWon: number;
  currentStreak: number;
  unlockedItemsCount: number;
  isWheelOracle: boolean; // Special badge tag trigger
}

const DEFAULT_COLLECTION_ITEMS: FutureCollectionItem[] = [
  {
    id: "col_default_1",
    title: "2045 Biyo-Dijital Bilinç Yedeği",
    subtitle: "Post-Human Mimari & Nöronal Haritalama",
    category: "Biyoteknoloji",
    rarity: "Efsanevi",
    iconName: "Brain",
    description: "Nöronal sinaps haritalama ve BCI teknolojisi sayesinde insan belleği ve kişiliği kuantum güvenli ortama aktarılıyor.",
    storyLore: "2045 yılında ilk kez insan sinaps haritası kayıpsız dijital ortama aktarıldı. Bu teknoloji kartı, zihinsel mirasın sonsuza dek korunmasını temsil eder.",
    techTimelineYear: "2045",
    creditAmount: 45,
    xpAmount: 100,
    wonAt: "2026-08-01",
  },
  {
    id: "col_default_2",
    title: "2032 Kuantum Nöro-Arayüz Kırılması",
    subtitle: "Düşünce Hızıyla Cihaz Kontrolü",
    category: "Kuantum",
    rarity: "Epik",
    iconName: "Atom",
    description: "Kuantum fotonik sensörler ile kafa derisine yerleştirilen zararsız çipler, düşünceleri doğrudan kod komutuna dönüştürür.",
    storyLore: "2032'de geliştirilen non-invaziv BCI çipler, insan ve yapay zeka arasındaki iletişim gecikmesini sıfıra indirdi.",
    techTimelineYear: "2032",
    creditAmount: 35,
    xpAmount: 100,
    wonAt: "2026-08-03",
  },
];

const COLLECTION_KEY = "future_unlocked_collections";
const ANALYTICS_KEY = "future_spin_analytics";

export const getCollectionItems = (): FutureCollectionItem[] => {
  try {
    const raw = localStorage.getItem(COLLECTION_KEY);
    if (!raw) {
      localStorage.setItem(COLLECTION_KEY, JSON.stringify(DEFAULT_COLLECTION_ITEMS));
      return DEFAULT_COLLECTION_ITEMS;
    }
    return JSON.parse(raw);
  } catch (e) {
    return DEFAULT_COLLECTION_ITEMS;
  }
};

export const saveCollectionItem = (item: FutureCollectionItem): FutureCollectionItem[] => {
  const current = getCollectionItems();
  // Prevent duplicate ids if won multiple times; append unique timestamp
  const exists = current.some((c) => c.id === item.id);
  const newItem = exists ? { ...item, id: `${item.id}_${Date.now()}` } : item;

  const updated = [newItem, ...current];
  localStorage.setItem(COLLECTION_KEY, JSON.stringify(updated));
  return updated;
};

export const getSpinAnalytics = (): SpinAnalytics => {
  try {
    const raw = localStorage.getItem(ANALYTICS_KEY);
    if (!raw) {
      const initial: SpinAnalytics = {
        totalSpins: 2,
        lastSpinDate: "2026-08-01",
        totalCreditsWon: 80,
        totalXpWon: 200,
        currentStreak: 2,
        unlockedItemsCount: 2,
        isWheelOracle: true,
      };
      localStorage.setItem(ANALYTICS_KEY, JSON.stringify(initial));
      return initial;
    }
    return JSON.parse(raw);
  } catch (e) {
    return {
      totalSpins: 0,
      lastSpinDate: "",
      totalCreditsWon: 0,
      totalXpWon: 0,
      currentStreak: 0,
      unlockedItemsCount: 0,
      isWheelOracle: false,
    };
  }
};

export const recordSpinEvent = (segment: WheelSegment, item?: FutureCollectionItem): SpinAnalytics => {
  const current = getSpinAnalytics();
  const today = new Date().toISOString().split("T")[0];

  const newTotalSpins = current.totalSpins + 1;
  const newCreditsWon = current.totalCreditsWon + segment.creditAmount;
  const newXpWon = current.totalXpWon + segment.xpAmount;
  
  // Calculate streak
  let newStreak = current.currentStreak;
  if (current.lastSpinDate) {
    const lastDate = new Date(current.lastSpinDate);
    const currentDate = new Date(today);
    const diffTime = Math.abs(currentDate.getTime() - lastDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) {
      newStreak += 1;
    } else if (diffDays > 1) {
      newStreak = 1;
    }
  } else {
    newStreak = 1;
  }

  if (item) {
    saveCollectionItem(item);
  }

  const updatedCollections = getCollectionItems();

  const updatedAnalytics: SpinAnalytics = {
    totalSpins: newTotalSpins,
    lastSpinDate: today,
    totalCreditsWon: newCreditsWon,
    totalXpWon: newXpWon,
    currentStreak: newStreak,
    unlockedItemsCount: updatedCollections.length,
    isWheelOracle: newTotalSpins >= 3 || updatedCollections.length >= 2,
  };

  localStorage.setItem(ANALYTICS_KEY, JSON.stringify(updatedAnalytics));
  return updatedAnalytics;
};
