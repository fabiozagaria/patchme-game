import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { enqueueSuccessNotification } from "@/lib/notification-queue";
import {
  BookOpen,
  BellRing,
  Check,
  Copy,
  ExternalLink,
  Github,
  Monitor,
  Moon,
  Palette,
  Share2,
  Sparkles,
  Sun,
  ShieldAlert,
  Skull,
  Volume2,
  VolumeX,
} from "lucide-react";
import { APP_CONFIG } from "@/config/app-config";
import { ACCENTS, type AppSettings, type ThemeMode, type VersionFormat } from "@/lib/patch-model";
import { validateDisplayName, validateUsername } from "@/lib/validation";
import { applyAppearance } from "@/lib/appearance";
import { focusValidationError } from "@/lib/focus-validation-error";
import { useAppStore } from "@/state/app-store";
import { AppHeader } from "@/components/AppHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { UpdateNotice } from "@/components/UpdateNotice";
import { PatchyMascot } from "@/components/PatchyMascot";
import { ProfileAppearancePreview } from "@/components/ProfileAppearancePreview";
import { Switch } from "@/components/ui/switch";
import { setSoundEffectsEnabled } from "@/lib/sound-effects";
import { BitCoin } from "@/components/BitCoin";
import { loadProgressionState, saveProgressionState } from "@/lib/progression-repository";
import { canAffordUsernameChange, usernameChangeCost } from "@/lib/username-change";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { hardcoreCopy } from "@/lib/hardcore-copy";
import {
  requestUpdateNotificationPermission,
  supportsUpdateNotifications,
} from "@/lib/update-notifications";

export const Route = createFileRoute("/settings")({
  head: () => ({
    meta: [
      { title: "Impostazioni — PatchMe" },
      {
        name: "description",
        content: "Username, formato versione, tema, colore e modalità di PatchMe.",
      },
      { property: "og:title", content: "Impostazioni — PatchMe" },
      { property: "og:description", content: "Personalizza PatchMe come preferisci." },
    ],
  }),
  component: SettingsPage,
});

const VERSION_OPTIONS: { value: VersionFormat; label: string; hint: string }[] = [
  { value: "yearWeek", label: "Anno / settimana", hint: "v26.36" },
  { value: "sequential", label: "Sequenziale", hint: "v1.0" },
  { value: "manual", label: "Manuale", hint: "libera" },
];

const THEME_OPTIONS: { value: ThemeMode; label: string; icon: typeof Sun }[] = [
  { value: "system", label: "Sistema", icon: Monitor },
  { value: "light", label: "Chiaro", icon: Sun },
  { value: "dark", label: "Scuro", icon: Moon },
];

