import assert from "node:assert/strict";
import {
  addGameNotification,
  clearGameNotifications,
  loadGameNotifications,
  markNotificationsSeen,
  unreadGameNotificationCount,
} from "../src/lib/notification-center.ts";

class MemoryStorage {
  values = new Map();

  getItem(key) {
    return this.values.get(key) ?? null;
  }

  setItem(key, value) {
    this.values.set(key, value);
  }

  removeItem(key) {
    this.values.delete(key);
  }
}

const storage = new MemoryStorage();

assert.deepEqual(loadGameNotifications(storage), []);
assert.ok(addGameNotification("+100 XP", "Prima patch", storage));
assert.equal(loadGameNotifications(storage).length, 1);
assert.equal(unreadGameNotificationCount(storage), 1);

markNotificationsSeen(storage);
assert.equal(unreadGameNotificationCount(storage), 0);

assert.ok(addGameNotification("Trofeo sbloccato", undefined, storage));
assert.equal(unreadGameNotificationCount(storage), 1);
assert.equal(loadGameNotifications(storage)[0]?.title, "Trofeo sbloccato");

assert.equal(clearGameNotifications(storage), true);
assert.deepEqual(loadGameNotifications(storage), []);

console.log("Centro notifiche: 8 controlli superati.");
