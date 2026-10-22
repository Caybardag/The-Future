import { Milestone, LanguageCode } from "../types";

export type ScenarioMode = "baseline" | "optimistic" | "dystopian";

// Localized scenario headers and narrative templates for all supported languages
const SCENARIO_LABELS: Record<ScenarioMode, Record<LanguageCode, { prefix: string; tagline: string; riskHeader: string; oppHeader: string; dailyPrefix: string }>> = {
  baseline: {
    tr: { prefix: " [Baz Senaryo] ", tagline: "Dengeli Teknolojik Patika", riskHeader: "Dengeli Etik Riskler", oppHeader: "Toplumsal Fırsatlar", dailyPrefix: "Günlük Yaşam Etkisi: " },
    en: { prefix: " [Baseline Scenario] ", tagline: "Balanced Technological Trajectory", riskHeader: "Balanced Ethical Risks", oppHeader: "Societal Opportunities", dailyPrefix: "Daily Life Impact: " },
    es: { prefix: " [Escenario Base] ", tagline: "Trayectoria Tecnológica Equilibrada", riskHeader: "Riesgos Éticos Equilibrados", oppHeader: "Oportunidades Sociales", dailyPrefix: "Impacto Cotidiano: " },
    de: { prefix: " [Basisszenario] ", tagline: "Ausgewogener Technologischer Pfad", riskHeader: "Ausgewogene Ethische Risiken", oppHeader: "Gesellschaftliche Chancen", dailyPrefix: "Alltagsauswirkung: " },
    fr: { prefix: " [Scénario de Base] ", tagline: "Trajectoire Technologique Équilibrée", riskHeader: "Risques Éthiques Équilibrés", oppHeader: "Opportunités Sociétales", dailyPrefix: "Impact Quotidien: " },
    zh: { prefix: " [基线场景] ", tagline: "平衡的科技演进路径", riskHeader: "平衡的伦理风险", oppHeader: "社会发展机遇", dailyPrefix: "日常生活影响: " },
    ja: { prefix: " [ベースラインシナリオ] ", tagline: "バランスの取れた技術進化軌道", riskHeader: "倫理的リスク", oppHeader: "社会的機会", dailyPrefix: "日常生活への影響: " }
  },
  optimistic: {
    tr: {
      prefix: " [İyimser Gelecek // Ütopik & Eşitlikçi Entegrasyon]: ",
      tagline: "Açık Kaynak Yönetim, Küresel Güvenlik ve Evrensel Refah Payı",
      riskHeader: "Sıkı Etik Denetimle Hapsedilmiş Riskler",
      oppHeader: "Demokratikleştirilmiş Evrensel Fırsatlar",
      dailyPrefix: "İyimser Günlük Etki: "
    },
    en: {
      prefix: " [Optimistic Future // Utopian & Equitable Integration]: ",
      tagline: "Open-Source Governance, Global Safety & Universal AI Dividend",
      riskHeader: "Mitigated & Audited Risks",
      oppHeader: "Democratized Universal Opportunities",
      dailyPrefix: "Optimistic Daily Impact: "
    },
    es: {
      prefix: " [Futuro Optimista // Integración Utópica y Equitativa]: ",
      tagline: "Gobernanza Abierta, Seguridad Global y Dividendo Universal",
      riskHeader: "Riesgos Mitigados y Auditados",
      oppHeader: "Oportunidades Universales Democratizadas",
      dailyPrefix: "Impacto Diario Optimista: "
    },
    de: {
      prefix: " [Optimistische Zukunft // Utopische & Gerechte Integration]: ",
      tagline: "Open-Source-Governance, Globale Sicherheit & Universelle AI-Dividende",
      riskHeader: "Mitigierte und Geprüfte Risiken",
      oppHeader: "Demokratisierte Universelle Chancen",
      dailyPrefix: "Optimistische Alltagsauswirkung: "
    },
    fr: {
      prefix: " [Futur Optimiste // Intégration Utopique et Équitable]: ",
      tagline: "Gouvernance Ouverte, Sécurité Mondiale et Dividende Universel",
      riskHeader: "Risques Atténués et Audités",
      oppHeader: "Opportunités Universelles Démocratisées",
      dailyPrefix: "Impact Quotidien Optimiste: "
    },
    zh: {
      prefix: " [乐观未来 // 乌托邦与平等融合]: ",
      tagline: "开源治理、全球安全与通用 AI 红利",
      riskHeader: "已受控与已审计风险",
      oppHeader: "全民民主化机遇",
      dailyPrefix: "乐观日常生活影响: "
    },
    ja: {
      prefix: " [楽観的未来 // ユートピア的・公平な統合]: ",
      tagline: "オープンソースガバナンス、グローバルセーフティ、ユニバーサルAI配当",
      riskHeader: "軽減・監査済みリスク",
      oppHeader: "民主化された普遍的機会",
      dailyPrefix: "楽観的日常影響: "
    }
  },
  dystopian: {
    tr: {
      prefix: " [Distopik Gelecek // Şirket Monopolleri & Kontrol Kaybı]: ",
      tagline: "Algoritmik Ayrımcılık, Dijital Biyo-Gözetim ve Toplumsal Kutuplaşma",
      riskHeader: "Kritik Varoluşsal ve Algoritmik Tehditler",
      oppHeader: "Yeraltı Direniş ve Merkeziyetsiz Mahremiyet Ağı",
      dailyPrefix: "Distopik Günlük Etki: "
    },
    en: {
      prefix: " [Dystopian Future // Corporate Monopolies & Loss of Control]: ",
      tagline: "Algorithmic Discrimination, Digital Bio-Surveillance & Social Fracture",
      riskHeader: "Critical Existential & Algorithmic Threats",
      oppHeader: "Underground Resistance & Privacy Mesh Networks",
      dailyPrefix: "Dystopian Daily Impact: "
    },
    es: {
      prefix: " [Futuro Distópico // Monopolios Corporativos y Pérdida de Control]: ",
      tagline: "Discriminación Algorítmica, Bio-Vigilancia Digital y Fractura Social",
      riskHeader: "Amenazas Existenciales y Algorítmicas Críticas",
      oppHeader: "Resistencia Subterránea y Redes de Privacidad",
      dailyPrefix: "Impacto Diario Distópico: "
    },
    de: {
      prefix: " [Dystopische Zukunft // Monopole & Kontrollverlust]: ",
      tagline: "Algorithmische Diskriminierung, Digitale Bio-Überwachung & Spaltung",
      riskHeader: "Kritische Existenzielle & Algorithmitische Bedrohungen",
      oppHeader: "Untergrundwiderstand & Dezentrale Datenschutznetze",
      dailyPrefix: "Dystopische Alltagsauswirkung: "
    },
    fr: {
      prefix: " [Futur Dystopique // Monopoles & Perte de Contrôle]: ",
      tagline: "Discrimination Algorithmique, Bio-Surveillance & Fracture Sociale",
      riskHeader: "Menaces Existentielles et Algorithmiques Critiques",
      oppHeader: "Résistance Clandestine & Réseaux de Confidentialité",
      dailyPrefix: "Impact Quotidien Dystopique: "
    },
    zh: {
      prefix: " [黑镜反乌托邦 // 巨头垄断与失控风险]: ",
      tagline: "算法歧视、数字生物监控与社会剧烈分化",
      riskHeader: "严重生存与算法威胁",
      oppHeader: "地下反抗与去中心化隐私网络",
      dailyPrefix: "反乌托邦日常生活影响: "
    },
    ja: {
      prefix: " [ディストピア的未来 // 企業独占と制御不能]: ",
      tagline: "アルゴリズム差別、デジタル生体監視、社会的分断",
      riskHeader: "致命的存在・アルゴリズム的脅威",
      oppHeader: "地下抵抗運動と分散型プライバシーメッシュ",
      dailyPrefix: "ディストピア的日常影響: "
    }
  }
};

