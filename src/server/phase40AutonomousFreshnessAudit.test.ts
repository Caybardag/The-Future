/**
 * AŞAMA 40 — GELECEK TAKVİMİ: 7/24 OTONOM GÜNCELLENME VE ÜRÜN TAMAMLAMA DENETİM TESTİ
 * 
 * Bu test paketi:
 * 1. 7/24 Otonom Veri Akışı & 5 Dakikalık Scheduler Kontrolü
 * 2. Canlı Sinyal → Milestone Otomatik Eşleştirme ve Diske Kalıcı Kayıt
 * 3. Hata İzolasyonu, Çok Kaynaklı Dayanıklılık & Başarısızlık Durumu Dürüstlüğü
 * 4. Tekrar Eden Kayıt / Deduplication Güvenliği
 * 5. Canlı Sinyalin Dönüm Noktası Projeksiyonuna Gerçek Etkisi
 * 6. UI Freshness (Doğrulanmış Son Kontrol & Aktif Dinleyici) Durum Doğrulaması
 */

import { describe, it, expect, beforeEach, afterEach } from "vitest";
import fs from "fs";
import path from "path";
import { TIMELINE_DATA } from "../data/timelineData";
import {
  telegramIntelligenceFeed,
  ingestRawTelegramMessageFirst,
  autoMatchAllSignalsToMilestones,
  matchSignalToMilestone,
  saveTelegramVaultToDisk,
  loadTelegramVaultFromDisk,
  startAutonomousIngestionScheduler,
  stopAutonomousIngestionScheduler,
  getAutonomousIngestionStatus,
  runAutonomousIngestionCycleOnce,
  synthesizeLivingMilestoneOverrides,
  RawTelegramMessage,
  ExtractedTelegramIntelligence,
} from "./telegramIngestionEngine";
import { deriveMilestoneActionPlan } from "../utils/personalTimelineEngine";

