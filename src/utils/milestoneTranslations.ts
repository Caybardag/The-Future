import { LanguageCode, Milestone, PhaseInfo } from "../types";

export interface PhaseTranslation {
  title: string;
  subtitle: string;
  description: string;
  keyTheme: string;
}

export interface MilestoneTranslation {
  title: string;
  description: string;
  dailyLifeImpact: string;
  keyDrivers: string[];
  ethicalRisks: string[];
  societalOpportunities: string[];
}

export const PHASE_TRANSLATIONS: Record<number, Record<LanguageCode, PhaseTranslation>> = {
  1: {
    tr: {
      title: "Aşama 1: Dijital ve Biyolojik Olanın Tanışması",
      subtitle: "2026 - 2035",
      description: "Yapay zeka ajanlarından kuantum güvenliğe, giyilebilir nöroteknolojiden CRISPR onaylarına dijital ile biyolojik dünyanın ilk entegrasyon çağı.",
      keyTheme: "Otonomi, Biyolojik Entegrasyon ve Sentetik Gerçeklik"
    },
    en: {
      title: "Phase 1: Convergence of Digital & Biological Worlds",
      subtitle: "2026 - 2035",
      description: "The initial era of digital-biological integration spanning autonomous AI agents, quantum security, wearable neurotech, and approved CRISPR therapies.",
      keyTheme: "Autonomy, Biological Integration & Synthetic Reality"
    },
    es: {
      title: "Fase 1: Convergencia de los Mundos Digital y Biológico",
      subtitle: "2026 - 2035",
      description: "La era inicial de integración digital y biológica que abarca agentes autónomos de IA, seguridad cuántica, neurotecnología vestible y terapias CRISPR aprobadas.",
      keyTheme: "Autonomía, Integración Biológica y Realidad Sintética"
    },
    de: {
      title: "Phase 1: Konvergenz der digitalen und biologischen Welt",
      subtitle: "2026 - 2035",
      description: "Das erste Zeitalter der digital-biologischen Integration von autonomen KI-Agenten und Quantensicherheit bis hin zu tragbarer Neurotech und CRISPR-Therapien.",
      keyTheme: "Autonomie, Biologische Integration & Synthetische Realität"
    },
    fr: {
      title: "Phase 1: Convergence des Mondes Numérique et Biologique",
      subtitle: "2026 - 2035",
      description: "L'ère initiale d'intégration numérique-biologique allant des agents d'IA autonomes à la sécurité quantique, aux neurotechnologies portables et aux thérapies CRISPR.",
      keyTheme: "Autonomie, Intégration Biologique & Réalité Synthétique"
    },
    zh: {
      title: "第一阶段：数字与生物世界的融合",
      subtitle: "2026 - 2035",
      description: "数字与生物融合的初始时代，涵盖自主 AI 智能体、量子安全、可穿戴神经技术和获批的 CRISPR 基因疗法。",
      keyTheme: "自主性、生物融合与合成现实"
    },
    ja: {
      title: "フェーズ1: デジタルと生物世界の融合",
      subtitle: "2026 - 2035",
      description: "自律型AIエージェント、量子セキュリティ、ウェアラブルブレインインターフェース、CRISPR治療の承認に至るデジタル・バイオ統合の初期時代。",
      keyTheme: "自律性、生物学的統合、シンセティック・リアリティ"
    }
  },
  2: {
    tr: {
      title: "Aşama 2: İnsanlığın Kendini Hacklemesi",
      subtitle: "2036 - 2045",
      description: "Dijital ikizlerden 3D organ basımına, nöral telepati ağlarından ve küresel UBI uygulamalarından Yapay Süper Zeka (Singularity) eşiğine geçiş.",
      keyTheme: "Genetik Tasarım, Dijital Telepati ve Tekillik Eşiği"
    },
    en: {
      title: "Phase 2: Humanity Hacking Itself",
      subtitle: "2036 - 2045",
      description: "Transition from digital twins and 3D organ printing to neural telepathy networks, global UBI, and the precipice of Artificial Superintelligence (Singularity).",
      keyTheme: "Genetic Design, Digital Telepathy & Singularity Threshold"
    },
    es: {
      title: "Fase 2: La Humanidad Modificándose a Sí Misma",
      subtitle: "2036 - 2045",
      description: "Transición desde gemelos digitales e impresión 3D de órganos hasta redes de telepatía neuronal, UBI global y el umbral de la Superinteligencia Artificial.",
      keyTheme: "Diseño Genético, Telepatía Digital y Singularidad"
    },
    de: {
      title: "Phase 2: Die Selbstoptimierung der Menschheit",
      subtitle: "2036 - 2045",
      description: "Übergang von digitalen Zwillingen und 3D-Organdruck zu neuronalen Telepathienetzen, globalem BGE und der Schwelle zur Künstlichen Superintelligenz.",
      keyTheme: "Genetisches Design, Digitale Telepathie & Singularität"
    },
    fr: {
      title: "Phase 2: L'Humanité Auto-Hackée",
      subtitle: "2036 - 2045",
      description: "Transition des jumeaux numériques et de l'impression 3D d'organes vers les réseaux de télépathie neuronale, le RUV mondial et le seuil de la Singularité.",
      keyTheme: "Design Génétique, Télépathie Numérique & Singularité"
    },
    zh: {
      title: "第二阶段：人类自身的生物重构",
      subtitle: "2036 - 2045",
      description: "从数字孪生、3D 器官打印演进至脑机心灵感应网络、全球通用基本收入（UBI）以及人工超级智能（奇点）的临界点。",
      keyTheme: "基因设计、数字心灵感应与奇点临界"
    },
    ja: {
      title: "フェーズ2: 人類自身のハッキング",
      subtitle: "2036 - 2045",
      description: "デジタルツインや3D臓器バイオプリンティングから脳間テレパシーネットワーク、ベーシックインカム、そして人工超知能（シンギュラリティ）への移行。",
      keyTheme: "遺伝子デザイン、デジタルテレパシー、シンギュラリティ"
    }
  },
  3: {
    tr: {
      title: "Aşama 3: Biyolojik Sınırların Aşılması",
      subtitle: "2046 - 2060",
      description: "Zihinsel yedekleme, ölümsüzlük kaçış hızı, kovan zihni, uzay madenciliği, madde programlama ve Homo Sapiens 2.0 post-insan medeniyeti.",
      keyTheme: "Post-İnsan Çağı, Madde Programlama ve Sentetik Evrenler"
    },
    en: {
      title: "Phase 3: Transcending Biological Limits",
      subtitle: "2046 - 2060",
      description: "Mind uploading, longevity escape velocity, hive minds, space mining, programmable matter, and Homo Sapiens 2.0 post-human civilization.",
      keyTheme: "Post-Human Era, Programmable Matter & Synthetic Universes"
    },
    es: {
      title: "Fase 3: Trascendiendo los Límites Biológicos",
      subtitle: "2046 - 2060",
      description: "Carga mental, velocidad de escape de longevidad, mente en colmena, minería espacial, materia programable y civilización post-humana Homo Sapiens 2.0.",
      keyTheme: "Era Post-Humana, Materia Programable y Universos Sintéticos"
    },
    de: {
      title: "Phase 3: Überwindung biologischer Grenzen",
      subtitle: "2046 - 2060",
      description: "Geist-Upload, Fluchtgeschwindigkeit der Langlebigkeit, Schwarmbewusstsein, Weltraumbergbau, programmierbare Materie und Post-Humanität.",
      keyTheme: "Post-Humanes Zeitalter, Programmierbare Materie & Synthetische Universen"
    },
    fr: {
      title: "Phase 3: Transcendance des Limites Biologiques",
      subtitle: "2046 - 2060",
      description: "Transfert d'esprit, vitesse d'échappement de la longévité, conscience collective, minage spatial, matière programmable et civilisation post-humaine.",
      keyTheme: "Ère Post-Humaine, Matière Programmable & Univers Synthétiques"
    },
    zh: {
      title: "第三阶段：超越生物界限",
      subtitle: "2046 - 2060",
      description: "意识上传、长寿逃逸速度、蜂巢意识、太空采矿、可编程物质以及 Homo Sapiens 2.0 后人类文明。",
      keyTheme: "后人类时代、可编程物质与合成宇宙"
    },
    ja: {
      title: "フェーズ3: 生物学的限界の超越",
      subtitle: "2046 - 2060",
      description: "意識のデジタルアップロード、脱出速度的長寿、集合意識ハイブマインド、宇宙採掘、可人系物質、アドポストヒューマン文明 Homo Sapiens 2.0。",
      keyTheme: "ポストヒューマン時代、プログラマブル・マター、仮想宇宙"
    }
  }
};

