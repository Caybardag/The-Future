import React from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  X,
  Clock,
  Briefcase,
  Compass,
  ShieldCheck,
  MessageSquare,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  Cpu,
  Layers,
  Zap,
} from "lucide-react";
import { ViewMode } from "../types";

export type ExplainerFeatureId =
  | "timeline"
  | "personal_impact"
  | "job_risk"
  | "roadmap"
  | "verification"
  | "persona_chat";

export interface FeatureExplainerData {
  id: ExplainerFeatureId;
  targetView: ViewMode;
  title: string;
  badge: string;
  accentColor: "blue" | "purple" | "green" | "amber" | "cyan" | "pink";
  icon: React.ComponentType<{ className?: string }>;
  whatIsIt: string;
  userBenefit: string;
  howItWorksSteps: Array<{
    step: string;
    title: string;
    description: string;
  }>;
  demoExample: {
    headline: string;
    targetHorizon: string;
    impactLevel: string;
    keyPreparation: string;
    details: string;
  };
  whyRegister: string;
  allowDirectAccess?: boolean; // For non-personalized public views like timeline or verification
}

export const EXPLAINER_FEATURES: Record<ExplainerFeatureId, FeatureExplainerData> = {
  timeline: {
    id: "timeline",
    targetView: "timeline",
    title: "Teknolojik Evrim Takvimi",
    badge: "2026—2060 Küresel Ufuk",
    accentColor: "blue",
    icon: Clock,
    whatIsIt:
      "Dünyadaki yapay zekâ, kuantum, biyoteknoloji ve füzyon enerjisi sıçramalarının ne zaman gerçekleşebileceğini zaman ekseninde izleyen analitik projeksiyon motorudur.",
    userBenefit:
      "Hangi teknolojinin hangi zaman diliminde olgunlaşacağını ve yaygınlaşacağını önceden görerek kariyerini ve stratejilerini doğru zamanlamayla konumlandırmanı sağlar.",
    howItWorksSteps: [
      { step: "01", title: "Dünya Değişimi", description: "Küresel laboratuvar, patent ve açık bilimsel literatür taranır." },
      { step: "02", title: "Zaman Ufku", description: "Teknolojinin olgunlaşma aşamaları (Gelişim 1-9) ve gerçekleşme yılları modellenir." },
      { step: "03", title: "Kırılma Tespiti", description: "Toplumu ve endüstrileri kökten dönüştürecek kritik dönüm noktaları belirlenir." },
      { step: "04", title: "Nedensellik Ağı", description: "Bir teknolojinin diğerini nasıl tetiklediği nedensel domino ilişkisiyle hesaplanır." },
    ],
    demoExample: {
      headline: "Yapay Genel Zekâ (AGI) & Bilişsel Otomasyon Eşiği",
      targetHorizon: "2028 — 2030",
      impactLevel: "Kritik / Yüksek Dönüşüm",
      keyPreparation: "Ajan orkestrasyonu, mimari karar alma ve sistemik entegrasyon yetkinlikleri.",
      details: "Bilişsel yazılım ve rutin analitik süreçlerin otonomlaşması beklenir. İnsan katma değeri mimari liderliğe kayar.",
    },
    whyRegister:
      "Kayıt olduğunuzda bu dönüm noktalarının doğrudan yaşınıza ve mesleğinize olan etkisini kişiselleştirilmiş olarak görebilirsiniz.",
    allowDirectAccess: true,
  },
  personal_impact: {
    id: "personal_impact",
    targetView: "timeline",
    title: "Kişisel Etki Analizi",
    badge: "Bireysel Yaşam Projeksiyonu",
    accentColor: "purple",
    icon: Sparkles,
    whatIsIt:
      "Dünyadaki bir teknolojik değişimin; senin yaşına, yaşam evrene, ilgi alanlarına ve hedeflerine göre hayatını nasıl etkileyebileceğini anlamana yardımcı olan analiz katmanıdır.",
    userBenefit:
      "Gelecek haberlerini soyut birer gelişme olmaktan çıkarır; 'Bu değişim benim günlük hayatımda ve ailemde neyi değiştirecek?' sorusuna berrak cevaplar verir.",
    howItWorksSteps: [
      { step: "01", title: "Dünya Değişimi", description: "Teknolojik ve biyolojik kırılma sinyali algılanır." },
      { step: "02", title: "Zaman Ufku", description: "Değişimin ne zaman gerçekleşeceği zaman ekseninde tespit edilir." },
      { step: "03", title: "Kullanıcı Profili", description: "Yaşın, kariyer aşaman ve kişisel önceliklerin hesaba katılır." },
      { step: "04", title: "Kişisel Etki", description: "O kırılma anında kaç yaşında olacağın ve koşulların nasıl etkileneceği hesaplanır." },
      { step: "05", title: "Hazırlık İhtiyacı", description: "Bugünden alman gereken stratejik ve bireysel önlemler listelenir." },
    ],
    demoExample: {
      headline: "Örnek Senaryo: Biyoteknoloji & Uzun Ömür Terapileri",
      targetHorizon: "2032 — 2035",
      impactLevel: "Orta / Yüksek Bireysel Etki",
      keyPreparation: "Biyometrik sağlık takibi, koruyucu tıp adaptasyonu ve esnek kariyer planlaması.",
      details: "Bu senaryoda biyolojik yaşlanmanın yavaşlatılması genel yaşam süresini ve çalışma ufkunu 15+ yıl genişletmektedir.",
    },
    whyRegister:
      "Kişisel etki analizi profil gerektirir. Henüz profilin olmadığı için bu ekran demo olarak sunulmaktadır. Kendi yaşın ve hedeflerine göre analiz için profil oluştur.",
    allowDirectAccess: false,
  },
  job_risk: {
    id: "job_risk",
    targetView: "job_risk",
    title: "Meslek Risk & Dönüşüm Analizi",
    badge: "Kariyer & Otomasyon Savunması",
    accentColor: "green",
    icon: Briefcase,
    whatIsIt:
      "Mesleğinin teknolojik dönüşüm ve yapay zekâ karşısındaki risklerini, otomasyon hızını, değişecek görev alanlarını ve güçlendirmen gereken yönleri analiz eder.",
    userBenefit:
      "İşini kaybetme korkusu yerine; hangi görevlerinin yapay zekâya geçeceğini, hangi insani yeteneklerinin vazgeçilmez kalacağını bilerek stratejik adaptasyon sağlarsın.",
    howItWorksSteps: [
      { step: "01", title: "Meslek ve Kıdem", description: "Unvanın, sektörel bağlamın ve deneyim seviyen analiz edilir." },
      { step: "02", title: "Görev Ayrıştırması", description: "Rutin, algoritmik ve sezgisel görev bileşenlerin ayrıştırılır." },
      { step: "03", title: "Otomasyon Hızı", description: "Yapay zekanın bu görevleri ne zaman ikame edebileceği modellenir." },
      { step: "04", title: "İnsani Katma Değer", description: "Otomasyona dirençli, yüksek değerli kritik yetkinliklerin çıkarılır." },
      { step: "05", title: "Kariyer Savunması", description: "Kademeli geçiş adımları ve önerilen araçlar sentezlenir." },
    ],
    demoExample: {
      headline: "Örnek: Yazılım & Veri Analitiği Meslek Grubu",
      targetHorizon: "2028 — 2033",
      impactLevel: "Orta Risk (%45 Rutin Kodlama Otomasyonu)",
      keyPreparation: "Kod yazmaktan sistem mimarisi doğrulamaya ve güvenlik denetimine geçiş.",
      details: "Sözdizimi yazımı hızla otonomlaşırken; gereksinim analizi, domain bilgisi ve sistem güvenilirliği değeri katlanarak artar.",
    },
    whyRegister:
      "Kendi mesleğin, kıdemin ve sektörün için gerçek bir analiz çalıştırmak ve sonuçları kaydetmek için kayıt olman gereklidir.",
    allowDirectAccess: false,
  },
  roadmap: {
    id: "roadmap",
    targetView: "roadmap",
    title: "Kişisel Gelecek Yol Haritası",
    badge: "Stratejik Eylem Planı",
    accentColor: "amber",
    icon: Compass,
    whatIsIt:
      "2026—2060 arasındaki küresel dönüşümler içinden senin hayatına ve kariyerine en kritik 10 dönüm noktasını eşleştirerek adım adım eylem planına dönüştüren rehberdir.",
    userBenefit:
      "Gelecek kaygısını somut eyleme dönüştürür. Hangi yılda hangi kararı alman, hangi beceriyi edinmen ve hangi adımı atman gerektiğini gösterir.",
    howItWorksSteps: [
      { step: "01", title: "Profil Eşleştirme", description: "Meslek, yaş ve hedeflerine göre 34 yıl içinden kritik 10 eşik seçilir." },
      { step: "02", title: "Stratejik Seçenekler", description: "Her dönüm noktası için 3 farklı karar yolu (A, B, C) sunulur." },
      { step: "03", title: "Kişisel Tercih", description: "Hangi yolu seçeceğine sen karar verirsin (Kullanıcı Kararı ≠ Model Önerisi)." },
      { step: "04", title: "Eylem & Takip", description: "Adımları 'Planlandı', 'Devam Ediyor', 'Tamamlandı' olarak işaretlersin." },
      { step: "05", title: "Yeniden Değerlendirme", description: "Yeni bir dünya sinyali geldiğinde eski kararlarını gözden geçirirsin." },
    ],
    demoExample: {
      headline: "Örnek Eylem: 2029 Bilişsel Otomasyon Eşiği",
      targetHorizon: "2029 Dönüm Noktası",
      impactLevel: "Stratejik Yol B (Hibrit Adaptasyon Seçildi)",
      keyPreparation: "Haftalık 4 saat yapay zekâ orkestrasyon araçları pratiği.",
      details: "Kullanıcı kararını vermiş, aksiyonu 'Devam Ediyor' olarak işaretlemiş ve kişisel takvimine bağlamıştır.",
    },
    whyRegister:
      "Yol haritası senin kararların ve aksiyonlarınla yaşayan bir kapalı döngüdür. İlerlemeyi kaydedebilmek için üye girişi şarttır.",
    allowDirectAccess: false,
  },
  verification: {
    id: "verification",
    targetView: "verification",
    title: "Bilimsel Literatür & Gelişim Radarı",
    badge: "Kanıt & Gelişim 1-9",
    accentColor: "cyan",
    icon: ShieldCheck,
    whatIsIt:
      "Gelecek sinyallerinin ve takvimdeki tüm öngörülerin arkasındaki akademik makaleleri (arXiv, Nature, IEEE), patentleri ve gelişim aşamalarını (1-9) inceleyen şeffaf kanıt matrisidir.",
    userBenefit:
      "Hiçbir bilginin spekülasyon veya kehanet olmadığını; somut laboratuvar verileri ve doğrulanmış harici kaynaklara dayandığını kendi gözlerinle görmeni sağlar.",
    howItWorksSteps: [
      { step: "01", title: "Açık Literatür", description: "Küresel akademik indeksler ve patent veritabanları taranır." },
      { step: "02", title: "DOI & Kayıt Eşleme", description: "Her öngörü doğrulanabilir harici kaynak kodlarıyla ilişkilendirilir." },
      { step: "03", title: "Gelişim Seviyesi (1-9)", description: "Laboratuvar hipotezinden ticari yaygınlaşmaya kadar olgunluk puanlanır." },
      { step: "04", title: "Veri Kökeni Şeffaflığı", description: "Model tahmini ile ampirik ölçüm birbirinden kesin olarak ayrılır." },
    ],
    demoExample: {
      headline: "Örnek Kayıt: Kuantum Hata Düzeltme & Mantıksal Kübitler",
      targetHorizon: "Gelişim Aşaması 5/9 (Saha Doğrulaması)",
      impactLevel: "Yüksek Akademik Güvenilirlik",
      keyPreparation: "Kuantum dirençli kriptografik algoritmaların (PQC) incelenmesi.",
      details: "Harici Kaynak: Nature Q-Info (DOI: 10.1038/s41534-025-00912-x). Sistem bu kaydı doğrulanmış harici veri olarak etiketlemiştir.",
    },
    whyRegister:
      "Literatür matrisini genel olarak inceleyebilirsin; ancak kendi mesleğine özel kanıt alarmları kurmak için profil oluştur.",
    allowDirectAccess: true,
  },
  persona_chat: {
    id: "persona_chat",
    targetView: "persona_chat",
    title: "2060 Zaman Yolcusu",
    badge: "Sibernetik Çağ Simülasyonu",
    accentColor: "pink",
    icon: MessageSquare,
    whatIsIt:
      "2060 yılında, transhümanist dönüşüm ve post-kıtlık çağında yaşayan simüle edilmiş bir sibernetik insanla canlı soru-cevap yapabileceğin fütüroloji diyalog katmanıdır.",
    userBenefit:
      "Geleceğin sosyolojisini, gündelik yaşamını, değişen değer yargılarını ve insan-makine birlikteliğini soğuk raporlar yerine yaşayan bir diyalog üzerinden hissetmeni sağlar.",
    howItWorksSteps: [
      { step: "01", title: "2060 Parametreleri", description: "34 yıllık teknolojik ve toplumsal dönüşüm verisi yüklenir." },
      { step: "02", title: "Sibernetik Bilinç", description: "Persona, 2060'ın dil, teknoloji ve etik perspektifiyle yanıt verir." },
      { step: "03", title: "Kullanıcı Sorusu", description: "Geleceğin mesleklerini, parasını veya gündelik hayatını sorarsın." },
      { step: "04", title: "Olasılıksal Projeksiyon", description: "Persona, kesin kehanet yerine o çağın olası gerçekliğini aktarır." },
    ],
    demoExample: {
      headline: "Örnek Diyalog Alıntısı:",
      targetHorizon: "2060 Sibernetik Perspektifi",
      impactLevel: "Kurgusal & Epistemik Simülasyon",
      keyPreparation: "Geleceğin zihniyet dönüşümüne ve felsefesine hazırlık.",
      details: "Soru: '2060'ta insanlar hâlâ çalışıyor mu?' — Yanıt: 'Zorunlu emek 2038'de protokollerle otonomlaştı. Biz şimdi anlam üretimi ve derin uzay araştırmaları yapıyoruz.'",
    },
    whyRegister:
      "Zaman yolcusu ile kişiselleştirilmiş derin sohbetler oturum gerektirir. Sınırsız etkileşim için ücretsiz kayıt ol.",
    allowDirectAccess: false,
  },
};

