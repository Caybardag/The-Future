import { describe, it, expect, beforeEach } from "vitest";
import { safeStorage } from "./safeStorage";

describe("safeStorage Unit Tests", () => {
  beforeEach(() => {
    safeStorage.clear();
  });

  it("Değerleri güvenli bir şekilde kaydetmeli ve okumalı", () => {
    safeStorage.setItem("test_key", "futurist_data_2060");
    const val = safeStorage.getItem("test_key");
    expect(val).toBe("futurist_data_2060");
  });

  it("JSON nesnelerini hatasız seri hale getirmeli ve parse etmeli", () => {
    const payload = { credits: 100, user: "test@example.com", isVip: true };
    safeStorage.setJSON("user_profile_data", payload);

    const parsed = safeStorage.getJSON<{ credits: number; user: string; isVip: boolean }>(
      "user_profile_data",
      { credits: 0, user: "", isVip: false }
    );

    expect(parsed.credits).toBe(100);
    expect(parsed.user).toBe("test@example.com");
    expect(parsed.isVip).toBe(true);
  });

  it("Olmayan bir anahtar sorgulandığında varsayılan değeri döndürmeli", () => {
    const fallback = { status: "empty" };
    const res = safeStorage.getJSON("non_existing_key", fallback);
    expect(res).toEqual(fallback);
  });

  it("Öğeyi güvenle silmeli", () => {
    safeStorage.setItem("temporary_item", "123");
    expect(safeStorage.getItem("temporary_item")).toBe("123");

    safeStorage.removeItem("temporary_item");
    expect(safeStorage.getItem("temporary_item")).toBeNull();
  });
});
