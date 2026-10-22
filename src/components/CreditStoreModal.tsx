import React, { useState, useEffect } from "react";
import {
  X,
  Zap,
  Crown,
  CheckCircle2,
  Shield,
  CreditCard,
  Sparkles,
  TrendingUp,
  ShoppingCart,
  Coins,
  Building2,
  Receipt,
  AlertTriangle,
  Scale,
  CheckSquare,
  Square,
  Info,
  Play,
  Film,
  Award,
  MousePointerClick,
  ExternalLink,
  Gift,
  ArrowRight,
  HelpCircle,
  Check,
  FlaskConical,
  Megaphone,
} from "lucide-react";
import { useLanguage } from "../context/LanguageContext";
import { useAuth } from "../context/AuthContext";
import { UserProfile } from "./UserAuthModal";
import { FEATURE_CREDIT_TABLE } from "../utils/creditCosts";
import { RewardedAdModal } from "./RewardedAdModal";
import {
  getTodayRewardedAdStats,
  getTodaySponsorClickStats,
  recordSponsorClick,
  syncSponsorClickStatsFromServer,
  MAX_DAILY_FREE_CREDITS,
  SPONSOR_CLICK_LIMIT_PER_DAY,
  CREDITS_PER_SPONSOR_CLICK,
  CREDITS_PER_REWARDED_AD,
} from "../utils/rewardedAdTracker";
import { getApiHeaders, notifyClientCreditsUpdated } from "../utils/apiClient";
import { fetchActiveSponsorCampaigns, SponsorCampaign } from "../services/sponsorService";
import { SponsorshipInquiryModal } from "./SponsorshipInquiryModal";


interface CreditStoreModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: UserProfile | null;
  onAddCredits: (amount: number) => void;
  onUpgradePlan: (plan: "free" | "pro" | "quantum_vip", addedCredits: number) => void;
  onOpenAuthModal?: () => void;
}

export { FEATURE_COSTS } from "../utils/creditCosts";

// High-Tech Sponsor Offers for Free Credit Clicks
export const SPONSOR_CLICK_OFFERS = [
  {
    id: "quantum_tpu",
    title: "Google Cloud TPU v5e & Kuantum AI",
    desc: "Kuantum ölçekli yapay zeka çıkarımı, nöromorfik modelleme ve derin sinir ağları optimizasyon bulutu.",
    tag: "Yapay Zeka Donanımı",
    url: "https://cloud.google.com/tpu",
    reward: 3,
  },
  {
    id: "nature_biotech",
    title: "Nature Biotech: Hücresel Gençleşme & DNA",
    desc: "2045 telomer onarımı, mRNA sentezi ve DNA tabanlı petabayt düzeyinde biyolojik veri depolama arşivi.",
    tag: "Biyoteknoloji & Sağlık",
    url: "https://www.nature.com/articles/nature25786",
    reward: 3,
  },
  {
    id: "post_quantum_crypto",
    title: "NIST Post-Quantum Cryptography Suite",
    desc: "Kuantum bilgisayarlara karşı kırılması imkansız yeni nesil lattice tabanlı şifreleme protokolleri.",
    tag: "Kuantum Güvenlik",
    url: "https://csrc.nist.gov/projects/post-quantum-cryptography",
    reward: 3,
  },
];

