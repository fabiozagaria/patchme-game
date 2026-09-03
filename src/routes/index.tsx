import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Plus, Settings, Trash2, Pencil } from "lucide-react";
import { toast } from "sonner";
import { APP_CONFIG, TEXTS } from "@/config/app-config";
import { cleanPatch, type Patch } from "@/lib/patch-model";
import { formatDate } from "@/lib/versioning";
import { useAppStore } from "@/state/app-store";
import { OnboardingWizard } from "@/components/OnboardingWizard";
import { ProductTour } from "@/components/ProductTour";
import { UpdateNotice } from "@/components/UpdateNotice";
import { GuidedPatchWizard, type GuidedAnswer } from "@/components/GuidedPatchWizard";
import { PatchyMascot } from "@/components/PatchyMascot";
import { WeeklyPromptCard } from "@/components/WeeklyPromptCard";
import { PlayerProfileCard } from "@/components/PlayerProfileCard";
import type { WeeklyPromptSelection } from "@/lib/weekly-prompt";
import { Button } from "@/components/ui/button";
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

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "PatchMe — Trasforma persone e momenti in patch notes" },
      {
        name: "description",
        content:
          "Trasforma amici, persone e situazioni in finte patch notes da videogioco, crea un'immagine e condividila.",
      },
      {
        property: "og:title",
        content: "PatchMe — Trasforma persone e momenti in patch notes",
      },
      {
        property: "og:description",
        content: "Crea finte patch notes divertenti e condividile con chi vuoi.",
      },
    ],
  }),
  component: ArchivePage,
});

