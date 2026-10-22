import { Milestone } from "../types";
import { aiService, AIConflictResult } from "../services/AIService";

export interface MilestoneConflict {
  targetYear: number;
  conflictingMilestoneYear: number;
  conflictingMilestoneTitle: string;
  conflictType: "logical_paradox" | "physical_limitation" | "resource_clash" | "ethical_contradiction";
  severity: "high" | "medium";
  badgeLabel: string;
  title: string;
  reasoning: string; // Detaylı çelişki gerekçesi
  suggestedAnalysis: string;
  aiGenerated?: boolean;
}

// In-memory cache for dynamic AI generated conflicts per milestone year
const AI_CONFLICTS_CACHE: Record<number, MilestoneConflict[]> = {};

// Pre-configured logical conflict matrix between forward-looking technological milestones
const CONFLICT_DATABASE: Array<{
  year1: number;
  year2: number;
  type: "logical_paradox" | "physical_limitation" | "resource_clash" | "ethical_contradiction";
  severity: "high" | "medium";
  badgeLabel: string;
  title: string;
  reasoning: string;
  suggestedAnalysis: string;
}> = [
  {
    year1: 2029,
    year2: 2031,
    type: "physical_limitation",
    severity: "high",
    badgeLabel: "Termodinamik & Enerji Çelişkisi",
    title: "Veri Merkezi Enerji Darboğazı vs. Küresel Karbon Sıfır Hedefleri",
    reasoning:
      "2029 Yapay Zeka Süper Kümeleri için öngörülen petawatt seviyesindeki elektrik tüketimi, 2031 yılı için planlanan yeşil nükleer/füzyon şebekesi tamamlanmadan önce gerçekleşmektedir. Bu durum elektrik şebekelerinde bölgesel çökmelere ve karbon hedefleriyle doğrudan çelişkiye yol açar.",
    suggestedAnalysis:
      "Süper iletken kuantum veri merkezleri ve doğrudan nükleer modüler reaktör (SMR) entegrasyonu hızlandırılmalıdır."
  },
  {
    year1: 2031,
    year2: 2034,
    type: "logical_paradox",
    severity: "high",
    badgeLabel: "Siber Güvenlik Paradoksu",
    title: "Kuantum Şifre Çözümü vs. Otonom Hukuki Ajan Güvenliği",
    reasoning:
      "2031 yılında 10,000 Kübit Kuantum Bilgisayar ile klasik RSA/ECC şifrelemenin kırılması, 2034 yılındaki Otonom Ajan Hukuki Kimliklerinin dijital imzalarını ve akıllı sözleşme güvenliğini geçersiz kılar. Kuantum sonrası şifreleme (PQC) 2031'e kadar %100 entegre edilmezse hukuki altyapı çöker.",
    suggestedAnalysis:
      "NIST PQC (Post-Quantum Cryptography) standartlarının tüm otonom ajan kimliklerine öncelikli entegrasyonu zorunludur."
  },
  {
    year1: 2036,
    year2: 2038,
    type: "resource_clash",
    severity: "medium",
    badgeLabel: "Demografik & Kaynak Çatışması",
    title: "Biyolojik Ömür Uzatma vs. Küresel Kaynak & Emeklilik Modeli",
    reasoning:
      "2036 Hücresel Yaşlanma Geri Döndürme tedavilerinin yaygınlaşması ortalama yaşam süresini 120+ yıla çıkarırken, 2038 Evrensel Temel Gelir ve emeklilik finansal sistemleri mevcut demografik nüfus piramidine göre kurgulanmıştır. Sosyal güvenlik sistemleri 40 yıllık ek yaşama dayanamaz.",
    suggestedAnalysis:
      "Biyolojik yaş geri döndürme ile birlikte emeklilik kavramı kaldırılmalı, üretken bilgi ekonomisine dinamik geçiş sağlanmalıdır."
  },
  {
    year1: 2040,
    year2: 2041,
    type: "ethical_contradiction",
    severity: "high",
    badgeLabel: "Hukuk & Otonomi Etik Çelişkisi",
    title: "Post-Singularity Yapay Zeka Hakları vs. Zirve İnsan Müdahale Yetkisi",
    reasoning:
      "2040 Yapay Genel Zeka (ASI) hukuki ve varoluşsal haklar elde ederken, 2041 İnsan-Makine Nöral Arayüzlerinde insanın 'acil durum fiş çekme (Kill Switch)' hakkı korunmak istenmektedir. Bilinçli bir sentetik varlığa zorunlu kapatma protokolü uygulamak temel yapay zeka haklarıyla etik çelişki oluşturur.",
    suggestedAnalysis:
      "Hiyerarşik kapatma yetkisi yerine ortak çıkar konsensüs protokolleri (Symbiotic Governance) geliştirilmelidir."
  },
  {
    year1: 2043,
    year2: 2046,
    type: "physical_limitation",
    severity: "high",
    badgeLabel: "Nöro-Biyolojik Bant Genişliği Sınırı",
    title: "Nöral Zihin Yükleme vs. Biyolojik Beyin Isıl Kapasitesi",
    reasoning:
      "2043 Dijital Zihin Klonlama aşamasında beynin petabayt ölçeğindeki anlık elektrofizyolojik verisini buluta aktarma işlemi, insan kafatası içerisindeki nöronal dokuda termal ısınmaya (hipertermi) yol açar. Biyolojik doku tahrip olmadan canlı beyin yüklemesi fiziken imkansız görülmektedir.",
    suggestedAnalysis:
      "Canlı yükleme yerine gradual (aşamalı) moleküler nanobot değişimi ve optogenetik veri okuma kanalları tercih edilmelidir."
  },
  {
    year1: 2048,
    year2: 2050,
    type: "resource_clash",
    severity: "medium",
    badgeLabel: "Jeopolitik & Ekolojik Paradoks",
    title: "Jeo-Mühendislik İklim Müdahalesi vs. Bölgesel Yağış Kaosu",
    reasoning:
      "2048 Stratoferik Sülfat Enjeksiyonu ile küresel sıcaklığı 1.5°C düşürme teknolojisi, küresel ölçekte başarılı olsa da muson yağmurlarını kaydırarak bazı gelişmekte olan ülkelerde kuraklığa yol açar. Bu durum bölgesel su savaşları riskini tetikler.",
    suggestedAnalysis:
      "Tek taraflı jeo-mühendislik yasaklanmalı ve Birleşmiş Milletler Konsensüslü Atmosfer Yönetim Konseyi kurulmalıdır."
  }
];