export const CreditStoreModal: React.FC<CreditStoreModalProps> = ({
  isOpen,
  onClose,
  currentUser: propCurrentUser,
  onAddCredits: propOnAddCredits,
  onUpgradePlan: propOnUpgradePlan,
  onOpenAuthModal: propOnOpenAuthModal,
}) => {
  const { language } = useLanguage();
  const auth = useAuth();
  const currentUser = propCurrentUser !== undefined ? propCurrentUser : auth.currentUser;
  const onAddCredits = propOnAddCredits || auth.addCredits;
  const onUpgradePlan = propOnUpgradePlan || auth.upgradePlan;
  const onOpenAuthModal = propOnOpenAuthModal || auth.openAuthModal;

  const [selectedTab, setSelectedTab] = useState<"packages" | "plans" | "rewarded_ads" | "matrix">("packages");
  const [isRewardedAdOpen, setIsRewardedAdOpen] = useState(false);
  const [checkoutItem, setCheckoutItem] = useState<{
    type: "package" | "plan";
    title: string;
    price: string;
    credits: number;
    planType?: "pro" | "quantum_vip";
  } | null>(null);

  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentSuccessMsg, setPaymentSuccessMsg] = useState<string | null>(null);

  const [rewardedAdStats, setRewardedAdStats] = useState(() =>
    getTodayRewardedAdStats(currentUser?.email)
  );
  const [sponsorClickStats, setSponsorClickStats] = useState(() =>
    getTodaySponsorClickStats(currentUser?.email)
  );
  const [activeSponsorCampaigns, setActiveSponsorCampaigns] = useState<SponsorCampaign[]>([]);
  const [isSponsorInquiryOpen, setIsSponsorInquiryOpen] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setRewardedAdStats(getTodayRewardedAdStats(currentUser?.email));
      setSponsorClickStats(getTodaySponsorClickStats(currentUser?.email));
      fetchActiveSponsorCampaigns().then((list) => {
        setActiveSponsorCampaigns(list);
      });
      if (currentUser?.email) {
        fetch("/api/credits/sponsor-click-status", {
          headers: { ...getApiHeaders() },
        })
          .then((r) => r.json())
          .then((data) => {
            if (data?.success) {
              syncSponsorClickStatsFromServer(currentUser.email, {
                clickedToday: data.clickedToday,
                remainingToday: data.remainingToday,
                canClick: data.canClick,
              });
              setSponsorClickStats(getTodaySponsorClickStats(currentUser.email));
            }
          })
          .catch(() => {});
      }
    }
  }, [isOpen, currentUser?.email]);

  if (!isOpen) return null;

  const currentCredits = currentUser?.credits ?? 0;
  const currentPlan = currentUser?.plan ?? "free";

  const handleSponsorClick = async (offer: { id?: string; title: string; url: string; reward?: number }) => {
    if (!currentUser) {
      if (onOpenAuthModal) onOpenAuthModal();
      return;
    }

    try {
      window.open(offer.url, "_blank", "noopener,noreferrer");
    } catch (e) {
      console.warn("Could not open sponsor window:", e);
    }

    try {
      const claimId = `sponsor_modal_${offer.id || offer.title}_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
      const res = await fetch("/api/credits/claim-sponsor-click", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...getApiHeaders(),
        },
        body: JSON.stringify({
          email: currentUser.email,
          campaignId: offer.id || offer.title,
          claimId,
        }),
      });
      const data = await res.json();
      if (data?.success && typeof data.newCredits === "number") {
        notifyClientCreditsUpdated(data.newCredits);
        recordSponsorClick(currentUser.email);
        syncSponsorClickStatsFromServer(currentUser.email, {
          clickedToday: data.clickedToday,
          remainingToday: data.remainingToday,
        });
        const updated = getTodaySponsorClickStats(currentUser.email);
        setSponsorClickStats(updated);
        setPaymentSuccessMsg(
          `🎉 +${data.creditsEarned || 3} Kredi Hesabınıza Eklendi! [${offer.title}] incelemeniz onaylandı.`
        );
        setTimeout(() => setPaymentSuccessMsg(null), 5000);
      } else if (data?.error) {
        setPaymentSuccessMsg(`⚠️ ${data.error}`);
        setTimeout(() => setPaymentSuccessMsg(null), 5000);
      }
    } catch (err) {
      console.warn("Sponsor claim error:", err);
    }
  };


  const handlePurchaseConfirm = () => {
    if (!checkoutItem) return;

    setIsProcessing(true);

    setTimeout(() => {
      setIsProcessing(false);
      if (checkoutItem.type === "package") {
        onAddCredits(checkoutItem.credits);
        setPaymentSuccessMsg(`🎉 Test İşlemi Başarılı! ${checkoutItem.credits} Kredi hesabınıza tanımlanmıştır.`);
      } else if (checkoutItem.type === "plan" && checkoutItem.planType) {
        onUpgradePlan(checkoutItem.planType, checkoutItem.credits);
        setPaymentSuccessMsg(`🚀 Lisansınız [${checkoutItem.title}] olarak güncellendi! +${checkoutItem.credits} Kredi bakiyenize eklendi.`);
      }
      setCheckoutItem(null);

      setTimeout(() => setPaymentSuccessMsg(null), 6000);
    }, 900);
  };

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-[100] flex items-center justify-center p-2 sm:p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-200"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-2xl bg-[#090d18] border border-cyan-500/30 rounded-2xl sm:rounded-3xl shadow-2xl overflow-hidden font-sans max-h-[94dvh] sm:max-h-[90vh] flex flex-col"
      >
        
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-950 via-slate-900 to-cyan-950 p-4 sm:p-6 border-b border-white/10 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-amber-500/20 border border-amber-400/40 flex items-center justify-center text-amber-300 shadow-lg shadow-amber-500/10 shrink-0">
              <Zap className="w-5 h-5 sm:w-6 sm:h-6 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-xs sm:text-base font-bold text-white font-mono">
                  {language === "en" ? "Licensing & Credit Center" : "Lisans & Kredi Yönetim Merkezi"}
                </h3>
                <span className={`px-2 py-0.5 rounded-full text-[9px] sm:text-[10px] font-mono font-bold border ${
                  !currentUser
                    ? "bg-slate-800/80 text-slate-300 border-slate-600/40"
                    : currentPlan === "quantum_vip"
                    ? "bg-purple-500/20 text-purple-300 border-purple-500/40 shadow-sm shadow-purple-500/20"
                    : currentPlan === "pro"
                    ? "bg-cyan-500/20 text-cyan-300 border-cyan-500/40"
                    : "bg-amber-500/20 text-amber-300 border-amber-500/30"
                }`}>
                  {!currentUser ? (language === "en" ? "GUEST / NOT LOGGED IN" : "MİSAFİR / GİRİŞ YAPILMADI") : currentPlan === "quantum_vip" ? "QUANTUM VIP" : currentPlan === "pro" ? "PRO RESEARCH" : "STANDART"}
                </span>
              </div>
              <p className="text-[11px] sm:text-xs text-cyan-300 font-mono mt-0.5">
                {!currentUser
                  ? (language === "en" ? "Active Balance: 0 Credits (Sign in to unlock & sync)" : "Aktif Bakiyeniz: 0 Kredi (Giriş yaparak kaydedin)")
                  : (language === "en" ? `Active Balance: ${currentCredits} Credits` : `Aktif Bakiyeniz: ${currentCredits} Kredi`)}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-slate-300 hover:text-white bg-slate-800/80 hover:bg-slate-800 rounded-xl transition-all border border-white/10 cursor-pointer flex items-center gap-1 font-mono text-xs"
            aria-label="Kapat"
          >
            <X className="w-4 h-4 text-rose-400 sm:text-slate-400" />
            <span className="text-[11px] sm:text-xs hidden xs:inline">Kapat</span>
          </button>
        </div>

        {/* Guest Warning Banner if not logged in */}
        {!currentUser && (
          <div className="mx-4 sm:mx-6 mt-3 p-3 rounded-2xl bg-cyan-950/80 border border-cyan-500/40 text-cyan-200 text-xs font-mono flex items-center justify-between gap-3">
            <div className="flex items-center gap-2 min-w-0">
              <Info className="w-4 h-4 text-cyan-400 shrink-0" />
              <span className="truncate text-[11px] sm:text-xs">
                {language === "en"
                  ? "You are in Guest Mode. Log in to permanently link and sync your credits."
                  : "Misafir Gezgin modundasınız. Kredilerinizin kalıcı kaydedilmesi için giriş yapın."}
              </span>
            </div>
            <button
              onClick={() => {
                auth.openAuthModal();
              }}
              className="px-2.5 py-1 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-[11px] shrink-0 transition-colors cursor-pointer"
            >
              {language === "en" ? "Sign In" : "Giriş Yap"}
            </button>
          </div>
        )}

        {/* Low Credit Notice directing to Daily Spin & Rewarded Ads */}
        {currentCredits < 15 && !paymentSuccessMsg && (
          <div className="mx-4 sm:mx-6 mt-3 p-3 rounded-2xl bg-amber-950/80 border border-amber-500/50 text-amber-200 text-xs font-mono flex flex-col sm:flex-row items-center justify-between gap-3 shadow-lg">
            <div className="flex items-center gap-2 min-w-0">
              <Zap className="w-4 h-4 text-amber-400 shrink-0 fill-amber-400/30" />
              <span className="text-[11px] sm:text-xs">
                {language === "en"
                  ? `Your credit balance is low (${currentCredits} credits). Spin the daily wheel or watch ads to earn free credits.`
                  : `Kredi bakiyeniz (${currentCredits} kredi). Günlük Gelecek Çarkıfeleği'ni çevirerek veya reklam izleyerek ücretsiz kredi kazanabilirsiniz.`}
              </span>
            </div>
            <button
              type="button"
              onClick={() => setSelectedTab("rewarded_ads")}
              className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 font-bold text-xs shrink-0 transition-all cursor-pointer shadow-md flex items-center gap-1.5"
            >
              <Gift className="w-3.5 h-3.5 fill-slate-950" />
              <span>{language === "en" ? "Watch Ads & Earn" : "Reklam İzle & Kazan"}</span>
            </button>
          </div>
        )}

        {/* Success Alert */}
        {paymentSuccessMsg && (
          <div className="mx-6 mt-4 p-3.5 rounded-2xl bg-emerald-950/90 border border-emerald-400 text-emerald-200 text-xs font-mono flex items-center gap-2.5 animate-in slide-in-from-top-2">
            <Sparkles className="w-5 h-5 text-emerald-400 shrink-0 animate-bounce" />
            <span className="flex-1 font-semibold">{paymentSuccessMsg}</span>
          </div>
        )}

        {/* Tab Navigation (Only shown when not in checkout mode) */}
        {!checkoutItem && (
          <div className="flex border-b border-white/10 bg-slate-950/60 px-4 sm:px-6 pt-3 gap-1.5 sm:gap-2 font-mono text-xs shrink-0 overflow-x-auto">
            <button
              onClick={() => setSelectedTab("packages")}
              className={`px-3 sm:px-4 py-2 sm:py-2.5 rounded-t-xl font-bold transition-all border-t border-x cursor-pointer shrink-0 text-[11px] sm:text-xs ${
                selectedTab === "packages"
                  ? "bg-[#090d18] text-amber-300 border-amber-500/40 border-b-transparent shadow-lg"
                  : "border-transparent text-slate-400 hover:text-white"
              }`}
            >
              ⚡ Kredi Paketleri
            </button>
            <button
              onClick={() => setSelectedTab("rewarded_ads")}
              className={`px-3 sm:px-4 py-2 sm:py-2.5 rounded-t-xl font-bold transition-all border-t border-x cursor-pointer shrink-0 text-[11px] sm:text-xs ${
                selectedTab === "rewarded_ads"
                  ? "bg-[#090d18] text-emerald-300 border-emerald-500/40 border-b-transparent shadow-lg"
                  : "border-transparent text-slate-400 hover:text-white"
              }`}
            >
              🎁 Ücretsiz Kredi
            </button>
            <button
              onClick={() => setSelectedTab("matrix")}
              className={`px-3 sm:px-4 py-2 sm:py-2.5 rounded-t-xl font-bold transition-all border-t border-x cursor-pointer shrink-0 text-[11px] sm:text-xs ${
                selectedTab === "matrix"
                  ? "bg-[#090d18] text-purple-300 border-purple-500/40 border-b-transparent shadow-lg"
                  : "border-transparent text-slate-400 hover:text-white"
              }`}
            >
              📊 Şeffaf Kredi Tarifesi
            </button>
          </div>
        )}

        {/* Modal Scrollable Body */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-6 flex-1">
          {/* STEP 2: DEDICATED FULL CHECKOUT VIEW - COMPLIANT SANDBOX TEST MODE */}
          {checkoutItem ? (
            <div className="space-y-4 font-mono text-xs animate-in fade-in duration-200">
              {/* Back to Packages Navigation Header */}
              <div className="flex items-center justify-between bg-slate-900/80 p-3.5 rounded-2xl border border-cyan-500/30">
                <button
                  type="button"
                  onClick={() => setCheckoutItem(null)}
                  className="flex items-center gap-2 text-cyan-300 hover:text-white text-xs font-bold transition-colors cursor-pointer group"
                >
                  <span className="p-1 rounded-lg bg-cyan-950/80 group-hover:bg-cyan-900 border border-cyan-500/30">←</span>
                  <span>Paket Seçimine Geri Dön</span>
                </button>
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 text-[10px] font-bold uppercase tracking-wider flex items-center gap-1.5">
                    <FlaskConical className="w-3.5 h-3.5" />
                    TEST / SANDBOX MODU
                  </span>
                </div>
              </div>

              {/* Selected Item Summary Card */}
              <div className="bg-gradient-to-r from-blue-950/70 via-slate-900 to-cyan-950/70 border border-cyan-500/40 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-lg">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-400/40 flex items-center justify-center text-amber-300 shrink-0">
                    <ShoppingCart className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-white text-sm">
                      {checkoutItem.title}
                    </h4>
                    <p className="text-slate-400 text-[11px] font-sans">
                      Güvenli Ödeme Altyapısı & Lisanslı Entegrasyon Modu
                    </p>
                  </div>
                </div>
                <div className="text-left sm:text-right border-t sm:border-t-0 pt-2 sm:pt-0 border-white/10">
                  <div className="text-lg sm:text-xl font-bold text-amber-300">
                    {checkoutItem.price}
                  </div>
                  <span className="text-[11px] text-emerald-400 font-bold block">
                    +{checkoutItem.credits.toLocaleString()} Kredi Hesabınıza Tanımlanacak
                  </span>
                </div>
              </div>

              {/* Sandbox Compliance & Payment Gateway Notice */}
              <div className="bg-slate-900/90 border border-amber-500/30 rounded-2xl p-4 space-y-3">
                <div className="flex items-center gap-2 text-amber-300 font-bold text-xs font-mono">
                  <Info className="w-4 h-4 text-amber-400 shrink-0" />
                  <span>Ödeme Servisleri İnceleme & Entegrasyon Bilgilendirmesi</span>
                </div>
                <p className="text-slate-300 text-xs font-sans leading-relaxed">
                  Platformumuz şu anda BDDK ve TCMB lisanslı ödeme servis sağlayıcıları (iyzico vb.) resmi entegrasyon başvuru ve güvenlik denetimi aşamasındadır.
                </p>
                <div className="p-3.5 rounded-xl bg-slate-950/80 border border-white/5 space-y-2 text-slate-300 font-sans">
                  <div className="flex items-center gap-2 text-emerald-400 font-mono font-bold text-xs">
                    <CheckCircle2 className="w-4 h-4 shrink-0" />
                    <span>Güvenli Test Modu (0,00 ₺ Gerçek Tahsilat Yapılmaz)</span>
                  </div>
                  <ul className="text-slate-400 text-[11px] space-y-1.5 list-disc list-inside">
                    <li>Bu aşamada gerçek kredi kartı veya banka bilgisi talep edilmez.</li>
                    <li>Aşağıdaki butona tıkladığınızda bakiye test amacıyla doğrudan profilinize yüklenecektir.</li>
                    <li>Resmi üye işyeri başvurusu onaylandığında doğrudan yasal 3D Secure ödeme formu devreye alınacaktır.</li>
                  </ul>
                </div>
              </div>

              {/* Confirm Purchase Action */}
              <div className="flex flex-col sm:flex-row items-center justify-between pt-3 border-t border-white/10 gap-3">
                <button
                  type="button"
                  onClick={() => setCheckoutItem(null)}
                  className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-slate-800 text-slate-300 hover:text-white text-xs font-bold transition-all cursor-pointer text-center"
                >
                  Vazgeç / Geri Dön
                </button>
                <button
                  type="button"
                  disabled={isProcessing}
                  onClick={handlePurchaseConfirm}
                  className="w-full sm:w-auto px-6 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 disabled:opacity-50 disabled:cursor-not-allowed text-slate-950 font-bold text-xs transition-all shadow-lg cursor-pointer flex items-center justify-center gap-2"
                >
                  {isProcessing ? (
                    <span>Test İşlemi Gerçekleştiriliyor...</span>
                  ) : (
                    <span>🧪 Test Modunda Krediyi Yükle (0 ₺ Tahsilat)</span>
                  )}
                </button>
              </div>

              <p className="text-[10px] text-slate-500 text-center font-sans">
                İşlem ve kullanım şartları için sistem genelindeki Kullanım Koşulları ve Gizlilik Politikası geçerlidir.
              </p>
            </div>
          ) : (
            <>
              {/* TAB 1: CREDIT PACKAGES (DECLUTTERED & STREAMLINED) */}
              {selectedTab === "packages" && (
                <div className="space-y-4">
                  {/* Compact Header Bar with Status & Free Credit Action */}
                  <div className="bg-slate-900/70 border border-white/10 rounded-2xl p-3 sm:p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs font-mono">
                    <div className="flex items-center gap-2.5 text-slate-300">
                      <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-300 shrink-0">
                        <FlaskConical className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="text-white font-bold text-xs">Test & İnceleme Aşaması</div>
                        <div className="text-[11px] text-slate-400 font-sans">Ödeme altyapısı onay sürecinde olduğundan paketler test modunda yüklenebilir.</div>
                      </div>
                    </div>
                    <button
                      onClick={() => setIsRewardedAdOpen(true)}
                      className="px-3.5 py-2 rounded-xl bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/40 text-emerald-300 text-xs font-bold transition-all flex items-center justify-center gap-2 shrink-0 cursor-pointer"
                    >
                      <Film className="w-3.5 h-3.5" />
                      <span>Reklamla Bedava Kredi (+15)</span>
                    </button>
                  </div>

                  {/* Packages Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    
                    {/* Pack 1 */}
                    <div className="bg-slate-900 border border-white/10 rounded-2xl p-4 hover:border-amber-500/50 transition-all flex flex-col justify-between space-y-4 group">
                      <div>
                        <div className="text-xs font-mono text-slate-400">Professional Starter</div>
                        <div className="text-2xl font-bold text-white font-mono mt-1 flex items-baseline gap-1">
                          <span>100</span>
                          <span className="text-xs text-amber-400 font-normal">Kredi</span>
                        </div>
                        <p className="text-[11px] text-slate-400 mt-2 font-mono">
                          Analitik veri taraması ve senaryo simülasyonları için temel bakiye.
                        </p>
                      </div>
                      <button
                        onClick={() =>
                          setCheckoutItem({
                            type: "package",
                            title: "100 Kredi Paket Lisansı",
                            price: "₺149.00",
                            credits: 100,
                          })
                        }
                        className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-amber-500 hover:text-slate-950 text-white font-bold text-xs font-mono transition-all border border-white/10 cursor-pointer"
                      >
                        ₺149 Seç ve Test Et
                      </button>
                    </div>

                    {/* Pack 2 */}
                    <div className="bg-slate-900 border-2 border-amber-500/50 rounded-2xl p-4 hover:border-amber-400 transition-all flex flex-col justify-between space-y-4 relative overflow-hidden group shadow-lg shadow-amber-500/10">
                      <div className="absolute top-0 right-0 bg-amber-500 text-slate-950 text-[9px] font-mono font-bold px-2 py-0.5 rounded-bl-lg">
                        ÖNERİLEN POPÜLER BAKIYE
                      </div>
                      <div>
                        <div className="text-xs font-mono text-amber-300">Pro Research Tier</div>
                        <div className="text-2xl font-bold text-white font-mono mt-1 flex items-baseline gap-1">
                          <span>350</span>
                          <span className="text-xs text-amber-400 font-normal">Kredi</span>
                        </div>
                        <p className="text-[11px] text-slate-300 mt-2 font-mono">
                          Derin nedensellik analizi ve genişletilmiş otonom veri optimizasyonu.
                        </p>
                      </div>
                      <button
                        onClick={() =>
                          setCheckoutItem({
                            type: "package",
                            title: "350 Kredi Pro Paket",
                            price: "₺349.00",
                            credits: 350,
                          })
                        }
                        className="w-full py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs font-mono transition-all shadow-md shadow-amber-500/20 cursor-pointer"
                      >
                        ₺349 Seç ve Test Et
                      </button>
                    </div>

                    {/* Pack 3 */}
                    <div className="bg-slate-900 border border-purple-500/40 rounded-2xl p-4 hover:border-purple-400 transition-all flex flex-col justify-between space-y-4 group">
                      <div>
                        <div className="text-xs font-mono text-purple-300">Macro Tier</div>
                        <div className="text-2xl font-bold text-white font-mono mt-1 flex items-baseline gap-1">
                          <span>1,200</span>
                          <span className="text-xs text-purple-400 font-normal">Kredi</span>
                        </div>
                        <p className="text-[11px] text-slate-400 mt-2 font-mono">
                          Yüksek hacimli veri işleme ve gelişmiş senaryo simülasyon kapasitesi.
                        </p>
                      </div>
                      <button
                        onClick={() =>
                          setCheckoutItem({
                            type: "package",
                            title: "1,200 Kredi Macro Paket",
                            price: "₺899.00",
                            credits: 1200,
                          })
                        }
                        className="w-full py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs font-mono transition-all shadow-md shadow-purple-600/20 cursor-pointer"
                      >
                        ₺899 Seç ve Test Et
                      </button>
                    </div>

                  </div>

                  {/* Clean Footer Note */}
                  <div className="pt-2 text-center text-[11px] text-slate-500 font-sans">
                    <span>🛡️ Satın alımlar ve dijital hizmetler için sistem genelindeki Kullanım Koşulları & Sözleşmeler geçerlidir.</span>
                  </div>
                </div>
              )}

              {/* TAB: REWARDED ADS & SPONSOR CLICKS (ÜCRETSİZ KREDİ & GÖREVLER) */}
              {selectedTab === "rewarded_ads" && (
                <div className="space-y-5 font-mono text-xs animate-in fade-in duration-200">
                  <div className="bg-gradient-to-r from-emerald-950/80 via-slate-900 to-teal-950/80 border border-emerald-500/40 rounded-2xl p-4 sm:p-5 space-y-2">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-2 text-emerald-300 font-bold uppercase tracking-wider">
                        <Gift className="w-4 h-4 text-emerald-400 shrink-0" />
                        <span>{language === "en" ? "Daily Free Credit Station (Up to +175/Day)" : "Günlük Ücretsiz Kredi İstasyonu (Günde +175'e Kadar)"}</span>
                      </div>
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40">
                        ⚡ Günlük Potansiyel: {MAX_DAILY_FREE_CREDITS} Kredi
                      </span>
                    </div>
                    <p className="text-slate-300 leading-relaxed text-[11px] font-sans">
                      {language === "en"
                        ? "Watch 15-second sponsor videos (+15 credits each) or explore high-tech partner links (+5 credits each). No credit card required — all simulation tools can be accessed for free!"
                        : "Platformumuzda hiçbir ücret ödemeden 15 saniyelik sponsor videolarını izleyerek (+15 Kredi) ve yüksek teknoloji partner linklerini inceleyerek (+5 Kredi) günde 175 krediye kadar ücretsiz bakiye toplayabilirsiniz!"}
                    </p>
                  </div>

                  {/* Daily Progress & Stats Cards */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                    <div className="bg-slate-900/90 border border-white/10 rounded-2xl p-3 text-center">
                      <div className="text-[10px] text-slate-400 uppercase">Video İzleme</div>
                      <div className="text-lg sm:text-xl font-bold text-white mt-1">
                        {rewardedAdStats.watchedToday} / {rewardedAdStats.maxDaily}
                      </div>
                      <span className="text-[9px] text-emerald-400 font-sans">+{rewardedAdStats.rewardPerAd} Kredi / ad</span>
                    </div>

                    <div className="bg-slate-900/90 border border-white/10 rounded-2xl p-3 text-center">
                      <div className="text-[10px] text-slate-400 uppercase">Sponsor Tıklama</div>
                      <div className="text-lg sm:text-xl font-bold text-cyan-400 mt-1">
                        {sponsorClickStats.clickedToday} / {sponsorClickStats.maxDaily}
                      </div>
                      <span className="text-[9px] text-cyan-300 font-sans">+{sponsorClickStats.rewardPerClick} Kredi / tık</span>
                    </div>

                    <div className="bg-slate-900/90 border border-white/10 rounded-2xl p-3 text-center">
                      <div className="text-[10px] text-slate-400 uppercase">Kalan Haklar</div>
                      <div className="text-lg sm:text-xl font-bold text-amber-400 mt-1">
                        {rewardedAdStats.remainingToday + sponsorClickStats.remainingToday}
                      </div>
                      <span className="text-[9px] text-slate-400 font-sans">Bugün kullanılabilir</span>
                    </div>

                    <div className="bg-slate-900/90 border border-white/10 rounded-2xl p-3 text-center">
                      <div className="text-[10px] text-slate-400 uppercase">Kazanılan Bakiye</div>
                      <div className="text-lg sm:text-xl font-bold text-emerald-400 mt-1">
                        +{rewardedAdStats.watchedToday * CREDITS_PER_REWARDED_AD + sponsorClickStats.clickedToday * CREDITS_PER_SPONSOR_CLICK}
                      </div>
                      <span className="text-[9px] text-emerald-300 font-sans">Bugün eklenen</span>
                    </div>
                  </div>

                  {/* Daily Wheel Shortcut */}
                  <div className="bg-gradient-to-br from-purple-950/50 via-slate-900 to-indigo-950/40 border border-purple-500/40 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xl">
                    <div className="flex items-center gap-3.5">
                      <div className="w-12 h-12 rounded-2xl bg-purple-500/20 border border-purple-400/40 flex items-center justify-center text-purple-400 shrink-0 shadow-lg shadow-purple-500/20">
                        <Gift className="w-6 h-6" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="text-sm sm:text-base font-bold text-white font-mono">
                            {language === "en" ? "Daily Future Spin Wheel" : "Günlük Gelecek Çarkıfeleği"}
                          </h4>
                          <span className="px-2 py-0.5 rounded text-[9px] font-bold bg-purple-500/20 text-purple-300 border border-purple-500/30">
                            {language === "en" ? "Free Daily" : "Günlük Ücretsiz"}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-300 mt-0.5 font-sans">
                          {language === "en"
                            ? "Spin the wheel every 24 hours to win free credits, futuristic cards, and ranking points."
                            : "Her 24 saatte bir çarkıfeleği çevirerek ücretsiz kredi, 2030-2060 teknoloji kartları ve kahin puanı kazanın."}
                        </p>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        onClose();
                        window.dispatchEvent(new CustomEvent("open-spin-wheel"));
                      }}
                      className="w-full sm:w-auto py-2.5 px-5 rounded-xl bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-400 hover:to-indigo-400 text-white font-bold text-xs font-mono transition-all inline-flex items-center justify-center gap-2 shadow-lg shadow-purple-500/20 cursor-pointer active:scale-95 shrink-0"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>{language === "en" ? "Open Wheel" : "Çarkıfeleği Aç"}</span>
                    </button>
                  </div>

                  {/* Section 1: Video Rewarded Ad Action */}
                  <div className="bg-gradient-to-br from-emerald-950/40 via-slate-900 to-teal-950/30 border border-emerald-500/40 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xl">
                    <div className="flex items-center gap-3.5">
                      <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 border border-emerald-400/40 flex items-center justify-center text-emerald-400 shrink-0 shadow-lg shadow-emerald-500/20">
                        <Play className="w-6 h-6 fill-emerald-400/40" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="text-sm sm:text-base font-bold text-white font-mono">
                            {language === "en" ? "15-Second Rewarded Video" : "15 Saniyelik Sponsor Videosu"}
                          </h4>
                          <span className="px-2 py-0.5 rounded text-[9px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                            +{CREDITS_PER_REWARDED_AD} Kredi
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-300 mt-0.5 font-sans">
                          {language === "en"
                            ? `Watch 15s sponsor stream. Remaining today: ${rewardedAdStats.remainingToday} videos.`
                            : `15 saniyelik tanıtımı tamamlayın, krediniz anında yüklensin. Kalan hak: ${rewardedAdStats.remainingToday} video.`}
                        </p>
                      </div>
                    </div>

                    <button
                      type="button"
                      disabled={!rewardedAdStats.canWatch}
                      onClick={() => setIsRewardedAdOpen(true)}
                      className="w-full sm:w-auto py-2.5 px-5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 disabled:opacity-40 text-slate-950 font-bold text-xs font-mono transition-all inline-flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 cursor-pointer active:scale-95 shrink-0"
                    >
                      <Play className="w-3.5 h-3.5 fill-slate-950" />
                      <span>{language === "en" ? "Watch Video (+15)" : "Videoyu İzle (+15 Kredi)"}</span>
                    </button>
                  </div>

                  {/* Section 2: Sponsor Click Offers (Sponsor Tıkla & Kazan) */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-cyan-300 font-bold uppercase tracking-wider text-xs">
                        <MousePointerClick className="w-4 h-4 text-cyan-400" />
                        <span>Sponsor Bağlantılarını Keşfet (+5 Kredi / Tıklama)</span>
                      </div>
                      <span className="text-[10px] text-slate-400 font-mono">
                        Kalan Hak: <strong className="text-cyan-300">{sponsorClickStats.remainingToday}</strong> / {sponsorClickStats.maxDaily}
                      </span>
                    </div>

                    {/* If Admin has active sponsor campaigns, render real sponsor campaigns */}
                    {activeSponsorCampaigns.length > 0 ? (
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 font-sans">
                        {activeSponsorCampaigns.map((camp) => (
                          <div
                            key={camp.id}
                            className="bg-slate-900/90 border border-amber-500/30 hover:border-amber-500/60 rounded-2xl p-3.5 flex flex-col justify-between transition-all space-y-3 shadow-sm"
                          >
                            <div className="space-y-1.5">
                              <div className="flex items-center justify-between gap-1">
                                <span className="text-[9px] font-mono px-2 py-0.5 rounded bg-purple-950 border border-purple-500/30 text-purple-300 font-bold">
                                  {camp.categoryTag || "Sponsor"}
                                </span>
                                <span className="text-[10px] font-mono font-bold text-emerald-400">
                                  +{camp.rewardCredits || 5} Kredi
                                </span>
                              </div>
                              <h5 className="font-bold text-white text-xs line-clamp-1">{camp.brandName} - {camp.title}</h5>
                              <p className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed">
                                {camp.description}
                              </p>
                            </div>

                            <button
                              type="button"
                              disabled={!sponsorClickStats.canClick}
                              onClick={() => handleSponsorClick({ title: camp.brandName, url: camp.targetUrl, reward: camp.rewardCredits })}
                              className="w-full py-2 px-3 rounded-xl bg-purple-950 hover:bg-purple-900 border border-purple-500/40 text-purple-200 font-mono font-bold text-[11px] flex items-center justify-center gap-1.5 transition-all disabled:opacity-40 cursor-pointer active:scale-95"
                            >
                              <ExternalLink className="w-3 h-3 text-purple-400" />
                              <span>{camp.ctaText || "İncele"} & +{camp.rewardCredits || 5} Kazan</span>
                            </button>
                          </div>
                        ))}
                      </div>
                    ) : (
                      /* If no active paid campaigns, provide 'Advertise Here' CTA + official public tech & literature exploration */
                      <div className="space-y-3">
                        {/* ADVERTISE HERE BANNER */}
                        <div className="p-4 rounded-2xl bg-gradient-to-r from-purple-950/60 via-slate-900 to-indigo-950/60 border border-purple-500/30 flex flex-col sm:flex-row items-center justify-between gap-3 text-left">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <Megaphone className="w-4 h-4 text-amber-400" />
                              <span className="text-xs font-bold text-white font-mono">
                                Bu Alana Sponsor Olun / Reklam Verin
                              </span>
                              <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-500/30">
                                Müsait
                              </span>
                            </div>
                            <p className="text-[11px] text-slate-400 max-w-lg leading-relaxed">
                              Teknoloji, yapay zeka ve veri profesyonellerinden oluşan kitlemize ulaşmak için doğrudan sponsorluk anlaşması yapabilirsiniz.
                            </p>
                          </div>
                          <button
                            type="button"
                            onClick={() => setIsSponsorInquiryOpen(true)}
                            className="w-full sm:w-auto px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-purple-600 hover:opacity-90 text-white font-mono font-bold text-xs whitespace-nowrap shadow-md shadow-purple-950/30 transition cursor-pointer"
                          >
                            Reklam Verin & İletişime Geçin
                          </button>
                        </div>

                        {/* Public Science Literature Discovery for earning free credits */}
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 font-sans">
                          {SPONSOR_CLICK_OFFERS.map((offer) => (
                            <div
                              key={offer.id}
                              className="bg-slate-900/90 border border-slate-800 hover:border-cyan-500/50 rounded-2xl p-3.5 flex flex-col justify-between transition-all space-y-3"
                            >
                              <div className="space-y-1.5">
                                <div className="flex items-center justify-between gap-1">
                                  <span className="text-[9px] font-mono px-2 py-0.5 rounded bg-cyan-950 border border-cyan-500/30 text-cyan-300 font-bold">
                                    {offer.tag}
                                  </span>
                                  <span className="text-[10px] font-mono font-bold text-emerald-400">
                                    +{offer.reward} Kredi
                                  </span>
                                </div>
                                <h5 className="font-bold text-white text-xs line-clamp-1">{offer.title}</h5>
                                <p className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed">
                                  {offer.desc}
                                </p>
                              </div>

                              <button
                                type="button"
                                disabled={!sponsorClickStats.canClick}
                                onClick={() => handleSponsorClick(offer)}
                                className="w-full py-2 px-3 rounded-xl bg-cyan-950 hover:bg-cyan-900 border border-cyan-500/40 text-cyan-200 font-mono font-bold text-[11px] flex items-center justify-center gap-1.5 transition-all disabled:opacity-40 cursor-pointer active:scale-95"
                              >
                                <ExternalLink className="w-3 h-3 text-cyan-400" />
                                <span>Kaynak İncele & +{offer.reward} Kazan</span>
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* TAB 2: SUBSCRIPTION PLANS */}
              {selectedTab === "plans" && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5 font-mono">
                  
                  {/* Pro Plan */}
                  <div className="bg-slate-900/90 border border-cyan-500/40 rounded-2xl p-5 space-y-4 flex flex-col justify-between relative">
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-cyan-400 font-bold">PRO GELECEK PLANI</span>
                        <span className="text-xs text-slate-400">₺490 / ay</span>
                      </div>
                      <div className="text-xl font-bold text-white mt-1">1,000 Kredi / Ay</div>
                      <p className="text-xs text-slate-300 mt-2">Bireysel Mesleki Korunma, Biyo-Yaş Haritası ve İndirimli İşlem</p>

                      <ul className="mt-4 space-y-2 text-xs text-slate-300">
                        <li className="flex items-center gap-2">
                          <CheckCircle2 className="w-4 h-4 text-cyan-400" />
                          <span>Aylık Otomatik 1,000 Birim Kredi Tahsisi</span>
                        </li>
                        <li className="flex items-center gap-2">
                          <CheckCircle2 className="w-4 h-4 text-cyan-400" />
                          <span>Meslek Otomasyon Risk Raporuna Tam Erişim</span>
                        </li>
                        <li className="flex items-center gap-2">
                          <CheckCircle2 className="w-4 h-4 text-cyan-400" />
                          <span>Biyolojik Yaş Haritası & 2060 AI Danışman Sohbeti</span>
                        </li>
                        <li className="flex items-center gap-2">
                          <CheckCircle2 className="w-4 h-4 text-cyan-400" />
                          <span>Analiz ve Simülasyonlarda %50 Avantajlı Kredi Maliyeti</span>
                        </li>
                      </ul>
                    </div>

                    <button
                      disabled={currentPlan === "pro"}
                      onClick={() =>
                        setCheckoutItem({
                          type: "plan",
                          title: "Pro Gelecek Planı",
                          price: "₺490 / ay",
                          credits: 1000,
                          planType: "pro",
                        })
                      }
                      className="w-full py-3 rounded-xl bg-cyan-600 hover:bg-cyan-500 disabled:bg-slate-800 disabled:text-slate-500 text-slate-950 font-bold text-xs transition-all shadow-md shadow-cyan-600/20 cursor-pointer"
                    >
                      {currentPlan === "pro" ? "Etkin Lisansınız" : "Pro Plana Yükselt"}
                    </button>
                  </div>

                  {/* Quantum VIP Plan */}
                  <div className="bg-gradient-to-b from-purple-950/60 via-slate-900 to-slate-950 border-2 border-purple-500/60 rounded-2xl p-5 space-y-4 flex flex-col justify-between relative shadow-xl shadow-purple-950/40">
                    <div className="absolute top-0 right-0 bg-gradient-to-r from-purple-500 to-pink-500 text-slate-950 text-[9px] font-bold px-3 py-1 rounded-bl-xl">
                      AİLE & KAPSAMLI GELECEK
                    </div>

                    <div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-purple-300 font-bold flex items-center gap-1">
                          <Crown className="w-4 h-4 text-amber-400" /> QUANTUM VIP
                        </span>
                        <span className="text-xs text-slate-300">₺1,290 / ay</span>
                      </div>
                      <div className="text-xl font-bold text-white mt-1">2,500 Kredi + Aile Güvencesi</div>
                      <p className="text-xs text-purple-200 mt-2">Aile ve Çocuklar İçin Gelecek Planı, Kelebek Etkisi ve Öncelikli İşleme</p>

                      <ul className="mt-4 space-y-2 text-xs text-purple-100">
                        <li className="flex items-center gap-2">
                          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                          <span>2,500 Aylık Kredi + Özel Bulut Sunucu Önceliği</span>
                        </li>
                        <li className="flex items-center gap-2">
                          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                          <span>Aile & Çocuklar İçin Geleceğin Meslekleri Eğitimi</span>
                        </li>
                        <li className="flex items-center gap-2">
                          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                          <span>Kelebek Etkisi & Alternatif Evrenler Simülatörü</span>
                        </li>
                        <li className="flex items-center gap-2">
                          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                          <span>Tüm Simülasyonlarda %75 İndirimli Birim Maliyeti</span>
                        </li>
                      </ul>
                    </div>

                    <button
                      disabled={currentPlan === "quantum_vip"}
                      onClick={() =>
                        setCheckoutItem({
                          type: "plan",
                          title: "Quantum VIP Planı",
                          price: "₺1,290 / ay",
                          credits: 2500,
                          planType: "quantum_vip",
                        })
                      }
                      className="w-full py-3 rounded-xl bg-gradient-to-r from-purple-600 to-pink-500 hover:from-purple-500 hover:to-pink-400 disabled:opacity-50 text-white font-bold text-xs transition-all shadow-lg shadow-purple-600/30 cursor-pointer"
                    >
                      {currentPlan === "quantum_vip" ? "Etkin Lisansınız (VIP)" : "Quantum VIP'ye Yükselt"}
                    </button>
                  </div>

                </div>
              )}

              {/* TAB 3: FEATURE COSTS MATRIX & UPDATED POLICIES */}
              {selectedTab === "matrix" && (
                <div className="space-y-4 font-mono text-xs">
                  {/* Modern Policy & Free Access Highlight Callout */}
                  <div className="bg-gradient-to-r from-cyan-950/80 via-slate-900 to-purple-950/80 border border-cyan-500/40 rounded-2xl p-4 sm:p-5 space-y-3">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-2 text-cyan-300 font-bold uppercase tracking-wider text-xs sm:text-sm">
                        <Shield className="w-4 h-4 text-emerald-400 shrink-0" />
                        <span>Şeffaf Birim Maliyet, Reklam & Lisans Politikası</span>
                      </div>
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-mono">
                        %100 Ücretsiz Kullanılabilir Hibrit Model
                      </span>
                    </div>

                    <div className="p-3.5 bg-cyan-950/50 border border-cyan-500/30 rounded-xl space-y-2 text-cyan-100 text-xs font-sans leading-relaxed">
                      <p>
                        <strong className="text-amber-300 font-mono uppercase">Dönemsel Tahsis, Reklam ve Kredi Politikası (Güncel Sistem):</strong>{" "}
                        Platformumuzda hiçbir kullanıcı yapay zeka analizlerinden mahrum kalmaz! Standart kullanıcılar; hiçbir ücret ödemeden{" "}
                        <strong className="text-emerald-300">15 saniyelik sponsor videolarını izleyerek (+15 Kredi)</strong> ve{" "}
                        <strong className="text-cyan-300">sponsor bağlantılarını inceleyerek (+5 Kredi)</strong> günde{" "}
                        <strong className="text-amber-300 font-mono font-bold">175 Krediye kadar</strong> ücretsiz bakiye biriktirebilir ve tüm simülasyonları sınırsızca çalıştırabilir.
                      </p>
                      <p className="text-[11px] text-slate-300">
                        Ücretli Pro ve Quantum VIP lisanslar ise reklamsız akış, aylık otomatik tahsisli kota havuzları ve %50 - %75 indirimli işlem birim maliyeti sağlar.
                      </p>
                    </div>

                    {/* Quick Earn Banner for Free Credits right on this tab */}
                    <div className="bg-slate-900/95 border border-white/10 rounded-xl p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-lg bg-emerald-500/20 border border-emerald-400/40 flex items-center justify-center text-emerald-300 shrink-0">
                          <Gift className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="text-xs font-bold text-white font-mono">Hemen Bedava Kredi Kazanın</div>
                          <div className="text-[10px] text-slate-400 font-sans">
                            Kalan günlük haklarınızla anında bakiye toplayıp dilediğiniz simülasyonu çalıştırın:
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 flex-wrap">
                        <button
                          type="button"
                          disabled={!rewardedAdStats.canWatch}
                          onClick={() => setIsRewardedAdOpen(true)}
                          className="px-3 py-1.5 rounded-lg bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 disabled:opacity-40 text-slate-950 font-bold font-mono text-[11px] flex items-center gap-1.5 shadow-sm cursor-pointer transition-all active:scale-95"
                        >
                          <Play className="w-3 h-3 fill-slate-950" />
                          <span>Reklam İzle (+15)</span>
                          <span className="text-[9px] opacity-75">({rewardedAdStats.remainingToday} hak)</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => setSelectedTab("rewarded_ads")}
                          className="px-3 py-1.5 rounded-lg bg-cyan-950 hover:bg-cyan-900 text-cyan-200 border border-cyan-500/40 font-bold font-mono text-[11px] flex items-center gap-1.5 cursor-pointer transition-all"
                        >
                          <MousePointerClick className="w-3 h-3 text-cyan-400" />
                          <span>Sponsor Tıkla (+5)</span>
                          <span className="text-[9px] text-cyan-300">({sponsorClickStats.remainingToday} hak)</span>
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Matrix Table Container */}
                  <div className="bg-slate-900 border border-white/10 rounded-2xl p-4 overflow-x-auto space-y-3">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <h4 className="font-bold text-white text-sm flex items-center gap-2">
                        <TrendingUp className="w-4 h-4 text-cyan-400" />
                        <span>Özellik Bazlı Lisans & Kredi Maliyet Tablosu</span>
                      </h4>
                      <div className="flex items-center gap-2 text-[10px] text-slate-400 font-normal font-sans">
                        <span className="flex items-center gap-1 text-emerald-400 font-bold font-mono">
                          <CheckCircle2 className="w-3 h-3" /> Reklamla Sınırsız Açık
                        </span>
                        <span>•</span>
                        <span>Enterprise SLA Güvenceli</span>
                      </div>
                    </div>

                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse min-w-[680px]">
                        <thead>
                          <tr className="border-b border-slate-800 text-slate-400 text-[10px] uppercase font-mono">
                            <th className="pb-2.5 w-[30%]">Özellik & Simülasyon</th>
                            <th className="pb-2.5 text-center text-emerald-300 w-[25%]">
                              <div>Standart (Ücretsiz)</div>
                              <div className="text-[8px] text-emerald-400/80 font-normal normal-case">🎬 Reklam & Tıklamayla Açık</div>
                            </th>
                            <th className="pb-2.5 text-center text-cyan-300 w-[16%]">
                              <div>Pro Plan / Ay</div>
                              <div className="text-[8px] text-slate-400 font-normal normal-case">Reklamsız + Kota</div>
                            </th>
                            <th className="pb-2.5 text-center text-purple-300 w-[16%]">
                              <div>Quantum VIP / Ay</div>
                              <div className="text-[8px] text-slate-400 font-normal normal-case">Özel VIP Sunucu</div>
                            </th>
                            <th className="pb-2.5 text-center text-amber-300 w-[13%]">
                              <div>Birim Kredi</div>
                              <div className="text-[8px] text-slate-400 font-normal normal-case">İşlem Maliyeti</div>
                            </th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800/80 text-xs text-slate-300 font-sans">
                          {Object.values(FEATURE_CREDIT_TABLE).map((item, idx) => (
                            <tr key={`feature-${item.key || 'item'}-${idx}`} className="hover:bg-slate-850/50 transition-colors">
                              <td className="py-3 font-medium">
                                <div className="text-white font-bold text-xs">{item.name}</div>
                                <div className="text-[10px] text-slate-400 font-normal leading-snug mt-0.5">{item.description}</div>
                              </td>
                              <td className="py-3 text-center">
                                <div className="inline-flex flex-col items-center">
                                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold font-mono bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                                    {item.freeTierStatus || "Reklamla Açık"}
                                  </span>
                                  <span className="text-[10px] text-slate-300 font-mono mt-1">
                                    🎬 {item.adEquivalent || "1 Reklam"}
                                  </span>
                                  <span className="text-[9px] text-emerald-400 font-mono">
                                    ⚡ {item.freeTierDailyCapacity || "Günde Çoklu Kullanım"}
                                  </span>
                                </div>
                              </td>
                              <td className="py-3 text-center font-semibold text-cyan-300">
                                <div className="font-mono text-xs">{item.proMonthlyLimit} {item.unitLabel} / ay</div>
                                <div className="text-[9px] text-slate-400 font-mono mt-0.5">+ 750 Kredi Havuzu</div>
                              </td>
                              <td className="py-3 text-center font-bold text-purple-300">
                                <div className="font-mono text-xs">{item.quantumVipMonthlyLimit} {item.unitLabel} / ay</div>
                                <div className="text-[9px] text-purple-400/80 font-mono mt-0.5">+ 2,500 Kredi Havuzu</div>
                              </td>
                              <td className="py-3 text-center font-mono text-[11px]">
                                <span className="text-amber-400 font-bold">{item.baseCost} Kredi</span>
                                <div className="text-[9px] text-slate-400 mt-0.5">Pro: {item.proCost} • VIP: {item.quantumVipCost}</div>
                              </td>
                            </tr>
                          ))}
                          {/* Extra Row for Prediction Voting */}
                          <tr className="hover:bg-slate-850/50 bg-emerald-950/20 border-t border-emerald-500/30">
                            <td className="py-3 font-medium">
                              <div className="text-emerald-300 font-bold text-xs">Tahmin Oylaması ve Yorum</div>
                              <div className="text-[10px] text-slate-400 font-normal leading-snug mt-0.5">
                                Gelecek kehanetlerine oy verme, topluluk istatistiklerini izleme
                              </div>
                            </td>
                            <td className="py-3 text-center font-bold text-emerald-400 font-mono text-xs">
                              <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-500/40">
                                Sınırsız & Ücretsiz
                              </span>
                            </td>
                            <td className="py-3 text-center font-bold text-emerald-400 font-mono text-xs">Sınırsız</td>
                            <td className="py-3 text-center font-bold text-emerald-400 font-mono text-xs">Sınırsız</td>
                            <td className="py-3 text-center font-bold text-emerald-400 font-mono text-xs">0 Kredi (Dahil)</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>

                    {/* Bottom Conversion Cheat Sheet */}
                    <div className="pt-2 border-t border-slate-800">
                      <div className="text-[11px] font-bold text-slate-300 font-mono mb-2 flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                        <span>Hızlı Eşitleme & Günlük Kullanım Kılavuzu:</span>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[10px] font-sans text-slate-300">
                        <div className="p-2 rounded-xl bg-slate-950/60 border border-white/5 flex items-center gap-2">
                          <span className="font-mono font-bold text-emerald-400 shrink-0">1 Reklam (15sn):</span>
                          <span>1 Meslek Otomasyon Analizi VEYA 1 Bilimsel Kaynak Denetimi</span>
                        </div>
                        <div className="p-2 rounded-xl bg-slate-950/60 border border-white/5 flex items-center gap-2">
                          <span className="font-mono font-bold text-cyan-400 shrink-0">2 Reklam (30sn):</span>
                          <span>1 Derin Gelecek Senaryosu VEYA 1 Kelebek Etkisi Simülasyonu</span>
                        </div>
                        <div className="p-2 rounded-xl bg-slate-950/60 border border-white/5 flex items-center gap-2">
                          <span className="font-mono font-bold text-purple-400 shrink-0">1 Reklam (15sn):</span>
                          <span>~3 Kuantum AI Persona Mesajlaşması (5 Ücretsiz Mesaj Dahil)</span>
                        </div>
                        <div className="p-2 rounded-xl bg-slate-950/60 border border-white/5 flex items-center gap-2">
                          <span className="font-mono font-bold text-amber-400 shrink-0">1 Sponsor Tıkla:</span>
                          <span>1 Topluluk Dönüm Noktası Gönderimi (+5 Kredi)</span>
                        </div>
                      </div>
                    </div>

                  </div>
                </div>
              )}
            </>
          )}

        </div>

        {/* Interactive Rewarded Video Ad Modal */}
        <RewardedAdModal
          isOpen={isRewardedAdOpen}
          onClose={() => setIsRewardedAdOpen(false)}
          onRewardClaimed={(earnedCredits) => {
            setPaymentSuccessMsg(
              language === "en"
                ? `🎉 Congratulations! +${earnedCredits} Credits deposited to your account.`
                : `🎉 Tebrikler! +${earnedCredits} Kredi başarıyla hesabınıza yüklendi.`
            );
          }}
        />

        {/* Sponsorship Inquiry Modal */}
        <SponsorshipInquiryModal
          isOpen={isSponsorInquiryOpen}
          onClose={() => setIsSponsorInquiryOpen(false)}
          defaultPlacement="in-feed"
        />

      </div>
    </div>
  );
};
