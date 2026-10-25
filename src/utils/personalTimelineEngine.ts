import { Milestone, MilestoneDecisionHistoryEntry, DynamicImpactAssessment, OutcomeSemanticsType } from "../types";
import { UserProfile } from "../components/UserAuthModal";
import { PredictionHistoryRecord } from "./predictionHistory";
import { safeStorage } from "./safeStorage";

export type PersonalRelevanceLevel = "high" | "medium" | "low";

export interface MilestonePersonalImpact {
  relevanceScore: number; // 0 - 100
  relevanceLevel: PersonalRelevanceLevel;
  relevanceReason: string;
  userAgeAtMilestone?: number;
  careerImpactSummary: string;
  opportunitySummary: string;
  riskSummary: string;
  preparationAdvice: string;
  isProfilePending: boolean;
  matchingRoadmapStep?: {
    title: string;
    targetYear?: number;
    action: string;
  } | null;
  matchingJobRiskContext?: {
    riskLevel: string;
    automationHorizon?: string;
  } | null;
}

// Domain keyword sets for deterministic mapping
const DOMAIN_KEYWORDS: Record<string, string[]> = {
  software_tech: [
    "yazılım", "kod", "yazılımcı", "developer", "software", "mühendis", "ai",
    "bilişim", "programlama", "veri", "data", "yapay zeka", "algoritma", "web",
    "siber", "cyber", "it", "bilgisayar", "devops", "cloud", "bulut", "sistem",
    "engineer", "programmer", "tech", "technology"
  ],
  health_bio: [
    "doktor", "hekim", "sağlık", "tıp", "hemşire", "biyoloji", "genetik", "eczacı",
    "fizyoterapist", "psikolog", "diş", "cerrah", "biyomedikal", "klinik", "biyo",
    "kardiyolog", "kardiyo", "nörolog", "nöro", "onkolog", "onkoloji", "radyolog",
    "dahiliye", "pediatri", "cerrahi", "hastane", "laboratuvar", "genom",
    "doctor", "physician", "nurse", "healthcare", "medical", "medicine", "biotech"
  ],
  finance_business: [
    "finans", "muhasebe", "banka", "yatırım", "iktisat", "ekonomi", "borsa",
    "mali", "kripto", "analist", "pazarlama", "satış", "yönetici", "ceo", "cfo", "iş",
    "finance", "business", "manager", "management", "director", "executive", "lead"
  ],
  creative_design: [
    "tasarım", "grafik", "ui", "ux", "sanat", "video", "medya", "mimar", "iç mimar",
    "yazar", "editör", "içerik", "reklam", "moda", "animasyon", "müzik", "prodüksiyon",
    "designer", "design", "creative", "artist", "writer", "editor", "media"
  ],
  education_academia: [
    "öğretmen", "öğretim", "akademisyen", "profesör", "doçent", "öğrenci", "eğitim",
    "okul", "üniversite", "araştırmacı", "pedagog", "eğitmen",
    "student", "education", "academic", "teacher", "professor", "researcher", "scholar"
  ],
  legal_gov: [
    "avukat", "hukuk", "savcı", "hakim", "noter", "katip", "mevzuat", "danışman",
    "kamu", "bürokrasi", "diplomat", "memur",
    "lawyer", "legal", "attorney", "policy", "government"
  ],
  engineering_physical: [
    "makine", "inşaat", "elektrik", "elektronik", "enerji", "fizik", "kimya",
    "endüstri", "robotik", "mekatronik", "otomotiv", "havacılık", "uzay",
    "mechanical", "electrical", "civil", "robotics", "aerospace", "automotive"
  ],
  logistics_service: [
    "lojistik", "tedarik", "kurye", "ulaşım", "şoför", "depo", "otel", "turizm",
    "aşçı", "garson", "güvenlik", "perakende", "mağaza", "esnaf",
    "logistics", "supply chain", "retail", "hospitality", "transport"
  ]
};

// Category compatibility mapping
const CATEGORY_ALIGNMENTS: Record<string, string[]> = {
  "Yapay Zeka & Bilişim": ["software_tech", "finance_business", "creative_design", "education_academia"],
  "Biyoloji & Tıp": ["health_bio", "education_academia"],
  "Enerji & Çevre": ["engineering_physical", "logistics_service"],
  "İnsan-Makine Arayüzü": ["software_tech", "health_bio", "creative_design"],
  "Kuantum & Güvenlik": ["software_tech", "finance_business", "engineering_physical"],
  "Otonom & Lojistik": ["logistics_service", "engineering_physical", "software_tech"],
  "Sosyoloji & Ekonomi": ["finance_business", "legal_gov", "education_academia"],
  "Post-İnsan & Medeniyet": ["health_bio", "education_academia", "creative_design"],
  "Uzay & Fizik": ["engineering_physical", "software_tech"]
};

/**
 * Calculates deterministic personal impact of a global milestone for a specific user.
 * ZERO API calls, ZERO credits, ZERO side-effects.
 */
export function calculateMilestonePersonalImpact(
  milestone: Milestone,
  profile?: UserProfile | null,
  roadmapRecord?: PredictionHistoryRecord | null,
  jobRiskRecord?: PredictionHistoryRecord | null
): MilestonePersonalImpact {
  const isProfilePending = !profile || !profile.profession || profile.profession.trim().length === 0;

  const currentYear = 2026;
  const userBaseAge = profile?.age && profile.age >= 10 && profile.age <= 100 ? profile.age : undefined;
  const userAgeAtMilestone = userBaseAge !== undefined ? userBaseAge + Math.max(0, milestone.year - currentYear) : undefined;

  const profStr = (profile?.profession || "").toLowerCase().trim();
  const goalStr = `${profile?.primaryGoal || ""} ${profile?.personalGoal || ""} ${profile?.primaryGoalLabel || ""}`.toLowerCase().trim();
  const industryStr = (profile?.industrySector || "").toLowerCase().trim();

  // 1. Detect matching domain clusters
  const userDomains: string[] = [];
  const combinedUserText = `${profStr} ${industryStr}`;

  for (const [domainKey, keywords] of Object.entries(DOMAIN_KEYWORDS)) {
    for (const kw of keywords) {
      if (combinedUserText.includes(kw)) {
        userDomains.push(domainKey);
        break;
      }
    }
  }

  // 2. Score calculation (0 - 100)
  let score = 20; // Base score for any global event

  // Category matching
  const matchingDomains = CATEGORY_ALIGNMENTS[milestone.category] || [];
  const hasCategoryMatch = userDomains.some((d) => matchingDomains.includes(d));
  if (hasCategoryMatch) {
    score += 35;
  }

  // Text keyword cross-matching
  const milestoneFullText = `${milestone.title} ${milestone.description} ${milestone.dailyLifeImpact || ""} ${(milestone.keyDrivers || []).join(" ")}`.toLowerCase();
  
  let hasKeywordMatch = false;
  if (profStr.length > 2) {
    const profWords = profStr.split(/\s+/).filter((w) => w.length > 2);
    for (const pw of profWords) {
      if (milestoneFullText.includes(pw)) {
        hasKeywordMatch = true;
        break;
      }
    }
  }

  // Cross-match via user domain synonyms if raw string was in English or alternate spelling
  if (!hasKeywordMatch && userDomains.length > 0) {
    for (const domain of userDomains) {
      const kws = DOMAIN_KEYWORDS[domain] || [];
      for (const kw of kws) {
        if (kw.length >= 3 && milestoneFullText.includes(kw)) {
          hasKeywordMatch = true;
          break;
        }
      }
      if (hasKeywordMatch) break;
    }
  }

  if (hasKeywordMatch) {
    score += 20;
  }

  // Life role and personal goal matching
  if (goalStr.length > 2) {
    if (goalStr.includes("teknoloji") || goalStr.includes("beceri")) {
      if (milestone.category === "Yapay Zeka & Bilişim" || milestone.category === "İnsan-Makine Arayüzü") {
        score += 15;
      }
    }
    if (goalStr.includes("saglik") || goalStr.includes("omur") || goalStr.includes("yaşam")) {
      if (milestone.category === "Biyoloji & Tıp" || milestone.category === "Post-İnsan & Medeniyet") {
        score += 15;
      }
    }
    if (goalStr.includes("birikim") || goalStr.includes("is_guvencesi") || goalStr.includes("finans")) {
      if (milestone.category === "Sosyoloji & Ekonomi" || milestone.impactLevel >= 85) {
        score += 15;
      }
    }
  }

  // Age factor
  if (userAgeAtMilestone !== undefined) {
    if (userAgeAtMilestone >= 16 && userAgeAtMilestone <= 58) {
      // Prime career working age & educational career entry
      if (milestone.category === "Yapay Zeka & Bilişim" || milestone.category === "Otonom & Lojistik" || milestone.category === "Sosyoloji & Ekonomi" || milestone.category === "İnsan-Makine Arayüzü") {
        score += 10;
      }
    } else if (userAgeAtMilestone > 58) {
      // Longevity and healthcare priority age
      if (milestone.category === "Biyoloji & Tıp" || milestone.category === "Post-İnsan & Medeniyet") {
        score += 15;
      }
    }
  }

  // Impact level weighting
  score += Math.round((milestone.impactLevel || 50) * 0.1);

  // Normalize score
  score = Math.min(99, Math.max(15, score));

  // Determine relevance level
  let relevanceLevel: PersonalRelevanceLevel = "low";
  if (score >= 65) {
    relevanceLevel = "high";
  } else if (score >= 40) {
    relevanceLevel = "medium";
  }

  // 3. Extract matching roadmap step if user has previously generated roadmap
  let matchingRoadmapStep: MilestonePersonalImpact["matchingRoadmapStep"] = null;
  if (roadmapRecord && roadmapRecord.generatedOutcome) {
    const outcomeText = roadmapRecord.generatedOutcome;
    // Check if this specific year or milestone is cited in roadmap
    if (outcomeText.includes(String(milestone.year)) || outcomeText.toLowerCase().includes(milestone.title.toLowerCase().slice(0, 15))) {
      matchingRoadmapStep = {
        title: `${milestone.year} Yol Haritası Entegrasyonu`,
        targetYear: milestone.year,
        action: `Kişisel yol haritanız bu dönemde (${milestone.year}) adaptasyon ve beceri yükseltme eylemi öngörüyor.`
      };
      score = Math.min(99, score + 15);
      if (score >= 60) relevanceLevel = "high";
    }
  }

  // 4. Extract job risk context if user has previously analyzed job risk
  let matchingJobRiskContext: MilestonePersonalImpact["matchingJobRiskContext"] = null;
  if (jobRiskRecord && jobRiskRecord.metrics) {
    matchingJobRiskContext = {
      riskLevel: jobRiskRecord.metrics.riskLevel || "Orta",
      automationHorizon: jobRiskRecord.targetYear ? `${jobRiskRecord.targetYear}` : "2030-2035"
    };
  }

  // 5. Generate tailored explanation strings deterministically
  const profDisplay = profile?.profession ? profile.profession : "Mevcut Mesleğiniz";
  const isStudent = profStr.includes("öğrenci") || profStr.includes("student") || profile?.lifeRole === "ogrenci" || profile?.seniority?.toLowerCase() === "entry";
  const isManager = profStr.includes("yönetici") || profStr.includes("manager") || profStr.includes("direktör") || profStr.includes("lead") || profile?.seniority?.toLowerCase() === "manager";
  const isTransition = goalStr.includes("transition") || goalStr.includes("kariyer_gecis") || goalStr.includes("gecis") || goalStr.includes("degisim") || goalStr.includes("switch");
  const isSeniorAge = (userBaseAge !== undefined && userBaseAge >= 60) || (userAgeAtMilestone !== undefined && userAgeAtMilestone >= 68);
  const isGrowthOrLeadershipGoal = goalStr.includes("büyüme") || goalStr.includes("growth") || goalStr.includes("liderlik") || goalStr.includes("kariyer gelişimi") || goalStr.includes("girişim");

  let relevanceReason = "";
  let careerImpactSummary = "";
  let opportunitySummary = "";
  let riskSummary = "";
  let preparationAdvice = "";

  if (isProfilePending) {
    score = 0;
    relevanceLevel = "low";
    matchingRoadmapStep = null;
    matchingJobRiskContext = null;
    relevanceReason = `Bu gelişme (${milestone.year}), genel küresel teknoloji ve yaşam standardını doğrudan etkileyecektir.`;
    careerImpactSummary = `Profilinizde meslek belirtildiğinde bu dönüm noktasının kariyerinize etkisi spesifik olarak hesaplanır.`;
    opportunitySummary = `Geleceğin yeni çalışma modellerine ve teknoloji araçlarına erken adapte olma imkanı.`;
    riskSummary = `Teknolojik dönüşümün gerisinde kalma ve dijital yetkinlik açığı.`;
    preparationAdvice = `Profil bilgilerinizi tamamlayarak bu dönüm noktasının doğrudan mesleğinize özel etkilerini açabilirsiniz.`;
  } else if (relevanceLevel === "high") {
    if (isStudent) {
      relevanceReason = `Bu gelişme, gelecekte adım atacağınız ${profDisplay} alanındaki iş tanımlarını ve aranan temel yetkinlikleri bugünden dönüştürmektedir.`;
      careerImpactSummary = `${milestone.year} itibarıyla ${profDisplay} olarak eğitim ve kariyer başlangıcınızda bu teknoloji sektörün varsayılan standardı olacaktır; geleneksel manuel görevler yerine yeni nesil araçları yöneten profiller tercih edilecektir.`;
      opportunitySummary = `Eski çalışma alışkanlıklarının kısıtlaması olmadan, doğrudan ${milestone.category} odaklı modern araçlarla proje geliştirerek erken uzmanlık ve güçlü bir portfolyo oluşturma fırsatı.`;
      riskSummary = `Yalnızca geleneksel müfredatla yetinmek, mezuniyet sonrası işgücü piyasasında otonom araç beklentilerine uyum sağlamayı geciktirebilir.`;
      preparationAdvice = `Eğitim sürecinizde bu teknolojiye ait pratik yapay zeka araçlarını, açık kaynak kodları ve uygulamalı projeleri kişisel portfolyonuza ekleyin.`;
    } else if (isManager) {
      relevanceReason = `Bu gelişme, ${profDisplay} rolünüzde yönettiğiniz ekiplerin, süreçlerin ve organizasyonel karar mekanizmalarının yapısını kökten dönüştürmektedir.`;
      careerImpactSummary = `${milestone.year} itibarıyla ${profDisplay} olarak sorumluluğunuz bireysel operasyonel görevlerden ziyade, ekiplerin ve otonom sistemlerin stratejik orkestrasyonuna ve yönetişimine odaklanacaktır.`;
      opportunitySummary = `Ekip üretkenliğini çarpan etkisiyle artıran otonom iş akışlarını tasarlama, teknoloji yönetişimini sağlama ve stratejik dönüşüm lideri olma fırsatı.`;
      riskSummary = `Yalnızca geleneksel manuel süreç denetimine odaklanmak, organizasyonel çevikliği ve stratejik pazar rekabet gücünü zayıflatabilir.`;
      preparationAdvice = `Kurumunuzun stratejik yol haritasına yapay zeka yönetişimi, otonom ekip orkestrasyonu ve dönüşüm hedeflerini entegre edin.`;
    } else if (isTransition) {
      relevanceReason = `Bu gelişme, hedeflediğiniz kariyer geçişinde aranan temel dijital becerileri ve yeni sektör dinamiklerini doğrudan şekillendirmektedir.`;
      careerImpactSummary = `${profDisplay} alanından hedeflediğiniz yeni kariyer geçiş sürecinizde bu teknoloji, aktarılabilir yetkinliklerinizi ve geçiş hızınızı doğrudan belirleyecektir.`;
      opportunitySummary = `Geleneksel uzmanlık bariyerlerini yapay zeka hızlandırıcılarıyla aşarak, aktarılabilir yetkinliklerle hedef sektörde melez ve yenilikçi bir pozisyona hızla yerleşme fırsatı.`;
      riskSummary = `Geçiş planlarken eski sektörün alışkanlıklarına takılmak veya hedef alanın teknolojik dönüşüm hızını hafife almak adaptasyonu zorlaştırabilir.`;
      preparationAdvice = `Mevcut tecrübeniz ile hedef sektör arasında köprü kuracak ${milestone.category} araçlarını pilot projelerde deneyin.`;
    } else if (isSeniorAge) {
      if (isGrowthOrLeadershipGoal) {
        relevanceReason = `Bu gelişme, ${profDisplay} alanındaki onlarca yıllık birikiminizi otonom sistemlerin üst düzey yönetişimi, karar mimarlığı ve stratejik büyüme liderliğine taşımanızı destekler.`;
        careerImpactSummary = `${milestone.year} itibarıyla ${profDisplay} olarak derin sektörel tecrübeniz, operasyonel icradan ziyade otonom sistemlerin stratejik orkestrasyonunda ve büyüme hedeflerinde kritik yönlendirici olacaktır.`;
        opportunitySummary = `Onlarca yıllık alan birikimini yeni nesil otonom sistemlerin yönetişiminde ve üst düzey karar mercilerinde liderlik rolüne dönüştürme fırsatı.`;
        riskSummary = `Yeni nesil algoritmik sistemlerin çalışma mantığını yönetişim seviyesinde kavramamak, stratejik teknoloji liderliği pozisyonunu zayıflatabilir.`;
        preparationAdvice = `Yapay zeka yönetişimi, algoritmik risk denetimi ve üst düzey sistem mimarisi araçlarını stratejik karar rutininize entegre edin.`;
      } else {
        relevanceReason = `Bu gelişme, ${profDisplay} birikiminizin operasyonel icradan stratejik danışmanlık, mentorluk ve yaşam kalitesi yönetimine evrilmesini destekler.`;
        careerImpactSummary = `${milestone.year} itibarıyla ${profDisplay} deneyiminiz, operasyonel iş yükünden ziyade stratejik denetim, etik danışmanlık ve sermaye/yaşam koruma ekseninde yüksek katma değer üretecektir.`;
        opportunitySummary = `Onlarca yıllık birikiminizi yeni nesil otonom sistemlerin yönlendirilmesinde ve etik danışmanlıkta değerlendirme fırsatı.`;
        riskSummary = `Dijital arayüzleri ve sağlık/finans teknolojilerindeki yenilikleri takip etmemek, bağımsız karar alma konforunu sınırlandırabilir.`;
        preparationAdvice = `Kişisel yaşam konforunuzu, biyolojik sağlığınızı ve danışmanlık kanallarınızı destekleyen dijital araçları benimseyin.`;
      }
    } else {
      relevanceReason = `Bu gelişme, ${profDisplay} alanındaki iş yapış biçimlerini ve temel iş tanımlarını kökten dönüştürecek seviyededir.`;
      careerImpactSummary = `${milestone.year} itibarıyla ${profDisplay} sorumluluklarının önemli bir bölümü otonom sistemlerle entegre çalışacaktır.`;
      opportunitySummary = `Bu teknolojiyi erkenden benimseyen profesyoneller, sektörde 'süper-uzman' veya 'otonom sistem yöneticisi' statüsüne yükselebilir.`;
      riskSummary = `Geleneksel metodlarda diretmek, görev otomasyonu karşısında pazar değerinin düşmesine neden olabilir.`;
      preparationAdvice = `${Math.max(2026, milestone.year - 3)}–${milestone.year} döneminde bu teknolojiye özgü yapay zeka ve arayüz araçlarını iş akışınıza dahil edin.`;
    }
  } else if (relevanceLevel === "medium") {
    if (isStudent) {
      relevanceReason = `Bu gelişme, gelecekteki kariyer opsiyonlarınızı genişletecek ve sektörler arası dijital geçişleri kolaylaştıracaktır.`;
      careerImpactSummary = `${profDisplay} olarak gelecekteki çalışma ekosisteminizde verimliliği artıran tamamlayıcı bir altyapı olarak karşınıza çıkacaktır.`;
      opportunitySummary = `Farklı disiplinler arası geçişlerde ve modern dijital araçlarda erken farkındalık kazanma fırsatı.`;
      riskSummary = `Araç çeşitliliğini takip etmemek, çok yönlü portfolyo rekabetinde hız avantajını azaltabilir.`;
      preparationAdvice = `Bu dönüm noktasına ilişkin kavramsal araçları takip listenize ekleyerek genel teknoloji okuryazarlığınızı güçlendirin.`;
    } else if (isManager) {
      relevanceReason = `Bu gelişme, kurum içi süreçlerin dijital optimizasyonunda ve operasyonel verimlilik hedeflerinde rol oynayacaktır.`;
      careerImpactSummary = `${profDisplay} olarak süreç optimizasyonu ve ekiplerin karar hızını artıran destekleyici bir kurumsal altyapı oluşturacaktır.`;
      opportunitySummary = `Departmanlar arası verimliliği optimize eden çözümleri erken test etme potansiyeli.`;
      riskSummary = `Sektörel dijital dönüşümleri geç fark etmek, operasyonel maliyetlerin optimize edilmesini geciktirebilir.`;
      preparationAdvice = `Kurumunuzun yıllık teknoloji bütçesi ve verimlilik planlamasında bu gelişmeyi izlemeye alın.`;
    } else {
      relevanceReason = `Bu gelişme, ${profDisplay} alanını doğrudan ortadan kaldırmasa da dolaylı olarak sektörel verimliliği artıracaktır.`;
      careerImpactSummary = `${profDisplay} iş süreçlerinizde hız ve karar alma kalitesini etkileyen tamamlayıcı bir altyapı olarak hayatınıza girecektir.`;
      opportunitySummary = `Sektörler arası geçişlerde ve dijital optimizasyon projelerinde öncü rol üstlenme potansiyeli.`;
      riskSummary = `Yeni araç standartlarını öğrenmemek, genç nesil rakipler karşısında hız avantajını kaybettirebilir.`;
      preparationAdvice = `${milestone.year} öncesinde ilgili alanın temel ilkelerini ve dijital araçlarını takip listesine alın.`;
    }
  } else {
    relevanceReason = `Bu gelişme, küresel medeniyet ve teknoloji altyapısını dönüştüren makro bir adımdır; mesleğiniz üzerindeki doğrudan baskısı düşüktür.`;
    careerImpactSummary = `${profDisplay} kariyerinizin günlük operasyonunu doğrudan kesintiye uğratmaz; yaşam kalitesi ve tüketici deneyimi olarak yansır.`;
    opportunitySummary = `Genişleyen teknoloji ekosisteminden genel yatırım ve yaşam konforu avantajları sağlama fırsatı.`;
    riskSummary = `${profDisplay} alanı için acil bir operasyonel tehlike oluşturmasa da makro dalgalanmalar takip edilmelidir.`;
    preparationAdvice = `Dönüm noktasının genel gidişatını takip etmek ve kişisel finans/sağlık kararlarınızı buna göre planlamak yeterlidir.`;
  }

  return {
    relevanceScore: score,
    relevanceLevel,
    relevanceReason,
    userAgeAtMilestone,
    careerImpactSummary,
    opportunitySummary,
    riskSummary,
    preparationAdvice,
    isProfilePending,
    matchingRoadmapStep,
    matchingJobRiskContext
  };
}

