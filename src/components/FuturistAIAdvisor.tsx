import React, { useState, useEffect } from "react";
import { Milestone, ViewMode } from "../types";
import { UserProfile } from "./UserAuthModal";
import { useAuth } from "../context/AuthContext";
import {
  Sparkles,
  Bot,
  User,
  Briefcase,
  TrendingUp,
  ShieldCheck,
  Zap,
  ArrowRight,
  RefreshCw,
  Award,
  BookOpen,
  Send,
  Radio,
  MapPin,
} from "lucide-react";
import { getFiveLayerWorldState } from "../utils/worldStateResolver";
import { AIService, aiService, CareerAdvisorAdvice } from "../services/AIService";

interface FuturistAIAdvisorProps {
  milestones: Milestone[];
  onNavigateToMilestone?: (year: number) => void;
  currentUser?: UserProfile | null;
  onNavigateToView?: (view: ViewMode, targetYear?: number) => void;
}

export const FuturistAIAdvisor: React.FC<FuturistAIAdvisorProps> = ({
  milestones,
  onNavigateToMilestone,
  currentUser: propCurrentUser,
  onNavigateToView,
}) => {
  const auth = useAuth();
  const currentUser = propCurrentUser !== undefined ? propCurrentUser : auth.currentUser;

  const [currentAge, setCurrentAge] = useState<number>(() => currentUser?.age || 28);
  const [profession, setProfession] = useState<string>(() => currentUser?.profession || currentUser?.lifeRoleLabel || "");
  const [targetHorizonYear, setTargetHorizonYear] = useState<number>(2060);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [advisorResult, setAdvisorResult] = useState<CareerAdvisorAdvice | null>(null);

  // Sync with profile if updated from outside
  useEffect(() => {
    if (currentUser?.age) {
      setCurrentAge(currentUser.age);
    }
    if (currentUser?.profession) {
      setProfession(currentUser.profession);
    }
  }, [currentUser]);

  if (!currentUser) {
    return (
      <div className="bg-slate-900/60 border border-purple-500/30 rounded-3xl p-8 sm:p-12 text-center space-y-6 shadow-2xl animate-fadeIn">
        <div className="w-16 h-16 rounded-3xl bg-purple-500/20 border border-purple-400/40 text-purple-300 mx-auto flex items-center justify-center shadow-lg shadow-purple-500/20">
          <Sparkles className="w-8 h-8 text-purple-400 animate-pulse" />
        </div>
        <div className="space-y-2 max-w-md mx-auto">
          <h3 className="text-xl font-bold text-white font-mono">
            2060 Futurist AI Gelecek Danışmanı
          </h3>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-sans">
            Yaşınıza, mesleğinize ve kişisel hedeflerinize özel 2026–2060 kariyer ve biyo-yaşam danışmanlığı almak için lütfen giriş yapın.
          </p>
        </div>
        <button
          type="button"
          onClick={() => auth.openAuthModal()}
          className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-xs shadow-lg shadow-purple-600/30 transition cursor-pointer"
        >
          Giriş Yap / Ücretsiz Kaydol
        </button>
      </div>
    );
  }

  const calculateDefaultAdvice = (age: number, job: string, horizon: number): CareerAdvisorAdvice => {
    const ageAtHorizon = Math.max(0, horizon - (2026 - age));
    const targetMilestone = milestones.find((m) => m.year === horizon) || milestones[milestones.length - 1];
    const worldState = getFiveLayerWorldState(targetMilestone, 2026 - age);

    return {
      lifeAgeAtHorizon: ageAtHorizon,
      predictedJobStatus: `${job} mesleği ${horizon} yılında %${worldState.macroEconomicsAndGeo.automatedJobsRate} oranında otonomlaşmıştır. İnsan rolü 'Sistem Yöneticiliği'nden 'Bilinç & Etik Küratörlüğü'ne evrilmiştir.`,
      recommendedSkills: [
        "Ajan Orkestrasyonu & Biyo-Algoritma Tasarımı",
        "Kuantum Şifreli Veri & Bilişsel Mahremiyet Koruma",
        "İnsan-Makine Nöral Arayüz (BCI) Adaptasyonu",
        "Sentetik Biyoloji & Genetik Sağlık Portföy Yönetimi",
      ],
      bioAdaptationRoadmap: [
        `2030 (Yaş: ${age + 4}): Kişisel mRNA aşıları ve sürekli hücresel vital takip standartlaşır.`,
        `2040 (Yaş: ${age + 14}): Nöral arayüz (BCI) ve doku içi biyo-sensörlerle düşünce hızıyla çalışma çağı.`,
        `2050 (Yaş: ${age + 24}): Telomer onarımı ve biyolojik yaş geriletme ile 80 yaşındayken 40 yaş hücresel zindeliği.`,
        `2060 (Yaş: ${ageAtHorizon}): Post-biyolojik sentetik zeka kolektifleri ve dijital bilinç yedeklemesi.`,
      ],
      wealthAndAssetAdvice: "Fiziksel gayrimenkul yerine kuantum hesaplama hisseleri, sentetik biyoloji patent fonları ve dağıtık enerji depolama ağlarına yatırım yapın.",
      ethicalWarning: "2040 sonrası nöro-haklar sözleşmelerini inceleyin; düşünce gizliliğinizi şirket bulutlarına emanet etmeyin.",
      tailoredExecutiveSummary: `${horizon} yılında ${ageAtHorizon} yaşındayken, bugünkü standart çalışma modeli yerine kişisel AI ajan kümenizle yönettiğiniz bir 'Gelecek Yaşam Portföyü'ne sahip olacaksınız.`,
    };
  };

  const handleGenerateAdvice = async () => {
    setIsLoading(true);
    try {
      const response = await aiService.getCareerAdvice({
        currentAge,
        profession,
        targetHorizonYear,
      });

      if (response && response.success && response.advice) {
        setAdvisorResult(response.advice);
      } else {
        // Fallback to local 5-layer synthesized advice
        setAdvisorResult(calculateDefaultAdvice(currentAge, profession, targetHorizonYear));
      }
    } catch (e) {
      setAdvisorResult(calculateDefaultAdvice(currentAge, profession, targetHorizonYear));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-slate-900/60 border border-purple-500/30 rounded-3xl p-6 lg:p-8 space-y-6 shadow-2xl relative overflow-hidden">
      {/* Background Glow */}
      <div className="absolute -right-20 -top-20 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/10 pb-5">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/30 text-purple-300 font-mono text-xs font-bold uppercase">
            <Bot className="w-3.5 h-3.5 text-purple-400" />
            <span>Fütürist AI Kariyer & Biyo-Yaşam Danışmanı (2026—2060)</span>
          </div>
          <h2 className="text-2xl lg:text-3xl font-bold text-white tracking-tight">
            5 Katmanlı Gelecek Simülasyonu: 2060'ta Nerede Olacaksınız?
          </h2>
          <p className="text-slate-400 text-xs font-sans max-w-2xl">
            Yaşınızı ve mevcut mesleğinizi girin; sistem 5 katmanlı dünya durumu matrisini sentezleyerek 2060 yılına kadar karşılaşacağınız biyolojik, mesleki ve finansal adaptasyon yol haritanızı çıkarsın.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[10px] font-mono px-3 py-1 rounded-full bg-purple-950 border border-purple-500/40 text-purple-300 font-bold">
            🧠 5-Layer Synthesis Engine
          </span>
        </div>
      </div>

      {/* User Inputs Form */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 font-mono text-xs">
        <div className="p-4 rounded-2xl bg-slate-950/80 border border-white/10 space-y-2">
          <label className="text-slate-400 font-bold uppercase block flex items-center gap-1.5">
            <User className="w-3.5 h-3.5 text-emerald-400" />
            <span>Mevcut Yaşınız:</span>
          </label>
          <input
            type="number"
            min={15}
            max={90}
            value={currentAge}
            onChange={(e) => setCurrentAge(Number(e.target.value) || 28)}
            className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-white/20 text-emerald-300 font-bold text-base focus:outline-none focus:border-emerald-400"
          />
          <span className="text-[10px] text-slate-500">
            2060 yılında: <strong>{currentAge + 34}</strong> yaşında olacaksınız.
          </span>
        </div>

        <div className="p-4 rounded-2xl bg-slate-950/80 border border-white/10 space-y-2">
          <label className="text-slate-400 font-bold uppercase block flex items-center gap-1.5">
            <Briefcase className="w-3.5 h-3.5 text-amber-400" />
            <span>Mevcut Mesleğiniz / Uzmanlığınız:</span>
          </label>
          <input
            type="text"
            value={profession}
            onChange={(e) => setProfession(e.target.value)}
            placeholder="Örn: Doktor, Yazılımcı, Mimar, Öğretmen..."
            className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-white/20 text-amber-300 font-bold text-sm focus:outline-none focus:border-amber-400"
          />
          <span className="text-[10px] text-slate-500">
            Otomasyon ve yapay zeka riski hesaplanacak.
          </span>
        </div>

        <div className="p-4 rounded-2xl bg-slate-950/80 border border-white/10 space-y-2 flex flex-col justify-between">
          <div>
            <label className="text-slate-400 font-bold uppercase block flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5 text-cyan-400" />
              <span>Hedef Projeksiyon Yılı:</span>
            </label>
            <select
              value={targetHorizonYear}
              onChange={(e) => setTargetHorizonYear(Number(e.target.value))}
              className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-white/20 text-cyan-300 font-bold text-sm focus:outline-none focus:border-cyan-400 cursor-pointer"
            >
              <option value={2035}>2035 — BCI & Otonom Ajanlar</option>
              <option value={2045}>2045 — Kuantum İnternet & AGI</option>
              <option value={2055}>2055 — Sentetik Biyoloji & Uzay</option>
              <option value={2060}>2060 — Singularity & Homo Sapiens 2.0</option>
            </select>
          </div>

          <button
            type="button"
            onClick={handleGenerateAdvice}
            disabled={isLoading}
            className="w-full py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-extrabold text-xs uppercase flex items-center justify-center gap-2 transition-all shadow-lg shadow-purple-500/20 cursor-pointer disabled:opacity-50"
          >
            {isLoading ? (
              <>
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                <span>5 Katmanlı Matris Hesaplanıyor...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-3.5 h-3.5" />
                <span>Kişisel Gelecek Raporunu Üret</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Advisor Result Output */}
      {advisorResult && (
        <div className="space-y-4 animate-in fade-in pt-2">
          {/* Executive Summary Card */}
          <div className="p-5 rounded-2xl bg-gradient-to-r from-purple-950/40 via-indigo-950/30 to-slate-950 border border-purple-500/40 space-y-2 font-mono shadow-xl">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <span className="text-xs font-bold text-purple-300 uppercase flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-purple-400" />
                <span>2060 Fütürist Yönetici Özeti (AI Sentezi)</span>
              </span>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded-md bg-purple-900/60 text-purple-300 border border-purple-400/30 text-[10px] font-mono">
                  Olasılıksal AI Projeksiyonu
                </span>
                <span className="px-2.5 py-0.5 rounded-full bg-purple-500/20 text-purple-200 border border-purple-500/40 text-[10px] font-bold">
                  {targetHorizonYear} Yılında Yaş: {advisorResult.lifeAgeAtHorizon}
                </span>
              </div>
            </div>
            <p className="text-slate-100 text-sm font-sans leading-relaxed">
              "{advisorResult.tailoredExecutiveSummary}"
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 font-mono text-xs">
            {/* Job Status & Recommended Skills */}
            <div className="p-4 rounded-2xl bg-slate-950/80 border border-white/10 space-y-3">
              <div className="flex items-center gap-2 text-amber-400 font-bold">
                <Briefcase className="w-4 h-4 text-amber-400" />
                <span>Mesleki Evrim & Otomasyon Tahmini</span>
              </div>
              <p className="text-slate-300 text-xs font-sans leading-relaxed">
                {advisorResult.predictedJobStatus}
              </p>

              <div className="space-y-1.5 pt-2 border-t border-white/5">
                <span className="text-[10px] text-amber-400 font-bold uppercase block">
                  Kazanmanız Gereken 4 Kritik Gelecek Yetkinliği:
                </span>
                <div className="space-y-1">
                  {(advisorResult.recommendedSkills || []).map((skill, idx) => (
                    <div key={idx} className="flex items-center gap-2 text-slate-200 text-xs font-sans">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-400 shrink-0" />
                      <span>{skill}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Bio Adaptation Roadmap */}
            <div className="p-4 rounded-2xl bg-slate-950/80 border border-white/10 space-y-3">
              <div className="flex items-center gap-2 text-emerald-400 font-bold">
                <TrendingUp className="w-4 h-4 text-emerald-400" />
                <span>Biyolojik & Sağlık Adaptasyon Patikanız</span>
              </div>
              <div className="space-y-2">
                {(advisorResult.bioAdaptationRoadmap || []).map((item, idx) => (
                  <div key={idx} className="p-2 rounded-xl bg-slate-900/60 border border-emerald-500/20 text-slate-200 text-xs font-sans">
                    {item}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Footer Advice & Warnings */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 font-mono text-xs">
            <div className="p-3.5 rounded-xl bg-cyan-950/30 border border-cyan-500/30 space-y-1">
              <span className="text-[10px] text-cyan-400 font-bold uppercase block">
                💎 Gelecek Varlık & Yatırım Tavsiyesi:
              </span>
              <p className="text-slate-300 text-xs font-sans leading-relaxed">
                {advisorResult.wealthAndAssetAdvice}
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-rose-950/30 border border-rose-500/30 space-y-1">
              <span className="text-[10px] text-rose-400 font-bold uppercase block">
                ⚠️ Kritik Etik & Biyo-Mahremiyet Uyarısı:
              </span>
              <p className="text-slate-300 text-xs font-sans leading-relaxed">
                {advisorResult.ethicalWarning}
              </p>
            </div>
          </div>

          {/* Context Action Bridge */}
          {(onNavigateToView || onNavigateToMilestone) && (
            <div className="pt-2 border-t border-purple-500/30 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-300 font-mono">
                  🚀 Tavsiyeleri Eyleme Dönüştür:
                </span>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                {onNavigateToView && (
                  <>
                    <button
                      type="button"
                      onClick={() => onNavigateToView("roadmap", targetHorizonYear)}
                      className="px-3 py-1.5 rounded-xl bg-purple-900/60 hover:bg-purple-800 text-purple-200 border border-purple-500/40 text-xs font-bold font-mono flex items-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <TrendingUp className="w-3.5 h-3.5 text-purple-400" />
                      <span>{targetHorizonYear} Yol Haritası</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => onNavigateToView("job_risk", targetHorizonYear)}
                      className="px-3 py-1.5 rounded-xl bg-amber-950/60 hover:bg-amber-900/80 text-amber-200 border border-amber-500/40 text-xs font-bold font-mono flex items-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <Briefcase className="w-3.5 h-3.5 text-amber-400" />
                      <span>{targetHorizonYear} Meslek Riski</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => onNavigateToView("telegram_feed", targetHorizonYear)}
                      className="px-3 py-1.5 rounded-xl bg-cyan-950/60 hover:bg-cyan-900/80 text-cyan-200 border border-cyan-500/40 text-xs font-bold font-mono flex items-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <Radio className="w-3.5 h-3.5 text-cyan-400" />
                      <span>Canlı İstihbarat Radarı</span>
                    </button>
                  </>
                )}
                <button
                  type="button"
                  onClick={() => {
                    if (onNavigateToMilestone) {
                      onNavigateToMilestone(targetHorizonYear);
                    } else if (onNavigateToView) {
                      onNavigateToView("timeline", targetHorizonYear);
                    }
                  }}
                  className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold font-mono flex items-center gap-1.5 transition-colors cursor-pointer shadow-md"
                >
                  <MapPin className="w-3.5 h-3.5 text-white" />
                  <span>{targetHorizonYear} Zaman Çizelgesi</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
