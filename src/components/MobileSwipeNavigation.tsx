import React, { useState, useEffect, useRef } from "react";
import { ViewMode } from "../types";
import {
  Clock,
  Radio,
  Briefcase,
  ShieldCheck,
  Cpu,
  MapPin,
  Layers,
  Activity,
  MessageSquare,
  User,
  Gift,
  Award,
  Sliders,
  ChevronLeft,
  ChevronRight,
  Home,
  Sparkles,
} from "lucide-react";
import { useLanguage } from "../context/LanguageContext";

export interface MobileTabDefinition {
  id: ViewMode;
  titleTr: string;
  titleEn: string;
  shortTitleTr: string;
  shortTitleEn: string;
  icon: React.ComponentType<{ className?: string; style?: React.CSSProperties }>;
  color: string;
}

export const MOBILE_TABS: MobileTabDefinition[] = [
  {
    id: "portal",
    titleTr: "Ana Gelecek Merkezi",
    titleEn: "Intelligence Hub",
    shortTitleTr: "Ana Merkez",
    shortTitleEn: "Hub",
    icon: Home,
    color: "#a855f7",
  },
  {
    id: "timeline",
    titleTr: "2026—2060 Zaman Çizelgesi",
    titleEn: "2026—2060 Timeline",
    shortTitleTr: "Zaman Çizelgesi",
    shortTitleEn: "Timeline",
    icon: Clock,
    color: "#38bdf8",
  },
  {
    id: "telegram_feed",
    titleTr: "Canlı Güncel Haberler",
    titleEn: "Live Tech News",
    shortTitleTr: "Güncel Haberler",
    shortTitleEn: "Latest News",
    icon: Radio,
    color: "#eab308",
  },
  {
    id: "job_risk",
    titleTr: "Meslek & Kariyer Analizi",
    titleEn: "Job & Career Risk",
    shortTitleTr: "Meslek Analizi",
    shortTitleEn: "Job Risk",
    icon: Briefcase,
    color: "#fb7185",
  },
  {
    id: "verification",
    titleTr: "Bilimsel Doğrulama & Gelişim Aşaması",
    titleEn: "Scientific Verification",
    shortTitleTr: "Doğrulama",
    shortTitleEn: "Verification",
    icon: ShieldCheck,
    color: "#34d399",
  },
  {
    id: "geo_map",
    titleTr: "5-Katmanlı Dünya Durumu",
    titleEn: "5-Layer World Status",
    shortTitleTr: "Dünya Durumu",
    shortTitleEn: "World State",
    icon: MapPin,
    color: "#10b981",
  },
  {
    id: "network",
    titleTr: "Nedensellik & Etki Ağı",
    titleEn: "Causality Network",
    shortTitleTr: "Etki Ağı",
    shortTitleEn: "Network",
    icon: Layers,
    color: "#c084fc",
  },
  {
    id: "butterfly",
    titleTr: "Kelebek Etkisi Simülatörü",
    titleEn: "Butterfly Effect",
    shortTitleTr: "Kelebek Etkisi",
    shortTitleEn: "Butterfly",
    icon: Activity,
    color: "#f472b6",
  },
  {
    id: "persona_chat",
    titleTr: "2060 Zaman Yolcusu Sohbeti",
    titleEn: "2060 Time Traveler Chat",
    shortTitleTr: "Zaman Yolcusu",
    shortTitleEn: "Time Traveler",
    icon: MessageSquare,
    color: "#818cf8",
  },
  {
    id: "roadmap",
    titleTr: "Kişisel Yol Haritası",
    titleEn: "Personal Roadmap",
    shortTitleTr: "Yol Haritası",
    shortTitleEn: "Roadmap",
    icon: User,
    color: "#a78bfa",
  },
  {
    id: "spin_wheel",
    titleTr: "Günlük Gelecek Çarkı",
    titleEn: "Daily Spin Wheel",
    shortTitleTr: "Gelecek Çarkı",
    shortTitleEn: "Spin Wheel",
    icon: Gift,
    color: "#fbbf24",
  },
  {
    id: "leaderboard",
    titleTr: "Global Liderlik Tablosu",
    titleEn: "Leaderboard",
    shortTitleTr: "Liderlik",
    shortTitleEn: "Leaderboard",
    icon: Award,
    color: "#facc15",
  },
  {
    id: "audit",
    titleTr: "Algoritmik Denetim",
    titleEn: "Algorithmic Audit",
    shortTitleTr: "Denetim",
    shortTitleEn: "Audit",
    icon: Sliders,
    color: "#9333ea",
  },
];

interface MobileSwipeNavigationProps {
  currentView: ViewMode;
  setCurrentView: (view: ViewMode) => void;
}

