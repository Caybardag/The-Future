import React from "react";
import { X, ShieldAlert, AlertTriangle, CheckCircle2, FileText, Scale } from "lucide-react";

interface TermsOfServiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAccept?: () => void;
}

export const TermsOfServiceModal: React.FC<TermsOfServiceModalProps> = ({
  isOpen,
  onClose,
  onAccept,
}) => {
  if (!isOpen) return null;

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-[110] flex items-center justify-center p-3 sm:p-5 bg-slate-950/90 backdrop-blur-md animate-in fade-in duration-200"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-2xl bg-[#0a0f1d] border border-cyan-500/40 rounded-3xl shadow-2xl overflow-hidden font-sans flex flex-col max-h-[90vh]"
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-slate-900 via-cyan-950/60 to-slate-900 px-5 py-4 border-b border-white/10 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-cyan-500/15 border border-cyan-400/40 flex items-center justify-center text-cyan-300">
              <Scale className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <span>Kullanım Koşulları & Yasal Sorumluluk Reddi</span>
              </h3>
              <p className="text-xs text-cyan-300 font-mono">
                Teknolojik Evrim Takvimi & AI Simülasyon Platformu
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-800/80 hover:bg-rose-500/20 text-slate-400 hover:text-white transition-colors cursor-pointer"
            aria-label="Kapat"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Terms Content */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-4 text-xs sm:text-sm text-slate-300 font-sans leading-relaxed">
          
          {/* Critical AI Disclaimer Box */}
          <div className="p-4 rounded-2xl bg-rose-950/60 border border-rose-500/40 text-rose-200 space-y-2">
            <div className="flex items-center gap-2 font-bold text-rose-300 text-sm">
              <ShieldAlert className="w-5 h-5 text-rose-400 shrink-0" />
              <span>ÖNEMLİ YASAL UYARI: YAPAY ZEKA & FİNANS/YATIRIM TAVSİYESİ DEĞİLDİR</span>
            </div>
            <p className="leading-relaxed">
              Platformda sunulan tüm yapay zeka analizleri, gelecek senaryoları, meslek risk tahminleri, teknoloji öngörüleri ve fütüristik simülasyonlar <strong>yanıltıcı, eksik veya spekülatif yanıtlar verebilir</strong>.
            </p>
            <p className="leading-relaxed font-semibold text-rose-100">
              Yapay zekanın ve platformun sadece fikir edinmek ve araştırma desteği almak istediğiniz konularda yardımcı olması planlanmıştır. <strong>Finansal, yatırım, hukuki, tıbbi veya yasal yükümlülüklerinizde ya da kanunlara ve kurallara uygunluk gerektiren diğer hiçbir resmi yükümlülükte size yol gösteremez, bağlayıcı tavsiye veremez.</strong>
            </p>
          </div>

          {/* Section 1 */}
          <div className="space-y-1.5">
            <h4 className="text-white font-bold text-sm flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-cyan-400" />
              1. Hizmetin Kapsamı ve Amacı
            </h4>
            <p className="text-slate-400">
              Teknolojik Evrim Takvimi; teknolojik gelişmeleri, yapay zeka ilerlemesini, akademik makaleleri ve fütüristik senaryoları modellemek ve görselleştirmek amacıyla kurulmuş bağımsız bir araştırma ve simülasyon platformudur.
            </p>
          </div>

          {/* Section 2 */}
          <div className="space-y-1.5">
            <h4 className="text-white font-bold text-sm flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-cyan-400" />
              2. Sorumluluk Reddi (No Liability)
            </h4>
            <p className="text-slate-400">
              Kullanıcı, platformdaki yapay zeka çıktılarından, simülasyon sonuçlarından veya topluluk oylamalarından yola çıkarak alacağı hiçbir ticari, mali, kariyer veya şahsi karardan platform yönetimini, kurucularını veya geliştiricilerini sorumlu tutamaz. Tüm kararlar kullanıcının kendi hür iradesi ve sorumluluğundadır.
            </p>
          </div>

          {/* Section 3 */}
          <div className="space-y-1.5">
            <h4 className="text-white font-bold text-sm flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-cyan-400" />
              3. Kullanıcı Hesap Güvenliği ve Bot Koruması
            </h4>
            <p className="text-slate-400">
              Kullanıcılar sisteme kaydolurken sağladıkları e-posta ve iletişim bilgilerinin doğruluğundan sorumludur. Sistemde hile, otomatik bot saldırısı veya manipülasyon yapan hesaplar önceden bildirilmeksizin süresiz olarak askıya alınabilir veya silinebilir.
            </p>
          </div>

          {/* Section 4 */}
          <div className="space-y-1.5">
            <h4 className="text-white font-bold text-sm flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-cyan-400" />
              4. Fikri Mülkiyet ve İçerik Hakları
            </h4>
            <p className="text-slate-400">
              Platformdaki tasarım, kaynak kodlar, simülasyon algoritmaları ve derlenen araştırma veri setleri koruma altındadır. İzin alınmaksızın ticari amaçla kopyalanamaz veya tersine mühendislik yapılamaz.
            </p>
          </div>

          {/* Section 5 */}
          <div className="space-y-1.5">
            <h4 className="text-white font-bold text-sm flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-cyan-400" />
              5. 5237 Sayılı TCK Bilişim Suçları, Siber Güvenlik & Adli Sorumluluk
            </h4>
            <p className="text-slate-400">
              Platforma veya diğer kullanıcılara yönelik her türlü yetkisiz erişim, bot/otomasyon kullanımı, tersine mühendislik, hizmeti engelleme (DDoS), zararlı prompt injection, kredi veya veri manipülasyonu girişimleri; 5237 Sayılı Türk Ceza Kanunu 243, 244 ve 245. maddeleri kapsamında adli bilişim suçu teşkil eder. Bu tür girişimlerde bulunan kullanıcıların IP, oturum ve telemetri logları derhal delillendirilerek Cumhuriyet Başsavcılığı Bilişim Suçları Soruşturma Bürosu&apos;na resmi olarak suç duyurusunda bulunulacaktır.
            </p>
          </div>

          {/* Section 6 */}
          <div className="space-y-1.5">
            <h4 className="text-white font-bold text-sm flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-cyan-400" />
              6. Topluluk Standartları & Etik İletişim Zorunluluğu
            </h4>
            <p className="text-slate-400">
              Kullanıcılar; destek masası personeline, yöneticilere ve topluluk üyelerine karşı saygılı ve etik bir üslup kullanmakla yükümlüdür. Hakaret, tehdit, taciz veya asılsız ithamlar içeren davranışlar sergileyen hesaplar derhal ve süresiz olarak kapatılacaktır.
            </p>
          </div>

          {/* Section 7 */}
          <div className="space-y-1.5">
            <h4 className="text-white font-bold text-sm flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-amber-400" />
              7. Kredi Satın Alımları, Dijital Hesaplama Gücü & Kesin Ücret İadesi Bulunmama Şartı
            </h4>
            <p className="text-slate-400">
              Platform üzerinden satın alınan kredi paketleri ve lisanslar; kullanıcının hesabına anında tanımlanan gayrimaddi dijital hizmet, yapay zeka işlem kotası ve bulut sunucu hesaplama gücüdür. Satışı yapılan herhangi bir fiziksel veya somut ürün/mal bulunmamaktadır. 6502 Sayılı Tüketicinin Korunması Hakkında Kanun ve Mesafeli Sözleşmeler Yönetmeliği&apos;nin 15. maddesinin (ğ) bendi (Elektronik ortamda anında ifa edilen hizmetler veya tüketiciye anında teslim edilen gayrimaddi mallara ilişkin sözleşmeler) uyarınca, <strong>kullanıcı satın aldığı kredileri kullanmış olsun veya hiç kullanmamış olsun kesinlikle cayma hakkı, para/ücret iadesi veya nakit geri ödeme hakkına sahip değildir.</strong> Kullanıcı ödeme aşamasında bu şartı gayrikabili rücu kabul, beyan ve taahhüt eder.
            </p>
          </div>

          {/* Section 8 */}
          <div className="space-y-1.5">
            <h4 className="text-white font-bold text-sm flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-cyan-400" />
              8. Değişiklik Hakkı
            </h4>
            <p className="text-slate-400">
              Platform yönetimi, kullanım şartlarını ve hizmet kapsamını dilediği zaman güncelleme hakkını saklı tutar.
            </p>
          </div>

        </div>

        {/* Footer Actions */}
        <div className="bg-slate-950 p-4 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
          <p className="text-[11px] text-slate-400 font-mono text-center sm:text-left">
            🔒 Bu şartları onaylayarak yukarıdaki yasal sorumluluk reddini kabul etmiş sayılırsınız.
          </p>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            {onAccept && (
              <button
                type="button"
                onClick={() => {
                  onAccept();
                  onClose();
                }}
                className="flex-1 sm:flex-initial px-5 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs font-mono transition-all shadow-md shadow-cyan-500/20 cursor-pointer flex items-center justify-center gap-1.5"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Okudum & Kabul Ediyorum</span>
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-mono transition-colors cursor-pointer"
            >
              Kapat
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
