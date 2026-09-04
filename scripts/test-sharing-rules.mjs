import assert from "node:assert/strict";
import {
  createCounterPatchUrl,
  EXPORT_SIZES,
  isPatchShareable,
  parseShareRequest,
  patchSubjectLabel,
} from "../src/lib/patch-sharing.ts";

assert.equal(isPatchShareable({ status: "draft" }), false, "Una bozza non deve essere condivisa");
assert.equal(
  isPatchShareable({ status: "published" }),
  true,
  "Una patch pubblicata deve essere condivisibile",
);

assert.equal(parseShareRequest(true), true, "Il flag booleano deve aprire la condivisione");
assert.equal(parseShareRequest("true"), true, "Il flag testuale deve aprire la condivisione");
assert.equal(parseShareRequest("1"), true, "Il flag numerico deve aprire la condivisione");
assert.equal(parseShareRequest(false), false, "Un flag falso non deve aprire la condivisione");
assert.equal(parseShareRequest("false"), false, "Testo non valido non deve aprire la condivisione");
assert.equal(EXPORT_SIZES.vertical.output, "1080×1350");
assert.equal(EXPORT_SIZES.story.output, "1080×1920");
assert.equal(EXPORT_SIZES.square.output, "1080×1080");
assert.equal(EXPORT_SIZES.horizontal.output, "1200×675");
assert.equal(patchSubjectLabel("friend", "Francesco"), "Patch dedicata a Francesco");
assert.equal(patchSubjectLabel("group", ""), "Patch di gruppo");
const counterUrl = createCounterPatchUrl("https://patchme.test/", "Fabio", "sarcastic", "chaos");
assert.match(counterUrl, /^https:\/\/patchme\.test\/patch\/new\?/);
assert.match(counterUrl, /counter=1/);
assert.match(counterUrl, /target=Fabio/);

console.log("Condivisione: 16 controlli superati.");
