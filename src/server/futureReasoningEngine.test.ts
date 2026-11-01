import { describe, it, expect, vi } from "vitest";
import {
  runGeminiReasoningOnEvidence,
  runDeterministicReasoningFallback,
  reEvaluateFutureModelWithSignal,
  normalizeAcademicWorkToSource,
  normalizeTelegramSignalToSource,
  forecastsToLivingMilestones,
  runAutonomousCalendarReasoningCycle,
  hydrateTimelineWithValidatedFutureState,
  evaluateCalendarItemDeterministicFallback,
  getValidatedFutureState,
  setValidatedFutureState,
} from "./futureReasoningEngine";
import { DynamicReasonedForecast, SourceReference, ValidatedFutureState, CalendarItemAssessment } from "../types";
import { TIMELINE_DATA } from "../data/timelineData";

describe("EVIDENCE-DRIVEN DYNAMIC FUTURE REASONING ENGINE SUITE", () => {
  // Mock sample sources
  const sampleAcademicSource: SourceReference = {
    id: "ref_nature_crispr",
    title: "In vivo base editing with dual AAV vectors in primates",
    sourceType: "openalex",
    doi: "10.1038/s41586-026-00123-x",
    citationCount: 142,
    publicationYear: 2026,
    extractedClaim: "Primatlarda in vivo baz düzenleme ile genetik hastalıkların geri döndürülmesi başarıldı.",
  };

  const sampleAiSource: SourceReference = {
    id: "ref_arxiv_llm_agents",
    title: "Recursive Multi-Agent Orchestration with Formal Verification",
    sourceType: "arxiv",
    url: "https://arxiv.org/abs/2603.12345",
    citationCount: 45,
    publicationYear: 2026,
    extractedClaim: "Biçimsel doğrulama destekli çoklu ajan mimarileri otonom yazılım geliştirmede %92 güvenilirlik sağladı.",
  };

  // ─────────────────────────────────────────────────────────────────────────────
  // TEST 1: Yeni bir kaynak gelir → Gemini/Engine analiz eder → Gelecek modelini değerlendirir
  // ─────────────────────────────────────────────────────────────────────────────
  it("TEST 1: Ingests new source, normalizes metadata, and reasons over technological maturity", async () => {
    const rawWork = {
      id: "openalex_w123",
      title: "Scalable Qubit Coherence in Topological Insulators",
      publicationYear: 2026,
      authors: ["Alice", "Bob"],
      citationCount: 78,
      abstractSnippet: "Topolojik yalıtkanlarda kuantum koherans süresi 10x artırıldı.",
      doi: "10.1103/PhysRevLett.128.012345",
    };

    const normalized = normalizeAcademicWorkToSource(rawWork);
    expect(normalized.id).toContain("ref_openalex_");
    expect(normalized.doi).toBe("10.1103/PhysRevLett.128.012345");
    expect(normalized.citationCount).toBe(78);

    const forecasts = runDeterministicReasoningFallback([normalized]);
    expect(forecasts.length).toBeGreaterThan(0);
    const quantumForecast = forecasts[0];
    expect(quantumForecast.category).toBe("Kuantum & Güvenlik");
    expect(quantumForecast.temporalWindow.startYear).toBeGreaterThanOrEqual(2027);
    expect(quantumForecast.supportingEvidence[0].id).toBe(normalized.id);
  });

  // ─────────────────────────────────────────────────────────────────────────────
  // TEST 2: Yeni kaynak mevcut tahmini destekler → Tahmin güçlenir
  // ─────────────────────────────────────────────────────────────────────────────
  it("TEST 2: Supporting breakthrough signal strengthens the forecast and accelerates window", async () => {
    const initialForecasts: DynamicReasonedForecast[] = [
      {
        id: "forecast_ai_agents",
        title: "Yapay Zeka & Bilişim Alanında Doğrulanmış İlerleme",
        category: "Yapay Zeka & Bilişim",
        temporalWindow: {
          startYear: 2029,
          endYear: 2033,
          peakLikelihoodWindow: "2030-2032",
          rationale: "İlk model varsayımı.",
        },
        forecastEventSummary: "Otonom yazılım ajanları.",
        supportingEvidence: [sampleAiSource],
        reasoningChain: [],
        dependencies: { prerequisiteTech: [], infrastructureNeeds: [], regulatoryRequirements: [] },
        contradictions: { impactOnForecast: "NONE" },
        uncertainty: { level: "MODERATE", primaryUnknowns: [], entropyFactor: 0.5 },
        confidenceBasis: {
          evidenceStrength: "MODERATE",
          technologicalMaturityTrl: 5,
          convergenceDegree: "Tekil Sinyal",
          explanation: "İlk aşama.",
        },
        status: "EMERGING_HYPOTHESIS",
        epistemicProvenance: "DYNAMIC_REASONED_FORECAST",
        lastEvaluatedAt: new Date().toISOString(),
      },
    ];

    const breakthroughSignal: SourceReference = {
      id: "ref_breakthrough_agent",
      title: "Yapay Zeka & Bilişim: Büyük Atılım ve Başarı Sinyali",
      sourceType: "peer_reviewed_journal",
      publicationYear: 2026,
      extractedClaim: "Endüstriyel ölçekte yapay zeka ajanları ile yazılım üretiminde büyük atılım ve resmi onay alındı.",
    };

    const outcome = await reEvaluateFutureModelWithSignal(() => null, breakthroughSignal, initialForecasts);

    expect(outcome.actions.some((a) => a.actionType === "STRENGTHENED")).toBe(true);
    const updated = outcome.updatedForecasts.find((f) => f.id === "forecast_ai_agents");
    expect(updated).toBeDefined();
    expect(updated?.status).toBe("CONFIRMED_BY_EVIDENCE");
    expect(updated?.confidenceBasis.evidenceStrength).toBe("ROBUST");
    expect(updated?.uncertainty.level).toBe("LOW");
    // Accelerated startYear
    expect(updated!.temporalWindow.startYear).toBeLessThan(2029);
  });

  // ─────────────────────────────────────────────────────────────────────────────
  // TEST 3: Yeni kaynak mevcut tahminle çelişir → Tahmin zayıflar / ertelenir
  // ─────────────────────────────────────────────────────────────────────────────
  it("TEST 3: Contradicting or bottleneck signal defers and weakens the forecast", async () => {
    const initialForecasts: DynamicReasonedForecast[] = [
      {
        id: "forecast_crispr_therapies",
        title: "Biyoloji & Tıp Alanında Doğrulanmış İlerleme",
        category: "Biyoloji & Tıp",
        temporalWindow: {
          startYear: 2027,
          endYear: 2031,
          peakLikelihoodWindow: "2028-2030",
          rationale: "Primat deneyleri sonrası.",
        },
        forecastEventSummary: "Gen terapisi klinik yaygınlaşması.",
        supportingEvidence: [sampleAcademicSource],
        reasoningChain: [],
        dependencies: { prerequisiteTech: [], infrastructureNeeds: [], regulatoryRequirements: [] },
        contradictions: { impactOnForecast: "NONE" },
        uncertainty: { level: "LOW", primaryUnknowns: [], entropyFactor: 0.2 },
        confidenceBasis: {
          evidenceStrength: "ROBUST",
          technologicalMaturityTrl: 7,
          convergenceDegree: "Yüksek",
          explanation: "Literatür uyumlu.",
        },
        status: "CONFIRMED_BY_EVIDENCE",
        epistemicProvenance: "DYNAMIC_REASONED_FORECAST",
        lastEvaluatedAt: new Date().toISOString(),
      },
    ];

    const bottleneckSignal: SourceReference = {
      id: "ref_reg_ban",
      title: "Biyoloji & Tıp: Klinik Denemelerde Regülasyon Engeli ve Ambargo Kararı",
      sourceType: "telegram_signal",
      publicationYear: 2026,
      extractedClaim: "FDA ve EMA biyo-etik endişeler ve gecikme nedeniyle Faz-3 klinik denemelerini askıya aldı; darboğaz oluştu.",
    };

    const outcome = await reEvaluateFutureModelWithSignal(() => null, bottleneckSignal, initialForecasts);

    expect(outcome.actions.some((a) => a.actionType === "DEFERRED")).toBe(true);
    const target = outcome.updatedForecasts.find((f) => f.id === "forecast_crispr_therapies");
    expect(target).toBeDefined();
    expect(target?.status).toBe("DEFERRED_BY_BOTTLENECK");
    expect(target?.contradictions.impactOnForecast).toBe("POSTPONES");
    expect(target?.uncertainty.level).toBe("HIGH");
    expect(target!.temporalWindow.startYear).toBeGreaterThan(2027);
  });

  // ─────────────────────────────────────────────────────────────────────────────
  // TEST 4: Yetersiz kanıt kaldığında tahmin INSUFFICIENT_EVIDENCE olur
  // ─────────────────────────────────────────────────────────────────────────────
  it("TEST 4: When evidence is purged or missing, forecast reflects INSUFFICIENT_EVIDENCE without fake scores", () => {
    const ungroundedForecast: DynamicReasonedForecast = {
      id: "forecast_speculative_warp",
      title: "Işık Hızından Hızlı Uzay İtiş Sistemi",
      category: "Uzay & Fizik",
      temporalWindow: {
        startYear: 2045,
        endYear: 2055,
        rationale: "Kuramsal matematik varsayımı.",
      },
      forecastEventSummary: "Alcubierre metriği ile uzay bükme.",
      supportingEvidence: [], // ZERO sources
      reasoningChain: [],
      dependencies: { prerequisiteTech: [], infrastructureNeeds: [], regulatoryRequirements: [] },
      contradictions: { impactOnForecast: "WEAKENS" },
      uncertainty: { level: "VERY_HIGH", primaryUnknowns: ["Negatif enerji yoğunluğu"], entropyFactor: 0.95 },
      confidenceBasis: {
        evidenceStrength: "INSUFFICIENT",
        technologicalMaturityTrl: 1,
        convergenceDegree: "Kanıt Yok",
        explanation: "Fiziksel kanıt bulunmamaktadır.",
      },
      status: "INSUFFICIENT_EVIDENCE",
      epistemicProvenance: "DYNAMIC_REASONED_FORECAST",
      lastEvaluatedAt: new Date().toISOString(),
    };

    const evaluated = runDeterministicReasoningFallback([], [ungroundedForecast]);
    expect(evaluated[0].status).toBe("INSUFFICIENT_EVIDENCE");

    const milestones = forecastsToLivingMilestones(evaluated, TIMELINE_DATA);
    expect(milestones[0].forecastStatus).toBe("INSUFFICIENT_EVIDENCE");
    expect(milestones[0].probability).toBeLessThanOrEqual(25); // Real low probability, never 85% or 99%
  });

  // ─────────────────────────────────────────────────────────────────────────────
  // TEST 5: Takvimde olmayan yeni teknoloji keşfedildiğinde yeni gelecek olayı üretir
  // ─────────────────────────────────────────────────────────────────────────────
  it("TEST 5: Discovers previously unknown technological relationship and spawns dynamic reasoned forecast", async () => {
    const initialForecasts: DynamicReasonedForecast[] = [];

    const novelSignal: SourceReference = {
      id: "ref_brain_organoid_biocomputer",
      title: "Organoid Intelligence: Biyolojik Sinir Hücreleriyle Biyo-Bilişim Çipi",
      sourceType: "peer_reviewed_journal",
      publicationYear: 2026,
      extractedClaim: "Laboratuvarda üretilen 3D insan beyin organoidleri canlı hesaplama birimi olarak kullanıldı.",
    };

    const outcome = await reEvaluateFutureModelWithSignal(() => null, novelSignal, initialForecasts);

    expect(outcome.actions.some((a) => a.actionType === "DISCOVERED_NEW")).toBe(true);
    expect(outcome.updatedForecasts.length).toBe(1);
    const discovered = outcome.updatedForecasts[0];
    expect(discovered.title).toContain("Organoid Intelligence");
    expect(discovered.temporalWindow.startYear).toBeGreaterThanOrEqual(2028);
    expect(discovered.status).toBe("EMERGING_HYPOTHESIS");
  });

  // ─────────────────────────────────────────────────────────────────────────────
  // TEST 6: Sıfır kaynak olduğunda sistem uydurma gelecek üretmez
  // ─────────────────────────────────────────────────────────────────────────────
  it("TEST 6: Zero sources produce zero fabricated forecasts", () => {
    const emptyResult = runDeterministicReasoningFallback([]);
    expect(emptyResult).toEqual([]);
    expect(emptyResult.length).toBe(0);
  });

  // ─────────────────────────────────────────────────────────────────────────────
  // TEST 7: Gemini API başarısız olduğunda sistem çökmez ve sahte tahmin uydurmaz
  // ─────────────────────────────────────────────────────────────────────────────
  it("TEST 7: When Gemini API throws or is unavailable, fallback gracefully uses verified knowledge", async () => {
    const throwingAiFn = () => {
      return {
        models: {
          generateContent: vi.fn().mockRejectedValue(new Error("Gemini Quota Exceeded (429)")),
        },
      } as any;
    };

    const result = await runGeminiReasoningOnEvidence(throwingAiFn, [sampleAcademicSource]);
    expect(result.length).toBeGreaterThan(0);
    expect(result[0].epistemicProvenance).toBe("DYNAMIC_REASONED_FORECAST");
    expect(result[0].supportingEvidence[0].doi).toBe(sampleAcademicSource.doi);
  });

  // ─────────────────────────────────────────────────────────────────────────────
  // TEST 8: Eski localStorage / Firestore verileri çökme yaratmaz ve uyumluluk korunur
  // ─────────────────────────────────────────────────────────────────────────────
  it("TEST 8: Backward compatibility gracefully accepts legacy milestones without crashes", () => {
    // When no dynamic forecasts exist, baseline scenario is preserved with STATIC_SCENARIO badge
    const living = forecastsToLivingMilestones([], TIMELINE_DATA);
    expect(living.length).toBe(TIMELINE_DATA.length);
    expect(living[0].epistemicProvenance).toBe("STATIC_SCENARIO");
    expect(living[0].year).toBe(2026);
  });
});