export const MobileSwipeNavigation: React.FC<MobileSwipeNavigationProps> = ({
  currentView,
  setCurrentView,
}) => {
  const { language } = useLanguage();
  const isTr = language === "tr";

  const [swipeFeedback, setSwipeFeedback] = useState<{
    direction: "left" | "right";
    targetTitle: string;
  } | null>(null);

  const touchStartRef = useRef<{ x: number; y: number; time: number } | null>(null);
  const feedbackTimeoutRef = useRef<any>(null);

  // Find active tab index
  const activeIndex = MOBILE_TABS.findIndex((tab) => tab.id === currentView);
  const currentIndexSafe = activeIndex >= 0 ? activeIndex : 1; // Default to timeline if custom

  const activeTab = MOBILE_TABS[currentIndexSafe] || MOBILE_TABS[1];
  const prevTab = currentIndexSafe > 0 ? MOBILE_TABS[currentIndexSafe - 1] : null;
  const nextTab = currentIndexSafe < MOBILE_TABS.length - 1 ? MOBILE_TABS[currentIndexSafe + 1] : null;

  // Detect virtual keyboard on mobile to prevent blocking chat input
  const [isKeyboardVisible, setIsKeyboardVisible] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const checkKeyboard = () => {
      if (window.visualViewport) {
        const isShrunk = window.innerHeight - window.visualViewport.height > 140;
        const isInputActive =
          document.activeElement?.tagName === "INPUT" ||
          document.activeElement?.tagName === "TEXTAREA";
        setIsKeyboardVisible(isShrunk || isInputActive);
      }
    };

    const handleFocusIn = (e: FocusEvent) => {
      const target = e.target as HTMLElement | null;
      if (target && (target.tagName === "INPUT" || target.tagName === "TEXTAREA")) {
        setIsKeyboardVisible(true);
      }
    };

    const handleFocusOut = () => {
      setTimeout(() => {
        const isInputActive =
          document.activeElement?.tagName === "INPUT" ||
          document.activeElement?.tagName === "TEXTAREA";
        if (!isInputActive) {
          setIsKeyboardVisible(false);
        }
      }, 150);
    };

    window.addEventListener("focusin", handleFocusIn);
    window.addEventListener("focusout", handleFocusOut);
    if (window.visualViewport) {
      window.visualViewport.addEventListener("resize", checkKeyboard);
      window.visualViewport.addEventListener("scroll", checkKeyboard);
    }

    return () => {
      window.removeEventListener("focusin", handleFocusIn);
      window.removeEventListener("focusout", handleFocusOut);
      if (window.visualViewport) {
        window.visualViewport.removeEventListener("resize", checkKeyboard);
        window.visualViewport.removeEventListener("scroll", checkKeyboard);
      }
    };
  }, []);

  const handleNavigateIndex = (index: number, direction: "left" | "right") => {
    if (index < 0 || index >= MOBILE_TABS.length) return;
    const target = MOBILE_TABS[index];
    setCurrentView(target.id);

    // Show visual swipe toast feedback
    setSwipeFeedback({
      direction,
      targetTitle: isTr ? target.titleTr : target.titleEn,
    });

    if (feedbackTimeoutRef.current) clearTimeout(feedbackTimeoutRef.current);
    feedbackTimeoutRef.current = setTimeout(() => {
      setSwipeFeedback(null);
    }, 1200);

    // Scroll to top
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Auto-dismiss swipe feedback HUD reliably
  useEffect(() => {
    if (!swipeFeedback) return;
    const timer = setTimeout(() => {
      setSwipeFeedback(null);
    }, 850);
    return () => clearTimeout(timer);
  }, [swipeFeedback]);

  // Global Touch Swipe Handler for Mobile Viewports
  useEffect(() => {
    const handleTouchStart = (e: TouchEvent) => {
      if (e.touches.length !== 1) return;

      const target = e.target as HTMLElement | null;
      if (target) {
        const isInteractiveOrCanvas = target.closest(
          "canvas, svg, [data-prevent-swipe], [data-no-swipe], input, textarea, select, button, [role='slider'], .touch-none, .no-swipe, .overflow-x-auto, .overflow-x-scroll, pre"
        );
        if (isInteractiveOrCanvas) {
          touchStartRef.current = null;
          return;
        }
      }

      touchStartRef.current = {
        x: e.touches[0].clientX,
        y: e.touches[0].clientY,
        time: Date.now(),
      };
    };

    const handleTouchEnd = (e: TouchEvent) => {
      if (!touchStartRef.current || e.changedTouches.length !== 1) return;
      const touchEnd = {
        x: e.changedTouches[0].clientX,
        y: e.changedTouches[0].clientY,
        time: Date.now(),
      };

      const deltaX = touchEnd.x - touchStartRef.current.x;
      const deltaY = touchEnd.y - touchStartRef.current.y;
      const deltaTime = touchEnd.time - touchStartRef.current.time;

      touchStartRef.current = null;

      // Ignore if user was interacting with an internal horizontally scrollable or canvas/graph element
      const targetElement = e.target as HTMLElement | null;
      if (targetElement) {
        const isExcludedElement = targetElement.closest(
          "canvas, svg, [data-prevent-swipe], [data-no-swipe], input, textarea, select, button, [role='slider'], .touch-none, .no-swipe, .overflow-x-auto, .overflow-x-scroll, pre"
        );
        if (isExcludedElement) return;
      }

      // Must be a distinct horizontal swipe gesture (distance > 50px, duration < 600ms, |deltaX| > |deltaY| * 1.4)
      const minDistance = 50;
      const maxTime = 600;

      if (
        Math.abs(deltaX) > minDistance &&
        deltaTime < maxTime &&
        Math.abs(deltaX) > Math.abs(deltaY) * 1.35
      ) {
        if (deltaX < 0) {
          // SWIPED LEFT -> Go to NEXT Tab
          if (currentIndexSafe < MOBILE_TABS.length - 1) {
            handleNavigateIndex(currentIndexSafe + 1, "left");
          }
        } else {
          // SWIPED RIGHT -> Go to PREVIOUS Tab
          if (currentIndexSafe > 0) {
            handleNavigateIndex(currentIndexSafe - 1, "right");
          }
        }
      }
    };

    window.addEventListener("touchstart", handleTouchStart, { passive: true });
    window.addEventListener("touchend", handleTouchEnd, { passive: true });

    return () => {
      window.removeEventListener("touchstart", handleTouchStart);
      window.removeEventListener("touchend", handleTouchEnd);
    };
  }, [currentIndexSafe, isTr]);

  const ActiveIcon = activeTab.icon;

  return (
    <>
      {/* 1. Dynamic On-Screen Swipe Transition HUD (appears temporarily on swipe and auto fades) */}
      {swipeFeedback && (
        <div
          onClick={() => setSwipeFeedback(null)}
          className="fixed top-16 left-1/2 -translate-x-1/2 z-[100] cursor-pointer animate-in fade-in zoom-in-95 duration-200"
        >
          <div className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#110c28]/95 border border-purple-500/50 shadow-2xl backdrop-blur-xl text-white text-xs font-bold font-mono">
            <span>{swipeFeedback.direction === "left" ? "→" : "←"}</span>
            <span className="text-purple-300">{swipeFeedback.targetTitle}</span>
          </div>
        </div>
      )}

      {/* 2. Floating Mobile Dock & Swipe Tab Tracker (Only visible on mobile/tablet, hidden when typing) */}
      <div
        className={`lg:hidden fixed bottom-3 inset-x-3 z-40 transition-all duration-200 ${
          isKeyboardVisible ? "opacity-0 pointer-events-none translate-y-8" : "opacity-100 translate-y-0"
        }`}
      >
        <div className="bg-[#0c0822]/95 backdrop-blur-2xl border border-purple-500/30 rounded-2xl p-2 shadow-[0_10px_35px_rgba(0,0,0,0.8)] flex items-center justify-between gap-2">
          {/* Left / Prev Tab Button */}
          <button
            onClick={() => prevTab && handleNavigateIndex(currentIndexSafe - 1, "right")}
            disabled={!prevTab}
            className="p-2 rounded-xl bg-purple-950/40 hover:bg-purple-900/50 border border-white/5 text-slate-300 hover:text-white disabled:opacity-20 disabled:pointer-events-none transition cursor-pointer shrink-0"
            title={prevTab ? (isTr ? `Önceki: ${prevTab.titleTr}` : `Prev: ${prevTab.titleEn}`) : ""}
          >
            <ChevronLeft className="w-4 h-4 text-purple-300" />
          </button>

          {/* Center: Active Tab Pill & Progress Indicator */}
          <div className="flex-1 min-w-0 flex flex-col items-center justify-center text-center px-1">
            <div className="flex items-center gap-1.5 max-w-full">
              <ActiveIcon className="w-3.5 h-3.5 shrink-0" style={{ color: activeTab.color }} />
              <span className="text-xs font-bold text-white truncate">
                {isTr ? activeTab.titleTr : activeTab.titleEn}
              </span>
            </div>

            {/* Micro Pagination Tracker */}
            <div className="flex items-center gap-1 mt-1">
              <span className="text-[10px] font-mono text-purple-300/80 font-bold">
                {currentIndexSafe + 1} / {MOBILE_TABS.length}
              </span>
              <span className="text-[9px] text-slate-500 font-sans">
                • {isTr ? "Kaydır (← / →)" : "Swipe (← / →)"}
              </span>
            </div>
          </div>

          {/* Right / Next Tab Button */}
          <button
            onClick={() => nextTab && handleNavigateIndex(currentIndexSafe + 1, "left")}
            disabled={!nextTab}
            className="p-2 rounded-xl bg-purple-950/40 hover:bg-purple-900/50 border border-white/5 text-slate-300 hover:text-white disabled:opacity-20 disabled:pointer-events-none transition cursor-pointer shrink-0"
            title={nextTab ? (isTr ? `Sonraki: ${nextTab.titleTr}` : `Next: ${nextTab.titleEn}`) : ""}
          >
            <ChevronRight className="w-4 h-4 text-purple-300" />
          </button>
        </div>
      </div>
    </>
  );
};
