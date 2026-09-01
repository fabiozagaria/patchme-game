import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import { DEFAULT_SETTINGS, type AppSettings, type Patch } from "@/lib/patch-model";
import { patchRepository, settingsRepository, storageAvailable } from "@/lib/storage";

interface AppStore {
  ready: boolean;
  canPersist: boolean;
  settings: AppSettings;
  patches: Patch[];
  /** Restituiscono false se la persistenza locale fallisce. */
  saveSettings: (next: AppSettings) => boolean;
  savePatch: (patch: Patch) => boolean;
  deletePatch: (id: string) => boolean;
}

const AppStoreContext = createContext<AppStore | null>(null);

export function AppStoreProvider({ children }: { children: ReactNode }) {
  const [ready, setReady] = useState(false);
  const [canPersist, setCanPersist] = useState(true);
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS);
  const [patches, setPatches] = useState<Patch[]>([]);

  useEffect(() => {
    setSettings(settingsRepository.load());
    setPatches(patchRepository.list());
    setCanPersist(storageAvailable());
    setReady(true);
  }, []);

  const saveSettings = useCallback((next: AppSettings) => {
    const ok = settingsRepository.save(next);
    if (ok) setSettings(next);
    else setCanPersist(false);
    return ok;
  }, []);

  const savePatch = useCallback((patch: Patch) => {
    const ok = patchRepository.upsert(patch);
    if (!ok.persisted) {
      setCanPersist(false);
      return false;
    }
    setPatches(ok.patches);
    return true;
  }, []);

  const deletePatch = useCallback((id: string) => {
    const result = patchRepository.remove(id);
    if (!result.persisted) {
      setCanPersist(false);
      return false;
    }
    setPatches(result.patches);
    return true;
  }, []);


  const value = useMemo<AppStore>(
    () => ({ ready, canPersist, settings, patches, saveSettings, savePatch, deletePatch }),
    [ready, canPersist, settings, patches, saveSettings, savePatch, deletePatch],
  );

  return <AppStoreContext.Provider value={value}>{children}</AppStoreContext.Provider>;
}

export function useAppStore(): AppStore {
  const ctx = useContext(AppStoreContext);
  if (!ctx) throw new Error("useAppStore deve essere usato dentro AppStoreProvider");
  return ctx;
}
