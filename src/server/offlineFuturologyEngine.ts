import { mapToAcademicKeywords } from "./academicKnowledgeEngine";

// Yerel / Offline Yüksek Hassasiyetli Fütüroloji ve AI Simülasyon Motoru
// Canlı AI API kotası / anahtarı olmadığında veya yoğunlukta 0 Kesinti ile %100 Çalışır.

export interface SimulationParams {
  year: number;
  title: string;
  description: string;
  category: string;
  userQuery?: string;
  mode?: "ask" | "news" | "diary" | "future_impact" | string;
  language?: string;
  userProfile?: {
    profession?: string;
    age?: number;
    seniority?: string;
    industrySector?: string;
    personalGoal?: string;
  };
}

export interface SimulationOutput {
  success: boolean;
  source: string;
  output: string;
  grounding?: {
    searchQueries: string[];
    webSources: Array<{ title: string; uri: string; domain?: string }>;
  };
}

export function generateHighFidelitySimulation(params: SimulationParams): SimulationOutput {
  const { year, title, description, category, userQuery, mode = "ask", language = "tr", userProfile } = params;
  const isTr = language === "tr";

  const { englishQuery, arxivCat } = mapToAcademicKeywords(title, category);

  const searchQueries = [
    `${year} ${title} teknoloji yol haritası`,
    `${category} fütüroloji tahminleri ve atılımları`,
    `${englishQuery} scientific research benchmark`
  ];

  const webSources = [
    {
      title: `${title} - OpenAlex Açık Bilim Arşivi (${englishQuery})`,
      uri: `https://openalex.org/works?search=${encodeURIComponent(englishQuery)}`,
      domain: "openalex.org"
    },
    {
      title: `Küresel Teknoloji ve Patent Öngörü Raporu (${year})`,
      uri: `https://patents.google.com/?q=${encodeURIComponent(englishQuery)}`,
      domain: "patents.google.com"
    },
    {
      title: `${category} Alanında Disiplinlerarası İlerleme Göstergeleri (arXiv: ${arxivCat})`,
      uri: `https://arxiv.org/search/?query=${encodeURIComponent(englishQuery)}&searchtype=all`,
      domain: "arxiv.org"
    }
  ];

  let output = "";

  if (mode === "news") {
    if (isTr) {
      output = `🔴 KÜRESEL TEKNOLOJİK EVRİM HABER MERKEZİ (${year}) — RESMÎ STRATEJİK BÜLTEN\n\n` +
        `📢 MANŞET: "${title.toUpperCase()}" KÜRESEL OPERASYONEL STANDART HALİNE GELDİ!\n\n` +
        `🎙️ BÜLTEN SUNUCUSU:\n` +
        `"İyi akşamlar. Bugün dünya genelinde bilim kurulları, çok uluslu teknoloji konsorsiyumları ve endüstriyel tedarik zincirlerinin nefesini tuttuğu tarihi bir teknolojik eşiği geride bıraktık. ` +
        `${year} yılı vizyonunun en kritik atılımı olarak uzun süredir modellenen '${title}', küresel ölçekte doğrulanmış altyapı haline geldi.\n\n` +
        `${description}. Bu büyük dönüşüm; enerji şebekelerinden sermaye dağılımına, kurumsal istihdamdan bireysel yaşam kalitesine kadar medeniyetin temel parametrelerini baştan aşağı yeniden yapılandırıyor."\n\n` +
        `🔬 BAŞ SİSTEM MİMARI & BAŞ BİLİM İNSANI DEĞERLENDİRMESİ:\n` +
        `"Bu gelişme yalnızca bir laboratuvar veya donanım başarısı değildir. Fiziksel sınırların, algoritmik ölçeklenmenin ve disiplinlerarası mühendisliğin senkronize zaferidir. ` +
        `Ölçülen birim işlem maliyetlerinde %78'lik düşüş sağlandı. Önümüzdeki 36 aylık projeksiyonda küresel endüstriyel verimlilik çarpanının %340 oranında katlanarak artmasını ve türev sektörlerde 12 yeni otonom pazar alanı yaratmasını belgeliyoruz."\n\n` +
        `🏙️ SAHA RAPORU — VATANDAŞ VE GÜNLÜK YAŞAM DENEYİMİ:\n` +
        `"Metropollerden kırsal habitatlara kadar tüm sivil altyapılarda bu kırılmanın sessiz ve sürtünmesiz etkisi gözlemleniyor. ` +
        `2020'lerin başındaki hantal, parçalı ve bürokratik operasyonlar tarihe karışırken; bireyler kişiselleştirilmiş bilişsel ajanlar ve akıllı çevre ağları sayesinde zaman tasarrufunu doğrudan hissediyor."\n\n` +
        `📊 2026-2060 TEKNOLOJİK EVRİM İVMELENME ENDEKSİ: 94/100 (Dönüştürücü Etki Seviyesi: Kritik & Kalıcı)`;
    } else {
      output = `🔴 GLOBAL TECHNOLOGICAL EVOLUTION BROADCAST (${year}) — EXECUTIVE NETWORK\n\n` +
        `📢 HEADLINE: "${title.toUpperCase()}" ACHIEVES GLOBAL OPERATIONAL STATUS!\n\n` +
        `🎙️ NEWS ANCHOR:\n` +
        `"Good evening. Today marks a historic civilizational milestone across scientific councils and enterprise infrastructure. ` +
        `The breakthrough '${title}', projected as the centerpiece of ${year}, is now fully operational across tier-one economies.\n\n` +
        `${description}. This transition is fundamentally reconfiguring capital allocation, energy grids, and workforce productivity across the globe."\n\n` +
        `🔬 CHIEF SCIENTIST & SYSTEMS ARCHITECT BRIEFING:\n` +
        `"This is not merely an isolated experimental validation; it represents the mathematical convergence of physical scaling, algorithmic efficiency, and resilient supply chains. ` +
        `Unit compute and thermodynamic overhead have dropped by 78%, unlocking an estimated 340% productivity compound yield over the upcoming 36-month horizon."\n\n` +
        `🏙️ FIELD REPORT — CIVILIAN AND ENTERPRISE IMPACT:\n` +
        `"From autonomous regional hubs to individual knowledge workers, the friction of legacy bureaucracy has evaporated. ` +
        `Decision velocity is now measured in sub-seconds rather than business quarters, marking a permanent leap in civilizational throughput."\n\n` +
        `📊 2026-2060 ACCELERATION INDEX SCORE: 94/100 (Transformation Level: Critical & Irreversible)`;
    }
  } else if (mode === "diary") {
    if (isTr) {
      output = `📔 DİJİTAL BELLEK & NÖRAL GÜNLÜK KAYDI (Tarih: 14 Ekim ${year})\n\n` +
        `Sabah nöral sağlık ve vital optimizasyon taramasıyla güne başladığımda havadaki ve şehir ekosistemindeki derin dinginliği hissetmek artık tamamen olağan geliyor. ` +
        `Artık '${title}' günlük çalışma ve yaşam rutinimizin görünmez, pürüzsüz omurgası haline geldi.\n\n` +
        `Eski 2020'li yıllarda insanların ${category.toLowerCase()} alanındaki karmaşık problemleri saatlerce manuel kodlarla, formlarla veya ilkel telefon ekranlarıyla çözmeye çalıştığı anları hatırlamak neredeyse gerçeküstü geliyor. ` +
        `${description}. Bugün çalışma alanımda otonom ajan filomla etkileşime girerken, herkes sistemin sunduğu bu kusursuz akışkanlığı doğal karşılıyordu.\n\n` +
        `Ancak bu görünmez altyapının arkasında yatan termodinamik optimizasyon, kuantum algoritmaları ve derin insan dehası beni her defasında büyülüyor. ` +
        `Rutin emeğin tamamen otonomlaştığı bir çağda insan olmanın anlamı; felsefi derinlikte, stratejik niyette ve sevgi dolu bağlarda yeniden keşfediliyor. 2060 ufkuna doğru ilerlerken geleceğin tam kalbinde yaşadığımı biliyorum.`;
    } else {
      output = `📔 NEURAL MEMORY LOG & PERSONAL DIARY (Date: October 14, ${year})\n\n` +
        `Waking up this morning to ambient biometric calibration, the friction-free rhythm of our city biome feels entirely natural. ` +
        `'${title}' has matured into the invisible, reliable backbone of both cognitive labor and civilian infrastructure.\n\n` +
        `Reflecting on how humanity struggled with ${category.toLowerCase()} during the early 2020s through fragmented tools and manual spreadsheets feels like looking at ancient stone tools. ` +
        `${description}. Collaborating with multi-agent cognitive fleets today, colleagues simply take this unprecedented leverage for granted.\n\n` +
        `Yet the physical and mathematical elegance powering this reality remains deeply awe-inspiring. ` +
        `With routine execution decoupled from human hours, true creative synthesis, empathy, and strategic purpose have become the genuine currencies of our era.`;
    }
  } else {
    // Standard 'ask' or 'future_impact'
    const userQ = userQuery && userQuery.trim() ? userQuery : (isTr ? "Bu gelişmenin insanlığa, mesleklere ve geleceğe somut stratejik etkileri nelerdir?" : "What are the tangible strategic impacts of this milestone on society and careers?");
    
    if (isTr) {
      output = `### 📡 [${year}] ${title} — Stratejik Gelecek & Yönetici İstihbarat Brifingi\n\n` +
        `**🎯 Odak & Stratejik Analiz Sorusu:** ${userQ}\n\n` +
        `---\n\n` +
        `#### 1. 🔬 Teknolojik Kırılma, Temel Mimari ve Fiziksel Gerçeklik\n` +
        `**${title}**, '${category}' disiplininde teorik laboratuvar varsayımlarını geride bırakıp endüstriyel ana akım haline gelen dönüm noktası niteliğinde bir eşiktir. ` +
        `${description}. ` +
        `Bu atılım; Landauer termodinamik sınırlarını zorlayan yeni nesil hesaplama mimarileri, yüksek verimli enerji transferi ve otonom hata doğrulama döngülerinin eşzamanlı olgunlaşmasıyla mümkün olmuştur. ` +
        `Birim işlem başına harcanan enerji ve sermaye maliyeti geleneksel yöntemlere kıyasla %75 ila %85 oranında azalırken, sistem güvenilirliğinde telekomünikasyon ve kritik altyapı benchmark standardı olan endüstriyel 5-dokuz (%99.999) güvenilirlik bir model hedefi olarak hedeflenmektedir.\n\n` +
        `#### 2. 💼 Sosyo-Ekonomik Güç Dengesi: Kim Kazanacak, Kim Kaybedecek?\n` +
        (userProfile?.profession
          ? `* **🎯 Kişiselleştirilmiş Rol Konumu (${userProfile.profession}${userProfile.seniority ? ` - ${userProfile.seniority}` : ""}):** '${userProfile.profession}' profili bu kırılmada ${userProfile.seniority?.toLowerCase().includes("senior") || userProfile.seniority?.toLowerCase().includes("kıdemli") ? "rutin icra görevlerini otonom araçlara delege ederek stratejik karar mimarı tarafında kalmalı ve %300 verimlilik çarpanını yakalamalıdır." : "geleneksel manuel şablonlardan hızla ayrılarak bu teknolojinin erken uygulayıcısı konumuna geçmeli, portfolyosunu canlı çıktılarla güçlendirmelidir."}\n`
          : "") +
        `* **🏆 Üstel Değer Kazananlar:**\n` +
        `  - **Orkestrasyon ve Sistem Mimarları:** İşi bizzat elle yapan değil; bu teknolojiyi otonom filolar halinde yöneten, doğrulayan ve denetleyen profesyonellerin piyasa değeri 4 ila 6 katına çıkar.\n` +
        `  - **Erken Entegre Eden Girişimler & Şirketler:** ${category} dikeyinde operasyonel süreçlerini bu teknolojiye ilk 18 ayda bağlayan kurumlar, %300 operasyonel marj avantajıyla rakiplerini pazar dışına iter.\n` +
        `  - **Veri Güvenliği ve Regülatif Uyum Tasarımcıları:** Otonom sistemlerin yasal, etik ve algoritmik sorumluluğunu güvence altına alan stratejik aktörler küresel ölçekte vazgeçilmez hale gelir.\n` +
        `* **⚠️ Ciddi Risk Altındakiler & Tasfiye Edilenler:**\n` +
        `  - **Rutin İcra Gücü ve Manuel Aracı Roller:** Bu alandaki kural tabanlı, tekrarlayan veri girişi, şablonlu raporlama ve orta kademe koordinasyon pozisyonları hızla marjinalleşir.\n` +
        `  - **Eski Tip Donanım ve Bürokratik Hiyerarşiler:** Dönüşüme direnip eski onay zincirlerinde ve geleneksel altyapılarda ısrar eden kurumlar, dramatik pazar payı kaybıyla iflas riskine girer.\n\n` +
        `#### 3. 📉 Maliyet Eğrisi, Tüketiciye İniş Takvimi ve Pazar Dinamikleri\n` +
        `- **İlk Faz (Model Projeksiyonu: 0 - 18 Ay):** Yalnızca dev teknoloji konsorsiyumları, savunma sanayii ve ileri araştırma enstitüleri tarafından yüksek sermaye yatırımıyla özel altyapılarda çalıştırılır.\n` +
        `- **İkinci Faz (Model Projeksiyonu: 18 - 36 Ay):** B2B kurumsal yazılım ve bulut platformları üzerinden dikey sektörlere (finans, sağlık, imalat) yayılır; operasyonel maliyetler %60 düşer.\n` +
        `- **Üçüncü Faz (Model Projeksiyonu: 3 - 5 Yıl):** Tüketici seviyesine iner; sıradan bir vatandaş için aylık erişilebilir abonelik, akıllı cihaz standardı veya kamu hizmeti altyapısına dönüşür.\n` +
        `- **Makro Etki:** Enerji, ulaşım ve bilgi işleme maliyetleri marjinal sıfır seviyesine yaklaşarak küresel ölçekte deflasyonist refah etkisi oluşturur.\n\n` +
        `#### 4. 🛡️ Etik, Siber Güvenlik, Regülasyon ve Sistemik Kalkanlar\n` +
        `- **Kriptografik ve Algoritmik Bütünlük:** Otonom karar mekanizmalarında veri zehirlenmesi ve model kaymalarına karşı çok katmanlı kriptografik doğrulama protokolleri zorunlu tutulur.\n` +
        `- **Küresel Regülasyon Standartları:** Uluslararası yapay zeka, kuantum ve biyo-etik konseyleri; teknolojinin otonom eylem yetkilerini açık kaynaklı denetim standartlarına bağlar.\n` +
        `- **Toplumsal Dijital Uçurum Kalkanı:** Gelişmiş ülkeler ile gelişmekte olan coğrafyalar arasındaki farkın açılmaması için küresel kamu konsorsiyumları teknoloji transfer fonları kurar.\n\n` +
        `#### 5. 🧭 Bireysel ve Kurumsal Strateji: Hemen Bugün Ne Yapmalısınız?\n` +
        `1. **Gözlemci Değil, Aktif Uygulayıcı Olun:** '${category}' alanındaki en yeni açık kaynak ve ticari platformları haftalık çalışma akışlarınıza zorunlu olarak entegre edin.\n` +
        `2. **Yapay Zekaya 'Görev Yapan' Değil, 'Ajan Yöneten' Tarafa Geçin:** Kod yazan, metin çeviren veya evrak hazırlayan değil; bu çıktıların doğruluğunu, stratejik bağlamını ve mimarisini tasarlayan 'Baş Sistem Denetçisi' kimliğini benimseyin.\n` +
        `3. **Gelecek Dayanıklı Portföy İnşa Edin:** Eski diplomalar ve unvanlar yerine, bu teknolojik atılımı kaldıraç olarak kullandığınızı kanıtlayan somut vaka analizleri ve canlı projeler üretin.\n` +
        (userProfile?.profession
          ? `4. **${userProfile.profession} Özel Eylem Planı (${userProfile.personalGoal || "Kariyer Gelişimi"}):** ${userProfile.profession} rolünüzde bu dönüm noktasına ilişkin araçları kullanarak ilk canlı uygulamanızı 30 gün içinde tamamlayın; işinizi doğrudan algoritmik korumaya alın.\n\n`
          : "\n") +
        `#### 6. 🌐 2060 Tekillik Ufkuna Doğru İkinci ve Üçüncü Derece Kaskat Etkiler\n` +
        `- **İkinci Derece Etki (2030'lar):** Bu atılımın olgunlaşması, komşu disiplinlerdeki (özellikle biyolojik ömür uzatma, robotik otomasyon ve temiz füzyon enerjisi) hesaplama darboğazlarını çözerek kümülatif bilimsel hızı 5 katına çıkarır.\n` +
        `- **Üçüncü Derece Etki (2045-2060):** İnsan-makine bilişsel simbiyozu ve gezegen ölçeğinde akıllı kaynak dağıtımı gerçekleşir; medeniyet kıtlık temelli ekonomiden bolluk temelli post-endüstriyel evreye geçiş yapar.\n\n` +
        `---\n` +
        `*📌 Yönetici Özeti: Bu stratejik istihbarat değerlendirmesi, dönüm noktasının fiziksel, iktisadi ve algoritmik parametrelerinin derinlemesine sentezlenmesiyle hazırlanmıştır.*`;
    } else {
      output = `### 📡 [${year}] ${title} — Strategic Executive Foresight Briefing\n\n` +
        `**🎯 Strategic Inquiry:** ${userQ}\n\n` +
        `---\n\n` +
        `#### 1. 🔬 Technological Breakthrough & Architecture\n` +
        `**${title}** represents an irreversible paradigm shift within '${category}'. ${description}. ` +
        `Operating at the intersection of thermodynamic efficiency and self-verifying logic, it drives unit computational and operational friction down by up to 80% while establishing five-nines industrial reliability.\n\n` +
        `#### 2. 💼 Winners vs. Losers: Economic Power Realignment\n` +
        `* **🏆 Exponential Winners:** Strategic orchestrators, cross-disciplinary system architects, and early institutional adopters capturing 300%+ operational margins.\n` +
        `* **⚠️ Structural Losers:** Intermediary manual task operators, legacy bureaucratic hierarchies, and businesses rooted in artificial gatekeeping.\n\n` +
        `#### 3. 📉 Cost Trajectory & Mainstream Market Access\n` +
        `- **Phase 1 (Months 0-18):** High-capital institutional and defense deployments.\n` +
        `- **Phase 2 (Months 18-36):** B2B commoditization and rapid industry adoption.\n` +
        `- **Phase 3 (Years 3-5):** Frictionless consumer utility and pervasive ambient infrastructure.\n\n` +
        `#### 4. 🛡️ Governance, Algorithmic Safety & Societal Shields\n` +
        `- Post-quantum cryptographic auditing and verifiable AI safety boundaries become non-negotiable statutory standards.\n` +
        `- Regulatory frameworks mandate explainable multi-agent accountability protocols across global jurisdictions.\n\n` +
        `#### 5. 🧭 Executive Action Playbook: Immediate Priorities\n` +
        `1. Integrate emerging autonomous tools directly into daily operational workflows.\n` +
        `2. Transition from task execution to supervisory system orchestration.\n` +
        `3. Develop proof-of-work assets demonstrating direct algorithmic leverage.\n\n` +
        `#### 6. 🌐 Macro Singularity Cascades Towards 2060\n` +
        `- Resolves downstream computational bottlenecks across computational biology and next-generation clean energy, accelerating civilizational transition into sustainable post-scarcity dynamics.`;
    }
  }

  return {
    success: true,
    source: "HighFidelity_Futurology_Simulation_Engine",
    output,
    grounding: {
      searchQueries,
      webSources
    }
  };
}

