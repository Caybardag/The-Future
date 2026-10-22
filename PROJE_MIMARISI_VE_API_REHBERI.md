# 🚀 TEKNOLOJİK EVRİM RADARI (2026—2060)
## Kapsamlı Sistem Mimarisi, API Entegrasyonları, Otonom Motorlar ve Geliştirici Kılavuzu

Bu belge; projenin uçtan uca mimarisini, Firebase entegrasyonunu, AI sağlayıcılarının (Google Gemini, xAI Grok, OpenAI GPT-4o, Anthropic Claude, Yerel Ollama) nasıl bağlandığını, otonom bilimsel denetim motorunun (`ScientificVerificationEngine`) çalışma prensiplerini ve projeyi ZIP olarak indirip kendi ortamınızda sıfırdan nasıl ayağa kaldıracağınızı tüm detaylarıyla açıklamaktadır.

---

## 📑 İÇİNDEKİLER

1. [Genel Sistem Mimarisi ve Veri Akış Şeması](#1-genel-sistem-mimarisi-ve-veri-akış-şeması)
2. [Gerekli Olan Tüm API'ler ve Servisler](#2-gerekli-olan-tüm-apiler-ve-servisler)
3. [ZIP Olarak İndirip Kendi Ortamınızda Çalıştırma (Local Setup)](#3-zip-olarak-indirip-kendi-ortamınızda-çalıştırma-local-setup)
4. [Yapay Zeka Sağlayıcıları Entegrasyonu (xAI Grok / OpenAI / Claude / Ollama / Gemini)](#4-yapay-zeka-sağlayıcıları-entegrasyonu-xai-grok--openai--claude--ollama--gemini)
5. [Firebase & Firestore Entegrasyonu (Kullanıcı, Kredi, Kanıt Belleği)](#5-firebase--firestore-entegrasyonu-kullanıcı-kredi-kanıt-belleği)
6. [Otonom Bilimsel Denetim Motoru (`ScientificVerificationEngine`) Nasıl Çalışır?](#6-otonom-bilimsel-denetim-motoru-scientificverificationengine-nasıl-çalışır)
7. [Backend Uç Noktaları (API Endpoints) ve Görev Haritası](#7-backend-uç-noktaları-api-endpoints-ve-görev-haritası)
8. [5-Katmanlı Güvenlik, Önbellek ve Bütçe Koruma Mimarisi](#8-5-katmanlı-güvenlik-önbellek-ve-bütçe-koruma-mimarisi)
9. [Çevrimdışı / Sıfır API Durumunda Çalışma (Offline High-Fidelity Engine)](#9-çevrimdışı--sıfır-api-durumunda-çalışma-offline-high-fidelity-engine)
10. [Sorun Giderme ve Sıkça Sorulan Sorular](#10-sorun-giderme-ve-sıkça-sorulan-sorular)

---

## 1. GENEL SİSTEM MİMARİSİ VE VERİ AKIŞ ŞEMASI

Proje modern **Full-Stack SPA (Single Page Application)** mimarisinde geliştirilmiştir:

```
┌─────────────────────────────────────────────────────────────────────────────────────────┐
│                                FRONTEND (REACT 19 + VITE + TAILWIND)                    │
│  - 2026-2060 İnteraktif Zaman Çizelgesi, Simülasyonlar, 2060 Persona Rol Sohbeti       │
│  - Akademik Kaynak Görüntüleyici, İş Riski Radarı, Çoklu Evren Simülatörü              │
│  - Otomatik Kredi İade Kalkanı (Auto-Healing), Sesli Efektler, Dinamik Grafikler       │
└───────────────────────────────────────────┬─────────────────────────────────────────────┘
                                            │ HTTP REST (/api/*) + Firebase SDK
┌───────────────────────────────────────────▼─────────────────────────────────────────────┐
│                       BACKEND (NODE.JS + EXPRESS + TYPESCRIPT)                          │
│  - server.ts: Merkezi API Ağ Geçidi, Güvenlik Duvarı, Rate Limiter                     │
│  - 5 Katmanlı Kalkan: 24 Saatlik Önbellek, Atomik İstek Kilidi, Bütçe Sigortası        │
│  - AI Orchestrator: Gemini 3.7 Flash / xAI Grok-2 / OpenAI GPT-4o Köprüsü               │
│  - Academic Engine: OpenAlex & arXiv Gerçek Zamanlı ve Kalıcı Bellek İndeksi            │
│  - Offline Fallback Engine: Sıfır API anında %100 deterministik bilimsel simülasyon    │
└───────────────────────┬───────────────────────────────────┬─────────────────────────────┘
                        │                                   │
         ┌──────────────▼──────────────┐     ┌──────────────▼───────────────────┐
         │      DIŞ YAPAY ZEKA API     │     │      DIŞ AKADEMİK & BİLİMSEL API │
         │  - Google Gemini API        │     │  - OpenAlex API (250M+ Makale)   │
         │  - (Veya xAI Grok / OpenAI) │     │  - arXiv Open Science API        │
         │  - Firebase Firestore (DB)  │     │  - Google Patents / Crossref     │
         └─────────────────────────────┘     └──────────────────────────────────┘
```

---

## 2. GEREKLİ OLAN TÜM API'LER VE SERVİSLER

Projede kullanılan veya bağlanabilen tüm harici servisler:

| Servis Adı | Zorunlu mu? | Görevi ve Kullanıldığı Yer | Nereden Alınır? |
| :--- | :--- | :--- | :--- |
| **Google Gemini API** *(veya xAI Grok / OpenAI)* | **Önerilen** *(API olmasa da yerel offline motor çalışır)* | Gelecek simülasyonları, 2060 persona sohbeti, akademik makale analizi, iş riski hesaplama | [Google AI Studio](https://aistudio.google.com/) veya [xAI Console](https://console.x.ai/) |
| **OpenAlex API** | **Opsiyonel** | 250 Milyon+ akademik makale ve hakemli yayını arama, özetleme ve ilişkilendirme | [OpenAlex.org](https://openalex.org/) *(Ücretsizdir, e-posta vermek yeterlidir)* |
| **arXiv API** | **Ücretsiz / Açık** | Bilimsel ön-basım (preprint) makale indekslerini sorgulama (`https://arxiv.org/search/`) | Anahtar gerekmez *(Açık bilim protokolü)* |
| **Firebase Firestore & Auth** | **Dahili / Opsiyonel** | Kullanıcı profilleri, kredi bakiyesi, kanıt oylamaları ve simülasyon geçmişini bulutta tutma | [Firebase Console](https://console.firebase.google.com/) *(Varsayılan olarak localStorage yedeği mevcuttur)* |

---

## 3. ZIP OLARAK İNDİRİP KENDİ ORTAMINIZDA ÇALIŞTIRMA (LOCAL SETUP)

Projeyi ZIP ile indirip kendi bilgisayarınızda (VS Code, WebStorm, Cursor vb.) çalıştırmak için:

### Adım 1: Node.js Kontrolü
Bilgisayarınızda **Node.js (v18 veya v20+)** ve **npm** kurulu olduğundan emin olun (`node -v`).

### Adım 2: Bağımlılıkları Yükleyin
Proje ana dizininde terminali açıp çalıştırın:
```bash
npm install
```

### Adım 3: Çevre Değişkenlerini Oluşturun (`.env`)
Proje ana dizininde bir `.env` dosyası oluşturun:
```env
# 1. Yapay Zeka Anahtarınız (Gemini veya Grok veya OpenAI)
GEMINI_API_KEY="AIzaSy..."
# VEYA Grok: GROK_API_KEY="xai-..."
# VEYA OpenAI: OPENAI_API_KEY="sk-..."

# 2. OpenAlex Akademik Arama İçin E-Postanız (Kotasız ve hızlı erişim sağlar)
OPENALEX_MAILTO="ornek@eposta.com"

# 3. Sunucu Portu
PORT=3000
APP_URL="http://localhost:3000"
```

### Adım 4: Geliştirme Sunucusunu Başlatın
```bash
npm run dev
```
Tarayıcınızda `http://localhost:3000` adresini açarak uygulamayı kullanmaya başlayabilirsiniz.

---

## 4. YAPAY ZEKA SAĞLAYICILARI ENTEGRASYONU (xAI GROK / OPENAI / CLAUDE / OLLAMA / GEMINI)

> **Kullanıcı Sorusu:** *"Her işlemi mesela Grok API girsem bile tüm görevleri yapabilecek mi? Nereye hangi API girilecek?"*

**CEVAP: EVET!** Projedeki tüm yapay zeka görevleri (Simülasyon, Persona Chat, İş Riski, Kanıt Analizi) standart JSON ve metin formatında çalışır. İster **xAI Grok-2**, ister **OpenAI GPT-4o**, ister **Claude 3.5 Sonnet**, ister yerel çalışan **Ollama** bağlayın, sistemdeki **TÜM** görevler eksiksiz çalışır.

### Grok / OpenAI Evrensel Adaptör Kurulumu

#### 1. `.env` Dosyanızı Düzenleyin:
```env
# xAI Grok Kullanacaksanız:
GROK_API_KEY="xai-xxxxxxxxxxxxxxxxxxxx"
AI_PROVIDER="grok"

# VEYA OpenAI Kullanacaksanız:
OPENAI_API_KEY="sk-proj-xxxxxxxxxxxxxxxx"
AI_PROVIDER="openai"
```

#### 2. OpenAI SDK Paketini Kurun:
```bash
npm install openai
```

#### 3. `server.ts` İçinde Evrensel AI Köprüsü:
`server.ts` dosyasına şu adaptörü ekleyerek tüm endpoint'leri tek elden Grok veya OpenAI'a yönlendirebilirsiniz:

```typescript
import OpenAI from "openai";

const openaiClient = new OpenAI({
  apiKey: process.env.GROK_API_KEY || process.env.OPENAI_API_KEY,
  baseURL: process.env.AI_PROVIDER === "grok" ? "https://api.x.ai/v1" : undefined,
});

export async function universalAICall(prompt: string, systemInstruction?: string): Promise<string> {
  // 1. Durum: xAI Grok veya OpenAI seçilmişse
  if (process.env.GROK_API_KEY || process.env.OPENAI_API_KEY) {
    const modelName = process.env.AI_PROVIDER === "grok" ? "grok-2-latest" : "gpt-4o-mini";
    const response = await openaiClient.chat.completions.create({
      model: modelName,
      messages: [
        { role: "system", content: systemInstruction || "Sen 2026-2060 teknoloji ve bilim analistisin." },
        { role: "user", content: prompt },
      ],
      temperature: 0.7,
    });
    return response.choices[0]?.message?.content || "";
  }

  // 2. Durum: Google Gemini seçilmişse
  const ai = getAI();
  if (ai) {
    const response = await ai.models.generateContent({
      model: "gemini-3.7-flash",
      contents: prompt,
      config: { systemInstruction },
    });
    return response.text || "";
  }

  throw new Error("Aktif bir AI API anahtarı bulunamadı.");
}
```

---

## 5. FIREBASE & FIRESTORE ENTEGRASYONU (KULLANICI, KREDİ, KANIT BELLEĞİ)

Proje hem Firebase Firestore bulut veritabanı hem de yerel `localStorage` hibrit mimarisiyle çalışır.

### Firebase Yapılandırması (`src/lib/firebase.ts`):
Uygulama `firebase-applet-config.json` dosyasındaki ayarları okuyarak Firestore ve Auth servislerini ayağa kaldırır:

```typescript
// src/lib/firebase.ts
import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import firebaseConfigJson from "../../firebase-applet-config.json";

const firebaseConfig = {
  apiKey: firebaseConfigJson.apiKey,
  authDomain: firebaseConfigJson.authDomain,
  projectId: firebaseConfigJson.projectId,
  storageBucket: firebaseConfigJson.storageBucket,
  messagingSenderId: firebaseConfigJson.messagingSenderId,
  appId: firebaseConfigJson.appId,
};

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
export const auth = getAuth(app);
export const db = getFirestore(app, firebaseConfigJson.firestoreDatabaseId || "(default)");
```

### Firestore Koleksiyon Yapısı:
1. **`users` Koleksiyonu:**
   * Kullanıcı ID, ad-soyad, e-posta, rol (`admin` / `user`), mevcut kredi bakiyesi (`credits`), onay durumu.
2. **`proofs` Koleksiyonu:**
   * Kullanıcılar veya araştırmacılar tarafından eklenen kaynak URL'leri, DOI numaraları, kullanıcı özetleri, AI denetim skorları ve topluluk oyları.
3. **`simulations` Koleksiyonu:**
   * Üretilen 2026-2060 gelecek raporları ve kullanıcı özel notları.

### Çevrimdışı / Local Fallback:
Firebase bağlantısı olmadığında veya kullanıcı giriş yapmadığında, tüm bakiye ve oylama verileri `localStorage` üzerinde güvenli şekilde saklanır; kullanıcı veri kaybı yaşamaz.

---

## 6. OTONOM BİLİMSEL DENETİM MOTORU (`ScientificVerificationEngine`) NASIL ÇALIŞIR?

Projede yer alan `src/services/ScientificVerificationEngine.ts`, yapay zeka halüsinasyonlarını ve imkansız bilimkurgu iddialarını engellemek için geliştirilmiş **deterministik bir fizik ve teknoloji filtresidir**.

### Çalışma Aşamaları:

```
[Kullanıcı veya AI Tahmin Girdisi]
             │
             ▼
┌────────────────────────────────────────────────────────┐
│ 1. Termodinamik & Enerji Filtresi                      │
│    - "Sonsuz enerji", "kayıpsız aktarım", "sınırsız"   │
│    -> Termodinamik 2. Yasası ve Carnot Verimi Uyarısı  │
└────────────────────────────┬───────────────────────────┘
                             │
                             ▼
┌────────────────────────────────────────────────────────┐
│ 2. Kuantum & Işık Hızı Filtresi                        │
│    - "Işık hızından hızlı", "anlık kuantum iletişimi" │
│    -> No-Communication Teoremi ve c Sınırı Uygulanır   │
└────────────────────────────┬───────────────────────────┘
                             │
                             ▼
┌────────────────────────────────────────────────────────┐
│ 3. Hesaplama & Isı Sınırları                           │
│    - Landauer Sınırı (kT ln 2) hesaplaması             │
│    - Kuantum Hata Düzeltme (Surface Code) çarpanı      │
└────────────────────────────┬───────────────────────────┘
                             │
                             ▼
┌────────────────────────────────────────────────────────┐
│ 4. TRL (Technology Readiness Level) & Zaman Eğrisi     │
│    - 2026'ya olan zamansal uzaklığa göre dinamik       │
│      varyans ve varyasyon aralığı hesaplanır           │
└────────────────────────────┬───────────────────────────┘
                             │
                             ▼
[Düzeltilmiş, Fiziksel Olarak Tutarlı ve Şeffaf Literatür Raporu]
```

Bu motor sayesinde sistem, abartılı veya imkansız spekülasyonları otomatik olarak tespit eder, metni fiziksel kurallarla uyumlu hale getirir ve kullanıcıya nedenini açıklar.

---

## 7. BACKEND UÇ NOKTALARI (API ENDPOINTS) VE GÖREV HARİTASI

`server.ts` dosyasında tanımlı temel API rotaları:

| Endpoint | HTTP Metodu | Görevi |
| :--- | :--- | :--- |
| `/api/gemini/simulate-milestone` | `POST` | Seçilen yıl ve teknoloji için kapsamlı teknik, sosyoekonomik ve etik gelecek simülasyonu üretir. |
| `/api/gemini/persona-chat` | `POST` | 2030, 2045 veya 2060 yılındaki sentetik insan/yapay zeka karakterleriyle canlı rol yapma (roleplay) sohbeti sağlar. |
| `/api/gemini/multiverse-simulate` | `POST` | Ütopik, Distopik, Tekno-Feodal veya Sibernetik senaryo modlarına göre alternatif tarih akışlarını hesaplar. |
| `/api/gemini/job-risk` | `POST` | Girilen mesleğin otomasyon riskini, dönüşüm hızını ve korunma stratejilerini analiz eder. |
| `/api/academic/search` | `GET` | OpenAlex ve arXiv üzerinde 250M+ akademik makale içinde canlı bilimsel tarama yapar. |
| `/api/academic/lookup` | `GET` | Bir kilometre taşının konusuyla ilgili hakemli dergi makalelerini ve DOI linklerini getirir. |
| `/api/verification/evaluate` | `POST` | Kullanıcının sunduğu kanıt/makale linkini inceleyerek literatürle uyum skorunu (%0-100) çıkarır. |

---

## 8. 5-KATMANLI GÜVENLİK, ÖNBELLEK VE BÜTÇE KORUMA MİMARİSİ

Proje sunucusu (`server.ts`), API maliyetlerinizi korumak ve sunucunun çökmesini engellemek için 5 aşamalı akıllı bir zırhla korunur:

1. **Katman 1: Kayan Pencere Rate Limiting (DDoS & Spam Koruması):**
   * Kullanıcıların ve botların saniyede onlarca istek atmasını engeller (Cooldown: 1.5s - 2.5s).
2. **Katman 2: 24 Saatlik Akıllı Global Önbellek (Global Cache):**
   * Aynı simülasyon veya makale araması daha önce yapılmışsa, dış API'ye **0 istek** atılır ve **0ms gecikmeyle** önbellekten sunulur.
3. **Katman 3: Atomik İstek Birleştirici (Atomic Request Coalescing):**
   * Aynı anda 10 farklı kullanıcı aynı simülasyonu başlatırsa, dış API'ye yalnızca 1 istek gönderilir ve sonuç 10 kullanıcıya birden dağıtılır (10 kat maliyet tasarrufu).
4. **Katman 4: Girdi Temizleme ve Prompt Enjeksiyon Koruması:**
   * Kullanıcı girdileri güvenlik süzgecinden geçirilir.
5. **Katman 5: Günlük Bütçe Sigortası (Circuit Breaker):**
   * Günlük belirlenen tavan çağrı limiti (örneğin 5.000 istek) aşıldığında sistem otomatik olarak yerel simülasyon motoruna geçer ve faturanızın kabarmasını engeller.

---

## 9. ÇEVRİMDİŞİ / SIFIR API DURUMUNDA ÇALIŞMA (OFFLINE ENGINE)

Proje, internet kesildiğinde, API anahtarı girilmediğinde veya dış servis çöktüğünde bile **kullanıcıya hata göstermemek** üzere tasarlanmıştır:

* `src/server/offlineFuturologyEngine.ts`: 2026-2060 yılları arasındaki fiziksel sınırlar, Landauer limiti, Moore yasası, kuantum hata düzeltme oranları ve TRL seviyelerini içeren **kural tabanlı deterministik bir bilim motorudur**.
* API anahtarı olmasa dahi gerçekçi, detaylı ve tutarlı gelecek projeksiyonları üretmeye devam eder.

---

## 10. SORUN GİDERME VE SIKÇA SORULAN SORULAR

#### S: arXiv linklerine tıkladığımda "Invalid article identifier" hatası alıyorum, neden?
**C:** arXiv arama linkleri `https://arxiv.org/search/?query=...` formatında olmalıdır. `/abs/` dizini sadece tekil makale ID'leri (Örn: `2308.08155`) içindir. Sistemdeki tüm linkler standart formata uyarlanmıştır.

#### S: Türkçe bir teknoloji arattığımda akademik aramalarda sonuç çıkar mı?
**C:** Evet. Sistemdeki dahili akademik çeviri kural motoru (`toEnglishAcademicKeywords`), Türkçe kavramları anında uluslararası literatür karşılıklarına (örneğin *"Katı Hal Pili"* $\rightarrow$ *"solid state lithium metal battery"*) çevirerek sorgular.

#### S: Kredi harcaması başarısız olursa kullanıcının kredisi yanar mı?
**C:** Hayır! Sistemde **Otomatik Kredi İade Kalkanı (Auto-Healing Credit)** bulunur. Herhangi bir ağ kopmasında veya API hatasında harcanan kredi anında kullanıcının bakiyesine iade edilir.