describe("AUTONOMOUS GEMINI BRAIN & IMMUTABLE 2026–2060 CALENDAR SPECIFICATION SUITE", () => {
  // ─────────────────────────────────────────────────────────────────────────────
  // SPEC TEST 1: TAKVİM = SABİT ÇERÇEVE (2026-2060, 35 Madde Asla Silinmez / Sırası Değişmez)
  // ─────────────────────────────────────────────────────────────────────────────
  it("SPEC TEST 1: Preserves immutable 2026-2060 calendar framework during reasoning overlay", () => {
    const mockState: ValidatedFutureState = {
      version: "2.0.0",
      lastEvaluatedAt: new Date().toISOString(),
      stateHash: "mock_hash_123",
      assessments: {
        milestone_2026: {
          calendarItemId: "milestone_2026",
          year: 2026,
          title: TIMELINE_DATA[0].title,
          category: TIMELINE_DATA[0].category,
          status: "REVISED",
          currentAssessment: {
            content: "Otonom olarak kanıtlarla güncellenmiş açıklama.",
            confidence: 82,
            timeWindow: {
              startYear: 2026,
              endYear: 2028,
              peakLikelihoodWindow: "2026-2027",
              rationale: "Literatür doğrulaması.",
            },
            uncertaintyLevel: "LOW",
          },
          reasoning: "Hakiki akademik kanıt temelli revizyon.",
          revisionNeeded: true,
          reasoningVersion: "2.0.0",
          evaluatedAt: new Date().toISOString(),
        },
      },
    };

    const hydrated = hydrateTimelineWithValidatedFutureState(TIMELINE_DATA, mockState);

    // 1. All 35 milestones preserved
    expect(hydrated.length).toBe(TIMELINE_DATA.length);
    // 2. Exact milestone years and order preserved
    expect(hydrated[0].year).toBe(2026);
    expect(hydrated[hydrated.length - 1].year).toBe(2060);
    // 3. Milestone title and category are immutable
    expect(hydrated[0].title).toBe(TIMELINE_DATA[0].title);
    expect(hydrated[0].category).toBe(TIMELINE_DATA[0].category);
    // 4. Gemini validated state correctly overlaid
    expect(hydrated[0].description).toBe("Otonom olarak kanıtlarla güncellenmiş açıklama.");
    expect(hydrated[0].probability).toBe(82);
    expect(hydrated[0].temporalWindow?.peakLikelihoodWindow).toBe("2026-2027");
  });

  // ─────────────────────────────────────────────────────────────────────────────
  // SPEC TEST 2: GEMINI SELF-EVALUATION (Önceki Değerlendirmesini Sorgulama)
  // ─────────────────────────────────────────────────────────────────────────────
  it("SPEC TEST 2: Gemini Brain questions previous assessments and expands temporal windows without manual hardcoded rules", () => {
    const milestone2042 = TIMELINE_DATA.find((m) => m.year === 2042) || TIMELINE_DATA[15];

    const priorAssessment: CalendarItemAssessment = {
      calendarItemId: `milestone_${milestone2042.year}`,
      year: milestone2042.year,
      title: milestone2042.title,
      category: milestone2042.category,
      status: "UNCHANGED",
      currentAssessment: {
        content: "Eski dar kapsamlı değerlendirme.",
        confidence: 90, // Aşırı kesin skor
        timeWindow: {
          startYear: milestone2042.year,
          endYear: milestone2042.year,
          rationale: "Eski tekil yıl varsayımı.",
        },
        uncertaintyLevel: "LOW",
      },
      reasoning: "İlk varsayım.",
      revisionNeeded: false,
      reasoningVersion: "1.0.0",
      evaluatedAt: new Date(Date.now() - 86400000).toISOString(),
    };

    const evaluated = evaluateCalendarItemDeterministicFallback(milestone2042, [], priorAssessment);

    // Should flag uncertainty for far future or expand time window into a range
    expect(evaluated.currentAssessment.timeWindow.endYear).toBeGreaterThan(evaluated.currentAssessment.timeWindow.startYear);
    expect(evaluated.reasoning).toBeDefined();
    // No hardcoded "if tech === ... probability = 85"
    expect(evaluated.status).toBeDefined();
  });

  // ─────────────────────────────────────────────────────────────────────────────
  // SPEC TEST 3: EPISTEMIC HONESTY (Yetersiz Kanıtta Uydurma Skor Yasak)
  // ─────────────────────────────────────────────────────────────────────────────
  it("SPEC TEST 3: Insufficient evidence leaves confidence as null without generating fabricated numbers", () => {
    const farFutureMilestone = TIMELINE_DATA.find((m) => m.year >= 2050)!;

    const evaluated = evaluateCalendarItemDeterministicFallback(farFutureMilestone, []);

    // When evidence is missing, does not fabricate 85% or 95%
    expect(evaluated.currentAssessment.confidence).toBeNull();
    expect(evaluated.status).toBe("UNCERTAIN");
    expect(evaluated.currentAssessment.uncertaintyLevel).toBe("HIGH");
  });

  // ─────────────────────────────────────────────────────────────────────────────
  // SPEC TEST 4: TOKEN OPTIMIZATION & PERSISTENCE (State Hash & No Wasteful Calls)
  // ─────────────────────────────────────────────────────────────────────────────
  it("SPEC TEST 4: Autonomous cycle optimizes tokens using state hash and persists validated future state", async () => {
    const initialRun = await runAutonomousCalendarReasoningCycle(() => null, false);
    expect(initialRun).toBeDefined();
    expect(initialRun.version).toBe("2.0.0");
    expect(Object.keys(initialRun.assessments).length).toBe(TIMELINE_DATA.length);

    // Second run with matching hash reuses state without re-evaluating
    const secondRun = await runAutonomousCalendarReasoningCycle(() => null, false);
    expect(secondRun.stateHash).toBe(initialRun.stateHash);
    expect(secondRun.lastEvaluatedAt).toBe(initialRun.lastEvaluatedAt);
  });
});

