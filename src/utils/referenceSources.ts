import { Milestone, ResearchCitation, SignalIntelligenceItem, SignalCategory } from "../types";

export function getSignalsForMilestone(milestone: Milestone): SignalIntelligenceItem[] {
  if (milestone.signals && milestone.signals.length > 0) {
    return milestone.signals;
  }
  
  const derivedSignals: SignalIntelligenceItem[] = [];

  // 1. Patents -> patent_ip signal (if present: isVerifiedSignal = true, evidenceTier = IDENTIFIER_PRESENT)
  if (milestone.patents && milestone.patents.length > 0) {
    milestone.patents.forEach((pat, idx) => {
      derivedSignals.push({
        id: `sig_${milestone.year}_pat_${idx}`,
        category: "patent_ip",
        title: pat.title,
        sourceOrg: pat.assignee || "USPTO / Google Patents",
        summary: pat.abstractSnippet || `${milestone.title} alanında tescilli patent kaydı.`,
        url: pat.googlePatentsUrl,
        confidenceWeight: 90,
        signalStrength: "Güçlü Doğrulayıcı Sinyal (Saha/Onay/Patent)",
        isVerifiedSignal: true,
        evidenceTier: "IDENTIFIER_PRESENT",
        trlLevel: 7,
      });
    });
  } else {
    // If no patents, fallback patent search index: isVerifiedSignal = false, evidenceTier = URL_ONLY
    derivedSignals.push({
      id: `sig_${milestone.year}_pat_search`,
      category: "patent_ip",
      title: "Destekleyici Patent Arama İndeksi",
      sourceOrg: "Google Patents / USPTO Arama",
      summary: `${milestone.title} için patent ve fikri mülkiyet tarama indeksi.`,
      url: milestone.googlePatentsSearchUrl || "https://patents.google.com",
      confidenceWeight: 50,
      signalStrength: "Zayıf Sinyal (Erken Dönem)",
      isVerifiedSignal: false,
      evidenceTier: "URL_ONLY",
      trlLevel: 4,
    });
  }

  // 2. Add 5 search signals across categories with isVerifiedSignal = false
  const searchCategories: { cat: SignalCategory; name: string; org: string }[] = [
    { cat: "official_roadmap", name: "Resmi Şirket ve Enstitü Yol Haritası", org: "Sanayi & Teknoloji Konsorsiyumu" },
    { cat: "speed_trade_secret", name: "Açık Kaynak Model ve Ar-Ge Hız Sinyali", org: "Hugging Face / Model Gözlemevi" },
    { cat: "clinical_field_test", name: "Pilot Saha ve Klinik Uygulama İzleme", org: "Saha Test Raporları" },
    { cat: "regulatory_policy", name: "Regülasyon ve Kamu Politikası Gelişmeleri", org: "Kamu Düzenleme Kurulları" },
    { cat: "reputable_press", name: "Teknoloji Basını ve Sektörel Analiz", org: "Teknoloji & Bilim Yayınları" },
  ];

  searchCategories.forEach((sc, idx) => {
    derivedSignals.push({
      id: `sig_${milestone.year}_search_${idx}`,
      category: sc.cat,
      title: `${milestone.title} — ${sc.name}`,
      sourceOrg: sc.org,
      summary: `${milestone.title} gelişimi kapsamında ${sc.name} arama ve izleme akışı.`,
      url: `https://www.google.com/search?q=${encodeURIComponent(milestone.title + " " + sc.name)}`,
      confidenceWeight: 65,
      signalStrength: "Orta Güçlü Sinyal (Pilot/Duyuru)",
      isVerifiedSignal: false,
      evidenceTier: "URL_ONLY",
      trlLevel: 5,
    });
  });

  return derivedSignals;
}

export function getReferenceSourcesForMilestone(milestone: Milestone): ResearchCitation[] {
  const result: ResearchCitation[] = [];

  if (milestone.academicPapers && milestone.academicPapers.length > 0) {
    result.push(...milestone.academicPapers);
  }

  if (milestone.citations && milestone.citations.length > 0) {
    result.push(...milestone.citations);
  }

  if (milestone.patents && milestone.patents.length > 0) {
    milestone.patents.forEach((pat, idx) => {
      result.push({
        id: `cit_pat_${milestone.year}_${idx}`,
        title: pat.title,
        authors: [pat.assignee || "USPTO"],
        year: pat.yearFiled || milestone.year,
        source: `${pat.assignee || "Patent Sahibi"} (USPTO / Google Patents: ${pat.patentNumber})`,
        url: pat.googlePatentsUrl,
        type: "patent_trend",
        evidenceTier: "IDENTIFIER_PRESENT",
        isRealRecord: true,
      } as any);
    });
  }

  if (result.length === 0) {
    result.push({
      id: `cit_search_${milestone.year}`,
      title: `${milestone.title} Akademik Literatür ve Trend Taraması`,
      authors: ["Ar-Ge Gözlemevi"],
      year: milestone.year,
      source: "OpenAlex & Google Scholar Keşif İndeksi",
      url: `https://scholar.google.com/scholar?q=${encodeURIComponent(milestone.title)}`,
      type: "search_roadmap",
      evidenceTier: "URL_ONLY",
      isRealRecord: false,
    } as any);
  }

  return result;
}

export function getCitationTypeBadge(citation: ResearchCitation): { label: string; color: string } {
  if (citation.doi) {
    return { label: "DOI Doğrulanmış", color: "text-emerald-400 bg-emerald-950/60 border-emerald-500/30" };
  }
  return { label: "Akademik Literatür", color: "text-blue-400 bg-blue-950/60 border-blue-500/30" };
}

export function getSignalBadge(signal: SignalIntelligenceItem): { label: string; color: string } {
  if (signal.isVerifiedSignal) {
    return { label: "Doğrulanmış Sinyal", color: "text-cyan-400 bg-cyan-950/60 border-cyan-500/30" };
  }
  return { label: "Öncü Sinyal", color: "text-purple-400 bg-purple-950/60 border-purple-500/30" };
}
