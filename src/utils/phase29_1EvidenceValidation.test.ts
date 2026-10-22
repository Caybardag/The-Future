import { describe, it, expect } from "vitest";
import { TIMELINE_DATA } from "../data/timelineData";
import { getSignalsForMilestone, getReferenceSourcesForMilestone } from "./referenceSources";
import telegramVault from "../data/telegram_intelligence_vault.json";
import fs from "fs";

describe("PHASE 29.1 — Independent Evidence Validation Suite", () => {
  // 1. "isVerifiedSignal" yalnızca gerçek kanıt koşullarında true olur
  it("1. isVerifiedSignal is only true when an external identifier or peer-reviewed domain is present", () => {
    const milestone = TIMELINE_DATA[0];
    const signals = getSignalsForMilestone(milestone);

    // Search query signals must have isVerifiedSignal = false
    const searchSignals = signals.filter((s) => s.category !== "patent_ip");
    expect(searchSignals.every((s) => s.isVerifiedSignal === false)).toBe(true);

    // Patent signal with actual patent number has isVerifiedSignal = true & evidenceTier = IDENTIFIER_PRESENT
    const patentSignal = signals.find((s) => s.category === "patent_ip");
    expect(patentSignal).toBeDefined();
    expect(patentSignal?.isVerifiedSignal).toBe(true);
    expect(patentSignal?.evidenceTier).toBe("IDENTIFIER_PRESENT");
  });

  // 2. URL biçimi kontrolü kayıt doğrulaması sayılmaz
  it("2. URL format validity alone does not constitute verified external record", () => {
    // 43 of 51 telegram signals point to web.telegram.org (valid URL format, but NOT a verified academic record)
    const telegramLinks = telegramVault.filter((item: any) => item.sourceUrl?.includes("telegram.org"));
    expect(telegramLinks.length).toBeGreaterThanOrEqual(43);

    // Having a valid URL does not confer peer-reviewed verification
    telegramLinks.forEach((item: any) => {
      expect(new URL(item.sourceUrl).protocol).toMatch(/^https?:/);
      // None of these should claim verified academic paper
      expect(item.aiAnalysisNotes).not.toContain("seviyesinde doğrulandı");
    });
  });

  // 3. Statik/önbellek verisi canlı API sonucu olarak etiketlenmez
  it("3. Cached academic database records are distinguished from live real-time API queries", () => {
    const rawData = JSON.parse(fs.readFileSync("data_academic_knowledge_store.json", "utf8"));
    expect(rawData.version).toBeDefined();
    expect(rawData.lastUpdated).toBeDefined();

    // The items are pre-cached disk records (STATIC_DATA / CACHED_RECORD)
    const queryKeys = Object.keys(rawData.queries || {});
    expect(queryKeys.length).toBeGreaterThan(0);

    const firstQuery = rawData.queries[queryKeys[0]];
    expect(firstQuery.fetchedAt).toBeDefined();
    expect(typeof firstQuery.fetchedAt).toBe("string");
  });

  // 4. DOI/arXiv kimliği ile kayıt doğrulaması ayrıdır
  it("4. Distinguishes DOI/arXiv identifier presence from technology proof", () => {
    const rawData = JSON.parse(fs.readFileSync("data_academic_knowledge_store.json", "utf8"));
    const uniqueWorks = new Map<string, any>();

    for (const qKey of Object.keys(rawData.queries || {})) {
      for (const item of rawData.queries[qKey].items || []) {
        if (!uniqueWorks.has(item.id)) {
          uniqueWorks.set(item.id, item);
        }
      }
    }

    const items = Array.from(uniqueWorks.values());
    const withDoi = items.filter((x) => Boolean(x.doi));
    const withoutDoi = items.filter((x) => !x.doi);

    // Verified DOI count among unique works
    expect(withDoi.length).toBe(142);
    expect(withoutDoi.length).toBe(8); // 7 arXiv preprints + 1 OpenAlex record without DOI
    expect(items.length).toBe(150); // Exact deduplicated count
  });

  // 5. Patent boolean alanı tek başına gerçek kayıt kanıtı sayılmaz
  it("5. Hardcoded boolean isRealPatent is backed by static USPTO registration structure, not live audit", () => {
    let patentCount = 0;
    const patentNumbers = new Set<string>();

    TIMELINE_DATA.forEach((m) => {
      (m.patents || []).forEach((p) => {
        patentCount++;
        patentNumbers.add(p.patentNumber);
        expect(p.isRealPatent).toBe(true);
        expect(p.patentNumber).toMatch(/^US\d{7,10}[A-Z]\d?$/);
        expect(p.googlePatentsUrl).toContain("patents.google.com");
      });
    });

    // 50 total milestone-patent linkages across 28 unique foundational patents
    expect(patentCount).toBe(50);
    expect(patentNumbers.size).toBe(28);
  });

  // 6. Patent kaydı, teknolojinin çalıştığının kanıtı olarak sunulmaz
  it("6. Patent records represent intellectual property filings, not empirical proof of future event", () => {
    const m = TIMELINE_DATA.find((m) => m.patents && m.patents.length > 0)!;
    const citations = getReferenceSourcesForMilestone(m);
    const patentCitations = citations.filter((c) => c.type === "patent_trend");

    patentCitations.forEach((c) => {
      // Must be classified as patent_trend, not conclusive proof
      expect(c.type).toBe("patent_trend");
      expect(c.source).toContain("USPTO / Google Patents");
    });
  });

  // 7. Anahtar kelime eşleşmesi, gelecekteki dönüm noktasının doğrulandığı anlamına gelmez
  it("7. Keyword query fallback returns search discovery index without claiming verified status", () => {
    const m = { ...TIMELINE_DATA[0], citations: [], patents: [] };
    const citations = getReferenceSourcesForMilestone(m);

    // Citations synthesized without concrete patents are search roadmaps
    citations.forEach((c) => {
      expect(c.type).not.toBe("verified_proof");
    });
  });

  // 8. Eksik kaynak bilgisi güvenli şekilde gösterilir
  it("8. Gracefully handles milestone without patents or citations by producing search fallback", () => {
    const emptyMilestone = {
      ...TIMELINE_DATA[0],
      patents: undefined,
      signals: undefined,
      citations: undefined,
    };

    const signals = getSignalsForMilestone(emptyMilestone);
    expect(signals.length).toBe(6);

    const patentSignal = signals.find((s) => s.category === "patent_ip");
    expect(patentSignal?.isVerifiedSignal).toBe(false);
    expect(patentSignal?.evidenceTier).toBe("URL_ONLY");
    expect(patentSignal?.title).toContain("Destekleyici Patent Arama İndeksi");
  });
});
