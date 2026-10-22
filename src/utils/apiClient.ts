interface ParsedUserSession {
  plan: "free" | "pro" | "quantum_vip";
  userId: string | null;
  isGuest: boolean;
}

function getSessionData(): ParsedUserSession {
  try {
    let user: any = null;
    const saved = localStorage.getItem("future_timeline_user");
    if (saved) {
      user = JSON.parse(saved);
    }
    if (!user) {
      const alt = localStorage.getItem("user_profile_account");
      if (alt) user = JSON.parse(alt);
    }
    if (user && user.email) {
      const isSuper = (user.email || "").toLowerCase().trim() === "warfacelove46@gmail.com";
      const uid = user.id || "usr_" + user.email.replace(/[^a-zA-Z0-9]/g, "_");
      return {
        plan: (isSuper ? "quantum_vip" : (user.plan || "free")) as "free" | "pro" | "quantum_vip",
        userId: uid,
        isGuest: false,
      };
    }
  } catch (e) {
    // ignore storage errors
  }

  // Auto-generate or retrieve consistent anonymous visitor identity for seamless AI access
  let visitorId = "visitor_guest";
  try {
    const existing = localStorage.getItem("future_timeline_visitor_id");
    if (existing) {
      visitorId = existing;
    } else {
      visitorId = "visitor_" + Math.random().toString(36).substring(2, 11) + "_" + Date.now().toString(36);
      localStorage.setItem("future_timeline_visitor_id", visitorId);
    }
  } catch (_e) {
    // fallback
  }

  return { plan: "free", userId: visitorId, isGuest: false };
}

export function getUserPlan(): "free" | "pro" | "quantum_vip" | "guest" {
  const session = getSessionData();
  if (session.isGuest) return "guest";
  return session.plan;
}

export function notifyClientCreditsUpdated(credits: number) {
  try {
    const saved = localStorage.getItem("future_timeline_user");
    if (saved) {
      const u = JSON.parse(saved);
      u.credits = credits;
      localStorage.setItem("future_timeline_user", JSON.stringify(u));
    }
    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("server-credits-updated", { detail: { credits } }));
    }
  } catch (_e) {
    // ignore
  }
}

export function getApiHeaders(additionalHeaders: Record<string, string> = {}): Record<string, string> {
  const session = getSessionData();
  let customGeminiKey = "";
  let adminToken = "";
  let userEmail = "";
  try {
    const saved = localStorage.getItem("future_timeline_user");
    if (saved) {
      const u = JSON.parse(saved);
      if (u?.email) userEmail = u.email;
    }
    if (!userEmail) {
      const alt = localStorage.getItem("user_profile_account");
      if (alt) {
        const u = JSON.parse(alt);
        if (u?.email) userEmail = u.email;
      }
    }
  } catch {}
  try {
    customGeminiKey = localStorage.getItem("custom_gemini_api_key") || localStorage.getItem("gemini_api_key") || "";
  } catch {}
  try {
    adminToken = sessionStorage.getItem("future_admin_session_token") || "";
  } catch {}
  let userToken = "";
  try {
    userToken = localStorage.getItem("future_user_session_token") || "";
  } catch {}

  const effectiveBearerToken = userToken || adminToken;

  return {
    "Accept": "application/json",
    "Content-Type": "application/json",
    "x-user-plan": session.isGuest ? "guest" : session.plan,
    "x-user-id": session.userId || "",
    "x-user-email": userEmail,
    ...(effectiveBearerToken ? { "Authorization": `Bearer ${effectiveBearerToken}` } : {}),
    ...(adminToken ? { "x-admin-token": adminToken } : {}),
    ...(customGeminiKey ? { "x-gemini-api-key": customGeminiKey } : {}),
    ...additionalHeaders,
  };
}

