export const PROGRESSION_SCHEMA_VERSION = 2;

const PROGRESSION_STORAGE_KEY = "patchme.player.progression.v2";
const PREVIOUS_PROGRESSION_STORAGE_KEY = "patchme.player.progression.v1";

export const LEGACY_PROGRESSION_KEYS = {
  lastXp: "patchme.player.last-xp.v1",
  completedMissions: "patchme.player.completed-missions.v1",
  missionXp: "patchme.player.mission-xp.v1",
  lastStreak: "patchme.player.last-streak.v1",
} as const;

export interface ProgressionState {
  schemaVersion: typeof PROGRESSION_SCHEMA_VERSION;
  completedMissionIds: string[];
  claimedBitRewardMissionIds: string[];
  missionXp: number;
  bits: number;
  ownedCosmeticIds: string[];
  equippedProfileFrameId: string | null;
  equippedAvatarId: string | null;
  equippedProfileEffectId: string | null;
  equippedProfileBackgroundId: string | null;
  highestStreak: number;
  lastXp: number | null;
  welcomeBitsClaimed: boolean;
}

interface StorageAdapter {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
}

export const EMPTY_PROGRESSION_STATE: ProgressionState = {
  schemaVersion: PROGRESSION_SCHEMA_VERSION,
  completedMissionIds: [],
  claimedBitRewardMissionIds: [],
  missionXp: 0,
  bits: 0,
  ownedCosmeticIds: [],
  equippedProfileFrameId: null,
  equippedAvatarId: null,
  equippedProfileEffectId: null,
  equippedProfileBackgroundId: null,
  highestStreak: 0,
  lastXp: null,
  welcomeBitsClaimed: false,
};

function finiteNonNegative(value: unknown, fallback = 0): number {
  const numeric = Number(value);
  return Number.isFinite(numeric) ? Math.max(0, Math.floor(numeric)) : fallback;
}

function uniqueStrings(value: unknown): string[] {
  return Array.isArray(value)
    ? [...new Set(value.filter((id): id is string => typeof id === "string"))]
    : [];
}

function parseCurrentState(raw: string | null): ProgressionState | null {
  if (!raw) return null;
  try {
    const value = JSON.parse(raw) as Partial<ProgressionState>;
    if (value.schemaVersion !== PROGRESSION_SCHEMA_VERSION) return null;
    const ownedCosmeticIds = uniqueStrings(value.ownedCosmeticIds);
    return {
      schemaVersion: PROGRESSION_SCHEMA_VERSION,
      completedMissionIds: uniqueStrings(value.completedMissionIds),
      claimedBitRewardMissionIds: uniqueStrings(value.claimedBitRewardMissionIds),
      missionXp: finiteNonNegative(value.missionXp),
      bits: finiteNonNegative(value.bits),
      ownedCosmeticIds,
      equippedProfileFrameId:
        typeof value.equippedProfileFrameId === "string" &&
        ownedCosmeticIds.includes(value.equippedProfileFrameId)
          ? value.equippedProfileFrameId
          : null,
      equippedAvatarId:
        typeof value.equippedAvatarId === "string" &&
        ownedCosmeticIds.includes(value.equippedAvatarId)
          ? value.equippedAvatarId
          : null,
      equippedProfileEffectId:
        typeof value.equippedProfileEffectId === "string" &&
        ownedCosmeticIds.includes(value.equippedProfileEffectId)
          ? value.equippedProfileEffectId
          : null,
      equippedProfileBackgroundId:
        typeof value.equippedProfileBackgroundId === "string" &&
        ownedCosmeticIds.includes(value.equippedProfileBackgroundId)
          ? value.equippedProfileBackgroundId
          : null,
      highestStreak: finiteNonNegative(value.highestStreak),
      lastXp: value.lastXp === null ? null : finiteNonNegative(value.lastXp),
      welcomeBitsClaimed: value.welcomeBitsClaimed === true,
    };
  } catch {
    return null;
  }
}

