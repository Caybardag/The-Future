import React, { useState, useMemo, useEffect } from "react";
import { Milestone, ViewMode } from "../types";
import {
  Compass,
  Sparkles,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  Calendar,
  Briefcase,
  GraduationCap,
  Store,
  Baby,
  Microscope,
  HeartHandshake,
  ArrowRight,
  ShieldCheck,
  Zap,
  HelpCircle,
  Clock,
  ChevronRight,
  Coins,
  Brain,
  Sliders,
  Layers,
  Activity,
  Bot
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useLanguage } from "../context/LanguageContext";

interface FutureVerdictViewProps {
  milestones: Milestone[];
  onSelectMilestone?: (milestone: Milestone) => void;
  onNavigateView: (view: ViewMode) => void;
  onOpenAuthModal?: () => void;
  onOpenGuideModal?: () => void;
}

interface RoleVerdictData {
  id: string;
  label: string;
  icon: any;
  targetGroup: string;
  urgencyLevel: "Kritik" | "Yüksek" | "Orta";
  urgencyColor: string;
  summaryQuote: string;
  // Soru 1: Makro Nabız (Bu role özel dünya yansıması)
  macroFocus: {
    statTitle: string;
    statValue: string;
    context: string;
  };
  // Soru 2: Kritik Kırılma (En büyük kaçınılmaz eşik)
  criticalBreakthrough: {
    year: number;
    title: string;
    inevitabilityScore: number;
    whyItMatters: string;
    targetMilestoneYear: number;
  };
  secondaryBreakthrough?: {
    year: number;
    title: string;
    whyItMatters: string;
  };
  // Soru 3: Eylem Reçetesi (Bugün ne yapmalı?)
  actionPrescription: {
    financialStep: string;
    skillToLearnThisWeek: string;
    trapToAvoid: string;
  };
}

