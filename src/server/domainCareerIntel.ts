/**
 * Alanında Uzman Fütürolojik ve İktisadi Meslek İstihbarat Motoru
 * Her mesleğe özel gerçek dünya şirketleri, yazılımları, yok olacak görevleri ve 30 günlük taktiksel eylem planlarını üretir.
 */

export interface DomainCareerProfile {
  categoryName: string;
  basePeakYear: number;
  baseAutomationPct: number;
  obsoleteTasks: string[];
  highValueHumanTasks: string[];
  keyAdaptationSkills: string[];
  recommendedToolsAndFrameworks: string[];
  targetOpportunities: string[];
  quickWinSkills: string[];
  summaryTemplate: string;
  personalizedVerdictTemplate: string;
  marketValueImpact: string;
  strategicPhases: Array<{
    phaseName: string;
    years: string;
    focus: string;
    actions: string[];
  }>;
}

export function detectDomainCareerProfile(
  query: string,
  profession: string,
  seniority: string = "",
  personalGoal: string = "",
  industrySector: string = ""
): DomainCareerProfile {
  const combined = `${query || ""} ${profession || ""} ${personalGoal || ""} ${industrySector || ""}`.toLowerCase();
  const senLower = (seniority || "").toLowerCase();
  const goalLower = (personalGoal || "").toLowerCase();

  const isSenior = senLower.includes("senior") || senLower.includes("kıdemli") || senLower.includes("lead") || senLower.includes("yönetici") || senLower.includes("direktör") || senLower.includes("expert") || senLower.includes("manager");
  const isJunior = senLower.includes("junior") || senLower.includes("başlangıç") || senLower.includes("entry") || senLower.includes("staj") || senLower.includes("erken");
  const isSecurityGoal = goalLower.includes("güvenlik") || goalLower.includes("koruma") || goalLower.includes("security") || goalLower.includes("istikrar");
  const isGrowthGoal = goalLower.includes("büyüme") || goalLower.includes("gelişim") || goalLower.includes("growth") || goalLower.includes("liderlik") || goalLower.includes("kariyer gelişimi");
  const isResearchGoal = goalLower.includes("araştırma") || goalLower.includes("research") || goalLower.includes("bilim") || goalLower.includes("akademik") || goalLower.includes("keşif");

  const finalizeProfile = (prof: DomainCareerProfile): DomainCareerProfile => {
    let adjustedPct = prof.baseAutomationPct;
    if (isSenior) {
      adjustedPct = Math.max(18, adjustedPct - 12);
    } else if (isJunior) {
      adjustedPct = Math.min(94, adjustedPct + 10);
    }

    let verdict = prof.personalizedVerdictTemplate;
    if (isSenior) {
      verdict += ` [Kıdemli / Liderlik Perspektifi]: Kıdem düzeyiniz gereği operasyonel görevleri otonom sistemlere delege edip, karar mimarisi ve ekip yönetişimine odaklanmanız rutin görev ikame indeksinizi ${adjustedPct}/100 seviyesinde dengeleyecektir (Not: Bu değer bir iş kaybı olasılığı değil, modelin parametrik rutin görev maruziyeti indeksidir).`;
    } else if (isJunior) {
      verdict += ` [Erken Kariyer / Hızlanma Perspektifi]: Erken kariyer aşamasında teorik ezberden sıyrılıp, ilk 4 haftada bu araçlarla çalışan canlı projeler üreterek pratik uygulama yetkinliğinizi hızlandırabilirsiniz (Model Senaryosu).`;
    }

    if (isSecurityGoal) {
      verdict += ` Hedeflediğiniz kariyer güvenliğini sağlamak için, yerel regülasyonlar ve algoritmik denetim kalkanlarında derinleşerek piyasada yeri doldurulamaz bir uzman haline gelmelisiniz.`;
    } else if (isGrowthGoal) {
      verdict += ` Hedeflediğiniz hızlı kariyer büyümesini yakalamak için, yapay zekayı bir asistan değil stratejik bir kaldıraç olarak konumlandırmalısınız.`;
    } else if (isResearchGoal) {
      verdict += ` Hedeflediğiniz araştırma kariyerinde in-silico modelleme ve algoritmik keşif araçlarını kullanarak literatür tarama ve hipotez test süreçlerinizi hızlandırabilirsiniz.`;
    }

    return {
      ...prof,
      baseAutomationPct: adjustedPct,
      personalizedVerdictTemplate: verdict,
    };
  };

  // 1. Hukuk & Adalet
  if (
    combined.includes("avukat") || combined.includes("hukuk") || combined.includes("savcı") ||
    combined.includes("hakim") || combined.includes("katip") || combined.includes("noter") ||
    combined.includes("lawyer") || combined.includes("legal") || combined.includes("dava")
  ) {
    return finalizeProfile({
      categoryName: "Hukuk & Mevzuat Mühendisliği",
      basePeakYear: 2029,
      baseAutomationPct: 78,
      obsoleteTasks: [
        "Yüzlerce sayfalık emsal içtihat ve Yargıtay kararlarını manuel taramak",
        "Standart sözleşme taslakları (NDA, kira, gizlilik, standart iş akdi) hazırlamak",
        "Dava dilekçelerinde imla, kanun maddesi ve tarih çapraz kontrolleri yapmak",
        "Rutin duruşma zaptı ve tensip zaptı evrak takiplerini yürütmek"
      ],
      highValueHumanTasks: [
        "Duruşma salonunda canlı psikolojik ikna, jüri/hakim algı yönetimi ve beden dili",
        "Çok taraflı, yüksek riskli şirket satın alma ve kriz müzakerelerinde ilkelerden karar alma",
        "Yapay zeka etiği, otonom algoritma sorumluluk hukuku ve regülatif uyum tasarımı",
        "Müvekkil ile sarsılmaz insani güven ve gizlilik ilişkisini inşa etmek"
      ],
      keyAdaptationSkills: [
        "Hukuki Yapay Zeka Sorgulama & Emsal Doğrulama (Prompt Legal Engineering)",
        "Algoritmik Sözleşme Risk Analizi & Akıllı Kontrat Denetimi",
        "Yapay Zeka Regülasyonları ve AB AI Act Uyum Mimarisi",
        "Stratejik Çapraz Sorgu & Müzakere Psikolojisi"
      ],
      recommendedToolsAndFrameworks: [
        "Harvey AI (Büyük hukuk büroları için LLM platformu)",
        "Robin AI & Luminance (Sözleşme analizi ve kırmızı kalem otomasyonu)",
        "Casetext CoCounsel (GPT-4 tabanlı içtihat ve savunma asistanı)",
        "Lexis+ AI & vLex Vincent (Derin regülasyon ve emsal madenciliği)"
      ],
      targetOpportunities: [
        "Yapay Zeka & Algoritma Sorumluluk Baş Müşaviri (Yüksek Katma Değerli Küresel Rol)",
        "Akıllı Kontrat ve Blokzincir Hukuk Danışmanı",
        "Veri Egemenliği ve Biyo-Etik Regülasyon Stratejisti",
        "Otonom Şirketler İçin Kurumsal Hukuk Mimarı"
      ],
      quickWinSkills: [
        "Harvey veya CoCounsel muadili araçla 100 sayfalık sözleşmeyi 3 dakikada risk taramasından geçirme",
        "Özel dava şablonları için kişisel Claude/GPT bilgi tabanı (Custom GPT/RAG) oluşturma",
        "Müvekkillere 'Hap Bilgi & Risk Raporu' üreten otomatik hukuki özet bülteni hazırlama"
      ],
      summaryTemplate: "Hukuk sektörü, belgelere boğulan klasik avukatlıktan; yapay zekayı arkasına alarak saniyeler içinde binlerce emsal tarayan 'Süper Danışman' modeline evriliyor. Standart dilekçe yazanlar gelir kaybı yaşarken, stratejik müzakere ve AI regülasyonu bilenlerin piyasa değeri ve stratejik önemi artacaktır.",
      personalizedVerdictTemplate: "Hedefiniz doğrultusunda saat başı ücret yazan klasik avukatlık modeli 2028'e kadar yüksek otomasyon baskısıyla dönüşüm sürecine giriyor. Rekabet gücünüzü korumak ve lider olmak için evrak işlerini Harvey/Robin AI gibi araçlara devredip, şirketlerin en çok ihtiyaç duyduğu 'Yapay Zeka Yasal Riskleri ve Dijital Sözleşme Güvenliği' alanına konumlanmalısınız.",
      marketValueImpact: "Model Senaryosu (Nitel Pazar Eğilimi): Standart sözleşme ve kural bazlı dilekçe hazırlığında otomasyon ikamesi; yapay zeka destekli sözleşme analitiği ve regülasyon danışmanlığı yapan hukukçularda ise belirgin talep primi ve stratejik pazar değeri (Örnek model projeksiyonudur; kesin istatistiksel gelir garantisi değildir).",
      strategicPhases: [
        {
          phaseName: "1. Aşama: Evrak Yükünden Kurtuluş",
          years: "2026 - 2027",
          focus: "Dava dosyası tarama ve sözleşme incelemede yapay zeka hızlandırıcısını devreye alın (Model Senaryosu).",
          actions: ["Ofisinizde Casetext veya Harvey muadili hukuki yapay zeka entegrasyonu yapın.", "Standart dilekçe şablonlarını otomatikleştirin."]
        },
        {
          phaseName: "2. Aşama: AI Regülasyon Uzmanlığı",
          years: "2028 - 2030",
          focus: "Şirketlerin yapay zeka kullanımındaki yasal sorumluluk davalarında öncü olun.",
          actions: ["AB AI Act ve yerel siber suçlar mevzuatında uzman danışmanlık paketi oluşturun.", "Akıllı sözleşmelerde audit hizmeti verin."]
        },
        {
          phaseName: "3. Aşama: Otonom Hukuk Mimarlığı",
          years: "2031 - 2040",
          focus: "Otonom şirketler ve yapay zeka ajanları arasındaki uyuşmazlıkları yönetin.",
          actions: ["Sentetik aktörler arası tahkim sistemlerinde baş hakemlik yapın."]
        }
      ]
    });
  }

  // 2. Moleküler Biyoloji, Biyoteknoloji & Yaşam Bilimleri Araştırmacılığı
  if (
    combined.includes("biyolog") || combined.includes("biyoloji") || combined.includes("biyoteknoloji") ||
    combined.includes("genetik") || combined.includes("genom") || combined.includes("biotech") ||
    combined.includes("moleküler") || combined.includes("mikrobiyolog") || combined.includes("biyokimya") ||
    combined.includes("biyomedikal") || combined.includes("bioinformatic") || combined.includes("yaşam bilim")
  ) {
    return finalizeProfile({
      categoryName: "Biyoteknoloji, Genomik & Yaşam Bilimleri Araştırmacılığı",
      basePeakYear: 2031,
      baseAutomationPct: 52,
      obsoleteTasks: [
        "Rutin manuel pipetleme, numune aktarımı ve tüp etiketleme (otonom sıvı taşıyıcı robotlar devralıyor)",
        "Jel elektroforez bantlarının ve hücre plakalarının manuel mikroskobik sayımı",
        "Standart PCR döngü parametreleri ve kural bazlı dizi eşleştirme kayıtları",
        "Laboratuvar stok envanteri ve reaktif siparişlerinin manuel takibi"
      ],
      highValueHumanTasks: [
        "AlphaFold 3 ve in-silico modellerle yeni nesil sentetik protein ve enzim mimarisi tasarımı",
        "CRISPR hedefleme stratejilerinde off-target risklerini öngören biyolojik hipotez liderliği",
        "Klinik öncesi ve faz deneylerinde beklenmeyen fenotipik anomalileri yorumlayan bilimsel sezgi",
        "Genetik düzenleme, kimerik araştırmalar ve biyolojik güvenlikte küresel biyo-etik komite liderliği"
      ],
      keyAdaptationSkills: [
        "In-Silico Moleküler Modelleme & Yapısal Biyoloji (AlphaFold 3, ESMFold)",
        "Biyoinformatik & Yeni Nesil Dizileme (NGS) Veri Pipeline'ı (Python/Biopython, Nextflow)",
        "Sentetik Biyoloji & Gen Devresi Mimarisi (CRISPR-Cas Guide RNA Optimizasyonu)",
        "Biyo-Otomasyon & Robotik Sıvı İstasyonu Yönetimi"
      ],
      recommendedToolsAndFrameworks: [
        "AlphaFold 3 & ESMFold (Protein katlanma ve kompleks ligand modelleme)",
        "Benchling (Yeni nesil bulut tabanlı yaşam bilimleri AR-GE platformu)",
        "BioNeMo & RosettaFold (Biyomoleküler üretken yapay zeka modelleri)",
        "Geneious Prime & IGV (Genomik dizi hizalama ve varyant analizi)"
      ],
      targetOpportunities: [
        "Sentetik Biyoloji & In-Silico İlaç Tasarım Baş Araştırmacısı (Gelişmiş Biyobilgisayar Liderliği)",
        "Klinik Genomik & Biyoinformatik AI Mimarı",
        "CRISPR Gen Terapisi Süreç Lideri",
        "Biyogüvenlik ve Düzenleyici Onay Danışmanı"
      ],
      quickWinSkills: [
        "AlphaFold 3 veya ESMFold ile hedef proteinin 3D konformasyonunu 1 günde modelleme",
        "Benchling üzerinde CRISPR rehber RNA (gRNA) dizilerini 2 saatte in-silico optimize etme",
        "Python BioPython kütüphanesiyle FASTA dizi analizini otomatikleştiren komut dosyası yazma"
      ],
      summaryTemplate: "Yaşam bilimlerinde ıslak laboratuvar teknisyenliği; yerini yapay zeka ile milyonlarca molekülü saniyeler içinde simüle eden 'In-Silico Biyomühendislik' modeline bırakıyor. Manuel pipetleyen araştırmacılar geride kalırken, algoritmik tasarım ve biyo-hesaplama bilen biyologların değeri katlanıyor.",
      personalizedVerdictTemplate: "Biyoteknoloji ve biyoloji alanında kariyeriniz için en büyük fırsat, yapay zekayı bir tehdit değil, deney süresini 5 yıldan 2 haftaya indiren bir araştırma süper-gücü olarak konumlandırmaktır. Islak laboratuvar rutinlerini otonom robotlara bırakıp, AlphaFold ve biyoinformatik modelleme alanında derinleşerek küresel ilaç ve sentetik biyoloji konsorsiyumlarının aradığı lider araştırmacı olabilirsiniz.",
      marketValueImpact: "Model Senaryosu (Nitel Pazar Eğilimi): Manuel rutin laboratuvar pipetleme görevlerinde robotik ikame baskısı; in-silico tasarım ve hesaplamalı biyoloji uzmanlarında ise araştırma fonu ve sektörel talep artışı (Örnek model projeksiyonudur; kesin istatistiksel hibe/gelir garantisi değildir).",
      strategicPhases: [
        {
          phaseName: "1. Aşama: Islak Laboratuvardan In-Silico Tasarıma Geçiş",
          years: "2026 - 2027",
          focus: "Manuel pipetleme ve veri girişini laboratuvar otomasyonuna devredin; biyo-bilişim araçlarını öğrenin.",
          actions: ["Benchling ve AlphaFold ile dijital deney protokolleri kurgulayın.", "Nextflow ve Python ile NGS veri boru hatları inşa edin."]
        },
        {
          phaseName: "2. Aşama: Yapay Zeka Destekli Gen Terapisi & Protein Mühendisliği",
          years: "2028 - 2032",
          focus: "Hesaplamalı ilaç tasarımı ve CRISPR rehber RNA optimizasyonunda uzmanlaşın.",
          actions: ["BioNeMo ve RosettaFold modellerini araştırma projelerinize entegre edin.", "Klinik öncesi in-silico deneme modellerine liderlik edin."]
        },
        {
          phaseName: "3. Aşama: Sentetik Biyoloji & Biyo-Dijital Mimarlık",
          years: "2033 - 2040",
          focus: "Sentetik genomlar ve biyo-dijital ikiz simülasyonları tasarlayın.",
          actions: ["Hücresel gençleşme ve kişiselleştirilmiş gen tedavisi merkezlerinde baş araştırmacı olun."]
        }
      ]
    });
  }

  // 3. Tıp, Sağlık & Biyoloji
  if (
    combined.includes("doktor") || combined.includes("hekim") || combined.includes("cerrah") ||
    combined.includes("radyolog") || combined.includes("hemşire") || combined.includes("eczacı") ||
    combined.includes("tıp") || combined.includes("sağlık") || combined.includes("diş") ||
    combined.includes("doctor") || combined.includes("nurse") || combined.includes("medical")
  ) {
    return finalizeProfile({
      categoryName: "Klinik Tıp & Biyo-Dijital Sağlık",
      basePeakYear: 2033,
      baseAutomationPct: 45,
      obsoleteTasks: [
        "MR, BT ve Röntgen görüntülerinde manuel anomali ve lezyon sayımı",
        "Rutin hasta vizit notları, epikriz raporları ve SGK/sigorta kodlamaları",
        "Standart semptom sorgulaması ve ilk aşama reçete şablonu oluşturma",
        "İlaç-ilaç etkileşimi ve prospektüs bilgilerini hafızada tutup kontrol etme"
      ],
      highValueHumanTasks: [
        "Ameliyathanede beklenmeyen komplikasyon anlarında saniyelik cerrahi sezgi",
        "Ölümcül ve kritik teşhislerde hasta ve ailesine empati, moral ve umut aktarımı",
        "Robotik cerrahi kollarını süpervize eden baş operatörlük yetkinliği",
        "Karmaşık multi-organ yetmezliklerinde çok disiplinli konsültasyon liderliği"
      ],
      keyAdaptationSkills: [
        "Klinik AI Karar Destek Sistemlerini Doğrulama (Diagnostic AI Supervision)",
        "Robotik Cerrahi Konsol Yönetimi & Haptik Geri Bildirim Hakimiyeti",
        "Kişiselleştirilmiş Genomik Tıp & Biyobelirteç Yorumlama",
        "Kriz İletişimi & Biyo-Etik Karar Alma"
      ],
      recommendedToolsAndFrameworks: [
        "Paige AI & PathAI (Kanser ve patoloji tanılama modelleri)",
        "Nabla Copilot & Nuance DAX (Sesli ortam dinleyip anında epikriz yazan AI)",
        "AlphaFold 3 (Protein yapısı ve ilaç hedef analizi)",
        "Intuitive Da Vinci 5 (Yeni nesil tele-cerrahi ve haptik cerrahi robotu)"
      ],
      targetOpportunities: [
        "Robotik Cerrahi & Tele-Tıp Baş Konsültanı (Yüksek Öncelikli Klinik Rol)",
        "Klinik Genomik & AI Tedavi Tasarımcısı",
        "Nöro-Protez ve BCI Rehabilitasyon Hekimi",
        "Hastaneler İçin Yapay Zeka Güvenlik ve Etik Denetçisi"
      ],
      quickWinSkills: [
        "Nabla veya Nuance DAX ile günlük 2 saatlik epikriz evrak yükünü sıfırlama",
        "Görüntüleme sonuçlarını radyoloji AI filtreleriyle çapraz doğrulama pratiği kazanma",
        "Hastalar için kişiselleştirilmiş 3D anatomi ve tedavi simülasyonu sunma"
      ],
      summaryTemplate: "Tıpta yapay zeka doktorların yerini almayacak; ancak yapay zekayı kullanan doktorlar, kullanmayanların yerini hızla alacak. Radyoloji ve rutin patoloji hızla otonomlaşırken, cerrahi ve şefkat odaklı klinik liderlik tarihin en yüksek saygınlığına ulaşacak.",
      personalizedVerdictTemplate: "Belirttiğiniz hedef doğrultusunda, bürokratik rapor yazan hekim profilinden çıkmalısınız. Reçete ve dosya işlerini Nabla Copilot gibi sistemlere yıkarak, vaktinizi 'Karmaşık Cerrahi / Konsültasyon ve Genomik Tedavi' alanında derinleşmeye ayırmalısınız.",
      marketValueImpact: "Model Senaryosu (Nitel Pazar Eğilimi): Rutin bürokratik poliklinik evrak işlemlerinde otonomlaşma; robotik cerrahi ve yapay zeka destekli teşhis konsültanlığında ise yüksek uzmanlık saygınlığı ve pazar primi (Örnek model projeksiyonudur; kesin istatistiksel gelir garantisi değildir).",
      strategicPhases: [
        {
          phaseName: "1. Aşama: Evraksız Poliklinik",
          years: "2026 - 2027",
          focus: "Günde 2 saati bulan bilgisayar başı evrak işlerini sıfırlayın.",
          actions: ["Ortam sesini dinleyip reçete ve epikriz çıkaran klinik AI kullanın.", "Hasta geçmişini özetleyen modelleri devreye alın."]
        },
        {
          phaseName: "2. Aşama: Robotik ve Genomik Hibritleşme",
          years: "2028 - 2032",
          focus: "Yapay zeka teşhis sistemlerinin baş denetçisi olun.",
          actions: ["Robotik cerrahi ve minimal invaziv teknolojilerde sertifikasyon alın.", "DNA dizileme ve hedefe yönelik ilaç protokollerini uygulayın."]
        },
        {
          phaseName: "3. Aşama: Biyo-Dijital Hekimlik",
          years: "2033 - 2040",
          focus: "Neuralink ve yapay organ arayüzlerinin klinik takibini yönetin.",
          actions: ["Hücresel gençleşme ve biyo-çip entegrasyon merkezlerine liderlik edin."]
        }
      ]
    });
  }

  // 4. Tasarım, Sanat & Yaratıcı Sektörler
  if (
    combined.includes("tasarım") || combined.includes("grafik") || combined.includes("ui") ||
    combined.includes("ux") || combined.includes("animasyon") || combined.includes("video") ||
    combined.includes("designer") || combined.includes("artist") || combined.includes("kurgu")
  ) {
    return finalizeProfile({
      categoryName: "Üretken Tasarım & Görsel Mimari",
      basePeakYear: 2027,
      baseAutomationPct: 86,
      obsoleteTasks: [
        "Photoshop'ta manuel dekupe, arka plan silme ve rötuş yapmak",
        "Banner, broşür ve sosyal medya için onlarca ebat türevi kopyalamak",
        "Standart stok görsel aramak ve basit ikon çizimleri hazırlamak",
        "Videonun sessiz yerlerini kesmek ve basit altyazıları elle girmek"
      ],
      highValueHumanTasks: [
        "Markanın ruhunu, kültürel kodlarını ve felsefesini belirleyen Kreatif Yönetmenlik",
        "Uzamsal Bilişim (Spatial Computing / Apple Vision Pro) ve 3D AR kullanıcı deneyimi tasarımı",
        "Yapay zekanın ürettiği binlerce varyasyon arasından 'kusursuz zevki' seçip cilalama",
        "Müşterinin dile dökemediği soyut duyguyu somut marka kimliğine dönüştürmek"
      ],
      keyAdaptationSkills: [
        "ComfyUI / Node Tabanlı Üretken Görsel Pipeline Kurulumu",
        "Figma AI ile Otomatik Çoklu Cihaz Tasarım Sistemi (Design Systems)",
        "Runway Gen-3 / Kling ile Sinematik AI Video Yönetmenliği",
        "Spline 3D & WebGL ile İnteraktif Uzamsal Arayüz Tasarımı"
      ],
      recommendedToolsAndFrameworks: [
        "Midjourney v6.1 & Flux.1 Pro (Fotogerçekçi görsel ve konsept sanatı)",
        "ComfyUI (Karakter ve ürün tutarlılığı sağlayan profesyonel AI iş akışı)",
        "Runway Gen-3 Alpha & Kling AI (Sinematik video ve reklam üretimi)",
        "Spline 3D & Figma AI (3D etkileşimli gelecek nesil arayüzler)"
      ],
      targetOpportunities: [
        "Üretken Yapay Zeka Kreatif Direktörü (Stratejik Marka Mimarisi)",
        "Uzamsal Bilişim (Spatial UX) ve Karma Gerçeklik Tasarımcısı",
        "Sanal Prodüksiyon & Sentetik Dünya Mimarı",
        "Kişiselleştirilmiş Dinamik Reklam Motoru Yöneticisi"
      ],
      quickWinSkills: [
        "Flux + ComfyUI ile aynı yüzü ve ürünü 20 farklı sahnede bozulmadan üretmeyi öğrenme (3 gün)",
        "Figma AI eklentileriyle bir web sitesinin wireframe'ini 10 dakikada component kitine dönüştürme",
        "Runway ile 1 saatte ajans kalitesinde 15 saniyelik 3D ürün tanıtım videosu çıkarma"
      ],
      summaryTemplate: "Piksel çizen grafikerlik dönemi sona erdi; artık sahneye 'Kreatif Yapay Zeka Yönetmenleri' çıkıyor. Bir zamanlar 10 kişilik tasarım ajansının 2 haftada yaptığı kampanyayı, tek bir tasarımcı yapay zekayla 4 saatte teslim edebiliyor. Hızlanan kazanacak, piksellere takılan elenecek.",
      personalizedVerdictTemplate: "Geleneksel 'logo çiziyorum, afiş yapıyorum' modeli Rutin Görev İkame İndeksi: 86/100 (görev maruziyeti parametrik modeli; iş kaybı olasılığı değildir) seviyesindedir. Ancak hedefiniz için önemli bir fırsat var: Araçları birer çırak gibi kullanarak tek başınıza tam teşekküllü bir kreatif ajans gücüne ulaşabilir ve pazarın en stratejik yönetmenlik projelerini üstlenebilirsiniz.",
      marketValueImpact: "Model Senaryosu (Nitel Pazar Eğilimi): Şablon grafik ve standart görsel üretiminde yüksek otomasyon baskısı; yapay zeka kreatif üretim hattını yöneten direktörlerde ise stratejik proje değeri ve portfolyo primi (Örnek model projeksiyonudur; kesin istatistiksel gelir garantisi değildir).",
      strategicPhases: [
        {
          phaseName: "1. Aşama: Pikselleri Bırakıp Yönetmen Olun",
          years: "2026 - 2027",
          focus: "Tüm manuel çizim ve dekupeyi yapay zekaya devredin.",
          actions: ["Midjourney, Flux ve ComfyUI'yi üretim hattınızın kalbine koyun.", "Figma AI ile arayüz üretim hızınızı 5 katına çıkarın."]
        },
        {
          phaseName: "2. Aşama: Uzamsal & 3D Tasarım",
          years: "2028 - 2030",
          focus: "2D ekranlardan 3D uzamsal gerçeklik arayüzlerine geçin.",
          actions: ["Spline ve Unreal Engine ile etkileşimli uzamsal deneyimler tasarlayın.", "Markalar için tutarlı yapay zeka modelleri eğitin (LoRA)."]
        },
        {
          phaseName: "3. Aşama: Biyo-Duygusal Arayüzler",
          years: "2031 - 2040",
          focus: "Kullanıcının göz bebeği ve beyin dalgasına göre anlık şekil alan UI tasarlayın.",
          actions: ["Nöro-arayüz ve BCI odaklı duygu haritalama sistemlerine liderlik edin."]
        }
      ]
    });
  }

  // 5. Finans, Muhasebe & Bankacılık
  if (
    combined.includes("muhasebe") || combined.includes("finans") || combined.includes("banka") ||
    combined.includes("mali") || combined.includes("audit") || combined.includes("denetim") ||
    combined.includes("accountant") || combined.includes("finance") || combined.includes("yatırım")
  ) {
    return finalizeProfile({
      categoryName: "Finansal Zeka & Algoritmik Sermaye",
      basePeakYear: 2027,
      baseAutomationPct: 88,
      obsoleteTasks: [
        "Fatura, fiş ve dekontların elle muhasebe programına işlenmesi",
        "Aylık KDV, muhtasar ve bordro puantaj hesaplamalarının manuel yapılması",
        "Banka hareketleri ile kasa hesaplarının tek tek mutabakatı",
        "Standart mali tablo (gelir tablosu, bilanço) dökümü ve kural bazlı denetim"
      ],
      highValueHumanTasks: [
        "Şirket patronuna 'Önümüzdeki 6 ayda nakit krizi yaşamamak için ne yapmalıyız?' stratejisi sunmak",
        "Karmaşık vergi optimizasyonu ve uluslararası holding yapılandırması",
        "Şirket satın alma (M&A) ve şirket değerleme görüşmelerinde masa pazarlığı",
        "Yapay zeka finans modellerinin manipülasyona veya yanlılığa uğramasını denetlemek"
      ],
      keyAdaptationSkills: [
        "Otonom Muhakeme ile Tahmine Dayalı Finansal Modelleme (Predictive Forecasting)",
        "Finansal Veri Mühendisliği (Python / SQL + LLM Analitiği)",
        "Stratejik Vergi Mimarisi & Sermaye Tahsisi",
        "Algoritmik Risk ve Dolandırıcılık (Fraud) Tespiti"
      ],
      recommendedToolsAndFrameworks: [
        "Vic.ai (Fatura işleme ve onay süreçlerinde otonomlaşma platformu — Kurumsal Örnek)",
        "Dext & Trullion (Muhasebe ve denetim otomasyonu)",
        "BloombergGPT & Kensho (Finansal piyasa analiz ve makro öngörü motoru)",
        "Alpaca & QuantConnect (Algoritmik işlem ve portföy optimizasyonu)"
      ],
      targetOpportunities: [
        "Fraksiyonel CFO (Birden Fazla Şirkete Stratejik Finans Liderliği - Model Senaryo Rolü)",
        "Otonom Finansal Denetim ve Fraud Mimarı",
        "Algoritmik Sermaye ve Kripto Varlık Stratejisti",
        "Yapay Zeka Destekli Şirket Değerleme Uzmanı"
      ],
      quickWinSkills: [
        "Vic.ai veya Make.com ile fatura-banka mutabakatını 1 günde tam otomatiğe bağlama",
        "Claude / ChatGPT'ye şirketin 1 yıllık mizanını yükleyip 2 dakikada nakit akışı tehlikelerini raporlatma",
        "Müşterilere 'sadece vergi beyanı' yerine her ay otomatik 'Yönetici Özet Raporu' sunma"
      ],
      summaryTemplate: "Manuel veri girişine dayalı muhasebe görevleri yüksek otomasyon baskısıyla dönüşüyor; yerine şirket sahiplerine yol gösteren 'Yapay Zekalı CFO Danışmanlığı' modeli geliyor. Rutin veri giren roller marjinalleşirken, yapay zekanın verilerini yorumlayıp şirketi kara geçiren finansçıların değeri katlanacak.",
      personalizedVerdictTemplate: "Sektörünüzdeki Rutin Görev İkame İndeksi: 88/100 (görev maruziyeti parametrik modeli; iş kaybı olasılığı değildir) bir tehdit değil, bir sıçrama tahtasıdır. 'Defter tutan' kişi olmaktan acilen çıkıp, 'Geleceği simüle eden ve tasarruf sağlayan Stratejik Finans Lideri' rolünü üstlenmelisiniz.",
      marketValueImpact: "Model Senaryosu (Nitel Pazar Eğilimi): Klasik defter tutma ve veri giriş muhasebesinde kural bazlı otonom ikame; tahmine dayalı finans danışmanlığı ve fraksiyonel CFO rolünde ise stratejik değer ve talep primi (Örnek model projeksiyonudur; kesin istatistiksel gelir garantisi değildir).",
      strategicPhases: [
        {
          phaseName: "1. Aşama: Sıfır Manuel Fatura Girişi",
          years: "2026 - 2027",
          focus: "Evrak ve fatura girişlerinde kural bazlı otonom araçları devreye alın.",
          actions: ["Dext ve Vic.ai benzeri optik veri okuma ve muhasebe botları kurun.", "Müşterilerinize gerçek zamanlı finansal dashboard sunun."]
        },
        {
          phaseName: "2. Aşama: Sanal CFO Hizmeti",
          years: "2028 - 2030",
          focus: "Şirketlere geleceğe dönük nakit akış simülasyonları satın.",
          actions: ["Finansal LLM modelleriyle şirket kriz senaryolarını test edin.", "M&A ve değerleme projelerinde baş danışman olun."]
        },
        {
          phaseName: "3. Aşama: Kuantum ve Otonom Sermaye",
          years: "2031 - 2040",
          focus: "Merkeziyetsiz otonom şirketlerin (DAO) hazinelerini yönetin.",
          actions: ["Yapay zeka ajanlarının yönettiği fonların etik ve finansal denetimini yapın."]
        }
      ]
    });
  }

  // 6. Eğitim & Öğretmenlik
  if (
    combined.includes("öğretmen") || combined.includes("eğitim") || combined.includes("akademisyen") ||
    combined.includes("teacher") || combined.includes("eğitmen") || combined.includes("rehberlik") ||
    combined.includes("profesör") || combined.includes("okul") || combined.includes("kurs")
  ) {
    return finalizeProfile({
      categoryName: "Kişiselleştirilmiş Eğitim & Pedagojik Koçluk",
      basePeakYear: 2030,
      baseAutomationPct: 62,
      obsoleteTasks: [
        "Sınıfta kürsüye geçip 40 kişiye aynı tempoda standart konu anlatımı yapmak",
        "Çoktan seçmeli veya klasik sınav kağıtlarını saatlerce elle okuyup notlandırmak",
        "Standart ders planı, yıllık müfredat çizelgesi ve ödev kağıdı hazırlamak",
        "Öğrencilerin internetten kopyaladığı ödevleri intihal kontrolüyle tespit etmeye çalışmak"
      ],
      highValueHumanTasks: [
        "Öğrencinin içindeki merakı, özgüveni ve eleştirel sorgulama ateşini yakmak",
        "Sınıf içi akran zorbalığı, motivasyon kaybı ve duygusal tıkanıklıkları empatiyle çözmek",
        "Öğrencinin yapay zekayı nasıl 'kendi zihnini geliştiren bir ortak' yapacağını öğretmek",
        "Karmaşık ahlaki ikilemlerde felsefi ve insani tartışmaları modere etmek"
      ],
      keyAdaptationSkills: [
        "Kişiselleştirilmiş Yapay Zeka Müfredat Tasarımı (Adaptive Learning Architecture)",
        "Sokratik Yapay Zeka Eğitmenliği (Öğrenciye cevabı vermeyen, düşündüren botlar kurma)",
        "Duygusal Zeka, İlham ve Bireysel Mentorluk",
        "Sentetik Medya ile Zenginleştirilmiş İnteraktif Ders İçeriği Üretimi"
      ],
      recommendedToolsAndFrameworks: [
        "Khanmigo (Khan Academy'nin Sokratik yöntemle düşündüren öğrenci AI koçu)",
        "Synthesia & HeyGen (Tarihi figürleri konuşturan eğitici video üretimi)",
        "Quizlet AI & Claude Edu (Her öğrencinin anlama hızına göre soru türeten sistemler)",
        "Curipod (Yapay zeka ile anında etkileşimli anketli ders sunumu hazırlama)"
      ],
      targetOpportunities: [
        "Kişiselleştirilmiş Nöro-Öğrenme Mimarı (Model Senaryo Rolü)",
        "Yapay Zeka Pedagojik Güvenlik ve Etik Müfettişi",
        "Karma Gerçeklik (VR/AR) Eğitim Deneyimi Tasarımcısı",
        "Üst Düzey Yönetici ve Çocuklar İçin Bireysel Fütürist Mentor"
      ],
      quickWinSkills: [
        "Curipod ile 5 dakikada sınıfı büyüleyen etkileşimli bir ders içeriği oluşturma",
        "Claude ile her öğrencinin zayıf olduğu konuya özel 3 farklı seviyede alıştırma üretme",
        "Tarih dersinde Atatürk'ü veya Einstein'ı konuşturan 2 dakikalık video ders hazırlama"
      ],
      summaryTemplate: "Kürsüden monolog yapan öğretmenlik devri kapandı; her öğrencinin cebinde 7/24 sabırla anlatan yapay zeka öğretmenler var. İnsan öğretmenin yeni ve kutsal rolü: İlham veren, motivasyon sağlayan ve düşünmeyi öğreten bir 'Hayat Mentoru' olmaktır.",
      personalizedVerdictTemplate: "Standart bilgiyi aktarmaya çalışırsanız yapay zeka sizden daha hızlı ve sabırlı olacaktır. Ancak hedefinizde ilerlemek için dersi bir monologdan çıkarıp, yapay zekayı bir laboratuvar gibi kullanan 'Problem Çözme ve Eleştirel Düşünce Atölyesi'ne dönüştürürseniz vazgeçilmez olursunuz.",
      marketValueImpact: "Model Senaryosu (Nitel Pazar Eğilimi): Standart müfredat monoloğunda yapay zeka asistanlarının devreye girmesi; Sokratik atölye ve bireysel ilham mentoru olan eğitimcilerde ise yüksek toplumsal itibar ve talep artışı (Örnek model projeksiyonudur; kesin istatistiksel gelir garantisi değildir).",
      strategicPhases: [
        {
          phaseName: "1. Aşama: Sınav ve Ödev Yükünden Kurtuluş",
          years: "2026 - 2027",
          focus: "Sınav okuma ve ders planlama işlerini yapay zekaya yaptırın.",
          actions: ["Curipod ve Quizlet AI ile dersleri interaktif hale getirin.", "Öğrencilere yapay zekayla nasıl proje üreteceklerini öğretin."]
        },
        {
          phaseName: "2. Aşama: Bireysel Uyarlanabilir Eğitim",
          years: "2028 - 2030",
          focus: "Her öğrenciye özel hızda ilerleyen yapay zeka koçları yönetin.",
          actions: ["Khanmigo benzeri araçları sınıfa tam entegre edin.", "Öğrencilerin duygusal ve sosyal gelişimine odaklanın."]
        },
        {
          phaseName: "3. Aşama: Metaverse ve VR Sınıfları",
          years: "2031 - 2040",
          focus: "Tarihi olayları yerinde yaşatan sanal gerçeklik eğitimleri verin.",
          actions: ["Antik Roma'da veya Mars kolonisinde geçen sanal dersler kurgulayın."]
        }
      ]
    });
  }

  // 7. Satış, Pazarlama & İçerik
  if (
    combined.includes("pazarlama") || combined.includes("satış") || combined.includes("marketing") ||
    combined.includes("seo") || combined.includes("sosyal medya") || combined.includes("içerik") ||
    combined.includes("reklam") || combined.includes("e-ticaret") || combined.includes("sales")
  ) {
    return finalizeProfile({
      categoryName: "Otonom Büyüme & Hiper-Kişiselleştirilmiş Pazarlama",
      basePeakYear: 2027,
      baseAutomationPct: 84,
      obsoleteTasks: [
        "SEO için genel, ruhsuz ve kopyala-yapıştır blog yazıları yazmak",
        "Hedef kitleye toplu, şablon soğuk e-postalar (cold email) göndermek",
        "Sosyal medya için her gün elle gönderi planlamak ve metin yazmak",
        "Temel reklam metni varyasyonları üretmek ve bütçe eşitlemesi yapmak"
      ],
      highValueHumanTasks: [
        "B2B üst düzey yöneticilerle yemekte güven inşa edip milyon dolarlık el sıkışmak",
        "Topluluk oluşturma (Community Building) ve markanın fanatik takipçilerini yaratma",
        "Kültürel akımları ve meme kültürünü herkesten önce koklayıp cesur kampanyalar açmak",
        "Otonom ajanlardan oluşan satış ve pazarlama hunilerini (funnel) mimari olarak tasarlamak"
      ],
      keyAdaptationSkills: [
        "AI Destekli B2B Müşteri Adayı Madenciliği (Clay.com + LLM Entegrasyonu)",
        "Otonom İçerik ve Reklam Optimizasyon Sistemleri Kurulumu",
        "Hiper-Kişiselleştirilmiş Video Satış Mesajları (HeyGen / Tavus API)",
        "İkna Psikolojisi & Yüksek Bütçeli Müzakere"
      ],
      recommendedToolsAndFrameworks: [
        "Clay.com (İnterneti tarayıp hedef müşteriye özel istihbarat toplayan AI satış aracı)",
        "HeyGen & Tavus (Müşterinin adıyla kişiselleştirilmiş 1000'lerce video üreten sistem)",
        "Surfer SEO & Frase (Arama niyetini analiz eden içerik motorları)",
        "Make / n8n + Claude (Gelen talebi anında yanıtlayıp randevuyu takvime işleyen botlar)"
      ],
      targetOpportunities: [
        "Otonom Gelir ve Büyüme Mimarı (Head of Growth AI - Model Senaryo Rolü)",
        "Hiper-Kişiselleştirilmiş Müşteri Deneyimi Stratejisti",
        "Sentetik Etkileyici (AI Influencer) ve Topluluk Yöneticisi",
        "B2B Stratejik Anlaşma Kapatıcısı (Enterprise Deal Closer)"
      ],
      quickWinSkills: [
        "Clay.com + Claude ile 100 hedef müşteriye özel araştırma yapıp e-posta atan sistemi 2 günde kurma",
        "HeyGen ile 1 kere video çekip bunu 500 farklı şirkete özel isimle video mesaja dönüştürme",
        "Web sitesindeki forma gelen kişiyi 30 saniye içinde AI ile arayıp randevu bağlama otomasyonu"
      ],
      summaryTemplate: "Genel içerik yazıp rastgele reklam veren pazarlamacılar eleniyor. Geleceğin kazananı; yapay zekayı arkasına alarak her bir müşteriye özel video, teklif ve strateji sunan 'Otonom Büyüme Mühendisleri' olacak.",
      personalizedVerdictTemplate: "Hedefiniz doğrultusunda klasik içerik üreticiliğini derhal terk etmelisiniz. Şirketlere 'içerik' değil doğrudan 'satış randevusu ve ciro' getiren Clay + HeyGen benzeri otonom satış hunileri kurarsanız geliriniz katlanarak artacaktır.",
      marketValueImpact: "Model Senaryosu (Nitel Pazar Eğilimi): Şablon metin yazarlığı ve rutin sosyal medya planlamasında otonomlaşma; yapay zekalı büyüme hunisi ve stratejik müzakere yürüten uzmanlarda ise yüksek dönüşüm primi (Örnek model projeksiyonudur; kesin istatistiksel gelir garantisi değildir).",
      strategicPhases: [
        {
          phaseName: "1. Aşama: Otonom Müşteri Bulma",
          years: "2026 - 2027",
          focus: "Müşteri bulma ve ilk iletişimi tamamen yapay zeka ajanlarına devredin.",
          actions: ["Clay.com ve Apollo entegrasyonuyla otomatik hedef kitle listeleri oluşturun.", "Kişiye özel dinamik video satış mesajları gönderin."]
        },
        {
          phaseName: "2. Aşama: Tahmine Dayalı Pazarlama",
          years: "2028 - 2030",
          focus: "Müşterinin satın alma anını yapay zeka ile önceden tahmin edin.",
          actions: ["Kullanıcı davranışlarını gerçek zamanlı analiz eden yapay zeka ajanları kurun.", "Bütçeyi en yüksek dönüşüm getiren kanallara dinamik kaydırın."]
        },
        {
          phaseName: "3. Aşama: Sentetik Marka Ekosistemleri",
          years: "2031 - 2040",
          focus: "Yapay zekanın yönettiği otonom e-ticaret markaları yönetin.",
          actions: ["Kişiye özel dinamik ürün üreten ve anında kargolayan sistemlerin mülkiyetini alın."]
        }
      ]
    });
  }

  // 8. Öğrenci, Yeni Mezun, İş Arayan & Kariyer Değiştiren
  if (
    combined.includes("öğrenci") || combined.includes("mezun") || combined.includes("işsiz") ||
    combined.includes("iş arayan") || combined.includes("kariyer değiştiren") || combined.includes("student") ||
    combined.includes("kariyer arayışı") || combined.includes("yol ayrımı") || combined.includes("genç")
  ) {
    return finalizeProfile({
      categoryName: "Yeni Nesil İstihdam & Geleceğin Becerileri",
      basePeakYear: 2028,
      baseAutomationPct: 70,
      obsoleteTasks: [
        "100 farklı şirkete aynı standart PDF CV'yi gönderip dönüş beklemek",
        "Sadece 4 yıllık üniversite diplomasına güvenip pratik portföy üretmemek",
        "İnternette zaten olan teorik bilgileri ezberlemeye çalışmak",
        "Geleneksel stajlarda fotokopi çekmek ve excel tablolarına veri girmek"
      ],
      highValueHumanTasks: [
        "Sıfırdan yapay zeka araçlarıyla çalışan bir dijital ürün / MVP çıkarıp yayına almak",
        "Şirketlerin yaşadığı somut bir darboğazı yapay zekayla çözüp demo olarak şirket sahibine sunmak",
        "Kişisel sosyal medya (LinkedIn, X, YouTube) üzerinden şeffaf şekilde öğrendiklerini inşa etmek (Build in Public)",
        "Disiplinlerarası merak: Kodlama + Tasarım + Satışı yapay zeka kaldıraçlarıyla birleştirmek"
      ],
      keyAdaptationSkills: [
        "Full-Stack AI Ajan Kullanımı (Cursor / Claude / v0 ile 48 saatte ürün çıkarma)",
        "No-Code Otomasyon Mimarlığı (n8n / Make ile şirket iş akışlarını otomatikleştirme)",
        "Problem Avcılığı (Şirketlerde elle yapılan zaman kayıplarını tespit etme)",
        "Dijital Kişisel Marka & Çıktı Odaklı İletişim"
      ],
      recommendedToolsAndFrameworks: [
        "Cursor IDE & v0.dev (Sıfır kodlama geçmişiyle bile tam çalışan web yazılımları geliştirme)",
        "Claude 3.7 Sonnet (Derin mantık yürütme ve iş planı çıkarma asistanı)",
        "n8n & Make.com (Kod yazmadan şirket süreçlerini otomatikleştiren platformlar)",
        "Loom (Yaptığınız işi 2 dakikada müşteriye gösterip işi bağlama aracı)"
      ],
      targetOpportunities: [
        "Yapay Zeka Operasyon Asistanı (AI Operations Specialist - Model Senaryo Rolü)",
        "No-Code Süreç Otomasyon Danışmanı",
        "Tek Kişilik Dijital Girişimci (Solopreneur)",
        "KOBİ'ler İçin Yapay Zeka Entegrasyon Rehberi"
      ],
      quickWinSkills: [
        "v0.dev ve Cursor kullanarak 1 hafta sonu içinde çalışan bir web aracı yapıp yayına alma",
        "Bir KOBİ'nin WhatsApp veya e-posta siparişlerini Excel'e kaydeden n8n botu kurma (3 günde öğrenilir)",
        "LinkedIn'de her hafta yapay zeka ile çözdüğü 1 gerçek problemi video ile paylaşarak teklif çekme"
      ],
      summaryTemplate: "Geleneksel 'üniversiteyi bitir, CV gönder, işe gir' formülü bozuldu. Şirketler artık ne bildiğinize değil, yapay zekayı kullanarak ne kadar hızlı ve ucuz değer ürettiğinize bakıyor. 20 yaşındaki bir genç, AI araçlarıyla 10 kişilik eski bir ekibin işini tek başına yapabilir.",
      personalizedVerdictTemplate: "İş aramak veya kariyer değiştirmek için en doğru dönemdesiniz. Çünkü şu an 20 yıllık uzmanlar bile yapay zekayı yeni öğreniyor; yani yarış yeniden başladı! Kendinizi 'CV gönderen iş arayan' olarak değil, 'şirketlerin manuel dertlerini yapay zekayla çözen bir Çözüm Ortağı' olarak konumlandırmalısınız.",
      marketValueImpact: "Klasik diploması olan ancak AI araçlarını benimsemeyen adaylarda rutin görev ikame baskısı; yapay zeka araçlarıyla çalışan MVP üretebilen adaylarda model projeksiyonlarına göre yüksek talep primi.",
      strategicPhases: [
        {
          phaseName: "1. Aşama: 30 Günde İlk Canlı Proje",
          years: "2026 - 2027",
          focus: "Teori okumayı bırakın; Cursor ve v0 ile canlı bir proje üretip portföyünüze koyun.",
          actions: ["n8n ve Claude kullanarak bir otomasyon botu yapın.", "CV yerine yaptığınız projenin 2 dakikalık Loom videosunu paylaşın."]
        },
        {
          phaseName: "2. Aşama: İlk Gelir & KOBİ Danışmanlığı",
          years: "2028 - 2030",
          focus: "Çevrenizdeki 3 şirketin yapay zeka entegrasyonunu yaparak referans edinin.",
          actions: ["Şirketlerin müşteri hizmetleri veya teklif süreçlerini AI botlarına devredin.", "Kendi dijital ürününüzü satmaya başlayın."]
        },
        {
          phaseName: "3. Aşama: Otonom Şirket Kuruculuğu",
          years: "2031 - 2040",
          focus: "Sıfır çalışanla milyon dolarlık ciro yapan AI şirketleri kurun.",
          actions: ["Yapay zeka ajanlarını şirketinizin çalışanları gibi organize edin."]
        }
      ]
    });
  }

  // 9. Yazılım & Bilişim (Explicit Tech Match)
  const isSoftware =
    combined.includes("yazılım") ||
    combined.includes("kod") ||
    combined.includes("developer") ||
    combined.includes("mühendis") ||
    combined.includes("software") ||
    combined.includes("frontend") ||
    combined.includes("backend") ||
    combined.includes("fullstack") ||
    combined.includes("devops") ||
    combined.includes("programlama") ||
    combined.includes("bilgisayar") ||
    combined.includes("yapay zeka") ||
    combined.includes("ai engineer") ||
    combined.includes("data engineer") ||
    combined.includes("veri analisti") ||
    combined.includes("siber") ||
    combined.includes("cyber") ||
    combined.includes("it uzman") ||
    combined.includes("sistem yöneticisi");

  if (isSoftware) {
    return finalizeProfile({
      categoryName: "Yazılım Mimarisi & Otonom Kod Sistemleri",
      basePeakYear: 2028,
      baseAutomationPct: 82,
      obsoleteTasks: [
        "Standart REST API ve CRUD fonksiyonlarını elle sıfırdan yazmak",
        "CSS stilleri, basit HTML formları ve buton düzenlemeleriyle saatler harcamak",
        "Basit birim testleri (unit tests) ve mock verileri manuel kopyalamak",
        "Kütüphane dokümantasyonunu arayıp kural bazlı syntax hatalarını ayıklamak"
      ],
      highValueHumanTasks: [
        "Milyonlarca kullanıcılı dağıtık sistem mimarisi ve felaket kurtarma senaryoları tasarlamak",
        "Otonom yapay zeka ajanlarının hata yapmasını önleyen deterministik denetim kalkanları kurmak",
        "LLM güvenlik açıkları (Prompt Injection, Jailbreak, Veri Sızıntısı) için siber savunma kurgulamak",
        "İş dünyasının karmaşık ve belirsiz taleplerini kusursuz teknik veri modellerine çevirmek"
      ],
      keyAdaptationSkills: [
        "Çoklu Ajan Orkestrasyonu (Multi-Agent Swarms - LangGraph, AutoGen)",
        "Yapay Zeka Destekli Sistem Tasarımı & Kod İnceleme Liderliği",
        "RAG & Vektör Veritabanı Mimarisi (Pinecone, Qdrant, Milvus)",
        "LLM Güvenlik Denetimi & Algoritmik Doğrulama (Red-Teaming)"
      ],
      recommendedToolsAndFrameworks: [
        "Cursor IDE & Windsurf (Geliştiriciyi 10x hızlandıran nöral editörler)",
        "Claude Code & Devin (Komut satırından otonom görev çözen yazılım ajanları)",
        "LangGraph & CrewAI (Çoklu ajan iş akışları mimarisi)",
        "v0.dev & Lovable (Saniyeler içinde tam fonksiyonel frontend arayüzleri)"
      ],
      targetOpportunities: [
        "Yapay Zeka Ajan Sistemleri Baş Mimarı (Model Senaryo Rolü)",
        "Algoritmik Güvenlik ve LLM Red-Teaming Uzmanı",
        "Kuantum Bilişim ve Hibrit Algoritma Mühendisi",
        "Tek Kişilik Milyon Dolarlık Yazılım Kurucusu (Solo AI Founder)"
      ],
      quickWinSkills: [
        "Cursor veya Claude Code ile 1 günde sıfırdan çalışan tam teşekküllü bir full-stack uygulama çıkarma",
        "LangGraph ile kendi kendine kod yazıp test eden 2'li bir ajan sistemi kurma (1 hafta)",
        "Şirket içi dokümanları vektör veritabanına bağlayıp akıllı şirket içi asistan üretme"
      ],
      summaryTemplate: "Standart ve tekrarlayan kod yazma görevleri yüksek otomasyon baskısı altındadır. Artık yazılımcılar birer 'kod yazarı' değil, yapay zeka ajanlarından oluşan mühendislik filolarını yöneten birer 'Sistem Mimarı ve Baş Denetçi'dir. Ajanları yönetebilen yazılımcının üretim çarpanı ve stratejik değeri belirgin biçimde artacaktır.",
      personalizedVerdictTemplate: "Belirttiğiniz hedef doğrultusunda, klavyeyle şablon kod yazan bir geliştirici pozisyonunda kalmak Rutin Görev İkame İndeksi: 82/100 (görev maruziyeti parametrik modeli; iş kaybı olasılığı değildir) seviyesindedir. Ancak hemen Cursor, Claude Code ve LangGraph gibi araçlara geçerek, bir ekibin 1 ayda yazdığı projeyi tek başınıza 2 günde mimari seviyede teslim eden 'Süper Mühendis' seviyesine sıçrayabilirsiniz.",
      marketValueImpact: "Model Senaryosu (Nitel Pazar Eğilimi): Şablon ve kural bazlı standart kod yazımında otonom kod asistanları etkisi; yapay zeka ajan filolarını yöneten sistem mimarlarında ise yüksek pazar değeri ve stratejik rol primi (Örnek model projeksiyonudur; kesin istatistiksel gelir/maaş garantisi değildir).",
      strategicPhases: [
        {
          phaseName: "1. Aşama: Rutin Kodlama Yükünü Optimize Edin (Model Senaryosu)",
          years: "2026 - 2027",
          focus: "Rutin kod yazmayı Cursor ve Claude Code gibi ajan araçlarıyla optimize edin.",
          actions: ["Geliştirme ortamınızı tamamen AI ajanlarıyla entegre edin.", "Sistem mimarisi ve güvenlik konularında derinleşin."]
        },
        {
          phaseName: "2. Aşama: Ajan Filoları Yönetimi",
          years: "2028 - 2030",
          focus: "Şirketinizde otonom çalışan AI yazılımcı ordularını kurun.",
          actions: ["LangGraph ve CrewAI ile otonom test ve dağıtım pipeline'ları kurun.", "LLM güvenlik denetiminde otorite haline gelin."]
        },
        {
          phaseName: "3. Aşama: Post-AGI ve Kuantum Yazılım",
          years: "2031 - 2040",
          focus: "Kuantum algoritmaları ve nöromorfik çipler için kod geliştirin.",
          actions: ["Biyo-dijital ikizler ve kuantum şifreleme yazılımlarına liderlik edin."]
        }
      ]
    });
  }

  // 10. Genel Hizmet, Zanaat & Saha İşgücü (Generic Neutral Fallback for Trades & Services)
  return finalizeProfile({
    categoryName: "Hizmet, Zanaat, Saha & Operasyonel İşgücü",
    basePeakYear: 2033,
    baseAutomationPct: 48,
    obsoleteTasks: [
      "Manuel kağıt evrak, standart form ve veri giriş operasyonları",
      "Rutin envanter, stok ve basit lojistik kayıt tutma işlemleri",
      "Standart telefon çağrıları, basit randevu ve rezervasyon takipleri",
      "Kural bazlı, tekrarlayan fiziksel sayım ve şablon kontrol görevleri"
    ],
    highValueHumanTasks: [
      "İnce motor becerisi, el işçiliği, yerinde fiziki müdahale ve saha problem çözümü",
      "Yüksek empati gerektiren yüz yüze müşteri ilişkileri, insani güven ve rehberlik",
      "Beklenmedik kriz, acil durum müdahalesi ve değişken saha koşullarına anlık uyum",
      "Fiziki zanaatkarlık, özgün lezzet/tasarım üretimi ve yerel deneyim küratörlüğü"
    ],
    keyAdaptationSkills: [
      "Yapay Zeka Destekli Operasyon ve Planlama Araçlarını Kullanabilme",
      "Saha Teknolojileri, Akıllı Teşhis & Mobil Dijital Asistan Uyumu",
      "İleri Düzey İnsani İletişim, Çözüm Odaklılık ve Güven Yönetimi",
      "Otonom Robotik/Sensör Sistemleriyle Eşgüdümlü Hibrit Çalışma"
    ],
    recommendedToolsAndFrameworks: [
      "Akıllı Saha & Randevu Yönetim Asistanları (AI Booking & Workflow)",
      "Mobil Teşhis & Stok Optimizasyon Sistemleri",
      "Çok Dilli Gerçek Zamanlı Sesli İletişim ve Çeviri Araçları",
      "Müşteri İlişkileri ve Yerel İtibar Yönetim Platformları"
    ],
    targetOpportunities: [
      "Yeni Nesil Akıllı Hizmet ve Saha Koordinatörü",
      "Yüksek Katma Değerli Butik Zanaat ve Özel Deneyim Uzmanı",
      "Fiziksel-Dijital Hibrit Operasyon Yöneticisi",
      "Saha Robotik ve Akıllı Donanım Saha Süpervizörü"
    ],
    quickWinSkills: [
      "İşletmeniz veya hizmetiniz için yapay zeka destekli otomatik rezervasyon/iletişim asistanı kurma",
      "Mobil yapay zeka araçlarıyla günlük iş akışını, stok takibini ve maliyet hesabını otomatikleştirme",
      "Yerel müşteri kitlesi için kişiselleştirilmiş dijital hizmet ve teklif şablonları hazırlama"
    ],
    summaryTemplate: "Fiziksel dünya, el becerisi ve insani temas gerektiren meslekler; saf bilişsel ve ekran başı işlere kıyasla yapay zeka otomasyonuna karşı çok daha dirençlidir. Tehdit doğrudan mesleğinizin yok olması değil; operasyonel süreçlerde yapay zekayı ve akıllı araçları kullanan rakiplerin hız ve maliyet avantajı elde etmesidir.",
    personalizedVerdictTemplate: "Belirttiğiniz hedef doğrultusunda, fiziksel el becerisi, saha tecrübesi ve yüz yüze güven ilişkisi gerektiren yönleriniz yapay zeka tarafından kolayca ikame edilemez. Ancak idari, planlama ve lojistik yüklerinizi akıllı mobil araçlara devredip doğrudan katma değerli insani hizmete odaklanarak sektörünüzde vazgeçilmez bir uzman konumuna gelebilirsiniz.",
    marketValueImpact: "Model Senaryosu (Nitel Pazar Eğilimi): Sadece standart ve kural bazlı operasyon yürüten geleneksel profillerde verimlilik baskısı; saha deneyimini akıllı teknolojilerle birleştiren zanaat ve saha uzmanlarında ise güçlü müşteri bağlılığı ve katma değer (Örnek model projeksiyonudur; kesin istatistiksel gelir artışı garantisi değildir).",
    strategicPhases: [
      {
        phaseName: "1. Aşama: İdari ve İletişim Yükünü Otomatize Edin",
        years: "2026 - 2027",
        focus: "Telefon, randevu, kayıt ve teklif süreçlerini yapay zeka araçlarıyla otomatikleştirin.",
        actions: ["Gelen müşteri talepleri için akıllı asistanları devreye alın.", "Tüm mesainizi doğrudan kaliteli fiziksel icraata ve müşteri memnuniyetine ayırın."]
      },
      {
        phaseName: "2. Aşama: Akıllı Ekipman ve Hibrit Hizmet",
        years: "2028 - 2030",
        focus: "Saha araçlarınızı, teşhis yazılımlarını ve akıllı donanımları çalışma sisteminize entegre edin.",
        actions: ["Mobil teşhis ve otomatik teklif sistemleriyle operasyon hızınızı iki katına çıkarın.", "Özgün el işçiliği ve insani dokunuş içeren butik hizmetlerinize prim uygulayın."]
      },
      {
        phaseName: "3. Aşama: Otonom Saha Koordinasyonu",
        years: "2031 - 2040",
        focus: "Robotik yardımcıları ve akıllı sensörleri sahada süpervize eden koordinatör olun.",
        actions: ["Fiziksel robotik ve otonom teslimat/üretim sistemlerini yerinde yönetin.", "Bölgesel güven ve insani itibarınızı en büyük sermayeniz haline getirin."]
      }
    ]
  });
}
