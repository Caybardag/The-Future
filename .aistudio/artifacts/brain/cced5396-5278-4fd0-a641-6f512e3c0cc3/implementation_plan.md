# 35 Dönüm Noktası İçin Görsel ve Teknik Parametre Odaklı Ayrıntılı Veri Tabloları & Gemini 3.8 Flash Standardizasyonu

Bu plan; takvimdeki 35 kanonik dönüm noktasının (2026–2060) sadece 1-2 cümlelik statik özetlerle sınırlı kalmasını ortadan kaldırarak her maddeye zengin görsel ve teknik parametre veri tabloları kazandırmayı, sistem genelindeki tüm yapay zeka analizlerini kullanıcının onayladığı resmi `gemini-3.8-flash` modeline bağlamayı ve sandbox ortamı kısıtları çerçevesinde en yüksek hız ve derinliği sağlamayı amaçlar.

---

## User Review & Critical Decisions

> [!IMPORTANT]
> Kullanıcı ile soru-cevap sürecinde kesinleştirilen temel tercihler ve mimari kararlar:

- **Confirmed Decision 1 (İçerik Derinliği ve Formatı)**: Kullanıcı, kısa metinler yerine **"Görsel ve teknik parametre odaklı ayrıntılı veri tabloları"** tercihini seçti. 35 dönüm noktasının her biri için; TRL olgunluk seviyesi, termodinamik ve Carnot verimi, FLOPs hesaplama gücü ihtiyacı, enerji yoğunluğu (Wh/kg), regülasyon uyumu, biyo-entegrasyon yüzdesi ve pazar olgunluk metrikleri yapılandırılmış teknik veri tablolarında (`tabular-nums font-mono`) sunulacak.
- **Confirmed Decision 2 (Yapay Zeka Modeli & Yerel Model Açıklığı)**: 
  - Projede kullanılan modelin resmi olarak **`gemini-3.8-flash`** olduğu teyit edildi. Kod tabanında kalan eski model atıfları (2.5, 2.0 veya 3.7) tamamen `gemini-3.8-flash` modeline standardize edilecek.
  - AI Studio sandbox ortamının kısıtları (yalnızca CPU, kısıtlı RAM/disk, geçici sanal konteyner) nedeniyle içeride yerel Ollama/GGUF model indirme ve çalıştırma yapılmayacak; kullanıcı harici sunucuya bağlanmak istemediği için sistem %100 oranında Google Cloud üzerinde yüksek hızda çalışan resmi `@google/genai` API ve `gemini-3.8-flash` motorunu kullanacak.

---

## 1. Overview & Core Concept

- **Problem**: 
  1. Takvim kartlarında ve görünüm panellerinde açıklamalar yalnızca 1-2 cümlelik özetlerden (`description`) oluşuyor ve arayüzde `line-clamp-2` / `line-clamp-3` gibi sınırlamalarla metinler kesiliyordu.
  2. Bilimsel veriler (termodinamik, TRL, enerji, işlemci gücü) dağınık veya statik metinler olarak kalıyor, kullanıcının inceleyebileceği derin teknik veri tabloları halinde gösterilmiyordu.
  3. `server.ts` ve bazı servislerde model adı değişkenlik gösteriyordu.
- **Çözüm**:
  1. **Teknik Parametre Veri Tablosu Matrisi (`MilestoneTechnicalDataTable.tsx`)**: Her 35 kanonik dönüm noktası için spesifik fiziksel, mühendislik ve biyomedikal parametrelerini (Örn: 2028 Katı Hal Batarya için `480 Wh/kg`, `Carnot Verimi %82`, `Dendritik Baskılama 1000 Bar`, `TRL 7/9`, `Sertifikasyon ISO-26262`) içeren yüksek yoğunluklu, bilimsel laboratuvar tarzı veri tablosu oluşturulur.
  2. **Metin Kırpma Engellerinin Kaldırılması**: Kartlarda ve detay görünümlerinde karakter sınırı sınırlaması gevşetilir; kullanıcı tek tıkla "Teknik Spesifikasyon Tablosu"nu açıp tüm ampirik göstergeleri inceleyebilir.
  3. **Model Standardizasyonu**: Sistem genelinde (arka plan beyin motoru, gerçek dünya radarı, akademik literatür çıkarımı ve telemetri) tek merkezî model olarak `gemini-3.8-flash` kullanılır.

---

## 2. User Experience & Visual Design

Bilimsel ve laboratuvar veri standartlarına (`8_science_space_biotech.md` referansı) uygun olarak, gereksiz hap kutucuklar (pills) yerine hassas hizalanmış kılavuz çizgileri, tabular monospace rakamlar ve net veri hiyerarşisi uygulanacaktır:

### Görsel ve Teknik Parametre Tablosu Düzeni (ASCII Spesifikasyonu):

