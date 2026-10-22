import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { useBadges } from "../context/BadgeContext";
import {
  Sparkles,
  Gift,
  Award,
  Lock,
  LogIn,
  RotateCw,
  CheckCircle2,
  Zap,
  Star,
  Coins,
  ChevronRight,
  TrendingUp,
  Globe,
  Layers,
  Clock,
  ChevronDown,
  ChevronUp
} from "lucide-react";
import { recordSpinEvent, FutureCollectionItem, getSpinAnalytics } from "../utils/spinStorage";
import { RewardCardModal } from "./RewardCardModal";
import { getApiHeaders, notifyClientCreditsUpdated } from "../utils/apiClient";

export interface WheelSegment {
  id: number;
  label: string;
  subtext: string;
  color: string;
  textColor: string;
  creditAmount: number;
  xpAmount: number;
  weight: number; // Weighted probability percentage
  collectionTemplate?: Partial<FutureCollectionItem>;
}

const WHEEL_SEGMENTS: WheelSegment[] = [
  {
    id: 1,
    label: "+2 KREDİ",
    subtext: "Standart Mikro Bonus (%35)",
    color: "#0284c7", // Sky blue
    textColor: "#ffffff",
    creditAmount: 2,
    xpAmount: 10,
    weight: 35,
    collectionTemplate: {
      title: "2030 Otonom Veri Paketçiği",
      subtitle: "Günlük Mikro AI Bonusu",
      category: "Yapay Zeka",
      rarity: "Sıradan",
      iconName: "Cpu",
      description: "Günlük veri akışından elde edilen mikro AI işlem kredisi.",
      storyLore: "Temel kuantum veri ağı paketçiği.",
      techTimelineYear: "2030",
    }
  },
  {
    id: 2,
    label: "+1 KREDİ",
    subtext: "Kuantum Veri Damlası (%25)",
    color: "#475569", // Slate
    textColor: "#ffffff",
    creditAmount: 1,
    xpAmount: 5,
    weight: 25,
    collectionTemplate: {
      title: "Kuantum Bit Damlası",
      subtitle: "Sayısal Mikro Veri",
      category: "Kuantum",
      rarity: "Sıradan",
      iconName: "Atom",
      description: "Tekil kuantum bit yükü.",
      storyLore: "Kuantum dolaşıklıktan süzülen mikro enerji.",
      techTimelineYear: "2028",
    }
  },
  {
    id: 3,
    label: "+5 KREDİ",
    subtext: "Haftalık Sentez (%20)",
    color: "#06b6d4", // Cyan
    textColor: "#0f172a",
    creditAmount: 5,
    xpAmount: 25,
    weight: 20,
    collectionTemplate: {
      title: "2030 Otonom Veri Sentezleyicisi",
      subtitle: "Günlük AI Veri Akışı",
      category: "Yapay Zeka",
      rarity: "Sıradan",
      iconName: "Cpu",
      description: "Gelişmiş AI ajanları günlük bilgi akışını kişiselleştirip anında raporlar sunar.",
      storyLore: "Veri bolluğu çağında, kişisel bilgi filtresi en değerli araç haline geldi.",
      techTimelineYear: "2030",
    }
  },
  {
    id: 4,
    label: "+3 KREDİ",
    subtext: "Enerji Yüklemesi (%10)",
    color: "#14b8a6", // Teal
    textColor: "#ffffff",
    creditAmount: 3,
    xpAmount: 15,
    weight: 10,
    collectionTemplate: {
      title: "2028 Katı-Hal Batarya Şarjı",
      subtitle: "Süper Hızlı Güç Yüklemesi",
      category: "Uzay & Enerji",
      rarity: "Nadir",
      iconName: "Zap",
      description: "1 dakikada şarj olan katı hal piller mikro güç sağlar.",
      storyLore: "2028 batarya devrimi fosil yakıtların sonunu hızlandırdı.",
      techTimelineYear: "2028",
    }
  },
  {
    id: 5,
    label: "+10 KREDİ",
    subtext: "Nadir AI Sinyali (%6)",
    color: "#10b981", // Emerald
    textColor: "#0f172a",
    creditAmount: 10,
    xpAmount: 50,
    weight: 6,
    collectionTemplate: {
      title: "2032 Kuantum Nöro-Arayüz Sinyali",
      subtitle: "Düşünce Hızıyla Bağlantı",
      category: "Kuantum",
      rarity: "Nadir",
      iconName: "Atom",
      description: "Düşünce hızıyla cihaz kontrolü sağlayan zararsız BCI sinyali.",
      storyLore: "2032'de BCI çipleri zihni kuantum ağına bağladı.",
      techTimelineYear: "2032",
    }
  },
  {
    id: 6,
    label: "+15 KREDİ",
    subtext: "Epik Keşif (%2.5)",
    color: "#8b5cf6", // Purple
    textColor: "#ffffff",
    creditAmount: 15,
    xpAmount: 75,
    weight: 2.5,
    collectionTemplate: {
      title: "2035 VIP Sentetik Enerji Matrisi",
      subtitle: "Füzyon Bonusu",
      category: "Uzay & Enerji",
      rarity: "Epik",
      iconName: "Zap",
      description: "Minyatür soğuk füzyon hücreleri ile yüksek enerji bonusu.",
      storyLore: "2035'te ticari kullanıma giren füzyon matrisi.",
      techTimelineYear: "2035",
    }
  },
  {
    id: 7,
    label: "+25 KREDİ",
    subtext: "Efsanevi AGI (%1)",
    color: "#ec4899", // Pink
    textColor: "#ffffff",
    creditAmount: 25,
    xpAmount: 100,
    weight: 1,
    collectionTemplate: {
      title: "2045 Biyo-Dijital Bilinç Yedeği",
      subtitle: "Transinsan Efsanevi Kart",
      category: "Biyoteknoloji",
      rarity: "Efsanevi",
      iconName: "Brain",
      description: "Nöronal sinaps haritalama ile insan belleği buluta aktarılıyor.",
      storyLore: "2045 yılında ilk kez insan sinaps haritası kayıpsız aktarıldı.",
      techTimelineYear: "2045",
    }
  },
  {
    id: 8,
    label: "+50 KREDİ",
    subtext: "JACKPOT (%0.5)",
    color: "#f59e0b", // Gold Amber
    textColor: "#0f172a",
    creditAmount: 50,
    xpAmount: 200,
    weight: 0.5,
    collectionTemplate: {
      title: "2060 Medeniyet Seviyesi II Dyson Sürüleri",
      subtitle: "Sonsuz Yıldız Gücü Jackpot",
      category: "Uzay & Enerji",
      rarity: "Efsanevi",
      iconName: "Globe",
      description: "Yörünge aynaları ile sınırsız kuantum ikramiyesi.",
      storyLore: "Kardashev Tip I seviyesine ulaşan insanlık yıldızlara ulaştı.",
      techTimelineYear: "2060",
    }
  },
];

