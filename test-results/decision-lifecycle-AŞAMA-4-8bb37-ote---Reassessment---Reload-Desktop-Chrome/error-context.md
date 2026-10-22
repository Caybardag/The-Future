# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: decision-lifecycle.spec.ts >> AŞAMA 42.2 — Gerçek Browser UI Karar & Yaşam Döngüsü E2E >> 1. Gerçek Browser Zinciri: User Decision C -> Reload -> Roadmap -> Action -> Outcome Note -> Reassessment -> Reload
- Location: e2e/decision-lifecycle.spec.ts:48:3

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: locator('div.fixed.inset-0').filter({ hasText: /Dünya & Küresel Etki|Benim İçin/i }).first().getByText(/3 Alternatif Stratejik Karar Yolu/i)
Expected: visible
Timeout: 5000ms
Error: element(s) not found

Call log:
  - Expect "toBeVisible" with timeout 5000ms
  - waiting for locator('div.fixed.inset-0').filter({ hasText: /Dünya & Küresel Etki|Benim İçin/i }).first().getByText(/3 Alternatif Stratejik Karar Yolu/i)

```

```yaml
- banner:
  - text: TEKNOLOJİK EVRİM 2026—2060 Kuantum Gelecek Ağı // 2026—2060
  - textbox "Yıl veya teknoloji ara..."
  - button "TR"
  - button "0 + Kredi"
  - button "Giriş"
  - button "Ana Portal"
  - button "Kontrol Merkezi Menüsü": Menü
