import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { APP_CONFIG } from "@/config/app-config";
import { ACCENTS, type AppSettings, type ThemeMode, type VersionFormat } from "@/lib/patch-model";
import { validateDisplayName } from "@/lib/validation";
import { useAppStore } from "@/state/app-store";
import { AppHeader } from "@/components/AppHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

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

const THEME_OPTIONS: { value: ThemeMode; label: string }[] = [
  { value: "dark", label: "Scuro" },
  { value: "light", label: "Chiaro" },
  { value: "system", label: "Sistema" },
];

function SettingsPage() {
  const navigate = useNavigate();
  const { ready, settings, saveSettings } = useAppStore();
  const [draft, setDraft] = useState<AppSettings | null>(null);
  const [error, setError] = useState<string | undefined>(undefined);

  if (!ready) return <div className="min-h-screen bg-background" />;
  const current = draft ?? settings;

  const update = (patch: Partial<AppSettings>) => setDraft({ ...current, ...patch });

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

  return (
    <div className="min-h-screen bg-background pb-28">
      <AppHeader title="Impostazioni" subtitle={APP_CONFIG.name} backTo="/" />

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

        <section className="surface-card space-y-3 p-4">
          <div>
            <h2 className="font-semibold text-foreground">Guida e aggiornamenti</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Rivedi l'introduzione oppure consulta le novità della versione {APP_CONFIG.version}.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <Button
              variant="outline"
              onClick={() => {
                if (saveSettings({ ...current, productTourSeen: false })) navigate({ to: "/" });
              }}
              className="tap-safe"
            >
              Come funziona
            </Button>
            <Button
              variant="outline"
              onClick={() => toast.info(APP_CONFIG.changelog.items.join(" · "))}
              className="tap-safe"
            >
              Novità
            </Button>
          </div>
        </section>

        <fieldset className="surface-card p-4">
          <legend className="px-1 text-sm font-semibold">Tema</legend>
          <div className="mt-2 grid grid-cols-3 gap-2">
            {THEME_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                type="button"
                aria-pressed={current.theme === opt.value}
                onClick={() => update({ theme: opt.value })}
                className={`tap-safe rounded-lg border px-2 text-sm ${
                  current.theme === opt.value
                    ? "border-brand bg-surface-2 text-foreground"
                    : "border-border text-muted-foreground"
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </fieldset>

        <fieldset className="surface-card p-4">
          <legend className="px-1 text-sm font-semibold">Colore principale</legend>
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

        <p className="text-center text-xs text-muted-foreground">
          {APP_CONFIG.name} · fabiozagariadev · dati salvati solo su questo dispositivo
        </p>
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
    </div>
  );
}
