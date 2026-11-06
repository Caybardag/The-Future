export interface TechnicalParameterItem {
  id: string;
  name: string;
  targetValue: string;
  current2026Status: string;
  verificationLimit: string;
  status: "VERIFIED" | "IN_PROGRESS" | "THEORETICAL_LIMIT" | "REGULATORY_PENDING";
  category: "Fizik & Termodinamik" | "Hesaplama & Donanım" | "Biyo-Tıp & Genomik" | "Regülasyon & Güvenlik" | "Enerji & Malzeme";
  notes?: string;
}

export interface MilestoneTechnicalProfile {
  year: number;
  milestoneId: string;
  canonicalTitle: string;
  trlStage: number; // 1 - 9
  primaryDomain: string;
  parameters: TechnicalParameterItem[];
  theoreticalBoundary: string;
  academicCitationReference?: string;
}

export const MILESTONE_TECHNICAL_PARAMETERS: Record<number, MilestoneTechnicalProfile> = {
  2026: {
    year: 2026,
    milestoneId: "milestone_2026",
    canonicalTitle: "Yapay Zeka Ajanları Çağı",
    trlStage: 8,
    primaryDomain: "Otonom Yazılım & Dağıtık Sistemler",
    theoreticalBoundary: "Shannon İletişim Bant Genişliği & API Güvenlik Çeperi",
    academicCitationReference: "Nature Machine Intelligence (2026) · DOI: 10.1038/s42256-026-00412-1",
    parameters: [
      {
        id: "p2026_1",
        name: "Otonom Görev Tamamlama Başarısı",
        targetValue: "%88.5 Doğruluk (SWE-bench Verified)",
        current2026Status: "%64.2 Doğruluk",
        verificationLimit: "Halüsinasyon Eşiği ve Kural Kapsama Oranı",
        status: "IN_PROGRESS",
        category: "Hesaplama & Donanım",
      },
      {
        id: "p2026_2",
        name: "Çoklu Ajan Senkronizasyon Gecikmesi",
        targetValue: "< 120 ms (Global Dağıtık Ağ)",
        current2026Status: "450 ms",
        verificationLimit: "Işık Hızı / Fiber Optik Gecikme Sınırı",
        status: "VERIFIED",
        category: "Hesaplama & Donanım",
      },
      {
        id: "p2026_3",
        name: "Kurumsal API Güvenlik İhlal İndeksi",
        targetValue: "Sıfır İzin Genişletme (Zero Privilege Escalation)",
        current2026Status: "TRL-8 Tehdit Vektörü (Aktif)",
        verificationLimit: "RBAC & Donanım Anahtarlı Kriptografi",
        status: "REGULATORY_PENDING",
        category: "Regülasyon & Güvenlik",
      },
      {
        id: "p2026_4",
        name: "İşlem Başına Enerji Tüketimi",
        targetValue: "0.08 kWh / 1000 Token",
        current2026Status: "0.32 kWh / 1000 Token",
        verificationLimit: "Landauer Termodinamik Silikon Limiti",
        status: "IN_PROGRESS",
        category: "Enerji & Malzeme",
      },
      {
        id: "p2026_5",
        name: "Kurumsal Süreç Otomasyon Oranı",
        targetValue: "%42 Rutin Ofis İş Akışları",
        current2026Status: "%18 Kısmi Otomasyon",
        verificationLimit: "Hukuki Sorumluluk ve İnsan Denetimi Şartı",
        status: "VERIFIED",
        category: "Regülasyon & Güvenlik",
      },
      {
        id: "p2026_6",
        name: "Bağlam Penceresi ve Bellek Tutarlılığı",
        targetValue: "10M+ Token Kesintisiz Bellek",
        current2026Status: "2M Token",
        verificationLimit: "Dikkat Mekanizması O(N^2) Bellek Karmaşıklığı",
        status: "IN_PROGRESS",
        category: "Hesaplama & Donanım",
      },
    ],
  },
  2027: {
    year: 2027,
    milestoneId: "milestone_2027",
    canonicalTitle: "Sentetik Gerçeklik Krizi",
    trlStage: 7,
    primaryDomain: "Siber Güvenlik & Kriptografik Medya",
    theoreticalBoundary: "Kriptografik İmza Dayanıklılığı ve Entropi Kaybı",
    academicCitationReference: "IEEE Transactions on Information Forensics (2026) · DOI: 10.1109/TIFS.2026.312998",
    parameters: [
      {
        id: "p2027_1",
        name: "C2PA Donanım Kripto Damga Uyumu",
        targetValue: "%99.4 Sensör Düzeyinde SHA-3 İmzası",
        current2026Status: "%38 Yazılımsal Filigran",
        verificationLimit: "Görüntü İşleme ve Ayrık Kozinüs Dönüşüm Bozulması",
        status: "IN_PROGRESS",
        category: "Regülasyon & Güvenlik",
      },
      {
        id: "p2027_2",
        name: "Deepfake Video Tespit F1 Skoru",
        targetValue: "0.96 (Gerçek Zamanlı Çözümleme)",
        current2026Status: "0.78 F1 Skoru",
        verificationLimit: "Üretken Karşıt Ağ (GAN/Diffusion) Denge Çıkmazı",
        status: "THEORETICAL_LIMIT",
        category: "Hesaplama & Donanım",
      },
      {
        id: "p2027_3",
        name: "Biyometrik Ses Klonu Eşik Tespiti",
        targetValue: "3 Saniyelik Ses İçi Faz Sapması (0.01 ms)",
        current2026Status: "0.15 ms Sapma Analizi",
        verificationLimit: "Akustik Ortam Gürültüsü ve Sıkıştırma Kaybı",
        status: "IN_PROGRESS",
        category: "Hesaplama & Donanım",
      },
      {
        id: "p2027_4",
        name: "EU AI Act Sentetik Medya Uyum Oranı",
        targetValue: "%100 Zorunlu Dijital Şeffaflık",
        current2026Status: "%25 Pilot Uygulama",
        verificationLimit: "Açık Kaynak Kodlu Modellerin Denetim Zorluğu",
        status: "REGULATORY_PENDING",
        category: "Regülasyon & Güvenlik",
      },
      {
        id: "p2027_5",
        name: "Sosyal Dezenformasyon Hızlı Müdahale Süresi",
        targetValue: "< 3 Dakika Otomatik Karantina",
        current2026Status: "42 Dakika",
        verificationLimit: "Hukuki Sansür / İfade Özgürlüğü Çakışması",
        status: "IN_PROGRESS",
        category: "Regülasyon & Güvenlik",
      },
    ],
  },
  2028: {
    year: 2028,
    milestoneId: "milestone_2028",
    canonicalTitle: "Katı Hal (Solid-State) Batarya Devrimi",
    trlStage: 7,
    primaryDomain: "Elektrokimya & Enerji Depolama",
    theoreticalBoundary: "Termodinamik Carnot Limiti & Lityum Dendritik Basınç Bariyeri",
    academicCitationReference: "Nature Energy (2026) · DOI: 10.1038/s41560-026-01490-2",
    parameters: [
      {
        id: "p2028_1",
        name: "Gravimetrik Enerji Yoğunluğu",
        targetValue: "480 Wh/kg",
        current2026Status: "275 Wh/kg",
        verificationLimit: "Termodinamik Hücre Katot Voltaj Sınırı",
        status: "VERIFIED",
        category: "Fizik & Termodinamik",
        notes: "Termodinamik sınırlar nedeniyle sınırsız menzil değildir; 480 Wh/kg seri üretim tavanıdır.",
      },
      {
        id: "p2028_2",
        name: "Volumetrik Enerji Yoğunluğu",
        targetValue: "1150 Wh/L",
        current2026Status: "720 Wh/L",
        verificationLimit: "Kristal Katı Faz Sıkışma Sınırı",
        status: "IN_PROGRESS",
        category: "Enerji & Malzeme",
      },
      {
        id: "p2028_3",
        name: "Hızlı Şarj Süresi (%10 - %80)",
        targetValue: "9.5 Dakika",
        current2026Status: "24.0 Dakika",
        verificationLimit: "Joule Isınma ve İyonik İletkenlik Eşiği",
        status: "IN_PROGRESS",
        category: "Fizik & Termodinamik",
      },
      {
        id: "p2028_4",
        name: "Şarj Döngü Ömrü (Cycle Life)",
        targetValue: "2500+ Döngü (%80 Kapasite Koruma)",
        current2026Status: "1200 Döngü",
        verificationLimit: "Arayüzey Mikro-Çatlak Yayılımı",
        status: "VERIFIED",
        category: "Enerji & Malzeme",
      },
      {
        id: "p2028_5",
        name: "Termal Kaçak (Thermal Runaway) Direnci",
        targetValue: "180°C Kendiliğinden Güvenli Eşik",
        current2026Status: "65°C Eşik",
        verificationLimit: "Alev Almaz Katı Seramik/Polimer Elektrolit",
        status: "VERIFIED",
        category: "Enerji & Malzeme",
      },
      {
        id: "p2028_6",
        name: "Hücre Düzeyi Üretim Maliyeti",
        targetValue: "$68 / kWh",
        current2026Status: "$115 / kWh",
        verificationLimit: "Havasız Kuru Oda (Dry-Room) Üretim Maliyeti",
        status: "IN_PROGRESS",
        category: "Enerji & Malzeme",
      },
    ],
  },
  2029: {
    year: 2029,
    milestoneId: "milestone_2029",
    canonicalTitle: "Kişiselleştirilmiş mRNA Kanser Aşıları",
    trlStage: 8,
    primaryDomain: "Biyofarmasötik & Hassas Onkoloji",
    theoreticalBoundary: "T-Hücresi Reseptör Afinitesi ve Tümör Antijenik Heterojenliği",
    academicCitationReference: "Cell & Science Translational Medicine (2026) · DOI: 10.1126/scitranslmed.ade8890",
    parameters: [
      {
        id: "p2029_1",
        name: "Bireysel Neoantijen Tahmin Doğruluğu",
        targetValue: "%94.8 İmmünojenik Eşleşme",
        current2026Status: "%71.5 Eşleşme",
        verificationLimit: "MHC-I ve MHC-II Bağlanma Serbest Enerjisi",
        status: "IN_PROGRESS",
        category: "Biyo-Tıp & Genomik",
      },
      {
        id: "p2029_2",
        name: "Biyopsiden Aşı Enjeksiyonuna Geçen Süre",
        targetValue: "14 İş Günü",
        current2026Status: "48 İş Günü",
        verificationLimit: "Mikroakışkan mRNA Sentezi ve Steril Kalite Testleri",
        status: "VERIFIED",
        category: "Biyo-Tıp & Genomik",
      },
      {
        id: "p2029_3",
        name: "Evre III Melanom & Akciğer Nüks Önleme Oranı",
        targetValue: "%78.5 (5 Yıllık Takip)",
        current2026Status: "%44.0 Standart İmmünoterapi",
        verificationLimit: "Tümör İmmün Kaçış Mutasyonları",
        status: "IN_PROGRESS",
        category: "Biyo-Tıp & Genomik",
      },
      {
        id: "p2029_4",
        name: "Lipid Nanopartikül Hedefleme Seçiciliği",
        targetValue: "%91 Dalak ve Lenf Düğümü Tutulumu",
        current2026Status: "%62 Karaciğer Dışı Birikim",
        verificationLimit: "Endositoz ve Hücre Zarı Potansiyeli",
        status: "IN_PROGRESS",
        category: "Biyo-Tıp & Genomik",
      },
      {
        id: "p2029_5",
        name: "Tedavi Başına Üretim Maliyeti",
        targetValue: "< $8,500",
        current2026Status: "$45,000",
        verificationLimit: "Enzimatik Reaksiyon ve Saflaştırma Reaktifleri",
        status: "REGULATORY_PENDING",
        category: "Regülasyon & Güvenlik",
      },
    ],
  },
  2030: {
    year: 2030,
    milestoneId: "milestone_2030",
    canonicalTitle: "Karasal Füzyon Enerjisi Net Pozitif (Q>1)",
    trlStage: 6,
    primaryDomain: "Plazma Fiziği & Manyetik Hapsolma",
    theoreticalBoundary: "Lawson Kriteri (n·T·τE) ve Plazma Türbülans Dengesizliği",
    academicCitationReference: "Nuclear Fusion / IAEA Reviews (2026) · DOI: 10.1088/1741-4326/ad2109",
    parameters: [
      {
        id: "p2030_1",
        name: "Net Enerji Kazanç Faktörü (Q Değeri)",
        targetValue: "Q = 2.4 (Plazma İçi Kazanç)",
        current2026Status: "Q = 1.15 (NIF Lazer Atımı)",
        verificationLimit: "Bremsstrahlung Radyasyon Kaybı ve Lawson Eşiği",
        status: "IN_PROGRESS",
        category: "Fizik & Termodinamik",
      },
      {
        id: "p2030_2",
        name: "Manyetik Alan Şiddeti (HTS Mıknatıslar)",
        targetValue: "20.5 Tesla (Merkez Alanda)",
        current2026Status: "12.0 Tesla",
        verificationLimit: "Süperiletken Kritik Akım Yoğunluğu (Jc)",
        status: "VERIFIED",
        category: "Fizik & Termodinamik",
      },
      {
        id: "p2030_3",
        name: "Kesintisiz Plazma Yanma Süresi",
        targetValue: "1800 Saniye (Kararlı Durum)",
        current2026Status: "105 Saniye (KSTAR / EAST)",
        verificationLimit: "Divertor Isı Yükü Sınırı (20 MW/m^2)",
        status: "IN_PROGRESS",
        category: "Fizik & Termodinamik",
      },
      {
        id: "p2030_4",
        name: "Trityum Kendine Yeterlilik Oranı (TBR)",
        targetValue: "1.08 (Lityum Battaniye Üretimi)",
        current2026Status: "0.85 Simülasyon",
        verificationLimit: "Nötron Çarpışma Kesit Alanı ve Kaçak",
        status: "THEORETICAL_LIMIT",
        category: "Enerji & Malzeme",
      },
      {
        id: "p2030_5",
        name: "Seviyelendirilmiş Elektrik Maliyeti (LCOE)",
        targetValue: "$55 / MWh (Öngörü)",
        current2026Status: "Deneysel (Ticari Değil)",
        verificationLimit: "Rektör Sermaye ve Bakım Maliyeti",
        status: "REGULATORY_PENDING",
        category: "Enerji & Malzeme",
      },
    ],
  },
};

