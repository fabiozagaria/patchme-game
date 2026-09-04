import assert from "node:assert/strict";
import { EXPORT_SIZES, isPatchShareable, parseShareRequest } from "../src/lib/patch-sharing.ts";

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
assert.deepEqual(EXPORT_SIZES.vertical, { width: 540, height: 675, output: "1080×1350" });
assert.deepEqual(EXPORT_SIZES.horizontal, { width: 600, height: 337.5, output: "1200×675" });

console.log("Condivisione: 9 controlli superati.");
