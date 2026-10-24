# CURRENT SYSTEM SOURCE OF TRUTH (AŞAMA 43)

**Sistem:** Teknolojik Evrim Takvimi (2026–2060)  
**Versiyon:** Aşama 43 — Core Product Integrity, Security, Decision Engine & Epistemic Consolidation  
**Tarih:** Ekim 2026  
**Durum:** Üretim Onaylı (Production Validated)

---

## 1. MİMARİ VE BİLEŞEN HARİTASI

Teknolojik Evrim Takvimi, 2026–2060 yılları arasındaki 35 ana bilimsel ve teknolojik dönüm noktasını, arXiv/OpenAlex açık bilim makaleleri ve Telegram istihbarat havuzlarıyla dinamik olarak besleyen, kullanıcı profilini bu kırılmalara göre kişiselleştirip eylem döngüsüne bağlayan çift yönlü bir karar motorudur.

```
Dünya (Gerçek Gelişmeler: arXiv, OpenAlex, Telegram Radar)
                     ↓
Otonom Doğrulama & Sinyal Eşleme (/api/telegram/living-timeline)
                     ↓
Dönüm Noktası (2026–2060 Milestone Baseline)
  ├── canonicalDescription (Değişmez Özgün Bilimsel Tanım)
  └── liveSignalAnnotation (Canlı Kanıt ve Model İvmesi)
                     ↓
Çok Boyutlu Dinamik Etki Motoru (Dynamic Impact Assessment: MODEL PROJECTION ≠ FACT)
  ├── adoptionReadiness (TRL 1–9)
  ├── infrastructureDependency (Ecosystem Blocker / Capex)
  ├── regulatoryFriction (Kısıt & Darboğaz)
  └── commercialReadiness
                     ↓
Kişisel Etki (Personal Timeline Engine: Yaş, Meslek, Rol, Sektör)
                     ↓
3 Alternatif Stratejik Karar Yolu (Options A, B, C)
  ├── Kullanıcı Kararı (userDecision: Dokunulmaz & Kalıcı)
  └── Model Tavsiyesi (modelRecommendation: Tavsiye / Ayrı State)
                     ↓
Kişiselleştirilmiş Gelecek Yol Haritası (Roadmap Steps & Checkpoints)
                     ↓
Eylem İlerleme Döngüsü (Seen → Planned → In Progress → Completed)
                     ↓
Sonuç Semantiği ve Objektif Doğrulama Ayrımı (Outcome Semantics)
  ├── ACTION_COMPLETED_PENDING_REVIEW (Tamamlandı, Kullanıcı Gözden Geçirmesi Bekleniyor)
  ├── USER_REPORTED_POSITIVE_RESULT (Kullanıcı Tarafından Beyan Edilen Pozitif Sonuç)
  ├── PIVOT_NEEDED / USER_REPORTED_FRICTION (Uygulamada Tıkanma / Alternatif Yola Geçiş)
  └── OBJECTIVE_VERIFIED_OUTCOME: NOT_COMPUTED (Dış Dünya Doğrulaması Bağımsız Süreç)
                     ↓
Canlı Sinyal ile Strateji Yeniden Değerlendirme (Closed-Loop Reassessment)
```

---

## 2. TEMEL İLKELER VE SİSTEM İNVARYANTLARI

### İnvaryant 1: `USER DECISION ≠ MODEL RECOMMENDATION`
- **Kural:** Kullanıcının açık iradesiyle seçtiği strateji (`userDecision: "A" | "B" | "C"`), modelin yeni sinyallere dayanarak ürettiği alternatif tavsiyeler (`modelRecommendation: "B"`) tarafından ASLA sessizce ezilemez veya üzerine yazılamaz.
- **Davranış:** Model bir yeniden değerlendirme tetiklediğinde (`needsReassessment: true`), arayüzde hem kullanıcının korunan kararı (`KULLANICI: YOL A`) hem de modelin önerisi (`TAVSİYE: YOL B`) ayrı ayrı gösterilir. Kullanıcı açıkça "Bu Stratejiyi Seç" butonuna basmadıkça `userDecision = "A"` olarak kalır.
- **Denetim:** `src/utils/phase43CoreProductIntegrity.test.ts` ve `phase42AdversarialDecisionIntegrity.test.ts` ile sürekli test edilir.

### İnvaryant 2: `ACTION_COMPLETED ≠ SUCCESSFUL_OUTCOME`
- **Kural:** Bir kullanıcının eylemi "Tamamlandı" olarak işaretlemesi, dış dünyada yetkinlik veya objektif başarı elde edildiği anlamına gelmez.
- **Davranış:**
  1. Not girilmeden tamamlanan eylemler: `outcomeStage = "completed_unreviewed"` ve `outcomeSemantics = "ACTION_COMPLETED_PENDING_REVIEW"`.
  2. Kullanıcı notunda sürtünme/tıkanma bildirdiğinde: `outcomeStage = "friction_pivot_needed"` ve `outcomeSemantics = "PIVOT_NEEDED"`.
  3. Gerçek dünya doğrulaması: `OBJECTIVE_VERIFIED_OUTCOME: NOT_COMPUTED`. Sistemin kullanıcıya yapay veya asılsız "başardınız" onayı vermesi engellenmiştir.

