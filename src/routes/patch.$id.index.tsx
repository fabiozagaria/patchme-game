import { createFileRoute, Navigate, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import {
  Check,
  Copy,
  Download,
  Loader2,
  LockKeyhole,
  Palette,
  Pencil,
  Share2,
  Smartphone,
  Square,
  RectangleHorizontal,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";
import { enqueueSuccessNotification } from "@/lib/notification-queue";
import { TEXTS } from "@/config/app-config";
import { useAppStore } from "@/state/app-store";
import { useCardExport } from "@/hooks/use-card-export";
import { EXPORT_SIZES } from "@/lib/share-image";
import type { ShareOrientation, ShareTemplate } from "@/lib/patch-model";
import { isPatchShareable, parseShareRequest } from "@/lib/patch-sharing";
import { calculatePlayerProgression } from "@/lib/player-progression";
import {
  EMPTY_PROGRESSION_STATE,
  loadProgressionState,
  type ProgressionState,
} from "@/lib/progression-repository";
import { AppHeader } from "@/components/AppHeader";
import { PatchPreviewCard } from "@/components/PatchPreviewCard";
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
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { hardcoreCopy } from "@/lib/hardcore-copy";

export const Route = createFileRoute("/patch/$id/")({
  validateSearch: (search: Record<string, unknown>) => ({
    share: parseShareRequest(search.share),
  }),
  head: () => ({
    meta: [
      { title: "Anteprima patch — PatchMe" },
      { name: "description", content: "Anteprima condivisibile della tua patch note personale." },
      { property: "og:title", content: "Anteprima patch — PatchMe" },
      { property: "og:description", content: "La scheda condivisibile della tua patch note." },
    ],
  }),
  component: PatchDetailPage,
});

const SHARE_TEMPLATES: readonly {
  id: ShareTemplate;
  name: string;
  description: string;
  swatch: string;
}[] = [
  {
    id: "classic",
    name: "PatchMe",
    description: "Pulito e riconoscibile",
    swatch: "bg-brand",
  },
  {
    id: "terminal",
    name: "Terminale",
    description: "Verde, scuro e nerd",
    swatch: "bg-emerald-400",
  },
  {
    id: "rpg",
    name: "RPG",
    description: "Caldo e fantasy",
    swatch: "bg-amber-500",
  },
  {
    id: "chaos",
    name: "Caos",
    description: "Colorato e storto bene",
    swatch: "bg-fuchsia-400",
  },
];

function PatchDetailPage() {
  const { id } = Route.useParams();
  const { share } = Route.useSearch();
  const navigate = useNavigate();
  const { ready, patches, settings, saveSettings, deletePatch } = useAppStore();
  const [confirm, setConfirm] = useState(false);
  const [shareOpen, setShareOpen] = useState(share);
  const [templateDraft, setTemplateDraft] = useState<ShareTemplate | null>(null);
  const [orientationDraft, setOrientationDraft] = useState<ShareOrientation | null>(null);
  const [persisted, setPersisted] = useState<ProgressionState>(EMPTY_PROGRESSION_STATE);
  const patch = patches.find((p) => p.id === id);
  const selectedTemplate = templateDraft ?? settings.shareTemplate;
  const selectedOrientation = orientationDraft ?? settings.shareOrientation;
  const progression = useMemo(
    () =>
      calculatePlayerProgression(
        patches,
        settings.displayName,
        persisted.completedMissionIds,
        persisted.missionXp,
        new Date(),
        persisted.highestStreak,
      ),
    [patches, persisted, settings.displayName],
  );
  const sharedProfile = {
    avatar: settings.profileAvatar,
    equippedAvatarId: persisted.equippedAvatarId,
    equippedFrameId: persisted.equippedProfileFrameId,
    equippedEffectId: persisted.equippedProfileEffectId,
    level: progression.level,
    title: progression.title,
    weeklyStreak: progression.weeklyStreak,
    publishedPatches: progression.publishedPatches,
  };
  const appUrl = typeof window !== "undefined" ? window.location.origin : "";
  const { nodeRef, busy, saveImage, shareImage, copyCaption } = useCardExport({
    version: patch?.version ?? "",
    title: patch?.title ?? "PatchMe",
    shareText: patch
      ? `La mia patch ${patch.version}: ${patch.title}\n\nCrea la tua su PatchMe: ${appUrl}`
      : `Crea la tua patch su PatchMe: ${appUrl}`,
  });

  useEffect(() => setPersisted(loadProgressionState()), []);

  if (!ready) return <div className="min-h-screen bg-background" />;
  if (!patch) return <Navigate to="/" />;
  const shareable = isPatchShareable(patch);

  const chooseTemplate = (template: ShareTemplate) => {
    setTemplateDraft(template);
    if (
      !saveSettings({ ...settings, shareTemplate: template, shareOrientation: selectedOrientation })
    ) {
      toast.error("Non è stato possibile ricordare il template");
    }
  };

  const chooseOrientation = (orientation: ShareOrientation) => {
    setOrientationDraft(orientation);
    if (
      !saveSettings({ ...settings, shareTemplate: selectedTemplate, shareOrientation: orientation })
    ) {
      toast.error("Non è stato possibile ricordare il formato");
    }
  };

  return (
    <div className="min-h-screen bg-background pb-40">
      <AppHeader title={patch.title} subtitle={`${patch.version}`} backTo="/" />
      <main className="mx-auto max-w-md px-4 py-5">
        <PatchPreviewCard
          patch={patch}
          displayName={settings.displayName}
          template={selectedTemplate}
          orientation={selectedOrientation}
          profile={sharedProfile}
        />
      </main>

      {shareable ? (
        <div
          aria-hidden="true"
          className="pointer-events-none fixed left-[-10000px] top-0"
          style={{ width: EXPORT_SIZES[selectedOrientation].width }}
        >
          <PatchPreviewCard
            ref={nodeRef}
            patch={patch}
            displayName={settings.displayName}
            template={selectedTemplate}
            orientation={selectedOrientation}
            profile={sharedProfile}
            sharing
            exporting
          />
        </div>
      ) : null}

      <div className="fixed inset-x-0 bottom-0 border-t border-border bg-background/95 px-4 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-3 backdrop-blur">
        <div className="mx-auto flex max-w-md flex-col gap-2">
          {shareable ? (
            <Button
              className="tap-safe h-12 bg-brand font-semibold text-brand-foreground hover:bg-brand/90"
              onClick={() => setShareOpen(true)}
            >
              <Palette className="mr-2 size-4" />{" "}
              {hardcoreCopy(
                settings.hardcoreMode,
                "Personalizza e condividi",
                "Truccala e spargi il danno",
              )}
            </Button>
          ) : (
            <Button
              className="tap-safe h-12 bg-brand font-semibold text-brand-foreground hover:bg-brand/90"
              onClick={() => navigate({ to: "/patch/$id/edit", params: { id: patch.id } })}
            >
              <LockKeyhole className="mr-2 size-4" />{" "}
              {hardcoreCopy(
                settings.hardcoreMode,
                "Pubblica per condividere",
                "Pubblicala prima, genio",
              )}
            </Button>
          )}
          <div className="flex gap-2">
            <Button
              variant="outline"
              className="tap-safe h-11 flex-1 text-muted-foreground hover:text-destructive"
              onClick={() => setConfirm(true)}
            >
              <Trash2 className="mr-1 size-4" />{" "}
              {hardcoreCopy(settings.hardcoreMode, "Elimina", "Buttala")}
            </Button>
            <Button
              className="tap-safe h-11 flex-1 bg-brand font-semibold text-brand-foreground hover:bg-brand/90"
              onClick={() => navigate({ to: "/patch/$id/edit", params: { id: patch.id } })}
            >
              <Pencil className="mr-1 size-4" />{" "}
              {hardcoreCopy(settings.hardcoreMode, "Modifica", "Rattoppa")}
            </Button>
          </div>
        </div>
      </div>

      <Dialog open={shareable && shareOpen} onOpenChange={setShareOpen}>
        <DialogContent className="social-studio-dialog flex max-h-[calc(100dvh-1rem)] max-w-lg flex-col gap-0 overflow-hidden rounded-3xl p-0 sm:max-h-[92dvh]">
          <DialogHeader>
            <div className="border-b border-border bg-surface-2 px-5 pb-4 pt-5 pr-12">
              <p className="display text-xs font-black uppercase tracking-[0.22em] text-brand">
                Studio social
              </p>
              <DialogTitle className="mt-1 text-2xl">
                {hardcoreCopy(
                  settings.hardcoreMode,
                  "Prepara la patch da condividere",
                  "Trucca 'sto disastro e spargilo in giro",
                )}
              </DialogTitle>
              <p className="mt-1 text-sm text-muted-foreground">
                Stile, formato e profilo vengono esportati esattamente come li vedi.
              </p>
            </div>
          </DialogHeader>

          <div className="min-h-0 flex-1 space-y-5 overflow-y-auto overscroll-contain px-4 py-4 sm:px-5">
            <section aria-labelledby="share-style-title">
              <p
                id="share-style-title"
                className="mb-2 text-xs font-black uppercase tracking-wider text-muted-foreground"
              >
                1 · Stile
              </p>
              <div className="grid grid-cols-2 gap-2" role="group" aria-label="Template grafico">
                {SHARE_TEMPLATES.map((template) => {
                  const selected = selectedTemplate === template.id;
                  return (
                    <button
                      key={template.id}
                      type="button"
                      aria-pressed={selected}
                      onClick={() => chooseTemplate(template.id)}
                      className={`tap-safe relative rounded-xl border p-3 text-left ${
                        selected ? "border-brand bg-brand/10" : "border-border bg-surface-2"
                      }`}
                    >
                      <span className={`mb-3 block h-2 w-10 rounded-full ${template.swatch}`} />
                      <span className="block text-sm font-semibold text-foreground">
                        {template.name}
                      </span>
                      <span className="mt-0.5 block text-xs text-muted-foreground">
                        {template.description}
                      </span>
                      {selected ? (
                        <Check
                          className="absolute right-3 top-3 size-4 text-brand"
                          aria-hidden="true"
                        />
                      ) : null}
                    </button>
                  );
                })}
              </div>
            </section>

            <section aria-labelledby="share-format-title">
              <p
                id="share-format-title"
                className="mb-2 text-xs font-black uppercase tracking-wider text-muted-foreground"
              >
                2 · Formato social
              </p>
              <div className="grid grid-cols-2 gap-2" role="group" aria-label="Formato immagine">
                {(["vertical", "story", "square", "horizontal"] as const).map((orientation) => {
                  const selected = selectedOrientation === orientation;
                  const size = EXPORT_SIZES[orientation];
                  const FormatIcon =
                    orientation === "story"
                      ? Smartphone
                      : orientation === "horizontal"
                        ? RectangleHorizontal
                        : Square;
                  return (
                    <button
                      key={orientation}
                      type="button"
                      aria-pressed={selected}
                      onClick={() => chooseOrientation(orientation)}
                      className={`tap-safe relative rounded-xl border p-3 text-left transition-all ${selected ? "border-brand bg-brand/10 shadow-[0_0_0_1px_var(--brand)]" : "border-border bg-surface-2 hover:border-brand/50"}`}
                    >
                      <FormatIcon
                        className={`mb-2 size-5 ${selected ? "text-brand" : "text-muted-foreground"}`}
                        aria-hidden="true"
                      />
                      <span className="block text-sm font-semibold text-foreground">
                        {size.label}
                      </span>
                      <span className="mt-0.5 block text-xs text-muted-foreground">
                        {size.output}
                      </span>
                      <span className="mt-1 block text-[0.68rem] leading-tight text-muted-foreground">
                        {size.hint}
                      </span>
                      {selected ? (
                        <Check
                          className="absolute right-3 top-3 size-4 text-brand"
                          aria-hidden="true"
                        />
                      ) : null}
                    </button>
                  );
                })}
              </div>
            </section>

            <section aria-labelledby="share-preview-title">
              <p
                id="share-preview-title"
                className="mb-2 text-xs font-black uppercase tracking-wider text-muted-foreground"
              >
                3 · Anteprima
              </p>
              <div className="social-preview-stage rounded-2xl border border-border bg-black/20 p-3 sm:p-4">
                <PatchPreviewCard
                  patch={patch}
                  displayName={settings.displayName}
                  template={selectedTemplate}
                  orientation={selectedOrientation}
                  profile={sharedProfile}
                  sharing
                />
              </div>
              <p className="mt-2 text-center text-xs text-muted-foreground">
                Avatar, livello, titolo, serie e cosmetici sono inclusi nell’immagine.
              </p>
            </section>
          </div>

          <div className="grid shrink-0 grid-cols-3 gap-2 border-t border-border bg-background px-4 py-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] sm:px-5">
            <Button
              variant="outline"
              disabled={busy !== null}
              aria-busy={busy === "copy"}
              onClick={() => void copyCaption()}
              className="min-w-0 px-2"
            >
              {busy === "copy" ? (
                <Loader2 className="mr-1 size-4 animate-spin" />
              ) : (
                <Copy className="mr-1 size-4" />
              )}
              <span className="truncate">Testo</span>
            </Button>
            <Button
              variant="secondary"
              disabled={busy !== null}
              aria-busy={busy === "save"}
              onClick={() => void saveImage()}
            >
              {busy === "save" ? (
                <Loader2 className="mr-1 size-4 animate-spin" />
              ) : (
                <Download className="mr-1 size-4" />
              )}
              <span className="truncate">Salva</span>
            </Button>
            <Button
              disabled={busy !== null}
              aria-busy={busy === "share"}
              className="bg-brand text-brand-foreground hover:bg-brand/90"
              onClick={() => {
                void shareImage().then((completed) => {
                  if (!completed) return;
                  setShareOpen(false);
                  navigate({ to: "/" });
                });
              }}
            >
              {busy === "share" ? (
                <Loader2 className="mr-1 size-4 animate-spin" />
              ) : (
                <Share2 className="mr-1 size-4" />
              )}
              <span className="truncate">Condividi</span>
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <AlertDialog open={confirm} onOpenChange={setConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Eliminare “{patch.title}”?</AlertDialogTitle>
            <AlertDialogDescription>{TEXTS.deleteConfirm}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annulla</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (!deletePatch(patch.id)) {
                  toast.error("Impossibile eliminare: memoria del dispositivo non disponibile");
                  return;
                }
                enqueueSuccessNotification("Patch eliminata");
                navigate({ to: "/" });
              }}
            >
              Elimina
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
