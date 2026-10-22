import React, { useState } from "react";
import {
  X,
  ShieldCheck,
  Eye,
  Trash2,
  Lock,
  Cpu,
  Cookie,
  FileText,
  CheckCircle2,
  AlertTriangle,
  Server,
  Download,
  ExternalLink,
  Sparkles,
  Info,
} from "lucide-react";
import { useLanguage } from "../context/LanguageContext";
import { useAuth } from "../context/AuthContext";

interface PrivacyDataModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTab?: "overview" | "gemini_ai" | "cookies" | "data_management" | "legal";
}

export const PrivacyDataModal: React.FC<PrivacyDataModalProps> = ({
  isOpen,
  onClose,
  initialTab = "overview",
}) => {
  const { language } = useLanguage();
  const { currentUser } = useAuth();
  const isTr = language === "tr";

  const [activeTab, setActiveTab] = useState<
    "overview" | "gemini_ai" | "cookies" | "data_management" | "legal"
  >(initialTab);

  const [clearSuccess, setClearSuccess] = useState<string | null>(null);
  const [downloadSuccess, setDownloadSuccess] = useState<boolean>(false);

  if (!isOpen) return null;

  // Clear local storage and temporary AI cache (Google "Activity Controls" pattern)
  const handleClearLocalData = () => {
    try {
      const keysToClear = [
        "hub_portal_guest_queries_used",
        "has_entered_console",
        "user_recent_searches",
        "cookie_consent_choice",
        "guest_offer_dismissed",
      ];
      keysToClear.forEach((k) => localStorage.removeItem(k));
      sessionStorage.clear();
      setClearSuccess(
        isTr
          ? "Tarayıcınızdaki yerel AI arama geçmişi, oturum çerezleri ve geçici veriler başarıyla temizlendi."
          : "Local AI search history, session cookies, and temporary data have been cleared successfully."
      );
      setTimeout(() => setClearSuccess(null), 4000);
    } catch {
      setClearSuccess(
        isTr ? "Veri temizleme sırasında bir hata oluştu." : "An error occurred while clearing data."
      );
    }
  };

  // Export current session data in JSON format (GDPR Right to Access)
  const handleExportData = () => {
    try {
      const exportObject = {
        exportDate: new Date().toISOString(),
        platform: "Teknolojik Evrim Takvimi - AI Portal",
        userProfile: currentUser
          ? {
              id: currentUser.id,
              email: currentUser.email,
              fullName: currentUser.fullName,
              plan: currentUser.plan,
              joinedDate: currentUser.joinedDate,
            }
          : "Guest User (Unauthenticated)",
        localStorageSnapshot: {
          guestSearchUsed: localStorage.getItem("hub_portal_guest_queries_used") || "0",
          cookieConsent: localStorage.getItem("cookie_consent_choice") || "not_set",
        },
      };

      const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(exportObject, null, 2));
      const downloadAnchor = document.createElement("a");
      downloadAnchor.setAttribute("href", dataStr);
      downloadAnchor.setAttribute("download", `teknolojik_evrim_takvimi_my_data_${Date.now()}.json`);
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();

      setDownloadSuccess(true);
      setTimeout(() => setDownloadSuccess(false), 4000);
    } catch {
      // ignore
    }
  };

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-[120] flex items-center justify-center p-3 sm:p-5 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-200"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-4xl bg-[#0d1222] border border-cyan-500/30 rounded-3xl shadow-[0_20px_70px_rgba(0,0,0,0.85)] overflow-hidden font-sans flex flex-col max-h-[90vh]"
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-slate-900 via-[#131b33] to-slate-900 px-5 sm:px-7 py-4 border-b border-white/10 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-cyan-500/20 border border-cyan-400/40 flex items-center justify-center text-cyan-300 shadow-inner">
              <ShieldCheck className="w-5 h-5 text-cyan-300" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-black text-white tracking-tight">
                  {isTr ? "Gizlilik, Çerezler ve Veri Güvenliği Merkezi" : "Privacy, Cookies & Data Security Hub"}
                </h3>
                <span className="px-2 py-0.5 rounded-full bg-cyan-500/20 border border-cyan-500/40 text-[10px] text-cyan-300 font-mono font-bold">
                  Google Standard
                </span>
              </div>
              <p className="text-xs text-slate-400 font-mono">
                {isTr
                  ? "Google Gemini Uygulamaları Gizlilik Bildirimi (answer/13594961) ile Uyumlu Şeffaflık"
                  : "Compliant with Google Gemini Privacy Notice Standards"}
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

        {/* Tab Navigation */}
        <div className="bg-slate-950/60 border-b border-white/5 px-4 sm:px-6 py-2 flex items-center gap-2 overflow-x-auto shrink-0 no-scrollbar">
          <button
            type="button"
            onClick={() => setActiveTab("overview")}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTab === "overview"
                ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm"
                : "text-slate-400 hover:text-slate-200 hover:bg-white/5"
            }`}
          >
            <Eye className="w-3.5 h-3.5" />
            <span>{isTr ? "1. Genel Bakış & İlkeler" : "1. Overview & Principles"}</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("gemini_ai")}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTab === "gemini_ai"
                ? "bg-purple-500/20 text-purple-300 border border-purple-500/40 shadow-sm"
                : "text-slate-400 hover:text-slate-200 hover:bg-white/5"
            }`}
          >
            <Cpu className="w-3.5 h-3.5" />
            <span>{isTr ? "2. Gemini AI & İstem Verileri" : "2. Gemini AI & Prompts"}</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("cookies")}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTab === "cookies"
                ? "bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-sm"
                : "text-slate-400 hover:text-slate-200 hover:bg-white/5"
            }`}
          >
            <Cookie className="w-3.5 h-3.5" />
            <span>{isTr ? "3. Çerezler & Yerel Bellek" : "3. Cookies & Storage"}</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("data_management")}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTab === "data_management"
                ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-sm"
                : "text-slate-400 hover:text-slate-200 hover:bg-white/5"
            }`}
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>{isTr ? "4. Veri Yönetimi & Silme" : "4. Activity & Clear Data"}</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("legal")}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTab === "legal"
                ? "bg-blue-500/20 text-blue-300 border border-blue-500/40 shadow-sm"
                : "text-slate-400 hover:text-slate-200 hover:bg-white/5"
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>{isTr ? "5. Yasal Haklar (KVKK/GDPR)" : "5. Legal Rights"}</span>
          </button>
        </div>

        {/* Tab Content Body */}
        <div className="p-5 sm:p-7 overflow-y-auto space-y-6 text-slate-300 leading-relaxed text-xs sm:text-sm">
          {/* TAB 1: OVERVIEW */}
          {activeTab === "overview" && (
            <div className="space-y-5 animate-in fade-in duration-150">
              <div className="p-4 rounded-2xl bg-cyan-950/40 border border-cyan-500/30 flex items-start gap-3.5">
                <Info className="w-5 h-5 text-cyan-400 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <h4 className="font-bold text-white text-sm">
                    {isTr ? "Şeffaflık Taahhüdümüz (Google Standardı)" : "Our Transparency Commitment (Google Standard)"}
                  </h4>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    {isTr
                      ? "Teknolojik Evrim Takvimi platformu olarak, gizliliğinizi en az yapay zeka inovasyonu kadar ciddiye alıyoruz. Verilerinizin nasıl toplandığını, nerede saklandığını ve nasıl kontrol edebileceğinizi Google Gemini Gizlilik Bildirimi ilkelerine uygun olarak şeffafça açıklıyoruz."
                      : "As the Technological Evolution Timeline platform, we treat your privacy as seriously as AI innovation. We transparently disclose how data is collected, stored, and managed in compliance with Google Gemini Privacy Notice principles."}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                <div className="p-4 rounded-2xl bg-slate-900/80 border border-white/5 space-y-2">
                  <div className="w-8 h-8 rounded-xl bg-purple-500/20 text-purple-300 flex items-center justify-center font-bold text-sm">
                    1
                  </div>
                  <h5 className="font-bold text-white text-xs">
                    {isTr ? "Hangi Veriler Toplanır?" : "What Data is Collected?"}
                  </h5>
                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    {isTr
                      ? "Gelecek Keşif Portalı'na yazdığınız fütüroloji aramaları, seçilen meslek analizi sorguları ve Firebase Auth ile oluşturduğunuz hesap bilgileri (email, isim)."
                      : "Futurology queries in the Exploration Portal, job risk analyses, and account info via Firebase Auth."}
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-slate-900/80 border border-white/5 space-y-2">
                  <div className="w-8 h-8 rounded-xl bg-cyan-500/20 text-cyan-300 flex items-center justify-center font-bold text-sm">
                    2
                  </div>
                  <h5 className="font-bold text-white text-xs">
                    {isTr ? "Nasıl Kullanılır?" : "How is It Used?"}
                  </h5>
                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    {isTr
                      ? "Sorularınıza analitik yapay zeka motorumuzla anlık simülasyon ve gelişim aşaması analizleri üretmek, oturumunuzu sürdürmek ve kredi bakiyenizi korumak için."
                      : "To generate real-time AI projections via cognitive intelligence, maintain your active session, and manage credits."}
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-slate-900/80 border border-white/5 space-y-2">
                  <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-300 flex items-center justify-center font-bold text-sm">
                    3
                  </div>
                  <h5 className="font-bold text-white text-xs">
                    {isTr ? "Kullanıcı Kontrolü" : "User Control"}
                  </h5>
                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    {isTr
                      ? "Tek tıkla yerel arama geçmişinizi sıfırlayabilir, çerezlerinizi silebilir veya hesabınızın tamamen silinmesini talep edebilirsiniz."
                      : "Clear your local search history and cookies with a single click, or request full account deletion anytime."}
                  </p>
                </div>
              </div>

              {/* Core summary points */}
              <div className="p-4 rounded-2xl bg-slate-900/60 border border-white/10 space-y-2.5">
                <h5 className="font-bold text-white text-xs flex items-center gap-2">
                  <Lock className="w-4 h-4 text-emerald-400" />
                  <span>{isTr ? "Temel Güvenlik Prensiplerimiz" : "Our Core Security Principles"}</span>
                </h5>
                <ul className="space-y-1.5 text-xs text-slate-300 list-disc list-inside">
                  <li>
                    <strong className="text-white">
                      {isTr ? "Kişisel Veriler Satılmaz:" : "No Personal Data is Sold:"}
                    </strong>{" "}
                    {isTr
                      ? "Verileriniz asla 3. taraf reklam şirketlerine satılmaz veya devredilmez."
                      : "Your personal data is never sold to third-party ad brokers."}
                  </li>
                  <li>
                    <strong className="text-white">
                      {isTr ? "Uçtan Uca Şifreleme:" : "End-to-End Encryption:"}
                    </strong>{" "}
                    {isTr
                      ? "Tüm web trafiği HTTPS / TLS 1.3 protokolüyle şifrelenir."
                      : "All web communications are encrypted via HTTPS / TLS 1.3."}
                  </li>
                  <li>
                    <strong className="text-white">
                      {isTr ? "Hassas Bilgi İstememe Kuralı:" : "No Sensitive Personal Prompts:"}
                    </strong>{" "}
                    {isTr
                      ? "Google'ın tavsiyesi doğrultusunda, arama çubuğuna T.C. Kimlik, kredi kartı, şifre veya gizli sağlık verisi yazmamanızı öneririz."
                      : "As recommended by Google, do not input passwords, credit card numbers, or sensitive medical info."}
                  </li>
                </ul>
              </div>
            </div>
          )}

          {/* TAB 2: GEMINI AI & PROMPTS */}
          {activeTab === "gemini_ai" && (
            <div className="space-y-5 animate-in fade-in duration-150">
              <div className="p-4 rounded-2xl bg-purple-950/40 border border-purple-500/30 space-y-2">
                <div className="flex items-center gap-2 font-bold text-purple-300 text-sm">
                  <Cpu className="w-5 h-5 text-purple-400" />
                  <span>
                    {isTr
                      ? "Bilişsel Yapay Zeka & İstem İşleme Süreci"
                      : "Cognitive AI & Prompt Processing"}
                  </span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  {isTr
                    ? "Platformumuz, 2026-2060 dönemi fütüroloji tahminlerini ve bilimsel analizlerini üretmek için gelişmiş bulut bilişim ve yapay zeka altyapısını kullanır. Sorgularınızın arka planda nasıl işlendiğine dair detaylar aşağıdadır:"
                    : "Our platform leverages advanced cloud intelligence to generate futurology projections and development stage analysis. Details on how queries are processed:"}
                </p>
              </div>

              <div className="space-y-3">
                <div className="p-3.5 rounded-xl bg-slate-900/80 border border-white/5 space-y-1.5">
                  <h5 className="font-bold text-white text-xs flex items-center gap-2">
                    <Sparkles className="w-3.5 h-3.5 text-purple-400" />
                    <span>{isTr ? "İstemler (Prompts) Google'a Nasıl İletilir?" : "How Prompts are Sent to Google"}</span>
                  </h5>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    {isTr
                      ? "Arama çubuğuna girdiğiniz metin (örneğin: '2035 Yaşlanmanın Durdurulması'), güvenli sunucu tarafı API çağrısı üzerinden bilişsel yapay zeka servisine iletilir. Model, akademik gelişim aşamalarını ve olasılık senaryolarını hesaplayarak size anlık yanıt döndürür."
                      : "Your search text is sent securely to the AI reasoning engine via server-side API proxy. The model calculates development stage milestones and returns structured intelligence."}
                  </p>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-900/80 border border-white/5 space-y-1.5">
                  <h5 className="font-bold text-white text-xs flex items-center gap-2">
                    <Eye className="w-3.5 h-3.5 text-cyan-400" />
                    <span>
                      {isTr
                        ? "İnsan Denetçiler (Human Reviewers) Verileri Görür mü?"
                        : "Do Human Reviewers Access Prompts?"}
                    </span>
                  </h5>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    {isTr
                      ? "Google'ın resmi Gemini Gizlilik Bildirimi'nde belirtildiği üzere: Kalite ve güvenlik denetimi için seçilen örnek istemler, kullanıcının hesap kimliğinden tamamen arındırılarak (anonimleştirilerek) bağımsız denetçiler tarafından incelenebilir. Bu nedenle şifre veya gizli ticari sırlar gibi verileri sorgulara yazmamanız şarttır."
                      : "In accordance with Google's official privacy policy, sample prompts may be reviewed by trained reviewers to improve safety and quality, strictly de-identified and disconnected from your Google account."}
                  </p>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-900/80 border border-white/5 space-y-1.5">
                  <h5 className="font-bold text-white text-xs flex items-center gap-2">
                    <Server className="w-3.5 h-3.5 text-emerald-400" />
                    <span>
                      {isTr ? "Sorgularınız Bizim Veritabanımızda Saklanır mı?" : "Are Prompts Stored Locally?"}
                    </span>
                  </h5>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    {isTr
                      ? "Misafir ziyaretçilerin sorguları sunucu veritabanımızda arşivlenmez; sadece tarayıcınızın geçici yerel belleğinde (localStorage) tutulur. Kayıtlı üyelerin sorguları ise 'Tahmin Geçmişim' sekmesinde yalnızca kendi hesaplarına özel olarak Firestore'da şifreli tutulur."
                      : "Guest queries are not archived in server databases; they reside in your browser's local memory. Authenticated user queries are securely stored in their private profile history."}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: COOKIES & LOCAL STORAGE */}
          {activeTab === "cookies" && (
            <div className="space-y-5 animate-in fade-in duration-150">
              <div className="p-4 rounded-2xl bg-amber-950/40 border border-amber-500/30 space-y-2">
                <div className="flex items-center gap-2 font-bold text-amber-300 text-sm">
                  <Cookie className="w-5 h-5 text-amber-400" />
                  <span>{isTr ? "Çerez ve Yerel Depolama (LocalStorage) Politikası" : "Cookie & LocalStorage Policy"}</span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  {isTr
                    ? "Çerezler, web sitemizi ziyaret ettiğinizde tarayıcınıza kaydedilen küçük metin dosyalarıdır. Platformumuzda çerezlerin hangi amaçlarla kullanıldığını aşağıda şeffafça görebilirsiniz:"
                    : "Cookies and local storage keys are small files stored in your browser. Below is the full breakdown of how they are utilized:"}
                </p>
              </div>

              <div className="space-y-3">
                <div className="p-3.5 rounded-2xl bg-slate-900/70 border border-white/5 flex items-start gap-3">
                  <span className="p-1.5 rounded-xl bg-emerald-500/20 text-emerald-300 font-bold text-xs shrink-0">
                    Zorunlu
                  </span>
                  <div>
                    <h5 className="font-bold text-white text-xs">
                      {isTr ? "1. Temel & Güvenlik Çerezleri (Zorunlu)" : "1. Essential & Security Storage"}
                    </h5>
                    <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                      {isTr
                        ? "Firebase Authentication oturum belirteçleri, oturum kilidi (Session Lock) güvenliği ve brute-force saldırılarını engellemek için kullanılan oturum kayıtlarıdır. Bunlar olmadan üye girişi yapılamaz."
                        : "Firebase Auth session tokens and security states required to maintain your login securely."}
                    </p>
                  </div>
                </div>

                <div className="p-3.5 rounded-2xl bg-slate-900/70 border border-white/5 flex items-start gap-3">
                  <span className="p-1.5 rounded-xl bg-cyan-500/20 text-cyan-300 font-bold text-xs shrink-0">
                    İşlevsel
                  </span>
                  <div>
                    <h5 className="font-bold text-white text-xs">
                      {isTr ? "2. Tercih ve İşlevsellik Çerezleri" : "2. Preferences & Functionality"}
                    </h5>
                    <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                      {isTr
                        ? "Dil tercihiniz ('tr' veya 'en'), fütüristik fon müziği açık/kapalı durumu, sinematik ses tonu ayarları ve son seçtiğiniz senaryo modu ('optimistik', 'distopik', 'baz')."
                        : "Stores your language preference, ambient audio volume, and chosen scenario modes."}
                    </p>
                  </div>
                </div>

                <div className="p-3.5 rounded-2xl bg-slate-900/70 border border-white/5 flex items-start gap-3">
                  <span className="p-1.5 rounded-xl bg-purple-500/20 text-purple-300 font-bold text-xs shrink-0">
                    Kota
                  </span>
                  <div>
                    <h5 className="font-bold text-white text-xs">
                      {isTr ? "3. Misafir Deneme Kotası (hub_portal_guest_queries_used)" : "3. Guest Exploration Quota"}
                    </h5>
                    <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                      {isTr
                        ? "Giriş yapmamış ziyaretçilere sunulan 1 adet ücretsiz AI keşif hakkının kullanılıp kullanılmadığını yerel olarak sayar. Sunucuya kişisel kimliğinizi iletmez."
                        : "Tracks the 1 free AI exploration search for unauthenticated visitors without transmitting identity."}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: DATA MANAGEMENT & DELETE CONTROLS */}
          {activeTab === "data_management" && (
            <div className="space-y-5 animate-in fade-in duration-150">
              <div className="p-4 rounded-2xl bg-emerald-950/40 border border-emerald-500/30 space-y-2">
                <div className="flex items-center gap-2 font-bold text-emerald-300 text-sm">
                  <Trash2 className="w-5 h-5 text-emerald-400" />
                  <span>
                    {isTr
                      ? "Veri Yönetimi & Etkinlik Kontrolleri (Google Activity Controls)"
                      : "Data Management & Activity Controls"}
                  </span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  {isTr
                    ? "Google standartları uyarınca, verilerinizin kontrolü tamamen sizdedir. İstediğiniz an tarayıcınızdaki verileri indirebilir veya tek tıkla silebilirsiniz."
                    : "Under Google standards, you have complete control over your data. Download your data or erase your local footprint anytime."}
                </p>
              </div>

              {/* Action Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Clear Local Data */}
                <div className="p-4 rounded-2xl bg-slate-900/80 border border-rose-500/20 space-y-3">
                  <div className="flex items-center gap-2.5 text-rose-300 font-bold text-xs">
                    <Trash2 className="w-4 h-4 text-rose-400" />
                    <span>{isTr ? "Yerel Geçmişi ve Çerezleri Temizle" : "Clear Local History & Cookies"}</span>
                  </div>
                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    {isTr
                      ? "Bu tarayıcıda saklanan AI arama geçmişinizi, misafir deneme sayacınızı ve oturum önbelleğinizi anında sıfırlar."
                      : "Instantly erases local prompt history, cached search results, and guest exploration counters on this browser."}
                  </p>
                  <button
                    type="button"
                    onClick={handleClearLocalData}
                    className="w-full py-2.5 px-4 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 border border-rose-500/40 text-rose-200 font-bold text-xs transition-all cursor-pointer flex items-center justify-center gap-2 active:scale-98"
                  >
                    <Trash2 className="w-3.5 h-3.5 text-rose-400" />
                    <span>{isTr ? "Tüm Yerel İzleri Temizle" : "Erase All Local Footprints"}</span>
                  </button>
                </div>

                {/* Export / Download Data */}
                <div className="p-4 rounded-2xl bg-slate-900/80 border border-cyan-500/20 space-y-3">
                  <div className="flex items-center gap-2.5 text-cyan-300 font-bold text-xs">
                    <Download className="w-4 h-4 text-cyan-400" />
                    <span>{isTr ? "Verilerimi İndir (JSON Export)" : "Download My Data (JSON)"}</span>
                  </div>
                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    {isTr
                      ? "GDPR ve KVKK Veri Taşınabilirliği hakkınız uyarınca, mevcut oturum bilgilerinizi ve kayıtlarınızı JSON formatında cihazınıza indirin."
                      : "Export your current session profile and local data footprint in JSON format under GDPR Data Portability."}
                  </p>
                  <button
                    type="button"
                    onClick={handleExportData}
                    className="w-full py-2.5 px-4 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-500/40 text-cyan-200 font-bold text-xs transition-all cursor-pointer flex items-center justify-center gap-2 active:scale-98"
                  >
                    <Download className="w-3.5 h-3.5 text-cyan-400" />
                    <span>{isTr ? "Veri Paketini İndir" : "Download Data Archive"}</span>
                  </button>
                </div>
              </div>

              {/* Status messages */}
              {clearSuccess && (
                <div className="p-3 rounded-xl bg-emerald-950/80 border border-emerald-500/40 text-emerald-300 text-xs flex items-center gap-2 animate-in fade-in">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>{clearSuccess}</span>
                </div>
              )}

              {downloadSuccess && (
                <div className="p-3 rounded-xl bg-cyan-950/80 border border-cyan-500/40 text-cyan-300 text-xs flex items-center gap-2 animate-in fade-in">
                  <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0" />
                  <span>
                    {isTr
                      ? "Veri dosyanız cihazınıza başarıyla indirildi."
                      : "Data file successfully downloaded to your device."}
                  </span>
                </div>
              )}
            </div>
          )}

          {/* TAB 5: LEGAL & KVKK/GDPR */}
          {activeTab === "legal" && (
            <div className="space-y-5 animate-in fade-in duration-150">
              <div className="p-4 rounded-2xl bg-blue-950/40 border border-blue-500/30 space-y-2">
                <div className="flex items-center gap-2 font-bold text-blue-300 text-sm">
                  <FileText className="w-5 h-5 text-blue-400" />
                  <span>{isTr ? "KVKK (6698) ve GDPR Kapsamında Yasal Haklarınız" : "Legal Rights under GDPR & KVKK"}</span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  {isTr
                    ? "6698 sayılı Kişisel Verilerin Korunması Kanunu (KVKK) Madde 11 ve Avrupa Birliği Genel Veri Koruma Tüzüğü (GDPR) uyarınca aşağıdaki haklara sahipsiniz:"
                    : "Under GDPR Article 15-22 and Turkish KVKK Law No. 6698, you possess the following explicit rights:"}
                </p>
              </div>

              <div className="space-y-2.5 text-xs text-slate-300">
                <div className="p-3 rounded-xl bg-slate-900/60 border border-white/5 flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                  <span>
                    <strong className="text-white">{isTr ? "Öğrenme Hakkı:" : "Right of Access:"}</strong>{" "}
                    {isTr
                      ? "Kişisel verilerinizin işlenip işlenmediğini, işlenmişse buna ilişkin bilgi talep etme hakkı."
                      : "Confirm whether personal data concerning you is being processed."}
                  </span>
                </div>

                <div className="p-3 rounded-xl bg-slate-900/60 border border-white/5 flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                  <span>
                    <strong className="text-white">{isTr ? "Düzeltme & Güncelleme:" : "Right to Rectification:"}</strong>{" "}
                    {isTr
                      ? "Eksik veya yanlış işlenmiş kişisel verilerin düzeltilmesini isteme hakkı."
                      : "Request correction of inaccurate or incomplete data."}
                  </span>
                </div>

                <div className="p-3 rounded-xl bg-slate-900/60 border border-white/5 flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                  <span>
                    <strong className="text-white">{isTr ? "Silinme (Unutulma) Hakkı:" : "Right to Erasure:"}</strong>{" "}
                    {isTr
                      ? "Hesabınızı ve tüm sistem kayıtlarınızı kalıcı olarak sildirme talebinde bulunma hakkı."
                      : "Request complete erasure of your profile and data records."}
                  </span>
                </div>

                <div className="p-3 rounded-xl bg-slate-900/60 border border-white/5 flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                  <span>
                    <strong className="text-white">{isTr ? "Veri İletişim:" : "Data Controller Contact:"}</strong>{" "}
                    {isTr
                      ? "Veri sorumlusu ile iletişime geçmek ve yasal hak talebinde bulunmak için Destek Merkezi üzerinden 'Gizlilik & Veri Silme' kategorisinde bilet açabilirsiniz."
                      : "To submit formal data requests, create a ticket in the Support Center under 'Privacy & Data'."}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer info bar */}
        <div className="bg-slate-950 px-5 sm:px-7 py-3 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] text-slate-400 shrink-0 font-mono">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            <span>
              {isTr
                ? "Son Güncelleme: Eylül 2026 • Versiyon 2.4 (Google Gemini Privacy Standard)"
                : "Last Updated: September 2026 • v2.4 (Google Gemini Standard)"}
            </span>
          </div>

          <div className="flex items-center gap-3">
            <a
              href="https://support.google.com/gemini/answer/13594961"
              target="_blank"
              rel="noopener noreferrer"
              className="text-cyan-400 hover:text-cyan-300 underline flex items-center gap-1 cursor-pointer"
            >
              <span>Google Gemini Gizlilik Belgesi</span>
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
