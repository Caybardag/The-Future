/**
 * Safe and resilient LocalStorage wrapper
 * Prevents DOMException / SecurityError in iframe sandboxes,
 * private browsing modes, and storage quota overflows.
 */

const memoryStorage = new Map<string, string>();

function isStorageAvailable(): boolean {
  try {
    const testKey = "__storage_probe__";
    window.localStorage.setItem(testKey, testKey);
    window.localStorage.removeItem(testKey);
    return true;
  } catch {
    return false;
  }
}

const storageAvailable = typeof window !== "undefined" && isStorageAvailable();

export const safeStorage = {
  getItem(key: string): string | null {
    if (storageAvailable) {
      try {
        return window.localStorage.getItem(key);
      } catch (e) {
        console.warn(`[safeStorage] getItem failed for key "${key}":`, e);
      }
    }
    return memoryStorage.get(key) ?? null;
  },

  setItem(key: string, value: string): boolean {
    if (storageAvailable) {
      try {
        window.localStorage.setItem(key, value);
        return true;
      } catch (e) {
        console.warn(`[safeStorage] setItem failed for key "${key}", falling back to memory:`, e);
      }
    }
    memoryStorage.set(key, value);
    return true;
  },

  removeItem(key: string): void {
    if (storageAvailable) {
      try {
        window.localStorage.removeItem(key);
      } catch (e) {
        console.warn(`[safeStorage] removeItem failed for key "${key}":`, e);
      }
    }
    memoryStorage.delete(key);
  },

  clear(): void {
    if (storageAvailable) {
      try {
        window.localStorage.clear();
      } catch (e) {
        console.warn(`[safeStorage] clear failed:`, e);
      }
    }
    memoryStorage.clear();
  },

  getJSON<T>(key: string, defaultValue: T): T {
    const raw = this.getItem(key);
    if (!raw) return defaultValue;
    try {
      return JSON.parse(raw) as T;
    } catch (e) {
      console.warn(`[safeStorage] Corrupted JSON in key "${key}", returning default:`, e);
      return defaultValue;
    }
  },

  setJSON<T>(key: string, value: T): boolean {
    try {
      const serialized = JSON.stringify(value);
      return this.setItem(key, serialized);
    } catch (e) {
      console.warn(`[safeStorage] Failed to serialize JSON for key "${key}":`, e);
      return false;
    }
  },
};
