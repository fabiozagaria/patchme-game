import { useEffect } from "react";
import { setSoundEffectsEnabled } from "@/lib/sound-effects";
import { useAppStore } from "@/state/app-store";

export function SoundEffectsController() {
  const { ready, settings } = useAppStore();

  useEffect(() => {
    if (ready) setSoundEffectsEnabled(settings.soundEffects);
  }, [ready, settings.soundEffects]);

  return null;
}
