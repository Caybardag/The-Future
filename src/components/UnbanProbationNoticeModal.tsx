import React, { useState } from "react";
import {
  ShieldAlert,
  Scale,
  AlertTriangle,
  CheckSquare,
  Square,
  Lock,
  Eye,
  FileText,
  Gavel,
  ShieldCheck,
  CheckCircle2,
  AlertOctagon,
} from "lucide-react";
import { useLanguage } from "../context/LanguageContext";
import { useAuth } from "../context/AuthContext";
import { db, doc, setDoc, updateDoc } from "../lib/firebase";
import { saveAccount } from "../utils/userAccounts";

interface UnbanProbationNoticeModalProps {
  isOpen: boolean;
  onDismiss?: () => void;
}

export const UnbanProbationNoticeModal: React.FC<UnbanProbationNoticeModalProps> = ({
  isOpen,
  onDismiss,
}) => {
  const { language } = useLanguage();
  const { currentUser, updateUserProfile } = useAuth();
  const isTr = language === "tr";

  const [hasAgreedTerms, setHasAgreedTerms] = useState(false);
  const [hasAgreedPenalCode, setHasAgreedPenalCode] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen || !currentUser) return null;

  const canProceed = hasAgreedTerms && hasAgreedPenalCode;

  const handleConfirmAndActivate = async () => {
    if (!canProceed || isSubmitting) return;

    setIsSubmitting(true);
    const cleanEmail = currentUser.email.toLowerCase().trim();
    const emailKey = cleanEmail.replace(/[@.]/g, "_");
    const timestamp = new Date().toISOString();

    try {
      // 1. Sync Firestore user documents
      if (currentUser.id) {
        try {
          const userRef = doc(db, "users", currentUser.id);
          await updateDoc(userRef, {
            unbanNoticePending: false,
            isProbationRequired: false,
            probationAcceptedAt: timestamp,
          });
        } catch (e) {
          console.warn("Firestore uid update notice:", e);
        }
      }

      try {
        const emailDocRef = doc(db, "users", emailKey);
        await setDoc(
          emailDocRef,
          {
            unbanNoticePending: false,
            isProbationRequired: false,
            probationAcceptedAt: timestamp,
          },
          { merge: true }
        );
      } catch (e) {
        console.warn("Firestore emailKey doc update notice:", e);
      }

      // 2. Update local DB
      saveAccount({
        ...currentUser,
        unbanNoticePending: false,
        isProbationRequired: false,
        probationAcceptedAt: timestamp,
      });

      // 3. Update Auth Context
      updateUserProfile({
        unbanNoticePending: false,
        isProbationRequired: false,
        probationAcceptedAt: timestamp,
      });

      try {
        localStorage.removeItem(`future_unban_notice_${cleanEmail}`);
      } catch (e) {}

      if (onDismiss) onDismiss();
    } catch (err) {
      console.error("Error finalizing probation acceptance:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center p-3 sm:p-5 bg-black/90 backdrop-blur-lg animate-in fade-in duration-300">
      <div className="relative w-full max-w-2xl bg-gradient-to-b from-[#0e1222] via-[#090d19] to-[#05070d] border-2 border-amber-500/60 rounded-3xl shadow-[0_0_60px_rgba(245,158,11,0.25)] overflow-hidden font-sans flex flex-col max-h-[92vh]">
        {/* Warning Accent Glow */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-amber-500 via-rose-500 to-amber-500" />

        {/* Header Ribbon */}
        <div className="bg-amber-950/40 px-5 sm:px-6 py-4 border-b border-amber-500/30 flex items-center gap-3 shrink-0">
          <div className="w-11 h-11 rounded-2xl bg-amber-500/20 border border-amber-500/50 flex items-center justify-center text-amber-400 shrink-0 shadow-inner">
            <Gavel className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded-md bg-amber-500/20 text-amber-300 border border-amber-500/40 text-[10px] font-mono font-bold tracking-wider uppercase">
                {isTr ? "HUKUKİ İKAZ & ETİK PROTOKOLÜ" : "LEGAL & ETHICAL PROTOCOL"}
              </span>
              <span className="text-[11px] font-mono text-slate-400">
                REF: PROBATION-{currentUser.email.split("@")[0].toUpperCase()}
              </span>
            </div>
            <h3 className="text-base sm:text-lg font-bold text-white tracking-tight flex items-center gap-2 mt-0.5">
              <span>
                {isTr
                  ? "Şartlı Hesap Aktivasyonu & Yasal Sorumluluk Tebligatı"
                  : "Conditional Account Reactivation & Legal Notice"}
              </span>
            </h3>
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-4 text-xs sm:text-sm text-slate-300 font-sans leading-relaxed">
          {/* Main Notice Box */}
          <div className="p-4 rounded-2xl bg-amber-950/30 border border-amber-500/40 text-amber-200 space-y-2">
            <div className="flex items-center gap-2 font-bold text-amber-300 text-sm">
              <Scale className="w-5 h-5 text-amber-400 shrink-0" />
              <span>
                {isTr
                  ? "SAYIN KULLANICI, HESAP ERİŞİMİNİZ ŞARTLI OLARAK AÇILMIŞTIR"
                  : "ATTENTION USER: YOUR ACCOUNT ACCESS HAS BEEN CONDITIONALLY RESTORED"}
              </span>
            </div>
            <p className="text-xs sm:text-[13px] leading-relaxed text-amber-100/90 font-medium">
              {isTr
                ? "Destek ve İtiraz Masası üzerinden yaptığınız başvuru Süper Yönetici tarafından incelenmiş olup, hesabınız üzerindeki erişim engeli 'Şartlı Gözetim ve Etik Kullanım Taahhüdü' kapsamında kaldırılmıştır. Sistemimizi kullanmaya devam etmeden önce aşağıdaki yasal ve kurumsal hükümleri dikkatle okuyunuz."
                : "Your appeal submitted to the Support Desk has been reviewed by the Super Administrator, and your account restriction has been conditionally lifted under our strict probation protocol. Please read the following legal terms carefully before continuing."}
            </p>
          </div>

          {/* Clauses */}
          <div className="space-y-3">
            {/* Clause 1: TCK & Cyber Security */}
            <div className="p-3.5 rounded-2xl bg-slate-900/80 border border-white/10 space-y-1.5">
              <div className="flex items-center gap-2 font-bold text-white text-xs sm:text-sm">
                <AlertOctagon className="w-4 h-4 text-rose-400 shrink-0" />
                <span>
                  {isTr
                    ? "1. 5237 Sayılı TCK Bilişim Suçları & Adli Takibat"
                    : "1. Cybersecurity & Criminal Law Compliance"}
                </span>
              </div>
              <p className="text-slate-400 text-[11px] sm:text-xs leading-relaxed">
                {isTr
                  ? "Platforma yönelik her türlü tersine mühendislik, yetkisiz veri çekme (scraping), bot/otomasyon kullanımı, yapay zeka token/kredi manipülasyonu veya hizmet engelleme girişimleri; 5237 Sayılı Türk Ceza Kanunu 243, 244 ve 245. maddeleri uyarınca bilişim suçu teşkil eder ve doğrudan Cumhuriyet Başsavcılığı Bilişim Suçları Bürosuna sevk edilir."
                  : "Any reverse engineering, scraping, botting, unauthorized automated queries, or disruption of service constitutes a criminal offense and will be escalated to law enforcement."}
              </p>
            </div>

            {/* Clause 2: Ethical Communication & Zero Tolerance */}
            <div className="p-3.5 rounded-2xl bg-slate-900/80 border border-white/10 space-y-1.5">
              <div className="flex items-center gap-2 font-bold text-white text-xs sm:text-sm">
                <ShieldAlert className="w-4 h-4 text-amber-400 shrink-0" />
                <span>
                  {isTr
                    ? "2. Etik İletişim, Hakaret & Tehdit Yasağı"
                    : "2. Ethical Conduct & Zero Tolerance Policy"}
                </span>
              </div>
              <p className="text-slate-400 text-[11px] sm:text-xs leading-relaxed">
                {isTr
                  ? "Platform yöneticilerine, destek personeline veya diğer kullanıcılara yönelik saygısızlık, hakaret, tehdit veya taciz içerikli ifadeler kesinlikle yasaktır. Bu tür eylemlerde af iptal edilir, hesap süresiz olarak kapatılır ve IP bazlı küresel blokaj uygulanır."
                  : "Disrespectful, threatening, harassing, or abusive behavior toward administrators or community members will result in immediate, permanent banishment without right to further appeals."}
              </p>
            </div>

            {/* Clause 3: 24/7 Telemetry & Audit Logs */}
            <div className="p-3.5 rounded-2xl bg-slate-900/80 border border-white/10 space-y-1.5">
              <div className="flex items-center gap-2 font-bold text-white text-xs sm:text-sm">
                <Eye className="w-4 h-4 text-cyan-400 shrink-0" />
                <span>
                  {isTr
                    ? "3. 7/24 Güvenlik Kaydı & Otomatik Anomali Tespiti"
                    : "3. 24/7 Realtime Telemetry & Threat Detection"}
                </span>
              </div>
              <p className="text-slate-400 text-[11px] sm:text-xs leading-relaxed">
                {isTr
                  ? "Hesabınız 'Gelişmiş Güvenlik Denetimi' altındadır. Tüm simülasyon istekleriniz, IP adresiniz, cihaz parametreleriniz ve işlem loglarınız siber savunma algoritmalarımızca anlık olarak doğrulanmaktadır."
                  : "Your account is placed in elevated security telemetry. All API requests, IP origins, and system interactions are monitored to ensure platform integrity."}
              </p>
            </div>
          </div>

          {/* Interactive Declarations / Checkboxes */}
          <div className="pt-2 space-y-2.5">
            <button
              type="button"
              onClick={() => setHasAgreedTerms(!hasAgreedTerms)}
              className={`w-full p-3 rounded-2xl border text-left transition-all flex items-start gap-3 cursor-pointer ${
                hasAgreedTerms
                  ? "bg-emerald-950/30 border-emerald-500/50 text-emerald-200"
                  : "bg-slate-900/60 border-white/15 hover:border-amber-500/40 text-slate-300"
              }`}
            >
              <div className="mt-0.5 shrink-0">
                {hasAgreedTerms ? (
                  <CheckSquare className="w-5 h-5 text-emerald-400" />
                ) : (
                  <Square className="w-5 h-5 text-slate-500" />
                )}
              </div>
              <span className="text-xs font-medium leading-relaxed">
                {isTr
                  ? "Platform kullanım kurallarına, topluluk standartlarına ve etik ilkelere eksiksiz uyacağımı, sistem açıklarını veya yapay zeka kaynaklarını suistimal etmeyeceğimi beyan ederim."
                  : "I declare that I will strictly abide by all platform rules and ethical standards, and will not exploit vulnerabilities or resources."}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setHasAgreedPenalCode(!hasAgreedPenalCode)}
              className={`w-full p-3 rounded-2xl border text-left transition-all flex items-start gap-3 cursor-pointer ${
                hasAgreedPenalCode
                  ? "bg-emerald-950/30 border-emerald-500/50 text-emerald-200"
                  : "bg-slate-900/60 border-white/15 hover:border-amber-500/40 text-slate-300"
              }`}
            >
              <div className="mt-0.5 shrink-0">
                {hasAgreedPenalCode ? (
                  <CheckSquare className="w-5 h-5 text-emerald-400" />
                ) : (
                  <Square className="w-5 h-5 text-slate-500" />
                )}
              </div>
              <span className="text-xs font-medium leading-relaxed">
                {isTr
                  ? "Kötü niyetli veya zararlı eylemlerimin TCK ve KVKK kapsamında adli mercilere bildirileceğini ve ikinci bir ihlal durumunda hesabımın geri dönüşsüz olarak imha edileceğini anladım ve kabul ediyorum."
                  : "I understand that malicious actions will result in legal prosecution, and any subsequent violation will lead to permanent, non-appealable termination."}
              </span>
            </button>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="bg-slate-950 px-5 sm:px-6 py-4 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-2 text-slate-400 text-[11px] font-mono">
            <Lock className="w-3.5 h-3.5 text-amber-400 shrink-0" />
            <span>
              {isTr
                ? "Devam etmek için iki taahhüt kutucuğunu da onaylayınız."
                : "Check both confirmation boxes to proceed."}
            </span>
          </div>

          <button
            type="button"
            disabled={!canProceed || isSubmitting}
            onClick={handleConfirmAndActivate}
            className={`w-full sm:w-auto px-6 py-3 rounded-2xl font-bold text-xs font-mono transition-all flex items-center justify-center gap-2 shadow-lg cursor-pointer ${
              canProceed
                ? "bg-gradient-to-r from-amber-500 via-emerald-500 to-teal-500 hover:from-amber-400 hover:to-teal-400 text-slate-950 shadow-emerald-500/20"
                : "bg-slate-800 text-slate-500 cursor-not-allowed border border-white/5"
            }`}
          >
            {isSubmitting ? (
              <span className="animate-spin">⌛</span>
            ) : (
              <CheckCircle2 className="w-4 h-4" />
            )}
            <span>
              {isTr
                ? "Taahhüdü Onayla & Hesabı Kullanıma Aç"
                : "Accept Protocol & Activate Account"}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};