describe("AŞAMA 40: 7/24 Otonom Güncellenme ve Canlı İstihbarat Entegrasyonu", () => {
  beforeEach(() => {
    stopAutonomousIngestionScheduler();
  });

  afterEach(() => {
    stopAutonomousIngestionScheduler();
  });

  describe("1. Otonom Arka Plan Scheduler & 5 Dakikalık Döngü", () => {
    it("startAutonomousIngestionScheduler 5 dakikalık periyotta aktifleşmeli ve durumu raporlamalıdır", () => {
      startAutonomousIngestionScheduler(() => null, 5);
      const status = getAutonomousIngestionStatus();

      expect(status.isSchedulerActive).toBe(true);
      expect(status.intervalMinutes).toBe(5);
      expect(status.syncStatus).toBe("SUCCESS");
      expect(status.lastCheckTime).toBeTruthy();
      expect(status.lastSuccessfulSyncTime).toBeTruthy();
      expect(["Webhook/Bot Active", "Autonomous Background Poller (5 min)"]).toContain(status.activeListenerMode);

      stopAutonomousIngestionScheduler();
      const stoppedStatus = getAutonomousIngestionStatus();
      expect(stoppedStatus.isSchedulerActive).toBe(false);
    });

    it("runAutonomousIngestionCycleOnce çağrıldığında döngü tamamlanmalı ve lastCheckTime güncellenmelidir", async () => {
      const beforeTime = new Date().toISOString();
      const success = await runAutonomousIngestionCycleOnce(null);

      expect(success).toBe(true);
      const status = getAutonomousIngestionStatus();
      expect(status.syncStatus).toBe("SUCCESS");
      expect(status.lastError).toBeNull();
      expect(new Date(status.lastCheckTime).getTime()).toBeGreaterThanOrEqual(new Date(beforeTime).getTime() - 1000);
    });
  });

  describe("2. Canlı Sinyal → Milestone Otomatik Eşleştirme ve Kalıcı Kayıt", () => {
    it("yeni bir ham Telegram sinyali geldiğinde otomatik olarak ilgili milestone ile eşleştirilmelidir", () => {
      const uniqueMsgId = `test_msg_${Date.now()}`;
      const rawMsg: RawTelegramMessage = {
        id: uniqueMsgId,
        channelId: "tech_breakthroughs",
        channelTitle: "Frontier AI & Robotics",
        text: "Unitree and Boston Dynamics revealed autonomous humanoid robot agile navigation achieving 99% factory floor automation.",
        date: new Date().toISOString(),
      };

      const record = ingestRawTelegramMessageFirst(rawMsg);

      expect(record.matchedMilestoneYear).toBeDefined();
      expect(record.matchedMilestoneTitle).toBeDefined();
      expect(record.matchConfidence).toBeGreaterThanOrEqual(35);
      expect(record.isIntegrated).toBe(true);

      // Verify that the record is in memory feed
      const inFeed = telegramIntelligenceFeed.find((f) => f.id === record.id);
      expect(inFeed).toBeDefined();
      expect(inFeed?.matchedMilestoneYear).toBe(record.matchedMilestoneYear);
    });

    it("autoMatchAllSignalsToMilestones disk kasasını güncellemeli ve diskten okunduğunda eşleşmeler korunmalıdır", () => {
      const vaultPath = path.join(process.cwd(), "src", "data", "telegram_intelligence_vault.json");
      expect(fs.existsSync(vaultPath)).toBe(true);

      // Run matching on all current feed items
      const matchedCount = autoMatchAllSignalsToMilestones(TIMELINE_DATA);
      expect(matchedCount).toBeGreaterThan(0);

      // Read disk file directly to verify persistence
      const diskContent = fs.readFileSync(vaultPath, "utf-8");
      const diskItems: ExtractedTelegramIntelligence[] = JSON.parse(diskContent);
      expect(diskItems.length).toBeGreaterThan(0);

      const diskMatched = diskItems.filter((item) => item.matchedMilestoneYear);
      expect(diskMatched.length).toBeGreaterThan(0);
      expect(diskMatched.length).toBe(diskItems.length); // 100% of signals matched
    });
  });

  describe("3. Tekrar Eden Kayıt / Deduplication Dayanıklılığı", () => {
    it("aynı Telegram iletisi birden fazla kez geldiğinde kopya kayıt oluşturulmamalıdır", () => {
      const uniqueMsgId = `dedup_test_${Date.now()}`;
      const rawMsg: RawTelegramMessage = {
        id: uniqueMsgId,
        channelId: "singularity_hub",
        channelTitle: "Singularity Hub",
        text: "Solid-state lithium silicon battery packs achieve 800 Wh/kg energy density in automotive lab road testing.",
        date: new Date().toISOString(),
      };

      const initialCount = telegramIntelligenceFeed.length;
      const firstIngest = ingestRawTelegramMessageFirst(rawMsg);
      const afterFirstCount = telegramIntelligenceFeed.length;

      expect(afterFirstCount).toBe(initialCount + 1);

      // Re-ingest exact same message
      const secondIngest = ingestRawTelegramMessageFirst(rawMsg);
      const afterSecondCount = telegramIntelligenceFeed.length;

      expect(afterSecondCount).toBe(afterFirstCount); // Zero duplicate rows added
      expect(secondIngest.id).toBe(firstIngest.id);
    });
  });

  describe("4. Çok Kaynaklı İzolasyon & Hata Dayanıklılığı", () => {
    it("Bot API veya belirli bir kanal kullanılamadığında sistem kilitlenmemeli, diğer kaynaklar çalışmalıdır", async () => {
      // Temporarily mock an unreachable channel
      process.env.TELEGRAM_CHANNELS = "non_existent_mock_channel_404_test";
      
      const success = await runAutonomousIngestionCycleOnce(null);
      // Even with unreachable channel, cycle finishes gracefully without unhandled crashes
      expect(success).toBe(true);

      const status = getAutonomousIngestionStatus();
      expect(status.syncStatus).toBe("SUCCESS");

      delete process.env.TELEGRAM_CHANNELS;
    }, 20000);
  });

  describe("5. Canlı Sinyalin Dönüm Noktası Projeksiyonuna ve Downstream Karara Etkisi", () => {
    it("dönüm noktasıyla eşleşen canlı sinyal, living milestone overrides üzerinden olasılık ve açıklama güncellemeli", () => {
      const overrides = synthesizeLivingMilestoneOverrides(TIMELINE_DATA);

      expect(overrides).toBeDefined();
      expect(Object.keys(overrides.liveSignalsByYear).length).toBeGreaterThan(0);

      // Check if at least one milestone year received calibrated dynamic probability
      const updatedYears = Object.keys(overrides.updatedProbabilities).map(Number);
      expect(updatedYears.length).toBeGreaterThan(0);

      // Check if description got augmented with live intelligence citation
      const descYears = Object.keys(overrides.updatedDescriptions).map(Number);
      expect(descYears.length).toBeGreaterThan(0);
      const sampleDesc = overrides.updatedDescriptions[descYears[0]];
      expect(sampleDesc).toContain("CANLI İSTİHBARAT");
    });

    it("canlı sinyaller personalTimelineEngine eylem planında hızlandırılmış kontrol ve uyarı tetiklemelidir", () => {
      const milestone = TIMELINE_DATA.find((m) => m.year === 2028) || TIMELINE_DATA[0];
      const breakthroughSignal = {
        id: "live_test_signal_1",
        title: "Breakthrough Solid-State Battery Commercial Pilot Production",
        summary: "Automotive battery pilot plant produces first generation cells with high yield breakthrough.",
        extractedYear: milestone.year,
        matchedMilestoneYear: milestone.year,
        trlLevel: 7,
        impactVerdict: "HIGH_BREAKTHROUGH" as const,
        channelTitle: "Energy Tech Wire",
      };

      const plan = deriveMilestoneActionPlan(
        milestone,
        null,
        null,
        "A",
        "completed",
        null,
        [breakthroughSignal]
      );

      expect(plan.hasLiveBreakthroughAcceleration).toBe(true);
      expect(plan.liveSignalNotice).toBeDefined();
      expect(plan.liveSignalNotice).toContain("Canlı İstihbarat Uyarısı");
      expect(plan.reviewCheckpoint).toContain("Canlı İstihbarat İvmesi ⚡");
    });
  });

  describe("6. UI Freshness & Telemetry Gösterim Verisi", () => {
    it("getAutonomousIngestionStatus kullanıcı arayüzü için gerekli tüm telemetry ve tazelik alanlarını sağlamalıdır", () => {
      const status = getAutonomousIngestionStatus();

      expect(status).toHaveProperty("isSchedulerActive");
      expect(status).toHaveProperty("intervalMinutes");
      expect(status).toHaveProperty("lastCheckTime");
      expect(status).toHaveProperty("lastSuccessfulSyncTime");
      expect(status).toHaveProperty("syncStatus");
      expect(status).toHaveProperty("lastError");
      expect(status).toHaveProperty("totalSignalsInVault");
      expect(status).toHaveProperty("matchedSignalsCount");
      expect(status).toHaveProperty("activeListenerMode");

      expect(status.intervalMinutes).toBe(5);
      expect(status.matchedSignalsCount).toBeGreaterThan(0);
      expect(status.matchedSignalsCount).toBe(status.totalSignalsInVault);
    });
  });
});
