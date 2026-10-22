import React from "react";
import { ViewMode } from "../types";
import {
  Clock,
  Briefcase,
  Radio,
  Bot,
  LayoutGrid,
  Compass,
  Sparkles,
} from "lucide-react";

interface MobileBottomNavDockProps {
  currentView: ViewMode;
  onNavigate: (view: ViewMode) => void;
  onOpenMobileMenu?: () => void;
}

export const MobileBottomNavDock: React.FC<MobileBottomNavDockProps> = ({
  currentView,
  onNavigate,
  onOpenMobileMenu,
}) => {
  const navItems: {
    id: ViewMode | "menu";
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    badge?: string;
  }[] = [
    {
      id: "timeline",
      label: "Takvim",
      icon: Clock,
    },
    {
      id: "roadmap",
      label: "Geleceğim",
      icon: Sparkles,
      badge: "ÖZEL",
    },
    {
      id: "telegram_feed",
      label: "Haberler",
      icon: Radio,
      badge: "CANLI",
    },
    {
      id: "persona_chat",
      label: "Sohbet",
      icon: Bot,
    },
    {
      id: "portal",
      label: "Portal",
      icon: LayoutGrid,
    },
  ];

  return (
    <nav
      id="mobile-bottom-nav-dock"
      aria-label="Mobil Hızlı Gezinme Çubuğu"
      className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-slate-950/92 backdrop-blur-xl border-t border-white/10 px-2 py-1.5 shadow-[0_-8px_30px_rgba(0,0,0,0.6)] pb-[calc(0.375rem+env(safe-area-inset-bottom,0px))]"
    >
      <div className="flex items-center justify-around max-w-md mx-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentView === item.id;

          return (
            <button
              key={item.id}
              type="button"
              onClick={() => {
                if (item.id === "portal" && onOpenMobileMenu) {
                  onNavigate("portal");
                } else if (item.id !== "menu") {
                  onNavigate(item.id as ViewMode);
                }
              }}
              className={`flex flex-col items-center justify-center py-1 px-2 rounded-xl transition-all duration-150 min-w-[56px] cursor-pointer relative select-none active:scale-95 ${
                isActive
                  ? "text-cyan-400 font-bold"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              {/* Active Indicator Top Glow */}
              {isActive && (
                <span className="absolute -top-1.5 w-6 h-0.5 rounded-full bg-gradient-to-r from-cyan-400 to-blue-500 shadow-sm shadow-cyan-400" />
              )}

              <div className="relative">
                <Icon className={`w-5 h-5 ${isActive ? "text-cyan-400 stroke-[2.2]" : "stroke-[1.8]"}`} />
                {item.badge && (
                  <span className="absolute -top-1.5 -right-3 px-1 py-0.2 text-[8px] font-mono font-extrabold bg-emerald-500 text-slate-950 rounded-full animate-pulse shadow-sm">
                    {item.badge}
                  </span>
                )}
              </div>

              <span className={`text-[10px] tracking-tight mt-1 truncate max-w-[64px] font-mono leading-none ${
                isActive ? "font-bold text-cyan-300" : "font-medium"
              }`}>
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
