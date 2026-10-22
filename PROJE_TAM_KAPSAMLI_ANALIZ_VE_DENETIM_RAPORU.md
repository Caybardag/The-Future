# 🛰️ 2030-2060 GELECEK ZAMAN ÇİZELGESİ & KAHİNLERİ
## TAM KAPSAMLI SİSTEM, MOD, MANIK VE ANORMALLİK DENETİM RAPORU

**Rapor Tarihi:** 10 Ağustos 2026  
**Hedef Kitle:** Ürün Mimarları, Yazılım Geliştiriciler ve Kullanıcı Deneyimi (UX) Ekipleri  
**Sürüm:** v2.4 (Kapsamlı İç Denetim & İş Mantığı İncelemesi)

---

## 📋 1. YÖNETİCİ ÖZETİ VE PROJENİN ANA AMACI

Proje, **2030–2060 yılları arasındaki insanlık, teknoloji, yapay zeka, uzay ve sosyo-ekonomik kırılmaları** simüle eden, tahminleyen ve topluluk konsensüsü ile doğrulayan **kapsamlı bir Gelecek Simülasyon & Doğrulama Platformudur**.

### Platformun Temel Sütunları:
1. **Gelecek Keşfi ve Zaman Çizelgesi:** Bilimsel verilere dayalı gelecek senaryolarının kronolojik takibi.
2. **Kelebek Etkisi & Nedensellik Analizi:** Bir teknolojik kırılmanın toplumsal ve ekonomik ikincil/üçüncül etkilerinin simülasyonu.
3. **Çifte Onay & Peer-Review (AI Hakemliği + %75 Topluluk Konsensüsü):** Ana bilgiye ve zaman çizelgesine etki eden tüm tahmin ve kanıtların hem **Otonom AI Bilimsel Hakemliği** (Fizik/TRL/Patent Sınırı) hem de **%75 Topluluk Konsensüsü** süzgecinden geçerek "Doğrulanmış Veri" statüsü kazanması.
4. **Otonom Ajan Network Telemetrisi:** Arka planda çalışan Sentinel (Aykırılık), Ethics (Ahlak/Risk) ve Evolution (Homo Sapiens 2.0 dönüşüm) yapay zeka ajanlarının simülasyon tutarlılığını denetlemesi.
5. **Oyunlaştırılmış Kredi ve Hediye Ekonomisi (Daily Spin Wheel & VIP Tiers):** Kullanıcı etkileşimini ve katkı motivasyonunu artıran günlük hediye kredi çarkı ve koleksiyon kartları.

---

## 🔍 2. TÜM MODLARIN VE ÇALIŞMA MANTIKLARININ İNCELEMESİ

| Mod / Modül | İşlevi & Çalışma Mantığı | Onay & Güvenlik Mekanizması | Durum |
| :--- | :--- | :--- | :--- |
| **Gelecek Zaman Çizelgesi (Timeline View)** | 2030-2060 arası dönüm noktalarını yıl, kategori ve olasılık puanına göre listeler. | Kullanıcılar kanıt sunabilir ve oy kullanabilir. | 🟢 Stabil |
| **Bilimsel Doğrulama Motoru (Verification System)** | Kullanıcıların sunduğu makale, patent veya akademik kanıtları inceler. | **Çifte Onay (AI Hakemliği + %75 Konsensüs):** Otonom AI Kanıt Denetimi (arXiv/Patent) + %75 Topluluk Onayı ile "Doğrulanmış Bilimsel Veri" statüsü kazanır. | 🟢 Aktif (Çifte Onaylı) |
| **Topluluk Tahminleri (Community Submissions)** | Kullanıcıların yeni gelecek senaryoları önermesini sağlar. | **AI Moderasyon & Topluluk Oylaması:** Gemini AI otomatik içerik/mantık filtresinden geçer, ardından topluluk oylamasına sunulur. | 🟢 Aktif (AI Moderasyonlu) |
| **Günlük Gelecek & Kredi Çarkı (Spin Wheel)** | Kullanıcılara günde 1 kez rastgele 1-50 kredi ve dijital koleksiyon kartı verir. | **Gece Yarısı (00:00) Reset:** Kullanıldıktan sonra menü otomatik daralır, gece 00:00'da açılır. | 🟢 Optimize Edildi |
| **Otonom Ajan Network & Telemetri** | 3 AI ajanın simülasyon sapmalarını taranmasını ve telemetri sunmasını sağlar. | Kredi maliyeti karşılığı (Agent Scan) derin tarama çalıştırır. | 🟢 Daraltılabilir Yapıldı |
| **Meslek Risk Analizi (Job Risk Analyzer)** | 2030-2060 meslek otomasyon risk oranlarını ve yetkinlik dönüşümünü hesaplar. | Algoritmik Bayesyen olasılık hesaplaması. | 🟢 Stabil |
| **Nedensellik & Kelebek Etkisi (Butterfly Effect)** | Bir olayın tetiklediği zincirleme reaksiyonları görsel simülatörle sunar. | Senaryo dallanma matrisi. | 🟢 Stabil |
| **Kişisel Yol Haritası (Personal Roadmap)** | Kullanıcının yaşına ve mesleğine göre 10 yıllık gelecek adaptasyon planı çizer. | Kullanıcı profili verilerini işler. | 🟢 Stabil |
| **Gelecek Kahinleri Sıralaması (Leaderboard)** | En doğru tahminlerde bulunan ve doğrulama yapan kullanıcıları listeler. | Doğruluk ve XP puan matrisi. | 🟢 Stabil |
| **Zaman Seyyahı Persona Chat** | 2050 yılından bir insan simülasyonu ile sohbet imkanı tanır. | Kredi düşümü & Prompt limitleme. | 🟢 Stabil |