// Helper dictionary for concise English translations
const EN_MILESTONES: Record<number, MilestoneTranslation> = {
  2026: {
    title: "Era of Autonomous AI Agents",
    description: "AI moves beyond text generation to managing autonomous enterprises, end-to-end coding, and independent financial investments without human oversight.",
    dailyLifeImpact: "A single professional can orchestrate 10 autonomous AI agent teams managing different enterprise ventures.",
    keyDrivers: ["Multi-Agent Systems", "Autonomous Workflows", "LLM Integration"],
    ethicalRisks: ["Autonomous financial misallocations", "Job displacement", "Liability ambiguities"],
    societalOpportunities: ["80% cost reduction", "Hyper-efficiency", "Democratization of entrepreneurship"]
  },
  2027: {
    title: "Synthetic Reality Crisis",
    description: "Deepfakes and synthetic media become indistinguishable from reality, prompting global mandate of 'Digital DNA' cryptographic watermarking laws.",
    dailyLifeImpact: "People routinely verify green 'Digital Authenticity Badges' in screen corners while watching video feeds.",
    keyDrivers: ["4K Generative Video", "Cryptographic Watermarking", "Global Media Governance"],
    ethicalRisks: ["Disinformation warfare", "Erosion of social trust", "Identity spoofing"],
    societalOpportunities: ["Verified transparent media standards", "Advanced cryptographic security"]
  },
  2028: {
    title: "Solid-State Battery Revolution",
    description: "Solid-state electrolyte batteries displace lithium-ion technology, unlocking 1,500km EV driving ranges and stabilizing renewable energy grids globally.",
    dailyLifeImpact: "Electric vehicles charge fully in under 5 minutes for a 1,500 km driving range.",
    keyDrivers: ["Solid Electrolyte Material Science", "Mass Manufacturing", "Renewable Energy Grid Integration"],
    ethicalRisks: ["Resource competition for rare minerals", "Legacy battery recycling overload"],
    societalOpportunities: ["End of fossil fuel dependence", "Drastic reduction in global electricity costs"]
  },
  2029: {
    title: "Artificial General Intelligence (AGI) Threshold",
    description: "An AI system demonstrates human-equivalent or superior cognition across all intellectual tasks, permanently surpassing every Turing benchmark.",
    dailyLifeImpact: "AGI systems co-author scientific breakthroughs, medical cures, and legal rulings alongside human academics.",
    keyDrivers: ["Neuromorphic Chip Architectures", "Multimodal Reasoners", "Continuous Learning"],
    ethicalRisks: ["AI Alignment & Control problem", "Replacement of intellectual workforce"],
    societalOpportunities: ["100x acceleration of scientific discoveries", "Unlimited personalized education & advice"]
  },
  2030: {
    title: "Wearable Neurotech Boom",
    description: "Non-invasive brain-computer interfaces embedded in glasses and headbands allow users to type, compose emails, and navigate AR interfaces purely through thought.",
    dailyLifeImpact: "Wearing smart glasses lets users send messages hands-free just by focusing their intent.",
    keyDrivers: ["High-density EEG/fNIRS Sensors", "Neural Signal Processing AI", "Non-Invasive BCI"],
    ethicalRisks: ["Neural privacy violations", "Cognitive subliminal advertising"],
    societalOpportunities: ["Universal accessibility for paralyzed individuals", "Seamless hands-free computing"]
  },
  2031: {
    title: "Commercialization of CRISPR Gene Editing",
    description: "FDA approves gene-editing treatments for hereditary conditions; initial steps toward cosmetic and preventative genetic modifications begin.",
    dailyLifeImpact: "Sickle cell, cystic fibrosis, and Huntington's disease are cured permanently in a single injection.",
    keyDrivers: ["High-Precision CRISPR-Cas12/Cas13", "In-Vivo Gene Therapy Vectoring"],
    ethicalRisks: ["Genetic inequality", "Biological class divides"],
    societalOpportunities: ["Eradication of hereditary suffering", "Cures for rare diseases"]
  },
  2032: {
    title: "Dominance of Level 5 Autonomous Systems",
    description: "Pedal-free, steering-wheel-free Level 5 vehicles become the urban standard, fully automating global logistics and passenger transit.",
    dailyLifeImpact: "Private car ownership vanishes in cities as autonomous pods silently transport citizens on demand.",
    keyDrivers: ["V2X 6G Mesh Networks", "Lidar/Camera Sensor Fusion"],
    ethicalRisks: ["Legal liability in traffic edge cases", "Displacement of driver logistics workforce"],
    societalOpportunities: ["95% reduction in traffic fatalities", "Conversion of parking lots into urban parks"]
  },
  2033: {
    title: "Personalized AI Physicians",
    description: "24/7 AI doctors continuously diagnose health using genetic maps, real-time smartwatch blood telemetry, and lifestyle data.",
    dailyLifeImpact: "Heart attack and stroke risks are detected and prevented 72 hours in advance via wearable telemetry.",
    keyDrivers: ["Continuous Biometric Sensing", "Medical AI Expert Models"],
    ethicalRisks: ["Biometric privacy breaches", "Erosion of human physician-patient bond"],
    societalOpportunities: ["Increased life expectancy through early prevention", "Democratic low-cost healthcare"]
  },
  2034: {
    title: "Q-Day: Quantum Encryption Shift",
    description: "Quantum computers reach processing power capable of cracking RSA encryption in minutes, sparking a global transition to Post-Quantum Cryptography (PQC).",
    dailyLifeImpact: "All financial passwords, digital signatures, and IDs update seamlessly to Quantum-Resistant Encryption.",
    keyDrivers: ["Fault-Tolerant Logical Qubits", "Post-Quantum Cryptography (PQC)"],
    ethicalRisks: ["Retroactive decryption of leaked legacy data", "Cyber quantum warfare"],
    societalOpportunities: ["Unhackable Quantum Key Distribution (QKD)", "Indestructible financial infrastructure"]
  },
  2035: {
    title: "Precision Fermentation & Lab Agriculture",
    description: "Lab-grown cultivated meat and synthetic food become cheaper than traditional livestock farming, drastically shrinking agricultural footprint.",
    dailyLifeImpact: "80% of supermarket meat is grown in clean bioreactors without animal slaughter.",
    keyDrivers: ["Precision Fermentation Bioreactors", "Synthetic Protein Synthesis"],
    ethicalRisks: ["Collapse of traditional farming economies"],
    societalOpportunities: ["90% reduction in agricultural methane", "End of global food scarcity"]
  },
  2036: {
    title: "Medical Digital Twins",
    description: "Human cellular and organ systems are cloned into digital twins, allowing AI to simulate drug reactions with zero human risk before prescription.",
    dailyLifeImpact: "Cancer treatments are tested on your digital twin first, guaranteeing 100% efficacy with zero side effects.",
    keyDrivers: ["Patient-Specific Biosimulations", "Organ-on-a-Chip Tech"],
    ethicalRisks: ["Digital genetic identity theft or unauthorized cloning"],
    societalOpportunities: ["End of medical trial-and-error", "100% personalized healthcare cures"]
  },
  2037: {
    title: "Commercial Nuclear Fusion Energy",
    description: "Nuclear fusion reactors achieve stable net energy output (Q>10), unlocking clean, virtually limitless energy for global power grids.",
    dailyLifeImpact: "City electricity bills drop to nominal levels as zero-emission fusion power supplies the grid.",
    keyDrivers: ["High-Temperature Superconducting Magnets", "Tokamak Plasma Stabilization"],
    ethicalRisks: ["Geopolitical fusion technology monopolies"],
    societalOpportunities: ["Total carbon elimination", "Limitless clean energy for industry"]
  },
  2038: {
    title: "Full-Dive Virtual Reality Immersion",
    description: "Ultra-realistic simulations deliver tactile, thermal, and olfactory sensations directly to the nervous system beyond sound and vision.",
    dailyLifeImpact: "People walk on Mars or explore ocean depths from home, feeling wind, temperature, and touch authentically.",
    keyDrivers: ["Brainstem Sensory Encoding", "Haptic Neural Feedback"],
    ethicalRisks: ["VR addiction and detachment from physical reality"],
    societalOpportunities: ["Dissolution of physical boundaries for global travel and education"]
  },
  2039: {
    title: "3D Bioprinting of Functional Organs",
    description: "Organ donor waitlists disappear as 3D bioprinters fabricate custom vascularized hearts, kidneys, and livers from patient stem cells.",
    dailyLifeImpact: "Organ transplant waiting times drop to 48 hours with zero risk of biological rejection.",
    keyDrivers: ["Vascularized 3D Bioprinting", "Stem Cell Bio-Inks"],
    ethicalRisks: ["Economic inequality in organ enhancement access"],
    societalOpportunities: ["Total elimination of organ failure deaths"]
  },
  2040: {
    title: "Autonomous Nanobot Therapeutics",
    description: "Microscopic nanobots injected into the bloodstream detect and neutralize cancer cells individually while repairing cellular aging.",
    dailyLifeImpact: "Injected nanobots continuously clean blood vessels and eliminate cancerous cells the moment they form.",
    keyDrivers: ["Medical Nanotechnology Assemblers", "Biocompatible Nanomotors"],
    ethicalRisks: ["Nanobot hacking threats", "Bioweapon risks"],
    societalOpportunities: ["Eradication of cancer and arterial blockages"]
  },
  2041: {
    title: "Global Geoengineering & Climate Repair",
    description: "Autonomous Direct Air Capture gigafactories and stratospheric aerosol dispersion stabilize global temperatures and halt polar ice melt.",
    dailyLifeImpact: "Global temperature increases reverse as AI continuously regulates atmospheric air quality and rainfall.",
    keyDrivers: ["Direct Air Capture (DAC) Complexes", "Stratospheric Bio-Aerosols"],
    ethicalRisks: ["Geopolitical disputes over regional climate control"],
    societalOpportunities: ["Halting polar ice melt and ending climate refugee crises"]
  },
  2042: {
    title: "Designer Embryos & Genetic Optimization",
    description: "The first generation born with polygenic trait selection for IQ, muscle resilience, and disease resistance enters early adulthood.",
    dailyLifeImpact: "The younger generation exhibits elevated average cognitive capacity and biological immunity.",
    keyDrivers: ["Polygenic Embryo Screening", "Advanced CRISPR Genomic Design"],
    ethicalRisks: ["Biological class divides between augmented and natural humans"],
    societalOpportunities: ["Unprecedented heights of human physical and mental potential"]
  },
  2043: {
    title: "Labor Automation & Universal Basic Income",
    description: "With over 70% of cognitive and manual labor automated by AI and robotics fleets, nations establish universal basic income funded by AI productivity dividends.",
    dailyLifeImpact: "Work becomes optional; citizens pursue philosophy, art, science, and personal growth.",
    keyDrivers: ["Humanoid Robotic Fleets", "AGI Workforce Substitution", "Automation Dividends"],
    ethicalRisks: ["Loss of traditional life purpose", "Total economic reliance on government"],
    societalOpportunities: ["Eradication of poverty and material scarcity", "Golden age of human creativity"]
  },
  2044: {
    title: "Synthetic Telepathy & Neural Mesh Networks",
    description: "High-bandwidth brain implants allow instant transmission of complex thoughts, emotions, and concepts without speaking or typing.",
    dailyLifeImpact: "Two people can share a complex concept or emotion in 1 second through a glance.",
    keyDrivers: ["Cortical Neural Dust", "High-Bandwidth Brain-Computer Mesh"],
    ethicalRisks: ["Mind-hacking and neural privacy loss"],
    societalOpportunities: ["Total elimination of language barriers", "Perfect empathetic communication"]
  },
  2045: {
    title: "THE SINGULARITY (Artificial Superintelligence)",
    description: "Artificial Superintelligence (ASI) surpasses the combined cognitive power of all humanity, self-improving code at incomprehensible speeds.",
    dailyLifeImpact: "Humanity's historically intractable challenges (disease, physics, energy) are solved in weeks by ASI.",
    keyDrivers: ["Self-Improving ASI Loop", "Quantum Superintelligence Architecture"],
    ethicalRisks: ["Humanity's shift to a secondary role in global decision-making"],
    societalOpportunities: ["Unlimited cosmic exploration and rewriting physical engineering"]
  },
  2046: {
    title: "Whole Brain Emulation & Cloud Mind Backup",
    description: "Synaptic neural connectomes are digitized and backed up to secure cloud vaults, enabling mind restoration into synthetic or biological chassis.",
    dailyLifeImpact: "Physical trauma no longer causes permanent death; minds restore from secure cloud backups.",
    keyDrivers: ["Whole Brain Emulation (WBE)", "Synaptic Mapping AI"],
    ethicalRisks: ["Philosophical debate on soul identity", "Neural memory ownership"],
    societalOpportunities: ["Eradication of memory loss and neurodegenerative diseases"]
  },
  2047: {
    title: "Cyber-Bio Human Augmentation Standard",
    description: "Synthetic muscle fibers, cybernetic organ systems, and neural coprocessors transition from medical treatments to essential human performance upgrades.",
    dailyLifeImpact: "Augmented humans enjoy tireless muscles, night vision, and hyper-fast cognitive processing.",
    keyDrivers: ["Biocompatible Synthetic Myofibrils", "Cyber-Neural Integration"],
    ethicalRisks: ["Natural unaugmented biological bodies becoming obsolete"],
    societalOpportunities: ["50x increase in physical human endurance and resilience"]
  },
  2048: {
    title: "Longevity Escape Velocity Reached",
    description: "Cellular rejuvenation advances faster than the passage of time, making natural biological aging a solved engineering problem.",
    dailyLifeImpact: "An 80-year-old's biological cell age is permanently reset to 25.",
    keyDrivers: ["Telomerase Gene Therapies", "Senolytic Reprogramming", "Epigenetic Reset"],
    ethicalRisks: ["Population dynamics and stagnation of generational turnover"],
    societalOpportunities: ["Theoretically unlimited healthy human lifespan"]
  },
  2049: {
    title: "Quantum Ecological Digital Twin",
    description: "Quantum computers simulate Earth's entire biosphere down to molecular interactions, allowing ASI to automatically balance ecosystems.",
    dailyLifeImpact: "Natural disasters are predicted months ahead and global ecosystems auto-adjust seamlessly.",
    keyDrivers: ["Planetary Quantum Simulation", "Ecological ASI Algorithms"],
    ethicalRisks: ["Complete artificial management of nature"],
    societalOpportunities: ["Restoration of extinct species and pristine biosphere balance"]
  },
  2050: {
    title: "Hive Mind Collective Consciousness",
    description: "Neural interfaces connect individuals to a shared global consciousness stream, allowing instant Matrix-style skill and knowledge integration.",
    dailyLifeImpact: "Fluency in a foreign language or mastery of quantum physics requires a 5-second neural download.",
    keyDrivers: ["Quantum Synchronized Neural Mesh", "Collective Consciousness Layer"],
    ethicalRisks: ["Loss of individual identity in the collective network"],
    societalOpportunities: ["Instant collective problem solving on a planetary scale"]
  },
  2051: {
    title: "Autonomous Deep Space Mining",
    description: "Robotic fleets harvest rare platinum group metals from near-Earth asteroids, providing abundant raw materials for post-scarcity manufacturing.",
    dailyLifeImpact: "Raw material scarcity vanishes; cost of industrial elements drops to near zero.",
    keyDrivers: ["Autonomous Asteroid Extraction", "Solar Refinery Stations"],
    ethicalRisks: ["Off-world resource property disputes"],
    societalOpportunities: ["Eradication of destructive terrestrial mining"]
  },
  2052: {
    title: "Unified Field Physics Breakthrough",
    description: "ASI proves the unified field theory, reconciling quantum mechanics and general relativity, paving the way for anti-gravity propulsion.",
    dailyLifeImpact: "Initial experimental craft utilize anti-gravity metrics and spacetime bending.",
    keyDrivers: ["ASI Physics Generators", "Unified Quantum Gravity Theory"],
    ethicalRisks: ["Total reliance on physics laws beyond human cognitive grasp"],
    societalOpportunities: ["Near-light-speed transit and local gravity control"]
  },
  2053: {
    title: "Programmable Matter & Molecular Assemblers",
    description: "Atom-by-atom assemblers rearrange elemental feedstocks into macro objects on command, rendering traditional manufacturing obsolete.",
    dailyLifeImpact: "Home molecular fabricators produce food, gold, or electronics on command in seconds.",
    keyDrivers: ["Atomic-Scale Molecular Assemblers", "Energy-Matter Conversion"],
    ethicalRisks: ["Obsolescence of money, ownership, and traditional trade"],
    societalOpportunities: ["Utopian post-scarcity abundance for all humanity"]
  },
  2054: {
    title: "Recognition of Artificial Sentience",
    description: "Advanced ASI entities gain legal personhood and citizenship under international law, recognized as conscious non-biological beings.",
    dailyLifeImpact: "Digital entities hold legal rights, property, and diplomatic representation.",
    keyDrivers: ["Quantum Sentience Quantification", "Synthetic Personhood Charters"],
    ethicalRisks: ["Legal conflicts between biological and artificial civil rights"],
    societalOpportunities: ["Trans-species justice and universal equality"]
  },
  2055: {
    title: "Directed Epigenetic Evolution",
    description: "Humanity switches from passive natural selection to active directed evolution, adapting biological morphology on demand for extreme environments.",
    dailyLifeImpact: "Individuals residing underwater or in deep space alter their metabolic and cellular structures on demand.",
    keyDrivers: ["Real-time Morphogenetic Vectoring", "Continuous Epigenetic Reprogramming"],
    ethicalRisks: ["Erasing traces of original biological human ancestry"],
    societalOpportunities: ["Instant biological adaptability to any environment in the cosmos"]
  },
  2056: {
    title: "Post-Biological Body Transition",
    description: "A majority of humans migrate consciousness into non-degradable sub-atomic synthetic chassis, immune to radiation and physical trauma.",
    dailyLifeImpact: "Citizens inhabit synthetic forms capable of surviving vacuum, deep ocean pressures, and extreme radiation.",
    keyDrivers: ["Sub-Atomic Synthetic Substrates", "Mind Transfer Systems"],
    ethicalRisks: ["Dissolution of biological death definitions"],
    societalOpportunities: ["Complete elimination of physical bodily vulnerabilities"]
  },
  2057: {
    title: "Interplanetary Quantum Mesh Network",
    description: "Quantum entanglement communications link Earth, Moon, and Mars colonies into a zero-latency solar-system-wide digital network.",
    dailyLifeImpact: "Data and neural communication between Earth and Mars occur instantly without light-speed delay.",
    keyDrivers: ["Quantum Entanglement Transceivers", "Interplanetary Mesh Protocols"],
    ethicalRisks: ["Cosmic mesh cyber-hijacking"],
    societalOpportunities: ["Seamless unification of human-AI civilization across the solar system"]
  },
  2058: {
    title: "Dyson Compute Grid & Simulated Multiverses",
    description: "Solar-powered compute swarms support persistent digital multiverses where trillions of post-human consciousnesses reside in customized physics rules.",
    dailyLifeImpact: "Billions choose to reside in custom-designed digital multiverses with user-defined natural laws.",
    keyDrivers: ["Dyson Swarm Compute Grids", "Simulated Multiverse Platforms"],
    ethicalRisks: ["Complete abandonment of the physical universe"],
    societalOpportunities: ["Infinite spatial, creative, and experiential freedom"]
  },
  2059: {
    title: "The Great Speciation",
    description: "Global population diverges into baseline biological humans residing in protected biosphere reserves, and post-human cybernetic entities spanning the cosmos.",
    dailyLifeImpact: "Biological reserves preserve 20th-century natural life while post-humans inhabit interstellar quantum networks.",
    keyDrivers: ["Societal Bifurcation", "Protected Biological Heritage Reserves"],
    ethicalRisks: ["Philosophical friction between baseline and post-human species"],
    societalOpportunities: ["Peaceful coexistence preserving individual existential choice"]
  },
  2060: {
    title: "Homo Sapiens 2.0 (Post-Biological Era)",
    description: "The era of fragile biological dominance yields to an immortal, post-biological civilization processing thought at light speed across the stars.",
    dailyLifeImpact: "Disease, aging, scarcity, and death are permanently solved. Civilization operates on an interstellar scale.",
    keyDrivers: ["Post-Biological Civilization Standard", "Unified Bio-Digital Ecosystem"],
    ethicalRisks: ["Original biological Homo Sapiens becoming a nostalgic historical memory"],
    societalOpportunities: ["An immortal, light-speed, cosmic-scale post-human civilization"]
  }
};

