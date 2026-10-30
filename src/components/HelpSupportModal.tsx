import React from "react";
import { HelpCircle, X, LifeBuoy, Shield, BookOpen, MessageSquare, ArrowRight } from "lucide-react";

interface HelpSupportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenPrivacyModal?: () => void;
  onOpenTicketModal?: () => void;
}

export const HelpSupportModal: React.FC<HelpSupportModalProps> = ({
  isOpen,
  onClose,
  onOpenPrivacyModal,
  onOpenTicketModal,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-xl bg-slate-900 border border-purple-500/30 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6">
        <button
          type="button"
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-all cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 border-b border-white/10 pb-4">
          <div className="p-3 rounded-2xl bg-purple-500/20 text-purple-400 border border-purple-500/30">
            <HelpCircle className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-white">Yardım & Destek Merkezi</h3>
            <p className="text-xs text-slate-400">Gelecek Takvimi platformu hakkında sorularınız ve yardım kaynakları.</p>
          </div>
        </div>

        <div className="space-y-3">
          <div
            onClick={() => {
              onClose();
              onOpenTicketModal?.();
            }}
            className="p-4 rounded-2xl bg-slate-950/60 border border-white/5 hover:border-purple-500/40 transition-all cursor-pointer flex items-center justify-between group"
          >
            <div className="flex items-center gap-3">
              <LifeBuoy className="w-5 h-5 text-purple-400" />
              <div>
                <h4 className="font-bold text-white text-sm group-hover:text-purple-300">Destek Talebi Oluştur</h4>
                <p className="text-xs text-slate-400">Teknik sorunlar, hesap veya bakiye telafisi için talep açın.</p>
              </div>
            </div>
            <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-white transition-colors" />
          </div>

          <div
            onClick={() => {
              onClose();
              onOpenPrivacyModal?.();
            }}
            className="p-4 rounded-2xl bg-slate-950/60 border border-white/5 hover:border-purple-500/40 transition-all cursor-pointer flex items-center justify-between group"
          >
            <div className="flex items-center gap-3">
              <Shield className="w-5 h-5 text-emerald-400" />
              <div>
                <h4 className="font-bold text-white text-sm group-hover:text-emerald-300">Gizlilik & Veri Güvenliği</h4>
                <p className="text-xs text-slate-400">Verilerinizin nasıl saklandığını ve korunduğunu inceleyin.</p>
              </div>
            </div>
            <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-white transition-colors" />
          </div>
        </div>
      </div>
    </div>
  );
};