```
┌───────────────────────────────────────────────────────────────────────────────────────────────┐
│ 2028 · KATI HAL (SOLID-STATE) BATARYA DEVRİMİ                               [TRL-7 / PROTOCOL]│
│ Bilimsel & Mühendislik Spesifikasyon Tablosu (Gelişmiş Parametre Matrisi)                     │
├────────────────────────────┬─────────────────────────────┬──────────────┬─────────────────────┤
│ TEKNİK PARAMETRE           │ NOMİNAL HEDEF DEĞER         │ TAHMİNİ 2026 │ DOĞRULAMA / LİMİT   │
├────────────────────────────┼─────────────────────────────┼──────────────┼─────────────────────┤
│ Gravimetrik Enerji         │ 480 Wh/kg                   │ 270 Wh/kg    │ Carnot & Termodinamik│
│ Volumetrik Yoğunluk        │ 1150 Wh/L                   │ 720 Wh/L     │ Lityum Dendrit Sınırı│
│ Hızlı Şarj Süresi (10-80%) │ 9.5 Dakika                  │ 24.0 Dakika  │ Joule Isınma Eşiği  │
│ Şarj Döngü Ömrü            │ 2500+ Çevrim (0.8 Kapasite) │ 1200 Çevrim  │ Katı Elektrolit Arayüz│
│ Termal Kaçak Dayanımı      │ 180°C (Kendiliğinden Güvenli)│ 65°C         │ Yanmaz Katı Seramik │
│ TRL Olgunluk Seviyesi      │ Aşama 7 / 9                 │ Aşama 5 / 9  │ Pilot Seri Üretim   │
│ Küresel AR-GE Sermayesi    │ $48.5 Milyar (Konsorsiyum)  │ $14.2 Milyar │ Doğrulanmış Kaynak  │
└────────────────────────────┴─────────────────────────────┴──────────────┴─────────────────────┘
```

- **Tipografi**: Sayısal ölçümlerde `font-mono tabular-nums`, teknik terimlerde `font-sans font-semibold`.
- **Görsel Durum Göstergeleri**: Kritik sınır değerleri için amber (`text-amber-400`), doğrulanmış ampirik veriler için laser cyan (`text-cyan-400`), onaylanmış başarılar için zümrüt yeşili (`text-emerald-400`).

---

## 3. Key Product Decisions & Trade-Offs

- **Karar 1: Kısa Metinleri Silmek Yerine "Hızlı Özet + Derin Teknik Parametre Tablosu" Ayrımı**
  - *Neden*: Kullanıcı takvimde gezinirken hızlıca tarama yapabilmeli, ancak istediği an tek bir tıklamayla ilgili dönüm noktasının devasa teknik parametre tablosuna ve bilimsel sınırlarına ulaşabilmelidir.
  - *Fayda*: Arayüz akıcılığını bozmadan ansiklopedik derinlik ve ampirik veri sunulur.
- **Karar 2: AI Modeli Olarak Kesin Olarak `gemini-3.8-flash` Seçimi**
  - *Neden*: Kullanıcının doğrudan belirttiği gibi, AI Studio altyapısında en güncel ve kararlı API modeli `gemini-3.8-flash`'tır. Eski 2.5 veya 2.0 atıfları sistemden kaldırılarak tekil, tutarlı bir model hattı sağlanır.
- **Karar 3: Sandbox İçi Yerel Model İndirilmeyişi (Sıfır Konteyner Çökmesi Güvencesi)**
  - *Neden*: Konteyner yalnızca geçici CPU kaynaklarına sahiptir. GB'larca model ağırlığı indirmek belleği (RAM) tüketerek konteynerın kapanmasına (OOM) yol açar. Resmi `gemini-3.8-flash` API'si hem sıfır gecikmeyle çalışır hem de sistem çökme riskini tamamen ortadan kaldırır.

---

## 4. Technical Architecture & Data Strategy

### Mimari Bileşen Akışı:

```
┌─────────────────────────────────────────────────────────────────────────────┐
│ 35 KANONİK DÖNÜM NOKTASI (2026–2060)                                        │
│ (src/data/timelineData.ts + src/data/milestoneTechnicalParameters.ts)       │
└──────────────────────────────────────┬──────────────────────────────────────┘
                                       │
                                       ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│ TEKNİK PARAMETRE & AMPİRİK METRİK DEPOSU                                    │
│ - Fiziksel Sınırlar, Carnot Verimleri, Enerji Yoğunlukları, FLOPs, TRL      │
└──────────────────────────────────────┬──────────────────────────────────────┘
                                       │
                      ┌────────────────┴────────────────┐
                      ▼                                 ▼
┌───────────────────────────────────────────┐ ┌───────────────────────────────┐
│ MilestoneTechnicalDataTable.tsx           │ │ GEMINI 3.8 FLASH MERKEZİ MOTOR│
│ (Etkileşimli, Filtrelenebilir, İndirilebilir│ │ (server.ts + ReasoningEngine) │
│  Zengin Bilimsel Veri Tablosu Bileşeni)   │ │ - TRL Güncellemesi            │
└───────────────────────────────────────────┘ │ - Parametrik Canlı Sentez     │
                                              └───────────────────────────────┘
```

### Yapılacak Somut Değişiklikler:
1. `src/data/milestoneTechnicalParameters.ts` dosyasının oluşturulması: 35 kanonik dönüm noktasının tümü için en az 6-8 adet ölçülebilir mühendislik ve fiziksel parametresinin (birim, hedef değer, 2026 mevcut durumu, darboğaz/sınır ve TRL seviyesi) tanımlanması.
2. `src/components/MilestoneTechnicalDataTable.tsx` bileşeninin geliştirilmesi: Veri tablosunun hem `TimelineView` içerisindeki detay panelinde hem de `MilestoneMissionControl` altında birincil sekme olarak sunulması.
3. `server.ts` ve diğer servislerde model isimlerinin `gemini-3.8-flash` olarak standardize edilmesi.
4. Testlerin ve derlemenin (`compile_applet`, `vitest`) çalıştırılarak doğrulanması.
