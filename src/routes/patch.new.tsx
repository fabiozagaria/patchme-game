import { createFileRoute, Navigate } from "@tanstack/react-router";
import { useMemo } from "react";
import { createId, createSection, type Patch } from "@/lib/patch-model";
import { suggestVersion } from "@/lib/versioning";
import { useAppStore } from "@/state/app-store";
import { PatchEditor } from "@/components/PatchEditor";

export const Route = createFileRoute("/patch/new")({
  head: () => ({
    meta: [
      { title: "Nuova patch — PatchMe" },
      { name: "description", content: "Crea una nuova patch note personale con sezioni ed elementi." },
      { property: "og:title", content: "Nuova patch — PatchMe" },
      { property: "og:description", content: "Crea una nuova patch note personale." },
    ],
  }),
  component: NewPatchPage,
});

function NewPatchPage() {
  const { ready, settings, patches } = useAppStore();

  const draft = useMemo<Patch>(() => {
    const now = new Date().toISOString();
    return {
      id: createId(),
      title: "",
      version: suggestVersion(settings.versionFormat, patches),
      date: now,
      status: "draft",
      sections: [createSection("news", "Novità")],
      createdAt: now,
      updatedAt: now,
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ready]);

  if (!ready) return <div className="min-h-screen bg-background" />;
  if (!settings.onboarded) return <Navigate to="/" />;

  return <PatchEditor initialPatch={draft} isNew />;
}
