import React, { useState, useEffect, useMemo, useRef } from "react";
import { Milestone, CategoryType, ViewMode } from "../types";
import { useLanguage } from "../context/LanguageContext";
import { aiService } from "../services/AIService";
import {
  Globe,
  Shield,
  Zap,
  TrendingUp,
  Cpu,
  Award,
  ExternalLink,
  MapPin,
  Search,
  Filter,
  ArrowRightLeft,
  Check,
  Building2,
  Sparkles,
  Layers,
  Compass,
  Play,
  Pause,
  RotateCcw,
  Info,
  Radio,
  Activity,
  FileText,
  X,
  ChevronRight,
  Sliders,
  Eye,
  Database,
  RefreshCw,
  Share2,
} from "lucide-react";

export interface RegionInfo {
  id: string;
  name: string;
  nameEn: string;
  flag: string;
  leadCategories: CategoryType[];
  investmentVolume: string;
  investmentVolumeEn: string;
  patentShare: number; // percentage
  keyHubs: string[];
  regulatoryStance: string;
  regulatoryStanceEn: string;
  dominantTech: string;
  dominantTechEn: string;
  description: string;
  descriptionEn: string;
  keyProjects: string[];
  keyProjectsEn: string[];
  coords: { x: number; y: number }; // Percentage coordinates for SVG Map overlay (x: 0-100, y: 0-100)
  growthRate?: string;
  growthRateEn?: string;
  trlReadiness?: number; // 1-9
  strategicRole?: string;
  strategicRoleEn?: string;
}

