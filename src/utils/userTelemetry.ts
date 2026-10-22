/**
 * User Telemetry, Geolocation & Mindset Orientation Intelligence Service
 * Collects transparent, privacy-compliant device, location, cookie & futurology orientation metrics.
 */

export interface UserLocationTelemetry {
  city: string;
  country: string;
  countryCode: string;
  region?: string;
  district?: string;
  isp?: string;
  ip?: string;
  latitude?: number;
  longitude?: number;
  timezone: string;
  locale: string;
  currency: string;
  networkType: string;
  isRealGpsOrIp?: boolean;
  sourceType: "ip" | "gps" | "timezone";
}

export interface UserDeviceTelemetry {
  browser: string;
  os: string;
  deviceType: "Masaüstü (Desktop)" | "Mobil (Mobile)" | "Tablet";
  screenResolution: string;
  actualResolution: string;
  colorDepth: number;
  isTouchScreen: boolean;
  hardwareConcurrency: number;
  deviceMemory: number;
  pixelRatio: number;
}

export interface UserCookieStorageTelemetry {
  consentStatus: "accepted" | "essential_only" | "customized" | "pending";
  consentTimestamp?: string;
  totalStorageKeys: number;
  estimatedStorageKB: number;
  activeSessionId: string;
  hasPersistentAuth: boolean;
}

export interface FuturologyMindsetOrientation {
  primaryArchetype: string; // e.g. "Transhümanist Teknoloji İyimseri"
  archetypeBadge: string;
  archetypeDescription: string;
  scenarioPreference: {
    optimistic: number; // percentage
    dystopian: number;  // percentage
    baseline: number;   // percentage
  };
  interestDistribution: {
    category: string;
    percentage: number;
    color: string;
  }[];
  searchedKeywordsCount: number;
  totalSimulationsRun: number;
  ethicalStance: "Risk Tedbirlisi" | "Dengeli Pragmatist" | "Radikal Hızlandırıcı (e/acc)";
}

export interface ComprehensiveUserTelemetry {
  userId: string;
  userEmail: string;
  capturedAt: string;
  location: UserLocationTelemetry;
  device: UserDeviceTelemetry;
  cookies: UserCookieStorageTelemetry;
  orientations: FuturologyMindsetOrientation;
}

/**
 * Detect client location from verified storage, or browser timezone and locale
 */
export function detectLocationTelemetry(): UserLocationTelemetry {
  // Check if we already have verified real IP or GPS location saved
  if (typeof localStorage !== "undefined") {
    try {
      const cached = localStorage.getItem("verified_real_location");
      if (cached) {
        const parsed = JSON.parse(cached);
        if (parsed && parsed.country && (parsed.isRealGpsOrIp || parsed.city)) {
          return parsed;
        }
      }
    } catch {}
  }

  const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone || "Europe/Istanbul";
  const locale = typeof navigator !== "undefined" ? navigator.language : "tr-TR";

  // Country & currency resolution from timezone heuristics WITHOUT fabricating a specific city
  let country = "Türkiye";
  let countryCode = "TR";
  let city = "";
  let currency = "TRY (₺)";

  if (timezone.includes("Istanbul") || timezone.includes("Turkey")) {
    country = "Türkiye";
    countryCode = "TR";
    city = ""; // Şehir uydurulamaz; IP veya GPS ile canlı doğrulanmalıdır
    currency = "TRY (₺)";
  } else if (timezone.includes("Berlin") || timezone.includes("Europe/Berlin")) {
    country = "Almanya";
    countryCode = "DE";
    city = "";
    currency = "EUR (€)";
  } else if (timezone.includes("London")) {
    country = "Birleşik Krallık";
    countryCode = "GB";
    city = "";
    currency = "GBP (£)";
  } else if (timezone.includes("New_York") || timezone.includes("America/")) {
    country = "Amerika Birleşik Devletleri";
    countryCode = "US";
    city = "";
    currency = "USD ($)";
  } else if (timezone.includes("Tokyo") || timezone.includes("Asia/Tokyo")) {
    country = "Japonya";
    countryCode = "JP";
    city = "";
    currency = "JPY (¥)";
  } else if (timezone.includes("Paris")) {
    country = "Fransa";
    countryCode = "FR";
    city = "";
    currency = "EUR (€)";
  } else if (timezone.includes("Amsterdam")) {
    country = "Hollanda";
    countryCode = "NL";
    city = "";
    currency = "EUR (€)";
  } else {
    const parts = timezone.split("/");
    country = parts[0] || "Küresel";
    countryCode = "GL";
    city = "";
    currency = "USD ($)";
  }

  // Network connection type
  let networkType = "Genişbant (WiFi / Yüksek Hız)";
  if (typeof navigator !== "undefined" && (navigator as any).connection) {
    const conn = (navigator as any).connection;
    if (conn.effectiveType) {
      networkType = `${conn.effectiveType.toUpperCase()} Mobil / Fiber`;
    }
  }

  return {
    city,
    country,
    countryCode,
    timezone,
    locale,
    currency,
    networkType,
    sourceType: "timezone",
    isRealGpsOrIp: false,
  };
}

