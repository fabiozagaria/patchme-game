import assert from "node:assert/strict";
import {
  awardMission,
  LEGACY_PROGRESSION_KEYS,
  loadProgressionState,
  PROGRESSION_SCHEMA_VERSION,
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
assert.equal(migrated.highestStreak, 3);
assert.equal(migrated.lastXp, 150);

const awarded = awardMission(migrated, "secret", 777);
assert.equal(awarded.missionXp, 827);
assert.deepEqual(awarded.completedMissionIds, ["first", "secret"]);
assert.strictEqual(
  awardMission(awarded, "secret", 777),
  awarded,
  "Una missione già riscossa non deve creare un nuovo stato o duplicare XP",
);

assert.equal(saveProgressionState(awarded, legacy), true);
assert.deepEqual(loadProgressionState(new Map(), legacy), awarded);

console.log("Repository progressione: 9 controlli superati.");