export const REGION_DATA: RegionInfo[] = [
  {
    id: "turkey",
    name: "Türkiye & Doğu Akdeniz Havzası",
    nameEn: "Türkiye & Eastern Mediterranean Hub",
    flag: "🇹🇷",
    leadCategories: [
      "Otonom & Lojistik",
      "Kuantum & Güvenlik",
      "Yapay Zeka & Bilişim",
      "Enerji & Çevre",
    ],
    investmentVolume: "$48 Milyar / Yıl (Hızla Büyüyen Ar-Ge)",
    investmentVolumeEn: "$48 Billion / Year (Rapidly Growing R&D)",
    patentShare: 5.2,
    keyHubs: [
      "Bilişim Vadisi (Kocaeli)",
      "Teknopark İstanbul",
      "ODTÜ Teknokent (Ankara)",
      "İTÜ Arı Teknokent (İstanbul)",
    ],
    regulatoryStance: "Milli Teknoloji Hamlesi & Stratejik Teşvikler",
    regulatoryStanceEn: "National Technology Initiative & Strategic Incentives",
    dominantTech:
      "İnsansız Otonom Sürü SİHA/SİDA Sistemleri, TOGG Akıllı Mobilite Ekosistemi, Bor-Grafen Hibrit Bataryalar, Oyun & FinTech Yazılım Hub'ları, Milli Kuantum Siber Güvenlik",
    dominantTechEn:
      "Autonomous Swarm UAV/USV Defense Systems, TOGG Smart Mobility Ecosystem, Boron-Graphene Hybrid Batteries, Gaming & FinTech Software Hubs, National Quantum Cybersecurity",
    description:
      "SİHA/SİDA otonom savunma teknolojilerinde dünya liderliği, TOGG otonom araç yazılımları, Bilişim Vadisi oyun/SaaS ihracatı ve yerli bor-grafen enerji depolama çözümleriyle Doğu Akdeniz ve Avrasya'nın yükselen inovasyon üssü.",
    descriptionEn:
      "Global leader in autonomous UAV/USV defense systems, TOGG smart mobility software, gaming/SaaS exports from Informatics Valley, and local boron-graphene energy storage solutions shaping Eurasia's tech hub.",
    keyProjects: [
      "Bayraktar Kızılelma & Anka-3 Otonom Sürü Mimarisi",
      "TOGG Seviye 4 Otonom Sürüş & Dijital Varlık Mobilite Ekosistemi",
      "Bilişim Vadisi Yapay Zeka & Oyun Kuluçka Merkezleri",
      "Milli Kuantum Şifreleme & Siber Güvenlik Ağı",
    ],
    keyProjectsEn: [
      "Bayraktar Kızılelma & Anka-3 Autonomous Swarm Architecture",
      "TOGG Level 4 Autonomous Driving & Digital Asset Mobility Ecosystem",
      "Informatics Valley AI & Gaming Incubator Hubs",
      "National Quantum Encryption & Cybersecurity Network",
    ],
    coords: { x: 57, y: 38 },
  },
  {
    id: "usa",
    name: "Kuzey Amerika (ABD & Kanada)",
    nameEn: "North America (USA & Canada)",
    flag: "🇺🇸",
    leadCategories: [
      "Yapay Zeka & Bilişim",
      "Kuantum & Güvenlik",
      "Uzay & Fizik",
      "İnsan-Makine Arayüzü",
    ],
    investmentVolume: "$850 Milyar / Yıl",
    investmentVolumeEn: "$850 Billion / Year",
    patentShare: 36,
    keyHubs: [
      "Silicon Valley",
      "Boston Biotech Cluster",
      "Austin AI Corridor",
      "Waterloo Quantum Valley",
    ],
    regulatoryStance: "Piyasa Odaklı & Hızlı İnovasyon Dostu",
    regulatoryStanceEn: "Market-Driven & Fast Innovation Friendly",
    dominantTech:
      "AGI Sentez Motorları, Neuralink Biyo-Çipler, Derin Uzay Kolonizasyonu, Fotonik Kuantum Bilgisayarlar",
    dominantTechEn:
      "AGI Synthesis Engines, Neuralink Bio-Chips, Deep Space Colonization, Photonic Quantum Computers",
    description:
      "Özel sektör sermayesi ve dev teknoloji ekosistemleriyle AGI, nöromorfik donanım ve uzay taşımacılığında küresel liderliği elinde tutuyor.",
    descriptionEn:
      "Holds global leadership in AGI, neuromorphic hardware, and space transportation through massive venture capital and giant tech ecosystems.",
    keyProjects: [
      "Starship Mars Kolonizasyon Roketleri",
      "Neuralink Biyonik Arayüz Kitleri",
      "Genel Yapay Zeka (AGI) Veri Merkezleri",
    ],
    keyProjectsEn: [
      "Starship Mars Colonization Rockets",
      "Neuralink Bionic Interface Kits",
      "Artificial General Intelligence (AGI) Data Centers",
    ],
    coords: { x: 22, y: 32 },
  },
  {
    id: "china",
    name: "Doğu Asya (Çin Halk Cumhuriyeti)",
    nameEn: "East Asia (China)",
    flag: "🇨🇳",
    leadCategories: [
      "Otonom & Lojistik",
      "Kuantum & Güvenlik",
      "Enerji & Çevre",
    ],
    investmentVolume: "$720 Milyar / Yıl",
    investmentVolumeEn: "$720 Billion / Year",
    patentShare: 32,
    keyHubs: [
      "Shenzhen Hardware Valley",
      "Hangzhou AI Park",
      "Hefei Quantum Center",
      "Shanghai Robotics City",
    ],
    regulatoryStance: "Devlet Güdümlü Planlı Altyapı",
    regulatoryStanceEn: "State-Guided Planned Infrastructure",
    dominantTech:
      "Kuantum İnternet Şifreleme, Otonom Kent Filoları, Sentetik Nükleer Füzyon, 6G Uzay Ağı",
    dominantTechEn:
      "Quantum Internet Encryption, Autonomous City Fleets, Synthetic Nuclear Fusion, 6G Space Mesh",
    description:
      "Kuantum güvenliği, otonom drone filoları ve mega ölçekli temiz enerji santrallerinde devlet destekli dikey entegrasyon yürütüyor.",
    descriptionEn:
      "Executes state-supported vertical integration in quantum security, autonomous drone fleets, and mega-scale clean fusion power plants.",
    keyProjects: [
      "EAST Yapay Güneş Füzyon Reaktörü",
      "Kuantum Uydular Arası Şifreli İletişim",
      "Otonom Taksi & Lojistik Mega Şehirler",
    ],
    keyProjectsEn: [
      "EAST Artificial Sun Fusion Reactor",
      "Quantum Satellite Encrypted Communication",
      "Autonomous Taxi & Logistics Mega Cities",
    ],
    coords: { x: 78, y: 40 },
  },
  {
    id: "eu",
    name: "Avrupa Birliği & Birleşik Krallık",
    nameEn: "European Union & United Kingdom",
    flag: "🇪🇺",
    leadCategories: [
      "Biyoloji & Tıp",
      "Sosyoloji & Ekonomi",
      "Enerji & Çevre",
    ],
    investmentVolume: "$410 Milyar / Yıl",
    investmentVolumeEn: "$410 Billion / Year",
    patentShare: 16,
    keyHubs: [
      "CERN Geneva",
      "Cambridge Bio-Cluster",
      "Berlin AI Hub",
      "Eindhoven Semiconductor Center",
    ],
    regulatoryStance: "Sıkı Etik Denetim & İnsan Merkezli (EU AI Act)",
    regulatoryStanceEn: "Strict Ethical Oversight & Human-Centric (EU AI Act)",
    dominantTech:
      "Hücresel Yaşlanma Karşıtı Gen Terapileri, ITER Füzyon Reaktörleri, Etik AI Yasaları, ASML Litografi",
    dominantTechEn:
      "Anti-Aging Cellular Gene Therapies, ITER Fusion Reactors, Ethical AI Legislation, ASML Lithography",
    description:
      "Biyoteknoloji, hücresel organ yenileme, ileri yarı iletken litografisi ve veri gizliliği konularında küresel etik ve teknik standartları belirliyor.",
    descriptionEn:
      "Establishes global ethical and technical standards in biotechnology, cellular organ regeneration, advanced semiconductor lithography, and data privacy.",
    keyProjects: [
      "ITER Nükleer Füzyon Deneyi",
      "Human Brain Project Nöro-Simülasyonu",
      "CRISPR Gen Düzenleme Klinikleri",
    ],
    keyProjectsEn: [
      "ITER Nuclear Fusion Experiment",
      "Human Brain Project Neuro-Simulation",
      "CRISPR Gene Editing Clinics",
    ],
    coords: { x: 48, y: 30 },
  },
  {
    id: "japan_sk",
    name: "Japonya & Güney Kore",
    nameEn: "Japan & South Korea",
    flag: "🇯🇵",
    leadCategories: [
      "İnsan-Makine Arayüzü",
      "Otonom & Lojistik",
      "Post-İnsan & Medeniyet",
    ],
    investmentVolume: "$290 Milyar / Yıl",
    investmentVolumeEn: "$290 Billion / Year",
    patentShare: 9,
    keyHubs: [
      "Tokyo Robotics City",
      "Seoul Bio-Silicon Valley",
      "Tsukuba Science City",
      "Daejeon Research Complex",
    ],
    regulatoryStance: "Sosyal Yaşlanma & Otomasyon Adaptasyonu",
    regulatoryStanceEn: "Social Aging & Automation Adaptation",
    dominantTech:
      "İnsansı Biyo-Robotlar, Eksoskeleton İskeletler, Nöromorfik Yarı İletkenler, 3D Bellek Çipleri",
    dominantTechEn:
      "Humanoid Bio-Robots, Exoskeleton Suits, Neuromorphic Semiconductors, 3D Memory Chips",
    description:
      "Demografik yaşlanmaya karşı insansı bakım robotları, biyonik uzuv ve ileri mikroçip bellek teknolojilerinde dünyada öncü role sahiptir.",
    descriptionEn:
      "Pioneers humanoid caregiving robots, bionic limbs, and advanced microchip memory technologies in response to demographic aging.",
    keyProjects: [
      "Japonya İnsansı Ev Yardımcısı Robot Ordusu",
      "Samsung 1nm Nöromorfik Çip Tesisleri",
      "Otonom Hızlı Tren Hatları",
    ],
    keyProjectsEn: [
      "Japan Humanoid Domestic Companion Fleet",
      "Samsung 1nm Neuromorphic Chip Facilities",
      "Autonomous High-Speed Rail Networks",
    ],
    coords: { x: 86, y: 38 },
  },
  {
    id: "gulf",
    name: "Orta Doğu & Körfez (BAE & KSA)",
    nameEn: "Middle East & Gulf (UAE & KSA)",
    flag: "🇦🇪",
    leadCategories: [
      "Enerji & Çevre",
      "Yapay Zeka & Bilişim",
      "Post-İnsan & Medeniyet",
    ],
    investmentVolume: "$180 Milyar / Yıl",
    investmentVolumeEn: "$180 Billion / Year",
    patentShare: 4,
    keyHubs: [
      "Dubai Future Foundation",
      "NEOM Oxagon & Trojena",
      "KAUST Research Park (Riyadh)",
    ],
    regulatoryStance: "Mega Proje Bütçeli Esnek Özel Bölgeler",
    regulatoryStanceEn: "Flexible Special Zones with Mega Budgets",
    dominantTech:
      "Yeşil Hidrojen Sentetik Yakıtlar, Neom Otonom Dikey Şehirler, Su Arıtma Nanoteknolojisi, Egemen AI Modellere Yatırım",
    dominantTechEn:
      "Green Hydrogen Synthetic Fuels, NEOM Autonomous Vertical Cities, Desalination Nanotech, Sovereign AI Models",
    description:
      "Petrol sonrası ekonomide mega akıllı şehirler (NEOM), yeşil hidrojen ve devlet fonlu AGI altyapı projeleriyle hızla yükselmektedir.",
    descriptionEn:
      "Rapidly rising with mega smart cities (NEOM), green hydrogen pipelines, and state-backed AGI infrastructure in the post-oil era.",
    keyProjects: [
      "NEOM The Line Otonom Şehir Ekosistemi",
      "Körfez Yeşil Hidrojen Boru Hatları",
      "Falcon & LLM Arapça Yapay Zeka Modelleri",
    ],
    keyProjectsEn: [
      "NEOM The Line Autonomous City Ecosystem",
      "Gulf Green Hydrogen Pipelines",
      "Falcon & LLM Arabic AI Models",
    ],
    coords: { x: 62, y: 48 },
  },
  {
    id: "india",
    name: "Güney Asya & Hindistan",
    nameEn: "South Asia & India",
    flag: "🇮🇳",
    leadCategories: [
      "Yapay Zeka & Bilişim",
      "Uzay & Fizik",
      "Biyoloji & Tıp",
    ],
    investmentVolume: "$120 Milyar / Yıl",
    investmentVolumeEn: "$120 Billion / Year",
    patentShare: 4.8,
    keyHubs: [
      "Bengaluru Tech Capital",
      "Hyderabad Genome Valley",
      "IIT Madras Innovation Park",
    ],
    regulatoryStance: "Kamusal Dijital Altyapı & Fiyat/Performans İnovasyonu",
    regulatoryStanceEn: "Digital Public Infrastructure & Frugal Innovation",
    dominantTech:
      "Maliyet-Etkin Ay & Mars Görevleri, Kamusal Dijital Veri Mimarisi (UPI), Biyobenzer İlaç Üretimi, AI Yazılım Gücü",
    dominantTechEn:
      "Cost-Effective Moon & Mars Missions, Digital Public Infrastructure (UPI), Biosimilar Pharmaceuticals, AI Software Workforce",
    description:
      "Kamusal dijital altyapı (UPI), uygun maliyetli uzay araştırmaları (ISRO) ve dev AI yazılım yetenek gücüyle küresel ölçekte belirleyici güç.",
    descriptionEn:
      "A global force with digital public infrastructure (UPI), cost-effective space exploration (ISRO), and a vast AI software talent pool.",
    keyProjects: [
      "ISRO Ay ve Venüs Derin Uzay Sondaları",
      "Aadhaar & Kamusal Biyo-Kimlik Altyapısı",
      "Yerel Dilde AI Asistanları Ekosistemi",
    ],
    keyProjectsEn: [
      "ISRO Moon & Venus Deep Space Probes",
      "Aadhaar Digital Bio-Identity Infrastructure",
      "Vernacular AI Assistant Ecosystem",
    ],
    coords: { x: 70, y: 48 },
    growthRate: "+21.5% / Yıl",
    growthRateEn: "+21.5% / Year",
    trlReadiness: 7,
    strategicRole: "Yazılım İşgücü, Kamusal Dijital Mimari (UPI) & Uygun Maliyetli Uzay",
    strategicRoleEn: "Software Talent Pool, Digital Public Infra (UPI) & Frugal Space",
  },
  {
    id: "taiwan_asean",
    name: "Tayvan & Güneydoğu Asya (Yarı İletken Kalbi)",
    nameEn: "Taiwan & Southeast Asia (Semiconductor Hub)",
    flag: "🇹🇼",
    leadCategories: [
      "Kuantum & Güvenlik",
      "Yapay Zeka & Bilişim",
      "Otonom & Lojistik",
    ],
    investmentVolume: "$210 Milyar / Yıl",
    investmentVolumeEn: "$210 Billion / Year",
    patentShare: 11.5,
    keyHubs: [
      "Hsinchu Science Park (TSMC)",
      "Tainan Tech Campus",
      "Singapore One-North R&D",
      "Penang Chip Assembly Corridor",
    ],
    regulatoryStance: "Stratejik Teknoloji Kalkanı & Teşvikler",
    regulatoryStanceEn: "Strategic Silicon Shield & Subsidies",
    dominantTech:
      "2nm/1nm GAA Transistör Litografisi, İleri Yonga Paketleme (CoWoS), ASEAN Akıllı Üretim Robotları",
    dominantTechEn:
      "2nm/1nm GAA Transistor Lithography, Advanced Chip Packaging (CoWoS), ASEAN Smart Robotics",
    description:
      "Dünyanın en gelişmiş (3nm ve altı) mikroçip üretiminin %60'ından fazlasını karşılayan, küresel yapay zeka hızlandırıcılarının ve süper bilgisayarların kalbi konumundaki vazgeçilmez donanım üssü.",
    descriptionEn:
      "The indispensable silicon powerhouse producing over 60% of the world's most advanced microchips and powering global AI accelerators.",
    keyProjects: [
      "TSMC 1.4nm Angstrom Fabrika Kompleksi",
      "Singapur Ulusal Kuantum Laboratuvarı",
      "ASEAN Otonom Deniz Taşımacılığı Hub'ı",
    ],
    keyProjectsEn: [
      "TSMC 1.4nm Angstrom Fab Complex",
      "Singapore National Quantum Laboratory",
      "ASEAN Autonomous Maritime Logistics Hub",
    ],
    coords: { x: 80, y: 46 },
    growthRate: "+16.8% / Yıl",
    growthRateEn: "+16.8% / Year",
    trlReadiness: 9,
    strategicRole: "Küresel Yapay Zeka ve Çip Tedarik Zincirinin Silikon Kalkanı",
    strategicRoleEn: "Silicon Shield of Global AI & Chip Supply Chain",
  },
  {
    id: "latin_america",
    name: "Latin Amerika & Lityum Üçgeni (Brezilya, Şili, Meksika)",
    nameEn: "Latin America & Lithium Triangle (Brazil, Chile, Mexico)",
    flag: "🇧🇷",
    leadCategories: [
      "Enerji & Çevre",
      "Biyoloji & Tıp",
      "Sosyoloji & Ekonomi",
    ],
    investmentVolume: "$65 Milyar / Yıl",
    investmentVolumeEn: "$65 Billion / Year",
    patentShare: 2.4,
    keyHubs: [
      "São Paulo Tech Valley",
      "Atacama Clean Lithium Hub",
      "Monterrey Nearshoring Corridor",
      "Buenos Aires Biotech Center",
    ],
    regulatoryStance: "Kaynak Milliyetçiliği & Yeşil Dönüşüm",
    regulatoryStanceEn: "Resource Sovereign Stewardship & Green Transition",
    dominantTech:
      "Doğrudan Lityum Çıkarımı (DLE), Biyoçeşitlilik Genetik Haritalama, Biyoyakıt & Yeşil Hidrojen, Akıllı Tarım (AgriTech)",
    dominantTechEn:
      "Direct Lithium Extraction (DLE), Biodiversity Genomic Mapping, Biofuels & Green Hydrogen, Smart AgriTech",
    description:
      "Küresel elektrikli araç ve batarya devriminin lityum ve bakır hammaddesi tedarikçisi; Amazon biyomunun eşsiz genetik çeşitliliğiyle sentetik biyoloji araştırmalarının stratejik rezervuarı.",
    descriptionEn:
      "Crucial raw material provider of lithium and copper for global EV and energy storage transitions, paired with the rich genetic bio-diversity of the Amazon.",
    keyProjects: [
      "Atacama Sürdürülebilir Lityum Rafinerisi",
      "Amazon Biyom Genom Haritalama Konsorsiyumu",
      "Brezilya Şeker Kamışı İleri Biyoyakıt İstasyonları",
    ],
    keyProjectsEn: [
      "Atacama Sustainable Lithium Refinery",
      "Amazon Biome Genomic Mapping Consortium",
      "Brazil Sugarcane Advanced Biofuel Network",
    ],
    coords: { x: 32, y: 65 },
    growthRate: "+13.5% / Yıl",
    growthRateEn: "+13.5% / Year",
    trlReadiness: 6,
    strategicRole: "Küresel Batarya Hammadde Tedarikçisi & Biyogenetik Rezerv",
    strategicRoleEn: "Global Battery Materials Provider & Biogenetic Reservoir",
  },
  {
    id: "africa_hub",
    name: "Afrika İnovasyon Kuşağı (Nijerya, Kenya, Güney Afrika)",
    nameEn: "African Innovation Belt (Nigeria, Kenya, South Africa)",
    flag: "🇿🇦",
    leadCategories: [
      "Sosyoloji & Ekonomi",
      "Enerji & Çevre",
      "Otonom & Lojistik",
    ],
    investmentVolume: "$35 Milyar / Yıl (Hızlı Büyüme)",
    investmentVolumeEn: "$35 Billion / Year (Rapid Growth)",
    patentShare: 1.5,
    keyHubs: [
      "Silicon Savannah (Nairobi)",
      "Yaba Tech Cluster (Lagos)",
      "Cape Town Tech & AI Zone",
      "Kigali Smart City Campus",
    ],
    regulatoryStance: "Esnek FinTech Sandbox & Girişim Teşvikleri",
    regulatoryStanceEn: "Agile FinTech Sandboxes & Startup Incentives",
    dominantTech:
      "Merkeziyetsiz Mobil FinTech (M-Pesa 3.0), Dağıtık Güneş Mikro-Şebekeleri, Tıbbi İHA/Drone Lojistiği (Zipline vb.)",
    dominantTechEn:
      "Decentralized Mobile FinTech (M-Pesa 3.0), Distributed Solar Micro-Grids, Medical Drone Logistics Networks",
    description:
      "Genç ve dinamik demografisi, geleneksel bankacılığı atlayarak doğrudan mobil kripto/FinTech ekosistemine geçen yapısı ve zorlu coğrafi şartlarda otonom drone lojistiğiyle sıçramalı (leapfrogging) inovasyon üssü.",
    descriptionEn:
      "A leapfrogging innovation hub powered by the youngest global demographic, cutting-edge mobile fintech, and rural autonomous drone delivery networks.",
    keyProjects: [
      "Afrika Genelinde Otonom Tıbbi Drone Koridoru",
      "Sahra-Altı Dağıtık Güneş & Batarya Şebekesi",
      "Pan-Afrika Dijital Ödeme & Finansal Kimlik Sistemi",
    ],
    keyProjectsEn: [
      "Pan-African Autonomous Medical Drone Corridor",
      "Sub-Saharan Distributed Solar & Storage Mesh",
      "Pan-African Digital Payments & Financial Identity",
    ],
    coords: { x: 53, y: 62 },
    growthRate: "+24.0% / Yıl",
    growthRateEn: "+24.0% / Year",
    trlReadiness: 6,
    strategicRole: "Sıçramalı İnovasyon (Leapfrogging), FinTech ve Dağıtık Temiz Enerji",
    strategicRoleEn: "Leapfrogging Innovation, FinTech & Distributed Clean Energy",
  },
];