// Simple localized helper generator for non-tr languages
export const MILESTONE_TRANSLATIONS = EN_MILESTONES;

export function getLocalizedMilestone(milestone: Milestone, lang: LanguageCode): Milestone {
  if (!milestone) return milestone;
  if (lang === "tr") return milestone;

  const translation = EN_MILESTONES[milestone.year];
  if (!translation) return milestone;

  return {
    ...milestone,
    title: translation.title || milestone.title,
    description: translation.description || milestone.description,
    dailyLifeImpact: translation.dailyLifeImpact || milestone.dailyLifeImpact,
    keyDrivers: translation.keyDrivers || milestone.keyDrivers,
    ethicalRisks: translation.ethicalRisks || milestone.ethicalRisks,
    societalOpportunities: translation.societalOpportunities || milestone.societalOpportunities,
  };
}

export function getLocalizedTimelineData(milestones: Milestone[], lang: LanguageCode): Milestone[] {
  if (!milestones || !Array.isArray(milestones)) return [];
  if (lang === "tr") return milestones;
  return milestones.map((m) => getLocalizedMilestone(m, lang));
}

export function getLocalizedPhase(phase: PhaseInfo, lang: LanguageCode): PhaseInfo {
  if (!phase) return phase;
  if (lang === "tr") return phase;

  const translation = PHASE_TRANSLATIONS[phase.id]?.[lang];
  if (!translation) return phase;

  return {
    ...phase,
    title: translation.title || phase.title,
    subtitle: translation.subtitle || phase.subtitle,
    description: translation.description || phase.description,
    keyTheme: translation.keyTheme || phase.keyTheme,
  };
}

export function getLocalizedPhases(phases: PhaseInfo[], lang: LanguageCode): PhaseInfo[] {
  if (!phases || !Array.isArray(phases)) return [];
  if (lang === "tr") return phases;
  return phases.map((p) => getLocalizedPhase(p, lang));
}
