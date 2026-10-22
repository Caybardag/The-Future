# 🚀 TEKNOLOJİK EVRİM UYGULAMASI: MİMARİ VE TEKNİK ŞARTNAME (SYSTEM ARCHITECTURE & SPECIFICATION)

> **Doküman Sürümü:** 2.4.0 (Production Pre-flight Final)  
> **Tarih:** 13 Ağustos 2026  
> **Geliştirici & Mimari Grubu:** AI Studio Engineering & Antigravity Futurology Engine  

---

## 📋 İÇİNDEKİLER
1. [Genel Mimari ve Sistem Yapısı](#1-genel-mimari-ve-sistem-yapisi)
2. [5-Katmanlı Güvenlik, Önbellek ve Bütçe Koruma Mimarisi](#2-5-katmanli-guvenlik-onbellek-ve-butce-koruma-mimarisi)
3. [Model Kullanım Haritası ve Token Maliyet Optimizasyonu](#3-model-kullanim-haritasi-ve-token-maliyet-optimizasyonu)
4. [Ana Onay Beyin Motoru ve Sabit Bilimsel Yasalar](#4-ana-onay-beyin-motoru-ve-sabit-bilimsel-yasalar)
5. [Tüm API Endpoint'leri ve Tetikleme Akış Şemaları](#5-tum-api-endpointleri-ve-tetikleme-akis-semalari)
6. [Kredi, Limit ve Ekonomik Model Tablosu](#6-kredi-limit-ve-ekonomik-model-tablosu)
7. [Veri Senkronizasyonu ve 15 Dakikalık Atomik Kilit](#7-veri-senkronizasyonu-ve-15-dakikalik-atomik-kilit)
8. [Çevrimdışı (Offline Fallback) B Planı Simülasyon Motorları](#8-cevrimdisi-offline-fallback-b-plani-simulasyon-motorlari)
9. [Production Pre-flight Kontrol Listesi](#9-production-pre-flight-kontrol-listesi)

---

## 1. GENEL MİMARİ VE SİSTEM YAPISI

Uygulama, **Full-Stack (Express + Vite + React + TypeScript)** mimarisinde tasarlanmış olup, tek bir Cloud Run container ortamında, güvenli **Port 3000 (0.0.0.0)** üzerinde çalışmaktadır.

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                       STEM İSTEMCİ KATMANI (React 18 + Vite)                │
│   [UI Components] ──► [AuthContext & Credit Store] ──► [safeFetchJson Proxy]│
└────────────────────────────────────┬────────────────────────────────────────┘
                                     │ HTTP POST / GET (JSON)
                                     ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                      SERVER KATMANI (Express 4.x / Node.js CJS)            │
│  ├── Katman 1: IP & User Rate Limiting (Kayan Pencere)                     │
│  ├── Katman 2: Akıllı Global Önbellek (24-Saatlik TTL - 0 Kredi Maliyet)    │
│  ├── Katman 3: Atomik İstek Birleştirici (Deduplication / Coalescing)       │
│  ├── Katman 4: Sıralı AI Görev Kuyruğu (FIFO Agent Queue - 250ms Spacing)  │
│  └── Katman 5: Günlük Bütçe Sigortası (Circuit Breaker Guard - Max 5000)    │
└────────────────────────────────────┬────────────────────────────────────────┘
                                     │ @google/genai SDK
                                     ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                    GOOGLE GEMINI AI & KULLANICI KATMANI                     │
│  [gemini-3.6-flash] ──► Ana Onay Beyin Motoru                               │
│  [gemini-3.5-flash] ──► Kelebek Etkisi / Google Search Grounding            │
│  [gemini-3.1-pro-preview] ──► Thinking HIGH (Derin Akıl Yürütme & Roadmap)  │
│  [gemini-3.1-flash-lite] ──► Yüksek Hacim / Düşük Token (Chat, Risk, Mod)    │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 🔨 Derleme ve Yayınlama (Build Pipeline)
- **Geliştirme (Dev):** `tsx server.ts` (TypeScript doğrudan yorumlanır)
- **Üretim Derlemesi (Build):** `vite build && esbuild server.ts --bundle --platform=node --format=cjs --packages=external --sourcemap --outfile=dist/server.cjs`
- **Başlatma (Start):** `node dist/server.cjs` (Tamamen paketlenmiş, ES Module göreceli yol çakışmalarından arındırılmış CommonJS sunucusu)

---

## 2. 5-KATMANLI GÜVENLİK, ÖNBELLEK VE BÜTÇE KORUMA MİMARİSİ

Sunucu tarafındaki tüm `/api/gemini/*` istekleri, kötüye kullanımı engellemek, API anahtarını gizlemek, kotayı korumak ve token maliyetlerini düşürmek için **5 aşamalı koruma süzgecinden** geçer:

### 🛡️ Katman 1: Gelişmiş IP + Kullanıcı ID Rate Limiting (Kayan Pencere)
- **Misafir (Guest) Engeli:** Kayıtsız veya yetkisiz istekler derhal `401 AUTH_REQUIRED` hatası alır.
- **Dinamik Cooldown Kontrolü:**
  - *Persona Chat:* Mesajlar arası **1.5 saniye** soğuma süresi (Dakikada maks 20 mesaj, Saatlik maks 120 mesaj).
  - *Ağır AI Analizleri:* İşlemler arası **3.0 saniye** soğuma süresi (Dakikada maks 6 analiz, Saatlik maks 60 analiz).
- **Hata Yanıtı:** `429 RATE_LIMIT_COOLDOWN` / `RATE_LIMIT_MINUTE` (Kaç saniye bekleneceği bilgisi ile döner).

### ⚡ Katman 2: Akıllı Global Önbellek Engine (24-Saatlik TTL)
- **Çalışma Mantığı:** Gelecek tahminleri ve teknolojik kilometre taşları aynı parametrelerle çağrıldığında, istek `generateCacheKey` fonksiyonu ile MD5 benzeri normalize edilmiş anahtara dönüştürülür.
- **TTL Süresi:** **24 Saat**. Önbellekten yanıt verilen isteklerde kullanıcının **0 Kredisi eksilir** (`creditCost: 0`, `cached: true`).
- **Bellek Limiti:** Maksimum 3,000 kayıt (LRU prensibi ile en eski kayıt otomatik silinir).

### 🔄 Katman 3: Atomik İstek Birleştirici (Atomic Request Coalescing / Deduplication)
- **Problem:** Aynı anda 50 kullanıcı "2030 AGI" analizi butonuna basarsa API kotası tükenebilir.
- **Çözüm:** Aynı parametreli aktif bir istek sunucuda zaten işleniyorsa (`inFlightRequestsMap`), yeni API çağrısı yapılmaz. İkinci kullanıcı **aynı cevabı paylaşır** (`coalesced: true`, 0 Ekstra Maliyet).

### ⏳ Katman 4: Sıralı AI Görev Kuyruğu (Server AI Task Queue Engine)
- **Problem:** Eşzamanlı atılan 100 istek Google Gemini tarafında `429 Too Many Requests` (Rate Limit) hatasına yol açar.
- **Çözüm:** Tüm AI istekleri sunucu tarafında **FIFO (First In, First Out)** kuyruğuna alınır.
- **Gecikme (Spacing):** Her görev arasında **250ms** boşluk bırakılır. Böylece Google API hız sınırları asla aşılmaz.

### 🛑 Katman 5: Günlük Bütçe Sigortası (Circuit Breaker Guard)
- **Tavan Sınır:** Günlük küresel API çağrı tavanı **5,000 İstek** olarak belirlenmiştir.
- **Devre Kesici:** Bu sınır aşıldığında sistem çökmek yerine otonom olarak **Çevrimdışı Simülasyon Motoruna (Offline Fallback Engine)** geçer ve hizmet vermeye devam eder.

---

## 3. MODEL KULLANIM HARİTASI VE TOKEN MALİYET OPTİMİZASYONU

Yapay zeka modelleri **işlevin karmaşıklığı, yanıt süresi beklentisi ve token maliyeti** göz önüne alınarak hassasiyetle seçilmiştir:

| Ekran / Özellik | Kullanılan Gemini Modeli | Seçim Sebebi & Token Stratejisi | Max Output Token | Sıcaklık (Temp) |
| :--- | :--- | :--- | :--- | :--- |
| **Ana Onay Beyin Motoru** (`/verify-timeline`) | `gemini-3.6-flash` | Bilimsel kuralları ve fizik kanunlarını yüksek doğrulukla denetlemek için en yeni, hızlı ve mantık yeteneği yüksek modeldir. | 800 | 0.2 |
| **Gelecek Senaryoları & Simülasyon** (`/simulate`) | `gemini-3.5-flash` | Yaratıcı gazete haberi, günlük ve senaryo yazımı için ideal hız/maliyet dengesi sunar. | 1000 | 0.7 |
| **Kelebek Etkisi Dominosu** (`/butterfly-effect`) | `gemini-3.5-flash` | 50 yıllık alternatif evren simülasyonlarında hızlı yapılandırılmış JSON çıktısı üretir. | 900 | 0.4 |
| **Otonom Ajan Taraması** (`/agent-scan`) | `gemini-3.5-flash` | **1 İstek = 1 Seçili Milestone:** 24 saatlik sunucu önbelleği ile hedef bazlı telemetri ve kişisel rapor üretir. | 850 | 0.3 |
| **Google Search Grounding** (`/search-grounding`) | `gemini-3.5-flash` + `googleSearch` | Canlı internet ve patent taraması için arama aracı entegre edilmiş Flash modeldir. | 800 | 0.3 |
| **Bilişsel Algoritma Denetimi** (`/audit`) | `gemini-3.1-pro-preview` | `ThinkingLevel.HIGH` aktifleştirilerek karmaşık fiziksel ve finansal varsayımlar derinlemesine akıl yürütülür. | 1200 | 0.3 |
| **Kişisel Gelecek Yol Haritası** (`/roadmap`) | `gemini-3.1-pro-preview` | `ThinkingLevel.HIGH` ile kullanıcının meslek ve yaş verisi 35 yıllık zaman dilimine derinlemesine haritalanır. | 1500 | 0.7 |
| **Meslek Otomasyon Riski** (`/job-risk`) | `gemini-3.1-flash-lite` | **Düşük Token Maliyeti:** Çok sık kullanılan bu özellikte `flash-lite` kullanılarak %70 token tasarrufu sağlanır. | 800 | 0.5 |
| **2060 AI Persona Sohbeti** (`/persona-chat`) | `gemini-3.1-flash-lite` | **Akıcı Sohbet & Ultra Düşük Maliyet:** Anlık mesajlaşmada yüksek hız ve minimal token tüketimi sağlar. | 500 | 0.8 |
| **Topluluk Gönderi Moderasyonu** (`/moderate-milestone`) | `gemini-3.1-flash-lite` | Arka planda çalışan topluluk spam ve bilimsel uygunluk denetimi için en ekonomik çözümdür. | 400 | 0.3 |

### 💡 Token Maliyeti Tasarruf Kuralları:
1. **Düşük Maliyetli İşler:** Meslek riski, sohbet ve moderasyon gibi anlık isteklerde **`gemini-3.1-flash-lite`** kullanılır.
2. **Derin Akıl Yürütme:** Yalnızca bilimsel denetim ve yol haritası gibi kritik raporlarda **`gemini-3.1-pro-preview` (Thinking HIGH)** devreye girer.
3. **JSON Sınırlandırması:** `responseMimeType: "application/json"` kullanılarak modelin gereksiz laf kalabalığı yapması ve token harcaması engellenir.

---

## 4. ANA ONAY BEYİN MOTORU VE SABİT BİLİMSEL YASALAR

Uygulamanın kalbinde, tüm teknolojik tahminleri fiziksel ve biyolojik süzgeçten geçiren **Otonom Bilimsel Denetim Motoru** yatar. Sistem aşağıdaki **9 Sabit Yasayı (Değişmez Ana Yasa)** temel alır:

1. **2028 Katı Hal Bataryaları:** Enerji yoğunluğu 2-3 kat artar, hızlı şarj gelir; ancak "sınırsız menzil/kapasite" iddiası termodinamik açıdan engellenir ve düzeltilir.
2. **2029 AGI & Turing Testi:** Turing testi LLM'ler ile aşılmıştır; AGI için ölçüt değildir. AGI çok modlu otonom nedensel akıl yürütmedir.
3. **2030 Giyilebilir Nöroteknoloji:** Kafatası dışı EEG/fNIRS sensörleri gürültülüdür; hassas metin yazımı için hibrit AI niyet tahminleyicileri şart koşulur.
4. **2034 Kuantum Güvenlik (Q-Day):** Milyonlarca hata düzeltmeli kübit 2034'e yetişmez; RSA kırılması yerine Post-Kuantum Kriptografi (PQC) standartlarına geçiş esas alınır.
5. **2040 Nanobotlar:** Kanser hücresi hedeflemesi mümkündür; ancak hücresel yaşlanmayı mekanik olarak sıfırlamak biyolojik ve epigenetik olarak reddedilir.
6. **2042 'Tasarım Bebekler':** Zeka ve kas poligeniktir (binlerce gen etkileşimi); sipariş usulü bebek tasarımı engellenir, sadece doğumsal hastalıkların engellenmesine izin verilir.
7. **2044 Nöral İletişim:** Beyinden beyine ham düşünce/duygu transferi nörobilimsel kodlama nedeniyle engellenir, sembolik yardımcılar şart koşulur.
8. **2045 Tekillik (Singularity):** Fiziksel çip üretimi, Landauer ısı sınırı ve küresel enerji şebekesi kısıtlarına tabidir; sonsuz ivmelenme fiziksel abartı olarak işaretlenir.
9. **2057 Kuantum Dolanıklık:** Dolanıklık ile ışık hızından hızlı iletişim imkansızdır (*No-Communication Theorem*). Gezegenler arası iletişim lazer röleleriyle ışık hızıyla sınırlı tutulur.

---

## 5. TÜM API ENDPOINT'LERİ VE TETİKLEME AKIŞ ŞEMALARI

| Endpoint | Yöntem | Tetiklenen Katmanlar | Başarısızlık / Offline Durumunda B Planı |
| :--- | :--- | :--- | :--- |
| `/api/sync/status` | GET | Statik Bilgi Verici | Yerel zaman damgası ve kilit süresini döndürür. |
| `/api/sync/trigger` | POST | 15 Dakikalık Atomik Kilit | Kilit aktifse işlem yapmaz, değilse yeni zaman damgası üretir. |
| `/api/gemini/verify-timeline` | POST | Rate Limit, Cache, Queue, **Main Brain** | `runOfflineBrainVerification()` kural motoru devreye girer. |
| `/api/gemini/simulate` | POST | Rate Limit, Queue, Budget Guard | Statik gelecek senaryosu ve gazete taslağı üretir. |
| `/api/gemini/audit` | POST | Rate Limit, Queue, Thinking HIGH | Local Statik Audit raporu oluşturur. |
| `/api/gemini/verify-evidence` | POST | Rate Limit, Domain Tier Inspector, Grounding | Domain kural motoru (Tier 1-4) ve offline regex spam denetimi çalışır. |
| `/api/gemini/butterfly-effect`| POST | Rate Limit, Queue, Budget Guard | Statik 50 yıllık alternatif Singularity gecikme raporu üretir. |
| `/api/gemini/agent-scan`     | POST | Rate Limit, 24h Cache, Queue, Flash | 1 Seçili Milestone için otonom telemetri ve kişisel rapor üretir. |
| `/api/gemini/search-grounding`| POST | Rate Limit, Google Search Tool | Arşivlenmiş patent ve makale özet verisini sunar. |
| `/api/gemini/job-risk` | POST | Rate Limit, Prompt Sanitizer, Flash-Lite | Statik meslek otomasyon matrisi kuralı (yazılım %82, tıp %48 vb.) hesaplar. |
| `/api/gemini/persona-chat` | POST | Rate Limit (1.5s Cooldown), Flash-Lite | Varsayılan zaman yolcusu simülasyon yanıtı döndürür. |
| `/api/gemini/roadmap` | POST | Rate Limit, Queue, Thinking HIGH | Statik 35 yıllık kariyer ve yaşam evreleri şablonu sunar. |
| `/api/gemini/moderate-milestone`| POST | Rate Limit, Flash-Lite | Otomatik kural tabanlı onay ve %78 olasılık skoru atar. |
| `/api/gemini/queue-status` | GET | Admin Key / Email Kontrolü | Kuyruk metriklerini döndürür (Yalnızca Admin). |
| `/api/gemini/security-status` | GET | Admin Key / Email Kontrolü | 5 Katmanlı güvenlik durumu ve bellek metriklerini gösterir. |

---

## 6. KREDİ, LİMİT VE EKONOMİK MODEL TABLOSU

Uygulamadaki kredi harcamaları ve abonelik katmanlarına (`Free`, `Pro Research`, `Quantum VIP`) göre indirim oranları şu şekildedir:

```
                  ┌───────────────────────────────────────────┐
                  │          KULLANICI ABONELİK KATMANI        │
                  └─────┬───────────────────┬───────────┬─────┘
                        │                   │           │
            ┌───────────▼───┐       ┌───────▼───┐   ┌───▼─────────────┐
            │ Standart Free │       │ Pro Res.  │   │ Quantum VIP     │
            │ (Taban Maliyet)│       │ (%50 İnd.)│   │ (%75-%80 İnd.)  │
            └───────────────┘       └───────────┘   └─────────────────┘
```

| Özellik | Standart Ücretsiz | Pro Ücretsiz / Ay | Quantum VIP Ücretsiz / Ay | Aşım Sonrası Kredi Maliyeti (Standart / Pro / VIP) |
| :--- | :---: | :---: | :---: | :---: |
| **Meslek Otomasyon Riski** | 0 | 2 / ay | 5 / ay | 15 / 8 / 4 Kredi |
| **Kelebek Etkisi Dominosu** | 0 | 1 / ay | 2 / ay | 25 / 13 / 7 Kredi |
| **2060 AI Persona Sohbeti** | 5 mesaj | 10 mesaj / ay | 30 mesaj / ay | 6 / 3 / 2 Kredi |
| **Derin Gelecek Simülasyonu** | 0 | 1 / ay | 2 / ay | 30 / 15 / 8 Kredi |
| **Otonom AI Ajan Taraması** | 0 | 2 / ay | 5 / ay | 20 / 10 / 5 Kredi |
| **Kaynak / Bilimsel Denetim**| 0 | 2 / ay | 5 / ay | 12 / 6 / 3 Kredi |
| **Kişisel Gelecek Yol Haritası**| 0 | 1 / ay | 2 / ay | 40 / 20 / 10 Kredi |
| **Topluluk Gönderimi** | 1 | 3 / ay | 5 / ay | 5 / 3 / 1 Kredi |
| **Tahmin Oylaması** | Sınırsız | Sınırsız | Sınırsız | — (Ücretsiz) |

---

## 7. VERİ SENKRONİZASYONU VE 15 DAKİKALIK ATOMİK KİLİT

Geleceğe dönük matematiksel katsayıların ve patent verilerinin senkronizasyonunda veri kirliliğini ve kullanıcı çakışmasını engellemek için **15 Dakikalık Atomik Kilit (Global Cooldown Lock)** uygulanmıştır.

```
[İstek: POST /api/sync/trigger]
       │
       ▼
[Geçen Süre < 15 Dakika mı?] ──► EVET ──► 🔒 [Atomik Kilit Aktif] ──► 0 Kredi / İşlem Engellendi
       │
       NO (Süre > 15 Dk)
       ▼
[Yeni Zaman Damgası Atandı & Log Kaydedildi] ──► 🔓 [Senkronizasyon Başarılı]
```

---

## 8. ÇEVRİMDIŞI (OFFLINE FALLBACK) B PLANI SİMÜLASYON MOTORLARI

Google API servislerinde kesinti, anahtar geçersizliği veya tavan kota dolumu yaşandığında sistem **asla çökmez**. Arka plandaki `disableAIIfAuthError` mekanizması devreye girerek uygulamayı **Çevrimdışı Simülasyon Moduna** geçirir:

1. **Otomatik Algılama:** HTTP 401, `UNAUTHENTICATED`, `API_KEY_INVALID` veya `RESOURCE_EXHAUSTED` hataları alındığında `aiDisabled = true` yapılır.
2. **Sessiz Geçiş:** Kullanıcıya çirkin teknik hatalar gösterilmek yerine, yerel kural motorları (`runOfflineBrainVerification`, `runOfflineEvidenceCheck`) devreye girer.
3. **Tutarlı Çıktı:** Yerel simülasyon motorları önceden programlanmış fiziksel kuralları (Katı hal pili, Q-Day, Dolanıklık) harfiyen uygulayarak mantıklı ve bilimsel sonuçlar üretmeye devam eder.

---

## 9. PRODUCTION PRE-FLIGHT KONTROL LİSTESİ

Google Cloud Console ve Firebase servisleri canlıya alınmadan önce doğrulanması gereken kritik noktalar:

- [x] **Lint & Type Safety:** `npm run lint` komutu 0 hata ile tamamlandı.
- [x] **Bundle Derlemesi:** `npm run build` komutu `dist/server.cjs` bundling işlemini hatasız gerçekleştirdi.
- [x] **API Key Gizliliği:** Gemini ve diğer üçüncü taraf anahtarlar istemci kodunda değil, yalnızca `server.ts` içinde saklanmaktadır.
- [x] **Eşzamanlı Oturum İzolasyonu:** Tüm kullanıcı durumları (state) tarayıcı hafızasında izoledir; kullanıcı verileri çakışmaz.
- [x] **Rate Limit & Bütçe Koruması:** 5 katmanlı güvenlik süzgeci ve devre kesici aktif durumdadır.
- [x] **Çevrimdışı B Planı:** API anahtarı olmasa dahi uygulamanın simülasyon motoruyla kesintisiz çalıştığı test edilmiştir.

---
*Doküman sonu. Sistem canlıya alım için tam uyumlu ve hazır durumdadır.*
