import React, { useState, useMemo } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  X,
  Search,
  Clock,
  Sparkles,
  Radio,
  Bot,
  MessageSquare,
  History,
  Briefcase,
  GitFork,
  Globe,
  GitCompare,
  ShieldCheck,
  SearchCheck,
  Database,
  Gift,
  Trophy,
  Users,
  CreditCard,
  User,
  HelpCircle,
  ShieldAlert,
  ChevronRight,
  Zap,
  Sliders,
  LogOut,
  Layers,
  Compass,
  FileText,
} from "lucide-react";
import { ViewMode, ScenarioMode } from "../types";
import { useLanguage } from "../context/LanguageContext";
import { useAuth } from "../context/AuthContext";

interface NexusHolodeckDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  currentView: ViewMode;
  onSelectView: (view: ViewMode) => void;
  scenarioMode: ScenarioMode;
  onSelectScenario: (mode: ScenarioMode) => void;
  onOpenUserProfile: () => void;
  onOpenCreditStore: () => void;
  onOpenGuideModal: () => void;
  onOpenTermsModal: () => void;
}

export const NexusHolodeckDrawer: React.FC<NexusHolodeckDrawerProps> = ({
  isOpen,
  onClose,
  currentView,
  onSelectView,
  scenarioMode,
  onSelectScenario,
  onOpenUserProfile,
  onOpenCreditStore,
  onOpenGuideModal,
  onOpenTermsModal,
}) => {
  const { language, setLanguage } = useLanguage();
  const { currentUser, logout, openAuthModal } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");

  const isSuperAdmin =
    currentUser &&
    ((currentUser.email || "").toLowerCase().trim() === "warfacelove46@gmail.com" ||
      currentUser.role === "superadmin" ||
      currentUser.role === "admin");

  const categories = useMemo(
    () => [
      {
        id: "core_timeline",
        title: language === "tr" ? "Zaman & Gezinti" : "Timeline & Portals",
        icon: Clock,
        items: [
          {
            id: "portal" as ViewMode,
            label: language === "tr" ? "Gelecek Portalı (Giriş)" : "Future Portal (Entry)",
            desc: language === "tr" ? "İlk 10 saniyelik karşılama ve özet vizyon" : "10-second overview and cinematic portal",
            icon: Sparkles,
            badge: "PORTAL",
            color: "text-cyan-400 bg-cyan-950/60 border-cyan-500/30",
          },
          {
            id: "timeline" as ViewMode,
            label: language === "tr" ? "İnteraktif Zaman Akışı" : "Interactive Timeline",
            desc: language === "tr" ? "2026–2060 kronolojik teknoloji haritası" : "Chronological technology evolution map",
            icon: Clock,
            badge: "ANA AKIŞ",
            color: "text-blue-400 bg-blue-950/60 border-blue-500/30",
          },
          {
            id: "roadmap" as ViewMode,
            label: language === "tr" ? "Kişisel Gelecek Planı" : "Personal Future Plan",
            desc: language === "tr" ? "Yaş ve hedeflerinize özel 10 dönüm noktası ve biyo-yaş" : "10 matched milestones and longevity analysis",
            icon: Compass,
            badge: "SİZE ÖZEL",
            color: "text-purple-400 bg-purple-950/60 border-purple-500/30",
          },
          {
            id: "geo_map" as ViewMode,
            label: language === "tr" ? "Küresel Yayılım Haritası" : "Global Geographic Map",
            desc: language === "tr" ? "Teknolojilerin kıtalara göre yayılımı" : "Regional breakthrough distribution",
            icon: Globe,
            color: "text-indigo-400 bg-indigo-950/60 border-indigo-500/30",
          },
          {
            id: "comparison" as ViewMode,
            label: language === "tr" ? "Gelecek Kıyaslama Matrisi" : "Comparison Matrix",
            desc: language === "tr" ? "İki farklı yıl ve kırılımı karşılaştırın" : "Compare two different milestone years",
            icon: GitCompare,
            color: "text-violet-400 bg-violet-950/60 border-violet-500/30",
          },
        ],
      },
      {
        id: "ai_studio",
        title: language === "tr" ? "Yapay Zeka & Kahin Motoru" : "AI & Prediction Engine",
        icon: Bot,
        items: [
          {
            id: "persona_chat" as ViewMode,
            label: language === "tr" ? "Zaman Yolcusu Chatbot" : "Time Traveler AI Chat",
            desc: language === "tr" ? "2030, 2045 ve 2060 insan modelleriyle konuşun" : "Talk with future human personas",
            icon: MessageSquare,
            badge: "AI CHAT",
            color: "text-cyan-400 bg-cyan-950/60 border-cyan-500/30",
          },
          {
            id: "futurist_advisor" as ViewMode,
            label: language === "tr" ? "Fütürist AI Danışmanı" : "Futurist AI Advisor",
            desc: language === "tr" ? "Stratejik teknoloji ve kariyer rehberliği" : "Strategic technology and career advisor",
            icon: Sparkles,
            color: "text-purple-400 bg-purple-950/60 border-purple-500/30",
          },
          {
            id: "butterfly" as ViewMode,
            label: language === "tr" ? "Kelebek Etkisi Simülatörü" : "Butterfly Effect Simulator",
            desc: language === "tr" ? "Bir buluş gecikirse tarih nasıl değişir?" : "Simulate alternative branches if a tech fails",
            icon: GitFork,
            color: "text-pink-400 bg-pink-950/60 border-pink-500/30",
          },
          {
            id: "job_risk" as ViewMode,
            label: language === "tr" ? "Meslek Risk Analizi" : "Job Automation Risk",
            desc: language === "tr" ? "Mesleğinizin gelecekteki dönüşüm skorunu görün" : "Check AI disruption risk for your career",
            icon: Briefcase,
            color: "text-rose-400 bg-rose-950/60 border-rose-500/30",
          },
          {
            id: "prediction_history" as ViewMode,
            label: language === "tr" ? "Tahmin & Simülasyon Geçmişi" : "Prediction History",
            desc: language === "tr" ? "Ürettiğiniz tüm simülasyonları inceleyin" : "Review previously generated simulations",
            icon: History,
            color: "text-teal-400 bg-teal-950/60 border-teal-500/30",
          },
        ],
      },
      {
        id: "evidence_stream",
        title: language === "tr" ? "Canlı İstihbarat & Kanıt Radarı" : "Live Evidence & Intelligence",
        icon: Radio,
        items: [
          {
            id: "telegram_feed" as ViewMode,
            label: language === "tr" ? "Canlı İstihbarat & Sinyal Akışı" : "Live Tech Intelligence & Signals",
            desc: language === "tr" ? "Dönüm noktalarını doğrulayan anlık bilimsel ve teknolojik sinyaller" : "Real-time science telemetry & signals verifying milestones",
            icon: Radio,
            badge: "CANLI",
            color: "text-emerald-400 bg-emerald-950/60 border-emerald-500/30",
          },
          {
            id: "verification" as ViewMode,
            label: language === "tr" ? "Canlı Kanıt Doğrulama" : "Live Evidence Verification",
            desc: language === "tr" ? "Açık literatür, arXiv, Nature ve patent kanıtları" : "Academic papers & real-world proof verification",
            icon: SearchCheck,
            color: "text-cyan-400 bg-cyan-950/60 border-cyan-500/30",
          },
          {
            id: "agent_scan" as ViewMode,
            label: language === "tr" ? "Otonom Ajan Taraması" : "Autonomous Agent Scan",
            desc: language === "tr" ? "Tekillik sayacını ayarlayan otonom ajan telemetrisi" : "Live agent telemetry adjusting countdown",
            icon: Zap,
            color: "text-blue-400 bg-blue-950/60 border-blue-500/30",
          },
          {
            id: "data_integrity" as ViewMode,
            label: language === "tr" ? "Veri Bütünlüğü & Güvenlik" : "Data Integrity & Audit",
            desc: language === "tr" ? "Sistem sağlığı ve akademik kaynak çeşitliliği" : "Data transparency and bias distribution",
            icon: Database,
            color: "text-slate-300 bg-slate-900 border-slate-700",
          },
        ],
      },
      {
        id: "community_rewards",
        title: language === "tr" ? "Topluluk & Ödüller" : "Community & Rewards",
        icon: Trophy,
        items: [
          {
            id: "spin_wheel" as ViewMode,
            label: language === "tr" ? "Gelecek Çarkıfeleği" : "Future Spin Wheel",
            desc: language === "tr" ? "Her gün ücretsiz simülasyon kredisi kazanın" : "Spin daily to win free analysis credits",
            icon: Gift,
            badge: "GÜNLÜK HEDİYE",
            color: "text-amber-400 bg-amber-950/60 border-amber-500/30",
          },
          {
            id: "leaderboard" as ViewMode,
            label: language === "tr" ? "Global Liderlik Tablosu" : "Global Leaderboard",
            desc: language === "tr" ? "En isabetli tahminciler ve rozet sahipleri" : "Top predictors, level rankings and badges",
            icon: Trophy,
            color: "text-yellow-400 bg-yellow-950/60 border-yellow-500/30",
          },
          {
            id: "community" as ViewMode,
            label: language === "tr" ? "Bilimsel Öneri & Hakem Akışı" : "Community Proposals & Feed",
            desc: language === "tr" ? "Kendi öngörünüzü ekleyin, toplulukla oylayın" : "Submit new milestone proposals to peer review",
            icon: Users,
            color: "text-teal-400 bg-teal-950/60 border-teal-500/30",
          },
        ],
      },
    ],
    [language]
  );

  // Filter items by search
  const filteredCategories = useMemo(() => {
    if (!searchQuery.trim()) return categories;
    const query = searchQuery.toLowerCase().trim();
    return categories
      .map((cat) => ({
        ...cat,
        items: cat.items.filter(
          (item) =>
            item.label.toLowerCase().includes(query) ||
            item.desc.toLowerCase().includes(query)
        ),
      }))
      .filter((cat) => cat.items.length > 0);
  }, [categories, searchQuery]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div key="nexus-holodeck-drawer-container" className="fixed inset-0 z-50 overflow-hidden flex justify-end">
          {/* Frosted Glass Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/75 backdrop-blur-md cursor-pointer"
          />

          {/* Drawer Panel */}
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="relative w-full max-w-md bg-[#050814] text-white h-full shadow-[0_0_50px_rgba(6,182,212,0.2)] border-l border-cyan-500/30 flex flex-col z-10 font-mono overflow-hidden"
          >
            {/* Drawer Header */}
            <div className="p-4 sm:p-5 border-b border-white/10 bg-slate-950/80 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-cyan-500 via-blue-600 to-purple-600 p-[1px] shadow-lg shadow-cyan-500/20">
                  <div className="w-full h-full bg-slate-950 rounded-[11px] flex items-center justify-center">
                    <Compass className="w-4 h-4 text-cyan-300 animate-spin" style={{ animationDuration: "20s" }} />
                  </div>
                </div>
                <div>
                  <h2 className="font-extrabold text-sm text-white font-sans flex items-center gap-1.5">
                    <span>{language === "tr" ? "TEKNOLOJİK EVRİM TAKVİMİ" : "TECHNOLOGICAL EVOLUTION TIMELINE"}</span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-purple-500/20 text-purple-300 border border-purple-500/30 font-mono">
                      2026—2060
                    </span>
                  </h2>
                  <p className="text-[10px] text-slate-400">
                    {language === "tr" ? "Gelecek Takvimi — Gezinti & Kontrol Paneli" : "Future Timeline — Navigation & Control Hub"}
                  </p>
                </div>
              </div>

              <button
                onClick={onClose}
                className="w-8 h-8 rounded-xl bg-slate-900 border border-slate-700 text-slate-400 hover:text-white hover:bg-slate-800 flex items-center justify-center transition-colors cursor-pointer"
                title="Kapat"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Quick Search Input */}
            <div className="p-3 sm:px-4 bg-slate-950/60 border-b border-white/5">
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={language === "tr" ? "Modül, simülatör veya araç ara..." : "Search module or tool..."}
                  className="w-full bg-slate-900/90 border border-white/10 rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500/60 transition-colors"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery("")}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white text-xs"
                  >
                    ×
                  </button>
                )}
              </div>
            </div>

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto p-4 space-y-6 custom-scrollbar pb-24">
              {/* 1. SCENARIO MODE QUICK SWITCHER */}
              <div className="p-3 rounded-2xl bg-slate-950/90 border border-cyan-500/20 space-y-2.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-extrabold text-cyan-300 flex items-center gap-1.5">
                    <Sliders className="w-3.5 h-3.5" />
                    <span>GELECEK SENARYO DALI</span>
                  </span>
                  <span className="text-[10px] text-slate-400">Dinamik Olasılık</span>
                </div>

                <div className="grid grid-cols-3 gap-1.5 text-[11px]">
                  <button
                    onClick={() => onSelectScenario("baseline")}
                    className={`py-1.5 px-2 rounded-xl border text-center transition-all cursor-pointer font-bold ${
                      scenarioMode === "baseline"
                        ? "bg-cyan-500 text-slate-950 border-cyan-400 shadow-md shadow-cyan-500/30"
                        : "bg-slate-900 text-slate-400 border-white/5 hover:bg-slate-800"
                    }`}
                  >
                    📊 Temel
                  </button>

                  <button
                    onClick={() => onSelectScenario("optimistic")}
                    className={`py-1.5 px-2 rounded-xl border text-center transition-all cursor-pointer font-bold ${
                      scenarioMode === "optimistic"
                        ? "bg-emerald-500 text-slate-950 border-emerald-400 shadow-md shadow-emerald-500/30"
                        : "bg-slate-900 text-slate-400 border-white/5 hover:bg-slate-800"
                    }`}
                  >
                    🌱 İyimser
                  </button>

                  <button
                    onClick={() => onSelectScenario("dystopian")}
                    className={`py-1.5 px-2 rounded-xl border text-center transition-all cursor-pointer font-bold ${
                      scenarioMode === "dystopian"
                        ? "bg-rose-500 text-slate-950 border-rose-400 shadow-md shadow-rose-500/30"
                        : "bg-slate-900 text-slate-400 border-white/5 hover:bg-slate-800"
                    }`}
                  >
                    ⚡ Distopik
                  </button>
                </div>
              </div>

              {/* 2. CATEGORIZED FEATURE TILES */}
              {filteredCategories.map((cat) => {
                const CatIcon = cat.icon;
                return (
                  <div key={cat.id} className="space-y-2">
                    <div className="flex items-center gap-1.5 text-[11px] font-black uppercase text-slate-400 tracking-wider">
                      <CatIcon className="w-3.5 h-3.5 text-cyan-400" />
                      <span>{cat.title}</span>
                    </div>

                    <div className="space-y-1.5">
                      {cat.items.map((item) => {
                        const ItemIcon = item.icon;
                        const isCurrent = currentView === item.id;

                        return (
                          <motion.button
                            key={item.id}
                            onClick={() => {
                              onSelectView(item.id);
                              onClose();
                            }}
                            whileHover={{ x: 4 }}
                            whileTap={{ scale: 0.98 }}
                            className={`w-full p-2.5 rounded-xl border text-left transition-all flex items-center justify-between gap-3 group cursor-pointer ${
                              isCurrent
                                ? "bg-cyan-500/20 border-cyan-400 shadow-lg shadow-cyan-500/10 text-white"
                                : "bg-slate-950/60 border-white/5 hover:bg-slate-900 hover:border-white/15 text-slate-300"
                            }`}
                          >
                            <div className="flex items-center gap-2.5 min-w-0">
                              <div
                                className={`w-8 h-8 rounded-lg border flex items-center justify-center shrink-0 ${item.color}`}
                              >
                                <ItemIcon className="w-4 h-4" />
                              </div>

                              <div className="min-w-0">
                                <div className="flex items-center gap-1.5">
                                  <span className="font-bold text-xs text-white truncate font-sans">
                                    {item.label}
                                  </span>
                                  {item.badge && (
                                    <span className="text-[9px] font-mono px-1 py-0.2 rounded bg-white/10 text-cyan-300 shrink-0 font-extrabold">
                                      {item.badge}
                                    </span>
                                  )}
                                </div>
                                <p className="text-[10px] text-slate-400 truncate">{item.desc}</p>
                              </div>
                            </div>

                            <ChevronRight
                              className={`w-4 h-4 text-slate-500 group-hover:text-cyan-300 transition-colors shrink-0 ${
                                isCurrent ? "text-cyan-400" : ""
                              }`}
                            />
                          </motion.button>
                        );
                      })}
                    </div>
                  </div>
                );
              })}

              {/* 3. SUPER ADMIN SHORTCUT IF LOGGED IN */}
              {isSuperAdmin && (
                <div className="space-y-2">
                  <div className="flex items-center gap-1.5 text-[11px] font-black uppercase text-rose-400 tracking-wider">
                    <ShieldAlert className="w-3.5 h-3.5 text-rose-400" />
                    <span>Yönetici Kontrolü</span>
                  </div>
                  <button
                    onClick={() => {
                      onSelectView("admin");
                      onClose();
                    }}
                    className="w-full p-2.5 rounded-xl border border-rose-500/40 bg-rose-950/40 hover:bg-rose-900/60 text-white text-left flex items-center justify-between gap-2 transition-all cursor-pointer"
                  >
                    <div className="flex items-center gap-2">
                      <ShieldAlert className="w-4 h-4 text-rose-400" />
                      <div>
                        <span className="font-bold text-xs font-sans">Süper Yönetici Paneli</span>
                        <p className="text-[10px] text-rose-300">Kullanıcı yönetimi, ban, telemetri</p>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-rose-400" />
                  </button>
                </div>
              )}

              {/* 4. UTILITIES & LEGAL */}
              <div className="pt-2 border-t border-white/10 space-y-1.5 text-xs">
                <div className="flex items-center justify-between gap-2">
                  <button
                    onClick={() => {
                      onOpenGuideModal();
                      onClose();
                    }}
                    className="flex-1 p-2 rounded-xl bg-slate-900 border border-white/5 hover:bg-slate-800 text-slate-300 flex items-center justify-center gap-1.5 transition-colors cursor-pointer text-[11px]"
                  >
                    <HelpCircle className="w-3.5 h-3.5 text-amber-400" />
                    <span>Rehber</span>
                  </button>

                  <button
                    onClick={() => {
                      onOpenTermsModal();
                      onClose();
                    }}
                    className="flex-1 p-2 rounded-xl bg-slate-900 border border-white/5 hover:bg-slate-800 text-slate-300 flex items-center justify-center gap-1.5 transition-colors cursor-pointer text-[11px]"
                  >
                    <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Koşullar & Gizlilik</span>
                  </button>
                </div>

                <div className="flex items-center justify-between gap-2 pt-1">
                  <button
                    onClick={() => {
                      setLanguage(language === "tr" ? "en" : "tr");
                    }}
                    className="flex-1 p-2 rounded-xl bg-slate-900 border border-white/5 hover:bg-slate-800 text-slate-300 flex items-center justify-center gap-1.5 transition-colors cursor-pointer text-[11px]"
                  >
                    <Globe className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Dil: {language.toUpperCase()}</span>
                  </button>

                  {currentUser ? (
                    <button
                      onClick={() => {
                        logout();
                        onClose();
                      }}
                      className="p-2 px-3 rounded-xl bg-rose-950/50 border border-rose-500/30 hover:bg-rose-900/80 text-rose-300 flex items-center justify-center gap-1 transition-colors cursor-pointer text-[11px]"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span>Çıkış</span>
                    </button>
                  ) : (
                    <button
                      onClick={() => {
                        openAuthModal();
                        onClose();
                      }}
                      className="flex-1 p-2 rounded-xl bg-cyan-500 text-slate-950 font-bold hover:bg-cyan-400 flex items-center justify-center gap-1.5 transition-colors cursor-pointer text-[11px]"
                    >
                      <User className="w-3.5 h-3.5" />
                      <span>Giriş Yap</span>
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Bottom Floating Bar in Drawer */}
            <div className="p-3 border-t border-white/10 bg-slate-950/90 flex items-center justify-between gap-2">
              <button
                onClick={() => {
                  if (currentUser) {
                    onOpenUserProfile();
                  } else {
                    openAuthModal();
                  }
                  onClose();
                }}
                className="flex items-center gap-2 flex-1 p-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-white/5 transition-colors cursor-pointer min-w-0"
              >
                <div className="w-7 h-7 rounded-lg bg-cyan-500/20 text-cyan-300 flex items-center justify-center font-bold text-xs shrink-0">
                  {currentUser?.fullName ? currentUser.fullName.charAt(0).toUpperCase() : <User className="w-4 h-4" />}
                </div>
                <div className="min-w-0 text-left">
                  <div className="text-xs font-bold text-white truncate font-sans">
                    {currentUser?.fullName || (language === "tr" ? "Misafir Gezgin" : "Guest Explorer")}
                  </div>
                  <div className="text-[10px] text-cyan-400 truncate">
                    {currentUser?.credits !== undefined ? `${currentUser.credits} Kredi` : "Ücretsiz Mod"}
                  </div>
                </div>
              </button>

              <button
                onClick={() => {
                  onOpenCreditStore();
                  onClose();
                }}
                className="px-3 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 shadow-lg shadow-amber-500/20 hover:scale-105 transition-transform cursor-pointer shrink-0"
              >
                <Gift className="w-3.5 h-3.5" />
                <span>Kredi Al</span>
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
