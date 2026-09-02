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
  kind: "base" | "daily" | "weekly" | "secret";
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
  "Ladro d'auto con cinque stelle e zero benzina",
  "Cowboy redento a rate",
  "Fuorilegge con l'onore sotto zero",
  "Cugino che chiama solo per il bowling",
  "Bandito del selvaggio condominio",
  "Cacciatore di taglie per buoni pasto",
  "Protagonista col piano destinato a fallire",
  "Anti-eroe con più missioni che dignità",
  "Incubo del saloon e dell'amministratore",
  "Centopercentista senza una vita sociale",
] as const;

export function playerTitle(level: number) {
  return PLAYER_TITLES[Math.min(Math.max(level, 1), PLAYER_TITLES.length) - 1];
}

function itemCount(patch: Patch) {
  return patch.sections.reduce(
    (total, section) => total + section.items.filter((item) => item.text.trim()).length,
    0,
  );
}

function activityDay(dateValue: string) {
  const date = new Date(dateValue);
  return Number.isNaN(date.getTime()) ? null : date.toISOString().slice(0, 10);
}

function missionProgress(
  published: readonly Patch[],
  totalItems: number,
  weeklyStreak: number,
  displayName: string,
  completedMissionIds: readonly string[],
  now: Date,
): PlayerMission[] {
  const publishedPatches = published.length;
  const todayKey = now.toISOString().slice(0, 10);
  const currentWeekStart = weekStart(now.toISOString()) ?? 0;
  const weekKey = new Date(currentWeekStart).toISOString().slice(0, 10);
  const todayPatches = published.filter((patch) => activityDay(patch.updatedAt) === todayKey);
  const weekPatches = published.filter((patch) => {
    const activityWeek = weekStart(patch.updatedAt);
    return activityWeek !== null && activityWeek === currentWeekStart;
  });
  const weekItems = weekPatches.reduce((total, patch) => total + itemCount(patch), 0);
  const weekDays = new Set(
    weekPatches.map((patch) => activityDay(patch.updatedAt)).filter((day) => day !== null),
  ).size;
  const normalizedName = displayName.trim().toLocaleLowerCase("it");
  const completed = new Set(completedMissionIds);
  const mission = (
    id: string,
    title: string,
    description: string,
    rewardXp: number,
    condition: boolean,
    kind: PlayerMission["kind"] = "base",
  ): PlayerMission => ({
    id,
    title,
    description,
    rewardXp,
    completed: condition || completed.has(id),
    secret: kind === "secret",
    kind,
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
    mission("five-patches", "Ormai è un problema", "Pubblica 5 patch", 150, publishedPatches >= 5),
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
      "four-week-fire",
      "Il falò ti riconosce",
      "Raggiungi una serie di 4 settimane",
      300,
      weeklyStreak >= 4,
    ),
    mission("twenty-items", "Loot compulsivo", "Crea 20 voci", 200, totalItems >= 20),
    mission("fifty-items", "Inventario patologico", "Crea 50 voci", 400, totalItems >= 50),
    mission(
      "fat-patch",
      "Patch note o autobiografia?",
      "Pubblica una patch con almeno 5 voci",
      125,
      published.some((patch) => itemCount(patch) >= 5),
    ),
    mission(
      "three-sections",
      "Menu delle opzioni infinito",
      "Pubblica una patch con 3 sezioni piene",
      125,
      published.some(
        (patch) =>
          patch.sections.filter((section) => section.items.some((item) => item.text.trim()))
            .length >= 3,
      ),
    ),
    mission(
      "patch-boss",
      "Nessuno te l'aveva chiesto",
      "Pubblica 10 patch",
      250,
      publishedPatches >= 10,
    ),
    mission(
      "patch-overlord",
      "Nessuno può più fermarti",
      "Pubblica 25 patch",
      500,
      publishedPatches >= 25,
    ),

    mission(
      `daily-first-${todayKey}`,
      "Continue? 9... 8... 7...",
      "Pubblica una patch oggi",
      40,
      todayPatches.length >= 1,
      "daily",
    ),
    mission(
      `daily-rich-${todayKey}`,
      "Combo giornaliera",
      "Pubblica oggi una patch con almeno 3 voci",
      60,
      todayPatches.some((patch) => itemCount(patch) >= 3),
      "daily",
    ),
    mission(
      `daily-double-${todayKey}`,
      "Hai davvero così tanto da dire?",
      "Pubblica 2 patch oggi",
      90,
      todayPatches.length >= 2,
      "daily",
    ),
    mission(
      `weekly-two-${weekKey}`,
      "Checkpoint settimanale",
      "Pubblica 2 patch questa settimana",
      120,
      weekPatches.length >= 2,
      "weekly",
    ),
    mission(
      `weekly-items-${weekKey}`,
      "Settimana piena di roba",
      "Crea 8 voci questa settimana",
      140,
      weekItems >= 8,
      "weekly",
    ),
    mission(
      `weekly-days-${weekKey}`,
      "Tocca l'erba, ma torna domani",
      "Pubblica in 3 giorni diversi questa settimana",
      200,
      weekDays >= 3,
      "weekly",
    ),
    mission(
      "god-of-war",
      "Diventa il dio della Guerra",
      "???",
      500,
      normalizedName === "kratos",
      "secret",
    ),
    mission(
      "mushroom-kingdom",
      "La principessa è altrove",
      "???",
      250,
      normalizedName === "mario",
      "secret",
    ),
    mission("bandicoot", "Rompi tutte le casse", "???", 250, normalizedName === "crash", "secret"),
    mission(
      "purple-dragon",
      "Libera i draghi di pietra",
      "???",
      250,
      normalizedName === "spyro",
      "secret",
    ),
    mission(
      "wall-crawler",
      "Grandi poteri, zero stipendio",
      "???",
      250,
      normalizedName === "peter parker",
      "secret",
    ),
    mission(
      "damned-train",
      "Segui quel maledetto treno",
      "???",
      300,
      normalizedName === "cj",
      "secret",
    ),
    mission(
      "bowling-cousin",
      "Porta tuo cugino a bowling",
      "???",
      300,
      normalizedName === "niko bellic",
      "secret",
    ),
    mission(
      "have-faith",
      "Abbi fede nel piano",
      "???",
      400,
      normalizedName === "arthur morgan",
      "secret",
    ),
    mission(
      "redemption",
      "Ottieni la redenzione",
      "???",
      350,
      normalizedName === "john marston",
      "secret",
    ),
    mission(
      "therapy",
      "Scegli la terapia sbagliata",
      "???",
      300,
      normalizedName === "trevor",
      "secret",
    ),
    mission(
      "five-stars",
      "Sopravvivi con cinque stelle",
      "???",
      300,
      normalizedName === "claude speed",
      "secret",
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
        .map((patch) => weekStart(patch.updatedAt))
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
  earnedMissionXp = 0,
  now = new Date(),
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
    published,
    totalItems,
    weeklyStreak,
    displayName,
    completedMissionIds,
    now,
  );
  const completed = new Set(completedMissionIds);
  const pendingMissionXp = missions
    .filter((mission) => mission.completed && !completed.has(mission.id))
    .reduce((total, mission) => total + mission.rewardXp, 0);
  const bonusXp = earnedMissionXp + pendingMissionXp;
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
