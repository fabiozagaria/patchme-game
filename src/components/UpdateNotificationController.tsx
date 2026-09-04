import { useEffect } from "react";
import { APP_CONFIG } from "@/config/app-config";
import { shouldNotifyVersionUpdate, supportsUpdateNotifications } from "@/lib/update-notifications";
import { useAppStore } from "@/state/app-store";

export function UpdateNotificationController() {
  const { ready, settings, saveSettings } = useAppStore();

  useEffect(() => {
    if (!supportsUpdateNotifications()) return;
    void navigator.serviceWorker.register("/sw.js").catch(() => undefined);
  }, []);

  useEffect(() => {
    if (
      !ready ||
      !supportsUpdateNotifications() ||
      !shouldNotifyVersionUpdate(
        settings.updateNotifications,
        Notification.permission,
        settings.lastNotifiedVersion,
        APP_CONFIG.version,
      )
    ) {
      return;
    }

    let cancelled = false;
    void navigator.serviceWorker.ready
      .then(async (registration) => {
        if (cancelled) return;
        await registration.showNotification(`PatchMe ${APP_CONFIG.version} è online`, {
          body: APP_CONFIG.changelog.title,
          icon: "/assets/icon-192.png",
          badge: "/favicon-32.png",
          tag: `patchme-update-${APP_CONFIG.version}`,
          data: { url: "/" },
        });
        if (!cancelled) {
          saveSettings({ ...settings, lastNotifiedVersion: APP_CONFIG.version });
        }
      })
      .catch(() => undefined);

    return () => {
      cancelled = true;
    };
  }, [ready, saveSettings, settings]);

  return null;
}
