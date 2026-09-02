import { useEffect, useState } from "react";
import { FileCheck2, Flame, ListChecks, Sparkles, Trophy } from "lucide-react";
import { toast } from "sonner";
import type { Patch } from "@/lib/patch-model";
import { calculatePlayerProgression } from "@/lib/player-progression";
import { PatchyMascot } from "@/components/PatchyMascot";

interface PlayerProfileCardProps {
  displayName: string;
  patches: readonly Patch[];
}

const LAST_XP_KEY = "patchme.player.last-xp.v1";

export function PlayerProfileCard({ displayName, patches }: PlayerProfileCardProps) {
  const progression = calculatePlayerProgression(patches);
  const [levelUp, setLevelUp] = useState(false);

  useEffect(() => {
    try {
      const storedXp = window.localStorage.getItem(LAST_XP_KEY);
      window.localStorage.setItem(LAST_XP_KEY, String(progression.totalXp));
      if (storedXp === null) return;

      const previousXp = Number(storedXp);
      const gainedXp = progression.totalXp - previousXp;
      if (!Number.isFinite(previousXp) || gainedXp <= 0) return;

      const previousLevel = Math.floor(previousXp / progression.xpPerLevel) + 1;
      toast.success(`+${gainedXp} XP guadagnati`, {
        description: "La tua patch è entrata nella storia. Più o meno.",
      });

      if (progression.level > previousLevel) {
        setLevelUp(true);
        toast.success(`LEVEL UP! Ora sei livello ${progression.level}`, {
          description: progression.title,
          duration: 5000,
        });
        const timer = window.setTimeout(() => setLevelUp(false), 3800);
        return () => window.clearTimeout(timer);
      }
    } catch {
      // La progressione funziona anche quando localStorage non è disponibile.
    }
  }, [progression.level, progression.title, progression.totalXp, progression.xpPerLevel]);

  return (
    <section
      className={`surface-card relative overflow-hidden p-4 ${levelUp ? "player-level-up" : ""}`}
      aria-labelledby="player-profile-title"
    >
      {levelUp ? (
        <div
          className="level-up-banner absolute inset-x-3 top-3 z-10 rounded-xl border border-brand bg-background/95 px-3 py-2 text-center shadow-xl"
          role="status"
          aria-live="polite"
        >
          <p className="display text-2xl font-black uppercase tracking-wider text-brand">
            Level up!
          </p>
          <p className="text-xs font-bold text-foreground">Nuovo titolo: {progression.title}</p>
        </div>
      ) : null}
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
            className="xp-progress h-full rounded-full bg-brand transition-[width] duration-700"
            style={{ width: `${progression.progressPercent}%` }}
          />
        </div>
        <p className="mt-2 flex items-center justify-center gap-1 text-[0.68rem] font-semibold text-muted-foreground">
          <Sparkles className="size-3 text-brand" aria-hidden="true" />
          100 XP per patch + 10 XP per voce
        </p>
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
