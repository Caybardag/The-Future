import React, { useState } from "react";
import {
  X,
  Lock,
  Sparkles,
  Zap,
  ShieldCheck,
  Check,
  ArrowRight,
  Gift,
  Award,
  Users,
  TrendingUp,
  Cpu,
  Star,
  ChevronRight,
  Crown,
  HelpCircle
} from "lucide-react";
import { useAuth } from "../context/AuthContext";

interface MembershipUpsellModalProps {
  isOpen: boolean;
  onClose: () => void;
  featureTitle?: string;
  featureDescription?: string;
}

export const MembershipUpsellModal: React.FC<MembershipUpsellModalProps> = ({
  isOpen,
  onClose,
  featureTitle = "Gelecek Simülasyonu & Analiz Paneli",
  featureDescription = "Bu gelişmiş AI özelliği, derin gelecek analizleri ve kişiselleştirilmiş senaryolar sunar.",
}) => {
  const { openAuthModal, openCreditStore } = useAuth();
  const [activeTab, setActiveTab] = useState<"benefits" | "matrix" | "faq">("benefits");

  if (!isOpen) return null;

  const handleRegisterClick = () => {
    onClose();
    openAuthModal();
  };

  const handleUpgradeClick = () => {
    onClose();
    openCreditStore();
  };

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-[120] flex items-center justify-center p-2 sm:p-6 overflow-y-auto bg-slate-950/85 backdrop-blur-md animate-fadeIn"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-2xl bg-slate-900 border border-amber-500/40 rounded-2xl sm:rounded-3xl shadow-2xl overflow-hidden flex flex-col my-auto max-h-[94dvh]"
      >
        {/* Background Decorative Glows */}
        <div className="absolute -top-24 -left-24 w-64 h-64 bg-amber-500/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 w-64 h-64 bg-yellow-500/15 rounded-full blur-3xl pointer-events-none" />

        {/* Modal Header */}
        <div className="relative p-4 sm:p-6 bg-gradient-to-b from-slate-800/80 to-slate-900 border-b border-slate-800 flex items-start justify-between shrink-0">
          <div className="flex items-start gap-3 sm:gap-4 pr-2">
            <div className="p-2.5 sm:p-3.5 rounded-2xl bg-amber-500/20 border border-amber-500/40 text-amber-400 shrink-0 shadow-lg">
              <Lock className="w-5 h-5 sm:w-7 sm:h-7 text-amber-400 animate-pulse" />
            </div>
            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-[10px] sm:text-[11px] font-mono font-bold uppercase tracking-wider mb-1.5">
                <Sparkles className="w-3 h-3" />
                <span>Neden Üye Olmalısınız?</span>
              </div>
              <h2 className="text-base sm:text-xl font-black text-white font-mono tracking-tight">
                {featureTitle} Kilitli
              </h2>
              <p className="text-[11px] sm:text-xs text-slate-300 mt-1 leading-relaxed line-clamp-2 sm:line-clamp-none">
                {featureDescription}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 sm:p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition-colors cursor-pointer shrink-0"
            aria-label="Kapat"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Bonus Notification Bar */}
        <div className="bg-gradient-to-r from-amber-500/20 via-yellow-500/20 to-amber-500/20 border-b border-amber-500/30 px-4 sm:px-6 py-2.5 flex items-center justify-between gap-3 text-[11px] sm:text-xs text-amber-300 font-mono shrink-0">
          <div className="flex items-center gap-2">
            <Gift className="w-4 h-4 text-amber-400 shrink-0" />
            <span>
              <strong>ANINDA ÜCRETSİZ BONUS:</strong> +50 Hediye AI Kredisi Tanımlanır!
            </span>
          </div>
          <span className="hidden sm:inline-block px-2 py-0.5 rounded bg-amber-500/20 border border-amber-500/40 text-[10px] text-amber-200 font-bold uppercase">
            Kredi Kartı İstenmez
          </span>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-800 bg-slate-900/60 px-6 pt-3 gap-2">
          <button
            onClick={() => setActiveTab("benefits")}
            className={`pb-3 px-4 text-xs font-mono font-bold transition-all relative cursor-pointer ${
              activeTab === "benefits"
                ? "text-amber-400 border-b-2 border-amber-400"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            ✨ Üyelik Avantajları
          </button>
          <button
            onClick={() => setActiveTab("matrix")}
            className={`pb-3 px-4 text-xs font-mono font-bold transition-all relative cursor-pointer ${
              activeTab === "matrix"
                ? "text-amber-400 border-b-2 border-amber-400"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            📊 Hesap Karşılaştırması
          </button>
          <button
            onClick={() => setActiveTab("faq")}
            className={`pb-3 px-4 text-xs font-mono font-bold transition-all relative cursor-pointer ${
              activeTab === "faq"
                ? "text-amber-400 border-b-2 border-amber-400"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            ❓ Sıkça Sorulanlar
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-6 sm:p-8 space-y-6 max-h-[50vh] overflow-y-auto custom-scrollbar">
          {activeTab === "benefits" && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="p-4 rounded-2xl bg-slate-800/60 border border-slate-700/60 hover:border-amber-500/40 transition-all flex items-start gap-3">
                  <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400 shrink-0">
                    <Zap className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white font-mono">Gelişmiş Yapay Zeka Motoru</h4>
                    <p className="text-xs text-slate-300 mt-0.5 leading-normal">
                      Gelişmiş nedensellik modelleri, kelebek etkisi ve 2060 persona simülasyonlarını çalıştıran sunucu tarafı yapay zeka altyapısı.
                    </p>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-slate-800/60 border border-slate-700/60 hover:border-amber-500/40 transition-all flex items-start gap-3">
                  <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 shrink-0">
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white font-mono">Mesleki Otomasyon Raporu</h4>
                    <p className="text-xs text-slate-300 mt-0.5 leading-normal">
                      Kendi mesleğinizin 2026-2060 arası otomasyon ve yapay zeka risk skorunu öğrenin.
                    </p>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-slate-800/60 border border-slate-700/60 hover:border-amber-500/40 transition-all flex items-start gap-3">
                  <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400 shrink-0">
                    <Users className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white font-mono">Topluluk Oy & Tahminler</h4>
                    <p className="text-xs text-slate-300 mt-0.5 leading-normal">
                      Gelecek milestonelarına oy verin, kendi projeksiyonlarınızı topluluğa sunun.
                    </p>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-slate-800/60 border border-slate-700/60 hover:border-amber-500/40 transition-all flex items-start gap-3">
                  <div className="p-2 rounded-xl bg-purple-500/10 text-purple-400 shrink-0">
                    <Award className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white font-mono">Derin Analiz & PDF Export</h4>
                    <p className="text-xs text-slate-300 mt-0.5 leading-normal">
                      Tüm gelecek trend haritalarını ve olasılık matrislerini indirin veya paylaşın.
                    </p>
                  </div>
                </div>
              </div>

              {/* Trust Badge / Proof */}
              <div className="p-4 rounded-2xl bg-slate-950/70 border border-amber-500/30 flex items-center justify-between text-xs font-mono">
                <div className="flex items-center gap-2 text-slate-300">
                  <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                  <span>
                    <strong className="text-white">1,850+</strong> Aktif Gelecek Analisti
                  </span>
                </div>
                <div className="text-slate-400">
                  Ortalama Memnuniyet: <span className="text-emerald-400 font-bold">4.9/5</span>
                </div>
              </div>
            </div>
          )}

          {activeTab === "matrix" && (
            <div className="space-y-3 font-mono text-xs">
              <div className="overflow-x-auto rounded-xl border border-slate-800">
                <table className="w-full text-left">
                  <thead className="bg-slate-800/80 text-slate-300">
                    <tr>
                      <th className="p-3">Özellik</th>
                      <th className="p-3 text-center text-slate-400">Misafir Modu</th>
                      <th className="p-3 text-center text-cyan-400">Standart (Ücretsiz)</th>
                      <th className="p-3 text-center text-purple-400">Pro Gelecek</th>
                      <th className="p-3 text-center text-amber-400">Quantum VIP (Aile)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800 text-slate-300">
                    <tr>
                      <td className="p-3 font-medium">2026—2060 Zaman Çizelgesi</td>
                      <td className="p-3 text-center text-slate-300">✓ Sınırlı Keşif</td>
                      <td className="p-3 text-center text-emerald-400">✓ 100+ Milestones</td>
                      <td className="p-3 text-center text-emerald-400">✓ Tam Liste + Hızlı Filtre</td>
                      <td className="p-3 text-center text-amber-400 font-bold">✓ Kapsamlı VIP Akışı</td>
                    </tr>
                    <tr>
                      <td className="p-3 font-medium">Başlangıç / Aylık Kredi</td>
                      <td className="p-3 text-center text-slate-500">0 Kredi</td>
                      <td className="p-3 text-center text-cyan-400 font-bold">Çark & Reklamla Kazan</td>
                      <td className="p-3 text-center text-purple-400 font-bold">1,000 Kredi/Ay</td>
                      <td className="p-3 text-center text-amber-400 font-bold">2,500 Kredi/Ay</td>
                    </tr>
                    <tr>
                      <td className="p-3 font-medium">Meslek Otomasyon Risk Analizi</td>
                      <td className="p-3 text-center text-rose-400">Kilitli 🔒</td>
                      <td className="p-3 text-center text-rose-400">Pro Gerekir 🔒</td>
                      <td className="p-3 text-center text-emerald-400 font-bold">✓ Dahil</td>
                      <td className="p-3 text-center text-emerald-400 font-bold">✓ Dahil (%75 İndirimli)</td>
                    </tr>
                    <tr>
                      <td className="p-3 font-medium">Kişisel Yol Haritası & Biyo-Yaş</td>
                      <td className="p-3 text-center text-rose-400">Kilitli 🔒</td>
                      <td className="p-3 text-center text-rose-400">Pro Gerekir 🔒</td>
                      <td className="p-3 text-center text-emerald-400 font-bold">✓ Bireysel Harita</td>
                      <td className="p-3 text-center text-amber-400 font-bold">✓ Tüm Aile Haritası</td>
                    </tr>
                    <tr>
                      <td className="p-3 font-medium">2060 AI Zaman Yolcusu Sohbeti</td>
                      <td className="p-3 text-center text-rose-400">Kilitli 🔒</td>
                      <td className="p-3 text-center text-rose-400">Pro Gerekir 🔒</td>
                      <td className="p-3 text-center text-emerald-400 font-bold">✓ Dahil</td>
                      <td className="p-3 text-center text-amber-400 font-bold">✓ Sınırsız / Öncelikli</td>
                    </tr>
                    <tr>
                      <td className="p-3 font-medium">Kelebek Etkisi & Alternatif Evrenler</td>
                      <td className="p-3 text-center text-rose-400">Kilitli 🔒</td>
                      <td className="p-3 text-center text-rose-400">Kilitli 🔒</td>
                      <td className="p-3 text-center text-rose-400">VIP Gerekir 🔒</td>
                      <td className="p-3 text-center text-amber-400 font-bold">✓ Dahil (Kuantum Simülatör)</td>
                    </tr>
                    <tr>
                      <td className="p-3 font-medium">Çocuk Eğitim & Kariyer Rehberi</td>
                      <td className="p-3 text-center text-rose-400">Kilitli 🔒</td>
                      <td className="p-3 text-center text-rose-400">Kilitli 🔒</td>
                      <td className="p-3 text-center text-rose-400">VIP Gerekir 🔒</td>
                      <td className="p-3 text-center text-amber-400 font-bold">✓ Aile Paketi Kapsamında</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === "faq" && (
            <div className="space-y-3 font-sans text-xs text-slate-300">
              <div className="p-3.5 rounded-xl bg-slate-800/50 border border-slate-700/50">
                <h4 className="font-bold text-white font-mono mb-1">Standart Ücretsiz Hesap ve Başlangıç Kredisi Nasıl Tanımlanır?</h4>
                <p>
                  E-posta veya telefon ile anında kayıt olduğunuzda, sistem tanışma hediyesi olarak 50 yapay zeka kredisini hesabınıza otomatik olarak yükler. Herhangi bir kredi kartı bilgisi girmeniz gerekmez.
                </p>
              </div>
              <div className="p-3.5 rounded-xl bg-slate-800/50 border border-slate-700/50">
                <h4 className="font-bold text-white font-mono mb-1">Kredilerim biterse ne olur?</h4>
                <p>
                  Kredileriniz tükendiğinde dilediğiniz zaman Günlük Gelecek Çarkı ile ücretsiz kredi kazanabilir veya Pro / VIP paketlere geçerek her ay düzenli kredi tanımlaması alabilirsiniz.
                </p>
              </div>
              <div className="p-3.5 rounded-xl bg-slate-800/50 border border-slate-700/50">
                <h4 className="font-bold text-white font-mono mb-1">Aile üyelerim aynı paketi kullanabilir mi?</h4>
                <p>
                  Evet, Quantum VIP paketi 5 kişilik aile hesabı desteği sunar. Çocuklarınızın eğitim projeksiyonlarını ve ebeveynlerinizin sağlık-yaşam sürelerini tek hesaptan yönetebilirsiniz.
                </p>
              </div>
              <div className="p-3.5 rounded-xl bg-slate-800/50 border border-slate-700/50">
                <h4 className="font-bold text-white font-mono mb-1">Verilerim ve gizliliğim nasıl korunuyor?</h4>
                <p>
                  Tüm kişisel ve ailevi simülasyon verileriniz askeri düzeyde 256-bit şifreleme ile korunur ve KVKK ilkeleri doğrultusunda asla üçüncü şahıslarla paylaşılmaz.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Action Buttons Section */}
        <div className="p-3.5 sm:p-5 bg-slate-950/90 border-t border-slate-800 flex flex-col sm:flex-row gap-2.5 sm:gap-3 items-center justify-between shrink-0">
          <div className="text-center sm:text-left text-[11px] sm:text-xs font-mono text-slate-400">
            <span>Tek Tıkla Kayıt: <strong className="text-amber-400">~10 Saniye</strong></span>
          </div>

          <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 w-full sm:w-auto">
            <button
              onClick={handleRegisterClick}
              className="w-full sm:w-auto py-2.5 sm:py-3.5 px-5 sm:px-6 rounded-xl bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 hover:from-amber-400 hover:via-yellow-300 hover:to-amber-400 text-slate-950 font-mono font-black text-xs uppercase tracking-wider transition-all duration-200 shadow-lg shadow-amber-500/20 flex items-center justify-center gap-2 cursor-pointer group"
            >
              <Sparkles className="w-4 h-4 text-slate-950 animate-spin" />
              <span>ÜCRETSİZ KAYDOL (+50 KREDİ)</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
            </button>

            <button
              onClick={handleUpgradeClick}
              className="w-full sm:w-auto py-2 sm:py-3 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 border border-yellow-500/40 text-yellow-300 font-mono font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <Crown className="w-3.5 h-3.5 text-yellow-400" />
              <span>PRO PAKETLERİ İNCELE</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
