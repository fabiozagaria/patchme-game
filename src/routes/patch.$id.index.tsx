import { createFileRoute, Navigate, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import {
  Check,
  Download,
  Loader2,
  LockKeyhole,
  Palette,
  Pencil,
  Share2,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";
import { enqueueSuccessNotification } from "@/lib/notification-queue";
import { TEXTS } from "@/config/app-config";
import { useAppStore } from "@/state/app-store";
import { useCardExport } from "@/hooks/use-card-export";
import { EXPORT_WIDTH } from "@/lib/share-image";
import type { ShareTemplate } from "@/lib/patch-model";
import { isPatchShareable, parseShareRequest } from "@/lib/patch-sharing";
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
  const patch = patches.find((p) => p.id === id);
  const selectedTemplate = templateDraft ?? settings.shareTemplate;
  const appUrl = typeof window !== "undefined" ? window.location.origin : "";
  const { nodeRef, busy, saveImage, shareImage } = useCardExport({
    version: patch?.version ?? "",
    title: patch?.title ?? "PatchMe",
    shareText: patch
      ? `La mia patch ${patch.version}: ${patch.title}\n\nCrea la tua su PatchMe: ${appUrl}`
      : `Crea la tua patch su PatchMe: ${appUrl}`,
  });

  if (!ready) return <div className="min-h-screen bg-background" />;
  if (!patch) return <Navigate to="/" />;
  const shareable = isPatchShareable(patch);

  const chooseTemplate = (template: ShareTemplate) => {
    setTemplateDraft(template);
    if (!saveSettings({ ...settings, shareTemplate: template })) {
      toast.error("Non è stato possibile ricordare il template");
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
        />
      </main>

      {shareable ? (
        <div
          aria-hidden="true"
          className="pointer-events-none fixed left-[-10000px] top-0"
          style={{ width: EXPORT_WIDTH }}
        >
          <PatchPreviewCard
            ref={nodeRef}
            patch={patch}
            displayName={settings.displayName}
            template={selectedTemplate}
            sharing
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
              <Palette className="mr-2 size-4" /> Personalizza e condividi
            </Button>
          ) : (
            <Button
              className="tap-safe h-12 bg-brand font-semibold text-brand-foreground hover:bg-brand/90"
              onClick={() => navigate({ to: "/patch/$id/edit", params: { id: patch.id } })}
            >
              <LockKeyhole className="mr-2 size-4" /> Pubblica per condividere
            </Button>
          )}
          <div className="flex gap-2">
            <Button
              variant="outline"
              className="tap-safe h-11 flex-1 text-muted-foreground hover:text-destructive"
              onClick={() => setConfirm(true)}
            >
              <Trash2 className="mr-1 size-4" /> Elimina
            </Button>
            <Button
              className="tap-safe h-11 flex-1 bg-brand font-semibold text-brand-foreground hover:bg-brand/90"
              onClick={() => navigate({ to: "/patch/$id/edit", params: { id: patch.id } })}
            >
              <Pencil className="mr-1 size-4" /> Modifica
            </Button>
          </div>
        </div>
      </div>

      <Dialog open={shareable && shareOpen} onOpenChange={setShareOpen}>
        <DialogContent className="max-h-[90vh] max-w-md overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Scegli lo stile della patch</DialogTitle>
          </DialogHeader>

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

          <div>
            <p className="mb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Anteprima
            </p>
            <PatchPreviewCard
              patch={patch}
              displayName={settings.displayName}
              template={selectedTemplate}
              sharing
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
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
              Salva
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
              Condividi
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
