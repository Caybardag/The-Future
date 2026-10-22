import React, { useState, useRef, useEffect } from "react";
import { Milestone } from "../types";
import { getFiveLayerWorldState } from "../utils/worldStateResolver";
import { TIMELINE_DATA } from "../data/timelineData";
import {
  Globe,
  User,
  Briefcase,
  AlertTriangle,
  GitFork,
  Cpu,
  HeartPulse,
  Zap,
  Eye,
  ShieldAlert,
  ShieldCheck,
  TrendingUp,
  CheckCircle2,
  Sparkles,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  Compass
} from "lucide-react";

interface FiveLayerWorldStateViewProps {
  milestone: Milestone;
  onSelectMilestone?: (year: number) => void;
  userBirthYear?: number;
}

export const FiveLayerWorldStateView: React.FC<FiveLayerWorldStateViewProps> = ({
  milestone,
  onSelectMilestone,
  userBirthYear,
}) => {
  const [activeLayerTab, setActiveLayerTab] = useState<"panorama" | "bio" | "economy" | "risk" | "domino">("panorama");
  const [customBirthYear, setCustomBirthYear] = useState<number | undefined>(userBirthYear);

  const tabsContainerRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState<boolean>(false);
  const [canScrollRight, setCanScrollRight] = useState<boolean>(false);

  const checkScroll = () => {
    const el = tabsContainerRef.current;
    if (!el) return;
    const { scrollLeft, scrollWidth, clientWidth } = el;
    setCanScrollLeft(scrollLeft > 4);
    setCanScrollRight(scrollLeft + clientWidth < scrollWidth - 4);
  };

  useEffect(() => {
    checkScroll();
    const el = tabsContainerRef.current;
    if (el) el.addEventListener("scroll", checkScroll, { passive: true });
    window.addEventListener("resize", checkScroll);
    return () => {
      if (el) el.removeEventListener("scroll", checkScroll);
      window.removeEventListener("resize", checkScroll);
    };
  }, [milestone.year]);

  const scrollTabs = (direction: "left" | "right") => {
    const el = tabsContainerRef.current;
    if (!el) return;
    const offset = direction === "left" ? -160 : 160;
    el.scrollBy({ left: offset, behavior: "smooth" });
    setTimeout(checkScroll, 200);
  };

  const worldState = getFiveLayerWorldState(milestone, customBirthYear);

  const layerTabs = [
    { id: "panorama", label: "🌐 Yılın Panoraması", shortLabel: "Panorama", icon: Globe, color: "text-cyan-400" },
    { id: "bio", label: "👤 Biyo-Yaşam & Sen", shortLabel: "Biyo-Yaşam", icon: User, color: "text-emerald-400" },
    { id: "economy", label: "💼 İş & Ekonomi", shortLabel: "Ekonomi", icon: Briefcase, color: "text-amber-400" },
    { id: "risk", label: "⚠️ Risk Radarı", shortLabel: "Risk", icon: AlertTriangle, color: "text-rose-400" },
    { id: "domino", label: "🔗 Tetiklediği Gelecek", shortLabel: "Domino", icon: GitFork, color: "text-purple-400" },
  ] as const;

  const currentTabIndex = layerTabs.findIndex((t) => t.id === activeLayerTab);

  return (
    <div className="bg-slate-950/90 border border-white/10 rounded-2xl p-4 sm:p-5 space-y-4 font-mono text-xs shadow-xl animate-in fade-in">
      {/* Header Banner */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/10 pb-3">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-purple-500/20 border border-purple-500/30 text-purple-300">
            <Globe className="w-4 h-4 text-purple-400 animate-pulse" />
          </div>
          <div>
            <h4 className="font-bold text-white text-sm flex items-center gap-2">
              <span>{milestone.year} Çok Boyutlu Dünya Durumu Matrisi</span>
              <span className="text-[10px] bg-purple-500/20 text-purple-300 px-2 py-0.5 rounded-full border border-purple-500/30">
                5 Katmanlı Dinamik Model
              </span>
            </h4>
            <p className="text-slate-400 text-[11px] font-sans">
              Tek bir izole olay değil; teknoloji, biyoloji, ekonomi, etik ve nedensellik domino zincirinin anlık kesişimi.
            </p>
          </div>
        </div>
      </div>

      {/* Layer Navigation Tabs with Discoverability Indicators */}
      <div className="space-y-1.5">
        {/* Helper Micro-Bar: Tab Count & Dots */}
        <div className="flex items-center justify-between text-xs font-mono px-0.5">
          <div className="flex items-center gap-2">
            <span className="text-[10px] text-slate-400 font-bold uppercase flex items-center gap-1.5">
              <span>KATMAN</span>
              <span className="px-1.5 py-0.2 rounded bg-purple-950/70 text-purple-300 border border-purple-500/30">
                {currentTabIndex + 1} / {layerTabs.length}
              </span>
            </span>

            {/* Quick dots */}
            <div className="flex items-center gap-1">
              {layerTabs.map((tab, idx) => (
                <button
                  key={`layer-dot-${tab.id}-${idx}`}
                  type="button"
                  onClick={() => setActiveLayerTab(tab.id as any)}
                  className={`h-1.5 rounded-full transition-all cursor-pointer ${
                    activeLayerTab === tab.id
                      ? "w-4 bg-purple-400"
                      : "w-1.5 bg-white/20 hover:bg-white/40"
                  }`}
                  aria-label={`Katman ${idx + 1}: ${tab.label}`}
                />
              ))}
            </div>
          </div>

          {canScrollRight && (
            <button
              type="button"
              onClick={() => scrollTabs("right")}
              className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-purple-950/80 hover:bg-purple-900 border border-purple-400/40 text-purple-300 text-[10px] font-bold transition animate-pulse cursor-pointer"
            >
              <span>Diğer Katmanlar</span>
              <ChevronRight className="w-3 h-3" />
            </button>
          )}
        </div>

        {/* Scrollable container with edge fades */}
        <div className="relative group/layertabs">
          {canScrollLeft && (
            <div className="absolute left-0 top-0 bottom-0 z-10 flex items-center pr-3 bg-gradient-to-r from-slate-950 via-slate-950/90 to-transparent pointer-events-none">
              <button
                type="button"
                onClick={() => scrollTabs("left")}
                className="pointer-events-auto p-1 rounded-lg bg-slate-900 text-purple-300 border border-white/10 shadow cursor-pointer"
              >
                <ChevronLeft className="w-3 h-3" />
              </button>
            </div>
          )}

          {canScrollRight && (
            <div className="absolute right-0 top-0 bottom-0 z-10 flex items-center pl-3 bg-gradient-to-l from-slate-950 via-slate-950/90 to-transparent pointer-events-none">
              <button
                type="button"
                onClick={() => scrollTabs("right")}
                className="pointer-events-auto p-1 rounded-lg bg-purple-950 text-purple-300 border border-purple-500/30 shadow cursor-pointer animate-pulse"
              >
                <ChevronRight className="w-3 h-3" />
              </button>
            </div>
          )}

          <div
            ref={tabsContainerRef}
            className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none border-b border-white/5 scroll-smooth"
          >
            {layerTabs.map((tab, idx) => {
              const Icon = tab.icon;
              const isActive = activeLayerTab === tab.id;
              return (
                <button
                  key={`layer-tab-${tab.id}-${idx}`}
                  type="button"
                  onClick={() => setActiveLayerTab(tab.id as any)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold border whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 shrink-0 ${
                    isActive
                      ? "bg-slate-900 border-purple-500/60 text-white shadow-md shadow-purple-500/10"
                      : "bg-slate-950 border-white/5 text-slate-400 hover:text-slate-200"
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${tab.color}`} />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* TAB 1: 🌐 Yılın Panoraması (3 Ana Odak Kırılması) */}
      {activeLayerTab === "panorama" && (
        <div className="space-y-3 animate-in fade-in">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            
            {/* Focus 1: AI & Computing */}
            <div className="p-3.5 rounded-xl bg-blue-950/20 border border-blue-500/30 space-y-2">
              <div className="flex items-center gap-2 text-blue-400 font-bold text-xs">
                <Cpu className="w-4 h-4 text-blue-400" />
                <span>Yapay Zeka & Bilişim</span>
              </div>
              <p className="text-slate-300 text-xs font-sans leading-relaxed">
                {worldState.technologicalBreakthroughs.aiAndComputing}
              </p>
            </div>

            {/* Focus 2: Biology & Health */}
            <div className="p-3.5 rounded-xl bg-emerald-950/20 border border-emerald-500/30 space-y-2">
              <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs">
                <HeartPulse className="w-4 h-4 text-emerald-400" />
                <span>Biyoloji & Sağlık</span>
              </div>
              <p className="text-slate-300 text-xs font-sans leading-relaxed">
                {worldState.technologicalBreakthroughs.biologyAndHealth}
              </p>
            </div>

            {/* Focus 3: Energy & Infrastructure */}
            <div className="p-3.5 rounded-xl bg-amber-950/20 border border-amber-500/30 space-y-2">
              <div className="flex items-center gap-2 text-amber-400 font-bold text-xs">
                <Zap className="w-4 h-4 text-amber-400" />
                <span>Enerji & Altyapı</span>
              </div>
              <p className="text-slate-300 text-xs font-sans leading-relaxed">
                {worldState.technologicalBreakthroughs.energyAndInfra}
              </p>
            </div>

          </div>

          {/* TRL & Consensus Bar */}
          <div className="p-3 rounded-xl bg-slate-900 border border-white/5 flex flex-wrap items-center justify-between gap-3 text-[11px]">
            <div className="flex items-center gap-2">
              <span className="text-slate-400">Gelişim Aşaması (1-9):</span>
              <span className="px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-500/30 font-bold" title="Ufuk projeksiyonuna dayalı model tahmini gelişim aşaması">
                Aşama {worldState.scientificReadiness.trlLevel}/9
              </span>
              <span className="text-[10px] text-slate-400 font-mono">(Model Tahmini)</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-slate-400">Model Konsensus Projeksiyonu:</span>
              <span className="px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-500/30 font-bold">
                %{worldState.scientificReadiness.academicConsensusRate}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: 👤 Biyo-Yaşam & Sen (Kişisel Yaş Korelasyonu ve Sokaktaki İnsan) */}
      {activeLayerTab === "bio" && (
        <div className="space-y-3 animate-in fade-in">
          {/* User Birth Year Adjuster */}
          <div className="p-3 rounded-xl bg-slate-900 border border-white/10 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <User className="w-4 h-4 text-emerald-400" />
              <span className="text-white font-bold text-xs">Kişisel Simülasyon (Doğum Yılınız):</span>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="number"
                min={1940}
                max={2026}
                value={customBirthYear || ""}
                placeholder="Örn: 1995"
                onChange={(e) => {
                  const val = e.target.value ? Number(e.target.value) : undefined;
                  setCustomBirthYear(val);
                }}
                className="w-24 px-2 py-1 rounded-lg bg-slate-950 border border-white/20 text-emerald-300 font-bold text-xs text-center focus:outline-none focus:border-emerald-400"
              />
              {customBirthYear && customBirthYear >= 1940 && customBirthYear <= 2026 ? (
                <span className="text-slate-400 text-xs">
                  ➜ {milestone.year} Yılında <strong>{Math.max(0, milestone.year - customBirthYear)}</strong> Yaşındasınız
                </span>
              ) : (
                <span className="text-slate-500 text-xs">
                  ➜ Doğum yılınızı girerek yaşınızı hesaplayın
                </span>
              )}
            </div>
          </div>

          {/* Morning Routine Snippet */}
          <div className="p-4 rounded-xl bg-gradient-to-r from-emerald-950/30 via-slate-900 to-slate-950 border border-emerald-500/30 space-y-2">
            <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs">
              <Eye className="w-4 h-4 text-emerald-400" />
              <span>Sokaktaki İnsanın Sıradan Bir Sabahı:</span>
            </div>
            <p className="text-slate-200 text-xs font-sans leading-relaxed italic">
              "{worldState.dailyLifeAndBio.morningRoutineSnippet}"
            </p>
          </div>

          {/* Bio Interfaces */}
          <div className="p-3.5 rounded-xl bg-slate-900 border border-white/5 space-y-2">
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">
              Standart Biyolojik & Dijital Arayüzler:
            </span>
            <div className="flex flex-wrap gap-2">
              {worldState.dailyLifeAndBio.commonBioInterfaces.map((item, idx) => (
                <span
                  key={idx}
                  className="px-2.5 py-1 rounded-lg bg-slate-950 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-1.5"
                >
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  <span>{item}</span>
                </span>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: 💼 İş & Ekonomi Radarı (Otomasyon & Yeni Meslekler) */}
      {activeLayerTab === "economy" && (
        <div className="space-y-3 animate-in fade-in">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            
            {/* Automation Rate */}
            <div className="p-4 rounded-xl bg-amber-950/20 border border-amber-500/30 space-y-2 flex flex-col justify-between">
              <div>
                <span className="text-[10px] text-amber-400 font-bold uppercase block">
                  İşgücü Otomasyon & Ajanlaşma Oranı
                </span>
                <div className="text-2xl sm:text-3xl font-bold text-amber-300 pt-1">
                  %{worldState.macroEconomicsAndGeo.automatedJobsRate}
                </div>
              </div>
              <p className="text-slate-400 text-[11px] font-sans">
                Rutin bilişsel görevlerin, kodlamanın ve veri operasyonlarının otonom yapay zeka sürüleri tarafından devralınma yüzdesi.
              </p>
            </div>

            {/* Power Hub */}
            <div className="p-4 rounded-xl bg-cyan-950/20 border border-cyan-500/30 space-y-2 flex flex-col justify-between">
              <div>
                <span className="text-[10px] text-cyan-400 font-bold uppercase block">
                  Küresel Jeopolitik Güç Odağı
                </span>
                <div className="text-sm sm:text-base font-bold text-white pt-1">
                  {worldState.macroEconomicsAndGeo.geopoliticalPowerHub}
                </div>
              </div>
              <p className="text-slate-400 text-[11px] font-sans">
                Çip üretimi, kuantum altyapısı ve yapay zeka model eğitim merkezlerinin konsantre olduğu coğrafya.
              </p>
            </div>

          </div>

          {/* Emerging Professions */}
          <div className="p-3.5 rounded-xl bg-slate-900 border border-white/5 space-y-2">
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">
              {milestone.year} Yılında En Yüksek Talep Gören Yeni Meslekler:
            </span>
            <div className="flex flex-wrap gap-2">
              {worldState.macroEconomicsAndGeo.emergingProfessions.map((prof, idx) => (
                <span
                  key={idx}
                  className="px-2.5 py-1 rounded-lg bg-slate-950 border border-amber-500/30 text-amber-300 text-xs font-sans flex items-center gap-1.5"
                >
                  <TrendingUp className="w-3.5 h-3.5 text-amber-400" />
                  <span>{prof}</span>
                </span>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: ⚠️ Kritik Risk & Karşı Tedbir Radarı */}
      {activeLayerTab === "risk" && (
        <div className="space-y-3 animate-in fade-in">
          {/* Critical Threat */}
          <div className="p-4 rounded-xl bg-rose-950/30 border border-rose-500/40 space-y-2">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 text-rose-300 font-bold text-xs">
                <ShieldAlert className="w-4 h-4 text-rose-400 animate-pulse" />
                <span>O Yılın En Büyük Kırılganlığı & Tehdidi:</span>
              </div>
              <span className="px-2 py-0.5 rounded bg-rose-900/60 text-rose-200 border border-rose-500/40 text-[10px] font-bold">
                Kırılganlık Skoru: {worldState.riskAndCountermeasures.vulnerabilityScore}/100
              </span>
            </div>
            <p className="text-slate-200 text-xs font-sans leading-relaxed">
              {worldState.riskAndCountermeasures.criticalThreat}
            </p>
          </div>

          {/* Algorithmic Defenses & Regulatory Shields */}
          <div className="p-4 rounded-xl bg-emerald-950/20 border border-emerald-500/30 space-y-2">
            <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Geliştirilen Yasal & Algoritmik Kalkanlar (Countermeasures):</span>
            </div>
            <p className="text-slate-200 text-xs font-sans leading-relaxed">
              {worldState.riskAndCountermeasures.algorithmicDefenses}
            </p>
          </div>
        </div>
      )}

      {/* TAB 5: 🔗 Tetiklediği Gelecek (Domino Etkileri) */}
      {activeLayerTab === "domino" && (
        <div className="space-y-3 animate-in fade-in">
          <div className="p-3 rounded-xl bg-purple-950/20 border border-purple-500/30 space-y-2 text-[11px] font-sans">
            <div className="flex items-center gap-2 text-purple-300 font-bold font-mono text-xs">
              <GitFork className="w-4 h-4 text-purple-400" />
              <span>Nedensellik & Kelebek Etkisi Zinciri</span>
            </div>
            <p className="text-slate-300 leading-relaxed">
              {milestone.year} yılındaki <strong>"{milestone.title}"</strong> gelişmesi izole kalmaz; takip eden yıllardaki teknolojik ekosistemi şu 3 kritik noktada domino etkisiyle tetikler:
            </p>
          </div>

          <div className="space-y-2">
            {worldState.dominoEffects.map((domino, idx) => (
              <div
                key={idx}
                className="p-3 rounded-xl bg-slate-900/80 border border-white/10 hover:border-purple-500/40 flex items-start gap-2.5 transition-all"
              >
                <div className="p-1 rounded bg-purple-500/20 text-purple-300 font-mono font-bold text-[10px] shrink-0 mt-0.5">
                  #{idx + 1}
                </div>
                <p className="text-slate-200 text-xs font-sans leading-relaxed">
                  {domino}
                </p>
              </div>
            ))}
          </div>

          {/* Related Year Domino Jump Buttons */}
          {milestone.relatedYears && milestone.relatedYears.length > 0 && onSelectMilestone && (
            <div className="pt-2 border-t border-white/10 space-y-2">
              <span className="text-[11px] font-mono text-slate-400 font-bold flex items-center gap-1.5">
                <Compass className="w-3.5 h-3.5 text-purple-400" />
                <span>Tetiklenen Bağlantılı Yıllara Git:</span>
              </span>
              <div className="flex flex-wrap gap-2">
                {milestone.relatedYears.map((ryear, idx) => {
                  const targetM = TIMELINE_DATA.find((m) => m.year === ryear);
                  return (
                    <button
                      key={`rel-${ryear}-${idx}`}
                      type="button"
                      onClick={() => onSelectMilestone(ryear)}
                      className="px-3 py-1.5 rounded-xl bg-purple-950/60 hover:bg-purple-900 border border-purple-500/30 hover:border-purple-400 text-purple-200 hover:text-white font-mono text-xs font-bold transition flex items-center gap-1.5 cursor-pointer active:scale-95"
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-purple-400" />
                      <span>{ryear} Yılına Git</span>
                      {targetM && (
                        <span className="text-[10px] text-slate-400 font-sans hidden sm:inline">
                          ({targetM.title.slice(0, 20)}...)
                        </span>
                      )}
                      <ArrowRight className="w-3 h-3 text-purple-300" />
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}

    </div>
  );
};
