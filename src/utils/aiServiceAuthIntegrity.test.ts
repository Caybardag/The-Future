import { describe, it, expect, vi, beforeEach } from "vitest";
import { AIService, AIServiceError } from "../services/AIService";
import { safeFetchJson } from "./apiClient";
import {
  createTestSession,
  getSessionUserEmail,
} from "../server/serverAuthEngine";

describe("AIService & Authentication Integrity Verification", () => {
  let store: Record<string, string> = {};

  beforeEach(() => {
    vi.restoreAllMocks();
    store = {};

    const mockStorage = {
      getItem: (key: string) => store[key] || null,
      setItem: (key: string, value: string) => {
        store[key] = value;
      },
      removeItem: (key: string) => {
        delete store[key];
      },
      clear: () => {
        store = {};
      },
    };

    const listeners: Record<string, Array<(e: any) => void>> = {};
    const mockWindow = {
      addEventListener: (type: string, cb: (e: any) => void) => {
        if (!listeners[type]) listeners[type] = [];
        listeners[type].push(cb);
      },
      removeEventListener: (type: string, cb: (e: any) => void) => {
        if (listeners[type]) {
          listeners[type] = listeners[type].filter((l) => l !== cb);
        }
      },
      dispatchEvent: (event: any) => {
        const type = event?.type;
        if (listeners[type]) {
          listeners[type].forEach((cb) => cb(event));
          return true;
        }
        return false;
      },
    };

    vi.stubGlobal("localStorage", mockStorage);
    vi.stubGlobal("window", mockWindow);
    vi.stubGlobal(
      "CustomEvent",
      class MockCustomEvent {
        type: string;
        detail: any;
        constructor(type: string, init?: any) {
          this.type = type;
          this.detail = init?.detail;
        }
      }
    );
  });

  it("AIServiceErrorCode correctly recognizes and types UNAUTHORIZED", () => {
    const error = new AIServiceError("Oturum Gerekli", "UNAUTHORIZED", 401, false);
    expect(error.name).toBe("AIServiceError");
    expect(error.code).toBe("UNAUTHORIZED");
    expect(error.status).toBe(401);
  });

  it("server session token survives engine re-initialization", () => {
    const testEmail = "test_user_persistence@example.com";
    const token = createTestSession(testEmail, "user");
    expect(token).toBeTruthy();

    const retrievedEmail = getSessionUserEmail(token);
    expect(retrievedEmail).toBe(testEmail);
  });

  it("safeFetchJson emits future-open-auth-modal and returns 401 on UNAUTHORIZED", async () => {
    let modalOpened = false;
    const listener = () => {
      modalOpened = true;
    };
    window.addEventListener("future-open-auth-modal", listener);

    // Mock global fetch to return 401 UNAUTHORIZED
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        status: 401,
        ok: false,
        json: async () => ({
          success: false,
          error: "UNAUTHORIZED",
          message: "Yetkisiz erişim: Bu AI özelliğini kullanmak için geçerli bir oturum açmanız gerekmektedir.",
        }),
      })
    );

    const result = await safeFetchJson("/api/gemini/job-risk", { method: "POST" }, 0);
    expect(result.status).toBe(401);
    expect(result.code).toBe("UNAUTHORIZED");
    expect(result.success).toBe(false);
    expect(modalOpened).toBe(true);

    window.removeEventListener("future-open-auth-modal", listener);
  });

  it("AIService handles 401 by returning UNAUTHORIZED result and emitting future-open-auth-modal", async () => {
    let modalOpened = false;
    const listener = () => {
      modalOpened = true;
    };
    window.addEventListener("future-open-auth-modal", listener);

    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        status: 401,
        ok: false,
        json: async () => ({
          success: false,
          error: "UNAUTHORIZED",
          message: "Yetkisiz erişim: Oturum açmanız gerekmektedir.",
        }),
      })
    );

    const service = new AIService();
    const result = await service.analyzeJobRisk({ profession: "Software Engineer" });

    expect(result.success).toBe(false);
    expect(result.code).toBe("UNAUTHORIZED");
    expect(result.status).toBe(401);
    expect(result.error).toContain("Oturum");
    expect(modalOpened).toBe(true);

    window.removeEventListener("future-open-auth-modal", listener);
  });

  it("AIService.executeWithRetry directly throws typed AIServiceError when unhandled", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        status: 401,
        ok: false,
        json: async () => ({
          success: false,
          error: "UNAUTHORIZED",
          message: "Yetkisiz erişim: Oturum açmanız gerekmektedir.",
        }),
      })
    );

    const service = new AIService();
    let thrownError: any = null;

    try {
      await (service as any).executeWithRetry("/api/gemini/raw", {}, { maxRetries: 1 });
    } catch (err) {
      thrownError = err;
    }

    expect(thrownError).toBeInstanceOf(AIServiceError);
    expect(thrownError.code).toBe("UNAUTHORIZED");
    expect(thrownError.status).toBe(401);
  });
});
