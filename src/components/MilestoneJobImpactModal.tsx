import React, { useState, useEffect, useMemo, useRef } from "react";
import { Milestone } from "../types";
import {
  ShieldAlert,
  X,
  Sparkles,
  ArrowRight,
  Briefcase,
  AlertTriangle,
  CheckCircle2,
  TrendingUp,
  Cpu,
  Brain,
  Zap,
  Target,
  RefreshCw,
  Layers,
  Sparkle,
} from "lucide-react";
import { useLanguage } from "../context/LanguageContext";
import { useAuth } from "../context/AuthContext";
import { aiService, MilestoneJobImpactData } from "../services/AIService";
import { getFiveLayerWorldState } from "../utils/worldStateResolver";

interface MilestoneJobImpactModalProps {
  milestone: Milestone | null;
  onClose: () => void;
  onNavigateToFullJobRisk?: (year: number, profession?: string) => void;
}

const PRESET_PROFESSIONS = [
  { id: "software", name: "Yazılım Geliştirici & Mühendis", category: "Bilişim" },
  { id: "doctor", name: "Doktor & Sağlık Uzmanı", category: "Sağlık" },
  { id: "designer", name: "Grafik & UI/UX Tasarımcı", category: "Yaratıcı" },
  { id: "finance", name: "Mali Müşavir & Finansal Analist", category: "Finans" },
  { id: "lawyer", name: "Avukat & Hukuk Danışmanı", category: "Hukuk" },
  { id: "teacher", name: "Öğretmen & Akademisyen", category: "Eğitim" },
  { id: "architect", name: "Mimar & İnşaat Mühendisi", category: "Mühendislik" },
  { id: "technician", name: "Elektrik, Robotik & Saha Teknisyeni", category: "Teknik" },
];

// Module-level cache to keep instant transitions when switching between presets
const impactCache = new Map<string, { data: MilestoneJobImpactData; source: string }>();

