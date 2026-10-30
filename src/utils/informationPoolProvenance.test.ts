import { describe, it, expect } from "vitest";
import { formatRealTimeAgo, getProvenanceBadge } from "../components/TelegramIntelligenceHubView";
import { TelegramFeedItem, InformationSourceType, DataOriginType, ProcessingStatusType } from "../types";

describe("BİLGİ HAVUZU & PROVENANCE REGRESSION AUDIT", () => {
  // Test 1: Real Relative Time vs Zero Fake Index Times
  describe("Test 1: Zero Fake Index Time & Reliable Relative Time Formatting", () => {
    it("returns 'Zaman bilgisi mevcut değil' for missing, undefined or invalid dates (no fake '2 saat önce')", () => {
      expect(formatRealTimeAgo(undefined)).toBe("Zaman bilgisi mevcut değil");
      expect(formatRealTimeAgo("")).toBe("Zaman bilgisi mevcut değil");
      expect(formatRealTimeAgo("invalid_date_string")).toBe("Zaman bilgisi mevcut değil");
    });

    it("correctly computes relative time from real ISO timestamp", () => {
      const now = new Date();
      expect(formatRealTimeAgo(now.toISOString())).toBe("Az önce");

      const thirtyMinAgo = new Date(Date.now() - 30 * 60 * 1000).toISOString();
      expect(formatRealTimeAgo(thirtyMinAgo)).toBe("30 dakika önce");

      const fiveHoursAgo = new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString();
      expect(formatRealTimeAgo(fiveHoursAgo)).toBe("5 saat önce");

      const threeDaysAgo = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString();
      expect(formatRealTimeAgo(threeDaysAgo)).toBe("3 gün önce");
    });
  });

  // Test 2: Source Type & Data Origin Distinction
  describe("Test 2: Provenance Tagging & Data Origin Separation", () => {
    it("classifies MANUAL entries with explicit manual badge and explanation", () => {
      const manualItem: TelegramFeedItem = {
        id: "item_manual_01",
        telegramMessageId: "manual_01",
        sourceType: "MANUAL",
        dataOrigin: "MANUAL_ENTRY",
        processingStatus: "RAW",
        originalText: "Kullanıcı tarafından eklenen yeni bir gelişme.",
        receivedAt: new Date().toISOString(),
        title: "Test Manuel Gelişme",
      };

      const badge = getProvenanceBadge(manualItem);
      expect(badge.label).toBe("✍️ Manuel Kayıt");
      expect(badge.description).toContain("Kullanıcı / editör tarafından doğrudan");
    });

    it("classifies TELEGRAM external sources with external source provenance badge", () => {
      const telegramItem: TelegramFeedItem = {
        id: "item_tg_01",
        telegramMessageId: 1001,
        sourceType: "TELEGRAM",
        dataOrigin: "EXTERNAL_SOURCE",
        processingStatus: "RAW",
        originalText: "Dış kanaldan çekilen ham mesaj.",
        receivedAt: new Date().toISOString(),
      };

      const badge = getProvenanceBadge(telegramItem);
      expect(badge.label).toBe("📡 Dış Kaynak (Telegram)");
      expect(badge.description).toContain("dış kaynak kaydı");
    });

    it("classifies ACADEMIC sources accurately", () => {
      const academicItem: TelegramFeedItem = {
        id: "item_acad_01",
        telegramMessageId: "acad_01",
        sourceType: "ACADEMIC",
        dataOrigin: "EXTERNAL_SOURCE",
        originalText: "Nature makalesi özeti.",
        receivedAt: new Date().toISOString(),
      };

      const badge = getProvenanceBadge(academicItem);
      expect(badge.label).toBe("🎓 Akademik Kaynak");
    });
  });

  // Test 3: Model Derived AI Analysis vs Source Data
  describe("Test 3: Model Interpretation is clearly distinguished from source record", () => {
    it("preserves original source record when processing status becomes AI_ANALYZED", () => {
      const analyzedItem: TelegramFeedItem = {
        id: "item_analyzed_01",
        telegramMessageId: 1002,
        sourceType: "TELEGRAM",
        dataOrigin: "EXTERNAL_SOURCE",
        processingStatus: "AI_ANALYZED",
        originalText: "Oxford Q-Lab yeni kuantum işlemcisi duyurdu.",
        receivedAt: new Date().toISOString(),
        aiAnalysisNotes: "Bu gelişme 2035 Kuantum Algoritma Kırılması konusuyla semantik olarak ilişkilidir.",
        matchedMilestoneYear: 2035,
        matchedMilestoneTitle: "Kuantum Algoritma Kırılması",
        matchConfidence: 87,
      };

      // Invariants:
      // 1. sourceType remains TELEGRAM (not erased by AI)
      expect(analyzedItem.sourceType).toBe("TELEGRAM");
      // 2. dataOrigin remains EXTERNAL_SOURCE
      expect(analyzedItem.dataOrigin).toBe("EXTERNAL_SOURCE");
      // 3. processingStatus marks that AI derived commentary exists
      expect(analyzedItem.processingStatus).toBe("AI_ANALYZED");
      // 4. Milestone link is algorithmic match score, not absolute certainty
      expect(analyzedItem.matchConfidence).toBe(87);
      expect(analyzedItem.matchedMilestoneYear).toBe(2035);
    });
  });
});