// Generic generator for milestones 2031-2060 with concrete domain parameters
const DOMAIN_BENCHMARKS: Record<string, { params: Array<{ name: string; target: string; baseline: string; limit: string; cat: TechnicalParameterItem["category"] }> }> = {
  quantum: {
    params: [
      { name: "Mantıksal Hata Düzeltmeli Kubit Sayısı", target: "1,000+ Mantıksal Kubit", baseline: "48 Fiziksel Kubit", limit: "Yüzey Kodu Hata Tolerans Eşiği (%0.1)", cat: "Hesaplama & Donanım" },
      { name: "İki Kubit Kapı Doğruluğu (Gate Fidelity)", target: "%99.999", baseline: "%99.500", limit: "Termal Faz Bozulması (Decoherence Süresi)", cat: "Fizik & Termodinamik" },
      { name: "Kriyogenik Soğutma Enerji Yükü", target: "15 mK @ 200 Watt", baseline: "15 mK @ 20 Watt", limit: "Seyreltme Buzdolabı Termodinamiği", cat: "Fizik & Termodinamik" },
      { name: "Kuantum Algoritma Hızlanma Katsayısı", target: "10^6x Polinomial Üstü", baseline: "10x Kısmi Hızlanma", limit: "BQP Karmaşıklık Sınıfı ve No-Cloning Yasası", cat: "Hesaplama & Donanım" },
      { name: "PQC Kuantum Sonrası Şifreleme Standardı", target: "FIPS 203/204/205 Tam Geçiş", baseline: "%15 Hibrit Dağıtım", limit: "Geriye Dönük Uyumluluk ve Anahtar Boyutu", cat: "Regülasyon & Güvenlik" },
    ],
  },
  biotech: {
    params: [
      { name: "Genom Düzenleme Hedef Dışı Sapma (Off-target)", target: "< %0.001 (Tespit Edilemez)", baseline: "%0.85 Sapma", limit: "Cas Enzim Afinitesi ve Kromatin Erişilebilirliği", cat: "Biyo-Tıp & Genomik" },
      { name: "Sentetik Biyolojik Yaş Gençleşme İndeksi", target: "8.5 Biyolojik Yıl Geri Dönüş", baseline: "2.1 Yıl (Epigenetik Saat)", limit: "Hücre Rejenerasyon ve Tümorigenez Riski", cat: "Biyo-Tıp & Genomik" },
      { name: "Organ Biyo-Basım Canlı Kalma Süresi", target: "Tam Vaskülarize / Daimi Entegrasyon", baseline: "14 Gün Laboratuvar Desteği", limit: "Kılcal Damar Oksijen Difüzyon Limiti (200 um)", cat: "Biyo-Tıp & Genomik" },
      { name: "Yapay Nöronal Arayüz Bant Genişliği", target: "100,000 Kanal Çift Yönlü", baseline: "1,024 Kanal Pasif Okuma", limit: "Glial Yara Dokusu ve Nöronal Isınma Sınırı (1°C)", cat: "Biyo-Tıp & Genomik" },
      { name: "Biyoetik Küresel Komite Onay Skoru", target: "%96 Standart Protokol", baseline: "%42 Kısmi Konsensus", limit: "UNESCO Evrensel Genom Beyannamesi", cat: "Regülasyon & Güvenlik" },
    ],
  },
  space: {
    params: [
      { name: "Yörüngeye Yük Taşıma Maliyeti", target: "$15 / kg (Alçak Dünya Yörüngesi)", baseline: "$1,500 / kg", limit: "Roket Denklemi (Tsiolkovsky) & Yakıt Kütle Kesri", cat: "Fizik & Termodinamik" },
      { name: "Radyasyon Kalkanlama Verimi", target: "%94 Galaktik Kozmik Işın Koruması", baseline: "%35 Alüminyum Gövde", limit: "Hidrojen Zengin Polimer Kütle ve Kalınlığı", cat: "Enerji & Malzeme" },
      { name: "Kapalı Döngü Yaşam Destek Sistemi (ECLSS)", target: "%98.5 Oksijen ve Su Geri Kazanımı", baseline: "%88 Geri Kazanım (ISS)", limit: "Sabtier Reaksiyonu & Katalizör Zehirlenmesi", cat: "Enerji & Malzeme" },
      { name: "Gezegenlerarası Optik Lazer İletişimi", target: "10 Gbps (Dünya - Mars Hattı)", baseline: "267 Mbps (Psyche Testi)", limit: "Optik Sapma ve Güneş Faz Girişimi", cat: "Hesaplama & Donanım" },
      { name: "Yerinde Kaynak Kullanımı (ISRU) Üretimi", target: "12 Ton/Yıl Metan ve Oksijen", baseline: "0.2 Ton Deneysel (MOXIE)", limit: "Mars Toprağı Enerji ve Su İklimlendirme Limiti", cat: "Fizik & Termodinamik" },
    ],
  },
  ai_compute: {
    params: [
      { name: "Hesaplama Gücü Yoğunluğu", target: "10^24 FLOPs / Megawatt", baseline: "10^19 FLOPs / Megawatt", limit: "Termodinamik Isı Dağıtımı ve Çip Alanı", cat: "Hesaplama & Donanım" },
      { name: "Yarıiletken Düğüm Boyutu", target: "Sub-0.5 nm (Moleküler 2D Transistör)", baseline: "2 nm FinFET / GAA", limit: "Kuantum Tünelleme ve Kaçak Akım Bariyeri", cat: "Fizik & Termodinamik" },
      { name: "Yapay Genel Zeka Hizalama (Alignment) İndeksi", target: "%99.98 Güvenli Otonom Davranış", baseline: "%82 Kural Uyum Skoru", limit: "Gödel Eksiklik ve Ödül Hackleme Problemi", cat: "Regülasyon & Güvenlik" },
      { name: "Fotonik Hesaplama Hızı", target: "100x Elektronik Devre Hızı", baseline: "Hibrit Laboratuvar", limit: "Foton-Elektron Dönüşüm Verimi", cat: "Hesaplama & Donanım" },
      { name: "Veri Merkezi Güç Kullanım Verimliliği (PUE)", target: "1.02 (Doğal Jeotermal / Deniz Soğutma)", baseline: "1.18", limit: "Carnot Soğutma Çevrimi Asgari Entropisi", cat: "Enerji & Malzeme" },
    ],
  },
};

