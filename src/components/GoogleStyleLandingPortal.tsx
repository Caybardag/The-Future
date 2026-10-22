import React, { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Sparkles,
  Compass,
  Briefcase,
  Zap,
  ArrowRight,
  ShieldCheck,
  Globe,
  Bot,
  Play,
  Pause,
  RotateCcw,
  Layers,
  Cpu,
  Lock,
  ChevronRight,
  ChevronLeft,
  Award,
  BookOpen,
  Target,
  Clock,
  Radio,
  Volume2,
  VolumeX,
  Maximize2,
  Minimize2,
  Flame,
  Activity,
  Sliders,
  TrendingUp,
  Atom,
  Eye,
  CheckCircle2,
  FileText,
  HelpCircle,
  Video,
  Film,
  Dna,
  HeartPulse,
  BatteryCharging,
  Fingerprint,
} from "lucide-react";
import { useLanguage } from "../context/LanguageContext";
import { useAuth } from "../context/AuthContext";
import { ViewMode } from "../types";

interface GoogleStyleLandingPortalProps {
  onEnterConsole: (targetView?: ViewMode) => void;
  onOpenQuickJobRisk?: (profession: string) => void;
}

interface VideoSceneMarker {
  timeSeconds: number;
  timeFormatted: string;
  year: number;
  title: string;
  category: string;
  icon: React.ComponentType<{ className?: string }>;
  tagline: string;
  badge: string;
  color: string;
  telemetry: { label: string; value: string };
  targetView: ViewMode;
}

const VIDEO_TIMELINE_SCENES: VideoSceneMarker[] = [
  {
    timeSeconds: 0,
    timeFormatted: "00:00",
    year: 2026,
    title: "Nöral Siber Matris & Otonom Ajanlar",
    category: "Yapay Zeka & Finans",
    icon: Cpu,
    tagline: "Çok modlu otonom piyasa ve veri analitiği orkestrasyonu.",
    badge: "CANLI AĞ",
    color: "#06b6d4",
    telemetry: { label: "Ajan Otonomi Oranı", value: "%34.8" },
    targetView: "timeline",
  },
  {
    timeSeconds: 2,
    timeFormatted: "00:02",
    year: 2040,
    title: "2040 NANOBOT TEDAVİLERİ (Nanobot Therapies)",
    category: "Hücresel Biyotıp",
    icon: HeartPulse,
    tagline: "Damar içi otonom nanorobotlarla kanser ve patojen imhası.",
    badge: "HÜCRESEL TEDAVİ",
    color: "#f59e0b",
    telemetry: { label: "Hedef Doğruluğu", value: "%99.98" },
    targetView: "timeline",
  },
  {
    timeSeconds: 4,
    timeFormatted: "00:04",
    year: 2045,
    title: "2045 TEKİLLİK ÇAĞI (The Singularity)",
    category: "Süper Zeka & Kozmik Ağ",
    icon: Atom,
    tagline: "Gezegenler arası yörüngesel kuantum halkaları ve makine bilinci.",
    badge: "TEKİLLİK EŞİĞİ",
    color: "#3b82f6",
    telemetry: { label: "Bilişimsel Sıçrama", value: "10⁴ FLOP" },
    targetView: "butterfly",
  },
  {
    timeSeconds: 6,
    timeFormatted: "00:06",
    year: 2060,
    title: "2060 HOMO SAPIENS 2.0 (Transhumanizm)",
    category: "Sibernetik Evrim",
    icon: Bot,
    tagline: "Biyonik korteks, sibernetik görme ve solarpunk megakentler.",
    badge: "İNSAN 2.0",
    color: "#06b6d4",
    telemetry: { label: "Ömür Beklentisi", value: "120+ Yaş" },
    targetView: "persona_chat",
  },
  {
    timeSeconds: 8,
    timeFormatted: "00:08",
    year: 2035,
    title: "Kuantum DNA & Nöral Biyosentez",
    category: "Genetik Mühendislik",
    icon: Dna,
    tagline: "Sentetik biyoloji, yapay enzimler ve kuantum moleküler dizilim.",
    badge: "DNA SENTEZİ",
    color: "#a855f7",
    telemetry: { label: "Hata Toleransı", value: "0.001 ppm" },
    targetView: "network",
  },
  {
    timeSeconds: 10,
    timeFormatted: "00:10",
    year: 2038,
    title: "3D Biyo-Baskı Organ Üretimi (Bioprinting)",
    category: "Rejeneratif Tıp",
    icon: HeartPulse,
    tagline: "Robotik hassasiyetle yapay böbrek ve doku basımı (%108 Canlılık).",
    badge: "108% CELL VIABILITY",
    color: "#10b981",
    telemetry: { label: "Organ Uyum Oranı", value: "%100 Otolog" },
    targetView: "timeline",
  },
  {
    timeSeconds: 14,
    timeFormatted: "00:14",
    year: 2033,
    title: "Dijital DNA Güvenliği & Biyometri",
    category: "Kuantum Güvenlik",
    icon: Fingerprint,
    tagline: "Post-Kuantum şifreli iris ve dijital genom kimlik doğrulaması.",
    badge: "AUTHENTICITY SECURED",
    color: "#06b6d4",
    telemetry: { label: "Kriptografik Güç", value: "4096-bit Kyber" },
    targetView: "verification",
  },
  {
    timeSeconds: 16,
    timeFormatted: "00:16",
    year: 2030,
    title: "Katı Hal Batarya & Otonom Temiz Enerji",
    category: "Sürdürülebilir Mobilite",
    icon: BatteryCharging,
    tagline: "1000 Wh/kg katı hal pilleri ve tam otomatik yeşil üretim hatları.",
    badge: "%100 CLEAN ENERGY",
    color: "#10b981",
    telemetry: { label: "Şarj Süresi", value: "3.5 Dakika" },
    targetView: "analytics",
  },
];

interface CinematicChapter {
  id: string;
  year: number;
  eraName: string;
  title: string;
  subtitle: string;
  description: string;
  themeColor: string;
  secondaryColor: string;
  metrics: {
    label: string;
    value: string;
    sublabel: string;
  }[];
  breakthroughs: string[];
  keyQuote: string;
  audioToneFrequency: number;
}

