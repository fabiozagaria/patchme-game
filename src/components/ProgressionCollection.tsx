import { Check, LockKeyhole, Medal, Trophy } from "lucide-react";
import type { PlayerProgression } from "@/lib/player-progression";
import { BitCoin } from "@/components/BitCoin";
import { hardcoreCopy } from "@/lib/hardcore-copy";

const MISSION_GROUPS = [
  { kind: "daily", label: "Missioni giornaliere", hint: "Si rinnovano ogni giorno" },
  { kind: "weekly", label: "Missioni settimanali", hint: "Si rinnovano ogni lunedì" },
  { kind: "base", label: "Missioni permanenti", hint: "Una volta sola, ma sono parecchie" },
  {
    kind: "secret",
    label: "Easter egg",
    hint: "Il titolo suggerisce il gioco. Il nome giusto sblocca il trofeo.",
  },
] as const;

export function ProgressionCollection({
  progression,
  hardcoreMode = false,
}: {
  progression: PlayerProgression;
  hardcoreMode?: boolean;
}) {
  return (
    <div className="space-y-5">
      <section className="surface-card p-4" aria-labelledby="missions-title">
        <div className="flex items-center justify-between gap-2">
          <div>
            <h2 id="missions-title" className="text-xl font-black uppercase text-foreground">
              {hardcoreCopy(hardcoreMode, "Missioni e trofei", "Missioni e trofei del cazzo")}
            </h2>
            <p className="text-xs text-muted-foreground">
              {hardcoreCopy(
                hardcoreMode,
                "Completa obiettivi, accumula XP e Bit e cerca di capire gli easter egg.",
                "Completa 'ste missioni, arraffa XP e Bit e prova a capire gli easter egg, genio.",
              )}
            </p>
          </div>
          <span className="shrink-0 text-xs font-black text-brand">+{progression.bonusXp} XP</span>
        </div>

        <div className="mt-5 space-y-6">
          {MISSION_GROUPS.map((group) => {
            const missions = progression.missions.filter((mission) => mission.kind === group.kind);
            return (
              <details
                key={group.kind}
                defaultOpen={group.kind === "daily"}
                className="group overflow-hidden rounded-xl border border-border bg-surface-2"
              >
                <summary className="tap-safe flex cursor-pointer list-none items-center justify-between gap-2 px-3 py-3 marker:hidden">
                  <div>
                    <h3
                      id={`mission-group-${group.kind}`}
                      className="text-sm font-black uppercase text-foreground"
                    >
                      {group.label}
                    </h3>
                    <p className="text-xs text-muted-foreground">{group.hint}</p>
                  </div>
                  <span className="text-xs font-bold text-muted-foreground">
                    {missions.filter((mission) => mission.completed).length}/{missions.length}
                  </span>
                </summary>
                <ul className="space-y-2 border-t border-border p-2">
                  {missions.map((mission) => (
                    <li
                      key={mission.id}
                      className={`flex items-start gap-3 rounded-xl border p-3 ${
                        mission.completed
                          ? "border-brand/50 bg-brand/10"
                          : "border-border bg-surface-2"
                      }`}
                    >
                      <span className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-full bg-background">
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
                        <p className="text-sm font-bold text-foreground">
                          {mission.hiddenUntilCompleted && !mission.completed
                            ? "???"
                            : mission.title}
                        </p>
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
                          <span className="flex items-center gap-1">
                            +{mission.rewardXp} XP · +{mission.rewardBits}{" "}
                            <BitCoin className="size-3.5" />
                          </span>
                        )}
                      </span>
                    </li>
                  ))}
                </ul>
              </details>
            );
          })}
        </div>
      </section>

      <details className="surface-card group overflow-hidden" aria-labelledby="titles-title">
        <summary className="tap-safe cursor-pointer list-none p-4 marker:hidden">
          <h2 id="titles-title" className="text-xl font-black uppercase text-foreground">
            {hardcoreCopy(hardcoreMode, "Titoli da sbloccare", "Titoli sempre più rincoglioniti")}
          </h2>
          <p className="text-xs text-muted-foreground">
            {hardcoreCopy(
              hardcoreMode,
              "Tocca per vedere la collezione completa senza farti chilometri di scroll.",
              "Apri 'sta roba solo se vuoi contemplare quanto tempo hai buttato.",
            )}
          </p>
        </summary>
        <ol className="grid gap-2 border-t border-border p-4 sm:grid-cols-2">
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
      </details>
    </div>
  );
}
