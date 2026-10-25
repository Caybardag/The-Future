import React, { useState, useEffect, useMemo } from "react";
import { ViewMode, JobRiskAnalysisResult, Milestone } from "../types";
import { useLanguage } from "../context/LanguageContext";
import { useAuth } from "../context/AuthContext";
import { getFeatureCreditCost } from "../utils/creditCosts";
import { useDailyFeatureLimit } from "../utils/dailyLimitTracker";
import { aiService } from "../services/AIService";
import { handleAutoRefundAndLog } from "../utils/creditDisputes";
import { recordPredictionHistoryEntry, getPendingRerunRecord, clearPendingRerunRecord } from "../utils/predictionHistory";
import {
  Briefcase,
  TrendingUp,
  Zap,
  ShieldCheck,
  Award,
  Copy,
  Check,
  ArrowRight,
  Sparkles,
  Sliders,
  RotateCcw,
  Cpu,
  Radio,
  User,
  Compass,
  AlertTriangle,
  Lock,
  Layers,
  ChevronRight,
  Send,
  Loader2,
  CheckCircle2,
  GraduationCap,
  Search,
  Wrench,
  Target,
  Lightbulb,
  HelpCircle,
  RefreshCw,
  FileText
} from "lucide-react";
import { UserProfile } from "./UserAuthModal";

interface ProfessionConfig {
  id: string;
  name: string;
  emoji: string;
  baseRisk: number;
  color: string;
  timeline: Record<
    number,
    {
      yearTitle: string;
      riskScore: number;
      marketValueMultiplier: string;
      automationLevel: number;
      humanValueLevel: number;
      situation: string;
      decisions: {
        id: string;
        choice: string;
        consequence: string;
        survivalBoost: number;
        futureRole: string;
      }[];
      keySkills: string[];
      actionHint: string;
    }
  >;
}

