export interface DomainCareerProfile {
  basePeakYear: number;
  baseAutomationPct: number;
  categoryName: string;
  keyAdaptationSkills: string[];
  summaryTemplate: string;
  personalizedVerdictTemplate: string;
  obsoleteTasks: string[];
  highValueHumanTasks: string[];
  strategicPhases: { phase: string; years: string; focus: string }[];
  recommendedToolsAndFrameworks: string[];
  marketValueImpact: { trend: "increasing" | "decreasing" | "transforming"; percentageEstimate: number; description: string };
  targetOpportunities: string[];
  quickWinSkills: string[];
}

export function detectDomainCareerProfile(
  primaryQuery?: string,
  profession: string = "Genel Profesyonel",
  seniorityLevel: string = "mid",
  personalGoal?: string,
  industrySector?: string
): DomainCareerProfile {
  const text = `${primaryQuery || ""} ${profession} ${industrySector || ""}`.toLowerCase();

  const isTech = text.includes("yazılım") || text.includes("software") || text.includes("developer") || text.includes("kod") || text.includes("data") || text.includes("ai");
  const isHealth = text.includes("tıp") || text.includes("doktor") || text.includes("sağlık") || text.includes("hekim") || text.includes("hemşire") || text.includes("biyo");
  const isFinance = text.includes("finans") || text.includes("muhasebe") || text.includes("banka") || text.includes("ekonomi");

  if (isTech) {
    return {
      basePeakYear: 2029,
      baseAutomationPct: 75,
      categoryName: "Yapay Zeka & Bilişim",
      keyAdaptationSkills: ["Yapay Zeka Ajan Orkestrasyonu", "Sistem Mimarlığı", "Kuantum Algoritma Temelleri"],
      summaryTemplate: "Yazılım mühendisliği, satır satır kod yazmaktan çoklu ajan sistemlerini mimari düzeyde yönetmeye evriliyor.",
      personalizedVerdictTemplate: "Rutin kodlama hızla otomatikleşirken, karmaşık sistem tasarımı ve güvenilirlik mimarisi en kritik değer haline geliyor.",
      obsoleteTasks: ["Rutin CRUD API yazımı", "Basit syntax düzeltmeleri", "Manuel unit test senaryoları"],
      highValueHumanTasks: ["Yüksek erişilebilirlik sistem mimarisi", "İş mantığı ve güvenlik doğrulaması", "Ajan etik ve kural orkestrasyonu"],
      strategicPhases: [
        { phase: "Aşama 1 (2026-2028)", years: "2026-2028", focus: "AI destekli kodlama ve agentic workflow entegrasyonu" },
        { phase: "Aşama 2 (2029-2032)", years: "2029-2032", focus: "AGI sistem mimarlığı ve otonom hata ayıklama süpervizyonu" },
        { phase: "Aşama 3 (2033+)", years: "2033+", focus: "Kuantum bilişim ve sibernetik arayüz yönetimi" },
      ],
      recommendedToolsAndFrameworks: ["Claude Code", "Cursor", "LangChain / LangGraph", "Docker", "Kubernetes"],
      marketValueImpact: { trend: "increasing", percentageEstimate: 45, description: "Mimari ve AI orkestrasyonunda uzmanlaşan mühendislerin değeri katlanarak artacaktır." },
      targetOpportunities: ["Otonom Ajan Mimarı", "Bilişsel Sistem Lideri", "Yapay Zeka Güvenlik Direktörü"],
      quickWinSkills: ["Prompt/Context mühendisliği", "Agentic eval testleri", "CI/CD otonom entegrasyonu"],
    };
  }

  if (isHealth) {
    return {
      basePeakYear: 2034,
      baseAutomationPct: 40,
      categoryName: "Biyoloji & Tıp",
      keyAdaptationSkills: ["Biyoinformatik & Genomik Analiz", "Yapay Zeka Destekli Tanı", "Biyo-etik Karar Alma"],
      summaryTemplate: "Sağlık sektörü, yapay zekanın veri analitiği ile hekimin empati ve cerrahi karar gücünün hibritleştiği bir döneme giriyor.",
      personalizedVerdictTemplate: "Tanı ve genomik modelleme algoritmalarla güçlenirken, hasta ilişkisi ve kritik klinik karar hekimin odağında kalır.",
      obsoleteTasks: ["Manuel laboratuvar veri girişi", "Standart radyoloji ön taramaları", "Rutin reçete protokolleri"],
      highValueHumanTasks: ["Kişiselleştirilmiş gen terapisi kararı", "Klinik empati ve hasta iletişimi", "Karmaşık cerrahi müdahaleler"],
      strategicPhases: [
        { phase: "Aşama 1 (2026-2029)", years: "2026-2029", focus: "Yapay zeka radyoloji ve genomik araçlarının kliniğe entegrasyonu" },
        { phase: "Aşama 2 (2030-2035)", years: "2030-2035", focus: "Hücresel gençleşme ve hedefe yönelik gen tedavileri süpervizyonu" },
        { phase: "Aşama 3 (2036+)", years: "2036+", focus: "Biyo-dijital ikiz simülasyonları ile önleyici tıp" },
      ],
      recommendedToolsAndFrameworks: ["AlphaFold 3", "Bio-GPT", "CRISPR-Cas9 modelleyicileri", "DICOM AI"],
      marketValueImpact: { trend: "increasing", percentageEstimate: 35, description: "Yeni nesil biyoteknoloji ve AI tanı araçlarını kullanan hekimler öne çıkacaktır." },
      targetOpportunities: ["Genomik Tıp Uzmanı", "Biyo-dijital İkiz Küratörü", "Sentetik Biyoloji Danışmanı"],
      quickWinSkills: ["Biyoinformatik veri okuryazarlığı", "AI destekli görüntüleme yorumlama"],
    };
  }

  return {
    basePeakYear: 2031,
    baseAutomationPct: 55,
    categoryName: industrySector || "Sosyoloji & Ekonomi",
    keyAdaptationSkills: ["Yapay Zeka Okuryazarlığı", "Stratejik Problem Çözme", "Karmaşık Karar Alma"],
    summaryTemplate: `${profession} rolü, teknolojik ilerlemelerle birlikte icracı olmaktan çıkıp stratejik yönlendirici olmaya dönüşüyor.`,
    personalizedVerdictTemplate: "Rutin operasyonlar otonomlaşırken, insani vizyon, etik ve stratejik koordinasyon kritik önem taşır.",
    obsoleteTasks: ["Tekrarlayan raporlama", "Veri derleme ve formatlama", "Rutin yazışmalar"],
    highValueHumanTasks: ["Stratejik vizyon belirleme", "Müzakere ve insan ilişkileri", "Yaratıcı problem çözümü"],
    strategicPhases: [
      { phase: "Aşama 1 (2026-2028)", years: "2026-2028", focus: "Günlük iş akışlarında AI asistanlarının kullanımı" },
      { phase: "Aşama 2 (2029-2033)", years: "2029-2033", focus: "Stratejik analiz ve çok kanallı operasyon yönetimi" },
      { phase: "Aşama 3 (2034+)", years: "2034+", focus: "Post-endüstriyel ekosistem liderliği" },
    ],
    recommendedToolsAndFrameworks: ["Gemini 2.5", "Automation workflows", "BI Analitik araçları"],
    marketValueImpact: { trend: "transforming", percentageEstimate: 20, description: "Teknolojik dönüşüme hızla adapte olan profesyoneller değer kazanacaktır." },
    targetOpportunities: ["Stratejik Dönüşüm Lideri", "Yapay Zeka Operasyon Danışmanı"],
    quickWinSkills: ["Büyük dil modelleri ile hızlı analiz", "Süreç otomasyonu temelleri"],
  };
}
