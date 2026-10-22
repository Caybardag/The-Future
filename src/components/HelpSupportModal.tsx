import React, { useState, useMemo } from "react";
import {
  X,
  Search,
  HelpCircle,
  Cpu,
  ShieldCheck,
  CreditCard,
  Rocket,
  Info,
  ChevronDown,
  ChevronUp,
  MessageSquare,
  Sparkles,
  ExternalLink,
  BookOpen,
  ArrowRight,
  LifeBuoy,
  FileQuestion,
  ThumbsUp,
  ThumbsDown,
  CheckCircle2,
} from "lucide-react";
import { useLanguage } from "../context/LanguageContext";
import { useAuth } from "../context/AuthContext";

interface HelpSupportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenPrivacyModal?: () => void;
  onOpenTicketModal?: () => void;
}

interface FAQItem {
  id: string;
  category: "ai" | "privacy" | "credits" | "tools" | "about";
  questionTr: string;
  questionEn: string;
  answerTr: string;
  answerEn: string;
  tags: string[];
}

const FAQ_DATABASE: FAQItem[] = [
  // 1. AI & GEMINI
  {
    id: "faq_ai_1",
    category: "ai",
    questionTr: "Teknolojik Evrim Takvimi tahminleri neye dayanıyor ve ne kadar güvenilir?",
    questionEn: "What are the Technological Evolution Timeline projections based on and how accurate are they?",
    answerTr:
      "Tahminlerimiz; çok modlu yapay zeka akıl yürütme mimarisi, akademik gelişim aşamaları (1-9), arXiv akademik patent taramaları ve uluslararası fütüroloji trend analizlerine dayanır. Ancak tüm senaryolar olasılıksal simülasyonlardır; kesin bir gelecek garantisi, resmi kurum onayı veya finansal/tıbbi yatırım tavsiyesi içermez.",
    answerEn:
      "Our projections are powered by advanced multimodal AI reasoning architectures, academic development stages (1-9), arXiv preprints, and futurology trend analyses. All scenarios are probabilistic simulations rather than fixed guarantees or official endorsements.",
    tags: ["yapay zeka", "tahmin", "doğruluk", "gelişim", "arxiv", "güvenilirlik"],
  },
  {
    id: "faq_ai_2",
    category: "ai",
    questionTr: "Yapay zeka fütüroloji sorgularım nasıl işlenir?",
    questionEn: "How are my AI futurology queries processed?",
    answerTr:
      "Keşif Portalı'na yazdığınız soru güvenli sunucu proxy'miz üzerinden yapay zeka servisine iletilir. Model, sorunuzu 2026-2060 teknolojik kırılma matrisimizle eşleştirerek gelişim aşaması, tahmini gerçekleşme yılı ve bilimsel dayanakları özetleyen yapılandırılmış bir rapor üretir.",
    answerEn:
      "Your prompt is routed through our secure server proxy. The model correlates your query with our 2026-2060 breakthrough matrix to calculate development stages and timeline feasibility.",
    tags: ["arama", "sorgu", "prompt", "api", "analiz"],
  },
  {
    id: "faq_ai_3",
    category: "ai",
    questionTr: "Yapay zeka halüsinasyonları veya hatalı bilgiler engelleniyor mu?",
    questionEn: "How do you prevent AI hallucinations or false claims?",
    answerTr:
      "Sistemimiz 'Algoritmik Denetim & Anomali Tarama' motorunu kullanır. Üretilen her öngörü, fizik yasaları ve güncel gelişim aşamalarıyla çapraz doğrulamaya tabi tutulur. Tutarsız varsayımlar için ekranda otomatik anomali uyarı bayrakları açılır.",
    answerEn:
      "We utilize an Algorithmic Audit Engine that cross-verifies outputs against physical laws and current development stage baselines, flagging anomalous assumptions automatically.",
    tags: ["halüsinasyon", "denetim", "anomali", "doğrulama"],
  },

  // 2. PRIVACY & DATA
  {
    id: "faq_priv_1",
    category: "privacy",
    questionTr: "Kullanıcı verilerim veya arama geçmişim toplanıyor mu?",
    questionEn: "Is my personal data or prompt history collected?",
    answerTr:
      "Google Gemini Gizlilik Bildirimi (support.google.com/gemini/answer/13594961) standartlarını benimsemekteyiz. Giriş yapmamış misafirlerin sorguları sunucu veritabanında arşivlenmez, yalnızca tarayıcınızın geçici belleğinde tutulur. Kayıtlı üyelerin sorguları ise 'Tahmin Geçmişim' menüsünde sadece kendilerine özel olarak şifreli saklanır. Kişisel verileriniz asla satılmaz.",
    answerEn:
      "In adherence to Google Gemini privacy guidelines, guest queries are never archived in our server databases. Authenticated users' history is encrypted and accessible only to them.",
    tags: ["veri", "gizlilik", "toplama", "kayıt", "arşiv"],
  },
  {
    id: "faq_priv_2",
    category: "privacy",
    questionTr: "Arama geçmişimi ve çerezlerimi nasıl silebilirim?",
    questionEn: "How can I delete my search history and cookies?",
    answerTr:
      "Sitemizin altındaki 'Gizlilik & Çerezler' butonuna tıklayarak '4. Veri Yönetimi & Silme' sekmesine gidebilir ve 'Tüm Yerel İzleri Temizle' butonuna basarak tarayıcınızdaki tüm geçici verileri anında sıfırlayabilirsiniz.",
    answerEn:
      "Click 'Privacy & Cookies' in the footer, navigate to 'Activity & Clear Data', and click 'Erase All Local Footprints' to wipe everything instantly.",
    tags: ["silme", "geçmiş", "çerez", "temizle", "sıfırla"],
  },
  {
    id: "faq_priv_3",
    category: "privacy",
    questionTr: "Google benim istemlerimi görüyor veya modelleri eğitmek için kullanıyor mu?",
    questionEn: "Does Google see my prompts or use them for training?",
    answerTr:
      "Google API politikaları uyarınca, ücretli/üretim API çağrıları modelleri genel olarak eğitmek için kullanılmaz. Ancak Google'ın güvenlik politikası gereği kötüye kullanımı engellemek amacıyla kimlikten arındırılmış örnek denetimler yapılabilir.",
    answerEn:
      "Under Google API policies, enterprise/proxy API prompts are not used to train foundation models. However, de-identified safety checks may be performed to prevent abuse.",
    tags: ["google", "eğitim", "model", "güvenlik"],
  },

  // 3. CREDITS & REWARDS
  {
    id: "faq_cred_1",
    category: "credits",
    questionTr: "Kredi sistemi nasıl çalışır ve +175 hediye krediyi nasıl alırım?",
    questionEn: "How does the credit system work and how do I claim +175 bonus credits?",
    answerTr:
      "Yeni kayıt olan her üyemize anında +175 Ücretsiz Başlangıç Kredisi hediye edilir. Krediler; derin yapay zeka fütüroloji simülasyonları, meslek riski analizleri ve kelebek etkisi projeksiyonları çalıştırılırken harcanır. Ayrıca 'Gelecek Çarkıfeleği' ve günlük giriş ödülleriyle her gün ücretsiz kredi kazanabilirsiniz.",
    answerEn:
      "Every new registered member receives +175 free welcome bonus credits. Credits power deep Gemini reasoning, job risk audits, and butterfly simulations. You also receive daily spin wheel credits.",
    tags: ["kredi", "hediye", "175", "çarkıfelek", "ücretsiz"],
  },
  {
    id: "faq_cred_2",
    category: "credits",
    questionTr: "Misafir kullanıcıların kaç arama hakkı vardır?",
    questionEn: "How many searches do guest visitors have?",
    answerTr:
      "Giriş yapmamış ziyaretçilere sistemi deneyimlemeleri için 1 adet ücretsiz AI keşif hakkı tanınır. 1. arama sonrasında sınırsız sorgulama yapmak, geçmişi kaydetmek ve +175 krediyi almak için ücretsiz kayıt olunması gerekir.",
    answerEn:
      "Unauthenticated guests receive 1 free AI exploration search. To continue exploring without limits, signing up is free and provides +175 bonus credits.",
    tags: ["misafir", "deneme", "kota", "ücretsiz", "hak"],
  },

  // 4. TOOLS & SIMULATORS
  {
    id: "faq_tool_1",
    category: "tools",
    questionTr: "Yapay Zeka Meslek Riski Analizi (Job Risk) nasıl çalışır?",
    questionEn: "How does the AI Job Risk Analyzer work?",
    answerTr:
      "Girdiğiniz mesleği (örn: Yazılımcı, Radyolog, Hukukçu) 2026-2045 arası otomasyon kırılımları, çok modlu ajan sistemleri ve robotik gelişmelerle eşleştirir; ikame edilme risk puanını ve kazanılması gereken yeni yetkinlikleri listeler.",
    answerEn:
      "It correlates your occupation with automation milestones (2026-2045), estimating substitution risk and recommending defensive future-proof competencies.",
    tags: ["meslek", "risk", "kariyer", "otomasyon", "iş"],
  },
  {
    id: "faq_tool_2",
    category: "tools",
    questionTr: "Kelebek Etkisi ve Karşıolgusal Simülatör nedir?",
    questionEn: "What is the Butterfly Effect and Counterfactual Simulator?",
    answerTr:
      "Bir dönüm noktasını değiştirdiğinizde (örneğin: '2029 AGI 5 yıl gecikirse ne olur?'), nedensellik grafiğimiz (Causal DAG) sonraki tüm tıbbi, ekonomik ve uzay hedeflerinin gecikme veya hızlanma zincirleme reaksiyonunu hesaplar.",
    answerEn:
      "Allows you to alter a pivotal technological premise (e.g., 'What if AGI is delayed to 2034?') to simulate cascading ripples across global timelines.",
    tags: ["kelebek", "simülatör", "nedensellik", "agi"],
  },

  // 5. ABOUT PLATFORM
  {
    id: "faq_abt_1",
    category: "about",
    questionTr: "Teknolojik Evrim Takvimi projesinin amacı ve vizyonu nedir?",
    questionEn: "What is the mission of the Technological Evolution Timeline?",
    answerTr:
      "İnsanlığın 2026-2060 yılları arasında karşılaşacağı en büyük varoluşsal sıçramaları (Transhümanizm, Yapay Genel Zeka - AGI, Biyolojik Yaşlanmanın Geri Çevrilmesi, Kuantum Hakimiyeti) bilimsel kanıtlar ve simülasyonlarla görünür kılmak; bireyleri ve araştırmacıları geleceğe hazırlamaktır.",
    answerEn:
      "To illuminate humanity's 2026-2060 existential transitions—Transhumanism, AGI, Longevity Escape Velocity, and Quantum Superiority—through peer-reviewed scientific models.",
    tags: ["hakkında", "vizyon", "transhümanizm", "2060"],
  },
];

