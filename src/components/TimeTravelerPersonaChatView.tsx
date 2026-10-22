import React, { useState, useEffect, useRef, useCallback } from "react";
import { Milestone, PersonaChatMessage, ViewMode } from "../types";
import { useLanguage } from "../context/LanguageContext";
import { useAuth } from "../context/AuthContext";
import { getFeatureCreditCost } from "../utils/creditCosts";
import { useDailyFeatureLimit } from "../utils/dailyLimitTracker";
import {
  MessageSquare,
  Send,
  Bot,
  Sparkles,
  User,
  RefreshCw,
  Cpu,
  Radio,
  ShieldCheck,
  Lock,
  LogIn,
  ChevronDown,
  ChevronUp,
  ArrowDown,
  Copy,
  Check,
  Info,
  Trash2,
  Zap,
  Sliders,
  CheckCircle2,
  X,
} from "lucide-react";
import { UserProfile } from "./UserAuthModal";
import { aiService } from "../services/AIService";
import { handleAutoRefundAndLog } from "../utils/creditDisputes";

interface PersonaOption {
  year: number;
  name: string;
  role: string;
  location: string;
  avatar: string;
  neuralSync: number;
  color: string;
  accentBorder: string;
  glowBg: string;
  bio: string;
  starterQuestions: string[];
}

const PERSONAS: PersonaOption[] = [
  {
    year: 2030,
    name: "Dr. Elena Vance",
    role: "AGI Etik & Ajan Mimarı",
    location: "Zürih AI Kampüsü",
    avatar: "👩‍🔬",
    neuralSync: 94,
    color: "from-cyan-500 to-blue-600",
    accentBorder: "border-cyan-500/50",
    glowBg: "bg-cyan-500/10",
    bio: "2030 yılında otonom yapay zeka ajanlarının şirketleri ve hükümet yönetimlerini nasıl devraldığını bizzat gözlemleyen baş mimar.",
    starterQuestions: [
      "AGI günlük yaşamınızı nasıl yönetiyor?",
      "Yapay zeka ajanları hangi meslekleri dönüştürdü?",
      "2030'da veri gizliliği ve güvenlik nasıl korunuyor?",
    ],
  },
  {
    year: 2035,
    name: "Kaelen Voss",
    role: "Neuralink Biyo-Çip Arayüz Mühendisi",
    location: "Neo-Austin Teknoloji Biyomu",
    avatar: "🧑‍💻",
    neuralSync: 98,
    color: "from-indigo-500 to-purple-600",
    accentBorder: "border-indigo-500/50",
    glowBg: "bg-indigo-500/10",
    bio: "2035'te insan zihnini kuantum bilgisayarlara bağlayan nöral implantların tasarımcısı. Düşünce hızıyla kod ve simülasyon üretiyor.",
    starterQuestions: [
      "Zihninizi bilgisayara bağlamak nasıl bir his?",
      "Nöral korsanlık veya virüs riski var mı?",
      "İnsan hafızası artık yedeklenebiliyor mu?",
    ],
  },
  {
    year: 2045,
    name: "Aria 09 (Post-Human)",
    role: "Singularity & Sentetik Biyoloji Orkestratörü",
    location: "Orbital Habitat-01",
    avatar: "🤖",
    neuralSync: 100,
    color: "from-fuchsia-500 to-rose-600",
    accentBorder: "border-fuchsia-500/50",
    glowBg: "bg-fuchsia-500/10",
    bio: "2045 Teknolojik Singularity sonrası biyolojik beden sınırlarını aşmış, biyo-dijital ikiziyle uzay habitatında yaşayan yeni nesil varlık.",
    starterQuestions: [
      "Singularity gerçekleştiğinde dünyada ne oldu?",
      "Biyolojik yaşlanma ve hastalıklar tamamen durdu mu?",
      "Dünya dışı orbital kolonilerde günlük yaşam nasıl?",
    ],
  },
];

interface TimeTravelerPersonaChatViewProps {
  onDeductCredits?: (amount: number, featureKey?: string) => boolean;
  onOpenCreditStore?: () => void;
  currentUser?: UserProfile | null;
  onOpenAuthModal?: () => void;
  targetMilestone?: Milestone;
  targetYear?: number;
  onNavigateToView?: (view: ViewMode, targetYear?: number) => void;
  onOpenDetailModal?: (milestone: Milestone, tab?: "overview" | "personal_impact") => void;
}