const CINEMATIC_CHAPTERS: CinematicChapter[] = [
  {
    id: "era_1",
    year: 2026,
    eraName: "1. BÖLÜM: OTONOM AJANLAR & GÜNLÜK YAŞAM DEVRİMİ",
    title: "Yapay Zeka Sohbetten Çıkıp Hayatın İçine Giriyor",
    subtitle: "Vatandaşın Evine, İşine ve Aile Hayatına Doğrudan Dokunan Akıllı Çağ",
    description:
      "2026-2029 dönemi, karmaşık komutların yerini her vatandaşın ve ailenin kişisel işlerini, sağlık takvimini ve mesleki hazırlığını kolaylaştıran dost yapay zeka yardımcılarına bıraktığı yeni halk çağıdır.",
    themeColor: "#06b6d4",
    secondaryColor: "#3b82f6",
    metrics: [
      { label: "Vatandaş AI Erişimi", value: "%68", sublabel: "Günlük iş ve eğitimde" },
      { label: "Zaman Tasarrufu", value: "3.5x", sublabel: "Rutin bürokratik işlerde" },
      { label: "Kişisel Asistan Gücü", value: "10²⁶ FLOP", sublabel: "Ev ve cep entegrasyonu" },
    ],
    breakthroughs: [
      "Her Vatandaşa Ücretsiz Kişisel Eğitim & Kariyer Asistanı",
      "Aile Bütçesini ve Harcamaları Koruyan Akıllı Asistanlar",
      "Günlük Hukuki ve Sağlık Haklarını Basitleştiren Doğrulama Rehberleri",
    ],
    keyQuote: "Yapay zeka artık bir ayrıcalık değil; her vatandaşın ve ailenin en güvenilir yol arkadaşıdır.",
    audioToneFrequency: 220,
  },
  {
    id: "era_2",
    year: 2032,
    eraName: "2. BÖLÜM: AGİ EŞİĞİ & KUANTUM ÜSTÜNLÜK",
    title: "İnsan Zekasının Ötesinde Bir Bilişim Mimarisi",
    subtitle: "Kuantum Kriptografi & Sentetik Biyoloji Devrimi",
    description:
      "2030-2035 yılları arasında kuantum bilgisayarlar klasik süper bilgisayarların çözemediği moleküler simülasyonları saniyeler içinde çözerken; AGI (Yapay Genel Zeka) seviyesindeki modeller bilimsel keşifleri otomatikleştiriyor.",
    themeColor: "#a855f7",
    secondaryColor: "#ec4899",
    metrics: [
      { label: "AGI Yetkinlik İndeksi", value: "%78", sublabel: "Tüm bilişsel testlerde" },
      { label: "Kuantum Mantıksal Kübit", value: "10.000+", sublabel: "Hata toleranslı donanım" },
      { label: "İlaç Keşif Süresi", value: "3 Hafta", sublabel: "Klasik 10 yıla kıyasla" },
    ],
    breakthroughs: [
      "Moleküler CRISPR & mRNA Otomatik Tasarım Motorları",
      "Kuantum Sonrası Kriptografiye (PQC) Global Geçiş",
      "Otonom Robotik Fabrikalar ve Sıfır İnsan Müdahalesi",
    ],
    keyQuote: "Doğanın kanunlarını simüle etmekten, doğanın kanunlarını programlamaya geçiyoruz.",
    audioToneFrequency: 330,
  },
  {
    id: "era_3",
    year: 2042,
    eraName: "3. BÖLÜM: BİYO-DİJİTAL BÜTÜNLEŞME & TEMİZ FÜZYON",
    title: "Biyoloji ile Silikonun Sonsuz Harmonisi",
    subtitle: "Hücresel Yaşlanmanın Geri Çevrilmesi & Sınırsız Temiz Enerji",
    description:
      "2036-2045 dönemi, ticari nükleer füzyon santralleriyle sınırsız temiz enerji çağını başlatırken, nöral arayüzler ve hücresel telomer tedavileri insan biyolojisini yeniden tanımlıyor.",
    themeColor: "#10b981",
    secondaryColor: "#06b6d4",
    metrics: [
      { label: "Sağlıklı Ömür Beklentisi", value: "105+ Yaş", sublabel: "Epigenetik gençleşme" },
      { label: "Füzyon Enerjisi Payı", value: "%42", sublabel: "Küresel şebeke entegrasyonu" },
      { label: "Nöral Arayüz Bant Genişliği", value: "1 Tbps", sublabel: "Doğrudan kortikal bağlantı" },
    ],
    breakthroughs: [
      "Ticari Manyetik Tutunumlu Nükleer Füzyon Santralleri",
      "Epigenetik Yeniden Programlama ve Yaş Geriletme",
      "Bilişsel Düşünce Hızıyla Çalışan Nöral Arayüzler",
    ],
    keyQuote: "Kıtlık artık bir fizik kanunu değil; çözülmüş bir mühendislik problemidir.",
    audioToneFrequency: 440,
  },
  {
    id: "era_4",
    year: 2055,
    eraName: "4. BÖLÜM: TEKİLLİK (SINGULARITY) & POST-SCARCITY",
    title: "İnsanlığın Evrensel ve Kozmik Uyanışı",
    subtitle: "Süper Zeka (ASI) & Gezegenler Arası Uygarlık",
    description:
      "2046-2060 ufku, yapay zekanın kendi kendini katlanarak geliştirdiği Teknolojik Tekillik (Singularity) eşiğidir. İnsan bilinci dijital alt katmanlarla bütünleşirken, Dyson halkaları ve derin uzay kolonizasyonu gerçeğe dönüşüyor.",
    themeColor: "#f59e0b",
    secondaryColor: "#ef4444",
    metrics: [
      { label: "Süper Zeka Katsayısı", value: "10.000x", sublabel: "Tüm insanlığın zekası toplamı" },
      { label: "Post-Kıtlık İndeksi", value: "%94", sublabel: "Temel ihtiyaçların sıfır maliyeti" },
      { label: "Gezegenler Arası Nüfus", value: "1.2 Milyon", sublabel: "Ay ve Mars kolonileri" },
    ],
    breakthroughs: [
      "Kendi Mimarisini Tasarlayan Otonom Süper Zeka (ASI)",
      "Hafıza ve Bilinç Yedekleme Protokolleri (Mind-Upload)",
      "Gezegenler Arası Quantum Mesh İletişim Ağı",
    ],
    keyQuote: "Gelecek artık varılacak bir yer değil; içinde yaşadığımız dinamik bir gerçekliktir.",
    audioToneFrequency: 550,
  },
];

