import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import {
  BookOpen,
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
  Send,
} from "lucide-react";
import { APP_CONFIG } from "@/config/app-config";
import { ACCENTS, type AppSettings, type ThemeMode, type VersionFormat } from "@/lib/patch-model";
import { validateDisplayName } from "@/lib/validation";
import { useAppStore } from "@/state/app-store";
import { AppHeader } from "@/components/AppHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { UpdateNotice } from "@/components/UpdateNotice";
import { PatchyMascot } from "@/components/PatchyMascot";

export const Route = createFileRoute("/settings")({
  head: () => ({
    meta: [
      { title: "Impostazioni — PatchMe" },
      {
        name: "description",
        content: "Nome visualizzato, formato versione, tema e colore principale di PatchMe.",
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
  const [error, setError] = useState<string | undefined>(undefined);
  const [newsOpen, setNewsOpen] = useState(false);

  if (!ready) return <div className="min-h-screen bg-background" />;
  const current = draft ?? settings;

  const update = (patch: Partial<AppSettings>) => setDraft({ ...current, ...patch });

  const goBack = () => {
    setDraft(null);
    setError(undefined);
    navigate({ to: "/" });
  };

  const submit = () => {
    const nameError = validateDisplayName(current.displayName);
    setError(nameError);
    if (nameError) {
      toast.error("Controlla i campi evidenziati");
      return;
    }
    const ok = saveSettings({
      ...current,
      displayName: current.displayName.trim(),
      onboarded: true,
    });
    if (!ok) {
      toast.error("Salvataggio non riuscito: memoria del dispositivo non disponibile");
      return;
    }
    setDraft(null);
    toast.success("Impostazioni salvate");
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
      toast.success("Link di PatchMe copiato");
    } catch {
      toast.error("Non riesco a copiare il link su questo dispositivo");
    }
  };

  return (
    <div className="min-h-screen bg-background pb-28">
      <AppHeader title="Impostazioni" subtitle={APP_CONFIG.name} onBack={goBack} />

      <main className="mx-auto max-w-xl space-y-5 px-4 py-5">
        <section className="surface-card p-4">
          <Label htmlFor="name">Nome visualizzato</Label>
          <Input
            id="name"
            value={current.displayName}
            maxLength={APP_CONFIG.limits.displayName}
            aria-invalid={Boolean(error)}
            onChange={(e) => update({ displayName: e.target.value })}
            className="tap-safe mt-2"
          />
          {error && <p className="mt-2 text-xs text-destructive">{error}</p>}
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
        </fieldset>

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
          <button
            type="button"
            onClick={() => setNewsOpen(true)}
            className="tap-safe flex w-full items-center gap-3 px-4 py-3 text-left"
          >
            <Sparkles className="size-5 text-brand" aria-hidden="true" />
            <span className="flex-1 text-sm font-medium">Novità</span>
            <Badge variant="secondary">0.2.0</Badge>
          </button>
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
            href={APP_CONFIG.links.telegram}
            target="_blank"
            rel="noreferrer"
            className="tap-safe flex items-center gap-3 border-b border-border px-4 py-3"
          >
            <Send className="size-5 text-brand" aria-hidden="true" />
            <span className="flex-1 text-sm font-medium">Aggiornamenti Telegram</span>
            <ExternalLink className="size-4 text-muted-foreground" aria-hidden="true" />
          </a>
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
    </div>
  );
}
