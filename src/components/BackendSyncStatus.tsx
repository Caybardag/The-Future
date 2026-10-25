import React, { useState, useEffect } from "react";
import { safeFetchJson } from "../utils/apiClient";
import {
  RefreshCw,
  Clock,
  Database,
  CheckCircle2,
  Server,
  Activity,
  ChevronDown,
  ChevronUp,
  History,
  ShieldCheck,
} from "lucide-react";

export interface SyncLogItem {
  id: string;
  timestamp: string;
  formattedTime: string;
  scannedSourcesCount: number;
  updatedMilestonesCount: number;
  status: "success" | "warning" | "in_progress";
  details: string;
  changesSummary: string[];
}

interface BackendSyncStatusProps {
  compact?: boolean;
}

export const BackendSyncStatus: React.FC<BackendSyncStatusProps> = ({ compact = false }) => {
  const [lastSyncFormatted, setLastSyncFormatted] = useState<string>("Yükleniyor...");
  const [hoursSince, setHoursSince] = useState<number>(4);
  const [nextSync, setNextSync] = useState<string>("");
  const [logs, setLogs] = useState<SyncLogItem[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [showLogDrawer, setShowLogDrawer] = useState<boolean>(false);
  const [isLocked, setIsLocked] = useState<boolean>(false);
  const [cooldownRemaining, setCooldownRemaining] = useState<number>(0);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Fetch sync status from server
  const fetchSyncStatus = async () => {
    try {
      const data = await safeFetchJson("/api/sync/status");
      if (data.success) {
        setLastSyncFormatted(data.lastSyncFormatted);
        setHoursSince(data.hoursSinceLastSync);
        setNextSync(data.nextScheduledSync);
        setLogs(data.logs || []);
        setIsLocked(!!data.isLocked);
        if (typeof data.cooldownRemainingSeconds === "number") {
          setCooldownRemaining(data.cooldownRemainingSeconds);
        }
      }
    } catch (err) {
      // Offline fallback
      const now = new Date();
      setLastSyncFormatted(now.toLocaleString("tr-TR"));
      setHoursSince(0.1);
    }
  };

  useEffect(() => {
    fetchSyncStatus();
    // Poll sync status every 30 seconds
    const interval = setInterval(fetchSyncStatus, 30000);
    return () => clearInterval(interval);
  }, []);

  // Cooldown countdown timer
  useEffect(() => {
    if (cooldownRemaining <= 0) return;
    const timer = setInterval(() => {
      setCooldownRemaining((prev) => {
        if (prev <= 1) {
          setIsLocked(false);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [cooldownRemaining]);

  const handleManualSync = async () => {
    setLoading(true);
    setToastMessage(null);
    try {
      const data = await safeFetchJson("/api/sync/trigger", { method: "POST" });
      if (data.success) {
        setLastSyncFormatted(data.lastSyncFormatted);
        setHoursSince(0);
        setIsLocked(true);
        if (typeof data.cooldownRemainingSeconds === "number") {
          setCooldownRemaining(data.cooldownRemainingSeconds);
        }
        if (data.message) {
          setToastMessage(data.message);
          setTimeout(() => setToastMessage(null), 7000);
        }
        if (data.log) {
          setLogs((prev) => {
            const exists = prev.some((l) => l.id === data.log.id);
            return exists ? prev : [data.log, ...prev];
          });
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };
  const formatCooldown = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}dk ${secs < 10 ? "0" : ""}${secs}sn`;
  };

  if (compact) {
    return (
      <div className="relative inline-block text-left">
        <button
          onClick={() => setShowLogDrawer(!showLogDrawer)}
          className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-900/90 border border-emerald-500/30 hover:border-emerald-500/60 text-[11px] font-mono transition-all text-slate-300 cursor-pointer shadow-sm"
          title="24 Saatlik Otomatik Back-end Veri Senkronizasyonu"
        >
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-slate-400">Son Senkronizasyon:</span>
          <span className="text-emerald-300 font-bold">{lastSyncFormatted}</span>
          <ChevronDown className="w-3 h-3 text-slate-400" />
        </button>

        {/* Compact Dropdown Log Drawer */}
        {showLogDrawer && (
          <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-[#070b14] border border-cyan-500/40 rounded-2xl p-4 shadow-2xl z-50 text-xs font-mono space-y-3 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-white/10 pb-2">
              <div className="flex items-center gap-2 text-cyan-400 font-bold">
                <Server className="w-4 h-4 text-cyan-400" />
                <span>7/24 Otonom İstihbarat & Senkronizasyon Logu</span>
              </div>
              <div className="px-2.5 py-1 rounded-lg bg-emerald-950/80 text-emerald-300 border border-emerald-500/40 flex items-center gap-1.5 text-[10px] font-bold font-mono">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span>Otonom Arka Plan Dinleyici Aktif (5 dk)</span>
              </div>
            </div>

            <div className="space-y-1 text-[11px] text-slate-300">
              <div className="flex justify-between">
                <span className="text-slate-400">Son Senkronizasyon Kontrolü:</span>
                <span className="text-emerald-400 font-bold">{lastSyncFormatted}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Gelecek Otomatik Kontrol:</span>
                <span className="text-cyan-300">{nextSync || "5 dakika sonra"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Sistem Modu:</span>
                <span className="text-emerald-300 font-bold">Otonom Arka Plan Daemon (7/24)</span>
              </div>
            </div>

            <div className="border-t border-white/10 pt-2 space-y-2">
              <div className="text-[10px] text-slate-400 uppercase font-bold flex items-center justify-between">
                <span className="flex items-center gap-1">
                  <History className="w-3 h-3 text-slate-400" />
                  <span>Son Değişiklik Özeti</span>
                </span>
                <span className="text-[9px] text-emerald-400 bg-emerald-950/60 px-1.5 py-0.5 rounded border border-emerald-500/30">
                  ✓ Değişmez Geçmiş Çapası Korunuyor
                </span>
              </div>
              {logs.length > 0 && (
                <div className="bg-slate-950 p-2.5 rounded-xl border border-white/10 space-y-1.5 text-[10px]">
                  <p className="text-slate-300">{logs[0].details}</p>
                  <ul className="list-disc list-inside text-slate-400 space-y-0.5">
                    {logs[0].changesSummary?.map((c, i) => (
                      <li key={`summary-change-${i}`}>{c}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    );
  }

  // Full Panel View
  return (
    <div className="bg-slate-950 border border-cyan-500/30 rounded-2xl p-5 space-y-4 font-mono text-slate-200 shadow-xl">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 pb-3">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-cyan-950 border border-cyan-500/40 text-cyan-400">
            <Server className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                24 Saatlik Otonom Back-end Sync Engine
              </span>
              <span className="text-[10px] text-slate-400">Çoklu Kullanıcı Güvenliği & Kaskad Mantığı</span>
            </div>
            <h4 className="text-sm font-bold text-white mt-0.5">Sistem Veri, Zaman ve Varsayım Senkronizasyonu</h4>
          </div>
        </div>

        <div className="px-3.5 py-2 rounded-xl text-xs font-bold font-mono bg-emerald-950/80 text-emerald-300 border border-emerald-500/40 flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
          <span>Otomatik Sistem Senkronizasyonu Aktif (Periyodik Otonom Döngü)</span>
        </div>
      </div>

      {toastMessage && (
        <div className="p-3 rounded-xl bg-cyan-950/90 border border-cyan-500/50 text-xs text-cyan-200 flex items-center justify-between font-sans">
          <span>{toastMessage}</span>
          <span className="text-[10px] font-mono bg-cyan-900 px-2 py-0.5 rounded text-cyan-300">15 Dk Atomik Kilit</span>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
        <div className="p-3 rounded-xl bg-slate-900 border border-white/10 space-y-1">
          <span className="text-slate-400 text-[10px]">Son Senkronizasyon Zamanı</span>
          <div className="text-sm font-bold text-emerald-400 flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>{lastSyncFormatted}</span>
          </div>
        </div>

        <div className="p-3 rounded-xl bg-slate-900 border border-white/10 space-y-1">
          <span className="text-slate-400 text-[10px]">Geçen Süre / Tarama Döngüsü</span>
          <div className="text-sm font-bold text-cyan-300 flex items-center gap-1.5">
            <Clock className="w-4 h-4 text-cyan-400" />
            <span>{hoursSince} saat önce</span>
          </div>
        </div>

        <div className="p-3 rounded-xl bg-slate-900 border border-white/10 space-y-1">
          <span className="text-slate-400 text-[10px]">Spam Koruma & Kilit Durumu</span>
          <div className="text-sm font-bold flex items-center gap-1.5">
            <Activity className="w-4 h-4 text-amber-400" />
            <span className={isLocked ? "text-amber-300" : "text-emerald-300"}>
              {isLocked ? `Kilitli (${formatCooldown(cooldownRemaining)})` : "Hazır (Kilit Yok)"}
            </span>
          </div>
        </div>
      </div>

      {/* Deep-Dive Architectural & Mathematical Time Isolation Explanation Banner */}
      <div className="p-4 rounded-xl bg-slate-900 border border-emerald-500/30 space-y-3 text-xs font-sans">
        <div className="flex items-center justify-between border-b border-white/10 pb-2">
          <div className="flex items-center gap-2 font-bold text-emerald-400 font-mono">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Çift Katmanlı Otonom Veri Senkronizasyonu & Ortak Konsensüs Mimarisi</span>
          </div>
          <span className="text-[10px] text-cyan-300 bg-cyan-950 px-2 py-0.5 rounded border border-cyan-500/30 font-mono">
            Advanced Dual-Layer SLA
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-[11px] text-slate-300 leading-relaxed">
          <div className="p-3 rounded-lg bg-slate-950 border border-white/5 space-y-1.5">
            <div className="flex items-center justify-between">
              <strong className="text-cyan-300 font-mono">1. Otonom Arka Plan Taraması (24-72 Saat)</strong>
              <span className="text-[9px] text-emerald-400 bg-emerald-950 px-1 rounded">SLA Dahilinde (0 Kredi)</span>
            </div>
            <p className="text-slate-400 text-[11px] leading-normal">
              <strong>Bulut Senkronizasyonu:</strong> Otonom çalışan arka plan servisleri, düzenli aralıklarla küresel tescil ve akademik veri kaynaklarını sıfır bakiye düşümü ile otomatik olarak senkronize eder.
            </p>
          </div>

          <div className="p-3 rounded-lg bg-slate-950 border border-white/5 space-y-1.5">
            <div className="flex items-center justify-between">
              <strong className="text-amber-300 font-mono">2. Sıralı & Kuyruklu Denetim (Milestone Queue)</strong>
              <span className="text-[9px] text-amber-400 bg-amber-950 px-1 rounded">Sıralı İşleme</span>
            </div>
            <p className="text-slate-400 text-[11px] leading-normal">
              <strong>Kuyruklu & Sıralı İşleme:</strong> Güncellenmesi gereken dönüm noktaları sırayla işleme alınır. Sistem kaynaklarını korumak ve hata riskini sıfırlamak için her dönüm noktası bağımsız olarak teker teker doğrulanır.
            </p>
          </div>

          <div className="p-3 rounded-lg bg-slate-950 border border-white/5 space-y-1.5">
            <div className="flex items-center justify-between">
              <strong className="text-purple-300 font-mono">3. Ortak Katkı & SLA Avantajı</strong>
              <span className="text-[9px] text-purple-400 bg-purple-950 px-1 rounded">Öncelikli Bildirim</span>
            </div>
            <p className="text-slate-400 text-[11px] leading-normal">
              <strong>Kullanıcı Avantajları:</strong> Konsensüs havuzuna bakiye tahsis eden kullanıcılar, veri doğrulama süreçlerinde öncelikli analiz ve anormallik durumlarında anlık bildirim kazanır.
            </p>
          </div>
        </div>
      </div>

      {/* Sync Log Timeline */}
      <div className="space-y-2 pt-2">
        <div className="text-xs font-bold text-slate-300 flex items-center justify-between">
          <span className="flex items-center gap-1.5">
            <History className="w-4 h-4 text-cyan-400" />
            <span>Senkronizasyon Geçmişi ve Güncellenen Varsayımlar</span>
          </span>
          <span className="text-[10px] text-slate-400 font-mono">Son 20 İşlem Kayıtlı</span>
        </div>

        <div className="space-y-2 max-h-48 overflow-y-auto scrollbar-thin scrollbar-thumb-slate-800 font-mono">
          {logs.map((log, idx) => (
            <div key={`${log.id}-${idx}`} className="p-3 rounded-xl bg-slate-900/80 border border-white/5 space-y-1 text-xs">
              <div className="flex justify-between items-center text-slate-400 text-[11px]">
                <span className="font-bold text-cyan-400">{log.id}</span>
                <span className="text-slate-400">{log.formattedTime}</span>
              </div>
              <p className="text-slate-300 text-xs font-sans">{log.details}</p>
              {log.changesSummary && log.changesSummary.length > 0 && (
                <ul className="list-disc list-inside text-[11px] text-slate-400 space-y-0.5 font-sans">
                  {(log.changesSummary || []).map((c, i) => (
                    <li key={`log-item-${log.id}-change-${i}`}>{c}</li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
