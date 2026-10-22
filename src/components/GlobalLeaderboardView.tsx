import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useBadges } from "../context/BadgeContext";
import {
  Trophy,
  Award,
  Sparkles,
  ShieldCheck,
  Zap,
  User,
  Users,
  Search,
  LogIn,
  CheckCircle2,
  TrendingUp,
  Star,
  Crown,
  Lock,
  Flame,
  ArrowRight,
  Gift
} from "lucide-react";
import { getSpinAnalytics } from "../utils/spinStorage";

interface LeaderboardUser {
  rank: number;
  id: string;
  name: string;
  title: string;
  badgeCount: number;
  totalXp: number;
  credits: number;
  level: number;
  avatarColor: string;
  isCurrentUser?: boolean;
  spinsCount?: number;
  wheelOracleBadge?: string;
}

const TOP_LEADERBOARD_DATA: LeaderboardUser[] = [
  {
    rank: 1,
    id: "user_1",
    name: "Dr. Kaan Vural",
    title: "Süper Kuantum Kahini",
    badgeCount: 8,
    totalXp: 1850,
    credits: 420,
    level: 12,
    avatarColor: "from-amber-500 to-yellow-400",
    spinsCount: 14,
    wheelOracleBadge: "🎡 Baş Kahin (14 Çevirme)",
  },
  {
    rank: 2,
    id: "user_2",
    name: "Elif Biyotek",
    title: "Teknoloji Analisti",
    badgeCount: 7,
    totalXp: 1600,
    credits: 310,
    level: 10,
    avatarColor: "from-purple-500 to-pink-500",
    spinsCount: 11,
    wheelOracleBadge: "🔮 Top Koleksiyoner",
  },
  {
    rank: 3,
    id: "user_3",
    name: "Prof. Metehan Aksu",
    title: "Kuantum & Etik Mimarı",
    badgeCount: 6,
    totalXp: 1420,
    credits: 280,
    level: 9,
    avatarColor: "from-cyan-500 to-blue-500",
    spinsCount: 9,
    wheelOracleBadge: "🎡 Aktif Çark Kahini",
  },
  {
    rank: 4,
    id: "user_4",
    name: "Selin Nöro-AI",
    title: "Gelecek Kahini",
    badgeCount: 5,
    totalXp: 1250,
    credits: 210,
    level: 8,
    avatarColor: "from-emerald-500 to-teal-400",
    spinsCount: 8,
    wheelOracleBadge: "🎡 Aktif Çark Kahini",
  },
  {
    rank: 5,
    id: "user_5",
    name: "Caner Yılmaz",
    title: "Teknoloji Stratejisti",
    badgeCount: 5,
    totalXp: 1100,
    credits: 190,
    level: 7,
    avatarColor: "from-blue-600 to-indigo-500",
    spinsCount: 6,
    wheelOracleBadge: "🎡 Çark Kahini",
  },
  {
    rank: 6,
    id: "user_6",
    name: "Zeynep BCI",
    title: "Nedensellik Kaşifi",
    badgeCount: 4,
    totalXp: 950,
    credits: 150,
    level: 6,
    avatarColor: "from-rose-500 to-red-400",
    spinsCount: 5,
    wheelOracleBadge: "🎡 Çark Kahini",
  },
  {
    rank: 7,
    id: "user_7",
    name: "Arda Futurist",
    title: "Zaman Yolcusu",
    badgeCount: 4,
    totalXp: 880,
    credits: 120,
    level: 5,
    avatarColor: "from-yellow-500 to-amber-600",
    spinsCount: 4,
    wheelOracleBadge: "🔮 Çark Avcısı",
  },
];