### İnvaryant 3: `MODEL PROJECTION ≠ FACT` (Epistemik Dürüstlük)
- **Kural:** Dinamik ufuk kaymaları (-1 yıl, +2 yıl vb.) ve TRL hazır oluş puanları fiziksel kesin gerçeklik değil, heuristik model projeksiyonlarıdır.
- **Davranış:**
  1. Tüm dinamik etki hesaplamaları `epistemicStatus: "MODEL_PROJECTION_NOT_FACT"` etiketi ve yasal sorumluluk reddiyle (`disclaimer`) üretilir.
  2. Tek bir `yearShift` sayısına aşırı güvenmek yerine 10 boyutlu hazır oluş matrisi (TRL, altyapı, regülasyon, ticarileşme, imalat, dağıtım, sinyal gücü, kanıt kalitesi, güven skoru, çelişki düzeyi) hesaplanır.
  3. DAG görselleştiricisi "Mutlak Nedensellik" yerine "Model Bağımlılık ve Etkileşim Grafiği (Projected Model DAG)" olarak adlandırılmıştır.

### İnvaryant 4: Değişmez Özgün Tanım (`canonicalDescription`)
- **Kural:** 2026–2060 arası her dönüm noktasının orijinal bilimsel baseline tanımı (`canonicalDescription`) veritabanında ve state'te korunur. Canlı istihbarattan gelen anlık dinamikler `liveSignalAnnotation` altında ayrı olarak saklanır.

---

## 3. GÜVENLİK VE DIŞ YÜZEY SERTLEŞTİRMESİ

1. **Telegram Bridge Secret (Fail-Closed):**
   - Eski durum: `process.env.TELEGRAM_BRIDGE_SECRET || "futuristic-telegram-bridge-2026"`
   - Yeni durum: `TELEGRAM_BRIDGE_SECRET` ortam değişkeni tanımlı değilse veya istekteki anahtarla eşleşmiyorsa, yönetici oturumu yoksa istek derhal `403 Forbidden` ile reddedilir.
   - Batch Payload Limiti: `/api/telegram/ingest` uç noktasına tek seferde en fazla 100 mesaj gönderilebilir (DoS koruması).

2. **Admin Parola Doğrulaması (Fail-Closed in Production):**
   - Eski durum: Ortam değişkeni yoksa varsayılan test parolalarına izin veriliyordu.
   - Yeni durum: `process.env.NODE_ENV === "production"` durumunda `ADMIN_SECRET_PASSCODE` tanımlanmamışsa admin parolaları kümesi boş kalır (`new Set([])`) ve tüm varsayılan parola denemeleri reddedilir.

3. **Maliyetli AI Uç Noktalarının Yetkilendirilmesi:**
   - `/api/telegram/rescan-group`: Yalnızca doğrulanmış yönetici (`isReqAdmin`) çalıştırabilir.
   - `/api/telegram/deep-analyze`: Yalnızca oturum açmış doğrulanmış kullanıcı veya yönetici çalıştırabilir.
   - `/api/academic/sync-all`: Toplu 35 dönüm noktası çekimi yalnızca yönetici tarafından tetiklenebilir.

4. **Sert Kodlanmış API Anahtarlarının Temizlenmesi:**
   - OpenAlex sorgularında yer alan eski statik fallback anahtarı (`"CdtW8d9jRO3uBYsoucRZWs"`) kaldırılmış; açık bilim nezaket havuzu (`mailto: warfacelove46@gmail.com`) ve `process.env.OPENALEX_API_KEY` üzerinden güvenli yapılandırma sağlanmıştır.

---

## 4. ESKİ RAPORLAR VE KOD ARASINDAKİ ÇELİŞKİLERİN ÇÖZÜMÜ

| Konu | Eski Rapor / Varsayım | Gerçek Kod Durumu (Aşama 43) | Çözüm |
|---|---|---|---|
| **Karar Seçimi** | "Model en iyi seçeneği seçer" | Kullanıcı seçimi (`userDecision`) ve model tavsiyesi (`modelRecommendation`) iki ayrı veri yoludur. | Kullanıcı kararı kalıcı kılındı; model tavsiyesi bağımsız tutuldu. |
| **Tamamlanma Durumu** | "Eylemi tamamlayan başarı rozeti alır" | Kişisel beyan dış dünyada doğrulanmış başarı değildir. | `ACTION_COMPLETED_PENDING_REVIEW` ve `OBJECTIVE_VERIFIED_OUTCOME: NOT_COMPUTED` eklendi. |
| **Zaman Ufku** | "TRL 8 kesin 1 yıl öne çeker" | Bilimsel zaman tahmini çok boyutlu bir heuristiktir. | `DynamicImpactAssessment` ile 10 boyutlu hazır oluş matrisine bağlandı. |
| **Telegram Bridge** | Varsayılan fallback parola ile açık köprü | Açık köprü güvenlik açığıdır. | `process.env.TELEGRAM_BRIDGE_SECRET` ile fail-closed yapıldı. |
| **DAG Grafiği** | "Matematiksel kesin fiziksel nedensellik" | Teknolojik önkoşul ve model varsayımıdır. | "Model Bağımlılık & Etkileşim Grafiği (Projected Model DAG)" olarak düzeltildi. |

---

## 5. TEST DOĞRULAMASI VE SAĞLAMLIK RAPORU

- **Test Dosyası:** `src/utils/phase43CoreProductIntegrity.test.ts`
- **Kapsam:**
  - Kullanıcı Kararı Dokunulmazlığı (Adversarial live signal test)
  - Seçim Geçmişi Denetimi (Decision History Audit)
  - Sonuç Semantiği Ayrıştırması (Action Completed vs Real-World Mastery)
  - Çok Boyutlu Hazırlık Analizi (Epistemic Status Check)
  - Değişmez Özgün Tanım Korunumu (Canonical Baseline)
- **Sonuç:** 8 testin tamamı başarılı (Pass: 8/8).