/**
 * Returns timeline milestones mapped with their personal impacts.
 * Supports filtering for high-relevance milestones without breaking chronological order.
 */
export function getPersonalizedTimelineMilestones(
  milestones: Milestone[],
  profile?: UserProfile | null,
  roadmapRecord?: PredictionHistoryRecord | null,
  jobRiskRecord?: PredictionHistoryRecord | null,
  options?: { onlyHighRelevance?: boolean }
): Array<{ milestone: Milestone; impact: MilestonePersonalImpact }> {
  const mapped = (milestones || []).map((m) => ({
    milestone: m,
    impact: calculateMilestonePersonalImpact(m, profile, roadmapRecord, jobRiskRecord)
  }));

  if (options?.onlyHighRelevance) {
    return mapped.filter((item) => item.impact.relevanceLevel === "high" || item.impact.relevanceLevel === "medium");
  }

  return mapped;
}

// ─────────────────────────────────────────────────────────────────────────────
// PHASE 18: Live Intelligence (Telegram / Signals) Personalization Engine
// ─────────────────────────────────────────────────────────────────────────────

export interface LiveIntelligenceSignal {
  id: string;
  title?: string;
  summary?: string;
  originalText?: string;
  extractedYear?: number;
  category?: string;
  channelTitle?: string;
  trlLevel?: number;
  confidenceScore?: number;
  impactVerdict?: string;
  sourceUrl?: string;
  receivedAt?: string;
  [key: string]: any;
}

export interface TelegramSignalPersonalImpact {
  relevanceScore: number; // 0 - 100
  relevanceLevel: PersonalRelevanceLevel; // "high" | "medium" | "low"
  relevanceReason: string;
  careerImpactSummary: string;
  actionableAdvice: string;
  opportunityOrRisk: "opportunity" | "risk" | "neutral" | "dual";
  urgencyLevel: "urgent" | "moderate" | "monitoring";
  matchedMilestone?: {
    year: number;
    title: string;
    category: string;
  } | null;
  userAgeAtImpact?: number;
  isProfilePending: boolean;
}

// ─────────────────────────────────────────────────────────────────────────────
// PHASE 41: Epistemic Milestone Assumption Delta Engine
// Analyzes HOW a live intelligence signal changes the future assumption of a milestone:
// ACCELERATES, DELAYS, SUPPORTS, CONTRADICTS, EXPANDS, NARROWS, RISK_ESCALATING, etc.
// ─────────────────────────────────────────────────────────────────────────────

export type MilestoneSignalImpactType =
  | "ACCELERATES"
  | "DELAYS"
  | "SUPPORTS"
  | "CONTRADICTS"
  | "EXPANDS"
  | "NARROWS"
  | "RISK_ESCALATING"
  | "OPPORTUNITY_OPENING"
  | "UNCERTAINTY_RESOLVING"
  | "UNCERTAINTY_RAISING";

export interface MilestoneAssumptionDelta {
  impactType: MilestoneSignalImpactType;
  impactTypeLabel: string;
  badgeColor: string;
  rationale: string;
  temporalShiftEstimateYears: number; // e.g. -1 (1 year early), +2 (2 years delay), 0 (on track)
  confidenceShift: number; // e.g. +12, -10
  affectedUserSegments: string[];
  riskDelta: "INCREASED" | "DECREASED" | "NEUTRAL";
  opportunityDelta: "EXPANDED" | "UNCHANGED" | "RESTRICTED";
  recommendedActionAdjustment: string;
}

/**
 * Deterministically evaluates how a live intelligence signal shifts the milestone's future assumption.
 * Strictly model-heuristic and signal-grounded. Zero hallucinated numbers.
 */
export function assessMilestoneSignalEpistemicImpact(
  signal: LiveIntelligenceSignal,
  milestone?: Milestone | null
): MilestoneAssumptionDelta {
  const signalText = `${signal.title || ""} ${signal.summary || ""} ${signal.originalText || ""}`.toLowerCase();
  const trl = signal.trlLevel || 5;
  const isHighBreakthrough = signal.impactVerdict === "HIGH_BREAKTHROUGH" || trl >= 7;

  // 1. Check DELAYS keywords
  const delayKeywords = [
    "darboğaz", "gecikme", "ertelendi", "yavaşlama", "yetersiz altyapı", "maliyet krizi",
    "fiyasko", "termal sorun", "üretim durduruldu", "bottleneck", "delay", "postponed", "setback"
  ];
  const isDelayed = delayKeywords.some((kw) => signalText.includes(kw));

  // 2. Check CONTRADICTS / CHALLENGES keywords
  const contradictKeywords = [
    "çürütüldü", "başarısız", "çelişiyor", "reddedildi", "alternatif teknoloji geride bıraktı",
    "işe yaramadı", "beklentiyi karşılamadı", "refuted", "failed", "debunked", "unviable"
  ];
  const isContradicted = contradictKeywords.some((kw) => signalText.includes(kw));

  // 3. Check NARROWS keywords
  const narrowKeywords = [
    "dar kapsam", "yalnızca niş", "laboratuvarla sınırlı", "genel üretime uygun değil",
    "özel kullanım", "niche only", "limited scope"
  ];
  const isNarrowed = narrowKeywords.some((kw) => signalText.includes(kw));

  // 4. Check RISK_ESCALATING keywords
  const riskKeywords = [
    "güvenlik açığı", "tehdit", "kriz", "etik alarm", "silahlanma", "siber saldırı",
    "zararlı", "tehlikeli", "biyolojik risk", "vulnerability", "threat", "danger", "escalation"
  ];
  const isRiskEscalating = riskKeywords.some((kw) => signalText.includes(kw));

  // 5. Check ACCELERATES keywords / conditions
  const accelerateKeywords = [
    "breakthrough", "devrim", "pilot üretim", "hızlandırıldı", "beklenenden önce",
    "saha denemesi", "fda onay", "onaylandı", "seri üretim", "pazara çıktı",
    "rekor verim", "commercial", "production ready", "milestone achieved"
  ];
  const isAccelerated = (isHighBreakthrough || accelerateKeywords.some((kw) => signalText.includes(kw))) && !isDelayed && !isContradicted;

  // 6. Check OPPORTUNITY_OPENING keywords
  const oppKeywords = [
    "yeni sektör", "yeni pazarlar", "fırsat kapısı", "istihdam artışı", "yeni meslekler",
    "gelir artışı", "demokratikleşme", "new market", "job creation"
  ];
  const isOpportunityOpening = oppKeywords.some((kw) => signalText.includes(kw));

  // 7. Check UNCERTAINTY_RAISING keywords
  const uncertaintyRaisingKeywords = [
    "belirsizlik", "çelişkili sonuç", "tartışma sürüyor", "netleşmedi", "şüphe",
    "uncertainty", "disputed", "inconclusive"
  ];
  const isUncertaintyRaising = uncertaintyRaisingKeywords.some((kw) => signalText.includes(kw));

  // 8. Check UNCERTAINTY_RESOLVING keywords
  const uncertaintyResolvingKeywords = [
    "kesinleşti", "doğrulandı", "kanıtlandı", "standartlaştı", "üretim kanıtı",
    "replicated", "proven", "standardized", "verified"
  ];
  const isUncertaintyResolving = uncertaintyResolvingKeywords.some((kw) => signalText.includes(kw));

  // 9. Check EXPANDS keywords
  const expandKeywords = [
    "kapsam genişledi", "çok sektörlü", "yeni alanlara uygulandı", "evrensel uyumluluk",
    "cross-domain", "expanded scope", "universal"
  ];
  const isExpanded = expandKeywords.some((kw) => signalText.includes(kw));

  // Determine Primary Impact
  let impactType: MilestoneSignalImpactType = "SUPPORTS";
  let impactTypeLabel = "Destekliyor (Doğrulayıcı Kanıt)";
  let badgeColor = "bg-emerald-500/20 text-emerald-300 border-emerald-500/40";
  let temporalShiftEstimateYears = 0;
  let confidenceShift = +5;
  let riskDelta: MilestoneAssumptionDelta["riskDelta"] = "NEUTRAL";
  let opportunityDelta: MilestoneAssumptionDelta["opportunityDelta"] = "UNCHANGED";
  let rationale = "Gelen canlı kanıt ve yayınlanan veriler, bu dönüm noktasının beklenen takvimde ilerlediğini teyit etmektedir.";
  let recommendedActionAdjustment = "Mevcut hazırlık planınızı koruyun; takvim öngörülen rotada ilerliyor.";

  if (isDelayed) {
    impactType = "DELAYS";
    impactTypeLabel = "Geciktiriyor (Darboğaz / Takvim Ötelenmesi ⏳)";
    badgeColor = "bg-amber-500/20 text-amber-300 border-amber-500/40";
    temporalShiftEstimateYears = +1;
    confidenceShift = -10;
    riskDelta = "INCREASED";
    rationale = "Gelişmede belirtilen teknik/lojistik darboğazlar, ticarileşme ve kitlesel adaptasyon takviminde ötelenme baskısı oluşturmaktadır.";
    recommendedActionAdjustment = "Bu alana yapılacak agresif sermaye ve zaman yatırımını temkinli kademelendirin; alternatif hibrit araçlara yönelin.";
  } else if (isContradicted) {
    impactType = "CONTRADICTS";
    impactTypeLabel = "Zayıflatıyor (Varsayımla Çelişen Sinyal ⚠️)";
    badgeColor = "bg-rose-500/20 text-rose-300 border-rose-500/40";
    temporalShiftEstimateYears = +2;
    confidenceShift = -15;
    riskDelta = "INCREASED";
    rationale = "Sinyaldeki bulgular, dönüm noktasının dayandığı temel metodolojinin bekleneni veremediğini veya rakip teknolojilerce baypas edildiğini göstermektedir.";
    recommendedActionAdjustment = "Bu teknoloji varsayımına dayalı yol haritanızı revize edin; alternatif Yol A/B seçeneklerini inceleyin.";
  } else if (isAccelerated) {
    impactType = "ACCELERATES";
    impactTypeLabel = "Hızlandırıyor (Takvim İvmelenmesi ⚡)";
    badgeColor = "bg-cyan-500/20 text-cyan-300 border-cyan-500/40";
    temporalShiftEstimateYears = -1;
    confidenceShift = +12;
    opportunityDelta = "EXPANDED";
    rationale = `Canlı istihbarat (TRL ${trl}/9), endüstriyel pilot veya onay sürecinin beklentilerden daha hızlı olgunlaştığını kanıtlamaktadır. Hedef yıl 1-2 yıl erkene çekilebilir.`;
    recommendedActionAdjustment = "Yetkinlik edinme ve pilot portfolyo inşası sürecinizi 3 ay öne çekin; erken adaptasyon avantajı yakalayın.";
  } else if (isRiskEscalating) {
    impactType = "RISK_ESCALATING";
    impactTypeLabel = "Yeni Risk Doğuruyor (Güvenlik / Regülasyon Riski 🛡️)";
    badgeColor = "bg-orange-500/20 text-orange-300 border-orange-500/40";
    temporalShiftEstimateYears = 0;
    confidenceShift = -5;
    riskDelta = "INCREASED";
    rationale = "Gelişme yeni bir siber, etik veya regülatif kriz alanı açarak kullanım şartlarını sıkılaştırabilir.";
    recommendedActionAdjustment = "Güvenlik protokollerini, uyumluluk gereksinimlerini ve savunma odaklı pratikleri eylem planınıza ekleyin.";
  } else if (isOpportunityOpening) {
    impactType = "OPPORTUNITY_OPENING";
    impactTypeLabel = "Yeni Fırsat Açıyor (Sektörel Genişleme 🚀)";
    badgeColor = "bg-purple-500/20 text-purple-300 border-purple-500/40";
    temporalShiftEstimateYears = 0;
    confidenceShift = +8;
    opportunityDelta = "EXPANDED";
    rationale = "Teknoloji yeni ticari pazarlar ve mesleki uzmanlık alanları yaratarak istihdam fırsatlarını artırmaktadır.";
    recommendedActionAdjustment = "Bu yeni açılan niş alanda vaka ve hizmet üretimi planlayın; Yol C öncü konumlanmasını değerlendirin.";
  } else if (isUncertaintyRaising) {
    impactType = "UNCERTAINTY_RAISING";
    impactTypeLabel = "Belirsizliği Artırıyor (Çelişkili Görüşler ❓)";
    badgeColor = "bg-yellow-500/20 text-yellow-300 border-yellow-500/40";
    temporalShiftEstimateYears = 0;
    confidenceShift = -8;
    rationale = "Farklı araştırma merkezlerinden gelen çelişkili veriler, bu alandaki olgunlaşma rotasında belirsizliği tırmandırmıştır.";
    recommendedActionAdjustment = "Gözlem modunda kalın (Monitoring); 30 gün içinde gelecek bağımsız replikasyonları bekleyin.";
  } else if (isUncertaintyResolving) {
    impactType = "UNCERTAINTY_RESOLVING";
    impactTypeLabel = "Belirsizliği Gideriyor (Metodolojik Netleşme 🎯)";
    badgeColor = "bg-teal-500/20 text-teal-300 border-teal-500/40";
    temporalShiftEstimateYears = 0;
    confidenceShift = +10;
    opportunityDelta = "EXPANDED";
    rationale = "Önceki şüpheler bağımsız replikasyon veya standartlaşma ile giderilmiş, modelin güvenilirliği pekişmiştir.";
    recommendedActionAdjustment = "Tereddüt etmeden eylem adımlarınızı yürürlüğe koyun; teknoloji temeli doğrulanmıştır.";
  } else if (isExpanded) {
    impactType = "EXPANDS";
    impactTypeLabel = "Kapsamını Genişletiyor (Çok Sektörlü Entegrasyon 🌐)";
    badgeColor = "bg-indigo-500/20 text-indigo-300 border-indigo-500/40";
    temporalShiftEstimateYears = 0;
    confidenceShift = +7;
    opportunityDelta = "EXPANDED";
    rationale = "Teknolojinin uygulama alanı tek bir sektörle sınırlı kalmayıp çapraz disiplinlere genişlemiştir.";
    recommendedActionAdjustment = "Kendi sektörünüz dışındaki temas noktalarını da haritalandırın.";
  } else if (isNarrowed) {
    impactType = "NARROWS";
    impactTypeLabel = "Kapsamını Daraltıyor (Niş Uygulama Sınırı 🔬)";
    badgeColor = "bg-stone-500/20 text-stone-300 border-stone-500/40";
    temporalShiftEstimateYears = +1;
    confidenceShift = -5;
    opportunityDelta = "RESTRICTED";
    rationale = "Pratik saha testleri, teknolojinin sadece çok özel koşullarda uygulanabildiğini ortaya koymuştur.";
    recommendedActionAdjustment = "Genel beklentileri daraltıp yalnızca geçerli niş senaryolara odaklanın.";
  }

  // Determine affected segments based on category
  const cat = (milestone?.category || signal.category || "").toLowerCase();
  const affectedUserSegments: string[] = [];
  if (cat.includes("yapay") || cat.includes("bilişim")) {
    affectedUserSegments.push("Yazılım & Yapay Zeka Mühendisleri", "Veri Analistleri", "Ürün Yöneticileri");
  } else if (cat.includes("biyoloji") || cat.includes("tıp")) {
    affectedUserSegments.push("Klinisyenler & Doktorlar", "Biyoteknoloji Araştırmacıları", "Sağlık Girişimcileri");
  } else if (cat.includes("enerji") || cat.includes("çevre")) {
    affectedUserSegments.push("Enerji Mühendisleri", "Sürdürülebilirlik Danışmanları", "Otomotiv & Batarya Uzmanları");
  } else if (cat.includes("kuantum") || cat.includes("güvenlik")) {
    affectedUserSegments.push("Siber Güvenlik Uzmanları", "Kriptografi Araştırmacıları", "Finans & Bankacılık Altyapı Ekipleri");
  } else if (cat.includes("otonom") || cat.includes("lojistik")) {
    affectedUserSegments.push("Robotik Mühendisleri", "Tedarik Zinciri Yöneticileri", "Saha Operasyon Ekipleri");
  } else {
    affectedUserSegments.push("Strateji Yöneticileri", "Teknoloji Danışmanları", "Kariyer Değişimi Arayanlar");
  }

  return {
    impactType,
    impactTypeLabel,
    badgeColor,
    rationale,
    temporalShiftEstimateYears,
    confidenceShift,
    affectedUserSegments,
    riskDelta,
    opportunityDelta,
    recommendedActionAdjustment,
  };
}

