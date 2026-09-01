import { createFileRoute, Navigate, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { TEXTS } from "@/config/app-config";
import { useAppStore } from "@/state/app-store";
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

export const Route = createFileRoute("/patch/$id/")({
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

function PatchDetailPage() {
  const { id } = Route.useParams();
  const navigate = useNavigate();
  const { ready, patches, settings, deletePatch } = useAppStore();
  const [confirm, setConfirm] = useState(false);

  if (!ready) return <div className="min-h-screen bg-background" />;

  const patch = patches.find((p) => p.id === id);
  if (!patch) return <Navigate to="/" />;

  return (
    <div className="min-h-screen bg-background pb-28">
      <AppHeader title={patch.title} subtitle={`${patch.version}`} backTo="/" />
      <main className="mx-auto max-w-md px-4 py-5">
        <PatchPreviewCard patch={patch} displayName={settings.displayName} />
      </main>

      <div className="fixed inset-x-0 bottom-0 border-t border-border bg-background/95 px-4 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-3 backdrop-blur">
        <div className="mx-auto flex max-w-md gap-2">
          <Button
            variant="outline"
            className="tap-safe flex-1 text-muted-foreground hover:text-destructive"
            onClick={() => setConfirm(true)}
          >
            <Trash2 className="mr-1 size-4" /> Elimina
          </Button>
          <Button
            className="tap-safe flex-1 bg-brand font-semibold text-brand-foreground hover:bg-brand/90"
            onClick={() => navigate({ to: "/patch/$id/edit", params: { id: patch.id } })}
          >
            <Pencil className="mr-1 size-4" /> Modifica
          </Button>
        </div>
      </div>

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
                deletePatch(patch.id);
                toast.success("Patch eliminata");
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
