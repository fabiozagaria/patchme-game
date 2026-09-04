import assert from "node:assert/strict";
import { calculatePlayerProgression } from "../src/lib/player-progression.ts";
import { normalizeUsername, usernameHasWhitespace } from "../src/lib/username.ts";

const now = new Date("2026-09-03T12:00:00Z");
const completedIds = (progression) =>
  progression.missions.filter((mission) => mission.completed).map((mission) => mission.id);

const empty = calculatePlayerProgression([], "Fabio", [], 0, now);
assert.equal(empty.totalXp, 0, "Un profilo senza patch o missioni non deve ricevere XP");
assert.deepEqual(completedIds(empty), [], "Un profilo vuoto non deve completare missioni");

const kratos = calculatePlayerProgression([], " KrAtOs ", [], 0, now);
assert.equal(kratos.totalXp, 500, "Kratos deve ricevere esclusivamente i 500 XP segreti");
assert.deepEqual(
  completedIds(kratos),
  ["god-of-war"],
  "Kratos senza patch deve sbloccare soltanto il relativo easter egg",
);

const solidSnake = calculatePlayerProgression([], "SolidSnake", [], 0, now);
assert.equal(
  completedIds(solidSnake).includes("metal-gear-solid"),
  true,
  "Gli easter egg con nomi composti devono funzionare senza spazi",
);
assert.equal(normalizeUsername(" Solid Snake "), "solidsnake");
assert.equal(usernameHasWhitespace("Solid Snake"), true);
assert.equal(usernameHasWhitespace("SolidSnake"), false);

const claimedKratos = calculatePlayerProgression([], "Kratos", ["god-of-war"], 500, now);
assert.equal(claimedKratos.totalXp, 500, "Un easter egg già riscosso non deve duplicare gli XP");

const renamed = calculatePlayerProgression([], "Fabio", ["god-of-war"], 500, now);
assert.equal(renamed.totalXp, 500, "Cambiare username deve mantenere stabile il totale XP");
assert.deepEqual(
  completedIds(renamed),
  ["god-of-war"],
  "Cambiare username non deve inventare il trofeo della prima patch",
);

const preservedStreak = calculatePlayerProgression([], "Fabio", [], 0, now, 3);
assert.equal(
  preservedStreak.weeklyStreak,
  3,
  "Eliminare tutte le patch non deve cancellare una serie già conquistata",
);

console.log("Progressione: 12 controlli superati.");