export const HelpSupportModal: React.FC<HelpSupportModalProps> = ({
  isOpen,
  onClose,
  onOpenPrivacyModal,
  onOpenTicketModal,
}) => {
  const { language } = useLanguage();
  const isTr = language === "tr";

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<
    "all" | "ai" | "privacy" | "credits" | "tools" | "about"
  >("all");
  const [expandedFaqId, setExpandedFaqId] = useState<string | null>("faq_ai_1");
  const [helpfulFeedback, setHelpfulFeedback] = useState<Record<string, boolean>>({});

  // Filtered FAQs
  const filteredFaqs = useMemo(() => {
    return FAQ_DATABASE.filter((faq) => {
      const matchesCategory =
        selectedCategory === "all" || faq.category === selectedCategory;

      if (!searchQuery.trim()) return matchesCategory;

      const q = searchQuery.toLowerCase().trim();
      const question = (isTr ? faq.questionTr : faq.questionEn).toLowerCase();
      const answer = (isTr ? faq.answerTr : faq.answerEn).toLowerCase();
      const matchTag = faq.tags.some((t) => t.toLowerCase().includes(q));

      return matchesCategory && (question.includes(q) || answer.includes(q) || matchTag);
    });
  }, [searchQuery, selectedCategory, isTr]);

  if (!isOpen) return null;

  const handleFeedback = (faqId: string, isHelpful: boolean) => {
    setHelpfulFeedback((prev) => ({ ...prev, [faqId]: isHelpful }));
  };

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-[120] flex items-center justify-center p-3 sm:p-5 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-200"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-4xl bg-[#0b1021] border border-purple-500/30 rounded-3xl shadow-[0_20px_70px_rgba(25,10,45,0.85)] overflow-hidden font-sans flex flex-col max-h-[90vh]"
      >
        {/* Header with Google Support Look */}
        <div className="bg-gradient-to-r from-slate-900 via-[#191438] to-slate-900 px-5 sm:px-7 py-5 border-b border-white/10 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-purple-500/30 to-indigo-500/20 border border-purple-400/40 flex items-center justify-center text-purple-300 shadow-inner">
              <LifeBuoy className="w-5 h-5 text-purple-300" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-black text-white tracking-tight">
                  {isTr ? "Teknolojik Evrim Takvimi Yardım & Destek Merkezi" : "Help & Support Center"}
                </h3>
                <span className="px-2 py-0.5 rounded-full bg-purple-500/20 border border-purple-500/40 text-[10px] text-purple-300 font-mono font-bold">
                  Google Help Center
                </span>
              </div>
              <p className="text-xs text-slate-400 font-mono">
                {isTr
                  ? "Yapay Zeka Modelleri, Gizlilik İlkeleri, Kredi ve Araç Kullanım Rehberi"
                  : "AI Models, Privacy Guidelines, Credits & Documentation"}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-800/80 hover:bg-rose-500/20 text-slate-400 hover:text-white transition-colors cursor-pointer"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Live Search Bar */}
        <div className="p-4 sm:p-6 bg-slate-950/70 border-b border-white/5 space-y-3 shrink-0">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-purple-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={
                isTr
                  ? "Nasıl yardımcı olabiliriz? (örn: verilerim silinir mi, krediler, gelişim aşaması nedir, olasılık)"
                  : "How can we help? (e.g. data deletion, credits, development stages, probabilities)"
              }
              className="w-full pl-11 pr-10 py-3 rounded-2xl bg-[#12182e] border border-purple-500/30 text-white placeholder-slate-400 text-xs sm:text-sm focus:outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-500/20 transition-all font-sans"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-white"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Category Chips */}
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pt-1">
            <button
              type="button"
              onClick={() => setSelectedCategory("all")}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                selectedCategory === "all"
                  ? "bg-purple-600 text-white shadow-md shadow-purple-900/50"
                  : "bg-white/5 text-slate-300 hover:bg-white/10"
              }`}
            >
              {isTr ? "Tüm Konular" : "All Topics"}
            </button>

            <button
              type="button"
              onClick={() => setSelectedCategory("ai")}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 cursor-pointer ${
                selectedCategory === "ai"
                  ? "bg-purple-600 text-white shadow-md shadow-purple-900/50"
                  : "bg-white/5 text-slate-300 hover:bg-white/10"
              }`}
            >
              <Cpu className="w-3.5 h-3.5" />
              <span>{isTr ? "Yapay Zeka & Gemini" : "AI & Gemini"}</span>
            </button>

            <button
              type="button"
              onClick={() => setSelectedCategory("privacy")}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 cursor-pointer ${
                selectedCategory === "privacy"
                  ? "bg-purple-600 text-white shadow-md shadow-purple-900/50"
                  : "bg-white/5 text-slate-300 hover:bg-white/10"
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>{isTr ? "Gizlilik & Çerezler" : "Privacy & Cookies"}</span>
            </button>

            <button
              type="button"
              onClick={() => setSelectedCategory("credits")}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 cursor-pointer ${
                selectedCategory === "credits"
                  ? "bg-purple-600 text-white shadow-md shadow-purple-900/50"
                  : "bg-white/5 text-slate-300 hover:bg-white/10"
              }`}
            >
              <CreditCard className="w-3.5 h-3.5" />
              <span>{isTr ? "Kredi & Ödüller" : "Credits & Rewards"}</span>
            </button>

            <button
              type="button"
              onClick={() => setSelectedCategory("tools")}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 cursor-pointer ${
                selectedCategory === "tools"
                  ? "bg-purple-600 text-white shadow-md shadow-purple-900/50"
                  : "bg-white/5 text-slate-300 hover:bg-white/10"
              }`}
            >
              <Rocket className="w-3.5 h-3.5" />
              <span>{isTr ? "Araçlar & Simülatör" : "Tools & Simulator"}</span>
            </button>

            <button
              type="button"
              onClick={() => setSelectedCategory("about")}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 cursor-pointer ${
                selectedCategory === "about"
                  ? "bg-purple-600 text-white shadow-md shadow-purple-900/50"
                  : "bg-white/5 text-slate-300 hover:bg-white/10"
              }`}
            >
              <Info className="w-3.5 h-3.5" />
              <span>{isTr ? "Platform Hakkında" : "About Platform"}</span>
            </button>
          </div>
        </div>

        {/* Scrollable FAQ Accordion List */}
        <div className="p-5 sm:p-7 overflow-y-auto space-y-3 font-sans">
          {filteredFaqs.length === 0 ? (
            <div className="p-8 text-center space-y-3 bg-slate-900/50 rounded-2xl border border-white/5">
              <FileQuestion className="w-10 h-10 text-purple-400 mx-auto opacity-70" />
              <h4 className="text-white font-bold text-sm">
                {isTr ? "Aradığınız kriterde bir yanıt bulunamadı" : "No matching questions found"}
              </h4>
              <p className="text-xs text-slate-400">
                {isTr
                  ? "Farklı bir arama kelimesi deneyebilir veya doğrudan Destek Bileti açabilirsiniz."
                  : "Try a different search term or open a support ticket."}
              </p>
            </div>
          ) : (
            filteredFaqs.map((faq) => {
              const isExpanded = expandedFaqId === faq.id;
              const feedback = helpfulFeedback[faq.id];

              return (
                <div
                  key={faq.id}
                  className={`rounded-2xl border transition-all overflow-hidden ${
                    isExpanded
                      ? "bg-[#141b36] border-purple-500/50 shadow-lg shadow-purple-950/40"
                      : "bg-[#0e1429]/70 border-white/5 hover:border-white/15"
                  }`}
                >
                  {/* Accordion Question Header */}
                  <button
                    type="button"
                    onClick={() => setExpandedFaqId(isExpanded ? null : faq.id)}
                    className="w-full p-4 sm:p-4.5 text-left flex items-center justify-between gap-3 cursor-pointer"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 rounded-full bg-purple-400 shrink-0" />
                      <span className="text-xs sm:text-sm font-bold text-white leading-snug">
                        {isTr ? faq.questionTr : faq.questionEn}
                      </span>
                    </div>

                    <div className="shrink-0 text-slate-400">
                      {isExpanded ? (
                        <ChevronUp className="w-4 h-4 text-purple-300" />
                      ) : (
                        <ChevronDown className="w-4 h-4" />
                      )}
                    </div>
                  </button>

                  {/* Expanded Answer Content */}
                  {isExpanded && (
                    <div className="px-4 pb-4.5 sm:px-5 sm:pb-5 space-y-3 text-xs sm:text-sm text-slate-300 border-t border-white/5 pt-3 leading-relaxed animate-in fade-in duration-150">
                      <p>{isTr ? faq.answerTr : faq.answerEn}</p>

                      {/* Helpful Feedback Toolbar (Google Support Standard) */}
                      <div className="pt-3 border-t border-white/5 flex items-center justify-between text-[11px] text-slate-400">
                        <span>{isTr ? "Bu yanıt yardımcı oldu mu?" : "Was this article helpful?"}</span>

                        {feedback !== undefined ? (
                          <span className="text-emerald-400 flex items-center gap-1 font-semibold">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>{isTr ? "Geri bildiriminiz için teşekkürler!" : "Thank you for your feedback!"}</span>
                          </span>
                        ) : (
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => handleFeedback(faq.id, true)}
                              className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-emerald-500/20 hover:text-emerald-300 transition-colors flex items-center gap-1 cursor-pointer"
                            >
                              <ThumbsUp className="w-3 h-3" />
                              <span>{isTr ? "Evet" : "Yes"}</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => handleFeedback(faq.id, false)}
                              className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-rose-500/20 hover:text-rose-300 transition-colors flex items-center gap-1 cursor-pointer"
                            >
                              <ThumbsDown className="w-3 h-3" />
                              <span>{isTr ? "Hayır" : "No"}</span>
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              );
            })
          )}

          {/* Quick Hub Support Action Banner */}
          <div className="mt-6 p-4.5 rounded-2xl bg-gradient-to-r from-purple-950/80 via-[#18133b] to-indigo-950/80 border border-purple-500/40 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs shadow-lg">
            <div className="flex items-start gap-3">
              <span className="p-2 rounded-xl bg-purple-500/20 text-purple-300 text-lg leading-none shrink-0">
                💬
              </span>
              <div>
                <h5 className="font-bold text-white text-sm">
                  {isTr ? "Sorunuzun cevabını bulamadınız mı?" : "Still need answers?"}
                </h5>
                <p className="text-slate-300 text-xs mt-0.5">
                  {isTr
                    ? "Teknik sorunlar, hesap engeli itirazları veya iş birliği için doğrudan destek bileti açabilirsiniz."
                    : "Create a formal support ticket for technical queries, account appeals, or partnerships."}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2.5 shrink-0 w-full sm:w-auto">
              {onOpenPrivacyModal && (
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onOpenPrivacyModal();
                  }}
                  className="w-full sm:w-auto px-3.5 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-200 text-xs font-semibold transition-colors cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" />
                  <span>{isTr ? "Gizlilik Merkezi" : "Privacy Hub"}</span>
                </button>
              )}

              {onOpenTicketModal && (
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onOpenTicketModal();
                  }}
                  className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-xs transition-all shadow-md shadow-purple-900/50 cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                  <span>{isTr ? "Destek Bileti Aç" : "Submit Ticket"}</span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-slate-950 px-5 sm:px-7 py-3 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] text-slate-400 shrink-0 font-mono">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-cyan-400" />
            <span>
              {isTr
                ? "Teknolojik Evrim Takvimi Bilgi Bankası • 7/24 Aktif"
                : "Technological Evolution Timeline Knowledge Base • 24/7 Available"}
            </span>
          </div>

          <div className="flex items-center gap-3">
            <a
              href="https://support.google.com/gemini"
              target="_blank"
              rel="noopener noreferrer"
              className="text-purple-400 hover:text-purple-300 underline flex items-center gap-1 cursor-pointer"
            >
              <span>Google Gemini Help Portal</span>
              <ExternalLink className="w-3 h-3" />
            </a>
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold transition-colors cursor-pointer"
            >
              {isTr ? "Kapat" : "Close"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