/**
 * Transforms a baseline milestone into a rich scenario-specific milestone
 * based on Optimistic, Dystopian, or Baseline scenario modes.
 */
export function applyScenarioTransform(
  milestone: Milestone,
  scenarioMode: ScenarioMode,
  lang: LanguageCode = "tr"
): Milestone {
  if (!milestone) return milestone;
  if (scenarioMode === "baseline") return milestone;

  const labelConfig = SCENARIO_LABELS[scenarioMode][lang] || SCENARIO_LABELS[scenarioMode]["en"];

  if (scenarioMode === "optimistic") {
    // Optimistic Scenario Transformations
    const optimisticDescription = getOptimisticNarrative(milestone, lang, labelConfig.prefix);
    const optimisticDailyImpact = getOptimisticDailyImpact(milestone, lang, labelConfig.dailyPrefix);

    return {
      ...milestone,
      impactLevel: Math.min(100, milestone.impactLevel + 10),
      aiAutonomyIndex: Math.max(5, milestone.aiAutonomyIndex - 8), // Human-in-the-loop safety
      humanAugmentationIndex: Math.min(100, milestone.humanAugmentationIndex + 12),
      bioDigitalIntegrationRate: Math.min(100, milestone.bioDigitalIntegrationRate + 5),
      description: optimisticDescription,
      dailyLifeImpact: optimisticDailyImpact,
      ethicalRisks: [
        lang === "tr"
          ? "✅ HAFİFLETİLMİŞ RİSK: Otomatik etik kapatma anahtarları, bağımsız uluslararası denetim ve şeffaf algoritmik protokoller felaket risklerini nötralize etti."
          : "✅ MITIGATED RISK: Automated kill-switches, independent international auditing, and transparent open-source protocols neutralized catastrophic edge-cases.",
        ...(milestone.ethicalRisks || []).slice(0, 1)
      ],
      societalOpportunities: [
        lang === "tr"
          ? "🌟 EVRENSEL EŞİTLİK: Teknolojinin ürettiği tüm ekonomik değer ve sağlık imkanları kamuya açık evrensel refah payı olarak dağıtılıyor."
          : "🌟 UNIVERSAL EQUITY: All economic value and health breakthroughs generated by this technology are distributed as a public universal dividend.",
        ...(milestone.societalOpportunities || [])
      ]
    };
  } else if (scenarioMode === "dystopian") {
    // Dystopian Scenario Transformations
    const dystopianDescription = getDystopianNarrative(milestone, lang, labelConfig.prefix);
    const dystopianDailyImpact = getDystopianDailyImpact(milestone, lang, labelConfig.dailyPrefix);

    return {
      ...milestone,
      impactLevel: Math.min(100, milestone.impactLevel + 15),
      aiAutonomyIndex: Math.min(100, milestone.aiAutonomyIndex + 25), // Unchecked autonomy
      humanAugmentationIndex: Math.max(5, milestone.humanAugmentationIndex - 10),
      bioDigitalIntegrationRate: Math.min(100, milestone.bioDigitalIntegrationRate + 18),
      description: dystopianDescription,
      dailyLifeImpact: dystopianDailyImpact,
      ethicalRisks: [
        lang === "tr"
          ? "⚠️ KRİTİK TEHLİKE: Şirket monopolleri, şeffaflık çöküşü, insan denetiminin kaybedilmesi ve kitlelerin algoritmik olarak manipüle edilmesi."
          : "⚠️ CRITICAL HAZARD: Corporate monopolies, collapse of transparency, complete loss of human oversight, and mass algorithmic manipulation.",
        ...(milestone.ethicalRisks || [])
      ],
      societalOpportunities: [
        lang === "tr"
          ? "🛡️ YERALTI DİRENİŞİ: Merkeziyetsiz açık kaynak toplulukları, şifreli karanlık ağlar ve biyo-mahremiyet koruma hareketi filizlendi."
          : "🛡️ UNDERGROUND RESISTANCE: Decentralized open-source enclaves, encrypted dark meshes, and bio-privacy protection movements emerging.",
        ...(milestone.societalOpportunities || []).slice(0, 1)
      ]
    };
  }

  return milestone;
}

