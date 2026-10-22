import React, { useState } from "react";
import {
  X,
  Sparkles,
  Clock,
  ShieldAlert,
  Bot,
  Briefcase,
  Search,
  ArrowRight,
  Zap,
  BookOpen,
  Compass,
  CheckCircle2
} from "lucide-react";
import { useLanguage } from "../context/LanguageContext";
import { LanguageCode } from "../types";

interface InteractiveGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectFeatureView?: (viewId: string) => void;
  onStartNarratorTour?: () => void;
}

interface GuideSection {
  id: string;
  title: string;
  badge: string;
  icon: React.ReactNode;
  summary: string;
  steps: string[];
  keyHighlight: string;
  viewTarget?: string;
}

const LOCALIZED_GUIDE: Record<LanguageCode, {
  headerBadge: string;
  subtitle: string;
  title: string;
  searchPlaceholder: string;
  categoriesLabel: string;
  stepByStepLabel: string;
  tryFeatureQuestion: string;
  goToScreenBtn: string;
  footerAcademicNote: string;
  closeBtn: string;
  sections: GuideSection[];
}> = {
  tr: {
    headerBadge: "PLATFORM REHBERİ",
    subtitle: "Kullanım Kılavuzu & İpuçları",
    title: "Gelecek Simülasyonunu Nasıl Kullanırsınız?",
    searchPlaceholder: "Rehberde arayın (örn: Çelişki, Senaryo, Fazlar, AI...)",
    categoriesLabel: "Kategoriler",
    stepByStepLabel: "Adım Adım Kullanım Talimatı:",
    tryFeatureQuestion: "Bu özelliği şimdi denemek ister misiniz?",
    goToScreenBtn: "Ekranına Git",
    footerAcademicNote: "Tüm simülasyon araçları 2026—2060 dönemi için akademik modellere dayalıdır.",
    closeBtn: "Anladım, Kapat",
    sections: [
      {
        id: "timeline",
        title: "1. Zaman Çizelgesi ve Fazlar (2026—2060)",
        badge: "TEMEL GEZİNTİ",
        icon: <Clock className="w-5 h-5 text-blue-400" />,
        summary: "Geleceğin 16 kritik kırılma noktasını kronolojik sırayla, kategorilerine ve fazlarına (Phase 1, 2, 3) göre inceleyin.",
        steps: [
          "Üst menüden 'Phase 01', 'Phase 02' veya 'Phase 03' filtrelerini kullanarak teknolojinin olgunlaşma aşamalarını seçin.",
          "Arama çubuğuna 'Kuantum', 'Biyoloji', 'AGI' yazarak ilgili kırılımları anında süzün.",
          "Kartın üzerine tıklayarak detaylı 'Matematiksel Entropi', 'Nöro-Biyolojik Katman' ve 'Akademik Kaynaklar' panelini açın."
        ],
        keyHighlight: "İpucu: Sayfanın altındaki ▶ Oynat butonuna basarak Zaman Çizelgesi'ni otomatize edilmiş simülasyon modunda izleyebilirsiniz.",
        viewTarget: "timeline"
      },
      {
        id: "conflicts",
        title: "2. Çelişki Uyarıcısı (Conflict Detector)",
        badge: "OTOMATİK ANALİZ",
        icon: <ShieldAlert className="w-5 h-5 text-rose-400" />,
        summary: "İki farklı teknolojik gelişme arasında fiziksel sınırlamalar, termodinamik enerji darboğazları veya hukuki paradokslar oluştuğunda sistem otomatik tespit eder.",
        steps: [
          "⚠️ Rozeti taşıyan kilometre taşlarına dikkat edin (örn. 2029 Veri Merkezi Enerjisi vs 2031 Karbon Sıfır Hedefi).",
          "Kart detayını açtığınızda kırmızı renkli 'ÇELİŞKİ UYARICISI' kutusunu göreceksiniz.",
          "'Çelişen Km Taşını İncele' butonuna basarak çelişkinin diğer tarafındaki yılı doğrudan analiz edebilirsiniz."
        ],
        keyHighlight: "Önemli: Çelişki gerekçeleri fiziki ve hukuki kısıtlamalara dayalı akademik simülasyon mantığıyla hesaplanır.",
        viewTarget: "timeline"
      },
      {
        id: "scenarios",
        title: "3. Senaryo Transformatörü (Baz, İyimser, Distopik)",
        badge: "DİNAMİK GELECEK",
        icon: <Sparkles className="w-5 h-5 text-purple-400" />,
        summary: "Aynı kilometre taşının toplumsal entegrasyon biçimine göre 3 farklı alternatif geleceğe nasıl dönüştüğünü görün.",
        steps: [
          "Üst kontrol panelinden [Baz Senaryo], [İyimser Senaryo (Ütopya)] veya [Distopik Senaryo (Risk)] modlarından birini seçin.",
          "İyimser modda açık kaynak denetim ve etik otonomi ön plana çıkar, olasılıklar ve kamu faydası artar.",
          "Distopik modda şirket monopolleri ve biyo-gözetim vurgulanır, otonomi indeksi yükselirken riskler derinleşir."
        ],
        keyHighlight: "Sağ alttaki Değişim Günlüğü (Change Log) toast bildirimi, senaryo değiştirdiğinizde hangi değerlerin neden değiştiğini anlık özetler.",
        viewTarget: "timeline"
      },
      {
        id: "persona_chat",
        title: "4. Zaman Yolcusu & Gelecek Sohbeti",
        badge: "CANLI SOHBET",
        icon: <Bot className="w-5 h-5 text-amber-400" />,
        summary: "2030, 2045 ve 2060 insan modelleriyle canlı nöral sohbet gerçekleştirin.",
        steps: [
          "Üst menüden veya alt bardan 'Zaman Yolcusu' sekmesine geçin.",
          "Gelecek yılı ve konuşmak istediğiniz insan modelini seçin.",
          "O dönemin teknolojisi, yaşamı ve felsefesi hakkında doğrudan sorular sorun."
        ],
        keyHighlight: "İpucu: 2060 insanına otonom yaşamı ve yapay zeka entegrasyonunu sorun.",
        viewTarget: "persona_chat"
      },
      {
        id: "job_risk",
        title: "5. Meslek Risk Analizörü & Kelebek Etkisi",
        badge: "GELECEK VE KARİYER",
        icon: <Briefcase className="w-5 h-5 text-emerald-400" />,
        summary: "Kendi mesleğinizin 2026—2060 otonomlaşma riskini ölçün ve teknolojik kırılımların kelebek etkilerini izleyin.",
        steps: [
          "'Meslek Riski' sekmesinde ünvanınızı aratın ve yapay zeka tarafından ikame edilme / dönüşüm oranını görün.",
          "'Kelebek Etkisi' sekmesinde ise tek bir mikro-kararın küresel ölçekte tetiklediği dalga etkilerini görselleştirin."
        ],
        keyHighlight: "Önerilen uyum yeteneklerini inceleyerek geleceğin mesleki yetkinliklerini şimdiden planlayabilirsiniz.",
        viewTarget: "job_risk"
      }
    ]
  },
  en: {
    headerBadge: "PLATFORM GUIDE",
    subtitle: "User Manual & Feature Tips",
    title: "How to Navigate the Future Simulation",
    searchPlaceholder: "Search guide (e.g. Conflict, Scenario, Phases, AI...)",
    categoriesLabel: "Categories",
    stepByStepLabel: "Step-by-Step Instructions:",
    tryFeatureQuestion: "Would you like to try this feature now?",
    goToScreenBtn: "Go to Screen",
    footerAcademicNote: "All simulation tools are based on academic models for the 2026—2060 period.",
    closeBtn: "Got it, Close",
    sections: [
      {
        id: "timeline",
        title: "1. Timeline & Phases (2026—2060)",
        badge: "CORE NAVIGATION",
        icon: <Clock className="w-5 h-5 text-blue-400" />,
        summary: "Explore 16 critical future milestones chronologically, organized by categories and maturity phases (Phase 1, 2, 3).",
        steps: [
          "Use the 'Phase 01', 'Phase 02', or 'Phase 03' filters in the top menu to select technology maturity stages.",
          "Type 'Quantum', 'Biology', or 'AGI' into the search bar to instantly filter milestones.",
          "Click any milestone card to open the detailed 'Mathematical Entropy', 'Neuro-Biological Layer', and 'Academic Citations' panel."
        ],
        keyHighlight: "Tip: Click the ▶ Play button at the bottom to watch the timeline in an automated simulation mode.",
        viewTarget: "timeline"
      },
      {
        id: "conflicts",
        title: "2. Conflict Detector",
        badge: "AUTOMATED ANALYSIS",
        icon: <ShieldAlert className="w-5 h-5 text-rose-400" />,
        summary: "The system automatically flags physical constraints, thermodynamic energy bottlenecks, or legal paradoxes between concurrent technologies.",
        steps: [
          "Look out for milestone cards marked with the ⚠️ badge (e.g., 2029 Data Center Energy vs 2031 Net-Zero Targets).",
          "Open the card details to view the red 'CONFLICT DETECTOR' alert box.",
          "Click 'Examine Conflicting Milestone' to instantly jump to and analyze the opposing year."
        ],
        keyHighlight: "Note: Conflict logic is computed using academic simulation logic based on physical and legal constraints.",
        viewTarget: "timeline"
      },
      {
        id: "scenarios",
        title: "3. Scenario Transformer (Baseline, Optimistic, Dystopian)",
        badge: "DYNAMIC FUTURES",
        icon: <Sparkles className="w-5 h-5 text-purple-400" />,
        summary: "Observe how a single milestone diverges into 3 alternative futures based on societal adoption paths.",
        steps: [
          "Select [Baseline], [Optimistic (Utopian)], or [Dystopian (High Risk)] from the top control bar.",
          "In Optimistic mode, open-source governance and ethical safeguards boost probabilities and public utility.",
          "In Dystopian mode, corporate monopolies and bio-surveillance deepen systemic risks while AI autonomy surges."
        ],
        keyHighlight: "The bottom-right Change Log toast notification immediately explains why values shifted whenever you switch scenarios.",
        viewTarget: "timeline"
      },
      {
        id: "persona_chat",
        title: "4. Time Traveler & Future Persona Chat",
        badge: "LIVE CHAT",
        icon: <Bot className="w-5 h-5 text-amber-400" />,
        summary: "Have direct, immersive neural conversations with simulated humans from 2030, 2045, and 2060.",
        steps: [
          "Switch to the 'Time Traveler' tab in the navigation.",
          "Select a target year and a simulated future persona.",
          "Ask direct questions about their society, daily life, and technological horizon."
        ],
        keyHighlight: "Tip: Ask the 2060 persona about autonomous lifestyle and AI integration.",
        viewTarget: "persona_chat"
      },
      {
        id: "job_risk",
        title: "5. Career Automation Risk & Butterfly Effect",
        badge: "FUTURE & CAREER",
        icon: <Briefcase className="w-5 h-5 text-emerald-400" />,
        summary: "Evaluate your occupation's automation risk across 2026—2060 and visualize macro butterfly effect cascades.",
        steps: [
          "Search for your job title in the 'Career Risk' tab to inspect replacement and transformation scores.",
          "Open the 'Butterfly Effect' view to visualize how single micro-events trigger global ripple effects."
        ],
        keyHighlight: "Review recommended adaptation skills to future-proof your career path today.",
        viewTarget: "job_risk"
      }
    ]
  },
  es: {
    headerBadge: "GUÍA DE LA PLATAFORMA",
    subtitle: "Manual de Usuario y Consejos",
    title: "Cómo Navegar por la Simulación del Futuro",
    searchPlaceholder: "Buscar en la guía (ej. Conflicto, Escenario, Fases, IA...)",
    categoriesLabel: "Categorías",
    stepByStepLabel: "Instrucciones Paso a Paso:",
    tryFeatureQuestion: "¿Quieres probar esta función ahora?",
    goToScreenBtn: "Ir a Pantalla",
    footerAcademicNote: "Todas las herramientas se basan en modelos académicos para el período 2026-2060.",
    closeBtn: "Entendido, Cerrar",
    sections: [
      {
        id: "timeline",
        title: "1. Línea de Tiempo y Fases (2026—2060)",
        badge: "NAVEGACIÓN PRINCIPAL",
        icon: <Clock className="w-5 h-5 text-blue-400" />,
        summary: "Explore 16 hitos futuros clave en orden cronológico por categoría y fase de madurez.",
        steps: [
          "Filtre por 'Fase 01', 'Fase 02' o 'Fase 03' en el menú superior.",
          "Busque términos como 'Cuántica' o 'AGI' para filtrar instantáneamente.",
          "Haga clic en una tarjeta para ver datos de entropía matemática y citas académicas."
        ],
        keyHighlight: "Consejo: Presione ▶ Reproducir para ver la simulación en modo automatizado.",
        viewTarget: "timeline"
      },
      {
        id: "conflicts",
        title: "2. Detector de Conflictos",
        badge: "ANÁLISIS AUTOMÁTICO",
        icon: <ShieldAlert className="w-5 h-5 text-rose-400" />,
        summary: "Detecta paradojas físicas o legales entre tecnologías simultáneas.",
        steps: [
          "Identifique las tarjetas marcadas con la insignia ⚠️.",
          "Examine los detalles del cuadro de alerta de conflicto en rojo.",
          "Haga clic en 'Examinar Hito en Conflicto' para analizar el año opuesto."
        ],
        keyHighlight: "Nota: Los conflictos se calculan con modelos de restricción física y legal.",
        viewTarget: "timeline"
      },
      {
        id: "scenarios",
        title: "3. Transformador de Escenarios",
        badge: "FUTUROS DINÁMICOS",
        icon: <Sparkles className="w-5 h-5 text-purple-400" />,
        summary: "Alterne entre los modos Base, Optimista y Distópico para ver diferentes evoluciones.",
        steps: [
          "Seleccione [Escenario Base], [Optimista] o [Distópico] en el panel superior.",
          "El modo Optimista destaca gobernanza abierta y seguridad ética.",
          "El modo Distópico resalta monopolios corporativos y vigilancia digital."
        ],
        keyHighlight: "La notificación en la esquina inferior derecha explica cada cambio de valor en tiempo real.",
        viewTarget: "timeline"
      },
      {
        id: "persona_chat",
        title: "4. Simulador de Predicción IA",
        badge: "SIMULACIÓN EN VIVO",
        icon: <Bot className="w-5 h-5 text-amber-400" />,
        summary: "Pruebe hipótesis sobre el futuro con el motor de IA.",
        steps: [
          "Pase a la pestaña 'Simulador IA' en la navegación.",
          "Escriba preguntas como '¿Qué pasa si las baterías cuánticas llegan en 2035?'.",
          "Obtenga análisis de impacto inmediato en la sociedad."
        ],
        keyHighlight: "Consejo: Pruebe hipótesis personalizadas para ver el impacto social en tiempo real.",
        viewTarget: "persona_chat"
      },
      {
        id: "job_risk",
        title: "5. Riesgo de Automatización Laboral",
        badge: "FUTURO Y CARRERA",
        icon: <Briefcase className="w-5 h-5 text-emerald-400" />,
        summary: "Analice el riesgo de reemplazo de su ocupación y efectos mariposa.",
        steps: [
          "Busque su puesto en 'Riesgo Laboral' para ver el porcentaje de automatización.",
          "Abra 'Efecto Mariposa' para ver el impacto en cascada de microdecisiones."
        ],
        keyHighlight: "Revise las habilidades de adaptación recomendadas para asegurar su futuro.",
        viewTarget: "job_risk"
      }
    ]
  },
  de: {
    headerBadge: "PLATTFORM-LEITFADEN",
    subtitle: "Benutzerhandbuch & Tipps",
    title: "Navigieren in der Zukunftssimulation",
    searchPlaceholder: "In Anleitung suchen (z.B. Konflikt, Szenario, Phasen, KI...)",
    categoriesLabel: "Kategorien",
    stepByStepLabel: "Schritt-für-Schritt-Anleitung:",
    tryFeatureQuestion: "Möchten Sie diese Funktion jetzt ausprobieren?",
    goToScreenBtn: "Zur Ansicht Gehen",
    footerAcademicNote: "Alle Simulationstools basieren auf akademischen Modellen für 2026–2060.",
    closeBtn: "Verstanden, Schließen",
    sections: [
      {
        id: "timeline",
        title: "1. Zeitleiste & Phasen (2026—2060)",
        badge: "HAUPTNAVIGATION",
        icon: <Clock className="w-5 h-5 text-blue-400" />,
        summary: "Erkunden Sie 16 Zukunftsknotenpunkte chronologisch nach Phasen und Kategorien.",
        steps: [
          "Nützen Sie die Filter 'Phase 01', 'Phase 02' oder 'Phase 03'.",
          "Geben Sie 'Quanten' oder 'AGI' in die Suchleiste ein.",
          "Klicken Sie auf Karten für mathematische Entropie & Quellen."
        ],
        keyHighlight: "Tipp: Drücken Sie ▶ Play, um die automatische Zeitleistensimulation zu starten.",
        viewTarget: "timeline"
      },
      {
        id: "conflicts",
        title: "2. Konflikt-Detektor",
        badge: "AUTOMATISCHE ANALYSE",
        icon: <ShieldAlert className="w-5 h-5 text-rose-400" />,
        summary: "Erkennt thermodynamische und rechtliche Engpässe zwischen Technologien.",
        steps: [
          "Achten Sie auf Meilensteine mit dem ⚠️ Symbol.",
          "Öffnen Sie Details zur Anzeige der roten Konfliktbox.",
          "Klicken Sie auf 'Konflikt analysieren', um das Gegenjahr zu prüfen."
        ],
        keyHighlight: "Hinweis: Konflikte basieren auf physikalischen und rechtlichen Simulationsmodellen.",
        viewTarget: "timeline"
      },
      {
        id: "scenarios",
        title: "3. Szenario-Transformator",
        badge: "DYNAMISCHE ZUKUNFT",
        icon: <Sparkles className="w-5 h-5 text-purple-400" />,
        summary: "Sehen Sie 3 alternative Zukünfte (Basis, Optimistisch, Dystopisch).",
        steps: [
          "Wählen Sie ein Szenario im oberen Kontrollpanel aus.",
          "Der optimistische Modus fördert Open-Source & Ethik.",
          "Der dystopische Modus zeigt Monopole & Überwachung."
        ],
        keyHighlight: "Das Änderungsprotokoll (Change Log) erklärt Werteanpassungen sofort.",
        viewTarget: "timeline"
      },
      {
        id: "persona_chat",
        title: "4. KI-Vorhersagesimulator",
        badge: "LIVE SIMULATION",
        icon: <Bot className="w-5 h-5 text-amber-400" />,
        summary: "Testen Sie eigene Zukunftshypothesen mit der KI-Engine.",
        steps: [
          "Wechseln Sie zum Reiter 'KI Simulator'.",
          "Stellen Sie Fragen wie 'Was passiert bei Quantenbatterien 2035?'.",
          "Erhalten Sie Schockwellen- und Auswirkungsanalysen."
        ],
        keyHighlight: "Tipp: Testen Sie eigene Hypothesen, um gesellschaftliche Schockwellen zu analysieren.",
        viewTarget: "persona_chat"
      },
      {
        id: "job_risk",
        title: "5. Berufsrisiko & Schmetterlingseffekt",
        badge: "ZUKUNFT & KARRIERE",
        icon: <Briefcase className="w-5 h-5 text-emerald-400" />,
        summary: "Berechnen Sie das Automatisierungsrisiko Ihres Berufs.",
        steps: [
          "Suchen Sie Ihren Beruf im Reiter 'Karriererisiko'.",
          "Nutzen Sie den Schmetterlingseffekt für globale Kaskaden."
        ],
        keyHighlight: "Prüfen Sie Anpassungsfähigkeiten für Ihre berufliche Zukunft.",
        viewTarget: "job_risk"
      }
    ]
  },
  fr: {
    headerBadge: "GUIDE DE LA PLATEFORME",
    subtitle: "Manuel d'Utilisation & Conseils",
    title: "Comment Naviguer dans la Simulation du Futur",
    searchPlaceholder: "Rechercher dans le guide (ex. Conflit, Scénario, Phases, IA...)",
    categoriesLabel: "Catégories",
    stepByStepLabel: "Instructions Pas à Pas :",
    tryFeatureQuestion: "Voulez-vous essayer cette fonctionnalité maintenant ?",
    goToScreenBtn: "Aller à l'Écran",
    footerAcademicNote: "Tous les outils sont basés sur des modèles académiques pour 2026—2060.",
    closeBtn: "Compris, Fermer",
    sections: [
      {
        id: "timeline",
        title: "1. Chronologie et Phases (2026—2060)",
        badge: "NAVIGATION PRINCIPALE",
        icon: <Clock className="w-5 h-5 text-blue-400" />,
        summary: "Examinez 16 jalons futurs majeurs par phase et catégorie.",
        steps: [
          "Filtrez par 'Phase 01', 'Phase 02' ou 'Phase 03'.",
          "Utilisez la barre de recherche pour filtrer 'Quantique' ou 'AGI'.",
          "Cliquez sur une carte pour voir les détails d'entropie et sources."
        ],
        keyHighlight: "Conseil : Appuyez sur ▶ Jouer pour lancer la simulation automatique.",
        viewTarget: "timeline"
      },
      {
        id: "conflicts",
        title: "2. Détecteur de Conflits",
        badge: "ANALYSE AUTOMATIQUE",
        icon: <ShieldAlert className="w-5 h-5 text-rose-400" />,
        summary: "Détecte les goulots d'étranglement énergétiques ou juridiques entre jalons.",
        steps: [
          "Repérez le badge ⚠️ sur les cartes de jalons.",
          "Ouvrez la carte pour voir l'alerte de conflit en rouge.",
          "Cliquez sur 'Examiner le Jalon en Conflit' pour analyser l'année opposée."
        ],
        keyHighlight: "Note : Les conflits reposent sur une logique de simulation académique.",
        viewTarget: "timeline"
      },
      {
        id: "scenarios",
        title: "3. Transformateur de Scénarios",
        badge: "FUTURS DYNAMIQUES",
        icon: <Sparkles className="w-5 h-5 text-purple-400" />,
        summary: "Visualisez 3 trajectoires futures (Base, Optimiste, Dystopique).",
        steps: [
          "Sélectionnez le mode dans la barre de contrôle supérieure.",
          "Le mode Optimiste met en avant l'open-source et l'éthique.",
          "Le mode Dystopique met l'accent sur les monopoles et la surveillance."
        ],
        keyHighlight: "Le journal des modifications explique chaque changement de valeur.",
        viewTarget: "timeline"
      },
      {
        id: "persona_chat",
        title: "4. Simulateur de Prédiction IA",
        badge: "SIMULATION EN DIRECT",
        icon: <Bot className="w-5 h-5 text-amber-400" />,
        summary: "Testez des hypothèses futures avec le moteur IA.",
        steps: [
          "Passez à l'onglet 'Simulateur IA'.",
          "Posez des questions comme 'Et si les batteries quantiques arrivent en 2035 ?'.",
          "Obtenez des analyses d'ondes de choc sociétales."
        ],
        keyHighlight: "Conseil : Testez des hypothèses personnalisées pour analyser les impacts sociétaux.",
        viewTarget: "persona_chat"
      },
      {
        id: "job_risk",
        title: "5. Risque d'Automatisation des Métiers",
        badge: "FUTUR ET CARRIÈRE",
        icon: <Briefcase className="w-5 h-5 text-emerald-400" />,
        summary: "Évaluez le risque d'automatisation de votre métier.",
        steps: [
          "Recherchez votre métier dans l'onglet 'Risque Métier'.",
          "Explorez 'Effet Papillon' pour voir les répercussions globales."
        ],
        keyHighlight: "Découvrez les compétences d'adaptation recommandées pour l'avenir.",
        viewTarget: "job_risk"
      }
    ]
  },
  zh: {
    headerBadge: "平台指南",
    subtitle: "使用手册与技巧",
    title: "如何操作未来演进模拟平台",
    searchPlaceholder: "在指南中搜索（例如：冲突、场景、阶段、AI...）",
    categoriesLabel: "分类",
    stepByStepLabel: "逐步使用说明：",
    tryFeatureQuestion: "您想现在体验此功能吗？",
    goToScreenBtn: "前往该页面",
    footerAcademicNote: "所有模拟工具均基于 2026-2060 年间的学术推演模型。",
    closeBtn: "明白了，关闭",
    sections: [
      {
        id: "timeline",
        title: "1. 时间线与发展阶段 (2026—2060)",
        badge: "核心导航",
        icon: <Clock className="w-5 h-5 text-blue-400" />,
        summary: "按时间顺序、类别和成熟阶段（阶段 1, 2, 3）探索 16 个关键未来突破点。",
        steps: [
          "使用顶部菜单的“阶段 01”、“阶段 02”或“阶段 03”筛选成熟度。",
          "在搜索框中输入“量子”、“生物”或“AGI”进行即时筛选。",
          "点击卡片可查看“数学熵”、“神经生物层”与学术文献引用。"
        ],
        keyHighlight: "提示：点击底部 ▶ 播放按钮，即可开启自动流转模拟模式。",
        viewTarget: "timeline"
      },
      {
        id: "conflicts",
        title: "2. 冲突检测器",
        badge: "自动分析",
        icon: <ShieldAlert className="w-5 h-5 text-rose-400" />,
        summary: "自动识别两个技术突破点之间的物理瓶颈、能源冲突或法律悖论。",
        steps: [
          "注意带有 ⚠️ 标记的里程碑卡片。",
          "展开卡片查看红色的“冲突警告”面板。",
          "点击“查看冲突里程碑”可直接跳转并对比另一年份。"
        ],
        keyHighlight: "注意：冲突逻辑基于物理和法律约束的学术推演模型。",
        viewTarget: "timeline"
      },
      {
        id: "scenarios",
        title: "3. 场景转换器 (基线、乐观、反乌托邦)",
        badge: "动态未来",
        icon: <Sparkles className="w-5 h-5 text-purple-400" />,
        summary: "观察同一个里程碑在 3 种不同社会融入模式下的演变。",
        steps: [
          "在顶部控制栏切换 [基线场景]、[乐观（乌托邦）] 或 [反乌托邦（高风险）]。",
          "乐观模式下，开源治理与伦理监管将提升社会红利与概率。",
          "反乌托邦模式下，巨头垄断与生物监控将加深风险。"
        ],
        keyHighlight: "右下角的变更日志通知会实时解释每次数值变化的原因。",
        viewTarget: "timeline"
      },
      {
        id: "persona_chat",
        title: "4. AI 预测模拟器",
        badge: "实时模拟",
        icon: <Bot className="w-5 h-5 text-amber-400" />,
        summary: "输入自定义假设，由 AI 实时推演时间冲击波与影响分析。",
        steps: [
          "切换至“AI 模拟器”标签页。",
          "提出假设（如：“如果 2035 年量子电池商业化会怎样？”）。",
          "系统即刻生成冲击波指标与社会影响对比。"
        ],
        keyHighlight: "提示：测试自定义未来假设，分析实时社会冲击波。",
        viewTarget: "persona_chat"
      },
      {
        id: "job_risk",
        title: "5. 职业替代风险与蝴蝶效应",
        badge: "未来与职业",
        icon: <Briefcase className="w-5 h-5 text-emerald-400" />,
        summary: "评估您的职业在 2026—2060 年间的自动化替代风险及连锁反应。",
        steps: [
          "在“职业风险”中搜索您的职位查看自动化替代率。",
          "在“蝴蝶效应”中观察微观决策引发的全球连锁反应。"
        ],
        keyHighlight: "查看推荐的适应技能，提前规划未来职业竞争力。",
        viewTarget: "job_risk"
      }
    ]
  },
  ja: {
    headerBadge: "プラットフォームガイド",
    subtitle: "取扱説明書＆ヒント",
    title: "未来シミュレーションの使い方",
    searchPlaceholder: "ガイド内を検索 (例: 葛藤, シナリオ, フェーズ, AI...)",
    categoriesLabel: "カテゴリー",
    stepByStepLabel: "ステップバイステップの使い方：",
    tryFeatureQuestion: "今すぐこの機能を試してみますか？",
    goToScreenBtn: "画面へ移動",
    footerAcademicNote: "すべてのツールは2026〜2060年の学術的モデルに基づいています。",
    closeBtn: "了解、閉じる",
    sections: [
      {
        id: "timeline",
        title: "1. タイムラインとフェーズ (2026—2060)",
        badge: "基本ナビゲーション",
        icon: <Clock className="w-5 h-5 text-blue-400" />,
        summary: "16の未来マイルストーンを時系列、カテゴリー、成熟度（フェーズ1, 2, 3）ごとに閲覧できます。",
        steps: [
          "上部メニューの「フェーズ 01」「フェーズ 02」「フェーズ 03」で絞り込みます。",
          "検索バーに「量子」「AGI」などと入力して即座にフィルタリングします。",
          "カードをクリックすると、エントロピー指標や学術論文参照を開きます。"
        ],
        keyHighlight: "ヒント：下部の ▶ プレイボタンで自動シミュレーションモードを実行できます。",
        viewTarget: "timeline"
      },
      {
        id: "conflicts",
        title: "2. 葛藤（コンフリクト）ディテクター",
        badge: "自動分析",
        icon: <ShieldAlert className="w-5 h-5 text-rose-400" />,
        summary: "2つの技術間の物理的・エネルギー的ボトルネックや法的パラドックスを自動検出します。",
        steps: [
          "⚠️ マークが付いたマイルストーンカードに注目してください。",
          "カード詳細を開くと赤色の葛藤警告ボックスが表示されます。",
          "「対立するマイルストーンを分析」をクリックして相手の年へ移動します。"
        ],
        keyHighlight: "注意：葛藤ロジックは物理的・法的制約の学術モデルに基づきます。",
        viewTarget: "timeline"
      },
      {
        id: "scenarios",
        title: "3. シナリオトランスフォーマー",
        badge: "ダイナミックな未来",
        icon: <Sparkles className="w-5 h-5 text-purple-400" />,
        summary: "社会統合のあり方によって同一マイルストーンが3つの未来に分岐します。",
        steps: [
          "上部コントロールで [ベースライン]、[楽観的]、[ディストピア的] を選択します。",
          "楽観モードではオープンソースガバナンスと倫理的安全性が高まります。",
          "ディストピアモードでは企業独占やバイオ監視のリスクが深まります。"
        ],
        keyHighlight: "右下の変更ログ通知が値の変化とその理由をリアルタイムで解説します。",
        viewTarget: "timeline"
      },
      {
        id: "persona_chat",
        title: "4. AI 予測シミュレーター",
        badge: "ライブシミュレーション",
        icon: <Bot className="w-5 h-5 text-amber-400" />,
        summary: "独自の仮説を入力して AI から衝撃波と確率分析を受け取ります。",
        steps: [
          "上部ナビゲーションで「AI シミュレーター」タブに切り替えます。",
          "「2035年に量子バッテリーが登場したら？」などの仮説を入力します。",
          "社会への影響とオトノミー指数の変化が即座に生成されます。"
        ],
        keyHighlight: "ヒント：独自の仮説をテストして、リアルタイムの社会への影響を分析します。",
        viewTarget: "persona_chat"
      },
      {
        id: "job_risk",
        title: "5. 職業自動化リスク＆バタフライエフェクト",
        badge: "未来とキャリア",
        icon: <Briefcase className="w-5 h-5 text-emerald-400" />,
        summary: "ご自身の職種の自動化リスクと微小決定が引き起こす世界的な波及効果を可視化します。",
        steps: [
          "「職業リスク」で職種を検索して代替率を確認します。",
          "「バタフライエフェクト」で1つの決定が起こす連鎖反応を観察します。"
        ],
        keyHighlight: "推奨される適応スキルを確認して将来のキャリアに備えましょう。",
        viewTarget: "job_risk"
      }
    ]
  }
};

