import { useEffect, useMemo, useRef, useState } from "react";
import { useBlocker, useNavigate } from "@tanstack/react-router";
import { ChevronDown, ChevronUp, Eye, EyeOff, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { enqueueSuccessNotification } from "@/lib/notification-queue";
import {
  APP_CONFIG,
  SECTION_PRESETS,
  presetFor,
  TEXTS,
  type SectionCategory,
} from "@/config/app-config";
import {
  createId,
  createSection,
  cleanPatch,
  type Patch,
  type PatchStatus,
} from "@/lib/patch-model";
import { hasErrors, validatePatch, type PatchErrors } from "@/lib/validation";
import { useAppStore } from "@/state/app-store";
import { AppHeader } from "@/components/AppHeader";
import { PatchPreviewCard } from "@/components/PatchPreviewCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { focusValidationError } from "@/lib/focus-validation-error";
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
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

export function PatchEditor({ initialPatch, isNew }: { initialPatch: Patch; isNew: boolean }) {
  const navigate = useNavigate();
  const { settings, savePatch } = useAppStore();
  const [patch, setPatch] = useState<Patch>(initialPatch);
  const [errors, setErrors] = useState<PatchErrors>({});
  const [dirty, setDirty] = useState(isNew);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [picker, setPicker] = useState(false);
  const bypassGuard = useRef(false);

  // Protezione modifiche non salvate: refresh / chiusura scheda.
  useEffect(() => {
    if (!dirty) return;
    const onBeforeUnload = (event: BeforeUnloadEvent) => {
      event.preventDefault();
      event.returnValue = "";
    };
    window.addEventListener("beforeunload", onBeforeUnload);
    return () => window.removeEventListener("beforeunload", onBeforeUnload);
  }, [dirty]);

  // Protezione navigazione interna (router + back/forward del browser).
  const blocker = useBlocker({
    shouldBlockFn: () => dirty && !bypassGuard.current,
    enableBeforeUnload: false,
    withResolver: true,
  });

  const update = (next: Partial<Patch>) => {
    setPatch((prev) => ({ ...prev, ...next }));
    setDirty(true);
  };

  const usedCategories = useMemo(
    () => new Set(patch.sections.map((s) => s.category)),
    [patch.sections],
  );

  const addSection = (category: SectionCategory) => {
    const preset = presetFor(category);
    update({
      sections: [
        ...patch.sections,
        createSection(category, category === "custom" ? "" : preset.label),
      ],
    });
    setPicker(false);
  };

  const moveSection = (index: number, delta: number) => {
    const next = [...patch.sections];
    const target = index + delta;
    const a = next[index];
    const b = next[target];
    if (!a || !b) return;
    next[index] = b;
    next[target] = a;
    update({ sections: next });
  };

  const removeSection = (id: string) =>
    update({ sections: patch.sections.filter((s) => s.id !== id) });

  const setItem = (sectionId: string, itemId: string, text: string) =>
    update({
      sections: patch.sections.map((s) =>
        s.id === sectionId
          ? { ...s, items: s.items.map((i) => (i.id === itemId ? { ...i, text } : i)) }
          : s,
      ),
    });

  const addItem = (sectionId: string) =>
    update({
      sections: patch.sections.map((s) =>
        s.id === sectionId ? { ...s, items: [...s.items, { id: createId(), text: "" }] } : s,
      ),
    });

  const removeItem = (sectionId: string, itemId: string) =>
    update({
      sections: patch.sections.map((s) =>
        s.id === sectionId ? { ...s, items: s.items.filter((i) => i.id !== itemId) } : s,
      ),
    });

  const persist = (status: PatchStatus) => {
    const candidate: Patch = { ...patch, status };
    const found = validatePatch(candidate, status);
    setErrors(found);
    if (hasErrors(found)) {
      toast.error("Controlla i campi evidenziati");
      focusValidationError();
      return;
    }
    const cleaned = cleanPatch(candidate);
    const saved: Patch = { ...cleaned, updatedAt: new Date().toISOString() };
    if (!savePatch(saved)) {
      toast.error("Salvataggio non riuscito: memoria del dispositivo non disponibile");
      return;
    }
    setPatch(saved);
    setDirty(false);
    bypassGuard.current = true;
    enqueueSuccessNotification(status === "published" ? "Patch pubblicata" : "Bozza salvata", {
      sound: "success",
    });
    navigate({ to: "/" });
  };

  const requestExit = () => {
    void navigate({ to: "/" });
  };

  return (
    <div className="min-h-screen bg-background pb-32">
      <AppHeader
        title={isNew ? "Nuova patch" : "Modifica patch"}
        subtitle={dirty ? "Modifiche non salvate" : "Tutto salvato"}
        onBack={requestExit}
      />

      <main className="mx-auto max-w-3xl space-y-5 px-4 py-5">
        <section className="surface-card space-y-4 p-4">
          <div>
            <Label htmlFor="title">Titolo</Label>
            <Input
              id="title"
              value={patch.title}
              maxLength={APP_CONFIG.limits.title}
              placeholder="La settimana del ritorno"
              aria-invalid={Boolean(errors.title)}
              aria-describedby={errors.title ? "title-error" : undefined}
              onChange={(e) => update({ title: e.target.value })}
              className="tap-safe mt-1.5"
            />
            {errors.title && (
              <p id="title-error" className="mt-1.5 text-xs text-destructive">
                {errors.title}
              </p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="version">Versione</Label>
              <Input
                id="version"
                value={patch.version}
                maxLength={APP_CONFIG.limits.version}
                placeholder="v26.36"
                aria-invalid={Boolean(errors.version)}
                aria-describedby={errors.version ? "version-error" : undefined}
                onChange={(e) => update({ version: e.target.value })}
                className="tap-safe mt-1.5"
              />
              {errors.version && (
                <p id="version-error" className="mt-1.5 text-xs text-destructive">
                  {errors.version}
                </p>
              )}
            </div>
            <div>
              <Label htmlFor="date">Data</Label>
              <Input
                id="date"
                type="date"
                value={patch.date.slice(0, 10)}
                onChange={(e) =>
                  update({ date: new Date(`${e.target.value}T12:00:00`).toISOString() })
                }
                className="tap-safe mt-1.5"
              />
            </div>
          </div>
        </section>

        {patch.sections.map((section, index) => {
          const preset = presetFor(section.category);
          return (
            <section key={section.id} className="surface-card p-4">
              <div className="flex items-center gap-2">
                <span
                  aria-hidden="true"
                  className="size-2.5 shrink-0 rounded-full"
                  style={{ backgroundColor: `var(--${preset.token})` }}
                />
                {section.category === "custom" ? (
                  <Input
                    aria-label="Titolo sezione personalizzata"
                    value={section.title}
                    maxLength={APP_CONFIG.limits.sectionTitle}
                    placeholder="Titolo sezione"
                    onChange={(e) =>
                      update({
                        sections: patch.sections.map((s) =>
                          s.id === section.id ? { ...s, title: e.target.value } : s,
                        ),
                      })
                    }
                    className="h-9 flex-1"
                  />
                ) : (
                  <h2 className="flex-1 text-sm font-semibold uppercase tracking-wide text-foreground">
                    {section.title}
                  </h2>
                )}
                <button
                  type="button"
                  aria-label={
                    section.shareVisible
                      ? "Escludi sezione dalla condivisione"
                      : "Includi sezione nella condivisione"
                  }
                  aria-pressed={section.shareVisible}
                  title={section.shareVisible ? "Visibile nell'immagine" : "Privata"}
                  onClick={() =>
                    update({
                      sections: patch.sections.map((item) =>
                        item.id === section.id
                          ? { ...item, shareVisible: !item.shareVisible }
                          : item,
                      ),
                    })
                  }
                  className={`tap-safe flex w-9 items-center justify-center rounded-md ${section.shareVisible ? "text-brand" : "text-muted-foreground"}`}
                >
                  {section.shareVisible ? (
                    <Eye className="size-4" />
                  ) : (
                    <EyeOff className="size-4" />
                  )}
                </button>
                <button
                  type="button"
                  aria-label="Sposta sezione su"
                  onClick={() => moveSection(index, -1)}
                  className="tap-safe flex w-9 items-center justify-center rounded-md text-muted-foreground hover:text-foreground"
                >
                  <ChevronUp className="size-4" />
                </button>
                <button
                  type="button"
                  aria-label="Sposta sezione giù"
                  onClick={() => moveSection(index, 1)}
                  className="tap-safe flex w-9 items-center justify-center rounded-md text-muted-foreground hover:text-foreground"
                >
                  <ChevronDown className="size-4" />
                </button>
                <button
                  type="button"
                  aria-label="Rimuovi sezione"
                  onClick={() => removeSection(section.id)}
                  className="tap-safe flex w-9 items-center justify-center rounded-md text-muted-foreground hover:text-destructive"
                >
                  <Trash2 className="size-4" />
                </button>
              </div>

              <div className="mt-3 space-y-2">
                {section.items.map((item) => {
                  const itemErrorId = `item-${item.id}-error`;
                  const itemIsShort =
                    item.text.trim().length > 0 &&
                    item.text.trim().length < APP_CONFIG.limits.minItemText;
                  return (
                    <div key={item.id} className="flex items-start gap-2">
                      <div className="flex-1">
                        <Textarea
                          aria-label="Elemento della sezione"
                          value={item.text}
                          rows={2}
                          minLength={APP_CONFIG.limits.minItemText}
                          maxLength={APP_CONFIG.limits.itemText}
                          placeholder={preset.hint}
                          aria-invalid={itemIsShort}
                          aria-describedby={itemIsShort ? itemErrorId : undefined}
                          onChange={(e) => setItem(section.id, item.id, e.target.value)}
                          className="min-h-[56px] resize-none bg-surface-2"
                        />
                        {itemIsShort ? (
                          <p id={itemErrorId} className="mt-1 text-xs text-destructive">
                            Scrivi almeno {APP_CONFIG.limits.minItemText} caratteri.
                          </p>
                        ) : null}
                      </div>
                      <button
                        type="button"
                        aria-label="Elimina elemento"
                        onClick={() => removeItem(section.id, item.id)}
                        className="tap-safe flex w-9 items-center justify-center rounded-md text-muted-foreground hover:text-destructive"
                      >
                        <Trash2 className="size-4" />
                      </button>
                    </div>
                  );
                })}
              </div>

              <Button
                type="button"
                variant="ghost"
                onClick={() => addItem(section.id)}
                className="tap-safe mt-2 w-full justify-center text-sm"
              >
                <Plus className="mr-1 size-4" /> Aggiungi elemento
              </Button>
            </section>
          );
        })}

        {errors.sections && (
          <p
            tabIndex={-1}
            aria-invalid="true"
            className="rounded-lg border border-destructive/40 bg-destructive/10 px-3 py-2 text-xs text-destructive"
          >
            {errors.sections}
          </p>
        )}

        <Button
          type="button"
          variant="outline"
          onClick={() => setPicker(true)}
          className="tap-safe w-full border-dashed"
        >
          <Plus className="mr-1 size-4" /> Aggiungi sezione
        </Button>
      </main>

      <div className="fixed inset-x-0 bottom-0 border-t border-border bg-background/95 px-4 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-3 backdrop-blur">
        <div className="mx-auto flex max-w-3xl flex-col gap-2 sm:flex-row">
          <div className="flex gap-2 sm:flex-1">
            <Button
              variant="outline"
              onClick={() => setPreviewOpen(true)}
              className="tap-safe h-11 flex-1"
            >
              Anteprima
            </Button>
            <Button
              variant="secondary"
              onClick={() => persist("draft")}
              className="tap-safe h-11 flex-1"
            >
              Salva bozza
            </Button>
          </div>
          <Button
            onClick={() => persist("published")}
            className="tap-safe h-12 w-full bg-brand font-semibold text-brand-foreground hover:bg-brand/90 sm:h-11 sm:w-auto sm:flex-1"
          >
            Pubblica
          </Button>
        </div>
      </div>

      <Dialog open={picker} onOpenChange={setPicker}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Scegli una sezione</DialogTitle>
          </DialogHeader>
          <div className="grid gap-2">
            {SECTION_PRESETS.map((preset) => (
              <button
                key={preset.category}
                type="button"
                disabled={preset.category !== "custom" && usedCategories.has(preset.category)}
                onClick={() => addSection(preset.category)}
                className="tap-safe flex items-center gap-3 rounded-lg border border-border px-3 py-2 text-left text-sm disabled:opacity-40"
              >
                <span
                  aria-hidden="true"
                  className="size-2.5 rounded-full"
                  style={{ backgroundColor: `var(--${preset.token})` }}
                />
                <span className="font-medium text-foreground">{preset.label}</span>
                <span className="ml-auto text-xs text-muted-foreground">{preset.hint}</span>
              </button>
            ))}
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
        <DialogContent className="max-h-[85vh] max-w-md overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Anteprima</DialogTitle>
          </DialogHeader>
          <PatchPreviewCard patch={patch} displayName={settings.displayName} sharing />
        </DialogContent>
      </Dialog>

      <AlertDialog
        open={blocker.status === "blocked"}
        onOpenChange={(open) => {
          if (!open) blocker.reset?.();
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Uscire senza salvare?</AlertDialogTitle>
            <AlertDialogDescription>{TEXTS.unsavedConfirm}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => blocker.reset?.()}>Resta qui</AlertDialogCancel>
            <AlertDialogAction onClick={() => blocker.proceed?.()}>Esci</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
