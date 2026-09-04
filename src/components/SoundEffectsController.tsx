import { useEffect } from "react";
import { setHardcoreAmbienceEnabled, setSoundEffectsEnabled } from "@/lib/sound-effects";
import { useAppStore } from "@/state/app-store";

export function SoundEffectsController() {
  const { ready, settings } = useAppStore();

  useEffect(() => {
    if (ready) setSoundEffectsEnabled(settings.soundEffects);
  }, [ready, settings.soundEffects]);

  useEffect(() => {
    if (!ready) return;
    setHardcoreAmbienceEnabled(settings.hardcoreMode && settings.soundEffects);
    return () => setHardcoreAmbienceEnabled(false);
  }, [ready, settings.hardcoreMode, settings.soundEffects]);

  return null;
}