/**
 * Calculates deterministic personal impact of a live intelligence / Telegram signal.
 * ZERO API calls, ZERO credits, ZERO side-effects.
 */
export function calculateTelegramSignalPersonalImpact(
  signal: LiveIntelligenceSignal,
  profile?: UserProfile | null,
  roadmapRecord?: PredictionHistoryRecord | null,
  jobRiskRecord?: PredictionHistoryRecord | null,
  allMilestones?: Milestone[]
): TelegramSignalPersonalImpact {
  const isProfilePending = !profile || !profile.profession || profile.profession.trim().length === 0;

  const currentYear = 2026;
  const targetYear = signal.extractedYear && signal.extractedYear >= 2026 && signal.extractedYear <= 2060
    ? signal.extractedYear
    : 2026;

  const userBaseAge = profile?.age && profile.age >= 10 && profile.age <= 100 ? profile.age : undefined;
  const userAgeAtImpact = userBaseAge !== undefined ? userBaseAge + Math.max(0, targetYear - currentYear) : undefined;

  const profStr = (profile?.profession || "").toLowerCase().trim();
  const goalStr = `${profile?.primaryGoal || ""} ${profile?.personalGoal || ""} ${profile?.primaryGoalLabel || ""}`.toLowerCase().trim();
  const industryStr = (profile?.industrySector || "").toLowerCase().trim();
  const combinedUserText = `${profStr} ${industryStr}`;

  // 1. Detect matching domain clusters
  const userDomains: string[] = [];
  for (const [domainKey, keywords] of Object.entries(DOMAIN_KEYWORDS)) {
    for (const kw of keywords) {
      if (combinedUserText.includes(kw)) {
        userDomains.push(domainKey);
        break;
      }
    }
  }

  // 2. Score calculation (0 - 100)
  let score = 20; // Base score for any live event

  // Category matching
  const signalCat = signal.category || "";
  const matchingDomains = CATEGORY_ALIGNMENTS[signalCat] || [];
  const hasCategoryMatch = userDomains.some((d) => matchingDomains.includes(d));
  if (hasCategoryMatch) {
    score += 35;
  }

  // Text keyword cross-matching
  const signalFullText = `${signal.title || ""} ${signal.summary || ""} ${signal.originalText || ""}`.toLowerCase();
  if (profStr.length > 2) {
    const profWords = profStr.split(/\s+/).filter((w) => w.length > 2);
    for (const pw of profWords) {
      if (signalFullText.includes(pw)) {
        score += 25;
        break;
      }
    }
  }

  // Goal matching
  if (goalStr.length > 2) {
    if (goalStr.includes("teknoloji") || goalStr.includes("beceri")) {
      if (signalCat === "Yapay Zeka & Bilişim" || signalCat === "İnsan-Makine Arayüzü") {
        score += 10;
      }
    }
    if (goalStr.includes("saglik") || goalStr.includes("omur") || goalStr.includes("yaşam")) {
      if (signalCat === "Biyoloji & Tıp" || signalCat === "Post-İnsan & Medeniyet") {
        score += 10;
      }
    }
  }

  // TRL and impact bonus
  if (signal.impactVerdict === "HIGH_BREAKTHROUGH") {
    score += 10;
  }
  if (signal.trlLevel && signal.trlLevel >= 6) {
    score += 5;
  }

  // Roadmap & Job Risk synergy
  if (roadmapRecord?.generatedOutcome) {
    const outcome = roadmapRecord.generatedOutcome.toLowerCase();
    if (outcome.includes(String(targetYear)) || (signal.title && outcome.includes(signal.title.toLowerCase().slice(0, 10)))) {
      score += 15;
    }
  }

  if (jobRiskRecord?.metrics?.riskLevel === "Yüksek" && hasCategoryMatch) {
    score += 10;
  }

  // Normalize score between 15 and 99
  score = Math.min(99, Math.max(15, score));

  // Determine relevance level
  let relevanceLevel: PersonalRelevanceLevel = "low";
  if (score >= 65) {
    relevanceLevel = "high";
  } else if (score >= 40) {
    relevanceLevel = "medium";
  }

  // 3. Match with timeline milestone
  let matchedMilestone: TelegramSignalPersonalImpact["matchedMilestone"] = null;
  if (allMilestones && allMilestones.length > 0) {
    const exactMatch = allMilestones.find((m) => m.year === targetYear && m.category === signalCat);
    if (exactMatch) {
      matchedMilestone = {
        year: exactMatch.year,
        title: exactMatch.title,
        category: exactMatch.category
      };
    } else {
      const catMatches = allMilestones.filter((m) => m.category === signalCat);
      if (catMatches.length > 0) {
        const closest = catMatches.reduce((prev, curr) =>
          Math.abs(curr.year - targetYear) < Math.abs(prev.year - targetYear) ? curr : prev
        );
        matchedMilestone = {
          year: closest.year,
          title: closest.title,
          category: closest.category
        };
      } else {
        const yearMatch = allMilestones.find((m) => m.year === targetYear);
        if (yearMatch) {
          matchedMilestone = {
            year: yearMatch.year,
            title: yearMatch.title,
            category: yearMatch.category
          };
        }
      }
    }
  }

  // 4. Determine Opportunity vs Risk
  const riskWords = ["otomasyon", "risk", "iş kaybı", "tehdit", "kriz", "yerini alacak", "otomatikleştirme", "disruption", "danger", "layoff"];
  const oppWords = ["fırsat", "verimlilik", "destek", "yardımcı", "büyüme", "yeni alan", "atılım", "keşif", "opportunity", "breakthrough"];

  const hasRisk = riskWords.some((w) => signalFullText.includes(w));
  const hasOpp = oppWords.some((w) => signalFullText.includes(w));

  let opportunityOrRisk: TelegramSignalPersonalImpact["opportunityOrRisk"] = "neutral";
  if (hasRisk && hasOpp) opportunityOrRisk = "dual";
  else if (hasRisk) opportunityOrRisk = "risk";
  else if (hasOpp) opportunityOrRisk = "opportunity";

  // 5. Determine Urgency Level
  let urgencyLevel: TelegramSignalPersonalImpact["urgencyLevel"] = "monitoring";
  if (targetYear <= 2028 && relevanceLevel === "high") {
    urgencyLevel = "urgent";
  } else if (targetYear <= 2035 && (relevanceLevel === "high" || relevanceLevel === "medium")) {
    urgencyLevel = "moderate";
  }

  // 6. Tailored narrative summaries
  const profDisplay = profile?.profession ? profile.profession : "Mevcut Mesleğiniz";
  let relevanceReason = "";
  let careerImpactSummary = "";
  let actionableAdvice = "";

  if (isProfilePending) {
    score = 0;
    relevanceLevel = "low";
    relevanceReason = `Bu gelişme küresel teknoloji ve sektör akışlarında yeni bir sinyaldir.`;
    careerImpactSummary = `Profilinizde meslek ve uzmanlık alanı tanımlandığında haberin mesleğinize özel kariyer etkisi hesaplanır.`;
    actionableAdvice = `Profil bilgilerinizi tamamlayarak bu canlı gelişmenin çalışma hayatınıza doğrudan etkisini görebilirsiniz.`;
  } else if (relevanceLevel === "high") {
    relevanceReason = `Bu gelişme, doğrudan ${profDisplay} alanının çalışma yöntemleri ve teknolojik araçlarıyla kesişmektedir.`;
    careerImpactSummary = `${targetYear} yılına kadar ${profDisplay} rollerinde kullanılan araç ve yetkinlik setinde önemli bir dönüşüm yaratabilir.`;
    actionableAdvice = `Bu gelişmede bahsedilen araçları ve yöntemleri iş akışınıza entegre etmeye başlayın; sektörde erken adaptasyon avantajı yakalayın.`;
  } else if (relevanceLevel === "medium") {
    relevanceReason = `Bu gelişme, ${profDisplay} sektörüyle dolaylı bağlantılıdır ve operasyonel verimliliği etkileyebilir.`;
    careerImpactSummary = `Doğrudan işinizi ikame etmez ancak iş ortaklarınız veya sektör paydaşlarınızın beklentilerini değiştirebilir.`;
    actionableAdvice = `Gelişmenin olgunlaşma sürecini (TRL seviyesini) takipte kalın ve sektörel pilot uygulamaları izleyin.`;
  } else {
    relevanceReason = `Bu gelişme makro bir teknoloji adımıdır; mesleğiniz üzerinde ani veya doğrudan bir etkisi öngörülmemektedir.`;
    careerImpactSummary = `Kariyerinizin günlük pratiklerinde doğrudan kesinti yaratmaz, genel tüketici veya teknoloji kullanıcısı olarak faydalanabilirsiniz.`;
    actionableAdvice = `Genel bilgi birikimi amacıyla gelişmeyi izleme listenizde tutabilirsiniz.`;
  }

  return {
    relevanceScore: score,
    relevanceLevel,
    relevanceReason,
    careerImpactSummary,
    actionableAdvice,
    opportunityOrRisk,
    urgencyLevel,
    matchedMilestone,
    userAgeAtImpact,
    isProfilePending
  };
}

/**
 * Returns live intelligence signals mapped with personal impacts.
 * Supports filtering for high/medium relevance and sorting by score.
 */
export function getPersonalizedTelegramSignals(
  signals: LiveIntelligenceSignal[],
  profile?: UserProfile | null,
  roadmapRecord?: PredictionHistoryRecord | null,
  jobRiskRecord?: PredictionHistoryRecord | null,
  allMilestones?: Milestone[],
  options?: { onlyHighRelevance?: boolean; sortByScore?: boolean }
): Array<{ signal: LiveIntelligenceSignal; impact: TelegramSignalPersonalImpact }> {
  const mapped = (signals || []).map((signal) => ({
    signal,
    impact: calculateTelegramSignalPersonalImpact(signal, profile, roadmapRecord, jobRiskRecord, allMilestones)
  }));

  let result = mapped;

  if (options?.onlyHighRelevance) {
    result = result.filter(
      (item) => item.impact.relevanceLevel === "high" || item.impact.relevanceLevel === "medium"
    );
  }

  if (options?.sortByScore !== false) {
    result.sort((a, b) => b.impact.relevanceScore - a.impact.relevanceScore);
  }

  return result;
}

// ─────────────────────────────────────────────────────────────────────────────
// PHASE 20: “PEKİ ŞİMDİ NE YAPMALIYIM?” — ACTION HORIZON & TRACKING CYCLE
// ─────────────────────────────────────────────────────────────────────────────

export type ActionProgressStatus = "seen" | "planned" | "in_progress" | "completed";

export interface MilestoneActionPlanOption {
  optionId: "A" | "B" | "C";
  title: string;
  approach: string;
  riskLevel: "Düşük" | "Orta" | "Yüksek";
  expectedYield: string;
  reversibility: string;
  requiredSkills: string[];
}

export interface MilestoneActionPlan {
  urgencyBand: "immediate" | "near_term" | "mid_term" | "long_term";
  urgencyTitle: string;
  urgencySubtitle: string;
  timelinePhaseText: string;
  concreteAction: string;
  actionType: "skill_acquisition" | "workflow_integration" | "strategic_positioning" | "life_longevity";
  actionTypeLabel: string;
  roadmapLinkStatus: "linked_to_existing_plan" | "ready_to_add_to_plan";
  roadmapActionText: string;
  keyCapability: string;
  preparationHorizon: string;
  reviewCheckpoint: string;
  recommendationProvenance: "model_profile_derived" | "deterministic_projection";
  userAgeAtMilestone?: number;
  isProfilePending?: boolean;
  recommendedMilestoneFocus?: string;
  what?: string;
  why?: string;
  forWhom?: string;
  expectedValue?: string;
  timeCost?: string;
  risk?: string;
  reversibility?: string;
  reviewDate?: string;
  decisionOptions?: MilestoneActionPlanOption[];
  selectedOptionId?: "A" | "B" | "C";
  selectedOption?: MilestoneActionPlanOption;
  userDecision?: "A" | "B" | "C" | null;
  modelRecommendation?: "A" | "B" | "C";
  recommendedOption?: "A" | "B" | "C";
  decisionHistory?: MilestoneDecisionHistoryEntry[];
  outcomeSemantics?: OutcomeSemanticsType;
  dynamicImpactAssessment?: DynamicImpactAssessment;
  isExplicitUserChoice?: boolean;
  actionStatus?: ActionProgressStatus;
  // outcomeStage represents workflow progress.
  // Note: "completed_mastery" is kept strictly for backward compatibility when reading historical persisted plans;
  // all newly generated plans use "completed_unreviewed".
  outcomeStage?: "initial_assessment" | "preparation" | "active_execution" | "completed_mastery" | "completed_pivot_needed" | "completed_unreviewed" | "friction_pivot_needed";
  outcomeFollowUpAdvice?: string;
  userReflectionNote?: string;
  employmentContext?: string;
  realWorldOutcomeStatus?: "not_reported" | "low_yield_friction" | "user_reported_positive" | "pivot_needed";
  outcomeVerificationEvidence?: "NOT_COMPUTED" | "USER_REPORTED_SIGNAL" | "OBJECTIVE_DATA_PENDING";
  hasLiveBreakthroughAcceleration?: boolean;
  liveSignalNotice?: string;
  liveSignalCount?: number;
  acceleratedHorizonShiftYears?: number;
  relevantLiveSignals?: any[];
  impactEffect?: "ACCELERATING" | "DECELERATING_BOTTLENECK" | "EXPANDING_SCOPE" | "NARROWING_SCOPE" | "UNCERTAINTY_CHANGE";
  dynamicHorizonShiftYears?: number;
  conflictingSignalsDetected?: boolean;
  isReassessmentAcknowledged?: boolean;
  decisionReassessment?: {
    needsReassessment: boolean;
    reassessmentType: "ACCELERATION_RISK" | "BOTTLENECK_PRUDENCE" | "OUTCOME_FRICTION_PIVOT" | "UNCERTAINTY_HEDGING" | "ALIGNMENT_OPTIMAL";
    currentOptionId: "A" | "B" | "C";
    recommendedAlternativeOption: "A" | "B" | "C";
    triggerSignalTitle?: string;
    reason: string;
    isAcknowledged?: boolean;
  };
}