const PROFESSIONS: ProfessionConfig[] = [
  {
    id: "software",
    name: "Yazılımcı & AI Geliştirici",
    emoji: "💻",
    baseRisk: 78,
    color: "#38bdf8",
    timeline: {
      2026: {
        yearTitle: "Otonom Kod Asistanları & Hız Çağı",
        riskScore: 35,
        marketValueMultiplier: "1.8x",
        automationLevel: 35,
        humanValueLevel: 65,
        situation: "Cursor, Claude Code ve Devin benzeri ajanlar rutin kodlamanın üçte birini tek komutla yazmaya başladı.",
        decisions: [
          {
            id: "sw_26_a",
            choice: "Ajanları günlük kodlama ortağı yap, üretim hızını 5x artır.",
            consequence: "Tek kişilik mikro-SaaS üreten süper geliştirici seviyesine yükseldin.",
            survivalBoost: 25,
            futureRole: "1 Kişilik Otonom SaaS Mimarı"
          },
          {
            id: "sw_26_b",
            choice: "Geleneksel manuel kodlamada diret, araçları reddet.",
            consequence: "Rutin iş yükünde boğuldun, üretim hızın pazarın gerisinde kaldı.",
            survivalBoost: -15,
            futureRole: "Eski Nesil Kod Bakımcısı"
          }
        ],
        keySkills: ["Cursor / Claude Code", "LangGraph", "Prompt & Ajan Mühendisliği"],
        actionHint: "Kod yazmayı bırakıp problem çözmeye ve sistem mimarisine odaklanın."
      },
      2028: {
        yearTitle: "Çoklu Ajan (Multi-Agent) Filoları",
        riskScore: 72,
        marketValueMultiplier: "3.5x",
        automationLevel: 72,
        humanValueLevel: 78,
        situation: "Yazılım ekiplerinde 10 kişilik geliştirici kadroları yerine 1 mimar + 20 otonom yazılım ajanı modeli standartlaştı.",
        decisions: [
          {
            id: "sw_28_a",
            choice: "Ajan filolarını orkestre eden 'Sistem Denetçisi' ol.",
            consequence: "Yazılım şirketlerinde en kritik karar merci ve mimar haline geldin.",
            survivalBoost: 35,
            futureRole: "Otonom Ajan Filosu Orkestratörü"
          },
          {
            id: "sw_28_b",
            choice: "Sadece verilen biletleri (ticket) çözmeye devam et.",
            consequence: "Biletlerin tamamı otonom ajanlara devredildi, pozisyonun risk altına girdi.",
            survivalBoost: -30,
            futureRole: "İkame Edilen Operatör"
          }
        ],
        keySkills: ["Multi-Agent Swarm", "Sistem Doğrulama", "Vektör RAG Mimarileri"],
        actionHint: "Ajanların ürettiği kodun mantık, güvenlik ve mimari uyumunu denetleyen lider olun."
      },
      2030: {
        yearTitle: "AGI & Kendi Kendini İyileştiren Kod",
        riskScore: 85,
        marketValueMultiplier: "5.2x",
        automationLevel: 85,
        humanValueLevel: 90,
        situation: "AGI seviyesi muhakeme; kullanıcı ihtiyacından çalışan tam teşekküllü küresel platformu dakikalar içinde üretiyor.",
        decisions: [
          {
            id: "sw_30_a",
            choice: "Ürün ve iş modelinin mülkiyetini al, sermaye ve platform sahibi ol.",
            consequence: "Teknoloji tüketicisinden teknoloji mülkiyeti sahibine evrildin.",
            survivalBoost: 40,
            futureRole: "Yapay Zeka Girişim Ekosistem Lideri"
          },
          {
            id: "sw_30_b",
            choice: "Standart maaşlı kodlama işi ara.",
            consequence: "Geleneksel maaşlı yazılım pazarı %80 daraldı.",
            survivalBoost: -35,
            futureRole: "Geçiş Dönemi Arayışında"
          }
        ],
        keySkills: ["First-Principles Tasarım", "Pazar Sezgisi", "Biyo-Dijital Protokoller"],
        actionHint: "Teknoloji yapan değil, hangi teknolojinin ne amaçla var olması gerektiğine karar veren akıl olun."
      },
      2035: {
        yearTitle: "Kuantum & Biyo-Hesaplama Çağı",
        riskScore: 92,
        marketValueMultiplier: "10x",
        automationLevel: 92,
        humanValueLevel: 98,
        situation: "Elektronik kodlama yerini kuantum kübit programlama ve DNA veri tabanlarına bıraktı.",
        decisions: [
          {
            id: "sw_35_a",
            choice: "Kuantum-Moleküler algoritmalar ve insan-makine arayüzlerine geç.",
            consequence: "Yeni dünyanın vazgeçilmez süper hesaplama mimarı oldun.",
            survivalBoost: 50,
            futureRole: "Kuantum & Biyo-Algoritma Mimarı"
          },
          {
            id: "sw_35_b",
            choice: "Eski silikon tabanlı mimarilerde kal.",
            consequence: "Legacy sistemlerin antika uzmanı olarak sınırlı alanda kaldın.",
            survivalBoost: -20,
            futureRole: "Legacy Sistem Danışmanı"
          }
        ],
        keySkills: ["Kuantum Mantığı", "Nöromorfik Çipler", "Sentetik Biyoloji Kodlama"],
        actionHint: "Bilişimin fiziksel sınırlarını zorlayan disiplinlerarası lider olun."
      }
    }
  },
  {
    id: "doctor",
    name: "Doktor & Biyo-Tıp Uzmanı",
    emoji: "🏥",
    baseRisk: 52,
    color: "#34d399",
    timeline: {
      2026: {
        yearTitle: "Hassas AI Tanı & İkinci Göz",
        riskScore: 20,
        marketValueMultiplier: "1.5x",
        automationLevel: 25,
        humanValueLevel: 80,
        situation: "Görüntüleme, röntgen ve MR sonuçları yapay zeka tarafından 3 saniyede %99 doğrulukla taranıyor.",
        decisions: [
          {
            id: "doc_26_a",
            choice: "Tanı algoritmalarını klinik rutininde onaylayıcı asistan yap.",
            consequence: "Hata payını sıfıra indirdin, hasta iletişimine 3 kat daha fazla vakit ayırdın.",
            survivalBoost: 20,
            futureRole: "AI Destekli Klinik Lider"
          },
          {
            id: "doc_26_b",
            choice: "AI tanı raporlarını görmezden gel.",
            consequence: "Tanı hızı ve yakalama oranında geri kalarak zaman kaybettin.",
            survivalBoost: -10,
            futureRole: "Geleneksel Teşhis Hekimi"
          }
        ],
        keySkills: ["Med-PaLM & AlphaFold", "Klinik Empati", "Multimodal Sağlık Verisi"],
        actionHint: "Teknik veriyi hastaya şefkatle ve anlaşılır şekilde aktaran köprü olun."
      },
      2028: {
        yearTitle: "Kişiselleştirilmiş Gen & Molekül Tıbbı",
        riskScore: 45,
        marketValueMultiplier: "2.8x",
        automationLevel: 50,
        humanValueLevel: 85,
        situation: "Hastalara standart ilaçlar yerine kendi DNA dizilimlerine özel sentezlenen anlık tedaviler veriliyor.",
        decisions: [
          {
            id: "doc_28_a",
            choice: "Gen düzenleme (CRISPR) ve mRNA protokollerinde uzmanlaş.",
            consequence: "Kişiye özel genetik tedavi merkezinin başkanı oldun.",
            survivalBoost: 30,
            futureRole: "Kişiselleştirilmiş Genomik Direktörü"
          },
          {
            id: "doc_28_b",
            choice: "Sadece standart farmakolojik reçeteler yaz.",
            consequence: "Standart reçetelerin tamamı otonom sağlık kabinlerine devredildi.",
            survivalBoost: -25,
            futureRole: "Temel Sağlık Danışmanı"
          }
        ],
        keySkills: ["Prime Editing", "Hücresel Rejenerasyon", "Biyoetik Karar Alma"],
        actionHint: "İlaç yazan değil, hücre düzeyinde tasarım yapan tıp lideri olun."
      },
      2030: {
        yearTitle: "Robotik Cerrahi & Otonom Müdahale",
        riskScore: 65,
        marketValueMultiplier: "4.5x",
        automationLevel: 68,
        humanValueLevel: 90,
        situation: "Mikro-robotik cerrahi sistemleri milimetrik ameliyatları otonom yapabiliyor.",
        decisions: [
          {
            id: "doc_30_a",
            choice: "Cerrahi robotların stratejik orkestratörü ve etik kaptanı ol.",
            consequence: "Aynı anda 5 ameliyatı uzaktan yöneten süper cerraha dönüştün.",
            survivalBoost: 40,
            futureRole: "Robotik Cerrahi Filo Komutanı"
          },
          {
            id: "doc_30_b",
            choice: "Manuel el ameliyatlarında ısrarcı ol.",
            consequence: "İnsan elinin titreme ve yorulma sınırları nedeniyle vakaların gerisinde kaldın.",
            survivalBoost: -30,
            futureRole: "Klasik Operatör"
          }
        ],
        keySkills: ["Tele-Cerrahi Arayüzleri", "Kritik Karar Algoritmaları", "Biyo-İmplantlar"],
        actionHint: "Mekanik kesim işini robota bırakıp kritik anatomik kararları verin."
      },
      2035: {
        yearTitle: "Biyo-Longevity & Hücresel Gençleşme",
        riskScore: 80,
        marketValueMultiplier: "8.5x",
        automationLevel: 82,
        humanValueLevel: 95,
        situation: "Hastalık tedavisinden çok yaşlanmanın biyolojik olarak tersine çevrilmesi çağı başladı.",
        decisions: [
          {
            id: "doc_35_a",
            choice: "Hücresel gençleştirme ve nöral arayüz sağlığına odaklan.",
            consequence: "Geleceğin en zengin longevity ve yaşam uzatma kliniklerinin öncüsü oldun.",
            survivalBoost: 45,
            futureRole: "Biyolojik Yaşam Uzatma Başhekimi"
          },
          {
            id: "doc_35_b",
            choice: "Sadece akut hastalık kliniklerinde kal.",
            consequence: "Akut hastalıkların %90'ı önleyici nanobotlarca çözüldüğü için hasta sayısı azaldı.",
            survivalBoost: -15,
            futureRole: "Acil Vaka Danışmanı"
          }
        ],
        keySkills: ["Senolitik Terapiler", "Epigenetik Sıfırlama", "BCI Nöro-Sağlık"],
        actionHint: "İnsan ömrünü sağlıklı 120 yıla taşıyan longevity lideri olun."
      }
    }
  },
  {
    id: "designer",
    name: "Tasarımcı & Kreatif Direktör",
    emoji: "🎨",
    baseRisk: 82,
    color: "#f472b6",
    timeline: {
      2026: {
        yearTitle: "Üretken Görsel & Video Patlaması",
        riskScore: 40,
        marketValueMultiplier: "2.0x",
        automationLevel: 45,
        humanValueLevel: 75,
        situation: "Midjourney ve Sora kalitesindeki modeller saniyeler içinde 4K sinematik görsel ve video üretiyor.",
        decisions: [
          {
            id: "des_26_a",
            choice: "Modelleri fikir eskizleme ve storyboard aracın yap, hikaye anlatıcılığına odaklan.",
            consequence: "Tek başına koca bir prodüksiyon ajansı gibi iş üreten kreatif lidere dönüştün.",
            survivalBoost: 25,
            futureRole: "Sentetik Sinema & Kreatif Direktör"
          },
          {
            id: "des_26_b",
            choice: "Piksel piksel manuel çizim yapıp AI görsellerine diren.",
            consequence: "Zaman ve maliyet rekabetinde ajansların gerisinde kaldın.",
            survivalBoost: -20,
            futureRole: "Geleneksel İllüstratör"
          }
        ],
        keySkills: ["ComfyUI & Lora Eğitimi", "Görsel Hikaye Anlatımı", "Marka Ruhu Tasarımı"],
        actionHint: "İllüstrasyon çizen değil, duygu ve dünya inşa eden vizyoner olun."
      },
      2028: {
        yearTitle: "3D Uzamsal & Nöral Arayüz Tasarımı",
        riskScore: 70,
        marketValueMultiplier: "3.8x",
        automationLevel: 70,
        humanValueLevel: 80,
        situation: "Ekranlar yerini AR/VR uzamsal holografik dünyalara ve BCI düşünce arayüzlerine bırakıyor.",
        decisions: [
          {
            id: "des_28_a",
            choice: "2D grafiklerden çıkıp 3D uzamsal ve nöral UI/UX tasarlamaya geç.",
            consequence: "Yeni nesil Apple/Meta spatial evrenlerinin baş tasarımcısı oldun.",
            survivalBoost: 35,
            futureRole: "Uzamsal Evren & Nöro-UX Mimarı"
          },
          {
            id: "des_28_b",
            choice: "Klasik web ve mobil banner tasarımlarında kal.",
            consequence: "2D banner tasarımının tamamı otonom AI şablonlarına devredildi.",
            survivalBoost: -30,
            futureRole: "2D Tasarım Operatörü"
          }
        ],
        keySkills: ["Spatial UX (VisionOS)", "Unreal Engine 6", "Nöral Geri Bildirim Tasarımı"],
        actionHint: "Düz ekranları unutun; 3 boyutlu hissiyat ve uzamsal deneyim tasarlayın."
      },
      2030: {
        yearTitle: "Duyusal & Nöral Gerçeklik Simülasyonu",
        riskScore: 88,
        marketValueMultiplier: "6.0x",
        automationLevel: 88,
        humanValueLevel: 92,
        situation: "Doğrudan beyne aktarılan rüya benzeri sentetik gerçeklik deneyimleri popülerleşti.",
        decisions: [
          {
            id: "des_30_a",
            choice: "Düşünce hızıyla dünya yaratan 'Deneyim Mimarı' ol.",
            consequence: "İnsanların hafızalarına kazınan sanal dünyaların baş mimarı haline geldin.",
            survivalBoost: 45,
            futureRole: "Nöral Simülasyon Dünyası Mimarı"
          },
          {
            id: "des_30_b",
            choice: "Geleneksel 2D/3D ajanslarda kal.",
            consequence: "Pazar talebi doğrudan bilişsel deneyimlere kaydı.",
            survivalBoost: -35,
            futureRole: "Eski Medya Tasarımcısı"
          }
        ],
        keySkills: ["Sentetik Dünya Kurulumu", "BCI Algı Mühendisliği", "Kavramsal Sanat"],
        actionHint: "Görsel değil, insanın tüm duyularıyla hissettiği sanal gerçeklikler tasarlayın."
      },
      2035: {
        yearTitle: "Kuantum Sanat & Bilişsel Estetik",
        riskScore: 94,
        marketValueMultiplier: "9.5x",
        automationLevel: 95,
        humanValueLevel: 98,
        situation: "Sanatın değeri tamamen saf insan bilincinin özgünlüğüne ve duygusal derinliğine endekslendi.",
        decisions: [
          {
            id: "des_35_a",
            choice: "İnsan ruhu, felsefe ve kuantum estetiğinin birleşimini yarat.",
            consequence: "Eserleri müzayedelerde rekorlar kıran yaşayan efsane sanatçı oldun.",
            survivalBoost: 50,
            futureRole: "Kuantum Bilişsel Sanat Ustası"
          },
          {
            id: "des_35_b",
            choice: "Şablon kurgular üretmeye devam et.",
            consequence: "Şablon içeriklerin maddi değeri sıfıra indi.",
            survivalBoost: -25,
            futureRole: "Dijital Stok Üreticisi"
          }
        ],
        keySkills: ["Kuantum Estetik", "Felsefi Tasarım", "Saf İnsan Bilinci"],
        actionHint: "Algoritmaların kopyalayamayacağı tek şey olan insan ruhunun derinliğini işleyin."
      }
    }
  },
  {
    id: "finance",
    name: "Finansçı & Varlık Yöneticisi",
    emoji: "📊",
    baseRisk: 75,
    color: "#fbbf24",
    timeline: {
      2026: {
        yearTitle: "Algoritmik Ticaret & Otomasyon",
        riskScore: 38,
        marketValueMultiplier: "1.7x",
        automationLevel: 40,
        humanValueLevel: 70,
        situation: "Yapay zeka modelleri bilanço okuma ve piyasa duyarlılık analizini milisaniyelerde yapıyor.",
        decisions: [
          {
            id: "fin_26_a",
            choice: "AI kantitatif modelleri ve makro tahmin araçlarını kendi stratejine entegre et.",
            consequence: "Portföy getirisini pazar ortalamasının 2 katına çıkardın.",
            survivalBoost: 25,
            futureRole: "AI Destekli Portföy Yöneticisi"
          },
          {
            id: "fin_26_b",
            choice: "Sadece Excel tabloları ve klasik grafik analizi yap.",
            consequence: "Piyasa hızının ve derinliğinin gerisinde kaldın.",
            survivalBoost: -15,
            futureRole: "Klasik Veri Analisti"
          }
        ],
        keySkills: ["Python & FinGPT", "Kantitatif Risk Yönetimi", "Makro Trend Analizi"],
        actionHint: "Tablo dolduran değil, sermayeyi en karlı fırsatlara yönlendiren stratejist olun."
      },
      2028: {
        yearTitle: "DeFi & Otonom Piyasa Yapıcılar",
        riskScore: 68,
        marketValueMultiplier: "3.2x",
        automationLevel: 68,
        humanValueLevel: 80,
        situation: "Kripto varlıklar, gerçek dünya varlıkları (RWA) ve otonom likidite havuzları bankacılığı dönüştürdü.",
        decisions: [
          {
            id: "fin_28_a",
            choice: "RWA tokenizasyonu ve otonom DeFi likidite protokollerini yönet.",
            consequence: "Küresel kurumsal fonların akıllı sözleşme mimarı oldun.",
            survivalBoost: 35,
            futureRole: "RWA & Tokenize Varlık Direktörü"
          },
          {
            id: "fin_28_b",
            choice: "Eski şube ve geleneksel banka kredi süreçlerinde kal.",
            consequence: "Geleneksel kredi birimleri %70 küçüldü.",
            survivalBoost: -25,
            futureRole: "Geleneksel Banka Memuru"
          }
        ],
        keySkills: ["RWA Tokenizasyonu", "Akıllı Sözleşme Denetimi", "Sistemik Likidite"],
        actionHint: "Paranın programlanabilir hale geldiği yeni finansal mimariyi öğrenin."
      },
      2030: {
        yearTitle: "Otonom Ajan Ekonomisi (A2A)",
        riskScore: 82,
        marketValueMultiplier: "5.5x",
        automationLevel: 85,
        humanValueLevel: 90,
        situation: "İnsanlar yerine yapay zeka ajanları birbirleriyle mikro-ödemeler ve sözleşmeler yaparak ticaret yapıyor.",
        decisions: [
          {
            id: "fin_30_a",
            choice: "Ajanlar arası ticaret (A2A) vergi, likidite ve takas ağlarını kur.",
            consequence: "Geleceğin en büyük trilyon dolarlık otonom ödeme altyapısının hissedarı oldun.",
            survivalBoost: 45,
            futureRole: "Ajan Ekonomisi & Sermaye Mimarı"
          },
          {
            id: "fin_30_b",
            choice: "Sadece insan odaklı perakende fonlarda kal.",
            consequence: "Pazardaki işlem hacminin %90'ı ajanlar arası piyasalara kaydı.",
            survivalBoost: -30,
            futureRole: "Eski Fon Yöneticisi"
          }
        ],
        keySkills: ["A2A Protokolleri", "Kuantum Arbitraj", "Otonom Vergi Sistemleri"],
        actionHint: "Ajanların ticaret yaptığı yeni dünyada likidite sağlayan güç olun."
      },
      2035: {
        yearTitle: "Kuantum Finans & Küresel Kaynak Optimizasyonu",
        riskScore: 90,
        marketValueMultiplier: "8.0x",
        automationLevel: 92,
        humanValueLevel: 95,
        situation: "Kuantum bilgisayarlar küresel kaynak dağılımını ve risk simülasyonlarını hatasız yönetiyor.",
        decisions: [
          {
            id: "fin_35_a",
            choice: "Gezegensel kaynak tahsisi ve küresel enerji arbitrajını yönlendir.",
            consequence: "Uluslararası iklim ve enerji fonlarının baş stratejisti oldun.",
            survivalBoost: 50,
            futureRole: "Gezegensel Kaynak & Sermaye Direktörü"
          },
          {
            id: "fin_35_b",
            choice: "Eski borsa hisselerinde kal.",
            consequence: "Klasik hisse piyasaları kuantum optimizasyonuyla statikleşti.",
            survivalBoost: -20,
            futureRole: "Klasik Portföy Danışmanı"
          }
        ],
        keySkills: ["Kuantum Finans", "Gezegensel Tahsisat", "Etik Sermaye"],
        actionHint: "Sadece para değil, dünyanın kıt kaynaklarını en doğru yere aktaran pusula olun."
      }
    }
  },
  {
    id: "teacher",
    name: "Öğretmen & Eğitim Mimarı",
    emoji: "👨‍🏫",
    baseRisk: 52,
    color: "#f59e0b",
    timeline: {
      2026: {
        yearTitle: "Kişiselleştirilmiş AI Öğretim Asistanları",
        riskScore: 28,
        marketValueMultiplier: "1.4x",
        automationLevel: 30,
        humanValueLevel: 70,
        situation: "Öğrenciler ders tekrarlarını ve soru çözümlerini bireysel AI öğretmenleriyle yapmaya başladı.",
        decisions: [
          {
            id: "teach_26_a",
            choice: "AI araçlarını sınıf müfredatına entegre et, rehberlik ve eleştirel düşünme koçu ol.",
            consequence: "Öğrencilerin en sevdiği modern eğitim liderine dönüştün.",
            survivalBoost: 25,
            futureRole: "Bilişsel Yetkinlik & Mentorluk Mimarı"
          },
          {
            id: "teach_26_b",
            choice: "Yapay zekayı sınıfta yasakla, klasik ezber yönteminde kal.",
            consequence: "Öğrencilerle iletişim koptu, okul yönetimi çağdaş eğitimcileri öne çıkardı.",
            survivalBoost: -15,
            futureRole: "Geleneksel Müfredat Okutmanı"
          }
        ],
        keySkills: ["AI Eğitsel Prompting", "Sokratik Sorgulama", "Duygusal Zeka"],
        actionHint: "Ezberleten değil, düşündüren ve merak uyandıran bir zihin rehberi olun."
      },
      2028: {
        yearTitle: "Adaptif Nöro-Öğrenme & Holografik Sınıflar",
        riskScore: 45,
        marketValueMultiplier: "2.1x",
        automationLevel: 50,
        humanValueLevel: 50,
        situation: "Yapay zeka her öğrencinin anlama hızına göre anlık müfredat üretiyor.",
        decisions: [
          {
            id: "teach_28_a",
            choice: "Öğrencilerin etik, empati ve sosyal gelişim liderliğini üstlen.",
            consequence: "Teknolojinin yerine koyamayacağı insan erdemlerinin baş rehberi oldun.",
            survivalBoost: 35,
            futureRole: "Karakter & Toplumsal Uyum Lideri"
          },
          {
            id: "teach_28_b",
            choice: "Sadece konu anlatımına odaklanmaya devam et.",
            consequence: "AI konu anlatımını senden kat kat sürükleyici yaptığı için ders talebi azaldı.",
            survivalBoost: -25,
            futureRole: "Yardımcı Eğitmen"
          }
        ],
        keySkills: ["Etik Mentorluk", "Grup Dinamikleri", "Bireysel Potansiyel Koçluğu"],
        actionHint: "Bilgi bedava ve sınırsız; sizin değeriniz insani erdemler ve bilgeliktir."
      },
      2030: {
        yearTitle: "Ömür Boyu Bilişsel Gelişim Küratörlüğü",
        riskScore: 55,
        marketValueMultiplier: "2.8x",
        automationLevel: 65,
        humanValueLevel: 35,
        situation: "Yetişkinler hızla değişen sektörler için sürekli yeniden eğitim (reskilling) alıyor.",
        decisions: [
          {
            id: "teach_30_a",
            choice: "Yetişkinler ve çalışanlar için otonom kariyer dönüşüm akademileri kur.",
            consequence: "Kariyerini değiştiren yüzbinlerce insana ışık tutan küresel bir eğitim girişimcisi oldun.",
            survivalBoost: 40,
            futureRole: "Gelecek Kariyer & Beceri Dönüşüm Dekanı"
          },
          {
            id: "teach_30_b",
            choice: "Geleneksel okul sınırlarında kal.",
            consequence: "Devlet okullarındaki kadro kısıtlamalarından etkilendin.",
            survivalBoost: -10,
            futureRole: "Bölgesel Okul Eğitmeni"
          }
        ],
        keySkills: ["Yetişkin Eğitimi", "Mikro-Yetkinlik Tasarımı", "Öğrenmeyi Öğretme"],
        actionHint: "Diploma değil, uygulanabilir yetkinlik inşa edenlere talep patlayacak."
      },
      2035: {
        yearTitle: "Zihin-Makine Arayüzü & Sezgisel Bilgi Aktarımı",
        riskScore: 68,
        marketValueMultiplier: "3.5x",
        automationLevel: 75,
        humanValueLevel: 25,
        situation: "Temel bilgiler doğrudan nöro-aralıklarla aktarılıyor; felsefe, sanat ve irade eğitimi insana kaldı.",
        decisions: [
          {
            id: "teach_35_a",
            choice: "İnsan bilincinin ve felsefi iradenin baş düşünürü olarak yeni nesilleri yetiştir.",
            consequence: "Geleceğin düşünürlerini ve insan liderlerini eğiten en saygın konuma ulaştın.",
            survivalBoost: 50,
            futureRole: "Felsefi İrade & İnsan Bilinci Rehberi"
          },
          {
            id: "teach_35_b",
            choice: "Teknolojik değişime kayıtsız kal.",
            consequence: "Eğitim sistemindeki rolün tamamen simülasyonlara devredildi.",
            survivalBoost: -30,
            futureRole: "Arşiv Görevlisi"
          }
        ],
        keySkills: ["Varoluşsal Felsefe", "Bilinç Rehberliği", "İnsan Odaklı Liderlik"],
        actionHint: "Makinelerin düşünemediği yerlerde derin insani anlam üretin."
      }
    }
  },
  {
    id: "technician",
    name: "Robotik & Saha Teknisyeni (Usta)",
    emoji: "🔧",
    baseRisk: 42,
    color: "#10b981",
    timeline: {
      2026: {
        yearTitle: "Sensörler & Dijital İkiz Arıza Tespiti",
        riskScore: 22,
        marketValueMultiplier: "1.6x",
        automationLevel: 25,
        humanValueLevel: 75,
        situation: "Akıllı cihazlar ve fabrikalar arıza kodlarını AR gözlüklere anlık fısıldıyor.",
        decisions: [
          {
            id: "tech_26_a",
            choice: "AR gözlük ve IoT analiz araçlarını benimse, tamir süreni yarıya indir.",
            consequence: "Bölgenin en hızlı ve yüksek puanlı arıza uzmanı oldun.",
            survivalBoost: 30,
            futureRole: "IoT & Akıllı Saha Teknisyeni"
          },
          {
            id: "tech_26_b",
            choice: "Geleneksel deneme-yanılma el aletlerinde kal.",
            consequence: "Yeni nesil dijital kontrollü cihazları tamir etmekte zorlandın.",
            survivalBoost: -10,
            futureRole: "Geleneksel Mekanik Tamircisi"
          }
        ],
        keySkills: ["AR Destekli Tamir", "Elektronik & Sensör Teşhis", "Hızlı Problem Çözme"],
        actionHint: "Fiziksel dünya ile dijital beynin birleştiği sahada ustanın eli vazgeçilmezdir."
      },
      2028: {
        yearTitle: "İnsansı Servis Robotları & Saha Kurulumları",
        riskScore: 38,
        marketValueMultiplier: "2.3x",
        automationLevel: 42,
        humanValueLevel: 58,
        situation: "Evlere ve fabrikalara insansı yardımcı robotlar girmeye başladı; donanım arızaları sahada çözülmeli.",
        decisions: [
          {
            id: "tech_28_a",
            choice: "Robotik aktüatör, batarya ve lidar donanım servis sertifikalarını al.",
            consequence: "Bölgenin aranan 'Robot Doktoru' ve resmi saha teknik servisi haline geldin.",
            survivalBoost: 40,
            futureRole: "Sertifikalı İnsansı Robotik Sistemler Şefi"
          },
          {
            id: "tech_28_b",
            choice: "Robotları geçici bir heves sayarak eski cihazlarla sınırlı kal.",
            consequence: "Eski cihaz pazarı daraldıkça gelirlerin geriledi.",
            survivalBoost: -20,
            futureRole: "Eski Nesil Cihaz Tamircisi"
          }
        ],
        keySkills: ["Robotik Donanım Bakımı", "Lidar & Görsel Sensör Kalibrasyonu", "Gelişmiş Batarya Güvenliği"],
        actionHint: "Yazılımı AI yapabilir ama somunu sıkan ve motoru değiştiren sizsiniz."
      },
      2030: {
        yearTitle: "Otonom Fabrikalar & Kritik Saha Güvenliği",
        riskScore: 50,
        marketValueMultiplier: "3.0x",
        automationLevel: 60,
        humanValueLevel: 40,
        situation: "Karanlık fabrikalar (insansız üretim) fiziksel arızalarda acil müdahale ustalarına yüksek prim ödüyor.",
        decisions: [
          {
            id: "tech_30_a",
            choice: "Kritik endüstriyel altyapı ve otonom hat acil müdahale lideri ol.",
            consequence: "Saatlik ücreti binlerce dolar olan kilit müdahale uzmanı haline geldin.",
            survivalBoost: 45,
            futureRole: "Otonom Hat & Saha Süpervizörü"
          },
          {
            id: "tech_30_b",
            choice: "Basit ev aletleri tamiratında kal.",
            consequence: "Modüler tak-çıkar parçalar nedeniyle basit tamirler tüketici tarafından yapılır oldu.",
            survivalBoost: -20,
            futureRole: "Lokal Tamirci"
          }
        ],
        keySkills: ["Kritik Hat İyileştirme", "Hidrolik & Manyetik Sistemler", "Endüstriyel Güvenlik"],
        actionHint: "Durması milyonlarca dolar kaybettiren sistemlerin güvencesi olun."
      },
      2035: {
        yearTitle: "Biyo-Mekanik Hibrit Bakım & Kuantum Şebekeler",
        riskScore: 60,
        marketValueMultiplier: "3.8x",
        automationLevel: 70,
        humanValueLevel: 30,
        situation: "Kritik enerji şebekeleri ve biyo-teknolojik laboratuvar donanımları insan hassasiyetinde saha denetçilerine emanet.",
        decisions: [
          {
            id: "tech_35_a",
            choice: "Temiz enerji (füzyon/solar) ve biyomekanik arayüz saha uzmanlığına evril.",
            consequence: "Geleceğin enerji ve fiziksel dünyasının en stratejik operatörü oldun.",
            survivalBoost: 50,
            futureRole: "Biyomekanik & Temiz Enerji Saha Başmühendisi"
          },
          {
            id: "tech_35_b",
            choice: "Geleneksel elektrik tesisatıyla devam et.",
            consequence: "Kendi kendini onaran akıllı materyaller pazarını daralttı.",
            survivalBoost: -25,
            futureRole: "Eski Tesisatçı"
          }
        ],
        keySkills: ["Füzyon/Güneş Saha Teknolojileri", "Akıllı Materyal Entegrasyonu", "Usta Sezgisi"],
        actionHint: "En gelişmiş teknoloji bile physical dokunuş ve usta sezgisi olmadan çalışamaz."
      }
    }
  },
  {
    id: "logistics",
    name: "Lojistik, Kurye & Filo Operatörü",
    emoji: "🚚",
    baseRisk: 72,
    color: "#3b82f6",
    timeline: {
      2026: {
        yearTitle: "AI Rota Optimizasyonu & Hibrit Teslimat",
        riskScore: 35,
        marketValueMultiplier: "1.3x",
        automationLevel: 40,
        humanValueLevel: 60,
        situation: "Kargo rotaları ve paket dizilimleri yapay zeka tarafından saniyelik optimize ediliyor.",
        decisions: [
          {
            id: "log_26_a",
            choice: "AI filo yönetim yazılımlarını öğren, bölge filo koordinatörlüğüne yüksel.",
            consequence: "Tekil dağıtıcıdan 50 araçlık bölgeyi yöneten operasyon liderine dönüştün.",
            survivalBoost: 25,
            futureRole: "Akıllı Bölge Lojistik Koordinatörü"
          },
          {
            id: "log_26_b",
            choice: "Sadece verilen paketi taşımaya devam et, teknolojiyi takip etme.",
            consequence: "Dron ve otonom kaldırım robotları basit paket teslimatlarını almaya başladı.",
            survivalBoost: -15,
            futureRole: "Geleneksel Kurye"
          }
        ],
        keySkills: ["Rota Analitiği", "Filo Yönetim Panelleri", "Müşteri İletişim Güveni"],
        actionHint: "Sadece tekerlek çevirmeyin, tüm akışı yöneten orkestra şefi olun."
      },
      2028: {
        yearTitle: "Otonom Tırlar & Dron Koridorları",
        riskScore: 58,
        marketValueMultiplier: "2.0x",
        automationLevel: 62,
        humanValueLevel: 38,
        situation: "Ana otoyollarda otonom tırlar ve şehir içi dron teslimat koridorları yaygınlaştı.",
        decisions: [
          {
            id: "log_28_a",
            choice: "Otonom araç uzaktan kumanda (Tele-operation) ve hava sahası dron pilotluğu sertifikası al.",
            consequence: "Klimalı kontrol merkezinden 10 otonom tırı aynı anda denetleyen pilot operatör oldun.",
            survivalBoost: 35,
            futureRole: "Otonom Filo & Dron Filo Süpervizörü"
          },
          {
            id: "log_28_b",
            choice: "Şehirlerarası klasik şoförlükte diret.",
            consequence: "Otoyol taşımacılığında otonom filolar maliyet avantajıyla iş hacmini eritti.",
            survivalBoost: -25,
            futureRole: "Lokal Şoför"
          }
        ],
        keySkills: ["Tele-Operatörlük", "Hava/Kara Filo Entegrasyonu", "Kriz Yönetimi"],
        actionHint: "Kabinde saatlerce sürmek yerine, kontrol merkezinde tüm filoyu denetleyin."
      },
      2030: {
        yearTitle: "Karanlık Depolar & Son Kilometre Mikro-Hub'ları",
        riskScore: 70,
        marketValueMultiplier: "2.5x",
        automationLevel: 75,
        humanValueLevel: 25,
        situation: "Depolarda paketleme %90 robotlaştı; insan değeri yüksek hassasiyetli soğuk zincir ve değerli kargoda.",
        decisions: [
          {
            id: "log_30_a",
            choice: "Hassas medikal kargo, lüks tüketim ve biyolojik soğuk zincir güvenliği uzmanı ol.",
            consequence: "Kayıp ve hasarın kabul edilmediği kritik ürün taşımacılığının vazgeçilmezi oldun.",
            survivalBoost: 40,
            futureRole: "Stratejik & Biyolojik Tedarik Zinciri Güvenlik Direktörü"
          },
          {
            id: "log_30_b",
            choice: "Standart e-ticaret kutusu taşımaya devam et.",
            consequence: "Robotik teslimat dolapları ve otonom araçlar pazarı tamamen ele geçirdi.",
            survivalBoost: -30,
            futureRole: "Yedek Kurye"
          }
        ],
        keySkills: ["Soğuk Zincir Yönetimi", "Blokzincir Kargo Doğrulama", "Kritik Malzeme Protokolleri"],
        actionHint: "Herkesin taşıyabildiği değil, sadece en güvenilirlerin taşıyabildiği kargolara odaklanın."
      },
      2035: {
        yearTitle: "Kıtalararası Otonom Ağlar & Gezegensel Lojistik",
        riskScore: 82,
        marketValueMultiplier: "3.2x",
        automationLevel: 85,
        humanValueLevel: 15,
        situation: "Kargo akışı yapay zeka tarafından küresel ölçekte otomatik dengeleniyor.",
        decisions: [
          {
            id: "log_35_a",
            choice: "Küresel tedarik kriz tahmincisi ve jeopolitik rota mimarı ol.",
            consequence: "Dünya devlerinin tedarik krizlerini önceden çözen kilit stratejisti oldun.",
            survivalBoost: 45,
            futureRole: "Jeopolitik Tedarik & Rezilyans Stratejisti"
          },
          {
            id: "log_35_b",
            choice: "Eski operasyonel rollerde ısrar et.",
            consequence: "Klasik lojistik pozisyonları tamamen otonomlaştı.",
            survivalBoost: -35,
            futureRole: "Arşiv Lojistik Personeli"
          }
        ],
        keySkills: ["Jeopolitik Risk Analizi", "Gezegensel Tedarik Simülasyonları", "Kriz Stratejisi"],
        actionHint: "Fiziksel kargoyu taşımayın; dünyanın tedarik damarlarını yönetin."
      }
    }
  },
  {
    id: "jobseeker",
    name: "İş Arayan & Yeni Kariyer Yolcusu",
    emoji: "🧭",
    baseRisk: 40,
    color: "#a855f7",
    timeline: {
      2026: {
        yearTitle: "Sıfırdan Dijital Yetkinlik & Hızlı Giriş",
        riskScore: 25,
        marketValueMultiplier: "1.8x",
        automationLevel: 30,
        humanValueLevel: 70,
        situation: "Yapay zeka araçları (ChatGPT, Claude, Canva AI, No-Code) sıfır tecrübeli insanlara 1 ayda gelir imkanı sağlıyor.",
        decisions: [
          {
            id: "job_26_a",
            choice: "No-Code ve AI asistan araçlarını 30 günde öğren, şirketlere dijital operasyon desteği sun.",
            consequence: "İlk 60 günde serbest çalışan olarak düzenli döviz ve gelir elde etmeye başladın.",
            survivalBoost: 35,
            futureRole: "Yapay Zeka Destekli Operasyon Uzmanı"
          },
          {
            id: "job_26_b",
            choice: "Klasik ilan sitelerinde tecrübesiz olarak yüzlerce CV gönderip bekle.",
            consequence: "Geleneksel iş ilanları elendi, motivasyonun düştü.",
            survivalBoost: -15,
            futureRole: "Geleneksel İş Arayan"
          }
        ],
        keySkills: ["Yapay Zeka Komut Tasarımı", "No-Code İş Akışları (n8n/Make)", "Dijital Portföy"],
        actionHint: "İş beklemeyin; yapay zekanın sağladığı araçlarla bugün hemen değer üretmeye başlayın."
      },
      2028: {
        yearTitle: "Multi-Agent Orkestrasyonu ile Mikro-Şirket",
        riskScore: 40,
        marketValueMultiplier: "2.6x",
        automationLevel: 45,
        humanValueLevel: 55,
        situation: "Artık 1 kişi, 10 yapay zeka ajanını yöneterek eski bir ajansın yaptığı tüm işi tek başına yapıyor.",
        decisions: [
          {
            id: "job_28_a",
            choice: "Kendi 1 kişilik otonom hizmet atölyeni kur; e-ticaret, içerik veya veri hizmetleri ver.",
            consequence: "Maaşlı bir iş ararken kendi karlı mikro-şirketinin sahibi oldun.",
            survivalBoost: 45,
            futureRole: "Solo Mikro-Girişimci & Ajan Operatörü"
          },
          {
            id: "job_28_b",
            choice: "Rutin veri girişi veya çağrı merkezi gibi işlere girmeye çalış.",
            consequence: "Bu pozisyonlar hızla otomasyona devredildiği için istihdam güvencesi kalmadı.",
            survivalBoost: -25,
            futureRole: "Risk Altında Çalışan"
          }
        ],
        keySkills: ["Ajan Yönetimi", "Mikro-Girişimcilik", "Problem Çözme Sanatı"],
        actionHint: "Özgeçmiş satmayın; çözdüğünüz problemi ve kurduğunuz sistemi satın."
      },
      2030: {
        yearTitle: "Yeni Çağın Hibrit Meslekleri & Yüksek Gelir",
        riskScore: 50,
        marketValueMultiplier: "3.4x",
        automationLevel: 60,
        humanValueLevel: 40,
        situation: "Eski unvanlar silindi; en çok kazananlar insan-makine uyumunu sağlayan köprü kişiler oldu.",
        decisions: [
          {
            id: "job_30_a",
            choice: "Yerel işletmelere yapay zeka dönüşüm danışmanlığı ver, sistemlerini kur.",
            consequence: "Bölgenin en çok talep gören bağımsız iş mimarı ve dönüşüm rehberi oldun.",
            survivalBoost: 50,
            futureRole: "KOBİ Yapay Zeka Dönüşüm Mimarı"
          },
          {
            id: "job_30_b",
            choice: "Eski eğitim sisteminin diplomalarına güven.",
            consequence: "Diplomanın geçerliliği kalmadı, reel tecrübe arayan piyasada geride kaldın.",
            survivalBoost: -20,
            futureRole: "Kariyer Arayıcısı"
          }
        ],
        keySkills: ["Sistemik Danışmanlık", "KOBİ Dönüşüm Stratejisi", "İletişim & Güven"],
        actionHint: "Değişimi bekleyen değil, değişimi yerel topluluğa öğreten öncü olun."
      },
      2035: {
        yearTitle: "Kendi Geleceğini Tasarlayan Özgür Birey",
        riskScore: 58,
        marketValueMultiplier: "4.2x",
        automationLevel: 70,
        humanValueLevel: 30,
        situation: "Çalışma saatleri azaldı, yaratıcı ve toplumsal projeler küresel fonlarla destekleniyor.",
        decisions: [
          {
            id: "job_35_a",
            choice: "Gezegen dostu, sosyal veya kültürel otonom projelere liderlik et.",
            consequence: "Finansal özgürlüğe kavuşmuş, toplumda saygı gören bir vizyoner oldun.",
            survivalBoost: 55,
            futureRole: "Toplumsal Dönüşüm & Etik İnovasyon Lideri"
          },
          {
            id: "job_35_b",
            choice: "Pasif kalarak eski ekonomik düzeni bekle.",
            consequence: "Gelişmelerin dışında kaldın.",
            survivalBoost: -30,
            futureRole: "Pasif Tüketici"
          }
        ],
        keySkills: ["Kreatif İnovasyon", "Topluluk Liderliği", "Özerk Yaşam Yönetimi"],
        actionHint: "Gelecek size verilen değil, sizin inşa ettiğiniz bir alandır."
      }
    }
  }
];