- main:
  - button "← Merkez"
  - text: "| Aktif Görünüm: 🕒 2026—2060 Zaman Çizelgesi"
  - button "50 Canlı İstihbarat Sinyali"
  - heading "2026—2060 timeline_view" [level=2]
  - text: 35 Yıl
  - button "Dünya Geleceği"
  - button "Benim Geleceğim"
  - button "Baz"
  - button "İyimser"
  - button "Distopik"
  - text: 2026 • Yapay Zeka Ajanları Çağı
  - button "Önceki Yıl" [disabled]
  - button "Sonraki Yıl"
  - button "2026"
  - button "2027"
  - button "2028"
  - button "2029"
  - button "2030"
  - button "2031"
  - button "2032"
  - button "2033"
  - button "2034"
  - button "2035"
  - button "2036"
  - button "2037"
  - button "2038"
  - button "2039"
  - button "2040"
  - button "2041"
  - button "2042"
  - button "2043"
  - button "2044"
  - button "2045"
  - button "2046"
  - button "2047"
  - button "2048"
  - button "2049"
  - button "2050"
  - button "2051"
  - button "2052"
  - button "2053"
  - button "2054"
  - button "2055"
  - button "2056"
  - button "2057"
  - button "2058"
  - button "2059"
  - button "2060"
  - text: Faz 01 • 2026 - 2035 Yapay Zeka & Bilişim 7 Sinyal
  - button "1 Çelişki"
  - text: "%99 Model Olasılık Skoru 2026 KİLOMETRE TAŞI"
  - heading "Yapay Zeka Ajanları Çağı" [level=2]
  - paragraph: "#Yapay Zeka & Bilişim • Etki Seviyesi: %35 • Öngörü Güveni: 99/100"
  - text: Bu Yılda Neler Yaşanacak? (Gelecek Senaryosu)
  - paragraph: Yapay zeka sadece metin yazmakla kalmaz; otonom şirketler kurar, kendi başına yazılım kodlar ve insan gözetimi olmadan finansal kararlar alır.
  - text: "2026 Gündelik Yaşamından Bir Kesit:"
  - paragraph: "\"Sabah saat 08:30'da akıllı cihazınızı açtığınızda, finans ajanınız geceden bu yana 14 borsa işlemi gerçekleştirdiğini, yazılım ajanınızın yeni mikro-hizmeti yayına aldığını ve müşteri ilişkileri ajanınızın 340 destek talebini %99 memnuniyetle çözdüğünü raporlar.\""
  - text: "Bireysel Hayata Etkisi: \"Sıradan bir çalışan kişisel yapay zeka ajanlarına 10 farklı şirketi otonom yönettirebilir.\" Temel İtici Güçler 2026 #Multi-Agent Sistemler #Otonom İş Akışları #LLM Entegrasyonu İşgücü Otomasyonu:"
  - strong: "%45"
  - text: "Biyo-Dijital Entegrasyon:"
  - strong: "%15"
  - button "Tüm Metrikleri İncele"
  - text: Bu Gelecek İçin Ne Yapmak İstersiniz? 3 ANA AKSİYON
  - button "Gelecek Senaryosu Tüm derin hikaye, belgesel simülasyonu ve analizi oku.":
    - text: Gelecek Senaryosu
    - paragraph: Tüm derin hikaye, belgesel simülasyonu ve analizi oku.
  - button "2026 İnsanıyla Konuş Zaman Tüneli 2026 çağında yaşayan bir vatandaşla (Yapay Zeka Ajanları Çağı sonrasını) canlı konuş.":
    - text: 2026 İnsanıyla Konuş Zaman Tüneli
    - paragraph: 2026 çağında yaşayan bir vatandaşla (Yapay Zeka Ajanları Çağı sonrasını) canlı konuş.
  - button "Bu Gelişme Beni Nasıl Etkiler? Kişisel Etki Bu teknolojinin (Yapay Zeka Ajanları Çağı) yaşınıza, kariyerinize, yol haritanıza ve risklerinize etkisini görün.":
    - text: Bu Gelişme Beni Nasıl Etkiler? Kişisel Etki
    - paragraph: Bu teknolojinin (Yapay Zeka Ajanları Çağı) yaşınıza, kariyerinize, yol haritanıza ve risklerinize etkisini görün.
  - button "Genel Bakış"
  - button "Sistem Beyni (Canlı AI)"
  - button "Kanıtlar & Makaleler (2)"
  - button "Telemetri & Riskler"
  - button "Neden-Sonuç Alt Ağacı"
  - text: "Teknoloji Hazırlığı TRL 8 (Model Tahmini) Model konsensus projeksiyonu: %95 Ekonomi & İşgücü %48 Otonom Kuzey Amerika & Doğu Asya Hibrit Çip-Yapay Zeka Aksı Makro Kırılganlık 56/100 Risk Otonom ajanların finansal piyasalarda oluşturabileceği ani çöküşler (flash crash) ve sentetik medya dezenformasyonu. 💡 2026 Günlük Yaşam Senaryosu & Bireye Yansıması:"
  - paragraph: Akıllı lensiniz ve kulak içi biyo-asistanınız siz uyanmadan günlük kan tahlilinizi ve otonom ajansınızın gece yaptığı 40 işlemi önünüze fısıldar.
  - heading "Yapay Zeka Mantıksal Sıradaki Adım ÇAPRAZ ANALİZ" [level=4]
  - text: "Bakiye: 0 Kişisel Tehdit Analizi 🔥 %87 İlgi Görüyor"
  - heading "2026 (Yapay Zeka Ajanları Çağı) Mesleğinizi Nasıl Etkileyecek?" [level=5]
  - paragraph: Bu teknolojinin otomasyon dalgasında mesleğinizin hayatta kalma ve dönüşüm katsayısını hemen hesaplayın.
  - text: 15 Kredi
  - button "Giriş Yap & Başlat"
  - text: Kelebek Etkisi Simülatörü ⚡ Popüler
  - heading "Ya 2026 Yılındaki Bu Kırılma Yaşanmasaydı?" [level=5]
  - paragraph: Bu kilometre taşını tarihten silin; domino etkisiyle sonraki teknolojilerin nasıl çöktüğünü simüle edin.
  - text: 15 Kredi
  - button "Giriş Yap & Başlat"
  - text: Gelecekten Canlı İletişim
  - heading "2026 Çağında Yaşayan Bir İnsanla Konuş" [level=5]
  - paragraph: Bu teknolojinin gündelik hayatı nasıl değiştirdiğini o dönemin bilinciyle canlı sohbet ederek öğrenin.
  - text: 20 Kredi
  - button "Giriş Yap & Başlat"
  - heading "timeline_view 2026—2060" [level=3]
  - paragraph: select_milestone
  - button "Tüm Yıllar (35)"
  - 'button "Aşama 1: 2026–2030 (10)"'
  - 'button "Aşama 2: 2031–2040 (10)"'
  - 'button "Aşama 3: 2041–2060 (15)"'
  - button "Kartlar"
  - button "Kompakt"
  - text: 2026 // PHASE 01 Yapay Zeka & Bilişim
  - heading "Yapay Zeka Ajanları Çağı" [level=4]
  - paragraph: Yapay zeka sadece metin yazmakla kalmaz; otonom şirketler kurar, kendi başına yazılım kodlar ve insan gözetimi olmadan finansal kararlar alır.
  - text: Model TRL / Konsensus TRL 8 (Tahmin) · %95 İşgücü Otomasyonu %48 Ajan Kırılganlık 56/100 Risk %99 Model Skoru (Yakın Ufuk Projeksiyonu)
  - button "Spotlight"
  - button "Detayları Aç"
  - text: 2027 // PHASE 01 Sosyoloji & Ekonomi
  - heading "Sentetik Gerçeklik Krizi" [level=4]
  - paragraph: Deepfake ve yapay medya o kadar kusursuz hale gelir ki, internetteki içeriklerin gerçekliğini kanıtlamak için 'Dijital DNA' (filigran) yasaları küresel olarak zorunlu kılınır.
  - text: Model TRL / Konsensus TRL 8 (Tahmin) · %93 İşgücü Otomasyonu %53 Ajan Kırılganlık 59/100 Risk %95 Model Skoru (Yakın Ufuk Projeksiyonu)
  - button "Spotlight"
  - button "Detayları Aç"
  - text: 2028 // PHASE 01 Enerji & Çevre
  - heading "Katı Hal (Solid-State) Batarya Devrimi" [level=4]
  - paragraph: Enerji depolamada lityum-iyonun yerini katı hal pilleri alır. Termodinamik ve hücre yoğunluğu sınırları gereği yüksek enerji yoğunluğu ve olmasa da, 2 kat daha yüksek enerji yoğunluğu, yüksek güvenlik ve 10 dakikada şarj imkanı sunar.
  - text: Model TRL / Konsensus TRL 8 (Tahmin) · %92 İşgücü Otomasyonu %56 Ajan Kırılganlık 63/100 Risk %87 Model Skoru (Yakın Ufuk Projeksiyonu)
  - button "Spotlight"
  - button "Detayları Aç"
  - text: 2029 // PHASE 01 Yapay Zeka & Bilişim
  - heading "Yapay Genel Zeka (AGI) & Mantıksal Akıl Yürütme" [level=4]
  - paragraph: Turing Testi günümüz LLM'leri tarafından zaten aşılmış olup AGI için yetersizdir. 2029 projeksiyonu; çok modlu nedensel akıl yürütme, otonom hedef planlama ve sürekli öğrenme yeteneği sergileyen AGI protokollerine odaklanır.
  - text: Model TRL / Konsensus TRL 6 (Tahmin) · %90 İşgücü Otomasyonu %67 Ajan Kırılganlık 71/100 Risk %77 Model Skoru (Yakın Ufuk Projeksiyonu)
  - button "Spotlight"
  - button "Detayları Aç"
  - text: 2030 // PHASE 01 İnsan-Makine Arayüzü
  - heading "Giyilebilir Nöroteknoloji & BCI Sinyal İşleme" [level=4]
  - paragraph: Giyilebilir sensörler (EEG/fNIRS) dışarıdan zihinsel odaklanma ve basit komutları okur. Kafatası sinyal gürültüsü nedeniyle hassas metin yazımı yeteneği hibrit AI niyet tahminleyicileriyle desteklenir.
  - text: Model TRL / Konsensus TRL 6 (Tahmin) · %89 İşgücü Otomasyonu %70 Ajan Kırılganlık 66/100 Risk %77 Model Skoru (Yakın Ufuk Projeksiyonu)
  - button "Spotlight"
  - button "Detayları Aç"
  - text: 2031 // PHASE 01 Biyoloji & Tıp
  - heading "CRISPR'ın Ticarileşmesi" [level=4]
  - paragraph: Kalıtsal hastalıklar için gen düzenleme tedavileri FDA onaylarını tamamlar. Sadece hastalıklar değil, kozmetik genetik müdahalelerin ilk adımları atılır.
  - text: Model TRL / Konsensus TRL 6 (Tahmin) · %87 İşgücü Otomasyonu %73 Ajan Kırılganlık 68/100 Risk %80 Model Skoru (Orta Vadeli Sistem Tahmini)
  - button "Spotlight"
  - button "Detayları Aç"
  - text: 2032 // PHASE 01 Otonom & Lojistik
  - heading "Otonom Sistemlerin Hakimiyeti" [level=4]
  - paragraph: Gelişmiş metropollerde Seviye 5 (direksiyonsuz ve pedalsız) otonom araçlar standart hale gelir. Küresel lojistik tamamen insansızlaşır.
  - text: Model TRL / Konsensus TRL 6 (Tahmin) · %85 İşgücü Otomasyonu %77 Ajan Kırılganlık 69/100 Risk %76 Model Skoru (Orta Vadeli Sistem Tahmini)
  - button "Spotlight"
  - button "Kilidi Aç"
  - text: 2033 // PHASE 01 Biyoloji & Tıp
  - heading "Kişiselleştirilmiş Yapay Hekimler" [level=4]
  - paragraph: Her insanın genetik haritasına, akıllı saatlerinden gelen anlık kan verilerine ve yaşam tarzına göre 7/24 teşhis koyan yapay zeka doktorları devreye girer.
  - text: Model TRL / Konsensus TRL 6 (Tahmin) · %84 İşgücü Otomasyonu %80 Ajan Kırılganlık 72/100 Risk %73 Model Skoru (Orta Vadeli Sistem Tahmini)
  - button "Spotlight"
  - button "Kilidi Aç"
  - heading "2035—2060 Dönemlerini ve 29+ Gelecek Simülasyonunu Açın" [level=4]
  - text: +50 ÜCRETSİZ KREDİ
  - paragraph: Ücretsiz hesabınızı oluşturarak kuantum simülasyonlarına ve derin gelecek analizlerine anında erişin.
  - button "Ücretsiz Giriş Yap / Kayıt Ol"
  - text: "Kilitli Gelecek Teknolojileri (29 Adet): Kuantum İnternet (2038) AGI Seviye 5 (2042) Nükleer Füzyon Ağı (2045) Zihin Yükleme (2050)"
  - button "Yukarı / 2026 Odak"
