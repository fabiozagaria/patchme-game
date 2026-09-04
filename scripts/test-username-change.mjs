import assert from "node:assert/strict";
import {
  USERNAME_CHANGE_PRICE,
  canAffordUsernameChange,
  usernameChangeCost,
} from "../src/lib/username-change.ts";

assert.equal(usernameChangeCost(0), 0, "Il primo cambio deve essere gratuito");
assert.equal(usernameChangeCost(1), USERNAME_CHANGE_PRICE, "Dal secondo cambio servono 200 Bit");
assert.equal(canAffordUsernameChange(199, 1), false, "199 Bit non devono bastare");
assert.equal(canAffordUsernameChange(200, 1), true, "200 Bit devono bastare esattamente");

console.log("Cambio Username: 4 controlli superati.");