function ArchivePage() {
  const { ready, settings, patches, saveSettings, deletePatch, canPersist } = useAppStore();
  const navigate = useNavigate();
  const [pendingDelete, setPendingDelete] = useState<Patch | null>(null);
  const [createChoice, setCreateChoice] = useState(false);
  const [guided, setGuided] = useState(false);

  if (!ready) return <div className="min-h-screen bg-background" />;

  if (!settings.productTourSeen) {
    return <ProductTour onDone={() => saveSettings({ ...settings, productTourSeen: true })} />;
  }

  if (!settings.onboarded) {
    return (
      <OnboardingWizard
        onComplete={(nextSettings) => saveSettings({ ...nextSettings, productTourSeen: true })}
      />
    );
  }

  const finishGuided = (answers: GuidedAnswer[]) => {
    window.sessionStorage.setItem("patchme.guided.answers", JSON.stringify(answers));
    navigate({ to: "/patch/new" });
  };

  const startWeeklyPatch = (selection: WeeklyPromptSelection) => {
    window.sessionStorage.setItem(APP_CONFIG.storageKeys.weeklyDraft, JSON.stringify(selection));
    navigate({ to: "/patch/new" });
  };

  return (
    <div className="min-h-screen bg-background pb-28">
      <header className="mx-auto flex max-w-3xl items-start justify-between gap-3 px-4 pb-2 pt-8">
        <div className="min-w-0">
          <p className="display text-xs font-extrabold uppercase tracking-[0.3em] text-brand">
            {APP_CONFIG.name}
          </p>
          <h1 className="mt-1 truncate text-2xl font-extrabold uppercase text-foreground">
            Ciao {settings.displayName || "tu"}
          </h1>
          <p className="text-sm text-muted-foreground">{APP_CONFIG.tagline}</p>
        </div>
        <Link
          to="/settings"
          aria-label="Impostazioni"
          className="tap-safe flex w-11 items-center justify-center rounded-lg border border-border text-muted-foreground hover:text-foreground"
        >
          <Settings className="size-5" />
        </Link>
      </header>

      {!canPersist && (
        <p className="mx-auto mt-3 max-w-3xl px-4 text-xs text-destructive">
          Archiviazione locale non disponibile: le patch non verranno salvate.
        </p>
      )}

      <main className="mx-auto max-w-3xl px-4 py-4">
        <PlayerProfileCard
          displayName={settings.displayName}
          patches={patches}
          avatar={settings.profileAvatar}
        />
        <div className="mt-4">
          <WeeklyPromptCard onCreatePatch={startWeeklyPatch} />
        </div>
        {patches.length === 0 ? (
          <div className="surface-card mt-4 p-8 text-center">
            <PatchyMascot className="mx-auto mb-2 size-40 object-contain" pose="thinking" />
            <h2 className="text-lg font-semibold text-foreground">{TEXTS.emptyArchiveTitle}</h2>
            <p className="mx-auto mt-2 max-w-sm text-sm text-muted-foreground">
              {TEXTS.emptyArchiveBody}
            </p>
          </div>
        ) : (
          <ul className="mt-4 space-y-3">
            {patches.map((patch) => {
              const clean = cleanPatch(patch);
              const summary = clean.sections
                .map((s) => `${s.title || "Sezione"}: ${s.items.length}`)
                .join(" · ");
              return (
                <li key={patch.id} className="surface-card p-4">
                  <Link
                    to="/patch/$id"
                    params={{ id: patch.id }}
                    className="block focus-visible:outline-none"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <h2 className="min-w-0 flex-1 truncate text-base font-semibold text-foreground">
                        {patch.title}
                      </h2>
                      <span
                        className={`shrink-0 rounded-md px-2 py-0.5 text-xs font-semibold ${
                          patch.status === "published"
                            ? "bg-brand text-brand-foreground"
                            : "border border-border text-muted-foreground"
                        }`}
                      >
                        {patch.status === "published" ? "Pubblicata" : "Bozza"}
                      </span>
                    </div>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {patch.version} · {formatDate(patch.date)}
                    </p>
                    <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">
                      {summary || "Nessun contenuto"}
                    </p>
                  </Link>
                  <div className="mt-3 flex justify-end gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="tap-safe"
                      onClick={() => navigate({ to: "/patch/$id/edit", params: { id: patch.id } })}
                    >
                      <Pencil className="mr-1 size-4" /> Modifica
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="tap-safe text-muted-foreground hover:text-destructive"
                      onClick={() => setPendingDelete(patch)}
                    >
                      <Trash2 className="mr-1 size-4" /> Elimina
                    </Button>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </main>

      <div className="fixed inset-x-0 bottom-0 px-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
        <div className="mx-auto max-w-3xl">
          <Button
            onClick={() => setCreateChoice(true)}
            className="tap-safe h-12 w-full bg-brand text-base font-bold text-brand-foreground shadow-lg hover:bg-brand/90"
          >
            <Plus className="mr-1 size-5" /> Nuova patch
          </Button>
        </div>
      </div>

      <AlertDialog
        open={pendingDelete !== null}
        onOpenChange={(open) => !open && setPendingDelete(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Eliminare “{pendingDelete?.title}”?</AlertDialogTitle>
            <AlertDialogDescription>{TEXTS.deleteConfirm}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annulla</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (pendingDelete) {
                  if (deletePatch(pendingDelete.id)) toast.success("Patch eliminata");
                  else
                    toast.error(
                      "Eliminazione non riuscita: memoria del dispositivo non disponibile",
                    );
                }
                setPendingDelete(null);
              }}
            >
              Elimina
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      {guided && <GuidedPatchWizard onCancel={() => setGuided(false)} onComplete={finishGuided} />}
      <AlertDialog open={createChoice} onOpenChange={setCreateChoice}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Come vuoi creare la patch?</AlertDialogTitle>
            <AlertDialogDescription>
              Puoi rispondere a cinque domande oppure partire dall'editor vuoto.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="grid gap-2">
            <Button
              onClick={() => {
                setCreateChoice(false);
                setGuided(true);
              }}
              className="tap-safe bg-brand text-brand-foreground"
            >
              Creazione guidata
            </Button>
            <Button
              variant="outline"
              onClick={() => navigate({ to: "/patch/new" })}
              className="tap-safe"
            >
              Crea liberamente
            </Button>
          </div>
        </AlertDialogContent>
      </AlertDialog>
      <UpdateNotice
        open={settings.lastSeenVersion !== APP_CONFIG.version}
        onClose={() => saveSettings({ ...settings, lastSeenVersion: APP_CONFIG.version })}
      />
    </div>
  );
}
