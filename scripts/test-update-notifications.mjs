import assert from "node:assert/strict";
import { shouldNotifyVersionUpdate } from "../src/lib/update-notifications.ts";

assert.equal(shouldNotifyVersionUpdate(true, "granted", "0.7.0", "0.7.1"), true);
assert.equal(shouldNotifyVersionUpdate(false, "granted", "0.7.0", "0.7.1"), false);
assert.equal(shouldNotifyVersionUpdate(true, "denied", "0.7.0", "0.7.1"), false);
assert.equal(shouldNotifyVersionUpdate(true, "granted", "", "0.7.1"), false);
assert.equal(shouldNotifyVersionUpdate(true, "granted", "0.7.1", "0.7.1"), false);

console.log("Notifiche aggiornamenti: 5 controlli superati.");
