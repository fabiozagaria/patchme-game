import type { Patch } from "@/lib/patch-model";

const XP_PER_LEVEL = 250;
const XP_PER_PATCH = 100;
const XP_PER_ITEM = 10;
const WEEK_MS = 7 * 24 * 60 * 60 * 1000;

export const PLAYER_STORAGE_KEYS = {
  lastXp: "patchme.player.last-xp.v1",
  completedMissions: "patchme.player.completed-missions.v1",
  missionXp: "patchme.player.mission-xp.v1",
  lastStreak: "patchme.player.last-streak.v1",
} as const;

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

interface SecretMissionDefinition {
  id: string;
  title: string;
  triggerName: string;
  rewardXp: number;
}

const SECRET_MISSIONS: readonly SecretMissionDefinition[] = [
  {
    id: "god-of-war",
    title: "Diventa il dio della Guerra",
    triggerName: "kratos",
    rewardXp: 500,
  },
  {
    id: "mushroom-kingdom",
    title: "Salva Dinosaur Land da Bowser",
    triggerName: "mario",
    rewardXp: 250,
  },
  {
    id: "monkey-island",
    title: "Diventa un temibile pirata di Mêlée Island",
    triggerName: "guybrush threepwood",
    rewardXp: 250,
  },
  {
    id: "street-fighter-two",
    title: "Sconfiggi M. Bison senza spammare Hadoken",
    triggerName: "ryu",
    rewardXp: 250,
  },
  {
    id: "sonic-the-hedgehog",
    title: "Supera il riccio blu e raccogli tutti gli anelli",
    triggerName: "sonic",
    rewardXp: 250,
  },
  {
    id: "doom-mars",
    title: "Ripulisci Marte dai demoni a colpi di motosega",
    triggerName: "doomguy",
    rewardXp: 300,
  },
  {
    id: "donkey-kong-country",
    title: "Recupera la scorta di banane rubata",
    triggerName: "donkey kong",
    rewardXp: 250,
  },
  {
    id: "chrono-trigger",
    title: "Sistema la linea temporale prima del 1999",
    triggerName: "crono",
    rewardXp: 300,
  },
  {
    id: "super-mario-64",
    title: "Entra nel castello e recupera 120 stelle",
    triggerName: "mario 64",
    rewardXp: 300,
  },
  {
    id: "resident-evil-mansion",
    title: "Sopravvivi alla villa della Umbrella",
    triggerName: "jill valentine",
    rewardXp: 300,
  },
  {
    id: "tomb-raider",
    title: "Chiudi il maggiordomo nella cella frigorifera",
    triggerName: "lara croft",
    rewardXp: 250,
  },
  {
    id: "diablo-tristram",
    title: "Scendi sotto Tristram e affronta il Signore del Terrore",
    triggerName: "diablo",
    rewardXp: 300,
  },
  {
    id: "quake-slipgate",
    title: "Attraversa lo Slipgate senza diventare carne trita",
    triggerName: "ranger",
    rewardXp: 300,
  },
  {
    id: "final-fantasy-seven",
    title: "Impedisci a una meteora di distruggere Midgar",
    triggerName: "cloud strife",
    rewardXp: 350,
  },
  {
    id: "castlevania-sotn",
    title: "Esplora anche il castello capovolto",
    triggerName: "alucard",
    rewardXp: 300,
  },
  {
    id: "goldeneye-007",
    title: "Ottieni la licenza di patchare",
    triggerName: "james bond",
    rewardXp: 250,
  },
  {
    id: "fallout-vault-dweller",
    title: "Esci dal Vault e sopravvivi alla Zona Contaminata",
    triggerName: "vault dweller",
    rewardXp: 300,
  },
  {
    id: "metal-gear-solid",
    title: "Infiltrati usando una scatola di cartone",
    triggerName: "solid snake",
    rewardXp: 300,
  },
  {
    id: "ocarina-of-time",
    title: "Suona l'Ocarina e salva Hyrule",
    triggerName: "link",
    rewardXp: 300,
  },
  {
    id: "half-life-black-mesa",
    title: "Arriva tardi al lavoro a Black Mesa",
    triggerName: "gordon freeman",
    rewardXp: 300,
  },
  {
    id: "starcraft",
    title: "Diventa la Regina delle Lame",
    triggerName: "sarah kerrigan",
    rewardXp: 300,
  },
  {
    id: "deus-ex",
    title: "Scopri chi controlla davvero la cospirazione",
    triggerName: "jc denton",
    rewardXp: 300,
  },
  {
    id: "diablo-two",
    title: "Resta un po' e ascolta",
    triggerName: "deckard cain",
    rewardXp: 300,
  },
  {
    id: "halo-combat-evolved",
    title: "Completa il combattimento sull'anello",
    triggerName: "master chief",
    rewardXp: 350,
  },
  {
    id: "five-stars",
    title: "Sopravvivi a Liberty City senza saper nuotare",
    triggerName: "claude speed",
    rewardXp: 300,
  },
  {
    id: "silent-hill-two",
    title: "Segui la lettera fino a Silent Hill",
    triggerName: "james sunderland",
    rewardXp: 350,
  },
  {
    id: "metal-gear-solid-two",
    title: "Disattiva il Metal Gear RAY",
    triggerName: "raiden",
    rewardXp: 300,
  },
  {
    id: "warcraft-three",
    title: "Impugna Frostmourne e rovina tutto",
    triggerName: "arthas",
    rewardXp: 300,
  },
  {
    id: "metroid-prime",
    title: "Scansiona Tallon IV da cima a fondo",
    triggerName: "samus aran",
    rewardXp: 300,
  },
  {
    id: "kotor",
    title: "Ricorda chi eri prima della Repubblica",
    triggerName: "revan",
    rewardXp: 350,
  },
  {
    id: "half-life-two",
    title: "Guida la rivolta di City 17",
    triggerName: "alyx vance",
    rewardXp: 300,
  },
  {
    id: "world-of-warcraft",
    title: "Carica urlando prima che il gruppo sia pronto",
    triggerName: "leeroy jenkins",
    rewardXp: 300,
  },
  {
    id: "damned-train",
    title: "Segui quel maledetto treno, CJ!",
    triggerName: "cj",
    rewardXp: 300,
  },
  {
    id: "resident-evil-four",
    title: "Salva Ashley e tratta col mercante misterioso",
    triggerName: "leon kennedy",
    rewardXp: 350,
  },
  {
    id: "shadow-of-the-colossus",
    title: "Abbatti sedici colossi per una pessima idea romantica",
    triggerName: "wander",
    rewardXp: 350,
  },
  {
    id: "oblivion",
    title: "Chiudi i cancelli dell'Oblivion",
    triggerName: "hero of kvatch",
    rewardXp: 300,
  },
  {
    id: "bioshock",
    title: "Obbedisci cortesemente a ogni ordine",
    triggerName: "andrew ryan",
    rewardXp: 300,
  },
  {
    id: "portal",
    title: "Completa i test senza fidarti della torta",
    triggerName: "chell",
    rewardXp: 300,
  },
  {
    id: "modern-warfare",
    title: "Sopravvivi a Pripyat in tuta mimetica",
    triggerName: "captain price",
    rewardXp: 300,
  },
  {
    id: "fallout-three",
    title: "Trova tuo padre fuori dal Vault 101",
    triggerName: "lone wanderer",
    rewardXp: 300,
  },
  {
    id: "demons-souls",
    title: "Fa' che il mondo sia ricucito",
    triggerName: "maiden in black",
    rewardXp: 350,
  },
  {
    id: "dark-souls-sun",
    title: "Loda il Sole senza rotolare giù da un dirupo",
    triggerName: "solaire",
    rewardXp: 300,
  },
  {
    id: "dark-souls-abyss",
    title: "Cammina nell'Abisso insieme ad Artorias",
    triggerName: "artorias",
    rewardXp: 350,
  },
  {
    id: "dark-souls-flame",
    title: "Collega la Prima Fiamma e rovina un'altra era",
    triggerName: "chosen undead",
    rewardXp: 350,
  },
  {
    id: "elden-ring-malenia",
    title: "Fatti spiegare per la centesima volta chi è la Lama di Miquella",
    triggerName: "malenia",
    rewardXp: 350,
  },
  {
    id: "elden-ring-ranni",
    title: "Prometti fedeltà alla strega dalle quattro braccia",
    triggerName: "ranni",
    rewardXp: 300,
  },
  {
    id: "elden-ring-lord",
    title: "Diventa Lord Ancestrale dopo aver seguito zero indicazioni",
    triggerName: "tarnished",
    rewardXp: 350,
  },
  {
    id: "sekiro-hesitation",
    title: "Impara che l'esitazione è una sconfitta",
    triggerName: "isshin ashina",
    rewardXp: 350,
  },
  {
    id: "sekiro-wolf",
    title: "Muori due volte e continua a non parare",
    triggerName: "wolf",
    rewardXp: 300,
  },
  {
    id: "sekiro-genichiro",
    title: "Difendi Ashina anche se ormai è chiaramente finita",
    triggerName: "genichiro ashina",
    rewardXp: 350,
  },
  {
    id: "dragon-ball-goku",
    title: "Chiedi al nemico di trasformarsi al massimo",
    triggerName: "goku",
    rewardXp: 300,
  },
  {
    id: "dragon-ball-vegeta",
    title: "Supera Kakarot almeno nella tua testa",
    triggerName: "vegeta",
    rewardXp: 300,
  },
  {
    id: "dragon-ball-piccolo",
    title: "Allena il figlio di qualcun altro meglio di suo padre",
    triggerName: "piccolo",
    rewardXp: 300,
  },
  {
    id: "dokkan-shaft",
    title: "Sopravvivi alla shaft dopo mille Dragon Stones",
    triggerName: "dokkan",
    rewardXp: 350,
  },
  {
    id: "dokkan-producer",
    title: "Ringrazia Omatsu dopo l'ennesimo banner criminale",
    triggerName: "omatsu",
    rewardXp: 350,
  },
  {
    id: "dokkan-fusion",
    title: "Aspetta ancora il turno della trasformazione in Vegito",
    triggerName: "lr vegito",
    rewardXp: 300,
  },
  {
    id: "tekken-jin",
    title: "Risolvi i problemi familiari con un Electric Wind God Fist",
    triggerName: "jin kazama",
    rewardXp: 350,
  },
  {
    id: "tekken-kazuya",
    title: "Getta un altro parente da una rupe",
    triggerName: "kazuya mishima",
    rewardXp: 350,
  },
  {
    id: "tekken-heihachi",
    title: "Sopravvivi all'ennesima morte completamente definitiva",
    triggerName: "heihachi mishima",
    rewardXp: 350,
  },
  {
    id: "bandicoot",
    title: "Rompi tutte le casse senza saltarne una",
    triggerName: "crash",
    rewardXp: 250,
  },
  {
    id: "purple-dragon",
    title: "Libera i draghi di pietra",
    triggerName: "spyro",
    rewardXp: 250,
  },
  {
    id: "wall-crawler",
    title: "Salva New York con grandi poteri e zero stipendio",
    triggerName: "peter parker",
    rewardXp: 250,
  },
  {
    id: "bowling-cousin",
    title: "Porta tuo cugino a bowling",
    triggerName: "niko bellic",
    rewardXp: 300,
  },
  {
    id: "have-faith",
    title: "Abbi fede nel piano per Tahiti",
    triggerName: "arthur morgan",
    rewardXp: 400,
  },
  {
    id: "redemption",
    title: "Ottieni la redenzione al tramonto",
    triggerName: "john marston",
    rewardXp: 350,
  },
  {
    id: "therapy",
    title: "Scegli la terapia sbagliata a Los Santos",
    triggerName: "trevor",
    rewardXp: 300,
  },
];

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
    ...SECRET_MISSIONS.map((secret) =>
      mission(
        secret.id,
        secret.title,
        "???",
        secret.rewardXp,
        normalizedName === secret.triggerName,
        "secret",
      ),
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
  preservedWeeklyStreak = 0,
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
  const weeklyStreak = Math.max(calculateWeeklyStreak(published), preservedWeeklyStreak);
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
