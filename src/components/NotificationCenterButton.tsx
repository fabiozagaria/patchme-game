import { Link } from "@tanstack/react-router";
import { Bell } from "lucide-react";
import { useEffect, useState } from "react";
import { NOTIFICATION_CENTER_EVENT, unreadGameNotificationCount } from "@/lib/notification-center";

export function NotificationCenterButton() {
  const [unread, setUnread] = useState(0);

  useEffect(() => {
    const refresh = () => setUnread(unreadGameNotificationCount());
    refresh();
    window.addEventListener(NOTIFICATION_CENTER_EVENT, refresh);
    window.addEventListener("storage", refresh);
    return () => {
      window.removeEventListener(NOTIFICATION_CENTER_EVENT, refresh);
      window.removeEventListener("storage", refresh);
    };
  }, []);

  return (
    <Link
      to="/notifications"
      aria-label={unread > 0 ? `Centro notifiche, ${unread} non lette` : "Centro notifiche"}
      className="tap-safe relative flex w-11 items-center justify-center rounded-lg border border-border text-muted-foreground hover:text-foreground"
    >
      <Bell className="size-5" />
      {unread > 0 ? (
        <span className="absolute -right-1.5 -top-1.5 flex min-w-5 items-center justify-center rounded-full bg-brand px-1 text-[0.65rem] font-black leading-5 text-brand-foreground">
          {Math.min(unread, 99)}
        </span>
      ) : null}
    </Link>
  );
}