interface FeatureExplainerModalProps {
  featureId: ExplainerFeatureId | null;
  isOpen: boolean;
  onClose: () => void;
  onOpenAuth: () => void;
  onDirectAccess?: (targetView: ViewMode) => void;
}

export const FeatureExplainerModal: React.FC<FeatureExplainerModalProps> = ({
  featureId,
  isOpen,
  onClose,
  onOpenAuth,
  onDirectAccess,
}) => {
  if (!featureId || !isOpen) return null;
  const feature = EXPLAINER_FEATURES[featureId];
  if (!feature) return null;

  const Icon = feature.icon;

  const colorStyles = {
    blue: {
      badge: "border-cyan-500/40 text-cyan-300 bg-cyan-500/10",
      accent: "text-cyan-400",
      border: "border-cyan-500/30",
      glow: "from-cyan-500/20 to-transparent",
      btn: "bg-cyan-500 hover:bg-cyan-400 text-slate-950 shadow-cyan-500/25",
    },
    purple: {
      badge: "border-purple-500/40 text-purple-300 bg-purple-500/10",
      accent: "text-purple-400",
      border: "border-purple-500/30",
      glow: "from-purple-500/20 to-transparent",
      btn: "bg-purple-600 hover:bg-purple-500 text-white shadow-purple-500/25",
    },
    green: {
      badge: "border-emerald-500/40 text-emerald-300 bg-emerald-500/10",
      accent: "text-emerald-400",
      border: "border-emerald-500/30",
      glow: "from-emerald-500/20 to-transparent",
      btn: "bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-emerald-500/25",
    },
    amber: {
      badge: "border-amber-500/40 text-amber-300 bg-amber-500/10",
      accent: "text-amber-400",
      border: "border-amber-500/30",
      glow: "from-amber-500/20 to-transparent",
      btn: "bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-amber-500/25",
    },
    cyan: {
      badge: "border-cyan-400/40 text-cyan-200 bg-cyan-400/10",
      accent: "text-cyan-300",
      border: "border-cyan-400/30",
      glow: "from-cyan-400/20 to-transparent",
      btn: "bg-cyan-500 hover:bg-cyan-400 text-slate-950 shadow-cyan-400/25",
    },
    pink: {
      badge: "border-pink-500/40 text-pink-300 bg-pink-500/10",
      accent: "text-pink-400",
      border: "border-pink-500/30",
      glow: "from-pink-500/20 to-transparent",
      btn: "bg-pink-600 hover:bg-pink-500 text-white shadow-pink-500/25",
    },
  }[feature.accentColor];

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-[#040714]/85 backdrop-blur-md"
        />

        {/* Modal Window */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          transition={{ duration: 0.25, ease: "easeOut" }}
          className={`relative w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-slate-900/90 border ${colorStyles.border} rounded-2xl sm:rounded-3xl shadow-2xl p-5 sm:p-7 text-slate-100 z-10`}
        >
          {/* Subtle Top Glow */}
          <div
            className={`absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-28 bg-gradient-to-b ${colorStyles.glow} blur-2xl pointer-events-none rounded-t-3xl`}
          />

          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 sm:top-5 sm:right-5 p-2 rounded-xl bg-slate-800/80 text-slate-400 hover:text-white hover:bg-slate-700/80 transition-colors z-20"
            aria-label="Kapat"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Header */}
          <div className="flex items-start gap-4 mb-6 relative z-10">
            <div className={`p-3.5 rounded-2xl bg-slate-800/80 border ${colorStyles.border} ${colorStyles.accent}`}>
              <Icon className="w-7 h-7" />
            </div>
            <div className="space-y-1 pr-8">
              <span className={`inline-block px-2.5 py-0.5 rounded-full text-[11px] font-mono tracking-wider border ${colorStyles.badge}`}>
                {feature.badge}
              </span>
              <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                {feature.title}
              </h2>
            </div>
          </div>

          <div className="space-y-6 text-sm relative z-10">
            {/* 1. Ne Olduğu & Ne Sağlar */}
            <div className="space-y-3 bg-slate-950/60 border border-slate-800/80 rounded-2xl p-4 sm:p-5">
              <div>
                <span className="text-[11px] font-mono uppercase tracking-wider text-slate-400 block mb-1">
                  Bu Özellik Nedir?
                </span>
                <p className="text-slate-200 leading-relaxed font-sans">
                  {feature.whatIsIt}
                </p>
              </div>
              <div className="pt-2 border-t border-slate-800/60">
                <span className="text-[11px] font-mono uppercase tracking-wider text-slate-400 block mb-1">
                  Kullanıcıya Ne Sağlar?
                </span>
                <p className="text-slate-300 leading-relaxed font-sans">
                  {feature.userBenefit}
                </p>
              </div>
            </div>

            {/* 2. Nasıl Çalışır? (Zincir) */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Layers className={`w-4 h-4 ${colorStyles.accent}`} />
                <h3 className="text-xs font-mono uppercase tracking-wider text-slate-300 font-bold">
                  Sistem Nasıl Çalışır?
                </h3>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {feature.howItWorksSteps.map((s, idx) => (
                  <div
                    key={idx}
                    className="p-3 rounded-xl bg-slate-950/40 border border-slate-800/60 flex items-start gap-3"
                  >
                    <span className={`text-xs font-mono font-bold ${colorStyles.accent} mt-0.5`}>
                      {s.step}
                    </span>
                    <div>
                      <div className="text-xs font-semibold text-white mb-0.5">
                        {s.title}
                      </div>
                      <div className="text-xs text-slate-400 leading-normal">
                        {s.description}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 3. Örnek / Demo Senaryo */}
            <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-slate-950/90 to-slate-900/60 border border-slate-800/80 space-y-3">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div className="flex items-center gap-2">
                  <Sparkles className={`w-4 h-4 ${colorStyles.accent}`} />
                  <span className="text-xs font-mono font-bold uppercase tracking-wider text-slate-200">
                    Örnek Sistem Çıktısı (Demo)
                  </span>
                </div>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono uppercase tracking-wider bg-amber-500/10 border border-amber-500/30 text-amber-300">
                  ÖRNEK MODEL VERİSİ
                </span>
              </div>

              <div className="space-y-2">
                <div className="text-sm font-semibold text-white">
                  {feature.demoExample.headline}
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  <div className="p-2.5 rounded-lg bg-slate-900/60 border border-slate-800/50">
                    <span className="text-slate-400 block text-[10px] font-mono uppercase">Zaman Ufku</span>
                    <span className="text-slate-200 font-medium">{feature.demoExample.targetHorizon}</span>
                  </div>
                  <div className="p-2.5 rounded-lg bg-slate-900/60 border border-slate-800/50">
                    <span className="text-slate-400 block text-[10px] font-mono uppercase">Etki Seviyesi</span>
                    <span className={`${colorStyles.accent} font-medium`}>{feature.demoExample.impactLevel}</span>
                  </div>
                </div>
                <div className="text-xs text-slate-300 leading-relaxed pt-1">
                  <span className="font-semibold text-slate-200">Gereken Hazırlık: </span>
                  {feature.demoExample.keyPreparation}
                </div>
                <p className="text-xs text-slate-400 italic">
                  "{feature.demoExample.details}"
                </p>
              </div>

              {/* Epistemic Guard Banner */}
              <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>
                  Bu yalnızca sistemin nasıl çalıştığını göstermek için örnektir. Kendi kişiselleştirilmiş verilerinizi görmek için profilinizi oluşturun.
                </span>
              </div>
            </div>

            {/* 4. Kayıt Çağrısı ve Eylemler */}
            <div className="pt-2 flex flex-col sm:flex-row items-center gap-3">
              <button
                onClick={() => {
                  onClose();
                  onOpenAuth();
                }}
                className={`w-full sm:flex-1 py-3 px-5 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 transition-all shadow-lg ${colorStyles.btn}`}
              >
                <span>Kendi Analizimi Oluştur (Ücretsiz)</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              {feature.allowDirectAccess && onDirectAccess && (
                <button
                  onClick={() => {
                    onClose();
                    onDirectAccess(feature.targetView);
                  }}
                  className="w-full sm:w-auto py-3 px-4 rounded-xl text-xs font-mono font-medium text-slate-400 hover:text-white bg-slate-800/60 hover:bg-slate-800 border border-slate-700/60 transition-colors"
                >
                  Genel Örneği Gör
                </button>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
