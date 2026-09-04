import { createFileRoute, Navigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { AppHeader } from "@/components/AppHeader";
import { ProgressionCollection } from "@/components/ProgressionCollection";
import { calculatePlayerProgression } from "@/lib/player-progression";
import {
  EMPTY_PROGRESSION_STATE,
  loadProgressionState,
  type ProgressionState,
} from "@/lib/progression-repository";
import { useAppStore } from "@/state/app-store";
import { hardcoreCopy } from "@/lib/hardcore-copy";

export const Route = createFileRoute("/progress")({
  head: () => ({
    meta: [
      { title: "Missioni e trofei — PatchMe" },
      {
        name: "description",
        content: "Scopri missioni, trofei, easter egg e titoli sbloccabili di PatchMe.",
      },
    ],
  }),
  component: ProgressPage,
});

function ProgressPage() {
  const { ready, settings, patches } = useAppStore();
  const [persisted, setPersisted] = useState<ProgressionState>(EMPTY_PROGRESSION_STATE);

  useEffect(() => {
    setPersisted(loadProgressionState());
  }, []);

  const progression = useMemo(
    () =>
      calculatePlayerProgression(
        patches,
        settings.displayName,
        persisted.completedMissionIds,
        persisted.missionXp,
        new Date(),
        persisted.highestStreak,
      ),
    [patches, persisted, settings.displayName],
  );

  if (!ready) return <div className="min-h-screen bg-background" />;
  if (!settings.onboarded) return <Navigate to="/" />;

  return (
    <div className="min-h-screen bg-background pb-12">
      <AppHeader
        title={hardcoreCopy(settings.hardcoreMode, "Progressione", "Quanto tempo hai buttato")}
        subtitle={hardcoreCopy(
          settings.hardcoreMode,
          `Livello ${progression.level}`,
          `Livello ${progression.level}, fenomeno`,
        )}
        backTo="/"
      />
      <main className="mx-auto max-w-3xl px-4 py-5">
        <ProgressionCollection progression={progression} />
      </main>
    </div>
  );
}