---

## 🚨 3. ANORMALLİK VE İŞ MANTIĞI AYKIRILIK UYARILARI (DETAYLI ANALİZ)

Yaptığımız derin kod ve mantık denetiminde tespit edilen potansiyel **anormallikler ve aykırılık uyarıları** aşağıdadır:

### ⚠️ Aykırılık 1: Günlük Çarkın Cihaz/Browser Tabanlı Saklanması (Cihaz Paylaşımı Riski)
* **Mevcut Durum:** `DailyFutureSpinWheel.tsx` içerisinde `localStorage.getItem("future_daily_spin_date")` kullanılıyor.
* **Aykırılık Sebebi:** Tarih kontrolü oturum açan kullanıcının benzersiz ID'sine değil, sadece tarayıcının `localStorage`'ına bağlı.
* **Risk:** Aynı bilgisayar veya telefondan A kullanıcısı çarkı çevirdikten sonra çıkış yapıp B kullanıcısı girdiğinde, B kullanıcısı "Bugünkü hakkınızı kullandınız" engeliyle karşılaşır.
* **Çözüm Önerisi:** Depolama anahtarını `future_daily_spin_date_${currentUser.id || 'guest'}` şeklinde kullanıcı ID'si ile dinamikleştirmek.

### ⚠️ Aykırılık 2: Misafir (Guest) Oy ve Kanıt Kullanım Tutarsızlığı
* **Mevcut Durum:** Bazı modlarda (örn. Tahmin Oylama) misafir kullanıcı oy vermeye çalıştığında `GuestProtectedOverlay` veya Kayıt Ol uyarısı çıkarken, diğer bazı alt detay kartlarında misafir oyu `localStorage`'a yazılabiliyor.
* **Aykırılık Sebebi:** Merkezi yetkilendirme kontrolünün (`currentUser` şartı) tüm alt bileşenlerde aynı standartta uygulanmaması.
* **Risk:** Anonim kullanıcılar oylama sayılarını manipüle edebilir veya üye olmadan puan/kredi kazanıyormuş algısı oluşabilir.
* **Çözüm Önerisi:** Oy verme, kanıt sunma ve yorum yapma eylemlerinin tamamında `auth.isAuthorized` kontrolünün zorunlu kılınması.

### ⚠️ Aykırılık 3: Telefon Doğrulama (SMS OTP) Simülasyonu
* **Mevcut Durum:** `UserAuthModal.tsx` modülünde telefon doğrulama kodu sabit olarak `"123456"` şeklinde çalışmaktadır.
* **Aykırılık Sebebi:** Gerçek bir SMS API sağlayıcısı (Twilio vb.) entegre edilmediği için statik onay kodu kullanılıyor.
* **Risk:** Kullanıcılar rastgele veya geçersiz telefon numarası girerek onaylı kullanıcı ayrıcalıklarını kazanabilir.
* **Çözüm Önerisi:** Arayüzde bunun bir "Demo / Simülasyon Doğrulaması" olduğu açıkça belirtilmeli veya gerçek bir doğrulama servisine bağlanmalı.

