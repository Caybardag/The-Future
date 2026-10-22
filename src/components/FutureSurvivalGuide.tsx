import React, { useState } from "react";
import { Milestone } from "../types";
import {
  Briefcase,
  TrendingUp,
  TrendingDown,
  Compass,
  Zap,
  Target,
  Sparkles,
  AlertCircle,
  GraduationCap,
  ShieldCheck,
  Building,
  UserCheck,
  CheckCircle2,
  Lock,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";

interface FutureSurvivalGuideProps {
  milestone: Milestone;
  onOpenAuthModal?: () => void;
}

interface ProfessionImpact {
  role: string;
  category: "tech" | "business" | "creative" | "health" | "industrial";
  riskScore: number; // 0 - 100
  verdict: "Kritik Dönüşüm" | "Yüksek Fırsat" | "Otomasyon Riski" | "Bilişsel Eşlikçi";
  tasksAutomated: string[];
  tasksAugmented: string[];
  mustLearnSkills: string[];
  survivalAdvice: string;
}

const CAREER_DATABASE: Record<string, ProfessionImpact[]> = {
  default: [
    {
      role: "Yazılım Geliştirici & Mühendis",
      category: "tech",
      riskScore: 78,
      verdict: "Kritik Dönüşüm",
      tasksAutomated: ["CRUD boilerplate yazımı", "Birim testleri & debugging", "Temel API entegrasyonu"],
      tasksAugmented: ["Sistem mimarisi tasarımı", "Ajan orkestrasyonu & güvenlik denetimi", "İş mantığı modellemesi"],
      mustLearnSkills: ["Multi-Agent Orchestration", "Causal Prompting & Logic Guardrails", "Kuantum Güvenli Şifreleme"],
      survivalAdvice: "Kod yazan operatör olmaktan çıkıp, otonom ajanları yöneten 'Sistem Baş Mimarı' konumuna geçin.",
    },
    {
      role: "Finans, Muhasebe & Veri Analisti",
      category: "business",
      riskScore: 88,
      verdict: "Otomasyon Riski",
      tasksAutomated: ["Fatura & bilanço mutabakatı", "Rutin finansal raporlama", "Veri temizleme"],
      tasksAugmented: ["Stratejik senaryo simülasyonu", "Vergi & regülasyon optimizasyonu", "Risk sermayesi modelleme"],
      mustLearnSkills: ["Algoritmik Piyasa Simülasyonu", "Tahminleme Doğrulama", "Blokzincir Bilanço Doğrulama"],
      survivalAdvice: "Rapor derlemeyi bırakın; algoritmaların ürettiği gelecek simülasyonlarından şirket yönetimine stratejik kararlar çıkarın.",
    },
    {
      role: "Tasarımcı, Metin Yazarı & İçerik Üreticisi",
      category: "creative",
      riskScore: 82,
      verdict: "Kritik Dönüşüm",
      tasksAutomated: ["Stok görsel üretimi", "Temel metin & reklam yazarlığı", "Standart video kurgusu"],
      tasksAugmented: ["Kreatif yönlendirme & marka kimliği", "Duygusal bağ kurma & hikaye anlatıcılığı", "Çok modlu jeneratif yönetmenlik"],
      mustLearnSkills: ["Generative Physics Direction", "Marka Felsefesi & İnsan Psikolojisi", "IP & Telif Kalkanı"],
      survivalAdvice: "Teknik çıktı araçlarında yarışmak yerine derin özgün insan hikayeleri ve yaratıcı yönetmenliğe odaklanın.",
    },
    {
      role: "Doktor, Biyolog & Sağlık Uzmanı",
      category: "health",
      riskScore: 35,
      verdict: "Bilişsel Eşlikçi",
      tasksAutomated: ["Radyoloji & biyopsi ön taraması", "Rutin hasta anamnez kaydı", "Reçete etkileşim kontrolü"],
      tasksAugmented: ["Kişiselleştirilmiş genetik tedavi protokolü", "Cerrahi robot asistansı", "Hasta empati & karar ortaklığı"],
      mustLearnSkills: ["CRISPR & Genomik Veri Okuma", "Biyo-Sensör Telemetri Analizi", "Tıbbi Yapay Zeka Etiği"],
      survivalAdvice: "Tanı koyma hızınızı yapay zeka ile 100 katına çıkarın; zamanınızı cerrahi hassasiyet ve hastayla insan-insana iletişime ayırın.",
    },
    {
      role: "Şirket Yöneticisi & Girişimci",
      category: "business",
      riskScore: 28,
      verdict: "Yüksek Fırsat",
      tasksAutomated: ["Operasyonel görev takibi", "Pazar araştırma derlemeleri", "İnsan kaynakları ön elemesi"],
      tasksAugmented: ["1 kişilik 100 kişilik şirket kurma", "Otonom pazar penetrasyonu", "Vizyoner sermaye tahsisi"],
      mustLearnSkills: ["Otonom Şirket Yönetimi", "Yapay Zeka Hukuk & Lisanslama", "Kaynak & Enerji Yönetimi"],
      survivalAdvice: "Geleneksel operasyonel darboğazlar yerine otonom yapay zeka iş akışları ve orkestrasyon modelleriyle verimlilik ölçeği yakalayın.",
    },
  ],
};

export const FutureSurvivalGuide: React.FC<FutureSurvivalGuideProps> = ({
  milestone,
  onOpenAuthModal,
}) => {
  const { currentUser } = useAuth();
  const [selectedRoleIdx, setSelectedRoleIdx] = useState<number>(0);

  const roles = CAREER_DATABASE.default;
  const currentRole = roles[selectedRoleIdx] || roles[0];

  // Dynamic Macro Impacts calculated based on milestone year & impact score
  const isEarlyPhase = milestone.year <= 2030;
  const isMidPhase = milestone.year > 2030 && milestone.year <= 2042;

  return (
    <div className="space-y-4 animate-in fade-in">
      {/* Header Banner */}
      <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-950/60 via-slate-900 to-indigo-950/60 border border-amber-500/30 font-mono shadow-xl">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/10 pb-2.5 mb-3">
          <div className="flex items-center gap-2 text-amber-400 font-black text-sm">
            <Compass className="w-5 h-5 text-amber-400 animate-spin-slow" />
            <span>🎯 {milestone.year} HAYATTA KALMA & STRATEJİK YOL HARİTASI</span>
          </div>
          <span className="px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 text-[10px] font-bold">
            Öngörülen Etki: %{milestone.impactLevel}
          </span>
        </div>
        <p className="text-xs text-slate-300 font-sans leading-relaxed">
          Bu teknolojik kırılma gerçekleştiğinde kimler kazanacak, hangi meslekler küçülecek ve bireysel kariyerinizi / yatırımlarınızı korumak için <strong>bugünden itibaren hangi adımları atmalısınız?</strong>
        </p>
      </div>

      {/* 1. KAZANACAKLAR VE KAYBEDECEKLER MATRİSİ (WINNERS vs LOSERS) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 font-mono">
        {/* Kazananlar */}
        <div className="p-4 rounded-xl bg-emerald-950/30 border border-emerald-500/30 space-y-2.5">
          <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs uppercase">
            <TrendingUp className="w-4 h-4 text-emerald-400" />
            <span>🚀 Bu Dönemde Kazananlar (Winners)</span>
          </div>
          <ul className="space-y-2 text-[11px] text-slate-200">
            <li className="flex items-start gap-2 bg-slate-950/60 p-2 rounded-lg border border-emerald-500/20">
              <span className="text-emerald-400 font-bold">✓</span>
              <span>
                <strong>{isEarlyPhase ? "Ajan Altyapı Sağlayıcıları:" : isMidPhase ? "Biyo-Siber Arayüz Şirketleri:" : "Madde Programlama & Enerji Üsleri:"}</strong>{" "}
                Teknolojiyi son kullanıcıya paketleyen ve standart protokol oluşturanlar.
              </span>
            </li>
            <li className="flex items-start gap-2 bg-slate-950/60 p-2 rounded-lg border border-emerald-500/20">
              <span className="text-emerald-400 font-bold">✓</span>
              <span>
                <strong>Çevik Bireysel Girişimciler:</strong> 1 kişilik ekiplerle geleneksel 50 kişilik şirketlerin cirosunu yakalayan süper-üreticiler.
              </span>
            </li>
            <li className="flex items-start gap-2 bg-slate-950/60 p-2 rounded-lg border border-emerald-500/20">
              <span className="text-emerald-400 font-bold">✓</span>
              <span>
                <strong>Fiziksel / Nadir Kaynak Sahipleri:</strong> Yüksek saflıkta lityum, temiz enerji, kuantum çip altlığı ve temiz biyolojik veri sahipleri.
              </span>
            </li>
          </ul>
        </div>

        {/* Kaybedenler */}
        <div className="p-4 rounded-xl bg-rose-950/30 border border-rose-500/30 space-y-2.5">
          <div className="flex items-center gap-2 text-rose-400 font-bold text-xs uppercase">
            <TrendingDown className="w-4 h-4 text-rose-400" />
            <span>⚠️ Bu Dönemde Geride Kalanlar (At Risk)</span>
          </div>
          <ul className="space-y-2 text-[11px] text-slate-200">
            <li className="flex items-start gap-2 bg-slate-950/60 p-2 rounded-lg border border-rose-500/20">
              <span className="text-rose-400 font-bold">✗</span>
              <span>
                <strong>Rutin Bilişsel Aracılar:</strong> Standart sözleşme hazırlayanlar, veri aktaran muhasebe servisleri ve tekrar eden kod yazıcılar.
              </span>
            </li>
            <li className="flex items-start gap-2 bg-slate-950/60 p-2 rounded-lg border border-rose-500/20">
              <span className="text-rose-400 font-bold">✗</span>
              <span>
                <strong>Hantal Kurumsal Yapılar:</strong> Karar alma süreçleri aylar süren ve hiyerarşik onay zincirine takılan eski model dev şirketler.
              </span>
            </li>
            <li className="flex items-start gap-2 bg-slate-950/60 p-2 rounded-lg border border-rose-500/20">
              <span className="text-rose-400 font-bold">✗</span>
              <span>
                <strong>Tek Becerili Uzmanlar:</strong> Disiplinlerarası (örneğin Yazılım + Biyoloji) bağ kuramayan dar uzmanlık sahipleri.
              </span>
            </li>
          </ul>
        </div>
      </div>

      {/* 2. BİREYSEL MESLEK & KARİYER ETKİ SİMÜLATÖRÜ */}
      <div className="bg-slate-900/60 border border-white/10 rounded-2xl p-4 sm:p-5 space-y-4 font-mono">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/10 pb-3">
          <div className="flex items-center gap-2 text-cyan-400 font-bold text-xs uppercase">
            <Briefcase className="w-4 h-4 text-cyan-400" />
            <span>👔 Mesleğinize Özel {milestone.year} Etki Simülasyonu</span>
          </div>
          <span className="text-[10px] text-slate-400">Rolünüzü seçin ve analiz edin</span>
        </div>

        {/* Role Selector Chips */}
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
          {roles.map((r, idx) => (
            <button
              key={`survival-role-${r.role || 'role'}-${idx}`}
              type="button"
              onClick={() => setSelectedRoleIdx(idx)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer border ${
                selectedRoleIdx === idx
                  ? "bg-cyan-500/20 border-cyan-400 text-cyan-200 shadow-md shadow-cyan-500/10"
                  : "bg-slate-950 border-white/5 text-slate-400 hover:text-slate-200"
              }`}
            >
              {r.role}
            </button>
          ))}
        </div>

        {/* Selected Role Detail Bento */}
        <div className="bg-slate-950 rounded-xl p-4 border border-white/10 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/5 pb-3">
            <div>
              <h4 className="text-sm font-bold text-white flex items-center gap-2">
                <span>{currentRole.role}</span>
                <span
                  className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                    currentRole.riskScore > 70
                      ? "bg-rose-500/20 text-rose-300 border border-rose-500/30"
                      : currentRole.riskScore > 40
                      ? "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                      : "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                  }`}
                >
                  {currentRole.verdict}
                </span>
              </h4>
            </div>

            {/* Risk Gauge */}
            <div className="flex items-center gap-3">
              <span className="text-[10px] text-slate-400">Otomasyon / Değişim Riski:</span>
              <div className="w-24 bg-slate-800 rounded-full h-2 overflow-hidden border border-white/10">
                <div
                  className={`h-full ${
                    currentRole.riskScore > 70
                      ? "bg-rose-500"
                      : currentRole.riskScore > 40
                      ? "bg-amber-500"
                      : "bg-emerald-500"
                  }`}
                  style={{ width: `${currentRole.riskScore}%` }}
                />
              </div>
              <span className="text-xs font-black text-white">%{currentRole.riskScore}</span>
            </div>
          </div>

          {/* Tasks Distribution */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div className="bg-slate-900/60 p-3 rounded-lg border border-rose-500/20 space-y-1.5">
              <span className="text-[10px] text-rose-400 font-bold uppercase flex items-center gap-1">
                <Zap className="w-3 h-3 text-rose-400" />
                <span>Yapay Zekaya Devredilecek Görevler:</span>
              </span>
              <ul className="space-y-1 text-[11px] text-slate-300 list-disc list-inside">
                {currentRole.tasksAutomated.map((t, i) => (
                  <li key={i}>{t}</li>
                ))}
              </ul>
            </div>

            <div className="bg-slate-900/60 p-3 rounded-lg border border-emerald-500/20 space-y-1.5">
              <span className="text-[10px] text-emerald-400 font-bold uppercase flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-emerald-400" />
                <span>Değer Kazanacak İnsan Yetkinlikleri:</span>
              </span>
              <ul className="space-y-1 text-[11px] text-slate-300 list-disc list-inside">
                {currentRole.tasksAugmented.map((t, i) => (
                  <li key={i}>{t}</li>
                ))}
              </ul>
            </div>
          </div>

          {/* Must-Learn Skills */}
          <div className="bg-indigo-950/30 p-3.5 rounded-lg border border-indigo-500/30 space-y-2">
            <span className="text-[10px] text-indigo-300 font-bold uppercase flex items-center gap-1.5">
              <GraduationCap className="w-4 h-4 text-indigo-400" />
              <span>Acil Öğrenilmesi Gereken 3 Yeni Yetkinlik ({milestone.year} Hazırlığı):</span>
            </span>
            <div className="flex flex-wrap gap-2">
              {currentRole.mustLearnSkills.map((skill, i) => (
                <span
                  key={i}
                  className="px-2.5 py-1 rounded-md bg-slate-900 border border-indigo-500/40 text-indigo-200 text-[11px] font-bold flex items-center gap-1"
                >
                  <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                  <span>{skill}</span>
                </span>
              ))}
            </div>
          </div>

          {/* Strategic Survival Advice */}
          <div className="p-3 bg-amber-500/10 rounded-lg border border-amber-500/30 text-[11px] text-amber-200 leading-relaxed font-sans">
            <strong>💡 Kahin Strateji Tavsiyesi:</strong> {currentRole.survivalAdvice}
          </div>
        </div>
      </div>

      {/* 3. ŞİMDİ NE YAPMALIYIM? (EYLEM LİSTESİ) */}
      <div className="p-4 rounded-xl bg-slate-950 border border-white/10 font-mono space-y-3">
        <div className="flex items-center gap-2 text-amber-400 font-bold text-xs uppercase">
          <Target className="w-4 h-4 text-amber-400" />
          <span>📋 Bugün Ne Yapmalıyım? (2026'dan {milestone.year}'ye 3 Adımlık Eylem Planı)</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs">
          <div className="p-3 rounded-lg bg-slate-900 border border-white/5 space-y-1">
            <span className="text-[10px] text-cyan-400 font-bold block">1. ADIM (İlk 3 Ay)</span>
            <p className="font-bold text-white text-[11px]">Yapay Zeka Ajanlarını Entegre Edin</p>
            <p className="text-[10px] text-slate-400 font-sans">
              Rutin işlerinizden en az 2 tanesini otonom LLM ajanlarına devrederek günlük 2 saat kazanın.
            </p>
          </div>

          <div className="p-3 rounded-lg bg-slate-900 border border-white/5 space-y-1">
            <span className="text-[10px] text-purple-400 font-bold block">2. ADIM (6-12 Ay)</span>
            <p className="font-bold text-white text-[11px]">Bilişsel Çapraz Yetenek Kazanın</p>
            <p className="text-[10px] text-slate-400 font-sans">
              Kendi uzmanlık alanınıza ek olarak veri analitiği, temel biyoloji veya prompt mimarisi öğrenin.
            </p>
          </div>

          <div className="p-3 rounded-lg bg-slate-900 border border-white/5 space-y-1">
            <span className="text-[10px] text-emerald-400 font-bold block">3. ADIM (Hedef Yıl)</span>
            <p className="font-bold text-white text-[11px]">Otonom Ekosistem Kurucusu Olun</p>
            <p className="text-[10px] text-slate-400 font-sans">
              Tek bir maaş kaynağı yerine, otonom sistemlerle çalışan 2-3 bağımsız gelir kanalı inşa edin.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
