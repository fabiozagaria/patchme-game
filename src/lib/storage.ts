/**
 * Repository di persistenza locale.
 * Unico punto dell'app che tocca localStorage: resiste ad assenza di storage
 * e a dati non validi (fallback ai valori di default).
 */
import { APP_CONFIG } from "@/config/app-config";
import {
  DEFAULT_SETTINGS,
  patchSchema,
  settingsSchema,
  type AppSettings,
  type Patch,
} from "./patch-model";

function safeStorage(): Storage | null {
  try {
    if (typeof window === "undefined" || !window.localStorage) return null;
    const probe = "__patchme_probe__";
    window.localStorage.setItem(probe, "1");
    window.localStorage.removeItem(probe);
    return window.localStorage;
  } catch {
    return null;
  }
}

function readRaw(key: string): unknown {
  const store = safeStorage();
  if (!store) return null;
  try {
    const raw = store.getItem(key);
    return raw ? (JSON.parse(raw) as unknown) : null;
  } catch {
    return null;
  }
}

function writeRaw(key: string, value: unknown): boolean {
  const store = safeStorage();
  if (!store) return false;
  try {
    store.setItem(key, JSON.stringify(value));
    return true;
  } catch {
    return false;
  }
}

export const storageAvailable = (): boolean => safeStorage() !== null;

export const settingsRepository = {
  load(): AppSettings {
    const parsed = settingsSchema.safeParse(readRaw(APP_CONFIG.storageKeys.settings));
    return parsed.success ? parsed.data : DEFAULT_SETTINGS;
  },
  save(settings: AppSettings): boolean {
    return writeRaw(APP_CONFIG.storageKeys.settings, settings);
  },
};

export const patchRepository = {
  list(): Patch[] {
    const raw = readRaw(APP_CONFIG.storageKeys.patches);
    if (!Array.isArray(raw)) return [];
    const valid: Patch[] = [];
    for (const entry of raw) {
      const parsed = patchSchema.safeParse(entry);
      if (parsed.success) valid.push(parsed.data);
    }
    return valid.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
  },
  saveAll(patches: readonly Patch[]): boolean {
    return writeRaw(APP_CONFIG.storageKeys.patches, patches);
  },
  get(id: string): Patch | undefined {
    return this.list().find((p) => p.id === id);
  },
  upsert(patch: Patch): Patch[] {
    const all = this.list();
    const index = all.findIndex((p) => p.id === patch.id);
    if (index >= 0) all[index] = patch;
    else all.unshift(patch);
    const sorted = all.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
    this.saveAll(sorted);
    return sorted;
  },
  remove(id: string): Patch[] {
    const next = this.list().filter((p) => p.id !== id);
    this.saveAll(next);
    return next;
  },
};