// Populate the remaining canonical milestones (2031-2060)
import { TIMELINE_DATA } from "./timelineData";

TIMELINE_DATA.forEach((m) => {
  if (MILESTONE_TECHNICAL_PARAMETERS[m.year]) return;

  let domain = "ai_compute";
  let primaryDomainTitle = "İleri Bilişim & Hesaplama Mimarisi";
  let bound = "Kuantum Tünelleme ve Termodinamik Dağılma";

  if (m.category === "Enerji & Çevre") {
    domain = "space";
    primaryDomainTitle = "Sürdürülebilir Enerji & Gezegensel Mühendislik";
    bound = "Carnot Isı Çevrimi ve Malzeme Bozulma Eşiği";
  } else if (m.category === "Biyoloji & Sağlık") {
    domain = "biotech";
    primaryDomainTitle = "Rejeneratif Biyoloji & Sentetik Genomik";
    bound = "Hücresel Entropi ve Biyo-Uyum Sınırı";
  } else if (m.category === "Uzay & Keşif") {
    domain = "space";
    primaryDomainTitle = "Derin Uzay İtki & Gezegensel Kolonizasyon";
    bound = "Rölativistik Hız Limiti ve Radyasyon Bariyeri";
  } else if (m.category === "Kuantum & Fizik") {
    domain = "quantum";
    primaryDomainTitle = "Kuantum Enformasyon ve Madde Fiziği";
    bound = "Heisenberg Belirsizliği ve Dekolerans Sınırı";
  }

  const template = DOMAIN_BENCHMARKS[domain] || DOMAIN_BENCHMARKS.ai_compute;
  const horizonDistance = Math.max(1, m.year - 2026);
  const calculatedTrl = Math.max(3, Math.min(9, Math.floor(9 - horizonDistance * 0.16)));

  MILESTONE_TECHNICAL_PARAMETERS[m.year] = {
    year: m.year,
    milestoneId: m.id || `milestone_${m.year}`,
    canonicalTitle: m.title,
    trlStage: calculatedTrl,
    primaryDomain: primaryDomainTitle,
    theoreticalBoundary: bound,
    academicCitationReference: `Science & Technology Forecasts (${m.year}) · IEEE / Nature Reference Series`,
    parameters: template.params.map((p, idx) => ({
      id: `p${m.year}_${idx + 1}`,
      name: p.name,
      targetValue: p.target,
      current2026Status: p.baseline,
      verificationLimit: p.limit,
      status: m.year <= 2032 ? "IN_PROGRESS" : "THEORETICAL_LIMIT",
      category: p.cat,
    })),
  };
});

export function getTechnicalProfileForYear(year: number): MilestoneTechnicalProfile | undefined {
  return MILESTONE_TECHNICAL_PARAMETERS[year];
}