function getOptimisticNarrative(m: Milestone, lang: LanguageCode, prefix: string): string {
  const cat = (m.category || "").toLowerCase();
  
  if (lang === "tr") {
    if (cat.includes("ai") || cat.includes("software") || cat.includes("yapay zeka")) {
      return `${prefix}${m.title} teknolojisi, kamuya açık açık-kaynak standartlar ve sıkı etik kurulların denetiminde hayata geçti. ${m.year} yılı itibarıyla algoritmik karar mekanizmaları kâr odaklı şirketlerin elinden çıkarılıp insanlığın ortak refah fonuna devredildi. Bireyler dijital kimliklerini ve verilerini %100 kendi mülkiyetinde tutuyor.`;
    } else if (cat.includes("health") || cat.includes("bio") || cat.includes("sağlık") || cat.includes("genetics")) {
      return `${prefix}${m.title} atılımı, koruyucu hekimlik ve eşitlikçi biyoteknoloji reformuyla tüm toplum katmanlarına ücretsiz olarak ulaştırıldı. ${m.year} yılında kronik hastalıklar ve genetik deformasyonlar küresel çapta silinirken, yaşam kalitesi ve biyolojik direnç her yurttaş için fırsat eşitliğiyle yükseltildi.`;
    } else if (cat.includes("energy") || cat.includes("climate") || cat.includes("enerji") || cat.includes("environment")) {
      return `${prefix}${m.title} dönüşümü, merkezsiz yenilenebilir enerji şebekeleri ve sıfır-karbon ulaşımla küresel iklim krizini kalıcı olarak çözdü. ${m.year} itibarıyla temiz enerji maliyetleri sıfıra yaklaşırken, endüstriyel atıklar biyolojik ekosistemlerle %100 uyumlu dairesel ekonomiye dönüştürüldü.`;
    } else if (cat.includes("quantum") || cat.includes("compute") || cat.includes("kuantum")) {
      return `${prefix}${m.title} kapasitesi, uluslararası bilimsel konsorsiyumlar tarafından füzyon enerjisi, ilaç molekülü simülasyonu ve oda sıcaklığında süperiletkenlik araştırmalarında kolektif hizmete sunuldu. Kuantum şifreleme ile siber saldırılar ve veri hırsızlığı tarihe karıştı.`;
    }
    return `${prefix}${m.title} gelişimi, demokratik katılım, şeffaf kamu denetimi ve doğa dostu yüksek teknolojilerin entegrasyonuyla gerçekleşti. ${m.year} yılında bu atılım, toplumda gelir adaletini pekiştirirken yeni nesil nitelikli insani yaratıcılık alanlarının önünü açtı.`;
  }

  // English fallback
  if (cat.includes("ai") || cat.includes("software")) {
    return `${prefix}${m.title} developed under transparent open-source standards and strict ethical governance. By ${m.year}, algorithmic decisions were transferred to public welfare trusts, guaranteeing total personal data sovereignty.`;
  } else if (cat.includes("health") || cat.includes("bio")) {
    return `${prefix}${m.title} achieved universal coverage through public healthcare reforms. In ${m.year}, genetic risks were eliminated while biological longevity and quality of life were democratized globally.`;
  }
  return `${prefix}${m.title} advanced through democratic governance, eco-friendly design, and equitable access. In ${m.year}, it fostered social equity while empowering human creative endeavors.`;
}