export const GlobalLeaderboardView: React.FC = () => {
  const { currentUser, openAuthModal } = useAuth();
  const { unlockedCount, totalXp } = useBadges();
  const [filterType, setFilterType] = useState<"all" | "analysts" | "oracles">("all");
  const [searchFilter, setSearchFilter] = useState("");

  const spinAnalytics = getSpinAnalytics();

  // Build list including current user if logged in
  let leaderboardList = [...TOP_LEADERBOARD_DATA];

  if (currentUser) {
    const userAlreadyInList = leaderboardList.some((u) => u.name === currentUser.fullName);
    if (!userAlreadyInList) {
      leaderboardList.push({
        rank: unlockedCount >= 5 ? 5 : 8,
        id: "current_user_me",
        name: currentUser.fullName + " (Siz)",
        title: unlockedCount >= 3 ? "Teknoloji Analisti" : "Gelecek Kahini",
        badgeCount: unlockedCount,
        totalXp: totalXp,
        credits: currentUser.credits ?? 0,
        level: Math.floor(totalXp / 150) + 1,
        avatarColor: "from-emerald-400 to-cyan-500",
        isCurrentUser: true,
        spinsCount: spinAnalytics.totalSpins,
        wheelOracleBadge: spinAnalytics.isWheelOracle
          ? `🎡 Aktif Çark Kahini (${spinAnalytics.totalSpins} Çevirme)`
          : "🎡 Yeni Kahin Adayı",
      });
    }
  }

  // Filter list
  if (filterType === "analysts") {
    leaderboardList = leaderboardList.filter((u) => u.title.includes("Analist") || u.title.includes("Stratejist"));
  } else if (filterType === "oracles") {
    leaderboardList = leaderboardList.filter((u) => u.title.includes("Kahin") || u.title.includes("Yolcusu"));
  }

  if (searchFilter.trim() !== "") {
    leaderboardList = leaderboardList.filter(
      (u) =>
        u.name.toLowerCase().includes(searchFilter.toLowerCase()) ||
        u.title.toLowerCase().includes(searchFilter.toLowerCase())
    );
  }

  // Sort by totalXp descending
  leaderboardList.sort((a, b) => b.totalXp - a.totalXp);
  // Reassign ranks
  leaderboardList = leaderboardList.map((item, index) => ({
    ...item,
    rank: index + 1,
  }));

  return (
    <div className="space-y-6 font-sans text-slate-100 max-w-6xl mx-auto py-4">
      
      {/* Header Banner */}
      <div className="relative p-6 sm:p-8 rounded-3xl bg-slate-900 border border-amber-500/30 overflow-hidden shadow-2xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-2 text-center md:text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-300 font-mono text-xs font-bold uppercase tracking-wider">
              <Trophy className="w-4 h-4 text-amber-400" />
              <span>GLOBAL SİMÜLASYON SIRA SİSTEMİ</span>
            </div>

            <h1 className="text-3xl sm:text-4xl font-black text-white font-mono tracking-tight">
              Global Liderlik Tablosu
            </h1>

            <p className="text-sm text-slate-300 max-w-2xl font-sans leading-relaxed">
              En çok <strong className="text-amber-400">Teknoloji Analisti</strong> ve <strong className="text-purple-400">Gelecek Kahini</strong> rozeti toplayan, günlük çark simülasyonunu aktif kullanan ve topluluğa yön veren liderler.
            </p>
          </div>

          {!currentUser ? (
            <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-200 text-xs font-mono space-y-2 text-center md:text-right shrink-0">
              <span className="font-bold text-amber-300 flex items-center justify-center md:justify-end gap-1">
                <Lock className="w-4 h-4" /> Sıralamada Yerinizi Alın
              </span>
              <p className="text-slate-300 font-sans text-[11px] max-w-xs">
                Rozetlerinizi sergilemek ve sıralamada yer almak için oturum açın.
              </p>
              <button
                onClick={openAuthModal}
                className="w-full px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-400 text-slate-950 font-black text-xs uppercase cursor-pointer flex items-center justify-center gap-1.5 shadow-md shadow-amber-500/20"
              >
                <LogIn className="w-4 h-4 text-slate-950" />
                <span>OTURUM AÇ (+50 KREDİ)</span>
              </button>
            </div>
          ) : (
            <div className="p-4 rounded-2xl bg-slate-950/80 border border-amber-500/40 text-center font-mono space-y-1 shrink-0">
              <span className="text-xs text-slate-400">MEVCUT PROFİL SIRANIZ</span>
              <div className="text-2xl font-black text-amber-400 flex items-center justify-center gap-2">
                <Crown className="w-6 h-6 text-amber-400" />
                <span>#{leaderboardList.find((u) => u.isCurrentUser)?.rank || 1}</span>
              </div>
              <span className="text-[11px] text-emerald-400 font-bold block">
                {unlockedCount} Rozet / {totalXp} XP
              </span>
              {spinAnalytics.isWheelOracle && (
                <span className="px-2 py-0.5 rounded bg-amber-500/20 border border-amber-500/40 text-amber-300 text-[10px] font-bold block mt-1">
                  🎡 Aktif Çark Kahini ({spinAnalytics.totalSpins} Çevirme)
                </span>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Top 3 Podium Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {TOP_LEADERBOARD_DATA.slice(0, 3).map((u, i) => {
          const isGold = i === 0;
          const isSilver = i === 1;
          const isBronze = i === 2;

          return (
            <div
              key={`podium-${u.id}-${i}`}
              className={`p-5 rounded-3xl border transition-all relative overflow-hidden flex flex-col justify-between ${
                isGold
                  ? "bg-gradient-to-b from-amber-950/60 to-slate-900 border-amber-500/60 shadow-xl shadow-amber-500/10"
                  : isSilver
                  ? "bg-gradient-to-b from-slate-800/80 to-slate-900 border-slate-400/50"
                  : "bg-gradient-to-b from-amber-950/30 to-slate-900 border-amber-700/40"
              }`}
            >
              <div className="flex items-center justify-between">
                <span
                  className={`px-3 py-1 rounded-full font-mono text-xs font-black uppercase flex items-center gap-1 ${
                    isGold
                      ? "bg-amber-500 text-slate-950"
                      : isSilver
                      ? "bg-slate-300 text-slate-950"
                      : "bg-amber-700 text-white"
                  }`}
                >
                  <Crown className="w-3.5 h-3.5" />
                  <span>#{u.rank} {isGold ? "ŞAMPİYON" : isSilver ? "2. SIRA" : "3. SIRA"}</span>
                </span>

                <span className="text-xs font-mono font-bold text-amber-400">
                  {u.totalXp} XP
                </span>
              </div>

              <div className="my-4 space-y-2 text-center">
                <div
                  className={`mx-auto w-16 h-16 rounded-2xl bg-gradient-to-tr ${u.avatarColor} p-1 shadow-lg flex items-center justify-center text-slate-950 font-black text-xl font-mono`}
                >
                  {u.name.substring(0, 2).toUpperCase()}
                </div>

                <h3 className="text-lg font-black text-white font-mono">{u.name}</h3>

                <div className="flex flex-col items-center gap-1">
                  <span className="px-2.5 py-0.5 rounded-lg bg-amber-500/20 border border-amber-500/40 text-amber-300 text-xs font-mono font-bold inline-block">
                    {u.title}
                  </span>

                  {u.wheelOracleBadge && (
                    <span className="px-2 py-0.5 rounded-full bg-cyan-500/20 border border-cyan-500/40 text-cyan-300 text-[10px] font-mono font-bold">
                      {u.wheelOracleBadge}
                    </span>
                  )}
                </div>
              </div>

              <div className="pt-3 border-t border-white/10 flex items-center justify-between text-xs font-mono text-slate-300">
                <span>🏆 Rozetler: <strong className="text-white">{u.badgeCount}</strong></span>
                <span>⚡ Seviye: <strong className="text-emerald-400">{u.level}</strong></span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Filter Tabs & Search */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-slate-900/80 p-3 rounded-2xl border border-white/10 font-mono text-xs">
        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto">
          <button
            onClick={() => setFilterType("all")}
            className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer ${
              filterType === "all"
                ? "bg-amber-500 text-slate-950 font-bold"
                : "bg-slate-800 text-slate-300 hover:text-white"
            }`}
          >
            Tüm Liderler
          </button>
          <button
            onClick={() => setFilterType("analysts")}
            className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer ${
              filterType === "analysts"
                ? "bg-amber-500 text-slate-950 font-bold"
                : "bg-slate-800 text-slate-300 hover:text-white"
            }`}
          >
            Teknoloji Analistleri 📊
          </button>
          <button
            onClick={() => setFilterType("oracles")}
            className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer ${
              filterType === "oracles"
                ? "bg-amber-500 text-slate-950 font-bold"
                : "bg-slate-800 text-slate-300 hover:text-white"
            }`}
          >
            Gelecek Kahinleri 🔮
          </button>
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Lider ara..."
            value={searchFilter}
            onChange={(e) => setSearchFilter(e.target.value)}
            className="w-full bg-slate-950 border border-white/10 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-amber-500/50"
          />
        </div>
      </div>

      {/* Leaderboard Table List */}
      <div className="bg-slate-900 border border-white/10 rounded-3xl overflow-hidden shadow-2xl font-mono text-xs">
        <div className="grid grid-cols-12 p-3.5 bg-slate-950 text-slate-400 uppercase text-[10px] tracking-wider font-bold border-b border-white/10">
          <div className="col-span-1 text-center">SIRA</div>
          <div className="col-span-4">KULLANICI & UNVAN</div>
          <div className="col-span-2 text-center">ÇARK KAHİNİ ETIKETI</div>
          <div className="col-span-2 text-center">ROZET / SEVİYE</div>
          <div className="col-span-3 text-right pr-2">TOPLAM XP</div>
        </div>

        <div className="divide-y divide-white/5">
          {leaderboardList.map((u, idx) => (
            <div
              key={`leaderboard-row-${u.id}-${u.rank}-${idx}`}
              className={`grid grid-cols-12 p-4 items-center transition-colors ${
                u.isCurrentUser
                  ? "bg-amber-500/15 border-l-4 border-l-amber-500 font-bold"
                  : "hover:bg-slate-800/50"
              }`}
            >
              <div className="col-span-1 text-center font-black text-sm">
                {u.rank === 1 ? "🥇" : u.rank === 2 ? "🥈" : u.rank === 3 ? "🥉" : `#${u.rank}`}
              </div>

              <div className="col-span-4 flex items-center gap-3 min-w-0">
                <div
                  className={`w-9 h-9 rounded-xl bg-gradient-to-tr ${u.avatarColor} p-0.5 flex items-center justify-center text-slate-950 font-black text-xs shrink-0`}
                >
                  {u.name.substring(0, 2).toUpperCase()}
                </div>
                <div className="truncate">
                  <p className="font-bold text-white truncate text-xs flex items-center gap-1.5">
                    {u.name}
                    {u.isCurrentUser && (
                      <span className="px-1.5 py-0.5 rounded bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-[9px] uppercase">
                        SİZ
                      </span>
                    )}
                  </p>
                  <p className="text-[10px] text-amber-400 font-sans truncate">{u.title}</p>
                </div>
              </div>

              <div className="col-span-2 text-center">
                {u.wheelOracleBadge ? (
                  <span className="px-2 py-0.5 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-300 text-[10px] font-bold inline-block">
                    {u.wheelOracleBadge}
                  </span>
                ) : (
                  <span className="text-slate-500 text-[10px]">-</span>
                )}
              </div>

              <div className="col-span-2 text-center font-bold text-slate-300 space-x-1">
                <span className="text-amber-400">{u.badgeCount} Rozet</span>
                <span className="text-slate-500">•</span>
                <span className="text-emerald-400">Lvl {u.level}</span>
              </div>

              <div className="col-span-3 text-right pr-2 font-black text-amber-400 text-sm">
                +{u.totalXp} XP
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};