- button "Spotlight'a Git"
- button "Paylaş"
- button "Kapat"
- text: FAZ 01 • 2026 - 2035 Yapay Zeka & Bilişim %99 Model Olasılık Skoru 2026
- heading "Yapay Zeka Ajanları Çağı" [level=2]
- text: SEKME 2 / 5
- 'button "Sekme 1: 🌍 Dünya & Küresel Etki"'
- 'button "Sekme 2: 👤 Benim İçin (Nasıl Etkiler?)"'
- 'button "Sekme 3: 5 Katmanlı Dünya & Biyo-Yaşam"'
- 'button "Sekme 4: Gelecek Hikayesi & Senaryo"'
- 'button "Sekme 5: TRL & Bilimsel Radar"'
- button "👉 1 Sekme Daha Var"
- button "Sola kaydır"
- button "Sağa kaydır (Daha fazla sekme)"
- button "🌍 Dünya & Küresel Etki 01"
- button "👤 Benim İçin (Nasıl Etkiler?) 02"
- button "5 Katmanlı Dünya & Biyo-Yaşam 03"
- button "Gelecek Hikayesi & Senaryo 04"
- button "TRL & Bilimsel Radar 05"
- text: KİŞİYE ÖZEL GELECEK ETKİSİ
- heading "Kişisel Gelecek Analizi İçin Giriş Yapın" [level=4]
- paragraph: Bu dönüm noktasının yaşınıza, mesleğinize ve kariyer hedeflerinize özel doğrudan etkilerini, kişisel risk puanını ve somut eylem planını görmek için ücretsiz giriş yapın.
- button "Giriş Yap / Ücretsiz Kayıt Ol"
- contentinfo:
  - text: © 2026 - 2060 Teknolojik Evrim Takvimi. Tüm Hakları Saklıdır.
  - button "Gizlilik & Çerezler"
  - text: "|"
  - button "Kullanım Koşulları"
  - text: "|"
  - button "Yardım & Destek Merkezi"