export const EMPLOYMENT_STATUSES = [
  {
    id: "employed",
    icon: "💼",
    titleTr: "Mevcut Bir İşim Var",
    titleEn: "Currently Employed",
    descTr: "Mevcut mesleğimin geleceğini, otomasyon riskini ve 10x büyüme fırsatlarını öğrenmek istiyorum.",
    descEn: "Analyze the automation risk and 10x growth pathways of my current role."
  },
  {
    id: "unemployed",
    icon: "🔍",
    titleTr: "Şu An İşim Yok / İş Arıyorum",
    titleEn: "Job Seeker / Unemployed",
    descTr: "İşsizim veya iş arıyorum; 2026-2040 arasında en hızlı işe ve gelire dönüşecek alanları öğrenmek istiyorum.",
    descEn: "Seeking employment; discover high-demand emerging roles with fastest time to income."
  },
  {
    id: "student",
    icon: "🎓",
    titleTr: "Öğrenciyim / Yeni Mezunum",
    titleEn: "Student / Recent Graduate",
    descTr: "Eğitim sürecindeyim; gelecekte yok olmayacak, yüksek gelir getirecek doğru uzmanlıkları seçmek istiyorum.",
    descEn: "Currently studying; discover future-proof careers and degrees that will not be automated."
  },
  {
    id: "switcher",
    icon: "🔄",
    titleTr: "Kariyer Değiştirmek İstiyorum",
    titleEn: "Career Switcher",
    descTr: "Mevcut işim risk altında veya memnun değilim; farklı ve geleceği parlak bir sektöre sıfırdan geçmek istiyorum.",
    descEn: "Transitioning to a new resilient field from scratch."
  },
  {
    id: "artisan",
    icon: "🛠️",
    titleTr: "Esnaf / Zanaatkar / Usta / Serbest",
    titleEn: "Artisan / Blue-Collar / Freelancer",
    descTr: "Kendi dükkanım, atölyem, saha işim veya serbest mesleğim var; zanaatımı yapay zekayla nasıl büyüteceğimi görmek istiyorum.",
    descEn: "Craftsman, technician or freelancer seeking leverage."
  },
  {
    id: "home_retired",
    icon: "🏠",
    titleTr: "Ev Hanımı / Emekli / Ek Gelir Arayan",
    titleEn: "Homemaker / Retired / Side Income",
    descTr: "Aktif iş hayatı dışındayım; uzaktan, evden veya yapay zeka araçlarıyla ek gelir modellerini öğrenmek istiyorum.",
    descEn: "Remote, flexible and side-income pathways powered by AI."
  }
];