function getDystopianNarrative(m: Milestone, lang: LanguageCode, prefix: string): string {
  const cat = (m.category || "").toLowerCase();

  if (lang === "tr") {
    if (cat.includes("ai") || cat.includes("software") || cat.includes("yapay zeka")) {
      return `${prefix}${m.title} teknolojisi, sınırlandırılmamış ticarileşme ve şirket monopolleri nedeniyle kitle gözetimi ve davranışsal manipülasyon silahına dönüştü. ${m.year} yılına gelindiğinde algoritmik kredi skoru düşük olan vatandaşlar temel kamu hizmetlerinden, seyahat özgürlüğünden ve finansal ekosistemden mahrum bırakılıyor.`;
    } else if (cat.includes("health") || cat.includes("bio") || cat.includes("sağlık") || cat.includes("genetics")) {
      return `${prefix}${m.title} Biyolojik müdahaleler ve genetik iyileştirmeler yalnızca aşırı zengin elitlerin erişebildiği fahiş abonelik modellerine bağlandı. ${m.year} itibarıyla toplum genetik ve biyolojik olarak iki ayrı sınıfa bölündü; alt gelir grupları sağlık sigortalarından tamamen elendi.`;
    } else if (cat.includes("energy") || cat.includes("climate") || cat.includes("enerji") || cat.includes("environment")) {
      return `${prefix}${m.title} Enerji ve hammadde kotaları özel karteller tarafından tekelleştirildi. ${m.year} yılında temiz hava, içilebilir su ve kesintisiz elektrik yüksek fiyatlı lüks tüketim maddelerine dönüştü; iklim göçmenleri algoritmik duvarlarla karantinaya alındı.`;
    } else if (cat.includes("quantum") || cat.includes("compute") || cat.includes("kuantum")) {
      return `${prefix}${m.title} Kuantum hesaplama gücü, askeri ve finansal monopollerin elinde sıradan yurttaşların tüm kriptografik mahremiyetini ve banka şifrelerini anında kırılabilir hale getirdi. Dijital mahremiyet ve anonimlik tamamen ortadan kalktı.`;
    }
    return `${prefix}${m.title} yetersiz regülasyonlar ve kâr hırsı yüzünden kontrolsüzce ticarileşti. ${m.year} yılında insani otonomi gasp edilirken, toplumsal kutuplaşma ve teknolojik bağımlılık kriz seviyesine ulaştı.`;
  }

  // English fallback
  if (cat.includes("ai") || cat.includes("software")) {
    return `${prefix}${m.title} was weaponized by unchecked corporate monopolies for bio-surveillance and social control. By ${m.year}, algorithmic scoring dictates access to employment, travel, and financial services.`;
  } else if (cat.includes("health") || cat.includes("bio")) {
    return `${prefix}${m.title} biological enhancements were locked behind exorbitant corporate paywalls. By ${m.year}, society fractured into genetic castes with baseline humans denied coverage.`;
  }
  return `${prefix}${m.title} proliferated under regulatory vacuums. By ${m.year}, it eroded personal autonomy, deepened socio-economic fractures, and enforced systemic dependency.`;
}

function getOptimisticDailyImpact(m: Milestone, lang: LanguageCode, dailyPrefix: string): string {
  if (lang === "tr") {
    return `${dailyPrefix}${m.dailyLifeImpact} Yurttaşlar haftalık çalışma sürelerinin 10 saate düşmesiyle sanata, bilime ve aileye vakit ayırır; tüm temel yaşam gereksinimleri evrensel kamu fonlarınca karşılanır.`;
  }
  return `${dailyPrefix}${m.dailyLifeImpact} Citizens enjoy drastically reduced work hours, devoting time to family and creative endeavors with guaranteed universal basic services.`;
}

function getDystopianDailyImpact(m: Milestone, lang: LanguageCode, dailyPrefix: string): string {
  if (lang === "tr") {
    return `${dailyPrefix}${m.dailyLifeImpact} Günlük yaşam 24 saat aralıksız biyometrik sensörler ve algoritmik verimlilik takibi altındadır; hedeflenen günlük üretim kotasını tutturamayan bireylerin dijital cüzdanları anında dondurulur.`;
  }
  return `${dailyPrefix}${m.dailyLifeImpact} Daily life is subjected to non-stop biometric efficiency tracking; missed productivity targets trigger immediate freeze on digital wallets.`;
}