### ⚠️ Aykırılık 4: Veri Kalıcılığı (Local vs Cloud Backend Inconsistency)
* **Mevcut Durum:** Sistemde `userAccounts.ts`, `spinStorage.ts` ve `BadgeContext.tsx` tarayıcı belleğini (`localStorage`) kullanıyor.
* **Aykırılık Sebebi:** Kullanıcı tarayıcı önbelleğini temizlediğinde veya farklı bir cihazdan girdiğinde tüm kazandığı rozetler, krediler ve onaylanan tahmin geçmişi sıfırlanır.
* **Risk:** Kullanıcıların uzun vadeli katkı motivasyonunu kaybetmesi.
* **Çözüm Önerisi:** Kalıcı sunucu/veritabanı (Firestore / PostgreSQL) katmanı ile gerçek zamanlı veri senkronizasyonu sağlanması.

### ⚠️ Aykırılık 5: Çoklu Dil (i18n) Ve Dinamik Metin Uyumsuzluğu
* **Mevcut Durum:** `LanguageContext.tsx` Türkçe ve İngilizce dil seçenekleri sunuyor, ancak Otonom Ajan logları (`AutonomousAgentSystem.tsx`) ve Topluluk Gönderileri Türkçe metin dizilimleriyle hardcoded tanımlanmış.
* **Risk:** İngilizce diline geçen yabancı kullanıcılar ajan çıktılarını ve topluluk bildirimlerini Türkçe görmeye devam eder.

---

## 💡 4. KULLANICI DENEYİMİ (UX) VE MİMARİ GELİŞTİRME ÖNERİLERİ

1. **Mobil Navigasyon & Mod Gruplama (Çok Önemli):**
   * **Sorun:** Navbar üzerinde 11'den fazla mod butonu yer alıyor. Bu durum mobil cihazlarda karmaşıklığa yol açıyor.
   * **Öneri:** Modlar 3 ana kategori altında gruplanmalıdır:
     * 🌐 **Gelecek Kesiti:** Zaman Çizelgesi, Kelebek Etkisi, Coğrafi Harita.
     * 🔬 **Doğrulama & Topluluk:** Bilimsel Onay Motoru, Topluluk Tahminleri, Sıralama.
     * 🤖 **Yapay Zeka & Simülatörler:** Meslek Risk Analizi, Kişisel Yol Haritası, Zaman Seyyahı Chat.

2. **Otonom Ajan Network & Telemetri Sadeleştirmesi (Tamamlandı):**
   * Yapılan son güncellemeyle devasa ekran kaplayan Ajan Telemetri paneli varsayılan olarak **tek satırlık şık bir durum çubuğuna** dönüştürüldü ve kullanıcının isteğine göre daraltılabilir hale getirildi.

3. **Günlük Çark Otomatik Daralma Çözümü (Tamamlandı):**
   * Günlük çark hakkı kullanıldıktan sonra menü karmaşıklık yaratmaması için otomatik olarak kapatılmakta, gece yarısına (00:00) kalan süreyi canlı geri sayım saatiyle gösteren minimal bir bant haline gelmektedir.

4. **Kullanıcı Adı Düzenleme & Profil Senkronizasyonu (Tamamlandı):**
   * `UserProfileModal` ve `UserAuthModal` üzerinde kullanıcıların isimlerini hızlıca güncelleyebilmesi sağlandı ve bu değişiklik tüm sistemdeki hesap verileriyle anlık senkronize edildi.

---

## 🎯 5. SONUÇ VE ÖNCELİKLİ AKSİYON PLANI

Platform, gelecek senaryoları ve doğrulama mekanizmaları açısından oldukça zengin ve özgün bir mimariye sahiptir. Belirtilen iş mantığı aykırılıklarının (özellikle cihaz tabanlı çark kilidi ve misafir yetki sınırları) giderilmesiyle kullanıcı güveni ve platform tutarlılığı en üst seviyeye çıkacaktır.

*Rapor dosya olarak projeye dahil edilmiştir (`/PROJE_TAM_KAPSAMLI_ANALIZ_VE_DENETIM_RAPORU.md`).*
