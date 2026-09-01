import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import { DEFAULT_SETTINGS, type AppSettings, type Patch } from "@/lib/patch-model";
import { patchRepository, settingsRepository, storageAvailable } from "@/lib/storage";

interface AppStore {
  ready: boolean;
  canPersist: boolean;
  settings: AppSettings;
  patches: Patch[];
  saveSettings: (next: AppSettings) => void;
  savePatch: (patch: Patch) => void;
  deletePatch: (id: string) => void;
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
    setSettings(next);
    settingsRepository.save(next);
  }, []);

  const savePatch = useCallback((patch: Patch) => {
    setPatches(patchRepository.upsert(patch));
  }, []);

  const deletePatch = useCallback((id: string) => {
    setPatches(patchRepository.remove(id));
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
