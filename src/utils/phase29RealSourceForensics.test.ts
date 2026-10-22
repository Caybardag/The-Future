import { describe, it, expect } from "vitest";
import { TIMELINE_DATA } from "../data/timelineData";
import { getFiveLayerWorldState } from "./worldStateResolver";
import { getSignalsForMilestone, getReferenceSourcesForMilestone } from "./referenceSources";
import telegramVault from "../data/telegram_intelligence_vault.json";

describe("PHASE 29 — Real Source Forensics & Evidence Integrity Suite", () => {
  // 1. TRL source-vs-estimated distinction
  it("1. TRL source-vs-estimated distinction: World state TRL is explicitly typed as model_estimated", () => {
    const milestone2035 = TIMELINE_DATA.find((m) => m.year === 2035) || TIMELINE_DATA[0];
    const worldState = getFiveLayerWorldState(milestone2035, 1995);
    
    expect(worldState.scientificReadiness.trlLevel).toBeDefined();
    expect(worldState.scientificReadiness.trlType).toBe("model_estimated");
    expect(worldState.scientificReadiness.consensusType).toBe("model_projected");
  });

  // 2. No year-only fake TRL presented as empirical fact
  it("2. No year-only fake TRL: Distinguishes horizon model estimation from empirical certification", () => {
    const mNear = TIMELINE_DATA.find((m) => m.year === 2027) || TIMELINE_DATA[1];
    const mFar = TIMELINE_DATA.find((m) => m.year === 2055) || TIMELINE_DATA[30];
    
    const wsNear = getFiveLayerWorldState(mNear, 1995);
    const wsFar = getFiveLayerWorldState(mFar, 1995);

    // Both must be explicitly model_estimated rather than claimed as certified
    expect(wsNear.scientificReadiness.trlType).toBe("model_estimated");
    expect(wsFar.scientificReadiness.trlType).toBe("model_estimated");
    expect(wsNear.scientificReadiness.trlLevel).toBeGreaterThan(wsFar.scientificReadiness.trlLevel);
  });

  // 3. Source identifier validation
  it("3. Source identifier validation: Correctly validates DOI, patent, and external identifiers", () => {
    const mWithPatent = TIMELINE_DATA.find((m) => m.patents && m.patents.length > 0);
    expect(mWithPatent).toBeDefined();
    
    const firstPatent = mWithPatent!.patents![0];
    expect(firstPatent.patentNumber).toMatch(/^US\d{7,10}[A-Z]\d?$/);
    expect(firstPatent.isRealPatent).toBe(true);
    expect(firstPatent.googlePatentsUrl).toContain("patents.google.com");
  });

  // 4. Source domain validation
  it("4. Source domain validation: Validates legitimate external domains vs generic channels", () => {
    const validDomains = new Set(["web.telegram.org", "www.pppl.gov", "www.xpeng.com", "alphagenome.google", "www.science.org", "x.com"]);
    
    telegramVault.forEach((item: any) => {
      const url = new URL(item.sourceUrl);
      expect(validDomains.has(url.hostname)).toBe(true);
    });
  });

  // 5. Unverified source handling
  it("5. Unverified source handling: Generic search links are not marked as verified records", () => {
    const milestone = TIMELINE_DATA[0];
    const signals = getSignalsForMilestone(milestone);
    
    // Signals that are Google Scholar or Nature search queries must NOT have isVerifiedSignal = true
    const searchSignals = signals.filter((s) => s.url && (s.url.includes("scholar.google.com") || s.url.includes("nature.com/search") || s.url.includes("huggingface.co")));
    searchSignals.forEach((s) => {
      expect(s.isVerifiedSignal).toBe(false);
    });
  });

  // 6. AI source fabrication protection
  it("6. AI source fabrication protection: Telegram vault contains zero ungrounded 'seviyesinde doğrulandı' claims", () => {
    telegramVault.forEach((item: any) => {
      expect(item.aiAnalysisNotes).not.toContain("seviyesinde doğrulandı");
      if (item.aiAnalysisNotes.includes("TRL")) {
        expect(item.aiAnalysisNotes).toContain("Model Tahmini");
      }
    });
  });

  // 7. Fallback source classification
  it("7. Fallback source classification: Distinguishes real verified patents from generic patent queries", () => {
    const milestoneWithPatents = TIMELINE_DATA.find((m) => m.patents && m.patents.length > 0);
    const milestoneWithoutPatents = { ...TIMELINE_DATA[0], patents: [] };

    const signalsWith = getSignalsForMilestone(milestoneWithPatents!);
    const signalsWithout = getSignalsForMilestone(milestoneWithoutPatents);

    const patentSignalWith = signalsWith.find((s) => s.category === "patent_ip");
    const patentSignalWithout = signalsWithout.find((s) => s.category === "patent_ip");

    expect(patentSignalWith?.isVerifiedSignal).toBe(true);
    expect(patentSignalWithout?.isVerifiedSignal).toBe(false);
  });

  // 8. Milestone-source matching
  it("8. Milestone-source matching: Citations preserve semantic category matching without cross-contamination", () => {
    const aiMilestone = TIMELINE_DATA.find((m) => m.category === "Yapay Zeka & Bilişim")!;
    const citations = getReferenceSourcesForMilestone(aiMilestone);

    expect(citations.length).toBeGreaterThan(0);
    expect(citations[0].source).toBeDefined();
    // At least one patent or academic citation is matched
    expect(citations.some((c) => c.type === "patent_trend" || c.source.includes("OpenAlex") || c.source.includes("USPTO"))).toBe(true);
  });

  // 9. Source date integrity
  it("9. Source date integrity: Patent filing dates precede or match current baseline (<= 2026)", () => {
    TIMELINE_DATA.forEach((m) => {
      if (m.patents && m.patents.length > 0) {
        m.patents.forEach((p) => {
          expect(p.yearFiled).toBeLessThanOrEqual(2026);
          expect(p.yearFiled).toBeGreaterThanOrEqual(2010);
        });
      }
    });
  });

  // 10. Patent evidence semantics: Patents represent intellectual property filings, not future certainty
  it("10. Patent evidence semantics: Patents are labeled as supporting trend, not guaranteed future certainty", () => {
    const m = TIMELINE_DATA.find((m) => m.patents && m.patents.length > 0)!;
    const citations = getReferenceSourcesForMilestone(m);
    const patentCitation = citations.find((c) => c.type === "patent_trend");

    expect(patentCitation).toBeDefined();
    expect(patentCitation?.type).toBe("patent_trend");
    expect(patentCitation?.source).toContain("USPTO / Google Patents");
  });
});
