/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * 📡 TEKNOLOJİK EVRİM 2026-2060 | TELEGRAM İSTİHBARAT TEST VE BESLEME MOTORU
 * ═══════════════════════════════════════════════════════════════════════════════
 * Bu script, Telegram kanallarından gelen gerçekçi haber akışını simüle eder
 * veya doğrudan /api/telegram/ingest uç noktasına veri gönderir.
 * 
 * Çalıştırma:
 *   npx tsx scripts/telegram_sync.ts
 */

import fetch from "node-fetch";

const APP_INGEST_URL = process.env.APP_INGEST_URL || "http://localhost:3000/api/telegram/ingest";

const SAMPLE_TELEGRAM_MESSAGES = [
  {
    id: 104201,
    channelId: "-1001091087098",
    channelTitle: "Yapay Zeka & Bilişim İstihbaratı",
    text: "🚨 BREAKING: OpenAI ve TSMC, 1.4nm Angstrom sınıfı 3D istiflenmiş fotonik AGI işlemcisinin ilk silikon testlerini tamamladı. 2028 yılına kadar ticari veri merkezlerinde 100 milyon eşzamanlı otonom ajanın tek bir kümede eğitilebileceği açıklandı.",
    date: new Date().toISOString(),
    views: 14200,
    forwards: 890,
  },
  {
    id: 104202,
    channelId: "-1002747343915",
    channelTitle: "Biyoteknoloji & Gelecek Trendleri",
    text: "🧬 YENİ BİLİMSEL ATILIM: MIT ve Stanford ortaklığıyla geliştirilen epigenetik CRISPR-4.0 vektörleri, primatlarda hücresel yaşlanmayı %42 oranında geriye döndürdü. 2030 yılı için Faz 1 insan klinik deneylerine başlanacağı duyuruldu.",
    date: new Date().toISOString(),
    views: 8900,
    forwards: 612,
  },
  {
    id: 104203,
    channelId: "-1001091087098",
    channelTitle: "Yapay Zeka & Bilişim İstihbaratı",
    text: "⚡ Nükleer Füzyon ve Süperiletkenlik: Helion Energy, 2029 yılı için planlanan manyeto-ataletsel füzyon reaktörünün net pozitif elektrik üretim aşamasına ulaştığını duyurdu. Enerji maliyetlerinde megawatt başına %80 düşüş öngörülüyor.",
    date: new Date().toISOString(),
    views: 11500,
    forwards: 730,
  },
  {
    id: 104204,
    channelId: "-1002747343915",
    channelTitle: "Biyoteknoloji & Gelecek Trendleri",
    text: "🌐 Neuralink ve BCI konsorsiyumu, 64.000 elektrotlu kablosuz optik nöral implantı tanıttı. Görme engellilerde doğrudan görsel kortekse 4K çözünürlükte sentetik görüş aktarımı 2027 itibarıyla regülasyon onayına sunuluyor.",
    date: new Date().toISOString(),
    views: 19800,
    forwards: 1450,
  },
];

async function runTestSync() {
  console.log("🔄 Telegram mesajları sunucu AI Ingestion motoruna gönderiliyor...");
  console.log(`🔗 Hedef URL: ${APP_INGEST_URL}`);

  try {
    const res = await fetch(APP_INGEST_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(SAMPLE_TELEGRAM_MESSAGES),
    });

    const data = await res.json();
    console.log("✅ Başarılı Sunucu Yanıtı:", JSON.stringify(data, null, 2));
  } catch (error) {
    console.error("❌ Veri gönderme hatası:", error);
  }
}

runTestSync();
