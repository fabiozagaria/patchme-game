import { createFileRoute, Navigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { createId, createSection, type Patch } from "@/lib/patch-model";
import { suggestVersion } from "@/lib/versioning";
import { useAppStore } from "@/state/app-store";
import { PatchEditor } from "@/components/PatchEditor";
import type { GuidedAnswer } from "@/components/GuidedPatchWizard";

export const Route = createFileRoute("/patch/new")({
  head: () => ({
    meta: [
      { title: "Nuova patch — PatchMe" },
      {
        name: "description",
        content: "Crea una nuova patch note personale con sezioni ed elementi.",
      },
      { property: "og:title", content: "Nuova patch — PatchMe" },
      { property: "og:description", content: "Crea una nuova patch note personale." },
    ],
  }),
  component: NewPatchPage,
});

function NewPatchPage() {
  const { ready, settings, patches } = useAppStore();
  const [guidedAnswers, setGuidedAnswers] = useState<GuidedAnswer[] | null>(null);

  useEffect(() => {
    try {
      setGuidedAnswers(
        JSON.parse(
          window.sessionStorage.getItem("patchme.guided.answers") ?? "[]",
        ) as GuidedAnswer[],
      );
    } catch {
      setGuidedAnswers([]);
    } finally {
      window.sessionStorage.removeItem("patchme.guided.answers");
    }
  }, []);

  const draft = useMemo<Patch>(() => {
    const now = new Date().toISOString();
    const guidedSections = (guidedAnswers ?? []).map((answer) => ({
      ...createSection(answer.category, answer.title),
      items: [{ id: createId(), text: answer.text }],
    }));
    return {
      id: createId(),
      title: "",
      version: suggestVersion(settings.versionFormat, patches),
      date: now,
      status: "draft",
      sections: guidedSections.length ? guidedSections : [createSection("news", "Novità")],
      createdAt: now,
      updatedAt: now,
    };
  }, [guidedAnswers, patches, settings.versionFormat]);

  if (!ready || guidedAnswers === null) return <div className="min-h-screen bg-background" />;
  if (!settings.onboarded) return <Navigate to="/" />;

  return <PatchEditor initialPatch={draft} isNew />;
}
