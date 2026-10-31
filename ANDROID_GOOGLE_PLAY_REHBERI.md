# Gelecek Takvimi — Android & Google Play Yayınlama Rehberi

Bu proje, modern **Capacitor 8** altyapısıyla tam donanımlı bir yerel Android projesine (`/android`) dönüştürülmüştür. Hem web ortamında (tarayıcı/PWA) hem de yerel Android mobil cihazlarda (Google Play Store) aynı anda çalışır.

---

## 1. Neler Hazırlandı?

1. **Yerel Android Projesi (`/android`):**
   * Gradle tabanlı gerçek Android Studio projesi.
   * `Package ID`: `com.gelecektakvimi.app`
   * `Uygulama Adı`: `Gelecek Takvimi`
   * `Target SDK`: `36` (Google Play Store'un en güncel gereksinimleriyle %100 uyumlu).
   * `Min SDK`: `24` (Android 7.0+, dünyadaki Android cihazların %99.5+'ini destekler).

2. **Mobil Donanım & Sistem Entegrasyonları:**
   * **Fiziksel Geri Tuşu (Hardware Back Button):** Kullanıcı Android geri tuşuna bastığında uygulama doğrudan kapanmaz; açık modal varsa kapatılır, alt konsollardaysa ana portala döner, ana portaldaysa çıkış izni verir.
   * **Durum Çubuğu (Status Bar):** `#060a14` koyu tema ile entegre edildi.
   * **Açılış Ekranı (Splash Screen):** Gelecek Takvimi temalı otomatik geçiş.
   * **Safe Area (Çentik) Uyumu:** `viewport-fit=cover` ile tam ekran deneyimi.

---

## 2. Mobil Geliştirme ve Güncelleme Komutları

Uygulamada bir frontend değişikliği yaptığınızda Android tarafını güncellemek için:

```bash
# Web paketini derler ve Android projesine senkronize eder
npm run build:mobile

# Android Studio'yu doğrudan bu proje ile başlatır
npm run cap:android

# Yalnızca varlıkları kopyalayıp eklentileri güncellemek için
npm run cap:sync
```

---

## 3. Google Play Store İçin `.aab` (Android App Bundle) Üretimi

Google Play Store artık `.apk` yerine `.aab` (Android App Bundle) formatını zorunlu tutmaktadır.

### Seçenek A: Android Studio ile (En Kolay Yol)
1. `npm run cap:android` komutuyla projeyi Android Studio'da açın.
2. Üst menüden **Build** → **Generate Signed Bundle / APK...** seçin.
3. **Android App Bundle** seçeneğini işaretleyip **Next** deyin.
4. Bir KeyStore (İmzalama Anahtarı) oluşturun (şifrenizi saklayın).
5. **Release** seçeneğini belirleyip **Finish** butonuna basın.
6. `android/app/release/app-release.aab` dosyası üretilecektir.

### Seçenek B: Terminal Üzerinden
```bash
npm run build:mobile
cd android
./gradlew bundleRelease
```

---

## 4. Google Play Console Yükleme Adımları

1. **Google Play Console** hesabınıza giriş yapın (play.google.com/console).
2. **Uygulama Oluştur** (Create App) → Uygulama Adı: *Gelecek Takvimi*, Dil: *Türkçe*, Tür: *Uygulama*, Ücretsiz/Ücretli.
3. **Üretim (Production)** veya **Kapalı Test (Closed Testing)** bölümüne gidin.
4. Ürettiğiniz `app-release.aab` dosyasını sürüm bölümüne yükleyin.
5. Mağaza giriş bilgilerini doldurun:
   * **Kısa Açıklama:** 2026-2060 yılları arasındaki teknolojik dönüşüm takvimi ve simülatörü.
   * **Gizlilik Politikası URL'si:** Uygulama içindeki Gizlilik Politikası bağlantısı.
   * **Simge:** 512x512 PNG.
   * **Öne Çıkan Görsel:** 1024x500 JPG/PNG.
   * **Ekran Görüntüleri:** En az 2 adet telefon ekran görüntüsü.
6. İncelemeye Gönder (Submit for Review) butonuna basın.
