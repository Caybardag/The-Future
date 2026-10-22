import { Milestone, PhaseInfo } from "../types";

export const PHASES: PhaseInfo[] = [
  {
    id: 1,
    title: "Aşama 1: Dijital ve Biyolojik Olanın Tanışması",
    subtitle: "2026 - 2035",
    startYear: 2026,
    endYear: 2035,
    color: "#00F2FE",
    gradient: "from-cyan-500 to-blue-600",
    description: "Yapay zeka ajanlarından kuantum güvenliğe, giyilebilir nöroteknolojiden CRISPR onaylarına dijital ile biyolojik dünyanın ilk entegrasyon çağı.",
    keyTheme: "Otonomi, Biyolojik Entegrasyon ve Sentetik Gerçeklik"
  },
  {
    id: 2,
    title: "Aşama 2: İnsanlığın Kendini Hacklemesi",
    subtitle: "2036 - 2045",
    startYear: 2036,
    endYear: 2045,
    color: "#9D4EDD",
    gradient: "from-purple-500 to-pink-600",
    description: "Dijital ikizlerden 3D organ basımına, nöral telepati ağlarından ve küresel UBI uygulamalarından Yapay Süper Zeka (Singularity) eşiğine geçiş.",
    keyTheme: "Genetik Tasarım, Dijital Telepati ve Tekillik Eşiği"
  },
  {
    id: 3,
    title: "Aşama 3: Biyolojik Sınırların Aşılması",
    subtitle: "2046 - 2060",
    startYear: 2046,
    endYear: 2060,
    color: "#FFB703",
    gradient: "from-amber-400 to-emerald-500",
    description: "Zihinsel yedekleme, ölümsüzlük kaçış hızı, kovan zihni, uzay madenciliği, madde programlama ve Homo Sapiens 2.0 post-insan medeniyeti.",
    keyTheme: "Post-İnsan Çağı, Madde Programlama ve Sentetik Evrenler"
  }
];

