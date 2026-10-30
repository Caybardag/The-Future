import React from "react";
import { Trophy, Award, Sparkles, User, Medal } from "lucide-react";

export const GlobalLeaderboardView: React.FC = () => {
  const leaders = [
    { rank: 1, name: "Dr. Selin Yılmaz", role: "Kuantum Araştırmacısı", xp: 3450, predictions: 42, accuracy: "%94" },
    { rank: 2, name: "Barış Kaya", role: "AI Ajan Mimarı", xp: 2980, predictions: 38, accuracy: "%91" },
    { rank: 3, name: "Canan Demir", role: "Sentetik Biyoloji Küratörü", xp: 2750, predictions: 35, accuracy: "%89" },
    { rank: 4, name: "Emre Aksoy", role: "Robotik Mühendisi", xp: 2410, predictions: 29, accuracy: "%87" },
    { rank: 5, name: "Zeynep Tekin", role: "Kariyer Stratejisti", xp: 2180, predictions: 26, accuracy: "%86" },
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
      <div className="bg-slate-900/80 border border-purple-500/20 rounded-3xl p-6 sm:p-8 shadow-xl backdrop-blur-md space-y-6">
        <div className="flex items-center gap-3 border-b border-white/10 pb-4">
          <div className="p-3 rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/30">
            <Trophy className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-white">Gelecek Öngörü Liderlik Tablosu</h2>
            <p className="text-xs text-slate-400">Doğrulanabilir teknoloji tahminleri ve aktif yol haritası kararları ile öne çıkan kullanıcılar.</p>
          </div>
        </div>

        <div className="space-y-3">
          {leaders.map((l) => (
            <div
              key={l.rank}
              className={`p-4 rounded-2xl flex items-center justify-between border transition-all ${
                l.rank === 1
                  ? "bg-amber-950/20 border-amber-500/30"
                  : l.rank === 2
                  ? "bg-slate-800/40 border-slate-400/30"
                  : l.rank === 3
                  ? "bg-amber-900/10 border-amber-700/30"
                  : "bg-slate-950/60 border-white/5"
              }`}
            >
              <div className="flex items-center gap-3 sm:gap-4">
                <span className="w-8 h-8 rounded-xl bg-white/5 flex items-center justify-center font-mono font-bold text-sm text-slate-300">
                  #{l.rank}
                </span>
                <div>
                  <h4 className="font-bold text-white text-sm">{l.name}</h4>
                  <p className="text-xs text-slate-400">{l.role}</p>
                </div>
              </div>

              <div className="flex items-center gap-4 text-xs font-mono">
                <div className="text-right hidden sm:block">
                  <span className="text-slate-500 block">Doğruluk</span>
                  <span className="text-emerald-400 font-bold">{l.accuracy}</span>
                </div>
                <div className="text-right">
                  <span className="text-slate-500 block">Toplam XP</span>
                  <span className="text-purple-400 font-bold">{l.xp} XP</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
