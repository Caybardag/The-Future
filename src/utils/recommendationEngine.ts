import { ViewMode, Milestone, CategoryType, LanguageCode } from "../types";

export interface RecommendationCardData {
  id: string;
  targetView: ViewMode;
  targetYear?: number;
  badge: string;
  badgeColor: "emerald" | "cyan" | "purple" | "amber" | "rose" | "blue";
  title: string;
  description: string;
  actionText: string;
  creditCost: number;
  featureKey: string;
  highlightTag?: string;
}

export interface RecommendationContext {
  sourceView: ViewMode;
  currentMilestone?: Milestone | null;
  profession?: string;
  riskScore?: number;
  selectedCategory?: CategoryType | "all";
  scenarioMode?: "baseline" | "optimistic" | "dystopian";
  userCredits?: number;
  language?: LanguageCode;
}

export function getSmartRecommendations(ctx: RecommendationContext): RecommendationCardData[] {
  const lang = ctx.language || "tr";
  const results: RecommendationCardData[] = [];
  const year = ctx.currentMilestone?.year || 2030;
  const milestoneTitle = ctx.currentMilestone?.title || (lang === "tr" ? "Yapay Zeka Devrimi" : "AI Revolution");

  switch (ctx.sourceView) {
    case "timeline":
      // 1. Job Risk Radar
      results.push({
        id: "rec_timeline_job_risk",
        targetView: "job_risk",
        targetYear: year,
        badge: lang === "tr" ? "Kişisel Tehdit Analizi" : "Personal Risk Audit",
        badgeColor: "rose",
        title: lang === "tr" 
          ? `${year} (${milestoneTitle}) Mesleğinizi Nasıl Etkileyecek?` 
          : `How will ${year} (${milestoneTitle}) impact your profession?`,
        description: lang === "tr"
          ? "Bu teknolojinin otomasyon dalgasında mesleğinizin hayatta kalma ve dönüşüm katsayısını hemen hesaplayın."
          : "Calculate your job's survival and augmentation index against this automation breakthrough.",
        actionText: lang === "tr" ? "Meslek Riskimi Hesapla" : "Analyze Job Risk",
        creditCost: 15,
        featureKey: "job_risk_analysis",
        highlightTag: lang === "tr" ? "🔥 %87 İlgi Görüyor" : "🔥 87% Popular"
      });

      // 2. Butterfly Effect Simulator
      results.push({
        id: "rec_timeline_butterfly",
        targetView: "butterfly",
        targetYear: year,
        badge: lang === "tr" ? "Kelebek Etkisi Simülatörü" : "Butterfly Effect Sim",
        badgeColor: "purple",
        title: lang === "tr" 
          ? `Ya ${year} Yılındaki Bu Kırılma Yaşanmasaydı?` 
          : `What if this ${year} breakthrough never happened?`,
        description: lang === "tr"
          ? "Bu kilometre taşını tarihten silin; domino etkisiyle sonraki teknolojilerin nasıl çöktüğünü simüle edin."
          : "Erase this milestone from history and simulate the cascading timeline collapse.",
        actionText: lang === "tr" ? "Alternatif Evreni Simüle Et" : "Simulate Alternate Timeline",
        creditCost: 15,
        featureKey: "butterfly_effect",
        highlightTag: lang === "tr" ? "⚡ Popüler" : "⚡ Popular"
      });

      // 3. AI Persona Chat
      results.push({
        id: "rec_timeline_persona",
        targetView: "persona_chat",
        targetYear: year,
        badge: lang === "tr" ? "Gelecekten Canlı İletişim" : "Live Future Contact",
        badgeColor: "cyan",
        title: lang === "tr"
          ? `${year} Çağında Yaşayan Bir İnsanla Konuş`
          : `Talk to a Human Living in ${year}`,
        description: lang === "tr"
          ? "Bu teknolojinin gündelik hayatı nasıl değiştirdiğini o dönemin bilinciyle canlı sohbet ederek öğrenin."
          : "Directly dialogue with an AI persona living in the era shaped by this milestone.",
        actionText: lang === "tr" ? "Canlı Sohbet Başlat" : "Start Live Chat",
        creditCost: 20,
        featureKey: "persona_chat",
      });
      break;

    case "job_risk":
      // After job risk analysis -> Roadmap & Persona & Butterfly
      results.push({
        id: "rec_job_roadmap",
        targetView: "roadmap",
        badge: lang === "tr" ? "Kariyer Savunma Planı" : "Career Defense Plan",
        badgeColor: "emerald",
        title: lang === "tr"
          ? "2026—2045 Kişisel Kariyer Adaptasyon Haritanı Çıkar"
          : "Generate 2026—2045 Personal Career Roadmap",
        description: lang === "tr"
          ? "Otomasyon riskinden korunmak için hangi yıl hangi kritik yetkinlikleri kazanmanız gerektiğini haritalandırın."
          : "Map out critical emerging skills year-by-year to build an AI-proof career strategy.",
        actionText: lang === "tr" ? "Kişisel Yol Haritası Aç" : "Open Personal Roadmap",
        creditCost: 20,
        featureKey: "personal_roadmap",
        highlightTag: lang === "tr" ? "🛡️ AI Kalkanı" : "🛡️ AI Shield"
      });

      results.push({
        id: "rec_job_butterfly",
        targetView: "butterfly",
        badge: lang === "tr" ? "Sektörel Alternatif Evren" : "Industry Alternate Sim",
        badgeColor: "purple",
        title: lang === "tr"
          ? "Mesleğinizi Tehdit Eden Teknolojiyi Durdurursanız Ne Olur?"
          : "What if the technology threatening your job was delayed?",
        description: lang === "tr"
          ? "İşinizi en çok dönüştüren yılı Kelebek Etkisi'nde devre dışı bırakın ve küresel ekonomi üzerindeki sonuçlarını görün."
          : "Disable the disruptive milestone in the timeline and inspect macroeconomic chain reactions.",
        actionText: lang === "tr" ? "Tehdidi Devre Dışı Bırak" : "Simulate Postponement",
        creditCost: 15,
        featureKey: "butterfly_effect",
      });
      break;

    case "butterfly":
      results.push({
        id: "rec_butterfly_geo",
        targetView: "geo_map",
        badge: lang === "tr" ? "Jeopolitik Güç Dengesi" : "Geopolitical Power Shift",
        badgeColor: "blue",
        title: lang === "tr"
          ? "Bu Kırılmanın Ülkeler ve Güç Merkezlerine Etkisini Gör"
          : "Inspect Global Power Balance on Geographic Map",
        description: lang === "tr"
          ? "Teknolojik gecikmelerin ABD, AB, Çin ve bölgesel güç dengelerini nasıl değiştirdiğini dünya haritasında keşfedin."
          : "Explore how technological pivots shift geopolitical influence across USA, EU, Asia, and regional powers.",
        actionText: lang === "tr" ? "Küresel Haritayı İncele" : "Open Geographic Map",
        creditCost: 0,
        featureKey: "geo_map",
        highlightTag: lang === "tr" ? "🌍 Açık Erişim" : "🌍 Open Access"
      });

      results.push({
        id: "rec_butterfly_comparison",
        targetView: "comparison",
        badge: lang === "tr" ? "Senaryo Karşılaştırması" : "Scenario Compare",
        badgeColor: "amber",
        title: lang === "tr"
          ? "Orijinal Zaman Akışı ile Alternatif Evreni Kıyasla"
          : "Compare Original Timeline vs Alternate Universe",
        description: lang === "tr"
          ? "Moore yasası sapması ve yapay zeka otonomi parametrelerindeki farkları matris üzerinde karşılaştırın."
          : "Compare divergence rates, singularity metrics, and autonomy indexes side-by-side.",
        actionText: lang === "tr" ? "Matris Kıyaslaması Yap" : "Compare in Matrix",
        creditCost: 0,
        featureKey: "comparison",
      });
      break;

    case "comparison":
      results.push({
        id: "rec_compare_agent",
        targetView: "agent_scan",
        badge: lang === "tr" ? "Derin Akademik Tarama" : "Autonomous Deep Scan",
        badgeColor: "purple",
        title: lang === "tr"
          ? "Seçili Teknolojiler Arasındaki Gizli Sinerjiyi Ajanla Tara"
          : "Scan Hidden Synergies with Autonomous AI Agent",
        description: lang === "tr"
          ? "Kuantum, biyo-çip ve AGI patentlerini birleştiren multi-agent telemetri motorunu tam güçte çalıştırın."
          : "Deploy multi-agent telemetry engines to uncover cross-domain patent convergence.",
        actionText: lang === "tr" ? "Otonom Ajanı Başlat" : "Launch Autonomous Agent",
        creditCost: 30,
        featureKey: "autonomous_agent",
        highlightTag: lang === "tr" ? "🤖 Derin Telemetri" : "🤖 Deep Telemetry"
      });
      break;

    case "verification":
      results.push({
        id: "rec_verif_audit",
        targetView: "audit",
        badge: lang === "tr" ? "Algoritmik Denetim" : "Algorithmic Audit",
        badgeColor: "emerald",
        title: lang === "tr"
          ? "Kanıtlanan Teknolojilerin Olasılık Sapmalarını Denetle"
          : "Audit Probability Deviations for Verified Tech",
        description: lang === "tr"
          ? "Doğrulanan patentlerin gelecekteki 2030-2050 projeksiyonlarını nasıl hızlandırdığını anomali motorunda görün."
          : "Inspect how verified patents accelerate 2030-2050 forecast trajectories.",
        actionText: lang === "tr" ? "Anomali Raporunu Aç" : "Open Audit Report",
        creditCost: 0,
        featureKey: "audit",
      });
      break;

    case "persona_chat":
      results.push({
        id: "rec_persona_timeline",
        targetView: "timeline",
        badge: lang === "tr" ? "Zaman Çizelgesi" : "Timeline",
        badgeColor: "cyan",
        title: lang === "tr"
          ? "Bu Çağdaki Teknolojik Kırılmaları İnceleyin"
          : "Explore Tech Milestones of this Era",
        description: lang === "tr"
          ? "2026-2060 arasındaki bilimsel ve teknolojik dönüm noktalarını zaman çizelgesinde görüntüleyin."
          : "View scientific and technological milestones on the interactive timeline.",
        actionText: lang === "tr" ? "Zaman Çizelgesine Git" : "Go to Timeline",
        creditCost: 0,
        featureKey: "timeline",
        highlightTag: lang === "tr" ? "🕒 Zaman Çizelgesi" : "🕒 Timeline"
      });
      break;

    case "geo_map":
      results.push({
        id: "rec_geo_butterfly",
        targetView: "butterfly",
        badge: lang === "tr" ? "Alternatif Jeopolitik" : "Alternate Geopolitics",
        badgeColor: "purple",
        title: lang === "tr"
          ? "Süper Güçlerin Ambargo Koyduğu Senaryoyu Simüle Et"
          : "Simulate Tech Blockade by Superpowers",
        description: lang === "tr"
          ? "Kritik bir yapay zeka veya kuantum adımını engelleyerek küresel liderlik sıralamasının değişimini test edin."
          : "Test global ranking shifts when critical tech breakthroughs encounter regulatory embargoes.",
        actionText: lang === "tr" ? "Kelebek Etkisine Geç" : "Switch to Butterfly Effect",
        creditCost: 15,
        featureKey: "butterfly_effect",
      });
      break;

    default:
      results.push({
        id: "rec_default_job",
        targetView: "job_risk",
        badge: lang === "tr" ? "Önerilen Analiz" : "Recommended Audit",
        badgeColor: "rose",
        title: lang === "tr" ? "Mesleki Otomasyon Riskinizi Sorgulayın" : "Audit Your Job Automation Risk",
        description: lang === "tr"
          ? "2026-2060 arası mesleğinizin yapay zeka karşısındaki risk katsayısını öğrenin."
          : "Discover your career risk index against emerging technologies across 2026-2060.",
        actionText: lang === "tr" ? "Risk Analizi Yap" : "Start Job Audit",
        creditCost: 15,
        featureKey: "job_risk_analysis",
      });
  }

  return results;
}
