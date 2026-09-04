import { createFileRoute, Navigate } from "@tanstack/react-router";
import { BellRing, Check, Gamepad2, History, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { AppHeader } from "@/components/AppHeader";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  clearGameNotifications,
  formatNotificationTimestamp,
  loadGameNotifications,
  markNotificationsSeen,
  NOTIFICATION_CENTER_EVENT,
  RELEASE_NOTIFICATIONS,
  type GameNotification,
} from "@/lib/notification-center";
import { hardcoreCopy } from "@/lib/hardcore-copy";
import { useAppStore } from "@/state/app-store";

export const Route = createFileRoute("/notifications")({
  head: () => ({
    meta: [
      { title: "Centro notifiche — PatchMe" },
      {
        name: "description",
        content: "Consulta gli aggiornamenti di PatchMe e lo storico delle notifiche di gioco.",
      },
    ],
  }),
  component: NotificationsPage,
});

function NotificationsPage() {
  const { ready, settings } = useAppStore();
  const [gameNotifications, setGameNotifications] = useState<GameNotification[]>([]);

  useEffect(() => {
    const refresh = () => setGameNotifications(loadGameNotifications());
    refresh();
    markNotificationsSeen();
    window.addEventListener(NOTIFICATION_CENTER_EVENT, refresh);
    return () => window.removeEventListener(NOTIFICATION_CENTER_EVENT, refresh);
  }, []);

  if (!ready) return <div className="min-h-screen bg-background" />;
  if (!settings.onboarded) return <Navigate to="/" />;

  const hardcore = settings.hardcoreMode;

  return (
    <div className="min-h-screen bg-background pb-12">
      <AppHeader
        title={hardcoreCopy(hardcore, "Centro notifiche", "Registro delle stronzate")}
        subtitle={hardcoreCopy(
          hardcore,
          "Aggiornamenti e attività di gioco",
          "Qui resta scritto tutto il casino",
        )}
        backTo="/"
      />
      <main className="mx-auto max-w-3xl px-4 py-5">
        <Tabs defaultValue="updates">
          <TabsList className="grid h-auto w-full grid-cols-2">
            <TabsTrigger value="updates" className="gap-2 py-2.5">
              <History className="size-4" /> Aggiornamenti
            </TabsTrigger>
            <TabsTrigger value="game" className="gap-2 py-2.5">
              <Gamepad2 className="size-4" /> Gioco
            </TabsTrigger>
          </TabsList>

          <TabsContent value="updates" className="mt-4 space-y-3">
            {RELEASE_NOTIFICATIONS.map((release) => (
              <article key={release.version} className="surface-card p-4">
                <div className="flex items-start gap-3">
                  <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-brand/10 text-brand">
                    {release.current ? (
                      <BellRing className="size-5" />
                    ) : (
                      <History className="size-5" />
                    )}
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="font-black text-foreground">PatchMe v{release.version}</h2>
                      {release.current ? (
                        <Badge>Corrente</Badge>
                      ) : (
                        <Badge variant="secondary">Passato</Badge>
                      )}
                    </div>
                    <p className="mt-1 text-sm text-foreground">{release.title}</p>
                    <time
                      className="mt-2 block text-xs text-muted-foreground"
                      dateTime={release.createdAt}
                    >
                      {formatNotificationTimestamp(release.createdAt)}
                    </time>
                  </div>
                </div>
              </article>
            ))}
          </TabsContent>

          <TabsContent value="game" className="mt-4">
            <div className="mb-3 flex items-center justify-between gap-3">
              <p className="text-sm text-muted-foreground">
                {hardcoreCopy(
                  hardcore,
                  "XP, livelli, missioni, Bit e attività recenti.",
                  "XP, livelli e ogni altra minchiata conquistata.",
                )}
              </p>
              {gameNotifications.length > 0 ? (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    if (clearGameNotifications()) setGameNotifications([]);
                  }}
                >
                  <Trash2 className="mr-1 size-4" /> Svuota
                </Button>
              ) : null}
            </div>
            {gameNotifications.length === 0 ? (
              <div className="surface-card p-8 text-center">
                <Gamepad2 className="mx-auto size-10 text-brand" />
                <h2 className="mt-3 font-black text-foreground">Nessuna notifica di gioco</h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  Missioni, XP, Bit e level-up compariranno qui con data e ora.
                </p>
              </div>
            ) : (
              <ol className="space-y-3">
                {gameNotifications.map((notification) => (
                  <li key={notification.id} className="surface-card p-4">
                    <div className="flex items-start gap-3">
                      <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-brand/10 text-brand">
                        <Check className="size-4" />
                      </span>
                      <div className="min-w-0">
                        <p className="font-bold text-foreground">{notification.title}</p>
                        {notification.description ? (
                          <p className="mt-1 text-sm text-muted-foreground">
                            {notification.description}
                          </p>
                        ) : null}
                        <time
                          className="mt-2 block text-xs text-muted-foreground"
                          dateTime={notification.createdAt}
                        >
                          {formatNotificationTimestamp(notification.createdAt)}
                        </time>
                      </div>
                    </div>
                  </li>
                ))}
              </ol>
            )}
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
