import { ViewMode } from "../types";

export type UserPlan = "free" | "pro" | "quantum_vip";

export interface PlanFeatureRule {
  id: ViewMode;
  nameTr: string;
  nameEn: string;
  minPlan: UserPlan;
  badgeTr: string;
  badgeEn: string;
  shortBenefitTr: string;
  shortBenefitEn: string;
  descriptionTr: string;
  descriptionEn: string;
}

// Plan hierarchy weight: free: 0, pro: 1, quantum_vip: 2
const PLAN_LEVELS: Record<UserPlan, number> = {
  free: 0,
  pro: 1,
  quantum_vip: 2,
};

export const VIEW_PLAN_RULES: Record<ViewMode, PlanFeatureRule> = {
  portal: {
    id: "portal",
    nameTr: "Gelecek Portalı",
    nameEn: "Future Portal",
    minPlan: "free",
    badgeTr: "Ücretsiz",
    badgeEn: "Free",
    shortBenefitTr: "Her vatandaşa açık genel merkez.",
    shortBenefitEn: "Open intelligence center for everyone.",
    descriptionTr: "2026—2060 teknolojik evrimini keşfetmeye başlayın.",
    descriptionEn: "Start exploring the 2026-2060 technological evolution.",
  },
  timeline: {
    id: "timeline",
    nameTr: "2026—2060 Zaman Çizelgesi",
    nameEn: "2026—2060 Timeline",
    minPlan: "free",
    badgeTr: "Ücretsiz",
    badgeEn: "Free",
    shortBenefitTr: "100+ doğrulanmış tarihi dönüm noktası.",
    shortBenefitEn: "100+ verified historical milestones.",
    descriptionTr: "Tüm vatandaşların ücretsiz inceleyebildiği ana zaman tüneli.",
    descriptionEn: "Main chronological timeline freely accessible to all citizens.",
  },
  telegram_feed: {
    id: "telegram_feed",
    nameTr: "Canlı Teknoloji & Bilim Haberleri",
    nameEn: "Live Tech & Science News",
    minPlan: "free",
    badgeTr: "Ücretsiz",
    badgeEn: "Free",
    shortBenefitTr: "Anlık teknolojik kırılma bildirimleri.",
    shortBenefitEn: "Instant technological breakthrough alerts.",
    descriptionTr: "Dünyanın dört bir yanından derlenen canlı teknoloji istihbaratı.",
    descriptionEn: "Live technology intelligence curated from around the globe.",
  },
  geo_map: {
    id: "geo_map",
    nameTr: "5-Katmanlı Dünya Durumu",
    nameEn: "5-Layer World Status",
    minPlan: "free",
    badgeTr: "Ücretsiz",
    badgeEn: "Free",
    shortBenefitTr: "Gezegen sağlığı, yapay zeka ve enerji haritası.",
    shortBenefitEn: "Planet health, AI adoption, and energy map.",
    descriptionTr: "Dünya genelinde teknolojik dönüşümün küresel dağılımı.",
    descriptionEn: "Global distribution of technological transformation worldwide.",
  },
  spin_wheel: {
    id: "spin_wheel",
    nameTr: "Günlük Gelecek Çarkı",
    nameEn: "Daily Future Spin Wheel",
    minPlan: "free",
    badgeTr: "Ücretsiz",
    badgeEn: "Free",
    shortBenefitTr: "Her gün ücretsiz hediye kredi kazanma.",
    shortBenefitEn: "Earn free gift credits every day.",
    descriptionTr: "Günlük çarkı çevirerek simülasyon kredisi toplayın.",
    descriptionEn: "Spin the wheel daily to collect simulation credits.",
  },
  leaderboard: {
    id: "leaderboard",
    nameTr: "Topluluk Liderlik Tablosu",
    nameEn: "Community Leaderboard",
    minPlan: "free",
    badgeTr: "Ücretsiz",
    badgeEn: "Free",
    shortBenefitTr: "Gelecek tahmincileri sıralaması.",
    shortBenefitEn: "Future predictor rankings.",
    descriptionTr: "En isabetli teknoloji tahminlerini yapan vatandaşlar.",
    descriptionEn: "Citizens with the most accurate technology forecasts.",
  },
  community: {
    id: "community",
    nameTr: "Topluluk Katkıları & Öneriler",
    nameEn: "Community Submissions",
    minPlan: "free",
    badgeTr: "Ücretsiz",
    badgeEn: "Free",
    shortBenefitTr: "Yeni teknoloji ve buluş önerme.",
    shortBenefitEn: "Suggest new tech and inventions.",
    descriptionTr: "Gelecek takvimine kendi tahmininizi veya keşfinizi ekleyin.",
    descriptionEn: "Contribute your own forecast or finding to the future calendar.",
  },
  prediction_history: {
    id: "prediction_history",
    nameTr: "Kişisel Tahmin Arşivi",
    nameEn: "Prediction Archive",
    minPlan: "free",
    badgeTr: "Ücretsiz",
    badgeEn: "Free",
    shortBenefitTr: "Yaptığınız analiz ve tahmin geçmişi.",
    shortBenefitEn: "Your analysis and prediction log.",
    descriptionTr: "Daha önce çalıştırdığınız tüm yapay zeka raporlarına erişin.",
    descriptionEn: "Access all your previously generated AI reports.",
  },
  comparison: {
    id: "comparison",
    nameTr: "Senaryo Karşılaştırma",
    nameEn: "Scenario Comparison",
    minPlan: "free",
    badgeTr: "Ücretsiz",
    badgeEn: "Free",
    shortBenefitTr: "İyimser vs Distopik gelecek kıyası.",
    shortBenefitEn: "Optimistic vs Dystopian future comparison.",
    descriptionTr: "Farklı gelecek patikalarını yan yana inceleyin.",
    descriptionEn: "Examine different future trajectories side by side.",
  },
  verdict: {
    id: "verdict",
    nameTr: "Topluluk Karar Konsensüsü",
    nameEn: "Consensus Verdict",
    minPlan: "free",
    badgeTr: "Ücretsiz",
    badgeEn: "Free",
    shortBenefitTr: "Vatandaşların gerçekleşme oyları.",
    shortBenefitEn: "Citizen consensus voting on milestones.",
    descriptionTr: "Dönüm noktalarının gerçekleşme ihtimaline dair ortak kanaat.",
    descriptionEn: "Collective wisdom on milestone feasibility.",
  },

  // PRO & ADVANCED CITIZEN FEATURES (Now All Open Access in Pure Credit Economy)
  job_risk: {
    id: "job_risk",
    nameTr: "Meslek Otomasyon Risk Analizi",
    nameEn: "Job Automation Risk Analyzer",
    minPlan: "free",
    badgeTr: "Açık Erişim",
    badgeEn: "Open Access",
    shortBenefitTr: "Kendi mesleğinizi yapay zekaya karşı zırhlandırın.",
    shortBenefitEn: "Armor your profession against AI automation.",
    descriptionTr: "Kendi mesleğinizin 2026-2060 arasında hangi rutinlerinin otomatikleşeceğini, hangi yeni becerileri edinmeniz gerektiğini ve gelir riskinizi adım adım analiz eder.",
    descriptionEn: "Step-by-step analysis of which routine duties in your job will automate, which new skills you need, and your income security timeline.",
  },
  roadmap: {
    id: "roadmap",
    nameTr: "Kişisel Gelecek Planı & Biyo-Yaş",
    nameEn: "Personal Future Roadmap & Bio-Age",
    minPlan: "free",
    badgeTr: "Açık Erişim",
    badgeEn: "Open Access",
    shortBenefitTr: "2026-2060 kişisel ve biyo-yaş hayat haritanız.",
    shortBenefitEn: "Your 2026-2060 personal life and longevity map.",
    descriptionTr: "Doğum yılınız ve mesleğinize özel olarak, hangi yılda kaç yaşında olacağınızı, o yıl hangi tıbbi gençleşme ve kariyer sıçramalarına erişebileceğinizi haritalar.",
    descriptionEn: "Tailored to your birth year and job: Maps your biological age, access to longevity breakthroughs, and personal milestones up to 2060.",
  },
  persona_chat: {
    id: "persona_chat",
    nameTr: "2060 AI Zaman Yolcusu Sohbeti",
    nameEn: "2060 AI Time Traveler Chat",
    minPlan: "free",
    badgeTr: "Açık Erişim",
    badgeEn: "Open Access",
    shortBenefitTr: "Geleceğin sıradan vatandaşları ile doğrudan konuşun.",
    shortBenefitEn: "Chat directly with everyday citizens of the future.",
    descriptionTr: "2035 nöral arayüz tasarımcısı, 2045 sentetik biyolog veya 2060 mars vatandaşı ile kuantum simülasyon mesajlaşması.",
    descriptionEn: "Converse with realistic simulated future personas about daily life, career shifts, and societal transformations.",
  },
  futurist_advisor: {
    id: "futurist_advisor",
    nameTr: "2060 AI Gelecek Danışmanı",
    nameEn: "2060 AI Future Advisor",
    minPlan: "free",
    badgeTr: "Açık Erişim",
    badgeEn: "Open Access",
    shortBenefitTr: "Bireysel yaşam ve finansal gelecek rehberliği.",
    shortBenefitEn: "Personal life and future decision advisory.",
    descriptionTr: "Yapay zeka çağında çocuk yetiştirme, gayrimenkul ve yatırım tercihlerine dair fütüristik rehberlik.",
    descriptionEn: "Futuristic guidance on parenting, investments, and life planning in the age of intelligence.",
  },
  analytics: {
    id: "analytics",
    nameTr: "Gelişmiş Trend & Biyo-Analitik",
    nameEn: "Advanced Trend & Bio Analytics",
    minPlan: "free",
    badgeTr: "Açık Erişim",
    badgeEn: "Open Access",
    shortBenefitTr: "Sektörel değişim ve sağlık verileri derin analizi.",
    shortBenefitEn: "Deep analysis of sector shifts and health trends.",
    descriptionTr: "Hangi sektörün hangi tarihte zirve yapacağını gösteren detaylı trend grafikleri.",
    descriptionEn: "In-depth visual charts revealing exactly when industries transform.",
  },

  // DEEP SIMULATION & INTELLIGENCE FEATURES (Open Access, Uses Credits for Heavy Computations)
  butterfly: {
    id: "butterfly",
    nameTr: "Kelebek Etkisi & Alternatif Evrenler",
    nameEn: "Butterfly Effect & Multiverse Simulator",
    minPlan: "free",
    badgeTr: "Açık Erişim",
    badgeEn: "Open Access",
    shortBenefitTr: "Tarihsel kırılmaları değiştirip ailenizin geleceğini test edin.",
    shortBenefitEn: "Alter historical choices and simulate alternative family futures.",
    descriptionTr: "Bir teknoloji 5 yıl gecikirse veya hızlanırsa toplumun, mesleklerin ve ailenizin nasıl etkileneceğini kuantum zinciriyle simüle edin.",
    descriptionEn: "Simulate ripple cascades if a breakthrough is delayed or accelerated, mapping alternative futures for families and society.",
  },
  network: {
    id: "network",
    nameTr: "Kuantum Nedensellik & Etki Ağı",
    nameEn: "Causality & Impact Network",
    minPlan: "free",
    badgeTr: "Açık Erişim",
    badgeEn: "Open Access",
    shortBenefitTr: "Tüm teknolojilerin birbirini tetikleme haritası.",
    shortBenefitEn: "Full cause-and-effect interaction web.",
    descriptionTr: "Yapay zekanın füzyonu, füzyonun biyolojik gençleşmeyi nasıl tetiklediğini 3 boyutlu etkileşim ağıyla keşfedin.",
    descriptionEn: "Interactive 3D causal web showing how AI triggers fusion, and fusion triggers biological immortality.",
  },
  agent_scan: {
    id: "agent_scan",
    nameTr: "Otonom Ajan Canlı Taraması",
    nameEn: "Autonomous Agent Live Scan",
    minPlan: "free",
    badgeTr: "Açık Erişim",
    badgeEn: "Open Access",
    shortBenefitTr: "Otonom yapay zekaların geleceği izleme motoru.",
    shortBenefitEn: "Autonomous AI engine scanning future shifts.",
    descriptionTr: "Arka planda çalışan otonom ajanların yeni gelişmeleri takip ederek takvimi güncellemesi.",
    descriptionEn: "Autonomous agent tracking engine constantly monitoring global signals and real-time updates.",
  },
  data_integrity: {
    id: "data_integrity",
    nameTr: "Kapsamlı Sistem & Veri Bütünlüğü",
    nameEn: "Data Integrity & Verification",
    minPlan: "free",
    badgeTr: "Açık Erişim",
    badgeEn: "Open Access",
    shortBenefitTr: "En yüksek güvenilirlik ve veri doğrulama motoru.",
    shortBenefitEn: "Highest-grade credibility and verification engine.",
    descriptionTr: "Tahminlerin tutarlılık skorlarını ve matematiksel hata paylarını inceleyin.",
    descriptionEn: "Inspect mathematical confidence scores and deviation bounds of future models.",
  },
  audit: {
    id: "audit",
    nameTr: "Algoritmik Gelecek Denetimi",
    nameEn: "Algorithmic Audit",
    minPlan: "free",
    badgeTr: "Açık Erişim",
    badgeEn: "Open Access",
    shortBenefitTr: "Tüm varsayımların doğruluk denetimi.",
    shortBenefitEn: "Auditing all assumptions with data verification.",
    descriptionTr: "Gelecek projeksiyonlarının arkasındaki algoritmik mantığı denetleyin.",
    descriptionEn: "Audit the algorithmic logic underpinning every future projection.",
  },
  verification: {
    id: "verification",
    nameTr: "Bilimsel Doğrulama & TRL Haritası",
    nameEn: "Scientific Verification & TRL Map",
    minPlan: "free", // Keşif için açık, VIP için daha derin analiz
    badgeTr: "Açık Keşif",
    badgeEn: "Open Access",
    shortBenefitTr: "Teknoloji olgunluk seviyeleri (TRL 1-9).",
    shortBenefitEn: "Technology readiness levels (TRL 1-9).",
    descriptionTr: "Gelişmelerin laboratuvar aşamasından sokağa inme sürecini takip edin.",
    descriptionEn: "Track how discoveries advance from lab benches into everyday citizen life.",
  },
  admin: {
    id: "admin",
    nameTr: "Yönetici Paneli",
    nameEn: "Admin Panel",
    minPlan: "quantum_vip",
    badgeTr: "Yönetici",
    badgeEn: "Admin",
    shortBenefitTr: "Sistem yönetimi.",
    shortBenefitEn: "System management.",
    descriptionTr: "Yalnızca yetkili sistem yöneticileri içindir.",
    descriptionEn: "Reserved for authorized administrators only.",
  },
};

/**
 * Checks if a user's plan is entitled to view/use a specific feature.
 * In the Pure Credit Economy, all citizen modules are unlocked for everyone;
 * users consume transparent credits only for heavy AI computations.
 */
export function hasPlanAccess(userPlan: UserPlan | undefined | null, view: ViewMode, userEmail?: string | null): boolean {
  // Super admin override
  if (userEmail && userEmail.toLowerCase().trim() === "warfacelove46@gmail.com") {
    return true;
  }

  // Reserved strictly for system administrators
  if (view === "admin") {
    return false;
  }

  // Pure Credit Economy: All modules are fully unlocked without artificial subscription walls
  return true;
}

/**
 * Returns the human-readable plan title
 */
export function getPlanDisplayName(plan: UserPlan, isTr = true): string {
  return isTr ? "Standart Gelecek Hesabı (Kredi Modeli)" : "Standard Future Account (Credit Model)";
}