export interface MilestoneDecisionSelection {
  milestoneId?: string;
  year: number;
  optionId: "A" | "B" | "C";
  selectedAt: string;
  title?: string;
  riskLevel?: string;
}

/**
 * Generates domain-calibrated, milestone-contextual 3 strategic decision paths.
 * Eliminates superficial copy-paste templates and provides real skill/approach differentiation.
 */
export function getDomainContextualDecisionOptions(
  profDisplay: string,
  keyCapability: string,
  milestoneCategory: string,
  userDomains: string[],
  recommendedOptionId: "A" | "B" | "C" = "B"
): MilestoneActionPlanOption[] {
  const isSoftware = userDomains.includes("software_tech");
  const isHealth = userDomains.includes("health_bio");
  const isFinance = userDomains.includes("finance_business");
  const isLegal = userDomains.includes("legal_gov");
  const isCreative = userDomains.includes("creative_design");
  const isEducation = userDomains.includes("education_academia");

  const decorate = (opts: MilestoneActionPlanOption[]): MilestoneActionPlanOption[] => {
    return opts.map((opt) => {
      const cleanTitle = opt.title.replace(/\s*\(Önerilen\)/g, "").trim();
      return {
        ...opt,
        title: opt.optionId === recommendedOptionId ? `${cleanTitle} (Önerilen)` : cleanTitle,
      };
    });
  };

  let opts: MilestoneActionPlanOption[];

  if (isSoftware) {
    opts = [
      {
        optionId: "A",
        title: "Koruyucu Uyum & Kod Asistanı Desteği",
        approach: `${keyCapability} araçlarını mevcut ${profDisplay} iş akışınıza kod tamamlama ve birim test desteği olarak entegre edin; mevcut kod tabanınızdaki operasyonel verimliliği artırın.`,
        riskLevel: "Düşük",
        expectedYield: "Mevcut yazılım geliştirme rolünde operasyonel hız artışı ve görev güvenliği.",
        reversibility: "Yüksek (Rol değişmez, araç desteği alınır)",
        requiredSkills: ["Yapay Zeka Kod Asistanları", "İş Akışı Optimizasyonu", "Birim Test Otomasyonu"],
      },
      {
        optionId: "B",
        title: "Dengeli Hibritleşme & Ajan Orkestrasyonu",
        approach: `${profDisplay} olarak rutin kod yazımını otonom ajanlara devredip, ${keyCapability} tabanlı çoklu ajan mimarileri, sistem entegrasyonu ve kod denetiminde derinleşin.`,
        riskLevel: "Orta",
        expectedYield: "Sektörde aranan yapay zeka sistem mimarı olma, karmaşık sistemlerde teknik liderlik.",
        reversibility: "Yüksek (Aktarılabilir modüler yetkinlikler)",
        requiredSkills: [`${keyCapability} Entegrasyonu`, "Ajan Mimarisi", "Sistem Doğrulama"],
      },
      {
        optionId: "C",
        title: "Stratejik Sıçrama & Otonom Platform Mimarlığı",
        approach: `${profDisplay} kalıplarını aşarak, doğrudan ${keyCapability} odağında çalışan otonom yapay zeka ürünleri ve dağıtık platformlar kuran öncü mimar rolüne geçin.`,
        riskLevel: "Yüksek",
        expectedYield: "Sektörde ilk uygulayıcı olma, tek kişilik otonom SaaS veya platform liderliği.",
        reversibility: "Orta (Kariyer odağında stratejik yeniden konumlanma gerektirir)",
        requiredSkills: ["Otonom Ajan Ağları", "Dağıtık Sistem Mimarisi", "Yapay Zeka Platform Yönetimi"],
      },
    ];
  } else if (isHealth) {
    opts = [
      {
        optionId: "A",
        title: "Koruyucu Uyum & Klinik/Laboratuvar Veri Desteği",
        approach: `${keyCapability} araçlarını rutin veri taraması, literatür özeti ve protokol takibinde destekleyici yardımcı olarak kullanın; temel klinik/laboratuvar pratiğinizi koruyun.`,
        riskLevel: "Düşük",
        expectedYield: "Mevcut klinik veya laboratuvar pozisyonunda iş yükü hafiflemesi ve kayıt güvenliği.",
        reversibility: "Yüksek (Rol değişmez, araç desteği alınır)",
        requiredSkills: ["Biyomedikal Veri Okuryazarlığı", "Dijital Protokol Takibi", "Etik Regülasyon Uyumu"],
      },
      {
        optionId: "B",
        title: "Dengeli Hibritleşme & In-Silico Analiz Entegrasyonu",
        approach: `${profDisplay} pratiğinizde rutin manuel tahlil ve numune operasyonlarını otomasyona bağlayarak, ${keyCapability} tabanlı hesaplamalı modelleme ve ön eleme protokollerinde derinleşin.`,
        riskLevel: "Orta",
        expectedYield: "Islak laboratuvar ile algoritmik simülasyonu birleştiren hibrit araştırmacı/hekim statüsü.",
        reversibility: "Yüksek (Aktarılabilir modüler yetkinlikler)",
        requiredSkills: [`${keyCapability} Entegrasyonu`, "Moleküler Simülasyon", "Hesaplamalı Biyoloji Temelleri"],
      },
      {
        optionId: "C",
        title: "Stratejik Sıçrama & Biyo-Yapay Zeka Keşif Liderliği",
        approach: `${profDisplay} sınırlarını aşarak, doğrudan ${keyCapability} odağında in-silico ilaç tasarımı, sentetik genomik veya genetik algoritmalar mimarlığına liderlik edin.`,
        riskLevel: "Yüksek",
        expectedYield: "Küresel ilaç, biyoteknoloji veya genomik konsorsiyumlarında öncü araştırma liderliği.",
        reversibility: "Orta (Kariyer odağında stratejik yeniden konumlanma gerektirir)",
        requiredSkills: ["Hesaplamalı Genomik", "Sentetik Biyoloji Mimarisi", "Biyomedikal Algoritma Tasarımı"],
      },
    ];
  } else if (isFinance) {
    opts = [
      {
        optionId: "A",
        title: "Koruyucu Uyum & Mali Raporlama Güvencesi",
        approach: `${keyCapability} araçlarını mevcut ${profDisplay} iş akışınıza mutabakat ve tablo kontrol desteği olarak ekleyin; mali kayıt süreçlerinizin güvenliğini koruyun.`,
        riskLevel: "Düşük",
        expectedYield: "Mevcut pozisyonda operasyonel hata payının sıfırlanması ve iş güvenliği.",
        reversibility: "Yüksek (Rol değişmez, araç desteği alınır)",
        requiredSkills: ["Finansal Tablo Otomasyonu", "Veri Doğrulama", "Temel AI Raporlama"],
      },
      {
        optionId: "B",
        title: "Dengeli Hibritleşme & Tahmine Dayalı Modelleme",
        approach: `${profDisplay} sorumluluğunuzda rutin defter tutma ve veri girişini otonom sistemlere devredip, ${keyCapability} tabanlı nakit akışı simülasyonları ve algoritmik mali denetime odaklanın.`,
        riskLevel: "Orta",
        expectedYield: "Finansal veriyi stratejik karara dönüştüren vazgeçilmez analist/danışman olma.",
        reversibility: "Yüksek (Aktarılabilir modüler yetkinlikler)",
        requiredSkills: [`${keyCapability} Entegrasyonu`, "Algoritmik Finansal Denetim", "Tahmine Dayalı Finans Analitiği"],
      },
      {
        optionId: "C",
        title: "Stratejik Sıçrama & Fraksiyonel CFO / Algoritmik Risk Liderliği",
        approach: `${profDisplay} kalıplarından çıkarak, kurumlar için yapay zekalı sermaye orkestrasyonu ve algoritmik risk mimarisi sunan fraksiyonel CFO rolünü üstlenin.`,
        riskLevel: "Yüksek",
        expectedYield: "Birden fazla şirkete stratejik finans liderliği sunma, yüksek danışmanlık sermayesi.",
        reversibility: "Orta (Kariyer odağında stratejik yeniden konumlanma gerektirir)",
        requiredSkills: ["Algoritmik Risk Mimarisi", "Fraksiyonel CFO Analitiği", "Stratejik Sermaye Orkestrasyonu"],
      },
    ];
  } else if (isLegal) {
    opts = [
      {
        optionId: "A",
        title: "Koruyucu Uyum & Emsal Tarama Desteği",
        approach: `${keyCapability} araçlarını mevzuat ve içtihat taramalarında hızlandırıcı olarak kullanın; standart dilekçe ve dosya hazırlık süreçlerinizi koruyun.`,
        riskLevel: "Düşük",
        expectedYield: "Dava ve sözleşme hazırlık sürelerinde kısalma, mevcut büro pratiğinin korunumu.",
        reversibility: "Yüksek (Rol değişmez, araç desteği alınır)",
        requiredSkills: ["Hukuki Prompt Mühendisliği", "Emsal İçtihat Doğrulama", "Mevzuat Veri Tabanları"],
      },
      {
        optionId: "B",
        title: "Dengeli Hibritleşme & Akıllı Kontrat Denetimi",
        approach: `Rutin evrak kontrollerini yapay zekaya devredip, ${keyCapability} tabanlı regülatif uyum ve algoritmik sözleşme risk analizinde uzmanlaşın.`,
        riskLevel: "Orta",
        expectedYield: "Şirketlerin yapay zeka kullanımındaki yasal sorumluluk davalarında aranan uzman olma.",
        reversibility: "Yüksek (Aktarılabilir modüler yetkinlikler)",
        requiredSkills: [`${keyCapability} Entegrasyonu`, "AI Regülasyon Mimarisi (AB AI Act)", "Sözleşme Risk Modellemesi"],
      },
      {
        optionId: "C",
        title: "Stratejik Sıçrama & Otonom Sistemler Hukuk Mimarlığı",
        approach: `Klasik vekilliği aşarak, otonom yapay zeka ajanlarının yasal sorumluluğu, sentetik varlık hukuku ve küresel algoritmik tahkimde baş danışman olun.`,
        riskLevel: "Yüksek",
        expectedYield: "Yeni nesil sentetik aktörler ve otonom şirketler arası uyuşmazlıklarda küresel otorite olma.",
        reversibility: "Orta (Kariyer odağında stratejik yeniden konumlanma gerektirir)",
        requiredSkills: ["Otonom Ajan Sorumluluk Hukuku", "Sentetik Varlık Hukuku", "Küresel Teknoloji Tahkimi"],
      },
    ];
  } else if (isCreative) {
    opts = [
      {
        optionId: "A",
        title: "Koruyucu Uyum & Hızlı Taslak Üretimi",
        approach: `${keyCapability} araçlarını moodboard ve taslak aşamalarında yardımcı araç olarak kullanın; nihai yaratıcı kontrolü elinizde tutun.`,
        riskLevel: "Düşük",
        expectedYield: "Tasarım hazırlık hızında artış ve temel portfolyo koruması.",
        reversibility: "Yüksek (Rol değişmez, araç desteği alınır)",
        requiredSkills: ["Generative Görsel/Ses Araçları", "Tasarım İş Akışı", "Dijital Varlık Yönetimi"],
      },
      {
        optionId: "B",
        title: "Dengeli Hibritleşme & Yaratıcı Pipeline Yönetmenliği",
        approach: `Rutin varlık üretimini üretken yapay zekaya devredip, ${keyCapability} tabanlı prompt tasarımı, stil tutarlılığı ve yaratıcı yönetmenliğe odaklanın.`,
        riskLevel: "Orta",
        expectedYield: "Yapay zeka araçlarını yöneten yaratıcı yönetmen olma ve yüksek bütçeli marka projeleri.",
        reversibility: "Yüksek (Aktarılabilir modüler yetkinlikler)",
        requiredSkills: [`${keyCapability} Entegrasyonu`, "Stil & Model Eğitimi (LoRA)", "Yaratıcı Pipeline Orkestrasyonu"],
      },
      {
        optionId: "C",
        title: "Stratejik Sıçrama & Uzamsal Deneyim Mimarlığı",
        approach: `Geleneksel 2D görsel üretimini aşarak, otonom yapay zeka ile 3D uzamsal deneyimler ve sentetik evrenler üreten kreatif lider olun.`,
        riskLevel: "Yüksek",
        expectedYield: "Geleceğin mekansal bilişim ve sanal prodüksiyon pazarında öncü yönetmenlik.",
        reversibility: "Orta (Kariyer odağında stratejik yeniden konumlanma gerektirir)",
        requiredSkills: ["Mekansal Hesaplama & 3D AI", "Sentetik Medya Mimarlığı", "İnteraktif Deneyim Tasarımı"],
      },
    ];
  } else if (isEducation) {
    opts = [
      {
        optionId: "A",
        title: "Koruyucu Uyum & Ders İçeriği Hazırlık Desteği",
        approach: `${keyCapability} araçlarını ders planı, soru bankası ve slayt hazırlığında asistan olarak kullanın; sınıf içi temel öğretim rolünüzü koruyun.`,
        riskLevel: "Düşük",
        expectedYield: "Müfredat hazırlık süresinde hafifleme ve mevcut pedagojik rolün korunumu.",
        reversibility: "Yüksek (Rol değişmez, araç desteği alınır)",
        requiredSkills: ["Eğitimde Üretken AI", "Dijital Ödev Değerlendirme", "Etik AI Kullanımı"],
      },
      {
        optionId: "B",
        title: "Dengeli Hibritleşme & Kişiselleştirilmiş Öğrenme Mentorluğu",
        approach: `Bilgi aktarım rutinlerini yapay zeka asistanlarına devredip, ${keyCapability} tabanlı Sokratik tartışma atölyeleri ve bireysel öğrenci mentorluğunda derinleşin.`,
        riskLevel: "Orta",
        expectedYield: "Öğrencilere bireysel rehberlik eden vazgeçilmez ilham ve düşünme mentoru olma.",
        reversibility: "Yüksek (Aktarılabilir modüler yetkinlikler)",
        requiredSkills: [`${keyCapability} Entegrasyonu`, "Kişiselleştirilmiş Öğrenme Mimarisi", "Sokratik AI Mentorluğu"],
      },
      {
        optionId: "C",
        title: "Stratejik Sıçrama & Yeni Nesil Müfredat & Bilişsel Tasarım Liderliği",
        approach: `Geleneksel okul sınırlarını aşarak, insan-makine işbirliğine dayalı geleceğin bilişsel becerilerini tasarlayan eğitim mimarı olun.`,
        riskLevel: "Yüksek",
        expectedYield: "Küresel ölçekte uyarlanabilir eğitim ekosistemleri tasarlayan öncü eğitim liderliği.",
        reversibility: "Orta (Kariyer odağında stratejik yeniden konumlanma gerektirir)",
        requiredSkills: ["Bilişsel Beceri Mimarisi", "Yapay Zeka Pedagojisi", "Öğrenme Analitiği Sistemleri"],
      },
    ];
  } else {
    // Fallback default
    opts = [
      {
        optionId: "A",
        title: "Koruyucu Uyum & Rutin Görev Güvencesi",
        approach: `${keyCapability} araçlarını mevcut ${profDisplay} iş akışınıza tamamlayıcı destek olarak entegre edin; mevcut rolünüzün temelini koruyun.`,
        riskLevel: "Düşük",
        expectedYield: "Mevcut pozisyonda operasyonel verimlilik artışı ve iş güvenliği.",
        reversibility: "Yüksek (Rol değişmez, araç desteği alınır)",
        requiredSkills: ["Temel Dijital Araçlar", "İş Akışı Optimizasyonu", "Uygulamalı Teknoloji Okuryazarlığı"],
      },
      {
        optionId: "B",
        title: "Dengeli Hibritleşme & Süreç Orkestrasyonu",
        approach: `Rutin icra görevlerini otonom araçlara devredip, ${keyCapability} tabanlı karar ve yönetim süreçlerinde derinleşin.`,
        riskLevel: "Orta",
        expectedYield: "Sektörde aranan hibrit profil olma, katma değerli projelerde liderlik.",
        reversibility: "Yüksek (Aktarılabilir modüler yetkinlikler)",
        requiredSkills: [`${keyCapability} Entegrasyonu`, "Algoritmik Denetim", "Stratejik Karar Alma"],
      },
      {
        optionId: "C",
        title: "Stratejik Sıçrama & Yeni Nesil Rol Liderliği",
        approach: `Geleneksel ${profDisplay} kalıplarını aşarak, doğrudan bu dönüm noktasının ortaya çıkardığı öncü uzmanlık alanına tam odaklanın.`,
        riskLevel: "Yüksek",
        expectedYield: "Sektörde ilk uygulayıcı olma, yüksek sermaye/gelir potansiyeli.",
        reversibility: "Orta (Kariyer odağında stratejik yeniden konumlanma gerektirir)",
        requiredSkills: ["İleri Düzey Sistem Mimarisi", "Otonom Araç Yönetimi", "Disiplinlerarası İnovasyon"],
      },
    ];
  }

  return decorate(opts);
}

