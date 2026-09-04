import assert from "node:assert/strict";
import { isPatchShareable } from "../src/lib/patch-sharing.ts";

assert.equal(isPatchShareable({ status: "draft" }), false, "Una bozza non deve essere condivisa");
assert.equal(
  isPatchShareable({ status: "published" }),
  true,
  "Una patch pubblicata deve essere condivisibile",
);

console.log("Condivisione: 2 controlli superati.");