function parsePreviousState(raw: string | null): ProgressionState | null {
  if (!raw) return null;
  try {
    const value = JSON.parse(raw) as Record<string, unknown>;
    if (value.schemaVersion !== 1) return null;
    return {
      ...EMPTY_PROGRESSION_STATE,
      completedMissionIds: uniqueStrings(value.completedMissionIds),
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
    completedMissionIds = uniqueStrings(
      JSON.parse(storage.getItem(LEGACY_PROGRESSION_KEYS.completedMissions) ?? "[]"),
    );
  } catch {
    // Un registro legacy corrotto viene ignorato senza perdere il resto della progressione.
  }
  const migratedMissionXp = completedMissionIds.reduce(
    (total, id) => total + (rewardByMissionId.get(id) ?? 0),
    0,
  );
  const storedMissionXp = storage.getItem(LEGACY_PROGRESSION_KEYS.missionXp);
  const lastXpRaw = storage.getItem(LEGACY_PROGRESSION_KEYS.lastXp);
  return {
    ...EMPTY_PROGRESSION_STATE,
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
  const current = parseCurrentState(storage.getItem(PROGRESSION_STORAGE_KEY));
  if (current) {
    if (current.welcomeBitsClaimed) return current;
    const welcomed = { ...current, bits: current.bits + 44, welcomeBitsClaimed: true };
    saveProgressionState(welcomed, storage);
    return welcomed;
  }
  const migrated =
    parsePreviousState(storage.getItem(PREVIOUS_PROGRESSION_STORAGE_KEY)) ??
    readLegacyState(storage, rewardByMissionId);
  const welcomed = { ...migrated, bits: migrated.bits + 44, welcomeBitsClaimed: true };
  saveProgressionState(welcomed, storage);
  return welcomed;
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
  rewardBits = 0,
): ProgressionState {
  const xpClaimed = state.completedMissionIds.includes(missionId);
  const bitsClaimed = state.claimedBitRewardMissionIds.includes(missionId);
  if (xpClaimed && bitsClaimed) return state;
  return {
    ...state,
    completedMissionIds: xpClaimed
      ? state.completedMissionIds
      : [...state.completedMissionIds, missionId],
    claimedBitRewardMissionIds: bitsClaimed
      ? state.claimedBitRewardMissionIds
      : [...state.claimedBitRewardMissionIds, missionId],
    missionXp: state.missionXp + (xpClaimed ? 0 : Math.max(0, rewardXp)),
    bits: state.bits + (bitsClaimed ? 0 : Math.max(0, Math.floor(rewardBits))),
  };
}

export type ShopTransactionResult =
  | { ok: true; state: ProgressionState }
  | { ok: false; reason: "already-owned" | "insufficient-bits" | "not-owned" };

export function purchaseCosmetic(
  state: ProgressionState,
  cosmeticId: string,
  price: number,
): ShopTransactionResult {
  if (state.ownedCosmeticIds.includes(cosmeticId)) return { ok: false, reason: "already-owned" };
  const safePrice = Math.max(0, Math.floor(price));
  if (state.bits < safePrice) return { ok: false, reason: "insufficient-bits" };
  return {
    ok: true,
    state: {
      ...state,
      bits: state.bits - safePrice,
      ownedCosmeticIds: [...state.ownedCosmeticIds, cosmeticId],
    },
  };
}

export function equipProfileFrame(
  state: ProgressionState,
  cosmeticId: string | null,
): ShopTransactionResult {
  if (cosmeticId !== null && !state.ownedCosmeticIds.includes(cosmeticId)) {
    return { ok: false, reason: "not-owned" };
  }
  return { ok: true, state: { ...state, equippedProfileFrameId: cosmeticId } };
}

export type CosmeticSlot = "frame" | "avatar" | "effect" | "background";

export function equipCosmetic(
  state: ProgressionState,
  cosmeticId: string,
  slot: CosmeticSlot,
): ShopTransactionResult {
  if (!state.ownedCosmeticIds.includes(cosmeticId)) return { ok: false, reason: "not-owned" };
  const field = {
    frame: "equippedProfileFrameId",
    avatar: "equippedAvatarId",
    effect: "equippedProfileEffectId",
    background: "equippedProfileBackgroundId",
  }[slot];
  return { ok: true, state: { ...state, [field]: cosmeticId } };
}

export function resetEquippedCosmetics(state: ProgressionState): ProgressionState {
  return {
    ...state,
    equippedProfileFrameId: null,
    equippedAvatarId: null,
    equippedProfileEffectId: null,
    equippedProfileBackgroundId: null,
  };
}
