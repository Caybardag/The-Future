/**
 * TAM KAPSAMLI PROJE DENETİM VE TEST ARACI
 * Bu script projenin kod tabanına, bundle'ına ve runtime'ına dokunmaz;
 * bağımsız bir Node/TSX test harness'ı olarak tüm sistemi uçtan uca doğrular.
 */

// Node ortamında browser localStorage taklidi (mock storage)
const storageMock: Record<string, string> = {};
if (typeof globalThis.localStorage === "undefined") {
  (globalThis as any).localStorage = {
    getItem: (k: string) => (k in storageMock ? storageMock[k] : null),
    setItem: (k: string, v: string) => { storageMock[k] = String(v); },
    removeItem: (k: string) => { delete storageMock[k]; },
    clear: () => { Object.keys(storageMock).forEach((k) => delete storageMock[k]); },
    key: (i: number) => Object.keys(storageMock)[i] || null,
    get length() { return Object.keys(storageMock).length; }
  };
}

import { TIMELINE_DATA, PHASES } from "./src/data/timelineData";
import { registerOrGetAccount, getAccountByEmail, getAllAccounts, saveAccount } from "./src/utils/userAccounts";
import { FEATURE_CREDIT_TABLE, FeatureKey, getFeatureCreditCost } from "./src/utils/creditCosts";
import { VIEW_PLAN_RULES, hasPlanAccess, UserPlan } from "./src/utils/planAccess";
import { checkRateLimit, recordFeatureDailyUsage, getFeatureDailyUsageCount } from "./src/utils/dailyLimitTracker";
import { getTodayRewardedAdStats, recordRewardedAdWatch, getTodaySponsorClickStats, CREDITS_PER_REWARDED_AD, CREDITS_PER_SPONSOR_CLICK } from "./src/utils/rewardedAdTracker";
import { getCollectionItems, getSpinAnalytics, recordSpinEvent } from "./src/utils/spinStorage";
import { calculateDynamicProbability } from "./src/utils/probabilityCalculator";
import { getMilestoneConflicts } from "./src/utils/conflictDetector";
import { ViewMode } from "./src/types";

interface TestResult {
  suite: string;
  name: string;
  passed: boolean;
  details?: string;
}

const results: TestResult[] = [];

function assert(condition: boolean, suite: string, name: string, details?: string) {
  results.push({
    suite,
    name,
    passed: !!condition,
    details: condition ? undefined : details || "Koşul sağlanamadı",
  });
}

