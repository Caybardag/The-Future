# Hukuki Güvenlik & Kurumsal Şeffaflık: NASA/TRL İbarelerinin Tasfiyesi ve Olasılıksal Simülasyon Standardı

Proje genelinde herhangi bir resmi kurum (NASA vb.) onayı, garantisi veya bağlayıcı kehanet algısı oluşturan tüm yanıltıcı ibarelerin ("NASA TRL", "NASA onaylı", "TRL 1-9 Standardı") tamamen temizlenmesi; yerine objektif "Gelişim Aşaması (1-9)" terminolojisinin getirilmesi ve her analiz ekranının başına net bir olasılıksal simülasyon yasal uyarısının yerleştirilmesini kapsayan mimari dönüşüm planıdır.

### User Review & Critical Decisions

> [!IMPORTANT]
> Kullanıcı ile soru-cevap sürecinde teyit edilen ve mutabık kalınan temel kararlar:

- **Karar 1 (Terminoloji Değişimi)**: "NASA" ve "TRL" kısaltmaları arayüz ve kullanıcıya dönük tüm metinlerden tamamen kaldırılacaktır. Bunun yerine tarafsız, objektif ve endüstri standardı olan **"Gelişim Aşaması (1-9)"** (İngilizce: *Development Stage 1-9*) ifadesi kullanılacaktır.
- **Karar 2 (Yasal Sorumluluk Reddi & Olasılıksal Simülasyon Uyarısı)**: Her analiz, zaman akışı ve simülasyon ekranının üst bölümüne standart, profesyonel bir **Olasılıksal Fütüroloji Uyarısı** yerleştirilecektir:
  > *"Bilgilendirme: Platformda sunulan tüm tarihler, kırılma senaryoları ve simülasyonlar olasılıksal fütüroloji projeksiyonlarıdır. Kesin gerçekleşme taahhüdü, resmi kurum onayı veya bağlayıcı gelecek garantisi içermez."*
- **Karar 3 (Kurumsal Footer ve Tanıtım Metinlerinin Arındırılması)**: `CorporateFooter`, `GoogleAIStylePlansShowcase`, `EpicIntelligenceHubPortal`, `HelpSupportModal` ve tüm modül başlıklarındaki "NASA TRL standartları", "NASA kanıtı" ibareleri tamamen silinecek, saf bilimsel literatür ve analitik modelleme dili korunacaktır.

---

### 1. Overview & Core Concept

- **What It Does**: Uygulamanın fütüroloji ve teknoloji kırılma modellerini hukuki ve etik açıdan güvenli bir zemine oturtur. Yanıltıcı kurumsal referansları (NASA onayı vb.) sıfırlar; kullanıcıya verilerin ampirik gözlemlere dayalı birer olasılık simülasyonu olduğunu dürüstçe bildirir.
- **Target Audience / Persona**: Gelecek projeksiyonlarını inceleyen ancak bunların kesin bir kehanet değil, stratejik planlama senaryosu olduğunun bilincinde olan kurumsal kullanıcılar, araştırmacılar ve bireyler.
- **Key Value**: Yasal ve kurumsal itibar koruması, sıfır hukuki risk, şeffaf fütüroloji etiği ve kullanıcı güveni.

---

### 2. User Experience & Visual Design

#### Key User Flows

1. **Analiz Ekranına Giriş & Olasılık Farkındalığı**:
   - Kullanıcı `Zaman Akışı (Timeline)`, `Kişisel Yol Haritası (Roadmap)`, `Meslek Risk Analizi (Job Risk)`, `Zaman Yolcusu (Persona Chat)` veya `Bilişsel İstatistikler (Analytics)` ekranına girdiğinde, sayfa başlığının hemen altında zarif, dikkat çekici ancak göz yormayan kurumsal bir uyarı bandı görür.
   - Uyarı bandı: İnce camgöbeği/kehribar sınır çizgisi, bilgi ikonu ve net sorumluluk reddi metni barındırır.
2. **Kart ve Detaylarda "Gelişim Aşaması" Sunumu**:
   - Dönüm noktası kartlarında ve modal pencerelerde daha önce "NASA TRL 6" veya "TRL 8" olarak görünen etiketler, **"Gelişim Aşaması 6/9"** veya **"Aşama 6 (Prototip)"** olarak güncellenir.
   - Kullanıcı teknolojinin hangi olgunluk evresinde olduğunu (Hipotez, Laboratuvar, Saha Testi, Yaygın Kullanım) objektif olarak anlar.