interface DailyFutureSpinWheelProps {
  onOpenProfileCollection?: () => void;
}

export const DailyFutureSpinWheel: React.FC<DailyFutureSpinWheelProps> = ({
  onOpenProfileCollection
}) => {
  const { currentUser, openAuthModal, addCredits } = useAuth();
  const { triggerActivity } = useBadges();

  const [isSpinning, setIsSpinning] = useState(false);
  const [rotationDegree, setRotationDegree] = useState(0);
  const [wonReward, setWonReward] = useState<WheelSegment | null>(null);
  const [wonCollectionItem, setWonCollectionItem] = useState<FutureCollectionItem | null>(null);
  const [hasSpunToday, setHasSpunToday] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [guestPromptOpen, setGuestPromptOpen] = useState(false);
  const [analytics, setAnalytics] = useState(getSpinAnalytics());
  const [timeUntilMidnight, setTimeUntilMidnight] = useState<{ hours: number; mins: number; secs: number }>({ hours: 0, mins: 0, secs: 0 });

  // User-specific spin key
  const spinUserKey = currentUser ? `future_daily_spin_date_${currentUser.email || currentUser.id}` : "future_daily_spin_date_guest";

  // Check if spun today from server + localStorage & collapse if already spun
  useEffect(() => {
    const todayStr = new Date().toISOString().split("T")[0];
    const lastSpin = localStorage.getItem(spinUserKey);
    if (lastSpin === todayStr) {
      setHasSpunToday(true);
      setIsCollapsed(true);
    } else {
      setHasSpunToday(false);
      setIsCollapsed(false);
    }
    setAnalytics(getSpinAnalytics());

    // Query authoritative server status
    if (currentUser?.email) {
      fetch(`/api/credits/spin-status?email=${encodeURIComponent(currentUser.email)}`)
        .then((res) => res.json())
        .then((data) => {
          if (data?.hasSpunToday) {
            setHasSpunToday(true);
            setIsCollapsed(true);
            localStorage.setItem(spinUserKey, todayStr);
          }
        })
        .catch(() => {});
    }
  }, [spinUserKey, currentUser?.email]);

  // Live countdown to midnight (00:00)
  useEffect(() => {
    const updateCountdown = () => {
      const now = new Date();
      const midnight = new Date();
      midnight.setHours(24, 0, 0, 0); // Next 00:00:00
      const diff = midnight.getTime() - now.getTime();

      if (diff <= 0) {
        localStorage.removeItem(spinUserKey);
        setHasSpunToday(false);
        setIsCollapsed(false);
        setTimeUntilMidnight({ hours: 0, mins: 0, secs: 0 });
      } else {
        const hours = Math.floor(diff / (1000 * 60 * 60));
        const mins = Math.floor((diff / (1000 * 60)) % 60);
        const secs = Math.floor((diff / 1000) % 60);
        setTimeUntilMidnight({ hours, mins, secs });
      }
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, [spinUserKey]);

  const handleSpinClick = async () => {
    // If user is guest, trigger registration prompt
    if (!currentUser) {
      setGuestPromptOpen(true);
      return;
    }

    if (isSpinning || hasSpunToday) return;

    setIsSpinning(true);
    setWonReward(null);
    setWonCollectionItem(null);

    try {
      // Call Server-Authoritative Spin Engine
      const res = await fetch("/api/credits/spin-wheel", {
        method: "POST",
        headers: { "Content-Type": "application/json", ...getApiHeaders() },
        body: JSON.stringify({ email: currentUser.email }),
      });

      const data = await res.json();

      if (!data.success) {
        setIsSpinning(false);
        if (data.error === "ALREADY_SPUN_TODAY") {
          const todayStr = new Date().toISOString().split("T")[0];
          localStorage.setItem(spinUserKey, todayStr);
          setHasSpunToday(true);
          setIsCollapsed(true);
        }
        alert(data.message || data.error || "Çark çevrilirken bir hata oluştu.");
        return;
      }

      const randomIndex = typeof data.selectedIndex === "number" ? data.selectedIndex : 0;
      const selectedSegment = WHEEL_SEGMENTS[randomIndex] || WHEEL_SEGMENTS[0];

      // Build collection item if template exists
      let colItem: FutureCollectionItem | null = null;
      if (selectedSegment.collectionTemplate) {
        colItem = {
          id: `col_win_${selectedSegment.id}_${Date.now()}`,
          title: selectedSegment.collectionTemplate.title || selectedSegment.label,
          subtitle: selectedSegment.collectionTemplate.subtitle || selectedSegment.subtext,
          category: selectedSegment.collectionTemplate.category || "Yapay Zeka",
          rarity: selectedSegment.collectionTemplate.rarity || "Nadir",
          iconName: selectedSegment.collectionTemplate.iconName || "Sparkles",
          description: selectedSegment.collectionTemplate.description || "Gelecek teknolojisi verisi koleksiyonunuza eklendi.",
          storyLore: selectedSegment.collectionTemplate.storyLore || "2030+ vizyonunu simgeleyen bu ödül, geleceği şekillendiren teknolojiler arasındadır.",
          techTimelineYear: selectedSegment.collectionTemplate.techTimelineYear || "2035",
          creditAmount: selectedSegment.creditAmount,
          xpAmount: selectedSegment.xpAmount,
          wonAt: new Date().toISOString().split("T")[0],
        };
      }

      // Calculate precise target rotation angle to align the selected segment with the top pointer (12 o'clock / 270 deg)
      const segmentAngle = 360 / WHEEL_SEGMENTS.length;
      const desiredOffset = ((270 - randomIndex * segmentAngle - segmentAngle / 2) % 360 + 360) % 360;

      // Account for current rotation angle modulo 360
      const currentMod = rotationDegree % 360;
      const extraRotation = ((desiredOffset - currentMod) % 360 + 360) % 360;

      // Spin at least 5 full revolutions (1800 deg) plus exact alignment offset
      const totalSpinIncrement = 1800 + extraRotation;
      setRotationDegree((prev) => prev + totalSpinIncrement);

      setTimeout(() => {
        setIsSpinning(false);
        setWonReward(selectedSegment);
        setWonCollectionItem(colItem);

        // Update credits to server-authoritative balance
        if (typeof data.remainingCredits === "number") {
          notifyClientCreditsUpdated(data.remainingCredits);
        } else {
          addCredits(selectedSegment.creditAmount);
        }

        // ALWAYS award XP and badge triggers!
        triggerActivity("run_ai_sim");
        triggerActivity("visit_analytics");

        // Save to analytics & collection storage
        const updatedAnalytics = recordSpinEvent(selectedSegment, colItem || undefined);
        setAnalytics(updatedAnalytics);

        // Save today's spin date
        const todayStr = new Date().toISOString().split("T")[0];
        localStorage.setItem(spinUserKey, todayStr);
        setHasSpunToday(true);
      }, 4500);
    } catch (err) {
      console.error("Spin wheel server error:", err);
      setIsSpinning(false);
      alert("Bağlantı hatası: Sunucu ile iletişim kurulamadı.");
    }
  };

  // Helper to construct SVG Pie Slices
  const renderSvgWheelSlices = () => {
    const total = WHEEL_SEGMENTS.length;
    const angleStep = 360 / total;
    const radius = 145;
    const center = 150;

    return WHEEL_SEGMENTS.map((seg, i) => {
      const startAngle = i * angleStep;
      const endAngle = (i + 1) * angleStep;
      const midAngle = startAngle + angleStep / 2;

      const rad1 = (startAngle * Math.PI) / 180;
      const rad2 = (endAngle * Math.PI) / 180;

      const x1 = center + radius * Math.cos(rad1);
      const y1 = center + radius * Math.sin(rad1);
      const x2 = center + radius * Math.cos(rad2);
      const y2 = center + radius * Math.sin(rad2);

      const pathData = `M ${center} ${center} L ${x1} ${y1} A ${radius} ${radius} 0 0 1 ${x2} ${y2} Z`;

      return (
        <g key={seg.id}>
          {/* Slice Background Path */}
          <path
            d={pathData}
            fill={seg.color}
            stroke="#0f172a"
            strokeWidth="2"
          />

          {/* Text Labels Rotated Centrally along the slice ray */}
          <g transform={`rotate(${midAngle}, ${center}, ${center})`}>
            {/* Primary Amount Label */}
            <text
              x={center + 82}
              y={center - 3}
              fill={seg.textColor}
              fontSize="12"
              fontWeight="900"
              fontFamily="monospace"
              textAnchor="middle"
              dominantBaseline="middle"
            >
              {seg.label}
            </text>

            {/* Subtext Label */}
            <text
              x={center + 82}
              y={center + 11}
              fill={seg.textColor}
              opacity="0.9"
              fontSize="8.5"
              fontWeight="700"
              fontFamily="sans-serif"
              textAnchor="middle"
              dominantBaseline="middle"
            >
              {seg.subtext}
            </text>
          </g>
        </g>
      );
    });
  };

  return (
    <>
      {hasSpunToday && isCollapsed && !isSpinning ? (
        <div className="bg-slate-900/90 border border-emerald-500/40 rounded-2xl p-4 shadow-xl relative overflow-hidden font-sans text-slate-100 my-4 flex flex-col md:flex-row items-center justify-between gap-4 transition-all animate-in fade-in">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-emerald-400 shrink-0">
              <CheckCircle2 className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-mono font-bold text-sm text-white">✨ Bugünkü Günlük Çark Hakkınızı Kullandınız</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-bold">✓ Kilitli</span>
              </div>
              <p className="text-xs text-slate-400 font-sans mt-0.5">
                Çark menüsü otomatik kapatıldı. Günlük yenilenme periyodunda (00:00) yeni analiz hakkı tanımlandığında tekrar aktifleşecektir.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 shrink-0 w-full md:w-auto justify-between md:justify-end">
            <div className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-950 border border-amber-500/30 font-mono text-xs text-amber-300 font-bold">
              <Clock className="w-4 h-4 text-amber-400 animate-spin" style={{ animationDuration: "12s" }} />
              <span>Yenilenme: {timeUntilMidnight.hours}sa {timeUntilMidnight.mins}dk {timeUntilMidnight.secs}sn</span>
            </div>

            <button
              onClick={() => setIsCollapsed(false)}
              className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-white/10 text-xs font-mono text-slate-200 font-bold flex items-center gap-1.5 cursor-pointer transition-all shrink-0"
            >
              <RotateCw className="w-3.5 h-3.5 text-amber-400" />
              <span>Çarkı Göster</span>
            </button>
          </div>
        </div>
      ) : (
        <div className="bg-slate-900 border border-amber-500/30 rounded-2xl sm:rounded-3xl p-4 sm:p-6 shadow-2xl relative overflow-hidden font-sans text-slate-100 my-4 sm:my-6">
          {/* Background glow effects */}
          <div className="absolute top-0 right-0 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-80 h-80 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

          {/* Collapse Button if Spun */}
          {hasSpunToday && (
            <button
              onClick={() => setIsCollapsed(true)}
              className="absolute top-3 right-3 sm:top-4 sm:right-4 z-20 px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-xl bg-slate-950/80 hover:bg-slate-800 border border-white/10 text-xs font-mono text-slate-300 font-bold flex items-center gap-1.5 cursor-pointer transition-all"
            >
              <ChevronUp className="w-4 h-4 text-amber-400" />
              <span>Menüyü Gizle</span>
            </button>
          )}

          <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-6 sm:gap-8">
            
            {/* Left Side: Info & CTA */}
            <div className="max-w-xl space-y-4 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/40 text-amber-300 text-xs font-mono font-bold uppercase tracking-wider">
                <Sparkles className="w-4 h-4 text-amber-400 animate-spin" />
                <span>GÜNLÜK GELECEK & KREDİ ÇARKI</span>
              </div>

              <h2 className="text-xl sm:text-3xl font-black text-white font-mono tracking-tight">
                Geleceğini Şekillendir, Günlük Hediye Kredilerini Çek!
              </h2>

              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-sans">
                Çarkı her gün çevirerek <strong className="text-amber-400">+1 ile +50 Kredi (Olasılıksal Dengeli Ödül)</strong>, koleksiyonunuza eklenecek 2030-2060 teknoloji kartları ve <strong className="text-cyan-400">Gelecek Kahinleri</strong> sıralama puanı kazanın.
              </p>

              {/* Wheel Stats Bar */}
              <div className="flex flex-wrap items-center gap-2 sm:gap-3 font-mono text-xs pt-1 justify-center lg:justify-start">
                <div className="px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-xl bg-slate-950/80 border border-amber-500/30 text-amber-300 font-bold flex items-center gap-1.5 text-[11px] sm:text-xs">
                  <Gift className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-400" />
                  <span>Toplam: {analytics.totalSpins}</span>
                </div>

                <div className="px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-xl bg-slate-950/80 border border-cyan-500/30 text-cyan-300 font-bold flex items-center gap-1.5 text-[11px] sm:text-xs">
                  <Coins className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-cyan-400" />
                  <span>Kredi: +{analytics.totalCreditsWon}</span>
                </div>

                {onOpenProfileCollection && (
                  <button
                    onClick={onOpenProfileCollection}
                    className="px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-xl bg-cyan-600/20 hover:bg-cyan-600/30 border border-cyan-500/40 text-cyan-300 font-bold flex items-center gap-1.5 transition-all cursor-pointer text-[11px] sm:text-xs"
                  >
                    <Layers className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-cyan-400" />
                    <span>Koleksiyon ({analytics.unlockedItemsCount})</span>
                  </button>
                )}
              </div>

              {!currentUser ? (
                <div className="p-3 sm:p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-200 text-xs font-mono space-y-2 text-left">
                  <div className="flex items-center gap-2 font-bold text-amber-300">
                    <Lock className="w-4 h-4 text-amber-400" />
                    <span>Misafir Kullanıcı Uyarısı</span>
                  </div>
                  <p className="text-slate-300 font-sans text-xs">
                    Günlük analiz çarkını çalıştırmak ve tanımlanan analitik kredileri profilinize kaydetmek için kurumsal oturum açmanız gerekmektedir.
                  </p>
                  <button
                    onClick={openAuthModal}
                    className="mt-2 w-full sm:w-auto px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 hover:from-amber-400 hover:to-yellow-300 text-slate-950 font-black text-xs uppercase font-mono tracking-wider shadow-lg shadow-amber-500/20 flex items-center justify-center gap-2 cursor-pointer transition-transform hover:scale-105"
                  >
                    <LogIn className="w-4 h-4" />
                    <span>HESAP OLUŞTUR / OTURUM AÇ (+50 KREDİ)</span>
                  </button>
                </div>
              ) : (
                <div className="flex flex-col gap-3 pt-2 items-center lg:items-start w-full">
                  <div className="flex flex-wrap items-center gap-3 w-full justify-center lg:justify-start">
                    <button
                      onClick={handleSpinClick}
                      disabled={isSpinning || hasSpunToday}
                      className={`w-full sm:w-auto px-6 py-3 rounded-2xl font-mono font-black text-xs sm:text-sm uppercase tracking-wider transition-all duration-300 shadow-xl flex items-center justify-center gap-2 ${
                        isSpinning || hasSpunToday
                          ? "bg-slate-800/90 text-slate-400 border border-slate-700/60 cursor-not-allowed opacity-80"
                          : "bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 hover:from-amber-400 hover:to-yellow-300 text-slate-950 shadow-amber-500/30 hover:scale-105 cursor-pointer"
                      }`}
                    >
                      <RotateCw className={`w-5 h-5 ${isSpinning ? "animate-spin text-amber-400" : ""}`} />
                      <span>
                        {isSpinning
                          ? "ÇARK DÖNÜYOR..."
                          : hasSpunToday
                          ? "BUGÜNKÜ HAKKINIZ DOLDU"
                          : "GÜNLÜK ÇARKI ÇEVİR"}
                      </span>
                    </button>
                  </div>

                  {hasSpunToday && !isSpinning && (
                    <div className="flex flex-col gap-1 text-xs font-mono text-emerald-400 bg-emerald-950/60 border border-emerald-500/30 px-3.5 py-2.5 rounded-xl text-center sm:text-left w-full sm:w-auto">
                      <div className="flex items-center justify-center sm:justify-start gap-1.5 font-bold">
                        <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                        <span>Bugünkü çevirme hakkınızı kullandınız!</span>
                      </div>
                      <span className="text-[11px] text-amber-300/90 font-bold flex items-center justify-center sm:justify-start gap-1 mt-0.5">
                        <Clock className="w-3.5 h-3.5 text-amber-400" />
                        Yenilenme: {timeUntilMidnight.hours}sa {timeUntilMidnight.mins}dk {timeUntilMidnight.secs}sn
                      </span>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Right Side: SVG Wheel Circle */}
            <div className="relative flex flex-col items-center justify-center shrink-0 my-2">
              
              {/* Wheel Top Pointer Indicator */}
              <div className="absolute -top-4 z-30 text-amber-400 font-black text-2xl sm:text-3xl drop-shadow-lg animate-bounce">
                ▼
              </div>

              {/* SVG Rotating Wheel Circle */}
              <div className="relative w-64 h-64 sm:w-72 sm:h-72 rounded-full border-4 border-amber-500/60 shadow-2xl shadow-amber-500/30 overflow-hidden bg-slate-950">
                <svg
                  viewBox="0 0 300 300"
                  className="w-full h-full transition-transform duration-[4500ms] cubic-bezier(0.15, 0.9, 0.25, 1)"
                  style={{
                    transform: `rotate(${rotationDegree}deg)`,
                  }}
                >
                  {renderSvgWheelSlices()}
                </svg>

                {/* Wheel Center Cap */}
                <div className="absolute inset-0 m-auto w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-slate-950 border-2 border-amber-400 shadow-inner flex items-center justify-center z-20">
                  <Gift className="w-6 h-6 sm:w-7 sm:h-7 text-amber-400 animate-pulse" />
                </div>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* Guest Prompt Modal */}
      {guestPromptOpen && (
        <div
          onClick={() => setGuestPromptOpen(false)}
          className="fixed inset-0 z-[120] flex items-center justify-center p-3 sm:p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-200"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-slate-900 border border-amber-500/50 rounded-2xl sm:rounded-3xl max-w-md w-full p-4 sm:p-6 shadow-2xl text-slate-100 font-sans space-y-4 relative max-h-[94dvh] overflow-y-auto"
          >
            <div className="p-3 rounded-2xl bg-amber-500/20 border border-amber-500/40 text-amber-400 w-fit">
              <Gift className="w-8 h-8" />
            </div>

            <h3 className="text-xl font-black text-white font-mono">
              🎯 Analiz Çarkını Aktifleştirin
            </h3>

            <p className="text-sm text-slate-300 leading-relaxed font-sans">
              Gelecek Çarkı'ndan tanımlanan araştırma kredilerini, teknoloji koleksiyon kartlarını ve özel analiz çıktılarını profilinizde saklamak için oturum açın.
            </p>

            <div className="p-3 rounded-xl bg-slate-950/80 border border-white/10 text-xs font-mono text-amber-300 space-y-1">
              <p>✓ 50 Birim Başlangıç Kredisi Hesabınıza Tanımlanır</p>
              <p>✓ 'Teknoloji Analisti' & 'Gelecek Stratejisti' Rozetlerine Hak Kazanın</p>
              <p>✓ Global Doğruluk ve Katkı Sıralamasında Yer Alın</p>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                onClick={() => setGuestPromptOpen(false)}
                className="flex-1 py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 font-mono text-xs text-slate-300 font-bold cursor-pointer"
              >
                Vazgeç
              </button>

              <button
                onClick={() => {
                  setGuestPromptOpen(false);
                  openAuthModal();
                }}
                className="flex-1 py-2.5 px-4 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-amber-400 hover:to-yellow-300 text-slate-950 font-mono font-black text-xs uppercase cursor-pointer flex items-center justify-center gap-1.5 shadow-lg shadow-amber-500/20"
              >
                <LogIn className="w-4 h-4 text-slate-950" />
                <span>KAYDOL (+50 KREDİ)</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Won Reward Modal using RewardCardModal Component */}
      {wonReward && (
        <RewardCardModal
          segment={wonReward}
          collectionItem={wonCollectionItem}
          onClose={() => {
            setWonReward(null);
            setWonCollectionItem(null);
            setIsCollapsed(true);
          }}
          onOpenProfileCollection={onOpenProfileCollection}
        />
      )}
    </>
  );
};