/**
 * Calculates a multi-dimensional dynamic impact assessment for an intelligence-milestone pairing.
 * Evaluates readiness, regulatory friction, Capex/infrastructure dependencies, and evidence contradiction.
 * Strictly guarantees MODEL PROJECTION ≠ FACT epistemic boundary.
 */
export function calculateDynamicImpactAssessment(
  arg1: any,
  arg2?: any,
  arg3?: number
): DynamicImpactAssessment {
  let matchingLiveSignals: any[] = [];
  let milestone: Milestone | undefined = undefined;
  let targetYear: number = 2026;

  if (Array.isArray(arg1)) {
    matchingLiveSignals = arg1;
    milestone = arg2;
    targetYear = arg3 || milestone?.year || 2026;
  } else {
    milestone = arg1;
    matchingLiveSignals = Array.isArray(arg2) ? arg2 : [];
    targetYear = arg3 || milestone?.year || 2026;
  }

  const top = matchingLiveSignals[0];
  const trl = top?.trlLevel || 5;
  const confidence = top?.confidenceScore || 70;
  const isBottleneck = top?.impactVerdict === "DECELERATING_BOTTLENECK";
  const isBreakthrough = top?.impactVerdict === "HIGH_BREAKTHROUGH" || trl >= 7;
  const hasConflict = matchingLiveSignals.some((s) => s.impactVerdict === "DECELERATING_BOTTLENECK") &&
                      matchingLiveSignals.some((s) => s.impactVerdict === "HIGH_BREAKTHROUGH" || (s.trlLevel && s.trlLevel >= 6));

  const adoptionReadiness: DynamicImpactAssessment["dimensions"]["adoptionReadiness"] =
    trl >= 8 ? "COMMERCIAL_SCALE" : trl >= 5 ? "PILOT_VALIDATED" : "EARLY_LAB";

  const regulatoryFriction: DynamicImpactAssessment["dimensions"]["regulatoryFriction"] =
    isBottleneck ? "HIGH_RESTRICTIVE" : trl >= 8 ? "MODERATE" : "LOW";

  const infrastructureDependency: DynamicImpactAssessment["dimensions"]["infrastructureDependency"] =
    targetYear >= 2040 ? "ECOSYSTEM_BLOCKER" : targetYear >= 2032 ? "NEW_CAPEX_NEEDED" : "EXISTING_INFRA";

  const commercialReadiness: DynamicImpactAssessment["dimensions"]["commercialReadiness"] =
    trl >= 8 ? "MASS_MARKET" : trl >= 6 ? "NICHE_DEPLOYED" : "PRE_REVENUE";

  const manufacturingReadiness: DynamicImpactAssessment["dimensions"]["manufacturingReadiness"] =
    trl >= 8 ? "HIGH_YIELD_FOUNDRY" : trl >= 6 ? "PILOT_FOUNDRY" : "LAB_PROTOTYPE";

  const deploymentFriction: DynamicImpactAssessment["dimensions"]["deploymentFriction"] =
    (milestone.category || "").includes("Biyoloji") || (milestone.category || "").includes("Enerji")
      ? "HEAVY_CAPEX_GRID"
      : (milestone.category || "").includes("Kuantum") || (milestone.category || "").includes("Otonom")
      ? "HARDWARE_DEPLOYMENT"
      : "FRICTIONLESS_SOFTWARE";

  const signalStrength: DynamicImpactAssessment["dimensions"]["signalStrength"] =
    isBreakthrough ? "STRONG_BREAKTHROUGH" : trl >= 5 ? "MODERATE_PILOT" : "WEAK_EARLY";

  const evidenceQuality: DynamicImpactAssessment["dimensions"]["evidenceQuality"] =
    top?.isVerifiedSignal ? "HIGH_PEER_REVIEWED" : top?.sourceUrl ? "MODERATE_INDUSTRY" : "UNVERIFIED_CLAIM";

  const contradictionLevel: DynamicImpactAssessment["dimensions"]["contradictionLevel"] =
    hasConflict ? "HIGH_CONTRADICTORY" : "NONE";

  let primaryShift = 0;
  if (hasConflict) {
    primaryShift = 0;
  } else if (isBottleneck) {
    primaryShift = +1;
  } else if (isBreakthrough) {
    primaryShift = trl >= 9 ? -2 : -1;
  }

  return {
    epistemicStatus: "MODEL_PROJECTION_NOT_FACT",
    projectionMethodology: "multi_dimensional_heuristic",
    primaryShiftEstimateYears: primaryShift,
    dimensions: {
      adoptionReadiness,
      regulatoryFriction,
      infrastructureDependency,
      commercialReadiness,
      manufacturingReadiness,
      deploymentFriction,
      signalStrength,
      evidenceQuality,
      confidenceScore: confidence,
      contradictionLevel,
    },
    trlLevel: trl,
    readinessDimensions: {
      adoptionReadiness: Math.min(100, Math.round((trl / 9) * 100)),
      infrastructureReadiness: targetYear >= 2040 ? 30 : targetYear >= 2032 ? 60 : 85,
      regulatoryReadiness: isBottleneck ? 35 : trl >= 8 ? 75 : 60,
      commercialReadiness: trl >= 8 ? 90 : trl >= 6 ? 60 : 30,
      overallReadinessScore: Math.min(100, Math.round((trl / 9) * 70 + (confidence / 100) * 30)),
    },
    disclaimer: "Bu tahmin bir kesinlik veya harici gerçek değil, algoritmik bir model projeksiyonudur (MODEL PROJECTION ≠ FACT).",
  };
}

/**
 * Derives a concrete, milestone-contextual action plan deterministically from existing data.
 * ZERO new AI calls, ZERO external dependencies, ZERO hallucination.
 */