const ROLE_VERDICTS: Record<string, RoleVerdictData> = {
  employee: {
    id: "employee",
    label: "Çalışanım / Asgari Ücretliyim",
    icon: Briefcase,
    targetGroup: "Hizmet, Depo, Lojistik, İmalat, Perakende",
    urgencyLevel: "Kritik",
    urgencyColor: "text-rose-400 bg-rose-500/10 border-rose-500/30",
    summaryQuote: "Fiziksel güç veya rutin kasa/depo işleri yerine 'robot operatörlüğü ve saha denetimi'ne geçmeyenler için 2028 büyük bir kırılma yaratacak.",
    macroFocus: {
      statTitle: "Rutin Fiziksel İşlerde Otomasyon Hızı",
      statValue: "%42 Riski",
      context: "Türkiye'de özellikle montaj, ambalaj ve market/kasiyerlik alanlarında otonom robotik çözümler hızla ucuzluyor."
    },
    criticalBreakthrough: {
      year: 2028,
      title: "İnsansı Depo & Fabrika Robotlarının Kitlesel Yayılımı",
      inevitabilityScore: 94,
      whyItMatters: "Agility ve Tesla Optimus gibi robotların saatlik işletme maliyeti asgari ücretin altına inmeye başlıyor. Kol gücüyle yapılan işler robotlara kayıyor.",
      targetMilestoneYear: 2028
    },
    secondaryBreakthrough: {
      year: 2031,
      title: "Kasiyersiz & Otonom Lojistik Dağıtım Ağları",
      whyItMatters: "Son kullanıcıya teslimat yapan kuryeler ve kasiyerlerin yerine dron ve otonom kapsüller geçiyor."
    },
    actionPrescription: {
      financialStep: "Gereksiz taksitli borçlanmadan kaçının; en az 6 aylık acil durum nakit tamponu oluşturun.",
      skillToLearnThisWeek: "Bir yapay zeka aracını (örneğin sesli Türkçe asistan) günlük işlerinizi planlamak veya e-posta/form yazmak için kullanmayı öğrenin.",
      trapToAvoid: "'Benim yaptığım bedensel işi hiçbir makine yapamaz' yanılgısına kapılmayın; robotlar el becerisi gerektiren işleri de hızla öğreniyor."
    }
  },
  student: {
    id: "student",
    label: "Lise / Üniversite Öğrencisiyim",
    icon: GraduationCap,
    targetGroup: "YKS Hazırlık, Üniversite, Yeni Mezun",
    urgencyLevel: "Kritik",
    urgencyColor: "text-amber-400 bg-amber-500/10 border-amber-500/30",
    summaryQuote: "Ezber bilgi ve tek başına kod yazma dönemi bitti. 2027 itibariyle sistem kuran ve yapay zeka ajanlarını yönetenler kazanacak.",
    macroFocus: {
      statTitle: "Yazılım ve Giriş Seviyesi Ofis İşi Talebi",
      statValue: "%65 Dönüşüm",
      context: "Junior geliştiricilerin yazdığı standart kodları AI ajanları saniyeler içinde yazıp test ediyor; aranan şey disiplinlerarası problem çözme."
    },
    criticalBreakthrough: {
      year: 2027,
      title: "Otonom Yazılımcı & Araştırmacı Ajanların Standartlaşması",
      inevitabilityScore: 96,
      whyItMatters: "Geleneksel sınav odaklı ezber bilgi piyasada sıfır değer taşıyacak. 'Soru sorma ve problem parçalama' tek geçer akçe oluyor.",
      targetMilestoneYear: 2027
    },
    secondaryBreakthrough: {
      year: 2030,
      title: "Hibrit Sentetik Biyoloji & Kuantum Bilişim Meslekleri",
      whyItMatters: "Klasik bilgisayar mühendisliği yerine biyobilişim, prompt/mimari analistliği ve kuantum algoritma uzmanlığı prim yapacak."
    },
    actionPrescription: {
      financialStep: "Öğrenciyken küçük sermayelerle AI destekli mikro-hizmetler (çeviri, veri görselleştirme, sunum hazırlama) üreterek döviz kazanmayı deneyin.",
      skillToLearnThisWeek: "Cursor, Claude veya GitHub Copilot ile tek bir satır kod bilmeseniz bile 1 günde çalışan basit bir web uygulaması veya otomasyon kurun.",
      trapToAvoid: "Sadece diploma notuna veya prestijli üniversite etiketine güvenmek; artık GitHub/proje portfolyosu diplomanın çok önüne geçti."
    }
  },
  retiree: {
    id: "retiree",
    label: "Emekliyim (50-60+ Yaş)",
    icon: HeartHandshake,
    targetGroup: "Emekliler, Kıdemli Vatandaşlar, Sağlık & Birikim Odaklılar",
    urgencyLevel: "Yüksek",
    urgencyColor: "text-emerald-400 bg-emerald-500/10 border-emerald-500/30",
    summaryQuote: "Geleceğin en büyük hediyesi tıp ve biyolojideki devrim olacak. Sağlığınızı koruyarak ömrünüzü uzatabilir, birikiminizi enflasyondan savunabilirsiniz.",
    macroFocus: {
      statTitle: "Biyolojik Yaşlanma ve Hücre Yenileme",
      statValue: "2030 Faz-3 Eşiği",
      context: "Kanser ve damar sertliği gibi kronik hastalıklarda mRNA ve gen terapileri sayesinde erken teşhis maliyetleri düşecek."
    },
    criticalBreakthrough: {
      year: 2030,
      title: "Biyolojik Yaşlanmayı Yavaşlatan Telomer & Hücre Terapileri",
      inevitabilityScore: 89,
      whyItMatters: "60 yaşındaki bir insanın biyolojik organ yaşı 45'e çekilebilecek; sağlık harcamalarınızın yükü hafifleyecek.",
      targetMilestoneYear: 2030
    },
    secondaryBreakthrough: {
      year: 2033,
      title: "Evde Kişisel Sağlık & Refakatçi Robotları",
      whyItMatters: "Yalnız yaşayan yaşlılar için tansiyon, şeker ve ilaç takibini yapan sempatik ev asistanları piyasaya çıkıyor."
    },
    actionPrescription: {
      financialStep: "Maaşınızı ve birikimlerinizi geleneksel tek kanalda tutmak yerine değer koruyan sert varlıklar ve enflasyona dayanıklı fonlarla dengeleyin.",
      skillToLearnThisWeek: "Akıllı telefonunuzdaki sesli arama ve sağlık takip uygulamalarını (nabız, uyku, adım) düzenli kullanmayı alışkanlık haline getirin.",
      trapToAvoid: "'Ben bu yaşta teknolojiden anlamam' diyerek dijital bankacılık ve sağlık hizmetlerinden uzak durmak; basit arayüzler herkes için tasarlandı."
    }
  },
  white_collar: {
    id: "white_collar",
    label: "Özel Sektör / Memur (Beyaz Yaka)",
    icon: Briefcase,
    targetGroup: "Finans, İK, Pazarlama, Hukuk, İdari İşler, Yönetici",
    urgencyLevel: "Kritik",
    urgencyColor: "text-purple-400 bg-purple-500/10 border-purple-500/30",
    summaryQuote: "Ofis içi ara raporlar, Excel tabloları ve bürokrasi tamamen otonomlaşıyor. 'Yalnızca karar veren ve insani ilişkiyi yöneten' yönetici ayakta kalır.",
    macroFocus: {
      statTitle: "Beyaz Yaka Görevlerinde AI Yer Değiştirme Oranı",
      statValue: "%58",
      context: "Rapor hazırlama, sözleşme inceleme ve müşteri yanıtları artık saniyeler içinde LLM ajanları tarafından tamamlanıyor."
    },
    criticalBreakthrough: {
      year: 2027,
      title: "Kurumsal ERP & Hukuk Süreçlerinin Tam Otonomlaşması",
      inevitabilityScore: 95,
      whyItMatters: "10 kişinin yaptığı analiz ve sunum hazırlığını 1 kişi yapay zeka ajanıyla 20 dakikada yapabilecek. Kadrolar küçülecek.",
      targetMilestoneYear: 2027
    },
    secondaryBreakthrough: {
      year: 2032,
      title: "Yapay Zeka Destekli Otonom Yönetim Kurulları",
      whyItMatters: "Şirket stratejileri insan sezgisi yerine küresel veri işleyen karar algoritmalarıyla belirlenecek."
    },
    actionPrescription: {
      financialStep: "Tek bir şirkete veya maaşa bağımlı kalmayın; online danışmanlık veya mikro-dijital ürünlerle ikinci bir gelir kanalı açın.",
      skillToLearnThisWeek: "Şirketinizde her hafta en az 4 saatinizi alan bir rutin görevi (rapor, özet, e-posta) AI ile 5 dakikaya indirmeyi başarın.",
      trapToAvoid: "Mevcut unvanınızın veya kıdeminizin sizi koruyacağını düşünmek; şirketler maliyet kısmak için en önce yüksek maaşlı orta kademeyi revize ediyor."
    }
  },
  business_owner: {
    id: "business_owner",
    label: "Küçük Esnaf / KOBİ / Dükkan Sahibi",
    icon: Store,
    targetGroup: "Esnaf, Restoran, E-ticaret, Yerel İmalatçı, Hizmet",
    urgencyLevel: "Yüksek",
    urgencyColor: "text-cyan-400 bg-cyan-500/10 border-cyan-500/30",
    summaryQuote: "Büyük zincirlerle rekabet etmenin tek yolu dükkanınıza yapay zeka müşteri asistanı ve akıllı stok yönetimi eklemektir.",
    macroFocus: {
      statTitle: "Hiper-Yerel Yapay Zeka ile Maliyet Düşüşü",
      statValue: "%35 Tasarruf",
      context: "Doğru araçları kullanan küçük bir esnaf, reklam, muhasebe ve müşteri desteğini tek başına dev şirket kalitesinde yürütebiliyor."
    },
    criticalBreakthrough: {
      year: 2028,
      title: "Kartsız/Kasiyersiz Mağaza & Otonom Tedarik Entegrasyonu",
      inevitabilityScore: 91,
      whyItMatters: "Tedarik zinciri doğrudan AI ile optimize edilecek; rafta bayatlayan veya elde kalan ürün maliyeti sıfırlanacak.",
      targetMilestoneYear: 2028
    },
    actionPrescription: {
      financialStep: "Geleneksel reklam ajanslarına para akıtmak yerine, yerel Google Haritalar ve yapay zeka video/görsel üretimiyle dükkanınızı öne çıkarın.",
      skillToLearnThisWeek: "Müşterilerinize WhatsApp üzerinden 7/24 otomatik ve nazik cevap veren ücretsiz bir yapay zeka mesaj botu kurun.",
      trapToAvoid: "'Ben yıllardır böyle satıyorum, bizim sektöre teknoloji gelmez' demek; rakipleriniz maliyetleri %30 düşürdüğünde fiyat tutturamazsınız."
    }
  },
  parent: {
    id: "parent",
    label: "Ebeveynim (Çocuk Yetiştiriyorum)",
    icon: Baby,
    targetGroup: "0-18 Yaş Çocuğu Olan Aileler",
    urgencyLevel: "Yüksek",
    urgencyColor: "text-pink-400 bg-pink-500/10 border-pink-500/30",
    summaryQuote: "Çocuğunuzu bugünün sınavlarına değil, 2035'in dünyasına hazırlayın. En kritik beceri kod yazmak değil; empati, soru sorma ve psikolojik dayanıklılık.",
    macroFocus: {
      statTitle: "Yeni Kuşağın Karşılaşacağı Mesleklerin Belirsizliği",
      statValue: "%85 Yeni Alan",
      context: "Bugün ilkokula başlayan çocukların %85'i henüz icat edilmemiş mesleklerde çalışacak."
    },
    criticalBreakthrough: {
      year: 2032,
      title: "Bilişsel Eğitim Devrimi & Çocuklara Özel Birebir Yapay Zeka Mentorlar",
      inevitabilityScore: 93,
      whyItMatters: "Klasik sınıf ortamında 40 kişiye aynı dersi anlatma modeli çöküyor; her çocuğun öğrenme hızına göre uyarlanan AI öğretmenler geliyor.",
      targetMilestoneYear: 2032
    },
    actionPrescription: {
      financialStep: "Çocuğunuz adına uzun vadeli teknoloji ve yapay zeka endeks fonlarında birikim hesabı başlatın.",
      skillToLearnThisWeek: "Çocuğunuza yapay zekayı bir yasak olarak değil, onunla masal yazan, resim çizdiren ve merakını besleyen bir araştırma partneri olarak tanıtın.",
      trapToAvoid: "Çocuğu sadece doktor/hukukçu/mühendis olsun diye klasik dershane ve test çözme baskısına boğmak; 10 yıl sonra ezber yapanlar değil vizyonerler aranacak."
    }
  },
  academic: {
    id: "academic",
    label: "Akademisyen / Araştırmacıyım",
    icon: Microscope,
    targetGroup: "Öğretim Üyeleri, Doktora Öğrencileri, Ar-Ge Liderleri",
    urgencyLevel: "Orta",
    urgencyColor: "text-blue-400 bg-blue-500/10 border-blue-500/30",
    summaryQuote: "Literatür taraması ve makale yazımını AI'a devretmeyen araştırmacılar hız yarışında geride kalacak; 2029'da AI bizzat bilimsel hipotez üretecek.",
    macroFocus: {
      statTitle: "Otonom Bilimsel Makale & Hipotez Üretimi",
      statValue: "100x Hızlanma",
      context: "Protein katlanması ve malzeme biliminde yapay zeka laboratuvar deney sürelerini 5 yıldan 2 haftaya indirdi."
    },
    criticalBreakthrough: {
      year: 2029,
      title: "Otonom Bilimsel Keşif Ajanları (AI Bilim İnsanı)",
      inevitabilityScore: 92,
      whyItMatters: "Yapay zeka yalnızca veri analiz etmeyecek; deney kurgulayıp bilimsel teorileri bizzat test edecek.",
      targetMilestoneYear: 2029
    },
    actionPrescription: {
      financialStep: "Uluslararası Horizon Europe, TÜBİTAK ve özel sektör fonlarında yapay zeka entegrasyonu barındırmayan projelere kaynak ayrılmayacak; projelerinizi AI odaklı yeniden çerçeveleyin.",
      skillToLearnThisWeek: "Elicit, Consensus veya SciSpace gibi yapay zeka literatür tarama araçlarını kullanarak 100 makaleyi 30 dakikada sentezleyin.",
      trapToAvoid: "Yapay zekanın akademik etik kurallarına takılacağını düşünerek görmezden gelmek; AI kullanan laboratuvarlar yayın sayısını 10'a katlıyor."
    }
  }
};