export const GoogleStyleLandingPortal: React.FC<GoogleStyleLandingPortalProps> = ({
  onEnterConsole,
  onOpenQuickJobRisk,
}) => {
  const { language } = useLanguage();
  const { currentUser, openAuthModal } = useAuth();
  const isTr = language === "tr";

  // Mode Selection: "intro_video" | "cinematic_tour" | "interactive_sandbox"
  const [portalMode, setPortalMode] = useState<"intro_video" | "cinematic_tour" | "interactive_sandbox">("intro_video");

  // Video State
  const [customVideoSrc, setCustomVideoSrc] = useState<string | null>("/intro.mp4");
  const [isVideoPlaying, setIsVideoPlaying] = useState<boolean>(true);
  const [videoCurrentTime, setVideoCurrentTime] = useState<number>(0);
  const [videoDuration, setVideoDuration] = useState<number>(18); // default ~18s intro
  const [isVideoMuted, setIsVideoMuted] = useState<boolean>(true);
  const [activeSceneIndex, setActiveSceneIndex] = useState<number>(0);
  const [isVideoAsWallpaper, setIsVideoAsWallpaper] = useState<boolean>(true);

  const videoRef = useRef<HTMLVideoElement | null>(null);

  // Initialize Video directly from server /public/intro.mp4
  useEffect(() => {
    let isMounted = true;

    async function checkServerVideo() {
      try {
        const resp = await fetch("/intro.mp4", { method: "HEAD" });
        if (resp.ok && isMounted) {
          setCustomVideoSrc("/intro.mp4");
          setIsVideoAsWallpaper(true);
        } else if (isMounted) {
          // If intro.mp4 not found on server, fallback gracefully to the hologram canvas
          setCustomVideoSrc(null);
        }
      } catch {
        if (isMounted) {
          setCustomVideoSrc(null);
        }
      }
    }

    checkServerVideo();

    return () => {
      isMounted = false;
    };
  }, []);

  // Cinematic Tour State
  const [activeChapterIndex, setActiveChapterIndex] = useState<number>(0);
  const [isPlayingTour, setIsPlayingTour] = useState<boolean>(true);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1);
  const [progressPercent, setProgressPercent] = useState<number>(0);
  const [isSoundMuted, setIsSoundMuted] = useState<boolean>(true);
  const [warpSpeedMultiplier, setWarpSpeedMultiplier] = useState<number>(1);

  // Quick Interactive Simulator State
  const [selectedJob, setSelectedJob] = useState<string>("Yazılım Mühendisi");
  const [selectedYear, setSelectedYear] = useState<number>(2030);
  const [isSimulating, setIsSimulating] = useState<boolean>(false);
  const [simResults, setSimResults] = useState<{
    riskScore: number;
    jobShift: string;
    keyBreakthrough: string;
    humanValue: string;
  }>({
    riskScore: 78,
    jobShift: "Tekil kodlayıcıdan otonom multi-agent orkestratörüne geçiş",
    keyBreakthrough: "AGI Seviyesi Çok Modlu Yazılım & Mimar Sentezi",
    humanValue: "Yüksek Seviyeli Mimari Kararlar ve İş Modeli Sezgisi",
  });

  // Canvas Refs & Interactive Mouse Coordinates
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const hologramCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const mousePosRef = useRef<{ x: number; y: number; isHover: boolean }>({
    x: -1000,
    y: -1000,
    isHover: false,
  });

  // Web Audio Context for Cinematic Sci-Fi Synth Ambience & Warp FX
  const audioCtxRef = useRef<AudioContext | null>(null);
  const oscNodeRef = useRef<OscillatorNode | null>(null);
  const gainNodeRef = useRef<GainNode | null>(null);

  const currentChapter = CINEMATIC_CHAPTERS[activeChapterIndex] || CINEMATIC_CHAPTERS[0];
  const activeVideoScene = VIDEO_TIMELINE_SCENES[activeSceneIndex] || VIDEO_TIMELINE_SCENES[0];

  // Sync Video Time with Active Scene Marker
  useEffect(() => {
    if (portalMode !== "intro_video") return;

    // Find matching scene by time
    let matchedIdx = 0;
    for (let i = VIDEO_TIMELINE_SCENES.length - 1; i >= 0; i--) {
      if (videoCurrentTime >= VIDEO_TIMELINE_SCENES[i].timeSeconds) {
        matchedIdx = i;
        break;
      }
    }
    setActiveSceneIndex(matchedIdx);
  }, [videoCurrentTime, portalMode]);

  // Handle Video Time Updates
  const handleVideoTimeUpdate = () => {
    if (videoRef.current) {
      setVideoCurrentTime(videoRef.current.currentTime);
      if (videoRef.current.duration && !isNaN(videoRef.current.duration)) {
        setVideoDuration(videoRef.current.duration);
      }
    }
  };

  const handleSeekVideo = (time: number) => {
    if (videoRef.current) {
      videoRef.current.currentTime = time;
      setVideoCurrentTime(time);
      if (!isVideoPlaying) {
        videoRef.current.play();
        setIsVideoPlaying(true);
      }
    } else {
      setVideoCurrentTime(time);
    }
  };

  const toggleVideoPlayback = () => {
    if (videoRef.current) {
      if (videoRef.current.paused) {
        videoRef.current.play();
        setIsVideoPlaying(true);
      } else {
        videoRef.current.pause();
        setIsVideoPlaying(false);
      }
    } else {
      setIsVideoPlaying(!isVideoPlaying);
    }
  };

  // Hologram Synthesizer for when custom video is not uploaded yet or as visual companion
  useEffect(() => {
    if (customVideoSrc) return; // If real video is loaded, let HTML5 video handle visuals
    const canvas = hologramCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animId: number;
    let width = (canvas.width = canvas.parentElement?.clientWidth || 800);
    let height = (canvas.height = canvas.parentElement?.clientHeight || 450);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = canvas.parentElement?.clientWidth || 800;
      height = canvas.height = canvas.parentElement?.clientHeight || 450;
    };
    window.addEventListener("resize", handleResize);

    let t = 0;

    const renderHologram = () => {
      t += 0.03;
      if (isVideoPlaying) {
        setVideoCurrentTime((prev) => {
          const next = prev + 0.03;
          return next > 18 ? 0 : next;
        });
      }

      ctx.clearRect(0, 0, width, height);

      // Deep Space / Cyber Matrix Background Grid
      ctx.fillStyle = "#050711";
      ctx.fillRect(0, 0, width, height);

      // Dynamic Grid scanlines
      ctx.strokeStyle = "rgba(6, 182, 212, 0.08)";
      ctx.lineWidth = 1;
      const gridSize = 40;
      for (let x = 0; x < width; x += gridSize) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
      }
      for (let y = 0; y < height; y += gridSize) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }

      // Draw Holographic HUD Radar Ring
      const centerX = width / 2;
      const centerY = height / 2;

      ctx.save();
      ctx.translate(centerX, centerY);

      // 1. Outer Ring
      ctx.beginPath();
      ctx.arc(0, 0, Math.min(width, height) * 0.35, 0, Math.PI * 2);
      ctx.strokeStyle = activeVideoScene.color;
      ctx.lineWidth = 2;
      ctx.setLineDash([12, 8]);
      ctx.stroke();

      // 2. Rotating Inner Reticle
      ctx.rotate(t * 0.5);
      ctx.beginPath();
      ctx.arc(0, 0, Math.min(width, height) * 0.25, 0, Math.PI * 2);
      ctx.strokeStyle = "rgba(255, 255, 255, 0.25)";
      ctx.lineWidth = 1.5;
      ctx.setLineDash([4, 12]);
      ctx.stroke();

      // 3. DNA / Molecule or Singularity Sphere Hologram
      const nodeCount = 12;
      for (let i = 0; i < nodeCount; i++) {
        const angle = (i / nodeCount) * Math.PI * 2 + t;
        const rad = Math.min(width, height) * 0.18;
        const nx = Math.cos(angle) * rad;
        const ny = Math.sin(angle * 2) * (rad * 0.6);

        ctx.beginPath();
        ctx.arc(nx, ny, 4 + Math.sin(t * 2 + i) * 2, 0, Math.PI * 2);
        ctx.fillStyle = activeVideoScene.color;
        ctx.shadowBlur = 12;
        ctx.shadowColor = activeVideoScene.color;
        ctx.fill();
        ctx.shadowBlur = 0;
      }

      ctx.restore();

      // Scanline Beam
      const beamY = ((t * 80) % height);
      ctx.fillStyle = "rgba(6, 182, 212, 0.05)";
      ctx.fillRect(0, beamY, width, 40);

      animId = requestAnimationFrame(renderHologram);
    };

    renderHologram();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", handleResize);
    };
  }, [customVideoSrc, isVideoPlaying, activeVideoScene]);

  // Play / Pause Cinematic Tour Timer
  useEffect(() => {
    if (!isPlayingTour || portalMode !== "cinematic_tour") return;

    const CHAPTER_DURATION = 9000 / playbackSpeed;
    const INTERVAL = 50;
    const increment = (INTERVAL / CHAPTER_DURATION) * 100;

    const timer = setInterval(() => {
      setProgressPercent((prev) => {
        if (prev >= 100) {
          setActiveChapterIndex((currIdx) => (currIdx + 1) % CINEMATIC_CHAPTERS.length);
          return 0;
        }
        return prev + increment;
      });
    }, INTERVAL);

    return () => clearInterval(timer);
  }, [isPlayingTour, playbackSpeed, activeChapterIndex, portalMode]);

  // Handle Sound Synthesis
  const initAudio = () => {
    if (audioCtxRef.current) return;
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      const ctx = new AudioCtx();
      audioCtxRef.current = ctx;

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = "sine";
      osc.frequency.setValueAtTime(currentChapter.audioToneFrequency, ctx.currentTime);

      gain.gain.setValueAtTime(isSoundMuted ? 0 : 0.04, ctx.currentTime);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();

      oscNodeRef.current = osc;
      gainNodeRef.current = gain;
    } catch {}
  };

  const toggleSound = () => {
    if (!audioCtxRef.current) {
      initAudio();
      setIsSoundMuted(false);
      if (gainNodeRef.current && audioCtxRef.current) {
        gainNodeRef.current.gain.setValueAtTime(0.04, audioCtxRef.current.currentTime);
      }
    } else {
      const newMuted = !isSoundMuted;
      setIsSoundMuted(newMuted);
      if (gainNodeRef.current && audioCtxRef.current) {
        gainNodeRef.current.gain.setValueAtTime(newMuted ? 0 : 0.04, audioCtxRef.current.currentTime);
      }
    }
  };

  // Update oscillator tone on chapter change
  useEffect(() => {
    if (oscNodeRef.current && audioCtxRef.current && !isSoundMuted) {
      oscNodeRef.current.frequency.setTargetAtTime(
        currentChapter.audioToneFrequency,
        audioCtxRef.current.currentTime,
        0.3
      );
    }
  }, [currentChapter, isSoundMuted]);

  // Clean up audio on unmount
  useEffect(() => {
    return () => {
      if (audioCtxRef.current) {
        audioCtxRef.current.close().catch(() => {});
      }
    };
  }, []);

  // 3D Starfield & Particle Warp Vortex Animation Engine
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animId: number;
    let width = (canvas.width = canvas.parentElement?.clientWidth || window.innerWidth);
    let height = (canvas.height = canvas.parentElement?.clientHeight || window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = canvas.parentElement?.clientWidth || window.innerWidth;
      height = canvas.height = canvas.parentElement?.clientHeight || window.innerHeight;
    };
    window.addEventListener("resize", handleResize);

    // 3D Stars in a Warp Tunnel
    const STAR_COUNT = 180;
    const stars: {
      x: number;
      y: number;
      z: number;
      baseColor: string;
      size: number;
    }[] = [];

    const colorPalette = ["#06b6d4", "#a855f7", "#3b82f6", "#10b981", "#f59e0b", "#ffffff"];

    for (let i = 0; i < STAR_COUNT; i++) {
      stars.push({
        x: (Math.random() - 0.5) * width * 2,
        y: (Math.random() - 0.5) * height * 2,
        z: Math.random() * width,
        baseColor: colorPalette[Math.floor(Math.random() * colorPalette.length)],
        size: Math.random() * 2 + 0.8,
      });
    }

    // Interactive Floating Network Nodes
    const NODE_COUNT = 35;
    const nodes: {
      x: number;
      y: number;
      vx: number;
      vy: number;
      radius: number;
      pulse: number;
    }[] = [];

    for (let i = 0; i < NODE_COUNT; i++) {
      nodes.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.6,
        vy: (Math.random() - 0.5) * 0.6,
        radius: Math.random() * 2 + 1.2,
        pulse: Math.random() * Math.PI * 2,
      });
    }

    let frame = 0;

    const render = () => {
      frame++;
      ctx.clearRect(0, 0, width, height);

      const centerX = width / 2;
      const centerY = height / 2;
      const speed = (isPlayingTour ? 2.5 * warpSpeedMultiplier : 0.8) * playbackSpeed;

      // 1. Render 3D Starfield Warp Tunnel
      for (let i = 0; i < stars.length; i++) {
        const star = stars[i];
        star.z -= speed * 2.2;

        if (star.z <= 1) {
          star.z = width;
          star.x = (Math.random() - 0.5) * width * 2;
          star.y = (Math.random() - 0.5) * height * 2;
        }

        const k = 280 / star.z;
        const px = star.x * k + centerX;
        const py = star.y * k + centerY;

        if (px >= 0 && px <= width && py >= 0 && py <= height) {
          const size = (1 - star.z / width) * star.size * 2.5;
          const alpha = Math.min(1, Math.max(0.1, (1 - star.z / width) * 1.2));

          // Draw Star Motion Trail during Warp
          if (speed > 1.5) {
            const prevK = 280 / (star.z + speed * 6);
            const prevPx = star.x * prevK + centerX;
            const prevPy = star.y * prevK + centerY;

            ctx.beginPath();
            ctx.moveTo(prevPx, prevPy);
            ctx.lineTo(px, py);
            ctx.strokeStyle = star.baseColor;
            ctx.globalAlpha = alpha * 0.7;
            ctx.lineWidth = Math.max(0.5, size * 0.8);
            ctx.stroke();
          }

          ctx.beginPath();
          ctx.arc(px, py, Math.max(0.5, size), 0, Math.PI * 2);
          ctx.fillStyle = star.baseColor;
          ctx.globalAlpha = alpha;
          ctx.fill();
        }
      }

      ctx.globalAlpha = 1;

      // 2. Render Neural Network Mesh with Mouse Attraction
      for (let i = 0; i < nodes.length; i++) {
        const node = nodes[i];
        node.x += node.vx;
        node.y += node.vy;
        node.pulse += 0.03;

        if (node.x < 0 || node.x > width) node.vx *= -1;
        if (node.y < 0 || node.y > height) node.vy *= -1;

        if (mousePosRef.current.isHover) {
          const dx = mousePosRef.current.x - node.x;
          const dy = mousePosRef.current.y - node.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 180 && dist > 1) {
            node.x += (dx / dist) * 0.8;
            node.y += (dy / dist) * 0.8;
          }
        }

        for (let j = i + 1; j < nodes.length; j++) {
          const other = nodes[j];
          const dx = node.x - other.x;
          const dy = node.y - other.y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < 140) {
            const lineAlpha = (1 - dist / 140) * 0.25;
            ctx.beginPath();
            ctx.moveTo(node.x, node.y);
            ctx.lineTo(other.x, other.y);
            ctx.strokeStyle = `rgba(6, 182, 212, ${lineAlpha})`;
            ctx.lineWidth = 0.75;
            ctx.stroke();
          }
        }

        const currentRadius = node.radius + Math.sin(node.pulse) * 0.8;
        ctx.beginPath();
        ctx.arc(node.x, node.y, Math.max(1, currentRadius), 0, Math.PI * 2);
        ctx.fillStyle = currentChapter.themeColor;
        ctx.shadowBlur = 10;
        ctx.shadowColor = currentChapter.themeColor;
        ctx.fill();
        ctx.shadowBlur = 0;
      }

      ctx.save();
      ctx.translate(centerX, centerY);
      ctx.rotate(frame * 0.003);
      ctx.beginPath();
      ctx.arc(0, 0, Math.min(width, height) * 0.38, 0, Math.PI * 2);
      ctx.strokeStyle = `${currentChapter.themeColor}15`;
      ctx.lineWidth = 2;
      ctx.setLineDash([8, 14]);
      ctx.stroke();
      ctx.restore();

      animId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", handleResize);
    };
  }, [isPlayingTour, warpSpeedMultiplier, playbackSpeed, currentChapter]);

  // Handle Quick Simulator Recalculation
  const handleQuickSimulate = (job: string, year: number) => {
    setSelectedJob(job);
    setSelectedYear(year);
    setIsSimulating(true);

    setTimeout(() => {
      let risk = 50;
      let shift = "";
      let breakthrough = "";
      let humanVal = "";

      const lower = job.toLowerCase();
      if (lower.includes("yazılım") || lower.includes("developer") || lower.includes("mühendis")) {
        risk = year >= 2035 ? 90 : year >= 2030 ? 78 : year >= 2028 ? 60 : 35;
        shift =
          year >= 2035
            ? "Kuantum-Biyo kod sentezleyicisi ve sistem mimarı"
            : "Multi-agent filo yöneticisi ve solo SaaS kurucusu";
        breakthrough =
          year >= 2030 ? "AGI Seviyesi Otonom Mimari Kodlayıcılar" : "Multi-Agent Geliştirme Ekipleri";
        humanVal = "Mimari Vizyon, Güvenlik Denetimi & Pazar İhtiyacı Sezgisi";
      } else if (lower.includes("avukat") || lower.includes("hukuk")) {
        risk = year >= 2035 ? 75 : year >= 2030 ? 62 : 30;
        shift = "Yapay zeka mevzuat denetçisi ve karmaşık dava stratejisti";
        breakthrough = "Otonom Emsal Karar & Yargıtay Muhakeme Motorları";
        humanVal = "Mahkeme İkna Gücü, İnsani Müzakere & Etik Yargı";
      } else if (lower.includes("tasarım") || lower.includes("grafik") || lower.includes("video")) {
        risk = year >= 2035 ? 88 : year >= 2030 ? 82 : 65;
        shift = "Prompt ve difüzyon operatörlüğünden bütünsel dünya kuruculuğuna";
        breakthrough = "Gerçek Zamanlı 3D & Nöromorfik Sinirsel Render";
        humanVal = "Özgün Sanatsal Anlatı, Kültürel Duyarlılık ve Duygu";
      } else if (lower.includes("doktor") || lower.includes("tıp") || lower.includes("sağlık")) {
        risk = year >= 2035 ? 55 : year >= 2030 ? 40 : 18;
        shift = "Klinik biyo-dijital ikiz yöneticisi ve genetik tedavi mimarı";
        breakthrough = "Hücresel CRISPR Sentetik İlaç & Kuantum Tanı";
        humanVal = "Cerrahi Hassasiyet, Hasta Şefkati & Kritik Yaşam Kararları";
      } else {
        risk = Math.min(95, Math.max(20, Math.round(((year - 2024) / 25) * 85)));
        shift = "Rutin görevlerden insan-makine hibrit orkestrasyonuna geçiş";
        breakthrough = "Otonom Çok Modlu AI Ajanları & Endüstriyel Robotik";
        humanVal = "Stratejik Liderlik, Empati ve İlk Prensiplerden Karar Alma";
      }

      setSimResults({
        riskScore: risk,
        jobShift: shift,
        keyBreakthrough: breakthrough,
        humanValue: humanVal,
      });
      setIsSimulating(false);
    }, 400);
  };

  const handleSelectChapter = (index: number) => {
    setActiveChapterIndex(index);
    setProgressPercent(0);
    setWarpSpeedMultiplier(2.5);
    setTimeout(() => setWarpSpeedMultiplier(1), 600);
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98, y: 12 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.96, y: -20, filter: "blur(8px)" }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      className="relative min-h-[92vh] bg-slate-950 text-white overflow-hidden rounded-3xl border border-cyan-500/30 shadow-2xl flex flex-col justify-between p-5 sm:p-8 lg:p-10 transition-colors duration-700"
      onMouseMove={(e) => {
        const rect = e.currentTarget.getBoundingClientRect();
        mousePosRef.current = {
          x: e.clientX - rect.left,
          y: e.clientY - rect.top,
          isHover: true,
        };
      }}
      onMouseLeave={() => {
        mousePosRef.current.isHover = false;
      }}
    >

      {/* 1. BACKGROUND FULL-CANVAS 3D WARP & LIVE VIDEO WALLPAPER */}
      {isVideoAsWallpaper && customVideoSrc ? (
        <video
          src={customVideoSrc}
          autoPlay
          loop
          muted
          playsInline
          className="absolute inset-0 w-full h-full object-cover pointer-events-none opacity-30 z-0 scale-105 filter blur-[1px]"
        />
      ) : (
        <canvas
          ref={canvasRef}
          className="absolute inset-0 w-full h-full pointer-events-none opacity-70 z-0"
        />
      )}

      {/* Dynamic Glowing Flares */}
      <div
        className="absolute -top-40 -left-40 w-[600px] h-[600px] rounded-full blur-[150px] pointer-events-none transition-colors duration-1000"
        style={{ backgroundColor: `${activeVideoScene.color}15` }}
      />
      <div
        className="absolute top-1/3 -right-40 w-[650px] h-[650px] rounded-full blur-[160px] pointer-events-none transition-colors duration-1000"
        style={{ backgroundColor: `${currentChapter.secondaryColor}15` }}
      />

      {/* Grid Texture Layer */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b10_1px,transparent_1px),linear-gradient(to_bottom,#1e293b10_1px,transparent_1px)] bg-[size:3rem_3rem] pointer-events-none z-0" />

      {/* 2. TOP BRAND & LIVE SCIENTIFIC TELEMETRY TICKER BAR */}
      <header className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 border-b border-white/10 pb-5">
        <div className="flex items-center gap-3">
          <div
            className="w-11 h-11 rounded-2xl flex items-center justify-center shadow-lg transition-transform duration-500 hover:scale-105"
            style={{
              background: `linear-gradient(135deg, ${activeVideoScene.color}, #3b82f6)`,
              boxShadow: `0 8px 24px -4px ${activeVideoScene.color}60`,
            }}
          >
            <Compass className="w-6 h-6 text-slate-950 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-black text-lg sm:text-xl tracking-tight text-white font-sans">
                TEKNOLOJİK EVRİM PORTALI
              </span>
              <span className="px-2.5 py-0.5 rounded-full bg-cyan-500/20 border border-cyan-500/40 text-cyan-300 font-mono text-[10px] font-bold">
                2026—2060
              </span>
            </div>
            <p className="text-[11px] font-mono text-slate-400">
              Hakemli Literatür, Nature, OpenAlex, arXiv & Google Patents Doğrulamalı Karar Destek Radarı
            </p>
          </div>
        </div>

        {/* View Toggle Tabs & Ambient Audio / Video Controls */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Mode Switcher Pill */}
          <div className="inline-flex rounded-xl bg-slate-900/90 p-1 border border-slate-800">
            <button
              onClick={() => setPortalMode("intro_video")}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-all flex items-center gap-1.5 ${
                portalMode === "intro_video"
                  ? "bg-gradient-to-r from-cyan-500 to-blue-500 text-slate-950 shadow-md"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <Film className="w-3.5 h-3.5" />
              <span>Gelecek İntro & Sinema</span>
            </button>
            <button
              onClick={() => setPortalMode("cinematic_tour")}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-all flex items-center gap-1.5 ${
                portalMode === "cinematic_tour"
                  ? "bg-cyan-500 text-slate-950 shadow-md"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <Play className="w-3 h-3" />
              <span>Hologram Turu</span>
            </button>
            <button
              onClick={() => setPortalMode("interactive_sandbox")}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-all flex items-center gap-1.5 ${
                portalMode === "interactive_sandbox"
                  ? "bg-purple-600 text-white shadow-md"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <Sliders className="w-3 h-3" />
              <span>Hızlı Simülatör</span>
            </button>
          </div>

          {/* Sound Ambience Toggle */}
          <button
            onClick={toggleSound}
            className={`p-2 rounded-xl border text-xs font-mono flex items-center gap-1.5 transition-all ${
              !isSoundMuted
                ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/40"
                : "bg-slate-900 text-slate-400 border-slate-800 hover:text-slate-200"
            }`}
            title={!isSoundMuted ? "Nöral Ambiyans Sesi Açık" : "Nöral Ambiyans Sesini Aç"}
          >
            {!isSoundMuted ? <Volume2 className="w-4 h-4 text-emerald-400 animate-pulse" /> : <VolumeX className="w-4 h-4" />}
          </button>
        </div>
      </header>

      {/* 3. MODE: INTRO VIDEO CINEMATIC THEATER */}
      {portalMode === "intro_video" ? (
        <div className="relative z-10 py-4 lg:py-6 space-y-5">
          {/* Synchronized Video Timeline Scenes Navigation Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2">
            {VIDEO_TIMELINE_SCENES.map((scene, idx) => {
              const isActive = idx === activeSceneIndex;
              const IconComp = scene.icon;
              return (
                <button
                  key={`scene-${scene.year}-${scene.timeSeconds}-${idx}`}
                  onClick={() => handleSeekVideo(scene.timeSeconds)}
                  className={`p-2.5 rounded-2xl border text-left transition-all relative overflow-hidden group cursor-pointer ${
                    isActive
                      ? "bg-slate-900/95 border-cyan-400/80 shadow-lg shadow-cyan-500/20 scale-[1.02]"
                      : "bg-slate-950/60 border-white/5 hover:border-white/20 opacity-70 hover:opacity-100"
                  }`}
                >
                  <div className="flex items-center justify-between text-[10px] font-mono mb-1">
                    <span
                      className="font-bold px-1.5 py-0.5 rounded text-[10px]"
                      style={{ color: scene.color, backgroundColor: `${scene.color}15` }}
                    >
                      {scene.timeFormatted}
                    </span>
                    <span className="text-slate-400 text-[10px]">{scene.year}</span>
                  </div>

                  <div className="flex items-center gap-1.5 mb-1">
                    <IconComp className="w-3 h-3 text-cyan-300 shrink-0" />
                    <span className="text-[11px] font-bold text-white truncate font-sans">
                      {scene.title.split("(")[0]}
                    </span>
                  </div>

                  <div className="text-[9px] text-slate-400 truncate font-mono">
                    {scene.badge}
                  </div>
                </button>
              );
            })}
          </div>

          {/* Main Video Cinema Screen (100% Unobstructed Video Display) */}
          <div className="relative rounded-3xl bg-slate-900/90 backdrop-blur-2xl border-2 border-cyan-500/30 p-3 sm:p-5 lg:p-6 shadow-2xl overflow-hidden space-y-4">
            {/* Clean Video Viewport */}
            <div className="relative rounded-2xl overflow-hidden aspect-video bg-black border border-white/10 group shadow-2xl flex items-center justify-center">
              {customVideoSrc ? (
                <video
                  ref={videoRef}
                  src={customVideoSrc}
                  autoPlay
                  loop
                  muted={isVideoMuted}
                  playsInline
                  onTimeUpdate={handleVideoTimeUpdate}
                  className="w-full h-full object-contain bg-black"
                />
              ) : (
                <canvas
                  ref={hologramCanvasRef}
                  className="w-full h-full object-cover"
                />
              )}

              {/* Minimal floating player controls */}
              <div className="absolute top-3 right-3 flex items-center gap-2 z-20">
                <button
                  onClick={toggleVideoPlayback}
                  className="p-2.5 rounded-xl bg-black/70 hover:bg-black/90 text-white backdrop-blur-md border border-white/20 transition-all cursor-pointer shadow-lg"
                  title={isVideoPlaying ? "Durdur" : "Oynat"}
                >
                  {isVideoPlaying ? <Pause className="w-4 h-4 text-cyan-400" /> : <Play className="w-4 h-4 text-emerald-400" />}
                </button>
                <button
                  onClick={() => setIsVideoMuted(!isVideoMuted)}
                  className="p-2.5 rounded-xl bg-black/70 hover:bg-black/90 text-white backdrop-blur-md border border-white/20 transition-all cursor-pointer shadow-lg"
                  title={!isVideoMuted ? "Sesi Kapat" : "Sesi Aç"}
                >
                  {!isVideoMuted ? <Volume2 className="w-4 h-4 text-emerald-400" /> : <VolumeX className="w-4 h-4 text-slate-300" />}
                </button>
              </div>

              {/* Subtle Current Timestamp Badge in corner without blocking video */}
              <div className="absolute bottom-3 left-3 bg-black/75 backdrop-blur-md px-2.5 py-1 rounded-lg border border-white/15 text-[11px] font-mono text-cyan-300 pointer-events-none flex items-center gap-1.5 z-20">
                <Radio className="w-3 h-3 text-rose-500 animate-pulse" />
                <span>{activeVideoScene.timeFormatted} • {activeVideoScene.year}</span>
              </div>
            </div>

            {/* Video Timeline Scrubber */}
            <div className="space-y-1.5 font-mono">
              <div className="flex items-center justify-between text-xs text-slate-400 px-1">
                <span className="text-cyan-400 font-bold">
                  {Math.floor(videoCurrentTime / 60)}:{(Math.floor(videoCurrentTime) % 60).toString().padStart(2, "0")}
                </span>
                <span>
                  Süre: {Math.floor(videoDuration / 60)}:{(Math.floor(videoDuration) % 60).toString().padStart(2, "0")}
                </span>
              </div>
              <input
                type="range"
                min={0}
                max={videoDuration || 18}
                step={0.1}
                value={videoCurrentTime}
                onChange={(e) => handleSeekVideo(parseFloat(e.target.value))}
                className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-400"
              />
            </div>

            {/* Dedicated Scene Information & Action Panel (Neatly placed BELOW video, NOT obstructing) */}
            <div className="rounded-2xl bg-slate-950/80 border border-white/10 p-4 sm:p-5 space-y-4">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <div className="space-y-1.5 max-w-2xl">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-[11px] font-mono font-bold uppercase tracking-widest text-cyan-300">
                      {activeVideoScene.category}
                    </span>
                    <span className="px-2 py-0.5 rounded bg-white/10 text-white text-[10px] font-mono font-bold">
                      {activeVideoScene.badge}
                    </span>
                    <span className="text-xs text-slate-400 font-mono">
                      (Sahne {activeSceneIndex + 1}/{VIDEO_TIMELINE_SCENES.length})
                    </span>
                  </div>
                  <h2 className="text-lg sm:text-2xl font-black text-white tracking-tight font-sans">
                    {activeVideoScene.title}
                  </h2>
                  <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                    {activeVideoScene.tagline}
                  </p>
                </div>

                {/* Telemetry Box */}
                <div className="bg-slate-900/90 rounded-xl border border-white/10 p-3 flex flex-col justify-center min-w-[200px] shrink-0">
                  <span className="text-[10px] font-mono uppercase text-slate-400">
                    {activeVideoScene.telemetry.label}
                  </span>
                  <span className="text-lg font-mono font-bold text-white" style={{ color: activeVideoScene.color }}>
                    {activeVideoScene.telemetry.value}
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-3 border-t border-white/10">
                <div className="flex flex-wrap items-center gap-3">
                  <button
                    type="button"
                    onClick={() => onEnterConsole(activeVideoScene.targetView)}
                    className="px-6 py-3 rounded-xl text-slate-950 font-mono font-black text-xs sm:text-sm uppercase tracking-wider shadow-xl flex items-center justify-center gap-2 transition-all transform hover:scale-[1.02] cursor-pointer"
                    style={{
                      background: `linear-gradient(135deg, ${activeVideoScene.color}, #ffffff)`,
                      boxShadow: `0 8px 24px -4px ${activeVideoScene.color}50`,
                    }}
                  >
                    <span>Bu Sahneye Git // {activeVideoScene.year} Modülü</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>

                  <button
                    type="button"
                    onClick={() => onEnterConsole("persona_chat")}
                    className="px-5 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-mono font-bold text-xs uppercase tracking-wider border border-white/10 flex items-center justify-center gap-2 transition-all cursor-pointer"
                  >
                    <Sparkles className="w-4 h-4 text-cyan-400" />
                    <span>Zaman Yolcusu ile Konuş</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : portalMode === "cinematic_tour" ? (
        /* 4. MODE: CINEMATIC TOUR REEL */
        <div className="relative z-10 py-6 lg:py-8 space-y-6">
          {/* Era Chapter Navigation Ticker */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {CINEMATIC_CHAPTERS.map((chap, idx) => {
              const isCurrent = idx === activeChapterIndex;
              return (
                <button
                  key={`chap-${chap.id}-${idx}`}
                  onClick={() => handleSelectChapter(idx)}
                  className={`p-3 rounded-2xl border text-left transition-all relative overflow-hidden group cursor-pointer ${
                    isCurrent
                      ? "bg-slate-900/90 border-cyan-500/60 shadow-lg shadow-cyan-500/10"
                      : "bg-slate-950/60 border-white/5 hover:border-white/20 opacity-70 hover:opacity-100"
                  }`}
                >
                  {isCurrent && (
                    <div
                      className="absolute left-0 bottom-0 top-0 bg-gradient-to-r from-cyan-500/20 to-transparent pointer-events-none transition-all"
                      style={{ width: `${progressPercent}%` }}
                    />
                  )}

                  <div className="flex items-center justify-between text-[10px] font-mono mb-1">
                    <span
                      className="font-bold px-1.5 py-0.5 rounded"
                      style={{
                        color: chap.themeColor,
                        backgroundColor: `${chap.themeColor}15`,
                      }}
                    >
                      {chap.year}
                    </span>
                    <span className="text-slate-500">0{idx + 1}</span>
                  </div>
                  <div className="text-xs font-bold text-white truncate font-sans">
                    {chap.title}
                  </div>
                </button>
              );
            })}
          </div>

          {/* Main Cinematic Video-Reel Hologram Screen */}
          <div className="relative rounded-3xl bg-slate-900/80 backdrop-blur-2xl border border-white/10 p-6 sm:p-10 shadow-2xl overflow-hidden space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/10 pb-4">
              <div className="flex items-center gap-2.5">
                <span
                  className="w-3 h-3 rounded-full animate-ping"
                  style={{ backgroundColor: currentChapter.themeColor }}
                />
                <span className="text-xs font-mono font-bold uppercase tracking-widest text-slate-300">
                  {currentChapter.eraName}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsPlayingTour(!isPlayingTour)}
                  className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-mono font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  {isPlayingTour ? <Pause className="w-3.5 h-3.5 text-amber-400" /> : <Play className="w-3.5 h-3.5 text-emerald-400" />}
                  <span>{isPlayingTour ? "Durdur" : "Oynat"}</span>
                </button>

                <button
                  onClick={() => setPlaybackSpeed((s) => (s === 1 ? 2 : s === 2 ? 0.5 : 1))}
                  className="px-2.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 text-xs font-mono font-bold cursor-pointer"
                  title="Oynatma Hızı"
                >
                  {playbackSpeed}x
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              <div className="lg:col-span-8 space-y-4">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs font-mono font-bold" style={{ color: currentChapter.themeColor }}>
                  <Atom className="w-4 h-4 animate-spin" />
                  <span>{currentChapter.subtitle}</span>
                </div>

                <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight font-sans leading-[1.1]">
                  {currentChapter.title}
                </h1>

                <p className="text-base sm:text-lg text-slate-300 font-sans leading-relaxed max-w-2xl">
                  {currentChapter.description}
                </p>

                <div className="p-3.5 rounded-2xl bg-slate-950/60 border border-white/5 flex items-center gap-3">
                  <Flame className="w-5 h-5 text-amber-400 shrink-0" />
                  <span className="text-xs sm:text-sm italic font-mono text-slate-300">
                    "{currentChapter.keyQuote}"
                  </span>
                </div>
              </div>

              <div className="lg:col-span-4 space-y-3">
                <div className="p-4 rounded-2xl bg-slate-950/80 border border-white/10 space-y-3">
                  <span className="text-[10px] font-mono uppercase text-slate-400 flex items-center gap-1.5">
                    <Activity className="w-3.5 h-3.5 text-cyan-400" />
                    Dönemsel Kritik Telemetri
                  </span>

                  <div className="space-y-3">
                    {currentChapter.metrics.map((m, i) => (
                      <div key={`metric-${m.label}-${i}`} className="border-b border-slate-800/80 pb-2 last:border-0 last:pb-0">
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-slate-400 font-mono">{m.label}</span>
                          <span className="text-lg font-bold font-mono text-white" style={{ color: currentChapter.themeColor }}>
                            {m.value}
                          </span>
                        </div>
                        <span className="text-[10px] text-slate-500 font-mono">{m.sublabel}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-slate-950/80 border border-white/10 space-y-2">
                  <span className="text-[10px] font-mono uppercase text-slate-400 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                    Kritik Bilimsel İlerlemeler
                  </span>
                  <div className="space-y-1.5">
                    {currentChapter.breakthroughs.map((b, i) => (
                      <div key={`breakthrough-${i}-${b.substring(0, 15)}`} className="flex items-center gap-2 text-xs font-mono text-slate-300">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                        <span className="truncate">{b}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 pt-4 border-t border-white/10">
              <div className="flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  onClick={() => onEnterConsole("timeline")}
                  className="px-8 py-3.5 rounded-2xl text-slate-950 font-mono font-black text-xs sm:text-sm uppercase tracking-wider shadow-xl flex items-center justify-center gap-2.5 transition-all transform hover:scale-[1.02] cursor-pointer"
                  style={{
                    background: `linear-gradient(135deg, ${currentChapter.themeColor}, #ffffff)`,
                    boxShadow: `0 8px 24px -4px ${currentChapter.themeColor}50`,
                  }}
                >
                  <span>Strateji Konsolunu Başlat ({currentChapter.year})</span>
                  <ArrowRight className="w-4 h-4" />
                </button>

                <button
                  type="button"
                  onClick={() => onEnterConsole("persona_chat")}
                  className="px-6 py-3.5 rounded-2xl bg-slate-800 hover:bg-slate-700 text-white font-mono font-bold text-xs uppercase tracking-wider border border-white/10 flex items-center justify-center gap-2 transition-all cursor-pointer"
                >
                  <Sparkles className="w-4 h-4 text-cyan-400" />
                  <span>Zaman Yolcusu ile Konuş</span>
                </button>
              </div>

              <div className="flex items-center justify-between sm:justify-end gap-3 text-xs font-mono text-slate-400">
                <button
                  onClick={() => handleSelectChapter((activeChapterIndex - 1 + CINEMATIC_CHAPTERS.length) % CINEMATIC_CHAPTERS.length)}
                  className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white transition-colors cursor-pointer"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <span>
                  {activeChapterIndex + 1} / {CINEMATIC_CHAPTERS.length}
                </span>
                <button
                  onClick={() => handleSelectChapter((activeChapterIndex + 1) % CINEMATIC_CHAPTERS.length)}
                  className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white transition-colors cursor-pointer"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* 5. MODE: INTERACTIVE SANDBOX WIDGET */
        <div className="relative z-10 my-4 bg-slate-900/90 backdrop-blur-xl border border-cyan-500/30 rounded-3xl p-6 lg:p-8 shadow-2xl space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-white/10 pb-4">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-cyan-400">
                <Zap className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-white font-mono uppercase tracking-wider">
                  Hızlı Gelecek Simülatörü // 10 Saniyede Dünyanızı Test Edin
                </h2>
                <p className="text-xs text-slate-400 font-sans">
                  Mesleğinizi ve hedef yılınızı seçin; anında otomasyon ve dönüşüm eğrisini görün.
                </p>
              </div>
            </div>
            <span className="text-[11px] font-mono text-cyan-300 bg-cyan-500/10 px-3 py-1 rounded-full border border-cyan-500/20">
              Canlı Etkileşimli Önizleme
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
            <div className="md:col-span-5 space-y-1.5">
              <label className="text-[11px] font-mono font-bold uppercase text-slate-300 flex items-center gap-1.5">
                <Briefcase className="w-3.5 h-3.5 text-amber-400" />
                <span>Meslek / Uzmanlık:</span>
              </label>
              <div className="flex flex-wrap gap-1.5">
                {["Yazılım Mühendisi", "Avukat", "Grafik Tasarımcı", "Doktor / Cerrah", "Finans Analisti"].map((job) => (
                  <button
                    key={`quick-job-${job}`}
                    type="button"
                    onClick={() => handleQuickSimulate(job, selectedYear)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-mono transition-all cursor-pointer ${
                      selectedJob === job
                        ? "bg-amber-500 text-slate-950 font-bold shadow-md shadow-amber-500/20"
                        : "bg-slate-950 border border-white/10 text-slate-300 hover:text-white"
                    }`}
                  >
                    {job}
                  </button>
                ))}
              </div>
            </div>

            <div className="md:col-span-4 space-y-1.5">
              <label className="text-[11px] font-mono font-bold uppercase text-slate-300 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-cyan-400" />
                <span>Hedef Yıl:</span>
              </label>
              <div className="flex items-center gap-2">
                {[2028, 2030, 2035, 2045].map((yr) => (
                  <button
                    key={`quick-yr-${yr}`}
                    type="button"
                    onClick={() => handleQuickSimulate(selectedJob, yr)}
                    className={`flex-1 py-1.5 rounded-xl text-xs font-mono font-bold transition-all cursor-pointer ${
                      selectedYear === yr
                        ? "bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20"
                        : "bg-slate-950 border border-white/10 text-slate-300 hover:text-white"
                    }`}
                  >
                    {yr}
                  </button>
                ))}
              </div>
            </div>

            <div className="md:col-span-3 flex justify-end">
              <button
                type="button"
                onClick={() => onEnterConsole("job_risk")}
                className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-amber-500 to-rose-500 hover:from-amber-400 hover:to-rose-400 text-slate-950 font-mono font-black text-xs uppercase tracking-wider shadow-lg flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                <span>Kişiye Özel Tam Dosya</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className={`grid grid-cols-1 md:grid-cols-4 gap-3.5 pt-2 transition-opacity duration-300 ${isSimulating ? "opacity-40" : "opacity-100"}`}>
            <div className="p-4 rounded-2xl bg-slate-950/90 border border-red-500/30 space-y-1">
              <span className="text-[10px] font-mono uppercase text-slate-400">Otomasyon Riski</span>
              <div className="text-2xl font-extrabold text-red-400 font-mono">
                %{simResults.riskScore}
              </div>
              <p className="text-[11px] text-slate-400 font-mono">
                {selectedYear} yılında rutin devir oranı
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-950/90 border border-cyan-500/30 space-y-1">
              <span className="text-[10px] font-mono uppercase text-slate-400">Dönüşen Rolünüz</span>
              <div className="text-xs font-bold text-cyan-300 font-sans leading-snug">
                {simResults.jobShift}
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-950/90 border border-purple-500/30 space-y-1">
              <span className="text-[10px] font-mono uppercase text-slate-400">Sektörel Kırılma</span>
              <div className="text-xs font-bold text-purple-300 font-sans leading-snug">
                {simResults.keyBreakthrough}
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-950/90 border border-emerald-500/30 space-y-1">
              <span className="text-[10px] font-mono uppercase text-slate-400">10x Değer Kazanacak Beceriniz</span>
              <div className="text-xs font-bold text-emerald-300 font-sans leading-snug">
                {simResults.humanValue}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 6. USER REGISTRATION PERKS BANNER (Conversion Section) */}
      {!currentUser ? (
        <div className="relative z-10 my-4 p-5 sm:p-7 rounded-3xl bg-gradient-to-r from-cyan-950/60 via-slate-900/90 to-purple-950/60 border border-cyan-500/30 shadow-2xl space-y-4">
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
            <div className="space-y-1.5 max-w-2xl">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-mono text-[10px] font-bold border border-emerald-500/30 uppercase flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-emerald-400" />
                  Ücretsiz Katılın • Günlük Çark & Görevlerle Kredi Kazanın
                </span>
                <span className="text-[11px] font-mono text-slate-400">100% Ücretsiz & Hızlı Giriş</span>
              </div>
              <h2 className="text-lg sm:text-xl font-black text-white font-sans tracking-tight">
                Neden Kişisel Gelecek Profilinizi Oluşturmalısınız?
              </h2>
              <p className="text-xs sm:text-sm text-slate-300 font-sans leading-relaxed">
                Yalnızca izlemekle kalmayın; kariyerinizi ve ailenizin geleceğini güvence altına alın, günlük çark ve görevlerle ücretsiz analiz kredisi kazanın.
              </p>
            </div>

            <button
              type="button"
              onClick={openAuthModal}
              className="px-7 py-4 rounded-2xl bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 text-slate-950 font-mono font-black text-xs uppercase tracking-wider shadow-xl shadow-emerald-500/20 flex items-center justify-center gap-2.5 transition-all transform hover:scale-[1.02] cursor-pointer shrink-0"
            >
              <Sparkles className="w-4 h-4 text-slate-950 fill-current" />
              <span>Ücretsiz Kayıt Ol</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-2">
            <div className="p-3 rounded-2xl bg-slate-950/70 border border-white/5 space-y-1">
              <div className="flex items-center gap-2 text-emerald-400">
                <Zap className="w-4 h-4" />
                <span className="font-mono text-xs font-bold">Günlük Çark & Reklam</span>
              </div>
              <p className="text-[10px] text-slate-400 font-sans">
                Her gün çarkı çevirerek ve reklamları izleyerek ücretsiz analiz kredisi toplayın.
              </p>
            </div>

            <div className="p-3 rounded-2xl bg-slate-950/70 border border-white/5 space-y-1">
              <div className="flex items-center gap-2 text-cyan-400">
                <Target className="w-4 h-4" />
                <span className="font-mono text-xs font-bold">Kişisel Yol Haritası</span>
              </div>
              <p className="text-[10px] text-slate-400 font-sans">
                Yaş, meslek ve hedefinize göre 2026-2040 arası adım adım eylem planı.
              </p>
            </div>

            <div className="p-3 rounded-2xl bg-slate-950/70 border border-white/5 space-y-1">
              <div className="flex items-center gap-2 text-purple-400">
                <Bot className="w-4 h-4" />
                <span className="font-mono text-xs font-bold">2060 Zaman Yolcusu AI</span>
              </div>
              <p className="text-[10px] text-slate-400 font-sans">
                Geleceğin sibernetik personelleriyle doğrudan sohbet edin ve soru sorun.
              </p>
            </div>

            <div className="p-3 rounded-2xl bg-slate-950/70 border border-white/5 space-y-1">
              <div className="flex items-center gap-2 text-amber-400">
                <Award className="w-4 h-4" />
                <span className="font-mono text-xs font-bold">Günlük Çark & Rozetler</span>
              </div>
              <p className="text-[10px] text-slate-400 font-sans">
                Gelecek çarkını çevirerek ek krediler ve nadir fütürist koleksiyon kartları toplayın.
              </p>
            </div>
          </div>
        </div>
      ) : (
        <div className="relative z-10 my-4 p-5 sm:p-7 rounded-3xl bg-gradient-to-r from-cyan-950/70 via-slate-900/95 to-blue-950/70 border border-cyan-500/30 shadow-2xl space-y-4">
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
            <div className="space-y-1.5 max-w-2xl">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="px-2.5 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 font-mono text-[10px] font-bold border border-cyan-500/30 uppercase flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-cyan-400" />
                  Kişiselleştirilmiş Gelecek Kokpiti
                </span>
                <span className="text-[11px] font-mono text-slate-400">
                  {currentUser.username || currentUser.fullName}
                </span>
              </div>
              <h2 className="text-lg sm:text-2xl font-black text-white font-sans tracking-tight">
                Hoş Geldiniz, {currentUser.username || currentUser.fullName}!
              </h2>
              <p className="text-xs sm:text-sm text-slate-300 font-sans leading-relaxed">
                2026–2060 Canlı Zaman Çizelgesi,{" "}
                <strong>{currentUser.age ? `${currentUser.age} yaş grubu` : ""}</strong>{" "}
                {currentUser.lifeRoleLabel ? `ve ${currentUser.lifeRoleLabel}` : ""} profilinize göre özel olarak uyarlandı.
              </p>
            </div>

            <div className="flex items-center gap-2.5 flex-wrap shrink-0">
              <button
                type="button"
                onClick={() => onEnterConsole("verdict")}
                className="px-5 py-3.5 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-mono font-black text-xs uppercase tracking-wider shadow-xl shadow-purple-600/30 flex items-center justify-center gap-2 transition-all transform hover:scale-[1.02] cursor-pointer"
              >
                <Compass className="w-4 h-4 text-cyan-300 animate-pulse" />
                <span>Gelecek Pusulam (3 Soru)</span>
              </button>

              <button
                type="button"
                onClick={() => onEnterConsole("timeline")}
                className="px-5 py-3.5 rounded-2xl bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 text-slate-950 font-mono font-black text-xs uppercase tracking-wider shadow-xl shadow-emerald-500/20 flex items-center justify-center gap-2 transition-all transform hover:scale-[1.02] cursor-pointer"
              >
                <span>2026–2060 Takvimi</span>
                <ArrowRight className="w-4 h-4 text-slate-950" />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 font-mono text-xs">
            <div className="p-3 rounded-2xl bg-slate-950/70 border border-white/5 space-y-0.5">
              <span className="text-[10px] text-slate-500 block">Kullanıcı Adı:</span>
              <span className="font-bold text-white truncate block">
                {currentUser.username || currentUser.fullName}
              </span>
            </div>
            <div className="p-3 rounded-2xl bg-slate-950/70 border border-white/5 space-y-0.5">
              <span className="text-[10px] text-slate-500 block">Gizli Yaş & Durum:</span>
              <span className="font-bold text-cyan-300 truncate block">
                {currentUser.age ? `${currentUser.age} Yaş • ` : ""}{currentUser.lifeRoleLabel || "Genel"}
              </span>
            </div>
            <div className="p-3 rounded-2xl bg-slate-950/70 border border-white/5 space-y-0.5">
              <span className="text-[10px] text-slate-500 block">Konum:</span>
              <span className="font-bold text-emerald-400 truncate block">
                {currentUser.city || "Türkiye"}
              </span>
            </div>
            <div className="p-3 rounded-2xl bg-slate-950/70 border border-white/5 space-y-0.5">
              <span className="text-[10px] text-slate-500 block">1 Numaralı Öncelik:</span>
              <span className="font-bold text-amber-300 truncate block">
                {currentUser.primaryGoalLabel || "Teknoloji Takibi"}
              </span>
            </div>
          </div>
        </div>
      )}

    </motion.div>
  );
};

export default GoogleStyleLandingPortal;
