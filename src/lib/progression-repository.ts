export const PROGRESSION_SCHEMA_VERSION = 1;

const PROGRESSION_STORAGE_KEY = "patchme.player.progression.v1";

export const LEGACY_PROGRESSION_KEYS = {
  lastXp: "patchme.player.last-xp.v1",
  completedMissions: "patchme.player.completed-missions.v1",
  missionXp: "patchme.player.mission-xp.v1",
  lastStreak: "patchme.player.last-streak.v1",
} as const;

export interface ProgressionState {
  schemaVersion: typeof PROGRESSION_SCHEMA_VERSION;
  completedMissionIds: string[];
  missionXp: number;
  highestStreak: number;
  lastXp: number | null;
}

interface StorageAdapter {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
}

export const EMPTY_PROGRESSION_STATE: ProgressionState = {
  schemaVersion: PROGRESSION_SCHEMA_VERSION,
  completedMissionIds: [],
  missionXp: 0,
  highestStreak: 0,
  lastXp: null,
};

function finiteNonNegative(value: unknown, fallback = 0): number {
  const numeric = Number(value);
  return Number.isFinite(numeric) ? Math.max(0, numeric) : fallback;
}

function parseProgressionState(raw: string | null): ProgressionState | null {
  if (!raw) return null;
  try {
    const value = JSON.parse(raw) as Partial<ProgressionState>;
    if (value.schemaVersion !== PROGRESSION_SCHEMA_VERSION) return null;
    return {
      schemaVersion: PROGRESSION_SCHEMA_VERSION,
      completedMissionIds: Array.isArray(value.completedMissionIds)
        ? [
            ...new Set(
              value.completedMissionIds.filter((id): id is string => typeof id === "string"),
            ),
          ]
        : [],
      missionXp: finiteNonNegative(value.missionXp),
      highestStreak: finiteNonNegative(value.highestStreak),
      lastXp: value.lastXp === null ? null : finiteNonNegative(value.lastXp),
    };
  } catch {
    return null;
  }
}

function readLegacyState(
  storage: StorageAdapter,
  rewardByMissionId: ReadonlyMap<string, number>,
): ProgressionState {
  let completedMissionIds: string[] = [];
  try {
    const parsed = JSON.parse(
      storage.getItem(LEGACY_PROGRESSION_KEYS.completedMissions) ?? "[]",
    ) as unknown;
    if (Array.isArray(parsed)) {
      completedMissionIds = [
        ...new Set(parsed.filter((id): id is string => typeof id === "string")),
      ];
    }
  } catch {
    // Un registro legacy corrotto viene ignorato senza perdere il resto della progressione.
  }

  const storedMissionXp = storage.getItem(LEGACY_PROGRESSION_KEYS.missionXp);
  const migratedMissionXp = completedMissionIds.reduce(
    (total, id) => total + (rewardByMissionId.get(id) ?? 0),
    0,
  );
  const lastXpRaw = storage.getItem(LEGACY_PROGRESSION_KEYS.lastXp);

  return {
    schemaVersion: PROGRESSION_SCHEMA_VERSION,
    completedMissionIds,
    missionXp:
      storedMissionXp === null
        ? migratedMissionXp
        : finiteNonNegative(storedMissionXp, migratedMissionXp),
    highestStreak: finiteNonNegative(storage.getItem(LEGACY_PROGRESSION_KEYS.lastStreak)),
    lastXp: lastXpRaw === null ? null : finiteNonNegative(lastXpRaw),
  };
}

function browserStorage(): StorageAdapter | null {
  try {
    return typeof window === "undefined" ? null : window.localStorage;
  } catch {
    return null;
  }
}

export function loadProgressionState(
  rewardByMissionId: ReadonlyMap<string, number> = new Map(),
  storage: StorageAdapter | null = browserStorage(),
): ProgressionState {
  if (!storage) return EMPTY_PROGRESSION_STATE;
  const current = parseProgressionState(storage.getItem(PROGRESSION_STORAGE_KEY));
  if (current) return current;

  const migrated = readLegacyState(storage, rewardByMissionId);
  saveProgressionState(migrated, storage);
  return migrated;
}

export function saveProgressionState(
  state: ProgressionState,
  storage: StorageAdapter | null = browserStorage(),
): boolean {
  if (!storage) return false;
  try {
    storage.setItem(PROGRESSION_STORAGE_KEY, JSON.stringify(state));
    return true;
  } catch {
    return false;
  }
}

export function awardMission(
  state: ProgressionState,
  missionId: string,
  rewardXp: number,
): ProgressionState {
  if (state.completedMissionIds.includes(missionId)) return state;
  return {
    ...state,
    completedMissionIds: [...state.completedMissionIds, missionId],
    missionXp: state.missionXp + Math.max(0, rewardXp),
  };
}
