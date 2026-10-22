import React, { useState } from "react";
import {
  X,
  Send,
  Sparkles,
  Mail,
  Building,
  User,
  Globe,
  DollarSign,
  Calendar,
  CheckCircle2,
  Info,
  Phone,
  ArrowRight,
  ShieldCheck,
  Copy,
  Check,
} from "lucide-react";
import { submitSponsorshipInquiry } from "../services/sponsorService";
import { inspectUrlSafety } from "../utils/urlSafety";

interface SponsorshipInquiryModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultPlacement?: string;
}

export const SponsorshipInquiryModal: React.FC<SponsorshipInquiryModalProps> = ({
  isOpen,
  onClose,
  defaultPlacement = "in-feed",
}) => {
  const [companyName, setCompanyName] = useState("");
  const [contactName, setContactName] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [websiteUrl, setWebsiteUrl] = useState("");
  const [targetPlacement, setTargetPlacement] = useState(defaultPlacement);
  const [budget, setBudget] = useState("1.000 - 5.000 TL / Aylık");
  const [durationWeeks, setDurationWeeks] = useState(4);
  const [message, setMessage] = useState("");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [copiedEmail, setCopiedEmail] = useState(false);

  const adminEmail = "warfacelove46@gmail.com";

  if (!isOpen) return null;

  const handleCopyEmail = () => {
    navigator.clipboard.writeText(adminEmail);
    setCopiedEmail(true);
    setTimeout(() => setCopiedEmail(false), 2000);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!companyName.trim() || !contactEmail.trim() || !message.trim()) {
      setErrorMsg("Lütfen Şirket/Proje Adı, İletişim E-postası ve Açıklama alanlarını doldurunuz.");
      return;
    }

    // Safety check on optional website URL
    if (websiteUrl.trim()) {
      const safety = inspectUrlSafety(websiteUrl.trim());
      if (safety.riskLevel === "DANGEROUS") {
        setErrorMsg(`Güvenlik Uyarısı: Girilen web adresi güvenlik politikamız tarafından engellendi (${safety.warningReason || "Tehlikeli protokol veya dosya uzantısı"}). Lütfen geçerli bir şirket web sitesi yazınız.`);
        return;
      }
    }

    try {
      setIsSubmitting(true);
      await submitSponsorshipInquiry({
        companyName: companyName.trim(),
        contactName: contactName.trim(),
        contactEmail: contactEmail.trim(),
        contactPhone: contactPhone.trim(),
        websiteUrl: websiteUrl.trim(),
        budget,
        targetPlacement,
        durationWeeks: Number(durationWeeks),
        message: message.trim(),
      });

      setIsSuccess(true);
    } catch (err: any) {
      setErrorMsg("Başvuru gönderilirken bir hata oluştu: " + (err?.message || "Bilinmeyen hata"));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResetAndClose = () => {
    setIsSuccess(false);
    setCompanyName("");
    setContactName("");
    setContactEmail("");
    setMessage("");
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-2xl bg-slate-900 border border-purple-500/30 rounded-3xl p-6 sm:p-8 shadow-2xl overflow-hidden max-h-[90vh] overflow-y-auto">
        {/* Glow ambient */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-purple-600/10 rounded-full blur-3xl -z-10 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl -z-10 pointer-events-none" />

        {/* Close Button */}
        <button
          onClick={handleResetAndClose}
          className="absolute top-5 right-5 p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white transition cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {isSuccess ? (
          <div className="py-8 text-center space-y-4 animate-fade-in">
            <div className="w-16 h-16 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center mx-auto shadow-lg shadow-emerald-500/20">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-bold text-white font-mono">
              Sponsorluk Başvurunuz Alındı!
            </h3>
            <p className="text-sm text-slate-300 max-w-md mx-auto leading-relaxed">
              Talebiniz doğrudan sistem yöneticisi paneline kaydedildi. Reklam materyalleri, yerleşim ve onay süreci için en geç 24 saat içinde{" "}
              <span className="text-emerald-400 font-mono font-bold">{contactEmail}</span> adresinize dönüş yapılacaktır.
            </p>

            <div className="p-4 rounded-2xl bg-slate-950/60 border border-white/5 text-xs text-slate-400 max-w-md mx-auto font-mono flex items-center justify-between">
              <span>Doğrudan Yönetici İletişimi:</span>
              <span className="text-purple-300 font-bold">{adminEmail}</span>
            </div>

            <button
              onClick={handleResetAndClose}
              className="mt-4 px-6 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-mono font-bold text-sm shadow-lg transition cursor-pointer"
            >
              Tamamla ve Kapat
            </button>
          </div>
        ) : (
          <div>
            {/* Header */}
            <div className="flex items-center gap-3 mb-3">
              <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-400">
                <Sparkles className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                  📢 Sponsorluk & Reklam Alanı Başvurusu
                </h2>
                <p className="text-xs sm:text-sm text-slate-400">
                  Bu alan şu an boş. Markanızı, yapay zeka aracınızı veya projenizi binlerce teknoloji vizyonerine duyurun!
                </p>
              </div>
            </div>

            {/* Direct contact banner */}
            <div className="mb-5 p-3 rounded-2xl bg-purple-950/40 border border-purple-500/30 flex flex-wrap items-center justify-between gap-2 text-xs">
              <div className="flex items-center gap-2 text-purple-200">
                <Mail className="w-4 h-4 text-purple-400 shrink-0" />
                <span>Doğrudan E-posta:</span>
                <span className="font-mono font-bold text-white">{adminEmail}</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleCopyEmail}
                  className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white font-mono text-[11px] flex items-center gap-1 transition cursor-pointer"
                >
                  {copiedEmail ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                  <span>{copiedEmail ? "Kopyalandı!" : "Kopyala"}</span>
                </button>
                <a
                  href={`mailto:${adminEmail}?subject=Sponsorluk%20ve%20Reklam%20Anlasmasi%20Talebi`}
                  className="px-2.5 py-1 rounded-lg bg-purple-600/30 hover:bg-purple-600/50 text-purple-200 font-mono text-[11px] flex items-center gap-1 transition"
                >
                  <span>Mail Gönder</span>
                  <ArrowRight className="w-3 h-3" />
                </a>
              </div>
            </div>

            {/* How it works info badge */}
            <div className="mb-5 p-3.5 rounded-2xl bg-slate-950/60 border border-white/5 text-[11px] text-slate-300 space-y-1.5">
              <div className="flex items-center gap-1.5 text-amber-300 font-bold font-mono">
                <Info className="w-3.5 h-3.5" />
                <span>İnternet Sponsorluk Süreci Nasıl İşler?</span>
              </div>
              <p className="text-slate-400 leading-relaxed">
                1. <strong>Doğrudan Yerleşim:</strong> Sistemimizde uydurma reklam olmaz. Anlaştığımız gerçek markalar akışta yer alır.<br />
                2. <strong>Kullanıcı Teşviki:</strong> Ziyaretçiler reklamınıza tıkladığında simülasyon kredisi kazanır; bu da gerçek ve organik etkileşim sağlar.<br />
                3. <strong>Sözleşme & Süre:</strong> Belirlediğiniz süre boyunca (haftalık/aylık) vitrinde sabit kalır.
              </p>
            </div>

            {errorMsg && (
              <div className="mb-4 p-3 rounded-xl bg-red-950/60 border border-red-500/40 text-red-200 text-xs font-mono">
                {errorMsg}
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-mono text-slate-300 mb-1">
                    Şirket / Proje Adı <span className="text-red-400">*</span>
                  </label>
                  <div className="relative">
                    <Building className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
                    <input
                      type="text"
                      required
                      placeholder="Örn: QuantumAI Yazılım A.Ş."
                      value={companyName}
                      onChange={(e) => setCompanyName(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 bg-slate-950 border border-white/10 rounded-xl text-xs text-white placeholder:text-slate-600 focus:outline-none focus:border-purple-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-mono text-slate-300 mb-1">
                    Yetkili Adı Soyadı
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
                    <input
                      type="text"
                      placeholder="Örn: Ahmet Yılmaz"
                      value={contactName}
                      onChange={(e) => setContactName(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 bg-slate-950 border border-white/10 rounded-xl text-xs text-white placeholder:text-slate-600 focus:outline-none focus:border-purple-500"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-mono text-slate-300 mb-1">
                    İletişim E-postası <span className="text-red-400">*</span>
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
                    <input
                      type="email"
                      required
                      placeholder="iletisim@sirketiniz.com"
                      value={contactEmail}
                      onChange={(e) => setContactEmail(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 bg-slate-950 border border-white/10 rounded-xl text-xs text-white placeholder:text-slate-600 focus:outline-none focus:border-purple-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-mono text-slate-300 mb-1">
                    Web Sitesi Bağlantısı
                  </label>
                  <div className="relative">
                    <Globe className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
                    <input
                      type="url"
                      placeholder="https://sirketiniz.com"
                      value={websiteUrl}
                      onChange={(e) => setWebsiteUrl(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 bg-slate-950 border border-white/10 rounded-xl text-xs text-white placeholder:text-slate-600 focus:outline-none focus:border-purple-500"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-mono text-slate-300 mb-1">
                    İstenen Alan
                  </label>
                  <select
                    value={targetPlacement}
                    onChange={(e) => setTargetPlacement(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-white/10 rounded-xl text-xs text-white focus:outline-none focus:border-purple-500"
                  >
                    <option value="in-feed">Ana Akış İçi Vitrin</option>
                    <option value="horizontal">Geniş Yatay Banner</option>
                    <option value="profile_modal">Profil & Kredi Vitrini</option>
                    <option value="all">Tüm Platform (Özel Paket)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-mono text-slate-300 mb-1">
                    Hedef Süre
                  </label>
                  <select
                    value={durationWeeks}
                    onChange={(e) => setDurationWeeks(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-950 border border-white/10 rounded-xl text-xs text-white focus:outline-none focus:border-purple-500"
                  >
                    <option value={1}>1 Hafta</option>
                    <option value={2}>2 Hafta</option>
                    <option value={4}>1 Ay (30 Gün)</option>
                    <option value={12}>3 Ay (Çeyrek Yıllık)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-mono text-slate-300 mb-1">
                    Hedef Bütçe Aralığı
                  </label>
                  <select
                    value={budget}
                    onChange={(e) => setBudget(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-white/10 rounded-xl text-xs text-white focus:outline-none focus:border-purple-500"
                  >
                    <option value="1.000 - 3.000 TL">1.000 - 3.000 TL</option>
                    <option value="3.000 - 7.500 TL">3.000 - 7.500 TL</option>
                    <option value="7.500 - 15.000 TL">7.500 - 15.000 TL</option>
                    <option value="15.000 TL+">15.000 TL+</option>
                    <option value="Görüşülecek">Birlikte Belirleyelim</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-mono text-slate-300 mb-1">
                  Projeniz / Reklam Mesajınız <span className="text-red-400">*</span>
                </label>
                <textarea
                  required
                  rows={3}
                  placeholder="Kullanıcılara göstermek istediğiniz ürün, hizmet veya kampanya hakkında kısaca bilgi veriniz..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-white/10 rounded-xl text-xs text-white placeholder:text-slate-600 focus:outline-none focus:border-purple-500"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={handleResetAndClose}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-mono transition cursor-pointer"
                >
                  Vazgeç
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-6 py-2 rounded-xl bg-gradient-to-r from-amber-500 via-purple-600 to-indigo-600 hover:opacity-90 text-white font-mono font-bold text-xs flex items-center gap-2 shadow-lg shadow-purple-500/20 transition cursor-pointer disabled:opacity-50"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{isSubmitting ? "Gönderiliyor..." : "Sponsorluk Başvurusunu İlet"}</span>
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};