export function deriveMilestoneActionPlan(
  milestone: Milestone,
  impact?: MilestonePersonalImpact | null,
  profile?: UserProfile | null,
  selectedOptionIdOverride?: "A" | "B" | "C" | null,
  actionStatusOverride?: ActionProgressStatus | null,
  userReflectionNoteOverride?: string | null,
  liveSignals?: LiveIntelligenceSignal[] | null
): MilestoneActionPlan {
  const safeImpact = impact || calculateMilestonePersonalImpact(milestone, profile);
  const targetYear = milestone.year;
  const keyCapability = milestone.keyDrivers?.[0] || milestone.category || "İleri Teknoloji Adaptasyonu";
  const profDisplay = profile?.profession ? profile.profession : "Mevcut Rolünüz";
  const isProfilePending = safeImpact.isProfilePending || !profile || !profile.profession || profile.profession.trim().length === 0;

  const rawStatus = actionStatusOverride !== undefined && actionStatusOverride !== null
    ? actionStatusOverride
    : (profile?.email ? getMilestoneActionStatus(targetYear, profile.email) : null);
  const actionStatus: ActionProgressStatus = rawStatus || "seen";
  const rawNote = userReflectionNoteOverride !== undefined && userReflectionNoteOverride !== null
    ? userReflectionNoteOverride
    : (profile?.email ? getMilestoneActionNote(targetYear, profile.email) : undefined);
  const userReflectionNote = rawNote && rawNote.trim().length > 0 ? rawNote.trim() : undefined;

  let outcomeStage: MilestoneActionPlan["outcomeStage"] = "initial_assessment";
  let outcomeFollowUpAdvice = "";

  if (actionStatus === "completed") {
    outcomeStage = "completed_unreviewed";
  } else if (actionStatus === "in_progress") {
    outcomeStage = "active_execution";
  } else if (actionStatus === "planned") {
    outcomeStage = "preparation";
  } else {
    outcomeStage = "initial_assessment";
  }

  const rawEmployment = (profile?.employmentStatus || "").toLowerCase().trim();
  const isJobSeeking = rawEmployment.includes("job_seeking") || rawEmployment.includes("unemployed") || rawEmployment.includes("is_ariyor") || rawEmployment.includes("arayis");
  const isEntrepreneur = rawEmployment.includes("entrepreneur") || rawEmployment.includes("freelance") || rawEmployment.includes("girisimci") || rawEmployment.includes("serbest");
  const isRetired = rawEmployment.includes("retired") || rawEmployment.includes("emekli");

  let employmentContext = "Kurumsal Rol İçi Verimlilik & İş Akışı Entegrasyonu";
  if (isJobSeeking) {
    employmentContext = "İş Arayışı & Portfolyo Odaklı İstihdam Edilebilirlik";
  } else if (isEntrepreneur) {
    employmentContext = "Girişimci & Ticari Ürünleştirme Odağı";
  } else if (isRetired) {
    employmentContext = "Danışmanlık & Yaşam Kalitesi Odağı";
  }

  // 1. Urgency & Time Horizon
  let urgencyBand: MilestoneActionPlan["urgencyBand"] = "near_term";
  let urgencyTitle = "";
  let urgencySubtitle = "";
  let timelinePhaseText = "";
  let preparationHorizon = "";
  let reviewCheckpoint = "";

  if (targetYear <= 2029) {
    urgencyBand = "immediate";
    urgencyTitle = "⚡ Şimdi Hazırlan (2026–2028)";
    urgencySubtitle = "Bu teknoloji kapıda; gecikmeden bireysel ve mesleki iş akışınıza dahil edin.";
    timelinePhaseText = "2026–2030 Yakın Ufuk";
    preparationHorizon = "2026–2028 Acil Eylem Penceresi";
    reviewCheckpoint = "Sonraki Kontrol: 6 Ay Sonra. Sektörel model sürümlerini ve regülasyonları gözden geçirin.";
  } else if (targetYear <= 2035) {
    urgencyBand = "near_term";
    urgencyTitle = "📅 2030'a Kadar Tamamlanması Anlamlı";
    urgencySubtitle = "Gelecek 3-5 yıl içinde yetkinlik havuzunuzu bu teknoloji standartlarına taşıyın.";
    timelinePhaseText = "2030–2035 Faz 1 Geçişi";
    preparationHorizon = "2028–2032 Pilot Uygulama Penceresi";
    reviewCheckpoint = "Sonraki Kontrol: 12 Ay Sonra. Yıllık beceri adaptasyonu ve otomasyon araçlarını denetleyin.";
  } else if (targetYear <= 2045) {
    urgencyBand = "mid_term";
    urgencyTitle = "🧭 2035 Sonrası Etkisi Katlanacak (Orta Vade)";
    urgencySubtitle = "Sektörel altyapı olgunlaşırken 'süper-uzman' rolü için stratejik konumlanın.";
    timelinePhaseText = "2036–2045 Faz 2 Tekillik Eşiği";
    preparationHorizon = "2032–2038 Stratejik Adaptasyon";
    reviewCheckpoint = "Sonraki Kontrol: 2-3 Yılda Bir. Patent ve laboratuvar TRL olgunlaşmasını izleyin.";
  } else {
    urgencyBand = "long_term";
    urgencyTitle = "🔭 2045+ Uzun Vadeli Medeniyet Ufku";
    urgencySubtitle = "Biyo-yaşam, uzun ömür ve sermaye korunumu için vizyoner planlama yapın.";
    timelinePhaseText = "2046–2060 Faz 3 Post-Biyolojik Çağ";
    preparationHorizon = "2040+ Derin Gelecek Konumlandırması";
    reviewCheckpoint = "Sonraki Kontrol: 5 Yılda Bir. Makro medeniyet ve teknolojik tekillik modellerini güncelleyin.";
  }

  // 2. Action Type & Label
  let actionType: MilestoneActionPlan["actionType"] = "workflow_integration";
  let actionTypeLabel = "İş Akışı Entegrasyonu";

  const profStr = (profile?.profession || "").toLowerCase().trim();
  const goalStr = `${profile?.primaryGoal || ""} ${profile?.personalGoal || ""} ${profile?.primaryGoalLabel || ""}`.toLowerCase().trim();
  const userBaseAge = profile?.age && profile.age >= 10 && profile.age <= 100 ? profile.age : undefined;
  const userAgeAtMilestone = userBaseAge !== undefined ? userBaseAge + Math.max(0, targetYear - 2026) : undefined;

  const isStudent = profStr.includes("öğrenci") || profStr.includes("student") || profile?.lifeRole === "ogrenci" || profile?.seniority?.toLowerCase() === "entry";
  const isManager = profStr.includes("yönetici") || profStr.includes("manager") || profStr.includes("direktör") || profStr.includes("lead") || profile?.seniority?.toLowerCase() === "manager";
  const isTransition = goalStr.includes("transition") || goalStr.includes("kariyer_gecis") || goalStr.includes("gecis") || goalStr.includes("degisim") || goalStr.includes("switch");
  const isSeniorAge = (userBaseAge !== undefined && userBaseAge >= 60) || (userAgeAtMilestone !== undefined && userAgeAtMilestone >= 68);
  const isGrowthOrLeadershipGoal = goalStr.includes("büyüme") || goalStr.includes("growth") || goalStr.includes("liderlik") || goalStr.includes("kariyer gelişimi") || goalStr.includes("girişim");
  const isSeniorLeadership = isSeniorAge && (goalStr.includes("liderlik") || goalStr.includes("leadership"));
  const isHealthcare = profStr.includes("doktor") || profStr.includes("doctor") || profStr.includes("hekim") || profStr.includes("tıp") || profStr.includes("cerrah") || profStr.includes("kardiyo") || profStr.includes("klinik");

  // Derive domain clusters for this profile
  const userCombinedText = `${profStr} ${(profile?.industrySector || "").toLowerCase()}`;
  const userDomains: string[] = [];
  for (const [domKey, keywords] of Object.entries(DOMAIN_KEYWORDS)) {
    if (keywords.some((kw) => userCombinedText.includes(kw))) {
      userDomains.push(domKey);
    }
  }

  if (isProfilePending) {
    actionType = "workflow_integration";
    actionTypeLabel = "Genel Teknoloji Takibi";
  } else if (isStudent) {
    actionType = "skill_acquisition";
    actionTypeLabel = "Öğrenme & Portfolyo Keşfi";
  } else if (isManager) {
    actionType = "strategic_positioning";
    actionTypeLabel = "Stratejik Yönetişim & Orkestrasyon";
  } else if (isTransition) {
    actionType = "skill_acquisition";
    actionTypeLabel = "Kariyer Geçişi & Yetkinlik Köprüsü";
  } else if (isSeniorAge) {
    if (isSeniorLeadership) {
      actionType = "strategic_positioning";
      actionTypeLabel = "Kıdemli Yönetişim & Büyüme Liderliği";
    } else {
      actionType = "strategic_positioning";
      actionTypeLabel = "Danışmanlık & Yaşam Kalitesi";
    }
  } else if (milestone.category === "Biyoloji & Tıp" || milestone.category === "Post-İnsan & Medeniyet" || isHealthcare) {
    actionType = "life_longevity";
    actionTypeLabel = "Biyo-Yaşam & Sağlık";
  } else if (safeImpact.relevanceLevel === "high") {
    actionType = "skill_acquisition";
    actionTypeLabel = "Kritik Beceri & Süper-Uzmanlaşma";
  } else if (targetYear >= 2040) {
    actionType = "strategic_positioning";
    actionTypeLabel = "Stratejik Konumlanma";
  }

  // 3. Concrete Action & Roadmap Link
  let concreteAction = "";
  let roadmapLinkStatus: MilestoneActionPlan["roadmapLinkStatus"] = "ready_to_add_to_plan";
  let roadmapActionText = "";

  if (safeImpact.matchingRoadmapStep) {
    roadmapLinkStatus = "linked_to_existing_plan";
    concreteAction = safeImpact.matchingRoadmapStep.action;
    roadmapActionText = `Mevcut yol haritanızdaki ${safeImpact.matchingRoadmapStep.targetYear || targetYear} adımınız bu eylemi doğrulamaktadır.`;
  } else if (profile?.profession && !isProfilePending) {
    roadmapLinkStatus = "ready_to_add_to_plan";

    if (safeImpact.relevanceLevel === "high") {
      if (isStudent) {
        actionType = "skill_acquisition";
        actionTypeLabel = "Öğrenme & Portfolyo Keşfi";
        concreteAction = `${profDisplay} olarak ${keyCapability} odaklı yeni nesil yapay zeka araçlarını ve açık kaynak projeleri öğrenim sürecinize dahil edin; portfolyonuzu bu yetkinliklerle oluşturun.`;
      } else if (isManager) {
        actionType = "strategic_positioning";
        actionTypeLabel = "Stratejik Yönetişim & Orkestrasyon";
        concreteAction = `${profDisplay} rolünüzde ${keyCapability} odaklı otonom sistemleri ekip iş akışlarınıza, yönetişim ilkelerine ve stratejik karar süreçlerinize entegre edin.`;
      } else if (isTransition) {
        actionType = "skill_acquisition";
        actionTypeLabel = "Kariyer Geçişi & Yetkinlik Köprüsü";
        concreteAction = `Hedeflediğiniz kariyer geçişinde ${profDisplay} deneyiminizi korurken, ${keyCapability} tabanlı yeni nesil araçlarla aktarılabilir yetkinlikler geliştirin ve pratik projeler üretin.`;
      } else if (isSeniorAge) {
        if (isSeniorLeadership) {
          actionType = "strategic_positioning";
          actionTypeLabel = "Kıdemli Yönetişim & Büyüme Liderliği";
          concreteAction = `${profDisplay} alanındaki derin kıdem birikiminizi, ${keyCapability} tabanlı otonom sistemlerin stratejik yönetişimi, kurumsal büyüme ve üst düzey karar mimarisine yönlendirin.`;
        } else {
          actionType = "strategic_positioning";
          actionTypeLabel = "Danışmanlık & Yaşam Kalitesi";
          concreteAction = `${profDisplay} tecrübenizi mentorluk ve danışmanlık ekseninde korurken, ${keyCapability} araçlarını kişisel yaşam kalitesi ve verimlilik için kullanın.`;
        }
      } else if (isHealthcare) {
        if (milestone.category === "Biyoloji & Tıp" || milestone.category === "Post-İnsan & Medeniyet") {
          actionType = "life_longevity";
          actionTypeLabel = "Biyo-Yaşam & Sağlık";
        }
        concreteAction = `${profDisplay} rolünüzde ${keyCapability} odaklı klinik yapay zeka araçlarını, tanı/destek protokollerini ve tıbbi regülasyonları mesleki pratiğinize entegre edin.`;
      } else {
        concreteAction = `${profDisplay} rolünüzde ${keyCapability} odaklı yeni nesil yapay zeka araçlarını ve otomasyon pratiklerini iş süreçlerinize entegre edin.`;
      }
    } else if (safeImpact.relevanceLevel === "medium") {
      if (isSeniorAge) {
        if (isSeniorLeadership) {
          concreteAction = `${profDisplay} alanındaki kıdemli liderlik perspektifinizle, ${milestone.title} sürecinin sektörel dönüşümünü ve kurumsal büyüme potansiyelini stratejik yol haritanıza alın.`;
        } else {
          concreteAction = `${profDisplay} birikiminizi mentorluk ve danışmanlık çerçevesinde aktarırken, ${milestone.title} sürecini stratejik ve yaşam kalitesi perspektifiyle izleyin.`;
        }
      } else if (isStudent) {
        concreteAction = `${milestone.title} sürecini destekleyen temel dijital kavramları ve açık kaynak araçları öğrenim ajandanıza ekleyin.`;
      } else if (isManager) {
        concreteAction = `${milestone.title} sürecini kurumunuzun departmanlar arası verimlilik ve operasyonel yol haritasında değerlendirin.`;
      } else {
        concreteAction = `${milestone.title} sürecini destekleyen dijital araçları ve karar mekanizmalarını çalışma rutininize ekleyin.`;
      }
    } else {
      if (isSeniorAge) {
        if (isSeniorLeadership) {
          concreteAction = `${profDisplay} birikiminizle ${targetYear} yılındaki bu küresel kırılmanın makro piyasa ve sermaye dinamiklerini stratejik izleme listenize alın.`;
        } else {
          concreteAction = `${profDisplay} birikiminizi mentorluk ve rehberlik ekseninde koruyun; ${targetYear} yılındaki bu küresel kırılmanın makro etkilerini ve yaşam kalitesi fırsatlarını takip listesine alın.`;
        }
      } else {
        concreteAction = `${profDisplay} rolünüz için ${targetYear} yılındaki bu küresel kırılmanın makro etkilerini takip listesine alın; bireysel yaşam stratejinizi bu eksende koruyun.`;
      }
    }
    roadmapActionText = "Bu somut eylemi 2026–2060 kişisel adaptasyon yol haritanıza dahil edin.";
  } else {
    roadmapLinkStatus = "ready_to_add_to_plan";
    concreteAction = `Profil bilgilerinizi tamamlayarak ${targetYear} yılı için mesleğinize özel ilk somut eylem planını aktifleştirin.`;
    roadmapActionText = "Kişisel profilinizi tamamlayıp bu gelişmeyi yol haritanıza ekleyin.";
  }

  // 4. Closed-Loop Strategic Decision Options Alignment (Aşama 39 & Aşama 43 Decision Invariants)
  let defaultRecommendedOption: "A" | "B" | "C" = "B";
  const isSecurityGoal = goalStr.includes("güvenlik") || goalStr.includes("security") || goalStr.includes("istikrar") || goalStr.includes("koruma") || goalStr.includes("risk_avoidance");
  const isGrowthGoal = goalStr.includes("büyüme") || goalStr.includes("growth") || goalStr.includes("liderlik") || goalStr.includes("sıçrama") || goalStr.includes("girişim") || goalStr.includes("leadership");

  if (isSecurityGoal) {
    defaultRecommendedOption = "A";
  } else if (isGrowthGoal) {
    defaultRecommendedOption = "C";
  } else {
    defaultRecommendedOption = "B";
  }

  // Pure separation: user decision is ONLY what the user selected, never auto-assigned
  const savedOption = profile?.email ? getMilestoneSelectedOption(targetYear, profile.email) : null;
  const userDecision: "A" | "B" | "C" | null = selectedOptionIdOverride || savedOption || null;
  const recommendedOption: "A" | "B" | "C" = defaultRecommendedOption;
  const isExplicitUserChoice = userDecision !== null;
  const activeOptionId: "A" | "B" | "C" = userDecision || defaultRecommendedOption;

  const decisionOptions = getDomainContextualDecisionOptions(
    profDisplay,
    keyCapability,
    milestone.category,
    userDomains,
    defaultRecommendedOption
  );

  const activeOption = decisionOptions.find((o) => o.optionId === activeOptionId) || decisionOptions[1] || decisionOptions[0];

  const recommendedMilestoneFocus = isProfilePending
    ? "Profil bilgilerinizi tamamlayarak bu dönüm noktasının kariyerinize etkisini aktifleştirin."
    : `${profDisplay} odağında ${keyCapability} entegrasyonu`;

  let expectedValue = isProfilePending
    ? "Genel teknoloji farkındalığı ve gelecek okuryazarlığı."
    : `Rutin operasyonel görevlerde belirgin verimlilik artışı (model projeksiyonu: rutin iş yükünün otonom araçlara devriyle odaklanma derinliği), ${keyCapability} alanında erken adaptasyon avantajı ve mesleki uzmanlık dayanıklılığı.`;
  let timeCost = isProfilePending
    ? "Haftalık ~1 saat (Genel Teknoloji Takibi)"
    : (targetYear <= 2029 ? "Haftalık 3–5 saat odaklı çalışma / İlk 30 Günlük Pilot Entegrasyon (Model Heuristic)" : "Haftalık 2 saat / 90 Günlük Keşif & Beceri Geliştirme (Model Heuristic)");
  let risk = isProfilePending
    ? "Teknolojik dönüşümün gerisinde kalma."
    : `Geleneksel manuel şablonlarda ısrar etmek, otomasyon araçlarını benimseyen akranlara karşı rekabet avantajını kaybetme ve rutin görev ikamesi riski yaratır.`;
  let reversibility = "Yüksek (Düşük maliyetli beceri yatırımı; kazanılan yetkinlikler aktarılabilir modüler niteliktedir)";

  if (!isProfilePending && activeOption) {
    const hasSpecialPersona = isStudent || isManager || isTransition || isSeniorAge || isHealthcare;

    if (activeOptionId === "A") {
      expectedValue = `Mevcut rol güvencesi ve operasyonel verimlilik (model projeksiyonu: rutin iş yükünün araçlara devriyle hata payının düşürülmesi). Beklenen Değer: ${activeOption.expectedYield}`;
      timeCost = targetYear <= 2029
        ? "Haftalık 1–2 saat / Düşük riskli iş akışı optimizasyonu (Model Heuristic)"
        : "Haftalık ~1 saat / Temel araç entegrasyonu (Model Heuristic)";
      risk = `Düşük Risk (Mevcut operasyonel rol korunur; radikal yapısal değişiklik ve sermaye riski içermez). Risk Düzeyi: ${activeOption.riskLevel}`;
      reversibility = activeOption.reversibility;
      if (isExplicitUserChoice && targetYear <= 2035) {
        reviewCheckpoint = "Sonraki Kontrol: 12-18 Ay Sonra. Yıllık rutin araç denetimi ve kademeli verimlilik değerlendirmesi.";
      }
      if (isExplicitUserChoice || !hasSpecialPersona) {
        actionType = "workflow_integration";
        actionTypeLabel = "Koruyucu Uyum & Rutin Görev Güvencesi";
        if (isExplicitUserChoice && !safeImpact.matchingRoadmapStep) {
          concreteAction = activeOption.approach;
        }
      }
    } else if (activeOptionId === "C") {
      expectedValue = `Yüksek katma değerli stratejik liderlik ve pazar avantajı (model projeksiyonu: geleneksel rollerin ötesinde otonom mimari konumlanması). Beklenen Değer: ${activeOption.expectedYield}`;
      timeCost = targetYear <= 2029
        ? "Haftalık 8–10 saat yoğun odaklanma / 90 Günlük Agresif Sıçrama ve Platform Mimarisi (Model Heuristic)"
        : "Haftalık 4–6 saat / Stratejik pilot projeler (Model Heuristic)";
      risk = `Yüksek Risk (Hızlı adaptasyon baskısı ve geleneksel rol kalıplarından radikal ayrışma gerektirir). Risk Düzeyi: ${activeOption.riskLevel}`;
      if (isExplicitUserChoice) {
        reversibility = activeOption.reversibility;
      }
      if (isExplicitUserChoice && targetYear <= 2035) {
        reviewCheckpoint = targetYear <= 2029
          ? "Sonraki Kontrol: 30–60 Gün Sonra. Erken aşama otonom mimari çıktıları, pazar tepkisi ve sistem performansını sıkı denetleyin."
          : "Sonraki Kontrol: 6 Ay Sonra. Çeyreklik otonom mimari çıktılarını denetleyin.";
      }
      if (isExplicitUserChoice || !hasSpecialPersona) {
        actionType = "strategic_positioning";
        actionTypeLabel = "Stratejik Sıçrama & Otonom Platform Mimarlığı";
        if (isExplicitUserChoice && !safeImpact.matchingRoadmapStep) {
          concreteAction = activeOption.approach;
        }
      }
    } else {
      // Option B: Balanced Hybridization
      expectedValue = `Rutin operasyonel görevlerde belirgin verimlilik artışı (model projeksiyonu: rutin iş yükünün otonom araçlara devriyle odaklanma derinliği), ${keyCapability} alanında erken adaptasyon avantajı ve mesleki uzmanlık dayanıklılığı. Beklenen Değer: ${activeOption.expectedYield}`;
      timeCost = targetYear <= 2029
        ? "Haftalık 3–5 saat odaklı çalışma / İlk 30 Günlük Pilot Entegrasyon (Model Heuristic)"
        : "Haftalık 2 saat / 90 Günlük Keşif & Beceri Geliştirme (Model Heuristic)";
      risk = `Orta Risk (Geleneksel manuel şablonlarda ısrar etmek yerine hibritleşme; yeni yetkinlik yatırımı gerektirir). Risk Düzeyi: ${activeOption.riskLevel}`;
      reversibility = activeOption.reversibility;
      if (isExplicitUserChoice) {
        actionType = "skill_acquisition";
        actionTypeLabel = "Dengeli Hibritleşme & Ajan Orkestrasyonu";
        if (!safeImpact.matchingRoadmapStep) {
          concreteAction = activeOption.approach;
        }
        if (targetYear <= 2035) {
          reviewCheckpoint = targetYear <= 2029
            ? "Sonraki Kontrol: 6 Ay Sonra. Sektörel model sürümlerini ve regülasyonları gözden geçirin."
            : "Sonraki Kontrol: 12 Ay Sonra. Yıllık beceri adaptasyonu ve otomasyon araçlarını denetleyin.";
        }
      }
    }
  }

  // 5. Outcome Learning & Review Reassessment (Aşama 39.1 & 39.2 Closed-Loop Reassessment)
  let realWorldOutcomeStatus: MilestoneActionPlan["realWorldOutcomeStatus"] = "not_reported";
  let outcomeVerificationEvidence: MilestoneActionPlan["outcomeVerificationEvidence"] = "NOT_COMPUTED";

  const noteLower = (userReflectionNote || "").toLowerCase().trim();
  const hasFrictionOrLowYield =
    noteLower.includes("beklenen faydayı alamadım") ||
    noteLower.includes("verim alamadım") ||
    noteLower.includes("verim düşüklüğü") ||
    noteLower.includes("düşük verim") ||
    noteLower.includes("yetersiz") ||
    noteLower.includes("beklentimi karşılamadı") ||
    noteLower.includes("fayda göremedim") ||
    noteLower.includes("fayda alamadım") ||
    noteLower.includes("zaman kaybı") ||
    noteLower.includes("vakit kaybı") ||
    noteLower.includes("başarısız") ||
    noteLower.includes("tıkandım") ||
    noteLower.includes("tıkanma") ||
    noteLower.includes("tıkanıklık") ||
    noteLower.includes("zorlandım") ||
    noteLower.includes("zorluk") ||
    noteLower.includes("engel") ||
    noteLower.includes("darboğaz") ||
    noteLower.includes("verimsiz") ||
    noteLower.includes("aksadı") ||
    noteLower.includes("farklı bir yol") ||
    noteLower.includes("pivot");

  const hasPositiveOutcomeFeedback =
    !hasFrictionOrLowYield && (
      noteLower.includes("başarı") ||
      noteLower.includes("başarılı") ||
      noteLower.includes("verimli") ||
      noteLower.includes("harika") ||
      noteLower.includes("oturdu") ||
      noteLower.includes("fayda sağladı") ||
      noteLower.includes("entegre ettik") ||
      noteLower.includes("tamamladık") ||
      noteLower.includes("devreye aldık") ||
      noteLower.includes("pipeline")
    );

  let outcomeSemantics: OutcomeSemanticsType = "INITIAL_ASSESSMENT_PENDING";

  if (actionStatus === "completed") {
    if (hasFrictionOrLowYield) {
      outcomeStage = "completed_pivot_needed";
      realWorldOutcomeStatus = "low_yield_friction";
      outcomeVerificationEvidence = "USER_REPORTED_SIGNAL";
      outcomeSemantics = "USER_REPORTED_FRICTION";
    } else if (hasPositiveOutcomeFeedback) {
      // User explicitly reported positive outcome note (USER REPORTED, NOT objectively verified)
      outcomeStage = "completed_unreviewed";
      realWorldOutcomeStatus = "user_reported_positive";
      outcomeVerificationEvidence = "USER_REPORTED_SIGNAL";
      outcomeSemantics = "USER_REPORTED_POSITIVE_RESULT";
    } else {
      // No reflection / outcome feedback yet
      outcomeStage = "completed_unreviewed";
      realWorldOutcomeStatus = "not_reported";
      outcomeVerificationEvidence = "NOT_COMPUTED";
      outcomeSemantics = "ACTION_COMPLETED_PENDING_REVIEW";
    }
  } else if (actionStatus === "in_progress") {
    outcomeStage = hasFrictionOrLowYield ? "friction_pivot_needed" : "active_execution";
    realWorldOutcomeStatus = hasFrictionOrLowYield ? "low_yield_friction" : "not_reported";
    outcomeVerificationEvidence = userReflectionNote ? "USER_REPORTED_SIGNAL" : "NOT_COMPUTED";
    outcomeSemantics = hasFrictionOrLowYield ? "PIVOT_NEEDED" : "EXECUTION_IN_PROGRESS";
  } else if (actionStatus === "planned") {
    outcomeStage = "preparation";
    realWorldOutcomeStatus = "not_reported";
    outcomeVerificationEvidence = "NOT_COMPUTED";
    outcomeSemantics = "PREPARATION_PLANNED";
  } else {
    outcomeStage = "initial_assessment";
    realWorldOutcomeStatus = "not_reported";
    outcomeVerificationEvidence = "NOT_COMPUTED";
    outcomeSemantics = "INITIAL_ASSESSMENT_PENDING";
  }

  if (!isProfilePending) {
    if (outcomeStage === "completed_pivot_needed") {
      actionTypeLabel = `${actionTypeLabel} (Tamamlandı — Yöntem Revizyonu Gerekli ⚠️)`;
      const altOptions = activeOptionId === "A" ? "Yol B veya Yol C" : activeOptionId === "B" ? "Yol A veya Yol C" : "Yol A veya Yol B";
      concreteAction = `Yöntem Revizyonu & Stratejik Yeniden Değerlendirme: Kullanıcı gözden geçirme notunuzda ("${userReflectionNote}") eylemin beklenen faydayı sağlamadığı bildirildi. Mevcut ${keyCapability} yaklaşımında ısrar etmek yerine; alternatif stratejiye (${altOptions}) geçiş yapın veya kullanılan araç setini revize edin.`;
      expectedValue = `Yöntem revizyonu ve atalet önleme (Model Projeksiyonu: Düşük verimli eylemde ısrar etmek yerine erken pivot ile efor kaybının sınırlandırılması).`;
      timeCost = "Haftalık 1–2 saat yöntem revizyonu ve alternatif araç denemesi (Model Heuristic - Pivot Süreci)";
      risk = "Yüksek Atalet Riski (Düşük verim bildirilmesine rağmen aynı patikada ısrar etmek zaman ve motivasyon kaybı yaratır). Risk Düzeyi: Yüksek";
      reviewCheckpoint = "Acil Yeniden Değerlendirme & Yöntem Revizyonu: 14–30 Gün Sonra (Kullanıcı Geri Bildirimi Kaynaklı Erken Gözden Geçirme).";
      outcomeFollowUpAdvice = "Eylemi tamamladınız ancak bildirilen deneyim beklenen çıktıyı sağlamadı. Stratejinizi yeniden kalibre etmeniz tavsiye edilir.";
    } else if (outcomeStage === "completed_unreviewed" || (outcomeStage as string) === "completed_mastery") {
      actionTypeLabel = `${actionTypeLabel} (Tamamlandı — Değerlendirme Bekliyor)`;
      if (hasPositiveOutcomeFeedback) {
        concreteAction = `Kullanıcı Bildirimli Sonuç İncelemesi: ${keyCapability} odağındaki eyleminizle ilgili olumlu deneyim bildirdiniz ("${userReflectionNote?.slice(0, 50)}..."). Sonraki adım: Günlük iş akışınızdaki pratik çıktıları gözlemleyin (Kullanıcı beyanıdır; harici objektif doğrulama bağımsız bir süreçtir).`;
        expectedValue = `Eylem tamamlandı ve kullanıcı bildirimli olumlu deneyim kaydedildi (Model Projeksiyonu: Kullanıcı deneyim beyanı; objektif harici etki bağımsız bir süreçtir).`;
        timeCost = "Haftalık ~30 dk stabilizasyon ve deneyim gözlemi (Model Heuristic)";
        risk = "Düşük Risk (Eylem tamamlandı olarak işaretlendi; temel risk edinilen deneyimin güncel model sürümleriyle güncellenmemesidir).";
        reviewCheckpoint = "Tamamlandı (Kullanıcı Bildirimi) — Periyodik Gözden Geçirme: 6–12 Ay Sonra.";
        outcomeFollowUpAdvice = "Eylemi tamamlandı olarak işaretlediniz ve olumlu deneyim bildirdiniz. Objektif harici sonuç ve yetkinlik çıktısı bağımsız bir süreçtir (NOT_COMPUTED).";
      } else {
        concreteAction = `Sonuç Değerlendirmesi Bekleniyor: ${keyCapability} odağındaki eylemi tamamlandı olarak işaretlediniz. Sonuç henüz değerlendirilmedi. Sonraki adım: Günlük iş akışınızdaki verim ve adaptasyon çıktılarını gözlemleyerek deneyim notunuzu ekleyin.`;
        expectedValue = `Eylem tamamlandı olarak işaretlendi (Model Projeksiyonu: Eylem tamamlandı; gerçek dünya etkisi ve objektif sonuç henüz değerlendirilmedi).`;
        timeCost = "Haftalık ~15 dk gözlem ve not alma (Model Heuristic)";
        risk = "Sonuç Belirsizliği (Eylem tamamlandı olarak işaretlendi ancak somut çıktılar henüz değerlendirilmedi).";
        reviewCheckpoint = "Tamamlandı (Değerlendirme Bekliyor) — İlk Sonuç Gözden Geçirmesi: 30–60 Gün Sonra.";
        outcomeFollowUpAdvice = "Eylemi tamamlandı olarak işaretlediniz. Sonuç henüz değerlendirilmedi.";
      }
    } else if (outcomeStage === "friction_pivot_needed") {
      reviewCheckpoint = "Uygulama Darboğazı ⚠️ — Yöntem & Karar Revizyonu: 14 Gün Sonra.";
      outcomeFollowUpAdvice = "Uygulama sürecinde darboğaz veya tıkanıklık bildirdiniz. Stratejinizi veya kullandığınız araçları gözden geçirip gerekirse alternatif karar yoluna geçmeniz önerilir.";
    } else if (outcomeStage === "active_execution") {
      reviewCheckpoint = "Eylemde ⚡ — Aktif Uygulama Kontrolü: 30 Gün Sonra. Pilot çıktıları ve araç adaptasyonunu değerlendirin.";
      outcomeFollowUpAdvice = "Eylem şu an aktif uygulama aşamasında. Haftalık odaklanma saatlerinizi koruyun.";
      if (isJobSeeking) {
        timeCost = "Haftalık 10+ saat aktif portfolyo ve canlı vaka inşası (Model Heuristic - İş Arayışı Dinamiği)";
        concreteAction = `${concreteAction} (İş Arayışı Notu: Öğrenilen ${keyCapability} yetkinliğini portfolyo ve canlı projelerle belgeleyin.)`;
      } else if (isEntrepreneur) {
        timeCost = "Haftalık 6–8 saat ticari MVP ve müşteri değeri inşası (Model Heuristic - Girişimci Dinamiği)";
        concreteAction = `${concreteAction} (Girişimci Notu: ${keyCapability} tabanlı çözümleri müşteri değerine ve MVP'ye dönüştürün.)`;
      }
    } else if (outcomeStage === "preparation") {
      reviewCheckpoint = "Planlandı 📅 — Başlangıç Hazırlık Kontrolü: 60 Gün Sonra. Kaynak ve eğitim hazırlıklarını gözden geçirin.";
      outcomeFollowUpAdvice = "Bu eylem takviminize alındı. Uygulama öncesi temel araç gereksinimlerini hazırlayın.";
      if (isJobSeeking) {
        timeCost = "Haftalık 10+ saat aktif portfolyo ve canlı vaka inşası (Model Heuristic - İş Arayışı Dinamiği)";
        concreteAction = `${concreteAction} (İş Arayışı Notu: Öğrenilen ${keyCapability} yetkinliğini portfolyo ve canlı projelerle belgeleyin.)`;
      } else if (isEntrepreneur) {
        timeCost = "Haftalık 6–8 saat ticari MVP ve müşteri değeri inşası (Model Heuristic - Girişimci Dinamiği)";
        concreteAction = `${concreteAction} (Girişimci Notu: ${keyCapability} tabanlı çözümleri müşteri değerine ve MVP'ye dönüştürün.)`;
      }
    } else {
      // outcomeStage === "initial_assessment"
      if (isJobSeeking) {
        timeCost = "Haftalık 10+ saat aktif portfolyo ve canlı vaka inşası (Model Heuristic - İş Arayışı Dinamiği)";
        concreteAction = `${concreteAction} (İş Arayışı Notu: Öğrenilen ${keyCapability} yetkinliğini portfolyo ve canlı projelerle belgeleyin.)`;
      } else if (isEntrepreneur) {
        timeCost = "Haftalık 6–8 saat ticari MVP ve müşteri değeri inşası (Model Heuristic - Girişimci Dinamiği)";
        concreteAction = `${concreteAction} (Girişimci Notu: ${keyCapability} tabanlı çözümleri müşteri değerine ve MVP'ye dönüştürün.)`;
      }
    }
  }

  // 6. Live Intelligence Signal Adaptation & Dynamic Impact Assessment (Aşama 41 & 42 Dynamic Impact Engine)
  let hasLiveBreakthroughAcceleration = false;
  let liveSignalNotice: string | undefined = undefined;
  let liveSignalCount = 0;
  let acceleratedHorizonShiftYears = 0;
  let dynamicHorizonShiftYears = 0;
  let impactEffect: MilestoneActionPlan["impactEffect"] = undefined;
  let hasConflict = false;
  const matchingLiveSignals: any[] = [];
  const seenSignalKeys = new Set<string>();

  if (liveSignals && liveSignals.length > 0) {
    for (const sig of liveSignals) {
      // Adversarial Guard 1: Filter out low-confidence noise and unverified rumors (<40)
      if (sig.impactVerdict === "IRRELEVANT_NOISE") continue;
      if (typeof sig.matchConfidence === "number" && sig.matchConfidence < 40) continue;
      if (typeof sig.confidenceScore === "number" && sig.confidenceScore < 40 && !sig.isVerifiedSignal) continue;

      // Adversarial Guard 2: Deduplication against replay/duplicate signals
      const dedupeKey = sig.id ? `id_${sig.id}` : `title_${(sig.title || "").trim().toLowerCase()}`;
      if (seenSignalKeys.has(dedupeKey)) continue;

      const isMatchedYear = (sig as any).matchedMilestoneYear === targetYear;
      const yearMatch = sig.extractedYear ? Math.abs(sig.extractedYear - targetYear) <= 2 : false;
      const catMatch = sig.category && milestone.category && sig.category.toLowerCase() === milestone.category.toLowerCase();
      const textMatch = `${sig.title || ""} ${sig.summary || ""}`.toLowerCase().includes(keyCapability.toLowerCase().slice(0, 5));

      if (isMatchedYear || (yearMatch && (catMatch || textMatch)) || (catMatch && textMatch)) {
        seenSignalKeys.add(dedupeKey);
        matchingLiveSignals.push(sig);
      }
    }

    liveSignalCount = matchingLiveSignals.length;

    if (matchingLiveSignals.length > 0) {
      // Classification functions for multi-signal partition
      const isBottleneckOrDecelerating = (s: any) => {
        const txt = `${s.title || ""} ${s.summary || ""}`.toLowerCase();
        return (
          s.impactVerdict === "DECELERATING_BOTTLENECK" ||
          /(yasak|ambargo|regülasyon|moratoryum|kısıtlama|darboğaz|gecikme|ertelendi|kararsızlık|arz kısıtı|güvenlik açığı|başarısız|çöküş|iptal|durduruldu|reddedildi|maliyet artışı|çip kıtlığı|enerji darboğazı|\b(ban|embargo|moratorium|halted|delayed|postponed|bottleneck|deficit|failed trial|vulnerability|cancelled|shortage|constraint)\b)/i.test(txt)
        );
      };

      const isExpandingScope = (s: any) => {
        const txt = `${s.title || ""} ${s.summary || ""}`.toLowerCase();
        return (
          /çapraz sektör|yeni alan|genişleme|multimodal|genel amaçlı|cross-industry|broad adoption|universal/i.test(txt) &&
          s.impactVerdict !== "HIGH_BREAKTHROUGH"
        );
      };

      const isBreakthroughOrAccelerating = (s: any) => {
        const txt = `${s.title || ""} ${s.summary || ""}`.toLowerCase();
        return (
          !isExpandingScope(s) &&
          !isBottleneckOrDecelerating(s) &&
          (s.impactVerdict === "HIGH_BREAKTHROUGH" ||
            (s.trlLevel && s.trlLevel >= 6) ||
            /breakthrough|devrim|patent|saha|pilot|üretim|seri üretim|başarı|quantum|fusion|bci|humanoid|rekor|fda onay|commercial|deploy/i.test(txt))
        );
      };

      const acceleratingSignals = matchingLiveSignals.filter(isBreakthroughOrAccelerating);
      const bottleneckSignals = matchingLiveSignals.filter(isBottleneckOrDecelerating);
      const expandingSignals = matchingLiveSignals.filter(isExpandingScope);

      // Adversarial Guard 3: Conflicting Signals Resolution
      hasConflict = acceleratingSignals.length > 0 && bottleneckSignals.length > 0;

      if (hasConflict) {
        impactEffect = "UNCERTAINTY_CHANGE";
        hasLiveBreakthroughAcceleration = false;
        dynamicHorizonShiftYears = 0;
        acceleratedHorizonShiftYears = 0;
        const topAcc = acceleratingSignals[0];
        const topDec = bottleneckSignals[0];
        liveSignalNotice = `Çelişkili Canlı Sinyal Uyarısı: Bu dönüm noktası için hem hızlandırıcı ('${topAcc.title}') hem de darboğaz/kısıt ('${topDec.title}') kanıtlar mevcuttur. Çatışan dinamikler nedeniyle net zaman ufku nötr kalmakta, ancak stratejik belirsizlik artmaktadır.`;
        risk = `${risk} | Çelişkili Canlı Sinyal Uyarısı: Teknolojik ivmelenme ile regülatif/fiziksel darboğazlar aynı anda raporlanmıştır; belirsizlik yönetimi esastır.`;
      } else if (bottleneckSignals.length > 0) {
        impactEffect = "DECELERATING_BOTTLENECK";
        hasLiveBreakthroughAcceleration = false;
        const topSignal = bottleneckSignals[0];
        const fullText = `${topSignal.title || ""} ${topSignal.summary || ""}`.toLowerCase();
        // Dynamic shift: severe embargo/ban/moratorium/cancelled = +2 years, others = +1 year
        const isSevere = /(yasak|ambargo|moratoryum|iptal|çöküş|\b(ban|embargo|moratorium|deficit|cancelled)\b)/i.test(fullText);
        dynamicHorizonShiftYears = isSevere ? 2 : 1;
        acceleratedHorizonShiftYears = dynamicHorizonShiftYears;
        liveSignalNotice = `Darboğaz & Regülasyon Kısıtı: "${topSignal.title}". Bu gelişme, ${milestone.title} takviminde +${dynamicHorizonShiftYears} yıl gecikme ve uygulama darboğazı oluşturabilir.`;

        if (urgencyBand === "immediate" && targetYear > 2027) {
          urgencyBand = "near_term";
          urgencyTitle = `⏳ Temkinli Takvim (Gecikme & Darboğaz Sinyali: ${urgencyTitle})`;
          urgencySubtitle = `Otonom gelen canlı sinyal ("${topSignal.title}"), bu teknolojide regülasyon veya tedarik darboğazı nedeniyle ufku öteledi; aşırı erken sermaye bağlamaktan kaçının.`;
        }

        risk = `${risk} | Darboğaz & Kısıt Uyarısı: Canlı istihbarat sinyalleri (${topSignal.title}), teknolojik veya regülatif darboğazların takvimi +${dynamicHorizonShiftYears} yıl geciktirebileceğini göstermektedir.`;
      } else if (expandingSignals.length > 0) {
        impactEffect = "EXPANDING_SCOPE";
        const topSignal = expandingSignals[0];
        dynamicHorizonShiftYears = 0;
        acceleratedHorizonShiftYears = 0;
        liveSignalNotice = `Kapsam Genişleme Sinyali: "${topSignal.title}". Teknoloji farklı sektörlere ve çoklu modalitelere yayılıyor; adaptasyon kapsamınızı genişletin.`;
      } else if (acceleratingSignals.length > 0) {
        impactEffect = "ACCELERATING";
        hasLiveBreakthroughAcceleration = true;
        const topSignal = acceleratingSignals[0];
        const fullText = `${topSignal.title || ""} ${topSignal.summary || ""}`.toLowerCase();
        // Differentiate: TRL 9 or mature production breakthrough in far future = -2 years, else -1 year
        const isMaturityDoubleShift = (topSignal.trlLevel && topSignal.trlLevel >= 9) ||
          (topSignal.trlLevel && topSignal.trlLevel >= 8 && targetYear >= 2035 && /seri üretim|commercial deployment|küresel dağıtım/i.test(fullText));

        dynamicHorizonShiftYears = isMaturityDoubleShift ? -2 : -1;
        acceleratedHorizonShiftYears = dynamicHorizonShiftYears;
        liveSignalNotice = `Canlı İstihbarat Uyarısı: "${topSignal.title}" (Model TRL ${topSignal.trlLevel || 6}/9). Bu gelişme, ${milestone.title} takviminde ${Math.abs(dynamicHorizonShiftYears)} yıl ivmelenme baskısı oluşturabilir.`;

        if (urgencyBand === "near_term" && targetYear <= 2033) {
          urgencyBand = "immediate";
          urgencyTitle = `⚡ Şimdi Hazırlan (Canlı Sinyal İvmesi ile Hızlandırıldı: ${urgencyTitle})`;
          urgencySubtitle = `Otonom gelen canlı sinyal ("${topSignal.title}"), bu teknolojinin pilot fazını hızlandırdı; eylemi hemen ajandanıza alın.`;
        } else if (urgencyBand === "mid_term" && targetYear <= 2038) {
          urgencyBand = "near_term";
          urgencyTitle = `⚡ Hızlandırılmış Takvim (Canlı Sinyal İvmesi: ${urgencyTitle})`;
          urgencySubtitle = `Gelen canlı araştırma sinyalleri (${topSignal.title}) bu dönüm noktasının olgunlaşmasını öne çekiyor.`;
        }

        if (actionStatus === "completed" && outcomeStage !== "completed_pivot_needed") {
          reviewCheckpoint = `Canlı İstihbarat İvmesi ⚡ — Hızlandırılmış Gözden Geçirme: 3 Ay Sonra (Canlı sinyal ivmesi nedeniyle 12 aydan öne çekildi).`;
        }
        risk = `${risk} | Canlı Sinyal İvmelenmesi: Yeni gelen araştırma sinyalleri (${topSignal.title}) bu alandaki olgunlaşmanın öngörülenden daha hızlı gerçekleşebileceğini göstermektedir.`;
      } else {
        impactEffect = "UNCERTAINTY_CHANGE";
        dynamicHorizonShiftYears = 0;
        acceleratedHorizonShiftYears = 0;
      }
    }
  }

  // 7. Closed-Loop Decision Reassessment & Career Strategy Alignment (Aşama 42 & 42.1)
  let decisionReassessment: MilestoneActionPlan["decisionReassessment"] = undefined;
  const isReassessmentAcknowledged = getMilestoneReassessmentAcknowledged(targetYear, profile?.email);
  const topActiveSignal = matchingLiveSignals[0];

  if (hasFrictionOrLowYield) {
    const altOpt: "A" | "B" | "C" = activeOptionId === "C" ? "B" : activeOptionId === "A" ? "B" : "A";
    decisionReassessment = {
      needsReassessment: true,
      reassessmentType: "OUTCOME_FRICTION_PIVOT",
      currentOptionId: activeOptionId,
      recommendedAlternativeOption: altOpt,
      triggerSignalTitle: "Kullanıcı Gözden Geçirme & Deneyim Bildirimi",
      reason: `Bildirdiğiniz deneyim notunda (${userReflectionNote?.slice(0, 50)}...) verim düşüklüğü veya tıkanma saptandı. Seçili stratejinizin Seçenek ${altOpt} yönünde revize edilmesi önerilir.`,
      isAcknowledged: isReassessmentAcknowledged,
    };
  } else if (hasConflict) {
    if (activeOptionId === "A" || activeOptionId === "C") {
      decisionReassessment = {
        needsReassessment: true,
        reassessmentType: "UNCERTAINTY_HEDGING",
        currentOptionId: activeOptionId,
        recommendedAlternativeOption: "B",
        triggerSignalTitle: `${matchingLiveSignals[0]?.title || "Çelişkili Sinyaller"}`,
        reason: `Çelişkili canlı sinyaller (teknolojik atılım ile regülasyon/darboğaz kısıtı bir arada) belirsizliği artırmaktadır. Uç bir pozisyonda kalmak yerine 'Dengeli Hibritleşme' (Seçenek B) ile esnek adaptasyon sağlamanız önerilir.`,
        isAcknowledged: isReassessmentAcknowledged,
      };
    } else {
      decisionReassessment = {
        needsReassessment: false,
        reassessmentType: "ALIGNMENT_OPTIMAL",
        currentOptionId: "B",
        recommendedAlternativeOption: "B",
        triggerSignalTitle: `${matchingLiveSignals[0]?.title || "Çelişkili Sinyaller"}`,
        reason: `Yüksek belirsizlik ve çelişkili kanıt ortamında seçtiğiniz 'Dengeli Hibritleşme' (Seçenek B) en rasyonel stratejidir.`,
        isAcknowledged: isReassessmentAcknowledged,
      };
    }
  } else if (topActiveSignal) {
    if (activeOptionId === "A" && impactEffect === "ACCELERATING" && dynamicHorizonShiftYears <= -1) {
      const altOpt: "A" | "B" | "C" = isGrowthGoal ? "C" : "B";
      decisionReassessment = {
        needsReassessment: true,
        reassessmentType: "ACCELERATION_RISK",
        currentOptionId: "A",
        recommendedAlternativeOption: altOpt,
        triggerSignalTitle: topActiveSignal.title,
        reason: `Seçtiğiniz 'Koruyucu Uyum' (Seçenek A) stratejisi risk altında! Yeni gelen canlı atılım sinyali ('${topActiveSignal.title}'), bu teknolojinin ticarileşmesini hızlandırıyor (Ufuk: ${dynamicHorizonShiftYears} Yıl). Pasif kalmak yerine Seçenek ${altOpt} (${altOpt === "B" ? "Dengeli Hibritleşme" : "Stratejik Sıçrama"}) stratejisine geçmeniz önerilir.`,
        isAcknowledged: isReassessmentAcknowledged,
      };
    } else if (activeOptionId === "C" && impactEffect === "DECELERATING_BOTTLENECK" && dynamicHorizonShiftYears >= 1) {
      decisionReassessment = {
        needsReassessment: true,
        reassessmentType: "BOTTLENECK_PRUDENCE",
        currentOptionId: "C",
        recommendedAlternativeOption: "B",
        triggerSignalTitle: topActiveSignal.title,
        reason: `Seçtiğiniz 'Stratejik Sıçrama' (Seçenek C) stratejisi, gelen darboğaz ve kısıt sinyalleri ('${topActiveSignal.title}') nedeniyle yüksek atıl yatırım riski taşıyor. Ufkun +${dynamicHorizonShiftYears} yıl ötelenmesi muhtemeldir. Radikal geçiş yerine Seçenek B (Dengeli Hibritleşme) ile kademeli ilerlemeniz önerilir.`,
        isAcknowledged: isReassessmentAcknowledged,
      };
    } else {
      decisionReassessment = {
        needsReassessment: false,
        reassessmentType: "ALIGNMENT_OPTIMAL",
        currentOptionId: activeOptionId,
        recommendedAlternativeOption: activeOptionId,
        triggerSignalTitle: topActiveSignal.title,
        reason: `Mevcut Seçenek ${activeOptionId} stratejiniz gelen canlı sinyallerle uyumlu seyrediyor.`,
        isAcknowledged: isReassessmentAcknowledged,
      };
    }
  }

  const what = concreteAction;
  const why = isProfilePending
    ? "Küresel teknolojik dönüşümün genel istihdam dinamikleri ve günlük yaşam üzerindeki makro etkisi."
    : `${keyCapability} ve ${milestone.category} alanındaki olgunlaşmanın ${profDisplay} iş akışlarına ve aranan temel yetkinlik setine doğrudan yansıması.`;
  const forWhom = isProfilePending
    ? "Tüm Bireyler (Genel Gelecek Hazırlığı)"
    : `${profDisplay} (${profile?.age ? `${profile.age} Yaş, ` : ""}${profile?.seniority ? profile.seniority.toUpperCase() : "Uzman"})`;
  const reviewDate = reviewCheckpoint;

  const dynamicImpactAssessment = calculateDynamicImpactAssessment(matchingLiveSignals, milestone, targetYear);
  const modelRecommendation: "A" | "B" | "C" = decisionReassessment?.needsReassessment
    ? decisionReassessment.recommendedAlternativeOption
    : defaultRecommendedOption;
  const decisionHistory = profile?.email ? getMilestoneDecisionHistory(targetYear, profile.email) : [];

  return {
    urgencyBand,
    urgencyTitle,
    urgencySubtitle,
    timelinePhaseText,
    concreteAction,
    actionType,
    actionTypeLabel,
    roadmapLinkStatus,
    roadmapActionText,
    keyCapability,
    preparationHorizon,
    reviewCheckpoint,
    recommendationProvenance: profile?.profession && !isProfilePending ? "model_profile_derived" : "deterministic_projection",
    userAgeAtMilestone,
    isProfilePending,
    recommendedMilestoneFocus,
    what,
    why,
    forWhom,
    expectedValue,
    timeCost,
    risk,
    reversibility,
    reviewDate,
    decisionOptions,
    selectedOptionId: activeOptionId,
    selectedOption: activeOption,
    userDecision,
    modelRecommendation,
    recommendedOption: defaultRecommendedOption,
    decisionHistory,
    outcomeSemantics,
    dynamicImpactAssessment,
    isExplicitUserChoice,
    actionStatus,
    outcomeStage,
    outcomeFollowUpAdvice: outcomeFollowUpAdvice || undefined,
    userReflectionNote: userReflectionNote || undefined,
    employmentContext,
    realWorldOutcomeStatus,
    outcomeVerificationEvidence,
    hasLiveBreakthroughAcceleration,
    liveSignalNotice,
    liveSignalCount,
    acceleratedHorizonShiftYears,
    dynamicHorizonShiftYears,
    impactEffect,
    conflictingSignalsDetected: hasConflict,
    isReassessmentAcknowledged,
    decisionReassessment,
    relevantLiveSignals: matchingLiveSignals,
  };
}