export const InteractiveGuideModal: React.FC<InteractiveGuideModalProps> = ({
  isOpen,
  onClose,
  onSelectFeatureView,
  onStartNarratorTour,
}) => {
  const { language } = useLanguage();
  const [activeTab, setActiveTab] = useState<string>("timeline");
  const [searchQuery, setSearchQuery] = useState<string>("");

  if (!isOpen) return null;

  const content = LOCALIZED_GUIDE[language] || LOCALIZED_GUIDE["en"];
  const sections = content.sections;

  const filteredSections = sections.filter((s) =>
    s.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.summary.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.steps.some((step) => step.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const activeSection = sections.find((s) => s.id === activeTab) || filteredSections[0] || sections[0];

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-[100] flex items-center justify-center p-2 sm:p-5 bg-black/85 backdrop-blur-md animate-fadeIn font-mono"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-4xl max-h-[94dvh] sm:max-h-[90vh] bg-slate-950 border-2 border-cyan-500/40 rounded-2xl sm:rounded-3xl shadow-2xl flex flex-col overflow-hidden text-slate-100"
      >
        
        {/* HEADER */}
        <div className="p-3.5 sm:p-6 border-b border-white/10 bg-gradient-to-r from-slate-950 via-cyan-950/40 to-slate-950 flex flex-wrap items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl sm:rounded-2xl bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center shadow-lg shadow-cyan-500/10 shrink-0">
              <Compass className="w-4 h-4 sm:w-5 sm:h-5 text-cyan-400 animate-spin-slow" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-[9px] sm:text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                  {content.headerBadge}
                </span>
                <span className="text-[11px] sm:text-xs text-slate-400 font-sans truncate">{content.subtitle}</span>
              </div>
              <h2 className="text-sm sm:text-xl font-bold text-white tracking-tight truncate">
                {content.title}
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="p-1.5 sm:p-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-white/10 transition-colors cursor-pointer flex items-center gap-1 font-mono text-xs"
              aria-label="Kapat"
            >
              <X className="w-4 h-4 text-rose-400 sm:text-slate-400" />
              <span className="text-[11px] sm:text-xs hidden xs:inline">Kapat</span>
            </button>
          </div>
        </div>

        {/* SEARCH BAR */}
        <div className="px-4 sm:px-6 py-3 bg-slate-900/50 border-b border-white/5 flex items-center gap-2">
          <Search className="w-4 h-4 text-slate-400 shrink-0" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={content.searchPlaceholder}
            className="w-full bg-transparent text-xs text-white placeholder-slate-500 focus:outline-none font-sans"
          />
          {searchQuery && (
            <button onClick={() => setSearchQuery("")} className="text-xs text-slate-400 hover:text-white">
              ✕
            </button>
          )}
        </div>

        {/* CONTENT BODY */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 grid grid-cols-1 md:grid-cols-12 gap-5">
          
          {/* LEFT NAVIGATION TABS */}
          <div className="md:col-span-4 space-y-2">
            <div className="text-[10px] text-slate-400 uppercase font-bold px-2 tracking-wider">
              {content.categoriesLabel} ({filteredSections.length})
            </div>
            {filteredSections.map((sec, secIdx) => (
              <button
                key={`guide-sec-${sec.id}-${secIdx}`}
                onClick={() => setActiveTab(sec.id)}
                className={`w-full text-left p-3 rounded-2xl border transition-all flex items-start gap-3 cursor-pointer ${
                  activeTab === sec.id
                    ? "bg-cyan-950/60 border-cyan-500/60 text-white shadow-lg shadow-cyan-950/30 ring-1 ring-cyan-500/30"
                    : "bg-slate-900/60 border-white/5 text-slate-300 hover:bg-slate-900 hover:border-white/15"
                }`}
              >
                <div className="mt-0.5 shrink-0">{sec.icon}</div>
                <div className="space-y-1">
                  <div className="text-xs font-bold leading-tight line-clamp-1">{sec.title}</div>
                  <span className="inline-block text-[9px] font-bold px-1.5 py-0.5 rounded bg-slate-950 text-cyan-300 border border-white/10">
                    {sec.badge}
                  </span>
                </div>
              </button>
            ))}
          </div>

          {/* RIGHT DETAILED WALKTHROUGH PANEL */}
          <div className="md:col-span-8 bg-slate-900/80 border border-white/10 rounded-2xl p-4 sm:p-6 space-y-5 flex flex-col justify-between">
            {activeSection && (
              <div className="space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/10 pb-3">
                  <div className="flex items-center gap-2">
                    {activeSection.icon}
                    <h3 className="font-bold text-white text-sm sm:text-base">{activeSection.title}</h3>
                  </div>
                  <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/40">
                    {activeSection.badge}
                  </span>
                </div>

                <p className="text-xs text-slate-300 leading-relaxed font-sans bg-slate-950 p-3 rounded-xl border border-white/5">
                  {activeSection.summary}
                </p>

                <div className="space-y-2">
                  <h4 className="text-[11px] font-bold text-cyan-400 uppercase tracking-wider flex items-center gap-1.5">
                    <BookOpen className="w-3.5 h-3.5" />
                    <span>{content.stepByStepLabel}</span>
                  </h4>
                  <ul className="space-y-2 font-sans text-xs">
                    {activeSection.steps.map((step, idx) => (
                      <li key={`guide-step-${activeSection.id}-${idx}`} className="flex items-start gap-2 text-slate-200 bg-slate-950/50 p-2.5 rounded-lg border border-white/5">
                        <span className="w-5 h-5 rounded-full bg-cyan-500/20 text-cyan-300 font-mono text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5">
                          {idx + 1}
                        </span>
                        <span className="leading-relaxed">{step}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="text-xs text-amber-300/90 bg-amber-950/30 p-3 rounded-xl border border-amber-500/30 font-sans flex items-start gap-2">
                  <Zap className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                  <span>{activeSection.keyHighlight}</span>
                </div>
              </div>
            )}

            {/* ACTION FOOTER BUTTON inside section */}
            {activeSection?.viewTarget && onSelectFeatureView && (
              <div className="pt-3 border-t border-white/10 flex items-center justify-between gap-3">
                <span className="text-[11px] text-slate-400 font-sans">{content.tryFeatureQuestion}</span>
                <button
                  type="button"
                  onClick={() => {
                    onSelectFeatureView(activeSection.viewTarget!);
                    onClose();
                  }}
                  className="px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold flex items-center gap-2 transition-all cursor-pointer shadow-lg shadow-cyan-600/20"
                >
                  <span>{content.goToScreenBtn}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            )}

          </div>

        </div>

        {/* FOOTER */}
        <div className="p-4 border-t border-white/10 bg-slate-950 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 text-slate-400">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>{content.footerAcademicNote}</span>
          </div>
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold transition-all cursor-pointer"
          >
            {content.closeBtn}
          </button>
        </div>

      </div>
    </div>
  );
};