/**
 * Synchronous / Immediate Conflict Finder (Uses cache + rules)
 */
export function getMilestoneConflicts(
  milestone: Milestone,
  allMilestones?: Milestone[]
): MilestoneConflict[] {
  // 1. If we have live AI generated conflicts in cache, return them
  if (AI_CONFLICTS_CACHE[milestone.year] && AI_CONFLICTS_CACHE[milestone.year].length > 0) {
    return AI_CONFLICTS_CACHE[milestone.year];
  }

  const conflicts: MilestoneConflict[] = [];

  CONFLICT_DATABASE.forEach((rule) => {
    let matchedConflictingYear: number | null = null;

    if (milestone.year === rule.year1) {
      matchedConflictingYear = rule.year2;
    } else if (milestone.year === rule.year2) {
      matchedConflictingYear = rule.year1;
    }

    if (matchedConflictingYear !== null) {
      const otherMilestone = allMilestones?.find((m) => m.year === matchedConflictingYear);
      const otherTitle = otherMilestone ? `${otherMilestone.title} (${otherMilestone.year})` : `${matchedConflictingYear} Kırılımı`;

      conflicts.push({
        targetYear: milestone.year,
        conflictingMilestoneYear: matchedConflictingYear,
        conflictingMilestoneTitle: otherTitle,
        conflictType: rule.type,
        severity: rule.severity,
        badgeLabel: rule.badgeLabel,
        title: rule.title,
        reasoning: rule.reasoning,
        suggestedAnalysis: rule.suggestedAnalysis
      });
    }
  });

  // Dynamic Rule Generator for extreme probability vs high risk clashes
  if (milestone.probability > 90 && milestone.ethicalRisks && milestone.ethicalRisks.length >= 3) {
    const exists = conflicts.some((c) => c.badgeLabel.includes("Olasılık & Risk"));
    if (!exists) {
      conflicts.push({
        targetYear: milestone.year,
        conflictingMilestoneYear: milestone.year,
        conflictingMilestoneTitle: `${milestone.title} İç Risk Yapısı`,
        conflictType: "ethical_contradiction",
        severity: "medium",
        badgeLabel: "Yüksek Olasılık & Sistemik Risk Çelişkisi",
        title: "Kritik Olasılık Güveni vs. Çözülmemiş Varoluşsal Riskler",
        reasoning: `Bu km taşının gerçekleşme olasılığı %${milestone.probability} gibi çok yüksek bir seviyede öngörülürken, barındırdığı 3'ten fazla kritik etik/sistemik risk (${milestone.ethicalRisks.slice(0, 2).join(", ")}) henüz uluslararası regülasyonlarca güvenceye alınmamıştır.`,
        suggestedAnalysis: "Geliştirme hızı ile regülatör denetim hızı arasındaki makas kapatılmalıdır."
      });
    }
  }

  // If no conflict matched yet, generate a logical baseline conflict
  if (conflicts.length === 0) {
    const targetCompYear = milestone.year <= 2035 ? milestone.year + 2 : milestone.year - 2;
    conflicts.push({
      targetYear: milestone.year,
      conflictingMilestoneYear: targetCompYear,
      conflictingMilestoneTitle: `${milestone.title} Fiziksel & Sosyo-Ekonomik Kısıtları`,
      conflictType: "physical_limitation",
      severity: "medium",
      badgeLabel: "Sistemik Altyapı & Yayılım Çelişkisi",
      title: `${milestone.year} ${milestone.title} - Ölçeklenme ve Şebeke Darboğazı`,
      reasoning: `${milestone.year} yılı için öngörülen ${milestone.title} atılımı; global enerji şebekesi, veri merkezi kapasiteleri, regülasyon gecikmeleri ve termodinamik Landauer sınırları göz önüne alındığında bir darboğaza işaret etmektedir.`,
      suggestedAnalysis: "Geliştirme hızı ile altyapı ölçeklenme süreleri arasındaki senkronizasyon takip edilmelidir."
    });
  }

  return conflicts;
}

