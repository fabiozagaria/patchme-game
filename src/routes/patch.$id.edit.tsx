import { createFileRoute, Navigate } from "@tanstack/react-router";
import { useAppStore } from "@/state/app-store";
import { PatchEditor } from "@/components/PatchEditor";

export const Route = createFileRoute("/patch/$id/edit")({
  head: () => ({
    meta: [
      { title: "Modifica patch — PatchMe" },
      { name: "description", content: "Modifica sezioni, elementi e stato della tua patch note." },
      { property: "og:title", content: "Modifica patch — PatchMe" },
      { property: "og:description", content: "Modifica la tua patch note personale." },
    ],
  }),
  component: EditPatchPage,
});

function EditPatchPage() {
  const { id } = Route.useParams();
  const { ready, patches, settings } = useAppStore();

  if (!ready) return <div className="min-h-screen bg-background" />;
  if (!settings.onboarded) return <Navigate to="/" />;

  const patch = patches.find((p) => p.id === id);
  if (!patch) return <Navigate to="/" />;

  return <PatchEditor initialPatch={patch} isNew={false} />;
}