3. **Kurumsal Footer & Hukuki Bütünlük**:
   - Sayfa altındaki `CorporateFooter` bileşeninde yer alan "NASA TRL 1-9 Standard" ibaresi kaldırılarak yerine *"Olasılıksal Modelleme & Açık Literatür Metodolojisi"* konumlandırılır.

#### Visual Identity & Theme

- **Uyarı Bandı Mimarisi (`ProbabilisticSimulationDisclaimer.tsx`)**:
  - Yüzey: `bg-slate-900/60 backdrop-blur-md border border-cyan-500/20 rounded-2xl p-3 sm:p-4 mb-5`
  - Tipografi: Temiz ve kurumsal sans-serif (`text-xs text-slate-300 font-sans leading-relaxed`)
  - Vurgu: Küçük monospaced başlık (`FONT-MONO TEXT-[10px] TEXT-CYAN-400 FONT-BOLD UPPERCASE: "OLASILIKSAL FÜTÜROLOJİ PROJEKSİYONU"`)
- **Aşama Rozetleri**:
  - Kapsül yerine temiz metin: `Gelişim Aşaması: 7/9 (Saha Doğrulaması)`

---

### 3. Key Product Decisions & Trade-Offs

#### Karar 1: NASA İsminin Platform Genelinden İstisnasız Temizlenmesi
- **Seçilen Yaklaşım**: Kod tabanındaki tüm kullanıcıya dönük arayüzlerde, başlıklarda, yardım merkezinde, kartlarda ve modal pencerelerde geçen "NASA", "NASA TRL", "NASA onaylı" ifadeleri istisnasız kaldırılır.
- **Gerekçe**: Platformun NASA ile resmi bir sponsorluk, ortaklık veya onay anlaşması bulunmamaktadır. Bu tür referanslar yanıltıcı beyan niteliği taşır ve ciddi yasal sorumluluklar doğurabilir.
- **Değerlendirilen Alternatif**: "NASA metodolojisinden esinlenilmiştir" demek (Kullanıcı tarafından reddedildi; kafa karışıklığı ve sorumluluk riskini tamamen yok etmek için isim bütünüyle kaldırılmalıdır).

#### Karar 2: "TRL" Kısaltmasının "Gelişim Aşaması (1-9)" Olarak Dönüştürülmesi
- **Seçilen Yaklaşım**: Kullanıcı tercihi doğrultusunda teknik ve kafa karıştırıcı TRL kısaltması yerine herkesin kolayca anlayabileceği **"Gelişim Aşaması (1-9)"** ifadesine geçilir.
- **Gerekçe**: TRL uzay ve savunma sanayii jargonu olup genel kullanıcı için anlaşılmazdır; "Gelişim Aşaması" ise hem kurumsal hem pedagojik olarak açıktır.

#### Karar 3: Her Analiz Ekranının Başına Standart Uyarı Bileşeni Eklenmesi
- **Seçilen Yaklaşım**: Yeniden kullanılabilir bir `<ForesightDisclaimerBanner />` bileşeni hazırlanarak analitik modüllerin üstüne yerleştirilir.
- **Gerekçe**: Kullanıcının gelecekle ilgili gördüğü tarih ve senaryoları bir garanti veya kesin kehanet zannetmesini önler, şeffaf ve güvenilir bir fütüroloji standardı sağlar.

---

### 4. Technical Architecture & Component Hierarchy