export const MilestoneJobImpactModal: React.FC<MilestoneJobImpactModalProps> = ({
  milestone,
  onClose,
  onNavigateToFullJobRisk,
}) => {
  const { language } = useLanguage();
  const isTr = language === "tr";
  const { currentUser } = useAuth();

  const userProfileProfession = currentUser?.profession?.trim() || "";

  const [selectedProfession, setSelectedProfession] = useState<string>("");
  const [customProfessionInput, setCustomProfessionInput] = useState<string>("");
  const [analyzedProfession, setAnalyzedProfession] = useState<string>("");
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [analysisStep, setAnalysisStep] = useState<string>("");
  const [aiResult, setAiResult] = useState<MilestoneJobImpactData | null>(null);
  const [aiSource, setAiSource] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const isMountedRef = useRef<boolean>(true);

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  const runAnalysis = async (targetProfession: string) => {
    if (!milestone) return;

    const trimmedProf = targetProfession.trim();
    if (!trimmedProf) return;

    const cacheKey = `${milestone.year}_${milestone.title}_${trimmedProf.toLowerCase()}`;
    const cached = impactCache.get(cacheKey);

    if (cached) {
      setAnalyzedProfession(trimmedProf);
      setAiResult(cached.data);
      setAiSource(cached.source);
      setErrorMsg(null);
      return;
    }

    setIsAnalyzing(true);
    setErrorMsg(null);
    setAnalysisStep(
      isTr
        ? `'${milestone.title}' dönüm noktası teknoloji parametreleri yükleniyor...`
        : `Loading '${milestone.title}' parameters...`
    );

    const stepTimer1 = setTimeout(() => {
      if (isMountedRef.current) {
        setAnalysisStep(
          isTr
            ? `Gemini bilişsel AI modeli '${trimmedProf}' görev matrisini analiz ediyor...`
            : `Gemini AI analyzing task matrix for '${trimmedProf}'...`
        );
      }
    }, 450);

    const stepTimer2 = setTimeout(() => {
      if (isMountedRef.current) {
        setAnalysisStep(
          isTr
            ? `Otomasyon etki katsayısı ve insani yetkinlik savunması sentezleniyor...`
            : `Synthesizing automation coefficients & human skill resilience...`
        );
      }
    }, 900);

    try {
      const response = await aiService.analyzeMilestoneJobImpact({
        milestoneTitle: milestone.title,
        milestoneYear: milestone.year,
        milestoneDescription: milestone.description || "",
        milestoneCategory: milestone.category || "Genel Teknoloji",
        profession: trimmedProf,
        seniorityLevel: currentUser?.seniority || "Orta Düzey / Profesyonel",
        industrySector: currentUser?.industrySector || "İlgili Sektör",
        userAge: currentUser?.age,
        language: isTr ? "tr" : "en",
      });

      if (!isMountedRef.current) return;

      if (response.success && response.data) {
        setAnalyzedProfession(trimmedProf);
        setAiResult(response.data);
        const sourceLabel = response.source || (isTr ? "Canlı Bilişsel Analiz Motoru" : "Live Cognitive Analysis Engine");
        setAiSource(sourceLabel);
        impactCache.set(cacheKey, { data: response.data, source: sourceLabel });
      } else {
        setErrorMsg(response.error || (isTr ? "Analiz oluşturulamadı." : "Analysis failed."));
      }
    } catch (err: any) {
      if (!isMountedRef.current) return;
      setErrorMsg(err.message || (isTr ? "Bağlantı hatası oluştu." : "Network error."));
    } finally {
      clearTimeout(stepTimer1);
      clearTimeout(stepTimer2);
      if (isMountedRef.current) {
        setIsAnalyzing(false);
      }
    }
  };

  // Reset modal state when milestone changes without automatically firing analysis
  useEffect(() => {
    setAiResult(null);
    setAiSource(null);
    setErrorMsg(null);
    setIsAnalyzing(false);
    setCustomProfessionInput("");
    setSelectedProfession(userProfileProfession);
    setAnalyzedProfession("");
  }, [milestone?.year, milestone?.title, userProfileProfession]);

  const year = milestone?.year || 2030;
  const worldState = milestone ? getFiveLayerWorldState(milestone) : null;
  const autoRate = worldState?.macroEconomicsAndGeo?.automatedJobsRate ?? Math.min(95, Math.round(20 + (year - 2026) * 2.2));

  // High-context fallback disrupted jobs if AI did not return them
  const fallbackDisruptedJobs = useMemo(() => {
    if (!milestone) return [];
    const titleLower = (milestone.title + " " + milestone.description).toLowerCase();

    if (titleLower.includes("kod") || titleLower.includes("yazılım") || titleLower.includes("agent") || titleLower.includes("ajan")) {
      return [
        { role: "Junior & Mid Frontend/Backend Yazılımcılar", risk: "Yüksek", why: "Kod iskeletleri, testler ve API entegrasyonları otonom ajanlarca saniyeler içinde tamamlanıyor." },
        { role: "Veri Giriş & Raporlama Analistleri", risk: "Kritik", why: "Veri temizleme, özetleme ve ETL süreçleri tam otonom zekalara devredildi." },
        { role: "Müşteri Destek & Çağrı Merkezi", risk: "Kritik", why: "Doğal dil ses sentezli otonom asistanlar ilk temasın %90'ını çözüyor." },
      ];
    }
    if (titleLower.includes("robot") || titleLower.includes("insansı") || titleLower.includes("otonom") || titleLower.includes("lojistik")) {
      return [
        { role: "Depo, İstifleme & Raf Düzenleme Görevlileri", risk: "Kritik", why: "Gelişmiş görme ve dokunsal tutuculara sahip insansı robotlar 24/7 vardiyasız çalışıyor." },
        { role: "Kargo, Kurye & Ağır Vasıta Şoförleri", risk: "Yüksek", why: "Seviye-4/5 otonom teslimat araçları ve drone hatları rutin sevkiyatı devralıyor." },
        { role: "Montaj Hattı İşçileri", risk: "Yüksek", why: "Esnek programlanabilir robot kollar marjinal işçilik maliyetini sıfıra yaklaştırıyor." },
      ];
    }
    if (titleLower.includes("tıp") || titleLower.includes("sağlık") || titleLower.includes("cerrahi") || titleLower.includes("biyoloji") || titleLower.includes("kanser")) {
      return [
        { role: "Radyoloji & Tıbbi Görüntü Analistleri", risk: "Yüksek", why: "Multi-modal yapay zeka erken teşhiste %99.4 doğrulukla insan gözünü geride bırakıyor." },
        { role: "Rutin Tıbbi Laboratuvar Teknisyenleri", risk: "Yüksek", why: "Mikro-akışkan robotik çipler ve oto-analizörler numuneleri insansız işliyor." },
        { role: "Reçete ve Temel Teşhis Hekimliği", risk: "Orta", why: "AI teşhis protokolleri ve tele-tıp sistemleri ön elemeyi otonomlaştırıyor." },
      ];
    }
    if (titleLower.includes("kuantum") || titleLower.includes("şifre") || titleLower.includes("güvenlik")) {
      return [
        { role: "Geleneksel RSA/ECC Kriptografi Uzmanları", risk: "Kritik", why: "Kuantum algoritmaları klasik anahtar altyapılarını geçersiz kılıyor." },
        { role: "Manuel Ağ & Güvenlik Duvarı Yöneticileri", risk: "Yüksek", why: "Otonom kuantum güvenli adaptif protokoller anlık rekonfigürasyon yapıyor." },
      ];
    }
    return [
      { role: "Rutin Ofis & Dokümantasyon Memurları", risk: "Yüksek", why: "Kural tabanlı tüm masa başı süreçler bu aşamada yapay zekaya aktarılıyor." },
      { role: "Orta Kademe Koordinatörler", risk: "Orta", why: "İş dağılımı ve görev atamaları algoritmik orkestrasyon motorları tarafından yapılıyor." },
      { role: "Manuel Kontrol & Denetim Elemanları", risk: "Yüksek", why: "Sensör ağları ve görüntü işleme süreçleri sürekli denetliyor." },
    ];
  }, [milestone]);

  const activeDisruptedJobs = (aiResult?.milestoneDisruptedOccupations && aiResult.milestoneDisruptedOccupations.length > 0)
    ? aiResult.milestoneDisruptedOccupations
    : fallbackDisruptedJobs;

  const activeEmergingRoles = (aiResult?.emergingHybridRoles && aiResult.emergingHybridRoles.length > 0)
    ? aiResult.emergingHybridRoles
    : (worldState?.macroEconomicsAndGeo?.emergingProfessions ?? [
        `${year} Biyo-Algoritmik Arayüz Mimarı`,
        "Otonom Filo Güvenlik Sorumlusu",
        "Sentetik Zeka Uyum Denetçisi",
      ]);

  const handleManualAnalyze = () => {
    const profToAnalyze = customProfessionInput.trim() || selectedProfession;
    if (!profToAnalyze) {
      setErrorMsg(
        isTr
          ? "Lütfen yukarıdaki hazır mesleklerden birini seçin veya kutuya mesleğinizi yazın."
          : "Please select a preset profession or type your title above."
      );
      return;
    }
    setErrorMsg(null);
    runAnalysis(profToAnalyze);
  };

  const getRiskBadgeStyles = (level: string) => {
    switch (level) {
      case "Kritik":
        return "text-rose-400 border-rose-500/50 bg-rose-950/50 shadow-rose-950/50";
      case "Yüksek":
        return "text-orange-400 border-orange-500/50 bg-orange-950/50 shadow-orange-950/50";
      case "Orta":
        return "text-amber-400 border-amber-500/50 bg-amber-950/50 shadow-amber-950/50";
      case "Düşük":
      default:
        return "text-emerald-400 border-emerald-500/50 bg-emerald-950/50 shadow-emerald-950/50";
    }
  };

  if (!milestone) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 md:p-6 bg-black/85 backdrop-blur-md overflow-y-auto animate-fadeIn">
      <div className="relative w-full max-w-3xl my-auto rounded-2xl bg-[#0a0e1a] border border-cyan-500/30 shadow-2xl shadow-cyan-950/40 overflow-hidden text-slate-100 flex flex-col max-h-[94vh]">
        {/* Top Header Bar */}
        <div className="p-4 sm:p-5 bg-gradient-to-r from-slate-900 via-indigo-950/50 to-slate-900 border-b border-white/10 flex items-start justify-between gap-3">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-2.5 py-0.5 rounded-md bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-mono text-xs font-bold flex items-center gap-1.5">
                <ShieldAlert className="w-3.5 h-3.5 text-cyan-400" />
                <span>{year} DÖNÜM NOKTASI MESLEK ETKİSİ</span>
              </span>
              <span className="px-2 py-0.5 rounded-md bg-white/5 text-slate-300 font-mono text-xs">
                {milestone.category}
              </span>
              {aiSource && (
                <span className="px-2 py-0.5 rounded-md bg-purple-500/20 text-purple-300 border border-purple-500/40 font-mono text-[11px] font-semibold flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-purple-400" />
                  <span>{aiSource.includes("Gemini") ? "✨ Gemini Canlı AI Analizi" : aiSource}</span>
                </span>
              )}
            </div>
            <h2 className="text-lg sm:text-xl font-black text-white tracking-tight">
              {milestone.title}
            </h2>
            <p className="text-xs text-slate-300 font-sans leading-relaxed">
              Bu spesifik teknolojik kırılmanın mesleğinize, günlük görevlerinize ve gelecekteki değerinize doğrudan etkisini inceleyin.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Kapat"
            className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white border border-white/10 transition-colors shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-6 text-sm">
          {/* Milestone Automation Intensity Overview */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="p-3.5 rounded-xl bg-slate-900/80 border border-white/10 flex flex-col justify-between">
              <span className="text-xs text-slate-400 font-mono flex items-center gap-1">
                <TrendingUp className="w-3.5 h-3.5 text-cyan-400" />
                <span>Makro Otomasyon Oranı ({year})</span>
              </span>
              <div className="mt-2 flex items-baseline gap-2">
                <span className="text-2xl sm:text-3xl font-black text-cyan-400 font-mono">%{autoRate}</span>
                <span className="text-[11px] text-slate-400">küresel ortalama</span>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-900/80 border border-white/10 flex flex-col justify-between">
              <span className="text-xs text-slate-400 font-mono flex items-center gap-1">
                <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
                <span>Birincil Etki Alanı</span>
              </span>
              <div className="mt-2">
                <span className="text-sm font-bold text-amber-300 line-clamp-2">
                  {milestone.category} &amp; İlgili İcraat
                </span>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-900/80 border border-white/10 flex flex-col justify-between">
              <span className="text-xs text-slate-400 font-mono flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                <span>Doğan Yeni Hibrit Alanlar</span>
              </span>
              <div className="mt-2">
                <span className="text-sm font-bold text-emerald-300">
                  {activeEmergingRoles.length}+ Yeni Uzmanlık
                </span>
              </div>
            </div>
          </div>

          {/* Section: Interactive "Test My Profession Against This Milestone" */}
          <div className="p-4 sm:p-5 rounded-xl bg-gradient-to-b from-slate-900/95 to-[#0b1020] border border-cyan-500/30 space-y-4 shadow-lg">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-2 text-xs font-mono font-bold text-cyan-300">
                <Target className="w-4 h-4 text-cyan-400" />
                <span>KENDİ MESLEĞİNİZİ BU DÖNÜM NOKTASINA KARŞI TEST EDİN</span>
              </div>
              <span className="text-[11px] text-slate-400 flex items-center gap-1">
                <Brain className="w-3.5 h-3.5 text-purple-400" />
                <span>Bağlamsal Yapay Zeka Analizi</span>
              </span>
            </div>

            {/* Profession Selection */}
            <div className="space-y-2.5">
              <div className="flex items-center justify-between gap-2 flex-wrap">
                <label className="text-xs text-slate-300 font-medium">
                  {isTr
                    ? "Aşağıdan mesleğinizi seçin veya arama kutusuna yazarak doğrudan test edin:"
                    : "Select your profession below or enter custom title:"}
                </label>
                {userProfileProfession && (
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedProfession(userProfileProfession);
                      setCustomProfessionInput("");
                      setErrorMsg(null);
                    }}
                    className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition-all flex items-center gap-1 cursor-pointer border ${
                      selectedProfession === userProfileProfession
                        ? "bg-purple-600 text-white border-purple-400 shadow-sm"
                        : "bg-purple-500/20 text-purple-300 border-purple-500/40 hover:bg-purple-500/30"
                    }`}
                  >
                    <Sparkles className="w-3 h-3 text-purple-400" />
                    <span>{isTr ? `Profil Mesleğimi Seç (${userProfileProfession})` : `Select Profile: ${userProfileProfession}`}</span>
                  </button>
                )}
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
                {PRESET_PROFESSIONS.map((p, pIdx) => {
                  const isSelected = (selectedProfession === p.name && !customProfessionInput) || (analyzedProfession === p.name && !customProfessionInput);
                  return (
                    <button
                      key={`prof-preset-${p.id || 'prof'}-${pIdx}`}
                      type="button"
                      onClick={() => {
                        setSelectedProfession(p.name);
                        setCustomProfessionInput("");
                        setErrorMsg(null);
                      }}
                      className={`px-2.5 py-2 rounded-lg text-left text-xs font-medium transition-all truncate border cursor-pointer ${
                        isSelected
                          ? "bg-cyan-600/30 text-cyan-200 border-cyan-400 shadow-sm font-semibold"
                          : "bg-slate-800/60 text-slate-300 border-white/5 hover:border-white/20 hover:bg-slate-800"
                      }`}
                    >
                      {p.name}
                    </button>
                  );
                })}
              </div>

              {selectedProfession && !customProfessionInput && (
                <div className="flex items-center justify-between px-3 py-1.5 rounded-lg bg-cyan-950/40 border border-cyan-500/30 text-xs text-cyan-300 font-mono">
                  <span>{isTr ? `Seçilen: ${selectedProfession}` : `Selected: ${selectedProfession}`}</span>
                  <span className="text-[11px] text-slate-400">{isTr ? "Analiz için butona tıklayın ➔" : "Click analyze ➔"}</span>
                </div>
              )}

              <div className="flex items-center gap-2 mt-2">
                <div className="relative flex-1">
                  <input
                    type="text"
                    value={customProfessionInput}
                    onChange={(e) => {
                      setCustomProfessionInput(e.target.value);
                      if (e.target.value) {
                        setSelectedProfession("");
                      }
                      if (errorMsg) setErrorMsg(null);
                    }}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") handleManualAnalyze();
                    }}
                    placeholder={isTr ? "Veya istediğiniz mesleği yazın (ör: 'Mali Müşavir', 'Veteriner', 'İnşaat Mühendisi', 'Aşçı')..." : "Or enter custom profession..."}
                    className="w-full px-3 py-2.5 rounded-lg bg-slate-950 border border-white/10 text-white text-xs placeholder-slate-500 focus:outline-none focus:border-cyan-400 transition-colors"
                  />
                </div>
                <button
                  type="button"
                  onClick={handleManualAnalyze}
                  disabled={isAnalyzing || (!customProfessionInput.trim() && !selectedProfession)}
                  className="px-4 py-2.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-mono text-xs font-bold transition-all shadow-md shadow-cyan-600/30 flex items-center gap-1.5 cursor-pointer shrink-0 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  {isAnalyzing ? (
                    <Cpu className="w-3.5 h-3.5 animate-spin text-white" />
                  ) : (
                    <Zap className="w-3.5 h-3.5 text-white" />
                  )}
                  <span>{isAnalyzing ? (isTr ? "Analiz Ediliyor..." : "Analyzing...") : (isTr ? "Etkiyi Analiz Et" : "Analyze Impact")}</span>
                </button>
              </div>
            </div>

            {/* Initial Waiting State (No analysis requested yet) */}
            {!aiResult && !isAnalyzing && !errorMsg && (
              <div className="p-6 rounded-xl bg-slate-950/60 border border-cyan-500/20 text-center space-y-3 animate-fadeIn">
                <div className="w-12 h-12 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center mx-auto text-cyan-400">
                  <Target className="w-6 h-6" />
                </div>
                <div className="space-y-1">
                  <h3 className="font-bold text-white text-sm sm:text-base">
                    {isTr ? "Mesleğinizi Seçin ve Analizi Başlatın" : "Select Your Profession to Analyze"}
                  </h3>
                  <p className="text-xs text-slate-400 max-w-lg mx-auto leading-relaxed">
                    {isTr
                      ? `'${milestone.title}' (${year}) teknolojisinin mesleğinize somut etkisini, devredilecek görevleri ve vazgeçilmez yetkinlikleri incelemek için yukarıdaki hazır mesleklerden birine tıklayın veya kutuya kendi unvanınızı yazıp 'Etkiyi Analiz Et' butonuna basın.`
                      : `Click one of the preset professions above or type your title and press 'Analyze Impact' to generate real-time AI projections for '${milestone.title}' (${year}).`}
                  </p>
                </div>
                <div className="flex flex-wrap items-center justify-center gap-2 pt-1 text-[11px] text-cyan-300/80 font-mono">
                  <span className="px-2.5 py-1 rounded-md bg-white/5 border border-white/5 flex items-center gap-1">
                    <TrendingUp className="w-3 h-3 text-cyan-400" />
                    <span>{isTr ? "Otomasyon Riski" : "Automation Risk"}</span>
                  </span>
                  <span className="px-2.5 py-1 rounded-md bg-white/5 border border-white/5 flex items-center gap-1">
                    <AlertTriangle className="w-3 h-3 text-rose-400" />
                    <span>{isTr ? "Devredilecek Görevler" : "Automated Tasks"}</span>
                  </span>
                  <span className="px-2.5 py-1 rounded-md bg-white/5 border border-white/5 flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                    <span>{isTr ? "Vazgeçilmez Yetkinlikler" : "Resilient Skills"}</span>
                  </span>
                  <span className="px-2.5 py-1 rounded-md bg-white/5 border border-white/5 flex items-center gap-1">
                    <Sparkles className="w-3 h-3 text-purple-400" />
                    <span>{isTr ? "Doğan Hibrit Roller" : "Emerging Roles"}</span>
                  </span>
                </div>
              </div>
            )}

            {/* Live Loading State */}
            {isAnalyzing && (
              <div className="p-4 rounded-xl bg-slate-950/80 border border-cyan-500/30 space-y-2 animate-pulse text-center">
                <div className="flex items-center justify-center gap-2 text-cyan-400 font-mono text-xs font-semibold">
                  <Cpu className="w-4 h-4 animate-spin text-cyan-300" />
                  <span>{analysisStep || "Yapay zeka analiz motoru çalışıyor..."}</span>
                </div>
                <p className="text-[11px] text-slate-400">
                  {milestone.title} ({year}) ile seçtiğiniz meslek arasındaki sebep-sonuç matrisi hesaplanıyor.
                </p>
              </div>
            )}

            {/* Error Message with Retry */}
            {errorMsg && !isAnalyzing && (
              <div className="p-3.5 rounded-xl bg-rose-950/40 border border-rose-500/40 text-rose-200 text-xs flex items-center justify-between gap-2">
                <span>{errorMsg}</span>
                <button
                  type="button"
                  onClick={() => runAnalysis(customProfessionInput.trim() || selectedProfession)}
                  className="px-2.5 py-1 rounded bg-rose-600 hover:bg-rose-500 text-white font-mono text-xs flex items-center gap-1 cursor-pointer"
                >
                  <RefreshCw className="w-3 h-3" />
                  <span>Tekrar Dene</span>
                </button>
              </div>
            )}

            {/* Live Real AI Test Result Display */}
            {aiResult && !isAnalyzing && (
              <div className="p-4 sm:p-5 rounded-xl bg-slate-950/90 border border-cyan-500/40 space-y-4 animate-fadeIn">
                {/* Result Header */}
                <div className="flex items-center justify-between flex-wrap gap-2 pb-3 border-b border-white/10">
                  <div className="flex items-center gap-2">
                    <Briefcase className="w-4 h-4 text-cyan-400" />
                    <span className="font-bold text-white text-sm sm:text-base">
                      {aiResult.profession}
                    </span>
                    <span className="text-xs text-slate-400 font-mono">
                      • {year} Analiz Çıktısı
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-mono font-bold border shadow-sm ${getRiskBadgeStyles(
                        aiResult.riskLevel
                      )}`}
                    >
                      Otomasyon Riski: %{aiResult.riskPercent} ({aiResult.riskLevel} Seviye)
                    </span>
                  </div>
                </div>

                {/* Direct Impact Summary Banner */}
                <div className="p-3.5 rounded-xl bg-gradient-to-r from-cyan-950/40 via-indigo-950/30 to-purple-950/30 border border-cyan-500/30 text-xs text-cyan-100 leading-relaxed space-y-1">
                  <div className="flex items-center gap-1.5 font-mono text-cyan-300 font-bold text-[11px]">
                    <Layers className="w-3.5 h-3.5 text-cyan-400" />
                    <span>BU TEKNOLOJİNİN MESLEĞİNİZE DOĞRUDAN ETKİSİ (BAĞLAMSAL ÖZET)</span>
                  </div>
                  <p className="text-slate-200">{aiResult.directImpactSummary}</p>
                </div>

                {/* Two Column Task and Skill Breakdown */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div className="p-3.5 rounded-xl bg-rose-950/20 border border-rose-500/20 space-y-2">
                    <span className="font-mono font-bold text-rose-300 flex items-center gap-1.5">
                      <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
                      <span>Bu Dönüm Noktasında Otomatikleşecek Görevler:</span>
                    </span>
                    <ul className="space-y-1.5 text-slate-300">
                      {aiResult.automatedTasks?.map((task, idx) => (
                        <li key={idx} className="flex items-start gap-2">
                          <span className="text-rose-400 font-bold shrink-0">•</span>
                          <span className="leading-snug">{task}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="p-3.5 rounded-xl bg-emerald-950/20 border border-emerald-500/20 space-y-2">
                    <span className="font-mono font-bold text-emerald-300 flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Vazgeçilmez ve 10x Değer Kazanacak Yetkinlikler:</span>
                    </span>
                    <ul className="space-y-1.5 text-slate-300">
                      {aiResult.indispensableSkills?.map((skill, idx) => (
                        <li key={idx} className="flex items-start gap-2">
                          <span className="text-emerald-400 font-bold shrink-0">•</span>
                          <span className="leading-snug">{skill}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Strategic Action Recommendation */}
                <div className="p-3.5 rounded-xl bg-indigo-950/30 border border-indigo-500/30 text-xs text-indigo-100 leading-relaxed space-y-1">
                  <span className="font-mono font-bold text-indigo-300 flex items-center gap-1.5">
                    <Sparkle className="w-3.5 h-3.5 text-indigo-400" />
                    <span>{year} Yılı Stratejik Adaptasyon Tavsiyesi:</span>
                  </span>
                  <p className="text-slate-200">{aiResult.recommendation}</p>
                </div>

                {/* Timeline Synergy note if available */}
                {aiResult.timelineSynergy && (
                  <div className="text-[11px] font-mono text-slate-400 flex items-center gap-1.5">
                    <span className="text-cyan-400">◆</span>
                    <span>{aiResult.timelineSynergy}</span>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Section: Directly Disrupted Occupations in the wider economy */}
          <div className="space-y-2.5">
            <div className="flex items-center gap-2 text-xs font-mono font-bold text-rose-300">
              <ShieldAlert className="w-4 h-4 text-rose-400" />
              <span>BU TEKNOLOJİNİN ({year}) GENEL EKONOMİDE DÖNÜŞTÜRDÜĞÜ DİĞER ROLLER</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              {activeDisruptedJobs.map((item, idx) => (
                <div
                  key={idx}
                  className="p-3 rounded-xl bg-rose-950/20 border border-rose-500/20 hover:border-rose-500/40 transition-colors flex flex-col justify-between gap-2"
                >
                  <div>
                    <div className="flex items-center justify-between gap-1 mb-1">
                      <span className="text-xs font-bold text-white leading-tight">{item.role}</span>
                      <span
                        className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded ${
                          item.risk === "Kritik"
                            ? "bg-rose-500/30 text-rose-300 border border-rose-500/40"
                            : "bg-amber-500/30 text-amber-300 border border-amber-500/40"
                        }`}
                      >
                        {item.risk}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-300 leading-relaxed">{item.why}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Section: Emerging Hybrid Roles */}
          <div className="space-y-2.5">
            <div className="flex items-center gap-2 text-xs font-mono font-bold text-emerald-300">
              <Sparkles className="w-4 h-4 text-emerald-400" />
              <span>BU GELİŞMEYLE DOĞAN YENİ HİBRİT MESLEKLER ({year})</span>
            </div>

            <div className="flex flex-wrap gap-2">
              {activeEmergingRoles.map((role, idx) => (
                <div
                  key={idx}
                  className="px-3 py-1.5 rounded-lg bg-emerald-950/30 border border-emerald-500/30 text-emerald-200 text-xs font-medium flex items-center gap-1.5"
                >
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  <span>{role}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Modal Bottom Footer Actions */}
        <div className="p-4 bg-slate-950 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="text-xs text-slate-400 text-center sm:text-left">
            <span>2026-2060 arası tüm yıllar için kapsamlı maaş ve otomasyon eğrisini mi istiyorsunuz?</span>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 sm:flex-initial px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-colors cursor-pointer"
            >
              Kapat
            </button>

            {onNavigateToFullJobRisk && (
              <button
                type="button"
                onClick={() => {
                  const prof = analyzedProfession || customProfessionInput.trim() || selectedProfession;
                  onClose();
                  onNavigateToFullJobRisk(year, prof);
                }}
                className="flex-1 sm:flex-initial px-4 py-2 rounded-xl bg-gradient-to-r from-rose-600 to-orange-600 hover:from-rose-500 hover:to-orange-500 text-white font-mono text-xs font-bold transition-all shadow-lg shadow-rose-600/30 flex items-center justify-center gap-1.5 group cursor-pointer"
              >
                <span>2060'a Kadar Tam Kariyer Raporunu Aç</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
