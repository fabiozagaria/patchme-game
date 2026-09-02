import type { Patch } from "@/lib/patch-model";

const XP_PER_LEVEL = 250;
const XP_PER_PATCH = 100;
const XP_PER_ITEM = 10;
const WEEK_MS = 7 * 24 * 60 * 60 * 1000;

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
}

const PLAYER_TITLES = [
  "Comparsa col controller scollegato",
  "Raccoglitore seriale di medikit",
  "Eroe del tutorial saltato",
  "Signore dei salvataggi manuali",
  "Boss del lunedì mattina",
  "Campione del divano a 16 bit",
  "Mago dei cheat non dichiarati",
  "Custode dell'ultimo gettone",
  "Boss segreto della vita adulta",
  "Leggenda con la memory card piena",
] as const;

export function playerTitle(level: number) {
  return PLAYER_TITLES[Math.min(Math.max(level, 1), PLAYER_TITLES.length) - 1];
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

export function calculatePlayerProgression(patches: readonly Patch[]): PlayerProgression {
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
  const totalXp = published.length * XP_PER_PATCH + totalItems * XP_PER_ITEM;
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
    weeklyStreak: calculateWeeklyStreak(published),
  };
}