```
┌────────────────────────────────────────────────────────────────────────┐
│                   KURUMSAL NAVİGASYON (Navbar.tsx)                     │
└────────────────────────────────────┬───────────────────────────────────┘
                                     │
                                     ▼
┌────────────────────────────────────────────────────────────────────────┐
│           YENİ BİLEŞEN: <ForesightDisclaimerBanner />                  │
│  ℹ️ "Platformda sunulan veriler ve senaryolar olasılıksal fütüroloji    │
│      projeksiyonlarıdır; kesin gerçekleşme taahhüdü içermez."          │
└────────────────────────────────────┬───────────────────────────────────┘
                                     │
        ┌────────────────────────────┼───────────────────────────┐
        ▼                            ▼                           ▼
┌──────────────────┐       ┌──────────────────┐       ┌──────────────────┐
│ 1. ZAMAN AKIŞI   │       │ 2. KİŞİSEL PLAN  │       │ 3. ANALİTİK & AI │
│ · Gelişim Aşama  │       │ · Olasılık Eğrisi│       │ · Senaryo Tahmin │
│   1-9 Ölçeği     │       │ · Bireysel Ufuk  │       │ · Olasılık Puanı │
│ [NASA İBARESİ YOK│       │ [NASA İBARESİ YOK│       │ [NASA İBARESİ YOK│
└──────────────────┘       └──────────────────┘       └──────────────────┘
                                     │
                                     ▼
┌────────────────────────────────────────────────────────────────────────┐
│                   KURUMSAL FOOTER (CorporateFooter.tsx)                │
│  · "NASA TRL Standart" SİLİNDİ -> "Açık Bilimsel Metodoloji & Trendler"│
└────────────────────────────────────────────────────────────────────────┘
```

---

### 5. Step-by-Step Implementation Plan

#### Aşama 1: Ortak Uyarı Bileşeninin Oluşturulması (`ForesightDisclaimerBanner.tsx`)
- [ ] `src/components/ForesightDisclaimerBanner.tsx` bileşenini oluştur (Türkçe/İngilizce çift dilli, şık kurumsal tasarım, kapatılabilir veya kompakt seçenekli).
- [ ] Analiz ekranlarına entegre et: `TimelineView.tsx`, `PersonalRoadmapView.tsx`, `JobRiskAnalyzerView.tsx`, `ButterflyEffectView.tsx`, `AnalyticsView.tsx`, `EpicIntelligenceHubPortal.tsx`.

#### Aşama 2: NASA ve TRL İfadelerinin Proje Genelinde Temizlenmesi
- [ ] `src/components/CorporateFooter.tsx`: "NASA TRL standartları" ve "NASA TRL 1-9 Standard" metinlerini kaldır; "Olasılıksal Fütüroloji & Açık Bilimsel Literatür Analitiği" ile değiştir.
- [ ] `src/components/GoogleAIStylePlansShowcase.tsx`: "NASA TRL Seviyesi", "NASA TRL forecasts", FAQ'daki NASA referanslarını temizle; "Gelişim Aşaması (1-9)" yap.
- [ ] `src/components/EpicIntelligenceHubPortal.tsx`: "NASA TRL 1-9", "TRL Radarı" etiketlerini "Gelişim Aşaması Radarı" ve "Bilimsel Literatür Radarı" olarak güncelle.
- [ ] `src/components/HelpSupportModal.tsx`: Soru ve cevaplardaki NASA ve TRL ifadelerini kaldır; kurumsal fütüroloji ve olasılık modelleme tanımlarıyla güncelle.
- [ ] `src/components/CommunitySubmissionsView.tsx`: Formdaki "TRL (Teknoloji Hazırlık Seviyesi)" etiketlerini ve TRL 1-9 seçeneklerini "Gelişim Aşaması (1-9)" olarak revize et; NASA Technical Reports referanslarını genel kurumsal Ar-Ge olarak güncelle.
- [ ] `src/components/MilestoneTreeExplorer.tsx`, `FutureVerdictView.tsx`, `ContextAwareOrchestrator.tsx`, `MilestoneDetailModal.tsx` içindeki TRL metinlerini "Gelişim Aşaması" olarak düzenle.

#### Aşama 3: Veri ve Çeviri Dosyalarının Denetimi
- [ ] `src/utils/milestoneTranslations.ts` ve `src/data/timelineData.ts` içerisindeki arayüz etiketlerini kontrol et; kullanıcıya gösterilen TRL ve NASA kalıntılarını temizle.

#### Aşama 4: Derleme, Test ve Doğrulama
- [ ] `compile_applet` ile TypeScript bütünlüğünü doğrula.
- [ ] Vitest testlerini (`npm run test`) ve üretim paketlemesini (`npm run build`) çalıştır.
- [ ] Kod tabanında `grep -rn "NASA"` araması yaparak hiçbir kullanıcı arayüzünde NASA ifadesi kalmadığını doğrula.
