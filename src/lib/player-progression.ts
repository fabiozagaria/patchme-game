import type { Patch } from "@/lib/patch-model";

const XP_PER_LEVEL = 250;
const XP_PER_PATCH = 100;
const XP_PER_ITEM = 10;
const WEEK_MS = 7 * 24 * 60 * 60 * 1000;

export interface PlayerMission {
  id: string;
  title: string;
  description: string;
  rewardXp: number;
  completed: boolean;
  secret?: boolean;
}

export interface PlayerProgression {
  level: number;
  title: string;
  totalXp: number;
  xpIntoLevel: number;
  xpPerLevel: number;
  progressPercent: number;
  publishedPatches: number;
  totalItems: number;
  weeklyStreak: number;
  bonusXp: number;
  missions: PlayerMission[];
  titles: readonly string[];
}

const PLAYER_TITLES = [
  "NPC col libero arbitrio difettoso",
  "Idraulico abusivo del regno dei funghi",
  "Bandicoot fiscalmente instabile",
  "Draghetto viola con l'alito da discount",
  "Arrampicamuri con l'affitto arretrato",
  "Dio della guerra sconfitto dalla sveglia",
  "Non-morto senza anime né ferie",
  "Prescelto del falò, vittima del lunedì",
  "Boss finale delle decisioni di merda",
  "Leggenda col salvataggio corrotto",
] as const;

export function playerTitle(level: number) {
  return PLAYER_TITLES[Math.min(Math.max(level, 1), PLAYER_TITLES.length) - 1];
}

function missionProgress(
  publishedPatches: number,
  totalItems: number,
  weeklyStreak: number,
  displayName: string,
  completedMissionIds: readonly string[],
): PlayerMission[] {
  const completed = new Set(completedMissionIds);
  const mission = (
    id: string,
    title: string,
    description: string,
    rewardXp: number,
    condition: boolean,
    secret = false,
  ): PlayerMission => ({
    id,
    title,
    description,
    rewardXp,
    completed: condition || completed.has(id),
    secret,
  });

  return [
    mission(
      "first-patch",
      "Premere START",
      "Pubblica la tua prima patch",
      50,
      publishedPatches >= 1,
    ),
    mission("triple-combo", "Combo da divano", "Pubblica 3 patch", 100, publishedPatches >= 3),
    mission(
      "item-hoarder",
      "Inventario pieno di cianfrusaglie",
      "Crea 10 voci",
      100,
      totalItems >= 10,
    ),
    mission(
      "weekly-fire",
      "Riposa al falò",
      "Mantieni una serie di 2 settimane",
      150,
      weeklyStreak >= 2,
    ),
    mission(
      "patch-boss",
      "Nessuno te l'aveva chiesto",
      "Pubblica 10 patch",
      250,
      publishedPatches >= 10,
    ),
    mission(
      "god-of-war",
      "Diventa il dio della Guerra",
      "???",
      300,
      displayName.trim().toLocaleLowerCase("it") === "kratos",
      true,
    ),
  ];
}

function weekStart(dateValue: string) {
  const date = new Date(dateValue);
  if (Number.isNaN(date.getTime())) return null;
  const utc = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
  const day = utc.getUTCDay() || 7;
  utc.setUTCDate(utc.getUTCDate() - day + 1);
  return utc.getTime();
}

function calculateWeeklyStreak(patches: readonly Patch[]) {
  const weeks = [
    ...new Set(
      patches
        .map((patch) => weekStart(patch.date))
        .filter((value): value is number => value !== null),
    ),
  ].sort((a, b) => b - a);

  if (weeks.length === 0) return 0;
  let streak = 1;
  for (let index = 1; index < weeks.length; index += 1) {
    if (weeks[index - 1] - weeks[index] !== WEEK_MS) break;
    streak += 1;
  }
  return streak;
}

export function calculatePlayerProgression(
  patches: readonly Patch[],
  displayName = "",
  completedMissionIds: readonly string[] = [],
): PlayerProgression {
  const published = patches.filter((patch) => patch.status === "published");
  const totalItems = published.reduce(
    (total, patch) =>
      total +
      patch.sections.reduce(
        (sectionTotal, section) =>
          sectionTotal + section.items.filter((item) => item.text.trim().length > 0).length,
        0,
      ),
    0,
  );
  const weeklyStreak = calculateWeeklyStreak(published);
  const missions = missionProgress(
    published.length,
    totalItems,
    weeklyStreak,
    displayName,
    completedMissionIds,
  );
  const bonusXp = missions
    .filter((mission) => mission.completed)
    .reduce((total, mission) => total + mission.rewardXp, 0);
  const totalXp = published.length * XP_PER_PATCH + totalItems * XP_PER_ITEM + bonusXp;
  const level = Math.floor(totalXp / XP_PER_LEVEL) + 1;
  const xpIntoLevel = totalXp % XP_PER_LEVEL;

  return {
    level,
    title: playerTitle(level),
    totalXp,
    xpIntoLevel,
    xpPerLevel: XP_PER_LEVEL,
    progressPercent: Math.round((xpIntoLevel / XP_PER_LEVEL) * 100),
    publishedPatches: published.length,
    totalItems,
    weeklyStreak,
    bonusXp,
    missions,
    titles: PLAYER_TITLES,
  };
}