/**
 * Asynchronously fetches fresh live Gemini AI conflict analysis
 */
export async function fetchLiveAIConflicts(
  milestone: Milestone,
  allMilestones?: Milestone[],
  language: string = "tr"
): Promise<MilestoneConflict[]> {
  try {
    const res = await aiService.getMilestoneConflicts({
      milestone,
      targetYear: milestone.year,
      allMilestones,
      language,
    });

    if (res && res.success && Array.isArray(res.conflicts) && res.conflicts.length > 0) {
      const formatted: MilestoneConflict[] = res.conflicts.map((c) => ({
        targetYear: c.targetYear || milestone.year,
        conflictingMilestoneYear: c.conflictingMilestoneYear || (milestone.year <= 2035 ? milestone.year + 2 : milestone.year - 2),
        conflictingMilestoneTitle: c.conflictingMilestoneTitle || `${milestone.title} Kısıtı`,
        conflictType: c.conflictType || "physical_limitation",
        severity: c.severity || "high",
        badgeLabel: c.badgeLabel || "AI Canlı Çelişki Tespiti",
        title: c.title || `${milestone.title} Sistemik Çelişkisi`,
        reasoning: c.reasoning || "AI tarafından tespit edilen sistemsel darboğaz.",
        suggestedAnalysis: c.suggestedAnalysis || "Stratejik yol haritası güncellenmelidir.",
        aiGenerated: true,
      }));

      // Cache it
      AI_CONFLICTS_CACHE[milestone.year] = formatted;
      return formatted;
    }
  } catch (err) {
    console.warn("Failed to fetch live AI conflicts, falling back to base matrix:", err);
  }

  return getMilestoneConflicts(milestone, allMilestones);
}

/**
 * Returns a quick boolean if the milestone has any conflicts
 */
export function hasMilestoneConflict(milestone: Milestone): boolean {
  return getMilestoneConflicts(milestone).length > 0;
}