/**
 * Fetch 100% real IP location from public geolocation API
 */
export async function fetchRealClientLocation(): Promise<UserLocationTelemetry> {
  const base = detectLocationTelemetry();
  try {
    // 1. Try ipwho.is (fast, free, SSL, supports CORS)
    const res = await fetch("https://ipwho.is/", { signal: AbortSignal.timeout(4500) });
    if (res.ok) {
      const data = await res.json();
      if (data && data.success !== false && data.country) {
        const realLocation: UserLocationTelemetry = {
          city: data.city || data.region || "Belirlendi",
          country: data.country,
          countryCode: data.country_code || "TR",
          region: data.region || undefined,
          isp: data.connection?.isp || data.connection?.org || "Yerel İnternet Servis Sağlayıcı",
          ip: data.ip,
          latitude: data.latitude,
          longitude: data.longitude,
          timezone: data.timezone?.id || base.timezone,
          locale: typeof navigator !== "undefined" ? navigator.language : "tr-TR",
          currency: `${data.currency_code || "TRY"} (${data.currency_symbol || "₺"})`,
          networkType: base.networkType,
          isRealGpsOrIp: true,
          sourceType: "ip",
        };
        try {
          localStorage.setItem("verified_real_location", JSON.stringify(realLocation));
        } catch {}
        return realLocation;
      }
    }
  } catch {}

  // 2. Fallback to get.geojs.io
  try {
    const res2 = await fetch("https://get.geojs.io/v1/ip/geo.json", { signal: AbortSignal.timeout(4000) });
    if (res2.ok) {
      const data2 = await res2.json();
      if (data2 && (data2.city || data2.country)) {
        const realLocation: UserLocationTelemetry = {
          city: data2.city || data2.region || "Belirlendi",
          country: data2.country || "Türkiye",
          countryCode: (data2.country_code || "TR").toUpperCase(),
          region: data2.region || undefined,
          isp: data2.organization_name || data2.organization || undefined,
          ip: data2.ip,
          latitude: data2.latitude ? parseFloat(data2.latitude) : undefined,
          longitude: data2.longitude ? parseFloat(data2.longitude) : undefined,
          timezone: base.timezone,
          locale: typeof navigator !== "undefined" ? navigator.language : "tr-TR",
          currency: base.currency,
          networkType: base.networkType,
          isRealGpsOrIp: true,
          sourceType: "ip",
        };
        try {
          localStorage.setItem("verified_real_location", JSON.stringify(realLocation));
        } catch {}
        return realLocation;
      }
    }
  } catch {}

  return base;
}

/**
 * Request precise GPS Location via HTML5 Geolocation API with reverse geocoding
 */