- text: TIMELINE-SYS-01 1 / 3
- button "Turu Kapat"
- heading "Kronolojik 2026—2060 Kırılma Noktaları" [level=4]
- paragraph: 2026'dan 2060'a uzanan 16 ana dönüm noktasını zaman şeridi üzerinde yatay kaydırarak veya yıl adımlarıyla inceleyebilirsiniz.
- text: "İpucu: Kartlara tıklayarak 5 katmanlı dünya durumu ve patent dokümanlarını görüntüleyin."
- button "Adım 1"
- button "Adım 2"
- button "Adım 3"
- button "Sonraki"
```

# Test source

```ts
  1   | import { test, expect } from "@playwright/test";
  2   | 
  3   | /**
  4   |  * AŞAMA 42.2 — GERÇEK PLAYWRIGHT E2E KAPANIŞ TESTİ
  5   |  * 
  6   |  * Gerçek tarayıcı (headless Chrome) üzerinde:
  7   |  * 1. Login/Profile -> Milestone -> Seçenek A/B/C seçimi
  8   |  * 2. Kaydetme & DOM geri bildirimi
  9   |  * 3. page.reload() sonrası seçimin geri yüklenmesi
  10  |  * 4. Roadmap üzerinde seçimin (YOL C) yansıması
  11  |  * 5. Aksiyon durumu güncellemesi (Başlandı -> Tamamlandı)
  12  |  * 6. Kullanıcı deneyim notu girişi (Friction / verimsizlik notu)
  13  |  * 7. OUTCOME_FRICTION_PIVOT / Strateji Değerlendirmesi tavsiyesi (Yol B)
  14  |  * 8. İkinci page.reload() sonrası tüm state'in korunması
  15  |  * 9. Çoklu BrowserContext ile Guest ve User B izolasyonu
  16  |  */
  17  | 
  18  | const userAProfile = {
  19  |   id: "usr_super_ahmet",
  20  |   fullName: "Ahmet Mimar",
  21  |   email: "warfacelove46@gmail.com",
  22  |   role: "superadmin",
  23  |   profession: "Yazılım Mimarı",
  24  |   age: 34,
  25  |   industrySector: "Yapay Zeka & Bilişim",
  26  |   seniority: "senior",
  27  |   primaryGoal: "is_guvencesi",
  28  |   plan: "quantum_vip",
  29  |   credits: 9999,
  30  |   isOnboardingCompleted: true,
  31  | };
  32  | 
  33  | const userBProfile = {
  34  |   id: "usr_e2e_user_b",
  35  |   fullName: "Mehmet Güvenlik",
  36  |   email: "mehmet_guvenlik@gelecektakvimi.org",
  37  |   profession: "Siber Güvenlik Uzmanı",
  38  |   age: 40,
  39  |   industrySector: "Kuantum & Güvenlik",
  40  |   seniority: "senior",
  41  |   primaryGoal: "is_guvencesi",
  42  |   plan: "pro",
  43  |   credits: 100,
  44  |   isOnboardingCompleted: true,
  45  | };
  46  | 
  47  | test.describe("AŞAMA 42.2 — Gerçek Browser UI Karar & Yaşam Döngüsü E2E", () => {
  48  |   test("1. Gerçek Browser Zinciri: User Decision C -> Reload -> Roadmap -> Action -> Outcome Note -> Reassessment -> Reload", async ({ page }) => {
  49  |     // 1. User A profilini ve çerez izinlerini localStorage'a tanımlayarak sayfayı aç
  50  |     await page.addInitScript((profile) => {
  51  |       localStorage.setItem("future_timeline_user", JSON.stringify(profile));
  52  |       localStorage.setItem("user_profile_account", JSON.stringify(profile));
  53  |       const db: Record<string, any> = {};
  54  |       db[profile.email.toLowerCase()] = profile;
  55  |       localStorage.setItem("future_timeline_accounts_db", JSON.stringify(db));
  56  |       localStorage.setItem("cookie_consent_choice", "accepted");
  57  |       localStorage.setItem("cookie_consent_date", new Date().toISOString());
  58  |       localStorage.setItem("onboarding_banner_dismissed", "true");
  59  |       sessionStorage.setItem("has_entered_console", "true");
  60  |     }, userAProfile);
  61  | 
  62  |     await page.goto("/");
  63  |     await page.waitForLoadState("domcontentloaded");
  64  | 
  65  |     // Konsola Geç butonuna tıkla (veya doğrudan Timeline'a geç)
  66  |     const consoleBtn = page.getByRole("button", { name: /Konsola Geç/i }).first();
  67  |     if (await consoleBtn.isVisible()) {
  68  |       await consoleBtn.click();
  69  |     }
  70  | 
  71  |     // Timeline üzerinde "BU GELİŞME BENİ NASIL ETKİLER?" veya bir dönüm noktası detay butonunu bul
  72  |     const impactBtn = page.locator("#timeline-action-job-impact-btn");
  73  |     await expect(impactBtn).toBeVisible({ timeout: 10000 });
  74  |     await impactBtn.click();
  75  | 
  76  |     // MilestoneDetailModal açıldığını doğrula
  77  |     const modal = page.locator("div.fixed.inset-0").filter({ hasText: /Dünya & Küresel Etki|Benim İçin/i }).first();
  78  |     await expect(modal).toBeVisible();
  79  | 
  80  |     // "Benim İçin" sekmesine tıkla
  81  |     const personalTabBtn = modal.getByRole("button", { name: /Benim İçin/i }).first();
  82  |     await personalTabBtn.click();
  83  | 
  84  |     // 3 Alternatif Stratejik Karar Yolu başlığını bekle
> 85  |     await expect(modal.getByText(/3 Alternatif Stratejik Karar Yolu/i)).toBeVisible();
      |                                                                         ^ Error: expect(locator).toBeVisible() failed
  86  | 
  87  |     // Yol C seçeneğine tıkla (Stratejik Sıçrama)
  88  |     const optionCCard = modal.locator("div").filter({ hasText: /YOL C/i }).last();
  89  |     await expect(optionCCard).toBeVisible();
  90  |     await optionCCard.click();
  91  | 
  92  |     // Seçim geri bildirimini doğrula (AKTİF veya SEÇİLEN ✓)
  93  |     await expect(modal.getByText(/SEÇİLEN ✓/i)).toBeVisible();
  94  | 
  95  |     // 6. Sayfayı reload et
  96  |     await page.reload();
  97  |     await page.waitForLoadState("domcontentloaded");
  98  | 
  99  |     // Modal tekrar açmak için Konsol -> Impact butonuna tıkla
  100 |     const consoleBtnAfterReload = page.getByRole("button", { name: /Konsola Geç/i }).first();
  101 |     if (await consoleBtnAfterReload.isVisible()) {
  102 |       await consoleBtnAfterReload.click();
  103 |     }
  104 |     const impactBtnAfterReload = page.locator("#timeline-action-job-impact-btn");
  105 |     await expect(impactBtnAfterReload).toBeVisible();
  106 |     await impactBtnAfterReload.click();
  107 | 
  108 |     // Modal açıldığında "Benim İçin" sekmesine git
  109 |     const modalAfterReload = page.locator("div.fixed.inset-0").filter({ hasText: /Dünya & Küresel Etki|Benim İçin/i }).first();
  110 |     await modalAfterReload.getByRole("button", { name: /Benim İçin/i }).first().click();
  111 | 
  112 |     // 7. Reload sonrası Yol C'nin hâlâ SEÇİLEN ✓ olduğunu DOM'dan doğrula
  113 |     await expect(modalAfterReload.locator("div").filter({ hasText: /YOL C/i }).locator("text=SEÇİLEN ✓").first()).toBeVisible();
  114 | 
  115 |     // 8. Action Durumunu Güncelle: "⚡ Başlandı" ve ardından "✓ Tamamlandı"
  116 |     const inProgressBtn = modalAfterReload.getByRole("button", { name: /Başlandı/i }).first();
  117 |     await inProgressBtn.click();
  118 | 
  119 |     const completedBtn = modalAfterReload.getByRole("button", { name: /Tamamlandı/i }).first();
  120 |     await completedBtn.click();
  121 | 
  122 |     // 9. Outcome / Refleksiyon alanına sürtünme & verimsizlik içeren gerçek metin gir
  123 |     const noteTextarea = modalAfterReload.locator("textarea").first();
  124 |     await noteTextarea.fill("Uygulamada ciddi verim düşüklüğü ve tıkanma yaşıyorum, bekleneni vermedi.");
  125 | 
  126 |     const saveNoteBtn = modalAfterReload.getByRole("button", { name: /Notu Kaydet/i }).first();
  127 |     await saveNoteBtn.click();
  128 | 
  129 |     // 10. Reassessment / Karar Değerlendirme çıktısının UI'da belirdiğini doğrula
  130 |     // (Friction nedeniyle Yol B tavsiyesi üretilmeli)
  131 |     await expect(modalAfterReload.getByText(/Canlı İstihbarat ile Strateji Değerlendirmesi|Tavsiye: Yol B/i).first()).toBeVisible({ timeout: 5000 });
  132 | 
  133 |     // 11. İkinci kez page.reload() yaparak kalıcılığı doğrula
  134 |     await page.reload();
  135 |     await page.waitForLoadState("domcontentloaded");
  136 | 
  137 |     const consoleBtn2 = page.getByRole("button", { name: /Konsola Geç/i }).first();
  138 |     if (await consoleBtn2.isVisible()) {
  139 |       await consoleBtn2.click();
  140 |     }
  141 |     await page.locator("#timeline-action-job-impact-btn").click();
  142 | 
  143 |     const modalFinal = page.locator("div.fixed.inset-0").filter({ hasText: /Dünya & Küresel Etki|Benim İçin/i }).first();
  144 |     await modalFinal.getByRole("button", { name: /Benim İçin/i }).first().click();
  145 | 
  146 |     // Notun ve Reassessment tavsiyesinin reload sonrasında da DOM'da korunduğunu doğrula
  147 |     await expect(modalFinal.getByText("Uygulamada ciddi verim düşüklüğü ve tıkanma yaşıyorum, bekleneni vermedi.")).toBeVisible();
  148 |     await expect(modalFinal.getByText(/Tavsiye: Yol B/i).first()).toBeVisible();
  149 |   });
  150 | 
  151 |   test("2. Çoklu BrowserContext İzolasyonu: Guest vs User A vs User B", async ({ browser }) => {
  152 |     // -------------------------------------------------------------
  153 |     // CONTEXT 1: Authenticated User A (Yol C seçer)
  154 |     // -------------------------------------------------------------
  155 |     const contextA = await browser.newContext();
  156 |     const pageA = await contextA.newPage();
  157 |     await pageA.addInitScript((profile) => {
  158 |       localStorage.setItem("future_timeline_user", JSON.stringify(profile));
  159 |       localStorage.setItem("user_profile_account", JSON.stringify(profile));
  160 |       const db: Record<string, any> = {};
  161 |       db[profile.email.toLowerCase()] = profile;
  162 |       localStorage.setItem("future_timeline_accounts_db", JSON.stringify(db));
  163 |       localStorage.setItem("cookie_consent_choice", "accepted");
  164 |       localStorage.setItem("cookie_consent_date", new Date().toISOString());
  165 |       localStorage.setItem("onboarding_banner_dismissed", "true");
  166 |       sessionStorage.setItem("has_entered_console", "true");
  167 |     }, userAProfile);
  168 | 
  169 |     await pageA.goto("/");
  170 |     const consoleBtnA = pageA.getByRole("button", { name: /Konsola Geç/i }).first();
  171 |     if (await consoleBtnA.isVisible()) await consoleBtnA.click();
  172 | 
  173 |     await pageA.locator("#timeline-action-job-impact-btn").click();
  174 |     const modalA = pageA.locator("div.fixed.inset-0").filter({ hasText: /Dünya & Küresel Etki|Benim İçin/i }).first();
  175 |     await modalA.getByRole("button", { name: /Benim İçin/i }).first().click();
  176 | 
  177 |     // User A Yol C seçer
  178 |     const optC = modalA.locator("div").filter({ hasText: /YOL C/i }).last();
  179 |     await optC.click();
  180 |     await expect(modalA.getByText(/SEÇİLEN ✓/i)).toBeVisible();
  181 | 
  182 |     // -------------------------------------------------------------
  183 |     // CONTEXT 2: Guest User (Hiç giriş yapmamış temiz oturum)
  184 |     // -------------------------------------------------------------
  185 |     const contextGuest = await browser.newContext();
```