/**
 * Lightweight user action status tracking using safeStorage.
 * ZERO server calls, ZERO database creation, completely client-isolated.
 */
export function getMilestoneActionStatus(year: number, userEmail?: string | null): ActionProgressStatus {
  const cleanEmail = (userEmail || "guest").toLowerCase().replace(/[^a-z0-9]/g, "_");
  const key = `user_milestone_action_status_${cleanEmail}`;
  const record = safeStorage.getJSON<Record<number, ActionProgressStatus>>(key, {});
  return record[year] || "seen";
}

export function setMilestoneActionStatus(
  year: number,
  status: ActionProgressStatus,
  userEmail?: string | null
): void {
  const cleanEmail = (userEmail || "guest").toLowerCase().replace(/[^a-z0-9]/g, "_");
  const key = `user_milestone_action_status_${cleanEmail}`;
  const record = safeStorage.getJSON<Record<number, ActionProgressStatus>>(key, {});
  record[year] = status;
  safeStorage.setJSON(key, record);
}

export function getAllMilestoneActionStatuses(userEmail?: string | null): Record<number, ActionProgressStatus> {
  const cleanEmail = (userEmail || "guest").toLowerCase().replace(/[^a-z0-9]/g, "_");
  const key = `user_milestone_action_status_${cleanEmail}`;
  return safeStorage.getJSON<Record<number, ActionProgressStatus>>(key, {});
}