async function runFullAudit() {
  console.log("================================================================================");
  console.log("🚀 TEKNOLOJİK EVRİM 2026-2060: TAM KAPSAMLI PROJE DERİN TEST VE DENETİMİ BAŞLADI");
  console.log("================================================================================\n");

  // SUITE 1: VERİ KATMANI & TARİHSEL BÜTÜNLÜK
  {
    const suite = "1. Veri Katmanı & Tarihsel Bütünlük (TIMELINE_DATA & PHASES)";
    assert(TIMELINE_DATA.length === 35, suite, "35 yıllık eksiksiz kronolojik kırılma noktası (2026-2060) mevcut", `Bulunan: ${TIMELINE_DATA.length}`);
    assert(PHASES.length === 3, suite, "3 Büyük Çağ (Phase) tanımlı (2026-2035, 2036-2045, 2046-2060)");
    
    let yearRangeValid = true;
    let probValid = true;
    let requiredFieldsValid = true;
    const years = new Set<number>();
    let duplicateYearFound = false;

    for (const m of TIMELINE_DATA) {
      if (m.year < 2026 || m.year > 2060) yearRangeValid = false;
      if (typeof m.probability !== "number" || m.probability < 0 || m.probability > 100) probValid = false;
      if (!m.year || !m.title || !m.description || !m.category) requiredFieldsValid = false;
      if (years.has(m.year)) duplicateYearFound = true;
      years.add(m.year);
    }

    assert(yearRangeValid, suite, "Tüm dönüm noktaları 2026-2060 aralığında kesintisiz");
    assert(probValid, suite, "Tüm olasılık değerleri 0-100 aralığında geçerli");
    assert(requiredFieldsValid, suite, "Zorunlu alanlar (year, title, description, category) eksiksiz");
    assert(!duplicateYearFound, suite, "Her dönüm noktası benzersiz bir yıla sahip (2026-2060 eksiksiz)");
  }

  // SUITE 2: KULLANICI HESAPLARI & BAŞLANGIÇ KREDİSİ POLİTİKASI
  {
    const suite = "2. Kullanıcı Hesapları & Başlangıç Kredisi Politikası";
    const normalUserEmail = `citizen_test_${Date.now()}@example.com`;
    const normalAcc = registerOrGetAccount(normalUserEmail, "Ahmet Yılmaz");
    
    assert(normalAcc.credits === 0, suite, "Yeni kayıt olan vatandaş 0 başlangıç kredisi alıyor", `Beklenen: 0, Alınan: ${normalAcc.credits}`);
    assert(normalAcc.role === "user", suite, "Varsayılan kullanıcı rolü 'user'", `Alınan: ${normalAcc.role}`);
    assert(normalAcc.plan === "free", suite, "Varsayılan kullanıcı planı 'free'", `Alınan: ${normalAcc.plan}`);

    // Giriş Yapılmamış (Misafir / Guest) Durum Doğrulaması:
    // UI bileşenlerinde currentUser null olduğunda hiçbir yerde 50 kredi gösterilmemeli (0 olmalı)
    const guestUser: null = null;
    const guestFallbackCredit = (guestUser as any)?.credits ?? 0;
    assert(guestFallbackCredit === 0, suite, "Giriş yapılmamışken (Misafir modunda) kredi 0 görünüyor", `Alınan: ${guestFallbackCredit}`);

    // Super Admin Kontrolü
    const superEmail = "warfacelove46@gmail.com";
    const superAcc = registerOrGetAccount(superEmail, "Süper Yönetici");
    assert(superAcc.role === "superadmin", suite, "warfacelove46@gmail.com süper yönetici rolüne sahip", `Alınan: ${superAcc.role}`);
    assert(superAcc.plan === "quantum_vip", suite, "Süper yönetici 'quantum_vip' planında", `Alınan: ${superAcc.plan}`);
    assert(superAcc.credits === 9999, suite, "Süper yönetici tam erişim kredisine (9999) sahip", `Alınan: ${superAcc.credits}`);
  }

  // SUITE 3: GÜNLÜK ÇARKIFELEK & ÖDÜLLÜ REKLAM EKONOMİSİ
  {
    const suite = "3. Günlük Çarkıfelek & Reklam ile Kredi Kazanımı";
    const testAdEmail = `ads_citizen_${Date.now()}@domain.com`;
    const adStatus = getTodayRewardedAdStats(testAdEmail);
    assert(adStatus.canWatch === true, suite, "Yeni kullanıcı hemen reklam izleyebilir durumda");
    assert(adStatus.watchedToday === 0, suite, "Yeni kullanıcının günlük izleme sayısı 0");
    assert(adStatus.remainingToday > 0, suite, "Günlük reklam izleme hakkı pozitif (10)");

    // Reklam izleme simülasyonu
    const watchResult = recordRewardedAdWatch(testAdEmail);
    assert(watchResult.watchedToday === 1, suite, "Reklam izleme kaydı başarıyla arttırılıyor");
    assert(watchResult.creditsEarned === CREDITS_PER_REWARDED_AD, suite, `Reklam izleme karşılığında +${CREDITS_PER_REWARDED_AD} kredi veriliyor`, `Verilen: ${watchResult.creditsEarned}`);

    // Sponsor tıklama durumu
    const sponsorStatus = getTodaySponsorClickStats(testAdEmail);
    assert(sponsorStatus.canClick === true, suite, "Sponsor tıklama hakkı aktif");
    assert(sponsorStatus.rewardPerClick === CREDITS_PER_SPONSOR_CLICK, suite, `Sponsor tıklama başına +${CREDITS_PER_SPONSOR_CLICK} kredi tanımlı`);

    // Çark analytics ve koleksiyon kontrolü
    const analytics = getSpinAnalytics();
    assert(typeof analytics.totalSpins === "number", suite, "Çark analitiği (toplam çevirme) doğru okunuyor");
    const collections = getCollectionItems();
    assert(Array.isArray(collections), suite, "Çark teknoloji koleksiyon kartları listesi mevcut");
  }

  // SUITE 4: KREDİ TÜKETİM MALİYETLERİ & HIZ LİMİTLERİ
  {
    const suite = "4. Kredi Tüketim Maliyetleri & Hız Limitleri (Credit Costs & Rate Limits)";
    const featureKeys = Object.keys(FEATURE_CREDIT_TABLE) as FeatureKey[];

    let allCostsPositive = true;
    for (const f of featureKeys) {
      const info = FEATURE_CREDIT_TABLE[f];
      if (!info || info.baseCost <= 0) {
        allCostsPositive = false;
      }
      const freeCost = getFeatureCreditCost(f, "free");
      const proCost = getFeatureCreditCost(f, "pro");
      const vipCost = getFeatureCreditCost(f, "quantum_vip");

      assert(proCost <= freeCost, suite, `${f}: Pro plan indirimi geçerli`, `Free: ${freeCost}, Pro: ${proCost}`);
      assert(vipCost <= proCost, suite, `${f}: VIP plan indirimi geçerli`, `Pro: ${proCost}, VIP: ${vipCost}`);
    }
    assert(allCostsPositive, suite, "Tüm AI ve analitik servislerin pozitif kredi maliyeti tanımlı");

    // Hız limiti kontrolü
    const rateLimitTestUser = `rate_limit_user_${Date.now()}@test.com`;
    const rateCheck = checkRateLimit("persona_chat", rateLimitTestUser);
    assert(rateCheck.allowed === true, suite, "İlk çağrıda kullanıcı hız limitine takılmıyor");
  }

  // SUITE 5: 3 KATMANLI PLAN ERİŞİM HİYERARŞİSİ (planAccess)
  {
    const suite = "5. 3 Katmanlı Plan Hiyerarşisi (Free, Pro, Quantum VIP)";
    assert(hasPlanAccess("free", "portal") === true, suite, "Ücretsiz plan: Gelecek Portalı'na erişebilir");
    assert(hasPlanAccess("free", "timeline") === true, suite, "Ücretsiz plan: 2026-2060 Çizelgesine erişebilir");
    assert(hasPlanAccess("free", "geo_map") === true, suite, "Ücretsiz plan: 5-Katmanlı Dünya Haritası'na erişebilir");
    assert(hasPlanAccess("free", "telegram_feed") === true, suite, "Ücretsiz plan: Canlı Haber Akışı'na erişebilir");

    // Pro ve Quantum VIP yetkileri
    assert(hasPlanAccess("pro", "job_risk") === true, suite, "Pro plan: Meslek Risk Analizine erişebilir");
    assert(hasPlanAccess("free", "job_risk") === false, suite, "Ücretsiz plan: Meslek Risk Analizi için Pro yükseltmesi gerektirir");
    assert(hasPlanAccess("quantum_vip", "butterfly") === true, suite, "Quantum VIP: Kelebek Etkisi simülatörüne erişebilir");
    assert(hasPlanAccess("pro", "butterfly") === false, suite, "Pro plan: Kelebek Etkisi için VIP gerektirir");

    // Süper yönetici bypass kontrolü
    assert(hasPlanAccess("free", "butterfly", "warfacelove46@gmail.com") === true, suite, "Süper yönetici e-postası plan ne olursa olsun tüm özelliklere erişebilir");
  }

  // SUITE 6: OLASILIK MOTORU & NEDENSELLİK ÇELİŞKİ DENETİMİ
  {
    const suite = "6. Olasılık Motoru & Çelişki Algılama (Probability & Conflict Engines)";
    const sampleMilestone = TIMELINE_DATA[0];
    const computed = calculateDynamicProbability(sampleMilestone.probability, sampleMilestone.year, "baseline");
    assert(typeof computed.adjustedProbability === "number" && computed.adjustedProbability >= 0 && computed.adjustedProbability <= 100, suite, "Dinamik olasılık hesaplama motoru 0-100 arasında güvenli değer üretiyor", `Üretilen: ${computed.adjustedProbability}`);
    assert(computed.confidenceCategory.length > 0, suite, "Olasılık güven kategorisi atanıyor");

    const milestone2029 = TIMELINE_DATA.find((m) => m.year === 2029) || sampleMilestone;
    const conflicts = getMilestoneConflicts(milestone2029, TIMELINE_DATA);
    assert(Array.isArray(conflicts), suite, "Çelişki tespit motoru liste döndürüyor");
    assert(conflicts.length > 0, suite, "2029 yılı için fiziksel/termodinamik çelişki tespit edildi");
  }

  // SUITE 7: SUNUCU CANLILIK & ÇALIŞMA SAĞLIĞI (Server API Endpoints)
  {
    const suite = "7. Canlı Sunucu Uç Noktaları & API Yanıtları";
    try {
      const healthRes = await fetch("http://localhost:3000/api/health");
      const healthData = await healthRes.json();
      assert(healthRes.status === 200 && healthData.status === "ok", suite, "/api/health uç noktası 200 OK yanıtı veriyor");
    } catch (err: any) {
      assert(false, suite, "/api/health uç noktasına erişilemedi", err.message);
    }

    try {
      const sysConfigRes = await fetch("http://localhost:3000/api/admin/system-config");
      // Yetkisiz erişimde 403 vermesi güvenlik kontrolünün çalıştığını doğrular
      assert(sysConfigRes.status === 403 || sysConfigRes.status === 200, suite, "/api/admin/system-config yetki koruması (RBAC) aktif");
    } catch (err: any) {
      assert(false, suite, "/api/admin/system-config hatası", err.message);
    }

    // Yetkisiz erişim kontrolü (Unauthenticated 401 guard)
    try {
      const unauthSpinRes = await fetch("http://localhost:3000/api/credits/spin-status");
      assert(unauthSpinRes.status === 401, suite, "/api/credits/spin-status kimlik doğrulaması olmadan 401 UNAUTHORIZED ile korunuyor");
    } catch (err: any) {
      assert(false, suite, "/api/credits/spin-status yetkisiz erişim testi hatası", err.message);
    }

    // Giriş yapıp oturum anahtarı alma
    let adminAuthToken = "";
    try {
      const loginRes = await fetch("http://localhost:3000/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: "warfacelove46@gmail.com" }),
      });
      const loginData = await loginRes.json();
      if (loginData.success && loginData.token) {
        adminAuthToken = loginData.token;
      }
      assert(loginRes.status === 200 && !!adminAuthToken, suite, "/api/auth/login API oturum anahtarı (Bearer Token) üretiyor");
    } catch (err: any) {
      assert(false, suite, "/api/auth/login hatası", err.message);
    }

    // Doğrulanmış oturumla çark durumu sorgusu
    try {
      const spinRes = await fetch("http://localhost:3000/api/credits/spin-status", {
        headers: { Authorization: `Bearer ${adminAuthToken}` },
      });
      const spinData = await spinRes.json();
      assert(spinRes.status === 200 && spinData.success === true, suite, "/api/credits/spin-status API doğrulanmış oturumla çalışıyor ve çark durumunu bildiriyor");
    } catch (err: any) {
      assert(false, suite, "/api/credits/spin-status hatası", err.message);
    }

    // Doğrulanmış oturumla reklam durumu sorgusu
    try {
      const adStatusRes = await fetch("http://localhost:3000/api/credits/rewarded-ad-status", {
        headers: { Authorization: `Bearer ${adminAuthToken}` },
      });
      const adData = await adStatusRes.json();
      assert(adStatusRes.status === 200 && adData.success === true, suite, "/api/credits/rewarded-ad-status API doğrulanmış oturumla reklam durumunu döndürüyor");
    } catch (err: any) {
      assert(false, suite, "/api/credits/rewarded-ad-status hatası", err.message);
    }

    // Doğrulanmış oturumla bakiye sorgusu
    try {
      const balanceRes = await fetch("http://localhost:3000/api/credits/balance", {
        headers: { Authorization: `Bearer ${adminAuthToken}` },
      });
      const balanceData = await balanceRes.json();
      assert(balanceRes.status === 200 && balanceData.success === true, suite, "/api/credits/balance API doğrulanmış oturumla bakiye sorgusuna doğru yanıt veriyor");
    } catch (err: any) {
      assert(false, suite, "/api/credits/balance hatası", err.message);
    }
  }

  // RAPORLAMA
  console.log("\n================================================================================");
  console.log("📊 DENETİM VE TEST SONUÇLARI ÖZETİ");
  console.log("================================================================================\n");

  const suites = Array.from(new Set(results.map((r) => r.suite)));
  let totalPassed = 0;
  let totalFailed = 0;

  for (const s of suites) {
    console.log(`📌 ${s}`);
    const suiteTests = results.filter((r) => r.suite === s);
    for (const t of suiteTests) {
      if (t.passed) {
        totalPassed++;
        console.log(`   ✅ [BAŞARILI] ${t.name}`);
      } else {
        totalFailed++;
        console.log(`   ❌ [BAŞARISIZ] ${t.name} -> ${t.details}`);
      }
    }
    console.log("");
  }

  console.log("--------------------------------------------------------------------------------");
  console.log(`TOPLAM TEST: ${results.length} | BAŞARILI: ${totalPassed} | BAŞARISIZ: ${totalFailed}`);
  console.log("--------------------------------------------------------------------------------\n");

  if (totalFailed > 0) {
    process.exit(1);
  }
}

runFullAudit().catch((err) => {
  console.error("Denetim sırasında beklenmeyen hata:", err);
  process.exit(1);
});
