import { useEffect, useState } from "react";
import { APP_CONFIG } from "@/config/app-config";
import {
  ACCENTS,
  DEFAULT_SETTINGS,
  type AppSettings,
  type ThemeMode,
  type VersionFormat,
} from "@/lib/patch-model";
import { validateDisplayName, validateUsername } from "@/lib/validation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ProfileAppearancePreview } from "@/components/ProfileAppearancePreview";
import { applyAppearance } from "@/lib/appearance";
import { focusValidationError } from "@/lib/focus-validation-error";

const VERSION_OPTIONS: { value: VersionFormat; label: string; hint: string }[] = [
  { value: "yearWeek", label: "Anno / settimana", hint: "es. v26.36" },
  { value: "sequential", label: "Sequenziale", hint: "es. v1.0" },
  { value: "manual", label: "Manuale", hint: "la scrivi tu" },
];

const THEME_OPTIONS: { value: ThemeMode; label: string }[] = [
  { value: "dark", label: "Scuro" },
  { value: "light", label: "Chiaro" },
  { value: "system", label: "Sistema" },
];

export function OnboardingWizard({ onComplete }: { onComplete: (settings: AppSettings) => void }) {
  const [draft, setDraft] = useState<AppSettings>({ ...DEFAULT_SETTINGS });
  const [usernameError, setUsernameError] = useState<string | undefined>(undefined);
  const [displayNameError, setDisplayNameError] = useState<string | undefined>(undefined);

  useEffect(() => {
    applyAppearance(draft.theme, draft.accent);
  }, [draft.accent, draft.theme]);

  const submit = () => {
    const nextUsernameError = validateUsername(draft.username);
    const nextDisplayNameError = validateDisplayName(draft.displayName);
    setUsernameError(nextUsernameError);
    setDisplayNameError(nextDisplayNameError);
    if (nextUsernameError || nextDisplayNameError) {
      focusValidationError(nextUsernameError ? "#username" : "#display-name");
      return;
    }
    onComplete({
      ...draft,
      username: draft.username.trim(),
      displayName: draft.displayName.trim(),
      onboarded: true,
    });
  };

  return (
    <main className="mx-auto min-h-screen w-full max-w-xl px-4 pb-16 pt-10">
      <p className="display text-sm font-extrabold uppercase tracking-[0.3em] text-brand">
        {APP_CONFIG.name}
      </p>
      <h1 className="mt-2 text-3xl font-extrabold uppercase leading-tight text-foreground">
        Configura la tua prima volta
      </h1>
      <p className="mt-2 text-sm text-muted-foreground">
        {APP_CONFIG.tagline}. Tutto resta sul tuo dispositivo e potrai cambiarlo dalle impostazioni.
      </p>

      <div className="mt-8 space-y-6">
        <ProfileAppearancePreview avatar={draft.profileAvatar} username={draft.username} />
        <div className="surface-card p-4">
          <Label htmlFor="username" className="text-sm font-semibold">
            Username
          </Label>
          <Input
            id="username"
            value={draft.username}
            maxLength={APP_CONFIG.limits.displayName}
            placeholder="Scegli il tuo username"
            aria-invalid={Boolean(usernameError)}
            aria-describedby={usernameError ? "username-error" : undefined}
            autoCapitalize="none"
            autoCorrect="off"
            spellCheck={false}
            onChange={(e) => {
              const username = e.target.value;
              setDraft({
                ...draft,
                username,
                displayName: draft.displayName === draft.username ? username : draft.displayName,
              });
            }}
            className="tap-safe mt-2"
          />
          {usernameError && (
            <p id="username-error" className="mt-2 text-xs text-destructive">
              {usernameError}
            </p>
          )}
          <p className="mt-2 text-xs text-muted-foreground">
            Da {APP_CONFIG.limits.minDisplayName} a {APP_CONFIG.limits.displayName} caratteri, senza
            spazi.
          </p>
        </div>

        <div className="surface-card p-4">
          <Label htmlFor="display-name" className="text-sm font-semibold">
            Nome visualizzato
          </Label>
          <Input
            id="display-name"
            value={draft.displayName}
            maxLength={APP_CONFIG.limits.displayName}
            placeholder="Come vuoi essere chiamato"
            aria-invalid={Boolean(displayNameError)}
            aria-describedby={displayNameError ? "display-name-error" : "display-name-help"}
            onChange={(e) => setDraft({ ...draft, displayName: e.target.value })}
            className="tap-safe mt-2"
          />
          {displayNameError ? (
            <p id="display-name-error" className="mt-2 text-xs text-destructive">
              {displayNameError}
            </p>
          ) : null}
          <p id="display-name-help" className="mt-2 text-xs text-muted-foreground">
            Può contenere spazi e puoi cambiarlo gratis. Alcuni nomi nascondono easter egg.
          </p>
        </div>

        <fieldset className="surface-card p-4">
          <legend className="px-1 text-sm font-semibold">Formato versione</legend>
          <div className="mt-2 grid gap-2">
            {VERSION_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => setDraft({ ...draft, versionFormat: opt.value })}
                aria-pressed={draft.versionFormat === opt.value}
                className={`tap-safe flex items-center justify-between rounded-lg border px-3 py-2 text-left text-sm transition-colors ${
                  draft.versionFormat === opt.value
                    ? "border-brand bg-surface-2 text-foreground"
                    : "border-border text-muted-foreground hover:text-foreground"
                }`}
              >
                <span className="font-medium">{opt.label}</span>
                <span className="text-xs">{opt.hint}</span>
              </button>
            ))}
          </div>
        </fieldset>

        <fieldset className="surface-card p-4">
          <legend className="px-1 text-sm font-semibold">Tema</legend>
          <p className="mt-1 text-xs text-muted-foreground">
            La scelta viene applicata subito e potrà essere cambiata dalle impostazioni.
          </p>
          <div className="mt-2 grid grid-cols-3 gap-2">
            {THEME_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => setDraft({ ...draft, theme: opt.value })}
                aria-pressed={draft.theme === opt.value}
                className={`tap-safe rounded-lg border px-2 text-sm transition-colors ${
                  draft.theme === opt.value
                    ? "border-brand bg-surface-2 text-foreground"
                    : "border-border text-muted-foreground hover:text-foreground"
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </fieldset>

        <fieldset className="surface-card p-4">
          <legend className="px-1 text-sm font-semibold">Colore principale</legend>
          <p className="mt-1 text-xs text-muted-foreground">
            Colora pulsanti, livelli e dettagli dell’interfaccia.
          </p>
          <div className="mt-3 flex flex-wrap gap-3">
            {ACCENTS.map((accent) => (
              <button
                key={accent.id}
                type="button"
                aria-label={accent.label}
                aria-pressed={draft.accent === accent.value}
                onClick={() => setDraft({ ...draft, accent: accent.value })}
                className={`size-11 rounded-full border-2 transition-transform ${
                  draft.accent === accent.value
                    ? "border-foreground scale-105"
                    : "border-transparent"
                }`}
                style={{ backgroundColor: accent.value }}
              />
            ))}
          </div>
        </fieldset>
      </div>

      <Button
        onClick={submit}
        className="tap-safe mt-8 w-full bg-brand text-base font-semibold text-brand-foreground hover:bg-brand/90"
      >
        Inizia
      </Button>
    </main>
  );
}
