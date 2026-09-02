import { FileCheck2, Flame, ListChecks, Trophy } from "lucide-react";
import type { Patch } from "@/lib/patch-model";
import { calculatePlayerProgression } from "@/lib/player-progression";
import { PatchyMascot } from "@/components/PatchyMascot";

interface PlayerProfileCardProps {
  displayName: string;
  patches: readonly Patch[];
}

export function PlayerProfileCard({ displayName, patches }: PlayerProfileCardProps) {
  const progression = calculatePlayerProgression(patches);

  return (
    <section className="surface-card overflow-hidden p-4" aria-labelledby="player-profile-title">
      <div className="flex items-center gap-3">
        <div className="relative shrink-0">
          <PatchyMascot className="size-20 object-contain" pose="celebrate" decorative />
          <span className="absolute -bottom-1 -right-1 flex size-8 items-center justify-center rounded-full border-2 border-background bg-brand text-xs font-black text-brand-foreground">
            {progression.level}
          </span>
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-xs font-bold uppercase tracking-wider text-brand">Profilo giocatore</p>
          <h2 id="player-profile-title" className="truncate text-xl font-extrabold text-foreground">
            {displayName || "Giocatore"} · Livello {progression.level}
          </h2>
          <p className="text-sm font-semibold text-muted-foreground">{progression.title}</p>
        </div>
        <Trophy className="size-6 shrink-0 text-brand" aria-hidden="true" />
      </div>

      <div className="mt-4">
        <div className="flex justify-between gap-3 text-xs font-semibold text-muted-foreground">
          <span>{progression.totalXp} XP totali</span>
          <span>
            {progression.xpIntoLevel}/{progression.xpPerLevel} XP
          </span>
        </div>
        <div
          role="progressbar"
          aria-label={`Esperienza verso il livello ${progression.level + 1}`}
          aria-valuemin={0}
          aria-valuemax={progression.xpPerLevel}
          aria-valuenow={progression.xpIntoLevel}
          className="mt-2 h-2 overflow-hidden rounded-full bg-surface-2"
        >
          <div
            className="h-full rounded-full bg-brand transition-[width]"
            style={{ width: `${progression.progressPercent}%` }}
          />
        </div>
      </div>

      <dl className="mt-4 grid grid-cols-3 gap-2 text-center">
        <div className="rounded-lg border border-border bg-surface-2 p-2">
          <FileCheck2 className="mx-auto size-4 text-brand" aria-hidden="true" />
          <dt className="mt-1 text-[0.65rem] uppercase tracking-wide text-muted-foreground">
            Pubblicate
          </dt>
          <dd className="text-lg font-black text-foreground">{progression.publishedPatches}</dd>
        </div>
        <div className="rounded-lg border border-border bg-surface-2 p-2">
          <Flame className="mx-auto size-4 text-brand" aria-hidden="true" />
          <dt className="mt-1 text-[0.65rem] uppercase tracking-wide text-muted-foreground">
            Serie
          </dt>
          <dd className="text-lg font-black text-foreground">{progression.weeklyStreak}</dd>
        </div>
        <div className="rounded-lg border border-border bg-surface-2 p-2">
          <ListChecks className="mx-auto size-4 text-brand" aria-hidden="true" />
          <dt className="mt-1 text-[0.65rem] uppercase tracking-wide text-muted-foreground">
            Voci
          </dt>
          <dd className="text-lg font-black text-foreground">{progression.totalItems}</dd>
        </div>
      </dl>

      {progression.publishedPatches === 0 ? (
        <p className="mt-3 text-center text-xs text-muted-foreground">
          Pubblica la prima patch per guadagnare XP e iniziare la tua serie.
        </p>
      ) : null}
    </section>
  );
}
