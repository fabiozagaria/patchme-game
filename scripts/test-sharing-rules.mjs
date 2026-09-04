import assert from "node:assert/strict";
import { isPatchShareable, parseShareRequest } from "../src/lib/patch-sharing.ts";

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

console.log("Condivisione: 7 controlli superati.");
