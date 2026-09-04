import assert from "node:assert/strict";
import {
  awardMission,
  EMPTY_PROGRESSION_STATE,
  equipCosmetic,
  equipProfileFrame,
  LEGACY_PROGRESSION_KEYS,
  loadProgressionState,
  PROGRESSION_SCHEMA_VERSION,
  purchaseCosmetic,
  resetEquippedCosmetics,
  saveProgressionState,
} from "../src/lib/progression-repository.ts";

class MemoryStorage {
  values = new Map();
  getItem(key) {
    return this.values.get(key) ?? null;
  }
  setItem(key, value) {
    this.values.set(key, value);
  }
}

const legacy = new MemoryStorage();
legacy.setItem(LEGACY_PROGRESSION_KEYS.completedMissions, JSON.stringify(["first", "first"]));
legacy.setItem(LEGACY_PROGRESSION_KEYS.lastStreak, "3");
legacy.setItem(LEGACY_PROGRESSION_KEYS.lastXp, "150");
const migrated = loadProgressionState(new Map([["first", 50]]), legacy);
assert.equal(migrated.schemaVersion, PROGRESSION_SCHEMA_VERSION);
assert.deepEqual(migrated.completedMissionIds, ["first"]);
assert.equal(migrated.missionXp, 50, "La migrazione deve ricostruire gli XP mancanti");
assert.equal(migrated.bits, 0);
assert.equal(migrated.highestStreak, 3);
assert.equal(migrated.lastXp, 150);

const retroactive = awardMission(migrated, "first", 50, 10);
assert.equal(retroactive.missionXp, 50, "Gli XP già riscossi non vanno duplicati");
assert.equal(retroactive.bits, 10, "Una vecchia missione deve ricevere i Bit retroattivi");
assert.deepEqual(retroactive.claimedBitRewardMissionIds, ["first"]);

const awarded = awardMission(retroactive, "secret", 777, 77);
assert.equal(awarded.missionXp, 827);
assert.equal(awarded.bits, 87);
assert.deepEqual(awarded.completedMissionIds, ["first", "secret"]);
assert.strictEqual(awardMission(awarded, "secret", 777, 77), awarded);

const tooExpensive = purchaseCosmetic(awarded, "frame-gold", 100);
assert.deepEqual(tooExpensive, { ok: false, reason: "insufficient-bits" });
const purchased = purchaseCosmetic(awarded, "frame-arcade", 40);
assert.equal(purchased.ok, true);
assert.equal(purchased.state.bits, 47);
assert.deepEqual(purchased.state.ownedCosmeticIds, ["frame-arcade"]);
assert.deepEqual(purchaseCosmetic(purchased.state, "frame-arcade", 40), {
  ok: false,
  reason: "already-owned",
});

assert.deepEqual(equipProfileFrame(EMPTY_PROGRESSION_STATE, "frame-arcade"), {
  ok: false,
  reason: "not-owned",
});
const equipped = equipProfileFrame(purchased.state, "frame-arcade");
assert.equal(equipped.ok, true);
assert.equal(equipped.state.equippedProfileFrameId, "frame-arcade");
const unequipped = equipProfileFrame(equipped.state, null);
assert.equal(unequipped.ok, true);
assert.equal(unequipped.state.equippedProfileFrameId, null);

assert.deepEqual(equipCosmetic(EMPTY_PROGRESSION_STATE, "avatar-undead", "avatar"), {
  ok: false,
  reason: "not-owned",
});
const avatarState = {
  ...purchased.state,
  ownedCosmeticIds: [...purchased.state.ownedCosmeticIds, "avatar-undead", "effect-embers"],
};
const avatarEquipped = equipCosmetic(avatarState, "avatar-undead", "avatar");
assert.equal(avatarEquipped.ok, true);
assert.equal(avatarEquipped.state.equippedAvatarId, "avatar-undead");
const effectEquipped = equipCosmetic(avatarEquipped.state, "effect-embers", "effect");
assert.equal(effectEquipped.ok, true);
assert.equal(effectEquipped.state.equippedProfileEffectId, "effect-embers");
const reset = resetEquippedCosmetics(effectEquipped.state);
assert.equal(reset.equippedAvatarId, null);
assert.equal(reset.equippedProfileFrameId, null);
assert.equal(reset.equippedProfileEffectId, null);

assert.equal(saveProgressionState(equipped.state, legacy), true);
assert.deepEqual(loadProgressionState(new Map(), legacy), equipped.state);

console.log("Repository progressione e shop: 32 controlli superati.");