interface GeographicMapViewProps {
  milestones: Milestone[];
  onSelectMilestone: (m: Milestone) => void;
  activeMilestone?: Milestone;
  onNavigateToView?: (view: ViewMode, targetYear?: number) => void;
  userCredits?: number;
  onDeductCredits?: (amount: number) => boolean;
  onOpenCreditStore?: () => void;
}

export const GeographicMapView: React.FC<GeographicMapViewProps> = ({
  milestones = [],
  onSelectMilestone,
  activeMilestone,
  onNavigateToView,
  userCredits = 100,
  onDeductCredits,
  onOpenCreditStore,
}) => {
  const { language } = useLanguage();
  const isTr = language === "tr";
  const safeMilestones = Array.isArray(milestones) ? milestones : [];

  const [selectedRegion, setSelectedRegion] = useState<RegionInfo>(REGION_DATA[0]); // Default to Türkiye
  const [compareRegion, setCompareRegion] = useState<RegionInfo | null>(null);
  const [isCompareMode, setIsCompareMode] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [activeTab, setActiveTab] = useState<"map" | "grid" | "compare">("map");

  // 🕒 Selected Year State (Synced with active milestone or current baseline)
  const [selectedYear, setSelectedYear] = useState<number>(() => activeMilestone?.year || 2026);
  const [showFlowArcs, setShowFlowArcs] = useState<boolean>(true);

  // Sync with active milestone when it changes
  useEffect(() => {
    if (activeMilestone?.year) {
      setSelectedYear(activeMilestone.year);
    }
  }, [activeMilestone]);

  // Calculate dynamic regional diffusion index (0-100%) for a given year & category
  const calculateDiffusionScore = (region: RegionInfo, year: number, category: string): number => {
    const yearDelta = Math.max(0, year - 2026);
    const isLeaderInCat = category === "all" || region.leadCategories.includes(category as CategoryType);
    
    // Base weight derived from patent share + TRL
    let base = (region.patentShare * 1.5) + ((region.trlReadiness || 7) * 4);
    
    if (isLeaderInCat) {
      base += 25 + (yearDelta * 0.9);
    } else {
      base += 12 + (yearDelta * 1.6);
    }

    // Turkey specific dynamic innovation scaling (Autonomous + Boron + Defense)
    if (region.id === "turkey") {
      if (category === "Otonom & Lojistik" || category === "all") {
        base += 18 + (yearDelta * 1.1);
      }
    }

    return Math.min(100, Math.max(15, Math.round(base)));
  };

  // Filtered regions
  const filteredRegions = REGION_DATA.filter((reg) => {
    const regName = isTr ? reg.name : reg.nameEn;
    const regTech = isTr ? reg.dominantTech : reg.dominantTechEn;
    const matchesSearch =
      searchQuery.trim() === "" ||
      regName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      regTech.toLowerCase().includes(searchQuery.toLowerCase()) ||
      reg.keyHubs.some((h) => h.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesCategory =
      selectedCategory === "all" ||
      reg.leadCategories.some((cat) => cat === selectedCategory);

    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-6 pb-12">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-blue-950/80 via-slate-900 to-purple-950/80 border border-blue-500/30 rounded-2xl p-6 lg:p-8 backdrop-blur-xl relative overflow-hidden shadow-xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 w-64 h-64 bg-red-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 space-y-3 max-w-4xl">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-blue-500/10 border border-blue-500/30 text-blue-400 font-mono text-xs font-bold uppercase tracking-wider">
            <Globe className="w-4 h-4 text-cyan-400 animate-pulse" />
            <span>
              {isTr
                ? "Küresel İnovasyon Haritası & Türkiye Teknoloji Hamlesi // 2026-2060"
                : "Global Innovation Map & Türkiye Tech Outlook // 2026-2060"}
            </span>
          </div>

          <h2 className="text-2xl lg:text-3xl font-extrabold tracking-tight text-white uppercase flex flex-wrap items-center gap-2">
            <span>{isTr ? "Coğrafi Dağılım & Bölgesel İnovasyon Haritası" : "Geographic Distribution & Regional Innovation Map"}</span>
            <span className="text-xs font-mono font-bold px-2.5 py-1 rounded-lg bg-red-600/20 text-red-300 border border-red-500/30 flex items-center gap-1">
              🇹🇷 Türkiye Eklendi
            </span>
          </h2>

          <p className="text-slate-300 text-sm leading-relaxed">
            {isTr
              ? "Dünya genelindeki kilit inovasyon havzalarının Ar-Ge harcamaları, küresel patent payları, stratejik odak noktaları ve Türkiye'nin SİHA otonomisi, TOGG akıllı mobilite, Bilişim Vadisi ve bor-grafen batarya alanındaki bölgesel liderliği."
              : "Explore R&D volumes, global patent shares, and strategic focus areas of global innovation hubs, highlighting Türkiye's leadership in autonomous UAV/USV systems, TOGG smart mobility, and energy storage."}
          </p>

          {/* View Mode Tabs & Auxiliary Controls */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-2 font-mono text-xs">
            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={() => {
                  setActiveTab("map");
                  setIsCompareMode(false);
                }}
                className={`px-3.5 py-1.5 rounded-xl border font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                  activeTab === "map"
                    ? "bg-blue-600 text-white border-blue-400 shadow-md shadow-blue-500/20"
                    : "bg-slate-900/80 text-slate-300 border-white/10 hover:bg-slate-800"
                }`}
              >
                <Compass className="w-4 h-4 text-cyan-400" />
                <span>{isTr ? "İnteraktif Dünya Haritası" : "Interactive World Map"}</span>
              </button>

              <button
                onClick={() => {
                  setActiveTab("grid");
                  setIsCompareMode(false);
                }}
                className={`px-3.5 py-1.5 rounded-xl border font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                  activeTab === "grid"
                    ? "bg-purple-600 text-white border-purple-400 shadow-md shadow-purple-500/20"
                    : "bg-slate-900/80 text-slate-300 border-white/10 hover:bg-slate-800"
                }`}
              >
                <Layers className="w-4 h-4 text-purple-400" />
                <span>{isTr ? "Tüm Bölgeler Kart Görünümü" : "All Regions Card Grid"}</span>
              </button>

              <button
                onClick={() => {
                  setActiveTab("compare");
                  setIsCompareMode(true);
                  if (!compareRegion) {
                    setCompareRegion(REGION_DATA[1]); // Default second region
                  }
                }}
                className={`px-3.5 py-1.5 rounded-xl border font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                  activeTab === "compare" || isCompareMode
                    ? "bg-amber-500 text-slate-950 border-amber-300 font-bold shadow-md shadow-amber-500/20"
                    : "bg-slate-900/80 text-slate-300 border-white/10 hover:bg-slate-800"
                }`}
              >
                <ArrowRightLeft className="w-4 h-4 text-amber-950" />
                <span>{isTr ? "İki Bölgeyi Karşılaştır" : "Compare Two Regions"}</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Target Milestone Origin Banner (if navigated with active milestone) */}
      {activeMilestone && (
        <div className="bg-gradient-to-r from-cyan-950/90 via-slate-900 to-blue-950/90 border border-cyan-500/40 rounded-xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-lg">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-lg bg-cyan-500/20 border border-cyan-500/40 text-cyan-300 font-mono font-bold text-sm">
              {activeMilestone.year}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-bold text-cyan-400 uppercase tracking-wider">
                  {isTr ? "🎯 İNCELENEN DÖNÜM NOKTASI KÜRESEL ODAĞI:" : "🎯 SELECTED TIMELINE FOCUS:"}
                </span>
                <span className="text-[11px] px-2 py-0.5 rounded bg-cyan-900/50 text-cyan-200 border border-cyan-500/20">
                  {activeMilestone.category}
                </span>
              </div>
              <h4 className="text-sm font-bold text-white mt-0.5">{activeMilestone.title}</h4>
              <p className="text-xs text-slate-300 line-clamp-1">{activeMilestone.description}</p>
            </div>
          </div>

          {onNavigateToView && (
            <button
              onClick={() => onNavigateToView("timeline", activeMilestone.year)}
              className="whitespace-nowrap px-3 py-1.5 rounded-lg bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-400/30 text-cyan-300 font-mono text-xs font-bold transition-all cursor-pointer flex items-center gap-1 self-end sm:self-center"
            >
              <span>{isTr ? "Takvim Görünümüne Dön" : "Return to Timeline"}</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      )}

      {/* Filter & Search Bar */}
      <div className="bg-slate-900/80 border border-white/10 rounded-xl p-4 flex flex-wrap items-center justify-between gap-3 font-mono text-xs">
        {/* Search Input */}
        <div className="relative flex-1 min-w-[220px]">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={
              isTr
                ? "Bölge, ülke veya teknoloji ara (örn: Türkiye, Bilişim Vadisi, SİHA, Kuantum)..."
                : "Search region, hub or tech (e.g. Türkiye, Silicon Valley, Swarms)..."
            }
            className="w-full bg-slate-950 border border-white/10 rounded-lg pl-9 pr-3 py-2 text-white focus:outline-none focus:border-blue-500 placeholder-slate-500"
          />
        </div>

        {/* Category Dropdown Filter */}
        <div className="relative flex items-center">
          <Filter className="w-3.5 h-3.5 text-slate-400 absolute left-3 pointer-events-none" />
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="bg-slate-950 border border-white/10 text-slate-200 rounded-lg pl-8 pr-7 py-2 appearance-none cursor-pointer focus:outline-none focus:border-blue-500"
          >
            <option value="all">{isTr ? "Tüm İnovasyon Kategorileri" : "All Innovation Categories"}</option>
            <option value="Otonom & Lojistik">{isTr ? "Otonom & Lojistik" : "Autonomous & Logistics"}</option>
            <option value="Yapay Zeka & Bilişim">{isTr ? "Yapay Zeka & Bilişim" : "AI & Computing"}</option>
            <option value="Kuantum & Güvenlik">{isTr ? "Kuantum & Güvenlik" : "Quantum & Security"}</option>
            <option value="Enerji & Çevre">{isTr ? "Enerji & Çevre" : "Energy & Environment"}</option>
            <option value="Biyoloji & Tıp">{isTr ? "Biyoloji & Tıp" : "Biology & Medicine"}</option>
            <option value="İnsan-Makine Arayüzü">{isTr ? "İnsan-Makine Arayüzü" : "Human-Machine Interface"}</option>
            <option value="Uzay & Fizik">{isTr ? "Uzay & Fizik" : "Space & Physics"}</option>
          </select>
          <span className="pointer-events-none absolute right-2 text-slate-500 text-[10px]">▼</span>
        </div>
      </div>

      {/* ================= MAP TAB VIEW ================= */}
      {activeTab === "map" && !isCompareMode && (
        <div className="space-y-6">
          {/* Interactive World Map SVG Box */}
          <div className="bg-slate-950 border border-blue-500/30 rounded-2xl p-4 lg:p-6 relative overflow-hidden shadow-2xl">
            <div className="flex items-center justify-between mb-3 font-mono text-xs">
              <span className="text-cyan-400 font-bold flex items-center gap-1.5">
                <Compass className="w-4 h-4 text-cyan-400 animate-spin" style={{ animationDuration: '10s' }} />
                <span>{isTr ? "KÜRESEL İNOVASYON DÜNYA HARİTASI (Tıklayarak Bölge Seçin)" : "GLOBAL INNOVATION MAP (Click Pin to Select)"}</span>
              </span>
              <span className="text-slate-400 text-[11px]">
                {isTr ? "Seçili Bölge: " : "Selected: "}
                <strong className="text-white">{isTr ? selectedRegion.name : selectedRegion.nameEn}</strong>
              </span>
            </div>

            {/* SVG Map Canvas */}
            <div className="relative w-full aspect-[2/1] min-h-[280px] sm:min-h-[360px] bg-[#050B14] rounded-xl border border-white/10 overflow-hidden flex items-center justify-center">
              {/* World Map Graphic Background Grid */}
              <div
                className="absolute inset-0 opacity-25 pointer-events-none"
                style={{
                  backgroundImage: `radial-gradient(#1e293b 1px, transparent 1px), linear-gradient(to right, rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.03) 1px, transparent 1px)`,
                  backgroundSize: "20px 20px, 40px 40px, 40px 40px",
                }}
              />

              {/* Stylized World Vector Outline (SVG) & Dynamic Flow Arcs */}
              <svg
                viewBox="0 0 1000 500"
                className="w-full h-full object-contain opacity-40 pointer-events-none"
                fill="none"
                stroke="#38bdf8"
                strokeWidth="1"
              >
                {/* Simplified Continents outline paths */}
                {/* North America */}
                <path d="M150 80 Q 200 60, 280 100 T 260 220 T 180 250 T 100 180 Z" fill="#0f172a" opacity="0.6" />
                {/* South America */}
                <path d="M280 270 Q 320 280, 310 380 T 260 450 T 230 330 Z" fill="#0f172a" opacity="0.6" />
                {/* Europe */}
                <path d="M450 80 Q 520 60, 560 120 T 520 200 T 440 160 Z" fill="#0f172a" opacity="0.6" />
                {/* Africa */}
                <path d="M460 210 Q 550 210, 560 330 T 490 420 T 430 300 Z" fill="#0f172a" opacity="0.6" />
                {/* Asia / Eurasia */}
                <path d="M570 80 Q 750 50, 880 120 T 820 260 T 600 220 Z" fill="#0f172a" opacity="0.6" />
                {/* Turkey Highlight Zone */}
                <path d="M550 170 Q 580 165, 590 180 T 560 190 Z" fill="#ef4444" opacity="0.5" stroke="#f87171" strokeWidth="2" />
                {/* Australia */}
                <path d="M780 320 Q 860 310, 880 390 T 800 420 Z" fill="#0f172a" opacity="0.6" />

                {/* 🌊 Global Technology Transfer Flow Arcs (Animated Quadratic Beziers) */}
                {showFlowArcs && (
                  <g className="opacity-70">
                    {/* Taiwan -> USA (Semiconductor to Cloud/AI) */}
                    <path
                      d="M 800 230 Q 500 80 220 160"
                      stroke="#38bdf8"
                      strokeWidth="2"
                      strokeDasharray="6 4"
                      className="animate-pulse"
                    />
                    {/* USA -> Europe (AI Model Deployments) */}
                    <path
                      d="M 220 160 Q 350 100 480 150"
                      stroke="#818cf8"
                      strokeWidth="2"
                      strokeDasharray="6 4"
                    />
                    {/* Turkey -> Gulf & EU (Autonomous Swarms & Smart Mobility) */}
                    <path
                      d="M 570 190 Q 520 150 480 150"
                      stroke="#f87171"
                      strokeWidth="2"
                      strokeDasharray="4 3"
                    />
                    <path
                      d="M 570 190 Q 600 220 620 240"
                      stroke="#f87171"
                      strokeWidth="2"
                      strokeDasharray="4 3"
                    />
                    {/* Latin America -> USA & China (Lithium & Battery Supply) */}
                    <path
                      d="M 320 325 Q 260 240 220 160"
                      stroke="#34d399"
                      strokeWidth="1.5"
                      strokeDasharray="5 5"
                    />
                    {/* Africa -> Europe & Gulf (Clean Solar Microgrid Hubs) */}
                    <path
                      d="M 530 310 Q 510 220 480 150"
                      stroke="#fbbf24"
                      strokeWidth="1.5"
                      strokeDasharray="5 5"
                    />
                  </g>
                )}
              </svg>

              {/* Interactive Glowing Pins with Dynamic Diffusion Index for each region */}
              {REGION_DATA.map((reg, rIdx) => {
                const isSelected = selectedRegion.id === reg.id;
                const isTurkey = reg.id === "turkey";
                const diffScore = calculateDiffusionScore(reg, selectedYear, selectedCategory);
                const isMilestoneLeader = activeMilestone && reg.leadCategories.includes(activeMilestone.category);

                return (
                  <button
                    key={`reg-pin-${reg.id}-${rIdx}`}
                    onClick={() => setSelectedRegion(reg)}
                    style={{ left: `${reg.coords.x}%`, top: `${reg.coords.y}%` }}
                    className="absolute -translate-x-1/2 -translate-y-1/2 group cursor-pointer z-20 focus:outline-none"
                    title={`${isTr ? reg.name : reg.nameEn} (${selectedYear} Yayılım Skoru: %${diffScore})`}
                  >
                    {/* Pulsing ring animation */}
                    <span
                      className={`absolute -inset-2 rounded-full animate-ping opacity-75 ${
                        isTurkey
                          ? "bg-red-500"
                          : isSelected
                          ? "bg-cyan-400"
                          : isMilestoneLeader
                          ? "bg-amber-400"
                          : "bg-blue-500/40"
                      }`}
                    />

                    {/* Pin Marker Badge */}
                    <div
                      className={`relative flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-xs font-mono font-bold transition-all transform group-hover:scale-110 shadow-lg ${
                        isTurkey
                          ? "bg-gradient-to-r from-red-600 to-amber-600 border-red-300 text-white shadow-red-500/30 ring-2 ring-red-500/50"
                          : isSelected
                          ? "bg-cyan-500 text-slate-950 border-cyan-200 ring-2 ring-cyan-400/50 shadow-cyan-500/30"
                          : isMilestoneLeader
                          ? "bg-amber-500 text-slate-950 border-amber-200 ring-2 ring-amber-400/50"
                          : "bg-slate-900/90 border-white/20 text-slate-200 hover:bg-slate-800"
                      }`}
                    >
                      <span className="text-base">{reg.flag}</span>
                      <span className="whitespace-nowrap hidden sm:inline">{isTr ? reg.name.split(" ")[0] : reg.nameEn.split(" ")[0]}</span>
                      <span className={`text-[10px] px-1.5 py-0.2 rounded font-mono font-bold ${
                        isSelected || isMilestoneLeader ? "bg-slate-950 text-cyan-300" : "bg-slate-800 text-cyan-400"
                      }`}>
                        %{diffScore}
                      </span>
                      {isTurkey && <Sparkles className="w-3 h-3 text-amber-300 animate-spin" />}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Region Quick Selector Buttons (Grid 2 / 5 / 10) */}
          <div className="grid grid-cols-2 sm:grid-cols-5 lg:grid-cols-10 gap-2">
            {filteredRegions.map((reg, regIdx) => {
              const isSelected = selectedRegion.id === reg.id;
              const isTurkey = reg.id === "turkey";
              const diffScore = calculateDiffusionScore(reg, selectedYear, selectedCategory);

              return (
                <button
                  key={`reg-quick-${reg.id}-${regIdx}`}
                  onClick={() => setSelectedRegion(reg)}
                  className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between space-y-2 ${
                    isTurkey
                      ? isSelected
                        ? "bg-red-950/80 border-red-500 ring-2 ring-red-500/50 text-white shadow-lg shadow-red-500/20"
                        : "bg-slate-900/90 border-red-500/40 text-slate-200 hover:border-red-400"
                      : isSelected
                      ? "bg-slate-800/90 border-cyan-400 text-white shadow-lg shadow-cyan-500/10"
                      : "bg-slate-900/50 border-white/10 text-slate-300 hover:bg-slate-800"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xl">{reg.flag}</span>
                    <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-slate-950 text-cyan-400 border border-white/5">
                      %{reg.patentShare}
                    </span>
                  </div>
                  <div>
                    <h3 className="font-bold text-xs truncate">{isTr ? reg.name : reg.nameEn}</h3>
                    <p className="text-[10px] text-slate-400 font-mono truncate">{reg.keyHubs[0]}</p>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Detailed Breakdown Card for Selected Region */}
          <div className="bg-slate-900/90 border border-cyan-500/30 rounded-2xl p-6 lg:p-8 space-y-6 shadow-2xl backdrop-blur-xl">
            <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 border-b border-white/10 pb-6">
              <div className="flex items-center gap-4">
                <span className="text-5xl">{selectedRegion.flag}</span>
                <div>
                  <h3 className="text-2xl font-black text-white flex items-center gap-2">
                    <span>{isTr ? selectedRegion.name : selectedRegion.nameEn}</span>
                    {selectedRegion.id === "turkey" && (
                      <span className="px-2.5 py-0.5 rounded-full bg-red-600/20 border border-red-500/40 text-red-300 font-mono text-xs font-bold">
                        {isTr ? "Yerli & Milli Teknoloji Üssü" : "National Tech Hub"}
                      </span>
                    )}
                  </h3>
                  <p className="text-xs text-slate-300 font-mono mt-1">
                    {isTr ? "Yıllık Ar-Ge Sermayesi: " : "Annual R&D Capital: "}
                    <span className="text-emerald-400 font-bold">
                      {isTr ? selectedRegion.investmentVolume : selectedRegion.investmentVolumeEn}
                    </span>
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 font-mono text-xs">
                <span className="text-slate-400">{isTr ? "Düzenleyici Yaklaşım:" : "Regulatory Stance:"}</span>
                <span className="px-3 py-1 rounded-full bg-purple-950/60 border border-purple-500/30 text-purple-300 font-semibold">
                  {isTr ? selectedRegion.regulatoryStance : selectedRegion.regulatoryStanceEn}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              <div className="lg:col-span-7 space-y-4">
                <h4 className="text-xs font-bold text-cyan-400 uppercase tracking-wider font-mono flex items-center gap-2">
                  <Zap className="w-4 h-4 text-cyan-400" />
                  <span>{isTr ? "Bölgesel Stratejik Profil & İnovasyon Gücü" : "Regional Strategic Profile"}</span>
                </h4>
                <p className="text-sm text-slate-200 leading-relaxed bg-slate-950/40 p-4 rounded-xl border border-white/5">
                  {isTr ? selectedRegion.description : selectedRegion.descriptionEn}
                </p>

                {/* Key Hubs */}
                <div className="space-y-2 pt-2">
                  <span className="text-xs font-mono text-slate-400 uppercase font-semibold flex items-center gap-1.5">
                    <Building2 className="w-3.5 h-3.5 text-blue-400" />
                    <span>{isTr ? "Bölgesel Ana İnovasyon & Teknoloji Merkezleri (Hubs):" : "Key Regional Innovation Hubs:"}</span>
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {selectedRegion.keyHubs.map((hub, hIdx) => (
                      <span
                        key={`hub-${hub}-${hIdx}`}
                        className="px-3 py-1.5 rounded-xl bg-slate-800/80 border border-white/10 text-slate-200 font-mono text-xs flex items-center gap-1.5"
                      >
                        <MapPin className="w-3.5 h-3.5 text-red-400" />
                        <span>{hub}</span>
                      </span>
                    ))}
                  </div>
                </div>

                {/* Dominant Technologies */}
                <div className="space-y-2 pt-2">
                  <span className="text-xs font-mono text-slate-400 uppercase font-semibold flex items-center gap-1.5">
                    <Cpu className="w-3.5 h-3.5 text-emerald-400" />
                    <span>{isTr ? "Bölgenin Yön Verdiği İleri Teknolojiler:" : "Dominant Technologies:"}</span>
                  </span>
                  <p className="text-xs font-mono text-amber-300 bg-slate-950/60 p-3 rounded-xl border border-amber-500/20 leading-relaxed">
                    {isTr ? selectedRegion.dominantTech : selectedRegion.dominantTechEn}
                  </p>
                </div>
              </div>

              <div className="lg:col-span-5 space-y-4">
                {/* Lead Categories */}
                <div className="bg-slate-950/60 border border-white/10 rounded-xl p-5 space-y-3">
                  <h4 className="text-xs font-bold text-amber-400 uppercase tracking-wider font-mono flex items-center gap-2">
                    <Award className="w-4 h-4 text-amber-400" />
                    <span>{isTr ? "Dünya Lideri Olduğu Kategoriler" : "Leading Innovation Categories"}</span>
                  </h4>

                  <div className="space-y-2">
                    {selectedRegion.leadCategories.map((cat, cIdx) => (
                      <div
                        key={`cat-lead-${cat}-${cIdx}`}
                        className="flex items-center justify-between p-2.5 rounded-lg bg-slate-900 border border-white/5 font-mono text-xs"
                      >
                        <span className="text-slate-200 font-semibold">{cat}</span>
                        <span className="text-[10px] text-emerald-400 font-bold uppercase flex items-center gap-1">
                          <Check className="w-3 h-3 text-emerald-400" />
                          <span>{isTr ? "Lider" : "Leader"}</span>
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Key Mega Projects */}
                <div className="bg-slate-950/60 border border-cyan-500/20 rounded-xl p-5 space-y-3">
                  <h4 className="text-xs font-bold text-cyan-300 uppercase tracking-wider font-mono flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-cyan-300" />
                    <span>{isTr ? "2026-2060 Öne Çıkan Mega Projeleri" : "Highlighted 2026-2060 Mega Projects"}</span>
                  </h4>

                  <ul className="space-y-2 text-xs font-mono text-slate-300">
                    {(isTr ? selectedRegion.keyProjects : selectedRegion.keyProjectsEn).map((proj, idx) => (
                      <li key={idx} className="flex items-start gap-2 bg-slate-900/60 p-2 rounded-lg border border-white/5">
                        <span className="text-cyan-400 font-bold">›</span>
                        <span>{proj}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>

            {/* Region Milestone Correlation */}
            <div className="pt-4 border-t border-white/10 space-y-3">
              <h4 className="text-xs font-bold text-slate-300 font-mono uppercase tracking-wider">
                {isTr
                  ? `Bu Bölgenin Öncülük Ettiği İlgili Takvim Dönüm Noktaları (${selectedRegion.name}):`
                  : `Relevant Timeline Milestones Driven by this Region (${selectedRegion.nameEn}):`}
              </h4>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {safeMilestones
                  .filter((m) => selectedRegion.leadCategories.includes(m.category))
                  .slice(0, 3)
                  .map((m, mIdx) => (
                    <div
                      key={`${m.year}-${m.title}-${mIdx}`}
                      onClick={() => onSelectMilestone(m)}
                      className="p-3.5 rounded-xl bg-slate-950/80 border border-white/10 hover:border-cyan-500/50 transition-all cursor-pointer space-y-1 group"
                    >
                      <div className="flex items-center justify-between text-xs font-mono">
                        <span className="text-cyan-400 font-bold group-hover:text-cyan-300">{m.year}</span>
                        <span className="text-[10px] text-slate-400">{m.category}</span>
                      </div>
                      <h5 className="text-xs font-bold text-white line-clamp-1">{m.title}</h5>
                      <p className="text-[11px] text-slate-400 line-clamp-2">{m.description}</p>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ================= ALL REGIONS GRID TAB ================= */}
      {activeTab === "grid" && !isCompareMode && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredRegions.map((reg, regIdx) => {
            const isTurkey = reg.id === "turkey";
            return (
              <div
                key={`reg-grid-${reg.id}-${regIdx}`}
                className={`p-5 rounded-2xl border flex flex-col justify-between space-y-4 transition-all ${
                  isTurkey
                    ? "bg-slate-900/95 border-red-500/50 shadow-xl shadow-red-500/10"
                    : "bg-slate-900/70 border-white/10 hover:border-cyan-500/40"
                }`}
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-3xl">{reg.flag}</span>
                      <div>
                        <h3 className="font-bold text-white text-base">{isTr ? reg.name : reg.nameEn}</h3>
                        <p className="text-[11px] text-emerald-400 font-mono">
                          {isTr ? reg.investmentVolume : reg.investmentVolumeEn}
                        </p>
                      </div>
                    </div>
                    <span className="px-2.5 py-1 rounded-full bg-slate-950 text-cyan-400 border border-white/10 text-xs font-mono font-bold">
                      %{reg.patentShare} Patent
                    </span>
                  </div>

                  <p className="text-xs text-slate-300 line-clamp-3 leading-relaxed">
                    {isTr ? reg.description : reg.descriptionEn}
                  </p>

                  <div className="space-y-1.5 font-mono text-xs">
                    <span className="text-[10px] text-slate-400 uppercase font-bold">
                      {isTr ? "Ana Merkezler:" : "Key Hubs:"}
                    </span>
                    <div className="flex flex-wrap gap-1">
                      {reg.keyHubs.map((h, hIdx) => (
                        <span key={`grid-h-${h}-${hIdx}`} className="px-2 py-0.5 rounded bg-slate-800 border border-white/5 text-[11px] text-slate-300">
                          {h}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => {
                    setSelectedRegion(reg);
                    setActiveTab("map");
                  }}
                  className="w-full py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-mono text-xs font-bold transition-all border border-white/10 cursor-pointer"
                >
                  {isTr ? "Haritada İncele & Detaylar" : "Inspect on Map & Details"}
                </button>
              </div>
            );
          })}
        </div>
      )}

      {/* ================= REGION COMPARISON MODE ================= */}
      {(activeTab === "compare" || isCompareMode) && (
        <div className="space-y-6 bg-slate-900/90 border border-amber-500/30 rounded-2xl p-6 lg:p-8 backdrop-blur-xl">
          <div className="flex items-center justify-between border-b border-white/10 pb-4 font-mono">
            <h3 className="text-lg font-bold text-amber-400 flex items-center gap-2 uppercase">
              <ArrowRightLeft className="w-5 h-5 text-amber-400" />
              <span>{isTr ? "Bölgesel İnovasyon Karşılaştırma Analizi" : "Regional Innovation Comparison"}</span>
            </h3>
            <span className="text-xs text-slate-400">
              {isTr ? "İki farklı havzayı yan yana kıyaslayın" : "Compare two regions side by side"}
            </span>
          </div>

          {/* Region Selector Pickers */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 font-mono text-xs">
            <div className="space-y-1.5">
              <label className="text-slate-400 font-bold uppercase">{isTr ? "1. BÖLGE:" : "1ST REGION:"}</label>
              <select
                value={selectedRegion.id}
                onChange={(e) => {
                  const reg = REGION_DATA.find((r) => r.id === e.target.value);
                  if (reg) setSelectedRegion(reg);
                }}
                className="w-full bg-slate-950 border border-cyan-500/40 text-cyan-300 font-bold rounded-xl p-3 focus:outline-none"
              >
                {REGION_DATA.map((r, rIdx) => (
                  <option key={`opt-r1-${r.id}-${rIdx}`} value={r.id}>
                    {r.flag} {isTr ? r.name : r.nameEn}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-slate-400 font-bold uppercase">{isTr ? "2. BÖLGE:" : "2ND REGION:"}</label>
              <select
                value={compareRegion?.id || REGION_DATA[1].id}
                onChange={(e) => {
                  const reg = REGION_DATA.find((r) => r.id === e.target.value);
                  if (reg) setCompareRegion(reg);
                }}
                className="w-full bg-slate-950 border border-purple-500/40 text-purple-300 font-bold rounded-xl p-3 focus:outline-none"
              >
                {REGION_DATA.map((r, rIdx) => (
                  <option key={`opt-r2-${r.id}-${rIdx}`} value={r.id}>
                    {r.flag} {isTr ? r.name : r.nameEn}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Comparison Side-by-Side Tables */}
          {compareRegion && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
              {/* Region 1 Card */}
              <div className="bg-slate-950/80 border border-cyan-500/30 rounded-xl p-5 space-y-4 font-mono text-xs">
                <div className="flex items-center gap-3 border-b border-white/10 pb-3">
                  <span className="text-3xl">{selectedRegion.flag}</span>
                  <div>
                    <h4 className="font-bold text-white text-sm">{isTr ? selectedRegion.name : selectedRegion.nameEn}</h4>
                    <p className="text-cyan-400 font-bold">{isTr ? selectedRegion.investmentVolume : selectedRegion.investmentVolumeEn}</p>
                  </div>
                </div>

                <div className="space-y-2">
                  <span className="text-slate-400 font-bold">{isTr ? "Patent Payı:" : "Patent Share:"}</span>
                  <div className="w-full bg-slate-900 rounded-full h-3 border border-white/10 overflow-hidden">
                    <div
                      className="bg-cyan-400 h-full rounded-full transition-all duration-500"
                      style={{ width: `${Math.min(selectedRegion.patentShare * 2, 100)}%` }}
                    />
                  </div>
                  <span className="text-cyan-300 font-bold">{selectedRegion.patentShare}%</span>
                </div>

                <div className="space-y-1">
                  <span className="text-slate-400 font-bold">{isTr ? "Düzenleyici Yaklaşım:" : "Regulatory Stance:"}</span>
                  <p className="text-slate-200 bg-slate-900 p-2 rounded border border-white/5">
                    {isTr ? selectedRegion.regulatoryStance : selectedRegion.regulatoryStanceEn}
                  </p>
                </div>

                <div className="space-y-1">
                  <span className="text-slate-400 font-bold">{isTr ? "Dominant Teknolojiler:" : "Dominant Tech:"}</span>
                  <p className="text-amber-300 bg-slate-900 p-2.5 rounded border border-white/5 leading-relaxed">
                    {isTr ? selectedRegion.dominantTech : selectedRegion.dominantTechEn}
                  </p>
                </div>
              </div>

              {/* Region 2 Card */}
              <div className="bg-slate-950/80 border border-purple-500/30 rounded-xl p-5 space-y-4 font-mono text-xs">
                <div className="flex items-center gap-3 border-b border-white/10 pb-3">
                  <span className="text-3xl">{compareRegion.flag}</span>
                  <div>
                    <h4 className="font-bold text-white text-sm">{isTr ? compareRegion.name : compareRegion.nameEn}</h4>
                    <p className="text-purple-400 font-bold">{isTr ? compareRegion.investmentVolume : compareRegion.investmentVolumeEn}</p>
                  </div>
                </div>

                <div className="space-y-2">
                  <span className="text-slate-400 font-bold">{isTr ? "Patent Payı:" : "Patent Share:"}</span>
                  <div className="w-full bg-slate-900 rounded-full h-3 border border-white/10 overflow-hidden">
                    <div
                      className="bg-purple-400 h-full rounded-full transition-all duration-500"
                      style={{ width: `${Math.min(compareRegion.patentShare * 2, 100)}%` }}
                    />
                  </div>
                  <span className="text-purple-300 font-bold">{compareRegion.patentShare}%</span>
                </div>

                <div className="space-y-1">
                  <span className="text-slate-400 font-bold">{isTr ? "Düzenleyici Yaklaşım:" : "Regulatory Stance:"}</span>
                  <p className="text-slate-200 bg-slate-900 p-2 rounded border border-white/5">
                    {isTr ? compareRegion.regulatoryStance : compareRegion.regulatoryStanceEn}
                  </p>
                </div>

                <div className="space-y-1">
                  <span className="text-slate-400 font-bold">{isTr ? "Dominant Teknolojiler:" : "Dominant Tech:"}</span>
                  <p className="text-amber-300 bg-slate-900 p-2.5 rounded border border-white/5 leading-relaxed">
                    {isTr ? compareRegion.dominantTech : compareRegion.dominantTechEn}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