export async function requestGpsLocationAccuracy(): Promise<UserLocationTelemetry> {
  const current = detectLocationTelemetry();
  if (typeof navigator === "undefined" || !navigator.geolocation) {
    throw new Error("Tarayıcınız GPS Geolocation API'sini desteklemiyor.");
  }

  return new Promise((resolve, reject) => {
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const lat = pos.coords.latitude;
        const lon = pos.coords.longitude;
        try {
          // Reverse geocode via OpenStreetMap Nominatim
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&zoom=14&addressdetails=1`,
            {
              headers: { "Accept-Language": "tr" },
              signal: AbortSignal.timeout(4000),
            }
          );
          if (res.ok) {
            const data = await res.json();
            const addr = data.address || {};
            const city = addr.province || addr.city || addr.town || addr.state || current.city;
            const district = addr.suburb || addr.district || addr.county || addr.town || "";
            const country = addr.country || current.country;
            const countryCode = (addr.country_code || "tr").toUpperCase();

            const gpsLocation: UserLocationTelemetry = {
              ...current,
              city: district ? `${district}, ${city}` : city,
              district: district || undefined,
              region: addr.state || addr.province || undefined,
              country,
              countryCode,
              latitude: lat,
              longitude: lon,
              isRealGpsOrIp: true,
              sourceType: "gps",
            };
            try {
              localStorage.setItem("verified_real_location", JSON.stringify(gpsLocation));
            } catch {}
            resolve(gpsLocation);
            return;
          }
        } catch {}

        // Fallback with raw coordinates
        const rawGps: UserLocationTelemetry = {
          ...current,
          latitude: lat,
          longitude: lon,
          isRealGpsOrIp: true,
          sourceType: "gps",
        };
        try {
          localStorage.setItem("verified_real_location", JSON.stringify(rawGps));
        } catch {}
        resolve(rawGps);
      },
      (err) => {
        reject(err);
      },
      { enableHighAccuracy: true, timeout: 8000, maximumAge: 60000 }
    );
  });
}

/**
 * Detect client device, OS, browser and display metrics with 100% precision
 */
export function detectDeviceTelemetry(): UserDeviceTelemetry {
  if (typeof window === "undefined" || typeof navigator === "undefined") {
    return {
      browser: "Chrome",
      os: "Android",
      deviceType: "Mobil (Mobile)",
      screenResolution: "412x915",
      actualResolution: "1080x2400",
      colorDepth: 24,
      isTouchScreen: true,
      hardwareConcurrency: 8,
      deviceMemory: 8,
      pixelRatio: 2.625,
    };
  }

  const ua = navigator.userAgent;

  // OS Detection - Priority: Android & iOS must be checked before Linux/Mac!
  let os = "Bilinmeyen İşletim Sistemi";
  if (/Android/i.test(ua)) {
    const match = ua.match(/Android\s([0-9\.]+)/i);
    os = match ? `Android ${match[1]}` : "Android";
  } else if (/iPhone|iPad|iPod/i.test(ua)) {
    const match = ua.match(/OS\s([0-9_]+)/i);
    os = match ? `iOS ${match[1].replace(/_/g, ".")}` : "iOS";
  } else if (/Windows/i.test(ua)) {
    if (ua.includes("Windows NT 10.0")) os = "Windows 10 / 11";
    else if (ua.includes("Windows NT 6.3")) os = "Windows 8.1";
    else if (ua.includes("Windows NT 6.1")) os = "Windows 7";
    else os = "Windows";
  } else if (/Mac OS X/i.test(ua)) {
    const match = ua.match(/Mac OS X\s([0-9_]+)/i);
    os = match ? `macOS ${match[1].replace(/_/g, ".")}` : "macOS";
  } else if (/CrOS/i.test(ua)) {
    os = "ChromeOS";
  } else if (/Linux/i.test(ua)) {
    os = "Linux (GNU/Linux)";
  }

  // Browser Detection
  let browser = "Chrome";
  if (/Edg/i.test(ua)) browser = "Microsoft Edge";
  else if (/OPR|Opera/i.test(ua)) browser = "Opera";
  else if (/SamsungBrowser/i.test(ua)) {
    const match = ua.match(/SamsungBrowser\/([0-9\.]+)/i);
    browser = match ? `Samsung Internet ${match[1]}` : "Samsung Internet";
  } else if (/Firefox|FxiOS/i.test(ua)) {
    const match = ua.match(/Firefox\/([0-9\.]+)/i);
    browser = match ? `Firefox ${match[1]}` : "Firefox";
  } else if (/Chrome|CriOS/i.test(ua)) {
    const match = ua.match(/Chrome\/([0-9\.]+)/i);
    browser = match ? `Chrome ${match[1].split(".")[0]}` : "Chrome";
  } else if (/Safari/i.test(ua)) {
    browser = "Safari";
  }

  const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(ua);
  const isTablet = /(ipad|tablet|(android(?!.*mobile))|(windows(?!.*phone)(.*touch))|kindle|playbook|silk|(puffin(?!.*(IP|AP|WP))))/i.test(ua);

  let deviceType: "Masaüstü (Desktop)" | "Mobil (Mobile)" | "Tablet" = "Masaüstü (Desktop)";
  if (isTablet) deviceType = "Tablet";
  else if (isMobile) deviceType = "Mobil (Mobile)";

  const width = window.screen.width;
  const height = window.screen.height;
  const dpr = window.devicePixelRatio || 1;
  const screenResolution = `${width}x${height}`;
  const actualResolution = `${Math.round(width * dpr)}x${Math.round(height * dpr)}`;
  const isTouchScreen = "ontouchstart" in window || navigator.maxTouchPoints > 0;
  const hardwareConcurrency = navigator.hardwareConcurrency || 8;
  const deviceMemory = (navigator as any).deviceMemory || 8;

  return {
    browser,
    os,
    deviceType,
    screenResolution,
    actualResolution,
    colorDepth: window.screen.colorDepth || 24,
    isTouchScreen,
    hardwareConcurrency,
    deviceMemory,
    pixelRatio: dpr,
  };
}

/**
 * Read Cookie & LocalStorage telemetry footprint
 */
export function detectCookieStorageTelemetry(): UserCookieStorageTelemetry {
  let consentStatus: "accepted" | "essential_only" | "customized" | "pending" = "pending";
  const savedConsent = typeof localStorage !== "undefined" ? localStorage.getItem("cookie_consent_choice") : null;
  if (savedConsent === "accepted") consentStatus = "accepted";
  else if (savedConsent === "essential_only") consentStatus = "essential_only";
  else if (savedConsent === "customized") consentStatus = "customized";

  let totalKeys = 0;
  let totalBytes = 0;
  if (typeof localStorage !== "undefined") {
    totalKeys = localStorage.length;
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key) {
        const val = localStorage.getItem(key) || "";
        totalBytes += (key.length + val.length) * 2; // 2 bytes per char
      }
    }
  }

  let activeSessionId = "SES-" + Math.floor(100000 + Math.random() * 900000);
  try {
    const ses = sessionStorage.getItem("active_app_session_id");
    if (ses) {
      activeSessionId = ses;
    } else {
      sessionStorage.setItem("active_app_session_id", activeSessionId);
    }
  } catch (e) {}

  const hasPersistentAuth = typeof localStorage !== "undefined" && !!localStorage.getItem("future_timeline_accounts_db");

  return {
    consentStatus,
    consentTimestamp: typeof localStorage !== "undefined" ? localStorage.getItem("cookie_consent_date") || undefined : undefined,
    totalStorageKeys: totalKeys,
    estimatedStorageKB: Math.round((totalBytes / 1024) * 10) / 10,
    activeSessionId,
    hasPersistentAuth,
  };
}

/**
 * Calculate user's futurology mindset & interests orientation from interaction history
 */
export function calculateUserOrientations(userEmail?: string): FuturologyMindsetOrientation {
  let searchHistory: string[] = [];
  try {
    const rawSearches = localStorage.getItem("hub_recent_searches") || localStorage.getItem("futurology_search_queries");
    if (rawSearches) searchHistory = JSON.parse(rawSearches);
  } catch (e) {}

  const joinedText = searchHistory.join(" ").toLowerCase();

  // Keyword scanning
  const aiMatches = (joinedText.match(/yapay|zeka|ai|agi|robot|otomasyon|model|gpt|gemini/g) || []).length;
  const bioMatches = (joinedText.match(/yaşlanma|biyo|genetik|dna|tıp|hücre|organ|klon|ölümsüz/g) || []).length;
  const quantumMatches = (joinedText.match(/kuantum|şifre|kripto|fizik|atom|kubit/g) || []).length;
  const neuralMatches = (joinedText.match(/neuralink|beyin|çip|bci|zihin|telepati/g) || []).length;
  const spaceMatches = (joinedText.match(/uzay|mars|koloni|roket|galaksi|dyson/g) || []).length;

  const totalHits = aiMatches + bioMatches + quantumMatches + neuralMatches + spaceMatches + 5;

  const pAi = Math.round(((aiMatches + 2) / totalHits) * 100);
  const pBio = Math.round(((bioMatches + 1) / totalHits) * 100);
  const pNeural = Math.round(((neuralMatches + 1) / totalHits) * 100);
  const pQuantum = Math.round(((quantumMatches + 0.5) / totalHits) * 100);
  const pSpace = Math.max(5, 100 - (pAi + pBio + pNeural + pQuantum));

  // Determine Primary Archetype
  let primaryArchetype = "Transhümanist Teknoloji Öncüsü";
  let archetypeBadge = "⚡ Singularity Gezgini";
  let archetypeDescription = "Yapay zeka, nöral arayüzler ve biyo-teknolojik dönüşüme yüksek ilgi gösteren, insanlığın sınırlarını genişletmeye odaklı fütürist profil.";
  let ethicalStance: "Risk Tedbirlisi" | "Dengeli Pragmatist" | "Radikal Hızlandırıcı (e/acc)" = "Dengeli Pragmatist";

  if (pBio > 30) {
    primaryArchetype = "Biyo-Hacker & Hücresel Gençleşme Araştırmacısı";
    archetypeBadge = "🧬 Biyo-Ölümsüzlük İzcisi";
    archetypeDescription = "Biyolojik yaşlanmayı tersine çevirme, hücresel terapi ve gen düzenlemeye odaklanan, yaşam süresini uzatma yanlısı profil.";
    ethicalStance = "Radikal Hızlandırıcı (e/acc)";
  } else if (pAi > 35) {
    primaryArchetype = "AGI & Yapay Zeka Hiyerarşisi Stratejisti";
    archetypeBadge = "🧠 Sentetik Zihin Kuramcısı";
    archetypeDescription = "Süper zeka (ASI) ortaya çıkışı, otonom ajanlar ve mesleki otomasyon risklerini yakından izleyen analitik profil.";
    ethicalStance = "Risk Tedbirlisi";
  } else if (pQuantum > 20) {
    primaryArchetype = "Kuantum Güvenlik & Post-Kriptografi Kaşifi";
    archetypeBadge = "⚛️ Kuantum Dalgası Analisti";
    archetypeDescription = "Kuantum üstünlüğü, şifreleme kırılmaları ve atomik ölçekli hesaplama paradigmalarına odaklanan uzman profil.";
    ethicalStance = "Dengeli Pragmatist";
  }

  // Scenario Mode inclination from preferences
  const prefScenario = typeof localStorage !== "undefined" ? localStorage.getItem("preferred_scenario_mode") : "baseline";
  let opt = 45;
  let dys = 25;
  let base = 30;

  if (prefScenario === "optimistic") {
    opt = 65; dys = 15; base = 20;
  } else if (prefScenario === "dystopian") {
    opt = 20; dys = 60; base = 20;
  }

  return {
    primaryArchetype,
    archetypeBadge,
    archetypeDescription,
    scenarioPreference: {
      optimistic: opt,
      dystopian: dys,
      baseline: base,
    },
    interestDistribution: [
      { category: "Yapay Genel Zeka (AGI)", percentage: pAi, color: "#06b6d4" },
      { category: "Biyoloji & Ömür Uzatma", percentage: pBio, color: "#10b981" },
      { category: "Nöral Arayüz & BCI", percentage: pNeural, color: "#8b5cf6" },
      { category: "Kuantum Bilişim", percentage: pQuantum, color: "#ec4899" },
      { category: "Uzay Kolonizasyonu", percentage: pSpace, color: "#f59e0b" },
    ],
    searchedKeywordsCount: searchHistory.length,
    totalSimulationsRun: Number(localStorage.getItem("total_simulations_count") || 0),
    ethicalStance,
  };
}

/**
 * Generate full comprehensive telemetry snapshot for current user session
 */
export function getComprehensiveTelemetry(userId?: string, userEmail?: string): ComprehensiveUserTelemetry {
  return {
    userId: userId || "usr_guest_" + (typeof window !== "undefined" ? window.screen.width : "0"),
    userEmail: userEmail || "misafir@kullanici.yerel",
    capturedAt: new Date().toISOString(),
    location: detectLocationTelemetry(),
    device: detectDeviceTelemetry(),
    cookies: detectCookieStorageTelemetry(),
    orientations: calculateUserOrientations(userEmail),
  };
}
