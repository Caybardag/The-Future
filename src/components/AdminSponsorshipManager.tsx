import React, { useState, useEffect } from "react";
import {
  Megaphone,
  PlusCircle,
  Trash2,
  ExternalLink,
  CheckCircle2,
  Clock,
  Mail,
  Building,
  DollarSign,
  Calendar,
  AlertTriangle,
  RefreshCw,
  Info,
  Eye,
  MousePointerClick,
  Sparkles,
  Check,
  X,
  ChevronDown,
  ChevronUp,
  FileText,
  Send,
  HelpCircle,
  ShieldAlert,
  ShieldCheck,
} from "lucide-react";
import {
  fetchAllSponsorCampaigns,
  saveSponsorCampaign,
  deleteSponsorCampaign,
  toggleCampaignActive,
  fetchSponsorshipInquiries,
  updateInquiryStatus,
  SponsorCampaign,
  SponsorshipInquiry,
} from "../services/sponsorService";
import { inspectUrlSafety } from "../utils/urlSafety";

export const AdminSponsorshipManager: React.FC = () => {
  const [campaigns, setCampaigns] = useState<SponsorCampaign[]>([]);
  const [inquiries, setInquiries] = useState<SponsorshipInquiry[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showGuide, setShowGuide] = useState(true);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  // New Campaign Form State
  const [brandName, setBrandName] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [targetUrl, setTargetUrl] = useState("");
  const [categoryTag, setCategoryTag] = useState("Yapay Zeka & Bulut");
  const [ctaText, setCtaText] = useState("Hemen İncele");
  const [rewardCredits, setRewardCredits] = useState(5);
  const [placement, setPlacement] = useState<"all" | "in-feed" | "horizontal" | "profile_modal">("all");
  const [endDate, setEndDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 30);
    return d.toISOString().split("T")[0];
  });
  const [contactEmail, setContactEmail] = useState("");

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [cList, iList] = await Promise.all([
        fetchAllSponsorCampaigns(),
        fetchSponsorshipInquiries(),
      ]);
      setCampaigns(cList);
      setInquiries(iList);
    } catch (e) {
      console.warn("Failed to load sponsorship data:", e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCreateCampaign = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!brandName.trim() || !title.trim() || !targetUrl.trim() || !description.trim()) {
      alert("Lütfen Marka Adı, Başlık, Hedef URL ve Açıklama alanlarını eksiksiz doldurunuz.");
      return;
    }

    try {
      setIsLoading(true);
      const todayStr = new Date().toISOString().split("T")[0];
      const created = await saveSponsorCampaign({
        brandName: brandName.trim(),
        title: title.trim(),
        description: description.trim(),
        targetUrl: targetUrl.trim(),
        categoryTag: categoryTag.trim() || "Teknoloji",
        ctaText: ctaText.trim() || "İncele",
        rewardCredits: Number(rewardCredits) || 5,
        placement,
        startDate: todayStr,
        endDate,
        isActive: true,
        contactEmail: contactEmail.trim(),
      });

      // Reset form
      setBrandName("");
      setTitle("");
      setDescription("");
      setTargetUrl("");
      setContactEmail("");

      setActionSuccess(`✅ "${created.brandName}" kampanyası başarıyla yayına alındı! Artık ilgili alanlarda görünecek.`);
      setTimeout(() => setActionSuccess(null), 5000);
      await loadData();
    } catch (err: any) {
      alert("Kampanya kaydedilemedi: " + (err?.message || "Bilinmeyen hata"));
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleActive = async (campaign: SponsorCampaign) => {
    try {
      const nextState = !campaign.isActive;
      await toggleCampaignActive(campaign.id, nextState);
      setCampaigns((prev) =>
        prev.map((c) => (c.id === campaign.id ? { ...c, isActive: nextState } : c))
      );
      setActionSuccess(`"${campaign.brandName}" durumu ${nextState ? "AKTİF" : "PASİF"} yapıldı.`);
      setTimeout(() => setActionSuccess(null), 3000);
    } catch (e) {
      alert("Durum güncellenemedi.");
    }
  };

  const handleDeleteCampaign = async (id: string, name: string) => {
    if (!confirm(`"${name}" sponsor kampanyasını kalıcı olarak silmek istediğinize emin misiniz?`)) {
      return;
    }
    try {
      await deleteSponsorCampaign(id);
      setCampaigns((prev) => prev.filter((c) => c.id !== id));
      setActionSuccess(`"${name}" kampanyası sistemden silindi.`);
      setTimeout(() => setActionSuccess(null), 3000);
    } catch (e) {
      alert("Silinemedi.");
    }
  };

  const handleUpdateInquiryStatus = async (
    id: string,
    status: SponsorshipInquiry["status"]
  ) => {
    try {
      await updateInquiryStatus(id, status);
      setInquiries((prev) =>
        prev.map((i) => (i.id === id ? { ...i, status } : i))
      );
    } catch (e) {
      alert("Durum güncellenemedi.");
    }
  };

  const activeCount = campaigns.filter((c) => c.isActive).length;
  const totalImpressions = campaigns.reduce((acc, c) => acc + (c.impressionCount || 0), 0);
  const totalClicks = campaigns.reduce((acc, c) => acc + (c.clickCount || 0), 0);
  const pendingInquiriesCount = inquiries.filter((i) => i.status === "new").length;

  return (
    <div className="space-y-6">
      {/* SUCCESS BANNER */}
      {actionSuccess && (
        <div className="p-4 rounded-2xl bg-emerald-950/80 border border-emerald-500/40 text-emerald-200 text-sm font-mono flex items-center justify-between animate-fade-in shadow-lg shadow-emerald-950/40">
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
            <span>{actionSuccess}</span>
          </div>
          <button
            onClick={() => setActionSuccess(null)}
            className="p-1 text-emerald-400 hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* STATS OVERVIEW */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-4 rounded-2xl bg-slate-950 border border-white/10 flex flex-col justify-between">
          <span className="text-[11px] font-mono text-slate-400 flex items-center gap-1.5">
            <Megaphone className="w-3.5 h-3.5 text-amber-400" />
            <span>Aktif Sponsorlar</span>
          </span>
          <div className="text-2xl font-black text-white font-mono mt-2">
            {activeCount}{" "}
            <span className="text-xs font-normal text-slate-500">/ {campaigns.length}</span>
          </div>
          <span className="text-[10px] text-slate-500 mt-1">
            {activeCount === 0 ? "Şu an boş (Reklam Ver daveti açık)" : "Yayında"}
          </span>
        </div>

        <div className="p-4 rounded-2xl bg-slate-950 border border-white/10 flex flex-col justify-between">
          <span className="text-[11px] font-mono text-slate-400 flex items-center gap-1.5">
            <Mail className="w-3.5 h-3.5 text-purple-400" />
            <span>Bekleyen Başvurular</span>
          </span>
          <div className="text-2xl font-black text-purple-300 font-mono mt-2">
            {pendingInquiriesCount}
          </div>
          <span className="text-[10px] text-slate-500 mt-1">Ziyaretçi teklifleri</span>
        </div>

        <div className="p-4 rounded-2xl bg-slate-950 border border-white/10 flex flex-col justify-between">
          <span className="text-[11px] font-mono text-slate-400 flex items-center gap-1.5">
            <Eye className="w-3.5 h-3.5 text-blue-400" />
            <span>Toplam Gösterim</span>
          </span>
          <div className="text-2xl font-black text-blue-300 font-mono mt-2">
            {totalImpressions.toLocaleString()}
          </div>
          <span className="text-[10px] text-slate-500 mt-1">Kullanıcı ekranında</span>
        </div>

        <div className="p-4 rounded-2xl bg-slate-950 border border-white/10 flex flex-col justify-between">
          <span className="text-[11px] font-mono text-slate-400 flex items-center gap-1.5">
            <MousePointerClick className="w-3.5 h-3.5 text-emerald-400" />
            <span>Organik Tıklanma</span>
          </span>
          <div className="text-2xl font-black text-emerald-300 font-mono mt-2">
            {totalClicks.toLocaleString()}
          </div>
          <span className="text-[10px] text-slate-500 mt-1">
            CTR: {totalImpressions > 0 ? ((totalClicks / totalImpressions) * 100).toFixed(1) : 0}%
          </span>
        </div>
      </div>

      {/* COMPREHENSIVE GUIDE: İNTERNET REKLAMCILIĞI & PROSEDÜRÜ NASIL İŞLER? */}
      <div className="rounded-2xl border border-purple-500/30 bg-gradient-to-r from-purple-950/40 via-slate-950 to-indigo-950/40 p-5 shadow-xl">
        <div
          className="flex items-center justify-between cursor-pointer"
          onClick={() => setShowGuide(!showGuide)}
        >
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-purple-500/20 text-purple-300">
              <HelpCircle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white font-mono flex items-center gap-2">
                <span>İnternet Reklam & Sponsorluk Prosedürü Nasıl İşler? (Rehber)</span>
                <span className="text-[10px] font-mono font-normal px-2 py-0.5 rounded-full bg-purple-900/60 text-purple-200 border border-purple-500/30">
                  Adım Adım Rehber
                </span>
              </h3>
              <p className="text-xs text-slate-400">
                Sitenize nasıl sponsor bulursunuz, ücretlendirme ve yayın prosedürleri nasıl yürütülür?
              </p>
            </div>
          </div>
          <button className="p-2 text-slate-400 hover:text-white">
            {showGuide ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
          </button>
        </div>

        {showGuide && (
          <div className="mt-4 pt-4 border-t border-white/10 grid grid-cols-1 md:grid-cols-3 gap-4 text-xs text-slate-300 leading-relaxed">
            <div className="p-3.5 rounded-xl bg-slate-900/80 border border-white/5 space-y-2">
              <div className="font-bold text-amber-300 font-mono flex items-center gap-1.5">
                <span className="w-5 h-5 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center text-[10px]">
                  1
                </span>
                <span>Doğrudan Sponsorluk (En Karlı Model)</span>
              </div>
              <p className="text-slate-400">
                Teknoloji, yapay zeka ve yazılım firmaları sitenizin hedef kitlesine ulaşmak için doğrudan sizinle anlaşır. Aracı reklam ajansı komisyonu kesilmez; tüm ücret doğrudan size ödenir.
              </p>
              <div className="p-2 rounded bg-black/40 text-[11px] font-mono text-slate-300">
                💡 <strong>Örnek Model:</strong> Aylık 2.500 TL veya 100$ sabit ücretle ana akış vitrini kiralama.
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-900/80 border border-white/5 space-y-2">
              <div className="font-bold text-cyan-300 font-mono flex items-center gap-1.5">
                <span className="w-5 h-5 rounded-full bg-cyan-500/20 text-cyan-400 flex items-center justify-center text-[10px]">
                  2
                </span>
                <span>İletişim, Sözleşme & Ödeme Adımı</span>
              </div>
              <p className="text-slate-400">
                Firma, sitedeki <strong>"Reklam Ver"</strong> butonuna tıklar ve form doldurur (veya <code>warfacelove46@gmail.com</code> adresine yazar).
              </p>
              <p className="text-slate-400">
                Gelen kutusundaki talebi inceler, firma ile süreyi ve fiyatı teyit edersiniz. Ödeme banka havalesi veya EFT ile hesabınıza geldikten sonra yayını açarsınız.
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-900/80 border border-white/5 space-y-2">
              <div className="font-bold text-emerald-300 font-mono flex items-center gap-1.5">
                <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-[10px]">
                  3
                </span>
                <span>Panele Ekleme & Otomatik Yayından Kaldırma</span>
              </div>
              <p className="text-slate-400">
                Aşağıdaki <strong>"Yeni Sponsor Kampanyası Ekle"</strong> formuna firmanın adını, tanıtım cümlesini, hedef linkini ve bitiş tarihini girip <strong>"Yayına Al"</strong> butonuna basarsınız.
              </p>
              <p className="text-slate-400">
                Süre dolunca sistem reklamı otomatik olarak kaldırır ve o alan tekrar <strong>"Reklam Ver / Sponsor Ol"</strong> davetine dönüşür!
              </p>
            </div>
          </div>
        )}
      </div>

      {/* TWO COLUMN WORKSPACE: CREATE CAMPAIGN & ACTIVE CAMPAIGNS */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* LEFT: CREATE NEW SPONSOR FORM (5 Cols) */}
        <div className="lg:col-span-5 bg-slate-950 p-5 rounded-2xl border border-white/10 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-white/10">
            <div className="flex items-center gap-2">
              <PlusCircle className="w-5 h-5 text-amber-400" />
              <h3 className="text-sm font-bold text-white font-mono">Yeni Sponsor Kampanyası Ekle</h3>
            </div>
            <span className="text-[10px] font-mono text-slate-400">Anında Canlıya Geçer</span>
          </div>

          <form onSubmit={handleCreateCampaign} className="space-y-3">
            <div>
              <label className="block text-[11px] font-mono text-slate-300 mb-1">
                Marka / Şirket Adı <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="Örn: Google Cloud, OpenAI, Hosting Firması"
                value={brandName}
                onChange={(e) => setBrandName(e.target.value)}
                className="w-full px-3 py-2 bg-slate-900 border border-white/10 rounded-xl text-xs text-white placeholder:text-slate-600 focus:outline-none focus:border-purple-500"
              />
            </div>

            <div>
              <label className="block text-[11px] font-mono text-slate-300 mb-1">
                Kampanya Başlığı <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="Örn: Yeni Nesil Bulut Sunucularda %50 İndirim"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-3 py-2 bg-slate-900 border border-white/10 rounded-xl text-xs text-white placeholder:text-slate-600 focus:outline-none focus:border-purple-500"
              />
            </div>

            <div>
              <label className="block text-[11px] font-mono text-slate-300 mb-1">
                Kampanya Açıklaması (1-2 Cümle) <span className="text-red-400">*</span>
              </label>
              <textarea
                required
                rows={2}
                placeholder="Örn: 10,000x daha hızlı nöromorfik yapay zeka çıkarımı ve yüksek performanslı sunucular."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-3 py-2 bg-slate-900 border border-white/10 rounded-xl text-xs text-white placeholder:text-slate-600 focus:outline-none focus:border-purple-500"
              />
            </div>

            <div>
              <label className="block text-[11px] font-mono text-slate-300 mb-1">
                Hedef Web Bağlantısı (URL) <span className="text-red-400">*</span>
              </label>
              <input
                type="url"
                required
                placeholder="https://sponsor-sirket.com/kampanya"
                value={targetUrl}
                onChange={(e) => setTargetUrl(e.target.value)}
                className="w-full px-3 py-2 bg-slate-900 border border-white/10 rounded-xl text-xs text-white placeholder:text-slate-600 focus:outline-none focus:border-purple-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-mono text-slate-300 mb-1">
                  Kategori Etiketi
                </label>
                <input
                  type="text"
                  placeholder="Örn: AI & Donanım"
                  value={categoryTag}
                  onChange={(e) => setCategoryTag(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-900 border border-white/10 rounded-xl text-xs text-white focus:outline-none focus:border-purple-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-mono text-slate-300 mb-1">
                  Buton Metni (CTA)
                </label>
                <input
                  type="text"
                  placeholder="Örn: İncele / Keşfet"
                  value={ctaText}
                  onChange={(e) => setCtaText(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-900 border border-white/10 rounded-xl text-xs text-white focus:outline-none focus:border-purple-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-mono text-slate-300 mb-1">
                  Gösterim Alanı
                </label>
                <select
                  value={placement}
                  onChange={(e: any) => setPlacement(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-900 border border-white/10 rounded-xl text-xs text-white focus:outline-none focus:border-purple-500"
                >
                  <option value="all">Tüm Alanlar</option>
                  <option value="in-feed">Ana Akış İçi Vitrin</option>
                  <option value="horizontal">Yatay Banner</option>
                  <option value="profile_modal">Profil Modalı</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-mono text-slate-300 mb-1">
                  Bitiş Tarihi (Sona Erme)
                </label>
                <input
                  type="date"
                  required
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-900 border border-white/10 rounded-xl text-xs text-white focus:outline-none focus:border-purple-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-mono text-slate-300 mb-1">
                  Tıklama Kredi Ödülü
                </label>
                <input
                  type="number"
                  min={1}
                  max={50}
                  value={rewardCredits}
                  onChange={(e) => setRewardCredits(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-slate-900 border border-white/10 rounded-xl text-xs text-white focus:outline-none focus:border-purple-500"
                />
                <span className="text-[10px] text-slate-500">Ziyaretçiye verilecek</span>
              </div>

              <div>
                <label className="block text-[11px] font-mono text-slate-300 mb-1">
                  Firma İletişim E-postası
                </label>
                <input
                  type="email"
                  placeholder="reklam@firma.com"
                  value={contactEmail}
                  onChange={(e) => setContactEmail(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-900 border border-white/10 rounded-xl text-xs text-white placeholder:text-slate-600 focus:outline-none focus:border-purple-500"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full mt-2 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 via-purple-600 to-indigo-600 hover:opacity-90 text-white font-mono font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-purple-500/20 transition cursor-pointer disabled:opacity-50"
            >
              <Megaphone className="w-4 h-4" />
              <span>{isLoading ? "Kaydediliyor..." : "Sponsor Kampanyasını Yayına Al"}</span>
            </button>
          </form>
        </div>

        {/* RIGHT: LIST OF ACTIVE & SAVED CAMPAIGNS (7 Cols) */}
        <div className="lg:col-span-7 bg-slate-950 p-5 rounded-2xl border border-white/10 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-white/10">
            <div className="flex items-center gap-2">
              <Megaphone className="w-5 h-5 text-purple-400" />
              <h3 className="text-sm font-bold text-white font-mono">
                Kayıtlı Sponsor Kampanyaları ({campaigns.length})
              </h3>
            </div>
            <button
              onClick={loadData}
              className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white transition cursor-pointer"
              title="Yenile"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? "animate-spin" : ""}`} />
            </button>
          </div>

          {campaigns.length === 0 ? (
            <div className="py-12 text-center space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-slate-900 border border-white/5 text-slate-500 flex items-center justify-center mx-auto">
                <Megaphone className="w-6 h-6" />
              </div>
              <p className="text-sm font-mono text-slate-300 font-bold">Henüz Anlaşmalı Sponsor Yok</p>
              <p className="text-xs text-slate-500 max-w-sm mx-auto leading-relaxed">
                Tüm sponsorlu alanlar şu an otomatik olarak <strong>"Bu Alana Sponsor Olun / Reklam Verin"</strong> davet modunda çalışmaktadır. Sol taraftaki formdan yeni bir sponsor eklediğinizde anında yayına girecektir.
              </p>
            </div>
          ) : (
            <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1">
              {campaigns.map((c) => (
                <div
                  key={c.id}
                  className={`p-4 rounded-xl border transition-all ${
                    c.isActive
                      ? "bg-slate-900/90 border-amber-500/30 shadow-md shadow-amber-500/5"
                      : "bg-slate-950/60 border-white/5 opacity-60"
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-white font-mono">{c.brandName}</span>
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-purple-950/80 text-purple-300 border border-purple-500/30">
                          {c.categoryTag}
                        </span>
                        <span
                          className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold ${
                            c.isActive
                              ? "bg-emerald-950/80 text-emerald-300 border border-emerald-500/30"
                              : "bg-slate-800 text-slate-400"
                          }`}
                        >
                          {c.isActive ? "YAYINDA" : "PASİF"}
                        </span>
                      </div>
                      <h4 className="text-xs font-semibold text-slate-200 mt-1">{c.title}</h4>
                      <p className="text-[11px] text-slate-400 mt-0.5 line-clamp-2">{c.description}</p>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        onClick={() => handleToggleActive(c)}
                        className={`px-2 py-1 rounded-lg text-[10px] font-mono font-bold transition cursor-pointer ${
                          c.isActive
                            ? "bg-amber-500/20 text-amber-300 hover:bg-amber-500/30 border border-amber-500/30"
                            : "bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30 border border-emerald-500/30"
                        }`}
                      >
                        {c.isActive ? "Durdur" : "Aktif Et"}
                      </button>
                      <button
                        onClick={() => handleDeleteCampaign(c.id, c.brandName)}
                        className="p-1.5 rounded-lg bg-red-950/40 hover:bg-red-900/60 text-red-400 border border-red-500/30 transition cursor-pointer"
                        title="Sil"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <div className="mt-3 pt-2 border-t border-white/5 flex flex-wrap items-center justify-between gap-2 text-[10px] font-mono text-slate-400">
                    <div className="flex items-center gap-3">
                      <span className="flex items-center gap-1 text-blue-300">
                        <Eye className="w-3 h-3" />
                        <span>{c.impressionCount || 0} Gösterim</span>
                      </span>
                      <span className="flex items-center gap-1 text-emerald-300">
                        <MousePointerClick className="w-3 h-3" />
                        <span>{c.clickCount || 0} Tıklama</span>
                      </span>
                      <span>Konum: {c.placement}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span>Bitiş: {c.endDate}</span>
                      <a
                        href={c.targetUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-cyan-400 hover:underline flex items-center gap-0.5"
                      >
                        <span>Linki Aç</span>
                        <ExternalLink className="w-2.5 h-2.5" />
                      </a>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* INQUIRIES INBOX: ZİYARETÇİLERİN BIRAKTIĞI REKLAM TALEPLERİ */}
      <div className="bg-slate-950 p-5 rounded-2xl border border-white/10 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-white/10">
          <div className="flex items-center gap-2">
            <Mail className="w-5 h-5 text-cyan-400" />
            <h3 className="text-sm font-bold text-white font-mono">
              Gelen Sponsorluk & Reklam Talepleri ({inquiries.length})
            </h3>
          </div>
          <span className="text-xs font-mono text-slate-400">
            Doğrudan İletişim: <span className="text-purple-300 font-bold">warfacelove46@gmail.com</span>
          </span>
        </div>

        {inquiries.length === 0 ? (
          <div className="py-8 text-center text-xs font-mono text-slate-500">
            Henüz sitedeki "Reklam Ver" butonundan başvuru formu doldurulmamış.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-900/80 text-[11px] font-mono text-slate-400 uppercase">
                <tr>
                  <th className="p-3">Şirket / Proje</th>
                  <th className="p-3">İletişim Bilgileri</th>
                  <th className="p-3">İstenen Alan / Süre</th>
                  <th className="p-3">Bütçe</th>
                  <th className="p-3">Mesaj & Tanıtım</th>
                  <th className="p-3">Tarih</th>
                  <th className="p-3">Durum</th>
                  <th className="p-3 text-right">İşlem</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {inquiries.map((inq) => {
                  const safetyReport = inq.websiteUrl ? inspectUrlSafety(inq.websiteUrl) : null;
                  return (
                  <tr key={inq.id} className="hover:bg-slate-900/50 transition">
                    <td className="p-3">
                      <div className="font-bold text-white font-mono">{inq.companyName}</div>
                      {inq.websiteUrl && safetyReport && (
                        <div className="mt-1 space-y-1">
                          <div className="flex items-center gap-2">
                            {safetyReport.riskLevel === "DANGEROUS" ? (
                              <span className="inline-flex items-center gap-1 text-[10px] font-mono px-1.5 py-0.5 rounded bg-red-950/80 border border-red-500/50 text-red-300 font-bold">
                                <ShieldAlert className="w-3 h-3 text-red-400" />
                                <span>Tehlikeli Link!</span>
                              </span>
                            ) : safetyReport.riskLevel === "SUSPICIOUS" ? (
                              <span className="inline-flex items-center gap-1 text-[10px] font-mono px-1.5 py-0.5 rounded bg-amber-950/80 border border-amber-500/50 text-amber-300">
                                <AlertTriangle className="w-3 h-3 text-amber-400" />
                                <span>Şüpheli Link</span>
                              </span>
                            ) : (
                              <a
                                href={inq.websiteUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-[10px] text-cyan-400 hover:underline flex items-center gap-0.5"
                                title="Doğrudan aç (İzole sekmede)"
                              >
                                <span>Siteyi Aç</span>
                                <ExternalLink className="w-2.5 h-2.5" />
                              </a>
                            )}

                            {/* VirusTotal scan scanner link */}
                            <a
                              href={safetyReport.virusTotalUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-[9px] font-mono px-1 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-emerald-300 border border-white/5 flex items-center gap-0.5 transition"
                              title="VirusTotal'de bu bağlantıyı zararlı yazılım ve virüs taramasına sok"
                            >
                              <ShieldCheck className="w-2.5 h-2.5 text-emerald-400" />
                              <span>VirusTotal Tara</span>
                            </a>
                          </div>

                          {safetyReport.warningReason && (
                            <div className="text-[9px] text-amber-400/90 font-mono">
                              ⚠️ {safetyReport.warningReason}
                            </div>
                          )}
                        </div>
                      )}
                    </td>

                    <td className="p-3">
                      <div className="text-slate-200">{inq.contactName || "Yetkili"}</div>
                      <div className="text-[11px] text-purple-300 font-mono">{inq.contactEmail}</div>
                      {inq.contactPhone && (
                        <div className="text-[10px] text-slate-400 font-mono">{inq.contactPhone}</div>
                      )}
                    </td>

                    <td className="p-3">
                      <span className="font-mono text-amber-300">{inq.targetPlacement}</span>
                      <div className="text-[10px] text-slate-400 font-mono">
                        {inq.durationWeeks ? `${inq.durationWeeks} Hafta` : "Belirtilmedi"}
                      </div>
                    </td>

                    <td className="p-3 font-mono text-emerald-400 font-bold">
                      {inq.budget || "-"}
                    </td>

                    <td className="p-3 max-w-xs text-[11px] text-slate-300 line-clamp-3">
                      {inq.message}
                    </td>

                    <td className="p-3 text-[10px] font-mono text-slate-400 whitespace-nowrap">
                      {inq.createdAt.split("T")[0]}
                    </td>

                    <td className="p-3">
                      <select
                        value={inq.status}
                        onChange={(e: any) => handleUpdateInquiryStatus(inq.id, e.target.value)}
                        className={`text-[10px] font-mono font-bold px-2 py-1 rounded border ${
                          inq.status === "new"
                            ? "bg-purple-950 text-purple-300 border-purple-500/40"
                            : inq.status === "contacted"
                            ? "bg-cyan-950 text-cyan-300 border-cyan-500/40"
                            : inq.status === "approved"
                            ? "bg-emerald-950 text-emerald-300 border-emerald-500/40"
                            : "bg-slate-800 text-slate-400 border-slate-700"
                        }`}
                      >
                        <option value="new">Yeni</option>
                        <option value="contacted">Görüşüldü</option>
                        <option value="approved">Anlaşıldı</option>
                        <option value="rejected">Reddedildi</option>
                      </select>
                    </td>

                    <td className="p-3 text-right whitespace-nowrap">
                      <a
                        href={`mailto:${inq.contactEmail}?subject=Teknolojik%20Evrim%20Sponsorluk%20Gorusmesi&body=Merhaba%20${encodeURIComponent(
                          inq.contactName || inq.companyName
                        )},%0D%0A%0D%0ASponsorluk%20basvurunuzu%20aldik.%0D%0A`}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-purple-600/30 hover:bg-purple-600/50 text-purple-200 text-[10px] font-mono transition"
                      >
                        <Mail className="w-3 h-3" />
                        <span>E-posta Gönder</span>
                      </a>
                    </td>
                  </tr>
                );
              })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
