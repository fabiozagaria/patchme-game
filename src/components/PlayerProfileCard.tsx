import { useEffect, useMemo, useState } from "react";
import {
  Check,
  ChevronDown,
  FileCheck2,
  Flame,
  Gamepad2,
  ListChecks,
  LockKeyhole,
  Medal,
  Sparkles,
  Trophy,
} from "lucide-react";
import { toast } from "sonner";
import type { Patch } from "@/lib/patch-model";
import { calculatePlayerProgression } from "@/lib/player-progression";
import { PatchyMascot } from "@/components/PatchyMascot";

interface PlayerProfileCardProps {
  displayName: string;
  patches: readonly Patch[];
}

const LAST_XP_KEY = "patchme.player.last-xp.v1";
const COMPLETED_MISSIONS_KEY = "patchme.player.completed-missions.v1";
const MISSION_XP_KEY = "patchme.player.mission-xp.v1";
const LAST_STREAK_KEY = "patchme.player.last-streak.v1";

export function PlayerProfileCard({ displayName, patches }: PlayerProfileCardProps) {
  const [missionLedger, setMissionLedger] = useState<{ ids: string[]; xp: number }>({
    ids: [],
    xp: 0,
  });
  const progression = useMemo(
    () => calculatePlayerProgression(patches, displayName, missionLedger.ids, missionLedger.xp),
    [displayName, missionLedger, patches],
  );
  const [levelUp, setLevelUp] = useState(false);
  const [streakCelebration, setStreakCelebration] = useState(false);
  const currentlyCompletedIds = useMemo(
    () => progression.missions.filter((mission) => mission.completed).map((mission) => mission.id),
    [progression.missions],
  );
  const currentlyCompletedKey = currentlyCompletedIds.join(",");

  useEffect(() => {
    try {
      const saved = JSON.parse(
        window.localStorage.getItem(COMPLETED_MISSIONS_KEY) ?? "[]",
      ) as unknown;
      const savedIds = Array.isArray(saved)
        ? saved.filter((value): value is string => typeof value === "string")
        : [];
      const savedXpRaw = window.localStorage.getItem(MISSION_XP_KEY);
      const savedXpValue = Number(savedXpRaw);
      const migratedXp = progression.missions
        .filter((mission) => savedIds.includes(mission.id))
        .reduce((total, mission) => total + mission.rewardXp, 0);
      const savedXp =
        savedXpRaw !== null && Number.isFinite(savedXpValue) ? savedXpValue : migratedXp;
      const savedSet = new Set(savedIds);
      const newlyCompleted = progression.missions.filter(
        (mission) => mission.completed && !savedSet.has(mission.id),
      );
      const merged = [...new Set([...savedIds, ...currentlyCompletedIds])];
      const newlyEarnedXp = newlyCompleted.reduce((total, mission) => total + mission.rewardXp, 0);
      const mergedXp = savedXp + newlyEarnedXp;

      window.localStorage.setItem(COMPLETED_MISSIONS_KEY, JSON.stringify(merged));
      window.localStorage.setItem(MISSION_XP_KEY, String(mergedXp));
      setMissionLedger((current) => {
        const sameIds =
          current.ids.length === merged.length && current.ids.every((id) => merged.includes(id));
        return sameIds && current.xp === mergedXp ? current : { ids: merged, xp: mergedXp };
      });

      newlyCompleted.forEach((mission) =>
        toast.success(`Trofeo sbloccato: ${mission.title}`, {
          description: `Missione completata · +${mission.rewardXp} XP`,
          duration: 5000,
        }),
      );
    } catch {
      // Missioni e trofei restano utilizzabili anche senza persistenza locale.
    }
  }, [currentlyCompletedIds, currentlyCompletedKey, progression.missions]);

  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(LAST_STREAK_KEY);
      window.localStorage.setItem(LAST_STREAK_KEY, String(progression.weeklyStreak));
      if (stored === null) return;

      const previousStreak = Number(stored);
      if (!Number.isFinite(previousStreak) || progression.weeklyStreak <= previousStreak) return;

      setStreakCelebration(true);
      toast.success(
        previousStreak === 0
          ? "SERIE INIZIATA! Il falò è acceso."
          : `SERIE CONTINUATA! ${progression.weeklyStreak} settimane`,
        {
          description: "Patchy approva questa discutibile costanza.",
          duration: 5000,
        },
      );
      const timer = window.setTimeout(() => setStreakCelebration(false), 3600);
      return () => window.clearTimeout(timer);
    } catch {
      // La serie resta visibile anche se il browser non consente la persistenza.
    }
  }, [progression.weeklyStreak]);

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

  const missionGroups = [
    { kind: "daily", label: "Missioni giornaliere", hint: "Si rinnovano ogni giorno" },
    { kind: "weekly", label: "Missioni settimanali", hint: "Si rinnovano ogni lunedì" },
    { kind: "base", label: "Missioni permanenti", hint: "Una volta sola, ma sono parecchie" },
    { kind: "secret", label: "Easter egg", hint: "Requisiti volutamente incomprensibili" },
  ] as const;

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
        <div
          className={`rounded-lg border border-border bg-surface-2 p-2 ${
            streakCelebration ? "streak-celebrate" : ""
          }`}
        >
          <Flame
            className={`mx-auto size-4 text-brand ${streakCelebration ? "streak-flame" : ""}`}
            aria-hidden="true"
          />
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

      <details className="group mt-4 border-t border-border pt-3">
        <summary className="tap-safe flex cursor-pointer list-none items-center gap-2 rounded-lg px-2 text-sm font-bold text-foreground hover:bg-surface-2">
          <Gamepad2 className="size-5 text-brand" aria-hidden="true" />
          <span className="flex-1">Titoli, missioni e trofei</span>
          <span className="text-xs text-muted-foreground">
            {progression.missions.filter((mission) => mission.completed).length}/
            {progression.missions.length}
          </span>
          <ChevronDown
            className="size-4 transition-transform group-open:rotate-180"
            aria-hidden="true"
          />
        </summary>

        <div className="mt-3 space-y-4">
          <section aria-labelledby="missions-title">
            <div className="flex items-center justify-between gap-2">
              <h3 id="missions-title" className="text-sm font-black uppercase text-foreground">
                Missioni e trofei
              </h3>
              <span className="text-xs font-bold text-brand">+{progression.bonusXp} XP bonus</span>
            </div>
            <div className="mt-3 space-y-4">
              {missionGroups.map((group) => {
                const missions = progression.missions.filter(
                  (mission) => mission.kind === group.kind,
                );
                return (
                  <div key={group.kind}>
                    <div className="flex items-end justify-between gap-2">
                      <div>
                        <h4 className="text-xs font-black uppercase text-foreground">
                          {group.label}
                        </h4>
                        <p className="text-[0.68rem] text-muted-foreground">{group.hint}</p>
                      </div>
                      <span className="text-[0.68rem] font-bold text-muted-foreground">
                        {missions.filter((mission) => mission.completed).length}/{missions.length}
                      </span>
                    </div>
                    <ul className="mt-2 space-y-2">
                      {missions.map((mission) => (
                        <li
                          key={mission.id}
                          className={`flex items-start gap-3 rounded-lg border p-3 ${
                            mission.completed
                              ? "border-brand/50 bg-brand/10"
                              : "border-border bg-surface-2"
                          }`}
                        >
                          <span className="mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-full bg-background">
                            {mission.completed ? (
                              <Medal className="size-4 text-brand" aria-hidden="true" />
                            ) : (
                              <LockKeyhole
                                className="size-4 text-muted-foreground"
                                aria-hidden="true"
                              />
                            )}
                          </span>
                          <div className="min-w-0 flex-1">
                            <p className="text-sm font-bold text-foreground">{mission.title}</p>
                            <p className="text-xs text-muted-foreground">
                              {mission.completed && mission.secret
                                ? "Hai capito il riferimento. Patchy è confuso ma impressionato."
                                : mission.description}
                            </p>
                          </div>
                          <span className="shrink-0 text-xs font-black text-brand">
                            {mission.completed ? (
                              <Check className="size-4" aria-label="Completata" />
                            ) : (
                              `+${mission.rewardXp}`
                            )}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                );
              })}
            </div>
          </section>

          <section aria-labelledby="titles-title">
            <h3 id="titles-title" className="text-sm font-black uppercase text-foreground">
              Titoli da sbloccare
            </h3>
            <ol className="mt-2 grid gap-2 sm:grid-cols-2">
              {progression.titles.map((title, index) => {
                const unlocked = progression.level >= index + 1;
                return (
                  <li
                    key={title}
                    className={`flex items-center gap-2 rounded-lg border px-3 py-2 text-xs ${
                      unlocked
                        ? "border-brand/40 bg-brand/10 font-bold text-foreground"
                        : "border-border bg-surface-2 text-muted-foreground"
                    }`}
                  >
                    {unlocked ? (
                      <Trophy className="size-4 shrink-0 text-brand" aria-hidden="true" />
                    ) : (
                      <LockKeyhole className="size-4 shrink-0" aria-hidden="true" />
                    )}
                    <span>
                      Liv. {index + 1} · {unlocked ? title : "???"}
                    </span>
                  </li>
                );
              })}
            </ol>
          </section>
        </div>
      </details>

      {progression.publishedPatches === 0 ? (
        <p className="mt-3 text-center text-xs text-muted-foreground">
          Pubblica la prima patch per guadagnare XP e iniziare la tua serie.
        </p>
      ) : null}
    </section>
  );
}
