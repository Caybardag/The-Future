import React, { useState, useRef, useEffect } from "react";
import { ViewMode, PhaseId, CategoryType, ScenarioMode } from "../types";
import {
  Clock,
  Sparkles,
  ShieldCheck,
  Globe,
  User,
  Search,
  ChevronDown,
  Zap,
  Briefcase,
  Cpu,
  MessageSquare,
  Gift,
  Compass,
  Layers,
  MapPin,
  Activity,
  Award,
  Home,
  CheckCircle2,
  Sliders,
  HelpCircle,
  Coins,
  Menu,
  FileText,
} from "lucide-react";
import { useLanguage } from "../context/LanguageContext";
import { useAuth } from "../context/AuthContext";

interface NavbarProps {
  currentView: ViewMode;
  setCurrentView: (view: ViewMode) => void;
  selectedPhase: PhaseId | "all";
  setSelectedPhase: (phase: PhaseId | "all") => void;
  selectedCategory: CategoryType | "all";
  setSelectedCategory: (category: CategoryType | "all") => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  categories: CategoryType[];
  onOpenEmbedModal?: () => void;
  scenarioMode?: ScenarioMode;
  setScenarioMode?: (mode: ScenarioMode) => void;
  onOpenUserProfileModal?: () => void;
  onOpenCreditStore?: () => void;
  onOpenGuideModal?: () => void;
  onOpenDrawer?: () => void;
  currentUser?: any;
  targetYearShift?: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentView,
  setCurrentView,
  searchQuery,
  setSearchQuery,
  onOpenUserProfileModal: propOnOpenUserProfileModal,
  onOpenCreditStore: propOnOpenCreditStore,
  onOpenGuideModal,
  onOpenDrawer,
  currentUser: propCurrentUser,
}) => {
  const { language, setLanguage } = useLanguage();
  const isTr = language === "tr";
  const auth = useAuth();
  const currentUser = propCurrentUser !== undefined ? propCurrentUser : auth.currentUser;
  const onOpenUserProfileModal = propOnOpenUserProfileModal || auth.openAuthModal;

  const isSuperAdmin =
    (currentUser?.email || "").toLowerCase().trim() === "warfacelove46@gmail.com" ||
    currentUser?.role === "superadmin" ||
    currentUser?.role === "admin";

  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const dropdownRef = useRef<HTMLDivElement | null>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setActiveDropdown(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelectView = (view: ViewMode) => {
    setCurrentView(view);
    setActiveDropdown(null);
    window.scrollTo({ top: 0, left: 0, behavior: "instant" });
  };

  return (
    <header className="sticky top-0 z-50 bg-[#090518]/95 backdrop-blur-2xl border-b border-purple-500/20 shadow-[0_8px_30px_rgba(0,0,0,0.6)] font-sans">
      <div className="max-w-7xl mx-auto px-2.5 sm:px-6 py-2 sm:py-2.5 flex items-center justify-between gap-2 sm:gap-4" ref={dropdownRef}>
        {/* LEFT: Epic Style Brand & Dropdown Links */}
        <div className="flex items-center gap-2 sm:gap-6 shrink-0 min-w-0">
          {/* Brand Logo */}
          <div
            onClick={() => {
              if (currentUser) {
                setCurrentView("timeline");
              } else {
                setCurrentView("portal");
              }
              window.scrollTo({ top: 0, left: 0, behavior: "instant" });
            }}
            className="flex items-center gap-2 sm:gap-2.5 cursor-pointer group select-none shrink-0"
            title={currentUser ? (isTr ? "Zaman Akışı Kokpiti" : "Timeline Cockpit") : (isTr ? "Gelecek Portalı Ana Ekranı" : "Welcome Portal")}
          >
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-gradient-to-tr from-purple-600 via-indigo-600 to-cyan-500 p-[1px] shadow-lg shadow-purple-500/30 group-hover:scale-105 transition-transform shrink-0">
              <div className="w-full h-full bg-[#0d0922] rounded-[10px] sm:rounded-[11px] flex items-center justify-center">
                <Sparkles className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-purple-300 animate-pulse" />
              </div>
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1 sm:gap-1.5">
                <span className="font-black text-xs sm:text-sm tracking-tight text-white uppercase font-sans truncate max-w-[100px] xs:max-w-[150px] sm:max-w-none">
                  {isTr ? "TEKNOLOJİK EVRİM" : "TECH EVOLUTION"}
                </span>
                <span className="hidden md:inline-block text-[10px] px-1.5 py-0.2 rounded bg-purple-500/20 text-purple-300 font-mono font-bold border border-purple-500/40 shrink-0">
                  2026—2060
                </span>
              </div>
            </div>
          </div>

          {/* ODAK ÜÇLÜSÜ NAVİGASYONU (The Core Trio: Zaman Akışı, Kişisel Plan, Zaman Yolcusu) */}
          <nav className="hidden md:flex items-center gap-1 p-1 rounded-full bg-[#130d2a]/90 border border-purple-500/25 backdrop-blur-md shadow-inner">
            <button
              onClick={() => {
                setCurrentView("timeline");
                window.scrollTo({ top: 0, left: 0, behavior: "instant" });
              }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap shrink-0 transition-all cursor-pointer ${
                currentView === "timeline"
                  ? "bg-purple-600 text-white shadow-sm shadow-purple-600/40"
                  : "text-slate-300 hover:text-white hover:bg-white/5"
              }`}
              title={isTr ? "2026—2060 Kronolojik Zaman Akışı" : "2026—2060 Timeline"}
            >
              <Clock className="w-3.5 h-3.5" />
              <span>{isTr ? "Zaman Akışı" : "Timeline"}</span>
            </button>

            <button
              onClick={() => {
                setCurrentView("roadmap");
                window.scrollTo({ top: 0, left: 0, behavior: "instant" });
              }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap shrink-0 transition-all cursor-pointer ${
                currentView === "roadmap"
                  ? "bg-purple-600 text-white shadow-sm shadow-purple-600/40"
                  : "text-slate-300 hover:text-white hover:bg-white/5"
              }`}
              title={isTr ? "Size Özel 2026—2060 Kişisel Gelecek Planı" : "Personal Future Roadmap"}
            >
              <Compass className="w-3.5 h-3.5" />
              <span>{isTr ? "Kişisel Plan" : "Roadmap"}</span>
            </button>

            <button
              onClick={() => {
                setCurrentView("persona_chat");
                window.scrollTo({ top: 0, left: 0, behavior: "instant" });
              }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap shrink-0 transition-all cursor-pointer ${
                currentView === "persona_chat"
                  ? "bg-purple-600 text-white shadow-sm shadow-purple-600/40"
                  : "text-slate-300 hover:text-white hover:bg-white/5"
              }`}
              title={isTr ? "2060 Zaman Yolcusu Yapay Zeka Sohbeti" : "Time Traveler AI Chat"}
            >
              <MessageSquare className="w-3.5 h-3.5" />
              <span>{isTr ? "Zaman Yolcusu" : "Time Traveler"}</span>
            </button>
          </nav>
        </div>

        {/* RIGHT: Language, Profile Pill & Portal/Console Action */}
        <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
          {/* Quick Search on Timeline View */}
          {currentView === "timeline" && (
            <div className="hidden md:flex items-center bg-[#15102d] border border-purple-500/20 rounded-full px-3 py-1 text-xs focus-within:border-purple-400 transition-colors">
              <Search className="w-3.5 h-3.5 text-purple-400 mr-2 shrink-0" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={isTr ? "Yıl veya teknoloji ara..." : "Search milestone..."}
                className="bg-transparent text-white text-xs placeholder-slate-400 focus:outline-none w-28 lg:w-40"
              />
              {searchQuery && (
                <button onClick={() => setSearchQuery("")} className="text-slate-400 hover:text-white text-xs px-1 cursor-pointer">
                  ×
                </button>
              )}
            </div>
          )}

          {/* Language Switcher (hidden on small mobile to preserve layout space, accessible in Drawer) */}
          <button
            onClick={() => setLanguage(language === "tr" ? "en" : "tr")}
            className="hidden sm:flex px-2 sm:px-2.5 py-1 rounded-full bg-[#15102d] hover:bg-[#1e173e] border border-purple-500/20 text-slate-300 hover:text-white text-xs font-bold items-center gap-1.5 transition-colors cursor-pointer shrink-0"
            title="Dili Değiştir / Switch Language"
          >
            <Globe className="w-3.5 h-3.5 text-purple-400 shrink-0" />
            <span>{language.toUpperCase()}</span>
          </button>

          {/* Super Admin Quick Access Button */}
          {isSuperAdmin && (
            <button
              onClick={() => setCurrentView("admin")}
              className={`flex items-center gap-1 px-2 sm:px-3 py-1 rounded-full text-xs font-bold transition-all cursor-pointer border shrink-0 ${
                currentView === "admin"
                  ? "bg-rose-600 text-white border-rose-400 shadow-lg shadow-rose-600/40"
                  : "bg-rose-950/60 hover:bg-rose-900/80 text-rose-300 border-rose-500/40 hover:border-rose-400"
              }`}
              title="Süper Yönetici Paneli"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-rose-400 shrink-0" />
              <span className="hidden sm:inline font-mono">Yönetici</span>
            </button>
          )}

          {/* Credit / Balance & Ad Watch Pill */}
          <button
            data-testid="navbar-credit-btn"
            onClick={() => (propOnOpenCreditStore ? propOnOpenCreditStore() : auth.setCreditStoreModalOpen(true))}
            className="flex items-center gap-1 sm:gap-1.5 px-2 sm:px-2.5 py-1 rounded-full bg-gradient-to-r from-amber-500/15 via-yellow-500/10 to-amber-500/15 hover:from-amber-500/25 hover:to-amber-500/25 border border-amber-500/40 hover:border-amber-400 text-amber-300 text-xs font-bold transition-all cursor-pointer shadow-sm shadow-amber-500/10 group shrink-0"
            title={isTr ? "Kredi Yükle veya Reklam İzleyerek Kredi Kazan" : "Top up credits or watch ads for free credits"}
          >
            <Coins className="w-3.5 h-3.5 text-amber-400 group-hover:rotate-12 transition-transform shrink-0" />
            <span className="font-mono font-bold text-[11px] sm:text-xs text-amber-300">
              {currentUser?.credits ?? 0}
            </span>
            <span className="hidden sm:inline-flex text-[10px] font-mono bg-amber-400/20 text-amber-200 px-1.5 py-0.5 rounded-full border border-amber-400/30 group-hover:bg-amber-400/30 items-center gap-0.5">
              <span>+</span>
              <span>{isTr ? "Kredi" : "Get"}</span>
            </span>
          </button>

          {/* User Profile Pill - Always fully visible on both mobile and desktop */}
          <button
            data-testid="navbar-profile-btn"
            onClick={onOpenUserProfileModal}
            className="flex items-center gap-1.5 sm:gap-2 px-2 sm:px-3 py-1 rounded-full bg-[#15102d] hover:bg-[#1e173e] active:scale-95 border border-purple-500/30 hover:border-purple-400/60 text-slate-200 text-xs font-bold transition-all cursor-pointer shrink-0 shadow-sm shadow-purple-500/10"
            title={currentUser ? (isTr ? "Profilim ve Kredilerim" : "My Profile & Credits") : (isTr ? "Giriş Yap" : "Sign In")}
          >
            <div className="w-5 h-5 rounded-full bg-gradient-to-tr from-purple-500 to-indigo-500 text-white flex items-center justify-center text-[10px] font-bold shrink-0 ring-1 ring-white/20">
              {currentUser?.fullName ? currentUser.fullName.charAt(0).toUpperCase() : <User className="w-3 h-3" />}
            </div>
            <span className="text-[11px] sm:text-xs font-semibold max-w-[55px] xs:max-w-[80px] sm:max-w-[100px] truncate">
              {currentUser?.fullName ? currentUser.fullName.split(" ")[0] : (isTr ? "Giriş" : "Sign In")}
            </span>
          </button>

          {/* Primary Action Button (Portal <-> Console Switcher) */}
          <button
            onClick={() => {
              setCurrentView(currentView === "portal" ? "timeline" : "portal");
              window.scrollTo({ top: 0, left: 0, behavior: "instant" });
            }}
            className="flex items-center gap-1 sm:gap-1.5 p-1.5 sm:px-3.5 sm:py-1.5 rounded-full bg-purple-600 hover:bg-purple-500 active:scale-95 text-white text-xs font-bold shadow-md shadow-purple-600/30 transition-all cursor-pointer shrink-0"
            title={
              currentView === "portal"
                ? (isTr ? "Konsola Geç" : "Open Console")
                : (currentUser ? (isTr ? "Tanıtım Vitrini" : "Showcase") : (isTr ? "Karşılama" : "Welcome"))
            }
          >
            {currentView === "portal" ? (
              <>
                <Clock className="w-3.5 h-3.5 shrink-0" />
                <span className="hidden sm:inline">{isTr ? "Konsola Geç" : "Open Console"}</span>
              </>
            ) : (
              <>
                <Sparkles className="w-3.5 h-3.5 shrink-0 text-amber-300" />
                <span className="hidden sm:inline">
                  {currentUser ? (isTr ? "Tanıtım Vitrini" : "Showcase") : (isTr ? "Karşılama" : "Welcome")}
                </span>
              </>
            )}
          </button>

          {/* Control Center Drawer Menu Trigger (Available on all screens, desktop & mobile) */}
          {onOpenDrawer && (
            <button
              onClick={onOpenDrawer}
              className="flex items-center gap-1.5 p-1.5 sm:px-3 sm:py-1.5 rounded-full bg-[#15102d] hover:bg-[#1e173e] active:scale-95 border border-purple-500/30 hover:border-purple-400/60 text-purple-300 hover:text-white transition-all cursor-pointer shrink-0 text-xs font-bold"
              title={isTr ? "Tüm Menü & Modüller" : "All Menus & Modules"}
              aria-label={isTr ? "Kontrol Merkezi Menüsü" : "Control Center Menu"}
            >
              <Menu className="w-4 h-4 shrink-0" />
              <span className="hidden sm:inline font-mono">{isTr ? "Menü" : "Menu"}</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