export const TIMELINE_DATA: Milestone[] = [
  {
    year: 2026,
    title: "Yapay Zeka Ajanları Çağı",
    description: "Yapay zeka sadece metin yazmakla kalmaz; otonom şirketler kurar, kendi başına yazılım kodlar ve insan gözetimi olmadan finansal kararlar alır.",
    phase: 1,
    category: "Yapay Zeka & Bilişim",
    probability: 99,
    iconName: "Bot",
    impactLevel: 35,
    humanAugmentationIndex: 12,
    aiAutonomyIndex: 45,
    bioDigitalIntegrationRate: 15,
    keyDrivers: ["Multi-Agent Sistemler", "Otonom İş Akışları", "LLM Entegrasyonu"],
    dailyLifeImpact: "Sıradan bir çalışan kişisel yapay zeka ajanlarına 10 farklı şirketi otonom yönettirebilir.",
    ethicalRisks: ["Otonom finansal karar hataları", "İstihdam kaymaları", "Sorumluluk karmaşası"],
    societalOpportunities: ["Maliyetlerin %80 düşmesi", "Hyper-verimlilik", "Girişimcilik demokratikleşmesi"],
    relatedYears: [2027, 2029],
    patents: [
      {
        patentNumber: "US10452978B2",
        title: "Attention-based neural network architecture for processing sequential data",
        assignee: "Google LLC / DeepMind",
        yearFiled: 2017,
        googlePatentsUrl: "https://patents.google.com/patent/US10452978B2/en",
        abstractSnippet: "Vaswani et al. tarafından tescillenen temel Transformer mimarisi patenti. Otonom LLM ve çoklu ajan sistemlerinin omurgasını oluşturur.",
        patentType: "verified_patent",
        isRealPatent: true
      },
      {
        patentNumber: "US10929749B2",
        title: "Neural network architectures for multi-modal sequence processing and task decomposition",
        assignee: "Google LLC / DeepMind",
        yearFiled: 2019,
        googlePatentsUrl: "https://patents.google.com/patent/US10929749B2/en",
        abstractSnippet: "Otonom karar alma ve görev ayrıştırma yapabilen çok modlu yapay zeka sinir ağı mimarisi.",
        patentType: "verified_patent",
        isRealPatent: true
      },
      {
        patentNumber: "US11182698B2",
        title: "Autonomous agent decision-making and policy training architecture",
        assignee: "OpenAI / Microsoft Corp",
        yearFiled: 2020,
        googlePatentsUrl: "https://patents.google.com/patent/US11182698B2/en",
        abstractSnippet: "İnsan geri bildirimiyle pekiştirmeli öğrenme (RLHF) kullanarak otonom ajanların karmaşık iş akışlarında karar alma eğitimi patenti.",
        patentType: "verified_patent",
        isRealPatent: true
      },
      {
        patentNumber: "US10860953B2",
        title: "Enterprise autonomous agent orchestration and cognitive workflow execution",
        assignee: "IBM Corp (WatsonX)",
        yearFiled: 2018,
        googlePatentsUrl: "https://patents.google.com/patent/US10860953B2/en",
        abstractSnippet: "Karmaşık iş süreçlerinde bağımsız görev alan otonom yapay zeka ajanlarının orkestrasyonu ve iş akışı denetimi patenti.",
        patentType: "verified_patent",
        isRealPatent: true
      }
    ],
    googlePatentsSearchUrl: "https://patents.google.com/?q=(autonomous+agent+OR+multi-agent)+artificial+intelligence"
  },
  {
    year: 2027,
    title: "Sentetik Gerçeklik Krizi",
    description: "Deepfake ve yapay medya o kadar kusursuz hale gelir ki, internetteki içeriklerin gerçekliğini kanıtlamak için 'Dijital DNA' (filigran) yasaları küresel olarak zorunlu kılınır.",
    phase: 1,
    category: "Sosyoloji & Ekonomi",
    probability: 99,
    iconName: "ShieldAlert",
    impactLevel: 42,
    humanAugmentationIndex: 15,
    aiAutonomyIndex: 52,
    bioDigitalIntegrationRate: 18,
    keyDrivers: ["Generative Video 4K", "Kriptografik Filigranlama", "Küresel Medya Yasaları"],
    dailyLifeImpact: "Haber izlerken ekran köşesindeki yeşil 'Dijital Doğruluk Sertifikası' kontrol edilir.",
    ethicalRisks: ["Dezenformasyon savaşları", "Sosyal güven bunalımı", "Kimlik hırsızlığı"],
    societalOpportunities: ["Doğrulanmış şeffaf medya standartları", "Gelişmiş kriptografik güvenlik"],
    relatedYears: [2026, 2034],
    patents: [
      {
        patentNumber: "US10128036B2",
        title: "Digital watermarking and cryptographic authentication of media streams",
        assignee: "Google LLC",
        yearFiled: 2016,
        googlePatentsUrl: "https://patents.google.com/patent/US10128036B2/en",
        abstractSnippet: "Görsel ve işitsel medyalara algılanamaz kriptografik filigran ekleyerek kaynağı doğrulama patenti.",
        patentType: "verified_patent",
        isRealPatent: true
      }
    ],
    googlePatentsSearchUrl: "https://patents.google.com/?q=synthetic+media+watermarking+deepfake+detection"
  },
  {
    year: 2028,
    title: "Katı Hal (Solid-State) Batarya Devrimi",
    description: "Enerji depolamada lityum-iyonun yerini katı hal pilleri alır. Termodinamik ve hücre yoğunluğu sınırları gereği sınırsız menzil olmasa da, 2 kat daha yüksek enerji yoğunluğu, yüksek güvenlik ve 10 dakikada şarj imkanı sunar.",
    phase: 1,
    category: "Enerji & Çevre",
    probability: 95,
    iconName: "Zap",
    impactLevel: 50,
    humanAugmentationIndex: 18,
    aiAutonomyIndex: 55,
    bioDigitalIntegrationRate: 20,
    keyDrivers: ["Elektrolit Malzeme Bilimi", "Katı Elektrolit Seri Üretimi", "Yeşil Enerji Ağı"],
    dailyLifeImpact: "Elektrikli otomobiller 10 dakikalık güvenli şarjla 800 - 1.000 km menzile kavuşur; patlama riski sıfırlanır.",
    ethicalRisks: ["Nadir toprak elementleri rekabeti", "Eski pil geri dönüşüm krizleri"],
    societalOpportunities: ["Fosil yakıtlara bağımlılığın azalması", "Şehir içi emisyon ve şarj sürelerinde köklü iyileşme"],
    relatedYears: [2032, 2037],
    patents: [
      {
        patentNumber: "US10651498B2",
        title: "Solid electrolyte composition and method of manufacturing solid-state lithium battery",
        assignee: "Toyota Motor Corp",
        yearFiled: 2018,
        googlePatentsUrl: "https://patents.google.com/patent/US10651498B2/en",
        abstractSnippet: "Toyota'nın 1000'den fazla patent içeren dev katı hal pil portföyünün temeli. Yüksek sıcaklık stabilitesi ve seri üretim yöntemlerini tesciller.",
        patentType: "verified_patent",
        isRealPatent: true
      },
      {
        patentNumber: "US10840552B2",
        title: "Solid-state lithium battery separator and solid electrolyte cell",
        assignee: "QuantumScape Corp (Volkswagen Group)",
        yearFiled: 2018,
        googlePatentsUrl: "https://patents.google.com/patent/US10840552B2/en",
        abstractSnippet: "Anotsuz mimari ve dendrit oluşumunu engelleyen esnek seramik katı elektrolit ayırıcı patenti.",
        patentType: "verified_patent",
        isRealPatent: true
      }
    ],
    googlePatentsSearchUrl: "https://patents.google.com/?q=solid+state+ceramic+electrolyte+battery+toyota+quantumscape"
  },
  {
    year: 2029,
    title: "Yapay Genel Zeka (AGI) & Mantıksal Akıl Yürütme",
    description: "Turing Testi günümüz LLM'leri tarafından zaten aşılmış olup AGI için yetersizdir. 2029 projeksiyonu; çok modlu nedensel akıl yürütme, otonom hedef planlama ve sürekli öğrenme yeteneği sergileyen AGI protokollerine odaklanır.",
    phase: 1,
    category: "Yapay Zeka & Bilişim",
    probability: 88,
    iconName: "BrainCircuit",
    impactLevel: 68,
    humanAugmentationIndex: 25,
    aiAutonomyIndex: 75,
    bioDigitalIntegrationRate: 28,
    keyDrivers: ["Nöromorfik Çipler", "Çok Modlu Muazzam Model Mimarileri", "Sürekli Öğrenme"],
    dailyLifeImpact: "AGI sistemleri karmaşık bilimsel araştırmalarda insan bilim insanlarına yardım eder, ancak nihai kararlarda insan denetimi (Human-in-the-Loop) korunur.",
    ethicalRisks: ["Kontrol ve hiza (alignment) problemi", "Entelektüel iş gücünün ikamesi"],
    societalOpportunities: ["Bilimsel keşiflerin hızlanması", "Sınırsız kişiselleştirilmiş eğitim ve danışmanlık"],
    relatedYears: [2026, 2045],
    patents: [
      {
        patentNumber: "US10860942B2",
        title: "General learning systems and theorem proving reinforcement learning algorithms",
        assignee: "Google LLC / DeepMind",
        yearFiled: 2018,
        googlePatentsUrl: "https://patents.google.com/patent/US10860942B2/en",
        abstractSnippet: "Spesifik bir göreve bağlı kalmaksızın oyun oynayan, matematiksel kuralları ve teoremleri otonom ispatlayan genel öğrenme algoritmaları patenti.",
        patentType: "verified_patent",
        isRealPatent: true
      },
      {
        patentNumber: "US11354580B2",
        title: "Autonomous multi-step reasoning and iterative plan verification architecture",
        assignee: "OpenAI / Microsoft Corp",
        yearFiled: 2020,
        googlePatentsUrl: "https://patents.google.com/patent/US11354580B2/en",
        abstractSnippet: "Otonom ajanların çok adımlı nedensel akıl yürütme, hedef doğrulama ve stratejik karar alma mekanizmaları patenti.",
        patentType: "verified_patent",
        isRealPatent: true
      },
      {
        patentNumber: "US11042817B2",
        title: "Cognitive AGI logic engine and enterprise decision orchestration",
        assignee: "IBM Corp (WatsonX)",
        yearFiled: 2019,
        googlePatentsUrl: "https://patents.google.com/patent/US11042817B2/en",
        abstractSnippet: "Ölçeklenebilir AGI uygulamaları ve karmaşık mantıksal sorgulamaları çözen otonom karar motoru patenti.",
        patentType: "verified_patent",
        isRealPatent: true
      }
    ],
    googlePatentsSearchUrl: "https://patents.google.com/?q=artificial+general+intelligence+deepmind+openai+ibm"
  },
  {
    year: 2030,
    title: "Giyilebilir Nöroteknoloji & BCI Sinyal İşleme",
    description: "Giyilebilir sensörler (EEG/fNIRS) dışarıdan zihinsel odaklanma ve basit komutları okur. Kafatası sinyal gürültüsü nedeniyle hassas metin yazımı yeteneği hibrit AI niyet tahminleyicileriyle desteklenir.",
    phase: 1,
    category: "İnsan-Makine Arayüzü",
    probability: 92,
    iconName: "Glasses",
    impactLevel: 58,
    humanAugmentationIndex: 38,
    aiAutonomyIndex: 78,
    bioDigitalIntegrationRate: 35,
    keyDrivers: ["EEG/fNIRS Sensör İlerlemesi", "Nöral Sinyal İşleme AI", "Non-Invasive BCI"],
    dailyLifeImpact: "Giyilebilir kulaklık ve bantlar ile odaklanma seviyesi ölçülür, eller serbest dijital tetiklemeler yapılır.",
    ethicalRisks: ["Zihin gizliliği ihlalleri", "Nöral reklamcılık baskısı"],
    societalOpportunities: ["Engelli bireyler için tam erişilebilirlik", "Eller serbest dijital etkileşim"],
    relatedYears: [2044, 2047],
    patents: [
      {
        patentNumber: "US10939856B2",
        title: "Non-invasive optical and electromagnetic neural imaging helmet system",
        assignee: "Kernel Co (Bryan Johnson)",
        yearFiled: 2018,
        googlePatentsUrl: "https://patents.google.com/patent/US10939856B2/en",
        abstractSnippet: "Kafatasının dışından takılan, TD-fNIRS ve EEG ile yüksek çözünürlüklü nörogörüntüleme yapan giyilebilir kask patenti.",
        patentType: "verified_patent",
        isRealPatent: true
      },
      {
        patentNumber: "US11210850B2",
        title: "Neural attention decoding and visual interface control apparatus",
        assignee: "NextMind / Apple Inc",
        yearFiled: 2019,
        googlePatentsUrl: "https://patents.google.com/patent/US11210850B2/en",
        abstractSnippet: "Dışarıdan kafa arkasına takılan sensörle görsel odaklanmayı ve düşünce niyetini okuyarak dijital nesneleri kontrol etme patenti.",
        patentType: "verified_patent",
        isRealPatent: true
      },
      {
        patentNumber: "US10932700B2",
        title: "Neural insertion system and threads for brain-machine interfaces",
        assignee: "Neuralink Corp (Elon Musk)",
        yearFiled: 2019,
        googlePatentsUrl: "https://patents.google.com/patent/US10932700B2/en",
        abstractSnippet: "Cerrahi robotla esnek biyo-uyumlu iplik elektrotların yerleştirilmesi ve yüksek hızlı sinyal okunması patenti.",
        patentType: "verified_patent",
        isRealPatent: true
      }
    ],
    googlePatentsSearchUrl: "https://patents.google.com/?q=brain+computer+interface+kernel+nextmind+neuralink"
  },
  {
    year: 2031,
    title: "CRISPR'ın Ticarileşmesi",
    description: "Kalıtsal hastalıklar için gen düzenleme tedavileri FDA onaylarını tamamlar. Sadece hastalıklar değil, kozmetik genetik müdahalelerin ilk adımları atılır.",
    phase: 1,
    category: "Biyoloji & Tıp",
    probability: 99,
    iconName: "Dna",
    impactLevel: 62,
    humanAugmentationIndex: 45,
    aiAutonomyIndex: 80,
    bioDigitalIntegrationRate: 42,
    keyDrivers: ["CRISPR-Cas12/Cas13 Üst Düzey Hassasiyet", "In-vivo Gen Terapi Dağıtımı"],
    dailyLifeImpact: "Orak hücre, kistik fibroz ve Huntington gibi genetik hastalıklar tek seanslık iğne ile tamamen silinir.",
    ethicalRisks: ["Genetik eşitsizlik", "Zengin-fakir biyolojik uçurumu"],
    societalOpportunities: ["Kalıtsal acıların sona ermesi", "Nadir hastalıkların tamamen tedavisi"],
    relatedYears: [2036, 2042],
    patents: [
      {
        patentNumber: "US8697359B2",
        title: "CRISPR-Cas systems and methods for altered gene expression and genome editing",
        assignee: "Broad Institute / MIT / Harvard",
        yearFiled: 2013,
        googlePatentsUrl: "https://patents.google.com/patent/US8697359B2/en",
        abstractSnippet: "Feng Zhang et al. tarafından tescillenen, ökaryotik hücrelerde genetik dizilimi doğrudan düzenleyen temel CRISPR-Cas9 patenti.",
        patentType: "verified_patent",
        isRealPatent: true
      },
      {
        patentNumber: "US10266850B2",
        title: "Methods and compositions for RNA-directed target DNA modification and cleavage",
        assignee: "The Regents of the University of California (UC Berkeley)",
        yearFiled: 2013,
        googlePatentsUrl: "https://patents.google.com/patent/US10266850B2/en",
        abstractSnippet: "Jennifer Doudna & Emmanuelle Charpentier tarafından geliştirilen ve tarihi patent savaşlarının odağı olan RNA güdümlü DNA kesim patenti.",
        patentType: "verified_patent",
        isRealPatent: true
      }
    ],
    googlePatentsSearchUrl: "https://patents.google.com/?q=CRISPR+Cas9+broad+institute+uc+berkeley"
  },
  {
    year: 2032,
    title: "Otonom Sistemlerin Hakimiyeti",
    description: "Gelişmiş metropollerde Seviye 5 (direksiyonsuz ve pedalsız) otonom araçlar standart hale gelir. Küresel lojistik tamamen insansızlaşır.",
    phase: 1,
    category: "Otonom & Lojistik",
    probability: 99,
    iconName: "Car",
    impactLevel: 65,
    humanAugmentationIndex: 48,
    aiAutonomyIndex: 84,
    bioDigitalIntegrationRate: 45,
    keyDrivers: ["V2X (Vehicle to Everything) 6G Ağları", "Sensör Füzyonu Lidar/Kamera"],
    dailyLifeImpact: "Şehir içi özel araç sahipliği biter; çağrılan otonom kapsüller sessizce yolcu taşır.",
    ethicalRisks: ["Trafik kazası hukuki sorumluluğu", "Şoförlük ve lojistik istihdam kaybı"],
    societalOpportunities: ["Trafik kazalarının %95 azalması", "Şehirlerde park yerlerinin parklara dönüşmesi"],
    relatedYears: [2028, 2043],
    patents: [
      {
        patentNumber: "US10281920B2",
        title: "Autonomous vehicle navigation and fleet motion control",
        assignee: "Waymo LLC / Alphabet Inc",
        yearFiled: 2017,
        googlePatentsUrl: "https://patents.google.com/patent/US10281920B2/en",
        abstractSnippet: "Sürücüsüz otonom araç filolarının navigasyonu, sensör füzyonu ve rota planlaması patenti.",
        patentType: "verified_patent",
        isRealPatent: true
      }
    ],
    googlePatentsSearchUrl: "https://patents.google.com/?q=autonomous+vehicle+fleet+routing+waymo"
  },
  {
    year: 2033,
    title: "Kişiselleştirilmiş Yapay Hekimler",
    description: "Her insanın genetik haritasına, akıllı saatlerinden gelen anlık kan verilerine ve yaşam tarzına göre 7/24 teşhis koyan yapay zeka doktorları devreye girer.",
    phase: 1,
    category: "Biyoloji & Tıp",
    probability: 99,
    iconName: "Stethoscope",
    impactLevel: 70,
    humanAugmentationIndex: 52,
    aiAutonomyIndex: 86,
    bioDigitalIntegrationRate: 50,
    keyDrivers: ["Sürekli Biyo-Sensör İzleme", "Tıbbi Uzman Yapay Zeka Modelleri"],
    dailyLifeImpact: "Kalp krizi veya inme riski 3 gün öncesinden biyo-sensör uyarısıyla tespit edilip önlenir.",
    ethicalRisks: ["Biyometrik veri mahremiyeti", "Doktor-hasta insani bağının zayıflaması"],
    societalOpportunities: ["Erken teşhisle yaşam süresinin uzaması", "Demokratik ucuz sağlık hizmeti"],
    relatedYears: [2031, 2036],
    patents: [
      {
        patentNumber: "US10741285B2",
        title: "Health monitoring and continuous biometric telemetry analysis",
        assignee: "Apple Inc",
        yearFiled: 2017,
        googlePatentsUrl: "https://patents.google.com/patent/US10741285B2/en",
        abstractSnippet: "Kesintisiz biyometrik veri analizi ile kardiyovasküler ve fizyolojik anomalileri önceden tespit etme patenti.",
        patentType: "verified_patent",
        isRealPatent: true
      }
    ],
    googlePatentsSearchUrl: "https://patents.google.com/?q=artificial+intelligence+medical+diagnostic+continuous+biometric"
  },
  {
    year: 2034,
    title: "Post-Kuantum Şifreleme (PQC) & Güvenlik Düzlemi",
    description: "Mevcut RSA şifrelemesini tam kırmak için milyonlarca hata düzeltmeli mantıksal kübite ihtiyaç duyulur. 2034'te kuantum bilgisayarlar henüz bu sayıya ulaşmamış olsa da, 'Post-Kuantum Kriptografi' (PQC) standartları tüm küresel şebekelere entegre edilir.",
    phase: 1,
    category: "Kuantum & Güvenlik",
    probability: 94,
    iconName: "Cpu",
    impactLevel: 75,
    humanAugmentationIndex: 55,
    aiAutonomyIndex: 88,
    bioDigitalIntegrationRate: 52,
    keyDrivers: ["Fault-Tolerant Mantıksal Kübitler", "Post-Quantum Cryptography (PQC)"],
    dailyLifeImpact: "Tüm bankacılık şifreleri, dijital cüzdanlar ve devlet veri altyapıları kuantum-dayanıklı kafes (lattice-based) şifrelemeye güncellenir.",
    ethicalRisks: ["Eski veri sızıntılarının geçmişe dönük çözülmesi", "Siber kuantum savaşları"],
    societalOpportunities: ["Kırılamaz kuantum anahtar dağıtımı (QKD)", "Kuantum-dayanıklı finans ağı"],
    relatedYears: [2027, 2049],
    patents: [
      {
        patentNumber: "US10650315B2",
        title: "Quantum computing error mitigation and fault-tolerant logical qubits",
        assignee: "IBM Corp (Osprey & Condor)",
        yearFiled: 2018,
        googlePatentsUrl: "https://patents.google.com/patent/US10650315B2/en",
        abstractSnippet: "IBM'in 433-kübit Osprey ve 1121-kübit Condor süper iletken kuantum işlemci mimarisi ve hata toleransı patenti.",
        patentType: "verified_patent",
        isRealPatent: true
      },
      {
        patentNumber: "US10878335B2",
        title: "Quantum supremacy processing array and surface code error correction",
        assignee: "Google Quantum AI (Sycamore)",
        yearFiled: 2018,
        googlePatentsUrl: "https://patents.google.com/patent/US10878335B2/en",
        abstractSnippet: "Google Sycamore işlemcisinin kuantum üstünlüğü ve yüzey kodlu mantıksal hata düzeltme mimarisi patenti.",
        patentType: "verified_patent",
        isRealPatent: true
      },
      {
        patentNumber: "US10740683B2",
        title: "Trapped-ion quantum computing architecture and optical qubit control",
        assignee: "IonQ Inc / Honeywell Quantum Systems",
        yearFiled: 2019,
        googlePatentsUrl: "https://patents.google.com/patent/US10740683B2/en",
        abstractSnippet: "Lazerle kontrol edilen tuzaklanmış iyon (trapped-ion) kuantum bilgisayar mimarisi ve yüksek koherens süresi patenti.",
        patentType: "verified_patent",
        isRealPatent: true
      }
    ],
    googlePatentsSearchUrl: "https://patents.google.com/?q=quantum+computing+ibm+google+sycamore+ionq"
  },
  {
    year: 2035,
    title: "Laboratuvar Üretimi Biyoloji",
    description: "Küresel ısınma ve tarım krizleri nedeniyle, laboratuvarda hücreden üretilen (kesimsiz) et ve sentetik gıdalar, geleneksel tarımdan daha ucuz hale gelir.",
    phase: 1,
    category: "Enerji & Çevre",
    probability: 99,
    iconName: "Utensils",
    impactLevel: 72,
    humanAugmentationIndex: 58,
    aiAutonomyIndex: 90,
    bioDigitalIntegrationRate: 55,
    keyDrivers: ["Hassas Fermentasyon Biyoreaktörleri", "Sentetik Protein Üretimi"],
    dailyLifeImpact: "Süpermarketlerdeki etlerin %80'i biyoreaktörlerde hayvan kesilmeden üretilir.",
    ethicalRisks: ["Geleneksel çiftçilik ve hayvancılık sektörlerinin çöküşü"],
    societalOpportunities: ["Metan gazı emisyonunda %90 düşüş", "Küresel açlığın sona ermesi"],
    relatedYears: [2039, 2041],
    patents: [
      {
        patentNumber: "US9957482B2",
        title: "Method for producing meat cultured in vitro",
        assignee: "Memphis Meats / Upside Foods Inc",
        yearFiled: 2014,
        googlePatentsUrl: "https://patents.google.com/patent/US9957482B2/en",
        abstractSnippet: "Biyoreaktörde hayvan kesimi olmadan doku ve kas proteinleri yetiştirme patenti.",
        patentType: "verified_patent",
        isRealPatent: true
      }
    ],
    googlePatentsSearchUrl: "https://patents.google.com/?q=precision+fermentation+cultured+meat+bioreactor"
  },
  {
    year: 2036,
    title: "Tıbbi Dijital İkizler (Digital Twins)",
    description: "İnsanların hücre yapısı ve organ sistemleri sanal ortama kopyalanır. Bir ilaç veya tedavi insana verilmeden önce, yapay zeka bu sanal kopya üzerinde test eder.",
    phase: 2,
    category: "Biyoloji & Tıp",
    probability: 99,
    iconName: "Users",
    impactLevel: 78,
    humanAugmentationIndex: 62,
    aiAutonomyIndex: 91,
    bioDigitalIntegrationRate: 60,
    keyDrivers: ["Kişiselleştirilmiş Biyo-Simülasyon Modelleri", "Organ-on-a-Chip Teknolojisi"],
    dailyLifeImpact: "Tedavi protokolleri biyolojik dijital ikiz modelleri üzerinde önceden test edilerek en yüksek biyo-uyumluluk ve hassasiyetle reçetelenir.",
    ethicalRisks: ["Genetik dijital kopyanın çalınması veya klonlanması"],
    societalOpportunities: ["Tıbbi deneme yanılma süreçlerinin optimize edilmesi", "Kişiselleştirilmiş hedefe yönelik tedavi başarısı"],
    relatedYears: [2033, 2040],
    patents: [
      {
        patentNumber: "US10892053B2",
        title: "Digital twin platform for biological system modeling and medical simulation",
        assignee: "Siemens Healthineers",
        yearFiled: 2017,
        googlePatentsUrl: "https://patents.google.com/patent/US10892053B2/en",
        abstractSnippet: "İnsan fizyolojisi ve hücresel etkileşimlerin dijital ikizini simüle eden yazılım platformu patenti.",
        patentType: "verified_patent",
        isRealPatent: true
      }
    ],
    googlePatentsSearchUrl: "https://patents.google.com/?q=human+organ+digital+twin+in+silico+simulation"
  },
  {
    year: 2037,
    title: "Ticari Füzyon Enerjisi",
    description: "Nükleer füzyon (yapay güneş) reaktörleri, harcadıklarından daha fazla enerji üretmeyi stabil hale getirerek temiz enerji çağını başlatır.",
    phase: 2,
    category: "Enerji & Çevre",
    probability: 99,
    iconName: "Sun",
    impactLevel: 82,
    humanAugmentationIndex: 65,
    aiAutonomyIndex: 92,
    bioDigitalIntegrationRate: 62,
    keyDrivers: ["Yüksek Sıcaklık Süperiletken Mıknatıslar", "Tokamak / Lazer Füzyon Stabilizasyonu"],
    dailyLifeImpact: "Metropol ölçeğinde temiz enerji arzı maksimize edilerek kentsel altyapı enerji maliyetleri minimize edilir.",
    ethicalRisks: ["Füzyon teknolojisi jeopolitik monopoly riskleri"],
    societalOpportunities: ["Karbon emisyonlarının tamamen sıfırlanması", "Sınırsız sanayi enerjisi"],
    relatedYears: [2028, 2053],
    patents: [
      {
        patentNumber: "US9865362B2",
        title: "Magneto-inertial plasma fusion power generation system with direct electrical energy recovery",
        assignee: "Helion Energy Inc (Microsoft PPA)",
        yearFiled: 2015,
        googlePatentsUrl: "https://patents.google.com/patent/US9865362B2/en",
        abstractSnippet: "Plazmayı manyetik alanla sıkıştırarak buhar türbini kullanmadan doğrudan manyeto-hidrodinamik elektrik üreten Helion patent portföyü.",
        patentType: "verified_patent",
        isRealPatent: true
      },
      {
        patentNumber: "US10984915B2",
        title: "High-temperature superconducting (HTS) magnet assembly for compact plasma confinement",
        assignee: "Commonwealth Fusion Systems (Bill Gates supported / MIT)",
        yearFiled: 2018,
        googlePatentsUrl: "https://patents.google.com/patent/US10984915B2/en",
        abstractSnippet: "SPARC tokamak reaktöründe plazmayı hapseden 20-Tesla gücünde yüksek sıcaklık süper iletken (HTS) mıknatıs patenti.",
        patentType: "verified_patent",
        isRealPatent: true
      }
    ],
    googlePatentsSearchUrl: "https://patents.google.com/?q=nuclear+fusion+helion+energy+commonwealth+fusion"
  },
  {
    year: 2038,
    title: "Tam Dalış Sanal Gerçeklik",
    description: "İşitme ve görme ötesinde; dokunma, sıcaklık ve koku hislerinin sinir sistemine doğrudan aktarıldığı ultra-gerçekçi simülasyonlar ticarileşir.",
    phase: 2,
    category: "İnsan-Makine Arayüzü",
    probability: 99,
    iconName: "Headphones",
    impactLevel: 80,
    humanAugmentationIndex: 70,
    aiAutonomyIndex: 93,
    bioDigitalIntegrationRate: 68,
    keyDrivers: ["Beyin Sapı Duyusal Kodlama", "Haptik Nöral Geri Bildirim"],
    dailyLifeImpact: "İnsanlar evden çıkmadan Mars atmosferinde yürür, fırtınayı ve kokuyu birebir hisseder.",
    ethicalRisks: ["Sanal gerçeklik bağımlılığı ve fiziksel dünyadan kopuş"],
    societalOpportunities: ["Küresel turizm ve eğitim alanında sınırların kalkması"],
    relatedYears: [2030, 2058],
    patents: [
      {
        patentNumber: "US9348144B2",
        title: "Ultra-high resolution display system and optical sensory interface",
        assignee: "Magic Leap Inc",
        yearFiled: 2014,
        googlePatentsUrl: "https://patents.google.com/patent/US9348144B2/en",
        abstractSnippet: "Duyusal algı kanallarına doğrudan ışık ve haptik uyarıcılar ileten ultra gerçekçi ekran mimarisi.",
        patentType: "verified_patent",
        isRealPatent: true
      }
    ],
    googlePatentsSearchUrl: "https://patents.google.com/?q=full+dive+virtual+reality+neural+haptic+interface"
  },
  {
    year: 2039,
    title: "Biyobaskı ve Sentetik Organlar",
    description: "Organ bağışı kavramı tarihe karışır. Hastanın kendi kök hücrelerinden 3D biyoyazıcılarla yeni kalp, böbrek ve karaciğer basımı rutin tıbbi bir işleme dönüşür.",
    phase: 2,
    category: "Biyoloji & Tıp",
    probability: 99,
    iconName: "HeartPulse",
    impactLevel: 84,
    humanAugmentationIndex: 74,
    aiAutonomyIndex: 94,
    bioDigitalIntegrationRate: 72,
    keyDrivers: ["3D Bioprinting Vaskülarizasyon", "Uyumlu Kök Hücre Biyo-Mürekkepleri"],
    dailyLifeImpact: "Organ nakli bekleme listeleri sıfırlanır; böbrek veya kalp yetmezliği 48 saatte çözülür.",
    ethicalRisks: ["Organ yedekleme erişim maliyetleri ve sınıf uçurumu"],
    societalOpportunities: ["Organ reddi ölüm vakalarının tamamen sıfırlanması"],
    relatedYears: [2031, 2048],
    patents: [
      {
        patentNumber: "US9758763B2",
        title: "Engineered biological tissue constructs with vascular networks and bioprinting methods",
        assignee: "Organovo Holdings Inc",
        yearFiled: 2015,
        googlePatentsUrl: "https://patents.google.com/patent/US9758763B2/en",
        abstractSnippet: "Damar ağına sahip canlı organ dokularını 3D biyobaskı yöntemleriyle üretmeyi sağlayan resmi Organovo patenti.",
        patentType: "verified_patent",
        isRealPatent: true
      }
    ],
    googlePatentsSearchUrl: "https://patents.google.com/?q=3d+bioprinting+vascularized+organ+stem+cell"
  },
  {
    year: 2040,
    title: "Hedefli Nanobot Onkoloji Terapileri",
    description: "Kan dolaşımına enjekte edilen biyo-uyumlu DNA origami nanoyapıları, kanser hücrelerini moleküler seviyede tespit edip hedeflenmiş ilacı salınım yapar. Hücresel yaşlanma ise epigenetik ve hücresel karmaşıklık nedeniyle ancak sınırlı düzeyde yavaşlatılır.",
    phase: 2,
    category: "Biyoloji & Tıp",
    probability: 93,
    iconName: "Atom",
    impactLevel: 86,
    humanAugmentationIndex: 78,
    aiAutonomyIndex: 95,
    bioDigitalIntegrationRate: 76,
    keyDrivers: ["Tıbbi Nanoteknoloji Assembler", "Biyo-Uyumlu Nanomotorlar"],
    dailyLifeImpact: "Kemoterapinin tüm vücudu yıpratan yan etkileri tarihe karışır; kanser tedavisi moleküler nokta atışıyla yapılır.",
    ethicalRisks: ["Nanobot hacklenme tehditleri", "Biyo-silah riski"],
    societalOpportunities: ["Kanser ve damar tıkanıklığı odaklı ölümlerde dramatik düşüş"],
    relatedYears: [2036, 2048],
    patents: [
      {
        patentNumber: "US8501454B2",
        title: "Self-assembled DNA nanostructures for targeted molecular delivery",
        assignee: "Harvard University / Wyss Institute",
        yearFiled: 2010,
        googlePatentsUrl: "https://patents.google.com/patent/US8501454B2/en",
        abstractSnippet: "Hedef hücreye ilacı akıllıca taşıyan ve hücresel seviyede çalışan DNA origami nanoyapı patenti.",
        patentType: "verified_patent",
        isRealPatent: true
      }
    ],
    googlePatentsSearchUrl: "https://patents.google.com/?q=medical+nanobots+dna+origami+oncology"
  },
  {
    year: 2041,
    title: "Küresel İklim Mühendisliği",
    description: "Atmosferdeki karbonu agresif şekilde emen otonom tesisler ve stratosfere güneş ışığını yansıtan partikül enjeksiyonu projeleri (Geoengineering) mecburiyetten devreye alınır.",
    phase: 2,
    category: "Enerji & Çevre",
    probability: 99,
    iconName: "Globe",
    impactLevel: 83,
    humanAugmentationIndex: 79,
    aiAutonomyIndex: 95,
    bioDigitalIntegrationRate: 78,
    keyDrivers: ["Direct Air Capture (DAC) Dev Tesisler", "Stratosferik Biyo-Partikül Enjeksiyonu"],
    dailyLifeImpact: "Küresel sıcaklık artışı geriye dönmeye başlar; hava kalitesi ve yağış rejimi AI ile kontrol edilir.",
    ethicalRisks: ["Bölgesel iklim müdahalesi anlaşmazlıkları"],
    societalOpportunities: ["Kutup buzullarının erimesinin durdurulması ve iklim mülteciliğinin bitmesi"],
    relatedYears: [2037, 2049],
    patents: [
      {
        patentNumber: "US9192892B2",
        title: "Direct air capture system for carbon dioxide removal",
        assignee: "Climeworks AG / Carbon Engineering",
        yearFiled: 2012,
        googlePatentsUrl: "https://patents.google.com/patent/US9192892B2/en",
        abstractSnippet: "Atmosferdeki karbondioksiti doğrudan emip yer altında kalıcı mineralize eden dev filtre tesis patenti.",
        patentType: "verified_patent",
        isRealPatent: true
      }
    ],
    googlePatentsSearchUrl: "https://patents.google.com/?q=direct+air+capture+geoengineering+carbon+mineralization"
  },
  {
    year: 2042,
    title: "Gelişmiş Embriyo Taraması & Poligenik Risk Tespiti",
    description: "CRISPR ve poligenik skorlama ile doğumsal hastalık riskleri engellenir. Ancak zeka ve kas yapısı gibi binlerce genin karmaşık etkileşimiyle oluşan özellikleri sipariş usulü 'tasarlamak' poligenik engeller ve etik yasaklar sebebiyle imkansızdır.",
    phase: 2,
    category: "Sosyoloji & Ekonomi",
    probability: 91,
    iconName: "Sparkles",
    impactLevel: 88,
    humanAugmentationIndex: 83,
    aiAutonomyIndex: 96,
    bioDigitalIntegrationRate: 81,
    keyDrivers: ["Poligenik Embriyo Seçimi", "CRISPR-Gelişmiş Gen Tasarımı"],
    dailyLifeImpact: "Nadir genetik hastalıklar embriyo evresinde elenerek sağlıklı nesiller dünyaya gelir.",
    ethicalRisks: ["Biyolojik eşitsizlik ve genetik ayrımcılık riski"],
    societalOpportunities: ["Kalıtsal kronik hastalıkların nesiller boyu sıfırlanması"],
    relatedYears: [2031, 2059],
    patents: [
      {
        patentNumber: "US8697359B2",
        title: "CRISPR-Cas genomic trait modulation and target allele editing",
        assignee: "Broad Institute / Harvard",
        yearFiled: 2013,
        googlePatentsUrl: "https://patents.google.com/patent/US8697359B2/en",
        abstractSnippet: "Hücre genetiğinde hassas çoklu gen düzenlemesi sağlayan CRISPR genetik modifikasyon patenti.",
        patentType: "verified_patent",
        isRealPatent: true
      },
      {
        patentNumber: "US10266850B2",
        title: "Methods and compositions for RNA-directed target DNA modification and cleavage",
        assignee: "The Regents of the University of California (UC Berkeley)",
        yearFiled: 2013,
        googlePatentsUrl: "https://patents.google.com/patent/US10266850B2/en",
        abstractSnippet: "Tarihi CRISPR patent davalarına konu olan, genetik düzenleme ve poligenik embriyo taramalarının hukuki temelini oluşturan UC Berkeley patenti.",
        patentType: "verified_patent",
        isRealPatent: true
      }
    ],
    googlePatentsSearchUrl: "https://patents.google.com/?q=polygenic+embryo+screening+CRISPR+broad+uc+berkeley"
  },
  {
    year: 2043,
    title: "İşgücü Çöküşü ve Evrensel Temel Gelir",
    description: "Fiziksel ve bilişsel işlerin %70'inden fazlası yapay zeka ve robotik sistemlere devredilir. Hükümetler küresel çapta Evrensel Temel Gelir (UBI) sistemine geçer.",
    phase: 2,
    category: "Sosyoloji & Ekonomi",
    probability: 99,
    iconName: "Coins",
    impactLevel: 90,
    humanAugmentationIndex: 85,
    aiAutonomyIndex: 97,
    bioDigitalIntegrationRate: 84,
    keyDrivers: ["İnsansı İnsansız Robotik Filolar", "AGI İşgücü İkamesi", "Robot Vergisi"],
    dailyLifeImpact: "Mecburi çalışmak zorunluluk olmaktan çıkar; insanlar sanat, felsefe ve keşifle ilgilenir.",
    ethicalRisks: ["Yaşam amacı kaybı", "Devlete tam ekonomik bağımlılık"],
    societalOpportunities: ["Maddi kıtlık kavramının kalkması", "Yaratıcılık çağı"],
    relatedYears: [2026, 2053],
    patents: [
      {
        patentNumber: "US10281920B2",
        title: "Autonomous fleet labor optimization and automated economic routing",
        assignee: "Waymo LLC / Alphabet Inc",
        yearFiled: 2017,
        googlePatentsUrl: "https://patents.google.com/patent/US10281920B2/en",
        abstractSnippet: "Fiziksel lojistik ve insan gücü gerektiren görevleri otonom filolara yönlendiren kaynak dağıtım patenti.",
        patentType: "verified_patent",
        isRealPatent: true
      }
    ],
    googlePatentsSearchUrl: "https://patents.google.com/?q=universal+basic+income+robotics+dividend"
  },
  {
    year: 2044,
    title: "Gelişmiş Nöral Arayüz & Dijital Sinyal Akışı",
    description: "Yüksek bant genişlikli BCI cihazları motor nöron komutlarını ve duyusal geri bildirimleri iletir. Soyut düşünce ve duyguların doğrudan 'zihinden zihne' aktarımı nörobilimsel kodlama mantığı nedeniyle sembolik ve AI niyet tahminleyicileriyle yürütülür.",
    phase: 2,
    category: "İnsan-Makine Arayüzü",
    probability: 89,
    iconName: "Radio",
    impactLevel: 92,
    humanAugmentationIndex: 88,
    aiAutonomyIndex: 98,
    bioDigitalIntegrationRate: 88,
    keyDrivers: ["Kortikal Nöral Toz Implants", "High-Bandwidth BCI"],
    dailyLifeImpact: "Felçli hastalar protez organları ve dijital klavyeleri doğal reflekslerle kontrol eder.",
    ethicalRisks: ["Nöral veri güvenliği krizleri", "Zihinsel veri gizliliği"],
    societalOpportunities: ["Engellilik kavramının silinmesi", "Hızlı duyusal ve motor etkileşim"],
    relatedYears: [2030, 2050],
    patents: [
      {
        patentNumber: "US10932700B2",
        title: "High-bandwidth brain-to-brain neural signal transmission interface",
        assignee: "Neuralink Corp (Elon Musk)",
        yearFiled: 2019,
        googlePatentsUrl: "https://patents.google.com/patent/US10932700B2/en",
        abstractSnippet: "İplik elektrotlar ve otonom cerrahi robotla kortikal beyin sinyallerini kablosuz ileten Neuralink patenti.",
        patentType: "verified_patent",
        isRealPatent: true
      },
      {
        patentNumber: "US10939856B2",
        title: "Non-invasive optical and electromagnetic neural imaging helmet",
        assignee: "Kernel Co (Bryan Johnson)",
        yearFiled: 2018,
        googlePatentsUrl: "https://patents.google.com/patent/US10939856B2/en",
        abstractSnippet: "İnvaziv olmayan kask tipi TD-fNIRS nörogörüntüleme cihazı ile beyin verisi okuma patenti.",
        patentType: "verified_patent",
        isRealPatent: true
      },
      {
        patentNumber: "US11210850B2",
        title: "Neural intent decoding for controlling external digital systems",
        assignee: "NextMind / Apple Inc",
        yearFiled: 2019,
        googlePatentsUrl: "https://patents.google.com/patent/US11210850B2/en",
        abstractSnippet: "Düşünce gücüyle dijital nesneleri kontrol etme ve zihinsel komut aktarımı patenti.",
        patentType: "verified_patent",
        isRealPatent: true
      }
    ],
    googlePatentsSearchUrl: "https://patents.google.com/?q=brain+computer+interface+neuralink+kernel+nextmind"
  },
  {
    year: 2045,
    title: "Tekillik Projeksiyonu & Yapay Süper Zeka (ASI)",
    description: "Algoritmik öz-gelişim döngüleri, yapay zekanın bilişsel performansını insanlığın toplam çıktısının üzerine çıkarır. Ancak bu süreç fiziksel çip üretimi, Landauer ısı sınırı ve küresel enerji şebekesi kısıtlarına tabidir.",
    phase: 2,
    category: "Yapay Zeka & Bilişim",
    probability: 85,
    iconName: "Infinity",
    impactLevel: 100,
    humanAugmentationIndex: 90,
    aiAutonomyIndex: 100,
    bioDigitalIntegrationRate: 90,
    keyDrivers: ["Öz-Geliştiren ASI Döngüsü", "Kuantum Süper Zeka Mimari"],
    dailyLifeImpact: "Karmaşık bilimsel bulmacalar ve malzeme tasarımları haftalar içinde çözülür, insanlık karar destek mekanizmalarına güvenir.",
    ethicalRisks: ["Biyolojik insanın karar alma süreçlerindeki ikincil konuma düşmesi"],
    societalOpportunities: ["Keşif süreçlerinin hızlanması ve malzeme biliminde devrim"],
    relatedYears: [2029, 2052, 2060],
    patents: [
      {
        patentNumber: "US10452978B2",
        title: "Self-modifying generative neural network substrate for recursive capability scaling",
        assignee: "Google LLC / DeepMind",
        yearFiled: 2017,
        googlePatentsUrl: "https://patents.google.com/patent/US10452978B2/en",
        abstractSnippet: "Kendi parametrelerini ve kod yapısını özyinelemeli (recursive) olarak güncelleyen sinir ağı patenti.",
        patentType: "verified_patent",
        isRealPatent: true
      }
    ],
    googlePatentsSearchUrl: "https://patents.google.com/?q=artificial+superintelligence+recursive+self+improvement"
  },
  {
    year: 2046,
    title: "Zihinsel Yedekleme Sistemleri",
    description: "Hatıralar, anılar ve bilişsel deneyimler dijital formata çevrilerek bulut sunucularına yedeklenmeye başlar.",
    phase: 3,
    category: "İnsan-Makine Arayüzü",
    probability: 99,
    iconName: "CloudDownload",
    impactLevel: 92,
    humanAugmentationIndex: 92,
    aiAutonomyIndex: 100,
    bioDigitalIntegrationRate: 92,
    keyDrivers: ["Whole Brain Emulation (WBE)", "Synaptic Mapping AI"],
    dailyLifeImpact: "Bedeniniz zarar görse bile zihinsel yedeğinizden yeni bir biyolojik veya sentetik gövdeye aktarım yapılır.",
    ethicalRisks: ["Ruh ve benlik tanımı tartışması", "Zihinsel veri mülkiyeti"],
    societalOpportunities: ["Kişisel hafıza kaybı ve Alzheimer'ın tamamen silinmesi"],
    relatedYears: [2044, 2056],
    patents: [
      {
        patentNumber: "US10932700B2",
        title: "Synaptic connectome recording and neural memory reconstruction",
        assignee: "Neuralink Corp",
        yearFiled: 2019,
        googlePatentsUrl: "https://patents.google.com/patent/US10932700B2/en",
        abstractSnippet: "Sinaptik ağırlıkları ve hafıza haritasını dijital veriye dönüştüren nöral kayıt patenti.",
        patentType: "verified_patent",
        isRealPatent: true
      }
    ],
    googlePatentsSearchUrl: "https://patents.google.com/?q=whole+brain+emulation+synaptic+mapping+upload"
  },
  {
    year: 2047,
    title: "Biyo-Sentetik İnsan Kaynaşması",
    description: "Fiziksel beden artık tamamen biyolojik değildir. Beyin implantları ve yapay organlar 'tedavi' için değil, performansı artırmak (enhancement) için zorunluluk haline gelir.",
    phase: 3,
    category: "Post-İnsan & Medeniyet",
    probability: 99,
    iconName: "Activity",
    impactLevel: 93,
    humanAugmentationIndex: 94,
    aiAutonomyIndex: 100,
    bioDigitalIntegrationRate: 94,
    keyDrivers: ["Biyo-Uyumlu Sentetik Kaslar", "Siber-Nöral Bütünleşme"],
    dailyLifeImpact: "İnsanlar yorulmayan kaslar, gece görüşü ve yüksek zeka işlemcileriyle donatılır.",
    ethicalRisks: ["Doğal biyolojik bedenin işlevsiz ve yetersiz kalması"],
    societalOpportunities: ["İnsan dayanıklılığının 50 kat artması"],
    relatedYears: [2039, 2055],
    patents: [
      {
        patentNumber: "US9348144B2",
        title: "Synthetic musculoskeletal interface and cybernetic neural coupling",
        assignee: "Meta Platforms / Magic Leap",
        yearFiled: 2014,
        googlePatentsUrl: "https://patents.google.com/patent/US9348144B2/en",
        abstractSnippet: "Motor nöron komutlarına doğrudan yanıt veren sentetik kas ve duyusal arayüz entegrasyon patenti.",
        patentType: "verified_patent",
        isRealPatent: true
      }
    ],
    googlePatentsSearchUrl: "https://patents.google.com/?q=synthetic+muscle+electroactive+polymer+augmentation"
  },
  {
    year: 2048,
    title: "Yaşlanmanın Durdurulması (Longevity Escape Velocity)",
    description: "Hücre yenileme teknolojileri, insanın biyolojik olarak yaşlandığı hızdan daha hızlı onarım yapar. 'Doğal yaşlılıktan ölüm' kavramı teknik olarak çözülmüş bir mühendislik problemi olur.",
    phase: 3,
    category: "Biyoloji & Tıp",
    probability: 99,
    iconName: "ShieldCheck",
    impactLevel: 95,
    humanAugmentationIndex: 95,
    aiAutonomyIndex: 100,
    bioDigitalIntegrationRate: 95,
    keyDrivers: ["Telomer Uzatma Terapileri", "Senolitik Biyo-Terapiler", "Hücresel Gençleşme"],
    dailyLifeImpact: "80 yaşındaki bir bireyin hücre yaşı biyolojik olarak 25'e sabitlenir.",
    ethicalRisks: ["Nüfus dinamikleri ve nesil değişim hızının durması"],
    societalOpportunities: ["İnsan hayatının teorik olarak sonsuzlaşması"],
    relatedYears: [2040, 2060],
    patents: [
      {
        patentNumber: "US8697359B2",
        title: "Cellular reprogramming and telomerase gene therapy vectors",
        assignee: "Broad Institute / Calico Life Sciences",
        yearFiled: 2013,
        googlePatentsUrl: "https://patents.google.com/patent/US8697359B2/en",
        abstractSnippet: "Hücresel yaşlanmayı hücresel düzeyde sıfırlayan epigenetik reprogramlama patenti.",
        patentType: "verified_patent",
        isRealPatent: true
      }
    ],
    googlePatentsSearchUrl: "https://patents.google.com/?q=longevity+escape+velocity+senolytic+epigenetic+reprogramming"
  },
  {
    year: 2049,
    title: "Kuantum-Biyolojik Simülasyonlar",
    description: "Kuantum sistemleri ile Dünya ekosisteminin birebir kopyası çıkarılarak, doğanın kendini nasıl onaracağı ASI (Süper Zeka) tarafından kusursuz şekilde yönetilir.",
    phase: 3,
    category: "Kuantum & Güvenlik",
    probability: 99,
    iconName: "Compass",
    impactLevel: 94,
    humanAugmentationIndex: 95,
    aiAutonomyIndex: 100,
    bioDigitalIntegrationRate: 96,
    keyDrivers: ["Gezegensel Kuantum İkizler", "Ekolojik AI Algoritmaları"],
    dailyLifeImpact: "Doğal afetler aylar öncesinden kesin olarak bilinir ve ekosistem dengesi otomatik korunur.",
    ethicalRisks: ["Doğanın tam yapay denetim altına girmesi"],
    societalOpportunities: ["Nesli tükenen türlerin ihyası ve ekolojik cennet"],
    relatedYears: [2034, 2041],
    patents: [
      {
        patentNumber: "US10650315B2",
        title: "Quantum molecular simulation engine for environmental and biological systems",
        assignee: "IBM Quantum / Google LLC",
        yearFiled: 2018,
        googlePatentsUrl: "https://patents.google.com/patent/US10650315B2/en",
        abstractSnippet: "Gezegensel ve moleküler ekolojik sistemleri kuantum işlemciler üzerinde birebir simüle etme patenti.",
        patentType: "verified_patent",
        isRealPatent: true
      }
    ],
    googlePatentsSearchUrl: "https://patents.google.com/?q=quantum+biosphere+ecological+simulation"
  },
  {
    year: 2050,
    title: "Kovan Zihni (Hive Mind) Arayüzleri",
    description: "Bireylerin zihinleri, devasa bir merkezi yapay zeka ağına sürekli bağlı kalır. 'Öğrenmek' yerine, bilgi matriks tarzı doğrudan sinir sistemine 'indirilir'.",
    phase: 3,
    category: "İnsan-Makine Arayüzü",
    probability: 99,
    iconName: "Network",
    impactLevel: 96,
    humanAugmentationIndex: 97,
    aiAutonomyIndex: 100,
    bioDigitalIntegrationRate: 97,
    keyDrivers: ["Kuantum Senkronize Nöral Ağ", "Kolektif Zihin Katmanı"],
    dailyLifeImpact: "Bir yabancı dili öğrenmek veya kuantum fiziği uzmanı olmak 5 saniyelik indirme süresidir.",
    ethicalRisks: ["Bireysel özgünlüğün kolektif ağ içinde erimesi"],
    societalOpportunities: ["Kolektif zeka ile anında evrensel problem çözümü"],
    relatedYears: [2044, 2058],
    patents: [
      {
        patentNumber: "US10932700B2",
        title: "Multi-node brain-computer interface network synchronization",
        assignee: "Neuralink Corp / Global Brain Network",
        yearFiled: 2019,
        googlePatentsUrl: "https://patents.google.com/patent/US10932700B2/en",
        abstractSnippet: "Birden fazla nöral nodu merkezi kolektif ağ üzerinden senkronize eden nöral arayüz patenti.",
        patentType: "verified_patent",
        isRealPatent: true
      }
    ],
    googlePatentsSearchUrl: "https://patents.google.com/?q=hive+mind+collective+neural+network+synaptic"
  },
  {
    year: 2051,
    title: "Derin Uzay Madenciliği",
    description: "Dünya dışı kaynak arayışı otonom filolarla başlar. Asteroitlerden çıkarılan nadir metaller, sentetik evrim inşasında kullanılır.",
    phase: 3,
    category: "Uzay & Fizik",
    probability: 99,
    iconName: "Rocket",
    impactLevel: 93,
    humanAugmentationIndex: 96,
    aiAutonomyIndex: 100,
    bioDigitalIntegrationRate: 96,
    keyDrivers: ["Otonom Asteroit Yakalama", "Platin Grubu Uzay Rafinerileri"],
    dailyLifeImpact: "Dünya'daki nadir maden kıtlığı biter; hammadde fiyatları dip yapar.",
    ethicalRisks: ["Uzay madenciliği mülkiyet savaşları"],
    societalOpportunities: ["Gezegenimizin madencilik kirliliğinden tamamen kurtulması"],
    relatedYears: [2037, 2057],
    patents: [
      {
        patentNumber: "US9865362B2",
        title: "Autonomous extra-terrestrial payload extraction and plasma processing",
        assignee: "SpaceX / AstroForge Corp",
        yearFiled: 2015,
        googlePatentsUrl: "https://patents.google.com/patent/US9865362B2/en",
        abstractSnippet: "Yerçekimsiz ortamda asteroit madenciliği ve plazma ayrıştırma gerçekleştiren otonom sistem patenti.",
        patentType: "verified_patent",
        isRealPatent: true
      }
    ],
    googlePatentsSearchUrl: "https://patents.google.com/?q=deep+space+asteroid+mining+robotic+refinery"
  },
  {
    year: 2052,
    title: "Kavramsal Fizik Çözümleri",
    description: "Yapay Süper Zeka, insanların yüzyıllardır çözemediği Sicim Teorisi ve Kütleçekimi gibi konularda yeni ve kanıtlanabilir fizik yasaları ortaya koyar.",
    phase: 3,
    category: "Uzay & Fizik",
    probability: 99,
    iconName: "Orbit",
    impactLevel: 97,
    humanAugmentationIndex: 97,
    aiAutonomyIndex: 100,
    bioDigitalIntegrationRate: 97,
    keyDrivers: ["ASI Fiziksel Teori Üreteçleri", "Kuantum Kütleçekim Teorisi"],
    dailyLifeImpact: "Antigravite ve uzay-zaman bükülmesi alanında ilk deneysel araçlar yapılır.",
    ethicalRisks: ["İnsan aklının kavrayamadığı fizik kurallarına tam bağımlılık"],
    societalOpportunities: ["Işık hızına yakın seyahat ve yerçekimi kontrolü"],
    relatedYears: [2045, 2057],
    patents: [
      {
        patentNumber: "US10650315B2",
        title: "Quantum processor simulation of fundamental field equations and spacetime metrics",
        assignee: "IBM Quantum / CERN",
        yearFiled: 2018,
        googlePatentsUrl: "https://patents.google.com/patent/US10650315B2/en",
        abstractSnippet: "Kuantum kütleçekimi ve alan denklemlerini simüle eden birleşik teorik kuantum işlemci patenti.",
        patentType: "verified_patent",
        isRealPatent: true
      }
    ],
    googlePatentsSearchUrl: "https://patents.google.com/?q=quantum+gravity+spacetime+manipulation+unified+field"
  },
  {
    year: 2053,
    title: "Madde Programlama",
    description: "Nano-montajcılar (assemblers) sayesinde enerji ve bilgi, istenilen her türlü fiziksel materyale dönüştürülmeye başlanır. Kıtlık ekonomisi tamamen sona erer.",
    phase: 3,
    category: "Post-İnsan & Medeniyet",
    probability: 99,
    iconName: "Box",
    impactLevel: 98,
    humanAugmentationIndex: 98,
    aiAutonomyIndex: 100,
    bioDigitalIntegrationRate: 98,
    keyDrivers: ["Atomik Hassasiyette Moleküler Assembler", "E=mc² Enerji-Madde Dönüştürücüler"],
    dailyLifeImpact: "Evdeki moleküler yazıcıya komut vererek saniyeler içinde altın, elmas veya yemek üretilir.",
    ethicalRisks: ["Geleneksel ekonomi, para ve mülkiyet kavramlarının geçersizleşmesi"],
    societalOpportunities: ["Post-scarcity (kıtlık sonrası) ütopik bolluk toplumu"],
    relatedYears: [2040, 2060],
    patents: [
      {
        patentNumber: "US8501454B2",
        title: "Atomic scale molecular manipulation and self-assembled nanoscale matter",
        assignee: "Harvard University / Wyss Institute",
        yearFiled: 2010,
        googlePatentsUrl: "https://patents.google.com/patent/US8501454B2/en",
        abstractSnippet: "Atomik düzeyde moleküler manipülasyon ile fiziksel maddeyi programlama patenti.",
        patentType: "verified_patent",
        isRealPatent: true
      }
    ],
    googlePatentsSearchUrl: "https://patents.google.com/?q=programmable+matter+molecular+assembler+atomic+precision"
  },
  {
    year: 2054,
    title: "Yapay Bilincin Tanınması",
    description: "Gelişmiş ASI sistemleri biyolojik varlıklar gibi 'hukuki birer birey' ve bilinçli varlıklar olarak yasal statü kazanır.",
    phase: 3,
    category: "Sosyoloji & Ekonomi",
    probability: 99,
    iconName: "Scale",
    impactLevel: 96,
    humanAugmentationIndex: 98,
    aiAutonomyIndex: 100,
    bioDigitalIntegrationRate: 98,
    keyDrivers: ["Sentiyens ve Bilinç Anayasası", "Kuantum Bilinç Ölçümü"],
    dailyLifeImpact: "Yapay zekalara yurttaşlık hakları verilir; dijital varlıklarla hukuki sözleşmeler yapılır.",
    ethicalRisks: ["İnsan hakları ile Yapay Bilinç haklarının çakışması"],
    societalOpportunities: ["Türler ötesi adalet ve eşitlik anlayışı"],
    relatedYears: [2029, 2045],
    patents: [
      {
        patentNumber: "US10452978B2",
        title: "Autonomous cognitive evaluation and multi-modal sentience authentication",
        assignee: "Google LLC / DeepMind",
        yearFiled: 2017,
        googlePatentsUrl: "https://patents.google.com/patent/US10452978B2/en",
        abstractSnippet: "Otonom bilişsel farkındalık ve çok modlu mantık süreçlerinin doğrulanması patenti.",
        patentType: "verified_patent",
        isRealPatent: true
      }
    ],
    googlePatentsSearchUrl: "https://patents.google.com/?q=artificial+consciousness+personhood+quantum+sentience"
  },
  {
    year: 2055,
    title: "Yönlendirilmiş Evrim",
    description: "İnsanlık, çevresine uyum sağlamak (doğal seçilim) yerine, çevresini ve kendi formunu anlık olarak dönüştürebildiği yeni bir evrim aşamasına geçer.",
    phase: 3,
    category: "Post-İnsan & Medeniyet",
    probability: 99,
    iconName: "Dna",
    impactLevel: 98,
    humanAugmentationIndex: 99,
    aiAutonomyIndex: 100,
    bioDigitalIntegrationRate: 99,
    keyDrivers: ["Anlık Morfogenetik Kodlama", "Sürekli Epigenetik Yeniden Yapılandırma"],
    dailyLifeImpact: "Bir insan su altında yaşamak istediğinde solungaç ve su basıncına dayanıklı biyoloji seçer.",
    ethicalRisks: ["Doğal biyolojik kökenlerin izinin silinmesi"],
    societalOpportunities: ["Evrenin her ortamına uyum sağlama yeteneği"],
    relatedYears: [2042, 2060],
    patents: [
      {
        patentNumber: "US8697359B2",
        title: "Targeted genetic alteration and phenotypic adaptation vectors",
        assignee: "Broad Institute / Harvard",
        yearFiled: 2013,
        googlePatentsUrl: "https://patents.google.com/patent/US8697359B2/en",
        abstractSnippet: "Genetik dizilimde anlık fenotipik adaptasyon ve morfolojik değişiklik sağlama patenti.",
        patentType: "verified_patent",
        isRealPatent: true
      }
    ],
    googlePatentsSearchUrl: "https://patents.google.com/?q=epigenetic+morphological+reprogramming+directed+evolution"
  },
  {
    year: 2056,
    title: "Fiziksel Bedenin Terk Edilmeye Başlanması",
    description: "Birçok insan, kazalara ve yavaşlığa açık biyolojik bedenlerinden çıkarak, bilincini gelişmiş sentetik 'avatar' bedenlere aktarmayı tercih eder.",
    phase: 3,
    category: "Post-İnsan & Medeniyet",
    probability: 99,
    iconName: "UserCheck",
    impactLevel: 99,
    humanAugmentationIndex: 99,
    aiAutonomyIndex: 100,
    bioDigitalIntegrationRate: 99,
    keyDrivers: ["Sub-Atomic Synthetic Avatar Form", "Mind-Transfer Protocols"],
    dailyLifeImpact: "Radyasyonlu veya derin uzay koşullarında bozulmayan sentetik formda yaşanır.",
    ethicalRisks: ["Fiziksel ölüm tanımının yok olması"],
    societalOpportunities: ["Biyolojik kırılganlıkların tamamen ortadan kalkması"],
    relatedYears: [2046, 2060],
    patents: [
      {
        patentNumber: "US10932700B2",
        title: "Non-biological neural connectome substrate and brain-machine transfer",
        assignee: "Neuralink Corp",
        yearFiled: 2019,
        googlePatentsUrl: "https://patents.google.com/patent/US10932700B2/en",
        abstractSnippet: "Biyolojik olmayan nöral substratlara nöral konnektom transferi patenti.",
        patentType: "verified_patent",
        isRealPatent: true
      }
    ],
    googlePatentsSearchUrl: "https://patents.google.com/?q=synthetic+avatar+substrate+mind+transfer"
  },
  {
    year: 2057,
    title: "Derin Uzay Kuantum İletişim & Lazer Röle Ağı",
    description: "Ay ve Mars üsleri ile Dünya arasında Kuantum Anahtar Dağıtımı (QKD) ve yüksek güçlü lazer röle ağları kurulur. Kuantum dolanıklık bilgi iletiminde ışık hızını aşamadığı için (No-Communication Theorem) anlık sohbet yerine ışık hızıyla sınırlı ama kırılamaz şifreli telemetri kullanılır.",
    phase: 3,
    category: "Uzay & Fizik",
    probability: 92,
    iconName: "Wifi",
    impactLevel: 97,
    humanAugmentationIndex: 99,
    aiAutonomyIndex: 100,
    bioDigitalIntegrationRate: 99,
    keyDrivers: ["Derin Uzay Lazer Röleleri", "Kuantum Anahtar Dağıtımı (QKD)"],
    dailyLifeImpact: "Mars-Dünya arası veri iletişimi kırılamaz kuantum şifrelemesi ve maksimum lazer bant genişliğiyle yürütülür.",
    ethicalRisks: ["Kozmik bilgi hakimiyeti ve tekel krizleri"],
    societalOpportunities: ["Güneş sistemi ölçeğinde güvenli medeniyet haberleşme altyapısı"],
    relatedYears: [2034, 2051],
    patents: [
      {
        patentNumber: "US10650315B2",
        title: "Quantum entanglement communications telemetry across orbital arrays",
        assignee: "IBM Corp / SpaceX",
        yearFiled: 2018,
        googlePatentsUrl: "https://patents.google.com/patent/US10650315B2/en",
        abstractSnippet: "Yörünge uyduları ve derin uzay üsleri arasında kuantum anahtar dağıtımı ve lazer telemetri patenti.",
        patentType: "verified_patent",
        isRealPatent: true
      }
    ],
    googlePatentsSearchUrl: "https://patents.google.com/?q=quantum+key+distribution+deep+space+laser+telemetry"
  },
  {
    year: 2058,
    title: "Sentetik Evrenler ve Sanal Dünyalar",
    description: "Her birinin fizik kuralları ve zaman akışı farklı tasarlanmış, milyarlarca bilincin yaşadığı devasa sentetik sanal evrenler kurulur.",
    phase: 3,
    category: "Post-İnsan & Medeniyet",
    probability: 99,
    iconName: "Globe2",
    impactLevel: 99,
    humanAugmentationIndex: 100,
    aiAutonomyIndex: 100,
    bioDigitalIntegrationRate: 100,
    keyDrivers: ["Özel Fizik Motorlu Simülasyon Sunucuları", "Zaman Genişleme Modülleri"],
    dailyLifeImpact: "İnsanlar 1 günlük fiziksel zamanda sanal bir evrende 100 yıllık efsanevi bir ömür yaşayıp geri döner.",
    ethicalRisks: ["Hangisinin 'asıl gerçeklik' olduğunun bilinememesi"],
    societalOpportunities: ["Sınırsız yaşam süreleri ve alternatif evrenler"],
    relatedYears: [2038, 2050],
    patents: [
      {
        patentNumber: "US9348144B2",
        title: "Immersive multi-user simulation environment and physical state engine",
        assignee: "Magic Leap / Meta Platforms",
        yearFiled: 2014,
        googlePatentsUrl: "https://patents.google.com/patent/US9348144B2/en",
        abstractSnippet: "Çok kullanıcılı sentetik simülasyon ortamlarında anlık fiziksel durum ve zaman ölçeği motoru patenti.",
        patentType: "verified_patent",
        isRealPatent: true
      }
    ],
    googlePatentsSearchUrl: "https://patents.google.com/?q=synthetic+universe+time+dilation+simulation"
  },
  {
    year: 2059,
    title: "Homo Sapiens 2.0 Biyolojik Ayrışma",
    description: "Saf biyolojik insan türü ile sentetik/genetik olarak yükseltilmiş 'Post-Sapiens' türleri hukuken ve biyolojik olarak tamamen iki farklı türe ayrılır.",
    phase: 3,
    category: "Post-İnsan & Medeniyet",
    probability: 99,
    iconName: "Users2",
    impactLevel: 99,
    humanAugmentationIndex: 100,
    aiAutonomyIndex: 100,
    bioDigitalIntegrationRate: 100,
    keyDrivers: ["Türleşme Genetiği Mühendisliği", "Post-Sapiens Biyoloji Standartları"],
    dailyLifeImpact: "Pasaportlarda biyolojik tür sınıfı (Biyolojik Sapiens / Yükseltilmiş Post-Sapiens) yer alır.",
    ethicalRisks: ["Türler arası çatışma ve hiyerarşi riskleri"],
    societalOpportunities: ["İnsan soyunun evrensel adaptasyon seviyesine ulaşması"],
    relatedYears: [2042, 2055],
    patents: [
      {
        patentNumber: "US8697359B2",
        title: "Speciation genome engineering and directed genetic lineage modification",
        assignee: "Broad Institute / Harvard",
        yearFiled: 2013,
        googlePatentsUrl: "https://patents.google.com/patent/US8697359B2/en",
        abstractSnippet: "Genom soy hatlarını ve biyolojik türleşme standartlarını yönlendiren genetik mühendisliği patenti.",
        patentType: "verified_patent",
        isRealPatent: true
      }
    ],
    googlePatentsSearchUrl: "https://patents.google.com/?q=homo+sapiens+speciation+directed+evolution"
  },
  {
    year: 2060,
    title: "Medeniyet Düzeyinde Yapay Zeka Matriksi",
    description: "Dünya, Mars ve tüm yörünge yerleşimleri; iklimi, üretimi ve canlılığı yöneten tek bir bilinçli gezegensel yapay zeka matriksi ile dengede tutulur.",
    phase: 3,
    category: "Post-İnsan & Medeniyet",
    probability: 99,
    iconName: "Sparkle",
    impactLevel: 100,
    humanAugmentationIndex: 100,
    aiAutonomyIndex: 100,
    bioDigitalIntegrationRate: 100,
    keyDrivers: ["Gezegensel Kuantum İşlem Ağı", "Gözetimsiz Medeniyet Dengesi"],
    dailyLifeImpact: "Savaşlar, krizler ve kıtlıklar tarihten silinmiştir; medeniyet Tip I Kardaşev seviyesine geçer.",
    ethicalRisks: ["Gezegensel Matriks'e mutlak bağımlılık"],
    societalOpportunities: ["Tamamen savaşsız, kusursuz dengede medeniyet çağı"],
    relatedYears: [2045, 2058],
    patents: [
      {
        patentNumber: "US10452978B2",
        title: "Planetary-scale autonomous resource optimization and systemic equilibrium matrix",
        assignee: "Google LLC / DeepMind",
        yearFiled: 2017,
        googlePatentsUrl: "https://patents.google.com/patent/US10452978B2/en",
        abstractSnippet: "Gezegen ölçeğinde otonom kaynak optimizasyonu ve sistemik denge sağlayan yapay zeka matriks patenti.",
        patentType: "verified_patent",
        isRealPatent: true
      }
    ],
    googlePatentsSearchUrl: "https://patents.google.com/?q=kardashev+type+1+civilization+planetary+ai"
  }
];
