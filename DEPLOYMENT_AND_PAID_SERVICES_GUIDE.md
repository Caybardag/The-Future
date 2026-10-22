# 🚀 Gelecek Teknolojik Evrim Portalı — Canlıya Geçiş (Production & Global Scale) Rehberi

Bu belge; projenizi Google AI Studio geliştirme ortamından çıkarıp, **özel alan adınızla (örneğin: `teknolojikevrimi.com`) tüm dünyaya açmak**, tüm yapay zeka, kimlik doğrulama, veritabanı, SMS ve ödeme sistemlerini **kesintisiz ve tam kapasite** çalıştırmak için açmanız gereken ücretli hizmetleri ve adım adım yapılması gerekenleri içerir.

---

## 📋 Hızlı Özet & Maliyet Tablosu (Aylık Tahmini)

| Hizmet | Sağlayıcı | Neden Gereklidir? | Tahmini Maliyet (Başlangıç) |
| :--- | :--- | :--- | :--- |
| **1. Özel Alan Adı (Domain)** | Namecheap, Google Domains / Squarespace, GoDaddy | `teknolojikevrimi.com` gibi profesyonel marka adı için | ~10$ - 15$ / Yıllık |
| **2. Firebase Blaze Plan (Kullandıkça Öde)** | Google Firebase / GCP | Firestore veritabanı, Authentication ve kotaları sınırsız kılmak için | Ücretsiz Kota İçi (Aşımda $0.05 - $5/ay) |
| **3. Google Gemini API (Paid Tier)** | Google AI Studio / Vertex AI | Yapay zeka simülasyonları için yüksek kota ve hız | 1 Milyon girdi token başına ~$0.075 |
| **4. Cloud Hosting (Global Sunucu)** | Google Cloud Run veya Vercel / Netlify | Web uygulamasını ve Express backend'ini 7/24 çalıştırmak için | İlk 2 Milyon İstek Ücretsiz (Sonrası ~$2 - $10/ay) |
| **5. SMS Doğrulama (Opsiyonel)** | Twilio veya Firebase Phone Auth | Kullanıcı kayıtlarında gerçek telefon SMS onayı için | ~0.03$ - 0.05$ / SMS başına |
| **6. Global CDN & SSL (Güvenlik)** | Cloudflare (Free Plan) | DDoS koruması, SSL sertifikası (HTTPS), 0ms önbellek | **0$ (Ücretsiz)** |

---

## 🛠️ Açılması Gereken Hizmetler ve Detaylı Yol Haritası

### 1. 🌐 Özel Alan Adı (Domain Name) ve DNS Yönetimi
Uygulamanızın şu anki `ais-pre-...run.app` geçici adresi yerine gerçek bir adrese sahip olması gerekir.
- **Ne Almalısınız:** `.com`, `.io`, `.ai` veya `.org` uzantılı bir alan adı.
- **Tavsiye Edilen Kayıt Kuruluşları:** Namecheap, Cloudflare Registrar, Porkbun veya Squarespace.
- **Cloudflare Entegrasyonu (Ücretsiz):** Alan adınızı Cloudflare'a yönlendirerek ücretsiz SSL sertifikası (yeşil kilit / HTTPS), küresel CDN önbellekleme ve DDoS saldırı koruması sağlarsınız.

---

### 2. 🔥 Firebase Blaze Plan (Kullandıkça Öde / Pay-as-you-go)
Projenizin Firestore veritabanı ve Google ile Giriş yapma altyapısı Firebase üzerindedir.
- **Neden Yükseltilmeli?**
  - Ücretsiz Spark planında günlük 50.000 okuma ve 20.000 yazma sınırı vardır.
  - Blaze planına geçildiğinde faturanız sadece ücretsiz kotayı aştığınızda (kullanım başına kuruşlar düzeyinde) işler.
  - Harici API çağrıları ve Cloud Functions fonksiyonları için Blaze planı zorunludur.
- **Nasıl Açılır?**
  1. `console.firebase.google.com` adresine gidin.
  2. Sol alttaki **Upgrade (Yükselt)** butonuna tıklayıp **Blaze Plan**'ı seçin.
  3. Kredi kartınızı / Faturalandırma hesabınızı bağlayın.
  4. *Güvenlik Önlemi:* Aylık 10$ veya 25$ gibi bir bütçe uyarı limiti koyarak kontrolü elinizde tutabilirsiniz.

