import { createFileRoute, Navigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { AppHeader } from "@/components/AppHeader";
import { ProgressionCollection } from "@/components/ProgressionCollection";
import { calculatePlayerProgression, PLAYER_STORAGE_KEYS } from "@/lib/player-progression";
import { useAppStore } from "@/state/app-store";

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
  const [ledger, setLedger] = useState<{ ids: string[]; xp: number }>({ ids: [], xp: 0 });

  useEffect(() => {
    try {
      const parsed = JSON.parse(
        window.localStorage.getItem(PLAYER_STORAGE_KEYS.completedMissions) ?? "[]",
      ) as unknown;
      const ids = Array.isArray(parsed)
        ? parsed.filter((value): value is string => typeof value === "string")
        : [];
      const xp = Number(window.localStorage.getItem(PLAYER_STORAGE_KEYS.missionXp));
      setLedger({ ids, xp: Number.isFinite(xp) ? xp : 0 });
    } catch {
      setLedger({ ids: [], xp: 0 });
    }
  }, []);

  const progression = useMemo(
    () => calculatePlayerProgression(patches, settings.displayName, ledger.ids, ledger.xp),
    [ledger, patches, settings.displayName],
  );

  if (!ready) return <div className="min-h-screen bg-background" />;
  if (!settings.onboarded) return <Navigate to="/" />;

  return (
    <div className="min-h-screen bg-background pb-12">
      <AppHeader title="Progressione" subtitle={`Livello ${progression.level}`} backTo="/" />
      <main className="mx-auto max-w-3xl px-4 py-5">
        <ProgressionCollection progression={progression} />
      </main>
    </div>
  );
}