export const FutureVerdictView: React.FC<FutureVerdictViewProps> = ({
  milestones,
  onSelectMilestone,
  onNavigateView,
  onOpenAuthModal,
  onOpenGuideModal
}) => {
  const { currentUser, updateUserProfile } = useAuth();
  const { language } = useLanguage();
  const isTr = language === "tr";
  const [saveSuccessMsg, setSaveSuccessMsg] = useState<string | null>(null);

  // Derive initial role from user's onboarding selection or default to "employee"
  const defaultRoleId = useMemo(() => {
    if (currentUser?.lifeRole && ROLE_VERDICTS[currentUser.lifeRole]) {
      return currentUser.lifeRole;
    }
    // If user's age is >= 55, default to retiree
    if (currentUser?.age && currentUser.age >= 55) {
      return "retiree";
    }
    // If student
    if (currentUser?.lifeRole === "student") return "student";
    return "employee";
  }, [currentUser]);

  const [selectedRoleId, setSelectedRoleId] = useState<string>(defaultRoleId);

  // Sync if profile changes from outside
  useEffect(() => {
    if (currentUser?.lifeRole && ROLE_VERDICTS[currentUser.lifeRole]) {
      setSelectedRoleId(currentUser.lifeRole);
    }
  }, [currentUser?.lifeRole]);

  const currentVerdict = ROLE_VERDICTS[selectedRoleId] || ROLE_VERDICTS.employee;

  const handleSelectRole = (roleId: string) => {
    setSelectedRoleId(roleId);
    const targetVerdict = ROLE_VERDICTS[roleId];
    if (targetVerdict && updateUserProfile) {
      const roleToProfileMap: Record<string, { profession: string; lifeRole: string; lifeRoleLabel: string; employmentStatus?: string; seniority?: string }> = {
        employee: {
          profession: "Hizmet, Lojistik & İmalat Çalışanı",
          lifeRole: "employee",
          lifeRoleLabel: "Mavi Yaka / Hizmet Çalışanı",
          employmentStatus: "employed",
          seniority: "mid"
        },
        student: {
          profession: "Öğrenci / Genç Araştırmacı",
          lifeRole: "student",
          lifeRoleLabel: "Öğrenci",
          employmentStatus: "student",
          seniority: "junior"
        },
        retiree: {
          profession: "Emekli / Kıdemli Birey",
          lifeRole: "retiree",
          lifeRoleLabel: "Emekli",
          employmentStatus: "retired",
          seniority: "senior"
        },
        white_collar: {
          profession: "Özel Sektör Uzmanı & Yönetici",
          lifeRole: "white_collar",
          lifeRoleLabel: "Beyaz Yaka / Yönetici",
          employmentStatus: "employed",
          seniority: "senior"
        },
        business_owner: {
          profession: "KOBİ & Esnaf / İşletme Sahibi",
          lifeRole: "business_owner",
          lifeRoleLabel: "İşletme Sahibi",
          employmentStatus: "self_employed",
          seniority: "senior"
        },
        parent: {
          profession: "Ebeveyn / Aile Temsilcisi",
          lifeRole: "parent",
          lifeRoleLabel: "Ebeveyn",
          employmentStatus: currentUser?.employmentStatus || "employed",
          seniority: currentUser?.seniority || "mid"
        },
        academic: {
          profession: "Akademisyen & Bilimsel Araştırmacı",
          lifeRole: "academic",
          lifeRoleLabel: "Akademisyen / Araştırmacı",
          employmentStatus: "employed",
          seniority: "senior"
        }
      };

      const mapped = roleToProfileMap[roleId];
      if (mapped) {
        updateUserProfile({
          lifeRole: mapped.lifeRole,
          lifeRoleLabel: mapped.lifeRoleLabel,
          profession: mapped.profession,
          employmentStatus: mapped.employmentStatus,
          seniority: mapped.seniority,
          isOnboardingCompleted: true
        });
        setSaveSuccessMsg(`✓ Rol profiline bağlandı (${mapped.lifeRoleLabel})`);
        setTimeout(() => setSaveSuccessMsg(null), 3000);
      }
    }
  };

  const handleJumpToMilestone = (year: number) => {
    const target = milestones.find((m) => m.year === year);
    if (target && onSelectMilestone) {
      onSelectMilestone(target);
    } else {
      onNavigateView("timeline");
    }
  };

  return (
    <div className="space-y-6 sm:space-y-8 animate-fadeIn text-slate-100 max-w-7xl mx-auto px-2 sm:px-4 pb-16">
      {/* 1. HERO TITLE & ARCHITECTURE EXPLANATION */}
      <div className="relative p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-[#120b2d]/90 via-[#0d0922]/95 to-[#160d38]/90 border border-purple-500/30 shadow-[0_10px_40px_rgba(0,0,0,0.6)] space-y-4">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="space-y-2 max-w-3xl">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-3 py-1 rounded-full bg-purple-500/20 text-purple-300 font-mono text-xs font-bold border border-purple-500/30 flex items-center gap-1.5 uppercase">
                <Compass className="w-3.5 h-3.5 text-purple-400" />
                Gelecek Pusulası • Karar & Sentez Motoru
              </span>
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 font-mono text-[11px] border border-emerald-500/20">
                100+ Özelliğin Tek Sayfa Sentezi
              </span>
            </div>

            <h1 className="text-xl sm:text-3xl font-black text-white tracking-tight font-sans">
              Ayrı Ayrı Sekmelerde Kaybolmayın: 3 Temel Soru, 3 Net Cevap
            </h1>

            <p className="text-xs sm:text-sm text-slate-300 font-sans leading-relaxed">
              Bu sistem; yüzlerce karmaşık grafik ve teknik rapor yerine, Türkiye insanının hayattaki rolüne göre 
              <strong> "Dünya nerede?", "Önümdeki en büyük kaçınılmaz eşik ne zaman?"</strong> ve 
              <strong> "Ben bugün ne yapmalıyım?"</strong> sorularını doğrudan ve tek bir raporda özetler.
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0 flex-wrap">
            <button
              type="button"
              onClick={() => onNavigateView("roadmap")}
              className="px-4 py-3 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-mono font-bold text-xs uppercase tracking-wider shadow-lg shadow-purple-600/30 flex items-center gap-2 cursor-pointer transition-all transform hover:scale-[1.02]"
            >
              <Compass className="w-4 h-4 text-purple-200" />
              <span>Kişisel Yol Haritama Uygula</span>
            </button>
            <button
              type="button"
              onClick={() => onNavigateView("timeline")}
              className="px-4 py-3 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-mono font-bold text-xs uppercase tracking-wider shadow-lg shadow-cyan-500/20 flex items-center gap-2 cursor-pointer transition-all transform hover:scale-[1.02]"
            >
              <Calendar className="w-4 h-4 text-slate-950" />
              <span>Canlı Takvime Git</span>
            </button>
          </div>
        </div>

        {/* 2. RAPİD ROLE SWITCHER (50-60 YAŞ DEDE DE, LİSELİ DE 1 TIKLA GEÇEBİLİR) */}
        <div className="pt-3 border-t border-white/10 space-y-2">
          <div className="flex items-center justify-between text-xs font-mono text-slate-400 flex-wrap gap-2">
            <span className="flex items-center gap-1.5 font-bold text-slate-300">
              <Sliders className="w-3.5 h-3.5 text-purple-400" />
              Hangi Rolün Gelecek Raporunu İncelemek İstiyorsunuz?
            </span>
            <div className="flex items-center gap-2">
              {saveSuccessMsg && (
                <span className="text-[11px] text-emerald-400 font-bold bg-emerald-950/60 border border-emerald-500/30 px-2 py-0.5 rounded-full animate-fadeIn">
                  {saveSuccessMsg}
                </span>
              )}
              {currentUser?.username && (
                <span className="text-[11px] text-cyan-300">
                  Profil: <strong>{currentUser.username}</strong> ({currentUser.lifeRoleLabel || "Standart"})
                </span>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-purple-900">
            {Object.values(ROLE_VERDICTS).map((role, rIdx) => {
              const isSelected = selectedRoleId === role.id;
              const IconComponent = role.icon;
              return (
                <button
                  key={`role-verdict-${role.id || 'role'}-${rIdx}`}
                  type="button"
                  onClick={() => handleSelectRole(role.id)}
                  className={`px-3.5 py-2 rounded-xl text-xs font-mono font-bold flex items-center gap-2 shrink-0 transition-all cursor-pointer ${
                    isSelected
                      ? "bg-purple-600 text-white shadow-lg shadow-purple-600/30 border border-purple-400 scale-[1.02]"
                      : "bg-slate-900/80 text-slate-300 hover:bg-slate-800 hover:text-white border border-white/10"
                  }`}
                >
                  <IconComponent className={`w-3.5 h-3.5 ${isSelected ? "text-cyan-300" : "text-slate-400"}`} />
                  <span>{role.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* ACTIVE ROLE SUMMARY BANNER */}
      <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-purple-950/40 via-slate-900/80 to-cyan-950/40 border border-purple-500/30 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-purple-600/20 border border-purple-500/40 flex items-center justify-center text-purple-300 shrink-0">
            {React.createElement(currentVerdict.icon, { className: "w-6 h-6" })}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base sm:text-lg font-bold text-white font-sans">
                {currentVerdict.label} İçin Gelecek Raporu
              </h2>
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono uppercase font-bold border ${currentVerdict.urgencyColor}`}>
                {currentVerdict.urgencyLevel} Aciliyet
              </span>
            </div>
            <p className="text-xs text-purple-200/90 font-sans mt-0.5 max-w-2xl italic">
              "{currentVerdict.summaryQuote}"
            </p>
          </div>
        </div>

        <div className="text-right text-xs font-mono text-slate-400 shrink-0">
          <span className="text-[10px] block uppercase text-slate-500">Hedef Kitle:</span>
          <span className="text-slate-200 font-bold">{currentVerdict.targetGroup}</span>
        </div>
      </div>

      {/* THE 3 CORE PILLARS (3 ANA SORU VE 3 NET CEVAP) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* ==================================================================== */}
        {/* PILLAR 1: ŞU AN DÜNYA NEREDE? (MAKRO NABIZ) */}
        {/* ==================================================================== */}
        <div className="p-5 sm:p-6 rounded-3xl bg-[#0e0924]/90 border border-blue-500/30 shadow-xl space-y-4 flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="px-2.5 py-1 rounded-full bg-blue-500/20 text-blue-300 font-mono text-[10px] font-bold uppercase border border-blue-500/30 flex items-center gap-1.5">
                <Activity className="w-3 h-3 text-blue-400" />
                1. Soru & Cevap
              </span>
              <span className="text-xs font-mono text-slate-400 font-bold">2026 Durumu</span>
            </div>

            <h3 className="text-lg font-bold text-white font-sans flex items-center gap-2">
              <span>Şu An Dünya Nerede?</span>
            </h3>

            <p className="text-xs text-slate-300 font-sans leading-relaxed">
              Dünya şu anda <strong>"Yapay Zekanın Ekrandan Çıkıp Fiziksel Dünyaya Bedenlendiği"</strong> geçiş eşiğindedir. 
              Sadece metin yazan chatbotlar geride kalıyor; otonom ajanlar ve insansı robotlar sahaya iniyor.
            </p>

            {/* Role-Specific Metric */}
            <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-blue-500/20 space-y-1">
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="text-slate-400">{currentVerdict.macroFocus.statTitle}</span>
                <span className="text-sm font-black text-cyan-400">{currentVerdict.macroFocus.statValue}</span>
              </div>
              <p className="text-[11px] text-slate-400 font-sans">
                {currentVerdict.macroFocus.context}
              </p>
            </div>

            {/* Macro Global Gauges */}
            <div className="space-y-2 pt-1 font-mono text-xs">
              <div className="space-y-1">
                <div className="flex justify-between text-[11px] text-slate-300">
                  <span>Ofis / Bilişsel Görev Otomasyonu:</span>
                  <span className="font-bold text-purple-300">%24 (2026)</span>
                </div>
                <div className="w-full h-2 rounded-full bg-slate-900 overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-purple-500 to-indigo-500 rounded-full" style={{ width: "24%" }} />
                </div>
              </div>

              <div className="space-y-1">
                <div className="flex justify-between text-[11px] text-slate-300">
                  <span>AGI (Genel Yapay Zeka) Yakınlığı:</span>
                  <span className="font-bold text-amber-400">~2.5 Yıl (2028-2029)</span>
                </div>
                <div className="w-full h-2 rounded-full bg-slate-900 overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-amber-500 to-orange-500 rounded-full" style={{ width: "72%" }} />
                </div>
              </div>

              <div className="p-2.5 rounded-xl bg-purple-900/20 border border-purple-500/20 text-[11px] text-purple-200">
                🇹🇷 <strong>Türkiye İçin Anlamı:</strong> Döviz kuru ve çip maliyetleri nedeniyle ithal teknoloji pahalı; ancak yapay zekayı erken kullanan yerel bireyler ve esnaflar aradaki makası kapatabilir.
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={() => onNavigateView("geo_map")}
            className="w-full mt-3 py-2.5 rounded-xl bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/30 text-blue-300 hover:text-white font-mono text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
          >
            <span>5-Katmanlı Küresel Güç Haritası</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* ==================================================================== */}
        {/* PILLAR 2: ÖNÜMDEKİ EN BÜYÜK KAÇINILMAZ EŞİK NE ZAMAN VE NE? (KRİTİK KIRILMA) */}
        {/* ==================================================================== */}
        <div className="p-5 sm:p-6 rounded-3xl bg-[#140b2a]/90 border border-amber-500/30 shadow-xl space-y-4 flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="px-2.5 py-1 rounded-full bg-amber-500/20 text-amber-300 font-mono text-[10px] font-bold uppercase border border-amber-500/30 flex items-center gap-1.5">
                <AlertTriangle className="w-3 h-3 text-amber-400" />
                2. Soru & Cevap
              </span>
              <span className="px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 font-mono text-[10px] font-bold">
                %{currentVerdict.criticalBreakthrough.inevitabilityScore} Kaçınılmazlık
              </span>
            </div>

            <h3 className="text-lg font-bold text-white font-sans">
              En Büyük Kaçınılmaz Eşik Ne?
            </h3>

            {/* Main Milestone Card */}
            <div className="p-4 rounded-2xl bg-slate-950/90 border border-amber-500/30 space-y-2">
              <div className="flex items-center gap-2">
                <span className="text-2xl font-black text-amber-400 font-mono">
                  {currentVerdict.criticalBreakthrough.year}
                </span>
                <span className="text-xs font-bold text-white font-sans leading-tight">
                  {currentVerdict.criticalBreakthrough.title}
                </span>
              </div>

              <div className="text-xs text-slate-300 font-sans leading-relaxed pt-1">
                <strong>Sizi Nasıl Etkileyecek?</strong>
                <p className="text-slate-400 mt-0.5">
                  {currentVerdict.criticalBreakthrough.whyItMatters}
                </p>
              </div>

              <button
                type="button"
                onClick={() => handleJumpToMilestone(currentVerdict.criticalBreakthrough.targetMilestoneYear)}
                className="w-full mt-2 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-mono text-xs font-bold flex items-center justify-center gap-1.5 shadow-md shadow-amber-500/20 cursor-pointer transition-all"
              >
                <span>{currentVerdict.criticalBreakthrough.year} Yılını Canlı Takvimde İncele</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Secondary Milestone if available */}
            {currentVerdict.secondaryBreakthrough && (
              <div className="p-3 rounded-2xl bg-purple-950/40 border border-purple-500/20 space-y-1">
                <div className="flex items-center gap-2 text-xs font-mono">
                  <span className="font-black text-purple-300">{currentVerdict.secondaryBreakthrough.year}:</span>
                  <span className="font-bold text-white truncate">{currentVerdict.secondaryBreakthrough.title}</span>
                </div>
                <p className="text-[11px] text-slate-400 font-sans">
                  {currentVerdict.secondaryBreakthrough.whyItMatters}
                </p>
              </div>
            )}
          </div>

          <div className="text-[11px] text-slate-400 font-mono flex items-center gap-1 pt-2">
            <Clock className="w-3.5 h-3.5 text-amber-400 shrink-0" />
            <span>Bu eşiğe hazırlanmak için önünüzde yaklaşık <strong>{currentVerdict.criticalBreakthrough.year - 2026} yıl</strong> var.</span>
          </div>
        </div>

        {/* ==================================================================== */}
        {/* PILLAR 3: BEN BUGÜN NE YAPMALIYIM? (EYLEM REÇETESİ) */}
        {/* ==================================================================== */}
        <div className="p-5 sm:p-6 rounded-3xl bg-[#0b1e1b]/90 border border-emerald-500/30 shadow-xl space-y-4 flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 font-mono text-[10px] font-bold uppercase border border-emerald-500/30 flex items-center gap-1.5">
                <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                3. Soru & Cevap
              </span>
              <span className="text-xs font-mono text-emerald-400 font-bold">Eylem Reçetesi</span>
            </div>

            <h3 className="text-lg font-bold text-white font-sans">
              Ben Bugün Ne Yapmalıyım?
            </h3>

            <p className="text-xs text-slate-300 font-sans">
              Teknoloji hızla ilerlerken panik yapmayın. Bu hafta atabileceğiniz 3 somut adım:
            </p>

            <div className="space-y-2.5">
              {/* 1. Finans / Geçim Adımı */}
              <div className="p-3 rounded-2xl bg-slate-950/80 border border-white/5 space-y-1">
                <div className="flex items-center gap-2 text-xs font-mono text-amber-300 font-bold">
                  <Coins className="w-3.5 h-3.5" />
                  <span>1. Finans & Birikim Adımı</span>
                </div>
                <p className="text-xs text-slate-300 font-sans">
                  {currentVerdict.actionPrescription.financialStep}
                </p>
              </div>

              {/* 2. Bu Hafta Öğrenilecek Beceri */}
              <div className="p-3 rounded-2xl bg-slate-950/80 border border-white/5 space-y-1">
                <div className="flex items-center gap-2 text-xs font-mono text-emerald-300 font-bold">
                  <Brain className="w-3.5 h-3.5" />
                  <span>2. Bu Hafta Öğrenilecek 1 Beceri</span>
                </div>
                <p className="text-xs text-slate-300 font-sans">
                  {currentVerdict.actionPrescription.skillToLearnThisWeek}
                </p>
              </div>

              {/* 3. Kaçınılması Gereken Tuzak */}
              <div className="p-3 rounded-2xl bg-rose-950/30 border border-rose-500/20 space-y-1">
                <div className="flex items-center gap-2 text-xs font-mono text-rose-300 font-bold">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  <span>3. Kaçınılması Gereken 1 Tuzak</span>
                </div>
                <p className="text-xs text-rose-200/90 font-sans">
                  {currentVerdict.actionPrescription.trapToAvoid}
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-2 mt-3">
            <button
              type="button"
              onClick={() => onNavigateView("roadmap")}
              className="w-full py-2.5 rounded-xl bg-purple-600/30 hover:bg-purple-600/40 border border-purple-500/40 text-purple-200 hover:text-white font-mono text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
            >
              <ArrowRight className="w-3.5 h-3.5 text-purple-300" />
              <span>Bu Reçeteyi Kişisel Yol Haritasında Takip Et</span>
            </button>

            {onOpenGuideModal && (
              <button
                type="button"
                onClick={onOpenGuideModal}
                className="w-full py-2.5 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/40 text-emerald-300 hover:text-white font-mono text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                <Bot className="w-3.5 h-3.5" />
                <span>Yapay Zeka Danışmanına Özel Soru Sor</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* 4. LAB & EVIDENCE ACCORDION (MERAKLISI İÇİN DERİN ARAÇLAR) */}
      <div className="p-6 rounded-3xl bg-slate-950/90 border border-white/10 space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div>
            <h4 className="text-sm sm:text-base font-bold text-white font-mono flex items-center gap-2">
              <Layers className="w-4 h-4 text-purple-400" />
              <span>Daha Fazla Kanıt ve Derin Simülasyon Araçları</span>
            </h4>
            <p className="text-xs text-slate-400 font-sans mt-0.5">
              Bu 3 cevabın arkasındaki matematiksel simülasyonları, patent sinyallerini ve akademik makaleleri inceleyin.
            </p>
          </div>

          <span className="text-[11px] font-mono text-slate-500">İsteğe Bağlı Gelişmiş Laboratuvar</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1">
          <button
            type="button"
            onClick={() => onNavigateView("telegram_feed")}
            className="p-3.5 rounded-2xl bg-slate-900/80 hover:bg-purple-950/40 border border-white/5 hover:border-purple-500/30 text-left transition-all group cursor-pointer"
          >
            <div className="flex items-center gap-2 text-amber-400 font-mono text-xs font-bold">
              <Zap className="w-4 h-4" />
              <span>Canlı Sinyaller</span>
            </div>
            <p className="text-[10px] text-slate-400 font-sans mt-1">
              Patentler, şirket yol haritaları ve güncel haberler.
            </p>
          </button>

          <button
            type="button"
            onClick={() => onNavigateView("verification")}
            className="p-3.5 rounded-2xl bg-slate-900/80 hover:bg-emerald-950/40 border border-white/5 hover:border-emerald-500/30 text-left transition-all group cursor-pointer"
          >
            <div className="flex items-center gap-2 text-emerald-400 font-mono text-xs font-bold">
              <ShieldCheck className="w-4 h-4" />
              <span>Gelişim Aşaması & Kanıt</span>
            </div>
            <p className="text-[10px] text-slate-400 font-sans mt-1">
              Hakemli literatür ve teknolojik olgunluk aşamaları.
            </p>
          </button>

          <button
            type="button"
            onClick={() => onNavigateView("butterfly")}
            className="p-3.5 rounded-2xl bg-slate-900/80 hover:bg-pink-950/40 border border-white/5 hover:border-pink-500/30 text-left transition-all group cursor-pointer"
          >
            <div className="flex items-center gap-2 text-pink-400 font-mono text-xs font-bold">
              <Activity className="w-4 h-4" />
              <span>Kelebek Etkisi</span>
            </div>
            <p className="text-[10px] text-slate-400 font-sans mt-1">
              "X olursa ne değişir?" sapma simülatörü.
            </p>
          </button>

          <button
            type="button"
            onClick={() => onNavigateView("network")}
            className="p-3.5 rounded-2xl bg-slate-900/80 hover:bg-cyan-950/40 border border-white/5 hover:border-cyan-500/30 text-left transition-all group cursor-pointer"
          >
            <div className="flex items-center gap-2 text-cyan-400 font-mono text-xs font-bold">
              <Layers className="w-4 h-4" />
              <span>Nedensellik Ağı</span>
            </div>
            <p className="text-[10px] text-slate-400 font-sans mt-1">
              Hangi gelişme hangi geleceği tetikliyor?
            </p>
          </button>
        </div>
      </div>
    </div>
  );
};

export default FutureVerdictView;
