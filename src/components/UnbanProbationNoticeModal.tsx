import React, { useState } from "react";
import { ShieldAlert, CheckCircle2, Lock } from "lucide-react";
import { useAuth } from "../context/AuthContext";

interface UnbanProbationNoticeModalProps {
  isOpen: boolean;
}

export const UnbanProbationNoticeModal: React.FC<UnbanProbationNoticeModalProps> = ({ isOpen }) => {
  const { currentUser, updateUserProfile } = useAuth();
  const [acknowledged, setAcknowledged] = useState(false);

  if (!isOpen) return null;

  const handleAcceptTerms = () => {
    updateUserProfile({ unbanNoticePending: false, isProbationRequired: false });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-md">
      <div className="relative w-full max-w-lg bg-slate-900 border border-amber-500/40 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-5 text-center">
        <div className="inline-flex p-3 rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/30">
          <ShieldAlert className="w-8 h-8" />
        </div>

        <h3 className="text-xl font-bold text-white">Hesap Güvenlik & Denetimli Kullanım Bildirimi</h3>
        <p className="text-xs text-slate-300 leading-relaxed text-left">
          Hesabınız incelenmiş ve yasağınız kaldırılmıştır. Platform kurallarına ve yapay zeka adil kullanım ilkelerine uyumunuz doğrulanana kadar denetimli modda kalacaksınız.
        </p>

        <label className="flex items-center gap-2.5 text-xs text-slate-300 text-left cursor-pointer pt-2">
          <input
            type="checkbox"
            checked={acknowledged}
            onChange={(e) => setAcknowledged(e.target.checked)}
            className="rounded border-slate-700 bg-slate-800 text-amber-500 focus:ring-amber-500"
          />
          <span>Kullanım kurallarını okudum, platform etiğine riayet edeceğimi onaylıyorum.</span>
        </label>

        <button
          type="button"
          disabled={!acknowledged}
          onClick={handleAcceptTerms}
          className={`w-full py-3 rounded-xl font-bold text-xs transition-all ${
            acknowledged
              ? "bg-amber-500 hover:bg-amber-400 text-slate-950 cursor-pointer shadow-lg shadow-amber-500/20"
              : "bg-slate-800 text-slate-500 cursor-not-allowed"
          }`}
        >
          Anladım ve Devam Et
        </button>
      </div>
    </div>
  );
};