function SettingsPage() {
  const navigate = useNavigate();
  const { ready, settings, saveSettings } = useAppStore();
  const [draft, setDraft] = useState<AppSettings | null>(null);
  const [usernameError, setUsernameError] = useState<string | undefined>(undefined);
  const [displayNameError, setDisplayNameError] = useState<string | undefined>(undefined);
  const [newsOpen, setNewsOpen] = useState(false);
  const [hardcoreConfirmOpen, setHardcoreConfirmOpen] = useState(false);
  const appearanceCommitted = useRef(false);
  const current = draft ?? settings;

  useEffect(() => {
    if (!ready || typeof document === "undefined") return;
    applyAppearance(current.theme, current.accent);
    return () => {
      if (!appearanceCommitted.current) applyAppearance(settings.theme, settings.accent);
    };
  }, [current.accent, current.theme, ready, settings.accent, settings.theme]);

  useEffect(() => {
    if (!ready) return;
    setSoundEffectsEnabled(current.soundEffects);
    return () => {
      if (!appearanceCommitted.current) setSoundEffectsEnabled(settings.soundEffects);
    };
  }, [current.soundEffects, ready, settings.soundEffects]);

  if (!ready) return <div className="min-h-screen bg-background" />;
  const usernameChanged = current.username.trim() !== settings.username;
  const changeCost = usernameChangeCost(settings.usernameChanges);

  const update = (patch: Partial<AppSettings>) => setDraft({ ...current, ...patch });

  const goBack = () => {
    setDraft(null);
    setUsernameError(undefined);
    setDisplayNameError(undefined);
    navigate({ to: "/" });
  };

  const submit = () => {
    const nextUsernameError = validateUsername(current.username);
    const nextDisplayNameError = validateDisplayName(current.displayName);
    setUsernameError(nextUsernameError);
    setDisplayNameError(nextDisplayNameError);
    if (nextUsernameError || nextDisplayNameError) {
      toast.error("Controlla i campi evidenziati");
      focusValidationError(nextUsernameError ? "#username" : "#display-name");
      return;
    }
    const progression = loadProgressionState();
    if (usernameChanged && !canAffordUsernameChange(progression.bits, settings.usernameChanges)) {
      setUsernameError(`Servono ${changeCost} Bit. Ne hai ${progression.bits}.`);
      toast.error("Bit insufficienti per cambiare Username");
      focusValidationError("#username");
      return;
    }
    const ok = saveSettings({
      ...current,
      username: current.username.trim(),
      displayName: current.displayName.trim(),
      usernameChanges: usernameChanged ? settings.usernameChanges + 1 : settings.usernameChanges,
      onboarded: true,
    });
    if (!ok) {
      toast.error("Salvataggio non riuscito: memoria del dispositivo non disponibile");
      return;
    }
    if (usernameChanged && changeCost > 0) {
      saveProgressionState({ ...progression, bits: progression.bits - changeCost });
    }
    appearanceCommitted.current = true;
    setDraft(null);
    enqueueSuccessNotification(
      hardcoreCopy(
        current.hardcoreMode,
        "Impostazioni salvate",
        "Impostazioni salvate. Contento adesso?",
      ),
      { sound: "success" },
    );
    void navigate({ to: "/" });
  };

  const shareApp = async () => {
    const url = window.location.origin;
    const shareData = {
      title: APP_CONFIG.name,
      text: `${APP_CONFIG.name} — ${APP_CONFIG.tagline}`,
      url,
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
        return;
      } catch (error) {
        if (error instanceof DOMException && error.name === "AbortError") return;
      }
    }

    try {
      await navigator.clipboard.writeText(url);
      enqueueSuccessNotification("Link di PatchMe copiato", { sound: "success" });
    } catch {
      toast.error("Non riesco a copiare il link su questo dispositivo");
    }
  };

  const toggleUpdateNotifications = async (enabled: boolean) => {
    if (!enabled) {
      update({ updateNotifications: false });
      return;
    }
    const permission = await requestUpdateNotificationPermission();
    if (permission !== "granted") {
      toast.error(
        permission === "unsupported"
          ? "Le notifiche browser non sono supportate su questo dispositivo"
          : "Permesso notifiche non concesso",
      );
      update({ updateNotifications: false });
      return;
    }
    update({
      updateNotifications: true,
      lastNotifiedVersion: APP_CONFIG.version,
    });
    enqueueSuccessNotification("Notifiche aggiornamenti attivate", { sound: "success" });
  };

  return (
    <div className="min-h-screen bg-background pb-28">
      <AppHeader title="Impostazioni" subtitle={APP_CONFIG.name} onBack={goBack} />

      <main className="mx-auto max-w-xl space-y-5 px-4 py-5">
        <section className="surface-card p-4">
          <Label htmlFor="username">Username</Label>
          <Input
            id="username"
            value={current.username}
            maxLength={APP_CONFIG.limits.displayName}
            aria-invalid={Boolean(usernameError)}
            aria-describedby={usernameError ? "username-error" : "username-help"}
            autoCapitalize="none"
            autoCorrect="off"
            spellCheck={false}
            onChange={(e) => update({ username: e.target.value })}
            className="tap-safe mt-2"
          />
          {usernameError && (
            <p id="username-error" className="mt-2 text-xs text-destructive">
              {usernameError}
            </p>
          )}
          <p id="username-help" className="mt-2 text-xs text-muted-foreground">
            Identità pubblica fissa, da 3 a {APP_CONFIG.limits.displayName} caratteri e senza spazi.{" "}
            {settings.usernameChanges === 0
              ? "Il primo cambio è gratuito."
              : "Ogni cambio successivo costa 200 Bit."}
          </p>
          {usernameChanged ? (
            <p className="mt-3 flex items-center gap-1 text-sm font-black text-brand">
              Costo del cambio: {changeCost} <BitCoin className="size-5" />
            </p>
          ) : null}
        </section>

        <section className="surface-card p-4">
          <Label htmlFor="display-name">Nome visualizzato</Label>
          <Input
            id="display-name"
            value={current.displayName}
            maxLength={APP_CONFIG.limits.displayName}
            aria-invalid={Boolean(displayNameError)}
            aria-describedby={displayNameError ? "display-name-error" : "display-name-help"}
            onChange={(e) => update({ displayName: e.target.value })}
            className="tap-safe mt-2"
          />
          {displayNameError ? (
            <p id="display-name-error" className="mt-2 text-xs text-destructive">
              {displayNameError}
            </p>
          ) : null}
          <p id="display-name-help" className="mt-2 text-xs text-muted-foreground">
            È gratuito, può contenere spazi ed è il nome usato dagli easter egg.
          </p>
        </section>

        <fieldset className="surface-card p-4">
          <legend className="px-1 text-sm font-semibold">Formato versione</legend>
          <div className="mt-2 grid gap-2">
            {VERSION_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                type="button"
                aria-pressed={current.versionFormat === opt.value}
                onClick={() => update({ versionFormat: opt.value })}
                className={`tap-safe flex items-center justify-between rounded-lg border px-3 py-2 text-left text-sm ${
                  current.versionFormat === opt.value
                    ? "border-brand bg-surface-2 text-foreground"
                    : "border-border text-muted-foreground"
                }`}
              >
                <span className="font-medium">{opt.label}</span>
                <span className="text-xs">{opt.hint}</span>
              </button>
            ))}
          </div>
        </fieldset>

        <fieldset className="surface-card p-4">
          <legend className="flex items-center gap-2 px-1 text-sm font-semibold">
            <Palette className="size-4 text-brand" aria-hidden="true" /> Aspetto
          </legend>
          <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
            Tema e colore cambiano subito per mostrarti il risultato. Premi “Salva impostazioni” per
            conservarli; se esci senza salvare torneranno come prima.
          </p>
          <ProfileAppearancePreview avatar={current.profileAvatar} username={current.displayName} />
          <p className="mt-4 text-xs font-medium text-muted-foreground">Tema</p>
          <div className="mt-2 grid grid-cols-3 gap-2">
            {THEME_OPTIONS.map((opt) => {
              const Icon = opt.icon;
              return (
                <button
                  key={opt.value}
                  type="button"
                  aria-pressed={current.theme === opt.value}
                  onClick={() => update({ theme: opt.value })}
                  className={`tap-safe relative flex flex-col items-center gap-2 rounded-xl border px-2 py-3 text-sm ${
                    current.theme === opt.value
                      ? "border-brand bg-brand/10 text-foreground"
                      : "border-border text-muted-foreground"
                  }`}
                >
                  <Icon className="size-5" aria-hidden="true" />
                  {opt.label}
                  {current.theme === opt.value ? (
                    <Check
                      className="absolute right-2 top-2 size-3 text-brand"
                      aria-hidden="true"
                    />
                  ) : null}
                </button>
              );
            })}
          </div>
          <div className="mt-4 rounded-xl border border-border bg-surface-2 p-3">
            <p className="text-sm font-semibold text-foreground">Avatar e cosmetici</p>
            <p className="mt-1 text-xs text-muted-foreground">
              Patchy base, avatar segreti e acquisti vivono tutti nel Profilo.
            </p>
            <Button asChild variant="outline" size="sm" className="mt-3">
              <Link to="/profile">Apri il Profilo</Link>
            </Button>
          </div>
          <p className="mt-5 text-xs font-medium text-muted-foreground">Colore principale</p>
          <div className="mt-3 flex flex-wrap gap-3">
            {ACCENTS.map((accent) => (
              <button
                key={accent.id}
                type="button"
                aria-label={accent.label}
                aria-pressed={current.accent === accent.value}
                onClick={() => update({ accent: accent.value })}
                className={`size-11 rounded-full border-2 ${
                  current.accent === accent.value
                    ? "border-foreground scale-105"
                    : "border-transparent"
                }`}
                style={{ backgroundColor: accent.value }}
              />
            ))}
          </div>
          <div className="mt-5 flex items-center justify-between gap-4 rounded-xl border border-border bg-surface-2 p-3">
            <div className="flex min-w-0 items-center gap-3">
              {current.soundEffects ? (
                <Volume2 className="size-5 shrink-0 text-brand" aria-hidden="true" />
              ) : (
                <VolumeX className="size-5 shrink-0 text-muted-foreground" aria-hidden="true" />
              )}
              <div>
                <Label htmlFor="sound-effects" className="font-semibold">
                  Effetti sonori
                </Label>
                <p className="text-xs text-muted-foreground">
                  Suoni retro per XP e trofei e un breve riff metal soltanto durante i level-up.
                </p>
              </div>
            </div>
            <Switch
              id="sound-effects"
              checked={current.soundEffects}
              onCheckedChange={(soundEffects) => {
                setSoundEffectsEnabled(soundEffects);
                update({ soundEffects });
              }}
              aria-label="Attiva effetti sonori"
            />
          </div>
        </fieldset>

        <section
          className="surface-card border-2 border-destructive/70 p-4"
          aria-labelledby="hardcore-title"
        >
          <div className="flex items-start gap-3">
            <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-destructive/15 text-destructive">
              <Skull aria-hidden="true" />
            </span>
            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-[0.65rem] font-black uppercase tracking-widest text-destructive">
                    Impostazione rischiosa
                  </p>
                  <Label
                    id="hardcore-title"
                    htmlFor="hardcore-mode"
                    className="text-base font-black"
                  >
                    Modalità Hardcore
                  </Label>
                </div>
                <Switch
                  id="hardcore-mode"
                  checked={current.hardcoreMode}
                  onCheckedChange={(enabled) => {
                    if (enabled) setHardcoreConfirmOpen(true);
                    else update({ hardcoreMode: false });
                  }}
                  aria-describedby="hardcore-warning"
                />
              </div>
              <p
                id="hardcore-warning"
                className="mt-3 text-sm font-semibold leading-relaxed text-destructive"
              >
                ⚠️ Meglio evitare: sostituisce i testi del sito con un linguaggio volgare, molto
                sarcastico e potenzialmente offensivo. Non attivarla davanti a bambini, nonne o
                persone dotate di dignità.
              </p>
              <p className="mt-2 text-xs text-muted-foreground">
                Attivandola sblocchi anche un Patchy fuori controllo. Niente musica continua:
                restano soltanto gli effetti sonori degli eventi.
              </p>
            </div>
          </div>
        </section>

        <section className="surface-card overflow-hidden">
          <div className="border-b border-border px-4 py-3">
            <h2 className="font-semibold text-foreground">Esperienza</h2>
          </div>
          <button
            type="button"
            onClick={() => {
              if (saveSettings({ ...current, productTourSeen: false })) navigate({ to: "/" });
            }}
            className="tap-safe flex w-full items-center gap-3 border-b border-border px-4 py-3 text-left"
          >
            <BookOpen className="size-5 text-brand" aria-hidden="true" />
            <span className="flex-1 text-sm font-medium">Come funziona</span>
            <span className="text-xs text-muted-foreground">Ripeti l'introduzione</span>
          </button>
          <Link
            to="/notifications"
            className="tap-safe flex w-full items-center gap-3 border-t border-border px-4 py-3 text-left"
          >
            <BellRing className="size-5 text-brand" aria-hidden="true" />
            <span className="flex-1 text-sm font-medium">Centro notifiche</span>
            <span className="text-xs text-muted-foreground">Storico completo</span>
          </Link>
          <button
            type="button"
            onClick={() => setNewsOpen(true)}
            className="tap-safe flex w-full items-center gap-3 px-4 py-3 text-left"
          >
            <Sparkles className="size-5 text-brand" aria-hidden="true" />
            <span className="flex-1 text-sm font-medium">Novità</span>
            <Badge variant="secondary">{APP_CONFIG.version}</Badge>
          </button>
          <div className="flex items-center justify-between gap-4 border-t border-border px-4 py-3">
            <div className="flex min-w-0 items-start gap-3">
              <BellRing className="mt-0.5 size-5 shrink-0 text-brand" aria-hidden="true" />
              <div>
                <Label htmlFor="update-notifications" className="font-semibold">
                  Notifiche nuove versioni
                </Label>
                <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                  Android ti avvisa quando riapri PatchMe dopo un aggiornamento. A sito
                  completamente chiuso servirà il futuro servizio Web Push.
                </p>
              </div>
            </div>
            <Switch
              id="update-notifications"
              checked={current.updateNotifications}
              disabled={!supportsUpdateNotifications()}
              onCheckedChange={(enabled) => void toggleUpdateNotifications(enabled)}
              aria-label="Attiva notifiche per le nuove versioni"
            />
          </div>
        </section>

        <section className="surface-card overflow-hidden">
          <div className="border-b border-border px-4 py-3">
            <h2 className="font-semibold text-foreground">Condivisione</h2>
          </div>
          <button
            type="button"
            onClick={shareApp}
            className="tap-safe flex w-full items-center gap-3 px-4 py-3 text-left"
          >
            {typeof navigator !== "undefined" && navigator.share ? (
              <Share2 className="size-5 text-brand" aria-hidden="true" />
            ) : (
              <Copy className="size-5 text-brand" aria-hidden="true" />
            )}
            <span className="flex-1 text-sm font-medium">Condividi PatchMe</span>
            <span className="text-xs text-muted-foreground">Invita un amico</span>
          </button>
        </section>

        <section className="surface-card overflow-hidden">
          <div className="border-b border-border px-4 py-3">
            <h2 className="font-semibold text-foreground">Informazioni</h2>
          </div>
          <div className="flex items-center justify-between border-b border-border px-4 py-3">
            <span className="text-sm font-medium">Versione corrente</span>
            <Badge variant="secondary">
              v{APP_CONFIG.version} {APP_CONFIG.releaseChannel}
            </Badge>
          </div>
          <div className="flex items-start gap-3 border-b border-border px-4 py-3">
            <Sparkles className="mt-0.5 size-5 shrink-0 text-brand" aria-hidden="true" />
            <div>
              <p className="text-sm font-medium text-foreground">Sviluppato con assistenza AI</p>
              <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                L&apos;AI ha supportato progettazione, codice, contenuti e immagini di Patchy. Idea,
                direzione, test e decisioni finali sono curati da Fabio Zagaria.
              </p>
            </div>
          </div>
          <a
            href={APP_CONFIG.links.github}
            target="_blank"
            rel="noreferrer"
            className="tap-safe flex items-center gap-3 border-b border-border px-4 py-3"
          >
            <Github className="size-5 text-brand" aria-hidden="true" />
            <span className="flex-1 text-sm font-medium">GitHub</span>
            <ExternalLink className="size-4 text-muted-foreground" aria-hidden="true" />
          </a>
          <a
            href={APP_CONFIG.links.portfolio}
            target="_blank"
            rel="noreferrer"
            className="tap-safe flex items-center gap-3 px-4 py-3"
          >
            <span className="flex size-5 items-center justify-center font-black text-brand">
              FZ
            </span>
            <span className="flex-1 text-sm font-medium">Portfolio</span>
            <ExternalLink className="size-4 text-muted-foreground" aria-hidden="true" />
          </a>
        </section>

        <div className="flex flex-col items-center text-center text-xs text-muted-foreground">
          <PatchyMascot className="size-24 object-contain" decorative />
          <p>
            Patchy è la mascotte ufficiale di PatchMe ed è stata generata con AI
            <br />
            Creato e curato da{" "}
            <span className="font-semibold text-foreground">fabiozagariadev</span>
            <br />I dati restano solo su questo dispositivo
          </p>
        </div>
      </main>

      <div className="fixed inset-x-0 bottom-0 border-t border-border bg-background/95 px-4 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-3 backdrop-blur">
        <div className="mx-auto max-w-xl">
          <Button
            onClick={submit}
            className="tap-safe h-12 w-full bg-brand font-semibold text-brand-foreground hover:bg-brand/90"
          >
            Salva impostazioni
          </Button>
        </div>
      </div>

      <UpdateNotice open={newsOpen} onClose={() => setNewsOpen(false)} />
      <AlertDialog open={hardcoreConfirmOpen} onOpenChange={setHardcoreConfirmOpen}>
        <AlertDialogContent className="border-2 border-destructive">
          <AlertDialogHeader>
            <div className="mx-auto flex size-14 items-center justify-center rounded-full bg-destructive/15 text-destructive">
              <ShieldAlert className="size-8" aria-hidden="true" />
            </div>
            <AlertDialogTitle className="text-center">
              Vuoi davvero togliere il guinzaglio a Patchy?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-center">
              L’interfaccia diventerà scurrile e sarcastica. Alcune frasi possono offendere esseri
              umani funzionanti. In compenso sbloccherai un avatar Hardcore esclusivo.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>No, tengo un minimo di dignità</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() =>
                update({
                  hardcoreMode: true,
                  unlockedAvatars: [...new Set([...current.unlockedAvatars, "hardcore" as const])],
                })
              }
            >
              Attiva Hardcore
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