export const TimeTravelerPersonaChatView: React.FC<TimeTravelerPersonaChatViewProps> = ({
  onDeductCredits,
  onOpenCreditStore,
  currentUser: propCurrentUser,
  onOpenAuthModal: propOnOpenAuthModal,
  targetMilestone,
  targetYear,
  onNavigateToView,
  onOpenDetailModal,
}) => {
  const { language } = useLanguage();
  const auth = useAuth();
  const currentUser = propCurrentUser !== undefined ? propCurrentUser : auth.currentUser;
  const onOpenAuthModal = propOnOpenAuthModal || auth.openAuthModal;

  // Auto-match best persona based on target year or milestone
  const resolveTargetPersona = useCallback((year?: number): PersonaOption => {
    const yr = year || targetMilestone?.year || targetYear || 2030;
    if (yr <= 2032) return PERSONAS[0]; // 2030 Elena
    if (yr <= 2042) return PERSONAS[1]; // 2035 Kaelen
    return PERSONAS[2]; // 2045 Aria
  }, [targetMilestone, targetYear]);

  const [selectedPersona, setSelectedPersona] = useState<PersonaOption>(() => resolveTargetPersona());
  const [creditError, setCreditError] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [showPersonaInfoMobile, setShowPersonaInfoMobile] = useState<boolean>(false);
  const [isAtBottom, setIsAtBottom] = useState<boolean>(true);

  // Initial greeting tailored to target milestone if provided
  const [messages, setMessages] = useState<PersonaChatMessage[]>(() => {
    const persona = resolveTargetPersona();
    if (targetMilestone) {
      return [
        {
          id: `init-target-${targetMilestone.year}`,
          sender: "persona",
          text: `Sinyalini aldım 2026 sakini! ${targetMilestone.year} yılındaki "${targetMilestone.title}" atılımı hakkında bilgi almak için kuantum tünelle bağlandın. Ben ${persona.name} (${persona.year} yılı, ${persona.role}). O dönemde dünyada yaşanan dönüşümleri ve bu teknolojinin günlük yaşantımıza etkilerini sana birinci elden aktarabilirim. Neyi merak ediyorsun?`,
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        },
      ];
    }
    return [
      {
        id: `init-default-${persona.year}`,
        sender: "persona",
        text: `Merhaba 2026 yılı sakini! Ben ${persona.name}. ${persona.year} yılından nöral zaman tüneli aracılığıyla seninle canlı kuantum bağlantı kurdum. Gelecekteki yaşamım, yapay zeka dönüşümü ve dünyamız hakkında ne öğrenmek istersin?`,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      },
    ];
  });

  // Track last synced milestone key so parent re-renders or credit updates NEVER wipe active chat
  const lastSyncedMilestoneYearRef = useRef<number | undefined>(
    targetMilestone ? targetMilestone.year : undefined
  );

  // Sync persona if targetMilestone changes from outside (e.g. user deliberately selected a different milestone)
  useEffect(() => {
    if (!targetMilestone) return;
    const currentYear = targetMilestone.year;
    // Strictly prevent wiping messages if the milestone hasn't actually changed
    if (lastSyncedMilestoneYearRef.current !== undefined && lastSyncedMilestoneYearRef.current === currentYear) {
      return;
    }
    lastSyncedMilestoneYearRef.current = currentYear;
    const matched = resolveTargetPersona(targetMilestone.year);
    setSelectedPersona(matched);
    setMessages([
      {
        id: String(Date.now()),
        sender: "persona",
        text: `Zaman frekansı ${targetMilestone.year} yılına kilitlendi! "${targetMilestone.title}" atılımını inceliyoruz. Ben ${matched.name} (${matched.year}). Bu teknolojinin dünyayı ve yaşamımızı nasıl şekillendirdiğini konuşalım.`,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      },
    ]);
  }, [targetMilestone?.year, targetMilestone?.title, resolveTargetPersona]);

  const [inputMessage, setInputMessage] = useState("");
  const [loading, setLoading] = useState(false);

  // Dynamic Mobile Keyboard & Viewport Tracking
  const [isKeyboardOpen, setIsKeyboardOpen] = useState<boolean>(false);
  const [viewportHeight, setViewportHeight] = useState<number>(0);

  // DOM Refs for auto-scroll and mobile keyboard handling
  const chatContainerRef = useRef<HTMLDivElement | null>(null);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  // Daily usage quota
  const { isLimitReached, remaining, dailyLimit, increment, hasFreeQuota } = useDailyFeatureLimit(
    "persona_chat",
    auth.plan,
    currentUser?.email,
    auth.credits
  );

  // Smooth scroll to bottom function
  const scrollToBottom超越 = useCallback((behavior: ScrollBehavior = "smooth") => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior, block: "end" });
    }
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, []);

  const scrollToBottom = scrollToBottom超越;

  // Monitor scroll position to show/hide "Scroll to Bottom" badge
  const handleScroll = () => {
    const container = chatContainerRef.current;
    if (!container) return;
    const threshold = 80;
    const isBottom不易 = container.scrollHeight - container.scrollTop - container.clientHeight <= threshold;
    setIsAtBottom(isBottom不易);
  };

  // Auto-scroll on new message or loading state change
  useEffect(() => {
    scrollToBottom("smooth");
  }, [messages, loading, scrollToBottom]);

  // Handle mobile visualViewport resize & virtual keyboard popping up (Telegram/WhatsApp behavior)
  useEffect(() => {
    if (typeof window === "undefined") return;

    const handleViewportChange = () => {
      if (window.visualViewport) {
        const vh = window.visualViewport.height;
        setViewportHeight(vh);
        const isShrunk = window.innerHeight - vh > 120;
        const isInputFocused = document.activeElement === inputRef.current;
        setIsKeyboardOpen(isShrunk || isInputFocused);

        if (isShrunk || isInputFocused) {
          setTimeout(() => {
            scrollToBottom("smooth");
          }, 80);
          setTimeout(() => {
            scrollToBottom("smooth");
          }, 250);
        }
      }
    };

    handleViewportChange();

    if (window.visualViewport) {
      window.visualViewport.addEventListener("resize", handleViewportChange);
      window.visualViewport.addEventListener("scroll", handleViewportChange);
    }
    window.addEventListener("resize", handleViewportChange);

    return () => {
      if (window.visualViewport) {
        window.visualViewport.removeEventListener("resize", handleViewportChange);
        window.visualViewport.removeEventListener("scroll", handleViewportChange);
      }
      window.removeEventListener("resize", handleViewportChange);
    };
  }, [scrollToBottom]);

  // Switch persona handler
  const handleSelectPersona = (persona: PersonaOption) => {
    setSelectedPersona(persona);
    setShowPersonaInfoMobile(false);
    setMessages([
      {
        id: Date.now().toString(),
        sender: "persona",
        text: `Sinyal kilitlendi! Ben ${persona.name}, ${persona.year} yılından canlı bağlanıyorum (${persona.role}). ${persona.year} dünyasından sana ne aktarmamı istersin?`,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      },
    ]);
  };

  // Clear chat conversation
  const handleClearChat = () => {
    setMessages([
      {
        id: Date.now().toString(),
        sender: "persona",
        text: `Sohbet sıfırlandı. ${selectedPersona.year} yılından canlı sinyal hazır. Sorunuzu bekliyorum.`,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      },
    ]);
  };

  // Copy message text
  const handleCopyMessage = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Send message
  const handleSendMessage = async (customText?: string) => {
    if (!currentUser) {
      if (onOpenAuthModal) onOpenAuthModal();
      return;
    }

    const messageToSend = (customText || inputMessage).trim();
    if (!messageToSend) return;

    // Deduct credits or consume daily free quota
    let deductedCost = 0;
    const cost = getFeatureCreditCost("persona_chat", auth.plan);
    if (onDeductCredits) {
      if (cost > 0 || !hasFreeQuota) {
        const success = onDeductCredits(cost, "persona_chat");
        if (!success) {
          setCreditError("Yetersiz Kredi! Devam etmek için kredi yükleyebilir veya planınızı yükseltebilirsiniz.");
          return;
        }
        deductedCost = cost;
      } else {
        increment();
      }
    } else {
      increment();
    }

    setCreditError(null);
    const userMsg: PersonaChatMessage = {
      id: Date.now().toString(),
      sender: "user",
      text: messageToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    const newChatHistory = [...messages, userMsg];
    setMessages(newChatHistory);
    if (!customText) setInputMessage("");
    setLoading(true);

    // Scroll to bottom immediately upon sending
    setTimeout(() => scrollToBottom("smooth"), 50);

    try {
      const data = await aiService.chatWithTimeTraveler({
        personaYear: selectedPersona.year,
        personaRole: selectedPersona.role,
        userMessage: messageToSend,
        chatHistory: messages.map((m) => ({
          role: m.sender === "user" ? "user" : "model",
          text: m.text,
        })),
        language,
      });

      if (data.success && data.reply) {
        const personaMsg: PersonaChatMessage = {
          id: (Date.now() + 1).toString(),
          sender: "persona",
          text: data.reply,
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        };
        setMessages((prev) => [...prev, personaMsg]);
      } else {
        const errMsg = data.error || "Zaman yolcusu yanıt veremedi.";
        const errorMsg: PersonaChatMessage = {
          id: (Date.now() + 1).toString(),
          sender: "persona",
          text: `⚠️ Yanıt alınamadı: ${errMsg}\n\n🛡️ [OTOMATİK TELAFİ]: Harcanan ${deductedCost || 10} Krediniz hesabınıza anında geri yüklendi.`,
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        };
        setMessages((prev) => [...prev, errorMsg]);

        if (currentUser && (deductedCost > 0 || !hasFreeQuota)) {
          handleAutoRefundAndLog({
            userEmail: currentUser.email,
            featureKey: "persona_chat",
            featureName: "Zaman Yolcusu AI Sohbet",
            deductedCredits: deductedCost || 10,
            errorMessage: `API Hatası: ${errMsg} (Persona: ${selectedPersona.name})`,
            payload: { persona: selectedPersona.name, year: selectedPersona.year },
            onRefundCredits: (amount) => auth.addCredits(amount),
          });
        }
      }
    } catch (e: any) {
      console.error("Persona Chat error:", e);
      const errorMsg: PersonaChatMessage = {
        id: (Date.now() + 1).toString(),
        sender: "persona",
        text: `⚠️ Bağlantı hatası oluştu: ${e?.message || "Sunucuya ulaşılamadı"}\n\n🛡️ [OTOMATİK TELAFİ]: Harcanan ${deductedCost || 10} Krediniz hesabınıza anında geri yüklendi.`,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };
      setMessages((prev) => [...prev, errorMsg]);

      if (currentUser && (deductedCost > 0 || !hasFreeQuota)) {
        handleAutoRefundAndLog({
          userEmail: currentUser.email,
          featureKey: "persona_chat",
          featureName: "Zaman Yolcusu AI Sohbet",
          deductedCredits: deductedCost || 10,
          errorMessage: `İstemci/Bağlantı Hatası: ${e?.message || "Sunucuya ulaşılamadı"} (Persona: ${selectedPersona.name})`,
          payload: { persona: selectedPersona.name, year: selectedPersona.year },
          onRefundCredits: (amount) => auth.addCredits(amount),
        });
      }
    } finally {
      setLoading(false);
      setTimeout(() => scrollToBottom("smooth"), 100);
    }
  };

  return (
    <div className="w-full max-w-7xl mx-auto space-y-3 sm:space-y-6">
      {/* ── DESKTOP-ONLY HERO HEADER (Mobilde gizlenerek dikey ekranı tüketmesi engellendi) ── */}
      <div className="hidden lg:block bg-gradient-to-r from-slate-900/90 via-slate-900/80 to-slate-950/90 border border-cyan-500/20 rounded-2xl p-5 backdrop-blur-xl relative overflow-hidden shadow-2xl">
        <div className="absolute top-0 right-0 w-80 h-80 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex items-center justify-between gap-4">
          <div className="space-y-1 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 font-mono text-[10px] font-bold uppercase">
              <Radio className="w-3 h-3 animate-pulse text-cyan-400" />
              <span>Nöral Zaman Tüneli // Live Time-Stream</span>
            </div>
            <h2 className="text-xl lg:text-2xl font-black tracking-tight text-white uppercase font-mono">
              Gelecek İnsanıyla Birebir Sohbet
            </h2>
            <p className="text-slate-300 text-xs font-sans">
              2030, 2035 veya 2045 yılındaki insan prototipiyle canlı diyalog kurun; teknolojik kırılımları bizzat yaşayan kişiden öğrenin.
            </p>
          </div>

          <div className="flex items-center gap-2 font-mono text-xs">
            <span className="px-3 py-1 rounded-xl bg-slate-950/80 border border-white/10 text-slate-300 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
              <span>Kota: <strong>{hasFreeQuota ? `${remaining}/${dailyLimit} Ücretsiz` : "Kredi Modu"}</strong></span>
            </span>
          </div>
        </div>

        {/* Target Milestone Active Context Banner */}
        {targetMilestone && (
          <div className="pt-3 border-t border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2.5">
              <span className="px-2.5 py-1 rounded-lg bg-cyan-500/20 text-cyan-300 font-mono font-bold border border-cyan-500/30 shrink-0">
                🕒 {targetMilestone.year} DÖNÜM NOKTASI
              </span>
              <span className="text-slate-300">
                <strong className="text-white">{targetMilestone.title}</strong> teknolojisini inceliyordunuz. Bu döneme ait zaman yolcusu frekansı otomatik bağlandı.
              </span>
            </div>
            <div className="flex items-center gap-2">
              {onOpenDetailModal && targetMilestone ? (
                <button
                  type="button"
                  onClick={() => onOpenDetailModal(targetMilestone, "personal_impact")}
                  className="px-3 py-1.5 rounded-lg bg-cyan-600/30 hover:bg-cyan-600 text-cyan-100 hover:text-white border border-cyan-500/50 font-mono text-[11px] font-bold transition flex items-center gap-1.5 shrink-0 self-start sm:self-auto cursor-pointer"
                >
                  <span>🎯 {language === "tr" ? "Dönüm Noktasına Geri Dön" : "Return to Milestone"}</span>
                </button>
              ) : onNavigateToView && (
                <button
                  type="button"
                  onClick={() => onNavigateToView("timeline", targetMilestone.year)}
                  className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-cyan-300 hover:text-white border border-cyan-500/30 font-mono text-[11px] font-bold transition flex items-center gap-1.5 shrink-0 self-start sm:self-auto cursor-pointer"
                >
                  <span>🕒 Takvime Dön ({targetMilestone.year})</span>
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* ── GOOGLE-STYLE SINGLE-VIEW CHAT WORKSPACE (Mobilde Viewport'a Tam Oturan, Kesintisiz Sohbet) ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 lg:gap-6 items-stretch">
        {/* ── LEFT COLUMN (LG: 4 COLS): DESKTOP PERSONA SELECTOR ── */}
        <div className="hidden lg:flex lg:col-span-4 flex-col space-y-3">
          <div className="text-[11px] font-mono font-bold uppercase text-slate-400 px-1 flex items-center justify-between">
            <span>Zaman Yolcusu Seçin</span>
            <span className="text-[10px] text-cyan-400">3 Aktif Frekans</span>
          </div>

          {PERSONAS.map((p, pIdx) => {
            const isSelected = selectedPersona.year === p.year;
            return (
              <button
                key={`persona-${p.year}-${p.name}-${pIdx}`}
                onClick={() => handleSelectPersona(p)}
                className={`p-4 rounded-2xl border text-left transition-all duration-200 cursor-pointer space-y-2.5 relative overflow-hidden group ${
                  isSelected
                    ? "bg-slate-900/90 border-cyan-500 shadow-xl shadow-cyan-500/15 ring-1 ring-cyan-500/40"
                    : "bg-slate-900/40 border-white/10 hover:border-white/25 hover:bg-slate-900/70"
                }`}
              >
                {isSelected && (
                  <div className="absolute top-0 left-0 bottom-0 w-1.5 bg-gradient-to-b from-cyan-400 to-blue-500" />
                )}

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <span className="text-2xl p-1.5 rounded-xl bg-slate-950/80 border border-white/10">{p.avatar}</span>
                    <div>
                      <h4 className="font-bold text-white text-sm leading-tight">{p.name}</h4>
                      <p className="text-[11px] text-cyan-300 font-mono">{p.role}</p>
                    </div>
                  </div>
                  <span className="text-xs font-mono font-extrabold text-cyan-400 px-2 py-0.5 rounded-full bg-cyan-950/90 border border-cyan-500/40">
                    {p.year}
                  </span>
                </div>

                <p className="text-[11px] text-slate-300 line-clamp-2 leading-relaxed font-sans pl-1">
                  {p.bio}
                </p>

                <div className="pt-2 border-t border-white/5 flex items-center justify-between text-[10px] font-mono text-slate-400">
                  <span className="truncate max-w-[130px]">{p.location}</span>
                  <span className="text-emerald-400 font-semibold flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                    %{p.neuralSync} Senkron
                  </span>
                </div>
              </button>
            );
          })}

          <div className="p-4 rounded-2xl bg-slate-950/70 border border-white/10 space-y-1.5 font-mono text-[11px]">
            <div className="flex items-center justify-between text-slate-400">
              <span className="flex items-center gap-1.5 text-cyan-300 font-bold">
                <Cpu className="w-3.5 h-3.5" />
                <span>Nöral Protokol:</span>
              </span>
              <span className="text-emerald-400 font-bold">AKTİF // DÜŞÜK GECİKME</span>
            </div>
            <div className="text-slate-400 text-[10px] leading-relaxed">
              Zaman tüneli dili otomatik olarak Türkçe'ye çevirir ve {selectedPersona.year} yılı ontolojisine tam uyum sağlar.
            </div>
          </div>
        </div>

        {/* ── RIGHT COLUMN (LG: 8 COLS): FULL-SCREEN MOBILE & DESKTOP CHAT TERMINAL ── */}
        <div className="w-full lg:col-span-8">
          {/*
            MOBİL UYUM (Telegram / WhatsApp Tarzı Dinamik Yükseklik):
            Klavye açıldığında visualViewport küçülmesini yakalayarak sohbet alanını tam ekranın görünen kısmına uydurur.
            Giriş kutusu klavyenin hemen üzerinde sabit kalır, üstteki mesajlar ise kaydırılarak kesintisiz okunabilir.
          */}
          <div
            style={
              viewportHeight > 0 && typeof window !== "undefined" && window.innerWidth < 1024
                ? {
                    height: `${Math.max(250, Math.floor(viewportHeight - (isKeyboardOpen ? 68 : 175)))}px`,
                  }
                : undefined
            }
            className="w-full bg-slate-900/95 border border-cyan-500/30 rounded-2xl sm:rounded-3xl shadow-2xl flex flex-col h-[calc(100dvh-215px)] sm:h-[620px] lg:h-[680px] max-h-[calc(100dvh-175px)] min-h-[250px] relative overflow-hidden backdrop-blur-xl transition-[height] duration-150"
          >
            
            {/* ── 1. MOBİL PERSONA SEÇİCİ ŞERİT (Kompakt Üst Bar) ── */}
            <div className="lg:hidden px-3 py-1.5 bg-slate-950/90 border-b border-white/10 flex items-center justify-between gap-2 shrink-0 z-10">
              <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
                {PERSONAS.map((p, idx) => {
                  const isSelected = selectedPersona.year === p.year;
                  return (
                    <button
                      key={`mob-chip-${p.year}-${p.name}-${idx}`}
                      onClick={() => handleSelectPersona(p)}
                      className={`flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-[11px] font-mono font-bold whitespace-nowrap transition-all border shrink-0 cursor-pointer ${
                        isSelected
                          ? "bg-cyan-950 text-cyan-300 border-cyan-400 shadow-md shadow-cyan-500/20"
                          : "bg-slate-900 text-slate-400 border-white/5"
                      }`}
                    >
                      <span>{p.avatar}</span>
                      <span>{p.year} // {p.name.split(" ")[0]}</span>
                    </button>
                  );
                })}
              </div>

              <div className="flex items-center gap-1 shrink-0">
                <button
                  onClick={() => setShowPersonaInfoMobile(!showPersonaInfoMobile)}
                  className="p-1.5 rounded-lg bg-slate-800 text-cyan-400 hover:bg-slate-700 transition-colors"
                  title="Persona Bilgisi"
                >
                  <Info className="w-4 h-4" />
                </button>
                <button
                  onClick={handleClearChat}
                  className="p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-rose-400 transition-colors"
                  title="Sohbeti Sıfırla"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* ── 2. CHAT APP BAR (Active Persona Info) ── */}
            <div className="px-3 py-2 sm:px-6 sm:py-3 border-b border-white/10 bg-slate-950/80 backdrop-blur-md flex items-center justify-between shrink-0 z-10">
              <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
                <div className="relative shrink-0">
                  <span className="text-xl sm:text-3xl">{selectedPersona.avatar}</span>
                  <span className="absolute -bottom-0.5 -right-0.5 w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full bg-emerald-400 ring-2 ring-slate-950 animate-pulse" />
                </div>
                <div className="min-w-0">
                  <h3 className="font-bold text-white text-xs sm:text-base font-mono flex items-center gap-2 leading-tight truncate">
                    <span className="truncate">{selectedPersona.name}</span>
                    <span className="text-[9px] sm:text-[10px] font-normal px-1.5 py-0.5 rounded-full bg-cyan-950 text-cyan-300 border border-cyan-500/30 shrink-0">
                      {selectedPersona.year}
                    </span>
                  </h3>
                  <p className="text-[10px] sm:text-xs text-cyan-400/90 font-mono truncate mt-0.5">
                    {selectedPersona.role}
                  </p>
                </div>
              </div>

              {/* Desktop Only Actions */}
              <div className="hidden lg:flex items-center gap-2">
                <button
                  onClick={handleClearChat}
                  className="px-2.5 py-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-rose-300 transition-colors flex items-center gap-1 font-mono text-[10px] cursor-pointer"
                  title="Sohbeti Sıfırla"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Sıfırla</span>
                </button>
              </div>
            </div>

            {/* Mobile Collapsible Info Drawer */}
            {showPersonaInfoMobile && (
              <div className="lg:hidden p-3 bg-slate-950 border-b border-cyan-500/30 text-xs font-sans text-slate-300 animate-in slide-in-from-top-2 duration-200 shrink-0">
                <div className="flex items-start justify-between gap-2 mb-1.5">
                  <p className="leading-relaxed text-[11px] text-slate-300">{selectedPersona.bio}</p>
                  <button onClick={() => setShowPersonaInfoMobile(false)} className="text-slate-400 p-1">
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
                <div className="flex items-center justify-between text-[10px] font-mono text-cyan-400 pt-1 border-t border-white/5">
                  <span>📍 {selectedPersona.location}</span>
                  <span className="text-emerald-400 font-bold">⚡ Nöral Senkron: %{selectedPersona.neuralSync}</span>
                </div>
              </div>
            )}

            {/* ── 3. MESSAGES SCROLL AREA (Tam Boyut & Akıllı Kaydırma) ── */}
            <div
              ref={chatContainerRef}
              onScroll={handleScroll}
              className="flex-1 overflow-y-auto px-3 sm:px-6 py-2.5 sm:py-4 space-y-3 font-sans relative scroll-smooth overscroll-y-auto"
            >
              {messages.map((msg, mIdx) => {
                const isUser = msg.sender === "user";
                const isCopied = copiedId === msg.id;

                return (
                  <div
                    key={msg.id ? `${msg.id}-${mIdx}` : `msg-${mIdx}`}
                    className={`flex flex-col group ${
                      isUser ? "ml-auto items-end max-w-[88%] sm:max-w-[75%]" : "mr-auto items-start max-w-[92%] sm:max-w-[80%]"
                    }`}
                  >
                    <div className="flex items-end gap-1.5 sm:gap-2">
                      {!isUser && (
                        <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-xl bg-slate-950 border border-white/10 flex items-center justify-center text-xs sm:text-sm shrink-0 mb-1">
                          {selectedPersona.avatar}
                        </div>
                      )}

                      <div
                        className={`p-2.5 sm:p-4 rounded-2xl text-xs sm:text-sm leading-relaxed whitespace-pre-wrap break-words select-text relative transition-all shadow-md ${
                          isUser
                            ? "bg-gradient-to-r from-cyan-600 to-blue-600 text-white rounded-br-none shadow-cyan-600/20"
                            : "bg-slate-800/90 text-slate-100 border border-white/10 rounded-bl-none shadow-black/40"
                        }`}
                      >
                        {msg.text}
                      </div>

                      {isUser && (
                        <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-xl bg-cyan-600/30 border border-cyan-500/40 flex items-center justify-center text-cyan-300 text-xs shrink-0 mb-1">
                          <User className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                        </div>
                      )}
                    </div>

                    {/* Sub-actions */}
                    <div className={`flex items-center gap-2 mt-1 px-1 text-[9px] sm:text-[10px] font-mono text-slate-500 ${isUser ? "justify-end" : "justify-start pl-8 sm:pl-9"}`}>
                      <span>{msg.timestamp}</span>
                      <button
                        onClick={() => handleCopyMessage(msg.id, msg.text)}
                        className="opacity-70 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity hover:text-slate-300 p-0.5 rounded cursor-pointer"
                        title="Kopyala"
                      >
                        {isCopied ? (
                          <Check className="w-3 h-3 text-emerald-400" />
                        ) : (
                          <Copy className="w-3 h-3" />
                        )}
                      </button>
                    </div>
                  </div>
                );
              })}

              {/* Typing indicator */}
              {loading && (
                <div className="flex items-center gap-2 mr-auto items-start max-w-[85%] pl-1 animate-in fade-in duration-300">
                  <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-xl bg-slate-950 border border-cyan-500/30 flex items-center justify-center text-xs shrink-0">
                    {selectedPersona.avatar}
                  </div>
                  <div className="p-2 sm:p-3 rounded-2xl bg-slate-800/80 border border-cyan-500/30 rounded-bl-none flex items-center gap-2 text-xs font-mono text-cyan-300 shadow-lg">
                    <Sparkles className="w-3.5 h-3.5 animate-spin text-cyan-400 shrink-0" />
                    <span className="text-[11px] sm:text-xs">Yanıt sentezleniyor...</span>
                    <span className="flex gap-1 ml-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-bounce" style={{ animationDelay: "0ms" }} />
                      <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-bounce" style={{ animationDelay: "150ms" }} />
                      <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-bounce" style={{ animationDelay: "300ms" }} />
                    </span>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} className="h-1" />
            </div>

            {/* Floating "Scroll to Bottom" button */}
            {!isAtBottom && (
              <button
                onClick={() => scrollToBottom("smooth")}
                className="absolute bottom-20 right-3 z-20 px-2.5 py-1 rounded-full bg-cyan-500 text-slate-950 font-mono text-[10px] font-bold shadow-xl shadow-cyan-500/30 flex items-center gap-1 hover:bg-cyan-400 transition-all cursor-pointer animate-in fade-in zoom-in duration-200"
              >
                <ArrowDown className="w-3 h-3" />
                <span>En Alta İn</span>
              </button>
            )}

            {/* ── 4. QUICK SUGGESTION CHIPS (Hızlı Sorular) ── */}
            <div className="px-2.5 sm:px-6 pt-1 pb-1 border-t border-white/5 bg-slate-950/70 flex items-center gap-1.5 overflow-x-auto no-scrollbar shrink-0">
              <span className="text-[9px] sm:text-[10px] font-mono text-slate-400 flex items-center gap-1 shrink-0">
                <Sparkles className="w-3 h-3 text-cyan-400" />
                <span className="hidden sm:inline">Hızlı:</span>
              </span>
              {(selectedPersona.starterQuestions || []).map((q, idx) => (
                <button
                  key={`starter-q-${selectedPersona.year}-${selectedPersona.name}-${idx}`}
                  onClick={() => handleSendMessage(q)}
                  disabled={loading}
                  className="text-[10px] sm:text-[11px] font-mono px-2 sm:px-2.5 py-1 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-cyan-300 hover:text-white border border-white/10 transition-all whitespace-nowrap shrink-0 cursor-pointer disabled:opacity-50"
                >
                  {q}
                </button>
              ))}
            </div>

            {/* Credit Error Alert */}
            {creditError && (
              <div className="mx-3 sm:mx-6 mb-2 p-2 bg-red-950/90 border border-red-500/50 rounded-xl text-red-200 text-xs font-mono flex items-center justify-between shrink-0">
                <span className="truncate text-[11px]">{creditError}</span>
                <button
                  onClick={onOpenCreditStore}
                  className="px-2 py-0.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-lg transition-all cursor-pointer text-[10px] shrink-0 ml-2"
                >
                  Kredi Yükle
                </button>
              </div>
            )}

            {/* ── 5. PERMANENTLY DOCKED INPUT BAR (Her Zaman Doğrudan Görünür Giriş Çubuğu) ── */}
            <div className="p-2 sm:p-3.5 bg-slate-950/95 border-t border-white/10 shrink-0 z-10">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSendMessage();
                }}
                className="flex items-center gap-2"
              >
                <div className="relative flex-1">
                  <input
                    ref={inputRef}
                    type="text"
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    onFocus={() => {
                      setIsKeyboardOpen(true);
                      setTimeout(() => scrollToBottom("smooth"), 50);
                      setTimeout(() => scrollToBottom("smooth"), 180);
                      setTimeout(() => scrollToBottom("smooth"), 350);
                    }}
                    onBlur={() => {
                      setTimeout(() => {
                        if (
                          window.visualViewport &&
                          window.innerHeight - window.visualViewport.height <= 120
                        ) {
                          setIsKeyboardOpen(false);
                        }
                      }, 200);
                    }}
                    placeholder={`${selectedPersona.year} yılı sakinine soru sorun...`}
                    disabled={loading || isLimitReached}
                    autoComplete="off"
                    enterKeyHint="send"
                    className="w-full bg-slate-900 border border-white/15 rounded-xl px-3 sm:px-4 py-2 sm:py-2.5 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 font-sans transition-all"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading || !inputMessage.trim() || isLimitReached}
                  className={`px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl font-mono text-xs font-bold transition-all flex items-center justify-center gap-1.5 shrink-0 cursor-pointer ${
                    isLimitReached
                      ? "bg-slate-800 text-red-400 border border-red-500/40 cursor-not-allowed"
                      : "bg-cyan-600 hover:bg-cyan-500 active:scale-95 text-white shadow-lg shadow-cyan-600/30 disabled:opacity-40 disabled:cursor-not-allowed"
                  }`}
                >
                  <Send className="w-4 h-4" />
                  <span className="hidden sm:inline">{isLimitReached ? "Limit" : "Gönder"}</span>
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TimeTravelerPersonaChatView;
