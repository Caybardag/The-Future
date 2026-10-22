import React, { useState, useMemo } from "react";
import {
  Globe,
  MapPin,
  Compass,
  Cpu,
  Cookie,
  ShieldCheck,
  Smartphone,
  Monitor,
  Activity,
  Sparkles,
  Search,
  Filter,
  RefreshCw,
  Eye,
  Database,
  Wifi,
  Clock,
  Layers,
  Zap,
  TrendingUp,
  Brain,
  Atom,
  Dna,
  Terminal,
  FileSpreadsheet,
  CheckCircle2,
  AlertCircle
} from "lucide-react";
import {
  getComprehensiveTelemetry,
  ComprehensiveUserTelemetry,
  detectLocationTelemetry,
  detectDeviceTelemetry,
  detectCookieStorageTelemetry,
  calculateUserOrientations,
  fetchRealClientLocation,
  requestGpsLocationAccuracy,
  UserLocationTelemetry
} from "../utils/userTelemetry";
import { getAllAccounts, StoredUserAccount, saveAccount } from "../utils/userAccounts";

interface UserTelemetryAnalyticsPanelProps {
  mode?: "admin" | "self";
  currentEmail?: string;
  onRefresh?: () => void;
}

export const UserTelemetryAnalyticsPanel: React.FC<UserTelemetryAnalyticsPanelProps> = ({
  mode = "admin",
  currentEmail,
  onRefresh,
}) => {
  const [selectedUserEmail, setSelectedUserEmail] = useState<string>(currentEmail || "");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string>("all");
  const [isLiveActive, setIsLiveActive] = useState(true);

  // Real live location state
  const [liveLocation, setLiveLocation] = useState<UserLocationTelemetry>(() => detectLocationTelemetry());
  const [isDetectingGps, setIsDetectingGps] = useState(false);
  const [gpsStatusMessage, setGpsStatusMessage] = useState<string | null>(null);

  // Self or current user telemetry
  const myTelemetry = useMemo(() => {
    return getComprehensiveTelemetry(undefined, currentEmail);
  }, [currentEmail]);

  // Real device telemetry
  const liveDevice = useMemo(() => {
    return detectDeviceTelemetry();
  }, []);

  // Fetch 100% real IP-based location automatically on mount (both admin and self)
  React.useEffect(() => {
    fetchRealClientLocation().then((loc) => {
      if (loc && (loc.isRealGpsOrIp || loc.country)) {
        setLiveLocation(loc);
      }
    }).catch(() => {});
  }, []);

  // Handle GPS Precision Location Detection
  const handleRequestGps = async () => {
    setIsDetectingGps(true);
    setGpsStatusMessage("GPS uydularına ve baz istasyonuna bağlanılıyor...");
    try {
      const gpsLoc = await requestGpsLocationAccuracy();
      setLiveLocation(gpsLoc);
      setGpsStatusMessage(`🎯 Gerçek GPS konumu doğrulandı: ${gpsLoc.city || "Konum"}, ${gpsLoc.country}`);
      // Also update stored account
      const activeEmail = currentEmail || selectedUserEmail || "warfacelove46@gmail.com";
      const acc = getAllAccounts()[activeEmail.toLowerCase()];
      if (acc) {
        saveAccount({
          ...acc,
          location: {
            city: gpsLoc.city,
            country: gpsLoc.country,
            countryCode: gpsLoc.countryCode,
            district: gpsLoc.district,
            region: gpsLoc.region,
            latitude: gpsLoc.latitude,
            longitude: gpsLoc.longitude,
            isp: gpsLoc.isp,
            ip: gpsLoc.ip,
            sourceType: gpsLoc.sourceType,
            isRealGpsOrIp: gpsLoc.isRealGpsOrIp,
            updatedAt: new Date().toISOString(),
          },
        });
      }
    } catch (err: any) {
      // If GPS denied or failed, refresh via real IP
      try {
        const ipLoc = await fetchRealClientLocation();
        setLiveLocation(ipLoc);
        setGpsStatusMessage(`🛰️ Canlı IP konumu doğrulandı: ${ipLoc.city || ipLoc.region || "Konum"}, ${ipLoc.country}`);
      } catch {
        setGpsStatusMessage("⚠️ Konum izni verilmedi veya zaman aşımına uğradı.");
      }
    } finally {
      setIsDetectingGps(false);
      setTimeout(() => setGpsStatusMessage(null), 6000);
    }
  };

  // Load only genuine registered accounts from database (NO mock accounts)
  const allAccounts = useMemo(() => {
    const accs = Object.values(getAllAccounts());
    return accs;
  }, []);

  // Construct telemetries for all users with ONLY 100% REAL and non-fabricated data
  const userTelemetries = useMemo(() => {
    return allAccounts.map((acc) => {
      const normalizedEmail = acc.email.toLowerCase();
      const isSuper = normalizedEmail === "warfacelove46@gmail.com";
      const isCurrentActive = Boolean(
        (currentEmail && normalizedEmail === currentEmail.toLowerCase()) ||
        (!currentEmail && isSuper)
      );

      if (isCurrentActive) {
        // Active session: 100% genuine live device, IP/GPS location and storage metrics
        const hasVerifiedLoc = Boolean(liveLocation.isRealGpsOrIp && (liveLocation.city || liveLocation.region));
        const city = hasVerifiedLoc
          ? (liveLocation.city || liveLocation.region || "Tespit Edildi")
          : (liveLocation.city ? liveLocation.city : "Canlı Konum Taranıyor...");
        const country = liveLocation.country || "Türkiye";
        const timezone = liveLocation.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone || "Europe/Istanbul";
        const device = `${liveDevice.os} / ${liveDevice.browser}`;
        const deviceType = liveDevice.deviceType;
        const cookieConsent = myTelemetry.cookies.consentStatus === "accepted"
          ? "Tam Kabul (Accepted)"
          : myTelemetry.cookies.consentStatus === "essential_only"
          ? "Zorunlu Çerezler"
          : "Belirlenmedi";
        const storageKB = myTelemetry.cookies.estimatedStorageKB;
        const hasHistory = myTelemetry.orientations.searchedKeywordsCount > 0;
        const archetype = hasHistory ? myTelemetry.orientations.primaryArchetype : "Henüz Belirlenmedi";
        const orientationScore = hasHistory ? {
          ai: myTelemetry.orientations.interestDistribution[0]?.percentage || 0,
          bio: myTelemetry.orientations.interestDistribution[1]?.percentage || 0,
          quantum: myTelemetry.orientations.interestDistribution[3]?.percentage || 0,
        } : null;
        const scenarioTendency = hasHistory
          ? `%${myTelemetry.orientations.scenarioPreference.optimistic} İyimser / %${myTelemetry.orientations.scenarioPreference.dystopian} Distopik`
          : "Etkileşim Bekleniyor";

        return {
          id: acc.id,
          email: acc.email,
          fullName: acc.fullName,
          role: acc.role,
          credits: acc.credits,
          plan: acc.plan,
          isCurrentActive: true,
          hasVerifiedLocation: Boolean(liveLocation.isRealGpsOrIp),
          city,
          country,
          countryCode: liveLocation.countryCode || "TR",
          timezone,
          region: liveLocation.region,
          isp: liveLocation.isp,
          ip: liveLocation.ip,
          latitude: liveLocation.latitude,
          longitude: liveLocation.longitude,
          sourceType: liveLocation.sourceType,
          device,
          deviceType,
          cookieConsent,
          storageKB,
          archetype,
          orientationScore,
          scenarioTendency,
          lastActive: "Aktif Oturum (Şimdi)",
        };
      }

      // Other registered users: Show ONLY genuinely recorded values or truthful "Not recorded" state
      const hasSavedLoc = Boolean(acc.location && (acc.location.city || acc.location.country));
      const city = acc.location?.city || "Konum Kaydı Yok";
      const country = acc.location?.country || "İzin Verilmedi / Kaydedilmedi";
      const timezone = acc.location?.timezone || "-";
      const device = acc.device ? `${acc.device.os} / ${acc.device.browser}` : "Kayıt Yok";
      const deviceType = acc.device?.deviceType || "Bilinmiyor";
      const cookieConsent = acc.cookieConsent || "Bilinmiyor";

      return {
        id: acc.id,
        email: acc.email,
        fullName: acc.fullName,
        role: acc.role,
        credits: acc.credits,
        plan: acc.plan,
        isCurrentActive: false,
        hasVerifiedLocation: Boolean(hasSavedLoc && acc.location?.isRealGpsOrIp),
        city,
        country,
        countryCode: acc.location?.countryCode || "-",
        timezone,
        region: acc.location?.region,
        isp: acc.location?.isp,
        ip: acc.location?.ip,
        latitude: acc.location?.latitude,
        longitude: acc.location?.longitude,
        sourceType: acc.location?.sourceType || "none",
        device,
        deviceType,
        cookieConsent,
        storageKB: null,
        archetype: "Henüz Belirlenmedi",
        orientationScore: null,
        scenarioTendency: "Etkileşim Kaydı Yok",
        lastActive: acc.joinedDate ? `Kayıt: ${acc.joinedDate}` : "Geçmiş Oturum",
      };
    });
  }, [allAccounts, currentEmail, liveLocation, liveDevice, myTelemetry]);

  // Genuine Statistics
  const verifiedLocationsCount = useMemo(() => {
    return userTelemetries.filter((u) => u.hasVerifiedLocation && u.city !== "Konum Kaydı Yok").length;
  }, [userTelemetries]);

  const uniqueVerifiedCountries = useMemo(() => {
    const list = userTelemetries
      .filter((u) => u.hasVerifiedLocation && u.country && !u.country.includes("İzin Verilmedi"))
      .map((u) => u.country);
    return Array.from(new Set(list));
  }, [userTelemetries]);

  const superAdminCount = useMemo(() => {
    return userTelemetries.filter((u) => u.role === "superadmin" || u.email.toLowerCase() === "warfacelove46@gmail.com").length;
  }, [userTelemetries]);

  const standardUserCount = userTelemetries.length - superAdminCount;

  // Filtered list
  const filteredUsers = useMemo(() => {
    return userTelemetries.filter((u) => {
      const matchesSearch =
        u.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        u.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        u.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
        u.archetype.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesSearch;
    });
  }, [userTelemetries, searchQuery]);

  const activeSelectedUser = useMemo(() => {
    if (!selectedUserEmail) return userTelemetries[0] || null;
    return userTelemetries.find((u) => u.email.toLowerCase() === selectedUserEmail.toLowerCase()) || userTelemetries[0];
  }, [selectedUserEmail, userTelemetries]);

  // Self Mode: Return personal telemetry & orientation card
  if (mode === "self") {
    return (
      <div className="space-y-4 sm:space-y-6 text-slate-200">
        {/* Header Badge with GPS Refresh Action */}
        <div className="p-3.5 sm:p-5 rounded-2xl bg-gradient-to-r from-cyan-950/70 via-slate-900 to-purple-950/70 border border-cyan-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4 shadow-lg">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-cyan-500/20 border border-cyan-400/40 flex items-center justify-center text-cyan-300 shrink-0">
              <Compass className="w-5 h-5 sm:w-6 sm:h-6 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="font-bold text-white text-sm sm:text-base">Fütüroloji Yönelim & Dijital Ayak İzim</h3>
                <span className="px-2 py-0.5 rounded-md bg-cyan-500/20 text-cyan-300 text-[10px] font-mono font-bold border border-cyan-400/30">
                  {myTelemetry.orientations.archetypeBadge}
                </span>
              </div>
              <p className="text-[11px] sm:text-xs text-slate-400 mt-0.5">
                Cihazınızın donanımı, gerçek IP/GPS lokasyonunuz ve fütüristik araştırma eğilimleriniz.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-end">
            <button
              onClick={handleRequestGps}
              disabled={isDetectingGps}
              className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 active:scale-95 disabled:opacity-50 text-white font-mono text-xs font-bold transition-all shadow-md shadow-cyan-600/30 cursor-pointer"
              title="Cihazınızın GPS ve gerçek lokasyonunu doğrulamak için tıklayın"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isDetectingGps ? "animate-spin text-amber-300" : ""}`} />
              <span>{isDetectingGps ? "Konum Taranıyor..." : "🛰️ Gerçek GPS/Konum Doğrula"}</span>
            </button>
            <div className="hidden xs:flex items-center gap-1.5 text-[11px] font-mono bg-slate-900/90 px-2.5 py-1.5 rounded-xl border border-slate-800 text-slate-300 shrink-0">
              <Activity className="w-3.5 h-3.5 text-emerald-400 animate-spin" />
              <span>Canlı Aktif</span>
            </div>
          </div>
        </div>

        {/* Status Toast Message when GPS is clicked */}
        {gpsStatusMessage && (
          <div className="px-4 py-2.5 rounded-xl bg-slate-900/90 border border-cyan-500/40 text-cyan-300 text-xs font-mono flex items-center gap-2 animate-in fade-in duration-200">
            <Sparkles className="w-4 h-4 text-cyan-400 shrink-0" />
            <span>{gpsStatusMessage}</span>
          </div>
        )}

        {/* 3 Metric Grid: 100% Real Konum, 100% Real Cihaz & Donanım, Çerezler */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5 sm:gap-4">
          {/* 1. GERÇEK KONUM & İNTERNET SERVİS SAĞLAYICI */}
          <div className="p-3.5 sm:p-4 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-2.5 shadow-md">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-cyan-400 flex items-center gap-1.5">
                <MapPin className="w-4 h-4" /> Kullanım Konumu
              </span>
              <span className={`text-[10px] font-mono px-2 py-0.5 rounded border ${
                liveLocation.isRealGpsOrIp
                  ? "bg-emerald-950 text-emerald-300 border-emerald-800 font-bold"
                  : "bg-cyan-950 text-cyan-300 border-cyan-800"
              }`}>
                {liveLocation.isRealGpsOrIp ? "CANLI DOĞRULANDI" : liveLocation.countryCode}
              </span>
            </div>

            <div className="space-y-1.5 text-xs">
              <div className="flex justify-between items-center text-slate-300">
                <span className="text-slate-400">Şehir / Ülke:</span>
                <span className="font-bold text-white text-right max-w-[160px] truncate" title={`${liveLocation.city}, ${liveLocation.country}`}>
                  {liveLocation.city}, {liveLocation.country}
                </span>
              </div>

              {liveLocation.region && (
                <div className="flex justify-between items-center text-slate-300">
                  <span className="text-slate-400">Bölge / Eyalet:</span>
                  <span className="font-mono text-cyan-300 text-right">{liveLocation.region}</span>
                </div>
              )}

              {liveLocation.isp && (
                <div className="flex justify-between items-center text-slate-300">
                  <span className="text-slate-400">İnternet Servis (ISP):</span>
                  <span className="font-mono text-emerald-300 text-right max-w-[150px] truncate" title={liveLocation.isp}>
                    {liveLocation.isp}
                  </span>
                </div>
              )}

              <div className="flex justify-between items-center text-slate-300">
                <span className="text-slate-400">Saat Dilimi:</span>
                <span className="font-mono text-cyan-300">{liveLocation.timezone}</span>
              </div>

              <div className="flex justify-between items-center text-slate-300">
                <span className="text-slate-400">Ağ Tipi:</span>
                <span className="text-emerald-400 flex items-center gap-1 font-mono">
                  <Wifi className="w-3 h-3" /> {liveLocation.networkType}
                </span>
              </div>

              {liveLocation.latitude && liveLocation.longitude && (
                <div className="pt-1 border-t border-white/5 flex justify-between items-center text-[10px] font-mono text-slate-400">
                  <span>GPS Koordinat:</span>
                  <span className="text-cyan-400">{liveLocation.latitude.toFixed(4)}°, {liveLocation.longitude.toFixed(4)}°</span>
                </div>
              )}
            </div>
          </div>

          {/* 2. GERÇEK CİHAZ, İŞLETİM SİSTEMİ & DONANIM */}
          <div className="p-3.5 sm:p-4 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-2.5 shadow-md">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-purple-400 flex items-center gap-1.5">
                <Monitor className="w-4 h-4" /> Cihaz & Donanım
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-purple-950 text-purple-300 border border-purple-800 font-bold">
                {liveDevice.deviceType}
              </span>
            </div>

            <div className="space-y-1.5 text-xs">
              <div className="flex justify-between items-center text-slate-300">
                <span className="text-slate-400">İşletim Sistemi:</span>
                <span className="font-bold text-white">{liveDevice.os}</span>
              </div>

              <div className="flex justify-between items-center text-slate-300">
                <span className="text-slate-400">Tarayıcı Motoru:</span>
                <span className="text-purple-300 font-medium">{liveDevice.browser}</span>
              </div>

              <div className="flex justify-between items-center text-slate-300">
                <span className="text-slate-400">Ekran Çözünürlüğü:</span>
                <span className="font-mono text-slate-200">{liveDevice.screenResolution}</span>
              </div>

              {liveDevice.actualResolution && (
                <div className="flex justify-between items-center text-slate-300">
                  <span className="text-slate-400">Fiziksel Panel (DPR {liveDevice.pixelRatio}x):</span>
                  <span className="font-mono text-purple-300">{liveDevice.actualResolution}</span>
                </div>
              )}

              <div className="flex justify-between items-center text-slate-300">
                <span className="text-slate-400">İşlemci / Donanım:</span>
                <span className="font-mono text-cyan-300">{liveDevice.hardwareConcurrency} Çekirdek CPU</span>
              </div>

              <div className="pt-1 border-t border-white/5 flex justify-between items-center text-[10px] font-mono text-slate-400">
                <span>Dokunmatik Ekran:</span>
                <span className={liveDevice.isTouchScreen ? "text-emerald-400 font-bold" : "text-slate-400"}>
                  {liveDevice.isTouchScreen ? "✅ Aktif (Touch)" : "Fare / Klavye"}
                </span>
              </div>
            </div>
          </div>

          {/* 3. GERÇEK ÇEREZ & HAFIZA DEPODURUMU */}
          <div className="p-3.5 sm:p-4 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-2.5 shadow-md">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-amber-400 flex items-center gap-1.5">
                <Cookie className="w-4 h-4" /> Çerez & Depolama
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800 font-bold">
                KVKK / GDPR
              </span>
            </div>

            <div className="space-y-1.5 text-xs">
              <div className="flex justify-between items-center text-slate-300">
                <span className="text-slate-400">Çerez Tercihi:</span>
                <span className="font-bold text-amber-300 capitalize">
                  {myTelemetry.cookies.consentStatus === "accepted" ? "Tam İzin (Onaylandı)" : "Zorunlu Çerezler"}
                </span>
              </div>

              <div className="flex justify-between items-center text-slate-300">
                <span className="text-slate-400">Yerel Bellek Boyutu:</span>
                <span className="font-mono text-emerald-400">
                  {myTelemetry.cookies.estimatedStorageKB} KB ({myTelemetry.cookies.totalStorageKeys} anahtar)
                </span>
              </div>

              <div className="flex justify-between items-center text-slate-300">
                <span className="text-slate-400">Oturum Kimliği:</span>
                <span className="font-mono text-slate-400">{myTelemetry.cookies.activeSessionId}</span>
              </div>

              <div className="flex justify-between items-center text-slate-300">
                <span className="text-slate-400">Kalıcı Oturum:</span>
                <span className="font-mono text-cyan-300">
                  {myTelemetry.cookies.hasPersistentAuth ? "Aktif (Token Kayıtlı)" : "Misafir Oturumu"}
                </span>
              </div>

              <div className="pt-1 border-t border-white/5 flex justify-between items-center text-[10px] font-mono text-slate-400">
                <span>Veri Gizliliği:</span>
                <span className="text-emerald-400">Şifrelenmiş Yerel Depolama</span>
              </div>
            </div>
          </div>
        </div>

        {/* Fütüroloji Yönelim & İlgi Alanı Dağılımı */}
        <div className="p-5 rounded-2xl bg-slate-900/90 border border-cyan-500/20 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div>
              <h4 className="font-bold text-white text-sm flex items-center gap-2">
                <Brain className="w-4 h-4 text-cyan-400" />
                Algılanan İlgi Alanları & Fütürist Karakteriniz
              </h4>
              <p className="text-xs text-slate-400 mt-0.5">
                {myTelemetry.orientations.archetypeDescription}
              </p>
            </div>
            <div className="text-right">
              <span className="text-[11px] text-slate-400 block font-mono">Etik Duruş:</span>
              <span className="px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 text-xs font-bold border border-purple-500/30">
                {myTelemetry.orientations.ethicalStance}
              </span>
            </div>
          </div>

          <div className="space-y-3">
            <div className="text-xs font-bold text-slate-300 flex items-center justify-between">
              <span>Fütüroloji İlgi Dağılımınız</span>
              <span className="text-slate-500 font-mono">Toplamsal %100</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {myTelemetry.orientations.interestDistribution.map((item, idx) => (
                <div key={idx} className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-200">{item.category}</span>
                    <span className="font-mono font-bold" style={{ color: item.color }}>%{item.percentage}</span>
                  </div>
                  <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{ width: `${item.percentage}%`, backgroundColor: item.color }}
                    />
                  </div>
                </div>
              ))}
            </div>

            {/* Senaryo Eğilimi */}
            <div className="p-3.5 rounded-xl bg-cyan-950/20 border border-cyan-500/20 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-cyan-400 shrink-0" />
                <span className="text-slate-300">
                  Gelecek Beklentiniz: <strong className="text-cyan-300 font-mono">%{myTelemetry.orientations.scenarioPreference.optimistic} İyimser</strong> vs <strong className="text-rose-300 font-mono">%{myTelemetry.orientations.scenarioPreference.dystopian} Distopik</strong>
                </span>
              </div>
              <span className="text-[11px] text-slate-400">
                Simülasyon Gezintisi: {myTelemetry.orientations.totalSimulationsRun} kez
              </span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Admin Mode: Full Multi-User Telemetry, Location & Orientation Control Room
  return (
    <div className="space-y-6">
      {/* Top Banner & Telemetry KPIs (100% Genuine Metrics) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1 */}
        <div className="p-4 rounded-2xl bg-slate-900/90 border border-cyan-500/30 space-y-1">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Doğrulanmış Konumlar</span>
            <Globe className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-white flex items-center gap-2">
            <span>{verifiedLocationsCount} / {userTelemetries.length}</span>
            <span className="text-xs px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-normal">
              {uniqueVerifiedCountries.length > 0 ? `${uniqueVerifiedCountries.length} Ülke` : "0 Doğrulanmış"}
            </span>
          </div>
          <div className="text-[11px] text-slate-400 flex items-center gap-1">
            <span className={`w-1.5 h-1.5 rounded-full ${verifiedLocationsCount > 0 ? "bg-emerald-400" : "bg-amber-400"}`} />
            <span className="truncate">
              {uniqueVerifiedCountries.length > 0
                ? `${uniqueVerifiedCountries.join(", ")} (Canlı IP/GPS)`
                : "Canlı konum tespiti bekleniyor"}
            </span>
          </div>
        </div>

        {/* KPI 2 */}
        <div className="p-4 rounded-2xl bg-slate-900/90 border border-purple-500/30 space-y-1">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Kayıtlı Kullanıcılar</span>
            <Brain className="w-4 h-4 text-purple-400" />
          </div>
          <div className="text-xl font-bold font-mono text-white truncate">
            {userTelemetries.length} Hesap
          </div>
          <div className="text-[11px] text-slate-400">
            Süper Yönetici: {superAdminCount} • Standart: {standardUserCount}
          </div>
        </div>

        {/* KPI 3 */}
        <div className="p-4 rounded-2xl bg-slate-900/90 border border-amber-500/30 space-y-1">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Aktif Oturum KVKK / Çerez</span>
            <Cookie className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-lg font-bold text-white truncate">
            {myTelemetry.cookies.consentStatus === "accepted" ? "Tam Kabul (Onaylı)" : "Zorunlu Çerezler"}
          </div>
          <div className="text-[11px] text-emerald-400 flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3 shrink-0" />
            <span>{myTelemetry.cookies.estimatedStorageKB} KB gerçek bellek boyutu</span>
          </div>
        </div>

        {/* KPI 4 */}
        <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-1">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Aktif Oturum Cihazı</span>
            <Monitor className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-base font-bold font-mono text-white truncate">
            {liveDevice.deviceType}
          </div>
          <div className="text-[11px] text-slate-400 truncate" title={`${liveDevice.os} • ${liveDevice.browser}`}>
            {liveDevice.os} • {liveDevice.browser}
          </div>
        </div>
      </div>

      {/* Live Action Bar & Status */}
      <div className="p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-xs text-slate-300">
          <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>Sistemde yalnızca gerçek cihaz, doğrulanmış IP/GPS ve kullanıcının gerçek oturum verileri listelenir. Hiçbir uydurma veri üretilmez.</span>
        </div>
        <button
          onClick={handleRequestGps}
          disabled={isDetectingGps}
          className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 active:scale-95 disabled:opacity-50 text-white font-mono text-xs font-bold transition-all shadow-md shadow-cyan-600/30 cursor-pointer shrink-0"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isDetectingGps ? "animate-spin text-amber-300" : ""}`} />
          <span>{isDetectingGps ? "Konum Doğrulanıyor..." : "🛰️ Canlı Konumumu Doğrula (GPS/IP)"}</span>
        </button>
      </div>

      {/* Status Toast Message */}
      {gpsStatusMessage && (
        <div className="px-4 py-2.5 rounded-xl bg-slate-900/95 border border-cyan-500/40 text-cyan-300 text-xs font-mono flex items-center gap-2 animate-in fade-in duration-200">
          <Sparkles className="w-4 h-4 text-cyan-400 shrink-0" />
          <span>{gpsStatusMessage}</span>
        </div>
      )}

      {/* Main Split View: User List & Detailed Telemetry Inspector */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: User Telemetry Table (7 cols) */}
        <div className="lg:col-span-7 bg-slate-900/80 rounded-2xl border border-slate-800 p-4 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <MapPin className="w-4 h-4 text-cyan-400" />
                Kullanıcı Konum & Telemetri Dizini
              </h3>
              <p className="text-xs text-slate-400">Doğrulanmış oturum lokasyonları, donanım kimlikleri ve KVKK izinleri</p>
            </div>

            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Kullanıcı, e-posta veya şehir ara..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-8 pr-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500 w-52"
                />
              </div>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950/80 text-slate-400 border-b border-slate-800 font-mono">
                <tr>
                  <th className="py-2.5 px-3">Kullanıcı</th>
                  <th className="py-2.5 px-3">Konum (Şehir / Ülke)</th>
                  <th className="py-2.5 px-3">Yönelim Durumu</th>
                  <th className="py-2.5 px-3">Çerez Durumu</th>
                  <th className="py-2.5 px-3 text-right">İşlem</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-sans">
                {filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-slate-500 text-xs">
                      Arama kriterine uygun kullanıcı bulunamadı.
                    </td>
                  </tr>
                ) : (
                  filteredUsers.map((u, uIdx) => {
                    const isSelected = activeSelectedUser?.email === u.email;
                    return (
                      <tr
                        key={u.email ? `${u.email}-${uIdx}` : `user-${uIdx}`}
                        onClick={() => setSelectedUserEmail(u.email)}
                        className={`hover:bg-cyan-950/20 cursor-pointer transition-colors ${
                          isSelected ? "bg-cyan-950/40 border-l-2 border-cyan-400" : ""
                        }`}
                      >
                        <td className="py-2.5 px-3">
                          <div className="font-bold text-white truncate max-w-[140px] flex items-center gap-1.5">
                            <span>{u.fullName}</span>
                            {u.isCurrentActive && (
                              <span className="text-[9px] font-mono px-1 py-0.2 rounded bg-cyan-950 text-cyan-300 border border-cyan-800">
                                SİZ
                              </span>
                            )}
                          </div>
                          <div className="text-[11px] text-slate-400 truncate max-w-[140px] font-mono">{u.email}</div>
                        </td>
                        <td className="py-2.5 px-3 whitespace-nowrap">
                          {u.hasVerifiedLocation && u.city !== "Konum Kaydı Yok" ? (
                            <>
                              <div className="font-semibold text-emerald-400 flex items-center gap-1">
                                <MapPin className="w-3 h-3 text-emerald-400 shrink-0" />
                                <span>{u.city}</span>
                                <span className="text-[9px] px-1 py-0.2 bg-emerald-950 text-emerald-300 border border-emerald-800 rounded font-mono">
                                  {u.sourceType === "gps" ? "GPS" : "IP"}
                                </span>
                              </div>
                              <div className="text-[10px] text-slate-400">
                                {u.country} {u.timezone && u.timezone !== "-" ? `(${u.timezone})` : ""}
                              </div>
                            </>
                          ) : (
                            <>
                              <div className="font-medium text-slate-500 flex items-center gap-1">
                                <MapPin className="w-3 h-3 text-slate-600 shrink-0" />
                                <span>Konum Kaydı Yok</span>
                              </div>
                              <div className="text-[10px] text-slate-600">İzin verilmedi / Giriş yapılmadı</div>
                            </>
                          )}
                        </td>
                        <td className="py-2.5 px-3">
                          {u.archetype !== "Henüz Belirlenmedi" ? (
                            <>
                              <span className="px-2 py-0.5 rounded-full bg-purple-500/10 text-purple-300 text-[11px] font-medium border border-purple-500/20 whitespace-nowrap">
                                {u.archetype}
                              </span>
                              <div className="text-[10px] text-slate-400 mt-0.5">
                                {u.scenarioTendency}
                              </div>
                            </>
                          ) : (
                            <>
                              <span className="px-2 py-0.5 rounded-md bg-slate-900 text-slate-500 text-[10px] border border-slate-800">
                                Henüz Belirlenmedi
                              </span>
                              <div className="text-[10px] text-slate-600 mt-0.5">Etkileşim geçmişi yok</div>
                            </>
                          )}
                        </td>
                        <td className="py-2.5 px-3 whitespace-nowrap">
                          {u.cookieConsent !== "Bilinmiyor" ? (
                            <>
                              <span className="text-[11px] text-amber-300 font-mono flex items-center gap-1">
                                <Cookie className="w-3 h-3" /> {u.cookieConsent}
                              </span>
                              {u.storageKB !== null && (
                                <span className="text-[10px] text-slate-500 block font-mono">{u.storageKB} KB bellek</span>
                              )}
                            </>
                          ) : (
                            <span className="text-[11px] text-slate-600 font-mono">Kayıtsız</span>
                          )}
                        </td>
                        <td className="py-2.5 px-3 text-right">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedUserEmail(u.email);
                            }}
                            className="px-2.5 py-1 rounded-lg bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 text-[11px] font-bold border border-cyan-400/30 transition-colors cursor-pointer"
                          >
                            İncele
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right Column: Deep-Dive User Telemetry Inspector (5 cols) */}
        <div className="lg:col-span-5 bg-slate-900/90 rounded-2xl border border-cyan-500/30 p-5 space-y-5">
          {activeSelectedUser ? (
            <>
              {/* Header Profile Info */}
              <div className="flex items-start justify-between border-b border-slate-800 pb-3">
                <div>
                  <span className="text-[10px] font-mono font-bold text-cyan-400 uppercase tracking-wider block">
                    KULLANICI TELEMETRİ DOSYASI
                  </span>
                  <h4 className="text-base font-bold text-white mt-0.5 flex items-center gap-2">
                    <span>{activeSelectedUser.fullName}</span>
                    {activeSelectedUser.isCurrentActive && (
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800">
                        AKTİF OTURUM
                      </span>
                    )}
                  </h4>
                  <p className="text-xs text-slate-400 font-mono">{activeSelectedUser.email}</p>
                </div>
                <span className="px-2 py-1 rounded-lg bg-cyan-950 text-cyan-300 border border-cyan-800 text-xs font-mono font-bold">
                  {activeSelectedUser.plan.toUpperCase()}
                </span>
              </div>

              {/* Geo-Location & Network Card */}
              <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800 space-y-2.5 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-cyan-400 flex items-center gap-1.5">
                    <Globe className="w-3.5 h-3.5" /> Konum & Ağ İmzası
                  </span>
                  <span className={`text-[10px] font-mono px-2 py-0.5 rounded border ${
                    activeSelectedUser.hasVerifiedLocation
                      ? "bg-emerald-950 text-emerald-300 border-emerald-800 font-bold"
                      : "bg-slate-900 text-slate-500 border-slate-800"
                  }`}>
                    {activeSelectedUser.hasVerifiedLocation ? "CANLI DOĞRULANDI" : "KAYIT BULUNMUYOR"}
                  </span>
                </div>

                {activeSelectedUser.hasVerifiedLocation && activeSelectedUser.city !== "Konum Kaydı Yok" ? (
                  <div className="grid grid-cols-2 gap-2 text-slate-300">
                    <div>
                      <span className="text-slate-500 block text-[10px]">Şehir / Ülke:</span>
                      <span className="font-bold text-white">{activeSelectedUser.city}, {activeSelectedUser.country}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block text-[10px]">Saat Dilimi (Timezone):</span>
                      <span className="font-mono text-cyan-300">{activeSelectedUser.timezone}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block text-[10px]">Cihaz & İşletim Sistemi:</span>
                      <span className="text-slate-200">{activeSelectedUser.device}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block text-[10px]">Son Canlı Etkinlik:</span>
                      <span className="text-emerald-400 font-mono">{activeSelectedUser.lastActive}</span>
                    </div>
                    {activeSelectedUser.isp && (
                      <div className="col-span-2">
                        <span className="text-slate-500 block text-[10px]">İnternet Servis Sağlayıcı (ISP):</span>
                        <span className="text-emerald-300 font-mono">{activeSelectedUser.isp}</span>
                      </div>
                    )}
                    {activeSelectedUser.latitude && activeSelectedUser.longitude && (
                      <div className="col-span-2 pt-1 border-t border-white/5 flex justify-between items-center text-[10px] font-mono text-slate-400">
                        <span>Doğrulanmış Koordinat:</span>
                        <span className="text-cyan-400">{activeSelectedUser.latitude.toFixed(4)}°, {activeSelectedUser.longitude.toFixed(4)}°</span>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="p-2.5 rounded-lg bg-slate-900/60 border border-slate-800 text-[11px] text-slate-400">
                    <p className="font-medium text-slate-300">Konum İzni Verilmedi</p>
                    <p className="text-slate-500 mt-0.5">Bu kullanıcı tarayıcıda konum izni vermediği için sistemde hiçbir tahmini veya uydurma veri kaydedilmemiştir.</p>
                  </div>
                )}
              </div>

              {/* Cookies & Storage Footprint */}
              <div className="p-3.5 rounded-xl bg-amber-950/20 border border-amber-500/20 space-y-2 text-xs">
                <span className="font-bold text-amber-300 flex items-center gap-1.5">
                  <Cookie className="w-3.5 h-3.5 text-amber-400" /> Çerezler & Yerel Bellek Durumu
                </span>
                <div className="flex items-center justify-between text-slate-300">
                  <span>Çerez Onayı:</span>
                  <span className="font-bold text-white">{activeSelectedUser.cookieConsent}</span>
                </div>
                <div className="flex items-center justify-between text-slate-300">
                  <span>LocalStorage Kullanımı:</span>
                  <span className="font-mono text-amber-300">
                    {activeSelectedUser.storageKB !== null ? `${activeSelectedUser.storageKB} KB` : "İstemci tarafı (Gizli)"}
                  </span>
                </div>
                <div className="flex items-center justify-between text-slate-300">
                  <span>Kredi Bakiyesi:</span>
                  <span className="font-bold font-mono text-cyan-300">{activeSelectedUser.credits} Kredi</span>
                </div>
              </div>

              {/* Fütüroloji Yönelimi & İlgi Ağırlıkları */}
              <div className="p-3.5 rounded-xl bg-purple-950/20 border border-purple-500/20 space-y-3 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-purple-300 flex items-center gap-1.5">
                    <Compass className="w-3.5 h-3.5 text-purple-400" /> Fütüroloji Yönelim Analizi
                  </span>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-purple-900/60 text-purple-200 font-mono">
                    {activeSelectedUser.archetype}
                  </span>
                </div>

                {activeSelectedUser.orientationScore ? (
                  <>
                    {/* Progress bars */}
                    <div className="space-y-2 pt-1">
                      <div>
                        <div className="flex justify-between text-[11px] mb-1">
                          <span className="text-slate-300">Yapay Genel Zeka (AGI) Odağı</span>
                          <span className="font-mono text-cyan-400">%{activeSelectedUser.orientationScore.ai}</span>
                        </div>
                        <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                          <div
                            className="bg-cyan-500 h-full rounded-full"
                            style={{ width: `${activeSelectedUser.orientationScore.ai}%` }}
                          />
                        </div>
                      </div>

                      <div>
                        <div className="flex justify-between text-[11px] mb-1">
                          <span className="text-slate-300">Biyo-Ölümsüzlük & Hücresel Tıp</span>
                          <span className="font-mono text-emerald-400">%{activeSelectedUser.orientationScore.bio}</span>
                        </div>
                        <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                          <div
                            className="bg-emerald-500 h-full rounded-full"
                            style={{ width: `${activeSelectedUser.orientationScore.bio}%` }}
                          />
                        </div>
                      </div>

                      <div>
                        <div className="flex justify-between text-[11px] mb-1">
                          <span className="text-slate-300">Kuantum Bilişim & Şifreleme</span>
                          <span className="font-mono text-purple-400">%{activeSelectedUser.orientationScore.quantum}</span>
                        </div>
                        <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                          <div
                            className="bg-purple-500 h-full rounded-full"
                            style={{ width: `${activeSelectedUser.orientationScore.quantum}%` }}
                          />
                        </div>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-purple-500/20 text-[11px] text-slate-400 flex items-center justify-between">
                      <span>Gelecek Eğilimi:</span>
                      <span className="font-bold text-white font-mono">{activeSelectedUser.scenarioTendency}</span>
                    </div>
                  </>
                ) : (
                  <p className="text-[11px] text-slate-500">
                    Bu hesap için henüz fütüroloji araması veya simülasyon etkileşim geçmişi bulunmuyor.
                  </p>
                )}
              </div>
            </>
          ) : (
            <div className="py-12 text-center text-slate-500 text-xs">
              Listeden incelemek istediğiniz kullanıcıyı seçin.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
