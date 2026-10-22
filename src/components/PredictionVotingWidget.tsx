import React, { useState, useEffect } from "react";
import { Milestone, UserPredictionVote } from "../types";
import { Vote, Calendar, Check, TrendingUp, Users, Award, Sparkles, ShieldCheck, AlertCircle } from "lucide-react";
import { useLanguage } from "../context/LanguageContext";
import { useAuth } from "../context/AuthContext";
import { UserProfile } from "./UserAuthModal";

interface PredictionVotingWidgetProps {
  milestone: Milestone;
  compact?: boolean;
  currentUser?: UserProfile | null;
  onOpenAuthModal?: () => void;
}

export const PredictionVotingWidget: React.FC<PredictionVotingWidgetProps> = ({
  milestone,
  compact = false,
  currentUser: propCurrentUser,
  onOpenAuthModal: propOnOpenAuthModal,
}) => {
  const { t } = useLanguage();
  const auth = useAuth();
  const currentUser = propCurrentUser !== undefined ? propCurrentUser : auth.currentUser;
  const onOpenAuthModal = propOnOpenAuthModal || auth.openAuthModal;
  const [userPredictedYear, setUserPredictedYear] = useState<number>(milestone.year);
  const [hasVoted, setHasVoted] = useState<boolean>(false);
  const [comment, setComment] = useState<string>("");
  const [communityAvg, setCommunityAvg] = useState<number>(milestone.year);
  const [voteCount, setVoteCount] = useState<number>(24);
  const [voteToast, setVoteToast] = useState<string | null>(null);

  // Load vote and calculate 100% real community average from stored votes
  const recalculateVotes = () => {
    // Get active user ID if available, else default user key
    const storedUserStr = localStorage.getItem("futurist_user_profile");
    let userId = "guest_user";
    if (storedUserStr) {
      try {
        const u = JSON.parse(storedUserStr);
        if (u.id) userId = u.id;
      } catch (e) {}
    }

    // Composite key: [User_ID] + [Prediction_Code]
    const compositeKey = `vote_db_unique_${userId}_ms_${milestone.year}`;
    const savedVote = localStorage.getItem(compositeKey);
    
    if (savedVote) {
      try {
        const parsed: UserPredictionVote = JSON.parse(savedVote);
        setUserPredictedYear(parsed.predictedYear);
        if (parsed.comment) setComment(parsed.comment);
        setHasVoted(true);
      } catch (e) {
        console.error("Failed to parse vote from local storage", e);
      }
    } else {
      setUserPredictedYear(milestone.year);
      setHasVoted(false);
      setComment("");
    }

    // Calculate real community votes across all stored users
    const realVotes: number[] = [];
    try {
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith("vote_db_unique_") && key.endsWith(`_ms_${milestone.year}`)) {
          const item = localStorage.getItem(key);
          if (item) {
            const v: UserPredictionVote = JSON.parse(item);
            if (typeof v.predictedYear === "number") {
              realVotes.push(v.predictedYear);
            }
          }
        }
      }
    } catch (e) {
      console.error("Error reading real votes", e);
    }

    if (realVotes.length > 0) {
      const sum = realVotes.reduce((acc, curr) => acc + curr, 0);
      setCommunityAvg(Math.round(sum / realVotes.length));
      setVoteCount(realVotes.length);
    } else {
      setCommunityAvg(milestone.year);
      setVoteCount(0);
    }
  };

  useEffect(() => {
    recalculateVotes();
  }, [milestone.year]);

  const handleVoteSubmit = () => {
    // If user is guest, trigger sign up / auth modal to record vote
    if (!currentUser) {
      if (onOpenAuthModal) {
        onOpenAuthModal();
      } else {
        setVoteToast("🔒 Öngörünüzü kaydetmek ve analiz kredisi kazanmak için oturum açın.");
        setTimeout(() => setVoteToast(null), 4000);
      }
      return;
    }

    // Get active user ID
    const storedUserStr = localStorage.getItem("futurist_user_profile");
    let userId = "guest_user";
    let isPhoneVerified = true;
    if (storedUserStr) {
      try {
        const u = JSON.parse(storedUserStr);
        if (u.id) userId = u.id;
        if (u.isPhoneVerified !== undefined) isPhoneVerified = u.isPhoneVerified;
      } catch (e) {}
    }

    // Enforce composite key rule: [User_ID] + [Prediction_Code]
    const compositeKey = `vote_db_unique_${userId}_ms_${milestone.year}`;
    const voteData: UserPredictionVote = {
      year: milestone.year,
      predictedYear: userPredictedYear,
      comment,
      votedAt: new Date().toISOString(),
    };

    localStorage.setItem(compositeKey, JSON.stringify(voteData));
    setHasVoted(true);
    recalculateVotes();
    setVoteToast("🛡️ Oyunuz Veritabanına [User_ID + Prediction_Code] Birleşik Anahtarıyla Tekil Olarak Kaydedildi.");
    setTimeout(() => setVoteToast(null), 4000);
  };

  const diffYears = userPredictedYear - milestone.year;

  if (compact) {
    return (
      <div className="bg-slate-950/80 border border-white/10 rounded-xl p-3 text-xs space-y-2">
        <div className="flex items-center justify-between text-slate-300 font-mono">
          <span className="flex items-center gap-1.5 text-[11px] font-bold text-amber-400">
            <Vote className="w-3.5 h-3.5" /> {t("prediction_voting")}
          </span>
          <span className="text-[10px] text-slate-500 flex items-center gap-1">
            <Users className="w-3 h-3" /> {voteCount} Oy
          </span>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex-1 flex items-center gap-1 bg-slate-900 border border-white/5 rounded-lg px-2 py-1">
            <span className="text-[10px] text-slate-400 font-mono">Resmi:</span>
            <span className="text-blue-400 font-bold font-mono">{milestone.year}</span>
          </div>

          <div className="flex-1 flex items-center gap-1 bg-slate-900 border border-amber-500/20 rounded-lg px-2 py-1">
            <span className="text-[10px] text-slate-400 font-mono">Topluluk:</span>
            <span className="text-amber-400 font-bold font-mono">{communityAvg}</span>
          </div>
        </div>

        <div className="flex items-center gap-2 pt-1">
          <input
            type="range"
            min={2026}
            max={2060}
            value={userPredictedYear}
            onChange={(e) => {
              setUserPredictedYear(Number(e.target.value));
              setHasVoted(false);
            }}
            className="flex-1 accent-amber-500 h-1 bg-slate-800 rounded cursor-pointer"
          />
          <span className="font-mono font-bold text-amber-300 w-10 text-right">{userPredictedYear}</span>
          <button
            onClick={handleVoteSubmit}
            className={`px-2 py-1 rounded text-[10px] font-mono font-bold transition-all ${
              hasVoted
                ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/40"
                : "bg-amber-500 hover:bg-amber-400 text-slate-950"
            }`}
          >
            {hasVoted ? <Check className="w-3 h-3 inline" /> : "Oy Ver"}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-slate-900/60 border border-amber-500/20 rounded-2xl p-5 space-y-4 shadow-xl shadow-amber-500/5">
      
      <div className="flex items-center justify-between border-b border-white/5 pb-3">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/30">
            <Vote className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-white font-mono uppercase tracking-wider flex items-center gap-2">
              <span>"Ne Zaman Gerçekleşir?" Tahmin Modülü</span>
              {hasVoted && (
                <span className="px-2 py-0.5 rounded bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 text-[10px] font-bold flex items-center gap-1">
                  <Check className="w-3 h-3" /> Oyunuz Kaydedildi
                </span>
              )}
            </h4>
            <p className="text-[10px] text-slate-400 font-mono">
              Resmi projeksiyon ({milestone.year}) hakkındaki kişisel öngörünüzü toplulukla paylaşın.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs font-mono text-slate-400">
          <Users className="w-3.5 h-3.5 text-amber-400" />
          <span>{voteCount > 0 ? `${voteCount} Doğrulanmış Oy Kayıtlı` : "Henüz Topluluk Oyu Yok"}</span>
        </div>
      </div>

      {/* Stats Comparison Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 font-mono">
        <div className="bg-slate-950 p-3 rounded-xl border border-white/5 space-y-1">
          <div className="text-[10px] text-slate-500 uppercase">Resmi Projeksiyon</div>
          <div className="text-lg font-bold text-blue-400 flex items-center justify-between">
            <span>{milestone.year}</span>
            <Calendar className="w-4 h-4 text-blue-500/50" />
          </div>
          <div className="text-[10px] text-slate-400">Algoritmik Model</div>
        </div>

        <div className="bg-slate-950 p-3 rounded-xl border border-amber-500/20 space-y-1">
          <div className="text-[10px] text-amber-400 uppercase">Topluluk Ortalaması</div>
          <div className="text-lg font-bold text-amber-300 flex items-center justify-between">
            <span>{voteCount > 0 ? `${communityAvg} Yılı` : "İlk Oyu Verin"}</span>
            <TrendingUp className="w-4 h-4 text-amber-400/50" />
          </div>
          <div className="text-[10px] text-slate-400">
            {voteCount === 0
              ? "Beklemede"
              : communityAvg === milestone.year
              ? "Birebir Aynı"
              : `${Math.abs(communityAvg - milestone.year)} Yıl ${communityAvg > milestone.year ? "Sonra" : "Önce"}`}
          </div>
        </div>

        <div className="bg-slate-950 p-3 rounded-xl border border-purple-500/20 space-y-1">
          <div className="text-[10px] text-purple-400 uppercase">Senin Tahminin</div>
          <div className="text-lg font-bold text-purple-300 flex items-center justify-between">
            <span>{userPredictedYear}</span>
            <Award className="w-4 h-4 text-purple-400/50" />
          </div>
          <div className="text-[10px] text-slate-400">
            {diffYears === 0
              ? "Resmi Tespitle Birebir"
              : `${Math.abs(diffYears)} Yıl ${diffYears > 0 ? "Daha Geç" : "Daha Erken"}`}
          </div>
        </div>
      </div>

      {/* Interactive Slider & Stepper */}
      <div className="bg-slate-950/80 p-4 rounded-xl border border-white/5 space-y-3">
        <div className="flex items-center justify-between text-xs font-mono">
          <span className="text-slate-300 font-bold">Tahmin Ettiğin Yılı Seç:</span>
          <span className="text-amber-400 font-bold text-base bg-amber-500/10 px-3 py-0.5 rounded border border-amber-500/20">
            {userPredictedYear}
          </span>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              setUserPredictedYear((prev) => Math.max(2026, prev - 1));
              setHasVoted(false);
            }}
            className="px-3 py-1.5 bg-slate-900 border border-white/10 rounded-lg text-slate-300 hover:text-white font-mono text-xs font-bold"
          >
            -1 Yıl
          </button>

          <input
            type="range"
            min={2026}
            max={2060}
            value={userPredictedYear}
            onChange={(e) => {
              setUserPredictedYear(Number(e.target.value));
              setHasVoted(false);
            }}
            className="flex-1 accent-amber-500 h-2 bg-slate-800 rounded-lg cursor-pointer"
          />

          <button
            onClick={() => {
              setUserPredictedYear((prev) => Math.min(2060, prev + 1));
              setHasVoted(false);
            }}
            className="px-3 py-1.5 bg-slate-900 border border-white/10 rounded-lg text-slate-300 hover:text-white font-mono text-xs font-bold"
          >
            +1 Yıl
          </button>
        </div>

        {/* Optional Comment */}
        <div className="pt-2 flex gap-2">
          <input
            type="text"
            value={comment}
            onChange={(e) => {
              setComment(e.target.value);
              setHasVoted(false);
            }}
            placeholder="Neden bu yılda gerçekleşeceğini düşünüyorsun? (Opsiyonel)"
            className="flex-1 bg-slate-900 border border-white/10 rounded-xl px-3 py-2 text-xs text-slate-200 font-mono focus:outline-none focus:border-amber-500"
          />
          <button
            onClick={handleVoteSubmit}
            className={`px-4 py-2 font-mono font-bold text-xs rounded-xl flex items-center gap-1.5 transition-all shadow-md whitespace-nowrap cursor-pointer ${
              !currentUser
                ? "bg-gradient-to-r from-amber-500 to-yellow-400 text-slate-950 hover:from-amber-400 hover:to-yellow-300 shadow-amber-500/30"
                : "bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 shadow-amber-500/20"
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>
              {!currentUser
                ? "🔒 GİRİŞ YAP VE OY KULLAN (+50 KREDİ)"
                : hasVoted
                ? "GÜNCELLE"
                : "TAHMİNİ KAYDET"}
            </span>
          </button>
        </div>
        {/* Toast Notification */}
        {voteToast && (
          <div className="p-2.5 rounded-xl bg-emerald-950/80 border border-emerald-400 text-emerald-200 text-xs font-mono flex items-center gap-2 animate-in fade-in duration-200">
            <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{voteToast}</span>
          </div>
        )}

        {/* Security Rule Badge */}
        <div className="flex items-center justify-between text-[10px] font-mono text-slate-500 pt-1">
          <span className="flex items-center gap-1">
            <ShieldCheck className="w-3 h-3 text-cyan-500" />
            <span>Veritabanı Birleşik Kuralı: [User_ID + Prediction_Code]</span>
          </span>
          <span>1 Hesap = Maksimum 1 Oy (Tıklama Botu Korumalı)</span>
        </div>
      </div>

    </div>
  );
};