export const SENIORITY_LEVELS = [
  "🌱 Sıfır Deneyim / Hiç Çalışmadım (Yeni Başlayacak)",
  "🔍 İş Arayan / Deneyimsiz (İlk İş Fırsatını Arıyor)",
  "💼 0 - 1 Yıl (Stajyer / Giriş Seviyesi)",
  "💼 1 - 3 Yıl (Junior / Yeni Başlayan)",
  "⭐ 3 - 5 Yıl (Mid-Level / Uzman)",
  "🚀 6 - 10 Yıl (Senior / Kıdemli)",
  "👑 10 - 20 Yıl (Yönetici / Ekip Lideri / Direktör)",
  "🏆 20+ Yıl (Usta / Duayen / Emekli / Kıdemli Danışman)",
  "🔄 Kariyer Değiştiren (Mevcut alanda tecrübeli, yeni hedefte 0 yıl)",
  "🎓 Öğrenci (Lise / Üniversite / Lisansüstü)",
  "🏠 Aktif İşgücü Dışı / Dönüş Hazırlığında (Ev Hanımı / Ara Veren)"
];

export const INDUSTRY_SECTORS = [
  "🔍 Henüz Sektörüm Yok / Sektör Belirlemek İstiyorum (Öneri Bekliyorum)",
  "💻 Bilişim, Yazılım, Yapay Zeka & İnternet",
  "🩺 Sağlık, Tıp, Eczacılık & Hasta Bakımı",
  "📚 Eğitim, Öğretmenlik & Akademi",
  "🍽️ Hizmet, Yeme-İçme, Kafe, Restoran & Gastronomi",
  "🏨 Turizm, Otelcilik & Acentecilik",
  "🛍️ Perakende, Mağazacılık, Satış Pazarlama & E-Ticaret",
  "🏭 Üretim, Ağır Sanayi, Fabrika & İmalat",
  "🔧 Zanaat, Tamirat, İnşaat, Tesisat & Saha İşleri",
  "🚚 Lojistik, Kargo, Kurye, Şoförlük & Taşımacılık",
  "🌾 Tarım, Hayvancılık, Orman & Gıda Üretimi",
  "💰 Finans, Muhasebe, Bankacılık & Sigorta",
  "⚖️ Hukuk, Adalet, Denetim & Danışmanlık",
  "🎨 Medya, Basın, Tasarım, Sanat & Reklam",
  "🏛️ Kamu, Belediye, Askeri, Polis & Büro Memurluğu",
  "⚡ Enerji, Madencilik, Elektrik & Çevre",
  "🏪 Esnaf, Serbest Meslek & Küçük İşletme",
  "✍️ Diğer / Özel Sektör (Elle Belirtiniz)"
];

export const POPULAR_PROFESSIONS = [
  { name: "💻 Yazılımcı / Bilişim", val: "Yazılım Geliştirici & Bilişim Uzmanı" },
  { name: "🩺 Doktor / Hemşire / Sağlıkçı", val: "Doktor / Sağlık Personeli" },
  { name: "👨‍🏫 Öğretmen / Eğitmen", val: "Öğretmen / Eğitimci" },
  { name: "⚖️ Avukat / Hukukçu", val: "Avukat / Hukuk Danışmanı" },
  { name: "🎨 Tasarımcı / Kreatif", val: "Grafik & UI/UX Tasarımcı" },
  { name: "📈 Muhasebeci / Finansçı", val: "Muhasebeci / Mali Müşavir" },
  { name: "🔧 Teknisyen / Elektrikçi / Usta", val: "Teknisyen / Elektrik & Bakım Ustası" },
  { name: "🚚 Kurye / Şoför / Taşımacı", val: "Kurye / Şoför / Lojistik Elemanı" },
  { name: "🍳 Aşçı / Restoran & Kafe", val: "Aşçı / Mutfak Şefi / Gastronomi" },
  { name: "🛍️ Kasiyer / Satış Elemanı", val: "Mağaza Satış Temsilcisi / Kasiyer" },
  { name: "🌾 Çiftçi / Tarımcı", val: "Çiftçi / Ziraat & Hayvancılık" },
  { name: "🏛️ Memur / Büro Personeli", val: "Kamu Memuru / Büro Yönetimi" },
  { name: "👷 İnşaat / Tesisatçı / Mimar", val: "İnşaat / Tesisat Ustası / Mimar" },
];

export const UNEMPLOYED_SUGGESTIONS = [
  "🌟 2026-2040 En Çok Kazandıracak Geleceğin Meslekleri",
  "🤖 Kodsuz (No-Code) Yapay Zeka Ajan Operatörlüğü",
  "🩺 Sağlık, Hasta Bakımı & Yaşam Destek",
  "🌾 Akıllı Tarım, Gıda & Organik Üretim",
  "🚚 Lojistik, Otonom Depo & Hızlı Dağıtım",
  "🔧 Robotik Bakım & Teknik Saha Ustalığı",
  "🛍️ E-Ticaret, Dijital Pazarlama & İçerik Üretimi",
  "🔒 Siber Güvenlik & Veri Giriş Denetçiliği"
];

export const GOAL_SUGGESTIONS = [
  "🚀 Sıfırdan yapay zeka destekli yüksek gelirli bir mesleğe adım atmak",
  "🛡️ Mevcut işimi ve gelirimi otomasyona karşı %100 güvenceye almak",
  "💡 1 kişilik otonom mikro-şirket kurup kendi işimin patronu olmak",
  "🌐 Küresel uzaktan (remote) döviz kazandıran işlere geçiş yapmak",
  "🔄 Geleceği parlak ve aranılan yeni bir sektöre sıfırdan geçmek"
];

const TIMELINE_YEARS = [2026, 2028, 2030, 2035];

interface JobRiskAnalyzerViewProps {
  scenarioMode?: "base" | "optimistic" | "dystopian";
  onDeductCredits?: (amount: number, featureKey?: string) => boolean;
  onOpenCreditStore?: () => void;
  currentUser?: UserProfile | null;
  onOpenAuthModal?: () => void;
  onNavigateToView?: (view: ViewMode, targetYear?: number) => void;
  activeMilestone?: Milestone;
  onOpenDetailModal?: (milestone: Milestone, tab?: "overview" | "personal_impact") => void;
  liveSignals?: any[];
}

