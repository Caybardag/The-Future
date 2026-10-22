import { Milestone, FiveLayerWorldState } from "../types";

/**
 * Resolves or synthesizes a rich 5-Layer World State for any given Milestone.
 * Layers:
 * 1. Technological Breakthroughs (AI, Bio-Health, Energy)
 * 2. Daily Life & Bio-Metrics (Morning routine, user age correlation, bio-interfaces)
 * 3. Macro-Economics & Geopolitics (Automation rate, new professions, power hub)
 * 4. Ethics, Risk & Countermeasure Radar (Critical threats & algorithmic shields)
 * 5. TRL & Scientific Readiness (TRL 1-9, academic consensus, domino effects)
 */
export function getFiveLayerWorldState(milestone: Milestone, userBirthYear: number = 1995): FiveLayerWorldState {
  if (milestone.worldState) {
    return milestone.worldState;
  }

  const { year, title, category, impactLevel, aiAutonomyIndex, humanAugmentationIndex } = milestone;
  const userAge = Math.max(0, year - userBirthYear);
  const deltaYears = Math.max(0, year - 2026);

  // Layer 1: 3 Focal Breakthroughs
  let aiFocus = "";
  let bioFocus = "";
  let energyFocus = "";

  if (year <= 2030) {
    aiFocus = `Otonom agent sürüleri, yerel cihaz üzerinde çalışan 100B+ parametreli mikro modeller ve kodlama/finans işlerinde %70 otonomi.`;
    bioFocus = `mRNA kişiselleştirilmiş kanser aşıları, CRISPR tabanlı gen terapilerinin ilk FDA onayları ve non-invaziv glukoz/vital takip giysileri.`;
    energyFocus = `Katı hal (solid-state) pillerin araçlarda yaygınlaşması (%50 menzil artışı) ve yeni nesil şebeke ölçeğinde perovskit güneş panelleri.`;
  } else if (year <= 2040) {
    aiFocus = `Yapay Genel Zeka (AGI) eşiği, kendi kendini denetleyen ve mimarisini yeniden derleyen bilişsel orkestrasyon ağları.`;
    bioFocus = `3D biyo-yazıcılarla doku ve damar iskeleleri basımı, epigenetik yaş geriletme protokolleri ve nöral arayüz (BCI) tüketici kulaklıkları.`;
    energyFocus = `Ticari füzyon prototipleri, kablosuz kentsel enerji iletimi ve karbon yakalama nanofiltrelerinin kentsel şebekelere entegrasyonu.`;
  } else {
    aiFocus = `Yapay Süper Zeka (ASI), kuantum dağıtık bilişim matrisi ve post-biyolojik sentetik zeka kolektifleri.`;
    bioFocus = `Tam zihinsel yedekleme (mind uploading) pilotları, telomer uzatma ile biyolojik yaşın dondurulması ve sentetik organ nakilleri.`;
    energyFocus = `Yörünge güneş enerjisi uyduları, kuantum sıfır-nokta enerji araştırmaları ve küresel sınırsız temiz enerji şebekesi.`;
  }

  // Layer 2: Daily Life & Bio Metrics
  let morningSnippet = "";
  let bioInterfaces: string[] = [];

  if (year <= 2030) {
    morningSnippet = `Akıllı lensiniz ve kulak içi biyo-asistanınız siz uyanmadan günlük kan tahlilinizi ve otonom ajansınızın gece yaptığı 40 işlemi önünüze fısıldar.`;
    bioInterfaces = ["Giyilebilir Biyo-Halka", "Akıllı AR Gözlük", "Non-İnvaziv Deri Sensörü"];
  } else if (year <= 2040) {
    morningSnippet = `Fiziksel ekranlar tarihe karıştı; ortam fotonları ve retinaya direkt yansıtılan nöral arayüzle düşünce hızıyla iletişim kuruyorsunuz.`;
    bioInterfaces = ["Nöral BCI Kafa Bandı", "Doku İçi Biyo-Metrik Çip", "Haptik Deri Giyim"];
  } else {
    morningSnippet = `Biyolojik bedeniniz ile dijital ikiziniz eşzamanlı uyanır. Zihinsel odaklanmanız kuantum ağındaki kişisel AI kümenizle senkronize edilir.`;
    bioInterfaces = ["Kortikal Nöro-Köprü", "Sentetik Biyo-Nanobotlar", "Hücresel Yenileyici Pod"];
  }

  // Layer 3: Macro Economics & Geopolitics
  const autoRate = Math.min(95, Math.max(25, Math.round(30 + deltaYears * 2.2 + (aiAutonomyIndex * 0.4))));
  let professions: string[] = [];
  let geoHub = "";

  if (year <= 2030) {
    professions = ["Ajan Orkestrasyon Mimarı", "Biyo-Veri Etiği Denetçisi", "Kuantum Güvenlik Uzmanı"];
    geoHub = "Kuzey Amerika & Doğu Asya Hibrit Çip-Yapay Zeka Aksı";
  } else if (year <= 2040) {
    professions = ["Sentetik Biyoloji Kodlayıcısı", "Nöral Arayüz Psikoloğu", "Otonom Şehir Algoritma Mühendisi"];
    geoHub = "Dağıtık Kuantum Ağları & Küresel Nöro-Ekonomi Birlikleri";
  } else {
    professions = ["Bilinç Transferi Mühendisi", "Gezegenlerarası Kaynak Lojistikçisi", "Kozmik Simülasyon Mimarı"];
    geoHub = "Yörüngesel Hesaplama Küreleri & Uluslarüstü Dijital Konsorsiyumlar";
  }

  // Layer 4: Ethics & Risk Radar
  let threat = "";
  let shields = "";
  const vulnScore = Math.min(95, Math.max(30, Math.round(40 + (impactLevel * 0.45))));

  if (year <= 2030) {
    threat = `Otonom ajanların finansal piyasalarda oluşturabileceği ani çöküşler (flash crash) ve sentetik medya dezenformasyonu.`;
    shields = `Kriptografik dijital filigran yasaları (EU AI Act v2), donanım düzeyinde kilitli model ağırlıkları ve etik denetim algoritmaları.`;
  } else if (year <= 2040) {
    threat = `Nöral arayüzlerin siber saldırıya uğraması (nöro-hacking) ve genetik tasarım eşitsizliği (biyo-kast sistemi).`;
    shields = `Kuantum kriptografik biyolojik kimlikleme, küresel genetik düzenleme anlaşmaları ve nöro-haklar anayasası.`;
  } else {
    threat = `Yapay Süper Zekanın (ASI) insan hedefleriyle uyumsuzluğu (alignment failure) ve biyolojik türün varoluşsal entropisi.`;
    shields = `Kozmik hizalama protokolleri, dağıtık bilinç kilitleri ve simüle edilmiş güvenli sandbox evrenleri.`;
  }

  // Layer 5: TRL & Scientific Readiness
  const trl = year <= 2028 ? 8 : year <= 2035 ? 6 : year <= 2045 ? 4 : 2;
  const consensus = Math.max(35, Math.min(98, Math.round(95 - deltaYears * 1.6)));

  const dominoList = [
    `${year + 4}: ${title} teknolojisinin tüketici pazarına inerek maliyetleri %60 düşürmesi.`,
    `${year + 8}: Biyo-dijital entegrasyonun yeni endüstriyel standart haline gelmesi ve regülasyonların evrilmesi.`,
    `${Math.min(2060, year + 15)}: Singularity ve post-insan medeniyet altyapısının temel yapı taşına dönüşmesi.`,
  ];

  return {
    technologicalBreakthroughs: {
      aiAndComputing: aiFocus,
      biologyAndHealth: bioFocus,
      energyAndInfra: energyFocus,
    },
    dailyLifeAndBio: {
      morningRoutineSnippet: morningSnippet,
      userAgeFormula: `Bu yılda ${userAge} yaşındasınız. Vücudunuz ve mesleğiniz aşağıdaki biyo-teknolojik adaptasyon standartlarıyla etkileşimdedir.`,
      commonBioInterfaces: bioInterfaces,
    },
    macroEconomicsAndGeo: {
      automatedJobsRate: autoRate,
      emergingProfessions: professions,
      geopoliticalPowerHub: geoHub,
    },
    riskAndCountermeasures: {
      criticalThreat: threat,
      algorithmicDefenses: shields,
      vulnerabilityScore: vulnScore,
    },
    scientificReadiness: {
      trlLevel: trl,
      trlType: "model_estimated",
      academicConsensusRate: consensus,
      consensusType: "model_projected",
      supportingSignalCount: milestone.signals?.length || 6,
    },
    dominoEffects: dominoList,
  };
}