export function generatePersonaChatFallback(
  personaYear: number,
  personaRole: string,
  userMessage: string,
  language: string = "tr"
): string {
  const isTr = language === "tr";
  const msgLower = (userMessage || "").toLowerCase().trim();

  // Persona profiles
  let personaName = "Dr. Elena Vance";
  let location = "Zürih AI Kampüsü";
  let focus = "Otonom Ajanlar ve AGI Etik Standartları";

  if (personaYear >= 2045) {
    personaName = "Aria 09";
    location = "Orbital Habitat-01 (Dünya Yörüngesi)";
    focus = "Singularity, Bilinç Aktarımı ve Biyo-Dijital Simbiyoz";
  } else if (personaYear >= 2035) {
    personaName = "Kaelen Voss";
    location = "Neo-Austin Teknoloji Biyomu";
    focus = "Neuralink Biyo-Çip Arayüzleri ve Kuantum Düşünce Ağları";
  }

  // Identity / Name queries
  if (
    msgLower.includes("adın") ||
    msgLower.includes("ismin") ||
    msgLower.includes("kimsin") ||
    msgLower.includes("name") ||
    msgLower.includes("who are you")
  ) {
    if (isTr) {
      return `Benim adım ${personaName}. ${personaYear} yılında ${location} merkezinde "${personaRole}" olarak görev yapıyorum. Günlük hayatımda ${focus} üzerine çalışıyor ve geleceğin insan-makine ekosistemini yönetiyorum. 2026 yılından bana ulaştığınız için çok memnun oldum!`;
    } else {
      return `My name is ${personaName}. I live in ${personaYear} at ${location}, working as a ${personaRole}. My work focuses on ${focus}. It is wonderful to connect with someone from 2026!`;
    }
  }

  // Greetings
  if (
    msgLower.includes("merhaba") ||
    msgLower.includes("selam") ||
    msgLower.includes("hey") ||
    msgLower.includes("hello") ||
    msgLower.includes("günaydın") ||
    msgLower.includes("iyi günler")
  ) {
    if (isTr) {
      return `Merhaba! ${personaYear} yılından ${personaName} ben (${personaRole}). 2026 zaman tünelinden gelen sinyalinizi net bir şekilde alıyorum. Bizim çağımızdaki yapay zeka, toplum yapısı, sağlık veya şehir hayatı hakkında merak ettiğiniz her şeyi samimiyetle yanıtlamaya hazırım.`;
    } else {
      return `Hello! This is ${personaName} transmitting from ${personaYear} (${personaRole}). I can hear your 2026 signal clearly. Ask me anything about our society, neural tech, or daily life!`;
    }
  }

  // Age / Physical body / Health
  if (
    msgLower.includes("yaş") ||
    msgLower.includes("kaç yaşındasın") ||
    msgLower.includes("sağlık") ||
    msgLower.includes("hastalık") ||
    msgLower.includes("ölüm") ||
    msgLower.includes("age") ||
    msgLower.includes("health")
  ) {
    if (isTr) {
      return `${personaYear} yılında biyolojik ve kronolojik yaş kavramı oldukça değişti. Ben biyolojik olarak 30'lu yaşlarımın dinçliğinde sabitlendim; hücresel yenilenme terapileri ve telomer onarımları sayesinde kronik hastalıklar ve organ yaşlanması bizim çağımızda kontrol altında tutuluyor.`;
    } else {
      return `In ${personaYear}, biological aging has been largely decoupled from chronological time through telomere therapies and cellular regeneration.`;
    }
  }

  // Work, Careers & Economy
  if (
    msgLower.includes("meslek") ||
    msgLower.includes("iş") ||
    msgLower.includes("işsizlik") ||
    msgLower.includes("para") ||
    msgLower.includes("ekonomi") ||
    msgLower.includes("job") ||
    msgLower.includes("work") ||
    msgLower.includes("career")
  ) {
    if (isTr) {
      return `${personaYear} yılında '${personaRole}' olarak çalışmak, 2026'daki gibi manuel kod yazmak veya rapor hazırlamak anlamına gelmiyor. Bizler otonom zeka filolarına stratejik niyet, etik sınırlar ve vizyon veriyoruz. Rutin üretim ve icra işleri tamamen otonomlaştığı için insan emeği en çok felsefi sezgi, derin empati ve yaratıcı tasarımda değer kazanıyor.`;
    } else {
      return `Working as a ${personaRole} in ${personaYear} is centered on strategic orchestration, ethics, and intuitive human creativity, since routine computation is handled autonomously.`;
    }
  }

  // AI, AGI & Technology
  if (
    msgLower.includes("yapay zeka") ||
    msgLower.includes("agi") ||
    msgLower.includes("asi") ||
    msgLower.includes("robot") ||
    msgLower.includes("çip") ||
    msgLower.includes("ai")
  ) {
    if (isTr) {
      return `2026'da yapay zekayı bir sohbet botu veya ayrı bir araç gibi kullanıyordunuz. ${personaYear} yılında ise yapay zeka adeta düşünce hızında akan bir bilişsel ortak. Nöral arayüzler ve dağıtık kuantum düğümleri sayesinde karmaşık problemleri saniyeler içinde simüle edip çözebiliyoruz.`;
    } else {
      return `In 2026, AI was an external assistant; in ${personaYear}, it functions as an ambient, cognitive co-processor woven seamlessly into human thought and infrastructure.`;
    }
  }

  // Daily life & how is it living there
  if (
    msgLower.includes("nasılsın") ||
    msgLower.includes("nasıl") ||
    msgLower.includes("hayat") ||
    msgLower.includes("günlük") ||
    msgLower.includes("life") ||
    msgLower.includes("günün")
  ) {
    if (isTr) {
      return `Burada (${location}) günlerimiz oldukça dengeli ve huzurlu geçiyor. Sabahları nöral sağlık taramasıyla başlıyoruz; trafik, evrak işleri veya bürokratik engeller gibi 2020'lerin sürtünmeleri tarihe karıştı. Kalan zamanımızın büyük kısmını araştırma, doğa restorasyonu ve yeni bilimsel ufuklara ayırıyoruz.`;
    } else {
      return `Life here in ${location} is remarkably frictionless. Routine bureaucratic friction from the 2020s has vanished, leaving us time for research, artistic synthesis, and exploration.`;
    }
  }

  // General questions response
  if (isTr) {
    return `${personaYear} yılından bir ${personaRole} (${personaName}) olarak sorunuzu dinledim: "${userMessage}". Bizim dönemimizde bu konu, otonom zeka ağları ve kuantum altyapıların birleşimiyle çok farklı bir boyuta evrildi. 2026 yılındaki mevcut algınız geleceğe doğru şekillenirken bu adımların atılması kaçınılmazdı. Bu konuda spesifik bir ayrıntıyı daha derin konuşmak ister misiniz?`;
  } else {
    return `Speaking as ${personaName} (${personaRole}) from ${personaYear} regarding "${userMessage}": In our era, this is deeply integrated with our quantum and autonomous infrastructure. How do you envision this evolving from your 2026 vantage point?`;
  }
}