/**
 * Lightweight personal reflection/action notes tracking using safeStorage.
 * Completely local, private, and zero database overhead.
 */
export function getMilestoneActionNote(year: number, userEmail?: string | null): string {
  const cleanEmail = (userEmail || "guest").toLowerCase().replace(/[^a-z0-9]/g, "_");
  const key = `user_milestone_action_notes_${cleanEmail}`;
  const record = safeStorage.getJSON<Record<number, string>>(key, {});
  return record[year] || "";
}

export function setMilestoneActionNote(
  year: number,
  note: string,
  userEmail?: string | null
): void {
  const cleanEmail = (userEmail || "guest").toLowerCase().replace(/[^a-z0-9]/g, "_");
  const key = `user_milestone_action_notes_${cleanEmail}`;
  const record = safeStorage.getJSON<Record<number, string>>(key, {});
  record[year] = note;
  safeStorage.setJSON(key, record);
}

export function getAllMilestoneActionNotes(userEmail?: string | null): Record<number, string> {
  const cleanEmail = (userEmail || "guest").toLowerCase().replace(/[^a-z0-9]/g, "_");
  const key = `user_milestone_action_notes_${cleanEmail}`;
  return safeStorage.getJSON<Record<number, string>>(key, {});
}

/**
 * Lightweight user selected strategic decision option ("A" | "B" | "C") tracking using safeStorage.
 * Completely client-isolated per user. ZERO server calls, ZERO database creation.
 */
export function getMilestoneDecisionHistory(year: number, userEmail?: string | null): MilestoneDecisionHistoryEntry[] {
  const cleanEmail = (userEmail || "guest").toLowerCase().replace(/[^a-z0-9]/g, "_");
  const key = `user_milestone_decision_history_${cleanEmail}`;
  const allHistory = safeStorage.getJSON<Record<number, MilestoneDecisionHistoryEntry[]>>(key, {});
  return allHistory[year] || [];
}

export function recordMilestoneDecisionHistory(
  year: number,
  selectedOptionId: "A" | "B" | "C",
  trigger: "user_manual_selection" | "recommendation_adopted" | "reassessment_retained" = "user_manual_selection",
  reason?: string,
  userEmail?: string | null
): void {
  const cleanEmail = (userEmail || "guest").toLowerCase().replace(/[^a-z0-9]/g, "_");
  const key = `user_milestone_decision_history_${cleanEmail}`;
  const allHistory = safeStorage.getJSON<Record<number, MilestoneDecisionHistoryEntry[]>>(key, {});
  const currentList = allHistory[year] || [];
  const previousOptionId = currentList.length > 0 ? currentList[currentList.length - 1].selectedOptionId : null;
  const entry: MilestoneDecisionHistoryEntry = {
    year,
    selectedOptionId,
    previousOptionId,
    selectedAt: new Date().toISOString(),
    trigger,
    reason,
  };
  allHistory[year] = [...currentList, entry];
  safeStorage.setJSON(key, allHistory);
}

/**
 * Lightweight user selected strategic decision option ("A" | "B" | "C") tracking using safeStorage.
 * Completely client-isolated per user. ZERO server calls, ZERO database creation.
 */
export function getMilestoneSelectedOption(year: number, userEmail?: string | null): "A" | "B" | "C" | null {
  const cleanEmail = (userEmail || "guest").toLowerCase().replace(/[^a-z0-9]/g, "_");
  const key = `user_milestone_selected_option_${cleanEmail}`;
  const record = safeStorage.getJSON<Record<number, "A" | "B" | "C">>(key, {});
  return record[year] || null;
}

export function setMilestoneSelectedOption(
  year: number,
  optionId: "A" | "B" | "C",
  userEmail?: string | null,
  trigger: "user_manual_selection" | "recommendation_adopted" | "reassessment_retained" = "user_manual_selection",
  reason?: string
): void {
  const cleanEmail = (userEmail || "guest").toLowerCase().replace(/[^a-z0-9]/g, "_");
  const key = `user_milestone_selected_option_${cleanEmail}`;
  const record = safeStorage.getJSON<Record<number, "A" | "B" | "C">>(key, {});
  record[year] = optionId;
  safeStorage.setJSON(key, record);
  recordMilestoneDecisionHistory(year, optionId, trigger, reason, userEmail);
}

export function getAllMilestoneSelectedOptions(userEmail?: string | null): Record<number, "A" | "B" | "C"> {
  const cleanEmail = (userEmail || "guest").toLowerCase().replace(/[^a-z0-9]/g, "_");
  const key = `user_milestone_selected_option_${cleanEmail}`;
  return safeStorage.getJSON<Record<number, "A" | "B" | "C">>(key, {});
}

/**
 * Lightweight user strategic reassessment acknowledgment tracking using safeStorage.
 * Completely local, respects user choice, and preserves user autonomy over model recommendations.
 */
export function getMilestoneReassessmentAcknowledged(year: number, userEmail?: string | null): boolean {
  const cleanEmail = (userEmail || "guest").toLowerCase().replace(/[^a-z0-9]/g, "_");
  const key = `user_reassessment_ack_${cleanEmail}`;
  const record = safeStorage.getJSON<Record<number, boolean>>(key, {});
  return !!record[year];
}

export function setMilestoneReassessmentAcknowledged(
  year: number,
  acknowledged: boolean = true,
  userEmail?: string | null
): void {
  const cleanEmail = (userEmail || "guest").toLowerCase().replace(/[^a-z0-9]/g, "_");
  const key = `user_reassessment_ack_${cleanEmail}`;
  const record = safeStorage.getJSON<Record<number, boolean>>(key, {});
  record[year] = acknowledged;
  safeStorage.setJSON(key, record);
}

export function getAllMilestoneReassessmentAcknowledged(userEmail?: string | null): Record<number, boolean> {
  const cleanEmail = (userEmail || "guest").toLowerCase().replace(/[^a-z0-9]/g, "_");
  const key = `user_reassessment_ack_${cleanEmail}`;
  return safeStorage.getJSON<Record<number, boolean>>(key, {});
}

/**
 * Derives roadmap feasibility, impact, risk, and sentiment dynamically from selected milestones and user profile.
 * ZERO hardcoded demo constants, mathematically grounded in milestone probabilities and user relevance.
 */
export function deriveRoadmapMetrics(
  milestones: Milestone[],
  profile?: UserProfile | null,
  userAge?: number
): {
  feasibilityScore: number;
  impactLevel: number;
  riskLevel: "Düşük" | "Orta" | "Yüksek" | "Kritik";
  sentiment: "optimistic" | "neutral" | "dystopian" | "transformative";
} {
  const selectedCount = Math.max(1, milestones.length);
  const rawAvgProb = milestones.reduce((acc, m) => acc + (m.probability || 70), 0) / selectedCount;
  const rawAvgImpact = milestones.reduce((acc, m) => acc + (m.impactLevel || 75), 0) / selectedCount;

  // Calculate personalized relevance weights from user profile
  const relevanceWeights = milestones.map((m) => {
    const pImpact = calculateMilestonePersonalImpact(m, profile);
    return pImpact.relevanceScore || 50;
  });
  const avgRelevance = relevanceWeights.reduce((a, b) => a + b, 0) / selectedCount;

  // Feasibility is derived from milestone probabilities weighted by user relevance and age adaptation bandwidth
  const effectiveAge = userAge || profile?.age;
  const ageFactor = effectiveAge ? (effectiveAge < 30 ? 5 : effectiveAge > 55 ? -5 : 0) : 0;
  const derivedFeasibility = Math.min(99, Math.max(20, Math.round(rawAvgProb * 0.7 + avgRelevance * 0.3 + ageFactor)));
  const derivedImpact = Math.min(99, Math.max(25, Math.round(rawAvgImpact * 0.75 + avgRelevance * 0.25)));

  let derivedRisk: "Düşük" | "Orta" | "Yüksek" | "Kritik" = "Orta";
  if (derivedFeasibility >= 75 && derivedImpact <= 80) {
    derivedRisk = "Düşük";
  } else if (derivedFeasibility < 50 || derivedImpact >= 90) {
    derivedRisk = "Yüksek";
  }

  let derivedSentiment: "optimistic" | "neutral" | "dystopian" | "transformative" = "neutral";
  if (derivedFeasibility >= 70 && derivedRisk === "Düşük") {
    derivedSentiment = "optimistic";
  } else if (derivedFeasibility < 50 || derivedRisk === "Yüksek") {
    derivedSentiment = "dystopian";
  } else if (derivedImpact >= 85) {
    derivedSentiment = "transformative";
  }

  return {
    feasibilityScore: derivedFeasibility,
    impactLevel: derivedImpact,
    riskLevel: derivedRisk,
    sentiment: derivedSentiment,
  };
}