export async function safeFetchJson<T = any>(
  url: string,
  options: RequestInit = {},
  retries: number = 1
): Promise<{ success: boolean; data?: T; error?: string; code?: string; [key: string]: any }> {
  try {
    const defaultHeaders = getApiHeaders();
    const mergedHeaders = {
      ...defaultHeaders,
      ...((options.headers as Record<string, string>) || {}),
    };

    const res = await fetch(url, { ...options, headers: mergedHeaders });
    const status = res.status;

    // Handle HTTP 429 Rate Limit with automatic backoff and retry
    if (status === 429 && retries > 0) {
      const retryAfterHeader = res.headers.get("Retry-After");
      const retryWaitMs = retryAfterHeader
        ? Math.min(Math.max(Number(retryAfterHeader) * 1000, 500), 4000)
        : 800 + Math.random() * 400;
      await new Promise((r) => setTimeout(r, retryWaitMs));
      return safeFetchJson<T>(url, options, retries - 1);
    }

    // Try parsing as JSON first
    try {
      const data = await res.json();
      if (data && typeof data.remainingCredits === "number") {
        notifyClientCreditsUpdated(data.remainingCredits);
      }
      if (status === 402) {
        try {
          window.dispatchEvent(new CustomEvent("future-open-credit-store", { detail: data }));
        } catch (_) {}
        return {
          status: 402,
          success: false,
          error: data?.message || "Yetersiz Kredi: Bu işlem için yeterli bakiyeniz bulunmuyor. Kredi Mağazasından hemen ücretsiz hak veya paket alabilirsiniz.",
          code: "INSUFFICIENT_CREDITS",
          ...data,
        };
      }
      if (status === 429) {
        return {
          status,
          success: false,
          error: data?.message || data?.error || "Sunucu meşgul veya istek sınırı aşıldı. Lütfen birkaç saniye sonra tekrar deneyin.",
          code: "TOO_MANY_REQUESTS",
          ...data,
        };
      }
      return { status, ...data };
    } catch (_jsonErr) {
      const text = await res.text().catch(() => "");
      console.warn(`[safeFetchJson] Received non-JSON response from ${url} (${res.status}):`, text.slice(0, 150));
      return {
        success: false,
        status: res.status,
        error:
          res.status === 429
            ? "Sunucu meşgul veya istek sınırı aşıldı. Lütfen birkaç saniye sonra tekrar deneyin."
            : res.status === 503
            ? "Sistemimiz şu anda yüksek yoğunluk altında. Lütfen biraz sonra tekrar deneyin."
            : res.status === 401
            ? "Bu özelliği kullanmak için lütfen giriş yapın veya hesap oluşturun."
            : `Sunucu yanıtı geçersiz (HTTP ${res.status}). Lütfen tekrar deneyin.`,
        code: res.status === 429 ? "TOO_MANY_REQUESTS" : `HTTP_${res.status}`,
      };
    }
  } catch (err: any) {
    if (retries > 0) {
      // Retry once after 500ms in case server was restarting
      await new Promise((r) => setTimeout(r, 500));
      return safeFetchJson<T>(url, options, retries - 1);
    }
    const isTimeout = err?.name === "AbortError" || (err?.message || "").toLowerCase().includes("timeout");
    console.warn(`[safeFetchJson] Transient fetch notice for ${url}:`, err?.message || err);
    return {
      success: false,
      status: 0,
      error: isTimeout ? "İstek zaman aşımına uğradı (Timeout)." : "Ağ bağlantısı veya servis geçici olarak meşgul.",
      code: isTimeout ? "TIMEOUT" : "NETWORK_ERROR",
    };
  }
}

/**
 * Executes an API fetch call with Auto-Healing Credit protection
 */
export async function fetchWithAutoHealingCredit<T = any>(
  url: string,
  fetchOptions: RequestInit = {},
  creditConfig: {
    userEmail?: string;
    featureKey: string;
    featureName: string;
    creditCost: number;
    hasFreeQuota?: boolean;
    onRefund?: (amount: number) => void;
    payload?: any;
  }
): Promise<{ success: boolean; data?: T; error?: string; status?: number; code?: string; [key: string]: any }> {
  const result = await safeFetchJson<T>(url, fetchOptions);

  // If HTTP status is not 200 (e.g. 400, 401, 500, 503, 504) or success is false
  if (!result.success || (result.status && (result.status < 200 || result.status >= 300))) {
    if (creditConfig.creditCost > 0 && creditConfig.userEmail && !creditConfig.hasFreeQuota) {
      const { autoHealingCredit } = await import("./autoHealingCredit");
      const isTimeout = result.code === "TIMEOUT" || (result.error || "").toLowerCase().includes("timeout");
      autoHealingCredit({
        userEmail: creditConfig.userEmail,
        featureKey: creditConfig.featureKey,
        featureName: creditConfig.featureName,
        deductedCredits: creditConfig.creditCost,
        errorMessage: result.error || `HTTP ${result.status} hatası`,
        httpStatus: result.status,
        isTimeout,
        payload: creditConfig.payload,
        refundNote: `Sistem Kaynaklı İade: ${creditConfig.featureName} sorgusunda HTTP ${result.status || 'Hatası'} nedeniyle ${creditConfig.creditCost} kredi bakiye kurtarma yapıldı.`,
        onRefundCredits: creditConfig.onRefund,
      });
    }
  }

  return result;
}
