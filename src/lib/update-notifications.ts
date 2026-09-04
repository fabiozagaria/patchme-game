export function supportsUpdateNotifications(): boolean {
  return typeof window !== "undefined" && "serviceWorker" in navigator && "Notification" in window;
}

export function shouldNotifyVersionUpdate(
  enabled: boolean,
  permission: NotificationPermission | "unsupported",
  lastNotifiedVersion: string,
  currentVersion: string,
): boolean {
  return (
    enabled &&
    permission === "granted" &&
    lastNotifiedVersion.length > 0 &&
    lastNotifiedVersion !== currentVersion
  );
}

export async function requestUpdateNotificationPermission(): Promise<
  NotificationPermission | "unsupported"
> {
  if (!supportsUpdateNotifications()) return "unsupported";
  return Notification.requestPermission();
}
