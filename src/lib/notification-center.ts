export const NOTIFICATION_CENTER_EVENT = "patchme:notification-center-updated";

const GAME_NOTIFICATIONS_KEY = "patchme.notifications.game.v1";
const NOTIFICATIONS_SEEN_KEY = "patchme.notifications.seen.v1";
const MAX_GAME_NOTIFICATIONS = 100;

interface StorageAdapter {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
}

export interface GameNotification {
  id: string;
  title: string;
  description?: string;
  createdAt: string;
}

export interface ReleaseNotification {
  version: string;
  title: string;
  createdAt: string;
  current?: boolean;
}

export const RELEASE_NOTIFICATIONS: readonly ReleaseNotification[] = [
  {
    version: "0.8.0",
    title: "Patch dedicate, contro-patch e Studio social",
    createdAt: "2026-09-04T19:20:34+02:00",
    current: true,
  },
  {
    version: "0.7.1",
    title: "Bonus giornaliero e notifiche degli aggiornamenti",
    createdAt: "2026-09-04T18:44:51+02:00",
  },
  {
    version: "0.7.0",
    title: "Bit, ricompense e Patchy Shop",
    createdAt: "2026-09-04T11:19:28+02:00",
  },
  {
    version: "0.6.0",
    title: "Condivisione soltanto dopo la pubblicazione",
    createdAt: "2026-09-04T08:26:20+02:00",
  },
  {
    version: "0.5.0",
    title: "Profilo giocatore, XP, missioni e trofei",
    createdAt: "2026-09-02T22:53:13+02:00",
  },
  {
    version: "0.4.1",
    title: "Introduzione più breve e identità più chiara",
    createdAt: "2026-09-02T22:28:30+02:00",
  },
];

function browserStorage(): StorageAdapter | null {
  try {
    return typeof window === "undefined" ? null : window.localStorage;
  } catch {
    return null;
  }
}

function notifyCenterChanged(): void {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent(NOTIFICATION_CENTER_EVENT));
  }
}

export function loadGameNotifications(
  storage: StorageAdapter | null = browserStorage(),
): GameNotification[] {
  if (!storage) return [];
  try {
    const parsed = JSON.parse(storage.getItem(GAME_NOTIFICATIONS_KEY) ?? "[]") as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed
      .filter(
        (item): item is GameNotification =>
          typeof item === "object" &&
          item !== null &&
          typeof (item as GameNotification).id === "string" &&
          typeof (item as GameNotification).title === "string" &&
          typeof (item as GameNotification).createdAt === "string",
      )
      .slice(0, MAX_GAME_NOTIFICATIONS);
  } catch {
    return [];
  }
}

export function addGameNotification(
  title: string,
  description?: string,
  storage: StorageAdapter | null = browserStorage(),
): GameNotification | null {
  if (!storage) return null;
  const previous = loadGameNotifications(storage);
  const previousTimestamp = Date.parse(previous[0]?.createdAt ?? "");
  const seenTimestamp = Date.parse(storage.getItem(NOTIFICATIONS_SEEN_KEY) ?? "");
  const now = Date.now();
  const notification: GameNotification = {
    id:
      typeof crypto !== "undefined" && "randomUUID" in crypto
        ? crypto.randomUUID()
        : `${Date.now()}-${Math.random()}`,
    title,
    description,
    createdAt: new Date(
      Math.max(
        now,
        Number.isNaN(previousTimestamp) ? 0 : previousTimestamp + 1,
        Number.isNaN(seenTimestamp) ? 0 : seenTimestamp + 1,
      ),
    ).toISOString(),
  };
  try {
    storage.setItem(
      GAME_NOTIFICATIONS_KEY,
      JSON.stringify([notification, ...previous].slice(0, MAX_GAME_NOTIFICATIONS)),
    );
    notifyCenterChanged();
    return notification;
  } catch {
    return null;
  }
}

export function clearGameNotifications(storage: StorageAdapter | null = browserStorage()): boolean {
  if (!storage) return false;
  try {
    storage.removeItem(GAME_NOTIFICATIONS_KEY);
    notifyCenterChanged();
    return true;
  } catch {
    return false;
  }
}

export function markNotificationsSeen(storage: StorageAdapter | null = browserStorage()): void {
  if (!storage) return;
  try {
    storage.setItem(NOTIFICATIONS_SEEN_KEY, new Date().toISOString());
    notifyCenterChanged();
  } catch {
    // Il centro resta utilizzabile anche quando il browser blocca la persistenza.
  }
}

export function unreadGameNotificationCount(
  storage: StorageAdapter | null = browserStorage(),
): number {
  if (!storage) return 0;
  const seenAt = Date.parse(storage.getItem(NOTIFICATIONS_SEEN_KEY) ?? "");
  return loadGameNotifications(storage).filter((item) => {
    const createdAt = Date.parse(item.createdAt);
    return Number.isNaN(seenAt) || createdAt > seenAt;
  }).length;
}

export function formatNotificationTimestamp(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Data sconosciuta";
  return new Intl.DateTimeFormat("it-IT", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}