export const JobRiskAnalyzerView: React.FC<JobRiskAnalyzerViewProps> = ({
  scenarioMode = "base",
  onDeductCredits,
  onOpenCreditStore,
  currentUser: propCurrentUser,
  onOpenAuthModal: propOnOpenAuthModal,
  onNavigateToView,
  activeMilestone,
  onOpenDetailModal,
  liveSignals = [],
}) => {
  const { language } = useLanguage();
  const isTr = language === "tr";
  const auth = useAuth();
  const currentUser = propCurrentUser !== undefined ? propCurrentUser : auth.currentUser;
  const onOpenAuthModal = propOnOpenAuthModal || auth.openAuthModal;

  // Active Mode: "cockpit" (Game simulator) vs "custom_ai" (Kişisel Özel Analiz Formu)
  const [activeTab, setActiveTab] = useState<"cockpit" | "custom_ai">("custom_ai");

  // Ensure scroll is at top on mount
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "instant" });
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
  }, []);

  const handleSwitchTab = (tab: "cockpit" | "custom_ai") => {
    setActiveTab(tab);
    window.scrollTo({ top: 0, left: 0, behavior: "instant" });
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
  };

  // Cockpit States
  const [selectedProfId, setSelectedProfId] = useState<string>("software");
  const [selectedYear, setSelectedYear] = useState<number>(() => {
    if (activeMilestone?.year) {
      // Find closest supported year: 2026, 2028, 2030, 2035
      const available = [2026, 2028, 2030, 2035];
      const match = available.reduce((prev, curr) => 
        Math.abs(curr - activeMilestone.year) < Math.abs(prev - activeMilestone.year) ? curr : prev
      );
      return match;
    }
    return 2026;
  });

  useEffect(() => {
    if (activeMilestone?.year) {
      const available = [2026, 2028, 2030, 2035];
      const match = available.reduce((prev, curr) => 
        Math.abs(curr - activeMilestone.year) < Math.abs(prev - activeMilestone.year) ? curr : prev
      );
      setSelectedYear(match);
    }
  }, [activeMilestone]);
  const [selectedDecisions, setSelectedDecisions] = useState<Record<string, string>>({
    software: "sw_26_a",
    doctor: "doc_26_a",
    designer: "des_26_a",
    finance: "fin_26_a",
    teacher: "teach_26_a",
    technician: "tech_26_a",
    logistics: "log_26_a",
    jobseeker: "job_26_a"
  });
  const [copied, setCopied] = useState<boolean>(false);

  // Custom AI Personal Analysis Form States
  const [customGoal, setCustomGoal] = useState<string>("");
  const [employmentStatus, setEmploymentStatus] = useState<string>("employed");
  const [customProfession, setCustomProfession] = useState<string>("");
  const [customSeniority, setCustomSeniority] = useState<string>("⭐ Mid-Level / Uzman (3-5 Yıl)");
  const [customSector, setCustomSector] = useState<string>("💻 Bilişim, Yazılım, Yapay Zeka & İnternet");
  const [customSectorOther, setCustomSectorOther] = useState<string>("");
  
  const [customLoading, setCustomLoading] = useState<boolean>(false);
  const [customResult, setCustomResult] = useState<JobRiskAnalysisResult | null>(null);
  const [customCreditError, setCustomCreditError] = useState<string | null>(null);

  // Auto-scroll to customResult when generated so user doesn't miss it
  useEffect(() => {
    if (customResult) {
      setTimeout(() => {
        const el = document.getElementById("custom-ai-dossier-result");
        if (el) {
          el.scrollIntoView({ behavior: "smooth", block: "start" });
        }
      }, 100);
    }
  }, [customResult]);

  // Auto-populate form with user's registered profile attributes (profession, goal, seniority, sector, employment status)
  useEffect(() => {
    // 1. First check if a specific prediction was requested to be re-run from history
    const pending = getPendingRerunRecord();
    if (pending && pending.featureKey === "job_risk") {
      setActiveTab("custom_ai");
      if (pending.queryInput?.profession) {
        setCustomProfession(pending.queryInput.profession);
      } else if (pending.queryTitle && !pending.queryTitle.includes("Simülasyon")) {
        setCustomProfession(pending.queryTitle);
      }
      if (pending.targetYear) {
        setSelectedYear(pending.targetYear);
      }
      clearPendingRerunRecord();
      return;
    }

    if (currentUser) {
      const resolvedProf = currentUser.profession || currentUser.lifeRoleLabel || "";
      if (resolvedProf && !customProfession) {
        setCustomProfession(resolvedProf);
      }
      if (!customGoal) {
        if (currentUser.personalGoal) {
          setCustomGoal(currentUser.personalGoal);
        } else if (resolvedProf) {
          setCustomGoal(resolvedProf);
        }
      }
      if (currentUser.employmentStatus && employmentStatus === "employed") {
        setEmploymentStatus(currentUser.employmentStatus);
      }
      // Seniority normalization
      if (currentUser.seniority) {
        const sen = currentUser.seniority.toLowerCase();
        if (sen.includes("lead") || sen.includes("yönetici") || sen.includes("lider") || sen.includes("8+")) {
          setCustomSeniority("👑 Lead / Yönetici / Lider (8+ Yıl)");
        } else if (sen.includes("senior") || sen.includes("kıdemli") || sen.includes("5-8") || sen.includes("6+")) {
          setCustomSeniority("🏆 Senior / Kıdemli (5-8 Yıl)");
        } else if (sen.includes("mid") || sen.includes("uzman") || sen.includes("3-5")) {
          setCustomSeniority("⭐ Mid-Level / Uzman (3-5 Yıl)");
        } else if (sen.includes("junior") || sen.includes("başlangıç") || sen.includes("0-2")) {
          setCustomSeniority("🌱 Başlangıç / Junior (0-2 Yıl)");
        } else if (sen.includes("sıfır") || sen.includes("yeni") || sen.includes("student") || sen.includes("öğrenci") || sen.includes("retired") || sen.includes("emekli")) {
          setCustomSeniority("🌱 Sıfır Deneyim / Hiç Çalışmadım (Yeni Başlayacak)");
        }
      }
      // Industry Sector normalization
      if (currentUser.industrySector) {
        const sec = currentUser.industrySector.toLowerCase();
        if (sec.includes("sağlık") || sec.includes("tıp") || sec.includes("biyo") || sec.includes("ilaç")) {
          setCustomSector("🩺 Sağlık, Tıp, İlaç & Biyoteknoloji");
        } else if (sec.includes("finans") || sec.includes("banka") || sec.includes("kripto") || sec.includes("sigorta")) {
          setCustomSector("💰 Finans, Bankacılık, Sigorta & Kripto");
        } else if (sec.includes("hukuk") || sec.includes("danışmanlık") || sec.includes("mevzuat")) {
          setCustomSector("⚖️ Hukuk, Danışmanlık & Mevzuat");
        } else if (sec.includes("tasarım") || sec.includes("medya") || sec.includes("reklam") || sec.includes("sanat")) {
          setCustomSector("🎨 Tasarım, Medya, Reklam & Yaratıcı Sanatlar");
        } else if (sec.includes("eğitim") || sec.includes("akademi") || sec.includes("öğretmen") || sec.includes("araştırma")) {
          setCustomSector("🎓 Eğitim, Akademi, Öğretmenlik & Araştırma");
        } else if (sec.includes("zanaat") || sec.includes("inşaat") || sec.includes("tamirat") || sec.includes("tesisat") || sec.includes("saha")) {
          setCustomSector("🔧 Zanaat, Tamirat, İnşaat, Tesisat & Saha İşleri");
        } else if (sec.includes("ticaret") || sec.includes("lojistik") || sec.includes("tedarik") || sec.includes("e-ticaret")) {
          setCustomSector("🛍️ Ticaret, Lojistik, E-Ticaret & Tedarik");
        } else {
          setCustomSector("💻 Bilişim, Yazılım, Yapay Zeka & İnternet");
        }
      }
    }
  }, [currentUser]);

  const { increment: incrementDailyLimit, hasFreeQuota } = useDailyFeatureLimit("job_risk_analysis", auth.plan, currentUser?.email, auth.credits);

  const handleSelectEmploymentStatus = (statusId: string) => {
    setEmploymentStatus(statusId);
    setCustomCreditError(null);
    if (statusId === "unemployed") {
      setCustomProfession("");
      setCustomSeniority("🌱 Sıfır Deneyim / Hiç Çalışmadım (Yeni Başlayacak)");
      setCustomSector("🔍 Henüz Sektörüm Yok / Sektör Belirlemek İstiyorum (Öneri Bekliyorum)");
      setCustomGoal(isTr ? "2026-2040 arasında sıfırdan en hızlı iş bulabileceğim, yüksek gelirli ve otomasyona dayanıklı bir mesleğe adım atmak" : "Target the fastest-hiring high-income future career from scratch");
    } else if (statusId === "student") {
      setCustomProfession("");
      setCustomSeniority("🎓 Öğrenci (Lise / Üniversite / Lisansüstü)");
      setCustomSector("🔍 Henüz Sektörüm Yok / Sektör Belirlemek İstiyorum (Öneri Bekliyorum)");
      setCustomGoal(isTr ? "Geleceğin dünyasında aranılan, yüksek gelirli ve otomasyona dayanıklı bir kariyer inşa etmek" : "Build a future-proof, high-income career in an emerging discipline");
    } else if (statusId === "switcher") {
      setCustomSeniority("🔄 Kariyer Değiştiren (Mevcut alanda tecrübeli, yeni hedefte 0 yıl)");
      setCustomGoal(isTr ? "Mevcut sektörümden çıkıp geleceğin yükselen yapay zeka ve teknoloji sektörüne geçiş yapmak" : "Pivot from traditional role into resilient tech & AI domain");
    } else if (statusId === "artisan") {
      setCustomSeniority("⭐ 3 - 5 Yıl (Mid-Level / Uzman)");
      setCustomSector("🔧 Zanaat, Tamirat, İnşaat, Tesisat & Saha İşleri");
      setCustomGoal(isTr ? "Zanaatımı ve atölyemi modern araçlarla donatıp 10x daha karlı ve aranılan bir usta olmak" : "Modernize craft and business with AI tools to achieve 10x revenue");
    } else if (statusId === "home_retired") {
      setCustomSeniority("🏠 Aktif İşgücü Dışı / Dönüş Hazırlığında (Ev Hanımı / Ara Veren)");
      setCustomSector("🔍 Henüz Sektörüm Yok / Sektör Belirlemek İstiyorum (Öneri Bekliyorum)");
      setCustomGoal(isTr ? "Evden veya uzaktan yapay zeka araçlarıyla esnek ve düzenli ek gelir elde etmek" : "Generate flexible remote income using modern AI tools");
    } else {
      setCustomSeniority("⭐ 3 - 5 Yıl (Mid-Level / Uzman)");
      setCustomSector("💻 Bilişim, Yazılım, Yapay Zeka & İnternet");
    }
  };

  const currentProf = useMemo(() => {
    return PROFESSIONS.find((p) => p.id === selectedProfId) || PROFESSIONS[0];
  }, [selectedProfId]);

  const currentYearData = useMemo(() => {
    return currentProf.timeline[selectedYear] || currentProf.timeline[2026];
  }, [currentProf, selectedYear]);

  const currentDecisionId = selectedDecisions[selectedProfId];
  const activeDecision = useMemo(() => {
    return currentYearData.decisions.find((d) => d.id === currentDecisionId) || currentYearData.decisions[0];
  }, [currentYearData, currentDecisionId]);

  const survivalScore = useMemo(() => {
    let base = 100 - currentYearData.riskScore;
    if (activeDecision) {
      base = Math.max(10, Math.min(99, base + activeDecision.survivalBoost));
    }
    return base;
  }, [currentYearData, activeDecision]);

  const handleSelectDecision = (decisionId: string) => {
    setSelectedDecisions((prev) => ({
      ...prev,
      [selectedProfId]: decisionId
    }));
  };

  // Run Custom AI Career & Risk Analysis
  const handleRunCustomAnalysis = async () => {
    if (!currentUser) {
      if (onOpenAuthModal) onOpenAuthModal();
      return;
    }

    const effectiveGoal = customGoal.trim();
    if (!effectiveGoal) {
      setCustomCreditError(
        isTr
          ? "Lütfen mesleğinizi, kariyer hedefinizi veya sorunuzu yukarıdaki arama kutusuna yazın."
          : "Please describe your profession, career goal, or question in the input box."
      );
      return;
    }

    const cost = getFeatureCreditCost("job_risk_analysis", auth.plan);

    if (hasFreeQuota) {
      incrementDailyLimit();
    } else {
      const ok = onDeductCredits ? onDeductCredits(cost, "job_risk_analysis") : auth.deductCredits(cost, "job_risk_analysis");
      if (!ok) {
        setCustomCreditError(
          isTr
            ? `Yetersiz Kredi! Özel analiz için ${cost} Kredi gereklidir.`
            : `Insufficient Credits! ${cost} Credits required.`
        );
        if (onOpenCreditStore) onOpenCreditStore();
        return;
      }
    }

    setCustomCreditError(null);
    setCustomLoading(true);

    try {
      const targetSector = customSectorOther ? `${customSector} - ${customSectorOther}` : customSector;
      const targetProfession = customProfession.trim() || effectiveGoal;

      const res = await aiService.analyzeJobRisk({
        profession: targetProfession,
        employmentStatus: employmentStatus,
        seniorityLevel: customSeniority,
        industrySector: targetSector,
        personalGoal: effectiveGoal,
        userAge: currentUser?.age,
        language: isTr ? "tr" : "en",
        scenarioMode: scenarioMode || "base",
        activeMilestoneYear: activeMilestone?.year,
        activeMilestoneTitle: activeMilestone?.title,
        activeMilestoneCategory: activeMilestone?.category,
        activeMilestoneDescription: activeMilestone?.description,
      });

      if (res.success && res.data) {
        setCustomResult(res.data as JobRiskAnalysisResult);

        // Normalize risk level string
        const rawRisk = res.data.overallRiskLevel || "Yüksek";
        const normalizedRisk: "Düşük" | "Orta" | "Yüksek" | "Kritik" =
          rawRisk.includes("Düşük") || rawRisk.includes("Low")
            ? "Düşük"
            : rawRisk.includes("Orta") || rawRisk.includes("Medium")
            ? "Orta"
            : rawRisk.includes("Kritik") || rawRisk.includes("Critical")
            ? "Kritik"
            : "Yüksek";

        // Record history
        recordPredictionHistoryEntry({
          userEmail: currentUser.email,
          featureKey: "job_risk",
          featureName: "Kişisel Meslek Risk Analizi",
          queryTitle: `${targetProfession.slice(0, 45)}... Risk & Gelecek Raporu`,
          queryInput: {
            profession: targetProfession,
            scenarioMode: scenarioMode === "optimistic" ? "optimistic" : scenarioMode === "dystopian" ? "dystopian" : "baseline",
            category: "Kariyer & Hedef Arama",
            prompt: effectiveGoal,
            customParams: {
              employmentStatus,
              seniorityLevel: customSeniority,
              industrySector: targetSector,
              activeMilestone: activeMilestone ? `${activeMilestone.year}: ${activeMilestone.title}` : undefined,
            },
          },
          generatedOutcome: res.data.personalizedVerdict || res.data.summary,
          category: "Kariyer & İktisat",
          targetYear: res.data.peakRiskYear || 2030,
          scenarioMode: scenarioMode === "optimistic" ? "optimistic" : scenarioMode === "dystopian" ? "dystopian" : "baseline",
          creditsSpent: cost,
          metrics: {
            feasibilityScore: res.data.humanAugmentationPercentage || 60,
            impactLevel: res.data.automationPercentage || 75,
            riskLevel: normalizedRisk,
            sentiment: res.data.automationPercentage > 60 ? "dystopian" : "optimistic",
          },
          tags: ["Kariyer", "Otomasyon", "Yol Haritası"],
        });
      } else {
        setCustomCreditError(res.error || (isTr ? "Analiz sırasında bir hata oluştu." : "Error during analysis."));
        handleAutoRefundAndLog({
          userEmail: currentUser.email,
          featureKey: "job_risk_analysis",
          featureName: "Kişisel Meslek Risk Analizi",
          deductedCredits: cost,
          errorMessage: res.error || "Bilinmeyen hata",
        });
      }
    } catch (err: any) {
      setCustomCreditError(err?.message || (isTr ? "Sunucu bağlantı hatası." : "Server error."));
    } finally {
      setCustomLoading(false);
    }
  };

  const handleCopyCockpitDossier = () => {
    const text = `=== 🚀 2026-2060 KARİYER RAPORU ===
Meslek: ${activeTab === "cockpit" ? currentProf.name : customProfession}
Tarih: ${new Date().toLocaleDateString()}
Hedef: ${customGoal}

${
  customResult
    ? `🎯 KİŞİSEL ANALİZ SONUCU:
Otomasyon Riski: %${customResult.automationPercentage}
İnsan Katma Değeri: %${customResult.humanAugmentationPercentage}
Kritik Kırılma Yılı: ${customResult.peakRiskYear}

💡 BAŞ DANIŞMAN RAPORU:
${customResult.personalizedVerdict || customResult.summary}

❌ YOK OLACAK GÖREVLER:
${(customResult.obsoleteTasks || []).map((t) => `- ${t}`).join("\n")}

🌟 10X DEĞER KAZANACAK İNSANİ GÜÇLER:
${(customResult.highValueHumanTasks || []).map((t) => `- ${t}`).join("\n")}
`
    : `🎯 SİMÜLASYON RAPORU (${selectedYear}):
Rol: ${activeDecision?.futureRole}
Hayatta Kalma Güvencesi: %${survivalScore}
Piyasa Değer Çarpanı: ${currentYearData.marketValueMultiplier}
Tavsiye: ${currentYearData.actionHint}
`
}`;

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="space-y-6 pb-12 animate-fadeIn max-w-7xl mx-auto font-sans">
      {/* TOP HEADER & MODE SWITCHER */}
      <div id="nav-career-tools" className="p-6 sm:p-7 rounded-3xl bg-slate-900/90 border border-white/10 shadow-2xl relative overflow-hidden space-y-4">
        <div className="absolute top-0 right-0 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative z-10">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-purple-400 animate-pulse" />
              <span className="text-xs font-bold text-purple-400 uppercase tracking-widest font-mono">
                {isTr ? "2026–2060 Kişisel Kariyer & Otomasyon Merkezi" : "2026–2060 Career & Automation Center"}
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
              {isTr ? "Kişisel Meslek Analiziniz ve Gelecek Stratejiniz" : "Personal Job Risk Analysis & Career Strategy"}
            </h1>
          </div>

          <div className="flex items-center gap-2.5">
            {/* Mode Switcher Tabs */}
            <div className="flex p-1 rounded-2xl bg-slate-950/80 border border-white/10">
              <button
                onClick={() => handleSwitchTab("custom_ai")}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
                  activeTab === "custom_ai"
                    ? "bg-purple-600 text-white shadow-lg shadow-purple-600/30"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                <Search className="w-3.5 h-3.5 text-purple-300" />
                <span>{isTr ? "🔍 Kendi Mesleğimi Analiz Et (Önerilen)" : "🔍 Analyze My Profession (Recommended)"}</span>
              </button>

              <button
                onClick={() => handleSwitchTab("cockpit")}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
                  activeTab === "cockpit"
                    ? "bg-purple-600 text-white shadow-lg shadow-purple-600/30"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                <Sliders className="w-3.5 h-3.5 text-cyan-300" />
                <span>{isTr ? "🕹️ Örnek Meslek Kokpiti (Referans)" : "🕹️ Sample Role Cockpit (Reference)"}</span>
              </button>
            </div>

            <button
              onClick={handleCopyCockpitDossier}
              className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-white/10 text-slate-200 text-xs font-bold flex items-center gap-2 transition cursor-pointer"
              title="Raporu Kopyala"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-emerald-400">{isTr ? "Kopyalandı" : "Copied"}</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 text-slate-400" />
                  <span>{isTr ? "Kopyala" : "Copy"}</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Active Milestone Context Banner: Holistic Career Horizon with Anchor Year */}
        {activeMilestone && (
          <div className="pt-3 border-t border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2.5">
              <span className="px-2.5 py-1 rounded-lg bg-rose-500/20 text-rose-300 font-mono font-bold border border-rose-500/30 shrink-0">
                🎯 {activeMilestone.year} Eşik Yılı Odaklı
              </span>
              <span className="text-slate-300">
                <strong className="text-white">{activeMilestone.title}</strong> kırılması merkez alınarak, mesleğinizin <strong>2026–2035+ bütüncül kariyer dönüşüm yol haritası</strong> simüle edilmektedir.
              </span>
            </div>
            <div className="flex items-center gap-2">
              {onOpenDetailModal && activeMilestone ? (
                <button
                  type="button"
                  onClick={() => onOpenDetailModal(activeMilestone, "personal_impact")}
                  className="px-3 py-1.5 rounded-lg bg-rose-600/30 hover:bg-rose-600 text-rose-100 hover:text-white border border-rose-500/50 font-mono text-[11px] font-bold transition flex items-center gap-1.5 shrink-0 self-start sm:self-auto cursor-pointer"
                >
                  <span>🎯 {isTr ? "Dönüm Noktasına Geri Dön" : "Return to Milestone"}</span>
                </button>
              ) : onNavigateToView && (
                <button
                  type="button"
                  onClick={() => onNavigateToView("timeline", activeMilestone.year)}
                  className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-rose-300 hover:text-white border border-rose-500/30 font-mono text-[11px] font-bold transition flex items-center gap-1.5 shrink-0 self-start sm:self-auto cursor-pointer"
                >
                  <span>🕒 Takvime Dön ({activeMilestone.year})</span>
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* ========================================================================= */}
      {/* MODE 1: KİŞİSEL ÖZEL AI ANALİZ MOTORU (CUSTOM AI INPUT FORM & AI REPORT)  */}
      {/* ========================================================================= */}
      {activeTab === "custom_ai" && (
        <div className="space-y-6">
          {/* Analysis Form Card */}
          <div className="p-6 sm:p-7 rounded-3xl bg-slate-900/90 border border-white/10 shadow-xl space-y-6">
            <div className="flex items-center justify-between border-b border-white/5 pb-3">
              <div className="flex items-center gap-2">
                <Search className="w-4 h-4 text-purple-400" />
                <h3 className="text-sm font-bold text-white font-mono uppercase tracking-wider">
                  {isTr ? "Akıllı Meslek & Kariyer Hedefi Analizi" : "Smart Career & Goal Risk Analysis"}
                </h3>
              </div>
              <span className="text-xs font-mono text-purple-300 font-bold bg-purple-950/60 px-3 py-1 rounded-xl border border-purple-500/30">
                {hasFreeQuota ? (isTr ? "Bugün Ücretsiz Günlük Hak" : "Free Daily Pass") : `Maliyet: ${getFeatureCreditCost("job_risk_analysis", auth.plan)} Kredi`}
              </span>
            </div>

            {/* Akıllı Arama & Hedef Girişi */}
            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-200 font-mono flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <Search className="w-4 h-4 text-purple-400" />
                    <span>{isTr ? "Mesleğiniz, Kariyeriniz veya Hedefiniz:" : "Your Profession, Career or Future Goal:"}</span>
                  </span>
                  <span className="text-[11px] text-purple-300/80 font-normal hidden sm:inline">
                    {isTr ? "Serbestçe yazın, yapay zeka risk & fırsatları analiz etsin" : "Type freely, AI calculates risks & roadmaps"}
                  </span>
                </label>

                {(currentUser?.profession || currentUser?.lifeRoleLabel) && (
                  <div className="flex items-center justify-between gap-2 p-2.5 rounded-xl bg-purple-950/40 border border-purple-500/30 text-xs">
                    <div className="flex items-center gap-2">
                      <User className="w-3.5 h-3.5 text-purple-400 shrink-0" />
                      <span className="text-slate-300">
                        {isTr ? "Kayıtlı Profil Mesleğiniz:" : "Profile Profession:"}{" "}
                        <strong className="text-white">{currentUser?.profession || currentUser?.lifeRoleLabel}</strong>
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        const prof = currentUser?.profession || currentUser?.lifeRoleLabel || "";
                        setCustomGoal(prof);
                        setCustomProfession(prof);
                      }}
                      className="px-2.5 py-1 rounded-lg bg-purple-600/70 hover:bg-purple-600 text-white font-mono text-[11px] font-bold transition cursor-pointer shrink-0"
                    >
                      {isTr ? "Bu Mesleği Seç" : "Use This Role"}
                    </button>
                  </div>
                )}

                <div className="relative">
                  <input
                    type="text"
                    value={customGoal}
                    onChange={(e) => setCustomGoal(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !customLoading) {
                        handleRunCustomAnalysis();
                      }
                    }}
                    placeholder={
                      isTr
                        ? "Örn: Kıdemli Yazılım Geliştiriciyim, yapay zeka sonrası şirket kurmak istiyorum..."
                        : "E.g.: Senior Software Engineer, want to launch an AI SaaS..."
                    }
                    className="w-full pl-11 pr-28 py-3.5 rounded-2xl bg-slate-950/90 border border-purple-500/30 text-white text-sm placeholder:text-slate-500 focus:outline-none focus:border-purple-400 focus:ring-1 focus:ring-purple-400/50 transition shadow-inner"
                  />
                  <Search className="w-5 h-5 text-purple-400/60 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  
                  {customGoal && (
                    <button
                      type="button"
                      onClick={() => setCustomGoal("")}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-white px-2 py-1 rounded-lg bg-slate-800/60 hover:bg-slate-700 transition"
                    >
                      {isTr ? "Temizle" : "Clear"}
                    </button>
                  )}
                </div>
              </div>

              {/* Hızlı Örnek Arama & Hedef Önerileri */}
              <div className="space-y-2 pt-1">
                <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
                  <Lightbulb className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                  <span>{isTr ? "Hızlı Örnek Aramalar & Popüler Hedefler:" : "Quick Ideas & Popular Queries:"}</span>
                </div>

                <div className="flex flex-wrap gap-2">
                  {[
                    isTr ? "Yazılım Geliştirici & Kendi AI Girişimini Kurmak" : "Software Engineer & Launching AI Startup",
                    isTr ? "Grafik Tasarımcı & Otomasyona Karşı Korunma" : "Graphic Designer & AI Resilience",
                    isTr ? "Doktor / Sağlık Çalışanı & Yapay Zeka Teşhis Sistemleri" : "Physician & AI Diagnostic Integration",
                    isTr ? "Üniversite Öğrencisi / Sıfırdan Yüksek Gelirli Alan" : "College Student / High-Growth Career",
                    isTr ? "Mali Müşavir / Muhasebeci & Dijital Dönüşüm" : "Accountant & Automated Finance",
                    isTr ? "Avukat / Hukukçu & Yapay Zeka Hukuku" : "Lawyer & AI Legal Tech",
                    isTr ? "E-Ticaret & Otonom Dijital Mağaza Kurucusu" : "E-commerce & Autonomous Store",
                    isTr ? "İş Arayan / 30 Günde Gelir Getirecek Beceriler" : "Job Seeker / 30-Day Monetizable Skills"
                  ].map((example, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setCustomGoal(example)}
                      className="px-3 py-1.5 rounded-xl bg-slate-950/70 hover:bg-purple-950/50 border border-white/10 hover:border-purple-500/40 text-slate-300 hover:text-white text-xs transition cursor-pointer"
                    >
                      {example}
                    </button>
                  ))}
                </div>
              </div>

              {/* Active Timeline Milestone Connection Banner */}
              {activeMilestone && (
                <div className="p-3.5 rounded-2xl bg-gradient-to-r from-indigo-950/60 to-purple-950/60 border border-indigo-500/40 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 shadow-inner">
                  <div className="flex items-center gap-2.5">
                    <span className="px-2.5 py-1 rounded-xl bg-indigo-500/30 border border-indigo-400/40 text-indigo-200 font-mono font-bold text-xs">
                      {activeMilestone.year}
                    </span>
                    <div>
                      <p className="text-xs font-semibold text-white">{activeMilestone.title}</p>
                      <p className="text-[10px] text-indigo-300/80">{activeMilestone.category}</p>
                    </div>
                  </div>
                  <span className="self-start sm:self-center px-2 py-0.5 rounded-lg bg-indigo-900/50 text-[10px] font-medium text-indigo-300 shrink-0 border border-indigo-500/30">
                    {isTr ? "🔗 Zaman Çizelgesi Eşiği Bağlandı" : "🔗 Linked Timeline Milestone"}
                  </span>
                </div>
              )}

              {/* Profiling Filters: Employment Status, Seniority, Sector */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-2">
                {/* Employment Status */}
                <div className="space-y-1.5">
                  <label className="text-[11px] font-semibold text-slate-300 flex items-center gap-1.5">
                    <span>{isTr ? "💼 Durum / Pozisyon:" : "💼 Status / Position:"}</span>
                  </label>
                  <select
                    value={employmentStatus}
                    onChange={(e) => handleSelectEmploymentStatus(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950/80 border border-white/10 hover:border-white/20 focus:border-purple-500 text-xs text-white outline-none transition cursor-pointer"
                  >
                    <option value="employed">{isTr ? "💼 Aktif Çalışan / Profesyonel" : "💼 Employed / Professional"}</option>
                    <option value="student">{isTr ? "🎓 Öğrenci / Yeni Mezun" : "🎓 Student / Fresh Grad"}</option>
                    <option value="switcher">{isTr ? "🔄 Kariyer Değiştiren" : "🔄 Career Switcher"}</option>
                    <option value="artisan">{isTr ? "🔧 Zanaat / Saha / Usta" : "🔧 Trades / Field / Artisan"}</option>
                    <option value="unemployed">{isTr ? "🌱 İş Arayan / Serbest" : "🌱 Job Seeker / Freelance"}</option>
                    <option value="home_retired">{isTr ? "🏠 Ev / Ara Veren" : "🏠 Career Break"}</option>
                  </select>
                </div>

                {/* Seniority Level */}
                <div className="space-y-1.5">
                  <label className="text-[11px] font-semibold text-slate-300 flex items-center gap-1.5">
                    <span>{isTr ? "⭐ Kıdem / Deneyim:" : "⭐ Seniority / Experience:"}</span>
                  </label>
                  <select
                    value={customSeniority}
                    onChange={(e) => setCustomSeniority(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950/80 border border-white/10 hover:border-white/20 focus:border-purple-500 text-xs text-white outline-none transition cursor-pointer"
                  >
                    <option value="🌱 Başlangıç / Junior (0-2 Yıl)">{isTr ? "🌱 Başlangıç / Junior (0-2 Yıl)" : "🌱 Entry / Junior (0-2 Yrs)"}</option>
                    <option value="⭐ Mid-Level / Uzman (3-5 Yıl)">{isTr ? "⭐ Mid-Level / Uzman (3-5 Yıl)" : "⭐ Mid-Level / Specialist (3-5 Yrs)"}</option>
                    <option value="🏆 Senior / Kıdemli (5-8 Yıl)">{isTr ? "🏆 Senior / Kıdemli (5-8 Yıl)" : "🏆 Senior / Lead (5-8 Yrs)"}</option>
                    <option value="👑 Lead / Yönetici / Lider (8+ Yıl)">{isTr ? "👑 Lead / Yönetici / Lider (8+ Yıl)" : "👑 Director / Executive (8+ Yrs)"}</option>
                    <option value="🌱 Sıfır Deneyim / Hiç Çalışmadım (Yeni Başlayacak)">{isTr ? "🌱 Sıfır Deneyim (Yeni Başlayacak)" : "🌱 Zero Experience (Beginner)"}</option>
                  </select>
                </div>

                {/* Industry Sector */}
                <div className="space-y-1.5">
                  <label className="text-[11px] font-semibold text-slate-300 flex items-center gap-1.5">
                    <span>{isTr ? "🏢 Sektör:" : "🏢 Industry Sector:"}</span>
                  </label>
                  <select
                    value={customSector}
                    onChange={(e) => setCustomSector(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950/80 border border-white/10 hover:border-white/20 focus:border-purple-500 text-xs text-white outline-none transition cursor-pointer"
                  >
                    <option value="💻 Bilişim, Yazılım, Yapay Zeka & İnternet">{isTr ? "💻 Bilişim & Yazılım" : "💻 Tech & Software"}</option>
                    <option value="🩺 Sağlık, Tıp, İlaç & Biyoteknoloji">{isTr ? "🩺 Sağlık & Biyoteknoloji" : "🩺 Healthcare & Biotech"}</option>
                    <option value="💰 Finans, Bankacılık, Sigorta & Kripto">{isTr ? "💰 Finans & Bankacılık" : "💰 Finance & Banking"}</option>
                    <option value="⚖️ Hukuk, Danışmanlık & Mevzuat">{isTr ? "⚖️ Hukuk & Mevzuat" : "⚖️ Legal & Compliance"}</option>
                    <option value="🎨 Tasarım, Medya, Reklam & Yaratıcı Sanatlar">{isTr ? "🎨 Tasarım & Medya" : "🎨 Design & Media"}</option>
                    <option value="🎓 Eğitim, Akademi, Öğretmenlik & Araştırma">{isTr ? "🎓 Eğitim & Akademi" : "🎓 Education & Academia"}</option>
                    <option value="🔧 Zanaat, Tamirat, İnşaat, Tesisat & Saha İşleri">{isTr ? "🔧 Zanaat, Saha & İnşaat" : "🔧 Trades, Field & Craft"}</option>
                    <option value="🛍️ Ticaret, Lojistik, E-Ticaret & Tedarik">{isTr ? "🛍️ Ticaret & Lojistik" : "🛍️ Trade & Logistics"}</option>
                    <option value="🔍 Henüz Sektörüm Yok / Sektör Belirlemek İstiyorum">{isTr ? "🔍 Sektör Belirlemek İstiyorum" : "🔍 Seeking Direction"}</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Error Message */}
            {customCreditError && (
              <div className="p-3.5 rounded-2xl bg-rose-950/60 border border-rose-500/40 text-rose-300 text-xs flex items-center gap-2.5">
                <AlertTriangle className="w-4 h-4 shrink-0 text-rose-400" />
                <span>{customCreditError}</span>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
              <p className="text-[11px] text-slate-400 leading-relaxed">
                {isTr
                  ? "Gelişmiş nöral yapay zeka modelimiz mesleğinize ve hedefinize özel otomasyon riskini, 30 günde gelir getirecek becerileri ve 2040 yol haritasını hesaplar."
                  : "Our neural AI engine computes personalized automation risks, 30-day income skills, and a 2040 roadmap."}
              </p>

              <button
                onClick={handleRunCustomAnalysis}
                disabled={customLoading}
                className="px-6 py-3 rounded-2xl bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-purple-600/30 transition disabled:opacity-50 cursor-pointer shrink-0"
              >
                {customLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>{isTr ? "Kişisel Rapor Üretiliyor..." : "Generating Dossier..."}</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 text-purple-300" />
                    <span>{isTr ? "Akıllı Analiz Raporumu Oluştur" : "Generate Custom AI Dossier"}</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Generated Result Report */}
          {customResult && (
            <div id="custom-ai-dossier-result" className="space-y-6 animate-fadeIn">
              {/* TARGET OPPORTUNITIES CARD (FOR EVERY CITIZEN) */}
              {customResult.targetOpportunities && customResult.targetOpportunities.length > 0 && (
                <div className="p-6 sm:p-7 rounded-3xl bg-gradient-to-br from-indigo-950/60 via-slate-900 to-purple-950/60 border border-indigo-500/40 shadow-2xl space-y-4">
                  <div className="flex items-center gap-2 text-indigo-300 font-mono text-xs font-bold uppercase">
                    <Target className="w-4 h-4 text-indigo-400" />
                    <span>2026–2040 Yönelebileceğiniz Geleceğin Meslek Fırsatları</span>
                  </div>
                  <p className="text-xs text-slate-300">
                    Durumunuza ve profilinize göre otomasyon dalgasıyla birlikte en yüksek talep ve gelir yaratacak gelecek uzmanlıkları:
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {customResult.targetOpportunities.map((opp, idx) => (
                      <div
                        key={idx}
                        className="p-3.5 rounded-2xl bg-slate-950/70 border border-indigo-500/20 flex items-center gap-2.5 text-xs text-white"
                      >
                        <span className="p-1 rounded-lg bg-indigo-500/20 text-indigo-300 font-mono font-bold text-[11px]">
                          0{idx + 1}
                        </span>
                        <span className="font-semibold">{opp}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* QUICK WIN SKILLS CARD (FAST INCOME / 30-DAY BARRIER) */}
              {customResult.quickWinSkills && customResult.quickWinSkills.length > 0 && (
                <div className="p-6 sm:p-7 rounded-3xl bg-gradient-to-br from-amber-950/40 via-slate-900 to-emerald-950/40 border border-amber-500/30 shadow-2xl space-y-4">
                  <div className="flex items-center gap-2 text-amber-300 font-mono text-xs font-bold uppercase">
                    <Zap className="w-4 h-4 text-amber-400" />
                    <span>30 Günde Kazanabileceğiniz Hızlı Gelir Becerileri</span>
                  </div>
                  <p className="text-xs text-slate-300">
                    Sıfır veya düşük maliyetle, yapay zeka araçlarını kullanarak hemen öğrenip gelire dönüştürebileceğiniz hızlı kazanım yetkinlikleri:
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {customResult.quickWinSkills.map((skill, idx) => (
                      <div
                        key={idx}
                        className="p-3.5 rounded-2xl bg-slate-950/70 border border-emerald-500/20 flex items-center gap-2.5 text-xs text-slate-200"
                      >
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                        <span className="font-medium">{skill}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Key Metrics Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Metric 1 */}
                <div className="p-5 rounded-3xl bg-slate-900/90 border border-white/10 shadow-lg space-y-2">
                  <span className="text-[11px] font-mono uppercase text-slate-400 block font-semibold">
                    Genel Otomasyon Riski
                  </span>
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-mono font-extrabold text-rose-400">
                      %{customResult.automationPercentage}
                    </span>
                    <span className="text-xs text-slate-400">Rutin Görev Otomasyon Potansiyeli</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                    <div
                      style={{ width: `${customResult.automationPercentage}%` }}
                      className="h-full bg-rose-500"
                    />
                  </div>
                  <span className="text-[10px] text-slate-500 font-mono block leading-snug pt-1">
                    *Model Değerlendirmesi: Görevlerin yapay zeka otomasyon potansiyelidir; kişisel iş kaybı garantisi değildir.
                  </span>
                </div>

                {/* Metric 2 */}
                <div className="p-5 rounded-3xl bg-slate-900/90 border border-white/10 shadow-lg space-y-2">
                  <span className="text-[11px] font-mono uppercase text-slate-400 block font-semibold">
                    İnsan Kaldıracı & Katma Değer
                  </span>
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-mono font-extrabold text-emerald-400">
                      %{customResult.humanAugmentationPercentage}
                    </span>
                    <span className="text-xs text-slate-400">10x Artacak Güç</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                    <div
                      style={{ width: `${customResult.humanAugmentationPercentage}%` }}
                      className="h-full bg-emerald-400"
                    />
                  </div>
                </div>

                {/* Metric 3 */}
                <div className="p-5 rounded-3xl bg-slate-900/90 border border-white/10 shadow-lg space-y-2">
                  <span className="text-[11px] font-mono uppercase text-slate-400 block font-semibold">
                    Kritik Kırılma Yılı
                  </span>
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-mono font-extrabold text-amber-400">
                      {customResult.peakRiskYear}
                    </span>
                    <span className="text-xs text-slate-400">En Hızlı Dönüşüm</span>
                  </div>
                  <span className="text-[10px] text-slate-500 font-mono block">
                    Bu yıldan önce stratejik geçiş tamamlanmalıdır.
                  </span>
                </div>
              </div>

              {/* Personalized Verdict */}
              <div className="p-6 sm:p-7 rounded-3xl bg-gradient-to-br from-purple-950/50 via-slate-900 to-indigo-950/50 border border-purple-500/40 shadow-2xl space-y-3">
                <div className="flex items-center gap-2 text-xs font-mono font-bold text-purple-300 uppercase">
                  <Sparkles className="w-4 h-4 text-purple-400" />
                  <span>Kişisel Vizyon & Strateji Kararınız</span>
                </div>
                <p className="text-xs sm:text-sm text-slate-200 leading-relaxed">
                  {customResult.personalizedVerdict || customResult.summary}
                </p>
              </div>

              {/* Obsolete Tasks vs High Value Powers */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Obsolete Tasks */}
                <div className="p-5 rounded-3xl bg-slate-900/90 border border-rose-500/20 shadow-lg space-y-3">
                  <div className="flex items-center gap-2 text-rose-400 text-xs font-mono font-bold uppercase">
                    <AlertTriangle className="w-4 h-4" />
                    <span>Yapay Zekaya Devredilecek Rutin Görevler</span>
                  </div>
                  <ul className="space-y-2 text-xs text-slate-300">
                    {(customResult.obsoleteTasks || []).map((task, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <span className="text-rose-400 font-bold shrink-0">✕</span>
                        <span>{task}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* High Value Tasks */}
                <div className="p-5 rounded-3xl bg-slate-900/90 border border-emerald-500/20 shadow-lg space-y-3">
                  <div className="flex items-center gap-2 text-emerald-400 text-xs font-mono font-bold uppercase">
                    <ShieldCheck className="w-4 h-4" />
                    <span>10x Değer Kazanacak İnsani Süper Güçler</span>
                  </div>
                  <ul className="space-y-2 text-xs text-slate-300">
                    {(customResult.highValueHumanTasks || []).map((power, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <span className="text-emerald-400 font-bold shrink-0">✓</span>
                        <span>{power}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* 3-Step Strategic Phases */}
              {customResult.strategicPhases && customResult.strategicPhases.length > 0 && (
                <div className="p-6 sm:p-7 rounded-3xl bg-slate-900/90 border border-white/10 shadow-xl space-y-4">
                  <h3 className="text-sm font-bold text-white font-mono uppercase tracking-wider">
                    3 Aşamalı Büyüme ve Koruma Yol Haritası
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {customResult.strategicPhases.map((phase, idx) => (
                      <div
                        key={idx}
                        className="p-5 rounded-2xl bg-slate-950/70 border border-white/10 flex flex-col justify-between space-y-3"
                      >
                        <div className="space-y-2">
                          <span className="px-2.5 py-0.5 rounded-md bg-purple-500/20 text-purple-300 text-xs font-mono font-bold border border-purple-500/30">
                            {phase.years}
                          </span>
                          <h4 className="text-sm font-bold text-white leading-snug">
                            {phase.phaseName}
                          </h4>
                          <p className="text-xs text-slate-300 leading-relaxed">
                            <strong>Odak:</strong> {phase.focus}
                          </p>
                        </div>

                        <ul className="space-y-1.5 pt-2 border-t border-white/5 text-xs text-slate-400">
                          {phase.actions.map((act, aIdx) => (
                            <li key={aIdx} className="flex items-start gap-1.5">
                              <span className="text-purple-400 shrink-0">•</span>
                              <span>{act}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Recommended Tools & Frameworks */}
              {customResult.recommendedToolsAndFrameworks && customResult.recommendedToolsAndFrameworks.length > 0 && (
                <div className="p-6 rounded-3xl bg-slate-900/90 border border-white/10 shadow-xl space-y-3">
                  <div className="flex items-center gap-2 text-xs font-mono font-bold text-sky-400 uppercase">
                    <Wrench className="w-4 h-4" />
                    <span>Önerilen Yapay Zeka Araçları & Platformlar</span>
                  </div>
                  <div className="flex flex-wrap gap-2 pt-1">
                    {customResult.recommendedToolsAndFrameworks.map((tool, idx) => (
                      <span
                        key={idx}
                        className="px-3 py-1.5 rounded-xl bg-slate-950/80 border border-sky-500/30 text-sky-300 text-xs font-mono font-semibold"
                      >
                        {tool}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Market Value Impact */}
              {customResult.marketValueImpact && (
                <div className="p-5 rounded-2xl bg-emerald-950/30 border border-emerald-500/30 flex items-center gap-3">
                  <TrendingUp className="w-5 h-5 text-emerald-400 shrink-0" />
                  <p className="text-xs text-emerald-200">
                    <strong>Piyasa Değer Çarpanı & Gelir Projeksiyonu:</strong> {customResult.marketValueImpact}
                  </p>
                </div>
              )}

              {/* Eylem Döngüsü & Bağlantılı Modüller (Aşama 23) */}
              <div className="p-6 rounded-3xl bg-gradient-to-r from-purple-950/60 via-slate-900 to-indigo-950/60 border border-purple-500/30 shadow-xl space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/10 pb-3">
                  <div className="flex items-center gap-2">
                    <Zap className="w-4 h-4 text-cyan-400" />
                    <h4 className="text-xs font-mono font-bold uppercase text-white tracking-wider">
                      {isTr ? "Sonraki Adımlar & Eyleme Geçiş" : "Next Steps & Action Flow"}
                    </h4>
                  </div>
                  <span className="text-[11px] font-mono text-purple-300">
                    {isTr ? "Merkezi Yol Haritası ve Canlı İstihbarat Entegrasyonu" : "Integrated with Roadmap & Signals"}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {onNavigateToView && (
                    <button
                      type="button"
                      onClick={() => onNavigateToView("roadmap", activeMilestone?.year)}
                      className="p-3.5 rounded-2xl bg-purple-600 hover:bg-purple-500 text-white font-mono text-xs font-bold transition flex items-center justify-between shadow-lg shadow-purple-600/25 cursor-pointer group"
                    >
                      <div className="flex items-center gap-2">
                        <Compass className="w-4 h-4" />
                        <span>{isTr ? "Kişisel Yol Haritasına Git" : "Go to Personal Roadmap"}</span>
                      </div>
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition" />
                    </button>
                  )}

                  {onNavigateToView && (
                    <button
                      type="button"
                      onClick={() => onNavigateToView("telegram_feed", activeMilestone?.year)}
                      className="p-3.5 rounded-2xl bg-cyan-950/80 hover:bg-cyan-900 border border-cyan-500/40 text-cyan-200 hover:text-white font-mono text-xs font-bold transition flex items-center justify-between cursor-pointer group"
                    >
                      <div className="flex items-center gap-2">
                        <Radio className="w-4 h-4 text-cyan-400 animate-pulse" />
                        <span>{isTr ? "Canlı İstihbarat Radarı" : "Live Signals Radar"}</span>
                      </div>
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition" />
                    </button>
                  )}

                  {activeMilestone && onOpenDetailModal && (
                    <button
                      type="button"
                      onClick={() => onOpenDetailModal(activeMilestone, "personal_impact")}
                      className="p-3.5 rounded-2xl bg-slate-900 hover:bg-slate-800 border border-white/10 text-rose-300 hover:text-white font-mono text-xs font-bold transition flex items-center justify-between cursor-pointer group"
                    >
                      <div className="flex items-center gap-2">
                        <Target className="w-4 h-4 text-rose-400" />
                        <span>🎯 {activeMilestone.year} {isTr ? "Dönüm Noktası" : "Milestone"}</span>
                      </div>
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODE 2: 2026-2060 ZAMAN TÜNELİ KOKPİT SİMÜLATÖRÜ (GAME LEVER SIMULATOR)    */}
      {/* ========================================================================= */}
      {activeTab === "cockpit" && (
        <div className="space-y-6">
          {/* Reference Notice & Quick Switch to Custom AI */}
          <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-slate-950/90 via-slate-900/90 to-purple-950/60 border border-cyan-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-lg">
            <div className="flex items-center gap-2.5">
              <Sliders className="w-4 h-4 text-cyan-400 shrink-0" />
              <p className="text-xs text-slate-300">
                {isTr
                  ? "Aşağıdaki 8 meslek, otomasyonun sektörlere etkisini test etmeniz için hazırlanmış hazır referans senaryolardır."
                  : "The 8 roles below are reference scenarios to explore automation impacts across key industries."}
              </p>
            </div>
            <button
              type="button"
              onClick={() => handleSwitchTab("custom_ai")}
              className="px-3.5 py-1.5 rounded-xl bg-purple-600/30 hover:bg-purple-600/50 border border-purple-500/40 text-purple-200 hover:text-white font-mono text-xs font-bold transition shrink-0 cursor-pointer flex items-center gap-1.5 self-start sm:self-auto"
            >
              <Search className="w-3.5 h-3.5 text-purple-300" />
              <span>{isTr ? "Kendi Mesleğinizi Analiz Edin →" : "Analyze Your Own Role →"}</span>
            </button>
          </div>

          {/* 1-Click Fast Profession Selector */}
          <div className="p-5 sm:p-6 rounded-3xl bg-slate-900/90 border border-white/10 shadow-xl space-y-3">
            <label className="text-xs font-bold text-slate-300 font-mono flex items-center gap-1.5 uppercase">
              <Briefcase className="w-3.5 h-3.5 text-amber-400" />
              <span>Hazır Meslek Simülasyonunu Seçin:</span>
            </label>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {PROFESSIONS.map((prof, profIdx) => (
                <button
                  key={`prof-${prof.id}-${profIdx}`}
                  onClick={() => setSelectedProfId(prof.id)}
                  className={`p-3.5 rounded-2xl text-left transition cursor-pointer border flex items-center gap-3 ${
                    selectedProfId === prof.id
                      ? "bg-purple-600 border-purple-400 text-white shadow-lg shadow-purple-600/25"
                      : "bg-slate-950/70 hover:bg-slate-800/80 border-white/10 text-slate-300 hover:text-white"
                  }`}
                >
                  <span className="text-2xl">{prof.emoji}</span>
                  <div>
                    <span className="text-xs font-bold block">{prof.name}</span>
                    <span className="text-[10px] opacity-75 font-mono">2026—2050 Evrimi</span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Time Scrubber Lever */}
          <div className="p-5 sm:p-6 rounded-3xl bg-slate-900/90 border border-white/10 shadow-xl space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <Sliders className="w-4 h-4 text-cyan-400" />
                <h3 className="text-sm font-bold text-white font-mono uppercase tracking-wider">
                  Kariyer Dönüşüm Hattı: 2026 ➔ 2035+ Gelişim Evresi
                </h3>
              </div>
              <span className="text-xs font-mono text-purple-300 font-bold bg-purple-950/50 px-3 py-1 rounded-xl border border-purple-500/30">
                {selectedYear} Evresini İnceliyorsunuz
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {TIMELINE_YEARS.map((yr, yrIdx) => {
                const yrData = currentProf.timeline[yr];
                const isSelected = selectedYear === yr;
                return (
                  <button
                    key={`yr-${yr}-${yrIdx}`}
                    onClick={() => setSelectedYear(yr)}
                    className={`p-4 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between space-y-2 ${
                      isSelected
                        ? "bg-gradient-to-br from-cyan-950/80 via-slate-900 to-purple-950/80 border-cyan-400 shadow-lg shadow-cyan-500/20 ring-2 ring-cyan-400/40"
                        : "bg-slate-950/60 hover:bg-slate-800/80 border-white/10 text-slate-400 hover:text-slate-200"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className={`text-xl font-mono font-extrabold ${isSelected ? "text-cyan-300" : "text-slate-300"}`}>
                        {yr}
                      </span>
                      <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full border ${
                        isSelected ? "bg-cyan-500/20 text-cyan-300 border-cyan-400/40" : "bg-slate-800 text-slate-400 border-white/5"
                      }`}>
                        {yrData?.marketValueMultiplier} Değer
                      </span>
                    </div>
                    <p className="text-xs font-bold text-slate-200 leading-snug line-clamp-1">
                      {yrData?.yearTitle}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Cockpit Gauges & Situation */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            <div className="lg:col-span-7 space-y-4">
              <div className="p-6 rounded-3xl bg-slate-900/90 border border-white/10 shadow-xl space-y-3">
                <div className="flex items-center justify-between border-b border-white/5 pb-3">
                  <div className="flex items-center gap-2">
                    <Radio className="w-4 h-4 text-purple-400 animate-pulse" />
                    <span className="text-xs font-bold uppercase tracking-wider text-purple-300 font-mono">
                      {selectedYear} Saha Raporu & Otomasyon Dalgası
                    </span>
                  </div>
                  <span className="text-xs font-mono font-bold text-slate-400">
                    {currentProf.name}
                  </span>
                </div>

                <h3 className="text-lg font-bold text-white leading-snug">
                  {currentYearData.yearTitle}
                </h3>

                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-sans bg-slate-950/60 p-4 rounded-2xl border border-white/5">
                  "{currentYearData.situation}"
                </p>

                {(() => {
                  const matchingSignals = (liveSignals || []).filter((s: any) => {
                    const y = s.matchedMilestoneYear || s.extractedYear;
                    return y === selectedYear || (y && Math.abs(y - selectedYear) <= 1);
                  });
                  if (matchingSignals.length === 0) return null;
                  const topSig = matchingSignals[0];
                  return (
                    <div className="p-3.5 rounded-2xl bg-gradient-to-r from-purple-950/70 via-slate-900 to-indigo-950/80 border border-purple-500/40 text-purple-200 text-xs font-mono space-y-1.5 shadow-lg animate-fadeIn">
                      <div className="flex items-center justify-between">
                        <span className="font-bold flex items-center gap-1.5 text-purple-300">
                          <Radio className="w-3.5 h-3.5 text-purple-400 animate-pulse" />
                          <span>{isTr ? "📡 Canlı Sinyal Otomasyon Dinamiği" : "📡 Live Signal Automation Dynamic"}</span>
                        </span>
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-purple-500/20 text-purple-300 border border-purple-500/40">
                          {matchingSignals.length} {isTr ? "Canlı Sinyal" : "Live Signals"}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-300 font-sans leading-relaxed">
                        "{topSig.title}" — {isTr ? "Gelen araştırma kanıtları, bu evredeki otomasyon hızını ve talep edilen yetkinlik dönüşümünü canlı olarak etkilemektedir." : "Incoming research evidence directly shifts automation velocity and demanded skill transformations."}
                      </p>
                    </div>
                  );
                })()}

                <div className="grid grid-cols-2 gap-3 pt-2">
                  <div className="p-4 rounded-2xl bg-slate-950/80 border border-white/10 text-center space-y-1">
                    <span className="text-[11px] font-mono uppercase text-slate-400 block font-semibold">
                      Hayatta Kalma Güvencesi
                    </span>
                    <span className={`text-2xl sm:text-3xl font-mono font-extrabold block ${
                      survivalScore >= 70 ? "text-emerald-400" : survivalScore >= 45 ? "text-amber-400" : "text-rose-400"
                    }`}>
                      %{survivalScore}
                    </span>
                    <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden mt-1">
                      <div
                        style={{ width: `${survivalScore}%` }}
                        className={`h-full transition-all duration-500 ${
                          survivalScore >= 70 ? "bg-emerald-400" : survivalScore >= 45 ? "bg-amber-400" : "bg-rose-500"
                        }`}
                      />
                    </div>
                  </div>

                  <div className="p-4 rounded-2xl bg-slate-950/80 border border-white/10 text-center space-y-1">
                    <span className="text-[11px] font-mono uppercase text-slate-400 block font-semibold">
                      Piyasa Değer Çarpanı
                    </span>
                    <span className="text-2xl sm:text-3xl font-mono font-extrabold text-cyan-300 block">
                      {currentYearData.marketValueMultiplier}
                    </span>
                    <span className="text-[10px] text-slate-500 font-mono block">
                      Geleneksel role kıyasla katma değer
                    </span>
                  </div>
                </div>
              </div>

              {/* Decision Choice Cards */}
              <div className="p-6 rounded-3xl bg-slate-900/90 border border-white/10 shadow-xl space-y-4">
                <div className="flex items-center gap-2">
                  <Zap className="w-4 h-4 text-amber-400" />
                  <h3 className="text-sm font-bold text-white font-mono uppercase tracking-wider">
                    {selectedYear} Kritik Karar Anı: Hangisini Seçeceksiniz?
                  </h3>
                </div>

                <div className="space-y-3">
                  {currentYearData.decisions.map((decision, dIdx) => {
                    const isPicked = activeDecision?.id === decision.id;
                    return (
                      <div
                        key={`dec-${decision.id}-${dIdx}`}
                        onClick={() => handleSelectDecision(decision.id)}
                        className={`p-4 rounded-2xl border transition-all cursor-pointer space-y-2 ${
                          isPicked
                            ? "bg-purple-950/50 border-purple-400 shadow-md shadow-purple-600/20 ring-1 ring-purple-400/50"
                            : "bg-slate-950/60 hover:bg-slate-800/60 border-white/10 text-slate-400"
                        }`}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex items-start gap-2.5">
                            <div className={`w-5 h-5 rounded-full mt-0.5 flex items-center justify-center shrink-0 border ${
                              isPicked ? "bg-purple-600 border-purple-300 text-white" : "border-slate-600 bg-slate-800"
                            }`}>
                              {isPicked && <Check className="w-3 h-3" />}
                            </div>
                            <div>
                              <h4 className="text-xs sm:text-sm font-bold text-white leading-snug">
                                {decision.choice}
                              </h4>
                              <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                                <strong>Sonuç:</strong> {decision.consequence}
                              </p>
                            </div>
                          </div>

                          <span className={`text-xs font-mono font-bold px-2 py-0.5 rounded-md shrink-0 ${
                            decision.survivalBoost > 0 ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30" : "bg-rose-500/20 text-rose-300 border border-rose-500/30"
                          }`}>
                            {decision.survivalBoost > 0 ? `+${decision.survivalBoost}% Güç` : `${decision.survivalBoost}% Risk`}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Right: Holographic Future Role & Skills */}
            <div className="lg:col-span-5 space-y-4">
              <div className="p-6 rounded-3xl bg-gradient-to-br from-purple-900/40 via-slate-900 to-cyan-900/40 border border-purple-500/40 shadow-2xl space-y-4 relative overflow-hidden">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-mono font-bold uppercase text-purple-300 tracking-wider">
                    {selectedYear} Gelecek Unvanınız
                  </span>
                  <Award className="w-5 h-5 text-amber-400" />
                </div>

                <div className="space-y-1">
                  <span className="text-[10px] text-slate-400 font-mono uppercase block">Sentezlenen Rol:</span>
                  <h2 className="text-lg sm:text-xl font-bold text-white leading-snug text-transparent bg-clip-text bg-gradient-to-r from-purple-200 via-white to-cyan-200">
                    {activeDecision?.futureRole || "Stratejik Mimar"}
                  </h2>
                </div>

                <div className="p-3.5 rounded-2xl bg-slate-950/70 border border-white/10 space-y-1.5 text-xs text-slate-300">
                  <div className="flex items-center gap-1.5 text-cyan-400 font-mono font-bold text-[11px]">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Kokpit Tavsiyesi:</span>
                  </div>
                  <p className="italic leading-relaxed font-sans">
                    "{currentYearData.actionHint}"
                  </p>
                </div>
              </div>

              <div className="p-5 rounded-3xl bg-slate-900/90 border border-white/10 shadow-lg space-y-3">
                <div className="flex items-center gap-2">
                  <Cpu className="w-4 h-4 text-emerald-400" />
                  <h4 className="text-xs font-mono font-bold uppercase text-slate-200">
                    {selectedYear} Yılında Sizi Koruyacak Süper Güçler
                  </h4>
                </div>

                <div className="space-y-2">
                  {currentYearData.keySkills.map((skill, idx) => (
                    <div
                      key={idx}
                      className="p-2.5 rounded-xl bg-slate-950/70 border border-white/5 flex items-center gap-2.5 text-xs text-slate-200"
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0" />
                      <span className="font-mono font-semibold">{skill}</span>
                    </div>
                  ))}
                </div>
              </div>

              {onNavigateToView && (
                <div className="space-y-2">
                  <button
                    onClick={() => onNavigateToView("timeline", selectedYear)}
                    className="w-full p-3.5 rounded-2xl bg-slate-900 hover:bg-slate-800 border border-purple-500/30 hover:border-purple-500/60 text-purple-200 text-xs font-bold flex items-center justify-between transition group cursor-pointer"
                  >
                    <div className="flex items-center gap-2">
                      <Compass className="w-4 h-4 text-purple-400" />
                      <span>{selectedYear} Dünya Kırılmalarını İncele</span>
                    </div>
                    <ArrowRight className="w-4 h-4 text-purple-400 group-hover:translate-x-1 transition" />
                  </button>

                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => onNavigateToView("roadmap", selectedYear)}
                      className="p-3 rounded-xl bg-purple-950/60 hover:bg-purple-900 border border-purple-500/30 text-purple-200 hover:text-white text-xs font-mono font-bold flex items-center justify-center gap-1.5 transition cursor-pointer"
                    >
                      <Compass className="w-3.5 h-3.5" />
                      <span>{isTr ? "Yol Haritası" : "Roadmap"}</span>
                    </button>

                    <button
                      onClick={() => onNavigateToView("telegram_feed", selectedYear)}
                      className="p-3 rounded-xl bg-cyan-950/60 hover:bg-cyan-900 border border-cyan-500/30 text-cyan-200 hover:text-white text-xs font-mono font-bold flex items-center justify-center gap-1.5 transition cursor-pointer"
                    >
                      <Radio className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
                      <span>{isTr ? "Canlı İstihbarat" : "Signals"}</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