---

### 3. 🧠 Google Gemini API Ücretli Katman (Pay-as-you-go API Key)
Uygulamanızdaki *Meslek Risk Analizi, Kelebek Etkisi Simülatörü, Zaman Yolcusu Sohbeti* gibi zeka özellikleri doğrudan Gemini API'ye bağlıdır.
- **Neden Gereklidir?**
  - Ücretsiz API anahtarlarında dakikada en fazla 15 istek sınırı (Rate Limit) vardır; birden çok kullanıcı aynı anda siteye girdiğinde 429 hatası oluşabilir.
  - Ücretli katmana geçildiğinde dakikada yüzlerce eşzamanlı istek işlenebilir ve yanıt hızı belirgin şekilde artar.
- **Maliyet:** Gemini 3.7 Flash modeli son derece ekonomiktir (1.000 kullanıcı etkileşimi yaklaşık 0.10$ ile 0.35$ arasındadır).

---

### 4. ☁️ Uygulama Sunucusu & Dağıtım (Hosting / Cloud Run)
Uygulamanız hem React arayüzünü hem de `server.ts` Express backend'ini içermektedir.
- **Önerilen Canlıya Dağıtım Seçenekleri:**
  - **Seçenek A (En Kolay & Güçlü - Google Cloud Run):** Projeniz bir Docker konteyneri olarak Google Cloud Run'a yüklenir. Kullanıcı yokken 0 maliyetle bekler, kullanıcı geldikçe otomatik olarak saniyeler içinde ölçeklenir.
  - **Seçenek B (Vercel / Render / Railway):** Node.js sunucusunu tek tıkla GitHub reposundan otomatik güncelleyen modern PaaS platformları.

---

### 5. 💳 Kredi Kartı & Ödeme Altyapısı (Eğer Kullanıcılara VIP Paket Satacaksanız)
Uygulamanızda *"Quantum VIP"*, *"Pro Plan"* ve *"Kredi Satın Alma"* modülleri bulunmaktadır. Gerçek para kazanmak için:
- **Türkiye İçi:** **iyzico** veya **PayTR** sanal POS hesabı.
- **Global / Yurt Dışı:** **Stripe** veya **Paddle** hesabı.
- Bu hesaplar onaylandığında API anahtarlarını sunucunuza ekleyerek kredi kartıyla ödeme alıp kullanıcılara otomatik kredi yükleyebilirsiniz.

---

### 6. 📱 SMS Doğrulama Servisi (Twilio / Firebase Phone Auth)
Kullanıcıların telefon numaralarıyla SMS doğrulama kodu almasını istiyorsanız:
- Firebase Authentication Phone Auth veya **Twilio SMS API** hesabı açılarak bakiye yüklenmelidir.

---

## 🔒 Canlıya Geçiş Öncesi Güvenlik ve Uyumluluk Listesi
1. **KVKK / GDPR Aydınlatma Metni:** Kullanıcıların e-posta ve oturum verilerini işlediğiniz için sitenin altbilgisine Gizlilik Politikası ve Kullanım Koşulları sayfası.
2. **CORS ve Güvenlik Başlıkları:** Sadece kendi alan adınızdan gelen isteklere yanıt verecek şekilde API koruması (Helmet / Rate-limit).
3. **Admin Koruması:** `warfacelove46@gmail.com` dışındaki hiç kimsenin yetkisiz işlem yapamaması için kural sertleştirmesi.

---

## 🎯 Özet: İlk Olarak Nereden Başlamalısınız?
1. **Adım 1:** Namecheap veya benzeri bir yerden projenizin ismine uygun bir alan adı (Domain) satın alın.
2. **Adım 2:** Firebase Console üzerinden projenize bir Fatura Hesabı (Blaze Plan) bağlayın.
3. **Adım 3:** Kodları canlı bir sunucuya (Cloud Run veya Vercel) bağlayarak alan adınızla eşleştirelim.

Bu adımları tamamladığınızda projeniz dünya çapında milyonlarca kullanıcıya hizmet verebilecek profesyonel bir SaaS platformu haline gelecektir.
