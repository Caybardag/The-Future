import React, { useState } from "react";
import { ShieldAlert, Ban, LogOut, LifeBuoy, Lock, MessageSquareText } from "lucide-react";
import { useLanguage } from "../context/LanguageContext";
import { useAuth } from "../context/AuthContext";
import { SupportTicketModal } from "./SupportTicketModal";

interface BannedUserModalProps {
  isOpen: boolean;
  reason?: string;
  onDismiss?: () => void;
}

export const BannedUserModal: React.FC<BannedUserModalProps> = ({
  isOpen,
  reason,
  onDismiss,
}) => {
  const { language } = useLanguage();
  const { logout, currentUser } = useAuth();
  const isTr = language === "tr";
  const [supportModalOpen, setSupportModalOpen] = useState(false);

  if (!isOpen) return null;

  const handleLogout = () => {
    logout();
    if (onDismiss) onDismiss();
  };

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fadeIn">
        <div className="relative w-full max-w-md p-6 sm:p-8 rounded-3xl bg-slate-950 border-2 border-rose-500/50 shadow-[0_0_50px_rgba(244,63,94,0.3)] text-center space-y-6">
          {/* Glow indicator */}
          <div className="absolute -top-12 left-1/2 -translate-x-1/2 w-24 h-24 rounded-full bg-rose-500/20 blur-xl pointer-events-none" />

          {/* Icon */}
          <div className="mx-auto w-16 h-16 rounded-2xl bg-rose-950/80 border border-rose-500/50 flex items-center justify-center text-rose-400 shadow-inner">
            <Ban className="w-8 h-8 animate-pulse" />
          </div>

          {/* Title */}
          <div className="space-y-2">
            <h3 className="text-xl font-bold text-white tracking-tight flex items-center justify-center gap-2">
              <ShieldAlert className="w-5 h-5 text-rose-400" />
              {isTr ? "Hesap Erişimi Askıya Alındı" : "Account Suspended / Banned"}
            </h3>
            <p className="text-xs text-rose-300/80 font-mono">
              {isTr
                ? "Sistem güvenliği ve topluluk kuralları gereği hesabınız yönetici tarafından yasaklanmıştır."
                : "Your account has been suspended by an administrator for security or policy reasons."}
            </p>
          </div>

          {/* Reason Box */}
          <div className="p-4 rounded-2xl bg-rose-950/40 border border-rose-500/30 text-left space-y-1.5">
            <div className="text-[11px] font-semibold text-rose-400 uppercase tracking-wider flex items-center gap-1.5">
              <Lock className="w-3.5 h-3.5" />
              {isTr ? "Yasaklanma Gerekçesi" : "Suspension Reason"}
            </div>
            <div className="text-xs text-slate-200 font-medium break-words">
              {reason || (isTr ? "Kullanım koşulları veya güvenlik ihlali." : "Violation of Terms of Service or security protocol.")}
            </div>
          </div>

          {/* Direct Support Appeal Option */}
          <div className="p-4 rounded-2xl bg-slate-900/90 border border-cyan-500/30 text-left space-y-2 shadow-md">
            <div className="flex items-center gap-2 text-cyan-400 text-xs font-bold font-mono">
              <LifeBuoy className="w-4 h-4" />
              <span>{isTr ? "İtiraz & Destek Talebi" : "Appeal & Support Desk"}</span>
            </div>
            <p className="text-[11px] text-slate-300 leading-relaxed font-sans">
              {isTr
                ? "Bu kararın bir hata olduğunu düşünüyorsanız, doğrudan sistem yöneticisine iletilmek üzere gerekçenizi ve açıklamanızı bildirebilirsiniz."
                : "If you believe this suspension was made in error, submit an appeal explaining the issue directly to the administrator."}
            </p>
            <button
              type="button"
              onClick={() => setSupportModalOpen(true)}
              className="w-full mt-1 py-2.5 px-4 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white text-xs font-bold font-mono transition-all flex items-center justify-center gap-2 shadow-md shadow-cyan-950/40 cursor-pointer"
            >
              <MessageSquareText className="w-4 h-4" />
              <span>{isTr ? "İtiraz / Destek Talebi Oluştur" : "Submit Ban Appeal / Ticket"}</span>
            </button>
          </div>

          {/* Action Button */}
          <button
            type="button"
            onClick={handleLogout}
            className="w-full py-3 px-5 rounded-2xl bg-slate-900 hover:bg-slate-800 border border-white/10 text-slate-400 hover:text-slate-200 text-xs font-bold font-mono tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            {isTr ? "Oturumu Kapat & Çıkış Yap" : "Sign Out & Exit"}
          </button>
        </div>
      </div>

      {/* Support / Ban Appeal Modal */}
      <SupportTicketModal
        isOpen={supportModalOpen}
        onClose={() => setSupportModalOpen(false)}
        initialCategory="ban_appeal"
        initialBanReason={reason}
        initialEmail={currentUser?.email}
      />
    </>
  );
};
